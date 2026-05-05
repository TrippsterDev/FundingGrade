// ============================================
// FUNDING GRADE — Scoring Logic & Form Handler
// ============================================

let currentStep = 1;
const totalSteps = 9;
const totalAdvSteps = 7;
let currentMode = 'simple';
let currentAdvStep = 1;

// ============================================
// UTILITY — Format currency with commas
// ============================================

function formatCurrency(val) {
  if (!val && val !== 0) return '$0';
  return '$' + Math.round(val).toLocaleString('en-US');
}

// ============================================
// MODE TOGGLE
// ============================================

function setMode(mode) {
  currentMode = mode;
  document.getElementById('simpleBtn').classList.toggle('active', mode === 'simple');
  document.getElementById('advancedBtn').classList.toggle('active', mode === 'advanced');

  const loanForm  = document.getElementById('loanForm');
  const advForm   = document.getElementById('advForm');
  const loading   = document.getElementById('loadingState');
  const results   = document.getElementById('resultsState');
  const progWrap  = document.getElementById('progressBar').parentElement;
  const progLabel = document.getElementById('progressLabel');

  loading.style.display   = 'none';
  results.style.display   = 'none';
  progWrap.style.display  = 'block';
  progLabel.style.display = 'block';

  if (mode === 'simple') {
    loanForm.style.display = 'block';
    advForm.style.display  = 'none';
    updateProgress(currentStep);
  } else {
    loanForm.style.display = 'none';
    advForm.style.display  = 'block';
    updateAdvProgress(currentAdvStep);
  }
}

// ============================================
// SIMPLE MODE — NAVIGATION
// ============================================

function nextStep(step) {
  const stepEl   = document.querySelector(`[data-step="${step}"]`);
  const selected = stepEl.querySelector('input[type="radio"]:checked');
  if (!selected) { shakeStep(stepEl); return; }
  currentStep = step + 1;
  showStep(step, currentStep);
  updateProgress(currentStep);
}

function prevStep(step) {
  currentStep = step - 1;
  showStep(step, currentStep);
  updateProgress(currentStep);
}

function showStep(from, to) {
  document.querySelector(`[data-step="${from}"]`).classList.remove('active');
  const next = document.querySelector(`[data-step="${to}"]`);
  if (next) next.classList.add('active');
}

function updateProgress(step) {
  const pct = (step / totalSteps) * 100;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = `Step ${step} of ${totalSteps}`;
}

// ============================================
// ADVANCED MODE — NAVIGATION
// ============================================

function nextAdvStep(step) {
  const stepEl = document.querySelector(`[data-adv-step="${step}"]`);

  if (step === 1) {
    const ebitda    = parseFloat(document.getElementById('adv_ebitda').value)    || 0;
    const netIncome = parseFloat(document.getElementById('adv_netIncome').value) || 0;
    if (ebitda === 0 && netIncome === 0) { shakeStep(stepEl); return; }
  } else if (step === 2) {
    const rev = parseFloat(document.getElementById('adv_monthlyRevenue').value);
    if (!rev || rev <= 0) { shakeStep(stepEl); return; }
  } else {
    const selected = stepEl.querySelector('input[type="radio"]:checked');
    if (!selected) { shakeStep(stepEl); return; }
  }

  currentAdvStep = step + 1;
  showAdvStep(step, currentAdvStep);
  updateAdvProgress(currentAdvStep);
}

function prevAdvStep(step) {
  currentAdvStep = step - 1;
  showAdvStep(step, currentAdvStep);
  updateAdvProgress(currentAdvStep);
}

function showAdvStep(from, to) {
  document.querySelector(`[data-adv-step="${from}"]`).classList.remove('active');
  const next = document.querySelector(`[data-adv-step="${to}"]`);
  if (next) next.classList.add('active');
}

function updateAdvProgress(step) {
  const pct = (step / totalAdvSteps) * 100;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = `Step ${step} of ${totalAdvSteps}`;
}

// ============================================
// SHARED UTILITY
// ============================================

function shakeStep(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.35s ease';
  setTimeout(() => el.style.animation = '', 400);
}

const shakeStyle = document.createElement('style');
shakeStyle.textContent = `
  @keyframes shake {
    0%,100%{transform:translateX(0)}
    20%{transform:translateX(-6px)}
    40%{transform:translateX(6px)}
    60%{transform:translateX(-4px)}
    80%{transform:translateX(4px)}
  }
`;
document.head.appendChild(shakeStyle);

// ============================================
// LOAN PURPOSE MAP
// ============================================

const loanPurposeMap = {
  'working_capital': {
    label: 'Working Capital',
    sba: 'SBA 7(a) — ideal for working capital needs up to $5M with flexible terms.'
  },
  'equipment': {
    label: 'Equipment Purchase',
    sba: 'SBA 7(a) or SBA 504 — equipment financing up to $5.5M with long repayment terms.'
  },
  'real_estate': {
    label: 'Real Estate',
    sba: 'SBA 504 — best fit for owner-occupied commercial real estate up to $5.5M at fixed rates.'
  },
  'expansion': {
    label: 'Business Expansion or Purchase',
    sba: 'SBA 7(a) — covers acquisitions, expansions, and business purchases up to $5M.'
  },
  'refinance': {
    label: 'Refinance Existing Debt',
    sba: 'SBA 7(a) — can refinance eligible existing business debt. Note: MCA debt is no longer eligible for SBA refinancing as of 2025.'
  }
};

