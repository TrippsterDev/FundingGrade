// ============================================
// FUNDING GRADE — Scoring Logic & Form Handler
// ============================================
let currentStep = 1;
const totalSteps = 11;
const totalAdvSteps = 7;
let currentMode = 'simple';
let currentAdvStep = 1;
 
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
 
  // After step 10 (tax returns), check if step 11 (business plan) should be shown
  // Step 11 is conditional — only shown if timeInBusiness = under12mo
  if (step === 10) {
    const form = document.getElementById('loanForm');
    const timeInBusiness = form.querySelector('input[name="timeInBusiness"]:checked')?.value;
    if (timeInBusiness !== 'under12mo') {
      // Skip step 11 entirely — go straight to submit
      showStep(10, 11); // show step 11 briefly so submit triggers correctly
      // Actually: hide step 10, jump to submit
      document.querySelector('[data-step="10"]').classList.remove('active');
      submitForm();
      return;
    }
  }
 
  currentStep = step + 1;
  showStep(step, currentStep);
  updateProgress(currentStep);
}
 
function prevStep(step) {
  // If going back from step 11, check if we should skip it
  // (handles edge case where user somehow reaches 11 and goes back)
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
  // Progress reflects visible steps. Step 11 is conditional so show max 10 in label
  // unless actually on step 11
  const displayTotal = step === 11 ? 11 : 10;
  const pct = (step / totalSteps) * 100;
  document.getElementById('progressBar').style.width = pct + '%';
  document.getElementById('progressLabel').textContent = `Step ${step} of ${displayTotal}`;
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
// SHAKE UTILITY
// ============================================
function shakeStep(el) {
  el.style.animation = 'none';
  el.offsetHeight;
  el.style.animation = 'shake 0.35s ease';
  setTimeout(() => el.style.animation = '', 400);
}
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `@keyframes shake{0%,100%{transform:translateX(0)}20%{transform:translateX(-6px)}40%{transform:translateX(6px)}60%{transform:translateX(-4px)}80%{transform:translateX(4px)}}`;
document.head.appendChild(shakeStyle);
 
// ============================================
// LOAN PURPOSE MAP
// ============================================
const loanPurposeMap = {
  'working_capital': { label: 'Working Capital',                sba: 'SBA 7(a) — ideal for working capital needs up to $5M with flexible terms.' },
  'equipment':       { label: 'Equipment Purchase',             sba: 'SBA 7(a) or SBA 504 — equipment financing up to $5.5M with long repayment terms.' },
  'real_estate':     { label: 'Real Estate',                    sba: 'SBA 504 — best fit for owner-occupied commercial real estate up to $5.5M at fixed rates.' },
  'expansion':       { label: 'Business Expansion or Purchase', sba: 'SBA 7(a) — covers acquisitions, expansions, and business purchases up to $5M.' },
  'refinance':       { label: 'Refinance Existing Debt',        sba: 'SBA 7(a) — can refinance eligible existing business debt. Note: Merchant cash advances and factoring agreements are not eligible for SBA refinancing.' }
};
 
// ============================================
// ANSWER LABEL MAP
// ============================================
const answerLabels = {
  'under50k':'Under $50K rev','50k_150k':'$50K–$150K rev','150k_500k':'$150K–$500K rev','500k_1m':'$500K–$1M rev','over1m':'Over $1M rev',
  'under12mo':'Under 12 months','1yr_2yr':'1–2 years','2yr_5yr':'2–5 years','5yr_10yr':'5–10 years','over10yr':'10+ years',
  'under580':'Credit <580','581_630':'Credit 581–630','631_680':'Credit 631–680','681_720':'Credit 681–720','721_780':'Credit 721–780','780plus':'Credit 780+',
  'none':'No debt','under50k_debt':'Debt <$50K','50k_250k_debt':'Debt $50K–$250K','250k_500k_debt':'Debt $250K–$500K','500k_1m_debt':'Debt $500K–$1M','over1m_debt':'Debt >$1M',
  'under5k':'<$5K balance','5k_25k':'$5K–$25K balance','25k_100k':'$25K–$100K balance','100k_250k':'$100K–$250K balance','250k_500k_bal':'$250K–$500K balance','over500k_bal':'$500K+ balance',
  'professional':'Professional Services','healthcare':'Healthcare','construction':'Construction','retail':'Retail','restaurant':'Restaurant',
  'ecommerce':'E-Commerce','manufacturing':'Manufacturing','realestate':'Real Estate','transportation':'Transportation & Logistics','other':'Other',
  'no':'No liens','yes':'Has liens',
  'under50k':'Loan <$50K','50k_250k':'Loan $50K–$250K','250k_500k':'Loan $250K–$500K','500k_1m':'Loan $500K–$1M','over1m':'Loan >$1M',
  'working_capital':'Working Capital','equipment':'Equipment','real_estate':'Real Estate','expansion':'Expansion / Acquisition','refinance':'Refinance',
  // Tax returns
  'tax_yes':'2 yrs tax returns: Yes','tax_one_year':'1 yr tax return','tax_no':'No tax returns','tax_too_new':'Too new for returns',
  // Business plan (conditional)
  'bp_yes':'Business plan: Yes','bp_in_progress':'Business plan: In progress','bp_no':'No business plan'
};
 
// ============================================
// SIMPLE MODE — SCORING ENGINE
// ============================================
function calculateScore(data) {
  let score = 0;
  const factors = [];
 
  const timeMap = {
    'under12mo': { pts: 0,  label: 'Under 12 months is a major barrier — most lenders require at least 1 year.' },
    '1yr_2yr':   { pts: 12, label: '1–2 years meets basic requirements for most lenders.' },
    '2yr_5yr':   { pts: 16, label: '2–5 years is strong — you qualify for most conventional products.' },
    '5yr_10yr':  { pts: 18, label: '5–10 years is very strong — lenders view this very favorably.' },
    'over10yr':  { pts: 20, label: '10+ years is excellent — demonstrates exceptional business durability.' }
  };
  const time = timeMap[data.timeInBusiness] || { pts: 0, label: 'Time in business not recognized.' };
  score += time.pts;
  factors.push({ label: 'Time in Business', pts: time.pts, max: 20, note: time.label });
 
  const revMap = {
    'under50k':  { pts: 4,  label: 'Under $50K annual revenue limits your options — most lenders want $100K+.' },
    '50k_150k':  { pts: 10, label: '$50K–$150K revenue opens the door to alternative and online lenders.' },
    '150k_500k': { pts: 15, label: '$150K–$500K revenue qualifies you for a wide range of business loan products.' },
    '500k_1m':   { pts: 18, label: '$500K–$1M revenue is strong — you qualify for SBA and bank term loans.' },
    'over1m':    { pts: 20, label: 'Over $1M revenue puts you in the best borrower tier for nearly all products.' }
  };
  const rev = revMap[data.revenue] || { pts: 0, label: 'Revenue not recognized.' };
  score += rev.pts;
  factors.push({ label: 'Annual Revenue', pts: rev.pts, max: 20, note: rev.label });
 
  const creditMap = {
    'under580': { pts: 0,  label: 'Below 580 is subprime — most conventional lenders will decline.' },
    '581_630':  { pts: 6,  label: '581–630 is below average — limited to alternative lenders at higher rates.' },
    '631_680':  { pts: 13, label: '631–680 qualifies for some business loans but expect higher interest rates.' },
    '681_720':  { pts: 18, label: '681–720 is fair — qualifies for most business loan products at reasonable rates.' },
    '721_780':  { pts: 22, label: '721–780 is strong — competitive rates from most lenders.' },
    '780plus':  { pts: 25, label: '780+ is excellent — lenders will compete for your business.' }
  };
  const credit = creditMap[data.creditScore] || { pts: 0, label: 'Credit score not recognized.' };
  score += credit.pts;
  factors.push({ label: 'Personal Credit Score', pts: credit.pts, max: 25, note: credit.label });
 
  const debtMap = {
    'none':           { pts: 15, label: 'No existing debt is ideal — lenders see clean capacity to repay.' },
    'under50k_debt':  { pts: 12, label: 'Under $50K existing debt is manageable for most lenders.' },
    '50k_250k_debt':  { pts: 9,  label: '$50K–$250K existing debt is moderate — manageable with strong revenue.' },
    '250k_500k_debt': { pts: 5,  label: '$250K–$500K existing debt is significant — lenders will scrutinize your cash flow.' },
    '500k_1m_debt':   { pts: 2,  label: '$500K–$1M existing debt is a concern — lenders will want strong DSCR to offset.' },
    'over1m_debt':    { pts: 0,  label: 'Over $1M existing debt is a major concern — new lenders may view your profile as over-leveraged.' }
  };
  const debt = debtMap[data.existingDebt] || { pts: 0, label: 'Debt level not recognized.' };
  score += debt.pts;
  factors.push({ label: 'Existing Debt Load', pts: debt.pts, max: 15, note: debt.label });
 
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
  const ind = industryMap[data.industry] || { pts: 0, label: 'Industry not recognized.' };
  score += ind.pts;
  factors.push({ label: 'Industry Classification', pts: ind.pts, max: 8, note: ind.label });
 
  const balanceMap = {
    'under5k':       { pts: 0, label: 'Under $5K average balance suggests tight cash flow — lenders may see this as a repayment risk.' },
    '5k_25k':        { pts: 2, label: '$5K–$25K average balance is modest — workable for smaller loan amounts.' },
    '25k_100k':      { pts: 4, label: '$25K–$100K average balance is solid — shows healthy operating cash flow.' },
    '100k_250k':     { pts: 6, label: '$100K–$250K average balance is strong — lenders will be comfortable with your liquidity.' },
    '250k_500k_bal': { pts: 7, label: '$250K–$500K average balance is excellent — demonstrates strong financial management.' },
    'over500k_bal':  { pts: 7, label: 'Over $500K average balance is exceptional — top-tier liquidity indicator.' }
  };
  const bal = balanceMap[data.bankBalance] || { pts: 0, label: 'Bank balance not recognized.' };
  score += bal.pts;
  factors.push({ label: 'Average Bank Balance', pts: bal.pts, max: 7, note: bal.label });
 
  if (data.taxLiens === 'no') {
    score += 3;
    factors.push({ label: 'Tax Liens / Judgments', pts: 3, max: 3, note: 'No liens or judgments — clean public record is exactly what lenders want to see.' });
  } else {
    factors.push({ label: 'Tax Liens / Judgments', pts: 0, max: 3, note: 'Outstanding tax liens or judgments are serious — most conventional lenders will require these to be resolved.' });
  }
 
  const loanMap = {
    'under50k':  { pts: 2, label: 'Loan amount is modest — very achievable for most qualified borrowers.' },
    '50k_250k':  { pts: 2, label: 'Loan amount is reasonable — aligns well with standard business financing.' },
    '250k_500k': { pts: 1, label: 'Substantial request — lenders will confirm revenue and cash flow support repayment.' },
    '500k_1m':   { pts: 1, label: 'Large loan — strong revenue, credit, and documentation required.' },
    'over1m':    { pts: 0, label: 'Over $1M requires exceptional documentation, strong collateral, and a very clean profile.' }
  };
  const loan = loanMap[data.loanAmount] || { pts: 0, label: 'Loan amount not recognized.' };
  score += loan.pts;
  factors.push({ label: 'Loan Amount vs. Profile', pts: loan.pts, max: 2, note: loan.label });
 
  // Tax Returns (new — Q10)
  const taxMap = {
    'tax_yes':      { pts: 5, label: '2 years of tax returns available — strong documentation that most SBA and bank lenders require.' },
    'tax_one_year': { pts: 3, label: '1 year of tax returns available — acceptable for some lenders; 2 years preferred for SBA 7(a).' },
    'tax_no':       { pts: 0, label: 'No tax returns available is a significant gap — most lenders require at least 1–2 years of returns.' },
    'tax_too_new':  { pts: 1, label: 'Business is too new for tax returns — lenders will rely more heavily on bank statements and projections.' }
  };
  const tax = taxMap[data.taxReturns] || { pts: 0, label: 'Tax return status not recognized.' };
  score += tax.pts;
  factors.push({ label: 'Tax Returns Available', pts: tax.pts, max: 5, note: tax.label });
 
  // Business Plan (new — Q11, conditional on under12mo)
  if (data.timeInBusiness === 'under12mo' && data.businessPlan) {
    const bpMap = {
      'bp_yes':         { pts: 3, label: 'Having a business plan or financial projections significantly improves your SBA Microloan and startup loan odds.' },
      'bp_in_progress': { pts: 1, label: 'A business plan in progress is a good start — completing it before applying strengthens your case considerably.' },
      'bp_no':          { pts: 0, label: 'No business plan is a notable gap for a startup borrower — most SBA Microloan lenders and CDFIs require one.' }
    };
    const bp = bpMap[data.businessPlan] || { pts: 0, label: 'Business plan status not recognized.' };
    score += bp.pts;
    factors.push({ label: 'Business Plan / Projections', pts: bp.pts, max: 3, note: bp.label });
  }
 
  const purpose = loanPurposeMap[data.loanPurpose];
  if (purpose) factors.push({ label: 'Loan Purpose', pts: null, max: null, note: `${purpose.label} — ${purpose.sba}` });
 
  return { score, factors };
}
 
// ============================================
// ADVANCED MODE — DSCR ENGINE
// ============================================
function calculateDSCR(ebitda, netIncomeYTD, monthlyDebt) {
  let annualIncome;
  if (ebitda > 0) { annualIncome = ebitda; }
  else { const m = new Date().getMonth() + 1; annualIncome = (netIncomeYTD / m) * 12; }
  const annualDebtService = monthlyDebt * 12;
  if (annualDebtService === 0) return null;
  return annualIncome / annualDebtService;
}
function getDSCRDisplay(dscr) {
  if (dscr === null) return { ratio:'N/A', cssClass:'dscr--none',     meaning:'No existing debt detected. DSCR not applicable — lenders will focus on revenue strength and cash flow.', activeBand:-1 };
  if (dscr >= 1.5)  return { ratio:dscr.toFixed(2)+'x', cssClass:'dscr--strong',   meaning:`Strong. For every $1.00 of annual debt service, you generate $${dscr.toFixed(2)} in income. Most lenders require 1.25x minimum.`, activeBand:3 };
  if (dscr >= 1.25) return { ratio:dscr.toFixed(2)+'x', cssClass:'dscr--good',     meaning:`Good. You meet most lender DSCR minimums with an adequate buffer. 1.25x is the conventional floor for most bank and SBA products.`, activeBand:2 };
  if (dscr >= 1.0)  return { ratio:dscr.toFixed(2)+'x', cssClass:'dscr--tight',    meaning:`Tight. Your income covers debt payments but barely. Most conventional lenders will hesitate — strong compensating factors required.`, activeBand:1 };
  return                   { ratio:dscr.toFixed(2)+'x', cssClass:'dscr--negative', meaning:`Negative. Your current income does not cover existing debt obligations. New financing will be very difficult without first reducing debt.`, activeBand:0 };
}
 
// ============================================
// ADVANCED MODE — SCORING ENGINE
// ============================================
function calculateAdvancedScore(data, dscr) {
  let score = 0;
  const factors = [];
 
  let dscrPts, dscrNote;
  if (dscr === null)    { dscrPts=20; dscrNote='No existing debt — DSCR not applicable. Lenders will evaluate revenue and cash flow directly.'; }
  else if (dscr >= 1.5) { dscrPts=40; dscrNote=`DSCR of ${dscr.toFixed(2)}x is excellent — strong coverage well above the 1.25x lender minimum.`; }
  else if (dscr >= 1.25){ dscrPts=32; dscrNote=`DSCR of ${dscr.toFixed(2)}x meets most lender minimums with adequate buffer.`; }
  else if (dscr >= 1.15){ dscrPts=22; dscrNote=`DSCR of ${dscr.toFixed(2)}x is below preferred levels. Some lenders will accept with strong compensating factors.`; }
  else if (dscr >= 1.0) { dscrPts=12; dscrNote=`DSCR of ${dscr.toFixed(2)}x is tight — income barely covers debt service.`; }
  else                  { dscrPts=0;  dscrNote=`DSCR of ${dscr.toFixed(2)}x is negative — income does not cover existing debt payments.`; }
  score += dscrPts;
  factors.push({ label:'Debt Service Coverage Ratio (DSCR)', pts:dscrPts, max:40, note:dscrNote });
 
  const mr = parseFloat(data.monthlyRevenue) || 0;
  let rp, rn;
  if      (mr >= 83333) { rp=20; rn='Revenue over $1M annually — top borrower tier for nearly all products.'; }
  else if (mr >= 41667) { rp=17; rn='$500K–$1M annual revenue qualifies for SBA and bank term loans.'; }
  else if (mr >= 20833) { rp=13; rn='$250K–$500K annual revenue qualifies for a wide range of products.'; }
  else if (mr >= 8333)  { rp=9;  rn='$100K–$250K annual revenue opens the door to alternative lenders.'; }
  else                   { rp=4;  rn='Under $100K annual revenue limits options significantly.'; }
  score += rp;
  factors.push({ label:'Monthly Revenue', pts:rp, max:20, note:rn });
 
  const timeMap = {
    'under12mo':{ pts:3,  label:'Under 12 months is a barrier — most lenders require at least 1 year.' },
    '1yr_2yr':  { pts:7,  label:'1–2 years meets basic requirements for most lenders.' },
    '2yr_5yr':  { pts:11, label:'2–5 years is strong — qualifies for most conventional products.' },
    '5yr_10yr': { pts:13, label:'5–10 years is very strong — lenders view this favorably.' },
    'over10yr': { pts:15, label:'10+ years is excellent — demonstrates exceptional business durability.' }
  };
  const time = timeMap[data.timeInBusiness] || { pts:0, label:'Time in business not recognized.' };
  score += time.pts;
  factors.push({ label:'Time in Business', pts:time.pts, max:15, note:time.label });
 
  const industryMap = {
    'professional':  { pts:10, label:'Professional services is low-risk — highly favorable classification.' },
    'healthcare':    { pts:10, label:'Healthcare is a preferred industry for most commercial lenders.' },
    'manufacturing': { pts:9,  label:'Manufacturing viewed favorably due to tangible assets.' },
    'realestate':    { pts:9,  label:'Real estate has strong access to asset-backed capital products.' },
    'transportation':{ pts:8,  label:'Transportation & Logistics is stable with a strong collateral base.' },
    'construction':  { pts:7,  label:'Construction is moderate risk — cyclical revenue requires strong bank history.' },
    'ecommerce':     { pts:7,  label:'E-commerce accepted but scrutinized for revenue consistency.' },
    'other':         { pts:6,  label:'Industry evaluated case-by-case — have a clear business description ready.' },
    'retail':        { pts:5,  label:'Retail is moderate-to-high risk — lenders want to see strong margins.' },
    'restaurant':    { pts:3,  label:'Restaurants are high-risk — expect limited options and higher rates.' }
  };
  const ind = industryMap[data.industry] || { pts:0, label:'Industry not recognized.' };
  score += ind.pts;
  factors.push({ label:'Industry Classification', pts:ind.pts, max:10, note:ind.label });
 
  const creditMap = {
    'under580':{ pts:0,  label:'Below 580 is subprime — most conventional lenders will decline.' },
    '581_630': { pts:3,  label:'581–630 limits you to alternative lenders at higher rates.' },
    '631_680': { pts:6,  label:'631–680 qualifies for some loans but expect higher rates.' },
    '681_720': { pts:9,  label:'681–720 qualifies for most products at reasonable rates.' },
    '721_780': { pts:11, label:'721–780 is strong — competitive rates from most lenders.' },
    '780plus': { pts:12, label:'780+ is excellent — lenders will compete for your business.' }
  };
  const credit = creditMap[data.creditScore] || { pts:0, label:'Credit score not recognized.' };
  score += credit.pts;
  factors.push({ label:'Personal Credit Score', pts:credit.pts, max:12, note:credit.label });
 
  const loanMap = {
    'under50k': { pts:3, label:'Loan amount is modest — very achievable for most qualified borrowers.' },
    '50k_250k': { pts:3, label:'Loan amount is reasonable — aligns well with standard business financing.' },
    '250k_500k':{ pts:2, label:'Substantial request — lenders will confirm DSCR supports repayment.' },
    '500k_1m':  { pts:1, label:'Large loan — strong revenue, credit, and documentation required.' },
    'over1m':   { pts:0, label:'Over $1M requires exceptional documentation and strong collateral.' }
  };
  const loan = loanMap[data.loanAmount] || { pts:0, label:'Loan amount not recognized.' };
  score += loan.pts;
  factors.push({ label:'Loan Amount vs. Profile', pts:loan.pts, max:3, note:loan.label });
 
  const purpose = loanPurposeMap[data.loanPurpose];
  if (purpose) factors.push({ label:'Loan Purpose', pts:null, max:null, note:`${purpose.label} — ${purpose.sba}` });
 
  return { score, factors };
}
 
// ============================================
// SBA ELIGIBILITY ENGINE
// ============================================
function calculateSBAEligibility(data, dscr, mode) {
 
  let annualRevenue = 0;
  if (mode === 'advanced') {
    annualRevenue = (parseFloat(data.monthlyRevenue) || 0) * 12;
  } else {
    const revMap = { 'under50k':25000, '50k_150k':100000, '150k_500k':325000, '500k_1m':750000, 'over1m':1500000 };
    annualRevenue = revMap[data.revenue] || 0;
  }
 
  const timeKey     = data.timeInBusiness;
  const creditKey   = data.creditScore;
  const purpose     = data.loanPurpose;
  const hasTaxLiens = data.taxLiens === 'yes';
  const loanAmtKey  = data.loanAmount;
 
  // Tax return signals
  const noTaxReturns = data.taxReturns === 'tax_no';
  const onlyOneTaxReturn = data.taxReturns === 'tax_one_year';
 
  const timeStrong   = ['2yr_5yr','5yr_10yr','over10yr'].includes(timeKey);
  const timeMarginal = timeKey === '1yr_2yr';
  const timeTooNew   = timeKey === 'under12mo';
 
  const creditStrong   = ['681_720','721_780','780plus'].includes(creditKey);
  const creditMarginal = creditKey === '631_680';
  const creditWeak     = ['under580','581_630'].includes(creditKey);
 
  const dscrWeak     = mode === 'advanced' && dscr !== null && dscr < 1.0;
  const dscrMarginal = mode === 'advanced' && dscr !== null && dscr >= 1.0 && dscr < 1.25;
 
  function evalProgram(checks) {
    let status = 'eligible';
    const issues = [];
    for (const check of checks) {
      if (check.fail) { status = 'unlikely'; issues.push(check.msg); }
      else if (check.warn && status !== 'unlikely') { status = 'possible'; issues.push(check.msg); }
    }
    return { status, issues };
  }
 
  const sba7a = evalProgram([
    { fail: hasTaxLiens,            msg: 'Tax liens must be resolved before applying' },
    { fail: timeTooNew,             msg: 'Under 12 months is below most SBA lender minimums' },
    { warn: timeMarginal,           msg: '1–2 years is marginal; 2+ years preferred by most SBA 7(a) lenders' },
    { fail: creditWeak,             msg: 'Credit score below 631 typically disqualifies for SBA 7(a)' },
    { warn: creditMarginal,         msg: '631–680 is marginal; 681+ preferred for SBA 7(a)' },
    { fail: annualRevenue < 100000, msg: '$100K+ annual revenue required by most SBA 7(a) lenders' },
    { fail: dscrWeak,               msg: 'DSCR below 1.0x is typically disqualifying for SBA 7(a)' },
    { warn: dscrMarginal,           msg: 'DSCR below 1.25x requires strong compensating factors' },
    { fail: noTaxReturns && !timeTooNew, msg: 'SBA 7(a) lenders require at least 1–2 years of business tax returns' },
    { warn: onlyOneTaxReturn,       msg: '1 year of returns is acceptable for some SBA lenders; 2 years preferred' },
  ]);
 
  const purpose504OK = ['real_estate','equipment'].includes(purpose);
  const sba504 = evalProgram([
    { fail: !purpose504OK,          msg: 'SBA 504 is only for real estate or major equipment purchases' },
    { fail: hasTaxLiens,            msg: 'Tax liens must be resolved before applying' },
    { fail: !timeStrong,            msg: '2+ years in business required for SBA 504' },
    { fail: !creditStrong,          msg: '680+ credit score required for SBA 504' },
    { fail: annualRevenue < 250000, msg: '$250K+ annual revenue typically required for SBA 504' },
    { fail: dscrWeak || dscrMarginal, msg: '1.25x+ DSCR required for SBA 504' },
    { fail: noTaxReturns,           msg: 'SBA 504 requires 2 years of business tax returns' },
  ]);
 
  const loanTooHigh = ['250k_500k','500k_1m','over1m'].includes(loanAmtKey);
  const hasBizPlan  = data.businessPlan === 'bp_yes' || data.businessPlan === 'bp_in_progress';
  const microloan = evalProgram([
    { fail: loanTooHigh,             msg: 'SBA Microloans cap at $50K — your requested amount exceeds this' },
    { fail: annualRevenue > 1000000, msg: 'SBA Microloans target smaller businesses — your revenue may exceed typical eligibility' },
    { warn: hasTaxLiens,             msg: 'Tax liens may complicate approval, though some CDFIs are flexible' },
    { warn: timeTooNew && !hasBizPlan, msg: 'A business plan or financial projections are typically required for startup Microloans' },
  ]);
 
  return [
    { ...sba7a,     name:'SBA 7(a)',      maxAmount:'Up to $5M',   bestFor:'Working capital, expansion, equipment, refinancing, most purposes' },
    { ...sba504,    name:'SBA 504',       maxAmount:'Up to $5.5M', bestFor:'Commercial real estate & major equipment only' },
    { ...microloan, name:'SBA Microloan', maxAmount:'Up to $50K',  bestFor:'Startups & small businesses needing modest capital' }
  ];
}
 
// ============================================
// VERDICT
// ============================================
function getVerdict(score) {
  if (score >= 80) return { text:'✦ Strong Candidate',        css:'verdict--strong' };
  if (score >= 60) return { text:'◈ Promising — Minor Gaps', css:'verdict--promising' };
  if (score >= 40) return { text:'◇ Needs Work',             css:'verdict--needs-work' };
  return                  { text:'△ Not Ready Yet',           css:'verdict--not-ready' };
}
 
// ============================================
// AFFILIATE LINKS — purpose-aware
// ============================================
function getAffiliateLinks(score, data) {
  const links = [];
  const p = data.loanPurpose;
 
  const sbTime    = ['2yr_5yr','5yr_10yr','over10yr'].includes(data.timeInBusiness);
  const sbCredit  = ['681_720','721_780','780plus'].includes(data.creditScore);
  const sbRevSimple = ['150k_500k','500k_1m','over1m'].includes(data.revenue);
  const sbRevAdv    = data.monthlyRevenue && (parseFloat(data.monthlyRevenue) * 12) >= 250000;
  const sbRevenue   = sbRevSimple || sbRevAdv;
  const sbIndustry  = !['realestate','construction','transportation'].includes(data.industry);
  const sbPurpose   = !['real_estate','expansion'].includes(p);
  const sbBalance   = data.bankBalance !== 'under5k';
  const sbNoLiens   = data.taxLiens !== 'yes';
 
  const smartbizOK = sbTime && sbCredit && sbRevenue && sbIndustry && sbPurpose && sbBalance && sbNoLiens;
 
  if (score >= 60) {
    links.push({
      name:'Lendio',
      desc: p==='real_estate' ? 'Compare SBA 504 lenders for commercial real estate — one application, 75+ lenders.'
          : p==='equipment'   ? 'Equipment financing up to $5.5M. Compare SBA 7(a) and 504 options in one application.'
          : p==='refinance'   ? 'Refinancing options from 75+ lenders. Compare SBA 7(a) and conventional options.'
          : p==='expansion'   ? 'Business acquisition and expansion financing. Compare 75+ lenders in one application.'
          : 'Compare 75+ lenders with one application. Best for strong profiles.',
      url:'https://www.lendio.com/?ref=fundingrade', cta:'Check Rates →'
    });
  }
 
  if (smartbizOK) {
    links.push({
      name:'SmartBiz',
      desc: p==='equipment'       ? 'SBA 7(a) equipment financing $50K–$350K — pre-qualify in 5 minutes, funded in as fast as 7 days.'
          : p==='refinance'       ? 'Refinance existing business debt into a lower-rate SBA 7(a) loan — $50K–$350K, pre-qualify in 5 minutes.'
          : p==='working_capital' ? 'SBA 7(a) working capital loans $50K–$350K — pre-qualify in 5 minutes, funded in as fast as 7 days.'
          : 'SBA 7(a) loans $50K–$350K — pre-qualify in 5 minutes. SmartBiz is a preferred SBA lender.',
      url:'https://smartbizbank.com/assist/partner/trippsterenterprisesllc/dewey', cta:'Check SBA Rates →'
    });
  }
 
  if (score >= 45) {
    links.push({ name:'Bluevine', desc:'Business lines of credit up to $250K. Fast decisions, no prepayment fees.', url:'https://www.bluevine.com/?ref=fundingrade', cta:'See If You Qualify →' });
  }
  if (score < 60 || data.creditScore === 'under580' || data.creditScore === '581_630') {
    links.push({ name:'Fundbox', desc:'Flexible credit lines for businesses building their credit profile.', url:'https://fundbox.com/?ref=fundingrade', cta:'Explore Options →' });
  }
  links.push({ name:'Nav', desc:'Free business credit monitoring + matched financing options. A smart first step.', url:'https://nav.nkwcmr.net/c/7254877/1813107/2410', cta:'Check Free →' });
  return links;
}
 
// ============================================
// ANSWER RECAP
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
    if (data.taxReturns)     items.push(answerLabels[data.taxReturns]     || data.taxReturns);
    if (data.businessPlan)   items.push(answerLabels[data.businessPlan]   || data.businessPlan);
  } else {
    if (data.ebitda > 0)         items.push('EBITDA: '         + formatCurrency(data.ebitda));
    else if (data.netIncome > 0) items.push('Net Income YTD: ' + formatCurrency(data.netIncome));
    if (data.monthlyRevenue)     items.push('Monthly Rev: '    + formatCurrency(data.monthlyRevenue));
    if (data.monthlyDebt)        items.push('Monthly Debt: '   + formatCurrency(data.monthlyDebt));
    if (data.timeInBusiness)     items.push(answerLabels[data.timeInBusiness] || data.timeInBusiness);
    if (data.industry)           items.push(answerLabels[data.industry]       || data.industry);
    if (data.creditScore)        items.push(answerLabels[data.creditScore]    || data.creditScore);
    if (data.loanAmount)         items.push(answerLabels[data.loanAmount]     || data.loanAmount);
    if (data.loanPurpose)        items.push(answerLabels[data.loanPurpose]    || data.loanPurpose);
  }
  return items;
}
 
