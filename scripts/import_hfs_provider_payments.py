"""Import Illinois HFS Transparency Law provider-level payment data.

The HFS provider-level file changes column labels across years. This importer
normalizes common CSV exports into dashboard-ready money-flow records.
"""

from __future__ import annotations

import argparse
import csv
import json
from datetime import date
from pathlib import Path
from typing import Any


SOURCE_NAME = "Illinois HFS Transparency Law Provider-Level Data"
SOURCE_URL = "https://hfs.illinois.gov/info/factsfigures/transparency.html"


FIELD_ALIASES = {
    "providerName": ["provider name", "provider", "vendor name", "name", "payee name"],
    "providerId": ["provider id", "provider number", "vendor id", "npi", "provider npi"],
    "county": ["county", "provider county", "vendor county"],
    "providerType": ["provider type", "provider category", "provider class", "category", "provider specialty"],
    "patientsServed": ["patients served", "recipient count", "recipients", "number of patients", "client count"],
    "totalPaid": ["total paid", "total payments", "total amount paid", "amount paid", "payments", "total received", "total hfs paid"],
    "averageCost": ["average cost", "avg cost", "average payment", "avg payment"],
    "adjustments": ["adjustments", "adjustment", "adjusted amount"],
    "claimCount": ["claim count", "claims", "number of claims"],
    "serviceYear": ["service year", "calendar year", "year", "experience year"],
}


def normalize_key(value: str) -> str:
    return " ".join(str(value or "").strip().lower().replace("_", " ").split())


def find_value(row: dict[str, Any], aliases: list[str]) -> Any:
    normalized = {normalize_key(key): value for key, value in row.items()}
    for alias in aliases:
        if alias in normalized:
            return normalized[alias]
    return None


def number_or_none(value: Any) -> float | None:
    if value in (None, ""):
        return None
    text = str(value).replace("$", "").replace(",", "").replace("(", "-").replace(")", "").strip()
    if not text or text.lower() in {"n/a", "na", "null", "suppressed"}:
        return None
    try:
        return round(float(text), 2)
    except ValueError:
        return None


def int_or_none(value: Any) -> int | None:
    numeric = number_or_none(value)
    return int(numeric) if numeric is not None else None


def text_or_empty(value: Any) -> str:
    return str(value or "").strip()


def normalize_record(row: dict[str, Any], default_year: int | None) -> dict[str, Any]:
    service_year = int_or_none(find_value(row, FIELD_ALIASES["serviceYear"])) or default_year
    total_paid = number_or_none(find_value(row, FIELD_ALIASES["totalPaid"]))
    patients_served = int_or_none(find_value(row, FIELD_ALIASES["patientsServed"]))

    return {
        "providerName": text_or_empty(find_value(row, FIELD_ALIASES["providerName"])) or "Unknown provider",
        "providerId": text_or_empty(find_value(row, FIELD_ALIASES["providerId"])) or None,
        "county": text_or_empty(find_value(row, FIELD_ALIASES["county"])) or "Unknown",
        "providerType": text_or_empty(find_value(row, FIELD_ALIASES["providerType"])) or "Unknown provider type",
        "serviceYear": service_year,
        "patientsServed": patients_served,
        "claimCount": int_or_none(find_value(row, FIELD_ALIASES["claimCount"])),
        "totalPaid": total_paid,
        "averageCost": number_or_none(find_value(row, FIELD_ALIASES["averageCost"])),
        "adjustments": number_or_none(find_value(row, FIELD_ALIASES["adjustments"])),
        "paymentPerPatient": round(total_paid / patients_served, 2) if total_paid is not None and patients_served else None,
        "evidenceType": "reported_payment",
        "source": SOURCE_NAME,
        "sourceUrl": SOURCE_URL,
        "limitations": "Provider-level aggregate payment data does not include patient-level acuity, full claim detail, managed care contract terms, denials, or medical necessity context.",
    }


def load_csv(path: Path) -> list[dict[str, Any]]:
    with path.open(newline="", encoding="utf-8-sig") as file:
        return list(csv.DictReader(file))


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input", type=Path, help="HFS provider-level payment CSV export.")
    parser.add_argument("output", type=Path, help="Output JSON path.")
    parser.add_argument("--year", type=int, default=None, help="Default service year when the input file does not include one.")
    args = parser.parse_args()

    rows = load_csv(args.input)
    records = [normalize_record(row, args.year) for row in rows]
    records = [record for record in records if record["totalPaid"] is not None or record["patientsServed"] is not None]

    payload = {
        "description": "Illinois HFS provider-level Medicaid payment data. This layer tracks aggregate public payment flow by provider, county, provider type, and reporting year.",
        "lastUpdated": date.today().isoformat(),
        "source": SOURCE_NAME,
        "sourceUrl": SOURCE_URL,
        "records": records,
    }
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {len(records)} provider payment records to {args.output}")


if __name__ == "__main__":
    main()
