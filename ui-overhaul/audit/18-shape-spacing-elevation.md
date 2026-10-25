# 18 shape-spacing-elevation: audit

Baseline: upstream main 5f64c5eb (the running app) plus PR #24865 (`prior-art/pr-24865.diff`). Every radius is given
twice: **main** (measured live) and **#24865** (simulated live by setting `--radius: 0.5rem` on `<html>`, plus the
class edits the diff makes: composer, details card, plan card, subagent bar `rounded-3xl` to `rounded-2xl`; chat inline
code 4 px; chat `pre` 8 px). DNA ids: DNA-S* shape, DNA-SP* spacing, DNA-D* density, DNA-K* do-not-touch.
Captures: `ui-overhaul/screens/18-shape-spacing-elevation/` (12 PNG, all synthetic data, no local paths or accounts).
Scripts live outside the repo in `/tmp/t3code-pw/a18-*.mjs`. Nothing in the repo was modified.

## Summary

| Severity | Count | Ids                                |
| -------- | ----- | ---------------------------------- |
| P0       | 0     |                                    |
| P1       | 1     | F-18-01                            |
| P2       | 4     | F-18-02, F-18-03, F-18-04, F-18-05 |
| P3       | 4     | F-18-06, F-18-07, F-18-08, F-18-09 |

Key insight: #24865 moves the whole `rounded-*` ladder by -2 px through one variable, but `--control-radius`
(`index.css:101`) is a literal 0.5rem. After the PR, buttons and inputs agree at 8 px, while `rounded-md` (159 uses:
sidebar rows, sidebar search, tooltips, compact buttons) drops to 6 px. DNA-S1 (6/8/10/14/18/22) is stale and must be
rewritten as 4/6/8/12/16 plus role names before spec §3. The elevation system is the bigger gap: 45 distinct shadow
strings, 12 recipes for floating things, and the PR only touches the composer's.

## Inventory 1: radius values actually used

Counting method: every `rounded*` token in non-test `.ts/.tsx/.css` under `apps/web/src` (784) and `apps/mobile/src`
(338), side variants (`rounded-t-xl`) folded into their rung, variant prefixes stripped (`/tmp/aud18/radius.mjs`).

### Web (Tailwind rungs, driven by `--radius`, `index.css:284-289, 1096`)

| Token                                                    | Uses | main px         | #24865 px       | On the 4/6/8/12/16 scale after #24865?                                 | Typical role (measured)                                                                    |
| -------------------------------------------------------- | ---- | --------------- | --------------- | ---------------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| `rounded-full`                                           | 178  | pill            | pill            | yes (pill)                                                             | send button, switches, pills, scrollbar                                                    |
| `rounded-md`                                             | 160  | 8               | 6               | yes                                                                    | sidebar row, sidebar search, tooltip, compact button, breadcrumb crumb (sm 4)              |
| `rounded-lg`                                             | 150  | 10              | 8               | yes                                                                    | inputs, selects, popups, menus, header toggles, details rows                               |
| `rounded-sm`                                             | 83   | 6               | 4               | yes                                                                    | menu/select/palette rows, `Button micro`                                                   |
| `rounded-xl`                                             | 46   | 14              | 12              | yes                                                                    | settings groups, theme cards                                                               |
| `rounded-none`                                           | 37   | 0               | 0               | n/a                                                                    | group seams                                                                                |
| nested `calc(var(--radius-X) - 1px)`                     | 33   | X-1             | X-1             | yes (DNA-S2 idiom)                                                     | inset highlights in popover, select, input, button                                         |
| bare `rounded`                                           | 32   | 4               | 4               | yes                                                                    | kbd, chips, dialog corners                                                                 |
| `rounded-2xl`                                            | 23   | 18              | 16              | yes                                                                    | dialogs, palette, route modal, user bubble, (+ composer, details card, plan card after PR) |
| `rounded-[inherit]`                                      | 10   | inherit         | inherit         | n/a                                                                    | scroll viewports                                                                           |
| `rounded-3xl`                                            | 8    | 22              | 20              | **no (20)**; the PR moves 7 of 8 to `2xl`, leaving `GuestPage.tsx:666` | composer, details card, plan card                                                          |
| `rounded-(--control-radius)` / `[var(--control-radius)]` | 8    | 8               | **8 (literal)** | yes, but not derived from `--radius`                                   | Button base `button.tsx:9`, Badge, sidebar buttons, composer controls, panel tabs          |
| `rounded-xs`                                             | 4    | 2               | 2               | **no**                                                                 | swatches, search highlight                                                                 |
| `rounded-[.25rem]`                                       | 3    | 4               | 4               | yes                                                                    | checkbox, badge                                                                            |
| `rounded-[3px]`                                          | 2    | 3               | 3               | **no**                                                                 | checkbox inner, ghostty                                                                    |
| `rounded-[25%]`                                          | 2    | tile            | tile            | n/a                                                                    | project monogram (DNA-K3)                                                                  |
| `rounded-[0.5em]`                                        | 1    | 6.02 at 12.04px | same            | **no** (em-relative)                                                   | `ContextChip.tsx:9`                                                                        |
| `rounded-[calc(var(--radius)-5px)]`                      | 1    | 5               | 3               | **no**                                                                 | `input-group.tsx`                                                                          |
| thumb variants                                           | 3    | n/a             | n/a             | n/a                                                                    | switch, menu checkbox                                                                      |

