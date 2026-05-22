const http = require("http");
const fs = require("fs/promises");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 8765);
const userAgent = "IllinoisReimbursementExplorer/0.1 (public research)";
const reportCardUrl = "https://healthcarereportcard.illinois.gov/api/hospitals?per_page=100";
const hfsTransparencyUrl = "https://hfs.illinois.gov/info/factsfigures/transparency.html";
const pricePreviewBytes = 1_500_000;

const mimeTypes = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
  ".csv": "text/csv",
  ".xlsx": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
};

const careerKeywords = [
  "career",
  "careers",
  "employment",
  "jobs",
  "job openings",
  "join our team",
  "work with us",
  "opportunities"
];

const platformHints = {
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

function sendJson(response, status, payload) {
  response.writeHead(status, { "content-type": "application/json" });
  response.end(JSON.stringify(payload, null, 2));
}

function normalizeUrl(value) {
  const text = String(value || "").trim();
  if (!text) return null;
  return /^https?:\/\//i.test(text) ? text : `https://${text}`;
}

function normalizeName(value) {
  return String(value || "")
    .toUpperCase()
    .replace(/\b(HOSPITAL|MEDICAL|CENTER|CENTRE|MEMORIAL|SAINT|ST|THE|INC|LLC|CORP|CORPORATION)\b/g, " ")
    .replace(/[^A-Z0-9 ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeCity(value) {
  return String(value || "").toUpperCase().replace(/\s+/g, " ").trim();
}

async function fetchText(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      headers: { "user-agent": userAgent, "accept": "text/html,application/json;q=0.9,*/*;q=0.8" },
      redirect: "follow",
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.text();
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchTextPreview(url, maxBytes = pricePreviewBytes) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const response = await fetch(url, {
      headers: { "user-agent": userAgent, "accept": "text/csv,text/plain,*/*;q=0.8" },
      redirect: "follow",
      signal: controller.signal
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const reader = response.body?.getReader();
    if (!reader) return (await response.text()).slice(0, maxBytes);
    const decoder = new TextDecoder();
    let text = "";
    while (text.length < maxBytes) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
    }
    await reader.cancel().catch(() => {});
    return text;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchJson(url) {
  return JSON.parse(await fetchText(url));
}

async function loadReportCardHospitals(limit) {
  const hospitals = [];
  let nextUrl = reportCardUrl;
  const seen = new Set();

  while (nextUrl && !seen.has(nextUrl) && hospitals.length < limit) {
    seen.add(nextUrl);
    const payload = await fetchJson(nextUrl);
    const pageRecords = Array.isArray(payload) ? payload : payload.data || payload.hospitals || [];
    hospitals.push(...pageRecords);
    nextUrl = payload.next_page_url || null;
  }

  return hospitals.slice(0, limit);
}

async function loadCmsHospitals() {
  const text = await fs.readFile(path.join(root, "data", "cms-hospital-general-illinois.json"), "utf8");
  return JSON.parse(text);
}

function matchCmsHospital(reportCard, cmsRecords) {
  const mpn = String(reportCard.mpn_id || "").trim();
  if (mpn) {
    const byId = cmsRecords.find((record) => String(record.facilityId || "").trim() === mpn);
    if (byId) return byId;
  }

  const reportName = normalizeName(reportCard.name);
  const reportCity = normalizeCity(reportCard.city);
  return cmsRecords.find((record) => {
    if (normalizeCity(record.city) !== reportCity) return false;
    const cmsName = normalizeName(record.facilityName);
    return reportName && cmsName && (reportName.includes(cmsName) || cmsName.includes(reportName));
  }) || null;
}

function parseLinks(html, baseUrl) {
  const links = [];
  const seen = new Set();
  const pattern = /<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi;
  let match;
  while ((match = pattern.exec(html))) {
    const href = new URL(match[1], baseUrl).href;
    if (seen.has(href)) continue;
    const text = match[2].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    links.push({ href, text });
    seen.add(href);
  }
  return links;
}

function scoreCareerLink(link) {
  const haystack = `${link.text} ${link.href}`.toLowerCase();
  let score = 0;
  careerKeywords.forEach((keyword) => {
    if (haystack.includes(keyword)) score += ["careers", "employment", "jobs"].includes(keyword) ? 5 : 3;
  });
  Object.keys(platformHints).forEach((domain) => {
    if (haystack.includes(domain)) score += 8;
  });
  if (haystack.includes("volunteer")) score -= 4;
  if (haystack.includes("provider directory")) score -= 3;
  return score;
}

async function discoverCareersUrl(homepage) {
  if (!homepage) return { careerPageUrl: null, discoveryMethod: "no-homepage", notes: "Hospital Report Card did not include a website." };

  try {
    const html = await fetchText(homepage);
    const ranked = parseLinks(html, homepage)
      .map((link) => ({ score: scoreCareerLink(link), link }))
      .sort((a, b) => b.score - a.score);
    if (ranked[0]?.score > 0) {
      return { careerPageUrl: ranked[0].link.href, discoveryMethod: "homepage-link", notes: "" };
    }
  } catch (error) {
    return { careerPageUrl: null, discoveryMethod: "homepage-fetch-failed", notes: String(error.message || error) };
  }

  for (const suffix of ["/careers", "/career", "/jobs", "/employment"]) {
    const candidate = new URL(suffix, `${homepage}/`).href;
    try {
      await fetchText(candidate);
      return { careerPageUrl: candidate, discoveryMethod: "guessed-path", notes: "" };
    } catch {
      // Try the next common path.
    }
  }

  return { careerPageUrl: null, discoveryMethod: "not-found", notes: "No careers link or common careers path found." };
}

function platformForUrl(url) {
  if (!url) return "Unknown";
  const lower = url.toLowerCase();
  for (const [needle, platform] of Object.entries(platformHints)) {
    if (lower.includes(needle)) return platform;
  }
  return "Facility website";
}

function extractJobCount(html) {
  const text = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const patterns = [
    /(\d{1,5})\s+(?:open\s+)?(?:jobs|positions|openings|opportunities|results)/i,
    /(?:jobs|positions|openings|opportunities|results)\s+\(?(\d{1,5})\)?/i,
    /showing\s+\d+\s*[-–]\s*\d+\s+of\s+(\d{1,5})/i
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return { jobOpeningCount: Number(match[1]), countMethod: "page-text-count", notes: `Matched ${pattern}` };
  }

  const jobLinks = new Set([...html.matchAll(/href=["']([^"']*(?:job|career|requisition|opening)[^"']*)["']/gi)].map((match) => match[1]));
  const filtered = [...jobLinks].filter((href) => !/privacy|terms|login|talent|alert|benefit/i.test(href));
  if (filtered.length) {
    return { jobOpeningCount: filtered.length, countMethod: "job-link-count", notes: "Counted unique job-like links in static HTML." };
  }

  return { jobOpeningCount: null, countMethod: "not-counted", notes: "No reliable static job count found; page may require JavaScript or a platform API." };
}

async function countOpenings(careerPageUrl) {
  if (!careerPageUrl) return { jobOpeningCount: null, countMethod: "not-counted", notes: "No careers URL available." };
  try {
    return extractJobCount(await fetchText(careerPageUrl));
  } catch (error) {
    return { jobOpeningCount: null, countMethod: "careers-fetch-failed", notes: String(error.message || error) };
  }
}

async function queryCareers(limit) {
  const cmsRecords = await loadCmsHospitals();
  const reportCardRecords = await loadReportCardHospitals(limit);
  const observedDate = new Date().toISOString().slice(0, 10);
  const records = [];

  for (const reportCard of reportCardRecords) {
    const cms = matchCmsHospital(reportCard, cmsRecords);
    const homepage = normalizeUrl(reportCard.website);
    const discovery = await discoverCareersUrl(homepage);
    const count = await countOpenings(discovery.careerPageUrl);
    records.push({
      facilityId: cms?.facilityId || String(reportCard.mpn_id || ""),
      reportCardEntityId: reportCard.entity_id,
      facilityName: cms?.facilityName || reportCard.name,
      reportCardName: reportCard.name,
      city: cms?.city || reportCard.city,
      county: cms?.county || reportCard.county_name,
      facilityHomepageUrl: homepage,
      careerPageUrl: discovery.careerPageUrl,
      platform: platformForUrl(discovery.careerPageUrl),
      jobOpeningCount: count.jobOpeningCount,
      countMethod: count.countMethod,
      discoveryMethod: discovery.discoveryMethod,
      observedDate,
      source: "Illinois Hospital Report Card API plus facility careers page",
      sourceUrl: discovery.careerPageUrl || homepage,
      confidence: count.jobOpeningCount === null ? "low" : "medium",
      notes: [discovery.notes, count.notes].filter(Boolean).join("; ")
    });
  }

  const payload = {
    description: "Facility careers pages and public job-opening counts. Counts are labor-market signals, not proof of staffing levels or vacancy rates.",
    lastUpdated: observedDate,
    source: "Illinois Hospital Report Card API plus facility careers pages",
    sourceUrl: reportCardUrl,
    records
  };
  await fs.writeFile(path.join(root, "data", "facility-careers.json"), JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

function normalizeHeader(value) {
  return String(value || "").trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
}

function parseCsvPreview(text, maxRows = 4000) {
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

function getFirstField(row, names) {
  for (const name of names) {
    const value = row[normalizeHeader(name)];
    if (value !== undefined && String(value).trim() !== "") return String(value).trim();
  }
  return "";
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === "") return null;
  const numeric = Number(String(value).replace(/[$,%]/g, "").replace(/,/g, ""));
  return Number.isFinite(numeric) ? numeric : null;
}

const hfsFieldAliases = {
  providerName: ["provider name", "provider", "vendor name", "name", "payee name", "billing provider name"],
  providerId: ["provider id", "provider key id", "provider number", "vendor id", "npi", "provider npi"],
  county: ["county", "provider county", "vendor county", "provider county name"],
  providerType: ["provider type", "provider category", "provider class", "category", "provider specialty", "provider type code"],
  patientsServed: ["patients served", "recipient count", "recipients", "number of patients", "client count", "recipient total"],
  totalPaid: ["total paid", "total payments", "total amount paid", "amount paid", "payments", "total received", "total hfs paid", "total hfs payment", "total cost"],
  averageCost: ["average cost", "avg cost", "average payment", "avg payment", "average paid"],
  adjustments: ["adjustments", "adjustment", "adjusted amount"],
  claimCount: ["claim count", "claims", "number of claims"],
  serviceYear: ["service year", "calendar year", "year", "experience year"]
};

function findAliasedValue(row, aliases) {
  for (const alias of aliases) {
    const key = normalizeHeader(alias);
    if (row[key] !== undefined && String(row[key]).trim() !== "") return row[key];
  }
  return "";
}

function normalizeHfsProviderRecord(row, defaultYear, sourceUrl) {
  const totalPaid = toNumberOrNull(findAliasedValue(row, hfsFieldAliases.totalPaid));
  const patientsServed = toNumberOrNull(findAliasedValue(row, hfsFieldAliases.patientsServed));
  return {
    providerName: getText(findAliasedValue(row, hfsFieldAliases.providerName)) || "Unknown provider",
    providerId: getText(findAliasedValue(row, hfsFieldAliases.providerId)) || null,
    county: getText(findAliasedValue(row, hfsFieldAliases.county)) || "Unknown",
    providerType: getText(findAliasedValue(row, hfsFieldAliases.providerType)) || "Unknown provider type",
    serviceYear: Math.trunc(toNumberOrNull(findAliasedValue(row, hfsFieldAliases.serviceYear)) || defaultYear || 0) || null,
    patientsServed: patientsServed === null ? null : Math.trunc(patientsServed),
    claimCount: toNumberOrNull(findAliasedValue(row, hfsFieldAliases.claimCount)),
    totalPaid,
    averageCost: toNumberOrNull(findAliasedValue(row, hfsFieldAliases.averageCost)),
    adjustments: toNumberOrNull(findAliasedValue(row, hfsFieldAliases.adjustments)),
    paymentPerPatient: totalPaid !== null && patientsServed ? Math.round((totalPaid / patientsServed) * 100) / 100 : null,
    evidenceType: "reported_payment",
    source: "Illinois HFS Transparency Law Provider-Level Data",
    sourceUrl,
    limitations: "Provider-level aggregate payment data does not include patient-level acuity, full claim detail, managed care contract terms, denials, or medical necessity context."
  };
}

function getText(value) {
  return String(value || "").trim();
}

function parseDelimitedRows(text, maxRows = 250000) {
  const sample = text.slice(0, 5000);
  const delimiter = (sample.match(/\t/g) || []).length >= (sample.match(/,/g) || []).length ? "\t" : ",";
  if (delimiter === ",") return parseCsvPreview(text, maxRows);
  const lines = text.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) return [];
  const headers = lines[0].split("\t").map((header) => normalizeHeader(header));
  return lines.slice(1, maxRows + 1).map((line) => {
    const values = line.split("\t");
    return Object.fromEntries(headers.map((header, index) => [header || `column_${index}`, values[index] || ""]));
  });
}

function likelyHfsProviderDataLink(link) {
  const text = `${link.text} ${link.href}`.toLowerCase();
  return text.includes("provider-level data")
    && text.includes("text")
    && (text.includes(".txt") || text.includes("download"));
}

async function discoverHfsProviderDataSource() {
  try {
    const html = await fetchText(hfsTransparencyUrl);
    const links = parseLinks(html, hfsTransparencyUrl);
    const providerLinks = links.filter(likelyHfsProviderDataLink);
    const selected = providerLinks[0];
    if (!selected) throw new Error("Could not find an HFS provider-level text data link on the Transparency Law page.");
    const yearMatch = `${selected.text} ${selected.href}`.match(/\b(20\d{2})\b/);
    return {
      year: yearMatch ? Number(yearMatch[1]) : null,
      url: selected.href,
      pageUrl: hfsTransparencyUrl
    };
  } catch {
    return {
      year: 2023,
      url: "https://hfs.illinois.gov/content/dam/soi/en/web/hfs/sitecollectiondocuments/2023transparencyproviderdata.txt",
      pageUrl: hfsTransparencyUrl
    };
  }
}

function scoreHfsProviderMatch(record, hospital, system) {
  const providerName = normalizeName(record.providerName);
  const hospitalName = normalizeName(hospital.facilityName);
  const systemName = normalizeName(system?.systemName || "");
  const county = normalizeCity(record.county);
  const hospitalCounty = normalizeCity(hospital.county);
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
  if (county && hospitalCounty && county === hospitalCounty) {
    score += 15;
    reasons.push("county match");
  }
  if (/hospital|medical|health|memorial|clinic|swing|critical/.test(`${providerName} ${String(record.providerType || "").toLowerCase()}`)) {
    score += 10;
    reasons.push("hospital-like provider");
  }
  if (providerName.includes("TAYLORVILLE")) {
    score += 35;
    reasons.push("Taylorville text");
  }

  return { score, reasons };
}

async function queryHfsProviderPayments(facilityId) {
  const [cmsRecordsText, systemsText] = await Promise.all([
    fs.readFile(path.join(root, "data", "cms-hospital-general-illinois.json"), "utf8"),
    fs.readFile(path.join(root, "data", "hospital-systems.json"), "utf8").catch(() => "[]")
  ]);
  const cmsRecords = JSON.parse(cmsRecordsText);
  const systems = JSON.parse(systemsText);
  const hospital = cmsRecords.find((record) => String(record.facilityId) === String(facilityId)) || cmsRecords.find((record) => /TAYLORVILLE MEMORIAL/i.test(record.facilityName || ""));
  if (!hospital) throw new Error(`Could not find hospital ${facilityId} in CMS hospital records.`);
  const system = systems.find((candidate) => (candidate.facilityIds || []).map(String).includes(String(hospital.facilityId))) || null;
  const source = await discoverHfsProviderDataSource();
  let text;
  let dataFile = source.url;
  try {
    text = await fetchText(source.url);
  } catch (error) {
    const local = await readLocalHfsProviderDataFile();
    if (!local) {
      throw new Error(`Could not download HFS provider-level data file ${source.url}: ${error.message || error}`);
    }
    text = local.text;
    dataFile = local.path;
  }
  const rows = parseDelimitedRows(text);
  const records = rows
    .map((row) => normalizeHfsProviderRecord(row, source.year, source.url))
    .filter((record) => record.totalPaid !== null || record.patientsServed !== null)
    .map((record) => {
      const match = scoreHfsProviderMatch(record, hospital, system);
      return {
        ...record,
        matchedFacilityId: match.score >= 70 ? hospital.facilityId : null,
        matchedFacilityName: match.score >= 70 ? hospital.facilityName : null,
        matchScore: match.score,
        matchReasons: match.reasons
      };
    });
  const matchedRecords = records
    .filter((record) => record.matchedFacilityId === hospital.facilityId)
    .sort((a, b) => (b.matchScore - a.matchScore) || ((b.totalPaid || 0) - (a.totalPaid || 0)));

  const payload = {
    description: "Illinois HFS provider-level Medicaid payment data. This layer tracks aggregate public payment flow by provider, county, provider type, and reporting year.",
    lastUpdated: new Date().toISOString().slice(0, 10),
    source: "Illinois HFS Transparency Law Provider-Level Data",
    sourceUrl: source.pageUrl,
    dataFileUrl: source.url,
    dataFile,
    serviceYear: source.year,
    records: matchedRecords,
    allCandidateCount: records.filter((record) => record.matchScore >= 35).length,
    notes: matchedRecords.length
      ? `Matched ${matchedRecords.length} HFS provider payment row(s) to ${hospital.facilityName}.`
      : `No high-confidence HFS provider payment rows matched ${hospital.facilityName}; try legal entity/name variants or inspect ${records.filter((record) => record.matchScore >= 35).length} lower-confidence candidates.`
  };
  await fs.writeFile(path.join(root, "data", "hfs-provider-payments.json"), JSON.stringify(payload, null, 2), "utf8");
  return payload;
}

async function readLocalHfsProviderDataFile() {
  const candidates = [
    path.join(root, "data", "raw", "2023transparencyproviderdata.txt"),
    path.join(process.env.USERPROFILE || "", "Downloads", "2023transparencyproviderdata.txt")
  ];
  for (const candidate of candidates) {
    try {
      return {
        path: candidate,
        text: await fs.readFile(candidate, "utf8")
      };
    } catch {
      // Try the next local fallback.
    }
  }
  return null;
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

function getPriceAmount(row) {
  const keys = Object.keys(row);
  const preferred = keys.find((key) => /cash|gross|negotiated|standard|charge|rate|price|amount/.test(key));
  return toNumberOrNull(preferred ? row[preferred] : "");
}

function getChargeType(row) {
  const key = Object.keys(row).find((item) => /cash|gross|negotiated|standard|charge|rate|price|amount/.test(item));
  return key ? key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "Price field";
}

function extractPriceExamples(rows, source) {
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
  return examples.sort((a, b) => a.category.localeCompare(b.category) || (b.amount || 0) - (a.amount || 0)).slice(0, 160);
}

async function queryPriceTransparency() {
  const sourceText = await fs.readFile(path.join(root, "data", "price-transparency-sources.json"), "utf8");
  const sources = JSON.parse(sourceText);
  const records = [];
  const errors = [];

  for (const source of sources) {
    try {
      const text = await fetchTextPreview(source.machineReadableFileUrl);
      const rows = parseCsvPreview(text);
      records.push(...extractPriceExamples(rows, source));
    } catch (error) {
      errors.push(`${source.facilityName}: ${error.message || error}`);
    }
  }

  return {
    status: errors.length
      ? `Price source metadata loaded, but server preview had errors: ${errors.join("; ")}`
      : `Server parsed ${records.length} service examples from ${sources.length} mapped price transparency file${sources.length === 1 ? "" : "s"}.`,
    sources,
    records,
    errors
  };
}

async function serveStatic(request, response, pathname) {
  const rawPath = pathname === "/" ? "/index.html" : pathname;
  const filePath = path.resolve(root, `.${decodeURIComponent(rawPath)}`);
  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const bytes = await fs.readFile(filePath);
    response.writeHead(200, { "content-type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream" });
    response.end(bytes);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url, `http://127.0.0.1:${port}`);

  if (requestUrl.pathname === "/api/query-careers") {
    try {
      const limit = Math.max(1, Math.min(Number(requestUrl.searchParams.get("limit") || 25), 100));
      sendJson(response, 200, await queryCareers(limit));
    } catch (error) {
      sendJson(response, 500, { error: String(error.message || error) });
    }
    return;
  }

  if (requestUrl.pathname === "/api/query-price-transparency") {
    try {
      sendJson(response, 200, await queryPriceTransparency());
    } catch (error) {
      sendJson(response, 500, { error: String(error.message || error) });
    }
    return;
  }

  if (requestUrl.pathname === "/api/query-hfs-provider-payments") {
    try {
      sendJson(response, 200, await queryHfsProviderPayments(requestUrl.searchParams.get("facilityId") || "141339"));
    } catch (error) {
      sendJson(response, 500, { error: String(error.message || error) });
    }
    return;
  }

  await serveStatic(request, response, requestUrl.pathname);
});

globalThis.illinoisDashboardServer = server;

server.listen(port, "127.0.0.1", () => {
  console.log(`Illinois Reimbursement Explorer running at http://127.0.0.1:${port}/`);
});