// ============================================
// ANSWER LABEL MAP (for recap display)
// ============================================

const answerLabels = {
  // Revenue (simple)
  'under50k': 'Under $50K revenue', '50k_150k': '$50K–$150K revenue',
  '150k_500k': '$150K–$500K revenue', '500k_1m': '$500K–$1M revenue', 'over1m': 'Over $1M revenue',
  // Time in business
  'under6mo': 'Under 6 months', '6mo_12mo': '6–12 months',
  '1yr_2yr': '1–2 years', '2yr_5yr': '2–5 years', 'over5yr': '5+ years',
  // Time in business (advanced)
  'under12mo': 'Under 12 months', '5yr_10yr': '5–10 years', 'over10yr': '10+ years',
  // Credit score
  'under580': 'Credit <580', '581_630': 'Credit 581–630', '631_680': 'Credit 631–680',
  '681_720': 'Credit 681–720', '721_780': 'Credit 721–780', '780plus': 'Credit 780+',
  // Existing debt
  'none': 'No existing debt', 'under25k': 'Debt <$25K',
  '25k_100k': 'Debt $25K–$100K', '100k_500k': 'Debt $100K–$500K', 'over500k': 'Debt >$500K',
  // Industry
  'professional': 'Professional Services', 'healthcare': 'Healthcare',
  'construction': 'Construction', 'retail': 'Retail', 'restaurant': 'Restaurant',
  'ecommerce': 'E-Commerce', 'manufacturing': 'Manufacturing',
  'realestate': 'Real Estate', 'transportation': 'Transportation & Logistics', 'other': 'Other',
  // Bank balance
  'under5k': '<$5K avg balance', '5k_15k': '$5K–$15K avg balance',
  '15k_50k': '$15K–$50K avg balance', '50k_150k': '$50K–$150K avg balance', 'over150k': '>$150K avg balance',
  // Tax liens
  'no': 'No liens', 'yes': 'Has liens',
  // Loan amount (simple)
  'under50k_loan': 'Loan <$50K', '50k_250k': 'Loan $50K–$250K',
  '250k_500k': 'Loan $250K–$500K', '500k_1m_loan': 'Loan $500K–$1M', 'over1m_loan': 'Loan >$1M',
  // Loan purpose
  'working_capital': 'Working Capital', 'equipment': 'Equipment',
  'real_estate': 'Real Estate', 'expansion': 'Expansion / Acquisition', 'refinance': 'Refinance'
};

// ============================================
// SIMPLE MODE — SCORING ENGINE
// ============================================

