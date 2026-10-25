#!/usr/bin/env node
// Area 22 (performance-feel) measurement harness. Nothing is installed in the repo: Playwright is resolved from
// /tmp/t3code-pw. Usage:
//   node measure.mjs --base http://localhost:5733 --label dev --runs 3 --only typing,switch,scroll,panels,palette,theme,memory,idle,send --out /tmp/a22-dev.json
//   --cpu 4   applies CDP Emulation.setCPUThrottlingRate (4x slowdown) to scenarios that support it
//   --state   storageState json (default /tmp/t3code-pw/state.json; its origin is rewritten to --base)
// Method summary (see ui-overhaul/audit/22-performance-feel.md):
//   keystroke latency   keydown event.timeStamp -> rAF -> MessageChannel task (first frame after the key), plus Event Timing
//                       entries (durationThreshold 16) and CDP Performance.getMetrics TaskDuration per key (net of idle)
//   long tasks          PerformanceObserver "longtask" (>50 ms), CLS via "layout-shift", frames via a rAF logger
//   style/layout        CDP Performance.getMetrics deltas (RecalcStyleCount/Duration, LayoutCount/Duration, ScriptDuration)
//   memory              CDP HeapProfiler.collectGarbage x2 then Performance.getMetrics JSHeapUsedSize / Nodes / JSEventListeners
import { createRequire } from "node:module";
import fs from "node:fs";
const require = createRequire("/tmp/t3code-pw/_a22.js");
const { chromium } = require("playwright");

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--"))
      acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]);
    return acc;
  }, []),
);
const BASE = args.base ?? "http://localhost:5733";
const LABEL = args.label ?? "dev";
const RUNS = Number(args.runs ?? 3);
const CPU = Number(args.cpu ?? 1);
const WSDELAY = Number(args.wsdelay ?? 0); // one-way ms added to every app WebSocket frame (RTT = 2x), via page.routeWebSocket
const ONLY = (args.only ?? "typing,switch,scroll,panels,palette,theme,memory,idle").split(",");
const OUT = args.out ?? `/tmp/a22-${LABEL}${CPU > 1 ? `-cpu${CPU}` : ""}.json`;
const ENV = "d8e8988c-d569-4770-aa15-6bf4b46afdc1";
const T = {
  seed: { id: "mcp:4db596b5-60b6-47e5-b43a-44ef7b5bf83f", title: "Add capitalize helper and docs" },
  seed2: { id: "mcp:de3a2ccc-388d-4c8d-a0bc-68393c04502f", title: "Explain the repository" },
  seed3: {
    id: "mcp:a54eaa29-9a7b-4773-87b8-a945eb6b50dd",
    title: "Run tests and summarise history",
  },
  long60: {
    id: "mcp:101012d3-8fff-4b2e-8a8f-7d31d6aec256",
    title: "Long conversation stress test",
  },
  huge: { id: "mcp:56cf13f9-6c6a-412e-bf5c-8d6320267980", title: "Huge output stress test" },
};
const tUrl = (t) => `${BASE}/${ENV}/${encodeURIComponent(t.id)}`;

const stateRaw = JSON.parse(fs.readFileSync(args.state ?? "/tmp/t3code-pw/state.json", "utf8"));
const STATE = JSON.parse(
  JSON.stringify(stateRaw).replaceAll("http://localhost:5733", new URL(BASE).origin),
);

// ---------- stats ----------
const sorted = (a) => [...a].sort((x, y) => x - y);
const q = (a, p) => {
  if (!a.length) return null;
  const s = sorted(a);
  return s[Math.min(s.length - 1, Math.max(0, Math.ceil(p * s.length) - 1))];
};
const median = (a) =>
  q(
    a.filter((x) => x != null && Number.isFinite(x)),
    0.5,
  );
const r1 = (x) => (x == null ? null : Math.round(x * 10) / 10);
const medianOf = (runs, pick) => r1(median(runs.map(pick)));

// ---------- in-page instrumentation ----------
const INIT = `(() => {
  const m = (window.__m = { lt: [], cls: [], ev: [], ws: [], keys: [], frames: [], rec: false });
  const obs = (type, cb, extra = {}) => { try { new PerformanceObserver((l) => l.getEntries().forEach(cb)).observe({ type, buffered: true, ...extra }); } catch {} };
  obs("longtask", (e) => m.lt.push([e.startTime, e.duration]));
  obs("layout-shift", (e) => { if (!e.hadRecentInput) m.cls.push([e.startTime, e.value, (e.sources || []).slice(0, 3).map((x) => (x.node ? x.node.nodeName + "." + String(x.node.className || "").slice(0, 50) + "@" + Math.round(x.previousRect.y) + ">" + Math.round(x.currentRect.y) : "?"))]); });
  obs("event", (e) => m.ev.push([e.name, e.startTime, e.duration, e.processingStart - e.startTime, e.processingEnd - e.processingStart]), { durationThreshold: 16 });
  const WS = window.WebSocket;
  window.WebSocket = class extends WS { constructor(...a) { super(...a); this.addEventListener("message", (ev) => m.ws.push([performance.now(), typeof ev.data === "string" ? ev.data.length : ev.data.byteLength || ev.data.size || 0])); } };
  addEventListener("keydown", (e) => { const t0 = e.timeStamp; requestAnimationFrame(() => { const ch = new MessageChannel(); ch.port1.onmessage = () => m.keys.push(performance.now() - t0); ch.port2.postMessage(0); }); }, true);
  window.__t0 = null;
  window.__arm = (type) => { window.__t0 = null; addEventListener(type, (e) => { if (window.__t0 === null) window.__t0 = e.timeStamp; }, { capture: true, once: true }); };
  window.__until = (pred, timeout = 10000) => new Promise((res) => {
    const start = performance.now(); let done = false;
    const chk = () => { if (done) return; let ok = false; try { ok = pred(); } catch {} if (ok) { done = true; mo.disconnect(); res(performance.now()); } else if (performance.now() - start > timeout) { done = true; mo.disconnect(); res(null); } };
    const mo = new MutationObserver(chk);
    mo.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true });
    const loop = () => { if (!done) { chk(); requestAnimationFrame(loop); } };
    chk(); requestAnimationFrame(loop);
  });
  m.scrollTop = []; m.rows = []; m.scroller = null;
  window.__findScroller = () => {
    const root = document.querySelector("[data-timeline-root]"); if (!root) return null;
    const anc = []; let p = root.parentElement; while (p) { anc.push(p); p = p.parentElement; }
    return [root, ...root.querySelectorAll("*"), ...anc].filter((e) => e.scrollHeight > e.clientHeight + 200 && /(auto|scroll)/.test(getComputedStyle(e).overflowY)).sort((a, b) => b.scrollHeight - a.scrollHeight)[0] ?? null;
  };
  let fi = 0;
  const loop = (t) => {
    if (m.rec) {
      m.frames.push(t);
      if (m.scroller) m.scrollTop.push(m.scroller.scrollTop);
      if (fi++ % 8 === 0) m.rows.push(document.querySelectorAll("[data-timeline-row-id]").length);
    }
    requestAnimationFrame(loop);
  };
  requestAnimationFrame(loop);
})();`;

