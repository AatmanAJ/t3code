#!/usr/bin/env node
// Area 22: CDP sampling-profiler attribution (which functions/files own the main-thread time) for a few interactions.
// Usage: node profile.mjs --base http://localhost:5733 --what typing,palette,switch,idle,theme [--cpu 1]
// Run against the DEV server for readable names (unminified, per-file URLs); numbers are dev-build costs.
import { scenarios, openPage, T, tUrl, settle, now, chromium, BASE, CPU } from "./measure.mjs";
import fs from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((a, x, i, arr) => {
    if (x.startsWith("--")) a.push([x.slice(2), arr[i + 1]]);
    return a;
  }, []),
);
const WHAT = (args.what ?? "typing,palette,switch,idle,theme").split(",");

function summarize(profile, topN = 14) {
  const nodes = new Map(profile.nodes.map((n) => [n.id, n]));
  const self = new Map();
  const dts = profile.timeDeltas;
  for (let i = 0; i < profile.samples.length; i++)
    self.set(profile.samples[i], (self.get(profile.samples[i]) ?? 0) + (dts[i] ?? 0));
  const byFn = new Map(),
    byFile = new Map();
  let total = 0,
    idle = 0;
  for (const [id, us] of self) {
    const n = nodes.get(id);
    const cf = n.callFrame;
    if (cf.functionName === "(idle)") {
      idle += us;
      continue;
    }
    total += us;
    const file = (cf.url || "(native)")
      .replace(/^https?:\/\/[^/]+/, "")
      .replace(/\?t=\d+/, "")
      .replace(/\?v=\w+/, "");
    const key = `${cf.functionName || "(anonymous)"} ${file}:${cf.lineNumber + 1}`;
    byFn.set(key, (byFn.get(key) ?? 0) + us);
    byFile.set(file, (byFile.get(file) ?? 0) + us);
  }
  const top = (m) =>
    [...m]
      .sort((a, b) => b[1] - a[1])
      .slice(0, topN)
      .map(([k, v]) => [Math.round(v / 100) / 10, k]);
  return {
    activeMs: Math.round(total / 100) / 10,
    idleMs: Math.round(idle / 100) / 10,
    topFunctions: top(byFn),
    topFiles: top(byFile),
  };
}
async function withProfile(cdp, fn) {
  await cdp.send("Profiler.enable");
  await cdp.send("Profiler.setSamplingInterval", { interval: 200 });
  await cdp.send("Profiler.start");
  await fn();
  const { profile } = await cdp.send("Profiler.stop");
  return summarize(profile);
}

const browser = await chromium.launch();
const out = {};
for (const what of WHAT) {
  if (what === "typing") {
    const { ctx, page, cdp } = await openPage(browser, {
      url: `${BASE}/`,
      waitFor: ".composer-tiptap",
    });
    await settle(page, 800, 15000);
    await page.locator(".composer-tiptap").first().click();
    await page.keyboard.insertText("the quick brown fox jumps over the lazy dog ".repeat(45));
    await settle(page, 600, 8000);
    out.typing = await withProfile(cdp, async () => {
      for (let i = 0; i < 60; i++) {
        await page.keyboard.type(String.fromCharCode(97 + (i % 26)));
        await page.waitForTimeout(60);
      }
    });
    await ctx.close();
  }
  if (what === "palette") {
    const { ctx, page, cdp } = await openPage(browser, {
      url: tUrl(T.seed),
      waitFor: "[data-timeline-root]",
    });
    await settle(page, 800, 15000);
    await page.keyboard.press("Meta+K");
    await page.waitForSelector('[role=dialog][aria-label="Command palette"] [role=option]');
    await page.waitForTimeout(800);
    out.palette = await withProfile(cdp, async () => {
      for (const ch of "capitalize") {
        await page.keyboard.type(ch);
        await page.waitForTimeout(110);
      }
      await page.waitForTimeout(1200);
    });
    await ctx.close();
  }
  if (what === "switch") {
    const { ctx, page, cdp } = await openPage(browser, {
      url: tUrl(T.seed),
      waitFor: "[data-timeline-root]",
    });
    await settle(page, 800, 15000);
    const order = [T.seed2, T.seed3, T.seed, T.seed2, T.seed3, T.seed];
    out.switch = await withProfile(cdp, async () => {
      for (const t of order) {
        const row = page.locator(`[data-thread-item$=":${t.id}"] [role=button]`).first();
        await row.scrollIntoViewIfNeeded();
        await row.click();
        await page.waitForTimeout(900);
      }
    });
    out.switch.switches = order.length;
    await ctx.close();
  }
  if (what === "idle") {
    const { ctx, page, cdp } = await openPage(browser, {
      url: tUrl(T.seed),
      waitFor: "[data-timeline-root]",
    });
    await settle(page, 1200, 15000);
    out.idle = await withProfile(cdp, async () => {
      await page.waitForTimeout(15000);
    });
    await ctx.close();
  }
  if (what === "theme") {
    const { ctx, page, cdp } = await openPage(browser, {
      url: tUrl(T.long60),
      waitFor: "[data-timeline-root]",
    });
    await settle(page, 1000, 15000);
    out.theme = await withProfile(cdp, async () => {
      for (const s of ["light", "dark", "light", "dark"]) {
        await page.emulateMedia({ colorScheme: s });
        await page.waitForTimeout(700);
      }
    });
    await ctx.close();
  }
  console.error("profiled", what, JSON.stringify({ activeMs: out[what]?.activeMs }));
}
await browser.close();
const file = args.out ?? `/tmp/a22-profile${CPU > 1 ? `-cpu${CPU}` : ""}.json`;
fs.writeFileSync(file, JSON.stringify(out, null, 1));
console.error("wrote", file);
