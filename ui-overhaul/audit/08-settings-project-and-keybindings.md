# 08 settings-project-and-keybindings: audit

Area: Settings General (every row), the Project page and project scope targeting ("Applying settings for ... on ..."), the project icon picker, the Actions editor (`projectScriptEditor.tsx`, t3.json import), Source Control, Storage, Scheduled tasks, SnapShots, Integrations, and the Keybindings page (including `KeybindingsConfigWarning` and the command-ID list against `docs/user/keybindings.md`).
Baseline: `pingdotgg/t3code` main @ 5f64c5eb, run at `http://localhost:5733` (Dev channel, synthetic data, one environment). Owner PR #24865 is read from `prior-art/pr-24865.diff` and tagged on every finding. Screenshots: `ui-overhaul/screens/08-settings-project-and-keybindings/`; `[shot: X]` means `.../08-X.png` in that folder.
Not mine and not repeated: Settings shell frame, nav, search, `aria-current`, Esc-closes-Settings and the "Applying settings" sentence on Beta/Diagnostics/Licences (area 07: F-07-03..F-07-13, especially F-07-06 icon rail and F-07-08 sentence on pages with nothing to scope); Providers (09); Connections (11); shortcut discoverability outside Settings (21).

## How this was done

- Drove the real app with Playwright (Chromium, macOS host; scripts in `/tmp/t3code-pw/a08/`, outside the repo) from throw-away contexts that load `/tmp/t3code-pw/state.json`. Every page in light and dark at 1440x900; General and Keybindings also at 1024x640, 800x600, 390x844 (Project page and Add-action dialog at 1024x640 and 390x844 too); no-overflow sweep of seven pages at 800x600, 720x450 (200% zoom equivalent) and 3440x1440. A Windows platform was emulated by overriding `navigator.platform` and the user agent.
- Probe data: two throw-away projects (`/tmp/t3code-settings-probe`, `-b`, a shared fake remote so they group, plus a `t3.json` with four scripts and a deliberately broken variant) and one paused webhook scheduled task. Created through the CLI and the UI; all removed through the UI/CLI at the end (project removal and checkout removal flows were exercised for real). Shared server state was touched only for: one project permission override (reset), two test keybindings and one edited default (all removed/reset; `keybindings.json` verified clean), one scheduled task (deleted), project renames (restored). Storage policies, Delete now, the send shortcut, follow-up behaviour, thread title instructions and branch naming were never saved. `settings.json` was read back afterwards: no overrides, no scripts, no leftover keys.
- Numbers marked "measured" are `getComputedStyle` plus canvas read-back with WCAG 2.x luminance on the running app. They describe main, not the #24865 end state; where #24865 moves them the finding says so.
- Privacy: screenshots were scrubbed with DOM edits (home path shown as `/Users/user`, emails replaced) before capture. Source Control account names are blurred by the app by default and were left blurred. One capture of a webhook URL was deleted and retaken with the URL masked. Nothing else was withheld.
- Mid-run the Playwright session was invalidated server-side for about three minutes (`/api/auth/session` returned `authenticated:false`, app redirected to `/pair`); I did not re-pair. It recovered on its own (`state.json` was rewritten by the coordinator at 14:27) and I continued.

## Baseline: what #24865 changes in this area (and what it does not)

Changes that matter (from the diff): Settings section titles become 16 px / 600 / full foreground (`settingsLayout.tsx:249`); row descriptions go from `text-muted-foreground/80` + `max-w-xl` to full `text-muted-foreground` + `max-w-2xl text-balance` (`:495`; measured today 3.28:1 light, 3.59 dark at 12 px); scope pickers become boxed `Button variant="outline" size="sm"` (`SettingsScopeSentence.tsx`); `SETTINGS_PICKER_TRIGGER_CLASSNAME` boxes the model and effort pickers (`settingsLayout.tsx:186`); the inheritance marker hides (opacity-0 until hover/focus) when the state is `default` or `environment` and no project overrides it (`:485-499`); the Model row loses its "Automatic" status line and gains "selected automatically" in the description (`ProjectDefaultsSettings.tsx:148`); two labels are renamed "Resume after usage limits" and "Snooze until limits reset" in `SettingsPanels.tsx` (aria-labels and the restore list), `settingsSearch.ts`, mobile `SettingsThreadsRouteScreen.tsx` and `docs/user/thread-sidebar.md`.
Not changed (so these findings stand): `KeybindingsSettings.tsx`, `KeybindingsSettings.logic.ts`, `KeybindingsConfigWarning.tsx`, `projectScriptEditor.tsx`, `ProjectSettingsPanel.tsx`, `ProjectActionsSettings.tsx`, `ProjectActionsList.tsx`, `ProjectIconPickerDialog.tsx`, `SettingInheritance.tsx`, `StorageSettings.tsx`, `ScheduledTasksSettings.tsx`, `IntegrationsSettings.tsx`, `SourceControl*.tsx`, `docs/user/keybindings.md`, `docs/user/project-settings.md`.
Owner calls kept: no finding below touches the blue switch accent, the `#0a0a0a` canvas, three-line rows or the composer model colour.

## Lead confirmations (from the brief)

1. **#24865 renames two labels but their banner buttons stay (F-09-39): CONFIRMED, and narrower than feared in this area.** Every Settings surface is renamed (General row titles and aria-labels, the restore-defaults list, Settings search, mobile Thread behavior screen, `thread-sidebar.md` lines 218 and 228). What stays on the old vocabulary: `UsageLimitRecoveryBanner.tsx:81,91` ("Could not change auto-resume", "Cancel auto-resume", "Resume at reset", "Snooze until reset"), mobile `UsageLimitRecoveryCard.tsx:96` ("Cancel auto-resume"), the prose "Snooze and auto-resume are independent" at `docs/user/thread-sidebar.md:226`, and the mobile search keyword `settings-search.ts:41`. Not repeated as a finding here; fix with F-09-39.
2. **General holds controls docs do not mention: CONFIRMED.** 17 of the 41 General rows have no `docs/user` hit by title (Project grouping, Project order, both notification rows, Time format, Response streaming, the three diff rows, Proactive panels, Rich text composer, Collapse composer on scroll, Background activity, Start from remote, Add project starts in, Archive and Delete confirmation). The table below gives each default and persistence key; F-08-47 is the docs finding.

## Settings controls: tiers, defaults and persistence (General page)

Device = `ClientSettings`, stored in `t3code:client-settings:v1` (web localStorage) or the desktop client-settings file; ignores the project/environment selection. Environment = `ServerSettings` in `settings.json` under the server state dir, written to every selected environment; 26 keys can be overridden per project in `projectSettingsOverrides`. 41 rows on the page: New threads 4, Organization 9, Behavior 16, Projects & threads 2, Confirmations 3 (web; plus Quit shortcut on desktop), Text generation 2, About 3, Diagnostics 2, Legacy features (collapsed).

