# Audit agent protocol (shared by all 24 area agents)

This file is the environment reference handed to every audit agent. The per-area prompt repeats the
protocol verbatim; this file adds the facts about the running system.

## Environment facts

- Repo checkout (read-only for audit agents, except your single output file and your screenshot folder):
  `<repo>` (pingdotgg/t3code main @ 5f64c5eb).
- Constitution: `ui-overhaul/DNA.md`. Codebase map: `ui-overhaul/MAP.md`. Docs digest (what already exists):
  `ui-overhaul/DOCS-DIGEST.md`. Prior art: `ui-overhaul/prior-art/*.md` (cite issue/PR/discussion numbers).
- Repo rules that bind you (from AGENTS.md): never `pkill -f` / `pgrep | kill`; never touch `~/.t3/userdata`;
  never start another dev server; never set `VITE_HTTP_URL`/`VITE_WS_URL`; do not run repo-wide checks.
- Running web app: `http://localhost:5733` (server `127.0.0.1:13773`), state dir `/tmp/t3code-overhaul`
  (synthetic data only). Already paired for Playwright.
- Running desktop (Electron) dev app: launched with `--home-dir /tmp/t3code-overhaul-desktop` (serverPort 13774,
  webPort 5734). Only area 14 drives it.
- Playwright lives OUTSIDE the repo at `/tmp/t3code-pw` (node_modules there). Quick screenshot:
  `node /tmp/t3code-pw/shot.mjs --url <url> --out <png> [--width 1440 --height 900] [--scheme light|dark] [--wait 2500] [--full true] [--click "<css>"] [--eval "<js>"] [--reduced true] [--dpr 2]`.
  Custom scripts: write them in `/tmp/t3code-pw/`, `import { chromium } from "playwright"`, and ALWAYS create the
  context with `storageState: "/tmp/t3code-pw/state.json"`. Never re-pair; never mint tokens unless your area is 11.
- Projects in the dev app: `sample-app` (id 77fc6482-3581-4bde-97d1-ac4734735304, path /tmp/t3code-sample-repo, a
  synthetic git repo you MAY run agent turns in) and `server` (id 61066aae-87f9-42aa-aabe-60a3c5660782, path
  apps/server of the checkout; browse only, do NOT run agent turns in it).
- Environment id in URLs: `d8e8988c-d569-4770-aa15-6bf4b46afdc1`. Thread URL shape:
  `/<environmentId>/<url-encoded thread id>`, e.g. `/d8e8988c-d569-4770-aa15-6bf4b46afdc1/mcp%3A4db596b5-60b6-47e5-b43a-44ef7b5bf83f`.
- Seed threads (sample-app): `mcp:4db596b5-60b6-47e5-b43a-44ef7b5bf83f` "Add capitalize helper and docs" (Codex,
  file edits + diff); `mcp:de3a2ccc-388d-4c8d-a0bc-68393c04502f` "Explain the repository" (Claude, code block + list);
  `mcp:a54eaa29-9a7b-4773-87b8-a945eb6b50dd` "Run tests and summarise history" (Claude, tool calls).
  A fixture expansion adds 100+ cloned threads with long/unicode/RTL/whitespace titles and archived/settled/
  pinned/snoozed states, plus "Huge output stress test" and "Long conversation stress test" (see
  `ui-overhaul/screens/fixtures.md`).
- Providers on this host: Codex (`codex`, instance id `codex`) and Claude Code (instance id `claudeAgent`) are
  installed and signed in. cursor-agent, opencode, grok, antigravity, pi, muse are NOT installed (real "not
  installed" states). Running an agent turn costs the developer's subscription: keep prompts tiny, use
  `claude-haiku-5-5` or `gpt-5.6-terra`, and at most 4 turns per area unless the area is about streaming.
- CLI for creating data without the UI (run from `apps/server`): `node src/bin.ts thread start /tmp/t3code-sample-repo "<msg>" --title "<t>" --provider claudeAgent --model claude-haiku-5-5 --wait --base-dir /tmp/t3code-overhaul`; `thread send <threadId> "<msg>"`; `thread list --project /tmp/t3code-sample-repo`; `project add <path> --title <t>`.
- Routes: `/` `/new` `/pull-requests` `/usage` `/welcome` `/pair` `/connect` `/guest` `/settings/{general,appearance,keybindings,snap-shot,providers,integrations,scheduled-tasks,source-control,storage,connections,beta,archived,projects,diagnostics,open-source-licenses}`.
- Screenshot naming: `ui-overhaul/screens/<area>/<area>-<state>-<theme>-<WxH>.png`, e.g.
  `ui-overhaul/screens/02-thread-list/02-thread-list-empty-dark-1440x900.png`.
- Fork is PUBLIC. Never include tokens, pairing URLs, the developer's email, or `~/.t3/userdata` content in files or screenshots.

## Per-area protocol (verbatim from the kickoff)

1. Read DNA.md and MAP.md. Read the code for your area. Run the app and USE your area as a user would, not as a
   reader of source. Take screenshots into ui-overhaul/screens/<area>/ (naming: <area>-<state>-<theme>-<viewport>.png).
2. Walk the edge-case matrix (below) for every component in your area. Record what happens.
3. For every finding write:
   ### F-<area>-<nn> <short title>
   - Severity: P0 broken or blocking | P1 obviously rough | P2 polish | P3 nice-to-have
   - Surface: web | desktop | mobile | all
   - Evidence: file:line, and/or screenshot path, and/or a reproducible step list
   - Current: one or two sentences of what it does now
   - Proposed: concrete fix. Name the token, the component, the value. "Make it nicer" is banned.
     "Change --radius-md from 6px to 8px and apply to Card, Dialog, Popover" is the bar.
   - DNA: which DNA rule this serves or restores
   - Effort: XS <50 changed lines | S <150 | M <400 | L <800 | XL (flag, probably split)
   - Risk: what could regress, which tests cover it, which do not
   - Upstream-eligible: yes/no per CONTRIBUTING (small, focused, fix-shaped, no scope creep)
4. End with: ## Edge-case results (matrix), ## Already good (do not touch), ## Incomplete (what you did not cover
   and why), ## Needs deeper look.
