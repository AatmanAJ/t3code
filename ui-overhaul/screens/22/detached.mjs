#!/usr/bin/env node
// Area 22: after N distinct thread switches, list the DOM subtrees that are still alive (retained) but not connected.
// Uses Runtime.queryObjects(HTMLElement.prototype) after two forced GCs, groups detached roots by tag + class + data-* attrs.
// Usage: node detached.mjs --base http://localhost:5822 --switches 15
import { openPage, tUrl, T, ENV, settle, gc, metrics, chromium, BASE } from "./measure.mjs";
const args = Object.fromEntries(
  process.argv.slice(2).reduce((a, x, i, arr) => {
    if (x.startsWith("--")) a.push([x.slice(2), arr[i + 1]]);
    return a;
  }, []),
);
const N = Number(args.switches ?? 15);

const browser = await chromium.launch();
const { ctx, page, cdp } = await openPage(browser, {
  url: tUrl(T.seed),
  waitFor: "[data-timeline-root]",
});
await settle(page, 1000, 15000);
async function detachedReport(label) {
  await gc(cdp);
  const m = await metrics(cdp);
  const { result } = await cdp.send("Runtime.evaluate", { expression: "HTMLElement.prototype" });
  const q = await cdp.send("Runtime.queryObjects", { prototypeObjectId: result.objectId });
  const callRes = await cdp.send("Runtime.callFunctionOn", {
    objectId: q.objects.objectId,
    returnByValue: true,
    functionDeclaration: `function () {
      const roots = new Map(); let detached = 0, total = 0;
      for (const el of this) {
        let conn; try { conn = el.isConnected; } catch { continue; }
        total++;
        if (conn) continue;
        detached++;
        const r = el.getRootNode();
        if (!roots.has(r)) roots.set(r, 0);
        roots.set(r, roots.get(r) + 1);
      }
      const sig = new Map();
      for (const [r, n] of roots) {
        const el = r.nodeType === 1 ? r : null;
        const key = el ? el.tagName.toLowerCase() + "." + String(el.className || "").toString().slice(0, 70).replace(/\\s+/g, ".") + [...el.attributes].filter((a) => a.name.startsWith("data-")).slice(0, 3).map((a) => "[" + a.name + "]").join("") : "(" + r.nodeName + ")";
        const cur = sig.get(key) || { roots: 0, nodes: 0 };
        cur.roots++; cur.nodes += n; sig.set(key, cur);
      }
      return { total, detached, rootCount: roots.size, top: [...sig].sort((a, b) => b[1].nodes - a[1].nodes).slice(0, 14).map(([k, v]) => [k, v.roots, v.nodes]) };
    }`,
  });
  const rep = callRes.result;
  if (callRes.exceptionDetails)
    console.log("exception", String(callRes.exceptionDetails.exception?.description).slice(0, 300));
  console.log(
    label,
    JSON.stringify({
      heapMB: Math.round(m.JSHeapUsedSize / 104857.6) / 10,
      cdpNodes: m.Nodes,
      listeners: m.JSEventListeners,
    }),
    JSON.stringify(rep.value, null, 1),
  );
}
await detachedReport("start");
const keys = await page.evaluate(
  (n) =>
    [...document.querySelectorAll("[data-thread-item]")]
      .map((e) => e.getAttribute("data-thread-item"))
      .slice(0, n + 4),
  N,
);
const own = `${ENV}:${T.seed.id}`;
let i = 0;
for (const k of keys.filter((k) => k !== own && !k.endsWith(T.huge.id)).slice(0, N)) {
  const row = page.locator(`[data-thread-item="${k}"] [role=button]`).first();
  await row.evaluate((e) => e.scrollIntoView({ block: "center" }));
  await row.click({ timeout: 8000 }).catch(() => {});
  await page.waitForTimeout(350);
  i++;
}
await settle(page, 500, 6000);
await detachedReport(`after ${i} distinct switches`);
await ctx.close();
await browser.close();
