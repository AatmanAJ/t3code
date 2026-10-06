import {
  type ChatAttachment,
  type OrchestrationThreadExportDetail,
  type OrchestrationV2ThreadProjection,
  type OrchestrationV2TurnItem,
  PROVIDER_DISPLAY_NAMES,
  type RunId,
} from "@t3tools/contracts";
import { htmlRenderFromToolItem } from "@t3tools/shared/toolOutput";
import * as DateTime from "effect/DateTime";

/**
 * A thread as an export reads it: the timeline the app shows, flattened into
 * entries both the Markdown and the HTML renderer walk. Building it is pure,
 * so what a thread exports to is testable without files or a server.
 */
export interface ThreadExportDocument {
  readonly title: string;
  readonly projectTitle: string | null;
  readonly branch: string | null;
  readonly createdAt: Date;
  readonly exportedAt: Date;
  readonly models: ReadonlyArray<string>;
  readonly pullRequestUrls: ReadonlyArray<string>;
  readonly detail: OrchestrationThreadExportDetail;
  readonly entries: ReadonlyArray<ThreadExportEntry>;
  /** Some step detail was cut to its size limit. */
  readonly truncated: boolean;
}

export type ThreadExportAuthor = "user" | "agent" | "scheduled-task" | "thread";

export type ThreadExportEntry =
  | {
      readonly kind: "user";
      readonly author: ThreadExportAuthor;
      readonly text: string;
      readonly at: Date | null;
      readonly attachments: ReadonlyArray<ChatAttachment>;
    }
  | {
      readonly kind: "assistant";
      readonly markdown: string;
      readonly at: Date | null;
      /** "Claude · claude-opus-5-5", or null when the run is unknown. */
      readonly agentLabel: string | null;
      readonly streaming: boolean;
    }
  | { readonly kind: "plan"; readonly markdown: string; readonly at: Date | null }
  | {
      readonly kind: "visual-reply";
      readonly title: string;
      readonly attachmentId: string;
      readonly height: number;
    }
  | {
      readonly kind: "question";
      readonly questions: ReadonlyArray<string>;
      readonly answers: ReadonlyArray<string>;
    }
  | {
      readonly kind: "work";
      readonly durationMs: number | null;
      readonly stepCount: number;
      /** Empty in a conversation export: the reader sees how long, not what. */
      readonly steps: ReadonlyArray<ThreadExportStep>;
    }
  | { readonly kind: "notice"; readonly tone: "info" | "error"; readonly text: string };

export interface ThreadExportStep {
  readonly label: string;
  readonly detail?: {
    readonly language: "diff" | "shell" | "text" | "json" | "markdown";
    readonly text: string;
  };
}

/** Per-step limits keep one huge command log from making the file unshareable. */
export const THREAD_EXPORT_LIMITS = {
  commandOutputChars: 4_000,
  diffChars: 20_000,
  toolPayloadChars: 2_000,
  reasoningChars: 8_000,
} as const;

interface Clip {
  readonly text: string;
  readonly clipped: boolean;
}

function clip(text: string, limit: number): Clip {
  if (text.length <= limit) return { text, clipped: false };
  const rest = text.length - limit;
  return {
    text: `${text.slice(0, limit)}\n… ${rest.toLocaleString("en-US")} more characters`,
    clipped: true,
  };
}

function toDate(value: DateTime.Utc | null): Date | null {
  return value === null ? null : DateTime.toDateUtc(value);
}

function jsonText(value: unknown): string {
  if (value === undefined) return "";
  if (typeof value === "string") return value;
  try {
    return JSON.stringify(value, null, 2) ?? "";
  } catch {
    return String(value);
  }
}

