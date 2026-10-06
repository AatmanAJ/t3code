import type { OrchestrationThreadExportTheme } from "@t3tools/contracts";

import {
  type ThreadExportDocument,
  type ThreadExportEntry,
  type ThreadExportStep,
} from "./threadExportDocument.ts";
import {
  formatThreadExportTimestamp,
  threadExportAuthorLabel,
  threadExportWorkSummary,
} from "./threadExportMarkdown.ts";

export interface ThreadExportHtmlAssets {
  /** Sanitized HTML for a Markdown string. */
  readonly renderMarkdown: (markdown: string) => string;
  /** A visual reply's stored page, or null when it is missing or over budget. */
  readonly visualReplyHtml: (attachmentId: string) => string | null;
  /** A user image attachment as a data URL, or null to show its name instead. */
  readonly imageDataUrl: (attachmentId: string) => string | null;
  readonly theme: OrchestrationThreadExportTheme | null;
}

function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Theme values reach a <style> element and the frames' theme messages, so
// names must be custom properties and anything that could close a rule or the
// element is dropped, as the render bootstrap does.
function cleanTheme(
  theme: OrchestrationThreadExportTheme | null,
): OrchestrationThreadExportTheme | null {
  if (theme === null) return null;
  const variables = Object.fromEntries(
    Object.entries(theme.variables)
      .filter(([name]) => /^--[a-z0-9-]+$/.test(name))
      .slice(0, 96)
      .map(([name, value]) => [name, value.slice(0, 300).replace(/[;{}<>\\]/g, "")]),
  );
  return { appearance: theme.appearance, variables };
}

function themeDeclarations(variables: Readonly<Record<string, string>>): string {
  return Object.entries(variables)
    .map(([name, value]) => `${name}:${value};`)
    .join("");
}

// The app's stock palette, for exports made without a client theme. Visual
// replies style against the same names, so they read the same here.
const DEFAULT_LIGHT: Readonly<Record<string, string>> = {
  "--background": "#fcfcfc",
  "--foreground": "#27272a",
  "--muted": "#f4f4f5",
  "--muted-foreground": "#71717a",
  "--card": "#ffffff",
  "--card-foreground": "#27272a",
  "--popover": "#ffffff",
  "--popover-foreground": "#27272a",
  "--secondary": "#f4f4f5",
  "--secondary-foreground": "#27272a",
  "--border": "#e4e4e7",
  "--input": "#e4e4e7",
  "--ring": "#3b5bdb",
  "--primary": "#3b5bdb",
  "--primary-foreground": "#ffffff",
  "--accent": "#3b5bdb",
  "--accent-foreground": "#ffffff",
  "--accent-surface": "#eef2ff",
  "--accent-surface-foreground": "#3049b8",
  "--destructive": "#dc2626",
  "--destructive-foreground": "#b91c1c",
  "--destructive-surface": "#fef2f2",
  "--warning": "#f59e0b",
  "--warning-foreground": "#b45309",
  "--warning-surface": "#fffbeb",
  "--success": "#10b981",
  "--success-foreground": "#047857",
  "--info": "#3b82f6",
  "--info-foreground": "#1d4ed8",
  "--code-background": "#f4f4f5",
  "--code-foreground": "#27272a",
  "--chart-1": "#3b5bdb",
  "--chart-2": "#0d9488",
  "--chart-3": "#d97706",
  "--chart-4": "#9333ea",
  "--chart-5": "#e11d48",
  "--chart-6": "#65a30d",
};

