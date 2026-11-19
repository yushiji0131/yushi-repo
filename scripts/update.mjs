#!/usr/bin/env node
// Daily data refresh. No dependencies (Node 20+).
//
//  - Secondary market: in-stock pre-owned Rolex listings on bobswatches.com
//    (public category pages, fetched slowly, robots.txt respected).
//  - US retail (list) price: the per-collection reference tables on the same site.
//  - FX: api.frankfurter.dev (ECB reference rates).
//
// If a source fails, the previous data is kept and the failure is recorded in
// data/meta.json so the site can show how fresh each number really is.

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'data');
const SITE = 'https://www.bobswatches.com';
const UA =
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';
const DELAY_MS = 2000;
const MAX_PAGES = 40;
const HISTORY_DAYS = 730;
const TABLE_SLUGS = [
  'submariner', 'daytona', 'gmt-master-ii', 'gmt-master', 'datejust', 'datejust-ii', 'date',
  'day-date', 'day-date-ii', 'explorer', 'explorer-ii', 'sea-dweller', 'deepsea', 'sky-dweller',
  'yacht-master', 'yacht-master-ii', 'oyster-perpetual', 'air-king', 'milgauss', '1908',
  'land-dweller', 'cellini', 'pearlmaster',
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const today = () => new Date().toISOString().slice(0, 10);
const text = (html) =>
  html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
const money = (s) => {
  const m = /\$\s*([\d,]+)/.exec(s || '');
  return m ? Number(m[1].replace(/,/g, '')) : null;
};
const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : Math.round((s[n / 2 - 1] + s[n / 2]) / 2);
};

async function get(url, tries = 3) {
  for (let i = 1; ; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': UA, 'Accept-Language': 'en-US,en;q=0.9' },
        signal: AbortSignal.timeout(45000),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.text();
    } catch (e) {
      if (i >= tries) throw new Error(`${url}: ${e.message}`);
      await sleep(DELAY_MS * 2 ** i);
    }
  }
}

async function readJson(name, fallback) {
  try {
    return JSON.parse(await readFile(path.join(DATA, name), 'utf8'));
  } catch {
    return fallback;
  }
}
const writeJson = (name, value) =>
  writeFile(path.join(DATA, name), JSON.stringify(value) + '\n');

// ---------- listings ----------