async function openPage(
  browser,
  {
    url,
    scheme = "dark",
    cpu = CPU,
    width = 1440,
    height = 900,
    waitFor = "[data-thread-item]",
  } = {},
) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    storageState: STATE,
    colorScheme: scheme,
    reducedMotion: "no-preference",
  });
  await ctx.addInitScript(INIT);
  const page = await ctx.newPage();
  const cdp = await ctx.newCDPSession(page);
  if (WSDELAY > 0) {
    await page.routeWebSocket(/\/ws(\?|$)/, (ws) => {
      const server = ws.connectToServer();
      ws.onMessage((m) => setTimeout(() => server.send(m), WSDELAY));
      server.onMessage((m) => setTimeout(() => ws.send(m), WSDELAY));
      ws.onClose((code, reason) => server.close({ code, reason }));
      server.onClose((code, reason) => ws.close({ code, reason }));
    });
  }
  await cdp.send("Performance.enable");
  await cdp.send("HeapProfiler.enable");
  if (cpu > 1) await cdp.send("Emulation.setCPUThrottlingRate", { rate: cpu });
  await page.goto(url, { waitUntil: "domcontentloaded" });
  await page.waitForSelector(waitFor, { timeout: 60000 });
  return { ctx, page, cdp };
}
const metrics = async (cdp) =>
  Object.fromEntries(
    (await cdp.send("Performance.getMetrics")).metrics.map((m) => [m.name, m.value]),
  );
const delta = (a, b) => Object.fromEntries(Object.keys(b).map((k) => [k, b[k] - (a[k] ?? 0)]));
const now = (page) => page.evaluate(() => performance.now());
const gc = async (cdp) => {
  await cdp.send("HeapProfiler.collectGarbage");
  await cdp.send("HeapProfiler.collectGarbage");
};
// waits until no DOM mutation and no long task for quietMs
async function settle(page, quietMs = 700, maxMs = 20000) {
  await page.evaluate(
    ([quiet, max]) =>
      new Promise((res) => {
        let last = performance.now();
        const start = last;
        const mo = new MutationObserver(() => (last = performance.now()));
        mo.observe(document.documentElement, {
          subtree: true,
          childList: true,
          characterData: true,
          attributes: true,
        });
        const tick = () => {
          const lt = window.__m.lt.length ? window.__m.lt[window.__m.lt.length - 1] : null;
          const lastBusy = Math.max(last, lt ? lt[0] + lt[1] : 0);
          if (performance.now() - lastBusy > quiet || performance.now() - start > max) {
            mo.disconnect();
            res();
          } else setTimeout(tick, 100);
        };
        setTimeout(tick, quiet);
      }),
    [quietMs, maxMs],
  );
}
const longTasksSince = (page, t0, t1 = Infinity) =>
  page.evaluate(([a, b]) => window.__m.lt.filter((x) => x[0] >= a && x[0] <= b), [t0, t1]);
const clsSince = (page, t0) =>
  page.evaluate((a) => window.__m.cls.filter((x) => x[0] >= a).reduce((s, x) => s + x[1], 0), t0);
const summarizeLT = (lt) => ({
  count: lt.length,
  totalMs: r1(lt.reduce((s, x) => s + x[1], 0)),
  maxMs: r1(Math.max(0, ...lt.map((x) => x[1]))),
});

// ---------- scenario: composer typing latency ----------
const FILLER =
  "the quick brown fox jumps over the lazy dog while we measure how long a keystroke takes to reach pixels ";
async function typingCase(
  page,
  cdp,
  { chars = 0, lines = false, nkeys = 40, gap = 70, burst = 100 },
) {
  const ed = page.locator(".composer-tiptap").first();
  await ed.click();
  await page.keyboard.press("Meta+A");
  await page.keyboard.press("Delete");
  let pasteMs = null;
  if (chars > 0) {
    let text = "";
    while (text.length < chars) text += FILLER;
    text = text.slice(0, chars);
    const tA = await now(page);
    if (lines) {
      // multi-paragraph paste through a synthetic ClipboardEvent (what Cmd+V delivers to ProseMirror)
      const multi = text.match(/.{1,60}/g).join("\n");
      await page.evaluate((t) => {
        const el = document.querySelector(".composer-tiptap");
        const dt = new DataTransfer();
        dt.setData("text/plain", t);
        el.dispatchEvent(
          new ClipboardEvent("paste", { clipboardData: dt, bubbles: true, cancelable: true }),
        );
      }, multi);
    } else await page.keyboard.insertText(text);
    await page.evaluate(
      () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))),
    );
    pasteMs = (await now(page)) - tA;
  }
  await settle(page, 500, 8000);
  await page.evaluate(() => {
    window.__m.keys.length = 0;
  });
  // idle baseline
  const i0 = await metrics(cdp);
  await page.waitForTimeout(1000);
  const i1 = await metrics(cdp);
  const idleTaskMsPerSec = (i1.TaskDuration - i0.TaskDuration) * 1000;
  const tStart = await now(page);
  const m0 = await metrics(cdp);
  for (let i = 0; i < nkeys; i++) {
    await page.keyboard.type(String.fromCharCode(97 + (i % 26)));
    await page.waitForTimeout(gap);
  }
  await page.waitForTimeout(300);
  const m1 = await metrics(cdp);
  const paced = await page.evaluate(() => window.__m.keys.slice());
  const tPaced = await now(page);
  // key-repeat (holding a key: ~30 keys/s)
  await page.evaluate(() => {
    window.__m.keys.length = 0;
  });
  const tb0 = await now(page);
  await page.keyboard.type("x".repeat(burst), { delay: 33 });
  await page.waitForTimeout(300);
  const burstKeys = await page.evaluate(() => window.__m.keys.slice());
  const tEnd = await now(page);
  const ev = await page.evaluate(
    ([a]) => window.__m.ev.filter((e) => e[1] >= a && e[0].startsWith("key")).map((e) => e[2]),
    [tStart],
  );
  const lt = await longTasksSince(page, tStart);
  const d = delta(m0, m1);
  const wall = (tPaced - tStart - 300) / 1000;
  return {
    pasteMs: r1(pasteMs),
    p50: r1(q(paced, 0.5)),
    p95: r1(q(paced, 0.95)),
    max: r1(Math.max(...paced)),
    evOver16: ev.length,
    evMax: r1(Math.max(0, ...ev)),
    taskMsPerKey: r1((d.TaskDuration * 1000 - idleTaskMsPerSec * wall) / nkeys),
    scriptMsPerKey: r1((d.ScriptDuration * 1000) / nkeys),
    styleMsPerKey: r1((d.RecalcStyleDuration * 1000) / nkeys),
    layoutMsPerKey: r1((d.LayoutDuration * 1000) / nkeys),
    layoutsPerKey: r1(d.LayoutCount / nkeys),
    recalcsPerKey: r1(d.RecalcStyleCount / nkeys),
    idleTaskMsPerSec: r1(idleTaskMsPerSec),
    longTasks: summarizeLT(lt),
    repeat30: {
      n: burstKeys.length,
      p50: r1(q(burstKeys, 0.5)),
      p95: r1(q(burstKeys, 0.95)),
      max: r1(Math.max(0, ...burstKeys)),
      totalMs: r1(tEnd - tb0 - 300),
    },
  };
}
async function scenarioTyping() {
  const cases = [
    { name: "draft-empty", target: "draft", chars: 0 },
    { name: "draft-200", target: "draft", chars: 200 },
    { name: "draft-2000", target: "draft", chars: 2000 },
    { name: "draft-2000-paste-multiline", target: "draft", chars: 2000, lines: true },
    { name: "draft-10000", target: "draft", chars: 10000 },
    { name: "draft-10000-paste-multiline", target: "draft", chars: 10000, lines: true },
    { name: "draft-50000-paste-multiline", target: "draft", chars: 50000, lines: true, nkeys: 20 },
    { name: "long60-2000", target: "long60", chars: 2000 },
    { name: "huge-2000", target: "huge", chars: 2000 },
  ];
  const browser = await chromium.launch();
  const out = {};
  const only = args.cases ? args.cases.split(",") : null;
  for (const c of cases.filter((c) => !only || only.includes(c.name))) {
    out[c.name] = [];
    for (let r = 0; r < RUNS; r++) {
      const url = c.target === "draft" ? `${BASE}/` : tUrl(T[c.target]);
      const { ctx, page, cdp } = await openPage(browser, { url, waitFor: ".composer-tiptap" });
      await settle(page, 800, 15000);
      out[c.name].push(await typingCase(page, cdp, c));
      await ctx.close();
    }
    console.error(
      "typing",
      c.name,
      JSON.stringify(out[c.name].map((x) => [x.p50, x.p95, x.taskMsPerKey])),
    );
  }
  await browser.close();
  return out;
}