CSS literals in `index.css` (not touched by `--radius`): 0.75rem (settings pulse, 913), 0.4rem = 6.4 px (theme inspector
label, 1385), 3 px (scrollbar thumb, 1788), 0.25rem (footnote backref 2044), 0.375rem/0.75rem (chat inline code and `pre`;
the PR changes them to 0.25rem/0.5rem), 0.3em (composer inline code, 2375), 6 px x2 (selected node and chip range,
2393, 2404), 9999px x5, 999px x1.

### Mobile (`apps/mobile/src`, uniwind, Tailwind defaults; no `--radius-*` in `global.css`)

| Form                                                     | Uses                           | px                                                                                         |
| -------------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------ |
| `rounded-full`                                           | 112                            | pill                                                                                       |
| `rounded-xl` / `2xl` / `md` / `lg` / bare / `sm` / `3xl` | 45 / 29 / 15 / 13 / 13 / 3 / 1 | 12 / 16 / 6 / 8 / 4 / 4 / 24                                                               |
| arbitrary `rounded-[Npx]`                                | 106 (31% of all)               | 20 x30, 24 x26, 28 x14, 18 x8, 14 x7, 16 x5, 11 x4, 22 x4, 10 x3, 26 x2, 12 x1, 7 x1, 3 x1 |
| inline `borderRadius:`                                   | 53 sites                       | 3, 4, 6, 8, 9, 12, 14, 16, 20, 24, 28, 999                                                 |

Radii seen on classes that also carry `bg-grouped-card`: 24 x20, 16 x11, 20 x6, 28 x4, 26, 22, 12, 8 (see F-18-06).

## Inventory 2: measured geometry (Playwright, 1440x900, DPR 1, light; dark differs only in colour)

`delta` = main minus DNA-S1/D value; `post` = after #24865. Source: `/tmp/aud18/m3-*.json`, `popups*-light.json`.

| Component                                     | Measured (w x h)       | Padding / gap                  | Border            | r main             | r post     | DNA value   | delta main / post |
| --------------------------------------------- | ---------------------- | ------------------------------ | ----------------- | ------------------ | ---------- | ----------- | ----------------- |
| Header icon toggle (terminal, details, panel) | 28x28                  | 0 5 / 8                        | 1 transparent     | 10                 | 8          | 8 (control) | +2 / 0            |
| Header breadcrumb button                      | 99x21.9                | 0 / 6                          | 0                 | 6                  | 4          | 6           | 0 / -2            |
| Sidebar thread row card                       | 239x78                 | row inset 10, li py 2          | 0                 | 8                  | **6**      | 8 (DNA-K1)  | 0 / **-2**        |
| Sidebar search field                          | 151x32                 | 6 8 / 8                        | 0                 | 8                  | **6**      | 8           | 0 / **-2**        |
| Sidebar header icon button                    | 28x28                  | 0                              | 0                 | 8                  | 8          | 8           | 0 / 0             |
| Sidebar footer button                         | 32x32                  | 0 (gap 4)                      | 0                 | 8                  | 8          | 8           | 0 / 0             |
| Composer surface                              | 736x144                | glass                          | outline `::after` | 22                 | 16         | 22          | 0 / -6            |
| Composer controls (model, effort, attach)     | 154/113/28 x 28        | 0 10 / 6                       | 1 transparent     | 8                  | 8          | 8           | 0 / 0             |
| Send button                                   | 32x32                  | 0                              | 0                 | pill               | pill       | pill        | 0                 |
| Thread details card                           | 280x231 at (1148,64)   | rows inset 8 + 10, row gap 10  | 1 fg/10%          | 22                 | 16         | 22          | 0 / -6            |
| Details row (VS Code, branch)                 | 229/262 x 32           | 0 10                           | 1 transparent     | 10                 | 8          | 10          | 0 / -2            |
| User message bubble (collapsed)               | 589x36                 | 8 12 / 6                       | 0                 | 18 (stadium)       | 16         | 18          | 0 / -2            |
| Changed-files header                          | 728x40                 |                                |                   | 10/10/0/0          | 8/8/0/0    | 10          |                   |
| File chip                                     | 76x17                  | 0 6 / 4                        | 1                 | 6.02               | 6.02       | 6           | 0                 |
| `Button xs` (Open diff) / `icon-xs`           | 82x24 / 24x24          | 0 7                            | 1 transparent     | 8                  | 8          | 8           | 0                 |
| Settings route modal                          | 1280x820 at (80,40)    | header 48 high                 | 1                 | 18                 | 16         | 18          | 0 / -2            |
| Settings group card                           | 848x291                | row 12/16                      | 1 border/60       | 14                 | 12         | 14          | 0 / -2            |
| Settings select trigger                       | 160x28                 | 0 9                            | 1 input           | 10                 | 8          | 10          | 0 / -2            |
| Settings nav item                             | 223x32                 | 6 10                           | 0                 | 8                  | 8          | 8           | 0 / 0             |
| Switch                                        | 30x18 (touch 38x22)    | p 2                            | 0                 | pill               | pill       | pill        | 0                 |
| Menu popup / item                             | 262x66 / 252x28        | list p 4, item 4 8 gap 8       | 1 fg/10%          | 10 / 6             | 8 / 4      | 10 / 6      | 0 / -2            |
| Popover (model picker)                        | 362x251                |                                | 1 fg/10%          | 10                 | 8          | 10          | 0 / -2            |
| Select popup item (2-line)                    | 361x46                 | 4 8                            | 0                 | 6                  | 4          | 6           | 0 / -2            |
| Tooltip                                       | 63x26.5                |                                | 1                 | 8                  | 6          | 8           | 0 / -2            |
| Command palette / input / row / footer        | 576x420 / 34 / 32 / 40 | row 6 8, footer 10 16          | 1 fg/10%          | 18 / 10 / 6 / 0-17 | 16 / 8 / 4 | 18 / 10 / 6 | 0 / -2            |
| Dialog (Add theme)                            | 768x588                | header 24 24 12, panel 4 24 24 | 1 fg/10%          | 18                 | 16         | 18          | 0 / -2            |
| Anchored toast                                | 97x26                  | 4 8                            | 1 fg/10%          | 8                  | 6          | 8           | 0 / -2            |
| kbd                                           | 20x20                  | 0 4                            | 0                 | 4                  | 4          | 4           | 0                 |
| Right panel                                   | flush column           |                                | left hairline     | 0                  | 0          | 0 (DNA-S6)  | 0                 |

