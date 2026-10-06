// @effect-diagnostics nodeBuiltinImport:off
import * as NodeFS from "node:fs";
import * as NodeOS from "node:os";
import * as NodePath from "node:path";

import * as NodeServices from "@effect/platform-node/NodeServices";
import {
  type OrchestrationExportThreadInput,
  type OrchestrationV2ThreadProjection,
  type Project,
  ProjectId,
  ProviderDriverKind,
  ProviderInstanceId,
  ProviderThreadId,
  RunId,
  ThreadId,
  TurnItemId,
} from "@t3tools/contracts";
import * as DateTime from "effect/DateTime";
import * as Effect from "effect/Effect";
import * as Layer from "effect/Layer";
import * as Option from "effect/Option";
import { afterAll, describe, expect, it } from "vite-plus/test";

import * as ServerConfig from "../config.ts";
import * as ProjectService from "../project/ProjectService.ts";
import * as ThreadExport from "./ThreadExport.ts";
import * as ThreadManagementService from "./ThreadManagementService.ts";

const threadId = ThreadId.make("thread-export");
const sourceThreadId = ThreadId.make("thread-export-source");
const runId = RunId.make("run-export-1");
const providerThreadId = ProviderThreadId.make("provider-thread-export");
const instanceId = ProviderInstanceId.make("claude");
const at = DateTime.makeUnsafe("2026-10-06T10:00:00.000Z");
const done = DateTime.makeUnsafe("2026-10-06T10:02:05.000Z");

const attachmentsDir = NodeFS.mkdtempSync(NodePath.join(NodeOS.tmpdir(), "t3-thread-export-"));
afterAll(() => NodeFS.rmSync(attachmentsDir, { recursive: true, force: true }));

const visualReplyId = "thread-export-11111111-2222-4333-8444-555555555555-html";
const missingVisualReplyId = "thread-export-66666666-2222-4333-8444-555555555555-html";
const imageId = "thread-export-77777777-2222-4333-8444-555555555555";
NodeFS.writeFileSync(
  NodePath.join(attachmentsDir, `${visualReplyId}.html`),
  '<!doctype html><html><body><p class="chart">42 installs</p></body></html>',
);
NodeFS.writeFileSync(NodePath.join(attachmentsDir, `${imageId}.png`), Buffer.from([137, 80, 78]));
const localScreenshot = NodePath.join(attachmentsDir, "shot.png");
NodeFS.writeFileSync(localScreenshot, Buffer.from([1, 2, 3]));

let ordinal = 0;
function item<const Fields extends { readonly type: string }>(
  fields: Fields & Record<string, unknown>,
) {
  ordinal += 1;
  return {
    id: TurnItemId.make(`item-${ordinal}`),
    threadId,
    runId,
    nodeId: null,
    providerThreadId,
    providerTurnId: null,
    nativeItemRef: null,
    parentItemId: null,
    ordinal,
    status: "completed",
    title: null,
    startedAt: at,
    completedAt: done,
    updatedAt: done,
    ...fields,
  };
}

function htmlRenderItem(attachmentId: string, title: string) {
  return item({
    type: "dynamic_tool",
    toolName: "mcp__t3-code__html_render",
    input: {},
    output: { htmlRender: { attachmentId, title, height: 320 }, message: "Rendered." },
  });
}

function projection(
  items: ReadonlyArray<ReturnType<typeof item>>,
  options: { readonly inheritedCount?: number } = {},
) {
  return {
    thread: {
      id: threadId,
      projectId: ProjectId.make("project-export"),
      title: "Fix the flaky sidebar test!",
      branch: "t3/fix-sidebar",
      worktreePath: "/home/someone/code/t3code",
      createdAt: at,
      pullRequests: [
        { url: "https://github.com/pingdotgg/t3code/pull/1", source: "manual" },
        { url: "https://github.com/pingdotgg/t3code/pull/2", source: "stack-dismissed" },
      ],
    },
    runs: [
      {
        id: runId,
        ordinal: 1,
        providerInstanceId: instanceId,
        providerThreadId,
        modelSelection: { instanceId, model: "claude-opus-5-5" },
      },
    ],
    providerThreads: [{ id: providerThreadId, driver: ProviderDriverKind.make("claudeAgent") }],
    visibleTurnItems: items.map((turnItem, index) => ({
      position: index,
      visibility: index < (options.inheritedCount ?? 0) ? "inherited" : "local",
      sourceThreadId: index < (options.inheritedCount ?? 0) ? sourceThreadId : threadId,
      sourceItemId: turnItem.id,
      item: turnItem,
    })),
  } as unknown as OrchestrationV2ThreadProjection;
}

function runExport(
  thread: OrchestrationV2ThreadProjection,
  input: Omit<OrchestrationExportThreadInput, "threadId">,
) {
  const layer = ThreadExport.layer.pipe(
    Layer.provide(
      Layer.mergeAll(
        Layer.mock(ThreadManagementService.ThreadManagementService)({
          ensureLegacyTranscript: () => Effect.void,
          getThreadProjection: () => Effect.succeed(thread),
        }),
        Layer.mock(ProjectService.ProjectService)({
          getById: () => Effect.succeed(Option.some({ title: "t3code" } as Project)),
        }),
        Layer.effect(
          ServerConfig.ServerConfig,
          Effect.gen(function* () {
            const base = yield* ServerConfig.ServerConfig;
            return { ...base, attachmentsDir };
          }),
        ).pipe(
          Layer.provide(ServerConfig.layerTest(process.cwd(), { prefix: "t3-thread-export-" })),
          Layer.provide(NodeServices.layer),
        ),
        NodeServices.layer,
      ),
    ),
  );
  return Effect.gen(function* () {
    const service = yield* ThreadExport.ThreadExport;
    return yield* service.exportThread({ threadId, ...input });
  }).pipe(Effect.provide(layer), Effect.runPromise);
}

