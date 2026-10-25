# Fixture expansion report

Script: `/tmp/t3code-fixtures/expand.mjs`. Verified on a copy of the live dev database at `/tmp/t3code-fixtures/dbcopy` (pristine pre-expansion snapshot: `/tmp/t3code-fixtures/dbcopy-pristine`). Nothing under `/tmp/t3code-overhaul` or `~/.t3/userdata` was touched.

## Command for the orchestrator (live base dir)

Stop the dev server first (graceful stop so the WAL is flushed and provider sessions are stopped), then:

```bash
node /tmp/t3code-fixtures/expand.mjs --base-dir /tmp/t3code-overhaul
```

- Default is `--count 140` regular clones plus the 2 stress threads, so 142 new threads.
- Other flags: `--dry-run` (full run, then ROLLBACK, prints the summary), `--seed N` (default 20261025; changes title/age/state assignment, ids are always fresh random), `--no-backup`, `--force`, `--allow-auto-settle`.
- It refuses to run if `<base-dir>/userdata/server-runtime.json` names a live pid (`--force` overrides), and exits 2 if a thread titled "Huge output stress test" already exists.
- Before writing it checkpoints the WAL and writes a backup next to the database: `statev2.sqlite.pre-expand-<timestamp>.bak` (`VACUUM INTO`). Rollback = stop the server, delete `statev2.sqlite*`, copy the `.bak` back as `statev2.sqlite`.
- Everything is inserted in one `BEGIN IMMEDIATE` transaction. `orchestration_events`, `orchestration_v2_events`, `projection_projects` and `orchestration_v2_projection_metadata` are not modified.
- Read-only post-run checks (safe against the live path, they open it read-only): `node /tmp/t3code-fixtures/verify.mjs /tmp/t3code-overhaul`, and from `apps/server`: `DB=/tmp/t3code-overhaul/userdata/statev2.sqlite node --input-type=module -e "$(cat /tmp/t3code-fixtures/verify-decode.mjs)"`.

Dates are relative to the moment the script runs ("now", 2h, 1d, ... ago). Re-run on a fresh copy if the audit happens much later.

## What it creates

142 threads on the copy (146 total with the 4 that existed): 140 regular clones + `Huge output stress test` + `Long conversation stress test`.

