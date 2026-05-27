const http = require("http");
const https = require("https");
const fs = require("fs/promises");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.env.PORT || 8765);
const userAgent = "IllinoisReimbursementExplorer/0.1 (public research)";
const reportCardUrl = "https://healthcarereportcard.illinois.gov/api/hospitals?per_page=100";
const hfsTransparencyUrl = "https://hfs.illinois.gov/info/factsfigures/transparency.html";
const pricePreviewBytes = 12_000_000;
const tlsFallbackHosts = new Set([
  "api.hospitalpriceindex.com",
  "sthpiprd.blob.core.windows.net",
  "osf-p-001.sitecorecontenthub.cloud",
  "img1.wsimg.com"
]);

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
    try {
      const response = await fetch(url, {
        headers: { "user-agent": userAgent, "accept": "text/html,application/json;q=0.9,*/*;q=0.8" },
        redirect: "follow",
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.text();
    } catch (error) {
      return await fetchTextWithHttpsFallback(url, {
        headers: { "user-agent": userAgent, "accept": "text/html,application/json;q=0.9,*/*;q=0.8" },
        maxBytes: 4_000_000,
        error
      });
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchTextPreview(url, maxBytes = pricePreviewBytes) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 45000);
  try {
    try {
      const response = await fetch(url, {
        headers: { "user-agent": userAgent, "accept": "application/json,text/csv,text/plain,*/*;q=0.8" },
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
    } catch (error) {
      return await fetchTextWithHttpsFallback(url, {
        headers: { "user-agent": userAgent, "accept": "application/json,text/csv,text/plain,*/*;q=0.8" },
        maxBytes,
        error
      });
    }
  } finally {
    clearTimeout(timeout);
  }
}

async function postJson(url, body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 20000);
  try {
    const headers = {
      "user-agent": userAgent,
      "accept": "application/json",
      "content-type": "application/json"
    };
    try {
      const response = await fetch(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        redirect: "follow",
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      return await response.json();
    } catch (error) {
      return JSON.parse(await fetchTextWithHttpsFallback(url, {
        method: "POST",
        headers,
        body: JSON.stringify(body),
        maxBytes: 2_000_000,
        error
      }));
    }
  } finally {
    clearTimeout(timeout);
  }
}

function fetchTextWithHttpsFallback(url, options = {}) {
  const originalError = options.error;
  const requestUrl = new URL(url);
  const shouldFallback = tlsFallbackHosts.has(requestUrl.hostname)
    && (originalError?.cause?.code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY" || originalError?.message === "fetch failed");
  if (!shouldFallback) throw originalError;
  return new Promise((resolve, reject) => {
    let settled = false;
    const request = https.request({
      method: options.method || "GET",
      hostname: requestUrl.hostname,
      path: `${requestUrl.pathname}${requestUrl.search}`,
      headers: options.headers || {},
      rejectUnauthorized: false
    }, (response) => {
      if ([301, 302, 303, 307, 308].includes(response.statusCode) && response.headers.location) {
        response.resume();
        const redirectedUrl = new URL(response.headers.location, requestUrl).toString();
        fetchTextWithHttpsFallback(redirectedUrl, options).then(resolve, reject);
        return;
      }
      if (response.statusCode < 200 || response.statusCode >= 300) {
        response.resume();
        reject(new Error(`HTTP ${response.statusCode}`));
        return;
      }
      const chunks = [];
      let total = 0;
      response.on("data", (chunk) => {
        if (settled) return;
        chunks.push(chunk);
        total += chunk.length;
        if (total >= (options.maxBytes || pricePreviewBytes)) {
          settled = true;
          response.destroy();
          resolve(Buffer.concat(chunks).toString("utf8"));
        }
      });
      response.on("end", () => {
        if (!settled) {
          settled = true;
          resolve(Buffer.concat(chunks).toString("utf8"));
        }
      });
      response.on("error", (error) => {
        if (!settled) {
          settled = true;
          reject(error);
        }
      });
    });
    request.on("error", (error) => {
      if (!settled) {
        settled = true;
        reject(error);
      }
    });
    if (options.body) request.write(options.body);
    request.end();
  });
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

function parseCsvPreview(text, maxRows = 4000, delimiter = ",") {
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
    } else if (char === delimiter && !inQuotes) {
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
    return (normalized.includes("description") || normalized.includes("line_item"))
      && (normalized.includes("setting") || normalized.includes("billing_class") || normalized.some((header) => header.startsWith("code")));
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
  if (/\b(therapy|physical therapy|occupational therapy|speech therapy|rehab|rehabilitation)\b/.test(text)) return "Therapy";
  if (/\b(pharmacy|drug|injection|infusion|j[0-9]{4}|ndc)\b/.test(text)) return "Drug/Pharmacy";
  if (/\b(drg|apr-drg|apr drg|ms-drg|inpatient)\b/.test(text)) return "Inpatient/DRG";
  return null;
}

function getPriceValue(row, aliases) {
  const normalized = new Map(Object.entries(row).map(([key, value]) => [normalizeHeader(key), value]));
  for (const alias of aliases) {
    const value = normalized.get(normalizeHeader(alias));
    if (value !== undefined && String(value).trim() !== "") return toNumberOrNull(value);
  }
  return null;
}

function getPriceAmount(row) {
  return getPriceValue(row, [
    "discounted_cash",
    "standard_charge|gross",
    "gross_charge",
    "gross charge",
    "cash price",
    "cash_price",
    "standard charge gross",
    "standard_charge",
    "charge",
    "rate",
    "amount"
  ]);
}

function getChargeType(row) {
  const key = Object.keys(row).find((item) => /cash|gross|negotiated|standard|charge|rate|price|amount/i.test(item));
  return key ? key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase()) : "Price field";
}

function getFirstCode(row) {
  return getFirstField(row, ["code", "code_1", "code_2", "billing_code", "hcpcs_cpt", "cpt_hcpcs", "ms_drg", "apr_drg", "drg", "revenue_code", "billing code"]);
}

function getCodeType(row) {
  return getFirstField(row, ["code_type", "type", "code_type_1", "billing_code_type", "coding_system", "code type"]);
}

const priceServiceBasket = [
  { key: "emergency", label: "ED visit", categories: ["Emergency"], terms: ["emergency", "er room", "ed visit", "99281", "99282", "99283", "99284", "99285"] },
  { key: "observation", label: "Observation", categories: ["Observation"], terms: ["observation", "g0378", "obs"] },
  { key: "room_board", label: "Room / board revenue code", categories: [], terms: ["room", "board", "revenue", "0120", "semi private", "bed"] },
  { key: "inpatient_drg", label: "Inpatient DRG / room", categories: ["Inpatient/DRG"], terms: ["drg", "inpatient", "swing bed"] },
  { key: "ct_mri", label: "CT / MRI imaging", categories: ["Imaging"], terms: ["ct ", "computed tomography", "mri", "scan"] },
  { key: "lab_panel", label: "CBC / CMP / troponin", categories: ["Lab"], terms: ["cbc", "blood count", "metabolic", "cmp", "troponin", "panel", "laboratory"] },
  { key: "pharmacy", label: "Drug / pharmacy", categories: ["Drug/Pharmacy"], terms: ["pharmacy", "drug", "injection", "infusion", "ndc", "j"] },
  { key: "therapy", label: "Therapy", categories: ["Therapy"], terms: ["therapy", "physical therapy", "occupational therapy", "speech therapy", "rehab"] }
];

function getPriceBasketKey(record) {
  const haystack = `${record.category || ""} ${record.description || ""} ${record.code || ""} ${record.codeType || ""} ${record.setting || ""} ${record.billingClass || ""}`.toLowerCase();
  const match = priceServiceBasket.find((basket) =>
    basket.categories.includes(record.category)
    || basket.terms.some((term) => haystack.includes(term))
  );
  return match?.key || "other";
}

function getPriceQualityFlags(record, source) {
  const flags = [];
  flags.push(getPriceBasketKey(record) === "other" ? "fuzzy match" : "exact/category match");
  if (!Number.isFinite(record.amount)) flags.push("amount missing");
  if (/percent|percentage|algorithm|formula|fee schedule/i.test(`${record.chargeType || ""} ${record.rateMethod || ""}`)) flags.push("formula or percent-of-charge");
  if (record.payer || record.plan) flags.push("payer-specific");
  if (!record.payer && /gross/i.test(record.chargeType || "")) flags.push("gross-charge only");
  if (/medicare|medicaid|excluded/i.test(source?.sourceNote || record.limitations || "")) flags.push("public payer excluded");
  if (!record.code) flags.push("code missing");
  return [...new Set(flags)];
}

function getComparabilityStatus(flags) {
  if (flags.includes("amount missing")) return "not comparable";
  if (flags.includes("formula or percent-of-charge")) return "formula only";
  if (flags.includes("payer-specific")) return "payer-specific";
  if (flags.includes("gross-charge only")) return "gross-charge only";
  return "comparable signal";
}

function normalizePriceExample(example, source) {
  const normalized = {
    facilityId: source.facilityId,
    facilityName: source.facilityName,
    systemName: source.systemName || "",
    category: example.category,
    description: example.description || "Matched price transparency row",
    code: example.code || "",
    codeType: example.codeType || "",
    setting: example.setting || "",
    billingClass: example.billingClass || "",
    payer: example.payer || "",
    plan: example.plan || "",
    chargeType: example.chargeType || "Price field",
    amount: Number.isFinite(example.amount) ? example.amount : null,
    grossCharge: Number.isFinite(example.grossCharge) ? example.grossCharge : null,
    cashPrice: Number.isFinite(example.cashPrice) ? example.cashPrice : null,
    minRate: Number.isFinite(example.minRate) ? example.minRate : null,
    maxRate: Number.isFinite(example.maxRate) ? example.maxRate : null,
    rateMethod: example.rateMethod || "",
    sourceUrl: source.machineReadableFileUrl,
    priceTransparencyPageUrl: source.priceTransparencyPageUrl,
    observedDate: new Date().toISOString().slice(0, 10),
    evidenceType: "charge",
    limitations: "Hospital price transparency rows are published charge/rate signals. They do not prove actual paid claims, patient responsibility, volume, denials, medical necessity, or margin."
  };
  const qualityFlags = getPriceQualityFlags(normalized, source);
  return {
    ...normalized,
    serviceBasketKey: getPriceBasketKey(normalized),
    serviceMatchType: qualityFlags.includes("exact/category match") ? "exact/category match" : "fuzzy match",
    qualityFlags,
    comparabilityStatus: getComparabilityStatus(qualityFlags),
    sourceParser: source.fileFormat || "unknown"
  };
}

function limitExamplesByCategory(examples, totalLimit = 160, perCategoryLimit = 35) {
  const sorted = examples.sort((a, b) => a.category.localeCompare(b.category) || (b.amount || 0) - (a.amount || 0));
  const selected = [];
  const selectedKeys = new Set();
  const categories = [...new Set(sorted.map((example) => example.category))].sort();
  for (const category of categories) {
    const categoryExamples = sorted.filter((example) => example.category === category).slice(0, perCategoryLimit);
    for (const example of categoryExamples) {
      const key = `${example.category}|${example.description}|${example.code}|${example.chargeType}|${example.amount}|${example.payer}|${example.plan}`;
      if (selectedKeys.has(key)) continue;
      selectedKeys.add(key);
      selected.push(example);
    }
  }
  for (const example of sorted) {
    if (selected.length >= totalLimit) break;
    const key = `${example.category}|${example.description}|${example.code}|${example.chargeType}|${example.amount}|${example.payer}|${example.plan}`;
    if (selectedKeys.has(key)) continue;
    selectedKeys.add(key);
    selected.push(example);
  }
  return selected.slice(0, totalLimit);
}

function extractPriceExamples(rows, source) {
  const examples = [];
  const seen = new Set();
  rows.forEach((row) => {
    const description = getFirstField(row, ["description", "item_description", "service_description", "billing_description", "standard_charge_description", "line_item"]);
    const code = getFirstCode(row);
    const codeType = getCodeType(row);
    const setting = getFirstField(row, ["setting", "patient_type", "inpatient_outpatient", "service_setting"]);
    const billingClass = getFirstField(row, ["billing_class", "billing_classification"]);
    const notes = getFirstField(row, ["additional_generic_notes", "additional_payer_notes", "gross_charge_type", "standard_charge_methodology", "standard_charge_algorithm", "rate_method", "rate_methodology"]);
    const haystack = `${description} ${code} ${setting} ${billingClass} ${notes}`.toLowerCase();
    const category = classifyPriceTransparencyRow(haystack);
    if (!category) return;
    const amount = getPriceAmount(row);
    const payer = getFirstField(row, ["payer", "payer_name", "plan", "plan_name", "third_party_payer_name"]);
    const plan = getFirstField(row, ["plan", "plan_name", "payer_plan", "third_party_payer_plan_name"]);
    const chargeType = getChargeType(row);
    const key = `${category}|${description}|${code}|${chargeType}|${amount}|${payer}`;
    if (seen.has(key)) return;
    seen.add(key);
    examples.push(normalizePriceExample({
      category,
      description,
      code,
      codeType,
      amount,
      grossCharge: getPriceValue(row, ["gross_charge", "gross charge", "standard_charge|gross", "standard charge gross"]),
      cashPrice: getPriceValue(row, ["discounted_cash", "cash_price", "cash price", "standard_charge|discounted_cash"]),
      minRate: getPriceValue(row, ["minimum", "min", "deidentified_min", "de-identified minimum negotiated charge"]),
      maxRate: getPriceValue(row, ["maximum", "max", "deidentified_max", "de-identified maximum negotiated charge"]),
      payer,
      plan,
      chargeType,
      setting,
      billingClass
    }, source));
  });
  return limitExamplesByCategory(examples);
}

function extractJsonArrayObjects(text, arrayName, maxObjects = 600) {
  const startKey = text.indexOf(`"${arrayName}"`);
  if (startKey === -1) return [];
  const arrayStart = text.indexOf("[", startKey);
  if (arrayStart === -1) return [];
  const objects = [];
  let depth = 0;
  let inString = false;
  let escaped = false;
  let objectStart = -1;
  for (let index = arrayStart + 1; index < text.length && objects.length < maxObjects; index += 1) {
    const char = text[index];
    if (inString) {
      escaped = char === "\\" && !escaped;
      if (char === "\"" && !escaped) inString = false;
      if (char !== "\\") escaped = false;
      continue;
    }
    if (char === "\"") {
      inString = true;
    } else if (char === "{") {
      if (depth === 0) objectStart = index;
      depth += 1;
    } else if (char === "}") {
      depth -= 1;
      if (depth === 0 && objectStart !== -1) {
        try {
          objects.push(JSON.parse(text.slice(objectStart, index + 1)));
        } catch {
          // Skip malformed preview fragments.
        }
        objectStart = -1;
      }
    } else if (char === "]" && depth === 0) {
      break;
    }
  }
  return objects;
}

function extractJsonPriceExamples(text, source) {
  const items = extractJsonArrayObjects(text, "standard_charge_information");
  const examples = [];
  const seen = new Set();
  for (const item of items) {
    const description = item.description || item.item_description || "";
    const codes = Array.isArray(item.code_information) ? item.code_information : [];
    const code = codes[0]?.code || item.code || "";
    const codeType = codes[0]?.type || item.code_type || "";
    const charges = Array.isArray(item.standard_charges) ? item.standard_charges : [];
    for (const charge of charges.slice(0, 3)) {
      const setting = charge.setting || item.setting || "";
      const billingClass = charge.billing_class || item.billing_class || "";
      const notes = `${charge.additional_generic_notes || ""} ${charge.additional_payer_notes || ""} ${item.additional_generic_notes || ""}`;
      const category = classifyPriceTransparencyRow(`${description} ${code} ${codeType} ${setting} ${billingClass} ${notes}`.toLowerCase());
      if (!category) continue;
      const baseExamples = [
        ["Gross charge", toNumberOrNull(charge.gross_charge)],
        ["Discounted cash", toNumberOrNull(charge.discounted_cash)],
        ["De-identified minimum", toNumberOrNull(charge.minimum)],
        ["De-identified maximum", toNumberOrNull(charge.maximum)]
      ];
      for (const [chargeType, amount] of baseExamples) {
        if (!Number.isFinite(amount)) continue;
        const key = `${description}|${code}|${setting}|${chargeType}|${amount}`;
        if (seen.has(key)) continue;
        seen.add(key);
        examples.push(normalizePriceExample({
          category,
          description,
          code,
          codeType,
          setting,
          billingClass,
          chargeType,
          amount,
          grossCharge: toNumberOrNull(charge.gross_charge),
          cashPrice: toNumberOrNull(charge.discounted_cash),
          minRate: toNumberOrNull(charge.minimum),
          maxRate: toNumberOrNull(charge.maximum)
        }, source));
      }
      const payerRows = Array.isArray(charge.payers_information) ? charge.payers_information.slice(0, 2) : [];
      for (const payerRow of payerRows) {
        const amount = toNumberOrNull(payerRow.standard_charge_dollar) || toNumberOrNull(payerRow.negotiated_dollar) || toNumberOrNull(payerRow.median_amount);
        const percentage = toNumberOrNull(payerRow.standard_charge_percentage);
        if (!Number.isFinite(amount) && !Number.isFinite(percentage)) continue;
        const key = `${description}|${code}|${setting}|${payerRow.payer_name}|${payerRow.plan_name}|${amount || percentage}`;
        if (seen.has(key)) continue;
        seen.add(key);
        examples.push(normalizePriceExample({
          category,
          description,
          code,
          codeType,
          setting,
          billingClass,
          payer: payerRow.payer_name,
          plan: payerRow.plan_name,
          chargeType: Number.isFinite(amount) ? "Payer negotiated dollar" : "Payer negotiated percentage",
          amount: Number.isFinite(amount) ? amount : percentage,
          grossCharge: toNumberOrNull(charge.gross_charge),
          cashPrice: toNumberOrNull(charge.discounted_cash),
          minRate: toNumberOrNull(charge.minimum),
          maxRate: toNumberOrNull(charge.maximum),
          rateMethod: payerRow.methodology || payerRow.standard_charge_algorithm || ""
        }, source));
      }
    }
  }
  return limitExamplesByCategory(examples);
}

function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/).find((line) => line.trim()) || "";
  const candidates = [",", "\t", "|"];
  return candidates
    .map((delimiter) => [delimiter, firstLine.split(delimiter).length])
    .sort((a, b) => b[1] - a[1])[0][0];
}

function parseDelimitedPreview(text) {
  const delimiter = detectDelimiter(text);
  return parseCsvPreview(text, 3000, delimiter);
}

function getHpiDefinitionId(source) {
  if (source.hpiDefinitionId) return Number(source.hpiDefinitionId);
  const match = String(source.machineReadableFileUrl || source.priceTransparencyPageUrl || "").match(/\/machineReadable\/[^/]+\/(\d+)/i);
  return match ? Number(match[1]) : null;
}

function inferFileFormat(url) {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.endsWith(".json")) return "json";
  if (pathname.endsWith(".txt")) return "txt";
  return "csv";
}

async function resolvePriceSource(source) {
  const hpiDefinitionId = getHpiDefinitionId(source);
  if (!hpiDefinitionId || source.sourceStatus !== "portal_only") return { ...source };
  const payload = await postJson("https://api.hospitalpriceindex.com/itemList/detail", {
    defId: hpiDefinitionId,
    priceStatus: "published",
    listName: "machineRead",
    page: { from: 1, size: 5 },
    filters: [{ property: "payerId", value: "0" }],
    sortInput: [{ reverse: false, by: "description" }]
  });
  const detail = Array.isArray(payload.result) ? payload.result[0] : null;
  if (!detail?.extractFile) return { ...source };
  return {
    ...source,
    hpiDefinitionId,
    machineReadableFileUrl: detail.extractFile,
    updatedAsOf: detail.lastUpdated || source.updatedAsOf,
    fileFormat: inferFileFormat(detail.extractFile),
    sourceStatus: "direct_file",
    sourceNote: `${source.sourceNote || ""} Hospital Price Index API resolved the portal to the current machine-readable file on ${new Date().toISOString().slice(0, 10)}.`.trim()
  };
}

async function queryPriceTransparency() {
  const sourceText = await fs.readFile(path.join(root, "data", "price-transparency-sources.json"), "utf8");
  const sources = JSON.parse(sourceText.replace(/^\uFEFF/, ""));
  const records = [];
  const errors = [];
  const updatedSources = [];
  const textCache = new Map();

  for (const source of sources) {
    let resolvedSource = source;
    let updatedSource = { ...source, parserStatus: "not_run", recordsParsed: 0, lastQueried: new Date().toISOString().slice(0, 10) };
    try {
      resolvedSource = await resolvePriceSource(source);
      updatedSource = { ...resolvedSource, parserStatus: "not_run", recordsParsed: 0, lastQueried: new Date().toISOString().slice(0, 10) };
      if (resolvedSource.sourceStatus === "portal_only" || resolvedSource.fileFormat === "html_portal") {
        updatedSource.parserStatus = "portal_only";
        updatedSource.parserMessage = "Mapped to a public portal page; direct machine-readable CSV/JSON endpoint still needs discovery.";
        updatedSources.push(updatedSource);
        continue;
      }
      const cacheKey = resolvedSource.machineReadableFileUrl;
      const text = textCache.has(cacheKey)
        ? textCache.get(cacheKey)
        : await fetchTextPreview(cacheKey);
      textCache.set(cacheKey, text);
      const examples = resolvedSource.fileFormat === "json" || /^\s*[{[]/.test(text)
        ? extractJsonPriceExamples(text, resolvedSource)
        : extractPriceExamples(parseDelimitedPreview(text), resolvedSource);
      records.push(...examples);
      updatedSource.parserStatus = examples.length ? "parsed" : "no_examples";
      updatedSource.recordsParsed = examples.length;
      updatedSource.parserMessage = examples.length
        ? `Parsed ${examples.length} service examples from preview.`
        : "File loaded, but no benchmark service examples were found in the preview.";
    } catch (error) {
      updatedSource.parserStatus = "error";
      updatedSource.parserMessage = error.message || String(error);
      errors.push(`${source.facilityName}: ${error.message || error}`);
    }
    updatedSources.push(updatedSource);
  }

  await fs.writeFile(path.join(root, "data", "price-transparency-sources.json"), JSON.stringify(updatedSources, null, 2), "utf8");
  await fs.writeFile(path.join(root, "data", "price-transparency-records.json"), JSON.stringify(records, null, 2), "utf8");

  return {
    status: errors.length
      ? `Price source metadata loaded, but server preview had errors: ${errors.join("; ")}`
      : `Server parsed ${records.length} service examples from ${updatedSources.length} mapped price transparency source${updatedSources.length === 1 ? "" : "s"}.`,
    sources: updatedSources,
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