function calculateScore(data) {
  let score = 0;
  const factors = [];

  // 1. Time in Business (0-20 pts)
  const timeMap = {
    'under6mo': { pts: 0,  label: 'Under 6 months in business is a major barrier — most lenders require at least 1 year.' },
    '6mo_12mo': { pts: 6,  label: '6–12 months in business is below most lender minimums — consider alternative lenders.' },
    '1yr_2yr':  { pts: 14, label: '1–2 years in business meets basic requirements for most lenders.' },
    '2yr_5yr':  { pts: 18, label: '2–5 years in business is strong — you qualify for most conventional products.' },
    'over5yr':  { pts: 20, label: '5+ years in business is excellent — lenders view this very favorably.' }
  };
  const time = timeMap[data.timeInBusiness];
  score += time.pts;
  factors.push({ label: 'Time in Business', pts: time.pts, max: 20, note: time.label });

  // 2. Annual Revenue (0-20 pts)
  const revMap = {
    'under50k':  { pts: 4,  label: 'Under $50K annual revenue limits your options significantly — most lenders want $100K+.' },
    '50k_150k':  { pts: 10, label: '$50K–$150K revenue opens the door to alternative and online lenders.' },
    '150k_500k': { pts: 15, label: '$150K–$500K revenue qualifies you for a wide range of business loan products.' },
    '500k_1m':   { pts: 18, label: '$500K–$1M revenue is strong — you qualify for SBA and bank term loans.' },
    'over1m':    { pts: 20, label: 'Over $1M revenue puts you in the best borrower tier for nearly all products.' }
  };
  const rev = revMap[data.revenue];
  score += rev.pts;
  factors.push({ label: 'Annual Revenue', pts: rev.pts, max: 20, note: rev.label });

  // 3. Credit Score (0-25 pts) — updated buckets
  const creditMap = {
    'under580': { pts: 0,  label: 'Below 580 is subprime — most conventional lenders will decline. Focus on rebuilding credit first.' },
    '581_630':  { pts: 6,  label: '581–630 is below average — limited to alternative lenders at higher rates.' },
    '631_680':  { pts: 13, label: '631–680 qualifies for some business loans but expect higher interest rates.' },
    '681_720':  { pts: 18, label: '681–720 is fair — qualifies for most business loan products at reasonable rates.' },
    '721_780':  { pts: 22, label: '721–780 is strong — competitive rates from most lenders.' },
    '780plus':  { pts: 25, label: '780+ is excellent — lenders will compete for your business.' }
  };
  const credit = creditMap[data.creditScore];
  score += credit.pts;
  factors.push({ label: 'Personal Credit Score', pts: credit.pts, max: 25, note: credit.label });

  // 4. Existing Debt (0-15 pts)
  const debtMap = {
    'none':      { pts: 15, label: 'No existing debt is ideal — lenders see clean capacity to repay.' },
    'under25k':  { pts: 12, label: 'Under $25K existing debt is manageable for most lenders.' },
    '25k_100k':  { pts: 8,  label: '$25K–$100K existing debt will be factored into your DSCR — manageable with strong revenue.' },
    '100k_500k': { pts: 4,  label: '$100K–$500K existing debt is significant — lenders will scrutinize your cash flow carefully.' },
    'over500k':  { pts: 0,  label: 'Over $500K existing debt is a major concern — new lenders may view your profile as over-leveraged.' }
  };
  const debt = debtMap[data.existingDebt];
  score += debt.pts;
  factors.push({ label: 'Existing Debt Load', pts: debt.pts, max: 15, note: debt.label });

  // 5. Industry (0-8 pts) — added Transportation
  const industryMap = {
    'professional':   { pts: 8, label: 'Professional services is low-risk — favorable industry classification.' },
    'healthcare':     { pts: 8, label: 'Healthcare is a preferred industry for most commercial lenders.' },
    'manufacturing':  { pts: 7, label: 'Manufacturing is viewed favorably due to tangible assets.' },
    'realestate':     { pts: 7, label: 'Real estate businesses have good access to capital, especially asset-backed products.' },
    'transportation': { pts: 7, label: 'Transportation & Logistics is considered stable — strong asset base for collateral.' },
    'construction':   { pts: 6, label: 'Construction is moderate risk — cyclical revenue patterns require strong bank history.' },
    'ecommerce':      { pts: 6, label: 'E-commerce is accepted by most lenders but expect scrutiny on revenue consistency.' },
    'other':          { pts: 5, label: 'Your industry will be evaluated case-by-case — have a clear business description ready.' },
    'retail':         { pts: 5, label: 'Retail is moderate-to-high risk — lenders want to see strong margins.' },
    'restaurant':     { pts: 3, label: 'Restaurants are flagged as high-risk by most conventional lenders.' }
  };
  const ind = industryMap[data.industry];
  score += ind.pts;
  factors.push({ label: 'Industry Classification', pts: ind.pts, max: 8, note: ind.label });

  // 6. Bank Balance (0-7 pts)
  const balanceMap = {
    'under5k':  { pts: 0, label: 'Under $5K average balance suggests tight cash flow — lenders may see this as a repayment risk.' },
    '5k_15k':   { pts: 3, label: '$5K–$15K average balance is modest — workable for smaller loan amounts.' },
    '15k_50k':  { pts: 5, label: '$15K–$50K average balance is solid — shows healthy operating cash flow.' },
    '50k_150k': { pts: 6, label: '$50K–$150K average balance is strong — lenders will be comfortable with your liquidity.' },
    'over150k': { pts: 7, label: 'Over $150K average balance is excellent — demonstrates strong financial management.' }
  };
  const bal = balanceMap[data.bankBalance];
  score += bal.pts;
  factors.push({ label: 'Average Bank Balance', pts: bal.pts, max: 7, note: bal.label });

  // 7. Tax Liens (0-3 pts)
  if (data.taxLiens === 'no') {
    score += 3;
    factors.push({ label: 'Tax Liens / Judgments', pts: 3, max: 3, note: 'No liens or judgments — clean public record is exactly what lenders want to see.' });
  } else {
    factors.push({ label: 'Tax Liens / Judgments', pts: 0, max: 3, note: 'Outstanding tax liens or judgments are serious — most conventional lenders will require these to be resolved.' });
  }

  // 8. Loan Amount (0-2 pts) — updated buckets
  const loanMap = {
    'under50k':  { pts: 2, label: 'Loan amount is modest — very achievable for most qualified borrowers.' },
    '50k_250k':  { pts: 2, label: 'Loan amount is reasonable — aligns well with standard business financing.' },
    '250k_500k': { pts: 1, label: 'Substantial request — lenders will confirm revenue and cash flow support repayment.' },
    '500k_1m':   { pts: 1, label: 'Large loan — strong revenue, credit, and documentation required.' },
    'over1m':    { pts: 0, label: 'Over $1M requires exceptional documentation, strong collateral, and a very clean profile.' }
  };
  const loan = loanMap[data.loanAmount];
  score += loan.pts;
  factors.push({ label: 'Loan Amount vs. Profile', pts: loan.pts, max: 2, note: loan.label });

  // 9. Loan Purpose — informational, no score points
  const purpose = loanPurposeMap[data.loanPurpose];
  if (purpose) {
    factors.push({ label: 'Loan Purpose', pts: null, max: null, note: `${purpose.label} — ${purpose.sba}` });
  }

  return { score, factors };
}

