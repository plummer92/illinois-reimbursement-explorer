const state = {
  records: [],
  qualityRecords: [],
  providerPayments: [],
  hfsProviderPaymentStatus: "",
  hfsAutoQueryAttempts: {},
  hfsEnrollmentContext: [],
  hospitalRecords: [],
  hospitalRateSheets: [],
  hospitalRateValues: [],
  hospitalSystems: [],
  hospitalDataAttachments: [],
  facilityEvidenceBinders: [],
  hcrisCostReports: [],
  priceTransparencySources: [],
  priceTransparencyRecords: [],
  facilityCareers: [],
  countyContext: [],
  countySummaries: [],
  sources: [],
  sourceRegistry: [],
  activeTab: "executive",
  query: "",
  category: "all",
  riskLevel: "all",
  ownership: "all",
  staffingRating: "all",
  selectedRiskFacilityId: null,
  selectedChainId: null,
  selectedHospitalId: null,
  selectedCareerFacilityId: null,
  selectedCountyName: null
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

const els = {
  cards: document.querySelector("#cards"),
  sources: document.querySelector("#sources"),
  categorySelect: document.querySelector("#categorySelect"),
  tierSelect: document.querySelector("#tierSelect"),
  searchInput: document.querySelector("#searchInput"),
  sourceCount: document.querySelector("#sourceCount"),
  recordCount: document.querySelector("#recordCount"),
  visibleCount: document.querySelector("#visibleCount"),
  averageAmount: document.querySelector("#averageAmount"),
  rangeAmount: document.querySelector("#rangeAmount"),
  exportButton: document.querySelector("#exportButton"),
  importInput: document.querySelector("#importInput"),
  importStatus: document.querySelector("#importStatus"),
  tabs: document.querySelectorAll(".tab"),
  panels: {
    executive: document.querySelector("#executivePanel"),
    audit: document.querySelector("#auditPanel"),
    moneyFlow: document.querySelector("#moneyFlowPanel"),
    priceTransparency: document.querySelector("#priceTransparencyPanel"),
    findings: document.querySelector("#findingsPanel"),
    records: document.querySelector("#recordsPanel"),
    geography: document.querySelector("#geographyPanel"),
    analysis: document.querySelector("#analysisPanel"),
    capital: document.querySelector("#capitalPanel"),
    quality: document.querySelector("#qualityPanel"),
    county: document.querySelector("#countyPanel"),
    facilityRisk: document.querySelector("#facilityRiskPanel"),
    chain: document.querySelector("#chainPanel"),
    hospital: document.querySelector("#hospitalPanel"),
    binder: document.querySelector("#binderPanel"),
    payment: document.querySelector("#paymentPanel"),
    methodology: document.querySelector("#methodologyPanel"),
    workforce: document.querySelector("#workforcePanel"),
    sources: document.querySelector("#sourcesPanel"),
    model: document.querySelector("#modelPanel")
  },
  geographyCommentary: document.querySelector("#geographyCommentary"),
  tierRows: document.querySelector("#tierRows"),
  hsaRows: document.querySelector("#hsaRows"),
  findingList: document.querySelector("#findingList"),
  componentRows: document.querySelector("#componentRows"),
  topFacilities: document.querySelector("#topFacilities"),
  bottomFacilities: document.querySelector("#bottomFacilities"),
  capitalFindingList: document.querySelector("#capitalFindingList"),
  capitalGeographyRows: document.querySelector("#capitalGeographyRows"),
  lowestCapitalRows: document.querySelector("#lowestCapitalRows"),
  highestCapitalRows: document.querySelector("#highestCapitalRows"),
  capitalWatchlistRows: document.querySelector("#capitalWatchlistRows"),
  qualityFindingList: document.querySelector("#qualityFindingList"),
  overallRatingRows: document.querySelector("#overallRatingRows"),
  staffingRatingRows: document.querySelector("#staffingRatingRows"),
  lowCapitalLowStaffingRows: document.querySelector("#lowCapitalLowStaffingRows"),
  highRateLowQualityRows: document.querySelector("#highRateLowQualityRows"),
  projectPurpose: document.querySelector("#projectPurpose"),
  executiveMetricCards: document.querySelector("#executiveMetricCards"),
  executiveFindings: document.querySelector("#executiveFindings"),
  strategicImplications: document.querySelector("#strategicImplications"),
  recommendedActions: document.querySelector("#recommendedActions"),
  countyFindingList: document.querySelector("#countyFindingList"),
  countyPriorityCards: document.querySelector("#countyPriorityCards"),
  countyDrilldown: document.querySelector("#countyDrilldown"),
  countySummaryRows: document.querySelector("#countySummaryRows"),
  countyRiskRows: document.querySelector("#countyRiskRows"),
  riskLevelSelect: document.querySelector("#riskLevelSelect"),
  ownershipSelect: document.querySelector("#ownershipSelect"),
  staffingRatingSelect: document.querySelector("#staffingRatingSelect"),
  riskInsightCards: document.querySelector("#riskInsightCards"),
  illinoisRiskMap: document.querySelector("#illinoisRiskMap"),
  facilityDrilldown: document.querySelector("#facilityDrilldown"),
  topRiskFacilities: document.querySelector("#topRiskFacilities"),
  riskDistribution: document.querySelector("#riskDistribution"),
  riskBreakdown: document.querySelector("#riskBreakdown"),
  highestRiskCounties: document.querySelector("#highestRiskCounties"),
  riskByGeography: document.querySelector("#riskByGeography"),
  riskReimbursementScatter: document.querySelector("#riskReimbursementScatter"),
  riskStaffingScatter: document.querySelector("#riskStaffingScatter"),
  policySummaryCards: document.querySelector("#policySummaryCards"),
  policyNarrative: document.querySelector("#policyNarrative"),
  policySuggestionCards: document.querySelector("#policySuggestionCards"),
  highReimbursementLowQualityCounties: document.querySelector("#highReimbursementLowQualityCounties"),
  lowReimbursementHighRiskCounties: document.querySelector("#lowReimbursementHighRiskCounties"),
  highCapitalWeakStaffingFacilities: document.querySelector("#highCapitalWeakStaffingFacilities"),
  ruralLimitedCoverageCounties: document.querySelector("#ruralLimitedCoverageCounties"),
  auditPipeline: document.querySelector("#auditPipeline"),
  auditEvidenceMap: document.querySelector("#auditEvidenceMap"),
  evidenceTypeCards: document.querySelector("#evidenceTypeCards"),
  sourceRegistryRows: document.querySelector("#sourceRegistryRows")
};

Object.assign(els, {
  moneyFlowMetricCards: document.querySelector("#moneyFlowMetricCards"),
  topPaidProviders: document.querySelector("#topPaidProviders"),
  providerTypePayments: document.querySelector("#providerTypePayments"),
  countyPayments: document.querySelector("#countyPayments"),
  moneyFlowLimits: document.querySelector("#moneyFlowLimits"),
  chainInsightCards: document.querySelector("#chainInsightCards"),
  chainSummaryRows: document.querySelector("#chainSummaryRows"),
  chainDrilldown: document.querySelector("#chainDrilldown"),
  chainWatchlistRows: document.querySelector("#chainWatchlistRows"),
  chainFacilityRows: document.querySelector("#chainFacilityRows"),
  hospitalInsightCards: document.querySelector("#hospitalInsightCards"),
  hospitalMetricCards: document.querySelector("#hospitalMetricCards"),
  hospitalCountyRows: document.querySelector("#hospitalCountyRows"),
  hospitalDrilldown: document.querySelector("#hospitalDrilldown"),
  hospitalRiskRows: document.querySelector("#hospitalRiskRows"),
  hospitalRateValueRows: document.querySelector("#hospitalRateValueRows"),
  hospitalRoadmapCards: document.querySelector("#hospitalRoadmapCards"),
  binderSnapshotCards: document.querySelector("#binderSnapshotCards"),
  binderEvidenceStack: document.querySelector("#binderEvidenceStack"),
  binderServiceExamples: document.querySelector("#binderServiceExamples"),
  binderPaymentRows: document.querySelector("#binderPaymentRows"),
  binderCostReportRows: document.querySelector("#binderCostReportRows"),
  binderClinicalWorkbench: document.querySelector("#binderClinicalWorkbench"),
  binderProofTasks: document.querySelector("#binderProofTasks"),
  paymentExplorerFindings: document.querySelector("#paymentExplorerFindings"),
  paymentComparisonCards: document.querySelector("#paymentComparisonCards"),
  paymentHospitalRows: document.querySelector("#paymentHospitalRows"),
  paymentDrilldown: document.querySelector("#paymentDrilldown"),
  paymentPeerRows: document.querySelector("#paymentPeerRows"),
  paymentDictionaryRows: document.querySelector("#paymentDictionaryRows"),
  coverageMetricCards: document.querySelector("#coverageMetricCards"),
  coverageRows: document.querySelector("#coverageRows"),
  methodologyNotes: document.querySelector("#methodologyNotes"),
  dataGapRows: document.querySelector("#dataGapRows"),
  nextLayerCards: document.querySelector("#nextLayerCards"),
  queryPriceTransparencyButton: document.querySelector("#queryPriceTransparencyButton"),
  priceTransparencyStatus: document.querySelector("#priceTransparencyStatus"),
  priceTransparencyMetricCards: document.querySelector("#priceTransparencyMetricCards"),
  priceTransparencySourceRows: document.querySelector("#priceTransparencySourceRows"),
  priceTransparencyExampleRows: document.querySelector("#priceTransparencyExampleRows"),
  priceTransparencyLimitCards: document.querySelector("#priceTransparencyLimitCards"),
  refreshCareersButton: document.querySelector("#refreshCareersButton"),
  careersStatus: document.querySelector("#careersStatus"),
  careersMetricCards: document.querySelector("#careersMetricCards"),
  careerLandscape: document.querySelector("#careerLandscape"),
  careersRows: document.querySelector("#careersRows"),
  careerDrilldown: document.querySelector("#careerDrilldown")
});

async function loadData() {
  const [recordsResponse, sourcesResponse] = await Promise.all([
    fetch("data/starter-records.json"),
    fetch("data/sources.json")
  ]);

  const starterRecords = await recordsResponse.json();
  const nursingRates = await fetchOptionalJson("data/nursing-facility-rates.json");
  state.providerPayments = await fetchOptionalJson("data/hfs-provider-payments.json");
  state.hfsEnrollmentContext = await fetchOptionalJson("data/hfs-program-enrollment-context.json");
  state.qualityRecords = await fetchOptionalJson("data/quality-matched-rates.json");
  state.hospitalRecords = await fetchOptionalJson("data/cms-hospital-general-illinois.json");
  state.hospitalRateSheets = await fetchOptionalJson("data/hfs-hospital-rate-sheets-2026.json");
  state.hospitalRateValues = await fetchOptionalJson("data/hfs-hospital-rate-values-2026.json");
  state.hospitalSystems = await fetchOptionalJson("data/hospital-systems.json");
  state.hospitalDataAttachments = await fetchOptionalJson("data/hospital-data-attachments.json");
  state.facilityEvidenceBinders = await fetchOptionalJson("data/facility-evidence-binders.json");
  state.hcrisCostReports = await fetchOptionalJson("data/hcris-cost-report-economics.json");
  state.priceTransparencySources = await fetchOptionalJson("data/price-transparency-sources.json");
  state.priceTransparencyRecords = await fetchOptionalJson("data/price-transparency-records.json");
  state.facilityCareers = await fetchOptionalJson("data/facility-careers.json");
  state.countyContext = await fetchOptionalJson("data/county-context-illinois.json");
  state.countySummaries = await fetchOptionalJson("data/county-facility-summary.json");
  state.sourceRegistry = await fetchOptionalJson("data/source-registry.json");
  state.records = [...nursingRates, ...starterRecords];
  state.sources = await sourcesResponse.json();
  render();
  setTab(getInitialTab());
}

async function fetchOptionalJson(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return [];
    return await response.json();
  } catch {
    return [];
  }
}

function render() {
  renderMetrics();
  renderCategoryOptions();
  renderTierOptions();
  renderRiskFilterOptions();
  renderRecords();
  renderSources();
  renderAuditFramework();
  renderMoneyFlow();
  renderPriceTransparency();
  renderGeography();
  renderAnalysis();
  renderCapitalEquity();
  renderQualityCorrelation();
  renderExecutiveSummary();
  renderCountyContext();
  renderPolicyExecutiveFindings();
  renderFacilityRisk();
  renderChainAnalytics();
  renderHospitalIntelligence();
  renderFacilityBinderPage();
  renderHospitalPaymentExplorer();
  renderMethodology();
  renderWorkforceDemand();
}

function renderMetrics() {
  els.sourceCount.textContent = state.sources.length;
  els.recordCount.textContent = state.records.length;
}

function renderCategoryOptions() {
  const categories = [...new Set(state.records.map((record) => record.category))].sort();
  const selected = els.categorySelect.value;

  els.categorySelect.innerHTML = '<option value="all">All categories</option>';
  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    els.categorySelect.append(option);
  });

  els.categorySelect.value = categories.includes(selected) ? selected : "all";
  state.category = els.categorySelect.value;
}

function renderTierOptions() {
  const tiers = [...new Set(state.records.map((record) => record.geography?.tier).filter(Boolean))].sort();
  const selected = els.tierSelect.value;

  els.tierSelect.innerHTML = '<option value="all">All geographies</option>';
  tiers.forEach((tier) => {
    const option = document.createElement("option");
    option.value = tier;
    option.textContent = tier;
    els.tierSelect.append(option);
  });

  els.tierSelect.value = tiers.includes(selected) ? selected : "all";
  state.tier = els.tierSelect.value;
}

function renderRiskFilterOptions() {
  const ownershipTypes = [...new Set(state.qualityRecords.map((record) => record.quality?.ownershipType).filter(Boolean))].sort();
  const ownershipSelected = els.ownershipSelect.value;
  const staffingSelected = els.staffingRatingSelect.value;
  const riskSelected = els.riskLevelSelect.value;

  els.riskLevelSelect.innerHTML = '<option value="all">All risk levels</option>';
  ["High Risk", "Elevated Risk", "Moderate Risk", "Low Risk"].forEach((level) => {
    const option = document.createElement("option");
    option.value = level;
    option.textContent = level;
    els.riskLevelSelect.append(option);
  });
  els.riskLevelSelect.value = ["High Risk", "Elevated Risk", "Moderate Risk", "Low Risk"].includes(riskSelected) ? riskSelected : "all";
  state.riskLevel = els.riskLevelSelect.value;

  els.ownershipSelect.innerHTML = '<option value="all">All ownership types</option>';
  ownershipTypes.forEach((ownership) => {
    const option = document.createElement("option");
    option.value = ownership;
    option.textContent = ownership;
    els.ownershipSelect.append(option);
  });
  els.ownershipSelect.value = ownershipTypes.includes(ownershipSelected) ? ownershipSelected : "all";
  state.ownership = els.ownershipSelect.value;

  els.staffingRatingSelect.innerHTML = '<option value="all">All staffing ratings</option>';
  [1, 2, 3, 4, 5].forEach((rating) => {
    const option = document.createElement("option");
    option.value = String(rating);
    option.textContent = `${rating} star${rating === 1 ? "" : "s"}`;
    els.staffingRatingSelect.append(option);
  });
  els.staffingRatingSelect.value = ["1", "2", "3", "4", "5"].includes(staffingSelected) ? staffingSelected : "all";
  state.staffingRating = els.staffingRatingSelect.value;
}

function getFilteredRecords() {
  const query = state.query.toLowerCase().trim();

  return state.records.filter((record) => {
    const categoryMatch = state.category === "all" || record.category === state.category;
    const tierMatch = !state.tier || state.tier === "all" || record.geography?.tier === state.tier;
    const haystack = [
      record.facility,
      record.city,
      record.category,
      record.payer,
      record.service,
      record.codeType,
      record.code,
      record.geography?.tier,
      record.geography?.region,
      record.geography?.hsaName,
      record.source,
      record.notes
    ].join(" ").toLowerCase();

    return categoryMatch && tierMatch && (!query || haystack.includes(query));
  });
}

function renderRecords() {
  const records = getFilteredRecords();
  renderSummary(records);

  if (!records.length) {
    els.cards.innerHTML = "<p>No matching records yet. Try a broader search or import another source.</p>";
    return;
  }

  els.cards.innerHTML = records.map((record) => {
    const amount = record.publishedAmount === null
      ? '<div class="amount pending">Import needed</div>'
      : `<div class="amount">${currency.format(record.publishedAmount)}</div>`;

    return `
      <article class="card">
        <div class="card-top">
          <div>
            <span class="tag">${escapeHtml(record.category)}</span>
            <h3>${escapeHtml(record.facility)}</h3>
          </div>
        </div>
        ${amount}
        <div class="details">
          <span><strong>Service:</strong> ${escapeHtml(record.service)}</span>
          <span><strong>Payer:</strong> ${escapeHtml(record.payer)}</span>
          <span><strong>Code:</strong> ${escapeHtml(record.codeType)} / ${escapeHtml(record.code)}</span>
          <span><strong>Geography:</strong> ${escapeHtml(record.geography?.tier || "Unclassified")} / ${escapeHtml(record.geography?.region || record.city)}</span>
          <span><strong>Effective:</strong> ${escapeHtml(record.effectiveDate || "TBD")}</span>
          <span><strong>Source:</strong> ${escapeHtml(record.source)}</span>
          <span>${escapeHtml(record.notes)}</span>
        </div>
      </article>
    `;
  }).join("");
}

function renderSummary(records) {
  const amounts = records
    .map((record) => record.publishedAmount)
    .filter((amount) => Number.isFinite(amount));

  els.visibleCount.textContent = records.length;

  if (!amounts.length) {
    els.averageAmount.textContent = "N/A";
    els.rangeAmount.textContent = "N/A";
    return;
  }

  const total = amounts.reduce((sum, amount) => sum + amount, 0);
  const average = total / amounts.length;
  const minimum = Math.min(...amounts);
  const maximum = Math.max(...amounts);

  els.averageAmount.textContent = currency.format(average);
  els.rangeAmount.textContent = `${currency.format(minimum)}-${currency.format(maximum)}`;
}

function renderSources() {
  els.sources.innerHTML = state.sources.map((source) => `
    <article class="source-item">
      <span class="tag">${escapeHtml(source.category)}</span>
      <p><strong>${escapeHtml(source.name)}</strong><br>${escapeHtml(source.bestFor)}</p>
      <a href="${source.url}" target="_blank" rel="noreferrer">Open</a>
    </article>
  `).join("");
}

function renderAuditFramework() {
  const pipeline = [
    ["Money Flow", "Who got paid, by which payer, for which facility or service type, and at what scale."],
    ["Rate Rules", "The published fee schedule, per diem, DRG, APC, capitation, rate sheet, or policy method behind payment."],
    ["Inpatient Logic", "How ED admission path, principal diagnosis, procedures, CC/MCCs, LOS, discharge status, transfers, and outliers affect reimbursement."],
    ["Quality & Payment Risk", "How POA, HACs, infections, pressure injuries, readmissions, staffing, and penalties create avoidable payment loss or accountability risk."],
    ["Facility Economics", "How costs, charges, revenue, expenses, beds, occupancy, service lines, payer mix, capital, and staffing describe facility reality."],
    ["Evidence Strength", "Whether a number is a published rate, reported payment, allowed amount, charge, cost report value, quality signal, or derived estimate."]
  ];

  const evidenceTypes = [
    ["official_rule", "Official rule", "Payment system logic or coding rule published by a payer or regulator."],
    ["published_rate", "Published rate", "A posted rate, fee schedule, per diem, or facility rate sheet amount."],
    ["reported_payment", "Reported payment", "Aggregate money paid or received according to public reporting."],
    ["allowed_amount", "Allowed amount", "A payer-recognized amount from Medicare or transparency files."],
    ["charge", "Charge", "A billed or listed facility price, not necessarily paid."],
    ["cost_report", "Cost report", "Facility-reported costs, charges, utilization, settlement, or finance data."],
    ["quality_penalty", "Quality penalty", "Payment risk tied to HACs, POA, readmissions, safety, or value-based programs."],
    ["quality_signal", "Quality/context signal", "Related evidence around quality, access, staffing, ownership, or geography."],
    ["labor_market_signal", "Labor market signal", "Careers pages and public job counts that suggest workforce demand or staffing pressure."]
  ];

  els.auditPipeline.innerHTML = pipeline.map(([title, copy], index) => `
    <article class="audit-step">
      <span>${index + 1}</span>
      <div>
        <strong>${escapeHtml(title)}</strong>
        <p>${escapeHtml(copy)}</p>
      </div>
    </article>
  `).join("");

  els.auditEvidenceMap.innerHTML = renderAuditEvidenceMap();

  els.evidenceTypeCards.innerHTML = evidenceTypes.map(([key, label, copy]) => `
    <article class="evidence-card">
      <span>${escapeHtml(key)}</span>
      <strong>${escapeHtml(label)}</strong>
      <p>${escapeHtml(copy)}</p>
    </article>
  `).join("");

  els.sourceRegistryRows.innerHTML = state.sourceRegistry
    .slice()
    .sort((a, b) => a.priority - b.priority)
    .map((source) => `
      <article class="registry-row">
        <div>
          <span class="registry-priority">${escapeHtml(source.priority)}</span>
          <strong>${escapeHtml(source.name)}</strong>
          <small>${escapeHtml(source.agency)} / ${escapeHtml(source.pipelineRole)} / ${escapeHtml(source.evidenceType)}</small>
          <p>${escapeHtml(source.whyItMatters)}</p>
        </div>
        <div class="registry-meta">
          <span>${escapeHtml(source.importStatus)}</span>
          <small>${escapeHtml(source.accessLevel)}</small>
          <a href="${source.url}" target="_blank" rel="noreferrer">Source</a>
        </div>
      </article>
    `).join("");
}

function renderAuditEvidenceMap() {
  const layers = getAuditEvidenceLayers();
  return `
    <div class="audit-equation">
      <strong>price</strong>
      <span>≠</span>
      <strong>payment</strong>
      <span>≠</span>
      <strong>cost</strong>
      <span>≠</span>
      <strong>margin</strong>
    </div>
    <div class="audit-layer-grid">
      ${layers.map((layer, index) => `
        <article class="audit-layer-card">
          <div class="audit-layer-head">
            <span>${index + 1}</span>
            <div>
              <strong>${escapeHtml(layer.title)}</strong>
              <small>${escapeHtml(layer.source)}</small>
            </div>
            <em class="status-dot status-${escapeHtml(layer.statusKey)}">${escapeHtml(layer.status)}</em>
          </div>
          <dl>
            <div>
              <dt>Can prove</dt>
              <dd>${escapeHtml(layer.proves)}</dd>
            </div>
            <div>
              <dt>Cannot prove alone</dt>
              <dd>${escapeHtml(layer.limits)}</dd>
            </div>
            <div>
              <dt>Current app connection</dt>
              <dd>${escapeHtml(layer.connection)}</dd>
            </div>
          </dl>
        </article>
      `).join("")}
    </div>
  `;
}

function getAuditEvidenceLayers() {
  const priceSourceCount = getPriceTransparencySources().length;
  const priceRecordCount = getPriceTransparencyRecords().length;
  const paymentRecordCount = getProviderPaymentRecords().length;
  const systemCount = Array.isArray(state.hospitalSystems) ? state.hospitalSystems.length : 0;

  return [
    {
      title: "Prices",
      source: "Hospital price transparency CSV",
      status: priceSourceCount ? (priceRecordCount ? "loaded" : "mapped") : "next",
      statusKey: priceSourceCount ? (priceRecordCount ? "loaded" : "partial") : "next",
      proves: "Public gross charges, cash prices, min/max negotiated-rate signals, and payer/plan price fields where the file is parsed.",
      limits: "Actual paid claims, Medicaid/Medicare payment, volume, denials, patient responsibility, medical necessity, or margin.",
      connection: priceRecordCount
        ? `${formatIntegerOrNA(priceRecordCount)} Taylorville examples parsed in Price Transparency.`
        : priceSourceCount
          ? `${formatIntegerOrNA(priceSourceCount)} machine-readable file mapped; click Query Price Files.`
          : "Map hospital machine-readable files."
    },
    {
      title: "Public Payer Payment",
      source: "Medicare/HFS payment and rate files",
      status: paymentRecordCount ? "loaded" : "scaffolded",
      statusKey: paymentRecordCount ? "loaded" : "partial",
      proves: "Reported public-payer payment totals, published rates, fee schedules, provider payments, and rule-based payer benchmarks.",
      limits: "Commercial contract terms, individual patient claims, full adjudication logic, denials, or cost of care.",
      connection: paymentRecordCount
        ? `${formatIntegerOrNA(paymentRecordCount)} HFS provider-payment records loaded.`
        : "Money Flow tab is scaffolded for HFS provider-level payment import."
    },
    {
      title: "Facility Economics",
      source: "Cost reports, revenue, expenses, beds, utilization",
      status: "next",
      statusKey: "next",
      proves: "Facility-level operating context such as revenue, expenses, utilization, beds, cost centers, wages, cost-to-charge, and occupancy when imported.",
      limits: "Exact service-line profitability, real-time cash position, private payer contracts, or system-level subsidy flows.",
      connection: "Next importer should attach CMS HCRIS and Illinois cost report fields to each hospital/facility."
    },
    {
      title: "System Financials",
      source: "Form 990, audited statements, bond disclosures",
      status: systemCount ? "mapped" : "next",
      statusKey: systemCount ? "partial" : "next",
      proves: "Parent/system revenue, expenses, executive compensation, community benefit, debt disclosures, consolidated statements, and related organizations.",
      limits: "Clean Taylorville-only margin unless the system discloses facility-level schedules or cost reports can bridge the gap.",
      connection: systemCount
        ? `${formatIntegerOrNA(systemCount)} system crosswalk seeded; Memorial Health is mapped for Taylorville.`
        : "Add IRS 990/audited-statement/bond disclosure sources."
    }
  ];
}

function renderMoneyFlow() {
  const records = getProviderPaymentRecords();
  const paidRecords = records.filter((record) => Number.isFinite(record.totalPaid));
  const totalPaid = sum(paidRecords.map((record) => record.totalPaid));
  const totalPatients = sum(records.map((record) => record.patientsServed));
  const years = [...new Set(records.map((record) => record.serviceYear).filter(Boolean))].sort();

  els.moneyFlowMetricCards.innerHTML = renderWorkforceMetricCards([
    ["Provider records", records.length],
    ["Total paid", formatCurrencyOrNA(totalPaid, 0)],
    ["Patients served", formatIntegerOrNA(totalPatients)],
    ["Service years", years.length ? `${years[0]}-${years.at(-1)}` : "Not imported"]
  ]);
  els.topPaidProviders.innerHTML = renderProviderPaymentRows(
    [...paidRecords].sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 20),
    "provider"
  );
  els.providerTypePayments.innerHTML = renderPaymentGroupRows(summarizePaymentsBy(records, (record) => record.providerType || "Unknown provider type"));
  els.countyPayments.innerHTML = renderPaymentGroupRows(summarizePaymentsBy(records, (record) => record.county || "Unknown county"));
  els.moneyFlowLimits.innerHTML = renderMoneyFlowLimits(records);
}

function getProviderPaymentRecords() {
  return Array.isArray(state.providerPayments)
    ? state.providerPayments
    : state.providerPayments.records || [];
}

function summarizePaymentsBy(records, getKey) {
  const groups = new Map();
  records.forEach((record) => {
    const key = getKey(record);
    if (!groups.has(key)) {
      groups.set(key, { key, records: 0, totalPaid: 0, patientsServed: 0 });
    }
    const group = groups.get(key);
    group.records += 1;
    group.totalPaid += Number.isFinite(record.totalPaid) ? record.totalPaid : 0;
    group.patientsServed += Number.isFinite(record.patientsServed) ? record.patientsServed : 0;
  });
  return [...groups.values()].sort((a, b) => b.totalPaid - a.totalPaid).slice(0, 20);
}

function renderProviderPaymentRows(records) {
  if (!records.length) {
    return '<p class="status">No HFS provider payment records imported yet. Download the provider-level CSV from HFS Transparency Law Data and run the importer.</p>';
  }
  return records.map((record) => `
    <article class="table-row compact">
      <div>
        <strong>${escapeHtml(record.providerName || "Unknown provider")}</strong>
        <small>${escapeHtml(record.providerType || "Unknown type")} / ${escapeHtml(record.county || "Unknown county")} / ${escapeHtml(record.serviceYear || "Unknown year")}</small>
      </div>
      <div class="numeric">${formatCurrencyOrNA(record.totalPaid, 0)} / ${formatIntegerOrNA(record.patientsServed)} patients</div>
    </article>
  `).join("");
}

function renderPaymentGroupRows(groups) {
  if (!groups.length) {
    return '<p class="status">No payment groups available yet.</p>';
  }
  return groups.map((group) => `
    <article class="table-row compact">
      <div>
        <strong>${escapeHtml(group.key)}</strong>
        <small>${formatIntegerOrNA(group.records)} provider records / ${formatIntegerOrNA(group.patientsServed)} patients served</small>
      </div>
      <div class="numeric">${formatCurrencyOrNA(group.totalPaid, 0)}</div>
    </article>
  `).join("");
}

function renderMoneyFlowLimits(records) {
  const items = records.length
    ? [
      "This is reported aggregate payment evidence, not patient-level claim detail.",
      "Managed care, medical necessity, denials, modifiers, and contract terms are not fully visible in this layer.",
      "Provider location may represent a primary address and may not capture every service location."
    ]
    : [
      "Import HFS provider-level payment data to show where Illinois Medicaid dollars flowed.",
      "The source is designed to disclose provider/vendor names, county, patients served, payments, average costs, adjustments, and total money received.",
      "Use this as Money Flow evidence; connect it later to fee schedules, cost reports, quality, and facility economics."
    ];
  return items.map((item) => `<div class="finding">${escapeHtml(item)}</div>`).join("");
}

function renderPriceTransparency() {
  const sources = getPriceTransparencySources();
  const records = getPriceTransparencyRecords();
  const facilities = new Set(sources.map((source) => source.facilityId || source.facilityName).filter(Boolean));
  const categories = summarizePriceTransparencyCategories(records);

  els.priceTransparencyMetricCards.innerHTML = renderWorkforceMetricCards([
    ["Tracked source files", sources.length],
    ["Facilities mapped", facilities.size],
    ["Preview rows parsed", records.length],
    ["Service categories found", categories.length]
  ]);
  els.priceTransparencySourceRows.innerHTML = renderPriceTransparencySourceRows(sources);
  els.priceTransparencyExampleRows.innerHTML = renderPriceTransparencyExampleRows(records);
  els.priceTransparencyLimitCards.innerHTML = renderPriceTransparencyLimits(sources);
}

function getPriceTransparencySources() {
  return Array.isArray(state.priceTransparencySources)
    ? state.priceTransparencySources
    : state.priceTransparencySources.records || [];
}

function getPriceTransparencyRecords() {
  return Array.isArray(state.priceTransparencyRecords) ? state.priceTransparencyRecords : [];
}

function renderPriceTransparencySourceRows(sources) {
  if (!sources.length) {
    return '<p class="status">No price transparency sources are mapped yet.</p>';
  }

  return sources.map((source) => `
    <article class="table-row compact">
      <div>
        <strong>${escapeHtml(source.facilityName || "Unknown facility")}</strong>
        <small>${escapeHtml(source.systemName || "Unknown system")} / ${escapeHtml(source.updatedAsOf || "Unknown update date")} / ${escapeHtml(source.fileFormat || "unknown format")}</small>
        <small>${escapeHtml(source.sourceNote || "")}</small>
      </div>
      <div class="source-actions">
        <a href="${escapeHtml(source.priceTransparencyPageUrl)}" target="_blank" rel="noreferrer">Page</a>
        <a href="${escapeHtml(source.machineReadableFileUrl)}" target="_blank" rel="noreferrer">CSV</a>
      </div>
    </article>
  `).join("");
}

function renderPriceTransparencyExampleRows(records) {
  if (!records.length) {
    return '<p class="status">Click Query Price Files to preview Memorial Health standard-charge rows. Browser security may block direct CSV reading; source links remain available for manual download or future server-side import.</p>';
  }

  const rows = records.slice(0, 80).map((record) => `
    <article class="table-row price-example-row">
      <div>
        <strong>${escapeHtml(record.description || "Unknown item/service")}</strong>
        <small>${escapeHtml(record.category)} / ${escapeHtml(record.code || "No code found")} / ${escapeHtml(record.setting || "Unknown setting")}</small>
      </div>
      <div>${escapeHtml(record.chargeType || "Price field")}</div>
      <div class="numeric">${formatCurrencyOrNA(record.amount)}</div>
      <div>${escapeHtml(record.payer || "N/A")}</div>
    </article>
  `).join("");

  return `
    <article class="table-row price-example-row header">
      <div>Service / Code</div>
      <div>Charge Type</div>
      <div class="numeric">Amount</div>
      <div>Payer</div>
    </article>
    ${rows}
  `;
}

