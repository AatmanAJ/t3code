## 1. Executive summary

- Source: 24 audit areas, 640 findings (`ui-overhaul/spec/_FINDINGS-INDEX.md`; counts re-derived from the audit files, 0 severity mismatches). Area 22 (performance feel, 8 findings) was measured last and folded in.
- Severity: P0 0, P1 116, P2 316, P3 200. Effort: XS 264, S 281, M 81, L 6, XL 0.
- P1 by area: 09 providers 12; 06 terminal/panels 9; 11 pairing 9; 02 thread list 8; 10 first run 8; 13 loading 8; 07 settings-appearance 7; 12 toasts 7; 03, 05, 15, 16 six each; 24 five; the rest four or fewer.
- Upstream-eligible (CONTRIBUTING shape): yes 441, no 184, after #24865 merges 5, partly 2. Of the 184 "no", 104 give #24865 file overlap or "until/after it merges" as the reason, and 30 name a maintainer decision (new surface, new default, global feel change); the two sets overlap slightly.
- #24865 (owner PR, moving baseline, decision D-006): not addressed 577, partial 43, addressed 9, conflicts 3. Among the 116 P1: not addressed 104, partial 8, addressed 4 (F-02-02, F-02-03, F-04-01, F-10-08).
- #24865 already supplies: Inter on Windows/Linux, radius scale 4/6/8/12/16, 1.75 icon strokes, chat text at 90%, dark muted text to neutral-400, dark border/input 8%/11%, darker light status and diff tokens, sidebar-row hierarchy, one composer placeholder, 16/600 settings section titles. These are givens, not proposals.
- Not touched by this spec (owner calls): blue switch accent, composer model-logo colour, three-line sidebar rows, #0a0a0a canvas, 75% read titles.
- The 3 "conflicts" findings (F-16-07 neutral composer focus ring, F-16-20 user-bubble label contrast, F-18-09 ring and shadow on the active sidebar row) go to spec section 15 only.
- Upstream chunks exclude files #24865 touches (SidebarThreadRow, ChatMarkdown, settingsLayout, ComposerPromptEditorTiptap, GitActionsControl, SettingsPanels) unless the chunk is a follow-up fix to the PR.
- Pattern: the P1s cluster into truthful state (blank or false loading, vanished errors, wrong scroll), operability (keyboard, touch, forced colours), irreversible actions, and first-run dead ends. Visual polish (type, grey, radius, shadow) is mostly P2/P3 except the muted-text contrast root cause.
- Ranking below = impact (1-3) x breadth (1-3), judgment from the audit evidence, not a measurement. "Indep." = can ship without waiting for #24865.

### Top 10 problems

