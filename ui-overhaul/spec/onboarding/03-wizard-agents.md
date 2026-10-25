# 03 Wizard: Agents step, web and desktop; 1280 and 390

The most valuable screen in first run: it is where a person learns whether T3 Code can do anything yet. Today it checks two agents once (`PRIMARY_AGENT_DRIVERS = ["codex","claudeAgent"]`, `WelcomeWizard.tsx:651`) and says nothing about permissions. Audit: F-24-03 (other agents), F-24-04 (permission default), F-24-06 (single-computer start), F-24-07 (check again), F-10-15 (no ready agent), F-10-27 (card parity), F-09-07 (no install action in Settings).
Live data is the same atom the Providers page reads (`serverEnvironment.providersValueAtom(environmentId)`); no new data source. Server dependency for "also found" is F-09-30 (a `which`-only probe for drivers without an enabled default instance); the UI below works without it.

## A. All good, one computer, 1280x720 (dialog 768 px)

```
 +------------------------------------------------------------+
 | T3 Code                                                [x] |
 | +--------------------------------------------------------+ |
 | | (1) Agents                         ( 2 ) Projects       | |  <- 2-chip WizardSteps [CHANGE]
 | +--------------------------------------------------------+ |
 |------------------------------------------------------------|
 | Set up your agents                                         |  <- h1 24/600 [EXISTS, F-10-28 name]
 | Choose an agent to start coding. You can add more later.   |
 |                                                            |
 | [monitor] MacBook Pro  Connected   Checked just now [R]    |  <- computer line [NEW COMPOSITION]
 |                                  [ Add another computer ]  |     Button ghost-muted xs; [R] RefreshIcon
 |                                                            |
 | +--------------------------------------------------------+ |
 | | (codex)   Codex                                v Ready | |  <- CodexSetupSection [EXISTS]
 | |           Signed in as user@example.com                | |
 | +--------------------------------------------------------+ |
 | | (claude)  Claude Code                          v Ready | |  <- AgentCard [CHANGE: F-10-27 copy]
 | |           Signed in as user@example.com               | |     name, account line
 | +--------------------------------------------------------+ |
 |  Connect another ChatGPT account                           |  <- Button ghost-muted xs [EXISTS]
 |                                                            |
 | Other agents                                               |  <- text-sm/500 title
 | Cursor, Grok, OpenCode, Antigravity, Pi and Muse Code are   |  <- text-xs muted description
 | set up in Settings.                      [ Open Providers ] |     Button outline sm -> /settings/providers
 |                                                            |
 | New threads start in  [unlock] Full access      [ Change v ]|  <- Collapsible row [NEW COMPOSITION]
 | Allow commands and edits without prompts.                  |     runtimeModeConfig label + description
 |------------------------------------------------------------|
 |                            [ Skip setup ]  [ Continue  -> ] |  <- footer slot, Continue autoFocus
 +------------------------------------------------------------+
```

- Order of reading: computer, the two agents, "other agents", permissions. Everything below the cards is `text-xs`/`text-sm` muted so the cards stay the loudest thing (DNA-C4, DNA-T2).
- "Checked just now [R]" is the Providers page's `ProviderLastChecked` (`ProviderSettingsPanel.tsx:159`, a local function: export it, do not copy it) plus a `Button size="icon-xs" variant="ghost-muted"` with `RefreshIcon` (shared, visibility-aware spinner, DNA-M6). It calls the existing `refreshProviders({ environmentId, input: {} })`. The step also refreshes on `visibilitychange` (one listener, no polling; DNA-P1).
- "Add another computer" sets `step = "connection"` (02). Hidden when `!localAvailable`.
- "Open Providers": `Button variant="outline" size="sm" render={<Link to="/settings/providers" />}`, return address `/welcome#agents:<environmentId>` as `CodexSetupSection` already does (`CodexSetupSection.tsx:270,407`).
- After the server dependency lands, the "Other agents" line becomes "Also found on MacBook Pro: Cursor 1.4, OpenCode 1.14" using `getOnboardingProviderState` (ready / signIn / install) and the same Install / Sign in terminal for drivers that have a known command; otherwise it stays the static sentence. Never list a provider as ready without live status (DNA-P3).

## B. Permissions disclosure expanded