Control heights match DNA-D2 exactly (no drift): `Button` default 32, `compact`/composer 28, `xs` 24, `icon-xs` 24, `micro`/`icon-micro` 20,
select trigger 28, command input 34, sidebar search 32, menu item 28, command row 32, details row 32.

## Inventory 3: spacing (gap / padding counts, web)

| Surface                | gap (top)                                                 | px (top)                                      | py (top)                               |
| ---------------------- | --------------------------------------------------------- | --------------------------------------------- | -------------------------------------- |
| All web                | 2 x458, 1 x215, 3 x203, 1.5 x199, 0.5 x64, 4 x40, 2.5 x22 | 3 x241, 4 x155, 2 x116, 1 x60, 5 x31, 1.5 x30 | 2 x199, 3 x88, 1 x65, 1.5 x63, 2.5 x48 |
| Sidebar                | 2 x16, 1 x16, 1.5 x5, 2.5 x4                              | 1.5 x7, 2 x6, 2.5 x5                          | 1 x4, 0.5 x4                           |
| Composer / chat footer | 1 x16, 2 x14, 1.5 x7                                      | 3 x8, 1 x7, 4 x6                              | 2 x4                                   |
| Details card           | 2 x7, 1 x3                                                | 1.5 x2                                        | 2 x1                                   |
| Settings               | 2 x163, 3 x95, 1.5 x58, 1 x41                             | 3 x131, 4 x114                                | 2 x110, 3 x60                          |
| `components/ui`        | 2 x30, 1 x13, 1.5 x9                                      | 2 x17, 6 x4                                   | 1 x13, 1.5 x7                          |

Quarter steps and arbitrary values: `px-1.75` x4, `pr-3.25` x2, `py-0.75` x2, `px-0.75`, `mt-0.75`, `size-3.25` x8 (all
`ThreadTerminalDrawer.tsx`), `size-4.5` x20, `h-4.5`, `h-6.5`, `leading-4.5` x9, `my-[0.65rem]` x4 (markdown), `-ms-[0.35rem]`.
Correction to DRIFT-16: the quarter-step **padding** values are DNA-SP3's "padding minus border" idiom by another name
(`px-1.75` = `calc(--spacing(2) - 1px)` = 7 px; `pr-3.25` = 13 px = 14 - 1; `py-0.75` = 3 px = 4 - 1). Only `size-3.25`/`size-4.5`/
`h-4.5`/`leading-4.5` are real off-scale sizes, and they are icons and line heights, not layout.

Leading text inset by surface (measured): sidebar rows 18 (8 + 10), composer 17, settings rows 16, details card icons 19
(8 row inset + 10 padding + 1 border), page header 20, dialogs 24, command rows 8 + 8. Six values in a 16-24 px band; none
adjacent to another, so no visible misalignment (see Already good).

## Inventory 4: borders, shadows, glass

**Borders.** 1 px everywhere on the web; `border-border` alpha steps in use: bare x54, /80 x21, /70 x96, /60 x105, /50 x24,
/45 x2, /40 x5, plus `border-input` x26 (7 steps; see F-18-04). `divide-y` x24 (all `divide-border`). `ring-1` used as a
border substitute in about 20 places outside focus (`GitActionsControl.tsx:1863,1908`, `wizard.tsx:83,98,148`, `button.tsx:56`,
`ThemeSettings.tsx:256`, `HtmlRenderDialog.tsx:38`, mini player, sidebar rows). Dark `--border` 6% to 8% and `--input` 8% to 11% in #24865.