// ---------- scenario: thread switching ----------
async function armSwitch(page, title, prevIds) {
  await page.evaluate(
    ([title, prevIds]) => {
      const st = (window.__sw = {
        t0: null,
        tTitle: null,
        tRows: null,
        tBlankEnd: null,
        tLast: null,
        sawLoading: false,
        loadingMs: 0,
        nodes: null,
        rows: null,
      });
      window.__m.frames.length = 0;
      window.__m.rec = true;
      addEventListener(
        "click",
        (e) => {
          if (st.t0 === null) st.t0 = e.timeStamp;
        },
        { capture: true, once: true },
      );
      const prev = new Set(prevIds);
      let lastCheck = 0;
      const check = () => {
        const n = performance.now();
        if (st.t0 === null) return;
        st.tLast = n;
        if (n - lastCheck < 3 && st.tRows !== null) return;
        lastCheck = n;
        if (st.tTitle === null) {
          const h = document.querySelector("[data-chat-header]");
          if (h && h.textContent.includes(title)) st.tTitle = n;
        }
        if (document.querySelector("[data-timeline-loading]")) st.sawLoading = true;
        if (st.tRows === null) {
          const ids = [...document.querySelectorAll("[data-message-id]")].map((e) =>
            e.getAttribute("data-message-id"),
          );
          if (ids.length > 0 && ids.some((i) => !prev.has(i))) st.tRows = n;
        }
      };
      const mo = new MutationObserver(check);
      mo.observe(document.documentElement, {
        subtree: true,
        childList: true,
        characterData: true,
        attributes: true,
      });
      const loop = () => {
        check();
        if (st.t0 === null || performance.now() - st.t0 < 6000) requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
      window.__swStop = () => {
        mo.disconnect();
        window.__m.rec = false;
      };
    },
    [title, prevIds],
  );
}
async function switchTo(page, cdp, thread, label) {
  const prevIds = await page.evaluate(() =>
    [...document.querySelectorAll("[data-message-id]")].map((e) =>
      e.getAttribute("data-message-id"),
    ),
  );
  const row = page.locator(`[data-thread-item="${ENV}:${thread.id}"] [role=button]`).first();
  if ((await row.count()) === 0) return { label, error: "row not in sidebar" };
  await armSwitch(page, thread.title, prevIds);
  const m0 = await metrics(cdp);
  await row.scrollIntoViewIfNeeded();
  await row.click();
  await page.waitForTimeout(2500);
  await settle(page, 500, 12000);
  const m1 = await metrics(cdp);
  const res = await page.evaluate(() => {
    const st = window.__sw;
    const fr = window.__m.frames.filter((t) => t >= st.t0);
    const gaps = fr.slice(1).map((t, i) => t - fr[i]);
    const out = {
      st,
      gaps,
      lt: window.__m.lt.filter((x) => x[0] >= st.t0),
      nodes: document.getElementsByTagName("*").length,
      rows: document.querySelectorAll("[data-timeline-row-id]").length,
      ev: window.__m.ev
        .filter((e) => e[1] >= st.t0 && e[1] < st.t0 + 3000)
        .map((e) => [e[0], e[2]]),
    };
    window.__swStop();
    return out;
  });
  const { st } = res;
  const lt = res.lt.filter((x) => x[0] < st.t0 + 3000);
  const d = delta(m0, m1);
  return {
    label,
    toTitleMs: r1(st.tTitle - st.t0),
    toRowsMs: st.tRows == null ? null : r1(st.tRows - st.t0),
    sawLoadingMarker: st.sawLoading,
    maxFrameGapMs: r1(Math.max(0, ...res.gaps.filter((_, i) => res.gaps.length && true))),
    framesOver50: res.gaps.filter((g) => g > 50).length,
    longTasks: summarizeLT(lt),
    taskMs: r1(d.TaskDuration * 1000),
    scriptMs: r1(d.ScriptDuration * 1000),
    layoutMs: r1(d.LayoutDuration * 1000),
    styleMs: r1(d.RecalcStyleDuration * 1000),
    clickEventMs: r1(
      Math.max(
        0,
        ...res.ev.filter((e) => e[0] === "click" || e[0] === "pointerup").map((e) => e[1]),
      ),
    ),
    nodes: res.nodes,
    rows: res.rows,
  };
}
async function scenarioSwitch() {
  const seq = [
    ["seed", "long60", "cold"],
    ["long60", "huge", "cold"],
    ["huge", "seed", "warm"],
    ["seed", "long60", "warm"],
    ["long60", "huge", "warm"],
    ["huge", "seed2", "cold"],
  ];
  const browser = await chromium.launch();
  const runs = [];
  for (let r = 0; r < RUNS; r++) {
    const { ctx, page, cdp } = await openPage(browser, {
      url: tUrl(T.seed),
      waitFor: "[data-timeline-root]",
    });
    await settle(page, 800, 15000);
    const rows = [];
    for (const [from, to, kind] of seq)
      rows.push(await switchTo(page, cdp, T[to], `${from}->${to} (${kind})`));
    runs.push(rows);
    await ctx.close();
    console.error(
      "switch run",
      r,
      JSON.stringify(rows.map((x) => [x.label, x.toTitleMs, x.toRowsMs, x.longTasks?.maxMs])),
    );
  }
  await browser.close();
  return { seq: seq.map((s) => s.join(" ")), runs };
}

// timed(): run `act`, return ms from the triggering input event (click/keydown timeStamp) to each DOM milestone.
async function timed(page, { arm = "click", act, milestones, timeout = 10000 }) {
  await page.evaluate((type) => window.__arm(type), arm);
  const ps = Object.entries(milestones).map(([name, src]) =>
    page
      .evaluate(
        ([src, to]) => window.__until(new Function("return (" + src + ")"), to),
        [src, timeout],
      )
      .then((t) => [name, t]),
  );
  await act();
  const res = Object.fromEntries(await Promise.all(ps));
  const t0 = await page.evaluate(() => window.__t0);
  return Object.fromEntries(
    Object.entries(res).map(([k, v]) => [k, v == null ? null : r1(v - t0)]),
  );
}
const SETTINGS_OPEN = `(() => { const d = document.querySelector('[role=dialog][aria-label="Settings"]'); return !!d && d.getBoundingClientRect().width > 300; })()`;
const SETTINGS_FILLED = `(() => { const d = document.querySelector('[role=dialog][aria-label="Settings"]'); return !!d && d.innerText.length > 600; })()`;
const SETTINGS_GONE = `!document.querySelector('[role=dialog][aria-label="Settings"]')`;
const PAL = `document.querySelector('[role=dialog][aria-label="Command palette"]')`;

// ---------- scenario: opening Settings / palette / diff panel ----------
async function scenarioPanels() {
  const browser = await chromium.launch();
  const runs = [];
  for (let r = 0; r < RUNS; r++) {
    const { ctx, page, cdp } = await openPage(browser, {
      url: tUrl(T.seed),
      waitFor: "[data-timeline-root]",
    });
    await settle(page, 800, 15000);
    const o = {};
    // Settings: first open (cold chunk), close, second open (warm), then nav to Appearance (cold) and Providers (cold)
    o.settingsOpenFirst = await timed(page, {
      act: () => page.click('button[aria-label="Settings"]'),
      milestones: { visible: SETTINGS_OPEN, filled: SETTINGS_FILLED },
    });
    await page.waitForTimeout(600);
    o.settingsNavAppearance = await timed(page, {
      act: () =>
        page
          .locator(
            '[role=dialog][aria-label="Settings"] a, [role=dialog][aria-label="Settings"] button',
          )
          .filter({ hasText: /^Appearance$/ })
          .first()
          .click(),
      milestones: {
        filled: `document.querySelector('[role=dialog][aria-label="Settings"]').innerText.includes("Motion")`,
      },
    });
    await page.waitForTimeout(400);
    o.settingsNavProviders = await timed(page, {
      act: () =>
        page
          .locator(
            '[role=dialog][aria-label="Settings"] a, [role=dialog][aria-label="Settings"] button',
          )
          .filter({ hasText: /^Providers$/ })
          .first()
          .click(),
      milestones: {
        filled: `document.querySelector('[role=dialog][aria-label="Settings"]').innerText.includes("Codex")`,
      },
    });
    await page.waitForTimeout(400);
    o.settingsClose = await timed(page, {
      arm: "keydown",
      act: () => page.keyboard.press("Escape"),
      milestones: { gone: SETTINGS_GONE },
    });
    await page.waitForTimeout(700);
    o.settingsOpenSecond = await timed(page, {
      act: () => page.click('button[aria-label="Settings"]'),
      milestones: { visible: SETTINGS_OPEN, filled: SETTINGS_FILLED },
    });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(700);
    // Command palette: first and second open
    o.paletteOpenFirst = await timed(page, {
      arm: "keydown",
      act: () => page.keyboard.press("Meta+K"),
      milestones: {
        visible: `!!${PAL} && ${PAL}.getBoundingClientRect().width > 300`,
        hasRows: `!!${PAL} && ${PAL}.querySelectorAll('[role=option]').length > 3`,
      },
    });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    o.paletteOpenSecond = await timed(page, {
      arm: "keydown",
      act: () => page.keyboard.press("Meta+K"),
      milestones: {
        visible: `!!${PAL} && ${PAL}.getBoundingClientRect().width > 300`,
        hasRows: `!!${PAL} && ${PAL}.querySelectorAll('[role=option]').length > 3`,
      },
    });
    await page.keyboard.press("Escape");
    await page.waitForTimeout(600);
    // Diff panel: open (panel shell), file rows, expand all (worker boot + highlight)
    o.diffOpenFirst = await timed(page, {
      act: () => page.click('button:has-text("Changes")'),
      milestones: {
        panel: `!!document.querySelector('[data-right-panel-tabbar]')`,
        files: `document.querySelectorAll('diffs-container').length >= 2`,
      },
    });
    await page.waitForTimeout(800);
    o.diffExpandFirst = await timed(page, {
      act: () => page.click('button[aria-label="Expand all files"]'),
      milestones: {
        body: `[...document.querySelectorAll('diffs-container')].some(h => h.getBoundingClientRect().height > 120)`,
      },
      timeout: 20000,
    });
    await page.waitForTimeout(600);
    // close and reopen the panel (warm)
    await page.click('button[aria-label="Toggle right panel"]');
    await page.waitForTimeout(800);
    o.diffOpenSecond = await timed(page, {
      act: () => page.click('button[aria-label="Toggle right panel"]'),
      milestones: {
        panel: `!!document.querySelector('[data-right-panel-tabbar]')`,
        body: `[...document.querySelectorAll('diffs-container')].some(h => h.getBoundingClientRect().height > 120)`,
      },
    });
    o.longTasksTotal = summarizeLT(await longTasksSince(page, 0));
    runs.push(o);
    await ctx.close();
    console.error("panels run", r, JSON.stringify(o));
  }
  await browser.close();
  return runs;
}

// ---------- scenario: sidebar search / palette typing with 142 threads, project filter ----------
async function scenarioPalette() {
  const browser = await chromium.launch();
  const runs = [];
  for (const query of ["long conv", "capitalize"]) {
    const perRun = [];
    for (let r = 0; r < RUNS; r++) {
      const { ctx, page, cdp } = await openPage(browser, {
        url: tUrl(T.seed),
        waitFor: "[data-timeline-root]",
      });
      await settle(page, 800, 15000);
      await page.keyboard.press("Meta+K");
      await page.waitForSelector('[role=dialog][aria-label="Command palette"] [role=option]', {
        timeout: 10000,
      });
      await page.waitForTimeout(800);
      const keyTimes = [];
      const m0 = await metrics(cdp);
      const tStart = await now(page);
      for (const ch of query) {
        await page.evaluate(() => {
          window.__palSnap = document.querySelector(
            '[role=dialog][aria-label="Command palette"]',
          ).innerText;
        });
        const t = await timed(page, {
          arm: "keydown",
          act: () => page.keyboard.type(ch),
          milestones: {
            change: `document.querySelector('[role=dialog][aria-label="Command palette"]').innerText !== window.__palSnap`,
          },
          timeout: 1500,
        });
        keyTimes.push(t.change);
        await page.waitForTimeout(110);
      }
      const settled = await timed(page, {
        arm: "keydown",
        act: () => page.keyboard.type("x"),
        milestones: {
          noSearching: `!document.querySelector('[role=dialog][aria-label="Command palette"]').innerText.includes("Searching")`,
        },
        timeout: 6000,
      });
      await page.waitForTimeout(200);
      const m1 = await metrics(cdp);
      const keys = await page.evaluate(() => window.__m.keys.slice());
      const lt = await longTasksSince(page, tStart);
      const rows = await page.evaluate(
        () =>
          document.querySelectorAll('[role=dialog][aria-label="Command palette"] [role=option]')
            .length,
      );
      perRun.push({
        query,
        firstChangeP50: r1(median(keyTimes.filter((x) => x != null))),
        firstChangeMax: r1(Math.max(...keyTimes.filter((x) => x != null))),
        nullChanges: keyTimes.filter((x) => x == null).length,
        keyPaintP50: r1(q(keys, 0.5)),
        keyPaintMax: r1(Math.max(...keys)),
        searchSettledAfterLastKeyMs: settled.noSearching,
        longTasks: summarizeLT(lt),
        taskMsPerKey: r1(((m1.TaskDuration - m0.TaskDuration) * 1000) / (query.length + 1)),
        rows,
      });
      await ctx.close();
    }
    runs.push({ query, perRun });
    console.error(
      "palette",
      query,
      JSON.stringify(
        perRun.map((x) => [
          x.firstChangeP50,
          x.firstChangeMax,
          x.keyPaintP50,
          x.searchSettledAfterLastKeyMs,
          x.longTasks.maxMs,
        ]),
      ),
    );
  }
  // project filter popover in the sidebar
  const pf = [];
  for (let r = 0; r < RUNS; r++) {
    const { ctx, page } = await openPage(browser, {
      url: tUrl(T.seed),
      waitFor: "[data-timeline-root]",
    });
    await settle(page, 800, 15000);
    const open = await timed(page, {
      act: () => page.click('button[aria-label="Filter threads by project"]'),
      milestones: {
        popup: `!!document.querySelector('[role=listbox], [role=dialog], [data-slot=combobox-popup], [data-slot=popover-popup]')`,
      },
    });
    pf.push(open);
    await ctx.close();
  }
  runs.push({ projectFilterOpen: pf });
  await browser.close();
  return runs;
}

// ---------- scenario: scroll smoothness on the 60-run thread ----------
async function loadAllHistory(page) {
  const times = [];
  for (let i = 0; i < 14; i++) {
    const btn = page.getByRole("button", { name: /Load earlier turns/ }).first();
    if ((await btn.count()) === 0 || !(await btn.isVisible().catch(() => false))) break;
    const before = await page.evaluate(() => window.__findScroller()?.scrollHeight ?? 0);
    const t = await timed(page, {
      act: () => btn.click(),
      milestones: {
        grew: `(() => { const s = window.__findScroller(); return !!s && s.scrollHeight > ${before} + 400; })()`,
      },
      timeout: 6000,
    });
    times.push(t.grew);
    await page.waitForTimeout(500);
  }
  return times;
}
async function scrollRun(page, cdp, { dir, events = 220, dy = 110, gapMs = 12 }) {
  await page.evaluate(() => {
    const m = window.__m;
    m.frames = [];
    m.scrollTop = [];
    m.rows = [];
    m.rec = true;
  });
  const t0 = await now(page);
  const m0 = await metrics(cdp);
  await page.mouse.move(720, 400);
  for (let i = 0; i < events; i++) {
    await page.mouse.wheel(0, dir * dy);
    await page.waitForTimeout(gapMs);
  }
  await page.waitForTimeout(400);
  const m1 = await metrics(cdp);
  const res = await page.evaluate(() => {
    window.__m.rec = false;
    return {
      frames: window.__m.frames.slice(),
      st: window.__m.scrollTop.slice(),
      rows: window.__m.rows.slice(),
    };
  });
  const gaps = res.frames.slice(1).map((t, i) => t - res.frames[i]);
  const active = gaps.slice(0, Math.max(1, gaps.length - 20));
  const lt = (await longTasksSince(page, t0)).filter((x) => x[1] >= 50);
  const cls = await clsSince(page, t0);
  const clsSrc = await page.evaluate((a) => {
    const c = {};
    window.__m.cls
      .filter((x) => x[0] >= a)
      .forEach((x) => {
        const k = (x[2] || []).join(" | ");
        c[k] = (c[k] || 0) + x[1];
      });
    return Object.entries(c)
      .sort((x, y) => y[1] - x[1])
      .slice(0, 3)
      .map(([k, v]) => [k, Math.round(v * 10000) / 10000]);
  }, t0);
  let reversals = 0,
    bigJumps = 0;
  for (let i = 1; i < res.st.length; i++) {
    const d = res.st[i] - res.st[i - 1];
    if (dir < 0 ? d > 2 : d < -2) reversals++;
    if (Math.abs(d) > dy * 8) bigJumps++;
  }
  const d = delta(m0, m1);
  return {
    frames: active.length,
    p50: r1(q(active, 0.5)),
    p95: r1(q(active, 0.95)),
    p99: r1(q(active, 0.99)),
    maxGap: r1(Math.max(...active)),
    over20: active.filter((g) => g > 20).length,
    over34: active.filter((g) => g > 34).length,
    over50: active.filter((g) => g > 50).length,
    longTasks: summarizeLT(lt),
    cls: Math.round(cls * 10000) / 10000,
    clsSrc,
    reversals,
    bigJumps,
    scrolledPx: Math.round(Math.abs((res.st.at(-1) ?? 0) - (res.st[0] ?? 0))),
    rowsMin: Math.min(...res.rows),
    rowsMax: Math.max(...res.rows),
    taskMsPerFrame: r1((d.TaskDuration * 1000) / active.length),
    styleCount: d.RecalcStyleCount,
    layoutCount: d.LayoutCount,
  };
}
async function scenarioScroll() {
  const browser = await chromium.launch();
  const runs = [];
  for (let r = 0; r < RUNS; r++) {
    const { ctx, page, cdp } = await openPage(browser, {
      url: tUrl(T.long60),
      waitFor: "[data-timeline-root]",
    });
    await settle(page, 800, 15000);
    const mount = await page.evaluate(() => ({
      rows: document.querySelectorAll("[data-timeline-row-id]").length,
      nodes: document.getElementsByTagName("*").length,
    }));
    const loads = await loadAllHistory(page);
    await settle(page, 600, 8000);
    const scr = await page.evaluate(() => {
      const s = window.__findScroller();
      window.__m.scroller = s ?? null;
      if (s) s.scrollTop = s.scrollHeight;
      return s
        ? {
            scrollHeight: s.scrollHeight,
            clientHeight: s.clientHeight,
            rowsMounted: document.querySelectorAll("[data-timeline-row-id]").length,
            nodes: document.getElementsByTagName("*").length,
            totalMessageRowsLoaded: null,
          }
        : null;
    });
    if (!scr) {
      runs.push({ error: "no scroller" });
      await ctx.close();
      continue;
    }
    await page.waitForTimeout(800);
    const up = await scrollRun(page, cdp, { dir: -1 });
    const down = await scrollRun(page, cdp, { dir: 1 });
    const up2 = await scrollRun(page, cdp, { dir: -1, events: 400, dy: 220, gapMs: 8 });
    runs.push({ mount, loads, scroller: scr, up, down, upFast: up2 });
    await ctx.close();
    console.error(
      "scroll run",
      r,
      JSON.stringify({
        loads,
        scr,
        up: [up.p95, up.over34, up.longTasks.maxMs, up.reversals],
        down: [down.p95, down.over34, down.longTasks.maxMs],
        upFast: [up2.p95, up2.over34],
      }),
    );
  }
  await browser.close();
  return runs;
}

// ---------- scenario: theme switch ----------
async function scenarioTheme() {
  const browser = await chromium.launch();
  const runs = [];
  for (const target of ["long60", "seed"]) {
    for (let r = 0; r < RUNS; r++) {
      const { ctx, page, cdp } = await openPage(browser, {
        url: tUrl(T[target]),
        waitFor: "[data-timeline-root]",
        scheme: "dark",
      });
      await settle(page, 800, 15000);
      const o = { target };
      for (const [from, to] of [
        ["dark", "light"],
        ["light", "dark"],
      ]) {
        await page.waitForTimeout(500);
        const m0 = await metrics(cdp);
        await page.evaluate(() => {
          window.__themeT = { cls: null, paint: null, anims: null };
          const mo = new MutationObserver(() => {
            if (window.__themeT.cls === null) {
              window.__themeT.cls = performance.now();
              requestAnimationFrame(() =>
                requestAnimationFrame(() => {
                  window.__themeT.paint = performance.now();
                }),
              );
              setTimeout(() => {
                window.__themeT.anims = document.getAnimations().length;
              }, 40);
              mo.disconnect();
            }
          });
          mo.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["class", "style"],
          });
        });
        const tA = await now(page);
        await page.emulateMedia({ colorScheme: to });
        await page.waitForTimeout(900);
        const m1 = await metrics(cdp);
        const th = await page.evaluate(() => window.__themeT);
        const lt = await longTasksSince(page, tA);
        const d = delta(m0, m1);
        o[`${from}->${to}`] = {
          classFlipMs: th.cls == null ? null : r1(th.cls - tA),
          paintMs: th.paint == null ? null : r1(th.paint - tA),
          animationsAt40ms: th.anims,
          longTasks: summarizeLT(lt),
          styleMs: r1(d.RecalcStyleDuration * 1000),
          layoutMs: r1(d.LayoutDuration * 1000),
          scriptMs: r1(d.ScriptDuration * 1000),
          recalcs: d.RecalcStyleCount,
          layouts: d.LayoutCount,
        };
      }
      runs.push(o);
      await ctx.close();
    }
    console.error(
      "theme",
      target,
      JSON.stringify(
        runs
          .filter((x) => x.target === target)
          .map((x) => [
            x["dark->light"].paintMs,
            x["dark->light"].longTasks.maxMs,
            x["light->dark"].paintMs,
          ]),
      ),
    );
  }
  await browser.close();
  return runs;
}