const DEFAULT_DARK: Readonly<Record<string, string>> = {
  ...DEFAULT_LIGHT,
  "--background": "#111113",
  "--foreground": "#e4e4e7",
  "--muted": "#1f1f23",
  "--muted-foreground": "#a1a1aa",
  "--card": "#18181b",
  "--card-foreground": "#e4e4e7",
  "--popover": "#18181b",
  "--popover-foreground": "#e4e4e7",
  "--secondary": "#232327",
  "--secondary-foreground": "#e4e4e7",
  "--border": "#2c2c31",
  "--input": "#2c2c31",
  "--ring": "#7c93f0",
  "--primary": "#7c93f0",
  "--primary-foreground": "#111113",
  "--accent": "#7c93f0",
  "--accent-foreground": "#111113",
  "--accent-surface": "#1e2340",
  "--accent-surface-foreground": "#b4c2ff",
  "--destructive": "#f87171",
  "--destructive-foreground": "#fca5a5",
  "--destructive-surface": "#2a1515",
  "--warning-foreground": "#fbbf24",
  "--warning-surface": "#2a2010",
  "--success-foreground": "#34d399",
  "--info-foreground": "#60a5fa",
  "--code-background": "#1c1c20",
  "--code-foreground": "#e4e4e7",
  "--chart-1": "#7c93f0",
  "--chart-2": "#2dd4bf",
  "--chart-3": "#fbbf24",
  "--chart-4": "#c084fc",
  "--chart-5": "#fb7185",
  "--chart-6": "#a3e635",
};

const FONTS =
  '--font-sans:-apple-system,BlinkMacSystemFont,"Segoe UI",system-ui,sans-serif;' +
  '--font-mono:"SF Mono","SFMono-Regular",Menlo,Consolas,"Liberation Mono",monospace;--radius:0.625rem;';

function themeCss(theme: OrchestrationThreadExportTheme | null): string {
  if (theme !== null) {
    return `:root{color-scheme:${theme.appearance};${FONTS}${themeDeclarations(theme.variables)}}`;
  }
  return (
    `:root{color-scheme:light dark;${FONTS}${themeDeclarations(DEFAULT_LIGHT)}}` +
    `@media (prefers-color-scheme:dark){:root{${themeDeclarations(DEFAULT_DARK)}}}`
  );
}

