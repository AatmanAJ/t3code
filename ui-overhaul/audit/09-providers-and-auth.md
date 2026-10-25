# Area 09: providers and auth (audit)

Repo `5f64c5eb`. Host: macOS, Chromium via Playwright, web build at `localhost:5733`, state dir `/tmp/t3code-overhaul`. Finding ids use the prefix `F-09-`. Screenshots are in `ui-overhaul/screens/09-providers-and-auth/` (named `09-<state>-<theme>-<WxH>.png`; paths below omit the folder). Account emails are shown as the app's own scrambled redaction or replaced with `user@example.com`; home-directory paths were rewritten to `~`; Usage cost and token figures in the Cost/Tokens captures have every digit replaced with `8`.

PR #24865 was checked (`ui-overhaul/prior-art/pr-24865.diff`, 55 files). It touches none of `components/settings/Provider*.tsx`, `components/usage/*`, `chat/ModelPicker*.tsx`, `chat/ProviderStatusBanner.tsx` or `chat/UsageLimitRecoveryBanner.tsx`. What it does touch that matters here: `settingsLayout.tsx` (section titles 16px semibold, row descriptions lose `/80` and gain `max-w-2xl text-balance`), `SettingsScopeSentence.tsx` (scope pickers become `Button variant="outline" size="sm"`), `index.css` (`--radius` 0.625rem to 0.5rem, dark `--muted-foreground` to neutral-400, dark `--border`/`--input` 8%/11%, default Lucide stroke 1.75), `ComposerPrimaryActions.tsx` (disabled send button becomes `bg-foreground/12 text-muted-foreground`), `SidebarThreadRow.tsx` (agent glyph `opacity-50 grayscale` at rest), and the rename of the two usage-limit settings to "Resume after usage limits" and "Snooze until limits reset" (web settings, settings search, mobile, `docs/user/thread-sidebar.md`). Each finding carries a `#24865:` line.

## How I used the app

- Providers page (`/settings/providers`) at 1440x900, 1280x720, 1024x640, 800x600, 3440x1440, 720x450 (200% zoom), 2880x1800 (50% zoom), 390x844 (also with touch emulation), light and dark, plus two named themes (T3 Chat, Grove).
- Created the throwaway project `provider-probe` (`/tmp/t3code-provider-probe`). Through the "Add provider" wizard I added default instances for Cursor, Grok, OpenCode, Antigravity, Muse Code and Pi (all not installed or signed out on this host) and a second Claude instance pointed at an empty `CLAUDE_CONFIG_DIR` under `/tmp` (a real installed-but-logged-out state without touching the host login). I screenshotted every card and detail pane in both themes, walked the wizard (identity and config steps, ACP registry search with results and empty state), disabled an instance, toggled Claude off for the probe project (layers popover, Reset), opened new threads in that project, and opened the model picker with one, two and project-disabled Claude instances.
- Started two zero-cost threads: one on the not-installed Grok instance (fails at session open), one on the logged-out Claude instance (fails with "Not logged in", no tokens spent). After removing the Grok instance I reproduced the `disabled for project` message with `t3 thread send`. No agent turn consumed model tokens. Two turns were started and both failed before reaching a model, so no tokens were spent (counted against the 2-turn limit).
- Usage page: Limits, Cost and Tokens at 1440, 1024 and 390; empty state by hiding every provider through the page's own browser-local preference.
- Measured with `getBoundingClientRect`/`getComputedStyle` and a canvas-composited contrast helper: row and control sizes, hit areas (touch emulation), text contrast, scroll containers, tab order.
- Did not click Install, Sign in, Update now or Update all. Did not touch Codex or Claude machine-wide.
- Restored everything: all probe instances removed (settings `providerInstances` empty again), project override reset, probe project and both probe threads removed with `project remove --force`. Verified `settings.json` in the dev state dir has no leftover instances or overrides.

## Summary

39 findings: P0 0, P1 12, P2 19, P3 8. Worst three: F-09-07 (a missing provider has no install or setup action, only a sentence with raw backticks), F-09-01 (below about 1100px wide, tapping a provider row shows nothing; the editor is hundreds of pixels below the fold), F-09-09 (the "run `claude auth login`" remedy shown for a second Claude account omits `CLAUDE_CONFIG_DIR`, so following it signs in the wrong account).

---

## Findings

### F-09-01 Selecting a provider on a narrow layout gives no visible result

- Severity: P1
- Surface: web, desktop (small windows), mobile web
- Evidence: `ProviderSettingsPanel.tsx:1047` (`@min-[48rem]/providers:grid-cols-[17rem_minmax(0,1fr)]`, below that the list and editor stack). Measured: at 1024x640 after clicking "Select Cursor" the settings scroller stays at `scrollTop 0` and the editor input `#provider-instance-cursor-display-name` sits at y=953 in a 640px viewport; at 390x844 it sits at y=1058; same at 800x600 and 720x450. The only feedback is the selected row tint `bg-muted/45` (`ProviderInstanceCard.tsx:971`). `09-providers-narrow-after-select-light-1024x640.png` (nothing changed), `09-providers-narrow-detail-light-1024x640.png` (where the editor actually is), `...-390x844.png` pair. Two-pane layout holds at 1280x720 (`09-providers-page-top-light-1280x720.png`), so the breakpoint is a viewport of about 1100px.
- Current: Below the container breakpoint the editor renders under the entire provider list. Tapping a row looks like a no-op; users must scroll past every row to find it.
- Proposed: In `EnvironmentProviderSettings` give the editor wrapper (`<div className="space-y-6 p-4">`, ProviderSettingsPanel.tsx:~1073) `id={\`provider-instance-${selectedRow.instanceId}-editor\`}`. In the `selectInstance`action, after`setSelectedInstanceId`, run `requestAnimationFrame(() => el.scrollIntoView({ block: "start" }))`only when the editor's`getBoundingClientRect().top > window.innerHeight * 0.6`(stacked layout). Add a sticky first row inside the editor shown only`@max-[48rem]/providers`: `Button variant="ghost-muted" size="xs"`with`ArrowLeftIcon` and the label "All providers" that scrolls the list into view. No new tokens.
- DNA: DNA-P3 (UI reflects state; a selection must be visible), DNA-L5 (panels degrade), DNA-X4.
- Effort: S
- Risk: `ProviderSettingsPanel.environment.browser.test.tsx` renders the panel; scrolling in tests may need a stub for `scrollIntoView`. Does not change the two-pane layout.
- Upstream-eligible: yes (small, fix-shaped).
- #24865: not addressed (provider panel untouched).

### F-09-02 Model rows collapse to "Claud…" at phone width

- Severity: P1
- Surface: web, mobile web, desktop (narrow)
- Evidence: `ProviderModelsSection.tsx:472` (`grid h-7 grid-cols-[1.5rem_minmax(0,1fr)_auto_minmax(5.5rem,auto)_auto]`). At 390x844 all 13 Claude models render as "Claud…" and are indistinguishable (`09-providers-claude-models-touch-light-390x844.png`); the row is fixed 28px tall, name is `text-xs`, and the star, up, down and switch take the rest of the width.
- Current: On a phone-width window you cannot tell which model a switch controls.
- Proposed: Below `@max-[40rem]/providers` change `ProviderModelRow` to a two-line row: `min-h-11`, line one the name in `text-sm text-foreground` (wraps, no truncate), line two the slug in `text-2xs font-mono text-muted-foreground` plus the capability labels; the right column holds only the `Switch`. Move star, "Move up" and "Move down" into a 44px `MenuTrigger` (`Button size="icon-sm" variant="ghost-muted"`, `MoreHorizontalIcon`, `aria-label="Options for {name}"`) using `components/ui/menu.tsx` items "Add to favorites", "Move up", "Move down". Desktop layout unchanged.
- DNA: DNA-X4, DNA-T3, DNA-D2, DNA-D4.
- Effort: M
- Risk: existing handlers (`onToggleFavorite`, `onMove`, `onSetHidden`) are reused; `ProviderModelsSection` has no component test, add a browser test at 390px asserting every row shows its full name.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-03 Touch targets in the provider list and model rows are below 44px or overlap