async function clickRow(page, key) {
  const row = page.locator(`[data-thread-item="${key}"] [role=button]`).first();
  try {
    await row.evaluate((e) => e.scrollIntoView({ block: "center" }));
    await row.click({ timeout: 8000 });
    return true;
  } catch {
    await row.evaluate((e) => e.click()).catch(() => {});
    return false;
  }
}
// ---------- scenario: memory growth over thread switches ----------
async function scenarioMemory() {
  const browser = await chromium.launch();
  const runs = [];
  for (let r = 0; r < RUNS; r++) {
    const { ctx, page, cdp } = await openPage(browser, {
      url: tUrl(T.seed),
      waitFor: "[data-timeline-root]",
    });
    await settle(page, 1000, 15000);
    const snap = async (label) => {
      await gc(cdp);
      const m = await metrics(cdp);
      const attached = await page.evaluate(() => document.getElementsByTagName("*").length);
      return {
        label,
        heapMB: r1(m.JSHeapUsedSize / 1048576),
        nodes: m.Nodes,
        attached,
        listeners: m.JSEventListeners,
        docs: m.Documents,
      };
    };
    const out = [await snap("start")];
    // 30 distinct sidebar threads (the clone fixtures), checkpoints at 10/20/30, then back to start thread
    const keys = await page.evaluate(() =>
      [...document.querySelectorAll("[data-thread-item]")]
        .map((e) => e.getAttribute("data-thread-item"))
        .slice(0, 34),
    );
    const own = `${ENV}:${T.seed.id}`;
    const list = keys.filter((k) => k !== own && !k.endsWith(T.huge.id)).slice(0, 30);
    let i = 0;
    for (const k of list) {
      await clickRow(page, k);
      await page.waitForTimeout(350);
      i++;
      if (i === 10 || i === 20 || i === 30) {
        await settle(page, 400, 6000);
        out.push(await snap(`after ${i} switches`));
      }
    }
    await clickRow(page, own);
    await page.waitForTimeout(800);
    await settle(page, 500, 6000);
    out.push(await snap("back on start thread"));
    // heavy cycle: long60 <-> seed x5 (10 switches)
    for (let c = 0; c < 5; c++) {
      for (const t of [T.long60, T.seed]) {
        await clickRow(page, `${ENV}:${t.id}`);
        await page.waitForTimeout(500);
      }
    }
    await settle(page, 500, 6000);
    out.push(await snap("after +10 long60/seed switches"));
    runs.push(out);
    await ctx.close();
    console.error(
      "memory run",
      r,
      JSON.stringify(out.map((x) => [x.label, x.heapMB, x.nodes, x.attached, x.listeners])),
    );
  }
  await browser.close();
  return runs;
}

