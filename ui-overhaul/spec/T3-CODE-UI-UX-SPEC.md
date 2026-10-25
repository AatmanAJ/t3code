# T3 Code UI/UX Spec (Phase 1 output)

Generated 2026-10-25 from the audit under `ui-overhaul/`. Upstream baseline: pingdotgg/t3code `main` at `5f64c5eb299a23d278ef043c416bd4dc801bc53c`; moving baseline: owner PR #24865 "feat(web): UI design overhaul" (decision D-006). Scope: apps/web, apps/desktop, apps/mobile, docs/user. Out of scope for changes: apps/server, native/, infra/, packaging, .github/workflows, auth, pairing, relay, secrets, updater.

How to read: §1 is the summary; §5 lists every finding id by area and severity, details live in `ui-overhaul/audit/<area>.md`; §13 is the implementation plan Phase 2 executes chunk by chunk; §15 lists the decisions that need an owner call, each with a recommendation. Supporting files: `DNA.md` (design constitution, 110 rules, corrections appended), `MAP.md`, `DOCS-DIGEST.md`, `audit/_FOLLOWUPS.md` (326 resolved or re-dispatched follow-ups), `spec/_FINDINGS-INDEX.md`, `spec/onboarding/` (wireframes), `screens/baseline/` (252 before-images, `MANIFEST.md`), `prior-art/` (graded PRs, issues, discussions, rejection patterns).

Phase 1 ends with this document committed to the fork branch `ui-overhaul/audit`. No implementation, PR, issue or discussion was created anywhere.

## Contents

- 1. Executive summary
- 2. Design DNA
- 3. Token proposal
- 4. Hierarchy rules
- 5. Findings by area
- 6. Edge-case matrix
- 7. Customisation spec
- 8. Onboarding spec
- 9. Motion spec
- 10. Copy table
- 11. Accessibility pass
- 12. Prior art
- 13. PR plan
- 14. Upstream strategy
- 15. Decisions
- 16. Run log summary and hard stops
- Reconciliation notes
- Self-check

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

## 7. Customisation spec

Source of truth: `ui-overhaul/audit/23-customisation-gap.md` (27 candidates: 11 already exist, 5 are new and fit DNA, 11 are rejected). `DOCS-DIGEST.md` "Customisation that already exists" is wrong for 9 of its 30 rows (F-23-01) and is not used below; the settings it calls missing do exist. Persistence shorthand: `CS` = `t3code:client-settings:v1` (`ClientSettingsSchema`, 69 fields, `packages/contracts/src/settings.ts:309-479`; desktop keeps the same payload in a main-process file; the native mobile app never reads it and keeps its own `t3code.preferences`).

### 7.1 Rules applied

- Anything in `docs/user`, on the Appearance page or in `ClientSettingsSchema` is **EXISTS** and is never proposed as new; it gets only a discoverability or placement fix (DNA-P2, DNA-V5).
- A "new" item must pass DNA-P2 (smallest model) and the CONTRIBUTING "focused configuration option" route. A remembered default or a bug fix beats a switch: upstream evidence (`PRS.md`, Settings UI bucket) says "lower the settings count, reach for defaults"; every setting request needs prior approval and Macroscope sends it to a human.
- Every new client key is additive: field in `ClientSettingsSchema` with `withDecodingDefault`, `optionalKey` in `ClientSettingsPatch` (`settings.ts:1609`), an item in `settingsSearch.ts`, a label in `changedSettingLabels` and a line in `useSettingsRestore` (`SettingsPanels.tsx:397`) so "Restore device defaults" stays truthful (DNA-P3, F-23-07). Appearance is the device-only page (`SETTINGS_DEVICE_ONLY_PATHS`), so no scope sentence applies (DNA-L6).
- Row positions assume #24865 has merged (it inserts "Colored project icons" between Chat width and Render math). None of the five new items is an upstream-eligible chunk except N3, because `settings.ts`, `AppearanceSettingsPanel.tsx`, `settingsSearch.ts` and `SettingsPanels.tsx` are all in #24865's diff.
- Owner calls that stay (OWNER-DIRECTION.md): blue switch accent, composer model brand colour, three-line sidebar rows, `#0a0a0a` canvas. Any candidate that touches one is rejected below.

### 7.2 Candidate table (27)

| Already exists (where)                                                                                                                                                             | Candidate                                                      | Verdict                                           | DNA rule / owner call                      | Action, effort                  |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------- | ------------------------------------------ | ------------------------------- |
| Partial: Appearance > Themes > Create theme > guided "Accent" and "Background" (`ThemeEditorPanel.tsx:44,126`); server themes take an `accent` hex (`t3 theme set`)                | accent colour                                                  | EXISTS; standalone swatch rejected                | DNA-C2, C13, K8; owner: blue switch accent | search terms only (F-23-08), XS |
| Yes: Appearance > Typography: Interface font + size (12-20, 16), Monospace font + size (10-18, 13); Advanced: Prompt, Terminal, Font smoothing. Mobile: Appearance > Text and Code | UI font, code font, sizes                                      | EXISTS                                            | DNA-K11, T4                                | docs only (F-07-39)             |
| No setting. Levers: Interface font size (rem-based), desktop View > Zoom, Android Material You Layout                                                                              | density                                                        | REJECTED                                          | DNA-D1, D2, T4, K1; owner: three-line rows | search terms (F-23-08)          |
| Partial: sidebar width is global (`chat_thread_sidebar_width`, rail double-click resets); right-panel width and terminal height are per thread                                     | sidebar and panel widths                                       | EXISTS partial; the gap is behaviour              | DNA-L5, P2, K13                            | see N2                          |
| Yes: General > Behavior: Diff layout, Hide whitespace changes, Default diff file state; Appearance: Diff colors, Typography > Word wrap                                            | diff defaults                                                  | EXISTS; separate per-diff wrap rejected           | DNA-P2                                     | placement (F-23-09), S          |
| Yes: General > Behavior > Send shortcut (enter, mod-enter-multiline, mod-enter); mobile Settings > Keyboard                                                                        | composer send key                                              | EXISTS                                            | none                                       | none                            |
| Yes: General > Behavior: Thread notifications (off, notifications, sound, both) and In-app notifications; mobile Settings > Notifications                                          | notification preferences                                       | EXISTS (digest wrong)                             | none                                       | docs (F-12-36)                  |
| Partial: Settings > Project > Icon colour (18 hues), stored on the project; #24865 adds Appearance "Colored project icons"                                                         | per-project colour tag                                         | EXISTS partial; row tint or group colour rejected | DNA-C2, I5, K3                             | none                            |
| Yes: Appearance > Themes: Add theme (T3 or VS Code file or paste, Open VSX), per-card Export; `t3 theme set`                                                                       | theme import and export                                        | EXISTS                                            | none                                       | none                            |
| Yes: Settings > Keybindings; `keybindings.json`                                                                                                                                    | keybinding editor                                              | EXISTS                                            | none                                       | none                            |
| **No.** Only the OS flag is read: 57 `motion-safe:`/`motion-reduce:` class lines, 18 files, 5 CSS blocks                                                                           | reduced-motion override                                        | **NEW (N4)**                                      | DNA-M5, M1, P8                             | M                               |
| Yes: Typography > Advanced > Terminal font + size (8-20, 12); mobile Appearance > Terminal                                                                                         | terminal font and size                                         | EXISTS                                            | none                                       | none                            |
| Yes: General > Behavior > Time format (locale, 12-hour, 24-hour); undocumented                                                                                                     | timestamp format                                               | EXISTS                                            | none                                       | docs (F-08-47)                  |
| No: `/` always opens a draft in the most recently updated project                                                                                                                  | start-up view                                                  | REJECTED                                          | DNA-P2, ID3, ID1                           | none                            |
| No. Confirmations exist for Unpin, Archive, Delete (General > Confirmations)                                                                                                       | confirm-before-settle                                          | REJECTED                                          | DNA-P7, ID1, K2, ID3                       | none                            |
| No. Active, pinned and working threads are 78 px cards; snoozed and settled are 36 px slim rows                                                                                    | sidebar density                                                | REJECTED                                          | DNA-D1, K1, K2; owner: three-line rows     | none                            |
| Partial: Beta > Working shelf switch; collapse of Working, Snoozed, Settled is persisted                                                                                           | show or hide sections                                          | hide REJECTED                                     | DNA-P7, P3, K2                             | none                            |
| **No.** Visibility is stored per thread and defaults to open (`rightPanelStore.ts:199-202`)                                                                                        | Thread details default visibility                              | **NEW (N1)**                                      | DNA-L5, P8, K7                             | S                               |
| **No.** Width per thread from 540 px; terminal height per thread from 280 px; reset exists for the sidebar only                                                                    | right-panel width and terminal height for new threads          | **NEW (N2), no setting**                          | DNA-L5, P2, K13                            | S, M with terminal              |
| **No.** `sidebar_state` cookie is written and never read                                                                                                                           | sidebar collapsed state across launches                        | **NEW (N3), bug**                                 | DNA-L5, P3                                 | XS                              |
| **No.** Chat prose scales only with Interface font size                                                                                                                            | message text size                                              | **NEW (N5), conditional**                         | DNA-T1, T4, K12                            | M                               |
| No                                                                                                                                                                                 | reveal sidebar on hover (#14681)                               | REJECTED                                          | DNA-ID2, X4                                | none                            |
| No                                                                                                                                                                                 | sidebar position (#22908)                                      | REJECTED                                          | DNA-L1, L2                                 | none                            |
| No                                                                                                                                                                                 | scrolling-columns layout (#15949)                              | REJECTED                                          | DNA-L1                                     | none                            |
| No                                                                                                                                                                                 | custom CSS, chat wallpaper, user mods (#10412, #16720, #14956) | REJECTED                                          | DNA-ID2, C2, K8, P1                        | none                            |
| Partial: theme export only                                                                                                                                                         | export and import all device settings (#23045)                 | REJECTED                                          | DNA-P2                                     | none                            |
| Partial: consecutive tool calls already collapse by default                                                                                                                        | compact work log, hide reasoning (#18993)                      | REJECTED as a setting                             | DNA-P2, ID3                                | area 03 default question        |

### 7.3 Specs for the five new items

#### N1. Thread details on new threads (#15119, 15 up; PR #22306)

| Field                 | Value                                                                                                                                                                                                                                                                                                                                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name, type, default   | `threadDetailsDefaultOpen`, boolean, `true`                                                                                                                                                                                                                                                                                                                                                                                  |
| Settings page and row | Appearance > Interface, directly after "Composer context" and before "Chat width" (after the F-23-10 split: Appearance > Layout, next to Composer context). Title "Thread details on new threads". Description "Show the Thread details card on threads where you have not changed it." Switch, `aria-label="Show Thread details on new threads"`, reset arrow, search terms `details card panel collapsed hidden top right` |
| Persistence           | Client. `CS`. Per-thread overrides stay in `t3code:right-panel-state:v2` (sparse map: an entry is stored only when it differs from the default)                                                                                                                                                                                                                                                                              |
| Components reading it | `ChatView.tsx:985` reads `useClientSettings` once and passes `defaultInlineOpen` to `selectThreadPanelVisibility(map, ref, defaultInlineOpen)` and `updateThreadPanelVisibilityMap` (`rightPanelStore.ts:199-202,326-338,1156-1170`). The store never reads the setting (DNA-P3). `ThreadDetailsCard.tsx`, its density tiers and the header toggle are untouched (DNA-K7)                                                    |
| Mobile behaviour      | None. Inline presentation only; below the inline breakpoint the card is a popover that already starts closed (`popoverOpen: false`); the native app has no card                                                                                                                                                                                                                                                              |
| Effort                | S. `rightPanelStore.test.ts` gains two cases (default true, default false)                                                                                                                                                                                                                                                                                                                                                   |
| Notes                 | Flipping the setting flips every thread without an entry; the row copy says so. Add to `changedSettingLabels`. Credit #15119 and #22306. #24865: not addressed; upstream-eligible: no                                                                                                                                                                                                                                        |
| DNA                   | DNA-L5, P8, P3, K7                                                                                                                                                                                                                                                                                                                                                                                                           |

#### N2. Right-panel width and terminal height for new threads (#22256, #12395) - no new setting

| Field                 | Value                                                                                                                                                                                                                                                                                      |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Name, type, default   | None. Behaviour: a new thread opens at the last width you dragged to (default 540 px until then) and the last terminal height (default 280 px)                                                                                                                                             |
| Settings page and row | None (DNA-P2). Copy only: sidebar rail title "Drag to resize, double-click to reset" (`ui/sidebar.tsx:397`), the right-panel handle gets the same title                                                                                                                                    |
| Persistence           | Client, localStorage. `t3code:preview-panel-width` (global fallback key, already defined at `usePreviewPanelInlineSize.ts:11`) is written next to `t3code:preview-panel-width:<threadKey>` on drag end. Terminal: `t3code:terminal-state:v1` gains a last-height field with a version bump |
| Components reading it | `useResizableWidth.ts:40-48` (new optional `fallbackStorageKey`), `ChatView.tsx:3881`, `RightPanelResizeHandle.tsx:9-15` (new `onDoubleClick` writes 540 to both keys and clears the live `--resizable-width`), `terminalUiStateStore.ts:177`, `ThreadTerminalDrawer.tsx`                  |
| Mobile behaviour      | None (right panel is a sheet at 980 px and below; the native app has no resizable columns)                                                                                                                                                                                                 |
| Effort                | S for width, reset and titles; M with terminal height (state migration). Ship the S part first                                                                                                                                                                                             |
| Notes                 | Existing `clamp` handles a stored width above the new thread's max (DNA-K13 min and max rules unchanged). Credit #22256 and #12395. #24865: not addressed; upstream-eligible: no (behaviour change needs approval)                                                                         |
| DNA                   | DNA-L5, P2, K13                                                                                                                                                                                                                                                                            |

#### N3. Sidebar collapsed state across launches (#24191) - bug fix, no setting

| Field                 | Value                                                                                                                                                                                                                                                                                                                                               |
| --------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name, type, default   | None. Collapsed state survives reload and relaunch; first launch (no cookie) stays open                                                                                                                                                                                                                                                             |
| Settings page and row | None                                                                                                                                                                                                                                                                                                                                                |
| Persistence           | Client cookie `sidebar_state` (already written at `ui/sidebar.tsx:25-26,117-135`). Add a synchronous `readSidebarOpenCookie()` next to `resolveSidebarState` in `ui/sidebarState.ts` (parses `document.cookie`; `cookieStore.get` is async and would flash). Raise `SIDEBAR_COOKIE_MAX_AGE` from 7 to 365 days                                      |
| Components reading it | `AppSidebarLayout.tsx:390`: `defaultOpen={readSidebarOpenCookie() ?? true}`                                                                                                                                                                                                                                                                         |
| Mobile behaviour      | None. The phone-width sheet (`openMobile`) stays transient                                                                                                                                                                                                                                                                                          |
| Effort                | XS. A pure parser unit test beside `sidebarState.ts`                                                                                                                                                                                                                                                                                                |
| Notes                 | DNA section 10.1 says the state is remembered for 7 days; the code does not read it, so the code wins (DNA section 0.5). Electron cookie persistence is assumed (the write already sets an explicit `expires`); area 14 owns desktop verification. Upstream-eligible: yes (fix-shaped, files not in #24865). #24865: not addressed. Maps to F-01-01 |
| DNA                   | DNA-L5, P3                                                                                                                                                                                                                                                                                                                                          |

#### N4. Reduce motion

| Field                 | Value                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name, type, default   | `reduceMotion`, boolean, `false`. Effective value = OS `prefers-reduced-motion` OR this setting (the OS flag still wins when set)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Settings page and row | Appearance > Motion, row 2 under "Panel animations". Title "Reduce motion". Description "Turn off transitions and animated indicators, even if your system allows motion." Same row group fixes F-07-27: when the OS flag is on, the Panel animations row shows "Your system asks for reduced motion, so panels open instantly."                                                                                                                                                                                                                                                                                                            |
| Persistence           | Client. `CS`. Mirrored to `data-reduce-motion` on `<html>` where `applyFontPreferences` writes root state. No boot-script change: nothing paints motion before React (DNA-C8 parity test not engaged)                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| Components reading it | New `useReducedMotion()` hook (media query OR setting) replacing the 18 call sites (`panelAnimations.ts:35`, `Sidebar.motion.ts:18`, `RightPanelTabs.tsx:1007`, `SidebarUpdatePill.tsx:201`, `terminal/ghostty/surface.ts:597`, `draftHeroTransition.ts`, `pageScrollController.ts`, MorphIcon). The 57 Tailwind class lines follow through a `motion-reduce`/`motion-safe` custom variant keyed on `(@media (prefers-reduced-motion: reduce)), [data-reduce-motion=true]`; verify Tailwind v4 lets a project redefine a built-in variant, else add the selector to the 5 CSS blocks. The global rule in section 9.4 uses the same selector |
| Mobile behaviour      | None. The native app follows the OS (`ReduceMotion.System`); Android entering animations need the explicit skip from F-15-16                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                |
| Effort                | M (18 files plus `panelAnimations` tests; keep the two-frame navigation suppression untouched)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| Notes                 | Duty-cycled indicators already fall back to a static glyph under `motion-safe:` (DNA-M9 stays honest through the "Working 9s" text). #24865: not addressed; upstream-eligible: no (setting needs approval, files in #24865). F-23-05                                                                                                                                                                                                                                                                                                                                                                                                        |
| DNA                   | DNA-M5, M1, P8                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |

#### N5. Message text size (#24461) - conditional on maintainer approval

| Field                 | Value                                                                                                                                                                                                                                                                                                                                           |
| --------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Name, type, default   | `messageTextSize`, enum `smaller` / `default` / `larger` (92 / 100 / 110 percent), `default`. An enum, not a slider or px, so one out-of-range number cannot lock settings load (F-07-13)                                                                                                                                                       |
| Settings page and row | Appearance > Typography > Advanced, row 2 after "Interface font". Title "Message text size". Description "Scale chat messages without changing the rest of the interface."                                                                                                                                                                      |
| Persistence           | Client. `CS`. One variable `--font-size-message` written in `appearanceFonts.ts`                                                                                                                                                                                                                                                                |
| Components reading it | `ChatMarkdown.tsx`, `MessagesTimeline.tsx`, prose block and headings in `index.css:1795-1852` (headings are rem today: switch to `em` of the container or `calc(... * var(--font-size-message))`)                                                                                                                                               |
| Mobile behaviour      | None. The native app has its own `baseFontSize`                                                                                                                                                                                                                                                                                                 |
| Effort                | M                                                                                                                                                                                                                                                                                                                                               |
| Notes                 | The default renders identical pixels (DNA-T1, K12). Check heading ladder, tables, `ContextChip` (`0.86em`), find highlights at 12 px and 20 px root. If approval is not given, drop it: nothing depends on it. #24865 lifts chat prose from 80 to 90 percent (answers the "too grey" complaint, not size). Credit #24461. Upstream-eligible: no |
| DNA                   | DNA-T1, T4, K12, K11                                                                                                                                                                                                                                                                                                                            |

### 7.4 Rejected candidates (11)

| Candidate                                            | Rule that rejects it                                                                                                               | What users get instead                                            |
| ---------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- |
| Density (compact or comfortable)                     | DNA-D1 (entities get room), D2 (two densities, switched by width and pointer only), T4, K1; owner call: three-line rows            | Interface font size, desktop zoom                                 |
| Sidebar density                                      | DNA-D1, K1, K2; owner call: three-line rows                                                                                        | none needed                                                       |
| Start-up view                                        | DNA-P2, ID3 (the draft hero is the landing), ID1                                                                                   | `/` opens a draft in the latest project                           |
| Confirm-before-settle                                | DNA-P7 (reversible, so no gate), ID1, K2, ID3                                                                                      | Un-settle; confirmations on Unpin, Archive, Delete                |
| Show or hide sections (hide)                         | DNA-P7 (a hidden shelf hides threads: one-way door), P3, K2                                                                        | Persisted collapse; Working shelf switch in Beta                  |
| Reveal sidebar on hover (#14681)                     | DNA-ID2 (floating objects stay few), X4 (needs hover); the left edge is the traffic-light drag region (`DesktopWindow.ts:230-247`) | Restore of collapsed state (N3); revisit after it                 |
| Sidebar position (#22908)                            | DNA-L1, L2 (thread-first navigation, three columns)                                                                                | none                                                              |
| Scrolling-columns layout (#15949)                    | DNA-L1 (no fourth column)                                                                                                          | none                                                              |
| Custom CSS, wallpaper, mods (#10412, #16720, #14956) | DNA-ID2, C2, K8, P1; scope decision is held for maintainers (PRS theme cluster)                                                    | Theme editor and import (61 roles)                                |
| Export and import all device settings (#23045)       | DNA-P2; XL for a convenience; rejection-patterns rule 4                                                                            | Theme export                                                      |
| Compact work log, hide reasoning (#18993)            | DNA-P2, ID3; PRS: reach for defaults, not rows                                                                                     | Consecutive tool calls already collapse; area 03 owns the default |

### 7.5 Discoverability and placement fixes for settings that already exist

| Finding                            | Fix                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Where                                                                            | Effort  | Upstream                        | DNA             |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------- | ------- | ------------------------------- | --------------- |
| F-23-08 + F-07-11                  | Search terms only. Themes `+ accent highlight primary tint brand create theme editor edit duplicate export json vscode vs code open vsx marketplace community add`; Interface font `+ text size zoom scale density compact comfortable`; Chat width `+ narrow readable line length`; Panel animations `+ motion transition reduce animation speed sidebar drawer`; Glass opacity `+ blur backdrop translucent`; Contrast `+ accessibility low vision readability`; add one `typography` item. Check "density" does not outrank the Interface font title for "font" | `settingsSearch.ts:234-239,285-289`                                              | XS      | no                              | DNA-V5, P8      |
| F-23-07                            | "Restore device defaults" ignores fonts: add labels Interface font, Prompt font, Code font, Terminal font, Font smoothing to `changedSettingLabels` (one `fontsChanged` helper over nine keys) and reset `fontSmoothing` in the patch; button no longer disabled when only fonts changed                                                                                                                                                                                                                                                                           | `routes/_chat.settings.tsx:34`; `SettingsPanels.tsx:397-526,628-635`             | XS      | no                              | DNA-P3, V2      |
| F-23-09                            | Move device-only diff rows next to Diff colors: new Appearance section "Diffs" (Diff colors, Diff layout, Hide whitespace changes, Default diff file state) between Interface and Motion; Time format to Layout after Chat width; Word wrap stays in Typography (governs six surfaces). Keep every `searchableSetting` id, keep `#behavior` as an alias for one release. Choose this OR F-08-03 + F-08-09, not both                                                                                                                                                | `SettingsPanels.tsx`, `AppearanceSettingsPanel.tsx`, `settingsSearch.ts:408-438` | S       | no                              | DNA-L6, P3, P8  |
| F-23-10                            | Split Appearance "Interface" (7 rows, 9 after #24865 and N1): "Colors" = Contrast, Glass opacity, Colored project icons, Environment identification (+ Diff colors unless F-23-09 moves it); "Layout" = Chat width, Composer context, Thread details on new threads; Render math to the top of Typography (renamed "Text"); Motion last. Titles 16 px / 600, sentence case. Keep `appearance-interface` as the first section id                                                                                                                                    | `AppearanceSettingsPanel.tsx:106-379`; `targetId` in `settingsSearch.ts`         | S       | no                              | DNA-L6, D1      |
| F-23-11                            | Stranded legacy settings: `sidebarThreadSortOrder` and `sidebarThreadPreviewCount` have no control outside the legacy sidebar but the palette and `useThreadActions.ts:301` still read the order. Derive order from the default sidebar's `updated_at` rule (or from the setting only while `legacySidebarEnabled`); drop "Visible threads" from Restore labels unless the legacy sidebar is on. No UI added (DRIFT-20)                                                                                                                                            | `CommandPalette.tsx:835,840,1767`; `CommandPaletteLookups.ts:60`                 | XS      | no                              | DNA-P3, P2      |
| F-07-27                            | Panel animations shows 400 ms while the OS flag silently forces 0: status text on the row, slider stays enabled                                                                                                                                                                                                                                                                                                                                                                                                                                                    | `AppearanceSettingsPanel.tsx:381-433`                                            | XS      | no                              | DNA-P3, M5      |
| F-04-40                            | Context meter is off by default and filed under "Legacy features": show it automatically from 70 percent used; replace the legacy switch with "Context meter: Auto, Always, Never" (area 04 owns; supports Ideas #14404, 49 up)                                                                                                                                                                                                                                                                                                                                    | `SettingsPanels.tsx:748-757`; `ChatComposer.tsx:3887`                            | S       | no                              | DNA-P3, C6, V1  |
| F-23-03 (titles)                   | Rail and handle titles state the reset gesture (see N2)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | `ui/sidebar.tsx:397`                                                             | XS      | with N2                         | DNA-L5, V5      |
| F-23-01, F-07-39, F-08-47, F-12-36 | Docs: one sentence in `docs/user/thread-sidebar.md` ("Drag the edge of the sidebar or the right panel to resize it. Double-click the sidebar edge to reset it."), plus the ten undocumented Appearance controls, 17 General rows, and a Notifications section                                                                                                                                                                                                                                                                                                      | `docs/user/*.md`                                                                 | XS to S | yes (docs; rebase after #24865) | DNA-V5, P8, K16 |

### 7.6 Digest corrections (for whoever re-reads `DOCS-DIGEST.md`)

| Digest row                     | Digest said          | Truth                                                                                                                 |
| ------------------------------ | -------------------- | --------------------------------------------------------------------------------------------------------------------- |
| sidebar width persistence      | no                   | Exists: `chat_thread_sidebar_width`, `threadSidebarWidth.ts:1`; rail double-click resets (`AppSidebarLayout.tsx:416`) |
| panel width persistence        | no                   | Exists per thread: `ChatView.tsx:3881`, `terminalUiStateStore.ts:177`                                                 |
| diff view default              | no                   | `diffLayout` (`settings.ts:382`), General > Behavior                                                                  |
| diff word wrap                 | no                   | `wordWrap` (`settings.ts:474`), Typography last row                                                                   |
| diff whitespace                | no                   | `diffIgnoreWhitespace` (`settings.ts:381`), General > Behavior                                                        |
| UI font, code font, font sizes | partial, mobile only | `fontFamilySans/Code/Composer/Terminal` (`:401-404`), `fontSize*` (`:389-400`), Appearance > Typography               |
| notification preferences       | partial, mobile only | `notificationMode` (`:310`), `inAppNotificationsEnabled` (`:313`), General > Behavior                                 |

Understated, not counted: confirmations (three rows, `:374-376`); timestamp format (`:458`) is absent from the digest.

## 8. Onboarding spec

Inputs: `audit/24-onboarding-gap.md` (16 findings, P1 5 / P2 7 / P3 4), area 10 (F-10-01..37, which owns defects of the existing wizard and gate), wireframes in `ui-overhaul/spec/onboarding/01..08-*.md` (referenced, not repeated). Principle: three presses to a first message for a ready user, no new step, no tour, nothing a power user cannot skip with Escape, every way out leaves a way back (DNA-P2, P7, ID3, K14). All times are keystroke-level estimates from the code path (read 5 s per screen, click 1.5 s, 12-word prompt 12 s, installer 20-90 s, OAuth 30-90 s); a true first launch cannot be produced on the shared dev server, so none is measured.

### 8.1 Journey per platform: current to proposed

| Platform                                                          | Current (estimate)                                                                                                                                                                                                                                                                    | Proposed                                                                                                                                                                                                                                                                                                                                                                     | Findings, wireframes                               |
| ----------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- |
| W1 Desktop, agent signed in, Claude Code or Codex history present | Blank page 0.5-4 s, then Computers step (focus on "Add a computer", so Enter opens the pairing form), Agents (Continue), Projects (Import 2 of 19). Three presses plus prompt; 40-75 s to first sent message                                                                          | Gate shows a shared shell with a spinner after 1 s. One local computer: Computers step is skipped (stepper `Agents, Projects`), focus on Continue, Skip setup and Escape available, import shows "Importing 2 of 7…". Two presses plus prompt; one fewer screen (about 6 s by the same per-screen costs)                                                                     | F-10-09, F-24-06, F-24-09, F-24-10; 01, 02, 03, 04 |
| W2 Desktop, agent ready, no history                               | Step 3 shows "Import 0 projects" disabled and "Do not import projects"; X completes silently; wizard cannot pick a folder; 50-100 s, five clicks                                                                                                                                      | Enabled Continue, "Add a project…" in the footer (existing palette folder browser), `Empty size="inline"` explaining nothing was found; landing hero keeps "Start without a project"                                                                                                                                                                                         | F-10-07, F-24-08; 04, 05 B                         |
| W3 Desktop, no agent installed                                    | Install opens a pre-typed terminal, then Sign in a second terminal. Stale login-shell PATH keeps "Not found" with no "Check again". Continue stays primary with zero ready agents. 2.5-6 min, 7+ clicks: highest drop-off                                                             | Same install and sign-in terminals (installers are never auto-run). Adds "Checked just now" + refresh button, one `visibilitychange` refresh (no polling), the line "After the installer finishes, choose Check again.", a "No agent is ready on {computer}" note, and Continue demoted to outline until one agent is ready. Vendor installer time is unchanged              | F-24-07, F-10-15; 03 C                             |
| W4 Web (`npx t3`, fresh base dir)                                 | Server never sends `bootstrapProjectCreated`, so the wizard is skipped (F-10-01) and `/` opens an arbitrary existing thread (F-10-03). With no provider: chip "No provider available", Enter does nothing, Providers page says "Not found" with no action; 5 min or more, no way back | Server dependency lands first (field sent), so the wizard shows. Composer chip is always enabled ("Set up an agent"); banner action "Set up agents"; Providers empty state offers "Add provider" and "Set up agents"; all route to `/welcome#agents:<environmentId>` when Codex or Claude needs install or sign-in and terminal scope is granted, else `/settings/providers` | F-10-01, F-10-03, F-24-05; 06                      |
| W5 Hosted app.t3.codes                                            | No wizard. `HostedEmptyState` two-step list plus "Waiting for your computer…" is the clearest explainer in the product; 2-4 min when a host exists                                                                                                                                    | Structure unchanged. Copy deck shared with W6 and the wizard ("computer", three steps, `npx t3`, `npx t3 pair`, `npx t3 connect`)                                                                                                                                                                                                                                            | F-24-12; 02                                        |
| W6 Mobile (iOS, Android)                                          | Home: "No environments connected" and one button; sheet caption assumes CLI vocabulary; T3 Connect sheet says "No additional linked cloud environments."; "No projects found" is a dead end. 3-8 min when the host is ready, unbounded when it is not                                 | Home: "No computer connected" + three non-pressable steps + FAB "Connect a computer". Sheet caption "On your computer: Settings, Connections, or `npx t3 pair`". T3 Connect: "Waiting for your computer…" only while discovery is refreshing. No projects: "No projects yet" with an "Add project" action                                                                    | F-24-01, F-24-02, F-24-12; 07                      |

### 8.2 Proposed flow at a glance

`Gate (01)` then `Computers (02, only for more than one computer, hosted, remote-only, or via "Add another computer")` then `Agents (03)` then `Projects (04)` then `First draft (05)`. Re-entry (06, 08): composer chip, banner, command palette ("Open setup", "Set up agents"), Settings > General > About ("Setup", "Release notes"), Providers empty state. Mobile (07) is a remote for a computer that already runs T3 Code, so it has no wizard. Close on a re-entered wizard returns to the previous location (DNA-P7).

### 8.3 Gap list judged against DNA and "exists already"

Verdict key: ADOPT = build (additive), REJECT = conflicts with DNA, DEFER = gated on maintainers.

| #   | Capability                                                 | Exists already (where)                                                                                                                                                | Verdict                                                                                                | DNA         | Findings, wireframes     |
| --- | ---------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | ----------- | ------------------------ |
| 1   | Provider detection with live auth status                   | Partial: same live atom as Providers (`providersValueAtom`); only Codex and Claude are probed, once per mount and on terminal close (`WelcomeWizard.tsx:651,722,854`) | ADOPT: "Other agents" row + "Check again"; "Also found" gated on a `which`-only server probe (F-09-30) | P3, P8      | F-24-03, F-24-07; 03     |
| 2   | Project folder pick and import                             | Import of Claude Code and Codex history is good; folder pick only on the hero and in the palette                                                                      | ADOPT small: "Add a project…" in the step footer calling the existing palette mode                     | P2, P7      | F-24-08; 04              |
| 3   | Sample project                                             | None; "Start without a project" is already the zero-friction sample                                                                                                   | REJECT: bundling a repo is new machinery that writes to the user's disk                                | P2          | 05 B                     |
| 4   | First-prompt suggestions                                   | None                                                                                                                                                                  | DEFER: optional, read-only, fills but never sends, needs maintainer sign-off                           | P2, ID3, P7 | F-24-15; 05 C            |
| 5   | Keyboard hint tour                                         | None; `DraftHeroHeadline` shows one shortcut in a tooltip                                                                                                             | REJECT the tour; ADOPT one quiet `Kbd` row for 24 h after setup, from live keybindings                 | L8, K14, P2 | F-24-14; 05 A            |
| 6   | Pairing explainer                                          | Exists three times in three voices (wizard "Need a pairing link?", hosted list, mobile caption)                                                                       | ADOPT: one voice, one three-step list, mobile parity                                                   | V7, V6, X2  | F-24-01, F-24-12; 02, 07 |
| 7   | Re-entry when a provider is missing                        | Pieces exist, unlinked: `/welcome#agents:<id>`, `openProviderSetup`, chip is a dead end with no instance                                                              | ADOPT: one branch in one hook plus two palette rows                                                    | P7, P8, K14 | F-24-05; 06              |
| 8   | Permission modes in plain words                            | Strings exist (`runtimeModeConfig.ts`); absent from first run; default is Full access (`providerPolicy.ts:32`)                                                        | ADOPT: collapsed one-line disclosure; default unchanged                                                | V5, P3      | F-24-04; 03 B            |
| 9   | Skip everything, power-user path                           | Partial: X completes silently, Escape ignored, Enter on the wrong control                                                                                             | ADOPT: Skip button, Escape, focus fix, 2-step flow for one computer                                    | K14, P7, V2 | F-24-06, F-24-10; 02-04  |
| 10  | Re-entry from Settings and palette                         | None (`/welcome` by URL only; Issue #10961, PRs #22411, #23122)                                                                                                       | ADOPT: Settings "Setup" row and palette rows                                                           | P7, P8, L6  | F-10-02; 08, 06 C        |
| 11  | Empty-state coaching                                       | Present, weak; area 10 owns                                                                                                                                           | REJECT overlays and coach marks; fix in place                                                          | ID3         | F-10-18..24              |
| 12  | What is new after an update                                | Nothing after the update; release notes only in the pre-update toast and sidebar pill                                                                                 | REJECT a modal, version diff or badge; ADOPT one About row                                             | P2, P7      | F-24-16; 08              |
| 13  | Mobile first launch                                        | Bare empty state                                                                                                                                                      | ADOPT                                                                                                  | P3, X3      | F-24-01, F-24-02; 07     |
| 14  | Honest consent                                             | Notice points to a privacy policy; real opt-out is `T3CODE_TELEMETRY_ENABLED=false`                                                                                   | ADOPT copy only; an in-app toggle is a server change (dependency)                                      | V3, V5      | F-24-11; 02              |
| 15  | Environment pre-flight (Linux sandbox #22626, PATH #10728) | Server startup hint; panels show `sudo t3 browser setup`                                                                                                              | REJECT in the wizard (it would become a doctor); revisit with `t3 doctor`                              | P2          | none                     |
| 16  | Account creation                                           | None by design (bring your own subscription; T3 Connect optional)                                                                                                     | N/A, keep                                                                                              | P2          | none                     |
| 17  | Progress survives Back                                     | PR #24719 fixes selection loss                                                                                                                                        | BORROW (graded in section 12)                                                                          | P3          | none                     |

### 8.4 Wireframe index

| Path                                                             | What it shows                                                                                                                                                                               | Findings                           |
| ---------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| `ui-overhaul/spec/onboarding/01-gate-and-recovery.md`            | Pending card (spinner after 1 s, "Connecting…") and "Still connecting" recovery card in one shared shell with a drag region and "Open Connections"; 1280 and 390                            | F-10-05, F-10-06, F-10-09          |
| `ui-overhaul/spec/onboarding/02-wizard-computers.md`             | Computers step made conditional; footer slot (Skip setup, Continue); telemetry copy; 1280 and 390                                                                                           | F-24-06, F-24-10, F-24-11          |
| `ui-overhaul/spec/onboarding/03-wizard-agents.md`                | Agents step: computer line with "Checked just now" + refresh, Codex and Claude cards, "Other agents" row, collapsed permissions disclosure and its expanded form, no-agent-ready state, 390 | F-24-03, F-24-04, F-24-07, F-10-15 |
| `ui-overhaul/spec/onboarding/04-wizard-projects.md`              | Projects step: candidates, "Importing 2 of 7…", nothing-to-import state, "Add a project…"; 1280 and 390                                                                                     | F-24-08, F-24-09, F-10-07          |
| `ui-overhaul/spec/onboarding/05-first-draft-landing.md`          | Draft hero with `DraftKeyHints`, zero-project hero with import button, optional starter prompts (gated), 390                                                                                | F-24-14, F-24-15, F-10-02          |
| `ui-overhaul/spec/onboarding/06-reentry-missing-provider.md`     | Composer chip and banner, re-entered wizard on Agents, command palette rows, Providers empty state, 390 and native                                                                          | F-24-05, F-24-13, F-10-24          |
| `ui-overhaul/spec/onboarding/07-mobile-first-launch.md`          | Native Home empty state, Add environment sheet, T3 Connect sheet, connected-no-projects, first message                                                                                      | F-24-01, F-24-02, F-24-12          |
| `ui-overhaul/spec/onboarding/08-settings-entries-and-updates.md` | General > About "Release notes" and "Setup" rows (1280, 390, mobile)                                                                                                                        | F-24-16, F-10-02                   |

### 8.5 What is wiring or copy, and what is a new component

New UI is deliberately small: **one new component** (`DraftKeyHints`, F-24-14, needs maintainer sign-off), **one new size variant** on an existing primitive (`Empty size="inline"`, F-10-25), **one extracted shell** (`FirstRunShell`, F-10-05). Everything else reuses `components/ui/*`, Lucide, `AgentCard`, `Collapsible`, `RadioGroup`, `ProviderLastChecked` (export, do not copy), `runtimeModeConfig`, `openCommandPalette`, mobile `EmptyState`, `ListSection`, `FloatingActionButton`.

| Finding | Sev | Kind                                                                | What changes                                                                                                                                                                                              | Effort | Upstream-eligible                              | DNA                             |
| ------- | --- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ | ---------------------------------------------- | ------------------------------- |
| F-24-01 | P1  | copy + composition of existing                                      | `deriveEmptyState` copy, `ListSection` of three non-pressable rows, FAB label, sheet caption and helper                                                                                                   | S      | yes (align with #24150)                        | DNA-P3, P9, V5, V6, V7, X3      |
| F-24-02 | P1  | wiring + copy                                                       | "No projects yet" with `Button` "Add project" to the existing `AddProject` route; wire "New task" FAB label                                                                                               | XS     | yes                                            | DNA-P7, P3, V2                  |
| F-24-03 | P1  | composition (static row + link); server dependency for "Also found" | "Other agents" row, "Open Providers" link with return `/welcome#agents:<id>`; probe is F-09-30 (M, server)                                                                                                | S UI   | static row yes; probe separate                 | DNA-P3, P8, V5                  |
| F-24-04 | P1  | composition + wiring                                                | `Collapsible` + `RadioGroup` over `runtimeModeConfig`; writes `defaultRuntimeMode` via `serverEnvironment.updateSettings`. Default NOT changed (product decision)                                         | S      | yes                                            | DNA-V5, P3, P2                  |
| F-24-05 | P1  | wiring + copy                                                       | One branch in `openProviderSetup` (`chat/useComposerSelection.ts:118`, pure rule in `providerReadiness.logic.ts`), chip always enabled, banner action, two palette rows, `Empty` composition on Providers | M      | palette rows now; chip and banner after #24865 | DNA-P7, P8, V2, D5, K14         |
| F-24-06 | P2  | wiring (entry rule)                                                 | Conditional Computers step in `WizardPopup`; flow decision for maintainers                                                                                                                                | M      | no                                             | DNA-P2, P8, V6                  |
| F-24-07 | P2  | wiring + copy                                                       | Export `ProviderLastChecked`, `refreshProviders`, one `visibilitychange` listener, one helper line                                                                                                        | S      | yes                                            | DNA-P3, P1, M6, V9              |
| F-24-08 | P2  | wiring                                                              | Footer button: `finish()` then `openCommandPalette({ open: "add-project" })`; enabled Continue at zero candidates                                                                                         | XS     | yes                                            | DNA-P2, P7, V9                  |
| F-24-09 | P2  | state only                                                          | `{done, total}` in the existing import loop, `role="status"`, `tabular-nums`, shared `Spinner`                                                                                                            | XS     | yes                                            | DNA-P3, T8, M6, V9              |
| F-24-10 | P2  | wiring                                                              | Optional `footer` prop on `WizardPopup` (shared with Add-provider wizard), Skip, Escape, `id="onboarding-continue"` focus; bundle with F-10-10/11/12                                                      | M      | yes (as that bundle)                           | DNA-K14, P7, V2, D6             |
| F-24-11 | P2  | copy only                                                           | One sentence naming the env var in mono, link to docs; toggle is a server setting (dependency)                                                                                                            | XS     | no (policy copy)                               | DNA-V3, V5, P3, T7              |
| F-24-12 | P2  | copy                                                                | Shared sentences, strings stay beside each client's component                                                                                                                                             | S      | yes                                            | DNA-V7, V6, X2                  |
| F-24-13 | P3  | wiring                                                              | Hero only when `useProjects().length === 0`; Close goes back                                                                                                                                              | XS     | yes                                            | DNA-P7                          |
| F-24-14 | P3  | **new component**                                                   | `DraftKeyHints`: three `Kbd` hints, 24 h, empty draft only, hidden on touch, labels from live keybindings                                                                                                 | S      | no, until accepted                             | DNA-L8, K14, P3, P2             |
| F-24-15 | P3  | optional new block (recommended: do not build)                      | Up to three read-only starter sentences that fill, never send                                                                                                                                             | S      | no                                             | DNA-P2, ID3 (argue against), P7 |
| F-24-16 | P3  | composition                                                         | Two `SettingsRow` + `Button outline sm` in About; mobile About gains "Release notes"                                                                                                                      | XS     | "Setup" row yes (F-10-02); release notes no    | DNA-P2, P7, L6, K16             |

Server and cross-area dependencies (UI part is gated, never faked): F-10-01 (`bootstrapProjectCreated` and `bootstrapThreadCreated` in `serverRuntimeStartup.ts:262-330`); F-09-30 (probe for undiscovered drivers); login-shell PATH refresh (#9429); in-app telemetry toggle (Issue #4123); product decision on the Full access default. Order of work: (1) no #24865 overlap: F-24-04, 07, 08, 09, 11, mobile F-24-01, 02, About rows, palette rows; (2) with the F-10 wizard bundle: F-24-06, F-24-10; (3) after #24865 merges: chip and banner branch, `DraftKeyHints` (both sit beside its `ChatComposer.tsx` and `ComposerControlsBar.tsx` hunks); (4) server work.

### 8.6 Acceptance criteria

1. One local computer, one ready agent: the flow is Agents then Projects then draft; no Computers screen; Continue holds initial focus (Enter continues); a stepper shows two chips.
2. Escape and the X on any step finish setup without importing (not while importing); a visible "Skip setup" ("Skip import" on the last step) is reachable without scrolling at 800x600 and at 200% zoom (sticky footer).
3. Agents step shows live status for Codex and Claude from the same atom as Providers; no provider is shown ready without live status; an "Other agents" row links to `/settings/providers` and returns to `/welcome#agents:<environmentId>`.
4. "Check again" calls `refreshProviders`; regaining window focus triggers at most one refresh; there is no polling; the refresh icon uses the shared `Spinner`.
5. With zero ready agents Continue is an outline button, the note names the computer and the place ("Settings → Providers"), and Continue is never disabled (DNA-P7).
6. The permissions row shows the current `defaultRuntimeMode` label and description from `runtimeModeConfig`; changing it writes `defaultRuntimeMode`; the initial default is unchanged.
7. Zero import candidates: Continue is enabled, "Import 0 projects" does not exist, "Add a project…" opens the add-project palette, the exit button reads "Skip import".
8. Import shows `Importing N of M…` (`role="status"`); the dialog stays locked while it runs; partial failure keeps the existing warning toast.
9. Composer chip with no usable provider is enabled and reads "Set up an agent"; it opens `/welcome#agents:<environmentId>` for Codex or Claude install or sign-in when terminal scope is granted, otherwise `/settings/providers`; Close returns to the previous location; the zero-project hero renders only with zero projects.
10. Command palette lists "Open setup" and "Set up agents"; Settings > General > About has "Release notes" and "Setup"; mobile About has "Release notes".
11. Telemetry notice names `T3CODE_TELEMETRY_ENABLED=false` in mono and links the docs; no toggle is implied.
12. Mobile: Home empty state reads "No computer connected" with three steps and FAB "Connect a computer"; "No projects yet" has "Add project"; the T3 Connect "Waiting for your computer…" row shows only while discovery is refreshing; mobile says "computer" in every first-run string.
13. `DraftKeyHints` (if accepted): visible for 24 h after `onboardingCompletedAt` on an empty draft only, labels from live keybindings, omitted (not an empty `Kbd`) when unbound or while keybindings load, hidden on touch.
14. Pending gate: shared shell with a drag region on desktop, spinner and "Connecting…" only after 1 s, recovery card offers "Open Connections".
15. All new text uses the two text tiers (no alpha greys, DNA-C4) at 4.5:1 or better; touch rows are 44 px; no new colour literal; no new animation (shared `Spinner` only; reduced motion unaffected).
16. No new dependency, icon set, setting, keybinding or permission mode; no change to `apps/server`, auth, pairing or relay; every new surface has a reverse (Skip, Close, Setup row, palette).

## 9. Motion spec

Inputs: `audit/19-motion.md` (13 findings, P2 4 / P3 9; live Playwright runs, `getAnimations()` and per-frame sampling), F-16-13, F-12-16, F-01-31, F-04-19, F-07-27, DNA section 7. State today: idle thread has 0 running animations (identical under reduce); panels are instant by default and eased only when the user raises Panel animations; but dialogs (200 ms), route modals (150 ms), popovers (150 ms), toasts (500 ms) and press feedback ignore both the slider and the OS flag, and durations in use span 100, 120, 150, 180, 200, 220, 250, 500, 600 and 650 ms (DRIFT-18). There is no global `prefers-reduced-motion` rule, only the `.no-transitions` theme-swap window (`index.css:1086-1092`).

### 9.1 Rule set

| #   | Rule                                                                                                                                                                                                                                                                                                                                              | DNA            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| R1  | **120-220 ms.** Every transition on a popup, modal, toast, menu or state change uses one of four durations: 120, 150, 200, 220 ms. Existing `duration-100` (6 uses, hover colour) sits in DNA-M4's 100-150 hover band and is left; no new 100. Streaming fade (600 ms) and the settings-search pulse (400 ms, once) are the only longer one-shots | DNA-M4, M2     |
| R2  | **Ease-out in, ease-in out.** Enter: `cubic-bezier(0, 0, 0.2, 1)`. Exit: `cubic-bezier(0.4, 0, 1, 1)`. Today overlays use `ease-in-out` `(.4,0,.2,1)` both ways. `--ease-drawer` `cubic-bezier(0.32, 0.72, 0, 1)` stays for things that slide or pop in (composer context, pills, toast transform)                                                | DNA-M4         |
| R3  | **None under reduced motion.** Every transition and animation resolves to 0.01 ms under the OS flag or the in-app `reduceMotion` setting (section 7, N4), by one global rule (section 9.4), not per component                                                                                                                                     | DNA-M5, M8     |
| R4  | **No bounce, glow or gradient.** No spring overshoot (MorphIcon uses a critically damped spring), no `animate-bounce`, no unstepped `animate-pulse`, no animated gradient, no animation of `box-shadow`, `filter` or `backdrop-filter`, no emoji                                                                                                  | DNA-M2, M3     |
| R5  | **Panels stay 0 ms by default.** Sidebar, right panel, terminal drawer and header padding are instant; the Panel animations slider (0-400 ms, 25 ms steps) and `data-panel-animations` gate are unchanged; any new panel-like surface joins the gate and never owns a duration. Closing uses ease-in                                              | DNA-M1, K4     |
| R6  | **Opacity and transform only.** Micro-interactions change colour, opacity, shadow colour or scale. Height or width transitions exist only behind the panel gate or inside `AnimatedHeight`                                                                                                                                                        | DNA-M3         |
| R7  | **Nothing loops unbounded.** Indicators stay stepped, duty-cycled and paused off-screen; the shared `Spinner` is the only spinner                                                                                                                                                                                                                 | DNA-M2, M6, K5 |
| R8  | **Streaming never replays;** theme and appearance swaps are 0 ms                                                                                                                                                                                                                                                                                  | DNA-M7, M8     |
| R9  | **Mobile uses the same ladder.** `MOBILE_MOTION` `adjust 120 / enter 200 / exit 150` maps to micro / base / fast; off-ladder 240-260 ms in-out animations move onto it                                                                                                                                                                            | DNA-X2, M4     |

### 9.2 Token table

Durations are the Tailwind classes already in use (`duration-120/150/200/220`); no new CSS variable per duration (DNA-P2). Easings become three named properties next to `--ease-drawer` (`index.css:192`); `--default-transition-timing-function: cubic-bezier(0, 0, 0.2, 1)` makes every unmarked hover and popup enter ease-out (F-19-04).

| Token                      | ms                                                   | Easing                                                                     | Used by                                                                                                                                                                                                                                              |
| -------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `motion-micro`             | 120                                                  | `--ease-out`                                                               | Menu and select popup enter (F-19-05), slider thumb (`index.css:990-993`), mobile `adjust`                                                                                                                                                           |
| `motion-fast`              | 150                                                  | enter `--ease-out`, exit `--ease-in`                                       | Popover, tooltip, combobox, autocomplete, preview card, route modal (Settings, Usage), anchored toast, buttons (`box-shadow`, `scale`), switch thumb, collapsible, `Sidebar.motion.ts` rows, scrollbar fade, toast opacity and height, mobile `exit` |
| `motion-base`              | 200                                                  | enter `--ease-out` (`--ease-drawer` for toast transform), exit `--ease-in` | Dialog and backdrop, sheet, stacked toast transform, `AnimatedHeight`, context meter, update icon, attachment strip, mobile `enter`                                                                                                                  |
| `motion-ceiling`           | 220                                                  | `--ease-in` exit                                                           | Composer banner stack exit (the model for exits), MorphIcon settle (critical spring, 2% at about 220 ms)                                                                                                                                             |
| `motion-panel`             | `--panel-animation-duration` (default 0, user 0-400) | open `--ease-out`, close `--ease-in`                                       | Sidebar, right panel, terminal drawer, header padding, small grid-row transitions (F-19-10)                                                                                                                                                          |
| `motion-stream`            | 600                                                  | `--ease-out`, opacity only                                                 | Streaming markdown block (`@starting-style`, `data-streaming` only)                                                                                                                                                                                  |
| `motion-pulse`             | 400, once                                            | `--ease-out`, opacity on a pseudo-element                                  | Settings-search target highlight (F-19-11)                                                                                                                                                                                                           |
| loops                      | 2000-2400, stepped                                   | `steps(n)`                                                                 | `status-pulse`, `status-ping`, `skeleton`, `live-tool-shine`, `live-activity-focus`, `Spinner` (1 s linear, paused off-screen): unchanged (DNA-K5)                                                                                                   |
| `--ease-out` / `--ease-in` | n/a                                                  | `cubic-bezier(0, 0, 0.2, 1)` / `cubic-bezier(0.4, 0, 1, 1)`                | New properties; `--ease-drawer` stays                                                                                                                                                                                                                |

### 9.3 Per-surface table

| Surface                                                                                  | Enter                                                                                                                | Exit                                                                 | Reduced motion                                                                                                                                                                                                               | Finding                   |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Sidebar, right panel, terminal drawer, header padding                                    | 0 ms; user value with ease-out                                                                                       | 0 ms; user value with ease-in                                        | Forced 0 by `usePanelAnimationSettings`; row shows why when OS flag is on                                                                                                                                                    | F-19-08, F-07-27, DNA-K4  |
| Sidebar drag resize                                                                      | 0 ms (forced)                                                                                                        | 0 ms                                                                 | n/a                                                                                                                                                                                                                          | none                      |
| Small layout transitions (git output, PR detail sections, `sidebar.tsx:685`)             | `transition-opacity` 150 ms; heights only when `data-panel-animations=true`                                          | same                                                                 | `motion-reduce:transition-none` kept; global rule                                                                                                                                                                            | F-19-10                   |
| Dialog + backdrop                                                                        | 200 ms ease-out, opacity + scale .98 + translate                                                                     | 200 ms ease-in; backdrop `transition-opacity` (not `transition-all`) | Global rule                                                                                                                                                                                                                  | F-19-04, F-16-13, F-12-16 |
| Route modal (Settings, Usage)                                                            | **Add** 150 ms ease-out (`starting:opacity-0 starting:scale-[0.985]`; backdrop `starting:opacity-0`)                 | 150 ms ease-in                                                       | Global rule                                                                                                                                                                                                                  | F-19-01, F-01-31          |
| Sheet (`ui/sheet.tsx`)                                                                   | 200 ms ease-out, translate 2rem + opacity                                                                            | 200 ms ease-in                                                       | Global rule                                                                                                                                                                                                                  | F-19-04, F-01-31          |
| Popover, tooltip, combobox, autocomplete, preview card                                   | 150 ms ease-out, scale .98 + opacity                                                                                 | 150 ms ease-in                                                       | Global rule                                                                                                                                                                                                                  | F-19-04                   |
| Menu popup, select popup                                                                 | **Add** 120 ms ease-out, scale .98 + opacity                                                                         | Instant (no `data-ending-style`; keeps keyboard use snappy)          | Global rule                                                                                                                                                                                                                  | F-19-05                   |
| Stacked toast                                                                            | 200 ms transform (`--ease-drawer`), 150 ms opacity and height (was 500 ms; content opacity 250 to 150)               | 150 ms ease-in                                                       | Global rule (was none)                                                                                                                                                                                                       | F-19-03, F-12-16, F-12-25 |
| Anchored toast                                                                           | 150 ms scale + opacity                                                                                               | 150 ms                                                               | Global rule                                                                                                                                                                                                                  | F-12-16                   |
| Buttons (press and hover)                                                                | 150 ms `box-shadow` + `scale`, `active:scale-[0.97]`                                                                 | same                                                                 | Global rule; send button: `transition-[background-color,box-shadow,scale]` (not `transition-all`) with `motion-safe:hover:scale-105` and `motion-safe:active:scale-[0.97]`, same prefix on the `ComposerControl` press scale | F-16-13, F-04-19          |
| Switch thumb, MenuSwitch                                                                 | 150 ms                                                                                                               | 150 ms                                                               | Global rule                                                                                                                                                                                                                  | F-16-13                   |
| Collapsible, `AnimatedHeight`, `AnimatedWidth`                                           | height 200 ms / width 150 ms ease-out                                                                                | same, ease-in                                                        | `motion-reduce:transition-none` kept                                                                                                                                                                                         | DNA-M3                    |
| MorphIcon (about 45 sites)                                                               | Critical spring `{ stiffness: 700, damping: 53 }`, no overshoot, 2% at about 220 ms                                  | same                                                                 | `reducedMotion="user"` replaced by the shared hook so the in-app flag applies                                                                                                                                                | F-19-07                   |
| Sidebar list rows (`Sidebar.motion.ts`)                                                  | 150 ms ease-out WAAPI; skipped above 40 changed rows                                                                 | same                                                                 | Reads the hook                                                                                                                                                                                                               | DNA-K5                    |
| Streaming markdown block                                                                 | 600 ms opacity only, `@starting-style`                                                                               | n/a                                                                  | Only under `no-preference` (existing)                                                                                                                                                                                        | DNA-M7, K5                |
| Status pulse, ping, skeleton, tool shine, focus sweep                                    | Stepped loops, paused off-screen                                                                                     | stops with the work                                                  | Static glyph (decision D-M1 below)                                                                                                                                                                                           | DNA-K5, M9                |
| Spinner (shared) and the 4 raw `animate-spin` / `animate-pulse` loops                    | `Spinner` only: 1 s linear, `role="status"`, paused off-screen                                                       | n/a                                                                  | Static glyph; raw loops removed (thread loading controls, fork icon, tree loading)                                                                                                                                           | F-19-06, F-03-36, F-05-32 |
| Settings-search target highlight                                                         | 400 ms once, opacity on a `::after` ring (was `box-shadow` x2, 650 ms)                                               | n/a                                                                  | Class not added under reduce (existing)                                                                                                                                                                                      | F-19-11                   |
| Preview load bar                                                                         | 5.3 s decelerating, then 150 ms fade (DNA-M2 exception)                                                              | n/a                                                                  | Static `scaleX(.9)` (existing)                                                                                                                                                                                               | DNA-M2                    |
| Composer banner stack and neighbours                                                     | Banner stack enter unchanged; context label 180 ms and stash badge 180 ms `--ease-drawer`; find bar 150 ms           | Banner stack 220 ms ease-in (model for exits)                        | `motion-reduce` kept on most; global rule for the rest                                                                                                                                                                       | F-19-09                   |
| Context meter, update icon, attachment strip                                             | 200 ms (was 500, 300, 300)                                                                                           | 200 ms                                                               | `motion-reduce` on the first two; global rule for all                                                                                                                                                                        | F-19-09, F-04-19          |
| Ping dots                                                                                | stepped                                                                                                              | stepped                                                              | n/a; delete inert `duration-2000`                                                                                                                                                                                            | F-19-12                   |
| Scrollbars                                                                               | 150 ms fade + 300 ms delay                                                                                           | same                                                                 | Global rule                                                                                                                                                                                                                  | F-16-13                   |
| Phone-width composer view transition                                                     | variable duration                                                                                                    | same                                                                 | `draftHeroTransition.ts:50` reads the hook                                                                                                                                                                                   | DNA-X4                    |
| Theme or appearance swap                                                                 | 0 ms (`.no-transitions`)                                                                                             | 0 ms                                                                 | n/a                                                                                                                                                                                                                          | DNA-M8                    |
| Mobile: workspace panes, dictation flip, voice control, floating control, env row layout | `MOBILE_MOTION.enter` 200 ms `Easing.out(Easing.cubic)` (was 240-260 ms in-out)                                      | `MOBILE_MOTION.exit` 150 ms                                          | `ReduceMotion.System`; entering animations skipped under reduce via one `enteringIfMotion` helper (Android otherwise leaves views at opacity 0)                                                                              | F-19-13, F-15-16          |
| Mobile: swipe rows, work-log shimmer                                                     | Spring with `overshootClamping: true` (keep); one gated shimmer loop that stops on reduce, blur and off-focus (keep) | n/a                                                                  | Already compliant                                                                                                                                                                                                            | F-19 "Already good"       |

Decision D-M1 (owner): under reduced motion the Spinner and Working dots become static glyphs (`motion-safe:` gating), which pulls DNA-M9 ("status must not lie") against R3. Recommended default: static glyph, with liveness carried by the ticking text ("Working 9s"). Alternative: allow `status-pulse` (opacity only, stepped, no movement) as the reduced-motion cue. Not decided here.

### 9.4 Global reduced-motion rule (proposal)

One block next to `.no-transitions` (`index.css:1086`), mirroring its mechanism (DNA-M8). It supersedes the per-component fixes F-12-16, F-01-31 and the reduced half of F-04-19, and covers every Base UI overlay (palette, popover, tooltip, switch thumb, theme orbs, button `active:scale`, chevron rotate, toast, backdrop) without touching 10+ files.

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    transition-duration: 0.01ms !important;
    transition-delay: 0s !important;
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
/* in-app override (section 7, N4): same declarations under html[data-reduce-motion="true"] */
```

- 0.01 ms, not 0 s: Base UI waits on `getAnimations()`, and this keeps `transitionend` firing (F-16-13). The theme-swap window uses 0 s because nothing waits on it.
- Minimal fallback if maintainers object to `animation-*`: F-19-02's transition-only form (all keyframes are already gated by `motion-safe:` or a media query, DNA-K5). The `animation-*` lines are a safety net so a future un-gated keyframe cannot ship (DNA-M5).
- Leave MorphIcon and the WAAPI paths (`Sidebar.motion.ts`, `pageScrollController.ts`) alone in CSS; they read the media query themselves and move to the shared hook with N4.
- Declare the rule twice or through the N4 custom variant; the two copies must stay identical.
- Tests: add a Playwright `reducedMotion: "reduce"` census (palette, popover, tooltip, switch, toast) asserting zero transitions with a non-zero duration; idle `getAnimations()` stays 0.

### 9.5 Delivery order and upstream status

| Wave                                  | Findings                                                                                                                                                                                                                      | Effort  | Upstream-eligible                                                     |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------- |
| Motion wave 1 (XS, no #24865 overlap) | F-19-01 route modal enter (MO-2), F-19-02 global rule (MO-1), F-19-03 toast timings (MO-3), F-19-05 menu enter, F-19-07 MorphIcon spring, F-19-09 four durations, F-19-12 inert class (all MO-8), F-19-06 Spinner swap (MO-5) | XS each | yes. ADOPT PR #22100 already covers 3 of the 4 raw spinners (F-19-06) |
| Motion wave 2 (S)                     | F-19-08 closing curve, F-19-10 panel gate for small layout transitions, F-19-11 highlight (all MO-9), F-19-13 mobile tokens (MO-7), F-04-19 send button (MO-4)                                                                | S each  | yes                                                                   |
| Motion wave 3                         | F-19-04 ease-out default and ease-in exits (MO-9; global feel, open an issue first), section 7 N4 `reduceMotion` (C-7)                                                                                                        | S, M    | no (global feel change; setting needs approval)                       |

DNA text corrections to carry into section 7.1 of the DNA (code wins, DNA section 0.5): menus and selects have no motion today (measured); MorphIcon's spring is not listed; toast timings are 500 / 250 ms; DNA-M4 says 100-150 ms for hover while this spec's band is 120-220 ms (existing `duration-100` is grandfathered).

## 10. Copy table

Merges the 40-row table of `audit/20-copy-and-voice.md` (CT#) with the copy findings of areas 10, 12, 24, 01, 06, 15 and 17. Final copy is sentence case with no trailing period on labels, titles and buttons (DNA-V1, DNA section 8.2). Strings in backticks are literal UI text. 73 rows. Rows marked **[D1]**, **[D2]** or **[D3]** change with the decisions in section 10.5; the wording shown is the default taken if nobody decides. "Hold" = do not edit until #24865 merges (it touches `SettingsPanels.tsx`, `settingsSearch.ts`, `BranchToolbar*.tsx`, `ChatComposer.tsx`).

### 10.1 Terminology (DNA-V7: use the product vocabulary, coin no synonyms)

| #   | Current                                                                                                                                                                                                         | Proposed                                                                                                                                                                                                                                     | File:line                                                                                                                                                                                                                                                                                         | DNA          | Finding                 |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ----------------------- |
| 1   | `Add to another machine`, `Choose a machine to continue`, `Checking machine resources`, `Attached thread is on another machine`, `Keep attachments on this machine`, `None of your machines ...`                | `Add to another environment`, `Choose an environment to continue`, `Checking environment resources`, `Attached thread is on another environment`, `Keep attachments on this environment`, `None of your environments ...` **[D1]**           | `BranchToolbarEnvironmentSelector.tsx:63,165`; `BranchToolbar.tsx:381`; `AddProjectToMachineDialog.tsx:213,254`; `chat/composerSend.logic.ts:22,32`; `chat/useComposerSend.ts:553-554`; `chat/useDraftEnvironmentRouting.ts:140`; `promptLinks/NewThreadLinkView.tsx:183` (hold `BranchToolbar*`) | V7, DRIFT-19 | F-20-04 (CT20)          |
| 2   | `Enter a backend host and pairing code.`, `this backend`, `Backend + agents`, `All servers`, `No projects in this workspace`, `You're not connected to a server yet.`                                           | `Enter the environment's host and pairing code.`, `this environment`, `T3 server + agents`, `All environments`, `No projects yet`, `You're not connected to an environment yet.` **[D1]**                                                    | `settings/AddEnvironmentDialog.tsx:629`; `settings/AuthorizedClientsSettings.tsx:677`; `settings/ResourceTelemetryDiagnostics.tsx:1081`; `pullRequest/PullRequestsPage.tsx:1220`; `pullRequest/PullRequestListEmptyState.tsx:76`; `settings/IntegrationsSettings.tsx:1219`                        | V7           | F-20-04 (CT21)          |
| 3   | `Local checkout`, locked `Worktree`                                                                                                                                                                             | `Current checkout`, `Current worktree`                                                                                                                                                                                                       | `BranchToolbar.logic.ts:113-114` (hold)                                                                                                                                                                                                                                                           | V7           | F-20-19 (CT39)          |
| 4   | `Add to chat`, `Unable to add to chat`, `The chat isn't ready to accept input right now.`                                                                                                                       | `Add to composer`, `Could not add to composer`, `The composer is not ready for input yet.`                                                                                                                                                   | `files/FileBrowserPanel.tsx:206,240-250`; `ThreadTerminalDrawer.tsx:366`; `chat/ChatComposer.tsx:2853`; `ChatView.tsx:1813`                                                                                                                                                                       | V7, V4       | F-20-05, F-20-11 (CT22) |
| 5   | `Open chat`, `Start a new chat to switch providers`, `after a conversation has started`, `Rewind chat to before this message`                                                                                   | `Open thread`, `Start a new thread to switch providers`, `after the thread has started`, `Rewind to before this message`                                                                                                                     | `chat/V2LifecycleRow.tsx:171,186`; `chat/TimelineWorkEntryRow.tsx:464`; `ChatView.logic.ts:1033,1050,1051`; `chat/ChatOverlayHosts.tsx:210`                                                                                                                                                       | V7           | F-20-05 (CT23)          |
| 6   | `Add to agent` (PR code tab)                                                                                                                                                                                    | `Ask agent`                                                                                                                                                                                                                                  | `pullRequest/PullRequestCodeTab.tsx:925,929`                                                                                                                                                                                                                                                      | V2           | F-20-11 (CT32)          |
| 7   | `Search refs...`, `No refs found.`, `No matching refs.`, `Select ref`, `Sync ref`, `Loading refs...`, `Showing 20 of 41 refs`                                                                                   | `Search branches`, `No branches found`, `No matching branches`, `Select branch`, `Sync branch`, `Loading branches…`, `Showing 20 of 41 branches`                                                                                             | `BranchPicker.tsx:174,192`; `DiffPanel.tsx:757,768`; `BranchToolbar.logic.ts:218`; `GitActionsControl.logic.ts:271`; `BranchToolbarBranchSelector.tsx:320`; `WorktreeBaseBranchPicker.tsx:69` (hold `BranchToolbar*`)                                                                             | V7, V9       | F-20-07 (CT17, CT18)    |
| 8   | `Commit & push to default ref?`, `Push to default ref?`, `continue on this ref or create a feature ref`; toast `Failed to switch ref.`                                                                          | `Commit & push to the default branch?`, `Push to the default branch?`, `continue on this branch or create a feature branch`; hint `Create and check out a branch before pushing or opening a pull request.`; toast `Could not switch branch` | `GitActionsControl.logic.ts:210,336,342-362`; `BranchToolbarBranchSelector.tsx:430,467`                                                                                                                                                                                                           | V7, V4       | F-20-07 (CT19), F-12-13 |
| 9   | `Chat: New`, `Chat: New Local`, `Chat: New Without Project`, `Chat: Find`                                                                                                                                       | `Thread: New`, `Thread: New in current project`, `Thread: New without project`, `Thread: Find` (ids `chat.*` and stored bindings unchanged; keep "chat" in `searchTerms`)                                                                    | `settings/KeybindingsSettings.logic.ts:359-385`; ids `packages/contracts/src/keybindings.ts:102-105`                                                                                                                                                                                              | V7           | F-20-02 (CT5)           |
| 10  | `Composer: Host`, `Composer: Cycle Host`                                                                                                                                                                        | `Composer: Environment`, `Composer: Cycle environment` **[D1]**                                                                                                                                                                              | same generator; ids `composer.host`, `composer.cycleHost` (`keybindings.ts:93-94`)                                                                                                                                                                                                                | V7           | F-20-02, F-20-04 (CT6)  |
| 11  | `Queue: Send First Queued Message`; `Composer: Opposite Queue or Steer Action`                                                                                                                                  | `Queue: Send first queued message as steer` (docs already say so, `docs/user/keybindings.md:22`); `Composer: Send with opposite follow-up`                                                                                                   | `settings/KeybindingsSettings.logic.ts:363`; `:360`                                                                                                                                                                                                                                               | V7, V1       | F-20-02 (CT7, CT8)      |
| 12  | row label `Done`                                                                                                                                                                                                | `Completed` (one `THREAD_STATE_LABELS` const shared by pill and row; row keeps the short form, tooltip shows the long one)                                                                                                                   | `sidebar/SidebarThreadRow.tsx:703`; const in `Sidebar.logic.ts`                                                                                                                                                                                                                                   | V7           | F-20-03 (CT3)           |
| 13  | `Woke`, `Dismiss Woke notification`                                                                                                                                                                             | `Woke from snooze` (mobile's wording), `Dismiss wake notice`                                                                                                                                                                                 | `sidebar/SidebarThreadRow.tsx:697,1157,1166,1318,1330`                                                                                                                                                                                                                                            | V7, V8       | F-20-03 (CT4)           |
| 14  | `Pairing token`, `Paste a one-time token or pairing secret`, `Could not create pairing URL`, `To edit these settings, pair this connection with both View relay and Manage relay permissions.`                  | `Pairing code`, `Paste a one-time pairing code`, `Could not create pairing link`, `To edit these settings, pair again with both View relay and Manage relay permissions.`                                                                    | `auth/PairingRouteSurface.tsx:97,107`; `settings/AuthorizedClientsSettings.tsx:631`; `settings/SavedEnvironmentRows.tsx:690`                                                                                                                                                                      | V7           | F-20-09 (CT25, CT27)    |
| 15  | `Deregister`, `Deregister server`, `Server deregistered`                                                                                                                                                        | `Remove from T3 Connect`, `Remove from T3 Connect`, `Removed from T3 Connect`                                                                                                                                                                | `clerk/T3ConnectUserProfilePage.tsx:64,78,152,170`                                                                                                                                                                                                                                                | V7, V8       | F-20-09 (CT26)          |
| 16  | `Open in integrated browser`, `Open file in preview browser`, `Open this URL in the in-app preview ...`; `Default browser viewport` / zoom / appearance / profile; `open it in your default browser either way` | `Open in browser panel`, `Open file in browser panel`, `Open this URL in the browser panel ...`; `Browser panel viewport` / zoom / appearance / profile; `open it in your system browser either way`                                         | `chat/externalLinkContextMenu.ts:27`; `chat/MarkdownFileLink.tsx:254`; `files/FilePreviewPanel.tsx:1269`; `projectScriptEditor.tsx:506`; `settings/settingsSearch.ts:755-773` (hold); `settings/IntegrationsSettings.tsx:359,374,467,483,510,528,644,1084`                                        | V7           | F-20-10 (CT33, CT34)    |
| 17  | button `Setup Required`                                                                                                                                                                                         | `Set up` (tooltip `Open Settings → Source control to set up this provider.`) **[D2]**                                                                                                                                                        | `CommandPalette.tsx:1073,1078`; `GitActionsControl.tsx:669,675`                                                                                                                                                                                                                                   | V2           | F-20-06 (CT15)          |
| 18  | heading `Agent providers`; wizard `Choose an agent to start coding. You can add more later.`                                                                                                                    | `Providers`; `Choose an agent to start coding. Agents are set up under Providers in Settings; you can add more later.`                                                                                                                       | `settings/AcpSessionManagementSection.tsx:460`; `onboarding/WelcomeWizard.tsx:673-674`                                                                                                                                                                                                            | V7, V5       | F-20-18                 |
| 19  | `Version Control` (section and Thread details card), `Source Control Providers`                                                                                                                                 | `Source control`, `Source control providers` **[D2]**                                                                                                                                                                                        | `settings/SourceControlSettings.tsx:598,601,608`; `chat/ThreadDetailsPanel.tsx:163`                                                                                                                                                                                                               | V1, V7       | F-20-06 (CT12)          |
| 20  | `Open Settings -> Source Control ...` (5 strings)                                                                                                                                                               | `Settings → Source control` **[D2]**                                                                                                                                                                                                         | `CommandPalette.tsx:1078`; `GitActionsControl.tsx:207,218,675`; `CommandPalette.logic.ts:813`                                                                                                                                                                                                     | V9           | F-20-17 (CT30)          |

### 10.2 Casing and punctuation (DNA-V1 sentence case; V9 single ellipsis; V10 literal counts)

| #   | Current                                                                                                                                                                                                                                              | Proposed                                                                                                                                                                                                    | File:line                                                                                                                                                                                                                                                                                                                                                                                      | DNA          | Finding                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------ | -------------------------------- |
| 21  | `Pending Approval`, `Awaiting Input`, `Guest Request`, `Plan Ready`                                                                                                                                                                                  | `Pending approval`, `Awaiting input`, `Guest request`, `Plan ready` (pills too: DRIFT-11 resolved toward V1; semantics unchanged, DNA-K2)                                                                   | `Sidebar.logic.ts:1076,1085,1094,1154`                                                                                                                                                                                                                                                                                                                                                         | V1           | F-20-03 (CT2)                    |
| 22  | Generated labels such as `Right Panel: Toggle Maximized`, `Command Palette: Toggle`, `Pull Request: Copy Number` (about 70)                                                                                                                          | `Right panel: Toggle maximized`, `Command palette: Toggle`, `Pull request: Copy number`; `titleCaseCommandSegment` (`:379`) becomes a sentence-case fallback; acronyms kept (`Preview: Focus URL`) **[D3]** | `settings/KeybindingsSettings.logic.ts:376-385`                                                                                                                                                                                                                                                                                                                                                | V1           | F-20-02, F-17-07 (CT9)           |
| 23  | `Up to Date`, `Check for Updates` (About)                                                                                                                                                                                                            | `Up to date`, `Check for updates`                                                                                                                                                                           | `settings/SettingsPanels.tsx:278,282` (hold)                                                                                                                                                                                                                                                                                                                                                   | V1           | F-20-06 (CT10)                   |
| 24  | Settings nav `Scheduled Tasks`, `Source Control`                                                                                                                                                                                                     | `Scheduled tasks`, `Source control` **[D2]**                                                                                                                                                                | `settings/settingsSearch.ts:87-88` (hold)                                                                                                                                                                                                                                                                                                                                                      | V1           | F-20-06 (CT11)                   |
| 25  | Diagnostics `Live Processes`, `Child Processes`, `Resource History`, `CPU Time`, `Trace Diagnostics`, `Slow Spans`, `Parse Errors`, `Latest Failures`, `Most Common Failures`, `Slowest Spans`, `Span Logs`, `Top Span Names`; `Background Activity` | same words, sentence case (`Live processes`, `CPU time`, `Most common failures`, `Background activity`)                                                                                                     | `settings/DiagnosticsSettings.tsx:945,959,1007,1025,1077,1117,1127,1165,1190,1220,1249,1314`; `settings/BackgroundActivitySettings.tsx:126`; `settings/ResourceTelemetryDiagnostics.tsx:584-589,687-689,769-770`                                                                                                                                                                               | V1           | F-20-06, F-17-07 (CT13)          |
| 26  | `Recent Threads`, `Toggle Sidebar`, `Resize Sidebar`, `Copy Link`, `Pull Requests` (nav and h1)                                                                                                                                                      | `Recent threads`, `Toggle sidebar`, `Resize sidebar`, `Copy link`, `Pull requests` (native Electron and macOS menus keep platform Title Case, row 71)                                                       | `CommandPalette.logic.ts:735`; `ui/sidebar.tsx:370,396-397`; `chat/externalLinkContextMenu.ts:29`; `PullRequestsColumn.tsx:184,214`; `SidebarChrome.tsx:215`                                                                                                                                                                                                                                   | V1           | F-20-06, F-01-26, F-17-07 (CT14) |
| 27  | `Split Terminal Horizontally`, `Split Terminal Vertically`, `New Terminal`, `Close Terminal`                                                                                                                                                         | `Split right`, `Split down`, `New terminal`, `Close terminal`                                                                                                                                               | `ThreadTerminalDrawer.tsx:1596-1610`                                                                                                                                                                                                                                                                                                                                                           | V1           | F-06-21                          |
| 28  | `Search projects...`, `Search models...`, `Search themes...`, `Search threads or projects...`, `Search fonts…`, `Search agents…`, `Add an optional comment...`                                                                                       | `Search projects`, `Search models`, `Search themes`, `Search threads or projects`, `Search fonts`, `Search agents`, `Add a comment (optional)` (rule: "Search <plural noun>", no ellipsis in a placeholder) | `Sidebar.tsx:2772`; `chat/ModelPickerContent.tsx:879`; `settings/ThemeSearchSection.tsx:290`; `pullRequest/PullRequestThreadLinks.tsx:215`; `settings/FontFamilyPicker.tsx:186`; `settings/AcpRegistrySearchStep.tsx:163`; `chat/AssistantCitationCommentEditor.tsx:52`                                                                                                                        | V9           | F-20-08, F-01-26 (CT16)          |
| 29  | compact composer `Ask anything...`, `Enable a provider in Settings`                                                                                                                                                                                  | `Ask anything`, `Enable a provider in Settings to send a message` (main composer placeholder is #24865's `Ask anything. @ files, $ skills, / commands`: unchanged)                                          | `chat/ChatComposer.tsx:3619-3620` (hold)                                                                                                                                                                                                                                                                                                                                                       | V9           | F-20-08 (CT28)                   |
| 30  | `Try again` (9 buttons)                                                                                                                                                                                                                              | `Retry` (keep `Reload` for page reloads, `Refresh` for user re-fetch; `Done` only after a completed task, `Close` for informational dialogs, `Dismiss` for banners)                                         | `pullRequest/PullRequestDiffUnavailableState.tsx:41`; `auth/PairingRouteSurface.tsx:246`; `files/fileSurfaceChrome.tsx:147`; `cloud/CloudEnvironmentConnectList.tsx:298`; `settings/OpenSourceLicenses.tsx:207`; `settings/BrowserImportWizard.tsx:573`; `clerk/MobileClientsUserProfilePage.tsx:136`                                                                                          | V2           | F-20-12 (CT35)                   |
| 31  | `Let's try that again`, `Let's fix capture access`, `point us at a repo to push to`, `We'll keep a backup.`, `How we handle your data`                                                                                                               | `Could not check SnapShot access`, `Fix capture access`, `choose the repository to push to`, `A backup is kept.`, `How T3 Code handles your data` ("we" stays only in onboarding and the draft hero)        | `settings/SnapShotSetupDialog.tsx:147,165`; `GitActionsControl.tsx:614`; `settings/CaptureShortcutConfig.tsx:192`; `settings/SettingsPanels.tsx:1899` (hold)                                                                                                                                                                                                                                   | V6           | F-20-13 (CT31)                   |
| 32  | tooltip `4:05 PM, 4th June 2026`                                                                                                                                                                                                                     | `June 4, 2026 at 4:05 PM` (`Intl.DateTimeFormat`, honours the Time format setting; en-GB `4 June 2026 at 16:05`)                                                                                            | `timestampFormat.ts:120-131`                                                                                                                                                                                                                                                                                                                                                                   | V10          | F-20-14 (CT37)                   |
| 33  | `Expires in a moment`, `Soon`, `just now`                                                                                                                                                                                                            | `Expires in 4s`, `in 4s`, `now`                                                                                                                                                                             | `timestampFormat.ts:233,260,263,282,306`                                                                                                                                                                                                                                                                                                                                                       | V10          | F-20-14 (CT38)                   |
| 34  | `1 results in 1 files`                                                                                                                                                                                                                               | `1 result in 1 file` (pluralise both counts)                                                                                                                                                                | `search/ProjectContentSearchDialog.tsx:240`                                                                                                                                                                                                                                                                                                                                                    | V10          | F-20-15 (CT40)                   |
| 35  | Three ASCII dots (`Preparing the pull request checkout...`, `Merging stack...`, `Pairing...`, `Checking...`, `Preparing command...`, `Initializing...`) and 10 toast titles that end in a period                                                     | U+2026; no trailing period on titles                                                                                                                                                                        | `PullRequestDetailPanel.tsx:848`; `usePullRequestActions.ts:327`; `PullRequestStackMenu.tsx:96`; `onboarding/WelcomeWizard.tsx:632,987,1124`; `GitActionsControl.tsx:1491,1637,1684`; `BranchToolbarBranchSelector.tsx:430,467`; `ChatView.tsx:1425`; `chat/ChatComposer.tsx:2119,2128`; `chat/useComposerAttachmentIntake.ts:132`; `chat/useComposerStash.ts:476`; `chat/useThreadFind.ts:70` | V9, DRIFT-14 | F-12-30, F-10-36, F-20-17        |
| 36  | Curly `couldn’t` beside straight `We'll` in neighbouring strings; a pairing dialog title that carries an instruction                                                                                                                                 | Straight apostrophe in source strings (dominant form, 11 vs 6); no contractions in titles; title `Pairing link` with the instruction as a description; paths written `Settings → X`                         | repo-wide (evidence in F-20-17); guard test in section 10.7                                                                                                                                                                                                                                                                                                                                    | V4, V5       | F-20-17, F-12-30                 |

### 10.3 Error and empty-state voice (DNA-V3 what failed then why; V4 one prefix; V5 explain in place; V2 verbs)

| #   | Current                                                                                                                                                                 | Proposed                                                                                                                                                                                                                                           | File:line                                                                                                                                                                                                                                                                                        | DNA          | Finding                 |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------ | ----------------------- |
| 37  | Toast titles `Failed to …` (48), `Unable to …` (39), `Couldn't …` (6), noun-first `Clone failed` (5), `Pull failed`, `Snapshot failed`; dialog `Couldn't import from X` | `Could not <verb> <object>` (`Could not clone <name>`, `Could not pull`, `Could not import from X`); one codemod pass per directory, no behaviour change                                                                                           | `CommandPaletteThemeItems.tsx:29`; `chat/ChatComposer.tsx:2767`; `chat/useComposerContextImport.ts:143`; `settings/SettingsPanels.tsx:551`; `settings/ThemeSettings.tsx:538,548`; `CommandPalette.tsx:1994,2005,2036,2065`; `GitActionsControl.tsx:1408`; `settings/BrowserImportWizard.tsx:566` | V4, DRIFT-12 | F-12-12, F-20-17 (CT40) |
| 38  | `An error occurred.` (88 sites), `An unexpected error occurred.` (6) as the description                                                                                 | `describeFailure(failure, hint)` returns the real cause, else a verb-specific hint ("Try again from the sidebar.", "Check that the branch still exists."); bound 220 characters                                                                    | `Sidebar.tsx` (19 sites), `LegacySidebar.tsx` (14), `MarkdownFileLink.tsx` (7), `PreviewView.tsx` (7), `CommandPalette.tsx` (5), `GitActionsControl.tsx` (4), `ArchivedThreadsPanel.tsx` (4)                                                                                                     | V3           | F-12-11                 |
| 39  | `Action failed`, `Action unavailable`, `Thread action failed`, `Archived thread action failed`                                                                          | `Could not <git action label>`; `You cannot change this thread's branch here.` + description naming the read-only access                                                                                                                           | `GitActionsControl.tsx:1275`; `BranchToolbarBranchSelector.tsx:364`; `LegacySidebar.tsx:376,554,578`; `settings/ArchivedThreadsPanel.tsx:227`                                                                                                                                                    | V3, V4       | F-12-13                 |
| 40  | `Clipboard API unavailable.` (x3)                                                                                                                                       | `Your browser blocked clipboard access.` + hint `Copy it manually from the file path in the header.`                                                                                                                                               | `chat/MarkdownFileLink.tsx:199`; `chat/useRightPanelActions.ts:238`; `preview/PreviewView.tsx:537`                                                                                                                                                                                               | V3           | F-12-13                 |
| 41  | `Failed to copy` (reason never shown), `Copied!`                                                                                                                        | error: `Could not copy` as a regular card with the reason, 5 s; success: `Copied`, 1.5 s (`<label> copied` when there is no anchor)                                                                                                                | `ui/anchoredCopyToast.ts:5-33`; `ui/toast.tsx:712-715`                                                                                                                                                                                                                                           | V4, V6       | F-12-24, F-12-28        |
| 42  | Every confirm dialog ends in `Confirm` (22 of 36 are destructive)                                                                                                       | Verb per site: `Delete thread`, `Delete N threads`, `Archive`, `Remove project`, `Sign out`, `Roll back`; `Confirm` stays only as the fallback (mobile already says `Delete`)                                                                      | `ConfirmDialogHost.tsx:88-90`; `packages/contracts/src/ipc.ts:1189-1191`; `Sidebar.tsx:2587`; `hooks/useThreadActionMenu.ts:299`; `hooks/useThreadActions.ts:900`                                                                                                                                | V2, DRIFT-13 | F-12-08                 |
| 43  | One-line message ending in `?` becomes a 20 px title; no `?` gives title `Confirm action`                                                                               | Explicit `title` and `description` fields; string fallback splits on the first sentence end, capped at 90 characters; drop `Confirm action`                                                                                                        | `ConfirmDialogHost.tsx:20-52`; `chat/chatViewSend.ts:121`                                                                                                                                                                                                                                        | V3, V5       | F-12-09                 |
| 44  | `Invalid keybindings configuration` (5 s); success toast repeats its title                                                                                              | `Keybindings file has errors` + parser message + `Your shortcuts are using defaults until it is fixed.` (confirm with the server contract), stays until dismissed; success: title only, 2.5 s, only for this client's own save                     | `routes/__root.tsx:588-605`; `KeybindingsConfigWarning.tsx:31-50`                                                                                                                                                                                                                                | V3           | F-12-18                 |
| 45  | `Update downloaded` / `Restart the app from the update button to install it.` (5 s, no action)                                                                          | Actions `Restart now` and `Later`; description `Version X is ready. Running tasks stop when you restart.`; release-notes link as a ghost button                                                                                                    | `desktopUpdate.toast.tsx:47-62`; `sidebar/SidebarUpdatePill.tsx:147,170,285-312`                                                                                                                                                                                                                 | V2, V5       | F-12-19                 |
| 46  | `This prompt had hidden characters, it may be malicious`; `Please try again.`                                                                                           | `Hidden characters removed from this prompt` + `T3 Code removed {n} hidden characters. Read the prompt before you send it.`; `Please` becomes a `describeFailure` hint                                                                             | `promptLinks/linkedPrompt.ts:9`; `files/AttachmentFilePreview.tsx:190-193`                                                                                                                                                                                                                       | V6, V3       | F-12-31                 |
| 47  | `Make sure you're ready before continuing.`; `Browser storage rejected the update, so this entry could still be there after a reload`                                   | `Install X and restart T3 Code?` + `Running tasks stop when it restarts.`; `Could not update your saved prompts` + `Browser storage is full or blocked. The prompt may reappear after a reload.`                                                   | `desktopUpdate.logic.ts:127`; `chat/useComposerStash.ts:224,461`                                                                                                                                                                                                                                 | V6, V3       | F-12-31                 |
| 48  | Banner title `<Provider> provider status` with an info icon on an error                                                                                                 | `<Provider> is not installed` / `<Provider> needs to sign in` / `<Provider> is unavailable`; alert icon for error, triangle for warning                                                                                                            | `chat/ProviderStatusBanner.tsx:104-108,121`                                                                                                                                                                                                                                                      | V3           | F-12-35                 |
| 49  | Slow-request toast prints raw RPC tags (`orchestration.dispatchCommand`)                                                                                                | Labels from a table (`Sending a message`, fallback `A request to {environment label}`); `Waiting on {label} for more than 15 s`; ghost action `Copy details`                                                                                       | `SlowRpcRequestToastCoordinator.tsx:15-31`; `rpc/requestLatencyState.ts:7`                                                                                                                                                                                                                       | V3, V5       | F-12-20                 |
| 50  | Theme import shows engine text (`Expected ',' or '}' after property value in JSON at position 16`); missing version reads `unsupported version. Expected 1.`            | `That is not valid JSON. Check for a missing comma or bracket near line {l}, column {c}.`; `This file has no theme version. T3 Code theme files start with "version": 1.`                                                                          | `settings/ThemeImportDialog.tsx`                                                                                                                                                                                                                                                                 | V3           | F-12-21                 |
| 51  | Permission notice (150 characters, no type, two dismiss paths); legacy migration toast closes without a result                                                          | `{label} uses an older permission set, so some actions are unavailable. Pair again with a new link.` (warning, one dismiss); on complete `Threads restored` + `{n} threads are ready.`                                                             | `components/PermissionUpdateNotice.tsx:46-64`; `components/LegacyThreadMigrationToast.tsx:13-33`                                                                                                                                                                                                 | V5, P3       | F-12-33, F-12-34        |
| 52  | `Provider instance "claude" is disabled for project <uuid>.`                                                                                                            | `Provider "claude" is not set up. Available providers: codex, claudeAgent. Add one in Settings, Providers.` / `Provider "claudeAgent" is turned off for sample-app. Turn it on in Settings, Providers.` (server string: dependency, UI part gated) | `apps/server/src/orchestration-v2/ThreadManagementService.ts:287-296`                                                                                                                                                                                                                            | V3, V7       | F-20-01 (CT1)           |
| 53  | Agents step with zero ready agents says nothing                                                                                                                         | `No agent is ready on {computer}. You can continue and set one up later in Settings → Providers.` **[D1]**                                                                                                                                         | `onboarding/WelcomeWizard.tsx:691` (render under the cards in `ConnectedAgentsStep`, `:700-860`)                                                                                                                                                                                                 | V5           | F-10-15                 |
| 54  | `Do not import projects` (x2), loading heading `Your projects`                                                                                                          | `Skip import`; heading `Import your projects` in both states                                                                                                                                                                                       | `onboarding/WelcomeWizard.tsx:1404,1412-1414,1422,1507-1509`                                                                                                                                                                                                                                     | V2           | F-10-26, F-10-07        |
| 55  | Telemetry paragraph points to a privacy policy for opt-out                                                                                                              | `T3 Code collects anonymous usage data. Turn it off with T3CODE_TELEMETRY_ENABLED=false (see the docs).` (variable in mono; an in-app toggle is a server dependency, Issue #4123)                                                                  | `onboarding/WelcomeWizard.tsx` ConnectionStep (`:293-460`)                                                                                                                                                                                                                                       | V3, V5, T7   | F-24-11                 |
| 56  | A link to a deleted thread silently becomes a draft                                                                                                                     | Toast `Could not open thread` + `It was deleted, or it is on a computer that is not connected. Opened a new thread instead.` **[D1]**                                                                                                              | `components/ThreadRouteView.tsx:154-160`                                                                                                                                                                                                                                                         | V3, V4       | F-10-17                 |
| 57  | Diff empty states: `Select a thread to inspect turn diffs.`, `Turn diffs are unavailable because this project is not a git repository.`                                 | `No thread selected` + `Select a thread to see what its turns changed.`; `No Git repository` + `Diffs and checkpoints need Git. Initialize Git to track what the agent changes.` with an `Initialize Git` button                                   | `DiffPanel.tsx:970-1021`                                                                                                                                                                                                                                                                         | V5           | F-10-19                 |
| 58  | Pull Requests page blames the filters when the project has no remote (`Nothing under these filters`)                                                                    | `{name} has no Git remote` + `Pull requests come from a hosted repository. Add a remote with git remote add origin <url>, then check again.`                                                                                                       | `PullRequestsPage.tsx:1138-1156`; `PullRequestListEmptyState.tsx:130-135`                                                                                                                                                                                                                        | V3, V5       | F-10-22                 |
| 59  | Usage: `Connect an environment to see usage.` as a bare line                                                                                                            | `No environment connected` + `Connect a computer to see usage.` **[D1]** + `Open Connections`; `No limits to show` for the pooled view                                                                                                             | `UsagePage.tsx:512-517`; `UsageLimitsPooled.tsx:619-623`                                                                                                                                                                                                                                         | V5           | F-10-23                 |
| 60  | Composer chip `No provider available` (disabled); Providers page bare text                                                                                              | Chip `Set up an agent` (enabled; supersedes F-10-24's `Add a provider`, see wireframe 06) and banner action `Set up agents`; Providers empty: `No providers configured` + `Add provider` + `Set up agents`                                         | `ComposerControlsBar.tsx:255-270`; `ProviderSettingsPanel.tsx:1078-1082`                                                                                                                                                                                                                         | V2, P7       | F-10-24, F-24-05        |
| 61  | Archive empty: `Archived threads will appear here.`; sidebar `No threads in {project} yet` (no action)                                                                  | `Archive a thread from its actions menu to move it here. Unarchive brings it back.`; add a `New thread` button                                                                                                                                     | `settings/ArchivedThreadsPanel.tsx:176-197`; `Sidebar.tsx:3243`                                                                                                                                                                                                                                  | V8, V2       | F-10-32, F-10-18        |
| 62  | Pairing explained in three voices                                                                                                                                       | One deck, noun "computer": `Open T3 Code on your computer, or run npx t3 there.` / `Create a pairing link in Settings, Connections, or run npx t3 pair.` / `Scan or paste it here.`; T3 Connect: `Run npx t3 connect on your computer.`            | wizard Connection step; `HostedEmptyState.tsx:75-122`; mobile Home and Add environment sheet                                                                                                                                                                                                     | V7, V6, X2   | F-24-12                 |

### 10.4 Mobile and desktop-native divergence (same action, different words; DNA-X2, X3)

| #   | Current                                                                                                                                                           | Proposed                                                                                                                                                                                                                                                                                      | File:line                                                                                                                                                                                                 | DNA        | Finding               |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------- |
| 63  | Mobile `New task`, `Create a task to start a new coding runtime in one of your connected projects.` ("task" means a scheduled job on web)                         | `New thread`, `Start a thread in one of your projects.`                                                                                                                                                                                                                                       | `apps/mobile/src/features/home/HomeRouteScreen.tsx:194`; `native/V5StackHeader.ios.tsx:228`; `features/threads/useThreadHeaderOptions.tsx:61`; `features/home/HomeScreen.tsx:208` (area 15 owns the edit) | V7         | F-20-05 (CT24)        |
| 64  | Mobile placeholder `Ask the repo agent, or run a command…`                                                                                                        | `Ask anything` plus the triggers mobile supports                                                                                                                                                                                                                                              | `features/threads/ThreadDetailScreen.tsx:1769`; `features/threads/NewTaskDraftScreen.tsx:1128`                                                                                                            | V7         | F-20-08 (CT29)        |
| 65  | Mobile titles `Archived Threads`, `Scheduled Tasks`, `Add Environment`                                                                                            | `Archived threads`, `Scheduled tasks`, `Add environment`                                                                                                                                                                                                                                      | `Stack.tsx:317,383,309,1010`; `SettingsRouteScreen.tsx:261`                                                                                                                                               | V1         | F-20-06, F-15-18      |
| 66  | Mobile Home `No environments connected` / `Add an environment to load projects and start coding sessions.`; T3 Connect `No additional linked cloud environments.` | `No computer connected` / `Your agents run on a computer. Connect this phone to T3 Code running there.`; FAB `Connect a computer`; sheet caption `On your computer: Settings, Connections, or npx t3 pair`; T3 Connect `Waiting for your computer…` (only while discovery refreshes) **[D1]** | `features/home/HomeScreen.tsx:146-205`; sheet caption and helper in the same finding                                                                                                                      | V5, V6, V7 | F-24-01               |
| 67  | Mobile `No projects found` with no action                                                                                                                         | `No projects yet` / `{computer name} has no projects. Add one to start a thread.` + `Add project`                                                                                                                                                                                             | `features/home/HomeScreen.tsx:111` and the empty-state derivation                                                                                                                                         | V2, P7     | F-24-02               |
| 68  | Mobile pairing error is hidden behind the keyboard and not actionable                                                                                             | `That pairing code is invalid or has expired. Create a new one with t3 pair or in desktop Settings → Connections.` (live region polite)                                                                                                                                                       | Add environment sheet (area 15)                                                                                                                                                                           | V3         | F-15-06               |
| 69  | Desktop dialog `You're up to date!`; `An unknown error occurred. Please try again later.`; menu `Check for Updates...`                                            | `T3 Code is up to date` (message `T3 Code 1.2.3 is the newest version.`); title `Could not check for updates`, fallback `No details were reported. Try again later.`; `Check for Updates…`                                                                                                    | `apps/desktop/src/window/DesktopApplicationMenu.ts:76,85,168,297`                                                                                                                                         | V6, V9     | F-20-16 (CT36)        |
| 70  | Desktop `This machine` (local server label)                                                                                                                       | Follows the vocabulary decision **[D1]**                                                                                                                                                                                                                                                      | `apps/desktop/src/backend/DesktopServerExposure.ts:167`                                                                                                                                                   | V7         | F-20-04               |
| 71  | Native menus and macOS context menus: `Copy Link`, `Copy Image`, `Check for Updates…`                                                                             | **No change.** Platform Title Case stays; record it as a named exception in DNA-V1                                                                                                                                                                                                            | `window/DesktopWindow.ts:552,563`                                                                                                                                                                         | V1         | F-20-16               |
| 72  | Mobile `Woke from snooze` and `Delete thread?` / `Delete` are already clearer than web                                                                            | Web adopts them (rows 13 and 42)                                                                                                                                                                                                                                                              | `ThreadDetailScreen.tsx:836-838`; `features/home/useThreadListActions.ts:212-217`                                                                                                                         | X3         | F-20 divergence table |
| 73  | Web `Source Control` nav vs mobile `Source control`                                                                                                               | One casing **[D2]**                                                                                                                                                                                                                                                                           | `apps/mobile/.../Stack.tsx:272`; `settings/settingsSearch.ts:88`                                                                                                                                          | V1, X2     | F-20-06               |

### 10.5 Owner decisions (decisions, not proposals)

| ID         | Question                                                                                                          | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                        | Options                                                                                                                                                                                                                                                                                      | Default used in the table above                                                             |
| ---------- | ----------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| **D1**     | Which word does the user see for the machine a T3 server runs on outside onboarding: "computer" or "environment"? | DNA-V7 lists "environment" (technical, settings, palette) and "computer" (onboarding, hosted pages). Counts in user strings: environment 117, server 37, machine 29, backend 26, computer 11. F-10-35 asks for "computer" in 5 dialog strings; F-20-04 follows DNA-V7 literally. Mobile `Stack.tsx` already says "Environment(s)". Some proposals (rows 53, 56, 59) were written with "computer" on non-onboarding surfaces and are inconsistent under option A | A: DNA-V7 literal (environment everywhere except onboarding and hosted pages; retire machine, backend, host) / B: "computer" for every user-facing string (shorter, matches the wizard; contradicts the glossary and Settings page names, about 40 strings plus docs in the other direction) | A. Rows 1, 2, 10, 53, 56, 59, 66, 70 and F-10-35's five dialog strings flip with the answer |
| **D2**     | "Source Control" or "Source control"?                                                                             | Docs name the nav "Source Control"; the page's own rows ("Source control writing style") and mobile say "Source control"; DNA-V1 says sentence case                                                                                                                                                                                                                                                                                                             | A: "Source control" everywhere plus a one-word docs edit / B: keep "Source Control" as a named exception in DNA-V1 and capitalise the rows and mobile instead                                                                                                                                | A. Rows 17, 19, 20, 24, 73                                                                  |
| D3 (minor) | Capital after the colon in generated keybinding labels?                                                           | F-20-02 writes `Thread: New without project`; F-17-07 writes `Chat: new without project`; docs use `Group: Action`                                                                                                                                                                                                                                                                                                                                              | A: capital (matches docs and the explicit map) / B: lower-case                                                                                                                                                                                                                               | A. Row 22                                                                                   |

### 10.6 Open copy questions (not owner-level; carry to the DNA text)

- Destination names in running text are capitalised ("Change in Connections", "Open Connections") while the palette lowercases ("Open usage", "Open settings"): needs a one-line DNA rule.
- "Server environment" (`settings/SourceControlSettings.tsx:479,590`) is a third sense of "environment" (the PATH and tools the server sees); read its content before renaming (suggested "Detected tools").
- "WSL backend" (`settings/ConnectionsSettings.tsx:683,783,862,890`) names a real thing; "WSL environment" or "WSL server" is a desktop-owner call.
- "Extra High" and "Fast Mode" (`settings/customModelEditor.logic.ts:43,70,74`): leave if they are provider-defined effort labels.
- Diagnostics developer vocabulary ("Instrumented application I/O", "Host & collection") is unexplained; page audience may justify it.

### 10.7 Guards and collisions

- Guard test (new `ui/toast.logic.test.ts`, F-12-12, F-12-30, F-20-17): a regex over `toastManager.add` titles fails on a trailing `.`, `...` or `!`, on `Failed to`, `Unable to` and contractions; extend it to `placeholder=`, `title=` and `aria-label=` literals. Without it the drift returns (even maintainer PRs #24773 and #23679 reintroduced it).
- #24865 already changed: the composer placeholder, "Resume after usage limits", "Snooze until limits reset" (web, mobile, settings search, docs). Do not re-edit those strings.
- `extoci` owns copy PRs #24147, #24148, #24149 (SKIP), #24150 and #24865 relabels the same strings: coordinate wording first. #24147 uses a contraction in a title ("Can't connect"), which DNA-V4 forbids.
- Docs that name labels change with rows 9-11 and 19-24 (`docs/user/keybindings.md:22,29-31`; the nav name for D2): a docs edit goes in the same PR.

## 11. Accessibility pass

Inputs: `audit/16-accessibility.md` (21 findings: P1 6 / P2 14 / P3 1; axe-core on 12 surfaces in light and dark, real Tab traversal, CDP accessibility tree, WCAG maths composited on the real background), `audit/17-typography-and-hierarchy.md` (grey ladder), wave-1 and mobile findings re-checked there. Kickoff rule (`_PROTOCOL.md`, non-negotiable 6): accessibility is polish and **inaccessible = P1**; section 11.8 lists the P1 set and a delivery order. Floors (DNA-C5): text 4.5:1, large or bold 3:1, UI and focus 3:1. No real screen reader, Firefox, WebKit or Windows high-contrast host was available: those rows are tree-read or code-read and say so.

### 11.1 axe-core summary by surface (24 default runs; cells are nodes, light / dark when they differ)

Totals at default contrast: critical 3 rules (12 instances), serious 5 (50 instances), moderate 2 (32); 1,230 of the serious nodes are the same 123 thread rows repeated over 5 surfaces and 2 schemes. Raising Contrast to 150 or 200 barely helps (`color-contrast` home light 8 to 7, thread light 11 to 8, palette 5 to 0): the survivors are tokens the Contrast layer never touches (F-16-11).

| Surface              | Critical               | Serious                                                                                                      | Moderate                                      | Root-cause findings                                  |
| -------------------- | ---------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------- | ---------------------------------------------------- |
| home                 | `button-name` 1        | `color-contrast` 8 / 0, `label-content-name-mismatch` 12, `nested-interactive` 123, `aria-prohibited-attr` 1 | `landmark-unique` 1, `page-has-heading-one` 1 | F-16-04, F-16-06, F-16-18, F-02-07, F-16-19, F-16-17 |
| thread               | `button-name` 1        | contrast 11 / 2, label-in-name 12, nested 123                                                                | landmark 1, h1 1                              | F-16-04, F-16-06, F-16-18, F-02-07, F-16-17          |
| command palette      | `aria-required-attr` 1 | contrast 5 / 1, `scrollable-region-focusable` 1                                                              | landmark 1                                    | F-16-15                                              |
| diff                 | `aria-allowed-attr` 1  | contrast 13 / 2, label-in-name 12, nested 123                                                                | landmark 1, h1 1                              | F-16-19(c), F-16-06, F-16-18                         |
| terminal             | `button-name` 1        | contrast 11 / 2, label-in-name 12, nested 123                                                                | landmark 1, h1 1                              | F-16-04, F-06-06                                     |
| settings general     | none                   | contrast 19                                                                                                  | landmark 1                                    | F-16-06, F-16-09                                     |
| settings appearance  | none                   | contrast 13                                                                                                  | landmark 1                                    | F-16-06, F-16-09                                     |
| settings keybindings | none                   | contrast 18, label-in-name 7                                                                                 | landmark 1                                    | F-16-06, F-16-18                                     |
| providers            | none                   | contrast 15, label-in-name 1                                                                                 | landmark 1                                    | F-16-06                                              |
| welcome              | none                   | label-in-name 3                                                                                              | landmark 1                                    | F-16-18                                              |
| pull requests        | none                   | label-in-name 11, nested 123                                                                                 | landmark 1                                    | F-02-07, F-16-18                                     |
| usage                | `aria-allowed-attr` 2  | contrast 2 / 0, label-in-name 4                                                                              | landmark 1                                    | F-16-19(c), F-16-18                                  |

Rule to fix: `button-name` F-16-04 (XS); `aria-required-attr` and `scrollable-region-focusable` F-16-15 (S); `aria-allowed-attr` F-16-19(c) (XS, `role="toolbar"` on the ToggleGroup); `aria-prohibited-attr` F-16-19(a) (XS, `role="img"` on the language badge); `landmark-unique` F-16-19(b) (XS, second Notifications region named "Anchored notifications"); `page-has-heading-one` F-16-17 (S) with F-17-03 (XS); `label-content-name-mismatch` F-16-18 (S); `nested-interactive` F-02-07 (S); `color-contrast` F-16-06 (M) and F-17-02 (L).

### 11.2 Contrast table (measured, WCAG 2.x; light on `#fcfcfc`, dark on `#0a0a0a` unless stated)

| Pair                                                                     | Current (L / D)                                                         | Proposed                                                                                                                                                                       | Ratio after (L / D)                                          | Finding                                               | DNA              | Effort            |
| ------------------------------------------------------------------------ | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------ | ----------------------------------------------------- | ---------------- | ----------------- |
| Muted text with any of 14 alpha steps (`/30` to `/90`), 175 sites        | 1.47-3.88 / 1.46-4.30 (`/70`, the most common: 2.72 / 3.05)             | Bare `text-muted-foreground`; hierarchy from size and weight (3 tiers: foreground, muted, muted at 11 px). Lint rule `t3code/no-text-opacity-on-muted` + codemod per directory | 4.71 / 5.08                                                  | F-16-06, F-17-02 (DNA-C4, DRIFT-1)                    | DNA-C4, C5       | M (L for F-17-02) |
| Inactive Settings nav labels (14 px, `sidebar-muted-foreground/80`)      | 3.19 / 3.54                                                             | Remove `/80` at `ui/sidebar.tsx:700`                                                                                                                                           | 4.71 / 5.08 (settings root scope; sidebar scope 4.62 / 8.33) | F-16-09                                               | DNA-C4, C5       | XS                |
| Settled and Snoozed shelf rows (`secondary-label/70`)                    | 2.69 / 3.09                                                             | `text-secondary-label` at `SidebarThreadRow.tsx:895,987,992,1637`; favicon `opacity-40` to `opacity-60 grayscale`                                                              | 4.62 / 5.39                                                  | F-02-01                                               | DNA-C4, C5       | XS                |
| Branch, scratch-machine, worktree label (`/40`)                          | 1.68 / 2.06                                                             | Drop `/40` (inherited `secondary-label`)                                                                                                                                       | 4.62 / 5.39                                                  | F-02-02 (#24865: addressed)                           | DNA-C4, C5       | XS                |
| Shelf header label (`/60`)                                               | 2.27 / 3.44                                                             | `text-sidebar-muted-foreground`, no alpha                                                                                                                                      | 4.62 / 8.33                                                  | F-02-03 (#24865: addressed)                           | DNA-C1, C5, C6   | XS                |
| Sidebar zero-state message (`/60`)                                       | 2.27 / 3.44                                                             | `text-sidebar-muted-foreground`                                                                                                                                                | 4.62 / 8.33                                                  | F-10-18                                               | DNA-C4, C5       | XS                |
| Composer placeholder (`/75`)                                             | 2.93 / 3.32                                                             | `text-placeholder`, no alpha; `aria-hidden` on the visible duplicate                                                                                                           | 4.71 / 5.08                                                  | F-04-03 (#24865: addressed)                           | DNA-C4, C5       | XS                |
| Empty thread "Send a message to start the conversation."                 | 1.47 / 1.44                                                             | Keep #24865's `text-muted-foreground`; add no third rule                                                                                                                       | 4.71 / 5.08                                                  | F-10-08 (#24865: addressed)                           | DNA-C4           | XS                |
| Light diff add foreground `#009966` / remove `#e7000b` as small text     | 3.56 / 4.65                                                             | #24865 tokens `#007a55` / `#c10007` (emerald-700 / red-700); dark unchanged                                                                                                    | 5.23 / 6.26 (dark 10.21 / 6.85)                              | F-05-16 (#24865: partial)                             | DNA-C5, C7       | S                 |
| Base diff colour used as text (`text-diff-addition`) at four sites       | 2.41 / 8.00                                                             | `text-diff-addition-foreground` / `text-diff-deletion-foreground`; Pierre header counts via `DIFF_VIEW_UNSAFE_CSS`                                                             | 5.23 / 10.21                                                 | F-05-16                                               | DNA-C5, C7       | S                 |
| Status base colours as small text (success, warning, error, info)        | 2.41, 2.08, 3.71, 3.67 / dark ≥ 5.26                                    | `*-foreground` tokens (DNA-C6); base stays for icons and fills                                                                                                                 | 5.23, 4.90, 6.26, 6.66                                       | F-03-10, F-04-41                                      | DNA-C6, C5       | XS                |
| "Command approval" label, 11 px amber                                    | 2.08 / 2.13                                                             | `text-warning-foreground` and 12 px                                                                                                                                            | 4.90                                                         | F-03-10, F-04-41                                      | DNA-C6, C5       | XS                |
| Destructive filled button, white text on `#fb2c36` / `#fb414a`           | 3.81 / 3.53                                                             | New `--destructive-solid: color-mix(in srgb, var(--destructive) 78%, black)` used by the button only; icons and borders keep `--destructive`                                   | 5.82 / 5.41                                                  | F-12-04                                               | DNA-C5, C6       | XS                |
| Unchecked Switch track (thumb)                                           | 1.46 (1.44) / 1.19 (thumb 4.18)                                         | `data-unchecked:bg-muted-foreground/80` in light; dark keeps `bg-input` (thumb carries it). Blue accent untouched                                                              | 3.24 (3.21) / unchanged                                      | F-16-10                                               | DNA-C5, K10      | XS                |
| Focus ring at 17 sites (`ring-ring/70`, `/50`, `/24`, `ring-primary/25`) | 3.54 / 2.62                                                             | Drop the alpha                                                                                                                                                                 | 6.54 / 4.26                                                  | F-16-08                                               | DNA-C5, S3       | XS                |
| Keyboard highlight in popup lists (8% fill)                              | 1.04-1.22                                                               | `ring-2 ring-inset ring-ring` under keyboard modality                                                                                                                          | 6.54 / 4.26                                                  | F-16-01                                               | DNA-C5, K10, K14 | S                 |
| Composer textbox focus                                                   | none (caret only)                                                       | Outline border turns `--contrast-muted-foreground` under `has-[:focus-visible]` (neutral, not blue)                                                                            | 4.71 / 5.08                                                  | F-16-07 (#24865: conflicts, it dropped the blue ring) | DNA-C5, K6, C2   | XS                |
| Sidebar search focus                                                     | none                                                                    | Wrapper ring `has-focus-visible:ring-2 ring-inset ring-ring`                                                                                                                   | 6.43 / 4.52                                                  | F-16-03                                               | DNA-C5, S3       | XS                |
| User-bubble label "Agent" after #24865                                   | 4.39 becomes 4.05 (bubble vs canvas 1.07 becomes 1.16)                  | F-16-20 proposes `foreground/70` (6.49); DNA-C4 forbids an alpha grey, so use `text-foreground`. No bubble border                                                              | at least 6.49 (not measured on the bubble)                   | F-16-20 (#24865: conflicts)                           | DNA-C4, C5       | XS                |
| In-prose link vs body text                                               | 1.15 / 1.55, no resting underline                                       | Dotted 1 px underline at rest (50% current colour), solid on hover and focus; remove the radial-gradient hack                                                                  | non-colour cue (WCAG 1.4.1)                                  | F-03-19                                               | DNA-C5, K12      | XS                |
| Terminal ANSI palette                                                    | fails in places (`#14ce14`, `#b5ba00`, `#a5a5a5` light; `#000000` dark) | `minimumContrast: 4.5` in the renderer; light `#0b7a0b`, `#7a7d00`, `#6e6e6e`; dark `#3a3a3a`                                                                                  | target 4.5 (per-colour not measured)                         | F-06-04; ADOPT #24042 (PASS and FAIL badges)          | DNA-C5, C13      | M                 |
| Light diff syntax tokens                                                 | 1.98-3.85                                                               | Derived `t3-pierre-light`: string `#137a35`, keyword `#c0194f` on the deletion tint                                                                                            | 4.9, 5.4                                                     | F-05-18                                               | DNA-C5           | M                 |
| Borders at Contrast 200                                                  | 1.99 / 2.42 (`input` 2.28 / 2.61)                                       | Border boost `(c-100)/2`; cap muted at body minus one step; route ring, link, status and diff foregrounds through a `--contrast-accent` mix                                    | `input` about 3.1 at 200                                     | F-16-11 (M, needs approval)                           | DNA-C9, K8       | M                 |
| Diagnostics 10-11 px text                                                | 1.84-2.7                                                                | Remove the `/45` to `/75` modifiers (bare `text-muted-foreground`); `text-3xs` to `text-2xs` except overline table heads; flat `bg-muted/30` instead of the gradient           | 4.71 / 5.08                                                  | F-07-37                                               | DNA-C4, C5, T1   | S                 |

Unchanged and fine (do not touch, DNA-K9): body 14.52 / 18.16; muted 4.71 / 5.08 at 100%; sidebar scope text 14.27 / 18.90; status foregrounds on their 8% / 16% tint 4.60-6.08 / 5.89-9.04; chat prose after #24865 13.08 / 14.71; selection 9.88 / 7.52; `--ring` on canvas 6.54 / 4.26.

### 11.3 Focus visibility

| Control                                                                        | Today                                                               | Proposed                                                                                                                                                                                                                       | Finding                   | Effort |
| ------------------------------------------------------------------------------ | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------- | ------ |
| Popup list items (palette, model picker, Menu, Select, sidebar search results) | Fill only, outline none                                             | `html[data-input="keyboard"]` set in `main.tsx` on Tab or arrows (`pointer` on pointer events); `@custom-variant kbd`; `kbd:data-highlighted:ring-2 ring-inset ring-ring`; Menu and Select use real focus, so `focus-visible:` | F-16-01                   | S      |
| Sidebar thread search                                                          | None                                                                | Wrapper ring (see 11.2)                                                                                                                                                                                                        | F-16-03                   | XS     |
| Composer textbox                                                               | Caret only                                                          | Neutral outline border (see 11.2)                                                                                                                                                                                              | F-16-07                   | XS     |
| Disclosure rows, shelf headers, work log, turn fold, approval detail           | Ring at 2.62:1 dark                                                 | Drop alpha at 17 sites                                                                                                                                                                                                         | F-16-08                   | XS     |
| "Add provider" in the list                                                     | No ring                                                             | Add `focus-visible` ring                                                                                                                                                                                                       | F-09-05                   | XS     |
| All `outline-none` + ring controls in forced-colors                            | Invisible (0 of 14 stops on the thread; 24 of 40 on Appearance)     | Global forced-colors rule (11.4)                                                                                                                                                                                               | F-16-02                   | XS     |
| Resize handles (sidebar, right panel, terminal drawer)                         | Not focusable                                                       | `role="separator"`, `tabIndex=0`, `aria-valuenow/min/max`, arrows 16 px (Shift 64), Home and End, double-click reset                                                                                                           | F-01-09, F-06-15          | S      |
| Right-panel tabs                                                               | `div` with inner 16 px buttons, no tab roles                        | `tablist` / `tab` / `tabpanel`, focus the active tab on keyboard open                                                                                                                                                          | F-16-16, F-06-07, F-06-13 | M      |
| Focus after closing Settings or Usage                                          | Lands on `body`                                                     | Return to the opener                                                                                                                                                                                                           | F-01-06                   | XS     |
| Tab order                                                                      | Sidebar toggle is last; 388 stops on a 123-row thread; no skip link | Roving tabindex (one stop per list); `SidebarControl` rendered before `Sidebar` (it is `fixed`, layout unchanged); `sr-only` "Skip to conversation" link to `[data-chat-column]`                                               | F-01-28, F-02-06          | M      |
| Runtime-mode listbox                                                           | Returns focus to the composer, not the control                      | Decide intentionally (P3)                                                                                                                                                                                                      | F-16 matrix               | XS     |

Four focus treatments exist (DRIFT-17: Button 2 px inset + 1 px offset, Input 3 px inset + border, rows 2 px inset, inline 2 px outline). Unifying them belongs with the shape and elevation part; this pass only guarantees every control shows one at 3:1 or better.

### 11.4 Forced-colors and contrast preferences

| Item                                                                                                                                                    | Fix                                                                                                                                                                                                                                     | Finding | Effort |
| ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------ |
| Focus invisible where `outline-none` + `box-shadow` ring is used (`button.tsx:9`, `switch.tsx:13`, `menu.tsx:185`); only 6 `forced-colors:` rules exist | One rule after the `*` outline rule (`index.css` ~691): `@media (forced-colors: active) { :focus-visible { outline: 2px solid Highlight; outline-offset: 2px; } }`. Tested by injection: 13 of 14 composer-area stops gain an indicator | F-16-02 | XS     |
| Switch checked and unchecked compute identically (white, no border)                                                                                     | `switch.tsx`: Root `forced-colors:border-[ButtonText]`, checked `Highlight`, unchecked `Canvas`; Thumb `ButtonText` / `HighlightText`. Blue accent untouched in normal mode (owner call)                                                | F-07-16 | XS     |
| Colour-scheme tiles, theme orbs and wireframes blank; selected tile unmarked                                                                            | `forced-color-adjust: none` on `ThemeWireframe` and `ThemePreviewCircle`; selected tiles and cards get a real `Highlight` border or outline; active Settings nav item border                                                            | F-07-17 | S      |
| Open and selected rows indistinguishable                                                                                                                | `rowSurfaceClassName`: `forced-colors:border`, active `Highlight`, selected dashed `Highlight`                                                                                                                                          | F-02-25 | XS     |
| User bubble and changed-files card lose their shape                                                                                                     | `border border-transparent` (repainted `CanvasText`) with `p-[calc(--spacing(3)-1px)]` so layout is unchanged (DNA-SP3)                                                                                                                 | F-03-28 | S      |
| OS "Increase contrast" ignored (0 `prefers-contrast` hits)                                                                                              | In `useTheme.ts` apply Contrast 150 when no stored value and `prefers-contrast: more`, follow live                                                                                                                                      | F-16-12 | S      |
| Contrast slider does not reach 3:1 for borders                                                                                                          | See 11.2, last rows                                                                                                                                                                                                                     | F-16-11 | M      |

### 11.5 Keyboard task results (real key events; Mod = Cmd on the host)

| #     | Task                                                    | Result                                                                                                                                                                                | Finding          | Effort |
| ----- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------ |
| 1     | New thread (`Mod+N`, project picker, Enter)             | PASS, focus in composer                                                                                                                                                               | none             | none   |
| 2     | Type and send                                           | PASS; live region says "Working" at 0.9 s and "Done" at 3.5 s; answer text is not announced, by design                                                                                | none             | none   |
| 3     | Switch thread (`Mod+Shift+]` / `[` or palette)          | PASS; focus lands in the new composer named "Message <title>"                                                                                                                         | none             | none   |
| 4     | Settings and theme                                      | PASS but 27 Tabs; no web shortcut for Settings; first Esc only dismisses the tooltip; focus ends on `body`                                                                            | F-07-10, F-01-06 | S, XS  |
| 5     | Diff open and close (`Mod+D`)                           | PASS with friction: focus stays in the composer, 11 Tabs to "Close Diff", Esc inside does nothing                                                                                     | F-16-16          | M      |
| 6     | Approve a permission                                    | NOT VERIFIED live (code-read): banner before the composer in tab order, no shortcut, no focus move                                                                                    | F-16-21          | S      |
| 7     | Palette command                                         | PASS; focus returns to the composer                                                                                                                                                   | none             | none   |
| 8     | Pin then settle (`Mod+Shift+P`, `Mod+Shift+S`, `Mod+Z`) | PASS, announced with an undo hint                                                                                                                                                     | none             | none   |
| 9     | Terminal (`Mod+J`)                                      | Input PASS; **output FAIL**: canvas, no text                                                                                                                                          | F-16-05          | L      |
| 10    | Model picker (`Mod+Shift+M`)                            | PASS                                                                                                                                                                                  | none             | none   |
| extra | Review comments from the keyboard                       | FAIL: cannot be started. Fix: key handler on `.diff-render-surface` (arrows or j / k move the line, Shift+Arrow extends, c or Enter begins a comment, Esc clears) with a visible ring | F-05-05          | M      |

### 11.6 Screen-reader gaps

| Gap                                                                                                                                             | Evidence                                                                                                                                              | Fix                                                                                                                                                                                                                                                                                                                    | Finding          | Effort |
| ----------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------ |
| **Terminal output unreadable**                                                                                                                  | One `<canvas>` (`terminal/ghostty/surface.ts:642`, `aria-hidden`), no `.xterm-accessibility` mirror, no live region; drawer aside and toolbar unnamed | Visually hidden `role="log" aria-label="Terminal output" aria-live="off"` after the input, mirroring the last 200 buffer lines 250 ms after output idles, built lazily on first focus (DNA-P1); `aria-label="Terminal drawer"`, `role="toolbar"`, tab roles on the list. Gated on the ghostty buffer API exposing text | F-16-05, F-06-06 | L, M   |
| **Diff on mobile unreadable**                                                                                                                   | `T3ReviewDiffView.swift:2009` draws everything in `draw(_:)`; the XCUI tree holds only "Select diff", "Git controls" and scrollbars                   | `accessibilityElements` with one element per file header ("docs/greet.md, added, 15 additions, expanded", button, activate toggles) and one per visible hunk row ("line 7, added, <text>"); mirror with virtual nodes in `T3ReviewDiffView.kt`; pattern exists in `T3ComposerEditorView.swift:538-551`                 | F-15-04          | M      |
| Mobile thread rows say only the title                                                                                                           | `accessibilityLabel` = title; project, status, age, pin, branch are visual only (#23653 cluster)                                                      | `accessibilityValue` built from the same view model: status, project, relative time, pinned, branch                                                                                                                                                                                                                    | F-15-05          | S      |
| Web thread rows: `role="button"` that contains buttons (123 nested-interactive nodes); row name omits state; actions unreachable (Issue #13959) | AX tree: `button "Title, project"` with nested buttons                                                                                                | Row and actions as sibling buttons in a list; name includes status, time, branch                                                                                                                                                                                                                                       | F-02-07, F-02-06 | S, M   |
| Web context menu has no menu semantics                                                                                                          | No focus, no arrows                                                                                                                                   | `menu` role, focus the first item, arrow keys                                                                                                                                                                                                                                                                          | F-02-05          | M      |
| Palette and model picker                                                                                                                        | Combobox without `aria-expanded`, unnamed listbox and dialog, shortcut glyphs inside option names                                                     | `aria-label` and `aria-expanded`; groups via `AutocompleteGroup`; `aria-keyshortcuts`, glyphs `aria-hidden`                                                                                                                                                                                                            | F-16-15          | S      |
| Branch picker has no name                                                                                                                       | AX: `combobox: main`                                                                                                                                  | `aria-label={`Branch, ${triggerLabel}`}` on both triggers                                                                                                                                                                                                                                                              | F-16-04          | XS     |
| Right-panel tabs                                                                                                                                | Announced as unrelated buttons                                                                                                                        | Tab roles and `aria-selected`                                                                                                                                                                                                                                                                                          | F-16-16, F-06-07 | M      |
| Page title and headings                                                                                                                         | `document.title` is `T3 Code (Dev)` on all 12 routes; no `h1` on thread, diff, terminal, Settings                                                     | Set `${title} - T3 Code`; breadcrumb title `h1`; one `sr-only` `h1` per Settings page                                                                                                                                                                                                                                  | F-16-17, F-17-03 | S, XS  |
| Label in name                                                                                                                                   | Logo "Go to threads" vs visible "T3 Code"; rows; keybinding "Edit when clause"; usage buttons                                                         | Start labels with the visible text; logo `T3 Code, new thread` (PR #24209, pr:ready, names it "T3 Code home" and will likely ship; ours keeps the visible-text prefix and says what the click does, DNA-P3)                                                                                                            | F-16-18, F-01-18 | S      |
| Approval not announced into focus                                                                                                               | Banner before composer; "Needs approval" announced but focus stays                                                                                    | Move focus to Approve when the composer is empty and focused; unbound `thread.approve` / `thread.decline` commands                                                                                                                                                                                                     | F-16-21          | S      |
| Toasts: errors announce politely; F6 path undocumented; `Alert` fixes `role="alert"` for info                                                   | No `priority: "high"` anywhere                                                                                                                        | `priority: "high"` for errors; `sr-only` "Press F6 to move to notifications"; role from variant                                                                                                                                                                                                                        | F-12-17, F-12-26 | S, XS  |
| Hold-to-quit overlay unannounced                                                                                                                | Desktop                                                                                                                                               | Live region                                                                                                                                                                                                                                                                                                            | F-14-13          | XS     |
| Mobile Dynamic Type                                                                                                                             | No `maxFontSizeMultiplier`; names break at accessibility sizes                                                                                        | Ceiling and wrap rules                                                                                                                                                                                                                                                                                                 | F-15-10          | S      |
| Mobile Add environment error hidden by the keyboard                                                                                             | Text under the keyboard                                                                                                                               | Scroll to error, `accessibilityLiveRegion="polite"`, actionable text (section 10 row 68)                                                                                                                                                                                                                               | F-15-06          | S      |
| Android "Remove animations" leaves rows at opacity 0                                                                                            | Reanimated entering views                                                                                                                             | `enteringIfMotion` helper; ADOPT #23348 (review file navigation), BORROW #21757, #23888                                                                                                                                                                                                                                | F-15-16          | S      |
| iOS environment Reconnect and Remove icon buttons unnamed                                                                                       | VoiceOver                                                                                                                                             | ADOPT #23740 (names and button roles, 5 props)                                                                                                                                                                                                                                                                         | F-15 family      | XS     |

Open issues these address: #13959 (row actions unreachable with screen readers), #23653 (thread-switch chords give no feedback), #23760 (heading wrap lands mid-thread). #23656 ("no announcements while an agent works") is not reproduced on main: `ThreadActivityAnnouncer` announced "Working" and "Done"; verify before closing.

### 11.7 Pointer and touch targets

| Target                                                                                                                                                                                                                                              | Measured   | Fix                                                                                                                                                                   | Finding          | Effort |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------ |
| 11 controls under 24 x 24 CSS px (Snooze 24 x 20 and Settle 63 x 20 on 123 rows, Search 111 x 21, Resize Sidebar 16 x 900, Close Diff 16 x 16, tab Diff 20 x 16, terminal toolbar 21-22 px, Update available 20 x 20); 40 more pass only by spacing | WCAG 2.5.8 | In `button.tsx:9` give `icon-micro` and `icon-tiny` an `after:absolute after:size-full after:min-h-6 after:min-w-6` hit area for all pointers (44 px stays on coarse) | F-16-14          | XS     |
| Switch 38 x 22 with no expansion, four other controls under DNA-D4                                                                                                                                                                                  | Touch      | Hit-area expansion                                                                                                                                                    | F-18-01          | S      |
| Row actions unreachable on touch-only web                                                                                                                                                                                                           | Hover-only | Trailing "Thread actions" button under `@media (any-hover: none)` (DNA-X4)                                                                                            | F-02-04          | M      |
| Provider list and model rows under 44 px or overlapping; mobile taps under 44 pt                                                                                                                                                                    | Touch      | Per-area                                                                                                                                                              | F-09-03, F-15-09 | S      |
| Toast dismiss orb 24 px, copy-error button 20 px                                                                                                                                                                                                    | Touch      | 44 px expansion with `pointer-coarse:after`; `icon-xs`                                                                                                                | F-12-23          | XS     |
| Project action edit gear invisible on touch                                                                                                                                                                                                         | Hover-only | ADOPT #23640 (`pointer-coarse:opacity-100`)                                                                                                                           | F-02-04 family   | XS     |

### 11.8 P1 polish set (kickoff: inaccessible = P1) and order

| Wave                                | Findings                                                                                                                                                                                                                                                                                                                                                                                                                                                               | Effort  | Upstream-eligible                        |
| ----------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ---------------------------------------- |
| A11y wave 1 (XS, no #24865 overlap) | F-16-02 forced-colors focus and F-07-16 switch (A-1), F-16-03 search focus (A-3), F-16-04 branch name (A-4), F-16-08 ring alpha (T12), F-16-09 nav labels (T6), F-16-13 / F-19-02 global reduced motion (MO-1), F-16-14 hit areas (T1), F-16-19 axe residuals (deferred P3, part C 13.15; no chunk)                                                                                                                                                                    | XS each | yes                                      |
| A11y wave 1b (XS, wait for #24865)  | F-02-01 shelf rows (T8), F-12-04 destructive fill (T4; needs `--destructive-solid`), F-16-07 composer focus and F-16-20 bubble label (both held in A-22; conflict with the neutral-controls call)                                                                                                                                                                                                                                                                      | XS each | follow-ups only; F-16-07, F-16-20 no     |
| A11y wave 2 (S to M)                | F-16-01 keyboard modality ring (A-6), F-16-06 + F-17-02 muted-alpha lint and codemod (T6 to T9, 4 PRs per directory), F-02-07 / F-02-06 thread-row semantics (A-11), F-02-05 context menu (A-10), F-06-04 ANSI palette (P-06-4), F-06-06 terminal labels (A-14), F-16-16 / F-06-07 right-panel tabs (A-12, A-13), F-07-17 tiles (A-2), F-07-06 settings rail (M-5), F-05-05 review comments from keyboard (A-18), F-16-15 palette semantics (A-8), F-16-17 titles (H2) | S-M     | mostly yes; F-16-16, F-02-06, F-06-06 no |
| A11y wave 3 (mobile)                | F-15-04 diff for VoiceOver and TalkBack and F-15-05 row labels (A-21), F-15-06 pairing error (M-12), F-15-10 Dynamic Type (M-14), F-15-16 Android reduced motion (MO-7); ADOPT #23740 (A-21), #23348 (MO-7)                                                                                                                                                                                                                                                            | S-M     | yes                                      |
| A11y wave 4 (L)                     | F-16-05 terminal output mirror (A-15; needs maintainer approval and the ghostty text API)                                                                                                                                                                                                                                                                                                                                                                              | L       | no                                       |

Nothing here may degrade mobile (non-negotiable 8): the web motion rule and the hit-area change do not touch `apps/mobile`; mobile gets its own items in A3.

## 12. Prior art

Source: `ui-overhaul/prior-art/PRS.md` (2,220 open PRs swept, 345 triaged, **85 graded with the diff read: 16 ADOPT, 53 BORROW, 16 SKIP**; ADOPT diffs were dry-run with `patch -p1 --dry-run` against `5f64c5eb`), `discussions.md`, `issues.md`, `OWNER-DIRECTION.md`, `pr-24865-body.md`. Grades: **ADOPT** = cherry-pick with credit (applies cleanly, under about 150 lines, fix-shaped, matches DNA, has evidence or a test; all 16 are 2-18 changed lines). **BORROW** = good finding, we reimplement and credit the idea. **SKIP** = out of scope, duplicate, superseded or not UI/UX. Default bias is BORROW or SKIP.

### 12.1 Read this first

- **#24865 is the moving baseline** (owner PR, +502/-272, 55 files). Five ADOPT PRs touch files it also edits and must be re-dry-run after it merges: #22436 (`ComposerPrimaryActions.tsx`), #22100 (`ThreadRelationshipsControl.tsx`), #23573 (`index.css`), #23166 (`ChatComposer.tsx`), #24438 (`collapsible-section-header.tsx`). BORROW PRs that overlap it: #24567, #22367, #24084 (`index.css`), #24773 (`ChatComposer.tsx`), #21878 (`MessagesTimeline.tsx`), #24189 (`ui/button.tsx`), #22385 and #23753 (`ThreadRelationshipsControl.tsx`), #20003 (`SettingsScopeSentence.tsx`, `settingsLayout.tsx`) and #24148 (`SettingsPanels.tsx`, `settingsSearch.ts`, mobile settings copy). The "Attribution note" column repeats each overlap.
- **Maintainer takeover batches absorb small PRs** (37 open PRs carry `takeover`; `juliusmarminge` batches settings-theme, sidebar-threads, other-providers). The same fix may land upstream while we work; if it does, drop ours and keep the credit.
- **State-sync refactors by `juliusmarminge`** (#24825 chat view and composer XXL, #24816 shell, #24817 settings panels, #24822 composer menus, #24823 bootstrap, #24820 file browser and diffs, #24819 PR views) rewrite files that areas 01, 03, 04, 07 and 15 edit. Check merge state before each chunk.
- **Macroscope "Needs Human Approval"** fires on any change to a default appearance or interaction and on every new setting: cite DNA rule IDs and attach before and after shots in every chunk PR body.
- **Same root cause, many symptom PRs.** Hidden composer draft while a question is open: #24773, #24331, #24684. Android "Remove animations" leaves entering views at opacity 0: #21757, #23888, #23230. iOS content under the translucent header: #21548, #23797, #22550, #22420, #22417, #22418. Markdown table, list and rule CSS: #24567, #24084, #22367, #23573, #24163, #24584, #21436. Fix the model once.
- Upstream shows no token layer and no first-run redesign: every design PR is a local patch that invents its own value, and onboarding PRs are state and recovery fixes. Areas 17 to 18 and 24 are open ground.

Chunk ids are those of part C (section 13); the label-to-chunk rule is in its 13.3. SKIP rows have no chunk. Full credit sentences are in the PRS.md "Credit ledger"; paste them verbatim into the PR body.

### 12.2 The 85 graded PRs

| PR     | Title                                                                          | Grade  | What we take                                                                                                                                                                            | Chunk   | Attribution note                                                                                                                                        |
| ------ | ------------------------------------------------------------------------------ | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- |
| #22605 | fix(web): show the thread details toggle tooltip                               | ADOPT  | Cherry-pick. Keying the Tooltip by presentation restores the lost trigger so the thread details shortcut shows (DNA-I4) [F-01-08]                                                       | P-01-5  | Code from #22605 by `otavio`                                                                                                                            |
| #24438 | fix(web): collapsed section headers point their chevron down                   | ADOPT  | Cherry-pick. Collapsed sidebar section chevron pointed up, opposite every other disclosure; one boolean flip reaching all section headers                                               | H7      | Code from #24438 by `juliusmarminge`; overlaps #24865: `collapsible-section-header.tsx`                                                                 |
| #23573 | fix(web): single-digit numbered lists no longer clip in wide fonts             | ADOPT  | Cherry-pick. Maintainer fix: ordered-list gutter max(1.25rem,3ch) stops clipped digits in wide fonts; pr:ready                                                                          | H8      | Code from #23573 by `juliusmarminge`; overlaps #24865: `index.css`                                                                                      |
| #22436 | fix(web): show the platform modifier in the send tooltip                       | ADOPT  | Cherry-pick. Send tooltip shows the platform modifier via existing isMacPlatform instead of Ctrl/⌘ everywhere (DNA-P3)                                                                  | P-21-10 | Code from #22436 by `UtkarshUsername`; overlaps #24865: `ComposerPrimaryActions.tsx`                                                                    |
| #22771 | fix(web): composer drafts keep underscores in non-Latin names                  | ADOPT  | Cherry-pick. Unicode-aware word test stops underscores in non-Latin names turning into emphasis, which sent wrong file names to the agent                                               | E-15    | Code from #22771 by `yzn-h`                                                                                                                             |
| #23166 | fix(web): enable Send when the composer holds only a thread context            | ADOPT  | Cherry-pick. Send button now agrees with Enter for thread-context-only drafts (DNA-P3)                                                                                                  | P-04-4  | Code from #23166 by `only21mil`; overlaps #24865: `ChatComposer.tsx`                                                                                    |
| #24312 | fix(web): combobox search input fills its popup                                | ADOPT  | Cherry-pick. Combobox search input fell back to a 20-character width and cut placeholders; adds flex w-full                                                                             | P-04-5  | Code from #24312 by `bryanprimus`                                                                                                                       |
| #23893 | fix(web): mark the selected diff scope in its menu                             | ADOPT  | Cherry-pick. Adds the existing MenuRadioItemIndicator to the diff scope menu so the active choice is visible (DNA-P3)                                                                   | P-05-3  | Code from #23893 by `shethshlok`                                                                                                                        |
| #24042 | fix(shared): PASS and FAIL badges stay readable in dark command output         | ADOPT  | Cherry-pick. Terminal PASS/FAIL badge text now flips at luminance 0.30 where white drops below 3:1 (DNA-C5) [F-06-04]                                                                   | P-06-4  | Code from #24042 by `WesleySmits`                                                                                                                       |
| #22348 | fix(web): let theme color pickers use popover glass                            | ADOPT  | Cherry-pick. One class removed so the theme colour popover keeps the shared glass recipe at low Glass opacity (DNA-C11)                                                                 | P-07-4  | Code from #22348 by `UtkarshUsername`                                                                                                                   |
| #22795 | fix(web): font picker scrolls to every font in short windows                   | ADOPT  | Cherry-pick. Font picker list shrinks with the capped popup so every font is reachable (same flex chain as BranchPicker)                                                                | P-07-5  | Code from #22795 by `Byntham`                                                                                                                           |
| #23136 | fix(web): keep theme color alpha when a hex value is typed                     | ADOPT  | Cherry-pick. Typing a hex colour in the theme editor keeps alpha                                                                                                                        | P-07-4  | Code from #23136 by `only21mil`                                                                                                                         |
| #23640 | fix(web): show project action edit buttons on touch screens                    | ADOPT  | Cherry-pick. Adds pointer-coarse:opacity-100 so touch users see the project action edit gear, the same pattern KeybindingsSettings and PullRequestEditButton use [F-02-04 touch family] | P-08-8  | Code from #23640 by `only21mil`                                                                                                                         |
| #23348 | fix(mobile): review file navigation respects reduced motion                    | ADOPT  | Cherry-pick. Mobile review file navigation honours useReducedMotion for both scroll commands (DNA-M5) [F-15-16 family]                                                                  | MO-7    | Code from #23348 by `unmanbearpig`                                                                                                                      |
| #23740 | fix(mobile): name iOS environment buttons for VoiceOver                        | ADOPT  | Cherry-pick. Names and button roles for iOS Reconnect and Remove icon buttons (DNA-I4) [F-15-05 family]                                                                                 | A-21    | Code from #23740 by `only21mil`                                                                                                                         |
| #22100 | fix(web): respect reduced motion in thread loading controls                    | ADOPT  | Cherry-pick. Replaces three hand-rolled animate-spin icons with the shared Spinner, exactly DNA-M6 and DRIFT-8 [F-19-06, F-03-36, F-05-32]                                              | MO-5    | Code from #22100 by `saphid`; overlaps #24865: `ThreadRelationshipsControl.tsx`                                                                         |
| #23666 | fix(web): a context submenu near the right edge no longer covers its…          | BORROW | Reimplement. Fallback context submenu near the right edge covers its parent; flip moved into the deferred clamp [F-02-05 context menu]                                                  | A-10    | Idea from #23666 by `Brechard`                                                                                                                          |
| #23956 | fix(web): restart-to-update icon no longer shows a stray dot                   | BORROW | Reimplement. Stray dot on the restart-to-update icon is a real defect; the fix hacks lucide's first path with stroke-dash arbitrary variants                                            | P-14-5  | Idea from #23956 by `shurkanTwo`                                                                                                                        |
| #21878 | fix(web): edit from here uses a pencil icon                                    | BORROW | Reimplement. Undo icon on 'Edit from here' reads as undo; pencil proposed                                                                                                               | H8      | Idea from #21878 by `voltcrash`; overlaps #24865: `MessagesTimeline.tsx`                                                                                |
| #22367 | fix(web): keep markdown separators visible in dark mode                        | BORROW | Reimplement. Markdown rules vanish in dark T3 Chat bubbles                                                                                                                              | H8      | Idea from #22367 by `Zlash65`; overlaps #24865: `index.css`                                                                                             |
| #22385 | fix(web): lineage list no longer shifts when "Show more" makes it scroll       | BORROW | Reimplement. Adds scrollbar-gutter-stable to the lineage list so rows stop shifting                                                                                                     | P-03-4  | Idea from #22385 by `FllipEis`; credit original author `FllipEis` (maintainer takeover); overlaps #24865: `ThreadRelationshipsControl.tsx`              |
| #23590 | fix(web): show working state while provider sessions start                     | BORROW | Reimplement. Timeline shows no working state while a session is preparing or starting; derives it from persisted phase (DNA-P3)                                                         | S-5     | Idea from #23590 by `only21mil`                                                                                                                         |
| #24084 | fix(web): keep the wide table scrollbar visible when it overflows              | BORROW | Reimplement. Hidden columns look complete because the table scrollbar shows only on hover (issue 16091)                                                                                 | H8      | Idea from #24084 by `fixfon`; overlaps #24865: `index.css`                                                                                              |
| #22236 | fix(web): stacked composer notices line up their details buttons               | BORROW | Reimplement. Minimum width on banner actions lines up stacked details buttons [F-12-03, DNA-K6]                                                                                         | S-7     | Idea from #22236 by `Zeus-Deus`                                                                                                                         |
| #22843 | fix(mobile): sent messages no longer stay in the iOS composer after IME input  | BORROW | Reimplement. Sending while the iOS keyboard holds uncommitted IME text leaves the draft behind                                                                                          | M-13    | Idea from #22843 by `nabettu`                                                                                                                           |
| #22974 | fix(web): composer notices no longer flicker next to a floating preview        | BORROW | Reimplement. Details button appears and disappears in a loop, so composer height flips each frame beside a floating preview (DNA-P1)                                                    | S-7     | Idea from #22974 by `Brechard`                                                                                                                          |
| #23280 | fix(web): model picker no longer opens on an empty Favorites tab               | BORROW | Reimplement. Model picker opened on an empty Favorites tab when favorites belong to disabled providers (empty-state defect)                                                             | P-04-5  | Idea from #23280 by `fixfon`                                                                                                                            |
| #24283 | fix(web): /usage-limits shows above the Tasks row before tucking behind it     | BORROW | Reimplement. An explicit /usage-limits result hides behind the Tasks banner                                                                                                             | P-09-5  | Idea from #24283 by `camchis`                                                                                                                           |
| #24331 | fix(web): typed answer moved to the draft by an option click is announced      | BORROW | Reimplement. Option click moves a typed answer into the hidden draft; adds a 'Your typed text was set aside' toast                                                                      | A-9     | Idea from #24331 by `voida6`                                                                                                                            |
| #24684 | fix(web): a failed plan follow-up no longer overwrites the next draft          | BORROW | Reimplement. A failed plan follow-up overwrites the next draft; restore only when the composer is empty and the route is current                                                        | S-7     | Idea from #24684 by `only21mil`                                                                                                                         |
| #24773 | fix(web): terminal output no longer edits a hidden question draft              | BORROW | Reimplement. Terminal 'Add to chat' while a question is open wrote to a hidden draft                                                                                                    | S-7     | Idea from #24773 by `juliusmarminge`; overlaps #24865: `ChatComposer.tsx`                                                                               |
| #22778 | fix(web): use neutral indicators for inactive source control providers         | BORROW | Reimplement. Optional unused source-control providers carry yellow warning dots; makes them grey and the badge neutral (DNA-C6)                                                         | T10     | Idea from #22778 by `UtkarshUsername`                                                                                                                   |
| #24189 | fix(web): long guide Next buttons wrap instead of overflowing                  | BORROW | Reimplement. Review guide Next button overflows with long agent-written titles                                                                                                          | E-11    | Idea from #24189 by `PixPMusic`; overlaps #24865: `button.tsx`                                                                                          |
| #20003 | fix(web): settings scope pickers stay in reach while you scroll                | BORROW | Reimplement. Sticky scope pickers: right problem, but -mt-6/-mb-3 offsets, opaque bg-background and scroll-pt-24 are brittle and hide the grain (DNA-C12)                               | P-08-1  | Idea from #20003 by `ashx-j`; maintainer takeover (batch settings-theme-01); overlaps #24865: `SettingsScopeSentence.tsx`, `settingsLayout.tsx`         |
| #24381 | fix(web): Add provider keeps Next and Cancel on screen                         | BORROW | Reimplement. Wizard popup scrolls as a whole so Next and Cancel vanish when zoomed [F-10-12]                                                                                            | O-7     | Idea from #24381 by `Claudesaul`                                                                                                                        |
| #24719 | fix(web): the welcome wizard keeps the project selection when you go back…     | BORROW | Reimplement. Welcome wizard drops the project selection on Back; lifts selection state with a test [§8 gap 17]                                                                          | O-6     | Idea from #24719 by `Jacksondr5`                                                                                                                        |
| #23194 | fix(web): offer retry while an environment reconnects                          | BORROW | Reimplement. Reconnecting banner has no 'Retry now' although the retry command exists (issue 22024)                                                                                     | S-31    | Idea from #23194 by `juliusmarminge`                                                                                                                    |
| #23679 | fix(web): show clipboard errors in anchored copy notifications                 | BORROW | Reimplement. Anchored copy-error toast gets error type, drops tooltip styling and timeout [F-12-24, F-12-28]                                                                            | S-4     | Idea from #23679 by `only21mil`                                                                                                                         |
| #23753 | fix(web): show an error when merge-back or disconnect fails                    | BORROW | Reimplement. Merge back and Disconnect fail silently; adds error toasts like Stop subagent (DNA-P3, DNA-V3)                                                                             | S-8     | Idea from #23753 by `only21mil`; overlaps #24865: `ThreadRelationshipsControl.tsx`                                                                      |
| #24260 | fix(web): usage limit toast shows the Limited icon                             | BORROW | Reimplement. Right fix (limited toast showed the info question mark, issue 24253) but uses text-warning while sibling arms use *-foreground [F-12-15]                                   | S-8     | Idea from #24260 by `fixfon`                                                                                                                            |
| #24313 | fix(web): opening a thread dismisses its notification toasts                   | BORROW | Reimplement. Opening a thread should dismiss its notification toasts (issue 20883) [F-12-14]                                                                                            | S-8     | Idea from #24313 by `juliusmarminge`; same issue as #24592 (takeover of #20884 by `GLDRoger`); credit `GLDRoger` if the route-resolver approach is used |
| #23392 | fix(desktop): show a starting splash instead of no window while the…           | BORROW | Reimplement. Desktop shows no window for minutes while the backend boots; adds a 'Starting T3 Code…' splash [F-10-09, F-13]                                                             | P-14-2  | Idea from #23392 by `shivamhwp`; re-land of #19706 by `ronak-guliani`                                                                                   |
| #23141 | fix(desktop): clicking inside the in-app browser closes open host menus        | BORROW | Reimplement. Clicking inside the in-app browser leaves host menus open                                                                                                                  | P-14-9  | Idea from #23141 by `voida6`                                                                                                                            |
| #24581 | fix(web): HTML preview clears native window controls                           | BORROW | Reimplement. HTML preview close button collides with native Windows and Linux window controls; subtracts --native-titlebar-height like the image viewer                                 | P-14-4  | Idea from #24581 by `juliusmarminge`; takeover of #19909 by `Onik97`                                                                                    |
| #20144 | fix(ios): iPad sidebar tabs no longer stick on the wrong tab                   | BORROW | Reimplement. iPad sidebar segment desyncs because SwiftUI keeps the tapped segment in a hidden copy; remount key fixes 8 of 8 cycles                                                    | M-9     | Idea from #20144 by `PixPMusic`                                                                                                                         |
| #21383 | fix(mobile): usage chart bars round at the top instead of the bottom           | BORROW | Reimplement. Android usage chart bars rounded at the bottom; per-column height fix with emulator screenshots                                                                            | M-14    | Idea from #21383 by `adityavardhansharma`                                                                                                               |
| #21548 | fix(mobile): iOS HTML file previews start below the header                     | BORROW | Reimplement. iOS HTML file previews start under the header; WebView inset set to automatic                                                                                              | M-11    | Idea from #21548 by `nabettu`                                                                                                                           |
| #21691 | fix(mobile): Android composer's send row no longer hides behind the…           | BORROW | Reimplement. Android composer hides behind the taskbar with a hardware keyboard                                                                                                         | M-13    | Idea from #21691 by `shivamhwp`                                                                                                                         |
| #21757 | fix(mobile): Android composer buttons and Thread settings rows no longer…      | BORROW | Reimplement. Android 'Remove animations' leaves entering views at opacity 0, hiding composer buttons and Thread settings rows [F-15-16]                                                 | MO-7    | Idea from #21757 by `shivamhwp`                                                                                                                         |
| #22417 | fix(mobile): iOS sheets scroll to the end and keep their buttons on screen     | BORROW | Reimplement. Pins shared iOS Sheet content to the host edges, fixing the unreachable last line                                                                                          | M-11    | Idea from #22417 by `Claudesaul`                                                                                                                        |
| #22418 | fix(mobile): iOS terminal's Attach visible output clears the home indicator    | BORROW | Reimplement. 'Attach visible output' sits under the iPhone home indicator; adds safe-area bottom padding                                                                                | M-11    | Idea from #22418 by `Claudesaul`                                                                                                                        |
| #22420 | fix(mobile): review's empty state stays below the header on iOS                | BORROW | Reimplement. iOS Review 'No changes' card slides under the header after pull-to-refresh                                                                                                 | M-11    | Idea from #22420 by `Claudesaul`                                                                                                                        |
| #22550 | fix(mobile): iPad sidebar no longer hides its first thread before iOS 26       | BORROW | Reimplement. iPadOS 18 sidebar hides its newest thread under the header                                                                                                                 | M-11    | Idea from #22550 by `Neilsmahajan`                                                                                                                      |
| #22568 | fix(mobile): Android file link pills are no longer squished                    | BORROW | Reimplement. Android file link pills render at half width in chat (since #18735), a visible regression                                                                                  | M-14    | Idea from #22568 by `RVZO6`                                                                                                                             |
| #22742 | fix(mobile): hide Android draft native header before first layout              | BORROW | Reimplement. Maintainer one-liner hiding the Android draft native header on first render, but Android rows unverified and patch fails on our base                                       | M-9     | Idea from #22742 by `juliusmarminge`                                                                                                                    |
| #23155 | fix(mobile): disabled send button is readable in Material You dark             | BORROW | Reimplement. Disabled send button invisible in Material You dark                                                                                                                        | M-13    | Idea from #23155 by `RVZO6`                                                                                                                             |
| #23401 | fix(mobile): use monospace in the Android terminal preview                     | BORROW | Reimplement. Android lacks Menlo, so the Settings terminal preview needs a platform font                                                                                                | M-14    | Idea from #23401 by `only21mil`                                                                                                                         |
| #23688 | fix(mobile): keep source text bold for numeric font weights                    | BORROW | Reimplement. iOS Source view bold maps 700 to semibold; one-line mapping fix plus test                                                                                                  | M-14    | Idea from #23688 by `only21mil`                                                                                                                         |
| #23797 | fix(mobile): expanded HTML pages start below the header on iOS                 | BORROW | Reimplement. Expanded HTML page starts under the iOS header; correct prop (automaticallyAdjustContentInsets does nothing for WKWebView)                                                 | M-11    | Idea from #23797 by `Claudesaul`                                                                                                                        |
| #23888 | fix(mobile): models stay visible in the picker with Android animations removed | BORROW | Reimplement. Android 'Remove animations' leaves model picker rows invisible [F-15-16]                                                                                                   | MO-7    | Idea from #23888 by `shivamhwp`                                                                                                                         |
| #24385 | fix(mobile): confirm before stopping background work from the floating capsule | BORROW | Reimplement. Confirm before Stop in the floating background-work capsule (accidental tap ends every task)                                                                               | S-19    | Idea from #24385 by `VendettaGhub`                                                                                                                      |
| #24484 | fix(mobile): dismiss keyboard interactively while dragging chat                | BORROW | Reimplement. Interactive keyboard dismiss while dragging the chat                                                                                                                       | M-13    | Idea from #24484 by `JamesOBrien2`                                                                                                                      |
| #24541 | fix(android): keep navigation rail controls steady across tabs                 | BORROW | Reimplement. Android rail spacer keeps destinations centred when the compose button hides                                                                                               | M-9     | Idea from #24541 by `PixPMusic`                                                                                                                         |
| #24209 | fix(web): name the sidebar logo link T3 Code home                              | BORROW | Reimplement. Correct fix, marked pr:ready, but the name is disputed in review: 'T3 Code home' versus 'T3 Code, new thread' (what the click does, DNA-P3) [F-16-18, F-01-18]             | A-5     | Idea from #24209 by `shivamhwp`                                                                                                                         |
| #24567 | fix(web): scale inline code to Markdown table text                             | BORROW | Reimplement. Right defect (table inline code same size as text) but 0.875em of 12px gives 10.5px, off the type ladder                                                                   | H8      | Idea from #24567 by `juliusmarminge`; overlaps #24865: `index.css`                                                                                      |
| #22287 | fix(web): align sidebar button geometry with shared tokens                     | BORROW | Reimplement. Routes sidebar button sm and lg through the shared inset and control-radius tokens                                                                                         | T2      | Idea from #22287 by `UtkarshUsername`                                                                                                                   |
| #22906 | fix(web): diagnostics cards use one border radius                              | BORROW | Reimplement. Five diagnostics cards draw their own border and an 18px radius inside a 14px group (DNA-S ladder)                                                                         | T2      | Idea from #22906 by `Saikrishna1876`                                                                                                                    |
| #24147 | fix(copy): clarify provider errors and recovery                                | BORROW | Reimplement. Plain-language provider and approval copy ('Sign in to Codex') [F-12-35]                                                                                                   | S-9     | Idea from #24147 by `extoci`                                                                                                                            |
| #24148 | fix(copy): clarify thread and source control settings                          | BORROW | Reimplement. Plain-language descriptions across settings, mobile and docs (DNA-V5) [F-20-06]                                                                                            | CP-6    | Idea from #24148 by `extoci`; overlaps #24865: `SettingsThreadsRouteScreen.tsx`, `SettingsPanels.tsx`, `settingsSearch.ts`                              |
| #23404 | fix(server): Expo projects show their app icon                                 | SKIP   | Nothing. Server favicon candidate list gains one Expo path; not UI work, no screenshots                                                                                                 | none    | none                                                                                                                                                    |
| #14482 | refactor(desktop): Drop the unused Linux --class switch                        | SKIP   | Nothing. Linux Chromium class switch cleanup; desktop packaging, not UI                                                                                                                 | none    | none                                                                                                                                                    |
| #18158 | fix(mobile): preserve Duo search text across layout changes                    | SKIP   | Nothing. Maintainer note says superseded by main with zero diff                                                                                                                         | none    | none                                                                                                                                                    |
| #18848 | refactor(mobile): look up viewed pull request files with a Set                 | SKIP   | Nothing. Internal Set refactor of a mobile hook; no UI change                                                                                                                           | none    | none                                                                                                                                                    |
| #21054 | fix(desktop): start the WSL backend in the Linux home, not /mnt/c              | SKIP   | Nothing. WSL backend working directory; not UI                                                                                                                                          | none    | none                                                                                                                                                    |
| #21592 | fix(desktop): declare Calendar access for hosted commands                      | SKIP   | Nothing. macOS Info.plist Calendar strings; packaging, not UI                                                                                                                           | none    | none                                                                                                                                                    |
| #22002 | fix(desktop): clear Cache Storage when deleting browser profile data           | SKIP   | Nothing. Desktop browser-profile privacy plumbing (Cache Storage); not UI                                                                                                               | none    | none                                                                                                                                                    |
| #22465 | fix(desktop): keep remote browser host tabs paintable                          | SKIP   | Nothing. Remote browser host tab compositing; desktop plumbing, patch fails on our base                                                                                                 | none    | none                                                                                                                                                    |
| #22497 | fix(desktop): stop the macOS Settings tracker when T3 exits                    | SKIP   | Nothing. macOS Settings tracker osascript loop lifetime; desktop plumbing, patch fails on our base                                                                                      | none    | none                                                                                                                                                    |
| #22532 | fix(desktop): preserve deleted Start Menu shortcuts on auto-update             | SKIP   | Nothing. NSIS Start Menu shortcut repair on updates; installer, not UI                                                                                                                  | none    | none                                                                                                                                                    |
| #22835 | fix(desktop): browser tabs no longer report loopback access as denied          | SKIP   | Nothing. Electron loopback permission for Okta; desktop plumbing, patch fails on our base                                                                                               | none    | none                                                                                                                                                    |
| #23468 | fix(azure-devops): file comments name the path the diff shows                  | SKIP   | Nothing. Azure DevOps comment path normalisation; provider logic, not UI                                                                                                                | none    | none                                                                                                                                                    |
| #23538 | fix(mobile): strip image and link punctuation from subagent previews           | SKIP   | Nothing. Mobile subagent preview regex for image and link markup; niche formatter edge case                                                                                             | none    | none                                                                                                                                                    |
| #23723 | fix(web): show rounded diff counts as 1m instead of 1000k                      | SKIP   | Nothing. Compact diff count rounding at 999,500 lines; correct but no user impact                                                                                                       | none    | none                                                                                                                                                    |
| #24149 | fix(copy): clarify unavailable tasks and duplicate requests                    | SKIP   | Nothing. Renames the webhook replay key to 'Duplicate request key'; niche scheduled-task form, little value for the overhaul                                                            | none    | none                                                                                                                                                    |
| #24248 | docs: keybindings guide names the real when key and queue command              | SKIP   | Nothing. Docs-only keybinding guide fix                                                                                                                                                 | none    | none                                                                                                                                                    |

ADOPT rows keep the author's test with the change; add our own where the PR has none (#22795: a short-window test). The PRS.md ledger credits takeovers to both the taker and the original author.

### 12.3 Attribution rules (never silently copy)

- **ADOPT**: cherry-pick so authorship is preserved (or add a `Co-authored-by` trailer when re-applied by hand) and put ``Code from #N by `login` (title)`` in the PR body. Only for diffs under about 150 lines that apply cleanly; all 16 are 2-18 lines.
- **BORROW**: reimplement in our own code from the finding and put ``Idea from #N by `login` (title)`` in the PR body. Takeover PRs also name the original author: #22385 (`FllipEis`), #24581 (takeover of #19909 by `Onik97`), #24313 and #24592 (takeover of #20884 by `GLDRoger`), #23392 (re-land of #19706 by `ronak-guliani`), #20003 (maintainer takeover in batch settings-theme-01).
- **SKIP**: no code taken, no credit line. Do not re-open a closed question without new evidence.
- If a maintainer lands the same fix first (37 `takeover` PRs), drop our change and leave the credit in the issue thread.
- Every chunk PR body cites DNA rule IDs and attaches before and after shots (Macroscope sends default-appearance and new-setting changes to a human; rejection-patterns rule 4: features need prior approval).
- Customisation items N1, N2, N4, N5 credit the Ideas and PRs that asked for them (section 12.4).

### 12.4 Ideas discussions and issues with the most demand that these proposals address

Ordered roughly by demand (upvotes or reactions) at the 2026-10-25 snapshot (Ideas top 50 over the 1,200 newest; 1,068 open issues).

| Item                                   | Demand                                         | The ask                                                                              | Our proposal                                                                                                                                                                                          | Status                                                               |
| -------------------------------------- | ---------------------------------------------- | ------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Discussion #17170                      | 61 up (rank 1)                                 | Off switch for compact-before-send on stale Claude threads                           | F-04-20: #24865 already gives the neutral "Compact next" / "Keep full" armed pill. The off switch ("Compact before send on stale threads: Ask / Never") is not one of the five new items in section 7 | **Gap**: armed state addressed, the setting is a maintainer decision |
| Discussion #14404                      | 49 up (rank 2)                                 | Show context window usage per thread                                                 | F-04-40, section 7.5: meter shows automatically from 70 percent used; the "Legacy features" switch becomes "Context meter: Auto, Always, Never"                                                       | Addressed (S)                                                        |
| Discussion #15119 (PR #22306)          | 15 up (rank 4)                                 | Keep Thread details collapsed by default                                             | Section 7 N1 `threadDetailsDefaultOpen`                                                                                                                                                               | Addressed (S)                                                        |
| Issue #4123                            | 20 reactions                                   | Telemetry is on with no opt-out button                                               | F-24-11 (sections 8 and 10 row 55): the notice names the real opt-out `T3CODE_TELEMETRY_ENABLED=false`; an in-app toggle is a server setting                                                          | **Partial**: copy only, toggle is a dependency                       |
| Issue #24191                           | open, 0 comments                               | Collapsed sidebar is saved but never restored                                        | Section 7 N3 (F-23-04, F-01-01), XS, upstream-eligible                                                                                                                                                | Addressed                                                            |
| Discussion #14681                      | 5 up                                           | Peek the collapsed sidebar on hover                                                  | Rejected (section 7.4: DNA-ID2, X4); N3 removes the original annoyance                                                                                                                                | Rejected with reason                                                 |
| Issue #10961 (PRs #22411, #23122)      | 3 reactions, 6 comments                        | Session import unreachable after onboarding                                          | F-10-02: Settings > General > About "Setup" row and palette "Open setup" (section 8 criteria 9 and 10; wireframe 08)                                                                                  | Addressed                                                            |
| Discussions #16720, #14956 (PR #10412) | 8 and 6 up                                     | Mods, custom CSS, wallpaper                                                          | Rejected (section 7.4: DNA-ID2, C2, K8, P1); scope held for maintainers                                                                                                                               | Rejected with reason                                                 |
| Issues #13959, #23653, #23656, #23760  | 0-2 reactions each; screen-reader cluster of 6 | Row actions unreachable, no feedback on thread chords, heading wrap lands mid-thread | Section 11.6: F-02-07 and F-02-06 (rows as sibling buttons, roving list), F-16-15, F-16-18. #23656 is not reproduced on main (announcers exist): verify                                               | Addressed except #23656                                              |
| Issue #20883 (PRs #24313, #24592)      | toast cluster of 6                             | In-app "Thread completed" toast stays after opening the thread                       | F-12-14 (BORROW #24592 route-resolver approach), section 10 toast rows                                                                                                                                | Addressed (S)                                                        |

Not addressed by this part, noted for the owners of other parts: Ideas #18028 (side chat, 33 up) and #14118 (shared MCP config, 14 up) are features outside UI/UX polish; #16079 (snooze shortcut, 6 up) is F-21-18; #17335 (no mobile push while active on desktop, 10 up) needs a focus signal from `ThreadNotificationCoordinator`, no code exists.

### Gaps in part B

- **Chunk ids** in section 12 follow part C section 13.3 (rename pass applied); the 16 SKIP rows carry none by design.
- **Owner decisions pending**: D1 (computer vs environment), D2 (Source Control vs Source control), D3 (keybinding label case), D-M1 (reduced-motion liveness cue). Every row that depends on one is tagged and uses the stated default.
- **No fix is proposed anywhere in the audits** for several small-text contrast failures listed in the area 16 table: `text-primary` as text in dark (4.26:1; welcome "1" 3.73), muted on accent (4.39 light), palette keyboard hint on the highlighted row (4.39), "N unmodified lines" (2.88 light), diff gutter numbers on an added row (2.97), and sidebar `secondary-label` in Grove, Ocean, Ember and Iris (4.23-4.38 at 12 px, below the 4.5 floor despite DNA-K9). Candidates for a retune pass; not specified here.
- **Compact-before-send off switch** (Ideas #17170, the top-voted Idea) has no spec in section 7 because area 23 did not mark it new-and-fits-DNA; area 04 defers it to the settings areas.
- **Settings row positions** in section 7 assume #24865 has merged and depend on choosing F-23-09 (Diffs section) or F-08-03 with F-08-09, and on the F-23-10 split.
- **Onboarding times** in section 8 are keystroke-level estimates from the code path, not stopwatch runs; no true first launch could be produced, the `ConnectOnboarding` mobile sheet was never captured, Android is code-read, and the wireframes were not usability-tested. Server dependencies (F-10-01, F-09-30, PATH refresh #9429, telemetry toggle) are outside UI scope; the Full access default is a product decision.
- **Copy table coverage**: audit coverage of web chrome is about 85 percent (strings built across lines, in `packages/` or `apps/server` were sampled by grep). Evidence files for two rows are not recorded in the audit (F-24-01 sheet caption and helper; the F-20-17 pairing dialog title). Mobile strings were compared to web only for actions that exist on both.
- **Accessibility evidence** has no real screen reader, no Firefox or WebKit, no Windows high-contrast host, no 80/125/150 percent zoom and no text-spacing override run; the approval path is code-read; contrast over the sidebar artwork, glass blur and grain is not measurable; mobile VoiceOver and TalkBack are area 15's.
- **Prior art**: 103 widened-pool PRs are title-only BORROW-candidates with no diff read; ADOPT dry-runs were against `5f64c5eb`, not the post-#24865 tree; `rejection-patterns.md` (1.4 MB) was not re-read and is cited only through area 23 and PRS.md.
- **Internal housekeeping not done here**: the nine wrong rows of `DOCS-DIGEST.md` (F-23-01) were not edited; this part is the corrected reference.

## 13. PR plan

Plan for Phase 2: **240 chunks in 11 tracks** covering every one of the 118 P1 and 318 P2 findings exactly once (severities after the follow-up sweep, see 13.1; area 22 included) plus 40 P3 findings that ride along; 164 P3 are deferred (13.15). Each chunk is one branch and one PR-sized change on the fork; "upstream" says whether it can also go to `pingdotgg/t3code` under CONTRIBUTING.md. Nothing here is posted or opened in Phase 1.

### 13.1 How to read a card

| Field    | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Id       | `T#` Tokens, `H#` Hierarchy, `P-<area>-<n>` Polish-by-area (area = audit number), `S-<n>` States, `E-<n>` Edge cases, `C-<n>` Customisation, `O-<n>` Onboarding, `M-<n>` Mobile, `A-<n>` A11y, `MO-<n>` Motion, `CP-<n>` Copy                                                                                                                                                                                                                                                                                                                                                                        |
| Findings | Ids covered. `(P1)` marks a P1, `(P3)` a P3 riding along; unmarked = P2. The audit file's **Proposed** text is normative; Accept is a one-line summary of it                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Lines    | Estimate: per finding XS 15, S 55, M 160, L 420 (tests and docs included), summed and rounded to 5; adjusted by hand where the audit effort clearly misjudges the work (codemods, new tests, new components) (22 chunks, marked "adjusted" on the card). Hard cap 800: the largest chunks are about 420 (P-05-5, P-13-1, E-4, A-15, CP-8) lines. Upstream candidates should stay under 300                                                                                                                                                                                                           |
| Wave     | 0 = independent of #24865 and of other chunks, can start on current main. 1 = touches #24865 files or needs it first. 2 = needs a wave-1 chunk. 3 = needs a wave-2 chunk                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Files    | From the finding's Evidence and Proposed text (first three cited files per finding when Proposed names none). Paths are relative to `apps/web/src/` unless prefixed `mobile:` (`apps/mobile/`), `desktop:`, `server:` (`apps/server/src/`), `pkg:` (`packages/`). Treat as a starting point: confirm with `git grep` before editing                                                                                                                                                                                                                                                                  |
| Before   | Baseline files in `ui-overhaul/screens/baseline/` named `<label>-<theme>-<scheme>-<WxH>.png` (`{dark,light}` expands to both; see `MANIFEST.md`), plus images the finding cites in `ui-overhaul/screens/<area>/`. Code-read findings have none: add a `states.json` label first                                                                                                                                                                                                                                                                                                                      |
| After    | Standard set, then extras named on the card. **Standard set:** (1) re-run `/tmp/t3code-pw/capture.mjs --out ui-overhaul/screens/<chunk-id> --only <label>` with identical label, viewport, scheme and theme (`screens/capture.md`); (2) light and dark; (3) re-measure each number the finding cites with the method it used (axe, `getComputedStyle`, CDP tree); (4) one named-theme spot check (Ember or Grove, 1440x900) for colour and token chunks; (5) pair before/after by file name in the PR body, upload to GitHub, push to the fork branch `ui-overhaul/assets`, never into a code branch |
| Tests    | `vp test run <files>` = existing tests found beside the cited files; `vp lint <files>` = the Files listed (first four shown, full paths); typecheck by package filter. "new:" = the failing-first test AGENTS.md asks for on logic, data and state bugs. Visual-only fixes ship captures and no test. Run `vp run check:changed` before pushing; never repo-wide checks                                                                                                                                                                                                                              |
| Model    | Opus low up to 150 estimated lines; Opus medium above that or where the card says so (server, cross-package, subtle behaviour); Haiku only for pure mechanical rewrites (codemods, string renames). Never Opus high, never Fable                                                                                                                                                                                                                                                                                                                                                                     |
| Upstream | yes (one problem, fix-shaped, no #24865 conflict) / yes after #24865 merges / no (reason) / bundle (fork PR, the stated number of carve-out PRs can go upstream one problem each). `fix(...)` titles only; features and defaults wait for an Ideas post (section 14)                                                                                                                                                                                                                                                                                                                                 |
| #24865   | independent / rebase after merge (names the overlapping files from `pr-24865.diff`, 55 files) / partial / conflicts. File overlap is a prompt to re-check, not proof of a conflicting hunk                                                                                                                                                                                                                                                                                                                                                                                                           |

**Severity changes applied from `_FOLLOWUPS.md` Summary:** F-03-15 P2 to P1 (S-15; server-only cause); F-02-18 P2 to P3 (P-02-1; label rewritten around `backgroundWorkHoldsCompletion`); F-23-04 merged into F-01-01 (P-01-1 closes both and F-01-07); F-21-13 stays P2 in P-21-8 and becomes P1 if the Cmd+Q probe reproduces. Net: P1 118, P2 318, P3 204 (the index lists 116 / 316 / 200 for 632 findings; area 22 adds 1 / 4 / 3, total 640).

### 13.2 Ordering waves

| Wave | Rule                                                               | Chunks |
| ---- | ------------------------------------------------------------------ | -----: |
| 0    | independent of #24865 and of other chunks: start on current `main` |     94 |
| 1    | needs #24865 merged (touches its files or tokens)                  |    110 |
| 2    | needs a wave-1 chunk first                                         |     28 |
| 3    | needs a wave-2 chunk first                                         |      8 |

Wave 2 chunks: T5, T7, T8, H3, H4, P-05-5, P-11-3, P-22-1, S-2, S-23, S-24, C-7, C-8, C-11, O-10, O-11, O-16, O-17, M-7, A-2, A-6, A-7, MO-3, MO-6, MO-8, CP-3, CP-8, CP-10.
Wave 3 chunks: T9, S-16, S-17, S-18, S-19, S-20, S-21, MO-9.
Decision-gated: CP-1 (D1; O-16 and O-17 reuse its word), CP-4 (D3), CP-6 (D2), MO-1 and MO-5 liveness wording (D-M1), A-22 (owner calls). See section 15.

### 13.3 Provisional ids from part B, replaced

Part B section 12 labelled chunks with `A##` (audit area) and `§N` (section). Replacement rule: `A##` becomes the chunks below; the per-PR table gives the exact chunk for every ADOPT and BORROW row (SKIP rows have no chunk). Part B text itself is unchanged and needs the rename pass.

| Part B label                                                  | Chunks holding that area's findings                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| A01 Shell                                                     | P-01-1, P-01-2, P-01-3, P-01-4, P-01-5, P-01-6, P-01-7, P-21-2, E-1, E-2, C-1, C-2, A-5, A-17, MO-1                       |
| A02 Thread list                                               | T0, T8, H7, P-02-1, P-02-2, P-02-3, P-02-4, P-21-4, S-3, E-3, E-4, M-1, A-2, A-10, A-11                                   |
| A03 Thread view                                               | T0, T7, T10, H4, H8, P-03-1, P-03-2, P-03-3, P-03-4, S-4, S-5, S-6, S-13, S-14, S-15, E-5, E-6, E-7, M-2, A-3, MO-5       |
| A04 Composer                                                  | T0, T7, T10, P-04-1, P-04-2, P-04-3, P-04-4, P-04-5, P-04-6, P-04-7, E-2, C-5, M-4, M-7, MO-4                             |
| A05 Diff                                                      | T10, H3, H4, P-05-1, P-05-2, P-05-3, P-05-4, P-05-5, S-16, S-21, S-23, E-8, E-9, E-10, E-11, A-18, MO-5                   |
| A06 Terminal                                                  | P-06-1, P-06-2, P-06-3, P-06-4, P-06-5, P-06-6, P-21-5, S-20, E-11, M-6, A-12, A-14, A-17                                 |
| A09 Providers                                                 | T6, T10, P-08-1, P-09-1, P-09-2, P-09-3, P-09-4, P-09-5, S-9, S-10, S-17, S-24, E-14, O-4, O-5, M-2, M-3, A-3, A-19, M-17 |
| A11 Remote                                                    | P-11-1, P-11-2, P-11-3, P-11-4, P-11-5, S-19, S-31, S-32, S-33, M-2, CP-1                                                 |
| A13 Loading                                                   | P-09-2, P-13-1, P-13-2, S-24, S-25, S-26, S-27, S-28, S-29, S-30, S-31, MO-5, MO-6                                        |
| A14 Desktop                                                   | P-14-1, P-14-2, P-14-3, P-14-4, P-14-5, P-14-6, P-14-7, P-14-8, P-14-9                                                    |
| A15 Mobile                                                    | M-9, M-10, M-11, M-12, M-13, M-14, M-15, M-16, A-21, MO-7                                                                 |
| A17 Type                                                      | T9, H1, H2, H3, H4, H5, H6, CP-6                                                                                          |
| A18 Shape                                                     | T1, T2, T3, T5, M-8                                                                                                       |
| Settings §7 (appearance and project fixes, not customisation) | P-07-1..5, P-08-1..9 (exact id per PR in the next table)                                                                  |
| Onboarding §8                                                 | O-1..O-17                                                                                                                 |
| Motion §9                                                     | MO-1..MO-9, S-26, S-29 (loading motion)                                                                                   |
| Toasts §10                                                    | S-1, S-3, S-4, S-8, S-9, S-12, CP-9, CP-10                                                                                |
| Copy §10                                                      | CP-1..CP-10, plus the copy rows inside S-* and P-*                                                                        |
| A11y §11                                                      | A-1..A-22                                                                                                                 |

Per-PR mapping (credit sentences are pasted from the `PRS.md` ledger; 69 ADOPT and BORROW rows, 16 SKIP rows omitted):

| PR     | Grade  | Part B label (provisional) | Real chunk |
| ------ | ------ | -------------------------- | ---------- |
| #22605 | ADOPT  | P-01-5                     | P-01-5     |
| #24438 | ADOPT  | H7                         | H7         |
| #23573 | ADOPT  | H8                         | H8         |
| #22436 | ADOPT  | P-21-10                    | P-21-10    |
| #22771 | ADOPT  | E-15                       | E-15       |
| #23166 | ADOPT  | P-04-4                     | P-04-4     |
| #24312 | ADOPT  | P-04-5                     | P-04-5     |
| #23893 | ADOPT  | P-05-3                     | P-05-3     |
| #24042 | ADOPT  | P-06-4                     | P-06-4     |
| #22348 | ADOPT  | P-07-4                     | P-07-4     |
| #22795 | ADOPT  | P-07-5                     | P-07-5     |
| #23136 | ADOPT  | P-07-4                     | P-07-4     |
| #23640 | ADOPT  | P-08-8                     | P-08-8     |
| #23348 | ADOPT  | MO-7                       | MO-7       |
| #23740 | ADOPT  | A-21                       | A-21       |
| #22100 | ADOPT  | MO-5                       | MO-5       |
| #23666 | BORROW | A-10                       | A-10       |
| #23956 | BORROW | P-14-5                     | P-14-5     |
| #21878 | BORROW | H8                         | H8         |
| #22367 | BORROW | H8                         | H8         |
| #22385 | BORROW | P-03-4                     | P-03-4     |
| #23590 | BORROW | S-5                        | S-5        |
| #24084 | BORROW | H8                         | H8         |
| #22236 | BORROW | S-7                        | S-7        |
| #22843 | BORROW | M-13                       | M-13       |
| #22974 | BORROW | S-7                        | S-7        |
| #23280 | BORROW | P-04-5                     | P-04-5     |
| #24283 | BORROW | P-09-5                     | P-09-5     |
| #24331 | BORROW | A-9                        | A-9        |
| #24684 | BORROW | S-7                        | S-7        |
| #24773 | BORROW | S-7                        | S-7        |
| #22778 | BORROW | T10                        | T10        |
| #24189 | BORROW | E-11                       | E-11       |
| #20003 | BORROW | P-08-1                     | P-08-1     |
| #24381 | BORROW | O-7                        | O-7        |
| #24719 | BORROW | O-6                        | O-6        |
| #23194 | BORROW | S-31                       | S-31       |
| #23679 | BORROW | S-4                        | S-4        |
| #23753 | BORROW | S-8                        | S-8        |
| #24260 | BORROW | S-8                        | S-8        |
| #24313 | BORROW | S-8                        | S-8        |
| #23392 | BORROW | P-14-2                     | P-14-2     |
| #23141 | BORROW | P-14-9                     | P-14-9     |
| #24581 | BORROW | P-14-4                     | P-14-4     |
| #20144 | BORROW | M-9                        | M-9        |
| #21383 | BORROW | M-14                       | M-14       |
| #21548 | BORROW | M-11                       | M-11       |
| #21691 | BORROW | M-13                       | M-13       |
| #21757 | BORROW | MO-7                       | MO-7       |
| #22417 | BORROW | M-11                       | M-11       |
| #22418 | BORROW | M-11                       | M-11       |
| #22420 | BORROW | M-11                       | M-11       |
| #22550 | BORROW | M-11                       | M-11       |
| #22568 | BORROW | M-14                       | M-14       |
| #22742 | BORROW | M-9                        | M-9        |
| #23155 | BORROW | M-13                       | M-13       |
| #23401 | BORROW | M-14                       | M-14       |
| #23688 | BORROW | M-14                       | M-14       |
| #23797 | BORROW | M-11                       | M-11       |
| #23888 | BORROW | MO-7                       | MO-7       |
| #24385 | BORROW | S-19                       | S-19       |
| #24484 | BORROW | M-13                       | M-13       |
| #24541 | BORROW | M-9                        | M-9        |
| #24209 | BORROW | A-5                        | A-5        |
| #24567 | BORROW | H8                         | H8         |
| #22287 | BORROW | T2                         | T2         |
| #22906 | BORROW | T2                         | T2         |
| #24147 | BORROW | S-9                        | S-9        |
| #24148 | BORROW | CP-6                       | CP-6       |

### 13.4 Tokens (13 chunks)

Global token, utility and lint-rule work that other chunks consume. Additive only: no new library, no gradient, glow or bounce, no change to the canvas, switch accent, three-line rows or composer model colour.

##### T0 Verify what #24865 already fixes (no code)

- Findings: F-02-02 (P1), F-02-03 (P1), F-03-41, F-04-01 (P1), F-04-03, F-04-20, F-10-08 (P1) · ~0 lines (no code) · wave 1 · depends on: #24865
- Files: none (no code)
- Before: `home-default-{dark,light}-1440x900.png`, `new-thread-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `02-thread-list-top-light-1440x900.png`, `02-thread-list-bottom-shelves-light-1440x900.png` (+4) · After: `screens/T0/` same names
- Accept: On the merged build each finding passes its audited measure (>=4.5:1 where a ratio is cited; one composer placeholder per state); anything still failing is re-filed under its own id.
- Tests: none (no code)
- Model: Opus low · risk: low - None functional · upstream: no: verification only, no diff · #24865: addressed by #24865: capture-and-compare only
- Note: Also: link the "Compact next" pill tooltip to Settings > General > Compact idle threads (the #17170 off switch already exists).

##### T1 `hit-area` utility and 24 px fine-pointer floor

- Findings: F-18-01 (P1), F-18-04, F-16-14 · ~180 lines (adjusted from 85) · wave 1 · depends on: #24865
- Files: `components/ui/button.tsx`, `components/chat/ChangedFilesTree.tsx`, `components/chat/ChatComposer.tsx`, `components/chat/ChatHeader.tsx`, `components/chat/MessagesTimeline.tsx`, `components/settings/SettingsScopeSentence.tsx` (+3)
- Before: `settings-appearance-default-{dark,light}-{1440x900,390x844}.png`, `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/T1/` same names
- Accept: `@utility hit-area` exists beside `surface-glass`; Switch, crumbs, fold toggle, scope triggers and `micro` buttons measure >=24x24 (fine) and >=44x44 (coarse) with unchanged visual size.
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts` · `vp lint apps/web/src/components/ui/button.tsx apps/web/src/components/chat/ChangedFilesTree.tsx apps/web/src/components/chat/ChatComposer.tsx apps/web/src/components/chat/ChatHeader.tsx ...` · `vp run --filter @t3tools/web typecheck` · new: browser test: Switch hit area >= 44 px under `pointer: coarse`
- Model: Opus medium · risk: med - `::after` captures taps over adjacent controls in dense rows (crumb next to toggle) · upstream: yes, after #24865 merges · #24865: rebase after merge: button.tsx, ChatComposer.tsx, MessagesTimeline.tsx

##### T2 Derive `--control-radius` from the radius ladder; sidebar family on one rung

- Findings: F-18-03, F-18-06 (P3) · ~30 lines · wave 1 · depends on: #24865
- Files: `index.css`, `components/Sidebar.tsx`, `components/guest/GuestPage.tsx`, `components/settings/SettingsSidebarNav.tsx`, `components/sidebar/SidebarDraftBlock.tsx`, `components/sidebar/SidebarThreadHeader.tsx` (+2)
- Before: `home-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/T2/` same names
- Accept: `--control-radius` is `var(--radius-lg)`; sidebar rows, search, settings nav and drafts share one radius; no `rounded-3xl` remains (GuestPage).
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts apps/web/src/components/guest/GuestPage.browser.test.tsx` · `vp lint apps/web/src/index.css apps/web/src/components/Sidebar.tsx apps/web/src/components/guest/GuestPage.tsx apps/web/src/components/settings/SettingsSidebarNav.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - row hover corner against the 2 px list gutter · upstream: yes, after #24865 merges · #24865: rebase after merge: index.css, Sidebar.tsx, SettingsSidebarNav.tsx

##### T3 Three-level shadow ladder (`--shadow-lift/popup/dialog`)

- Findings: F-18-02, F-12-25 (P3) · ~200 lines (adjusted from 70) · wave 1 · depends on: none
- Files: `components/ui/menu.tsx`, `components/ui/popover.tsx`, `components/ui/toast.tsx`, `components/AppRouteModal.tsx`, `components/chat/ExpandedImageDialog.tsx`, `components/chat/HtmlRenderDialog.tsx` (+9)
- Before: `command-palette-default-{dark,light}-1440x900.png`, `home-default-{dark,light}-1440x900.png`, `settings-appearance-default-{dark,light}-1440x900.png`; cited `18-toast-shadow-light-420x220@2x.png`, `18-menu-shadow-light-420x240@2x.png` (+1) · After: `screens/T3/` same names
- Accept: Menu, popover, combobox, dialog, route modal, toast and tooltip draw from three tokens in light and dark; 45 shadow strings become 3 plus the composer token.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/menu.tsx apps/web/src/components/ui/popover.tsx apps/web/src/components/ui/toast.tsx apps/web/src/components/AppRouteModal.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - toast and minimap lose their halo (check on light canvas) · upstream: yes, after #24865 merges · #24865: rebase after merge: menu.tsx, TimelineMinimap.tsx, select.tsx

##### T4 `--destructive-solid` fill for destructive buttons

- Findings: F-12-04 (P1) · ~60 lines (adjusted from 15) · wave 1 · depends on: #24865
- Files: `components/ui/button.tsx`, `index.css`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/T4/` same names
- Accept: White on destructive fill measures >=4.5:1 in light and dark; icons and borders keep `--destructive`.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/button.tsx apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - every destructive Button changes shade slightly (visible in snapshots · upstream: yes, after #24865 merges · #24865: rebase after merge: button.tsx, index.css

##### T5 Border alpha: four roles, codemod `/70`->`/60`, `/45 /40`->`/50`

- Findings: F-18-07 (P3) · ~120 lines (adjusted from 55) · wave 2 · depends on: #24865, T3
- Files: all `border-border/(70|45|40)` matches under `components/**` (103 sites), `index.css`
- Before: `home-default-{dark,light}-1440x900.png`, `settings-general-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/T5/` same names
- Accept: Only bare, `/80`, `/60`, `/50` border alphas remain; pixel diff of sampled screens shows no visible shift beyond 1 level.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/ComposerAttachmentStrip.tsx apps/web/src/components/chat/ExpandedImageDialog.tsx apps/web/src/components/chat/TimelineUserMessageRow.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: low · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)
- Note: Mechanical codemod over about 103 sites.

##### T6 Muted-alpha lint rule (warn) and codemod: settings directory

- Findings: F-16-06 (P1), F-16-09, F-09-11, F-09-23, F-08-30 · ~220 lines · wave 1 · depends on: #24865
- Files: `oxlint-plugin-t3code` (new rule), every `text-muted-foreground/NN` under `components/settings/`
- Before: `settings-general-default-{dark,light}-1440x900.png`, `settings-providers-default-{dark,light}-1440x900.png`, `settings-appearance-default-{dark,light}-1440x900.png`, `settings-keybindings-default-{dark,light}-1440x900.png`; cited `09-providers-instance-disabled-light-1440x900.png` · After: `screens/T6/` same names
- Accept: `t3code/no-text-opacity-on-muted` ships at warn; zero `text-muted-foreground/NN` in `components/settings/`; measured settings labels >=4.5:1.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/components/settings/ProviderInstanceCard.test.ts` · `vp lint apps/web/src/components/settings/KeybindingsSettings.tsx apps/web/src/components/settings/ProviderInstanceCard.tsx apps/web/src/components/settings/ProviderModelsSection.tsx apps/web/src/components/ui/sidebar.tsx` · `vp run --filter @t3tools/web typecheck` · new: oxlint rule unit test (fail case, pass case, `components/ui` exempt)
- Model: Opus medium · risk: med - UI gets slightly louder · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### T7 Muted-alpha codemod: chat directory

- Findings: F-04-21 (P1), F-03-25, F-04-31 · ~130 lines (adjusted from 45) · wave 2 · depends on: T6, #24865
- Files: every `text-muted-foreground/NN` and `text-foreground/NN` under `components/chat/`
- Before: `new-thread-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`, `thread-claude-markdown-default-{dark,light}-1440x900.png`; cited `04-composer-resting-zoom-light-1440x900@2x.png` · After: `screens/T7/` same names
- Accept: Composer footer, strip, model picker, effort menu, banners and timeline chrome use bare tier tokens; composer footer text measures >=4.5:1 light and dark.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/BranchToolbarEnvModeSelector.tsx apps/web/src/components/BranchToolbarEnvironmentSelector.tsx apps/web/src/components/chat/ChatComposer.tsx apps/web/src/components/chat/ModelListRow.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - None functional · upstream: yes, after #24865 merges · #24865: rebase after merge: ChatComposer.tsx, TraitsPicker.tsx

##### T8 Muted-alpha codemod: sidebar, pull requests, usage

- Findings: F-02-01 (P1) · ~90 lines (adjusted from 15) · wave 2 · depends on: T6, #24865
- Files: matches under `components/sidebar/`, `components/pullRequest/`, `components/usage/`, `Sidebar.tsx`
- Before: `home-default-{dark,light}-1440x900.png`, `pull-requests-default-{dark,light}-1440x900.png`, `usage-default-{dark,light}-1440x900.png`; cited `02-thread-list-shelves-expanded-light-1440x900.png`, `02-thread-list-settled-expanded-dark-1440x900.png` · After: `screens/T8/` same names
- Accept: Settled and Snoozed rows use the bare secondary token (>=4.5:1); favicon dim uses opacity-60 grayscale; no `/NN` text alpha left in the three directories.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/sidebar/SidebarThreadRow.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Parked rows look less receded · upstream: yes, after #24865 merges · #24865: rebase after merge: SidebarThreadRow.tsx

##### T9 Muted-alpha codemod: root components, lint to error, 3-tier grey ladder

- Findings: F-17-02 (P1) · ~150 lines (adjusted from 420) · wave 3 · depends on: T6, T7, T8
- Files: remaining matches under `components/*.tsx` and `routes/`; `oxlint-plugin-t3code` severity to error; DNA-C4 text
- Before: `home-default-{dark,light}-1440x900.png`, `settings-general-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`, `usage-default-{dark,light}-1440x900.png` · After: `screens/T9/` same names
- Accept: Neutral text uses three tiers only (primary, secondary, quiet = secondary at 11 px); lint rule is `error`; DNA-C4 text amended.
- Tests: `vp test run apps/web/src/components/ChatMarkdown.browser.test.tsx` · `vp lint apps/web/src/components/ChatMarkdown.tsx apps/web/src/components/sidebar/SidebarThreadRow.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: low - dense metadata gets louder (dark sidebar and diagnostics most) · upstream: yes, after #24865 merges · #24865: rebase after merge: ChatMarkdown.tsx, SidebarThreadRow.tsx

##### T10 Status colours as text: use `*-foreground`, not the base token

- Findings: F-03-10, F-04-41, F-05-22, F-05-26, F-08-05, F-09-28 · ~170 lines · wave 1 · depends on: #24865
- Files: `components/chat/ComposerPendingApprovalPanel.tsx`, `components/GitActionsControl.tsx`, `components/PullRequestThreadDialog.tsx`, `components/chat/ComposerPromptLengthValidation.tsx`, `components/pullRequest/pullRequestIcons.tsx`, `components/pullRequest/pullRequestPresentation.tsx` (+2)
- Before: `thread-claude-tools-default-{dark,light}-1440x900.png`, `settings-providers-default-{dark,light}-1440x900.png`, `pull-requests-default-{dark,light}-1440x900.png`; cited `03-approval-pending-light-1440x900.png`, `04-prompt-too-long-after-enter-light-1440x900.png` (+2) · After: `screens/T10/` same names
- Accept: Approval label, prompt-length error, git warnings, PR status, amber icons and provider form errors measure >=4.5:1 light and dark; "closed" has one colour.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts apps/web/src/components/PullRequestThreadDialog.test.ts apps/web/src/components/settings/ProviderInstanceCard.test.ts` · `vp lint apps/web/src/components/chat/ComposerPendingApprovalPanel.tsx apps/web/src/components/GitActionsControl.tsx apps/web/src/components/PullRequestThreadDialog.tsx apps/web/src/components/chat/ComposerPromptLengthValidation.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - none functional · upstream: yes, after #24865 merges · #24865: rebase after merge: GitActionsControl.tsx, settingsLayout.tsx

##### T11 Switch off-state and control borders reach 3:1

- Findings: F-16-10 · ~15 lines · wave 1 · depends on: #24865
- Files: `components/ui/switch.tsx`
- Before: `settings-appearance-default-{dark,light}-1440x900.png`, `settings-general-default-{dark,light}-1440x900.png` · After: `screens/T11/` same names
- Accept: Unchecked Switch track measures >=3:1 against the canvas in light; dark thumb carries the state; blue checked accent unchanged.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/switch.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - blue switch accent untouched (owner call) · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### T12 Focus rings at full `ring-ring` (17 reduced-alpha sites)

- Findings: F-16-08 · ~15 lines · wave 1 · depends on: none
- Files: `components/chat/TimelineMinimap.tsx`, `components/chat/V2LifecycleRow.tsx`, `components/ui/collapsible-section-header.tsx`
- Before: `settings-general-default-{dark,light}-1440x900.png`, `home-default-{dark,light}-1440x900.png` · After: `screens/T12/` same names
- Accept: No `ring-ring/NN` or `ring-primary/25` focus ring remains; keyboard ring measures >=3:1 in dark.
- Tests: `vp test run apps/web/src/components/chat/V2LifecycleRow.logic.test.ts` · `vp lint apps/web/src/components/chat/TimelineMinimap.tsx apps/web/src/components/chat/V2LifecycleRow.tsx apps/web/src/components/ui/collapsible-section-header.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low · upstream: yes, after #24865 merges · #24865: rebase after merge: TimelineMinimap.tsx, collapsible-section-header.tsx

### 13.5 Hierarchy (8 chunks)

Type ladder, headings, grey ladder, list structure and message hierarchy (section 4 rules).

##### H1 One title ladder: settings stragglers and the six non-PR title outliers

- Findings: F-17-01 (P1), F-07-14 · ~120 lines (adjusted from 70) · wave 1 · depends on: #24865
- Files: `components/guest/GuestPage.tsx`, `components/onboarding/FirstRunGate.tsx`, `components/preview/PreviewUnreachable.tsx`, `components/settings/AppearanceSettingsPanel.tsx`, `components/settings/FoldedSettingsSection.tsx`, `components/settings/SettingsPanels.tsx` (+4)
- Before: `settings-appearance-default-{dark,light}-1440x900.png`, `settings-general-default-{dark,light}-1440x900.png`, `welcome-default-{dark,light}-1440x900.png` · After: `screens/H1/` same names
- Accept: Section 16/600, page 24/600 tracking-tight, dialog and empty state 20/600; no group title lighter than its rows; Appearance has one heading style.
- Tests: `vp test run apps/web/src/components/guest/GuestPage.browser.test.tsx apps/web/src/components/settings/SettingsPanels.logic.test.ts` · `vp lint apps/web/src/components/guest/GuestPage.tsx apps/web/src/components/onboarding/FirstRunGate.tsx apps/web/src/components/preview/PreviewUnreachable.tsx apps/web/src/components/settings/AppearanceSettingsPanel.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - visual only · upstream: yes, after #24865 merges · #24865: rebase after merge: AppearanceSettingsPanel.tsx, SettingsPanels.tsx, settingsLayout.tsx

##### H2 Real headings and a document title per view

- Findings: F-17-03, F-16-17 · ~70 lines · wave 0 · depends on: none
- Files: `components/chat/ChatHeader.tsx`, `components/chat/DraftHeroHeadline.tsx`, `components/chat/DraftHeroProjectHeading.tsx`, `components/guest/GuestPage.tsx`, `components/settings/SettingsBreadcrumb.tsx`, `routes/__root.tsx`
- Before: `home-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`, `settings-general-default-{dark,light}-1440x900.png` · After: `screens/H2/` same names
- Accept: Saved thread title and Settings crumb are `h1`; `document.title` names the thread, Settings page or Usage; axe `page-has-heading-one` passes on 12 surfaces.
- Tests: `vp test run apps/web/src/components/guest/GuestPage.browser.test.tsx` · `vp lint apps/web/src/components/chat/ChatHeader.tsx apps/web/src/components/chat/DraftHeroHeadline.tsx apps/web/src/components/chat/DraftHeroProjectHeading.tsx apps/web/src/components/guest/GuestPage.tsx ...` · `vp run --filter @t3tools/web typecheck` · new: browser test: document.title for thread, settings, usage
- Model: Opus low · risk: low - none visual · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### H3 Content text at 10 px moves to 11 px (`text-2xs`)

- Findings: F-17-04, F-07-37 (P1), F-05-20 · ~125 lines · wave 2 · depends on: T6
- Files: `components/ThreadTerminalDrawer.tsx`, `components/chat/ProviderInstanceIcon.tsx`, `components/diffs/DiffCommentAnnotation.tsx`, `components/settings/ResourceTelemetryDiagnostics.tsx`, `components/ui/kbd.tsx`, `components/usage/UsageLimitsPooled.tsx`
- Before: `settings-diagnostics-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `05-diff-and-review-comment-typed-light-1440x900.png` · After: `screens/H3/` same names
- Accept: No content-bearing 10 px text outside 1-4 character counters; Diagnostics and comment hint measure >=4.5:1; platform glyphs follow `isMacPlatform`.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/components/chat/ProviderInstanceIcon.test.ts apps/web/src/components/settings/ResourceTelemetryDiagnostics.logic.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/components/chat/ProviderInstanceIcon.tsx apps/web/src/components/diffs/DiffCommentAnnotation.tsx apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Visual only · upstream: yes: none of these files is in #24865 · #24865: independent

##### H4 Diff counts: one style, U+2212 minus, no coloured zeros

- Findings: F-17-05, F-05-16, F-05-17, F-03-22 (P3) · ~100 lines · wave 2 · depends on: #24865, T10
- Files: `components/DiffPanel.tsx`, `components/chat/DiffStatLabel.tsx`, `components/GitActionsControl.tsx`, `components/chat/ChangedFilesTree.tsx`, `components/chat/V2ItemInspector.tsx`, `components/pullRequest/pullRequestPresentation.tsx` (+1)
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `thread-codex-edits-default-light-1440x900.png`, `05-diff-and-review-shapes-changes-light-1440x900.png` (+3) · After: `screens/H4/` same names
- Accept: `DiffStatLabel` renders 11/500 mono everywhere; zero counts are neutral; one green and one red; "+20 -0" shows a muted zero.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts` · `vp lint apps/web/src/components/DiffPanel.tsx apps/web/src/components/chat/DiffStatLabel.tsx apps/web/src/components/GitActionsControl.tsx apps/web/src/components/chat/ChangedFilesTree.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - counts get 10% larger in file rows · upstream: yes, after #24865 merges · #24865: rebase after merge: DiffStatLabel.tsx, GitActionsControl.tsx, SidebarThreadRow.tsx

##### H5 One overline style (`text-overline`)

- Findings: F-17-06 · ~55 lines · wave 1 · depends on: none
- Files: `components/usage/UsageProviderChart.tsx`, `index.css`
- Before: `settings-general-default-{dark,light}-1440x900.png`, `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/H5/` same names
- Accept: Seven overline variants collapse to 11/600/0.1em uppercase muted; 13 sites updated.
- Tests: `vp test run apps/web/src/components/usage/UsageProviderChart.test.ts` · `vp lint apps/web/src/components/usage/UsageProviderChart.tsx apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - 10px overlines grow to 11px · upstream: yes, after #24865 merges · #24865: rebase after merge: index.css

##### H6 Dialog title line-height and px-sized text honour Interface font size

- Findings: F-17-08, F-17-09 · ~30 lines · wave 1 · depends on: none
- Files: `components/chat/threadDetailsPanelStyles.ts`, `components/ui/alert-dialog.tsx`, `components/ui/button.tsx`, `components/ui/collapsible-section-header.tsx`, `components/ui/dialog.tsx`, `components/ui/sheet.tsx`
- Before: `command-palette-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `17-dialog-title-leading-light-1440x900.png` · After: `screens/H6/` same names
- Accept: Wrapped dialog and sheet titles use `leading-tight`; details-card rows and four 11 px sites scale with Interface font size.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/threadDetailsPanelStyles.ts apps/web/src/components/ui/alert-dialog.tsx apps/web/src/components/ui/button.tsx apps/web/src/components/ui/collapsible-section-header.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - 5px taller dialog headers · upstream: yes, after #24865 merges · #24865: rebase after merge: threadDetailsPanelStyles.ts, button.tsx, collapsible-section-header.tsx

##### H7 Thread list structure: pinned header, shelf placement, Working shelf

- Findings: F-02-09, F-02-10, F-02-29, F-02-39 (P3), F-02-11 (P3) · ~115 lines · wave 1 · depends on: #24865
- Files: `components/Sidebar.tsx`, `components/sidebar/SidebarDraftBlock.tsx`, `components/ui/collapsible-section-header.tsx`
- Before: `home-default-{dark,light}-1440x900.png`; cited `02-thread-list-top-dark-1440x900.png`, `02-thread-list-working-shelf-collapsed-light-1440x900.png` · After: `screens/H7/` same names
- Accept: Pinned threads carry a header at rest; shelves sit within the first screen or are sticky; a working thread is not hidden in a collapsed shelf; chevrons agree (ADOPT #24438).
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts apps/web/src/components/Sidebar.drag.test.ts` · `vp lint apps/web/src/components/Sidebar.tsx apps/web/src/components/sidebar/SidebarDraftBlock.tsx apps/web/src/components/ui/collapsible-section-header.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `Sidebar.drag.test.ts` untouched (markers keep ids) · upstream: yes, after #24865 merges · #24865: rebase after merge: Sidebar.tsx, collapsible-section-header.tsx
- Note: Includes ADOPT #24438 (chevron direction).

##### H8 Message hierarchy: resting link underline, tables, lists, separators

- Findings: F-03-19, F-03-21 (P3), F-03-26 (P3) · ~110 lines (adjusted from 45) · wave 1 · depends on: #24865
- Files: `index.css`, `components/chat/TimelineUserMessageRow.tsx`
- Before: `thread-claude-markdown-default-{dark,light}-1440x900.png`, `thread-claude-tools-default-{dark,light}-1440x900.png`; cited `03-md-torture-0-light-1440x900.png`, `03-user-message-hover-dark-1440x900.png` (+1) · After: `screens/H8/` same names
- Accept: In-prose links show a dotted underline at rest (>=3:1 vs prose); inline code in headings and tables scales; ordered-list gutter does not clip (ADOPT #23573); markdown rules visible in dark T3 Chat.
- Tests: no existing test beside these files · `vp lint apps/web/src/index.css apps/web/src/components/chat/TimelineUserMessageRow.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - link-heavy answers get busier · upstream: yes, after #24865 merges · #24865: rebase after merge: index.css
- Note: Absorbs ADOPT #23573 and BORROW #24567, #24084, #22367 (same CSS cluster).

### 13.6 Polish-by-area (85 chunks)

Area-specific visual and behavioural fixes that do not belong to a cross-cutting track. One area per prefix (`P-<area>-<n>`); area 22 (performance feel) is `P-22-1` to `P-22-5`.

##### P-01-1 Collapsed sidebar stays collapsed after reload

- Findings: F-01-01 (P1), F-23-04, F-01-07 · ~45 lines · wave 0 · depends on: none
- Files: `components/AppSidebarLayout.tsx`, `components/ui/sidebar.tsx`, `components/ui/sidebarState.ts`
- Before: `home-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `01-app-shell-sidebar-collapsed-light-1440x900.png` · After: `screens/P-01-1/` same names
- Accept: Collapse, reload: `data-sidebar-state="collapsed"`; no `cookieStore` call remains; first-run default stays expanded.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/AppSidebarLayout.tsx apps/web/src/components/ui/sidebar.tsx apps/web/src/components/ui/sidebarState.ts` · `vp run --filter @t3tools/web typecheck` · new: browser test: collapse, rerender, expect collapsed
- Model: Opus low · risk: low - first-run default stays expanded · upstream: yes: triaged-shaped bug fix, one problem; #24191 · #24865: independent

##### P-01-2 Phone-width sidebar sheet: header buttons, colour, width

- Findings: F-01-02 (P1), F-01-16, F-01-21 (P3) · ~45 lines · wave 1 · depends on: none
- Files: `components/AppSidebarLayout.tsx`, `components/ui/sidebar.tsx`, `index.css`
- Before: `home-default-{dark,light}-390x844.png`, `new-thread-default-{dark,light}-390x844.png`; cited `01-app-shell-sidebar-sheet-dark-390x844.png`, `01-app-shell-sidebar-sheet-then-panel-toggle-light-390x844.png` · After: `screens/P-01-2/` same names
- Accept: At 390x844 header panel buttons are hidden while the sheet is open; sheet paints the sidebar colour; sheet width is `100vw - 12px`.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/AppSidebarLayout.tsx apps/web/src/components/ui/sidebar.tsx apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - desktop `wco` titlebar overlay layout is unaffected (rule applies only when `isMobile`) · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: index.css

##### P-01-3 Project filter survives reload for repositories with a remote

- Findings: F-01-04 (P1) · ~55 lines · wave 1 · depends on: none
- Files: `sidebarProjectGrouping.ts`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/P-01-3/` same names
- Accept: Filter stays selected after reload; the saved value is no longer overwritten with null before repository identity resolves.
- Tests: no existing test beside these files · `vp lint apps/web/src/sidebarProjectGrouping.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: readiness gate waits for repository identity
- Model: Opus low · risk: low - wrongly keeping a stale key would show an empty sidebar · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### P-01-4 Closing Settings or Usage returns to the previous view and restores focus

- Findings: F-01-05, F-01-06 · ~70 lines · wave 0 · depends on: none
- Files: `components/AppRouteModal.tsx`, `components/sidebar/mainAppLocation.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/P-01-4/` same names
- Accept: Close and Back pop history; focus returns to the opener; no duplicate history entries.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/AppRouteModal.tsx apps/web/src/components/sidebar/mainAppLocation.ts` · `vp run --filter @t3tools/web typecheck` · new: browser test: close restores focus and history length
- Model: Opus low · risk: low - history.back() while the modal is animating out (AppRouteModal calls close from onOpenChangeComplete, A · upstream: yes: #16542 · #24865: independent

##### P-01-5 Thread details toggle shows its tooltip (ADOPT #22605)

- Findings: F-01-08 · ~15 lines · wave 0 · depends on: none
- Files: `components/chat/PanelLayoutControls.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `01-app-shell-thread-details-popover-light-1024x640.png` · After: `screens/P-01-5/` same names
- Accept: Hover shows the shortcut tooltip on the Thread details toggle.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/PanelLayoutControls.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - popover anchoring uses `threadPanelPopoverAnchorRef` on the header, not the trigger, so anchoring is... · upstream: yes: #11985 is accepted · #24865: independent
- Note: Code from #22605 by `otavio`.

##### P-01-6 Command palette first screen: project rows and default ordering

- Findings: F-01-13, F-01-14 · ~30 lines · wave 1 · depends on: none
- Files: `components/CommandPalette.tsx`, `components/StartTruncatedPath.tsx`, `components/ui/middle-truncate.tsx`
- Before: `command-palette-default-{dark,light}-1440x900.png`; cited `01-app-shell-palette-default-light-1440x900.png`, `01-app-shell-palette-project-rows-light-1440x900.png` · After: `screens/P-01-6/` same names
- Accept: Project rows show the machine label unclipped and truncate paths at the start; threads are visible on the first screen at 1440x900.
- Tests: `vp test run apps/web/src/components/CommandPalette.logic.test.ts` · `vp lint apps/web/src/components/CommandPalette.tsx apps/web/src/components/StartTruncatedPath.tsx apps/web/src/components/ui/middle-truncate.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `CommandPalette.logic.test.ts` asserts group order (`["Actions","Threads"]`) · upstream: no: F-01-13 changes a product default (needs discussion); F-01-14 alone is a clean fix · #24865: rebase after merge: middle-truncate.tsx

##### P-01-7 Project monogram glyphs reach 4.5:1 in light mode

- Findings: F-01-17 · ~55 lines · wave 1 · depends on: #24865
- Files: `components/ProjectMonogram.tsx`, `components/sidebar/SidebarThreadRow.tsx`, `projectIconColors.ts`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/P-01-7/` same names
- Accept: 15 of 18 monogram hues measure >=4.5:1 on their tile in light; dark unchanged.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ProjectMonogram.tsx apps/web/src/components/sidebar/SidebarThreadRow.tsx apps/web/src/projectIconColors.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - #24865 renders sidebar-row icons grayscale at `opacity-60` at rest (`SidebarThreadRow.tsx`), which... · upstream: no: identity change, DNA-K3 territory · #24865: rebase after merge: SidebarThreadRow.tsx

##### P-02-1 Thread row time and status labels keep the age

- Findings: F-02-16, F-02-17, F-02-18 (P3) · ~165 lines · wave 1 · depends on: #24865
- Files: `components/sidebar/SidebarThreadRow.tsx`, `components/Sidebar.logic.ts`, `timestampFormat.ts`
- Before: `home-default-{dark,light}-1440x900.png`; cited `02-thread-list-after-pin-undo-notice-dark-1440x900.png`, `02-thread-list-open-dark-390x844.png` (+2) · After: `screens/P-02-1/` same names
- Accept: Done, Failed, Limited and Woke keep a relative time; snoozed rows state wake direction and absolute time on the hover card; "Waiting N" states its cause and does not tick for plain idle.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/sidebar/SidebarThreadRow.tsx apps/web/src/components/Sidebar.logic.ts apps/web/src/timestampFormat.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Status slot `min-w-8` grows by ~28px · upstream: yes, after #24865 merges · #24865: rebase after merge: SidebarThreadRow.tsx
- Note: F-02-18 downgraded to P3 by the follow-up sweep; fold stays.

##### P-02-2 Thread row polish: bulk menu parity, search highlight, pin glyph, fills

- Findings: F-02-13, F-02-20, F-02-23, F-02-12 · ~140 lines · wave 1 · depends on: #24865
- Files: `components/sidebar/SidebarThreadRow.tsx`, `components/LegacySidebar.tsx`, `components/Sidebar.logic.ts`, `components/Sidebar.tsx`, `components/ThreadSearchMatch.tsx`
- Before: `home-default-{dark,light}-1440x900.png`; cited `02-thread-list-search-results-dark-1440x900.png`, `02-thread-list-keyboard-focus-light-1440x900.png` (+2) · After: `screens/P-02-2/` same names
- Accept: Bulk menu offers Pin, Archive, Un-settle, Wake; search results highlight the match and show the project; pin glyph is a 24 px target at >=4.5:1; selected, active and hover fills are distinct.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/sidebar/SidebarThreadRow.tsx apps/web/src/components/LegacySidebar.tsx apps/web/src/components/Sidebar.logic.ts apps/web/src/components/Sidebar.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `Sidebar.logic.test.ts` covers builders · upstream: yes, after #24865 merges · #24865: rebase after merge: SidebarThreadRow.tsx, Sidebar.tsx

##### P-02-3 Custom snooze uses the same clock format as the presets

- Findings: F-02-26, F-02-37 (P3) · ~70 lines · wave 0 · depends on: none
- Files: `components/CustomSnoozeDialog.tsx`, `timestampFormat.ts`
- Before: `home-default-{dark,light}-1440x900.png`; cited `02-thread-list-custom-snooze-dialog-dark-1440x900.png` · After: `screens/P-02-3/` same names
- Accept: Custom snooze time field follows the 12/24 h preference used by the presets; relative time gains a unit above days.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/CustomSnoozeDialog.tsx apps/web/src/timestampFormat.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Native `type="time"` follows OS locale · upstream: yes: file untouched by #24865; matches an open issue · #24865: independent

##### P-02-4 Archive page: open, search, count, bulk, Delete without a context menu

- Findings: F-02-27 · ~160 lines · wave 0 · depends on: none
- Files: `components/settings/ArchivedThreadsPanel.tsx`
- Before: `settings-archived-default-{dark,light}-1440x900.png` · After: `screens/P-02-4/` same names
- Accept: Archive rows open, a search field and count exist, Delete is reachable by button and keyboard.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/ArchivedThreadsPanel.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Opening an archived thread depends on server support · upstream: yes: file untouched by #24865 · #24865: independent

##### P-03-1 Opening a long thread lands at the end

- Findings: F-03-01 (P1) · ~55 lines · wave 1 · depends on: none
- Files: `components/chat/MessagesTimeline.tsx`
- Before: `thread-long-conversation-default-{dark,light}-1440x900.png`; cited `03-long-opened-end-light-1440x900.png`, `03-long-scrolled-bottom-light-1440x900.png` · After: `screens/P-03-1/` same names
- Accept: On open the last answer is fully above the composer (dom gap <= 8 px); "Scroll to end" uses the same predicate.
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts apps/web/src/components/chat/timelineScrollAnchoring.test.tsx apps/web/src/components/chat/useTimelinePositionRestore.test.ts` · `vp lint apps/web/src/components/chat/MessagesTimeline.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: single domGap predicate
- Model: Opus low · risk: low - LegendList anchoring and position restore · upstream: yes, after #24865 merges · #24865: rebase after merge: MessagesTimeline.tsx

##### P-03-2 A user scroll-up during a running turn is not reverted

- Findings: F-03-02 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `components/chat/useTimelineFollow.ts`
- Before: `thread-long-conversation-default-{dark,light}-1440x900.png`; cited `03-stream-scrolled-up-light-1440x900.png` · After: `screens/P-03-2/` same names + short .webm of the timing
- Accept: With a streaming turn, wheel-up releases live-follow in the same frame and stays released (16 ms wheel sampler shows no snap-back).
- Tests: `vp test run apps/web/src/components/chat/timelineScrollAnchoring.test.tsx apps/web/src/components/chat/timelineScrollTarget.test.ts` · `vp lint apps/web/src/components/chat/useTimelineFollow.ts` · `vp run --filter @t3tools/web typecheck` · new: browser test: wheel releases follow synchronously
- Model: Opus medium · risk: high - anchoring of the just-sent turn (anchoredEndSpace), disclosure pinning... · upstream: yes: the headline open bug; focused · #24865: independent
- Note: Follow-up sweep: handlers already cancel follow; fix = `flushSync` plus cancelling the in-flight smooth scroll.

##### P-03-3 Pending and collapsed command rows show the command; tool rows are selectable and copyable

- Findings: F-03-09, F-03-16 · ~110 lines · wave 1 · depends on: #24865
- Files: `components/chat/TimelineWorkEntryRow.tsx`, `components/chat/V2ItemInspector.tsx`
- Before: `thread-claude-tools-default-{dark,light}-1440x900.png`; cited `03-approval-pending-light-1440x900.png` · After: `screens/P-03-3/` same names
- Accept: Pending command row shows the command, not the shell wrapper; collapsed tool rows are selectable and expose Copy.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/TimelineWorkEntryRow.tsx apps/web/src/components/chat/V2ItemInspector.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - label helpers have tests in client-runtime · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge (see audit: same files or its tokens)

##### P-03-4 Timeline bits: inline code chip, copy-button focus, timestamps, strip

- Findings: F-03-20, F-03-12, F-03-24, F-03-32 · ~100 lines · wave 1 · depends on: #24865
- Files: `components/ChatMarkdown.tsx`, `components/ChatView.tsx`, `components/chat/MessageCopyButton.tsx`, `components/chat/TimelineRowParts.tsx`, `index.css`, `pkg:shared/src/markdownLinks.ts`
- Before: `thread-claude-markdown-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `03-md-torture-0-light-1440x900.png`, `03-md-light-390x844.png` (+3) · After: `screens/P-03-4/` same names
- Accept: Inline code like `I/W217:220` stays code; message copy keeps focus; turn-fold and tool-row timestamps are reachable without hover; no content shows through the 20 px strip.
- Tests: `vp test run apps/web/src/components/ChatMarkdown.browser.test.tsx apps/web/src/components/ChatView.logic.test.ts packages/shared/src/markdownLinks.test.ts` · `vp lint apps/web/src/components/ChatMarkdown.tsx apps/web/src/components/ChatView.tsx apps/web/src/components/chat/MessageCopyButton.tsx apps/web/src/components/chat/TimelineRowParts.tsx ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/shared typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `markdownLinks` unit tests · upstream: yes, after #24865 merges; bundle: 4 carve-out PRs possible · #24865: rebase after merge: ChatMarkdown.tsx, index.css

##### P-04-1 File chips: visible remove control and 24 px target

- Findings: F-04-05 · ~55 lines · wave 0 · depends on: none
- Files: `components/ContextChip.tsx`, `components/chat/UserMessageContextChips.tsx`, `components/contextChipParts.tsx`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `04-attach-chips-zoom-light-1440x900@2x.png`, `04-attach-chip-hover-light-1440x900@2x.png` (+1) · After: `screens/P-04-1/` same names
- Accept: Attached chips show a remove control at rest and meet the 24 px fine-pointer floor.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ContextChip.tsx apps/web/src/components/chat/UserMessageContextChips.tsx apps/web/src/components/contextChipParts.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Chip is also used in message history (`UserMessageContextChips.tsx`) · upstream: yes: small, fix-shaped; `contextChipParts.tsx` is not in the #24865 diff · #24865: independent

##### P-04-2 Tab in a numbered list renumbers the nested item

- Findings: F-04-08, F-04-09 (P3) · ~110 lines · wave 1 · depends on: #24865
- Files: `composer-list-continuation.ts`, `composer-undo-grouping.ts`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `04-edit-numbered-list-tab-light-1440x900.png` · After: `screens/P-04-2/` same names
- Accept: Tab nests and restarts numbering (#17124); a typed dash before a line becomes a bullet (#22989).
- Tests: `vp test run apps/web/src/composer-list-continuation.test.ts apps/web/src/composer-undo-grouping.test.ts apps/web/src/composer-list-split.browser.test.ts apps/web/src/composer-rich-text.test.ts` · `vp lint apps/web/src/composer-list-continuation.ts apps/web/src/composer-undo-grouping.ts` · `vp run --filter @t3tools/web typecheck` · new: editor test: tab in ordered list
- Model: Opus low · risk: low - `composer-list-continuation.test.ts`, `composer-list-split.browser.test.ts`, `composer-rich-text.test.ts` · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### P-04-3 `@` popup: no false "No matching files" and exact folder matches rank first

- Findings: F-04-11, F-04-12 · ~215 lines · wave 1 · depends on: none
- Files: `components/chat/useComposerMenuItems.ts`, `apps/web/package.json`, `components/chat/ComposerCommandMenu.tsx`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `04-menu-mention-bare-codex-light-1440x900.png`, `04-menu-mention-bare-explicit-light-1440x900.png` (+2) · After: `screens/P-04-3/` same names
- Accept: A bare `@` shows a prompt state, not "No matching"; exact folder name ranks above threads and unrelated files.
- Tests: `vp test run apps/web/src/components/chat/ComposerCommandMenu.test.tsx apps/web/src/components/chat/composerMenuHighlight.test.ts` · `vp lint apps/web/src/components/chat/useComposerMenuItems.ts apps/web/src/components/chat/ComposerCommandMenu.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: mention ranking
- Model: Opus medium · risk: med - `useComposerMenuItems` tests · upstream: yes, after #24865 merges · #24865: rebase after merge: package.json

##### P-04-4 Running-turn controls: Stop and Interrupt agree, follow-up mode legible, Send matches Enter

- Findings: F-04-15, F-04-16, F-04-17 · ~125 lines · wave 1 · depends on: #24865
- Files: `components/chat/ComposerPrimaryActions.tsx`, `pkg:contracts/src/settings.ts`, `pkg:shared/src/keybindings.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `04-stop-button-zoom-light-1440x900@2x.png`, `04-running-typed-steer-light-1440x900.png` (+1) · After: `screens/P-04-4/` same names
- Accept: Stop tooltip, name and docs say one word and show a shortcut; armed follow-up action has a text label; Send enables for thread-context-only drafts (ADOPT #23166).
- Tests: `vp test run packages/contracts/src/settings.test.ts` · `vp lint apps/web/src/components/chat/ComposerPrimaryActions.tsx packages/contracts/src/settings.ts packages/shared/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/contracts typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Browser tests that query `getByLabel("Stop generation")` (grep before changing) · upstream: yes, after #24865 merges · #24865: rebase after merge: ComposerPrimaryActions.tsx, settings.ts
- Note: Absorbs ADOPT #23166 and #22436 (platform modifier in tooltip).

##### P-04-5 Composer menus: selected option marked, provider rail scroll cue, combobox input width

- Findings: F-04-25, F-04-30 · ~110 lines · wave 1 · depends on: #24865
- Files: `components/chat/CompactComposerControlsMenu.tsx`, `components/chat/ModelPickerContent.tsx`, `components/chat/ModelPickerSidebar.tsx`, `components/chat/TraitsPicker.tsx`, `components/ui/menu.tsx`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `04-effort-menu-light-1440x900.png`, `04-mobile-overflow-menu-light-390x460.png` (+1) · After: `screens/P-04-5/` same names
- Accept: Effort, access and mode menus mark the selected option with an indicator (ADOPT-pattern #23893); provider rail shows a scroll cue; search input fills its popup (ADOPT #24312).
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/CompactComposerControlsMenu.tsx apps/web/src/components/chat/ModelPickerContent.tsx apps/web/src/components/chat/ModelPickerSidebar.tsx apps/web/src/components/chat/TraitsPicker.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Menu min widths (`min-w-64` on the permission items) · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: TraitsPicker.tsx, menu.tsx
- Note: Absorbs BORROW #23280 (empty Favorites tab).

##### P-04-6 Multi-model selection is discoverable and explains the worktree lock

- Findings: F-04-33, F-04-34 · ~110 lines · wave 1 · depends on: #24865
- Files: `components/BranchToolbarEnvModeSelector.tsx`, `components/chat/ModelListRow.tsx`, `components/chat/ProviderModelPicker.tsx`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `04-model-picker-after-shiftclick-light-1440x900.png`, `04-model-multi-trigger-light-1440x900.png` · After: `screens/P-04-6/` same names
- Accept: Model picker states shift-click multi-select; choosing two models says why the workspace becomes "New worktree".
- Tests: no existing test beside these files · `vp lint apps/web/src/components/BranchToolbarEnvModeSelector.tsx apps/web/src/components/chat/ModelListRow.tsx apps/web/src/components/chat/ProviderModelPicker.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Popup height budget (346px) · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### P-04-7 Resting controls strip is opaque over the timeline

- Findings: F-04-37 · ~15 lines · wave 1 · depends on: #24865
- Files: `components/chat/ComposerBanner.tsx`, `components/chat/ComposerSurface.tsx`, `index.css`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `04-composer-resting-zoom-light-1440x900@2x.png`, `04-composer-resting-zoom-dark-1440x900@2x.png` · After: `screens/P-04-7/` same names
- Accept: Timeline text no longer shows through the resting strip at 1440x900 and 800x600.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/ComposerBanner.tsx apps/web/src/components/chat/ComposerSurface.tsx apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Glass recipe consistency with attached banners (`ComposerBanner.tsx:58`) · upstream: yes, after #24865 merges · #24865: rebase after merge: ComposerSurface.tsx, index.css

##### P-05-1 Diff: files loaded late honour the fold default; jumping stays contiguous

- Findings: F-05-01 (P1), F-05-09 · ~215 lines · wave 0 · depends on: none
- Files: `components/DiffPanel.tsx`, `lib/diffRendering.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `05-diff-and-review-fold-default-leak-light-1440x900.png`, `05-diff-and-review-reveal-index-light-1440x900.png` (+2) · After: `screens/P-05-1/` same names
- Accept: With "Collapsed by default", late-loading files open collapsed; jump-to-file keeps the list order with no pop-in above.
- Tests: `vp test run apps/web/src/lib/diffRendering.test.ts` · `vp lint apps/web/src/components/DiffPanel.tsx apps/web/src/lib/diffRendering.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: fold key for late files
- Model: Opus medium · risk: med - `useCodeViewFileReveal` and draft-comment survival (`AnnotatableCodeView.tsx` matches pending files by... · upstream: yes: fix-shaped, one helper · #24865: independent

##### P-05-2 Diff totals agree; commit dialog counts untracked work

- Findings: F-05-08, F-05-23 · ~110 lines · wave 1 · depends on: none
- Files: `components/GitActionsControl.tsx`, `components/chat/DiffStatLabel.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `05-diff-and-review-details-card-light-1440x900.png`, `05-diff-and-review-commit-dialog-light-1440x900.png` · After: `screens/P-05-2/` same names
- Accept: The "Changes" total reads the same in card, panel and dialog; untracked files show a real count, folders expand.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts` · `vp lint apps/web/src/components/GitActionsControl.tsx apps/web/src/components/chat/DiffStatLabel.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `DiffStatLabel` is a K12 do-not-touch component for its look · upstream: yes, after #24865 merges · #24865: rebase after merge: GitActionsControl.tsx, DiffStatLabel.tsx

##### P-05-3 Diff toolbar toggles: tooltip, pressed state, scope menu indicator, word wrap

- Findings: F-05-14, F-05-15 · ~70 lines · wave 0 · depends on: none
- Files: `components/DiffPanel.tsx`, `components/files/AttachmentFilePreview.tsx`, `components/files/FilePreviewPanel.tsx`, `components/ui/toggle.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `05-diff-and-review-toolbar-light-1440x900@2x.png` · After: `screens/P-05-3/` same names
- Accept: Layout toggles have tooltips and a visible pressed state; scope menu marks the active choice (ADOPT #23893); word wrap persistence is consistent.
- Tests: `vp test run apps/web/src/components/files/FilePreviewPanel.test.ts` · `vp lint apps/web/src/components/DiffPanel.tsx apps/web/src/components/files/AttachmentFilePreview.tsx apps/web/src/components/files/FilePreviewPanel.tsx apps/web/src/components/ui/toggle.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `toggle.tsx` is shared (K10): QA every `Toggle variant="ghost"` (FileSurfaceAction, PR toolbar, composer) · upstream: yes: pressed state; bundle: 2 carve-out PRs possible · #24865: independent

##### P-05-4 Light-mode diff syntax colours reach 4.5:1

- Findings: F-05-18 · ~160 lines · wave 0 · depends on: none
- Files: `components/DiffWorkerPoolProvider.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `05-diff-and-review-reveal-index-light-1440x900.png` · After: `screens/P-05-4/` same names
- Accept: Added/removed rows with syntax colours measure >=4.5:1 in light via `registerCustomTheme`.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/DiffWorkerPoolProvider.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - worker pool theme names are a Schema.Literals(["pierre-light","pierre-dark"]) in... · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### P-05-5 Pull request creation shows an editable preview

- Findings: F-05-25 · ~420 lines · wave 2 · depends on: T10
- Files: `components/GitActionsControl.tsx`, `pkg:contracts/src/git.ts`
- Before: `pull-requests-default-{dark,light}-1440x900.png` · After: `screens/P-05-5/` same names
- Accept: Creating a PR opens a preview with title, body and draft toggle; one click no longer publishes a generated PR.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts packages/contracts/src/git.test.ts` · `vp lint apps/web/src/components/GitActionsControl.tsx packages/contracts/src/git.ts` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/contracts typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - changes a core flow · upstream: no: feature, needs a design discussion first · #24865: rebase after merge: GitActionsControl.tsx
- Note: Feature-shaped: needs maintainer approval before any upstream PR.

##### P-06-1 Terminal chrome: toolbar no longer covers output; scrollbar visible and themed

- Findings: F-06-01 (P1), F-06-16 · ~215 lines · wave 1 · depends on: none
- Files: `components/ThreadTerminalDrawer.tsx`, `index.css`, `terminal/ghostty/surface.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-06-1/` same names
- Accept: Toolbar sits outside the output area at >=24 px with labels on hover; scrollbar is visible and "latest output" cue exists (#19536).
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/terminal/ghostty/surface.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/index.css apps/web/src/terminal/ghostty/surface.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - PTY rows shrink by 28 px (resize path covered by `surface.test.ts`) · upstream: yes, after #24865 merges · #24865: rebase after merge: index.css

##### P-06-2 Terminal list: compact rows, all terminals visible

- Findings: F-06-02 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `components/ThreadTerminalDrawer.tsx`, `terminalUiStateStore.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-06-2/` same names
- Accept: The terminal list becomes horizontal tabs in the header (scroll chevrons, active tab scrolled into view); a group chip shows only for groups with more than one pane.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/terminalUiStateStore.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/terminalUiStateStore.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - persisted group model unchanged (`terminalUiStateStore.ts`) · upstream: no: layout change; needs maintainer buy-in · #24865: independent

##### P-06-3 Selection popover dismisses on Esc and Cmd+C

- Findings: F-06-03 (P1) · ~55 lines · wave 0 · depends on: none
- Files: `contextMenuFallback.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-06-3/` same names + short .webm of the timing
- Accept: Drag-select shows the popover; Esc and Cmd+C dismiss it.
- Tests: `vp test run apps/web/src/contextMenuFallback.test.ts` · `vp lint apps/web/src/contextMenuFallback.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - shared fallback menu used by thread and tab menus (area 12/16) · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### P-06-4 ANSI palette follows the theme and passes contrast

- Findings: F-06-04 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `components/ThreadTerminalDrawer.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-06-4/` same names
- Accept: All 16 ANSI colours measure >=4.5:1 on the terminal background in default and the five named themes (ADOPT #24042 for PASS/FAIL badge text).
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - users who tuned programs to the VS Code palette see shifts · upstream: yes: palette values only · #24865: independent
- Note: Code from #24042 by `WesleySmits`.

##### P-06-5 Browser panel: reopen closed tab, refresh label, invalid address, action labels

- Findings: F-06-14, F-06-17, F-06-18, F-06-21 · ~100 lines · wave 0 · depends on: none
- Files: `components/preview/PreviewView.tsx`, `components/ReopenClosedViewShortcut.tsx`, `components/ThreadTerminalDrawer.tsx`, `components/chat/useChatTerminalActions.ts`, `components/preview/PreviewChromeRow.tsx`, `components/settings/KeybindingsSettings.logic.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-06-5/` same names
- Accept: Closed-tab reopen is visible; the loading button says "Stop" only when it stops; invalid input shows an error; terminal action labels are sentence case.
- Tests: `vp test run apps/web/src/components/preview/PreviewView.browser.test.tsx apps/web/src/components/ReopenClosedViewShortcut.browser.test.tsx apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/components/settings/KeybindingsSettings.logic.test.ts` · `vp lint apps/web/src/components/preview/PreviewView.tsx apps/web/src/components/ReopenClosedViewShortcut.tsx apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/components/chat/useChatTerminalActions.ts ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - closed-view history is per device · upstream: yes: fix-shaped, no #24865 overlap; bundle: 4 carve-out PRs possible · #24865: independent

##### P-06-6 Floating preview controls and cross-client sessions

- Findings: F-06-19, F-06-20 · ~110 lines · wave 0 · depends on: none
- Files: `components/preview/ThreadPreviewMiniPlayer.tsx`, `previewMiniPlayerStore.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-06-6/` same names
- Accept: Preview controls are reachable without a 12 px dot; sessions started elsewhere show a cue on reconnect.
- Tests: `vp test run apps/web/src/previewMiniPlayerStore.test.ts apps/web/src/components/preview/previewMiniPlayerLayout.test.ts` · `vp lint apps/web/src/components/preview/ThreadPreviewMiniPlayer.tsx apps/web/src/previewMiniPlayerStore.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `previewMiniPlayerLayout.test.ts` encodes frame geometry · upstream: no: new persistent-preview behaviour and a cross-client cue; maintainer direction first · #24865: independent

##### P-07-1 Esc closes the theme editor or inspector, not Settings

- Findings: F-07-01 (P1), F-07-02 · ~30 lines · wave 0 · depends on: none
- Files: `components/settings/ThemeEditorPanel.tsx`, `components/settings/TypographySettings.tsx`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/P-07-1/` same names
- Accept: Esc during Inspect cancels the inspector only; Esc inside the editor closes the editor; second Esc closes Settings.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/ThemeEditorPanel.tsx apps/web/src/components/settings/TypographySettings.tsx` · `vp run --filter @t3tools/web typecheck` · new: browser test: Esc stack in Settings
- Model: Opus low · risk: low - No test covers `ThemeEditorPanel` · upstream: yes: ThemeEditorPanel.tsx is not touched by #24865 · #24865: independent

##### P-07-2 Theme import: JSONC parses and errors name the field

- Findings: F-07-30 (P1), F-12-21, F-07-34 (P3), F-07-35 (P3) · ~180 lines · wave 0 · depends on: none
- Files: `components/settings/ThemeImportDialog.tsx`, `components/settings/ThemeEditorPanel.tsx`, `components/settings/ThemeSearchSection.tsx`, `vscodeThemeImport.ts`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/P-07-2/` same names
- Accept: Ordinary VS Code theme files (comments, trailing commas) import; failures read "what failed then why" below the field.
- Tests: `vp test run apps/web/src/vscodeThemeImport.test.ts apps/web/src/openVsxThemes.test.ts` · `vp lint apps/web/src/components/settings/ThemeImportDialog.tsx apps/web/src/components/settings/ThemeEditorPanel.tsx apps/web/src/components/settings/ThemeSearchSection.tsx apps/web/src/vscodeThemeImport.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: JSONC theme import
- Model: Opus medium · risk: med - `vscodeThemeImport.test.ts` and `openVsxThemes.test.ts` exist · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### P-07-3 Theme grid: sections, readable names, no single-column collapse

- Findings: F-07-15, F-07-19, F-07-20 · ~230 lines · wave 1 · depends on: #24865
- Files: `components/settings/ThemeSettings.tsx`, `components/settings/ThemePreviewCircles.tsx`
- Before: `settings-appearance-default-{dark,light}-{1440x900,800x600}.png` · After: `screens/P-07-3/` same names
- Accept: Built-in, published and custom themes sit in labelled sections; names truncate in the middle with a tooltip; 800x600 shows two columns.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/ThemeSettings.tsx apps/web/src/components/settings/ThemePreviewCircles.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Custom-theme cards with 4 action buttons are the tightest case (F-07-20) · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### P-07-4 Theme editor flows: popover glass, alpha kept, inspect from Settings, Open VSX preview

- Findings: F-07-32, F-07-33 · ~110 lines · wave 1 · depends on: #24865
- Files: `components/settings/themeEditorStore.ts`, `components/sidebar/mainAppLocation.ts`, `index.css`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/P-07-4/` same names
- Accept: Colour popover keeps glass (ADOPT #22348); typed hex keeps alpha (ADOPT #23136); Inspect works from Settings; Open VSX rows show a palette and select after install.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/themeEditorStore.ts apps/web/src/components/sidebar/mainAppLocation.ts apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Closing Settings clears the Settings scroll/search state · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: index.css
- Note: Absorbs ADOPT #22348, #23136.

##### P-07-5 Appearance small fixes: default card accent, font not found, Diagnostics sampling text

- Findings: F-07-18, F-07-28, F-07-38 · ~125 lines · wave 1 · depends on: #24865
- Files: `components/settings/ResourceTelemetryDiagnostics.tsx`, `components/settings/ThemeEditorPanel.tsx`, `components/settings/TypographySettings.tsx`, `pkg:shared/src/themePreview.ts`
- Before: `settings-appearance-default-{dark,light}-1440x900.png`, `settings-diagnostics-default-{dark,light}-1440x900.png` · After: `screens/P-07-5/` same names
- Accept: T3 Code default card uses the app accent; an unknown font family is reported, not discarded; Diagnostics never says "Sampling every 0 ms" beside a green dot.
- Tests: `vp test run apps/web/src/components/settings/ResourceTelemetryDiagnostics.logic.test.ts` · `vp lint apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx apps/web/src/components/settings/ThemeEditorPanel.tsx apps/web/src/components/settings/TypographySettings.tsx packages/shared/src/themePreview.ts` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/shared typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `themeBoot.test.ts` asserts splash vs palettes · upstream: yes, after #24865 merges; bundle: 3 carve-out PRs possible · #24865: rebase after merge (see audit: same files or its tokens)
- Note: Absorbs ADOPT #22795 (font picker scroll).

##### P-08-1 Scope sentence tells the truth on every settings page

- Findings: F-07-08, F-09-17 (P1), F-08-02, F-08-03, F-08-04 · ~235 lines · wave 1 · depends on: #24865
- Files: `components/settings/settingsLayout.tsx`, `components/chat/runtimeModeConfig.ts`, `components/settings/BranchNamingSettings.tsx`, `components/settings/ProviderInstanceCard.tsx`, `components/settings/SettingsPanels.tsx`, `components/settings/SettingsScopeSentence.tsx` (+2)
- Before: `settings-general-default-{dark,light}-1440x900.png`, `settings-providers-default-{dark,light}-1440x900.png`, `settings-projects-default-{dark,light}-1440x900.png`; cited `09-project-claude-off-dark-1440x900.png` · After: `screens/P-08-1/` same names
- Accept: Pages that ignore scope drop the sentence; project scope shows which rows apply; read-only rows state why; device-only rows carry a marker; layers popover uses labels, not enum values.
- Tests: `vp test run apps/web/src/components/settings/ProviderInstanceCard.test.ts apps/web/src/components/settings/SettingsPanels.logic.test.ts apps/web/src/components/settings/SettingInheritance.test.ts` · `vp lint apps/web/src/components/settings/settingsLayout.tsx apps/web/src/components/chat/runtimeModeConfig.ts apps/web/src/components/settings/BranchNamingSettings.tsx apps/web/src/components/settings/ProviderInstanceCard.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - none functionally · upstream: yes, after #24865 merges · #24865: rebase after merge: settingsLayout.tsx, SettingsPanels.tsx, SettingsScopeSentence.tsx
- Note: Absorbs BORROW #20003 (sticky scope pickers).

##### P-08-2 Keybinding pills render like the rest of the app

- Findings: F-08-23, F-08-26, F-08-27 · ~85 lines · wave 0 · depends on: none
- Files: `components/settings/KeybindingsSettings.tsx`, `keybindings.ts`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/P-08-2/` same names
- Accept: Tab moves focus instead of recording; "Preview: Zoom In" shows the plus key; pills reuse `formatShortcutLabel`.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/keybindings.test.ts` · `vp lint apps/web/src/components/settings/KeybindingsSettings.tsx apps/web/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Users who want a bare Tab binding lose it (it is a poor default) · upstream: yes: fix-shaped, no #24865 overlap; bundle: 3 carve-out PRs possible · #24865: independent

##### P-08-3 Keybinding recorder shows readable keys and discards dirty rows

- Findings: F-08-28 · ~160 lines · wave 1 · depends on: none
- Files: `components/settings/SettingsScopeSentence.tsx`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/P-08-3/` same names
- Accept: Recording shows glyphs, not tokens; a dirty row can be discarded; command select shows labels, not ids.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts` · `vp lint apps/web/src/components/settings/SettingsScopeSentence.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `useKeybindingRowEditor` state is per row · upstream: yes, after #24865 merges · #24865: rebase after merge: SettingsScopeSentence.tsx

##### P-08-4 Keybinding conflicts are visible and resolvable

- Findings: F-08-29 · ~160 lines · wave 0 · depends on: none
- Files: `components/settings/KeybindingsSettings.logic.ts`, `components/settings/KeybindingsSettings.tsx`, `keybindings.ts`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/P-08-4/` same names
- Accept: A conflicting row shows an inline notice naming the other command with an action; not tooltip-only.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/keybindings.test.ts` · `vp lint apps/web/src/components/settings/KeybindingsSettings.logic.ts apps/web/src/components/settings/KeybindingsSettings.tsx apps/web/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - The warning appears on every row of a conflicting pair · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### P-08-5 Keybindings list: search matches shown text, bindable commands, groups, density

- Findings: F-08-24, F-08-25, F-08-31, F-08-32, F-08-33 · ~380 lines · wave 0 · depends on: none
- Files: `components/settings/KeybindingsSettings.logic.ts`, `pkg:shared/src/keybindings.ts`, `pkg:contracts/src/keybindings.ts`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/P-08-5/` same names
- Accept: Search matches what the row shows; commands without a default have a row (unbind via `when: "false"`); groups fit; rows are denser; when-vocabulary matches docs.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts packages/contracts/src/keybindings.test.ts` · `vp lint apps/web/src/components/settings/KeybindingsSettings.logic.ts packages/shared/src/keybindings.ts packages/contracts/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/shared typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - `KeybindingsSettings.logic.test.ts` has filter tests · upstream: yes: fix-shaped, no #24865 overlap (split first: over 300 lines); bundle: 4 carve-out PRs possible · #24865: independent

##### P-08-6 Keybindings save to one environment by default

- Findings: F-08-07 · ~160 lines · wave 1 · depends on: none
- Files: `components/settings/KeybindingsSettings.tsx`, `components/settings/SettingsScopeSentence.tsx`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/P-08-6/` same names
- Accept: Project picker is removed or scoped; saves go to the selected environment only.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts` · `vp lint apps/web/src/components/settings/KeybindingsSettings.tsx apps/web/src/components/settings/SettingsScopeSentence.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Multi-environment users lose the implicit "set everywhere" behaviour · upstream: yes, after #24865 merges · #24865: rebase after merge: SettingsScopeSentence.tsx

##### P-08-7 Project page: location, scratch entry, monogram validation

- Findings: F-08-13, F-08-14, F-08-15 · ~165 lines · wave 0 · depends on: none
- Files: `components/ProjectMonogram.tsx`, `components/settings/KeybindingsSettings.tsx`, `sidebarProjectGrouping.ts`
- Before: `settings-projects-default-{dark,light}-1440x900.png` · After: `screens/P-08-7/` same names
- Accept: Project page shows its path; the "No project" entry has no Remove; a 3-letter monogram is rejected inline, not by a failed mutation.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/projectIconOptions.test.ts` · `vp lint apps/web/src/components/ProjectMonogram.tsx apps/web/src/components/settings/KeybindingsSettings.tsx apps/web/src/sidebarProjectGrouping.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Remote environments cannot open local editors · upstream: yes: fix-shaped, no #24865 overlap; bundle: 3 carve-out PRs possible · #24865: independent

##### P-08-8 Project actions: visible edit, import menu width, shortcut field, invalid t3.json

- Findings: F-08-18, F-08-19, F-08-20, F-08-21 · ~220 lines · wave 0 · depends on: none
- Files: `components/projectScriptEditor.tsx`, `components/settings/KeybindingsSettings.logic.ts`, `components/settings/ProjectActionsSettings.tsx`, `components/settings/ProjectSettingsPanel.tsx`, `components/ui/alert.tsx`, `keybindings.ts`
- Before: `settings-projects-default-{dark,light}-1440x900.png` · After: `screens/P-08-8/` same names
- Accept: Action rows show edit at rest and on touch (ADOPT #23640); import menu is capped with Import all; shortcut field shows glyphs and warns on conflict; invalid t3.json shows an error row.
- Tests: `vp test run apps/web/src/components/projectScriptEditor.browser.test.tsx apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/components/settings/ProjectSettingsPanel.browser.test.tsx apps/web/src/components/settings/ProjectSettingsPanel.logic.test.ts` · `vp lint apps/web/src/components/projectScriptEditor.tsx apps/web/src/components/settings/KeybindingsSettings.logic.ts apps/web/src/components/settings/ProjectActionsSettings.tsx apps/web/src/components/settings/ProjectSettingsPanel.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Row click must not fire when the user selects text in the command · upstream: yes: fix-shaped, no #24865 overlap; bundle: 4 carve-out PRs possible · #24865: independent
- Note: Absorbs ADOPT #23640.

##### P-08-9 Scheduled tasks list: project, workspace, readable status, weekday contrast

- Findings: F-08-43, F-08-44 · ~110 lines · wave 0 · depends on: none
- Files: `components/settings/ScheduledTasksSettings.tsx`, `components/ui/toggle-group.tsx`
- Before: `settings-scheduled-tasks-default-{dark,light}-1440x900.png` · After: `screens/P-08-9/` same names
- Accept: Task rows show project and workspace and a human run status; selected weekdays differ from unselected by >=3:1.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/ScheduledTasksSettings.tsx apps/web/src/components/ui/toggle-group.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Long project names · upstream: yes: fix-shaped, no #24865 overlap; bundle: 2 carve-out PRs possible · #24865: independent

##### P-09-1 Re-auth command signs in the right account for a custom config directory

- Findings: F-09-09 (P1) · ~55 lines · wave 0 · depends on: none
- Files: (audit names no file; locate from the finding Evidence)
- Before: `settings-providers-default-{dark,light}-1440x900.png`; cited `09-providers-second-claude-added-light-1440x900.png`, `09-thread-claude-logged-out-light-1440x900.png` · After: `screens/P-09-1/` same names
- Accept: With `CLAUDE_CONFIG_DIR` set, the shown command includes it; the status sentence matches.
- Tests: no existing test beside these files · new: logic test: command includes CLAUDE_CONFIG_DIR
- Model: Opus low · risk: low - shell quoting for paths with spaces · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### P-09-2 Provider rows: status sentence, checking state, Update available, Update all, Checked ago

- Findings: F-09-10, F-09-12, F-09-13, F-09-14, F-13-19 · ~155 lines · wave 0 · depends on: none
- Files: `components/settings/ProviderInstanceCard.tsx`, `components/settings/ProviderSettingsPanel.tsx`
- Before: `settings-providers-default-{dark,light}-1440x900.png`; cited `09-providers-antigravity-detail-light-1440x900.png`, `09-providers-muse-code-detail-light-1440x900.png` (+2) · After: `screens/P-09-2/` same names
- Accept: Status sentence sits under the name, not in the Display name row; "checking" is neutral; Update available is a labelled control; Update all is labelled with its scope; "Checked N ago" survives phone widths.
- Tests: `vp test run apps/web/src/components/settings/ProviderInstanceCard.test.ts apps/web/src/components/settings/ProviderSettingsPanel.logic.test.ts apps/web/src/components/settings/ProviderSettingsPanel.environment.browser.test.tsx apps/web/src/components/settings/providerStatus.test.ts` · `vp lint apps/web/src/components/settings/ProviderInstanceCard.tsx apps/web/src/components/settings/ProviderSettingsPanel.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `ProviderSettingsPanel.environment.browser.test.tsx` may assert the old text location · upstream: yes: fix-shaped, no #24865 overlap; bundle: 5 carve-out PRs possible · #24865: independent

##### P-09-3 Model picker for unavailable providers: Disable all, update link, pane heading

- Findings: F-09-24, F-09-26, F-09-27 · ~190 lines · wave 0 · depends on: none
- Files: `components/chat/ModelPickerContent.tsx`, `components/chat/ModelPickerSidebar.tsx`, `components/settings/ProviderModelsSection.tsx`, `routes/_chat.settings.providers.tsx`, `pkg:client-runtime/src/providerUpdateRequiredModels.ts`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `09-model-picker-cursor-unavailable-dark-1440x900.png` · After: `screens/P-09-3/` same names
- Accept: "Disable all" says it hides models; the update link selects the provider; an unavailable provider pane has a heading and focusable rail.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/ModelPickerContent.tsx apps/web/src/components/chat/ModelPickerSidebar.tsx apps/web/src/components/settings/ProviderModelsSection.tsx apps/web/src/routes/_chat.settings.providers.tsx ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/client-runtime typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - copy only · upstream: yes: fix-shaped, no #24865 overlap; bundle: 2 carve-out PRs possible · #24865: independent
- Note: Follow-up sweep F-09-24: hidden-model gating is also enforced server-side; UI wording only here.

##### P-09-4 Two accounts of one driver are distinguishable

- Findings: F-09-29 · ~160 lines · wave 0 · depends on: none
- Files: `components/usage/UsageLimitsPooled.tsx`
- Before: `settings-providers-default-{dark,light}-1440x900.png`; cited `09-model-picker-two-claude-light-1440x900.png`, `09-thread-claude-logged-out-light-1440x900.png` · After: `screens/P-09-4/` same names
- Accept: Account label is visible at body size on list rows and in the picker.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/usage/UsageLimitsPooled.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - touches `providerInstances.ts` badge logic · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### P-09-5 Limited banner and recovery: readable time, button labels, setting names

- Findings: F-09-38, F-09-39 · ~110 lines · wave 1 · depends on: #24865
- Files: `mobile:src/features/settings/SettingsThreadsRouteScreen.tsx`, `components/settings/SettingsPanels.tsx`, `components/settings/settingsSearch.ts`
- Before: `usage-default-{dark,light}-1440x900.png` · After: `screens/P-09-5/` same names
- Accept: Banner shows a local short time; buttons say "Resume after usage limits"; a scheduled resume shows its time.
- Tests: `vp test run apps/web/src/components/settings/SettingsPanels.logic.test.ts apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/mobile/src/features/settings/SettingsThreadsRouteScreen.tsx apps/web/src/components/settings/SettingsPanels.tsx apps/web/src/components/settings/settingsSearch.ts` · `vp run --filter @t3tools/mobile typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - the banner has no test · upstream: yes, after #24865 merges · #24865: rebase after merge: SettingsThreadsRouteScreen.tsx, SettingsPanels.tsx, settingsSearch.ts

##### P-11-1 Pairing form: distinct token errors, auto-capitalise, focus, no echoed token

- Findings: F-11-02 (P1), F-11-04, F-11-03 (P1), F-11-05, F-11-06 · ~195 lines · wave 0 · depends on: none
- Files: `components/auth/PairingRouteSurface.tsx`, `server:auth/PairingGrantStore.ts`, `components/auth/ConnectAgentSurface.tsx`, `components/cloud/ConnectCliAuthSurface.tsx`, `components/settings/AddEnvironmentDialog.tsx`, `components/ui/standalone-page.tsx` (+1)
- Before: `settings-connections-default-{dark,light}-1440x900.png`; cited `11-pair-invalid-token-light-1440x900.png`, `11-pair-consumed-token-light-1440x900.png` (+4) · After: `screens/P-11-1/` same names
- Accept: Mistyped, consumed and expired tokens each say so; the code field capitalises; focus returns to the field on failure; link tokens are not echoed.
- Tests: `vp test run apps/server/src/auth/PairingGrantStore.test.ts` · `vp lint apps/web/src/components/auth/PairingRouteSurface.tsx apps/server/src/auth/PairingGrantStore.ts apps/web/src/components/auth/ConnectAgentSurface.tsx apps/web/src/components/cloud/ConnectCliAuthSurface.tsx ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter t3 typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - any test asserting the old string (grep `Invalid pairing token`: none found outside `auth.ts`) · upstream: yes: fix-shaped, no #24865 overlap; bundle: 5 carve-out PRs possible · #24865: independent

##### P-11-2 /pair, hosted pairing and guest pages: brand, guidance, one error voice

- Findings: F-11-01, F-11-09, F-11-10 · ~125 lines · wave 0 · depends on: none
- Files: `components/T3Wordmark.tsx`, `components/auth/PairingRouteSurface.tsx`, `components/guest/GuestPage.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `11-bare-origin-light-1440x900.png`, `11-guest-none-light-1440x900.png` (+3) · After: `screens/P-11-2/` same names
- Accept: /pair says how to get a token; hosted page drops "Backend" and CORS jargon; guest pages carry brand and sharer.
- Tests: `vp test run apps/web/src/components/guest/GuestPage.browser.test.tsx` · `vp lint apps/web/src/components/T3Wordmark.tsx apps/web/src/components/auth/PairingRouteSurface.tsx apps/web/src/components/guest/GuestPage.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - string-only plus one import · upstream: yes: copy fix, one component; bundle: 3 carve-out PRs possible · #24865: independent

##### P-11-3 Auth and guest pages join the design system

- Findings: F-11-08, F-11-11 · ~215 lines · wave 2 · depends on: T3, T2
- Files: `components/chat/ComposerSurface.tsx`, `components/ui/menu.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `11-bare-origin-light-1440x900.png`, `11-connect-agent-bare-light-1440x900.png` · After: `screens/P-11-3/` same names
- Accept: No gradients, literal hex or `shadow-2xl` on auth pages; guest composer reuses the 22 px composer recipe.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/ComposerSurface.tsx apps/web/src/components/ui/menu.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `StandalonePage` also renders `RootRouteErrorView` and the not-found view (visual change there) · upstream: no: visual restyle; propose in Ideas first · #24865: rebase after merge: ComposerSurface.tsx, menu.tsx

##### P-11-4 Opening a pairing link in a paired browser asks before revoking

- Findings: F-11-07 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `environments/primary/auth.ts`, `routes/__root.tsx`, `routes/pair.tsx`
- Before: `settings-connections-default-{dark,light}-1440x900.png` · After: `screens/P-11-4/` same names
- Accept: A paired browser shows a confirm step naming the session that will be replaced; no silent revoke.
- Tests: `vp test run apps/web/src/environments/primary/httpLayer.test.ts` · `vp lint apps/web/src/environments/primary/auth.ts apps/web/src/routes/__root.tsx apps/web/src/routes/pair.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: redeem guard on paired session
- Model: Opus medium · risk: med - `authGateState` is read by `__root.tsx` and `routes/pair.tsx` · upstream: yes: focused, fix-shaped; touches auth.ts glue only, no server change · #24865: independent

##### P-11-5 Owner guest dialog and MCP URL discoverability

- Findings: F-11-12, F-11-15 · ~110 lines · wave 1 · depends on: none
- Files: `components/chat/GuestShareControls.tsx`, `components/settings/ConnectionsSettings.tsx`, `components/settings/SavedEnvironmentRows.tsx`, `components/settings/settingsSearch.ts`
- Before: `settings-connections-default-{dark,light}-1440x900.png`; cited `11-primary-env-menu-light-1440x900.png` · After: `screens/P-11-5/` same names
- Accept: Guest dialog keeps the link and expiry visible; "Stop sharing" state is accurate; the MCP URL is discoverable on a single machine (#17216).
- Tests: `vp test run apps/web/src/components/settings/ConnectionsSettings.logic.test.ts apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/web/src/components/chat/GuestShareControls.tsx apps/web/src/components/settings/ConnectionsSettings.tsx apps/web/src/components/settings/SavedEnvironmentRows.tsx apps/web/src/components/settings/settingsSearch.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - no tests cover the dialog (needs the T3 Connect fixture) · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: settingsSearch.ts

##### P-12-1 MCP app approval dialog shows arguments in monospace with indentation

- Findings: F-12-06 (P1) · ~55 lines · wave 0 · depends on: none
- Files: `pkg:contracts/src/ipc.ts`
- Before: `thread-claude-tools-default-{dark,light}-1440x900.png` · After: `screens/P-12-1/` same names
- Accept: Tool arguments render in the mono font with preserved indentation and wrap.
- Tests: no existing test beside these files · `vp lint packages/contracts/src/ipc.ts` · `vp run --filter @t3tools/contracts typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `confirmDialog.test.ts` and `localApi.test.ts` cover the host state machine · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### P-12-2 Slow-request toast and notification settings

- Findings: F-12-20, F-12-22 · ~110 lines · wave 1 · depends on: none
- Files: `components/ThreadNotificationCoordinator.tsx`, `components/settings/NotificationSettings.tsx`, `rpc/requestLatencyState.ts`, `pkg:contracts/src/settings.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/P-12-2/` same names
- Accept: Slow-request toast names the action and offers a next step; sound can be tested; mode names are unambiguous.
- Tests: `vp test run apps/web/src/components/ThreadNotificationCoordinator.logic.test.ts packages/contracts/src/settings.test.ts` · `vp lint apps/web/src/components/ThreadNotificationCoordinator.tsx apps/web/src/components/settings/NotificationSettings.tsx apps/web/src/rpc/requestLatencyState.ts packages/contracts/src/settings.ts` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/contracts typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - no test for the coordinator · upstream: no: the in-app row lives in `SettingsPanels.tsx`; `NotificationSettings.tsx` alone is eligible · #24865: rebase after merge: settings.ts

##### P-13-1 Startup payload: split the 2.47 MB gz entry

- Findings: F-13-09 · ~420 lines · wave 0 · depends on: none
- Files: `components/chat/UserMessageContextChips.tsx`, `components/diffs/StyledDiffCodeView.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png` · After: `screens/P-13-1/` same names
- Accept: Cold-load transferred JS drops materially with no preload regression (measure on a production build, Fast 3G).
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/UserMessageContextChips.tsx apps/web/src/components/diffs/StyledDiffCodeView.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - React Compiler coverage test, route-level lazy loading creating new waterfalls · upstream: yes: fix-shaped, no #24865 overlap (split first: over 300 lines) · #24865: independent
- Note: Perf change: needs a before/after trace, not only screenshots.

##### P-13-2 Command palette results do not re-sort after message search returns

- Findings: F-13-18 · ~160 lines · wave 0 · depends on: none
- Files: `components/CommandPalette.logic.ts`
- Before: `command-palette-default-{dark,light}-1440x900.png` · After: `screens/P-13-2/` same names
- Accept: Result order is stable once shown; message hits append under their own heading.
- Tests: `vp test run apps/web/src/components/CommandPalette.logic.test.ts` · `vp lint apps/web/src/components/CommandPalette.logic.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `CommandPalette.logic.test.ts` ordering tests · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: Follow-up sweep: the premise (two re-sorts) needs a live trace before any code.

##### P-14-1 A closed window stays closed after a backend restart; links reopen it

- Findings: F-14-02 (P1), F-14-04 · ~70 lines · wave 0 · depends on: none
- Files: `desktop:src/app/DesktopClerk.ts`, `desktop:src/app/DesktopWebLinks.ts`, `desktop:src/window/DesktopWindow.ts`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-1/` same names + Electron capture via CDP (:9222)
- Accept: After a backend restart no window is re-created or focused; a link handed to a closed-window app opens the window (#24101).
- Tests: `vp test run apps/desktop/src/app/DesktopClerk.test.ts apps/desktop/src/app/DesktopWebLinks.test.ts apps/desktop/src/window/DesktopWindow.test.ts` · `vp lint apps/desktop/src/app/DesktopClerk.ts apps/desktop/src/app/DesktopWebLinks.ts apps/desktop/src/window/DesktopWindow.ts` · `vp run --filter @t3tools/desktop typecheck` · new: logic test: restart does not create a window
- Model: Opus low · risk: low - `DesktopWindow.test.ts` (1084 lines) has window-creation and backend-ready cases to extend · upstream: yes: focused bug fix for an open issue · #24865: independent

##### P-14-2 Desktop startup shows a window or a clear error

- Findings: F-14-03 (P1), F-14-20 · ~110 lines · wave 0 · depends on: none
- Files: `desktop:src/app/DesktopApp.ts`, `desktop:src/backend/DesktopBackendPool.ts`, `desktop:src/window/DesktopWindow.ts`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-2/` same names + short .webm of the timing, Electron capture via CDP (:9222)
- Accept: A splash shows within 1 s; fatal startup errors read as one short sentence plus a "Show details" disclosure.
- Tests: `vp test run apps/desktop/src/backend/DesktopBackendPool.test.ts apps/desktop/src/window/DesktopWindow.test.ts apps/desktop/src/window/DesktopApplicationMenu.test.ts` · `vp lint apps/desktop/src/app/DesktopApp.ts apps/desktop/src/backend/DesktopBackendPool.ts apps/desktop/src/window/DesktopWindow.ts` · `vp run --filter @t3tools/desktop typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `DesktopWindow.test.ts` mocks the splash · upstream: yes: reliability fix, small; bundle: 2 carve-out PRs possible · #24865: independent

##### P-14-3 Closing the last window on Windows and Linux asks before quitting the backend

- Findings: F-14-01 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `desktop:src/ipc/channels.ts`, `desktop:src/window/DesktopWindow.ts`, `AppRoot.tsx`, `state/threads.ts`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-3/` same names + Electron capture via CDP (:9222)
- Accept: Close shows a confirm naming running threads; macOS behaviour unchanged (#10161).
- Tests: `vp test run apps/desktop/src/window/DesktopWindow.test.ts apps/web/src/state/threads.test.ts` · `vp lint apps/desktop/src/ipc/channels.ts apps/desktop/src/window/DesktopWindow.ts apps/web/src/AppRoot.tsx apps/web/src/state/threads.ts` · `vp run --filter @t3tools/desktop typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - New IPC channel plus contract surface in `packages/contracts/src/ipc.ts` · upstream: no: behaviour change tied to the open #10161 product discussion, needs maintainer approval of direction · #24865: independent
- Note: Product call: needs maintainer decision.

##### P-14-4 Settings modal clears traffic lights and caption buttons; HTML preview clears native controls

- Findings: F-14-05, F-14-06 · ~30 lines · wave 1 · depends on: none
- Files: `components/AppRouteModal.tsx`, `index.css`, `lib/windowControlsOverlay.ts`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-4/` same names + Electron capture via CDP (:9222)
- Accept: Modal header offsets by `--native-titlebar-height` at 840-1023 px and large zoom (BORROW #24581).
- Tests: no existing test beside these files · `vp lint apps/web/src/components/AppRouteModal.tsx apps/web/src/index.css apps/web/src/lib/windowControlsOverlay.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Other users of `AppRouteModal` (Usage) change identically · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: index.css

##### P-14-5 Update flow: errors visible, downgrade stated, labelled affordance, notes on stable

- Findings: F-12-19, F-14-07, F-14-08, F-14-09, F-14-10 · ~275 lines · wave 1 · depends on: none
- Files: `components/desktopUpdate.logic.ts`, `components/sidebar/SidebarUpdatePill.tsx`, `desktop:src/updates/releaseNotes.ts`, `components/desktopUpdate.toast.tsx`, `components/settings/SnapShotSettings.tsx`, `components/settings/settingsLayout.tsx` (+2)
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-5/` same names + Electron capture via CDP (:9222)
- Accept: About shows update errors; switching track states a downgrade; sidebar update control is labelled in the update colour; downloaded toast has an action (BORROW #23956 stray dot).
- Tests: `vp test run apps/web/src/components/desktopUpdate.logic.test.ts apps/desktop/src/updates/releaseNotes.test.ts apps/web/src/components/settings/SnapShotSettings.logic.test.ts apps/web/src/components/sidebar/SidebarProviderUpdatePill.browser.test.tsx` · `vp lint apps/web/src/components/desktopUpdate.logic.ts apps/web/src/components/sidebar/SidebarUpdatePill.tsx apps/desktop/src/updates/releaseNotes.ts apps/web/src/components/desktopUpdate.toast.tsx ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/desktop typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `desktopUpdate.logic` tests · upstream: no: `SidebarUpdatePill.tsx` is shared with area 14; coordinate, the toast file alone is eligible · #24865: rebase after merge: settingsLayout.tsx, index.css

##### P-14-6 Hold-to-quit overlay shows progress and is announced

- Findings: F-14-12, F-14-13 · ~70 lines · wave 1 · depends on: none
- Files: `desktop:src/window/QuitHold.ts`, `components/QuitHoldOverlay.tsx`, `components/chat/OpenInPicker.tsx`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-6/` same names + short .webm of the timing, Electron capture via CDP (:9222)
- Accept: The overlay shows a 1.2 s progress cue and `role="status"` text.
- Tests: `vp test run apps/desktop/src/window/QuitHold.test.ts apps/web/src/components/chat/OpenInPicker.browser.test.tsx` · `vp lint apps/desktop/src/window/QuitHold.ts apps/web/src/components/QuitHoldOverlay.tsx apps/web/src/components/chat/OpenInPicker.tsx` · `vp run --filter @t3tools/desktop typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `QuitHold.test.ts` (163 lines) covers the state machine, none of the overlay · upstream: no: new feedback behaviour; the hold overlay shipped recently and is an owner design · #24865: rebase after merge: OpenInPicker.tsx

##### P-14-7 Native menu: thread, project, panel and navigation commands; Help menu

- Findings: F-14-16, F-14-17 · ~215 lines · wave 0 · depends on: none
- Files: `desktop:src/window/DesktopApplicationMenu.ts`, `components/desktopUpdate.logic.ts`, `routes/_chat.tsx`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-7/` same names + Electron capture via CDP (:9222)
- Accept: Menu exposes the top 10 commands with accelerators; Help has docs, release notes and shortcuts.
- Tests: `vp test run apps/desktop/src/window/DesktopApplicationMenu.test.ts apps/web/src/components/desktopUpdate.logic.test.ts` · `vp lint apps/desktop/src/window/DesktopApplicationMenu.ts apps/web/src/components/desktopUpdate.logic.ts apps/web/src/routes/_chat.tsx` · `vp run --filter @t3tools/desktop typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Duplicate firing if an accelerator is both registered natively and handled by the renderer: the reason... · upstream: no: new feature surface, needs maintainer approval · #24865: independent

##### P-14-8 Windows and Linux menu bar: visible commands in the palette

- Findings: F-14-18 · ~160 lines · wave 1 · depends on: none
- Files: `desktop:src/window/DesktopWindow.ts`, `components/CommandPalette.logic.ts`, `components/settings/settingsSearch.ts`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-8/` same names + Electron capture via CDP (:9222)
- Accept: Auto-hidden menu bar users reach the same actions from the palette.
- Tests: `vp test run apps/desktop/src/window/DesktopWindow.test.ts apps/web/src/components/CommandPalette.logic.test.ts apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/desktop/src/window/DesktopWindow.ts apps/web/src/components/CommandPalette.logic.ts apps/web/src/components/settings/settingsSearch.ts` · `vp run --filter @t3tools/desktop typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - New bridge method (contract change in `packages/contracts/src/ipc.ts`) · upstream: no: changes menu-bar visibility on Windows and Linux; maintainer call · #24865: rebase after merge: settingsSearch.ts

##### P-14-9 Desktop small fixes: SnapShot GNOME text, Open-in default editor

- Findings: F-14-23, F-14-26 · ~70 lines · wave 1 · depends on: none
- Files: `components/settings/SnapShotSettings.tsx`, `components/settings/SnapShotSetupDialog.tsx`, `components/ui/menu.tsx`, `editorLabels.ts`, `pkg:contracts/src/keybindings.ts`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-9/` same names + Electron capture via CDP (:9222)
- Accept: GNOME instruction names a real action; Open-in menu marks the default editor.
- Tests: `vp test run apps/web/src/components/settings/SnapShotSettings.logic.test.ts apps/web/src/components/settings/SnapShotSetupDialog.logic.test.ts packages/contracts/src/keybindings.test.ts` · `vp lint apps/web/src/components/settings/SnapShotSettings.tsx apps/web/src/components/settings/SnapShotSetupDialog.tsx apps/web/src/components/ui/menu.tsx apps/web/src/editorLabels.ts ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/contracts typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Linux GNOME only · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: menu.tsx
- Note: Absorbs BORROW #23141 (in-app browser closes host menus).

##### P-21-1 Keyboard shortcuts palette action and `?` help

- Findings: F-21-01 (P1) · ~160 lines · wave 1 · depends on: none
- Files: `components/CommandPalette.tsx`, `components/chat/useChatShortcuts.ts`, `components/settings/settingsSearch.ts`
- Before: `command-palette-default-{dark,light}-1440x900.png` · After: `screens/P-21-1/` same names
- Accept: "Keyboard shortcuts" opens the keybindings page from the palette; `?` with nothing focused no longer types into the composer.
- Tests: `vp test run apps/web/src/components/CommandPalette.logic.test.ts apps/web/src/components/chat/useChatShortcuts.browser.test.tsx apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/web/src/components/CommandPalette.tsx apps/web/src/components/chat/useChatShortcuts.ts apps/web/src/components/settings/settingsSearch.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - new id goes into `STATIC_KEYBINDING_COMMANDS` (contracts) and `DEFAULT_KEYBINDINGS` (shared) · upstream: no: the `?` command needs maintainer approval; part (1), the palette action alone, is yes · #24865: rebase after merge: settingsSearch.ts
- Note: Part (1) palette action alone is upstream-eligible.

##### P-21-2 Visible palette entry and shortcut tooltips on the sidebar footer

- Findings: F-21-02, F-01-15 · ~30 lines · wave 1 · depends on: none
- Files: `desktop:src/window/DesktopApplicationMenu.ts`, `components/LegacySidebar.tsx`, `components/Sidebar.tsx`, `components/sidebar/SidebarChrome.tsx`, `components/sidebar/SidebarThreadHeader.tsx`, `pkg:shared/src/keybindings.ts`
- Before: `home-default-{dark,light}-1440x900.png`; cited `21-new-thread-tooltip-web-dark-1440x900.png` · After: `screens/P-21-2/` same names
- Accept: Sidebar offers a visible palette control; footer tooltips show bound chords including Settings on web.
- Tests: `vp test run apps/desktop/src/window/DesktopApplicationMenu.test.ts apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/desktop/src/window/DesktopApplicationMenu.ts apps/web/src/components/LegacySidebar.tsx apps/web/src/components/Sidebar.tsx apps/web/src/components/sidebar/SidebarChrome.tsx ...` · `vp run --filter @t3tools/desktop typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - field width at the 22rem sidebar minimum · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: Sidebar.tsx

##### P-21-3 Palette lists searchable commands for bound chords

- Findings: F-21-03 · ~160 lines · wave 0 · depends on: none
- Files: `components/CommandPalette.tsx`
- Before: `command-palette-default-{dark,light}-1440x900.png`; cited `21-palette-empty-query-dark-1440x900.png` · After: `screens/P-21-3/` same names
- Accept: ">sidebar", ">terminal", ">diff", ">settle", ">model" return rows.
- Tests: `vp test run apps/web/src/components/CommandPalette.logic.test.ts` · `vp lint apps/web/src/components/CommandPalette.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - handlers live in mounted ChatView hooks · upstream: no: new palette surface · #24865: independent

##### P-21-4 One shortcut hint renderer; context menu shows its shortcuts

- Findings: F-21-04, F-02-22 · ~215 lines · wave 1 · depends on: #24865
- Files: `components/ui/tooltip.tsx`, `contextMenuFallback.ts`
- Before: `home-default-{dark,light}-1440x900.png`, `command-palette-default-{dark,light}-1440x900.png`; cited `21-new-thread-tooltip-web-dark-1440x900.png`, `02-thread-list-settle-tooltip-dark-1440x900.png` · After: `screens/P-21-4/` same names
- Accept: Tooltips, menus, palette and aria-labels share one renderer; `ContextMenuItem` gains `shortcut`; chords are not baked into aria-labels.
- Tests: `vp test run apps/web/src/contextMenuFallback.test.ts` · `vp lint apps/web/src/components/ui/tooltip.tsx apps/web/src/contextMenuFallback.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - tests that query tooltip text containing "(⌘J)" (`ChatView.browser.test.tsx`, palette tests) · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### P-21-5 Web stops advertising browser-reserved chords

- Findings: F-21-05, F-06-05 (P1) · ~215 lines · wave 0 · depends on: none
- Files: `components/ThreadTerminalDrawer.tsx`, `components/settings/KeybindingsSettings.tsx`, `keybindings.ts`, `pkg:shared/src/keybindings.ts`
- Before: `home-default-{dark,light}-1440x900.png`; cited `21-palette-empty-query-dark-1440x900.png` · After: `screens/P-21-5/` same names
- Accept: Web hints and bindings omit Cmd+N, W, T, Shift+T on browsers that swallow them; desktop unchanged.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/keybindings.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/components/settings/KeybindingsSettings.tsx apps/web/src/keybindings.ts packages/shared/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/shared typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `keybindings.json` migration for "late defaults" (`apps/server/src/keybindings.ts` is server · upstream: no: new defaults · #24865: independent

##### P-21-6 Thread previous/next and jumps work below 768 px; web jump docs

- Findings: F-21-07, F-21-06 · ~110 lines · wave 0 · depends on: none
- Files: `keybindings.ts`, `routes/_chat.tsx`, `pkg:shared/src/keybindings.ts`
- Before: `home-default-{dark,light}-390x844.png` · After: `screens/P-21-6/` same names
- Accept: At 390x844 thread prev/next works with the sheet closed; docs scope the iPad-only section.
- Tests: `vp test run apps/web/src/keybindings.test.ts` · `vp lint apps/web/src/keybindings.ts apps/web/src/routes/_chat.tsx packages/shared/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/shared typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `orderedThreadKeys` is built inside `Sidebar` today (filters, shelves, collapsed groups) · upstream: no: new defaults · #24865: independent

##### P-21-7 Windows and Linux terminal keeps Ctrl+W, D, N, B

- Findings: F-21-08 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `keybindings.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-21-7/` same names
- Accept: Terminal receives Ctrl+W/D/N/B; app chords use alternates there.
- Tests: `vp test run apps/web/src/keybindings.test.ts` · `vp lint apps/web/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - `isMac` and the setting are new contract fields · upstream: no: changes terminal defaults; maintainer call · #24865: independent
- Note: Keymap change: needs maintainer approval.

##### P-21-8 OS and layout chord hijacks: German "+", usage chords, desktop browser tab chords

- Findings: F-21-10, F-21-12, F-21-13 · ~125 lines · wave 0 · depends on: none
- Files: `keybindings.ts`, `components/files/BrowserDocumentFrame.tsx`, `components/usage/UsagePage.tsx`, `components/usage/usageShortcuts.ts`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/P-21-8/` same names + Electron capture via CDP (:9222)
- Accept: Ctrl/Cmd + "+" zooms on German layouts; usage period chords avoid OS screenshot hotkeys; browser tab forwards the four plus documented chords. F-21-13 is P1 if the Cmd+Q probe reproduces.
- Tests: `vp test run apps/web/src/keybindings.test.ts` · `vp lint apps/web/src/keybindings.ts apps/web/src/components/files/BrowserDocumentFrame.tsx apps/web/src/components/usage/UsagePage.tsx apps/web/src/components/usage/usageShortcuts.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `keybindings.test.ts` physical-fallback cases · upstream: yes: #15954 is the same family; bundle: 3 carve-out PRs possible · #24865: independent
- Note: F-21-13 severity P2 -> P1 pending the live probe.

##### P-21-9 Escape follows one rule

- Findings: F-21-14 · ~55 lines · wave 0 · depends on: none
- Files: (audit names no file; locate from the finding Evidence)
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/P-21-9/` same names
- Accept: Modals return focus to the opener; right panel Esc closes the panel; documented in the keybindings docs.
- Tests: no existing test beside these files · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `finalFocus` was disabled on purpose to avoid a focus ring on the opener (comment at... · upstream: no: focus behaviour change · #24865: independent

##### P-21-10 Send key is stated and labelled (ADOPT #22436)

- Findings: F-21-15 · ~55 lines · wave 1 · depends on: #24865
- Files: `composer-logic.ts`
- Before: `new-thread-default-{dark,light}-1440x900.png` · After: `screens/P-21-10/` same names
- Accept: Composer states which key sends; Send setting labels are unambiguous; tooltip shows the platform modifier.
- Tests: `vp test run apps/web/src/composer-logic.test.ts` · `vp lint apps/web/src/composer-logic.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - send-button tooltip tests · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)
- Note: Code from #22436 by `UtkarshUsername`.

##### P-22-1 Perf budget for the 1 MB message: bench and long-task gate

- Findings: F-22-01 (P1) · ~90 lines (adjusted from 160) · wave 2 · depends on: E-6
- Files: `performance.bench.ts`
- Before: `thread-huge-output-default-{dark,light}-1440x900.png` · After: `screens/P-22-1/` same names
- Accept: After E-6, "Load earlier turns" on the 1 MB fixture shows no single long task over 200 ms at prod 1x (600 ms at 4x) and under 15,000 nodes until expanded, enforced by `performance.bench.ts`; until E-6, the divider button is disabled and shows `Spinner size="sm"` while loading.
- Tests: no existing test beside these files · `vp lint apps/web/src/performance.bench.ts` · `vp run --filter @t3tools/web typecheck` · new: bench: long-task and node budgets on the 1 MB fixture
- Model: Opus low · risk: low - find-in-thread, citations, copy (see F-03-04) · upstream: no: `ChatMarkdown.tsx` is a #24865 file (audit); the bench file alone is eligible after E-6 · #24865: independent
- Note: Same fix as F-03-04 (carried by E-6); this chunk is the budget and the bench. Measured prod 1x: 851 ms to rows, 3 long tasks totalling 1.65-1.74 s, nodes 4,136 to 103,370.

##### P-22-2 Thread switch paints header and composer before the timeline

- Findings: F-22-02 · ~55 lines · wave 1 · depends on: none
- Files: `components/ChatView.tsx`, `components/Sidebar.tsx`
- Before: `home-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-22-2/` same names
- Accept: At prod 4x CPU, click event duration <= 100 ms and header update <= 120 ms for every thread switch (prod 1x unchanged); the previous timeline stays dimmed or the F-13-08 skeleton shows until the new one commits; the 400 ms `useDelayedStatus` banner stays.
- Tests: `vp test run apps/web/src/components/ChatView.logic.test.ts apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/ChatView.tsx apps/web/src/components/Sidebar.tsx` · `vp run --filter @t3tools/web typecheck` · new: browser test: header and composer paint before the timeline commits
- Model: Opus low · risk: low - stale-timeline flash between highlight and commit (pair with F-13-08 skeleton) · upstream: yes, after #24865 merges · #24865: rebase after merge: Sidebar.tsx
- Note: Measured prod 4x: click event 280 ms, long task 248 ms, header at 237 ms. Pairs with S-29 (timeline skeleton).

##### P-22-3 Visited threads no longer leave a detached timeline in memory

- Findings: F-22-03 · ~55 lines · wave 1 · depends on: none
- Files: `components/chat/MessagesTimeline.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-22-3/` same names
- Accept: After 30 distinct threads (`detached.mjs --switches 30`): at most 2 detached `data-assistant-citation-viewport` roots, heap growth <= 4 MB, listener growth <= 100.
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts` · `vp lint apps/web/src/components/chat/MessagesTimeline.tsx` · `vp run --filter @t3tools/web typecheck` · new: browser test: mount and unmount the timeline 5 times, a WeakRef to the viewport is collected
- Model: Opus low · risk: low - any "remember scroll position" feature that relies on the retained element · upstream: yes, after #24865 merges · #24865: rebase after merge: MessagesTimeline.tsx
- Note: Locate the retainer first with a heap snapshot filtered to Detached. Measured: heap 64 to 77 MB, listeners 2,438 to 3,116 after 30 threads.

##### P-22-4 Theme switch without forced style flushes

- Findings: F-22-04 · ~55 lines · wave 1 · depends on: none
- Files: `hooks/useTheme.ts`, `index.css`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/P-22-4/` same names
- Accept: At most 2 style recalcs per switch, long task <= 40 ms at prod 1x and <= 120 ms at 4x, `getAnimations()` still 0 (DNA-M8), `meta theme-color` still matches the surface.
- Tests: `vp test run apps/web/src/themeBoot.test.ts` · `vp lint apps/web/src/hooks/useTheme.ts apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · new: logic test: browser chrome colour taken from the palette just applied
- Model: Opus low · risk: low - browser chrome colour (`meta theme-color`) must still match the surface · upstream: yes, after #24865 merges · #24865: rebase after merge: index.css
- Note: Measured prod 1x: long task 71-87 ms in 5-6 style recalcs; `syncBrowserChromeTheme` reads `getComputedStyle` right after the class toggle.

##### P-22-5 Command palette typing: memoised rows, thread items capped at 50

- Findings: F-22-05 · ~160 lines · wave 0 · depends on: none
- Files: `components/CommandPaletteResults.tsx`
- Before: `command-palette-default-{dark,light}-1440x900.png` · After: `screens/P-22-5/` same names
- Accept: <= 8 ms main thread per key at prod 1x and <= 35 ms at 4x with the 142-thread fixture; key-to-paint p95 <= 50 ms at 4x; ordering unchanged.
- Tests: `vp test run apps/web/src/components/CommandPalette.logic.test.ts` · `vp lint apps/web/src/components/CommandPaletteResults.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: item building memoised per (deferred query, source identity)
- Model: Opus medium · risk: med - `CommandPalette.logic.test.ts` ordering tests · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: Measured prod 1x: 16.8-19.5 ms per key; 4x: 69-74 ms. Pairs with P-13-2 (ordering).

### 13.7 States (33 chunks)

Loading, empty, error, confirm, offline and "lying UI" states (truthful state, reversible actions).

##### S-1 Toast stack: errors never collapse; 5 s default replaced by a policy

- Findings: F-12-01 (P1), F-12-02 (P1) · ~110 lines · wave 0 · depends on: none
- Files: `components/ui/toast.tsx`, `components/ui/toast.logic.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`, `settings-general-default-{dark,light}-1440x900.png` · After: `screens/S-1/` same names + short .webm of the timing
- Accept: Error, warning and actionable toasts never collapse behind the stack; one pure `applyToastDefaults` policy sets timeouts by tone and message length; timers pause on hover, focus and blur.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/toast.tsx apps/web/src/components/ui/toast.logic.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: toast.logic stack and timer policy
- Model: Opus low · risk: low - there is no unit test for `ui/toast.logic.ts` today · upstream: yes: fix-shaped, files untouched by #24865 · #24865: independent

##### S-2 Confirm dialog contract: named verb, consequence-matched variant, no "?" title split

- Findings: F-12-08, F-12-09, F-12-10 · ~230 lines · wave 2 · depends on: T4
- Files: `components/Sidebar.tsx`, `components/chat/useTimelineRewind.ts`, `components/settings/ScheduledTasksSettings.tsx`, `components/ui/alert-dialog.tsx`, `hooks/useThreadActionMenu.ts`, `hooks/useThreadActions.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/S-2/` same names
- Accept: "Confirm" is gone from the 36 call sites by contract (a `confirmLabel` is required); destructive variant follows consequence; one-line messages do not become 20 px titles.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts apps/web/src/hooks/useThreadActionMenu.test.ts apps/web/src/hooks/useThreadActions.test.ts apps/web/src/components/ServerUpdateAction.browser.test.tsx` · `vp lint apps/web/src/components/Sidebar.tsx apps/web/src/components/chat/useTimelineRewind.ts apps/web/src/components/settings/ScheduledTasksSettings.tsx apps/web/src/components/ui/alert-dialog.tsx ...` · `vp run --filter @t3tools/web typecheck` · new: type-level: confirmLabel required; unit test for title split
- Model: Opus medium · risk: med - `confirmDialog.test.ts`, `localApi.test.ts`, `ServerUpdateAction.browser.test.tsx` and thread action... · upstream: yes, after #24865 merges · #24865: rebase after merge: Sidebar.tsx
- Note: Follow-up sweep F-12-10: flipping two `?? true` defaults carries the variant change.

##### S-3 Undo notice: hover/focus pause, names the thread, 44 px target, 12 px text

- Findings: F-12-05 (P1), F-02-14 · ~110 lines · wave 1 · depends on: S-1, #24865
- Files: `components/sidebar/SidebarThreadUndoNotice.tsx`, `components/ui/alert.tsx`, `components/ui/kbd.tsx`, `components/ui/toast.tsx`, `hooks/showThreadUndoNotice.ts`
- Before: `home-default-{dark,light}-1440x900.png`; cited `02-thread-list-undo-notice-dark-1440x900.png` · After: `screens/S-3/` same names + short .webm of the timing
- Accept: Undo notice names the thread, pauses on hover and focus, is >= 24 px tall (44 on touch) and uses the 12 px label size.
- Tests: `vp test run apps/web/src/components/sidebar/SidebarThreadUndoNotice.browser.test.tsx apps/web/src/hooks/showThreadUndoNotice.test.ts apps/web/src/hooks/useThreadActions.undo.test.ts` · `vp lint apps/web/src/components/sidebar/SidebarThreadUndoNotice.tsx apps/web/src/components/ui/alert.tsx apps/web/src/components/ui/kbd.tsx apps/web/src/components/ui/toast.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - hooks/showThreadUndoNotice.test.ts, hooks/useThreadActions.undo.test.ts, sidebar/SidebarThreadUndoNotice · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### S-4 Clipboard failures are visible (Copy code and table over HTTP)

- Findings: F-03-11 (P1), F-12-24 · ~70 lines · wave 0 · depends on: none
- Files: `components/ui/toast.tsx`, `hooks/useCopyToClipboard.ts`
- Before: `thread-claude-markdown-default-{dark,light}-1440x900.png`; cited `03-copy-no-clipboard-api-light-1440x900.png` · After: `screens/S-4/` same names
- Accept: Copy code and Copy table work or fail loudly with an error toast without `navigator.clipboard` (HTTP over LAN); anchored failure toast uses error tone (BORROW #23679).
- Tests: `vp test run apps/web/src/hooks/useCopyToClipboard.test.ts` · `vp lint apps/web/src/components/ui/toast.tsx apps/web/src/hooks/useCopyToClipboard.ts` · `vp run --filter @t3tools/web typecheck` · new: browser test: copy without Clipboard API
- Model: Opus low · risk: low - `ChatMarkdown.browser.test.tsx` · upstream: yes: small, fix-shaped; `MarkdownCodeBlock.tsx` and `MarkdownTable.tsx` are untouched by #24865 · #24865: independent

##### S-5 Working state is truthful: no ticking timer while waiting for approval

- Findings: F-03-08 (P1) · ~100 lines (adjusted from 55) · wave 1 · depends on: none
- Files: `components/chat/MessagesTimeline.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `03-approval-pending-dark-1440x900.png` · After: `screens/S-5/` same names + short .webm of the timing
- Accept: While approval or input is pending the row reads "Waiting for approval" with no timer or shimmer; state during session start is shown (BORROW #23590).
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts apps/web/src/components/chat/MessagesTimeline.active-tools.test.ts` · `vp lint apps/web/src/components/chat/MessagesTimeline.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: work-log label for waiting states
- Model: Opus low · risk: low - `MessagesTimeline.active-tools.test.ts`, `MessagesTimeline.browser.test.tsx` · upstream: yes, after #24865 merges · #24865: rebase after merge: MessagesTimeline.tsx

##### S-6 Error boundaries: per-row and per-outlet

- Findings: F-12-07 (P1), F-03-30, F-12-27 (P3) · ~230 lines · wave 1 · depends on: none
- Files: `components/ChatMarkdown.tsx`, `components/chat/MarkdownMath.tsx`, `components/chat/MarkdownMermaidCodeBlock.tsx`, `routes/__root.tsx`, `routes/_chat.$environmentId.$threadId.tsx`, `routes/_chat.pull-requests.tsx` (+1)
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/S-6/` same names
- Accept: A throwing timeline row shows an inline error; a render error keeps the shell and navigation; the error is logged.
- Tests: `vp test run apps/web/src/components/ChatMarkdown.browser.test.tsx` · `vp lint apps/web/src/components/ChatMarkdown.tsx apps/web/src/components/chat/MarkdownMath.tsx apps/web/src/components/chat/MarkdownMermaidCodeBlock.tsx apps/web/src/routes/__root.tsx ...` · `vp run --filter @t3tools/web typecheck` · new: browser test: throwing row does not blank the app
- Model: Opus medium · risk: high - TanStack Router error boundaries reset on navigation by default · upstream: yes, after #24865 merges · #24865: rebase after merge: ChatMarkdown.tsx

##### S-7 Composer issues render as a banner above the composer

- Findings: F-12-03 (P1) · ~160 lines · wave 1 · depends on: #24865
- Files: `components/chat/useComposerAttachmentIntake.ts`
- Before: `new-thread-default-{dark,light}-1440x900.png` · After: `screens/S-7/` same names
- Accept: Attachment and send failures list all issues in a `ComposerBanner` attached to the composer (DNA-P6); the thread-level banner stays for thread errors.
- Tests: `vp test run apps/web/src/components/chat/ThreadErrorBanner.test.tsx` · `vp lint apps/web/src/components/chat/useComposerAttachmentIntake.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `chat/ThreadErrorBanner.test.tsx` and composer send tests assume attachment errors land in `threadError` · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)
- Note: Absorbs BORROW #22236, #22974, #24684, #24773.

##### S-8 Toast coverage and currency: dismissed on open, limited icon, merge-back errors

- Findings: F-12-14, F-12-15 · ~110 lines · wave 1 · depends on: S-1
- Files: `components/Sidebar.logic.ts`, `components/ThreadNotificationCoordinator.tsx`, `components/ui/toast.logic.ts`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/S-8/` same names
- Accept: Opening a thread dismisses its toasts (#20883); usage-limit toast shows the Limited icon (#24253); merge-back and disconnect failures toast.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts apps/web/src/components/ThreadNotificationCoordinator.logic.test.ts apps/web/src/components/ThreadNotificationCoordinator.badge.browser.test.tsx` · `vp lint apps/web/src/components/Sidebar.logic.ts apps/web/src/components/ThreadNotificationCoordinator.tsx apps/web/src/components/ui/toast.logic.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `ThreadNotificationCoordinator.logic.test.ts` covers the gate only · upstream: yes, after #24865 merges · #24865: independent
- Note: BORROW #24313, #24260, #23753.

##### S-9 Provider-unavailable errors name the provider and the cause

- Findings: F-09-19 (P1), F-09-21 (P1), F-20-01 (P1) · ~125 lines · wave 1 · depends on: none
- Files: `server:orchestration-v2/ThreadManagementService.ts`, `server:ws.ts`, `pkg:contracts/src/settings.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `09-thread-grok-not-installed-light-1440x900.png` · After: `screens/S-9/` same names
- Accept: No project UUID or session id in the message; error says which provider and why (not installed, signed out, disabled for project); BORROW #24147 wording.
- Tests: `vp test run apps/server/src/orchestration-v2/ThreadManagementService.test.ts apps/server/src/ws.test.ts packages/contracts/src/settings.test.ts apps/server/src/orchestration-v2/ThreadLaunchService.test.ts` · `vp lint apps/server/src/orchestration-v2/ThreadManagementService.ts apps/server/src/ws.ts packages/contracts/src/settings.ts` · `vp run --filter t3 typecheck` ; `vp run --filter @t3tools/contracts typecheck` · new: logic test: error mapping for missing instance
- Model: Opus low · risk: low - `ThreadLaunchService.test.ts:1419,2233` and `ProviderContinuationService.test.ts` assert the existing tag · upstream: yes, after #24865 merges · #24865: rebase after merge: settings.ts

##### S-10 Provider status banner: specific title, no overlap, an action

- Findings: F-09-22, F-12-35 (P3) · ~215 lines · wave 0 · depends on: none
- Files: `components/settings/ExpandableText.tsx`, `lib/observeResize.ts`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `09-thread-grok-not-installed-light-1440x900.png`, `09-thread-claude-logged-out-light-1440x900.png` · After: `screens/S-10/` same names
- Accept: Banner title names the provider and state; it never overlaps the first timeline row; every provider gets a next action.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/ExpandableText.tsx apps/web/src/lib/observeResize.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - banner lane layout is shared with `ThreadErrorBanner` · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-11 Bad saved client setting recovers instead of locking the app

- Findings: F-07-13 (P1) · ~160 lines · wave 1 · depends on: none
- Files: `desktop:src/settings/DesktopClientSettings.ts`, `components/onboarding/FirstRunGate.tsx`, `pkg:contracts/src/settings.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/S-11/` same names
- Accept: One out-of-range value drops that key to default with a notice and a "Reset settings" action; the app loads.
- Tests: `vp test run apps/desktop/src/settings/DesktopClientSettings.test.ts packages/contracts/src/settings.test.ts` · `vp lint apps/desktop/src/settings/DesktopClientSettings.ts apps/web/src/components/onboarding/FirstRunGate.tsx packages/contracts/src/settings.ts` · `vp run --filter @t3tools/desktop typecheck` ; `vp run --filter @t3tools/web typecheck` · new: logic test: schema decode per key with fallback
- Model: Opus medium · risk: high - Never reset silently · upstream: yes, after #24865 merges · #24865: rebase after merge: settings.ts

##### S-12 Keybinding config errors: short message, no repeated success toast

- Findings: F-08-34, F-12-18 · ~110 lines · wave 0 · depends on: none
- Files: `components/KeybindingsUpdateToast.logic.ts`, `routes/__root.tsx`, `server:keybindings.ts`, `components/KeybindingsConfigWarning.tsx`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/S-12/` same names
- Accept: A bad entry names the key and line; no 1,900-character dump; "Keybindings updated" fires only on external reloads.
- Tests: `vp test run apps/server/src/keybindings.test.ts` · `vp lint apps/web/src/components/KeybindingsUpdateToast.logic.ts apps/web/src/routes/__root.tsx apps/server/src/keybindings.ts apps/web/src/components/KeybindingsConfigWarning.tsx` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter t3 typecheck` · new: logic test: keybinding parse error message
- Model: Opus low · risk: low - `KeybindingsUpdateToast.logic.test.ts` asserts the message passthrough · upstream: yes: UI part · #24865: independent
- Note: Follow-up sweep: F-12-18 also needs the server to skip unchanged content on reload (server dependency).

##### S-13 Link to a deleted or unknown thread says so

- Findings: F-03-31, F-10-17 · ~30 lines · wave 0 · depends on: none
- Files: `components/ThreadRouteView.tsx`
- Before: `home-default-{dark,light}-1440x900.png`; cited `03-thread-missing-light-1440x900.png`, `10-first-run-and-empty-states-thread-not-found-light-1440x900.png` (+1) · After: `screens/S-13/` same names
- Accept: The route shows "Thread not found" with a way back; no silent draft in an unrelated project.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ThreadRouteView.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: unknown thread route
- Model: Opus low · risk: low - duplicate toasts on re-render (guard with a ref keyed by thread key) · upstream: yes: area 12 owns toast style; this is the call site · #24865: independent

##### S-14 Thinking row clears when text starts streaming

- Findings: F-03-14 · ~55 lines · wave 0 · depends on: none
- Files: `components/chat/MessagesTimeline.logic.ts`, `components/chat/TimelineWorkGroupRows.tsx`
- Before: `thread-claude-markdown-default-{dark,light}-1440x900.png`; cited `03-stream-text-with-thinking-row-light-1440x900.png` · After: `screens/S-14/` same names
- Accept: The Thinking row disappears once assistant text streams.
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.logic.test.ts apps/web/src/components/chat/MessagesTimeline.active-tools.test.ts` · `vp lint apps/web/src/components/chat/MessagesTimeline.logic.ts apps/web/src/components/chat/TimelineWorkGroupRows.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `MessagesTimeline.logic.test.ts` and `MessagesTimeline.active-tools.test.ts` expectations on row order · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-15 Claude assistant text streams: issue draft only (server)

- Findings: F-03-15 (P1) · ~0 lines (no code) · wave 0 · depends on: none
- Files: none (no code)
- Before: `thread-claude-markdown-default-{dark,light}-1440x900.png`; cited `03-claude-answer-done-light-1440x900.png` · After: `screens/S-15/` same names
- Accept: A triaged upstream issue exists (draft in 14.6); the UI needs no change and no client-side typewriter is added.
- Tests: none (no code)
- Model: Opus low · risk: low - apps/server is out of scope for UI work (non-negotiable 4) · upstream: no: apps/server change; issue draft only, no Phase 2 code · #24865: independent
- Note: Severity P2 -> P1 per the follow-up sweep; cause is `ClaudeAdapterV2.ts` (no `text_delta` case, `streaming: false` hard-coded). The UI is correct.

##### S-16 Commit row previews before it commits

- Findings: F-05-06 (P1) · ~110 lines (adjusted from 55) · wave 3 · depends on: S-2
- Files: `components/GitActionsControl.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/S-16/` same names
- Accept: The Commit row shows file count and message and asks first above 25 files; an undo path exists.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts` · `vp lint apps/web/src/components/GitActionsControl.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: commit row gate
- Model: Opus low · risk: low - heavy users like the one-click flow · upstream: yes, after #24865 merges · #24865: rebase after merge: GitActionsControl.tsx

##### S-17 Irreversible settings actions confirm: worktree cleanup, reset actions, task delete/run, delete instance

- Findings: F-08-40 (P1), F-08-17, F-08-42, F-09-15 (P1) · ~325 lines · wave 3 · depends on: S-2
- Files: `components/projectScriptEditor.tsx`, `components/settings/ProjectActionsSettings.tsx`, `components/settings/ScheduledTasksSettings.tsx`, `components/settings/StorageSettings.tsx`, `components/usage/UsageLimits.tsx`
- Before: `settings-projects-default-{dark,light}-1440x900.png`, `settings-scheduled-tasks-default-{dark,light}-1440x900.png`, `settings-providers-default-{dark,light}-1440x900.png` · After: `screens/S-17/` same names
- Accept: Each action asks with a named verb and a count; "Delete now" previews the worktrees affected.
- Tests: `vp test run apps/web/src/components/projectScriptEditor.browser.test.tsx apps/web/src/components/settings/StorageSettings.browser.test.tsx apps/web/src/components/settings/useProjectScriptSettings.browser.test.tsx` · `vp lint apps/web/src/components/projectScriptEditor.tsx apps/web/src/components/settings/ProjectActionsSettings.tsx apps/web/src/components/settings/ScheduledTasksSettings.tsx apps/web/src/components/settings/StorageSettings.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - `StorageSettings.browser.test.tsx` exists · upstream: yes: fix-shaped, no #24865 overlap (split first: over 300 lines); bundle: 3 carve-out PRs possible · #24865: independent

##### S-18 Restore device defaults touches client keys only

- Findings: F-08-01 (P1) · ~160 lines · wave 3 · depends on: S-2, #24865
- Files: `components/settings/scopedSettings.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/S-18/` same names
- Accept: Restore resets device keys; environment settings on other environments are untouched; button lists what changes.
- Tests: `vp test run apps/web/src/components/settings/scopedSettings.test.ts apps/web/src/components/settings/SettingsPanels.logic.test.ts` · `vp lint apps/web/src/components/settings/scopedSettings.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: restore scope
- Model: Opus medium · risk: med - `useSettingsRestore` is shared with the Appearance page · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### S-19 Revoke, Revoke others and server Update confirm with counts

- Findings: F-11-13 (P1), F-11-19 (P1) · ~215 lines · wave 3 · depends on: S-2
- Files: `components/settings/ConnectionsSettings.tsx`, `components/ServerUpdateAction.tsx`, `components/chat/useSystemComposerBanners.tsx`, `components/settings/AuthorizedClientsSettings.tsx`
- Before: `settings-connections-default-{dark,light}-1440x900.png`; cited `11-revoke-immediate-light-1440x1000.png`, `11-version-skew-settings-boot-service-light-1440x900.png` · After: `screens/S-19/` same names
- Accept: Revoke names the client; "Revoke others" shows the count; server Update shows running threads and "Update and restart"; mobile capsule Stop confirms (BORROW #24385).
- Tests: `vp test run apps/web/src/components/settings/ConnectionsSettings.logic.test.ts apps/web/src/components/ServerUpdateAction.browser.test.tsx` · `vp lint apps/web/src/components/settings/ConnectionsSettings.tsx apps/web/src/components/ServerUpdateAction.tsx apps/web/src/components/chat/useSystemComposerBanners.tsx apps/web/src/components/settings/AuthorizedClientsSettings.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `ConnectionsSettings` browser tests that click Revoke · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-20 Terminal lifecycle: exit status, starting, init failure, close confirm

- Findings: F-06-10, F-06-12, F-06-11 · ~270 lines · wave 3 · depends on: S-2
- Files: `components/ThreadTerminalDrawer.tsx`, `lib/terminalCloseConfirm.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/S-20/` same names
- Accept: A shell exit shows its status with Restart; "Starting" has a skeleton; init failure shows styled text with Retry; close asks only if a process runs.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/lib/terminalCloseConfirm.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/lib/terminalCloseConfirm.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - session lifecycle in `useThreadTerminalActions` · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-21 Diff panel empty and error states use `Empty` with plain copy

- Findings: F-05-19, F-10-19 · ~110 lines · wave 3 · depends on: S-23
- Files: `components/DiffPanel.tsx`, `components/RightPanelTabs.tsx`, `components/ui/empty.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `10-first-run-and-empty-states-diff-empty-light-1440x900.png`, `10-first-run-and-empty-states-diff-empty-dark-1440x900.png` · After: `screens/S-21/` same names
- Accept: No-thread, no-repo and error states use `Empty`, >=4.5:1, with "Initialize Git" and a retry.
- Tests: `vp test run apps/web/src/components/RightPanelTabs.test.tsx` · `vp lint apps/web/src/components/DiffPanel.tsx apps/web/src/components/RightPanelTabs.tsx apps/web/src/components/ui/empty.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: Copy per section 10 row 57.

##### S-22 `Empty` primitive: inline size and migration of 26 hand-rolled empty states

- Findings: F-10-25 · ~260 lines (adjusted from 160) · wave 1 · depends on: none
- Files: `components/CommandPaletteResults.tsx`, `components/DiffPanel.tsx`, `components/ThreadTerminalDrawer.tsx`, `components/chat/MessagesTimeline.tsx`, `components/pullRequest/ThreadPullRequestsPanel.tsx`, `components/ui/empty.tsx`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/S-22/` same names
- Accept: `Empty size="inline"` exists; the 26 sites migrate with no layout shift at 1440 and 390.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts` · `vp lint apps/web/src/components/CommandPaletteResults.tsx apps/web/src/components/DiffPanel.tsx apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/components/chat/MessagesTimeline.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `shadcn/no-restyle` lint enforces variant use · upstream: yes, after #24865 merges · #24865: rebase after merge: MessagesTimeline.tsx

##### S-23 Empty and no-repo states: sidebar zero states, scratch thread, Initialize Git, PR page, Git menu

- Findings: F-10-18, F-10-20, F-10-21, F-10-22, F-05-24 · ~155 lines · wave 2 · depends on: S-22
- Files: `components/GitActionsControl.tsx`, `components/ChatView.tsx`, `components/GitActionsControl.logic.ts`, `components/Sidebar.tsx`, `components/chat/ThreadDetailsPanel.tsx`, `components/pullRequest/PullRequestListEmptyState.tsx` (+2)
- Before: `home-default-{dark,light}-1440x900.png`, `pull-requests-default-{dark,light}-1440x900.png`; cited `10-first-run-and-empty-states-sidebar-zero-threads-scoped-light-1440x900.png`, `10-first-run-and-empty-states-draft-no-project-light-1440x900.png` (+6) · After: `screens/S-23/` same names
- Accept: Zero states offer an action and pass 4.5:1; scratch threads hide project-only rows; no-remote pages say so instead of blaming filters.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts apps/web/src/components/ChatView.logic.test.ts apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/GitActionsControl.tsx apps/web/src/components/ChatView.tsx apps/web/src/components/GitActionsControl.logic.ts apps/web/src/components/Sidebar.tsx ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/contracts typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Collides with #24865's `Sidebar.tsx` shelf hunks only nearby · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: GitActionsControl.tsx, Sidebar.tsx

##### S-24 Usage page states: honest loading, empty states with an action

- Findings: F-13-05 (P1), F-09-34, F-10-23 · ~165 lines · wave 2 · depends on: S-22
- Files: `components/usage/UsageLimitsPooled.tsx`, `components/usage/UsagePage.tsx`
- Before: `usage-default-{dark,light}-1440x900.png`; cited `13-usage-open-fast3g-light-1440x900-s0.png`, `09-usage-limits-empty-light-1440x900.png` (+1) · After: `screens/S-24/` same names
- Accept: Loading shows a skeleton, not "$0.00" or "No usage"; empty states have an action.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/usage/UsageLimitsPooled.tsx apps/web/src/components/usage/UsagePage.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - no test covers the pre-ready frames of `UsagePage` · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-25 Sidebar skeleton at row pitch until the snapshot arrives

- Findings: F-13-01 (P1) · ~55 lines · wave 1 · depends on: none
- Files: `components/Sidebar.tsx`, `state/entities.ts`
- Before: `home-default-{dark,light}-1440x900.png`; cited `13-coldload-slow4g-light-1440x900-t16000.png`, `13-prs-fast3g-light-1440x900-s1.png` · After: `screens/S-25/` same names
- Accept: Returning users never see "No projects yet" before the shell snapshot; skeleton rows match real row pitch.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/Sidebar.tsx apps/web/src/state/entities.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: empty state gated on snapshot
- Model: Opus low · risk: low - `Sidebar` browser tests that assert the empty state need `bootstrapped` set · upstream: yes, after #24865 merges · #24865: rebase after merge: Sidebar.tsx

##### S-26 Boot splash stays until first paint and ships a lighter logo

- Findings: F-13-02 (P1), F-13-04 (P1) · ~110 lines · wave 1 · depends on: #24865
- Files: `apps/web/index.html`, `routes/_chat.index.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `13-coldload-sheet-prod-slow4g-light-390x844-long.png`, `13-coldload-sheet-prod-slow4g-light-1440x900.png` · After: `screens/S-26/` same names + short .webm of the timing
- Accept: No blank frame between splash and app; the 114 kB PNG logo becomes an inline SVG; a static "Still loading" line appears at 4 s.
- Tests: no existing test beside these files · `vp lint apps/web/src/routes/_chat.index.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `FirstRunGate` has no component test for the pending frame · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: index.html

##### S-27 "Connecting" derives from environment phase, not a 4 s timer

- Findings: F-13-03 (P1) · ~160 lines · wave 1 · depends on: O-1
- Files: `components/chat/useSystemComposerBanners.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `13-stillconnecting-fast3g-light-1440x900.png` · After: `screens/S-27/` same names + short .webm of the timing
- Accept: Still-connecting appears only after a failed phase; slow links never show a false failure.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/useSystemComposerBanners.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: phase to status mapping
- Model: Opus medium · risk: med - `firstRun.logic` tests cover the `timeout` transition · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-28 Diff loading: skeleton, highlight placeholders, file progress

- Findings: F-13-06 (P1), F-13-14, F-13-17 · ~125 lines · wave 1 · depends on: none
- Files: `components/ChatMarkdown.tsx`, `components/DiffPanelShell.tsx`, `components/diffs/DiffFileLoadingBoundary.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `13-diff220-slow4g-light-1440x900-s1.png`, `13-threadswitch-fast3g-loading-light-1440x900.png` · After: `screens/S-28/` same names
- Accept: Diff panel shows file headers and a skeleton while highlight workers load; code blocks keep their size until Shiki loads; the sentinel names the remainder ("Loading 188 more files...").
- Tests: `vp test run apps/web/src/components/ChatMarkdown.browser.test.tsx` · `vp lint apps/web/src/components/ChatMarkdown.tsx apps/web/src/components/DiffPanelShell.tsx apps/web/src/components/diffs/DiffFileLoadingBoundary.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `DiffWorkerPoolProvider` and diff browser tests · upstream: yes, after #24865 merges; bundle: 3 carve-out PRs possible · #24865: rebase after merge: ChatMarkdown.tsx

##### S-29 Thread loading: timeline state, banner without composer shift, friendly paging error

- Findings: F-13-08 (P1), F-13-10, F-13-07 (P1) · ~125 lines · wave 1 · depends on: none
- Files: `components/chat/ChatComposer.tsx`, `components/chat/MessagesTimeline.tsx`, `components/chat/useSystemComposerBanners.tsx`, `threadSync.ts`, `pkg:client-runtime/src/state/threads.ts`
- Before: `thread-long-conversation-default-{dark,light}-1440x900.png`; cited `13-threadswitch-fast3g-loading-light-1440x900.png`, `13-history-error-light-1440x900.png` · After: `screens/S-29/` same names + short .webm of the timing
- Accept: Opening a thread shows a timeline skeleton; the sync banner does not move the composer; paging errors drop the URL and cursor.
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts` · `vp lint apps/web/src/components/chat/ChatComposer.tsx apps/web/src/components/chat/MessagesTimeline.tsx apps/web/src/components/chat/useSystemComposerBanners.tsx apps/web/src/threadSync.ts ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/client-runtime typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `MessagesTimeline.browser.test.tsx` asserts the placeholder · upstream: yes, after #24865 merges; bundle: 3 carve-out PRs possible · #24865: rebase after merge: ChatComposer.tsx, MessagesTimeline.tsx

##### S-30 Route pending feedback while a chunk loads

- Findings: F-13-13 · ~55 lines · wave 0 · depends on: none
- Files: `router.ts`, `routes/pair.tsx`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/S-30/` same names + short .webm of the timing
- Accept: Navigation to a lazy route shows a pending cue (`defaultPendingMs: 200`): the footer icon becomes a `Spinner` with `aria-busy`.
- Tests: no existing test beside these files · `vp lint apps/web/src/router.ts apps/web/src/routes/pair.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - icon swap flicker on warm chunks · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-31 Reconnect banner: Retry now, countdown, activity

- Findings: F-11-17 (P1), F-13-15 · ~110 lines · wave 0 · depends on: none
- Files: `components/chat/useSystemComposerBanners.tsx`, `components/settings/ConnectionDiagnosisDetails.tsx`
- Before: `home-default-{dark,light}-1440x900.png`; cited `11-multi-env-details-panel-light-1440x1000.png`, `13-stalled-load-both-light-1440x900.png` · After: `screens/S-31/` same names + short .webm of the timing
- Accept: Banner shows a countdown and "Retry now" (BORROW #23194); recovery no longer lags up to 5 minutes (#22024).
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/useSystemComposerBanners.tsx apps/web/src/components/settings/ConnectionDiagnosisDetails.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `useSystemComposerBanners` has browser tests for the Reconnect button (update the offline case, add... · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-32 Revoked session routes to /pair

- Findings: F-11-18 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `pkg:client-runtime/src/rpc/session.ts`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `11-session-revoked-midsession-final-light-1440x900.png`, `11-session-revoked-after-reload-light-1440x900.png` · After: `screens/S-32/` same names
- Accept: A revoked session shows "Signed out" and routes to /pair.
- Tests: `vp test run packages/client-runtime/src/rpc/session.test.ts` · `vp lint packages/client-runtime/src/rpc/session.ts` · `vp run --filter @t3tools/client-runtime typecheck` · new: logic test: revoked session handling
- Model: Opus medium · risk: med - client-runtime tests (`session.test.ts`, `supervisor.test.ts`) · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-33 App-level connection indicator

- Findings: F-11-16 (P1) · ~160 lines · wave 1 · depends on: none
- Files: `components/Sidebar.tsx`, `components/chat/useSystemComposerBanners.tsx`
- Before: `home-default-{dark,light}-1440x900.png`; cited `11-disconnect-close-t30s-light-1440x900.png`, `11-disconnect-settings-connections-light-1440x900.png` · After: `screens/S-33/` same names
- Accept: A connection dot with state text in the sidebar footer; machine section stops saying "Up to date" while offline.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/Sidebar.tsx apps/web/src/components/chat/useSystemComposerBanners.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - sidebar footer is area 01's surface (F-01-15, F-01-24 touch the same row) · upstream: no: new element, propose as an Ideas post first · #24865: rebase after merge: Sidebar.tsx

### 13.8 Edge cases (15 chunks)

Layout floors and content extremes: narrow panels, short windows, huge or blank content, long names, non-Latin text.

##### E-1 Chat column floor with an inline right panel

- Findings: F-01-03 (P1), F-01-11 · ~70 lines · wave 0 · depends on: none
- Files: `components/RightPanelSheet.tsx`, `components/ui/sheet.tsx`, `rightPanelLayout.ts`
- Before: `home-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-{1440x900,1024x640,800x600}.png`; cited `01-app-shell-sidebar-max-panel-open-light-1440x900.png`, `01-app-shell-rightpanel-open-light-800x600.png` · After: `screens/E-1/` same names
- Accept: Chat >= 360 px with an inline panel; below 720 px layout width the panel becomes a sheet and honours the saved width.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/RightPanelSheet.tsx apps/web/src/components/ui/sheet.tsx apps/web/src/rightPanelLayout.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: shouldAcceptWidth subtracts the panel
- Model: Opus low · risk: low - sidebar drag is `useResizeDrag` in `ui/sidebar.tsx:398-471` · upstream: yes: F-01-03 alone is a clean fix; F-01-11 (sheet cap) is a sizing choice and stays in the fork if the maintainer objects · #24865: independent

##### E-2 Short windows: terminal drawer and banners keep a usable chat

- Findings: F-01-12, F-04-39 · ~215 lines · wave 1 · depends on: none
- Files: `components/ThreadTerminalDrawer.tsx`, `index.css`, `terminalUiStateStore.ts`
- Before: `thread-codex-edits-default-{dark,light}-{800x600,1024x640}.png`; cited `01-app-shell-terminal-open-chat-area-light-800x600.png` · After: `screens/E-2/` same names
- Accept: Initial drawer height is `clamp(180, 0.4 * innerHeight, 280)` and persists only after a drag; approval, queue and composer banners share one height budget at 600 px tall.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/terminalUiStateStore.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/index.css apps/web/src/terminalUiStateStore.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `terminalUiStateStore.ts` writes the default into persisted state on open (`terminalHeight: 280` appears... · upstream: no: ChatComposer.tsx is a #24865 file and the drawer height is a product default; follow up after the merge · #24865: rebase after merge: index.css

##### E-3 Very long and blank titles

- Findings: F-02-08 (P1), F-02-19, F-02-15 · ~125 lines · wave 1 · depends on: none
- Files: `components/Sidebar.logic.ts`, `components/ThreadHoverCard.tsx`, `components/settings/ArchivedThreadsPanel.tsx`, `components/sidebar/SidebarThreadRow.tsx`
- Before: `settings-archived-default-{dark,light}-1440x900.png`; cited `02-thread-list-archived-long-word-dark-1440x900.png`, `02-thread-list-titles-rtl-blank-dark-1440x900.png` (+1) · After: `screens/E-3/` same names
- Accept: A 200-character single-word title wraps inside the Archive row; blank titles render a placeholder; hover card shows the full title and absolute time.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/Sidebar.logic.ts apps/web/src/components/ThreadHoverCard.tsx apps/web/src/components/settings/ArchivedThreadsPanel.tsx apps/web/src/components/sidebar/SidebarThreadRow.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `SettingsRow` is shared by every settings page · upstream: yes, after #24865 merges · #24865: rebase after merge: SidebarThreadRow.tsx

##### E-4 Window the active sidebar list

- Findings: F-02-30 · ~420 lines · wave 1 · depends on: none
- Files: `components/Sidebar.motion.ts`, `components/sidebar/SidebarThreadRow.tsx`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/E-4/` same names
- Accept: Interim: the initial active render is capped at 200 rows with "Show 25 more"; then only rows within one viewport of the scroll port mount (the dragged and route rows always mount).
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/Sidebar.motion.ts apps/web/src/components/sidebar/SidebarThreadRow.tsx` · `vp run --filter @t3tools/web typecheck` · new: browser test: row count capped
- Model: Opus medium · risk: high - dnd-kit measures droppables by mount · upstream: yes, after #24865 merges (split first: over 300 lines) · #24865: rebase after merge: SidebarThreadRow.tsx
- Note: Interim cap first, per follow-up sweep.

##### E-5 Oversize first turn shows an `Empty` state with "Load turn"

- Findings: F-03-03 (P1) · ~55 lines · wave 1 · depends on: none
- Files: `components/chat/MessagesTimeline.tsx`, `components/ui/empty.tsx`
- Before: `thread-huge-output-default-{dark,light}-1440x900.png`; cited `03-huge-initial-light-1440x900.png` · After: `screens/E-5/` same names
- Accept: Opening a thread whose only turn exceeds the bounded window shows "Load turn", not a blank list.
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts` · `vp lint apps/web/src/components/chat/MessagesTimeline.tsx apps/web/src/components/ui/empty.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `MessagesTimeline.browser.test.tsx` covers the divider · upstream: yes, after #24865 merges · #24865: rebase after merge: MessagesTimeline.tsx

##### E-6 Huge messages and code blocks are capped

- Findings: F-03-04 (P1), F-03-05 · ~320 lines · wave 1 · depends on: none
- Files: `components/chat/MarkdownCodeBlock.tsx`, `components/chat/MessagesTimeline.tsx`, `components/chat/TimelineAssistantRows.tsx`, `components/chat/TimelineUserMessageRow.tsx`, `components/chat/V2ItemInspector.tsx`, `index.css`
- Before: `thread-huge-output-default-{dark,light}-1440x900.png`; cited `03-huge-loaded-light-1440x900.png` · After: `screens/E-6/` same names
- Accept: A 1 MB message mounts <= 60 blocks plus "Show remaining"; a 5,000-line code block collapses; no 2.4 s long task.
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts apps/web/src/components/chat/threadFindHighlights.browser.test.tsx` · `vp lint apps/web/src/components/chat/MarkdownCodeBlock.tsx apps/web/src/components/chat/MessagesTimeline.tsx apps/web/src/components/chat/TimelineAssistantRows.tsx apps/web/src/components/chat/TimelineUserMessageRow.tsx ...` · `vp run --filter @t3tools/web typecheck` · new: browser test: node count for 1 MB message
- Model: Opus medium · risk: high - find-in-thread counts, selection/citation across the boundary, copy message (must still copy the full... · upstream: no: new behaviour in `ChatMarkdown.tsx`, a #24865 file; also needs maintainer agreement, DNA-P2 · #24865: rebase after merge: MessagesTimeline.tsx, index.css

##### E-7 Reaching the start of a long thread takes one action

- Findings: F-03-07 · ~55 lines · wave 0 · depends on: none
- Files: `lib/observeResize.ts`
- Before: `thread-long-conversation-default-{dark,light}-1440x900.png` · After: `screens/E-7/` same names
- Accept: Scrolling toward the top auto-loads earlier turns (sentinel with 600 px margin, debounced, only after a user scroll-up); the button stays for keyboard users.
- Tests: no existing test beside these files · `vp lint apps/web/src/lib/observeResize.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `maintainVisibleContentPosition` jumps, citation `throughEntryId` loads, server load · upstream: no: behaviour change in `MessagesTimeline.tsx`, needs discussion first · #24865: independent

##### E-8 Diff file list edge cases: binary, whitespace-only, renamed

- Findings: F-05-02 (P1), F-05-07, F-05-10 · ~165 lines · wave 0 · depends on: none
- Files: `components/DiffPanel.tsx`, `components/files/FilePreviewPanel.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `05-diff-and-review-shapes-changes-light-1440x900.png`, `05-diff-and-review-binary-expanded-dark-1440x900.png` (+2) · After: `screens/E-8/` same names
- Accept: Binary files show size/type, not +0 -0; whitespace-only files stay listed with a note; renamed headers keep the changed part.
- Tests: `vp test run apps/web/src/components/files/FilePreviewPanel.test.ts` · `vp lint apps/web/src/components/DiffPanel.tsx apps/web/src/components/files/FilePreviewPanel.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `Badge` is a `components/ui` primitive: use an existing variant, do not restyle · upstream: yes: fix-shaped, no #24865 overlap; bundle: 3 carve-out PRs possible · #24865: independent

##### E-9 Diff comparator and toolbar adapt to narrow panels

- Findings: F-05-03 (P1), F-05-12 · ~215 lines · wave 0 · depends on: none
- Files: `components/DiffPanel.tsx`, `components/pullRequest/PullRequestCodeTab.tsx`
- Before: `thread-codex-edits-default-{dark,light}-{1440x900,800x600}.png`; cited `05-diff-and-review-empty-changes-light-1440x900.png`, `05-diff-and-review-panel-dark-800x600.png` (+1) · After: `screens/E-9/` same names
- Accept: Comparator moves to its own row; the toolbar stays labelled and usable at 335 px.
- Tests: `vp test run apps/web/src/components/pullRequest/PullRequestCodeTab.browser.test.tsx` · `vp lint apps/web/src/components/DiffPanel.tsx apps/web/src/components/pullRequest/PullRequestCodeTab.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `DiffPanelShell` is also used `embedded`/`sheet` · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### E-10 Diff and PR Code toolbars share one order and size

- Findings: F-05-13 · ~160 lines · wave 1 · depends on: E-9
- Files: `components/DiffPanel.tsx`, `components/pullRequest/PullRequestCodeTab.tsx`
- Before: `pull-requests-default-{dark,light}-1440x900.png`; cited `05-diff-and-review-seed-default-light-1440x900.png`, `05-diff-and-review-pr-code-tab-light-1440x900.png` · After: `screens/E-10/` same names
- Accept: Both toolbars hold the same controls in the same order and size.
- Tests: `vp test run apps/web/src/components/pullRequest/PullRequestCodeTab.browser.test.tsx apps/web/src/components/pullRequest/PullRequestSummaryTab.browser.test.tsx` · `vp lint apps/web/src/components/DiffPanel.tsx apps/web/src/components/pullRequest/PullRequestCodeTab.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - PR Code toolbar has `Viewed` count wiring · upstream: no: touches two large components; propose as a follow-up chunk · #24865: independent

##### E-11 Diff split, tree and explorer defaults at narrow widths

- Findings: F-05-04 (P1), F-05-11, F-05-21, F-06-09 (P1) · ~325 lines · wave 0 · depends on: none
- Files: `components/files/FilePreviewPanel.tsx`, `hooks/usePreviewPanelInlineSize.ts`, `lib/observeResize.ts`
- Before: `thread-codex-edits-default-{dark,light}-{1440x900,800x600}.png`; cited `05-diff-and-review-split-default-width-light-1440x900.png`, `05-diff-and-review-split-maximized-light-1440x900.png` (+2) · After: `screens/E-11/` same names
- Accept: Split falls back to unified under 720 px; the diff tree no longer takes a fixed 16 rem / 40%; the file explorer starts closed under 720 px.
- Tests: `vp test run apps/web/src/components/files/FilePreviewPanel.test.ts` · `vp lint apps/web/src/components/files/FilePreviewPanel.tsx apps/web/src/hooks/usePreviewPanelInlineSize.ts apps/web/src/lib/observeResize.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - `ToggleGroup` value must stay `split` while the render is unified, so the toggle looks selected but... · upstream: yes: fix-shaped, no #24865 overlap (split first: over 300 lines); bundle: 3 carve-out PRs possible · #24865: independent
- Note: Absorbs BORROW #24189 (long guide Next button).

##### E-12 Typed text survives Esc in commit-on-blur fields

- Findings: F-08-08 (P1) · ~55 lines · wave 0 · depends on: none
- Files: `hooks/useCommitOnBlur.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/E-12/` same names
- Accept: Esc or close flushes the field commit before Settings unmounts.
- Tests: no existing test beside these files · `vp lint apps/web/src/hooks/useCommitOnBlur.ts` · `vp run --filter @t3tools/web typecheck` · new: browser test: Esc commits pending field
- Model: Opus low · risk: low - Flush-on-close can commit half-typed values (an invalid worktree path) · upstream: yes: small, fix-shaped; `AppRouteModal.tsx` is not in #24865 · #24865: independent

##### E-13 Interface font size moves the layout breakpoints

- Findings: F-07-12 · ~160 lines · wave 1 · depends on: none
- Files: `components/AppRouteModal.tsx`, `components/settings/settingsLayout.tsx`
- Before: `settings-appearance-default-{dark,light}-800x600.png` · After: `screens/E-13/` same names
- Accept: At 20 px Interface font size Settings does not overflow at 800x600.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/AppRouteModal.tsx apps/web/src/components/settings/settingsLayout.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `@container` on the modal popup changes containing-block behaviour for `position: fixed` descendants... · upstream: yes, after #24865 merges · #24865: rebase after merge: settingsLayout.tsx

##### E-14 A provider turned off for a project does not silently switch the draft

- Findings: F-09-18 · ~160 lines · wave 0 · depends on: none
- Files: `components/chat/ModelPickerSidebar.tsx`, `providerInstances.ts`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `09-draft-project-claude-off-light-1440x900.png`, `09-draft-project-claude-off-picker-light-1440x900.png` · After: `screens/E-14/` same names
- Accept: The picker keeps the provider visible and disabled with a reason; the draft does not change model.
- Tests: `vp test run apps/web/src/providerInstances.test.ts` · `vp lint apps/web/src/components/chat/ModelPickerSidebar.tsx apps/web/src/providerInstances.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: draft model with disabled provider
- Model: Opus medium · risk: med - touches applyProviderInstanceSettings (providerInstances.ts:121) and isProviderInstancePickerVisible (: · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### E-15 Non-Latin text: theme ids and composer underscores

- Findings: F-07-31 · ~55 lines · wave 0 · depends on: none
- Files: `components/settings/ThemeSettings.tsx`, `themePalette.ts`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/E-15/` same names
- Accept: A second theme without Latin letters gets a unique id; composer drafts keep underscores in non-Latin names (ADOPT #22771).
- Tests: `vp test run apps/web/src/themePalette.test.ts` · `vp lint apps/web/src/components/settings/ThemeSettings.tsx apps/web/src/themePalette.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Ids are used as `data-theme-id` and CSS-variable-free storage keys only (checked `themePalette.ts`), but... · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: Code from #22771 by `yzn-h`.

### 13.9 Customisation (11 chunks)

Section 7: remembered defaults, discoverability and placement of settings that exist, and the few new settings that fit the DNA (all approval-gated).

##### C-1 Thread details visible on new threads (N1)

- Findings: F-23-02, F-01-30 (P3) · ~110 lines · wave 1 · depends on: #24865
- Files: `components/ChatView.tsx`, `components/settings/AppearanceSettingsPanel.tsx`, `pkg:contracts/src/settings.ts`, `components/settings/settingsSearch.ts`, `components/settings/SettingsPanels.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/C-1/` same names
- Accept: A device setting "Thread details on new threads" (default off, as today) opens the card on new threads; added to search and Restore labels.
- Tests: `vp test run apps/web/src/components/ChatView.logic.test.ts packages/contracts/src/settings.test.ts apps/web/src/components/settings/settingsSearch.test.ts apps/web/src/components/settings/SettingsPanels.logic.test.ts` · `vp lint apps/web/src/components/ChatView.tsx apps/web/src/components/settings/AppearanceSettingsPanel.tsx packages/contracts/src/settings.ts apps/web/src/components/settings/settingsSearch.ts ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/contracts typecheck` · new: logic test: setting reaches new thread state
- Model: Opus low · risk: low - Because the map stores only non-default entries, flipping the setting flips every thread without an entry · upstream: no: new setting, needs Ideas approval (#15119) · #24865: rebase after merge: settings.ts, AppearanceSettingsPanel.tsx are in #24865

##### C-2 Right-panel width and terminal height defaults for new threads (N2)

- Findings: F-23-03, F-01-10 · ~190 lines (adjusted from 110) · wave 0 · depends on: none
- Files: `components/ChatView.tsx`, `components/ui/sidebar.tsx`, `hooks/usePreviewPanelInlineSize.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/C-2/` same names
- Accept: New threads inherit the last width/height; double-click resets; rail titles state the reset gesture. No new setting.
- Tests: `vp test run apps/web/src/components/ChatView.logic.test.ts` · `vp lint apps/web/src/components/ChatView.tsx apps/web/src/components/ui/sidebar.tsx apps/web/src/hooks/usePreviewPanelInlineSize.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: last-used width inheritance
- Model: Opus medium · risk: med - `useResizableWidth.browser.test.tsx` (if present) and `usePreviewPanelInlineSize` tests · upstream: no: behaviour change needs prior approval; #22256 and #12395 are open. Credit the ideas · #24865: independent

##### C-3 Restore device defaults lists and resets fonts

- Findings: F-23-07 · ~60 lines (adjusted from 15) · wave 1 · depends on: #24865
- Files: `components/settings/SettingsPanels.tsx`, `routes/_chat.settings.tsx`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/C-3/` same names
- Accept: Fonts count as changed; the button enables for a font-only change; fontSmoothing resets.
- Tests: `vp test run apps/web/src/components/settings/SettingsPanels.logic.test.ts` · `vp lint apps/web/src/components/settings/SettingsPanels.tsx apps/web/src/routes/_chat.settings.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: changedSettingLabels includes fonts
- Model: Opus low · risk: low - `SettingsPanels.logic.test.ts` covers label helpers only · upstream: yes, after #24865 merges · #24865: rebase after merge: SettingsPanels.tsx

##### C-4 User docs match the shipped controls

- Findings: F-23-01 · ~90 lines (adjusted from 15) · wave 1 · depends on: #24865
- Files: `docs/user/thread-sidebar.md`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/C-4/` same names
- Accept: docs/user lists the ten undocumented Appearance controls, resizing sentence, 17 General rows.
- Tests: no existing test beside these files · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: low · upstream: yes, after #24865 merges · #24865: rebase after merge: thread-sidebar.md
- Note: Docs only; rebase after #24865 relabels.

##### C-5 Context meter: Auto, Always, Never

- Findings: F-04-40 · ~150 lines (adjusted from 55) · wave 1 · depends on: #24865
- Files: `components/chat/ChatComposer.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `04-context-meter-hover-light-1440x900@2x.png` · After: `screens/C-5/` same names
- Accept: The meter shows automatically from 70% used; the legacy switch becomes an Auto/Always/Never select (#14404).
- Tests: `vp test run apps/web/src/components/chat/ContextWindowMeter.logic.test.ts` · `vp lint apps/web/src/components/chat/ChatComposer.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: auto threshold
- Model: Opus low · risk: low - `ContextWindowMeter.logic.test.ts` · upstream: no: changes a default, needs approval · #24865: rebase after merge: ChatComposer.tsx

##### C-6 Contrast slider: floor and border lift

- Findings: F-07-26, F-16-11 · ~175 lines · wave 1 · depends on: #24865
- Files: `appearanceContrast.ts`, `components/settings/settingsLayout.tsx`, `index.css`, `components/settings/AppearanceSettingsPanel.tsx`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/C-6/` same names
- Accept: UI minimum 75 with a status line; borders reach 3:1 at 200; contract minimum stays 50.
- Tests: no existing test beside these files · `vp lint apps/web/src/appearanceContrast.ts apps/web/src/components/settings/settingsLayout.tsx apps/web/src/index.css apps/web/src/components/settings/AppearanceSettingsPanel.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Users who saved 50-70 keep it (decoded as is) until they touch the slider · upstream: no: changes an existing control range; discuss first · #24865: rebase after merge: settingsLayout.tsx, index.css, AppearanceSettingsPanel.tsx

##### C-7 Motion setting tells the truth; in-app reduce-motion override (N4)

- Findings: F-07-27, F-23-05 (P3) · ~175 lines · wave 2 · depends on: MO-1
- Files: `panelAnimations.ts`, `components/RightPanelTabs.tsx`, `components/Sidebar.motion.ts`, `components/settings/AppearanceSettingsPanel.tsx`, `index.css`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/C-7/` same names + short .webm of the timing
- Accept: Panel animations shows 0 ms and a status line when the OS flag forces it; `html[data-reduce-motion]` mirrors the media rule.
- Tests: `vp test run apps/web/src/components/RightPanelTabs.test.tsx apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/panelAnimations.ts apps/web/src/components/RightPanelTabs.tsx apps/web/src/components/Sidebar.motion.ts apps/web/src/components/settings/AppearanceSettingsPanel.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med · upstream: no: N4 is a new setting; F-07-27 alone is eligible · #24865: rebase after merge: AppearanceSettingsPanel.tsx, index.css

##### C-8 General page: regroup 16-row Behavior; device-only rows move with Diff colors

- Findings: F-08-09, F-23-09 (P3), F-23-10 (P3) · ~270 lines · wave 2 · depends on: #24865, H1
- Files: `components/settings/settingsSearch.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png`, `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/C-8/` same names
- Accept: No General section has more than 8 rows; Appearance splits into Colors, Layout, Text, Motion; search ids unchanged.
- Tests: `vp test run apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/web/src/components/settings/settingsSearch.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Anchors `#organization`, `#behavior` change · upstream: no: restructures settings pages; maintainer call · #24865: rebase after merge: settingsSearch.ts

##### C-9 Project order: Manual is arrangeable in the default sidebar

- Findings: F-08-10 · ~150 lines (adjusted from 55) · wave 1 · depends on: #24865
- Files: `components/Sidebar.tsx`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/C-9/` same names
- Accept: Choosing Manual enables drag handles in the default sidebar.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/Sidebar.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Users who already have Manual keep it · upstream: no: new interaction; needs approval · #24865: rebase after merge: Sidebar.tsx

##### C-10 Settings search finds the existing theme, motion, blur and text-size controls

- Findings: F-23-08 (P3), F-07-11 (P3), F-23-11 (P3) · ~45 lines · wave 1 · depends on: #24865
- Files: `components/settings/settingsSearch.ts`, `components/CommandPalette.tsx`, `components/LegacySidebar.tsx`, `components/Sidebar.tsx`, `components/settings/ThemeEditorPanel.tsx`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/C-10/` same names
- Accept: Searching "accent", "density", "zoom", "blur", "motion" finds the right row; legacy sort/preview settings stop leaking.
- Tests: `vp test run apps/web/src/components/settings/settingsSearch.test.ts apps/web/src/components/CommandPalette.logic.test.ts apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/settings/settingsSearch.ts apps/web/src/components/CommandPalette.tsx apps/web/src/components/LegacySidebar.tsx apps/web/src/components/Sidebar.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: low · upstream: yes, after #24865 merges · #24865: rebase after merge: settingsSearch.ts, Sidebar.tsx
- Note: Search terms only (section 7.5).

##### C-11 Message text size (N5)

- Findings: F-23-06 (P3) · ~160 lines · wave 2 · depends on: C-3, #24865
- Files: `appearanceFonts.ts`, `index.css`
- Before: `thread-claude-markdown-default-{dark,light}-1440x900.png` · After: `screens/C-11/` same names
- Accept: A chat-only size ratio scales prose, not chrome (#24461).
- Tests: no existing test beside these files · `vp lint apps/web/src/appearanceFonts.ts apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med · upstream: no: conditional on maintainer approval (Ideas #10769) · #24865: rebase after merge: appearanceFonts.ts, index.css

### 13.10 Onboarding (17 chunks)

Section 8: first-run gate, wizard, re-entry and mobile first launch. Wireframes in `ui-overhaul/spec/onboarding/01..08-*.md`.

##### O-1 First-run gate and recovery: shell with drag region, working actions, no blank frame

- Findings: F-10-05 (P1), F-10-06 (P1), F-10-09 · ~125 lines · wave 0 · depends on: none
- Files: `components/onboarding/FirstRunGate.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `10-first-run-and-empty-states-first-run-could-not-read-settings-light-1440x900.png`, `10-first-run-and-empty-states-first-run-still-connecting-light-1440x900.png` (+1) · After: `screens/O-1/` same names + short .webm of the timing
- Accept: The pending and recovery cards share `FirstRunShell` with a drag region; recovery offers "Open Connections"; spinner after 1 s.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/onboarding/FirstRunGate.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: low - No test covers the recovery cards · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### O-2 Wizard shows on first web launch; `/` opens a draft (UI half; server field is an issue)

- Findings: F-10-01 (P1), F-10-03 (P1) · ~30 lines · wave 0 · depends on: none
- Files: `server:serverRuntimeStartup.ts`, `routes/__root.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png` · After: `screens/O-2/` same names
- Accept: `__root.tsx` navigates to the bootstrap thread only when `bootstrapThreadCreated === true`; once the server sends the field (issue in 14.6) the wizard shows on a first `npx t3` launch.
- Tests: `vp test run apps/server/src/serverRuntimeStartup.test.ts` · `vp lint apps/server/src/serverRuntimeStartup.ts apps/web/src/routes/__root.tsx` · `vp run --filter t3 typecheck` ; `vp run --filter @t3tools/web typecheck` · new: browser test: `/` with and without `bootstrapThreadCreated`
- Model: Opus low · risk: low - Web-mode first-time users will start seeing the wizard, and its "Check your agents" and import steps run... · upstream: no: gated on a server change (apps/server); file the issue first, then this one-condition client change · #24865: independent
- Note: apps/server is outside UI scope; the UI half is gated, never faked.

##### O-3 `/new` without a prompt redirects to `/`

- Findings: F-10-04 (P1) · ~15 lines · wave 0 · depends on: none
- Files: `components/promptLinks/NewThreadLinkView.tsx`, `routes/_chat.new.tsx`
- Before: `home-default-{dark,light}-1440x900.png`; cited `10-first-run-and-empty-states-new-no-prompt-light-1440x900.png`, `10-first-run-and-empty-states-new-no-prompt-dark-1440x900.png` (+1) · After: `screens/O-3/` same names
- Accept: `/new` renders no error page; it redirects with chrome intact.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/promptLinks/NewThreadLinkView.tsx apps/web/src/routes/_chat.new.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: /new redirect
- Model: Opus low · risk: low - `promptLinks` tests cover `parseNewThreadLink` · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### O-4 Not-installed providers offer an install row with a copyable command

- Findings: F-09-07 (P1), F-09-08 · ~215 lines · wave 0 · depends on: none
- Files: `components/chat/ModelPickerContent.tsx`, `components/chat/ModelPickerSidebar.tsx`, `components/settings/ProviderInstanceCard.tsx`
- Before: `settings-providers-default-{dark,light}-1440x900.png`; cited `09-providers-opencode-detail-light-1440x900.png`, `09-providers-pi-detail-dark-1440x900.png` (+5) · After: `screens/O-4/` same names
- Accept: Each missing provider shows an install command with Copy and Check again; backticks are not shown raw.
- Tests: `vp test run apps/web/src/components/settings/ProviderInstanceCard.test.ts apps/web/src/components/settings/providerStatus.test.ts` · `vp lint apps/web/src/components/chat/ModelPickerContent.tsx apps/web/src/components/chat/ModelPickerSidebar.tsx apps/web/src/components/settings/ProviderInstanceCard.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - server field is a contract change (`packages/contracts/src/server.ts`) · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### O-5 Setup route from the composer chip, banner and palette when no provider is usable

- Findings: F-09-20 (P1), F-10-24, F-24-05 (P1) · ~270 lines · wave 1 · depends on: #24865
- Files: `components/chat/ChatComposer.tsx`, `components/chat/ComposerControlsBar.tsx`, `components/settings/ProviderSettingsPanel.tsx`, `components/chat/ComposerPrimaryActions.tsx`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `09-thread-grok-instance-removed-send-ignored-light-1440x900.png` · After: `screens/O-5/` same names
- Accept: Chip reads "Set up an agent" and opens `/welcome#agents:<id>` or Providers; palette has "Set up agents"; Providers empty state offers "Add provider".
- Tests: `vp test run apps/web/src/components/settings/ProviderSettingsPanel.logic.test.ts` · `vp lint apps/web/src/components/chat/ChatComposer.tsx apps/web/src/components/chat/ComposerControlsBar.tsx apps/web/src/components/settings/ProviderSettingsPanel.tsx apps/web/src/components/chat/ComposerPrimaryActions.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `ComposerPrimaryActions` tests · upstream: no: composer chip and banner sit in #24865 files; palette rows are eligible now · #24865: rebase after merge: ChatComposer.tsx, ComposerControlsBar.tsx, ComposerPrimaryActions.tsx

##### O-6 Wizard: Skip setup, Escape, initial focus on Continue

- Findings: F-10-10, F-10-11, F-24-10 · ~190 lines · wave 0 · depends on: none
- Files: `components/onboarding/WelcomeWizard.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `10-first-run-and-empty-states-welcome-1-connect-light-1440x900.png` · After: `screens/O-6/` same names
- Accept: Escape and "Skip setup" finish without importing; Continue has initial focus; X no longer completes silently.
- Tests: `vp test run apps/web/src/components/onboarding/WelcomeWizard.import.browser.test.tsx` · `vp lint apps/web/src/components/onboarding/WelcomeWizard.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `WelcomeWizard.import.browser.test.tsx` renders the wizard · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: Absorbs BORROW #24719 (keep selection on Back).

##### O-7 Wizard footer is sticky at 800x600 and 200% zoom

- Findings: F-10-12 · ~160 lines · wave 1 · depends on: O-6
- Files: `components/ui/dialog.tsx`
- Before: `welcome-default-{dark,light}-800x600.png`; cited `10-first-run-and-empty-states-welcome-3-import-masked-light-800x600.png` · After: `screens/O-7/` same names
- Accept: Continue and Import stay visible at 800x600 and 200% zoom.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/dialog.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Other wizards using `WizardPopup` gain an optional prop only · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: BORROW #24381 for the Add-provider wizard.

##### O-8 Computers step appears only when needed

- Findings: F-24-06, F-10-16 · ~175 lines · wave 1 · depends on: O-6
- Files: `components/onboarding/WelcomeWizard.tsx`, `components/ui/wizard.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `10-first-run-and-empty-states-welcome-1-connect-light-1440x900.png` · After: `screens/O-8/` same names
- Accept: One local computer: flow is Agents then Projects with a two-chip stepper.
- Tests: `vp test run apps/web/src/components/onboarding/WelcomeWizard.import.browser.test.tsx` · `vp lint apps/web/src/components/onboarding/WelcomeWizard.tsx apps/web/src/components/ui/wizard.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - stepper chip count changes when the user opts into the Computers step · upstream: no: flow change needs maintainer decision · #24865: independent

##### O-9 Agents step: Check again and zero-ready state

- Findings: F-24-07, F-10-15 · ~70 lines · wave 1 · depends on: none
- Files: `components/onboarding/WelcomeWizard.tsx`, `components/chat/ChatComposer.tsx`, `components/settings/ProviderSettingsPanel.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png` · After: `screens/O-9/` same names
- Accept: "Checked just now" + refresh; one refresh on window focus; Continue is outline with a note when no agent is ready.
- Tests: `vp test run apps/web/src/components/settings/ProviderSettingsPanel.logic.test.ts` · `vp lint apps/web/src/components/onboarding/WelcomeWizard.tsx apps/web/src/components/chat/ChatComposer.tsx apps/web/src/components/settings/ProviderSettingsPanel.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Extracting `ProviderLastChecked` touches the Providers panel file · upstream: yes, after #24865 merges · #24865: rebase after merge: ChatComposer.tsx

##### O-10 Agents step lists other agents

- Findings: F-24-03 (P1) · ~55 lines · wave 2 · depends on: O-9
- Files: `components/settings/CodexSetupSection.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `settings-providers-default-light-1440x900.png` · After: `screens/O-10/` same names
- Accept: "Other agents" row links to Providers and returns to `/welcome#agents:<id>`.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/CodexSetupSection.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `WelcomeWizard.import.browser.test.tsx` renders the wizard · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### O-11 Agents step states the default permission mode

- Findings: F-24-04 (P1) · ~55 lines · wave 2 · depends on: O-9
- Files: `components/onboarding/WelcomeWizard.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `settings-general-default-light-1440x900.png` · After: `screens/O-11/` same names
- Accept: A collapsed disclosure shows "Full access" with a Change control over `runtimeModeConfig`; default unchanged.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/onboarding/WelcomeWizard.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `defaultRuntimeMode` is a project-scoped server setting (`settings.ts:958`) · upstream: yes: touches wizard files that #24865 does not · #24865: independent

##### O-12 Projects step with nothing to import

- Findings: F-10-07 (P1), F-24-08 · ~70 lines · wave 1 · depends on: O-6
- Files: `components/onboarding/WelcomeWizard.tsx`, `components/NoProjectsHero.tsx`, `onboarding/projectImport.logic.ts`
- Before: `welcome-default-{dark,light}-1440x900.png` · After: `screens/O-12/` same names
- Accept: Zero candidates: Continue is enabled, "Add a project..." opens the add-project palette, exit reads "Skip import".
- Tests: `vp test run apps/web/src/onboarding/projectImport.logic.test.ts apps/web/src/components/onboarding/WelcomeWizard.import.browser.test.tsx` · `vp lint apps/web/src/components/onboarding/WelcomeWizard.tsx apps/web/src/components/NoProjectsHero.tsx apps/web/src/onboarding/projectImport.logic.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `WelcomeWizard.import.browser.test.tsx` covers import states · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### O-13 Import progress and readable import rows

- Findings: F-24-09, F-10-13, F-10-14 · ~45 lines · wave 0 · depends on: none
- Files: `components/onboarding/WelcomeWizard.tsx`
- Before: `welcome-default-{dark,light}-{1440x900,390x844}.png`; cited `10-first-run-and-empty-states-welcome-3-import-masked-light-1440x900.png`, `10-first-run-and-empty-states-welcome-3-import-masked-dark-390x844.png` · After: `screens/O-13/` same names
- Accept: Import shows "Importing N of M..." (`role="status"`); rows carry labels and do not truncate to six characters at 390 px.
- Tests: `vp test run apps/web/src/components/onboarding/WelcomeWizard.import.browser.test.tsx` · `vp lint apps/web/src/components/onboarding/WelcomeWizard.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `WelcomeWizard.import.browser.test.tsx` covers import · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### O-14 Way back to setup and release notes

- Findings: F-10-02 (P1), F-24-16 (P3) · ~70 lines · wave 1 · depends on: none
- Files: `branding.ts`, `components/CommandPalette.tsx`, `components/NoProjectsHero.tsx`, `components/desktopUpdate.toast.tsx`, `components/settings/SettingsPanels.tsx`, `components/settings/settingsSearch.ts` (+1)
- Before: `settings-general-default-{dark,light}-1440x900.png`; cited `10-first-run-and-empty-states-no-projects-hero-light-1440x900.png` · After: `screens/O-14/` same names
- Accept: Settings > General > About has "Setup" and "Release notes"; palette has "Open setup".
- Tests: `vp test run apps/web/src/components/CommandPalette.logic.test.ts apps/web/src/components/desktopUpdate.logic.test.ts apps/web/src/components/settings/SettingsPanels.logic.test.ts apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/web/src/branding.ts apps/web/src/components/CommandPalette.tsx apps/web/src/components/NoProjectsHero.tsx apps/web/src/components/desktopUpdate.toast.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - The wizard remounts with `onDone` · upstream: yes, after #24865 merges · #24865: rebase after merge: SettingsPanels.tsx, settingsSearch.ts

##### O-15 Telemetry notice names the real opt-out

- Findings: F-24-11 · ~15 lines · wave 1 · depends on: none
- Files: `components/onboarding/WelcomeWizard.tsx`, `components/settings/SettingsPanels.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png` · After: `screens/O-15/` same names
- Accept: The first-screen sentence names `T3CODE_TELEMETRY_ENABLED=false` in mono and links the docs; no toggle implied.
- Tests: `vp test run apps/web/src/components/settings/SettingsPanels.logic.test.ts` · `vp lint apps/web/src/components/onboarding/WelcomeWizard.tsx apps/web/src/components/settings/SettingsPanels.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Copy only · upstream: no: policy copy, maintainer wording · #24865: rebase after merge: SettingsPanels.tsx

##### O-16 One pairing explainer in three surfaces

- Findings: F-24-12 · ~110 lines (adjusted from 55) · wave 2 · depends on: CP-1
- Files: `mobile:src/features/connection/ConnectionsNewRouteScreen.tsx`, `components/HostedEmptyState.tsx`, `components/onboarding/WelcomeWizard.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png` · After: `screens/O-16/` same names
- Accept: Wizard, hosted page and mobile use the same three-step list and the word "computer".
- Tests: no existing test beside these files · `vp lint apps/mobile/src/features/connection/ConnectionsNewRouteScreen.tsx apps/web/src/components/HostedEmptyState.tsx apps/web/src/components/onboarding/WelcomeWizard.tsx` · `vp run --filter @t3tools/mobile typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Overlaps `extoci`'s copy PRs (#24147 to #24150) and the hosted page tests · upstream: yes: after aligning with #24150 · #24865: independent

##### O-17 Mobile first launch names the computer; no dead end on "No projects"

- Findings: F-24-01 (P1), F-24-02 (P1) · ~70 lines · wave 2 · depends on: CP-1
- Files: `mobile:src/features/home/HomeScreen.tsx`
- Before: `home-default-{dark,light}-390x844.png` · After: `screens/O-17/` same names
- Accept: Mobile Home reads "No computer connected" with three steps and FAB "Connect a computer"; "No projects yet" has "Add project".
- Tests: no existing test beside these files · `vp lint apps/mobile/src/features/home/HomeScreen.tsx` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Strings are not asserted in mobile tests (searched) · upstream: yes: copy plus one list · #24865: independent
- Note: Align with #24150.

### 13.11 Mobile (17 chunks)

Phone-width web, touch targets and the native app (iOS verified on simulator; Android code-read only).

##### M-1 Thread row actions reachable on touch-only web

- Findings: F-02-04 (P1) · ~160 lines · wave 1 · depends on: #24865
- Files: `components/Sidebar.tsx`, `components/sidebar/SidebarThreadRow.tsx`, `index.css`
- Before: `home-default-{dark,light}-390x844.png`; cited `02-thread-list-touch-no-actions-dark-390x844.png` · After: `screens/M-1/` same names
- Accept: Under `any-hover: none` each row has a "Thread actions" button; Settle, Snooze, Wake and Un-settle are reachable.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts apps/web/src/components/Sidebar.pointer.browser.test.tsx` · `vp lint apps/web/src/components/Sidebar.tsx apps/web/src/components/sidebar/SidebarThreadRow.tsx apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Status slot width on 390px sheet (project name truncates sooner) · upstream: yes, after #24865 merges · #24865: rebase after merge: Sidebar.tsx, SidebarThreadRow.tsx, index.css

##### M-2 Phone-width headers: Authorized clients, Usage, Open diff

- Findings: F-11-14 (P1), F-09-33, F-03-23 · ~85 lines · wave 0 · depends on: none
- Files: `components/chat/ChangedFilesTree.tsx`, `components/settings/FoldedSettingsSection.tsx`, `components/usage/UsagePage.tsx`
- Before: `home-default-{dark,light}-390x844.png`, `settings-general-default-{dark,light}-390x844.png`; cited `11-connections-authorized-open-light-390x844.png`, `11-multi-env-offline-dark-390x844.png` (+3) · After: `screens/M-2/` same names
- Accept: At 390x844 headers do not overlap their titles; Usage header reads a title and period; Open diff has a text label.
- Tests: `vp test run apps/web/src/components/usage/usagePagePreferences.test.ts` · `vp lint apps/web/src/components/chat/ChangedFilesTree.tsx apps/web/src/components/settings/FoldedSettingsSection.tsx apps/web/src/components/usage/UsagePage.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `FoldedSettingsSection` is also used by Load balancing · upstream: yes: fix-shaped, no #24865 overlap; bundle: 3 carve-out PRs possible · #24865: independent

##### M-3 Provider settings at phone and tablet width: selection and list titles

- Findings: F-09-01 (P1), F-09-04 (P1) · ~110 lines · wave 0 · depends on: none
- Files: `components/settings/ProviderSettingsPanel.tsx`, `components/settings/ProviderInstanceCard.tsx`
- Before: `settings-providers-default-{dark,light}-1440x900.png`; cited `09-providers-narrow-after-select-light-1024x640.png`, `09-providers-narrow-detail-light-1024x640.png` (+4) · After: `screens/M-3/` same names
- Accept: Selecting a provider shows its editor below 1100 px; list titles do not truncate to "Cl...".
- Tests: `vp test run apps/web/src/components/settings/ProviderSettingsPanel.logic.test.ts apps/web/src/components/settings/ProviderInstanceCard.test.ts apps/web/src/components/settings/ProviderSettingsPanel.environment.browser.test.tsx` · `vp lint apps/web/src/components/settings/ProviderSettingsPanel.tsx apps/web/src/components/settings/ProviderInstanceCard.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `ProviderSettingsPanel.environment.browser.test.tsx` renders the panel · upstream: yes: small, fix-shaped · #24865: independent

##### M-4 Phone composer strip keeps the permission chip and model name

- Findings: F-04-22 (P1), F-04-23, F-04-24 · ~230 lines · wave 1 · depends on: #24865
- Files: `components/chat/ComposerControlsBar.tsx`, `components/chat/CompactComposerControlsMenu.tsx`, `components/chat/restingComposerControlsMeasurement.ts`, `components/chat/useRestingComposerControlsLayout.ts`
- Before: `new-thread-default-{dark,light}-{390x844,800x600}.png`; cited `04-thread-composer-light-800x600.png`, `04-mobile-draft-hero-light-390x844.png` (+4) · After: `screens/M-4/` same names
- Accept: Permission chip stays at 390 px (effort collapses first); model shows its name; the overflow menu keeps descriptions and icons.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/ComposerControlsBar.tsx apps/web/src/components/chat/CompactComposerControlsMenu.tsx apps/web/src/components/chat/restingComposerControlsMeasurement.ts apps/web/src/components/chat/useRestingComposerControlsLayout.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - restingComposerControlsMeasurement.ts and useRestingComposerControlsLayout.ts take block order from resti · upstream: yes, after #24865 merges · #24865: rebase after merge: ComposerControlsBar.tsx

##### M-5 Settings nav below 768 px is labelled and reachable

- Findings: F-07-06 (P1) · ~55 lines · wave 1 · depends on: #24865
- Files: `components/settings/SettingsSidebarNav.tsx`, `components/ui/sidebar.tsx`
- Before: `settings-general-default-{dark,light}-390x844.png` · After: `screens/M-5/` same names
- Accept: The icon rail has labels or tooltips, >= 44 px targets and >= 4.5:1 icons.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/SettingsSidebarNav.tsx apps/web/src/components/ui/sidebar.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Tooltips are hover-only · upstream: yes, after #24865 merges · #24865: rebase after merge: SettingsSidebarNav.tsx

##### M-6 Touch: tapping a tab icon no longer closes the tab

- Findings: F-06-08 (P1) · ~55 lines · wave 1 · depends on: none
- Files: `components/ui/button.tsx`
- Before: `thread-codex-edits-default-{dark,light}-390x844.png` · After: `screens/M-6/` same names
- Accept: On touch the X is visible; tapping the icon activates the tab.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/button.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - chip width +20 px on touch · upstream: yes, after #24865 merges · #24865: rebase after merge: button.tsx

##### M-7 Touch targets for Send, Stop, Resume and the toast dismiss orb

- Findings: F-04-18, F-12-23 · ~30 lines · wave 2 · depends on: T1, #24865
- Files: `components/chat/ComposerControl.tsx`, `components/chat/ComposerPrimaryActions.tsx`, `components/ui/toast.tsx`
- Before: `new-thread-default-{dark,light}-390x844.png` · After: `screens/M-7/` same names
- Accept: Send, Stop, Resume and toast controls are >= 44 px on coarse pointers with unchanged visuals.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/ComposerControl.tsx apps/web/src/components/chat/ComposerPrimaryActions.tsx apps/web/src/components/ui/toast.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Overlap with the attach button's hit area (probe after change) · upstream: yes, after #24865 merges · #24865: rebase after merge: ComposerControl.tsx, ComposerPrimaryActions.tsx

##### M-8 Mobile radius ladder

- Findings: F-18-05 · ~300 lines (adjusted from 160) · wave 0 · depends on: none
- Files: `mobile:global.css`, `mobile:src/features/threads/git/GitBranchesSheet.tsx`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/M-8/` same names + simulator capture (`xcrun simctl io`)
- Accept: `@theme` defines sheet 28, card 24, card-sm 20, control 14; 106 arbitrary radii migrate.
- Tests: no existing test beside these files · `vp lint apps/mobile/global.css apps/mobile/src/features/threads/git/GitBranchesSheet.tsx` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - no test covers native radii · upstream: yes: mobile-only · #24865: independent
- Note: Native app: iOS captures from the simulator.

##### M-9 Native navigation stack crash and iPad/Android chrome

- Findings: F-15-01 (P1) · ~55 lines · wave 0 · depends on: none
- Files: `mobile:src/Stack.tsx`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/M-9/` same names + simulator capture (`xcrun simctl io`)
- Accept: No RNScreens "Stack should never be empty" crash in the repro; iPad sidebar tabs stay on the tapped tab (BORROW #20144).
- Tests: no existing test beside these files · `vp lint apps/mobile/src/Stack.tsx` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - touches the shared native stack patch · upstream: no: crash needs a reproduction on a device build first · #24865: independent
- Note: BORROW #20144, #24541, #22742.

##### M-10 Native search: closing clears the query

- Findings: F-15-02 (P1), F-15-13 · ~70 lines · wave 0 · depends on: none
- Files: `mobile:src/features/workspace/WorkspaceToolbar.ios.tsx`
- Before: cited `15-mobile-home-search-closed-query-persists-light-iphone17.png`, `15-mobile-settings-archive-light-iphone17.png` · After: `screens/M-10/` same names + simulator capture (`xcrun simctl io`)
- Accept: Closing search clears the filter; the archived search field clears the tab bar.
- Tests: `vp test run apps/mobile/src/features/workspace/workspace-tabs-state.test.ts` · `vp lint apps/mobile/src/features/workspace/WorkspaceToolbar.ios.tsx` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `workspace-tabs-state.test.ts` covers the reducer · upstream: yes: fix-shaped, no #24865 overlap; bundle: 2 carve-out PRs possible · #24865: independent

##### M-11 Native tab bar and compose button clear the composer

- Findings: F-15-03 (P1) · ~55 lines · wave 0 · depends on: none
- Files: `mobile:src/features/workspace/useSystemWorkspaceTabBar.ts`
- Before: cited `15-mobile-offline-thread-view-light-iphone17.png` · After: `screens/M-11/` same names + simulator capture (`xcrun simctl io`)
- Accept: Opening a thread from the workspace tab hides the floating tab bar; iOS header insets hold (BORROW #21548, #23797, #22550, #22420, #22417, #22418).
- Tests: no existing test beside these files · `vp lint apps/mobile/src/features/workspace/useSystemWorkspaceTabBar.ts` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - iPad sidebar tabs (`WorkspaceSidebarTabs.ios.tsx`) must keep their bar · upstream: yes: follow #24666 owner · #24865: independent

##### M-12 Add environment: error visible above the keyboard; disabled environment copy

- Findings: F-15-06 (P1), F-15-12 · ~110 lines · wave 0 · depends on: none
- Files: `mobile:src/features/home/HomeScreen.tsx`, `pkg:client-runtime/src/connection/errors.ts`
- Before: cited `15-mobile-add-env-bad-code-submitted-light-iphone17.png`, `15-mobile-home-offline-env-disabled-light-iphone17.png` · After: `screens/M-12/` same names + simulator capture (`xcrun simctl io`)
- Accept: The error shows above the keyboard and says what to do; a disabled environment reads "Disabled", with an enable CTA.
- Tests: `vp test run packages/client-runtime/src/connection/errors.test.ts apps/mobile/src/features/home/workspace-connection-status.test.ts` · `vp lint apps/mobile/src/features/home/HomeScreen.tsx packages/client-runtime/src/connection/errors.ts` · `vp run --filter @t3tools/mobile typecheck` ; `vp run --filter @t3tools/client-runtime typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - error string may be asserted in `client-runtime` tests · upstream: yes: fix-shaped, no #24865 overlap; bundle: 2 carve-out PRs possible · #24865: independent

##### M-13 Native composer: keyboard dismiss, readable disabled Send, model visible

- Findings: F-15-07, F-15-08, F-15-11 · ~85 lines · wave 0 · depends on: none
- Files: `mobile:src/components/ComposerModelControl.tsx`, `mobile:src/components/ComposerToolbar.tsx`, `mobile:src/features/threads/ThreadComposer.tsx`, `mobile:src/features/threads/ThreadFeed.tsx`
- Before: cited `15-mobile-long-thread-after-drag-down-light-iphone17.png`, `15-mobile-thread-capitalize-end-light-iphone17.png` (+1) · After: `screens/M-13/` same names + simulator capture (`xcrun simctl io`)
- Accept: Dragging the chat dismisses the keyboard (BORROW #24484); disabled Send is >= 3:1 (BORROW #23155); collapsed composer shows the model.
- Tests: `vp test run apps/mobile/src/features/threads/composerSendPresentation.test.ts` · `vp lint apps/mobile/src/components/ComposerModelControl.tsx apps/mobile/src/components/ComposerToolbar.tsx apps/mobile/src/features/threads/ThreadComposer.tsx apps/mobile/src/features/threads/ThreadFeed.tsx` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - LegendList scroll anchoring while the keyboard animates (#22350 family) · upstream: yes: fix-shaped, no #24865 overlap; bundle: 3 carve-out PRs possible · #24865: independent
- Note: Absorbs BORROW #22843, #21691.

##### M-14 Native sizes: 44 pt targets, Dynamic Type ceiling, busy rows

- Findings: F-15-09, F-15-10, F-15-15 · ~125 lines · wave 0 · depends on: none
- Files: `mobile:src/components/ui/ListRowLayout.tsx`, `mobile:src/features/terminal/ThreadTerminalRouteScreen.tsx`, `mobile:src/features/threads/thread-list-v2-items.tsx`, `mobile:src/features/threads/thread-row-emphasis.ts`
- Before: cited `15-mobile-appearance-dyntype-ax5-themes-light-iphone17.png`, `15-mobile-settings-root-dyntype-ax5-light-iphone17.png` · After: `screens/M-14/` same names + simulator capture (`xcrun simctl io`)
- Accept: Targets >= 44 pt; settings rows and theme names survive Dynamic Type AX5; busy rows no longer fade to 55%.
- Tests: no existing test beside these files · `vp lint apps/mobile/src/components/ui/ListRowLayout.tsx apps/mobile/src/features/terminal/ThreadTerminalRouteScreen.tsx apps/mobile/src/features/threads/thread-list-v2-items.tsx apps/mobile/src/features/threads/thread-row-emphasis.ts` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - capsule width at 390 pt already truncates the title (see F-15-11) · upstream: yes: fix-shaped, no #24865 overlap; bundle: 3 carve-out PRs possible · #24865: independent
- Note: Absorbs BORROW #21383, #22568, #23401, #23688.

##### M-15 Native terminal: paste visible, Attach visible output above the keyboard

- Findings: F-15-14 · ~55 lines · wave 0 · depends on: none
- Files: `mobile:src/features/terminal/ThreadTerminalRouteScreen.tsx`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/M-15/` same names + simulator capture (`xcrun simctl io`)
- Accept: Paste key and Attach visible output stay on screen with the keyboard open.
- Tests: no existing test beside these files · `vp lint apps/mobile/src/features/terminal/ThreadTerminalRouteScreen.tsx` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - terminal key order is muscle memory · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### M-16 Provider accounts list all drivers with install state

- Findings: F-15-17 · ~160 lines · wave 0 · depends on: none
- Files: `mobile:src/features/settings/SettingsProviderAccountsRouteScreen.tsx`
- Before: cited `15-mobile-settings-provider-accounts-light-iphone17.png` · After: `screens/M-16/` same names + simulator capture (`xcrun simctl io`)
- Accept: Provider accounts lists every driver and shows install state.
- Tests: no existing test beside these files · `vp lint apps/mobile/src/features/settings/SettingsProviderAccountsRouteScreen.tsx` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - shares copy with web `components/settings/Provider*.tsx` (area 09 proposals) · upstream: no: broadens a screen; needs approval · #24865: independent

##### M-17 Provider model rows and touch targets at phone width

- Findings: F-09-02 (P1), F-09-03 (P1) · ~215 lines · wave 1 · depends on: M-3
- Files: `components/ui/menu.tsx`, `components/ui/switch.tsx`
- Before: `settings-providers-default-{dark,light}-1440x900.png`; cited `09-providers-claude-models-touch-light-390x844.png` · After: `screens/M-17/` same names + simulator capture (`xcrun simctl io`)
- Accept: Model rows are two-line with a menu for reorder instead of "Claud..."; list and model-row targets are >= 44 px and do not overlap.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/menu.tsx apps/web/src/components/ui/switch.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - existing handlers (`onToggleFavorite`, `onMove`, `onSetHidden`) are reused · upstream: yes, after #24865 merges · #24865: rebase after merge: menu.tsx

### 13.12 A11y (22 chunks)

Section 11: focus visibility, forced colours, semantics, keyboard operability and assistive-tech names.

##### A-1 Forced-colors: focus outline and Switch

- Findings: F-16-02 (P1), F-07-16 (P1) · ~30 lines · wave 1 · depends on: none
- Files: `components/ui/switch.tsx`, `index.css`
- Before: `settings-general-default-{dark,light}-1440x900.png`; cited `16-accessibility-forced-colors-focus-nofix-dark-300x120.png` · After: `screens/A-1/` same names + forced-colors emulation capture
- Accept: In `forced-colors: active` every `:focus-visible` shows a 2 px Highlight outline and the Switch shows track and thumb.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/switch.tsx apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · new: manual forced-colors capture (Chromium emulation)
- Model: Opus low · risk: low - only inside the media query · upstream: yes, after #24865 merges · #24865: rebase after merge: index.css

##### A-2 Forced-colors: selected tiles, theme orbs, open and selected rows

- Findings: F-07-17 (P1), F-02-25 · ~70 lines · wave 2 · depends on: A-1
- Files: `components/settings/ThemePreviewCircles.tsx`, `components/settings/ThemeSettings.tsx`, `components/settings/ThemeWireframe.tsx`
- Before: `settings-appearance-default-{dark,light}-1440x900.png`, `home-default-{dark,light}-1440x900.png`; cited `02-thread-list-forced-colors-1440x900.png` · After: `screens/A-2/` same names + forced-colors emulation capture
- Accept: Color scheme tiles, theme orbs and wireframes show borders and a distinct selected state; open and selected rows differ.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/ThemePreviewCircles.tsx apps/web/src/components/settings/ThemeSettings.tsx apps/web/src/components/settings/ThemeWireframe.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `ThemeSettings.tsx` cards carry the selected state through inline `style` · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### A-3 Missing focus rings: sidebar search, Add provider, question options

- Findings: F-16-03 (P1), F-09-05 (P1), F-03-29 · ~45 lines · wave 1 · depends on: none
- Files: `components/settings/ProviderInstanceCard.tsx`, `components/settings/ProviderSettingsPanel.tsx`, `components/sidebar/SidebarThreadHeader.tsx`, `components/ui/button.tsx`
- Before: `home-default-{dark,light}-1440x900.png`, `settings-providers-default-{dark,light}-1440x900.png` · After: `screens/A-3/` same names
- Accept: Each shows a 2 px inset `ring-ring` on `:focus-visible`.
- Tests: `vp test run apps/web/src/components/settings/ProviderInstanceCard.test.ts apps/web/src/components/settings/ProviderSettingsPanel.logic.test.ts` · `vp lint apps/web/src/components/settings/ProviderInstanceCard.tsx apps/web/src/components/settings/ProviderSettingsPanel.tsx apps/web/src/components/sidebar/SidebarThreadHeader.tsx apps/web/src/components/ui/button.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low · upstream: yes, after #24865 merges · #24865: rebase after merge: button.tsx

##### A-4 Branch picker has an accessible name

- Findings: F-16-04 (P1) · ~15 lines · wave 1 · depends on: none
- Files: `components/BranchToolbarBranchSelector.tsx`, `components/WorktreeBaseBranchPicker.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/A-4/` same names
- Accept: axe `button-name` passes; name reads "Branch, <name>".
- Tests: no existing test beside these files · `vp lint apps/web/src/components/BranchToolbarBranchSelector.tsx apps/web/src/components/WorktreeBaseBranchPicker.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - tests querying by role name "main" · upstream: yes, after #24865 merges · #24865: rebase after merge: BranchToolbarBranchSelector.tsx

##### A-5 Label-in-name and brand link name

- Findings: F-16-18, F-01-18 · ~70 lines · wave 0 · depends on: none
- Files: `components/sidebar/SidebarChrome.tsx`, `components/LegacySidebar.tsx`, `components/Sidebar.logic.ts`, `routes/_chat.index.tsx`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/A-5/` same names
- Accept: axe `label-content-name-mismatch` is 0 on a thread; the brand link name matches what the click does (BORROW #24209).
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/sidebar/SidebarChrome.tsx apps/web/src/components/LegacySidebar.tsx apps/web/src/components/Sidebar.logic.ts apps/web/src/routes/_chat.index.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `Sidebar.logic.test.ts` asserts label strings · upstream: yes: logo alone matches #24209; bundle: 2 carve-out PRs possible · #24865: independent

##### A-6 Keyboard highlight is visible in every popup list

- Findings: F-16-01 (P1) · ~55 lines · wave 2 · depends on: T12
- Files: `index.css`, `main.tsx`
- Before: `command-palette-default-{dark,light}-1440x900.png` · After: `screens/A-6/` same names
- Accept: `html[data-input="keyboard"]` plus a 2 px inset ring on highlighted items; highlight >= 3:1.
- Tests: no existing test beside these files · `vp lint apps/web/src/index.css apps/web/src/main.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - item radius `rounded-sm` (6px) vs inset ring · upstream: yes, after #24865 merges · #24865: rebase after merge: index.css, main.tsx

##### A-7 `prefers-contrast` and a forced-colors theme

- Findings: F-16-12 · ~55 lines · wave 2 · depends on: A-1
- Files: `hooks/useTheme.ts`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/A-7/` same names + forced-colors emulation capture
- Accept: prefers-contrast: more raises borders and text; forced-colors uses system colours.
- Tests: no existing test beside these files · `vp lint apps/web/src/hooks/useTheme.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - boot script parity (`themeBoot.test.ts`) only covers theme keys, not contrast · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### A-8 Palette and model picker semantics

- Findings: F-16-15 · ~55 lines · wave 0 · depends on: none
- Files: `components/ui/command.tsx`
- Before: `command-palette-default-{dark,light}-1440x900.png`, `new-thread-default-{dark,light}-1440x900.png` · After: `screens/A-8/` same names
- Accept: Listbox/dialog names, combobox `aria-expanded`, selected state exposed (axe clean).
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/command.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `CommandPalette*.test.tsx` query options by name incl · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### A-9 Approval and question: shortcut, focus move, tab order, announced answers

- Findings: F-16-21 · ~55 lines · wave 0 · depends on: none
- Files: `components/chat/ComposerPendingApprovalActions.tsx`, `components/chat/ComposerPendingApprovalPanel.tsx`, `components/chat/threadActivityAnnouncement.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `03-approval-pending-dark-1440x900.png` · After: `screens/A-9/` same names
- Accept: Approval banner takes focus on appear; Tab order starts at the banner; typed answer moved aside is announced (BORROW #24331).
- Tests: `vp test run apps/web/src/components/chat/threadActivityAnnouncement.test.ts` · `vp lint apps/web/src/components/chat/ComposerPendingApprovalActions.tsx apps/web/src/components/chat/ComposerPendingApprovalPanel.tsx apps/web/src/components/chat/threadActivityAnnouncement.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - focus theft while typing (guard on empty composer) · upstream: no: touches the approval flow; needs maintainer view · #24865: independent

##### A-10 Thread list context menu has menu semantics

- Findings: F-02-05 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `contextMenuFallback.ts`
- Before: `home-default-{dark,light}-1440x900.png`; cited `02-thread-list-context-menu-dark-1440x900.png` · After: `screens/A-10/` same names
- Accept: `role=menu`, arrow keys, focus, Esc return; submenu near the right edge flips (BORROW #23666).
- Tests: `vp test run apps/web/src/contextMenuFallback.test.ts` · `vp lint apps/web/src/contextMenuFallback.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `contextMenuFallback.test.ts` exists · upstream: yes: file untouched by #24865; single concern · #24865: independent

##### A-11 Thread rows: one tab stop, roving focus, state in the name

- Findings: F-02-06 (P1), F-02-07 (P1) · ~215 lines · wave 1 · depends on: A-10, #24865
- Files: `components/sidebar/SidebarThreadRow.tsx`, `components/Sidebar.logic.ts`, `components/Sidebar.tsx`, `keybindings.ts`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/A-11/` same names
- Accept: One tab stop per list; Up/Down move rows; accessible name carries pinned, section, branch, time and state.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts apps/web/src/keybindings.test.ts apps/web/src/components/Sidebar.pointer.browser.test.tsx` · `vp lint apps/web/src/components/sidebar/SidebarThreadRow.tsx apps/web/src/components/Sidebar.logic.ts apps/web/src/components/Sidebar.tsx apps/web/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Interacts with dnd-kit sensor and `useSidebarRowSubscriptionLease` · upstream: yes, after #24865 merges · #24865: rebase after merge: SidebarThreadRow.tsx, Sidebar.tsx

##### A-12 Right-panel tabs are tabs; hit area and focus on the tab

- Findings: F-06-07 (P1), F-06-13 · ~215 lines · wave 0 · depends on: none
- Files: `components/RightPanelTabs.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/A-12/` same names
- Accept: `role=tablist/tab/tabpanel`, arrow keys, 24 px hit area, focus survives close.
- Tests: `vp test run apps/web/src/components/RightPanelTabs.test.tsx` · `vp lint apps/web/src/components/RightPanelTabs.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - dnd-kit listeners on the chip · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### A-13 Opening the diff by shortcut moves focus into the panel

- Findings: F-16-16 · ~160 lines · wave 1 · depends on: A-12
- Files: `components/RightPanelTabs.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/A-13/` same names
- Accept: After the shortcut, focus lands in the panel; Esc returns to the composer.
- Tests: `vp test run apps/web/src/components/RightPanelTabs.test.tsx` · `vp lint apps/web/src/components/RightPanelTabs.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - dnd-kit sortable listeners on the same node · upstream: no: focus-moving behaviour change · #24865: independent

##### A-14 Terminal and drawer expose labels and roles

- Findings: F-06-06 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `components/ThreadTerminalDrawer.tsx`, `terminal/ghostty/surface.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/A-14/` same names
- Accept: Terminal drawer has region, labelled actions; screen-reader tree lists tabs.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/terminal/ghostty/surface.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/terminal/ghostty/surface.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - new keybinding command touches `packages/contracts/src/keybindings.ts` · upstream: no: new command and region · #24865: independent

##### A-15 Terminal output mirror for assistive tech

- Findings: F-16-05 (P1) · ~420 lines · wave 1 · depends on: A-14
- Files: `terminal/ghostty/surface.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/A-15/` same names
- Accept: A visually hidden live text mirror of recent output; throttled; off by default for performance.
- Tests: `vp test run apps/web/src/terminal/ghostty/surface.test.ts` · `vp lint apps/web/src/terminal/ghostty/surface.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - perf (DNA-P1): build the mirror lazily on first focus of the log, not per frame · upstream: no: needs approval and the ghostty text API · #24865: independent

##### A-16 Settings nav and content are keyboard-operable

- Findings: F-07-03, F-07-04, F-07-05, F-07-07, F-07-21 · ~300 lines · wave 1 · depends on: none
- Files: `components/settings/SettingsSidebarNav.tsx`, `components/settings/SettingsPanels.tsx`, `components/settings/ThemePreviewCircles.tsx`, `components/settings/ThemeSettings.tsx`, `components/settings/settingsLayout.tsx`, `components/settings/settingsSearch.ts` (+1)
- Before: `settings-general-default-{dark,light}-1440x900.png`, `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/A-16/` same names
- Accept: Arrow keys in the nav; `aria-current`; Diagnostics highlights; content scrolls by keyboard on open; theme cards are a radio group.
- Tests: `vp test run apps/web/src/components/settings/SettingsPanels.logic.test.ts apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/web/src/components/settings/SettingsSidebarNav.tsx apps/web/src/components/settings/SettingsPanels.tsx apps/web/src/components/settings/ThemePreviewCircles.tsx apps/web/src/components/settings/ThemeSettings.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Search-result mode (`:308-339`) already uses `aria-activedescendant` · upstream: yes, after #24865 merges · #24865: rebase after merge: SettingsSidebarNav.tsx, SettingsPanels.tsx, settingsLayout.tsx

##### A-17 Resize handles: hover, focus, keyboard, reset

- Findings: F-01-09, F-06-15 · ~215 lines (adjusted from 110) · wave 0 · depends on: none
- Files: `components/AppSidebarLayout.tsx`, `components/ThreadTerminalDrawer.tsx`, `components/preview/RightPanelResizeHandle.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/A-17/` same names
- Accept: Both handles take focus and Left/Right resize; double-click resets; titles say so.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts` · `vp lint apps/web/src/components/AppSidebarLayout.tsx apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/components/preview/RightPanelResizeHandle.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - the rail doubles as the collapse toggle when closed (`ui/sidebar.tsx:486-490`) · upstream: no: new interaction; needs maintainer approval · #24865: independent

##### A-18 Review comments can be started from the keyboard

- Findings: F-05-05 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `components/diffs/AnnotatableCodeView.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/A-18/` same names
- Accept: A shortcut on a focused diff line opens the comment box; Esc closes.
- Tests: `vp test run apps/web/src/components/diffs/AnnotatableCodeView.browser.test.tsx` · `vp lint apps/web/src/components/diffs/AnnotatableCodeView.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - depends on Pierre emitting selection changes for programmatic `selectedLines` (the prop is already... · upstream: yes: accessibility fix · #24865: independent

##### A-19 Provider list is arrow-key navigable

- Findings: F-09-06 · ~55 lines · wave 0 · depends on: none
- Files: `components/settings/ProviderInstanceCard.tsx`
- Before: `settings-providers-default-{dark,light}-1440x900.png` · After: `screens/A-19/` same names
- Accept: Up/Down moves the list; the editor is one Tab away.
- Tests: `vp test run apps/web/src/components/settings/ProviderInstanceCard.test.ts` · `vp lint apps/web/src/components/settings/ProviderInstanceCard.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - handler must ignore events from the switch and advisory buttons... · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### A-20 Errors announce assertively

- Findings: F-12-17 · ~55 lines · wave 1 · depends on: S-1
- Files: (audit names no file; locate from the finding Evidence)
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/A-20/` same names
- Accept: Error toasts use `priority: "high"` and are announced; F6 focus path documented.
- Tests: no existing test beside these files · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - assertive announcements for many errors could be noisy · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### A-21 Native diff and thread rows for VoiceOver and TalkBack

- Findings: F-15-04 (P1), F-15-05 (P1) · ~215 lines · wave 0 · depends on: none
- Files: `mobile:modules/t3-review-diff/android/src/main/java/expo/modules/t3reviewdiff/T3ReviewDiffView.kt`, `mobile:src/features/threads/threadListV2.ts`
- Before: cited `15-mobile-review-diff-capitalize-light-iphone17.png` · After: `screens/A-21/` same names + simulator capture
- Accept: Diff view exposes files and hunks; thread rows announce state, project and time; iOS env buttons named (ADOPT #23740).
- Tests: `vp test run apps/mobile/src/features/threads/threadListV2.test.ts` · `vp lint apps/mobile/src/features/threads/threadListV2.ts` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - large virtualised lists: expose only rows in the visible window · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: Code from #23740 by `only21mil`.

##### A-22 Held: owner calls on focus ring and bubble label

- Findings: F-16-07, F-16-20 · ~0 lines (no code) · wave 1 · depends on: #24865
- Files: none (no code)
- Before: `new-thread-default-{dark,light}-1440x900.png` · After: `screens/A-22/` same names
- Accept: No code until the owner decides (section 15): composer focus ring and user-bubble label contrast.
- Tests: none (no code)
- Model: Opus low · risk: low - touches the owner's "neutral controls" call · upstream: no: conflicts with the PR; decision first · #24865: conflicts with #24865

### 13.13 Motion (9 chunks)

Section 9: reduced motion, durations and easing, hand-rolled loops, mobile motion tokens.

##### MO-1 Global reduced-motion rule (and in-app mirror hook)

- Findings: F-19-02, F-16-13, F-12-16, F-01-31 (P3) · ~60 lines · wave 1 · depends on: none
- Files: `index.css`, `components/AppRouteModal.tsx`, `components/ui/dialog-styles.ts`, `components/ui/sheet.tsx`, `components/ui/toast.tsx`, `panelAnimations.ts`
- Before: `command-palette-default-{dark,light}-1440x900.png` · After: `screens/MO-1/` same names + short .webm of the timing
- Accept: Under `prefers-reduced-motion: reduce` the palette, popover, tooltip, switch, toast and backdrop report zero non-zero transition durations; idle `getAnimations()` stays 0.
- Tests: no existing test beside these files · `vp lint apps/web/src/index.css apps/web/src/components/AppRouteModal.tsx apps/web/src/components/ui/dialog-styles.ts apps/web/src/components/ui/sheet.tsx ...` · `vp run --filter @t3tools/web typecheck` · new: browser census under reducedMotion: reduce
- Model: Opus low · risk: low - Base UI close waits for transitions · upstream: yes, after #24865 merges and Ideas draft 3 is acknowledged (global behaviour change) · #24865: rebase after merge: index.css

##### MO-2 Settings and Usage modal enter animation

- Findings: F-19-01 · ~15 lines · wave 0 · depends on: none
- Files: `components/AppRouteModal.tsx`, `components/chat/ComposerStashBadge.tsx`, `components/ui/dialog-styles.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/MO-2/` same names + short .webm of the timing
- Accept: Route modal fades/scales in over 200 ms; none under reduced motion.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/AppRouteModal.tsx apps/web/src/components/chat/ComposerStashBadge.tsx apps/web/src/components/ui/dialog-styles.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `settingsLayout.tsx:130-140` waits on `data-starting-style` for scroll targeting · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### MO-3 Toast timings: 200 ms transform, 150 ms opacity

- Findings: F-19-03 · ~15 lines · wave 2 · depends on: MO-1
- Files: `components/ui/toast.tsx`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/MO-3/` same names + short .webm of the timing
- Accept: Stack moves for 200 ms, exits 150 ms ease-in.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/toast.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - swipe-to-dismiss uses `--toast-swipe-movement-*` through the same transform · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### MO-4 Send button hover scale gets `transition-[...]` and a reduced-motion branch

- Findings: F-04-19 · ~15 lines · wave 1 · depends on: #24865
- Files: `components/chat/ComposerAttachmentStrip.tsx`, `components/chat/ComposerControl.tsx`, `components/chat/ComposerPrimaryActions.tsx`
- Before: `new-thread-default-{dark,light}-1440x900.png` · After: `screens/MO-4/` same names + short .webm of the timing
- Accept: Send scales only under `motion-safe` and no longer uses `transition-all`.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/ComposerAttachmentStrip.tsx apps/web/src/components/chat/ComposerControl.tsx apps/web/src/components/chat/ComposerPrimaryActions.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Visual only · upstream: yes, after #24865 merges · #24865: rebase after merge: ComposerControl.tsx, ComposerPrimaryActions.tsx

##### MO-5 Shared Spinner replaces hand-rolled loops (ADOPT #22100)

- Findings: F-19-06, F-13-16, F-03-36 (P3), F-05-32 (P3) · ~60 lines · wave 1 · depends on: none
- Files: `components/ui/spinner.tsx`, `components/chat/ThreadLineageWorkflowRow.tsx`, `components/chat/ThreadRelationshipsControl.tsx`, `components/chat/TimelineAssistantRows.tsx`, `pierre-tree-theme.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/MO-5/` same names + short .webm of the timing
- Accept: No `animate-spin` or `animate-pulse` in the four files; loops stop under reduced motion.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/spinner.tsx apps/web/src/components/chat/ThreadLineageWorkflowRow.tsx apps/web/src/components/chat/ThreadRelationshipsControl.tsx apps/web/src/components/chat/TimelineAssistantRows.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Spinner adds `role="status"` · upstream: yes, after #24865 merges · #24865: rebase after merge: ThreadRelationshipsControl.tsx
- Note: Code from #22100 by `saphid`.

##### MO-6 Skeleton bars animate once; spinners fade in

- Findings: F-13-11, F-13-12 · ~110 lines · wave 2 · depends on: MO-1
- Files: `components/DiffPanelShell.tsx`, `components/chat/ChatComposer.tsx`, `components/clerk/MobileClientsUserProfilePage.tsx`, `components/cloud/CloudEnvironmentConnectList.tsx`, `components/diffs/DiffFileLoadingBoundary.tsx`, `components/files/fileSurfaceChrome.tsx` (+4)
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/MO-6/` same names + short .webm of the timing
- Accept: One shimmer per skeleton group, 0 CSS animations on a settings page at idle; spinners appear after 150 ms.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/DiffPanelShell.tsx apps/web/src/components/chat/ChatComposer.tsx apps/web/src/components/clerk/MobileClientsUserProfilePage.tsx apps/web/src/components/cloud/CloudEnvironmentConnectList.tsx ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/client-runtime typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - visual parity (a container pulse also dims non-skeleton children: keep labels like "Totals" outside the... · upstream: yes, after #24865 merges · #24865: rebase after merge: ChatComposer.tsx

##### MO-7 Mobile: Android Remove animations leaves nothing invisible; MOBILE_MOTION tokens

- Findings: F-15-16, F-19-13 (P3) · ~110 lines · wave 0 · depends on: none
- Files: `mobile:src/components/ComposerToolbar.tsx`, `mobile:src/features/layout/workspace-pane-animation.ts`, `mobile:src/features/threads/ThreadComposer.tsx`, `mobile:src/features/threads/ThreadSettingsSheet.tsx`, `mobile:src/features/voice-input/ComposerDictationControl.tsx`, `mobile:src/features/voice-input/GlobalVoiceInputControl.tsx`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/MO-7/` same names + short .webm of the timing, simulator capture
- Accept: Composer buttons, sheet rows and the model picker are visible with animations removed; five animations use `MOBILE_MOTION` (ADOPT #23348, BORROW #21757, #23888).
- Tests: no existing test beside these files · `vp lint apps/mobile/src/components/ComposerToolbar.tsx apps/mobile/src/features/layout/workspace-pane-animation.ts apps/mobile/src/features/threads/ThreadComposer.tsx apps/mobile/src/features/threads/ThreadSettingsSheet.tsx ...` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - needs a real Android device or emulator · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: Code from #23348 by `unmanbearpig`.

##### MO-8 Menu/select enter, MorphIcon spring, four durations over 220 ms, inert class

- Findings: F-19-05 (P3), F-19-07 (P3), F-19-09 (P3), F-19-12 (P3) · ~60 lines · wave 2 · depends on: MO-1
- Files: `components/ConnectionStatusDot.tsx`, `components/MorphIcon.tsx`, `components/chat/ComposerAttachmentStrip.tsx`, `components/chat/ContextWindowMeter.tsx`, `components/cloud/CloudEnvironmentConnectList.tsx`, `components/settings/AuthorizedClientsSettings.tsx` (+2)
- Before: `command-palette-default-{dark,light}-1440x900.png` · After: `screens/MO-8/` same names + short .webm of the timing
- Accept: Menus scale-98 enter in 120 ms; MorphIcon settles <= 180 ms; no duration > 220 ms.
- Tests: `vp test run apps/web/src/components/chat/ContextWindowMeter.logic.test.ts` · `vp lint apps/web/src/components/ConnectionStatusDot.tsx apps/web/src/components/MorphIcon.tsx apps/web/src/components/chat/ComposerAttachmentStrip.tsx apps/web/src/components/chat/ContextWindowMeter.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low · upstream: yes, after #24865 merges · #24865: rebase after merge: menu.tsx

##### MO-9 Easing, panel exit and layout transitions inside the gate; highlight ring

- Findings: F-19-04 (P3), F-19-08 (P3), F-19-10 (P3), F-19-11 (P3) · ~220 lines · wave 3 · depends on: MO-8
- Files: `index.css`, `components/AppRouteModal.tsx`, `components/preview/PreviewPanelShell.tsx`, `components/settings/settingsLayout.tsx`, `components/ui/autocomplete.tsx`, `components/ui/combobox.tsx` (+6)
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/MO-9/` same names + short .webm of the timing
- Accept: Default ease-out, ease-in exits; panel gate covers small layout transitions; search highlight animates opacity once.
- Tests: no existing test beside these files · `vp lint apps/web/src/index.css apps/web/src/components/AppRouteModal.tsx apps/web/src/components/preview/PreviewPanelShell.tsx apps/web/src/components/settings/settingsLayout.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med · upstream: no: F-19-04 is a global feel change; open an issue first · #24865: rebase after merge: index.css, settingsLayout.tsx

### 13.14 Copy (10 chunks)

Section 10: terminology, casing, error voice and the guard test. Blocked chunks name the decision (D1, D2, D3) that unblocks them.

##### CP-1 One word for the machine behind a server

- Findings: F-20-04, F-11-20 · ~190 lines (adjusted from 110) · wave 1 · depends on: D1
- Files: `components/BranchToolbarEnvironmentSelector.tsx`, `components/chat/composerSend.logic.ts`, `components/chat/useComposerSend.ts`, `components/settings/SavedEnvironmentRows.tsx`
- Before: `settings-connections-default-{dark,light}-1440x900.png`, `welcome-default-{dark,light}-1440x900.png` · After: `screens/CP-1/` same names
- Accept: All user-facing strings use the chosen word (decision D1); machine/backend/host retired outside code.
- Tests: `vp test run apps/web/src/components/chat/composerSend.logic.test.ts` · `vp lint apps/web/src/components/BranchToolbarEnvironmentSelector.tsx apps/web/src/components/chat/composerSend.logic.ts apps/web/src/components/chat/useComposerSend.ts apps/web/src/components/settings/SavedEnvironmentRows.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: med - browser tests match several of these strings · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)
- Note: Blocked on decision D1 (section 15).

##### CP-2 Thread, not chat/conversation/task; branch, not ref

- Findings: F-20-05, F-20-07 · ~70 lines · wave 0 · depends on: none
- Files: `components/BranchPicker.tsx`, `components/BranchToolbar.logic.ts`, `components/DiffPanel.tsx`, `components/ThreadTerminalDrawer.tsx`, `components/chat/V2LifecycleRow.tsx`, `components/files/FileBrowserPanel.tsx`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/CP-2/` same names
- Accept: Strings use "thread" and "branch"; mobile "task" renamed.
- Tests: `vp test run apps/web/src/components/BranchToolbar.logic.test.ts apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/components/chat/V2LifecycleRow.logic.test.ts apps/web/src/components/GitActionsControl.logic.test.ts` · `vp lint apps/web/src/components/BranchPicker.tsx apps/web/src/components/BranchToolbar.logic.ts apps/web/src/components/DiffPanel.tsx apps/web/src/components/ThreadTerminalDrawer.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: low - mobile tests and any Maestro/E2E flows keyed on "New task" · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### CP-3 Credential vocabulary: token, link, code, client

- Findings: F-20-09 · ~55 lines · wave 2 · depends on: CP-1
- Files: `components/clerk/RemoveT3ConnectEnvironmentDialog.tsx`
- Before: `settings-connections-default-{dark,light}-1440x900.png` · After: `screens/CP-3/` same names
- Accept: One name per credential, one verb per undo.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/clerk/RemoveT3ConnectEnvironmentDialog.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: low - area 11 owns the pairing flows · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### CP-4 Keybinding labels read as sentences

- Findings: F-20-02 · ~55 lines · wave 1 · depends on: D3
- Files: `components/settings/KeybindingsSettings.logic.ts`, `components/settings/KeybindingsSettings.tsx`, `components/settings/settingsSearch.ts`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/CP-4/` same names
- Accept: Generated labels read "Thread: New without project"; docs updated in the same PR.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/web/src/components/settings/KeybindingsSettings.logic.ts apps/web/src/components/settings/KeybindingsSettings.tsx apps/web/src/components/settings/settingsSearch.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: low - `KeybindingsSettings.logic.test.ts:56` asserts conflict name "Terminal: Toggle" (unchanged) · upstream: yes, after #24865 merges · #24865: rebase after merge: settingsSearch.ts
- Note: Blocked on decision D3.

##### CP-5 One thread-state label set

- Findings: F-20-03 · ~55 lines · wave 1 · depends on: none
- Files: `components/Sidebar.logic.ts`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/CP-5/` same names
- Accept: Sidebar, hover card and aria use one label set; "Done" no longer collides with "settle".
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/Sidebar.logic.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `Sidebar.logic.test.ts` and thread-row browser tests assert labels · upstream: yes, after #24865 merges · #24865: independent

##### CP-6 Sentence case in headings, nav and settings descriptions

- Findings: F-20-06, F-17-07, F-08-38 · ~165 lines · wave 1 · depends on: D2
- Files: `components/settings/DiagnosticsSettings.tsx`, `components/settings/settingsSearch.ts`, `components/CommandPalette.logic.ts`, `components/pullRequest/PullRequestsColumn.tsx`, `components/settings/KeybindingsSettings.logic.ts`, `components/settings/ProjectDefaultsSettings.tsx` (+4)
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/CP-6/` same names
- Accept: No Title Case outside status pills and proper names; Source Control casing follows decision D2; plain-language descriptions (BORROW #24148).
- Tests: `vp test run apps/web/src/components/settings/settingsSearch.test.ts apps/web/src/components/CommandPalette.logic.test.ts apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/components/settings/SourceControlWritingSettings.browser.test.tsx` · `vp lint apps/web/src/components/settings/DiagnosticsSettings.tsx apps/web/src/components/settings/settingsSearch.ts apps/web/src/components/CommandPalette.logic.ts apps/web/src/components/pullRequest/PullRequestsColumn.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: med - settings-search ranking tests · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: settingsSearch.ts, ProjectDefaultsSettings.tsx

##### CP-7 Placeholders: compact, mobile and search match the main composer

- Findings: F-20-08 · ~15 lines · wave 1 · depends on: #24865
- Files: `mobile:src/features/threads/ThreadDetailScreen.tsx`, `components/chat/ChatComposer.tsx`, `composerPlaceholder.ts`
- Before: `new-thread-default-{dark,light}-1440x900.png` · After: `screens/CP-7/` same names
- Accept: Compact, mobile and search placeholders follow the one-placeholder rule.
- Tests: no existing test beside these files · `vp lint apps/mobile/src/features/threads/ThreadDetailScreen.tsx apps/web/src/components/chat/ChatComposer.tsx apps/web/src/composerPlaceholder.ts` · `vp run --filter @t3tools/mobile typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: low - composer browser tests that query placeholder text · upstream: yes, after #24865 merges · #24865: rebase after merge: ChatComposer.tsx, composerPlaceholder.ts

##### CP-8 Replace 94 stock "An error occurred." descriptions

- Findings: F-12-11 · ~420 lines · wave 2 · depends on: S-6
- Files: `components/CommandPalette.tsx`, `components/GitActionsControl.tsx`, `components/Sidebar.tsx`, `components/chat/MarkdownFileLink.tsx`, `components/preview/PreviewView.tsx`, `components/settings/ArchivedThreadsPanel.tsx` (+1)
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/CP-8/` same names
- Accept: No stock description remains; each names what failed and why (DNA-V3).
- Tests: `vp test run apps/web/src/components/CommandPalette.logic.test.ts apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/CommandPalette.tsx apps/web/src/components/GitActionsControl.tsx apps/web/src/components/Sidebar.tsx apps/web/src/components/chat/MarkdownFileLink.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - many `*.browser.test.tsx` assert exact strings ("An error occurred.") · upstream: yes, after #24865 merges (split first: over 300 lines) · #24865: rebase after merge: GitActionsControl.tsx, Sidebar.tsx, SettingsPanels.tsx

##### CP-9 Toast titles: one prefix, noun-last; no jargon in toasts

- Findings: F-12-12, F-12-13 · ~215 lines · wave 1 · depends on: S-1
- Files: `components/BranchToolbarBranchSelector.tsx`, `components/CommandPaletteThemeItems.tsx`, `components/GitActionsControl.tsx`, `components/LegacySidebar.tsx`, `components/chat/ChatComposer.tsx`, `components/chat/useComposerContextImport.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/CP-9/` same names
- Accept: No "Failed to"/"Unable to"/contractions in titles; "ref" and "Clipboard API unavailable" replaced.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts` · `vp lint apps/web/src/components/BranchToolbarBranchSelector.tsx apps/web/src/components/CommandPaletteThemeItems.tsx apps/web/src/components/GitActionsControl.tsx apps/web/src/components/LegacySidebar.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - string assertions in ~25 browser tests · upstream: yes, after #24865 merges · #24865: rebase after merge: BranchToolbarBranchSelector.tsx, GitActionsControl.tsx, ChatComposer.tsx

##### CP-10 Guard test for toast and attribute copy

- Findings: F-12-30 (P3), F-20-17 (P3), F-12-31 (P3) · ~125 lines · wave 2 · depends on: CP-9
- Files: `components/GitActionsControl.tsx`, `components/BranchToolbarBranchSelector.tsx`, `components/ChatView.tsx`, `components/CommandPalette.tsx`, `components/desktopUpdate.logic.ts`, `components/files/AttachmentFilePreview.tsx` (+2)
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/CP-10/` same names
- Accept: `toast.logic.test.ts` fails on trailing periods, `...`, `!`, "Failed to", contractions in `toastManager.add`, `placeholder=`, `title=`, `aria-label=`.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts apps/web/src/components/ChatView.logic.test.ts apps/web/src/components/CommandPalette.logic.test.ts` · `vp lint apps/web/src/components/GitActionsControl.tsx apps/web/src/components/BranchToolbarBranchSelector.tsx apps/web/src/components/ChatView.tsx apps/web/src/components/CommandPalette.tsx ...` · `vp run --filter @t3tools/web typecheck` · new: the guard test itself
- Model: Opus low · risk: low · upstream: yes, after #24865 merges · #24865: rebase after merge: GitActionsControl.tsx, BranchToolbarBranchSelector.tsx

### 13.15 Deferred P3 findings

164 P3 findings are not in any chunk. They are polish that rides along when an area chunk is open, or waits for a later pass; none blocks a P1 or P2. Included P3s (40) are marked "(P3)" on their cards.

| Area | Deferred P3 ids                                                                                                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 01   | F-01-19, F-01-20, F-01-22, F-01-23, F-01-24, F-01-25, F-01-26, F-01-27, F-01-28, F-01-29, F-01-32, F-01-33                                     |
| 02   | F-02-21, F-02-24, F-02-28, F-02-31, F-02-32, F-02-33, F-02-34, F-02-35, F-02-36, F-02-38                                                       |
| 03   | F-03-06, F-03-13, F-03-17, F-03-18, F-03-27, F-03-28, F-03-33, F-03-34, F-03-35, F-03-37, F-03-38, F-03-39, F-03-40                            |
| 04   | F-04-02, F-04-04, F-04-06, F-04-07, F-04-10, F-04-13, F-04-14, F-04-26, F-04-27, F-04-28, F-04-29, F-04-32, F-04-35, F-04-36, F-04-38, F-04-42 |
| 05   | F-05-27, F-05-28, F-05-29, F-05-30, F-05-31, F-05-33, F-05-34, F-05-35, F-05-36, F-05-37, F-05-38                                              |
| 06   | F-06-22                                                                                                                                        |
| 07   | F-07-09, F-07-10, F-07-22, F-07-23, F-07-24, F-07-25, F-07-29, F-07-36, F-07-39                                                                |
| 08   | F-08-06, F-08-11, F-08-12, F-08-16, F-08-22, F-08-35, F-08-36, F-08-37, F-08-39, F-08-41, F-08-45, F-08-46, F-08-47                            |
| 09   | F-09-16, F-09-25, F-09-30, F-09-31, F-09-32, F-09-35, F-09-36, F-09-37                                                                         |
| 10   | F-10-26, F-10-27, F-10-28, F-10-29, F-10-30, F-10-31, F-10-32, F-10-33, F-10-34, F-10-35, F-10-36, F-10-37                                     |
| 12   | F-12-26, F-12-28, F-12-29, F-12-32, F-12-33, F-12-34, F-12-36, F-12-37, F-12-38, F-12-39, F-12-40                                              |
| 13   | F-13-20                                                                                                                                        |
| 14   | F-14-11, F-14-14, F-14-15, F-14-19, F-14-21, F-14-22, F-14-24, F-14-25, F-14-27, F-14-28, F-14-29, F-14-30, F-14-31, F-14-32, F-14-33          |
| 15   | F-15-18, F-15-19                                                                                                                               |
| 16   | F-16-19                                                                                                                                        |
| 17   | F-17-10, F-17-11, F-17-12, F-17-13, F-17-14                                                                                                    |
| 18   | F-18-08, F-18-09                                                                                                                               |
| 20   | F-20-10, F-20-11, F-20-12, F-20-13, F-20-14, F-20-15, F-20-16, F-20-18, F-20-19                                                                |
| 21   | F-21-09, F-21-11, F-21-16, F-21-17, F-21-18, F-21-19, F-21-20                                                                                  |
| 22   | F-22-06, F-22-07, F-22-08                                                                                                                      |
| 24   | F-24-13, F-24-14, F-24-15                                                                                                                      |

### 13.16 Totals

| Track          |  Chunks |      P1 |      P2 | P3 included | Est. lines | Upstream: yes, no #24865 wait | Upstream: yes after #24865 | Fork only or held | Candidates <=300 lines |
| -------------- | ------: | ------: | ------: | ----------: | ---------: | ----------------------------: | -------------------------: | ----------------: | ---------------------: |
| Tokens         |      13 |      10 |      21 |           3 |       1380 |                             0 |                         12 |                 1 |                     12 |
| Hierarchy      |       8 |       2 |      15 |           5 |        725 |                             2 |                          6 |                 0 |                      8 |
| Polish-by-area |      85 |      25 |     141 |           6 |      11220 |                            35 |                         31 |                19 |                     64 |
| States         |      33 |      29 |      34 |           2 |       4645 |                            15 |                         16 |                 2 |                     30 |
| Edge cases     |      15 |       9 |      17 |           0 |       2555 |                             7 |                          4 |                 4 |                      9 |
| Customisation  |      11 |       0 |      11 |           8 |       1575 |                             0 |                          3 |                 8 |                      3 |
| Onboarding     |      17 |      14 |      17 |           1 |       1740 |                            11 |                          2 |                 4 |                     13 |
| Mobile         |      17 |      13 |      17 |           0 |       1955 |                             9 |                          6 |                 2 |                     15 |
| A11y           |      22 |      16 |      20 |           0 |       2780 |                             9 |                          7 |                 6 |                     16 |
| Motion         |       9 |       0 |      11 |          12 |        665 |                             3 |                          5 |                 1 |                      8 |
| Copy           |      10 |       0 |      14 |           3 |       1365 |                             2 |                          8 |                 0 |                      9 |
| **Total**      | **240** | **118** | **318** |      **40** |  **30605** |                        **93** |                    **100** |            **47** |                **187** |

Reading the table: **193 of 240 chunks are upstream candidates** (93 with no #24865 wait, 100 after it merges); 47 stay in the fork or are held. 55 chunks are fork bundles of independent small fixes; together they offer about 101 one-problem carve-out PRs on top. 6 candidates exceed 300 lines (P-08-5, S-17, E-11 are bundles that go upstream by carve-out; P-13-1, E-4, CP-8 are single L-sized findings that must be split first). Estimated size is 30605 lines across all chunks (formula estimates, not spiked). Findings covered: P1 118 of 118, P2 318 of 318, P3 40 of 204.

## 14. Upstream strategy

DRAFTS saved to disk only. Nothing in this section has been posted, opened or sent; `AGENTS.md` forbids opening a PR unless the developer asks, and Phase 1 ends at spec approval.

### 14.1 Rules we hold ourselves to

| Rule                                                                                                                                                                                                                                                              | Why (source)                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Assume unvouched: the fork owner is in neither `.github/VOUCHED.td` nor `TRIAGE_EXEMPTIONS.td`, so every PR, drafts included, goes through contribution triage                                                                                                    | CONTRIBUTING "Triage and deeper review"              |
| Unvouched UI PRs merge 37% overall: 69% at XS, 42% at M, 16% at L, 4% at XXL. Unvouched `fix(...)` merges 50%, `feat(...)` 10%. Maintainers cite a 500-line review limit. So: `fix(...)` titles, one problem each, under 150 lines where possible, never over 300 | `rejection-patterns.md` summary                      |
| Only 55% of merged UI PRs carried images, so images are necessary, not sufficient: each PR needs the problem, reproduction, what was checked and what was not                                                                                                     | CONTRIBUTING "Provide evidence"                      |
| Features, new defaults, new settings and flow changes need explicit maintainer approval linked in the PR; only a very small focused fix of an obvious bug, or a focused option for an established capability, is exempt                                           | CONTRIBUTING "Establish the problem and scope first" |
| UI PRs carry before/after screenshots; motion or timing carries a short recording; upload to GitHub, never commit PR-only assets                                                                                                                                  | CONTRIBUTING, AGENTS.md "Pull requests"              |
| ADOPT lines read `Code from #N by <login> (title)`, BORROW lines `Idea from #N by <login> (title)`, pasted from `PRS.md` "Credit ledger"; cherry-pick so authorship survives                                                                                      | `PRS.md`, part B 12.3                                |
| Model line names Claude Opus; no Gemini or Muse Wonder code anywhere                                                                                                                                                                                              | CONTRIBUTING "Models we do not accept"               |
| At most 3 upstream PRs open at once; send the next batch after one of the current batch is merged or reviewed. Check for a maintainer `takeover` before each; if the same fix lands, drop ours and keep the credit                                                | our policy (recommendation, section 15)              |
| Re-dry-run the five ADOPT diffs that touch #24865 files (#22436, #22100, #23573, #23166, #24438) after it merges                                                                                                                                                  | part B 12.1                                          |

### 14.2 Order of submission

| Batch                                            | Chunks                                                                                                                                                              | Gate                                                                                          | Notes                                                                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| U1: first PRs (XS/S, P1 or ADOPT, independent)   | P-01-5, O-3, P-07-1, P-01-1, P-09-1, S-4                                                                                                                            | none beyond the small-fix explanation (P-01-1 also closes issue #24191)                       | P-01-5 is ADOPT #22605; PRS.md lists a competing fix #24864, check merge state first. S-4 ships F-03-11 only; F-12-24 goes separately |
| U2: remaining independent P1 `fix` chunks        | E-12, M-11, P-06-3, P-12-1, E-1, P-14-1, M-3, S-1, S-31, O-1, A-10, A-18, P-03-2, P-06-4, P-11-4, S-32, P-07-2, A-12, A-21, E-9, O-4, P-05-1                        | after U1 reviews; one problem each                                                            | server-gated items are in 14.6                                                                                                        |
| U3: independent P2 `fix` chunks                  | MO-2, S-13, O-13, A-19, A-8, M-15, P-04-1, S-14, S-30, CP-2, H2, P-01-4, P-02-3, S-12, E-14, P-02-4, P-05-4, P-08-4, P-09-4, P-13-2, P-22-5, O-6, S-10, M-8, P-13-1 | after U2                                                                                      | P-13-1 (about 420 lines) must be split before it goes anywhere                                                                        |
| U3b: fork bundles, carved out one problem per PR | E-15, A-5, M-10, P-05-3, M-13, M-2, P-08-2, P-06-5, M-12, MO-7, P-08-9, P-14-2, M-14, P-11-2, P-21-8, P-09-2, E-8, P-08-7, P-09-3, P-11-1, P-08-8, E-11, P-08-5     | per carve-out, same gate as U3                                                                | each card says how many carve-outs; the fork keeps the whole bundle                                                                   |
| U3c: independent but waiting on another chunk    | MO-3, A-20, A-7, CP-3, O-10, O-11, O-12, O-17, O-16, S-21, H3, O-7, S-27, S-24, S-19, S-20, S-17                                                                    | after their parent chunk lands (S-2, MO-1, O-9, T-chunks)                                     |                                                                                                                                       |
| U4: after #24865 merges                          | the 100 chunks marked "yes, after #24865 merges"                                                                                                                    | rebase onto merged main; tokens first (T1, T4, T10 to T12), then the chunks that consume them | do not start before the merge (D-006)                                                                                                 |
| U5: gated                                        | the "no" chunks in 14.3                                                                                                                                             | Ideas post, triaged issue or owner decision first                                             |                                                                                                                                       |

### 14.3 Fork only, and why

| Reason                                                                 | Chunks                                                                                                                                                |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| New setting, default or flow: needs an approved Ideas post first       | C-1, C-2, C-5, C-6, C-7, C-8, C-9, C-11, O-8, P-01-6, P-14-3, P-21-1 (part 2), P-21-3, P-21-5, P-21-6, P-21-7, P-21-9                                 |
| New surface or interaction: maintainer buy-in                          | P-05-5, P-06-2, P-06-6, P-14-7, P-14-8, A-13, A-14, A-17, M-16, S-33, E-7                                                                             |
| Owner design territory (visual identity, tokens, copy policy)          | P-01-7, P-11-3, P-14-6, O-15, A-9, E-10, MO-9                                                                                                         |
| Server change or crash needing a reproduction: file an issue, not a PR | S-15, O-2, M-9, A-15                                                                                                                                  |
| Shared files or #24865 files: coordinate or wait                       | E-2, E-6, O-5 (palette rows alone are eligible now), P-14-5 (the toast file alone is eligible), P-12-2 (`NotificationSettings.tsx` alone is eligible) |
| Held or no code                                                        | A-22 (owner calls), T0 (verification)                                                                                                                 |

Everything else (193 chunks) is an upstream candidate: 93 now and 100 after #24865 merges.

### 14.4 Draft PR bodies

Bodies (indented two spaces inside the fences so they cannot be read as section headings; strip the indent when posting) follow `.github/pull_request_template.md` (Problem, Change, Scope and approval, Verification, model line). Screenshot and result slots are placeholders to fill from the Phase 2 run; every "before" fact below is from the Phase 1 audit at upstream `5f64c5eb`.

**Draft 1: P-01-1**

```md
Title: fix(web): collapsed sidebar stays collapsed after reload

## Problem

Collapsing the sidebar writes a `sidebar_state` cookie that nothing reads (`ui/sidebar.tsx:25-26,117,127-133`; `AppSidebarLayout.tsx:390` hard-codes `defaultOpen`), so the choice is lost on every reload and relaunch (#24191). Where `cookieStore` does not exist (Firefox, plain-HTTP origins) the toggle also throws an unhandled error.

## Change

`SidebarProvider` initialises `_open` from `t3code:sidebar-open:v1` with a synchronous lazy `useState` (same pattern as `readInitialThreadSidebarWidth`, `AppSidebarLayout.tsx:115-125`) and writes the key in `setOpen`. The `SIDEBAR_COOKIE_*` constants and the `cookieStore.set` call are removed. The mobile sheet state (`openMobile`) stays unpersisted; first-run default stays expanded.

## Scope and approval

Very small, focused fix of an obvious bug: the code advertises persistence it does not do, and it is reported as #24191. One problem; no new setting, no change to defaults. `ui/sidebar.tsx` and `AppSidebarLayout.tsx` are not in #24865.

## Verification

- Before (upstream main `5f64c5eb`, Chromium, 1440x900): collapse via "Toggle main sidebar", `document.cookie` shows `sidebar_state=false`, reload: `data-sidebar-state="expanded"`.
- New browser test: collapse, rerender, expect `data-sidebar-state="collapsed"`. `vp test run apps/web/src/components/ui/sidebar...` : [result].
- Not checked: Electron relaunch; browsers with storage disabled (the lazy initialiser must fall back to `defaultOpen`).
- Before: ![before](UPLOAD: 01-app-shell-sidebar-collapsed-light-1440x900.png) After: ![after](UPLOAD: P-01-1/01-app-shell-sidebar-collapsed-light-1440x900.png)

Made with Claude Opus in Claude Code, running in T3 Code.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Draft 2: A-4**

```md
Title: fix(web): name the branch picker for screen readers

## Problem

The branch picker trigger has no accessible name. A screen reader announces "combobox, main" with no purpose; axe reports `button-name` (critical) on `/`, on a thread and with the terminal open, one node each. `BranchToolbarBranchSelector.tsx:705` renders `<ComboboxTrigger render={<ThreadDetailsControl .../>}>` with no `aria-label`.

## Change

`aria-label={`Branch, ${triggerLabel}`}` on both triggers (panel and composer modes). No visual change.

## Scope and approval

Very small, focused accessibility fix of an obvious defect; one line per trigger. A scan of every icon-size `Button` found no other unnamed control. The file is also edited by #24865 for style only, so this PR is opened after it merges or rebased onto it.

## Verification

- axe on `/`, a thread and terminal-open: [0 nodes after; 1 node each before].
- CDP accessibility tree: [`combobox "Branch, main"` after; `combobox: main` before].
- Searched the test suite for role-name queries on "main": none. `vp test run apps/web/src/components/BranchToolbar...` : [result].
- No screenshot: nothing changes visually, so the evidence is the axe output and the tree dump: [attach both].
- Not checked: real VoiceOver or NVDA announcement (accessibility tree only).

Made with Claude Opus in Claude Code, running in T3 Code.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Draft 3: S-4 (F-03-11 only)**

```md
Title: fix(web): Copy code and Copy table work over plain HTTP

## Problem

Over `npx t3` on a LAN or Tailscale address (a non-secure context) `navigator.clipboard` is undefined. "Copy code" and "Copy table" return early with no feedback: no toast, nothing copied, aria-label unchanged. The message-level copy on the same page works because it goes through `writeTextToClipboard`, which falls back to `execCommand` (`hooks/useCopyToClipboard.ts:55-135`). Reports: #8361, #23930, #20207, #15927, #23619, #21006.

## Change

`MarkdownCodeBlock.tsx:171-175` and `MarkdownTable.tsx:72-80` call `writeTextToClipboard(code, "code block")` and `writeTextToClipboard(markdownOrCsv, "table")`, keep the 1,200 ms copied morph, and on rejection call `reportMarkdownActionFailure` plus `showAnchoredCopyErrorToast(ref, error)`, as `MessageCopyButton` does. The table menu items go through the same path.

## Scope and approval

Small, fix-shaped, one problem, remote-ready path from AGENTS.md. Neither file is in #24865. The unrelated "bare 'Failed to copy' toast has no tone" polish (F-12-24) is a separate PR.

## Verification

- Before (Chromium, `navigator.clipboard` stubbed undefined): click Copy code: aria-label stays "Copy code", no toast, clipboard empty; message copy shows "Copied!".
- New browser test in `ChatMarkdown.browser.test.tsx`: stub `navigator.clipboard` undefined, click Copy code, assert the `execCommand` copy and the morph; second case asserts the failure toast. `vp test run apps/web/src/components/ChatMarkdown.browser.test.tsx` : [result].
- Before: ![before](UPLOAD: 03-copy-no-clipboard-api-light-1440x900.png) After: ![after](UPLOAD: S-4/03-copy-no-clipboard-api-light-1440x900.png)
- Not checked: Safari, iOS web over HTTP.

Made with Claude Opus in Claude Code, running in T3 Code.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Draft 4: P-09-1**

```md
Title: fix(web): the sign-in command for a custom Claude config directory sets CLAUDE_CONFIG_DIR

## Problem

A second Claude instance with `CLAUDE_CONFIG_DIR=<dir>` shows "Claude Code is not authenticated. Run `claude auth login` and try again." in the provider card, the in-thread banner and the picker tooltip. That command signs in the default config directory, not the instance the user is looking at. The thread error row already gives the correct command; `docs/user/providers-claude.md` requires the variable.

## Change

For Claude and Codex instances that are unauthenticated and have a `homePath` (`CLAUDE_CONFIG_DIR`; `CODEX_HOME` for the Codex shadow home), render a copyable command under the status in the editor and in `ProviderStatusBanner`: `CLAUDE_CONFIG_DIR="<path>" claude auth login` (POSIX) or the `set` / `$env:` form chosen from `environment.platform.os`. The server message stays as the fallback. A pure formatter holds the quoting.

## Scope and approval

Small, fix-shaped: three surfaces disagree with the fourth about the same command. No new setting, no server change (the long-term fix in the server message builder is out of scope here).

## Verification

- Before (Claude 2nd instance, light, 1440x900): ![before](UPLOAD: 09-providers-second-claude-added-light-1440x900.png)
- Unit tests for the formatter, POSIX and Windows, including a path with spaces. `vp test run apps/web/src/components/settings/...` : [result].
- After: ![after](UPLOAD: P-09-1/09-providers-second-claude-added-light-1440x900.png)
- Not checked: running the Windows forms on a Windows host; the Codex shadow-home variant against a real login.

Made with Claude Opus in Claude Code, running in T3 Code.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Draft 5: O-3**

```md
Title: fix(web): /new without a prompt opens a new thread instead of an error page

## Problem

`t3code://new` maps to `/new` with an empty query. `parseNewThreadLink` returns "This link has no prompt." whenever `prompt` and `pr` are absent, and `routes/_chat.new.tsx:11-22` renders "Could not open the link" in a `SidebarInset` with no header, no drag strip on desktop and no button back.

## Change

In `NewThreadLinkRoute`: a bare `/new` (no recognised params) renders `<Navigate to="/" replace />`, so it behaves like "new thread". A genuinely malformed link renders the existing `LinkPage` (exported from `NewThreadLinkView.tsx`) with the header and a "New thread" button; the description reads `${error} Start a new thread instead.`

## Scope and approval

Small, focused fix: an error state with no way out for a URL typed correctly. One problem; no new route or setting. The hosted prompt-link landing is a separate path and unchanged.

## Verification

- Before: ![light](UPLOAD: 10-first-run-and-empty-states-new-no-prompt-light-1440x900.png) ![dark](UPLOAD: ...-dark-1440x900.png) ![390](UPLOAD: ...-light-390x844.png)
- New route test for bare `/new` (redirects) and a malformed link (header + action). `vp test run packages/shared/src/promptLinks...` and the route test : [result].
- After: same three names under O-3/.
- Not checked: the Electron `t3code://new` deep link on a signed build.

Made with Claude Opus in Claude Code, running in T3 Code.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 14.5 Draft Ideas posts (direction approval)

CONTRIBUTING sends proposals to Ideas discussions and requires explicit maintainer approval of direction and scope, linked in the PR. Each draft asks one question and names the PRs it would unlock. Not posted.

**Idea 1: tokens and the elevation ladder**

```md
Category: Ideas
Title: Design tokens: one elevation ladder, three text tiers, one hit-area utility

#24865 settles the radius scale, icon stroke, fonts and chat text opacity. This asks about the layer underneath it, as additive tokens on top of that PR (we will not start before it merges).

What the audit measured at 5f64c5eb:

- Shadows: 45 distinct strings across 225 uses, 12 recipes for floating things (menu, dialog, route modal, toast, glass tooltip, tooltip, autocomplete, sheet, hover card, image dialogs, standalone page, mini player).
- Text: 14 alpha steps on `text-muted-foreground`, 175 sites, 1.47 to 3.88:1 in light; 11 neutral levels across 7 views.
- Hit areas: Switch is 38x22 on touch, several raw buttons are under 24 px for a mouse.

Proposal (no new library, no gradient, glow or bounce):

- Three shadow tokens, flat in-flow surfaces unchanged, composer keeps its own token.
  - `--shadow-lift` (glass tooltip, toast, minimap, hover card): light `0 12px 28px -18px rgb(0 0 0 / 40%)`, dark `0 14px 32px -18px rgb(0 0 0 / 75%)`.
  - `--shadow-popup` (menu, select, popover, combobox, autocomplete, sheet): light `0 16px 40px -18px rgb(0 0 0 / 55%)`, dark `0 18px 44px -18px rgb(0 0 0 / 80%)`.
  - `--shadow-dialog` (dialog, palette, Settings and Usage, image dialogs): light `0 24px 64px -24px rgb(0 0 0 / 65%)`, dark `inset 0 1px rgb(255 255 255 / 4%), 0 24px 72px -20px rgb(0 0 0 / 90%)`.
- Three text tiers (primary, secondary, quiet = secondary at 11 px). An oxlint rule `no-text-opacity-on-muted` at warn, then a codemod landed one directory per PR (settings, chat, sidebar and pull requests, root), then the rule at error.
- `@utility hit-area`: 24 px floor for fine pointers, 44 px for coarse, visual size unchanged.
- `--destructive-solid` so white on a destructive button reaches 4.5:1 (3.81 and 3.53 today).

Untouched: the #0a0a0a canvas, the blue switch accent, three-line sidebar rows, the composer model colour, 75% read titles.

Evidence: [annotated before/after captures: menu, toast, dialog in light and dark].

Ask: is this direction acceptable? If yes, first PRs are `hit-area` (about 180 lines) and `--destructive-solid` (about 60), each under 300 lines; the shadow ladder and the codemod stay in the fork until you say go.

Made with Claude Opus in Claude Code, running in T3 Code.
```

**Idea 2: onboarding wiring**

```md
Category: Ideas
Title: Onboarding: skip, check again, and a way back to setup (no new tour, no new step)

The welcome wizard exists and is good for the happy path. The audit found the gaps are wiring, not design. Principle: three presses to a first message for a ready user, nothing a power user cannot skip with Escape, every exit has a way back.

Proposed (all reuse existing components; wireframes in the audit repo):

1. One local computer: skip the Computers step (stepper shows Agents, Projects). This is the only flow change; it is the part that needs your approval.
2. Skip setup button and Escape finish without importing; initial focus on Continue; X no longer completes silently.
3. Agents step: "Checked just now" with one refresh on window focus (no polling); "Other agents" row linking to Providers; the default permission mode shown on one line ("Full access"), default unchanged.
4. Projects step: "Add a project..." using the existing palette folder browser; "Importing N of M..."; enabled Continue when there is nothing to import.
5. Re-entry: Settings > General > About "Setup" and "Release notes"; palette "Open setup" and "Set up agents"; composer chip "Set up an agent" when no provider is usable.
6. Mobile Home: "No computer connected" with three steps and a "Connect a computer" action; "No projects yet" with "Add project".
7. Telemetry notice names `T3CODE_TELEMETRY_ENABLED=false` instead of pointing at a policy.

Not proposed: tour, sample project, coach marks, release-notes modal, account creation, any new setting, keybinding or permission mode.

Server dependencies we will file as issues rather than PRs: web mode never receives `bootstrapProjectCreated` so the wizard is skipped, and `/` opens an arbitrary existing thread instead of a draft.

Ask: approval of (1), and confirmation that (2) to (7) can go as small `fix(...)` PRs. Related: #10961, #22411, #23122, #24150.

Made with Claude Opus in Claude Code, running in T3 Code.
```

**Idea 3: reduced motion**

```md
Category: Ideas
Title: Reduced motion: one global rule, and what shows "working"

Measured on main: there is no global `prefers-reduced-motion` rule. Under `reduce` the command palette still runs 3 transitions, toasts still move for 500 ms, and press feedback scales. Durations in use span 100 to 650 ms. An idle thread has 0 running animations either way, and keyframes are already gated, so the gap is transitions.

Proposal, XS (about 45 lines), next to `.no-transitions` in `index.css`:

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          transition-duration: 0.01ms !important;
          transition-delay: 0s !important;
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
        }
      }

0.01 ms, not 0: Base UI waits on `getAnimations()`. A Playwright census with `reducedMotion: "reduce"` (palette, popover, tooltip, switch, toast) asserts no non-zero transition. Panels stay instant by default; the Panel animations slider is unchanged. It closes F-12-16 (toasts), F-01-31 (route modals), F-16-13 and the reduced half of F-04-19.

Open question: under reduce the Spinner and "Working" dots become static glyphs. Status must not lie, so what carries "still working"? Our default: static glyph plus the ticking text ("Working 9s"). Alternative: an opacity-only stepped pulse with no movement.

Not proposed: an in-app override (a separate Idea if wanted), changes to durations, bounce or springs.

Ask: approve the global rule and pick the liveness cue.

Made with Claude Opus in Claude Code, running in T3 Code.
```

### 14.6 Draft issues (server-gated; issue drafts only, no Phase 2 code)

Two findings have a server cause that a UI contribution should not change unasked (`apps/server` is outside the UI scope). They go upstream as issues with the audit evidence. Not filed.

**Issue A: S-15 (F-03-15)**

```md
Title: Claude threads show the whole answer at once: text deltas are never projected

## Problem

Claude answers appear in one chunk after about 8 s of "Thinking". Claude Haiku 5.5, Low effort, 3 KB answer: 66 samples at 120 ms show "Working for ..." / "Thinking" and no streaming markdown node; `scrollHeight` jumps 848 to 2,959 inside one sample. The same UI streams Codex text incrementally (2 to 38 blocks over 7 s).

## Evidence

- `ClaudeAdapterV2.ts:1395` sets `includePartialMessages: true`, so the SDK emits partials.
- The `stream_event` branch (`:7650-7705`) handles `message_start`, `message_delta` (usage) and thinking blocks, then returns. There is no `text_delta` case; `grep text_delta apps/server/src` finds nothing.
- Assistant text is emitted only from the completed `assistant` message through `emitAssistantTextArtifacts` (`:6970-7009`) with `streaming: false` hard-coded (`:3343,3365`).
- Codex streams through `makeProviderTextDeltaCoalescer` at 50 ms with `streaming: !completed` (`CodexAdapterV2.ts:206,3244,3266,3362`).

## Impact

For one of the two primary providers the stream-fade, incremental code blocks and the "Stop early" decision never happen. The web UI is correct; we are not proposing a client-side typewriter.

## Ask

Please triage as an adapter bug. We can send the change if you confirm the direction.

Made with Claude Opus in Claude Code, running in T3 Code.
```

**Issue B: O-2 (F-10-01, F-10-03)**

```md
Title: First launch over `npx t3` skips the welcome wizard, and `/` opens an arbitrary thread

## Problem

In web mode the lifecycle `welcome` payload carries `bootstrapProjectId` and `bootstrapThreadId` but nothing sends `bootstrapProjectCreated` or `bootstrapThreadCreated` (contract: `packages/contracts/src/server.ts:785-786`). `serverRuntimeStartup.ts:274-330` calls `projects.bootstrap(...)`, which returns `{ project, created }`, and discards `created`. `isFreshFirstRunWorkspace` (`onboarding/firstRun.logic.ts:73-107`) is therefore false and `resolveFirstRunDecision` returns `app` with `persistCompletion: true`: the user is marked onboarded without setup being shown. `docs/user/welcome-wizard.md:3-4` promises setup on web, and `firstRun.logic.test.ts:164-222` passes only because its fixtures set the flags by hand.

Separately, `/` is replaced with `payload.bootstrapThreadId` (`routes/__root.tsx:535-577`): six of six fresh browser contexts ended on an old pinned thread of the cwd project, not a draft, so `IndexDraftLanding` never runs.

## Proposed

Server: `resolveAutoBootstrapWelcomeTargets` returns `bootstrapProjectCreated: created` and `bootstrapThreadCreated: launched !== undefined` (the spread into `welcome.publish` at `:645-658` already carries them). Client, after that: navigate to the bootstrap thread only when `bootstrapThreadCreated === true` (`__root.tsx:558`).

## Caveats

The wizard skip was derived from the live payload keys plus the code path, not reproduced end to end (the test server had several projects). `t3 ./my-project` for a project that already has threads would stop opening its first thread; if you want "resume where I was", the target is the last-viewed thread.

Made with Claude Opus in Claude Code, running in T3 Code.
```

## 15. Decisions

Every line carries a recommendation. "Owner" = `t3dotgg` (design and product calls in #24865's PR body); "maintainer" = triage and approval (juliusmarminge and the other logins in `TRIAGE_EXEMPTIONS.td`); "us" = this fork's operator. Where a decision is pending, the spec already uses the stated default.

1. **#24865 rebase timing.** Recommend: cut the Phase 2 integration branch from upstream `main` after #24865 merges; token chunks (T1 to T12) land as a delta on its end state; wave-0 chunks may start now on current `main` because they do not touch its files. Decides: us (branch), owner (merge time). Opens D-006.
2. **If #24865 is still open when Phase 2 is approved.** Recommend: run wave 0 only, and cut a fork-only branch from its head `t3/ui-polish-95` for wave-1 work that is never sent upstream; re-dry-run the five overlapping ADOPT diffs when it merges. Decides: us.
3. **"computer" vs "environment" (D1).** Recommend A: "environment" everywhere except onboarding, hosted pages and mobile first-run, where "computer" stays (matches the AGENTS.md glossary, 117 existing uses vs 11, and Settings page names); retire "machine", "backend", "host" in user strings. Blocks CP-1, CP-3, O-16, O-17. Decides: owner.
4. **"Source Control" vs "Source control" (D2).** Recommend A: "Source control" everywhere (DNA-V1 sentence case; the page rows and mobile already say it) plus a one-word docs edit. Blocks CP-6. Decides: maintainer.
5. **Capital after the colon in generated keybinding labels (D3).** Recommend A: capital ("Thread: New without project"), matching the docs and the explicit label map; update `docs/user/keybindings.md` in the same PR. Blocks CP-4. Decides: maintainer, minor; we default to A if silent.
6. **Reduced-motion liveness cue (D-M1).** Recommend: static glyph for Spinner and Working dots plus the ticking text ("Working 9s"), no pulse; revisit the stepped opacity pulse only if the text cue tests poorly. Pairs with F-03-08, which removes the ticking timer while waiting on approval. Blocks the wording of MO-1 and MO-5. Decides: owner, via Ideas draft 3.
7. **Compact-before-send off switch (#17170).** Recommend: no new setting. The follow-up sweep found it already exists (Settings, General, "Compact idle threads" with Never, plus a per-provider override); link the "Compact next" pill tooltip to it (note on T0) and answer the Ideas thread. Decides: us (tooltip), maintainer (thread reply).
8. **Adopt the 4/6/8/12/16 radius ladder verbatim.** Recommend: yes, verbatim, no extra rung; T2 only derives `--control-radius` from the ladder and puts the sidebar family on one rung. Treat the optional `--radius-xs` for swatches of 8 px or less as deferred, leaving the four 2 px sites as a declared exception. Mobile gets its own four-value ladder (M-8). Decides: owner.
9. **Composer shadow in light.** Recommend: keep #24865's `0 1px 2px / 5%` for the composer, do not fold the composer into L1 (T3 leaves its token alone), and record the exception in DNA-S5. Decides: owner.
10. **F-16-07 composer focus indicator (conflicts with neutral controls).** Recommend: a neutral border-colour change using `--contrast-muted-foreground` (4.71 / 5.08:1), no blue ring; it keeps the quiet look and passes WCAG. Held in A-22. Decides: owner.
11. **F-16-20 user-bubble label (4.05:1 light, bubble 1.16:1 against canvas).** Recommend: label to `text-muted-foreground`, no bubble border. Held in A-22. Decides: owner.
12. **F-18-09 ring and shadow on the active sidebar row.** Recommend: no code change; amend DNA-S4 with one sanctioned in-flow exception. Decides: owner.
13. **Fork-only vs upstream, Tokens.** Recommend: fork first; upstream T1, T4, T10 to T12 as small follow-ups after the merge; T3 (shadows), T5 and T6 to T9 (codemod and lint) only after Ideas draft 1 is acknowledged. Decides: us, then maintainer.
14. **Hierarchy.** Recommend: fork all; upstream H2, H3, H6 as `fix(...)` slices after the merge; H1, H5 as follow-ups to #24865's settings titles. Decides: us.
15. **Polish-by-area.** Recommend: upstream every `yes` chunk in the order of 14.2; keep the 19 "no" chunks in the fork until an Ideas post or issue is triaged. Decides: us, then maintainer.
16. **States.** Recommend: upstream most (S-1, S-4, S-12, S-13, S-14, S-25 first); S-2 (confirm contract across 36 call sites) lands in the fork first and goes upstream one surface at a time; S-15 and S-33 stay out until an issue or Ideas post exists. Decides: us, then maintainer.
17. **Edge cases.** Recommend: upstream E-1, E-8, E-9, E-11, E-12, E-14 (bug-shaped); the rest stay in the fork. Decides: us.
18. **Customisation.** Recommend: fork-only until an Ideas post is approved (8 of 11 chunks add or change a setting or default); C-3, C-4, C-10 follow #24865. Decides: maintainer.
19. **Onboarding.** Recommend: upstream the wiring chunks as `fix(...)` (O-3, O-6, O-7, O-9 to O-14, O-16, O-17); file O-2 as a server issue; hold O-5 (chip and banner), O-8 (flow) and O-15 (policy copy) for Ideas draft 2. Decides: maintainer.
20. **Mobile.** Recommend: upstream the native chunks that borrow open PRs only after checking those PRs did not land (about 20 graded mobile PRs overlap); M-9 needs a device reproduction; M-16 waits for approval. Android stays code-read until a device exists. Decides: us.
21. **A11y.** Recommend: upstream all `yes` chunks (small, fix-shaped); hold A-9, A-13, A-14, A-15, A-17 (new behaviour or an unreleased text API) and A-22. Decides: us, then maintainer.
22. **Motion.** Recommend: MO-1 via Ideas draft 3, then MO-2 to MO-8 as small `fix(...)` PRs; MO-9 (global easing) needs an issue first. Decides: owner for MO-1, us otherwise.
23. **Copy.** Recommend: nothing upstream until D1 to D3 are answered; CP-10 (guard test) follows CP-9 because it must pass on day one. `extoci` owns copy PRs #24147, #24148, #24150, so coordinate wording before CP-6 and S-9. Decides: maintainer.
24. **Server-gated items** (F-10-01, F-10-03, F-03-15, F-09-30, in-app telemetry toggle). Recommend: file the two issue drafts in 14.6 (and a third for F-09-30 and the telemetry toggle when needed) with the audit evidence; ship only the gated UI half; never fake the server behaviour in the client. Decides: maintainer.
25. **Pace of upstream PRs.** Recommend: at most 3 open at once, U1 first, one problem each, under 150 lines where possible. Decides: us.
26. **Area 22 (performance feel).** Recommend: chunks P-22-1 to P-22-5 are in 13.6; F-22-01 (P1) is the budget and bench on top of the E-6 fix; the three P3 stay deferred. Re-measure each on a production build (the audit quotes prod numbers, one host, medians of 3, headless 60 Hz clock) and do not claim a win from dev-server numbers. Decides: us.
27. **RUNLOG D-001 (fork name `AatmanAJ/t3code`).** Recommend: keep; the old name redirects. Open until the user confirms. Decides: us.
28. **RUNLOG D-002 (public fork, synthetic fixtures only).** Recommend: keep `--home-dir /tmp/t3code-overhaul --no-seed` and never read `~/.t3/userdata`; add a masking pass over every new capture. Decides: us.
29. **RUNLOG D-004 (browser verification vs AGENTS.md).** Recommend: ask for explicit consent again at the start of Phase 2, since AGENTS.md requires it for browsers and computer use; the kickoff covered Phase 1. Decides: us (ask the user).
30. **RUNLOG D-006 (moving baseline).** Same as 1 and 2; remains open until the user approves the spec. Decides: owner for the merge, us for the branch.
31. **RUNLOG D-003, D-005, D-007, D-008.** Closed in the run (provider list wider than six, existing welcome wizard audited, wave 2 started early, Sonnet writers); no action, noted so the log is complete.

## 16. Run log summary and hard stops

### 16.1 Condensed timeline (from `RUNLOG.md`, times as logged)

| Time           | Event                                                                                                                                                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12:27          | Run start. Fork `AatmanAJ/t3code` cloned, `upstream` added, checkout at upstream `5f64c5eb`; `vp i` done in about 1 minute. Rule files read                                                                                                                            |
| 12:33 to 12:40 | Playwright installed outside the repo (`/tmp/t3code-pw`), headless Chromium paired, web boot verified; seven first agents spawned (4 prior-art sweeps, MAP, DOCS-DIGEST, DNA); Electron dev app boots; synthetic fixture project added                                 |
| 12:50 to 13:20 | Claude provider id corrected to `claudeAgent`; host check (Xcode, iOS simulator, no Android tooling); CocoaPods installed with Homebrew; iOS dev client built and installed on "iPhone 17"                                                                             |
| 13:25 to 13:45 | MAP.md (552 lines), fixtures expanded to 142 threads, baseline capture started, DNA.md (110 DNA rules, 26 drift leads)                                                                                                                                                 |
| 13:50 to 14:05 | rejection-patterns.md (10,092 closed PRs), open-prs.md (2,220 open), baseline done: 252 PNGs, 59 MB, 0 failures                                                                                                                                                        |
| 14:15          | **Key finding:** owner PR #24865 "UI design overhaul" (+502/-272, 55 files). D-006: treat it as a moving baseline. PRS.md done: 85 diffs read, 16 ADOPT / 53 BORROW / 16 SKIP                                                                                          |
| 14:20          | OWNER-DIRECTION.md written; wave-1 agents told to tag every finding against #24865                                                                                                                                                                                     |
| 14:35 to 15:30 | Wave 1 (areas 01 to 05, 07, 09, 12) reports in; wave 2 launched early at 15:08 (D-007)                                                                                                                                                                                 |
| 15:15          | Checkpoint commit `d711b4a3` on branch `ui-overhaul/audit` (993 files, 229 MB), not pushed                                                                                                                                                                             |
| 15:45 to 15:58 | Areas 14 and 10 done; shared Playwright session verified                                                                                                                                                                                                               |
| about 16:xx    | **HS-001:** six wave-2 agents hit HTTP 429 (Sonnet session limit, resets 17:10 Europe/London)                                                                                                                                                                          |
| 17:39 to 17:50 | Same agents resumed via SendMessage; wave 2 complete (areas 06, 08, 11, 13, 15, 16)                                                                                                                                                                                    |
| 17:41 to 18:12 | Wave 3 (17, 18, 19, 20, 21, 23, 24) with lean briefs                                                                                                                                                                                                                   |
| 18:13          | Area 22 started alone; follow-up sweep started; findings index generated: 632 findings (P1 116 / P2 316 / P3 200). D-008: the user asked for a cheaper run, so spec parts A (1 to 6), B (7 to 12) and C (13 to 16) go to Sonnet writers and Fable reviews and stitches |
| 18:30          | Part C drafting started                                                                                                                                                                                                                                                |
| 19:23          | Area 22 asked to wrap up with the measurements it has; it finished with 8 findings (F-22-01 P1, F-22-02 to 05 P2, F-22-06 to 08 P3), measured on a production build at 1x and 4x CPU throttle plus the dev server. Chunked as P-22-1 to P-22-5 (13.6)                  |
| 18:45          | Follow-up sweep done: 326 items, 150 resolved from code, 88 live probes for Phase 2, 88 duplicates; severity changes recorded (13.1)                                                                                                                                   |

Yield: 24 areas, all with findings (640: P1 117 / P2 320 / P3 203 as indexed), 8 onboarding wireframes, 1,305 UI-relevant open PRs graded down to 85 diffs read. Area 22 (performance feel) was the last to finish: 8 findings (P1 1 / P2 4 / P3 3).

### 16.2 Hard stops

| Id           | When               | What happened                                                                                                                      | Default taken                                                                                              | State                                                                                                                                             |
| ------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| HS-001       | about 16:xx London | Six wave-2 agents (06, 08, 11, 13, 15, 16) terminated by HTTP 429 "session limit, resets 17:10 Europe/London" on claude-sonnet-5-5 | Wait for the reset, resume the same agents at 17:39 (their context was saved), leave areas 10 and 14 alone | Closed. Budget note: from then on agents reuse baseline captures, cap about 20 findings, return 150 words, and spec drafting is delegated (D-008) |
| Phase 1 stop | at spec approval   | The run ends here by design: no PR, no post, no push of code, nothing sent to upstream                                             | n/a                                                                                                        | Open until the user approves the spec                                                                                                             |

### 16.3 Environment facts to reproduce

| Item                  | Fact                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Host                  | macOS (Darwin 27.0.0), Node 24.22.1 on PATH; `vp` v1.0.0 (vite-plus 1.4.0) provides Node 26.12.1; pnpm 12.14.0 via `vp`; `claude` and `codex` CLIs installed, other providers not installed (gives real "not installed" states)                                                                                                                                                                                                                                                                          |
| Web dev server        | `vp run dev --home-dir /tmp/t3code-overhaul --no-seed`; read ports from the `[dev-runner]` line (server 13773, web 5733 in this run). The developer's `~/.t3/userdata` is never read or written (D-002). Stop only by a PID captured at spawn (no `pkill -f`); the dev-runner ignored SIGTERM, so server and Vite children were ended by verified PID                                                                                                                                                    |
| Desktop dev app       | `vp run dev:desktop --home-dir /tmp/t3code-overhaul-desktop --no-seed` (server 13774, web 5734); `T3CODE_DESKTOP_REMOTE_DEBUGGING_PORT=9222`, driven with Playwright `connectOverCDP` because OS screencapture is blocked on this host. The developer's installed "T3 Code (Nightly).app" is never touched                                                                                                                                                                                               |
| Fixtures              | Synthetic only: repo `/tmp/t3code-sample-repo` (3 commits), projects `sample-app` and `server`, three real agent seed threads, then `/tmp/t3code-fixtures/expand.mjs` (run against `/tmp/t3code-overhaul`, stopped server) for 142 threads (15 archived, 10 settled, 5 pinned, 3 snoozed, long, RTL, CJK and blank-title variants, a 1,003,399-byte message, a 60-run conversation). See `screens/fixtures.md`. Drift: seed thread "Explain the repository" gained one extra exchange after the baseline |
| Playwright            | `/tmp/t3code-pw` (outside the repo, never a dependency): `pair.mjs`, `shot.mjs`, `capture.mjs`, `states.json`, `state.json` (paired session labelled `shared-playwright-do-not-revoke`; never revoke it, area 11 once did). Names are the join key between before and after: never rename a label. Area 22 uses `ui-overhaul/screens/22/measure.mjs` and `profile.mjs`                                                                                                                                   |
| Baseline              | `ui-overhaul/screens/baseline/`: 252 PNGs (`MANIFEST.md`), 26 states at 1440x900 light+dark, 10 at five other viewports, 10 in five named themes, a 2x-DPR set in `dpr2/`                                                                                                                                                                                                                                                                                                                                |
| Mobile                | CocoaPods via Homebrew; iOS dev client built on simulator "iPhone 17" (`node scripts/mobile-native-client.ts ensure ios <udid>`); Metro with `vp run dev:client` from `apps/mobile`; XCUITest harness in `/tmp` (not in the repo)                                                                                                                                                                                                                                                                        |
| Repo state            | Branch `ui-overhaul/audit` at `d711b4a3` (local, unpushed); `ui-overhaul/` holds all Phase 1 output; fork `main` was about 3,002 commits behind upstream at checkout and will be fast-forwarded on push; screenshots go to the fork branch `ui-overhaul/assets`                                                                                                                                                                                                                                          |
| Verification commands | `vp test run <files>`, `vp lint <files>`, `vp run --filter <package> typecheck`, `vp run check:changed` before a push; browser tests are `*.browser.test.tsx` rendered with `await using screen = await render(...)`; no repo-wide runs                                                                                                                                                                                                                                                                  |

### 16.4 What was not tested

| Area                        | Not tested                                                                                                                                                                                                                                                                                                                                                                         | Consequence                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Android                     | No Android SDK, adb or emulator on the host. Every Android row is code-read (F-15-16, #21757, #23888, Material You)                                                                                                                                                                                                                                                                | Android chunks need a device before any claim of "fixed"                     |
| Windows and Linux rendering | No Windows or Linux host: caption buttons and traffic-light collisions (F-14-05), Windows High Contrast and forced colours (emulated only), AltGr layouts (F-21-08, F-21-11), Inter's first-paint swap, Segoe metrics, 125% and 150% scaling, `set`/`$env:` command forms                                                                                                          | A-1, A-2, A-7, P-21-7, P-14-* need a Windows pass                            |
| Real screen readers         | No VoiceOver, NVDA, JAWS or TalkBack session on web or native; only the accessibility tree, axe and iOS tree via XCUITest                                                                                                                                                                                                                                                          | Announcement wording is unproven                                             |
| Real first launch           | The shared dev server cannot produce one; onboarding times are keystroke-level estimates; the mobile `ConnectOnboarding` sheet was never captured; `npx t3` first launch (F-10-01) is code-read                                                                                                                                                                                    | Onboarding acceptance needs a clean `--home-dir` run                         |
| Others                      | Performance beyond one host (area 22 measured a production build at 1x and 4x CPU throttle on an Apple M5 Max with a headless 60 Hz clock, 142 threads, n=3 and n=1 for first send), real low-end hardware, hardware-GPU traces, 10,000-thread lists, OS sleep and resume, signed desktop builds and updates, Safari and Firefox, system theme switching on desktop, an RTL locale | Listed as live probes in `_FOLLOWUPS.md` (88 b rows; top ten in its Summary) |

### 16.5 Phase 2 preconditions

1. The user approves this spec explicitly; nothing starts on an implied yes.
2. Decisions 3 to 6 in section 15 are answered, or their stated defaults accepted in writing.
3. #24865 has merged (cut from `main`), or the user picks the head-branch option (decision 2).
4. Explicit consent to run browsers and computer use again (AGENTS.md; D-004); the dev server is started by us, with the commands in 16.3, never against `~/.t3/userdata`.
5. Fixtures rebuilt from `fixtures.md` in a fresh `--home-dir`, thread ids in `states.json` updated, and a masking pass agreed for new captures (the fork is public).
6. `ui-overhaul/audit` pushed to the fork, fork `main` fast-forwarded, the `ui-overhaul/assets` branch created for images.
7. Area 22's chunks (P-22-1 to P-22-5, 13.6) are accepted or revised, then the top ten live probes from `_FOLLOWUPS.md` run, starting with the browser-tab chord matrix (F-21-13) and the 16 ms wheel sampler (F-03-02).
8. Models fixed by the brief: Opus low or medium per card, Haiku for mechanical renames, never Opus high, never Fable; subagents do not launch their own dev servers (AGENTS.md); one primary agent integrates and does the single real-client pass.
9. The three Ideas drafts in 14.5 are posted only on the user's say-so, and only the PRs in batch U1 are opened until a maintainer responds.
10. Part B's provisional chunk labels are replaced using 13.3, and `_FINDINGS-INDEX.md` is regenerated after the severity changes in 13.1.

### Gaps in part C

- **Area 22 (performance feel) is chunked as P-22-1 to P-22-5.** F-22-01 (P1) is carried by P-22-1, the budget and bench that sit on top of the E-6 fix for F-03-04 (the audit says it is the same fix). F-22-06 to F-22-08 (P3) are deferred (13.15). The audit measured one host: medians of 3 (first send n=1), a headless 60 Hz clock, 142 threads, production build at 1x and 4x CPU throttle; its seven `Incomplete` and `Needs deeper look` items remain Phase 2 probes. `_FINDINGS-INDEX.md` was generated before area 22 finished and has 632 rows; the audits now hold 640 (P1 118, P2 318, P3 204 after the sweep), so the index and the counts in sections 1 and 5 of parts A and B need a regeneration.
- **`_FOLLOWUPS.md` Summary is present and folded in** (nothing left to wait for). Severity changes are applied in 13.1. Its new candidate findings have no ids, are not in the 640, and have no chunk yet: P1 desktop connection catalog that decrypts but fails to decode is replaced by an empty one with no quarantine (F-14-34), and a focusable 12 px `ConnectionStatusDot` with no visible focus; P2 sidebar rename lost on double-click of a non-active row, ChatGPT-sharing modal stacking over the wizard, `/pull-requests` skeleton forever without server config, PR list re-ranking as stats arrive, unavailable-reason tooltip only, undecryptable catalog shows nothing (F-14-35), iPhone landscape declared twice (F-15-20), diff scroll anchor not persisted, theme Inspector mislabels roles, pairing dialog density, zero-thread environment blank pane. Suggested homes once ids exist: P-14-*, A-3, S-22/S-23, E-3. Two conditional items (#16985 paste then image drops text, P1; #8963 Stop during approval loses typed text, P2) only count if the Phase 2 probe reproduces them.
- **Part B labels are replaced here but not edited there.** 13.3 gives the mapping; the lead must apply the rename pass in `B-sections-07-12.md` section 12. Part B's owner decisions D1, D2, D3, D-M1 are carried to section 15 with recommendations; the Part B default for each is what the cards assume.
- **Index quality.** `_FINDINGS-INDEX.md` has 23 rows (areas 12 and 21) whose title column holds DNA ids because the effort or title cell shifted; chunk titles and ids here come from the audit headings, and all 632 indexed ids and severities match the audit files (area 22's 8 are not in the index). Regenerate the index after the severity changes in 13.1.
- **Files are a starting point.** They come from the finding's Evidence and Proposed text; 19 findings name no resolvable file, and for findings whose Proposed text names none the first three Evidence files are used, so a card can list a read-only call site or miss an edited one. T5 to T9 are codemods whose real file set is a pattern, not a list. #24865 overlap is by file name against its 55-file diff, so it over-reports (a shared file is not a conflicting hunk) and the head of #24865 may still move.
- **Estimates are not spiked.** Lines follow the effort letter (XS 15, S 55, M 160, L 420) except 22 adjusted chunks; none was prototyped. Model effort (Opus low or medium) follows size and subtlety, not a trial run.
- **Before images.** 433 of 640 findings cite no screenshot (code-read, or an image outside the screens folder); those cards use baseline labels or say "none captured". The baseline matrix has six viewports for ten labels only; other labels exist at 1440x900. There is no Windows, Linux or Android baseline. After-image paths `ui-overhaul/screens/<chunk-id>/` follow `screens/capture.md`; the `ui-overhaul/assets` branch is not yet created.
- **Tests.** "Existing tests" are found by file-name convention beside the cited files; other tests may cover the same code. Test names in cards are not run; none of this plan was executed.
- **Upstream flags** are the audit's per-finding "Upstream-eligible" lines aggregated per chunk (any "no" makes the chunk "no" unless the reason is only a #24865 overlap), plus the file-overlap check above. A merged `takeover` PR or a maintainer fix can remove a chunk at any time; the 37 open `takeover` PRs are in `PRS.md`.
- **Draft PR bodies** carry real Phase 1 evidence but empty verification results; every `[result]` and `UPLOAD:` slot is for the Phase 2 run. Draft 2 needs #24865 merged first because `BranchToolbarBranchSelector.tsx` is in its diff.
- **Totals differ from part A section 1** on purpose: part A counts per-finding flags (441 yes), this part counts per chunk after merging findings that share a fix (F-01-01 with F-23-04, F-12-05 with F-02-14, F-09-19 with F-20-01, F-05-19 with F-10-19, F-03-31 with F-10-17, F-16-04 stays alone).
- **Recorded but not decided here:** whether the two chunks that need a server change (O-2, S-15) are opened as issues by us or left to maintainers; who posts the Ideas drafts (nothing is posted in Phase 1).

## Reconciliation notes (orchestrator review)

Conflicts between the independently drafted parts, with the ruling applied to this spec:

| #   | Conflict                                                                                                                                          | Ruling                                                                                                               | Why                                                                                                                                                                                                                                                                                                                                                                                   |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| R1  | §12.4 and "Gaps in part B" treat the compact-before-send off switch (Ideas #17170) as a gap; §13.4 card T0 and §15.7 say it exists                | §15.7 stands: it exists                                                                                              | `packages/contracts/src/settings.ts:639-647` defines `IDLE_COMPACTION_MODES` and the server setting `compactIdleThreads`, surfaced in `apps/web/src/components/settings/SettingsPanels.tsx` (Settings > General > Compact idle threads). The remaining work is discoverability only (tooltip link from the "Compact next" pill, card T0 note). Area 23 correctly did not mark it new. |
| R2  | §11.2 proposes `text-foreground` for the user-bubble label; §15.11 keeps `text-muted-foreground`                                                  | §15.11 stands (decision with recommendation: keep muted, raise the muted step to a ≥4.5:1 value via the token chunk) | The contrast failure is fixed at the token level by the grey-ladder chunk in §13.4, which lifts every muted site at once; switching one label to full foreground would break the DNA hierarchy rule that labels sit one step below body text (DNA-T* ladder, §4).                                                                                                                     |
| R3  | §2 "Corrections pending" (menus do not animate; DNA-S1 radius ladder)                                                                             | Applied                                                                                                              | Corrections appended to `ui-overhaul/DNA.md` as a dated section from `audit/_FOLLOWUPS.md`; originals left in place for traceability.                                                                                                                                                                                                                                                 |
| R4  | §7 relies on `DOCS-DIGEST.md` customisation table, which area 23 found wrong in 9 rows                                                            | Area 23 stands                                                                                                       | Corrected rows appended to `ui-overhaul/DOCS-DIGEST.md` as a dated section.                                                                                                                                                                                                                                                                                                           |
| R5  | F-03-15 (Claude text never streams) raised to P1 by the follow-up sweep; its fix is in `apps/server` (`ClaudeAdapterV2.ts`, no `text_delta` case) | Severity P1 accepted; chunk stays "upstream issue draft only"                                                        | `apps/server` is outside the change scope of this overhaul (kickoff hard-stop list). The fork must not patch it; §14 carries a draft issue, not a PR.                                                                                                                                                                                                                                 |

## Self-check (kickoff section 9)

| Question                                                        | Answer              | Evidence                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------------------------------------------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Did I run and use the app?                                      | Yes                 | Dev server with `--home-dir /tmp/t3code-overhaul --no-seed` on ports 13773/5733; 24 areas probed live via Playwright (`/tmp/t3code-pw`, 252 baseline captures plus per-area folders); desktop via Electron CDP on port 9222 (area 14); iOS dev client on the iPhone 17 simulator via an XCUITest harness in /tmp (area 15); CLI threads sent through Codex and Claude providers. Android, Windows/Linux rendering, real screen readers and a true first launch were not exercised (see §16). |
| Did any proposal flatten DNA?                                   | No, by construction | Every finding carries a `DNA:` line (632/632 indexed; 1 row lacks an id and is P3). Area 23 rejected 11 customisation candidates on DNA grounds (standalone accent, density, start-up view, confirm-before-settle). Owner calls that stay are listed in §2 and repeated on every Tokens card: blue switch accent, model logo brand colour, three-line sidebar rows, #0a0a0a canvas, panels at 0 ms.                                                                                          |
| Did I propose anything already in docs/user?                    | Caught and removed  | Area 23's "exists" column marks 11 of 27 candidates as existing; the follow-up sweep corrected 9 wrong rows in DOCS-DIGEST (settings that do exist); the compact-before-send off switch (#17170) is ruled "exists" in R1. Only discoverability fixes remain for those.                                                                                                                                                                                                                       |
| Is every Proposed specific enough for an Opus low-effort agent? | Yes for P1/P2       | Each `- Proposed:` names file, token/class/value or predicate and an acceptance check; §13 cards add files, estimated lines, tests, before-image set and model. Area 22 (8 findings, measured last) is indexed and chunked in §13.6.                                                                                                                                                                                                                                                         |
| Did I ask the user anything mid-run?                            | No                  | One hard stop (HS-001, Sonnet rate limit) was logged, defaulted (wait for reset, resume same agents) and continued. The user's one mid-run instruction ("be cheaper") was absorbed as decision D-008 without a question back.                                                                                                                                                                                                                                                                |
| Did Phase 2 start anywhere?                                     | No                  | No PR, issue, discussion or comment was created on any repository; §14 PR bodies and Ideas posts are drafts on disk only. The only pushes are to the fork branch `ui-overhaul/audit` (and a fast-forward of the fork's `main` to upstream).                                                                                                                                                                                                                                                  |
