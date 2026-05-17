const state = {
  records: [],
  qualityRecords: [],
  sources: [],
  activeTab: "records",
  query: "",
  category: "all"
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
    records: document.querySelector("#recordsPanel"),
    geography: document.querySelector("#geographyPanel"),
    analysis: document.querySelector("#analysisPanel"),
    capital: document.querySelector("#capitalPanel"),
    quality: document.querySelector("#qualityPanel"),
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
  highRateLowQualityRows: document.querySelector("#highRateLowQualityRows")
};

async function loadData() {
  const [recordsResponse, sourcesResponse] = await Promise.all([
    fetch("data/starter-records.json"),
    fetch("data/sources.json")
  ]);

  const starterRecords = await recordsResponse.json();
  const nursingRates = await fetchOptionalJson("data/nursing-facility-rates.json");
  state.qualityRecords = await fetchOptionalJson("data/quality-matched-rates.json");
  state.records = [...nursingRates, ...starterRecords];
  state.sources = await sourcesResponse.json();
  render();
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
  renderRecords();
  renderSources();
  renderGeography();
  renderAnalysis();
  renderCapitalEquity();
  renderQualityCorrelation();
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
});

els.categorySelect.addEventListener("change", (event) => {
  state.category = event.target.value;
  renderRecords();
  renderGeography();
  renderAnalysis();
  renderCapitalEquity();
  renderQualityCorrelation();
});

els.tierSelect.addEventListener("change", (event) => {
  state.tier = event.target.value;
  renderRecords();
  renderGeography();
  renderAnalysis();
  renderCapitalEquity();
  renderQualityCorrelation();
});

els.exportButton.addEventListener("click", exportRecords);
els.importInput.addEventListener("change", importFile);

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => setTab(tab.dataset.tab));
});

loadData().catch((error) => {
  els.cards.innerHTML = `<p>Could not load dashboard data: ${escapeHtml(error.message)}</p>`;
});