- Severity: P1 (inaccessible on touch)
- Surface: web on touch, mobile web
- Evidence: Touch emulation at 390x844, measured: model-row `Switch size="sm"` 30x18 with no `after` hit area (`ProviderModelsSection.tsx:603`); star 20x20, up and down 20x20 each with a 44x44 `::after` (`size="icon-micro"`, lines 480, 533, 549), centres 22px apart (x=254 and x=276) so the 44px areas overlap by 22px; rows are 28px apart so hit areas overlap vertically too. Provider list switch 38x22 (`ProviderInstanceCard.tsx:1036`), update icon 20x20 with a 44px `::after`. Source: `button.tsx:9` gives micro icon buttons the pseudo-element target; `Switch` does not.
- Current: The primary action in a model row (show or hide in the picker) is a 30x18 target; neighbouring micro buttons steal each other's taps.
- Proposed: Give both switch sizes a coarse-pointer hit area in `components/ui/switch.tsx` (`pointer-coarse:after:absolute pointer-coarse:after:-inset-3 pointer-coarse:after:content-['']` on the root), and in the model row stop stacking micro buttons: with F-09-02 the arrows leave the row on narrow widths; on desktop-width touch keep them but set `pointer-coarse:gap-3` so 44px areas do not overlap. Rows `pointer-coarse:min-h-11`.
- DNA: DNA-D4, DNA-K10 (the primitive owns the look, so fix it in `ui/switch.tsx` as a size behaviour, not per feature).
- Effort: S
- Risk: Switch is used app-wide; the `after` area must not capture taps from neighbours in dense settings rows. Visual regression capture at 390px for General settings.
- Upstream-eligible: yes.
- #24865: not addressed (`button.tsx` touched only for the inline picker tone).

### F-09-04 Provider list titles truncate to "Claude P…" and "Cl…"

- Severity: P1
- Surface: web, desktop
- Evidence: List column is `17rem` (`ProviderSettingsPanel.tsx:1047`); row layout `ProviderInstanceCard.tsx:970-1041` puts icon, title, version `code` (`max-w-24`), advisory icon and the right-hand controls in one row, and the title is the only shrinking item. Live: a second Claude instance named "Claude Probe" renders "Claude P…" (`09-providers-second-claude-added-light-1440x900.png`); with a project override (layers icon, reset icon, switch) the default "Claude" renders "Cl…" (`09-project-claude-off-dark-1440x900.png`, `09-project-layers-popover-light-1440x900.png`). "Muse Code" and "Antigravity" lose characters in the same row once an update icon is present.
- Current: The multi-account feature depends on names like "Codex Work" or "Claude Personal", and they are cut after about eight characters.
- Proposed: Move the version out of the title line: put `v2.1.309` first on the status line (`text-xs font-mono`, then " · Authenticated…"), keep the update icon on the title line (the only extra item, 14px). Let the title wrap to two lines (`line-clamp-2 break-words`, drop `truncate`). Move the project-override layers and reset icons from the right cluster of the list row into the editor header (`editorHeaderAction`, where they do not exist today; reuse `ProjectOverrideInheritance` and `SettingResetButton`) and keep only the switch on the right in list mode. Result: title width 272px - 32px padding - 20px icon - 12px gap - 44px switch - 12px gap = about 150px, enough for 18 characters before wrapping.
- DNA: DNA-D1 (entities get room), DNA-T9 (truncate in rows only when nothing better), DNA-P3.
- Effort: S
- Risk: `ProviderInstanceCard.test.ts` covers helpers only; add a browser test with a long display name. Row height may grow by one line (`min-h-18` is already 72px).
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-05 "Add provider" in the list has no focus ring

- Severity: P1 (keyboard focus not visible)
- Surface: web, desktop
- Evidence: `ProviderSettingsPanel.tsx:1061` uses `outline-none ... focus-visible:bg-muted/25 focus-visible:text-foreground`. Measured on the focused button: `boxShadow: none`, `outlineStyle: none`; the only indicator is a 25% muted tint. Every other control in the card uses `focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring` (e.g. `ProviderInstanceCard.tsx:983`).
- Current: Tabbing to "Add provider" shows an almost invisible change.
- Proposed: Replace the focus classes with `focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring` (keep the tint). Prefer a shared class since the same button pattern exists at the header `PlusIcon` (that one is a `Button`, fine).
- DNA: DNA-S3, DRIFT-17.
- Effort: XS
- Risk: none; visual only.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-06 The provider list is not arrow-key navigable and the editor is about 20 tab stops away

- Severity: P2
- Surface: web, desktop
- Evidence: Measured tab order from "Select Codex": Select Codex, Enable Codex, Select Claude, Update available, Enable Claude, Add provider, the editor scroll area, email toggle, accent colour. Pressing ArrowDown on a row button leaves focus on "Select Codex". With the 8-provider state in this audit, reaching the editor from the last row needs three stops per row. Rows are plain buttons (`ProviderInstanceCard.tsx:978-985`), not a roving group.
- Current: Keyboard-only users tab through every row's switch and advisory icon to reach the selected provider's editor.
- Proposed: In `ProviderSettingsPanel` list container add a `keydown` handler: ArrowUp/ArrowDown/Home/End move focus between `button[data-provider-select]` elements (add that attribute to the row select button), Enter and Space keep selecting. Add a visually hidden "Skip to {name} settings" link after the first row that focuses the editor wrapper (`tabIndex={-1}`). No change to switches.
- DNA: DNA-L8 (keyboard first), DNA-I4.
- Effort: S
- Risk: handler must ignore events from the switch and advisory buttons (`event.target.closest("[data-provider-select]")`).
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-07 A provider that is not installed has no install or setup action

- Severity: P1
- Surface: web, desktop, mobile web
- Evidence: `providerStatus.ts:62-66` returns headline "Not found" and the server message; `ProviderInstanceCard.tsx` editor renders it as the description of the "Display name" row and offers no action. Live (all six not-installed providers): `09-providers-opencode-detail-light-1440x900.png`, `09-providers-pi-detail-dark-1440x900.png` (message contains `npm install -g --ignore-scripts @earendil-works/pi-coding-agent` as plain text, clipped to "…not installed or not on…" in the list), `09-providers-muse-code-detail-light-1440x900.png`. Only Antigravity (managed runtime, `ProviderSetupSection.tsx:256-274`, button "Install Antigravity") and Cursor ("Sign in") get a Setup section (`09-providers-antigravity-detail-light-1440x900.png`, `09-providers-cursor-detail-light-1440x900.png`). The wizard already knows how to open a setup terminal with the vendor installer for Codex and Claude (`WelcomeWizard.tsx:1122,1153`), but Settings never does. With nothing installed, the page shows two red "Not found" rows for Codex and Claude and the composer shows "No provider available" or "Open provider settings" (`ComposerControlsBar.tsx:268`), a dead end.
- Current: The user is told a CLI is missing but has nothing to click, nothing to copy, and no "I installed it, check again" next to the message.
- Proposed: In `ProviderInstanceCard` editor, when `liveProvider && !liveProvider.installed && !setup`, render a `SettingsRow` in the Setup section: title "Install {label}", description "Run this on {environmentLabel}, then check again.", control a mono pill with the command (reuse the update-command pill at `ProviderInstanceCard.tsx:~944`: `rounded-md border border-border/70 bg-muted/40 py-0.5 pl-2 font-mono text-2xs`) with a `CopyIcon` button, and a `Button size="xs" variant="outline"` "Check again" that calls the page's `refreshProviders`. For Codex and Claude on a local environment add `Button size="xs"` "Open setup terminal" reusing the wizard's launcher (DNA-P8: one capability, every entry point). The command comes from a new `setup.installCommand` on `ServerProvider` (server dependency, gated); until then parse the first backtick span of `provider.message` when it starts with `npm`, `brew`, `curl` or `pip`. When every row is not installed, show an `Empty` above the list ("No agents installed on {device}", description "Install one below, or add it from Settings, Providers, Add provider.").
- DNA: DNA-V3 (say what failed, then how to proceed), DNA-P8, DNA-P2.
- Effort: M
- Risk: server field is a contract change (`packages/contracts/src/server.ts`); the parse fallback is brittle but isolated; remote environments must not offer the terminal unless the wizard rule allows it. Covered by `providerStatus.test.ts` for the parser (add).
- Upstream-eligible: yes for the UI chunk with the parse fallback; the contract field is a separate server PR.
- #24865: not addressed.

### F-09-08 Raw backticks are shown in every provider status message

