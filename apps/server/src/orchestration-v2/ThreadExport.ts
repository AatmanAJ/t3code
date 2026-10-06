import {
  type OrchestrationExportThreadInput,
  type OrchestrationExportThreadResult,
  ThreadId,
} from "@t3tools/contracts";
import * as Context from "effect/Context";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as FileSystem from "effect/FileSystem";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import * as Schema from "effect/Schema";

import { resolveAttachmentPathById } from "../attachmentStore.ts";
import * as ServerConfig from "../config.ts";
import * as ProjectService from "../project/ProjectService.ts";
import * as ThreadManagement from "./ThreadManagementService.ts";
import {
  buildThreadExportDocument,
  type ThreadExportDocument,
  threadExportFileStem,
} from "./threadExportDocument.ts";
import { renderThreadExportHtml } from "./threadExportHtml.ts";
import { renderThreadExportMarkdown } from "./threadExportMarkdown.ts";
import { loadThreadExportMarkdownRenderer } from "./threadExportMarkdownHtml.ts";

export class ThreadExportError extends Schema.TaggedError<ThreadExportError>()(
  "ThreadExportError",
  {
    operation: Schema.Literals(["load-thread", "render"]),
    threadId: ThreadId,
    cause: Schema.Defect(),
  },
) {
  override get message(): string {
    return this.operation === "load-thread"
      ? `Unable to load thread ${this.threadId} for export.`
      : `Unable to render thread ${this.threadId} for export.`;
  }
}

/**
 * Turns a whole thread into one file: Markdown to paste anywhere, or a
 * self-contained web page that keeps the thread's look and its visual replies.
 */
export class ThreadExport extends Context.Service<
  ThreadExport,
  {
    readonly exportThread: (
      input: OrchestrationExportThreadInput,
    ) => Effect.Effect<OrchestrationExportThreadResult, ThreadExportError>;
  }
>()("t3/orchestration-v2/ThreadExport") {}

/** Bytes an HTML export may pull in from disk. Past these, a placeholder stands in. */
const HTML_EXPORT_BUDGET = {
  imageBytes: 4 * 1024 * 1024,
  totalImageBytes: 16 * 1024 * 1024,
  totalVisualReplyBytes: 16 * 1024 * 1024,
} as const;

const IMAGE_MIME_TYPES: Readonly<Record<string, string>> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  gif: "image/gif",
  webp: "image/webp",
  avif: "image/avif",
  svg: "image/svg+xml",
};

function imageMimeType(path: string): string | null {
  const extension = /\.([a-z0-9]+)$/i.exec(path)?.[1]?.toLowerCase();
  return extension === undefined ? null : (IMAGE_MIME_TYPES[extension] ?? null);
}

function dataUrl(mimeType: string, bytes: Uint8Array): string {
  return `data:${mimeType};base64,${Buffer.from(bytes).toString("base64")}`;
}

/** Every Markdown string the HTML renderer will be asked for. */
function documentMarkdown(document: ThreadExportDocument): ReadonlyArray<string> {
  return document.entries.flatMap((entry) => {
    switch (entry.kind) {
      case "assistant":
      case "plan":
        return [entry.markdown];
      case "work":
        return entry.steps.flatMap((step) =>
          step.detail?.language === "markdown" ? [step.detail.text] : [],
        );
      default:
        return [];
    }
  });
}