// ============================================
// ADVANCED MODE — DSCR ENGINE
// ============================================

function calculateDSCR(ebitda, netIncomeYTD, monthlyDebt) {
  let annualIncome;
  if (ebitda > 0) {
    annualIncome = ebitda;
  } else {
    const monthsElapsed = new Date().getMonth() + 1;
    annualIncome = (netIncomeYTD / monthsElapsed) * 12;
  }
  const annualDebtService = monthlyDebt * 12;
  if (annualDebtService === 0) return null;
  return annualIncome / annualDebtService;
}

function getDSCRDisplay(dscr) {
  if (dscr === null) return { ratio: 'N/A', cssClass: 'dscr--none', meaning: 'No existing debt obligations detected. DSCR is not applicable — lenders will focus on revenue strength and cash flow.', activeBand: -1 };
  if (dscr >= 1.5)  return { ratio: dscr.toFixed(2) + 'x', cssClass: 'dscr--strong',   meaning: `Strong. For every $1.00 of annual debt service, you generate $${dscr.toFixed(2)} in income. Most lenders require a minimum of 1.25x.`, activeBand: 3 };
  if (dscr >= 1.25) return { ratio: dscr.toFixed(2) + 'x', cssClass: 'dscr--good',     meaning: `Good. You meet most lender DSCR minimums with an adequate buffer. A 1.25x ratio is the conventional floor for most bank and SBA products.`, activeBand: 2 };
  if (dscr >= 1.0)  return { ratio: dscr.toFixed(2) + 'x', cssClass: 'dscr--tight',    meaning: `Tight. Your income covers debt payments, but barely. Most conventional lenders will hesitate — strong compensating factors will be required.`, activeBand: 1 };
  return                   { ratio: dscr.toFixed(2) + 'x', cssClass: 'dscr--negative', meaning: `Negative. Your current income does not cover existing debt obligations. Securing new financing will be very difficult without first reducing debt load.`, activeBand: 0 };
}

// ============================================
// ADVANCED MODE — SCORING ENGINE (0-100)
// ============================================