function plural(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`;
}

/** The label a tool row would show, without the client's icon set. */
function toolStep(
  item: Extract<OrchestrationV2TurnItem, { type: "dynamic_tool" }>,
  clipped: (clip: Clip) => string,
): ThreadExportStep {
  const name = item.title ?? item.toolName ?? "Tool call";
  const payload = [
    item.input === undefined ? null : `Input:\n${jsonText(item.input)}`,
    item.output === undefined ? null : `Output:\n${jsonText(item.output)}`,
  ]
    .filter((part) => part !== null)
    .join("\n\n");
  return payload.length === 0
    ? { label: name }
    : {
        label: name,
        detail: {
          language: "json",
          text: clipped(clip(payload, THREAD_EXPORT_LIMITS.toolPayloadChars)),
        },
      };
}

function fileChangeDiff(item: Extract<OrchestrationV2TurnItem, { type: "file_change" }>) {
  if (item.diffStr !== undefined && item.diffStr.trim().length > 0) return item.diffStr;
  return item.newStr ?? null;
}

interface WorkGroup {
  readonly steps: Array<ThreadExportStep>;
  stepCount: number;
  firstStartedAt: Date | null;
  lastCompletedAt: Date | null;
}

export interface BuildThreadExportDocumentInput {
  readonly projection: OrchestrationV2ThreadProjection;
  readonly projectTitle: string | null;
  readonly detail: OrchestrationThreadExportDetail;
  readonly exportedAt: Date;
}

export function buildThreadExportDocument(
  input: BuildThreadExportDocumentInput,
): ThreadExportDocument {
  const { projection, detail } = input;
  const full = detail === "full";
  let truncated = false;
  const clipped = (value: Clip) => {
    truncated ||= value.clipped;
    return value.text;
  };

  const runsById = new Map(projection.runs.map((run) => [run.id, run]));
  const driversByProviderThreadId = new Map(
    projection.providerThreads.map((providerThread) => [providerThread.id, providerThread.driver]),
  );
  const agentLabel = (runId: RunId | null): string | null => {
    const run = runId === null ? undefined : runsById.get(runId);
    if (run === undefined) return null;
    const driver =
      run.providerThreadId === null
        ? undefined
        : driversByProviderThreadId.get(run.providerThreadId);
    const provider = driver === undefined ? undefined : PROVIDER_DISPLAY_NAMES[driver];
    return provider === undefined
      ? run.modelSelection.model
      : `${provider} · ${run.modelSelection.model}`;
  };

  const entries: Array<ThreadExportEntry> = [];
  let work: WorkGroup | null = null;
  const flushWork = () => {
    if (work === null || work.stepCount === 0) {
      work = null;
      return;
    }
    const durationMs =
      work.firstStartedAt !== null && work.lastCompletedAt !== null
        ? Math.max(0, work.lastCompletedAt.getTime() - work.firstStartedAt.getTime())
        : null;
    entries.push({
      kind: "work",
      durationMs,
      stepCount: work.stepCount,
      steps: full ? work.steps : [],
    });
    work = null;
  };
  /** `step` runs only for full exports, so a conversation export never clips detail it drops. */
  const addStep = (item: OrchestrationV2TurnItem, step: () => ThreadExportStep) => {
    work ??= { steps: [], stepCount: 0, firstStartedAt: null, lastCompletedAt: null };
    const startedAt = toDate(item.startedAt);
    const completedAt = toDate(item.completedAt) ?? DateTime.toDateUtc(item.updatedAt);
    if (startedAt !== null && (work.firstStartedAt === null || startedAt < work.firstStartedAt)) {
      work.firstStartedAt = startedAt;
    }
    if (work.lastCompletedAt === null || completedAt > work.lastCompletedAt) {
      work.lastCompletedAt = completedAt;
    }
    work.stepCount += 1;
    if (full) work.steps.push(step());
  };
  const emit = (entry: ThreadExportEntry) => {
    flushWork();
    entries.push(entry);
  };

  let sawInherited = false;
  let announcedFork = false;
  for (const row of projection.visibleTurnItems) {
    const item = row.item;
    // Nested rows belong to a subagent; the subagent row summarizes them.
    if (item.parentItemId !== null) continue;
    if (row.visibility === "inherited") {
      sawInherited = true;
    } else if (sawInherited && !announcedFork) {
      announcedFork = true;
      emit({
        kind: "notice",
        tone: "info",
        text: "Everything above came from the thread this one was forked from.",
      });
    }

    switch (item.type) {
      case "user_message": {
        const author: ThreadExportAuthor =
          item.scheduledTaskId !== undefined
            ? "scheduled-task"
            : item.senderThreadId !== undefined
              ? "thread"
              : item.createdBy === "agent"
                ? "agent"
                : "user";
        emit({
          kind: "user",
          author,
          text: item.text,
          at: toDate(item.startedAt) ?? DateTime.toDateUtc(item.updatedAt),
          attachments: item.attachments,
        });
        break;
      }
      case "assistant_message":
        if (item.text.trim().length === 0) break;
        emit({
          kind: "assistant",
          markdown: item.text,
          at: toDate(item.completedAt) ?? toDate(item.startedAt),
          agentLabel: agentLabel(item.runId),
          streaming: item.streaming,
        });
        break;
      case "proposed_plan":
        emit({ kind: "plan", markdown: item.markdown, at: toDate(item.completedAt) });
        break;
      case "user_input_request": {
        const answers =
          item.questionAnswer === undefined ? [] : answerTexts(item.questionAnswer.answers);
        emit({
          kind: "question",
          questions: item.questions.map((question) => question.question),
          answers,
        });
        break;
      }
      case "error":
        emit({ kind: "notice", tone: "error", text: item.failure.message });
        break;
      case "run_interrupt_request":
      case "run_interrupt_result":
        emit({ kind: "notice", tone: "info", text: item.message });
        break;
      case "handoff":
        emit({
          kind: "notice",
          tone: "info",
          text:
            item.toModel === undefined
              ? "The conversation moved to another agent."
              : `The conversation moved to ${item.toModel}.`,
        });
        break;
      case "compaction":
        addStep(item, () => ({ label: "Compacted the conversation context" }));
        break;
      case "dynamic_tool": {
        const visual = htmlRenderFromToolItem(item);
        if (visual !== undefined) {
          emit({
            kind: "visual-reply",
            title: visual.title,
            attachmentId: visual.attachmentId,
            height: visual.height,
          });
          break;
        }
        addStep(item, () => toolStep(item, clipped));
        break;
      }
      case "command_execution": {
        const output = item.output?.trim() ?? "";
        const exit = item.exitCode === undefined ? "" : ` (exit ${item.exitCode})`;
        addStep(item, () => ({
          label: `Ran \`${item.input.split("\n", 1)[0]}\`${exit}`,
          detail: {
            language: "shell",
            text: clipped(
              clip(
                output.length === 0 ? `$ ${item.input}` : `$ ${item.input}\n${output}`,
                THREAD_EXPORT_LIMITS.commandOutputChars,
              ),
            ),
          },
        }));
        break;
      }
      case "file_change": {
        const counts =
          item.additions === undefined && item.deletions === undefined
            ? ""
            : ` (+${item.additions ?? 0} −${item.deletions ?? 0})`;
        const diff = fileChangeDiff(item);
        addStep(item, () => ({
          label: `Edited \`${item.fileName}\`${counts}`,
          ...(diff === null
            ? {}
            : {
                detail: {
                  language: "diff" as const,
                  text: clipped(clip(diff, THREAD_EXPORT_LIMITS.diffChars)),
                },
              }),
        }));
        break;
      }
      case "file_search":
        addStep(item, () => ({
          label:
            item.pattern === undefined
              ? "Searched files"
              : `Searched files for \`${item.pattern}\`${
                  item.results === undefined ? "" : ` (${plural(item.results.length, "result")})`
                }`,
        }));
        break;
      case "web_search":
        addStep(item, () => ({
          label:
            item.patterns === undefined || item.patterns.length === 0
              ? "Searched the web"
              : `Searched the web for ${item.patterns.map((pattern) => `"${pattern}"`).join(", ")}`,
        }));
        break;
      case "reasoning":
        if (item.text.trim().length === 0) break;
        addStep(item, () => ({
          label: "Thought",
          detail: {
            language: "markdown",
            text: clipped(clip(item.text, THREAD_EXPORT_LIMITS.reasoningChars)),
          },
        }));
        break;
      case "subagent":
        addStep(item, () => ({
          label: `Delegated to a subagent: ${firstLine(item.prompt)}`,
          ...(item.result === null
            ? {}
            : {
                detail: {
                  language: "markdown" as const,
                  text: clipped(clip(item.result, THREAD_EXPORT_LIMITS.reasoningChars)),
                },
              }),
        }));
        break;
      case "approval_request":
        addStep(item, () => ({
          label: `Asked for approval: ${firstLine(item.prompt ?? item.requestKind)}`,
        }));
        break;
      case "secret_request":
        addStep(item, () => ({ label: `Asked for ${item.label} (${item.secretStatus})` }));
        break;
      case "todo_list":
        addStep(item, () => ({
          label: "Updated the plan",
          detail: {
            language: "markdown",
            text: item.steps
              .map((step) => `- [${step.status === "completed" ? "x" : " "}] ${step.text}`)
              .join("\n"),
          },
        }));
        break;
      case "system_notice":
        addStep(item, () => ({ label: firstLine(item.message) }));
        break;
      case "notification":
        addStep(item, () => ({ label: firstLine(item.summary) }));
        break;
      case "thread_created":
        addStep(item, () => ({ label: `Started a thread with ${item.targetModel}` }));
        break;
      case "fork":
      case "checkpoint":
        break;
    }
  }
  flushWork();

  const models = Array.from(
    new Set(
      projection.runs
        .toSorted((left, right) => left.ordinal - right.ordinal)
        .map((run) => run.modelSelection.model),
    ),
  );
  const pullRequestUrls = Array.from(
    new Set(
      [
        ...(projection.thread.pullRequests ?? [])
          .filter((link) => link.source !== "stack-dismissed")
          .map((link) => link.url),
        projection.thread.linkedPullRequest?.url,
      ].filter((url): url is string => typeof url === "string" && url.length > 0),
    ),
  );

  return {
    title: projection.thread.title,
    projectTitle: input.projectTitle,
    branch: projection.thread.branch,
    createdAt: DateTime.toDateUtc(projection.thread.createdAt),
    exportedAt: input.exportedAt,
    models,
    pullRequestUrls,
    detail,
    entries,
    truncated,
  };
}

function firstLine(text: string): string {
  const line = text.trim().split("\n", 1)[0] ?? "";
  return line.length > 160 ? `${line.slice(0, 159)}…` : line;
}

/** Answers arrive keyed by question id, as a string, a list, or `{ answers }`. */
function answerTexts(answers: Readonly<Record<string, unknown>>): ReadonlyArray<string> {
  return Object.values(answers).flatMap((value) => {
    if (typeof value === "string") return [value];
    if (Array.isArray(value))
      return value.filter((part): part is string => typeof part === "string");
    if (value !== null && typeof value === "object") {
      const nested = (value as { readonly answers?: unknown }).answers;
      if (Array.isArray(nested)) {
        return nested.filter((part): part is string => typeof part === "string");
      }
    }
    return [];
  });
}

/** Lowercase, dash-separated, safe on every filesystem. */
export function threadExportFileStem(title: string): string {
  const stem = title
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80)
    .replace(/-+$/g, "");
  return stem.length === 0 ? "thread" : stem;
}

export function formatThreadExportDuration(ms: number): string {
  const totalSeconds = Math.max(1, Math.round(ms / 1000));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return minutes === 0 ? `${hours}h` : `${hours}h ${minutes}m`;
  if (minutes > 0) return seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}
