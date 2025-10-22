import { patterns } from './patterns.mjs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

export function parseStatement(text) {
  const result = {
    issuer: null,
    card_last4: null,
    billing_cycle: null,
    payment_due_date: null,
    total_balance: null
  };
  // Try to detect issuer by keyword presence first (exact matches)
  for (const p of patterns) {
    const name = p.issuer;
    const keyword = name.split(' ')[0];
    if (new RegExp(keyword, 'i').test(text)) {
      const r = extractWithPattern(p, text);
      if (r) return r;
    }
  }

  // Score all patterns and pick the one that extracts the most fields
  let best = { score: -1, res: result };
  for (const p of patterns) {
    const r = extractWithPattern(p, text);
    const score = (r.card_last4 ? 1 : 0) + (r.billing_cycle ? 1 : 0) + (r.payment_due_date ? 1 : 0) + (r.total_balance ? 1 : 0);
    if (score > best.score) {
      best = { score, res: r };
    }
  }

  return best.res;
}

function execRegex(rx, text, twoGroups = false) {
  if (!rx) return null;
  const m = text.match(rx);
  if (!m) return null;
  if (twoGroups) {
    if (m[1] && m[2]) {
      // post-process each group to extract only date-like content (avoid trailing labels)
      const clean = (s) => {
        const str = s.trim();
        // try to find a date-like substring: MM/DD/YY, MMM DD, YYYY, or words
        const dateRegexes = [ /\d{1,2}\/\d{1,2}\/\w+/ , /[A-Za-z]+\s+\d{1,2},?\s*\d{0,4}/, /\d{1,2}\/\d{1,2}\/\d{2,4}/, /[A-Za-z0-9\/-]+/ ];
        for (const dr of dateRegexes) {
          const mm = str.match(dr);
          if (mm) return mm[0].trim();
        }
        return str;
      };
      return `${clean(m[1])} - ${clean(m[2])}`;
    }
    return null;
  }
  return m[1] ? m[1].trim() : null;
}

function extractWithPattern(p, text) {
  const r = { issuer: p.issuer, card_last4: null, billing_cycle: null, payment_due_date: null, total_balance: null };
  // Prefer a smarter card last-4 extraction to avoid catching address numbers
  r.card_last4 = execCardLast4(p.cardLast4, text) || execRegex(p.cardLast4, text);
  const b1 = execRegex(p.billingCycle, text, true);
  if (b1) r.billing_cycle = b1;
  r.payment_due_date = execRegex(p.dueDate, text);
  r.total_balance = execRegex(p.total, text);
  return r;
}

