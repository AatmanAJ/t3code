# UI Overhaul Run Log

Run started: 2026-10-25 (local). Phase: 1 (audit + spec). Orchestrator: Claude Fable 5.1 via T3 Code.

## Ground truth at checkout

- Upstream: pingdotgg/t3code, default branch `main`.
- Upstream HEAD at checkout: `5f64c5eb299a23d278ef043c416bd4dc801bc53c`
  ("feat(server): cut T3's agent instructions and tool copy by 60% (#24850)", 2026-10-25 05:23 -0700).
- Fork: the GitHub account `AJ-Base44` was renamed to `AatmanAJ`; GitHub redirects the old name.
  The fork lives at https://github.com/AatmanAJ/t3code (public, `isFork: true`, parent pingdotgg/t3code).
  Fork `main` was ~3002 commits behind upstream at checkout; it will be fast-forwarded on push.
- Local clone: `/Users/lives/.t3/scratch/2026-10-25-t3-code-ui-ux-overhaul-d1d61898/t3code`
  with `origin` = fork, `upstream` = pingdotgg.
- Host: macOS (Darwin 27.0.0), Node 24.22.1 on PATH; `vp` v1.0.0 / vite-plus 1.4.0 provides pinned Node 26.12.1.
  pnpm 12.14.0 via vp. `vp i` completed in 53s, exit 0.
- Provider CLIs on host: `claude` and `codex` installed. cursor-agent, opencode, grok, antigravity, pi, muse: not installed
  (useful: gives real "not installed" states for area 09).
- Repo rule files read: AGENTS.md (CLAUDE.md is `@AGENTS.md`), CONTRIBUTING.md, .agents/skills/{test-t3-app,test-t3-mobile,contribution-triage}, .cursor/rules/cursor-cloud.mdc.
- Repo has NO Playwright setup (only in vendored .repos fixtures). Browser tests run via Vitest browser mode (headless Chromium).

## Decisions taken without asking (defaults)

- D-001 Fork name: use AatmanAJ/t3code (the renamed account). All pushes go there.
- D-002 Dev state: `--home-dir /tmp/t3code-overhaul` plus `--no-seed`. The fork is PUBLIC and screenshots will be
  pushed to it, so the developer's real `~/.t3/userdata` threads must not appear in captures. Synthetic fixture data
  is built instead (see ui-overhaul/screens/fixtures.md). Reading `~/.t3/userdata` is never done by this run.
- D-003 Provider list: AGENTS.md names Codex, Claude Code, Cursor, Grok, OpenCode, Antigravity; docs/user also cover
  ACP, Muse, Pi. Area 09 covers every provider the UI exposes, not only "six".
- D-004 Repo rule precedence: AGENTS.md says "don't verify with browsers unless the user explicitly agrees". The kickoff
  explicitly requires running the app with Playwright for screenshots. Kickoff wins on scope; AGENTS.md wins on
  conventions (no `pkill -f`, no `~/.t3/userdata` writes, no `VITE_*_URL`).
- D-005 A `docs/user/welcome-wizard.md` already exists. Onboarding work (areas 10, 24) audits the existing wizard
  rather than proposing one from scratch.

## Hard stops

(none yet)

## Timeline

- 12:27 Run start. Cloned fork, added upstream, checked out upstream/main at 5f64c5eb.
- 12:29 `vp i` started (background), finished 12:30 exit 0.
- 12:31 Read AGENTS.md, CONTRIBUTING.md, skills, development.md. Created ui-overhaul/ scaffold.
- 12:33 Playwright installed at /tmp/t3code-pw (outside repo). Paired a headless Chromium with the startup pairing URL;
  storageState saved to /tmp/t3code-pw/state.json and reused by every agent. Helper: /tmp/t3code-pw/shot.mjs.
- 12:34 Verified web app boots and renders (dev-runner: serverPort 13773, webPort 5733, baseDir /tmp/t3code-overhaul,
  --no-seed). The server auto-created a project "server" (cwd apps/server) with one empty thread.