function calculateAdvancedScore(data, dscr) {
  let score = 0;
  const factors = [];

  // 1. DSCR (0-40 pts)
  let dscrPts, dscrNote;
  if (dscr === null)    { dscrPts = 20; dscrNote = 'No existing debt — DSCR not applicable. Lenders will evaluate revenue and cash flow directly.'; }
  else if (dscr >= 1.5) { dscrPts = 40; dscrNote = `DSCR of ${dscr.toFixed(2)}x is excellent — you generate ${formatCurrency(dscr)} for every $1.00 of debt obligation.`; }
  else if (dscr >= 1.25){ dscrPts = 32; dscrNote = `DSCR of ${dscr.toFixed(2)}x meets most lender minimums with adequate buffer.`; }
  else if (dscr >= 1.15){ dscrPts = 22; dscrNote = `DSCR of ${dscr.toFixed(2)}x is below preferred levels. Some lenders will accept with strong compensating factors.`; }
  else if (dscr >= 1.0) { dscrPts = 12; dscrNote = `DSCR of ${dscr.toFixed(2)}x is tight — income barely covers debt service.`; }
  else                  { dscrPts = 0;  dscrNote = `DSCR of ${dscr.toFixed(2)}x is negative — income does not cover existing debt payments.`; }
  score += dscrPts;
  factors.push({ label: 'Debt Service Coverage Ratio (DSCR)', pts: dscrPts, max: 40, note: dscrNote });

  // 2. Monthly Revenue (0-20 pts)
  const monthlyRev = parseFloat(data.monthlyRevenue) || 0;
  let revPts, revNote;
  if      (monthlyRev >= 83333) { revPts = 20; revNote = 'Revenue over $1M annually — top borrower tier for nearly all products.'; }
  else if (monthlyRev >= 41667) { revPts = 17; revNote = '$500K–$1M annual revenue qualifies for SBA and bank term loans.'; }
  else if (monthlyRev >= 20833) { revPts = 13; revNote = '$250K–$500K annual revenue qualifies for a wide range of products.'; }
  else if (monthlyRev >= 8333)  { revPts = 9;  revNote = '$100K–$250K annual revenue opens the door to alternative lenders.'; }
  else                           { revPts = 4;  revNote = 'Under $100K annual revenue limits options significantly.'; }
  score += revPts;
  factors.push({ label: 'Monthly Revenue', pts: revPts, max: 20, note: revNote });

  // 3. Time in Business (0-15 pts) — updated buckets
  const timeMap = {
    'under12mo': { pts: 3,  label: 'Under 12 months is a barrier — most lenders require at least 1 year.' },
    '1yr_2yr':   { pts: 7,  label: '1–2 years meets basic requirements for most lenders.' },
    '2yr_5yr':   { pts: 11, label: '2–5 years is strong — qualifies for most conventional products.' },
    '5yr_10yr':  { pts: 13, label: '5–10 years is very strong — lenders view this favorably.' },
    'over10yr':  { pts: 15, label: '10+ years is excellent — demonstrates exceptional business durability.' }
  };
  const time = timeMap[data.timeInBusiness];
  score += time.pts;
  factors.push({ label: 'Time in Business', pts: time.pts, max: 15, note: time.label });

  // 4. Industry (0-10 pts) — added Transportation
  const industryMap = {
    'professional':   { pts: 10, label: 'Professional services is low-risk — highly favorable classification.' },
    'healthcare':     { pts: 10, label: 'Healthcare is a preferred industry for most commercial lenders.' },
    'manufacturing':  { pts: 9,  label: 'Manufacturing viewed favorably due to tangible assets.' },
    'realestate':     { pts: 9,  label: 'Real estate has strong access to asset-backed capital products.' },
    'transportation': { pts: 8,  label: 'Transportation & Logistics is stable with a strong collateral base.' },
    'construction':   { pts: 7,  label: 'Construction is moderate risk — cyclical revenue requires strong bank history.' },
    'ecommerce':      { pts: 7,  label: 'E-commerce accepted but scrutinized for revenue consistency.' },
    'other':          { pts: 6,  label: 'Industry evaluated case-by-case — have a clear business description ready.' },
    'retail':         { pts: 5,  label: 'Retail is moderate-to-high risk — lenders want to see strong margins.' },
    'restaurant':     { pts: 3,  label: 'Restaurants are high-risk — expect limited options and higher rates.' }
  };
  const ind = industryMap[data.industry];
  score += ind.pts;
  factors.push({ label: 'Industry Classification', pts: ind.pts, max: 10, note: ind.label });

  // 5. Credit Score (0-12 pts) — updated buckets
  const creditMap = {
    'under580': { pts: 0,  label: 'Below 580 is subprime — most conventional lenders will decline.' },
    '581_630':  { pts: 3,  label: '581–630 limits you to alternative lenders at higher rates.' },
    '631_680':  { pts: 6,  label: '631–680 qualifies for some loans but expect higher rates.' },
    '681_720':  { pts: 9,  label: '681–720 qualifies for most products at reasonable rates.' },
    '721_780':  { pts: 11, label: '721–780 is strong — competitive rates from most lenders.' },
    '780plus':  { pts: 12, label: '780+ is excellent — lenders will compete for your business.' }
  };
  const credit = creditMap[data.creditScore];
  score += credit.pts;
  factors.push({ label: 'Personal Credit Score', pts: credit.pts, max: 12, note: credit.label });

  // 6. Loan Amount (0-3 pts) — updated buckets
  const loanMap = {
    'under50k':  { pts: 3, label: 'Loan amount is modest — very achievable for most qualified borrowers.' },
    '50k_250k':  { pts: 3, label: 'Loan amount is reasonable — aligns well with standard business financing.' },
    '250k_500k': { pts: 2, label: 'Substantial request — lenders will confirm DSCR supports repayment.' },
    '500k_1m':   { pts: 1, label: 'Large loan — strong revenue, credit, and documentation required.' },
    'over1m':    { pts: 0, label: 'Over $1M requires exceptional documentation and strong collateral.' }
  };
  const loan = loanMap[data.loanAmount];
  score += loan.pts;
  factors.push({ label: 'Loan Amount vs. Profile', pts: loan.pts, max: 3, note: loan.label });

  // 7. Loan Purpose — informational only
  const purpose = loanPurposeMap[data.loanPurpose];
  if (purpose) {
    factors.push({ label: 'Loan Purpose', pts: null, max: null, note: `${purpose.label} — ${purpose.sba}` });
  }

  return { score, factors };
}

// ============================================
// VERDICT
// ============================================

function getVerdict(score) {
  if (score >= 80) return { text: '✦ Strong Candidate',        css: 'verdict--strong' };
  if (score >= 60) return { text: '◈ Promising — Minor Gaps', css: 'verdict--promising' };
  if (score >= 40) return { text: '◇ Needs Work',             css: 'verdict--needs-work' };
  return                  { text: '△ Not Ready Yet',           css: 'verdict--not-ready' };
}

// ============================================
// AFFILIATE LINKS — purpose-aware
// ============================================

