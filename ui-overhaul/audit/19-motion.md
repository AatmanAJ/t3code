# 19 Motion audit

Scope: every transition/animation in `apps/web/src` and `apps/mobile/src`, the Panel animations client setting, missing motion, rule violations, reduced-motion coverage, idle paint cost. Skeleton/loading belongs to 13 and general performance to 22. Overlaps with earlier areas are cross-referenced, not re-filed: F-01-31 (route modal and sheet reduced motion), F-03-36 (fork pulse), F-04-19 (send button scale), F-05-32 (tree spin), F-07-27 (slider vs OS setting).

Method: code read of `index.css`, `components/ui/*`, `panelAnimations.ts`, `Sidebar.motion.ts`, `AnimatedHeight/Width`, `MorphIcon`; grep inventory; Playwright runs on `localhost:5733` with `reducedMotion: reduce | no-preference` (scripts `/tmp/t3code-pw/b19-*.mjs`); CDP tracing for idle paints. Screens in `ui-overhaul/screens/19/`.

## Live verification (Playwright, `localhost:5733`, dark, 1440x900; `reducedMotion` emulation = what `shot.mjs --reduced true` sets)

Scripts `/tmp/t3code-pw/b19-*.mjs` (shot.mjs cannot press keys, so a custom script with the same context options was used). All in-page sampling used `getAnimations()` / per-frame `getComputedStyle` over `requestAnimationFrame`.

| Surface                                                  | normal                                                                                                                                                                               | prefers-reduced-motion: reduce                                     | Verdict                                                             |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------ | ------------------------------------------------------------------- |
| Command palette (Cmd+K)                                  | opacity+scale transitions, 200 ms, `cubic-bezier(0.4,0,0.2,1)`; backdrop opacity 200 ms                                                                                              | identical (3 transitions, 5 mid-opacity frames)                    | FAIL (F-19-02)                                                      |
| Anchored toast ("Failed to copy" via rejected clipboard) | opacity 150 ms + scale 150 ms + 200 ms wrapper                                                                                                                                       | identical                                                          | FAIL (F-19-02)                                                      |
| Send button hover                                        | scale 1.00 -> 1.0497 over ~150 ms                                                                                                                                                    | identical                                                          | FAIL (F-19-02, F-04-19)                                             |
| Settings route modal (click Settings)                    | opens at opacity 1 on the first frame (no enter); closes with 150 ms fade/scale (measured 0.46 opacity at 40 ms after Esc)                                                           | same                                                               | FAIL enter missing (F-19-01)                                        |
| Git action menu                                          | 0 transitions, opacity 1 on first frame                                                                                                                                              | same                                                               | inconsistent (F-19-05)                                              |
| Tooltip                                                  | ~100 ms visible fade                                                                                                                                                                 | same                                                               | FAIL (F-19-02)                                                      |
| "Worked for 17s" row, changed-files tree                 | no height/opacity motion, only chevron + colour 150 ms                                                                                                                               | same                                                               | PASS (instant by design in a virtualized timeline)                  |
| Panels, Panel animations = 0 (default)                   | `data-panel-animations="false"`; sidebar 256->0 px and diff panel in 0 mid frames, settled at ~50 ms (input latency)                                                                 | n/a                                                                | PASS                                                                |
| Panels, Panel animations = 200 ms                        | `data-panel-animations="true"`, `--panel-animation-duration: 200ms`; sidebar collapse 11 mid frames, open 10, diff open 9, diff close 10; settled 230-267 ms measured from key press | 200 ms + reduce: flag `false`, widths jump 256 -> 0, no mid frames | PASS (gate and OS override work); UI still shows "200 ms" (F-07-27) |
| Idle thread, 5 s CDP trace                               | `getAnimations()` = 0; 44 compositor begin-frames (blank-page baseline)                                                                                                              | identical                                                          | PASS                                                                |
| Injected probes, 5 s begin-frames                        | idle 44; `animate-pulse` (unstepped) 301; `animate-status-pulse` 90; `animate-skeleton` 100; Spinner (`visible-animate-spin`) 301                                                    | n/a                                                                | unstepped loops cost ~7x idle (DNA-M2)                              |

