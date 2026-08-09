const stages = [
  {
    label: "Scheduling and Financial Clearance",
    patient: "Patient asks about coverage, estimate, deductible, and appointment timing.",
    provider: "Provider verifies benefits, estimates cost sharing, and checks authorization requirements.",
    payer: "Payer confirms eligibility, plan rules, coverage limits, and authorization requirements.",
    risk: 78
  },
  {
    label: "Preauthorization",
    patient: "Patient needs approval to avoid delay, denial, or unexpected responsibility.",
    provider: "Provider submits medical necessity documentation before service when required.",
    payer: "Payer reviews medical necessity and plan criteria before approving payment.",
    risk: 84
  },
  {
    label: "Registration and Cost Sharing",
    patient: "Patient provides demographic and insurance information and may pay deductible or copay.",
    provider: "Provider captures accurate patient, guarantor, and payer data at check-in.",
    payer: "Payer depends on correct member and plan information to adjudicate the claim.",
    risk: 68
  },
  {
    label: "Care Delivery",
    patient: "Patient receives the ordered procedure and consumes resources during treatment.",
    provider: "Provider delivers care and documents services, supplies, drugs, equipment, and staff resources.",
    payer: "Payer later evaluates whether the delivered care matches covered benefits and medical policy.",
    risk: 62
  },
  {
    label: "Charge Capture",
    patient: "Patient expects the bill to reflect the care actually received.",
    provider: "Provider captures facility, medication, supply, device, and professional charges.",
    payer: "Payer reviews submitted charge lines against coverage, coding, and contract rules.",
    risk: 88
  },
  {
    label: "Coding and Medical Record Review",
    patient: "Patient may not see coding work directly, but it influences claim accuracy and payment.",
    provider: "Provider codes diagnoses and services based on documentation in the medical record.",
    payer: "Payer uses codes to determine coverage, medical necessity, and reimbursement.",
    risk: 82
  },
  {
    label: "Claim Scrub and Submission",
    patient: "Clean claim processing reduces billing delays and confusion.",
    provider: "Provider audits claim edits, corrects errors, and transmits the claim.",
    payer: "Payer receives the claim and applies benefit, coding, and contract logic.",
    risk: 74
  },
  {
    label: "Payer Adjudication and Remittance",
    patient: "Patient receives an explanation of benefits showing what was paid and what remains.",
    provider: "Provider posts payer payment and remittance advice, then follows up on variances.",
    payer: "Payer pays, denies, adjusts, or requests additional information.",
    risk: 70
  },
  {
    label: "Patient Balance Resolution",
    patient: "Patient receives a final bill and may need payment options or financial counseling.",
    provider: "Provider collects remaining cost sharing and resolves patient questions.",
    payer: "Payer's adjudication determines the covered amount and final patient responsibility.",
    risk: 58
  }
];

const scenarioText = {
  patient: {
    title: "Patient Cost and Access View",
    cards: [
      ["Most Important Question", "What will I owe before and after insurance pays?"],
      ["Revenue Integrity Link", "Accurate estimates and explanations reduce surprise billing concerns and improve the chance that patient responsibility is collected."],
      ["Jared's Work Connection", "Supply, service, and equipment choices influence the total resources used during care, which can shape the patient estimate and final bill."]
    ]
  },
  provider: {
    title: "Provider Revenue Integrity View",
    cards: [
      ["Most Important Question", "Did we capture the right service, documentation, codes, charges, and payer rules?"],
      ["Revenue Integrity Link", "Revenue is protected when scheduling, authorization, documentation, charge capture, claim edits, and payment posting are completed correctly."],
      ["Jared's Work Connection", "Strategic sourcing and capital purchasing sit close to cost drivers: supplies, equipment, service agreements, standardization, and vendor contracts."]
    ]
  },
  payer: {
    title: "Third-Party Payer Review View",
    cards: [
      ["Most Important Question", "Is this service covered, medically necessary, authorized, coded correctly, and priced according to contract?"],
      ["Revenue Integrity Link", "Payer review determines whether the claim is paid, denied, adjusted, or appealed."],
      ["Jared's Work Connection", "Product standardization and accurate item data help align the care delivered with documentation, contract terms, and reimbursement expectations."]
    ]
  }
};

