# 06 Re-entry when an agent is missing, web and desktop; 1280 and 390

A user can finish or skip setup with no agent ready, remove an instance, or sign out of Claude later. Today every path ends at a disabled chip, a banner without an action, or a Providers row that says "Not found" and nothing else. Audit: F-24-05 (this file), F-09-07 (install action in Settings), F-09-20 (send button wording), F-09-22 (banner), F-10-24 (zero providers), F-10-02 (setup entry points).
One hook already feeds the chip, the banner and the model picker: `openProviderSetup` in `chat/useComposerSelection.ts:118` (`navigate({ to: "/settings/providers", search: { environmentId, instanceId } })`). The wizard already opens at its agents step from `/welcome#agents:<environmentId>` (`routes/welcome.tsx:25-27`, used by `CodexSetupSection`). The proposal connects the two; nothing new is built.

Decision rule inside `openProviderSetup` (pure, testable in `providerReadiness.logic.ts`):

- driver is `codex` or `claudeAgent`, state is `install` or `signIn`, the environment grants terminal access -> `/welcome#agents:<environmentId>` (the wizard's install and sign-in terminal, 03).
- anything else (other drivers, disabled, attention, no terminal scope, mobile web without terminal) -> today's `/settings/providers?...`.

## A. Composer with no usable agent, 1280x720 (composer region only)

```
 +--------------------------------------------------------------------------------------+
 |   +----------------------------------------------------------------------------+     |
 |   | (!) Claude Code is not signed in                                    [ x ]  |     |  <- ProviderStatusBanner
 |   |     Run claude auth login on MacBook Pro.  [ Set up agents ]               |     |     title per F-09-22,
 |   +----------------------------------------------------------------------------+     |     InlineButton action
 |   +----------------------------------------------------------------------------+     |
 |   | Ask anything. @ files, $ skills, / commands                                |     |
 |   |                                                                            |     |
 |   | [ (!) Set up an agent ]  Medium v   (unlock) Full access v        (send)   |     |  <- chip enabled
 |   +----------------------------------------------------------------------------+     |
 +--------------------------------------------------------------------------------------+
```

- Chip: today `disabled={!providerSetupInstanceId}` with the text "No provider available" (`ComposerControlsBar.tsx:255-270`). Proposed: always enabled; label "Set up an agent" when no instance exists (opens `/welcome#agents:<primaryEnvironmentId>`), "Open provider settings" when an instance exists and the rule above sends it to Settings (unchanged wording), "Set up {Name}" when the rule sends it to the wizard. `ComposerControl` unchanged.
- Banner: `InlineButton` label "Set up agents" replaces "Open provider setup" only for the wizard branch; `hasProviderSetup` is no longer the only gate (F-09-22). Title text is F-09-22's (not restated).
- Send button disabled tooltip: "Choose an available provider to send" (F-09-20).
- `#24865` edits `ComposerControlsBar.tsx` and `ChatComposer.tsx`; this change lands after it as a follow-up (see audit).

## B. Re-entered wizard on step "Agents" (re-entry shape)

```
 +------------------------------------------------------------+
 | T3 Code                                                [x] |
 | +--------------------------------------------------------+ |
 | | (v) Computers       (2) Agents           ( 3 ) Projects | |  <- chips 1 and 3 reachable (back and skip)
 | +--------------------------------------------------------+ |
 |  ... same body as 03 ...                                   |
 |------------------------------------------------------------|
 |                          [ Close ]         [ Continue  -> ] |  <- on re-entry the skip is "Close"
 +------------------------------------------------------------+
```

- On re-entry (`resumeEnvironmentId` set, onboarding already completed) the footer says `Close` and Continue reads `Done`; closing never rewrites `onboardingCompletedAt` (it is already set; `completeOnboarding` is idempotent). The projects step is skippable by the same chip.
- Behind the dialog the route renders `NoProjectsHero` today (`routes/welcome.tsx:36`) even when the user has projects: render it only when `useProjects().length === 0` (F-24-13); otherwise render nothing and let `onDone` return to the previous location (`navigate(-1)` when history exists, else `/`).

## C. Command palette, 1280x720 (palette region)

```
 +--------------------------------------------------------+
 | >  set                                                 |
 |--------------------------------------------------------|
 | [gear]       Open settings                              |  <- EXISTS (CommandPalette.tsx:1595)
 | [bot]        Set up agents                              |  <- NEW row, same row component
 | [folder-in]  Open setup                                 |  <- NEW row (F-10-02)
 +--------------------------------------------------------+
```

- Rows are the existing palette action item shape (`value: "action:setup"`, `title`, `searchTerms`, lucide `FolderInputIcon` / `BotIcon` at the shared icon class, `run: navigate(...)`). `Set up agents` -> `/welcome#agents:<primaryEnvironmentId>`; `Open setup` -> `/welcome`. `searchTerms` include "provider", "install", "sign in", "login", "claude", "codex", "import", "onboarding", "welcome".
- Row height 32 px (the sanctioned palette exception, DNA-D5). No keybinding is added (additive only); the palette is the universal entry (DNA-K14).

## D. Settings, Providers with nothing configured, 1280x720 (right pane)

```
 | Providers  +                                  Update all   Checked just now [R]  |
 | +---------------------------+------------------------------------------------+  |
 | | (empty list)              |                                                |  |
 | |  + Add provider           |                No providers configured         |  |  <- Empty size="compact"
 | +---------------------------+     Add an agent to send messages.             |  |
 |                             |     [ Add provider ]  [ Set up agents ]         |  |
 |                             +------------------------------------------------+  |
```

- Replaces the bare `p-6 text-sm` line (`ProviderSettingsPanel.tsx:1078`) with `Empty size="compact"`; `Add provider` is the existing `setIsAddInstanceDialogOpen(true)` action, `Set up agents` goes to `/welcome#agents:<environmentId>`.
- The not-installed row action ("Install {label}" with a copyable command and "Check again") is F-09-07; not redrawn.

## E. 390x844 (web at phone width)

```
+------------------------------------+
|  +------------------------------+  |
|  | (!) Claude Code is not       |  |
|  |     signed in                |  |
|  |     [ Set up agents ]    [x] |  |
|  +------------------------------+  |
|  +------------------------------+  |
|  | Ask anything. @ files, $     |  |
|  | skills, / commands           |  |
|  | [(!) Set up an agent]  (send)|  |
|  +------------------------------+  |
+------------------------------------+
```

- Touch: chip 36 px with 44 px hit area (`ComposerControl` already). The wizard terminal needs a hardware or soft keyboard; on a phone-width browser without terminal scope the rule falls back to Settings, Providers.

## F. Mobile app (native, 390 wide)

The native app has no terminal and runs no wizard. When the host reports a missing agent the thread banner should read "Claude Code is not signed in on {computer}. Sign in on that computer, then try again." with no button; this is copy only and uses the existing banner. See 07.

## Rule check

- Exists: `openProviderSetup`, `/welcome#agents:`, `ComposerControl`, `ProviderStatusBanner`, `InlineButton`, palette action shape, `Empty`, `ProviderLastChecked`.
- Additive: one branch in one hook, three labels, two palette rows, one `Empty` composition. Reverse path: Close returns where the user was (DNA-P7).
- DNA: P7, P8, V2, V3, V5, V7, D5, K14.