const MATERIALS = [
  [/platinum/i, 'Platinum'],
  [/titanium/i, 'Titanium'],
  [/two[- ]tone|rolesor|steel (?:and|&) .*gold/i, 'Two Tone'],
  [/everose|rose gold|pink gold/i, 'Rose Gold'],
  [/white gold/i, 'White Gold'],
  [/yellow gold|18k gold|\bgold\b/i, 'Yellow Gold'],
  [/steel/i, 'Stainless Steel'],
];
function splitMaterial(line) {
  const hit = MATERIALS.find(([re]) => re.test(line));
  const rest = line
    .replace(/^(Men's|Ladies'?|Women's|Unisex|Midsize)\s+(Watch|Used|Pre-Owned)?\s*/i, '')
    .replace(/stainless steel|two[- ]tone|(18k\s*)?(yellow|white|rose|everose)\s+gold|platinum|titanium/gi, '')
    .replace(/[&,]|\band\b/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return { material: hit ? hit[1] : null, nickname: rest.length > 2 && rest.length < 24 ? rest : '' };
}

// Listing cards carry only the numeric reference; the bezel suffix (LN, LV,
// BLRO ...) is recovered from the product name or its nickname.
const NICK_SUFFIX = [
  [/starbucks|kermit|hulk/i, 'LV'],
  [/pepsi/i, 'BLRO'],
  [/batman|batgirl/i, 'BLNR'],
  [/sprite/i, 'VTNR'],
  [/root ?beer/i, 'CHNR'],
  [/bruce wayne/i, 'GRNR'],
  [/smurf|bluesy/i, 'LB'],
];
function fullRef(ref, hint) {
  const m = new RegExp(`\\b${ref}([A-Z]{2,6})\\b`).exec(hint.toUpperCase());
  if (m && !/^(MM|REF)$/.test(m[1])) return ref + m[1];
  if (/^1[12]\d{4}$/.test(ref)) {
    const n = NICK_SUFFIX.find(([re]) => re.test(hint));
    if (n) return ref + n[1];
  }
  return ref;
}

function parseCards(html) {
  const out = [];
  const parts = html.split('class="seocart_ProductWrapper"').slice(1);
  for (const p of parts) {
    const pick = (re) => {
      const m = re.exec(p);
      return m ? text(m[1]) : '';
    };
    const ref = pick(/seocart_ProductModelNum">(.*?)<\/div>/s).toUpperCase();
    const price = money(pick(/buyPriceText[^>]*>(.*?)<\/span>\s*<a/s).replace(/\s/g, ''));
    const href = (/<a href="(\/[^"]+\.html)"/.exec(p) || [])[1];
    if (!ref || !price || !href || !/^[0-9A-Z-]{3,14}$/.test(ref)) continue;
    const family = pick(/seocart_ProductName">(.*?)<\/div>/s).replace(/^Rolex\s+/i, '');
    const lines = [...p.matchAll(/triline-line-item">(.*?)<\/span>\s*(?=<span class="triline|<\/div>)/gs)].map(
      (m) => text(m[1]),
    );
    const last = lines.find((l) => /\d\s*MM\b/i.test(l)) || '';
    const dialLine = lines.find((l) => /Dial$/i.test(l)) || '';
    const matLine = lines.find((l) => l !== last && l !== dialLine) || '';
    const name = pick(/data-product-name="([^"]*)"/);
    const { material, nickname } = splitMaterial(matLine);
    const img = (/<img src="[^"]*?(\/images\/[^"]+?\.(?:jpe?g|png|webp))"/i.exec(p) || [])[1];
    out.push({
      id: (/data-pid="(\d+)"/.exec(p) || [])[1],
      ref: fullRef(ref, name + ' ' + matLine),
      family,
      name,
      price,
      url: SITE + href,
      img: img ? `${SITE}/cdn-cgi/image/fit=contain,height=640,quality=80,format=auto${img}` : null,
      material,
      nickname,
      dial: dialLine.replace(/\s*Dial$/i, '').trim(),
      size: Number((/(\d{2}(?:\.\d)?)\s*MM/i.exec(last) || [])[1]) || null,
      year: Number((/\(((?:19|20)\d\d)\)/.exec(last) || [])[1]) || null,
      papers: /papers|card/i.test(last),
      box: /box/i.test(last),
      bracelet: (/^(.*?Bracelet|.*?Strap)/i.exec(last) || [])[1]?.trim() || '',
    });
  }
  return out;
}

async function fetchListings() {
  const seen = new Map();
  let lastPage = 1;
  for (let page = 1; page <= Math.min(lastPage, MAX_PAGES); page++) {
    const html = await get(`${SITE}/rolex/${page > 1 ? `?page=${page}` : ''}`);
    if (!html) break;
    if (page === 1) {
      const nums = [...html.matchAll(/[?&]page=(\d+)/g)].map((m) => Number(m[1]));
      lastPage = Math.max(1, ...nums);
    }
    const cards = parseCards(html);
    if (!cards.length) break;
    for (const c of cards) seen.set(c.id || c.url, c);
    console.log(`listings page ${page}/${lastPage}: ${cards.length} (total ${seen.size})`);
    await sleep(DELAY_MS);
  }
  return [...seen.values()];
}

// ---------- reference tables (US retail + approx. pre-owned) ----------

function parseTable(html) {
  const t = /<table class="watchPriceTable[^"]*categoryWatchPriceTable.*?<\/table>/s.exec(html);
  if (!t) return [];
  const rows = [];
  for (const r of t[0].matchAll(/<tr>(.*?)<\/tr>/gs)) {
    const cells = [...r[1].matchAll(/<td[^>]*>(.*?)<\/td>/gs)].map((m) => text(m[1]));
    if (cells.length < 3) continue;
    const m = /^([0-9]{3,6}[A-Z]*)\s*(.*)$/i.exec(cells[0]);
    if (!m) continue;
    rows.push({
      ref: m[1].toUpperCase(),
      variant: m[2],
      retail: money(cells[1]),
      discontinued: /disc/i.test(cells[1]),
      guide: money(cells[2]),
    });
  }
  return rows;
}

async function fetchTables() {
  const rows = [];
  for (const slug of TABLE_SLUGS) {
    try {
      const html = await get(`${SITE}/rolex-${slug}-1.html`);
      const r = html ? parseTable(html) : [];
      console.log(`table ${slug}: ${r.length} rows`);
      rows.push(...r.map((x) => ({ ...x, slug })));
    } catch (e) {
      console.warn(`table ${slug} failed: ${e.message}`);
    }
    await sleep(DELAY_MS);
  }
  return rows;
}

// ---------- aggregation ----------

const digits = (ref) => (/^\d+/.exec(ref) || [''])[0];
const mode = (xs) => {
  const c = new Map();
  for (const x of xs) if (x) c.set(x, (c.get(x) || 0) + 1);
  return [...c.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
};
const uniq = (xs) => [...new Set(xs.filter(Boolean))];

function build(listings, tables, overrides) {
  const byRef = new Map();
  for (const l of listings) {
    if (!byRef.has(l.ref)) byRef.set(l.ref, []);
    byRef.get(l.ref).push(l);
  }

  // Table rows are keyed by base reference (sometimes with a variant note).
  // Attach a row to a listing reference when the reference matches exactly, or
  // when the numeric base matches and the table has a single row for it.
  const tableByBase = new Map();
  for (const t of tables) {
    const k = digits(t.ref);
    if (!tableByBase.has(k)) tableByBase.set(k, []);
    tableByBase.get(k).push(t);
  }
  const tableFor = (ref) => {
    const cands = tableByBase.get(digits(ref)) || [];
    return (
      cands.find((t) => t.ref === ref && !t.variant) ||
      cands.find((t) => t.ref === ref) ||
      (cands.length === 1 ? cands[0] : cands.find((t) => t.ref === digits(ref) && !t.variant)) ||
      null
    );
  };

  const watches = [];
  for (const [ref, ls] of byRef) {
    ls.sort((a, b) => a.price - b.price);
    const prices = ls.map((l) => l.price);
    const med = median(prices);
    const t = tableFor(ref);
    const o = overrides[ref] || {};
    // Retail must be plausible next to the market price; this drops source typos.
    let retail = o.US?.price ?? t?.retail ?? null;
    if (retail && !o.US && (retail > med * 4 || retail < med / 6)) retail = null;
    const withImg = ls.find((l) => l.img) || ls[0];
    watches.push({
      ref,
      family: mode(ls.map((l) => l.family)) || 'Rolex',
      material: mode(ls.map((l) => l.material)),
      nickname: mode(ls.map((l) => l.nickname)),
      size: mode(ls.map((l) => l.size)),
      dials: uniq(ls.map((l) => l.dial)).slice(0, 8),
      years: [Math.min(...ls.map((l) => l.year || 9999)), Math.max(...ls.map((l) => l.year || 0))].map(
        (y) => (y === 9999 || y === 0 ? null : y),
      ),
      img: withImg.img,
      market: { count: ls.length, min: prices[0], median: med, max: prices.at(-1) },
      retailUS: retail,
      retailSource: retail ? (o.US ? o.US.source || 'manual' : 'bobs-table') : null,
      discontinued: t ? t.discontinued : null,
      official: o, // verified local list prices, keyed by market code
      listings: ls.slice(0, 8).map(({ name, price, url, img, dial, year, papers, box, bracelet }) => ({
        name, price, url, img, dial, year, papers, box, bracelet,
      })),
    });
  }
  watches.sort((a, b) => b.market.count - a.market.count || a.ref.localeCompare(b.ref));
  return watches;
}

// ---------- main ----------

async function main() {
  await mkdir(DATA, { recursive: true });
  const date = today();
  const meta = await readJson('meta.json', {});
  const overrides = await readJson('official-overrides.json', {});
  delete overrides._comment;
  const errors = [];

  // FX
  try {
    const fx = JSON.parse(await get('https://api.frankfurter.dev/v1/latest?base=USD'));
    if (!fx?.rates?.EUR) throw new Error('unexpected FX payload');
    await writeJson('fx.json', { base: 'USD', date: fx.date, rates: { USD: 1, ...fx.rates } });
    meta.fx = { updated: date, rateDate: fx.date };
    console.log(`fx ok (${fx.date})`);
  } catch (e) {
    errors.push(`fx: ${e.message}`);
  }

  // Market + retail tables
  try {
    const listings = await fetchListings();
    const prev = await readJson('watches.json', []);
    const prevCount = prev.reduce((n, w) => n + w.market.count, 0);
    if (listings.length < 100 || listings.length < prevCount * 0.4) {
      throw new Error(`only ${listings.length} listings parsed (previous ${prevCount}); keeping old data`);
    }
    let tables = await fetchTables();
    if (!tables.length) {
      tables = await readJson('tables.json', []);
      errors.push('tables: none parsed, reused previous');
    } else {
      await writeJson('tables.json', tables);
    }
    const watches = build(listings, tables, overrides);
    await writeJson('watches.json', watches);

    const history = await readJson('history.json', {});
    for (const w of watches) {
      const h = (history[w.ref] ||= []);
      const row = [date, w.market.median, w.market.count, w.market.min];
      if (h.length && h.at(-1)[0] === date) h[h.length - 1] = row;
      else h.push(row);
      if (h.length > HISTORY_DAYS) h.splice(0, h.length - HISTORY_DAYS);
    }
    await writeJson('history.json', history);
    meta.market = { updated: date, listings: listings.length, references: watches.length };
    console.log(`market ok: ${listings.length} listings, ${watches.length} references`);
  } catch (e) {
    errors.push(`market: ${e.message}`);
  }

  meta.lastRun = new Date().toISOString();
  meta.errors = errors;
  await writeJson('meta.json', meta);
  if (errors.length) {
    console.error('Completed with errors:\n - ' + errors.join('\n - '));
    process.exitCode = 1;
  }
}

main();
