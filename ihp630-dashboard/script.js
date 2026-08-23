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

const denialRootCauses = [
  {
    stage: "Front End",
    stageClass: "front",
    cause: "Registration or eligibility error",
    share: 0.18,
    control: "Real-time eligibility, card scan, required-field validation"
  },
  {
    stage: "Front End",
    stageClass: "front",
    cause: "Missing or invalid authorization",
    share: 0.17,
    control: "Financial clearance and payer-specific authorization work queue"
  },
  {
    stage: "Middle",
    stageClass: "middle",
    cause: "Incomplete clinical documentation",
    share: 0.19,
    control: "Clinical documentation improvement and prebill query"
  },
  {
    stage: "Middle",
    stageClass: "middle",
    cause: "Coding, modifier, or charge-capture error",
    share: 0.16,
    control: "Coding edits, charge reconciliation, targeted prebill review"
  },
  {
    stage: "Back End",
    stageClass: "back",
    cause: "Claim submission or timely-filing failure",
    share: 0.12,
    control: "Acknowledgment reconciliation, deadline alerts, work-queue ownership"
  },
  {
    stage: "Cross-Workflow",
    stageClass: "cross",
    cause: "Interface, payer-rule, or vendor workflow issue",
    share: 0.10,
    control: "Interface monitoring, change control, vendor service levels"
  },
  {
    stage: "Back End",
    stageClass: "back",
    cause: "Other payer or follow-up issue",
    share: 0.08,
    control: "Standard denial categories, appeal tracking, payer escalation"
  }
];

const denialInvestments = [
  {
    label: "Registration Accuracy",
    icon: "RA",
    description: "Eligibility, demographic validation, financial clearance, and authorization discipline.",
    addressed: [0, 1],
    reduction: 0.26
  },
  {
    label: "Documentation Improvement",
    icon: "CD",
    description: "Clinical documentation education, concurrent review, and prebill clarification.",
    addressed: [2, 3],
    reduction: 0.30
  },
  {
    label: "Workflow Automation",
    icon: "AU",
    description: "Claim edits, acknowledgments, deadline alerts, and standardized denial routing.",
    addressed: [0, 3, 4, 6],
    reduction: 0.18
  },
  {
    label: "Vendor Management",
    icon: "VM",
    description: "Interface reliability, payer-rule updates, support response, and contract accountability.",
    addressed: [4, 5],
    reduction: 0.22
  }
];