- Severity: P2
- Surface: web, desktop, mobile web
- Evidence: Server messages contain Markdown backticks and the UI prints them literally: "Grok CLI (`grok`) is not installed or not on PATH." in the list (`09-providers-page-top-light-1024x640.png`), editor (`09-providers-muse-code-detail-light-1440x900.png`: "Run `muse login` on this T3 server host"), `ProviderStatusBanner` (`09-thread-grok-not-installed-light-1440x900.png`), the model-picker tooltip and its `aria-label` ("OpenCode: Unavailable. OpenCode CLI (`opencode`) is not installed…", `ModelPickerSidebar.tsx:14-26`), and the picker pane (`ModelPickerContent.tsx:208`).
- Current: Commands look like typos; screen readers read "grave accent".
- Proposed: Add `ProviderMessage` (`components/settings/ProviderMessage.tsx`): split the string on /`([^`]+)`/, render matches as `<code className="rounded-sm bg-muted/60 px-1 font-mono text-[0.92em] text-foreground">`, return plain text for `aria-label`by stripping backticks. Use it in`ProviderInstanceCard`(list line clamp,`editorStatusNode`), `ProviderStatusBanner`, `ModelPickerContent`, `ModelPickerSidebar`tooltip and label.`text-[0.92em]`is not on the allowed list of`shadcn/no-arbitrary-values`; use the existing inline-code token `text-xs`in 14px contexts and`text-2xs` in 12px contexts instead.
- DNA: DNA-T7 (mono is for machine-typed values), DNA-V3.
- Effort: S
- Risk: truncation (`line-clamp-2`) must still clip correctly across the code spans; add a unit test for the splitter.
- Upstream-eligible: yes.
- #24865: not addressed (model picker and provider cards untouched).

### F-09-09 The shown re-auth command signs in the wrong account for a custom config directory

- Severity: P1
- Surface: web, desktop
- Evidence: A second Claude instance with `CLAUDE_CONFIG_DIR=/tmp/t3code-provider-probe/claude-cfg` shows "Claude Code is not authenticated. Run `claude auth login` and try again." in the card (`09-providers-second-claude-added-light-1440x900.png`), the in-thread banner "Claude Probe is unauthenticated" and the picker tooltip; the thread error row for the same state says the correct thing ("run `claude auth login` … with CLAUDE_CONFIG_DIR set to …", `09-thread-claude-logged-out-light-1440x900.png`). `docs/user/providers-claude.md` requires the same variable for the login command. Related: #22816 (macOS reports "Not authenticated" when the credential comes from a shell-profile variable).
- Current: Three surfaces tell the user to run a command that authenticates the default config directory, not the instance they are looking at.
- Proposed: For `driver` Claude and Codex, when `auth.status === "unauthenticated"` and the instance config has `homePath` (Claude: `CLAUDE_CONFIG_DIR`; Codex: `CODEX_HOME`, shadow home for Codex shared-home), render a copyable command under the status in the editor and in `ProviderStatusBanner`: `CLAUDE_CONFIG_DIR="<path>" claude auth login` (POSIX) or the `set`/`$env:` form chosen from `environment.platform.os`. Reuse the command pill from F-09-07. Keep the server message as the fallback. The long-term fix is in the server message builder (dependency).
- DNA: DNA-V3, DNA-P3 (a label that sends you to the wrong account lies).
- Effort: S
- Risk: shell quoting for paths with spaces; add unit tests for the formatter (POSIX and Windows).
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-10 The provider status sentence lives inside the "Display name" row

- Severity: P2
- Surface: web, desktop
- Evidence: `ProviderInstanceCard.tsx:1102-1130` passes `editorStatusNode` as the `status` of `SettingsRow title="Display name"`. A screen reader reads "Display name, Not found, Antigravity is not installed…". Wrapping puts the separator on its own line: "• Not found" then "· Antigravity is not installed. Install it in this environment or set a custom executable path." (`09-providers-antigravity-detail-light-1440x900.png`, `09-providers-muse-code-detail-light-1440x900.png`).
- Current: The most important fact about the provider is a caption under a text field, and the " · " joiner can start a line.
- Proposed: Add a first row `SettingsRow title="Status"` whose control column shows the dot plus headline (`text-sm font-medium`) and whose description is the detail as its own `<p>` (so no joiner). Keep "Display name" as a plain row. Authenticated state: headline "Signed in", description "Signed in as {redacted email} · {plan}".
- DNA: DNA-L6 (row = title, description, control), DNA-V5.
- Effort: S
- Risk: `ProviderSettingsPanel.environment.browser.test.tsx` may assert the old text location.
- Upstream-eligible: yes.
- #24865: not addressed (description wrapping `text-balance` only affects descriptions, not this `status` slot).

### F-09-11 List status text is 3.2:1, and disabled rows fall to about 1.9:1

- Severity: P2
- Surface: web, desktop
- Evidence: `ProviderInstanceCard.tsx:998` `text-xs ... text-muted-foreground/80`. Measured (canvas composite): 3.22:1 light, 3.49:1 dark for the 12px status line. Unselected disabled rows add `opacity-60` (`:977`, restored on hover); computed from the same colours that is about 1.9:1 for the word "Disabled", the only status text (`09-providers-instance-disabled-light-1440x900.png`). DRIFT-1.
- Current: Below the DNA floor for 12px text (4.5:1, muted 4.7/5.08).
- Proposed: Use `text-muted-foreground` (4.71 light, 5.08 dark), no opacity modifier. For unselected disabled rows drop the whole-row `opacity-60` and instead dim only the icon and title (`opacity-60` on those two) while the status stays `text-muted-foreground`. Same fix for the version `code` if it ends up below 4.7 in themed palettes.
- DNA: DNA-C4, DNA-C5, DRIFT-1.
- Effort: XS
- Risk: row text gets visually heavier; check the 8-row list screenshot.
- Upstream-eligible: yes.
- #24865: partial (it removes `/80` from `SettingsRow` descriptions and raises dark `--muted-foreground` to neutral-400, which lifts dark to about 4.3:1 here, but the provider list line is a local class and is untouched).

### F-09-12 A provider still being checked is shown with a warning dot

- Severity: P2
- Surface: web, desktop
- Evidence (code-read): `providerStatus.ts:43-46` `getProviderStatusKey` returns `provider?.status ?? "warning"`, and `getProviderSummary(undefined)` returns the headline "Checking provider status" with detail "Waiting for the server to report installation and authentication details." The list draws an amber dot for `warning` (`ProviderInstanceCard.tsx:~797`). Related: #24527 (desktop startup briefly warns about Codex before the first check completes). Not captured live: the snapshot arrives faster than I could screenshot it.
- Current: Loading looks like a problem.
- Proposed: Return `"neutral"` for `provider === undefined` and render a 12px `Spinner size="sm"` instead of the dot in that state (DNA-M6, no looping CSS: the shared Spinner is visibility-aware).
- DNA: DNA-P3, DNA-M9, DNA-C6.
- Effort: XS
- Risk: `providerStatus.test.ts` asserts the key; update it.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-13 "Update available" is an icon with a generic popover

- Severity: P2
- Surface: web, desktop
- Evidence: The only list-level cue is a 14px `ArrowUpCircleIcon` next to the version (`ProviderInstanceCard.tsx:~809-835`, 20x20 button). The popover (`09-update-available-popover-light-1440x900.png`) says "Install the update now or review provider settings." (server text, shown while already in provider settings), never states current and latest version, and uses a 10px uppercase divider "OR, UPDATE MANUALLY USING" (`:932`, `text-3xs uppercase tracking-wider`; DNA-T10 allows uppercase only for page eyebrows and table headers). The manual command is the full resolved path (`~/.local/bin/claude update` after my scrub; in the app it includes the user's home directory). It also opens leftwards over the settings nav because the trigger sits in a 17rem column.
- Current: Users who scan the list for "what needs updating" see a tiny glyph.
- Proposed: In the list status line append a text token "Update available" (`text-xs text-update-foreground`; `--update` already exists, DNA-C6 "update = primary") when `versionAdvisory` is present. In the popover: title "Claude {current} to {latest}" using `getProviderVersionLabel`, body from the advisory only when it is not the stock server sentence, divider text "or update manually" in `text-2xs normal-case tracking-normal`, and open with `side="right" align="start"`. Keep the command and copy button.
- DNA: DNA-C6, DNA-T10, DNA-V5.
- Effort: S
- Risk: `providerStatus.test.ts` covers the presentation helper; extend it.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-14 "Update all" updates every connected device but sits on a one-device card

- Severity: P2
- Surface: web, desktop
- Evidence (code-read; this host has one device): `ProviderUpdatesAction.tsx:20-34` builds `machines` from all connected `useEnvironments()`, while the header it renders in (`ProviderSettingsPanel.tsx:1003`) belongs to the single selected device (the page forces `singleEnvironment`, `docs/user/project-settings.md`). The button label is "Update all" with a hover-only tooltip listing machines; it runs immediately with no count and no confirm. Not clicked.
- Current: On a two-device setup, pressing it from "Applying settings for on MacBook Pro" also updates the other machine's CLIs.
- Proposed: In the Settings placement pass `environmentId` and filter `machines` to it; label "Update all (2)" with the count; keep the all-devices behaviour for the sidebar update pill (`SidebarProviderUpdatePill`). Add the count to the button as `tabular-nums`.
- DNA: DNA-P3, DNA-P8.
- Effort: XS
- Risk: `useProviderUpdates` is shared with the sidebar; add an optional `environmentId` argument, default unchanged.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-15 Deleting an instance and resetting a default instance are immediate and unrecoverable

- Severity: P1
- Surface: web, desktop
- Evidence: Clicking the trash button (`ProviderInstanceCard.tsx:1062-1070`, `aria-label="Delete instance {id}"`) removed the row within 350ms with no dialog (checked for `alertdialog`/`dialog`: none). Reset on a default instance (`aria-label="Reset {name} provider settings to default"`) behaves the same. Both call `persistProviderInstance({operation: "remove"})`, which drops the binary path, launch args, environment variables (sensitive values are stored in the server secret store and are redacted client-side, so an undo cannot restore them), custom models and accent colour. The delete and reset handlers only report failures (`ProviderSettingsPanel.tsx:852-870`, `888-900`); there is no success feedback or undo.
- Current: One mis-click on a 24px icon next to the version loses an account configuration, including API keys.
- Proposed: Use `AlertDialog` (already used by the Usage reset credit dialog, `UsageLimits.tsx:280`). Delete: title "Delete {displayName}?", description "Threads that used it keep their history but cannot send until you choose another provider. Its environment variables and custom models are removed.", confirm `Button variant="destructive"` labelled "Delete instance", cancel "Cancel" (DNA-V2: the confirm names the action). Reset: confirm only when the instance has environment variables or custom models, same dialog, confirm "Reset to defaults". Trivially empty instances stay instant.
- DNA: DNA-P7, DNA-V2, DRIFT-13.
- Effort: S
- Risk: the `ConfirmDialogHost` is the repo's generic dialog and has the "Confirm" label problem (DRIFT-13); use `AlertDialog` directly to control the label.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-16 Runtime and environment edits give no "applies to new sessions" note

- Severity: P3
- Surface: web, desktop
- Evidence: `DraftInput onCommit` persists on blur (`ProviderInstanceCard.tsx` runtime fields); no confirmation, no scope note. #19025: "Changing a provider instance's settings doesn't reach its live sessions". `Runtime` and `Environment` sections have no description line (`SettingsSection title="Runtime"`).
- Current: After changing Binary path, a user cannot tell whether the running thread uses it.
- Proposed: Add a one-sentence description to the Runtime and Environment sections: "Changes apply to new sessions. Threads that are already running keep their current settings." (`text-xs text-muted-foreground`, same slot as other section descriptions, sentence ends with a period, DNA-V5).
- DNA: DNA-V5, DNA-P3.
- Effort: XS
- Risk: copy must be true; confirm with the #19025 fix and drop the second sentence once live sessions restart.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-17 Under a project scope the page says "Applying settings for {project}" but only the enable switch is per project

- Severity: P1
- Surface: web, desktop
- Evidence: `routes/_chat.settings.providers.tsx:16-27` passes `projectIds` and `scoped`; only the list switch honours it (`ProviderInstanceCard.tsx:723-728`). With "provider-probe" selected the Codex editor still shows fully editable Binary path, Environment variables and Models (`09-project-claude-off-dark-1440x900.png`). `docs/user/project-settings.md` states that providers are per machine and only the switch is per project.
- Current: The header sentence promises project-scoped edits; a user who edits Codex's launch arguments "for this project" changes the device.
- Proposed: In project scope render a one-line note at the top of the editor (`text-xs text-muted-foreground`): "Only the switch is per project. Everything below applies to {environmentLabel} for every project." Optionally `SettingInheritance`-style marker: reuse `LayersIcon` with tooltip "Device setting". No behaviour change.
- DNA: DNA-P3, DNA-V5.
- Effort: XS
- Risk: none functionally.
- Upstream-eligible: yes.
- #24865: not addressed (it restyles the scope pickers and hides default inheritance markers, but this page never used them).

### F-09-18 A provider turned off for a project disappears from the picker and the draft silently switches provider

- Severity: P2
- Surface: web, desktop
- Evidence: With Claude off for `provider-probe`, a new draft there opens on "GPT-5.6-Terra" and the picker rail lists Codex, Cursor, OpenCode but no Claude (`09-draft-project-claude-off-light-1440x900.png`, `09-draft-project-claude-off-picker-light-1440x900.png`). `describeUnavailableInstance` has a "Disabled in settings." string (`ModelPickerSidebar.tsx:17-19`) but disabled entries never reach the rail (`isProviderInstancePickerVisible` is `entry.enabled`, `providerInstances.ts:63`; the same applies to a device-disabled instance, code-read). Related: #23236 (picker opens empty Favorites after disabling a provider and leaves its favourites inaccessible).
- Current: A user whose default is Claude gets a different agent with no explanation and no way to find out why Claude is missing.
- Proposed: Keep the instance in the rail, `isDisabled`, with tooltip and `aria-label` "Claude is turned off for provider-probe. Change it in Settings, Providers." and a pane (when focused or clicked, see F-09-27) with `Button size="xs" variant="outline"` "Open provider settings" linking to `/settings/providers?project=…&machine=…`. When the draft falls back, show an anchored one-time info toast "Claude is off for this project. Using GPT-5.6-Terra." (area 12 owns the toast mechanics).
- DNA: DNA-P3, DNA-V3, DNA-P8.
- Effort: M
- Risk: touches `applyProviderInstanceSettings` (`providerInstances.ts:121`) and `isProviderInstancePickerVisible` (`:63`, returns `entry.enabled`); `providerInstances.test.ts` covers them.
- Upstream-eligible: yes.
- #24865: not addressed (picker untouched).

### F-09-19 `Provider instance "x" is disabled for project <uuid>` is raised when the instance does not exist

- Severity: P1
- Surface: all (CLI, MCP, UI)
- Evidence: `ThreadManagementService.ts:287-296` message; guard `ThreadManagementService.ts:540-556` uses `resolveProjectProviderInstanceEnabled` (`packages/contracts/src/settings.ts:1308-1324`), which returns `isUnconfiguredDefaultInstanceEnabled(instanceId)` (true only for `codex` and `claudeAgent`) for any id absent from `providerInstances`. Reproduced: removed the `grok` instance, then `t3 thread send mcp:… "ping"` printed `Provider instance "grok" is disabled for project 1a8a03a9-64b7-46f3-ae53-d06a50d667c7.` The instance was never disabled, and the project is shown as a UUID. Same message for any unconfigured default such as `opencode` before it is added. The error reaches the client verbatim (`ws.ts:2145-2151`). #15992 shows the same family: hidden or missing models used by delegated agents.
- Current: The text points the user at a project switch that does not exist.
- Proposed (server dependency, gated): add `ThreadManagementProviderInstanceMissingError` and raise it when `!Object.hasOwn(settings.providerInstances, id)` and the id is not a built-in default; messages: missing, `Provider "grok" is not set up. Add it in Settings, Providers.`; disabled, `Provider "grok" is turned off for {project title}. Turn it on in Settings, Providers.` using the project title, never the UUID. UI part (ungated): map both tags in the send and launch error path to an inline `ThreadErrorBanner` with a `InlineButton` "Open provider settings" (route `?instanceId=`).
- DNA: DNA-V3, DNA-V4 (one error prefix), DNA-P3.
- Effort: S (server) + S (UI)
- Risk: `ThreadLaunchService.test.ts:1419,2233` and `ProviderContinuationService.test.ts` assert the existing tag; add the new tag to the same tables. Rule 4: apps/server edits are a dependency, not part of the UI overhaul.
- Upstream-eligible: yes (server message fix is a small bug fix).
- #24865: not addressed.

### F-09-20 With no usable provider the send button says "Environment disconnected" and Enter does nothing

- Severity: P1
- Surface: web, desktop, mobile web
- Evidence: `ChatComposer.tsx:3825-3829` passes `isEnvironmentUnavailable={environmentUnavailable !== null || noProviderAvailable || projectSelectionRequired}`; `ComposerPrimaryActions.tsx:289-290` turns that into `aria-label`/tooltip "Environment disconnected". Live (Grok instance removed, thread open): send button is `disabled` at `opacity 0.64` with `aria-label="Environment disconnected"`; typing "second try" and pressing Enter sends nothing and shows no message (`ChatComposer.tsx:3113` returns silently when `noProviderAvailable`) (`09-thread-grok-instance-removed-send-ignored-light-1440x900.png`). The only hint is the footer control "Open provider settings" replacing the model picker (`ComposerControlsBar.tsx:253-269`).
- Current: Wrong name, wrong tooltip, silent key press.
- Proposed: Extend `sendDisabledReason` in `ChatComposer`: `noProviderAvailable` returns "Choose an available provider to send", `projectSelectionRequired` returns "Choose a project to send"; keep "Environment disconnected" for `environmentUnavailable !== null` only. On Enter when blocked, show an anchored toast (area 12 mechanics) "Provider unavailable" with action "Open provider settings", and keep the draft text.
- DNA: DNA-P3, DNA-V3.
- Effort: S
- Risk: `ComposerPrimaryActions` tests; #24865 edits the same files, so land as a follow-up after it merges.
- Upstream-eligible: yes, after #24865 merges (shares `ComposerPrimaryActions.tsx`).
- #24865: partial (the disabled send button becomes a grey `bg-foreground/12` pill instead of 64% blue, which answers "looks enabled" but not the wrong label or the silent Enter).

### F-09-21 The thread shows a raw provider session id instead of the cause

- Severity: P1
- Surface: all
- Evidence: Thread on the not-installed Grok instance: error banner and timeline row read "Failed to open grok provider session provider-session:provider-instance:grok:thread:mcp%3A9d1eaa16-544f-4ae5-ad2d-8f20fca9a55c:3345c665-378b-4434-a40e-c608f6858507." (`09-thread-grok-not-installed-light-1440x900.png`, dark twin). The actual reason ("Grok CLI is not installed or not on PATH") appears only in the separate provider banner. The row title "Provider session failed to open" is the generic fallback. Sidebar pill says "Failed".
- Current: A URL-encoded internal id is the user-facing description.
- Proposed: In `ThreadErrorBanner` (and the timeline row component), when the thread's provider instance snapshot is available, replace the description with the snapshot's reason via `getProviderStatusMessage` (renders through `ProviderMessage`, F-09-08) and keep the raw string behind the existing "Show full error" disclosure; add `InlineButton` "Open provider settings" for providers with an instance id. Title: "Could not start {Provider}". Server follow-up: do not interpolate the session id into `message` (dependency).
- DNA: DNA-V3, DNA-V4.
- Effort: S
- Risk: `ThreadErrorBanner.test.tsx`; area 03 owns timeline rows, coordinate.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-22 Provider status banner: generic title, overlaps the first timeline row, no action for most providers

- Severity: P2
- Surface: web, desktop
- Evidence: `ProviderStatusBanner.tsx:104-109` titles are "{Name} is unauthenticated", "{Name} {version} is known to be broken|unsupported", else "{Name} provider status" (so "Grok provider status" for a missing CLI). Lane is `chat-banner-lane pointer-events-none absolute top-0 z-30` (`ChatBannerLane.tsx:42`) so banners float over the timeline: in `09-thread-grok-not-installed-light-1440x900.png` the banner hides the heading "Provider session failed to open", and in `09-thread-claude-logged-out-light-1440x900.png` it covers "Not logged in · Please run /login". Two red alerts stack for one fault. The action is `hasProviderSetup(status)` only (`:130`), true for Antigravity and providers with `setup.canAuthenticate/canInstall`; Claude and Grok showed no button in the live captures; the gate is `hasProviderSetup`, true only for Antigravity and providers that advertise `setup.canAuthenticate` or `setup.canInstall`.
- Current: Banner says little, hides content, and offers nothing to click.
- Proposed: Titles by state: not installed "{Name} is not installed", unauthenticated (keep), error "{Name} is unavailable", warning "{Name} needs attention". Show "Open provider settings" (`InlineButton`) for every provider with an instance id, not only those with in-app setup (`onOpenProviderSetup` already exists). Make the timeline reserve the lane height: set a CSS variable `--chat-banner-lane-height` from a `ResizeObserver` helper (`lib/observeResize.ts`, per the no-raw-resize-observer rule) and add it as `padding-top` of the timeline scroller; alternatively render the lane in flow above the timeline. Suppress the provider banner when a thread error already carries the same message (see F-09-21).
- DNA: DNA-V3, DNA-P6 (compose slots), DNA-C11.
- Effort: M
- Risk: banner lane layout is shared with `ThreadErrorBanner`; scroll anchoring in `MessagesTimeline` must not jump. Area 03 coordinates.
- Upstream-eligible: yes for titles and the action; the layout change is separate.
- #24865: not addressed.

### F-09-23 Model slugs, capability labels and "custom" tags are 2.7:1 at 11px

- Severity: P2
- Surface: web, desktop
- Evidence: `ProviderModelsSection.tsx:505,518,521` use `text-2xs text-muted-foreground/70`. Measured: 2.74:1 light, 3.02:1 dark (`code` is 11px, `font-mono`). Names are `text-xs text-foreground/90` (fine). DRIFT-1.
- Current: Slugs, which users copy and compare against docs, are the faintest text on the page.
- Proposed: `text-muted-foreground` (4.71/5.08) for slug, capability labels and the custom tag; keep size `text-2xs`. Differentiate by weight/mono, not opacity (DNA-C4).
- DNA: DNA-C4, DNA-C5, DRIFT-1.
- Effort: XS
- Risk: row looks busier; check with 13 models.
- Upstream-eligible: yes.
- #24865: not addressed (dark muted rises, so dark improves to about 3.6:1 at /70, still under 4.5:1).

### F-09-24 "Disable all" hides models from the picker, it does not disable them

- Severity: P2
- Surface: web, desktop
- Evidence: Bulk button reads "Disable all" or "Enable all" (`ProviderModelsSection.tsx:320`); each row switch is labelled "Show {name} in the model picker" (`:608`); the group header says "Hidden from picker" (`:370`); the tooltip says "Hidden from picker"/"Shown in picker". #15992: delegated agents can still use models hidden here.
- Current: Three vocabularies for one state, and the bulk wording promises more than it does.
- Proposed: Rename bulk to "Hide all" and "Show all" and add the tooltip "Hidden models stay available to agents that name them." (true today, and it makes #15992 visible until fixed). Section description: "Switches choose which models appear in the model picker."
- DNA: DNA-V7, DNA-V5, DNA-P3.
- Effort: XS
- Risk: copy only; `docs/user` mentions? check `providers-acp.md` "Custom models" wording.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-25 Settings, Models has no legacy, new or update-required markers

- Severity: P3
- Surface: web, desktop
- Evidence: The picker groups "Legacy models (9)" and shows a "NEW" badge on Claude Haiku 5.5 (`09-model-picker-claude-legacy-open-light-1440x900.png`); `updateRequiredModels` renders only in the picker (`ModelPickerContent.tsx:703-709`). The Settings list is flat (`09-providers-claude-scroll900-light-1440x900.png`, 13 rows, no grouping); `grep updateRequiredModels` finds no use under `components/settings`.
- Current: A user managing which models show cannot see which are legacy or need a newer CLI.
- Proposed: Add a `text-2xs text-muted-foreground` tag after the slug: "legacy" (from the catalog flag the picker already uses, `isLegacy`) and "needs Claude Code 2.2" for entries in `provider.updateRequiredModels` (copy from `formatProviderUpdateRequiredNotice`), and group legacy rows under a "Legacy" group label like "Hidden from picker".
- DNA: DNA-P3, DNA-P8 (same state visible in both places).
- Effort: S
- Risk: `deriveProviderModelsForDisplay` drops fields; pass the flags through.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-26 The picker's "update required" link opens Providers without selecting the provider

- Severity: P2
- Surface: web, desktop
- Evidence: `ModelPickerContent.tsx:230-237` `navigate({ to: "/settings/providers" })` while `onOpenProviderSetup(entry.instanceId)` (used one block above) preselects through the route's `instanceId` search (`routes/_chat.settings.providers.tsx:32-38`). Notice copy: "Update {Claude Code} to v{x} or newer to use {models}." (`packages/client-runtime/src/providerUpdateRequiredModels.ts:33`).
- Current: The notice says which provider to update and then opens the first row.
- Proposed: Navigate with `search: { instanceId: notice.instanceId }`, and name the link "Update {Provider}" instead of "Provider settings". On landing, scroll the advisory popover trigger into focus (F-09-13).
- DNA: DNA-P8, DNA-V2.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-27 The picker's pane for an unavailable provider has no heading, and greyed rails cannot be focused

- Severity: P2
- Surface: web, desktop, mobile web
- Evidence: Selecting Cursor in the rail shows only "Sign in with Cursor or add CURSOR_API_KEY in provider settings." (12px, `text-muted-foreground`, `line-clamp-3`) and a small "Open provider setup" `InlineButton` (`09-model-picker-cursor-unavailable-dark-1440x900.png`, `ModelPickerContent.tsx:208-219`). OpenCode, Muse Code and Pi rails are `disabled` (opacity 0.5, `ModelPickerSidebar.tsx:158-171`), the reason exists only in the tooltip and `aria-label`; the code passes `focusableWhenDisabled={!isDisabled}`, which makes disabled rails unfocusable (inverted). Touch cannot show a tooltip.
- Current: Keyboard and touch users cannot find out why a provider is greyed out or how to fix it.
- Proposed: Pane heading `<p className="text-sm font-medium">{displayName} is not signed in|not installed|unavailable</p>` above the message, `ProviderMessage` (F-09-08), and `Button size="xs" variant="outline"` "Open provider settings" for every provider (not only those with in-app setup). Make unavailable rails selectable (`aria-disabled`, `focusableWhenDisabled` true, never `disabled`) so the pane is reachable; keep the 50% opacity.
- DNA: DNA-X4, DNA-I4, DNA-V3.
- Effort: M
- Risk: Area 04 owns picker mechanics; coordinate so selection of an unavailable rail does not select a model (`ModelPickerContent` already blocks model choice for unavailable instances).
- Upstream-eligible: yes.
- #24865: not addressed (picker files untouched; its composer control restyle does not reach `ModelPickerSidebar`).

### F-09-28 Error text in provider forms is 3.8:1 in light mode at 11 to 12px

- Severity: P2
- Surface: web, desktop
- Evidence: 12 sites use `text-destructive` (base red) instead of the foreground role: `ProviderModelsSection.tsx:425`, `CustomModelEditor.tsx:362`, `ProviderAuthenticationSection.tsx:464`, `ProviderSetupSection.tsx:312`, `ProviderAuthTerminal.tsx:73`, `AddProviderInstanceDialog.tsx:489,504,581` (two at `text-2xs`), `UsagePriceOverrides.tsx:435,579`, `UsagePage.tsx:1394`. Measured on the custom-model error "Enter a model slug.": 3.78:1 light, 5.48:1 dark (`09-custom-model-empty-error-light-1440x900.png`). DNA token: `--destructive-foreground` is 6.26 light (DNA 2.7).
- Current: Error copy fails the 4.5:1 floor in light mode.
- Proposed: Replace `text-destructive` with `text-destructive-foreground` at these sites (and `text-warning` text with `text-warning-foreground` where it carries words, for example `ProviderInstanceCard.tsx` update problem text).
- DNA: DNA-C5, DNA-C6.
- Effort: XS
- Risk: none; visual only.
- Upstream-eligible: yes.
- #24865: not addressed (it darkens diff tokens, not form errors).

### F-09-29 Two accounts of one driver look the same, and the disambiguating badge is 8px

- Severity: P2
- Surface: web, desktop
- Evidence: With a second Claude instance, list rows are identical except the name (same glyph, same "Authenticated · Claude Max Subscription"). `ProviderInstanceIcon.tsx:135,140` draws an initials badge at `text-4xs` (8px) or `text-5xs` (7px, settings and picker) and, because it keys off the number of instances of a driver, every Claude thread row in the sidebar gets a tiny "CL" while the second gets "CP" (`09-model-picker-two-claude-light-1440x900.png`, `09-thread-claude-logged-out-light-1440x900.png`). Email is hidden by default in the list; the account is only visible in the editor.
- Current: Which account a thread uses is a 7 to 8px glyph.
- Proposed: (a) When a second instance of a driver is created, assign it the next free accent colour in `AddProviderInstanceDialog.handleSave` (`ProviderAccentColorPicker` presets), so the dot is colour-coded; (b) in the list row add the auth label plus the redacted initials, for example "Authenticated · Max · jp" (reuse `accountInitials` from `UsageLimitsPooled.tsx:68`); (c) keep the badge only when no accent exists. Do not enlarge the sidebar glyph (DNA-K1).
- DNA: DNA-I6, DNA-I2, DNA-K1.
- Effort: M
- Risk: touches `providerInstances.ts` badge logic; sidebar row layout is DNA-K1 do-not-touch, so only the badge content changes.
- Upstream-eligible: yes.
- #24865: not addressed (note: it greys sidebar agent glyphs at rest, `opacity-50 grayscale`, which removes the brand colour as an account cue and makes the badge the only one).

### F-09-30 "Add provider" step 1 cannot say which providers are installed

- Severity: P3
- Surface: web, desktop
- Evidence: `AddProviderInstanceDialog.tsx:397-440` lists eight providers as identical radio cards (`09-add-provider-step1-light-1440x900.png`); the result of picking an uninstalled one is a red "Not found" card afterwards. Default instances of disabled drivers are not probed, so the client has no data before the instance exists.
- Current: Add, then discover.
- Proposed (gated on a server probe): `ServerProvider` snapshots for not-yet-added drivers with only `installed` and `version` (a `which` check, no auth, no session, per `docs/internals/providers.md` "Setup must not happen as a health-check side effect"). Card caption `text-2xs text-muted-foreground`: "Found, v1.14.19" or "Not found on {device}".
- DNA: DNA-P3, DNA-P2.
- Effort: M (client S + server S)
- Risk: server dependency; keep the dialog functional without the data.
- Upstream-eligible: no (feature-shaped, needs a contract field).
- #24865: not addressed.

### F-09-31 The Add provider dialog changes height and position between steps

- Severity: P3
- Surface: web, desktop
- Evidence: Step 1 is about 820px tall (top y=40), the Identity step about 440px (top y=228), Config similar (`09-add-provider-step1-light-1440x900.png`, `09-add-provider-step2-identity-cursor-light-1440x900.png`). `WizardPanel holdHeight` only holds during registry loading (`AddProviderInstanceDialog.tsx:~385`).
- Current: Back and Next make the dialog jump vertically.
- Proposed: Anchor the popup top instead of centring (`WizardPopup` `top-[6vh] translate-y-0`) or give the panel a `min-h` equal to step 1 on desktop widths only.
- DNA: DNA-M3, DNA-M1.
- Effort: XS
- Risk: `ui/wizard.tsx` is shared with the welcome wizard (area 10); limit the change to a prop.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-32 The in-app sign-in terminal ignores the terminal font settings

- Severity: P3
- Surface: web, desktop
- Evidence: `ProviderAuthTerminal.tsx:36` `font: { size: 13 }`, height fixed `h-64` (`:70`). The thread terminal drawer reads `terminalFontOptions(terminalFontFamily, terminalFontSize)` (`ThreadTerminalDrawer.tsx:515-638`); the setting range is 8 to 20, default 12 (DNA 3.2). Code-read only: sign-in methods that open the terminal were not triggered (they change host logins).
- Current: A user with a 16px terminal setting gets 13px here.
- Proposed: Read the same two client settings and pass `terminalFontOptions(family, size)`; keep `h-64`.
- DNA: DNA-K11, DNA-T4.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-33 On phone width the Usage header shows "Usage / A… / A…"

- Severity: P2
- Surface: web, mobile web
- Evidence: At 390x844 the environment and provider filters truncate to "A…" (All environments, All providers) beside the metric and window selectors (`09-usage-limits-light-390x844.png`, `09-usage-cost-light-390x844.png`). Source: `UsagePage.tsx:361` (`WorkspaceBreadcrumb ariaLabel="Usage breadcrumb"`).
- Current: The two filters that decide whose data you are seeing cannot be read.
- Proposed: Below 640px render the two filters as a second header row under the title (`flex flex-wrap gap-2 px-3 pb-2`) as `Button variant="outline" size="sm"` pills with full labels ("All environments", "All providers") that open the existing menus; drop the "/" separators at that width.
- DNA: DNA-X4, DNA-T9, DNA-L4.
- Effort: S
- Risk: `UsagePage` has `usagePagePreferences.test.ts` only for prefs; add a browser test at 390px.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-34 Usage empty states are a bare sentence or a $0.00 hero

- Severity: P2
- Surface: web, desktop
- Evidence: Limits with nothing to show: "No provider on the selected environments reports subscription limits." as one `text-sm text-muted-foreground` line (`UsageLimitsPooled.tsx:612-615`, `09-usage-limits-empty-light-1440x900.png`). Cost with no activity: the full layout with a "$0.00" hero, empty chart, zeros in Totals and "No activity in this window." in the table (`09-usage-cost-empty-light-1440x900.png`, digits masked). The filter label becomes "No providers".
- Current: No next step; the page looks broken rather than empty.
- Proposed: Use the `Empty` primitive (`EmptyMedia variant="icon"` with `GaugeIcon`, `EmptyTitle`, `EmptyDescription`, `EmptyContent` with a `Button size="sm" variant="outline"` linking to Settings, Providers). Limits: title "No limits to show", description "Sign in to Codex, Claude Code, Cursor, Grok Build or Antigravity to see subscription allowances." Cost and Tokens when `sessions === 0`: title "No activity in this window", description "Run a thread, or choose a longer window." Replace the whole body, not just the table.
- DNA: DNA-ID3 (one line, obvious), DNA-V5, DNA-P8.
- Effort: S
- Risk: `Empty` is used elsewhere (ProviderSettingsPlaceholder); no new component.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-35 On Limits the window selector is disabled with no explanation

- Severity: P3
- Surface: web, desktop
- Evidence: On Limits the four window buttons (Past 24h, 7 days, 30 days, 90 days) are `disabled`, `opacity .64`, `pointer-events none`, with "30 days" still shown selected (`09-usage-limits-light-1440x900.png`). Docs: no effect on Limits.
- Current: A selected-looking control that cannot be used.
- Proposed: Hide the window group when `metric === "limits"` (`UsagePage.tsx` header), or wrap it in a `Tooltip` "Limits show current allowances".
- DNA: DNA-P3.
- Effort: XS
- Risk: keyboard shortcuts for windows stay no-ops on Limits (documented).
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-36 Limits bars have no key for the hatched region or the tick

- Severity: P3
- Surface: web, desktop
- Evidence: `UsageLimitsPooled.tsx:385-395` draws a 2px `bg-foreground` tick ("Even pace") and a hatched strip (`repeating-linear-gradient(135deg …)` at `opacity-20`) for what the next reset restores; meanings exist only in a hover popover (`:193` "Even pace: X% left by now") and `docs/user/usage.md`. 10px index numerals inside bars at narrow width (`text-3xs`).
- Current: Unexplained marks on the main Limits visual.
- Proposed: One footnote line under the last pool, `text-2xs text-muted-foreground`: "Tick: where an even pace would be. Hatched: what the next reset restores." (sentence case, ends with a period); keep popovers.
- DNA: DNA-V5.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-09-37 Usage uses its own raw hex provider colours

- Severity: P3
- Surface: web, desktop
- Evidence: `usageProviders.ts:19-46` defines `#d97757`, `#8b8b8b`, `#5b9bbd`, `#8c7bd1`, `#4d9f8a`, `#0866ff` for chart and bar fills; instance accent colours chosen in `ProviderAccentColorPicker` do not reach Usage; the same Claude salmon appears under Grove and T3 Chat (`09-usage-limits-theme-grove-dark-1440x900.png`). `0866ff` against the dark canvas is about 4.1:1, fine for a stroke.
- Current: Two sources of provider colour that can disagree.
- Proposed: Read `PROVIDER_PRESENTATION[kind].color` from the same constants the icons use, and when a pool has a single instance with `accentColor`, use it. Keep the neutral grey for Codex.
- DNA: DNA-C1, DNA-I6, DNA-C14.
- Effort: S
- Risk: chart palettes in `UsageProviderChart.test.ts`.
- Upstream-eligible: no (taste change, needs owner decision).
- #24865: not addressed.

