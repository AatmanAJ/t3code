# UI Overhaul Run Log

Run started: 2026-10-25 (local). Phase: 1 (audit + spec). Orchestrator: Claude Fable 5.1 via T3 Code.

## Ground truth at checkout

- Upstream: pingdotgg/t3code, default branch `main`.
- Upstream HEAD at checkout: `5f64c5eb299a23d278ef043c416bd4dc801bc53c`
  ("feat(server): cut T3's agent instructions and tool copy by 60% (#24850)", 2026-10-25 05:23 -0700).
- Fork: the GitHub account `AJ-Base44` was renamed to `AatmanAJ`; GitHub redirects the old name.
  The fork lives at https://github.com/AatmanAJ/t3code (public, `isFork: true`, parent pingdotgg/t3code).
  Fork `main` was ~3002 commits behind upstream at checkout; it will be fast-forwarded on push.
- Local clone: `<repo>`
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
- 15:15 Interim checkpoint: branch `ui-overhaul/audit` created from main (5f64c5eb); commit d711b4a3 (993 files,
  229 MB incl. screens). The repo's pre-commit `vp fmt` ran on the markdown. Not pushed yet; final push at the
  Phase 1 hard stop. Wave 2 (06 08 10 11 13 14 15 16) launched 15:08.
- 15:30 Area 05 diff-and-review done: 38 findings (P1 6 / P2 20 / P3 12), ~80 screenshots; #24865: 36 not, 2 partial.
  Worst: one click on the details-card "Commit" row commits everything with an AI message, no preview/undo
  (agent reverted with git reset, repo byte-identical); later-loading diff files ignore the fold default; binary
  files render as +0 -0 with an empty body. Wave 1 complete: 8/8.
- 15:35 Privacy check: the Pull Requests page captures (baseline + area 05) show pingdotgg/t3code's public PRs via
  the checkout's upstream remote, not private repositories. No masking needed. Baseline PR page captured the
  skeleton state (cold load takes 5-8 s; see F-05 / area 13).
