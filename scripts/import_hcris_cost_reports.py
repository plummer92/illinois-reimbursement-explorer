"""Import CMS Hospital Provider Cost Report rows for selected hospitals.

This keeps the dashboard's facility economics layer reproducible. The CMS
dataset is public but large, so the importer queries specific Provider CCNs.
"""

from __future__ import annotations

import argparse
import json
from datetime import date
from pathlib import Path
from typing import Any
from urllib.parse import quote
from urllib.request import Request, urlopen


DATASET_ID = "44060663-47d8-4ced-a115-b53b4c270acb"
SOURCE_NAME = "CMS Hospital Provider Cost Report"
SOURCE_URL = "https://data.cms.gov/provider-compliance/cost-reports/hospital-provider-cost-report"
API_ROOT = f"https://data.cms.gov/data-api/v1/dataset/{DATASET_ID}/data"


def number_or_none(value: Any) -> float | None:
    if value in (None, ""):
        return None
    try:
        return float(str(value).replace(",", "").replace("$", "").strip())
    except ValueError:
        return None


def rounded(value: float | None, digits: int = 6) -> float | None:
    return round(value, digits) if value is not None else None


def divide(numerator: float | None, denominator: float | None, digits: int = 6) -> float | None:
    if numerator is None or denominator in (None, 0):
        return None
    return rounded(numerator / denominator, digits)


def text(value: Any) -> str | None:
    cleaned = str(value or "").strip()
    return cleaned or None


def get(row: dict[str, Any], key: str) -> Any:
    return row.get(key)