Evidence files in `ui-overhaul/screens/19/`: `19-panel-animations-0ms-dark-960x600.webm`, `19-panel-animations-200ms-dark-960x600.webm` (sidebar toggle then diff panel toggle, 960x600 recording), `19-thread-idle-reduced-dark-1440x900.png`, `19-command-palette-reduced-dark-1440x900.png`, `19-diff-panel-open-reduced-200ms-dark-1440x900.png`, `19-settings-motion-reduced-dark-1440x900.png`. Privacy: every capture was viewed or a frame from it was; only synthetic seed data (sample-app, seed thread id `mcp:4db596b5...`), no email, home path or account names. Nothing withheld. No messages sent, no terminals opened, no settings persisted (setting overrides lived in throwaway contexts).

## Panel animations setting: behaviour

- Contract: `panelAnimationDurationMs`, 0-400 in 25 ms steps, default 0 (`settings.ts:113-122,323-326`); slider at `AppearanceSettingsPanel.tsx:381-418` with a replay preview (`PanelAnimationsPreview.tsx`, `motion-reduce:transition-none`).
- Mechanics: `AppSidebarLayout.tsx:361,389` publishes `--panel-animation-duration` and `data-panel-animations`. `usePanelAnimationSettings` (`panelAnimations.ts:30-38`) is active only when duration > 0, OS reduce is off, and navigation is not suppressed (two animation frames after a route change). `usePanelPresence` keeps a closing panel mounted for `durationMs`.
- Consumers gated by it: sidebar gap, fixed panel and rail (`ui/sidebar.tsx:311,323,522`), preview panel width (`PreviewPanelShell.tsx:142`), terminal drawer rows (`PersistentThreadTerminals.tsx:255`), chat `padding-left` (`ChatView.tsx:3193`), page header (`WorkspacePageHeader.tsx:18`), layout-control opacity (`PanelLayoutControls.tsx:198`), PR page right panel (`PullRequestsPage.tsx:1305`), narrow-width sheet (`ChatView.tsx:3882` passes 0 when inactive), composer resting transition (`useComposerSend.ts:921`).
- Not governed by it (always on, by design or drift): dialogs, route modals, popovers, tooltips, toasts, collapsibles, `AnimatedHeight/Width`, sidebar list reorder, MorphIcon, streaming fade (DRIFT-18; F-19-02, F-19-10).
- Easing is `ease-out` in both directions (F-19-08). Mobile has no equivalent setting (grep `panelAnimation` in `apps/mobile`: none).

## Inventory: web (`apps/web/src`)

Counts: 38 `duration-150`, 23 `duration-200`, 6 `duration-100`, 4 `duration-180`, 3 `duration-220`, 2 `duration-500`, 2 `duration-300`, 1 each 250/140/120 ms; 10 `animate-status-pulse`, 7 `animate-spin`, 7 `animate-skeleton`, 3 `animate-status-ping`, 1 `animate-pulse`; 6 `transition-all`; no animation library except `@formkit/auto-animate` (LegacySidebar only) and `morphicons`. Only global rule: `.no-transitions` (`index.css:1086-1092`); there is no global `prefers-reduced-motion` rule.

