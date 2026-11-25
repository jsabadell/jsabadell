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
  const W = 860, H = 322, x0 = 32, lh = 27, fs = 15, cw = 9.05;
  const prompt = [{ t: "jordi", c: "#a3e635" }, { t: "@", c: "#8aa293" }, { t: "bcn", c: "#2dd4bf" }, { t: ":~$ ", c: "#8aa293" }];
  const promptLen = prompt.reduce((n, p) => n + p.t.length, 0);
  const steps = [
    { cmd: "whoami", out: [[{ t: "Jordi", c: "#e6efe8", b: 1 }, { t: " · full-stack software engineer", c: "#c9d6cd" }]] },
    { cmd: "cat stack.txt", out: [[{ t: "typescript · react · next.js · fastapi · postgres · supabase", c: "#f59e0b" }]] },
    { cmd: "traceroute jordi", out: [[
      { t: "brazil", c: "#a3e635" }, { t: " (roots) ", c: "#5f7568" }, { t: "──▶ ", c: "#5f7568" },
      { t: "netherlands", c: "#f59e0b" }, { t: " (fontys) ", c: "#5f7568" }, { t: "──▶ ", c: "#5f7568" },
      { t: "barcelona", c: "#fb7185" }, { t: " (home base)", c: "#5f7568" },
    ]] },
    { cmd: "./status --now", out: [[{ t: "shipping AI assistants, a MES and a football network", c: "#2dd4bf" }]] },
  ];
  let y = 78, t = 0.6, body = "", defs = "", id = 0;
  const spans = (parts) => parts.map((p) => `<tspan fill="${p.c}"${p.b ? ' font-weight="700"' : ""}>${esc(p.t)}</tspan>`).join("");
  for (const s of steps) {
    const n = s.cmd.length, dur = n * 0.07;
    const vals = Array.from({ length: n + 1 }, (_, k) => ((promptLen + k) * cw).toFixed(1)).join(";");
    defs += `<clipPath id="c${id}"><rect x="${x0}" y="${y - 20}" height="30" width="${(promptLen * cw).toFixed(1)}">
      <animate attributeName="width" begin="${t.toFixed(2)}s" dur="${dur.toFixed(2)}s" values="${vals}" calcMode="discrete" fill="freeze"/></rect></clipPath>`;
    body += `<g opacity="0"><set attributeName="opacity" to="1" begin="${(t - 0.01).toFixed(2)}s" fill="freeze"/>
      <text x="${x0}" y="${y}" clip-path="url(#c${id})">${spans(prompt)}<tspan fill="#e6efe8">${esc(s.cmd)}</tspan></text></g>`;
    t += dur + 0.35; y += lh;
    for (const line of s.out) {
      body += `<g opacity="0"><set attributeName="opacity" to="1" begin="${t.toFixed(2)}s" fill="freeze"/>
        <text x="${x0}" y="${y}">${spans(line)}</text></g>`;
      y += lh;
    }
    t += 0.45; id++;
  }
  // final prompt + blinking cursor
  body += `<g opacity="0"><set attributeName="opacity" to="1" begin="${t.toFixed(2)}s" fill="freeze"/>
    <text x="${x0}" y="${y}">${spans(prompt)}</text>
    <rect x="${x0 + promptLen * cw + 2}" y="${y - 14}" width="9" height="18" fill="#a3e635">
      <animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1s" repeatCount="indefinite"/></rect></g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" font-family="${MONO}" font-size="${fs}">
  <defs>${defs}
    <linearGradient id="glow" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a3e635" stop-opacity=".18"/><stop offset=".5" stop-color="#2dd4bf" stop-opacity=".06"/><stop offset="1" stop-color="#fb7185" stop-opacity=".14"/></linearGradient>
  </defs>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="#0b100d" stroke="url(#glow)" stroke-width="2"/>
  <rect x="1" y="1" width="${W - 2}" height="${H - 2}" rx="14" fill="url(#glow)" opacity=".35"/>
  <path d="M1 44 H${W - 1}" stroke="#1d2a22"/>
  <circle cx="26" cy="23" r="5.5" fill="#fb7185"/><circle cx="44" cy="23" r="5.5" fill="#f59e0b"/><circle cx="62" cy="23" r="5.5" fill="#a3e635"/>
  <text x="${W / 2}" y="28" text-anchor="middle" fill="#5f7568" font-size="13">jordi@bcn — zsh — 120×32</text>
  ${body}
</svg>`;
}