const make = Effect.gen(function* () {
  const threads = yield* ThreadManagement.ThreadManagementService;
  const projects = yield* ProjectService.ProjectService;
  const config = yield* ServerConfig.ServerConfig;
  const fileSystem = yield* FileSystem.FileSystem;

  /** A file of at most `maxBytes`; anything missing, unreadable or larger reads as none. */
  const readBounded = (path: string, maxBytes: number) =>
    fileSystem.stat(path).pipe(
      Effect.flatMap((info) =>
        info.type === "File" && Number(info.size) <= maxBytes
          ? fileSystem.readFile(path).pipe(Effect.map(Option.some))
          : Effect.succeed(Option.none<Uint8Array>()),
      ),
      Effect.orElseSucceed(() => Option.none<Uint8Array>()),
    );

  const attachmentPath = (attachmentId: string) =>
    resolveAttachmentPathById({ attachmentsDir: config.attachmentsDir, attachmentId });

  const renderHtml = (input: OrchestrationExportThreadInput, document: ThreadExportDocument) =>
    Effect.gen(function* () {
      const renderFailure = (cause: unknown) =>
        new ThreadExportError({ operation: "render", threadId: input.threadId, cause });
      const renderer = yield* Effect.tryPromise({
        try: () => loadThreadExportMarkdownRenderer(),
        catch: renderFailure,
      });
      const trees = new Map<string, ReturnType<typeof renderer.parse>>();
      yield* Effect.try({
        try: () => {
          for (const markdown of documentMarkdown(document)) {
            if (!trees.has(markdown)) trees.set(markdown, renderer.parse(markdown));
          }
        },
        catch: renderFailure,
      });

      let imageBytes = 0;
      let visualReplyBytes = 0;
      let skippedAssets = false;
      const takeImage = (bytes: Uint8Array) => {
        if (imageBytes + bytes.byteLength > HTML_EXPORT_BUDGET.totalImageBytes) {
          skippedAssets = true;
          return false;
        }
        imageBytes += bytes.byteLength;
        return true;
      };

      // Images agents wrote into replies as local paths, and images users attached.
      const localImages = new Map<string, string>();
      const localPaths = new Set(Array.from(trees.values()).flatMap(renderer.localImagePaths));
      for (const path of localPaths) {
        const mimeType = imageMimeType(path);
        if (mimeType === null) continue;
        const bytes = yield* readBounded(path, HTML_EXPORT_BUDGET.imageBytes);
        if (Option.isSome(bytes) && takeImage(bytes.value)) {
          localImages.set(path, dataUrl(mimeType, bytes.value));
        } else if (Option.isNone(bytes)) {
          skippedAssets = true;
        }
      }
      const attachmentImages = new Map<string, string>();
      for (const entry of document.entries) {
        if (entry.kind !== "user") continue;
        for (const attachment of entry.attachments) {
          if (attachment.type !== "image" || attachmentImages.has(attachment.id)) continue;
          const path = attachmentPath(attachment.id);
          const bytes =
            path === null
              ? Option.none<Uint8Array>()
              : yield* readBounded(path, HTML_EXPORT_BUDGET.imageBytes);
          if (Option.isSome(bytes) && takeImage(bytes.value)) {
            attachmentImages.set(attachment.id, dataUrl(attachment.mimeType, bytes.value));
          } else {
            skippedAssets = true;
          }
        }
      }

      const visualReplies = new Map<string, string>();
      const decoder = new TextDecoder();
      for (const entry of document.entries) {
        if (entry.kind !== "visual-reply" || visualReplies.has(entry.attachmentId)) continue;
        const path = attachmentPath(entry.attachmentId);
        const remaining = HTML_EXPORT_BUDGET.totalVisualReplyBytes - visualReplyBytes;
        const bytes =
          path === null || remaining <= 0
            ? Option.none<Uint8Array>()
            : yield* readBounded(path, remaining);
        if (Option.isSome(bytes)) {
          visualReplyBytes += bytes.value.byteLength;
          visualReplies.set(entry.attachmentId, decoder.decode(bytes.value));
        } else {
          skippedAssets = true;
        }
      }

      const content = yield* Effect.try({
        try: () =>
          renderThreadExportHtml(
            { ...document, truncated: document.truncated || skippedAssets },
            {
              renderMarkdown: (markdown) =>
                renderer.toHtml(
                  trees.get(markdown) ?? renderer.parse(markdown),
                  (path) => localImages.get(path) ?? null,
                ),
              visualReplyHtml: (attachmentId) => visualReplies.get(attachmentId) ?? null,
              imageDataUrl: (attachmentId) => attachmentImages.get(attachmentId) ?? null,
              theme: input.theme ?? null,
            },
          ),
        catch: renderFailure,
      });
      return { content, truncated: document.truncated || skippedAssets };
    });

  const exportThread: ThreadExport["Service"]["exportThread"] = (input) =>
    Effect.gen(function* () {
      const loadFailure = (cause: unknown) =>
        new ThreadExportError({ operation: "load-thread", threadId: input.threadId, cause });
      // A thread migrated from V1 imports its transcript on first read.
      yield* threads.ensureLegacyTranscript(input.threadId).pipe(Effect.mapError(loadFailure));
      const projection = yield* threads
        .getThreadProjection(input.threadId)
        .pipe(Effect.mapError(loadFailure));
      const project = yield* projects
        .getById(projection.thread.projectId, { includeDeleted: true })
        .pipe(Effect.orElseSucceed(() => Option.none()));
      const document = buildThreadExportDocument({
        projection,
        projectTitle: Option.isSome(project) ? project.value.title : null,
        detail: input.detail ?? "conversation",
        exportedAt: DateTime.toDateUtc(yield* DateTime.now),
      });
      const stem = threadExportFileStem(document.title);
      if (input.format === "markdown") {
        return {
          fileName: `${stem}.md`,
          mimeType: "text/markdown",
          content: renderThreadExportMarkdown(document),
          truncated: document.truncated,
        } satisfies OrchestrationExportThreadResult;
      }
      const html = yield* renderHtml(input, document);
      return {
        fileName: `${stem}.html`,
        mimeType: "text/html",
        content: html.content,
        truncated: html.truncated,
      } satisfies OrchestrationExportThreadResult;
    }).pipe(Effect.withSpan("ThreadExport.exportThread"));

  return ThreadExport.of({ exportThread });
});

export const layer = Layer.effect(ThreadExport, make);