```
 | New threads start in  [unlock] Full access      [ Hide ^ ] |
 | ( ) Supervised         Ask before commands and file changes.|  <- RadioGroup + Radio [EXISTS ui/radio-group]
 | ( ) Auto-accept edits  Auto-approve edits, ask before other |
 |                        actions.                             |
 | ( ) Auto               Supported providers approve routine  |
 |                        actions; others still ask.           |
 | (o) Full access        Allow commands and edits without     |
 |                        prompts.                             |
 | You can change this per thread, and in Settings, General,   |
 | New threads, Permissions.                                   |
```

- Four rows read from `runtimeModeConfig` (`chat/runtimeModeConfig.ts`): labels and descriptions are the existing strings, so the picker, Settings and the wizard cannot drift. Selecting writes `defaultRuntimeMode` through `serverEnvironment.updateSettings` (already used by `OnboardingCodexSetup`, `WelcomeWizard.tsx:884`). Preselected value is whatever the server holds; the documented initial default (Full access) is not changed by this proposal. Whether to change it is a maintainer decision (see audit "Needs deeper look").
- Collapsed by default: a power user never opens it, a new user reads one honest sentence. Closed state is the one-line row drawn in A.
- Icons: `runtimeModeConfig[mode].icon` (Lucide `LockIcon`, `PenLineIcon`, `SparklesIcon`, `LockOpenIcon`) at `size-4`, muted (DNA-I2, DNA-I3).

## C. No agent ready (code-read states; F-10-15)

```
 | +--------------------------------------------------------+ |
 | | (codex)   Codex                             [ Install ] | |  <- AgentCard install state
 | |           Not found · CLI not detected on PATH.         | |
 | +--------------------------------------------------------+ |
 | | (claude)  Claude Code                      [ Sign in ]  | |
 | |           Not authenticated · Claude Code subscription  | |
 | +--------------------------------------------------------+ |
 | No agent is ready on MacBook Pro. You can continue and set  |  <- text-xs muted, one sentence [F-10-15]
 | one up later from the composer or Settings, Providers.      |
 |------------------------------------------------------------|
 |                            [ Skip setup ]  [ Continue  -> ] |  <- Continue becomes variant="outline"
 +------------------------------------------------------------+     while zero agents are ready
```

- Install / Sign in open the existing terminal drawer (`AgentInstallTerminal`, `onSessionExited` refreshes). Below it, the card gains the line "After the installer finishes, choose Check again." only while a terminal is open and the state still reads Not found (stale login-shell PATH, #9429, #10728).
- Primary demotion: `Continue` stays enabled (never block, DNA-P7) but drops to `variant="outline"` until one agent is ready; it returns to `default` the moment the state flips. State is real (DNA-P3).

## D. 390x844

```
+------------------------------------+
| T3 Code                        [x] |
| (1) Agents   ( 2 )                 |  <- current label shown below 640 px
|------------------------------------|
| Set up your agents                 |
| Choose an agent to start coding.   |
|                                    |
| [monitor] MacBook Pro              |
| Connected · Checked just now  [R]  |
| [ Add another computer ]           |
|                                    |
| +--------------------------------+ |
| | (codex)  Codex          v Ready| |
| |  Signed in as user@example.com | |
| +--------------------------------+ |
| | (claude) Claude Code    v Ready| |
| |  Signed in as user@example.com | |
| +--------------------------------+ |
| Other agents                       |
| Cursor, Grok, OpenCode and more    |
| are set up in Settings.            |
| [ Open Providers ]                 |
|                                    |
| New threads start in               |
| [unlock] Full access   [ Change v ]|
| Allow commands and edits without   |
| prompts.                           |
|------------------------------------|
| [ Skip setup ]    [ Continue  -> ] |
+------------------------------------+
```

- Rows are 44 px tall on touch (`min-h-11`), radio rows the same; card text 14 px, account line 12 px.

## Rule check

- Exists: `AgentCard`, `CodexSetupSection`, `AgentInstallTerminal`, `Collapsible`, `RadioGroup`, `ProviderLastChecked` (export), `RefreshIcon`, `runtimeModeConfig`, `Button` variants, `refreshProviders`, `updateSettings`.
- Additive: three rows and one footer slot; no new dependency; no new setting; every keybinding and mode keeps its meaning.
- DNA: P2, P3, P7, P8, V1, V2, V5, V7, C4, T2, D2, D4, I2, I3, M6, K10.