**Shadow utilities (web): 225 uses, 45 distinct strings** (`/tmp/aud18/shadow.mjs`): `shadow-none` x38, `shadow-sm` x21, `shadow-xs/5` x21,
two `shadow-[0_1px_--theme(--color-black/4%)]`-style inset rails x30, `shadow-xs` x12, bare `shadow` x12, `shadow-lg` x8, `shadow-2xl` x6, `shadow-xl` x5,
`shadow-composer` x5, plus 34 other strings (67 uses). Mobile: 18 uses, 7 strings. Raw `box-shadow:` in `index.css`: 15 declarations.

**Floating-surface recipes, measured** (light; dark in brackets where different):

| Surface                                                                   | box-shadow                                                                  | Source                                 |
| ------------------------------------------------------------------------- | --------------------------------------------------------------------------- | -------------------------------------- |
| Menu, popover, select, combobox                                           | `0 16px 40px -18px /55%` [dark `0 18px 44px -18px /80%`]                    | literal string, 4 files                |
| Dialog, command palette                                                   | `0 24px 64px -24px /65%` [dark `inset 0 1px /4%`, `0 24px 72px -20px /90%`] | `dialog-glass`, `index.css:407-413`    |
| Settings and Usage route modal                                            | `0 25px 50px -12px /40%` (no dark highlight)                                | `AppRouteModal.tsx:55` `shadow-2xl/40` |
| Anchored toast, glass tooltip, timeline minimap                           | `0 20px 25px -5px, 0 8px 10px -6px /25%`                                    | `shadow-xl shadow-black/25` x4         |
| Default tooltip                                                           | `0 4px 6px -1px, 0 2px 4px -2px /5%`                                        | `shadow-md/5`                          |
| Autocomplete, sheet                                                       | `0 10px 15px -3px, 0 4px 6px -4px /5%`                                      | `shadow-lg/5`                          |
| Hover card, drag ghost, overlays, chart popover, device, sidebar row card | Tailwind `shadow-lg` /10%                                                   | 6 files                                |
| Image dialogs, HTML render, zoomable image                                | Tailwind `shadow-2xl`                                                       | 4 sites                                |
| Standalone page                                                           | `shadow-2xl shadow-black/20`                                                | `standalone-page.tsx:40`               |
| Mini player                                                               | `shadow-lg/20`, `shadow-2xl/35`                                             | `ThreadPreviewMiniPlayer.tsx:498,540`  |
| Composer                                                                  | main `0 12px 28px -18px /40%` (light), none (dark); #24865 `0 1px 2px /5%`  | `index.css:195`                        |
| Details card, right panel, sidebar                                        | none                                                                        | measured                               |

**Glass.** `dropdown-glass` x11 sites (menu, popover, combobox, select, tooltip glass, toast x2, minimap, details card, context-menu fallback,
input-group), `dialog-glass` x2 (dialogs, theme editor), `surface-glass` x2 (`Button variant glass`, usage chart), `alert-glass` x1; raw `backdrop-blur` x19
(composer and banner use blur plus saturate). `--glass-blur` 12 px, opacity 80%, saturation 1.14 (`index.css:117-119`); dialog backdrop blur 4 px.

**Hit targets under 24 px, fine pointer** (6 pages swept): sidebar unpin 12x12 (F-02-23), `Dismiss Woke notification` 51x16 (F-02-14), hover actions 24x20 (F-02-24), sidebar rail
16x900 (resize, by design), header crumbs 99x21.9 and 221x21.9, `Worked for` 125x22.8, file chips 76x17 and 85x17 (inline, F-04-05), inheritance markers 20x20 (20 per
settings page), `Use <theme> theme` 20 high (x6), keybindings `Edit when clause` 20 high (x82), switch 30x18, search inputs 21 inside a 32 wrapper (fine).
Touch (390x844, `pointer: coarse` true) under 44 px with no `::after` area: see F-18-01.

## Findings

### F-18-01 Touch hit areas below DNA-D4: the switch is 38x22 with no expansion, and four other controls miss it

