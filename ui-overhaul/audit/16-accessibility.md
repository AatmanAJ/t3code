# Audit 16: accessibility

Baseline: upstream `main` @ 5f64c5eb on `localhost:5733`, Chromium (Playwright) macOS. Tools: `@axe-core/playwright` (installed in `/tmp/t3code-pw` only), in-page WCAG luminance maths (canvas read-back, alpha composited over the effective background), CDP full AX tree, `locator.ariaSnapshot()`, real Tab traversal with focused-vs-blurred pixel diff. Numbers are measured unless marked "code-read". Screenshots: `ui-overhaul/screens/16-accessibility/` (focus rings on 14 control types x light/dark, forced-colors, selection, reflow, diff). Withheld: the New-thread project picker (lists other agents' `/tmp` fixture paths) and a pairing-page capture caused by a session reset mid-run (deleted, rerun). Cost: 2 agent turns in my own probe thread (Haiku 5.5, Supervised): both finished with no approval prompt, so the approval path is code-read only. The probe thread is un-pinned and un-settled; its terminal sessions were closed; one fixture pin I toggled by mistake ("Migrate tests...") was restored.

Already-reported wave-1 items are cited, not re-reported (table at the end). Findings below are new or are systemic roots. Tab-stop count re-measured: 418 tabbables on a thread (388 in the sidebar: 123 rows + 251 row actions), wave 1 saw 368.

## Findings

### F-16-01 Keyboard highlight in every popup list is an 8% fill (1.04 to 1.22:1)

- Severity: P1
- Surface: all
- Evidence: measured highlighted item vs neighbour, light/dark: command palette 1.08/1.07, model picker 1.08/1.09, Menu (`Git action options`) 1.09/1.09, Select (Runtime mode) 1.16/1.19, sidebar search results 1.04/1.22; outline `none` on all. `ui/menu.tsx:127,172,230,319` `data-highlighted:bg-accent`; `ui/command.tsx` `data-highlighted:bg-foreground/[0.09]`; `ui/select.tsx`, `ui/combobox.tsx`, `SidebarThreadRow.tsx:1593-1600` same. Palette and picker keep DOM focus in the input (aria-activedescendant), so the fill is the only marker of the active option.
- Current: A keyboard user cannot see which option Enter will pick unless they already know the fill.
- Proposed: add a keyboard-modality variant. In `main.tsx` set `document.documentElement.dataset.input = "keyboard"` on `keydown` (Tab, arrows) and `"pointer"` on `pointerdown`/`pointermove`; in `index.css` `@custom-variant kbd (html[data-input="keyboard"] &);`. Then in the five item classes add `kbd:data-highlighted:ring-2 kbd:data-highlighted:ring-inset kbd:data-highlighted:ring-ring` (ring 6.54:1 light, 4.26:1 dark; pointer hover stays quiet).
- DNA: DNA-C5, DNA-K10, DNA-K14, DNA-P4
- Effort: S
- Risk: item radius `rounded-sm` (6px) vs inset ring; no tests assert classes; menus use real focus so `focus-visible:` already works there (use it for Menu/Select, the variant only for combobox/autocomplete).
- Upstream-eligible: yes
- #24865: not addressed (`ui/menu.tsx` only changes a stroke width)

### F-16-02 In forced-colors (Windows High Contrast) keyboard focus is invisible on Buttons, Switches, Selects and theme cards

- Severity: P1
- Surface: web, desktop (Windows)
- Evidence: `forcedColors: "active"` Tab sweep: thread composer + details card 0 of 14 stops show any indicator; `/settings/appearance` 24 of 40 stops show none. Cause: `ui/button.tsx:9`, `ui/switch.tsx:13`, `ui/menu.tsx:185` use `outline-none` + `focus-visible:ring-*` (box-shadow, stripped in forced-colors); computed outline `none`. Only 6 `forced-colors:` rules exist in the repo (`index.css:542,615,628,1041`). Screens: `16-accessibility-forced-colors-focus-nofix-dark-300x120.png` vs `...-withfix-...png`, `...-forced-colors-thread-dark-1440x900.png`, `...-settings-appearance-light-1440x900.png`. Switch checked and unchecked compute identically (white, no border): `...-switches-general-light-1100x700.png`.
- Current: Windows high-contrast users have no focus cue on most controls (and see no switch state, F-07-16).
- Proposed: one rule in `index.css` (`@layer base`, after the `*` outline rule at :691): `@media (forced-colors: active) { :focus-visible { outline: 2px solid Highlight; outline-offset: 2px; } }`. Tested by injection: 13 of 14 composer-area stops gain an indicator (the 14th is F-16-07). Keep F-07-16/17 per-component fixes for state.
- DNA: DNA-C5, DNA-S3
- Effort: XS
- Risk: only inside the media query; Windows only; no test covers forced-colors.
- Upstream-eligible: yes
- #24865: not addressed

### F-16-03 Sidebar thread search shows no focus indicator

- Severity: P1
- Surface: all
- Evidence: `components/sidebar/SidebarThreadHeader.tsx:63-66` wrapper has hover fill only; focused vs blurred crop is pixel-identical in light and dark (`...-focus-sidebar-search-dark-focused.png` / `-unfocused.png`); computed outline `none`. 111x21 input, caret is the only cue.
- Current: Tab or click into Search and nothing changes except a thin caret.
- Proposed: on the wrapper add `has-focus-visible:ring-2 has-focus-visible:ring-inset has-focus-visible:ring-ring` (6.43:1 light, 4.52:1 dark on the sidebar scope); no layout change.
- DNA: DNA-C5, DNA-S3
- Effort: XS
- Risk: none; sidebar search tests are logic-only.
- Upstream-eligible: yes
- #24865: not addressed (file not in the diff)

### F-16-04 The branch picker combobox has no accessible name (axe `button-name`, critical)

- Severity: P1
- Surface: all
- Evidence: `BranchToolbarBranchSelector.tsx:705` `<ComboboxTrigger render={<ThreadDetailsControl .../>}>` has no `aria-label`; AX tree: `combobox: main` (value only). Fires on `/`, thread, terminal-open: 1 node each. A static scan of every icon-size `Button` found no other unnamed control; `WorktreeBaseBranchPicker.tsx:110` sets only `id`.
- Current: A screen reader announces "combobox, main" with no purpose.
- Proposed: `aria-label={`Branch, ${triggerLabel}`}` on both triggers (panel and composer modes).
- DNA: DNA-I4
- Effort: XS
- Risk: tests querying by role name "main"; none found.
- Upstream-eligible: yes
- #24865: not addressed (file touched for style only)

### F-16-05 Terminal output is a canvas with no accessible text

- Severity: P1
- Surface: web, desktop
- Evidence: after `Mod+J` focus lands in `textarea[aria-label="Terminal input"]` (good) and typing works; `document.body.innerText` never contains the output, 1 `<canvas>`, no `.xterm-accessibility` mirror, no live region. `terminal/ghostty/surface.ts`.
- Current: A screen-reader user can run commands but cannot read any result.
- Proposed: add a visually-hidden `role="log" aria-label="Terminal output" aria-live="off"` sibling after the input that mirrors the last 200 buffer lines (updated 250 ms after output goes idle). Area 06 owns it; gated on the ghostty buffer API exposing text.
- DNA: DNA-P8, non-negotiable 6
- Effort: L
- Risk: perf (DNA-P1): build the mirror lazily on first focus of the log, not per frame. No tests exist for the terminal surface.
- Upstream-eligible: no (new surface, needs maintainer approval)
- #24865: not addressed

### F-16-06 All 14 opacity steps on muted text fail 4.5:1; 175 sites use them (192 with sidebar-muted, secondary-label, placeholder)

- Severity: P1
- Surface: all
- Evidence: `text-muted-foreground/NN`, NN in 30,35,40,45,50,55,60,65,70,72,75,80,85,90 (counts 2,1,7,4,7,9,26,12,78,4,5,14,4,2). Light on `#fcfcfc`: 1.47, 1.58, 1.69, 1.82, 1.96, 2.11, 2.28, 2.48, 2.72, 2.79, 2.93, 3.24, 3.54, 3.88. Dark on `#0a0a0a`: 1.46, 1.58, 1.74, 1.89, 2.10, 2.29, 2.49, 2.76, 3.05, 3.14, 3.32, 3.61, 3.97, 4.30. Sweep of 12 surfaces (text and icons; includes disabled and image-backed artefacts): 32 failing styles / 481 elements light, 23 / 262 dark. `foreground/NN` is fine (65 = 4.75 light). Also `text-sidebar-muted-foreground` 5 steps, `text-secondary-label/70` x4, `text-placeholder/75`.
- Current: Wave 1 filed 12 per-site findings (F-02-01/02/03, F-03-25, F-04-03/21/31, F-07-37, F-09-11/23/28, F-05-19) for one root cause (DRIFT-1).
- Proposed: root fix = lint, not 156 edits: add oxlint rule `t3code/no-text-opacity-on-muted` rejecting `text-(muted-foreground|sidebar-muted-foreground|secondary-label|placeholder|icon-muted)/\d+`; codemod every hit to the bare token (light `#71717b` on `#fcfcfc` 4.71; dark `#818181` on `#0a0a0a` 5.08) and take hierarchy from size/weight (DNA-C4).
- DNA: DNA-C4, DNA-C5, DRIFT-1
- Effort: M
- Risk: UI gets slightly louder; visual-only, no tests; ship per area behind the wave-1 findings.
- Upstream-eligible: yes (lint + codemod in slices)
- #24865: partial (removes `/40` x3, `/60`, `/70` x3, `/80` x1 and `placeholder/75` x1 at its touched sites; the rest remain)

### F-16-07 The composer text box has no focus indicator

- Severity: P2
- Surface: all
- Evidence: `ComposerSurface.tsx` has no `focus` classes; surface crop focused vs blurred: 0 changed pixels dark, 11 (caret) light (`...-focus-composer-surface-dark-focused.png` / `-unfocused.png`). Textbox outline `none`.
- Current: Keyboard focus in the main input is shown only by the caret.
- Proposed: neutral, not blue (owner dropped the blue composer ring): the existing `::after` outline border (`ComposerSurface.tsx:38`) turns `var(--contrast-muted-foreground)` (4.71 light / 5.08 dark vs canvas) under `has-[:focus-visible]`.
- DNA: DNA-C5, DNA-K6, DNA-C2
- Effort: XS
- Risk: touches the owner's "neutral controls" call; keep it border-colour only.
- Upstream-eligible: no (`ComposerSurface.tsx` in #24865's set)
- #24865: conflicts (it explicitly does not carry the blue composer focus ring; this proposes a neutral one)

### F-16-08 17 focus rings use a reduced alpha: 2.62:1 in dark

- Severity: P2
- Surface: all
- Evidence: `focus-visible:ring-ring/70` at `collapsible-section-header.tsx:31`, `TimelineMinimap.tsx:163`, `V2LifecycleRow.tsx:496`, `TimelineSystemDivider.tsx:51`, `SnapShotAttachmentDetails.tsx:43`, `WorkLog.tsx:84`, `WorkflowOpeningBlock.tsx:141`, `ComposerPendingApprovalPanel.tsx:77`, `TimelineUserMessageRow.tsx:540`, `TimelineWorkGroupRows.tsx:275,373,507`, `MessagesTimeline.tsx:1389,1413`; `ring-ring/50` `calendar.tsx:57`; `ring-ring/24` `KeybindingsSettings.tsx:814`; `ring-primary/25` `ComposerPendingUserInputPanel.tsx:255`. Measured ring on canvas: "Worked for" row 3.54:1 light, 2.62:1 dark; Settled/Snoozed shelf headers 3.50 / 2.66 (full ring is 6.54 / 4.26). Crops: `...-focus-disclosure-row-dark-141x39.png`.
- Current: The shelves, work log, turn fold and approval detail have the dimmest ring in the app.
- Proposed: drop the `/NN` at all 17 sites.
- DNA: DNA-C5, DRIFT-17
- Effort: XS
- Risk: none
- Upstream-eligible: yes
- #24865: not addressed

### F-16-09 Inactive Settings nav labels are 14px at 3.19:1 (light) / 3.54:1 (dark)

- Severity: P2
- Surface: web, desktop
- Evidence: axe `color-contrast` on `/settings/*`: `#8c8c95` on `#fafafa` 3.19; `#6b6b6b` on `#111111` 3.54 (11 labels per page). `ui/sidebar.tsx:700` `default: "font-medium text-sidebar-muted-foreground/80"`. Settings description `/80` 3.23 (addressed by #24865, cited F-07).
- Current: The labels of the primary Settings navigation fail 4.5:1.
- Proposed: `ui/sidebar.tsx:700` -> `font-medium text-sidebar-muted-foreground` (4.62 light, 8.33 dark in the sidebar scope; settings uses root scope: 4.71 / 5.08).
- DNA: DNA-C4, DNA-C5
- Effort: XS
- Risk: `SidebarMenuButton` default variant is shared (footer, settings nav); both gain contrast.
- Upstream-eligible: yes
- #24865: not addressed

### F-16-10 Unchecked Switch and form-control borders are 1.46:1 (light) / 1.19:1 (dark)

- Severity: P2
- Surface: all
- Evidence: Switch off, light: track `#d4d4d8` vs `#fdfdfd` 1.46, thumb `#fcfcfc` vs track 1.44 (state is position only). Dark: track `#202020` 1.19, thumb `#818181` vs track 4.18 (passes via thumb). Select border 1.46 / 1.19. `ui/switch.tsx:13` `data-unchecked:bg-input`; `--input` `#d4d4d8` / white 8% (`index.css:1133,1191`). WCAG 1.4.11 (3:1).
- Current: A light-mode "off" switch is a pale pill with a pale knob.
- Proposed: `switch.tsx:13` `data-unchecked:bg-muted-foreground/80` (track 3.24:1, thumb 3.21:1 light; dark keeps `bg-input` because the thumb carries it). For selects/inputs keep the DNA-C3 hairline and let the Contrast setting reach 3:1 (F-16-11).
- DNA: DNA-C5, DNA-C3, DNA-K10
- Effort: XS
- Risk: blue switch accent untouched (owner call); off-state looks grey-heavier.
- Upstream-eligible: yes
- #24865: partial (dark `--input` 8%->11%: 1.18->1.29)

### F-16-11 The Contrast slider never lifts borders to 3:1, collapses hierarchy at 200, and skips ring, links, status, diff and primary

- Severity: P2
- Surface: web, desktop
- Evidence: measured 50..200: body/muted light 3.36/2.01 at 50, 14.52/4.71 at 100, 19.50/14.49 at 150, 20.47/20.47 at 200 (both `#000000`); dark 4.24/1.94, 18.16/5.08, 18.97/10.65, 19.80/19.80 (both `#ffffff`). Borders at 200: `border` 1.99 light / 2.42 dark, `input` 2.28 / 2.61. Unchanged at every value: ring (6.54/4.26), link `--info-foreground` (6.66/7.50), status fg, diff fg (light add 3.56), `primary-foreground` (6.71/4.65), shiki tokens. Formula `index.css:1538-1651` mixes the target colour by `boost`; border boost is `(c-100)/4` (`appearanceContrast.ts:8`). `color-contrast` axe count only drops from 8 to 7 (home light) at 150/200: the survivors are the unmapped tokens.
- Current: "Contrast" fixes grey text but not the controls it is meant for.
- Proposed: (1) border boost `(c-100)/2` so `--contrast-input` reaches ~3.1 at 200; (2) cap muted at body minus one step: `--contrast-muted-foreground` mixes towards target at `boost*0.6`; (3) route `--ring`, `--info-foreground`, `--*-foreground`, `--diff-*-foreground` through a `--contrast-accent` mix (target at `boost*0.5`). F-07-26 (min 50) stays separate.
- DNA: DNA-C9, DNA-K8
- Effort: M
- Risk: theme palettes (61 roles) read the same vars; verify the five named themes; no tests on the layer.
- Upstream-eligible: no (adds behaviour to a setting; needs maintainer approval)
- #24865: partial (baseline moves; slider range untouched)

### F-16-12 The app ignores `prefers-contrast` and has no forced-colors theme

- Severity: P2
- Surface: web, desktop
- Evidence: `grep prefers-contrast` over `apps/web` and `apps/desktop`: 0 hits. OS "Increase contrast" changes nothing; the slider defaults to 100.
- Current: Users who already asked their OS for more contrast get the lowest tier.
- Proposed: in `useTheme.ts` (the `applyAppearanceContrast` caller) when no stored contrast exists and `matchMedia("(prefers-contrast: more)").matches`, apply 150; follow changes live.
- DNA: DNA-C8, DNA-K8
- Effort: S
- Risk: boot script parity (`themeBoot.test.ts`) only covers theme keys, not contrast.
- Upstream-eligible: yes
- #24865: not addressed

### F-16-13 Reduced motion: overlay and micro-transitions keep moving

- Severity: P2
- Surface: all
- Evidence: `reducedMotion: "reduce"` census over thread, settings, palette, menu, tooltip, diff, picker (idle: 0 running animations, all keyframes gated). Still transitioning with a transform/size property: `command-dialog-popup` scale+translate 200 ms, `dialog-backdrop` all 200 ms, route modal scale 150 ms, `popover-popup`/`tooltip-popup` scale 150 ms, `switch-thumb` translate 150 ms, theme orbs transform, button `active:scale` 150 ms (x58 `tooltip-trigger` buttons), chevron rotate 150 ms, panel `top` 200 ms; toast 500 ms (F-12-16). Scroll animation is gated (8 `matchMedia` sites).
- Current: Coverage is per-component (F-12-16, F-01-31, F-04-19) and misses most Base UI overlays.
- Proposed: mirror the existing `.no-transitions` kill switch (`index.css:1086-1092`): `@media (prefers-reduced-motion: reduce) { *, ::before, ::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; animation-iteration-count: 1 !important; scroll-behavior: auto !important; } }`. Supersedes the three per-component fixes.
- DNA: DNA-M5
- Effort: XS
- Risk: Base UI waits on `getAnimations()`, 0.01 ms is safe; `.preview-loading-progress` already forces `scaleX(.9)`.
- Upstream-eligible: yes
- #24865: not addressed

### F-16-14 Pointer targets under 24x24 CSS px: 11 controls fail WCAG 2.5.8, 40 more pass only by spacing

- Severity: P2
- Surface: web, desktop
- Evidence: full-size scan with the spacing exception. FAIL: sidebar `Snooze thread` 24x20 and `Settle thread` 63x20 (x123 rows), `Search threads` 111x21, `Resize Sidebar` 16x900, right-panel `Close Diff` 16x16, tab `Diff` 20x16, terminal toolbar Split H/V, New, Close 21-22x21, providers `Update available` 20x20. Pass by spacing only: 18 inheritance markers 20x20, 6 theme-name buttons x20, 8 `Edit when clause` x20, 30x18 switches, `Close Browser`/`Close Terminal` 16x16. Cause: `button.tsx` `icon-micro` (20px) and `icon-tiny` (16px) get the 44px hit area only under `pointer-coarse:after:min-h-11`.
- Current: Fine-pointer hit areas are the glyph box.
- Proposed: in `button.tsx:9` change `pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11` to also set `after:absolute after:size-full after:min-h-6 after:min-w-6` for all pointers (keeps 44 on coarse).
- DNA: DNA-D4, DNA-K10
- Effort: XS
- Risk: overlapping hit areas in dense rows (row actions 24px high in a 78px row is safe); visual unchanged.
- Upstream-eligible: yes
- #24865: not addressed (F-02-24 cites the same row actions)

### F-16-15 Command palette and model picker: unlabeled listbox/dialog, combobox without `aria-expanded`, shortcuts baked into option names

- Severity: P2
- Surface: all
- Evidence: palette AX: `dialog "Command palette"` ok; `combobox "Search commands..."` (name from placeholder) with no `aria-expanded` (axe `aria-required-attr`, critical, all 6 palette runs); `listbox` unnamed; group headings "Actions" and "Recent Threads" are plain `text`, 0 `role=group`; option names include glyphs (`New thread in sample-app ⇧⌘N`, `Open usage ⌘U`); `scrollable-region-focusable` (advisory: arrows scroll it). Model picker: `dialog` has no name, options contain a nested `button "Add to favorites"`, empty `status`. `ui/command.tsx` `CommandInput`/`Command` pass `open` always.
- Current: Screen readers lose group context and hear shortcut glyphs as part of each name.
- Proposed: `CommandInput` -> `aria-label="Search commands, projects, and threads"` and `aria-expanded`; `CommandList` -> `aria-label="Results"`; render group headings via `AutocompleteGroup`+`GroupLabel` so Base UI sets `role=group aria-labelledby`; move `CommandShortcut` out of the option name with `aria-hidden` on the glyphs and `aria-keyshortcuts` on the option. Model picker popup -> `aria-label="Choose model"`.
- DNA: DNA-K14, DNA-I4
- Effort: S
- Risk: `CommandPalette*.test.tsx` query options by name incl. shortcuts; update them.
- Upstream-eligible: yes
- #24865: not addressed

### F-16-16 Right-panel tabs are not tabs, and opening the diff by shortcut leaves focus in the composer (11 Tabs to reach it)

- Severity: P2
- Surface: all
- Evidence: `RightPanelTabs.tsx:920-945` tab = `div` with dnd listeners + inner buttons; active state only `bg-accent text-foreground` vs `text-muted-foreground`; no `role=tablist|tab|tabpanel`, no `aria-selected`/`aria-current`. `Mod+D`: focus stays in the composer; 11 Tab presses to `Close Diff`; Esc inside the panel does nothing; `Mod+D` closes and focus lands on `Toggle right panel`. Contrast: `Mod+J` already moves focus into the terminal input.
- Current: The panel strip is announced as unrelated buttons; the panel is silent when it opens.
- Proposed: strip `role="tablist" aria-orientation="horizontal"`, each tab's main button `role="tab" aria-selected={active}`; panel body `role="tabpanel" aria-labelledby`. On keyboard open (`diff.toggle`, `rightPanel.toggle`, `preview.toggle`) focus the active tab.
- DNA: DNA-K14, DNA-L8
- Effort: M
- Risk: dnd-kit sortable listeners on the same node; add a browser test for open + focus.
- Upstream-eligible: no (focus-moving behaviour change)
- #24865: not addressed

### F-16-17 The document title never changes, and thread, diff and terminal views have no `h1`

- Severity: P2
- Surface: web
- Evidence: `document.title` is `T3 Code (Dev)` on all 12 routes (only `GuestPage.tsx:242` sets it); `routes/__root.tsx:137` static meta. axe `page-has-heading-one` on thread/diff/terminal/home; thread outline is `h2` title > `h3` author headings; Settings: `h2` sections / `h3` rows with no `h1` (dialog name only). `/usage`, `/pull-requests`, `/welcome` have `h1`. WCAG 2.4.2.
- Current: Browser tab, history and screen-reader page-change cues are identical everywhere.
- Proposed: `useEffect` in the thread route + settings modal sets `document.title = `${title} - T3 Code``; breadcrumb title element `h2` -> `h1` (same classes); one `sr-only` `h1` per settings page from the breadcrumb leaf.
- DNA: DNA-P8
- Effort: S
- Risk: Electron window title is pinned separately (F-14-30); keep it.
- Upstream-eligible: yes
- #24865: not addressed

### F-16-18 Label-in-name mismatches on 4 control families (axe `label-content-name-mismatch`, 12 on a thread)

- Severity: P2
- Surface: all
- Evidence: logo link `SidebarChrome.tsx:106` `aria-label="Go to threads"` vs visible "T3 Code" (and it opens a draft: F-01-18, #24203); thread rows name "Title, project" vs visible time/branch/status (11 in view; `Sidebar.logic.ts:53-62`); Keybindings `Edit when clause` popover triggers (7); Usage limit buttons `Codex: 91% left, ...` (4); provider `Toggle account email visibility` (visible text is the email).
- Current: Voice-control users saying the visible text ("42m", "T3 Code") get no match.
- Proposed: logo `aria-label="T3 Code, new thread"` (starts with visible text per #24209's WCAG 2.5.3 argument, says what the click does per DNA-P3); rows append `, ${relativeTime}` and `, ${branch}` inside `resolveSidebarRowAccessibility`; the others start their label with the visible string.
- DNA: DNA-P3, DNA-I4
- Effort: S
- Risk: `Sidebar.logic.test.ts` asserts label strings.
- Upstream-eligible: yes (logo alone matches #24209)
- #24865: not addressed

### F-16-19 Three one-line axe residuals: language badge, duplicate landmark, ToggleGroup attribute

- Severity: P3
- Surface: all
- Evidence: (a) `MarkdownCodeBlock.tsx:120` `<span aria-label="Language: json">` has no role (`aria-prohibited-attr`, serious); (b) `ui/toast.tsx:540` and `:683` both render a `region` named "Notifications" (`landmark-unique`, 12/12 surfaces); (c) `ui/toggle-group.tsx:44` Base UI emits `aria-orientation` on `role=group` (`aria-allowed-attr`, critical by axe; Diff layout, Usage metric/period).
- Current: Noise in every automated scan.
- Proposed: (a) add `role="img"`; (b) `aria-label="Anchored notifications"` on the second viewport; (c) `role="toolbar"` on the group (valid with `aria-orientation`, and the group already behaves as one).
- DNA: DNA-P4
- Effort: XS
- Risk: (c) changes announced role for 3 groups.
- Upstream-eligible: yes
- #24865: not addressed

### F-16-20 #24865 side effect: user-bubble label drops to 4.05:1 (light) and the bubble stays 1.16:1 against the canvas

- Severity: P2
- Surface: all
- Evidence: end state emulated by injecting the diff's token values: `--message-surface` light becomes `mix(zinc-200 55%, zinc-100)`; `text-muted-foreground` (`#71717b`) label "Agent" 14px: 4.39 -> 4.05; bubble vs canvas 1.07 -> 1.16 (dark unchanged 1.07, F-03-27).
- Current: The darker bubble helps the shape, not the contrast of the small label inside.
- Proposed: label uses `text-foreground/70` (6.49:1 end-state light) instead of `text-muted-foreground`; do not add a border to the bubble.
- DNA: DNA-C4, DNA-C5
- Effort: XS
- Risk: lands only after #24865 merges.
- Upstream-eligible: no (follow-up to #24865)
- #24865: conflicts (it introduces the drop)

### F-16-21 Approval: no shortcut, no focus move, and the banner sits before the composer in tab order (code-read)

- Severity: P2
- Surface: all
- Evidence: not reproduced live (both probe turns finished without a prompt). `ComposerPendingApprovalPanel.tsx:47-82` `role="group"`, focusable detail `tabIndex=0`; `ComposerPendingApprovalActions.tsx:54-92` Decline / Approve (`xs`, 24px) and `More approval options`; no `keybindings` entry mentions approval; screenshot `03-approval-pending-dark-1440x900.png` shows the banner above the composer. Announcement exists: `threadActivityAnnouncement.ts` says "Needs approval" (live, polite).
- Current: A keyboard user hears "Needs approval", stays in the composer and must Shift+Tab backwards through the banner.
- Proposed: on a new approval, move focus to the Approve button when the composer is empty and focused (otherwise leave it); add `thread.approve` / `thread.decline` to `DEFAULT_KEYBINDINGS` (unbound by default, shown in Keybindings) .
- DNA: DNA-P8, DNA-K14
- Effort: S
- Risk: focus theft while typing (guard on empty composer); verify with a real turn.
- Upstream-eligible: no (new keybinding commands)
- #24865: not addressed

## Edge-case results (matrix)

| Row                                               | Result                                                                                                                                                                                                                                                                      |
| ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data: empty / one / 100+ / 10,000+                | 123 rows, 388 sidebar tab stops (F-02-06); 10k NOT TESTED (no fixture)                                                                                                                                                                                                      |
| Data: long names, unicode, RTL, whitespace        | cited F-02-08/19, F-12-39; not re-tested                                                                                                                                                                                                                                    |
| Content: tables, links, code, images              | links FAIL (F-03-19); code language badge FAIL (F-16-19); tables NOT TESTED                                                                                                                                                                                                 |
| Content: 5k diff / 200 files                      | NOT TESTED (area 05)                                                                                                                                                                                                                                                        |
| Network: stream stall/cancel, 6 streams           | N/A (no new probes); one stream: announced "Working" at 0.9 s and "Done" at 3.5 s                                                                                                                                                                                           |
| Network: permission prompt mid-stream             | code-read only (F-16-21)                                                                                                                                                                                                                                                    |
| Viewport 1440x900 / 1280x720 / 1024x640 / 800x600 | PASS for 1440x900; others via zoom rows                                                                                                                                                                                                                                     |
| Viewport 390x844, 320x568, 720x450 (200%)         | no horizontal scroll at any (scrollWidth == clientWidth); 320: header truncates title to "A..." and crumb to "sample-a..." (`...-reflow-thread-reflow320-light-320x568.png`), model chip "GPT-5.6-T..." (F-04-22); 200% flips Settings to the unlabeled icon rail (F-07-06) |
| Zoom 80/125/150%                                  | NOT TESTED (200% and 320 only)                                                                                                                                                                                                                                              |
| Preferences: light/dark/system                    | axe + sweeps in both                                                                                                                                                                                                                                                        |
| Preferences: five named themes                    | token table below; ring on canvas 3.71 (T3 Chat dark) to 8.52                                                                                                                                                                                                               |
| Reduced motion                                    | F-16-13                                                                                                                                                                                                                                                                     |
| High contrast (forced-colors)                     | F-16-02                                                                                                                                                                                                                                                                     |
| Keyboard only                                     | 9 of 10 tasks verified live; approval code-read                                                                                                                                                                                                                             |
| Screen reader on                                  | no real AT on this host; AX tree + live-region logs only                                                                                                                                                                                                                    |
| Git / lifecycle rows                              | N/A (not accessibility specific)                                                                                                                                                                                                                                            |

## axe-core results (12 surfaces x light/dark; first three also at Contrast 150 and 200)

Unique rules at default contrast: critical 3 (`button-name`, `aria-required-attr`, `aria-allowed-attr`), serious 5 (`color-contrast`, `label-content-name-mismatch`, `nested-interactive`, `aria-prohibited-attr`, `scrollable-region-focusable`), moderate 2 (`landmark-unique`, `page-has-heading-one`), minor 0. Rule x surface instances over the 24 default runs: critical 12, serious 50, moderate 32 (nodes: 14 / 1,569 / 32; 1,230 of the serious nodes are the same 123 thread rows repeated across 5 surfaces x 2 schemes). Cells are light / dark node counts (one number when equal).

| Rule                            | home  | thread | palette | diff   | terminal | general | appearance | keybindings | providers | welcome | prs | usage |
| ------------------------------- | ----- | ------ | ------- | ------ | -------- | ------- | ---------- | ----------- | --------- | ------- | --- | ----- |
| `aria-allowed-attr` (critical)  | -     | -      | -       | 1      | -        | -       | -          | -           | -         | -       | -   | 2     |
| `aria-required-attr` (critical) | -     | -      | 1       | -      | -        | -       | -          | -           | -         | -       | -   | -     |
| `button-name` (critical)        | 1     | 1      | -       | -      | 1        | -       | -          | -           | -         | -       | -   | -     |
| `aria-prohibited-attr`          | 1     | -      | -       | -      | -        | -       | -          | -           | -         | -       | -   | -     |
| `color-contrast`                | 8 / 0 | 11 / 2 | 5 / 1   | 13 / 2 | 11 / 2   | 19      | 13         | 18          | 15        | -       | -   | 2 / 0 |
| `label-content-name-mismatch`   | 12    | 12     | -       | 12     | 12       | -       | -          | 7           | 1         | 3       | 11  | 4     |
| `nested-interactive`            | 123   | 123    | -       | 123    | 123      | -       | -          | -           | -         | -       | 123 | -     |
| `scrollable-region-focusable`   | -     | -      | 1       | -      | -        | -       | -          | -           | -         | -       | -   | -     |
| `landmark-unique`               | 1     | 1      | 1       | 1      | 1        | 1       | 1          | 1           | 1         | 1       | 1   | 1     |
| `page-has-heading-one`          | 1     | 1      | -       | 1      | 1        | -       | -          | -           | -         | -       | -   | -     |

Representative selectors: `button-name` `button[role=combobox][data-slot=combobox-trigger]` in `section[aria-label="Version Control"]`; `nested-interactive` `div[role=button][data-testid=sidebar-row-card]` (F-02-07); `color-contrast` `.max-w-1\/2.text-muted-foreground` ("Agent" label), `.text-diff-addition` (+20), `span.max-md:sr-only` (settings nav, F-16-09), `text-xs text-muted-foreground/80` (settings help), `.text-3xs text-muted-foreground/45` (Diagnostics). Contrast raised: `color-contrast` home light 8 -> 7 -> 7 (c100/c150/c200), thread light 11 -> 8 -> 8, thread dark 2 -> 0, palette 5 -> 0: the survivors are tokens the layer does not touch (F-16-11). Every other count is identical at 150 and 200.

## Contrast table (WCAG 2.x; measured from live tokens, computed colours composited on the real background)

Floors: text 4.5 (large/bold 3), UI and focus 3.

Default theme, canvas `#fcfcfc` / `#0a0a0a` (light / dark):

| Pair                                                                                                     | Light                                    | Dark                         | Floor                                        |
| -------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---------------------------- | -------------------------------------------- |
| body `#27272a` / `#f5f5f5`                                                                               | 14.52                                    | 18.16                        | pass                                         |
| muted / placeholder / secondary-label / icon-muted (same hex `#71717b` / `#818181`)                      | 4.71                                     | 5.08                         | pass (only at 100%)                          |
| muted on card / on `--muted` / on accent                                                                 | 4.83 / 4.62 / 4.39                       | 4.85 / 4.82 / 4.7            | accent fails light                           |
| muted at /30../90                                                                                        | 1.47 .. 3.88                             | 1.46 .. 4.30                 | all fail (F-16-06)                           |
| sidebar scope text / muted / secondary-label                                                             | 14.27 / 4.62 / 4.62                      | 18.90 / 8.33 / 5.39          | pass                                         |
| sidebar read title today (`secondary-label`)                                                             | 4.62                                     | 5.39                         | pass                                         |
| sidebar read title #24865 (`foreground/75`)                                                              | 7.62 (6.42 on current zinc-800)          | 10.36                        | pass                                         |
| sidebar settled row (`/70`)                                                                              | 2.69                                     | 3.09 (3.55 end state)        | fail (F-02-01)                               |
| sidebar branch `/40`, shelf header `/60`, icon colour 60% -> 85%                                         | 1.68, 2.27, 2.27 -> 3.47                 | 2.06, 3.44, 3.44 -> 6.16     | fail; #24865 fixes all three                 |
| chat prose 80% -> 90% (#24865, zinc-900)                                                                 | 7.66 -> 13.08                            | 11.59 -> 14.71               | pass                                         |
| success / warning / error / info foreground on canvas                                                    | 5.23 / 4.90 / 6.26 / 6.66                | 10.21 / 11.49 / 6.85 / 7.50  | pass                                         |
| same on own 8%/16% surface                                                                               | 4.82 / 4.60 / 5.61 / 6.08                | 8.29 / 9.04 / 5.89 / 6.40    | pass (warning 4.60 tight)                    |
| status base colours as text (`#00bc7d`, `#fe9a00`, `#fb2c36`, `#2b7fff`)                                 | 2.41 / 2.08 / 3.71 / 3.67                | 8.00 / 9.27 / 5.62 / 5.26    | light fails (F-03-10, F-04-41)               |
| diff add / remove foreground (`#009966`/`#e7000b` today; #24865 `#007a55`/`#c10007`)                     | 3.56 / 4.65 -> 5.23 / 6.26               | 10.21 / 6.85                 | add fails light today                        |
| diff base `text-diff-addition` / `-deletion` as text                                                     | 2.41 / 3.71                              | 8.00 / 5.62                  | F-05-16                                      |
| diff gutter numbers on added row (`#18a46c` / `#07c480`)                                                 | 2.97                                     | 8.01                         | F-05-18                                      |
| diff syntax tokens light: `#08c0ef` 1.98, `#1ca1c7` 2.79, `#d47628` 3.02, `#199f43` 3.19, `#d5512f` 3.85 | 1.98 .. 3.85                             | punctuation `#636363` 3.05   | F-05-18                                      |
| "N unmodified lines" `#929293` / `#7f8080`                                                               | 2.88                                     | 4.77                         | light fails                                  |
| link `--info-foreground` on canvas / vs body text                                                        | 6.66 / 2.18 (1.15 vs 80% prose, F-03-19) | 7.50 / 2.42                  | no underline: 1.4.1 fail                     |
| code block text on `--muted` / kbd on `--muted`                                                          | 14.27 / 4.62                             | 17.23 / 4.82                 | pass                                         |
| palette kbd hint `secondary-label` on highlighted row                                                    | 4.39                                     | n/a                          | fail                                         |
| `primary-foreground` on `primary` / `primary` as text                                                    | 6.71 / 6.54                              | 4.65 / 4.26                  | `text-primary` fails dark (welcome "1" 3.73) |
| destructive button white on `#fb2c36` / `#fb414a`                                                        | 3.81                                     | 3.53                         | F-12-04                                      |
| selection (browser default) bg `#b2d6fd` / `#345171`, text on it                                         | 9.88                                     | 7.52                         | pass; no `::selection` rule anywhere         |
| focus ring `--ring` on canvas / card / sidebar                                                           | 6.54 / 6.71 / 6.43                       | 4.26 / 4.06 / 4.52           | pass; the 17 `/70` sites: 3.54 / 2.62        |
| `border` / `input` on canvas                                                                             | 1.24 / 1.44                              | 1.12 / 1.18 (1.29 end state) | decorative; inputs and switch fail (F-16-10) |
| user bubble label / bubble vs canvas                                                                     | 4.39 -> 4.05 / 1.07 -> 1.16              | 4.74 -> 7.15 / 1.07          | F-16-20, F-03-27                             |
| placeholder (`/75`) composer                                                                             | 2.93                                     | 3.32                         | F-04-03                                      |

Named themes (light / dark): body, muted, placeholder, sidebar text, sidebar secondary-label, link, ring on canvas, warning fg on its surface, `steps /70`.

| Theme   | body          | muted        | placeholder | sb text       | sb sec-label | read title 75% | link        | ring        | /70 step    |
| ------- | ------------- | ------------ | ----------- | ------------- | ------------ | -------------- | ----------- | ----------- | ----------- |
| T3 Chat | 12.44 / 16.12 | 8.47 / 11.75 | 4.81 / 5.37 | 7.55 / 17.00  | 5.49 / 12.87 | 5.45 / 10.15   | 6.47 / 6.46 | 4.36 / 3.71 | 4.41 / 6.41 |
| Grove   | 16.10 / 14.85 | 4.96 / 6.08  | 4.90 / 6.63 | 14.51 / 12.52 | 4.23 / 4.26  | 6.94 / 7.80    | 6.32 / 5.80 | 4.74 / 8.52 | 2.80 / 3.75 |
| Ocean   | 16.20 / 15.80 | 5.01 / 5.90  | 4.93 / 6.58 | 14.57 / 13.64 | 4.24 / 4.36  | 6.95 / 8.36    | 6.36 / 6.17 | 4.76 / 7.65 | 2.82 / 3.64 |
| Ember   | 16.29 / 15.73 | 4.97 / 5.87  | 4.93 / 6.57 | 14.68 / 13.60 | 4.25 / 4.38  | 6.97 / 8.35    | 6.39 / 6.14 | 4.76 / 7.35 | 2.81 / 3.59 |
| Iris    | 16.30 / 16.65 | 4.98 / 5.56  | 4.92 / 6.53 | 14.65 / 14.95 | 4.23 / 4.56  | 6.97 / 9.01    | 6.40 / 6.50 | 5.38 / 5.44 | 2.81 / 3.41 |

Themed notes: sidebar secondary-label (project name, time) is 4.23-4.38 in Grove/Ocean/Ember/Iris (just under 4.5; 12px) and Grove/Ocean/Ember/Iris `/70` stays 2.8-3.8; T3 Chat dark ring on card 3.33 and `text-primary` 2.16 (accent is a fill); `destructive` button is 3.81 / 3.53 in every theme except T3 Chat (4.03 / 7.88). These deviate slightly from DNA 2.5 (live probe on `--background`; code wins).

## Focus order and rings (thread: 430 real Tab stops, dark; light 430; settings: 60)

Order: brand link, Search, project filter, Add project, New thread, then 123 rows x (row, Unpin if pinned, Snooze, Settle) = 374 stops, `Snoozed (3)`, `Settled (10)`, footer Settings / Pull Requests / Usage / Update, then (main) `Toggle thread details`, `Toggle terminal drawer`, `Toggle right panel`, breadcrumb project, `Thread actions`, user message, `Worked for`, links, `Expand all folders`, `Open diff`, file groups, message actions, composer (model, effort, runtime mode, attach), details card (editor, script, branch, commit, changes), and `Toggle main sidebar` last (F-01-28). Wrap: after the last stop focus leaves the document; the next Tab returns to the composer, not the brand link. Not in tab order: `Resize Sidebar` (`tabIndex=-1`), right-panel handle (separator without tabindex): F-01-09. Traps: none found (palette, model picker and Settings are modal and return focus: composer for palette/picker, body for Settings, F-01-06 confirmed). Skip link: absent (F-01-28). Hover-only controls (message copy/fork, row actions) are reachable and appear on focus.

Ring presence and contrast per control type (focused vs blurred crop, `...-focus-<type>-<theme>-<WxH>.png`; light / dark max pixel contrast of the ring against what it covers):

| Control                                                        | Ring                             | Light / dark      | Verdict                                       |
| -------------------------------------------------------------- | -------------------------------- | ----------------- | --------------------------------------------- |
| icon button (`Attach files`)                                   | `ring-2 ring-inset` + 1px offset | 6.68 / 4.09       | pass                                          |
| split button, select, panel toggle, footer update              | same                             | 6.5-6.7 / 4.1-4.3 | pass                                          |
| thread row                                                     | `ring-2 ring-inset`              | 6.43 / 4.46       | pass                                          |
| row actions Snooze/Settle                                      | UA `outline: auto`               | 4.62 / 8.27       | pass (Chrome only; Firefox/Safari NOT TESTED) |
| switch                                                         | `ring-2` + offset                | 4.56 / 3.49       | pass                                          |
| theme card, settings nav, segmented tile                       | ring / 2px outline               | 6.4-6.7 / 4.1-4.2 | pass                                          |
| markdown file chip/link                                        | `outline-2` foreground           | 12.8 / 16.4       | pass                                          |
| disclosure row, shelf headers                                  | `ring-ring/70`                   | 3.54 / 2.62       | fail dark (F-16-08)                           |
| sidebar search                                                 | none                             | 0                 | fail (F-16-03)                                |
| composer textbox                                               | none                             | 0                 | fail (F-16-07)                                |
| list/menu items                                                | fill only                        | 1.04-1.22         | fail (F-16-01)                                |
| resize handles                                                 | not focusable                    | n/a               | F-01-09                                       |
| ConnectionStatusDot, Usage model rows, mobile collapsed prompt | none (code-read)                 | n/a               | fix with F-16-08 pass                         |

## Keyboard-only top 10 (real key events; Mod = Cmd on this host)

| #   | Task                 | Steps                                                                                                                                                                                                                                                           | Result                                                                                               |
| --- | -------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 1   | New thread           | `Mod+N` -> project picker (sample-app highlighted) -> `Enter` -> `/draft/<id>`, focus in composer                                                                                                                                                               | PASS                                                                                                 |
| 2   | Type and send        | type, `Enter`; live region says "Working" at 0.9 s and "Done" at 3.5 s; focus stays in composer                                                                                                                                                                 | PASS (answer text is not announced, by design)                                                       |
| 3   | Switch thread        | `Mod+Shift+]` / `[`, or `Mod+K` type name `Enter`; focus lands in the new thread's composer, whose name is "Message <title>" (announces the thread)                                                                                                             | PASS                                                                                                 |
| 4   | Settings + theme     | no web shortcut (F-07-10): `Mod+K` "open settings" `Enter`, 3 Tabs to Appearance `Enter`, 23 more Tabs to a theme name `Enter` (theme applies); or `Mod+Alt+A` list + arrows + `Enter`                                                                          | PASS (27 Tabs; first `Esc` only dismisses the tooltip, second closes; focus ends on `body`, F-01-06) |
| 5   | Diff open/close      | `Mod+D`; focus stays in composer; 11 Tabs to `Close Diff`; `Esc` inside does nothing; `Mod+D` closes, focus on `Toggle right panel`                                                                                                                             | PASS with friction (F-16-16)                                                                         |
| 6   | Approve a permission | code-read: banner is before the composer; no shortcut                                                                                                                                                                                                           | NOT VERIFIED live (F-16-21)                                                                          |
| 7   | Palette command      | `Mod+K`, "change theme", `Enter`, arrows, `Enter`; focus returns to composer                                                                                                                                                                                    | PASS                                                                                                 |
| 8   | Pin then settle      | `Mod+Shift+P` announces "Unpinned 1 thread, Cmd+Z to undo"; `Mod+Shift+S` announces "Settled 1 thread, Cmd+Z to undo", opens the next thread; `Mod+Z` restores (works with focus in the composer); a pinned thread is not settled (the shortcut only navigates) | PASS                                                                                                 |
| 9   | Terminal             | `Mod+J` focuses `Terminal input`; typing works; output unreadable (F-16-05); `Mod+W` opens an alertdialog "Close terminal..." focused on Cancel, Tab to Confirm                                                                                                 | PASS for input, FAIL for output                                                                      |
| 10  | Model picker         | `Mod+Shift+M`, type "haiku", `Enter`; focus returns to composer                                                                                                                                                                                                 | PASS                                                                                                 |

Also: Runtime mode via `Mod+Shift+A` opens the listbox (`Home`, `Enter`); choosing returns focus to the composer, not the control (P3, noted).

## Screen-reader sanity (AX tree)

Sidebar: `navigation "Threads"` (div role), `link "Go to threads"` > `img "T3"`, `combobox "Search threads"`, 123 `button "Title, project"` each with nested buttons; no list semantics. Message: `heading "You" [3]`, `paragraph`, `button "Edit from here"`, `heading "T3 Code" [3]` (sr-only author), `link "greet.js"`, `group "20 additions, 0 deletions"`, `button "Open diff"`; long user messages collapse to `button [expanded=false] "Agent <full text>"`. Composer: `textbox "Message <thread title>"` (placeholder is a sibling `text`, not the description), `button "Claude Haiku 5.5"`, `combobox "Runtime mode": Supervised`, `button "Submit message" [disabled]`; the branch combobox is unnamed (F-16-04). Settings row: `heading "Contrast" [3]`, `paragraph`, `status: 100%`, `slider "Contrast": "100"`; switch rows `switch "<label>" [checked]`; inheritance marker `button "Built-in default. Show where this value comes from"` x18 on General (identical names). Landmarks: `navigation Threads`, `main`, `nav Thread breadcrumb`, `complementary Thread details`, `region Workspace`, `region Version Control`, 2x `region Notifications`; Settings `dialog Settings` > `navigation "Settings sections"`.

Live regions: `ThreadActivityAnnouncer` ("Working", "Needs approval", "Needs your input", "Done", "Failed", "Stopped"), `BackgroundThreadAnnouncer` (other threads), pin/settle/undo messages, toasts (`region` polite, no `priority: high`, F-12-17). Not announced: streamed text, "Working for Ns" ticks (good), panel open/close.

## Reflow, zoom, forced-colors, reduced motion, targets

Reflow at 720x450 (200%), 390x844, 320x568: thread, Settings, draft: `scrollWidth == clientWidth` in all nine (no horizontal scroll). Defects are loss of information (320: title "A...", model "GPT-5.6-T...", F-04-22; 200%: Settings icon rail, F-07-06). Forced-colors: F-16-02, F-07-16/17, F-02-25, F-03-28; the thread screenshot shows the selected row and user bubble unmarked. Reduced motion: F-16-13. Targets: F-16-14.

## Consolidated wave-1 accessibility findings (verified or re-measured here; not re-reported)

| ID                                                                                                                  | Sev   | Re-check                                                                    |
| ------------------------------------------------------------------------------------------------------------------- | ----- | --------------------------------------------------------------------------- |
| F-02-01 settled rows                                                                                                | P1    | 2.69 / 3.09 confirmed                                                       |
| F-02-04/05/06/07 touch actions, context menu, 368 stops, nested buttons                                             | P1    | 388 stops now; axe `nested-interactive` 123                                 |
| F-02-23/24/25 pin glyph, 20px actions, forced-colors row                                                            | P2    | 24x20 / 63x20 confirmed                                                     |
| F-01-06 focus after Settings, F-01-09 resize handles, F-01-18 logo name, F-01-28 toggle order, F-01-31 modal motion | P2-P3 | confirmed live                                                              |
| F-03-10/19/22/25/27/28/29/41                                                                                        | P1-P2 | ratios reproduced (3.56/2.41/2.08)                                          |
| F-04-03/20/21/22/41                                                                                                 | P2-P1 | 2.93 / 3.32, 2.73 / 3.05 confirmed                                          |
| F-05-05/14/16/18/19                                                                                                 | P2    | diff colours reproduced                                                     |
| F-07-03/04/06/07/16/17/21/26/27/37                                                                                  | P1-P2 | switches identical in forced-colors (measured); Contrast at 50: 3.36 / 2.01 |
| F-09-02/11/23/28                                                                                                    | P1-P2 | cited                                                                       |
| F-12-04/16/17/26                                                                                                    | P2-P3 | 3.81 / 3.53 confirmed; 12-17 `priority` unset                               |
| F-14-13 hold-to-quit overlay unannounced                                                                            | P2    | cited (not re-tested)                                                       |

## Already good (do not touch)

- 0 unnamed icon buttons beyond F-16-04: every `icon-*` `Button` has a label (static scan of all `.tsx` plus AX tree on 8 routes); close buttons carry `aria-label="Close"`.
- Live-region design: two sr-only announcers plus pin/settle messages with an undo hint; announcers wait for focus to settle (`lib/announce.ts`); thread switching is audible through the composer name.
- Settings rows: `h2` section / `h3` row title / description / control with a name; Switch and Slider are native-grade.
- Terminal input is focused on open and `Mod+W` uses an `alertdialog` focused on Cancel.
- Tooltips open on keyboard focus (thread-row details too); `aria-current="page"` on the active row; `aria-expanded` on collapsed message pills and shelf headers.
- Reflow: no horizontal scroll at 320 / 390 / 720; keyframes all have reduced-motion gates; scrolling honours `prefers-reduced-motion`.
- Focus rings on `Button`, `Switch`, thread rows, theme cards and chips are 4.1-6.7:1.
- Muted text in the default and four named palettes is tuned to 4.7 (light) / 5.08 (dark) at 100% (DNA-K9).

## Incomplete

- No real screen reader, no Firefox/WebKit (UA `outline: auto` colour, forced-colors), no Windows high-contrast, no 80/125/150% zoom, no text-spacing (1.4.12) override test.
- Approval prompt not produced: both probe turns completed without one (Haiku auto-allowed `ls` in Supervised mode); keyboard path is code-read.
- 10,000-thread list, 1 MB message and 5k-line diff NOT TESTED here (cited from 02/03/05).
- Contrast of text over the sidebar artwork image, glass blur and canvas grain not measurable (background-image excluded; wordmark "Code" at white/70 measured 1.03:1 only as an artefact).
- Mobile VoiceOver/TalkBack is area 15.

## Needs deeper look

- Area 06: terminal accessible mirror (F-16-05) and `Close Terminal` 21x21 toolbar.
- Area 14/15: screen-reader behaviour of the hold-to-quit overlay and Electron native menus.
- Area 12: `Alert` default role (F-12-26) interacts with F-16-19.
- Area 05: Pierre diff keyboard model (F-05-05) and Shiki light palette (F-05-18) share F-16-06's root-cause lint.
- Area 04: model/effort/runtime pickers return focus to the composer instead of the trigger (P3; decide intentionally).
- Area 08: Keybindings "When" labels 2.74 / 3.04 (`text-xs text-muted-foreground/70`) and 18 `color-contrast` nodes on that page.
- Provider/usage email toggles (`Toggle account email visibility` x5) expose no `aria-pressed`.
