import {
  formatThreadExportDuration,
  type ThreadExportAuthor,
  type ThreadExportDocument,
  type ThreadExportEntry,
  type ThreadExportStep,
} from "./threadExportDocument.ts";

const AUTHOR_LABELS: Record<ThreadExportAuthor, string> = {
  user: "User",
  agent: "Agent message",
  "scheduled-task": "Scheduled task",
  thread: "Message from another thread",
};

export function threadExportAuthorLabel(author: ThreadExportAuthor): string {
  return AUTHOR_LABELS[author];
}

/** `2026-10-06 14:42 UTC`: a file read later, anywhere, can't assume a time zone. */
export function formatThreadExportTimestamp(date: Date): string {
  return `${date.toISOString().slice(0, 16).replace("T", " ")} UTC`;
}

/** A fence longer than any backtick run inside, so pasted code can't close it early. */
function fence(text: string, language: string): string {
  const longestRun = Math.max(2, ...Array.from(text.matchAll(/`+/g), (match) => match[0].length));
  const marks = "`".repeat(longestRun + 1);
  return `${marks}${language}\n${text}\n${marks}`;
}

export function threadExportWorkSummary(entry: Extract<ThreadExportEntry, { kind: "work" }>) {
  const steps = `${entry.stepCount} ${entry.stepCount === 1 ? "step" : "steps"}`;
  return entry.durationMs === null
    ? steps
    : `Worked for ${formatThreadExportDuration(entry.durationMs)} · ${steps}`;
}

function stepMarkdown(step: ThreadExportStep): string {
  if (step.detail === undefined) return `- ${step.label}`;
  const body =
    step.detail.language === "markdown"
      ? step.detail.text
      : fence(step.detail.text, step.detail.language === "text" ? "" : step.detail.language);
  return `- ${step.label}\n\n${indent(body, "  ")}`;
}

function indent(text: string, prefix: string): string {
  return text
    .split("\n")
    .map((line) => (line.length === 0 ? line : `${prefix}${line}`))
    .join("\n");
}

function entryMarkdown(entry: ThreadExportEntry): string {
  switch (entry.kind) {
    case "user": {
      const heading = `## ${threadExportAuthorLabel(entry.author)}`;
      const time = entry.at === null ? "" : `\n<sub>${formatThreadExportTimestamp(entry.at)}</sub>`;
      const attachments =
        entry.attachments.length === 0
          ? ""
          : `\n\n_Attachments: ${entry.attachments.map((attachment) => attachment.name).join(", ")}_`;
      return `${heading}${time}\n\n${entry.text.trim()}${attachments}`;
    }
    case "assistant": {
      const heading = `## ${entry.agentLabel ?? "Assistant"}`;
      const status = entry.streaming ? "\n\n_Still writing when this was exported._" : "";
      return `${heading}\n\n${entry.markdown.trim()}${status}`;
    }
    case "plan":
      return `## Plan\n\n${entry.markdown.trim()}`;
    case "visual-reply":
      return `> **Visual reply: ${entry.title}**\n> Export this thread as a web page to see it.`;
    case "question": {
      const questions = entry.questions.map((question) => `> ${question}`).join("\n>\n");
      const answers =
        entry.answers.length === 0 ? "" : `\n>\n> **Answer:** ${entry.answers.join(", ")}`;
      return `> **The agent asked:**\n>\n${questions}${answers}`;
    }
    case "work": {
      const summary = threadExportWorkSummary(entry);
      if (entry.steps.length === 0) return `_${summary}_`;
      return [
        "<details>",
        `<summary>${summary}</summary>`,
        "",
        entry.steps.map(stepMarkdown).join("\n"),
        "",
        "</details>",
      ].join("\n");
    }
    case "notice":
      return entry.tone === "error" ? `> **Error:** ${entry.text}` : `> ${entry.text}`;
  }
}

export function renderThreadExportMarkdown(document: ThreadExportDocument): string {
  const facts = [
    document.projectTitle,
    document.branch === null ? null : `\`${document.branch}\``,
    `started ${formatThreadExportTimestamp(document.createdAt)}`,
    document.models.length === 0 ? null : document.models.join(", "),
  ].filter((fact) => fact !== null);
  const header = [
    `# ${document.title}`,
    "",
    facts.join(" · "),
    ...(document.pullRequestUrls.length === 0
      ? []
      : ["", `Pull requests: ${document.pullRequestUrls.join(", ")}`]),
  ].join("\n");
  const footer = `Exported from [T3 Code](https://t3.codes) on ${formatThreadExportTimestamp(
    document.exportedAt,
  )}${document.truncated ? ". Long command output and diffs were shortened." : "."}`;
  return `${[header, "---", ...document.entries.map(entryMarkdown), "---", footer].join("\n\n")}\n`;
}
