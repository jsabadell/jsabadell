// Generates every SVG used by the profile README.
// Static pieces (header, projects, stack) + data-driven pieces (stats, calango).
//   node scripts/generate.mjs            -> real data (needs GITHUB_TOKEN)
//   node scripts/generate.mjs --mock     -> fake data, for local previews
import { writeFileSync, mkdirSync } from "node:fs";

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

/* ---------------------------------------------------------------- projects */
const PROJECTS = [
  { name: "IRKO", kind: "Internship · AI", color: "accent",
    lines: ["Natural-language assistant over an", "automation portal: ask a question,", "get answers from live dashboard data."],
    tags: ["LLM agents", "Python", "Postgres"] },
  { name: "Stadio", kind: "Contract · Full-stack", color: "accent2",
    lines: ["Professional network for football:", "players, clubs and scouts. Led security", "hardening and closed 6 vulnerabilities."],
    tags: ["TypeScript", "Next.js", "Supabase"] },
  { name: "Creme Climbing", kind: "Contract · Full-stack", color: "accent3",
    lines: ["Manufacturing execution system: from", "production orders all the way to the", "shop floor."],
    tags: ["React", "FastAPI", "PostgreSQL"] },
];
function chips(tags, x, y, th, mono = true) {
  let out = "", cx = x;
  for (const tag of tags) {
    const w = tag.length * 7.3 + 18;
    out += `<rect x="${cx}" y="${y}" width="${w}" height="22" rx="11" fill="${th.chip}" stroke="${th.border}"/>
      <text x="${cx + w / 2}" y="${y + 15}" text-anchor="middle" font-family="${mono ? MONO : SANS}" font-size="12" fill="${th.text}">${esc(tag)}</text>`;
    cx += w + 6;
  }
  return out;
}
function projects(th) {
  const W = 860, H = 212, gap = 18, cw = (W - 2 * gap) / 3;
  let out = "";
  PROJECTS.forEach((p, i) => {
    const x = i * (cw + gap), c = th[p.color];
    out += `<g>
      <rect x="${x + 1}" y="1" width="${cw - 2}" height="${H - 2}" rx="12" fill="${th.surface}" stroke="${th.border}"/>
      <rect x="${x + 1}" y="1" width="${cw - 2}" height="4" rx="2" fill="${c}"/>
      <text x="${x + 18}" y="32" font-family="${MONO}" font-size="12" fill="${c}">${p.kind}</text>
      <text x="${x + 18}" y="62" font-family="${SANS}" font-size="20" font-weight="700" fill="${th.text}">${esc(p.name)}</text>
      ${p.lines.map((l, k) => `<text x="${x + 18}" y="${90 + k * 19}" font-family="${SANS}" font-size="13" fill="${th.muted}">${esc(l)}</text>`).join("")}
      ${chips(p.tags, x + 18, H - 40, th)}
    </g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${out}</svg>`;
}

/* ------------------------------------------------------------------- stack */
const STACK = [
  { title: "Frontend", color: "accent4", items: ["TypeScript", "React", "Next.js", "React Native", "Tailwind"] },
  { title: "Backend", color: "accent2", items: ["FastAPI", "Python", "Node.js", "REST", "LLM agents"] },
  { title: "Data", color: "accent", items: ["PostgreSQL", "Supabase", "SQL", "RLS & auth"] },
  { title: "DevOps", color: "accent3", items: ["Docker", "GitHub Actions", "CI/CD", "Linux"] },
];
function stack(th) {
  const W = 860, rowH = 40, H = STACK.length * rowH + 12;
  let out = "";
  STACK.forEach((g, i) => {
    const y = 6 + i * rowH;
    out += `<circle cx="10" cy="${y + 16}" r="4" fill="${th[g.color]}"/>
      <text x="24" y="${y + 21}" font-family="${MONO}" font-size="14" fill="${th[g.color]}">${g.title}</text>
      ${chips(g.items, 130, y + 5, th)}`;
    if (i < STACK.length - 1) out += `<path d="M24 ${y + rowH - 1} H${W}" stroke="${th.border}" stroke-dasharray="2 4"/>`;
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

/* ------------------------------------------------------------------- stats */
const fmtDate = (s) => s ? new Date(s + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }) : "";
const fmtN = (n) => n.toLocaleString("en-US");
function stats(th, data) {
  const W = 860, H = 196, gap = 14, tw = (W - 3 * gap) / 4;
  const all = data.allDays.reduce((s, [, c]) => s + c, 0);
  const st = streaks(data.allDays);
  const firstYear = data.allDays.length ? data.allDays[0][0].slice(0, 4) : "";
  const tiles = [
    { label: "All-time", value: fmtN(all), sub: `contributions since ${firstYear}`, c: th.accent },
    { label: "Last 12 months", value: fmtN(data.yearTotal), sub: "commits, PRs and reviews", c: th.accent4 },
    { label: "Current streak", value: `${st.current.n}d`, sub: st.current.n ? `${fmtDate(st.current.from)} → ${fmtDate(st.current.to)}` : "starting a new one today", c: th.accent2 },
    { label: "Longest streak", value: `${st.longest.n}d`, sub: st.longest.n ? `${fmtDate(st.longest.from)} → ${fmtDate(st.longest.to)}` : "", c: th.accent3 },
  ];
  let out = "";
  tiles.forEach((t, i) => {
    const x = i * (tw + gap);
    out += `<rect x="${x + 1}" y="1" width="${tw - 2}" height="104" rx="12" fill="${th.surface}" stroke="${th.border}"/>
      <text x="${x + 16}" y="28" font-family="${MONO}" font-size="12" fill="${t.c}">${t.label}</text>
      <text x="${x + 16}" y="66" font-family="${SANS}" font-size="30" font-weight="800" fill="${th.text}">${t.value}</text>
      <text x="${x + 16}" y="90" font-family="${SANS}" font-size="12" fill="${th.muted}">${esc(t.sub)}</text>`;
  });
  // weekly bars
  const wk = data.weeks.map((w) => w.reduce((s, d) => s + d.count, 0));
  const max = Math.max(1, ...wk), bw = (W - 2) / wk.length, top = 122, bh = 54;
  out += `<text x="0" y="${top - 2}" font-family="${MONO}" font-size="11" fill="${th.muted}">Contributions per week</text>`;
  wk.forEach((v, i) => {
    const h = Math.max(2, (v / max) * (bh - 8));
    out += `<rect x="${(1 + i * bw + 1).toFixed(1)}" y="${(top + bh - h).toFixed(1)}" width="${(bw - 3).toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" fill="${th.accent}" opacity="${(0.35 + 0.65 * (v / max)).toFixed(2)}"/>`;
  });
  out += `<path d="M0 ${top + bh + 0.5} H${W}" stroke="${th.border}"/>`;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${out}</svg>`;
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
function calango(th, data) {
  const cell = 12, step = 15.5, gx = 20, gy = 22;
  const cols = data.weeks.length, rows = 7;
  const W = gx * 2 + cols * step, H = gy + rows * step + 18;
  const dt = 0.05, turn = 0.32, exit = 0.8;
  const cx = (c) => gx + c * step + cell / 2, cy = (r) => gy + r * step + cell / 2;

  // lizard timeline: [time, x, y, angle]
  const kf = []; const eatAt = new Map(); let t = 0;
  kf.push([0, cx(0) - 50, cy(0), 0]); t = 0.6;
  for (let r = 0; r < rows; r++) {
    const ltr = r % 2 === 0, ang = ltr ? 0 : 180;
    const c0 = ltr ? 0 : cols - 1, c1 = ltr ? cols - 1 : 0;
    kf.push([t, cx(c0), cy(r), ang]);
    for (let k = 0; k < cols; k++) eatAt.set(`${ltr ? k : cols - 1 - k},${r}`, t + k * dt);
    t += (cols - 1) * dt;
    kf.push([t, cx(c1), cy(r), ang]);
    if (r < rows - 1) { t += turn / 2; kf.push([t, cx(c1) + (ltr ? 8 : -8), cy(r) + step / 2, 90]); t += turn / 2; }
  }
  t += exit; kf.push([t, cx(cols - 1) + 60, cy(rows - 1), 0]);
  t += 0.6; const T = t;
  const pct = (x) => ((x / T) * 100).toFixed(3);
  let lzKf = kf.map(([tt, x, y, a]) => `${pct(tt)}%{transform:translate(${x.toFixed(1)}px,${y.toFixed(1)}px) rotate(${a}deg)}`).join("");
  lzKf += `100%{transform:translate(${(cx(0) - 50).toFixed(1)}px,${cy(0).toFixed(1)}px) rotate(0deg)}`;

  // cells
  let base = "", food = "";
  data.weeks.forEach((w, c) => w.forEach((d, i) => {
    const r = new Date(d.date + "T00:00:00Z").getUTCDay(); void i;
    const x = gx + c * step, y = gy + r * step;
    base += `<rect x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2.5" fill="${th.empty}"/>`;
    if (d.level > 0) {
      const at = eatAt.get(`${c},${r}`) - 0.02;
      food += `<rect class="f" style="animation-delay:${at.toFixed(2)}s" x="${x}" y="${y}" width="${cell}" height="${cell}" rx="2.5" fill="${th.levels[d.level - 1]}"/>`;
    }
  }));
  const skin = th === THEMES.dark ? ["#a3e635", "#2dd4bf", "#f59e0b", "#a3e635"] : ["#65a30d", "#0f766e", "#b45309", "#65a30d"];
  const spot = th === THEMES.dark ? "#3f6212" : "#1a2e05";
  const gone = 55, back = 62; // % of the loop a cell stays eaten before regrowing

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W.toFixed(0)}" height="${H.toFixed(0)}" viewBox="0 0 ${W.toFixed(0)} ${H.toFixed(0)}">
  <style>
    .f{transform-box:fill-box;transform-origin:center;animation:eat ${T.toFixed(2)}s linear infinite}
    @keyframes eat{0%{transform:scale(1);opacity:1}0.6%{transform:scale(1.35);opacity:1}1.6%{transform:scale(0);opacity:0}${gone}%{transform:scale(0);opacity:0}${back}%{transform:scale(1);opacity:1}100%{transform:scale(1);opacity:1}}
    .walker{animation:walk ${T.toFixed(2)}s linear infinite}
    @keyframes walk{${lzKf}}
    .skin{animation:chameleon 7s ease-in-out infinite}
    .leg{fill:none;stroke-width:2.2;stroke-linecap:round;stroke-linejoin:round;animation:chameleonS 7s ease-in-out infinite}
    @keyframes chameleon{0%{fill:${skin[0]}}33%{fill:${skin[1]}}66%{fill:${skin[2]}}100%{fill:${skin[3]}}}
    @keyframes chameleonS{0%{stroke:${skin[0]}}33%{stroke:${skin[1]}}66%{stroke:${skin[2]}}100%{stroke:${skin[3]}}}
    .spot{fill:${spot};opacity:.55}
    .legA{animation:stepA .22s ease-in-out infinite alternate;transform-origin:-7px 0}
    .legB{animation:stepA .22s ease-in-out infinite alternate-reverse;transform-origin:-7px 0}
    @keyframes stepA{from{transform:rotate(-14deg)}to{transform:rotate(14deg)}}
    .tongue{fill:none;stroke:#fb7185;stroke-width:1.4;stroke-linecap:round;transform-origin:6px 0;animation:flick .7s ease-out infinite}
    @keyframes flick{0%,55%{transform:scaleX(0)}70%{transform:scaleX(1)}85%,100%{transform:scaleX(0)}}
  </style>
  ${base}${food}
  <g class="walker">${lizard()}</g>
</svg>`;
}

/* -------------------------------------------------------------------- main */
const mock = process.argv.includes("--mock");
save("header.svg", header());
for (const [name, th] of Object.entries(THEMES)) {
  save(`projects-${name}.svg`, projects(th));
  save(`stack-${name}.svg`, stack(th));
}
if (mock || (process.env.PROFILE_TOKEN || process.env.GITHUB_TOKEN)) {
  const data = mock ? mockData() : await realData();
  for (const [name, th] of Object.entries(THEMES)) {
    save(`stats-${name}.svg`, stats(th, data));
    save(`calango-${name}.svg`, calango(th, data));
  }
  console.log("generated with", mock ? "mock" : "live", "data");
} else console.log("static assets only (no GITHUB_TOKEN)");