- Severity: P1
- Surface: web (phone width, touch); native mobile N/A
- Evidence: Touch-emulated sweep at 390x844 (`a18-touch.mjs`, `a18-touch2.mjs`). Settings > General: `[role=switch]` 38x22 x18, `::after` none (`ui/switch.tsx:12-14` root has no `pointer-coarse:after:*`). Thread: header crumbs 99x22 and 107x22, `Worked for 17s` 125x23, folder rows `docs`/`src/lib` 342x28, `Expand composer` bar 300x20 (`ChatComposer.tsx:3617`). Settings: `Project scope` and `Environment scope` triggers 103x24 and 144x24 (`SettingsScopeSentence.tsx:304`). `Button` instances are fine: `button.tsx:9` adds `pointer-coarse:after:size-full min-h-11 min-w-11`, so the 20 px `micro` buttons measure 44 on touch. Raw `<button>` and Base UI parts do not get it. Send/Stop 32x32 is F-04-18; the settings nav rail 39x32 is F-07-06.
- Current: The control people toggle most on a phone-width settings page is 22 px tall and only its 38x22 body is tappable. WCAG 2.5.8 passes only through the spacing exception.
- Proposed: Add one utility beside `surface-glass` in `index.css` (about line 341): `@utility hit-area { &::after { content:""; position:absolute; top:50%; left:50%; translate:-50% -50%; width:max(100%,24px); height:max(100%,24px); } @media (pointer: coarse) { &::after { width:max(100%,44px); height:max(100%,44px); } } }` (callers must already be `relative`/`absolute`; the utility does not set `position`). Apply: `ui/switch.tsx:12` add `relative hit-area`; `ChatHeader.tsx:292,374` crumb buttons and the `Worked for` toggle (`MessagesTimeline.tsx:1386,1409`) add `relative hit-area`; changed-files rows `ChangedFilesTree.tsx` add `hit-area`; scope triggers (`SettingsScopeSentence.tsx`) add `hit-area`; `ChatComposer.tsx:3617` bar add `hit-area`. No layout change (pseudo-element only).
- DNA: DNA-D4 (44 px on touch via `after`), DNA-D2
- Effort: S
- Risk: `::after` captures taps over adjacent controls in dense rows (crumb next to toggle); verify overlap at 390 px. Tests: none cover hit areas.
- Upstream-eligible: yes (one problem: touch hit areas)
- #24865: not addressed

### F-18-02 Elevation is 12 recipes for floating things; toasts use a short heavy drop, and the route modal is not the dialog

- Severity: P2
- Surface: web, desktop
- Evidence: 45 distinct shadow strings, 225 uses (Inventory 4). Measured live: menu/popover `0 16px 40px -18px /55%`, command palette and dialogs `0 24px 64px -24px /65%`, Settings route modal `0 25px 50px -12px /40%` (`AppRouteModal.tsx:55`), anchored toast `0 20px 25px -5px, 0 8px 10px -6px /25%` (`toast.tsx:568,706`, also `tooltip.tsx:142` glass and `TimelineMinimap.tsx:259`). The 55%/80% popup string is hand-copied in `menu.tsx:53`, `popover.tsx:96`, `combobox.tsx:167`, `select.tsx:143`. `autocomplete.tsx:105` and `sheet.tsx:93` use `shadow-lg/5`; `preview-card.tsx:33` uses `shadow-lg`; `standalone-page.tsx:40` `shadow-2xl shadow-black/20`; image dialogs `shadow-2xl`. In dark mode the dialog gets an inset top highlight (`index.css:411`), the route modal gets none. Captures: `18-toast-shadow-light-420x220@2x.png`, `18-menu-shadow-light-420x240@2x.png`, `18-dialog-shadow-light-720x180@2x.png`, dark twins.
- Current: DNA-S5 allows long, low, downward shadows; four surfaces use Tailwind's default short drops with 20-25 px offsets, a 26 px toast carries a halo larger than a menu, and the two big modals differ in light and dark.
- Proposed: In `@theme` next to `--shadow-composer` (`index.css:195`) add `--shadow-popup: 0 16px 40px -18px rgb(0 0 0 / 55%)`, `--shadow-popup-dark: 0 18px 44px -18px rgb(0 0 0 / 80%)`, `--shadow-dialog: 0 24px 64px -24px rgb(0 0 0 / 65%)`, `--shadow-dialog-dark: inset 0 1px rgb(255 255 255 / 4%), 0 24px 72px -20px rgb(0 0 0 / 90%)`; make `dialog-glass` (`index.css:407-413`) read them. Replace the two arbitrary values with `shadow-popup dark:shadow-popup-dark` in `menu.tsx:53`, `popover.tsx:96`, `combobox.tsx:167`, `select.tsx:143`; replace `shadow-lg/5` (`autocomplete.tsx:105`), `shadow-lg` (`preview-card.tsx:33`), `shadow-xl shadow-black/25` (`tooltip.tsx:142`, `toast.tsx:568,706`, `TimelineMinimap.tsx:259`) with the same pair; replace `sm:shadow-2xl/40` (`AppRouteModal.tsx:55`), `shadow-2xl shadow-black/20` (`standalone-page.tsx:40`), `shadow-2xl` (`ExpandedImageDialog.tsx:33,61,215`, `HtmlRenderDialog.tsx:38`, `ZoomableImage.tsx:160`) with `shadow-dialog dark:shadow-dialog-dark`. Keep `shadow-md/5` on the default tooltip and `shadow-xs` on controls. Result: 12 recipes become 4 (popup, dialog, composer, tooltip lift).
- DNA: DNA-S4, DNA-S5, DNA-S8
- Effort: S
- Risk: toast and minimap lose their halo (check on light canvas); `AppRouteModal` opacity transition unaffected. Visual only, no test coverage.
- Upstream-eligible: yes (one problem), after #24865 merges
- #24865: not addressed (its only elevation edit is `--shadow-composer` from `0 12px 28px -18px /40%` to `0 1px 2px /5%`, a short drop against DNA-S5, with `--shadow-composer-dark` left long; `GuestPage.tsx:666` uses both, so that page changes character between themes)

### F-18-03 After #24865 the sidebar family splits 6 and 8 px, and `--control-radius` is a literal beside a moving ladder