// One reading column, the same rhythm as the thread view. User turns are cards,
// replies are plain prose, work collapses to a muted summary line.
const PAGE_CSS = `
*{box-sizing:border-box}
html{background:var(--background);color:var(--foreground);font-family:var(--font-sans);font-size:15px;line-height:1.6;-webkit-font-smoothing:antialiased;-webkit-text-size-adjust:100%}
body{margin:0;padding:48px 20px 64px}
main{max-width:760px;margin:0 auto;display:flex;flex-direction:column;gap:28px}
a{color:var(--primary);text-underline-offset:2px}
header.thread-header{display:flex;flex-direction:column;gap:10px;padding-bottom:24px;border-bottom:1px solid var(--border)}
header.thread-header h1{margin:0;font-size:1.7rem;line-height:1.2;letter-spacing:-0.01em;text-wrap:balance}
.facts{display:flex;flex-wrap:wrap;gap:6px 14px;color:var(--muted-foreground);font-size:0.86rem}
.facts code{font-size:0.82rem}
.chip{display:inline-flex;align-items:center;border:1px solid var(--border);border-radius:999px;padding:1px 9px;font-size:0.8rem;color:var(--muted-foreground);background:var(--card)}
.entry{display:flex;flex-direction:column;gap:8px;min-width:0}
.byline{display:flex;align-items:baseline;gap:10px;font-size:0.8rem;color:var(--muted-foreground)}
.byline strong{color:var(--foreground);font-weight:600;font-size:0.86rem}
.user .bubble{background:var(--secondary);color:var(--secondary-foreground);border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px;white-space:pre-wrap;overflow-wrap:anywhere}
.attachments{display:flex;flex-wrap:wrap;gap:8px}
.attachments img{max-width:100%;max-height:420px;border-radius:calc(var(--radius) - 2px);border:1px solid var(--border);display:block}
.prose{overflow-wrap:anywhere}
.prose>:first-child{margin-top:0}.prose>:last-child{margin-bottom:0}
.prose h1,.prose h2,.prose h3,.prose h4{line-height:1.3;margin:1.4em 0 0.5em}
.prose h1{font-size:1.35rem}.prose h2{font-size:1.2rem}.prose h3{font-size:1.05rem}
.prose p,.prose ul,.prose ol,.prose pre,.prose table,.prose blockquote{margin:0 0 0.9em}
.prose img{max-width:100%;border-radius:calc(var(--radius) - 2px)}
.prose blockquote{border-left:3px solid var(--border);padding-left:12px;color:var(--muted-foreground)}
.prose table{border-collapse:collapse;display:block;overflow-x:auto}
.prose th,.prose td{border:1px solid var(--border);padding:5px 10px;text-align:left}
code{font-family:var(--font-mono);font-size:0.86em;background:var(--code-background);color:var(--code-foreground);border-radius:5px;padding:0.1em 0.35em}
pre{font-family:var(--font-mono);font-size:0.82rem;line-height:1.5;background:var(--code-background);color:var(--code-foreground);border:1px solid var(--border);border-radius:calc(var(--radius) - 2px);padding:12px 14px;overflow-x:auto;white-space:pre}
pre code{background:none;padding:0;font-size:inherit}
.plan{border:1px solid var(--border);background:var(--card);border-radius:var(--radius);padding:14px 18px}
.visual iframe{display:block;width:100%;border:0;background:transparent}
.missing{border:1px dashed var(--border);border-radius:var(--radius);padding:12px 16px;color:var(--muted-foreground);font-size:0.9rem}
details.work{color:var(--muted-foreground);font-size:0.88rem}
details.work summary{cursor:pointer;list-style:none;display:inline-flex;align-items:center;gap:6px}
details.work summary::-webkit-details-marker{display:none}
details.work summary::before{content:"";width:0;height:0;border-left:5px solid currentColor;border-top:4px solid transparent;border-bottom:4px solid transparent;transition:transform 120ms}
details.work[open] summary::before{transform:rotate(90deg)}
details.work ol{margin:10px 0 0;padding-left:20px;display:flex;flex-direction:column;gap:8px;color:var(--foreground)}
details.work li pre,details.work li .prose{margin-top:6px}
details.work li .prose{color:var(--muted-foreground)}
.worked{color:var(--muted-foreground);font-size:0.86rem}
.notice{border-left:3px solid var(--border);padding:2px 0 2px 12px;color:var(--muted-foreground);font-size:0.9rem}
.notice.error{border-color:var(--destructive);color:var(--destructive-foreground)}
.question{border:1px solid var(--border);border-radius:var(--radius);padding:12px 16px;background:var(--card);display:flex;flex-direction:column;gap:6px}
.question .answer{color:var(--muted-foreground)}
footer{margin-top:12px;padding-top:20px;border-top:1px solid var(--border);color:var(--muted-foreground);font-size:0.82rem}
@media (prefers-reduced-motion:reduce){details.work summary::before{transition:none}}
@media print{details.work{display:none}body{padding:0}}
`;