def normalize_cost_report_row(row: dict[str, Any]) -> dict[str, Any]:
    total_days = number_or_none(get(row, "Total Days (V + XVIII + XIX + Unknown)"))
    bed_days = number_or_none(get(row, "Total Bed Days Available"))
    adult_peds_days = number_or_none(get(row, "Hospital Total Days (V + XVIII + XIX + Unknown) For Adults & Peds"))
    discharges = number_or_none(get(row, "Total Discharges (V + XVIII + XIX + Unknown)"))
    total_costs = number_or_none(get(row, "Total Costs"))
    net_patient_revenue = number_or_none(get(row, "Net Patient Revenue"))
    operating_income = number_or_none(get(row, "Net Income from Service to Patients"))
    net_income = number_or_none(get(row, "Net Income"))
    total_patient_revenue = number_or_none(get(row, "Total Patient Revenue"))
    salaries = number_or_none(get(row, "Total Salaries From Worksheet A"))
    depreciation = number_or_none(get(row, "Depreciation Cost"))
    outpatient_charges = number_or_none(get(row, "Outpatient Total Charges"))
    combined_charges = number_or_none(get(row, "Combined Outpatient + Inpatient Total Charges"))
    medicaid_net = number_or_none(get(row, "Net Revenue from Medicaid"))
    medicaid_charges = number_or_none(get(row, "Medicaid Charges"))
    current_assets = number_or_none(get(row, "Total Current Assets"))
    current_liabilities = number_or_none(get(row, "Total Current Liabilities"))
    total_liabilities = number_or_none(get(row, "Total Liabilities"))
    total_assets = number_or_none(get(row, "Total Assets"))
    fte = number_or_none(get(row, "FTE - Employees on Payroll"))
    average_daily_census = divide(total_days, 365, 2)

    return {
        "facilityId": text(get(row, "Provider CCN")),
        "facilityName": text(get(row, "Hospital Name")),
        "reportRecordNumber": text(get(row, "rpt_rec_num")),
        "providerCcn": text(get(row, "Provider CCN")),
        "sourceYear": int(str(get(row, "Fiscal Year End Date") or "0000")[:4] or 0) or None,
        "fiscalYearBeginDate": text(get(row, "Fiscal Year Begin Date")),
        "fiscalYearEndDate": text(get(row, "Fiscal Year End Date")),
        "county": text(get(row, "County")),
        "state": text(get(row, "State Code")),
        "ruralUrban": text(get(row, "Rural Versus Urban")),
        "ccnFacilityType": text(get(row, "CCN Facility Type")),
        "providerType": text(get(row, "Provider Type")),
        "typeOfControl": text(get(row, "Type of Control")),
        "fteEmployeesOnPayroll": fte,
        "numberOfBeds": number_or_none(get(row, "Number of Beds")),
        "totalBedDaysAvailable": bed_days,
        "totalDays": total_days,
        "hospitalAdultPedsDays": adult_peds_days,
        "totalDischarges": discharges,
        "medicareDays": number_or_none(get(row, "Total Days Title XVIII")),
        "medicaidDays": number_or_none(get(row, "Total Days Title XIX")),
        "medicareDischarges": number_or_none(get(row, "Total Discharges Title XVIII")),
        "medicaidDischarges": number_or_none(get(row, "Total Discharges Title XIX")),
        "costOfCharityCare": number_or_none(get(row, "Cost of Charity Care")),
        "totalBadDebtExpense": number_or_none(get(row, "Total Bad Debt Expense")),
        "costOfUncompensatedCare": number_or_none(get(row, "Cost of Uncompensated Care")),
        "totalUnreimbursedAndUncompensatedCare": number_or_none(get(row, "Total Unreimbursed and Uncompensated Care")),
        "totalSalariesFromWorksheetA": salaries,
        "overheadNonSalaryCosts": number_or_none(get(row, "Overhead Non-Salary Costs")),
        "depreciationCost": depreciation,
        "totalCosts": total_costs,
        "inpatientTotalCharges": number_or_none(get(row, "Inpatient Total Charges")),
        "outpatientTotalCharges": outpatient_charges,
        "combinedOutpatientInpatientCharges": combined_charges,
        "totalPatientRevenue": total_patient_revenue,
        "contractualAllowanceDiscounts": number_or_none(get(row, "Less Contractual Allowance and Discounts on Patients' Accounts")),
        "netPatientRevenue": net_patient_revenue,
        "totalOperatingExpense": number_or_none(get(row, "Less Total Operating Expense")),
        "netIncomeFromServiceToPatients": operating_income,
        "totalOtherIncome": number_or_none(get(row, "Total Other Income")),
        "totalIncome": number_or_none(get(row, "Total Income")),
        "netIncome": net_income,
        "costToChargeRatio": number_or_none(get(row, "Cost To Charge Ratio")),
        "netRevenueFromMedicaid": medicaid_net,
        "medicaidCharges": medicaid_charges,
        "cashOnHandAndInBanks": number_or_none(get(row, "Cash on Hand and in Banks")),
        "totalCurrentAssets": current_assets,
        "totalFixedAssets": number_or_none(get(row, "Total Fixed Assets")),
        "investments": number_or_none(get(row, "Investments")),
        "totalOtherAssets": number_or_none(get(row, "Total Other Assets")),
        "totalAssets": total_assets,
        "accountsPayable": number_or_none(get(row, "Accounts Payable")),
        "totalCurrentLiabilities": current_liabilities,
        "notesPayable": number_or_none(get(row, "Notes Payable")),
        "totalLongTermLiabilities": number_or_none(get(row, "Total Long Term Liabilities")),
        "totalLiabilities": total_liabilities,
        "generalFundBalance": number_or_none(get(row, "General Fund Balance")),
        "totalFundBalances": number_or_none(get(row, "Total Fund Balances")),
        "derived": {
            "occupancyRate": divide(total_days, bed_days),
            "adultPedsOccupancyRate": divide(adult_peds_days, bed_days),
            "averageDailyCensus": average_daily_census,
            "operatingMargin": divide(operating_income, net_patient_revenue),
            "totalMarginOnPatientRevenue": divide(net_income, total_patient_revenue),
            "salaryShareOfTotalCosts": divide(salaries, total_costs),
            "depreciationShareOfTotalCosts": divide(depreciation, total_costs),
            "outpatientChargeShare": divide(outpatient_charges, combined_charges),
            "medicaidNetToChargeRatio": divide(medicaid_net, medicaid_charges),
            "currentRatio": divide(current_assets, current_liabilities),
            "liabilitiesToAssets": divide(total_liabilities, total_assets),
            "netPatientRevenuePerDischarge": divide(net_patient_revenue, discharges, 2),
            "totalCostPerDischarge": divide(total_costs, discharges, 2),
            "netIncomePerDischarge": divide(net_income, discharges, 2),
            "ftePerOccupiedBed": divide(fte, average_daily_census, 2),
        },
        "evidenceType": "cost_report",
        "source": SOURCE_NAME,
        "sourceUrl": SOURCE_URL,
        "limitations": "Hospital Provider Cost Report public-use data is facility-reported cost-report context. It does not prove service-line profitability, private payer contract performance, real-time cash position, or claim-level reimbursement.",
    }


def fetch_rows(provider_ccn: str) -> list[dict[str, Any]]:
    url = f"{API_ROOT}?filter[{quote('Provider CCN')}]= {provider_ccn}&size=10".replace("= ", "=")
    request = Request(url, headers={"User-Agent": "IllinoisReimbursementExplorer/0.1"})
    with urlopen(request, timeout=30) as response:
        payload = json.loads(response.read().decode("utf-8"))
    return payload.get("value", [])


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--ccn", action="append", default=["141339"], help="Provider CCN to query. Can be passed more than once.")
    parser.add_argument("--output", default="data/hcris-cost-report-economics.json")
    args = parser.parse_args()

    records: list[dict[str, Any]] = []
    for ccn in args.ccn:
        records.extend(normalize_cost_report_row(row) for row in fetch_rows(ccn))

    payload = {
        "description": "CMS Hospital Provider Cost Report public-use data for facility economics.",
        "lastUpdated": date.today().isoformat(),
        "source": SOURCE_NAME,
        "sourceUrl": SOURCE_URL,
        "apiUrl": API_ROOT,
        "records": records,
    }
    output = Path(args.output)
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    print(f"Wrote {len(records)} HCRIS cost report record(s) to {output}")


if __name__ == "__main__":
    main()