const procedureImpact = {
  infusion: {
    multiplier: 1.12,
    note: "Infusion services increase the importance of medication documentation, supply accuracy, authorization, and charge capture."
  },
  surgery: {
    multiplier: 1.18,
    note: "Surgical services increase the importance of facility charges, implants, anesthesia, supplies, and post-procedure coding."
  },
  imaging: {
    multiplier: 1.04,
    note: "Advanced imaging often depends on preauthorization, medical necessity, and site-of-service rules."
  },
  dme: {
    multiplier: 1.15,
    note: "Capital-dependent and DME-related services increase the importance of equipment contracts, documentation, and payer rules."
  }
};

const payerImpact = {
  commercial: {
    multiplier: 1.08,
    note: "Commercial plans vary by contract, benefit design, deductible, coinsurance, and authorization policy."
  },
  medicareAdvantage: {
    multiplier: 1.16,
    note: "Medicare Advantage is a strong payer lens because prior authorization is common and denials can delay care."
  },
  selfPay: {
    multiplier: 0.94,
    note: "Self-pay scenarios shift focus toward good faith estimates, financial counseling, and payment plans."
  }
};

const programStrategy = {
  originalMedicare: {
    label: "Original Medicare",
    reimbursement: "Federal payment rules create predictable coverage categories, but margin depends on documentation, coding, site of service, and whether the cost of labor, supplies, services, and equipment is controlled.",
    financial: "Financial performance risk: high volume can be stable, but payment may not keep pace with operating cost growth. CMS projects Medicare spending to grow faster than Medicaid through 2034, so demand planning matters.",
    strategy: "Strategic planning action: protect high-demand service lines, strengthen clinical documentation, monitor readmissions and quality penalties, and build sourcing standards around reimbursable care pathways.",
    sourcing: "Jared lens: standardize implants, devices, supplies, service agreements, and capital equipment so clinical teams can deliver covered services without avoidable variation.",
    score: [88, 72, 80]
  },
  medicareAdvantage: {
    label: "Medicare Advantage",
    reimbursement: "Medicare Advantage plans must cover Medicare-covered services, but they add plan-specific networks, prior authorization, referral rules, and contract terms.",
    financial: "Financial performance risk: delayed authorizations, denials, and contract variance can slow cash flow even when the service is clinically appropriate.",
    strategy: "Strategic planning action: build payer-specific dashboards for authorization, denial rate, appeal success, network access, discharge planning, and high-cost service utilization.",
    sourcing: "Jared lens: purchasing and item-master data should support medical necessity, prior authorization, and accurate charge capture for high-cost supplies, services, and devices.",
    score: [82, 90, 86]
  },
  illinoisMedicaid: {
    label: "Illinois Medicaid",
    reimbursement: "Illinois Medicaid is state-administered within federal rules, so reimbursement depends on state fee schedules, managed care contracts, eligibility, and covered benefit rules.",
    financial: "Financial performance risk: Medicaid protects access for a large population, but rates and managed care rules can pressure margin and increase administrative follow-up.",
    strategy: "Strategic planning action: plan capacity around community need, behavioral health, access, managed care requirements, eligibility changes, and timely claim/denial work queues.",
    sourcing: "Jared lens: cost discipline matters because supply, service, and capital decisions can determine whether a service remains financially sustainable under lower reimbursement.",
    score: [78, 84, 92]
  },
  dualEligible: {
    label: "Medicare + Medicaid",
    reimbursement: "Dual-eligible patients may have Medicare as the primary payer while Medicaid, QMB, or another Medicare Savings Program helps with approved cost sharing.",
    financial: "Financial performance risk: coordination failures can create billing confusion, incorrect patient balances, delayed secondary payment, or avoidable write-offs.",
    strategy: "Strategic planning action: screen for Medicaid/MSP eligibility, coordinate benefits, avoid inappropriate patient billing, and design access workflows for seniors with complex needs.",
    sourcing: "Jared lens: covered supplies, durable equipment, service access, and care transitions become especially important because this population often has higher chronic-care and affordability needs.",
    score: [90, 88, 94]
  }
};