- 12:36 Spawned 7 agents: 4 prior-art Haiku sweeps (open PRs, closed PRs/rejections, issues, discussions),
  MAP.md (Sonnet), DOCS-DIGEST.md (Haiku), DNA.md (Sonnet).
- 12:38 `vp run dev:desktop --home-dir /tmp/t3code-overhaul-desktop --no-seed` boots Electron on this host
  (serverPort 13774, webPort 5734; built web bundle then launched .electron-runtime). Left running for area 14.
  A separate production "T3 Code (Nightly).app" is the developer's live instance and is never touched.
- 12:40 Added fixture project "sample-app" (/tmp/t3code-sample-repo, synthetic git repo, 3 commits) via
  `node apps/server/src/bin.ts project add`. Started real agent threads via `thread start`: Codex (gpt-5.6-terra)
  thread completed; Claude threads were rejected with 'Provider instance "claude" is disabled for project' although
  Settings → Providers shows Claude authenticated and enabled machine-wide. Investigating (see Hard stops / notes).
- 12:46 Prior-art issues sweep done: 1,068 open issues, 408 UI-relevant. Discussions sweep done: top 50 of the newest
  1,200 Ideas (of 1,995); one maintainer reply in the top 50.
- 12:50 Correction: the Claude provider instance ID is `claudeAgent` (contracts/settings.ts DEFAULT_ENABLED_DEFAULT_INSTANCES
  = codex, claudeAgent). `--provider claude` named a non-existent instance, which the server reports as "disabled for
  project" (a misleading error, noted for area 09/20). Claude fixture threads relaunched with `claudeAgent`.
- 12:55 Host capability check: Xcode 27.1 with iOS simulators present (iPhone 17 UDID 2E08CEC5-… booted); started
  `node scripts/mobile-native-client.ts ensure ios <udid>` in the background (log /tmp/t3code-mobile-build.log) to build
  the Expo dev client for area 15. Android SDK/adb/emulator are NOT installed on this host: Android rows in area 15
  are "NOT TESTED (no Android tooling)" and covered by code reading only.
- 12:55 Electron dev app: main window created (log "main window created", backend on 127.0.0.1:13774). No remote
  debugging port is exposed; area 14 captures via macOS `screencapture` of the window or relaunches with a debug port.
- 12:53 Spawned fixture-expansion agent (Sonnet) to build /tmp/t3code-fixtures/expand.mjs against a DB copy.
  Wrote ui-overhaul/audit/_PROTOCOL.md (shared agent reference) and ui-overhaul/screens/fixtures.md.
- 13:00 Mobile build attempt 1 failed: `pod install` ENOENT (CocoaPods not on host). Installing CocoaPods with
  Homebrew (host tool, not a repo dependency; apps/mobile/Brewfile only lists linters) and re-running the dev
  client build in the background (/tmp/t3code-mobile-chain.sh, log /tmp/t3code-mobile-build.log).
- 13:00 Wrote ui-overhaul/audit/_AREAS.md (24 area boundaries, read scopes, live tasks). DOCS-DIGEST.md done
  (39 docs). MAP.md and DNA.md in progress; 24 DNA screenshots captured so far.
- 13:05 Wrote /tmp/t3code-pw/capture.mjs + states.json (24 states × viewports × schemes × themes) and
  ui-overhaul/screens/capture.md. Smoke test ok. Settings → Appearance shows 6 built-in themes: T3 Code, T3 Chat,
  Grove, Ocean, Ember, Iris, plus Create theme / Add theme.
- 13:05 CocoaPods installed via Homebrew; `pod install` for the iOS dev client is running.
- 13:20 iOS dev client BUILD SUCCEEDED and installed on simulator "iPhone 17" (fingerprint 07e40cce…,
  status compatible). Area 15 can start Metro (`vp run dev:client` from apps/mobile) and pair to the web dev backend.
  apps/mobile/ios is generated and gitignored; nothing outside ui-overhaul/ is dirty in the checkout.