- Severity: P2
- Surface: web, desktop
- Evidence: Live simulation (`--radius: 0.5rem`): sidebar thread row card 8 to 6 (`SidebarThreadRow.tsx:894` `rounded-md`), sidebar search field 8 to 6 (`SidebarThreadHeader.tsx:65`), settings nav item stays 8 (`rounded-(--control-radius)`), sidebar header and footer buttons stay 8, tooltip 8 to 6, `Button compact`/`Toggle` `rounded-md` 8 to 6 while default `Button` stays 8. `--control-radius: 0.5rem` at `index.css:101` is not derived from `--radius`; used by 8 sites versus 160 `rounded-md`. Captures: `18-sidebar-rows-footer-radius-{pre,post}-light-256x140@2x.png`, `18-sidebar-header-radius-{pre,post}-light-256x120@2x.png`. The mismatch is visible only on hover, active and selected fills.
- Current: DNA-K1 pins sidebar thread rows at 8 px; the PR changes them to 6 px as a side effect while the buttons beside them stay at 8.
- Proposed: `index.css:101` `--control-radius: var(--radius-lg)` (still 8 px, now tracks the ladder). Sidebar surfaces take the control rung: `SidebarThreadRow.tsx:894` and `SidebarDraftBlock.tsx:90` `rounded-md` to `rounded-(--control-radius)`; `SidebarThreadHeader.tsx:65`, `SettingsSidebarNav.tsx:250`, `Sidebar.tsx:3220` the same. Leave tooltips and chips at 6 (inner rung). Write the roles into DNA-S1: 4 inline and menu items, 6 chips, tooltips and rows inside popups, 8 controls, inputs, popups and sidebar rows, 12 grouped cards, 16 composer, details card, dialogs.
- DNA: DNA-S1, DNA-K1, DNA-S2
- Effort: XS
- Risk: row hover corner against the 2 px list gutter; `SidebarThreadRow` browser tests do not assert radius.
- Upstream-eligible: yes, as a follow-up to #24865 only
- #24865: partial (moves the ladder, leaves `--control-radius` and the sidebar `rounded-md` sites)

### F-18-04 Fine-pointer targets of 20 px: `micro` buttons, inheritance markers, theme names

- Severity: P2
- Surface: web, desktop
- Evidence: `Button size=micro` and `icon-micro` are `h-5`/`size-5` (`button.tsx:22-23,31-32`). Live: keybindings `Edit when clause` 118x20 x82 (`KeybindingsSettings.tsx`), settings inheritance markers 20x20 x20 on General, `Use <theme> theme` raw buttons 56x20 x6 (`ThemeSettings.tsx:300`, no `after`). They sit in 32-36 px rows, so WCAG 2.5.8 mostly passes by spacing; DNA-D4 only protects touch.
- Current: Mouse users aim at 20 px targets in dense lists, the same size class F-02-24 raised for the sidebar.
- Proposed: In `button.tsx` add the F-18-01 `hit-area` utility to `micro` and `icon-micro` (`sm:` not needed; `max(100%,24px)` is a no-op on larger buttons). Give the raw theme-name button at `ThemeSettings.tsx:300` `relative hit-area`. No pixel change.
- DNA: DNA-D4, DNA-D2
- Effort: XS
- Risk: expanded `::after` overlaps the neighbouring marker in a 24 px pitch; the coarse rule already uses 44 px, so only fine pointers are new.
- Upstream-eligible: yes (after F-18-01)
- #24865: not addressed

### F-18-05 Mobile has no radius ladder: 106 of 338 radii are arbitrary px, and one container role takes seven values

- Severity: P2
- Surface: mobile
- Evidence: Inventory 1. `bg-grouped-card` co-occurs with `rounded-[24px]` x20, `2xl` x11, `[20px]` x6, `[28px]` x4, `[26px]`, `[22px]`, `xl`, `lg` (`AddProjectScreen.tsx:185`, `NewTaskRouteScreen.tsx:332,457` 28; `ThemeAppearanceSection.tsx:154` 24; `PullRequestControls.tsx:27` 22; `ConnectionsNewRouteScreen.tsx` 26). Bordered `bg-card-alt` cards are all `[20px]` (`ProposedPlanCard.tsx:57`, `SecretRequestCard.tsx:99`, `ArchivedThreadsScreen.tsx:279`). `global.css` `@theme` defines type only.
- Current: Radius is chosen per screen; the same role differs by 2-6 px between screens.
- Proposed: In `apps/mobile/global.css` `@theme` add `--radius-sheet: 28px; --radius-card: 24px; --radius-card-sm: 20px; --radius-control: 14px;` and replace `rounded-[28px]` x14 with `rounded-sheet`, `[24px]` x26 plus `[22px]` x4 plus `[26px]` x2 with `rounded-card`, `[20px]` x30 with `rounded-card-sm`, `[14px]` x7 with `rounded-control`. Keep the iOS/Android split in `GitBranchesSheet.tsx:107` (`ios:rounded-card-sm`, `android:rounded-card-sm`). Leave 16/12/8/6/pill on Tailwind names.
- DNA: DNA-X2, DNA-X3, DNA-S1 (roles, not pixels)
- Effort: M
- Risk: no test covers native radii; verify the grouped-card screens on iOS and Android with `test-t3-mobile`; `border-continuous` (18 uses) is unaffected.
- Upstream-eligible: yes (mobile-only)
- #24865: not addressed (touches one mobile file for label text)

