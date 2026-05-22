"""Extract structured payment fields from Illinois HFS hospital rate sheet PDFs."""

from __future__ import annotations

import argparse
import json
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path


try:
    from pypdf import PdfReader
except ImportError:  # pragma: no cover - compile-only environments may not have pypdf.
    PdfReader = None  # type: ignore[assignment]


FIELD_PATTERNS: dict[str, tuple[str, str]] = {
    "medicareId": (r"Medicare ID\s+(.+)", "text"),
    "providerName": (r"Provider Name\s+(.+)", "text"),
    "legacyMedicaidId": (r"Legacy Medicaid ID\s+(.+)", "text"),
    "medicaidOldId": (r"Medicaid OldID\s+(.+)", "text"),
    "parentOldId": (r"Parent OldID\s+(.+)", "text"),
    "smartActAdjustmentFactor": (r"SMART Act Adjustment Factor\s+(.+)", "number"),
    "traumaLevel": (r"Trauma Level\s+(.+)", "text"),
    "perinatalLevel": (r"Perinatal Level\s+(.+)", "text"),
    "medicareIppsAggregateCcr": (r"Medicare IPPS Aggregate CCR\s+(.+)", "number"),
    "rateEnhancementType": (r"Rate Enhancement Type\s+(.+)", "text"),
    "ipCos20AcuteStandardizedAmount": (r"IP COS 20 Acute Standardized Amount\s+(.+)", "money"),
    "ipCos20AcuteWageIndex": (r"IP COS 20 Acute Wage Index\s+(.+)", "number"),
    "ipCos20AcuteLaborPortion": (r"IP COS 20 Acute Labor Portion\s+(.+)", "number"),
    "ipCos20AcuteMedicalEducationAddOn": (r"IP COS 20 Acute Medical Education Add-on\s+(.+)", "number"),
    "ipCos20AcuteCrossoverAdjustment": (r"IP COS 20 Acute Crossover Adjustment\s+(.+)", "number"),
    "ipCos20AcuteOutlierFixedLossAmount": (r"IP COS 20 Acute Outlier Fixed-Loss Amount\s+(.+)", "money"),
    "ipCos20AcuteDrgRate": (r"IP COS 20 Acute DRG Rate\s+(.+)", "money"),
    "ipCos21PsychPerDiemRate": (r"IP COS 21 Psych Per Diem Rate\s+(.+)", "money"),
    "ipCos22RehabPerDiemRate": (r"IP COS 22 Rehab Per Diem Rate\s+(.+)", "money"),
    "opWageIndex": (r"OP Wage Index\s+(.+)", "number"),
    "opLaborPortion": (r"OP Labor Portion\s+(.+)", "number"),
    "eligibleHighCostDrugDeviceAddOn": (r"Eligible for High Cost Drug & Device Add-On Payments\s+(.+)", "text"),
    "opCos24AcuteHighVolumeAdjustment": (r"OP COS 24 Acute High Volume Adjustment\s+(.+)", "number"),
    "opCos24AcuteCrossoverAdjustment": (r"OP COS 24 Acute Crossover Adjustment\s+(.+)", "number"),
    "opCos24AcuteStandardizedAmount": (r"OP COS 24 Acute Standardized Amount\s+(.+)", "money"),
    "opCos24AcuteEapgConversionFactorBaseRate": (
        r"OP COS 24 Acute EAPG Conversion Factor \(Base Rate\)\s+(.+)",
        "money",
    ),
    "opCos272829PsychRehabHighVolumeAdjustment": (
        r"OP COS 27/28/29 Psych/Rehab High Volume Adjustment\s+(.+)",
        "number",
    ),
    "opCos2728PsychStandardizedAmount": (r"OP COS 27/28 Psych Standardized Amount\s+(.+)", "money"),
    "opCos2728PsychEapgConversionFactorBaseRate": (
        r"OP COS 27/28 Psych EAPG Conversion Factor \(Base Rate\)\s+(.+)",
        "money",
    ),
    "opCos29RehabStandardizedAmount": (r"OP COS 29 Rehab Standardized Amount\s+(.+)", "money"),
    "opCos29RehabEapgConversionFactorBaseRate": (
        r"OP COS 29 Rehab EAPG Conversion Factor \(Base Rate\)\s+(.+)",
        "money",
    ),
}


def parse_value(raw_value: str, value_type: str) -> str | float | None:
    value = raw_value.strip().replace("\u00a0", " ")
    value = re.sub(r"\s+", " ", value)
    value = value.removesuffix(".").strip() if value.upper() in {"N/A.", "NA."} else value
    if value.upper() in {"N/A", "NA", ""}:
        return None
    if value_type in {"money", "number"}:
        numeric = re.sub(r"[^0-9.\-]", "", value)
        return float(numeric) if numeric else None
    return value


