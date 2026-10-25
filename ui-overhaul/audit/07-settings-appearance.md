# 07 settings-appearance: audit

Area: Settings shell (route modal, nav, search, close, scroll, keyboard) and the Appearance page in full (colour scheme, themes, theme editor, import, Open VSX search, interface and typography controls), plus Beta, Diagnostics and Open source licenses, the theme items in the command palette, live system switching, boot flash and the five named themes.
Baseline: `pingdotgg/t3code` main @ 5f64c5eb, run at `http://localhost:5733` (Dev channel, synthetic data). Owner PR #24865 is read from `prior-art/pr-24865.diff` and tagged on every finding. Screenshots: `ui-overhaul/screens/07-settings-appearance/`.

## How this was done

- Drove the real app with Playwright (Chromium, macOS host) in throw-away contexts that load `/tmp/t3code-pw/state.json` read-only and never save back, so no appearance preference leaked into the shared profile. Scripts live in `/tmp/t3code-pw/a07/` (outside the repo).
- Exercised: shell at 1440x900, 1280x720, 1024x640, 800x600, 3440x1440, 390x844 and zoom-equivalent viewports (720x450, 1152x720, 2880x1800); light, dark, system with a live `emulateMedia` flip; each of the six themes in thread and Settings views (12 theme x mode captures); keyboard-only walk (Tab order, arrows, PageDown, Esc in every layer); forced-colors; reduced motion; Interface font size 12 and 20; contrast slider 50-200; glass 40; theme create, edit, inspect, import (nine invalid inputs), Open VSX search/install/export/remove (live, `open-vsx.org`); boot flash with a delayed bundle; corrupted storage (six cases); 60 custom themes.
- Numbers marked "measured" come from `getComputedStyle` plus canvas read-back with WCAG 2.x luminance on the running app. They describe main, not the #24865 end state; where #24865 moves them the finding says so.

## Baseline: what #24865 changes in this area (and what it does not)

Changes that matter here (from the diff): Settings section titles become 16 px / 600 / full foreground (`settingsLayout.tsx:249`); row descriptions go from `text-muted-foreground/80` + `max-w-xl` to full `text-muted-foreground` + `max-w-2xl text-balance` (`:495`); scope pickers become boxed `Button variant="outline" size="sm"` with 1.75-stroke chevrons (`SettingsScopeSentence.tsx`); the inheritance marker hides unless overridden (`:485-499`); a new "Colored project icons" switch lands in Appearance between Chat width and Render math with `sidebarProjectIconColors` (default false) in `ClientSettingsSchema`; Inter Variable bundled and prepended after the system faces in `--font-sans`, `DEFAULT_SANS_FONT_STACK` and the boot `body`; `--radius` 0.625rem -> 0.5rem (radii 4/6/8/12/16); `svg.lucide` stroke 1.75; `--sidebar-icon-color` mix 60% -> 85% (`index.css:104`); dark `--muted-foreground` -> neutral-400 `#a3a3a3`, dark `--border` 8% and `--input` 11%; light `--foreground` zinc-900; Settings search and General labels "Resume after usage limits" and "Snooze until limits reset".
Not changed (so these findings stand): `ThemeSettings.tsx`, `ThemeEditorPanel.tsx`, `ThemeImportDialog.tsx`, `ThemeSearchSection.tsx`, `ThemePreviewCircles.tsx`, `ThemeWireframe.tsx`, `TypographySettings.tsx`, `FontFamilyPicker.tsx`, `AppRouteModal.tsx`, `ui/switch.tsx`, `themePalette.ts`, `ResourceTelemetryDiagnostics.tsx`, `FirstRunGate.tsx`, `docs/user/appearance.md`.
Owner calls kept: no finding below touches the blue switch accent, the `#0a0a0a` canvas, three-line rows or the composer model colour.

## The Settings shell today

- `AppRouteModal` (`components/AppRouteModal.tsx`): Base UI `Dialog`, portal viewport `fixed inset-0 z-50`, padding `sm:p-6 lg:p-10`; popup `sm:max-w-[80rem] sm:max-h-[60rem] sm:rounded-2xl sm:border sm:shadow-2xl/40`, opacity+scale 0.985 over 150 ms ease-out. Measured: 1280x820 at (80,40) on 1440x900; 944x560 at 1024x640; 752x552 at 800x600; full-bleed 390x844 on phones; 1280x960 centred on 3440x1440. `disablePointerDismissal` plus a manual backdrop handler (a drag that ends on the backdrop is not a dismissal). Esc and backdrop close; focus lands on the popup, not the first control.
- Route frame (`routes/_chat.settings.tsx`): left nav (240 px, 56 px icon rail below `md`), a 48 px header (`h-12`; DNA-D3 names 52 px for the three main-app top bars) with the breadcrumb "Settings / {page}", "Restore device defaults" on General only, and a 28 px ghost Close with tooltip "Close (Esc)".
- Nav (`SettingsSidebarNav.tsx`): Search row (`/` hint in `Kbd`; `/` or Cmd/Ctrl+F focuses it unless a text field or a non-settings dialog owns focus), then General, Appearance, Keybindings, SnapShots, Providers, Integrations, Scheduled Tasks, Source Control, Storage, Connections, Beta, Archive (plus Projects when a project is in scope). Diagnostics and Open source licenses are reached from General only. Search is a combobox with arrow/Enter/Esc, ranks `SETTINGS_SEARCH_ITEMS`, jumps by hash and pulses the target row (`settings-search-target-pulse`, 650 ms x2).
- Content (`settingsLayout.tsx`): a scroller with `topbar-scroll-fade`, container `max-w-4xl`, section gap 32 px, `SettingsRow` grid `minmax(0,1fr) minmax(10rem,auto)` from 32 rem of container width. Scroll resets to the top on page switch.
- Pages with no scope sentence: Appearance, SnapShots, Connections (`SETTINGS_DEVICE_ONLY_PATHS`). Every other page shows "Applying settings for {project} across {environment}", including Beta, Diagnostics and Open source licenses (F-07-08).

## Appearance controls: what the UI exposes today

All values are device-local (browser profile or the desktop settings file); none is sent to the server. "Key" is the storage key (`CS` = `t3code:client-settings:v1`, desktop: file owned by the main process).

