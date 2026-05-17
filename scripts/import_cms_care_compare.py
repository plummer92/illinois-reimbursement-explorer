"""Import CMS Care Compare nursing home data and match it to Illinois HFS rates."""

from __future__ import annotations

import argparse
import csv
import json
import re
from difflib import SequenceMatcher
from pathlib import Path


CMS_SOURCE_URL = (
    "https://data.cms.gov/provider-data/dataset/4pq5-n9py"
)


def normalize_name(value: str) -> str:
    text = (value or "").upper()
    text = text.replace("&", " AND ")
    text = re.sub(r"\b(NURSING|NH|LTC|LLC|INC|CORP|CORPORATION|CENTER|CENTRE|CTR|CARE|HEALTHCARE|"
                  r"HEALTH|REHAB|REHABILITATION|FACILITY|HOME|THE|OF)\b", " ", text)
    text = re.sub(r"[^A-Z0-9 ]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def normalize_city(value: str) -> str:
    return re.sub(r"\s+", " ", (value or "").upper()).strip()


def number_or_none(value: object) -> float | None:
    if value in (None, ""):
        return None
    text = str(value).replace(",", "").strip()
    if text.lower() in {"not available", "nan"}:
        return None
    try:
        return float(text)
    except ValueError:
        return None


def int_or_none(value: object) -> int | None:
    numeric = number_or_none(value)
    return int(numeric) if numeric is not None else None


def quality_record(row: dict[str, str]) -> dict[str, object]:
    return {
        "cmsCertificationNumber": row.get("CMS Certification Number (CCN)", "").strip(),
        "facilityName": row.get("Provider Name", "").strip(),
        "city": row.get("City/Town", "").strip(),
        "county": row.get("County/Parish", "").strip(),
        "ownershipType": row.get("Ownership Type", "").strip(),
        "certifiedBeds": int_or_none(row.get("Number of Certified Beds")),
        "overallStarRating": int_or_none(row.get("Overall Rating")),
        "staffingStarRating": int_or_none(row.get("Staffing Rating")),
        "healthInspectionRating": int_or_none(row.get("Health Inspection Rating")),
        "qualityMeasureRating": int_or_none(row.get("QM Rating")),
        "rnStaffingHoursPerResidentDay": number_or_none(row.get("Reported RN Staffing Hours per Resident per Day")),
        "totalNurseStaffingHoursPerResidentDay": number_or_none(row.get("Reported Total Nurse Staffing Hours per Resident per Day")),
        "source": "CMS Care Compare Nursing Home Provider Information",
        "sourceUrl": CMS_SOURCE_URL,
        "processingDate": row.get("Processing Date", "").strip(),
    }


def load_cms_illinois(path: Path) -> list[dict[str, object]]:
    with path.open(newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        return [
            quality_record(row)
            for row in reader
            if row.get("State") == "IL"
        ]


def load_hfs_rates(path: Path) -> list[dict[str, object]]:
    return json.loads(path.read_text(encoding="utf-8"))


def build_city_index(cms_records: list[dict[str, object]]) -> dict[str, list[dict[str, object]]]:
    by_city: dict[str, list[dict[str, object]]] = {}
    for record in cms_records:
        by_city.setdefault(normalize_city(str(record.get("city", ""))), []).append(record)
    return by_city


def match_record(
    hfs_record: dict[str, object],
    city_index: dict[str, list[dict[str, object]]],
) -> tuple[dict[str, object] | None, float, str]:
    city = normalize_city(str(hfs_record.get("city", "")))
    hfs_name = normalize_name(str(hfs_record.get("facility", "")))
    candidates = city_index.get(city, [])
    if not candidates:
        return None, 0.0, "no-city-candidate"

    best_record: dict[str, object] | None = None
    best_score = 0.0
    for candidate in candidates:
        cms_name = normalize_name(str(candidate.get("facilityName", "")))
        score = SequenceMatcher(None, hfs_name, cms_name).ratio()
        if hfs_name and cms_name and (hfs_name in cms_name or cms_name in hfs_name):
            score = max(score, 0.92)
        if score > best_score:
            best_score = score
            best_record = candidate

    if best_score >= 0.92:
        method = "city-name-exact-or-contained"
    elif best_score >= 0.74:
        method = "city-name-fuzzy"
    else:
        return None, best_score, "below-threshold"

    return best_record, round(best_score, 3), method


def merge_records(
    hfs_records: list[dict[str, object]],
    cms_records: list[dict[str, object]],
) -> tuple[list[dict[str, object]], dict[str, int]]:
    city_index = build_city_index(cms_records)
    merged: list[dict[str, object]] = []
    stats = {"hfsRecords": len(hfs_records), "cmsIllinoisRecords": len(cms_records), "matched": 0}

    for hfs_record in hfs_records:
        cms_record, score, method = match_record(hfs_record, city_index)
        if not cms_record:
            continue

        merged_record = dict(hfs_record)
        merged_record["quality"] = cms_record
        merged_record["qualityMatch"] = {
            "method": method,
            "score": score,
            "hfsFacility": hfs_record.get("facility"),
            "cmsFacility": cms_record.get("facilityName"),
        }
        merged.append(merged_record)

    stats["matched"] = len(merged)
    return merged, stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("cms_provider_csv", type=Path, help="CMS NH_ProviderInfo CSV path.")
    parser.add_argument("hfs_rates_json", type=Path, help="HFS nursing facility rate JSON path.")
    parser.add_argument("cms_illinois_output", type=Path, help="Output path for normalized Illinois CMS records.")
    parser.add_argument("matched_output", type=Path, help="Output path for HFS records matched to CMS quality.")
    args = parser.parse_args()

    cms_records = load_cms_illinois(args.cms_provider_csv)
    hfs_records = load_hfs_rates(args.hfs_rates_json)
    merged, stats = merge_records(hfs_records, cms_records)

    args.cms_illinois_output.parent.mkdir(parents=True, exist_ok=True)
    args.cms_illinois_output.write_text(json.dumps(cms_records, indent=2), encoding="utf-8")
    args.matched_output.write_text(json.dumps(merged, indent=2), encoding="utf-8")

    print(
        f"Wrote {len(cms_records)} Illinois CMS records and {len(merged)} matched HFS/CMS records "
        f"({stats['matched']}/{stats['hfsRecords']} HFS records matched)."
    )


if __name__ == "__main__":
    main()