- 15:45 Area 14 desktop-specific done: 33 findings (P1 3 / P2 15 / P3 15), 19 screenshots; all #24865 "not addressed".
  Worst: Win/Linux closing the last window quits app+backend without confirmation (#10161); a backend restart
  re-opens a deliberately closed window and steals focus on macOS (#24101, reproduced); no splash/window/error
  while the backend starts except on WSL. Capture: relaunched Electron with
  T3CODE_DESKTOP_REMOTE_DEBUGGING_PORT=9222 and drove it via Playwright connectOverCDP (OS screencapture is
  blocked on this host, so traffic lights are synthetic overlays). Dev Electron now owned by dev-runner PID 75061
  (main 75491); /tmp/t3code-desktop.pid updated.
- 15:55 Area 10 first-run-and-empty-states done: 37 findings (P1 8 / P2 17 / P3 12), 66 screenshots; 26 of 41 empty
  states do not use the Empty primitive. Worst: `npx t3`/`t3` first launches never show the wizard (server never
  sends bootstrap events: server dependency); `/` lands on the bootstrap thread not a draft (6/6); no way back
  to setup/import (#10961); `/new` without a prompt is a dead end. Agent reports the shared session was
  invalidated for ~10 min by another area; verifying.
- 15:58 Shared Playwright session verified working (Settings → Connections renders; 4 authorized clients).

### Hard stop HS-001: Sonnet session rate limit (wave 2)

- When: 2026-10-25 ~16:xx London. Six wave-2 agents (06, 08, 11, 13, 15, 16) terminated with HTTP 429 "session limit, resets 17:10 Europe/London" on claude-sonnet-5-5.
- Default taken: waited for reset, resumed the same agents at 17:39 via SendMessage (saved context, cheaper than fresh dispatch). Areas 10 and 14 were unaffected.
- Budget note: user asked for a cheaper run. From here on: agents reuse baseline captures, cap ~20 findings, 150-word returns; wave 3 briefs are lean; spec drafting delegated to Sonnet with orchestrator review.

### Wave 2 complete (17:39–17:50 London, after HS-001 resume)

- 06 terminal-and-panels: 22 (P1 9 / P2 12 / P3 1). 08 settings-project-and-keybindings: 47 (P1 3 / P2 31 / P3 13). 11 remote-access-and-pairing: 20 (P1 9 / P2 11). 13 loading-and-skeletons: 20 (P1 8 / P2 11 / P3 1), cold-load medians measured on prod build. 15 mobile: 19 (P1 6 / P2 11 / P3 2), iOS via XCUITest harness in /tmp, Android code-read only. 16 accessibility: 21 (P1 6 / P2 14 / P3 1), axe 3 critical / 5 serious.
- Environment notes: area 11's F-11-07 test revoked the shared Playwright session; replaced at ~14:27Z with label `shared-playwright-do-not-revoke` (never revoke). Area 16 toggled and restored a fixture pin. Simulator, Metro and probe sessions cleaned up by area 15.
- Wave 3 launched 17:41 London: 17, 18, 19, 20, 21, 23, 24 (lean briefs). 22 deferred to low-load slot.

### Wave 3 complete (17:41–18:12 London)

- 17 typography: 14 (P1 2). 18 shape-spacing-elevation: 9 (P1 1). 19 motion: 13 (P2 4 / P3 9). 20 copy-and-voice: 19 (P1 1) + 40-row copy table. 21 keyboard-shortcuts-ux: 20 (P1 2). 23 customisation-gap: 11 (11 of 27 candidates exist, 5 new fit DNA, 11 rejected). 24 onboarding-gap: 16 (P1 5) + 8 wireframes in spec/onboarding/.
- 18:13 launched 22 performance-feel alone (low load) and a code-only follow-up sweep (_FOLLOWUPS.md) covering every Incomplete / Needs-deeper-look item.
- spec/_FINDINGS-INDEX.md generated by script: 632 findings, P1 116 / P2 316 / P3 200, all fields present.
- D-008: user asked for a cheaper run mid-Phase-1. Spec drafting is delegated to Sonnet writers (parts A: §1–6, B: §7–12, C: §13–16) working from the index and extracted sections; orchestrator (Fable) reviews and stitches instead of writing every section. Kickoff rule "orchestrator synthesises" is kept at the review level.

### Follow-up sweep complete (18:45 London)

- audit/_FOLLOWUPS.md: 326 Incomplete / Needs-deeper-look items. 150 resolved from code (32 keep a short residual live check), 88 documented as Phase 2 live probes with steps and expected results, 88 duplicates pointed to their owning finding. Every area now has either a resolution or a re-dispatched follow-up entry.
- Severity changes recommended: F-03-15 (Claude text never streams; fix is server-only in ClaudeAdapterV2.ts, outside our change scope → upstream issue draft only) P2→P1.
- Corrections appended (additive sections, originals left in place): DNA.md §7.1 motion bullets + DNA-S1 radius ladder; DOCS-DIGEST.md customisation table (9 wrong rows, 2 additions, 3 one-liners); MAP.md pointer fixes.
- Part C (§13–16) drafting started 18:30; area 22 still measuring.

### Spec drafting (18:20–19:15 London)

- parts/A-sections-01-06.md 824 lines; parts/B-sections-07-12.md 774 lines; parts/C-sections-13-16.md 2,588 lines: 235 chunks (Tokens 13, Hierarchy 8, Polish-by-area 80, States 33, Edge cases 15, Customisation 11, Onboarding 17, Mobile 17, A11y 22, Motion 9, Copy 10), ~30,190 estimated lines, max chunk ~420 lines, 189 upstream candidates (92 now, 97 after #24865). Script-checked: every P1/P2 in exactly one chunk; 161 P3 deferred.
- Baseline drift check 19:05: upstream main is now 1eb4071a49, 12 commits past the recorded baseline 5f64c5eb (mobile fixes #24261 #24951 #23968 #24272 #24807, server #24275 #23969, web #22807, shared #22891, desktop #22970 #19221). #23968 "share toast motion and bring bottom undo to iOS" and #24951 touch area 15/19 surfaces; Phase 2 must re-verify F-15-* and F-19-* against it. PR #24865 still OPEN (updated 13:17Z, +502/−272, 55 files), so recommendation "cut Phase 2 branch after it merges" stands.

### Close-out prep (19:25–19:35 London)

- Fork `main` fast-forwarded (no force) from 8bc40b4e to upstream/main 1eb4071a49. Fork branch `ui-overhaul/audit` not yet on origin; pushed at Phase 1 close.
- ui-overhaul/ is 332 MB on disk; largest file 1.5 MB (prior-art/rejection-patterns.md); no file over 40 MB.
- Reconciliation notes R1–R5 written (spec/parts/98-reconciliation.md); part B provisional ids renamed (69 refs); 235 chunk cards validated by script (fields, ≤420 lines, no Opus high/Fable).
- Area 22 asked to wrap up at 19:23 with the measurements it has.

### Phase 1 close (19:50 London)

- Final audit totals: 24 areas, 640 findings — P0 0 / P1 117 / P2 320 / P3 203 (spec/_FINDINGS-INDEX.md). Area 22 landed last: 8 findings, chunked as P-22-1..5.
- Spec assembled by spec/parts/stitch.sh into spec/T3-CODE-UI-UX-SPEC.md (16 sections + reconciliation notes R1–R5 + self-check). PR plan: 240 chunks, ~30,605 estimated lines, max ~420 per chunk, Opus low/medium or Haiku only. Decisions: 31, each with a recommendation.
- Local absolute paths scrubbed from every text file under ui-overhaul/ (`<repo>` / `<home>`).
- Left running on purpose for Phase 2: web dev runner PID 95734 (home /tmp/t3code-overhaul, ports 13773/5733) and desktop dev runner PID 75061 (home /tmp/t3code-overhaul-desktop, CDP 9222). Playwright tooling in /tmp/t3code-pw (shared session label `shared-playwright-do-not-revoke`). Never touched ~/.t3/userdata.
- Hard stops: HS-001 only. Nothing was opened on pingdotgg/t3code (no PR, issue, discussion or comment). Phase 2 not started.
