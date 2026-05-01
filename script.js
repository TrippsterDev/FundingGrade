// ============================================
// FUNDING GRADE — Scoring Logic & Form Handler
// ============================================

let currentStep = 1;
const totalSteps = 8;

// ---- NAVIGATION ----

function nextStep(step) {
  const stepEl = document.querySelector(`[data-step="${step}"]`);
  const selected = stepEl.querySelector('input[type="radio"]:checked');

  if (!selected) {
    shakeStep(stepEl);
    return;
  }

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

function shakeStep(el) {
  el.style.animation = 'none';
  el.offsetHeight; // reflow
  el.style.animation = 'shake 0.35s ease';
  setTimeout(() => el.style.animation = '', 400);
}

// Add shake keyframes dynamically
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

// ---- SCORING ENGINE ----

function calculateScore(data) {
  let score = 0;
  const factors = [];

  // 1. Time in Business (0-20 pts)
  const timeMap = {
    'under6mo': { pts: 0,  label: 'Under 6 months in business is a major barrier — most lenders require at least 1 year.' },
    '6mo_12mo': { pts: 8,  label: '6–12 months in business is below most lender minimums — consider alternative lenders.' },
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
  factors.push({ label: 'Annual Revenue', pts: rev.pts, max: 20, note: rev.note });

  // 3. Credit Score (0-25 pts)
  const creditMap = {
    'under580': { pts: 0,  label: 'Below 580 is considered subprime — most conventional lenders will decline. Focus on rebuilding credit first.' },
    '580_619':  { pts: 8,  label: '580–619 is below average — options are limited to alternative and asset-based lenders at higher rates.' },
    '620_659':  { pts: 14, label: '620–659 qualifies for some business loans but expect higher interest rates.' },
    '660_699':  { pts: 18, label: '660–699 is fair — you qualify for most business loan products at reasonable rates.' },
    '700_739':  { pts: 22, label: '700–739 is a strong credit score — you\'ll see competitive rates from most lenders.' },
    '740plus':  { pts: 25, label: '740+ is excellent — lenders will compete for your business.' }
  };
  const credit = creditMap[data.creditScore];
  score += credit.pts;
  factors.push({ label: 'Personal Credit Score', pts: credit.pts, max: 25, note: credit.note });

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
  factors.push({ label: 'Existing Debt Load', pts: debt.pts, max: 15, note: debt.note });

  // 5. Industry Risk (0-8 pts)
  const industryMap = {
    'professional': { pts: 8, label: 'Professional services is considered low-risk by lenders — favorable industry classification.' },
    'healthcare':   { pts: 8, label: 'Healthcare is a preferred industry for most commercial lenders.' },
    'construction': { pts: 6, label: 'Construction is moderate risk — cyclical revenue patterns require strong bank history.' },
    'ecommerce':    { pts: 6, label: 'E-commerce is accepted by most lenders but expect scrutiny on revenue consistency.' },
    'manufacturing':{ pts: 7, label: 'Manufacturing is generally viewed favorably due to tangible assets.' },
    'realestate':   { pts: 7, label: 'Real estate businesses have good access to capital, especially asset-backed products.' },
    'retail':       { pts: 5, label: 'Retail is considered moderate-to-high risk — lenders want to see strong margins.' },
    'restaurant':   { pts: 3, label: 'Restaurants are flagged as high-risk by most conventional lenders. Expect limited options and higher rates.' },
    'other':        { pts: 5, label: 'Your industry will be evaluated case-by-case — have a clear business description ready.' }
  };
  const ind = industryMap[data.industry];
  score += ind.pts;
  factors.push({ label: 'Industry Classification', pts: ind.pts, max: 8, note: ind.note });

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
  factors.push({ label: 'Average Bank Balance', pts: bal.pts, max: 7, note: bal.note });

  // 7. Tax Liens (0-3 pts — major negative if yes)
  if (data.taxLiens === 'no') {
    score += 3;
    factors.push({ label: 'Tax Liens / Judgments', pts: 3, max: 3, note: 'No liens or judgments — clean public record is exactly what lenders want to see.' });
  } else {
    score += 0;
    factors.push({ label: 'Tax Liens / Judgments', pts: 0, max: 3, note: 'Outstanding tax liens or judgments are serious — most conventional lenders will require these to be resolved before approving a loan.' });
  }

  // 8. Loan-to-Revenue Ratio (0-2 pts)
  const loanMap = {
    'under25k':  { pts: 2, label: 'Loan amount is modest relative to most revenue levels — very achievable.' },
    '25k_100k':  { pts: 2, label: 'Loan amount is reasonable — aligns well with standard business financing.' },
    '100k_250k': { pts: 1, label: 'Loan amount is substantial — lenders will want to confirm your revenue and cash flow support repayment.' },
    '250k_500k': { pts: 1, label: 'Loan amount is large — you\'ll need strong revenue, credit, and documentation to support this request.' },
    'over500k':  { pts: 0, label: 'Loan amount over $500K requires exceptional documentation, strong collateral, and a very clean profile.' }
  };
  const loan = loanMap[data.loanAmount];
  score += loan.pts;
  factors.push({ label: 'Loan Amount vs. Profile', pts: loan.pts, max: 2, note: loan.note });

  return { score, factors };
}

// ---- VERDICT ----

function getVerdict(score) {
  if (score >= 80) return { text: '✦ Strong Candidate', css: 'verdict--strong' };
  if (score >= 60) return { text: '◈ Promising — Minor Gaps', css: 'verdict--promising' };
  if (score >= 40) return { text: '◇ Needs Work', css: 'verdict--needs-work' };
  return { text: '△ Not Ready Yet', css: 'verdict--not-ready' };
}

// ---- AFFILIATE LINKS ----

function getAffiliateLinks(score, data) {
  const links = [];

  if (score >= 60) {
    links.push({
      name: 'Lendio',
      desc: 'Compare 75+ lenders with one application. Best for strong profiles.',
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

  if (score < 60 || data.creditScore === 'under580' || data.creditScore === '580_619') {
    links.push({
      name: 'Fundbox',
      desc: 'Flexible credit lines for businesses that need to build their profile.',
      url: 'https://fundbox.com/?ref=fundingrade',
      cta: 'Explore Options →'
    });
  }

  links.push({
    name: 'Nav',
    desc: 'Free business credit monitoring + matched financing options. Good first step.',
    url: 'https://www.nav.com/?ref=fundingrade',
    cta: 'Check Free →'
  });

  return links;
}

// ---- FORM SUBMIT ----

async function submitForm() {
  const stepEl = document.querySelector(`[data-step="8"]`);
  const selected = stepEl.querySelector('input[type="radio"]:checked');
  if (!selected) { shakeStep(stepEl); return; }

  // Collect all form data
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
  };

  // Show loading
  document.getElementById('loanForm').style.display = 'none';
  document.getElementById('progressBar').parentElement.style.display = 'none';
  document.getElementById('progressLabel').style.display = 'none';
  document.getElementById('loadingState').style.display = 'block';

  // Calculate score
  const { score, factors } = calculateScore(data);
  const verdict = getVerdict(score);
  const affiliates = getAffiliateLinks(score, data);

  // Call AI for explanation
  let aiExplanation = '';
  try {
    aiExplanation = await getAIExplanation(data, score, factors, verdict);
  } catch (e) {
    // Fallback to factor list if API fails
    aiExplanation = factors.map(f => `• ${f.label}: ${f.note}`).join('\n\n');
  }

  // Hide loading, show results
  document.getElementById('loadingState').style.display = 'none';
  renderResults(score, verdict, aiExplanation, affiliates);
}

// ---- AI EXPLANATION (calls Netlify function) ----

async function getAIExplanation(data, score, factors, verdict) {
  const factorText = factors.map(f => `- ${f.label}: ${f.pts}/${f.max} pts — ${f.note}`).join('\n');

  const prompt = `You are a plain-English commercial lending advisor. A business owner just completed a loan readiness assessment.

Their score: ${score}/100
Verdict: ${verdict.text}

Factor breakdown:
${factorText}

Write a 3-4 paragraph personal breakdown for this business owner. Be direct, specific, and encouraging where warranted — but honest about weaknesses. 

Paragraph 1: Summarize their overall position in 2-3 sentences.
Paragraph 2: Highlight their strongest factors (what's working in their favor).
Paragraph 3: Identify their most critical improvement areas with specific, actionable advice.
Paragraph 4 (if score < 70): Give one concrete next step they can take this month to improve their score.

Do not use bullet points. Write in a warm but professional advisor tone. No fluff, no filler. Address them as "you."`;

  const response = await fetch('/.netlify/functions/score', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt })
  });

  if (!response.ok) throw new Error('API error');
  const result = await response.json();
  return result.explanation;
}

// ---- RENDER RESULTS ----

function renderResults(score, verdict, explanation, affiliates) {
  document.getElementById('resultsState').style.display = 'block';

  // Animate score number
  const scoreEl = document.getElementById('scoreNumber');
  const circleEl = document.getElementById('scoreCircle');
  const circumference = 339.3;

  let current = 0;
  const target = score;
  const duration = 1200;
  const step = target / (duration / 16);

  const counter = setInterval(() => {
    current = Math.min(current + step, target);
    scoreEl.textContent = Math.round(current);
    const offset = circumference - (current / 100) * circumference;
    circleEl.style.strokeDashoffset = offset;

    // Color the circle by score
    if (current >= 80) circleEl.style.stroke = '#4CAF82';
    else if (current >= 60) circleEl.style.stroke = '#C9A84C';
    else if (current >= 40) circleEl.style.stroke = '#E8A033';
    else circleEl.style.stroke = '#E05252';

    if (current >= target) clearInterval(counter);
  }, 16);

  // Verdict
  const verdictEl = document.getElementById('scoreVerdict');
  verdictEl.textContent = verdict.text;
  verdictEl.className = 'score-verdict ' + verdict.css;

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

// ---- RESTART ----

function restartForm() {
  currentStep = 1;
  document.getElementById('resultsState').style.display = 'none';
  document.getElementById('loanForm').style.display = 'block';
  document.getElementById('progressBar').parentElement.style.display = 'block';
  document.getElementById('progressLabel').style.display = 'block';

  // Reset all radio buttons
  document.querySelectorAll('input[type="radio"]').forEach(r => r.checked = false);

  // Reset to step 1
  document.querySelectorAll('.form-step').forEach(s => s.classList.remove('active'));
  document.querySelector('[data-step="1"]').classList.add('active');

  // Reset score circle
  document.getElementById('scoreCircle').style.strokeDashoffset = '339.3';
  document.getElementById('scoreNumber').textContent = '--';

  updateProgress(1);
}

// ---- FAQ TOGGLE ----

function toggleFaq(btn) {
  const answer = btn.nextElementSibling;
  btn.classList.toggle('open');
  answer.classList.toggle('open');
}

// ---- OPTION CARD AUTO-ADVANCE (optional UX) ----
// Auto-highlight selected without auto-advancing (user must click Next)
document.addEventListener('change', (e) => {
  if (e.target.type === 'radio') {
    const grid = e.target.closest('.options-grid');
    if (grid) {
      grid.querySelectorAll('.option-card span').forEach(s => {
        s.parentElement.querySelector('input').checked
          ? null
          : null; // CSS handles the visual state
      });
    }
  }
});