### F-09-38 The Limited banner uses a locale timestamp with seconds, "Saving..." on both buttons, and no provider or window

- Severity: P2
- Surface: web, desktop
- Evidence (code-read; a real limit stop cannot be produced without spending the subscription): `UsageLimitRecoveryBanner.tsx:31` `Resets ${new Date(resetAt).toLocaleString()}` renders for example "10/26/2026, 3:42:07 AM" in en-US and a different shape elsewhere; `:91,99` both buttons show "Saving..." (ASCII dots, DNA-V9) while only one action is pending; fallback `"An error occurred."` (`:82`, DRIFT-12); title "Usage limit reached" names neither provider nor window (docs say the thread shows which limit and the remaining wait). The Usage page formats the same fact as "↻ 3h 37m". Related: #24253 (Limited toast shows the question icon).
- Current: Three formats for one reset time; unclear which button is working.
- Proposed: Description "Resets in 3h 37m ({time})" using `formatResetsIn` (the Usage helper) and `Intl.DateTimeFormat(undefined, { weekday: "short", hour: "numeric", minute: "2-digit" })`; title "{Provider} {window} limit reached" when the run carries them. Pending label "Saving…" only on the clicked button (`pendingAction` state); error fallback "Could not change auto-resume. Try again."
- DNA: DNA-V9, DNA-V10, DNA-V3, DRIFT-12.
- Effort: S
- Risk: the banner has no test; add one for the copy function.
- Upstream-eligible: yes.
- #24865: not addressed (settings labels were renamed; the banner file was not touched).