const revenueCycleKpis = [
  {
    id: "preRegistration",
    stage: "Front End",
    stageClass: "front",
    name: "Pre-Registration Rate",
    current: 84,
    target: 90,
    unit: "%",
    direction: "higher",
    definition: "Scheduled encounters completed in registration before the date of service.",
    cashRisk: "Incomplete accounts delay estimates, eligibility work, authorization, and clean claim production.",
    improvement: "Move work earlier, standardize required fields, and monitor exceptions by location and service line.",
    sourcing: "Scheduling and registration platform workflow, identity tools, card capture, and implementation support.",
    question: "Can the vendor show exception queues and completion by site before the patient arrives?"
  },
  {
    id: "authorization",
    stage: "Front End",
    stageClass: "front",
    name: "Outpatient Authorization Rate",
    current: 96,
    target: 95,
    unit: "%",
    direction: "higher",
    definition: "Required outpatient authorizations obtained before claim release.",
    cashRisk: "Missing approval can delay care, create avoidable denials, or leave the organization unable to collect.",
    improvement: "Use payer-specific work queues, escalation dates, and closed-loop status from scheduling to billing.",
    sourcing: "Authorization technology, payer connectivity, outsourced support, and service-level accountability.",
    question: "How quickly are payer-rule changes loaded, tested, and communicated to users?"
  },
  {
    id: "cleanClaim",
    stage: "Middle",
    stageClass: "middle",
    name: "Clean Claim Rate",
    current: 91,
    target: 95,
    unit: "%",
    direction: "higher",
    definition: "Claims passing processing edits without manual intervention.",
    cashRisk: "A lower rate signals rework before submission and a slower path from service to payer acceptance.",
    improvement: "Analyze edit categories, correct upstream data, and measure first-pass performance by payer.",
    sourcing: "Claims scrubber logic, interface quality, coding tools, item data, and vendor rule maintenance.",
    question: "Does the tool expose edit root causes and prove that rule updates reduce manual touches?"
  },
  {
    id: "chargeLag",
    stage: "Middle",
    stageClass: "middle",
    name: "Average Charge Lag",
    current: 2.6,
    target: 3,
    unit: " days",
    direction: "lower",
    definition: "Average elapsed time between the service date and charge posting.",
    cashRisk: "Longer lag increases unbilled revenue and postpones coding, claim creation, and payment.",
    improvement: "Reconcile procedures, supplies, devices, and late-charge exceptions with named department owners.",
    sourcing: "Item-master completeness, device integration, point-of-use capture, and vendor implementation design.",
    question: "Will every purchased item and service map cleanly to documentation and charge capture on day one?"
  },
  {
    id: "denialRate",
    stage: "Back End",
    stageClass: "back",
    name: "Initial Denial Rate",
    current: 8.2,
    target: 6,
    unit: "%",
    direction: "lower",
    definition: "Initial denied claim dollars or claims as a share of adjudicated volume, using one consistent method.",
    cashRisk: "High denials delay cash, increase appeal labor, and can turn recoverable revenue into write-offs.",
    improvement: "Standardize denial categories, identify the originating stage, and return trends to operational owners.",
    sourcing: "Denial platform, electronic attachments, payer workflow, analytics services, and contract escalation support.",
    question: "Can the vendor distinguish preventable denials, overturns, net loss, and source department?"
  },
  {
    id: "arDays",
    stage: "Back End",
    stageClass: "back",
    name: "Net Days in Accounts Receivable",
    current: 39,
    target: 32,
    unit: " days",
    direction: "lower",
    definition: "Net patient receivables divided by average daily net patient service revenue.",
    cashRisk: "Rising A/R days indicate cash is tied up longer and may point to payer, staffing, or follow-up bottlenecks.",
    improvement: "Segment aging by payer and root cause, prioritize high-value accounts, and enforce follow-up ownership.",
    sourcing: "Clearinghouse performance, payment posting, work-queue automation, collection services, and payer interfaces.",
    question: "Which contract service level directly improves payment speed, exception visibility, or staff productivity?"
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
const denialSummary = document.getElementById("denialSummary");
const denialRootCauseRows = document.getElementById("denialRootCauseRows");
const investmentComparison = document.getElementById("investmentComparison");
const denialOpportunitySignal = document.getElementById("denialOpportunitySignal");
const denialPreventionInputs = [
  "dpClaimVolume",
  "dpDenialRate",
  "dpClaimValue",
  "dpRecoveryRate",
  "dpDaysDelayed"
].map((id) => document.getElementById(id));
const kpiStageGroups = document.getElementById("kpiStageGroups");
const kpiMetCount = document.getElementById("kpiMetCount");
const kpiOverallStatus = document.getElementById("kpiOverallStatus");
const kpiRiskSignal = document.getElementById("kpiRiskSignal");
const kpiExecutiveSummary = document.getElementById("kpiExecutiveSummary");
const sourcingPriorityQueue = document.getElementById("sourcingPriorityQueue");

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

function renderDenialPrevention() {
  const claimVolume = Math.max(0, getNumberInput("dpClaimVolume", 10000));
  const denialRate = Math.min(1, Math.max(0, getNumberInput("dpDenialRate", 12) / 100));
  const claimValue = Math.max(0, getNumberInput("dpClaimValue", 750));
  const recoveryRate = Math.min(1, Math.max(0, getNumberInput("dpRecoveryRate", 65) / 100));
  const daysDelayed = Math.max(0, getNumberInput("dpDaysDelayed", 45));

  const deniedClaims = claimVolume * denialRate;
  const delayedRevenue = deniedClaims * claimValue;
  const recoveredRevenue = delayedRevenue * recoveryRate;
  const netLoss = delayedRevenue - recoveredRevenue;
  const cashDaysExposure = delayedRevenue * daysDelayed;

  denialSummary.innerHTML = `
    <div class="denial-summary-card primary">
      <span>Denied Claims / Month</span>
      <strong>${formatNumber(deniedClaims)}</strong>
    </div>
    <div class="denial-summary-card">
      <span>Revenue Delayed</span>
      <strong>${formatCurrency(delayedRevenue)}</strong>
    </div>
    <div class="denial-summary-card">
      <span>Expected Recovery</span>
      <strong>${formatCurrency(recoveredRevenue)}</strong>
    </div>
    <div class="denial-summary-card loss">
      <span>Estimated Net Loss</span>
      <strong>${formatCurrency(netLoss)}</strong>
    </div>
    <div class="denial-summary-card">
      <span>Cash-Days Exposure</span>
      <strong>${formatCurrency(cashDaysExposure)}</strong>
      <small>Delayed dollars multiplied by days outstanding</small>
    </div>
  `;

  denialRootCauseRows.innerHTML = denialRootCauses.map((item) => {
    const causeClaims = deniedClaims * item.share;
    const causeDelayed = causeClaims * claimValue;
    const causeLoss = causeDelayed * (1 - recoveryRate);
    return `
      <tr>
        <td><span class="workflow-badge ${item.stageClass}">${item.stage}</span></td>
        <td><strong>${item.cause}</strong></td>
        <td>${Math.round(item.share * 100)}%</td>
        <td>${formatNumber(causeClaims)}</td>
        <td>${formatCurrency(causeDelayed)}</td>
        <td>${formatCurrency(causeLoss)}</td>
        <td>${item.control}</td>
      </tr>
    `;
  }).join("");

  const investmentResults = denialInvestments.map((investment) => {
    const addressableShare = investment.addressed.reduce(
      (total, index) => total + denialRootCauses[index].share,
      0
    );
    const claimsPrevented = deniedClaims * addressableShare * investment.reduction;
    const monthlyValue = claimsPrevented * claimValue;
    return { ...investment, addressableShare, claimsPrevented, monthlyValue };
  }).sort((a, b) => b.monthlyValue - a.monthlyValue);

  const bestValue = investmentResults[0]?.monthlyValue || 0;
  denialOpportunitySignal.textContent = bestValue > 0
    ? `Top modeled opportunity: ${investmentResults[0].label}`
    : "Enter assumptions to compare";

  investmentComparison.innerHTML = investmentResults.map((investment, index) => `
    <article class="investment-card ${index === 0 ? "recommended" : ""}">
      <div class="investment-card-head">
        <span class="investment-icon">${investment.icon}</span>
        ${index === 0 ? '<span class="rank-pill">Highest modeled value</span>' : `<span class="rank-pill muted">Rank ${index + 1}</span>`}
      </div>
      <h4>${investment.label}</h4>
      <p>${investment.description}</p>
      <dl>
        <div><dt>Addressable denial share</dt><dd>${Math.round(investment.addressableShare * 100)}%</dd></div>
        <div><dt>Illustrative reduction</dt><dd>${Math.round(investment.reduction * 100)}%</dd></div>
        <div><dt>Claims prevented / month</dt><dd>${formatNumber(investment.claimsPrevented)}</dd></div>
        <div><dt>Monthly revenue protected</dt><dd>${formatCurrency(investment.monthlyValue)}</dd></div>
        <div><dt>Annualized value</dt><dd>${formatCurrency(investment.monthlyValue * 12)}</dd></div>
      </dl>
    </article>
  `).join("");
}

function kpiStatus(kpi) {
  const met = kpi.direction === "higher" ? kpi.current >= kpi.target : kpi.current <= kpi.target;
  if (met) return { key: "met", label: "Meeting target", score: 0 };

  const variance = kpi.direction === "higher"
    ? (kpi.target - kpi.current) / Math.max(kpi.target, 0.01)
    : (kpi.current - kpi.target) / Math.max(kpi.target, 0.01);
  return variance <= 0.1
    ? { key: "watch", label: "Near target", score: variance }
    : { key: "missed", label: "Target missed", score: variance };
}

function formatKpiValue(value, unit) {
  const maximumFractionDigits = Number.isInteger(value) ? 0 : 1;
  return `${new Intl.NumberFormat("en-US", { maximumFractionDigits }).format(value)}${unit}`;
}

function renderKpiCommandCenter() {
  const stages = ["Front End", "Middle", "Back End"];
  const results = revenueCycleKpis.map((kpi) => ({ ...kpi, status: kpiStatus(kpi) }));
  const metCount = results.filter((kpi) => kpi.status.key === "met").length;
  const missedCount = results.filter((kpi) => kpi.status.key === "missed").length;

  kpiMetCount.textContent = `${metCount} of ${results.length} KPIs met`;
  kpiOverallStatus.textContent = metCount === results.length
    ? "All targets met"
    : missedCount >= 3 ? "Material improvement needed" : "Focused action needed";
  kpiOverallStatus.className = `status-pill ${metCount === results.length ? "status-met" : missedCount >= 3 ? "status-missed" : "status-watch"}`;
  kpiRiskSignal.textContent = missedCount === 0
    ? "Cash-flow indicators stable"
    : `${missedCount} material cash-flow warning${missedCount === 1 ? "" : "s"}`;
  kpiRiskSignal.className = `status-pill ${missedCount === 0 ? "status-met" : "status-missed"}`;

  kpiStageGroups.innerHTML = stages.map((stage) => {
    const stageKpis = results.filter((kpi) => kpi.stage === stage);
    const stageMisses = stageKpis.filter((kpi) => kpi.status.key !== "met").length;
    return `
      <section class="kpi-stage-group">
        <div class="kpi-stage-heading">
          <div>
            <span class="workflow-badge ${stageKpis[0].stageClass}">${stage}</span>
            <h3>${stage} Performance</h3>
          </div>
          <strong>${stageKpis.length - stageMisses}/${stageKpis.length} met</strong>
        </div>
        <div class="kpi-card-grid">
          ${stageKpis.map((kpi) => `
            <article class="kpi-performance-card ${kpi.status.key}">
              <div class="kpi-card-title">
                <h4>${kpi.name}</h4>
                <span class="kpi-status-chip ${kpi.status.key}">${kpi.status.label}</span>
              </div>
              <div class="kpi-value-grid">
                <label>
                  Current
                  <input data-kpi-id="${kpi.id}" data-kpi-field="current" type="number" min="0" step="0.1" value="${kpi.current}" />
                </label>
                <label>
                  Target
                  <input data-kpi-id="${kpi.id}" data-kpi-field="target" type="number" min="0" step="0.1" value="${kpi.target}" />
                </label>
              </div>
              <div class="kpi-value-line">
                <strong>${formatKpiValue(kpi.current, kpi.unit)}</strong>
                <span>${kpi.direction === "higher" ? "Target at least" : "Target no more than"} ${formatKpiValue(kpi.target, kpi.unit)}</span>
              </div>
              <div class="kpi-progress" aria-label="${kpi.name}: ${kpi.status.label}">
                <i style="width:${Math.min(100, kpi.direction === "higher" ? (kpi.current / Math.max(kpi.target, 0.01)) * 100 : (kpi.target / Math.max(kpi.current, 0.01)) * 100)}%"></i>
              </div>
              <p><strong>Definition:</strong> ${kpi.definition}</p>
              <p><strong>Cash-flow signal:</strong> ${kpi.cashRisk}</p>
              <p><strong>Improvement:</strong> ${kpi.improvement}</p>
            </article>
          `).join("")}
        </div>
      </section>
    `;
  }).join("");

  kpiExecutiveSummary.innerHTML = stages.map((stage) => {
    const stageKpis = results.filter((kpi) => kpi.stage === stage);
    const missed = stageKpis.filter((kpi) => kpi.status.key !== "met");
    const names = stageKpis.map((kpi) => `${kpi.name} (${formatKpiValue(kpi.current, kpi.unit)} vs. ${formatKpiValue(kpi.target, kpi.unit)})`).join(" and ");
    const interpretation = missed.length === 0
      ? "Both indicators meet the selected targets, suggesting this stage is supporting timely cash conversion."
      : `${missed.map((kpi) => kpi.name).join(" and ")} ${missed.length === 1 ? "is" : "are"} below expectation, creating a visible operational and cash-flow improvement opportunity.`;
    return `
      <div class="executive-stage-row">
        <span class="workflow-badge ${stageKpis[0].stageClass}">${stage}</span>
        <p><strong>${names}.</strong> ${interpretation}</p>
      </div>
    `;
  }).join("");

  const priorities = [...results]
    .filter((kpi) => kpi.status.key !== "met")
    .sort((a, b) => (b.status.key === "missed" ? 1 : 0) - (a.status.key === "missed" ? 1 : 0) || b.status.score - a.status.score);

  sourcingPriorityQueue.innerHTML = priorities.length ? priorities.map((kpi, index) => `
    <div class="sourcing-priority-row">
      <span class="priority-rank">${index + 1}</span>
      <div>
        <div class="priority-title-row">
          <strong>${kpi.name}</strong>
          <span class="kpi-status-chip ${kpi.status.key}">${kpi.status.label}</span>
        </div>
        <p><b>Sourcing lever:</b> ${kpi.sourcing}</p>
        <small><b>Ask:</b> ${kpi.question}</small>
      </div>
    </div>
  `).join("") : '<div class="all-met-message"><strong>All selected targets are met.</strong><span>Use vendor governance to sustain performance and verify that gains persist.</span></div>';
}

function renderAll() {
  renderTimeline();
  renderScenario();
  renderProgramStrategy();
  renderStaffingStrategy();
  renderExplorerBridge();
  renderSimulator();
  renderDenialPrevention();
  renderKpiCommandCenter();
  drawChart();
}

[perspectiveSelect, procedureSelect, payerSelect, programSelect, staffingSelect].forEach((control) => {
  control.addEventListener("change", renderAll);
});

simulatorInputs.forEach((input) => {
  input.addEventListener("input", renderSimulator);
});

denialPreventionInputs.forEach((input) => {
  input.addEventListener("input", renderDenialPrevention);
});

let kpiUpdateTimer;
kpiStageGroups.addEventListener("input", (event) => {
  const input = event.target.closest("input[data-kpi-id]");
  if (!input) return;
  clearTimeout(kpiUpdateTimer);
  kpiUpdateTimer = setTimeout(() => {
    const kpi = revenueCycleKpis.find((item) => item.id === input.dataset.kpiId);
    const value = Number(input.value);
    if (!kpi || !Number.isFinite(value)) return;
    kpi[input.dataset.kpiField] = Math.max(0, value);
    renderKpiCommandCenter();
  }, 350);
});

window.addEventListener("resize", drawChart);
renderAll();