// ---------- scenario: idle cost with a thread open ----------
async function scenarioIdle() {
  const browser = await chromium.launch();
  const runs = [];
  for (const target of ["seed", "long60", "draft"]) {
    for (let r = 0; r < RUNS; r++) {
      const url = target === "draft" ? `${BASE}/` : tUrl(T[target]);
      const { ctx, page, cdp } = await openPage(browser, { url, waitFor: ".composer-tiptap" });
      await settle(page, 1200, 15000);
      await browser.startTracing(page, { categories: ["devtools.timeline"] });
      const m0 = await metrics(cdp);
      await page.waitForTimeout(10000);
      const m1 = await metrics(cdp);
      const buf = await browser.stopTracing();
      const ev = JSON.parse(buf.toString()).traceEvents ?? [];
      const count = (n) => ev.filter((e) => e.name === n).length;
      const anims = await page.evaluate(() =>
        document.getAnimations().map((a) => a.animationName ?? a.constructor.name),
      );
      const d = delta(m0, m1);
      runs.push({
        target,
        cpuPct: r1((d.TaskDuration / 10) * 100),
        scriptMsPerSec: r1(d.ScriptDuration * 100),
        paints: count("Paint"),
        layouts: count("Layout"),
        recalcs: count("UpdateLayoutTree"),
        commits: count("Commit"),
        animations: anims.length,
        animNames: [...new Set(anims)].join(","),
      });
      await ctx.close();
    }
    console.error("idle", target, JSON.stringify(runs.filter((x) => x.target === target)));
  }
  await browser.close();
  return runs;
}