function getAffiliateLinks(score, data) {
  const links = [];
  const purpose = data.loanPurpose;

  if (score >= 60) {
    links.push({
      name: 'Lendio',
      desc: purpose === 'real_estate'   ? 'Compare SBA 504 lenders for commercial real estate — one application, 75+ lenders.'
          : purpose === 'equipment'     ? 'Equipment financing up to $5.5M. Compare SBA 7(a) and 504 options in one application.'
          : purpose === 'refinance'     ? 'Refinancing options from 75+ lenders. Compare SBA 7(a) and conventional options.'
          : purpose === 'expansion'     ? 'Business acquisition and expansion financing. Compare 75+ lenders in one application.'
          : 'Compare 75+ lenders with one application. Best for strong profiles.',
      url: 'https://www.lendio.com/?ref=fundingrade',
      cta: 'Check Rates →'
    });
  }

  if (score >= 45) {
    links.push({
      name: 'Bluevine',
      desc: 'Business lines of credit up to $250K. Fast decisions, no prepayment fees.',
      url: 'https://www.bluevine.com/?ref=fundingrade',
      cta: 'See If You Qualify →'
    });
  }

  if (score < 60 || data.creditScore === 'under580' || data.creditScore === '581_630') {
    links.push({
      name: 'Fundbox',
      desc: 'Flexible credit lines for businesses building their credit profile.',
      url: 'https://fundbox.com/?ref=fundingrade',
      cta: 'Explore Options →'
    });
  }

  links.push({
    name: 'Nav',
    desc: 'Free business credit monitoring + matched financing options. A smart first step.',
    url: 'https://www.nav.com/?ref=fundingrade',
    cta: 'Check Free →'
  });

  return links;
}

// ============================================
// BUILD ANSWER RECAP
// ============================================

function buildAnswerRecap(data, mode) {
  const items = [];

  if (mode === 'simple') {
    if (data.revenue)        items.push(answerLabels[data.revenue]        || data.revenue);
    if (data.timeInBusiness) items.push(answerLabels[data.timeInBusiness] || data.timeInBusiness);
    if (data.creditScore)    items.push(answerLabels[data.creditScore]    || data.creditScore);
    if (data.existingDebt)   items.push(answerLabels[data.existingDebt]   || data.existingDebt);
    if (data.industry)       items.push(answerLabels[data.industry]       || data.industry);
    if (data.loanAmount)     items.push(answerLabels[data.loanAmount]     || data.loanAmount);
    if (data.loanPurpose)    items.push(answerLabels[data.loanPurpose]    || data.loanPurpose);
  } else {
    if (data.ebitda > 0)          items.push('EBITDA: ' + formatCurrency(data.ebitda));
    else if (data.netIncome > 0)  items.push('Net Income YTD: ' + formatCurrency(data.netIncome));
    if (data.monthlyRevenue)      items.push('Monthly Rev: ' + formatCurrency(data.monthlyRevenue));
    if (data.monthlyDebt)         items.push('Monthly Debt: ' + formatCurrency(data.monthlyDebt));
    if (data.timeInBusiness)      items.push(answerLabels[data.timeInBusiness] || data.timeInBusiness);
    if (data.industry)            items.push(answerLabels[data.industry]       || data.industry);
    if (data.creditScore)         items.push(answerLabels[data.creditScore]    || data.creditScore);
    if (data.loanAmount)          items.push(answerLabels[data.loanAmount]     || data.loanAmount);
    if (data.loanPurpose)         items.push(answerLabels[data.loanPurpose]    || data.loanPurpose);
  }

  return items;
}

// ============================================
// SIMPLE MODE — SUBMIT
// ============================================

async function submitForm() {
  const stepEl   = document.querySelector(`[data-step="9"]`);
  const selected = stepEl.querySelector('input[type="radio"]:checked');
  if (!selected) { shakeStep(stepEl); return; }

  const form = document.getElementById('loanForm');
  const data = {
    revenue:        form.querySelector('input[name="revenue"]:checked')?.value,
    timeInBusiness: form.querySelector('input[name="timeInBusiness"]:checked')?.value,
    creditScore:    form.querySelector('input[name="creditScore"]:checked')?.value,
    existingDebt:   form.querySelector('input[name="existingDebt"]:checked')?.value,
    industry:       form.querySelector('input[name="industry"]:checked')?.value,
    bankBalance:    form.querySelector('input[name="bankBalance"]:checked')?.value,
    taxLiens:       form.querySelector('input[name="taxLiens"]:checked')?.value,
    loanAmount:     form.querySelector('input[name="loanAmount"]:checked')?.value,
    loanPurpose:    form.querySelector('input[name="loanPurpose"]:checked')?.value,
  };

  showLoadingState('loanForm');

  const { score, factors } = calculateScore(data);
  const verdict    = getVerdict(score);
  const affiliates = getAffiliateLinks(score, data);
  const recap      = buildAnswerRecap(data, 'simple');

  let aiExplanation = '';
  try {
    aiExplanation = await getAIExplanation(data, score, factors, verdict);
  } catch (e) {
    aiExplanation = factors.filter(f => f.pts !== null).map(f => `${f.label}: ${f.note}`).join('\n\n');
  }

  hideLoadingState();
  renderResults(score, verdict, aiExplanation, affiliates, null, recap, data);
}

// ============================================
// ADVANCED MODE — SUBMIT
// ============================================