| Element                                                                                                                                          | Duration / easing                                                                                                        | Trigger                 | Reduced motion                                          |
| ------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------ | ----------------------- | ------------------------------------------------------- |
| Sidebar, right/diff/preview panel, terminal drawer, header padding                                                                               | 0-400 ms (default 0), ease-out                                                                                           | toggle, key, rail       | auto off via `panelAnimations.ts:35`                    |
| Sidebar drag resize                                                                                                                              | 0 ms forced (`ui/sidebar.tsx:425`)                                                                                       | pointer drag            | n/a                                                     |
| Dialog popup + backdrop (`dialog-styles.ts:2,5`)                                                                                                 | 200 ms, ease-in-out `(.4,0,.2,1)`; scale .98 + opacity + translate; nested stack scale/translate                         | open/close              | none                                                    |
| Route modal Settings/Usage (`AppRouteModal.tsx:55`)                                                                                              | 150 ms ease-out, scale .985 + opacity, exit only                                                                         | close                   | none                                                    |
| Sheet (`ui/sheet.tsx:22,93`)                                                                                                                     | 200 ms ease-in-out, translate 2rem + opacity; `transitionDurationMs` override                                            | open/close              | none                                                    |
| Popover, tooltip, combobox, autocomplete, preview card                                                                                           | default 150 ms ease-in-out, scale .98 + opacity                                                                          | open/close              | none                                                    |
| Menu popup, select popup                                                                                                                         | none (measured)                                                                                                          | open/close              | n/a                                                     |
| Stacked toast (`toast.tsx:568,644`)                                                                                                              | transform 500 ms `(.22,1,.36,1)`, opacity 500 ms, height 150 ms; content opacity 250 ms; same on exit                    | add/dismiss/restack     | none                                                    |
| Anchored toast                                                                                                                                   | 150 ms scale + opacity (measured)                                                                                        | add                     | none                                                    |
| Switch / menu switch thumb                                                                                                                       | 200 ms bg + shadow                                                                                                       | toggle                  | none                                                    |
| Buttons (`button.tsx:9`)                                                                                                                         | 150 ms box-shadow + scale, `active:scale-[0.97]`                                                                         | hover/press             | none                                                    |
| Send button (`ComposerPrimaryActions.tsx:313`)                                                                                                   | `transition-all` 150 ms, `hover:scale-105`                                                                               | hover                   | none (F-04-19)                                          |
| Collapsible, `AnimatedHeight` (wizard, AddEnvironmentDialog, Integrations), `AnimatedWidth` (PR actions)                                         | height 200 / width 150 ms ease-out, 250 ms fallback timer                                                                | content change          | `motion-reduce:transition-none`                         |
| Git output, PR detail sections                                                                                                                   | `grid-template-rows` + opacity 200 ms ease-out (`GitActionsControl.tsx:391,430`, `PullRequestDetailPanel.tsx:1388,1470`) | content appears         | `motion-reduce:transition-none`                         |
| MorphIcon (~45 sites, `MorphIcon.tsx`)                                                                                                           | spring "snappy" k=420 c=30, rAF-driven                                                                                   | state toggle            | `reducedMotion="user"` default                          |
| Sidebar list rows (`Sidebar.motion.ts`)                                                                                                          | 150 ms ease-out WAAPI enter/exit/move; skipped above 40 changed rows                                                     | reorder, section change | honours reduce                                          |
| LegacySidebar lists                                                                                                                              | auto-animate 180 ms ease-out                                                                                             | reorder                 | library default honours reduce                          |
| Sidebar row hover actions                                                                                                                        | instant after #24865 (was `transition-opacity`)                                                                          | hover                   | n/a                                                     |
| Streaming markdown block (`index.css:2107-2122`)                                                                                                 | 600 ms ease-out opacity, `@starting-style`, `data-streaming` only                                                        | new block               | only under `no-preference`                              |
| Status pulse / ping / skeleton / live-tool-shine / live-activity-focus / Spinner                                                                 | stepped 2-2.4 s loops; spin 1 s linear; paused off-screen                                                                | working states          | `motion-safe:` or media query (DNA-K5)                  |
| Raw `animate-spin` x3, `animate-pulse` x1                                                                                                        | 1 s linear, 2 s pulse, unstepped                                                                                         | busy                    | none (F-19-06)                                          |
| Settings search pulse (`index.css:900-914`)                                                                                                      | 650 ms x2 box-shadow                                                                                                     | jump to setting         | class not added under reduce (`settingsLayout.tsx:150`) |
| Preview load bar                                                                                                                                 | 5.3 s decelerating, then 150 ms fade                                                                                     | page load               | media query, static                                     |
| Composer: banner stack, context label, stash badge, attachment strip, find bar                                                                   | 220 ease-in exit; 180 ease-drawer; 180; 300 ease-drawer; 150                                                             | state change            | `motion-reduce` on most                                 |
| Mobile-width composer view transition (`index.css:17-76`)                                                                                        | var duration, cubic-bezier                                                                                               | route change            | `draftHeroTransition.ts:50` honours reduce              |
| Theme swap                                                                                                                                       | 0 (`.no-transitions`)                                                                                                    | palette change          | n/a                                                     |
| Scrollbars                                                                                                                                       | opacity 150 ms + 300 ms delay (`scroll-area.tsx:87`)                                                                     | scroll                  | none                                                    |
| Context meter, update icon, update pill (`ContextWindowMeter.tsx:82,126`, `DesktopUpdateStatusIcon.tsx:84`, `SidebarProviderUpdatePill.tsx:141`) | 500, 300, 180 ms                                                                                                         | usage tick, download    | `motion-reduce` on first two                            |

## Inventory: mobile (`apps/mobile/src`)