### F-18-06 Off-scale radii remain after #24865

- Severity: P3
- Surface: web
- Evidence: After the PR the only remaining non-ladder values are `rounded-xs` 2 px x4 (`TimelineToolActivityIcon.tsx:196`, `UsageShareBar.tsx:43,59`, `HighlightedSearchLine.tsx:114`), `[3px]` x2 and the 3 px scrollbar thumb (`index.css:1788`), `rounded-[calc(var(--radius)-5px)]` = 3 px (`input-group.tsx`), the inline-pill family at four values (chat inline code 4 px per the PR; composer inline code 0.3em at `index.css:2375`; file chip 0.5em at `ContextChip.tsx:9`; selected node and chip range 6 px at `index.css:2393,2404`), the theme-inspector label 0.4rem = 6.4 px (`index.css:1385`), and `GuestPage.tsx:666` `rounded-3xl` = 20 px, the last 3xl.
- Current: A glance at a message with `code`, a file chip and a selected composer chip shows three corner radii for one pill idea.
- Proposed: Add `--radius-xs` to the documented ladder for swatches of 8 px or less (keep `rounded-xs`); `index.css:2375` `0.3em` to `0.25rem`; `index.css:1385` `0.4rem` to `0.375rem`; `input-group.tsx` `calc(var(--radius)-5px)` to `calc(var(--radius-md)-1px)`; `GuestPage.tsx:666` `rounded-3xl` to `rounded-2xl`; keep `ContextChip` em-relative (declare it the chip exception in DNA-S1).
- DNA: DNA-S1, DNA-S2
- Effort: XS
- Risk: inline code in the composer shifts by under 1 px.
- Upstream-eligible: yes
- #24865: partial (fixes chat inline code and `pre`, leaves the composer and chip siblings)

### F-18-07 Border alpha has seven steps for four roles

- Severity: P3
- Surface: web
- Evidence: `border-border` bare x54, /80 x21, /70 x96, /60 x105, /50 x24, /45 x2, /40 x5. Same role, both steps in one file: `ResourceTelemetryDiagnostics.tsx` /60 x11 and /70 x7; settings groups use /60 with /50 dividers (`SettingsGroup.tsx:20-23`), chat cards /70 and /80 (`UserMessageContextChips.tsx`, `TimelineUserMessageRow.tsx`, `ComposerAttachmentStrip.tsx:573,618`). At the new dark `--border` of 8%, /70 vs /60 is a 0.8% white difference: indistinguishable, but unreviewable.
- Current: Authors pick between 60 and 70 at random; reviewers cannot tell intent.
- Proposed: Ladder of four: bare (edge), `/80` (media-adjacent: image thumbnails, attachment strips), `/60` (cards), `/50` (dividers inside a group). Codemod `border-border/70` to `/60` (96 sites), `/45` to `/50`, `/40` to `/50`; keep `/80` only in `ComposerAttachmentStrip.tsx`, `ExpandedImageDialog.tsx`, `TimelineUserMessageRow.tsx`.
- DNA: DNA-S3, DNA-S7
- Effort: S
- Risk: light-mode cards get 4% lighter edge; compare `screens/baseline` thread and settings shots.
- Upstream-eligible: yes
- #24865: partial (changes the dark `--border` and `--input` tokens, not the step ladder)

### F-18-08 The Settings route modal header is 48 px; every other top bar is 52

- Severity: P3
- Surface: web, desktop
- Evidence: `routes/_chat.settings.tsx:121` `h-12` (measured header 1038x48 at y=41). Chat header, sidebar brand row, right-panel tab strip and `WorkspacePageHeader` use `var(--workspace-topbar-height)` 52 (`ChatView.tsx:3196`, `SidebarChrome.tsx:53`, `RightPanelTabs.tsx:1242`).
- Current: DNA-D3 says one top bar height; the modal chrome breaks it by 4 px.
- Proposed: `h-12` to `h-[var(--workspace-topbar-height)]` at `_chat.settings.tsx:121`, or record the modal as the sanctioned 48 exception in DNA-D3. Prefer the exception: a 52 px bar inside an 820 px modal costs 4 px of content and gains nothing.
- DNA: DNA-D3
- Effort: XS
- Risk: none; the settings scroll container is unaffected.
- Upstream-eligible: no (a DNA edit, not a fix)
- #24865: not addressed

### F-18-09 The PR's light-mode ring and shadow on the active sidebar row is the first in-flow shadow on a row

