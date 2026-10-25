# Area 10: first-run and empty states

Audit of `FirstRunGate`, `WelcomeWizard`, and every empty state in the web app. Findings only; no source was edited.
Baseline: pingdotgg/t3code main @ 5f64c5eb, dev app at `http://localhost:5733`, state dir `/tmp/t3code-overhaul`, Playwright (Chromium, macOS). Owner PR #24865 read from `prior-art/pr-24865.diff` and tagged per finding.

Screenshot prefix: `[S]` = `ui-overhaul/screens/10-first-run-and-empty-states/10-first-run-and-empty-states-`. Example: `[S]welcome-1-connect-light-1440x900.png`. Every state was captured in light and dark at 1440x900 unless the name says otherwise.

Method notes that change how to read the evidence:

- A true first launch cannot be produced on the shared dev server (no zero-project state, no fresh `~/.t3`). `/welcome` was driven directly; "Could not read settings" and "Still connecting" were produced in disposable browser contexts (invalid `t3code:client-settings:v1`; WebSocket swallowed with `page.routeWebSocket`). Closing the wizard writes `onboardingCompletedAt` only into those disposable contexts, never into `state.json`.
- The zero-project hero was captured from `/welcome` with the dialog and sidebar hidden (the same `NoProjectsHero` component). "Code-read" in a finding means that path could not be produced live.
- The import step lists the developer's real Claude Code and Codex directories. Every import capture is masked (`acme/service-N`, `~/code/project-N`); two unmasked frames and three other captures were deleted (see Incomplete).

## Summary