const staffingStrategy = {
  claimsProduction: {
    label: "Claims Production",
    competency: "Staff need coding literacy, documentation review, charge capture awareness, and comfort identifying whether a claim is complete before it leaves the organization.",
    lapse: "Common lapse: missing charges, incorrect codes, wrong modifiers, incomplete authorization numbers, or unsupported services.",
    prevention: "Prevention: use claim edits, pre-bill review, role-specific checklists, and clear handoffs between clinical documentation, coding, and billing.",
    sourcing: "HSHS sourcing angle: item-master accuracy, contract files, capital equipment setup, and vendor data should support complete charge capture before claims are produced.",
    score: [88, 82, 76]
  },
  claimsSubmission: {
    label: "Claims Submission",
    competency: "Staff need payer-specific submission knowledge, clearinghouse workflow skills, timely filing awareness, and the discipline to resolve rejected claims quickly.",
    lapse: "Common lapse: claim sent to the wrong payer, missing attachment, duplicate claim, late filing, or unresolved clearinghouse rejection.",
    prevention: "Prevention: monitor daily rejection queues, track aging by payer, use attachment standards, and escalate high-dollar accounts before deadlines are missed.",
    sourcing: "HSHS sourcing angle: vendor platforms should reduce manual portal work, support electronic attachments, and show whether claims were accepted or rejected.",
    score: [84, 90, 81]
  },
  denialManagement: {
    label: "Denial Management",
    competency: "Staff need appeal writing, root-cause analysis, remittance interpretation, payer-policy research, and communication with departments that created the upstream issue.",
    lapse: "Common lapse: denials worked one at a time without identifying why they repeat, leading to rework and delayed cash.",
    prevention: "Prevention: categorize denials consistently, review trends in huddles, assign owners, and connect payer feedback back to scheduling, documentation, and charging.",
    sourcing: "HSHS sourcing angle: denial trends can reveal where a device, supply, documentation tool, or vendor workflow is increasing reimbursement risk.",
    score: [92, 86, 90]
  },
  reimbursementAnalytics: {
    label: "Expected Reimbursement",
    competency: "Staff need contract knowledge, payment variance review, payer mix awareness, and the ability to compare actual payment with expected reimbursement.",
    lapse: "Common lapse: underpayments, payment variances, or credit balances are not identified quickly enough to correct the account.",
    prevention: "Prevention: compare remittance to expected reimbursement, flag underpayments, review public-payer margin pressure, and share findings with finance leaders.",
    sourcing: "HSHS sourcing angle: sourcing decisions should consider reimbursement limits, total cost of ownership, utilization, service-line margin, and contract performance.",
    score: [80, 78, 94]
  }
};

const explorerBridgeMetrics = [
  {
    value: "703",
    label: "Illinois HFS hospital-provider payment rows",
    note: "2023 Transparency Law provider-level payment file parsed in the Illinois Reimbursement Explorer."
  },
  {
    value: "222",
    label: "HFS rows matched to CMS hospital records",
    note: "Matched across 148 Illinois CMS hospital facilities in the older explorer handoff."
  },
  {
    value: "207",
    label: "Illinois HCRIS hospital cost-report records",
    note: "CMS cost report rows add facility economics, cost, utilization, and margin context."
  },
  {
    value: "4,836",
    label: "Price transparency examples normalized",
    note: "Hospital machine-readable files add charge and public rate signals, not final patient bills."
  }
];