| #   | Problem                                                                                                                                                                                                                                                | Findings (P1 unless marked)                                               | Surface                         | Effort                         | Upstream-eligible                                                       | Indep. of #24865                                                                                     | I x B   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- | ------------------------------- | ------------------------------ | ----------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ------- |
| 1   | Long threads open short of the end, scroll-up is reverted while streaming, an oversize turn opens blank or freezes 2.4 s, "Working for" ticks while waiting on approval                                                                                | F-03-01, F-03-02, F-03-03, F-03-04, F-03-08                               | all (web measured)              | 3 S + 2 M                      | yes x3; F-03-03 after merge; F-03-04 no (maintainer call)               | yes except F-03-03 (same function as its empty-state edit)                                           | 3x3 = 9 |
| 2   | Failures vanish or are swallowed: toasts hide older errors and default to 5 s (299 of 302 error toasts), composer errors in a top banner, a render error replaces the shell, Copy code no-ops over HTTP, typed text lost on Esc                        | F-12-01, F-12-02, F-12-05, F-12-03, F-12-07, F-03-11, F-08-08             | all; F-12-03/05 web+desktop     | 5 S + 2 M                      | yes x6; F-12-03 no (ChatComposer is a #24865 file)                      | yes except F-12-03                                                                                   | 3x3 = 9 |
| 3   | Loading and connection states are blank or false: "No projects yet" before the snapshot, splash removed before first paint, fixed 4 s "Still connecting", no app-level connection indicator, revoked session "reconnecting" forever                    | F-13-01..06, F-13-08, F-11-16, F-11-17, F-11-18                           | all                             | 7 S + 3 M                      | yes x9; F-11-16 no (new element, propose as idea)                       | yes                                                                                                  | 3x3 = 9 |
| 4   | Secondary text fails contrast through an opacity ladder (14 alpha steps on muted, 175 sites, 1.47-3.88:1 light) and hierarchy leans on 11 greys and 12 title treatments                                                                                | F-16-06, F-17-02, F-17-01, F-07-37, F-02-01, F-04-21, F-12-04             | all                             | L + M + 2 S + 3 XS             | yes in slices (4); F-02-01, F-04-21, F-12-04 after merge                | partial: hold 4 PR files; F-02-02/03 already fixed by PR                                             | 2x3 = 6 |
| 5   | Thread list unusable without hover: row actions unreachable on touch-only web, context menu has no menu semantics, 3-4 tab stops per row, row name omits state                                                                                         | F-02-04, F-02-05, F-02-06, F-02-07                                        | web, desktop                    | 3 M + S                        | F-02-05 yes; other three after merge                                    | after merge (SidebarThreadRow, Sidebar)                                                              | 3x2 = 6 |
| 6   | Keyboard position invisible: popup-list highlight 1.04-1.22:1, no focus ring on sidebar search and Add provider, unnamed branch picker, focus and switch state vanish in Windows forced colours                                                        | F-16-01, F-16-02, F-16-03, F-16-04, F-09-05, F-07-16, F-07-17             | all; Windows for forced colours | 5 XS + 2 S                     | yes                                                                     | yes                                                                                                  | 3x2 = 6 |
| 7   | First run and missing-provider paths dead-end: no install action, wizard never shown in web mode, `/new` error page, mobile never says a computer is needed, Full access default unstated                                                              | F-09-07, F-10-01..04, F-10-06, F-10-07, F-24-01..05, F-20-01, F-09-19..21 | web, desktop, mobile            | 5 XS + 9 S + 2 M (16 findings) | yes                                                                     | yes except F-09-20 (after merge); F-10-01 and F-10-03 need a server change (outside UI scope, gated) | 3x2 = 6 |
| 8   | One-way doors with no confirm or undo: Commit row commits every file, Restore device defaults rewrites all environments, worktree cleanup, instance delete, Revoke, server Update, window close quits backend                                          | F-05-06, F-08-01, F-08-40, F-09-15, F-11-13, F-11-19, F-14-01             | web, desktop                    | 3 S + 4 M                      | yes x4; F-05-06, F-08-01 after merge; F-14-01 no (product call, #10161) | yes except F-05-06, F-08-01                                                                          | 3x2 = 6 |
| 9   | Phone-width web and touch targets: header buttons float over the sheet, provider rows collapse to "Claud…", switch 38x22, permission mode hidden, tab icon tap closes tab, unlabeled nav rail                                                          | F-01-02, F-04-22, F-06-08, F-07-06, F-09-01..04, F-18-01                  | web at phone/tablet width       | XS + 6 S + 2 M                 | yes x7; F-04-22, F-07-06 after merge                                    | yes except F-04-22, F-07-06                                                                          | 2x3 = 6 |
| 10  | Saved layout does not restore and panels have no content floor: collapsed sidebar never restored, project filter dropped, sidebar + panel squeeze chat to 280 px, diff comparator crushed, split diff at 160 px columns, one bad setting locks the app | F-01-01, F-01-03, F-01-04, F-05-03, F-05-04, F-06-09, F-07-13             | all                             | XS + 5 S + M                   | yes                                                                     | yes                                                                                                  | 2x2 = 4 |

Fix shape per row (from each finding's `Proposed`, abridged):

1. Single `domGap <= 8` predicate for initial pin and "Scroll to end"; release live-follow synchronously on wheel/touch/PageUp; static "Waiting for approval" label with no timer or shimmer; `Empty` state with "Load turn"; first 60 blocks plus "Show remaining" for messages over ~150 KB.
2. Never collapse error, warning or actionable toasts; one `applyToastDefaults` policy and pause on hover, focus and blur; composer issues as a `ComposerBanner`; per-outlet `errorComponent`; route Copy code and table through `writeTextToClipboard` with an error toast; flush commit-on-blur before Settings closes.
3. Sidebar skeleton at real row pitch until the shell snapshot; keep the boot shell until first paint; derive "connecting" from environment phase, not a timer; connection dot in the sidebar footer; "Retry now" with countdown; route to `/pair` when the session is revoked.
4. Lint rule `no-text-opacity-on-muted` plus codemod to bare `text-muted-foreground` / `text-foreground` (three tiers); one title ladder 30/24/20/16/14; `--destructive-solid` fill; land per directory.
5. Trailing "Thread actions" button under `any-hover: none`; `role=menu` with arrow keys and focus; roving tabindex; row accessible name carries pinned, section, branch, time.
6. `data-input="keyboard"` modality variant puts a 2 px inset ring on highlighted list items; one `forced-colors: active` `:focus-visible` outline; `aria-label="Branch, ..."`; ring on the search wrapper; Switch and theme tiles get forced-colour borders.
7. Install row with copyable command; palette "Open setup" and Settings "Import projects"; bare `/new` redirects to `/`; mobile empty states name the missing computer; agents step shows "Full access" with a Change disclosure; error strings use names, not UUIDs.
8. `AlertDialog` or `requestConfirmDialog` with counts and named verbs ("Delete worktrees", "Revoke 3 clients", "Update and restart"); Commit row shows file count and opens the dialog above 25 files; Restore device defaults limited to client keys; close-window confirmation on Windows/Linux.
9. `hit-area` utility (24 px fine, 44 px coarse); hide header buttons when the sheet is mounted; two-line model rows with menu for reorder; tooltips on the nav rail; permission chip stays, effort collapses first; X at chip end on touch.
10. Initialise sidebar-open from localStorage; `shouldAcceptWidth` subtracts the inline panel and degrades to a sheet below 720 px; comparator on its own row; split diff falls back to unified under 720 px; explorer closed under 720 px; "Reset settings" recovery with backup.

## 2. Design DNA

Condensed from `ui-overhaul/DNA.md` (110 rules). Binding order: P outranks taste rules; code wins over the document. Cite as `DNA-<family><n>`.

### Corrections pending

- **Menus do not animate (area 19).** DNA 7.1 says "Popovers/menus: scale 0.98 plus opacity, ~150ms". Measured: popovers, tooltips and comboboxes animate; the Menu and Select popups have 0 transitions and are fully opaque on frame one (F-19-05, `menu.tsx:61`). Reword 7.1 to "popovers, tooltips, comboboxes", or land F-19-05 (enter-only, 120 ms, close instant) so the text becomes true.
- **DNA-S1 is stale against #24865 (area 18).** S1 lists 6/8/10/14/18/22/full; #24865 moves `--radius` 0.625rem to 0.5rem, giving 4/6/8/12/16 (`rounded-3xl` 20, used once). Rewrite S1 as roles (F-18-03): 4 inline code, kbd, menu items; 6 chips, tooltips, rows inside popups; 8 controls, inputs, popups, sidebar rows; 12 grouped cards; 16 composer, details card, dialogs, route modals; full pills.
- Consequential edits once #24865 merges (derived, not from areas 18/19): DNA-ID2, K6, K7 quote 22 px (now 16); K1 pins sidebar rows at 8 (becomes 6 unless F-18-03 lands); I1 says 2 px stroke (now 1.75); K11 says no brand typeface in the default (Inter Variable is prepended on Windows/Linux); S4 gains one in-flow exception if F-18-09 is accepted. Area 18 also corrects DRIFT-16: quarter-step paddings (`px-1.75`) are the DNA-SP3 "padding minus border" idiom, not drift.

### P Principles (9)

- DNA-P1 Performance is a design constraint; no per-frame repaint or GPU-spiking CSS animation.
- DNA-P2 Obvious, minimal, no slop; no chrome, steps or tokens added to look thorough.
- DNA-P3 UI is dumb and truthful; every label, count and spinner mirrors real state.
- DNA-P4 Primitives own their look; pick `variant`/`size`, layout classes on the parent (lint `shadcn/no-restyle`).
- DNA-P5 Tailwind in the owning component; global CSS only for markdown, animations, runtime theme vars, Electron; `@variant dark/light`.
- DNA-P6 Compose slots, do not copy markup (`ComposerBanner` is the reference).
- DNA-P7 Every way in has a way out; a one-way door is a bug.
- DNA-P8 Hit every surface: entry points, clients, connection modes, before calling a change done.
- DNA-P9 Remote-ready: assume no local filesystem, mouse or native titlebar.

### C Colour (14)

- DNA-C1 Semantic tokens, not literals; a missing role joins the 61-role set.
- DNA-C2 One chromatic voice: neutral zinc plus one blue; chroma only for status, diff, provider, project identity.
- DNA-C3 Surfaces step by lightness then a 1px hairline (canvas #fcfcfc/#0a0a0a, card #fff/#111); no shadow in flow.
- DNA-C4 Two text levels plus disabled (foreground; muted 4.71/5.08:1; `opacity-64`); no third grey by alpha.
- DNA-C5 Floors: text 4.5:1, muted >= 4.7/5.08, theme text >= 7:1, meaningful icons and borders >= 3:1; text under 14px never below 4.5.
- DNA-C6 Status semantics fixed (emerald, amber, red, blue, primary, fuchsia); text uses `*-foreground`, icons the base, panels `*-surface`.
- DNA-C7 Diff is green/red and colour-blind switchable through `--diff-*`; never hard-coded.
- DNA-C8 Light/dark/system resolved once, early; components never read `prefers-color-scheme`; boot script parity.
- DNA-C9 Text and borders route through `--contrast-*` so the Contrast slider works.
- DNA-C10 The sidebar is its own token scope; portaled sheets must opt in.
- DNA-C11 Glass is a recipe (dropdown, dialog, surface, alert) for floating surfaces only; never in flow.
- DNA-C12 Grain (3.5% noise) belongs to chrome backgrounds, never a fixed overlay.
- DNA-C13 Generated themes go through `createVividThemeColors`; muted 4.705/5.082, text >= 7:1.
- DNA-C14 Raw palette hues are for identity (monograms, provider marks, file types), not status.

### T Type (10)

- DNA-T1 System fonts, one ladder: 12 / 14 / 20 / 24-30; 11 and 10 for dense metadata and counters.
- DNA-T2 14px is the desktop reading and control size; 12px is the label size.
- DNA-T3 Touch and narrow widths scale controls up (16px), not content.
- DNA-T4 Everything survives the Interface font size setting (rem-based; documented px exceptions).
- DNA-T5 Weight carries hierarchy: 400 body, 500 titles and labels, 600 headings, 700 monogram only.
- DNA-T6 Line height ships with the size token; prose `leading-relaxed`, single-line controls fixed heights.
- DNA-T7 Mono for machine-typed values (code, diff counts, versions, IDs, paths), not branches, shortcuts or labels.
- DNA-T8 `tabular-nums` for numbers that update.
- DNA-T9 Truncate in rows (start/middle for paths), wrap in prose with balance/pretty.
- DNA-T10 Overline labels (uppercase, wide tracking, 10-11px) are the only uppercase.

### S Shape (8)

- DNA-S1 Radius is a ladder with roles (6/8/10/14/18/22/full); STALE, see Corrections pending.
- DNA-S2 Nest radii by subtracting parent padding and border.
- DNA-S3 1px hairline borders (`border-border`, `border-input`); 2px only for focus, selected outlines, blockquote rules.
- DNA-S4 Only floating things have shadows; in-flow cards are `border` + `bg-card/40`.
- DNA-S5 Shadows are long, low, offset down, negative spread, 40-90% black; never a short dark drop.
- DNA-S6 The right panel stays flush (a column with a left hairline); only the details card is a rounded glass card.
- DNA-S7 Dividers separate groups, not rows (`border-t border-border/50`).
- DNA-S8 Pick the glass utility for the role.

### SP Spacing (6)

- DNA-SP1 4px scale at whole and half steps (0.5-8); no `*-1.75`, `*-3.25`, `*-4.5` layout spacing.
- DNA-SP2 8px between siblings, 12px at container edges (`px-3` rows, `px-4` roomy).
- DNA-SP3 Padding minus border so bordered controls land on the grid.
- DNA-SP4 Use the named insets (sidebar, palette, floating, workspace), not fresh pixel values.
- DNA-SP5 Reading column capped: lane 46rem (72rem wide, full), settings 896px, descriptions `max-w-xl`.
- DNA-SP6 Vertical rhythm 8 / 10 / 32; no fourth section gap.

### D Density (6)

- DNA-D1 Entities get room (56-80px rows), commands get compactness (24-32px); thread rows never denser than 78px.
- DNA-D2 Two control densities by width and pointer: desktop 32/28/24, touch +4; use `size` variants.
- DNA-D3 One top bar height, 52px (subheaders 40px, 28px inline preview).
- DNA-D4 Hit area >= 44px on touch via the `after` pseudo-element.
- DNA-D5 Menus, selects, comboboxes share one row (`min-h-7`, touch `min-h-8`, `rounded-sm`, 14px); palette rows 32px.
- DNA-D6 Density follows available height; expose tiers (full, compact, essential) rather than clip.

### M Motion (9)

- DNA-M1 Instant is the default; layout-size changes obey only the Panel animations gate (default 0).
- DNA-M2 Nothing repaints continuously: one-shots under ~700 ms, stepped duty-cycled keyframes, or paused when hidden.
- DNA-M3 Animate opacity and transform; width/height only behind the gate or `AnimatedHeight`.
- DNA-M4 Duration ladder: 100-150 ms hover/press, 150-200 ms popups and modals, 600 ms streaming fade only; ease-out, `--ease-drawer` for slide and pop.
- DNA-M5 Every animation has a reduced-motion branch.
- DNA-M6 Spinners are the shared `Spinner`; no hand-rolled `animate-spin`.
- DNA-M7 Streaming never replays; finished threads show final state at once.
- DNA-M8 No motion on theme or appearance change (`no-transitions` window).
- DNA-M9 Status must not lie; pulses and spinners stop when work stops.

### V Voice (10)

- DNA-V1 Sentence case everywhere.
- DNA-V2 Buttons are verbs, destinations are nouns; confirm buttons name the action.
- DNA-V3 Say what failed, then why; never "An error occurred." where the cause is known.
- DNA-V4 One error prefix, "Could not <verb> <object>"; no new "Failed to"/"Unable to"; no contractions in titles.
- DNA-V5 Explain in place, once, briefly (two sentences, period, consequence or default); no tooltip-only explanation.
- DNA-V6 Second person, no theatre (no Please, Oops, Sorry, exclamation marks, emoji, marketing); "we" only in onboarding and draft hero.
- DNA-V7 Product vocabulary (thread, project, settle, snooze, worktree, environment, computer, surface); no synonyms.
- DNA-V8 Reverse actions are named pairs (Settle/Un-settle, Snooze/Wake).
- DNA-V9 In-progress labels end with one "…" (U+2026); so do menu items that open a further choice.
- DNA-V10 Counts and times are literal ("Settled (0)", "Working 9s", "3m"); no rounding words.

### I Iconography (7)

- DNA-I1 Lucide first at one stroke (2px; 2.25 for checks; #24865 sets 1.75); custom SVG only for brands, file types, monogram.
- DNA-I2 Three sizes: 16 control and menu, 14 beside 12px text, 12 status and meta; 18+ touch and empty states only.
- DNA-I3 Icons are muted until active; status colour only for status.
- DNA-I4 Never icon-only without a name: `aria-label` and a tooltip with the shortcut.
- DNA-I5 Projects are monograms (hash colour, 2-letter mono), never a generic folder.
- DNA-I6 Provider and editor brands keep their own colour.
- DNA-I7 `Spinner` for loading, `MorphIcon` for two-state toggles.

### L Layout (8)

- DNA-L1 Three columns plus floats; new features open a right-panel surface or route modal, not a fourth column.
- DNA-L2 Thread-first navigation; settings and utilities are the footer icons and the palette.
- DNA-L3 52px top bar, 736px lane.
- DNA-L4 Settings-like destinations are route modals (`AppRouteModal`, `SettingsSection`, `SettingsRow`).
- DNA-L5 Panels persist widths and degrade: right panel to sheet at 980px, sidebar at 768px, floats hide under a 640px lane.
- DNA-L6 Settings anatomy fixed: scope sentence, sections, grouped card; row = 14/500 title, 12 muted description, control right.
- DNA-L7 Layer numbers are a contract: sheet 46, dialog 50, toast 100, popup 130, tooltip 140.
- DNA-L8 Keyboard first: every primary action has a `Kbd` hint in tooltips and menus and a palette command.

### X Mobile and cross-surface (4)

- DNA-X1 One palette, three renderers; a web-only colour hack is a mobile bug.
- DNA-X2 Same token name, same meaning, not same pixels; say px or role across surfaces.
- DNA-X3 Mobile keeps the web information hierarchy with native controls and fonts; not a web-typography reskin.
- DNA-X4 Phone-width web works without hover (`any-hover` touch affordances).

### ID Identity (3)

- DNA-ID1 A thread inbox, not a file tree: flat thread rows, Settle/Snooze pairs, the shelf.
- DNA-ID2 A quiet flat canvas with a few floating glass objects (composer, details card, popups, toasts) and mono accents.
- DNA-ID3 Obvious, instant, plain-spoken: 0 ms panels, stepped indicators, real state, no gradients or decorative motion.

### K Do not touch (16)

- DNA-K1 `SidebarThreadRow` structure and density (78px; selected = white / foreground 11% at 8px).
- DNA-K2 Settle/Un-settle and Snooze/Wake pairs, "Settled (n)" shelf, status vocabulary, timing text.
- DNA-K3 `ProjectMonogram` and `deriveProjectIdentity` (2-letter mono tile, 18 hues, 14% tint, 25% radius).
- DNA-K4 Panel animations default 0 ms and the `data-panel-animations` gate.
- DNA-K5 Duty-cycled animation set (`status-pulse`, `skeleton`, `status-ping`, `live-tool-shine`, `Spinner`, streaming fade).
- DNA-K6 Composer surface (736px lane, glass, outline pseudo-element, `ComposerBanner` slots, 28px footer controls).
- DNA-K7 Thread details card (280px, glass, 12px inset, three density tiers, popover fallback).
- DNA-K8 Theme architecture (61 roles, generator, boot script and parity test, contrast and glass settings).
- DNA-K9 Muted-text contrast targets 4.705 / 5.082 in five palettes and the generator.
- DNA-K10 `components/ui` primitives, dual-density sizes, 44px coarse hit area.
- DNA-K11 System font stack with user overrides; no brand typeface in the default.
- DNA-K12 Chat prose and chips (14/1.625 prose, 13px code, `ContextChip`, mono diff counts, table style, heading ladder).
- DNA-K13 Sidebar resize behaviour, persisted widths, right-panel limits, 980px sheet breakpoint, terminal drawer limits.
- DNA-K14 Command palette and shortcut hints.
- DNA-K15 Dev/Nightly artwork stays a static marker for Dev/Nightly only.
- DNA-K16 Copy voice of settings descriptions and the in-place explanation pattern.

## 3. Token proposal

Diffed as-is: **Current** is upstream main @5f64c5eb as measured by the audits; **Proposed** is the delta over #24865's end state; the last column says what the PR does. Givens from the PR (not proposals): `--radius` 0.5rem, rungs 4/6/8/12/16, 1.75 strokes, Inter on Windows/Linux, chat text 90%, dark muted neutral-400, dark border/input 8%/11%, light foreground zinc-900. Guard rails applied to every row: additive tokens or utilities only, no new library, no gradient, glow or bounce, no change to the canvas, switch accent, three-line rows or composer model colour, each row cites a DNA rule.

### 3.1 Colour and text-opacity steps (areas 16, 17, 07)

| Token / pattern                                                                                | Current                                                                                      | Proposed                                                                                                                                                                                  | File                                                    | Reason (findings)                           | DNA         | #24865                                                                               |
| ---------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------- | ----------- | ------------------------------------------------------------------------------------ |
| `--muted-foreground` light                                                                     | `#71717b`, 4.71:1 on `#fcfcfc`                                                               | keep; valid only at 100% opacity                                                                                                                                                          | `index.css` :root, `themePalette.ts:802-803`            | F-16-06                                     | C4, C5, K9  | unchanged                                                                            |
| `--muted-foreground` dark                                                                      | `#818181`, 5.08:1 on `#0a0a0a`                                                               | `#a3a3a3` (neutral-400), 7.85:1 (computed here)                                                                                                                                           | `index.css` dark block                                  | F-17-02                                     | C4, C5      | given                                                                                |
| `text-muted-foreground/{30..90}`                                                               | 14 alpha steps, 175 sites (192 with alias roles); 1.47-3.88:1 light, 1.46-4.30:1 dark        | bare `text-muted-foreground`; rank by size and weight; oxlint rule `t3code/no-text-opacity-on-muted` plus codemod, one directory per PR (settings, chat, root, sidebar+pullRequest+usage) | `oxlint-plugin-t3code`, ~175 sites                      | F-16-06, F-17-02, F-03-25, F-07-37, F-04-21 | C4, C5      | partial (drops `/40` x3, `/60`, `/70` x3, `/80`, placeholder `/75` at touched sites) |
| `text-foreground/{65..95}`                                                                     | 8 steps, 83 sites                                                                            | bare `text-foreground`; exempt `ChatMarkdown.tsx:1593` contrast calc, sidebar read title 75% (`SidebarThreadRow.tsx:976`, owner call), `components/ui`                                    | ~83 sites                                               | F-17-02                                     | C4          | partial (chat to 90%; adds new `/75`, `/80`)                                         |
| `text-secondary-label/70` x4, `text-placeholder/75`, `text-sidebar-muted-foreground/{5 steps}` | 2.7-2.9:1; Settings nav labels `/80` = 3.19 light / 3.54 dark                                | bare token (4.71/5.08 root scope, 4.62/8.33 sidebar scope)                                                                                                                                | `ui/sidebar.tsx:700`, composer placeholder              | F-16-09, F-04-03, F-17-02                   | C4, C5      | placeholder addressed; rest not addressed                                            |
| Neutral text levels in use                                                                     | 11 distinct across 7 views (fg 100/90/85/80/70, muted 100/90/80/75/40, one via ancestor 64%) | 3 tiers: primary, secondary, quiet = secondary at `text-2xs` (11px); disabled stays container-level `opacity-64`                                                                          | all                                                     | F-17-02                                     | C4, T5      | partial                                                                              |
| Settled/Snoozed row text                                                                       | `text-secondary-label/70` plus `unsettle` wildcard: 2.69:1 light, 3.09 dark                  | bare `text-secondary-label` (4.62 / 5.39); favicon `opacity-40` to `opacity-60 grayscale`                                                                                                 | `SidebarThreadRow.tsx:895,987,992,1637`                 | F-02-01                                     | C5, K1      | not addressed                                                                        |
| Status base colour used as text (light)                                                        | success 2.41, warning 2.08, info 3.67:1                                                      | `*-foreground` (5.23 / 4.90 / 6.66)                                                                                                                                                       | `ComposerPendingApprovalPanel.tsx:52`, two banner sites | F-03-10, F-04-41                            | C6          | not addressed                                                                        |
| Diff addition / deletion foreground (light)                                                    | `#009966` 3.56:1 / `#e7000b` 4.65:1                                                          | `#007a55` 5.23 / `#c10007` 6.26                                                                                                                                                           | `index.css`                                             | audit 16 contrast table                     | C7          | given                                                                                |
| Destructive button fill                                                                        | white on `#fb2c36` 3.81:1 (dark `#fb414a` 3.53)                                              | new `--destructive-solid: color-mix(in srgb, var(--destructive) 78%, black)`: 5.82 / 5.41; `--destructive` stays for icons and borders                                                    | `index.css`, `ui/button.tsx`                            | F-12-04                                     | C5, C6, K10 | not addressed                                                                        |
| Switch off-state                                                                               | track `bg-input` 1.46:1 light (1.19 dark)                                                    | light `data-unchecked:bg-muted-foreground/80` (track 3.24, thumb 3.21); dark unchanged; blue checked accent untouched                                                                     | `ui/switch.tsx:13`                                      | F-16-10                                     | C5, K10     | partial (dark input 8% to 11%)                                                       |
| Dark `--border` / `--input`                                                                    | white 6% / 8%                                                                                | 8% / 11%                                                                                                                                                                                  | `index.css`                                             | F-16-10                                     | C3          | given                                                                                |
| `border-border` alpha                                                                          | 7 steps (bare, /80, /70, /60, /50, /45, /40)                                                 | 4: bare edge, `/80` media-adjacent, `/60` cards, `/50` in-group dividers; codemod `/70` to `/60` (96 sites), `/45` `/40` to `/50` (7)                                                     | 307 uses, 103 edited                                    | F-18-07                                     | S3, S7      | partial (tokens only)                                                                |
| Link vs body text                                                                              | no resting underline; 1.15:1 vs 80% prose (light)                                            | dotted 1px underline at rest, solid on hover and focus                                                                                                                                    | `index.css` `.chat-markdown a`                          | F-03-19                                     | C5          | not addressed                                                                        |
| Contrast slider floor                                                                          | 50%: body 3.36:1, secondary 2.01:1                                                           | UI minimum 75 with a status line below 100; contract minimum stays 50                                                                                                                     | Appearance panel                                        | F-07-26                                     | C9          | partial                                                                              |
| User-bubble label                                                                              | PR leaves 4.05:1 light; bubble vs canvas 1.16:1                                              | `text-muted-foreground`, no bubble border                                                                                                                                                 | `TimelineUserMessageRow`                                | F-16-20                                     | C5          | conflicts: section 15                                                                |

### 3.2 Radius (area 18)

| Token / pattern                            | Current                                                                                                                                           | Proposed                                                                                                                                                                       | File                                                                                                                                   | Reason  | DNA          | #24865                                |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------ | ------------------------------------- |
| `--radius` and rungs                       | 0.625rem; sm/md/lg/xl/2xl/3xl = 6/8/10/14/18/22                                                                                                   | 0.5rem; 4/6/8/12/16/20                                                                                                                                                         | `index.css:1096`                                                                                                                       | PR      | S1 (rewrite) | given                                 |
| `--control-radius`                         | literal `0.5rem`, not derived                                                                                                                     | `var(--radius-lg)` (still 8px, tracks the ladder)                                                                                                                              | `index.css:101`                                                                                                                        | F-18-03 | S1, K1       | partial (ladder moves, literal stays) |
| Sidebar rows, search, settings nav, drafts | `rounded-md`: 8 on main, 6 after PR while sibling buttons stay 8                                                                                  | `rounded-(--control-radius)` (8)                                                                                                                                               | `SidebarThreadRow.tsx:894`, `SidebarDraftBlock.tsx:90`, `SidebarThreadHeader.tsx:65`, `SettingsSidebarNav.tsx:250`, `Sidebar.tsx:3220` | F-18-03 | S1, K1       | partial                               |
| Composer, details card, plan card, dialogs | 22 / 22 / 22 / 18                                                                                                                                 | 16                                                                                                                                                                             | various                                                                                                                                | PR      | S1, K6, K7   | given                                 |
| Last `rounded-3xl`                         | `GuestPage.tsx:666`, 20px                                                                                                                         | `rounded-2xl`                                                                                                                                                                  | `GuestPage.tsx:666`                                                                                                                    | F-18-06 | S1           | partial                               |
| Small off-ladder radii                     | `rounded-xs` 2px x4, `[3px]` x2, `calc(var(--radius)-5px)`, composer inline code 0.3em (`index.css:2375`), theme-inspector label 0.4rem (`:1385`) | documented `--radius-xs` for swatches of 8px or less; `input-group` `calc(var(--radius-md)-1px)`; 0.25rem; 0.375rem; `ContextChip` stays em-relative (declared chip exception) | listed files                                                                                                                           | F-18-06 | S1, S2       | partial                               |
| Mobile radii                               | no ladder; 106 of 338 arbitrary px; one card role takes 7 values                                                                                  | `global.css @theme`: `--radius-sheet: 28px; --radius-card: 24px; --radius-card-sm: 20px; --radius-control: 14px`; replace literals 28 / 24+22+26 / 20 / 14                     | `apps/mobile/global.css`                                                                                                               | F-18-05 | X2, X3       | not addressed                         |
| Active sidebar row ring + `shadow-xs`      | none on main                                                                                                                                      | no code change; amend DNA-S4 with one in-flow exception                                                                                                                        | `SidebarThreadRow.tsx` (PR)                                                                                                            | F-18-09 | S3, S4       | conflicts: section 15                 |

### 3.3 Shadows: 45 distinct strings (225 uses) to a three-level ladder (area 18)

Floating recipes today: 12 (menu, dialog, route modal, toast, glass tooltip, default tooltip, autocomplete, sheet, hover card, image dialogs, standalone page, mini player). Level 0 (flat) is unchanged: rows, cards, panels, sidebar, details card, chat header carry no shadow; `shadow-xs` on controls and `shadow-md/5` on the default tooltip stay.

| Level                | Surfaces                                                                                                   | Proposed light                       | Proposed dark                                                           | Replaces                                                                                                                                                                                                                                                    | Findings         | DNA        | #24865        |
| -------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ---------- | ------------- |
| L1 `--shadow-lift`   | glass tooltip, toast and anchored toast, timeline minimap, hover and preview card, drag ghost, mini player | `0 12px 28px -18px rgb(0 0 0 / 40%)` | `0 14px 32px -18px rgb(0 0 0 / 75%)`                                    | `shadow-xl shadow-black/25` x4 (`tooltip.tsx:142`, `toast.tsx:568,706`, `TimelineMinimap.tsx:259`), `shadow-lg` in 6 files, mini player `shadow-lg/20` and `shadow-2xl/35`                                                                                  | F-18-02, F-12-25 | S4, S5     | not addressed |
| L2 `--shadow-popup`  | menu, select, popover, combobox, autocomplete, sheet                                                       | `0 16px 40px -18px rgb(0 0 0 / 55%)` | `0 18px 44px -18px rgb(0 0 0 / 80%)`                                    | string hand-copied in `menu.tsx:53`, `popover.tsx:96`, `combobox.tsx:167`, `select.tsx:143`; `shadow-lg/5` in `autocomplete.tsx:105`, `sheet.tsx:93`                                                                                                        | F-18-02          | S5, S8     | not addressed |
| L3 `--shadow-dialog` | dialog, command palette, Settings and Usage route modal, standalone page, image and HTML dialogs           | `0 24px 64px -24px rgb(0 0 0 / 65%)` | `inset 0 1px rgb(255 255 255 / 4%), 0 24px 72px -20px rgb(0 0 0 / 90%)` | `dialog-glass` (`index.css:407-413`) already; route modal `sm:shadow-2xl/40` (no dark highlight, `AppRouteModal.tsx:55`); `standalone-page.tsx:40`; `shadow-2xl` in `ExpandedImageDialog.tsx:33,61,215`, `HtmlRenderDialog.tsx:38`, `ZoomableImage.tsx:160` | F-18-02          | S4, S5, S8 | not addressed |

Notes: L1 reuses the pre-PR composer pair, so the composer keeps its own `--shadow-composer`; the PR sets light to `0 1px 2px / 5%` (a short drop against DNA-S5, and `GuestPage.tsx:666` then differs by theme), which stays an owner call for section 15. F-18-02 counted 4 recipes after consolidation; this table folds the tooltip lift into L1 and leaves the composer on its token. Check toast and minimap on the light canvas (they lose their halo). Mobile (18 uses, 7 strings): no change proposed.

### 3.4 Spacing, density and hit targets (area 18, 16, 01)

| Token / pattern           | Current                                                                                                                        | Proposed                                                                                                                                                                                                                           | File                                                                                        | Reason                                   | DNA      | #24865        |
| ------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------- | -------- | ------------- |
| 4px scale                 | whole and half steps; quarter-step paddings (`px-1.75`, `pr-3.25`, `py-0.75`) are padding minus 1px border                     | no change; no new spacing token                                                                                                                                                                                                    | n/a                                                                                         | audit 18 inventory 3 (corrects DRIFT-16) | SP1, SP3 | n/a           |
| Off-scale sizes           | `size-3.25` x8, `size-4.5` x20, `h-4.5`, `leading-4.5` x9 (icons and line heights)                                             | leave                                                                                                                                                                                                                              | n/a                                                                                         | audit 18                                 | SP1      | n/a           |
| Hit area on raw buttons   | Switch 38x22 on touch, crumbs 99x22, "Worked for" 125x23, scope triggers 103x24; `Button` already gets 44px via `button.tsx:9` | new `@utility hit-area` beside `surface-glass` (~`index.css:341`): `::after` centred, `max(100%,24px)` fine pointer, `max(100%,44px)` coarse; apply to Switch, crumbs, fold toggle, changed-files rows, scope triggers, expand bar | `index.css`, `ui/switch.tsx:12`, `ChatHeader.tsx:292,374`, `MessagesTimeline.tsx:1386,1409` | F-18-01, F-09-03                         | D4, D2   | not addressed |
| Fine-pointer 20px targets | `Button micro`/`icon-micro` h-5; "Edit when clause" 118x20 x82; inheritance markers 20x20 x20                                  | `hit-area` on `micro` sizes; `button.tsx:9` gains all-pointer `after:min-h-6 after:min-w-6` (coarse keeps 44)                                                                                                                      | `ui/button.tsx:9,22-32`, `ThemeSettings.tsx:300`                                            | F-18-04, F-16-14                         | D4       | not addressed |
| Send, Stop, Resume pills  | 32-36px, no coarse expansion                                                                                                   | `pointer-coarse:after:absolute after:size-full after:min-h-11 after:min-w-11`                                                                                                                                                      | `ComposerPrimaryActions.tsx`                                                                | F-04-18                                  | D4       | not addressed |
| Chat column floor         | inline panel ignored by `shouldAcceptWidth`; chat squeezed to 280px                                                            | chat >= 360px with an inline panel; sheet mode below 720px layout width                                                                                                                                                            | `ChatView`, `rightPanelLayout.ts:1`                                                         | F-01-03                                  | L5, K13  | not addressed |
| Settings modal header     | 48px (`_chat.settings.tsx:121`) vs 52px bars                                                                                   | no code; record 48 as the one sanctioned exception in DNA-D3                                                                                                                                                                       | DNA text                                                                                    | F-18-08                                  | D3       | not addressed |

### 3.5 Type scale (area 17)

Ladder after this spec: display 30/400/-0.75px; page 24/600 `tracking-tight`; dialog, sheet, empty state 20/600; section 16/600 (a new official rung, already shipped by the PR for settings); item 14/500; body 14/400; label and meta 12; dense metadata 11 (`text-2xs`); counters 10 (`text-3xs`, 1-4 characters only). DNA-T1 lists no 16px rung, so this is additive.

| Role                    | Current                                                    | Proposed                                                                                                    | File                                                                                                 | Findings         | DNA         | #24865                           |
| ----------------------- | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------- | ----------- | -------------------------------- |
| Settings group title    | 14/400 at fg 70%                                           | 16/600 fg; stragglers `ThemeSettings.tsx:830,835`, `FoldedSettingsSection.tsx:46`, `SettingsPanels.tsx:727` | `settingsLayout.tsx:249` (PR)                                                                        | F-17-01, F-07-14 | T1, T5      | partial (settings sections only) |
| Title outliers          | 18/600, 18/500, 16/500, 24/600 without tracking            | empty-state `text-xl font-semibold`; form card `text-base font-semibold`; page 24/600 `tracking-tight`      | `FirstRunGate.tsx:191`, `routes/__root.tsx:145`, `GuestPage.tsx:314`, `PreviewUnreachable.tsx:31,64` | F-17-01          | T1, T5      | not addressed                    |
| Dialog and sheet title  | 20/600 with `leading-none` (solid when wrapped)            | `leading-tight` (25px)                                                                                      | `dialog.tsx:172`, `alert-dialog.tsx:113`, `sheet.tsx:145`                                            | F-17-08          | T6          | not addressed                    |
| Compact `Empty`         | 17px title, 13px description                               | `text-base leading-6`, `text-sm leading-5`                                                                  | `ui/empty.tsx:7,9`                                                                                   | F-17-12          | T1          | not addressed                    |
| Content text at 10px    | ~20 sites (URLs, event messages, review state)             | `text-2xs` (11px); keep `text-3xs` for 1-4 character content in boxes of 20px or less                       | files listed in F-17-04                                                                              | F-17-04, F-07-37 | T1, T2      | not addressed                    |
| Diff counts             | 10, 11, 12px; weights 400/500; ASCII hyphen and U+2212     | `text-2xs font-medium` mono default in `DiffStatLabel`, U+2212 minus                                        | `DiffStatLabel.tsx`, `ChangedFilesTree.tsx:202,239`, `SidebarThreadRow.tsx:1465`                     | F-17-05          | T7, T8      | partial (colour only)            |
| Overlines               | 7 variants, 10-12px, weight 400-600, tracking 0-0.18em     | one `text-overline`: 11/600/0.1em uppercase muted                                                           | 13 sites (F-17-06), `standalone-page.tsx:61`                                                         | F-17-06          | T10         | not addressed                    |
| px-sized text           | 13px details card rows, four 11px sites                    | `text-[0.8125rem]`, `text-2xs` (rem, honours Interface font size)                                           | `threadDetailsPanelStyles.ts:18,29`, `button.tsx:32`                                                 | F-17-09          | T4          | not addressed                    |
| Shortcut labels         | `tracking-widest` (1.2px) on Windows and Linux strings     | normal tracking                                                                                             | `menu.tsx:292`, `command.tsx:203`, `keybindings.ts:219-241`                                          | F-17-11          | T10         | not addressed                    |
| Inline code, chat prose | 12px / fg 80%                                              | 0.85em / 90%                                                                                                | `index.css:2058`, `ChatMarkdown.tsx:1593`                                                            | F-03-21          | K12         | given                            |
| Heading outline         | saved thread title `h2`; Settings pages have no `h1`       | `h1` for saved thread title and Settings crumb                                                              | `ChatHeader.tsx:383`, `SettingsBreadcrumb.tsx`                                                       | F-17-03          | P8          | not addressed                    |
| Font family             | `-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui` | Inter Variable inserted before Segoe UI                                                                     | `index.css` `@theme`                                                                                 | PR               | K11 (amend) | given                            |

### 3.6 Motion durations and easings (area 19, 12, 23)

Ladder: 120 ms hover/press floor for new code (existing `duration-100` stays valid under DNA-M4), 150 ms popups, tooltips and exits, 200 ms dialogs, sheets and toast slide, 220 ms cap. Enter `ease-out`, exit `ease-in`. Nothing runs under `prefers-reduced-motion`. Panels stay instant by default.

| Role                           | Current                                                                                                    | Proposed                                                                                                                                                                                                                                 | File                                                                                                                                                                                    | Findings                                                            | DNA     | #24865                                                                     |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------- |
| Duration spread                | 38 x150, 23 x200, 6 x100, 4 x180, 3 x220, 2 x500, 2 x300, singles 250/140/120                              | 4 steps above; 4 sites over 220 move to 200                                                                                                                                                                                              | `ContextWindowMeter.tsx:82,126`, `DesktopUpdateStatusIcon.tsx:84`, `ComposerAttachmentStrip.tsx:101`                                                                                    | F-19-09                                                             | M4      | not addressed                                                              |
| Easing in and out              | overlays `cubic-bezier(0.4,0,0.2,1)` both directions; backdrops `transition-all`; panels ease-out on close | `--default-transition-timing-function: cubic-bezier(0,0,0.2,1)`; `data-ending-style:ease-in` on popup strings; backdrops `transition-opacity duration-200 ease-out data-ending-style:ease-in`; panels `ease-in` on close inside the gate | `index.css:192`, `dialog-styles.ts:2,5`, `sheet.tsx:93`, `popover.tsx:90`, `tooltip.tsx:140`, `combobox.tsx:167`, `autocomplete.tsx:105`, `preview-card.tsx:33`, `AppRouteModal.tsx:55` | F-19-04, F-19-08                                                    | M4      | not addressed (F-19-04 is a global feel change: propose as an issue first) |
| Toast                          | transform 500 ms `cubic-bezier(.22,1,.36,1)`, opacity 500, height 150; wrapper `duration-250`              | transform 200 `var(--ease-drawer)`, opacity 150, height 150; ending 150 `ease-in`; wrapper 150                                                                                                                                           | `toast.tsx:568,644`                                                                                                                                                                     | F-19-03, F-12-25                                                    | M4      | not addressed                                                              |
| Menu and Select popups         | no motion (0 transitions, opaque on frame one)                                                             | enter only: `scale-98` + opacity, 120 ms `ease-out`, `origin-(--transform-origin)`; close instant                                                                                                                                        | `menu.tsx:61`, select popup                                                                                                                                                             | F-19-05                                                             | M4, ID3 | not addressed                                                              |
| Settings and Usage route modal | exit 150 ms, no enter                                                                                      | `starting:opacity-0 starting:scale-[0.985]` on popup, `starting:opacity-0` on backdrop                                                                                                                                                   | `AppRouteModal.tsx:55`, `dialog-styles.ts:2`                                                                                                                                            | F-19-01                                                             | M4      | not addressed                                                              |
| Reduced motion                 | no global rule; overlays, toasts, press scale keep moving (palette 3 transitions under `reduce`)           | one block beside `.no-transitions`: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0s !important; transition-delay: 0s !important } }`; keyframes already gated                                | `index.css:1086`                                                                                                                                                                        | F-19-02 (closes F-01-31, F-12-16, F-16-13, reduced half of F-04-19) | M5      | not addressed                                                              |
| MorphIcon spring               | overshoots, past 250 ms                                                                                    | `{ stiffness: 700, damping: 53 }` (critically damped, 5% settle ~180 ms)                                                                                                                                                                 | `MorphIcon.tsx`                                                                                                                                                                         | F-19-07                                                             | M4, I7  | not addressed                                                              |
| Settings-search highlight      | `box-shadow` animated twice, 650 ms                                                                        | pseudo-element ring, opacity once, 400 ms ease-out                                                                                                                                                                                       | `index.css:900-914`                                                                                                                                                                     | F-19-11                                                             | M2, M3  | not addressed                                                              |
| Hand-rolled loops              | 4 `animate-spin`/`animate-pulse` (fork button, others)                                                     | shared `Spinner` (`size="xs"`)                                                                                                                                                                                                           | files in F-19-06                                                                                                                                                                        | F-19-06, F-13-16, F-03-36                                           | M6      | not addressed                                                              |
| Panel gate                     | default 0 ms; slider 0-400 ms                                                                              | unchanged; no range change                                                                                                                                                                                                               | `settings.ts:113-122`                                                                                                                                                                   | F-19-08                                                             | M1, K4  | n/a                                                                        |
| Mobile motion                  | 5 animations at 240-260 ms in-out outside `MOBILE_MOTION`                                                  | `MOBILE_MOTION.enter` with `Easing.out(Easing.cubic)`; 200 ms flips                                                                                                                                                                      | mobile files in F-19-13                                                                                                                                                                 | F-19-13                                                             | X2      | not addressed                                                              |

Not proposed: bounce or spring overshoot, glow, animated gradients, a new animation library. An in-app reduce-motion switch (F-23-05, M) is a separate decision.

### 3.7 Focus ring (areas 16, 09, 03)

| Role                  | Current                                                                                        | Proposed                                                                                                                                                                                                           | File                                                                                                                               | Findings                  | DNA          | #24865                |
| --------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ------------ | --------------------- |
| Ring token            | `ring-2 ring-inset ring-ring`: 6.54:1 light, 4.26:1 dark                                       | keep; the only ring                                                                                                                                                                                                | `index.css`, `ui/button.tsx:9`                                                                                                     | audit 16                  | C5, S3       | unchanged             |
| Reduced-alpha rings   | 17 sites `ring-ring/70`, `/50`, `/24`, `ring-primary/25`: 3.54 light, 2.62 dark                | full `ring-ring`                                                                                                                                                                                                   | `collapsible-section-header.tsx:31`, `TimelineMinimap.tsx:163`, `WorkLog.tsx:84`, 14 more                                          | F-16-08                   | C5           | not addressed         |
| Highlighted list item | 8% fill, 1.04-1.22:1, outline none                                                             | `html[data-input="keyboard"]` set in `main.tsx` (keydown vs pointerdown), `@custom-variant kbd`, `kbd:data-highlighted:ring-2 ring-inset ring-ring` on the five item classes; Menu and Select use `focus-visible:` | `main.tsx`, `index.css`, `menu.tsx:127,172,230,319`, `command.tsx`, `select.tsx`, `combobox.tsx`, `SidebarThreadRow.tsx:1593-1600` | F-16-01                   | C5, K10, K14 | not addressed         |
| Forced colours        | box-shadow rings stripped: 0 of 14 composer-area stops, 24 of 40 Appearance stops show nothing | `@media (forced-colors: active) { :focus-visible { outline: 2px solid Highlight; outline-offset: 2px } }` after `index.css:691`; state fixes in `switch.tsx` and theme tiles                                       | `index.css`, `ui/switch.tsx`, `ThemeWireframe`                                                                                     | F-16-02, F-07-16, F-07-17 | C5, S3       | not addressed         |
| Missing rings         | sidebar search wrapper, "Add provider", question option buttons                                | `has-focus-visible:ring-2 ring-inset ring-ring`; `focus-visible:ring-2 ring-inset ring-ring`                                                                                                                       | `SidebarThreadHeader.tsx:63-66`, `ProviderSettingsPanel.tsx:1061`, `ComposerPendingUserInputPanel.tsx:255`                         | F-16-03, F-09-05, F-03-29 | C5           | not addressed         |
| Composer text box     | no indicator (PR removes the blue ring)                                                        | neutral `::after` outline `var(--contrast-muted-foreground)` (4.71 / 5.08) under `has-[:focus-visible]`                                                                                                            | `ComposerSurface.tsx:38`                                                                                                           | F-16-07                   | C5, K6       | conflicts: section 15 |

## 4. Hierarchy rules

Derived from areas 17, 18, 01 and 03; each rule names its source finding and DNA rule. These are the review checklist for any new surface.

1. **Title ladder.** One ladder, no sixth size: display 30/400, page 24/600 `tracking-tight`, dialog and empty state 20/600, section 16/600, item 14/500, body 14/400. A section title is always heavier than the rows it heads. (F-17-01; DNA-T1, T5)
2. **Weight and size carry rank, never opacity.** 400 body, 500 titles, labels, selected; 600 headings; no `font-bold` in chrome. Read state is encoded once (colour at 75% / 100%; the weight flip at `SidebarThreadRow.tsx:971` is optional to remove, F-17-14). (DNA-T5; F-17-02)
3. **Grey ladder: three text tiers.** Primary `text-foreground`; secondary `text-muted-foreground` (4.71 / 5.08:1, 7.85 dark after #24865); quiet is secondary at 11px. No `/NN` on text tokens; disabled is container `opacity-64`. Enforced by lint. (F-16-06, F-17-02; DNA-C4, C5)
4. **14px versus 12px.** 14px is reading and control size: row titles, menu items, inputs, buttons, composer, chat prose. 12px is label and meta: descriptions, tabs, tooltips, chips, timestamps. 11px for content-bearing dense metadata (diff counts, event messages, review state). 10px only for 1-4 character counters. Never a screen whose primary content is 12px, never 16px chrome on desktop; on coarse pointers controls go to 16px, content does not. (F-17-04; DNA-T1, T2, T3)
5. **One lead per row.** Title leads; metadata sits one step lower in tier or size, not both. Thread row: title 14/500, project 12/400, time 12 tabular. Settings row: title 14/500, description 12 muted, control right. (area 17 hierarchy notes; DNA-L6, T5)
6. **Message hierarchy is colour and mono, not size.** Answer prose 14/1.625 at 90%, then code block 13 mono, inline code 0.85em, tool command chip 12 mono, fold row 14 muted, timestamp 12. Status text uses `*-foreground`, never the base colour (2.08-3.67:1). Links carry a resting underline. (area 03; F-03-19, F-03-10, F-03-21; DNA-C6, K12)
7. **Real headings.** One `h1` per view: saved thread title, Settings page crumb; draft hero keeps its `h1`; setting rows stay `h3`. (F-17-03; DNA-P8)
8. **Overlines are the only uppercase,** one style: 11/600, 0.1em tracking, muted. Everything else sentence case. (F-17-06, F-17-07; DNA-T10, V1)
9. **Numbers and machine values.** `tabular-nums` for anything that updates; mono for diff counts (11/500, U+2212 minus), versions, IDs, paths; file names truncate in the middle or at the start. (F-17-05, F-17-10; DNA-T7, T8, T9)
10. **Elevation per surface type.** In flow (rows, cards, panels, sidebar, details card, chat header): flat, 1px hairline. L1 lift: glass tooltips, toasts, minimap, hover card. L2 popup: menus, selects, popovers, comboboxes, autocomplete, sheet. L3 dialog: dialogs, palette, Settings and Usage modals. Shadows are long and low (negative spread); the right panel is never a card. (F-18-02; DNA-S4, S5, S6, S8)
11. **Radius by role.** 4 inline code, kbd, menu items; 6 chips, tooltips, rows inside popups; 8 controls, inputs, popups, sidebar rows; 12 grouped cards; 16 composer, details card, dialogs, route modals; pill for round controls. A child is parent minus padding. (F-18-03, F-18-06; DNA-S1, S2)
12. **Borders separate groups.** 1px; four alphas only (edge, `/80` media, `/60` card, `/50` in-group divider); no divider on every row of a flat list. (F-18-07; DNA-S3, S7)
13. **Hit targets.** 24px minimum for fine pointers, 44px on touch, expanded with `hit-area` or `after` so the visual size is unchanged; raw `<button>` and Base UI parts need it explicitly. Phone-width web has a touch route to every hover action. (F-18-01, F-18-04, F-02-04; DNA-D4, X4)
14. **Density and floor.** Entities 56-80px rows, commands 24-32px; controls 32/28/24 (+4 touch); top bar 52px (the Settings modal's 48px is the one exception); the chat column never drops below 360px with a panel open, the panel becomes a sheet first. (F-01-03, F-18-08; DNA-D1, D2, D3, L5)
15. **Motion follows rank.** Layout is instant (panel gate), hover and press 120-150 ms, popups 150 ms, dialogs and toasts 200 ms, cap 220; enter ease-out, exit ease-in; none under reduced motion. (F-19-02, F-19-04, F-19-09; DNA-M1, M4, M5)

## 5. Findings by area

Source of truth is each area's audit file (`ui-overhaul/audit/NN-*.md`); titles are the finding headings, not re-explained. Totals: 24 areas, 640 findings (P1 117 / P2 320 / P3 203). Columns: effort XS/S/M/L; upstream = CONTRIBUTING-shaped chunk (yes / no / after #24865 merges / partly), where "no" is often "not until #24865 merges" (see the finding's own line); #24865 = addressed | partial | not addressed | conflicts. P2 and P3 appear as id lists only.

### 01 App shell

33 findings: P1 4 / P2 14 / P3 15. #24865: not addressed 31, partial 2, addressed 0, conflicts 0. Upstream-eligible: yes 15, no 17, after/partly 1.

| id      | P1 title                                                                                                             | effort | upstream | #24865        |
| ------- | -------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-01-01 | Collapsed sidebar is saved but never restored                                                                        | XS     | yes      | not addressed |
| F-01-02 | On phone-width layouts the chat header panel buttons float above the open sidebar sheet                              | XS     | yes      | not addressed |
| F-01-03 | Sidebar width and the inline right panel together squeeze the chat column to 280px and break the composer            | S      | yes      | not addressed |
| F-01-04 | Project filter is dropped on reload for repositories with a git remote, and the saved value is overwritten with null | S      | yes      | not addressed |

P2 (14): F-01-05, F-01-06, F-01-07, F-01-08, F-01-09, F-01-10, F-01-11, F-01-12, F-01-13, F-01-14, F-01-15, F-01-16, F-01-17, F-01-18

P3 (15): F-01-19, F-01-20, F-01-21, F-01-22, F-01-23, F-01-24, F-01-25, F-01-26, F-01-27, F-01-28, F-01-29, F-01-30, F-01-31, F-01-32, F-01-33

### 02 Thread list

39 findings: P1 8 / P2 18 / P3 13. #24865: not addressed 32, partial 4, addressed 3, conflicts 0. Upstream-eligible: yes 6, no 33, after/partly 0.

| id      | P1 title                                                                         | effort | upstream | #24865        |
| ------- | -------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-02-01 | Settled and Snoozed shelf rows fall below 3:1 for 14px titles and times          | XS     | no       | not addressed |
| F-02-02 | Branch, scratch-machine and worktree labels render at 1.7:1                      | XS     | no       | addressed     |
| F-02-03 | Shelf headers: 12px label at 2.3:1 and a raw blue "Snoozed"                      | XS     | no       | addressed     |
| F-02-04 | Row actions (Settle, Snooze, Wake, Un-settle) are unreachable on touch-only web  | M      | no       | not addressed |
| F-02-05 | The web context menu has no menu semantics, no focus and no arrow-key path       | M      | yes      | not addressed |
| F-02-06 | Keyboard traversal: 3 to 4 tab stops per row and no list navigation              | M      | no       | not addressed |
| F-02-07 | Row is a `role="button"` that contains buttons, and the row name omits its state | S      | no       | not addressed |
| F-02-08 | A 200-character single-word title breaks the Archive page layout                 | XS     | no       | not addressed |

P2 (18): F-02-09, F-02-10, F-02-12, F-02-13, F-02-14, F-02-15, F-02-16, F-02-17, F-02-18, F-02-19, F-02-20, F-02-22, F-02-23, F-02-25, F-02-26, F-02-27, F-02-29, F-02-30

P3 (13): F-02-11, F-02-21, F-02-24, F-02-28, F-02-31, F-02-32, F-02-33, F-02-34, F-02-35, F-02-36, F-02-37, F-02-38, F-02-39

### 03 Thread view

41 findings: P1 6 / P2 18 / P3 17. #24865: not addressed 35, partial 4, addressed 2, conflicts 0. Upstream-eligible: yes 26, no 10, after/partly 5.

| id      | P1 title                                                                                                                  | effort | upstream     | #24865        |
| ------- | ------------------------------------------------------------------------------------------------------------------------- | ------ | ------------ | ------------- |
| F-03-01 | Opening a long thread stops 156 px above the end, the last answer hides under the composer, and "Scroll to end" is absent | S      | yes          | not addressed |
| F-03-02 | A user scroll-up during a running turn is reverted, then following is disabled                                            | M      | yes          | not addressed |
| F-03-03 | A thread whose only turn exceeds the bounded window opens blank, with a divider that says "Load earlier turns"            | S      | after #24865 | not addressed |
| F-03-04 | Loading a 1 MB message blocks the main thread for 2.4 s and mounts 103,074 DOM nodes                                      | M      | no           | not addressed |
| F-03-08 | "Working for 27s" keeps ticking and shimmering while the thread is waiting for the user's approval                        | S      | yes          | not addressed |
| F-03-11 | "Copy code" and "Copy table" silently do nothing without the Clipboard API (HTTP on a LAN or Tailscale address)           | S      | yes          | not addressed |

P2 (18): F-03-05, F-03-07, F-03-09, F-03-10, F-03-12, F-03-14, F-03-15, F-03-16, F-03-19, F-03-20, F-03-23, F-03-24, F-03-25, F-03-29, F-03-30, F-03-31, F-03-32, F-03-41

P3 (17): F-03-06, F-03-13, F-03-17, F-03-18, F-03-21, F-03-22, F-03-26, F-03-27, F-03-28, F-03-33, F-03-34, F-03-35, F-03-36, F-03-37, F-03-38, F-03-39, F-03-40

### 04 Composer

42 findings: P1 3 / P2 22 / P3 17. #24865: not addressed 35, partial 4, addressed 3, conflicts 0. Upstream-eligible: yes 17, no 25, after/partly 0.

| id      | P1 title                                                                                                                             | effort | upstream | #24865        |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------ | ------ | -------- | ------------- |
| F-04-01 | The two placeholders are assigned backwards: a new thread shows the "follow-ups" string, an existing thread shows the discovery hint | XS     | no       | addressed     |
| F-04-21 | Footer and strip control text is `text-muted-foreground/70`: 2.73:1 light, 3.05:1 dark                                               | XS     | no       | partial       |
| F-04-22 | Permission mode loses its label first, and at phone width it is not visible at all                                                   | M      | no       | not addressed |

P2 (22): F-04-03, F-04-05, F-04-08, F-04-11, F-04-12, F-04-15, F-04-16, F-04-17, F-04-18, F-04-19, F-04-20, F-04-23, F-04-24, F-04-25, F-04-30, F-04-31, F-04-33, F-04-34, F-04-37, F-04-39, F-04-40, F-04-41

P3 (17): F-04-02, F-04-04, F-04-06, F-04-07, F-04-09, F-04-10, F-04-13, F-04-14, F-04-26, F-04-27, F-04-28, F-04-29, F-04-32, F-04-35, F-04-36, F-04-38, F-04-42

### 05 Diff and review

38 findings: P1 6 / P2 20 / P3 12. #24865: not addressed 36, partial 2, addressed 0, conflicts 0. Upstream-eligible: yes 27, no 11, after/partly 0.

| id      | P1 title                                                                                      | effort | upstream | #24865        |
| ------- | --------------------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-05-01 | Files that load after any fold action open expanded, ignoring "Collapsed by default"          | S      | yes      | not addressed |
| F-05-02 | Binary files show `+0 -0` and an expanded file with nothing in it                             | S      | yes      | not addressed |
| F-05-03 | The "head to base" comparator is crushed to `m... -> upstrea...` at the default panel width   | S      | yes      | not addressed |
| F-05-04 | Split layout is offered at widths where each column is about 160 px                           | S      | yes      | not addressed |
| F-05-05 | Review comments cannot be started from the keyboard                                           | M      | yes      | not addressed |
| F-05-06 | One click on the "Commit" row commits every change, with a generated message, with no preview | S      | no       | not addressed |

P2 (20): F-05-07, F-05-08, F-05-09, F-05-10, F-05-11, F-05-12, F-05-13, F-05-14, F-05-15, F-05-16, F-05-17, F-05-18, F-05-19, F-05-20, F-05-21, F-05-22, F-05-23, F-05-24, F-05-25, F-05-26

P3 (12): F-05-27, F-05-28, F-05-29, F-05-30, F-05-31, F-05-32, F-05-33, F-05-34, F-05-35, F-05-36, F-05-37, F-05-38

### 06 Terminal and panels

22 findings: P1 9 / P2 12 / P3 1. #24865: not addressed 22, partial 0, addressed 0, conflicts 0. Upstream-eligible: yes 16, no 6, after/partly 0.

| id      | P1 title                                                                                      | effort | upstream | #24865        |
| ------- | --------------------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-06-01 | Floating terminal toolbar covers output and is 21 px, icon-only                               | M      | yes      | not addressed |
| F-06-02 | Terminal list is a 144 px sidebar with double-height rows; the 6th terminal is below the fold | M      | no       | not addressed |
| F-06-03 | Drag-selecting text pops "Add to chat / Copy"; Esc and Cmd+C do not dismiss it                | S      | yes      | not addressed |
| F-06-04 | ANSI palette is hard-coded and fails contrast; ignores named themes                           | M      | yes      | not addressed |
| F-06-05 | Web advertises browser-reserved chords (Cmd+W, Cmd+N, Cmd+T, Cmd+Shift+T)                     | S      | yes      | not addressed |
| F-06-06 | Terminal and drawer expose almost nothing to assistive tech                                   | M      | no       | not addressed |
| F-06-07 | Right-panel tabs are not tabs to assistive tech or the keyboard                               | M      | yes      | not addressed |
| F-06-08 | On touch, tapping a tab's icon closes it instantly; the X is never shown                      | S      | yes      | not addressed |
| F-06-09 | A file tab with the explorer open leaves the editor 80-284 px wide                            | S      | yes      | not addressed |

P2 (12): F-06-10, F-06-11, F-06-12, F-06-13, F-06-14, F-06-15, F-06-16, F-06-17, F-06-18, F-06-19, F-06-20, F-06-21

P3 (1): F-06-22

### 07 Settings: appearance

39 findings: P1 7 / P2 20 / P3 12. #24865: not addressed 37, partial 2, addressed 0, conflicts 0. Upstream-eligible: yes 28, no 11, after/partly 0.

| id      | P1 title                                                                                                                           | effort | upstream | #24865        |
| ------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-07-01 | Esc while inspecting cancels the inspector and also closes Settings                                                                | XS     | yes      | not addressed |
| F-07-06 | Below 768 px the Settings nav is an unlabeled icon rail with 2.27:1 icons, 39x32 targets and no tooltips                           | S      | no       | partial       |
| F-07-13 | One out-of-range or unreadable value in saved client settings locks the whole app behind "Could not read settings" with only Retry | M      | yes      | not addressed |
| F-07-16 | In Windows high-contrast (forced-colors) every Switch disappears                                                                   | XS     | yes      | not addressed |
| F-07-17 | In forced-colors the Color scheme tiles, theme orbs and wireframes are blank, and the selected tile cannot be told apart           | S      | yes      | not addressed |
| F-07-30 | Importing a VS Code theme fails for ordinary VS Code theme files (JSONC) with raw engine errors                                    | S      | yes      | not addressed |
| F-07-37 | Diagnostics uses 10-11 px text at 1.84-2.7:1                                                                                       | S      | yes      | not addressed |

P2 (20): F-07-02, F-07-03, F-07-04, F-07-05, F-07-07, F-07-08, F-07-12, F-07-14, F-07-15, F-07-18, F-07-19, F-07-20, F-07-21, F-07-26, F-07-27, F-07-28, F-07-31, F-07-32, F-07-33, F-07-38

P3 (12): F-07-09, F-07-10, F-07-11, F-07-22, F-07-23, F-07-24, F-07-25, F-07-29, F-07-34, F-07-35, F-07-36, F-07-39

### 08 Settings: project and keybindings

47 findings: P1 3 / P2 31 / P3 13. #24865: not addressed 44, partial 3, addressed 0, conflicts 0. Upstream-eligible: yes 37, no 10, after/partly 0.

| id      | P1 title                                                                               | effort | upstream | #24865        |
| ------- | -------------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-08-01 | "Restore device defaults" rewrites environment settings on every connected environment | M      | no       | partial       |
| F-08-08 | Commit-on-blur fields silently lose typed text when Settings closes with Esc           | S      | yes      | not addressed |
| F-08-40 | Cleanup rules and "Delete now" delete worktrees with no confirmation or preview        | M      | yes      | not addressed |

P2 (31): F-08-02, F-08-03, F-08-04, F-08-05, F-08-07, F-08-09, F-08-10, F-08-13, F-08-14, F-08-15, F-08-17, F-08-18, F-08-19, F-08-20, F-08-21, F-08-23, F-08-24, F-08-25, F-08-26, F-08-27, F-08-28, F-08-29, F-08-30, F-08-31, F-08-32, F-08-33, F-08-34, F-08-38, F-08-42, F-08-43, F-08-44

P3 (13): F-08-06, F-08-11, F-08-12, F-08-16, F-08-22, F-08-35, F-08-36, F-08-37, F-08-39, F-08-41, F-08-45, F-08-46, F-08-47

### 09 Providers and auth

39 findings: P1 12 / P2 19 / P3 8. #24865: not addressed 36, partial 3, addressed 0, conflicts 0. Upstream-eligible: yes 37, no 2, after/partly 0.

| id      | P1 title                                                                                                        | effort | upstream | #24865        |
| ------- | --------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-09-01 | Selecting a provider on a narrow layout gives no visible result                                                 | S      | yes      | not addressed |
| F-09-02 | Model rows collapse to "Claud…" at phone width                                                                  | M      | yes      | not addressed |
| F-09-03 | Touch targets in the provider list and model rows are below 44px or overlap                                     | S      | yes      | not addressed |
| F-09-04 | Provider list titles truncate to "Claude P…" and "Cl…"                                                          | S      | yes      | not addressed |
| F-09-05 | "Add provider" in the list has no focus ring                                                                    | XS     | yes      | not addressed |
| F-09-07 | A provider that is not installed has no install or setup action                                                 | M      | yes      | not addressed |
| F-09-09 | The shown re-auth command signs in the wrong account for a custom config directory                              | S      | yes      | not addressed |
| F-09-15 | Deleting an instance and resetting a default instance are immediate and unrecoverable                           | S      | yes      | not addressed |
| F-09-17 | Under a project scope the page says "Applying settings for {project}" but only the enable switch is per project | XS     | yes      | not addressed |
| F-09-19 | `Provider instance "x" is disabled for project <uuid>` is raised when the instance does not exist               | S      | yes      | not addressed |
| F-09-20 | With no usable provider the send button says "Environment disconnected" and Enter does nothing                  | S      | yes      | partial       |
| F-09-21 | The thread shows a raw provider session id instead of the cause                                                 | S      | yes      | not addressed |

P2 (19): F-09-06, F-09-08, F-09-10, F-09-11, F-09-12, F-09-13, F-09-14, F-09-18, F-09-22, F-09-23, F-09-24, F-09-26, F-09-27, F-09-28, F-09-29, F-09-33, F-09-34, F-09-38, F-09-39

P3 (8): F-09-16, F-09-25, F-09-30, F-09-31, F-09-32, F-09-35, F-09-36, F-09-37

### 10 First run and empty states

37 findings: P1 8 / P2 17 / P3 12. #24865: not addressed 35, partial 1, addressed 1, conflicts 0. Upstream-eligible: yes 31, no 6, after/partly 0.

| id      | P1 title                                                                                                                   | effort | upstream | #24865        |
| ------- | -------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-10-01 | Web-mode first launch never shows the wizard: the server never sends `bootstrapProjectCreated` or `bootstrapThreadCreated` | XS     | yes      | not addressed |
| F-10-02 | Nothing in the app leads back to setup or project import after first run                                                   | S      | yes      | not addressed |
| F-10-03 | `/` lands on an arbitrary existing thread (the server's bootstrap thread), not a draft                                     | XS     | yes      | not addressed |
| F-10-04 | `/new` without a prompt is a dead-end error page with no chrome and no action                                              | XS     | yes      | not addressed |
| F-10-05 | The two first-run recovery cards have no drag region: on desktop the window cannot be moved                                | XS     | yes      | not addressed |
| F-10-06 | The recovery cards dead-end                                                                                                | S      | yes      | not addressed |
| F-10-07 | Import step with nothing to import: disabled primary, refusal-worded exit (code-read)                                      | S      | yes      | not addressed |
| F-10-08 | "Send a message to start the conversation." renders at 1.47:1 (light) and 1.44:1 (dark)                                    | XS     | no       | addressed     |

P2 (17): F-10-09, F-10-10, F-10-11, F-10-12, F-10-13, F-10-14, F-10-15, F-10-16, F-10-17, F-10-18, F-10-19, F-10-20, F-10-21, F-10-22, F-10-23, F-10-24, F-10-25

P3 (12): F-10-26, F-10-27, F-10-28, F-10-29, F-10-30, F-10-31, F-10-32, F-10-33, F-10-34, F-10-35, F-10-36, F-10-37

### 11 Remote access and pairing

20 findings: P1 9 / P2 11 / P3 0. #24865: not addressed 19, partial 1, addressed 0, conflicts 0. Upstream-eligible: yes 18, no 2, after/partly 0.

| id      | P1 title                                                                                                       | effort | upstream | #24865        |
| ------- | -------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-11-02 | A mistyped, consumed and expired token all say "Check the token and try again"                                 | XS     | yes      | not addressed |
| F-11-03 | The pairing code is case-sensitive but the field turns auto-capitalisation off                                 | S      | yes      | not addressed |
| F-11-07 | Opening a pairing link in an already-paired browser redeems it and revokes that browser's session              | M      | yes      | not addressed |
| F-11-13 | Revoke and "Revoke others" are immediate with no confirm, and unlabeled clients look identical                 | S      | yes      | not addressed |
| F-11-14 | The "Authorized clients" header overlaps its own title below about 520 px                                      | XS     | yes      | not addressed |
| F-11-16 | There is no app-level connection indicator, and the machine section keeps saying "Up to date" during an outage | M      | no       | not addressed |
| F-11-17 | The "reconnecting" banner has no retry, no countdown, and recovery lags up to 5 minutes (#22024)               | S      | yes      | not addressed |
| F-11-18 | A revoked session shows "reconnecting / did not answer" forever and never routes to `/pair`                    | M      | yes      | not addressed |
| F-11-19 | The per-server "Update" button restarts a server with no confirmation and no running-thread count              | M      | yes      | not addressed |

P2 (11): F-11-01, F-11-04, F-11-05, F-11-06, F-11-08, F-11-09, F-11-10, F-11-11, F-11-12, F-11-15, F-11-20

P3 (0): none

### 12 Notifications, errors, toasts

40 findings: P1 7 / P2 17 / P3 16. #24865: not addressed 38, partial 2, addressed 0, conflicts 0. Upstream-eligible: yes 32, no 8, after/partly 0.

| id      | P1 title                                                                                          | effort | upstream | #24865        |
| ------- | ------------------------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-12-01 | Collapsed toast stack hides older errors, warnings and actionable notices while their timers run  | S      | yes      | not addressed |
| F-12-02 | Every toast defaults to 5 s: 299 of 302 error toasts vanish before a long message can be read     | S      | yes      | not addressed |
| F-12-03 | Composer failures appear in the thread-level banner at the top of the chat, one message at a time | M      | no       | not addressed |
| F-12-04 | Destructive filled button is white on `#fb2c36` / `#fb414a`: 3.81:1 and 3.53:1                    | XS     | no       | not addressed |
| F-12-05 | Undo notice: fixed 5 s, ignores hover and focus, 16 px target, 11 px text, names no thread        | S      | yes      | not addressed |
| F-12-06 | MCP app approval dialog shows tool arguments in proportional type with indentation collapsed      | S      | yes      | not addressed |
| F-12-07 | One route-level error component: a render error anywhere replaces the whole shell                 | M      | yes      | not addressed |

P2 (17): F-12-08, F-12-09, F-12-10, F-12-11, F-12-12, F-12-13, F-12-14, F-12-15, F-12-16, F-12-17, F-12-18, F-12-19, F-12-20, F-12-21, F-12-22, F-12-23, F-12-24

P3 (16): F-12-25, F-12-26, F-12-27, F-12-28, F-12-29, F-12-30, F-12-31, F-12-32, F-12-33, F-12-34, F-12-35, F-12-36, F-12-37, F-12-38, F-12-39, F-12-40

### 13 Loading and skeletons

20 findings: P1 8 / P2 11 / P3 1. #24865: not addressed 20, partial 0, addressed 0, conflicts 0. Upstream-eligible: yes 20, no 0, after/partly 0.

| id      | P1 title                                                                                                               | effort | upstream | #24865        |
| ------- | ---------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-13-01 | Returning users see "No projects yet / Add project" until the shell snapshot arrives                                   | S      | yes      | not addressed |
| F-13-02 | React mount removes the splash before there is anything to show; the page goes blank                                   | S      | yes      | not addressed |
| F-13-03 | "Still connecting / Reload" fires on a fixed 4 s timer and is wrong on slow links                                      | M      | yes      | not addressed |
| F-13-04 | Splash: 114 kB PNG logo, white for 1.4 s on Slow 4G, then a static logo for 13+ s with no status                       | S      | yes      | not addressed |
| F-13-05 | Usage page states three different false things while loading                                                           | S      | yes      | not addressed |
| F-13-06 | Diff panel shows plain "Loading code..." (no skeleton, no headers) while the highlight workers boot: 10.4 s on Slow 4G | S      | yes      | not addressed |
| F-13-07 | "Load earlier turns" failure prints the raw transport error with the request URL and cursor                            | XS     | yes      | not addressed |
| F-13-08 | Thread timeline has no loading state: a blank div, and the only cue is a small banner after 400 ms                     | S      | yes      | not addressed |

P2 (11): F-13-09, F-13-10, F-13-11, F-13-12, F-13-13, F-13-14, F-13-15, F-13-16, F-13-17, F-13-18, F-13-19

P3 (1): F-13-20

### 14 Desktop-specific

33 findings: P1 3 / P2 15 / P3 15. #24865: not addressed 33, partial 0, addressed 0, conflicts 0. Upstream-eligible: yes 24, no 9, after/partly 0.

| id      | P1 title                                                                             | effort | upstream | #24865        |
| ------- | ------------------------------------------------------------------------------------ | ------ | -------- | ------------- |
| F-14-01 | Closing the window quits the app and stops the backend with no confirmation (#10161) | M      | no       | not addressed |
| F-14-02 | A backend restart re-opens a window the user closed and steals focus (#24101)        | S      | yes      | not addressed |
| F-14-03 | No window, splash or error while the backend starts; crash loops are silent          | S      | yes      | not addressed |

P2 (15): F-14-04, F-14-05, F-14-06, F-14-07, F-14-08, F-14-09, F-14-10, F-14-12, F-14-13, F-14-16, F-14-17, F-14-18, F-14-20, F-14-23, F-14-26

P3 (15): F-14-11, F-14-14, F-14-15, F-14-19, F-14-21, F-14-22, F-14-24, F-14-25, F-14-27, F-14-28, F-14-29, F-14-30, F-14-31, F-14-32, F-14-33

### 15 Mobile

19 findings: P1 6 / P2 11 / P3 2. #24865: not addressed 18, partial 1, addressed 0, conflicts 0. Upstream-eligible: yes 17, no 2, after/partly 0.

| id      | P1 title                                                                                                     | effort | upstream | #24865        |
| ------- | ------------------------------------------------------------------------------------------------------------ | ------ | -------- | ------------- |
| F-15-01 | Native crash "[RNScreens] Stack should never be empty after updates"                                         | S      | no       | not addressed |
| F-15-02 | Closing search with X leaves the query silently filtering the thread list                                    | S      | yes      | not addressed |
| F-15-03 | Workspace tab bar and compose button float over the thread composer when a thread is opened from another tab | S      | yes      | not addressed |
| F-15-04 | Native diff view exposes nothing to VoiceOver or TalkBack                                                    | M      | yes      | not addressed |
| F-15-05 | Thread rows announce only the title                                                                          | S      | yes      | not addressed |
| F-15-06 | Add environment: error text is hidden behind the keyboard and says nothing actionable                        | S      | yes      | not addressed |

P2 (11): F-15-07, F-15-08, F-15-09, F-15-10, F-15-11, F-15-12, F-15-13, F-15-14, F-15-15, F-15-16, F-15-17

P3 (2): F-15-18, F-15-19

### 16 Accessibility

21 findings: P1 6 / P2 14 / P3 1. #24865: not addressed 16, partial 3, addressed 0, conflicts 2. Upstream-eligible: yes 15, no 6, after/partly 0.

| id      | P1 title                                                                                                                 | effort | upstream | #24865        |
| ------- | ------------------------------------------------------------------------------------------------------------------------ | ------ | -------- | ------------- |
| F-16-01 | Keyboard highlight in every popup list is an 8% fill (1.04 to 1.22:1)                                                    | S      | yes      | not addressed |
| F-16-02 | In forced-colors (Windows High Contrast) keyboard focus is invisible on Buttons, Switches, Selects and theme cards       | XS     | yes      | not addressed |
| F-16-03 | Sidebar thread search shows no focus indicator                                                                           | XS     | yes      | not addressed |
| F-16-04 | The branch picker combobox has no accessible name (axe `button-name`, critical)                                          | XS     | yes      | not addressed |
| F-16-05 | Terminal output is a canvas with no accessible text                                                                      | L      | no       | not addressed |
| F-16-06 | All 14 opacity steps on muted text fail 4.5:1; 175 sites use them (192 with sidebar-muted, secondary-label, placeholder) | M      | yes      | partial       |

P2 (14): F-16-07, F-16-08, F-16-09, F-16-10, F-16-11, F-16-12, F-16-13, F-16-14, F-16-15, F-16-16, F-16-17, F-16-18, F-16-20, F-16-21

P3 (1): F-16-19

### 17 Typography and hierarchy

14 findings: P1 2 / P2 7 / P3 5. #24865: not addressed 10, partial 4, addressed 0, conflicts 0. Upstream-eligible: yes 13, no 1, after/partly 0.

| id      | P1 title                                                                                                                | effort | upstream | #24865  |
| ------- | ----------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------- |
| F-17-01 | "A title" has twelve treatments, and four settings group titles still read lighter than the rows they head after #24865 | S      | yes      | partial |
| F-17-02 | Neutral text has 11 grey levels across 7 views; hierarchy leans on alpha steps instead of size and weight               | L      | yes      | partial |

P2 (7): F-17-03, F-17-04, F-17-05, F-17-06, F-17-07, F-17-08, F-17-09

P3 (5): F-17-10, F-17-11, F-17-12, F-17-13, F-17-14

### 18 Shape, spacing, elevation

9 findings: P1 1 / P2 4 / P3 4. #24865: not addressed 5, partial 3, addressed 0, conflicts 1. Upstream-eligible: yes 7, no 2, after/partly 0.

| id      | P1 title                                                                                             | effort | upstream | #24865        |
| ------- | ---------------------------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-18-01 | Touch hit areas below DNA-D4: the switch is 38x22 with no expansion, and four other controls miss it | S      | yes      | not addressed |

P2 (4): F-18-02, F-18-03, F-18-04, F-18-05

P3 (4): F-18-06, F-18-07, F-18-08, F-18-09

### 19 Motion

13 findings: P1 0 / P2 4 / P3 9. #24865: not addressed 13, partial 0, addressed 0, conflicts 0. Upstream-eligible: yes 12, no 1, after/partly 0.

No P1 findings.

P2 (4): F-19-01, F-19-02, F-19-03, F-19-06

P3 (9): F-19-04, F-19-05, F-19-07, F-19-08, F-19-09, F-19-10, F-19-11, F-19-12, F-19-13

### 20 Copy and voice

19 findings: P1 1 / P2 8 / P3 10. #24865: not addressed 18, partial 1, addressed 0, conflicts 0. Upstream-eligible: yes 19, no 0, after/partly 0.

| id      | P1 title                                                                   | effort | upstream | #24865        |
| ------- | -------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-20-01 | Provider-disabled error shows an id the user cannot use and a project UUID | XS     | yes      | not addressed |

P2 (8): F-20-02, F-20-03, F-20-04, F-20-05, F-20-06, F-20-07, F-20-08, F-20-09

P3 (10): F-20-10, F-20-11, F-20-12, F-20-13, F-20-14, F-20-15, F-20-16, F-20-17, F-20-18, F-20-19

### 21 Keyboard shortcuts UX

20 findings: P1 2 / P2 11 / P3 7. #24865: not addressed 19, partial 1, addressed 0, conflicts 0. Upstream-eligible: yes 11, no 8, after/partly 1.

| id      | P1 title                                                                            | effort | upstream | #24865        |
| ------- | ----------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-21-01 | There is no way inside the app to learn the keymap, and `?` types into the composer | M      | no       | not addressed |
| F-21-08 | On Windows and Linux the terminal loses Ctrl+W, Ctrl+D, Ctrl+N and Ctrl+B           | M      | no       | not addressed |

P2 (11): F-21-02, F-21-03, F-21-04, F-21-05, F-21-06, F-21-07, F-21-10, F-21-12, F-21-13, F-21-14, F-21-15

P3 (7): F-21-09, F-21-11, F-21-16, F-21-17, F-21-18, F-21-19, F-21-20

### 22 Performance feel

8 findings: P1 1, P2 4, P3 3. Measured last, alone on the server (medians of 3 runs, dev server and production build through a static proxy, 1× and 4× CPU; harness `ui-overhaul/screens/22/measure.mjs`). Typing and send paths are already fast (≈1 frame up to a 50,000-char draft; optimistic send bubble within a frame); the problems are blocking work, a per-thread memory leak and slow-CPU behaviour.

| id      | title                                                                                                                           | effort | upstream | #24865        |
| ------- | ------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-22-01 | The 1 MB assistant message freezes the page for 0.85 s (prod) and keeps 103k nodes mounted (adds production numbers to F-03-04) | M      | yes      | not addressed |

P2: F-22-02 (thread switch inside the click task, 160–280 ms to next paint at 4×), F-22-03 (detached timeline per visited thread, +14 MB / +660 listeners per 30), F-22-04 (theme switch 70–90 ms stall from forced style flushes), F-22-05 (palette typing 17–20 ms main thread per key). P3: F-22-06, F-22-07, F-22-08.

### 23 Customisation gap

11 findings: P1 0 / P2 5 / P3 6. #24865: not addressed 11, partial 0, addressed 0, conflicts 0. Upstream-eligible: yes 2, no 9, after/partly 0.

No P1 findings.

P2 (5): F-23-01, F-23-02, F-23-03, F-23-04, F-23-07

P3 (6): F-23-05, F-23-06, F-23-08, F-23-09, F-23-10, F-23-11

### 24 Onboarding gap

16 findings: P1 5 / P2 7 / P3 4. #24865: not addressed 14, partial 2, addressed 0, conflicts 0. Upstream-eligible: yes 11, no 5, after/partly 0.

| id      | P1 title                                                                                                                         | effort | upstream | #24865        |
| ------- | -------------------------------------------------------------------------------------------------------------------------------- | ------ | -------- | ------------- |
| F-24-01 | Mobile first launch never says a computer must run T3 Code; the T3 Connect sheet says "No additional linked cloud environments." | S      | yes      | not addressed |
| F-24-02 | Mobile "No projects found" is a dead end although Add project exists                                                             | XS     | yes      | not addressed |
| F-24-03 | The agents step knows two of eight providers; users of any other agent see two Install buttons and no way forward                | S      | yes      | not addressed |
| F-24-04 | New threads default to Full access and first run never says so                                                                   | S      | yes      | not addressed |
| F-24-05 | No entry point leads to the wizard's agents step when a provider is missing, although `/welcome#agents:<id>` already opens it    | M      | yes      | partial       |

P2 (7): F-24-06, F-24-07, F-24-08, F-24-09, F-24-10, F-24-11, F-24-12

P3 (4): F-24-13, F-24-14, F-24-15, F-24-16

## 6. Edge-case matrix

Consolidated from each audit's edge-case section (extracted per file with sed/awk; areas 12, 14 and 21 number their headings, area 22 has none). Rows follow `audit/_PROTOCOL.md`; adjacent rows with the same result are merged.

Legend: **OK** = PASS (area numbers in brackets); **F-xx-nn** = FAIL, finding id; **N/T** = not tested (the host cannot produce it, reason in the audit); **N/A** = does not apply to that surface; **(code)** = code-read only; **= web** = the Electron renderer shows the web UI, area 14 did not repeat the row. Columns: **Web** = Chromium on `localhost:5733` (areas 01-13, 16-24, includes phone-width web at 390x844); **Desktop** = Electron dev app, area 14 only (macOS live; Windows and Linux code-read); **Mobile** = native iOS simulator, area 15 only (Android code-read or N/T), plus onboarding area 24.

### Data

| Row                                             | Web                                                                                                                                                                                                                 | Desktop                            | Mobile                      |
| ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- | --------------------------- |
| Empty                                           | F-02-28 (code), F-04-11, F-09-07, F-09-34, F-10-01, F-13-01, F-24-08; OK 07, 08, 11                                                                                                                                 | OK (wizard over shell)             | OK (home); F-24-01, F-24-02 |
| One item                                        | OK 03-09, 12; F-10-16, F-24-06 (single computer)                                                                                                                                                                    | N/A                                | OK                          |
| 100+ items                                      | F-02-30 (DOM weight), F-05-01, F-05-09, F-05-11 (211 files), F-06-02 (11 terminals), F-07-19, F-07-20 (66 themes), F-08-32 (82 keybindings), F-09-02 (13 models, phone width); OK 01, 04, 13; F-03-07 manual paging | = web                              | OK (virtualised)            |
| 10,000+ items                                   | N/T (no fixture); F-02-30 (code, active list unwindowed), F-01-25 (per-thread keys unbounded)                                                                                                                       | N/A                                | N/T                         |
| Very long names (200-char path, 500-char title) | F-01-14, F-02-08, F-02-15, F-07-20, F-09-04, F-10-30; OK 01, 02 (sidebar), 04, 08, 12                                                                                                                               | N/A (window title pinned, F-14-30) | OK                          |
| Unicode and emoji                               | F-07-31; OK 01, 02, 03, 04, 08, 10, 12                                                                                                                                                                              | N/A                                | OK                          |
| RTL                                             | F-12-39; OK 01, 02, 03, 04, 10 (mirrored shell layout N/T, no RTL locale)                                                                                                                                           | N/A                                | OK (visual)                 |
| Leading and trailing whitespace                 | OK 01, 02, 04, 07, 08                                                                                                                                                                                               | N/A                                | N/T                         |
| Whitespace-only names                           | F-01-23, F-02-19, F-08-08; OK 04, 07                                                                                                                                                                                | N/A                                | N/T                         |

### Content

| Row                                      | Web                                                                           | Desktop                                     | Mobile            |
| ---------------------------------------- | ----------------------------------------------------------------------------- | ------------------------------------------- | ----------------- |
| 5k-line diff                             | OK 05 (98 ms, 60 fps); 5,000-line code block F-03-05                          | = web                                       | N/T               |
| 200-file diff                            | F-05-01, F-05-09, F-05-11, F-05-17, F-13-06                                   | = web                                       | N/T               |
| Binary files                             | F-05-02; OK composer attach (04)                                              | = web                                       | N/T               |
| Renamed files                            | F-05-10                                                                       | = web                                       | N/T               |
| Huge single tool output (1 MB)           | F-03-03, F-03-04 (1 MB assistant message); tool output N/T (code: `max-h-80`) | = web                                       | N/T               |
| Nested code blocks                       | N/T live (03); nested lists F-04-08, F-04-09                                  | = web                                       | N/T               |
| Unterminated fences in streamed markdown | OK final state (03, 04); mid-stream N/T                                       | = web                                       | N/T               |
| Tables                                   | F-03-06 (201 rows), F-03-11 (copy no-op without Clipboard API)                | = web                                       | OK (seed threads) |
| Images in messages                       | F-03-38, F-05-02 (diff image); OK composer paste (04)                         | = web (native Copy Image OK, code)          | N/T               |
| Links                                    | F-03-19, F-03-20                                                              | F-14-27 (native menu offers Copy Link only) | OK                |
| Very long single-line strings            | F-02-08, F-05-30, F-10-30; OK 03, 04, 17                                      | = web                                       | N/T               |

### Network and agents

| Row                               | Web                                                                                           | Desktop                                       | Mobile           |
| --------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------- | ---------------- |
| Provider not installed            | F-09-07, F-09-08, F-09-21, F-09-22, F-04-30, F-24-03, F-24-05, F-24-07; wizard F-10-15 (code) | N/T (both providers Ready on host)            | F-15-17          |
| Installed but logged out          | F-09-09, F-09-10, F-09-22, F-24-05                                                            | N/T                                           | N/T              |
| Auth expired mid-session          | F-11-18; F-09-22 (code)                                                                       | N/A (areas 09, 11)                            | N/T              |
| Stream stalls                     | F-11-17 (19 s silent); OK 13 (honest after 19.3 s); F-12-20 (code)                            | N/A                                           | N/T              |
| Stream cancelled mid-token        | N/T (03, 04, 12)                                                                              | N/A                                           | N/T              |
| Permission prompt mid-stream      | F-03-08, F-03-09, F-03-10; F-04-41, F-16-21 (code); OK pill seen (02)                         | N/A                                           | N/T              |
| Two threads streaming             | OK incidental (01, 02, 03, 12)                                                                | N/A                                           | N/T              |
| Six threads streaming             | N/T (turn budget)                                                                             | N/T                                           | N/T              |
| Relay disconnected                | F-10-06, F-10-09 (reproduced), F-11-16, F-11-17                                               | N/A (area 11)                                 | partial: F-15-12 |
| Reconnect after sleep             | N/T (host cannot sleep); `wakeups.ts` read only                                               | N/T                                           | N/T              |
| Server restarted under the client | F-11-16, F-11-17 (simulated), F-13-15                                                         | F-14-02 (closed window reopens, steals focus) | N/T              |
| Version mismatch app and server   | F-11-19 (stub); copy code-read                                                                | N/T                                           | N/T              |

### Git

| Row                                                                        | Web                                                                       | Desktop | Mobile |
| -------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------- | ------ |
| No repo                                                                    | F-10-19, F-10-21, F-10-22, F-05-19 (code); OK 04 (strip absent)           | N/A     | N/T    |
| Repo with uncommitted changes                                              | OK 05                                                                     | N/A     | N/T    |
| Detached HEAD                                                              | F-05-22 (code)                                                            | N/A     | N/T    |
| Worktree creation failure, push rejected, merge conflict, branch collision | N/T (05, 08); F-05-35 (create-ref path observed); F-20-07 (wording, code) | N/A     | N/T    |
| No GitHub auth when creating a PR                                          | N/T (no remote); F-05-24, F-05-25 (code)                                  | N/A     | N/T    |

### Viewport

| Row                             | Web                                                                                                                                                                                               | Desktop                                                                | Mobile                                  |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------------------------------- |
| 1440x900                        | OK with findings (every area)                                                                                                                                                                     | N/A (default 1100x780)                                                 | N/A                                     |
| 1280x720                        | F-12-37; OK 01, 04, 05, 07, 18                                                                                                                                                                    | N/T (1100 and 840 bracket it)                                          | N/A                                     |
| 1024x640                        | F-01-03, F-01-12, F-03-32, F-09-01, F-09-04, F-09-33; OK 04, 05, 07, 08                                                                                                                           | F-14-05 (traffic lights collide with modal, 840-1023)                  | N/A                                     |
| 800x600                         | F-01-11, F-01-12, F-04-22, F-05-12, F-06-09, F-07-12, F-07-15, F-09-01, F-10-12; OK 02, 03, 08, 12                                                                                                | N/A (minimum 840x620); F-14-06 reachable via app zoom                  | N/A                                     |
| Ultrawide 3440x1440             | OK 01, 03, 04, 06, 07, 09, 10, 11; N/T 05, 12, 13                                                                                                                                                 | N/T (no second display)                                                | N/A                                     |
| Mobile 390x844, keyboard closed | F-01-02, F-01-21, F-03-23, F-03-24, F-04-18, F-04-22, F-04-23, F-04-24, F-07-06, F-09-01, F-09-02, F-09-03, F-10-14, F-11-14, F-12-01, F-12-23, F-12-38, F-18-01, F-21-07, F-21-19; OK 02 (sheet) | N/A                                                                    | OK iPhone 17 portrait; F-15-03, F-15-09 |
| Mobile 390x844, keyboard open   | N/T (no soft keyboard in Playwright; 390x460 stand-in only)                                                                                                                                       | N/A                                                                    | OK thread composer; F-15-06, F-15-14    |
| OS zoom 80 / 125 / 150%         | 125% emulated OK (01, 07); 80 and 150 N/T                                                                                                                                                         | F-14-06 (app zoom +2 levels, full-bleed Settings); Windows scaling N/T | F-15-10 (Dynamic Type)                  |
| Browser zoom 50% / 200%         | 50% OK (01, 07, 09); 200%: F-07-06, F-09-01, F-10-12; OK 01, 04, 07                                                                                                                               | N/A                                                                    | N/A                                     |

### Preferences

| Row                              | Web                                                                                                                                                                                                    | Desktop                                              | Mobile                                       |
| -------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------- | -------------------------------------------- |
| Light                            | OK (contrast ids under area 16 apply)                                                                                                                                                                  | OK                                                   | OK                                           |
| Dark                             | OK; F-01-16 (sheet paints #111)                                                                                                                                                                        | OK; F-14-14 (quit overlay inverts)                   | OK                                           |
| System switching live            | OK 03, 07; N/T 01, 04, 05, 09, 12                                                                                                                                                                      | N/T (no OS permission)                               | OK                                           |
| Every named theme                | OK 01, 07; F-06-04 (ANSI palette), F-07-18; N/T 02-05, 09, 12                                                                                                                                          | F-14-29 (Grove: native background stays #0A0A0A)     | listed, not each walked; Material You N/T    |
| Reduced motion                   | F-19-02, F-01-31, F-04-19, F-07-27, F-12-16, F-13-16, F-16-13, F-23-05; panels OK                                                                                                                      | F-14-03 (splash spinner)                             | iOS OK (code); F-15-16 (Android, N/T)        |
| High contrast and forced colours | F-16-02, F-07-16, F-07-17, F-03-28, F-02-25; OK 12; 19 (code)                                                                                                                                          | N/T (no Windows)                                     | N/T                                          |
| Keyboard only                    | F-01-06, F-01-09, F-01-28, F-02-05, F-02-06, F-05-05, F-06-03, F-06-06, F-06-07, F-07-03, F-07-07, F-07-21, F-09-05, F-09-06, F-10-10, F-10-11, F-11-05, F-16-01, F-21-09, F-21-14, F-24-10; OK 04, 12 | F-14-16 (menu discoverability); OK Settings via menu | N/T                                          |
| Screen reader                    | N/T (no AT on host; AX tree only): F-02-07, F-06-06, F-07-04, F-10-34, F-16-04, F-16-05, F-16-15                                                                                                       | F-14-13                                              | OK labels (VoiceOver tree); F-15-04, F-15-05 |
| Font size overrides              | OK 02, 03, 07 (12 and 20px), 17 (12/16/20); F-07-12, F-07-28, F-17-09; N/T 05, 09, 12                                                                                                                  | N/A                                                  | F-15-10                                      |

### Lifecycle

| Row                                 | Web                                                                               | Desktop                                                               | Mobile                         |
| ----------------------------------- | --------------------------------------------------------------------------------- | --------------------------------------------------------------------- | ------------------------------ |
| First ever launch                   | F-10-01, F-10-02, F-10-03, F-13-02, F-13-03, F-24-04, F-21-01; OK 07 (boot theme) | OK (wizard shows); F-14-03 (no window or splash while backend starts) | OK flow (15); F-24-01, F-24-02 |
| Launch after update                 | F-07-13 (simulated), F-20-16, F-23-04, F-24-16; OK 10 (code)                      | N/T (needs signed build); notice read in code                         | N/T                            |
| Corrupted settings file             | F-07-13, F-10-06, F-08-34 (code); OK corrupted theme library (07)                 | F-14-32 (`desktop-settings.json` silently resets), F-07-13            | N/T                            |
| Launch while server already running | N/A                                                                               | F-14-20 (code: 519-char native box, then quit)                        | N/A                            |
| Backgrounded for an hour, resumed   | N/T; F-12-05 (undo expires on wall time, code)                                    | N/T (needs 5+ min hidden, #21235)                                     | 6 s OK; 1 h N/T                |
| Window minimised during stream      | N/T (notification path code-read, 12)                                             | N/T                                                                   | N/A                            |
| OS sleep during stream              | N/T (host)                                                                        | N/T                                                                   | N/T                            |

Coverage: Web cells are populated for most rows; Desktop and Mobile columns rest on two audits each (14, 15) plus 24, so "= web" and "N/T" dominate them.

### Gaps in part A

- Area 22 (performance feel): landed after this part was drafted (8 findings: P1 1, P2 4, P3 3); §1 and §5 totals updated to 640 and the §5 area section filled. §6 has no dedicated performance row; the edge states it covers are the 1 MB message (F-22-01, with F-03-04) and many visited threads (F-22-03), both recorded in `audit/22-performance-feel.md` "Edge-case results".
- `_FINDINGS-INDEX.md` truncates the upstream, #24865 and surface columns (for example "partial (root", "S (", "too"). Counts and tags here were re-derived from the `- Severity/Effort/Upstream-eligible/#24865` lines of the audit files; they match the index on all 632 ids and severities. Upstream values were normalised to yes / no / after #24865 / partly (5 "after", 2 "partly", incl. F-01-15 and F-21-13).
- Section 6 is my consolidation of free-text edge-case sections (areas 01-05, 07-10, 13, 15, 24 are prose lists; 12 and 14 are long tables). "OK" lists name only areas that reported PASS for that row; silence in an area is not PASS. Rows with identical results were merged (worktree failure, push rejected, merge conflict, branch collision; OK 03-09 for "one item"). Desktop and Mobile columns rest on areas 14 and 15 (plus 24); "= web" means area 14 declared the row renderer-owned and did not retest it.
- Section 3: `#a3a3a3` on `#0a0a0a` = 7.85:1 is computed here; all other contrast figures are copied from audits 02, 07, 16, 17. File:line references are against main @5f64c5eb and will move once #24865 merges. The "#24865" column uses the audit tags plus the diff hunks I read (`pr-24865.diff` index.css hunks, lines ~1795-1935); the other 54 files were not re-read.
- Section 3 deliberately proposes no spacing-scale change (audit 18 found none needed) and no mobile type, colour or spacing change (DNA-X3). Mobile appears only in radius (F-18-05) and motion (F-19-13).
- F-19-04 (ease-in on exit everywhere) is included in 3.6 because the brief asks for it, but the audit marks it not upstream-eligible (global feel change; open an issue first). F-10-01 and F-10-03 depend on a server change (`apps/server`), outside UI scope; the UI half is gated.
- The top-10 ranking and its impact x breadth scores are a judgment from audit evidence; no usage telemetry was available. Finding groups overlap by design (for example F-03-11 sits in row 2, F-02-04 in row 5, not row 9).
- DNA.md: all 110 rule lines were read; the narrative tables (2.1-2.6, 5.2, 6.1, 8.1, 14) were read selectively. The "Consequential edits" bullet under Corrections pending is derived from the #24865 diff, not from areas 18 or 19.