| ID      | Sev | Title                                                                                                                                    | #24865        |
| ------- | --- | ---------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| F-10-01 | P1  | Web-mode first launch (`npx t3`, `t3`) never shows the wizard: the server never sends `bootstrapProjectCreated`/`bootstrapThreadCreated` | not addressed |
| F-10-02 | P1  | Nothing in the app leads back to setup or project import after first run (`/welcome` has no entry point; desktop has no URL bar)         | not addressed |
| F-10-03 | P1  | `/` lands on an arbitrary existing thread (the server's bootstrap thread), not a draft; two owners of `/`                                | not addressed |
| F-10-04 | P1  | `/new` without a prompt is a dead-end "Could not open the link" page with no chrome and no action                                        | not addressed |
| F-10-05 | P1  | The two first-run recovery cards have no drag region: on desktop the window cannot be moved                                              | not addressed |
| F-10-06 | P1  | The recovery cards dead-end: "Could not read settings" loops on Retry; "Still connecting" blocks every route                             | not addressed |
| F-10-07 | P1  | Import step with nothing to import: disabled primary, only exit is a refusal-worded button (code-read)                                   | not addressed |
| F-10-08 | P1  | "Send a message to start the conversation." renders at 1.47:1 (light) and 1.44:1 (dark)                                                  | addressed     |
| F-10-09 | P2  | Blank page for up to 4 s before the gate shows anything                                                                                  | not addressed |
| F-10-10 | P2  | Wizard opens with focus ring on the secondary "Add a computer" disclosure, not on Continue                                               | not addressed |
| F-10-11 | P2  | Escape does nothing; the only way out is the X, last in tab order, and it silently completes onboarding                                  | not addressed |
| F-10-12 | P2  | Wizard footer is not sticky: at 800x600 and 200% zoom the Continue and Import buttons are below the fold                                 | not addressed |
| F-10-13 | P2  | Import rows show a bare count and age with no labels                                                                                     | not addressed |
| F-10-14 | P2  | At 390 px the import row truncates project names to about six characters                                                                 | not addressed |
| F-10-15 | P2  | Agents step: Continue stays primary with zero ready agents and says nothing about it (code-read)                                         | not addressed |
| F-10-16 | P2  | Step 1 asks the single-computer user to "connect your computers"                                                                         | not addressed |
| F-10-17 | P2  | A link to a thread that no longer exists silently becomes a draft in an unrelated project                                                | not addressed |
| F-10-18 | P2  | Sidebar zero states: 2.27:1 text in light, no action on "No threads in X yet"                                                            | not addressed |
| F-10-19 | P2  | Diff panel empty states are five hand-rolled 12 px lines at 2.73:1, with jargon copy and no action on non-Git                            | not addressed |
| F-10-20 | P2  | A no-project (scratch) thread still shows "Add project script" and "Initialize Git"                                                      | not addressed |
| F-10-21 | P2  | "Initialize Git" is a bare one-click row that says nothing about what it buys                                                            | not addressed |
| F-10-22 | P2  | Pull Requests page blames the filters when the project has no Git remote                                                                 | not addressed |
| F-10-23 | P2  | Usage empty states are plain lines with no action (code-read)                                                                            | not addressed |
| F-10-24 | P2  | Zero providers: the composer chip can be a disabled dead end; the Providers page shows bare text (code-read)                             | partial       |
| F-10-25 | P2  | 26 of 41 inventoried empty states bypass the `Empty` primitive; add `size="inline"` and migrate the high-traffic ones                    | not addressed |
| F-10-26 | P3  | Import step heading changes between loading and loaded; the escape button is worded as a refusal                                         | not addressed |
| F-10-27 | P3  | The two agent cards are different components with different content; "Ready" appears twice                                               | not addressed |
| F-10-28 | P3  | Step names disagree across chips, headings and docs; chip names vanish below 640 px                                                      | not addressed |
| F-10-29 | P3  | `NoActiveThreadState` is unreachable in every state I could produce and carries /50 and /60 text                                         | not addressed |
| F-10-30 | P3  | An unbroken 210-character project name overflows the sidebar empty message                                                               | not addressed |
| F-10-31 | P3  | Pull request empty states carry an illustration drawn with four opacity steps                                                            | not addressed |
| F-10-32 | P3  | Empty archive says nothing about how a thread gets archived                                                                              | not addressed |
| F-10-33 | P3  | Hosted empty state: product name at /60 in the header (code-read)                                                                        | not addressed |
| F-10-34 | P3  | `Empty` primitive: title is a `div`, media spacing differs by where it is placed, `PreviewEmptyState` skips the header                   | not addressed |
| F-10-35 | P3  | One thing, three names in first-run and empty strings: computer, environment, machine                                                    | not addressed |
| F-10-36 | P3  | Voice slips: three-dot ellipses and one contraction in first-run and empty-state strings                                                 | not addressed |
| F-10-37 | P3  | Nothing surfaces existing features or release notes after install or update                                                              | not addressed |

Counts: P0 0, P1 8, P2 17, P3 12, total 37.

## What first run looks like today (documented, as it feels)

1. Desktop, zero projects: `FirstRunGate` (`components/onboarding/FirstRunGate.tsx`) waits for authoritative evidence, decides `wizard`, and replaces `/` with `/welcome`. The route renders `NoProjectsHero` under a 768 px modal `WelcomeWizard` over a blurred app shell [S]welcome-1-connect-light-1440x900.png.
2. Step 1 "Connect your computers": the local computer is preselected and "Connected"; "Add a computer" opens a pairing-link form [S]welcome-1-connect-add-computer-light-1440x900.png. The primary is Continue.
3. Step 2 "Connect your agents": one card per agent per computer, live status from `serverEnvironment.providersValueAtom` [S]welcome-2-agents-light-1440x900.png. Install/Sign in opens a pre-typed terminal (code-read; both agents are ready here).
4. Step 3 "Import your projects": up to 19 candidates grouped by remote, 2 preselected, 12 under "Other folders" [S]welcome-3-import-masked-light-1440x900.png.
5. Skip paths: the X (calls `completeOnboarding()` and goes to `/`), "Do not import projects", or finishing. Escape and outside clicks do nothing.
6. Landing: `/` then opens a draft (`IndexDraftLanding`) or, with zero projects, `NoProjectsHero` [S]no-projects-hero-light-1440x900.png. The hero is the best first-run surface in the app: one question, one primary, one outline button.
7. Returning users after an update see nothing new. `onboardingCompletedAt` lives in client settings, so the gate resolves to `app` immediately; a cleared browser profile with more than one project or thread also resolves to `app` and re-persists completion (`firstRun.logic.ts:121-131`). The only update surfaces are the sidebar pill and the "Update did not apply" toast (`sidebar/updateEverythingRun.tsx:324-331`).

## Findings

### A. Gate and wizard

### F-10-01 Web-mode first launch never shows the wizard: the server never sends `bootstrapProjectCreated` or `bootstrapThreadCreated`

- Severity: P1
- Surface: web (`npx t3`, `t3`, dev). Desktop is expected to be unaffected (mode `desktop` does not auto-bootstrap, so it starts with zero projects); Electron was not driven.
- Evidence: Live WebSocket capture of the lifecycle `welcome` payload on the dev server: keys `bootstrapProjectId` and `bootstrapThreadId` only. `grep` over `apps/server/src` finds no producer for `bootstrapProjectCreated`/`bootstrapThreadCreated` (only the contract at `packages/contracts/src/server.ts:785-786` and web consumers). `apps/server/src/serverRuntimeStartup.ts:274-330` calls `projects.bootstrap(...)`, which returns `{ project, created }` (`project/ManagedProjectFolders.ts:285` reads `bootstrapped.created`), then discards `created`. `isFreshFirstRunWorkspace` (`onboarding/firstRun.logic.ts:73-107`) returns false whenever a bootstrap project exists and `bootstrapProjectCreated !== true` (`:80-89`). `autoBootstrapProjectFromCwd` defaults to `mode === "web"` (`apps/server/src/cli/config.ts:374-380`), so every web-mode launch has that project. Result: `resolveFirstRunDecision` returns `app` with `persistCompletion: true` (`:143-145`), which marks the user onboarded without ever showing setup. The comment at `FirstRunGate.tsx:99` ("sole cwd-bootstrap project/thread still counts as fresh so npx t3 users see onboarding") describes behavior that cannot occur. `firstRun.logic.test.ts:164-222` passes only because its fixtures set the flags by hand. `docs/user/welcome-wizard.md:3-4` promises setup for new installations on web. Not reproduced end to end (the shared server has several projects, so the gate resolves to `app` for a different reason); derived from the live payload keys plus the code path.
- Current: A person who runs `npx t3` for the first time lands in the cwd project's empty "New thread" with no agent check, no import, and no way to find either (F-10-02).
- Proposed: Dependency (apps/server, outside UI scope, written as such): in `resolveAutoBootstrapWelcomeTargets` (`serverRuntimeStartup.ts:262-330`) return `bootstrapProjectCreated: created` from the `projects.bootstrap` result and `bootstrapThreadCreated: launched !== undefined`; `...bootstrapTargets` already spreads into `welcome.publish` (`:645-658`). Extend `AutoBootstrapWelcomeTargets` (`:185-188`) with both optional booleans and assert them in `serverRuntimeStartup.test.ts`. No web change is needed for the wizard; the web consumers already exist.
- DNA: DNA-P3 (a documented first-run flow must run), DNA-P8 (every client and connection mode).
- Effort: XS (server, about 15 lines plus one test).
- Risk: Web-mode first-time users will start seeing the wizard, and its "Check your agents" and import steps run against the cwd server. Covered by `firstRun.logic.test.ts` (consumer) and `serverRuntimeStartup.test.ts` (add). Existing users are unaffected because `onboardingCompletedAt` is already set or their workspace has more than one project or thread.
- Upstream-eligible: yes as a standalone server fix; it needs the maintainers' confirmation that skipping the wizard on web was not intended.
- #24865: not addressed (does not touch the gate, server, or wizard).

### F-10-02 Nothing in the app leads back to setup or project import after first run

- Severity: P1
- Surface: all web and desktop (desktop worst)
- Evidence: `grep` for `/welcome` in `apps/web/src` finds only the auto-redirect (`FirstRunGate.tsx:164`), a Codex return URL (`settings/CodexSetupSection.tsx:270,407`) and the route file. The palette actions around `CommandPalette.tsx:1573-1600` are "Open pull requests", "Open usage", "Open settings"; no setup or import entry. `docs/user/welcome-wizard.md:11-12` says "open `/welcome` to run setup again"; the Electron app has no URL bar and `promptLinkAppPath` (`packages/shared/src/promptLinks.ts`) only maps `new` and `threads` links. Issue #10961 ("Session import is unreachable after onboarding", 3 reactions, 6 comments) and PRs #23122 and #22411 ask for the same thing. After F-10-01 is fixed this matters more, and today `npx t3` users never see the wizard at all. `NoProjectsHero` cannot offer import either ([S]no-projects-hero-light-1440x900.png).
- Current: The wizard's import step is a one-shot. A user who clicked the X, or whose first run predated their Claude Code history, can never import without typing a URL.
- Proposed: (1) Add a palette action in `CommandPalette.tsx` beside "Open settings" (`:1594-1603`): `value: "action:setup"`, `title: "Open setup"`, `searchTerms: ["setup","welcome","onboarding","import","claude","codex","projects"]`, lucide `FolderInputIcon` at `ITEM_ICON_CLASS`, `run: navigate({ to: "/welcome" })`. (2) Add a Settings → General row "Import projects" with a `Button size="sm" variant="outline"` "Open setup" (same destination) in `SettingsPanels.tsx`. (3) Let `routes/welcome.tsx:27-29` accept `#import:<environmentId>` beside `#agents:` and pass it to `WelcomeWizard` as `initialStep="import"` so the row can land on step 3. (4) Add a third text button to `NoProjectsHero.tsx:31-46`: `Button size="sm" variant="ghost"` "Import from Claude Code or Codex" to the same hash. (5) Correct `docs/user/welcome-wizard.md:11-12` to name the palette action and the Settings row.
- DNA: DNA-P7 (every way in has a way out; a one-shot step needs a way back), DNA-P8 (entry points: palette, settings, chat).
- Effort: S (palette + settings row + hash handling about 90 lines; NoProjectsHero button about 10).
- Risk: The wizard remounts with `onDone`; `finish()` calls `completeOnboarding()` again, which is harmless. No test covers `/welcome#...`; add one browser test for the hash. Keybinding: none added.
- Upstream-eligible: yes for (1) and (2), small and fix-shaped (cite #10961); (3) to (5) as a follow-up.
- #24865: not addressed (it relabels wizard-adjacent strings only).

### F-10-03 `/` lands on an arbitrary existing thread (the server's bootstrap thread), not a draft

- Severity: P1 (confirms the wave-1 lead from area 01)
- Surface: web (`npx t3`, dev); the cwd bootstrap exists only in web mode
- Evidence: Six fresh browser contexts, `goto("/")`, 1.5 s and 5 s waits: all six finished on `/<env>/mcp:ef0bc57f-0a39-4797-8a34-9109628f1288` (the pinned "Migrate tests to vitest browser mode" thread in project `server`), with history `/` then `/` then the thread URL. Cause: `routes/__root.tsx:535-577` (`EventRouter.handleWelcome`) replaces `/` with `payload.bootstrapThreadId`. The server fills it with the first non-subagent thread found in the cwd project (`serverRuntimeStartup.ts:279-325`, `shell.threads.find`), which is neither the newest nor an empty one. Meanwhile `routes/_chat.index.tsx:35-85` (`IndexDraftLanding`) is built to open a draft in the most recently updated project. Two components race for `/`; the welcome event wins on a normal connection. Related: F-01-18 (brand link "Go to threads" opens a draft).
- Current: Every new tab, reload on `/`, and app start in web mode opens an old thread and puts the composer under a conversation the user did not choose. The code path that exists to open a fresh draft never gets to run.
- Proposed: Navigate to the bootstrap thread only when the server created it this boot: `if (readPathname() !== "/" || payload.bootstrapThreadCreated !== true) return;` at `__root.tsx:558` (keep the `setProjectExpanded` call above it, and keep the `skipInitialBootstrapNavigation` handling). Gated on the F-10-01 server dependency because today the field is never sent. Shipped alone, the condition simply stops the redirect (first runs get a draft instead of the empty bootstrap thread); with the dependency in place a first run still opens the fresh "New thread", and every later launch falls through to `IndexDraftLanding`.
- DNA: DNA-P2 (obvious: the home route does one thing), DNA-P3.
- Effort: XS (one condition and one browser test) once F-10-01 lands.
- Risk: `t3 ./my-project` for a project that already has threads will stop opening its first thread. If the maintainers want "resume where I was" instead, the better target is the last-viewed thread (`mainAppLocation.ts`), not the first one in the snapshot. No test covers `EventRouter` landing; add `__root` browser test for `/` with `bootstrapThreadCreated` true and false.
- Upstream-eligible: yes after F-10-01.
- #24865: not addressed.

### F-10-04 `/new` without a prompt is a dead-end error page with no chrome and no action

- Severity: P1 (confirms the wave-1 lead)
- Surface: all (web route; desktop via `t3code://new`)
- Evidence: [S]new-no-prompt-light-1440x900.png, [S]new-no-prompt-dark-1440x900.png, [S]new-no-prompt-light-390x844.png. `/new` renders "Could not open the link / This link has no prompt." in a `SidebarInset` with no header (`routes/_chat.new.tsx:11-22`); `parseNewThreadLink` returns that error whenever `prompt` is absent and `pr` is absent (`packages/shared/src/promptLinks.ts`, `if (prompt.value === null) return { ok: false, error: "This link has no prompt." }`). `promptLinkAppPath` maps `t3code://new` to `/new` with an empty query, so the natural "new thread" deep link lands here. The sibling `LinkPage` (`promptLinks/NewThreadLinkView.tsx:436-448`) does render `WorkspacePageHeader` on Electron; this inline copy does not, so there is no drag strip on desktop either. No button, no link back.
- Current: The user sees an error for a URL they typed correctly, and has to find the sidebar.
- Proposed: In `NewThreadLinkRoute` (`_chat.new.tsx:8-24`): when `search` has no recognised params (`location.searchStr === ""` after `withoutPromptLinkParams`), render `<Navigate to="/" replace />` so a bare `/new` behaves like "new thread". For a genuinely malformed link, render the existing `LinkPage` from `NewThreadLinkView.tsx` (export it) so the header and an action appear: `Button size="sm"` "New thread" (`navigate({ to: "/" })`), title unchanged ("Could not open the link", already DNA-V4), description `${parsed.error} Start a new thread instead.`
- DNA: DNA-P7 (an error state needs a way out), DNA-V3 (say what failed, then how to proceed).
- Effort: XS
- Risk: `promptLinks` tests cover `parseNewThreadLink`; add a route test for bare `/new`. Hosted prompt-link landing (`useHostedPromptLinkLanding`) is a separate path and unchanged.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-05 The two first-run recovery cards have no drag region: on desktop the window cannot be moved

- Severity: P1
- Surface: desktop
- Evidence: `FirstRunRecovery` (`FirstRunGate.tsx:180-218`) renders `<main className="flex h-dvh min-h-0 items-center justify-center ...">` with no header strip. On macOS the window uses `titleBarStyle: "hiddenInset"` and on Windows `"hidden"` with an overlay (`apps/desktop/src/window/DesktopWindow.ts:229-248`); the window only moves where `.drag-region` is applied (`index.css:1755`, applied by `WorkspacePageHeader electron`). `NoProjectsHero.tsx:20` states the rule ("The desktop window only moves where CSS opts in, so keep a titlebar strip") and keeps a strip; the recovery card does not. Code-read: Electron was not driven (area 14).
- Current: With "Could not read settings" or "Still connecting" showing, the native traffic lights sit over an unmovable window and the card sits at `h-dvh` centre.
- Proposed: Extract a shared `FirstRunShell` in `FirstRunGate.tsx` used by pending, settings and connection states: `<main className="flex h-dvh min-h-0 flex-col bg-background text-foreground">` with `{isElectron ? <WorkspacePageHeader electron /> : null}` above a `<div className="flex flex-1 items-center justify-center px-6">`. Render the card with `Empty size="compact"` (F-10-25) so it also stops being the only 18 px / 600 title in the app.
- DNA: DNA-D3 (one 52 px top bar height), DNA-P8 (desktop is a surface).
- Effort: XS
- Risk: No test covers the recovery cards; add a browser test that asserts the header exists under `isElectron`.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-06 The recovery cards dead-end

- Severity: P1
- Surface: web, desktop
- Evidence: Reproduced twice in disposable contexts. Invalid JSON in `t3code:client-settings:v1`: "Could not read settings / Your saved settings could not be loaded. / Retry" ([S]first-run-could-not-read-settings-light-1440x900.png); two Retry clicks changed nothing and `/settings/general` rendered the same card, because `FirstRunGate.tsx:168-170` returns the card for every route. This is F-07-13 (Reset settings proposal there; not repeated). Second variant: with the WebSocket swallowed, the gate shows a blank page for 4 s and then "Still connecting / T3 Code could not confirm this workspace. / Reload" ([S]first-run-still-connecting-light-1440x900.png). `FirstRunGate.tsx:171-176` lets only the `wizard` decision render children off `/`; a stalled `pending` returns the card for every path, so Settings → Connections (the one place a user could fix a bad connection) is also unreachable. The docs promise otherwise ("Direct links, such as Settings, open normally", `welcome-wizard.md:13`), true only for the `wizard` decision.
- Current: Both cards offer one button that repeats the failed read.
- Proposed: (1) Settings variant: implement F-07-13's "Reset settings" (not restated). (2) Connection variant: when `stalled` and `pathname !== "/"`, `return children` (`FirstRunGate.tsx:174`: `if (decision !== "app") return stalled && wizardOwnsRoute ? <FirstRunRecovery reason="connection" /> : stalled ? children : null`), and add a second button to the card: `Button size="sm" variant="ghost" render={<Link to="/settings/connections" />}` "Open Connections". (3) Copy: title "Still connecting" stays (it is true; evidence keeps arriving and the gate leaves the card on its own), description becomes "T3 Code has not heard from this workspace yet. Check that the server is running, or open Connections." (second sentence is an instruction, no blame).
- DNA: DNA-P7, DNA-V3.
- Effort: S
- Risk: Rendering children while `pending` for a deep link can paint an unready app shell; limited to the post-timeout `stalled` state. Covered by `firstRun.logic.test.ts` for the state machine; the render branch has no test.
- Upstream-eligible: yes for the connection variant (settings variant per F-07-13).
- #24865: not addressed.

### F-10-07 Import step with nothing to import: disabled primary, refusal-worded exit (code-read)

- Severity: P1 (the likeliest step-3 state for someone new to coding agents; not produced live because this host has 19 candidates)
- Surface: web, desktop
- Evidence: `WelcomeWizard.tsx:1483-1487` renders "No existing Claude Code or Codex projects found." as a 14 px muted line; `:1503-1519` still renders `Do not import projects` (ghost-muted) and the primary `Import 0 projects`, disabled by `selected.length === 0` (`:1512`). `Select all`/`Select none` are hidden (`:1425`). The only enabled control reads as declining something. The same happens when candidates exist but none are in the default selection (30 days, 3+ conversations, `projectImport.logic.ts:5-6,14-24`).
- Current: A first-timer with no history sees a disabled blue button labelled "Import 0 projects" and a grey button that says "Do not".
- Proposed: In `ImportStep`, when `selected.length === 0`: render only one primary `Button` "Continue" (`autoFocus`, calls `finishAfterImport`) and, if candidates exist, keep a text button "Select all" beside it; rename the secondary to "Skip import" in every state (DNA-V2: a verb, not a refusal). When `candidates.length === 0 && scans.every((s) => s.error === null && !s.isPending)`, replace the muted line with `Empty size="inline"` (F-10-25): title "No projects found", description "Claude Code and Codex have not used any folders on {machine label}. Add a project from the sidebar when you are ready." Keep the scan-error Retry row as is.
- DNA: DNA-V2 (buttons are verbs), DNA-P2 (do not show a control that cannot act).
- Effort: S
- Risk: `WelcomeWizard.import.browser.test.tsx` covers import states; extend with the zero-candidate case.
- Upstream-eligible: yes.
- #24865: not addressed (it relabels adjacent wizard strings; check for collisions in `WelcomeWizard.tsx` before editing).

### F-10-08 "Send a message to start the conversation." renders at 1.47:1 (light) and 1.44:1 (dark)

- Severity: P1
- Surface: all web and desktop
- Evidence: `components/chat/MessagesTimeline.tsx:1086`: `<p className="text-sm text-muted-foreground/30">`. Measured on the dev server's empty thread (`thread:project:61066aae-…:ae46224c-…`): computed color `oklab(0.552 … / 0.3)` over `oklch(0.992 0 0)` is 1.47:1; dark `oklab(0.6037 … / 0.3)` over `oklch(0.145 0 0)` is 1.44:1 (solid muted is 4.71 and 5.08). [S]thread-empty-timeline-light-1440x900.png. It is the only copy in the product's single most repeated empty state and DNA-ID3 calls it out by name.
- Current: The line is effectively invisible; a new thread looks broken.
- Proposed: Already in #24865: `text-muted-foreground` (4.71:1 / 5.08:1). Keep that exactly; do not choose a stronger grey (DNA-C4: two text levels). Do not add a third rule on top.
- DNA: DNA-C4, DNA-C5, DNA-ID3.
- Effort: XS (done in the PR)
- Risk: none beyond the PR.
- Upstream-eligible: no (superseded by #24865; the file is in its diff).
- #24865: addressed (`MessagesTimeline.tsx` hunk at `@@ -1082,9 +1082,7 @@`).

### F-10-09 Blank page for up to 4 s before the gate shows anything

- Severity: P2
- Surface: web, desktop (new installs and cleared storage only; returning users skip the gate)
- Evidence: `FirstRunGate.tsx:174-176` returns `null` while `decision === "pending"` and `stalled` is false; `FIRST_RUN_DECISION_TIMEOUT_MS = 4_000` (`:31`). Measured with the WebSocket swallowed: `document.body.innerText === ""` at 2.5 s ([S]first-run-pending-blank-light-1440x900.png is the bare `#fcfcfc` canvas), card at 4 s. The comment at `:29` says pending "blocks all rendering". A slow server start (a cold `npx t3`) is the real-world trigger.
- Current: No brand, no spinner, no text for up to four seconds on the most important launch.
- Proposed: Render the same `FirstRunShell` (F-10-05) while pending, with a `Spinner size="md" tone="muted"` and the line "Connecting…" (U+2026) that appear only after 1 s (a `useEffect` timer, so fast connects never flash). The shared `Spinner` is already visibility-aware (DNA-M6) and the state is real work (DNA-M9).
- DNA: DNA-P3 (the UI reports real state), DNA-M6.
- Effort: S
- Risk: Skeleton states are area 13's; keep this to the gate. No test; add one for the 1 s reveal using the existing fake-timer pattern in `firstRun.logic.test.ts`.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-10 Wizard opens with the focus ring on "Add a computer", not on Continue

- Severity: P2
- Surface: web, desktop
- Evidence: Measured on `/welcome` at 1440x900 and 390x844: `document.activeElement` is the "Add a computer" button, ring drawn ([S]welcome-1-connect-light-1440x900.png). Cause: `WelcomeWizard.tsx:230` `initialFocus={() => document.getElementById("onboarding-pairing-url") ?? true}` returns `true` (first tabbable), which overrides `autoFocus={!expandPairingInitially}` on Continue (`:449`). Tab order from there: Add a computer, privacy policy, Continue, Close; Enter on the focused button opens the pairing form. Steps 2 and 3 are fine (Continue and Import carry `autoFocus`).
- Current: Pressing Enter on a fresh launch opens the secondary form instead of continuing.
- Proposed: Give the step's primary button a stable id (`id="onboarding-continue"` on the Continue at `:445-452`) and change `:230` to `initialFocus={() => document.getElementById("onboarding-pairing-url") ?? document.getElementById("onboarding-continue") ?? true}`. If Continue is still disabled (computer connecting) the existing effect at `:322-330` focuses it when `ready` flips.
- DNA: DNA-P2 (obvious), accessibility floor (non-negotiable 6).
- Effort: XS
- Risk: `WelcomeWizard.import.browser.test.tsx` renders the wizard; add one assertion on `document.activeElement`.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-11 Escape does nothing, and the X silently completes onboarding

- Severity: P2
- Surface: web, desktop
- Evidence: Playwright: Escape and a click on the backdrop leave `[role="dialog"]` open; only the X closes it, then `localStorage["t3code:client-settings:v1"].onboardingCompletedAt` is written and the route becomes `/draft/<id>`. Code: `WelcomeWizard.tsx:221-225` ignores every close reason except `"close-press"`, plus `disablePointerDismissal`. The X is last in tab order (Add a computer, privacy policy, Continue, Close). The docs ("Close setup while no import is running to go straight to the app") are accurate; the dialog just does not honour the platform's close key.
- Current: A keyboard user who opens the wizard by mistake has to Tab to the last control.
- Proposed: In `onOpenChange`, treat `event.reason === "escape-key"` like `"close-press"` when `!isImporting` (`void finish()`). Keep `disablePointerDismissal` (a stray click should not end setup).
- DNA: DNA-K14 (keyboard-first), accessibility floor.
- Effort: XS
- Risk: Escape while the pairing input is focused would close setup; guard with `event.reason === "escape-key" && document.activeElement?.id !== "onboarding-pairing-url"`.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-12 The wizard footer is not sticky: Continue and Import fall below the fold at 800x600 and at 200% zoom

- Severity: P2
- Surface: web, desktop
- Evidence: Step 3 measured with `getBoundingClientRect`: 1024x640 button bottom 634 of 640 (fits by 6 px); 800x600 dialog 568 px tall, button bottom 634 > 600, `scrolls: true`; 720x450 (200% zoom equivalent) dialog 418 px, button bottom 526 > 450 ([S]welcome-3-import-masked-light-800x600.png). `WizardPopup` (`components/ui/wizard.tsx:9-23`) wraps header and panel in one `ScrollArea`; `WelcomeWizard` never uses the existing `WizardFooter` (`wizard.tsx:46-63`). The import list adds a second scroll region (`max-h-80`, `WelcomeWizard.tsx:1450`), and the Agents list another (`max-h-[min(32rem,55dvh)]`, `:676`).
- Current: The primary action is off screen with a thin scrollbar as the only hint, inside a scroll area inside a scroll area.
- Proposed: Add `footer?: ReactNode` to `WizardPopup`, rendered after the `ScrollArea` as `<DialogFooter variant="default" className="shrink-0">` (`border-t bg-muted/72 px-6 py-4`, `ui/dialog.tsx:148-167`), and move each step's Continue/Import row into it. Drop the inner `max-h-80` so one scroll region remains.
- DNA: DNA-D6 (degrade, do not scroll first), accessibility (zoom reflow).
- Effort: M (`WizardPopup` is shared with the Add-provider wizard; check `grep WizardPopup`).
- Risk: Other wizards using `WizardPopup` gain an optional prop only. Visual diff on all three steps needed.
- Upstream-eligible: yes if kept to the footer.
- #24865: not addressed.

### F-10-13 Import rows show a bare count and age with no labels

- Severity: P2
- Surface: web, desktop
- Evidence: `ImportRowMeta` (`WelcomeWizard.tsx:1720-1758`) renders two provider icons, then `{threadCount}` and `{age}` in `grid-cols-[1rem_1rem_2.5rem_2.25rem]`; nothing says "conversations" or "last active" ([S]welcome-3-import-masked-light-1440x900.png rows read "14 1m"). Screen readers announce "14 1m".
- Current: Users must read the docs ("at least three conversations", "last 30 days") to decode two numbers.
- Proposed: Add `aria-label` to the count and age spans (`${threadCount} conversations`, `Last active ${…}`) and a visible header row at `sm:` in the import list: same grid, `text-2xs text-muted-foreground`, labels "Conversations" and "Last active" right-aligned over the two numeric columns. At `max-sm` keep numbers only.
- DNA: DNA-V5 (explain in place, once, briefly), DNA-T9.
- Effort: XS
- Risk: none; `WelcomeWizard.import.browser.test.tsx` queries by role/name, re-run.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-14 At 390 px the import row truncates project names to about six characters

- Severity: P2
- Surface: web (narrow), mobile web
- Evidence: [S]welcome-3-import-masked-dark-390x844.png: names show as `acme/…` and paths as `~/code/pr`. `ImportCandidateRow` (`WelcomeWizard.tsx:1688-1716`) puts name, path, two icons, count and age in one flex line; at 358 px dialog width the meta takes about 110 px and name plus path share the rest. Touch has no tooltip (the full path lives in `TooltipPopup variant="code"`, `:1709`).
- Current: At phone width the user cannot tell the projects apart.
- Proposed: Make the tooltip trigger a column below `sm`: `className="flex min-w-0 flex-1 flex-col items-start gap-0 sm:flex-row sm:items-baseline sm:gap-2"` (`:1697`), so the name gets the full line and the path sits under it at `text-2xs`. Row min-height stays `py-1.5`; the 44 px touch target already comes from the label.
- DNA: DNA-T3 (narrow widths scale controls, not content), DNA-X4.
- Effort: XS
- Risk: Row height grows from about 34 px to about 46 px at phone width; the list is scrollable.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-15 Agents step: Continue stays primary with zero ready agents and says nothing about it (code-read)

- Severity: P2
- Surface: web, desktop
- Evidence: `AgentsStep` renders `<Button autoFocus onClick={onContinue}>Continue</Button>` unconditionally (`WelcomeWizard.tsx:691`); `ConnectedAgentsStep` (`:700-860`) shows per-card state but no summary. Both agents were Ready on this host, so the not-installed and signed-out states (`AgentCard`, `:984-1002`: "Install"/"Sign in") were read from code. A user who skips Install lands in an app whose composer says "Enable a provider in Settings to send a message" (`ChatComposer.tsx:3794-3795`).
- Current: Nothing connects "I pressed Continue with no agent" to the later dead composer.
- Proposed: In `ConnectedAgentsStep`, when every `primaryAgents` entry has `getOnboardingProviderState(provider) !== "ready"`, render under the cards `<p className="mt-2 text-xs text-muted-foreground">No agent is ready on {machineLabel}. You can continue and set one up later in Settings → Providers.</p>` (sentence case, ends with a period, names the place). No change to the button.
- DNA: DNA-V5, DNA-P7.
- Effort: XS
- Risk: `providerReadiness.logic.test.ts` covers state; the note itself is untested.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-16 Step 1 asks the single-computer user to "connect your computers"

- Severity: P2 (feel; the redesign belongs to area 24, this is the smallest copy-only change inside the existing structure)
- Surface: web, desktop
- Evidence: `ConnectionStep` (`WelcomeWizard.tsx:293-460`): with one preselected, connected computer ([S]welcome-1-connect-light-1440x900.png) the step offers a checkbox that cannot usefully be unchecked, "Add a computer", a privacy paragraph and Continue. Heading "Connect your computers" and "Choose one or more computers. We’ll set up agents and projects on each." (`:334-337`) are written for the multi-computer case.
- Current: The most common person (local app, one machine) reads a decision into a no-op.
- Proposed: When `directEnvironments.length === 1 && ready`: h1 "Set up T3 Code"; description `T3 Code is running on {label}. Next we check your agents and offer to import your projects, or add another computer first.`; keep the checkbox row and "Add a computer" unchanged. Multi-computer copy stays as is.
- DNA: DNA-V6 ("we" is allowed in onboarding), DNA-P2.
- Effort: XS
- Risk: Area 24 may restructure the step; this keeps the structure.
- Upstream-eligible: no (flow copy; maintainers decide).
- #24865: not addressed.

### F-10-17 A link to a thread that no longer exists silently becomes a draft in an unrelated project

- Severity: P2
- Surface: all
- Evidence: Opened `/<env>/mcp:00000000-0000-4000-8000-000000000000` and `/draft/00000000-0000-4000-8000-000000000000`: both ended on `/draft/<new id>` for `probe/settings-probe`, the most recently updated project, with no message ([S]thread-not-found-light-1440x900.png, [S]draft-not-found-light-1440x900.png). `components/ThreadRouteView.tsx:154-160` (`renderState === "missing"`) and `:143-148` (unknown draft) call `navigate({ to: "/", replace: true })`; `IndexDraftLanding` does the rest.
- Current: A deleted thread, a link from another machine, or a thread on a disconnected computer all look like "the app lost my thread and gave me an empty one".
- Proposed: Before the redirect at `:158`, `toastManager.add({ type: "info", title: "Could not open thread", description: "It was deleted, or it is on a computer that is not connected. Opened a new thread instead." })`, once per route key (a ref set). Title follows DNA-V4; no apology.
- DNA: DNA-V3, DNA-P3.
- Effort: XS
- Risk: A thread that is merely not yet loaded must not toast: the effect is already gated on `bootstrapComplete` and `renderState === "missing"` (`:150-153`). No test; add one for a deleted thread.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-18 Sidebar zero states: 2.27:1 text in light, no action on "No threads in X yet"

- Severity: P2
- Surface: web, desktop
- Evidence: `Sidebar.tsx:3243` `<div className="flex flex-col items-center gap-2 px-2 py-6 text-center text-xs text-muted-foreground/60">`. Measured: 2.27:1 light on `#fafafa`, 3.44:1 dark on `#000` (12 px text; floor is 4.5, DNA-C5). The neighbour "No threads found" (`:2932`) uses `text-sidebar-muted-foreground` and measures 4.62:1 / 8.33:1. "No projects yet" gets an outline `Add project` button (`:3247-3256`); "No threads in {project} yet" and "No threads yet" get nothing ([S]sidebar-zero-threads-scoped-light-1440x900.png). The always-present `Settled (0)` header (`:3168-3181`, marker added unconditionally at `:1742`) sits under an empty list; the Snoozed header is hidden at zero (`:1738-1741`).
- Current: The first thing a person scoped to a new project sees is a faint sentence and nothing to press.
- Proposed: Replace `text-muted-foreground/60` with `text-sidebar-muted-foreground` on the container. For `scopedProjectGroup`, add the same bordered button pattern used for "Add project" (`inline-flex … rounded-md border border-sidebar-border px-2.5 py-1 text-2xs font-medium text-sidebar-muted-foreground hover:bg-sidebar-row-hover hover:text-sidebar-foreground`) labelled "New thread", calling the header compose handler for that project. Extract the class string into one `SidebarEmptyAction` to avoid a second copy.
- DNA: DNA-C4, DNA-C5, DNA-P7.
- Effort: S
- Risk: Collides with #24865's `Sidebar.tsx` shelf hunks only nearby; no overlap with these lines. No test.
- Upstream-eligible: no until #24865 lands (touches `Sidebar.tsx`), then yes.
- #24865: not addressed.

### F-10-19 Diff panel empty states are five hand-rolled 12 px lines at 2.73:1, with jargon copy and no action on non-Git

- Severity: P2
- Surface: web, desktop
- Evidence: `DiffPanel.tsx:970-1021`: "Select a thread to inspect turn diffs.", "Turn diffs are unavailable because this project is not a git repository.", "No completed turns yet.", `fileAccess.error ?? "This connection cannot read local diffs."`, and "No net changes in this selection." / "No patch available for this selection." Each is `<div className="flex … items-center justify-center … text-xs text-muted-foreground/70">`. Measured on a clean Git thread: 2.73:1 light, 3.05:1 dark ([S]diff-empty-light-1440x900.png, [S]diff-empty-dark-1440x900.png). "Net changes in this selection" is internal vocabulary (the user sees a scope menu labelled "Changes"). The non-Git message has no action although `GitActionsControl` already owns `useVcsInitAction`; the launcher row says "Diff: Available for Git repositories." (`RightPanelTabs.tsx:185`) and nothing offers to change that.
- Current: A new user opens Diff on their first thread and reads a grey sentence in a 540 px panel.
- Proposed: Replace the five blocks with `Empty size="inline" role="status"` (F-10-25) and this copy. No thread: title "No thread selected", description "Select a thread to see what its turns changed." Non-Git: title "No Git repository", description "Diffs and checkpoints need Git. Initialize Git to track what the agent changes.", with `Button size="sm" variant="outline"` "Initialize Git" (reuse `useVcsInitAction`). No completed turns: "No completed turns yet" / "Changes appear here after the agent finishes a turn." No changes: "No changes" / "The selected turns left the files as they were." Keep `fileAccess.error`.
- DNA: DNA-C4, DNA-V5, DNA-ID3 (one plain line, no illustration).
- Effort: S
- Risk: `DiffPanel` is shared with PR diff review (area 05); the empty blocks are guarded by branch, not by mode. Visual check needed in `inline` mode.
- Upstream-eligible: yes (after F-10-25's `size="inline"`).
- #24865: not addressed (details card only).

### F-10-20 A no-project (scratch) thread still shows "Add project script" and "Initialize Git"

- Severity: P2
- Surface: all web and desktop
- Evidence: `mod+alt+n` from a project draft, nothing sent: breadcrumb "No project / New thread", hero "What should we work on?", subline "No project", and the details card lists "MacBook Pro", "Open in VS Code", "Add project script", "Initialize Git" ([S]draft-no-project-light-1440x900.png, [S]draft-no-project-dark-1440x900.png). `docs/user/thread-sidebar.md` (digest) says branch, worktree and diff controls stay hidden; the card still renders `ProjectScriptsControl` and the VCS section. Causes: `ChatView.tsx:3801` `activeProjectScripts={activeProject ? activeProjectScripts : undefined}` and `:3815` `gitCwd={gitCwd}`; `ThreadDetailsPanel.tsx:142-157` and `:158-182` render both whenever those props are set. `activeProjectIsScratch` is already computed at `ChatView.tsx:1135`.
- Current: A scratch folder is offered a project script and a one-click `git init`, neither of which the feature intends.
- Proposed: At `ChatView.tsx:3801` pass `activeProject && !activeProjectIsScratch ? activeProjectScripts : undefined`; at `:3815` pass `gitCwd={activeProjectIsScratch ? null : gitCwd}` so the Version Control section (`ThreadDetailsPanel.tsx:158`) does not render.
- DNA: DNA-P2, DNA-P7 (the doc promises controls stay hidden).
- Effort: XS
- Risk: `ThreadDetailsPanel` tests; the OpenIn row stays. A scratch folder that a user did `git init` by hand is not detected as scratch-with-Git; that case is unaffected.
- Upstream-eligible: yes.
- #24865: not addressed (its `quietEmptyDraft` hunk is in `GitActionsControl.tsx` and applies only to Git repos).

### F-10-21 "Initialize Git" is a bare one-click row that says nothing about what it buys

- Severity: P2
- Surface: all
- Evidence: Non-Git project draft: the card shows only "MacBook Pro", "Open in VS Code", "Add project script", "Initialize Git" ([S]draft-empty-project-nongit-light-1440x900.png, [S]draft-empty-project-nongit-light-390x844.png). `GitActionsControl.tsx:1676-1690` renders the row with `onClick={initializeGit}` and no description or tooltip; the pending label is "Initializing..." (three dots). Checkpoints are "a hidden git ref" (`AGENTS.md`); without Git there is no diff and no restore, which the user is never told until the Diff panel (F-10-19).
- Current: A person on a plain folder gets a one-click command that writes `.git` and no reason to want it.
- Proposed: Wrap the row in `Tooltip` with `TooltipPopup side="left"`: "Adds a Git repository to this folder so T3 Code can show diffs and restore checkpoints." Keep one click (a confirm would add friction to a reversible action: DNA-P2). Change "Initializing..." to "Initializing…" at `:1637` and `:1684`.
- DNA: DNA-V5 (explain in place), DNA-V9.
- Effort: XS
- Risk: `GitActionsControl` is in #24865's diff (hunks at `@@ -1151` and `@@ -1684`); land after the PR.
- Upstream-eligible: no until #24865 lands.
- #24865: not addressed (it hides rows on empty Git drafts only).

### F-10-22 Pull Requests page blames the filters when the project has no Git remote

- Severity: P2
- Surface: web, desktop
- Evidence: `/pull-requests`, Filters → Project → `empty-project` (a non-Git folder): "Nothing under these filters / Widen the state, involvement or project filter to see more. / Check again" ([S]pull-requests-no-remote-light-1440x900.png, [S]pull-requests-no-remote-dark-1440x900.png). `PullRequestsPage.tsx:1138-1156` passes `filtered` true because `scopedProjectId` is set; `PullRequestListEmptyState.tsx:130-135` picks the copy. Projects expose `repositoryIdentity` (nullable, `packages/contracts/src/orchestrationProject.ts:12`), so the page can know. No code path mentions a missing remote or provider.
- Current: The advice ("widen the project filter") is the only thing that cannot help.
- Proposed: In `PullRequestsPage`, resolve the scoped project; when `scopedProject?.repositoryIdentity == null` pass `noRemoteProject={scopedProject.title}` to `PullRequestListEmptyState`, which renders title `{name} has no Git remote`, description "Pull requests come from a hosted repository. Add a remote with `git remote add origin <url>`, then check again.", buttons "Check again" (existing) and `Button variant="outline" size="sm" render={<Link to="/settings/source-control" />}` "Open Source Control". Verify that a Git repo with no remote (`sample-app`) also yields a null identity before relying on the field.
- DNA: DNA-V3, DNA-V5.
- Effort: S
- Risk: `repositoryIdentity` null may also mean "not resolved yet"; gate on a settled project snapshot. PR list tests cover filters, add the new branch.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-23 Usage empty states are plain lines with no action (code-read)

- Severity: P2
- Surface: web, desktop
- Evidence: `UsagePage.tsx:512-517` "Connect an environment to see usage." / "Select an environment to see usage."; `UsageLimitsPooled.tsx:619-623` "No provider on the selected environments reports subscription limits."; `UsagePage.tsx:938` and `:1027` "No activity in this window." in table cells. All are `<p className="text-sm text-muted-foreground">` or a centred `td`; no `Empty`, no link. This host has live data, so none was produced; the page capture was deleted (it shows private limits, see Incomplete).
- Current: Two dead ends and one honest cell.
- Proposed: `UsagePage.tsx:512`: `Empty size="compact"` titled "No environment connected", description "Connect a computer to see usage.", `Button size="sm" variant="outline" render={<Link to="/settings/connections" />}` "Open Connections" (the selected-but-empty variant keeps "Select an environment to see usage."). `UsageLimitsPooled.tsx:619`: title "No limits to show", description "None of the selected environments has a provider that reports subscription limits. Sign in to Codex or Claude Code in Settings → Providers.", button "Open Providers" to `/settings/providers`. Leave the two table cells.
- DNA: DNA-P7 (empty states point to the way in), DNA-V5.
- Effort: S
- Risk: Usage is a route modal; links must call `useNavigateToMainApp`-aware navigation (`mainAppLocation.ts`) so Back returns.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-24 Zero providers: the composer chip can be a disabled dead end; the Providers page shows bare text (code-read)

- Severity: P2
- Surface: web, desktop
- Evidence: `ComposerControlsBar.tsx:255-270`: `showProviderUnavailable` renders a `ComposerControl` that is `disabled={!providerSetupInstanceId}` and reads "No provider available" when no instance exists, with no way forward. Placeholder `ChatComposer.tsx:3794-3795` "Enable a provider in Settings to send a message"; the collapsed mobile row says "Ask anything..." (`:3620`, three dots). `ProviderSettingsPanel.tsx:1078-1082` shows "No providers configured." as `p-6 text-sm text-muted-foreground`; the "Add provider" row is in the other column (`:1060-1066`). Not producible here (Codex and Claude are installed).
- Current: When every provider instance is removed, the chip is disabled and the page says nothing about adding one.
- Proposed: (1) `ComposerControlsBar.tsx`: when `providerSetupInstanceId` is undefined, make the chip enabled, label "Add a provider", `onClick` → `navigate({ to: "/settings/providers" })` (via the existing `onOpenProviderSetup` plumbing, passing no instance). (2) `ProviderSettingsPanel.tsx:1078`: replace the line with `Empty size="compact"`, title "No providers configured", `Button size="sm"` "Add provider" opening `setIsAddInstanceDialogOpen(true)`. (3) `ChatComposer.tsx:3620`: "Ask anything…" (U+2026) or the shared placeholder constant.
- DNA: DNA-P7, DNA-V9.
- Effort: S
- Risk: `ChatComposer.tsx` and `composerPlaceholder.ts` are in #24865's diff; do (1) and (2) now, (3) after the PR.
- Upstream-eligible: yes for (1) and (2).
- #24865: partial (changes the placeholder constant, not this chip or page).

### F-10-25 26 of 41 inventoried empty states bypass the `Empty` primitive; add `size="inline"` and migrate the high-traffic ones

- Severity: P2
- Surface: all
- Evidence: Inventory table below: 15 of 41 use `Empty`; the 26 that do not include the highest-traffic ones (empty thread, sidebar zero states, search misses, diff panel, terminal, thread PRs, usage, recovery cards). Each hand-rolls a different text step: `/30` (empty timeline), `/50` and `/60` (NoActiveThread header), `/60` (sidebar), `/70` (diff), plain muted (palette, usage, providers). `Empty` itself has three sizes whose title sizes are 17 px (`compact`, `empty.tsx:6-7`), 20 px (`default`, `:92`) and 24/30 px (`hero`, `:9`), plus the wizard's 24 px h1 and the recovery card's 18 px h1 (`FirstRunGate.tsx:191`): six title sizes across first-run and empty surfaces (DRIFT-7).
- Current: The same state is drawn differently on each surface, usually in a text step that fails contrast.
- Proposed: Add `inline` to `emptySizeClassName` (`ui/empty.tsx:5-10`): `inline: "min-h-0 gap-1 p-4 [&_[data-slot=empty-media]]:mb-2 [&_[data-slot=empty-title]]:text-sm [&_[data-slot=empty-title]]:font-medium [&_[data-slot=empty-title]]:leading-5 [&_[data-slot=empty-description]]:text-xs [&_[data-slot=empty-description]]:leading-4"`. Title is `text-foreground`; description inherits `EmptyDescription`'s `text-muted-foreground` (4.71/5.08:1). Migrate, in order of traffic: `MessagesTimeline.tsx:1084-1088` (already muted after #24865), `DiffPanel.tsx` (F-10-19), `ThreadTerminalDrawer.tsx:1777`, `ThreadPullRequestsPanel.tsx:429-440` (it already hand-builds icon/title/description/button), sidebar zero states (F-10-18, keep `text-xs`), `CommandPaletteResults.tsx:35-45`, usage (F-10-23), recovery cards (F-10-05, `compact`).
- DNA: DNA-P4 (primitives own their look; a variant, not a className), DNA-C4, DNA-S1.
- Effort: M (primitive S; each migration XS; do them with the findings above, not as a sweep)
- Risk: `shadcn/no-restyle` lint enforces variant use; visual diff per surface. Browser tests that match text are unaffected.
- Upstream-eligible: yes for the primitive plus one migration at a time (one problem per PR).
- #24865: not addressed (`MessagesTimeline.tsx` hunk keeps a bare `<p>`).

### F-10-26 Import step heading changes between loading and loaded; the escape button is worded as a refusal

- Severity: P3
- Surface: web, desktop
- Evidence: Loading state `<h1>` "Your projects" (`WelcomeWizard.tsx:1404`) versus loaded `StepShell title="Import your projects"` (`:1422`). Scanning took under 150 ms here so the swap was not captured; code-read. Both states offer "Do not import projects" (`:1412-1414`, `:1507-1509`); in the loading state it calls `onDone()` and completes onboarding mid-scan.
- Current: The title text changes under the user's eyes on slow scans; "Do not" reads as a prohibition.
- Proposed: Render the loading state through `StepShell title="Import your projects"` with the spinner as children (the shell's description can stay); rename both buttons "Skip import" (DNA-V2). Keep the behaviour.
- DNA: DNA-V2, DNA-P3.
- Effort: XS
- Risk: `WelcomeWizard.import.browser.test.tsx` may match the old label; update.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-27 The two agent cards are different components with different content; "Ready" appears twice

- Severity: P3
- Surface: web, desktop
- Evidence: [S]welcome-2-agents-light-1440x900.png: Codex renders through `CodexSetupSection presentation="onboarding"` ("Signed in as {account}" + "Ready"), Claude through `AgentCard` ("Claude" + "Ready to code." + "Ready", `WelcomeWizard.tsx:974-985`). `AgentCard` shows `provider?.displayName || (driver === "claudeAgent" ? "Claude Code" : …)` so the instance name "Claude" wins over the "Claude Code" the step description uses (`:1423`) and the docs use. "Connect another ChatGPT account" is a `ghost-muted` `xs` button inset 8 px from the card edge, so at 390 px it reads as plain text ([S]welcome-2-agents-dark-390x844.png).
- Current: Two cards one beside the other that do not match, and the ready state is stated twice.
- Proposed: In `AgentCard`, when `providerState === "ready"` drop the left "Ready to code." line and show the account line if `provider.auth` has one (same data the Codex card shows); use `driver === "claudeAgent" ? "Claude Code"` before `provider?.displayName` (`:961-962`). Align the "Connect another ChatGPT account" button to the card edge (`-ml-2` removed, `px-0`) and use `variant="ghost"` so it keeps an affordance on touch.
- DNA: DNA-P2, DNA-V7.
- Effort: XS
- Risk: Cosmetic; no test.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-28 Step names disagree across chips, headings and docs; chip names vanish below 640 px

- Severity: P3
- Surface: web, desktop; docs
- Evidence: Chips "Connect / Agents / Projects" (`WelcomeWizard.tsx:107`), headings "Connect your computers / Connect your agents / Import your projects", docs heading "Check your agents" (`docs/user/welcome-wizard.md:48`; the digest and this brief use it too). Step 2 does not connect anything; it checks, installs and signs in. Below 640 px `WizardSteps` hides every label (`ui/wizard.tsx:119` `max-sm:hidden`) and leaves "1 2 3" circles, names only in `aria-label` ([S]welcome-1-connect-light-390x844.png).
- Current: Four names for three steps, none visible on a phone.
- Proposed: Chips "Computers / Agents / Projects"; headings "Connect your computers / Set up your agents / Import your projects"; docs heading "Set up your agents". Show the current step's label on mobile: `ui/wizard.tsx:119` class `max-sm:hidden` → `index !== currentStep && "max-sm:hidden"` (the chips are `auto-cols-fr`, about 100 px each at 358 px).
- DNA: DNA-V7 (do not coin synonyms), DNA-P2.
- Effort: XS
- Risk: `WizardSteps` is shared; the change only reveals the current label on mobile. Update `docs/user/welcome-wizard.md`.
- Upstream-eligible: yes for the mobile-label fix; the renames touch strings #24865-adjacent PRs (`extoci`'s copy PRs) also edit, so coordinate wording.
- #24865: not addressed.

### F-10-29 `NoActiveThreadState` is unreachable in every state I could produce and carries /50 and /60 text

- Severity: P3
- Surface: web, desktop
- Evidence: Rendered only from `ChatView.tsx:3077` when `activeThread` is falsy. A missing server thread redirects first (`ThreadRouteView.tsx:154-160`, F-10-17) and an unknown draft redirects (`:143-148`); neither produced the card in 6 attempts. Its header uses `text-xs text-muted-foreground/50` on Electron and `md:text-muted-foreground/60` on web (`NoActiveThreadState.tsx:12,15`), i.e. 1.95:1 and 2.28:1; the copy "Pick a thread to continue" has no action.
- Current: Dead or one-frame UI with sub-floor contrast.
- Proposed: Delete the component and have `ChatView.tsx:3077` return `null` (the route already guards both cases). If the maintainers prefer to keep it, change both header classes to `text-muted-foreground`, add `Button size="sm"` "New thread", and use `Empty size="compact"`.
- DNA: DNA-P2 (do not keep machinery), DNA-C4.
- Effort: XS
- Risk: `ChatView` tests that render without a thread; check before deleting.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-30 An unbroken 210-character project name overflows the sidebar empty message

- Severity: P3
- Surface: web, desktop
- Evidence: Project renamed to `Z` x 210, sidebar scoped to it: message `scrollWidth` 953 against `clientWidth` 239, clipped at the sidebar edge ([S]sidebar-zero-threads-longname-light-1440x900.png). A hyphenated 210-char name wrapped correctly; the draft hero truncates with an ellipsis ([S]draft-longname-long-light-1440x900.png); RTL, Han and emoji names render correctly ([S]draft-rtl-emoji-name-light-1440x900.png).
- Current: Only the no-space case breaks; rare, but names are user data.
- Proposed: Add `wrap-anywhere` (Tailwind `overflow-wrap:anywhere`, already used in `ui/dialog.tsx:173`) to the container at `Sidebar.tsx:3243`.
- DNA: DNA-T9 (truncate in rows, wrap in prose).
- Effort: XS
- Risk: none.
- Upstream-eligible: no until #24865 lands (file), then yes.
- #24865: not addressed.

### F-10-31 Pull request empty states carry an illustration drawn with four opacity steps

- Severity: P3
- Surface: web, desktop
- Evidence: `PullRequestListEmptyState.tsx:9-46` draws `BranchMark`, a 128x80 px SVG using `text-muted-foreground/60`, `/30`, `/50` and `/45` and a dashed path, in three of its four variants ([S]pull-requests-no-remote-light-1440x900.png). DNA-ID3: "Where a product could add weight (… illustrated empty states), T3 Code removes it". The sibling `PullRequestsUnavailableState.tsx:23-25` uses the standard `EmptyMedia variant="icon"` with `PullRequestGlyph.pullRequest`. "Checking..." and "Loading..." use three dots (`:119,140,145`).
- Current: The only illustrated empty state in the app, and the only one outside the token system.
- Proposed: Delete `BranchMark` and use `<EmptyMedia variant="icon"><PullRequestGlyph.pullRequest /></EmptyMedia>` as the sibling does; use "Checking…" and "Loading…".
- DNA: DNA-ID3, DNA-C4, DNA-V9.
- Effort: XS
- Risk: Visual change on the PR page; PR list tests are logic-level.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-32 Empty archive says nothing about how a thread gets archived

- Severity: P3
- Surface: web, desktop
- Evidence: [S]archive-empty-light-1440x900.png (scoped to a project with none): "No archived threads / Archived threads will appear here." (`settings/ArchivedThreadsPanel.tsx:176-197`), a `SettingsRow` (not `Empty`). The description restates the title.
- Current: A tautology where one clause of instruction would fit.
- Proposed: description → "Archive a thread from its actions menu to move it here. Unarchive brings it back." (names the reverse, DNA-P7/V8).
- DNA: DNA-V5, DNA-V8.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes.
- #24865: not addressed (it touches settings labels elsewhere).

### F-10-33 Hosted empty state: product name at /60 in the header (code-read)

- Severity: P3
- Surface: web (app.t3.codes only; not reachable on this host)
- Evidence: `HostedEmptyState.tsx:30` `<span className="text-sm font-medium text-foreground md:text-muted-foreground/60">` renders the name at 2.28:1 on md and up (same ladder as F-10-29). The body is otherwise sound (`Empty` + `EmptyContent`, numbered steps, `CommandBlock`). "Or download the desktop app" is a `text-xs` underlined link under the command (`:153-161`), the lowest-emphasis element although it is the path that needs no terminal. Cloud-config variants (T3 Connect sign-in, discovery rows) could not be rendered; area 11 owns them.
- Current: The header title fades while the page has no other label.
- Proposed: `text-foreground` only (drop `md:text-muted-foreground/60`). Leave the link hierarchy for area 24.
- DNA: DNA-C4.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-10-34 `Empty` primitive: title is a `div`, media spacing differs by placement, `PreviewEmptyState` skips the header

- Severity: P3
- Surface: all
- Evidence: `ui/empty.tsx:90-94` `EmptyTitle` renders `<div>`; `:96-107` `EmptyDescription` is typed `ComponentProps<"p">` but renders `<div>`; `Empty` has no role. `EmptyMedia` carries `mb-6` (`:62`) and `Empty` has `gap-6`: media as a direct child of `Empty` (PR unavailable, Providers placeholder, `PreviewEmptyState`) sits 48 px above the title, inside `EmptyHeader` (Scheduled tasks `:389-398`, Source control `:481-486`) 24 px. `PreviewEmptyState.tsx:36-45` puts `EmptyTitle` and `EmptyDescription` directly under `Empty`, so they are 24 px apart instead of the header's `mt-1` pairing. Computed from classes; not measured.
- Current: Same primitive, different rhythm and no heading semantics.
- Proposed: `EmptyTitle` → `<h2>` (`ComponentProps<"h2">`, same classes); `EmptyDescription` typed `div`; change `EmptyMedia` base to `relative [[data-slot=empty-header]_&]:mb-6` so only the in-header case adds margin and the parent gap handles the rest; wrap the `PreviewEmptyState` title and description in `EmptyHeader`.
- DNA: DNA-P4, DNA-P6 (compose slots), accessibility.
- Effort: S
- Risk: Every `Empty` user shifts by up to 24 px; capture all 15 before and after. Heading level change affects outline only.
- Upstream-eligible: yes, as a primitive-only PR.
- #24865: not addressed.

### F-10-35 One thing, three names in first-run and empty strings: computer, environment, machine

- Severity: P3
- Surface: all
- Evidence: Wizard and hosted page say "computer" (`WelcomeWizard.tsx:334-337,1423`, `HostedEmptyState.tsx:39`); Usage and Scheduled tasks say "environment" (`UsagePage.tsx:514`, `ScheduledTasksSettings.tsx:402-406` "No environments available / Connect an environment…"); the add-project dialog says "machine" (`AddProjectToMachineDialog.tsx:227` "This machine", `:276` "No machine available", `:304`, `:380`). DNA's vocabulary table has no "machine" (DNA-V7, DRIFT-19).
- Current: A user connects a "computer" in setup and later reads "No machine available".
- Proposed: Replace "machine" with "computer" in the five dialog strings. Leave "environment" in Settings and Usage (technical surfaces) but give their empty states the link (F-10-23).
- DNA: DNA-V7.
- Effort: XS
- Risk: Tests that match "machine" strings; grep before editing.
- Upstream-eligible: yes.
- #24865: not addressed (it relabels usage-limit strings only).

### F-10-36 Voice slips: three-dot ellipses and one contraction in first-run and empty-state strings

- Severity: P3
- Surface: all
- Evidence: Three ASCII dots (DNA-V9 wants U+2026) in the same files that already use "…": `WelcomeWizard.tsx:632` "Pairing...", `:987` "Checking...", `:1124` "Preparing command..." (versus `:499,503,1408,1471,1516` with "…"); `PullRequestListEmptyState.tsx:119,140,145`; `DiffPanel.tsx:985,1010-1013`; `GitActionsControl.tsx:1637,1684`; `NewThreadLinkView.tsx:336,418`; `ChatComposer.tsx:3620`. Contraction in a title: `routes/_chat.index.tsx:93` "Couldn’t start a new thread" (curly apostrophe; DNA-V4: no contractions in titles, "Could not …"). The description beside it is good ("The project is still available. Try opening the draft again.").
- Current: Two glyph conventions for one ellipsis and one title that breaks the error pattern.
- Proposed: Replace each with "…" and change the title to "Could not start a new thread". Mechanical; one PR.
- DNA: DNA-V4, DNA-V9, DRIFT-14.
- Effort: XS
- Risk: Browser tests that match strings (grep each before editing).
- Upstream-eligible: yes.
- #24865: not addressed (`GitActionsControl.tsx` and `ChatComposer.tsx` are in its diff: land those lines after it).

### F-10-37 Nothing surfaces existing features or release notes after install or update

- Severity: P3 (nice-to-have; weigh against DNA-P2 before building)
- Surface: web, desktop
- Evidence: After a successful update the next launch shows nothing. Release notes are linked from the update toast and the nightly sidebar pill (`desktopUpdate.toast.tsx:12-58`, `sidebar/SidebarUpdateReleaseNotes.tsx`) before the update, and the "Update did not apply" toast after a failed one (`updateEverythingRun.tsx:324-331`). Discoverability asks #14404 (context usage hidden behind an opt-in) and #15984 (`/context` does nothing in Claude threads) are not answered by any first-run or update surface; the wizard ends at project import.
- Current: Features arrive silently.
- Proposed: Do not add a tour or a toast. One low-cost option: a "Release notes" link row under Settings → General → About reusing `openDesktopUpdateReleaseNotes` for the running version. Anything larger is area 24's.
- DNA: DNA-P2 (do not add chrome to look thorough).
- Effort: XS
- Risk: none.
- Upstream-eligible: no (feature request; belongs in an Ideas discussion).
- #24865: not addressed.

## Inventory of empty and first-run states

"Empty?" = renders through `components/ui/empty.tsx`. Counts: 15 use it, 26 do not (two of those have no UI at all).

| #   | State                              | Component (file:line)                                                     | Empty?                         | Action?                                              | Copy                                                                   |
| --- | ---------------------------------- | ------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------- |
| 1   | Gate pending (up to 4 s)           | `FirstRunGate.tsx:174-176` returns `null`                                 | no UI                          | none                                                 | (blank)                                                                |
| 2   | Gate stalled                       | `FirstRunRecovery` (`:180-218`)                                           | no                             | Reload                                               | "Still connecting" / "T3 Code could not confirm this workspace."       |
| 3   | Settings unreadable                | `FirstRunRecovery`                                                        | no                             | Retry (loops)                                        | "Could not read settings" / "Your saved settings could not be loaded." |
| 4   | Wizard: T3 Connect, nothing linked | `ConnectAccountOption` (`WelcomeWizard.tsx:522`)                          | no                             | command block below                                  | "No computers linked yet."                                             |
| 5   | Wizard: no terminal scope          | `ConnectedAgentsStep:750-754`                                             | no                             | none                                                 | "This connection cannot control terminals."                            |
| 6   | Wizard: import scanning            | `ImportStep:1401-1418`                                                    | no                             | "Do not import projects"                             | "Looking for projects from Claude Code and Codex…"                     |
| 7   | Wizard: import found nothing       | `ImportStep:1483-1487`                                                    | no                             | disabled primary + refusal                           | "No existing Claude Code or Codex projects found."                     |
| 8   | Wizard: scan failed                | `ImportStep:1473-1482`                                                    | no                             | Retry                                                | "Could not check projects. {error}"                                    |
| 9   | Zero projects (main pane)          | `NoProjectsHero.tsx:22-49`                                                | yes (hero)                     | Add project, Start without a project                 | "What should we work on?" / "Add a project, or start without one."     |
| 10  | Zero projects (sidebar)            | `Sidebar.tsx:3246-3257`                                                   | no                             | Add project                                          | "No projects yet"                                                      |
| 11  | Zero threads in scoped project     | `Sidebar.tsx:3257`                                                        | no                             | none                                                 | "No threads in {name} yet"                                             |
| 12  | Zero threads overall               | `Sidebar.tsx:3260`                                                        | no                             | none                                                 | "No threads yet"                                                       |
| 13  | Sidebar search miss                | `Sidebar.tsx:2932`                                                        | no                             | none                                                 | "No threads found"                                                     |
| 14  | Palette miss                       | `CommandPaletteResults.tsx:35-45`                                         | no                             | none                                                 | "No matching commands, projects, or threads."                          |
| 15  | New draft in a project             | `DraftHeroHeadline.tsx:342-360`                                           | no                             | "or start without a project"                         | "What should we build in {project}?"                                   |
| 16  | New draft, no project              | `DraftHeroHeadline.tsx:347-350`                                           | no                             | project picker                                       | "What should we work on?" / "No project"                               |
| 17  | Server thread with no messages     | `MessagesTimeline.tsx:1084-1088`                                          | no                             | none                                                 | "Send a message to start the conversation."                            |
| 18  | Non-Git project                    | `GitActionsControl.tsx:1676-1690`                                         | no                             | Initialize Git                                       | (row only)                                                             |
| 19  | Thread/draft not found             | `ThreadRouteView.tsx:143-160`                                             | no UI                          | none (silent redirect)                               | (none)                                                                 |
| 20  | No active thread                   | `NoActiveThreadState.tsx`                                                 | yes                            | none                                                 | "Pick a thread to continue"                                            |
| 21  | Draft failed to start              | `_chat.index.tsx:87-107`                                                  | yes                            | Try again                                            | "Couldn’t start a new thread"                                          |
| 22  | `/new` bad link                    | `_chat.new.tsx:11-22`                                                     | yes                            | none                                                 | "Could not open the link" / "This link has no prompt."                 |
| 23  | Prompt-link states                 | `NewThreadLinkView.tsx` `LinkPage`                                        | yes                            | per state                                            | "Opening the link..." etc.                                             |
| 24  | Hosted, no computer                | `HostedEmptyState.tsx:36-60`                                              | yes                            | Sign in / command / Open Connections                 | "No computer connected" / "This computer is off"                       |
| 25  | Right panel launcher               | `RightPanelTabs.tsx:296-`                                                 | no                             | seven surface rows                                   | "Open a surface"                                                       |
| 26  | Diff panel (5 variants)            | `DiffPanel.tsx:970-1021`                                                  | no                             | none                                                 | "No net changes in this selection." etc.                               |
| 27  | Terminal, no sessions              | `ThreadTerminalDrawer.tsx:1777-1788`                                      | no                             | New terminal                                         | "No terminal sessions for this thread yet."                            |
| 28  | Browser, no preview                | `PreviewEmptyState.tsx:36-47`                                             | yes                            | none                                                 | "No preview yet"                                                       |
| 29  | PR list (4 variants)               | `PullRequestListEmptyState.tsx:71-149`                                    | yes                            | Add project / Clear search / Check again / Load more | "No pull requests", "Nothing under these filters", …                   |
| 30  | PR list unavailable                | `PullRequestsUnavailableState.tsx`                                        | yes                            | Retry / Open host                                    | "Could not load pull requests"                                         |
| 31  | PR diff unavailable                | `PullRequestDiffUnavailableState.tsx:30`                                  | yes (compact, `role="status"`) | Try again / Open on host                             | provider-specific                                                      |
| 32  | Thread PRs, none linked            | `ThreadPullRequestsPanel.tsx:429-440`                                     | no                             | Link pull request                                    | "No linked pull requests"                                              |
| 33  | Usage (3 states)                   | `UsagePage.tsx:512,938,1027`; `UsageLimitsPooled.tsx:619`                 | no                             | none                                                 | "Connect an environment to see usage." etc.                            |
| 34  | Archive, none                      | `ArchivedThreadsPanel.tsx:176-197`                                        | no (`SettingsRow`)             | none                                                 | "No archived threads"                                                  |
| 35  | Providers, none configured         | `ProviderSettingsPanel.tsx:1078-1082`                                     | no                             | none                                                 | "No providers configured."                                             |
| 36  | Providers, unavailable/loading     | `ProviderSettingsPlaceholder`                                             | yes                            | none                                                 | "Provider settings are unavailable"                                    |
| 37  | Composer, no provider              | `ComposerControlsBar.tsx:255-270`                                         | no                             | "Open provider settings" or dead chip                | "Enable a provider in Settings to send a message"                      |
| 38  | Saved remote environments, none    | `SavedEnvironmentRows.tsx:699-713`                                        | yes                            | none                                                 | "No saved remote environments"                                         |
| 39  | Scheduled tasks, no environment    | `ScheduledTasksSettings.tsx:393-405`                                      | yes                            | none                                                 | "No environments available"                                            |
| 40  | Source control, nothing detected   | `SourceControlSettings.tsx:480-503`                                       | yes                            | Scan                                                 | "Nothing detected yet"                                                 |
| 41  | Clerk profile pages                | `MobileClientsUserProfilePage.tsx:90`, `T3ConnectUserProfilePage.tsx:237` | yes (compact)                  | none                                                 | account-specific                                                       |

Not rows: Settled and Snoozed shelves. The Settled header is always present (`Sidebar.tsx:1742`, collapsed label "Settled (0)", with #24865 "Settled" plus a muted count) and Snoozed appears only above zero; the zero case is drag-time placeholders (`SidebarListMarkers.tsx:41-64`) and is by design.

## Edge-case results (matrix)

Data

- Empty: FAIL for the findings above; PASS for `NoProjectsHero` and the DraftStartError card.
- One item: wizard with one computer: FAIL (F-10-16).
- 100+ items: wizard import list with 19 candidates (7 rows, 12 under "Other folders") scrolls cleanly; 100+ candidates NOT TESTED (host has 19). Sidebar and palette zero states N/A.
- 10,000+: N/A (empty states).
- Very long names: 210-character project name: draft hero PASS (truncates), breadcrumb PASS (truncates), sidebar zero message FAIL when unbroken (F-10-30, hyphenated PASS); wizard rows at 390 FAIL (F-10-14). Wizard computer label uses `break-words` and URL `break-all` (code-read PASS).
- Unicode and emoji, RTL: PASS ([S]draft-rtl-emoji-name-light-1440x900.png).
- Leading or trailing whitespace, whitespace-only: the title contract rejects a whitespace-only project title (CLI rename failed validation); N/A for the UI.

Content: N/A except "very long single-line strings without spaces" (F-10-30).

Network and agents

- Provider not installed or logged out: wizard Install/Sign in NOT TESTED live (both agents ready), code-read F-10-15; composer provider-unavailable code-read F-10-24.
- Auth expired mid-session, stream states, permission prompt, two or six threads streaming: N/A (not empty states).
- Relay disconnected / server unreachable at start: FAIL (F-10-06, F-10-09), reproduced by swallowing the WebSocket.
- Reconnect after sleep, server restarted under the client: NOT TESTED (shared server).
- Version mismatch: wizard "Client not supported" row is code-read only (`WelcomeWizard.tsx:373`, message from `connection.error`).

Git

- No repo: FAIL (F-10-19, F-10-21, F-10-22) with a plain folder; scratch folder FAIL (F-10-20).
- Repo with uncommitted changes, detached HEAD, worktree failure, push rejected, merge conflict, branch collision: N/A (areas 05 and 13).
- No GitHub auth when creating a PR: NOT TESTED; first-PR landing is code-read only and belongs to areas 05 and 11.

Viewport

- 1440x900: PASS except where noted. 1280x720: NOT TESTED (covered by 1024 and 800). 1024x640: wizard step 3 PASS by 6 px. 800x600: FAIL (F-10-12). 3440x1440: PASS ([S]welcome-3-import-masked-light-3440x1440.png, dialog fixed 768 px, centred). 390x844: wizard all three steps, `/new`, hero and draft captured; FAIL (F-10-14, F-10-28). 390 with the keyboard open: NOT TESTED (Playwright cannot raise the soft keyboard).
- OS zoom 80/125/150: NOT TESTED. Browser zoom 200%: emulated with a 720x450 viewport, FAIL (F-10-12); 50% NOT TESTED.

Preferences

- Light and dark: all states captured in both; PASS except the contrast findings.
- System switching live, every named theme, high contrast, font-size overrides: NOT TESTED (areas 07 and 16).
- Reduced motion: PASS (code-read: `AnimatedHeight` uses `motion-reduce:transition-none`, `components/AnimatedHeight.tsx:82`).
- Keyboard only: FAIL (F-10-10, F-10-11); the wizard otherwise traps and cycles focus correctly (checkbox is tabbable; reachable with Shift+Tab).
- Screen reader: NOT TESTED (no SR). ARIA read from code: progress `ol aria-label="Setup progress"` with `aria-current="step"`, `fieldset`/`legend` sr-only, import count `role="status"`, scan error `role="alert"`; `Empty` carries no role (F-10-34).

Lifecycle

- First ever launch: SIMULATED. Desktop path (zero projects) reaches the wizard by design; web-mode path FAIL (F-10-01).
- Launch after update: PASS by code-read (`resolveFirstRunDecision` returns `app` when completed); nothing new is shown (F-10-37).
- Launch with corrupted settings: FAIL (F-10-06, cites F-07-13).
- Launch while a server is already running, app backgrounded, window minimised, OS sleep: N/A or NOT TESTED (no empty-state behaviour).

Wave-1 leads

- `/new` with no prompt: CONFIRMED (F-10-04).
- `/` lands on an old pinned thread: CONFIRMED, 6/6; cause identified (F-10-03).

## Already good (do not touch)

- `NoProjectsHero`: one question ("What should we work on?"), one primary (`Add project`), one outline (`Start without a project`), correct sizes (30/36 px title, 14 px description, 28 px buttons) and a desktop titlebar strip. Keep the structure; only add the import hint (F-10-02).
- The gate's evidence model (`firstRun.logic.ts`): it never shows the wizard to a returning user on partial data, never replaces unreadable settings with defaults, and only persists completion on authoritative evidence. The 4 s stall timer is the right idea; only its surface needs work.
- Wizard keyboard and ARIA basics: Continue/Import carry `autoFocus` on steps 2 and 3, `role="status"` on "N of M selected", `role="alert"` on scan errors, `fieldset` + `legend` for computers, IME-safe Enter in the pairing input, `aria-invalid` and `aria-describedby` on pairing errors.
- Wizard copy that already meets the voice: "Not connected, so setup skips {names}. You can set them up later from Settings." and the description lines under each step.
- The draft hero handles 210-character, RTL, CJK and emoji project names without overflow ([S]draft-longname-long-light-1440x900.png).
- `PullRequestDiffUnavailableState` (Empty compact, `role="status"`, primary retry plus host link, collapsed technical details) is the reference for an error empty state.
- Search misses: "No threads found" (4.62:1 / 8.33:1) and the palette line say plainly what happened; keep them and only move the palette line onto `Empty` when the primitive has `inline`.
- `DraftStartError` description ("The project is still available. Try opening the draft again.") and its retry button.
- The scoped sidebar message names the scope ("No threads in {name} yet"); only its colour and missing action need fixing.
- Light and dark of every first-run surface use tokens, not raw hues (no DNA-C14 violations found).

## Incomplete

- No true zero-project or fresh-install state: the shared dev server cannot be emptied. `NoProjectsHero` was captured from `/welcome` with the dialog and sidebar hidden; the sidebar "No projects yet" row, the Agents step with a missing or signed-out agent, the Import step with zero candidates or a scan error, the "Client not supported" row and the cloud (T3 Connect) variants of step 1 are code-read only. The dev build has no cloud public config, so `ConnectAccountOption` never rendered.
- `HostedEmptyState` is reachable only on a hosted-static build; code-read.
- Usage empty states, the terminal "No terminal sessions" state and the first-PR landing were not produced: this host has usage data, a terminal opened and exited with the thread closed it, and no PR was created. Code-read only.
- `ChatGptWelcomeCoordinator` is mounted inside the wizard dialog (`WelcomeWizard.tsx:288`) and would open a second modal on top when a ChatGPT-sharing Codex account is detected; this host's Codex account did not trigger it. NOT TESTED.
- Electron was not driven (area 14); F-10-05 is a code-read of `DesktopWindow.ts` and `.drag-region`.
- Mobile app first run is area 15's; not covered.
- One main-pane capture after scoping the sidebar to a long-named project showed a blank pane; three retries (including the same sequence) did not reproduce it, so it is not reported.
- Captures withheld or deleted for privacy: an unmasked import-step frame (twice; real directory names), a terminal capture (shell prompt showed the local username), the Usage page (provider limits and spend), and three Pull Requests list frames (third-party GitHub handles and avatars). Provider account names on the Agents step are replaced with `user@example.com` and rendered blurred by the app.
- Side effects: two throwaway projects (`empty-project`, `clean-git`, with one tiny Claude Haiku turn replying "OK") were created and removed with `project remove`; the temp folders are deleted. A "No project" scratch project and `/tmp/t3code-overhaul/scratch` already existed before this run (created 13:42, before area 10 started), so they were left in place. My session cookie was invalidated by another area for about 10 minutes mid-run and later restored; I did not re-pair. All `localStorage` writes (including `onboardingCompletedAt`) happened in disposable contexts.

## Needs deeper look

- Area 01 / 03: `EventRouter` bootstrap navigation versus `IndexDraftLanding` (F-10-03) and the brand-link behaviour in F-01-18 share a cause; fix them together.
- Area 01 / 06: the right-panel launcher shows the reason a surface is unavailable only in a `DisabledReasonTooltip` (hover or focus); there is no touch path (`RightPanelTabs.tsx:510`).
- Area 09: `ChatGptWelcomeCoordinator` stacking a modal over the wizard on the Agents step (see Incomplete).
- Area 11: `HostedEmptyState` cloud variants; "first remote pairing landing" (after `onPaired`, the wizard keeps the selection but no project exists on the new computer; `NoProjectsHero` then says "Add a project to start your first thread." with only `Add project` when no scratch root is available).
- Area 14: confirm F-10-05 in Electron on macOS and Windows.
- Area 24: F-10-16 is a copy-only patch; a real single-computer fast path, a "What can I do here" step and a re-entry design belong to the redesign.
- Orchestrator: the F-10-01 server dependency changes first-run behaviour for every `npx t3` user; confirm intent with the maintainers before it ships.