### F-09-39 Limited recovery: setting names and buttons now diverge, and a scheduled resume shows no time

- Severity: P2
- Surface: web, desktop, mobile
- Evidence: #24865 renames the defaults to "Resume after usage limits" and "Snooze until limits reset" (`SettingsPanels.tsx` aria-labels, `settingsSearch.ts`, mobile `SettingsThreadsRouteScreen.tsx`), while the banner buttons stay "Resume at reset" / "Cancel auto-resume" and "Snooze until reset" / "Wake now" (`UsageLimitRecoveryBanner.tsx:91,99`; `docs/user/thread-sidebar.md` keeps them). When auto-resume is scheduled the banner shows only "Cancel auto-resume", not when it will fire; #17808 reports it never firing. No copy explains that snooze and resume are independent (`docs/user/thread-sidebar.md`). Ideas #15846 and #18949 ask for fallback-provider handoff at this moment; the banner is the place it would live. `resetAt === null` shows "Reset time unavailable; retry manually" with no retry control.
- Current: Same feature, three names, and no confirmation of what will happen.
- Proposed: Keep the owner's setting names; make the banner a status line plus verbs: when scheduled, description "Resumes automatically at {time}" and button "Cancel resume" (pair "Resume at reset" with "Cancel resume"); when snoozed "Snoozed until {time}" with "Wake now"; add a one-line `text-2xs` help "Snooze hides the thread. Resume sends a message when the limit resets." For `resetAt === null` add a `Button size="xs"` "Retry now" that calls the existing manual resume. Fallback provider handoff stays a separate proposal.
- DNA: DNA-P7, DNA-V8, DNA-V5, DNA-P3.
- Effort: S
- Risk: `UsageLimitRecoveryBanner` has no tests; the server `limitRecovery` shape is unchanged.
- Upstream-eligible: yes, as a follow-up to #24865 (it renames the settings, this aligns the banner).
- #24865: partial (renames the settings and docs for the settings but not the banner or its docs for the buttons; creates the divergence this finding resolves).

