"""Import curated audited/bond capacity extracts into system-financial data files.

This script captures the first auditable capacity layer for mapped health systems.
The values below are extracted from public audited financial statements, bondholder
pages, investor pages, and official system pages. Source PDFs commonly report
figures in thousands; values in the output JSON are converted to dollars.
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path
from typing import Any


EXTRACTION_DATE = "2026-05-27"


SOURCE_RECORDS: list[dict[str, Any]] = [
    {
        "systemId": "rush",
        "systemName": "Rush",
        "sourceType": "audited_annual_report_pdf",
        "title": "Rush FY2024 Annual Financial Report Audited",
        "url": "https://www.rush.edu/sites/default/files/media-documents/2024-annual-financial-report-audited.pdf",
        "publisher": "Rush University System for Health",
        "latestPeriod": "Fiscal year ended June 30, 2024",
        "confidence": "high",
        "status": "extracted",
        "evidenceUse": "Obligated-group audited operating result, liquidity, debt capacity, days cash, debt-service coverage, and bond-rating context.",
        "limitations": "Obligated-group evidence is system capacity evidence, not facility-level profitability for RUMC, Rush Oak Park, or Copley individually.",
        "discoveredDate": EXTRACTION_DATE,
    },
    {
        "systemId": "northwestern-medicine",
        "systemName": "Northwestern Medicine",
        "sourceType": "audited_financial_statement_pdf",
        "title": "Northwestern Memorial HealthCare FY2025 Audited Financial Statements",
        "url": "https://www.nm.org/-/media/northwestern/resources/about-us/northwestern-medicine-fiscal-audit.pdf",
        "publisher": "Northwestern Medicine",
        "latestPeriod": "Fiscal year ended Aug. 31, 2025",
        "confidence": "high",
        "status": "extracted",
        "evidenceUse": "Consolidated audited balance sheet and operating statement fields for system capacity comparison.",
        "limitations": "Consolidated Northwestern Memorial HealthCare evidence should not be read as any single hospital's HCRIS result.",
        "discoveredDate": EXTRACTION_DATE,
    },
    {
        "systemId": "uchicago-medicine",
        "systemName": "UChicago Medicine",
        "sourceType": "audited_financial_statement_pdf",
        "title": "UChicago Medicine 2025 Audited Financial Statements",
        "url": "https://edge.sitecorecloud.io/unichicagomc-81nbqnb3/media/pdfs/adult-pdfs/about-us/financial-information/2025-audited.pdf",
        "publisher": "UChicago Medicine",
        "latestPeriod": "Fiscal year ended June 30, 2025",
        "confidence": "high",
        "status": "extracted",
        "evidenceUse": "Consolidated audited operating revenues, operating expenses, operating result, assets, liabilities, cash, investments, and debt.",
        "limitations": "Academic medical center finance can include hospital, network, affiliate, university, and physician relationships.",
        "discoveredDate": EXTRACTION_DATE,
    },
    {
        "systemId": "hshs",
        "systemName": "Hospital Sisters Health System",
        "sourceType": "official_system_profile",
        "title": "HSHS About Us System Profile",
        "url": "https://www.hshs.org/about",
        "publisher": "Hospital Sisters Health System",
        "latestPeriod": "Current system profile",
        "confidence": "high",
        "status": "extracted",
        "evidenceUse": "System footprint, mission, governance, hospital count, physician partner, and colleague scale context.",
        "limitations": "Footprint facts do not prove liquidity, debt capacity, audited margin, or facility-specific subsidies.",
        "discoveredDate": EXTRACTION_DATE,
    },
]


FACT_RECORDS: list[dict[str, Any]] = [
    {
        "systemId": "rush",
        "systemName": "Rush",
        "period": "Fiscal year ended June 30, 2024",
        "basis": "Audited annual report / obligated group extract",
        "sourceTitle": "Rush FY2024 Annual Financial Report Audited",
        "sourceUrl": "https://www.rush.edu/sites/default/files/media-documents/2024-annual-financial-report-audited.pdf",
        "extractionStatus": "numeric_extracted",
        "extractionDate": EXTRACTION_DATE,
        "metrics": {
            "totalRevenue": 3651642000,
            "totalExpenses": 3574025000,
            "operatingIncome": 77617000,
            "netIncome": 220982000,
            "nonoperatingIncome": 143365000,
            "operatingCashFlow": 268064000,
            "operatingCashFlowMargin": 0.073,
            "operatingMargin": 0.021,
            "daysCashOnHand": 210.2,
            "unrestrictedCashAndInvestments": 1963486000,
            "restrictedCashAndInvestments": 990719000,
            "cashAndInvestments": 2954205000,
            "accountsReceivablePatientServices": 430151000,
            "netPropertyAndEquipment": 1893767000,
            "longTermDebt": 928638000,
            "debtToCapitalization": 0.281,
            "debtToCashFlow": 3.2,
            "cashToDebt": 2.114,
            "maximumAnnualDebtServiceCoverage": 5.3,
            "annualDebtServiceCoverage": 3.7,
            "daysInPatientAccountsReceivable": 49.7,
            "staffedBeds": 918,
            "employedPhysicians": 973,
            "affiliatedProviders": 2500,
            "moodyLongTermRating": "A1",
            "fitchLongTermRating": "AA-",
            "spLongTermRating": "A+",
            "ratingOutlook": "Stable"
        },
        "sourceEvidence": [
            "Annual report lists FY2024 operating revenue, expense, operating income, excess revenue, cash flow, liquidity, debt, and debt-service ratios.",
            "Rush financials and bond ratings page lists 2024 audited annual report and Moody's A1, Fitch AA-, and S&P A+ stable ratings."
        ],
        "notes": "This is the first true bond-capacity record: it gives obligated-group liquidity, days cash, debt, and debt-service coverage next to audited operating performance.",
        "limitations": "Obligated-group results are not facility-level HCRIS margins. Rush Health and Riverside Health System are identified as non-obligated entities in the Rush disclosure."
    },
    {
        "systemId": "advocate-health",
        "systemName": "Advocate Health",
        "period": "Fiscal year ended Dec. 31, 2025",
        "basis": "Audited financial statement extract",
        "sourceTitle": "Advocate Aurora Health 2025 Audited Financial Statements",
        "sourceUrl": "https://www.advocatehealth.org/-/media/Project/Health-System-Enterprise/AdvocateHealthOrg/investor-relations/audited-financial-statements.pdf",
        "extractionStatus": "numeric_extracted",
        "extractionDate": EXTRACTION_DATE,
        "metrics": {
            "totalRevenue": 18246369000,
            "totalExpenses": 17666676000,
            "operatingIncome": 579693000,
            "operatingMargin": 0.0318,
            "netIncome": 2266755000,
            "investmentIncome": 2933864000,
            "cash": 304990000,
            "totalCurrentAssets": 5201034000,
            "totalCurrentLiabilities": 4682365000,
            "currentRatio": 1.1108,
            "totalAssets": 37896655000,
            "totalLiabilities": 20042293000,
            "netAssets": 17854362000,
            "longTermDebt": 3402570000,
            "fitchLongTermRating": "AA",
            "moodyLongTermRating": "Aa2",
            "spLongTermRating": "AA",
            "ratingOutlook": "Stable"
        },
        "sourceEvidence": [
            "Advocate audited statements report balance-sheet and operating-statement fields for 2025 and 2024.",
            "Advocate investor page lists 2025 audited statements, quarterly/annual disclosures, and Fitch, Moody's, and S&P ratings."
        ],
        "notes": "Adds a large-system benchmark for audited operating scale, positive margin, assets, liabilities, debt, and rating strength.",
        "limitations": "Advocate Health is multi-state and consolidated. Illinois hospital comparisons still require facility-level HCRIS and payer/payment evidence."
    },
    {
        "systemId": "northwestern-medicine",
        "systemName": "Northwestern Medicine",
        "period": "Fiscal year ended Aug. 31, 2025",
        "basis": "Audited financial statement extract",
        "sourceTitle": "Northwestern Memorial HealthCare FY2025 Audited Financial Statements",
        "sourceUrl": "https://www.nm.org/-/media/northwestern/resources/about-us/northwestern-medicine-fiscal-audit.pdf",
        "extractionStatus": "numeric_extracted",
        "extractionDate": EXTRACTION_DATE,
        "metrics": {
            "totalRevenue": 10639070000,
            "totalExpenses": 10259534000,
            "operatingIncome": 379536000,
            "operatingMargin": 0.0357,
            "netIncome": 1434587000,
            "investmentIncome": 1194176000,
            "cash": 885327000,
            "shortTermInvestments": 376726000,
            "cashAndInvestments": 12897890000,
            "totalCurrentAssets": 3436305000,
            "totalCurrentLiabilities": 2782330000,
            "currentRatio": 1.2350,
            "totalAssets": 21708732000,
            "totalLiabilities": 6149695000,
            "netAssets": 15559037000,
            "longTermDebt": 1852902000
        },
        "sourceEvidence": [
            "Northwestern audited statements report cash, investments, total assets, liabilities, revenue, expenses, and operating income for FY2025.",
            "The Northwestern financial statements page identifies the audited statement download as a public related resource."
        ],
        "notes": "Adds consolidated audited system capacity for Northwestern Medicine with strong asset base and positive audited operating income.",
        "limitations": "Consolidated Northwestern Memorial HealthCare evidence is not a facility-level margin for Central DuPage, Delnor, McHenry, Lake Forest, or other mapped hospitals."
    },
    {
        "systemId": "uchicago-medicine",
        "systemName": "UChicago Medicine",
        "period": "Fiscal year ended June 30, 2025",
        "basis": "Audited financial statement extract",
        "sourceTitle": "UChicago Medicine 2025 Audited Financial Statements",
        "sourceUrl": "https://edge.sitecorecloud.io/unichicagomc-81nbqnb3/media/pdfs/adult-pdfs/about-us/financial-information/2025-audited.pdf",
        "extractionStatus": "numeric_extracted",
        "extractionDate": EXTRACTION_DATE,
        "metrics": {
            "totalRevenue": 5239341000,
            "totalExpenses": 5159515000,
            "operatingIncome": 79826000,
            "operatingMargin": 0.0152,
            "netIncome": 224824000,
            "cash": 530157000,
            "investmentsLimitedToUse": 1561786000,
            "cashAndInvestments": 2091943000,
            "totalCurrentAssets": 1475342000,
            "totalCurrentLiabilities": 983981000,
            "currentRatio": 1.4994,
            "totalAssets": 5772415000,
            "totalLiabilities": 2759243000,
            "netAssets": 3013172000,
            "longTermDebt": 1402410000,
            "affiliatePayableCurrent": 80775000,
            "universityTransfer": 71750000
        },
        "sourceEvidence": [
            "UChicago Medicine 2025 audited statements report operating revenue, expenses, operating excess, cash, investments, debt, liabilities, and net assets.",
            "UChicago's financial-information page lists audited financial statement downloads for 2012 through 2025."
        ],
        "notes": "Adds audited operating and balance-sheet context for academic-medical-center system capacity.",
        "limitations": "UChicago Medicine includes academic, network, affiliate, and University of Chicago relationships; facility-specific subsidy or service-line profitability is not proven."
    },
    {
        "systemId": "hshs",
        "systemName": "Hospital Sisters Health System",
        "period": "Current system profile",
        "basis": "Official system footprint extract",
        "sourceTitle": "HSHS About Us System Profile",
        "sourceUrl": "https://www.hshs.org/about",
        "extractionStatus": "summary_extracted",
        "extractionDate": EXTRACTION_DATE,
        "metrics": {
            "licensedHospitals": 13,
            "totalColleagues": 11000,
            "physicianPartners": 1000,
            "careLocations": 130
        },
        "sourceEvidence": [
            "HSHS states it has 13 hospitals, scores of community-based health centers and clinics, over 1,000 physician partners, and more than 11,000 colleagues."
        ],
        "notes": "Adds HSHS system scale and mission/governance context beside its Form 990 and facility HCRIS rows.",
        "limitations": "This footprint record does not answer cash, debt, days cash, audited operating income, or facility-subsidy questions."
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
        FACT_RECORDS,
        ("systemId", "period", "basis", "sourceTitle"),
    )
    sources = merge_records(
        load_json(sources_path),
        SOURCE_RECORDS,
        ("systemId", "sourceType", "title"),
    )

    facts_path.write_text(json.dumps(facts, indent=2) + "\n", encoding="utf-8")
    sources_path.write_text(json.dumps(sources, indent=2) + "\n", encoding="utf-8")
    print(f"Wrote {len(facts)} system financial facts and {len(sources)} system financial sources.")


if __name__ == "__main__":
    main()