async function submitAdvForm() {
  const stepEl   = document.querySelector(`[data-adv-step="7"]`);
  const selected = stepEl.querySelector('input[type="radio"]:checked');
  if (!selected) { shakeStep(stepEl); return; }

  const ebitda         = parseFloat(document.getElementById('adv_ebitda').value)         || 0;
  const netIncome      = parseFloat(document.getElementById('adv_netIncome').value)      || 0;
  const monthlyRevenue = parseFloat(document.getElementById('adv_monthlyRevenue').value) || 0;
  const monthlyDebt    = parseFloat(document.getElementById('adv_monthlyDebt').value)    || 0;

  const advForm = document.getElementById('advForm');
  const data = {
    ebitda, netIncome, monthlyRevenue, monthlyDebt,
    timeInBusiness: advForm.querySelector('input[name="adv_timeInBusiness"]:checked')?.value,
    industry:       advForm.querySelector('input[name="adv_industry"]:checked')?.value,
    creditScore:    advForm.querySelector('input[name="adv_creditScore"]:checked')?.value,
    loanAmount:     advForm.querySelector('input[name="adv_loanAmount"]:checked')?.value,
    loanPurpose:    advForm.querySelector('input[name="adv_loanPurpose"]:checked')?.value,
  };

  showLoadingState('advForm');

  const dscr              = calculateDSCR(ebitda, netIncome, monthlyDebt);
  const dscrDisplay       = getDSCRDisplay(dscr);
  const { score, factors} = calculateAdvancedScore(data, dscr);
  const verdict           = getVerdict(score);
  const affiliates        = getAffiliateLinks(score, data);
  const recap             = buildAnswerRecap(data, 'advanced');

  let aiExplanation = '';
  try {
    aiExplanation = await getAdvancedAIExplanation(data, score, factors, verdict, dscr, dscrDisplay);
  } catch (e) {
    aiExplanation = factors.filter(f => f.pts !== null).map(f => `${f.label}: ${f.note}`).join('\n\n');
  }

  hideLoadingState();
  renderResults(score, verdict, aiExplanation, affiliates, dscrDisplay, recap, data);
}

// ============================================
// LOADING STATE HELPERS
// ============================================

function showLoadingState(formId) {
  document.getElementById(formId).style.display = 'none';
  document.getElementById('progressBar').parentElement.style.display = 'none';
  document.getElementById('progressLabel').style.display = 'none';
  document.getElementById('loadingState').style.display = 'block';
}

function hideLoadingState() {
  document.getElementById('loadingState').style.display = 'none';
}

// ============================================
// AI EXPLANATION — SIMPLE MODE
// ============================================