function execCardLast4(rx, text) {
  if (!rx) return null;
  // First, look for explicit account lines in the document (preferred)
  const lines = text.split(/\r?\n/);
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/\b(address)\b/i.test(l)) continue; // skip address lines
    if (/account\b|acct\b|card\s+ending|ending\s+in/i.test(l)) {
      // extract all numeric groups of length >=4 and return final 4 digits of the last group
      const nums = (l.match(/\d{4,}/g) || []).filter(Boolean);
      if (nums.length > 0) return nums[nums.length - 1].slice(-4);
      // if no long groups, try any 4-digit groups
      const fours = (l.match(/\d{4}/g) || []);
      if (fours.length > 0) return fours[fours.length - 1];
    }
  }
  // create a global regex to iterate all matches
  const flags = rx.flags || '';
  const gflags = flags.includes('g') ? flags : flags + 'g';
  const grex = new RegExp(rx.source, gflags);
  const candidates = [];
  let m;
  while ((m = grex.exec(text)) !== null) {
    // prefer the full matched substring so we can capture long account numbers with dashes
    const raw = m[0];
    // determine the line containing the match for context
    const matchStart = m.index;
    const matchEnd = grex.lastIndex;
    const lineStart = Math.max(0, text.lastIndexOf('\n', matchStart) + 1);
    const lineEndIdx = text.indexOf('\n', matchEnd);
    const lineEnd = lineEndIdx === -1 ? text.length : lineEndIdx;
    const line = text.substring(lineStart, lineEnd);
    candidates.push({ raw, line });
    // guard for infinite loops when zero-width matches
    if (grex.lastIndex === m.index) grex.lastIndex++;
  }
  if (candidates.length === 0) return null;
  // prefer candidates where the surrounding line mentions Account / Acct / Card
  const preferred = candidates.filter(c => /account\b|acct\b|card\s+ending|account\s+number|ending\s+in/i.test(c.line));
  const pool = (preferred.length ? preferred : candidates);

  // scoring: prefer groups that are part of dashed sequences or longer than 4, and avoid year-like 4-digit groups (1900-2099)
  const isYear = (s) => {
    if (!/^\d{4}$/.test(s)) return false;
    const n = parseInt(s, 10);
    return n >= 1900 && n <= 2099;
  };

  for (let i = pool.length - 1; i >= 0; i--) {
    const c = pool[i];
    const raw = c.raw || '';
    // prefer numeric groups from raw (m[0]) if it contains dashes or length>4
    const groups = (raw.match(/\d{4,}/g) || []).filter(Boolean);
    let candidateGroup = null;
    if (groups.length > 0) {
      // choose the last group that is not a year
      for (let j = groups.length - 1; j >= 0; j--) {
        if (!isYear(groups[j])) { candidateGroup = groups[j]; break; }
      }
      // if none non-year, fall back to last
      if (!candidateGroup) candidateGroup = groups[groups.length - 1];
      // prefer if raw has dash or group length>4
      if (raw.includes('-') || candidateGroup.length > 4) return candidateGroup.slice(-4);
    }

    // try to find 4-digit groups in the line (avoid selecting pure years)
    const lineGroups = (c.line.match(/\d{4}/g) || []).filter(g => !isYear(g));
    if (lineGroups.length > 0) return lineGroups[lineGroups.length - 1];
  }

  // final fallback: attempt any numeric 4-digit in the entire text that isn't a year
  const all4 = (text.match(/\d{4}/g) || []).filter(g => !isYear(g));
  if (all4.length > 0) return all4[all4.length - 1];
  return null;
}

export async function parsePdf(buffer) {
  // Load pdfjs-dist at runtime using a non-statically analyzable require
  // to prevent bundlers from trying to resolve optional native deps like `canvas`.
  const buf = Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer);
  const uint8 = new Uint8Array(buf);
  try {
    const req = eval('require'); // runtime require that the bundler can't analyze
    const pdfjs = req('pdfjs-dist/legacy/build/pdf.js');
    const loadingTask = pdfjs.getDocument({ data: uint8 });
    const doc = await loadingTask.promise;
    let fullText = '';
    const numPages = doc.numPages || 0;
    for (let i = 1; i <= numPages; i++) {
      const page = await doc.getPage(i);
      const content = await page.getTextContent();
      // join page items with spaces, then add a page break
      const pageText = content.items.map(it => it.str || '').join(' ');
      fullText += pageText + '\n';
    }
    await doc.destroy();
    return parseStatement(normalizePdfText(fullText));
  } catch (e) {
    // Fallback: try pdf-parse (some environments work with it)
    try {
      const req = eval('require');
      const pdfParse = req('pdf-parse/lib/pdf-parse.js');
      const data = await pdfParse(buf);
      return parseStatement(normalizePdfText(data.text || ''));
    } catch (err) {
      throw new Error('PDF parsing failed: ' + String(err || e));
    }
  }
}

function normalizePdfText(text) {
  if (!text) return text;
  // collapse multiple spaces
  let s = text.replace(/\s+/g, ' ');
  // insert line breaks before key labels so they become distinct lines for line-based heuristics
  const labels = ['Account Number', 'Account Number:', 'Account', 'Payment Information', 'Payment Due Date', 'Payment Due', 'Address:', 'Name:', 'Opening/Closing Date', 'Statement Period', 'New Balance', 'Previous Balance', 'Minimum Payment', 'Purchases', 'For Lost or Stolen Card'];
  for (const lab of labels) {
    const re = new RegExp('\\s*' + lab.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'), 'gi');
    s = s.replace(re, '\n' + lab);
  }
  // ensure dashes used as range markers are normalized
  s = s.replace(/\s*[–—]\s*/g, ' - ');
  // collapse multiple newlines
  s = s.replace(/\n+/g, '\n');
  // trim each line and rejoin with single newline
  s = s.split('\n').map(l => l.trim()).filter(Boolean).join('\n');
  return s;
}