// Hosts each visual reply the way the app does: hands it the theme over the
// MCP Apps bridge, fits the frame to the page's reported height, and opens the
// links a reader clicks in a new tab. Times switch to the reader's own zone.
const PAGE_SCRIPT = `(function(){
var frames=[].slice.call(document.querySelectorAll("iframe[data-visual-reply]"));
var fixed=JSON.parse(document.getElementById("t3-export-theme").textContent||"null");
var names=JSON.parse(document.getElementById("t3-export-variables").textContent||"[]");
function theme(){if(fixed)return fixed;var s=getComputedStyle(document.documentElement),v={};names.forEach(function(n){var x=s.getPropertyValue(n).trim();if(x)v[n]=x;});return{appearance:matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light",variables:v};}
function send(f){var t=theme();if(f.contentWindow)f.contentWindow.postMessage({jsonrpc:"2.0",method:"ui/notifications/host-context-changed",params:{theme:t.appearance,styles:{variables:t.variables}}},"*");}
frames.forEach(function(f){f.addEventListener("load",function(){send(f);});send(f);});
if(!fixed)matchMedia("(prefers-color-scheme: dark)").addEventListener("change",function(){frames.forEach(send);});
addEventListener("message",function(e){var f=null;for(var i=0;i<frames.length;i++)if(frames[i].contentWindow===e.source)f=frames[i];if(!f)return;var d=e.data,p=d&&d.params;if(!d||d.jsonrpc!=="2.0"||!p)return;
if(d.method==="ui/notifications/size-changed"&&typeof p.height==="number"){f.style.height=Math.min(Math.max(Math.ceil(p.height),80),6000)+"px";}
else if(d.method==="ui/open-link"&&typeof p.url==="string"&&/^https?:/i.test(p.url)){window.open(p.url,"_blank","noopener");if(d.id!=null)e.source.postMessage({jsonrpc:"2.0",id:d.id,result:{}},"*");}});
[].forEach.call(document.querySelectorAll("time[datetime]"),function(t){var d=new Date(t.getAttribute("datetime"));if(!isNaN(d))t.textContent=d.toLocaleString(undefined,{dateStyle:"medium",timeStyle:"short"});});
})();`;

function timeElement(date: Date): string {
  return `<time datetime="${date.toISOString()}">${escapeHtml(formatThreadExportTimestamp(date))}</time>`;
}

function stepHtml(step: ThreadExportStep, assets: ThreadExportHtmlAssets): string {
  const label = inlineCode(step.label);
  if (step.detail === undefined) return `<li>${label}</li>`;
  const body =
    step.detail.language === "markdown"
      ? `<div class="prose">${assets.renderMarkdown(step.detail.text)}</div>`
      : `<pre><code>${escapeHtml(step.detail.text)}</code></pre>`;
  return `<li>${label}${body}</li>`;
}

/** Labels quote commands and paths in backticks; show those as code. */
function inlineCode(label: string): string {
  return escapeHtml(label).replace(/`([^`]+)`/g, "<code>$1</code>");
}

function entryHtml(entry: ThreadExportEntry, assets: ThreadExportHtmlAssets): string {
  switch (entry.kind) {
    case "user": {
      const images = entry.attachments.flatMap((attachment) => {
        const url = attachment.type === "image" ? assets.imageDataUrl(attachment.id) : null;
        return url === null
          ? [`<span class="chip">${escapeHtml(attachment.name)}</span>`]
          : [`<img src="${escapeHtml(url)}" alt="${escapeHtml(attachment.name)}" loading="lazy">`];
      });
      return [
        `<section class="entry user">`,
        `<div class="byline"><strong>${escapeHtml(threadExportAuthorLabel(entry.author))}</strong>${
          entry.at === null ? "" : timeElement(entry.at)
        }</div>`,
        entry.text.trim().length === 0
          ? ""
          : `<div class="bubble">${escapeHtml(entry.text.trim())}</div>`,
        images.length === 0 ? "" : `<div class="attachments">${images.join("")}</div>`,
        `</section>`,
      ].join("");
    }
    case "assistant":
      return [
        `<section class="entry assistant">`,
        `<div class="byline"><strong>${escapeHtml(entry.agentLabel ?? "Assistant")}</strong>${
          entry.at === null ? "" : timeElement(entry.at)
        }${entry.streaming ? "<span>still writing</span>" : ""}</div>`,
        `<div class="prose">${assets.renderMarkdown(entry.markdown)}</div>`,
        `</section>`,
      ].join("");
    case "plan":
      return `<section class="entry plan"><div class="byline"><strong>Plan</strong></div><div class="prose">${assets.renderMarkdown(
        entry.markdown,
      )}</div></section>`;
    case "visual-reply": {
      const html = assets.visualReplyHtml(entry.attachmentId);
      if (html === null) {
        return `<section class="entry visual"><div class="missing">Visual reply “${escapeHtml(
          entry.title,
        )}” is not included in this export.</div></section>`;
      }
      return `<section class="entry visual"><iframe data-visual-reply title="${escapeHtml(
        entry.title,
      )}" sandbox="allow-scripts allow-popups" style="height:${Math.max(
        80,
        Math.round(entry.height),
      )}px" srcdoc="${escapeHtml(html)}"></iframe></section>`;
    }
    case "question":
      return `<section class="entry question"><div class="byline"><strong>The agent asked</strong></div>${entry.questions
        .map((question) => `<div>${escapeHtml(question)}</div>`)
        .join("")}${
        entry.answers.length === 0
          ? ""
          : `<div class="answer">Answer: ${escapeHtml(entry.answers.join(", "))}</div>`
      }</section>`;
    case "work": {
      const summary = escapeHtml(threadExportWorkSummary(entry));
      if (entry.steps.length === 0) return `<div class="worked">${summary}</div>`;
      return `<details class="work"><summary>${summary}</summary><ol>${entry.steps
        .map((step) => stepHtml(step, assets))
        .join("")}</ol></details>`;
    }
    case "notice":
      return `<div class="notice${entry.tone === "error" ? " error" : ""}">${escapeHtml(
        entry.text,
      )}</div>`;
  }
}