// ---------- scenario: sidebar list scroll (124 mounted rows, content-visibility) ----------
async function scenarioSidebar() {
  const browser = await chromium.launch();
  const runs = [];
  for (let r = 0; r < RUNS; r++) {
    const { ctx, page, cdp } = await openPage(browser, {
      url: tUrl(T.seed),
      waitFor: "[data-timeline-root]",
    });
    await settle(page, 800, 15000);
    const sc = await page.evaluate(() => {
      const sb = document.querySelector("[data-slot=sidebar]");
      const s = [...sb.querySelectorAll("*")]
        .filter(
          (e) =>
            e.scrollHeight > e.clientHeight + 200 &&
            /(auto|scroll)/.test(getComputedStyle(e).overflowY),
        )
        .sort((a, b) => b.scrollHeight - a.scrollHeight)[0];
      window.__m.scroller = s;
      s.scrollTop = 0;
      const b = s.getBoundingClientRect();
      return {
        scrollHeight: s.scrollHeight,
        rows: document.querySelectorAll("[data-thread-item]").length,
        nodesInSidebar: sb.getElementsByTagName("*").length,
        x: b.x + b.width / 2,
        y: b.y + b.height / 2,
      };
    });
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      const m = window.__m;
      m.frames = [];
      m.scrollTop = [];
      m.rows = [];
      m.rec = true;
    });
    const t0 = await now(page);
    const m0 = await metrics(cdp);
    await page.mouse.move(sc.x, sc.y);
    for (let i = 0; i < 200; i++) {
      await page.mouse.wheel(0, 100);
      await page.waitForTimeout(12);
    }
    await page.waitForTimeout(300);
    const m1 = await metrics(cdp);
    const res = await page.evaluate(() => {
      window.__m.rec = false;
      return { frames: window.__m.frames.slice(), st: window.__m.scrollTop.slice() };
    });
    const gaps = res.frames.slice(1).map((t, i) => t - res.frames[i]);
    const act = gaps.slice(0, Math.max(1, gaps.length - 20));
    const lt = (await longTasksSince(page, t0)).filter((x) => x[1] >= 50);
    const d = delta(m0, m1);
    runs.push({
      ...sc,
      frames: act.length,
      p50: r1(q(act, 0.5)),
      p95: r1(q(act, 0.95)),
      maxGap: r1(Math.max(...act)),
      over34: act.filter((g) => g > 34).length,
      longTasks: summarizeLT(lt),
      scrolledPx: Math.round((res.st.at(-1) ?? 0) - (res.st[0] ?? 0)),
      taskMsPerFrame: r1((d.TaskDuration * 1000) / act.length),
      layouts: d.LayoutCount,
      recalcs: d.RecalcStyleCount,
      cls: await clsSince(page, t0),
    });
    await ctx.close();
    console.error("sidebar", r, JSON.stringify(runs.at(-1)));
  }
  await browser.close();
  return runs;
}