const conversation = [
  item({
    type: "user_message",
    createdBy: "user",
    creationSource: "web",
    messageId: "message-1",
    inputIntent: "message",
    text: "Why does the sidebar test flake?",
    attachments: [
      { type: "image", id: imageId, name: "flake.png", mimeType: "image/png", sizeBytes: 3 },
    ],
  }),
  item({ type: "reasoning", text: "Probably a timer.", streaming: false }),
  item({
    type: "command_execution",
    input: "pnpm test sidebar",
    output: `FAIL sidebar.test.ts\n${"x".repeat(5_000)}`,
    exitCode: 1,
  }),
  item({
    type: "file_change",
    fileName: "apps/web/src/Sidebar.tsx",
    additions: 2,
    deletions: 1,
    diffStr: "-  await sleep(10)\n+  await settled()",
  }),
  item({
    type: "command_execution",
    input: "ls",
    output: "ignored",
    parentItemId: TurnItemId.make("item-subagent-parent"),
  }),
  htmlRenderItem(visualReplyId, "Flake rate by day"),
  item({
    type: "assistant_message",
    messageId: "message-2",
    text: `It waited on a fixed timer.<script>alert(1)</script>\n\n![before](${localScreenshot})`,
    streaming: false,
  }),
];

describe("ThreadExport", () => {
  it("exports a conversation as Markdown without the work in between", async () => {
    const result = await runExport(projection(conversation), { format: "markdown" });

    expect(result.fileName).toBe("fix-the-flaky-sidebar-test.md");
    expect(result.mimeType).toBe("text/markdown");
    expect(result.content).toContain("# Fix the flaky sidebar test!");
    expect(result.content).toContain("t3code · `t3/fix-sidebar`");
    expect(result.content).toContain("Pull requests: https://github.com/pingdotgg/t3code/pull/1\n");
    expect(result.content).not.toContain("pull/2");
    expect(result.content).toContain("## User");
    expect(result.content).toContain("_Attachments: flake.png_");
    expect(result.content).toContain("## Claude · claude-opus-5-5");
    expect(result.content).toContain("_Worked for 2m 5s · 3 steps_");
    expect(result.content).toContain("> **Visual reply: Flake rate by day**");
    // Conversation exports leave tool output, reasoning and the workspace path out.
    expect(result.content).not.toContain("pnpm test sidebar");
    expect(result.content).not.toContain("Probably a timer");
    expect(result.content).not.toContain("/home/someone");
    expect(result.truncated).toBe(false);
  });

  it("includes commands, diffs and reasoning in a full export, cut to size", async () => {
    const result = await runExport(projection(conversation), {
      format: "markdown",
      detail: "full",
    });

    expect(result.content).toContain("<summary>Worked for 2m 5s · 3 steps</summary>");
    expect(result.content).toContain("- Ran `pnpm test sidebar` (exit 1)");
    expect(result.content).toContain("```shell\n  $ pnpm test sidebar\n  FAIL sidebar.test.ts");
    expect(result.content).toContain("more characters");
    expect(result.content).toContain("- Edited `apps/web/src/Sidebar.tsx` (+2 −1)");
    expect(result.content).toContain("```diff\n  -  await sleep(10)\n  +  await settled()\n  ```");
    expect(result.content).toContain("Probably a timer.");
    // A subagent's nested activity is summarized by its own row, not repeated.
    expect(result.content).not.toContain("$ ls");
    expect(result.truncated).toBe(true);
  });

  it("exports a self-contained page with the visual reply live and images inlined", async () => {
    const result = await runExport(
      projection([...conversation, htmlRenderItem(missingVisualReplyId, "Lost chart")]),
      {
        format: "html",
        theme: {
          appearance: "dark",
          variables: { "--background": "#101010;}body{display:none", "not-a-var": "red" },
        },
      },
    );

    expect(result.fileName).toBe("fix-the-flaky-sidebar-test.html");
    expect(result.mimeType).toBe("text/html");
    expect(result.content.startsWith("<!doctype html>")).toBe(true);
    // The client's theme, with anything that could escape the rule dropped.
    expect(result.content).toContain(":root{color-scheme:dark;");
    expect(result.content).toContain("--background:#101010bodydisplay:none;");
    expect(result.content).not.toContain("not-a-var");
    expect(result.content).not.toContain("body{display:none");
    // Assistant Markdown is sanitized the way the thread view renders it.
    expect(result.content).toContain("<p>It waited on a fixed timer.");
    expect(result.content).not.toContain("<script>alert");
    // The stored page rides along in a sandboxed frame.
    expect(result.content).toContain('sandbox="allow-scripts allow-popups"');
    expect(result.content).toContain('srcdoc="&lt;!doctype html&gt;');
    expect(result.content).toContain("42 installs");
    expect(result.content).toContain("Visual reply “Lost chart” is not included in this export.");
    // The attached image and the agent's local screenshot both travel inside the file.
    expect(result.content).toContain('src="data:image/png;base64,iVBO"');
    expect(result.content).toContain('src="data:image/png;base64,AQID"');
    expect(result.content).not.toContain(localScreenshot);
    expect(result.truncated).toBe(true);
  });

  it("marks where a fork's own conversation starts", async () => {
    const result = await runExport(projection(conversation, { inheritedCount: 1 }), {
      format: "markdown",
    });

    const notice = "> Everything above came from the thread this one was forked from.";
    expect(result.content.split(notice)).toHaveLength(2);
    expect(result.content.indexOf("## User")).toBeLessThan(result.content.indexOf(notice));
  });
});