| Aspect                      | Result                                                                                                                                                                                                                                                                              |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Projects                    | sample-app 114 new (117 total), server 28 new (29 total). 20% of regular clones are in `server`, all cloned from the text-only thread only.                                                                                                                                         |
| Sources (regular clones)    | text-only Claude haiku 66 (28 in server, 38 in sample-app), Claude sonnet tool calls 37, Codex file edits 37                                                                                                                                                                        |
| Thread id forms             | `mcp:<uuid>` and `thread:project:<projectId>:<uuid>` (every 3rd clone uses the project form)                                                                                                                                                                                        |
| Titles                      | 113 normal, 3x 500-char, 3x 200-char single word, 4x emoji/CJK, 4x RTL (3 Arabic/Hebrew + 1 mixed bidi), 3x padded, 3x blank-looking stand-ins, 3x long path (227 chars), 4x Markdown/HTML                                                                                          |
| Age buckets (activity time) | now 13, 2h 14, 1d 16, 3d 17, 2w 20, 6w 20, 12w 14, uniform-random 0-90d 28                                                                                                                                                                                                          |
| Stress: huge                | 1 run, assistant text 1,003,399 bytes (1,000,111 chars, 8,740 lines): repeated paragraphs, nested lists 5 deep, a 200 row table, a 5,000 line fenced `js` block, trailing unterminated ` ```ts ` fence. Both the `messages` payload and the `assistant_message` turn item carry it. |
| Stress: long                | 60 runs, 60 user + 60 assistant messages, 420 turn items, run ordinals 1..60, item ordinals `k*1_000_000+n`, checkpoint chain 0..60. Prompts and answer shapes (short/medium/long with code + table) vary per pair.                                                                 |

Rows inserted: threads 142, provider_sessions 105, provider_threads 142, provider_session_bindings 142, checkpoint_scopes 142, runs 201, run_attempts 201, nodes 714, provider_turns 201, messages 439, turn_items 1370, checkpoints 343, turn_item_positions 1370. (`plans`, `runtime_requests`, `context_handoffs`, `subagents`, `context_transfers`: source threads have none, so none cloned; the cloner handles them generically if they appear.)

### How ids were rewritten

Ids derive from the thread id at several URL-encoding depths (`mcp%3A...`, `mcp%253A...`, `mcp%25253A...`), so each clone is built in one regex pass per run: thread/run/checkpoint id literals at encoding depth 0..4, every other UUID (native thread/turn/item ids, provider-session suffix) and provider-native tokens (`toolu_*`, `msg_*`, ...) get fresh values, project ids are preserved, and timestamp strings are shifted by one delta per run. Shared Codex session `provider-session:provider-instance:codex:shared` is not cloned; clones only get a `provider_session_bindings` row to it. For clones in `server`, the `cwd` of sessions/checkpoint scopes is rewritten to the server project's workspace root.

## How thread states are represented (exact fields)

All state lives in `orchestration_v2_projection_threads.payload_json` (schema `OrchestrationV2AppThread`), with `archived_at`, `deleted_at`, `title`, `created_at`, `updated_at`, `project_id` mirrored in columns. These are the values the server's own commands write (`thread.archive`, `thread.settle`, `thread.pin`, `thread.snooze`, `thread.delete` in `Orchestrator.ts`).

| State             | Fields written                                                                                                                                                                                        | Count                    |
| ----------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| active            | `archivedAt: null`, `settledOverride: null`, `settledAt: null`, `snoozedUntil: null`, `snoozedAt: null`, `deletedAt: null` (nothing else)                                                             | 107 new (incl. 2 stress) |
| archived          | `archivedAt: <iso>` and column `archived_at`; `updatedAt` = archive time                                                                                                                              | 15                       |
| settled           | `settledOverride: "settled"`, `settledAt: <iso>`, `unsettledAt: null`, `pinnedAt: null`, `pinOrderKey: null`, `snoozedUntil/At: null`; `updatedAt` = settle time. (Auto-settle writes the same pair.) | 10                       |
| pinned            | `pinnedAt: <iso>`, `pinOrderKey: <lowercase a-z string, not ending in "a">` — distinct keys `ej`, `ir`, `nb`, `rj`, `vr`, sorted ascending by the client                                              | 5                        |
| snoozed           | `snoozedUntil: <future iso>` (now+3h, +1d, +4d), `snoozedAt: <past iso>`                                                                                                                              | 3                        |
| deleted           | `deletedAt: <iso>` and column `deleted_at` (every shell/list query filters `deleted_at IS NULL`)                                                                                                      | 2                        |
| unread            | `lastVisitedAt` = last run completed minus 1 ms (what `thread.mark-unread` writes); about one in eight active/pinned threads, others `lastVisitedAt = updatedAt`                                      | ~12                      |
| auto-settle guard | `autoSettleDisabledAt: <iso>` on the 72 active threads older than 2.5 days                                                                                                                            | 72                       |

`unsettledAt`, `settledOverride: "active"` and `activeOrderKey` are not used by any fixture. Every thread also gets `opens: { openedAt, score, picks }` for command-palette ranking.

Why the auto-settle guard: `sidebarAutoSettleAfterDays` defaults to 3, and the settlement sweep runs at startup and every minute, so without the guard the server would turn most of the old "active" clones into settled within a minute. The guard makes the context-menu "Auto-settle" toggle read off for those threads. Pass `--allow-auto-settle` to skip it (or set `sidebarAutoSettleAfterDays` to null in server settings instead).

Why clone provider sessions are written as `stopped`: startup recovery stops every non-stopped session, appends a `provider-session.updated` event and bumps the owning thread's `updatedAt` to "now". On a first test that flattened 105 clones to the startup time. With stopped sessions a throwaway server start changes only the 3 original source threads (see verification).

## Verification on the copy

Reproduce with `node verify.mjs /tmp/t3code-fixtures/dbcopy` (`verify-out.txt` has the full output of the last run). All numbers below are from the final run.

1. Counts per project (`SELECT p.title, count(*), sum(t.deleted_at IS NULL) FROM orchestration_v2_projection_threads t JOIN projection_projects p USING(project_id) GROUP BY p.title`): sample-app 117 total / 116 visible, server 29 total / 28 visible. Helper cross-check (`t3-sqlite-state.ts query`): sample-app 117 (1 deleted, 11 archived), server 29 (1 deleted, 4 archived).
2. Counts per state (`json_extract` on `$.settledOverride`, `$.pinnedAt`, `$.snoozedUntil`, `archived_at`, `deleted_at`): deleted 2, archived 15, settled 10, pinned 5, snoozed 3, active 111 (the 107 new plus the 4 pre-existing threads), auto-settle guarded 72.
3. Titles decode correctly (`SELECT length(title), length(CAST(title AS BLOB)), title FROM ... `): 500/500/500 chars, 227/227/227 (path), 200/200/200 (single word), emoji/CJK 13, 16, 25, 25 chars (38, 47, 42, 68 bytes), Arabic 43 and 46 chars, Hebrew 29, mixed 47, padded 18/21/23 chars (raw spaces kept in the column and payload), invisible stand-ins 3/3/2 chars, Markdown 27/54 chars and others. Column equals `payload.title` for all 146 threads. Blank titles: 0.
4. `json_valid(payload_json)`: 0 invalid in all 11 payload tables (146 threads, 204 runs, 204 run_attempts, 726 nodes, 108 sessions, 145 provider threads, 204 provider turns, 446 messages, 1390 turn items, 145 scopes, 349 checkpoints).
5. Schema decode with the real contract schemas (`verify-decode.mjs`, `OrchestrationV2*Json` from `@t3tools/contracts`): every row of those 11 tables decodes (146/146 threads, 1390/1390 turn items, ...). The three padded titles decode to `"padded title"`, `"leading spaces only"`, `"trailing spaces only"` (the server trims on read).
6. No clone shares an id with a source: 0 primary keys shared with a source thread's rows, 0 ids shared between two different clones, 0 of the 21 source UUID/native tokens appear in any clone row, 0 clone rows contain a source thread uuid in any encoding. 33 referential checks all 0 (run/provider thread, node parent/run/scope, message and turn-item node/run, checkpoint scope/parent/item, run userMessageId/rootNodeId/activeAttemptId/checkpointId, provider turn node/attempt, provider thread session, bindings, active provider thread, lineage root, column vs payload `threadId`/`projectId`, turn-item ordinals vs `orchestration_v2_turn_item_positions`, server-project clones with sample-app `cwd`, Codex or file-edit clones in `server`).
7. Real server code reads it: a script using the repo's `ProjectionStore.getShellSnapshot` and `getThreadSnapshot` against a throwaway copy (`smoke-read.mjs`) returned 129 shell threads (146 minus 15 archived minus 2 deleted) in 49 ms; 10 settled, 5 pinned with keys `ej ir nb rj vr`, 3 snoozed, 0 deleted in the snapshot, 0 unreadable thread ids, and thread snapshots for both stress threads and a Codex clone load.
8. Throwaway server start (`node apps/server/src/bin.ts serve --base-dir <copy> --port 13991`, stopped by `timeout -s INT`, no errors in the log): recovery stopped only the 3 original sessions; 143 of 146 threads kept their `updatedAt`; only the 3 original source threads changed. 3 `provider-session.updated` events were appended (none for clones).
9. Stress threads: huge = 1 run, assistant text 1,003,399 bytes, 3 fence lines (odd, so the last fence is unterminated), 200 table rows; long = 60 distinct run ordinals (1..60), 60 user + 60 assistant messages, 420 distinct turn-item ordinals.
10. FTS: `orchestration_v2_message_search` has 242 rows, equal to the number of indexable messages (assistant, or user with `createdBy = 'user'`); `MATCH 'neverClosed'` finds the huge message.
11. Events untouched: `orchestration_events` 157 rows, max sequence 157; projection metadata `last_sequence` 157.
12. Idempotence: a second run on the expanded copy exits 2 with "already been applied". `--count 30 --dry-run` works and rolls back. The live-pid guard refuses when `server-runtime.json` names a live pid.

## Known limitations

- Clones have no event-log history (no `thread.created` or run events). Anything that replays or reads events for a thread will not work on them: "Edit from here", revert/rollback, fork from a point, resume/continue with the provider (the native thread ids are fake), queue/steer. Treat them as read-only display fixtures. Sending a message into a clone is untested and may fail.
- `ProjectionMaintenance.verify` (used by the database compact/doctor maintenance path) reports projection threads without a `thread.created` event as unexpected, and a projection rebuild (also triggered by a projection schema version bump) deletes all clones. Re-run the script after either.
- Checkpoint refs are copied from the source, so Claude and Codex clones in sample-app share git refs with their source thread and with each other. This keeps the diff panel working for Codex clones, but deleting or reverting one of them through the UI may delete or move refs that the others use. Clones in `server` point at refs that do not exist in that repo (harmless: they have no file changes).
- The padded-title fixtures are stored with their spaces, but the server trims on decode, so the UI shows the trimmed text. Whitespace-only and empty titles could not be created (see Incomplete).
- Content is repetitive: the regular clones reuse the same three conversations (the stress threads aside). No running, failed, waiting-for-approval or queued states were created on purpose, because startup recovery acts on them.
- Pinned, archived, settled, snoozed and deleted threads were assigned randomly among the threads without a special title; the first two threads of each special-title case are kept active so they are visible in the default list.
- Search indexes the cloned assistant messages (about 242 rows), so palette/message search returns many duplicates; the huge message adds roughly 1 MB of trigram index.
- The database grows by about 16 MB (two copies of the 1 MB text plus FTS).
- The live server's own startup recovery still stops the original source sessions and bumps the 3 source threads' `updatedAt` if they were left `ready`; a graceful stop before running the script avoids this.

## Incomplete

- Whitespace-only (" ") and empty ("") titles were not created. `OrchestrationV2AppThread.title` is `TrimmedNonEmptyString`; a blank title fails the thread decode, and `ProjectionStore` decodes every thread row with no per-row recovery, so one such row makes the whole shell snapshot fail for every client. Confirmed on a throwaway copy: `getShellSnapshot` failed with `Expected a non-blank string at ["title"]` after setting one title to `"   "`. Stand-ins that are valid but render blank were created instead (3 threads: three U+200B zero-width spaces, three U+2800 braille blanks, two U+3164 hangul fillers). To test a real blank-title fallback in the client, use a client-side unit/browser test or rename a thread through the UI.
- The web UI was not opened (no browser use). Checks were database queries, the real contract decoders, the real `ProjectionStore` reads and a throwaway headless server start on a copy; visual rendering of the fixtures is unverified.
- `activeOrderKey` (manual ordering of active threads) and `unsettledAt` / `settledOverride: "active"` states are not represented in the fixtures.
- The script has not been run against `/tmp/t3code-overhaul` (by instruction); only against the copy.
