# Fixture dataset (synthetic; safe for a public fork)

- Dev state dir: `/tmp/t3code-overhaul` (`--no-seed`; the developer's `~/.t3/userdata` is never read or written).
- Sample repo: `/tmp/t3code-sample-repo` (git, branch `main`, 3 commits: initial sample app, friendlier greeting,
  add shout()). Files: package.json, README.md, src/index.js, src/lib/{greet,date}.js, src/components/Button.jsx,
  docs/guide.md. The Codex fixture thread added `capitalize()` and `docs/greet.md` (uncommitted changes +20/-0).
- Projects: `sample-app` (77fc6482-…) and `server` (61066aae-…, auto-created by the dev runner from apps/server).
- Seed threads (real agent turns, created with `node apps/server/src/bin.ts thread start`):
  - `mcp:4db596b5-60b6-47e5-b43a-44ef7b5bf83f` Add capitalize helper and docs (Codex gpt-5.6-terra; 2 file edits)
  - `mcp:de3a2ccc-388d-4c8d-a0bc-68393c04502f` Explain the repository (Claude haiku; markdown with code block)
  - `mcp:a54eaa29-9a7b-4773-87b8-a945eb6b50dd` Run tests and summarise history (Claude sonnet; shell tool calls)
- Expansion (pending): `/tmp/t3code-fixtures/expand.mjs` clones these into 100+ threads with the title/state matrix
  from `ui-overhaul/audit/_PROTOCOL.md` plus "Huge output stress test" (~1 MB message) and "Long conversation
  stress test" (60 message pairs). Report: `/tmp/t3code-fixtures/EXPAND-REPORT.md` (copied here when run).

## Expansion applied (13:35)

`node /tmp/t3code-fixtures/expand.mjs --base-dir /tmp/t3code-overhaul --count 140` created 142 threads
(sample-app 114, server 28): 113 normal titles, plus long-500, long-path, single-word-200, markdown, padded,
RTL/CJK/emoji variants, zero-width/braille-blank stand-ins for blank titles (the contract rejects empty titles),
15 archived, 10 settled (`settledOverride`), 5 pinned (`pinnedAt` + `pinOrderKey`), 3 snoozed (`snoozedUntil`),
2 deleted. Stress threads: "Huge output stress test" `mcp:56cf13f9-6c6a-412e-bf5c-8d6320267980` (1,003,399-byte
assistant message) and "Long conversation stress test" `mcp:101012d3-8fff-4b2e-8a8f-7d31d6aec256` (60 runs).
Clones have no event-log history (Edit from here / revert / fork do not work on them) and share checkpoint refs
with their source. Details: `fixtures-expand-report.md`.

## Drift during the audit (known)

- 14:55 Seed thread "Explain the repository" (`mcp:de3a2ccc-…`) received one accidental extra exchange ("short
  prompt" + reply) from the area 04 agent after the baseline was captured. The baseline image
  `thread-claude-markdown-*` shows the pre-drift transcript; Phase 2 "after" images of this thread will show one
  more turn. Compare the first turn only, or re-capture the baseline from a fresh clone of the thread.
- Area 02 created and archived 3 probe threads (Working/Waiting/Done rows); area 09 removed its probe project.
- Area 01 left two terminals open on thread `mcp:4db596b5-…` ("Close Terminal 2" did not remove them).