`react-native-reanimated` 4.7.1 plus one RN `Animated.loop`. Tokens `MOBILE_MOTION = { adjust: 120, enter: 200, exit: 150 }` (`lib/designTokens.ts:7`). 32 files animate; each uses `ReduceMotion.System` or relies on Reanimated 4's default of System. Layout transitions: `THREAD_SIDEBAR_ROW_LAYOUT` 180 ms, PR rows, composer height (`ThreadComposer.tsx:288`), swipe rows (spring with `overshootClamping: true`, `thread-swipe-actions.tsx:54`), dismissal 220/180 ms ease-out cubic. The only infinite loop is the work-log shimmer (`thread-work-log.tsx:299`), which stops on reduce, blur and off-focus. Off-ladder: 260 ms `inOut` workspace panes (`workspace-pane-animation.ts:5`), 260 ms `inOut` dictation flip and voice control (`ComposerDictationControl.tsx:28`, `GlobalVoiceInputControl.tsx:30`), 240 ms floating control (`floating-working-control.tsx:42`), 250 ms row layout (`ConnectionEnvironmentRow.tsx:94`). No Panel animations setting.

## Findings

### F-19-01 Settings and Usage modals have no enter animation, only an exit

- Severity: P2
- Surface: web (desktop wraps it)
- Evidence: `AppRouteModal.tsx:17` mounts `useState(true)`, so Base UI never plays `data-starting-style`; popup class at `:55` only defines the exit/start values. Measured: `[data-app-modal]` is at opacity 1, scale `none` on its first frame (49 frames sampled, 0 mid-opacity frames, `/tmp/t3code-pw/b19-startingstyle.mjs`); on Esc it fades (0.46 at 40 ms). Injecting `@starting-style { [data-app-modal] { opacity: 0; scale: .985 } }` gave 4 mid frames over ~93 ms, so the fix works.
- Current: the largest surface in the app (89% of the window) pops in and fades out; the command palette, which uses the same primitives, fades in.
- Proposed: in `AppRouteModal.tsx:55` add `starting:opacity-0 starting:scale-[0.985]` to the popup (keeps 150 ms `ease-out`), and in `dialog-styles.ts:2` add `starting:opacity-0` to the backdrop base so the veil fades in with it (Tailwind `starting:` is already used at `ComposerStashBadge.tsx:20`). Do not change the open state logic.
- DNA: DNA-M4 (150-200 ms popups/modals), DNA-M5
- Effort: XS
- Risk: `settingsLayout.tsx:130-140` waits on `data-starting-style` for scroll targeting; recheck deep-link scroll to a setting. No test covers it.
- Upstream-eligible: yes
- #24865: not addressed

### F-19-02 Reduced motion is honoured only where each class remembered it; overlays, toasts and press feedback keep animating

- Severity: P2
- Surface: all (web, desktop)
- Evidence: measured under `reducedMotion: reduce`: command palette popup and backdrop still run 200 ms opacity/scale, anchored toast 150 + 200 ms, send button scales to 1.0497, tooltip still fades (`b19-reduced3.json`, `b19-reduced.json`). Code: no `motion-reduce` in `dialog-styles.ts`, `sheet.tsx`, `popover.tsx`, `tooltip.tsx`, `combobox.tsx`, `autocomplete.tsx`, `preview-card.tsx`, `switch.tsx`, `toast.tsx`, `button.tsx`; no global `@media (prefers-reduced-motion)` for transitions. F-01-31 and F-04-19 file two instances; area 16 measured the same.
- Current: 36 `motion-reduce:` uses cover the layout-ish transitions; every overlay and the global button press do not.
- Proposed: one rule next to `.no-transitions` (`index.css:1086`): `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { transition-duration: 0s !important; transition-delay: 0s !important; } }`. Leave `animation-*` alone (all keyframes are already `motion-safe`/media gated, DNA-K5) and leave MorphIcon (`reducedMotion="user"`) and the WAAPI paths (they read the media query themselves). This closes F-01-31 and the reduced half of F-04-19 without touching 10 files.
- DNA: DNA-M5, DNA-M8 (same mechanism as the theme-swap window)
- Effort: XS
- Risk: Base UI close waits for transitions; at 0 s it unmounts immediately (intended). `AnimatedHeight` relies on `transitionend` but has a 250 ms fallback timer (`AnimatedHeight.tsx:5`), already the case with its `motion-reduce:transition-none`. Test with Settings open/close and a toast under emulation; no unit tests cover this.
- Upstream-eligible: yes (single small block)
- #24865: not addressed

### F-19-03 Stacked toasts move for 500 ms in both directions, with no reduced-motion branch

