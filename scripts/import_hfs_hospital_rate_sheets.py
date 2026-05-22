"""Import the Illinois HFS hospital rate sheet asset list and match it to CMS hospitals."""

from __future__ import annotations

import argparse
import json
import re
from difflib import SequenceMatcher
from pathlib import Path


HFS_HOSPITAL_RATE_SHEET_URL = (
    "https://hfs.illinois.gov/medicalproviders/medicaidreimbursement/hospital/hrs/"
    "hospitalratesheets01012026.html"
)
HFS_HOST = "https://hfs.illinois.gov"


def normalize_name(value: str) -> str:
    text = (value or "").upper()
    text = text.replace("&", " AND ")
    text = re.sub(
        r"\b(HOSPITAL|MEDICAL|CENTER|CENTRE|CTR|MEMORIAL|COMMUNITY|REGIONAL|HEALTH|"
        r"SYSTEM|THE|OF|INC|LLC|CORP|CORPORATION|ASSOCIATION|FOUNDATION)\b",
        " ",
        text,
    )
    text = re.sub(r"[^A-Z0-9 ]", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def parse_rate_sheet_item(item: dict[str, object]) -> dict[str, object]:
    title = str(item.get("title") or item.get("name") or "").strip()
    name = str(item.get("name") or title).strip()
    source_name = name or title
    match = re.match(
        r"^\s*(\d+)\s*-\s*(.*?)\s*-\s*Eff\.\s*([0-9]{1,2}\.[0-9]{1,2}\.[0-9]{4})",
        source_name,
        re.I,
    )
    provider_id = match.group(1) if match else ""
    hospital_name = match.group(2).strip() if match else source_name.replace(".pdf", "").strip()
    effective_date = normalize_effective_date(match.group(3)) if match else "2026-01-01"
    url = str(item.get("url") or "").strip()
    return {
        "hfsProviderId": provider_id,
        "hospitalName": re.sub(r"\s+", " ", hospital_name),
        "effectiveDate": effective_date,
        "title": title,
        "fileName": name,
        "url": f"{HFS_HOST}{url}" if url.startswith("/") else url,
        "publishedDate": str(item.get("date") or "").strip(),
        "source": "Illinois HFS Hospital Rate Sheets Effective January 1, 2026",
        "sourceUrl": HFS_HOSPITAL_RATE_SHEET_URL,
    }


def normalize_effective_date(value: str) -> str:
    value = re.sub(r"[^0-9.]", "", value or "").strip(".")
    parts = value.split(".")
    if len(parts) != 3:
        return value
    month, day, year = parts
    return f"{year}-{int(month):02d}-{int(day):02d}"


def load_rate_sheets(path: Path) -> list[dict[str, object]]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    items = payload.get("filterItems") or payload.get("items") or []
    return [parse_rate_sheet_item(item) for item in items if str(item.get("mimeType", "")).lower() == "pdf"]


def load_hospitals(path: Path) -> list[dict[str, object]]:
    return json.loads(path.read_text(encoding="utf-8"))


def match_rate_sheets(
    rate_sheets: list[dict[str, object]],
    hospitals: list[dict[str, object]],
) -> tuple[list[dict[str, object]], dict[str, int]]:
    cms_names = [
        (hospital, normalize_name(str(hospital.get("facilityName", ""))))
        for hospital in hospitals
    ]
    matched: list[dict[str, object]] = []
    stats = {"rateSheets": len(rate_sheets), "cmsHospitals": len(hospitals), "matched": 0}

    for sheet in rate_sheets:
        sheet_name = normalize_name(str(sheet.get("hospitalName", "")))
        best_hospital: dict[str, object] | None = None
        best_score = 0.0
        for hospital, cms_name in cms_names:
            score = SequenceMatcher(None, sheet_name, cms_name).ratio()
            if sheet_name and cms_name and (sheet_name in cms_name or cms_name in sheet_name):
                score = max(score, 0.92)
            if score > best_score:
                best_score = score
                best_hospital = hospital

        record = dict(sheet)
        if best_hospital and best_score >= 0.72:
            record["cmsFacilityId"] = best_hospital.get("facilityId")
            record["cmsFacilityName"] = best_hospital.get("facilityName")
            record["matchScore"] = round(best_score, 3)
            record["matchMethod"] = "name-fuzzy"
            stats["matched"] += 1
        else:
            record["cmsFacilityId"] = None
            record["cmsFacilityName"] = None
            record["matchScore"] = round(best_score, 3)
            record["matchMethod"] = "unmatched"
        matched.append(record)

    return matched, stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("hfs_rate_sheet_list_json", type=Path, help="HFS list.model.json asset payload.")
    parser.add_argument("cms_hospitals_json", type=Path, help="Normalized CMS Illinois hospital JSON.")
    parser.add_argument("output_json", type=Path, help="Output path for normalized HFS hospital rate sheet index.")
    args = parser.parse_args()

    rate_sheets = load_rate_sheets(args.hfs_rate_sheet_list_json)
    hospitals = load_hospitals(args.cms_hospitals_json)
    matched, stats = match_rate_sheets(rate_sheets, hospitals)

    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(matched, indent=2), encoding="utf-8")
    print(
        f"Wrote {len(matched)} HFS hospital rate sheet records "
        f"({stats['matched']}/{stats['rateSheets']} matched to CMS hospitals)."
    )


if __name__ == "__main__":
    main()