async function getAIExplanation(data, score, factors, verdict) {
  const factorText = factors.filter(f => f.pts !== null).map(f => `- ${f.label}: ${f.pts}/${f.max} pts — ${f.note}`).join('\n');
  const purpose    = loanPurposeMap[data.loanPurpose];

  const prompt = `You are a plain-English commercial lending advisor. A business owner completed a loan readiness assessment.

Score: ${score}/100
Verdict: ${verdict.text}
Loan Purpose: ${purpose ? purpose.label : 'Not specified'}
${purpose ? `SBA Guidance: ${purpose.sba}` : ''}

Factor breakdown:
${factorText}

Write a 3-4 paragraph personal breakdown. Be direct, specific, and honest.

Paragraph 1: Summarize their overall position. Reference their loan purpose.
Paragraph 2: Highlight their strongest factors.
Paragraph 3: Identify the most critical improvement areas with actionable advice.
Paragraph 4 (if score < 70): Give one concrete next step they can take this month.

Do not use bullet points. Warm but professional advisor tone. Address them as "you."`;

  const response = await fetch('/.netlify/functions/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!response.ok) throw new Error('API error');
  const result = await response.json();
  return result.explanation;
}

// ============================================
// AI EXPLANATION — ADVANCED MODE
// ============================================

async function getAdvancedAIExplanation(data, score, factors, verdict, dscr, dscrDisplay) {
  const factorText = factors.filter(f => f.pts !== null).map(f => `- ${f.label}: ${f.pts}/${f.max} pts — ${f.note}`).join('\n');
  const dscrText   = dscr === null ? 'No existing debt (DSCR not applicable)' : `DSCR: ${dscr.toFixed(2)}x — ${dscrDisplay.meaning}`;
  const incomeText = data.ebitda > 0 ? `EBITDA: ${formatCurrency(data.ebitda)}` : `Net Income YTD: ${formatCurrency(data.netIncome)} (annualized)`;
  const purpose    = loanPurposeMap[data.loanPurpose];

  const prompt = `You are a plain-English commercial lending advisor. A business owner completed an advanced loan readiness assessment.

Score: ${score}/100
Verdict: ${verdict.text}
Loan Purpose: ${purpose ? purpose.label : 'Not specified'}
${purpose ? `SBA Guidance: ${purpose.sba}` : ''}
${dscrText}
${incomeText}
Average Monthly Revenue: ${formatCurrency(data.monthlyRevenue)}
Monthly Debt Obligations: ${formatCurrency(data.monthlyDebt)}

Factor breakdown:
${factorText}

Write a 4-paragraph personal breakdown. Be direct, specific, and honest.

Paragraph 1: Summarize their financial position. Reference their DSCR and loan purpose specifically.
Paragraph 2: Highlight their two or three strongest factors.
Paragraph 3: Identify the most critical improvement areas with actionable advice.
Paragraph 4: Give one concrete next step they can take this month.

Do not use bullet points. Warm but professional advisor tone. Address them as "you."`;

  const response = await fetch('/.netlify/functions/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });
  if (!response.ok) throw new Error('API error');
  const result = await response.json();
  return result.explanation;
}

// ============================================
// RENDER RESULTS
// ============================================

function renderResults(score, verdict, explanation, affiliates, dscrDisplay, recap, data) {
  document.getElementById('resultsState').style.display = 'block';

  // DSCR Card
  const dscrCard = document.getElementById('dscrCard');
  if (dscrDisplay) {
    dscrCard.style.display = 'block';
    document.getElementById('dscrRatio').textContent   = dscrDisplay.ratio;
    document.getElementById('dscrRatio').className     = 'dscr-ratio ' + dscrDisplay.cssClass;
    document.getElementById('dscrMeaning').textContent = dscrDisplay.meaning;
    for (let i = 0; i < 4; i++) {
      const band = document.getElementById('dscrBand' + i);
      band.className = 'dscr-band' + (i === dscrDisplay.activeBand ? ' active-band' : '');
    }
  } else {
    dscrCard.style.display = 'none';
  }

  // Answer Recap
  const recapEl = document.getElementById('answerRecap');
  if (recapEl && recap && recap.length) {
    recapEl.style.display = 'block';
    recapEl.innerHTML = '<span class="recap-label">Based on:</span> ' +
      recap.map(r => `<span class="recap-item">${r}</span>`).join('');
  } else if (recapEl) {
    recapEl.style.display = 'none';
  }

  // SBA Guidance block
  const purpose = data && data.loanPurpose ? loanPurposeMap[data.loanPurpose] : null;
  const sbaEl   = document.getElementById('sbaGuidance');
  if (sbaEl && purpose) {
    sbaEl.style.display = 'block';
    sbaEl.innerHTML = `
      <div class="sba-eyebrow">SBA Loan Match — ${purpose.label}</div>
      <div class="sba-text">${purpose.sba}</div>
    `;
  } else if (sbaEl) {
    sbaEl.style.display = 'none';
  }

  // Score ring animation
  const scoreEl       = document.getElementById('scoreNumber');
  const circleEl      = document.getElementById('scoreCircle');
  const circumference = 339.3;
  let current = 0;
  const stepAmt = score / (1200 / 16);

  const counter = setInterval(() => {
    current = Math.min(current + stepAmt, score);
    scoreEl.textContent = Math.round(current);
    circleEl.style.strokeDashoffset = circumference - (current / 100) * circumference;
    if      (current >= 80) circleEl.style.stroke = '#4CAF82';
    else if (current >= 60) circleEl.style.stroke = '#C9A84C';
    else if (current >= 40) circleEl.style.stroke = '#E8A033';
    else                    circleEl.style.stroke = '#E05252';
    if (current >= score) clearInterval(counter);
  }, 16);

  // Verdict
  const verdictEl = document.getElementById('scoreVerdict');
  verdictEl.textContent = verdict.text;
  verdictEl.className   = 'score-verdict ' + verdict.css;

  // AI Breakdown
  document.getElementById('breakdownContent').textContent = explanation;

  // Affiliate Links
  const linksContainer = document.getElementById('affiliateLinks');
  linksContainer.innerHTML = affiliates.map(a => `
    <a href="${a.url}" target="_blank" rel="noopener sponsored" class="affiliate-link">
      <div>
        <div class="affiliate-name">${a.name}</div>
        <div class="affiliate-desc">${a.desc}</div>
      </div>
      <div class="affiliate-cta">${a.cta}</div>
    </a>
  `).join('');
}

// ============================================
// RESTART
// ============================================

function restartForm() {
  document.getElementById('resultsState').style.display = 'none';
  document.getElementById('progressBar').parentElement.style.display = 'block';
  document.getElementById('progressLabel').style.display = 'block';

  document.getElementById('scoreCircle').style.strokeDashoffset = '339.3';
  document.getElementById('scoreNumber').textContent = '--';

  document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);
  ['adv_ebitda','adv_netIncome','adv_monthlyRevenue','adv_monthlyDebt'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });

  if (currentMode === 'simple') {
    currentStep = 1;
    document.getElementById('loanForm').style.display = 'block';
    document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
    document.querySelector('[data-step="1"]').classList.add('active');
    updateProgress(1);
  } else {
    currentAdvStep = 1;
    document.getElementById('advForm').style.display = 'block';
    document.querySelectorAll('.adv-form-step').forEach(s => s.classList.remove('active'));
    document.querySelector('[data-adv-step="1"]').classList.add('active');
    updateAdvProgress(1);
  }
}

// ============================================
// FAQ TOGGLE
// ============================================

function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  btn.classList.toggle('open');
  answer.classList.toggle('open');
}

// ============================================
// OPTION CARD INTERACTION
// ============================================

document.addEventListener('change', (e) => {
  if (e.target.type === 'radio') {
    // CSS handles visual state via :checked selector
  }
});