- Severity: P3
- Surface: web
- Evidence: `pr-24865.diff` ~1409: active row gets `light:shadow-xs light:ring-1 light:ring-inset light:ring-sidebar-border/70`, selected rows the ring. DNA-S3 and DNA-S4: hairline borders, flat content in flow. Measured today: active row `box-shadow: none`.
- Current: A selected thread row now lifts like a card. Intentional per the PR, and F-02-12 already tracks the active/selected collision.
- Proposed: Do not change code. Amend DNA-S4 to list "selected row cards: 1 px ring plus `shadow-xs`" as the one in-flow exception, and add a `border border-transparent` in forced colours (F-02-25).
- DNA: DNA-S3, DNA-S4
- Effort: XS (DNA text)
- Risk: none
- Upstream-eligible: no
- #24865: conflicts (introduced by it; spec §15 only)

## Edge-case results (matrix)

Data (empty, 1, 100+, 10k, long names, unicode, RTL, whitespace): Row geometry holds at 78 px with the 100+ fixture list (thread, new, settings sweeps) PASS; virtualisation and long-name overflow belong to 02 (F-02-08, F-02-30), N/A here.
Content (diff sizes, tables, code, images): N/A (03, 05); code and chip radii inventoried above.
Network/agents, Git: N/A.
Viewport: 1440x900 PASS (all measurements); 1280x720 PASS (composer 652, details card at x=988); 1024x640 PASS (details card becomes popover, composer 672; with panel open 264 = F-01-03); 800x600 NOT TESTED by me (baseline captures exist, not inspected for shape); ultrawide 3440x1440 NOT TESTED (baseline only); mobile 390x844 FAIL (F-18-01); keyboard open NOT TESTED (host). OS zoom 125/150: PASS by proxy: DPR 1.25, 1.5, 1.75 sampled (`a18-snap.mjs`): flat hairlines (sidebar seam, header) snap to one device pixel; rounded 1 px borders (composer, details card, any `rounded-*` + `border`) antialias to about 1.25-1.75 device px with a faint second pixel. That is Chromium behaviour for rounded borders, not a defect. Fractional viewport widths (1439, 1441, 1301) keep composer and card edges on integer positions. Browser zoom 50/200 NOT TESTED.
Preferences: light and dark PASS (radii, spacing, shadows measured both; only colour differs); system switching N/A (16); named themes: shape tokens are theme-independent (themes carry colour roles only), code-read; reduced motion N/A (19); high contrast / forced colours: box-shadow edges drop (F-02-25, F-03-28, F-07-16), N/A here; font size overrides NOT TESTED by me (02 tested 20 px: row 78 to 97.5).
Lifecycle: N/A.

## Already good (do not touch)

- Control heights match DNA-D2 to the pixel on every sampled variant (Inventory 2); `button.tsx` padding-minus-border (`calc(--spacing(N) - 1px)`) keeps outer sizes on a 4 px grid. The quarter-step paddings (`px-1.75`, `pr-3.25`, `py-0.75`) are the same idiom, not drift.
- Details card geometry: 280 px, 12 px from top and right, 8 px row inset, rows 32 px, hairline between groups; right panel is flush with a left hairline (DNA-S6, DNA-K7).
- Nested radius idiom `calc(var(--radius-X) - 1px)` (33 uses) keeps pseudo-element highlights concentric (DNA-S2).
- Floating menu geometry: popup padding 4 plus 1 px border, item radius = popup radius minus 5 (6 inside 10; 4 inside 8 after the PR).
- Composer visible insets are symmetric: 17 px from the glyph edge on both sides (model icon at 17, send circle 17 from the right and bottom) even though the hover boxes start at 7.
- Fractional layout: composer, details card and sidebar seam sit on integer pixels at 1439, 1440, 1441 and 1301 wide.
- Right panel and sidebar carry no shadow; only floating things do (DNA-S4) apart from F-18-09.

## Incomplete

- Not inspected: 800x600 and 3440x1440 shape, browser zoom 50/200, OS zoom beyond DPR emulation, keyboard-open phone layout, desktop (Electron) title bar insets (area 14), native mobile screens (counted from source only, not measured on a device).
- `Button` size variants were verified on live instances (all but `lg`, `xl`, `icon-lg`, `icon-xl`, `sm-multiline`, which no sampled page renders); those heights come from `button.tsx` only.
- The #24865 radii are a simulation (variable plus the diff's class edits), not a build of the PR.
- Divider-per-row lists (DNA-S7) were counted (`divide-y` x24, `border-t` x74) but not audited row by row.
- Dark-mode captures were taken for the shadow comparisons only; dark radii equal light radii.

## Needs deeper look

- Area 07/08: the Settings > General Model row at 390 px shows a bare right-aligned model picker and effort button while Permissions, Workspace and Submodules are boxed full-width selects; one row type, two control shapes (`screens/baseline/settings-general-default-light-390x844.png`).
- Area 01/10: the command palette placeholder "Search commands, projects, and threads" clips at 390 px (`command-palette-default-light-390x844.png`); the input is 556 px wide at desktop and the same 8 px inset is not adapted.
- Area 03: `ProviderSubagentBar.tsx:48` is an in-flow bar at `rounded-2xl` (16 after the PR) and attaches to the composer; confirm it should match the composer, not the in-flow `rounded-xl` rung (see F-03-33 for the plan card).
- Area 17: `text-[13px]` rows in the details card sit on the same 32 px rows measured here; type and height should be reviewed together.
