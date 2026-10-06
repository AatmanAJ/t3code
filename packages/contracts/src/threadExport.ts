import * as Schema from "effect/Schema";

import { ThreadId, TrimmedNonEmptyString } from "./baseSchemas.ts";

export const OrchestrationThreadExportFormat = Schema.Literals(["markdown", "html"]);
export type OrchestrationThreadExportFormat = typeof OrchestrationThreadExportFormat.Type;

/**
 * `conversation` keeps what the reader would quote: messages, plans, visual
 * replies and errors. `full` adds the work in between: reasoning, commands
 * and their output, file edits, searches and other tool calls.
 */
export const OrchestrationThreadExportDetail = Schema.Literals(["conversation", "full"]);
export type OrchestrationThreadExportDetail = typeof OrchestrationThreadExportDetail.Type;

/** The client's resolved theme, so an HTML export looks like the app it came from. */
export const OrchestrationThreadExportTheme = Schema.Struct({
  appearance: Schema.Literals(["light", "dark"]),
  variables: Schema.Record(Schema.String, Schema.String),
});
export type OrchestrationThreadExportTheme = typeof OrchestrationThreadExportTheme.Type;

export const OrchestrationExportThreadInput = Schema.Struct({
  threadId: ThreadId,
  format: OrchestrationThreadExportFormat,
  detail: Schema.optionalKey(OrchestrationThreadExportDetail),
  theme: Schema.optionalKey(OrchestrationThreadExportTheme),
});
export type OrchestrationExportThreadInput = typeof OrchestrationExportThreadInput.Type;

export const OrchestrationExportThreadResult = Schema.Struct({
  fileName: TrimmedNonEmptyString,
  mimeType: Schema.Literals(["text/markdown", "text/html"]),
  content: Schema.String,
  /** Some content was shortened or left out to keep the file a shareable size. */
  truncated: Schema.Boolean,
});
export type OrchestrationExportThreadResult = typeof OrchestrationExportThreadResult.Type;

export class OrchestrationExportThreadError extends Schema.TaggedError<OrchestrationExportThreadError>()(
  "OrchestrationExportThreadError",
  {
    message: TrimmedNonEmptyString,
    cause: Schema.optional(Schema.Defect()),
  },
) {}
