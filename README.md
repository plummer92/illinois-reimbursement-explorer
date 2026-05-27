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

## Audit Framework

The long-term project question is:

**How does the healthcare system reimburse facilities, where does public money flow, and what can public data actually prove?**

The dashboard uses this pipeline to keep each data source in scope:

1. Money Flow: who got paid, by which payer, for which facility or service type.
2. Rate Rules: the fee schedule, per diem, DRG, APC, capitation, rate sheet, or policy method behind payment.
3. Inpatient Logic: ED admission path, principal diagnosis, procedures, CC/MCCs, length of stay, discharge status, transfer rules, and outlier logic.
4. Quality & Payment Risk: Present on Admission, hospital-acquired conditions, infections, pressure injuries, readmissions, staffing, penalties, and denials exposure.
5. Facility Economics: cost reports, revenue, expenses, beds, occupancy, service lines, payer mix, capital, and staffing.
6. Evidence Strength: published rate, reported payment, allowed amount, charge, cost report value, quality signal, or derived estimate.

The next expansion queue is tracked in `data/source-registry.json`:

1. HFS provider-level Medicaid payment data.
2. HFS fee schedules beyond nursing facilities.
3. Illinois hospital rate sheets.
4. Hospital Report Card API.
5. HFSRB revenue/expense and facility inventory data.
6. CMS HCRIS cost reports.
7. Medicare utilization/payment files.
8. Inpatient DRG/LOS rule files.
9. HAC/POA/readmission/quality penalty data.
10. Facility careers pages and public job-opening counts as workforce-demand signals.

## Workforce Demand Signals

Facility career pages can add useful operating context. Public job openings may suggest staffing pressure, service-line growth, recruitment difficulty, or broader labor demand around a hospital or nursing facility.

The dashboard treats job openings as a `labor_market_signal`, not as proof of actual vacancy rate, budgeted headcount, turnover, unsafe staffing, or financial distress. Counts should be stored with:

- facility identifier and facility name
- facility homepage URL
- careers page URL
- hiring platform, such as Workday, iCIMS, Oracle, UKG, Greenhouse, or a health-system portal
- job-opening count
- clinical and non-clinical role counts where available
- observation date
- source URL and confidence notes

The placeholder file is `data/facility-careers.json`. Illinois Hospital Report Card hospital records include website fields that can seed homepage discovery before careers-page crawling.

Refresh the careers-page observations with:

```powershell
python scripts/import_facility_careers.py --cms-hospitals data/cms-hospital-general-illinois.json --output data/facility-careers.json
```

Use `--limit 10` for a quick pilot run. The importer uses standard-library HTTP and static HTML parsing only; pages that require JavaScript or platform-specific APIs will be retained with a low-confidence note rather than forced into a false count.

The Workforce Demand tab also includes a **Query Careers Data** button. In the static app, the button loads live Hospital Report Card hospital website seeds, then attempts a browser-side careers crawl using direct fetch first and a public CORS proxy fallback for public pages. Counts are captured only when the careers page exposes static count text or job-like links. Sites that require JavaScript, authentication, bot protection, or platform-specific APIs are retained with low-confidence notes instead of forced into false counts.

Click a facility in the Workforce Demand table to open the role drilldown. When the public careers page exposes role titles in static HTML, the app groups captured roles into categories such as Nursing, Pharmacy, EVS, Business/Admin, Therapy/Rehab, Imaging, Lab, Respiratory, Food/Nutrition, Security, Provider, and Other.

The Workforce Demand tab also rolls captured jobs into a market landscape: roles by category, most open roles by facility, open roles by county, and hiring platforms found. Use the **View Roles** button on a row for in-app drilldown; use Homepage, Careers, or individual role links only when you want to open the external site.

## Local Use

Run a local static server from this folder, then open the dashboard:

```powershell
python -m http.server 8000
```

Then visit http://localhost:8000.

For the Workforce Demand button, use the local Node server instead of a static file server:

```powershell
node scripts/serve_dashboard.js
```

Then visit http://127.0.0.1:8765. The server exposes `/api/query-careers?limit=25`, which lets the app request homepages and careers pages from the local server instead of being blocked by browser cross-origin rules.

The dashboard can import JSON arrays or CSV files. For CSV imports, use these column names when possible:

`facility`, `city`, `category`, `payer`, `service`, `codeType`, `code`, `publishedAmount`, `amountLabel`, `effectiveDate`, `source`, `confidence`, `notes`

## Money Flow: HFS Provider Payments

The Money Flow tab is designed for Illinois HFS Transparency Law provider-level Medicaid payment data. HFS describes this data as provider/vendor names, county, patients served, payments, average costs, adjustments, and total money received from HFS.

Download the provider-level CSV from HFS Transparency Law Data, then normalize it with:

```powershell
python scripts/import_hfs_provider_payments.py data/raw/2023_provider_level_data.csv data/hfs-provider-payments.json --year 2023
```

The resulting records are `reported_payment` evidence. They show aggregate public payment flow, not patient-level claim detail, managed care contract terms, denials, complete service locations, or medical necessity context.

The Taylorville evidence binder automatically attempts to query the HFS provider-level source through the local dashboard server when the hospital profile opens. The **Query HFS Payments** button is retained as a retry control. If a workplace network blocks the live HFS download, the dashboard's **Import data** picker can still detect tab-delimited HFS provider-payment files, normalize them into Money Flow records, and match Taylorville/Memorial Health rows into the binder.

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

## Capital Equity Method

Illinois HFS nursing facility rates are interpreted as per-resident-per-day Medicaid reimbursement amounts. The dashboard separates the total per diem into nursing, support, and capital components, then compares capital reimbursement by geography.

The Capital Equity tab uses capital rate as a proxy for capital funding pressure and infrastructure modernization risk. It is not proof of actual facility investment behavior, deferred maintenance, or ownership-level capital spending.

## CMS Care Compare Quality Match

The Quality Correlation tab uses CMS Care Compare Nursing Home Provider Information from the Provider Data Catalog. The current source file is `NH_ProviderInfo_Apr2026.csv`, filtered to Illinois.

Refresh the normalized CMS and matched quality datasets with:

```powershell
python scripts/import_cms_care_compare.py data/raw/NH_ProviderInfo_Apr2026.csv data/nursing-facility-rates.json data/cms-care-compare-illinois.json data/quality-matched-rates.json
```

The match uses facility name and city, with a fuzzy name fallback. Correlation views should be interpreted as associations that may suggest areas for deeper validation, not proof that reimbursement causes quality differences.

## Executive Summary

The dashboard opens with an Executive Summary tab for portfolio and interview use. It automatically summarizes total HFS records, matched CMS/HFS records, average reimbursement components, geography extremes, key findings, strategic implications, recommended next actions, and limitations.

The Executive Findings tab turns reimbursement, CMS quality, and county context into a policy-style brief with export-ready cards, ranked outlier lists, and report-ready narrative language. It is designed for healthcare administration, strategic sourcing, reimbursement, capital planning, and policy interview conversations.

## County Disparity Context

The County Context tab uses 2025 County Health Rankings Illinois data to add county-level context to matched CMS/HFS facility records. It includes rurality, median household income, uninsured rate, age 65+, population, child poverty as the poverty proxy, preventable hospitalization, and primary care access indicators.

Refresh county context with:

```powershell
python scripts/import_county_context.py data/raw/2025_county_health_rankings_illinois.xlsx data/quality-matched-rates.json data/county-context-illinois.json data/county-facility-summary.json
```

County-level social data provides context only. It does not prove reimbursement causes quality, access, or capital investment differences.

## Facility Risk Intelligence

The Facility Risk tab creates a composite exploratory risk score from reimbursement, CMS quality, staffing, rural/downstate geography, certified bed count, county poverty context, and RN staffing hours. It includes an Illinois facility map, risk distribution, facility profile drilldown, top-risk facilities, county/geography rollups, and risk relationship scatterplots.