- Severity: P2
- Surface: all
- Evidence: `toast.tsx:568` `[transition:transform_.5s_cubic-bezier(.22,1,.36,1),opacity_.5s,height_.15s]` applies to enter, exit and restack; `:644` content `transition-opacity duration-250`. Enter travels the full toast height plus `--toast-inset` (32 px). The stacked toast could not be triggered without a real error, so this is code-read; the anchored variant measured 150 ms (fine).
- Current: 500 ms ease-out on enter and on exit (exit should accelerate away), 2.5x the 200 ms ceiling; every dismiss also restacks the others over 500 ms.
- Proposed: in `toast.tsx:568` replace with `[transition:transform_200ms_var(--ease-drawer),opacity_150ms_ease-out,height_150ms_ease-out] data-ending-style:[transition-duration:150ms] data-ending-style:ease-in`; at `:644` change `duration-250` to `duration-150`. Reduced motion then comes from F-19-02.
- DNA: DNA-M4, DRIFT-18
- Effort: XS
- Risk: swipe-to-dismiss uses `--toast-swipe-movement-*` through the same transform; recheck release snap-back. `toast.logic` tests do not cover timing.
- Upstream-eligible: yes
- #24865: not addressed

### F-19-04 Every overlay eases in-out in both directions, and backdrops use `transition-all`

- Severity: P3
- Surface: all
- Evidence: measured easing `cubic-bezier(0.4,0,0.2,1)` on palette popup, backdrop, anchored toast; code: `dialog-styles.ts:2,5` (`ease-in-out`, `transition-all`), `sheet.tsx:22,93`, popover/tooltip/combobox/autocomplete/preview-card with no easing (Tailwind default is the same curve; no `--default-transition-timing-function` is set).
- Current: enter and exit decelerate and accelerate identically, so overlays feel soft on entry; `transition-all` on two full-screen `backdrop-filter` layers lets any future property change animate.
- Proposed: in the `@theme` block next to `--ease-drawer` (`index.css:192`) add `--default-transition-timing-function: cubic-bezier(0, 0, 0.2, 1);` (ease-out for every hover/popup enter), add `data-ending-style:ease-in` to the popup strings in `dialog-styles.ts:5`, `sheet.tsx:93`, `popover.tsx:90`, `tooltip.tsx:140`, `combobox.tsx:167`, `autocomplete.tsx:105`, `preview-card.tsx:33`, `AppRouteModal.tsx:55`, and change both backdrops to `transition-opacity duration-200 ease-out data-ending-style:ease-in`.
- DNA: DNA-M4 (ease-out; ease-in on exit per brief)
- Effort: S
- Risk: the token change touches ~270 `transition-*` uses (hover colours become ease-out); needs a visual pass. No tests.
- Upstream-eligible: no (global feel change; propose as an issue first)
- #24865: not addressed

### F-19-05 Menus and selects have no motion while popovers, tooltips and comboboxes do

- Severity: P3
- Surface: all
- Evidence: measured Git action menu: 0 transitions, opacity 1 on frame one; `menu.tsx:61` popup has no transition classes, `select.tsx` popup likewise; `popover.tsx:90` and `combobox.tsx:167` animate scale .98 + opacity at 150 ms. DNA section 7.1 says popovers/menus animate; menus do not.
- Current: two overlay systems; the menu looks cut next to the popover opened from the neighbouring button.
- Proposed: enter only, keep close instant for snappy keyboard use: in `menu.tsx:61` and the select popup add `origin-(--transform-origin) transition-[scale,opacity] duration-120 ease-out data-starting-style:scale-98 data-starting-style:opacity-0`. No `data-ending-style` classes, so Base UI unmounts immediately.
- DNA: DNA-M4 (100-150 ms for hover/press, 150-200 popups; 120 ms is the ladder floor), DNA-ID3
- Effort: XS
- Risk: first-frame hit-testing on a 120 ms fade; confirm typeahead and submenu hover timing. Menu browser tests do not assert styles.
- Upstream-eligible: yes
- #24865: not addressed (diff only changes a menu stroke width)

### F-19-06 Four hand-rolled `animate-spin` / `animate-pulse` loops bypass the shared Spinner

