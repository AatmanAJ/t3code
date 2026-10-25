# Area 24: onboarding gap

Audit of what a first-run flow must teach and how far T3 Code is from it (repo `5f64c5eb`, owner PR #24865 read from `prior-art/pr-24865.diff`). Findings use the prefix `F-24-`. Wireframes for the proposed flow are in `ui-overhaul/spec/onboarding/01..08-*.md`.

Method. Area 10 already audited the wizard and the gate (F-10-01..37); this file cross-references those ids and does not repeat them. I read `components/onboarding/*`, `onboarding/*`, `routes/welcome.tsx`, `NoProjectsHero`, `HostedEmptyState`, `DraftHeroHeadline`, `runtimeModeConfig`, the mobile Home/connection/cloud-onboarding code, the docs digest, areas 09, 10, 11, 15, and the prior-art lists. No new captures were taken (a true first launch cannot be produced on the shared dev server, see area 10 "Incomplete"); every capture cited below already exists. Captures withheld: none new. Time figures are keystroke-level estimates from the code path, labelled as such, not measurements.

Screenshot prefixes: `[W]` = `screens/10-first-run-and-empty-states/10-first-run-and-empty-states-`, `[M]` = `screens/15-mobile/15-mobile-`, `[P]` = `screens/09-providers-and-auth/09-`, `[B]` = `screens/baseline/`.

## Summary

| ID      | Sev | Title                                                                                                                                   | #24865        |
| ------- | --- | --------------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| F-24-01 | P1  | Mobile first launch never says a computer must be running T3 Code; the T3 Connect sheet says "No additional linked cloud environments." | not addressed |
| F-24-02 | P1  | Mobile "No projects found" is a dead end although an Add project route exists                                                           | not addressed |
| F-24-03 | P1  | The agents step knows two of eight providers; a user of any other agent sees two Install buttons and no way forward                     | not addressed |
| F-24-04 | P1  | New threads default to Full access and first run never says so                                                                          | not addressed |
| F-24-05 | P1  | No entry point leads to the wizard's agents step when a provider is missing, though `/welcome#agents:<id>` already opens it             | partial       |
| F-24-06 | P2  | Step 1 asks a single-computer user to confirm the only computer; a 2-step flow is enough                                                | not addressed |
| F-24-07 | P2  | Agent status is a one-shot snapshot with no "Check again"; a stale login-shell PATH keeps "Install" showing after install               | not addressed |
| F-24-08 | P2  | The wizard cannot pick a folder; a user with no Claude or Codex history leaves setup with nothing and is asked again                    | not addressed |
| F-24-09 | P2  | Import blocks the dialog with a bare "Importing…" and no count; it is the longest unbounded wait before the first message               | not addressed |
| F-24-10 | P2  | No skip-everything path that respects keyboard and power users: no Skip button, Escape ignored, Enter on the wrong control              | not addressed |
| F-24-11 | P2  | First-screen telemetry notice points to a privacy policy for opt-out; the real opt-out is an environment variable                       | not addressed |
| F-24-12 | P2  | The pairing explanation exists in three places in three voices; mobile says "environment", onboarding says "computer"                   | not addressed |
| F-24-13 | P3  | `/welcome` re-entry renders the zero-project hero under the dialog for users who have projects                                          | not addressed |
| F-24-14 | P3  | Nothing orients a new user to the keyboard; global shortcuts are tooltip-only                                                           | partial       |
| F-24-15 | P3  | First-prompt suggestions: do not build by default; gated option only                                                                    | not addressed |
| F-24-16 | P3  | Returning users after an update see nothing; no mechanism to know the last-seen version                                                 | not addressed |

Counts: P0 0, P1 5, P2 7, P3 4, total 16.

Worst three: F-24-03 (non-Claude/Codex users dead-end in step 2), F-24-01 + F-24-02 (mobile has no first run at all), F-24-04 (the safest-sounding step never mentions the unprompted-commands default).

## First-run journey map (current)

Reading key. Step numbers are what the user does; "Gate" is `FirstRunGate`; ids point to findings in this file (F-24) or area 10 (F-10) or area 09 (F-09). Times are keystroke-level estimates from the code path (read 5 s per screen, click 1.5 s, 12-word prompt 12 s, agent installer 20-90 s, OAuth round trip 30-90 s, import 2-10 s per project): useful for ranking, not measured, because a true first launch cannot be produced on the shared dev server.

### W1 Desktop (Electron), agent signed in, Claude Code or Codex history present: the happy path

1. Launch. Gate waits for authoritative evidence: blank page for 0.5 to 4 s (F-10-09), then replaces `/` with `/welcome`.
2. Step 1 "Connect your computers": one preselected, connected computer; "Add a computer"; telemetry paragraph; Continue. Focus starts on "Add a computer", so Enter opens the pairing form instead of continuing (F-10-10). Single-computer user reads a decision that is a no-op (F-10-16). `[W]welcome-1-connect-light-1440x900.png`.
3. Step 2 "Connect your agents": Codex and Claude cards, both Ready. Continue (autoFocus). `[W]welcome-2-agents-light-1440x900.png`. Permissions, other agents, "Check again": absent (F-24-03, F-24-04, F-24-07).
4. Step 3 "Import your projects": two repos preselected of 19. "Import 2 projects" runs sequentially, dialog locked, label "Importing…" with no count (F-24-09). `[W]welcome-3-import-masked-light-1440x900.png`.
5. Landing: a draft in the project with imported history (`resolveOnboardingLandingProject`), composer below "What should we build in {project}?". No keyboard orientation, no note that the chip says Full access (F-24-04, F-24-14).
6. Type, Enter. Estimated time to first sent message 40 to 75 s; three clicks plus the prompt. First reply 5 to 30 s later.

### W2 Desktop, agent ready, no history (new to coding agents)

Steps 1 to 2 as W1. Step 3: "No existing Claude Code or Codex projects found.", disabled "Import 0 projects", exit button worded "Do not import projects" (F-10-07). The X completes onboarding silently (F-10-11). Landing: `NoProjectsHero` (`[W]no-projects-hero-light-1440x900.png`): "Add project" opens the palette folder browser; "Start without a project" opens a scratch thread. The wizard offered no folder pick (F-24-08). Estimate 50 to 100 s, five clicks.

### W3 Desktop, no agent installed

Step 2 shows Install for both agents. Install opens a pre-typed terminal ("Review the command, then press Enter to run it."), the vendor installer runs, `onSessionExited` closes the drawer and refreshes. The card then reads Sign in: a second terminal and a browser OAuth. If the app's login-shell PATH is stale the probe still says Not found (#9429, #10728) and there is no "Check again" (F-24-07). Continue stays primary with zero ready agents (F-10-15). Estimate 2.5 to 6 min, seven or more clicks, the highest drop-off point in the product.

### W4 Web, `npx t3` or `t3` in a fresh base dir

The server never sends `bootstrapProjectCreated`, so the gate resolves to `app` and marks the user onboarded without showing setup (F-10-01). `/` then opens an arbitrary existing thread (F-10-03). With a ready provider the user types at once (10 to 20 s). With no provider the composer chip reads "No provider available", the send button says "Environment disconnected" and Enter does nothing (F-09-20, F-10-24); Providers shows "Not found" with no action (F-09-07). The user must leave the app, install in a terminal, return and reload: 5 min or more, no breadcrumb back.

### W5 Hosted app.t3.codes

No wizard (`docs/user/welcome-wizard.md`). `HostedEmptyState`: "No computer connected / Your agents run on your computer." and a two-step list: Sign in; run `npx t3 connect` on the computer (copyable `CommandBlock`). The computer appears under "Waiting for your computer…" and is auto-added once discovery settles (`HostedEmptyState.tsx:75-122`). The clearest pairing explainer in the product. Estimate 2 to 4 min when a host exists; a dead end when the person has only a browser.

### W6 Mobile (iOS and Android)

1. Install from the store. Launch: Home, "No environments connected / Add an environment to load projects and start coding sessions." and one button (`[M]home-no-environments-light-iphone17.png`). No statement that a computer must already run T3 Code.
2. "Add environment" sheet: scan card, Address and Code rows, "Sign in to T3 Connect" (`[M]connections-new-light-iphone17.png`). The caption "Scan the code from t3 pair or desktop Connections settings" assumes the CLI vocabulary.
3. Host side (docs `remote-access.md`): desktop Settings, Connections, Network access creates a pairing link and restarts the desktop app; or `t3 connect` plus T3 Connect sign-in on both devices. The phone cannot show this; nothing tells the person to go there.
4. After sign-in to T3 Connect with no computer linked: sheet "Set up T3 Connect" says "No additional linked cloud environments." (F-24-01).
5. Connected: Home lists the host's threads, or "No projects found" with no action (F-24-02). New task, type, send.
   Estimate 3 to 8 min when the host is already set up; unbounded when it is not. Known pairing drop-offs: iOS Local Network sheet stalls pairing (#5061), Android rejects formatted codes (#4889) and user CAs (#5639), remembered host:port goes stale (#19398).

### Drop-off ranking (where a new user is most likely to leave)

1. W3 and W4 without an agent: the install and sign-in path is the only unavoidable multi-minute wait and has no "Check again", no persistent breadcrumb and (on web) no wizard (F-24-05, F-24-07, F-10-01).
2. W6 before connecting: the phone explains nothing about the host (F-24-01).
3. Step 3 import wait: locked dialog, no count (F-24-09).
4. W2: nothing to import, the wizard has no way to add a folder (F-24-08).
5. Silent default of Full access (F-24-04): not a drop-off but a trust risk.

## Gap list: what a premium first run does, and what T3 Code has

"Premium" here means the common first-run pattern in coding-agent tools (detect, connect, point at code, first success, orient, return later). I did not inspect any named competitor app (DNA section 12 states the same limit); nothing below depends on a specific product. Verdict columns apply the brief's rules: DNA, no new UI library, additive only, "exists already".

| #   | Capability                                                         | T3 Code today                                                                                                                                                                                                                                    | Verdict                                                                                                                                              | Where                      |
| --- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- |
| 1   | Provider detection with live auth status                           | Partial. Same live atom as the Providers page (`providersValueAtom`), but only Codex and Claude are probed and shown, once per mount and on terminal close (`WelcomeWizard.tsx:651,722,854`); other six drivers need an instance first (F-09-30) | ADOPT: UI "Other agents" row and "Check again" now; "Also found" gated on a `which`-only server probe                                                | 03; F-24-03, F-24-07       |
| 2   | Project folder pick and import                                     | Import of Claude Code and Codex history exists and is good; folder pick exists only on the hero and in the palette, after the wizard has ended                                                                                                   | ADOPT small: "Add a project…" in the step footer calling the existing palette mode                                                                   | 04; F-24-08                |
| 3   | Sample project                                                     | None. "Start without a project" creates a scratch thread with no setup                                                                                                                                                                           | REJECT: scratch thread is already the zero-friction sample; bundling a repo is new machinery that writes into the user's file system (DNA-P2, yagni) | 05 B                       |
| 4   | First-prompt suggestions                                           | None; the empty timeline says one line and #24865 makes the placeholder teach `@ $ /`                                                                                                                                                            | DEFER: optional, read-only, gated on maintainer sign-off; conflicts with DNA-ID3 and DNA-P2 if shown to returning users                              | 05 C; F-24-15              |
| 5   | Keyboard hint tour                                                 | None; shortcuts live in tooltips and Settings, Keybindings; `DraftHeroHeadline` already shows one shortcut in a tooltip                                                                                                                          | REJECT the tour; ADOPT one quiet `Kbd` row for 24 h after setup, built from live keybindings                                                         | 05 A; F-24-14              |
| 6   | Pairing explainer                                                  | Exists three times in three voices: wizard "Need a pairing link?", hosted two-step list, mobile sheet caption; mobile Home and T3 Connect sheet have none                                                                                        | ADOPT: one voice, one three-step list, mobile parity                                                                                                 | 02, 07; F-24-01, F-24-12   |
| 7   | Re-entry when a provider is missing                                | Pieces exist and are unlinked: `/welcome#agents:<id>` opens step 2; `openProviderSetup` feeds chip, banner and picker; chip is a dead end with no instance                                                                                       | ADOPT: one branch in one hook plus two palette rows                                                                                                  | 06; F-24-05                |
| 8   | Permission modes in plain words                                    | Absent from first run. Strings exist (`runtimeModeConfig.ts`); default is Full access (`providerPolicy.ts:32`)                                                                                                                                   | ADOPT: collapsed one-line disclosure in the agents step; default unchanged                                                                           | 03 B; F-24-04              |
| 9   | Skip everything, power-user path                                   | Partial: X completes silently, Escape ignored, Enter on the wrong control; step 1 is mandatory                                                                                                                                                   | ADOPT: Skip button, Escape, focus fix, 2-step flow for one computer                                                                                  | 02 to 04; F-24-06, F-24-10 |
| 10  | Re-entry from Settings and palette                                 | None (`/welcome` only by URL; #10961, PRs #22411 and #23122)                                                                                                                                                                                     | ADOPT: Settings, About row and palette rows                                                                                                          | 08, 06 C; F-10-02          |
| 11  | Empty-state coaching (first thread, diff, PR)                      | Copy and actions are weak but present; area 10 owns them (F-10-18, F-10-19, F-10-21, F-10-22)                                                                                                                                                    | REJECT overlays and coach marks; fix the empty states in place                                                                                       | none                       |
| 12  | What is new after an update                                        | Nothing after the update; release notes only in the pre-update toast and sidebar pill                                                                                                                                                            | REJECT a modal or version-diff popup; ADOPT one About row                                                                                            | 08; F-24-16                |
| 13  | Mobile first launch                                                | Bare empty state                                                                                                                                                                                                                                 | ADOPT                                                                                                                                                | 07; F-24-01, F-24-02       |
| 14  | Honest consent                                                     | Telemetry paragraph on step 1 points to a privacy policy for opt-out; docs say opt-out is an environment variable                                                                                                                                | ADOPT copy only; a toggle is a server change, written as a dependency                                                                                | 02; F-24-11                |
| 15  | Environment pre-flight (Linux browser sandbox #22626, PATH #10728) | Server prints a startup hint; panels show `sudo t3 browser setup`                                                                                                                                                                                | REJECT in the wizard (it would become a doctor, DNA-P2); revisit with `t3 doctor`                                                                    | none                       |
| 16  | Account creation                                                   | None by design (bring your own subscription; T3 Connect optional)                                                                                                                                                                                | N/A, keep                                                                                                                                            | none                       |
| 17  | Progress survives Back                                             | PR #24719 fixes selection loss on Back                                                                                                                                                                                                           | BORROW (already graded in `prior-art/PRS.md`)                                                                                                        | none                       |

## Findings

Area 10 owns the defects of the wizard and the gate that already exist (F-10-01..37). The findings below are the gaps that remain once those are fixed, or that area 10 pointed here ("Needs deeper look", F-10-16, F-10-37). Where a fix needs the server it is written as a dependency and the UI part is gated (non-negotiable 4).

### F-24-01 Mobile first launch never says a computer must run T3 Code; the T3 Connect sheet says "No additional linked cloud environments."

- Severity: P1
- Surface: mobile
- Evidence: `[M]home-no-environments-light-iphone17.png`, `[M]connections-new-light-iphone17.png`. `HomeScreen.tsx:161-162` ("No environments connected" / "Add an environment to load projects and start coding sessions."), the same strings at `WorkspaceEmptyDetail.tsx:29-31`, `ThreadNavigationSidebar.tsx:705`, `NewTaskRouteScreen.tsx:66-67`, `LocalEnvironmentList.tsx:39`. `ConnectionsNewRouteScreen.tsx:361` ("Scan the code from t3 pair or desktop Connections settings") and `:265` ("For machines on your local network or tailnet. The machine keeps its own provider credentials."). T3 Connect sheet: `CloudEnvironmentRows.tsx:143-149` ("No additional linked cloud environments."), shown by `ConnectOnboardingRouteScreen.tsx:118-134` after sign-in. The web twin `HostedEmptyState.tsx:75-122` has a numbered list and a "Waiting for your computer…" row; the phone has neither. Pairing drop-offs: #5061, #4889, #5639, #19398; docs `remote-access.md` (Network access restarts the desktop app).
- Current: A person who installed the app first sees one button and learns nothing about the computer, the CLI or where the code lives; after T3 Connect sign-in the sheet is a sentence in internal vocabulary.
- Proposed: `07-mobile-first-launch.md` A to C. `deriveEmptyState` (`HomeScreen.tsx:146-205`): title "No computer connected", detail "Your agents run on a computer. Connect this phone to T3 Code running there."; under the `EmptyState variant="plain"` add a `ListSection` of three non-pressable `ListRowLayout` rows ("Open T3 Code on your computer, or run npx t3 there." / "Create a pairing link in Settings, Connections, or run npx t3 pair." / "Scan its code here."); FAB label "Connect a computer". Sheet caption (`:361`) "On your computer: Settings, Connections, or npx t3 pair"; helper (`:265`) "Both devices must be on the same network or tailnet. The computer keeps its own agent sign-ins." T3 Connect empty state: "Waiting for your computer…" (`AppActivityIndicator`, only while `relayDiscovery.isRefreshing`) plus a three-row list whose first step is "On your computer run npx t3 connect". Update the five duplicated "No environments connected" sites from one shared constant. Sheet title stays "Add environment" (Settings and docs use it; DNA-V7: computer in onboarding, environment in Settings).
- DNA: DNA-P3 (waiting row reflects real discovery), DNA-P9, DNA-V5, DNA-V6, DNA-V7, DNA-X3.
- Effort: S
- Risk: Strings are not asserted in mobile tests (searched); iOS and Android native layouts differ (`FloatingActionButton.android.tsx`), so check both. Collides with copy PRs by `extoci` (#24150, "clarify connection setup and pairing"): align wording before editing.
- Upstream-eligible: yes (copy plus one list), after aligning with #24150.
- #24865: not addressed (mobile touched only in `SettingsThreadsRouteScreen.tsx`).

### F-24-02 Mobile "No projects found" is a dead end although Add project exists

- Severity: P1
- Surface: mobile
- Evidence: `HomeScreen.tsx:198-204` returns "No projects found / The connected environment did not report any projects." when `projectCount === 0 && hasLoadedShellSnapshot`; the action renders only when `!catalogState.hasReadyEnvironment` (`:701-702`). The `AddProject` route exists (`Stack.tsx:762`, `linking: "new/add-project"`) and the New task header already carries `canAddProject` (`NewTaskRouteScreen.tsx:113,132`). Reachable right after a successful pairing to a computer with no projects.
- Current: The first screen after connecting says nothing can be done.
- Proposed: `07` D. Title "No projects yet", detail "{computer name} has no projects. Add one to start a thread.", action `Button tone="primary"` "Add project" navigating to `AddProject`. Keep "No threads yet" and wire its existing compose FAB label "New task" via `actionLabel` and `onStartNewTask` (`HomeScreen.tsx:111`).
- DNA: DNA-P7 (every state has a way forward), DNA-P3, DNA-V2.
- Effort: XS
- Risk: `HomeScreen` is virtualised; the empty state renders in the list-empty slot, check Android `bg-header` surface.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-24-03 The agents step knows two of eight providers; users of any other agent see two Install buttons and no way forward

- Severity: P1
- Surface: web, desktop
- Evidence: `WelcomeWizard.tsx:651` (`PRIMARY_AGENT_DRIVERS = ["codex", "claudeAgent"]`) and the step promise "Choose an agent to start coding. You can add more later." (`:672-675`). The server ships nine drivers (`builtInDrivers.ts:29-39`) but only Codex and Claude are probed by default, so the data for Cursor, Grok, OpenCode, Antigravity, Pi and Muse Code does not exist until an instance is added (F-09-30; `[B]settings-providers-default-light-1440x900.png` shows two rows). `docs/user/welcome-wizard.md` says "Claude Code and Codex" and "Other providers can be enabled in Settings". `getOnboardingProviderState` and `selectOnboardingProvidersByDriver` (`providerReadiness.logic.ts`) already classify any `ServerProvider`.
- Current: A Cursor- or OpenCode-only user is shown Install buttons for two tools they do not use, is told nothing about theirs, and Continue stays primary (F-10-15). They reach a composer that says "No provider available" (F-10-24).
- Proposed: `03` A. Under the cards add "Other agents" (`text-sm` 500) with one sentence "Cursor, Grok, OpenCode, Antigravity, Pi and Muse Code are set up in Settings." and `Button variant="outline" size="sm"` "Open Providers" linking to `/settings/providers` with return `/welcome#agents:<environmentId>` (the pattern `CodexSetupSection.tsx:270,407` uses). Gated follow-up: once the server reports `installed` and `version` for undiscovered drivers (F-09-30, a `which` check, no auth), list "Also found on {computer}: Cursor 1.4, OpenCode 1.14" with `getOnboardingProviderState` and the Install and Sign in terminal for drivers that have a known command; never show "ready" without live status. Also allow Continue to stay primary when any provider, not only the two, is ready.
- DNA: DNA-P3, DNA-P8 (every provider needs a decision), DNA-V5.
- Effort: S (UI) plus M server dependency (gated)
- Risk: `WelcomeWizard.import.browser.test.tsx` renders the wizard; add one assertion for the new row. The return hash requires `/welcome` to re-open on step 2 (it does).
- Upstream-eligible: yes for the static row; the probe is a separate server PR.
- #24865: not addressed.

### F-24-04 New threads default to Full access and first run never says so

- Severity: P1
- Surface: all
- Evidence: `providerPolicy.ts:32` (`DEFAULT_RUNTIME_MODE = "full-access"`), `docs/user/permission-modes.md` ("The initial default is Full access"), `[W]draft-empty-project-nongit-light-1440x900.png` (composer chip "Full access" with an open padlock), `[B]settings-general-default-light-1440x900.png` (Settings, General, Permissions). `grep -in "permission\|full access\|supervised"` over `components/onboarding/*` and `NoProjectsHero.tsx` matches only an unrelated import-permission string. The plain-language descriptions already exist in `chat/runtimeModeConfig.ts:7-27` ("Ask before commands and file changes." and three more) but appear only inside the picker and Settings.
- Current: The first prompt of a first session can run commands and edit files without asking, and the only disclosure is a chip label.
- Proposed: `03` A and B. In the agents step add a collapsed row "New threads start in [icon] Full access" with "Allow commands and edits without prompts." (both strings from `runtimeModeConfig`) and a "Change" disclosure (`Collapsible`) holding the four options as a `RadioGroup` with their descriptions; selecting writes `defaultRuntimeMode` through `serverEnvironment.updateSettings` (the call `OnboardingCodexSetup` already makes, `WelcomeWizard.tsx:884`). Do not change the default: that is a product decision (see Needs deeper look). A second sentence: "You can change this per thread, and in Settings, General, New threads, Permissions."
- DNA: DNA-V5 (explain in place, once), DNA-P3, DNA-P2 (collapsed, one line, no new step).
- Effort: S
- Risk: `defaultRuntimeMode` is a project-scoped server setting (`settings.ts:958`); with several computers each environment gets its own row. Settings writes need the server permission scope: render read-only text when the connection lacks it.
- Upstream-eligible: yes (touches wizard files that #24865 does not).
- #24865: not addressed.

### F-24-05 No entry point leads to the wizard's agents step when a provider is missing, although `/welcome#agents:<id>` already opens it

- Severity: P1
- Surface: web, desktop
- Evidence: `routes/welcome.tsx:25-27` resumes at step 2 from `#agents:<environmentId>`; only `CodexSetupSection.tsx:270,407` links there. `useComposerSelection.ts:118-123` (`openProviderSetup`) is the single handler behind the composer chip, the status banner and the model-picker "unavailable" rows, and always goes to `/settings/providers`. The chip is `disabled` without an instance (`ComposerControlsBar.tsx:255-270`); the banner action shows only when `hasProviderSetup` (`ProviderStatusBanner.tsx:130`); Providers shows "Not found" with no action (F-09-07). Palette actions list no setup entry (`CommandPalette.tsx:1556-1603`). Issue #10961, PRs #22411 and #23122 ask for the same return path.
- Current: Everything that detects a missing agent points at a page that cannot fix it; the one screen that can (the wizard's install and sign-in terminal) is reachable only by typing a URL.
- Proposed: `06`. In `openProviderSetup` branch: Codex or Claude, state `install` or `signIn`, terminal scope granted -> `navigate({ to: "/welcome", hash: "agents:<environmentId>" })`; otherwise today's Settings route. Chip: enabled always; label "Set up an agent" with no instance. Banner action "Set up agents" for the wizard branch. Palette: "Set up agents" and "Open setup" rows (`FolderInputIcon`, `BotIcon`). Providers with nothing configured: `Empty size="compact"` with "Add provider" and "Set up agents" (replaces `ProviderSettingsPanel.tsx:1078-1082`). Re-entered wizard shows `Close`/`Done` and renders `NoProjectsHero` only with zero projects (F-24-13).
- DNA: DNA-P7, DNA-P8, DNA-V2, DNA-D5, DNA-K14.
- Effort: M
- Risk: `ChatComposer.tsx`, `ComposerControlsBar.tsx` are in #24865's diff (different hunks): land after the PR. Add `providerReadiness.logic.test.ts` cases for the branch rule; terminal availability on remote environments must follow the wizard's existing `canOperateTerminal` rule.
- Upstream-eligible: yes after #24865 (chip, banner); palette rows now.
- #24865: partial (it edits `ComposerControlsBar.tsx` and `composerPlaceholder.ts`, not the chip or the handler).

### F-24-06 Step 1 asks a single-computer user to confirm the only computer; a 2-step flow is enough

- Severity: P2
- Surface: web, desktop
- Evidence: `ConnectionStep` (`WelcomeWizard.tsx:293-460`); `[W]welcome-1-connect-light-1440x900.png`. F-10-16 is the copy-only interim and says the real fast path belongs here. Remote ready is a core promise (`AGENTS.md`), so the multi-computer step must stay reachable. `WizardSteps` already takes any `steps` array (`ui/wizard.tsx:65-77`).
- Current: Every first run spends a screen on a checkbox that cannot usefully be unchecked.
- Proposed: `02` and `03`. When exactly one direct computer is connected and `localAvailable`, start on Agents with the stepper `Agents, Projects`; add a computer line "MacBook Pro Connected" with `Button variant="ghost-muted" size="xs"` "Add another computer" that sets `step = "connection"` and brings the third chip. Multi-computer, hosted, remote-only and `!localAvailable` keep step 1 first. `resolveOnboardingSetup` and the pairing form are unchanged.
- DNA: DNA-P2 (do not add steps to look thorough), DNA-P8, DNA-V6.
- Effort: M
- Risk: stepper chip count changes when the user opts into the Computers step; `WelcomeWizard.import.browser.test.tsx` asserts three chips today. Collides with F-10-16 and F-10-28 edits: sequence them.
- Upstream-eligible: no (flow decision for the maintainers).
- #24865: not addressed.

### F-24-07 Agent status is a one-shot snapshot with no "Check again"; a stale login-shell PATH keeps "Install" showing after the install

- Severity: P2
- Surface: desktop (macOS worst), web
- Evidence: `ConnectedAgentsStep` refreshes providers on mount (`WelcomeWizard.tsx:722`) and when the install terminal closes (`:854`); `onSessionExited={onClose}` (`:1157`). The Providers page shows "Checked just now" with a refresh (`ProviderSettingsPanel.tsx:159`, `:1021`); the wizard shows neither. A user who installs from their own terminal, or whose desktop app has a login-shell environment older than the install (#9429, #10728: installed tools stay invisible), sees "Install" until a restart. The "Checking..." label uses three dots (F-10-36).
- Current: The step cannot be told to look again and does not say when it last looked.
- Proposed: `03` A. Per computer, "Checked just now" (export and reuse `ProviderLastChecked`) plus `Button size="icon-xs" variant="ghost-muted"` with `RefreshIcon` calling `refreshProviders`; one `visibilitychange` listener that refreshes when the window regains focus (no polling, DNA-P1). While an install terminal is open and the state still reads Not found, one line under the card: "After the installer finishes, choose Check again." Server-side PATH refresh is a dependency (#9429), not part of this change.
- DNA: DNA-P3, DNA-P1, DNA-M6, DNA-V9.
- Effort: S
- Risk: Extracting `ProviderLastChecked` touches the Providers panel file; export only. A refresh while the terminal is running is harmless (idempotent probe).
- Upstream-eligible: yes.
- #24865: not addressed.

### F-24-08 The wizard cannot pick a folder; a user with no Claude or Codex history leaves with nothing and is asked again

- Severity: P2
- Surface: web, desktop
- Evidence: `ImportStep` offers import only (`WelcomeWizard.tsx:1173-1523`); F-10-07 covers the disabled "Import 0 projects". `NoProjectsHero.tsx:32` opens `openCommandPalette({ open: "add-project" })` after the wizard has closed. Area 10's `[W]no-projects-hero-light-1440x900.png`.
- Current: The people most likely to need help adding a folder (new to coding agents) get the folder browser one screen after the wizard that never offered it.
- Proposed: `04` A and C. Footer leading `Button variant="ghost-muted"` "Add a project…" that runs `finish()` then `openCommandPalette({ open: "add-project" })` (never imports). With zero candidates replace "Import 0 projects" by an enabled "Continue" (F-10-07) and show `Empty size="inline"` (F-10-25).
- DNA: DNA-P2, DNA-P7, DNA-V9.
- Effort: XS
- Risk: Opening the palette immediately after the dialog unmounts: order via `await finish()` first. Covered by `WelcomeWizard.import.browser.test.tsx` (extend).
- Upstream-eligible: yes.
- #24865: not addressed.

### F-24-09 Import blocks the dialog with a bare "Importing…" and no count; it is the longest unbounded wait before the first message

- Severity: P2
- Surface: web, desktop
- Evidence: `runImport` awaits `createProject` then `importThreads` per candidate in a loop (`WelcomeWizard.tsx:1299-1375`); each attempt reads up to 100 conversation files and 4 GiB per project (`docs/user/welcome-wizard.md`). While `isImporting`, the X, the chips and Escape are disabled and the button reads "Importing…" (`:1516`). Compressed Codex rollouts are ignored (#21755), so the count a user sees can be short without explanation.
- Current: With the default selection of up to seven repositories the user waits behind a locked dialog with no sense of progress.
- Proposed: `04` B. `Importing 2 of 7…` (`role="status"`, `tabular-nums`, shared `Spinner size="md"`) from a `{done, total}` `useState` set inside the existing loop; keep the lock (the loop lives in the component and stops on unmount, so backgrounding it needs a larger change). Keep the existing warning toast for partial failure.
- DNA: DNA-P3 (real progress), DNA-T8, DNA-M6, DNA-V9.
- Effort: XS
- Risk: `WelcomeWizard.import.browser.test.tsx` covers import; assert the label.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-24-10 No skip-everything path that respects keyboard and power users

- Severity: P2
- Surface: web, desktop
- Evidence: Footer has only Continue (steps 1 and 2) or "Do not import projects" plus Import (step 3). Close is the X, last in tab order; Escape and backdrop clicks do nothing (`WelcomeWizard.tsx:221-225`, F-10-11); focus starts on "Add a computer" (`:230`, F-10-10); the X silently sets `onboardingCompletedAt` and leaves no trail (F-10-02); the footer scrolls away at 800x600 (F-10-12).
- Current: Skipping is possible but takes a mouse trip to a corner, and nothing tells the user they can come back.
- Proposed: `02` to `04`. One footer slot (`WizardPopup` `footer` prop, optional) with `Button variant="ghost-muted"` "Skip setup" ("Skip import" on the last step) in a fixed position, `Continue` `autoFocus` with `id="onboarding-continue"`, Escape = Skip when not importing, and the Settings and palette entries from `08` and `06` as the trail. The Add-provider wizard shares `WizardPopup`; the prop is optional.
- DNA: DNA-K14, DNA-P7, DNA-V2, DNA-D6.
- Effort: M (shared with F-10-10, F-10-11, F-10-12; do them as one change)
- Risk: `WizardPopup` is shared with `AddProviderInstanceDialog` (PR #24381 touches its buttons); visual diff on both.
- Upstream-eligible: yes, as the F-10-10/11/12 bundle.
- #24865: not addressed.

### F-24-11 The first-screen telemetry notice points to a privacy policy for opt-out; the real opt-out is an environment variable

- Severity: P2
- Surface: web, desktop
- Evidence: `WelcomeWizard.tsx:434-446` ("To read more about how your data is used and how to opt out, see our privacy policy."); `docs/user/telemetry.md`: opt-out is `T3CODE_TELEMETRY_ENABLED=false` before starting the server, there is no in-app toggle, and the browser app does not read it. Settings, About has a privacy row (`SettingsPanels.tsx:1898-1913`).
- Current: The one consent-shaped sentence in first run implies the policy page explains the opt-out; the person who wants to opt out must find the variable elsewhere.
- Proposed: `02`. "T3 Code collects anonymous usage data. Turn it off with T3CODE_TELEMETRY_ENABLED=false (see the docs)." The variable in mono (`font-mono`, DNA-T7), "docs" linking the telemetry page. A real in-app toggle is a server setting: dependency, not proposed here.
- DNA: DNA-V3, DNA-V5, DNA-P3, DNA-T7.
- Effort: XS
- Risk: Copy only; coordinate with the privacy-policy wording owner.
- Upstream-eligible: no (policy copy; maintainers decide).
- #24865: not addressed.

### F-24-12 The pairing explanation exists in three places in three voices; mobile says "environment", onboarding says "computer"

- Severity: P2
- Surface: all
- Evidence: Web wizard `WelcomeWizard.tsx:625-640` ("Need a pairing link? / Run this on the computer with your code. / npx t3 pair / Start T3 Code first, or run npx t3 serve. Add --tailscale…"); hosted `HostedEmptyState.tsx:38-47` ("Your agents run on your computer.") and its two-step list; mobile `ConnectionsNewRouteScreen.tsx:265,361` and `HomeScreen.tsx:161`. DNA-V7: "computer (onboarding and hosted pages)", "environment (technical, settings, palette)". Area 11 F-11-20 counts six names for one machine.
- Current: One idea, three phrasings, two nouns; the CLI hint is `npx t3 pair` on web and `t3 pair` on mobile.
- Proposed: A shared copy deck, used in `02`, `07` and the hosted page: noun "computer" in every first-run surface; steps "Open T3 Code on your computer, or run `npx t3` there." / "Create a pairing link in Settings, Connections, or run `npx t3 pair`." / "Scan or paste it here."; T3 Connect: "Run `npx t3 connect` on your computer." Strings live next to each client's component (web and mobile share no UI package); only the sentences are shared.
- DNA: DNA-V7, DNA-V6, DNA-X2.
- Effort: S
- Risk: Overlaps `extoci`'s copy PRs (#24147 to #24150) and the hosted page tests; coordinate wording before editing.
- Upstream-eligible: yes (after aligning with #24150).
- #24865: not addressed.

### F-24-13 `/welcome` re-entry renders the zero-project hero under the dialog for users who have projects

- Severity: P3
- Surface: web, desktop
- Evidence: `routes/welcome.tsx:36` renders `<NoProjectsHero />` unconditionally; `onDone` always navigates to `/` or a new draft (`:41-47`), not back to where the user was. After a re-entry from a thread the user would land on a draft in a different project (the most recently updated), not their thread.
- Current: Cosmetic behind the scrim, but "Close" does not return to the previous page.
- Proposed: Render the hero only when `useProjects().length === 0`; on re-entry (`onboardingCompletedAt` set) `Close` runs `router.history.back()` when history exists, else `navigate({ to: "/" })`.
- DNA: DNA-P7 (the way out returns you).
- Effort: XS
- Risk: Needs F-24-05 to matter; browser test for `/welcome` with projects.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-24-14 Nothing orients a new user to the keyboard; global shortcuts are tooltip-only

- Severity: P3
- Surface: web, desktop
- Evidence: `shortcutLabelForCommand` is used for one tooltip in the draft hero (`DraftHeroHeadline.tsx:315`); defaults in `packages/shared/src/keybindings.ts:145-215` (`mod+k`, `mod+d`, `mod+n`, `mod+shift+a`...). #24865 changes the placeholder to "Ask anything. @ files, $ skills, / commands", which teaches in-composer triggers only. Discoverability asks #14404 and #15984 and Q&A #8057 show the same class of gap.
- Current: Users find the palette by accident.
- Proposed: `05` A. A quiet `DraftKeyHints` row (three `Kbd` hints: palette, diff, new thread) under the composer for 24 hours after `onboardingCompletedAt`, only on an empty draft, labels from live keybindings (omitted when unbound), hidden on touch. No tour, overlay, step counter or dismiss. Rejected: a modal tour (DNA-P2, DNA-ID3).
- DNA: DNA-L8, DNA-K14, DNA-P3, DNA-P2.
- Effort: S
- Risk: A time-boxed hint can surprise a user who reads `onboardingCompletedAt` differently across clients; it reads the local client setting only. No test today for the draft hero layout.
- Upstream-eligible: no until maintainers accept the hint row.
- #24865: partial (placeholder teaches `@ $ /`; global keys remain tooltip-only).

### F-24-15 First-prompt suggestions: do not build by default

- Severity: P3
- Surface: web, desktop
- Evidence: Empty timeline copy is one line by design (DNA-ID3); `DraftHeroHeadline` already carries "or start without a project" as the only secondary action. No top-50 Idea asks for suggestions (`prior-art/discussions.md`, "Onboarding asks"). Audience is bring-your-own-subscription users who already drive agents.
- Current: None.
- Proposed: Optional block `05` C, behind maintainer sign-off: up to three read-only starter sentences ("Explain this repository", "Summarize recent commits", "List the TODOs") as `InlineButton tone="muted"` that fill the composer and never send, same 24 h and empty-draft rule. Read-only because the default mode is Full access (F-24-04). If declined, nothing else depends on it.
- DNA: DNA-P2 and DNA-ID3 (argue against), DNA-P7 (fills, does not send).
- Effort: S
- Risk: Taste: it can read as marketing; also adds three strings to localise if copy ever moves to a catalog.
- Upstream-eligible: no (feature request; belongs in Ideas).
- #24865: not addressed.

### F-24-16 Returning users after an update see nothing; no mechanism knows the last-seen version

- Severity: P3
- Surface: web, desktop, mobile
- Evidence: No persisted last-seen version in `ClientSettings` or localStorage (`grep lastSeen` empty); `APP_VERSION` exists (`branding.ts:27`); release notes are reachable only from the pre-update toast and sidebar pill (`desktopUpdate.toast.tsx:12-58`) and the "Update did not apply" toast. F-10-37 proposed the Settings row without the design.
- Current: Features arrive silently.
- Proposed: `08` A and C. Settings, General, About gains "Release notes" (`Read release notes`, `getDesktopUpdateReleaseUrl(APP_VERSION)` or the release-history URL) and "Setup" (`Open setup`) rows in the existing About pattern; mobile About gains "Release notes". Rejected: a post-update modal, a version diff, a "new" badge: they need persisted last-seen state across three clients (web localStorage, desktop, mobile preferences) for a nice-to-have, against DNA-P2.
- DNA: DNA-P2, DNA-P7, DNA-L6, DNA-K16.
- Effort: XS
- Risk: None beyond copy; adds two search entries to `settingsSearch.ts`.
- Upstream-eligible: no (feature; Ideas discussion), except the "Setup" row which is F-10-02's.
- #24865: not addressed.

## Proposed flow at a glance (wireframes in `spec/onboarding/`)

Principle: three presses to a first message for a ready user, no new step, no tour, nothing a power user cannot skip with Escape, and every way out leaves a way back.

| File                                 | Screen                                               | Reuses (existing)                                                                                          | Changes                                                              | Findings                  |
| ------------------------------------ | ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ------------------------- |
| `01-gate-and-recovery.md`            | Pending and recovery cards, 1280 and 390             | `Empty size="compact"`, `Spinner`, `T3Wordmark`, `WorkspacePageHeader`                                     | one shared shell, 1 s delayed spinner, "Open Connections"            | F-10-05, F-10-06, F-10-09 |
| `02-wizard-computers.md`             | Computers step, now conditional                      | `ConnectionStep`, `PairingForm`, `Collapsible`, `Checkbox`, `CommandBlock`                                 | entry rule, footer slot, telemetry copy                              | F-24-06, F-24-10, F-24-11 |
| `03-wizard-agents.md`                | Agents step                                          | `AgentCard`, `CodexSetupSection`, `AgentInstallTerminal`, `RadioGroup`, `RefreshIcon`, `runtimeModeConfig` | Other agents row, Check again, permissions disclosure, no-agent note | F-24-03, F-24-04, F-24-07 |
| `04-wizard-projects.md`              | Projects step                                        | `ImportStep`, `Empty`, `Spinner`                                                                           | Add a project…, progress count, zero-candidate Continue              | F-24-08, F-24-09          |
| `05-first-draft-landing.md`          | Draft hero, zero-project hero                        | `DraftHeroHeadline`, `NoProjectsHero`, `Kbd`, `InlineButton`, `shortcutLabelForCommand`                    | `DraftKeyHints` row, Import button, optional starters                | F-24-14, F-24-15          |
| `06-reentry-missing-provider.md`     | Chip, banner, palette, Providers empty               | `openProviderSetup`, `ComposerControl`, `ProviderStatusBanner`, palette item shape                         | one hook branch, two palette rows                                    | F-24-05, F-24-13          |
| `07-mobile-first-launch.md`          | Home empty, Add environment, T3 Connect, no projects | `EmptyState`, `ListSection`, `FloatingActionButton`, `AddProject` route                                    | copy, one list per empty state, one action                           | F-24-01, F-24-02, F-24-12 |
| `08-settings-entries-and-updates.md` | Settings, About rows                                 | `SettingsRow`, `Button outline sm`, `openDesktopUpdateReleaseNotes`                                        | Release notes and Setup rows                                         | F-24-16                   |

Rules check across the set: no new UI library, icon set or dependency (Lucide and `components/ui/*` only); one new small component (`DraftKeyHints`) and one new variant already proposed by area 10 (`Empty size="inline"`, F-10-25); no setting, keybinding, theme or permission mode removed or renamed (the wizard row writes the existing `defaultRuntimeMode`); no change to `apps/server`, auth, pairing or relay (server needs are listed as dependencies below); every proposed surface has a reverse (Skip, Close, Setup row, palette).

Order of work (so nothing waits on the owner PR):

1. Now, no #24865 overlap: F-24-04, 07, 08, 09, 11 in the wizard; F-24-01, 02 on mobile; F-24-16 (About rows); palette rows of F-24-05.
2. With the F-10 wizard bundle (F-10-10, 11, 12, 16, 26, 28): F-24-06 and F-24-10 as one change to `WizardPopup` and the step footers.
3. After #24865 merges: the composer chip and banner branch of F-24-05, and `DraftKeyHints` (F-24-14), because both sit beside its `ChatComposer.tsx` and `ComposerControlsBar.tsx` hunks.
4. Server dependencies (not in this area): F-10-01 (`bootstrapProjectCreated`), F-09-30 (probe for undiscovered drivers), login-shell PATH refresh (#9429).

## Edge-case results (matrix)

Data

- Empty: wizard import empty FAIL (F-24-08, F-10-07); mobile no computers FAIL (F-24-01); mobile no projects FAIL (F-24-02); `NoProjectsHero` PASS.
- One item: single computer FAIL (F-24-06).
- 100+ items: wizard import list with 19 candidates scrolls (area 10); 100+ NOT TESTED (host has 19). Mobile 100+ threads PASS (area 15).
- 10,000+: N/A.
- Long names: wizard rows at 390 FAIL (F-10-14); mobile host and project names NOT TESTED (no first-run fixture).
- Unicode, emoji, RTL, whitespace: N/A for the proposals (they add no user-named text); hero PASS (area 10).

Content: N/A.

Network and agents

- Provider not installed: FAIL (F-24-03, F-24-05, F-24-07; code-read, both agents are installed on this host).
- Installed but logged out: FAIL (F-24-05; `[P]thread-claude-logged-out-light-1440x900.png` shows the banner with no setup action).
- Auth expired mid-session: covered by area 09; re-entry FAIL (F-24-05).
- Stream stalls, cancelled, permission prompt, parallel streams: N/A (not first-run).
- Relay disconnected, server unreachable at start: FAIL (F-10-06, F-10-09, reproduced in area 10).
- Reconnect after sleep, server restarted under the client: NOT TESTED (shared server).
- Version mismatch: wizard "Client not supported" row and mobile "Client not supported" (`HomeScreen.tsx`) are code-read only.

Git

- No repo, uncommitted changes, detached HEAD, worktree failure, no GitHub auth, push rejected, conflict, branch collision: N/A to first run beyond areas 05, 10 and 11 (non-Git folder: F-10-19, F-10-21).

Viewport

- 1440x900: PASS (area 10 captures). 1280x720: wireframes drawn at 1280 (`spec/onboarding`), live NOT TESTED. 1024x640: wizard fits by 6 px (area 10). 800x600 and 200% zoom: FAIL (F-10-12, F-24-10). 3440x1440: PASS (area 10). 390x844: wizard FAIL (F-10-14, F-10-28), mobile native screens from area 15. Mobile keyboard open: Add environment error hidden (F-15-06); NOT TESTED otherwise. OS zoom 80/125/150 and browser zoom 50: NOT TESTED.

Preferences

- Light and dark: PASS (area 10 captures, tokens only). Every named theme: NOT TESTED; wizard uses semantic tokens (DNA-C1), proposals add none.
- System switching live, high contrast, font-size overrides: NOT TESTED.
- Reduced motion: PASS by code-read (`AnimatedHeight` has `motion-reduce:transition-none`); the proposals add no motion beyond the shared `Spinner` and a 150 ms opacity step that is removed under reduced motion (DNA-M5).
- Keyboard only: FAIL (F-24-10, F-10-10, F-10-11).
- Screen reader: NOT TESTED (no SR). The proposals add `role="status"` for the import count and the check time, `aria-label` on counts (F-10-13), `RadioGroup` semantics for permissions.

Lifecycle

- First ever launch: SIMULATED for desktop and hosted by code-read and area 10's captures; web-mode FAIL (F-10-01); mobile first launch captured by area 15, FAIL (F-24-01).
- Launch after update: nothing shown (F-24-16).
- Launch with corrupted settings: FAIL (F-10-06).
- Quit mid-wizard: the wizard keeps no progress (`step` is component state), so a relaunch restarts at step 1 until `onboardingCompletedAt` is written; acceptable, three presses.
- Launch while a server is already running, app backgrounded for an hour, OS sleep: N/A or NOT TESTED (not onboarding).

## Already good (do not touch)

- The gate's evidence model (`firstRun.logic.ts`): never shows setup to a returning user on partial data and never overwrites unreadable settings. Only its surfaces change (01).
- `NoProjectsHero`: one question, one primary, one outline button; the new import button is additive.
- `HostedEmptyState` two-step list and "Waiting for your computer…": the model for mobile (07).
- Wizard `AgentInstallTerminal`: pre-typed command that the user reviews and runs, with a `Close`/exit that refreshes status. Do not auto-run installers.
- `runtimeModeConfig` strings: plain, one sentence each; reuse, do not rewrite.
- `PairingForm`: IME-safe Enter, `aria-describedby` on errors, collapsible command block.
- `Collapsible`, `WizardSteps` and `StepShell`: the wizard needs no new layout primitives.
- "Start without a project": the zero-setup sample. Keep it prominent.
- The Providers page's live status model (`getProviderSummary`, `getOnboardingProviderState`): one truth for both surfaces.

## Incomplete

- No new captures and no live first launch: the shared dev server cannot be emptied (area 10). Every wireframe is derived from code and existing captures. Journey times are estimates from the code path, not stopwatch measurements.
- Electron not driven (area 14): the drag-strip claims in 01 are code-read (F-10-05).
- Mobile is read from code and area 15's simulator captures; the `ConnectOnboarding` sheet was never captured (`[M]connect-onboarding-light-iphone17.png` shows the thread list, not the sheet) and Android is code-read only.
- No competitor app was inspected; the "premium first run" column is the generic pattern, and the spec stands without it.
- F-24-03 relies on area 09 (F-09-30) and the baseline Providers capture for "only Codex and Claude are probed by default"; I did not trace which of the nine built-in drivers get an enabled default instance in the server (`ProviderInstanceRegistryHydration.ts:41-45` creates default instances for every driver without `hasDefaultInstance === false`, so the not-probed state may come from the drivers' own enabled defaults). The UI proposal holds either way.
- Not verified live: composer focus after the wizard lands; whether `/welcome` opened from a Settings route modal returns to it on Close; terminal availability for the re-entry branch on remote environments.
- Captures withheld: none new. Reused captures with account data are already masked by area 10 and area 09.
- Side effects: none. Nothing outside `ui-overhaul/` was written; no probe threads, projects or settings were created or changed.

## Needs deeper look

- Product decision: should a fresh install default to Full access (`providerPolicy.ts:32`)? F-24-04 only discloses it. If maintainers prefer Supervised or Auto for new installs, the same wizard row becomes a real first-run choice with no further design.
- F-10-01's server fix will start showing the wizard to every first `npx t3` user, including ephemeral and CI-like launches. Decide whether the server needs a skip signal for those (a server and CLI change, outside UI scope) before that fix ships.
- Server probe for undiscovered drivers (F-09-30) and a login-shell PATH refresh after install (#9429): both gate the best version of F-24-03 and F-24-07.
- Mobile pairing mechanics (iOS Local Network sheet #5061, Android code format #4889, stale endpoints #19398) belong to areas 11 and 15; the first-run copy in 07 does not fix them.
- `ChatGptWelcomeCoordinator` can stack a second modal on the Agents step (area 10 "Incomplete"); check against the new permissions row before building.
- Remote-only desktop and WSL: the wizard's agents step and the re-entry branch for Codex and Claude assume the terminal runs where the agent runs; confirm for the WSL backend (`docs/user/install.md`).
- Whether `shortcutLabelForCommand` can be called in the draft hero while the keybindings config is still loading (it returns `null`; the hint row must render nothing, not an empty `Kbd`).