const explorerBridgeRows = [
  {
    label: "Public payer pressure",
    data: "AHA reported Medicare paid hospitals 82 cents for every dollar spent caring for Medicare patients in 2022.",
    paperUse: "Supports the paper's point that delayed or denied claims are harder to absorb when public-payer reimbursement is already below cost."
  },
  {
    label: "Documentation risk",
    data: "CMS reported that 77.17% of FY 2025 Medicaid improper payments were tied to insufficient documentation.",
    paperUse: "Supports the staffing competency section: documentation, claim attachments, and audit trails are core revenue integrity controls."
  },
  {
    label: "HSHS public financial context",
    data: "The older explorer mapped HSHS FY2024 audited public financial data, including $2.803B total revenue, $3.189B total expenses, and a -13.8% operating margin at the consolidated system level.",
    paperUse: "Adds local relevance while keeping the limitation clear: this is public system-level context, not facility-level claim performance."
  },
  {
    label: "Strategic sourcing lens",
    data: "The HSHS public audit extract included $481.9M in supplies expense and $583.7M in purchased services.",
    paperUse: "Shows why sourcing, service agreements, item data, and vendor platforms matter when staffing teams are trying to prevent revenue-cycle rework."
  }
];

const perspectiveSelect = document.getElementById("perspectiveSelect");
const procedureSelect = document.getElementById("procedureSelect");
const payerSelect = document.getElementById("payerSelect");
const programSelect = document.getElementById("programSelect");
const timeline = document.getElementById("timeline");
const stageCount = document.getElementById("stageCount");
const scenarioTitle = document.getElementById("scenarioTitle");
const scenarioBody = document.getElementById("scenarioBody");
const canvas = document.getElementById("riskChart");
const ctx = canvas.getContext("2d");
const riskLegend = document.getElementById("riskLegend");
const programSignal = document.getElementById("programSignal");
const programImpact = document.getElementById("programImpact");
const strategyScorecard = document.getElementById("strategyScorecard");
const staffingSelect = document.getElementById("staffingSelect");
const staffingSignal = document.getElementById("staffingSignal");
const staffingImpact = document.getElementById("staffingImpact");
const staffingScorecard = document.getElementById("staffingScorecard");
const explorerMetricCards = document.getElementById("explorerMetricCards");
const explorerBridgeRowsEl = document.getElementById("explorerBridgeRows");
const simulatorOutput = document.getElementById("simulatorOutput");
const simulatorInputs = [
  "claimVolumeInput",
  "denialRateInput",
  "avgReimbursementInput",
  "preventableShareInput",
  "reworkMinutesInput",
  "laborCostInput"
].map((id) => document.getElementById(id));

function riskClass(value) {
  if (value >= 80) return "high";
  if (value >= 65) return "medium";
  return "low";
}

function riskLabel(value) {
  if (value >= 80) return "High";
  if (value >= 65) return "Medium";
  return "Lower";
}

function adjustedStages() {
  const procedure = procedureImpact[procedureSelect.value];
  const payer = payerImpact[payerSelect.value];
  return stages.map((stage) => {
    let adjusted = stage.risk;
    if (["Preauthorization", "Charge Capture", "Coding and Medical Record Review"].includes(stage.label)) {
      adjusted *= procedure.multiplier;
    }
    if (["Scheduling and Financial Clearance", "Preauthorization", "Payer Adjudication and Remittance"].includes(stage.label)) {
      adjusted *= payer.multiplier;
    }
    return { ...stage, adjustedRisk: Math.min(100, Math.round(adjusted)) };
  });
}

function renderTimeline() {
  const perspective = perspectiveSelect.value;
  const data = adjustedStages();
  stageCount.textContent = `${data.length} stages`;
  timeline.innerHTML = data.map((stage, index) => `
    <div class="stage">
      <span class="stage-number">${index + 1}</span>
      <div>
        <h3>${stage.label}</h3>
        <p>${stage[perspective]}</p>
      </div>
      <span class="risk-tag ${riskClass(stage.adjustedRisk)}">${riskLabel(stage.adjustedRisk)}</span>
    </div>
  `).join("");
}

