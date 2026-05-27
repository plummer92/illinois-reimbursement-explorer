"""Import CMS nursing home penalties and health deficiencies for Illinois."""

from __future__ import annotations

import argparse
import csv
import json
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path
from tempfile import NamedTemporaryFile


DATASETS = {
    "penalties": "g6vv-u9sr",
    "deficiencies": "r5ix-sfxw",
}

METASTORE_URL = "https://data.cms.gov/provider-data/api/1/metastore/schemas/dataset/items/{dataset_id}"


def number_or_none(value: object) -> float | None:
    if value in (None, ""):
        return None
    text = str(value).replace(",", "").replace("$", "").strip()
    try:
        return float(text)
    except ValueError:
        return None


def int_or_none(value: object) -> int | None:
    numeric = number_or_none(value)
    return int(numeric) if numeric is not None else None


def fetch_json(url: str) -> dict[str, object]:
    request = urllib.request.Request(url, headers={"User-Agent": "IllinoisReimbursementExplorer/0.1"})
    with urllib.request.urlopen(request, timeout=60) as response:
        return json.loads(response.read().decode("utf-8"))


def get_download_url(dataset_id: str) -> tuple[str, dict[str, object]]:
    metadata = fetch_json(METASTORE_URL.format(dataset_id=dataset_id))
    distributions = metadata.get("distribution") or []
    if not distributions:
        raise RuntimeError(f"No distribution found for CMS dataset {dataset_id}")
    return str(distributions[0]["downloadURL"]), metadata