// ---------- scenario: the 1 MB message (load earlier turns) ----------
async function scenarioHuge() {
  const browser = await chromium.launch();
  const runs = [];
  for (let r = 0; r < RUNS; r++) {
    const { ctx, page, cdp } = await openPage(browser, {
      url: tUrl(T.huge),
      waitFor: ".composer-tiptap",
    });
    await settle(page, 1500, 20000);
    const before = await page.evaluate(() => ({
      nodes: document.getElementsByTagName("*").length,
      rows: document.querySelectorAll("[data-timeline-row-id]").length,
    }));
    const btn = page.getByRole("button", { name: /Load earlier turns/ }).first();
    const m0 = await metrics(cdp);
    const tA = await now(page);
    const t = await timed(page, {
      act: () => btn.click(),
      milestones: {
        rows: `document.querySelectorAll('[data-timeline-row-id]').length > 0`,
        blocks: `document.querySelectorAll('[data-message-role=assistant] p, [data-message-role=assistant] pre').length > 200`,
      },
      timeout: 20000,
    });
    await settle(page, 800, 20000);
    const m1 = await metrics(cdp);
    const lt = (await longTasksSince(page, tA)).filter((x) => x[1] >= 50);
    const after = await page.evaluate(() => ({
      nodes: document.getElementsByTagName("*").length,
      rows: document.querySelectorAll("[data-timeline-row-id]").length,
    }));
    // typing right after load, with 100k nodes mounted
    const typ = await typingCase(page, cdp, { chars: 200, nkeys: 25 });
    // scroll the loaded thread
    await page.evaluate(() => {
      const s = window.__findScroller();
      window.__m.scroller = s;
      if (s) s.scrollTop = 0;
    });
    await page.waitForTimeout(400);
    const sc = await scrollRun(page, cdp, { dir: 1, events: 150, dy: 200, gapMs: 12 });
    runs.push({
      before,
      after,
      clickToRowsMs: t.rows,
      clickTo200BlocksMs: t.blocks,
      longTasks: summarizeLT(lt),
      taskMs: r1((m1.TaskDuration - m0.TaskDuration) * 1000),
      heapMB: r1(m1.JSHeapUsedSize / 1048576),
      typing: { p50: typ.p50, p95: typ.p95, max: typ.max, taskMsPerKey: typ.taskMsPerKey },
      scroll: {
        p50: sc.p50,
        p95: sc.p95,
        over34: sc.over34,
        maxGap: sc.maxGap,
        longTasks: sc.longTasks,
      },
    });
    await ctx.close();
    console.error("huge", r, JSON.stringify(runs.at(-1)));
  }
  await browser.close();
  return runs;
}

