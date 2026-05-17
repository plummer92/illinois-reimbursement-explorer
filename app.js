const state = {
  records: [],
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
    sources: document.querySelector("#sourcesPanel"),
    model: document.querySelector("#modelPanel")
  }
};

async function loadData() {
  const [recordsResponse, sourcesResponse] = await Promise.all([
    fetch("data/starter-records.json"),
    fetch("data/sources.json")
  ]);

  const starterRecords = await recordsResponse.json();
  const nursingRates = await fetchOptionalJson("data/nursing-facility-rates.json");
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
  renderRecords();
  renderSources();
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

function getFilteredRecords() {
  const query = state.query.toLowerCase().trim();

  return state.records.filter((record) => {
    const categoryMatch = state.category === "all" || record.category === state.category;
    const haystack = [
      record.facility,
      record.city,
      record.category,
      record.payer,
      record.service,
      record.codeType,
      record.code,
      record.source,
      record.notes
    ].join(" ").toLowerCase();

    return categoryMatch && (!query || haystack.includes(query));
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
});

els.categorySelect.addEventListener("change", (event) => {
  state.category = event.target.value;
  renderRecords();
});

els.exportButton.addEventListener("click", exportRecords);
els.importInput.addEventListener("change", importFile);

els.tabs.forEach((tab) => {
  tab.addEventListener("click", () => setTab(tab.dataset.tab));
});

loadData().catch((error) => {
  els.cards.innerHTML = `<p>Could not load dashboard data: ${escapeHtml(error.message)}</p>`;
});