| Control (Settings > Appearance)                                                                                    | What it does                                                                                                                          | Default / range           | Key                                                                  | In docs/user/appearance.md | Defects                     |
| ------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | -------------------------------------------------------------------- | -------------------------- | --------------------------- |
| Color scheme tiles System / Light / Dark                                                                           | Appearance mode; System follows the OS live                                                                                           | System                    | `t3code:theme-appearance-mode` (legacy `t3code:theme-follow-system`) | yes                        | F-07-17                     |
| Themes grid: T3 Code, T3 Chat, Grove, Ocean, Ember, Iris; orb per half, card for both                              | Picks palette; an orb sets only the light or dark half                                                                                | T3 Code both halves       | `t3code:theme`, `t3code:theme-halves:v1`                             | yes                        | F-07-15, 17, 18, 19, 20, 21 |
| Card actions Duplicate / Edit / Export / Remove (custom: all four, built-in and published: Duplicate only)         | Copy to editor, edit, download JSON, delete                                                                                           | none                      | `t3code:themes:v1`                                                   | export and duplicate only  | F-07-20, 22, 23, 24, 25     |
| Create theme (floating editor)                                                                                     | Name, Light/Dark, guided Background + Accent, Advanced (22 colour families that drive the 61 roles), Filter colors, Inspect, minimize | closed                    | `t3code:themes:v1`                                                   | yes                        | F-07-01, 02, 31, 32, 36     |
| Add theme: Open VSX search (16 results, 4 sorts, "Popular" chips) and T3/VS Code file or paste import (256 KB cap) | Installs community themes or files                                                                                                    | closed                    | `t3code:themes:v1`                                                   | import yes, search no      | F-07-30, 33, 34, 35         |
| Environment-published themes                                                                                       | Server themes appended to the grid, follow the server                                                                                 | none                      | server config (not stored)                                           | yes                        | F-07-19 (not exercised)     |
| Contrast                                                                                                           | Scales text and border contrast                                                                                                       | 100%, 50-200, step 5      | `CS` `appearanceContrast`                                            | no                         | F-07-26                     |
| Glass opacity                                                                                                      | Opacity of menus, dialogs, composer; 100 removes blur                                                                                 | 80%, 40-100, step 5       | `CS` `glassOpacity`                                                  | no                         | none (40 stays legible)     |
| Environment identification (Dev and Nightly builds only)                                                           | Artwork / Version pill / None                                                                                                         | Artwork                   | `CS` `environmentIdentificationMode`                                 | no                         | none                        |
| Diff colors                                                                                                        | Red & green or Blue & orange                                                                                                          | Red & green               | `CS` `diffColorScheme`                                               | no                         | none                        |
| Composer context                                                                                                   | Keeps branch and worktree strip below the composer                                                                                    | off                       | `CS` `persistComposerContextStrip`                                   | yes                        | none                        |
| Chat width                                                                                                         | Comfortable 46rem, Wide 72rem, Full                                                                                                   | Comfortable               | `CS` `chatWidth`                                                     | no                         | none                        |
| Colored project icons (arrives with #24865)                                                                        | Sidebar project icons in colour instead of grey                                                                                       | off                       | `CS` `sidebarProjectIconColors`                                      | no                         | n/a yet                     |
| Render math                                                                                                        | Typesets LaTeX                                                                                                                        | off                       | `CS` `mathRenderingEnabled`                                          | yes                        | none                        |
| Panel animations + replay preview                                                                                  | Sidebar, right panel, terminal drawer motion                                                                                          | 0 ms, 0-400, step 25      | `CS` `panelAnimationDurationMs`                                      | yes                        | F-07-27                     |
| Typography: Interface font + size                                                                                  | Family (free text, or picker when Local Font Access is granted) and root size                                                         | system sans, 12-20 px, 16 | `CS` `fontFamilySans`, `fontSizeInterface`                           | no                         | F-07-12, 28                 |
| Typography: Monospace font + size (simple mode: code and terminal share it)                                        | Code blocks, diffs, previews, terminal                                                                                                | system mono, 10-18 px, 13 | `CS` `fontFamilyCode`, `fontSizeCode`                                | no                         | F-07-28                     |
| Typography "Advanced" switch                                                                                       | Splits out Prompt font (12-20, 14), Terminal font (8-20, 12), Font smoothing (macOS only, default on)                                 | off                       | `t3code:typography-advanced`                                         | no                         | F-07-28                     |
| Word wrap                                                                                                          | Wrap long lines in code, tables, diffs, previews                                                                                      | on                        | `CS` `wordWrap`                                                      | no                         | none                        |
| Row reset arrows                                                                                                   | Per-control reset; no page-level reset (General has "Restore device defaults")                                                        |                           |                                                                      | no                         | none                        |

Client-settings fields the brief lists that are not on Appearance: `timestampFormat` ("Time format", General > Behavior), `sidebarProjectSortOrder` and `sidebarProjectGroupingMode` (General > Organization), `diffLayout`, `diffIgnoreWhitespace` (General > Behavior), `legacySidebarEnabled` (General). `sidebarThreadSortOrder` is only settable from the legacy sidebar menu (`LegacySidebar.tsx:2870`) and `sidebarThreadPreviewCount` has no live control outside the legacy sidebar (it only appears in "Restore device defaults", `SettingsPanels.tsx:428,603`); both are inert for the default sidebar. `MAP.md` 4.6/5.3 lists them as appearance keys; they are not Appearance-page controls.

Controls on this page that exist in the UI but not in `docs/user/appearance.md`: Contrast, Glass opacity, Environment identification, Diff colors, Chat width, Interface/Monospace/Prompt/Terminal font families and sizes, the Typography Advanced switch, Font smoothing, Word wrap, Open VSX theme search, theme collections and the Edit/Remove card actions, and (with #24865) Colored project icons (F-07-39).

Named themes, sidebar and composer (contact sheet [shot: themes-contact-sheet-1140x1330]): the five built-ins recolour the sidebar artwork (`--stage-art-*`, rose, forest, marine, copper, violet), the sidebar fill, the composer surface and its send button (`messageAction`); nothing changes in geometry. In light, Grove/Ocean/Ember/Iris send buttons are amber, teal, red and magenta while focus rings stay on the theme accent. The artwork is the Dev/Nightly marker (DNA-K15); a stable build shows a plain header.

## Summary

39 findings: 0 P0, 7 P1, 20 P2, 12 P3. #24865 tags: not addressed 37, partial 2.

| Id      | Sev | Finding                                                                                                                            | #24865        |
| ------- | --- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------- |
| F-07-01 | P1  | Esc while inspecting cancels the inspector and also closes Settings                                                                | not addressed |
| F-07-02 | P2  | Esc with focus inside the theme editor closes Settings, not the editor                                                             | not addressed |
| F-07-03 | P2  | Settings nav costs 14 Tab stops before the content, with no arrow-key movement                                                     | not addressed |
| F-07-04 | P2  | The current settings page is not exposed to assistive tech (no `aria-current`)                                                     | not addressed |
| F-07-05 | P2  | Diagnostics page highlights no nav item (Open source licenses is special-cased, Diagnostics is not)                                | not addressed |
| F-07-06 | P1  | Below 768 px the Settings nav is an unlabeled icon rail with 2.27:1 icons, 39x32 targets and no tooltips                           | partial       |
| F-07-07 | P2  | The settings content cannot be scrolled with the keyboard when the dialog opens                                                    | not addressed |
| F-07-08 | P2  | The "Applying settings for All projects across All environments" sentence appears on pages that have nothing to scope              | not addressed |
| F-07-09 | P3  | Two nav and breadcrumb labels break sentence case: "Scheduled Tasks" and "Source Control"                                          | not addressed |
| F-07-10 | P3  | No keyboard shortcut opens Settings on web (desktop has one)                                                                       | not addressed |
| F-07-11 | P3  | Settings search finds nothing for the theme tools, motion, blur or text size                                                       | not addressed |
| F-07-12 | P2  | Interface font size does not move the layout breakpoints, so Settings overflows at 800x600 with 20 px text                         | not addressed |
| F-07-13 | P1  | One out-of-range or unreadable value in saved client settings locks the whole app behind "Could not read settings" with only Retry | not addressed |
| F-07-14 | P2  | After #24865 the Appearance page has two heading styles: "Color scheme" and "Themes" stay 14 px regular at 70%                     | not addressed |
| F-07-15 | P2  | At content widths under 520 px (800x600 and below) the theme grid collapses to one column of six 125 px cards                      | not addressed |
| F-07-16 | P1  | In Windows high-contrast (forced-colors) every Switch disappears                                                                   | not addressed |
| F-07-17 | P1  | In forced-colors the Color scheme tiles, theme orbs and wireframes are blank, and the selected tile cannot be told apart           | not addressed |
| F-07-18 | P2  | The T3 Code (default) card, its wireframe and the splash use an indigo accent the app does not have                                | not addressed |
| F-07-19 | P2  | Built-in, environment-published and custom themes share one undifferentiated grid with no sections or filter                       | not addressed |
| F-07-20 | P2  | Custom theme names truncate to about ten characters with no way to read them                                                       | not addressed |
| F-07-21 | P2  | Each theme card is four Tab stops (24 for the six built-ins), with no radio-group semantics                                        | not addressed |
| F-07-22 | P3  | Export uses an upload icon and the import button uses a download icon                                                              | not addressed |
| F-07-23 | P3  | Exporting a theme collection writes one variant, under an internal id                                                              | not addressed |
| F-07-24 | P3  | Collection variant labels strip too much: "Dracula Theme" and "Dracula Theme Soft" become "Theme" and "Theme Soft"                 | not addressed |
| F-07-25 | P3  | The remove-theme dialog promises a restore the user may not have                                                                   | not addressed |
| F-07-26 | P2  | The Contrast slider goes down to 50%, where body text is 3.36:1 and secondary text 2.01:1, with no warning                         | partial       |
| F-07-27 | P2  | Panel animations shows 400 ms while the OS reduced-motion setting silently forces 0                                                | not addressed |
| F-07-28 | P2  | A font family the browser cannot find turns the field red and is silently discarded                                                | not addressed |
| F-07-29 | P3  | Theme and font error toasts use contractions, duplicate strings, and a one-word fallback body                                      | not addressed |
| F-07-30 | P1  | Importing a VS Code theme fails for ordinary VS Code theme files (JSONC) with raw engine errors                                    | not addressed |
| F-07-31 | P2  | Any theme name without Latin letters or digits gets the id `custom-theme`, so the second one offers to merge into the first        | not addressed |
| F-07-32 | P2  | Opening the theme editor from Settings leaves it unable to inspect the app                                                         | not addressed |
| F-07-33 | P2  | Open VSX results show no palette, and installing neither selects nor reveals the new theme                                         | not addressed |
| F-07-34 | P3  | Search, import and editor failure copy is raw or false in four places                                                              | not addressed |
| F-07-35 | P3  | The import error appears below the action buttons, after the form                                                                  | not addressed |
| F-07-36 | P3  | The theme editor's drag and resize are pointer-only and its controls are 24-28 px on touch                                         | not addressed |
| F-07-37 | P1  | Diagnostics uses 10-11 px text at 1.84-2.7:1                                                                                       | not addressed |
| F-07-38 | P2  | Diagnostics says "Sampling every 0 ms" beside a green dot while the monitor is unavailable                                         | not addressed |
| F-07-39 | P3  | docs/user/appearance.md omits ten controls that the Appearance page ships                                                          | not addressed |

## Findings

Screenshot shorthand: `[shot: X]` is `ui-overhaul/screens/07-settings-appearance/07-settings-appearance-X.png`. Line numbers are from `main @ 5f64c5eb`. Every finding carries a `#24865` tag (owner PR, checked against `prior-art/pr-24865.diff`). "Upstream-eligible" follows the coordinator rule: chunks that edit a file #24865 modifies are `no` unless they are a follow-up to #24865 itself.

### Group A: Settings shell (AppRouteModal, nav, search, close, scroll, keyboard)

### F-07-01 Esc while inspecting cancels the inspector and also closes Settings

- Severity: P1
- Surface: web, desktop
- Evidence: `components/settings/ThemeEditorPanel.tsx:668-673` (`cancelInspection` calls `preventDefault()` only; registered on `document` in capture phase at `:693`); header copy `:1102` says "Select an element · Esc to cancel"; `components/AppRouteModal.tsx:29-31` closes on Esc. Repro (scripted): Settings > Appearance > Create theme > Inspect > press Esc. Measured: URL `/settings/appearance` -> `/draft/<uuid>`, Settings dialog count 1 -> 0, editor panel count stays 1 (the inspector is off). The end state looks like [shot: editor-after-esc-light-1440x900]: new-thread screen with the editor floating over it.
- Current: One Esc does two things: the copy promises it cancels the picker, but Settings dismisses at the same time and the user lands in a draft thread with an orphaned editor.
- Proposed: In `cancelInspection` (`ThemeEditorPanel.tsx:668`) add `event.stopImmediatePropagation()` after `preventDefault()`. The document-capture listener runs before Base UI's dismiss handler, so Esc unwinds exactly one layer (inspector), the same pattern `TypographySettings.tsx:469-473` already uses to keep Esc from closing Settings.
- DNA: DNA-P7 (every way in has a way out, one layer at a time), DNA-L4 (Esc closes the route modal only when nothing inside owns it)
- Effort: XS (1 line)
- Risk: No test covers `ThemeEditorPanel`. Check Esc still cancels when the inspector is armed and a popover is open (the colour picker popover is a separate Base UI layer and must keep winning).
- Upstream-eligible: yes (ThemeEditorPanel.tsx is not touched by #24865)
- #24865: not addressed

### F-07-02 Esc with focus inside the theme editor closes Settings, not the editor

- Severity: P2
- Surface: web, desktop
- Evidence: `ThemeEditorPanel.tsx:1071-1087` (panel is a plain `div role="dialog"` with no key handling); name field has `autoFocus` (`:869`). Repro: Create theme (focus is in "Theme name"), type, press Esc: `/settings/appearance` -> `/draft/<uuid>`, editor still open [shot: editor-after-esc-light-1440x900]. Esc inside a Select popup, the colour-picker popover and the Add-theme dialog all behave correctly (checked).
- Current: The editor looks like a child window of Settings but Esc dismisses the parent and leaves the child behind, still holding an unsaved draft.
- Proposed: Add `onKeyDown` to the panel root (`:1071`): `if (event.key === "Escape" && !event.defaultPrevented) { event.stopPropagation(); onOpenChange(false); }`. React's root listener sits below `document`, so Base UI's dismiss never sees it. Cancel already discards the draft the same way (`:1168`), so no confirm is needed.
- DNA: DNA-P7, DNA-L4
- Effort: XS
- Risk: A popover opened from the panel (colour picker) must close first; Base UI sets `defaultPrevented`/handles it before the event reaches the panel, verify. Untested component.
- Upstream-eligible: yes
- #24865: not addressed

### F-07-03 Settings nav costs 14 Tab stops before the content, with no arrow-key movement

- Severity: P2
- Surface: web, desktop
- Evidence: `components/settings/SettingsSidebarNav.tsx:352-374` (12 plain `SidebarMenuButton`s, all `tabIndex` 0). Measured Tab order from dialog open: 1 Search, 2-13 the 12 nav items, 14 Close, 15 first content control. ArrowDown on a nav item does nothing (focus stayed on "Appearance"). With a project scope (Projects item shown) it is 15 stops. Each theme card adds more (F-07-21).
- Current: Every keyboard visit to a settings page starts with 14 Tab presses; the nav is a toolbar of independent buttons instead of one list.
- Proposed: Roving tabindex in `SettingsSidebarNav`: only the active item has `tabIndex={0}`, the rest `-1`; an `onKeyDown` on the `SidebarMenu` handles ArrowUp/ArrowDown/Home/End by focusing the previous/next/first/last item (Enter/Space still activate). Tab order becomes Search, nav, Close, content (4 stops). About 35 lines.
- DNA: DNA-L8 (keyboard first)
- Effort: S
- Risk: Search-result mode (`:308-339`) already uses `aria-activedescendant`; keep that branch untouched. No test covers the nav.
- Upstream-eligible: no (SettingsSidebarNav.tsx is modified by #24865; ship as a follow-up after it merges)
- #24865: not addressed (PR only edits `SettingsSectionIcon`, `:105-108`)

### F-07-04 The current settings page is not exposed to assistive tech (no `aria-current`)

- Severity: P2
- Surface: web, desktop
- Evidence: `SettingsSidebarNav.tsx:361-372`: the active state is `data-active="true"` plus `isActive` styling only; computed `aria-current` is null (checked on the "Appearance" button). Items are `<button>` with `navigate()` in `onClick` (`:181-188`), so there is no href for middle-click, copy-link or open-in-new-window; `replace: true` means browser Back also skips between pages.
- Current: Screen-reader users hear a list of identical buttons with no "current page". Sighted users get only a background fill.
- Proposed: Pass `aria-current={isActive ? "page" : undefined}` to each `SidebarMenuButton` (XS). Optionally render the button as a link (`render={<Link to={item.to} hash="" replace />}`; `SidebarMenuButton` already supports `render`, `ui/sidebar.tsx:707-735`) so the destination is real.
- DNA: DNA-P8 (hit every surface incl. assistive), DNA-L8
- Effort: XS (aria-current) / S (links)
- Risk: Link variant changes click handling (`hashScrollIntoView`, retained scope search via `retainSettingsScope` middleware); keep `onClick` navigate if unsure.
- Upstream-eligible: no (same file as F-07-03)
- #24865: not addressed

### F-07-05 Diagnostics page highlights no nav item (Open source licenses is special-cased, Diagnostics is not)

- Severity: P2
- Surface: web, desktop
- Evidence: `SettingsSidebarNav.tsx:99` filters `/settings/diagnostics` out of the nav, and `:354-356` marks only `/settings/open-source-licenses` as a General detail page. Measured: at `/settings/diagnostics` the set of `data-active=true` nav buttons is empty; at `/settings/open-source-licenses` it is `["General"]`. Both are reached from General (`SettingsPanels.tsx:1913-1936`). `SettingsPath` (`settingsSearch.ts:19-33`) also omits `/settings/open-source-licenses`. [shot: diagnostics-light-1440x900] [shot: oss-light-1440x900]
- Current: On Diagnostics the user loses their place in the nav; there is also no visible "back to General" except the nav or Esc.
- Proposed: Treat both as General detail pages: `const isGeneralDetailPage = item.to === "/settings/general" && (pathname === "/settings/open-source-licenses" || pathname === "/settings/diagnostics")`.
- DNA: DNA-L4 (settings anatomy), DNA-P3 (UI reflects real state)
- Effort: XS
- Risk: Search results and breadcrumbs already label Diagnostics; no test.
- Upstream-eligible: no (SettingsSidebarNav.tsx modified by #24865)
- #24865: not addressed

### F-07-06 Below 768 px the Settings nav is an unlabeled icon rail with 2.27:1 icons, 39x32 targets and no tooltips

- Severity: P1
- Surface: web (phone and narrow-window widths; desktop windows narrower than 768 px)
- Evidence: `SettingsSidebarNav.tsx:240` (`w-60 ... max-md:w-14`), `:368` (label gets `max-md:sr-only`). Measured at 390x844: rail 56 px; inactive icons `#71717b` at 60% over `#fafafa` = 2.27:1 (dark 2.49:1 on `#111`); buttons 39x32 (DNA-D4 wants 44); hovering a rail button shows no tooltip (`SidebarMenuButton` tooltip is `hidden` unless the app sidebar is collapsed, `ui/sidebar.tsx:747-755`). [shot: shell-dark-390x844] [shot: mobile-scroll2-light-390x844]
- Current: 12 monochrome glyphs with no visible text and no way to learn which is which except the breadcrumb of the page you are already on. SnapShots/Scheduled Tasks/Integrations glyphs are not self-explanatory.
- Proposed: In the rail case only: (1) `tooltip={{ children: item.label, hidden: false, className: "md:hidden" }}` on each `SidebarMenuButton`, (2) hit area `max-md:h-11 max-md:w-11` (rail `w-14` = 56 px already fits 44), (3) nothing for contrast: #24865 already lifts the icon colour to >= 3:1 (see tag). Do not add visible labels (rail width stays 56).
- DNA: DNA-D4 (44 px touch), DNA-C5 (icons that carry meaning >= 3:1), DNA-X4 (no hover dependence on phone width: tooltips do not help touch, so also keep `aria-label`)
- Effort: S
- Risk: Tooltips are hover-only; on touch the 44 px targets and breadcrumb remain the fallback. No test.
- Upstream-eligible: no (SettingsSidebarNav.tsx modified by #24865)
- #24865: partial (`--sidebar-icon-color` goes 60% -> 85% at `index.css:104`: rail icons become 3.46:1 light / 5.69:1 dark. Labels, tooltips and 39x32 targets are unchanged)

### F-07-07 The settings content cannot be scrolled with the keyboard when the dialog opens

- Severity: P2
- Surface: web, desktop
- Evidence: `components/AppRouteModal.tsx:50` (`initialFocus={popupRef}`: focus lands on the dialog surface, which is `overflow-hidden`) and `settingsLayout.tsx:585-588` (the real scroller is a child `div` with no tabindex). Measured on `/settings/appearance`: PageDown, ArrowDown, Space and End all leave `scrollTop` at 0; mouse wheel moves it. After clicking a nav item (focus on that nav button) PageDown and Space still leave the content at `scrollTop` 0.
- Current: Keyboard-only users must Tab 15 times into the content before arrow keys scroll anything.
- Proposed: Make the scroller (`data-settings-page-scroll`, `settingsLayout.tsx:585`) a named, focusable region: `tabIndex={0} role="region" aria-label="Settings content"` with `focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring`, and move `initialFocus` in `AppRouteModal` to it for Settings (keep popup focus for Usage). Adds one Tab stop, saves the rest.
- DNA: DNA-L8, DNA-S3 (2 px focus outline)
- Effort: S
- Risk: Initial focus ring must stay hidden on open (use `focus-visible`, which programmatic focus does not trigger from mouse/keyboard open; verify). Settings search pulse (`useSettingsSearchTarget`) focuses rows and must still win.
- Upstream-eligible: no (settingsLayout.tsx modified by #24865)
- #24865: not addressed

### F-07-08 The "Applying settings for All projects across All environments" sentence appears on pages that have nothing to scope

- Severity: P2
- Surface: web, desktop
- Evidence: `components/settings/SettingsScopeSentence.tsx:45-49` (`SETTINGS_DEVICE_ONLY_PATHS` = appearance, snap-shot, connections only). Observed on `/settings/open-source-licenses` (a read-only list of 437 notices), `/settings/diagnostics` (an environment monitor), and `/settings/beta` where "Working section" is a per-device client setting (`sidebarWorkingShelfEnabled`; docs: "Each device keeps its own choice") next to "Guest links" which is environment-scoped. [shot: oss-light-1440x900] [shot: beta-light-1440x900]
- Current: The sentence is a control ("All projects" is a picker) that changes nothing on those pages; on Beta it implies the device toggle follows the picked project.
- Proposed: Add `/settings/open-source-licenses` to `SETTINGS_DEVICE_ONLY_PATHS`; for Diagnostics show only the environment axis (hide the project picker; `SettingsScopeSentence` already supports `singleEnvironment`); on Beta render the sentence per row group, or add `serverScoped` semantics so the device row states "This device" (reuse the `SettingInheritance` "Set on this device" copy).
- DNA: DNA-P3 (UI is truthful), DNA-L6 (scope sentence then sections only where scope applies)
- Effort: S
- Risk: `_chat.settings.tsx:86` also keys off `SETTINGS_DEVICE_ONLY_PATHS` to skip the "unavailable environment" notices; verify OSS still renders offline.
- Upstream-eligible: no (SettingsScopeSentence.tsx modified by #24865)
- #24865: not addressed (PR restyles the pickers to boxed outline buttons, `SettingsScopeSentence.tsx:133-145`, and the sentence to `text-sm`, but still shows it on these pages)

### F-07-09 Two nav and breadcrumb labels break sentence case: "Scheduled Tasks" and "Source Control"

- Severity: P3
- Surface: web, desktop
- Evidence: `components/settings/settingsSearch.ts:84,87` (`SETTINGS_SECTION_LABELS` feeds the nav, the breadcrumb `SettingsBreadcrumb.tsx:8-17`, and search result subtitles). The other nav labels are single words, so "Scheduled Tasks" (`:87`) and "Source Control" (`:88`) are the Title Case outliers [shot: shell-dark-1024x640]; "SnapShots" (`:84`) is a product noun.
- Current: Title Case in a sentence-case product (DRIFT-11 family).
- Proposed: In `SETTINGS_SECTION_LABELS` change `"Scheduled Tasks"` -> `"Scheduled tasks"` and `"Source Control"` -> `"Source control"`. Leave `"SnapShots"` (a product noun, spelled that way in docs). Search subtitles and the breadcrumb follow automatically because they read the same map.
- DNA: DNA-V1
- Effort: XS
- Risk: `settingsSearch.test.ts` may assert titles; docs reference "Scheduled tasks" already in lower case in prose.
- Upstream-eligible: no (settingsSearch.ts modified by #24865)
- #24865: not addressed

### F-07-10 No keyboard shortcut opens Settings on web (desktop has one)

- Severity: P3
- Surface: web
- Evidence: `packages/shared/src/keybindings.ts:173-175` lists `theme.select`, `appearance.cycle`, `themeEditor.toggle` but nothing for Settings; pressing Cmd+, / Ctrl+, on a thread page did not navigate (checked). The desktop menu defines it: `apps/desktop/src/window/DesktopApplicationMenu.ts:173-174,197-198` (`accelerator: "CmdOrCtrl+,"`).
- Current: Web users must click the footer gear (`SidebarChrome.tsx:209`) or use the palette; the same action is a shortcut in the desktop app.
- Proposed: Add a `settings.open` keybinding (`mod+,`, `when: "!terminalFocus"`) to `DEFAULT_KEYBINDINGS` and its command to `packages/contracts/src/keybindings.ts`, handled where `themeEditor.toggle` is; add a palette row "Open settings" with the `Kbd` hint. Mirrors the Electron accelerator so desktop and web agree.
- DNA: DNA-L8, DNA-P8 (every entry point: chat, settings, palette, keybinding)
- Effort: S
- Risk: Browsers may reserve Cmd+, in some builds; users can rebind in Keybindings. Contract change is additive (a new command), mobile unaffected. Keybinding tests (`KeybindingsSettings.logic.test.ts`) enumerate commands.
- Upstream-eligible: yes (not in #24865's file list)
- #24865: not addressed

### F-07-11 Settings search finds nothing for the theme tools, motion, blur or text size

- Severity: P3
- Surface: web, desktop
- Evidence: `settingsSearch.ts:233-239` (Themes `searchTerms: ["appearance colors palette custom import"]`), `:270-273` (Panel animations has no terms), `:251-253` (Glass opacity terms: transparent transparency solid...). Queries returning zero results: `vs code`, `vscode`, `open vsx`, `create theme`, `inspect`, `export`, `motion`, `reduce`, `blur`, `text size`, `density`. `typography`/`advanced` find the font rows but not the Typography section or its Advanced switch.
- Current: The most-used discovery path for appearance features misses their own names.
- Proposed: Extend terms only: Themes `+ "create theme editor edit duplicate export json vscode vs code open vsx marketplace community add"`; Panel animations `+ "motion transition reduce animation speed sidebar drawer"`; Glass opacity `+ "blur backdrop translucent"`; Interface font `+ "text size zoom scale"`; Contrast `+ "accessibility low vision readability"`. Add one item `typography` -> `targetId: "typography"`.
- DNA: DNA-V5 (explain in place), DNA-P8 (entry points)
- Effort: XS
- Risk: `settingsSearch.test.ts` covers ranking; check no existing exact-match test breaks.
- Upstream-eligible: no (settingsSearch.ts modified by #24865, which adds one item to the same list)
- #24865: not addressed (adds "Colored project icons" with `searchTerms: ["sidebar favicon logo grayscale gray color"]` only)

### F-07-12 Interface font size does not move the layout breakpoints, so Settings overflows at 800x600 with 20 px text

- Severity: P2
- Surface: web, desktop
- Evidence: Measured with Interface font size 20 px at 800x600: nav stays `w-60` = 300 px (it is rem-based, `SettingsSidebarNav.tsx:240`), content shrinks to 426 px but `scrollWidth` is 471 (13 nodes past the right edge: the Panel animations grid `AppearanceSettingsPanel.tsx:386` `sm:grid-cols-[7rem_13rem]` = 400 px, and the font-family rows `TypographySettings.tsx:484-485` `sm:w-44`). `matchMedia("(min-width: 48rem)")` is still true at 800 px with a 20 px root, because media-query `rem` uses the browser's initial 16 px, so `md:`/`sm:` never respond to the setting. 1024x640 at 20 px holds (610 px content) and 1440x900 at 12 px holds. [shot: fontsize20-shell-light-800x600] [shot: fontsize20-shell-light-1024x640]
- Current: The documented 12-20 px range breaks the shell below ~1000 px viewport width at the top of the range (DNA-T4 says everything must survive it). Prior art: issue #21008 (wide interface fonts clip list markers), PRs #12141 and #8011 (sidebar and Files tree at other font sizes).
- Proposed: Switch the Settings shell to container queries, which resolve `rem` against the actual root size: add `@container/app-modal` to the `AppRouteModal` popup (`AppRouteModal.tsx:55`), replace `max-md:` in `SettingsSidebarNav` with `@max-3xl/app-modal:` (48 rem of container), and change the Panel-animations grid and font rows to `@min-[34rem]/settings-row:` (the row is already `@container/settings-row`, `settingsLayout.tsx:476`).
- DNA: DNA-T4 (everything must survive Interface font size), DNA-D2
- Effort: M
- Risk: `@container` on the modal popup changes containing-block behaviour for `position: fixed` descendants only via `container-type: inline-size` (layout containment on inline axis; fixed children are unaffected, absolute are). Verify the theme editor and toasts (both fixed) and `compactSearchOpen` overlay (`absolute`, `:242`).
- Upstream-eligible: no (settingsLayout.tsx, AppearanceSettingsPanel.tsx modified by #24865)
- #24865: not addressed

### F-07-13 One out-of-range or unreadable value in saved client settings locks the whole app behind "Could not read settings" with only Retry

- Severity: P1 (blocking when reached; escalate to P0 for desktop, where the settings file cannot be cleared from the UI)
- Surface: web, desktop
- Evidence: Reproduced twice in a fresh context by seeding `localStorage["t3code:client-settings:v1"]` with (a) invalid JSON and (b) a valid object whose `fontSizeInterface` is 99 (schema max 20, `packages/contracts/src/settings.ts:124-130`): `/settings/appearance` renders only "Could not read settings / Your saved settings could not be loaded. [Retry]" [shot: corrupt-clientsettings-outofrange-light-1440x900]. `components/onboarding/FirstRunGate.tsx:168` swaps the whole app for `FirstRunRecovery` on every route (also `/`); Retry (`:205`) calls `ensureClientSettingsHydrated()` which re-reads the same blob: three Retry clicks changed nothing and Retry is the only button. Desktop decodes strictly on purpose (`apps/desktop/src/settings/DesktopClientSettings.ts:19-22`, "so invalid legacy settings cannot become defaults"). Partial corruption of the theme library, halves and theme id, by contrast, degrades gracefully (checked).
- Current: A version downgrade, a hand edit or a crash mid-write turns into a dead end that needs devtools or file surgery. No Settings, no theme switch, no export, no way to reach the page that could fix it.
- Proposed: Keep the strict decode (it is deliberate) but give the recovery screen a second action: "Reset settings" (variant `ghost-destructive`), behind the existing `ConfirmDialogHost` ("Reset device settings? Appearance, fonts and layout return to defaults. Themes you created are kept."). It first copies the raw blob to `t3code:client-settings:v1:backup-<timestamp>` (web) / `<file>.bak` (desktop), then writes `DEFAULT_CLIENT_SETTINGS` via `writeBrowserClientSettings` and re-hydrates. Surface the schema field that failed in the description ("fontSizeInterface must be 12-20") when the decode error carries it.
- DNA: DNA-P7 (every way in has a way out), DNA-V3 (say what failed, then why)
- Effort: M (web S; desktop needs a bridge call to replace the file, flag as dependency on `apps/desktop`, which is outside UI scope)
- Risk: Never reset silently. No test for `FirstRunGate` recovery; add one browser test for the web path.
- Upstream-eligible: yes for the web path (FirstRunGate.tsx, clientPersistenceStorage.ts untouched by #24865); the desktop file path is gated on a desktop change
- #24865: not addressed (adds one optional boolean with a default, so it is not a new failure source)

### Group B: Appearance page, theme library and color scheme

### F-07-14 After #24865 the Appearance page has two heading styles: "Color scheme" and "Themes" stay 14 px regular at 70%

- Severity: P2
- Surface: web, desktop
- Evidence: `components/settings/ThemeSettings.tsx:830-837` (`<h3 className="px-3 text-sm font-normal text-foreground/70 sm:px-4">`) versus `settingsLayout.tsx:249` which #24865 changes to `text-base font-semibold text-foreground` for "Interface", "Motion", "Typography" (`pr-24865.diff` hunk at `settingsLayout.tsx` `@@ -246,7 +248,7`). The diff does not touch ThemeSettings.tsx. After merge the page reads 14/400/70% for the first two groups and 16/600/100% for the rest [shot: default-light-1440x900 shows today's uniform style].
- Current: A follow-up bug created by the PR: the page's own headings no longer agree.
- Proposed: Reuse the same classes: change both `h3` in `ThemeLibrary` (`:830,835`) to `text-base font-semibold text-foreground` and render them through `SettingsSection`'s heading markup (extract `SettingsSectionTitle` from `settingsLayout.tsx:244-257` so the two cannot drift). Keep the sr-only `h2` "Colors & themes" (`AppearanceSettingsPanel.tsx:88`).
- DNA: DNA-T5 (weight carries hierarchy), DRIFT-7 (four unrelated heading treatments)
- Effort: XS
- Risk: Visual only. Baseline moves with #24865, so land after it.
- Upstream-eligible: yes (follow-up fix to #24865; ThemeSettings.tsx is not in its file list)
- #24865: not addressed (created by the PR)

### F-07-15 At content widths under 520 px (800x600 and below) the theme grid collapses to one column of six 125 px cards

- Severity: P2
- Surface: web, desktop
- Evidence: `ThemeSettings.tsx:723` `gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 16rem), 1fr))"`. Measured content widths: 1440 -> 3 columns; 1024x640 (702 px) -> 2 columns; 800x600 (510 px) -> 1 column, 750 px of scroll for six cards that each hold two 56 px orbs and a name [shot: shell-dark-800x600] [shot: shell-dark-1024x640].
- Current: A card is 256 px wide minimum for content that needs about 150 px, so mid-size windows waste a column and small ones stack.
- Proposed: `minmax(min(100%, 12rem), 1fr)`: gives 3 columns at 702 px, 2 at 510 px, still 1 at 390 px (334 px content). Orbs are 68 px with 10 px gap (`ThemePreviewCircles.tsx:163`), so 12 rem (192 px) fits two orbs and a 4-icon action row at default size.
- DNA: DNA-D1 (entities get room, but not a whole row each), DNA-D6 (density follows available space)
- Effort: XS
- Risk: Custom-theme cards with 4 action buttons are the tightest case (F-07-20); verify truncation at 192 px.
- Upstream-eligible: yes
- #24865: not addressed

### F-07-16 In Windows high-contrast (forced-colors) every Switch disappears

- Severity: P1
- Surface: web, desktop (Windows)
- Evidence: `components/ui/switch.tsx:13` styles the track only with background colours (`data-checked:bg-primary data-unchecked:bg-input`) and the thumb with `bg-background`; there is no `forced-colors:` rule (the repo has 6 uses total, e.g. only the settings slider at `index.css:1041-1056` and the provider progress bar). With `forcedColors: "active"` the "Composer context" and "Render math" rows and the Typography "Advanced" header show no control at all (the same primitive backs Word wrap and every other switch) [shot: forced-colors-scrolled-light-1440x900].
- Current: On, off and the control itself are indistinguishable for forced-colors users. Every settings page uses this primitive.
- Proposed: In `switch.tsx` add to the Root: `forced-colors:border forced-colors:border-[ButtonText] forced-colors:data-checked:bg-[Highlight] forced-colors:data-unchecked:bg-[Canvas]` and to the Thumb: `forced-colors:bg-[ButtonText] forced-colors:data-checked:bg-[HighlightText]`. Leaves the blue accent (owner call) untouched in normal mode.
- DNA: DNA-K10 (primitives own their look), DNA-S3, protocol rule 6 (inaccessible = P1)
- Effort: XS
- Risk: Only affects `@media (forced-colors: active)`. Check with Playwright `forcedColors: "active"`; not covered by any test.
- Upstream-eligible: yes (components/ui/switch.tsx is not in #24865's list)
- #24865: not addressed (does not change switch accent; the owner keeps blue)

### F-07-17 In forced-colors the Color scheme tiles, theme orbs and wireframes are blank, and the selected tile cannot be told apart

- Severity: P1
- Surface: web, desktop (Windows)
- Evidence: Selection is drawn with `box-shadow` (`ThemeSettings.tsx:156` and `:686` `inset 0 0 0 1px var(--ring)`, orb ring `ThemePreviewCircles.tsx:190`), which forced-colors strips; previews use `background-color`/`background-image` (`ThemeWireframe.tsx`, `ThemePreviewCircles.tsx:98-113`). Screenshot: the three Color scheme tiles are empty rectangles with no selected indicator, all six theme orb pairs are identical outlines, nav items are all bordered and the active one differs only by font weight, and only the T3 Code card shows the sun/moon badge [shot: forced-colors-light-1440x900].
- Current: A Windows high-contrast user cannot see whether System, Light or Dark is active, or what any theme looks like.
- Proposed: (1) `forced-color-adjust: none` on `ThemeWireframe` and `ThemePreviewCircle` roots (they are images; Tailwind `forced-color-adjust-none`). (2) Selected states also use a real border/outline: tiles `aria-pressed:forced-colors:border-2 aria-pressed:forced-colors:border-[Highlight]`, cards `forced-colors:outline-2 forced-colors:outline-[Highlight]` when active. (3) Nav active item: `data-[active=true]:forced-colors:border-[Highlight]` in `SettingsSidebarNav`.
- DNA: DNA-S3 (2 px reserved for focus and selection), protocol rule 6
- Effort: S
- Risk: `ThemeSettings.tsx` cards carry the selected state through inline `style`; move it to a class so the variant can apply. Visual-only in normal mode.
- Upstream-eligible: yes for ThemeSettings/ThemePreviewCircles/ThemeWireframe (not in #24865); the nav part joins F-07-03's follow-up
- #24865: not addressed

### F-07-18 The T3 Code (default) card, its wireframe and the splash use an indigo accent the app does not have

- Severity: P2
- Surface: web, desktop
- Evidence: `packages/shared/src/themePreview.ts:8-19` and `components/settings/ThemePreviewCircles.tsx:38-56` hard-code the default preview: light `messageAction #4f46e5`, dark `#8b9cff`, dark sidebar `#0f0f10`, surface `#121212`, accentSurface `#27272a`, light messageSurface `#e4e4e7`. The real palette (`T3_CODE_LIGHT/DARK_THEME_COLORS`, `themePalettes.ts:108-220`) is `#1b4ed8`/`#346bf1`, sidebar `#000000`, surface `#111111`, accentSurface `#141414`, messageSurface `#f4f4f5`. Visible proof: a custom theme "Aurora" created from the defaults renders a blue orb while the T3 Code card beside it is lavender [shot: custom-cards-light-1440x1100]; the System tile's send button is indigo while the real one is blue [shot: default-light-1440x900]. The boot splash default accent has the same drift (`index.html:21-30` `#4f46e5`, `#818cf8`).
- Current: The preview of the default theme is a hand-typed approximation that does not match the theme it represents (and does not match custom copies of it).
- Proposed: Build `STANDARD_THEME_PREVIEW_COLORS` from `getStandardThemeColors(mode)` (already used by the editor seed, `ThemeEditorPanel.tsx:247-249`) instead of literals; delete the second copy in `themePreview.ts`. Leave the boot splash for the DRIFT-3 fix (a mismatch there is not user-visible after first paint).
- DNA: DNA-C1 (tokens, not literals), DNA-P3 (truthful), DNA-X1 (one palette, many renderers)
- Effort: S
- Risk: `themeBoot.test.ts` asserts splash vs palettes. `packages/shared/src/themePreview.ts` is also imported by mobile (`apps/mobile/src/features/settings/appearance/sections/ThemeAppearanceSection.tsx`, `apps/mobile/src/lib/mobileTheme.ts`), so the fix also corrects mobile's default-theme preview; confirm mobile reads its own `t3-code` values.
- Upstream-eligible: yes
- #24865: not addressed (PR keeps `--primary` blue; it does not touch preview constants)

### F-07-19 Built-in, environment-published and custom themes share one undifferentiated grid with no sections or filter

- Severity: P2
- Surface: web, desktop
- Evidence: `ThemeSettings.tsx:725-823` renders default, five maintainer themes, published themes, then custom collections inside one `grid`. Published themes get only a Duplicate button and no marker (`:764-790`), so a card that "follows the palette as the server updates it" (docs) looks identical to a one-off. With 60 custom themes the page is 4,664 px tall with 66 cards (a theme switch still takes 224 ms in the dev build); labels truncate to "Custom theme nu…" [shot: 60-custom-themes-light-1440x900]. Environment-published themes were not exercised live (see Incomplete).
- Current: No way to find "mine" among many, to tell published from local, or to scan.
- Proposed: Section the grid with the existing small heading style: "Built-in", "Published by {environment label}" (cards get a `title`/tooltip "Updates with the server. Duplicate to edit."), "Your themes". Add a "Filter themes" input (`Input size="sm"`) only when custom + published count exceeds 12. Sections reuse `renderPairGrid` (`:719`) with a `themes` argument.
- DNA: DNA-D1, DNA-P3 (a label must reflect real state), DNA-P2 (the filter appears only when needed)
- Effort: M
- Risk: Card order is not persisted today, so sectioning changes nothing stored. Keyboard order changes.
- Upstream-eligible: yes
- #24865: not addressed

### F-07-20 Custom theme names truncate to about ten characters with no way to read them

- Severity: P2
- Surface: web, desktop
- Evidence: `ThemeSettings.tsx:296-312` title is `truncate` inside a flex row shared with up to four icon buttons (`:313-402`). A 48-character name shows "A really really long…"; all 60 test themes read "Custom theme nu…". The wrapping `Tooltip` shows usage copy ("Use for light mode only", `:407-413`), never the name. [shot: custom-cards-light-1440x1100] [shot: 60-custom-themes-light-1440x900]
- Current: Names that differ only after character 10 are indistinguishable; the full name appears only inside the edit panel.
- Proposed: Give the title button `title={theme.label}` and put the full name in the tooltip's first line (`"{label} · Use for both light and dark"`), and move the four actions into one `ghost` icon `Menu` ("Theme actions": Duplicate, Edit, Export theme file, Remove) so the name gets the row. Keep Duplicate visible alone for built-ins.
- DNA: DNA-T9 (truncate in rows, but never hide the identity), DNA-D2
- Effort: S
- Risk: A menu hides Remove one click deeper; keep destructive confirmation as is (`AlertDialog`, `:902`).
- Upstream-eligible: yes
- #24865: not addressed

### F-07-21 Each theme card is four Tab stops (24 for the six built-ins), with no radio-group semantics

- Severity: P2
- Surface: web, desktop
- Evidence: Measured Tab sequence per built-in card: "Use X light mode", "Use X dark mode", "Use X theme", "Duplicate X" (`ThemePreviewCircles.tsx:171-182`, `ThemeSettings.tsx:299-310,315-330`); custom cards add Edit/Export/Remove. The two orbs and the name button do the same job at three granularities; the card `div` itself is mouse-only (`:149-156`, `onClick` without role).
- Current: Choosing a theme by keyboard takes up to 24 Tab presses to pass the grid, and a screen reader hears "button pressed" ×3 per card.
- Proposed: Make the grid a `role="radiogroup" aria-label="Theme"` with one tab stop (roving) whose arrow keys move between cards and whose Enter applies "both"; Light and Dark orbs stay buttons reachable with Tab inside the focused card (2 stops), Duplicate/Edit/Export/Remove move into the actions menu from F-07-20. Net: 1 stop per card for the pick, 2 for per-half.
- DNA: DNA-L8, DNA-K8 (halves model preserved)
- Effort: M
- Risk: Preserve per-half selection semantics (`pickedModesFor`, `assignHalf`); keep `aria-pressed` on orbs. No tests on the library.
- Upstream-eligible: yes
- #24865: not addressed

### F-07-22 Export uses an upload icon and the import button uses a download icon

- Severity: P3
- Surface: web, desktop
- Evidence: `ThemeSettings.tsx:368` (`UploadIcon` inside "Export theme file") and `ThemeImportDialog.tsx:444` (`DownloadIcon` on "Choose files"). Convention in the rest of the app: arrow into a tray = import/download, arrow out of a tray = export/upload; here the arrows are reversed relative to the user's verb.
- Current: The glyph and the verb disagree.
- Proposed: Export -> `DownloadIcon` (the file leaves the app to disk), "Choose files" -> `FolderOpenIcon` or `FileUpIcon` (from lucide, already installed). One-line each.
- DNA: DNA-I2 (icons agree with verbs)
- Effort: XS
- Risk: None.
- Upstream-eligible: yes
- #24865: not addressed (PR changes icon stroke only)

### F-07-23 Exporting a theme collection writes one variant, under an internal id

- Severity: P3
- Surface: web, desktop
- Evidence: `ThemeSettings.tsx:796` `downloadThemeFile(\`${customTheme.id}.json\`, ...)`for the currently selected variant. After installing "Dracula Theme Official" (2 variants) the single Export button saved`ovx-theme-f22bbdbb4a17.json`with one theme (3,692 bytes, 61 colour roles, no`variants`).
- Current: The card is labeled with the collection ("Dracula Theme Of…") but the file contains only one of its themes and a name no human chose.
- Proposed: Name the file from the label (`slug(theme.label).json`, falling back to the id; the same slug helper as F-07-31). For a collection with more than one variant, list one export entry per variant in the actions menu from F-07-20 ("Export Dracula Theme", "Export Dracula Theme Soft"). The file format is unchanged (`parseThemeFile` takes one object).
- DNA: DNA-P3, DNA-P2
- Effort: S
- Risk: `parseThemeFile` accepts single objects only; do not change the file format (additive per-variant menu entries are safe).
- Upstream-eligible: yes
- #24865: not addressed

### F-07-24 Collection variant labels strip too much: "Dracula Theme" and "Dracula Theme Soft" become "Theme" and "Theme Soft"

- Severity: P3
- Surface: web, desktop
- Evidence: `ThemeSettings.tsx:65-78` (`collectionVariantLabels` removes the shared word prefix; when every word of the first label is shared it keeps only the last word). The orb caption shows "Theme +1" [shot: add-theme-installed-dark-1440x900], and the remove dialog lists the full names, so the two UIs disagree.
- Current: The only text on the orb is a meaningless "Theme".
- Proposed: Strip the shared prefix only when every label keeps at least one word afterwards (`words.every(w => w.length > prefixLength)`); otherwise return the full labels. For this pair that yields "Dracula Theme" and "Dracula Theme Soft".
- DNA: DNA-V7
- Effort: XS
- Risk: Pure function (export it for a unit test).
- Upstream-eligible: yes
- #24865: not addressed

### F-07-25 The remove-theme dialog promises a restore the user may not have

- Severity: P3
- Surface: web, desktop
- Evidence: `ThemeSettings.tsx:913` "You can bring it back anytime by importing its JSON file." Custom themes live only in `t3code:themes:v1` (device storage); a JSON file exists only if the user pressed Export earlier. Editor-made themes have no file at all.
- Current: Reassurance that is false for most themes; Remove is irreversible with no undo.
- Proposed: Either change the copy to "This removes it from this device. Export it first if you want to keep a copy." with an inline "Export" ghost button in the dialog footer, or (better, DNA-P7) offer a 5-second Undo toast like pin/settle ("Removed Aurora · Undo") that calls `installCustomTheme` with the removed definition and halves.
- DNA: DNA-P7 (every way in has a way out), DNA-P3
- Effort: S
- Risk: Undo must restore halves too (`readThemeHalvesRaw()` captured at `:579`).
- Upstream-eligible: yes
- #24865: not addressed

### Group C: Interface controls (contrast, motion, typography)

### F-07-26 The Contrast slider goes down to 50%, where body text is 3.36:1 and secondary text 2.01:1, with no warning

- Severity: P2
- Surface: web, desktop
- Evidence: `AppearanceSettingsPanel.tsx:122-152` (`min=50`, `max=200`, `step=5`, default 100); range from `packages/contracts/src/settings.ts:106-112`. Measured on the Settings surface, WCAG ratios of `text-foreground` / `text-muted-foreground`: light 100% 14.52 / 4.71, 75% 7.13 / 3.01, 50% **3.36 / 2.01**; dark 100% 18.16 / 5.08, 75% 9.34 / 3.15, 50% **4.24 / 1.94**. Secondary text drops under 4.5:1 below 95% (light 4.32, dark 4.61 at 95%). In dark, values above 100 barely move foreground (18.16 -> 18.80 at 140%). [shot: contrast50-light-1440x900] [shot: contrast50-dark-1440x900]
- Current: A control labeled "Contrast" lets the user make the app unreadable, and nothing says that 100 is the tuned design point (DNA-C4: 4.71 / 5.08 are deliberate).
- Proposed: Raise the UI minimum to 75 (`min={75}` on the input; keep the contract minimum at 50 so stored values still decode and clamp on read). Add a one-line `status` under the description when the value is below 100: "Below 100% secondary text falls under 4.5:1." (`SettingsRow` already has a `status` slot, `settingsLayout.tsx:499-501`). Re-measure after #24865: dark `--muted-foreground` becomes `#a3a3a3` and light foreground `zinc-900`, which shifts the numbers up.
- DNA: DNA-C4, DNA-C5, DNA-K9
- Effort: XS
- Risk: Users who saved 50-70 keep it (decoded as is) until they touch the slider; the status line then explains it. No test.
- Upstream-eligible: no (AppearanceSettingsPanel.tsx modified by #24865)
- #24865: partial (baseline moves: dark muted `#a3a3a3`, light foreground `zinc-900`, dark borders 8%/11%; slider range untouched)

### F-07-27 Panel animations shows 400 ms while the OS reduced-motion setting silently forces 0

- Severity: P2
- Surface: web, desktop
- Evidence: `panelAnimations.ts:30-38` (`active = durationMs > 0 && !prefersReducedMotion && !suppressed`) and `PanelAnimationsPreview.tsx:8` (`motion-reduce:transition-none`). With Playwright `reducedMotion: "reduce"` and the slider at 400 ms the row reads "Panel animations ... 400 ms", `data-panel-animations="false"`, the preview does not animate when clicked, and nothing on the row says why. Docs mention the override; the UI does not. [shot: panel-animations-400ms-os-reduced-motion-light-1440x900]
- Current: A control that does nothing, labeled as if it did (DNA-P3: a stale label).
- Proposed: In `AppearanceSettingsPanel.tsx:381-433` read `useMediaQuery("(prefers-reduced-motion: reduce)")` (the hook `panelAnimations.ts` uses) and, when true and the value is above 0, pass `status="Your system asks for reduced motion, so panels open instantly."` to the `SettingsRow` and add `aria-describedby`; keep the slider enabled.
- DNA: DNA-P3, DNA-M5
- Effort: XS
- Risk: None; no test.
- Upstream-eligible: no (AppearanceSettingsPanel.tsx modified by #24865)
- #24865: not addressed

### F-07-28 A font family the browser cannot find turns the field red and is silently discarded

- Severity: P2
- Surface: web (browsers without Local Font Access, and every browser until permission is granted), desktop when enumeration is unavailable
- Evidence: `TypographySettings.tsx:435-481`: the draft only commits when `isFontFamilyAvailable` (and `isMonospaceFamily` for code/terminal) passes (`:397-404`); otherwise `aria-invalid` is set (`:438`, `draftPending`) and nothing else. Typing "Nonexistent Foo Font" in Interface font: red border, `--font-sans` unchanged, no message. [shot: font-invalid-light-1440x900] Prior art: PRs #9814 (font picker keyboard selection) and #15642 (validate monospace fonts on selection) shaped this validation.
- Current: The user cannot tell "not installed", "not monospace" or "still validating".
- Proposed: Render a 12 px helper line under the control when `draftPending` (reuse the `status` slot): "No installed font named “{draft}”." / for code and terminal "“{draft}” is not monospace." with `aria-live="polite"`, cleared on edit. Use curly quotes already used elsewhere in the page.
- DNA: DNA-V3 (say what failed, then why), DNA-P3
- Effort: S
- Risk: `isMonospaceFamily` canvas probing is a heuristic; wording must say "does not look monospace".
- Upstream-eligible: yes (TypographySettings.tsx is not in #24865's list)
- #24865: not addressed (PR touches `SettingsFontPreviews.tsx` only for the placeholder constant)

### F-07-29 Theme and font error toasts use contractions, duplicate strings, and a one-word fallback body

- Severity: P3
- Surface: web, desktop
- Evidence: `ThemeSettings.tsx:541` "Couldn’t save theme selection" (curly apostrophe), `CommandPaletteThemeItems.tsx:32` "Couldn't save theme selection" (straight apostrophe, a second copy of the same function `notifyThemeSaveFailure`), both with description "Try again."; `ThemeSettings.tsx:551` "Couldn’t remove theme"; `FontFamilyPicker.tsx:135` `"${value}" isn't monospace`; `ThemeImportDialog.tsx:378` "Theme added, but it could not be selected. Try again." (see F-07-35).
- Current: Contractions in titles, two apostrophe styles for one message, and a description that restates the title's action instead of the cause (DRIFT-12).
- Proposed: Export `notifyThemeSaveFailure` from `CommandPaletteThemeItems.tsx` and import it in `ThemeSettings.tsx` (one copy); titles "Could not save theme selection", "Could not remove theme", "Could not use “{font}”"; description "Browser storage is unavailable or full. Free some space and try again." when the failure is a `ThemeStorageError` (`ThemeStorageError`, `hooks/useTheme.ts:95`), otherwise the generic text.
- DNA: DNA-V3, DNA-V4 (one error prefix, no contractions)
- Effort: S
- Risk: Strings may be asserted in `themePalette.test.ts`/palette tests; grep before changing.
- Upstream-eligible: yes
- #24865: not addressed

### Group D: Theme editor, import and Open VSX search

### F-07-30 Importing a VS Code theme fails for ordinary VS Code theme files (JSONC) with raw engine errors

- Severity: P1
- Surface: web, desktop
- Evidence: `ThemeImportDialog.tsx:222,364` call `JSON.parse`; the dialog advertises "Drop T3 Code or VS Code .json files" (`:496`). VS Code theme files are JSON with comments and trailing commas. Tested by pasting: a theme with a `// comment` -> "Expected property name or '}' in JSON at position 3 (line 2 column 2)"; a trailing comma -> "Expected double-quoted property name in JSON at position 72 (line 1 column 73)"; plain garbage -> "Unexpected token 'o', "not json" is not valid JSON". The Open VSX path already tolerates both: `openVsxThemes.ts:326-329` uses `jsonc-parser` `parse(source, errors, { allowTrailingComma: true })`. [shot: import-error-light-1440x900 for the structured error style]
- Current: The same theme installs from Open VSX and fails when downloaded and dropped in, and V8's message is shown to the user.
- Proposed: Replace both `JSON.parse` calls with a shared `parseThemeJson(text)` in `vscodeThemeImport.ts` that uses `jsonc-parser` (already a dependency, no new dep) with `allowTrailingComma`, and on failure returns "That file is not valid JSON (line 2, column 2)." built from `getLocation`/error offset instead of the engine text. Keep the T3 format strict (`parseThemeFile` unchanged).
- DNA: DNA-V3, DNA-P3 (the dialog promises VS Code files)
- Effort: S
- Risk: `vscodeThemeImport.test.ts` and `openVsxThemes.test.ts` exist; add JSONC cases. `jsonc-parser` is already imported in the web bundle, so no size change.
- Upstream-eligible: yes
- #24865: not addressed

### F-07-31 Any theme name without Latin letters or digits gets the id `custom-theme`, so the second one offers to merge into the first

- Severity: P2
- Surface: web, desktop
- Evidence: `themePalette.ts:1064-1072` (`replace(/[^a-z0-9]+/g, "-")`, falls back to `"custom-theme"`). Repro: Create theme named "テスト" (stored as id `custom-theme`), then Create theme named "Тёмная тема": the submit button changes to "Add dark palette" and would merge into "テスト" [shot: editor-nonlatin-collision-light-1440x1000]. A name of only emoji, Arabic or Cyrillic behaves the same. a name made of "Sunset" plus emoji and katakana becomes `sunset`, so it also collides with a plain "Sunset".
- Current: Users writing in Japanese, Chinese, Korean, Arabic, Hebrew, Russian and so on cannot keep more than one theme without ASCII in its name; the UI misreads the collision as an intentional merge.
- Proposed: Build the id from `name.normalize("NFKD")` stripped of combining marks with `\p{L}\p{N}` kept (`/[^\p{L}\p{N}]+/gu`), lower-cased with `toLocaleLowerCase()`, falling back to `custom-theme-<8 hex of FNV(name)>` when nothing remains. Existing ids are untouched (only new themes use the wider alphabet) and `isReservedThemeId` still guards `system`/`light`/`dark`/built-ins.
- DNA: DNA-P9 (nothing assumes one script), DNA-V7
- Effort: S
- Risk: Ids are used as `data-theme-id` and CSS-variable-free storage keys only (checked `themePalette.ts`), but the id also appears in the exported filename (`ThemeSettings.tsx:796`), so slug the filename separately. `themePalette.test.ts` covers ids; add a non-Latin case.
- Upstream-eligible: yes
- #24865: not addressed

### F-07-32 Opening the theme editor from Settings leaves it unable to inspect the app

- Severity: P2
- Surface: web, desktop
- Evidence: With Settings open the document behind the modal is the retained, `inert` thread view under a backdrop (`MAP.md` 1.1; `AppRouteModal.tsx:36-60`). Hovering the backdrop in Inspect mode highlights nothing; hovering the Settings nav row "Integrations" reports it as "Accent" (a label that looks wrong, see Needs deeper look) [shot: inspect-hover-nav-light-1440x900]. Clicking inside Settings picks "Surface · 11 uses" correctly [shot: inspect-picked-light-1440x900]. The panel opens bottom-right and covers the Contrast, Glass and Diff rows it is previewing [shot: editor-open-light-1440x900]. The docs sell "select an area of the app to find the colour to change".
- Current: The headline feature of the editor works on the Settings page itself but not on the chat, composer, sidebar rows or diff, which is where users want to recolour. The shortcut path (palette or `mod+alt+shift+t`) from a thread does work, but nothing in Settings says so.
- Proposed: When "Inspect" is armed while the route is a modal page (`isAppModalPage(pathname)`, `components/sidebar/mainAppLocation.ts:6`), call `useCloseAppModal()` first so the app underneath is live (the editor survives navigation by design, `themeEditorStore.ts`), and re-open Settings from the editor header's new "Back to Settings" ghost button only if the user came from there. Fallback if that is too invasive: a one-line hint in the editor header when Settings is open: "Close Settings to inspect the chat".
- DNA: DNA-P7, DNA-L4
- Effort: S
- Risk: Closing Settings clears the Settings scroll/search state; the editor draft is retained (hosted above the router, `routes/__root.tsx:273-274`). No tests.
- Upstream-eligible: yes
- #24865: not addressed

### F-07-33 Open VSX results show no palette, and installing neither selects nor reveals the new theme

- Severity: P2
- Surface: web, desktop
- Evidence: `ThemeSearchSection.tsx:373-431`: each result is icon, name, publisher, download count, two-line description, a source link and "Install", and nothing shows colours. After Install (639 ms for "Dracula Theme Official") the dialog closes (`ThemeImportDialog.tsx:401-405`), a toast says "2 themes added / Dracula Theme, Dracula Theme Soft" (`ThemeSettings.tsx:862-875`), `localStorage["t3code:theme"]` is unchanged, and the new card is appended at the bottom of the grid [shot: add-theme-installed-dark-1440x900]. Contrast: a theme added via JSON paste or file activates (`ThemeSettings.tsx:876-897`, "It’s now active").
- Current: Install is a blind download and the two import paths behave differently afterwards.
- Proposed: (1) After a successful install, scroll the first new card into view and pulse it with the existing `settings-search-target-pulse` (650 ms, 2×; `index.css:900-914`), and add a toast action "Use" that calls the same `assignHalf`/`persistTheme` path as a card click. (2) Do not add previews to search results (it would need a download); instead say so: "Colors appear after installing. You can remove it again." under the description.
- DNA: DNA-P7 (undo path = Remove), DNA-P3
- Effort: S
- Risk: Toasts already carry `actionProps` (`components/ui/toast.tsx:267-301`, used by the Undo toasts); the card may be off-screen in a long grid, so scroll with `block: "center"`.
- Upstream-eligible: yes
- #24865: not addressed

### F-07-34 Search, import and editor failure copy is raw or false in four places

- Severity: P3
- Surface: web, desktop
- Evidence: (a) Offline search shows the browser string "Failed to fetch" (`ThemeSearchSection.tsx:175`; route-aborted `open-vsx.org` in test) [shot: add-theme-offline-light-1440x900]; ASCII `...` in "Search themes...", "Searching themes...", "Installing..." (`:290,347,361,425`, DRIFT-14). (b) `ThemeImportDialog.tsx:378` "Theme added, but it could not be selected." appears after `removeCustomTheme` rolled the theme back (`:375-377`), so nothing was added. (c) `ThemeEditorPanel.tsx:850` "Theme saved, but it could not be made active." after the same rollback (`:840-849`). (d) Both Open VSX and import errors use `role="status"` / `aria-live="polite"` for errors (`ThemeSearchSection.tsx:354`, `ThemeImportDialog.tsx:517`).
- Current: Messages state outcomes that were undone (DNA-P3) and the network error is the engine's.
- Proposed: (a) catch `TypeError` from `fetch` and show "Could not reach Open VSX. Check your connection and try again."; use `…` in the three strings. (b)(c) "Could not add the theme because browser storage is unavailable." / "Could not save the theme because browser storage is unavailable. Nothing was changed." (d) `role="alert"` on error `Alert`s.
- DNA: DNA-V3, DNA-V9, DNA-P3
- Effort: S
- Risk: Strings only.
- Upstream-eligible: yes
- #24865: not addressed

### F-07-35 The import error appears below the action buttons, after the form

- Severity: P3
- Surface: web, desktop
- Evidence: `ThemeImportDialog.tsx:503-521`: `Cancel / Add theme` row first, then the `Alert` (`:516-520`). In the 1440x900 capture the alert sits 30 px under the buttons [shot: import-error-light-1440x900]; with Open VSX results expanded the dialog is taller than 640 px, so a failure from "Add theme" lands below the fold of `DialogPanel`'s scroll.
- Current: The result of the click is rendered away from the control that caused it.
- Proposed: Move the `Alert` above the button row (inside `<div className="space-y-4">`, after `editorSection()`), and call `scrollIntoView({ block: "nearest" })` on it when `error` changes.
- DNA: DNA-V3, DNA-D6
- Effort: XS
- Risk: None.
- Upstream-eligible: yes
- #24865: not addressed

### F-07-36 The theme editor's drag and resize are pointer-only and its controls are 24-28 px on touch

- Severity: P3
- Surface: web (phone width), desktop
- Evidence: Header drag `ThemeEditorPanel.tsx:1088-1094` and corner resize `:1191-1209` (`aria-hidden`, pointer events only). Measured at 390x844: colour swatch 24x24 (`ThemeColorPicker.tsx:255` `size-6`), Light/Dark segmented 51x24 and 49x24, minimize and close 28x28, "Inspect" 81x28, name "Select a colo…" truncated [shot: editor-mobile-advanced-light-390x844]. The panel is `role="dialog"` with no `aria-modal` and no focus management in code (no initial or final focus target).
- Current: Keyboard users cannot move or resize the panel (it sits over the controls it edits), and phone users hit 24 px targets.
- Proposed: Add `Alt+Arrow` to move and `Alt+Shift+Arrow` to resize by 16 px steps on the header, with `aria-keyshortcuts`; at `max-sm` use `size-9` swatches and `h-9` toggles (`sm:` back to current); return focus to the opener (`Create theme`) on close.
- DNA: DNA-D4, DNA-L8
- Effort: M
- Risk: Untested component; the phone use of an area inspector is questionable, so only touch sizing is proposed there, not new behaviour.
- Upstream-eligible: yes
- #24865: not addressed

### Group E: Diagnostics, docs

### F-07-37 Diagnostics uses 10-11 px text at 1.84-2.7:1

- Severity: P1
- Surface: web, desktop
- Evidence: `components/settings/ResourceTelemetryDiagnostics.tsx:237,272,292,579,683,765,1007,1114,1182` (`text-3xs` / `text-2xs`, `font-semibold uppercase tracking-widest`, `text-muted-foreground/45` to `/75`). Measured over the page (unique small-text styles, ratio against the actual background): light "CPU" label 1.84:1 (10 px uppercase), "PID + start time" 2.10, "26m" 2.28, "Resource monitor binary was not found" 2.51, "Child processes" 2.72; dark 1.92, 2.27, 2.49, 2.74, 2.97. [shot: diagnostics-light-1440x900]
- Current: A page full of table headers and units that fail contrast by half.
- Proposed: Remove the opacity modifiers (`/45 /60 /65 /70 /75`) in this file and use `text-muted-foreground` (4.71 / 5.08); keep `text-3xs uppercase tracking-widest` only for the three table `thead` rows (`:579,683,765`; DNA-T10 allows overlines at 10-11 px) and the section overlines and move every other `text-3xs` to `text-2xs`. Replace `bg-linear-to-r from-muted/45 via-muted/20 to-transparent` (`:1005`) with a flat `bg-muted/30`.
- DNA: DNA-C4, DNA-C5, DNA-T10, DNA-ID2 (flat canvas), DRIFT-1
- Effort: S
- Risk: Visual only; 3 mono tables get slightly more contrast. No tests.
- Upstream-eligible: yes (file untouched by #24865)
- #24865: not addressed

### F-07-38 Diagnostics says "Sampling every 0 ms" beside a green dot while the monitor is unavailable

- Severity: P2
- Surface: web, desktop
- Evidence: `ResourceTelemetryDiagnostics.tsx:1015-1018` renders `size-1.5 rounded-full bg-success` + "Sampling every {formatSampleInterval(snapshot.sampleIntervalMs)}" (`:87-93` returns `0 ms` for 0); the same screen shows a red "NATIVE UNAVAILABLE" pill and "Resource monitor binary was not found for darwin/arm64" (also a dev-build condition). [shot: diagnostics-light-1440x900]
- Current: Contradictory status: a success dot and an impossible interval while nothing is sampling.
- Proposed: When the snapshot is unavailable or `sampleIntervalMs <= 0`, render a `bg-destructive` dot and the text "Not sampling" (hide the interval); otherwise keep the success dot and "Sampling every {interval}".
- DNA: DNA-P3, DNA-M9 (status must not lie), DNA-C6
- Effort: XS
- Risk: None.
- Upstream-eligible: yes
- #24865: not addressed

### F-07-39 docs/user/appearance.md omits ten controls that the Appearance page ships

- Severity: P3
- Surface: all (docs)
- Evidence: `docs/user/appearance.md` (digest in `DOCS-DIGEST.md:25-46`) documents colour scheme, themes, Create theme/import/export, Composer context, Render math, Panel animations, environment themes and the `t3 theme` CLI. Not documented: Contrast, Glass opacity, Diff colors, Chat width, Environment identification (Dev/Nightly), Typography (interface, prompt, code, terminal family and size, Advanced switch, font smoothing, word wrap), Open VSX theme search, per-card Edit/Export/Remove, theme collections, and (arriving with #24865) Colored project icons. The digest's "Customisation that already exists" table even says "no font family" and "no density setting" for web/desktop (`DOCS-DIGEST.md:776`), which is wrong for fonts.
- Current: Users and the audit team cannot discover shipped customisation from the docs.
- Proposed: Add one short paragraph per group under existing headings (task-oriented, no UI inventory, per AGENTS.md documentation rules): "Colors" (contrast, glass, diff colors), "Text" (families, sizes, Advanced), "Layout" (chat width). Add the Open VSX path to the "Create theme" paragraph.
- DNA: DNA-V5, DNA-K16
- Effort: S
- Risk: None; keep within the "what task does this help" rule.
- Upstream-eligible: yes (docs/user/appearance.md is not in #24865's file list)
- #24865: not addressed (PR edits only `docs/user/thread-sidebar.md` label text)

## Edge-case results (matrix)

Data

- Empty: PASS. Fresh profile shows the six built-in cards; Settings search with no match shows "No settings found".
- One item: PASS (one custom theme card renders and activates).
- 100+ items: NOT TESTED at 100. 60 custom themes (66 cards, 4,664 px of scroll) render and switch in 224 ms but have no sections or filter and truncated names: FAIL (F-07-19, F-07-20). Open source licenses lists 437 rows without trouble: PASS.
- 10,000+ items: N/A for Settings. The installed-font list is virtualised (`FontFamilyPicker.tsx`, LegendList): code-read only.
- Very long names: 48-character theme name truncates to about ten characters with no full name anywhere on the card: FAIL (F-07-20). 80 characters is rejected only after pressing Create ("Theme files need a name (48 characters or fewer)"): PASS with a late message (no `maxLength` on the field).
- Unicode and emoji in names: FAIL (F-07-31: non-Latin names collapse to one id). Emoji and RTL text as a search query: PASS (results returned, no error).
- RTL text: names collide (F-07-31); RTL layout of the shell itself NOT TESTED (no RTL locale in the app).
- Leading/trailing whitespace: PASS (" padded name " stored as "padded name", id `padded-name`).
- Whitespace-only name: PASS (Create theme stays disabled).

Content

- 5k-line diff, binary files, tool output, code fences, tables, images, long strings: N/A (not in this area). Typography previews (code, terminal, prompt chips) render and scroll horizontally at 390 px: PASS.

Network and agents

- Provider not installed, logged out, auth expired, streams, permission prompts, relay, reconnect, server restart, version mismatch: N/A. Appearance settings are device-local; only environment-published themes depend on the server (code-read, see Incomplete).
- Open VSX unreachable: FAIL (F-07-34, shows "Failed to fetch"). No results: PASS ("No supported open-source themes found / Try a broader search."). Install of a 2-variant extension: PASS (639 ms); installed as `ovx-theme-*` ids.

Git

- All rows N/A.

Viewport

- 1440x900: PASS. 1280x720 (modal 1200x640): PASS. 1024x640 (944x560, 2-column grid): PASS with F-07-15 and F-07-12 only at large font sizes.
- 800x600: holds at default font size; theme grid is one column (F-07-15); nav stays 240 px; with Interface font 20 px content overflows by 45 px (F-07-12).
- 3440x1440: PASS (modal capped at 1280x960, centred).
- 390x844: PASS for layout (rail + content, no horizontal overflow), FAIL for rail legibility and targets (F-07-06) and 24-28 px editor controls (F-07-36). Mobile search overlay (rail expands to full width, results, Enter jumps and pulses): PASS, Close is covered while searching (cosmetic).
- Soft keyboard open: NOT TESTED (no soft keyboard on this host; the modal uses `max-sm:pt-safe pb-safe`, code-read only).
- OS zoom 80/125/150%: 125% emulated at 1152x720: PASS (nav 240, content 818). 150% and 80% NOT TESTED separately (fall between the 1024x640 and 1440x900 results).
- Browser zoom 50%: 2880x1800 PASS (modal stays 1280x960, small but correct). 200%: 720x450 PASS (rail 56 px, content 602 px, no overflow) with F-07-06.

Preferences

- Light, dark: PASS. System switching live (`emulateMedia` flip in-session): PASS, `.dark`, `theme-color` meta and body background change in under 500 ms with 0 running animations. Cycle shortcut (mod+alt+shift+a) System -> Light -> Dark -> System: PASS; theme picker (mod+alt+a) opens over Settings: PASS.
- Every named theme: PASS for light/dark/halves rendering, sidebar artwork recolour and composer colours (12 captures). Settings description text is 3.25-4.44:1 in 10 of 12 theme x mode combinations (T3 Chat passes: 5.62 / 7.89): addressed by #24865 (`text-muted-foreground` without `/80`).
- Reduced motion: FAIL (F-07-27).
- High contrast (forced-colors): FAIL (F-07-16, F-07-17). The slider is handled (`index.css:1041-1056`).
- Keyboard only: FAIL (F-07-03, F-07-07, F-07-21, F-07-36). Focus rings are visible everywhere checked (nav 2 px inset ring, tiles 2 px outline, Add theme button ring).
- Screen reader: NOT TESTED (no screen reader on this host). Code-read only: F-07-04 (no `aria-current`), tiles and orbs use `aria-pressed`, nav has `aria-label="Settings sections"`.
- Font size overrides: Interface 12 px at 1440x900 PASS; 20 px at 1024x640 PASS; 20 px at 800x600 FAIL (F-07-12). Invalid family: FAIL (F-07-28).

Lifecycle

- First ever launch: PASS (fresh context, no keys; boot splash then the correct theme). Boot flash with a 2.5 s delayed bundle for default light/dark/system, Grove dark, T3 Chat light and Ocean system: PASS, no wrong-theme frame; the unselected-default splash is `#ffffff`/`#0a0a0a` against app `#fcfcfc`/`#0a0a0a` (DRIFT-3, not visible after paint).
- Launch after update or downgrade: simulated with an out-of-range saved value: FAIL (F-07-13).
- Corrupted settings: client settings FAIL (F-07-13). Corrupted theme library, theme id and halves: PASS (graceful: bad entries are skipped and untouched, valid ones kept; a new theme is appended without wiping the rest).
- Launch with server already running, app backgrounded for an hour, minimised during stream, OS sleep: N/A (client-only settings; storage events keep tabs in sync, `hooks/useTheme.ts` `handleStorageChange`, code-read).

## Already good (do not touch)

- Boot script and parity test: no wrong-theme or wrong-appearance frame for named, dark or system themes (DNA-K8). Do not add a second boot path.
- Live system switching, the cycle shortcut, the palette "Change theme" / "Change appearance" and "Toggle theme editor" (`CommandPaletteThemeItems.tsx`) all work from inside Settings.
- The per-half model: one card, two orbs, ring plus sun/moon badge on the picked half, tooltips "Use for dark mode only". Keep it; fix its keyboard and forced-colors behaviour (F-07-17, F-07-21) rather than the model.
- Esc behaviour in Select popups, the colour-picker popover, the Add-theme dialog, the settings search field (clears first) and the font input (discards the draft without closing Settings, `TypographySettings.tsx:466-477`).
- Settings search: `/` and Cmd/Ctrl+F, arrow/Enter/Esc, hash jump with pulse, mobile overlay, and the "No settings found" status.
- Theme storage tolerance: partially corrupt `t3code:themes:v1`, halves and theme id degrade without a crash or data loss.
- The T3-format import errors that exist ("unsupported version. Expected 1", "must contain a JSON object", the per-colour message with an example).
- Open VSX path: size caps, licence allow-list, JSONC-tolerant manifest parsing, 639 ms install; and the remove-collection checklist and "Already installed: Update existing / Keep both" resolution.
- Typography previews (prompt chips, code diff, terminal) update live and are the clearest feedback loop on the page; font size reset restores family and size together.
- Slider forced-colors handling and the `output` readouts with `tabular-nums`.
- The editor's Inspect picker inside Settings: role label plus "N uses" count with usage highlights; guided "two colours, rest derived" default (`createVividThemeColors`, DNA-C13).
- Glass at 40%: the command palette over a thread stays legible [shot: glass40-palette-light-1440x900].

## Incomplete (what I did not cover and why)

- Environment-published themes and `t3 theme set/clear/show`: publishing needs a file in the dev server's themes directory and `set` changes the default theme for every paired client, which would contaminate other areas' captures. Code-read only (`hooks/useEnvironmentTheme.ts`, `hooks/useDefaultTheme.ts`). F-07-19's "published" marker is therefore unverified in the running UI.
- Desktop (Electron): `bridge.setTheme`, native file picker for theme import, settings-file read errors (`DesktopClientSettings.ts`) are code-read only; area 14 owns the desktop host.
- Local Font Access picker (granted state) and the permission prompt: headless Chromium falls back to the text input; `FontFamilyPicker.tsx` is code-read.
- Screen reader, soft keyboard, real OS zoom, Windows and Linux (Inter, Segoe UI, forced-colors on real Windows): not available on this host.
- Post-#24865 rendering: the PR is open, so the end state was read from the diff and not rendered. Measured contrast numbers are main's.
- Beta toggles were not flipped (Guest links needs T3 Connect); Diagnostics beyond contrast and the sampling label; Open source licenses only at the top of its 437 rows.
- Mobile native Appearance (separate app, area 15) and the Material You paths.
- Pages General, Projects, Keybindings, Source Control, Storage, Scheduled tasks, Integrations, SnapShots, Providers, Connections, Archive are other areas' (the shell findings F-07-03 to F-07-12 still apply to them).

## Needs deeper look

1. Inspector labels: hovering the Settings nav row "Integrations" in Inspect mode reports "Accent" (`themeInspector.ts` heuristics) although the row's fill comes from the sidebar row-hover role. Audit `inspectThemeRoleAtElement` against ten sample surfaces (sidebar row hover/selected, composer, tool row, diff gutter) before the editor is marketed for recolouring.
2. Windows and Linux Inter (#24865): `resolveDefaultFamilyLabel` / `isFontFamilyAvailable("Inter Variable")` probe canvas metrics, which return "not available" until the lazy `@font-face` loads. The Interface font placeholder may show "Segoe UI" then "Inter Variable", and a user typing "Inter Variable" may be rejected as not installed (F-07-28). Needs a Windows/Linux check after merge.
3. Local-font permission: `TypographySettings.tsx:443-446` calls `discoverInstalledFonts()` on focus of the font input, which can raise the browser's "see fonts on your device" prompt as a side effect of tabbing through the page. Verify in headed Chrome, and decide whether it should wait for an explicit "Browse installed fonts" action.
4. Desktop prior art tagged to this area: issue #19119 (System appearance stays light on KDE Plasma Wayland), #10997 (desktop context menus do not inherit imported VS Code themes), #15954 (cycle appearance shortcut fails on macOS AZERTY), and #17233 (Advanced background activity "Setting not saved", which lives on General). None reproducible here.
5. Contrast slider interaction with named themes: measured at 50-200 only for the default theme; the T3 Chat dark `accent` on canvas is 2.16:1 (DNA section 2.5), so a lower slider may break more roles there.
6. Boot splash accent (`index.html:21-30`, `#4f46e5` / `#818cf8`) and the preview constants (F-07-18) share the indigo drift; whether to fix both together belongs with DRIFT-3.
7. The route-modal header is 48 px (`h-12`, `routes/_chat.settings.tsx:121`) while DNA-D3 fixes top bars at 52 px; decide whether the Settings header is exempt before a token pass.