The facility profile uses public CMS Care Compare fields where available, including ownership, legal business name, chain affiliation, certified beds, average residents per day, staffing hours per resident day, turnover, survey indicators, fines, payment denials, penalties, and ownership-change flags. Pharmacy vendor relationships, consultant pharmacist contracts, full financial statements, debt, liquidity, lease burden, and cash flow are not included in the standard CMS/HFS dataset and should be validated through additional source work.

The score is a risk indicator for review and prioritization. It does not prove financial instability, poor care, infrastructure failure, or causal relationships.

## Chain / Operator Analytics

The Chain Analytics tab rolls matched facilities up by CMS chain name or available operator fields. It highlights average risk score, elevated/high-risk share, average reimbursement components, staffing and overall ratings, RN hours, low-capital counts, weak-staffing counts, penalties, fines, counties, geographies, and facilities in the selected operator.

These rollups are portfolio screening signals. CMS chain fields should be validated against current ownership, management agreements, lease structures, cost reports, and operator disclosures before making business, policy, or quality conclusions.

## Hospital Intelligence

The Hospital Intelligence tab extends the project beyond nursing facilities using CMS Hospital General Information. It adds an Illinois hospital master layer with facility ID, hospital name, city, county, hospital type, ownership, emergency services, birthing-friendly designation, overall hospital rating, and measure-group signals for mortality, safety, readmissions, patient experience, and timely/effective care.

Refresh the normalized Illinois hospital dataset with:

```powershell
python scripts/import_cms_hospital_general.py data/raw/Hospital_General_Information.csv data/cms-hospital-general-illinois.json
```

The dashboard also indexes HFS Hospital Rate Sheets Effective January 1, 2026 and matches those public PDF rate sheets to CMS hospital records where name similarity is strong enough:

```powershell
python scripts/import_hfs_hospital_rate_sheets.py data/raw/hfs_hospital_rates_2026_list.json data/cms-hospital-general-illinois.json data/hfs-hospital-rate-sheets-2026.json
```

Extract structured HFS payment parameters from those PDFs with:

```powershell
python scripts/import_hfs_hospital_rate_values.py data/hfs-hospital-rate-sheets-2026.json data/hfs-hospital-rate-values-2026.json
```

The PDF parser requires `pypdf`. The downloaded PDF cache is stored under `data/raw/hfs_hospital_rate_sheets/` and excluded from git.

The current hospital reimbursement layer links to the HFS rate sheet PDFs and shows match status, provider ID, effective date, match score, and parsed payment fields such as IP acute DRG rate, psych/rehab per diem rates, outpatient EAPG base rates, wage index, CCR, trauma/perinatal level, and high-cost drug/device add-on eligibility. These are rate-sheet parameters, not full claim-specific payment estimates. DRG/APC grouper logic, diagnosis/procedure context, managed-care rules, outpatient claim logic, and hospital price transparency files should still be added before presenting scenario-level hospital reimbursement estimates.

The Hospital Payment Explorer tab turns these parsed fields into a facility-level comparison workflow. It lets users compare a selected hospital against statewide and hospital-type peer averages, review core inpatient/outpatient payment parameters, and read a plain-English data dictionary for DRG, EAPG, CCR, wage index, outlier, and add-on fields.

## Data Coverage + Methodology

The Methodology tab summarizes live dataset coverage, interpretation limits, known data gaps, and recommended next layers. It is designed to make the project defensible in portfolio and interview settings by separating loaded evidence from pending research layers.

Use this tab to explain which signals are reimbursement data, which are quality/access context, which are risk proxies, and which conclusions require additional validation.

## Portfolio Case Study

The Case Study tab packages the project for portfolio, interview, and class-presentation use. It summarizes the business problem, live top-line disparity metrics, loaded evidence layers, strategic value, limitations, next steps, and a copy-ready portfolio blurb with the public GitHub Pages dashboard link.