def safe_file_name(record: dict[str, object]) -> str:
    provider_id = str(record.get("hfsProviderId") or "unknown")
    name = re.sub(r"[^A-Za-z0-9]+", "_", str(record.get("hospitalName") or "hospital")).strip("_").lower()
    return f"{provider_id}_{name}.pdf"


def download_pdf(url: str, path: Path) -> None:
    if path.exists() and path.stat().st_size > 0:
        return
    encoded_url = urllib.parse.quote(url, safe=":/?&=%")
    request = urllib.request.Request(encoded_url, headers={"User-Agent": "Mozilla/5.0"})
    with urllib.request.urlopen(request, timeout=45) as response:
        path.write_bytes(response.read())


def extract_pdf_text(path: Path) -> str:
    if PdfReader is None:
        raise RuntimeError("pypdf is required. Install it or use the bundled Codex Python runtime.")
    reader = PdfReader(str(path))
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def parse_payment_fields(text: str) -> dict[str, object]:
    fields: dict[str, object] = {}
    normalized_text = re.sub(r"[ \t]+", " ", text)
    for field, (pattern, value_type) in FIELD_PATTERNS.items():
        match = re.search(pattern, normalized_text, re.I)
        fields[field] = parse_value(match.group(1), value_type) if match else None
    return fields


def build_record(record: dict[str, object], fields: dict[str, object], text: str) -> dict[str, object]:
    populated = sum(1 for value in fields.values() if value is not None)
    return {
        **record,
        "paymentFields": fields,
        "parseStatus": "parsed" if populated else "no_fields_found",
        "parsedFieldCount": populated,
        "sourceDocumentType": "HFS hospital Medicaid MCO payment rate sheet PDF",
        "extractionNotes": (
            "Structured fields are extracted from public HFS PDF text. They are rate-sheet parameters "
            "and do not represent a full claim-specific payment calculation."
        ),
        "textPreview": re.sub(r"\s+", " ", text).strip()[:500],
    }


def extract_rate_values(
    index_records: list[dict[str, object]],
    cache_dir: Path,
    limit: int | None = None,
) -> tuple[list[dict[str, object]], dict[str, int]]:
    cache_dir.mkdir(parents=True, exist_ok=True)
    output: list[dict[str, object]] = []
    stats = {"input": len(index_records), "attempted": 0, "parsed": 0, "errors": 0}

    for record in index_records[:limit]:
        stats["attempted"] += 1
        pdf_path = cache_dir / safe_file_name(record)
        try:
            download_pdf(str(record.get("url") or ""), pdf_path)
            text = extract_pdf_text(pdf_path)
            fields = parse_payment_fields(text)
            parsed = build_record(record, fields, text)
            if parsed["parseStatus"] == "parsed":
                stats["parsed"] += 1
            output.append(parsed)
        except Exception as exc:  # noqa: BLE001 - preserve per-record errors for data QA.
            failed = {
                **record,
                "paymentFields": {},
                "parseStatus": "error",
                "parsedFieldCount": 0,
                "error": str(exc),
                "sourceDocumentType": "HFS hospital Medicaid MCO payment rate sheet PDF",
            }
            stats["errors"] += 1
            output.append(failed)

    return output, stats


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("rate_sheet_index_json", type=Path, help="Normalized HFS hospital rate sheet index JSON.")
    parser.add_argument("output_json", type=Path, help="Output path for extracted payment fields.")
    parser.add_argument(
        "--cache-dir",
        type=Path,
        default=Path("data/raw/hfs_hospital_rate_sheets"),
        help="Local PDF cache directory. The project gitignore excludes this cache.",
    )
    parser.add_argument("--limit", type=int, default=None, help="Optional record limit for parser testing.")
    args = parser.parse_args()

    index_records = json.loads(args.rate_sheet_index_json.read_text(encoding="utf-8"))
    extracted, stats = extract_rate_values(index_records, args.cache_dir, args.limit)
    args.output_json.parent.mkdir(parents=True, exist_ok=True)
    args.output_json.write_text(json.dumps(extracted, indent=2), encoding="utf-8")
    print(
        f"Wrote {len(extracted)} extracted hospital rate records "
        f"({stats['parsed']}/{stats['attempted']} parsed, {stats['errors']} errors)."
    )
    if stats["errors"]:
        sys.exit(1)


if __name__ == "__main__":
    main()
