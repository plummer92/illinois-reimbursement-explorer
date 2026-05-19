const state = {
  records: [],
  qualityRecords: [],
  countyContext: [],
  countySummaries: [],
  sources: [],
  activeTab: "executive",
  query: "",
  category: "all",
  riskLevel: "all",
  ownership: "all",
  staffingRating: "all",
  selectedRiskFacilityId: null,
  selectedChainId: null
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
    findings: document.querySelector("#findingsPanel"),
    records: document.querySelector("#recordsPanel"),
    geography: document.querySelector("#geographyPanel"),
    analysis: document.querySelector("#analysisPanel"),
    capital: document.querySelector("#capitalPanel"),
    quality: document.querySelector("#qualityPanel"),
    county: document.querySelector("#countyPanel"),
    facilityRisk: document.querySelector("#facilityRiskPanel"),
    chain: document.querySelector("#chainPanel"),
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
  ruralLimitedCoverageCounties: document.querySelector("#ruralLimitedCoverageCounties")
};

Object.assign(els, {
  chainInsightCards: document.querySelector("#chainInsightCards"),
  chainSummaryRows: document.querySelector("#chainSummaryRows"),
  chainDrilldown: document.querySelector("#chainDrilldown"),
  chainWatchlistRows: document.querySelector("#chainWatchlistRows"),
  chainFacilityRows: document.querySelector("#chainFacilityRows")
});

async function loadData() {
  const [recordsResponse, sourcesResponse] = await Promise.all([
    fetch("data/starter-records.json"),
    fetch("data/sources.json")
  ]);

  const starterRecords = await recordsResponse.json();
  const nursingRates = await fetchOptionalJson("data/nursing-facility-rates.json");
  state.qualityRecords = await fetchOptionalJson("data/quality-matched-rates.json");
  state.countyContext = await fetchOptionalJson("data/county-context-illinois.json");
  state.countySummaries = await fetchOptionalJson("data/county-facility-summary.json");
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
  renderGeography();
  renderAnalysis();
  renderCapitalEquity();
  renderQualityCorrelation();
  renderExecutiveSummary();
  renderCountyContext();
  renderPolicyExecutiveFindings();
  renderFacilityRisk();
  renderChainAnalytics();
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
  const capitalGroups = summarizeCapitalByGeography(getCapitalRecords());
  const lowCapitalLowStaffing = getLowCapitalLowStaffing(qualityRecords);
  const highRateLowQuality = getHighRateLowQuality(qualityRecords);
  const components = averageComponents(records);
  const lowestGeography = tierGroups[tierGroups.length - 1];
  const highestGeography = tierGroups[0];

  els.projectPurpose.textContent = "This tool analyzes Illinois nursing facility Medicaid reimbursement, geographic reimbursement patterns, capital reimbursement components, and CMS Care Compare quality data to identify possible healthcare disparity signals, infrastructure-risk patterns, and planning questions for long-term care leaders.";
  els.executiveMetricCards.innerHTML = renderExecutiveMetricCards({
    totalRecords: state.records.filter((record) => Number.isFinite(record.publishedAmount)).length,
    matchedRecords: state.qualityRecords.length,
    averageTotal: average(records.map((record) => record.publishedAmount).filter((value) => Number.isFinite(value))),
    averageNursing: components.nursingRate,
    averageSupport: components.supportRate,
    averageCapital: components.capitalRate,
    lowestGeography,
    highestGeography
  });
  els.executiveFindings.innerHTML = renderExecutiveFindings({
    records,
    tierGroups,
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

  els.countyFindingList.innerHTML = renderCountyFindings(countySummaries, riskFlags);
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
  els.riskReimbursementScatter.innerHTML = renderRiskScatter(facilities, "publishedAmount", "Total Medicaid per diem");
  els.riskStaffingScatter.innerHTML = renderRiskScatter(facilities, "staffing", "CMS staffing stars");
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
    <article class="table-row">
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
    <article class="table-row header">
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
    ["Highest geography average", metrics.highestGeography ? `${metrics.highestGeography.key}: ${currency.format(metrics.highestGeography.average)}` : "N/A"]
  ];

  return cards.map(([label, value]) => `
    <article class="metric-card">
      <span>${escapeHtml(value)}</span>
      <small>${escapeHtml(label)}</small>
    </article>
  `).join("");
}

function renderExecutiveFindings({ records, tierGroups, capitalGroups, lowCapitalLowStaffing, highRateLowQuality }) {
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
      : parseCsv(text);

    if (!Array.isArray(imported)) {
      throw new Error("Import must be a JSON array or a CSV with a header row.");
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
});

els.riskLevelSelect.addEventListener("change", (event) => {
  state.riskLevel = event.target.value;
  renderFacilityRisk();
  renderChainAnalytics();
});

els.ownershipSelect.addEventListener("change", (event) => {
  state.ownership = event.target.value;
  renderFacilityRisk();
  renderChainAnalytics();
});

els.staffingRatingSelect.addEventListener("change", (event) => {
  state.staffingRating = event.target.value;
  renderFacilityRisk();
  renderChainAnalytics();
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

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => setTab(tab.dataset.tab));
});

loadData().catch((error) => {
  els.cards.innerHTML = `<p>Could not load dashboard data: ${escapeHtml(error.message)}</p>`;
});