- Severity: P2
- Surface: all
- Evidence: `ThreadRelationshipsControl.tsx:633,672`, `ThreadLineageWorkflowRow.tsx:161` (`LoaderCircleIcon ... animate-spin`), `TimelineAssistantRows.tsx:118` (`animate-pulse`, F-03-36). Not `motion-safe`, not paused off-screen. Measured 5 s begin-frames: idle 44, unstepped `animate-pulse` 301, stepped `animate-status-pulse` 90.
- Current: they keep spinning under reduce and when scrolled away; the pulse repaints at display rate (DNA-M2).
- Proposed: replace each with `<Spinner size="xs" aria-hidden />` (`ui/spinner.tsx`, `motion-safe:visible-animate-spin`, off-screen pause); for the fork icon follow F-03-36. Keep `size-3` layout (xs = `size-3`).
- DNA: DNA-M2, DNA-M5, DNA-M6, DRIFT-8
- Effort: XS
- Risk: Spinner adds `role="status"`; pass `aria-hidden` where the neighbouring text already names the state.
- Upstream-eligible: yes
- #24865: not addressed (diff edits `ThreadRelationshipsControl.tsx` elsewhere)

### F-19-07 MorphIcon's default spring overshoots and runs past 250 ms

- Severity: P3
- Surface: web, desktop
- Evidence: `MorphIcon.tsx:3` passes no `spring`; library default is `snappy` (k=420, c=30, zeta 0.73): overshoot about 3.5%, 2% settle about 270 ms (`morphicons/dist/dom.js:73`, README section 7). About 45 call sites (copy checks, chevrons, panel toggle, send/queue).
- Current: copy and chevron morphs overshoot slightly ("subtle bounce") and finish after the 220 ms ceiling.
- Proposed: in `MorphIcon.tsx` set `spring = CRITICAL_SPRING` with `const CRITICAL_SPRING = { stiffness: 700, damping: 53 }` (zeta 1.0, no overshoot, 5% settle about 180 ms, 2% about 220 ms), still overridable by props; keep `reducedMotion = "user"`.
- DNA: DNA-M4, DNA-I7
- Effort: XS
- Risk: icon morph feel changes everywhere; eyeball copy/chevron/toast icons. No tests.
- Upstream-eligible: yes
- #24865: not addressed

### F-19-08 Panels ease out on close too, and the slider can exceed the ladder

- Severity: P3
- Surface: web, desktop
- Evidence: `ui/sidebar.tsx:311,323,522`, `PreviewPanelShell.tsx:142`, `ChatView.tsx:3193` all use `ease-out` for both directions (measured 11 mid frames collapsing, 10 opening at 200 ms). Slider max 400 ms (`settings.ts:113-122`).
- Current: collapse decelerates into the edge instead of accelerating away. The 400 ms top end is the user's choice (DNA-K4: keep range and default 0).
- Proposed: add the closing curve per state: on the sidebar gap and fixed panel add `[[data-panel-animations=true]_&]:group-data-[state=collapsed]:ease-in` (verify generated order after the `ease-out` class); in `PreviewPanelShell.tsx:142` use `open ? "ease-out" : "ease-in"` inside the gate. Do not change range or default.
- DNA: DNA-M1, DNA-M4, DNA-K4
- Effort: S
- Risk: only visible when the user raises the slider; Tailwind variant order must be checked in the built CSS.
- Upstream-eligible: yes
- #24865: not addressed

### F-19-09 Four durations sit above 220 ms

- Severity: P3
- Surface: web, desktop
- Evidence: `ContextWindowMeter.tsx:82,126` `duration-500` on `stroke-dashoffset` and bar `width` (restarts on each usage update during a turn); `DesktopUpdateStatusIcon.tsx:84` `duration-300`; `ComposerAttachmentStrip.tsx:101` `duration-300` (also F-04-19); toast values in F-19-03.
- Current: slow meter that is always mid-transition while streaming; two 300 ms one-offs.
- Proposed: `ContextWindowMeter.tsx:82,126` `duration-200`; `DesktopUpdateStatusIcon.tsx:84` `duration-200`; `ComposerAttachmentStrip.tsx:101` `duration-200`.
- DNA: DNA-M4, DNA-M3 (bar width stays small and local)
- Effort: XS
- Risk: visual only.
- Upstream-eligible: yes
- #24865: not addressed

### F-19-10 Small layout transitions run outside the panel gate