5. Return to the orchestrator: file path, finding count by severity, three worst findings as one-liners, and any
   "needs deeper look" items. Nothing else.

## Edge-case matrix (apply every row that can apply to your area)

Data: empty, one item, 100+ items, 10,000+ items (virtualisation), very long names (200 char project paths,
500 char thread titles), unicode and emoji in names, RTL text, leading/trailing whitespace, names that are only
whitespace.
Content: 5k line diff, 200 file diff, binary files, renamed files, huge single tool output (1MB), nested code
blocks, unterminated code fences in streamed markdown, tables, images in messages, links, very long single-line
strings without spaces.
Network/agents: provider not installed, provider installed but logged out, auth expired mid-session, stream
stalls, stream cancelled mid-token, permission prompt mid-stream, two threads streaming at once, six threads
streaming at once, relay disconnected, reconnect after sleep, server restarted under the client, version mismatch
between app and server (docs/user/updating.md).
Git: no repo, repo with uncommitted changes, detached HEAD, worktree creation failure, no GitHub auth when creating
PR, push rejected, merge conflict in worktree, branch name collision.
Viewport: 1440x900, 1280x720, 1024x640, 800x600 (does it hold?), ultrawide 3440x1440, mobile 390x844 with
keyboard open, OS zoom 80/125/150%, browser zoom 50/200%.
Preferences: light, dark, system switching live, every named theme, reduced motion, high contrast, keyboard only,
screen reader on, font size overrides if any exist.
Lifecycle: first ever launch, launch after update, launch with corrupted settings file, launch while server already
running, app backgrounded for an hour then resumed (mobile and desktop), window minimised during stream, OS sleep
during stream.

For each row write: PASS / FAIL (finding id) / N/A (why) / NOT TESTED (why). Rows you cannot produce on this host
(OS sleep, real devices) are "NOT TESTED" with the reason, not silently skipped. Where a state cannot be produced
live, read the code path that renders it and say so ("code-read only").

## Non-negotiables to check every proposal against

1. Premium feel preserved; cite a DNA rule for every proposal; no generic-shadcn-dashboard drift.
2. No rewrites, no new UI libraries/icon sets/CSS frameworks; tokens first.
3. No new dependencies unless listed with a one-line justification.
4. No changes to apps/server, native/, infra/, packaging/, .github/workflows, auth, pairing, relay. A UI fix that
   needs a server change is written as a dependency and the UI part is gated.
5. Every existing keybinding, theme, setting and permission mode keeps working as documented. Additive only.
6. Accessibility is polish: focus rings, contrast, labels, reduced motion, keyboard paths. Inaccessible = P1.
7. Motion 120-220 ms, ease-out in, ease-in out, none under prefers-reduced-motion; no bounce/glow/gradient slop/emoji.
8. Nothing proposed for web may degrade apps/mobile.
9. Everything you learn goes to disk in your output file. Return pointers, not content.

## Moving baseline: owner PR #24865 (read before writing findings)

Read `ui-overhaul/prior-art/OWNER-DIRECTION.md`. The owner's own UI overhaul PR is open with green checks and
will likely merge during this audit. Tag every finding in its overlap areas (01, 02, 04, 05 details card, 07, 17,
18, 20 labels) with a line `- #24865: addressed | partial | not addressed | conflicts` after checking
`ui-overhaul/prior-art/pr-24865.diff`. Never propose changing the four "owner calls that stay".

## Lessons from wave 1 (binding for later waves)

- Privacy: before saving any screenshot, check it for the developer's local username, home directory path, account
  email, personal skills list (slash/$ menus) or provider account names; crop, mask with `--eval` DOM edits, or do not
  save it. Say in your file which captures you withheld and why.
- Side effects: never send a message into the three seed threads. Create your own probe thread for live turns and
  archive or delete it when done. Restore every pin/settle/snooze/archive you change. Leave no terminals, browser
  tabs or projects behind. Playwright `type("\n")` presses Enter in the composer: use `insertText` for newlines.
- Known cross-area leads from wave 1 are listed in each wave-2/3 brief; confirm or refute them, do not ignore them.