function summarizePriceTransparencyCategories(records) {
  const counts = new Map();
  records.forEach((record) => counts.set(record.category, (counts.get(record.category) || 0) + 1));
  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function renderPriceTransparencyLimits(sources) {
  const items = [
    sources[0]?.sourceNote || "Machine-readable files are a price transparency source, not claim-level reimbursement evidence.",
    "Traditional Medicare and Medicaid may be excluded from Memorial Health's file, so HFS and CMS reimbursement rules still need separate imports.",
    "Negotiated rates can be percent-of-charge, per diem, DRG/APR-DRG, APC/EAPG, fee schedule, or other contract logic, so a row may not equal a final expected payment.",
    "This layer should be tied to service examples, payer names, code systems, and observation dates before being used in finance conclusions."
  ];

  return items.map((item) => `<div class="finding">${escapeHtml(item)}</div>`).join("");
}

async function queryPriceTransparencyData() {
  const sources = getPriceTransparencySources();
  els.queryPriceTransparencyButton.disabled = true;
  state.priceTransparencyRecords = [];

  try {
    if (!sources.length) {
      els.priceTransparencyStatus.textContent = "No price transparency source files are mapped yet.";
      renderPriceTransparency();
      return;
    }

    try {
      els.priceTransparencyStatus.textContent = "Asking local app server to query price transparency files...";
      const response = await fetch("/api/query-price-transparency");
      if (response.ok) {
        const payload = await response.json();
        state.priceTransparencySources = payload.sources || sources;
        state.priceTransparencyRecords = payload.records || [];
        els.priceTransparencyStatus.textContent = payload.status || `Server parsed ${formatIntegerOrNA(state.priceTransparencyRecords.length)} service examples.`;
        renderPriceTransparency();
        renderAuditFramework();
        return;
      }
    } catch {
      // Fall back to browser-side preview below when the local API is unavailable.
    }

    const collected = [];
    for (const source of sources) {
      els.priceTransparencyStatus.textContent = `Querying ${source.facilityName}: reading CSV preview...`;
      try {
        const previewText = await fetchTextPreview(source.machineReadableFileUrl, 900000);
        const rows = parseCsvPreview(previewText, 2000);
        collected.push(...extractPriceTransparencyExamples(rows, source));
        els.priceTransparencyStatus.textContent = `Loaded ${formatIntegerOrNA(rows.length)} preview rows from ${source.facilityName}; captured ${formatIntegerOrNA(collected.length)} service examples.`;
      } catch (error) {
        els.priceTransparencyStatus.textContent = `Could not read the CSV directly from the browser (${error.message}). Source links are loaded; a server-side importer can parse the full file next.`;
      }
    }

    state.priceTransparencyRecords = collected;
    renderPriceTransparency();
    renderAuditFramework();
  } finally {
    els.queryPriceTransparencyButton.disabled = false;
  }
}

async function fetchTextPreview(url, maxBytes = 900000) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  if (!response.body?.getReader) return (await response.text()).slice(0, maxBytes);

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let received = "";
  while (received.length < maxBytes) {
    const { done, value } = await reader.read();
    if (done) break;
    received += decoder.decode(value, { stream: true });
  }
  await reader.cancel().catch(() => {});
  return received;
}

function parseCsvPreview(text, maxRows = 2000) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];
    if (char === '"' && inQuotes && next === '"') {
      field += '"';
      i += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") i += 1;
      row.push(field);
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      field = "";
      if (rows.length >= maxRows) break;
    } else {
      field += char;
    }
  }

  if (rows.length < maxRows && (field || row.length)) {
    row.push(field);
    rows.push(row);
  }

  if (rows.length < 2) return [];
  const headerIndex = rows.findIndex((candidate) => {
    const normalized = candidate.map((header) => normalizeHeader(header));
    return normalized.includes("description") && normalized.some((header) => header.includes("standard_charge"));
  });
  const headers = rows[Math.max(headerIndex, 0)].map((header) => normalizeHeader(header));
  return rows.slice(Math.max(headerIndex, 0) + 1).map((values) => Object.fromEntries(headers.map((header, index) => [header || `column_${index}`, values[index] || ""])));
}

function extractPriceTransparencyExamples(rows, source) {
  const examples = [];
  const seen = new Set();
  rows.forEach((row) => {
    const description = getFirstField(row, ["description", "item_description", "service_description", "billing_description", "standard_charge_description", "line_item"]);
    const code = getFirstField(row, ["code", "code_1", "code_2", "billing_code", "hcpcs_cpt", "cpt_hcpcs", "ms_drg", "apr_drg", "drg", "revenue_code"]);
    const setting = getFirstField(row, ["setting", "patient_type", "inpatient_outpatient", "service_setting"]);
    const billingClass = getFirstField(row, ["billing_class", "billing_classification"]);
    const haystack = `${description} ${code} ${setting} ${billingClass}`.toLowerCase();
    const category = classifyPriceTransparencyRow(haystack);
    if (!category) return;

    const amount = getPriceAmount(row);
    const payer = getFirstField(row, ["payer", "payer_name", "plan", "plan_name", "third_party_payer_name"]);
    const chargeType = getChargeType(row);
    const key = `${category}|${description}|${code}|${chargeType}|${amount}|${payer}`;
    if (seen.has(key)) return;
    seen.add(key);
    examples.push({
      facilityId: source.facilityId,
      facilityName: source.facilityName,
      category,
      description: description || "Matched price transparency row",
      code,
      amount,
      payer,
      chargeType,
      setting
    });
  });

  return examples.sort((a, b) => a.category.localeCompare(b.category) || (b.amount || 0) - (a.amount || 0)).slice(0, 120);
}

function classifyPriceTransparencyRow(text) {
  if (/\b(emergency|ed visit|emerg dept|9928[1-5])\b/.test(text)) return "Emergency";
  if (/\b(observation|obs)\b/.test(text)) return "Observation";
  if (/\b(ct |computed tomography|mri|xray|x-ray|ultrasound|mammography|radiology|imaging)\b/.test(text)) return "Imaging";
  if (/\b(lab|laboratory|metabolic|blood count|cbc|troponin|culture|panel)\b/.test(text)) return "Lab";
  if (/\b(pharmacy|drug|injection|infusion|j[0-9]{4}|ndc)\b/.test(text)) return "Drug/Pharmacy";
  if (/\b(drg|apr-drg|apr drg|ms-drg|inpatient)\b/.test(text)) return "Inpatient/DRG";
  return null;
}

function getFirstField(row, names) {
  for (const name of names) {
    const value = row[normalizeHeader(name)];
    if (value !== undefined && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

function getPriceAmount(row) {
  const keys = Object.keys(row);
  const preferred = keys.find((key) => /cash|gross|negotiated|standard|charge|rate|price|amount/.test(key));
  return toNumberOrNull(preferred ? row[preferred] : "");
}

function getChargeType(row) {
  const keys = Object.keys(row);
  const preferred = keys.find((key) => /cash|gross|negotiated|standard|charge|rate|price|amount/.test(key));
  return preferred ? titleCase(preferred.replace(/_/g, " ")) : "Price field";
}

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function renderGeography() {
  const records = getFilteredRecords().filter((record) => Number.isFinite(record.publishedAmount));
  const tierGroups = summarizeBy(records, (record) => record.geography?.tier || "Unclassified");
  const hsaGroups = summarizeBy(records, (record) => {
    const name = record.geography?.hsaName || "Unknown HSA";
    const region = record.geography?.region || "Unknown region";
    return `${name}|${region}`;
  });

  els.tierRows.innerHTML = renderComparisonRows(tierGroups, true);
  els.hsaRows.innerHTML = renderComparisonRows(hsaGroups, false);
  els.geographyCommentary.textContent = buildGeographyCommentary(tierGroups);
}

function renderAnalysis() {
  const records = getFilteredRecords().filter((record) => Number.isFinite(record.publishedAmount));
  els.componentRows.innerHTML = renderComponentRows(records);
  els.topFacilities.innerHTML = renderFacilityRows(records, "desc");
  els.bottomFacilities.innerHTML = renderFacilityRows(records, "asc");
  els.findingList.innerHTML = renderFindings(records);
}

function renderCapitalEquity() {
  const records = getCapitalRecords();
  const geographyGroups = summarizeCapitalByGeography(records);
  const lowest = getCapitalRankedFacilities(records, "asc", 10);
  const highest = getCapitalRankedFacilities(records, "desc", 10);
  const watchlist = getCapitalWatchlist(records);

  els.capitalFindingList.innerHTML = renderCapitalFindings(geographyGroups, watchlist);
  els.capitalGeographyRows.innerHTML = renderCapitalGeographyRows(geographyGroups);
  els.lowestCapitalRows.innerHTML = renderCapitalFacilityRows(lowest);
  els.highestCapitalRows.innerHTML = renderCapitalFacilityRows(highest);
  els.capitalWatchlistRows.innerHTML = renderCapitalWatchlistRows(watchlist);
}

function renderQualityCorrelation() {
  const records = getFilteredQualityRecords();
  const lowCapitalLowStaffing = getLowCapitalLowStaffing(records);
  const highRateLowQuality = getHighRateLowQuality(records);

  els.qualityFindingList.innerHTML = renderQualityFindings(records, lowCapitalLowStaffing, highRateLowQuality);
  els.overallRatingRows.innerHTML = renderRatingRows(
    summarizeByRating(records, (record) => record.quality?.overallStarRating, (record) => record.publishedAmount),
    "Overall Stars",
    "Avg Total Rate"
  );
  els.staffingRatingRows.innerHTML = renderRatingRows(
    summarizeByRating(records, (record) => record.quality?.staffingStarRating, (record) => record.components?.capitalRate),
    "Staffing Stars",
    "Avg Capital"
  );
  els.lowCapitalLowStaffingRows.innerHTML = renderQualityFacilityRows(lowCapitalLowStaffing, "staffing");
  els.highRateLowQualityRows.innerHTML = renderQualityFacilityRows(highRateLowQuality, "overall");
}

function renderExecutiveSummary() {
  const records = getFilteredRecords().filter((record) => Number.isFinite(record.publishedAmount));
  const qualityRecords = getFilteredQualityRecords();
  const tierGroups = summarizeBy(records, (record) => record.geography?.tier || "Unclassified");
  const classifiedTierGroups = tierGroups.filter((group) => group.key !== "Unclassified");
  const missingGeographyGroup = tierGroups.find((group) => group.key === "Unclassified") || null;
  const capitalGroups = summarizeCapitalByGeography(getCapitalRecords());
  const lowCapitalLowStaffing = getLowCapitalLowStaffing(qualityRecords);
  const highRateLowQuality = getHighRateLowQuality(qualityRecords);
  const components = averageComponents(records);
  const lowestGeography = classifiedTierGroups[classifiedTierGroups.length - 1] || null;
  const highestGeography = classifiedTierGroups[0] || null;

  els.projectPurpose.textContent = "This tool analyzes Illinois nursing facility Medicaid reimbursement, geographic reimbursement patterns, capital reimbursement components, and CMS Care Compare quality data to identify possible healthcare disparity signals, infrastructure-risk patterns, and planning questions for long-term care leaders.";
  els.executiveMetricCards.innerHTML = renderExecutiveMetricCards({
    totalRecords: state.records.filter((record) => Number.isFinite(record.publishedAmount)).length,
    matchedRecords: state.qualityRecords.length,
    averageTotal: average(records.map((record) => record.publishedAmount).filter((value) => Number.isFinite(value))),
    averageNursing: components.nursingRate,
    averageSupport: components.supportRate,
    averageCapital: components.capitalRate,
    lowestGeography,
    highestGeography,
    missingGeographyGroup
  });
  els.executiveFindings.innerHTML = renderExecutiveFindings({
    records,
    tierGroups: classifiedTierGroups,
    missingGeographyGroup,
    capitalGroups,
    lowCapitalLowStaffing,
    highRateLowQuality
  });
  els.strategicImplications.innerHTML = renderStrategyItems([
    ["Long-term care equity", "Geographic and quality-linked reimbursement patterns can help identify where resident access and facility resources may be uneven."],
    ["Rural healthcare access", "Downstate and smaller-market facilities can be monitored for lower reimbursement levels, limited staffing capacity, and infrastructure pressure."],
    ["Capital planning", "Capital-rate variation can guide deeper review of modernization needs, physical plant age, and deferred-maintenance exposure."],
    ["Staffing pressure", "Combining staffing ratings with per-diem components helps separate workforce concerns from facility infrastructure concerns."],
    ["Reimbursement policy", "Rate differences by geography and component may support targeted policy review rather than one-size-fits-all reimbursement assumptions."],
    ["Quality improvement", "Outlier lists can help prioritize facilities for validation, outreach, quality support, or operational review."]
  ]);
  els.recommendedActions.innerHTML = renderStrategyItems([
    ["Validate unmatched facilities", "Review CMS/HFS name matching and add manual crosswalks for facilities that fuzzy matching missed."],
    ["Add rurality and income data", "Layer county, ZIP, RUCA, broadband, poverty, and median income data onto each facility."],
    ["Trend quality and staffing", "Compare reimbursement against CMS staffing and quality measures across multiple Care Compare releases."],
    ["Flag infrastructure risk", "Use bottom-quintile capital reimbursement as a starting screen for potential underinvestment risk."],
    ["Support capital planning", "Use findings to inform targeted capital planning, grant strategy, policy review, or facility outreach."],
    ["Document limitations", "Keep match confidence, missing-data rates, and non-causal language visible in the portfolio version."]
  ]);
}

function renderCountyContext() {
  const countySummaries = getFilteredCountySummaries();
  const riskFlags = buildCountyRiskFlags(countySummaries);
  const priorityCounties = getLookCloserCounties(countySummaries, riskFlags);
  const selectedCounty = countySummaries.find((county) => normalizeCountyName(county.county) === normalizeCountyName(state.selectedCountyName))
    || priorityCounties[0]
    || countySummaries[0]
    || null;
  state.selectedCountyName = selectedCounty ? selectedCounty.county : null;

  els.countyFindingList.innerHTML = renderCountyFindings(countySummaries, riskFlags);
  els.countyPriorityCards.innerHTML = renderLookCloserCountyCards(priorityCounties, riskFlags);
  els.countyDrilldown.innerHTML = renderCountyDrilldown(selectedCounty, riskFlags);
  els.countySummaryRows.innerHTML = renderCountySummaryRows(countySummaries);
  els.countyRiskRows.innerHTML = renderCountyRiskRows(riskFlags);
}

function renderFacilityRisk() {
  const facilities = getFilteredRiskFacilities();
  const selected = facilities.find((facility) => getFacilityRiskId(facility) === state.selectedRiskFacilityId) || facilities[0] || null;
  state.selectedRiskFacilityId = selected ? getFacilityRiskId(selected) : null;

  els.riskInsightCards.innerHTML = renderRiskInsights(facilities);
  els.illinoisRiskMap.innerHTML = renderIllinoisRiskMap(facilities);
  els.facilityDrilldown.innerHTML = renderFacilityDrilldown(selected);
  els.topRiskFacilities.innerHTML = renderTopRiskFacilityRows(facilities);
  els.riskDistribution.innerHTML = renderRiskDistribution(facilities);
  els.riskBreakdown.innerHTML = renderRiskBreakdown(selected);
  els.highestRiskCounties.innerHTML = renderHighestRiskCountyRows(facilities);
  els.riskByGeography.innerHTML = renderRiskByGeographyRows(facilities);
  els.riskReimbursementScatter.innerHTML = renderRiskScatter(facilities, "publishedAmount", "Per diem");
  els.riskStaffingScatter.innerHTML = renderRiskScatter(facilities, "staffing", "Staffing stars");
}

function renderChainAnalytics() {
  const chains = summarizeChains(getFilteredRiskFacilities());
  const selected = chains.find((chain) => chain.id === state.selectedChainId) || chains[0] || null;
  state.selectedChainId = selected ? selected.id : null;

  els.chainInsightCards.innerHTML = renderChainInsights(chains);
  els.chainSummaryRows.innerHTML = renderChainSummaryRows(chains);
  els.chainDrilldown.innerHTML = renderChainDrilldown(selected);
  els.chainWatchlistRows.innerHTML = renderChainWatchlistRows(chains);
  els.chainFacilityRows.innerHTML = renderChainFacilityRows(selected);
}

function renderHospitalIntelligence() {
  const hospitals = getFilteredHospitals();
  const selected = hospitals.find((hospital) => hospital.facilityId === state.selectedHospitalId) || hospitals[0] || null;
  state.selectedHospitalId = selected ? selected.facilityId : null;
  const countyGroups = summarizeHospitalsByCounty(hospitals);

  els.hospitalInsightCards.innerHTML = renderHospitalInsights(hospitals, countyGroups);
  els.hospitalMetricCards.innerHTML = renderHospitalMetricCards(hospitals, countyGroups);
  els.hospitalCountyRows.innerHTML = renderHospitalCountyRows(countyGroups);
  els.hospitalDrilldown.innerHTML = renderHospitalDrilldown(selected);
  scheduleAutomaticHfsPaymentQuery(selected);
  els.hospitalRiskRows.innerHTML = renderHospitalRiskRows(hospitals);
  els.hospitalRateValueRows.innerHTML = renderHospitalRateValueRows(hospitals);
  els.hospitalRoadmapCards.innerHTML = renderHospitalRoadmapCards();
}

function renderFacilityBinderPage() {
  const hospitals = getFilteredHospitals();
  const taylorville = hospitals.find((hospital) => String(hospital.facilityId) === "141339")
    || hospitals.find((hospital) => /TAYLORVILLE MEMORIAL/i.test(hospital.facilityName || ""));
  const selected = hospitals.find((hospital) => hospital.facilityId === state.selectedHospitalId) || taylorville || hospitals[0] || null;
  if (!selected) {
    els.binderSnapshotCards.innerHTML = "";
    els.binderEvidenceStack.innerHTML = '<p class="status">No hospital record is available for the evidence binder.</p>';
    els.binderServiceExamples.innerHTML = "";
    els.binderPaymentRows.innerHTML = "";
    els.binderCostReportRows.innerHTML = "";
    els.binderClinicalWorkbench.innerHTML = "";
    els.binderProofTasks.innerHTML = "";
    return;
  }

  const binder = getFacilityEvidenceBinder(selected);
  const priceRows = getPriceTransparencyRecords().filter((record) => String(record.facilityId) === String(selected.facilityId));
  const paymentRows = getProviderPaymentRowsForHospital(selected);
  const enrollmentContext = getHfsEnrollmentContextForHospital(selected);
  const costReport = getCostReportForHospital(selected);
  const rateSheet = selected.hfsRateSheet;
  const hfsPayment = selected.hfsPayment;

  els.binderSnapshotCards.innerHTML = renderBinderSnapshotCards(selected, binder, priceRows, paymentRows, enrollmentContext, costReport, rateSheet, hfsPayment);
  els.binderEvidenceStack.innerHTML = renderBinderEvidenceStack(selected, binder, priceRows, paymentRows, enrollmentContext, costReport, rateSheet, hfsPayment);
  els.binderServiceExamples.innerHTML = renderBinderServiceExampleRows(priceRows);
  els.binderPaymentRows.innerHTML = renderBinderPaymentEvidenceRows(paymentRows, rateSheet, hfsPayment);
  els.binderCostReportRows.innerHTML = renderBinderCostReportRows(selected, costReport);
  els.binderClinicalWorkbench.innerHTML = renderBinderClinicalWorkbench(selected, binder);
  els.binderProofTasks.innerHTML = renderBinderProofTasks(selected, binder, priceRows, paymentRows, enrollmentContext, costReport, rateSheet, hfsPayment);
}

function renderHospitalPaymentExplorer() {
  const hospitals = getFilteredHospitals().filter((hospital) => hospital.hfsPayment);
  const selected = hospitals.find((hospital) => hospital.facilityId === state.selectedHospitalId) || hospitals[0] || null;
  state.selectedHospitalId = selected ? selected.facilityId : state.selectedHospitalId;
  els.paymentExplorerFindings.innerHTML = renderPaymentExplorerFindings(hospitals, selected);
  els.paymentComparisonCards.innerHTML = renderPaymentComparisonCards(hospitals, selected);
  els.paymentHospitalRows.innerHTML = renderPaymentHospitalRows(hospitals);
  els.paymentDrilldown.innerHTML = renderPaymentDrilldown(selected, hospitals);
  els.paymentPeerRows.innerHTML = renderPaymentPeerRows(selected, hospitals);
  els.paymentDictionaryRows.innerHTML = renderPaymentDictionaryRows();
}

function renderMethodology() {
  const coverage = buildCoverageSummary();
  els.coverageMetricCards.innerHTML = renderCoverageMetricCards(coverage);
  els.coverageRows.innerHTML = renderCoverageRows(coverage.layers);
  els.methodologyNotes.innerHTML = renderMethodologyNotes();
  els.dataGapRows.innerHTML = renderDataGapRows();
  els.nextLayerCards.innerHTML = renderNextLayerCards();
}

function buildCoverageSummary() {
  const hfsRateRecords = state.records.filter((record) => Number.isFinite(record.publishedAmount));
  const nursingFacilityCount = new Set(hfsRateRecords.map((record) => `${record.facility}|${record.city}`)).size;
  const matchedCmsFacilities = state.qualityRecords.length;
  const countyCount = state.countySummaries.length || state.countyContext.length;
  const hospitalCount = state.hospitalRecords.length;
  const hospitalRateSheetCount = state.hospitalRateSheets.length;
  const matchedHospitalRateSheets = state.hospitalRateSheets.filter((sheet) => sheet.cmsFacilityId).length;
  const hospitalRateValueCount = state.hospitalRateValues.filter((sheet) => sheet.parseStatus === "parsed").length;
  const matchedHospitalRateValues = state.hospitalRateValues.filter((sheet) => sheet.parseStatus === "parsed" && sheet.cmsFacilityId).length;
  const chainCount = summarizeChains(getRiskFacilities()).filter((chain) => chain.count >= 2).length;
  const sourceCount = state.sources.length;
  return {
    hfsRateRecords,
    nursingFacilityCount,
    matchedCmsFacilities,
    countyCount,
    hospitalCount,
    hospitalRateSheetCount,
    matchedHospitalRateSheets,
    hospitalRateValueCount,
    matchedHospitalRateValues,
    chainCount,
    sourceCount,
    layers: [
      {
        layer: "Illinois HFS nursing facility rates",
        records: hfsRateRecords.length,
        coverage: `${nursingFacilityCount} facilities`,
        status: "Loaded",
        interpretation: "Facility-level Medicaid per-diem rate components: total, nursing, support, and capital."
      },
      {
        layer: "CMS nursing home quality match",
        records: matchedCmsFacilities,
        coverage: `${matchedCmsFacilities} matched HFS/CMS records`,
        status: "Loaded",
        interpretation: "Quality, staffing, ownership, chain, survey, penalties, and facility profile signals."
      },
      {
        layer: "County disparity context",
        records: countyCount,
        coverage: "Illinois county-level context",
        status: "Loaded",
        interpretation: "Rurality, income, poverty proxy, age 65+, uninsured, population, and access context."
      },
      {
        layer: "CMS hospital master / quality",
        records: hospitalCount,
        coverage: "Illinois Medicare-registered hospitals",
        status: "Loaded",
        interpretation: "Hospital type, ownership, emergency services, rating, and measure-group quality signals."
      },
      {
        layer: "Operator / chain rollups",
        records: chainCount,
        coverage: "Multi-facility CMS chain/operator groups",
        status: "Computed",
        interpretation: "Portfolio screening across average risk, staffing, capital, penalties, and geography."
      },
      {
        layer: "HFS hospital Medicaid rate sheets",
        records: hospitalRateSheetCount,
        coverage: `${matchedHospitalRateSheets} matched to CMS hospitals`,
        status: "Indexed",
        interpretation: "Current HFS hospital rate sheet PDFs are linked to hospitals where name matching is strong enough."
      },
      {
        layer: "HFS hospital payment parameters",
        records: hospitalRateValueCount,
        coverage: `${matchedHospitalRateValues} parsed records matched to CMS hospitals`,
        status: "Structured",
        interpretation: "PDF-extracted inpatient, outpatient, wage-index, CCR, and add-on parameters for exploratory reimbursement analysis."
      },
      {
        layer: "Hospital price transparency files",
        records: 0,
        coverage: "Selected hospital MRFs",
        status: "Next",
        interpretation: "Needed for gross charge, cash price, and payer negotiated-rate comparison."
      }
    ]
  };
}

function renderCoverageMetricCards(coverage) {
  const metrics = [
    ["Public sources", coverage.sourceCount],
    ["HFS rate records", coverage.hfsRateRecords.length],
    ["Nursing facilities", coverage.nursingFacilityCount],
    ["CMS/HFS matches", coverage.matchedCmsFacilities],
    ["County context rows", coverage.countyCount],
    ["Illinois hospitals", coverage.hospitalCount],
    ["HFS hospital rate sheets", coverage.hospitalRateSheetCount],
    ["Matched hospital sheets", coverage.matchedHospitalRateSheets],
    ["Parsed hospital rates", coverage.hospitalRateValueCount],
    ["Matched parsed rates", coverage.matchedHospitalRateValues],
    ["Multi-facility operators", coverage.chainCount],
    ["Pending price layers", 1]
  ];
  return metrics.map(([label, value]) => `
    <article class="metric-card">
      <span>${escapeHtml(value)}</span>
      <small>${escapeHtml(label)}</small>
    </article>
  `).join("");
}

function scheduleAutomaticHfsPaymentQuery(hospital) {
  if (!hospital || !getFacilityEvidenceBinder(hospital)) return;
  if (getProviderPaymentRowsForHospital(hospital).length) return;
  const facilityId = String(hospital.facilityId || "");
  if (!facilityId || state.hfsAutoQueryAttempts[facilityId]) return;
  state.hfsAutoQueryAttempts[facilityId] = true;
  Promise.resolve().then(() => queryHfsProviderPaymentsForHospital(facilityId, { automatic: true }));
}

function renderWorkforceDemand() {
  const records = getCareerRecords();
  const counted = records.filter((record) => Number.isFinite(record.jobOpeningCount));
  const linked = records.filter((record) => record.careerPageUrl);
  const totalOpenings = sum(counted.map((record) => record.jobOpeningCount));
  const observedDates = [...new Set(records.map((record) => record.observedDate).filter(Boolean))].sort();

  els.careersMetricCards.innerHTML = renderWorkforceMetricCards([
    ["Facilities tracked", records.length],
    ["Careers pages linked", linked.length],
    ["Open roles counted", formatIntegerOrNA(totalOpenings)],
    ["Latest observation", observedDates.at(-1) || "Not queried"]
  ]);
  els.careerLandscape.innerHTML = renderCareerMarketLandscape(records);
  els.careersRows.innerHTML = renderCareerRows(records);
  const selected = records.find((record) => getCareerFacilityId(record) === state.selectedCareerFacilityId) || records[0] || null;
  state.selectedCareerFacilityId = selected ? getCareerFacilityId(selected) : null;
  els.careerDrilldown.innerHTML = renderCareerDrilldown(selected);
}

function getCareerRecords() {
  return Array.isArray(state.facilityCareers)
    ? state.facilityCareers
    : state.facilityCareers.records || [];
}

function renderWorkforceMetricCards(cards) {
  return cards.map(([label, value]) => `
    <article class="metric-card">
      <span>${escapeHtml(value)}</span>
      <small>${escapeHtml(label)}</small>
    </article>
  `).join("");
}

function renderCoverageRows(layers) {
  return layers.map((layer) => `
    <article class="table-row methodology-row">
      <div>
        <strong>${escapeHtml(layer.layer)}</strong>
        <small>${escapeHtml(layer.interpretation)}</small>
      </div>
      <div>${escapeHtml(layer.coverage)}</div>
      <div class="numeric">${escapeHtml(layer.records)}</div>
      <div><span class="tag">${escapeHtml(layer.status)}</span></div>
    </article>
  `).join("");
}

function renderMethodologyNotes() {
  const notes = [
    "Medicaid nursing facility rates are interpreted as per-resident-per-day reimbursement components, not actual spending or profitability.",
    "Capital rate is used as a proxy for capital funding pressure. It is not proof of deferred maintenance, modernization need, or ownership investment decisions.",
    "CMS quality, staffing, survey, and penalty fields are screening signals. They support prioritization, not causal conclusions.",
    "County social data provides context for disparity analysis, but county poverty, income, rurality, and age structure do not prove facility-level behavior.",
    "Hospital Intelligence now extracts structured HFS hospital payment parameters from public PDFs. These values are rate-sheet inputs, not claim-specific reimbursement guarantees."
  ];
  return notes.map((note) => `<div class="finding">${escapeHtml(note)}</div>`).join("");
}

function renderDataGapRows() {
  const gaps = [
    ["Pharmacy vendor / consultant pharmacist", "Not in CMS/HFS standard files", "Requires facility disclosures, contracts, inspection reports, or NPI/vendor matching."],
    ["True financial condition", "Not in current dashboard", "Requires cost reports, audited financials, ownership filings, bond disclosures, leases, or court records."],
    ["Hospital Medicaid reimbursement values", "Structured rate-sheet fields loaded", "HFS hospital PDF fields are parsed, but full payment estimates still require DRG/APC logic, claim context, payer rules, and validation."],
    ["Hospital negotiated prices", "Pending", "Add selected hospital machine-readable files and normalize payer, plan, CPT/HCPCS, DRG, cash price, and negotiated rate."],
    ["Facility ownership/control complexity", "Partially covered", "CMS chain name may not capture management agreements, real-estate ownership, leases, or private equity structures."],
    ["Longitudinal trends", "Pending", "Add multiple CMS/HFS releases to distinguish persistent signals from one-period variation."]
  ];
  return gaps.map(([gap, status, next]) => `
    <article class="table-row compact">
      <div>
        <strong>${escapeHtml(gap)}</strong>
        <small>${escapeHtml(next)}</small>
      </div>
      <div class="numeric">${escapeHtml(status)}</div>
    </article>
  `).join("");
}

function renderNextLayerCards() {
  const layers = [
    "Hospital payment model: validate HFS PDF extraction and translate rate-sheet parameters into scenario-based DRG, per-diem, and outpatient examples.",
    "Hospital Price Transparency parser: start with 5-10 Illinois hospitals and normalize shoppable services, CPT/HCPCS, DRGs, cash prices, and payer negotiated rates.",
    "Cost report and ownership intelligence: add cost reports, ownership changes, related-party/lease indicators, and operator-level finance signals.",
    "Longitudinal trend module: compare CMS quality, staffing, penalties, rates, and county context across multiple releases.",
    "Facility compare workflow: allow side-by-side comparison of nursing homes, chains, hospitals, counties, and data gaps."
  ];
  return layers.map((layer) => `<div class="finding">${escapeHtml(layer)}</div>`).join("");
}

function renderCareerRows(records) {
  if (!records.length) {
    return '<p class="status">No careers observations loaded yet. Use Query Careers Data to fetch public hospital website seeds or run the careers importer for deeper counts.</p>';
  }

  return records.slice(0, 100).map((record) => {
    const homepageLink = record.facilityHomepageUrl
      ? `<a href="${escapeHtml(record.facilityHomepageUrl)}" target="_blank" rel="noreferrer">Homepage</a>`
      : "No homepage";
    const careersLink = record.careerPageUrl
      ? `<a href="${escapeHtml(record.careerPageUrl)}" target="_blank" rel="noreferrer">Careers</a>`
      : "Not found";
    return `
      <article class="table-row careers-row" data-career-row="${escapeHtml(getCareerFacilityId(record))}">
        <div>
          <strong>${escapeHtml(record.facilityName || record.reportCardName || "Unknown facility")}</strong>
          <small>${escapeHtml(record.city || "Unknown city")} / ${escapeHtml(record.county || "Unknown county")} / ${escapeHtml(record.platform || "Unknown platform")}</small>
          <small>${homepageLink} / ${careersLink}</small>
        </div>
        <div class="numeric">${Number.isFinite(record.jobOpeningCount) ? formatIntegerOrNA(record.jobOpeningCount) : "Not counted"}</div>
        <div>${escapeHtml(record.confidence || "low")}</div>
        <div>${escapeHtml(record.observedDate || "N/A")}</div>
        <button class="mini-button" type="button" data-career-view="${escapeHtml(getCareerFacilityId(record))}">View Roles</button>
      </article>
    `;
  }).join("");
}

function renderCareerMarketLandscape(records) {
  const roles = records.flatMap((record) => (Array.isArray(record.roles) ? record.roles : []).map((role) => ({
    ...role,
    facilityName: record.facilityName || record.reportCardName || "Unknown facility",
    county: record.county || "Unknown county",
    platform: record.platform || "Unknown platform"
  })));
  const countedRecords = records.filter((record) => Number.isFinite(record.jobOpeningCount));
  const roleTotalsByCategory = summarizeCareerMarketItems(roles, (role) => role.category || "Other", "roles");
  const openRolesByFacility = summarizeCareerMarketItems(countedRecords, (record) => record.facilityName || record.reportCardName || "Unknown facility", "jobOpeningCount");
  const openRolesByCounty = summarizeCareerMarketItems(countedRecords, (record) => record.county || "Unknown county", "jobOpeningCount");
  const facilitiesByPlatform = summarizeCareerMarketItems(records.filter((record) => record.careerPageUrl), (record) => record.platform || "Unknown platform", "facilities");

  return `
    <div class="landscape-grid">
      <section>
        <h4>Roles by Category</h4>
        ${renderLandscapeBars(roleTotalsByCategory, "No role titles captured yet.")}
      </section>
      <section>
        <h4>Most Open Roles by Facility</h4>
        ${renderLandscapeBars(openRolesByFacility, "No static job counts captured yet.")}
      </section>
      <section>
        <h4>Open Roles by County</h4>
        ${renderLandscapeBars(openRolesByCounty, "No county-level job counts captured yet.")}
      </section>
      <section>
        <h4>Hiring Platforms Found</h4>
        ${renderLandscapeBars(facilitiesByPlatform, "No careers platforms found yet.")}
      </section>
    </div>
  `;
}

function summarizeCareerMarketItems(items, getKey, valueKey) {
  const groups = new Map();
  items.forEach((item) => {
    const key = getKey(item);
    const increment = valueKey === "jobOpeningCount"
      ? item.jobOpeningCount
      : 1;
    if (!Number.isFinite(increment)) return;
    groups.set(key, (groups.get(key) || 0) + increment);
  });
  return [...groups.entries()]
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);
}

function renderLandscapeBars(groups, emptyText) {
  if (!groups.length) return `<p class="status">${escapeHtml(emptyText)}</p>`;
  const max = Math.max(...groups.map((group) => group.value), 1);
  return groups.map((group) => `
    <div class="landscape-bar">
      <div>
        <strong>${escapeHtml(group.label)}</strong>
        <small>${formatIntegerOrNA(group.value)}</small>
      </div>
      <span><i style="width: ${(group.value / max) * 100}%"></i></span>
    </div>
  `).join("");
}

function renderCareerDrilldown(record) {
  if (!record) return '<p class="status">Query careers data, then select a facility to view open-role categories.</p>';
  const roles = Array.isArray(record.roles) ? record.roles : [];
  const categories = summarizeRolesByCategory(roles);
  const categoryCards = Object.entries(categories).length
    ? Object.entries(categories).map(([category, items]) => `
      <article class="profile-metric">
        <span>${items.length}</span>
        <small>${escapeHtml(category)}</small>
      </article>
    `).join("")
    : '<p class="status">No role titles were extractable from the public static careers page. The careers page may require JavaScript or platform-specific API handling.</p>';
  const roleRows = roles.length
    ? roles.slice(0, 50).map((role) => `
      <article class="role-row">
        <div>
          <strong>${escapeHtml(role.title)}</strong>
          <small>${escapeHtml(role.category)}${role.location ? ` / ${escapeHtml(role.location)}` : ""}</small>
        </div>
        ${role.url ? `<a href="${escapeHtml(role.url)}" target="_blank" rel="noreferrer">Open</a>` : "<span></span>"}
      </article>
    `).join("")
    : "";

  return `
    <div class="profile-header">
      <div>
        <h3>${escapeHtml(record.facilityName || record.reportCardName || "Unknown facility")}</h3>
        <p>${escapeHtml(record.city || "Unknown city")} / ${escapeHtml(record.county || "Unknown county")} / ${escapeHtml(record.platform || "Unknown platform")}</p>
      </div>
      <span class="risk-pill risk-moderate">${Number.isFinite(record.jobOpeningCount) ? formatIntegerOrNA(record.jobOpeningCount) : "N/A"} roles</span>
    </div>
    <section class="profile-section">
      <h4>Role Categories</h4>
      <div class="profile-grid">${categoryCards}</div>
    </section>
    <section class="profile-section">
      <h4>Open Roles</h4>
      <div class="role-list">${roleRows || '<p class="status">No role titles captured yet.</p>'}</div>
      <p class="profile-note">${record.careerPageUrl ? `<a href="${escapeHtml(record.careerPageUrl)}" target="_blank" rel="noreferrer">Open careers page</a>. ` : ""}${escapeHtml(record.notes || "Role extraction depends on public page structure and may miss JavaScript-rendered postings.")}</p>
    </section>
  `;
}

function summarizeRolesByCategory(roles) {
  return roles.reduce((groups, role) => {
    const category = role.category || "Other";
    groups[category] = groups[category] || [];
    groups[category].push(role);
    return groups;
  }, {});
}

function getCareerFacilityId(record) {
  return String(record.facilityId || record.reportCardEntityId || record.facilityName || record.reportCardName || "").trim();
}

async function refreshCareersData() {
  els.careersStatus.textContent = "Querying public facility website data...";
  els.refreshCareersButton.disabled = true;
  try {
    const serverPayload = await fetchServerCareerObservations();
    if (serverPayload) {
      state.facilityCareers = serverPayload;
      const serverRecords = getCareerRecords();
      const counted = serverRecords.filter((record) => Number.isFinite(record.jobOpeningCount)).length;
      els.careersStatus.textContent = `Queried ${serverRecords.length} facility careers source${serverRecords.length === 1 ? "" : "s"} through the local server; ${counted} had static job counts.`;
    } else {
      const liveRecords = await fetchHospitalReportCardWebsiteSeeds();
      els.careersStatus.textContent = `Loaded ${liveRecords.length} hospital website seed${liveRecords.length === 1 ? "" : "s"}. Scanning public homepages for careers links and static job counts...`;
      renderWorkforceDemand();
      const scannedRecords = await scanCareersInBrowser(liveRecords);
      state.facilityCareers = {
        description: "Browser-side careers crawl from Hospital Report Card website seeds. Counts are labor-market signals, not proof of staffing levels or vacancy rates.",
        lastUpdated: new Date().toISOString().slice(0, 10),
        records: scannedRecords
      };
      const linked = scannedRecords.filter((record) => record.careerPageUrl).length;
      const counted = scannedRecords.filter((record) => Number.isFinite(record.jobOpeningCount)).length;
      els.careersStatus.textContent = `Scanned ${scannedRecords.length} hospital website seed${scannedRecords.length === 1 ? "" : "s"} in the browser; found ${linked} careers page${linked === 1 ? "" : "s"} and ${counted} static job count${counted === 1 ? "" : "s"}.`;
    }
  } catch (error) {
    state.facilityCareers = await fetchOptionalJson("data/facility-careers.json");
    const cachedRecords = getCareerRecords();
    els.careersStatus.textContent = cachedRecords.length
      ? `Live query failed, so loaded ${cachedRecords.length} cached careers observation${cachedRecords.length === 1 ? "" : "s"}. ${error.message}`
      : `Live query failed and no cached careers observations are available yet. ${error.message}`;
  } finally {
    els.refreshCareersButton.disabled = false;
    renderWorkforceDemand();
    renderHospitalIntelligence();
  }
}

async function fetchServerCareerObservations() {
  try {
    const response = await fetch("/api/query-careers?limit=25");
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

async function fetchHospitalReportCardWebsiteSeeds() {
  const records = [];
  let url = "https://healthcarereportcard.illinois.gov/api/hospitals?per_page=100";
  const seenUrls = new Set();

  while (url && !seenUrls.has(url) && records.length < 500) {
    seenUrls.add(url);
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Hospital Report Card request failed with status ${response.status}.`);
    const payload = await response.json();
    const hospitals = Array.isArray(payload) ? payload : payload.data || payload.hospitals || [];
    hospitals.forEach((hospital) => {
      const matched = state.hospitalRecords.find((record) => (
        String(record.facilityId || "") === String(hospital.mpn_id || "")
      ));
      records.push({
        facilityId: matched?.facilityId || String(hospital.mpn_id || ""),
        reportCardEntityId: hospital.entity_id,
        facilityName: matched?.facilityName || hospital.name,
        reportCardName: hospital.name,
        city: matched?.city || hospital.city,
        county: matched?.county || hospital.county_name,
        facilityHomepageUrl: normalizeUrl(hospital.website),
        careerPageUrl: null,
        platform: "Unknown",
        jobOpeningCount: null,
        countMethod: "not-counted",
        discoveryMethod: "website-seed",
        observedDate: new Date().toISOString().slice(0, 10),
        source: "Illinois Hospital Report Card API",
        sourceUrl: "https://healthcarereportcard.illinois.gov/api/docs/hospitals",
        confidence: hospital.website ? "medium" : "low",
        notes: hospital.website
          ? "Website seed loaded from Hospital Report Card. Careers page discovery requires server-side fetch or importer run."
          : "Hospital Report Card did not include a website."
      });
    });
    url = payload.next_page_url || null;
  }

  return records;
}

function normalizeUrl(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  return /^https?:\/\//i.test(text) ? text : `https://${text}`;
}

async function scanCareersInBrowser(records) {
  const scanned = [];
  const concurrency = 4;
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < records.length) {
      const index = nextIndex;
      nextIndex += 1;
      const record = records[index];
      const observation = await enrichCareerRecordInBrowser(record);
      scanned[index] = observation;

      if ((index + 1) % 10 === 0 || index + 1 === records.length) {
        const linked = scanned.filter((item) => item?.careerPageUrl).length;
        const counted = scanned.filter((item) => Number.isFinite(item?.jobOpeningCount)).length;
        els.careersStatus.textContent = `Scanning careers pages ${index + 1}/${records.length}: ${linked} links found, ${counted} counts captured.`;
        state.facilityCareers = {
          description: "Partial browser-side careers crawl in progress.",
          lastUpdated: new Date().toISOString().slice(0, 10),
          records: scanned.filter(Boolean)
        };
        renderWorkforceDemand();
      }
    }
  }

  await Promise.all(Array.from({ length: concurrency }, worker));
  return scanned.filter(Boolean);
}

async function enrichCareerRecordInBrowser(record) {
  const observedDate = new Date().toISOString().slice(0, 10);
  if (!record.facilityHomepageUrl) {
    return {
      ...record,
      observedDate,
      confidence: "low",
      notes: "Hospital Report Card did not include a website."
    };
  }

  const discovery = await discoverCareersInBrowser(record.facilityHomepageUrl);
  const count = await countCareersInBrowser(discovery.careerPageUrl);

  return {
    ...record,
    careerPageUrl: discovery.careerPageUrl,
    platform: platformForCareersUrl(discovery.careerPageUrl),
    jobOpeningCount: count.jobOpeningCount,
    roles: count.roles || [],
    countMethod: count.countMethod,
    discoveryMethod: discovery.discoveryMethod,
    observedDate,
    source: "Illinois Hospital Report Card API plus browser-side public careers crawl",
    sourceUrl: discovery.careerPageUrl || record.facilityHomepageUrl,
    confidence: count.jobOpeningCount === null ? (discovery.careerPageUrl ? "medium" : "low") : "medium",
    notes: [discovery.notes, count.notes].filter(Boolean).join("; ")
  };
}

async function discoverCareersInBrowser(homepageUrl) {
  const htmlResult = await fetchPublicPageText(homepageUrl);
  if (!htmlResult.ok) {
    return {
      careerPageUrl: null,
      discoveryMethod: "homepage-fetch-failed",
      notes: htmlResult.error
    };
  }

  const ranked = extractLinks(htmlResult.text, homepageUrl)
    .map((link) => ({ score: scoreCareerLink(link), link }))
    .sort((a, b) => b.score - a.score);
  if (ranked[0]?.score > 0) {
    return {
      careerPageUrl: ranked[0].link.href,
      discoveryMethod: "homepage-link",
      notes: htmlResult.viaProxy ? "Homepage read through public CORS proxy." : ""
    };
  }

  for (const suffix of ["/careers", "/career", "/jobs", "/employment"]) {
    const candidate = new URL(suffix, `${homepageUrl}/`).href;
    const candidateResult = await fetchPublicPageText(candidate);
    if (candidateResult.ok) {
      return {
        careerPageUrl: candidate,
        discoveryMethod: "guessed-path",
        notes: candidateResult.viaProxy ? "Careers path read through public CORS proxy." : ""
      };
    }
  }

  return {
    careerPageUrl: null,
    discoveryMethod: "not-found",
    notes: "No careers link or common careers path found in static homepage HTML."
  };
}

async function countCareersInBrowser(careerPageUrl) {
  if (!careerPageUrl) {
    return {
      jobOpeningCount: null,
      countMethod: "not-counted",
      roles: [],
      notes: "No careers URL available."
    };
  }

  const htmlResult = await fetchPublicPageText(careerPageUrl);
  if (!htmlResult.ok) {
    return {
      jobOpeningCount: null,
      countMethod: "careers-fetch-failed",
      roles: [],
      notes: htmlResult.error
    };
  }

  return {
    ...extractJobCountFromHtml(htmlResult.text, htmlResult.viaProxy),
    roles: extractRolesFromHtml(htmlResult.text, careerPageUrl)
  };
}

async function fetchPublicPageText(url) {
  const direct = await fetchWithTimeout(url);
  if (direct.ok) return direct;

  const proxiedUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
  const proxied = await fetchWithTimeout(proxiedUrl);
  if (proxied.ok) {
    return {
      ok: true,
      text: proxied.text,
      viaProxy: true
    };
  }

  return {
    ok: false,
    error: `Fetch blocked or failed. Direct: ${direct.error}; proxy: ${proxied.error}`
  };
}

async function fetchWithTimeout(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      redirect: "follow"
    });
    if (!response.ok) {
      return {
        ok: false,
        error: `HTTP ${response.status}`
      };
    }
    return {
      ok: true,
      text: await response.text(),
      viaProxy: false
    };
  } catch (error) {
    return {
      ok: false,
      error: error.message || String(error)
    };
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function extractLinks(html, baseUrl) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const seen = new Set();
  return [...document.querySelectorAll("a[href]")]
    .map((link) => {
      try {
        return {
          href: new URL(link.getAttribute("href"), baseUrl).href,
          text: link.textContent.trim()
        };
      } catch {
        return null;
      }
    })
    .filter((link) => {
      if (!link || seen.has(link.href)) return false;
      seen.add(link.href);
      return true;
    });
}

function scoreCareerLink(link) {
  const haystack = `${link.text} ${link.href}`.toLowerCase();
  let score = 0;
  ["career", "careers", "employment", "jobs", "job openings", "join our team", "work with us", "opportunities"].forEach((keyword) => {
    if (haystack.includes(keyword)) score += ["careers", "employment", "jobs"].includes(keyword) ? 5 : 3;
  });
  Object.keys(careerPlatformHints()).forEach((domain) => {
    if (haystack.includes(domain)) score += 8;
  });
  if (haystack.includes("volunteer")) score -= 4;
  if (haystack.includes("provider directory")) score -= 3;
  return score;
}

function platformForCareersUrl(url) {
  if (!url) return "Unknown";
  const lowered = url.toLowerCase();
  const hints = careerPlatformHints();
  const matched = Object.keys(hints).find((domain) => lowered.includes(domain));
  return matched ? hints[matched] : "Facility website";
}

function careerPlatformHints() {
  return {
    "myworkdayjobs.com": "Workday",
    "myworkdaysite.com": "Workday",
    "icims.com": "iCIMS",
    "oraclecloud.com": "Oracle Recruiting",
    "taleo.net": "Oracle Taleo",
    "ultipro.com": "UKG",
    "ukg.com": "UKG",
    "greenhouse.io": "Greenhouse",
    "lever.co": "Lever",
    "smartrecruiters.com": "SmartRecruiters",
    "successfactors": "SAP SuccessFactors",
    "healthcaresource.com": "HealthcareSource",
    "symplr.com": "symplr"
  };
}

function extractJobCountFromHtml(html, viaProxy) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const patterns = [
    /(\d{1,5})\s+(?:open\s+)?(?:jobs|positions|openings|opportunities|results)/i,
    /(?:jobs|positions|openings|opportunities|results)\s+\(?(\d{1,5})\)?/i,
    /showing\s+\d+\s*[-–]\s*\d+\s+of\s+(\d{1,5})/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return {
        jobOpeningCount: Number(match[1]),
        countMethod: "page-text-count",
        notes: `${viaProxy ? "Careers page read through public CORS proxy. " : ""}Matched count text in static page.`
      };
    }
  }

  const jobLinks = new Set(
    [...html.matchAll(/href=["']([^"']*(?:job|career|requisition|opening)[^"']*)["']/gi)]
      .map((match) => match[1])
      .filter((href) => !/privacy|terms|login|talent|alert|benefit/i.test(href))
  );
  if (jobLinks.size) {
    return {
      jobOpeningCount: jobLinks.size,
      countMethod: "job-link-count",
      notes: `${viaProxy ? "Careers page read through public CORS proxy. " : ""}Counted unique job-like links in static HTML.`
    };
  }

  return {
    jobOpeningCount: null,
    countMethod: "not-counted",
    notes: "No reliable static job count found; page may require JavaScript or a platform-specific API."
  };
}

function extractRolesFromHtml(html, baseUrl) {
  const document = new DOMParser().parseFromString(html, "text/html");
  const candidates = [];
  const seenTitles = new Set();
  const selectors = [
    "a[href*='job']",
    "a[href*='career']",
    "a[href*='requisition']",
    "a[href*='opening']",
    "[class*='job'] a",
    "[class*='career'] a",
    "[data-testid*='job']"
  ];

  selectors.forEach((selector) => {
    document.querySelectorAll(selector).forEach((element) => {
      const title = cleanRoleTitle(element.textContent);
      if (!isLikelyRoleTitle(title) || seenTitles.has(title.toLowerCase())) return;
      seenTitles.add(title.toLowerCase());
      candidates.push({
        title,
        category: categorizeRoleTitle(title),
        location: extractNearbyLocation(element),
        url: extractRoleUrl(element, baseUrl)
      });
    });
  });

  return candidates.slice(0, 200);
}

function cleanRoleTitle(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\b(apply|view job|learn more|read more|details|job details)\b/ig, "")
    .trim();
}

