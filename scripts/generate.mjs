// Generates every SVG used by the profile README.
// Static pieces (header, projects, stack) + data-driven pieces (stats, calango).
//   node scripts/generate.mjs            -> real data (needs GITHUB_TOKEN)
//   node scripts/generate.mjs --mock     -> fake data, for local previews
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";

const LOGIN = process.env.GH_LOGIN || "jsabadell";
const OUT = new URL("../assets/", import.meta.url);
mkdirSync(OUT, { recursive: true });
const save = (name, svg) => writeFileSync(new URL(name, OUT), svg.trim() + "\n");

const MONO = `ui-monospace,'JetBrains Mono','Cascadia Code','Fira Code',SFMono-Regular,Menlo,Consolas,monospace`;
const SANS = `-apple-system,BlinkMacSystemFont,'Segoe UI','Noto Sans',Helvetica,Arial,sans-serif`;

const THEMES = {
  dark: {
    bg: "#0d1117", surface: "#121a15", border: "#22302a", text: "#e6efe8", muted: "#8aa293",
    accent: "#a3e635", accent2: "#f59e0b", accent3: "#fb7185", accent4: "#2dd4bf",
    chip: "#18231c", empty: "#161b22", levels: ["#1d3b28", "#2e6b3e", "#4fa35a", "#a3e635"],
  },
  light: {
    bg: "#ffffff", surface: "#f6faf7", border: "#d5e2d9", text: "#0f1a13", muted: "#5b6f62",
    accent: "#4d7c0f", accent2: "#b45309", accent3: "#be123c", accent4: "#0f766e",
    chip: "#eaf3ec", empty: "#ebedf0", levels: ["#c6e9b4", "#8fd17a", "#4fa35a", "#2b7a3a"],
  },
};
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* ------------------------------------------------------------------ header */
function header() {
  const W = 860, H = 300;
  // rotating "currently building ..." line, typed letter by letter
  const prefix = "Currently building ";
  const phrases = [
    { t: "AI assistants over live data", c: "#a3e635" },
    { t: "a manufacturing execution system", c: "#f59e0b" },
    { t: "a professional network for football", c: "#fb7185" },
  ];
  const slot = 4.2, cycle = slot * phrases.length, cw = 9.6, px = 56, py = 172;
  const startX = px + prefix.length * cw;
  let rot = "", defs = "";
  phrases.forEach((p, i) => {
    const n = p.t.length, t0 = i * slot, typeDur = n * 0.045, hold = slot - 0.5;
    const times = [0], vals = [0];
    for (let k = 1; k <= n; k++) { times.push(t0 + (k / n) * typeDur); vals.push(k * cw + 2); }
    times.push(t0 + hold); vals.push(0);
    if (t0 > 0) { times.splice(1, 0, t0); vals.splice(1, 0, 0); }
    const kt = times.map((x) => (x / cycle).toFixed(4));
    if (kt[kt.length - 1] !== "1.0000") { kt.push("1"); vals.push(0); }
    defs += `<clipPath id="r${i}"><rect x="${startX}" y="${py - 20}" height="30" width="0">
      <animate attributeName="width" dur="${cycle}s" repeatCount="indefinite" calcMode="discrete" keyTimes="${kt.join(";")}" values="${vals.join(";")}"/></rect></clipPath>`;
    rot += `<text x="${startX}" y="${py}" fill="${p.c}" clip-path="url(#r${i})">${esc(p.t)}</text>`;
  });
  // route: three stops joined by a line with a travelling dot
  const stops = [
    { name: "Brazil", note: "roots", c: "#a3e635" },
    { name: "Netherlands", note: "Fontys, Software Engineering", c: "#f59e0b" },
    { name: "Barcelona", note: "home base", c: "#fb7185" },
  ];
  const ry = 232, rx0 = px + 6, rgap = 230;
  let route = `<path d="M${rx0} ${ry} H${rx0 + 2 * rgap}" stroke="#2a3a30" stroke-width="2" stroke-dasharray="3 5"/>
    <circle r="3.5" fill="#e6efe8"><animate attributeName="cx" values="${rx0};${rx0 + 2 * rgap}" dur="5s" repeatCount="indefinite"/>
      <animate attributeName="opacity" values="0;1;1;0" keyTimes="0;.1;.9;1" dur="5s" repeatCount="indefinite"/><set attributeName="cy" to="${ry}"/></circle>`;
  stops.forEach((s, i) => {
    const x = rx0 + i * rgap;
    route += `<circle cx="${x}" cy="${ry}" r="9" fill="${s.c}" opacity=".18"/><circle cx="${x}" cy="${ry}" r="5" fill="${s.c}"/>
      <text x="${x - 6}" y="${ry + 30}" font-family="${SANS}" font-size="15" font-weight="700" fill="#e6efe8">${s.name}</text>
      <text x="${x - 6}" y="${ry + 49}" font-family="${SANS}" font-size="12.5" fill="#7d9586">${esc(s.note)}</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>${defs}
    <linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a3e635" stop-opacity=".35"/><stop offset=".55" stop-color="#2dd4bf" stop-opacity=".08"/><stop offset="1" stop-color="#fb7185" stop-opacity=".3"/></linearGradient>
    <radialGradient id="blob" cx="85%" cy="20%" r="55%"><stop offset="0" stop-color="#a3e635" stop-opacity=".16"/><stop offset="1" stop-color="#a3e635" stop-opacity="0"/></radialGradient>
    <style>
      .skin{animation:cham 8s ease-in-out infinite}.leg{fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;animation:chamS 8s ease-in-out infinite}
      @keyframes cham{0%,100%{fill:#a3e635}33%{fill:#2dd4bf}66%{fill:#f59e0b}}@keyframes chamS{0%,100%{stroke:#a3e635}33%{stroke:#2dd4bf}66%{stroke:#f59e0b}}
      .spot{fill:#1a2e05;opacity:.4}.legA,.legB{animation:none}
      .tongue{fill:none;stroke:#fb7185;stroke-width:1.4;stroke-linecap:round;transform-origin:6px 0;animation:flick 2.6s ease-out infinite}
      @keyframes flick{0%,80%{transform:scaleX(0)}88%{transform:scaleX(1)}96%,100%{transform:scaleX(0)}}
      .bob{animation:bob 3.2s ease-in-out infinite}@keyframes bob{0%,100%{transform:translate(0,0)}50%{transform:translate(0,-4px)}}
      .cur{animation:blink 1s steps(1) infinite}@keyframes blink{50%{opacity:0}}
    </style>
  </defs>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="#0b100d"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="url(#blob)"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="18" fill="none" stroke="url(#edge)" stroke-width="1.5"/>
  <text x="${px}" y="96" font-family="${SANS}" font-size="50" font-weight="800" fill="#f1f7f2" letter-spacing="-1.2">Jordi Sabadell</text>
  <text x="${px + 2}" y="130" font-family="${SANS}" font-size="19" fill="#9fb5a7">Full-stack software engineer</text>
  <g font-family="${MONO}" font-size="16">
    <text x="${px}" y="${py}" fill="#6f8578">${prefix}</text>${rot}
  </g>
  ${route}
  <g transform="translate(735 150) rotate(-30) scale(3.1)"><g class="bob">${lizard()}</g></g>
</svg>`;
}

/* -------------------------------------------------------------------- work */
const ICONS = JSON.parse(readFileSync(new URL("./icons.json", import.meta.url), "utf8"));
const icon = (name, x, y, size, fill) => ICONS[name]
  ? `<g transform="translate(${x} ${y}) scale(${(size / 24).toFixed(4)})"><path d="${ICONS[name]}" fill="${fill}"/></g>` : "";
// colours match the rotating phrases in the header
const WORK = [
  { name: "IRKO", role: "Software Engineering Intern", when: "Since Sep 2026", color: "accent",
    lines: ["AI assistant inside IRKO's fiscal and accounting portal. Answers questions", "about live data in plain language, scoped to what each user can see."],
    stack: ["Django", "Celery", "Next.js", "Claude"] },
  { name: "Stadio", role: "Full-Stack Engineer, contract", when: "Since May 2026", color: "accent3",
    lines: ["Sole engineer on a football networking platform. Shipped error monitoring", "and closed 6 auth vulnerabilities across RPCs and edge functions."],
    stack: ["React", "TypeScript", "Supabase", "Sentry"] },
  { name: "Creme Climbing", role: "Full-Stack Engineer, contract", when: "Since Mar 2026", color: "accent2",
    lines: ["Manufacturing execution system built from scratch for a climbing holds", "manufacturer, replacing Excel-based production tracking."],
    stack: ["FastAPI", "Next.js", "PostgreSQL", "Docker"] },
];
function tag(name, x, y, c, th) {
  const w = name.length * 7.1 + (ICONS[name] ? 40 : 22);
  return { w, svg: `<rect x="${x}" y="${y}" width="${w}" height="26" rx="7" fill="${c}" fill-opacity=".1" stroke="${c}" stroke-opacity=".32"/>
    ${icon(name, x + 10, y + 6, 14, c)}
    <text x="${x + (ICONS[name] ? 31 : 11)}" y="${y + 17.5}" font-family="${MONO}" font-size="12" fill="${th.text}">${esc(name)}</text>` };
}
function work(th) {
  const W = 880, rowH = 158, H = WORK.length * rowH - 12, rail = 14, px = 44;
  let out = `<path d="M${rail} 30 V${H - rowH + 42}" stroke="${th.border}" stroke-width="2"/>`;
  WORK.forEach((w, i) => {
    const y = i * rowH, c = th[w.color];
    out += `<circle cx="${rail}" cy="${y + 34}" r="11" fill="${c}" fill-opacity=".16"/><circle cx="${rail}" cy="${y + 34}" r="5.5" fill="${c}"/>
      <rect x="${px}" y="${y + 0.5}" width="${W - px - 1}" height="${rowH - 14}" rx="14" fill="${th.surface}" stroke="${th.border}"/>
      <rect x="${px}" y="${y + 18}" width="3" height="32" rx="1.5" fill="${c}"/>
      <text x="${px + 24}" y="${y + 41}" font-family="${SANS}" font-size="19" font-weight="700" fill="${th.text}">${esc(w.name)}</text>
      <text x="${px + 24 + w.name.length * 11.2 + 12}" y="${y + 41}" font-family="${SANS}" font-size="13" fill="${th.muted}">${esc(w.role)}</text>
      <rect x="${W - 150}" y="${y + 21}" width="128" height="26" rx="13" fill="${c}" fill-opacity=".12"/>
      <text x="${W - 86}" y="${y + 38.5}" text-anchor="middle" font-family="${SANS}" font-size="12" font-weight="600" fill="${c}">${esc(w.when)}</text>
      ${w.lines.map((l, k) => `<text x="${px + 24}" y="${y + 70 + k * 20}" font-family="${SANS}" font-size="14" fill="${th.text}" opacity=".85">${esc(l)}</text>`).join("")}`;
    let tx = px + 24;
    for (const n of w.stack) { const t = tag(n, tx, y + 102, c, th); out += t.svg; tx += t.w + 8; }
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${out}</svg>`;
}

/* ------------------------------------------------------------------- stack */
const STACK = [
  { title: "FRONTEND", color: "accent4", items: ["TypeScript", "JavaScript", "React", "Next.js", "HTML", "CSS", "Tailwind", "Expo"] },
  { title: "BACKEND", color: "accent2", items: ["Python", "Java", "FastAPI", "Django", "Celery", "Redis"] },
  { title: "DATA & AI", color: "accent", items: ["PostgreSQL", "SQL", "Supabase", "Claude"] },
  { title: "INFRA & TOOLS", color: "accent3", items: ["Docker", "GitHub Actions", "Railway", "Sentry", "Linux", "Vite", "Figma"] },
];
function stack(th) {
  const W = 880, gw = 212, gap = (W - 4 * gw) / 3, tw = 102, th_ = 38, rows = Math.max(...STACK.map((g) => Math.ceil(g.items.length / 2)));
  const H = 30 + rows * (th_ + 8);
  let out = "";
  STACK.forEach((g, gi) => {
    const gx = gi * (gw + gap), c = th[g.color];
    out += `<rect x="${gx}" y="4" width="16" height="3" rx="1.5" fill="${c}"/>
      <text x="${gx + 24}" y="10" font-family="${SANS}" font-size="11" font-weight="700" letter-spacing="1.4" fill="${th.muted}">${esc(g.title)}</text>`;
    g.items.forEach((n, k) => {
      const x = gx + (k % 2) * (tw + 8), y = 24 + Math.floor(k / 2) * (th_ + 8);
      const label = n.length > 11 ? n.replace("GitHub ", "GH ") : n;
      out += `<g><title>${esc(n)}</title><rect x="${x + 0.5}" y="${y + 0.5}" width="${tw - 1}" height="${th_ - 1}" rx="9" fill="${th.surface}" stroke="${th.border}"/>
        ${icon(n, x + 10, y + 10.5, 16, c)}
        <text x="${x + 33}" y="${y + 23.5}" font-family="${SANS}" font-size="12" fill="${th.text}">${esc(label)}</text></g>`;
    });
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${out}</svg>`;
}

/* -------------------------------------------------------------------- data */
async function gql(query, variables) {
  const r = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${(process.env.PROFILE_TOKEN || process.env.GITHUB_TOKEN)}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
}
const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
// The public calendar page is what the profile itself renders, so it already
// includes private contributions (when that profile setting is on).
async function scrapeRange(from, to) {
  const url = `https://github.com/users/${LOGIN}/contributions` + (from ? `?from=${from}&to=${to}` : "");
  const r = await fetch(url, { headers: { "User-Agent": "profile-assets", Accept: "text/html" } });
  if (!r.ok) throw new Error(`calendar ${r.status}`);
  const html = await r.text();
  const tips = new Map();
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>([^<]*)</g)) {
    const n = m[2].trim().match(/^([\d,]+)\s+contribution/);
    tips.set(m[1], n ? Number(n[1].replace(/,/g, "")) : 0);
  }
  const days = [];
  for (const m of html.matchAll(/<td\b[^>]*\bdata-date="[^"]+"[^>]*>/g)) {
    const tag = m[0], attr = (k) => (tag.match(new RegExp(`\\b${k}="([^"]*)"`)) || [])[1];
    const date = attr("data-date"), level = Number(attr("data-level") || 0), id = attr("id");
    days.push({ date, level, count: tips.has(id) ? tips.get(id) : level });
  }
  return days.sort((a, b) => a.date.localeCompare(b.date));
}
function toWeeks(days) {
  const weeks = []; let cur = null, curKey = null;
  for (const d of days) {
    const dt = new Date(d.date + "T00:00:00Z"); dt.setUTCDate(dt.getUTCDate() - dt.getUTCDay());
    const key = dt.toISOString().slice(0, 10);
    if (key !== curKey) { cur = []; weeks.push(cur); curKey = key; }
    cur.push(d);
  }
  return weeks;
}
async function realData() {
  const yearsQ = await gql(`query($l:String!){ user(login:$l){ contributionsCollection{ contributionYears } } }`, { l: LOGIN });
  const years = yearsQ.user.contributionsCollection.contributionYears;
  const last = await scrapeRange();
  if (!last.length) throw new Error("calendar page format changed: no days found");
  const all = new Map();
  for (const y of years) for (const d of await scrapeRange(`${y}-01-01`, `${y}-12-31`)) all.set(d.date, d.count);
  for (const d of last) all.set(d.date, d.count);
  const yearTotal = last.reduce((s, d) => s + d.count, 0);
  console.log(`last 12 months: ${yearTotal} · days: ${last.length} · years: ${years.join(",")}`);
  return { weeks: toWeeks(last), yearTotal, allDays: [...all.entries()].sort() };
}
function mockData() {
  let seed = 7; const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const today = new Date("2026-11-25T12:00:00Z"), start = new Date(today);
  start.setUTCDate(start.getUTCDate() - 364 - start.getUTCDay());
  const weeks = []; const allDays = []; let total = 0;
  for (let d = new Date(start), wi = 0; d <= today; wi++) {
    const w = [];
    for (let k = 0; k < 7 && d <= today; k++) {
      const p = 0.35 + 0.5 * (wi / 53), weekend = k === 0 || k === 6;
      const c = rnd() < (weekend ? p * 0.4 : p) ? Math.floor(rnd() * rnd() * 30) + 1 : 0;
      total += c;
      w.push({ date: d.toISOString().slice(0, 10), count: c, level: c === 0 ? 0 : c < 4 ? 1 : c < 9 ? 2 : c < 16 ? 3 : 4 });
      allDays.push([d.toISOString().slice(0, 10), c]);
      d.setUTCDate(d.getUTCDate() + 1);
    }
    weeks.push(w);
  }
  return { weeks, yearTotal: total, allDays };
}
function streaks(allDays) {
  let longest = { n: 0 }, run = { n: 0 };
  for (const [date, c] of allDays) {
    if (c > 0) { run = run.n ? { n: run.n + 1, from: run.from, to: date } : { n: 1, from: date, to: date }; if (run.n > longest.n) longest = { ...run }; }
    else run = { n: 0 };
  }
  // current: walk back from the end; today may still be empty
  let i = allDays.length - 1; if (i >= 0 && allDays[i][1] === 0) i--;
  let cur = 0, from = null; const to = i >= 0 ? allDays[i][0] : null;
  for (; i >= 0 && allDays[i][1] > 0; i--) { cur++; from = allDays[i][0]; }
  return { longest, current: { n: cur, from, to } };
}

/* ---------------------------------------------------------------- activity */
const fmtN = (n) => n.toLocaleString("en-US");
function rng(seedStr) {
  let h = 2166136261; for (const ch of seedStr) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => { h += 0x6d2b79f5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
// Cubic Bézier helpers for measuring the closed Catmull-Rom loop
const bez = (p0, c1, c2, p1, t) => { const u = 1 - t; return [
  u*u*u*p0[0] + 3*u*u*t*c1[0] + 3*u*t*t*c2[0] + t*t*t*p1[0],
  u*u*u*p0[1] + 3*u*u*t*c1[1] + 3*u*t*t*c2[1] + t*t*t*p1[1]]; };
function segLen(p0, c1, c2, p1) { let L = 0, prev = p0; for (let k = 1; k <= 40; k++) { const q = bez(p0, c1, c2, p1, k / 40); L += Math.hypot(q[0] - prev[0], q[1] - prev[1]); prev = q; } return L; }

function activity(th, data) {
  const W = 880, cell = 11.5, step = 15.3, gx = 34, gy = 128;
  const cols = data.weeks.length, H = gy + 7 * step + 30;
  const rand = rng(new Date().toISOString().slice(0, 10) + LOGIN);

  // ---- stats line (typographic, no boxes)
  const all = data.allDays.reduce((s, [, c]) => s + c, 0), st = streaks(data.allDays);
  const firstYear = data.allDays.find(([, c]) => c > 0)?.[0].slice(0, 4) ?? "";
  const items = [
    [fmtN(data.yearTotal), "contributions in the last year"],
    [fmtN(all), `contributions since ${firstYear}`],
    [`${st.longest.n} days`, "longest streak"],
  ];
  if (st.current.n > 1) items.push([`${st.current.n} days`, "current streak"]);
  const dark = th === THEMES.dark, marks = [th.accent, th.accent4, th.accent2, th.accent3];
  let out = `<defs><linearGradient id="edge" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${th.accent}" stop-opacity="${dark ? ".35" : ".5"}"/><stop offset=".55" stop-color="${th.accent4}" stop-opacity=".08"/><stop offset="1" stop-color="${th.accent3}" stop-opacity="${dark ? ".3" : ".4"}"/></linearGradient>
    <radialGradient id="blob" cx="10%" cy="0%" r="60%"><stop offset="0" stop-color="${th.accent}" stop-opacity="${dark ? ".10" : ".08"}"/><stop offset="1" stop-color="${th.accent}" stop-opacity="0"/></radialGradient></defs>
    <rect x="1" y="1" width="${W - 2}" height="${(H - 2).toFixed(0)}" rx="18" fill="${dark ? "#0b100d" : th.surface}"/>
    <rect x="1" y="1" width="${W - 2}" height="${(H - 2).toFixed(0)}" rx="18" fill="url(#blob)"/>
    <rect x="1" y="1" width="${W - 2}" height="${(H - 2).toFixed(0)}" rx="18" fill="none" stroke="url(#edge)" stroke-width="1.5"/>`;
  items.forEach(([v, l], i) => {
    const x = 34 + i * 205;
    out += `<rect x="${x}" y="34" width="3" height="46" rx="1.5" fill="${marks[i]}"/>
      <text x="${x + 16}" y="64" font-family="${SANS}" font-size="31" font-weight="800" fill="${th.text}" letter-spacing="-.8">${v}</text>
      <text x="${x + 16}" y="84" font-family="${SANS}" font-size="12.5" fill="${th.muted}">${esc(l)}</text>`;
  });

  // ---- grid
  const pos = new Map(); const food = [];
  let base = "";
  data.weeks.forEach((w, c) => w.forEach((d) => {
    const r = new Date(d.date + "T00:00:00Z").getUTCDay();
    const x = gx + c * step, y = gy + r * step;
    base += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="3" fill="${th.empty}"/>`;
    const key = `${c},${r}`;
    pos.set(key, [x + cell / 2, y + cell / 2]);
    if (d.level > 0) food.push({ key, x, y, level: d.level });
  }));

  // ---- wander: hop between nearby contributions, random each day
  const pool = food.length >= 4 ? food.map((f) => f.key) : [...pos.keys()];
  const N = Math.min(34, pool.length);
  const left = new Set(pool);
  let curKey = pool[Math.floor(rand() * pool.length)]; left.delete(curKey);
  const route = [curKey];
  while (route.length < N) {
    const [cx0, cy0] = pos.get(curKey);
    const near = [...left].map((k) => [k, Math.hypot(pos.get(k)[0] - cx0, pos.get(k)[1] - cy0)])
      .sort((a, b) => a[1] - b[1]).slice(0, 5);
    curKey = near[Math.floor(rand() * near.length)][0]; left.delete(curKey); route.push(curKey);
  }
  const P = route.map((k) => pos.get(k)), n = P.length;
  let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`; const lens = [];
  for (let i = 0; i < n; i++) {
    const p0 = P[(i - 1 + n) % n], p1 = P[i], p2 = P[(i + 1) % n], p3 = P[(i + 2) % n];
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1.map((v) => v.toFixed(1)).join(",")} ${c2.map((v) => v.toFixed(1)).join(",")} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    lens.push(segLen(p1, c1, c2, p2));
  }
  const total = lens.reduce((a, b) => a + b, 0), speed = 52;
  // timeline: pause at each stop, then glide (ease in/out) to the next one
  const kT = [0], kP = [0], splines = []; let t = 0, acc = 0; const arrive = [];
  for (let i = 0; i < n; i++) {
    const pause = 0.5 + rand() * 1.1;
    arrive.push(t);
    t += pause; kT.push(t); kP.push(acc / total); splines.push("0 0 1 1");
    acc += lens[i]; t += Math.max(0.6, lens[i] / speed);
    kT.push(t); kP.push(Math.min(1, acc / total)); splines.push(".42 0 .58 1");
  }
  const T = t;
  const regrow = 14; // seconds a cell stays eaten
  const eatAt = new Map(route.map((k, i) => [k, arrive[i] + 0.25]));

  let foodSvg = "";
  for (const f of food) {
    const at = eatAt.get(f.key);
    foodSvg += `<rect${at !== undefined ? ` class="f" style="animation-delay:${at.toFixed(2)}s"` : ""} x="${f.x}" y="${f.y}" width="${cell}" height="${cell}" rx="3" fill="${th.levels[f.level - 1]}"/>`;
  }
  const pc = (s) => ((s / T) * 100).toFixed(3);
  const skin = th === THEMES.dark ? ["#a3e635", "#2dd4bf", "#f59e0b"] : ["#65a30d", "#0f766e", "#b45309"];
  const spot = th === THEMES.dark ? "#3f6212" : "#1a2e05";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H.toFixed(0)}" viewBox="0 0 ${W} ${H.toFixed(0)}">
  <style>
    .f{transform-box:fill-box;transform-origin:center;animation:eat ${T.toFixed(2)}s infinite}
    @keyframes eat{0%{transform:scale(1);opacity:1;animation-timing-function:ease-in}${pc(0.25)}%{transform:scale(1.25);opacity:1;animation-timing-function:ease-in}${pc(0.6)}%{transform:scale(0);opacity:0}${pc(regrow)}%{transform:scale(0);opacity:0;animation-timing-function:ease-out}${pc(regrow + 1.2)}%{transform:scale(1);opacity:1}100%{transform:scale(1);opacity:1}}
    .skin{animation:cham 12s ease-in-out infinite}
    .leg{fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;animation:chamS 12s ease-in-out infinite}
    @keyframes cham{0%,100%{fill:${skin[0]}}33%{fill:${skin[1]}}66%{fill:${skin[2]}}}
    @keyframes chamS{0%,100%{stroke:${skin[0]}}33%{stroke:${skin[1]}}66%{stroke:${skin[2]}}}
    .spot{fill:${spot};opacity:.5}
    .legA{animation:stepA .45s ease-in-out infinite alternate;transform-origin:-7px 0}
    .legB{animation:stepA .45s ease-in-out infinite alternate-reverse;transform-origin:-7px 0}
    @keyframes stepA{from{transform:rotate(-9deg)}to{transform:rotate(9deg)}}
    .tongue{fill:none;stroke:#fb7185;stroke-width:1.4;stroke-linecap:round;transform-origin:6px 0;animation:flick 1.9s ease-out infinite}
    @keyframes flick{0%,70%{transform:scaleX(0)}80%{transform:scaleX(1)}90%,100%{transform:scaleX(0)}}
  </style>
  ${out}${base}${foodSvg}
  <g>
    <animateMotion dur="${T.toFixed(2)}s" repeatCount="indefinite" rotate="auto" calcMode="spline"
      keyTimes="${kT.map((x) => (x / T).toFixed(5)).join(";")}" keyPoints="${kP.map((x) => x.toFixed(5)).join(";")}"
      keySplines="${splines.join(";")}" path="${d}"/>
    ${lizard()}
  </g>
</svg>`;
}

/* ----------------------------------------------------------------- calango */
// A little calango (Brazilian lizard) walks the contribution grid row by row,
// snapping up every contribution it passes. The grass grows back behind it.
function lizard() {
  // drawn facing +x, head at the origin (top-down view)
  return `<g class="lz" transform="scale(1.35)">
    <path class="skin" d="M-13,-2.2 Q-24,-3.5 -38,1.5 Q-25,0.8 -13,2.2 Z"/>
    <g class="legA"><path class="leg" d="M-3,-2.5 L-1,-7.5 L1.5,-8.5"/><path class="leg" d="M-11,2.5 L-14,7.5 L-16.5,8.5"/></g>
    <g class="legB"><path class="leg" d="M-3,2.5 L-1,7.5 L1.5,8.5"/><path class="leg" d="M-11,-2.5 L-14,-7.5 L-16.5,-8.5"/></g>
    <ellipse class="skin" cx="-7" cy="0" rx="8.5" ry="4.2"/>
    <ellipse class="skin" cx="2" cy="0" rx="4.6" ry="3.4"/>
    <circle cx="-9" cy="-1.3" r="1.1" class="spot"/><circle cx="-5" cy="1.4" r="1" class="spot"/><circle cx="-12" cy="1" r=".9" class="spot"/>
    <circle cx="3.2" cy="-2.3" r="1.15" fill="#0b100d"/><circle cx="3.2" cy="2.3" r="1.15" fill="#0b100d"/>
    <path class="tongue" d="M6,0 H13 M13,0 L15.5,-1.6 M13,0 L15.5,1.6"/>
  </g>`;
}
/* -------------------------------------------------------------------- main */
const mock = process.argv.includes("--mock");
save("header.svg", header());
for (const [name, th] of Object.entries(THEMES)) {
  save(`work-${name}.svg`, work(th));
  save(`stack-${name}.svg`, stack(th));
}
if (mock || process.env.PROFILE_TOKEN || process.env.GITHUB_TOKEN) {
  const data = mock ? mockData() : await realData();
  for (const [name, th] of Object.entries(THEMES)) save(`activity-${name}.svg`, activity(th, data));
  console.log("generated with", mock ? "mock" : "live", "data");
} else console.log("static assets only (no token)");