- Severity: P3
- Surface: web, desktop
- Evidence: `GitActionsControl.tsx:391,430` and `PullRequestDetailPanel.tsx:1388,1470` animate `grid-template-rows` 200 ms ungated; census at idle shows `transition-[width,height,padding]` on every sidebar menu button (`ui/sidebar.tsx:685`, 6 buttons in the area-16 idle census `a16-motion.json`). DNA-M3 allows width/height/grid-row only behind the gate or in `AnimatedHeight`.
- Current: a user at the default 0 ms still gets per-frame layout on these subtrees; the sidebar button transition is inert but declared.
- Proposed: in the four grid-row sites use `transition-opacity duration-150 ease-out [[data-panel-animations=true]_&]:transition-[grid-template-rows,opacity] [[data-panel-animations=true]_&]:duration-(--panel-animation-duration)`; in `sidebar.tsx:685` replace `transition-[width,height,padding]` with the same gated form.
- DNA: DNA-M1, DNA-M3, DNA-P1
- Effort: S
- Risk: these regions then appear instantly by default; matches panels. No tests.
- Upstream-eligible: yes
- #24865: not addressed

### F-19-11 The settings-search highlight animates `box-shadow` twice for 650 ms

- Severity: P3
- Surface: web, desktop
- Evidence: `index.css:900-914` `settings-search-target-pulse 650ms ease-in-out 2` on `box-shadow` (DNA-M2 names box-shadow animations as rejected); only skipped under reduce by JS (`settingsLayout.tsx:150`).
- Current: two paint-bound pulses (1.3 s) on arrival.
- Proposed: draw the ring on a pseudo-element and animate opacity once: `.settings-search-target-pulse::after { content: ""; position: absolute; inset: 0; border-radius: inherit; box-shadow: inset 0 0 0 2px color-mix(in oklab, var(--color-primary) 70%, transparent); pointer-events: none; animation: settings-search-target-pulse 400ms ease-out 1 }` with keyframes `0% { opacity: 0 } 30% { opacity: 1 } 100% { opacity: 0 }` (target gets `position: relative`).
- DNA: DNA-M2, DNA-M3
- Effort: S
- Risk: `position: relative` on `section > div:first-child` targets may shift absolutely positioned children; check Providers and Appearance sections.
- Upstream-eligible: yes
- #24865: not addressed

### F-19-12 Three ping dots carry an inert `duration-2000` class

- Severity: P3
- Surface: web
- Evidence: `ConnectionStatusDot.tsx:21`, `AuthorizedClientsSettings.tsx:544`, `CloudEnvironmentConnectList.tsx:430`. The element only runs the keyframe `--animate-status-ping: status-ping 2s` (`index.css:224`); `transition-duration` does nothing.
- Current: suggests a second timing source that does not exist; invites a wrong edit.
- Proposed: delete `duration-2000` from the three class strings.
- DNA: DNA-M4
- Effort: XS
- Risk: none.
- Upstream-eligible: yes
- #24865: not addressed

### F-19-13 Five mobile animations bypass `MOBILE_MOTION` and use 240-260 ms in-out

- Severity: P3
- Surface: mobile
- Evidence: `workspace-pane-animation.ts:5-6` (260 ms `Easing.inOut`), `ComposerDictationControl.tsx:28-29` (260 inOut), `GlobalVoiceInputControl.tsx:30` (260), `floating-working-control.tsx:42` (240 out), `ConnectionEnvironmentRow.tsx:94` (`LinearTransition.duration(250)`). Tokens are 120/200/150 (`designTokens.ts:7`).
- Current: the main open/close motions on tablets and the dictation flip are the slowest on the mobile side and ease in and out symmetrically.
- Proposed: `WORKSPACE_PANE_TIMING` -> `{ duration: MOBILE_MOTION.enter, easing: Easing.out(Easing.cubic) }` (symmetric on purpose, as its comment requires); dictation and voice flips 200 ms `Easing.out(Easing.cubic)`; floating control 200; row layout `LinearTransition.duration(MOBILE_MOTION.enter)`.
- DNA: DNA-M4, DNA-X (cross-surface)
- Effort: S
- Risk: pane and center-pane coupling ("wobble" comment); test on iPad layouts. No tests assert timings.
- Upstream-eligible: yes
- #24865: not addressed (mobile diff only touches settings copy)

## Edge-case results (matrix)