def download_csv(url: str, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    request = urllib.request.Request(url, headers={"User-Agent": "IllinoisReimbursementExplorer/0.1"})
    with urllib.request.urlopen(request, timeout=180) as response, NamedTemporaryFile("wb", delete=False, dir=destination.parent) as temp:
        while True:
            chunk = response.read(1024 * 1024)
            if not chunk:
                break
            temp.write(chunk)
        temp_path = Path(temp.name)
    temp_path.replace(destination)


def penalty_record(row: dict[str, str], source_url: str, metadata: dict[str, object]) -> dict[str, object]:
    return {
        "cmsCertificationNumber": row.get("cms_certification_number_ccn") or row.get("CMS Certification Number (CCN)", ""),
        "providerName": row.get("provider_name") or row.get("Provider Name", ""),
        "providerAddress": row.get("provider_address") or row.get("Provider Address", ""),
        "city": row.get("citytown") or row.get("City/Town", ""),
        "state": row.get("state") or row.get("State", ""),
        "zipCode": row.get("zip_code") or row.get("ZIP Code", ""),
        "penaltyDate": row.get("penalty_date") or row.get("Penalty Date", ""),
        "penaltyType": row.get("penalty_type") or row.get("Penalty Type", ""),
        "fineAmount": number_or_none(row.get("fine_amount") or row.get("Fine Amount")),
        "paymentDenialStartDate": row.get("payment_denial_start_date") or row.get("Payment Denial Start Date", ""),
        "paymentDenialLengthDays": int_or_none(row.get("payment_denial_length_in_days") or row.get("Payment Denial Length in Days")),
        "location": row.get("location") or row.get("Location", ""),
        "processingDate": row.get("processing_date") or row.get("Processing Date", ""),
        "source": metadata.get("title", "CMS Nursing Home Penalties"),
        "sourceUrl": source_url,
        "datasetModified": metadata.get("modified", ""),
        "datasetReleased": metadata.get("released", ""),
    }


def deficiency_record(row: dict[str, str], source_url: str, metadata: dict[str, object]) -> dict[str, object]:
    return {
        "cmsCertificationNumber": row.get("cms_certification_number_ccn") or row.get("CMS Certification Number (CCN)", ""),
        "providerName": row.get("provider_name") or row.get("Provider Name", ""),
        "providerAddress": row.get("provider_address") or row.get("Provider Address", ""),
        "city": row.get("citytown") or row.get("City/Town", ""),
        "state": row.get("state") or row.get("State", ""),
        "zipCode": row.get("zip_code") or row.get("ZIP Code", ""),
        "surveyDate": row.get("survey_date") or row.get("Survey Date", ""),
        "surveyType": row.get("survey_type") or row.get("Survey Type", ""),
        "deficiencyPrefix": row.get("deficiency_prefix") or row.get("Deficiency Prefix", ""),
        "deficiencyCategory": row.get("deficiency_category") or row.get("Deficiency Category", ""),
        "deficiencyTagNumber": row.get("deficiency_tag_number") or row.get("Deficiency Tag Number", ""),
        "deficiencyDescription": row.get("deficiency_description") or row.get("Deficiency Description", ""),
        "scopeSeverityCode": row.get("scope_severity_code") or row.get("Scope Severity Code", ""),
        "deficiencyCorrected": row.get("deficiency_corrected") or row.get("Deficiency Corrected", ""),
        "correctionDate": row.get("correction_date") or row.get("Correction Date", ""),
        "inspectionCycle": row.get("inspection_cycle") or row.get("Inspection Cycle", ""),
        "standardDeficiency": row.get("standard_deficiency") or row.get("Standard Deficiency", ""),
        "complaintDeficiency": row.get("complaint_deficiency") or row.get("Complaint Deficiency", ""),
        "infectionControlInspectionDeficiency": row.get("infection_control_inspection_deficiency") or row.get("Infection Control Inspection Deficiency", ""),
        "citationUnderIdr": row.get("citation_under_idr") or row.get("Citation Under IDR", ""),
        "citationUnderIidr": row.get("citation_under_iidr") or row.get("Citation Under IIDR", ""),
        "location": row.get("location") or row.get("Location", ""),
        "processingDate": row.get("processing_date") or row.get("Processing Date", ""),
        "source": metadata.get("title", "CMS Nursing Home Health Deficiencies"),
        "sourceUrl": source_url,
        "datasetModified": metadata.get("modified", ""),
        "datasetReleased": metadata.get("released", ""),
    }


def load_illinois_rows(path: Path, normalize, source_url: str, metadata: dict[str, object]) -> list[dict[str, object]]:
    rows: list[dict[str, object]] = []
    with path.open(newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        for row in reader:
            state = row.get("state") or row.get("State")
            if state == "IL":
                rows.append(normalize(row, source_url, metadata))
    return rows


def summarize_by_facility(
    penalties: list[dict[str, object]],
    deficiencies: list[dict[str, object]],
) -> list[dict[str, object]]:
    groups: dict[str, dict[str, object]] = {}
    for row in penalties:
        ccn = str(row.get("cmsCertificationNumber") or "")
        group = groups.setdefault(ccn, {
            "cmsCertificationNumber": ccn,
            "providerName": row.get("providerName", ""),
            "city": row.get("city", ""),
            "state": row.get("state", ""),
            "penaltyCount": 0,
            "fineCount": 0,
            "fineAmount": 0.0,
            "paymentDenialCount": 0,
            "paymentDenialDays": 0,
            "deficiencyCount": 0,
            "standardDeficiencyCount": 0,
            "complaintDeficiencyCount": 0,
            "infectionDeficiencyCount": 0,
            "topDeficiencyCategories": [],
            "latestPenaltyDate": "",
            "latestSurveyDate": "",
        })
        group["penaltyCount"] = int(group["penaltyCount"]) + 1
        if str(row.get("penaltyType", "")).lower() == "fine":
            group["fineCount"] = int(group["fineCount"]) + 1
            group["fineAmount"] = float(group["fineAmount"]) + float(row.get("fineAmount") or 0)
        if "denial" in str(row.get("penaltyType", "")).lower():
            group["paymentDenialCount"] = int(group["paymentDenialCount"]) + 1
            group["paymentDenialDays"] = int(group["paymentDenialDays"]) + int(row.get("paymentDenialLengthDays") or 0)
        if str(row.get("penaltyDate", "")) > str(group["latestPenaltyDate"]):
            group["latestPenaltyDate"] = row.get("penaltyDate", "")

    deficiencies_by_ccn: dict[str, list[dict[str, object]]] = defaultdict(list)
    for row in deficiencies:
        ccn = str(row.get("cmsCertificationNumber") or "")
        deficiencies_by_ccn[ccn].append(row)
        group = groups.setdefault(ccn, {
            "cmsCertificationNumber": ccn,
            "providerName": row.get("providerName", ""),
            "city": row.get("city", ""),
            "state": row.get("state", ""),
            "penaltyCount": 0,
            "fineCount": 0,
            "fineAmount": 0.0,
            "paymentDenialCount": 0,
            "paymentDenialDays": 0,
            "deficiencyCount": 0,
            "standardDeficiencyCount": 0,
            "complaintDeficiencyCount": 0,
            "infectionDeficiencyCount": 0,
            "topDeficiencyCategories": [],
            "latestPenaltyDate": "",
            "latestSurveyDate": "",
        })
        group["deficiencyCount"] = int(group["deficiencyCount"]) + 1
        group["standardDeficiencyCount"] = int(group["standardDeficiencyCount"]) + (1 if row.get("standardDeficiency") == "Y" else 0)
        group["complaintDeficiencyCount"] = int(group["complaintDeficiencyCount"]) + (1 if row.get("complaintDeficiency") == "Y" else 0)
        group["infectionDeficiencyCount"] = int(group["infectionDeficiencyCount"]) + (1 if row.get("infectionControlInspectionDeficiency") == "Y" else 0)
        if str(row.get("surveyDate", "")) > str(group["latestSurveyDate"]):
            group["latestSurveyDate"] = row.get("surveyDate", "")

    for ccn, group in groups.items():
        categories = Counter(str(row.get("deficiencyCategory") or "Uncategorized") for row in deficiencies_by_ccn.get(ccn, []))
        group["topDeficiencyCategories"] = [
            {"category": category, "count": count}
            for category, count in categories.most_common(5)
        ]
        group["fineAmount"] = round(float(group["fineAmount"]), 2)

    return sorted(groups.values(), key=lambda item: (-float(item["fineAmount"]), -int(item["penaltyCount"]), str(item["providerName"])))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--raw-dir", type=Path, default=Path("data/raw"))
    parser.add_argument("--penalties-output", type=Path, default=Path("data/cms-nursing-home-penalties-illinois.json"))
    parser.add_argument("--deficiencies-output", type=Path, default=Path("data/cms-nursing-home-deficiencies-illinois.json"))
    parser.add_argument("--summary-output", type=Path, default=Path("data/cms-nursing-home-enforcement-summary.json"))
    parser.add_argument("--force-download", action="store_true")
    args = parser.parse_args()

    penalty_url, penalty_metadata = get_download_url(DATASETS["penalties"])
    deficiency_url, deficiency_metadata = get_download_url(DATASETS["deficiencies"])
    penalty_path = args.raw_dir / Path(penalty_url).name
    deficiency_path = args.raw_dir / Path(deficiency_url).name

    if args.force_download or not penalty_path.exists():
        print(f"Downloading {penalty_url}")
        download_csv(penalty_url, penalty_path)
    if args.force_download or not deficiency_path.exists():
        print(f"Downloading {deficiency_url}")
        download_csv(deficiency_url, deficiency_path)

    penalties = load_illinois_rows(penalty_path, penalty_record, penalty_url, penalty_metadata)
    deficiencies = load_illinois_rows(deficiency_path, deficiency_record, deficiency_url, deficiency_metadata)
    summary = summarize_by_facility(penalties, deficiencies)

    args.penalties_output.write_text(json.dumps(penalties, indent=2), encoding="utf-8")
    args.deficiencies_output.write_text(json.dumps(deficiencies, indent=2), encoding="utf-8")
    args.summary_output.write_text(json.dumps(summary, indent=2), encoding="utf-8")

    print(
        f"Wrote {len(penalties)} Illinois penalty events, "
        f"{len(deficiencies)} Illinois deficiency citations, and {len(summary)} facility summaries."
    )


if __name__ == "__main__":
    main()