---

## Edge-case results (matrix)

Data

- Empty: Providers page with no instances cannot occur (Codex and Claude rows are always present, `ProviderSettingsPanel.tsx:757`); with both uninstalled the page shows two "Not found" rows and no action. FAIL (F-09-07). Usage empty: FAIL (F-09-34). Models empty: copy "No models reported for this provider yet." PASS.
- One item: a single instance, PASS (list and editor hold).
- 100+ items: ACP registry list (about 45 agents) scrolls inside the wizard, PASS; 13-model Claude list with the filter (shown above 8 models, `FILTER_THRESHOLD`), PASS on desktop, FAIL on phone width (F-09-02). 10,000+: N/A (no such list).
- Very long names: NOT TESTED live (no long-named instance created); code-read: list title `truncate`, editor header `truncate`; the real-world truncation problem is F-09-04.
- Unicode, emoji, RTL, leading/trailing whitespace, whitespace-only display name: NOT TESTED live. Code-read: `updateDisplayName` trims and falls back to the driver label when empty (`ProviderInstanceCard.tsx:713`), PASS.

Content

- Diffs, binaries, renames, tool output, code fences, tables, images: N/A (not in this area).
- Links: ACP registry "About {name}" external links present, PASS. Very long single-line strings: update command pill `truncate` with copy button, status text `[overflow-wrap:anywhere]`, PASS.