function isLikelyRoleTitle(title) {
  if (!title || title.length < 4 || title.length > 120) return false;
  if (/^(careers?|jobs?|employment|apply|search|submit|login|privacy|terms|benefits?)$/i.test(title)) return false;
  return /nurse|rn|lpn|cna|pharmac|tech|therap|evs|housekeep|clean|cook|diet|food|business|billing|coding|revenue|admin|clerk|registr|lab|imaging|rad|respiratory|security|social|case|surg|medical|patient|assistant|manager|director|coordinator|specialist|analyst/i.test(title);
}

function categorizeRoleTitle(title) {
  const text = title.toLowerCase();
  if (/\b(rn|registered nurse|nurse|lpn|cna|patient care|care partner|nursing assistant|scrub)\b/.test(text)) return "Nursing";
  if (/pharmac|rx|sterile compounding/.test(text)) return "Pharmacy";
  if (/evs|environmental|housekeep|janitor|clean|laundry|floor tech/.test(text)) return "EVS";
  if (/business|billing|coding|revenue|finance|account|admin|office|clerk|registr|scheduler|customer service|hr|human resources|analyst/.test(text)) return "Business/Admin";
  if (/therap|physical therapy|occupational therapy|speech|rehab/.test(text)) return "Therapy/Rehab";
  if (/imaging|radiology|x-ray|ct|mri|ultrasound|mammography/.test(text)) return "Imaging";
  if (/lab|laboratory|phlebotom|pathology/.test(text)) return "Lab";
  if (/respiratory|rt\b/.test(text)) return "Respiratory";
  if (/food|diet|nutrition|cook|cafeteria/.test(text)) return "Food/Nutrition";
  if (/security|public safety/.test(text)) return "Security";
  if (/physician|provider|advanced practice|np\b|pa\b/.test(text)) return "Provider";
  return "Other";
}

function extractNearbyLocation(element) {
  const container = element.closest("li, article, tr, div") || element.parentElement;
  const text = container ? container.textContent.replace(/\s+/g, " ") : "";
  const match = text.match(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?),\s*(IL|Illinois)\b/);
  return match ? match[0] : "";
}

function extractRoleUrl(element, baseUrl) {
  const hrefElement = element.matches("a[href]") ? element : element.closest("a[href]");
  if (!hrefElement) return null;
  try {
    return new URL(hrefElement.getAttribute("href"), baseUrl).href;
  } catch {
    return null;
  }
}

function getFilteredHospitals() {
  const query = state.query.toLowerCase().trim();
  const countyByName = new Map(state.countySummaries.map((county) => [normalizeCountyName(county.county), county]));
  const rateSheetByCmsId = new Map(
    state.hospitalRateSheets
      .filter((sheet) => sheet.cmsFacilityId)
      .map((sheet) => [String(sheet.cmsFacilityId), sheet])
  );
  const paymentByCmsId = new Map(
    state.hospitalRateValues
      .filter((sheet) => sheet.cmsFacilityId && sheet.parseStatus === "parsed")
      .map((sheet) => [String(sheet.cmsFacilityId), sheet])
  );
  const paymentByHfsProviderId = new Map(
    state.hospitalRateValues
      .filter((sheet) => sheet.hfsProviderId && sheet.parseStatus === "parsed")
      .map((sheet) => [String(sheet.hfsProviderId), sheet])
  );
  return state.hospitalRecords
    .map((hospital) => {
      const hfsRateSheet = rateSheetByCmsId.get(String(hospital.facilityId)) || null;
      return {
        ...hospital,
        countyContext: countyByName.get(normalizeCountyName(hospital.county)) || null,
        systemAffiliation: getHospitalSystemAffiliation(hospital),
        hfsRateSheet,
        hfsPayment: paymentByCmsId.get(String(hospital.facilityId)) || paymentByHfsProviderId.get(String(hfsRateSheet?.hfsProviderId)) || null
      };
    })
    .filter((hospital) => {
      const haystack = [
        hospital.facilityName,
        hospital.city,
        hospital.county,
        hospital.hospitalType,
        hospital.hospitalOwnership,
        hospital.systemAffiliation?.systemName,
        hospital.emergencyServices,
        hospital.hfsRateSheet?.hfsProviderId,
        hospital.hfsRateSheet?.hospitalName,
        hospital.hfsPayment?.paymentFields?.medicareId,
        hospital.hfsPayment?.paymentFields?.legacyMedicaidId,
        hospital.countyContext?.ruralUrbanClassification
      ].join(" ").toLowerCase();
      return !query || haystack.includes(query);
    })
    .sort((a, b) => hospitalPriorityScore(b) - hospitalPriorityScore(a));
}

function hospitalPriorityScore(hospital) {
  let score = 0;
  if (Number.isFinite(hospital.overallRating) && hospital.overallRating <= 2) score += 25;
  if (hospital.emergencyServices !== "Yes") score += 12;
  if (hospital.hospitalType === "Critical Access Hospitals") score += 10;
  if (hospital.countyContext?.ruralUrbanClassification === "Rural") score += 12;
  if (hospital.countyContext?.povertyRate >= 0.2) score += 10;
  if (hospital.safetyWorse > 0) score += 8;
  if (hospital.readmissionWorse > 0) score += 8;
  if (hospital.mortalityWorse > 0) score += 8;
  return score;
}

function summarizeHospitalsByCounty(hospitals) {
  const groups = new Map();
  hospitals.forEach((hospital) => {
    const key = normalizeCountyName(hospital.county) || "UNKNOWN";
    if (!groups.has(key)) {
      groups.set(key, {
        county: titleCase(key),
        hospitals: [],
        emergencyCount: 0,
        criticalAccessCount: 0,
        lowRatingCount: 0,
        totalRating: 0,
        ratedCount: 0,
        countyContext: hospital.countyContext
      });
    }
    const group = groups.get(key);
    group.hospitals.push(hospital);
    if (hospital.emergencyServices === "Yes") group.emergencyCount += 1;
    if (hospital.hospitalType === "Critical Access Hospitals") group.criticalAccessCount += 1;
    if (Number.isFinite(hospital.overallRating)) {
      group.totalRating += hospital.overallRating;
      group.ratedCount += 1;
      if (hospital.overallRating <= 2) group.lowRatingCount += 1;
    }
    if (!group.countyContext && hospital.countyContext) group.countyContext = hospital.countyContext;
  });
  return [...groups.values()]
    .map((group) => ({
      ...group,
      count: group.hospitals.length,
      averageRating: group.ratedCount ? group.totalRating / group.ratedCount : null,
      povertyRate: group.countyContext?.povertyRate,
      age65PlusPercent: group.countyContext?.age65PlusPercent,
      ruralUrbanClassification: group.countyContext?.ruralUrbanClassification || "Unknown"
    }))
    .sort((a, b) => {
      const riskSpread = hospitalCountyRiskScore(b) - hospitalCountyRiskScore(a);
      return riskSpread || b.count - a.count;
    });
}

function hospitalCountyRiskScore(group) {
  let score = 0;
  score += group.lowRatingCount * 12;
  score += group.emergencyCount === 0 ? 20 : 0;
  score += group.count <= 1 ? 8 : 0;
  score += group.ruralUrbanClassification === "Rural" ? 10 : 0;
  score += Number.isFinite(group.povertyRate) && group.povertyRate >= 0.2 ? 10 : 0;
  score += Number.isFinite(group.age65PlusPercent) && group.age65PlusPercent >= 0.2 ? 8 : 0;
  return score;
}

function renderHospitalInsights(hospitals, countyGroups) {
  if (!hospitals.length) return '<div class="finding">No Illinois hospital records match the current search.</div>';
  const lowRated = hospitals.filter((hospital) => Number.isFinite(hospital.overallRating) && hospital.overallRating <= 2);
  const criticalAccess = hospitals.filter((hospital) => hospital.hospitalType === "Critical Access Hospitals");
  const emergency = hospitals.filter((hospital) => hospital.emergencyServices === "Yes");
  const rateSheetMatches = hospitals.filter((hospital) => hospital.hfsRateSheet);
  const paymentMatches = hospitals.filter((hospital) => hospital.hfsPayment);
  const acuteDrgRates = paymentMatches
    .map((hospital) => hospital.hfsPayment?.paymentFields?.ipCos20AcuteDrgRate)
    .filter((value) => Number.isFinite(value));
  const highContextCounty = countyGroups[0];
  const findings = [
    `${hospitals.length} Illinois hospitals are available from CMS Hospital General Information in the current view.`,
    `${emergency.length} hospitals report emergency services, while ${criticalAccess.length} are Critical Access Hospitals, which can be important for rural access analysis.`,
    `${rateSheetMatches.length} hospitals in the current view have a matched 2026 HFS Medicaid hospital rate sheet PDF, and ${paymentMatches.length} have parsed HFS payment parameters.`,
    acuteDrgRates.length ? `Among hospitals with acute DRG rates available, the average HFS IP COS 20 Acute DRG Rate is ${formatCurrencyOrNA(average(acuteDrgRates))}. This is a rate-sheet parameter, not a full claim payment estimate.` : "Parsed acute DRG rate fields will populate where the HFS sheet includes acute inpatient payment parameters.",
    `${lowRated.length} hospitals have CMS overall ratings of 1-2 stars where ratings are available. This may indicate quality review priorities, not causal reimbursement conclusions.`,
    highContextCounty ? `${highContextCounty.county} County appears highest in the hospital access/context screen with ${highContextCounty.count} hospital record${highContextCounty.count === 1 ? "" : "s"}, ${highContextCounty.lowRatingCount} low-rated hospital${highContextCounty.lowRatingCount === 1 ? "" : "s"}, and ${highContextCounty.ruralUrbanClassification.toLowerCase()} county context.` : "County context will populate as hospital records match county data."
  ];
  return findings.map((finding) => `<div class="finding">${escapeHtml(finding)}</div>`).join("");
}

function renderHospitalMetricCards(hospitals, countyGroups) {
  const rated = hospitals.filter((hospital) => Number.isFinite(hospital.overallRating));
  const emergency = hospitals.filter((hospital) => hospital.emergencyServices === "Yes");
  const criticalAccess = hospitals.filter((hospital) => hospital.hospitalType === "Critical Access Hospitals");
  const ruralCountyHospitals = hospitals.filter((hospital) => hospital.countyContext?.ruralUrbanClassification === "Rural");
  const lowRated = hospitals.filter((hospital) => Number.isFinite(hospital.overallRating) && hospital.overallRating <= 2);
  const rateSheetMatches = hospitals.filter((hospital) => hospital.hfsRateSheet);
  const paymentMatches = hospitals.filter((hospital) => hospital.hfsPayment);
  const acuteDrgRates = paymentMatches.map((hospital) => hospital.hfsPayment?.paymentFields?.ipCos20AcuteDrgRate).filter((value) => Number.isFinite(value));
  const opAcuteEapgRates = paymentMatches.map((hospital) => hospital.hfsPayment?.paymentFields?.opCos24AcuteEapgConversionFactorBaseRate).filter((value) => Number.isFinite(value));
  const highCostDrugEligible = paymentMatches.filter((hospital) => hospital.hfsPayment?.paymentFields?.eligibleHighCostDrugDeviceAddOn === "Yes");
  const ownershipTypes = new Set(hospitals.map((hospital) => hospital.hospitalOwnership).filter(Boolean));
  const metrics = [
    ["Illinois hospitals", hospitals.length],
    ["Rated hospitals", rated.length],
    ["Avg CMS overall rating", rated.length ? average(rated.map((hospital) => hospital.overallRating)).toFixed(1) : "N/A"],
    ["Emergency service hospitals", emergency.length],
    ["Critical access hospitals", criticalAccess.length],
    ["Matched HFS rate sheets", rateSheetMatches.length],
    ["Parsed HFS payment records", paymentMatches.length],
    ["Avg acute DRG rate", acuteDrgRates.length ? formatCurrencyOrNA(average(acuteDrgRates)) : "N/A"],
    ["Avg OP acute EAPG base", opAcuteEapgRates.length ? formatCurrencyOrNA(average(opAcuteEapgRates)) : "N/A"],
    ["High-cost drug add-on eligible", highCostDrugEligible.length],
    ["Rural-county hospitals", ruralCountyHospitals.length],
    ["Low overall rating", lowRated.length],
    ["Ownership types", ownershipTypes.size],
    ["Counties represented", countyGroups.length]
  ];
  return metrics.map(([label, value]) => `
    <article class="metric-card">
      <span>${escapeHtml(value)}</span>
      <small>${escapeHtml(label)}</small>
    </article>
  `).join("");
}

function renderHospitalCountyRows(countyGroups) {
  if (!countyGroups.length) return '<p class="status">No hospital county records match the current search.</p>';
  return countyGroups.slice(0, 20).map((group) => `
    <article class="table-row compact">
      <div>
        <strong>${escapeHtml(group.county)}</strong>
        <small>${escapeHtml(group.ruralUrbanClassification)} / Poverty ${formatOptionalPercent(group.povertyRate)} / 65+ ${formatOptionalPercent(group.age65PlusPercent)}</small>
      </div>
      <div class="numeric">${group.count} hospitals / ${group.emergencyCount} ER / ${formatNumberOrNA(group.averageRating, 1)} avg rating</div>
    </article>
  `).join("");
}