// ---------- scenario: send -> first visible feedback (LIVE AGENT TURNS: Claude Haiku 5.5, tiny prompts) ----------
// Creates its own probe thread in sample-app from a draft (first send), then sends one follow-up. Never touches seed threads.
const SEND_MILESTONES = (needle) => ({
  composerCleared: `(document.querySelector('.composer-tiptap')?.innerText ?? '').replace(/\\s+/g, '').length < 2`,
  userBubble: `[...document.querySelectorAll('[data-message-role=user]')].some(e => e.innerText.includes(${JSON.stringify(needle)}))`,
  workingRow: `!!document.querySelector('[data-timeline-row-kind="working"], [data-timeline-row-kind="thinking"]')`,
  firstAssistantText: `[...document.querySelectorAll('[data-message-role=assistant]')].some(e => e.innerText.trim().length > 0)`,
});
async function sendAndMeasure(page, cdp, needle, kind) {
  const btn = page
    .locator('button[aria-label="Submit message"], button[aria-label="Send message"]')
    .first();
  await page.evaluate(() => {
    const m = window.__m;
    m.frames = [];
    m.scrollTop = [];
    m.rows = [];
    m.rec = true;
  });
  const tA = await now(page);
  const m0 = await metrics(cdp);
  const wsBefore = await page.evaluate(() => window.__m.ws.length);
  const t = await timed(page, {
    act: () => btn.click(),
    milestones: {
      ...SEND_MILESTONES(needle),
      leftDraftRoute: `!location.pathname.startsWith('/draft/')`,
      settled: `(() => { const w = document.querySelector('[data-timeline-row-kind="working"], [data-timeline-row-kind="thinking"]'); return !w && [...document.querySelectorAll('[data-message-role=assistant]')].some(e => e.innerText.trim().length > 0) && window.__sawWorking; })()`,
    },
    timeout: 90000,
  });
  await page.waitForTimeout(800);
  const m1 = await metrics(cdp);
  const res = await page.evaluate(
    ([tA, wsBefore]) => {
      window.__m.rec = false;
      const t0 = window.__t0;
      return {
        t0,
        frames: window.__m.frames.filter((f) => f >= t0),
        ws: window.__m.ws.slice(wsBefore).map((w) => [w[0] - t0, w[1]]),
        cls: window.__m.cls
          .filter((c) => c[0] >= t0)
          .map((c) => [Math.round(c[1] * 10000) / 10000, c[2]]),
        lt: window.__m.lt.filter((x) => x[0] >= t0).map((x) => [x[0] - t0, x[1]]),
      };
    },
    [tA, wsBefore],
  );
  const gaps = res.frames.slice(1).map((f, i) => f - res.frames[i]);
  const d = delta(m0, m1);
  // WS -> paint lag for the first assistant text: nearest preceding WS frame
  const firstWsAfter = res.ws[0]?.[0] ?? null;
  const wsBeforeText =
    res.ws.filter((w) => w[0] <= (t.firstAssistantText ?? 0)).at(-1)?.[0] ?? null;
  return {
    kind,
    ...t,
    firstWsFrameMs: r1(firstWsAfter),
    lastWsFrameBeforeFirstTextMs: r1(wsBeforeText),
    wsToPaintLagMs:
      t.firstAssistantText != null && wsBeforeText != null
        ? r1(t.firstAssistantText - wsBeforeText)
        : null,
    wsFrames: res.ws.length,
    wsKB: r1(res.ws.reduce((a, w) => a + w[1], 0) / 1024),
    longTasks: summarizeLT(res.lt.map((x) => [x[0], x[1]])),
    longTaskList: res.lt.map((x) => [r1(x[0]), r1(x[1])]).slice(0, 6),
    framesOver34: gaps.filter((g) => g > 34).length,
    maxFrameGap: r1(Math.max(0, ...gaps)),
    cls: res.cls,
    recalcs: d.RecalcStyleCount,
    layouts: d.LayoutCount,
    taskMs: r1(d.TaskDuration * 1000),
    scriptMs: r1(d.ScriptDuration * 1000),
    styleMs: r1(d.RecalcStyleDuration * 1000),
    layoutMs: r1(d.LayoutDuration * 1000),
    turnWallMs: t.settled,
  };
}
async function scenarioSend() {
  const browser = await chromium.launch();
  const runs = [];
  const RUNS_SEND = Number(args.sendRuns ?? 2);
  for (let r = 0; r < RUNS_SEND; r++) {
    const { ctx, page, cdp } = await openPage(browser, {
      url: tUrl(T.seed),
      waitFor: "[data-timeline-root]",
    });
    await page.evaluate(() => {
      window.__sawWorking = false;
      new MutationObserver(() => {
        if (
          document.querySelector(
            '[data-timeline-row-kind="working"], [data-timeline-row-kind="thinking"]',
          )
        )
          window.__sawWorking = true;
      }).observe(document.documentElement, { subtree: true, childList: true });
    });
    await settle(page, 800, 15000);
    await page.click('button[aria-label="New thread in sample-app"]');
    await page.waitForSelector(".composer-tiptap");
    await page.waitForTimeout(800);
    await page.locator("[data-chat-provider-model-picker]").first().click();
    await page.waitForTimeout(500);
    await page.locator('button[aria-label="Claude"]').first().click();
    await page.waitForTimeout(400);
    await page
      .getByRole("option", { name: /Claude Haiku 5\.5/ })
      .first()
      .click();
    await page.waitForTimeout(600);
    const needle1 = `a22 perf probe ${Date.now() % 100000} reply with exactly OK`;
    await page.locator(".composer-tiptap").first().click();
    await page.keyboard.insertText(needle1);
    await settle(page, 400, 5000);
    const first = await sendAndMeasure(page, cdp, needle1, "first send from draft");
    // wait for the turn to finish, then follow up in the same (now server) thread
    await page.waitForTimeout(1500);
    await page.evaluate(() => {
      window.__sawWorking = false;
    });
    const needle2 = `a22 follow-up ${Date.now() % 100000} reply with exactly OK`;
    await page.locator(".composer-tiptap").first().click();
    await page.keyboard.insertText(needle2);
    await settle(page, 400, 5000);
    const follow = await sendAndMeasure(page, cdp, needle2, "follow-up in thread");
    const url = page.url();
    runs.push({ first, follow, threadUrlTail: url.split("/").at(-1).slice(0, 12) });
    console.error(
      "send",
      r,
      JSON.stringify({
        first: [
          first.composerCleared,
          first.userBubble,
          first.workingRow,
          first.firstAssistantText,
          first.settled,
        ],
        follow: [
          follow.composerCleared,
          follow.userBubble,
          follow.workingRow,
          follow.firstAssistantText,
          follow.settled,
        ],
      }),
    );
    await ctx.close();
  }
  await browser.close();
  return runs;
}

const scenarios = {
  send: scenarioSend,
  sidebar: scenarioSidebar,
  huge: scenarioHuge,
  typing: scenarioTyping,
  switch: scenarioSwitch,
  panels: scenarioPanels,
  palette: scenarioPalette,
  scroll: scenarioScroll,
  theme: scenarioTheme,
  memory: scenarioMemory,
  idle: scenarioIdle,
};
export {
  scenarios,
  T,
  ENV,
  BASE,
  RUNS,
  CPU,
  openPage,
  metrics,
  delta,
  gc,
  settle,
  now,
  q,
  r1,
  median,
  medianOf,
  summarizeLT,
  longTasksSince,
  clsSince,
  tUrl,
  chromium,
  ONLY,
  OUT,
  LABEL,
};

if (import.meta.url === `file://${process.argv[1]}`) {
  const results = fs.existsSync(OUT) ? JSON.parse(fs.readFileSync(OUT, "utf8")) : {};
  results._meta = {
    base: BASE,
    label: LABEL,
    runs: RUNS,
    cpu: CPU,
    ua: "playwright chromium headless",
    date: new Date().toISOString(),
  };
  for (const name of ONLY) {
    if (!scenarios[name]) {
      console.error("unknown scenario", name);
      continue;
    }
    console.error("== scenario", name, "base", BASE, "cpu", CPU);
    results[name] = await scenarios[name]();
    fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
  }
  console.error("wrote", OUT);
}