| Row                                                     | Result                                                                                                                      |
| ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| Data: empty / one / 100+ rows                           | PASS code-read: `Sidebar.motion.ts` skips animation above 40 changed rows (`MAX_FADED_ROWS_PER_UPDATE`)                     |
| Data: 10,000+ items, long names, unicode, RTL           | NOT TESTED (no motion dependency; area 22/02)                                                                               |
| Content: streaming unterminated fences, tables          | PASS code-read: streaming fade is opacity-only per block, gated on `data-streaming`                                         |
| Agents: stream cancelled / two or six threads streaming | NOT TESTED live (no agent turns run; paid). Code: every loop pauses off-screen via `visibleAnimation.ts`                    |
| Agents: permission prompt mid-stream                    | see F-03 cross-lead: `live-tool-shine` keeps running while awaiting approval (area 03 finding)                              |
| Viewport 1440x900                                       | PASS (all live runs)                                                                                                        |
| Viewport 1280x720, 1024x640, 800x600, 3440x1440, zoom   | N/A (motion independent of layout; sheet path code-read)                                                                    |
| Viewport 390x844                                        | NOT TESTED live; code-read: sheet and view-transition honour reduce (`draftHeroTransition.ts:50`); F-19-02 covers the sheet |
| Preferences: light/dark                                 | PASS (dark live; theme swap uses `.no-transitions`, code-read)                                                              |
| Preferences: system switching live, every named theme   | NOT TESTED (palette swap path is code-read, DNA-M8)                                                                         |
| Preferences: reduced motion                             | FAIL F-19-02 (overlays, toasts, press scale), F-19-01 cross; panels PASS                                                    |
| Preferences: high contrast                              | code-read PASS: shine and focus sweeps gate on `forced-colors` (`index.css:542,615`)                                        |
| Preferences: keyboard only / screen reader              | N/A (motion); Spinner has `role="status"`                                                                                   |
| Lifecycle: backgrounded app                             | PASS code-read: `observeVisibleAnimation` pauses; mobile shimmer stops on blur (`thread-work-log.tsx:293-300`)              |
| Lifecycle: OS sleep during stream                       | NOT TESTED (host)                                                                                                           |

## Already good (do not touch)

- Panel gate, 0 ms default, OS override, two-frame navigation suppression (DNA-K4); measured instant at 0 and eased at 200 ms.
- Idle cost: 0 running animations and baseline begin-frames in an idle thread, identical under reduce.
- Duty-cycled set (DNA-K5): status-pulse (90 frames per 5 s vs 301 unstepped), skeleton, status-ping, shine, focus, Spinner visibility pause; streaming `@starting-style` fade.
- `Sidebar.motion.ts` (150 ms, reduce-aware, bounded), `ComposerBannerStack` (220 ms ease-in exit, the model for exits), `AnimatedHeight/Width/Collapsible` `motion-reduce:transition-none`, `useTimelineFollow`/`pageScrollController` smooth scroll honouring reduce, `.no-transitions` theme window, MorphIcon wrapper default `reducedMotion="user"`.
- Mobile: `MOBILE_MOTION` tokens, `ReduceMotion.System` everywhere, `overshootClamping` swipe spring, single gated shimmer loop.
- Instant expand of "Worked for" and the changed-files tree (no height animation in a virtualized timeline).

## Incomplete

- GPU cost: the host renders in software (`SoftwareRenderer::DoDrawQuad`), so begin-frame counts are relative only; no real high-refresh GPU numbers. Cost of fading full-screen `backdrop-filter` layers (dialog backdrop 4 px blur, sheet `backdrop-blur-xs`, `dialog-glass`, toast `dropdown-glass` for 500 ms) is unmeasured.
- Stacked toast enter/exit not captured live (no benign trigger without a real error); `live-tool-shine` probe showed no extra begin-frames, inconclusive.
- Mobile read from code only; terminal drawer not toggled (would spawn a pty); thread-row reorder and section change not captured live.
- `shot.mjs --reduced` was not used literally (cannot press keys); an equivalent Playwright context (`reducedMotion: "reduce"`) produced the captures.

## Needs deeper look

- Under reduce the Spinner and Working dots become static glyphs (`motion-safe:` only). DNA-M9 ("status must not lie") and "nothing under reduced motion" pull apart; decide whether a stepped opacity pulse (`animate-status-pulse`, no movement) is acceptable as the reduced-motion liveness cue.
- DNA section 7.1 should be corrected: menus and selects have no motion (measured), MorphIcon's spring is not listed, toast timings are 500/250 ms.
- Whether `LegacySidebar.tsx` (auto-animate) is still reachable; if not, remove the dependency path.
- Backdrop-filter fade cost on a 120 Hz GPU (needs hardware trace; candidate fix is a non-blurred tint fade).