function renderHospitalDrilldown(hospital) {
  if (!hospital) return '<p class="status">Select or search for a hospital to view details.</p>';
  const rateSheet = hospital.hfsRateSheet;
  const payment = hospital.hfsPayment;
  const paymentFields = payment?.paymentFields || {};
  const careers = getFacilityCareerRecord(hospital);
  const system = hospital.systemAffiliation;
  return `
    <div class="profile-header">
      <div>
        <h3>${escapeHtml(hospital.facilityName)}</h3>
        <p>${escapeHtml(hospital.address || "Address unavailable")} ${escapeHtml(hospital.city)}, IL ${escapeHtml(hospital.zipCode || "")}</p>
      </div>
      <span class="risk-pill ${riskClass(riskLevelForScore(hospitalPriorityScore(hospital)))}">${hospitalPriorityScore(hospital)} signal</span>
    </div>
    <section class="profile-section">
      <h4>Hospital Snapshot</h4>
      <div class="profile-grid">
        ${renderProfileMetric("CMS facility ID", hospital.facilityId)}
        ${renderProfileMetric("County", hospital.county)}
        ${renderProfileMetric("Hospital type", hospital.hospitalType)}
        ${renderProfileMetric("System affiliation", system?.systemName || "Not mapped")}
        ${renderProfileMetric("Ownership", hospital.hospitalOwnership)}
        ${renderProfileMetric("Emergency services", hospital.emergencyServices)}
        ${renderProfileMetric("Birthing friendly", hospital.birthingFriendly)}
        ${renderProfileMetric("Overall CMS rating", starLabel(hospital.overallRating))}
        ${renderProfileMetric("Phone", hospital.telephoneNumber)}
      </div>
    </section>
    ${renderHospitalSystemContext(hospital)}
    <section class="profile-section">
      <h4>Quality Measure Signals</h4>
      <div class="profile-grid">
        ${renderProfileMetric("Mortality measures", formatIntegerOrNA(hospital.mortalityMeasures))}
        ${renderProfileMetric("Mortality worse", formatIntegerOrNA(hospital.mortalityWorse))}
        ${renderProfileMetric("Safety measures", formatIntegerOrNA(hospital.safetyMeasures))}
        ${renderProfileMetric("Safety worse", formatIntegerOrNA(hospital.safetyWorse))}
        ${renderProfileMetric("Readmission measures", formatIntegerOrNA(hospital.readmissionMeasures))}
        ${renderProfileMetric("Readmission worse", formatIntegerOrNA(hospital.readmissionWorse))}
        ${renderProfileMetric("Patient experience measures", formatIntegerOrNA(hospital.patientExperienceMeasures))}
        ${renderProfileMetric("Timely/effective care measures", formatIntegerOrNA(hospital.timelyEffectiveCareMeasures))}
      </div>
      <p class="profile-note">CMS quality fields are directional screening signals. They should be validated with measure-level data before drawing conclusions.</p>
    </section>
    <section class="profile-section">
      <h4>HFS Hospital Rate Sheet / Payment Parameters</h4>
      <div class="profile-grid">
        ${renderProfileMetric("HFS Medicaid rate sheet", rateSheet ? "Available" : "Not matched")}
        ${renderProfileMetric("HFS provider ID", rateSheet?.hfsProviderId || "N/A")}
        ${renderProfileMetric("Rate sheet effective", rateSheet?.effectiveDate || "N/A")}
        ${renderProfileMetric("Rate sheet match score", Number.isFinite(rateSheet?.matchScore) ? formatNumberOrNA(rateSheet.matchScore, 2) : "N/A")}
        ${renderProfileMetric("Structured HFS fields", payment ? `${payment.parsedFieldCount} parsed` : "Not parsed")}
        ${renderProfileMetric("Hospital price transparency file", "Next data layer")}
        ${renderProfileMetric("County context", hospital.countyContext?.ruralUrbanClassification || "Not matched")}
      </div>
      ${rateSheet ? `<p class="profile-note"><a href="${escapeHtml(rateSheet.url)}" target="_blank" rel="noreferrer">Open HFS 2026 hospital rate sheet PDF</a></p>` : ""}
      <p class="profile-note">These are public HFS rate-sheet parameters. They help frame reimbursement analysis but do not calculate a claim-specific payment without diagnosis, DRG/APC, modifiers, policy logic, and payer context.</p>
    </section>
    <section class="profile-section">
      <h4>Extracted HFS Payment Parameters</h4>
      <div class="profile-grid">
        ${renderProfileMetric("IP acute DRG rate", formatCurrencyOrNA(paymentFields.ipCos20AcuteDrgRate))}
        ${renderProfileMetric("IP acute standardized amount", formatCurrencyOrNA(paymentFields.ipCos20AcuteStandardizedAmount))}
        ${renderProfileMetric("Psych per diem", formatCurrencyOrNA(paymentFields.ipCos21PsychPerDiemRate))}
        ${renderProfileMetric("Rehab per diem", formatCurrencyOrNA(paymentFields.ipCos22RehabPerDiemRate))}
        ${renderProfileMetric("OP acute EAPG base", formatCurrencyOrNA(paymentFields.opCos24AcuteEapgConversionFactorBaseRate))}
        ${renderProfileMetric("OP psych EAPG base", formatCurrencyOrNA(paymentFields.opCos2728PsychEapgConversionFactorBaseRate))}
        ${renderProfileMetric("OP rehab EAPG base", formatCurrencyOrNA(paymentFields.opCos29RehabEapgConversionFactorBaseRate))}
        ${renderProfileMetric("IP wage index", formatNumberOrNA(paymentFields.ipCos20AcuteWageIndex, 4))}
        ${renderProfileMetric("OP wage index", formatNumberOrNA(paymentFields.opWageIndex, 4))}
        ${renderProfileMetric("Medicare IPPS CCR", formatNumberOrNA(paymentFields.medicareIppsAggregateCcr, 3))}
        ${renderProfileMetric("High-cost drug/device add-on", paymentFields.eligibleHighCostDrugDeviceAddOn || "N/A")}
        ${renderProfileMetric("SMART Act factor", formatNumberOrNA(paymentFields.smartActAdjustmentFactor, 3))}
      </div>
      <p class="profile-note">${payment ? escapeHtml(payment.extractionNotes || "") : "No structured HFS payment fields are available for this selected hospital."}</p>
    </section>
    <section class="profile-section">
      <h4>Workforce Demand Signal</h4>
      <div class="profile-grid">
        ${renderProfileMetric("Careers page", careers?.careerPageUrl ? "Linked" : "Next data layer")}
        ${renderProfileMetric("Open roles", Number.isFinite(careers?.jobOpeningCount) ? formatIntegerOrNA(careers.jobOpeningCount) : "Not counted")}
        ${renderProfileMetric("Hiring platform", careers?.platform || "Unknown")}
        ${renderProfileMetric("Observed", careers?.observedDate || "N/A")}
      </div>
      ${careers?.careerPageUrl ? `<p class="profile-note"><a href="${escapeHtml(careers.careerPageUrl)}" target="_blank" rel="noreferrer">Open careers page</a>. Job openings are a labor-market signal and should be validated against role duplication, campus scope, posting age, and internal transfer practices.</p>` : '<p class="profile-note">Illinois Hospital Report Card exposes hospital website fields that can seed homepage discovery. Careers pages and job counts should be captured with observation dates because they change frequently and may live on system-level hiring platforms.</p>'}
    </section>
    <section class="profile-section">
      <h4>Reimbursement / Price Transparency Status</h4>
      <div class="reimbursement-workbench">
        <div>
          <strong>What is attached now, and what needs imported next?</strong>
          <p>This hospital MVP does not yet estimate reimbursement. It establishes the hospital master file and quality/access frame that HFS rates and machine-readable price files can attach to next.</p>
        </div>
        <div class="reimbursement-status-strip">
          ${renderHospitalReimbursementStatusTiles(hospital)}
        </div>
      </div>
      <div class="reimbursement-status-grid">
        ${renderHospitalReimbursementStatusCards(hospital)}
      </div>
    </section>
    <section class="profile-section">
      <h4>Data Attachment Queue</h4>
      <p class="profile-note">This is the practical audit bridge: attach one public source layer at a time, then keep price, payment, cost, and clinical logic separate so the evidence does not overclaim.</p>
      <div class="attachment-queue">
        ${renderHospitalDataAttachmentQueue(hospital)}
      </div>
    </section>
    ${renderFacilityEvidenceBinder(hospital)}
    <section class="profile-section">
      <h4>Four-Layer Audit Map For This Hospital</h4>
      <div class="hospital-audit-map">
        ${renderHospitalAuditLayerMap(hospital)}
      </div>
    </section>
    <section class="profile-section">
      <h4>Payment Logic To Attach</h4>
      <div class="hospital-logic-grid">
        ${renderHospitalPaymentLogicCards(hospital)}
      </div>
    </section>
    <section class="profile-section">
      <h4>Evidence Checklist</h4>
      <div class="evidence-checklist">
        ${renderHospitalEvidenceChecklist(hospital, careers)}
      </div>
    </section>
    <section class="profile-section">
      <h4>Audit Questions For This Hospital</h4>
      <div class="finding-list compact-findings">
        ${renderHospitalAuditQuestions(hospital)}
      </div>
    </section>
  `;
}

function getHospitalDataAttachments() {
  return Array.isArray(state.hospitalDataAttachments) ? state.hospitalDataAttachments : [];
}

function getFacilityEvidenceBinders() {
  return Array.isArray(state.facilityEvidenceBinders) ? state.facilityEvidenceBinders : [];
}

function getFacilityEvidenceBinder(hospital) {
  const facilityId = String(hospital?.facilityId || "");
  const name = normalizeFacilityText(hospital?.facilityName);
  return getFacilityEvidenceBinders().find((binder) => (
    String(binder.facilityId || "") === facilityId || normalizeFacilityText(binder.facilityName) === name
  )) || null;
}

function getCostReportRecords() {
  return Array.isArray(state.hcrisCostReports)
    ? state.hcrisCostReports
    : state.hcrisCostReports.records || [];
}

function getCostReportForHospital(hospital) {
  const facilityId = String(hospital?.facilityId || "");
  const name = normalizeFacilityText(hospital?.facilityName);
  return getCostReportRecords().find((record) => (
    String(record.facilityId || record.providerCcn || "") === facilityId
    || normalizeFacilityText(record.facilityName) === name
  )) || null;
}

function renderFacilityEvidenceBinder(hospital) {
  const binder = getFacilityEvidenceBinder(hospital);
  const priceExamples = getPriceTransparencyRecords().filter((record) => String(record.facilityId) === String(hospital.facilityId));
  const providerRows = getProviderPaymentRowsForHospital(hospital);
  const costReport = getCostReportForHospital(hospital);
  const system = hospital.systemAffiliation;

  if (!binder) {
    return `
      <section class="profile-section evidence-binder">
        <h4>Facility Evidence Binder</h4>
        <p class="profile-note">No facility-specific binder is mapped yet. This hospital can still use the Data Attachment Queue as the template for building one.</p>
      </section>
    `;
  }

  return `
    <section class="profile-section evidence-binder">
      <div class="binder-head">
        <div>
          <h4>${escapeHtml(binder.binderTitle || `${hospital.facilityName} Evidence Binder`)}</h4>
          <p>${escapeHtml(binder.auditQuestion || "")}</p>
        </div>
        <span class="status-dot status-partial">${escapeHtml(binder.binderStatus || "starter")}</span>
      </div>
      <div class="binder-id-grid">
        ${renderBinderIdentifiers(binder, hospital, system)}
      </div>
      <div class="binder-layer-grid">
        ${renderBinderEvidenceRows(binder, hospital, priceExamples, providerRows)}
      </div>
      <section class="binder-subsection">
        <h5>Attached Price Rows</h5>
        ${renderBinderPriceRows(hospital, priceExamples)}
      </section>
      <section class="binder-subsection">
        <h5>HFS Payment Rows</h5>
        ${renderBinderProviderPaymentRows(hospital, providerRows)}
      </section>
      <section class="binder-subsection">
        <h5>Cost Report Economics</h5>
        ${renderProfileCostReportRows(hospital, costReport)}
      </section>
      <section class="binder-subsection">
        <h5>Public Payer Enrollment Context</h5>
        ${renderBinderEnrollmentContext(hospital)}
      </section>
      <section class="binder-subsection">
        <h5>Clinical Scenario Bridge</h5>
        <div class="scenario-grid">
          ${renderBinderClinicalScenarios(binder)}
        </div>
      </section>
    </section>
  `;
}

function renderBinderSnapshotCards(hospital, binder, priceRows, paymentRows, enrollmentContext, costReport, rateSheet, hfsPayment) {
  const totalPaid = sum(paymentRows.map((record) => record.totalPaid));
  const patientCount = sum(paymentRows.map((record) => record.patientsServed));
  const loadedLayers = [
    priceRows.length > 0,
    paymentRows.length > 0 || rateSheet || hfsPayment,
    Boolean(costReport),
    Boolean(hospital.systemAffiliation),
    Boolean(binder?.clinicalScenarios?.length)
  ].filter(Boolean).length;

  const cards = [
    {
      label: "Facility",
      value: hospital.facilityName,
      detail: `${hospital.city || "Unknown city"} / ${hospital.county || "Unknown county"} / ${hospital.hospitalType || "Unknown type"}`
    },
    {
      label: "Evidence layers active",
      value: `${loadedLayers}/5`,
      detail: "Prices, public payment, cost economics, system financials, clinical logic"
    },
    {
      label: "Price rows attached",
      value: formatIntegerOrNA(priceRows.length),
      detail: "Machine-readable standard-charge examples"
    },
    {
      label: "HFS provider payment",
      value: totalPaid ? formatCurrencyOrNA(totalPaid, 0) : "Not loaded",
      detail: patientCount ? `${formatIntegerOrNA(patientCount)} reported patients served` : "Provider-level public payment layer"
    },
    {
      label: "HFS rate sheet",
      value: rateSheet || hfsPayment ? "Matched" : "Next import",
      detail: rateSheet?.hfsProviderId ? `HFS provider ${rateSheet.hfsProviderId}` : "Facility-level Medicaid rate context"
    },
    {
      label: "Cost report economics",
      value: costReport ? formatCurrencyOrNA(costReport.netPatientRevenue, 0) : "Not loaded",
      detail: costReport
        ? `${formatIntegerOrNA(costReport.numberOfBeds)} beds / ${formatOptionalPercent(costReport.derived?.operatingMargin)} operating margin`
        : "CMS HCRIS facility economics layer"
    },
    {
      label: "System",
      value: hospital.systemAffiliation?.systemName || binder?.systemName || "Not mapped",
      detail: "System context must stay separate from facility CCN evidence"
    }
  ];

  return cards.map((card) => `
    <article class="metric-card">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(card.value)}</strong>
      <small>${escapeHtml(card.detail)}</small>
    </article>
  `).join("");
}

function renderBinderEvidenceStack(hospital, binder, priceRows, paymentRows, enrollmentContext, costReport, rateSheet, hfsPayment) {
  const layers = [
    {
      title: "Prices",
      status: priceRows.length ? "loaded" : "mapped",
      evidence: priceRows.length
        ? `${formatIntegerOrNA(priceRows.length)} standard-charge examples attached`
        : "Machine-readable price source mapped, parser can attach rows",
      proves: "Posted gross charge, cash price, and negotiated-rate fields when the file exposes them.",
      limit: "Does not prove actual payment, collected revenue, volume, denial, or patient balance."
    },
    {
      title: "Public Payer Payment",
      status: paymentRows.length || rateSheet || hfsPayment ? "loaded" : "next",
      evidence: paymentRows.length
        ? `${formatIntegerOrNA(paymentRows.length)} HFS provider-level payment rows plus rate-sheet context`
        : "Attach HFS provider-payment and hospital rate rows",
      proves: "Public Medicaid payment flow and published rate parameters.",
      limit: "Does not prove claim-level adjudication, severity, managed-care contract terms, or private payer payment."
    },
    {
      title: "Facility Economics",
      status: costReport ? "loaded" : "next",
      evidence: costReport
        ? `CMS HCRIS FY ${costReport.sourceYear || "N/A"} cost report attached: ${formatCurrencyOrNA(costReport.netPatientRevenue, 0)} net patient revenue, ${formatCurrencyOrNA(costReport.totalOperatingExpense, 0)} operating expense`
        : "CMS HCRIS / HFS cost report economics still need imported",
      proves: "Revenue, expense, utilization, beds, wages, cost-to-charge, and margin signals.",
      limit: "Does not prove service-line profitability or real-time cash position."
    },
    {
      title: "System Financials",
      status: hospital.systemAffiliation ? "mapped" : "next",
      evidence: hospital.systemAffiliation
        ? `${hospital.systemAffiliation.systemName} affiliation mapped`
        : "Attach Form 990, audited statements, and bond disclosures",
      proves: "Parent/system-level finances and possible subsidy, debt, or capital context.",
      limit: "System financials may not equal facility-level margin."
    },
    {
      title: "Clinical Reimbursement Logic",
      status: binder?.clinicalScenarios?.length ? "scaffolded" : "next",
      evidence: binder?.clinicalScenarios?.length
        ? `${formatIntegerOrNA(binder.clinicalScenarios.length)} ED/admission/payment-risk scenarios scaffolded`
        : "Attach DRG/APR-DRG, LOS, transfer, outlier, HAC/POA, and readmission logic",
      proves: "How a defined encounter would move through payment rules.",
      limit: "Does not prove any real patient encounter was coded, billed, or paid correctly."
    }
  ];

  return layers.map((layer) => `
    <article class="binder-stack-card">
      <span class="status-dot status-${statusClassForAttachment(layer.status)}">${escapeHtml(layer.status)}</span>
      <div>
        <strong>${escapeHtml(layer.title)}</strong>
        <p>${escapeHtml(layer.evidence)}</p>
      </div>
      <dl>
        <div>
          <dt>Can prove</dt>
          <dd>${escapeHtml(layer.proves)}</dd>
        </div>
        <div>
          <dt>Limit</dt>
          <dd>${escapeHtml(layer.limit)}</dd>
        </div>
      </dl>
    </article>
  `).join("");
}

function renderBinderServiceExampleRows(priceRows) {
  if (!priceRows.length) {
    return '<p class="status">No parsed price examples are attached yet. Query price files to populate CPT/HCPCS, revenue-code, drug, lab, imaging, ED, observation, and inpatient examples.</p>';
  }
  return priceRows.slice(0, 18).map((record) => `
    <article class="table-row price-example-row">
      <div>
        <strong>${escapeHtml(record.description || "Unknown service")}</strong>
        <small>${escapeHtml(record.category || "Uncategorized")} / ${escapeHtml(record.code || "No code")} / ${escapeHtml(record.setting || "Unknown setting")}</small>
      </div>
      <div>${escapeHtml(record.chargeType || "Price field")}</div>
      <div class="numeric">${formatCurrencyOrNA(record.amount)}</div>
      <div>${escapeHtml(record.payer || "N/A")}</div>
    </article>
  `).join("");
}

function renderBinderPaymentEvidenceRows(paymentRows, rateSheet, hfsPayment) {
  const rows = [
    ...paymentRows.map((record) => ({
      title: record.providerName || "HFS provider payment row",
      detail: `${record.providerType || "Provider"} / ${record.serviceYear || "Unknown year"} / ${record.reimbursementType || "Payment evidence"}`,
      amount: formatCurrencyOrNA(record.totalPaid, 0),
      note: `${formatIntegerOrNA(record.patientsServed)} patients`
    }))
  ];
  if (rateSheet) {
    rows.push({
      title: "HFS hospital rate sheet",
      detail: `${rateSheet.hfsProviderId || "No HFS provider ID"} / effective ${rateSheet.effectiveDate || "N/A"}`,
      amount: "Matched",
      note: rateSheet.url ? "PDF source linked" : "Source pending"
    });
  }
  if (hfsPayment) {
    rows.push({
      title: "Parsed HFS hospital payment parameters",
      detail: `${formatIntegerOrNA(hfsPayment.parsedFieldCount)} structured fields`,
      amount: formatCurrencyOrNA(hfsPayment.paymentFields?.ipCos20AcuteDrgRate),
      note: "IP acute DRG rate parameter"
    });
  }

  if (!rows.length) return '<p class="status">No public payer payment rows are attached yet.</p>';
  return rows.map((row) => `
    <article class="table-row compact">
      <div>
        <strong>${escapeHtml(row.title)}</strong>
        <small>${escapeHtml(row.detail)}</small>
      </div>
      <div class="numeric">${escapeHtml(row.amount)}</div>
      <div>${escapeHtml(row.note)}</div>
    </article>
  `).join("");
}

function renderBinderCostReportRows(hospital, costReport) {
  if (!costReport) {
    return `
      <div class="binder-empty">
        <strong>No HCRIS cost report row is attached yet</strong>
        <p>Query CMS Hospital Provider Cost Report by CCN ${escapeHtml(hospital.facilityId)} to add revenue, expenses, beds, utilization, assets, liabilities, and cost-to-charge context.</p>
        <a href="https://data.cms.gov/provider-compliance/cost-reports/hospital-provider-cost-report" target="_blank" rel="noreferrer">Open CMS cost report source</a>
      </div>
    `;
  }

  const items = [
    ["Fiscal year", `${costReport.fiscalYearBeginDate || "N/A"} to ${costReport.fiscalYearEndDate || "N/A"}`, "Reporting period"],
    ["Beds", formatIntegerOrNA(costReport.numberOfBeds), `${formatNumberOrNA(costReport.derived?.averageDailyCensus, 2)} average daily census / ${formatOptionalPercent(costReport.derived?.occupancyRate)} occupancy`],
    ["Payroll FTE", formatNumberOrNA(costReport.fteEmployeesOnPayroll, 1), `${formatNumberOrNA(costReport.derived?.ftePerOccupiedBed, 2)} FTE per occupied bed signal`],
    ["Net patient revenue", formatCurrencyOrNA(costReport.netPatientRevenue, 0), `${formatCurrencyOrNA(costReport.totalPatientRevenue, 0)} total patient revenue before contractual allowances`],
    ["Operating expense", formatCurrencyOrNA(costReport.totalOperatingExpense, 0), `${formatCurrencyOrNA(costReport.totalCosts, 0)} total costs reported`],
    ["Net income from service", formatCurrencyOrNA(costReport.netIncomeFromServiceToPatients, 0), `${formatOptionalPercent(costReport.derived?.operatingMargin)} operating margin on net patient revenue`],
    ["Net income", formatCurrencyOrNA(costReport.netIncome, 0), `${formatOptionalPercent(costReport.derived?.totalMarginOnPatientRevenue)} total margin on patient revenue`],
    ["Cost-to-charge ratio", formatNumberOrNA(costReport.costToChargeRatio, 3), `${formatCurrencyOrNA(costReport.combinedOutpatientInpatientCharges, 0)} combined charges`],
    ["Medicaid net revenue", formatCurrencyOrNA(costReport.netRevenueFromMedicaid, 0), `${formatOptionalPercent(costReport.derived?.medicaidNetToChargeRatio)} Medicaid net-to-charge ratio`],
    ["Uncompensated care", formatCurrencyOrNA(costReport.totalUnreimbursedAndUncompensatedCare, 0), `${formatCurrencyOrNA(costReport.totalBadDebtExpense, 0)} bad debt / ${formatCurrencyOrNA(costReport.costOfCharityCare, 0)} charity care`],
    ["Assets", formatCurrencyOrNA(costReport.totalAssets, 0), `${formatCurrencyOrNA(costReport.totalFixedAssets, 0)} fixed assets / ${formatCurrencyOrNA(costReport.investments, 0)} investments`],
    ["Liabilities", formatCurrencyOrNA(costReport.totalLiabilities, 0), `${formatOptionalPercent(costReport.derived?.liabilitiesToAssets)} liabilities to assets / current ratio ${formatNumberOrNA(costReport.derived?.currentRatio, 2)}`]
  ];

  return `
    ${items.map(([label, value, detail]) => `
      <article class="cost-report-card">
        <span>${escapeHtml(label)}</span>
        <strong>${escapeHtml(value)}</strong>
        <small>${escapeHtml(detail)}</small>
      </article>
    `).join("")}
    <article class="cost-report-note">
      <strong>What this proves</strong>
      <p>CMS HCRIS gives facility-reported cost-report economics for the CCN: revenue, expense, assets, liabilities, charges, utilization, beds, FTE, and cost-to-charge context.</p>
      <strong>What it does not prove</strong>
      <p>${escapeHtml(costReport.limitations || "It does not prove service-line profitability, claim-level reimbursement, private payer contract performance, or real-time cash position.")}</p>
      <a href="${escapeHtml(costReport.sourceUrl || "https://data.cms.gov/provider-compliance/cost-reports/hospital-provider-cost-report")}" target="_blank" rel="noreferrer">Open CMS HCRIS source</a>
    </article>
  `;
}

function renderProfileCostReportRows(hospital, costReport) {
  if (!costReport) {
    return `
      <div class="binder-empty">
        <strong>No cost-report economics attached yet</strong>
        <p>Attach CMS HCRIS by CCN ${escapeHtml(hospital.facilityId)} to add facility-reported revenue, expense, utilization, assets, liabilities, and cost-to-charge context.</p>
      </div>
    `;
  }
  return `
    <div class="profile-grid">
      ${renderProfileMetric("Net patient revenue", formatCurrencyOrNA(costReport.netPatientRevenue, 0))}
      ${renderProfileMetric("Operating expense", formatCurrencyOrNA(costReport.totalOperatingExpense, 0))}
      ${renderProfileMetric("Net income", formatCurrencyOrNA(costReport.netIncome, 0))}
      ${renderProfileMetric("Beds", formatIntegerOrNA(costReport.numberOfBeds))}
      ${renderProfileMetric("Occupancy", formatOptionalPercent(costReport.derived?.occupancyRate))}
      ${renderProfileMetric("Cost-to-charge ratio", formatNumberOrNA(costReport.costToChargeRatio, 3))}
    </div>
    <p class="profile-note">CMS HCRIS is cost-report context. It helps compare price, payment, cost, and margin signals but does not prove claim-level reimbursement or service-line profitability.</p>
  `;
}

function renderBinderClinicalWorkbench(hospital, binder) {
  const scenarios = Array.isArray(binder?.clinicalScenarios) ? binder.clinicalScenarios : [];
  const fallback = [
    {
      name: "ED discharged home",
      logic: "Outpatient ED, labs, imaging, drugs, facility charge, and payer rule comparison.",
      neededEvidence: "CPT/HCPCS, revenue-code rows, outpatient rule file, and payer payment source."
    },
    {
      name: "ED to inpatient",
      logic: "Principal diagnosis, DRG/APR-DRG grouping, CC/MCC, expected LOS, transfer, and outlier logic.",
      neededEvidence: "DRG rule file, diagnosis/procedure scenario, LOS benchmark, discharge status."
    }
  ];
  return (scenarios.length ? scenarios : fallback).map((scenario) => `
    <div class="finding">
      <strong>${escapeHtml(scenario.name)}</strong>
      <p>${escapeHtml(scenario.logic)}</p>
      <small>${escapeHtml(scenario.neededEvidence)}</small>
    </div>
  `).join("");
}

function renderBinderProofTasks(hospital, binder, priceRows, paymentRows, enrollmentContext, costReport, rateSheet, hfsPayment) {
  const tasks = [
    {
      label: "Import CMS HCRIS cost report economics",
      done: Boolean(costReport),
      detail: "Attach revenue, expense, beds, utilization, wage, cost-to-charge, and operating margin fields."
    },
    {
      label: "Promote price parser to payer-specific examples",
      done: priceRows.some((row) => row.payer),
      detail: "Separate gross charge, cash price, Medicare, Medicaid/MCO, commercial plan, and code-level examples."
    },
    {
      label: "Tie HFS payment to rate-sheet parameters",
      done: Boolean(paymentRows.length && (rateSheet || hfsPayment)),
      detail: "Keep provider-level payment totals separate from rate parameters and claim-specific logic."
    },
    {
      label: "Add DRG/APR-DRG and LOS scenario rules",
      done: false,
      detail: "Build ED-to-admit, observation, transfer, outlier, HAC/POA, and readmission examples."
    },
    {
      label: "Attach system financials",
      done: Boolean(hospital.systemAffiliation),
      detail: "Add Memorial Health Form 990, audited statements, and bond disclosure links as system-level evidence."
    },
    {
      label: "Keep evidence limits visible",
      done: Boolean(binder && enrollmentContext),
      detail: "Every layer should say what it proves and what it cannot prove."
    }
  ];

  return tasks.map((task) => `
    <div class="finding ${task.done ? "finding-done" : ""}">
      <strong>${task.done ? "loaded" : "next"} / ${escapeHtml(task.label)}</strong>
      <p>${escapeHtml(task.detail)}</p>
    </div>
  `).join("");
}

function renderBinderIdentifiers(binder, hospital, system) {
  const identifiers = Array.isArray(binder.facilityIdentifiers) ? binder.facilityIdentifiers : [];
  const dynamicIdentifiers = [
    ["County", hospital.county || "Unknown", "CMS Hospital General Information", "loaded"],
    ["System peers", system ? `${formatIntegerOrNA(getHospitalsInSystem(system).length)} mapped hospitals` : "Not mapped", "Hospital system crosswalk", system ? "mapped" : "next"],
    ["Overall CMS rating", starLabel(hospital.overallRating), "CMS Hospital General Information", "loaded"]
  ];
  return [...identifiers, ...dynamicIdentifiers.map(([label, value, source, status]) => ({ label, value, source, status }))].map((item) => `
    <article class="binder-id-card">
      <span class="status-dot status-${statusClassForAttachment(item.status)}">${escapeHtml(item.status || "mapped")}</span>
      <strong>${escapeHtml(item.value || "Unknown")}</strong>
      <small>${escapeHtml(item.label || "Identifier")} / ${escapeHtml(item.source || "Source pending")}</small>
    </article>
  `).join("");
}

function renderBinderEvidenceRows(binder, hospital, priceExamples, providerRows) {
  const rows = Array.isArray(binder.evidenceRows) ? binder.evidenceRows : [];
  return rows.map((row) => {
    const enriched = enrichBinderEvidenceRow(row, hospital, priceExamples, providerRows);
    return `
      <article class="binder-evidence-card">
        <div class="binder-evidence-head">
          <span class="status-dot status-${statusClassForAttachment(enriched.status)}">${escapeHtml(enriched.status)}</span>
          <div>
            <strong>${escapeHtml(enriched.evidenceName)}</strong>
            <small>${escapeHtml(enriched.layer)} / ${escapeHtml(enriched.source)}</small>
          </div>
        </div>
        <p>${escapeHtml(enriched.detail)}</p>
        <dl>
          <div>
            <dt>Can prove</dt>
            <dd>${escapeHtml(enriched.proves)}</dd>
          </div>
          <div>
            <dt>Limit</dt>
            <dd>${escapeHtml(enriched.doesNotProve)}</dd>
          </div>
        </dl>
        ${enriched.sourceUrl ? `<a href="${escapeHtml(enriched.sourceUrl)}" target="_blank" rel="noreferrer">Open source</a>` : ""}
      </article>
    `;
  }).join("");
}

function enrichBinderEvidenceRow(row, hospital, priceExamples, providerRows) {
  if (row.layer === "Prices") {
    const source = getPriceTransparencySources().find((item) => String(item.facilityId) === String(hospital.facilityId));
    return {
      ...row,
      status: priceExamples.length ? "loaded" : source ? "mapped" : row.status,
      detail: priceExamples.length
        ? `${formatIntegerOrNA(priceExamples.length)} service examples are attached from the current price transparency query.`
        : row.detail,
      sourceUrl: source?.machineReadableFileUrl || row.sourceUrl
    };
  }
  if (row.layer === "Public Payer Payment") {
    return {
      ...row,
      status: providerRows.length ? "loaded" : row.status,
      detail: providerRows.length
        ? `${formatIntegerOrNA(providerRows.length)} HFS provider-payment rows are matched to this hospital/system candidate.`
        : row.detail
    };
  }
  return row;
}

function renderBinderPriceRows(hospital, priceExamples) {
  const source = getPriceTransparencySources().find((item) => String(item.facilityId) === String(hospital.facilityId));
  if (!priceExamples.length) {
    return `
      <div class="binder-empty">
        <strong>${source ? "Price file mapped, rows not attached yet" : "No price file mapped"}</strong>
        <p>${source ? "Click Query Price Files in the Price Transparency tab to attach service rows here. The binder will pull those rows into this hospital profile." : "Map a machine-readable price file before attaching price rows."}</p>
        ${source?.machineReadableFileUrl ? `<a href="${escapeHtml(source.machineReadableFileUrl)}" target="_blank" rel="noreferrer">Open CSV</a>` : ""}
      </div>
    `;
  }

  return `
    <div class="binder-row-table">
      ${priceExamples.slice(0, 12).map((record) => `
        <article class="binder-data-row">
          <div>
            <strong>${escapeHtml(record.description || "Unknown service")}</strong>
            <small>${escapeHtml(record.category || "Uncategorized")} / ${escapeHtml(record.code || "No code")} / ${escapeHtml(record.setting || "Unknown setting")}</small>
          </div>
          <div>${escapeHtml(record.chargeType || "Price field")}</div>
          <div class="numeric">${formatCurrencyOrNA(record.amount)}</div>
          <div>${escapeHtml(record.payer || "N/A")}</div>
        </article>
      `).join("")}
    </div>
  `;
}

function getProviderPaymentRowsForHospital(hospital) {
  const hospitalName = normalizeFacilityText(hospital.facilityName);
  const systemName = normalizeFacilityText(hospital.systemAffiliation?.systemName);
  const county = normalizeCountyName(hospital.county);
  return getProviderPaymentRecords().filter((record) => {
    if (String(record.matchedFacilityId || "") === String(hospital.facilityId || "")) return true;
    const providerName = normalizeFacilityText(record.providerName);
    const providerCounty = normalizeCountyName(record.county);
    return providerName === hospitalName
      || (systemName && providerName.includes(systemName) && providerCounty === county)
      || (providerName.includes(hospitalName) || hospitalName.includes(providerName));
  });
}

function renderBinderProviderPaymentRows(hospital, providerRows) {
  const statusLine = state.hfsProviderPaymentStatus ? `<p class="status">${escapeHtml(state.hfsProviderPaymentStatus)}</p>` : "";
  if (!providerRows.length) {
    return `
      <div class="binder-empty">
        <strong>No HFS provider-payment row is attached yet</strong>
        <p>Next import should search HFS provider-level data for ${escapeHtml(hospital.facilityName)}, legal entity names, CCN ${escapeHtml(hospital.facilityId)}, county ${escapeHtml(hospital.county)}, and ${escapeHtml(hospital.systemAffiliation?.systemName || "system")} affiliation.</p>
        ${statusLine}
        <button class="mini-button" data-query-hfs-payments="${escapeHtml(hospital.facilityId)}">Query HFS Payments</button>
        <a href="https://hfs.illinois.gov/info/factsfigures/transparency.html" target="_blank" rel="noreferrer">Open HFS transparency source</a>
      </div>
    `;
  }

  return `
    <div class="binder-action-row">
      ${statusLine || '<p class="status">Matched HFS payment rows are attached as reported payment evidence.</p>'}
      <button class="mini-button" data-query-hfs-payments="${escapeHtml(hospital.facilityId)}">Refresh HFS Payments</button>
    </div>
    <div class="binder-row-table">
      ${providerRows.slice(0, 12).map((record) => `
        <article class="binder-data-row">
          <div>
            <strong>${escapeHtml(record.providerName || "Unknown provider")}</strong>
            <small>${escapeHtml(record.providerType || "Unknown type")} / ${escapeHtml(record.county || "Unknown county")} / ${escapeHtml(record.serviceYear || "Unknown year")}</small>
            <small>${escapeHtml(record.matchReasons?.join(", ") || "Matched provider-payment row")}</small>
          </div>
          <div>${escapeHtml(record.reimbursementType || record.serviceCategory || "Provider payment")}</div>
          <div class="numeric">${formatCurrencyOrNA(record.totalPaid, 0)}</div>
          <div>${formatIntegerOrNA(record.patientsServed)} patients</div>
        </article>
      `).join("")}
    </div>
  `;
}