/** A single self-contained page: no requests, scripts or styles from anywhere else. */
export function renderThreadExportHtml(
  document: ThreadExportDocument,
  assets: ThreadExportHtmlAssets,
): string {
  const facts = [
    document.projectTitle === null ? null : escapeHtml(document.projectTitle),
    document.branch === null ? null : `<code>${escapeHtml(document.branch)}</code>`,
    `Started ${timeElement(document.createdAt)}`,
  ].filter((fact) => fact !== null);
  const models = document.models.map((model) => `<span class="chip">${escapeHtml(model)}</span>`);
  const pullRequests = document.pullRequestUrls.map(
    (url) => `<a href="${escapeHtml(url)}">${escapeHtml(url.replace(/^https?:\/\//, ""))}</a>`,
  );
  const variableNames = Object.keys(DEFAULT_LIGHT);
  const theme = cleanTheme(assets.theme);
  return [
    "<!doctype html>",
    '<html lang="en">',
    "<head>",
    '<meta charset="utf-8">',
    '<meta name="viewport" content="width=device-width,initial-scale=1">',
    '<meta name="generator" content="T3 Code">',
    `<title>${escapeHtml(document.title)} · T3 Code</title>`,
    `<style>${themeCss(theme)}${PAGE_CSS}</style>`,
    "</head>",
    "<body>",
    "<main>",
    '<header class="thread-header">',
    `<h1>${escapeHtml(document.title)}</h1>`,
    `<div class="facts">${facts.map((fact) => `<span>${fact}</span>`).join("")}</div>`,
    models.length === 0 ? "" : `<div class="facts">${models.join("")}</div>`,
    pullRequests.length === 0 ? "" : `<div class="facts">${pullRequests.join("")}</div>`,
    "</header>",
    ...document.entries.map((entry) => entryHtml(entry, assets)),
    `<footer>Exported from <a href="https://t3.codes">T3 Code</a> on ${timeElement(
      document.exportedAt,
    )}${document.truncated ? ". Long command output and diffs were shortened." : "."}</footer>`,
    "</main>",
    // JSON in a script element: escape `<` so nothing inside can end it.
    `<script type="application/json" id="t3-export-theme">${JSON.stringify(theme).replaceAll(
      "<",
      "\\u003c",
    )}</script>`,
    `<script type="application/json" id="t3-export-variables">${JSON.stringify(
      variableNames,
    )}</script>`,
    `<script>${PAGE_SCRIPT}</script>`,
    "</body>",
    "</html>",
    "",
  ].join("\n");
}