// ============================================
// SIMPLE MODE — SUBMIT
// ============================================
async function submitForm() {
  // Called either from step 11 next button OR skipped from step 10 for non-startups
  const form = document.getElementById('loanForm');
 
  // Validate last visible step
  const step11El = document.querySelector('[data-step="11"]');
  const step11Active = step11El && step11El.classList.contains('active');
  if (step11Active) {
    const selected = step11El.querySelector('input[type="radio"]:checked');
    if (!selected) { shakeStep(step11El); return; }
  }
 
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
    taxReturns:     form.querySelector('input[name="taxReturns"]:checked')?.value,
    businessPlan:   form.querySelector('input[name="businessPlan"]:checked')?.value || null,
  };
 
  showLoadingState('loanForm');
  try {
    const { score, factors } = calculateScore(data);
    const verdict      = getVerdict(score);
    const affiliates   = getAffiliateLinks(score, data);
    const recap        = buildAnswerRecap(data, 'simple');
    const sbaEligibility = calculateSBAEligibility(data, null, 'simple');
    let aiExplanation = '';
    try { aiExplanation = await getAIExplanation(data, score, factors, verdict); }
    catch (e) { aiExplanation = factors.filter(f=>f.pts!==null).map(f=>`${f.label}: ${f.note}`).join('\n\n'); }
    hideLoadingState();
    renderResults(score, verdict, aiExplanation, affiliates, null, recap, data, sbaEligibility, null);
  } catch(err) {
    console.error(err);
    hideLoadingState();
    document.getElementById('loanForm').style.display = 'block';
    document.getElementById('progressBar').parentElement.style.display = 'block';
    document.getElementById('progressLabel').style.display = 'block';
    alert('Something went wrong. Please try again.');
  }
}
 
