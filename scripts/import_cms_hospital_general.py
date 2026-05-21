"""Import CMS Hospital General Information and filter to Illinois hospitals."""

from __future__ import annotations

import argparse
import csv
import json
from pathlib import Path


CMS_HOSPITAL_SOURCE_URL = "https://data.cms.gov/provider-data/dataset/xubh-q36u"


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


def hospital_record(row: dict[str, str]) -> dict[str, object]:
    return {
        "facilityId": row.get("Facility ID", "").strip(),
        "facilityName": row.get("Facility Name", "").strip(),
        "address": row.get("Address", "").strip(),
        "city": row.get("City/Town", "").strip(),
        "state": row.get("State", "").strip(),
        "zipCode": row.get("ZIP Code", "").strip(),
        "county": row.get("County/Parish", "").strip(),
        "telephoneNumber": row.get("Telephone Number", "").strip(),
        "hospitalType": row.get("Hospital Type", "").strip(),
        "hospitalOwnership": row.get("Hospital Ownership", "").strip(),
        "emergencyServices": row.get("Emergency Services", "").strip(),
        "birthingFriendly": row.get("Meets criteria for birthing friendly designation", "").strip(),
        "overallRating": int_or_none(row.get("Hospital overall rating")),
        "mortalityMeasures": int_or_none(row.get("Count of Facility MORT Measures")),
        "mortalityBetter": int_or_none(row.get("Count of MORT Measures Better")),
        "mortalityWorse": int_or_none(row.get("Count of MORT Measures Worse")),
        "safetyMeasures": int_or_none(row.get("Count of Facility Safety Measures")),
        "safetyBetter": int_or_none(row.get("Count of Safety Measures Better")),
        "safetyWorse": int_or_none(row.get("Count of Safety Measures Worse")),
        "readmissionMeasures": int_or_none(row.get("Count of Facility READM Measures")),
        "readmissionBetter": int_or_none(row.get("Count of READM Measures Better")),
        "readmissionWorse": int_or_none(row.get("Count of READM Measures Worse")),
        "patientExperienceMeasures": int_or_none(row.get("Count of Facility Pt Exp Measures")),
        "timelyEffectiveCareMeasures": int_or_none(row.get("Count of Facility TE Measures")),
        "source": "CMS Hospital General Information",
        "sourceUrl": CMS_HOSPITAL_SOURCE_URL,
    }


def load_illinois_hospitals(path: Path) -> list[dict[str, object]]:
    with path.open(newline="", encoding="utf-8-sig") as file:
        reader = csv.DictReader(file)
        return [
            hospital_record(row)
            for row in reader
            if row.get("State") == "IL"
        ]


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("cms_hospital_csv", type=Path, help="CMS Hospital_General_Information CSV path.")
    parser.add_argument("output_json", type=Path, help="Output path for normalized Illinois hospital records.")
    args = parser.parse_args()

    records = load_illinois_hospitals(args.cms_hospital_csv)
    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(records, indent=2), encoding="utf-8")

    print(f"Wrote {len(records)} Illinois hospital records.")


if __name__ == "__main__":
    main()