- 13:25 MAP.md done (552 lines). Facts that change the brief: stores = Effect Atom + Zustand; 273 CSS vars + 61
  runtime --app-theme-* vars; built-in themes t3-chat, grove, ocean, ember, iris (+ palette-less default "T3 Code");
  `t3code:client-settings:v1` already persists fonts, contrast, glass, chat width, diff colours, panel animation,
  sidebar mode/sort, timestamp format (docs under-describe this: area 23 must reconcile code vs docs); sidebar
  width persisted in `chat_thread_sidebar_width`; no tray; no visual regression tests; web uses system fonts;
  terminal is Ghostty WASM. Capture script updated to set `t3code:theme` + `t3code:theme-appearance-mode`.
- 13:33 Fixture expansion: stopped the dev server by verified PIDs (port owners with cwd in this worktree; the
  dev-runner ignored SIGTERM so the server and Vite children were terminated directly), ran expand.mjs on
  /tmp/t3code-overhaul (142 threads, 439 messages, 1,370 turn items), restarted `vp run dev` (PID in
  /tmp/t3code-dev.pid). Pairing state survived (same auth DB).
- 13:40 Baseline capture started in background (/tmp/t3code-pw/run-baseline.sh → ui-overhaul/screens/baseline):
  26 states at 1440x900 light+dark; 10 key states at 1280x720/1024x640/800x600/3440x1440/390x844; 10 key states in
  the 5 named themes; a 2x-DPR thread shot. Sized to roughly 300 files so the public fork branch stays reasonable.
- 13:45 DNA.md done (703 lines, 110 DNA-* rules, 26 DRIFT-* leads, 40 screenshots in screens/dna). Notable: the
  blueprint header art and gradient send button are Dev/Nightly environment markers, not brand identity.
  Launching audit wave 1 (areas 01 02 03 04 05 07 09 12, Sonnet).
- 13:50 rejection-patterns.md done: 10,092 PRs closed in 6 months (6,550 merged); unvouched UI PRs merge 37% overall,
  69% at XS, 42% at M, 16% at L, 4% at XXL; unvouched `fix(...)` merges 50% vs `feat(...)` 10%; maintainers cite a
  "500-line review limit for unvouched contributors". Only 55% of merged UI PRs had images (so images are necessary
  per CONTRIBUTING but not sufficient). Exempt logins listed in .github/TRIAGE_EXEMPTIONS.td.
- 13:58 open-prs.md done: 2,220 open PRs (1,305 UI-relevant; 1,237 unvouched; sizes XS 295 / S 399 / M 586 / L 651 /
  XL 119 / XXL 157). Spawned the Sonnet PR grader (PRS.md: ADOPT/BORROW/SKIP with credit ledger).
- 14:05 Baseline capture complete: 252 PNGs (59 MB) in ui-overhaul/screens/baseline, 0 failures; MANIFEST.md written.
  The 2x-DPR shot is in baseline/dpr2/. Capture script and states documented in screens/capture.md.
- 14:15 PRS.md done (85 diffs read: 16 ADOPT, 53 BORROW, 16 SKIP; 285 widened pool triaged). KEY FINDING: the owner
  `t3dotgg` opened #24865 "feat(web): UI design overhaul, rated above Claude Code and Codex" at 12:12Z today
  (+502/-272, 55 files, vouch:trusted, size:XL, supersedes #24776/#24837/#24810). It changes fonts (Inter on
  Win/Linux), the radius scale (4/6/8/12/16), icon stroke (1.75), sidebar row hierarchy, composer controls,
  details panel, settings hierarchy, chat text opacity and light-mode status/diff tokens. It overlaps our areas
  01, 02, 04, 05 (details card), 07, 17, 18 and the token proposal. Saved body + diff under prior-art/.
- D-006 Decision (default taken, flagged for the user in spec §15): treat #24865 as a moving baseline. The spec's
  token/hierarchy proposals are written as a delta over #24865's end state where they overlap, each finding is
  tagged "addressed by #24865 / partially / not", and Phase 2's integration branch is cut from upstream main
  after #24865 merges (or from its head `t3/ui-polish-95` if still open at approval time). Upstream-eligible
  chunks exclude anything #24865 touches unless it is a follow-up fix to #24865 itself.