// ============================================
// ADVANCED MODE — SUBMIT
// ============================================
async function submitAdvForm() {
  const stepEl = document.querySelector(`[data-adv-step="7"]`);
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
  try {
    const dscr               = calculateDSCR(ebitda, netIncome, monthlyDebt);
    const dscrDisplay        = getDSCRDisplay(dscr);
    const { score, factors } = calculateAdvancedScore(data, dscr);
    const verdict            = getVerdict(score);
    const affiliates         = getAffiliateLinks(score, data);
    const recap              = buildAnswerRecap(data, 'advanced');
    const sbaEligibility     = calculateSBAEligibility(data, dscr, 'advanced');
    let aiExplanation = '';
    try { aiExplanation = await getAdvancedAIExplanation(data, score, factors, verdict, dscr, dscrDisplay); }
    catch (e) { aiExplanation = factors.filter(f=>f.pts!==null).map(f=>`${f.label}: ${f.note}`).join('\n\n'); }
    hideLoadingState();
    renderResults(score, verdict, aiExplanation, affiliates, dscrDisplay, recap, data, sbaEligibility, dscr);
  } catch(err) {
    console.error(err);
    hideLoadingState();
    document.getElementById('advForm').style.display = 'block';
    document.getElementById('progressBar').parentElement.style.display = 'block';
    document.getElementById('progressLabel').style.display = 'block';
    alert('Something went wrong. Please try again.');
  }
}
 