Network and agents

- Provider not installed: FAIL (F-09-07, F-09-08, F-09-21, F-09-22). Live for Grok, OpenCode, Antigravity, Muse Code, Pi; Cursor shows the signed-out variant.
- Installed but logged out: FAIL (F-09-09, F-09-10, F-09-22); live with a second Claude instance.
- Auth expired mid-session: code-read plus the live logged-out thread. The thread shows an unauthenticated provider banner and an error row, the composer stays enabled with the same model, there is no in-thread "sign in again" (F-09-22, F-09-09). `providerAuthDelivery.ts` is only the Codex `#codex-auth=` hash hand-off (19 lines), not expiry handling.
- Stream stalls, cancelled mid-token, permission prompt mid-stream, two or six threads streaming: N/A (area 03/17).
- Relay disconnected, reconnect after sleep, server restarted: code-read: `EnvironmentUnavailablePlaceholder` shows "Could not connect to this device" or "Loading provider settings" without a spinner on purpose (comment at `ProviderSettingsPanel.tsx:263`), read-only sessions show "Limited permissions". PASS by reading; NOT TESTED live.
- Version mismatch: N/A here (area 11).

Git: N/A.

Viewport

- 1440x900: PASS with notes (card bottom 48px under the fold, three nested scrollers: page 1209/770, editor 1107/702; wheel chaining works).
- 1280x720: PASS (two-pane, card 544px).
- 1024x640 and 800x600: FAIL (F-09-01, F-09-04, F-09-33).
- 3440x1440 and 2880x1800: PASS (card capped at 704px, content centred at 896px).
- 390x844 with touch: FAIL (F-09-01, F-09-02, F-09-03, F-09-33). Software keyboard: NOT TESTED (no native keyboard in Playwright).
- OS zoom 125/150%: NOT TESTED (macOS display scaling not available). Browser zoom 200% (720x450): FAIL (stacked layout, F-09-01). 50%: PASS.