function getHfsEnrollmentContextRecords() {
  return Array.isArray(state.hfsEnrollmentContext)
    ? state.hfsEnrollmentContext
    : state.hfsEnrollmentContext.records || [];
}

function getHfsEnrollmentContextForHospital(hospital) {
  return getHfsEnrollmentContextRecords().find((record) => String(record.facilityId) === String(hospital.facilityId))
    || getHfsEnrollmentContextRecords().find((record) => String(record.zipCode) === String(hospital.zipCode));
}

function renderBinderEnrollmentContext(hospital) {
  const context = getHfsEnrollmentContextForHospital(hospital);
  if (!context) {
    return `
      <div class="binder-empty">
        <strong>No HFS enrollment context is attached yet</strong>
        <p>Attach HFS program enrollment and demographics data to add public-payer population context around the hospital ZIP or county.</p>
        <a href="https://hfs.illinois.gov/info/factsfigures/transparency.html" target="_blank" rel="noreferrer">Open HFS transparency source</a>
      </div>
    `;
  }

  return `
    <div class="enrollment-context-card">
      <div class="enrollment-context-head">
        <div>
          <strong>ZIP ${escapeHtml(context.zipCode)} HFS enrollment context</strong>
          <small>${escapeHtml(context.serviceYear)} / ${formatIntegerOrNA(context.zipSourceRows)} source rows / ${escapeHtml(context.evidenceType)}</small>
        </div>
        <span>${formatNumberOrNA(context.zipRecipients, 2)} recipients</span>
      </div>
      <div class="enrollment-bars">
        ${renderEnrollmentBars(context.zipByHighLevelGroup || [], context.zipRecipients)}
      </div>
      <dl>
        <div>
          <dt>Can prove</dt>
          <dd>${escapeHtml(context.canProve)}</dd>
        </div>
        <div>
          <dt>Cannot prove</dt>
          <dd>${escapeHtml(context.cannotProve)}</dd>
        </div>
      </dl>
    </div>
  `;
}

function renderEnrollmentBars(items, total) {
  if (!items.length) return '<p class="status">No enrollment group rows are available.</p>';
  const denominator = Number.isFinite(total) && total > 0 ? total : Math.max(...items.map((item) => item.value || 0), 1);
  return items.slice(0, 6).map((item) => {
    const width = Math.max(4, Math.min(100, ((item.value || 0) / denominator) * 100));
    return `
      <div class="enrollment-bar">
        <div>
          <strong>${escapeHtml(item.label)}</strong>
          <small>${formatNumberOrNA(item.value, 2)}</small>
        </div>
        <span><i style="width:${width}%"></i></span>
      </div>
    `;
  }).join("");
}

async function queryHfsProviderPaymentsForHospital(facilityId, options = {}) {
  const hospital = getFilteredHospitals().find((record) => String(record.facilityId) === String(facilityId))
    || getFilteredHospitals()[0];
  if (!hospital) return;
  state.hfsProviderPaymentStatus = `${options.automatic ? "Auto-querying" : "Querying"} HFS provider-level payment data for ${hospital.facilityName}...`;
  renderHospitalIntelligence();

  try {
    const response = await fetch(`/api/query-hfs-provider-payments?facilityId=${encodeURIComponent(hospital.facilityId)}`);
    if (!response.ok) {
      const payload = await response.json().catch(() => ({}));
      throw new Error(payload.error || `HTTP ${response.status}`);
    }
    const payload = await response.json();
    state.providerPayments = payload;
    state.hfsProviderPaymentStatus = payload.notes || `Loaded ${formatIntegerOrNA(getProviderPaymentRecords().length)} HFS payment rows.`;
    renderMoneyFlow();
    renderAuditFramework();
    renderHospitalIntelligence();
  } catch (error) {
    state.hfsProviderPaymentStatus = `Automatic HFS query failed: ${error.message}. The app will retry from the button when the source/network is available.`;
    renderHospitalIntelligence();
  }
}

function renderBinderClinicalScenarios(binder) {
  const scenarios = Array.isArray(binder.clinicalScenarios) ? binder.clinicalScenarios : [];
  return scenarios.map((scenario) => `
    <article class="scenario-card">
      <strong>${escapeHtml(scenario.name)}</strong>
      <p>${escapeHtml(scenario.logic)}</p>
      <small>${escapeHtml(scenario.neededEvidence)}</small>
    </article>
  `).join("");
}

function renderHospitalDataAttachmentQueue(hospital) {
  const attachments = getHospitalDataAttachments();
  if (!attachments.length) {
    return '<p class="status">No hospital data attachment plan is loaded yet.</p>';
  }

  return attachments.map((attachment) => {
    const enriched = enrichHospitalDataAttachment(attachment, hospital);
    return `
      <article class="attachment-card">
        <div class="attachment-card-head">
          <span class="status-dot status-${escapeHtml(statusClassForAttachment(enriched.status))}">${escapeHtml(enriched.status)}</span>
          <div>
            <strong>${escapeHtml(enriched.label)}</strong>
            <small>${escapeHtml(enriched.layer)}</small>
          </div>
        </div>
        <p>${escapeHtml(enriched.attachGoal)}</p>
        <dl>
          <div>
            <dt>Can prove</dt>
            <dd>${escapeHtml(enriched.canProve)}</dd>
          </div>
          <div>
            <dt>Cannot prove</dt>
            <dd>${escapeHtml(enriched.cannotProve)}</dd>
          </div>
          <div>
            <dt>Next action</dt>
            <dd>${escapeHtml(enriched.nextAction)}</dd>
          </div>
        </dl>
        <div class="attachment-links">
          ${enriched.sourceUrl ? `<a href="${escapeHtml(enriched.sourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(enriched.primarySource || "Primary source")}</a>` : ""}
          ${enriched.secondarySourceUrl ? `<a href="${escapeHtml(enriched.secondarySourceUrl)}" target="_blank" rel="noreferrer">${escapeHtml(enriched.secondarySource || "Secondary source")}</a>` : ""}
        </div>
      </article>
    `;
  }).join("");
}

function enrichHospitalDataAttachment(attachment, hospital) {
  const priceSource = getPriceTransparencySources().find((source) => String(source.facilityId) === String(hospital.facilityId));
  const priceExamples = getPriceTransparencyRecords().filter((record) => String(record.facilityId) === String(hospital.facilityId));
  const system = hospital.systemAffiliation;

  if (attachment.id === "machine-readable-price-file" && priceSource) {
    return {
      ...attachment,
      status: priceExamples.length ? "loaded" : "mapped",
      sourceUrl: priceSource.priceTransparencyPageUrl || attachment.sourceUrl,
      secondarySourceUrl: priceSource.machineReadableFileUrl || attachment.secondarySourceUrl,
      primarySource: `${priceSource.systemName || system?.systemName || hospital.facilityName} price transparency page`,
      secondarySource: `${hospital.facilityName} machine-readable file`,
      canProve: priceExamples.length
        ? `${formatIntegerOrNA(priceExamples.length)} parsed service examples plus the public machine-readable source file.`
        : attachment.canProve,
      nextAction: priceExamples.length
        ? "Promote the parser from preview rows to payer-specific negotiated-rate extraction for DRG, CPT/HCPCS, revenue-code, pharmacy, lab, imaging, ED, and observation examples."
        : attachment.nextAction
    };
  }

  if (attachment.id === "cost-report-economics") {
    return {
      ...attachment,
      nextAction: `Map ${hospital.facilityName}'s CMS certification/provider identifiers to HCRIS and HFS cost-report files, then pull revenue, expense, beds, utilization, wage, and cost-to-charge fields.`
    };
  }

  if (attachment.id === "clinical-reimbursement-bridge") {
    const hospitalType = hospital.hospitalType || "hospital";
    return {
      ...attachment,
      nextAction: `Create ${hospitalType} test scenarios for ED-to-observation, ED-to-inpatient, transfer, readmission, expected LOS, high-cost outlier, and HAC/POA risk.`
    };
  }

  if (attachment.id === "hfs-hospital-reimbursement") {
    return {
      ...attachment,
      nextAction: `Find ${hospital.facilityName} in the latest HFS hospital rate sheet package and map HFS provider-payment rows by facility, CCN, legal name, and ${system?.systemName || "system"} affiliation.`
    };
  }

  return attachment;
}

function statusClassForAttachment(status) {
  const normalized = String(status || "").toLowerCase();
  if (normalized === "loaded") return "loaded";
  if (normalized === "mapped" || normalized === "scaffolded") return "partial";
  if (normalized === "next") return "next";
  return "missing";
}

function getHospitalSystemAffiliation(hospital) {
  const facilityId = String(hospital.facilityId || "").trim();
  const facilityName = normalizeFacilityText(hospital.facilityName);
  return state.hospitalSystems.find((system) => {
    const ids = Array.isArray(system.facilityIds) ? system.facilityIds.map(String) : [];
    const patterns = Array.isArray(system.facilityNamePatterns) ? system.facilityNamePatterns : [];
    return ids.includes(facilityId) || patterns.some((pattern) => facilityName === normalizeFacilityText(pattern));
  }) || null;
}