/* ---------------------------------------------------------------- projects */
const PROJECTS = [
  { slug: "~/irko", name: "IRKO", kind: "internship · AI", color: "accent",
    lines: ["Natural-language assistant over an", "automation portal: ask a question,", "get answers from live dashboard data."],
    tags: ["LLM agents", "Python", "Postgres"] },
  { slug: "~/stadio", name: "Stadio", kind: "contract · full-stack", color: "accent2",
    lines: ["Professional network for football:", "players, clubs and scouts. Led security", "hardening — 6 vulnerabilities closed."],
    tags: ["TypeScript", "Next.js", "Supabase"] },
  { slug: "~/creme", name: "Creme Climbing", kind: "contract · full-stack", color: "accent3",
    lines: ["Manufacturing execution system: from", "production orders to the shop floor,", "end to end."],
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
      <text x="${x + 18}" y="32" font-family="${MONO}" font-size="12" fill="${c}">${p.slug}</text>
      <text x="${x + cw - 18}" y="32" text-anchor="end" font-family="${MONO}" font-size="11" fill="${th.muted}">${p.kind}</text>
      <text x="${x + 18}" y="62" font-family="${SANS}" font-size="20" font-weight="700" fill="${th.text}">${esc(p.name)}</text>
      ${p.lines.map((l, k) => `<text x="${x + 18}" y="${90 + k * 19}" font-family="${SANS}" font-size="13" fill="${th.muted}">${esc(l)}</text>`).join("")}
      ${chips(p.tags, x + 18, H - 40, th)}
    </g>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${out}</svg>`;
}

/* ------------------------------------------------------------------- stack */
const STACK = [
  { title: "frontend", color: "accent4", items: ["TypeScript", "React", "Next.js", "React Native", "Tailwind"] },
  { title: "backend", color: "accent2", items: ["FastAPI", "Python", "Node.js", "REST", "LLM agents"] },
  { title: "data", color: "accent", items: ["PostgreSQL", "Supabase", "SQL", "RLS & auth"] },
  { title: "ship", color: "accent3", items: ["Docker", "GitHub Actions", "CI/CD", "Linux"] },
];
function stack(th) {
  const W = 860, rowH = 40, H = STACK.length * rowH + 12;
  let out = "";
  STACK.forEach((g, i) => {
    const y = 6 + i * rowH;
    out += `<circle cx="10" cy="${y + 16}" r="4" fill="${th[g.color]}"/>
      <text x="24" y="${y + 21}" font-family="${MONO}" font-size="14" fill="${th[g.color]}">${g.title}/</text>
      ${chips(g.items, 130, y + 5, th)}`;
    if (i < STACK.length - 1) out += `<path d="M24 ${y + rowH - 1} H${W}" stroke="${th.border}" stroke-dasharray="2 4"/>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${out}</svg>`;
}

/* -------------------------------------------------------------------- data */
async function gql(query, variables) {
  const r = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: { Authorization: `bearer ${process.env.GITHUB_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors) throw new Error(JSON.stringify(j.errors));
  return j.data;
}
const LEVEL = { NONE: 0, FIRST_QUARTILE: 1, SECOND_QUARTILE: 2, THIRD_QUARTILE: 3, FOURTH_QUARTILE: 4 };
async function realData() {
  const cal = `contributionCalendar{ totalContributions weeks{ contributionDays{ date contributionCount contributionLevel } } }`;
  const d = await gql(`query($l:String!){ user(login:$l){ contributionsCollection{ contributionYears ${cal} } } }`, { l: LOGIN });
  const cc = d.user.contributionsCollection;
  const weeks = cc.contributionCalendar.weeks.map((w) => w.contributionDays.map((x) => ({ date: x.date, count: x.contributionCount, level: LEVEL[x.contributionLevel] })));
  const all = new Map();
  for (const y of cc.contributionYears) {
    const r = await gql(`query($l:String!,$f:DateTime!,$t:DateTime!){ user(login:$l){ contributionsCollection(from:$f,to:$t){ ${cal} } } }`,
      { l: LOGIN, f: `${y}-01-01T00:00:00Z`, t: `${y}-12-31T23:59:59Z` });
    for (const w of r.user.contributionsCollection.contributionCalendar.weeks)
      for (const x of w.contributionDays) all.set(x.date, x.contributionCount);
  }
  return { weeks, yearTotal: cc.contributionCalendar.totalContributions, allDays: [...all.entries()].sort() };
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
const fmtDate = (s) => s ? new Date(s + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", timeZone: "UTC" }) : "—";
const fmtN = (n) => n.toLocaleString("en-US");
function stats(th, data) {
  const W = 860, H = 196, gap = 14, tw = (W - 3 * gap) / 4;
  const all = data.allDays.reduce((s, [, c]) => s + c, 0);
  const st = streaks(data.allDays);
  const firstYear = data.allDays.length ? data.allDays[0][0].slice(0, 4) : "";
  const tiles = [
    { label: "all-time", value: fmtN(all), sub: `contributions since ${firstYear}`, c: th.accent },
    { label: "last 12 months", value: fmtN(data.yearTotal), sub: "commits · PRs · reviews", c: th.accent4 },
    { label: "current streak", value: `${st.current.n}d`, sub: st.current.n ? `${fmtDate(st.current.from)} → ${fmtDate(st.current.to)}` : "starting a new one", c: th.accent2 },
    { label: "longest streak", value: `${st.longest.n}d`, sub: st.longest.n ? `${fmtDate(st.longest.from)} → ${fmtDate(st.longest.to)}` : "—", c: th.accent3 },
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
  out += `<text x="0" y="${top - 2}" font-family="${MONO}" font-size="11" fill="${th.muted}">contributions / week</text>`;
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
if (mock || process.env.GITHUB_TOKEN) {
  const data = mock ? mockData() : await realData();
  for (const [name, th] of Object.entries(THEMES)) {
    save(`stats-${name}.svg`, stats(th, data));
    save(`calango-${name}.svg`, calango(th, data));
  }
  console.log("generated with", mock ? "mock" : "live", "data");
} else console.log("static assets only (no GITHUB_TOKEN)");