function renderScenario() {
  const selected = scenarioText[perspectiveSelect.value];
  const procedure = procedureImpact[procedureSelect.value];
  const payer = payerImpact[payerSelect.value];

  scenarioTitle.textContent = selected.title;
  scenarioBody.innerHTML = [
    ...selected.cards,
    ["Procedure Lens", procedure.note],
    ["Payer Lens", payer.note]
  ].map(([heading, body]) => `
    <div class="scenario-card">
      <strong>${heading}</strong>
      <p>${body}</p>
    </div>
  `).join("");
}

function drawChart() {
  const data = adjustedStages();
  const rect = canvas.getBoundingClientRect();
  const scale = window.devicePixelRatio || 1;
  canvas.width = Math.floor(rect.width * scale);
  canvas.height = Math.floor(rect.height * scale);
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  const width = rect.width;
  const height = rect.height;
  const padding = { top: 20, right: 16, bottom: 74, left: 42 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;
  const barGap = 8;
  const barW = Math.max(12, (chartW - barGap * (data.length - 1)) / data.length);

  ctx.clearRect(0, 0, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  ctx.strokeStyle = "#d9e1e8";
  ctx.lineWidth = 1;
  ctx.font = "12px Arial";
  ctx.fillStyle = "#5b6673";
  [0, 25, 50, 75, 100].forEach((tick) => {
    const y = padding.top + chartH - (tick / 100) * chartH;
    ctx.beginPath();
    ctx.moveTo(padding.left, y);
    ctx.lineTo(width - padding.right, y);
    ctx.stroke();
    ctx.fillText(`${tick}`, 8, y + 4);
  });

  data.forEach((stage, index) => {
    const x = padding.left + index * (barW + barGap);
    const barH = (stage.adjustedRisk / 100) * chartH;
    const y = padding.top + chartH - barH;
    const color = riskClass(stage.adjustedRisk) === "high" ? "#c85643" : riskClass(stage.adjustedRisk) === "medium" ? "#b7791f" : "#4f7f45";

    ctx.fillStyle = color;
    ctx.fillRect(x, y, barW, barH);
    ctx.fillStyle = "#17212b";
    ctx.font = "700 12px Arial";
    ctx.textAlign = "center";
    ctx.fillText(stage.adjustedRisk, x + barW / 2, y - 6);

    ctx.save();
    ctx.translate(x + barW / 2, height - 12);
    ctx.rotate(-Math.PI / 4);
    ctx.fillStyle = "#5b6673";
    ctx.font = "11px Arial";
    ctx.textAlign = "right";
    ctx.fillText(stage.label.split(" ")[0], 0, 0);
    ctx.restore();
  });

  riskLegend.innerHTML = `
    <span><i style="background:#c85643"></i>High risk: authorization, charge capture, or coding failure can delay or reduce reimbursement.</span>
    <span><i style="background:#b7791f"></i>Medium risk: data errors can create denials, rework, or patient confusion.</span>
    <span><i style="background:#4f7f45"></i>Lower risk: still important for final account resolution.</span>
  `;
}

function renderProgramStrategy() {
  const selected = programStrategy[programSelect.value];
  const scoreLabels = ["Volume / Access Pressure", "Revenue Integrity Risk", "Strategic Planning Priority"];

  programSignal.textContent = selected.label;
  programImpact.innerHTML = `
    <div class="impact-card">
      <span>Reimbursement Method</span>
      <p>${selected.reimbursement}</p>
    </div>
    <div class="impact-card">
      <span>Financial Performance</span>
      <p>${selected.financial}</p>
    </div>
    <div class="impact-card">
      <span>Strategic Planning Response</span>
      <p>${selected.strategy}</p>
    </div>
    <div class="impact-card sourcing-callout">
      <span>Jared's HSHS / Sourcing Connection</span>
      <p>${selected.sourcing}</p>
    </div>
  `;

  strategyScorecard.innerHTML = selected.score.map((value, index) => `
    <div class="score-row">
      <div>
        <strong>${scoreLabels[index]}</strong>
        <span>${value}/100</span>
      </div>
      <div class="score-track" aria-label="${scoreLabels[index]} score ${value} out of 100">
        <i style="width:${value}%"></i>
      </div>
    </div>
  `).join("");
}

function renderStaffingStrategy() {
  const selected = staffingStrategy[staffingSelect.value];
  const scoreLabels = ["Denial Exposure", "Cash Delay Pressure", "Strategic Sourcing Leverage"];

  staffingSignal.textContent = selected.label;
  staffingImpact.innerHTML = `
    <div class="impact-card">
      <span>Competency Needed</span>
      <p>${selected.competency}</p>
    </div>
    <div class="impact-card">
      <span>Possible Lapse</span>
      <p>${selected.lapse}</p>
    </div>
    <div class="impact-card">
      <span>Prevention Process</span>
      <p>${selected.prevention}</p>
    </div>
    <div class="impact-card sourcing-callout">
      <span>HSHS Strategic Sourcing Connection</span>
      <p>${selected.sourcing}</p>
    </div>
  `;

  staffingScorecard.innerHTML = selected.score.map((value, index) => `
    <div class="score-row">
      <div>
        <strong>${scoreLabels[index]}</strong>
        <span>${value}/100</span>
      </div>
      <div class="score-track" aria-label="${scoreLabels[index]} score ${value} out of 100">
        <i style="width:${value}%"></i>
      </div>
    </div>
  `).join("");
}

function formatCurrency(value) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(value);
}

function formatNumber(value) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function getNumberInput(id, fallback) {
  const input = document.getElementById(id);
  const value = Number(input?.value);
  return Number.isFinite(value) ? value : fallback;
}

function renderExplorerBridge() {
  explorerMetricCards.innerHTML = explorerBridgeMetrics.map((metric) => `
    <div class="bridge-metric">
      <strong>${metric.value}</strong>
      <span>${metric.label}</span>
      <p>${metric.note}</p>
    </div>
  `).join("");

  explorerBridgeRowsEl.innerHTML = explorerBridgeRows.map((row) => `
    <div class="bridge-row">
      <strong>${row.label}</strong>
      <p>${row.data}</p>
      <small>${row.paperUse}</small>
    </div>
  `).join("");
}

function renderSimulator() {
  const claimVolume = getNumberInput("claimVolumeInput", 10000);
  const denialRate = getNumberInput("denialRateInput", 12) / 100;
  const avgReimbursement = getNumberInput("avgReimbursementInput", 750);
  const preventableShare = getNumberInput("preventableShareInput", 35) / 100;
  const reworkMinutes = getNumberInput("reworkMinutesInput", 25);
  const laborCost = getNumberInput("laborCostInput", 35);

  const deniedClaims = claimVolume * denialRate;
  const delayedRevenue = deniedClaims * avgReimbursement;
  const preventableClaims = deniedClaims * preventableShare;
  const preventableDelayedRevenue = preventableClaims * avgReimbursement;
  const reworkHours = deniedClaims * reworkMinutes / 60;
  const reworkCost = reworkHours * laborCost;

  simulatorOutput.innerHTML = `
    <div class="sim-result primary">
      <span>Estimated Denied Claims</span>
      <strong>${formatNumber(deniedClaims)}</strong>
    </div>
    <div class="sim-result">
      <span>Delayed Revenue</span>
      <strong>${formatCurrency(delayedRevenue)}</strong>
    </div>
    <div class="sim-result">
      <span>Potentially Preventable Delay</span>
      <strong>${formatCurrency(preventableDelayedRevenue)}</strong>
    </div>
    <div class="sim-result">
      <span>Staff Rework</span>
      <strong>${formatNumber(reworkHours)} hrs / ${formatCurrency(reworkCost)}</strong>
    </div>
  `;
}

function renderAll() {
  renderTimeline();
  renderScenario();
  renderProgramStrategy();
  renderStaffingStrategy();
  renderExplorerBridge();
  renderSimulator();
  drawChart();
}

[perspectiveSelect, procedureSelect, payerSelect, programSelect, staffingSelect].forEach((control) => {
  control.addEventListener("change", renderAll);
});

simulatorInputs.forEach((input) => {
  input.addEventListener("input", renderSimulator);
});

window.addEventListener("resize", drawChart);
renderAll();