function normalizeFacilityText(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function renderHospitalPaymentLogicCards(hospital) {
  const hospitalType = hospital.hospitalType || "";
  const isCriticalAccess = hospitalType === "Critical Access Hospitals";
  const isRural = hospital.countyContext?.ruralUrbanClassification === "Rural";
  const system = hospital.systemAffiliation;
  const logic = [
    isCriticalAccess
      ? ["Medicare hospital logic", "Critical Access Hospital status means Medicare reimbursement analysis should account for CAH cost-based rules, swing-bed possibility, and rural access policy context."]
      : ["Medicare hospital logic", "Acute inpatient analysis should connect MS-DRG, principal diagnosis, procedures, CC/MCC severity, transfer status, outliers, and LOS expectations."],
    ["Medicaid hospital logic", "Attach Illinois HFS hospital rate sheets and Medicaid managed-care public payment data where available. Public files may show rates or payment totals, not full claim adjudication."],
    ["Outpatient logic", "Attach APC/OPPS, fee schedule, emergency department level, observation, drug, lab, imaging, and therapy payment rules where public files support it."],
    system
      ? ["System-level logic", `${system.systemName} may centralize careers, billing, revenue cycle, price transparency, transfer pathways, and consolidated financial reporting. Keep CCN-level and system-level evidence separate.`]
      : ["System-level logic", "Map parent system, management, ownership, and shared services before interpreting facility-only signals."],
    isRural
      ? ["Access context", "Rural county context makes emergency access, transfer patterns, workforce demand, and service-line availability important validation questions."]
      : ["Market context", "Urban or mixed county context should be compared against nearby competitors, service mix, ownership, quality ratings, and price-transparency files."]
  ];

  return logic.map(([title, body]) => `
    <article class="logic-card">
      <strong>${escapeHtml(title)}</strong>
      <p>${escapeHtml(body)}</p>
    </article>
  `).join("");
}

function renderHospitalAuditLayerMap(hospital) {
  const system = hospital.systemAffiliation;
  const priceSource = getPriceTransparencySources().find((source) => String(source.facilityId) === String(hospital.facilityId));
  const priceExamples = getPriceTransparencyRecords().filter((record) => String(record.facilityId) === String(hospital.facilityId));
  const costReport = getCostReportForHospital(hospital);
  const layers = [
    {
      title: "Prices",
      status: priceExamples.length ? "loaded" : priceSource ? "mapped" : "next",
      detail: priceExamples.length
        ? `${formatIntegerOrNA(priceExamples.length)} parsed service examples`
        : priceSource
          ? "Machine-readable file mapped"
          : "Find hospital machine-readable file",
      warning: "Price is not paid reimbursement."
    },
    {
      title: "Public Payer Payment",
      status: "scaffolded",
      detail: "Attach Medicare/HFS rate and payment files",
      warning: "Payment is not cost."
    },
    {
      title: "Facility Economics",
      status: costReport ? "loaded" : "next",
      detail: costReport
        ? `${formatCurrencyOrNA(costReport.netPatientRevenue, 0)} net patient revenue / ${formatCurrencyOrNA(costReport.totalOperatingExpense, 0)} operating expense`
        : "Attach cost reports, beds, revenue, expense, utilization",
      warning: "Cost is not margin."
    },
    {
      title: "System Financials",
      status: system ? "mapped" : "next",
      detail: system ? `${system.systemName} crosswalk attached` : "Attach 990, audited statements, bond disclosures",
      warning: "System margin may not equal facility margin."
    }
  ];

  return layers.map((layer) => `
    <article class="hospital-audit-layer">
      <span class="status-dot status-${layer.status === "loaded" ? "loaded" : layer.status === "mapped" || layer.status === "scaffolded" ? "partial" : "next"}">${escapeHtml(layer.status)}</span>
      <strong>${escapeHtml(layer.title)}</strong>
      <small>${escapeHtml(layer.detail)}</small>
      <em>${escapeHtml(layer.warning)}</em>
    </article>
  `).join("");
}

function renderHospitalReimbursementStatusCards(hospital) {
  return getHospitalReimbursementStatusItems(hospital).map((card) => `
    <article class="reimbursement-status-card">
      <div class="reimbursement-card-head">
        <span>${escapeHtml(card.status)}</span>
        <strong>${escapeHtml(card.label)}</strong>
      </div>
      <small>${escapeHtml(card.source)}</small>
      <dl>
        <div>
          <dt>Can prove</dt>
          <dd>${escapeHtml(card.proves)}</dd>
        </div>
        <div>
          <dt>Limit</dt>
          <dd>${escapeHtml(card.limit)}</dd>
        </div>
      </dl>
      <a href="${escapeHtml(card.sourceUrl)}" target="_blank" rel="noreferrer">Open source</a>
    </article>
  `).join("");
}

function renderHospitalReimbursementStatusTiles(hospital) {
  return getHospitalReimbursementStatusItems(hospital).map((item) => `
    <div class="reimbursement-status-tile">
      <span>${escapeHtml(item.status)}</span>
      <strong>${escapeHtml(item.label)}</strong>
    </div>
  `).join("");
}

function getHospitalReimbursementStatusItems(hospital) {
  const countyContext = hospital.countyContext?.ruralUrbanClassification || "Not matched";
  return [
    {
      label: "HFS Medicaid rate sheet",
      status: "Next data layer",
      source: "Illinois HFS hospital rate sheets",
      sourceUrl: "https://hfs.illinois.gov/medicalproviders/medicaidreimbursement/hospital/hrs.html",
      proves: "Published Illinois Medicaid hospital rate context where facility-level rates are available.",
      limit: "Does not prove claim-level allowed amount, managed-care contract terms, denials, or patient severity."
    },
    {
      label: "Hospital price transparency file",
      status: "Next data layer",
      source: `${hospital.systemAffiliation?.systemName || hospital.facilityName} machine-readable file`,
      sourceUrl: hospital.systemAffiliation?.homepageUrl || "https://www.cms.gov/priorities/key-initiatives/hospital-price-transparency",
      proves: "Gross charges, cash prices, and payer-specific negotiated-rate signals for selected codes when the file is found and parsed.",
      limit: "Does not prove volume, actual collected payment, medical necessity, or patient-specific responsibility."
    },
    {
      label: "DRG / outpatient code detail",
      status: "Next data layer",
      source: "CMS IPPS, OPPS, CPT/HCPCS, revenue-code, and HFS rule files",
      sourceUrl: "https://www.cms.gov/medicare/payment/prospective-payment-systems/acute-inpatient-pps",
      proves: "The rule logic behind inpatient admission, diagnosis/procedure coding, LOS, transfers, outliers, ED, observation, and outpatient services.",
      limit: "Requires code-level examples and cannot be inferred from hospital master data alone."
    },
    {
      label: "County context",
      status: countyContext,
      source: "County Health Rankings and matched county context",
      sourceUrl: "https://www.countyhealthrankings.org/health-data/illinois/data-and-resources",
      proves: "Rurality, poverty, older-adult share, and local social context that can frame access and reimbursement questions.",
      limit: "Context only. It does not prove reimbursement adequacy or hospital financial distress."
    }
  ];
}

function renderHospitalSystemContext(hospital) {
  const system = hospital.systemAffiliation;
  if (!system) {
    return `
      <section class="profile-section">
        <h4>System Context</h4>
        <div class="callout muted-callout">No health-system affiliation is mapped yet for this hospital. That does not prove independence; it means the current public-data layer has not attached a parent/system crosswalk.</div>
      </section>
    `;
  }

  const peers = getHospitalsInSystem(system)
    .filter((peer) => peer.facilityId !== hospital.facilityId)
    .slice(0, 8);
  const peerRows = peers.length
    ? peers.map((peer) => `
      <article class="table-row compact" data-hospital-row="${escapeHtml(peer.facilityId)}">
        <div>
          <strong>${escapeHtml(peer.facilityName)}</strong>
          <small>${escapeHtml(peer.city)} / ${escapeHtml(peer.county)} / ${escapeHtml(peer.hospitalType)}</small>
        </div>
        <div class="numeric">${hospitalPriorityScore(peer)} signal / ${starLabel(peer.overallRating)}</div>
      </article>
    `).join("")
    : '<p class="status">No peer hospitals from this system are currently matched in the CMS hospital file.</p>';

  return `
    <section class="profile-section system-context">
      <h4>System Context</h4>
      <div class="system-summary">
        <div>
          <strong>${escapeHtml(system.systemName)}</strong>
          <p>${escapeHtml(system.sourceNote || "System affiliation source note unavailable.")}</p>
          <div class="system-links">
            ${system.homepageUrl ? `<a href="${escapeHtml(system.homepageUrl)}" target="_blank" rel="noreferrer">System site</a>` : ""}
            ${system.careersUrl ? `<a href="${escapeHtml(system.careersUrl)}" target="_blank" rel="noreferrer">System careers</a>` : ""}
            ${system.sourceUrl ? `<a href="${escapeHtml(system.sourceUrl)}" target="_blank" rel="noreferrer">Affiliation source</a>` : ""}
          </div>
        </div>
        <div class="profile-grid">
          ${renderProfileMetric("Mapped peer hospitals", formatIntegerOrNA(getHospitalsInSystem(system).length))}
          ${renderProfileMetric("System type", system.systemType || "Not classified")}
          ${renderProfileMetric("Careers source", system.careersUrl ? "System-level" : "Not mapped")}
          ${renderProfileMetric("Evidence caution", "Separate CCN vs system")}
        </div>
      </div>
      <div class="system-peer-grid">
        <section>
          <h5>System Peers In This Dataset</h5>
          <div class="data-table">${peerRows}</div>
        </section>
        <section>
          <h5>Why System Affiliation Changes The Audit</h5>
          <div class="finding-list compact-findings">
            ${system.auditNotes.map((note) => `<div class="finding">${escapeHtml(note)}</div>`).join("")}
          </div>
        </section>
      </div>
    </section>
  `;
}

function getHospitalsInSystem(system) {
  if (!system) return [];
  const ids = new Set((system.facilityIds || []).map(String));
  const patterns = system.facilityNamePatterns || [];
  return state.hospitalRecords
    .filter((hospital) => ids.has(String(hospital.facilityId || "")) || patterns.some((pattern) => normalizeFacilityText(hospital.facilityName) === normalizeFacilityText(pattern)))
    .map((hospital) => ({
      ...hospital,
      countyContext: hospital.countyContext || state.countySummaries.find((county) => normalizeCountyName(county.county) === normalizeCountyName(hospital.county)) || null,
      systemAffiliation: system
    }))
    .sort((a, b) => hospitalPriorityScore(b) - hospitalPriorityScore(a));
}

function renderHospitalEvidenceChecklist(hospital, careers) {
  const system = hospital.systemAffiliation;
  const checklist = [
    {
      label: "CMS hospital master record",
      status: "loaded",
      detail: `${hospital.facilityId || "Unknown CCN"} / ${hospital.hospitalType || "Unknown type"}`
    },
    {
      label: "CMS quality signals",
      status: "loaded",
      detail: `${starLabel(hospital.overallRating)} overall / ${formatIntegerOrNA(hospital.readmissionWorse)} readmission worse`
    },
    {
      label: "County social context",
      status: hospital.countyContext ? "loaded" : "missing",
      detail: hospital.countyContext
        ? `${hospital.countyContext.ruralUrbanClassification || "Unknown"} / poverty ${formatOptionalPercent(hospital.countyContext.povertyRate)} / age 65+ ${formatOptionalPercent(hospital.countyContext.age65PlusPercent)}`
        : "County context not matched"
    },
    {
      label: "Health-system affiliation",
      status: system ? "loaded" : "next",
      detail: system
        ? `${system.systemName} / ${formatIntegerOrNA(getHospitalsInSystem(system).length)} mapped hospital records`
        : "Attach parent system, management, and shared-service crosswalk"
    },
    {
      label: "Careers/workforce signal",
      status: careers?.careerPageUrl || system?.careersUrl ? "partial" : "next",
      detail: careers?.careerPageUrl
        ? `${Number.isFinite(careers.jobOpeningCount) ? formatIntegerOrNA(careers.jobOpeningCount) : "Uncounted"} roles / ${careers.platform || "unknown platform"}`
        : system?.careersUrl
          ? `System careers available: ${system.systemName}`
        : "Careers page and role counts not captured yet"
    },
    {
      label: "HFS hospital reimbursement",
      status: "next",
      detail: "Attach Illinois hospital Medicaid rate sheet and provider-level payment records"
    },
    {
      label: "Machine-readable price file",
      status: "next",
      detail: "Find payer/plan rates for DRG, CPT/HCPCS, revenue-code, pharmacy, lab, imaging, ED, and observation examples"
    },
    {
      label: "Cost report economics",
      status: "next",
      detail: "Attach CMS HCRIS revenue, expense, utilization, wage, cost-to-charge, and margin fields"
    },
    {
      label: "Clinical reimbursement bridge",
      status: "next",
      detail: "Attach DRG/APR-DRG, LOS, transfer, outlier, HAC/POA, and readmission logic"
    }
  ];

  return checklist.map((item) => `
    <article class="evidence-check">
      <span class="status-dot status-${escapeHtml(item.status)}">${escapeHtml(item.status)}</span>
      <div>
        <strong>${escapeHtml(item.label)}</strong>
        <small>${escapeHtml(item.detail)}</small>
      </div>
    </article>
  `).join("");
}

function renderHospitalAuditQuestions(hospital) {
  const system = hospital.systemAffiliation;
  const questions = [
    `${hospital.facilityName} should be tested first for emergency admission pathways: ED visit, observation, inpatient admission, transfer, and discharge status.`,
    `For its ${hospital.hospitalType || "hospital"} designation, compare the public payment logic against actual service lines that are visible in CMS quality, price transparency, and cost-report files.`,
    `Review whether worse readmission, mortality, or safety signals overlap with payment-risk categories such as readmission penalties, HAC/POA exposure, denials, or avoidable LOS variance.`,
    `Use county context to ask whether reimbursement adequacy, workforce demand, patient mix, and rural access pressure are pointing in the same direction or contradicting each other.`
  ];

  if (system) {
    questions.unshift(`Because ${hospital.facilityName} is mapped to ${system.systemName}, look for system-level careers, price transparency, shared billing/revenue-cycle operations, transfer patterns, and consolidated financial statements before treating it as a stand-alone facility.`);
  }
  if (hospital.hospitalType === "Critical Access Hospitals") {
    questions.unshift("Because this is a Critical Access Hospital, separate CAH cost-based Medicare logic from ordinary acute-care DRG logic before interpreting reimbursement performance.");
  }
  if (hospital.overallRating <= 2) {
    questions.push("The low CMS overall rating makes measure-level quality validation a priority before using the signal in any finance argument.");
  }

  return questions.map((question) => `<div class="finding">${escapeHtml(question)}</div>`).join("");
}

function getFacilityCareerRecord(facility) {
  const records = Array.isArray(state.facilityCareers)
    ? state.facilityCareers
    : state.facilityCareers.records || [];
  const facilityId = String(facility.facilityId || facility.code || "").trim();
  const facilityName = String(facility.facilityName || facility.facility || "").toUpperCase().trim();
  return records.find((record) => {
    const recordId = String(record.facilityId || record.code || "").trim();
    const recordName = String(record.facilityName || record.facility || "").toUpperCase().trim();
    return (facilityId && recordId === facilityId) || (facilityName && recordName === facilityName);
  }) || null;
}

function renderHospitalRiskRows(hospitals) {
  const watchlist = hospitals
    .filter((hospital) => hospitalPriorityScore(hospital) >= 25)
    .slice(0, 20);
  if (!watchlist.length) return '<p class="status">No hospital watchlist records match the current search.</p>';
  return watchlist.map((hospital) => `
    <article class="table-row compact" data-hospital-row="${escapeHtml(hospital.facilityId)}">
      <div>
        <strong>${escapeHtml(hospital.facilityName)}</strong>
        <small>${escapeHtml(hospital.city)} / ${escapeHtml(hospital.county)} / ${escapeHtml(hospital.hospitalType)}</small>
      </div>
      <div class="numeric">${hospitalPriorityScore(hospital)} signal / ${starLabel(hospital.overallRating)} / ER ${escapeHtml(hospital.emergencyServices || "N/A")}</div>
    </article>
  `).join("");
}

function renderHospitalRateValueRows(hospitals) {
  const rows = hospitals
    .filter((hospital) => hospital.hfsPayment)
    .sort((a, b) => {
      const aRate = a.hfsPayment?.paymentFields?.ipCos20AcuteDrgRate || 0;
      const bRate = b.hfsPayment?.paymentFields?.ipCos20AcuteDrgRate || 0;
      return bRate - aRate;
    })
    .slice(0, 20);
  if (!rows.length) return '<p class="status">No parsed HFS hospital rate values match the current search.</p>';
  return rows.map((hospital) => {
    const fields = hospital.hfsPayment?.paymentFields || {};
    return `
      <article class="table-row compact" data-hospital-row="${escapeHtml(hospital.facilityId)}">
        <div>
          <strong>${escapeHtml(hospital.facilityName)}</strong>
          <small>${escapeHtml(hospital.city)} / HFS ${escapeHtml(hospital.hfsPayment?.hfsProviderId || "N/A")} / ${escapeHtml(hospital.hospitalType)}</small>
        </div>
        <div class="numeric">DRG ${formatCurrencyOrNA(fields.ipCos20AcuteDrgRate)} / OP EAPG ${formatCurrencyOrNA(fields.opCos24AcuteEapgConversionFactorBaseRate)} / CCR ${formatNumberOrNA(fields.medicareIppsAggregateCcr, 3)}</div>
      </article>
    `;
  }).join("");
}

function renderPaymentExplorerFindings(hospitals, selected) {
  if (!hospitals.length) return '<div class="finding">No parsed HFS hospital payment records match the current search.</div>';
  const acuteDrgRates = getPaymentValues(hospitals, "ipCos20AcuteDrgRate");
  const opEapgRates = getPaymentValues(hospitals, "opCos24AcuteEapgConversionFactorBaseRate");
  const rehabPerDiems = getPaymentValues(hospitals, "ipCos22RehabPerDiemRate");
  const selectedFields = selected?.hfsPayment?.paymentFields || {};
  const findings = [
    `${hospitals.length} hospitals in the current view have parsed HFS payment parameters from public 2026 rate sheets.`,
    acuteDrgRates.length ? `The average available IP COS 20 Acute DRG Rate in this view is ${formatCurrencyOrNA(average(acuteDrgRates))}, with a range of ${formatCurrencyOrNA(Math.min(...acuteDrgRates))} to ${formatCurrencyOrNA(Math.max(...acuteDrgRates))}.` : "Acute DRG rates are not available for the current filtered hospital set.",
    opEapgRates.length ? `The average outpatient acute EAPG base rate is ${formatCurrencyOrNA(average(opEapgRates))}, which can support outpatient reimbursement benchmarking once service-level logic is added.` : "Outpatient acute EAPG fields are not available for the current filtered hospital set.",
    rehabPerDiems.length ? `${rehabPerDiems.length} hospitals have inpatient rehab per-diem values, useful for separating specialty hospital payment parameters from acute-care comparisons.` : "Rehab per-diem fields are mostly N/A in this filtered view, which is expected for many acute-care hospitals.",
    selected ? `${selected.facilityName} is selected. Its acute DRG rate is ${formatCurrencyOrNA(selectedFields.ipCos20AcuteDrgRate)} and its OP acute EAPG base rate is ${formatCurrencyOrNA(selectedFields.opCos24AcuteEapgConversionFactorBaseRate)}.` : "Select a hospital to compare its HFS payment parameters to statewide and peer benchmarks.",
    "These comparisons are exploratory rate-sheet analytics and do not estimate a final reimbursement amount without DRG/APC grouping, claim details, modifiers, managed-care rules, and validation."
  ];
  return findings.map((finding) => `<div class="finding">${escapeHtml(finding)}</div>`).join("");
}

function renderPaymentComparisonCards(hospitals, selected) {
  const fields = selected?.hfsPayment?.paymentFields || {};
  const peerHospitals = getPaymentPeers(selected, hospitals);
  const metrics = [
    buildPaymentComparisonMetric("IP acute DRG rate", fields.ipCos20AcuteDrgRate, hospitals, peerHospitals, "ipCos20AcuteDrgRate"),
    buildPaymentComparisonMetric("IP psych per diem", fields.ipCos21PsychPerDiemRate, hospitals, peerHospitals, "ipCos21PsychPerDiemRate"),
    buildPaymentComparisonMetric("IP rehab per diem", fields.ipCos22RehabPerDiemRate, hospitals, peerHospitals, "ipCos22RehabPerDiemRate"),
    buildPaymentComparisonMetric("OP acute EAPG base", fields.opCos24AcuteEapgConversionFactorBaseRate, hospitals, peerHospitals, "opCos24AcuteEapgConversionFactorBaseRate"),
    buildPaymentComparisonMetric("OP psych EAPG base", fields.opCos2728PsychEapgConversionFactorBaseRate, hospitals, peerHospitals, "opCos2728PsychEapgConversionFactorBaseRate"),
    buildPaymentComparisonMetric("OP rehab EAPG base", fields.opCos29RehabEapgConversionFactorBaseRate, hospitals, peerHospitals, "opCos29RehabEapgConversionFactorBaseRate"),
    buildPaymentComparisonMetric("Medicare IPPS CCR", fields.medicareIppsAggregateCcr, hospitals, peerHospitals, "medicareIppsAggregateCcr", false),
    buildPaymentComparisonMetric("IP wage index", fields.ipCos20AcuteWageIndex, hospitals, peerHospitals, "ipCos20AcuteWageIndex", false)
  ];
  return metrics.map((metric) => `
    <article class="metric-card">
      <span>${escapeHtml(metric.value)}</span>
      <small>${escapeHtml(metric.label)} / ${escapeHtml(metric.detail)}</small>
    </article>
  `).join("");
}

function buildPaymentComparisonMetric(label, value, hospitals, peerHospitals, field, isCurrency = true) {
  const allValues = getPaymentValues(hospitals, field);
  const peerValues = getPaymentValues(peerHospitals, field);
  const formatter = isCurrency ? formatCurrencyOrNA : (raw) => formatNumberOrNA(raw, field.includes("Ccr") ? 3 : 4);
  const allAverage = allValues.length ? average(allValues) : null;
  const peerAverage = peerValues.length ? average(peerValues) : null;
  const spread = Number.isFinite(value) && Number.isFinite(allAverage) ? value - allAverage : null;
  const spreadText = Number.isFinite(spread)
    ? `${spread >= 0 ? "+" : "-"}${formatter(Math.abs(spread))} vs state`
    : "";
  return {
    label,
    value: formatter(value),
    detail: `state avg ${formatter(allAverage)} / peer avg ${formatter(peerAverage)}${spreadText ? ` / ${spreadText}` : ""}`
  };
}

function renderPaymentHospitalRows(hospitals) {
  if (!hospitals.length) return '<p class="status">No parsed HFS hospital payment records match the current search.</p>';
  return hospitals
    .slice()
    .sort((a, b) => {
      const aRate = a.hfsPayment?.paymentFields?.ipCos20AcuteDrgRate || 0;
      const bRate = b.hfsPayment?.paymentFields?.ipCos20AcuteDrgRate || 0;
      return bRate - aRate;
    })
    .slice(0, 40)
    .map((hospital) => {
      const fields = hospital.hfsPayment?.paymentFields || {};
      return `
        <article class="table-row compact" data-payment-hospital-row="${escapeHtml(hospital.facilityId)}">
          <div>
            <strong>${escapeHtml(hospital.facilityName)}</strong>
            <small>${escapeHtml(hospital.city)} / ${escapeHtml(hospital.county)} / ${escapeHtml(hospital.hospitalType)}</small>
          </div>
          <div class="numeric">DRG ${formatCurrencyOrNA(fields.ipCos20AcuteDrgRate)} / OP ${formatCurrencyOrNA(fields.opCos24AcuteEapgConversionFactorBaseRate)}</div>
        </article>
      `;
    }).join("");
}

function renderPaymentDrilldown(hospital, hospitals) {
  if (!hospital) return '<p class="status">Select a hospital with parsed HFS payment parameters.</p>';
  const fields = hospital.hfsPayment?.paymentFields || {};
  const peerHospitals = getPaymentPeers(hospital, hospitals);
  return `
    <div class="profile-header">
      <div>
        <h3>${escapeHtml(hospital.facilityName)}</h3>
        <p>${escapeHtml(hospital.city)}, IL / ${escapeHtml(hospital.county)} County / ${escapeHtml(hospital.hospitalType)}</p>
      </div>
      <span class="tag">HFS ${escapeHtml(hospital.hfsPayment?.hfsProviderId || "N/A")}</span>
    </div>
    <section class="profile-section">
      <h4>Core Payment Parameters</h4>
      <div class="profile-grid">
        ${renderProfileMetric("IP acute DRG rate", formatCurrencyOrNA(fields.ipCos20AcuteDrgRate))}
        ${renderProfileMetric("Acute standardized amount", formatCurrencyOrNA(fields.ipCos20AcuteStandardizedAmount))}
        ${renderProfileMetric("Psych per diem", formatCurrencyOrNA(fields.ipCos21PsychPerDiemRate))}
        ${renderProfileMetric("Rehab per diem", formatCurrencyOrNA(fields.ipCos22RehabPerDiemRate))}
        ${renderProfileMetric("OP acute EAPG base", formatCurrencyOrNA(fields.opCos24AcuteEapgConversionFactorBaseRate))}
        ${renderProfileMetric("OP psych EAPG base", formatCurrencyOrNA(fields.opCos2728PsychEapgConversionFactorBaseRate))}
        ${renderProfileMetric("OP rehab EAPG base", formatCurrencyOrNA(fields.opCos29RehabEapgConversionFactorBaseRate))}
        ${renderProfileMetric("Outlier fixed-loss", formatCurrencyOrNA(fields.ipCos20AcuteOutlierFixedLossAmount))}
      </div>
    </section>
    <section class="profile-section">
      <h4>Adjustment / Context Fields</h4>
      <div class="profile-grid">
        ${renderProfileMetric("IP wage index", formatNumberOrNA(fields.ipCos20AcuteWageIndex, 4))}
        ${renderProfileMetric("OP wage index", formatNumberOrNA(fields.opWageIndex, 4))}
        ${renderProfileMetric("Medicare IPPS CCR", formatNumberOrNA(fields.medicareIppsAggregateCcr, 3))}
        ${renderProfileMetric("SMART Act factor", formatNumberOrNA(fields.smartActAdjustmentFactor, 3))}
        ${renderProfileMetric("Trauma level", fields.traumaLevel || "N/A")}
        ${renderProfileMetric("Perinatal level", fields.perinatalLevel || "N/A")}
        ${renderProfileMetric("Rate enhancement", fields.rateEnhancementType || "N/A")}
        ${renderProfileMetric("Drug/device add-on", fields.eligibleHighCostDrugDeviceAddOn || "N/A")}
      </div>
      <p class="profile-note">${peerHospitals.length} peer hospitals are included using the selected hospital type within the current search/filter context.</p>
    </section>
  `;
}

function renderPaymentPeerRows(selected, hospitals) {
  if (!selected) return '<p class="status">Select a hospital to view peer benchmarks.</p>';
  const fields = selected.hfsPayment?.paymentFields || {};
  const peers = getPaymentPeers(selected, hospitals);
  const rows = [
    ["IP acute DRG rate", "ipCos20AcuteDrgRate", true],
    ["IP psych per diem", "ipCos21PsychPerDiemRate", true],
    ["IP rehab per diem", "ipCos22RehabPerDiemRate", true],
    ["OP acute EAPG base", "opCos24AcuteEapgConversionFactorBaseRate", true],
    ["OP psych EAPG base", "opCos2728PsychEapgConversionFactorBaseRate", true],
    ["OP rehab EAPG base", "opCos29RehabEapgConversionFactorBaseRate", true],
    ["Medicare IPPS CCR", "medicareIppsAggregateCcr", false],
    ["IP wage index", "ipCos20AcuteWageIndex", false]
  ];
  return rows.map(([label, field, isCurrency]) => {
    const selectedValue = fields[field];
    const stateValues = getPaymentValues(hospitals, field);
    const peerValues = getPaymentValues(peers, field);
    const format = isCurrency ? formatCurrencyOrNA : (value) => formatNumberOrNA(value, field === "medicareIppsAggregateCcr" ? 3 : 4);
    return `
      <article class="table-row compact">
        <div>
          <strong>${escapeHtml(label)}</strong>
          <small>Selected ${format(selectedValue)} / State avg ${format(stateValues.length ? average(stateValues) : null)}</small>
        </div>
        <div class="numeric">Peer avg ${format(peerValues.length ? average(peerValues) : null)} / n=${peerValues.length}</div>
      </article>
    `;
  }).join("");
}

function renderPaymentDictionaryRows() {
  const rows = [
    ["IP acute DRG rate", "Facility-specific inpatient acute rate parameter before claim-specific grouping and policy logic."],
    ["Psych / rehab per diem", "Daily inpatient payment parameter for psychiatric or rehabilitation service categories where applicable."],
    ["EAPG base rate", "Outpatient base payment parameter used with outpatient grouping logic and service-specific adjustments."],
    ["CCR", "Cost-to-charge ratio signal used in Medicare/IPPS context and outlier or cost-based analytics."],
    ["Wage index", "Geographic labor-cost adjustment factor that can affect payment rates."],
    ["Outlier fixed-loss", "Threshold-style parameter related to unusually high-cost inpatient cases."],
    ["SMART Act factor", "Illinois policy adjustment factor shown on the HFS rate sheet."],
    ["Drug/device add-on", "Indicator that high-cost drug or device add-on payments may apply under HFS rules."]
  ];
  return rows.map(([term, definition]) => `
    <article class="table-row compact">
      <div>
        <strong>${escapeHtml(term)}</strong>
        <small>${escapeHtml(definition)}</small>
      </div>
    </article>
  `).join("");
}

function getPaymentValues(hospitals, field) {
  return hospitals
    .map((hospital) => hospital.hfsPayment?.paymentFields?.[field])
    .filter((value) => Number.isFinite(value));
}

function getPaymentPeers(selected, hospitals) {
  if (!selected) return [];
  return hospitals.filter((hospital) => hospital.hospitalType === selected.hospitalType && hospital.facilityId !== selected.facilityId);
}

function renderHospitalRoadmapCards() {
  const roadmap = [
    "Validate parsed HFS hospital payment parameters against a manual PDF review sample and track future HFS updates.",
    "Add selected hospital price transparency files for gross charge, cash price, and payer negotiated-rate comparisons.",
    "Attach facility homepages, careers pages, and public job-opening counts as workforce-demand signals.",
    "Bring in CMS measure-level quality data for readmissions, mortality, safety, patient experience, and timely/effective care.",
    "Add emergency access, obstetric access, rurality, and county social-risk overlays for hospital disparity analysis."
  ];
  return roadmap.map((item) => `<div class="finding">${escapeHtml(item)}</div>`).join("");
}

function summarizeChains(facilities) {
  const groups = new Map();
  facilities.forEach((facility) => {
    const chainName = getChainName(facility);
    const id = getChainId(chainName);
    if (!groups.has(id)) {
      groups.set(id, {
        id,
        name: chainName,
        facilities: [],
        counties: new Set(),
        geographies: new Set(),
        ownershipTypes: new Set()
      });
    }
    const group = groups.get(id);
    group.facilities.push(facility);
    if (facility.quality?.county) group.counties.add(facility.quality.county);
    if (facility.geography?.tier) group.geographies.add(facility.geography.tier);
    if (facility.quality?.ownershipType) group.ownershipTypes.add(facility.quality.ownershipType);
  });

  return [...groups.values()].map((group) => {
    const facilitiesInGroup = group.facilities;
    const elevatedFacilities = facilitiesInGroup.filter((facility) => ["High Risk", "Elevated Risk"].includes(facility.risk.risk_level));
    const lowCapitalFacilities = facilitiesInGroup.filter((facility) => facility.risk.factors.some((factor) => factor.label === "Low capital reimbursement"));
    const weakStaffingFacilities = facilitiesInGroup.filter((facility) => facility.quality?.staffingStarRating <= 2);
    const lowQualityFacilities = facilitiesInGroup.filter((facility) => facility.quality?.overallStarRating <= 2);
    const totalFines = sum(facilitiesInGroup.map((facility) => facility.quality?.totalFinesDollars));
    const totalPenalties = sum(facilitiesInGroup.map((facility) => facility.quality?.totalNumberOfPenalties));
    return {
      ...group,
      count: facilitiesInGroup.length,
      averageRisk: average(facilitiesInGroup.map((facility) => facility.risk.risk_score)),
      averageTotalRate: average(facilitiesInGroup.map((facility) => facility.publishedAmount).filter(Number.isFinite)),
      averageCapitalRate: average(facilitiesInGroup.map((facility) => facility.components?.capitalRate).filter(Number.isFinite)),
      averageStaffingRating: average(facilitiesInGroup.map((facility) => facility.quality?.staffingStarRating).filter(Number.isFinite)),
      averageOverallRating: average(facilitiesInGroup.map((facility) => facility.quality?.overallStarRating).filter(Number.isFinite)),
      averageRnHours: average(facilitiesInGroup.map((facility) => facility.quality?.rnStaffingHoursPerResidentDay).filter(Number.isFinite)),
      averageResidentsPerDay: average(facilitiesInGroup.map((facility) => facility.quality?.averageResidentsPerDay).filter(Number.isFinite)),
      elevatedCount: elevatedFacilities.length,
      elevatedShare: elevatedFacilities.length / facilitiesInGroup.length,
      lowCapitalCount: lowCapitalFacilities.length,
      weakStaffingCount: weakStaffingFacilities.length,
      lowQualityCount: lowQualityFacilities.length,
      totalFines,
      totalPenalties,
      countyCount: group.counties.size,
      geographyList: [...group.geographies].sort(),
      ownershipList: [...group.ownershipTypes].sort()
    };
  }).sort((a, b) => {
    if (b.averageRisk !== a.averageRisk) return b.averageRisk - a.averageRisk;
    return b.count - a.count;
  });
}

function getChainName(facility) {
  const chain = String(facility.quality?.chainName || "").trim();
  if (chain) return chain;
  return facility.quality?.legalBusinessName || facility.quality?.ownershipType || "Independent / not listed";
}

function getChainId(chainName) {
  return String(chainName || "unknown").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function renderChainInsights(chains) {
  if (!chains.length) return '<div class="finding">No matched operator data is available under the current filters.</div>';
  const multiFacilityChains = chains.filter((chain) => chain.count >= 2);
  const highestRisk = multiFacilityChains[0] || chains[0];
  const highestElevatedShare = [...multiFacilityChains].sort((a, b) => b.elevatedShare - a.elevatedShare)[0] || highestRisk;
  const weakStaffing = [...multiFacilityChains].sort((a, b) => b.weakStaffingCount - a.weakStaffingCount)[0] || highestRisk;
  const penaltySignal = [...chains].sort((a, b) => b.totalPenalties - a.totalPenalties)[0] || highestRisk;
  const findings = [
    `${highestRisk.name} has the highest average facility risk score among multi-facility operators in this view at ${highestRisk.averageRisk.toFixed(1)} across ${highestRisk.count} matched facilities.`,
    `${highestElevatedShare.name} has ${formatPercent(highestElevatedShare.elevatedShare)} of matched facilities in elevated or high risk tiers, which may suggest a portfolio-level review priority.`,
    `${weakStaffing.name} has ${weakStaffing.weakStaffingCount} matched facilities with CMS staffing ratings of 1-2 stars, a possible staffing vulnerability signal.`,
    `${penaltySignal.name} shows ${formatIntegerOrNA(penaltySignal.totalPenalties)} CMS penalty records in the current matched data. This is an enforcement signal, not a complete financial or quality conclusion.`
  ];
  return findings.map((finding) => `<div class="finding">${escapeHtml(finding)}</div>`).join("");
}

function renderChainSummaryRows(chains) {
  const ranked = chains.filter((chain) => chain.count >= 2).slice(0, 20);
  if (!ranked.length) return '<p class="status">No multi-facility operators match the current filters.</p>';
  return ranked.map((chain) => `
    <article class="table-row compact" data-chain-row="${escapeHtml(chain.id)}">
      <div>
        <strong>${escapeHtml(chain.name)}</strong>
        <small>${chain.count} facilities / ${chain.countyCount} counties / ${escapeHtml(chain.geographyList.join(", ") || "Unclassified")}</small>
      </div>
      <div class="numeric">${chain.averageRisk.toFixed(1)} avg risk / ${formatPercent(chain.elevatedShare)} elevated / ${formatCurrencyOrNA(chain.averageCapitalRate)} capital</div>
    </article>
  `).join("");
}

function renderChainDrilldown(chain) {
  if (!chain) return '<p class="status">Select an operator row to view portfolio details.</p>';
  return `
    <div class="profile-header">
      <div>
        <h3>${escapeHtml(chain.name)}</h3>
        <p>${chain.count} matched facilities across ${chain.countyCount} Illinois counties</p>
      </div>
      <span class="risk-pill ${riskClass(riskLevelForScore(chain.averageRisk))}">${riskLevelForScore(chain.averageRisk)} ${chain.averageRisk.toFixed(1)}</span>
    </div>
    <section class="profile-section">
      <h4>Portfolio Metrics</h4>
      <div class="profile-grid">
        ${renderProfileMetric("Matched facilities", formatIntegerOrNA(chain.count))}
        ${renderProfileMetric("Elevated/high risk share", formatPercent(chain.elevatedShare))}
        ${renderProfileMetric("Avg total per diem", formatCurrencyOrNA(chain.averageTotalRate))}
        ${renderProfileMetric("Avg capital rate", formatCurrencyOrNA(chain.averageCapitalRate))}
        ${renderProfileMetric("Avg staffing stars", formatNumberOrNA(chain.averageStaffingRating, 1))}
        ${renderProfileMetric("Avg overall stars", formatNumberOrNA(chain.averageOverallRating, 1))}
        ${renderProfileMetric("Avg RN HPRD", formatNumberOrNA(chain.averageRnHours, 2))}
        ${renderProfileMetric("Avg residents/day", formatNumberOrNA(chain.averageResidentsPerDay, 1))}
        ${renderProfileMetric("Low capital facilities", formatIntegerOrNA(chain.lowCapitalCount))}
        ${renderProfileMetric("Weak staffing facilities", formatIntegerOrNA(chain.weakStaffingCount))}
        ${renderProfileMetric("Total penalties", formatIntegerOrNA(chain.totalPenalties))}
        ${renderProfileMetric("Total fines", formatCurrencyOrNA(chain.totalFines, 0))}
      </div>
      <p class="profile-note">Operator rollups can reveal portfolio patterns, but CMS chain fields may not fully reflect current ownership, management, lease, or real-estate control.</p>
    </section>
    <section class="profile-section">
      <h4>Footprint</h4>
      <div class="profile-grid">
        ${renderProfileMetric("Geographies", chain.geographyList.join(", ") || "Unclassified")}
        ${renderProfileMetric("Ownership types", chain.ownershipList.join(", ") || "N/A")}
        ${renderProfileMetric("Counties represented", [...chain.counties].sort().join(", ") || "N/A")}
        ${renderProfileMetric("Low quality facilities", formatIntegerOrNA(chain.lowQualityCount))}
      </div>
    </section>
  `;
}

function renderChainWatchlistRows(chains) {
  const watchlist = chains
    .filter((chain) => chain.count >= 2 && (chain.averageRisk >= 50 || chain.elevatedShare >= 0.5 || chain.weakStaffingCount >= 2 || chain.lowCapitalCount >= 2))
    .slice(0, 12);
  if (!watchlist.length) return '<p class="status">No operator watchlist records match the current filters.</p>';
  return watchlist.map((chain) => `
    <article class="table-row compact" data-chain-row="${escapeHtml(chain.id)}">
      <div>
        <strong>${escapeHtml(chain.name)}</strong>
        <small>${chain.weakStaffingCount} weak staffing / ${chain.lowCapitalCount} low capital / ${chain.lowQualityCount} low overall quality</small>
      </div>
      <div class="numeric">${chain.averageRisk.toFixed(1)} avg risk / ${formatIntegerOrNA(chain.totalPenalties)} penalties</div>
    </article>
  `).join("");
}

function renderChainFacilityRows(chain) {
  if (!chain) return '<p class="status">Select an operator to view facilities.</p>';
  return [...chain.facilities]
    .sort((a, b) => b.risk.risk_score - a.risk.risk_score)
    .slice(0, 20)
    .map((facility) => `
      <article class="table-row compact" data-risk-row="${escapeHtml(getFacilityRiskId(facility))}">
        <div>
          <strong>${escapeHtml(facility.facility)}</strong>
          <small>${escapeHtml(facility.city)} / ${escapeHtml(facility.quality?.county || "Unknown county")} / ${escapeHtml(facility.risk.risk_level)}</small>
        </div>
        <div class="numeric">${facility.risk.risk_score} risk / ${formatCurrencyOrNA(facility.components?.capitalRate)} capital / Staffing ${facility.quality?.staffingStarRating || "N/A"}</div>
      </article>
    `).join("");
}

function getRiskFacilities() {
  const countyByName = new Map(state.countySummaries.map((county) => [normalizeCountyName(county.county), county]));
  return state.qualityRecords
    .filter((record) => Number.isFinite(record.publishedAmount))
    .map((record) => {
      const county = countyByName.get(normalizeCountyName(record.quality?.county));
      return {
        ...record,
        countyContext: county || null,
        risk: calculateFacilityRisk(record, county)
      };
    });
}

function getFilteredRiskFacilities() {
  const query = state.query.toLowerCase().trim();
  return getRiskFacilities().filter((facility) => {
    const categoryMatch = state.category === "all" || facility.category === state.category;
    const tierMatch = !state.tier || state.tier === "all" || facility.geography?.tier === state.tier;
    const riskMatch = state.riskLevel === "all" || facility.risk.risk_level === state.riskLevel;
    const ownershipMatch = state.ownership === "all" || facility.quality?.ownershipType === state.ownership;
    const staffingMatch = state.staffingRating === "all" || String(facility.quality?.staffingStarRating) === state.staffingRating;
    const haystack = [
      facility.facility,
      facility.city,
      facility.category,
      facility.geography?.tier,
      facility.quality?.county,
      facility.quality?.ownershipType,
      facility.risk.risk_level,
      facility.risk.factors.map((factor) => factor.label).join(" ")
    ].join(" ").toLowerCase();

    return categoryMatch && tierMatch && riskMatch && ownershipMatch && staffingMatch && (!query || haystack.includes(query));
  }).sort((a, b) => b.risk.risk_score - a.risk.risk_score);
}

function calculateFacilityRisk(record, county) {
  const allRecords = state.qualityRecords;
  const capitalP25 = percentile(allRecords.map((item) => item.components?.capitalRate), 0.25);
  const totalP25 = percentile(allRecords.map((item) => item.publishedAmount), 0.25);
  const bedsP25 = percentile(allRecords.map((item) => item.quality?.certifiedBeds), 0.25);
  const rnP25 = percentile(allRecords.map((item) => item.quality?.rnStaffingHoursPerResidentDay), 0.25);
  const povertyP75 = percentile(state.countySummaries.map((item) => item.povertyRate), 0.75);
  const factors = [];
  let score = 0;

  function add(condition, points, label, description) {
    if (!condition) return;
    score += points;
    factors.push({ points, label, description });
  }

  add(record.components?.capitalRate <= capitalP25, 18, "Low capital reimbursement", "Potential infrastructure pressure indicator.");
  add(record.publishedAmount <= totalP25, 12, "Low total reimbursement", "Lower per-diem reimbursement indicator.");
  add(record.quality?.staffingStarRating <= 2, 16, "Low staffing rating", "Possible staffing vulnerability indicator.");
  add(record.quality?.overallStarRating <= 2, 14, "Low overall rating", "CMS quality screening indicator.");
  add(["Downstate / Smaller Market"].includes(record.geography?.tier) || county?.ruralUrbanClassification === "Rural", 12, "Rural/downstate context", "Potential access and market fragility indicator.");
  add(record.quality?.certifiedBeds <= bedsP25, 8, "Low certified bed count", "Smaller facility scale indicator.");
  add(county?.povertyRate >= povertyP75, 10, "High county poverty", "County social-risk context indicator.");
  add(record.quality?.rnStaffingHoursPerResidentDay <= rnP25, 10, "Low RN hours", "Lower RN hours per resident day indicator.");

  const risk_score = Math.min(100, Math.round(score));
  return {
    risk_score,
    risk_level: riskLevelForScore(risk_score),
    factors
  };
}

function riskLevelForScore(score) {
  if (score >= 70) return "High Risk";
  if (score >= 50) return "Elevated Risk";
  if (score >= 25) return "Moderate Risk";
  return "Low Risk";
}

function riskClass(level) {
  return {
    "Low Risk": "risk-low",
    "Moderate Risk": "risk-moderate",
    "Elevated Risk": "risk-elevated",
    "High Risk": "risk-high"
  }[level] || "risk-moderate";
}

function getFacilityRiskId(facility) {
  return facility.quality?.cmsCertificationNumber || facility.code || `${facility.facility}-${facility.city}`;
}

function renderRiskInsights(facilities) {
  if (!facilities.length) {
    return '<div class="finding">No matched facilities are available under the current filters.</div>';
  }
  const highOrElevated = facilities.filter((facility) => ["High Risk", "Elevated Risk"].includes(facility.risk.risk_level));
  const lowerCapitalElevated = highOrElevated.filter((facility) => facility.risk.factors.some((factor) => factor.label === "Low capital reimbursement"));
  const ruralStaffingCapital = highOrElevated.filter((facility) => (
    facility.risk.factors.some((factor) => factor.label === "Rural/downstate context")
    && facility.risk.factors.some((factor) => factor.label === "Low staffing rating")
    && facility.risk.factors.some((factor) => factor.label === "Low capital reimbursement")
  ));
  const avgRisk = average(facilities.map((facility) => facility.risk.risk_score));
  const findings = [
    `${highOrElevated.length} of ${facilities.length} matched facilities are currently in elevated or high risk tiers, with an average risk score of ${avgRisk.toFixed(1)}.`,
    `${lowerCapitalElevated.length} elevated/high-risk facilities also trigger the low-capital reimbursement indicator, which may suggest potential infrastructure pressure.`,
    `${ruralStaffingCapital.length} elevated/high-risk rural or downstate facilities also show lower staffing and lower capital indicators, a pattern that warrants further operational or capital review.`
  ];
  return findings.map((finding) => `<div class="finding">${escapeHtml(finding)}</div>`).join("");
}

function renderIllinoisRiskMap(facilities) {
  const plotted = facilities.filter((facility) => Number.isFinite(facility.quality?.latitude) && Number.isFinite(facility.quality?.longitude));
  if (!plotted.length) return '<p class="status">No geocoded facilities match the current filters.</p>';
  const markers = plotted.map((facility) => {
    const point = projectIllinoisPoint(facility.quality.latitude, facility.quality.longitude);
    const id = escapeHtml(getFacilityRiskId(facility));
    return `
      <circle class="map-marker ${riskClass(facility.risk.risk_level)}" data-risk-id="${id}" cx="${point.x}" cy="${point.y}" r="${markerRadius(facility.risk.risk_score)}">
        <title>${escapeHtml(facility.facility)} | total ${formatCurrencyOrNA(facility.publishedAmount)} | capital ${formatCurrencyOrNA(facility.components?.capitalRate)} | staffing ${facility.quality?.staffingStarRating || "N/A"} | risk ${facility.risk.risk_score}</title>
      </circle>
    `;
  }).join("");

  return `
    <svg viewBox="0 0 260 520" role="img" aria-label="Illinois facility risk map">
      <path d="M95 8 L180 16 L205 82 L190 150 L214 226 L198 312 L220 402 L178 505 L112 500 L95 422 L65 370 L82 300 L58 230 L78 150 L62 82 Z" fill="#f8faf8" stroke="#b8c2ba" stroke-width="2"></path>
      ${markers}
    </svg>
  `;
}

function projectIllinoisPoint(latitude, longitude) {
  const minLat = 36.9;
  const maxLat = 42.6;
  const minLon = -91.6;
  const maxLon = -87.0;
  return {
    x: 30 + ((longitude - minLon) / (maxLon - minLon)) * 200,
    y: 500 - ((latitude - minLat) / (maxLat - minLat)) * 480
  };
}

function markerRadius(score) {
  return 3.5 + (score / 100) * 4.5;
}

function renderFacilityDrilldown(facility) {
  if (!facility) return '<p class="status">Select a facility marker or row to view details.</p>';
  const quality = facility.quality || {};
  const capitalShare = Number.isFinite(facility.components?.capitalRate) && Number.isFinite(facility.publishedAmount) && facility.publishedAmount > 0
    ? facility.components.capitalRate / facility.publishedAmount
    : null;
  const factors = facility.risk.factors.length
    ? facility.risk.factors.map((factor) => `<span>${escapeHtml(factor.label)} (+${factor.points})</span>`).join("")
    : "<span>No major risk factors triggered</span>";
  return `
    <div class="profile-header">
      <div>
        <h3>${escapeHtml(facility.facility)}</h3>
        <p>${escapeHtml(quality.address || "Address unavailable")} ${escapeHtml(quality.city || facility.city)}, IL ${escapeHtml(quality.zipCode || "")}</p>
      </div>
      <span class="risk-pill ${riskClass(facility.risk.risk_level)}">${escapeHtml(facility.risk.risk_level)} ${facility.risk.risk_score}</span>
    </div>

    <section class="profile-section">
      <h4>Facility Snapshot</h4>
      <div class="profile-grid">
        ${renderProfileMetric("CMS CCN", quality.cmsCertificationNumber)}
        ${renderProfileMetric("County / Geography", `${quality.county || "Unknown"} / ${facility.geography?.tier || "Unclassified"}`)}
        ${renderProfileMetric("Ownership", quality.ownershipType)}
        ${renderProfileMetric("Legal business name", quality.legalBusinessName)}
        ${renderProfileMetric("Chain", quality.chainName || "Independent / not listed")}
        ${renderProfileMetric("Facilities in chain", formatIntegerOrNA(quality.numberOfFacilitiesInChain))}
        ${renderProfileMetric("Certified beds", formatIntegerOrNA(quality.certifiedBeds))}
        ${renderProfileMetric("Avg residents/day", formatNumberOrNA(quality.averageResidentsPerDay, 1))}
        ${renderProfileMetric("Provider type", quality.providerType)}
        ${renderProfileMetric("First approved", quality.dateFirstApproved)}
      </div>
    </section>

    <section class="profile-section">
      <h4>Medication Services</h4>
      <div class="profile-grid">
        ${renderProfileMetric("In-house pharmacy", "Not available in CMS/HFS dataset")}
        ${renderProfileMetric("Medication vendor", "Not available in CMS/HFS dataset")}
        ${renderProfileMetric("Resident/family council", quality.residentFamilyCouncil)}
        ${renderProfileMetric("Hospital-based provider", quality.providerResidesInHospital)}
      </div>
      <p class="profile-note">CMS Care Compare and HFS rate files do not identify the facility pharmacy, consultant pharmacist, medication packaging vendor, or contract pharmacy relationship. To answer “who services their meds,” add pharmacy disclosure records, inspection reports, contracts, NPI relationships, or facility-reported vendor data.</p>
    </section>

    <section class="profile-section">
      <h4>Staffing Intensity</h4>
      <div class="profile-grid">
        ${renderProfileMetric("Staffing stars", starLabel(quality.staffingStarRating))}
        ${renderProfileMetric("RN HPRD", formatNumberOrNA(quality.rnStaffingHoursPerResidentDay, 2))}
        ${renderProfileMetric("Total nurse HPRD", formatNumberOrNA(quality.totalNurseStaffingHoursPerResidentDay, 2))}
        ${renderProfileMetric("Nurse aide HPRD", formatNumberOrNA(quality.nurseAideHoursPerResidentDay, 2))}
        ${renderProfileMetric("LPN HPRD", formatNumberOrNA(quality.lpnHoursPerResidentDay, 2))}
        ${renderProfileMetric("Licensed staff HPRD", formatNumberOrNA(quality.licensedStaffingHoursPerResidentDay, 2))}
        ${renderProfileMetric("Weekend total HPRD", formatNumberOrNA(quality.weekendTotalNurseStaffingHoursPerResidentDay, 2))}
        ${renderProfileMetric("Weekend RN HPRD", formatNumberOrNA(quality.weekendRnHoursPerResidentDay, 2))}
        ${renderProfileMetric("Total nurse turnover", formatOptionalPercent(quality.totalNursingStaffTurnover))}
        ${renderProfileMetric("RN turnover", formatOptionalPercent(quality.registeredNurseTurnover))}
      </div>
      <p class="profile-note">HPRD means staffing hours per resident day. It is a staffing-intensity measure, not a literal nurse-to-patient headcount.</p>
    </section>

    <section class="profile-section">
      <h4>Reimbursement Components</h4>
      <div class="profile-grid">
        ${renderProfileMetric("Total Medicaid per diem", formatCurrencyOrNA(facility.publishedAmount))}
        ${renderProfileMetric("Nursing rate", formatCurrencyOrNA(facility.components?.nursingRate))}
        ${renderProfileMetric("Support rate", formatCurrencyOrNA(facility.components?.supportRate))}
        ${renderProfileMetric("Capital rate", formatCurrencyOrNA(facility.components?.capitalRate))}
        ${renderProfileMetric("Capital share", capitalShare === null ? "N/A" : formatPercent(capitalShare))}
        ${renderProfileMetric("Effective date", facility.effectiveDate || "N/A")}
      </div>
    </section>

    <section class="profile-section">
      <h4>Quality, Survey, and Penalty Signals</h4>
      <div class="profile-grid">
        ${renderProfileMetric("Overall stars", starLabel(quality.overallStarRating))}
        ${renderProfileMetric("Health inspection stars", starLabel(quality.healthInspectionRating))}
        ${renderProfileMetric("Quality measure stars", starLabel(quality.qualityMeasureRating))}
        ${renderProfileMetric("Special focus status", quality.specialFocusStatus)}
        ${renderProfileMetric("Abuse icon", quality.abuseIcon)}
        ${renderProfileMetric("Ownership changed last 12 mo.", quality.providerChangedOwnershipLast12Months)}
        ${renderProfileMetric("Cycle 1 deficiencies", formatIntegerOrNA(quality.ratingCycle1HealthDeficiencies))}
        ${renderProfileMetric("Weighted survey score", formatNumberOrNA(quality.totalWeightedHealthSurveyScore, 1))}
        ${renderProfileMetric("Infection citations", formatIntegerOrNA(quality.infectionControlCitations))}
        ${renderProfileMetric("Fines", formatIntegerOrNA(quality.numberOfFines))}
        ${renderProfileMetric("Fine dollars", formatCurrencyOrNA(quality.totalFinesDollars, 0))}
        ${renderProfileMetric("Payment denials", formatIntegerOrNA(quality.numberOfPaymentDenials))}
      </div>
      <p class="profile-note">These are public CMS quality and enforcement indicators. They are useful screening signals, not complete operating or clinical context.</p>
    </section>

    <section class="profile-section">
      <h4>Financial Visibility</h4>
      <div class="profile-grid">
        ${renderProfileMetric("Public rate signal", `${formatCurrencyOrNA(facility.publishedAmount)} per resident day`)}
        ${renderProfileMetric("Penalty signal", `${formatIntegerOrNA(quality.totalNumberOfPenalties)} penalties / ${formatCurrencyOrNA(quality.totalFinesDollars, 0)} fines`)}
        ${renderProfileMetric("Financial statements", "Not available in CMS/HFS dataset")}
        ${renderProfileMetric("Debt/liquidity/cash flow", "Not available in CMS/HFS dataset")}
      </div>
      <p class="profile-note">This profile does not show audited financials, profitability, debt, liquidity, lease burden, or vendor contracts. Those would require cost reports, ownership filings, bond disclosures, bankruptcy/court records, or facility/operator disclosures.</p>
    </section>

    <section class="profile-section">
      <h4>Risk Factors Triggered</h4>
      <div class="risk-factor-list">${factors}</div>
    </section>
  `;
}

function renderTopRiskFacilityRows(facilities) {
  if (!facilities.length) return '<p class="status">No facilities match the current filters.</p>';
  return facilities.slice(0, 25).map((facility) => `
    <article class="table-row compact" data-risk-row="${escapeHtml(getFacilityRiskId(facility))}">
      <div>
        <strong>${escapeHtml(facility.facility)}</strong>
        <small>${escapeHtml(facility.city)} / ${escapeHtml(facility.quality?.county || "Unknown county")} / ${escapeHtml(facility.risk.risk_level)} / Click to open profile</small>
      </div>
      <div class="numeric">${facility.risk.risk_score} / ${formatCurrencyOrNA(facility.components?.capitalRate)} / Staffing ${facility.quality?.staffingStarRating || "N/A"}</div>
    </article>
  `).join("");
}

function renderProfileMetric(label, value) {
  const displayValue = value === null || value === undefined || value === "" ? "N/A" : value;
  return `
    <div class="profile-metric">
      <span>${escapeHtml(displayValue)}</span>
      <small>${escapeHtml(label)}</small>
    </div>
  `;
}

function starLabel(value) {
  if (!Number.isFinite(value)) return "N/A";
  return `${value} star${value === 1 ? "" : "s"}`;
}

function renderRiskDistribution(facilities) {
  const levels = ["High Risk", "Elevated Risk", "Moderate Risk", "Low Risk"];
  const maxCount = Math.max(...levels.map((level) => facilities.filter((facility) => facility.risk.risk_level === level).length), 1);
  return levels.map((level) => {
    const count = facilities.filter((facility) => facility.risk.risk_level === level).length;
    return `
      <article class="component-row">
        <div><strong>${escapeHtml(level)}</strong><small>${count} facilities</small></div>
        <div class="component-bar"><span class="${riskClass(level)}" style="width: ${(count / maxCount) * 100}%"></span></div>
        <div class="component-value">${count}</div>
      </article>
    `;
  }).join("");
}

function renderRiskBreakdown(facility) {
  if (!facility) return '<p class="status">Select a facility to view risk factors.</p>';
  if (!facility.risk.factors.length) return '<p class="status">No major risk indicators triggered for the selected facility.</p>';
  return facility.risk.factors.map((factor) => `
    <article class="component-row">
      <div><strong>${escapeHtml(factor.label)}</strong><small>${escapeHtml(factor.description)}</small></div>
      <div class="component-bar"><span style="width: ${(factor.points / 18) * 100}%"></span></div>
      <div class="component-value">+${factor.points}</div>
    </article>
  `).join("");
}

function renderHighestRiskCountyRows(facilities) {
  const groups = summarizeRiskBy(facilities, (facility) => normalizeCountyName(facility.quality?.county));
  if (!groups.length) return '<p class="status">No county risk data matches the current filters.</p>';
  return groups.slice(0, 10).map((group) => `
    <article class="table-row compact">
      <div>
        <strong>${escapeHtml(titleCase(group.key))}</strong>
        <small>${group.count} matched facilities</small>
      </div>
      <div class="numeric">${group.average.toFixed(1)} avg risk</div>
    </article>
  `).join("");
}

function renderRiskByGeographyRows(facilities) {
  const groups = summarizeRiskBy(facilities, (facility) => facility.geography?.tier || "Unclassified");
  if (!groups.length) return '<p class="status">No geography risk data matches the current filters.</p>';
  return groups.map((group) => `
    <article class="table-row compact">
      <div>
        <strong>${escapeHtml(group.key)}</strong>
        <small>${group.count} matched facilities</small>
      </div>
      <div class="numeric">${group.average.toFixed(1)} avg risk</div>
    </article>
  `).join("");
}

function summarizeRiskBy(facilities, getKey) {
  const groups = new Map();
  facilities.forEach((facility) => {
    const key = getKey(facility) || "Unknown";
    if (!groups.has(key)) groups.set(key, { key, count: 0, total: 0 });
    const group = groups.get(key);
    group.count += 1;
    group.total += facility.risk.risk_score;
  });
  return [...groups.values()]
    .map((group) => ({ ...group, average: group.total / group.count }))
    .sort((a, b) => b.average - a.average);
}

function renderRiskScatter(facilities, xKey, label) {
  const points = facilities.filter((facility) => {
    const x = xKey === "staffing" ? facility.quality?.staffingStarRating : facility[xKey];
    return Number.isFinite(x) && Number.isFinite(facility.risk.risk_score);
  });
  if (!points.length) return '<p class="status">No scatterplot data matches the current filters.</p>';
  const xValues = points.map((facility) => xKey === "staffing" ? facility.quality.staffingStarRating : facility[xKey]);
  const minX = Math.min(...xValues);
  const maxX = Math.max(...xValues);
  const circles = points.map((facility) => {
    const xValue = xKey === "staffing" ? facility.quality.staffingStarRating : facility[xKey];
    const x = 35 + ((xValue - minX) / Math.max(maxX - minX, 1)) * 220;
    const y = 220 - (facility.risk.risk_score / 100) * 190;
    return `
      <circle class="scatter-dot ${riskClass(facility.risk.risk_level)}" data-risk-id="${escapeHtml(getFacilityRiskId(facility))}" cx="${x}" cy="${y}" r="4">
        <title>${escapeHtml(facility.facility)} | ${label}: ${xKey === "staffing" ? xValue : formatCurrencyOrNA(xValue)} | risk ${facility.risk.risk_score}</title>
      </circle>
    `;
  }).join("");
  return `
    <svg viewBox="0 0 290 250" role="img" aria-label="Risk scatterplot">
      <line x1="35" y1="220" x2="270" y2="220" stroke="#b8c2ba"></line>
      <line x1="35" y1="20" x2="35" y2="220" stroke="#b8c2ba"></line>
      <text x="36" y="242" font-size="11" fill="#5e6a63">${escapeHtml(label)}</text>
      <text x="2" y="20" font-size="11" fill="#5e6a63">Risk</text>
      ${circles}
    </svg>
  `;
}

function titleCase(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function renderPolicyExecutiveFindings() {
  const countySummaries = getFilteredCountySummaries();
  const qualityRecords = getFilteredQualityRecords();
  const highReimbursementLowQuality = getHighReimbursementLowQualityCounties(countySummaries);
  const lowReimbursementHighRisk = getLowReimbursementHighRiskCounties(countySummaries);
  const highCapitalWeakStaffing = getHighCapitalWeakStaffingFacilities(qualityRecords);
  const ruralLimitedCoverage = getRuralLimitedCoverageCounties(countySummaries);

  els.policySummaryCards.innerHTML = renderPolicySummaryCards({
    countySummaries,
    qualityRecords,
    highReimbursementLowQuality,
    lowReimbursementHighRisk,
    highCapitalWeakStaffing,
    ruralLimitedCoverage
  });
  els.policyNarrative.innerHTML = renderPolicyNarrative({
    highReimbursementLowQuality,
    lowReimbursementHighRisk,
    highCapitalWeakStaffing,
    ruralLimitedCoverage
  });
  els.policySuggestionCards.innerHTML = renderPolicySuggestionCards({
    highReimbursementLowQuality,
    lowReimbursementHighRisk,
    highCapitalWeakStaffing,
    ruralLimitedCoverage
  });
  els.highReimbursementLowQualityCounties.innerHTML = renderPolicyCountyRows(highReimbursementLowQuality, "quality");
  els.lowReimbursementHighRiskCounties.innerHTML = renderPolicyCountyRows(lowReimbursementHighRisk, "risk");
  els.highCapitalWeakStaffingFacilities.innerHTML = renderPolicyFacilityRows(highCapitalWeakStaffing);
  els.ruralLimitedCoverageCounties.innerHTML = renderPolicyCountyRows(ruralLimitedCoverage, "coverage");
}

function summarizeBy(records, getKey) {
  const groups = new Map();

  records.forEach((record) => {
    const key = getKey(record);
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        count: 0,
        total: 0,
        min: Infinity,
        max: -Infinity
      });
    }

    const group = groups.get(key);
    group.count += 1;
    group.total += record.publishedAmount;
    group.min = Math.min(group.min, record.publishedAmount);
    group.max = Math.max(group.max, record.publishedAmount);
  });

  return [...groups.values()]
    .map((group) => ({
      ...group,
      average: group.total / group.count
    }))
    .sort((a, b) => b.average - a.average);
}

