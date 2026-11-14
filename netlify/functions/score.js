// Funding Grade: AI explanation function.
// The browser sends only structured results (score, factor list, purpose).
// The prompt is built here, so this endpoint cannot be used as a general AI relay.

const ALLOWED_ORIGINS = [
  'https://fundinggrade.com',
  'https://www.fundinggrade.com'
];

const FACTOR_LABELS = new Set([
  'Time in Business', 'Annual Revenue', 'Personal Credit Score', 'Existing Debt Load',
  'Industry Classification', 'Average Bank Balance', 'Tax Liens / Judgments',
  'Loan Amount vs. Profile', 'Tax Returns Available', 'Business Plan / Projections',
  'Debt Service Coverage Ratio (DSCR)', 'Monthly Revenue'
]);

// Purpose keys and the SBA guidance the AI is given for each. Kept here so no
// free text from the browser ever reaches the prompt.
const PURPOSES = {
  working_capital: { label: 'Working Capital', sba: 'SBA 7(a) is the usual SBA fit for working capital; CAPLines are the revolving option.' },
  equipment:       { label: 'Equipment Purchase', sba: 'SBA 7(a) or SBA 504 can finance equipment with long repayment terms.' },
  real_estate:     { label: 'Real Estate', sba: 'SBA 504 is often the best fit for owner-occupied commercial real estate; SBA 7(a) can also finance real estate.' },
  expansion:       { label: 'Business Expansion or Purchase', sba: 'SBA 7(a) covers acquisitions and expansions; SBA 504 can fund expansions that are real estate or long-term equipment.' },
  refinance:       { label: 'Refinance Existing Debt', sba: 'SBA 7(a) can refinance eligible business debt, and SBA 504 can refinance debt on owner-occupied real estate and equipment.' }
};

function verdictFor(score) {
  if (score >= 80) return 'Strong Candidate';
  if (score >= 60) return 'Promising, with minor gaps';
  if (score >= 40) return 'Needs Work';
  return 'Not Ready Yet';
}

const MAX_BODY = 4000;     // characters

function bad(code, msg) {
  return { statusCode: code, body: JSON.stringify({ error: msg }) };
}

function money(n) {
  return '$' + Math.round(n).toLocaleString('en-US');
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return bad(405, 'Method not allowed');

  const origin = (event.headers && (event.headers.origin || event.headers.Origin)) || '';
  const isPreview = /^https:\/\/deploy-preview-\d+--radiant-taffy-da9955\.netlify\.app$/.test(origin);
  if (!ALLOWED_ORIGINS.includes(origin) && !isPreview) return bad(403, 'Forbidden');

  if (!event.body || event.body.length > MAX_BODY) return bad(413, 'Request too large');

  let b;
  try { b = JSON.parse(event.body); } catch (e) { return bad(400, 'Invalid request body'); }

  const mode = b.mode === 'advanced' ? 'advanced' : (b.mode === 'simple' ? 'simple' : null);
  if (!mode) return bad(400, 'Invalid mode');

  let score = Number(b.score);
  if (!Number.isFinite(score) || score < 0 || score > 150) return bad(400, 'Invalid score');
  score = Math.min(100, Math.round(score));
  const p = PURPOSES[b.purpose];
  const purpose = p ? p.label : 'Not specified';
  const sba = p ? p.sba : '';

  if (!Array.isArray(b.factors) || b.factors.length < 3 || b.factors.length > 12) return bad(400, 'Invalid factors');
  const lines = [];
  for (const f of b.factors) {
    if (!f || !FACTOR_LABELS.has(f.label)) return bad(400, 'Invalid factor');
    const pts = Number(f.pts), max = Number(f.max);
    if (!Number.isFinite(pts) || !Number.isFinite(max) || pts < 0 || max <= 0 || max > 40 || pts > max) return bad(400, 'Invalid factor');
    lines.push(`- ${f.label}: ${pts} of ${max} points`);
  }

  let extra = '';
  if (mode === 'advanced') {
    let dscr = b.dscr === null ? null : Number(b.dscr);
    if (dscr !== null && !Number.isFinite(dscr)) return bad(400, 'Invalid DSCR');
    if (dscr !== null) dscr = Math.max(0, Math.min(dscr, 10));
    const rev = Number(b.monthlyRevenue), debt = Number(b.monthlyDebt);
    if (!Number.isFinite(rev) || rev < 0 || rev > 1e9 || !Number.isFinite(debt) || debt < 0 || debt > 1e9) return bad(400, 'Invalid amounts');
    extra = (dscr === null
      ? 'Existing debt service: none. All income is available to cover a new payment.'
      : `DSCR on existing debt only (before any new loan): ${dscr >= 10 ? '10x or more' : dscr.toFixed(2) + 'x'}.`) +
      `\nAverage monthly revenue: ${money(rev)}\nMonthly debt obligations: ${money(debt)}`;
  }

  const paragraphs = mode === 'advanced'
    ? `Write a 4-paragraph personal breakdown.
Paragraph 1: Summarize their financial position. Reference their DSCR and loan purpose, and note that a lender will recalculate coverage including the new loan payment.
Paragraph 2: Highlight their two or three strongest factors.
Paragraph 3: Identify the most critical improvement areas with actionable advice.
Paragraph 4: Give one concrete next step they can take this month.`
    : `Write a 3-4 paragraph personal breakdown.
Paragraph 1: Summarize their overall position. Reference their loan purpose.
Paragraph 2: Highlight their strongest factors.
Paragraph 3: Identify their most critical improvement areas with actionable advice.
Paragraph 4 (only if the score is under 70): Give one concrete next step they can take this month.`;

  const prompt = `You are a plain-English commercial lending educator. A business owner completed ${mode === 'advanced' ? 'an advanced' : 'a'} loan readiness self-assessment on Funding Grade. The score comes from a fixed points table, not a lender decision.

Score: ${score}/100
Verdict: ${verdictFor(score)}
Loan purpose: ${purpose}
${sba ? `SBA guidance: ${sba}` : ''}
${extra}

Factor breakdown:
${lines.join('\n')}

${paragraphs}
Be direct, specific, and honest. Do not promise approval or quote rates. DSCR compares cash flow (EBITDA) to debt payments, not revenue to debt payments, so never describe revenue as covering debt. Monthly revenue is context only. Write plain text paragraphs only: no headings, no markdown, no bold, no bullet points. Warm but professional tone. Address them as "you."`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': (process.env.ANTHROPIC_API_KEY || '').trim().replace(/^["']|["']$/g, ''),
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      console.error('Anthropic API error:', response.status, await response.text());
      return bad(502, 'AI service unavailable');
    }

    const data = await response.json();
    const explanation = (data.content || [])
      .filter(c => c.type === 'text')
      .map(c => c.text)
      .join('\n')
      .trim();
    if (!explanation) return bad(502, 'Empty response');
    // Strip any stray markdown so it reads cleanly on the page
    const clean = explanation
      .split('\n')
      .filter(line => !/^\s*#{1,6}\s/.test(line))
      .join('\n')
      .replace(/\*\*(.+?)\*\*/g, '$1')
      .replace(/^\s*[-*]\s+/gm, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ explanation: clean })
    };
  } catch (e) {
    console.error('Function error:', e);
    return bad(500, 'Server error');
  }
};