Preferences

- Light and dark: PASS except contrast findings (F-09-11, F-09-23, F-09-28).
- System switching live: NOT TESTED (colour scheme fixed per context).
- Named themes: T3 Chat (light) and Grove checked on Providers and Usage, status dots and Usage bars stay legible (`09-providers-theme-*`, `09-usage-limits-theme-*`); other three themes NOT TESTED.
- Reduced motion: NOT TESTED beyond code-read (the update pill uses `transition-all duration-180` and a `scale-x` progress with `ease-linear`, `SidebarProviderUpdatePill.tsx`; the progress bar is a one-shot, DNA-M2 OK, but it has no `motion-reduce` branch).
- High contrast, screen reader: NOT TESTED. Names read from DOM: row select buttons `aria-pressed`, switches `aria-label="Enable {name}"`, model switches `aria-label="Show {name} in the model picker"`.
- Keyboard only: FAIL (F-09-05, F-09-06).
- Font size overrides: NOT TESTED.

Lifecycle

- First ever launch: the Welcome wizard's "Check your agents" step is areas 10/24; both agents are installed here, so its install and sign-in terminals could not be produced (cited only).
- Launch after update, corrupted settings, server already running, backgrounded for an hour, OS sleep, minimised during stream: NOT TESTED (not reproducible on this host).

## Already good (do not touch)

- Account emails are redacted by default with click to reveal (`RedactedSensitiveText`, `ProviderAuthEmail`), in the editor and on Usage limits. The DOM holds scrambled text while the real address is hidden until revealed, so it is safe in screenshots and page dumps.
- Provider rows: whole-row select button with `aria-pressed`, labelled switches, `aria-live="polite"` status line, update progress "Updating · {message}".
- Update flow: "Update now" plus a manual command with a copy button and a success toast; `Update all` only appears when there is something to update; progress is reported in place.
- Environment variables: names, sensitive toggle with `MorphIcon`, "Sensitive values are stored separately and never returned to the app.", plain and secret inputs.
- Per-project provider switch: layers popover ("Project Off, Device On" with a check on the winner) and "Reset to the device setting" tooltip; the sidebar settings nav gains a "Project" entry only when scoped.
- Model picker: unavailable providers keep their rail entry with an accessible reason, NEW badge, "Legacy models" group, update-required notice, instance initials badge for multi-account (content issues are in F-09-27 and F-09-29, the structure is right).
- Antigravity setup section ("Environment, Runtime, Account") is the clearest in-app install and sign-in flow in the product; model it for other providers (F-09-07).
- ACP registry search: distinct accessible names ("Add {agent}", "About {agent}"), empty state "No compatible agents found. Try a broader search.", "Local ACP command" for manual entry.
- `EnvironmentUnavailablePlaceholder` deliberately avoids a spinner for wedged devices (DNA-M2).
- Usage: tabular numerals, `C`/`T`/`L` shortcuts, pooled limits with per-account segments, reset-credit confirmation dialog with a named confirm button ("Use credit"), figures dim while environments are still scanning.
- Not-installed rails in the picker are dimmed to 50% rather than hidden, so users can see what exists.

## Incomplete (what I did not cover and why)

- Sign-in, install and update actions were not clicked (host rule), so the setup terminal (`ProviderAuthTerminal`, wizard `terminalLabel`) was not opened or screenshotted; its issues are code-read (F-09-32). Cursor browser sign-in, Antigravity remote return-URL step, Codex managed "Connect with ChatGPT" (`CodexSetupSection`), ACP URL-auth and terminal methods, and the `AcpSessionManagementSection` ("List sessions") were read at the surface only.
- A real "Limited" thread (usage-limit stop) cannot be produced without spending subscription limits. `UsageLimitRecoveryBanner` and `ComposerUsageLimits` are code-read (F-09-38, F-09-39). The `/usage-limits` result block was not rendered.
- Mobile native app (Settings, Provider accounts; Usage tab; subscription widgets) was not run. Mobile findings are limited to the shared contracts and the mobile web viewport.
- Multi-device Providers (device tabs) and "Update all" with several devices: code-read only (one device on this host). Remote and relay Providers behaviour not exercised.
- Zero-provider first-run composer state ("No provider available") is code-read plus the Grok-removed analogue; I could not uninstall Codex or Claude.
- Pi, Grok and Cursor detail panes were captured (`09-providers-{pi,grok,cursor}-detail-*`) but their model sections were not exercised because no models are reported for not-installed CLIs, so custom-model add/edit/remove with real entries was only checked for validation (empty input), not persisted.
- Desktop (Electron) not run; the Providers page is the same React tree, but `desktopBridge` branches in `ProviderAuthenticationSection.openBrowser` were read only.
- Themes: only T3 Chat and Grove spot-checked.
- Window sizes with the macOS software keyboard and 125/150% OS scaling.

## Needs deeper look

- Hidden models reaching delegated agents (#15992) is a server and MCP behaviour; F-09-24 only fixes the label. Decide whether "hidden" should also gate `delegate_task` model validation.
- #8388 (OpenCode via OpenRouter never shows context-window usage) and Ideas #14404 (context window number): composer meter, area 04; the Usage page also lacks context data, so the provider-agnostic place for the number may belong with `ProviderSubagentBar`/thread header.
- Ideas #14118 (environment-level MCP servers shared by all providers and accounts): the per-instance "Environment" section is the only place provider configuration lives; a shared "Environment" layer would sit above the instance list. Needs an owner decision before any UI.
- Ideas #15846 and #18949 (automatic fallback provider or account when a limit is hit): the banner in F-09-39 is the natural surface, but it needs a server policy field and a place in "Resume after usage limits". Out of scope for visual work.
- #5817 (new Codex runtime entries can disable existing shadow-home providers) and the shadow-home UX: the two path fields ("CODEX_HOME path", "Shadow home path") are always visible on the default Codex instance with neighbouring placeholders `~/.codex` and `~/.codex-t3/personal`; the relationship (shared sessions, separate login) is explained only in docs. Worth a design pass with the Codex owner; I did not add a second Codex instance on this host.
- `DEFAULT_DISABLED_PROVIDER_DRIVERS` and `DEFAULT_ENABLED_DEFAULT_INSTANCES` (`packages/contracts/src/settings.ts:1282-1293`) are hand-maintained mirrors of each driver's decoding default ("Must match each driver's enabled decoding default"), and the Add dialog hard-codes `"codex"` and `"claudeAgent"` as reserved ids (`AddProviderInstanceDialog.tsx:126`). A new driver that forgets one of the three lists will show in the wrong state; consider deriving them from the client registry (`providerDriverMeta.ts`).
- #16405 (macOS Low Power Mode: a timed-out Codex probe is never re-checked): "Checked 3m ago" can be stale and the header cannot say why; consider "Checked 3m ago, paused (Low Power Mode)".
- #11873 and #23916 (Limits notices and half-empty rows): `LimitNotices` renders raw provider error strings as bold `AlertTitle`s (`UsageLimitsPooled.tsx:681-690`); grouping them under the provider heading is a likely follow-up once the error taxonomy is known.
- #24253 (Limited toast uses the question icon): toast area 12.
- Mobile "Provider accounts" screen parity with the web Providers page (state labels, install actions) once area 09 proposals settle.