| Row (section)                                                                                                                        | Tier and key                                                                                                                          | Default                                                                               | In docs/user |
| ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- | ------------ |
| Model, Permissions, Workspace, Submodules (New threads)                                                                              | environment: `defaultModelSelection`, `defaultRuntimeMode`, `defaultThreadEnvMode`, `worktreeSubmodules`                              | null (Automatic), full-access, null (resolves to local), null (resolves to recursive) | yes          |
| Project grouping (Organization)                                                                                                      | device: `sidebarProjectGroupingMode` (toggle off writes `separate`; last enabled mode in `t3code:last-enabled-project-grouping-mode`) | `repository`                                                                          | no           |
| Project order                                                                                                                        | device: `sidebarProjectSortOrder`; manual order lives in `t3code:ui-state:v1` `projectOrder`                                          | `updated_at` shown as "Last user message"                                             | no           |
| Auto-resume limited threads / Snooze limited threads (end state after #24865: Resume after usage limits / Snooze until limits reset) | environment: `autoResumeLimitedThreads`, `snoozeLimitedThreads`                                                                       | false, false                                                                          | yes          |
| Compact idle threads                                                                                                                 | environment: `idleCompaction` (legacy `compactIdleThreads`)                                                                           | "When you return" on this host                                                        | partial      |
| Auto-settle merged / inactive / days / Keep threads with a PR                                                                        | environment: `sidebarAutoSettleOnMerge`, `sidebarAutoSettleAfterDays` (1-90), `sidebarAutoSettleKeepPullRequests`                     | true, 3, false                                                                        | yes          |
| Thread notifications / In-app notifications                                                                                          | device: `notificationMode`, `inAppNotificationsEnabled`                                                                               | off, false                                                                            | no           |
| Time format                                                                                                                          | device: `timestampFormat` (locale, 12-hour, 24-hour)                                                                                  | `locale` ("System default")                                                           | no           |
| Response streaming                                                                                                                   | environment: `responseStreamingMode`                                                                                                  | `paragraph` ("Show finished paragraphs")                                              | no           |
| Hide whitespace changes / Default diff file state / Diff layout                                                                      | device: `diffIgnoreWhitespace`, `diffFilesCollapsed`, `diffLayout` (the diff toolbar toggle writes the same key)                      | true, true (Collapsed), `stacked`                                                     | no           |
| Proactive panels                                                                                                                     | device: `proactivePanelsEnabled`                                                                                                      | false                                                                                 | no           |
| Show skills in slash menu                                                                                                            | device: `showSkillsInSlashMenu`                                                                                                       | true                                                                                  | yes          |
| Rich text composer / Collapse composer on scroll                                                                                     | device: `composerRichTextEnabled`, `composerCollapseOnScroll`                                                                         | true, true                                                                            | no           |
| Send shortcut / Follow-up behavior                                                                                                   | device: `sendShortcut`, `followUpBehavior`                                                                                            | `enter`, `steer` (docs never state the default)                                       | yes          |
| Provider update checks / Continue threads after restarts                                                                             | environment: `enableProviderUpdateChecks`, `continueThreadsAfterServerUpdate`                                                         | true, true                                                                            | partial      |
| Background activity                                                                                                                  | environment: `backgroundActivity*`                                                                                                    | Balanced                                                                              | no           |
| Start from remote / Add project starts in                                                                                            | environment: `newWorktreesStartFromOrigin`, `addProjectBaseDirectory`                                                                 | true, "" (browser opens at `~/`)                                                      | no           |
| Unpin / Archive / Delete confirmation                                                                                                | device: `confirmThreadUnpin`, `confirmThreadArchive`, `confirmThreadDelete`                                                           | false, false, true                                                                    | partial      |
| Quit shortcut (desktop only)                                                                                                         | device: `confirmQuit`                                                                                                                 | `hold`                                                                                | yes          |
| Text generation model / Thread title instructions                                                                                    | environment: `textGenerationModelSelection`, `threadTitleInstructions`                                                                | provider default, ""                                                                  | yes          |
| Legacy: Sidebar (legacy), plan mode, context meter                                                                                   | device: `legacySidebarEnabled`, `planModeEnabled`, `contextWindowMeterEnabled`                                                        | false, false, false                                                                   | no           |

## Summary

47 findings: 0 P0, 3 P1, 31 P2, 13 P3. #24865 tags: not addressed 44, partial 3, conflicts 0.

| Id      | Sev | Finding                                                                                                               | #24865        |
| ------- | --- | --------------------------------------------------------------------------------------------------------------------- | ------------- |
| F-08-01 | P1  | "Restore device defaults" rewrites environment settings on every connected environment                                | partial       |
| F-08-02 | P2  | Read-only rows under a project: wrong tooltip, no inline reason, 50% opacity                                          | not addressed |
| F-08-03 | P2  | Device-only rows carry no marker when a project or environment is selected                                            | not addressed |
| F-08-04 | P2  | The layers popover prints raw enum values ("approval-required")                                                       | not addressed |
| F-08-05 | P2  | Meaning-carrying amber icons are 2.08:1; "Mixed" is never explained                                                   | not addressed |
| F-08-06 | P3  | Reset controls disagree: aria says default, tooltip says inherited, the list says "Reset it"                          | not addressed |
| F-08-07 | P2  | Keybindings offers a project picker and fans saves out to every environment                                           | not addressed |
| F-08-08 | P1  | Commit-on-blur fields silently lose typed text when Settings closes with Esc                                          | not addressed |
| F-08-09 | P2  | General sections: Behavior holds 16 unrelated rows, Organization 9, worktree rows are split                           | not addressed |
| F-08-10 | P2  | "Project order: Manual" has no way to arrange projects in the default sidebar                                         | not addressed |
| F-08-11 | P3  | Model "Automatic" is unexplained and pinning is silent (#6508)                                                        | partial       |
| F-08-12 | P3  | Accessible names drop the visible label on 9 controls                                                                 | partial       |
| F-08-13 | P2  | The Project page never shows where the project lives                                                                  | not addressed |
| F-08-14 | P2  | The "No project" scratch entry gets a full, removable Project page                                                    | not addressed |
| F-08-15 | P2  | Monogram accepts three letters, closes the dialog, then fails with "Failed to mutate project." (#22793)               | not addressed |
| F-08-16 | P3  | Project icon row: raw lucide slug, "Choose file" is not an upload, docs promise an "Automatic" choice                 | not addressed |
| F-08-17 | P2  | Reset on the Actions row deletes every action with no confirmation                                                    | not addressed |
| F-08-18 | P2  | Edit affordance on actions is invisible at rest; the row is not clickable; truncated names have no tooltip            | not addressed |
| F-08-19 | P2  | The "Import scripts" menu has no width cap (spills over the nav) and no "Import all"                                  | not addressed |
| F-08-20 | P2  | Action shortcut field: raw tokens, accepts bare keys, no conflict warning                                             | not addressed |
| F-08-21 | P2  | "t3.json is invalid" looks like an ordinary row                                                                       | not addressed |
| F-08-22 | P3  | Action editor copy: Title Case titles, "This action cannot be undone", Preview URL on web                             | not addressed |
| F-08-23 | P2  | Tab is recorded as a shortcut instead of moving focus                                                                 | not addressed |
| F-08-24 | P2  | Keybindings search does not match what the page shows (⌘K, cmd, ctrl, option, return, esc)                            | not addressed |
| F-08-25 | P2  | Bindable commands without a default have no row, so they cannot be found                                              | not addressed |
| F-08-26 | P2  | "Preview: Zoom In" (⌘+) renders two empty key boxes                                                                   | not addressed |
| F-08-27 | P2  | `KeybindingPill` re-implements `formatShortcutLabel`: lowercase tokens, ⌘⌥⇧ order, ⇧ on Windows, "Meta"               | not addressed |
| F-08-28 | P2  | Recording shows raw tokens, dirty rows cannot be discarded, the command select shows the raw ID                       | not addressed |
| F-08-29 | P2  | The conflict warning is a 14 px tooltip-only icon with no resolution                                                  | not addressed |
| F-08-30 | P2  | The "When" label is 2.73:1 at 12 px and `Always` chips are 11 px                                                      | not addressed |
| F-08-31 | P2  | Groups: Navigation Back/Forward land in "Other"; "Other" holds 12 rows; 18 jump rows                                  | not addressed |
| F-08-32 | P2  | Row density: 73 px per row, 82 rows, 6,709 px                                                                         | not addressed |
| F-08-33 | P2  | When-condition vocabulary: the UI flags `previewOpen`, docs list `composerDraft`                                      | not addressed |
| F-08-34 | P2  | A bad `keybindings.json` entry produces a 1,905-character schema dump in a toast                                      | not addressed |
| F-08-35 | P3  | "Keybindings updated" toast fires on the user's own save                                                              | not addressed |
| F-08-36 | P3  | Command labels: Title Case, drift from docs, scripts named by ID, "Project scripts" vs "Actions"                      | not addressed |
| F-08-37 | P3  | `docs/user/keybindings.md` says the page lists command IDs; 51 IDs and most default chords are undocumented           | not addressed |
| F-08-38 | P2  | Source Control section titles misdescribe their rows and break sentence case                                          | not addressed |
| F-08-39 | P3  | Provider install hints render markdown backticks literally                                                            | not addressed |
| F-08-40 | P1  | Cleanup rules and "Delete now" delete worktrees with no confirmation or preview                                       | not addressed |
| F-08-41 | P3  | "Machine" and "environment" are used interchangeably across Settings                                                  | not addressed |
| F-08-42 | P2  | Scheduled task Delete and Run now fire from a menu item with no confirmation or undo                                  | not addressed |
| F-08-43 | P2  | Task rows omit project and workspace and print the raw run status                                                     | not addressed |
| F-08-44 | P2  | Selected weekdays differ from unselected ones by 1.25:1                                                               | not addressed |
| F-08-45 | P3  | "Create task" is enabled when empty; validation arrives as a toast; default project is the first in the list          | not addressed |
| F-08-46 | P3  | Integrations and SnapShots on web: truncated select value, duplicate Default badge, 16 px version link, dead-end page | not addressed |
| F-08-47 | P3  | 17 General rows are undocumented (defaults and keys in the table above)                                               | not addressed |

## Findings

Line numbers are from `main @ 5f64c5eb`. "Upstream-eligible" follows the coordinator rule: chunks that edit a file #24865 modifies (`settingsLayout.tsx`, `SettingsPanels.tsx`, `SettingsScopeSentence.tsx`, `ProjectDefaultsSettings.tsx`, `settingsSearch.ts`, `ui/button.tsx`, `ui/select.tsx`, `SettingsSidebarNav.tsx`) are `no` unless they are a follow-up to #24865 itself.

### Group A: Scope, inheritance and reset ("Applying settings for ... on ...")

### F-08-01 "Restore device defaults" rewrites environment settings on every connected environment

- Severity: P1
- Surface: web, desktop
- Evidence: `routes/_chat.settings.tsx:28-40` (button, General header only, label "Restore device defaults"); `SettingsPanels.tsx:529-648` (`restoreDefaults`). The one `updateSettings({...})` call at `:580-647` lists 67 keys (checked by diffing against `ServerSettings.fields` and `ClientSettingsSchema.fields`): 49 are device keys and 18 are server keys: `defaultThreadEnvMode`, `newWorktreesStartFromOrigin`, `addProjectBaseDirectory`, `autoResumeLimitedThreads`, `snoozeLimitedThreads`, `sidebarAutoSettleAfterDays`, `sidebarAutoSettleOnMerge`, `sidebarAutoSettleKeepPullRequests`, `responseStreamingMode`, `enableProviderUpdateChecks`, `continueThreadsAfterServerUpdate`, `backgroundActivity`, `backgroundActivityProfile`, `automaticGitFetchInterval`, `providerHealthRefreshInterval`, `textGenerationModelSelection`, `threadTitleInstructions`, `enableAgentBrowserAccess`. `scopedSettings.ts:227-306` (`planScopedSettingsPatch`) sends server keys to every connected environment when the scope is "all" (the default). The confirm text is `Restore default settings? This will reset: <comma list>.` (`:533`) and never names an environment. The list also covers Appearance-page keys (Theme, Contrast, Glass opacity, Panel animations, fonts) from the General page, and omits the first three General rows (`defaultModelSelection`, `defaultRuntimeMode`, `worktreeSubmodules`) and everything on Source Control and Storage. Under a project scope `unscopableKeys` makes the server part a no-op while the client part still runs. List entry `"Project Grouping"` (`:432`) is Title Case. Not clicked: it would rewrite the shared server settings.
- Current: A control labelled "device" silently resets auto-settle rules, usage-limit behaviour, text-generation model and agent browser access on every machine the user is connected to, behind a one-line confirm that does not say so.
- Proposed: (1) Make `restoreDefaults` write only keys in `CLIENT_KEYS` (`scopedSettings.ts:44`): delete the server keys from the patch and from `changedSettingLabels`, keep the label "Restore device defaults". (2) Give environment rows their own reset: a `headerAction` on `SettingsSection` ("Reset section", `Button size="xs" variant="ghost"`) that calls `useClearScopedSettings`/defaults for that section's `settingKeys` and confirms with "Reset N settings on {environment labels}?". (3) Render the dialog body as a bulleted list, not a comma run-on, and name the primary action "Reset" (needs the `ConfirmDialogHost` fix tracked as DRIFT-13).
- DNA: DNA-P3 (a stale label), DNA-V2 (buttons name their action), DNA-P8 (every entry point and connection mode).
- Effort: M
- Risk: `useSettingsRestore` is shared with the Appearance page; `SettingsPanels.logic.test.ts` covers the label helpers only, nothing covers the patch. Add a test that asserts no server key is in the patch.
- Upstream-eligible: no (SettingsPanels.tsx modified by #24865)
- #24865: partial (renames two entries in the same list, `@@ -448,10 +451,10 @@`, and adds `sidebarProjectIconColors`; the scope problem is untouched)

### F-08-02 Read-only rows under a project: wrong tooltip, no inline reason, 50% opacity

- Severity: P2
- Surface: web, desktop
- Evidence: `settingsLayout.tsx:389-402` and `:426` (`inertControl("Environment-wide setting. Select an environment to change it.")`, wrapper `opacity-50`). Measured with `?project=<group>&machine=<env>`: six rows are inert (Auto-resume, Snooze, Compact idle threads, Provider update checks, Background activity, Add project starts in), and the tooltip still says "Select an environment" although an environment is selected ("on MacBook Pro"). The only way to read the reason is hover or Tab onto a `span tabIndex=0`. An inert switch at `opacity-50` is indistinguishable from an enabled switch that is off. [shot: general-project-scope-readonly-row-tooltip-light-1440x900]
- Current: The page tells the user to do something they have already done, and shows no reason unless they hover.
- Proposed: Replace the string with "Applies to the whole environment. Choose All projects to change it." (the project axis is the blocker, not the environment). Also render it as a `status` line under the description (`text-xs text-muted-foreground`, the slot at `:499-500`) so it is visible without hover, and change `opacity-50` to `opacity-64` (`--disabled` value in DNA-C4) with `cursor-not-allowed` on the wrapper.
- DNA: DNA-P3, DNA-C4 (disabled is `opacity-64`), DNA-V5 (explain in place).
- Effort: S
- Risk: `inert` stays; only text and opacity change. No tests cover the tooltip.
- Upstream-eligible: no (settingsLayout.tsx modified by #24865)
- #24865: not addressed

### F-08-03 Device-only rows carry no marker when a project or environment is selected

- Severity: P2
- Surface: web, desktop
- Evidence: `settingsLayout.tsx:450-466` builds the layers marker only when `serverScoped` is set (`renderedInheritance`, `context && serverScoped && settingKeys.length > 0`). Project grouping, Project order, both notification rows, Time format, the three diff rows, Proactive panels, the four composer rows and the three confirmations are device settings (`ClientSettingsSchema`) and show nothing. With `?project=...` selected they stay editable and ignore the selection, exactly like the rows beside them that change. [shot: general-top-light-1440x900] vs [shot: general-project-sample-app-top-light-1440x900]. Docs say "Preferences saved on this device ... ignore the selection" (`docs/user/project-settings.md:8-10`). Family of F-07-08 (which covers Beta only).
- Current: Selecting a project turns a third of the page into rows that look scoped and are not.
- Proposed: Add `deviceScoped?: boolean` to `SettingsRow`. When true and `scope.kind !== "all"`, render `MonitorIcon` (`size-3`, `text-muted-foreground`, same 20x20 slot as the layers marker) with tooltip "Saved on this device. The selected project and environment do not apply." Set it on the rows above (a one-word prop per row), nothing at All/All.
- DNA: DNA-P3, DNA-L6.
- Effort: S
- Risk: Row heights unchanged (marker occupies the existing 20 px slot).
- Upstream-eligible: no (settingsLayout.tsx, SettingsPanels.tsx modified by #24865)
- #24865: not addressed (it hides the marker for default/environment values, which makes device rows and default server rows look the same at rest)

### F-08-04 The layers popover prints raw enum values ("approval-required")

- Severity: P2
- Surface: web, desktop
- Evidence: `SettingInheritance.tsx:40-80` (`formatValue` maps only merge method, env mode, submodules, model selection and writing style). With a project override on Permissions the popover reads `Project approval-required`, `Environment Inherits`, `Default full-access` while the select beside it says "Supervised" and "Full access". Other unmapped keys fall through as raw strings: `responseStreamingMode` (`turn`/`paragraph`), `branchNamingMode` (`static`/`semantic`/`custom`), `idleCompaction`. [shot: general-permissions-override-chain-project-light-1440x900] [shot: general-permissions-override-chain-all-light-1440x900]
- Current: The one place that explains where a value comes from uses a different vocabulary from the control it explains.
- Proposed: In `formatValue` add `key === "defaultRuntimeMode"` -> `runtimeModeConfig[value].label` (`chat/runtimeModeConfig.ts`), and export the label maps for `responseStreamingMode` (`SettingsPanels.tsx:103`), `branchNamingMode` (`BranchNamingSettings.tsx:16`) and `idleCompaction` (`IDLE_COMPACTION_MODES`) to a shared `settingValueLabels.ts`. Change the string fallthrough from `value` to a humanizer (`value.replaceAll("-", " ")`, sentence case) so a new key never prints a slug.
- DNA: DNA-V7 (one vocabulary), DNA-P3.
- Effort: S
- Risk: `SettingInheritance.test.ts` asserts layer values; extend it with the runtime-mode case.
- Upstream-eligible: yes (SettingInheritance.tsx is not in #24865's file list)
- #24865: not addressed

### F-08-05 Meaning-carrying amber icons are 2.08:1; "Mixed" is never explained

- Severity: P2
- Surface: web, desktop
- Evidence: measured light 2.08:1, dark 9.27:1 for `text-warning` (`oklch(0.769 0.188 70.08)`) on the card. Sites: Mixed layers icon `SettingInheritance.tsx:252` (`state === "mixed" && "text-warning"`); conflict and unknown-condition triangles `KeybindingsSettings.tsx:227` (`WarningTooltipIcon`, 14 px); browser-shortcut notice `:1257`; the "Only available in the desktop app." icon `settingsLayout.tsx:277` (`InfoIcon ... text-warning`, which is a neutral availability note, not a warning). The Mixed control itself shows a muted "Mixed" in a select and the page says nothing about how to resolve it; the answer ("picking a value applies it to every selected environment") is only in `docs/user/project-settings.md:19-20`. [shot: project-two-checkouts-top-light-1440x900] (Workspace row: amber icon, "Mixed")
- Current: The state that most needs attention is the least visible, and the way out is a docs sentence.
- Proposed: Use `text-warning-foreground` (4.90:1 light, 11.49:1 dark per DNA 2.7) on the three warning sites; make the desktop-only icon `text-muted-foreground`. When `mixed`, default the row `status` (`settingsLayout.tsx:499`) to "Differs across the selected environments. Choose a value to apply it to all."
- DNA: DNA-C5 (icons that carry meaning >= 3:1), DNA-C6, DNA-V5.
- Effort: S
- Risk: `warning-foreground` is themeable (T3 Chat, Grove, ...); check the five palettes. Tests: `SettingInheritance.test.ts` unaffected.
- Upstream-eligible: no for the `settingsLayout.tsx` part; yes for `SettingInheritance.tsx` and `KeybindingsSettings.tsx`
- #24865: not addressed (the PR keeps the Mixed icon visible but leaves its colour and copy alone)

### F-08-06 Reset controls disagree: aria says default, tooltip says inherited, the list says "Reset it"

- Severity: P3
- Surface: web, desktop
- Evidence: `settingsLayout.tsx:538` always labels the button `Reset ${label} to default`, while in a project scope the tooltip is "Reset to inherited value" (`:382`). Measured on Permissions with a project override: aria-label "Reset Permissions to default", tooltip "Reset to inherited value". In the popover's "Overridden by" list the one-project action reads "Reset it" and the many-project action "Reset all" (`SettingInheritance.tsx:393`); the docs name only "Reset all" (`project-settings.md:24`). On the Actions row the same button deletes data (F-08-17) under the label "Reset Actions to default".
- Current: Three phrasings for one action, and the accessible name is wrong in the case where the action is not "to default".
- Proposed: `SettingResetButton` takes `tooltip` and derives `aria-label={`${tooltip.replace("Reset", `Reset ${label}`)}`}` so they cannot diverge (e.g. "Reset Permissions to inherited value"). In the popover replace `Reset {n === 1 ? "it" : "all"}` with `Reset override` / `Reset {n} overrides`.
- DNA: DNA-V2, DNA-V7.
- Effort: XS
- Risk: Tests that query by the old aria text (`ProjectSettingsPanel.browser.test.tsx`) need updating.
- Upstream-eligible: no (settingsLayout.tsx modified by #24865)
- #24865: not addressed

### F-08-07 Keybindings offers a project picker and fans saves out to every environment

- Severity: P2
- Surface: web, desktop
- Evidence: `/settings/keybindings` is not in `SETTINGS_DEVICE_ONLY_PATHS` (`SettingsScopeSentence.tsx:44`), so it shows "Applying settings for All projects across All environments" [shot: keybindings-top-light-1440x900]. Bindings live in one `keybindings.json` per environment; the page lists only the primary environment's rows (`KeybindingsSettings.tsx:1289-1296` reads `useSettingsScope().environment`) but `saveKeybinding` and `removeKeybinding` write to every connected environment (`:1350-1386`, `:1388-1417`; `connectedEnvironments.map` at `:1367` and `:1399`). The project axis does nothing here except for `script.*` rows. Only one environment exists on this host, so the fan-out is code-read. Family of F-07-08.
- Current: A user with two machines edits "Chat: New" while looking at machine A's list and also changes machine B's file, with no cue that they did.
- Proposed: Render the page with `singleEnvironment` (the Providers page already does) and no project picker, and write only to the selected environment; the `on {environment}` text then states the target. Rows stay primary-environment by default.
- DNA: DNA-P3, DNA-L6, DNA-P9 (remote ready).
- Effort: M
- Risk: Multi-environment users lose the implicit "set everywhere" behaviour; offer "Apply to all environments" as an explicit button if wanted. No test covers the fan-out.
- Upstream-eligible: yes
- #24865: not addressed

### Group B: General page

### F-08-08 Commit-on-blur fields silently lose typed text when Settings closes with Esc

- Severity: P1
- Surface: web, desktop
- Evidence: Reproduced twice. (a) `/settings/general`, type "probe-zz-instructions" into Thread title instructions, press Esc: Settings closes, reopen, the field is empty and nothing was saved. (b) Project page: rename to "probe-renamed-by-esc", press Esc: name unchanged after reopening; the same edit closed with the X button committed ("settings-probe-x"). The fields commit only in `onBlur`: `ThreadTitleInstructionsSettings.tsx:50`, `ProjectSettingsPanel.tsx:491`, `StorageSettings.tsx:95`, `BranchNamingSettings.tsx:107,146`, and `DraftInput` (`ui/draft-input.tsx` over `hooks/useCommitOnBlur.ts`, used for Add project starts in at `SettingsPanels.tsx:1643`). Unmounting a focused element does not fire React's blur, and `useCommitOnBlur` has no unmount flush. No "saved" feedback exists anywhere on these rows. A related quirk: committing an empty project name shows the "Project title cannot be empty" toast but leaves the input visibly empty (`ProjectSettingsPanel.tsx:281`). [shot: project-name-empty-warning-toast-light-1440x900]
- Current: The fastest way out of Settings (Esc, which F-07-01 already shows is overloaded) throws away what the user just typed in the highest-effort fields on the page, with no warning.
- Proposed: Smallest fix: in `AppRouteModal`'s close path call `(document.activeElement as HTMLElement | null)?.blur()` before navigating, which flushes every blur handler synchronously. Durable fix: give the existing `hooks/useCommitOnBlur.ts` a ref-backed unmount flush (commit the current draft in a `useEffect` cleanup when it differs from `value`), add a `DraftTextarea` beside `DraftInput`, and move the four hand-rolled fields (`ThreadTitleInstructionsSettings`, `BranchNamingSettings` x2, `StorageSettings` worktree location, project Name) onto them; on an empty or rejected commit restore the previous value instead of leaving the field blank. Add a 1.2 s `CheckIcon size-3 text-success-foreground` next to the row title after a successful commit.
- DNA: DNA-P3, DNA-P7 (a way out that does not eat input).
- Effort: S for the blur flush, M for the hook
- Risk: Flush-on-close can commit half-typed values (an invalid worktree path); validate before commit as the fields already do. No test covers `useCommitOnBlur`; add one hook test (unmount with a dirty draft commits once).
- Upstream-eligible: yes for the `AppRouteModal` flush (small, fix-shaped; `AppRouteModal.tsx` is not in #24865); the hook change (`hooks/useCommitOnBlur.ts`, `ui/draft-input.tsx`) is also yes; migrating `SettingsPanels.tsx` call sites waits for #24865
- #24865: not addressed

### F-08-09 General sections: Behavior holds 16 unrelated rows, Organization 9, worktree rows are split

- Severity: P2
- Surface: web, desktop
- Evidence: measured section row counts: New threads 4, Organization 9, Behavior 16, Projects & threads 2, Confirmations 3 (page 3,785 px). "Organization" (`SettingsPanels.tsx:863`) holds Project grouping and Project order plus seven thread-lifecycle rows (resume, snooze, compact idle, four auto-settle rows). "Behavior" (`:1123`) mixes notifications, time format, response streaming, three diff defaults, proactive panels, five composer rows, provider update checks, restart continuation and background activity. "Start from remote" and "Add project starts in" sit in a two-row "Projects & threads" section (`:1593`) away from Workspace and Submodules in New threads. Mobile already groups the thread rules as "Thread behavior" (`SettingsThreadsRouteScreen.tsx`). [shot: general-top-light-1440x900]
- Current: A user looking for the diff defaults, the send shortcut or auto-settle scrolls a 16-row mixed list; the page has no sub-structure beyond one title.
- Proposed: Keep every `searchableSetting` id (deep links and search keep working) and regroup the `SettingsSection`s: New threads (Model, Permissions, Workspace, Submodules, Start from remote); Threads (`id="threads"`: resume, snooze, compact idle, auto-settle x4); Sidebar (Project grouping, Project order); Notifications (2); Composer (Skills, Rich text, Collapse, Send shortcut, Follow-up); Diffs (whitespace, file state, layout, Proactive panels); Display (Time format, Response streaming); Maintenance (Provider update checks, Continue threads, Background activity); Projects (Add project starts in). Update `settingsSearch.ts` `targetId`s that point at section ids (`organization`, `behavior`).
- DNA: DNA-L6 (page = scope sentence then sections), DNA-D1.
- Effort: M
- Risk: Anchors `#organization`, `#behavior` change; keep both as aliases for one release. `settingsSearch.test.ts` asserts targets.
- Upstream-eligible: no (SettingsPanels.tsx, settingsSearch.ts modified by #24865)
- #24865: not addressed (it only adds a row to Appearance)

### F-08-10 "Project order: Manual" has no way to arrange projects in the default sidebar

- Severity: P2
- Surface: web, desktop
- Evidence: `SettingsPanels.tsx:113-117,923-936` offers "Last user message", "Created at" and "Manual". The only writer of the manual order is `reorderProjects` (`uiStateStore.ts:376`), called only from `LegacySidebar.tsx:3387`. With Manual selected in the default flat sidebar, the project filter menu has 0 drag handles and the order silently follows whatever `t3code:ui-state:v1` `projectOrder` holds. [shot: sidebar-project-filter-with-manual-order-light-1440x900] The row description is "Order of projects in the sidebar project picker and command palette." and says nothing about how to arrange.
- Current: A choice that implies "I will order them myself" leads nowhere unless the legacy sidebar is enabled.
- Proposed: Disable the Manual option unless `settings.legacySidebarEnabled` or `projectOrder.length > 0`, with the option description "Drag projects in the legacy sidebar." Preferred but larger (L): add drag handles to the rows of the project filter menu (`Sidebar.tsx` filter popover) using the existing `reorderProjects`. Relabel "Last user message" to match the key (`updated_at`) or fix the key's meaning.
- DNA: DNA-P3 (a setting that lies), DNA-P2.
- Effort: S (disable and describe) or L (drag)
- Risk: Users who already have Manual keep it; do not rewrite the stored value.
- Upstream-eligible: no (SettingsPanels.tsx modified by #24865)
- #24865: not addressed

### F-08-11 Model "Automatic" is unexplained and pinning is silent (#6508)

- Severity: P3
- Surface: web, desktop
- Evidence: `ProjectDefaultsSettings.tsx:140-160`: when `defaultModelSelection === null` the row shows a picker prefilled with "GPT-5.6-Terra / Medium" and a 12 px caption "Automatic". Docs (`composer.md`): "Provider, model and options are remembered for new threads. A project's configured model takes precedence." Choosing the model that is already shown writes an explicit selection (`setModel(createModelSelection(...))`) and the Automatic caption disappears; only the small reset arrow ("Reset to default") hints at the change. Issue #6508 (6 reactions, 8 comments) is the user-visible symptom: new threads do not carry the last model and mode. [shot: general-top-light-1440x900]
- Current: Users cannot tell whether the Model row is a fixed default or a mirror of "what I used last", nor that a click pins it.
- Proposed: Description for the null state: "Automatic: new threads start with the model you used last. Pick a model to pin it." After a pick, `status` "Pinned" and change the reset tooltip to "Use last model (Automatic)". Verify #6508 separately in area 04.
- DNA: DNA-V5, DNA-P3.
- Effort: XS
- Risk: Copy only. #24865 changes the same description string (merge conflict risk).
- Upstream-eligible: no (ProjectDefaultsSettings.tsx modified by #24865)
- #24865: partial (moves "Automatic" into the description as "selected automatically" but not what it resolves to or what a click does)

### F-08-12 Accessible names drop the visible label on 9 controls

- Severity: P3
- Surface: web, desktop
- Evidence: measured by comparing each row's `h3` to its control's `aria-label` (WCAG 2.5.3 Label in Name): "Time format" -> `Timestamp format` (`SettingsPanels.tsx:1160`); "Provider update checks" -> `Check provider versions` (`:1547`); "Start from remote" -> `Start new worktrees from remote by default` (`:1620`); "Add project starts in" -> `Add project base directory`; "Unpin confirmation" -> `Confirm thread unpinning`; "Archive confirmation" -> `Confirm thread archiving`; "Delete confirmation" -> `Confirm thread deletion`; Project page "Choose icon" button -> `Choose a project icon` and "Choose file" -> `Choose a project icon file` (`ProjectSettingsPanel.tsx:531,541`). Speech-control users who say the visible words do not match.
- Current: Seven General rows and two project buttons name themselves differently to the eye and to assistive tech.
- Proposed: Set each `aria-label` to the visible row title (or let `SettingsRow` pass its `title` to the control through `aria-labelledby`), and drop the two project-button aria-labels so the text content names them.
- DNA: DNA-P8 (accessibility is polish, inaccessible = P1 only when blocked), DNA-V7.
- Effort: XS
- Risk: Tests that query by the old names.
- Upstream-eligible: no (SettingsPanels.tsx modified by #24865)
- #24865: partial (the two renamed rows get matching aria-labels; the rest unchanged)

### Group C: Project page

### F-08-13 The Project page never shows where the project lives

- Severity: P2
- Surface: web, desktop
- Evidence: `ProjectSettingsPanel.tsx:312,553` renders the Checkouts section only when `group.memberProjects.length > 1`. For the common single-checkout project the page has Name, Project icon, New threads, Actions and Danger, and no path; the scope picker adds the path only when more than one environment exists (`SettingsScopeSentence.tsx` `secondary`). [shot: project-top-light-1440x900]
- Current: To find out which folder a project points at, or to open it, the user leaves Settings.
- Proposed: Always render a first row "Location" (`SettingsRow`, description = `workspaceRoot` through `StartTruncatedPath` with a `Tooltip` for the full path) with two `size="icon-sm"` ghost buttons: Copy path and "Open in {editor}" (`useOpenInPreferredEditor`, the same call `KeybindingsSettings.tsx:1307` uses for `keybindings.json`). Keep the Checkouts section for groups.
- DNA: DNA-P2, DNA-L8, DNA-P9.
- Effort: S
- Risk: Remote environments cannot open local editors; hide "Open in" when `availableEditors` is empty (the helper already disables).
- Upstream-eligible: yes
- #24865: not addressed

### F-08-14 The "No project" scratch entry gets a full, removable Project page

- Severity: P2
- Surface: web, desktop
- Evidence: Settings > Project lists "No project /tmp/t3code-overhaul/scratch" and opens a normal Project page with Name, Project icon ("message-square-dashed · gray"), Workspace ("Where new threads in this project start"), Actions, and "Remove project: Deletes the project entry and its threads." [shot: project-no-project-entry-light-1440x900]. `SidebarProjectSnapshot.isScratch` exists (`sidebarProjectGrouping.ts:54`) and is what labels the entry "No project". Docs (`thread-sidebar.md`) say branch, worktree and diff controls stay hidden for these threads.
- Current: One click on the red button deletes every no-project thread the user has, and the Workspace and Actions rows promise worktree behaviour the scratch directory cannot have.
- Proposed: In `ProjectDetail`, when `group.isScratch`: show Name read-only, hide Workspace, Actions, Checkouts and Danger, and add a note "Threads started without a project run here. Clear them from the sidebar." If removal must stay possible, move it behind a confirm that states the thread count (the dialog from `planProjectRemoval` already does).
- DNA: DNA-P3, DNA-P7.
- Effort: S
- Risk: None known.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-15 Monogram accepts three letters, closes the dialog, then fails with "Failed to mutate project." (#22793)

- Severity: P2
- Surface: web, desktop
- Evidence: Reproduced live: Choose icon > Monogram > "ABC": the preview tile shows ABC, "Save icon" stays enabled, the dialog closes, and a toast reads "Failed to update project icon / Failed to mutate project." [shot: project-icon-monogram-abc-save-error-toast-light-1440x900] [shot: project-icon-picker-monogram-invalid-light-1440x900]. `ProjectMonogramText` allows 32 characters (`packages/contracts/src/project.ts:76-79`, comment: "Grapheme-count validation belongs to the server command boundary"), so `validMonogram` (`ProjectIconPickerDialog.tsx:93`) is true; the hint "One or two letters or numbers." (`:204`) is static, not an error. Emoji input is correctly rejected (Save disabled); " a1 " is trimmed and accepted.
- Current: Known issue #22793 still reproduces; the user loses the dialog and learns nothing.
- Proposed: Count graphemes with `Intl.Segmenter` (already used in `ProjectMonogram.tsx:5`): `const graphemes = [...segmenter.segment(monogram)].length; validMonogram = isMonogramText(monogram) && graphemes <= 2`. Turn the hint into an inline error (`text-destructive`, "Use one or two letters or numbers.") when `!validMonogram && letters.length > 0`. Keep the dialog open on a failed save (await `setProjectIcon` result before `onOpenChange(false)`).
- DNA: DNA-V3 (say what failed, then why), DNA-I5.
- Effort: S
- Risk: Server rule is two graphemes; keep both checks. `projectIconOptions.test.ts` covers helpers only.
- Upstream-eligible: yes (#22793, small, fix-shaped)
- #24865: not addressed

### F-08-16 Project icon row: raw lucide slug, "Choose file" is not an upload, docs promise an "Automatic" choice

- Severity: P3
- Surface: web, desktop
- Evidence: `ProjectSettingsPanel.tsx:503-512` prints `${projectIcon.name} · ${projectIcon.color}` ("message-square-dashed · gray", "folder-code · blue"); the picker already has a human `iconLabel()` (`ProjectIconPickerDialog.tsx:44`). "Choose file" opens a command-palette style search of image files inside the project's own checkout (`ProjectFaviconPickerDialog.tsx`), with "Open in Finder" only for the primary environment; there is no upload on web. `docs/user/project-settings.md:213-217` says "Choose **Automatic** to let T3 Code detect an icon again" and "emoji, monogram, or image", but the UI has no Automatic control: the way back is the small reset arrow, visible only after an icon is set, and "Automatic" is just the description text. Three names for one dialog: button "Choose icon", aria "Choose a project icon", title "Choose project icon".
- Current: The row speaks in file-system and icon-library terms and the docs describe a button that does not exist.
- Proposed: Description: `Lucide: Folder code, blue` -> "Folder code, blue"; emoji and monogram unchanged. Rename "Choose file" to "From project files" and add a tooltip "Pick an image already in this checkout". Replace the reset arrow's tooltip on this row with "Use automatic icon". Fix the docs sentence to name the reset arrow.
- DNA: DNA-V2, DNA-V7, DNA-I5.
- Effort: XS
- Risk: Copy only; `ProjectSettingsPanel.browser.test.tsx` queries "Choose icon".
- Upstream-eligible: yes
- #24865: not addressed

### Group D: Actions (project scripts) and t3.json

### F-08-17 Reset on the Actions row deletes every action with no confirmation

- Severity: P2
- Surface: web, desktop
- Evidence: `ProjectActionsSettings.tsx:125` (`onResetOverride={() => void persist(() => null)}`) renders the shared reset arrow next to the Actions title (`SettingResetButton`, aria-label "Reset Actions to default", tooltip "Reset to inherited value"). Reproduced on the probe project: four imported actions disappeared on one click; no dialog, no toast, no undo. Deleting a single action does confirm (`projectScriptEditor.tsx:200-225`, "Delete action "X"?"). [shot: project-actions-after-reset-no-confirm-light-1440x900]
- Current: The cheapest control on the row destroys the most data, and its name ("reset to default") does not say so.
- Proposed: Route it through the same `AlertDialog` as single delete: title "Remove all {n} actions from this project?", body "The project goes back to the environment's actions ({m}). Actions that exist in t3.json can be imported again.", destructive button "Remove actions". Rename the aria-label via F-08-06.
- DNA: DNA-P7 (one-way door), DNA-V2.
- Effort: S
- Risk: `useProjectScriptSettings.browser.test.tsx` covers `persist`; add a case for the confirm.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-18 Edit affordance on actions is invisible at rest; the row is not clickable; truncated names have no tooltip

- Severity: P2
- Surface: web, desktop (and every coarse-pointer or hover-less client)
- Evidence: `ProjectActionsList.tsx:59-67`: the edit button is `opacity-0 group-focus-within:opacity-100 group-hover:opacity-100`, a 24 px `icon-xs` gear (`SettingsIcon`, aria "Edit {name}"). Measured opacity 0 at rest, box 24x24. The row itself does nothing on click. The Keybindings menu already adds `pointer-coarse:opacity-100` for the same pattern (`KeybindingsSettings.tsx:980`), so DNA-X4 is met there and not here. Names truncate ("Dev server with a very long name that keeps going and going p…") and so do commands (`bun run dev --port 5173 ... --mode d…`) with no `title` or tooltip; the full command is visible only inside the editor. The shortcut is plain `text-xs` text, not `Kbd`. Pills `setup`, `on settle`, `preview · desktop only` are lowercase 11 px jargon. [shot: project-actions-list-light-1440x900] [shot: project-actions-row-hover-edit-gear-light-1440x900]
- Current: A touch or tablet user cannot discover how to edit an action; a mouse user must hover to learn a gear exists.
- Proposed: Make the title a `Button variant="ghost"` that opens the editor (row-wide hit area), show a `PencilIcon size-3.5 text-muted-foreground` at rest (and `opacity-0` only under `any-hover:hover`), wrap name and command in `Tooltip` (as the Checkouts rows do, `ProjectSettingsPanel.tsx:419-423`), render the shortcut with `KbdGroup` + `formatShortcutLabel`, and rename the pills "Runs on worktree create", "Runs on settle", "Preview: desktop only" in sentence case.
- DNA: DNA-X4, DNA-L8, DNA-I2 (pencil for edit), DNA-V1.
- Effort: S
- Risk: Row click must not fire when the user selects text in the command; test with the existing `ProjectSettingsPanel.browser.test.tsx`.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-19 The "Import scripts" menu has no width cap (spills over the nav) and no "Import all"

- Severity: P2
- Surface: web, desktop
- Evidence: `ProjectActionsSettings.tsx:144-170` (`MenuPopup align="end"`, items with `truncate font-mono` commands inside `min-w-0 flex-1`, but the popup sizes to content). Measured with a 120-character command in `t3.json`: popup x=227..1148 (921 px wide), drawn over the Settings nav and the page header. Each import closes the menu; four scripts take four open-click cycles. The helper text says "Add actions declared by this checkout without editing them first." [shot: project-actions-import-menu-light-1440x900]
- Current: A long command (common for dev-server scripts) makes the popup larger than the content column.
- Proposed: `MenuPopup className="max-w-[min(32rem,calc(100vw-2rem))]"`; items `line-clamp-1` with the command in `text-2xs` mono; first item "Import all {n} scripts" when n > 1 (a loop over `importFileScript`, stop on first failure).
- DNA: DNA-S1/DNA-D5 (popup rows), DNA-P2.
- Effort: S
- Risk: `importFileScript` posts one command per script; "Import all" should not partially fail silently (collect failures into one toast).
- Upstream-eligible: yes
- #24865: not addressed

### F-08-20 Action shortcut field: raw tokens, accepts bare keys, no conflict warning

- Severity: P2
- Surface: web, desktop
- Evidence: `projectScriptEditor.tsx:313-326` (`captureKeybinding`, `:471-486` the read-only input). Measured: Cmd+K shows `mod+k`; Ctrl+Alt+Shift+P shows `ctrl+alt+shift+p`; Enter alone shows `enter`; no message appears although `mod+k` is `commandPalette.toggle` (`!terminalFocus`). Script bindings are appended after defaults and rules are resolved last-to-first (`keybindings.ts:173`), so the action would take over Cmd+K. The Keybindings page, by contrast, warns on conflicts (`keybindingConflictLabels`) and renders glyph pills. [shot: project-action-dialog-conflicting-shortcut-no-warning-light-1440x900]
- Current: The same concept (record a shortcut) has two implementations with different safety and different display.
- Proposed: Render the value through the shared pill (`formatShortcutParts`, F-08-27) inside `KbdGroup`; run `keybindingConflictLabels(buildKeybindingRows(serverConfig.keybindings), { rowId: "new", key, when: "" })` and show `text-xs text-warning-foreground` "Also used by Command Palette: Toggle. This action takes over the shortcut."; reject a binding with no modifier (the dialog has no `when` field, so a bare `enter` or `c` would fire the action everywhere outside text fields).
- DNA: DNA-P3, DNA-L8.
- Effort: S
- Risk: Reuses logic in `KeybindingsSettings.logic.ts` (import it already; `projectScriptEditor.tsx:30` does).
- Upstream-eligible: yes
- #24865: not addressed

### F-08-21 "t3.json is invalid" looks like an ordinary row

- Severity: P2
- Surface: web, desktop
- Evidence: `ProjectActionsSettings.tsx:195-199` passes `className="text-warning"` to a `SettingsRow`, but the row sets its own colours on the children (`h3 text-foreground`, `p text-muted-foreground/80`, `settingsLayout.tsx:484,495`); measured h3 `oklab(0.274 ...)` and description `oklab(0.552 ... / 0.8)`, root amber but unused. The notice renders after "No actions configured." with no icon. One bad icon name or a trailing comma makes `parseT3ProjectFile` return null, which discards every script, `iconPath` and `defaultThreadEnvMode` the file declares; the message does not say which field failed. A file over the read limit (`useT3ProjectFileScripts.ts`: `query.data.truncated`) is reported as "missing", not invalid. [shot: project-actions-invalid-t3-json-light-1440x900]
- Current: The failure that silently ignores a team's checked-in config is shown as a neutral paragraph.
- Proposed: Replace the row with `Alert variant="warning"` (`ui/alert.tsx`, `alert-glass` tint) with `TriangleAlertIcon`, placed above the list; show the first `SchemaError` path from `parseT3ProjectFile` ("scripts[0].icon: expected one of play, test, lint, configure, build, debug"); render a separate "t3.json is too large to read" state for truncated files.
- DNA: DNA-C6 (status semantics), DNA-V3.
- Effort: S
- Risk: `parseT3ProjectFile` currently returns `null`; add a `{ error }` variant (shared package, additive).
- Upstream-eligible: yes
- #24865: not addressed

### F-08-22 Action editor copy: Title Case titles, "This action cannot be undone", field order, Preview URL on web

- Severity: P3
- Surface: web, desktop
- Evidence: `projectScriptEditor.tsx:414` "Edit Action" / "Add Action" (the row button says "Add action"; DNA-V1); `:209` "Delete action "Setup"?" with "This action cannot be undone." (the same noun twice, one a noun and one a pronoun); field order is Name, Keybinding, Command (`:423-496`), so the one required field follows the optional shortcut; Preview URL helper "Open this URL in the in-app preview when this action runs." (`:507`) appears on web while the list pill says "desktop only" (`ProjectActionsList.tsx:48`) and the t3.json schema says "Only honored on the desktop build" (`t3ProjectFile.ts`). [shot: project-action-dialog-add-light-1440x900] [shot: project-action-delete-confirm-light-1440x900]
- Current: Small copy and ordering defects that make the dialog feel unfinished next to the rest of Settings.
- Proposed: Titles "Add action" / "Edit action"; delete body "The action and its shortcut are removed from this project."; order Name, Command, Keybinding, Preview URL; on non-desktop show "Desktop app only. Ignored in the browser." and disable the `autoOpenPreview` switch.
- DNA: DNA-V1, DNA-V5, DNA-P3.
- Effort: XS
- Risk: `projectScriptEditor` tests query by label text.
- Upstream-eligible: yes
- #24865: not addressed

### Group E: Keybindings

### F-08-23 Tab is recorded as a shortcut instead of moving focus

- Severity: P2
- Surface: web, desktop
- Evidence: `KeybindingsSettings.tsx:738-742` and `:1050-1054`: `if (event.key === "Tab" && !isRecording) return;` while the input's `onFocus` sets `isRecording: true` (`:824`, `:1141`). Reproduced on "New keybinding": focus the key input, press Tab: the value becomes `tab` and focus stays; the next Tab moves on, leaving a pending `tab` binding with Save enabled. Esc cancels, but nothing says so (placeholder "Press shortcut"). Existing rows behave the same after Enter on the pill (autofocus plus recording). A keyboard-only user who tabs through the form (command select, key, Save) corrupts the draft on the way.
- Current: A focus key is swallowed; the recorder is a partial keyboard trap with an unannounced exit.
- Proposed: Do not intercept unmodified Tab or Shift+Tab (return before `preventDefault()`); allow `tab` only with Cmd/Ctrl/Alt. Placeholder "Press shortcut. Esc cancels." and `aria-describedby` on the same text; keep the `data-keybinding-capture` opt-out for global handlers.
- DNA: DNA-L8, DNA-P7; non-negotiable 6 (keyboard paths).
- Effort: XS
- Risk: Users who want a bare Tab binding lose it (it is a poor default). `KeybindingsSettings.logic.test.ts` covers `keybindingFromKeyboardEvent`, not the handler: add a browser test.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-24 Keybindings search does not match what the page shows

- Severity: P2
- Surface: web, desktop
- Evidence: `KeybindingsSettings.logic.ts:286-300` matches `row.command`, `commandLabel`, the raw stored `row.key` (`mod+k`), `row.when` and `row.source`. Measured queries: `cmd+k`, `⌘K`, `cmd`, `ctrl`, `option`, `return`, `esc`, `⌘+` return "No keybindings match your search."; `mod+k`, `enter`, `alt`, `shift+enter` match. The rows display glyphs (⌘ ⇧ ⌥), so the thing the user sees cannot be typed into the search.
- Current: Search by shortcut, the most natural query ("what is ⌘K?"), fails except with the internal `mod+` vocabulary.
- Proposed: Build a search haystack from `formatShortcutLabel(row.binding.shortcut)` plus platform words (mac: "cmd command ⌘ option ⌥ shift ⇧ control ctrl ⌃ return enter esc escape"; others: "ctrl control alt shift win super"), and normalise the query (`⌘`, `cmd`, `command` -> `mod` on macOS; `option` -> `alt`; `return` -> `enter`; strip spaces around `+`). Keep the raw matches.
- DNA: DNA-L8, DNA-V5.
- Effort: S
- Risk: `KeybindingsSettings.logic.test.ts` has filter tests; extend.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-25 Bindable commands without a default have no row, so they cannot be found

- Severity: P2
- Surface: web, desktop
- Evidence: 84 commands in `STATIC_KEYBINDING_COMMANDS` (`packages/contracts/src/keybindings.ts`), 82 default rules covering 79 commands (`packages/shared/src/keybindings.ts:147-234`; MAP says 66, stale). `buildKeybindingRows` builds rows from bindings only (`KeybindingsSettings.logic.ts:262-300`), so `rightPanel.toggleMaximized`, `composer.cycleHost`, `composer.increaseEffort`, `composer.decreaseEffort` and `thread.stop` have no row. The docs send users there: "bind **Composer: Cycle Host** in Keybindings", "assign one in **Settings → Keybindings**" for `thread.stop` (`keybindings.md:34,38,47`). Measured: searching `stop`, `thread.stop`, `cycle host`, `increase effort` finds nothing. The only route is Add keybinding and scrolling an 84-item `Select` (F-08-28). [shot: keybindings-add-row-command-list-light-1440x900]
- Current: The page says "no keybindings match" for commands the docs tell you to bind there.
- Proposed: Have `buildKeybindingRows` emit an "Unassigned" row (`key: ""`, `source: "Default"`) for every static command with no binding; render the key control as an "Assign" ghost button that starts recording (the `isRecording` path of `KeybindingKeyControl`); include them in search and groups.
- DNA: DNA-L8, DNA-P3 (the list must be the list).
- Effort: S
- Risk: Row count rises by 5; the "New keybinding" flow stays for custom `when`.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-26 "Preview: Zoom In" (⌘+) renders two empty key boxes

- Severity: P2
- Surface: web, desktop
- Evidence: `KeybindingPill` splits the stored string on `+` (`KeybindingsSettings.tsx:79-86`); the default `mod++` becomes `["mod", "", ""]` and renders three `Kbd`: ⌘ and two empty boxes (the comment above the code says a literal `+` splits into empty strings but only de-duplicates React keys). On Windows it renders `Ctrl` and two empty boxes. [shot: keybindings-zoom-in-plus-key-empty-kbd-light-1440x900]
- Current: A shipped default is displayed as "⌘ [] []".
- Proposed: Render from the resolved `KeybindingShortcut` (`row.binding.shortcut`, which already carries `key: "+"`) through the shared formatter from F-08-27; never split strings.
- DNA: DNA-P3.
- Effort: XS (rides with F-08-27)
- Risk: None; add one logic test for `mod++`.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-27 `KeybindingPill` re-implements `formatShortcutLabel`: lowercase tokens, ⌘⌥⇧ order, ⇧ on Windows, "Meta"

- Severity: P2
- Surface: web, desktop
- Evidence: `KeybindingsSettings.tsx:79-120` maps `mod/shift/alt/ctrl` with its own `navigator.platform.toLowerCase().includes("mac")` and prints every other part raw. Measured: `Queue: Edit Last Queued Message` shows "⌥ arrowup", `Queue: Send First Queued Message` "⌘ ⇧ enter", `Composer: Opposite Queue or Steer Action` "⌘ enter", Model Picker rows "⌘ ⇧ arrowdown". Order follows the stored string, so `mod+alt+shift+a` renders "⌘ ⌥ ⇧ A", while every tooltip uses `formatShortcutLabel` (`keybindings.ts:219-241`, order ⌃⌥⇧⌘): the sidebar tooltip reads "New thread (⇧⌘O)" and this page shows "⌘ ⇧ O". On Windows the page shows "Ctrl ⇧ F" (Mac shift glyph with a Ctrl word) [shot: keybindings-top-windows-platform-light-1440x900]; `formatShortcutLabel` prints "Meta" on Windows/Linux (`:239`), a word users do not have a key for (Win, Super). The row's aria-label uses `formatShortcutLabel`, so sighted and screen-reader order differ. [shot: keybindings-lowercase-key-names-light-1440x900]
- Current: Two formatters, three vocabularies; the page the user trusts for shortcuts is the least consistent.
- Proposed: Add `formatShortcutParts(shortcut, platform): string[]` beside `formatShortcutLabel` (same ordering rules; `formatShortcutKeyLabel` for keys; arrows as ↑ ↓ ← →; Enter, Esc, Tab, Backspace in sentence case; Windows/Linux modifiers `Ctrl`, `Alt`, `Shift`, `Win` or `Super` for `meta` by platform; macOS glyphs ⌃⌥⇧⌘), make `formatShortcutLabel` join those parts, and delete the pill's own mapping. One source for tooltips, pills, aria and search (F-08-24).
- DNA: DNA-V1, DNA-V7, DNA-L8, DNA-I2.
- Effort: S
- Risk: Many tooltips use `formatShortcutLabel`; keep its output byte-identical on macOS for existing tests (`keybindings.test.ts`), change only Windows/Linux `Meta`.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-28 Recording shows raw tokens, dirty rows cannot be discarded, the command select shows the raw ID

- Severity: P2
- Surface: web, desktop
- Evidence: New binding: after choosing "Composer: Increase Effort" the select trigger reads `composer.increaseEffort` (`SelectValue placeholder="Command"` with no label render, `KeybindingsSettings.tsx:1106`; menu items use `commandLabel`) and the recorded key reads `mod+alt+shift+9` in mono (`:1134-1136`) [shot: keybindings-add-row-recorded-raw-token-light-1440x900]. Existing row: record a new key, click away: the row keeps `alt+shift+8` in the input, a blue Save, and no Cancel; the only revert is Esc while still focused (`:743`) [shot: keybindings-row-dirty-after-blur-light-1440x900]. The Command `Select` lists 84 items with no type-ahead filter. Filtering the list with the search box unmounts a dirty row and drops its draft without a word.
- Current: The moment of recording (the whole point of the page) is the one place that shows machine tokens, and it has no undo.
- Proposed: `SelectValue` render function `(value) => value ? commandLabel(value) : "Command"`; show the pending chord as `KbdGroup` glyphs; add `Button size="icon-xs" variant="ghost" aria-label="Discard change"` with `XIcon` beside Save; replace the 84-item `Select` with the `Combobox` pattern already used for scope menus (`SettingsScopeSentence.tsx:107-128`), filtering on label and ID; keep dirty drafts in the reducer above the filter so searching does not drop them.
- DNA: DNA-P7, DNA-L8, DNA-D5.
- Effort: M
- Risk: `useKeybindingRowEditor` state is per row; lifting it changes a hot path. `KeybindingsSettings.logic.test.ts` unaffected.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-29 The conflict warning is a 14 px tooltip-only icon with no resolution

- Severity: P2
- Surface: web, desktop
- Evidence: `KeybindingsSettings.tsx:208-275` (`WarningTooltipIcon`, `KeybindingConflictWarning`): a 14 px triangle in a 20x20 `span`, `text-warning` (2.08:1 light), message only in a tooltip: "Conflicts with Composer: Increase Effort. The most recent matching binding wins when both conditions can apply." Reproduced with two test bindings on `mod+alt+shift+9`: both rows show the icon after Save; nothing says which one currently wins (the later in `keybindings.json`), nothing offers to fix it, no live region announces it. Detection is string equality on the stored key (`KeybindingsSettings.logic.ts:189`: `candidate.key === input.key`) and treats two different non-empty `when` strings as never overlapping (`:176-178`), so `mod+k` vs `meta+k` on macOS and `terminalOpen` vs `terminalFocus` are missed, while runtime uses `shortcutConflictKey` (`keybindings.ts:92`). [shot: keybindings-new-row-conflict-draft-light-1440x900] [shot: keybindings-conflict-warning-tooltip-light-1440x900] [shot: keybindings-conflict-saved-rows-light-1440x900]
- Current: The page's only guard against silently stealing a shortcut is easy to miss and cannot be acted on.
- Proposed: Under the key control render `text-xs text-warning-foreground` with `role="status"`: "Also used by Composer: Increase Effort. The later rule wins." and a row-menu item "Remove other binding" (calls `removeKeybinding` on the conflicting row). Compare through `shortcutConflictKey` so `mod` and `meta` collapse. Keep the triangle, colour `text-warning-foreground` (F-08-05).
- DNA: DNA-P3, DNA-C5, DNA-V5.
- Effort: M
- Risk: The warning appears on every row of a conflicting pair; keep the menu action on the later row only to avoid ping-pong.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-30 The "When" label is 2.73:1 at 12 px and `Always` chips are 11 px

- Severity: P2
- Surface: web, desktop
- Evidence: `KeybindingsSettings.tsx:960,1203` `text-xs leading-none text-muted-foreground/70`; measured 2.73:1 light, 3.05:1 dark (DNA-C4, DRIFT-1). The chips beside it are `Button size="micro"` with `font-mono` 11 px (measured 11px, 4.75:1 light). 82 rows repeat both.
- Current: The label that explains each row's condition is the faintest text on the page.
- Proposed: `text-muted-foreground` (4.71:1 light, 5.08 dark). Rename the empty state chip from "Always" to "Everywhere" only if copy review agrees; otherwise leave. Keep 11 px (`text-2xs`) for the chip per DNA-T1.
- DNA: DNA-C4, DNA-C5.
- Effort: XS
- Risk: None.
- Upstream-eligible: yes
- #24865: not addressed (the PR fixes row descriptions via `settingsLayout.tsx`, not this label)

### F-08-31 Groups: Navigation Back/Forward land in "Other"; "Other" holds 12 rows; 18 jump rows

- Severity: P2
- Surface: web, desktop
- Evidence: `KeybindingsSettings.logic.ts:204-215` prefixes: Navigation = sidebar, rightPanel, commandPalette, filePicker, projectSearch, editor. Measured group sizes (82 rows): Navigation 8, Threads 23, Composer 23, Terminal 5, Preview & diff 8, Appearance 3, Other 12. "Other" contains `Navigation: Back`, `Navigation: Forward`, `Thread Panel: Toggle`, `Reopen Closed Tab`, `Usage: Open`, `Usage: Cost/Tokens/Limits` and four `Usage: Period` rows because `navigation`, `threadPanel`, `view`, `usage` are not in any prefix list. Sorting is by command id (`:278`), so "Queue: ..." labels sit among "Thread: ..." rows. `Thread: Jump: 1..9` and `Model Picker: Jump: 1..9` are 18 of 82 rows (22%). [shot: keybindings-top-light-1440x900]
- Current: "Other" is a drawer for things that have an obvious home, and a quarter of the page is one idea repeated nine times twice.
- Proposed: Navigation prefixes add `navigation`, `threadPanel`, `view`; new group "Usage" (`usage`); sort rows by `commandLabel`; fold each jump set into one row "Thread: Jump to Nth thread" with a single "⌘ 1-9" pill that expands (`FoldedSettingsSection` already exists) to the nine editable rows.
- DNA: DNA-D1, DNA-V7.
- Effort: S
- Risk: Anchor ids `keybindings-<group>` change for the new group only.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-32 Row density: 73 px per row, 82 rows, 6,709 px

- Severity: P2
- Surface: web, desktop
- Evidence: measured pitch 73 px (`SettingsRow` `py-3`, title 20 px, "When" line 24 px), page scrollHeight 6,709 px at 1440x900 (8.7 screens); below the 32 rem container breakpoint (800x600 and the Project page's narrow cases) each row stacks to about 113 px [shot: keybindings-top-light-800x600]; at 390 px the pill drops under the When chip [shot: keybindings-top-light-390x844]. DNA-D1/D5: lists of actions are 24-32 px rows; entities get 56-80.
- Current: A command list is rendered with entity-card density, so a user scrolls nine screens to scan shortcuts.
- Proposed: A dedicated `KeybindingRow` (not `SettingsRow`): one line, `grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 px-3 py-2` (40 px), label left, When chip (`text-2xs`, `max-w-48 truncate`, opens the existing popover) in the middle, pill right; stack the When chip under the label only below 32 rem. About 3,300 px for 82 rows.
- DNA: DNA-D1, DNA-D5, DNA-P2.
- Effort: M
- Risk: Hover menu, conflict icon and Save button must still fit in 40 px rows; the 20 px `micro` chips fit.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-33 When-condition vocabulary: the UI flags `previewOpen`, docs list `composerDraft`

- Severity: P2
- Surface: web, desktop
- Evidence: `KeybindingsSettings.logic.ts:59-77`: the known set is six core names plus identifiers that happen to appear in `DEFAULT_KEYBINDINGS`. `ShortcutMatchContext` (`keybindings.ts:27-36`) and callers set more: `previewOpen` (`AppSidebarLayout.tsx:215`, `routes/_chat.tsx:64`), `composerRequiresModifier` (`composer-logic.ts:79`). Measured in the When editor: `previewOpen` and `composerRequiresModifier` show "T3 Code does not recognize this condition yet"; `composerDraft`, listed as available in `docs/user/keybindings.md` ("When conditions"), is set nowhere (`rg` finds it only in docs) so it always evaluates false; `rightPanelOpen`, `draftThreadRoute` and `composerRequiresModifier` are real and undocumented. The condition select offers only the known list, so `previewOpen` cannot even be picked. [shot: keybindings-when-builder-unknown-condition-light-1440x900]
- Current: Three lists (code, UI, docs) that disagree; the UI warns on a documented key and the docs promise a key that does nothing.
- Proposed: One exported `SHORTCUT_WHEN_KEYS: ReadonlyArray<{ name: string; description: string }>` in `packages/shared/src/keybindings.ts`; `KNOWN_WHEN_VARIABLES`, the select and its item descriptions read it; the docs list is rewritten from it (drop `composerDraft`; add `rightPanelOpen`, `draftThreadRoute`, `composerRequiresModifier`). Show friendly text in the row chip tooltip ("Active when the terminal is not focused") with the raw expression below.
- DNA: DNA-P3, DNA-V5.
- Effort: S
- Risk: Server accepts any identifier (unknown evaluates false); this is display-only.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-34 A bad `keybindings.json` entry produces a 1,905-character schema dump in a toast

- Severity: P2
- Surface: web, desktop
- Evidence: `apps/server/src/keybindings.ts:355-376` stores `Cause.pretty(...)` as `issue.message` and `invalidEntryIssue(index, detail)` carries the entry index; `KeybindingsUpdateToast.logic.ts:26-32` passes only `issues.find(kind startsWith "keybindings.")?.message` to `KeybindingsConfigWarning` (`routes/__root.tsx:596-610`), which prints it above one `size="xs"` "Open keybindings.json" button. Computed with the real schema: `{ "key": "mod+k", "command": "thread.stp" }` gives a 4-line, 1,905-character message beginning `SchemaError: Expected "sidebar.toggle" | "navigation.back" | ...` and listing all 84 commands; an empty key gives `Expected a value with a length of at least 1  at ["key"]`. The index and the count of ignored entries are not shown; with several bad entries only the first is. Not rendered live: reproducing it means corrupting the shared `keybindings.json`.
- Current: The most likely hand-edit mistake (a typo in a command ID) is reported as a wall of schema text in a toast.
- Proposed: In `KeybindingsConfigWarning` format from the issue list: title "keybindings.json: {n} entries ignored", body "Entry {index + 1}: {first line, clipped to 160 chars, line-clamp-3}", keep "Open keybindings.json", and reassure "The other shortcuts still work." (docs: "Invalid rules are ignored"). Longer term the server should emit `{ index, path, expected }` (server change, out of scope for UI work).
- DNA: DNA-V3, DNA-V4 (one error voice).
- Effort: S (UI), server follow-up separate
- Risk: `KeybindingsUpdateToast.logic.test.ts` asserts the message passthrough.
- Upstream-eligible: yes (UI part)
- #24865: not addressed

### F-08-35 "Keybindings updated" toast fires on the user's own save

- Severity: P3
- Surface: web, desktop
- Evidence: `routes/__root.tsx:581-594` toasts "Keybindings updated / Keybindings configuration reloaded successfully." for every `keybindingsUpdated` event, throttled to one per 2 s (`KeybindingsUpdateToast.logic.ts:5,42-48`). Measured: saving or removing a binding from the page triggers it (toast over the page header). Issue #23734 is the Windows variant where reads bump the file's access time. [shot: keybindings-conflict-saved-rows-light-1440x900]
- Current: The page confirms what the user just did with a log-line toast, and watcher noise reaches the user the same way.
- Proposed: Mark local writes (a `lastLocalKeybindingWriteAt` ref set in `saveKeybinding`/`removeKeybinding`) and skip the success toast when an event arrives within 2 s of it; when the event comes from an external edit use "Keybindings reloaded from keybindings.json."; make the row show a 1.2 s `CheckIcon` after Save instead. For #23734 compare a content hash and ignore events where it is unchanged.
- DNA: DNA-P3, DNA-V3.
- Effort: S
- Risk: `KeybindingsUpdateToast.logic.test.ts` covers the cooldown; add a local-write case.
- Upstream-eligible: yes (#23734)
- #24865: not addressed

### F-08-36 Command labels: Title Case, drift from docs, scripts named by ID, "Project scripts" vs "Actions"

- Severity: P3
- Surface: web, desktop
- Evidence: `commandLabel` (`KeybindingsSettings.logic.ts:359-376`) Title-Cases the id segments ("Chat: New Without Project", "Right Panel: Toggle") and special-cases about ten commands. Docs name "**Queue: Send First Queued Message as Steer**" (`keybindings.md:21-23`); the UI says "Queue: Send First Queued Message" (`:363`). `thread.editQueuedMessage` is "Queue: Edit Last Queued Message" in the UI and "most recent" in docs. Script bindings are labelled `Run Script: <Title-cased id>` (the slug, at most 24 characters), not the action's name, in a group titled "Project scripts" (`:215`), while Settings, the editor and docs call them Actions (DNA-V7).
- Current: The page's vocabulary differs from the docs it is documented by, and from the page that creates the rows.
- Proposed: Sentence case through a `LABEL_OVERRIDES` map ("Chat: New without project"); align the two special labels with the docs (or the docs with the UI, in the same PR); label script rows `Run action: {name}` from `defaultProjectScripts`; rename the group "Actions". The docs refer to labels verbatim, so ship both together.
- DNA: DNA-V1, DNA-V7.
- Effort: S
- Risk: `docs/user/keybindings.md` and the palette command titles reference labels; grep before renaming.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-37 `docs/user/keybindings.md` says the page lists command IDs; 51 IDs and most default chords are undocumented

- Severity: P3
- Surface: docs
- Evidence: `docs/user/keybindings.md:2-3` "That page also lists the command IDs and defaults available in your version." IDs appear only in a hover tooltip on each title (`KeybindingRowTitle`, `KeybindingsSettings.tsx:972`) and not at all for the five unbound commands (F-08-25). Computed from the real lists: of 84 command IDs, 51 (excluding `jump.N`) never appear anywhere in `docs/user`; chords `mod+b`, `mod+p`, `mod+shift+f`, `mod+shift+s` (settle), `mod+shift+p` (pin), `mod+o`, `mod+shift+j`, `mod+alt+a` never appear. The docs mix `mod+Enter`, `Cmd/Ctrl+K` and `Cmd+1`.
- Current: The docs are not a reference and say the UI is; the UI hides the IDs the docs name.
- Proposed: Per AGENTS.md ("A new control does not need its own page", no feature enumerations) do not add a table. After F-08-25, change the sentence to "The page lists every command with its shortcut; hover a name to see its command ID." and add the settle and pin shortcuts to `thread-sidebar.md` where those actions are described.
- DNA: DNA-V5, DNA-P3.
- Effort: XS
- Risk: Docs only.
- Upstream-eligible: yes (docs)
- #24865: not addressed

### Group F: Source Control

### F-08-38 Source Control section titles misdescribe their rows and break sentence case

- Severity: P2
- Surface: web, desktop
- Evidence: `ProjectDefaultsSettings.tsx:261` titles the first section "Repositories" over Automatically pull, Remove agent credits when merging and Default merge method; `SourceControlWritingSettings.tsx:181` "Text generation" holds Worktree branch naming, Branch prefix, Source control writing style, Follow change request templates, Source control writer model and Review guides (beta), only one of which chooses a text-generation model; General has its own "Text generation" section, so two pages share a title with different scope. `SourceControlSettings.tsx:598,601,624` "Version Control", "Source Control Providers" (Title Case, DNA-V1) and `:304` "Coming Soon". [shot: source-control-top-light-1440x900]
- Current: Section titles do not predict contents, so users scan every row.
- Proposed: "Repositories" -> "Pulling and merging"; split into "Commit and PR text" (writing style, templates, writer model) and "Branches" (naming mode, prefix); "Review guides (beta)" into its own "Review" section; "Version control", "Source control providers", "Coming soon". Keep the `searchableSetting` ids.
- DNA: DNA-V1, DNA-V5, DNA-L6.
- Effort: S
- Risk: Settings search subtitles use section ids; deep links keep working if ids are unchanged.
- Upstream-eligible: no for the `ProjectDefaultsSettings.tsx` title (modified by #24865); yes for the rest
- #24865: not addressed

### F-08-39 Provider install hints render markdown backticks literally

- Severity: P3
- Surface: web, desktop
- Evidence: `SourceControlSettings.tsx:214` renders `Not available on this server: {item.installHint}`; hints come from `packages/source-control-*` with markdown: GitLab "Install the GitLab command-line tool (`glab`) from https://gitlab.com/gitlab-org/cli or your package manager (for example `brew install glab`)." (`GitLabSourceControlProvider.ts:164`). Seen: literal backticks, unlinked URLs, 12 px muted (3.28:1) for the actionable instruction; GitCafe, Forgejo/Gitea and Azure DevOps rows are worse (two commands each). [shot: source-control-github-expanded-light-1440x900]
- Current: The instruction that unblocks a provider looks like a log line.
- Proposed: A `renderInstallHint(text)` that splits on backticks into `<code className="rounded-sm bg-muted px-1 font-mono text-2xs">` and linkifies `https://` with `target="_blank" rel="noreferrer noopener"`; use `CliCommandSettingsRow`'s copyable command for `brew install ...`.
- DNA: DNA-T7 (mono for machine-typed values), DNA-V5.
- Effort: XS
- Risk: The strings are shared with mobile; render function lives in web only.
- Upstream-eligible: yes
- #24865: not addressed

### Group G: Storage

### F-08-40 Cleanup rules and "Delete now" delete worktrees with no confirmation or preview

- Severity: P1
- Surface: web, desktop
- Evidence: code-read; not exercised because enabling a rule on the shared server would remove other agents' worktrees. `StorageSettings.tsx:164` `onCheckedChange={(enabled) => onChange(enabled ? 8 : null)}` for the three retention rows, and the boolean rows write on toggle (`:521-590`); docs: "Policies ... run at startup, when changed and hourly" (`project-settings.md`), so a switch click starts deleting. `deleteNow` (`:341-361`) and its button (`:391`) run immediately; no dialog, no list of what matches. The default keep rule "Uncommitted changes" "Keeps edits and untracked files. Deletes ignored files, including .env." (`:642`) is the only warning, in 12 px muted text (3.28:1). Results appear after the fact (`CleanupResults`, `:216-273`). [shot: storage-top-light-1440x900]
- Current: One click on a switch can remove directories, including ignored files such as `.env`, with the warning in grey prose.
- Proposed: First enable of any destructive rule, and every "Delete now", opens an `AlertDialog` ("Delete worktrees that match?"): the rule in plain words, the keep rule, and "Deletes ignored files, including .env." in `text-warning-foreground`; destructive button "Delete worktrees" (not "Confirm"); show the default `8 days` in the stepper while the switch is off so the number is visible before commit. A "N worktrees would be removed" preview needs a dry-run server call (`storageCleanupReport` reports only the last run): list as a server dependency.
- DNA: DNA-P7, DNA-P3, DNA-V2.
- Effort: M
- Risk: `StorageSettings.browser.test.tsx` exists; update for the dialog. Do not re-prompt per toggle once a rule is on.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-41 "Machine" and "environment" are used interchangeably across Settings

- Severity: P3
- Surface: web, desktop
- Evidence: Storage "Mixed across selected machines" (`StorageSettings.tsx:447`), "Offline machines will not get this setting" (`:585`), "Update the selected machines to configure project worktree cleanup." (`:465`); the layers popover "Same on all machines" (`SettingInheritance.tsx`); Project page "Deletes the selected machine's checkout entries ... Other machines" (`ProjectSettingsPanel.tsx:558-566`); URL parameter `machine=`; against "across All environments" in the scope sentence, the popover's "Environment" layer, and docs "environment". DRIFT-19 already counts three words; this family mixes two inside one page.
- Current: A user reading Storage sees "machines" under a picker that says "environments".
- Proposed: Use "environment" in settings strings; keep `machine` in the URL for compatibility; use "machine" only where the UI names the physical host (checkout row titles).
- DNA: DNA-V7.
- Effort: XS
- Risk: Strings only; tests that match them.
- Upstream-eligible: yes
- #24865: not addressed

### Group H: Scheduled tasks

### F-08-42 Scheduled task Delete and Run now fire from a menu item with no confirmation or undo

- Severity: P2
- Surface: web, desktop
- Evidence: `ScheduledTasksSettings.tsx:765-772` `MenuItem onClick={() => void act("run")}` and `act("delete")`; the Delete item is not `variant="destructive"` (the Keybindings Remove item is). Measured: click Delete: no `alertdialog` appears and the task is gone in under 2 s. Rotate webhook does confirm ("Rotate this webhook URL?"), so the page is inconsistent. "Run now" starts an agent turn on the user's subscription with one click.
- Current: A saved schedule (and its webhook URL, which others may have configured) is deleted instantly.
- Proposed: Delete: `AlertDialog` `Delete "{title}"?` "Its schedule stops and its webhook URL stops working. Threads it already started are kept." button "Delete task"; or a 5 s `stackedThreadToast` "Task deleted" with Undo (DNA-P7). Run now: toast "Started "{title}"" with a link to the thread. Mark Delete `variant="destructive"`.
- DNA: DNA-P7, DNA-V2.
- Effort: S
- Risk: Webhook tasks cannot "Run now" (menu shows Deliveries instead), unchanged.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-43 Task rows omit project and workspace and print the raw run status

- Severity: P2
- Surface: web, desktop
- Evidence: `ScheduledTasksSettings.tsx:709-731`: row = title, two-line prompt, and a `status` of schedule label, "Paused|Listening|Next run in 3h", a `Badge` of the raw `lastRunStatus` enum (`succeeded`, `failed`, `running`, lowercase; `:728`) and `lastRunError`. No project, workspace mode (new worktree / checkout), last-run time, or environment (hidden for one environment). Under All projects you cannot tell where a task will run without opening it. [shot: scheduled-tasks-list-one-task-light-1440x900]
- Current: The list answers "when" and nothing about "where".
- Proposed: Add a second status segment "{project name} · {New worktree | Project checkout | Specific checkout}"; badge labels in sentence case from a small map ("Succeeded", "Failed", "Running") with "Last run 3h ago" (`formatRelativeTimeLabel`).
- DNA: DNA-V1, DNA-V10 (counts and times are literal), DNA-D1.
- Effort: S
- Risk: Long project names; truncate the segment with `min-w-0 truncate`.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-44 Selected weekdays differ from unselected ones by 1.25:1

- Severity: P2
- Surface: web, desktop
- Evidence: `ScheduledTasksSettings.tsx:1701-1716` (`ToggleGroup aria-label="Days to run"`, 28 px `Toggle`s). Measured pressed fill `rgb(227,227,229)` vs unpressed `rgb(252,252,252)` = 1.25:1, both font-weight 500, text lightness 0.210 vs 0.274; state is exposed as `aria-pressed` but a sighted user cannot see which days are on at a glance. [shot: scheduled-task-editor-new-light-1440x900]
- Current: "Mo Tu We Th Fr" and "Sa Su" look nearly identical.
- Proposed: A pressed style with >= 3:1 against unpressed: `bg-foreground text-background` or `bg-primary/12 text-primary border-primary/40`. Add it as a `variant="segmented"` pressed style on `ui/toggle-group.tsx` rather than a className override (DNA-P4); make the hit area 44 px on coarse pointers.
- DNA: DNA-C5 (non-text >= 3:1), DNA-P4, DNA-D4.
- Effort: S
- Risk: The same toggle primitive is used for Color scheme tiles (F-07-17) and the Keybindings "Not" toggle; check both.
- Upstream-eligible: yes
- #24865: not addressed

### F-08-45 "Create task" is enabled when empty; validation arrives as a toast; the default project is the first in the list

- Severity: P3
- Surface: web, desktop
- Evidence: measured: "Create task" not disabled with empty Name and Prompt; clicking raises a toast "Scheduled task is incomplete / Add a title, prompt, project, and model." (`:1185-1188`) instead of field errors. "Enabled" defaults on with a weekday 09:00 preset, so a user who types a name and prompt creates a live recurring agent run. The default project is `projects[0]` (`:1123,1133`): "server" here, whichever project is first in list order elsewhere, not the project in the scope sentence (it is only filtered by scope). [shot: scheduled-task-create-empty-toast-light-1440x900]
- Current: The first save can start a recurring agent in a project the user did not choose.
- Proposed: Disable "Create task" until valid and mark empty fields `aria-invalid` with `text-xs text-destructive` helper; preselect the scoped project when one is selected, else show "Choose a project" with no default; under the Enabled switch show "First run Monday 09:00" using `ScheduledRelativeLabel`.
- DNA: DNA-P3, DNA-V3.
- Effort: S
- Risk: None known.
- Upstream-eligible: yes
- #24865: not addressed

### Group I: Integrations and SnapShots

### F-08-46 Integrations and SnapShots on web: truncated select value, duplicate Default badge, 16 px version link, dead-end page

- Severity: P3
- Surface: web (desktop is the intended host; area 14 owns it)
- Evidence: (a) `IntegrationsSettings.tsx:663` `SelectTrigger className="w-full sm:w-40"`: "Your default browser" overflows by 8 px (scrollWidth 134 vs clientWidth 126) and shows "Your default brow…" [shot: integrations-open-links-truncated-select-light-1440x900]. (b) `:1425` `<Badge>Default</Badge>` next to a profile named "Default". (c) `DeviceToolVersions.tsx:36` `InlineButton tone="muted"` has no size, so "Not installed" / "v0.4.1" computes to 16 px (measured) beside 12 px descriptions and 14 px titles; versions are mono per DNA-T7 [shot: integrations-top-light-1440x900]. (d) `SettingsUnavailableGroup` (`settingsLayout.tsx:268-282`) dims the text but "Agent browser access" stays ON above "Only available in the desktop app." with a warning-coloured icon. (e) SnapShots is a nav item and a full page that is only a disabled switch under that same notice [shot: snap-shot-top-light-1440x900]; spellings "SnapShots" (nav, title), "snapshots" (aria-labels, `SnapShotSettings.tsx:416,441,587`), "Snapshot sound" (`:512`), "SnapShot" (docs).
- Current: Desktop-only surfaces on web show small defects and dead ends.
- Proposed: `className="w-full sm:w-48"` (or `w-auto min-w-40`); name the badge-bearing profile "Default profile" and drop the badge, or keep the badge and drop nothing; `InlineButton` with `text-xs font-mono font-normal`; on web collapse the eight desktop-only rows to one "Browser defaults: desktop app only" row, and give SnapShots' nav item a `Badge size="sm"` "Desktop"; one spelling: "SnapShot" for the feature, "snapshot" for an instance.
- DNA: DNA-T2, DNA-T7, DNA-V7, DNA-P9.
- Effort: S
- Risk: Hiding rows must keep their search ids resolvable on desktop.
- Upstream-eligible: yes
- #24865: not addressed

### Group J: Docs

### F-08-47 17 General rows are undocumented

- Severity: P3
- Surface: docs
- Evidence: the table above: no `docs/user` hit by title for Project grouping, Project order, Thread notifications, In-app notifications, Time format, Response streaming, Hide whitespace changes, Default diff file state, Diff layout, Proactive panels, Rich text composer, Collapse composer on scroll, Background activity, Start from remote, Add project starts in, Archive confirmation, Delete confirmation. Defaults the docs never state: Follow-up behavior is Steer, Send shortcut is Enter, Time format follows the system, diff files open collapsed with whitespace changes hidden.
- Current: Behaviour users ask about (why do diffs open collapsed, how do I order projects) has no page, and the Appearance controls that docs miss (F-07-39) have General siblings.
- Proposed: Do not add a reference table (AGENTS.md docs policy). Add one sentence where the task lives: composer defaults in `composer.md` (Send shortcut Enter; Follow-up Steer; Rich text and Collapse on scroll are on), project grouping and order plus the Manual caveat (F-08-10) in `thread-sidebar.md`, "Time format" in `appearance.md` beside timestamps, diff defaults in `source-control.md` where the changed-files diff is described, notification rows in `thread-sidebar.md`.
- DNA: DNA-V5.
- Effort: S
- Risk: Docs only.
- Upstream-eligible: yes (docs; keep concise)
- #24865: not addressed

## Edge-case results (matrix)

Data

- Empty: PASS. Keybindings search with no match shows "No keybindings match your search." (no clear-search or add-binding action, cosmetic); Scheduled tasks "No scheduled tasks"; Actions "No actions configured."; Storage "Nothing needed cleanup" and the Projects empty state are code-read.
- One item: PASS (one task, one checkout, one action).
- 100+ items: Keybindings renders all 82 rows with no virtualisation, 6,709 px: FAIL on density (F-08-32). Project scope menu switches to a searchable combobox above 6 projects (code-read, `SettingsScopeSentence.tsx:107`): PASS.
- 10,000+ items: N/A (caps: 256 keybindings, 50 t3.json scripts).
- Very long names: 200-character project name and 120 characters without spaces: PASS (no horizontal overflow at 1440; scope picker truncates at `max-w-72` = 288 px; Name input shows the head only). Task title of 160+ characters wraps to two lines: PASS. Action name and command truncate with no tooltip: FAIL (F-08-18). 200-character project paths: NOT TESTED (fixtures have short paths; Checkouts rows use `truncate` plus tooltip, code-read).
- Unicode and emoji: PASS (project name "🚀 roket 日本語 ñandú", task title with emoji and Arabic).
- RTL: PASS for rendering names (no layout break); mirrored layout NOT TESTED (no RTL locale).
- Leading/trailing whitespace: PASS (" padded name " saved as "padded name"). Whitespace-only: rejected with a toast but the input stays blank (F-08-08).
  Content
- Very long single-line strings: PASS (above). Everything else N/A.
  Network and agents
- Provider not installed or logged out: Source Control and Integrations show "Not available on this server" and "Not authenticated" states: PASS apart from F-08-39. Relay or server disconnected: `SettingsRow` inert tooltip paths code-read ("Reconnect the selected environment..."). Server restarted or auth invalidated under the client: observed once (session returned `authenticated:false`, app redirected to `/pair`), not mine. Version mismatch: N/A.
  Git
- Probe repos had commits; no-repo, detached HEAD, worktree failure, collision: NOT TESTED (Workspace and branch naming rows were not saved on the shared server). Two checkouts of one repo grouped into one project with a Mixed Workspace row and a Checkouts list: PASS.
  Viewport
- 1440x900 PASS. 1280x720 NOT TESTED separately (between 1024 and 1440). 1024x640 PASS (General, Keybindings, Project; Add action dialog footer reachable). 800x600 and 720x450 (200% zoom equivalent): no horizontal overflow on seven pages: PASS; keybinding rows stack to 113 px (F-08-32). 3440x1440: PASS (content stays 1026 px wide). 390x844: PASS for layout; controls stack, pill drops under the When chip. Soft keyboard: NOT TESTED. OS zoom 80/125/150: NOT TESTED beyond the viewport equivalents.
  Preferences
- Light and dark: PASS on every page (dark captures for each). System switching and named themes: N/A and NOT TESTED (area 07). Reduced motion: NOT TESTED (these pages have no motion beyond the search pulse). High contrast and screen reader: NOT TESTED. Keyboard only: partial; FAIL F-08-23 and hover-only edit (F-08-18). Windows modifiers: emulated, FAIL F-08-27. Interface font size: NOT TESTED (F-07-12 covers the shell).
  Lifecycle
- First launch: N/A. Corrupted `keybindings.json`: code-read (F-08-34). Corrupted `settings.json`: server falls back to defaults (MAP), not exercised. App backgrounded or OS sleep: N/A (settings are request/response).

## Already good (do not touch)

- Scope mechanics: `retainSettingsScope` keeps the project and environment across pages; a stale project resolves to "Unavailable project / This project is no longer available" instead of silently widening to All; the picker becomes a searchable combobox above six projects.
- The layers popover model (project, environment, t3.json, default; check on the effective layer; "Overridden by" with jump-to-project links and a reset) matches `project-settings.md` and is the right shape. Fix its values (F-08-04), not its structure.
- Mixed handling exists and works: two checkouts with different Workspace values showed "Mixed" with the amber icon, and Reset appeared.
- Project removal dialog states what goes (thread count, grouped entries, path, environment, "not the files on disk") and removal navigates back to the project list; checkout removal says "Other entries in this grouped project are unaffected."
- Project icon picker: Icons / Emoji / Monogram with 18 colours, live preview, grapheme-aware emoji paste, keyboard focus rings; emoji as a monogram is rejected.
- Keybindings page mechanics: Custom badge, "Reset to default" and "Remove" in a row menu that is also visible on touch (`pointer-coarse:opacity-100`), "Open keybindings.json", search that clears with Esc, a visual and text `When` editor with live parse errors and unknown-condition warnings, "Add keybinding" with command/when/key, the Esc-cancels recorder, `data-keybinding-capture` so global handlers ignore the recorder.
- Defaults are internally consistent: 82 default rules for 79 commands, complementary `when` pairs (`terminalFocus` vs `!terminalFocus`) are correctly not flagged as conflicts.
- Storage: project-level "Inherit / Off / Custom" cleanup; the keep-rule descriptions are honest about `.env`; results rows show reason, machine, project, folder and thread with selectable text.
- Source Control: account names are blurred by default with a visibility toggle; Bitbucket and GitHub forms explain token precedence.
- Scheduled tasks: webhook editor explains "Only this computer can call this address. Link T3 Connect for a public URL."; Rotate confirms; "Disabled tasks stay saved but do not run."; "Skip requests older than", filters, replay and coalesce keys are present and documented.
- Project name: trims, rejects empty, survives 200 characters, emoji, CJK and RTL; the monogram follows the saved name as documented.
- After #24865: row descriptions (3.28:1 today), section titles, boxed pickers and the Model "Automatic" move are the owner's calls; not re-proposed here.

## Incomplete (what I did not cover and why)

- Storage: enabling a rule, "Delete now", the results list and project "Custom" rules were not exercised. The server is shared and a rule would delete other agents' worktrees; all Storage behaviour beyond the idle page is code-read (F-08-40).
- Restore device defaults, Send shortcut, Follow-up behaviour, Quit shortcut, Branch naming, Thread title instructions persistence, Text generation model were not saved or clicked (shared server state); `restoreDefaults` is code-read plus a key-set diff.
- Mixed with two or more environments, offline environments and the fan-out of Keybindings saves: one environment on this host; code-read (F-08-07).
- `KeybindingsConfigWarning` toast not rendered (needs a corrupt shared `keybindings.json`); message length is computed with the real schema (F-08-34).
- Scheduled tasks: only a paused webhook task was created (create, edit, deliveries empty, delete). "At a time", interval, Run now, filters, signature and real deliveries were not run (no agent turns). Tasks whose project was removed were not exercised.
- Project icon "Choose file" dialog contents and desktop "Open in Finder" (primary-environment only) were not captured; `ProjectFaviconPickerDialog` is code-read.
- SnapShots setup, capture shortcut recorder, Quit shortcut row and the desktop menu accelerators: desktop only (area 14).
- Diagnostics export and Open source licences: area 07. Mobile native Settings (Thread behavior, Keyboard, Projects & threads): area 15, not run.
- Windows and Linux were emulated with a `navigator.platform` override only; real fonts and key events untested. Screen reader, forced colours, reduced motion, soft keyboard and zoom steps were not run.
- Post-#24865 rendering: read from the diff, not rendered; measured contrast numbers are main's.
- Mid-run the Playwright session was invalidated for about three minutes (not re-paired, recovered by itself).

## Needs deeper look

1. Stale repository identity: after removing a project and re-adding a freshly `git init`-ed folder at the same path, the project grouped under the old fake remote (`example.invalid/probe/settings-probe`) although the new repo has no remote. Looks like a path-keyed identity cache that outlives the project; check `sidebarProjectGrouping` and the server's repository-identity resolver (areas 01/02 and server).
2. #6508 (new threads do not carry last model and mode) needs a live reproduction in area 04; this area only fixes the explanation (F-08-11).
3. #14991 (`t3_project_update` saves scripts and defaults that are ignored once settings are folded) is an MCP and server path; the Actions "Reset" and persist logic (`useProjectScriptSettings`) should be re-read with it.
4. #16542 (Cmd+[ and Cmd+] stop on the Settings page): the modal is a route, so navigation history includes it; belongs to area 01/21.
5. #19930 (custom snooze ignores Time format): thread area; the General "Time format" row has no consumer list in the UI, so users cannot tell which surfaces obey it.
6. Default shortcuts cannot be unbound, only re-recorded (a row menu has Reset and Remove only for Custom rows). A real "unbind" needs a contract change (a disabled rule), so it is a server dependency.
7. Monogram text colours: yellow, lime and amber 600 on a 14% tint at 8.25 px are about 3:1 (DNA-C5, DRIFT-22) but `ProjectMonogram` is DNA-K3 do-not-touch; needs an owner decision, not a patch.
8. General copy that is only label clarity here, passed to area 20: "Start from remote" (say "Branch new worktrees from remote"), "Add project starts in", "Hide whitespace changes" with the description "Set whether ...", "Auto-settle inactive threads ... for this long" (the duration is in the next row), "Choose when Enter sends a prompt or inserts a new line" (no period), project-panel toast titles "Failed to rename project / update project icon / remove project" (DNA-V4) with the opaque "Failed to mutate project." description, and the permanent "Can't find a setting? ... hop to any other settings page." banner on the Project page.
9. The "Project" nav item appears at the top of the nav only while a project is selected and shifts every other item down by 36 px (General moves from y=105 to y=141); nav is area 07's, but the trigger is the scope sentence.
10. Source Control token forms use two save models (GitHub "Save" button, Bitbucket "fields save on leave"); decide one.
11. `MAP.md` section 6 says 66 default rules; the code has 82 (`packages/shared/src/keybindings.ts:147-234`). Correct MAP before the spec cites it.