- 14:20 Wrote prior-art/OWNER-DIRECTION.md (what #24865 changes; the four owner calls that stay) and appended the
  "#24865 tagging" rule to audit/_PROTOCOL.md. Messaged all 8 wave-1 agents to tag every finding
  `#24865: addressed | partial | not addressed | conflicts` before they finish.
- 14:35 Area 02 thread-list done: 39 findings (P1 8 / P2 18 / P3 13), 70 screenshots; #24865 tags: 3 addressed,
  4 partial, 32 not. Worst: 200-char single-word title breaks the Archive page layout; list unusable without a
  mouse (hover-only actions, no menu roles, 368 tab stops); settled/snoozed rows at 2.7:1 contrast.
- 14:40 Area 01 app-shell done: 33 findings (P1 4 / P2 14 / P3 15), 113 screenshots; #24865: 31 not addressed, 2
  partial. Worst: collapsed-sidebar cookie never read (#24191); sidebar+right panel can squeeze chat to 280px;
  header panel buttons sit above the open sidebar sheet under 768px. Agent masked a local username in captures.
- 14:45 Area 09 providers-and-auth done: 39 findings (P1 12 / P2 19 / P3 8), 105 screenshots. Worst: not-installed
  providers have no install/copy/check-again action (raw backticks in copy); below ~1100px the provider editor
  opens below the fold with no scroll; second-account Claude login remedy omits CLAUDE_CONFIG_DIR. Probe
  instances/project cleaned up.
- 14:50 Area 03 thread-view done: 41 findings (P1 6 / P2 18 / P3 17), 77 screenshots. Worst: Copy code/table silently
  no-op without navigator.clipboard (HTTP over LAN); 1 MB thread opens blank, then blocks 2.4 s with 103k DOM
  nodes; scroll/status cluster (opens 156px short of the end, scroll-up reverted during a turn, "Working for"
  ticks while waiting on approval). Deeper looks: Claude answers arrive in one chunk (no incremental streaming).
- 14:55 Area 04 composer done: 42 findings (P1 3 / P2 22 / P3 17); #24865: 3 addressed, 4 partial, 35 not. Worst:
  permission mode is the first control to lose its label (icon-only at 800x600, gone at 390px); footer control
  text at 2.7:1/3.0:1; two placeholders (fixed by #24865). Side effect: one accidental turn sent to seed thread
  "Explain the repository" (transcript now has an extra "short prompt" exchange). Slash/$ menu screenshots
  withheld because they list the developer's personal skills.
- 15:00 Area 07 settings-appearance done: 39 findings (P1 7 / P2 20 / P3 12), 81 screenshots; #24865: 37 not, 2
  partial. Worst: one bad client-settings value replaces the whole app with "Could not read settings" and an
  unrecoverable Retry; VS Code JSONC theme import fails with raw V8 errors; Esc during theme Inspect closes
  Settings. Undocumented controls already in Appearance: Contrast, Glass opacity, Diff colors, Chat width,
  Interface/Monospace/Prompt/Terminal font families + sizes, Typography Advanced, Font smoothing, Word wrap,
  Open VSX search, theme collections. (Timestamp format, sidebar sort/grouping, diff layout live in General.)
  Area 23 must treat these as "exists".
- 15:05 Area 12 notifications-errors-toasts done: 40 findings (P1 7 / P2 17 / P3 16), 48 screenshots; 508 toast/confirm
  call sites inventoried. Worst: collapsed toast stack hides older errors while timers run (error readable 0.4 s
  of 5 s); composer upload failures surface in the thread-level banner 700 px away; destructive Confirm at
  3.8:1/3.5:1. Only area 05 outstanding in wave 1.
- 15:08 D-007: launching wave 2 (areas 06 08 10 11 13 14 15 16) with 7 of 8 wave-1 reports in and only area 05 still
  running. The purpose of waiting (skim summaries, control load) is met; idling on one agent would waste an hour.
  Wave-1 lessons injected: mask personal data in captures, use your own probe threads (never message seed
  threads), clean up state, tag findings against #24865.