// ============================================
// LOADING STATE
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
// AI EXPLANATION — SIMPLE
// ============================================
async function getAIExplanation(data, score, factors, verdict) {
  const factorText = factors.filter(f=>f.pts!==null).map(f=>`- ${f.label}: ${f.pts}/${f.max} pts — ${f.note}`).join('\n');
  const purpose = loanPurposeMap[data.loanPurpose];
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
Paragraph 3: Identify their most critical improvement areas with actionable advice.
Paragraph 4 (if score < 70): Give one concrete next step they can take this month.
Do not use bullet points. Warm but professional advisor tone. Address them as "you."`;
 
  const response = await fetch('/.netlify/functions/score', {
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ prompt })
  });
  if (!response.ok) throw new Error('API error');
  const result = await response.json();
  return result.explanation;
}
 
// ============================================
// AI EXPLANATION — ADVANCED
// ============================================
async function getAdvancedAIExplanation(data, score, factors, verdict, dscr, dscrDisplay) {
  const factorText = factors.filter(f=>f.pts!==null).map(f=>`- ${f.label}: ${f.pts}/${f.max} pts — ${f.note}`).join('\n');
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
    method:'POST', headers:{'Content-Type':'application/json'},
    body: JSON.stringify({ prompt })
  });
  if (!response.ok) throw new Error('API error');
  const result = await response.json();
  return result.explanation;
}
 
// ============================================
// RENDER SBA SECTION
// ============================================
function renderSBASection(sbaEl, sbaEligibility, mode, data) {
  if (!sbaEl) return;
 
  const badgeLabels = { eligible:'✅ Likely Eligible', possible:'⚠️ Possible', unlikely:'❌ Unlikely' };
 
  if (mode === 'advanced') {
    const smartbizUrl = 'https://smartbizbank.com/assist/partner/trippsterenterprisesllc/dewey';
    const cards = sbaEligibility.map(prog => {
      const issueHTML = prog.issues.length
        ? `<div class="sba-elig-note">${prog.issues.join(' · ')}</div>`
        : `<div class="sba-elig-note" style="color:rgba(74,222,128,.7)">Your profile meets the key requirements for this program.</div>`;
 
      const showCTA = (prog.status === 'eligible' || prog.status === 'possible')
                   && prog.name === 'SBA 7(a)';
      const ctaHTML = showCTA
        ? `<a href="${smartbizUrl}" target="_blank" rel="noopener sponsored" class="sba-elig-cta">Apply via SmartBiz →</a>`
        : '';
 
      return `
        <div class="sba-elig-card ${prog.status}">
          <div class="sba-elig-header">
            <span class="sba-elig-name">${prog.name}</span>
            <span class="sba-elig-badge ${prog.status}">${badgeLabels[prog.status]}</span>
          </div>
          <div class="sba-elig-meta">${prog.maxAmount} &nbsp;·&nbsp; ${prog.bestFor}</div>
          ${issueHTML}
          ${ctaHTML}
        </div>`;
    }).join('');
 
    sbaEl.style.display = 'block';
    sbaEl.innerHTML = `
      <div class="sba-eyebrow">SBA Loan Eligibility — Based on Your Profile</div>
      <div class="sba-elig-cards">${cards}</div>`;
 
  } else {
    const purpose = data && data.loanPurpose ? loanPurposeMap[data.loanPurpose] : null;
    sbaEl.style.display = 'block';
    sbaEl.innerHTML = `
      ${purpose ? `<div class="sba-eyebrow">SBA Loan Match — ${purpose.label}</div><div class="sba-text">${purpose.sba}</div>` : ''}
      <div class="sba-nudge">💡 Want a full SBA eligibility breakdown? <strong>Switch to Advanced DSCR mode</strong> above — it checks your profile against SBA 7(a), SBA 504, and SBA Microloan requirements using your actual financial data.</div>`;
  }
}
 
// ============================================
// RENDER RESULTS
// ============================================
function renderResults(score, verdict, explanation, affiliates, dscrDisplay, recap, data, sbaEligibility, dscr) {
  document.getElementById('resultsState').style.display = 'block';
 
  const dscrCard = document.getElementById('dscrCard');
  if (dscrDisplay) {
    dscrCard.style.display = 'block';
    document.getElementById('dscrRatio').textContent   = dscrDisplay.ratio;
    document.getElementById('dscrRatio').className     = 'dscr-ratio ' + dscrDisplay.cssClass;
    document.getElementById('dscrMeaning').textContent = dscrDisplay.meaning;
    for (let i=0; i<4; i++) {
      document.getElementById('dscrBand'+i).className = 'dscr-band'+(i===dscrDisplay.activeBand?' active-band':'');
    }
  } else { dscrCard.style.display='none'; }
 
  const recapEl = document.getElementById('answerRecap');
  if (recapEl && recap && recap.length) {
    recapEl.style.display = 'flex';
    recapEl.innerHTML = '<span class="recap-label">Based on:</span> ' + recap.map(r=>`<span class="recap-item">${r}</span>`).join('');
  } else if (recapEl) { recapEl.style.display='none'; }
 
  const sbaEl = document.getElementById('sbaGuidance');
  renderSBASection(sbaEl, sbaEligibility, currentMode, data);
 
  const scoreEl  = document.getElementById('scoreNumber');
  const circleEl = document.getElementById('scoreCircle');
  const circ = 339.3;
  let cur = 0;
  const step = score / (1200/16);
  const counter = setInterval(() => {
    cur = Math.min(cur + step, score);
    scoreEl.textContent = Math.round(cur);
    circleEl.style.strokeDashoffset = circ - (cur/100)*circ;
    if      (cur >= 80) circleEl.style.stroke='#4CAF82';
    else if (cur >= 60) circleEl.style.stroke='#C9A84C';
    else if (cur >= 40) circleEl.style.stroke='#E8A033';
    else                circleEl.style.stroke='#E05252';
    if (cur >= score) clearInterval(counter);
  }, 16);
 
  const verdictEl = document.getElementById('scoreVerdict');
  verdictEl.textContent = verdict.text;
  verdictEl.className   = 'score-verdict ' + verdict.css;
 
  document.getElementById('breakdownContent').textContent = explanation;
 
  document.getElementById('affiliateLinks').innerHTML = affiliates.map(a=>`
    <a href="${a.url}" target="_blank" rel="noopener sponsored" class="affiliate-link">
      <div><div class="affiliate-name">${a.name}</div><div class="affiliate-desc">${a.desc}</div></div>
      <div class="affiliate-cta">${a.cta}</div>
    </a>`).join('');
}
 
// ============================================
// RESTART
// ============================================
function restartForm() {
  document.getElementById('resultsState').style.display='none';
  document.getElementById('progressBar').parentElement.style.display='block';
  document.getElementById('progressLabel').style.display='block';
  document.getElementById('scoreCircle').style.strokeDashoffset='339.3';
  document.getElementById('scoreNumber').textContent='--';
  document.querySelectorAll('input[type="radio"]').forEach(r=>r.checked=false);
  ['adv_ebitda','adv_netIncome','adv_monthlyRevenue','adv_monthlyDebt'].forEach(id=>{
    const el=document.getElementById(id); if(el) el.value='';
  });
  if (currentMode==='simple') {
    currentStep=1;
    document.getElementById('loanForm').style.display='block';
    document.querySelectorAll('.form-step').forEach(s=>s.classList.remove('active'));
    document.querySelector('[data-step="1"]').classList.add('active');
    updateProgress(1);
  } else {
    currentAdvStep=1;
    document.getElementById('advForm').style.display='block';
    document.querySelectorAll('.adv-form-step').forEach(s=>s.classList.remove('active'));
    document.querySelector('[data-adv-step="1"]').classList.add('active');
    updateAdvProgress(1);
  }
}
 
// ============================================
// FAQ TOGGLE
// ============================================
function toggleFaq(btn) {
  btn.nextElementSibling.classList.toggle('open');
  btn.classList.toggle('open');
}
 
document.addEventListener('change', e => { if(e.target.type==='radio'){} });
