# Illinois Reimbursement Explorer

A lightweight research dashboard for exploring public reimbursement and pricing data in Illinois.

This project starts with Illinois because the state publishes several useful Medicaid reimbursement resources through HFS, including practitioner fee schedules, hospital rate sheets, nursing facility rate lists, and cost reports. The dashboard is designed to compare public rate signals across Medicaid, Medicare, hospital transparency files, and long-term care data.

## What This Can Show

- Published Illinois Medicaid fee schedule rates by service code.
- Illinois nursing facility Medicaid per diem rates where HFS publishes facility-level lists.
- Hospital Medicaid rate sheet context by facility.
- Medicare benchmark rates from CMS fee schedules and prospective payment systems.
- Hospital machine-readable file data, including gross charges, cash prices, and payer-specific negotiated rates.

## What This Cannot Guarantee

This tool should not be presented as a final patient bill estimator. Actual payment and out-of-pocket cost can change based on claim coding, modifiers, payer contract terms, prior authorization, medical necessity rules, managed care policies, deductible status, coinsurance, network status, and complications.

Use language like **published rate**, **estimated reimbursement**, or **price transparency amount**, not guaranteed cost.

## Core Public Sources

- Illinois HFS Medicaid Reimbursement: https://hfs.illinois.gov/medicalproviders/medicaidreimbursement.html
- Illinois HFS Practitioner Fee Schedule: https://hfs.illinois.gov/medicalproviders/medicaidreimbursement/individualpractitioner.html
- Illinois HFS Hospital Rate Sheets: https://hfs.illinois.gov/medicalproviders/medicaidreimbursement/hospital/hrs.html
- Illinois HFS Nursing Facility Medicaid Rate Lists: https://hfs.illinois.gov/medicalproviders/medicaidreimbursement/ltc/archivedmedicaidratelists.html
- Illinois HFS Cost Reports: https://hfs.illinois.gov/medicalproviders/costreports.html
- CMS Hospital Price Transparency: https://www.cms.gov/priorities/key-initiatives/hospital-price-transparency
- CMS Physician Fee Schedule: https://www.cms.gov/medicare/physician-fee-schedule/search
- CMS Skilled Nursing Facility PPS: https://www.cms.gov/Medicare/Medicare-Fee-for-Service-Payment/SNFPPS
- CMS Acute Inpatient PPS: https://www.cms.gov/medicare/payment/prospective-payment-systems/acute-inpatient-pps

## Suggested MVP Scope

1. Start with nursing facility Medicaid rates because HFS publishes facility-level rate lists.
2. Add Illinois Medicaid practitioner fee schedule lookup for CPT/HCPCS codes.
3. Add 5-10 Illinois hospital price transparency files.
4. Compare rural vs urban facilities using county and ZIP classifications.
5. Add Medicare benchmarks for the same CPT/HCPCS or payment category.

## Local Use

Run a local static server from this folder, then open the dashboard:

```powershell
python -m http.server 8000
```

Then visit http://localhost:8000.

The dashboard can import JSON arrays or CSV files. For CSV imports, use these column names when possible:

`facility`, `city`, `category`, `payer`, `service`, `codeType`, `code`, `publishedAmount`, `amountLabel`, `effectiveDate`, `source`, `confidence`, `notes`

## Refresh Illinois Nursing Facility Rates

Download the latest HFS nursing facility rate XLSX into `data/raw`, then run:

```powershell
python scripts/import_hfs_nursing_rates.py data/raw/illinois_hfs_nursing_facility_rates_2025-10-01.xlsx data/nursing-facility-rates.json
```

The importer reads all facility sheets in the workbook and writes dashboard-ready records with total, capital, support, and nursing rate components.

## Geography Method

The first geography layer uses the `HSA` field already present in the Illinois HFS rate list. Illinois defines Health Service Areas in state administrative rules, with HSA VI covering Chicago, HSA VII suburban Cook and DuPage, HSA VIII Kane/Lake/McHenry, and HSA IX Grundy/Kankakee/Kendall/Will.

For this MVP, the dashboard groups HSAs into:

- `Chicago Metro`
- `Regional Urban / Mixed`
- `Downstate / Smaller Market`

This is a research proxy, not a definitive rural/urban designation. A later version should add facility address, county, ZIP, RUCA, and Census urbanized-area matching.
