"""Import HSHS audited/bond source registry entries and capacity facts.

This importer is intentionally curated. HSHS financial evidence is split across
official HSHS pages, ProPublica/IRS Form 990 records, Federal Audit
Clearinghouse audit PDFs mirrored by ProPublica, and EMMA/MSRB bond disclosure
search. The values here keep audited consolidated facts separate from Form 990,
facility HCRIS rows, and secondary news reporting.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


EXTRACTION_DATE = "2026-05-28"


HSHS_SOURCE_RECORDS: list[dict[str, Any]] = [
    {
        "systemId": "hshs",
        "systemName": "Hospital Sisters Health System",
        "sourceType": "audited_single_audit_pdf",
        "title": "HSHS FY2024 Consolidated Financial Statements and Single Audit",
        "url": "https://projects.propublica.org/nonprofits/download-audit?download=true&filename=2024-06-GSAFAC-0000345049",
        "publisher": "Federal Audit Clearinghouse / ProPublica Nonprofit Explorer",
        "latestPeriod": "Fiscal year ended June 30, 2024",
        "confidence": "high",
        "status": "extracted",
        "evidenceUse": "Consolidated audited operating result, balance sheet, liquidity, debt, and federal/state award audit context.",
        "limitations": "This is consolidated HSHS system evidence. It does not prove margin, subsidy, or service-line profitability for any single Illinois hospital.",
        "discoveredDate": EXTRACTION_DATE,
    },
    {
        "systemId": "hshs",
        "systemName": "Hospital Sisters Health System",
        "sourceType": "audited_single_audit_pdf",
        "title": "HSHS FY2025 Single Audit Source Page",
        "url": "https://projects.propublica.org/nonprofits/display_audit/2025-06-GSAFAC-0000400420",
        "publisher": "Federal Audit Clearinghouse / ProPublica Nonprofit Explorer",
        "latestPeriod": "Fiscal year ended June 30, 2025",
        "confidence": "high",
        "status": "mapped",
        "evidenceUse": "Next audited-system extraction target after FY2024. Use for multi-year trend once downloaded and parsed.",
        "limitations": "Mapped as source availability only; numeric FY2025 audited statement fields are not extracted yet.",
        "discoveredDate": EXTRACTION_DATE,
    },
    {
        "systemId": "hshs",
        "systemName": "Hospital Sisters Health System",
        "sourceType": "bond_disclosure_registry",
        "title": "MSRB EMMA Bond Disclosure Search",
        "url": "https://emma.msrb.org/",
        "publisher": "Municipal Securities Rulemaking Board",
        "latestPeriod": "Current disclosure registry",
        "confidence": "medium",
        "status": "source_needed",
        "evidenceUse": "Find official statements, continuing disclosures, ratings, debt service, covenants, and obligated-group disclosure documents.",
        "limitations": "Specific HSHS CUSIP/obligated-group documents are not extracted yet. The audit identifies long-term debt, but rating and covenant context still need EMMA/rating-agency validation.",
        "discoveredDate": EXTRACTION_DATE,
    },
    {
        "systemId": "hshs",
        "systemName": "Hospital Sisters Health System",
        "sourceType": "secondary_financial_report",
        "title": "Becker's HSHS FY2024 Financial Report Summary",
        "url": "https://www.beckershospitalreview.com/finance/hospital-closures-cybersecurity-breach-push-hshs-operating-loss-to-385-7m/",
        "publisher": "Becker's Hospital Review",
        "latestPeriod": "Fiscal year ended June 30, 2024",
        "confidence": "medium",
        "status": "secondary",
        "evidenceUse": "Secondary cross-check for FY2024 operating loss, revenue, expenses, cybersecurity cost, closures, and net loss narrative.",
        "limitations": "Secondary reporting should not replace the audited financial statement. Use it for context and cross-checks only.",
        "discoveredDate": EXTRACTION_DATE,
    },
]


HSHS_FACT_RECORDS: list[dict[str, Any]] = [
    {
        "systemId": "hshs",
        "systemName": "Hospital Sisters Health System",
        "period": "Fiscal year ended June 30, 2024",
        "basis": "Audited consolidated financial statement extract",
        "sourceTitle": "HSHS FY2024 Consolidated Financial Statements and Single Audit",
        "sourceUrl": "https://projects.propublica.org/nonprofits/download-audit?download=true&filename=2024-06-GSAFAC-0000345049",
        "extractionStatus": "numeric_extracted",
        "extractionDate": EXTRACTION_DATE,
        "metrics": {
            "patientServiceRevenue": 2692388000,
            "totalRevenue": 2803326000,
            "totalExpenses": 3188978000,
            "operatingIncome": -385652000,
            "operatingMargin": -0.1376,
            "netIncome": -327612000,
            "excessRevenueOverExpenses": -329797000,
            "cash": 72044000,
            "totalCurrentAssets": 730590000,
            "totalCurrentLiabilities": 626294000,
            "currentRatio": 1.1665,
            "assetsLimitedOrRestricted": 1644026000,
            "totalAssets": 3953887000,
            "totalLiabilities": 1383729000,
            "netAssets": 2570158000,
            "netAssetsWithoutDonorRestrictions": 2514852000,
            "netAssetsWithDonorRestrictions": 55306000,
            "longTermDebt": 468593000,
            "totalDebt": 518965000,
            "totalDebtAndFinanceLeases": 565343000,
            "currentLongTermDebt": 31880000,
            "shortTermRemarketingDebt": 64870000,
            "salariesAndWages": 933960000,
            "employeeBenefits": 272531000,
            "suppliesExpense": 481930000,
            "purchasedServices": 583672000,
            "interestExpense": 14907000,
            "impairmentLoss": 97418000
        },
        "sourceEvidence": [
            "The FY2024 audit states the consolidated financial statements are for Hospital Sisters Health System and subsidiaries for June 30, 2024 and 2023.",
            "The audited statement reports FY2024 total revenues of $2.803 billion, total expenses of $3.189 billion, and loss from operations of $385.652 million.",
            "The audited balance sheet reports FY2024 total assets of $3.954 billion, total liabilities of $1.384 billion, and total net assets of $2.570 billion.",
            "The audited debt note reports FY2024 total debt of $518.965 million and total debt and finance leases of $565.343 million."
        ],
        "notes": "First audit-grade HSHS capacity record. It replaces secondary-only operating-loss context with consolidated audited system revenue, expense, liquidity, asset, liability, and debt fields.",
        "limitations": "This is consolidated system evidence and includes Illinois/Wisconsin operations and subsidiaries. It is not facility HCRIS, not a claim-payment file, and not proof of facility-specific subsidy or service-line profitability."
    },
    {
        "systemId": "hshs",
        "systemName": "Hospital Sisters Health System",
        "period": "Fiscal year ended June 30, 2024",
        "basis": "Secondary financial report cross-check",
        "sourceTitle": "Becker's HSHS FY2024 Financial Report Summary",
        "sourceUrl": "https://www.beckershospitalreview.com/finance/hospital-closures-cybersecurity-breach-push-hshs-operating-loss-to-385-7m/",
        "extractionStatus": "secondary_extracted",
        "extractionDate": EXTRACTION_DATE,
        "metrics": {
            "totalRevenue": 2800000000,
            "totalExpenses": 3200000000,
            "operatingIncome": -385700000,
            "operatingMargin": -0.138,
            "priorYearOperatingIncome": -93500000,
            "priorYearOperatingMargin": -0.032,
            "westernWisconsinClosureOperatingLoss": -216400000,
            "westernWisconsinClosureOneTimeCosts": 190500000,
            "cybersecurityCostAndRevenueImpairment": 85000000,
            "netIncome": -327600000,
            "priorYearNetIncome": 193400000
        },
        "sourceEvidence": [
            "Secondary report says HSHS reported a FY2024 operating loss of $385.7 million and -13.8% margin.",
            "Secondary report says HSHS reported $2.8 billion revenue, $3.2 billion expenses, $85 million cybersecurity-related cost/revenue impairment, and $327.6 million net loss."
        ],
        "notes": "Secondary cross-check aligns closely with the FY2024 audited statement and adds narrative context for closures and cybersecurity impact.",
        "limitations": "This is not the primary audited financial statement. Keep as corroborating context only."
    }
]


def load_json(path: Path) -> list[dict[str, Any]]:
    if not path.exists():
        return []
    return json.loads(path.read_text(encoding="utf-8"))


def merge_records(existing: list[dict[str, Any]], new_records: list[dict[str, Any]], keys: tuple[str, ...]) -> list[dict[str, Any]]:
    merged = list(existing)
    index = {tuple(str(record.get(key, "")) for key in keys): pos for pos, record in enumerate(merged)}
    for record in new_records:
        identity = tuple(str(record.get(key, "")) for key in keys)
        if identity in index:
            merged[index[identity]] = record
        else:
            index[identity] = len(merged)
            merged.append(record)
    return merged


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--data-dir", type=Path, default=Path("data"))
    args = parser.parse_args()

    facts_path = args.data_dir / "system-financial-facts.json"
    sources_path = args.data_dir / "system-financial-sources.json"

    facts = merge_records(
        load_json(facts_path),
        HSHS_FACT_RECORDS,
        ("systemId", "period", "basis", "sourceTitle"),
    )
    sources = merge_records(
        load_json(sources_path),
        HSHS_SOURCE_RECORDS,
        ("systemId", "sourceType", "title"),
    )

    facts_path.write_text(json.dumps(facts, indent=2) + "\n", encoding="utf-8")
    sources_path.write_text(json.dumps(sources, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(facts)} system financial facts and {len(sources)} system financial sources.")


if __name__ == "__main__":
    main()