function renderComparisonRows(groups, compact) {
  if (!groups.length) {
    return '<p class="status">No reimbursed records match the current filters.</p>';
  }

  return groups.map((group) => {
    const [title, subtitle] = group.key.split("|");
    return `
      <article class="comparison-row">
        <div>
          <strong>${escapeHtml(title)}</strong>
          <small>${escapeHtml(subtitle || `${group.count} records`)}</small>
        </div>
        <div class="comparison-value">
          ${currency.format(group.average)}
          <small>${compact ? `${group.count} records` : `${group.count} records, ${currency.format(group.min)}-${currency.format(group.max)}`}</small>
        </div>
      </article>
    `;
  }).join("");
}

function buildGeographyCommentary(groups) {
  if (groups.length < 2) {
    return "Use the filters to compare published Illinois Medicaid long-term-care rates across HFS geography groups.";
  }

  const highest = groups[0];
  const lowest = groups[groups.length - 1];
  const spread = highest.average - lowest.average;

  return `${highest.key} has the highest average published rate in the current view at ${currency.format(highest.average)}, while ${lowest.key} is lowest at ${currency.format(lowest.average)}. The current spread is ${currency.format(spread)} per day. This geography lens uses HFS Health Service Areas as an MVP proxy, not final county-level rural/urban coding.`;
}

function renderComponentRows(records) {
  const components = [
    { key: "nursingRate", label: "Nursing" },
    { key: "supportRate", label: "Support" },
    { key: "capitalRate", label: "Capital" }
  ].map((component) => {
    const values = records
      .map((record) => record.components?.[component.key])
      .filter((value) => Number.isFinite(value));
    const total = values.reduce((sum, value) => sum + value, 0);

    return {
      ...component,
      count: values.length,
      average: values.length ? total / values.length : 0
    };
  });

  const maxAverage = Math.max(...components.map((component) => component.average), 1);

  return components.map((component) => `
    <article class="component-row">
      <div>
        <strong>${escapeHtml(component.label)}</strong>
        <small>${component.count} records</small>
      </div>
      <div class="component-bar" aria-hidden="true">
        <span style="width: ${(component.average / maxAverage) * 100}%"></span>
      </div>
      <div class="component-value">${currency.format(component.average)}</div>
    </article>
  `).join("");
}

function renderFacilityRows(records, direction) {
  const sorted = [...records]
    .filter((record) => Number.isFinite(record.publishedAmount))
    .sort((a, b) => direction === "desc"
      ? b.publishedAmount - a.publishedAmount
      : a.publishedAmount - b.publishedAmount)
    .slice(0, 10);

  if (!sorted.length) {
    return '<p class="status">No facilities match the current filters.</p>';
  }

  return sorted.map((record) => `
    <article class="facility-row">
      <div>
        <strong>${escapeHtml(record.facility)}</strong>
        <small>${escapeHtml(record.city)} / ${escapeHtml(record.geography?.tier || "Unclassified")} / ${escapeHtml(record.category)}</small>
      </div>
      <div class="comparison-value">${currency.format(record.publishedAmount)}</div>
    </article>
  `).join("");
}

function getCapitalRecords() {
  return getFilteredRecords().filter((record) => (
    Number.isFinite(record.components?.capitalRate)
    && Number.isFinite(record.components?.supportRate)
    && Number.isFinite(record.components?.nursingRate)
    && Number.isFinite(record.publishedAmount)
  ));
}

function getFilteredQualityRecords() {
  const query = state.query.toLowerCase().trim();

  return state.qualityRecords.filter((record) => {
    const categoryMatch = state.category === "all" || record.category === state.category;
    const tierMatch = !state.tier || state.tier === "all" || record.geography?.tier === state.tier;
    const haystack = [
      record.facility,
      record.city,
      record.category,
      record.geography?.tier,
      record.geography?.region,
      record.quality?.facilityName,
      record.quality?.county,
      record.quality?.ownershipType,
      record.quality?.cmsCertificationNumber
    ].join(" ").toLowerCase();

    return categoryMatch && tierMatch && (!query || haystack.includes(query));
  });
}

function getFilteredCountySummaries() {
  const qualityRecords = getFilteredQualityRecords();
  const allowedCounties = new Set(qualityRecords.map((record) => normalizeCountyName(record.quality?.county)));

  return state.countySummaries
    .filter((county) => allowedCounties.has(normalizeCountyName(county.county)))
    .map((county) => {
      const countyRecords = qualityRecords.filter((record) => normalizeCountyName(record.quality?.county) === normalizeCountyName(county.county));
      return {
        ...county,
        matchedFacilityCount: countyRecords.length,
        averageTotalRate: average(countyRecords.map((record) => record.publishedAmount).filter((value) => Number.isFinite(value))),
        averageCapitalRate: average(countyRecords.map((record) => record.components?.capitalRate).filter((value) => Number.isFinite(value))),
        averageOverallStarRating: average(countyRecords.map((record) => record.quality?.overallStarRating).filter((value) => Number.isFinite(value))),
        averageStaffingRating: average(countyRecords.map((record) => record.quality?.staffingStarRating).filter((value) => Number.isFinite(value)))
      };
    })
    .sort((a, b) => calculateCountyRiskScore(b) - calculateCountyRiskScore(a));
}

function summarizeCapitalByGeography(records) {
  const groups = new Map();

  records.forEach((record) => {
    const key = record.geography?.tier || "Unclassified";
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        count: 0,
        totalCapital: 0,
        totalRate: 0,
        ratioTotal: 0
      });
    }

    const group = groups.get(key);
    group.count += 1;
    group.totalCapital += record.components.capitalRate;
    group.totalRate += record.publishedAmount;
    group.ratioTotal += record.components.capitalRate / record.publishedAmount;
  });

  return [...groups.values()]
    .map((group) => ({
      key: group.key,
      count: group.count,
      averageCapital: group.totalCapital / group.count,
      averageTotal: group.totalRate / group.count,
      averageCapitalShare: group.ratioTotal / group.count
    }))
    .sort((a, b) => a.averageCapital - b.averageCapital);
}

function getCapitalRankedFacilities(records, direction, limit) {
  return [...records]
    .sort((a, b) => direction === "desc"
      ? b.components.capitalRate - a.components.capitalRate
      : a.components.capitalRate - b.components.capitalRate)
    .slice(0, limit);
}

function getCapitalWatchlist(records) {
  if (!records.length) return [];
  const sorted = getCapitalRankedFacilities(records, "asc", records.length);
  const thresholdCount = Math.max(1, Math.ceil(sorted.length * 0.2));
  return sorted.slice(0, thresholdCount);
}

function renderCapitalGeographyRows(groups) {
  if (!groups.length) {
    return '<p class="status">No capital-rate records match the current filters.</p>';
  }

  const rows = groups.map((group) => `
    <article class="table-row capital-geography-row">
      <div>
        <strong>${escapeHtml(group.key)}</strong>
        <small>${group.count} facilities</small>
      </div>
      <div class="numeric">${currency.format(group.averageCapital)}</div>
      <div class="numeric">${currency.format(group.averageTotal)}</div>
      <div class="numeric">${formatPercent(group.averageCapitalShare)}</div>
    </article>
  `).join("");

  return `
    <article class="table-row capital-geography-row header">
      <div>Geography</div>
      <div class="numeric">Capital</div>
      <div class="numeric">Total</div>
      <div class="numeric">Capital %</div>
    </article>
    ${rows}
  `;
}

function renderCapitalFacilityRows(records) {
  if (!records.length) {
    return '<p class="status">No facilities match the current filters.</p>';
  }

  return records.map((record) => `
    <article class="table-row compact">
      <div>
        <strong>${escapeHtml(record.facility)}</strong>
        <small>${escapeHtml(record.city)} / ${escapeHtml(record.geography?.tier || "Unclassified")}</small>
      </div>
      <div class="numeric">${currency.format(record.components.capitalRate)}</div>
    </article>
  `).join("");
}

function renderCapitalWatchlistRows(records) {
  if (!records.length) {
    return '<p class="status">No watchlist facilities match the current filters.</p>';
  }

  const rows = records.map((record) => `
    <article class="table-row watchlist">
      <div>
        <strong>${escapeHtml(record.facility)}</strong>
        <small>${escapeHtml(record.category)}</small>
      </div>
      <div>${escapeHtml(record.city)}</div>
      <div>${escapeHtml(record.geography?.tier || "Unclassified")}</div>
      <div class="numeric">${currency.format(record.components.capitalRate)}</div>
      <div class="numeric">${currency.format(record.components.supportRate)}</div>
      <div class="numeric">${currency.format(record.components.nursingRate)}</div>
      <div class="numeric">${currency.format(record.publishedAmount)}</div>
    </article>
  `).join("");

  return `
    <article class="table-row watchlist header">
      <div>Facility</div>
      <div>City</div>
      <div>Geography</div>
      <div class="numeric">Capital</div>
      <div class="numeric">Support</div>
      <div class="numeric">Nursing</div>
      <div class="numeric">Total</div>
    </article>
    ${rows}
  `;
}

function renderCapitalFindings(groups, watchlist) {
  if (!groups.length) {
    return '<div class="finding">Use the filters to generate capital equity findings from reimbursed long-term-care records.</div>';
  }

  const lowest = groups[0];
  const highest = groups[groups.length - 1];
  const downstate = groups.find((group) => group.key === "Downstate / Smaller Market");
  const chicago = groups.find((group) => group.key === "Chicago Metro");
  const geographyFinding = downstate && chicago
    ? `${downstate.key} facilities have an average capital component of ${currency.format(downstate.averageCapital)}, compared with ${currency.format(chicago.averageCapital)} for ${chicago.key}.`
    : `${lowest.key} has the lowest average capital component in the current view at ${currency.format(lowest.averageCapital)}, while ${highest.key} is highest at ${currency.format(highest.averageCapital)}.`;

  const watchlistFinding = `${watchlist.length} facilities fall into the bottom quintile of capital reimbursement under the current filters. These facilities may face higher risk of deferred maintenance or limited modernization capacity.`;
  const shareFinding = `${lowest.key} capital reimbursement averages ${formatPercent(lowest.averageCapitalShare)} of total per diem, making capital funding pressure visible separately from nursing and support rates.`;

  return [geographyFinding, watchlistFinding, shareFinding]
    .map((finding) => `<div class="finding">${escapeHtml(finding)}</div>`)
    .join("");
}

function summarizeByRating(records, getRating, getValue) {
  const groups = new Map();

  records.forEach((record) => {
    const rating = getRating(record);
    const value = getValue(record);
    if (!Number.isFinite(rating) || !Number.isFinite(value)) return;
    if (!groups.has(rating)) {
      groups.set(rating, { rating, count: 0, total: 0, min: Infinity, max: -Infinity });
    }

    const group = groups.get(rating);
    group.count += 1;
    group.total += value;
    group.min = Math.min(group.min, value);
    group.max = Math.max(group.max, value);
  });

  return [...groups.values()]
    .map((group) => ({ ...group, average: group.total / group.count }))
    .sort((a, b) => a.rating - b.rating);
}

function renderRatingRows(groups, ratingLabel, valueLabel) {
  if (!groups.length) {
    return '<p class="status">No matched quality records are available for this view.</p>';
  }

  const rows = groups.map((group) => `
    <article class="table-row">
      <div>
        <strong>${group.rating} star${group.rating === 1 ? "" : "s"}</strong>
        <small>${group.count} matched facilities</small>
      </div>
      <div class="numeric">${currency.format(group.average)}</div>
      <div class="numeric">${currency.format(group.min)}</div>
      <div class="numeric">${currency.format(group.max)}</div>
    </article>
  `).join("");

  return `
    <article class="table-row header">
      <div>${escapeHtml(ratingLabel)}</div>
      <div class="numeric">${escapeHtml(valueLabel)}</div>
      <div class="numeric">Low</div>
      <div class="numeric">High</div>
    </article>
    ${rows}
  `;
}

function getLowCapitalLowStaffing(records) {
  const capitalRecords = records
    .filter((record) => Number.isFinite(record.components?.capitalRate))
    .sort((a, b) => a.components.capitalRate - b.components.capitalRate);
  if (!capitalRecords.length) return [];

  const thresholdIndex = Math.max(0, Math.ceil(capitalRecords.length * 0.2) - 1);
  const threshold = capitalRecords[thresholdIndex].components.capitalRate;

  return capitalRecords
    .filter((record) => (
      record.components.capitalRate <= threshold
      && Number.isFinite(record.quality?.staffingStarRating)
      && record.quality.staffingStarRating <= 2
    ))
    .slice(0, 12);
}

function getHighRateLowQuality(records) {
  const rateRecords = records
    .filter((record) => Number.isFinite(record.publishedAmount))
    .sort((a, b) => b.publishedAmount - a.publishedAmount);
  if (!rateRecords.length) return [];

  const thresholdIndex = Math.max(0, Math.ceil(rateRecords.length * 0.25) - 1);
  const threshold = rateRecords[thresholdIndex].publishedAmount;

  return rateRecords
    .filter((record) => (
      record.publishedAmount >= threshold
      && Number.isFinite(record.quality?.overallStarRating)
      && record.quality.overallStarRating <= 2
    ))
    .slice(0, 12);
}

function renderQualityFacilityRows(records, ratingType) {
  if (!records.length) {
    return '<p class="status">No facilities match this watch condition under the current filters.</p>';
  }

  return records.map((record) => {
    const rating = ratingType === "staffing"
      ? record.quality.staffingStarRating
      : record.quality.overallStarRating;
    const ratingLabel = ratingType === "staffing" ? "Staffing" : "Overall";

    return `
      <article class="table-row">
        <div>
          <strong>${escapeHtml(record.facility)}</strong>
          <small>${escapeHtml(record.city)} / ${escapeHtml(record.quality?.county || "Unknown county")} / ${escapeHtml(record.geography?.tier || "Unclassified")}</small>
        </div>
        <div class="numeric">${currency.format(record.publishedAmount)}</div>
        <div class="numeric">${currency.format(record.components.capitalRate)}</div>
        <div class="numeric">${ratingLabel}: ${rating}</div>
      </article>
    `;
  }).join("");
}

function renderQualityFindings(records, lowCapitalLowStaffing, highRateLowQuality) {
  if (!records.length) {
    return '<div class="finding">No matched HFS/CMS quality records match the current filters.</div>';
  }

  const overallGroups = summarizeByRating(records, (record) => record.quality?.overallStarRating, (record) => record.publishedAmount);
  const staffingGroups = summarizeByRating(records, (record) => record.quality?.staffingStarRating, (record) => record.components?.capitalRate);
  const lowOverall = overallGroups[0];
  const highOverall = overallGroups[overallGroups.length - 1];
  const lowStaffing = staffingGroups[0];
  const highStaffing = staffingGroups[staffingGroups.length - 1];

  const findings = [
    `${records.length} HFS facility records are matched to CMS Care Compare quality records in the current view.`,
    lowOverall && highOverall
      ? `Average total rate is ${currency.format(lowOverall.average)} among ${lowOverall.rating}-star overall facilities and ${currency.format(highOverall.average)} among ${highOverall.rating}-star facilities; this is an association and requires further validation.`
      : "Overall-star correlation is limited in this filtered view because too few rated facilities are available.",
    lowStaffing && highStaffing
      ? `Average capital rate is ${currency.format(lowStaffing.average)} among ${lowStaffing.rating}-star staffing facilities and ${currency.format(highStaffing.average)} among ${highStaffing.rating}-star staffing facilities, which may suggest a relationship worth deeper testing.`
      : "Staffing-star correlation is limited in this filtered view because too few rated facilities are available.",
    `${lowCapitalLowStaffing.length} facilities currently show both low capital reimbursement and low staffing ratings; ${highRateLowQuality.length} show high reimbursement with low overall quality. These are screening flags, not causal findings.`
  ];

  return findings.map((finding) => `<div class="finding">${escapeHtml(finding)}</div>`).join("");
}

function renderExecutiveMetricCards(metrics) {
  const cards = [
    ["Total HFS records", metrics.totalRecords],
    ["Matched CMS/HFS records", metrics.matchedRecords],
    ["Avg total Medicaid per diem", currency.format(metrics.averageTotal)],
    ["Avg nursing component", currency.format(metrics.averageNursing)],
    ["Avg support component", currency.format(metrics.averageSupport)],
    ["Avg capital component", currency.format(metrics.averageCapital)],
    ["Lowest geography average", metrics.lowestGeography ? `${metrics.lowestGeography.key}: ${currency.format(metrics.lowestGeography.average)}` : "N/A"],
    ["Highest geography average", metrics.highestGeography ? `${metrics.highestGeography.key}: ${currency.format(metrics.highestGeography.average)}` : "N/A"],
    ["Missing geography classification", metrics.missingGeographyGroup ? `${metrics.missingGeographyGroup.count} records` : "0 records"]
  ];

  return cards.map(([label, value]) => `
    <article class="metric-card">
      <span>${escapeHtml(value)}</span>
      <small>${escapeHtml(label)}</small>
    </article>
  `).join("");
}

function renderExecutiveFindings({ records, tierGroups, missingGeographyGroup, capitalGroups, lowCapitalLowStaffing, highRateLowQuality }) {
  if (!records.length) {
    return '<div class="finding">No reimbursed records match the current filters.</div>';
  }

  const highestRate = tierGroups[0];
  const lowestRate = tierGroups[tierGroups.length - 1];
  const lowestCapital = capitalGroups[0];
  const highestCapital = capitalGroups[capitalGroups.length - 1];
  const capitalSpread = lowestCapital && highestCapital
    ? highestCapital.averageCapital - lowestCapital.averageCapital
    : 0;

  const findings = [
    highestRate && lowestRate
      ? `${highestRate.key} has the highest average total Medicaid per-diem rate at ${currency.format(highestRate.average)}, while ${lowestRate.key} is lowest at ${currency.format(lowestRate.average)}.`
      : "Geography-level total-rate findings require more than one geography group in the current view.",
    lowestRate
      ? `${lowestRate.key} may warrant closer equity review because it has the lowest average total reimbursement in this filtered dataset.`
      : "Lowest-geography review is not available for the current filters.",
    missingGeographyGroup
      ? `${missingGeographyGroup.count} reimbursed records are missing geography classification and are excluded from highest/lowest geography comparisons.`
      : "All reimbursed records in this view have a geography classification.",
    lowestCapital && highestCapital
      ? `Capital reimbursement varies by ${currency.format(capitalSpread)} per resident day between the lowest and highest geography averages, which appears meaningful for capital planning triage.`
      : "Capital-rate variation cannot be assessed for the current filters.",
    `${lowCapitalLowStaffing.length} matched facilities combine low capital reimbursement with low CMS staffing ratings, which may suggest overlapping workforce and infrastructure risk signals.`,
    `${highRateLowQuality.length} matched facilities show high reimbursement with low CMS overall quality ratings, creating outliers for operational and quality-improvement review.`,
    "These patterns are associations and screening signals; they require validation with facility addresses, ownership context, cost reports, and longitudinal quality trends."
  ];

  return findings.map((finding) => `<div class="finding">${escapeHtml(finding)}</div>`).join("");
}

function renderStrategyItems(items) {
  return items.map(([title, body]) => `
    <article class="strategy-item">
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(body)}</span>
    </article>
  `).join("");
}

const LOOK_CLOSER_COUNTIES = ["Hardin", "Massac", "Fayette", "Franklin", "Union", "Wayne"];

function getLookCloserCounties(counties, riskFlags) {
  const byCounty = new Map(counties.map((county) => [normalizeCountyName(county.county), county]));
  const named = LOOK_CLOSER_COUNTIES
    .map((county) => byCounty.get(normalizeCountyName(county)))
    .filter(Boolean);
  const namedKeys = new Set(named.map((county) => normalizeCountyName(county.county)));
  const flaggedCountyNames = new Set(riskFlags.map(({ county }) => normalizeCountyName(county.county)));
  const similar = counties
    .filter((county) => !namedKeys.has(normalizeCountyName(county.county)))
    .filter((county) => flaggedCountyNames.has(normalizeCountyName(county.county)))
    .sort((a, b) => {
      const flagDelta = getCountyFlags(b, riskFlags).length - getCountyFlags(a, riskFlags).length;
      return flagDelta || calculateCountyRiskScore(b) - calculateCountyRiskScore(a);
    })
    .slice(0, 4);

  return [...named, ...similar];
}

function getCountyFlags(county, riskFlags) {
  const key = normalizeCountyName(county?.county);
  return riskFlags.filter((item) => normalizeCountyName(item.county?.county) === key);
}

function renderLookCloserCountyCards(counties, riskFlags) {
  if (!counties.length) {
    return '<p class="status">No priority counties match the current filters.</p>';
  }

  return counties.map((county) => {
    const flags = getCountyFlags(county, riskFlags);
    const isSelected = normalizeCountyName(county.county) === normalizeCountyName(state.selectedCountyName);
    const topFlag = flags[0]?.flag || getCountySignalLabel(county);
    return `
      <button class="county-focus-card${isSelected ? " active" : ""}" type="button" data-county-focus="${escapeHtml(county.county)}">
        <span class="county-focus-kicker">${escapeHtml(county.ruralUrbanClassification || "Unknown")} / Risk ${formatNumberOrNA(calculateCountyRiskScore(county), 1)}</span>
        <strong>${escapeHtml(county.county)} County</strong>
        <span>${escapeHtml(topFlag)}</span>
        <span class="county-focus-metrics">
          ${formatCurrencyOrNA(county.averageTotalRate)} avg total / ${formatCurrencyOrNA(county.averageCapitalRate)} capital / Staffing ${formatNumberOrNA(county.averageStaffingRating, 1)}
        </span>
      </button>
    `;
  }).join("");
}

function renderCountyDrilldown(county, riskFlags) {
  if (!county) {
    return '<p class="status">Select a county to view validation context.</p>';
  }

  const flags = getCountyFlags(county, riskFlags);
  const facilities = getRiskFacilities()
    .filter((facility) => normalizeCountyName(facility.quality?.county) === normalizeCountyName(county.county))
    .sort((a, b) => b.risk.risk_score - a.risk.risk_score);
  const priorityReasons = renderCountyPriorityReasons(county, flags);
  const facilityRows = facilities.length
    ? facilities.slice(0, 8).map((facility) => `
      <article class="table-row compact" data-risk-row="${escapeHtml(getFacilityRiskId(facility))}">
        <div>
          <strong>${escapeHtml(facility.facility)}</strong>
          <small>${escapeHtml(facility.city)} / ${escapeHtml(facility.quality?.ownershipType || "Unknown ownership")} / ${escapeHtml(facility.risk.risk_level)}</small>
        </div>
        <div class="numeric">${facility.risk.risk_score} risk / ${formatCurrencyOrNA(facility.publishedAmount)} total / ${formatCurrencyOrNA(facility.components?.capitalRate)} capital</div>
      </article>
    `).join("")
    : '<p class="status">No matched facility records are available for this county under the current filters.</p>';

  return `
    <article class="county-drilldown-card">
      <div class="county-drilldown-head">
        <div>
          <p class="eyebrow">Look closer</p>
          <h4>${escapeHtml(county.county)} County</h4>
        </div>
        <span class="risk-pill risk-elevated">${formatNumberOrNA(calculateCountyRiskScore(county), 1)} score</span>
      </div>
      <div class="county-evidence-grid">
        ${renderCountyEvidenceMetric("Matched facilities", county.matchedFacilityCount)}
        ${renderCountyEvidenceMetric("Avg Medicaid per diem", formatCurrencyOrNA(county.averageTotalRate))}
        ${renderCountyEvidenceMetric("Avg capital", formatCurrencyOrNA(county.averageCapitalRate))}
        ${renderCountyEvidenceMetric("CMS overall", formatNumberOrNA(county.averageOverallStarRating, 1))}
        ${renderCountyEvidenceMetric("CMS staffing", formatNumberOrNA(county.averageStaffingRating, 1))}
        ${renderCountyEvidenceMetric("Poverty proxy", formatOptionalPercent(county.povertyRate))}
        ${renderCountyEvidenceMetric("Median income", formatCurrencyOrNA(county.medianHouseholdIncome, 0))}
        ${renderCountyEvidenceMetric("Age 65+", formatOptionalPercent(county.age65PlusPercent))}
      </div>
      <div class="county-drilldown-grid">
        <section>
          <h4>Why It Is On The List</h4>
          <div class="finding-list compact-findings">${priorityReasons}</div>
        </section>
        <section>
          <h4>Next Validation Questions</h4>
          <div class="finding-list compact-findings">
            <div class="finding">Which facilities, owners, or chains are driving the county average?</div>
            <div class="finding">Do cost reports show weak margin, high labor cost, low occupancy, or capital strain?</div>
            <div class="finding">Do staffing ratings, survey deficiencies, jobs postings, or quality penalties point to the same concern?</div>
          </div>
        </section>
      </div>
      <section>
        <h4>Facilities To Open First</h4>
        <div class="data-table">${facilityRows}</div>
      </section>
    </article>
  `;
}

function renderCountyEvidenceMetric(label, value) {
  return `
    <div class="profile-metric">
      <span>${escapeHtml(value)}</span>
      <small>${escapeHtml(label)}</small>
    </div>
  `;
}

function renderCountyPriorityReasons(county, flags) {
  const reasons = flags.map(({ flag, rationale }) => `<div class="finding"><strong>${escapeHtml(flag)}</strong><br>${escapeHtml(rationale)}</div>`);

  if (county.matchedFacilityCount <= 2) {
    reasons.push('<div class="finding"><strong>Small sample warning</strong><br>One or two matched facilities can dominate the county signal, so facility-level validation matters.</div>');
  }
  if (county.ruralUrbanClassification === "Rural") {
    reasons.push('<div class="finding"><strong>Rural access context</strong><br>Rural status can make facility closure, staffing shortages, or capital underinvestment more consequential for access.</div>');
  }

  return reasons.length
    ? reasons.join("")
    : `<div class="finding">${escapeHtml(getCountySignalLabel(county))}</div>`;
}

