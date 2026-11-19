import { COLLECTIONS, OTHER, collectionOf, MATERIAL_ZH, DIAL_ZH, MARKETS } from './collections.js';

const $ = (s, el = document) => el.querySelector(s);
const app = $('#app');
const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

const store = {
  get(k, d) { try { return localStorage.getItem(k) ?? d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
};

const state = {
  watches: [], history: {}, fx: { rates: { USD: 1 } }, meta: {},
  currency: store.get('currency', 'CNY'),
  q: '', collection: 'all', material: 'all', sort: 'popular', retailOnly: false, shown: 48,
};

// ---------- formatting ----------

const CUR_ZH = {
  CNY: '人民币', USD: '美元', HKD: '港币', JPY: '日元', EUR: '欧元', GBP: '英镑', CHF: '瑞士法郎',
  SGD: '新加坡元', AUD: '澳元', CAD: '加元', KRW: '韩元',
};
const rate = (cur) => state.fx.rates[cur] || null;
const conv = (usd, cur = state.currency) => (usd == null || !rate(cur) ? null : usd * rate(cur));
function money(amount, cur = state.currency) {
  if (amount == null) return '—';
  const step = amount >= 1e6 ? 1000 : amount >= 1e5 ? 100 : 10;
  const v = cur === 'USD' ? amount : Math.round(amount / step) * step;
  return new Intl.NumberFormat('zh-CN', { style: 'currency', currency: cur, maximumFractionDigits: 0, currencyDisplay: 'symbol' }).format(v);
}
const usd = (v) => money(conv(v));
const pct = (v) => (v > 0 ? '+' : v < 0 ? '−' : '') + Math.abs(v).toFixed(0) + '%';
const premium = (w) => (w.retailUS ? ((w.market.median - w.retailUS) / w.retailUS) * 100 : null);
const matZh = (m) => MATERIAL_ZH[m] || m || '';
const dialZh = (d) => (DIAL_ZH[d] ? `${DIAL_ZH[d]}色` : d);

function premiumTag(w) {
  const p = premium(w);
  if (p == null) return '';
  const cls = p > 3 ? 'up' : p < -3 ? 'down' : 'flat';
  const word = p > 3 ? '高于公价' : p < -3 ? '低于公价' : '接近公价';
  return `<span class="tag ${cls}" title="二手中位价相对美国公价">${word} ${pct(p)}</span>`;
}

const PLACEHOLDER =
  "data:image/svg+xml," +
  encodeURIComponent(
    `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200 200'><rect width='200' height='200' fill='none'/><circle cx='100' cy='100' r='62' fill='none' stroke='#9aa39d' stroke-width='6'/><circle cx='100' cy='100' r='48' fill='none' stroke='#c5cbc7' stroke-width='2'/><path d='M100 62v38l22 14' fill='none' stroke='#9aa39d' stroke-width='5' stroke-linecap='round'/><rect x='84' y='18' width='32' height='22' rx='4' fill='#c5cbc7'/><rect x='84' y='160' width='32' height='22' rx='4' fill='#c5cbc7'/></svg>`,
  );
const img = (src, alt, cls = '') =>
  `<img class="${cls}" src="${esc(src || PLACEHOLDER)}" alt="${esc(alt)}" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.onerror=null;this.src='${PLACEHOLDER}'">`;

// ---------- list view ----------

function filtered() {
  const q = state.q.trim().toLowerCase();
  const terms = q.split(/\s+/).filter(Boolean);
  let xs = state.watches.filter((w) => {
    if (state.collection !== 'all' && w.col.id !== state.collection) return false;
    if (state.material !== 'all' && w.material !== state.material) return false;
    if (state.retailOnly && !w.retailUS) return false;
    return terms.every((t) => w.hay.includes(t));
  });
  const by = {
    popular: (a, b) => b.market.count - a.market.count,
    low: (a, b) => a.market.median - b.market.median,
    high: (a, b) => b.market.median - a.market.median,
    premium: (a, b) => (premium(b) ?? -1e9) - (premium(a) ?? -1e9),
    discount: (a, b) => (premium(a) ?? 1e9) - (premium(b) ?? 1e9),
  }[state.sort];
  return xs.sort(by);
}

function card(w) {
  return `<a class="card" href="#/w/${encodeURIComponent(w.ref)}">
    <div class="card-img">${img(w.img, `${w.family} ${w.ref}`)}</div>
    <div class="card-body">
      <div class="card-top"><span class="ref">${esc(w.ref)}</span>${w.nickname ? `<span class="nick">${esc(w.nickname)}</span>` : ''}</div>
      <div class="fam">${esc(w.family)} · ${esc(matZh(w.material))}${w.size ? ` · ${w.size} mm` : ''}</div>
      <div class="price">${usd(w.market.median)}<small>二手中位价 · ${w.market.count} 只在售</small></div>
      <div class="card-foot">${w.retailUS ? `<span class="muted">公价 ${usd(w.retailUS)}</span>${premiumTag(w)}` : `<span class="muted">${w.discontinued ? '已停产' : '暂无公价数据'}</span>`}</div>
    </div></a>`;
}

function renderList() {
  const xs = filtered();
  const counts = {};
  for (const w of state.watches) counts[w.col.id] = (counts[w.col.id] || 0) + 1;
  const cols = [...COLLECTIONS, OTHER].filter((c) => counts[c.id]);
  const mats = [...new Set(state.watches.map((w) => w.material).filter(Boolean))];
  const col = cols.find((c) => c.id === state.collection);
  const chip = (id, label, n) =>
    `<button class="chip${state.collection === id ? ' on' : ''}" data-col="${id}" aria-pressed="${state.collection === id}">${esc(label)}<i>${n}</i></button>`;

  app.innerHTML = `
    <section class="hero">
      <h1>劳力士型号与行情</h1>
      <p>${state.watches.length} 个型号、${state.meta.market?.listings ?? '—'} 只在售腕表的二手标价统计，配合美国公价与各地区折算价。数据每日更新。</p>
    </section>
    <div class="chips" role="group" aria-label="按系列筛选">
      ${chip('all', '全部', state.watches.length)}${cols.map((c) => chip(c.id, c.name, counts[c.id])).join('')}
    </div>
    ${col && col.review ? collectionPanel(col, true) : ''}
    <div class="bar">
      <label>材质 <select id="material"><option value="all">全部</option>${mats.map((m) => `<option value="${esc(m)}"${state.material === m ? ' selected' : ''}>${esc(matZh(m))}</option>`).join('')}</select></label>
      <label>排序 <select id="sort">
        ${[['popular', '在售数量'], ['low', '价格从低到高'], ['high', '价格从高到低'], ['premium', '溢价最高'], ['discount', '最接近或低于公价']].map(([v, l]) => `<option value="${v}"${state.sort === v ? ' selected' : ''}>${l}</option>`).join('')}
      </select></label>
      <label class="check"><input type="checkbox" id="retailOnly"${state.retailOnly ? ' checked' : ''}> 只看有公价的型号</label>
      <span class="count">${xs.length} 个型号</span>
    </div>
    ${xs.length ? `<div class="grid">${xs.slice(0, state.shown).map(card).join('')}</div>` : `<p class="empty">没有符合条件的型号。<button class="link" id="reset">清除筛选</button></p>`}
    ${xs.length > state.shown ? `<div class="more"><button class="btn" id="more">显示更多（还有 ${xs.length - state.shown} 个）</button></div>` : ''}`;
}

function collectionPanel(c, compact) {
  const specs = Object.entries(c.specs).map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join('');
  return `<section class="panel col-panel">
    <h2>${esc(c.name)} <span class="muted">${esc(c.zh)}</span></h2>
    <p class="lead">${esc(c.tagline)}</p>
    <p>${esc(c.review)}</p>
    ${specs ? `<dl class="specs">${specs}</dl>` : ''}
    ${compact ? '' : proscons(c)}
  </section>`;
}
const proscons = (c) =>
  c.pros.length
    ? `<div class="pc"><div><h3>优点</h3><ul>${c.pros.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div><div><h3>需要考虑</h3><ul>${c.cons.map((p) => `<li>${esc(p)}</li>`).join('')}</ul></div></div>`
    : '';

// ---------- detail view ----------

function rangeBar(w) {
  const { min, median, max } = w.market;
  const lo = Math.min(min, w.retailUS ?? min), hi = Math.max(max, w.retailUS ?? max);
  const span = hi - lo || 1;
  const x = (v) => (((v - lo) / span) * 100).toFixed(2);
  return `<div class="range" role="img" aria-label="二手标价区间 ${usd(min)} 至 ${usd(max)}，中位 ${usd(median)}${w.retailUS ? `，公价 ${usd(w.retailUS)}` : ''}">
    <div class="range-track"><div class="range-fill" style="left:${x(min)}%;width:${Math.max(1, x(max) - x(min))}%"></div>
      <div class="range-med" style="left:${x(median)}%"></div>
      ${w.retailUS ? `<div class="range-retail" style="left:${x(w.retailUS)}%"></div>` : ''}</div>
    <div class="range-legend"><span><i class="k fill"></i>二手标价区间 ${usd(min)} – ${usd(max)}</span><span><i class="k med"></i>中位 ${usd(median)}</span>${w.retailUS ? `<span><i class="k retail"></i>公价 ${usd(w.retailUS)}</span>` : ''}</div>
  </div>`;
}

function historyChart(ref) {
  const h = state.history[ref] || [];
  if (h.length < 2) {
    return `<p class="muted note">价格走势从 ${esc(h[0]?.[0] || '今天')} 开始记录，每天新增一个数据点，累积两天以上后这里会显示走势图。</p>`;
  }
  const W = 720, H = 220, L = 8, R = 8, T = 16, B = 26;
  const vals = h.map((r) => conv(r[1]));
  let lo = Math.min(...vals), hi = Math.max(...vals);
  if (hi === lo) { hi *= 1.02; lo *= 0.98; }
  const pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
  const X = (i) => L + (i / (h.length - 1)) * (W - L - R);
  const Y = (v) => T + (1 - (v - lo) / (hi - lo)) * (H - T - B);
  const pts = vals.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(' ');
  const grid = [0, 0.5, 1].map((f) => {
    const v = lo + pad + f * (hi - lo - 2 * pad);
    return `<line x1="${L}" x2="${W - R}" y1="${Y(v)}" y2="${Y(v)}" class="g"/><text x="${L}" y="${Y(v) - 5}" class="t">${money(v)}</text>`;
  }).join('');
  return `<figure class="chart" data-ref="${esc(ref)}">
    <svg viewBox="0 0 ${W} ${H}" role="img" aria-label="二手中位价走势，${h[0][0]} 至 ${h.at(-1)[0]}">
      ${grid}
      <polyline points="${pts}" class="ln"/>
      <circle cx="${X(h.length - 1)}" cy="${Y(vals.at(-1))}" r="4" class="dot"/>
      <text x="${L}" y="${H - 6}" class="t">${h[0][0]}</text><text x="${W - R}" y="${H - 6}" class="t" text-anchor="end">${h.at(-1)[0]}</text>
      <line class="cross" y1="${T}" y2="${H - B}" hidden/><circle class="dot hover" r="5" hidden/>
    </svg>
    <div class="tip" hidden></div>
    <figcaption>二手中位价（${CUR_ZH[state.currency] || state.currency}，按当日汇率折算）</figcaption>
  </figure>`;
}

function wireChart() {
  const fig = $('.chart');
  if (!fig) return;
  const h = state.history[fig.dataset.ref];
  const svg = $('svg', fig), tip = $('.tip', fig), cross = $('.cross', fig), dot = $('.dot.hover', fig);
  const pts = $('polyline', fig).getAttribute('points').split(' ').map((p) => p.split(',').map(Number));
  const move = (e) => {
    const r = svg.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * 720;
    let i = 0;
    pts.forEach((p, k) => { if (Math.abs(p[0] - px) < Math.abs(pts[i][0] - px)) i = k; });
    cross.setAttribute('x1', pts[i][0]); cross.setAttribute('x2', pts[i][0]);
    dot.setAttribute('cx', pts[i][0]); dot.setAttribute('cy', pts[i][1]);
    cross.hidden = dot.hidden = tip.hidden = false;
    tip.innerHTML = `<b>${usd(h[i][1])}</b><span>${h[i][0]} · ${h[i][2]} 只在售</span>`;
    const left = (pts[i][0] / 720) * r.width;
    tip.style.left = `${Math.min(Math.max(left, 70), r.width - 70)}px`;
  };
  svg.addEventListener('pointermove', move);
  svg.addEventListener('pointerdown', move);
  svg.addEventListener('pointerleave', () => { cross.hidden = dot.hidden = tip.hidden = true; });
}

function worldTable(w) {
  if (!w.retailUS) {
    return `<p class="muted note">这个型号${w.discontinued ? '已停产，' : ''}暂无官方公价数据。下面的二手行情仍可按右上角所选货币查看。</p>`;
  }
  const rows = MARKETS.map((m) => {
    const o = w.official?.[m.code];
    const r = rate(m.cur);
    const local = o?.price ?? (r ? w.retailUS * r : null);
    const inSel = o?.price ? (r ? (o.price / r) * rate(state.currency) : null) : conv(w.retailUS);
    const verified = !!o?.price || m.code === 'US';
    return `<tr><th scope="row">${m.zh}</th><td class="num">${money(local, m.cur)}</td><td class="num">${money(inSel)}</td>
      <td>${verified ? `<span class="tag flat">${m.code === 'US' && !o?.price ? '美国公价' : '已核实'}</span>${o?.asOf ? ` <span class="muted">${esc(o.asOf)}</span>` : ''}` : '<span class="muted">汇率折算</span>'}</td></tr>`;
  }).join('');
  return `<div class="tablewrap"><table class="world">
    <thead><tr><th>地区</th><th class="num">当地货币</th><th class="num">折合${CUR_ZH[state.currency] || state.currency}</th><th>来源</th></tr></thead>
    <tbody>${rows}</tbody></table></div>
    <p class="muted note">“汇率折算”是按 ${esc(state.fx.date || '')} 汇率把美国公价换算成当地货币，并非该地区的官方定价；各地实际公价因税率与定价策略不同会有差异，请以 <a href="https://www.rolex.com/" target="_blank" rel="noopener">rolex.com</a> 当地页面为准。</p>`;
}

function renderDetail(ref) {
  const w = state.watches.find((x) => x.ref === ref);
  if (!w) {
    app.innerHTML = `<p class="empty">没有找到型号 ${esc(ref)}，它可能今天没有在售记录。<a href="#/">返回全部型号</a></p>`;
    return;
  }
  const c = w.col;
  const p = premium(w);
  const years = w.years[0] ? (w.years[0] === w.years[1] ? `${w.years[0]}` : `${w.years[0]} – ${w.years[1]}`) : '—';
  const q = encodeURIComponent(`Rolex ${w.ref}`);
  const links = [
    ['Hodinkee', `https://www.hodinkee.com/search?q=${q}`],
    ['Fratello', `https://www.fratellowatches.com/?s=${q}`],
    ['Monochrome', `https://monochrome-watches.com/?s=${q}`],
    ['YouTube 视频评测', `https://www.youtube.com/results?search_query=${q}+review`],
    ['Chrono24 在售', `https://www.chrono24.com/search/index.htm?query=${q}`],
  ];
  app.innerHTML = `
    <nav class="crumb"><a href="#/">全部型号</a> / <a href="#/" data-col="${c.id}">${esc(c.name)}</a> / <span>${esc(w.ref)}</span></nav>
    <section class="detail">
      <div class="detail-img">${img(w.img, `${w.family} ${w.ref}`)}<p class="muted credit">图片为在售实物，来自 Bob's Watches</p></div>
      <div class="detail-main">
        <h1>${esc(w.family)} <span class="ref">${esc(w.ref)}</span></h1>
        <p class="sub">${[w.nickname, matZh(w.material), w.size && `${w.size} mm`, w.discontinued ? '已停产' : ''].filter(Boolean).map(esc).join(' · ')}</p>
        <div class="stats">
          <div><span>二手中位价</span><b>${usd(w.market.median)}</b><small>${w.market.count} 只在售</small></div>
          <div><span>美国公价</span><b>${w.retailUS ? usd(w.retailUS) : '—'}</b><small>${w.retailUS ? money(w.retailUS, 'USD') : w.discontinued ? '已停产' : '暂无数据'}</small></div>
          <div><span>相对公价</span><b class="${p == null ? '' : p > 3 ? 'up' : p < -3 ? 'down' : ''}">${p == null ? '—' : pct(p)}</b><small>${p == null ? '' : p > 3 ? '二手更贵' : p < -3 ? '二手更便宜' : '基本持平'}</small></div>
        </div>
        ${rangeBar(w)}
        <dl class="specs">
          <div><dt>在售年份</dt><dd>${years}</dd></div>
          <div><dt>表盘</dt><dd>${w.dials.length ? w.dials.map(dialZh).map(esc).join('、') : '—'}</dd></div>
          ${Object.entries(c.specs).map(([k, v]) => `<div><dt>${esc(k)}<i class="muted">（系列现行）</i></dt><dd>${esc(v)}</dd></div>`).join('')}
        </dl>
      </div>
    </section>

    <section class="panel"><h2>价格走势</h2>${historyChart(w.ref)}</section>
    <section class="panel"><h2>各地区公价参考</h2>${worldTable(w)}</section>

    <section class="panel"><h2>在售二手（按价格从低到高）</h2>
      <ul class="listings">${w.listings.map((l) => `<li><a href="${esc(l.url)}" target="_blank" rel="noopener">
        ${img(l.img, l.name)}
        <span class="l-main"><b>${usd(l.price)}</b><span class="muted">${money(l.price, 'USD')}</span></span>
        <span class="l-desc">${[l.year, l.dial && dialZh(l.dial) + '盘', l.bracelet, l.box && l.papers ? '盒证齐全' : l.box ? '有表盒' : l.papers ? '有保卡' : ''].filter(Boolean).map(esc).join(' · ')}</span>
      </a></li>`).join('')}</ul>
      ${w.market.count > w.listings.length ? `<p class="muted note">共 ${w.market.count} 只在售，这里显示最便宜的 ${w.listings.length} 只。</p>` : ''}
    </section>

    ${c.review ? `<section class="panel"><h2>系列评测：${esc(c.name)}</h2><p class="lead">${esc(c.tagline)}</p><p>${esc(c.review)}</p>${proscons(c)}</section>` : ''}
    <section class="panel"><h2>延伸阅读</h2><p class="muted">在专业媒体中搜索 ${esc(w.ref)} 的评测与行情：</p>
      <div class="links">${links.map(([n, u]) => `<a class="btn ghost" href="${u}" target="_blank" rel="noopener">${n}</a>`).join('')}</div></section>`;
  wireChart();
}

// ---------- routing & events ----------

function route() {
  const m = /^#\/w\/(.+)$/.exec(location.hash);
  if (m) renderDetail(decodeURIComponent(m[1]));
  else renderList();
}
function go() {
  if (/^#\/w\//.test(location.hash)) location.hash = '#/';
  else renderList();
}

app.addEventListener('click', (e) => {
  const col = e.target.closest('[data-col]');
  if (col) {
    state.collection = col.dataset.col; state.shown = 48;
    if (col.tagName === 'A') return; // breadcrumb: hashchange re-renders
    renderList();
  } else if (e.target.id === 'more') { state.shown += 48; renderList(); }
  else if (e.target.id === 'reset') {
    Object.assign(state, { q: '', collection: 'all', material: 'all', retailOnly: false });
    $('#q').value = ''; renderList();
  }
});
app.addEventListener('change', (e) => {
  if (e.target.id === 'material') state.material = e.target.value;
  else if (e.target.id === 'sort') state.sort = e.target.value;
  else if (e.target.id === 'retailOnly') state.retailOnly = e.target.checked;
  else return;
  state.shown = 48; renderList();
});
$('#q').addEventListener('input', (e) => { state.q = e.target.value; state.shown = 48; go(); });
$('#currency').addEventListener('change', (e) => { state.currency = e.target.value; store.set('currency', state.currency); route(); });
window.addEventListener('hashchange', () => { route(); window.scrollTo(0, 0); });

// ---------- boot ----------

async function load(name) {
  const r = await fetch(`data/${name}.json`, { cache: 'no-cache' });
  if (!r.ok) throw new Error(`${name}: ${r.status}`);
  return r.json();
}

try {
  const [watches, fx, meta, history] = await Promise.all([
    load('watches'), load('fx'), load('meta'), load('history').catch(() => ({})),
  ]);
  for (const w of watches) {
    w.col = collectionOf(w.family);
    w.hay = [w.ref, w.family, w.nickname, w.material, matZh(w.material), w.col.name, w.col.zh, ...w.dials].join(' ').toLowerCase();
  }
  Object.assign(state, { watches, fx, meta, history });
  if (!rate(state.currency)) state.currency = 'USD';
  $('#currency').innerHTML = Object.keys(CUR_ZH).filter(rate)
    .map((c) => `<option value="${c}"${c === state.currency ? ' selected' : ''}>${CUR_ZH[c]} ${c}</option>`).join('');
  const stale = meta.market?.updated && (Date.now() - new Date(meta.market.updated)) / 864e5 > 2;
  $('#fresh').innerHTML = `二手行情更新于 <b>${esc(meta.market?.updated || '—')}</b>（来源：Bob's Watches 在售标价）· 汇率 ${esc(fx.date || '—')}（来源：欧洲央行参考汇率）${stale ? ' · <span class="warn">数据已超过两天未更新</span>' : ''}`;
  route();
} catch (err) {
  app.innerHTML = `<p class="empty">数据加载失败：${esc(err.message)}。请稍后刷新重试。</p>`;
}