function getCountySignalLabel(county) {
  if (county.averageStaffingRating <= 2) return "Lower staffing rating deserves facility-level validation.";
  if (county.averageCapitalRate <= 13) return "Lower capital reimbursement may point to infrastructure-pressure screening.";
  if (county.povertyRate >= 20) return "Higher poverty context should be reviewed alongside reimbursement and quality.";
  return "Composite risk score puts this county on the watchlist.";
}

function renderCountySummaryRows(counties) {
  if (!counties.length) {
    return '<p class="status">No county summaries match the current filters.</p>';
  }

  const rows = counties.map((county) => `
    <article class="table-row county-row">
      <div>
        <strong>${escapeHtml(county.county)}</strong>
        <small>${escapeHtml(county.ruralUrbanClassification || "Unknown")} / ${formatOptionalPercent(county.percentRural)} rural</small>
      </div>
      <div class="numeric">${county.matchedFacilityCount}</div>
      <div class="numeric">${formatCurrencyOrNA(county.averageTotalRate)}</div>
      <div class="numeric">${formatCurrencyOrNA(county.averageCapitalRate)}</div>
      <div class="numeric">${formatNumberOrNA(county.averageOverallStarRating, 1)}</div>
      <div class="numeric">${formatNumberOrNA(county.averageStaffingRating, 1)}</div>
      <div class="numeric">${formatOptionalPercent(county.povertyRate)}</div>
      <div class="numeric">${formatCurrencyOrNA(county.medianHouseholdIncome, 0)}</div>
      <div class="numeric">${formatOptionalPercent(county.age65PlusPercent)}</div>
    </article>
  `).join("");

  return `
    <article class="table-row county-row header">
      <div>County</div>
      <div class="numeric">Facilities</div>
      <div class="numeric">Avg Total</div>
      <div class="numeric">Avg Capital</div>
      <div class="numeric">Overall</div>
      <div class="numeric">Staffing</div>
      <div class="numeric">Poverty</div>
      <div class="numeric">Income</div>
      <div class="numeric">65+</div>
    </article>
    ${rows}
  `;
}

function buildCountyRiskFlags(counties) {
  if (!counties.length) return [];

  const povertyCutoff = percentile(counties.map((county) => county.povertyRate), 0.75);
  const ageCutoff = percentile(counties.map((county) => county.age65PlusPercent), 0.75);
  const capitalCutoff = percentile(counties.map((county) => county.averageCapitalRate), 0.25);
  const totalCutoff = percentile(counties.map((county) => county.averageTotalRate), 0.25);
  const lowFacilityCutoff = Math.max(1, percentile(counties.map((county) => county.matchedFacilityCount), 0.25));

  const flags = [];
  counties.forEach((county) => {
    if (county.povertyRate >= povertyCutoff && county.averageStaffingRating <= 2.5) {
      flags.push({ county, flag: "High poverty + low staffing", rationale: "Higher child poverty proxy overlaps with lower average CMS staffing rating." });
    }
    if (county.age65PlusPercent >= ageCutoff && county.matchedFacilityCount <= lowFacilityCutoff) {
      flags.push({ county, flag: "Older population + low facility count", rationale: "Higher older-adult share overlaps with relatively few matched nursing facilities." });
    }
    if (county.averageCapitalRate <= capitalCutoff && county.ruralUrbanClassification === "Rural") {
      flags.push({ county, flag: "Low capital + rural county", rationale: "Lower capital reimbursement appears in a rural county context." });
    }
    if (county.averageOverallStarRating <= 2.5 && county.averageTotalRate <= totalCutoff) {
      flags.push({ county, flag: "Low quality + low reimbursement", rationale: "Lower overall CMS rating overlaps with lower average Medicaid per diem." });
    }
  });

  return flags.sort((a, b) => calculateCountyRiskScore(b.county) - calculateCountyRiskScore(a.county));
}

function renderCountyRiskRows(flags) {
  if (!flags.length) {
    return '<p class="status">No county risk flags match the current filters.</p>';
  }

  const rows = flags.slice(0, 30).map(({ county, flag, rationale }) => `
    <article class="table-row county-risk-row">
      <div>
        <strong>${escapeHtml(county.county)}</strong>
        <small>${escapeHtml(county.ruralUrbanClassification || "Unknown")}</small>
      </div>
      <div>${escapeHtml(flag)}</div>
      <div>${escapeHtml(rationale)}</div>
      <div class="numeric">${county.matchedFacilityCount}</div>
      <div class="numeric">${formatCurrencyOrNA(county.averageCapitalRate)}</div>
      <div class="numeric">${formatNumberOrNA(county.averageStaffingRating, 1)}</div>
      <div class="numeric">${formatOptionalPercent(county.povertyRate)}</div>
    </article>
  `).join("");

  return `
    <article class="table-row county-risk-row header">
      <div>County</div>
      <div>Flag</div>
      <div>Why it matters</div>
      <div class="numeric">Facilities</div>
      <div class="numeric">Capital</div>
      <div class="numeric">Staffing</div>
      <div class="numeric">Poverty</div>
    </article>
    ${rows}
  `;
}

function renderCountyFindings(counties, riskFlags) {
  if (!counties.length) {
    return '<div class="finding">No county context records match the current filters.</div>';
  }

  const highestRisk = counties[0];
  const lowReimbursementHighPoverty = counties
    .filter((county) => county.averageTotalRate <= percentile(counties.map((item) => item.averageTotalRate), 0.25))
    .sort((a, b) => (b.povertyRate || 0) - (a.povertyRate || 0))[0];
  const ruralLowCapital = counties
    .filter((county) => county.ruralUrbanClassification === "Rural")
    .sort((a, b) => (a.averageCapitalRate || Infinity) - (b.averageCapitalRate || Infinity))[0];

  const findings = [
    `${highestRisk.county} County has the highest composite disparity-risk score in the current view, based on reimbursement, capital, quality, staffing, poverty, age, and facility-count signals.`,
    lowReimbursementHighPoverty
      ? `${lowReimbursementHighPoverty.county} County combines lower average reimbursement with a higher poverty context, which may indicate a county worth deeper validation.`
      : "Low reimbursement plus high poverty could not be identified under the current filters.",
    ruralLowCapital
      ? `${ruralLowCapital.county} County is a rural county with lower average capital reimbursement at ${formatCurrencyOrNA(ruralLowCapital.averageCapitalRate)}, which may suggest infrastructure-risk pressure.`
      : "No rural low-capital county appears under the current filters.",
    `${riskFlags.length} county-level risk flags are currently active. These are screening signals and should be validated with local facility, ownership, access, and cost-report context.`
  ];

  return findings.map((finding) => `<div class="finding">${escapeHtml(finding)}</div>`).join("");
}

function getHighReimbursementLowQualityCounties(counties) {
  const highRateCutoff = percentile(counties.map((county) => county.averageTotalRate), 0.75);
  return counties
    .filter((county) => county.averageTotalRate >= highRateCutoff && county.averageOverallStarRating <= 2.75)
    .sort((a, b) => (b.averageTotalRate - a.averageTotalRate) || (a.averageOverallStarRating - b.averageOverallStarRating))
    .slice(0, 5);
}

function getLowReimbursementHighRiskCounties(counties) {
  const lowRateCutoff = percentile(counties.map((county) => county.averageTotalRate), 0.25);
  const highPovertyCutoff = percentile(counties.map((county) => county.povertyRate), 0.75);
  return counties
    .filter((county) => county.averageTotalRate <= lowRateCutoff && county.povertyRate >= highPovertyCutoff)
    .sort((a, b) => calculateCountyRiskScore(b) - calculateCountyRiskScore(a))
    .slice(0, 5);
}

function getHighCapitalWeakStaffingFacilities(records) {
  const highCapitalCutoff = percentile(records.map((record) => record.components?.capitalRate), 0.75);
  return records
    .filter((record) => record.components?.capitalRate >= highCapitalCutoff && record.quality?.staffingStarRating <= 2)
    .sort((a, b) => (b.components.capitalRate - a.components.capitalRate) || (a.quality.staffingStarRating - b.quality.staffingStarRating))
    .slice(0, 10);
}

function getRuralLimitedCoverageCounties(counties) {
  return counties
    .filter((county) => county.ruralUrbanClassification === "Rural" && county.matchedFacilityCount <= 2)
    .sort((a, b) => (a.matchedFacilityCount - b.matchedFacilityCount) || (b.age65PlusPercent - a.age65PlusPercent))
    .slice(0, 10);
}

function renderPolicySummaryCards(groups) {
  const cards = [
    ["Counties reviewed", groups.countySummaries.length],
    ["Matched facilities reviewed", groups.qualityRecords.length],
    ["High reimbursement + low quality counties", groups.highReimbursementLowQuality.length],
    ["Low reimbursement + high social risk counties", groups.lowReimbursementHighRisk.length],
    ["High capital + weak staffing facilities", groups.highCapitalWeakStaffing.length],
    ["Rural limited-coverage counties", groups.ruralLimitedCoverage.length]
  ];

  return cards.map(([label, value]) => `
    <article class="metric-card">
      <span>${escapeHtml(value)}</span>
      <small>${escapeHtml(label)}</small>
    </article>
  `).join("");
}

function renderPolicyNarrative(groups) {
  const highQualityCounty = groups.highReimbursementLowQuality[0];
  const lowRiskCounty = groups.lowReimbursementHighRisk[0];
  const weakStaffingFacility = groups.highCapitalWeakStaffing[0];
  const ruralCounty = groups.ruralLimitedCoverage[0];

  const sentences = [
    "This executive findings view summarizes policy-relevant screening signals from Illinois Medicaid nursing facility reimbursement, CMS Care Compare quality indicators, and county-level disparity context.",
    highQualityCounty
      ? `${highQualityCounty.county} County appears in the high-reimbursement, lower-quality screen, with an average total Medicaid per-diem rate of ${formatCurrencyOrNA(highQualityCounty.averageTotalRate)} and average overall CMS rating of ${formatNumberOrNA(highQualityCounty.averageOverallStarRating, 1)}.`
      : "No county currently meets the high-reimbursement, lower-quality screen under the active filters.",
    lowRiskCounty
      ? `${lowRiskCounty.county} County appears in the low-reimbursement, higher-social-risk screen, which may indicate a county where reimbursement policy, access, and socioeconomic context deserve additional validation.`
      : "No county currently meets the low-reimbursement, high-social-risk screen under the active filters.",
    weakStaffingFacility
      ? `${weakStaffingFacility.facility} is an example of a facility with a higher capital rate but weak staffing rating, suggesting capital reimbursement alone should not be interpreted as a complete quality signal.`
      : "No facility currently meets the high-capital, weak-staffing screen under the active filters.",
    ruralCounty
      ? `${ruralCounty.county} County appears in the rural limited-coverage screen, which may suggest access vulnerability when combined with older population share and local facility availability.`
      : "No rural county currently meets the limited matched facility coverage screen under the active filters.",
    "These findings are associations and prioritization flags. They should be validated with facility addresses, ownership history, cost reports, staffing trends, and local market context before being used for policy or capital allocation decisions."
  ];

  return sentences.map((sentence) => `<p>${escapeHtml(sentence)}</p>`).join("");
}

function renderPolicySuggestionCards(groups) {
  const suggestions = [
    groups.highReimbursementLowQuality.length
      ? "High reimbursement paired with weaker CMS quality may suggest operational, ownership, staffing, or case-mix issues that reimbursement alone does not resolve."
      : "The current filters do not show a strong high-reimbursement, low-quality county signal.",
    groups.lowReimbursementHighRisk.length
      ? "Low reimbursement in higher-risk counties may indicate places where payment adequacy and broader social need should be reviewed together."
      : "The current filters do not show a strong low-reimbursement, high-social-risk county signal.",
    groups.highCapitalWeakStaffing.length
      ? "Facilities with higher capital rates but weak staffing may require separate capital planning and workforce strategy review."
      : "The current filters do not show high-capital, weak-staffing facility outliers.",
    groups.ruralLimitedCoverage.length
      ? "Rural counties with limited matched facility coverage may face access fragility, especially where older population share is high."
      : "The current filters do not show rural limited-coverage counties."
  ];

  return suggestions.map((suggestion) => `<div class="finding">${escapeHtml(suggestion)}</div>`).join("");
}

function renderPolicyCountyRows(counties, mode) {
  if (!counties.length) {
    return '<p class="status">No counties match this screen under the current filters.</p>';
  }

  const rows = counties.map((county) => {
    const emphasis = mode === "quality"
      ? `Overall ${formatNumberOrNA(county.averageOverallStarRating, 1)}`
      : mode === "coverage"
        ? `${county.matchedFacilityCount} matched facilities`
        : `Risk score ${formatNumberOrNA(calculateCountyRiskScore(county), 1)}`;
    return `
      <article class="table-row compact">
        <div>
          <strong>${escapeHtml(county.county)}</strong>
          <small>${escapeHtml(county.ruralUrbanClassification || "Unknown")} / Poverty ${formatOptionalPercent(county.povertyRate)} / 65+ ${formatOptionalPercent(county.age65PlusPercent)}</small>
        </div>
        <div class="numeric">${formatCurrencyOrNA(county.averageTotalRate)} / ${emphasis}</div>
      </article>
    `;
  }).join("");

  return rows;
}

function renderPolicyFacilityRows(records) {
  if (!records.length) {
    return '<p class="status">No facilities match this screen under the current filters.</p>';
  }

  return records.map((record) => `
    <article class="table-row compact">
      <div>
        <strong>${escapeHtml(record.facility)}</strong>
        <small>${escapeHtml(record.city)} / ${escapeHtml(record.quality?.county || "Unknown county")} / ${escapeHtml(record.geography?.tier || "Unclassified")}</small>
      </div>
      <div class="numeric">${formatCurrencyOrNA(record.components?.capitalRate)} / Staffing ${record.quality?.staffingStarRating || "N/A"}</div>
    </article>
  `).join("");
}

function calculateCountyRiskScore(county) {
  let score = 0;
  score += county.povertyRate || 0;
  score += county.age65PlusPercent || 0;
  score += county.uninsuredRate || 0;
  score += county.ruralUrbanClassification === "Rural" ? 12 : county.ruralUrbanClassification === "Mixed" ? 6 : 0;
  score += Math.max(0, 3 - (county.averageStaffingRating || 3)) * 10;
  score += Math.max(0, 3 - (county.averageOverallStarRating || 3)) * 8;
  score += Math.max(0, 25 - (county.averageCapitalRate || 25));
  score += county.matchedFacilityCount <= 2 ? 6 : 0;
  return score;
}

function normalizeCountyName(value) {
  return String(value || "").replace(/ County$/i, "").trim().toUpperCase();
}

function percentile(values, p) {
  const sorted = values.filter((value) => Number.isFinite(value)).sort((a, b) => a - b);
  if (!sorted.length) return 0;
  const index = Math.min(sorted.length - 1, Math.max(0, Math.ceil(sorted.length * p) - 1));
  return sorted[index];
}

function formatCurrencyOrNA(value, digits = 2) {
  if (!Number.isFinite(value)) return "N/A";
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: digits,
    minimumFractionDigits: digits
  }).format(value);
}

function formatNumberOrNA(value, digits = 1) {
  if (!Number.isFinite(value)) return "N/A";
  return value.toFixed(digits);
}

function formatIntegerOrNA(value) {
  if (!Number.isFinite(value)) return "N/A";
  return Math.round(value).toLocaleString("en-US");
}

function formatOptionalPercent(value) {
  if (!Number.isFinite(value)) return "N/A";
  return value <= 1 ? `${(value * 100).toFixed(1)}%` : `${value.toFixed(1)}%`;
}

function renderFindings(records) {
  const amounts = records
    .map((record) => record.publishedAmount)
    .filter((amount) => Number.isFinite(amount));

  if (!amounts.length) {
    return '<div class="finding">Use the filters to generate findings from reimbursed long-term-care records.</div>';
  }

  const components = averageComponents(records);
  const dominant = Object.entries(components)
    .sort(([, a], [, b]) => b - a)[0];
  const tierGroups = summarizeBy(records, (record) => record.geography?.tier || "Unclassified");
  const highest = tierGroups[0];
  const lowest = tierGroups[tierGroups.length - 1];
  const spread = highest && lowest ? highest.average - lowest.average : 0;
  const highestFacility = [...records].sort((a, b) => b.publishedAmount - a.publishedAmount)[0];

  const findingText = [
    `${records.length} records match the current filters, with an average total published rate of ${currency.format(average(amounts))}.`,
    `The largest average component is ${componentLabel(dominant[0])} at ${currency.format(dominant[1])} per day, so this view is mainly driven by that rate category.`,
    tierGroups.length > 1
      ? `${highest.key} is ${currency.format(spread)} per day above ${lowest.key} on average in this filtered view.`
      : `${highestFacility.facility} is the highest-rate facility in this view at ${currency.format(highestFacility.publishedAmount)} per day.`
  ];

  return findingText.map((finding) => `<div class="finding">${escapeHtml(finding)}</div>`).join("");
}

function averageComponents(records) {
  return {
    nursingRate: average(records.map((record) => record.components?.nursingRate).filter((value) => Number.isFinite(value))),
    supportRate: average(records.map((record) => record.components?.supportRate).filter((value) => Number.isFinite(value))),
    capitalRate: average(records.map((record) => record.components?.capitalRate).filter((value) => Number.isFinite(value)))
  };
}

function average(values) {
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function sum(values) {
  return values.filter((value) => Number.isFinite(value)).reduce((total, value) => total + value, 0);
}

function componentLabel(key) {
  return {
    nursingRate: "nursing",
    supportRate: "support",
    capitalRate: "capital"
  }[key] || key;
}

function formatPercent(value) {
  return `${(value * 100).toFixed(1)}%`;
}

function setTab(tabName) {
  state.activeTab = tabName;

  els.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.tab === tabName);
  });

  Object.entries(els.panels).forEach(([name, panel]) => {
    panel.classList.toggle("active", name === tabName);
  });
}

function getInitialTab() {
  if (typeof window === "undefined") return state.activeTab;
  const hashTab = window.location.hash.replace("#", "");
  return els.panels[hashTab] ? hashTab : state.activeTab;
}

function exportRecords() {
  const payload = JSON.stringify(getFilteredRecords(), null, 2);
  const blob = new Blob([payload], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "illinois-reimbursement-records.json";
  link.click();
  URL.revokeObjectURL(url);
}

async function importFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const text = await file.text();
    const imported = file.name.toLowerCase().endsWith(".json")
      ? JSON.parse(text)
      : parseDelimitedImport(text);

    if (!Array.isArray(imported)) {
      throw new Error("Import must be a JSON array or a CSV with a header row.");
    }

    if (looksLikeHfsProviderPaymentRows(imported)) {
      const records = imported
        .map((row) => normalizeImportedHfsProviderPayment(row))
        .filter((record) => Number.isFinite(record.totalPaid) || Number.isFinite(record.patientsServed));
      const selectedHospital = getFilteredHospitals().find((hospital) => String(hospital.facilityId) === String(state.selectedHospitalId))
        || getFilteredHospitals()[0];
      state.providerPayments = {
        description: "Illinois HFS provider-level Medicaid payment data imported through the dashboard file picker.",
        lastUpdated: new Date().toISOString().slice(0, 10),
        source: "Illinois HFS Transparency Law Provider-Level Data",
        sourceUrl: "https://hfs.illinois.gov/info/factsfigures/transparency.html",
        records: selectedHospital ? tagHfsPaymentMatches(records, selectedHospital) : records
      };
      const matchedCount = selectedHospital ? getProviderPaymentRowsForHospital(selectedHospital).length : 0;
      state.hfsProviderPaymentStatus = selectedHospital
        ? `Imported ${formatIntegerOrNA(records.length)} HFS provider-payment rows from ${file.name}; ${formatIntegerOrNA(matchedCount)} matched ${selectedHospital.facilityName}.`
        : `Imported ${formatIntegerOrNA(records.length)} HFS provider-payment rows from ${file.name}.`;
      els.importStatus.textContent = state.hfsProviderPaymentStatus;
      renderMoneyFlow();
      renderAuditFramework();
      renderHospitalIntelligence();
      return;
    }

    const normalized = imported.map(normalizeRecord);
    state.records = [...state.records, ...normalized];
    els.importStatus.textContent = `Imported ${normalized.length} record${normalized.length === 1 ? "" : "s"} from ${file.name}.`;
    render();
  } catch (error) {
    els.importStatus.textContent = `Import failed: ${error.message}`;
  } finally {
    event.target.value = "";
  }
}

function parseDelimitedImport(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || "";
  const delimiter = (firstLine.match(/\t/g) || []).length > (firstLine.match(/,/g) || []).length ? "\t" : ",";
  if (delimiter === ",") return parseCsv(text);
  const rows = text.split(/\r?\n/)
    .filter((line) => line.trim())
    .map((line) => line.split("\t").map((cell) => cell.trim()));
  const [headers, ...body] = rows;
  if (!headers) return [];
  return body.map((row) => Object.fromEntries(headers.map((header, index) => [header.trim(), row[index] || ""])));
}

function looksLikeHfsProviderPaymentRows(rows) {
  if (!rows.length) return false;
  const keys = Object.keys(rows[0]).map(normalizeHeader);
  const hasProvider = keys.some((key) => ["provider_name", "provider", "vendor_name", "providerkeyid", "npi"].includes(key));
  const hasPayment = keys.some((key) => key.includes("paid") || key.includes("payment") || key.includes("cost") || key.includes("recipient"));
  return hasProvider && hasPayment;
}

function getImportedHfsValue(row, aliases) {
  const normalized = Object.fromEntries(Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]));
  for (const alias of aliases) {
    const value = normalized[normalizeHeader(alias)];
    if (value !== undefined && String(value).trim() !== "") return value;
  }
  return "";
}

function normalizeImportedHfsProviderPayment(row) {
  const totalPaid = toNumberOrNull(getImportedHfsValue(row, ["total paid", "total payments", "total amount paid", "amount paid", "payments", "total received", "total hfs paid", "total cost"]));
  const patientsServed = toNumberOrNull(getImportedHfsValue(row, ["patients served", "recipient count", "recipients", "number of patients", "client count", "recipient total"]));
  return {
    providerName: getImportedHfsValue(row, ["provider name", "provider", "vendor name", "name", "payee name", "billing provider name"]) || "Unknown provider",
    providerId: getImportedHfsValue(row, ["provider id", "provider key id", "provider number", "vendor id", "npi", "provider npi"]) || null,
    county: getImportedHfsValue(row, ["county", "provider county", "vendor county", "provider county name"]) || "Unknown",
    providerType: getImportedHfsValue(row, ["provider type", "provider category", "provider class", "category", "provider specialty", "provider type code"]) || "Unknown provider type",
    serviceYear: toNumberOrNull(getImportedHfsValue(row, ["service year", "calendar year", "year", "experience year"])),
    patientsServed: Number.isFinite(patientsServed) ? Math.trunc(patientsServed) : null,
    claimCount: toNumberOrNull(getImportedHfsValue(row, ["claim count", "claims", "number of claims"])),
    totalPaid,
    averageCost: toNumberOrNull(getImportedHfsValue(row, ["average cost", "avg cost", "average payment", "avg payment", "average paid"])),
    adjustments: toNumberOrNull(getImportedHfsValue(row, ["adjustments", "adjustment", "adjusted amount"])),
    paymentPerPatient: Number.isFinite(totalPaid) && patientsServed ? Math.round((totalPaid / patientsServed) * 100) / 100 : null,
    evidenceType: "reported_payment",
    source: "Illinois HFS Transparency Law Provider-Level Data",
    sourceUrl: "https://hfs.illinois.gov/info/factsfigures/transparency.html",
    limitations: "Provider-level aggregate payment data does not include patient-level acuity, full claim detail, managed care contract terms, denials, or medical necessity context."
  };
}

function tagHfsPaymentMatches(records, hospital) {
  return records.map((record) => {
    const match = scoreHfsProviderPaymentMatch(record, hospital);
    return {
      ...record,
      matchedFacilityId: match.score >= 70 ? hospital.facilityId : null,
      matchedFacilityName: match.score >= 70 ? hospital.facilityName : null,
      matchScore: match.score,
      matchReasons: match.reasons
    };
  });
}

function scoreHfsProviderPaymentMatch(record, hospital) {
  const providerName = normalizeFacilityText(record.providerName);
  const hospitalName = normalizeFacilityText(hospital.facilityName);
  const systemName = normalizeFacilityText(hospital.systemAffiliation?.systemName);
  const providerCounty = normalizeCountyName(record.county);
  const hospitalCounty = normalizeCountyName(hospital.county);
  let score = 0;
  const reasons = [];
  if (providerName && hospitalName && providerName === hospitalName) {
    score += 100;
    reasons.push("exact hospital name");
  } else if (providerName && hospitalName && (providerName.includes(hospitalName) || hospitalName.includes(providerName))) {
    score += 75;
    reasons.push("partial hospital name");
  }
  if (systemName && providerName.includes(systemName)) {
    score += 35;
    reasons.push("system name");
  }
  if (providerCounty && hospitalCounty && providerCounty === hospitalCounty) {
    score += 15;
    reasons.push("county match");
  }
  if (providerName.includes("TAYLORVILLE")) {
    score += 35;
    reasons.push("Taylorville text");
  }
  return { score, reasons };
}

function normalizeRecord(record) {
  return {
    facility: record.facility || record.Facility || record["Facility Name"] || "Unknown facility",
    city: record.city || record.City || "Unknown",
    category: record.category || record.Category || "Imported",
    payer: record.payer || record.Payer || "Unknown payer",
    service: record.service || record.Service || record.Description || "Imported service",
    codeType: record.codeType || record["Code Type"] || record.code_type || "Unknown",
    code: record.code || record.Code || "Unknown",
    publishedAmount: toNumberOrNull(record.publishedAmount || record.Amount || record.Rate || record["Total Rate"]),
    amountLabel: record.amountLabel || record["Amount Label"] || "Published amount",
    effectiveDate: record.effectiveDate || record["Effective Date"] || null,
    source: record.source || record.Source || "Imported file",
    confidence: record.confidence || record.Confidence || "imported",
    notes: record.notes || record.Notes || ""
  };
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let value = "";
  let quoted = false;

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];

    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === "," && !quoted) {
      row.push(value);
      value = "";
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(value);
      rows.push(row);
      row = [];
      value = "";
    } else {
      value += char;
    }
  }

  if (value || row.length) {
    row.push(value);
    rows.push(row);
  }

  const [headers, ...body] = rows.filter((csvRow) => csvRow.some((cell) => cell.trim()));
  if (!headers) return [];

  return body.map((csvRow) => Object.fromEntries(
    headers.map((header, index) => [header.trim(), (csvRow[index] || "").trim()])
  ));
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(String(value).replace(/[$,]/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

els.searchInput.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderRecords();
  renderGeography();
  renderAnalysis();
  renderCapitalEquity();
  renderQualityCorrelation();
  renderExecutiveSummary();
  renderCountyContext();
  renderPolicyExecutiveFindings();
  renderFacilityRisk();
  renderChainAnalytics();
  renderHospitalIntelligence();
  renderHospitalPaymentExplorer();
});

els.categorySelect.addEventListener("change", (event) => {
  state.category = event.target.value;
  renderRecords();
  renderGeography();
  renderAnalysis();
  renderCapitalEquity();
  renderQualityCorrelation();
  renderExecutiveSummary();
  renderCountyContext();
  renderPolicyExecutiveFindings();
  renderFacilityRisk();
  renderChainAnalytics();
  renderHospitalIntelligence();
});

els.tierSelect.addEventListener("change", (event) => {
  state.tier = event.target.value;
  renderRecords();
  renderGeography();
  renderAnalysis();
  renderCapitalEquity();
  renderQualityCorrelation();
  renderExecutiveSummary();
  renderCountyContext();
  renderPolicyExecutiveFindings();
  renderFacilityRisk();
  renderChainAnalytics();
  renderHospitalIntelligence();
});

els.riskLevelSelect.addEventListener("change", (event) => {
  state.riskLevel = event.target.value;
  renderFacilityRisk();
  renderChainAnalytics();
  renderHospitalPaymentExplorer();
});

els.ownershipSelect.addEventListener("change", (event) => {
  state.ownership = event.target.value;
  renderFacilityRisk();
  renderChainAnalytics();
  renderHospitalPaymentExplorer();
});

els.staffingRatingSelect.addEventListener("change", (event) => {
  state.staffingRating = event.target.value;
  renderFacilityRisk();
  renderChainAnalytics();
  renderHospitalPaymentExplorer();
});

function selectRiskFacility(id) {
  state.selectedRiskFacilityId = id;
  renderFacilityRisk();
}

function selectChain(id) {
  state.selectedChainId = id;
  renderChainAnalytics();
}

els.illinoisRiskMap.addEventListener("click", (event) => {
  const marker = event.target.closest("[data-risk-id]");
  if (marker) selectRiskFacility(marker.dataset.riskId);
});

els.topRiskFacilities.addEventListener("click", (event) => {
  const row = event.target.closest("[data-risk-row]");
  if (row) selectRiskFacility(row.dataset.riskRow);
});

els.countyPriorityCards.addEventListener("click", (event) => {
  const card = event.target.closest("[data-county-focus]");
  if (!card) return;
  state.selectedCountyName = card.dataset.countyFocus;
  renderCountyContext();
  els.countyDrilldown.scrollIntoView({ behavior: "smooth", block: "start" });
});

els.countyDrilldown.addEventListener("click", (event) => {
  const row = event.target.closest("[data-risk-row]");
  if (!row) return;
  state.selectedRiskFacilityId = row.dataset.riskRow;
  setTab("facilityRisk");
  renderFacilityRisk();
});

els.chainSummaryRows.addEventListener("click", (event) => {
  const row = event.target.closest("[data-chain-row]");
  if (row) selectChain(row.dataset.chainRow);
});

els.chainWatchlistRows.addEventListener("click", (event) => {
  const row = event.target.closest("[data-chain-row]");
  if (row) selectChain(row.dataset.chainRow);
});

els.chainFacilityRows.addEventListener("click", (event) => {
  const row = event.target.closest("[data-risk-row]");
  if (!row) return;
  state.selectedRiskFacilityId = row.dataset.riskRow;
  setTab("facilityRisk");
  renderFacilityRisk();
});

els.careersRows.addEventListener("click", (event) => {
  if (event.target.closest("a")) return;
  const target = event.target.closest("[data-career-view], [data-career-row]");
  if (!target) return;
  state.selectedCareerFacilityId = target.dataset.careerView || target.dataset.careerRow;
  renderWorkforceDemand();
  els.careerDrilldown.scrollIntoView({ behavior: "smooth", block: "start" });
});

els.hospitalRiskRows.addEventListener("click", (event) => {
  const row = event.target.closest("[data-hospital-row]");
  if (!row) return;
  state.selectedHospitalId = row.dataset.hospitalRow;
  renderHospitalIntelligence();
  renderFacilityBinderPage();
  renderHospitalPaymentExplorer();
});

els.hospitalRateValueRows.addEventListener("click", (event) => {
  const row = event.target.closest("[data-hospital-row]");
  if (!row) return;
  state.selectedHospitalId = row.dataset.hospitalRow;
  setTab("payment");
  renderHospitalIntelligence();
  renderFacilityBinderPage();
  renderHospitalPaymentExplorer();
});

els.paymentHospitalRows.addEventListener("click", (event) => {
  const row = event.target.closest("[data-payment-hospital-row]");
  if (!row) return;
  state.selectedHospitalId = row.dataset.paymentHospitalRow;
  renderHospitalIntelligence();
  renderFacilityBinderPage();
  renderHospitalPaymentExplorer();
});

els.hospitalDrilldown.addEventListener("click", (event) => {
  const button = event.target.closest("[data-query-hfs-payments]");
  if (!button) return;
  queryHfsProviderPaymentsForHospital(button.dataset.queryHfsPayments);
});

els.riskReimbursementScatter.addEventListener("click", (event) => {
  const dot = event.target.closest("[data-risk-id]");
  if (dot) selectRiskFacility(dot.dataset.riskId);
});

els.riskStaffingScatter.addEventListener("click", (event) => {
  const dot = event.target.closest("[data-risk-id]");
  if (dot) selectRiskFacility(dot.dataset.riskId);
});

els.exportButton.addEventListener("click", exportRecords);
els.importInput.addEventListener("change", importFile);
els.queryPriceTransparencyButton.addEventListener("click", queryPriceTransparencyData);
els.refreshCareersButton.addEventListener("click", refreshCareersData);

window.reimbursementExplorer = {
  queryPriceTransparencyData,
  refreshCareersData,
  setTab
};

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => setTab(tab.dataset.tab));
});

loadData().catch((error) => {
  els.cards.innerHTML = `<p>Could not load dashboard data: ${escapeHtml(error.message)}</p>`;
});
