# Audit 02: thread list (sidebar rows, shelves, search row, selection, drag, undo notice, archive view)

Baseline: upstream `main` @ 5f64c5eb as served on `localhost:5733` (pre-#24865). Every measurement below is from that
build. Each finding carries a `#24865:` tag from reading `ui-overhaul/prior-art/pr-24865.diff` for
`SidebarThreadRow.tsx`, `SidebarListMarkers.tsx`, `Sidebar.tsx`, `ThreadStatusIndicators.tsx`, `middle-truncate.tsx`,
`collapsible-section-header.tsx` (plus `settingsLayout.tsx`, `index.css`, `button.tsx`, `menu.tsx`, `settings.ts`).
Owner calls that stay are respected: rows stay three lines (project line, title, branch/provider line), the model
brand colour is untouched, canvas stays `#0a0a0a`. Screenshots: `ui-overhaul/screens/02-thread-list/`.

Upstream-eligible rule applied (OWNER-DIRECTION item 4): a chunk that edits a file #24865 touches is "no" unless it is
a follow-up to #24865 itself.

## What I used in the running app

- Fixture list: 117 to 127 card rows, 3 snoozed, 10 to 11 settled, 15 archived; opened it at 1440x900 light and dark,
  800x600 and 390x844 (sheet), plus a touch-emulated 390x844 context (`hasTouch`, `isMobile`, `any-hover: none`).
- Hover, focus ring, Tab traversal (counted stops), right-click menu (single and multi-select), Cmd-click and
  Shift-click selection, inline rename (menu and double-click), Settle, Snooze preset and Custom dialog, Wake, Pin by
  drag, Unpin, Un-settle, Archive then Unarchive, settle-sweep gesture with Escape cancel, drag to the Settled
  header with Escape cancel, Settled and Snoozed shelf expand, Working shelf (Beta toggle), search (title, Arabic,
  message, empty), project filter, New thread click and Shift-click, draft row, `/settings/archived`, `/settings/beta`.
- Contrast was computed in page by compositing computed colours over the effective background (canvas read-back).
- Cost: 3 agent turns (claude-haiku-5-5, sample-app) to produce Working/Waiting/Done rows. Those three probe threads
  ("Audit: working ... probe") are archived; no fixture thread was left changed (settled, pinned, snoozed and archived
  fixtures were all restored).

## Findings

### F-02-01 Settled and Snoozed shelf rows fall below 3:1 for 14px titles and times

- Severity: P1
- Surface: all (web, desktop, mobile web)
- Evidence: `SidebarThreadRow.tsx:895` (`[&:not(:hover):not(:focus-within)_*]:text-secondary-label/70` on every
  descendant of a settled row), `:987,:992` (slim title `text-secondary-label/70`), `:1637` (search result for a settled
  thread); favicon `opacity-40 grayscale` at `:1117` (slim) and `:1627` (search). Measured [Settled row "Fix typo in onboarding copy"]: title and
  time 2.68:1 light, 3.10:1 dark (14px/400). Screenshots `02-thread-list-shelves-expanded-light-1440x900.png`,
  `02-thread-list-settled-expanded-dark-1440x900.png`.
- Current: The rows a user must read to decide what to un-settle or wake are painted at 70% of the muted token, so
  they miss the 4.5:1 floor, and the project monogram is 40% grayscale so the two projects (SA, SR) are hard to tell apart.
- Proposed: In `SidebarThreadRow.tsx` delete the `variantAction === "unsettle"` wildcard at `:895` and change `:987`
  and `:992` from `text-secondary-label/70` to `text-secondary-label` (4.62:1 light, 5.39:1 dark, the token tuned for this);
  keep the "parked" read through `font-normal` and the favicon, raised from `opacity-40` to `opacity-60 grayscale`
  (still grey until hover). Same change at `:1637`.
- DNA: DNA-C4, DNA-C5, DRIFT-1
- Effort: XS
- Risk: Parked rows look less receded; the hover and active states still brighten to `text-foreground`. Covered by
  `Sidebar.logic.test.ts` only for logic; no visual test.
- Upstream-eligible: no until #24865 merges (it edits `SidebarThreadRow.tsx` and leaves these lines); then a small follow-up.
- #24865: not addressed (its hunk only adds `!props.isActive` to the `:895` condition; `/70` stays).

### F-02-02 Branch, scratch-machine and worktree labels render at 1.7:1

- Severity: P1 (baseline), becomes verify-only after #24865
- Surface: all
- Evidence: `SidebarThreadRow.tsx:1444,1453,1455` (`text-muted-foreground/40`), `ThreadStatusIndicators.tsx:803`
  (`FolderGit2Icon ... text-muted-foreground/40`). Measured [row "Acknowledge with OK", branch `main`, 12px]: 1.69:1
  light, 2.05:1 dark; 2.10:1 in T3 Chat dark, 1.67:1 in Ember dark. Screenshot `02-thread-list-top-light-1440x900.png`.
- Current: The only line that tells a user which branch a thread is on is below the contrast of a placeholder, and the
  worktree glyph (a meaning-carrying icon) is lower still.
- Proposed: Drop the `/40` (use the line's inherited `text-secondary-label`, 4.62:1 light) and give the worktree glyph
  `text-icon-muted size-3.5`. Also fix the remote-machine icon at `:1479` (`text-sidebar-muted-foreground/70`), which
  #24865 does not touch.
- DNA: DNA-C4, DNA-C5, DRIFT-1, DRIFT-22
- Effort: XS
- Risk: None functional; hierarchy now comes from size (12px vs 14px title).
- Upstream-eligible: no (superseded by #24865); the `:1479` remote icon is a one-line follow-up after merge.
- #24865: addressed (branch and scratch spans lose `/40`, worktree glyph becomes `text-icon-muted size-3.5`; `:1479` untouched).

### F-02-03 Shelf headers: 12px label at 2.3:1 and a raw blue "Snoozed"

- Severity: P1 (baseline), verify-only after #24865
- Surface: all
- Evidence: `ui/collapsible-section-header.tsx:6-9` (`muted` = `text-sidebar-muted-foreground/60`, `info` =
  `text-blue-600 dark:text-blue-400` + `bg-blue-500/20`). Measured: "Settled (10)" 2.27:1 light, 3.43:1 dark;
  "Snoozed (3)" 5.03:1 light but a theme-immune raw hue (DRIFT-9). Screenshot `02-thread-list-bottom-shelves-light-1440x900.png`.
- Current: The only control that reveals the Settled/Snoozed/Working shelves is the faintest text in the sidebar, and the
  Snoozed header uses a hand-picked blue that ignores themes.
- Proposed: `muted` label `text-sidebar-muted-foreground` (no alpha), line `bg-sidebar-border/50`; remove the `info` tone
  or map it to `text-info-foreground` / `bg-info/20` if kept.
- DNA: DNA-C1, DNA-C5, DNA-C6, DRIFT-9
- Effort: XS
- Risk: `CollapsibleSectionHeader` is generic; check other callers (details card uses variant `panel`).
- Upstream-eligible: no (superseded by #24865).
- #24865: addressed (label loses `/60`, `info` tone deleted, rule `/50`).

### F-02-04 Row actions (Settle, Snooze, Wake, Un-settle) are unreachable on touch-only web

- Severity: P1
- Surface: web (phone and tablet widths without a mouse); desktop unaffected
- Evidence: `SidebarThreadRow.tsx:1144,1188,1205,1222,1306,1378` gate every action on `group-any-hover/sidebar-row:`
  (`index.css:8-15`, `@media (any-hover: hover)`). Touch emulation `[any-hover: none; pointer: coarse]`: the action
  container measures `opacity: 0; pointer-events: none` permanently (`02-thread-list-touch-no-actions-dark-390x844.png`).
  No `longpress`/`touchstart` handler exists in `Sidebar.tsx`, `Sidebar.pointer.ts` or the row (grep). The only remaining
  route is a `contextmenu` event, which iOS Safari does not fire on long press (code-read; not testable here).
- Current: A phone-width web user can open and rename threads but cannot settle, snooze, pin or wake from the list.
- Proposed: In the row (card and slim), when `@media (any-hover: none)`, render a trailing "Thread actions" button
  (`MoreHorizontalIcon size-4`, the `Button size="icon-xs" variant="ghost"` primitive, which already supplies the 28px
  size and the 44px `pointer-coarse:after:min-h-11` hit area) that calls `onContextMenu(threadRef, {x: rect.left, y: rect.bottom})`.
  Show it in place of the time label's hover swap, so no layout shift.
- DNA: DNA-X4, DNA-D4, DNA-P8, DNA-P7
- Effort: M
- Risk: Status slot width on 390px sheet (project name truncates sooner); `Sidebar.pointer.browser.test.tsx` covers the pointer path only.
- Upstream-eligible: no until #24865 merges (same file); then yes as a focused fix.
- #24865: not addressed (it removes `transition-opacity` but keeps the `any-hover` gate).

### F-02-05 The web context menu has no menu semantics, no focus and no arrow-key path

- Severity: P1
- Surface: web (the native Electron menu is used on desktop)
- Evidence: `contextMenuFallback.ts:289-296` builds plain `div > button` with no `role="menu"`/`menuitem` (only
  `menuitemradio` when `checked`); keyboard handling is only `Escape` (`:252`); focus moves on `mouseenter` only
  (`:407`). Live: right-click row, `document.activeElement` stays on the row, ArrowDown does nothing, Tab lands on the
  row's own "Unpin thread" button (`02-thread-list-context-menu-dark-1440x900.png`).
- Current: Pin, Rename, Mark unread, Archive, Delete and the whole Snooze submenu are mouse-only on web. The menu is
  also invisible to assistive tech.
- Proposed: Container `role="menu"` `aria-orientation="vertical"`; items `role="menuitem"` (`menuitemradio` kept);
  on open focus the first enabled item in the next frame; ArrowUp/Down/Home/End move; ArrowRight opens and focuses a
  submenu, ArrowLeft/Escape closes one level; Tab closes and restores focus (already restored in `cleanup`); keep the
  `dropdown-glass` look unchanged.
- DNA: DNA-K10 (menu behaviour), DNA-L8, non-negotiable 6 (inaccessible = P1)
- Effort: M
- Risk: `contextMenuFallback.test.ts` exists; add arrow-key cases. Shared with area 12/01 callers (draft menu, settings archive menu).
- Upstream-eligible: yes (file untouched by #24865; single concern).
- #24865: not addressed (`ui/menu.tsx` only changes a stroke width).

### F-02-06 Keyboard traversal: 3 to 4 tab stops per row and no list navigation

- Severity: P1
- Surface: web, desktop
- Evidence: measured in page: 368 focusable elements inside the list for 121 rows (121 row `role="button"`, 121
  "Snooze thread", 121 "Settle thread", plus "Unpin thread" on pins); all stay in tab order while `opacity-0`
  (`SidebarThreadRow.tsx:1378`, `:1099`, `:1258`). Arrow keys are handled only for search results (`Sidebar.tsx:1319-1324`).
  Thread switching has `mod+shift+[ ]` (`shared/keybindings.ts:211-212`) but a keyboard user inside the list cannot step rows.
- Current: To get from the search field to the footer a keyboard user presses Tab about 370 times, and Shift+Tab
  from the footer is the only quick way back.
- Proposed: Roving tabindex on the list: exactly one row has `tabIndex={0}` (active row, else last focused), the others
  `-1`; ArrowUp/Down/Home/End move focus between `[data-thread-item] [role=button]`, Enter/Space open (already), and the
  hidden Snooze/Settle/Unpin buttons use `tabIndex={rowHasFocus ? 0 : -1}` so they remain reachable by Tab once a row is focused. Keep `focus-visible` reveal.
- DNA: DNA-L8, DNA-X4, non-negotiable 6
- Effort: M
- Risk: Interacts with dnd-kit sensor and `useSidebarRowSubscriptionLease`; add browser tests in `Sidebar.pointer.browser.test.tsx` style.
- Upstream-eligible: no until #24865 merges (SidebarThreadRow.tsx, Sidebar.tsx); then yes.
- #24865: not addressed.

### F-02-07 Row is a `role="button"` that contains buttons, and the row name omits its state

- Severity: P1
- Surface: all web
- Evidence: `SidebarThreadRow.tsx:1098-1099`, `:1257-1258` (div `role="button"` with nested `<button>` for Unpin,
  Snooze, Settle, PR badge, terminal, Wake); `Sidebar.logic.ts:53-62` builds the label from title, status, project only. ARIA `button`
  makes descendants presentational. Prior art: #13959 "Sidebar thread row actions are unreachable with screen readers".
  The label never says pinned, settled, snoozed, branch, or age ("Audit: working shelf probe, Done, sample-app").
- Current: A screen-reader user hears title, status and project; the actions and the pin/settled/snoozed state are
  not exposed. (Not verified with a screen reader on this host.)
- Proposed: Staged. Step 1 (S): extend `resolveSidebarRowAccessibility` with `isPinned`, `section` ("settled",
  "snoozed until <time>", "working"), `branch`, and the relative time, and add `aria-keyshortcuts` where bound. Step 2 (L):
  make the row a `li` with a sibling-structure (primary `<button>` for open + a `role="group"` of action buttons) so no
  interactive element nests; keep the visual layout identical.
- DNA: non-negotiable 6, DNA-I4
- Effort: S (step 1), L (step 2)
- Risk: dnd-kit listeners sit on the row root; moving listeners to a handle region must keep pointer drag.
- Upstream-eligible: no until #24865 merges; step 1 yes after.
- #24865: not addressed (#13959 still applies).

### F-02-08 A 200-character single-word title breaks the Archive page layout

- Severity: P1
- Surface: web, desktop (Settings modal)
- Evidence: `settingsLayout.tsx:484` `<h3 className="text-sm font-medium text-foreground">{title}</h3>` has no
  `min-w-0`/wrap rule. Live: archived "very_long_snake_case_identifier..." -> h3 width 1,443px inside an 846px row,
  text paints over the "Unarchive" button and the page container shifts 106px left
  (`02-thread-list-archived-long-word-dark-1440x900.png`). The thread was un-archived afterwards. 500-char titles with spaces
  (no fixture is archived) are code-read only: they would wrap to ~12 lines.
- Current: One long identifier-style title makes the only restore control hard to hit and breaks the modal's horizontal layout.
- Proposed: `<h3 className="min-w-0 text-sm font-medium text-foreground [overflow-wrap:anywhere]">` in `SettingsRow`, and in
  `ArchivedThreadsPanel.tsx:238` pass `title={<span className="line-clamp-2 break-words" title={thread.title}>{thread.title}</span>}`
  so a 500-char title cannot take 12 lines.
- DNA: DNA-T9 (truncate in rows)
- Effort: XS
- Risk: `SettingsRow` is shared by every settings page; `overflow-wrap:anywhere` is inert for normal text.
- Upstream-eligible: no until #24865 merges (it edits `settingsLayout.tsx`); the `ArchivedThreadsPanel.tsx` half is yes now.
- #24865: not addressed (h3 line unchanged).

### F-02-09 Pinned threads have no header or divider at rest

- Severity: P2
- Surface: all
- Evidence: `Sidebar.tsx:3098-3110` renders `SidebarDragBoundary` ("Pinned", "Active") with `visible={from !== null}`, so
  the labels exist only during a drag; the draft block does draw a hairline (`SidebarDraftBlock.tsx:215-219`,
  `mx-2.5 my-1.5 h-px bg-sidebar-border/60`). Screenshot `02-thread-list-top-dark-1440x900.png`: five pinned rows run straight into the active list; the
  only cue is a 12px glyph at 2.5:1 (F-02-23).
- Current: Where pins end is unknowable without hovering a pin or starting a drag.
- Proposed: In `SidebarDragBoundary` render, when `!visible` and the marker is `pinned-divider` and both sections are
  non-empty, `<div aria-hidden className="absolute inset-x-2 top-0 h-px bg-sidebar-border/60" />` (the marker is
  `h-0`, so no layout shift); labels stay drag-only.
- DNA: DNA-S7 (dividers separate groups), DNA-ID1
- Effort: XS
- Risk: `Sidebar.drag.test.ts` untouched (markers keep ids).
- Upstream-eligible: no until #24865 merges (`SidebarListMarkers.tsx`).
- #24865: not addressed.

### F-02-10 The shelves live at the far bottom of an unbounded list and are not sticky

- Severity: P2
- Surface: all
- Evidence: measured scroll port: `scrollHeight` 9,784px vs `clientHeight` 760; `sidebar-snoozed-header` at y=9,811. Headers use
  `mt-auto` only (`Sidebar.tsx:3138,:3156,:3175`), so they reach the viewport only when the list is short. Settle then shows
  only a 5-second notice (F-02-14) and the "Settled (n)" count that changes is off-screen.
- Current: After settling or snoozing a thread in a 100-row list nothing visible changes except the row vanishing; the
  destination and its count are about 12 screens away.
- Proposed: Make collapsed shelf headers `sticky bottom-0 z-10 bg-sidebar` with stacked offsets
  (`bottom-0`, `bottom-8`, `bottom-16` by order, each `h-8`) in `SortableSidebarMarker`'s `className`; expanded shelves keep normal flow.
  The sticky header is also a visible drop target for dragging to Settled.
- DNA: DNA-P7 (every way in has a way out and a place to see it), DNA-ID1
- Effort: S
- Risk: dnd-kit collision rects for `settled-header` change with scroll; verify `Sidebar.drag.test.ts` drop plans and the 6px activation.
- Upstream-eligible: no until #24865 merges.
- #24865: not addressed.

### F-02-11 The shelf count disappears when a shelf is expanded; "Show 1 more" for one row

- Severity: P3
- Surface: all
- Evidence: baseline `Sidebar.tsx:3141,3159,3178` (`expanded ? "Settled" : "Settled (n)"`); live: "Settled (11)" -> "Settled",
  10 rows + a "+ Show 1 more" button (`SETTLED_TAIL_INITIAL_COUNT = 10`, `Sidebar.tsx:286`; button `:3211-3227`).
- Current: Expanding removes the number the user just clicked on, and pagination hides a single row behind a button.
- Proposed: Keep the trailing count visible in both states (`accessory` always rendered); reveal all rows when
  `hidden <= 5` (`visibleCount = total <= INITIAL + 5 ? total : INITIAL`).
- DNA: DNA-V10 (counts are literal), DNA-P3
- Effort: XS
- Risk: A larger first expand for 11 to 15 rows; negligible.
- Upstream-eligible: no until #24865 merges.
- #24865: partial (count moves to a trailing accessory "Snoozed 1 ›" but is still hidden when expanded; pagination unchanged).

### F-02-12 Selected, active and hover fills collide

- Severity: P2
- Surface: all
- Evidence: measured row backgrounds vs sidebar: light active `#ffffff` 1.044:1, selected `#ffffff` 1.044:1 (identical),
  hover `#fcfcfc` 1.017:1; dark active `#1a1b1b` 1.217, hover `#131313` 1.130, selected `#111111` 1.112 (selected is dimmer
  than hover). Code `SidebarThreadRow.tsx:897-905`. Screenshots `02-thread-list-multiselect-dark-1440x900.png`, `02-thread-list-row-hover-light-1440x900.png`.
- Current: In light mode a multi-selected row looks exactly like the open row, and light hover is nearly invisible; in dark a
  selected row reads weaker than a hovered one.
- Proposed: Component-level, no token change: selected rows get `bg-sidebar-row-hover ring-1 ring-inset ring-primary/40`
  (a non-colour cue that also survives forced colours); active stays `bg-sidebar-row-active`.
- DNA: DNA-C3, DNA-C5 (non-text cue), DNA-P4
- Effort: XS
- Risk: Ring plus `focus-visible:ring-2` share `ring` utilities; ensure focus ring still wins.
- Upstream-eligible: no until #24865 merges.
- #24865: partial (light mode adds `ring-1 ring-sidebar-border/70` plus `shadow-xs` on active and the same ring on selected; dark values and the active/selected tie remain).

### F-02-13 Bulk menu lacks Pin, Archive, Un-settle and Wake; the legacy sidebar had Archive (n)

- Severity: P2
- Surface: web, desktop
- Evidence: live multi-select menu items: "Settle (2)", "Snooze (2)", "Regenerate titles (2)", "Mark unread (2)", "Delete (2)"
  (`Sidebar.tsx:2047-2160`). `buildMultiSelectThreadContextMenuItems` and `archiveSelectedThreadEntries`
  (`Sidebar.logic.ts:462,494`) are used only by `LegacySidebar.tsx:1822,1860`. A selection of settled rows gets a disabled "Settle (n)" and no "Un-settle (n)".
- Current: Delete is offered in bulk, the non-destructive Archive is not; a user cleaning 20 old threads must delete or repeat 20 times.
- Proposed: Add `Pin (n)`, `Archive (n)` (disabled while any selected thread runs, reuse the legacy builder and
  `archiveSelectedThreadEntries`), `Un-settle (n)` when the selection contains settled rows, `Wake (n)` for snoozed. Order: Pin, Settle, Snooze, Archive, Mark unread, Regenerate titles, Delete (destructive last, separated).
- DNA: DNA-P7, DNA-V8, DNA-P8
- Effort: S
- Risk: `Sidebar.logic.test.ts` covers builders; add menu-order tests.
- Upstream-eligible: no until #24865 merges (`Sidebar.tsx`).
- #24865: not addressed.

### F-02-14 The undo notice: fixed 5s clock, 11px text, 16px target, no thread name, desktop shortcut on touch

- Severity: P2
- Surface: all
- Evidence: `hooks/showThreadUndoNotice.ts:113-121` (`setTimeout(..., 5_000)`, no hover/focus pause), measured gone about 4.9s
  after the settle click; `SidebarThreadUndoNotice.tsx:31-33` (`Alert variant="sidebar"` 11px, `InlineButton`); measured notice 239x30, button
  61.5x16; text "Settled 1 thread, ⌘Z to undo" (code-read: `shortcutLabelForCommand` is shown whatever the pointer type, so a phone shows it too). Screenshot `02-thread-list-undo-notice-dark-1440x900.png`.
  Live region announces correctly (`announce`), which is good.
- Current: A keyboard or slow pointer user can lose the undo while moving to it; the notice does not say which thread; a phone user is told to press ⌘Z.
- Proposed: Pause expiry while the notice has pointer or focus (`onPointerEnter/Leave`, `onFocus/Blur` call new exported
  `pauseUndoExpiry()`/`resumeUndoExpiry()`; resume with the remaining time, minimum 2s); for `count === 1` use
  `Settled "Explain the repository"` (title clipped to 24 chars); show "Undo" instead of the shortcut when
  `matchMedia("(pointer: coarse)")`; replace `InlineButton` with `Button variant="ghost" size="xs"` (24px, 28 touch, 44 coarse hit area); text `text-xs`.
- DNA: DNA-P7, DNA-D4, DNA-V10, DNA-X4
- Effort: S
- Risk: `SidebarThreadUndoNotice.browser.test.tsx` exists; threadUndo claims (`mod+z` ownership) must keep working.
- Upstream-eligible: yes (files untouched by #24865).
- #24865: not addressed.

### F-02-15 Hover card truncates the title (a 500-char title is readable nowhere) and shows no absolute time

- Severity: P2
- Surface: web, desktop
- Evidence: `ThreadHoverCard.tsx:26` (`min-w-0 truncate text-xs ... font-medium`); live 535-char hover text clipped at ~46 chars in a 320px card
  (`02-thread-list-hover-card-long-title-dark-1440x900.png`). The card has project, environment, branch, model but no last-activity time,
  and always shows the environment row ("MacBook Pro") even with one environment (`SidebarThreadRow.tsx:282`).
- Current: The hover card is the intended place to read what the row clips, and it clips the same way; relative times
  ("82d") have no date anywhere.
- Proposed: Title `line-clamp-3 break-words whitespace-normal leading-snug`; add a first meta row
  `ClockIcon size-3` + `formatDayAwareTimestamp(threadTimeTimestamp(thread), timestampFormat)`; pass `environmentLabel={showProjectEnvironments ? label : null}` so the environment row appears only when more than one environment is in play.
- DNA: DNA-V10, DNA-T9, DNA-P3
- Effort: S
- Risk: Taller card for long titles; `max-w-80` kept.
- Upstream-eligible: no for the environment row (`SidebarThreadRow.tsx`); the `ThreadHoverCard.tsx` title and time part yes.
- #24865: not addressed.

### F-02-16 "Done", "Failed", "Limited" and "Woke" replace the time, so age is lost

- Severity: P2
- Surface: all
- Evidence: `SidebarThreadRow.tsx:1311-1370` renders either `topStatus` or `RelativeTimeLabel`. Live: "Audit: working shelf probe B ... Done" shows no time
  (`02-thread-list-after-pin-undo-notice-dark-1440x900.png`, `02-thread-list-open-dark-390x844.png` "Failed", "Done").
- Current: An unread completion from 3 minutes ago and from 3 weeks ago look identical.
- Proposed: For `done|failed|limited|woke` append `<span className="font-normal text-secondary-label tabular-nums">· {time}</span>` using the same
  `compactSidebarTimeLabel(formatRelativeTimeLabel(latestRun.completedAt))`; Working/Waiting keep their own timers. Clip the project name (already `truncate`), not the status.
- DNA: DNA-V10, DNA-P3
- Effort: S
- Risk: Status slot `min-w-8` grows by ~28px; project name truncates sooner at 208px sidebar.
- Upstream-eligible: no until #24865 merges.
- #24865: not addressed (recolours the labels only).

### F-02-17 Snoozed rows: wake label has no direction, the hover card has no wake time, "24h" instead of "1d"

- Severity: P2
- Surface: all
- Evidence: slim row `snoozeWakeLabelText` rendered blue ("3h", "24h", "4d", `02-thread-list-shelves-expanded-light-1440x900.png`) while
  Settled rows show elapsed time in the same position; `aria-label` of a snoozed row is "Triage the failing nightly, sample-app" and the
  hover card text had no wake line (live); `packages/client-runtime/src/state/threadSettled.ts:262` uses `Math.ceil(remainingMs / HOUR_MS)` for anything under a day, so 23.2h reads "24h".
- Current: "3h" could be "snoozed 3 hours ago"; the user cannot learn the actual wake time.
- Proposed: Prefix the label with `AlarmClockIcon size-3` (`text-info-foreground`); add a hover-card row "Wakes Tue 9:00 AM"
  (use `formatUpcomingTimestamp`, exists in `timestampFormat.ts:171`); add `, snoozed until 9:00 AM` to the row `aria-label`; in `snoozeWakeLabel` return `"1d"` when the ceil'd hours reach 24.
- DNA: DNA-V10, DNA-P3, DNA-K2 (keep semantics)
- Effort: S
- Risk: `threadSettled` tests cover `snoozeWakeLabel`; update expectations.
- Upstream-eligible: no for row changes until #24865 merges; the `threadSettled.ts` rounding fix yes.
- #24865: not addressed.

### F-02-18 "Waiting 8s" on a thread whose turn just finished (and it hides "Done")

- Severity: P2 (needs deeper look)
- Surface: all
- Evidence: `Sidebar.logic.ts:911-913` maps `runtime.status === "idle"` to `waiting`; the row shows `WorkingDuration` counting up from
  `latestRun.completedAt` (`SidebarThreadRow.tsx:1360-1364`). Live: probe thread showed "Waiting 8s" right after its run ended, then "Done" later
  (`02-thread-list-working-status-dark-1440x900.png`). Window observed: about 90 seconds; longer persistence not measured.
- Current: A finished thread reads "Waiting" with a ticking counter, which implies the agent is blocked, and unread "Done" is suppressed while the provider session idles.
- Proposed: When `status === "waiting"` and `blockedOnThreadWait !== true` (plain idle), show `Done` if unread else the relative time, and drop the elapsed counter; keep "Waiting" only for threads blocked on a subagent or background wait.
- DNA: DNA-P3, DNA-M9
- Effort: S
- Risk: The Beta Working shelf (Discussion #15433) uses the same status; confirm shelf membership rules.
- Upstream-eligible: no until #24865 merges.
- #24865: not addressed.

### F-02-19 Blank or invisible titles render empty rows

- Severity: P2
- Surface: all
- Evidence: fixtures with U+3164, U+2800 and U+200B titles render an empty title line, no fallback (`SidebarThreadRow.tsx:984-1005`,
  `02-thread-list-titles-rtl-blank-dark-1440x900.png`). `commitThreadRename` (`Sidebar.tsx:1344-1350`) only rejects `title.trim().length === 0`, so a user can rename a thread to invisible characters.
- Current: A nameless row cannot be recognised, searched visually, or described to a screen reader ("", Done, sample-app).
- Proposed: `displayThreadTitle(title)` in `Sidebar.logic.ts`: strip `[\s​-‏⁠﻿ᅟᅠㅤ⠀]`; if empty return "Untitled thread". Use it in the row, search row, hover card, `accessibleTitle`, and make `commitThreadRename` reject the same set with the existing "Thread title cannot be empty" toast.
- DNA: DNA-P3, DNA-V3
- Effort: S
- Risk: New string; add to `Sidebar.logic.test.ts`.
- Upstream-eligible: no until #24865 merges (row file); helper plus rename guard yes.
- #24865: not addressed.

### F-02-20 Search results: no title highlight, a match beyond the truncation is invisible, no project name

- Severity: P2
- Surface: web, desktop
- Evidence: `SidebarThreadRow.tsx:1635-1645` renders the title as plain text; only message excerpts use
  `HighlightedSearchText` (`ThreadSearchMatch.tsx`). Live: query "settings" returns "Please investigate w..." (500-char title where the match is past the cut) with no hint why
  (`02-thread-list-search-results-dark-1440x900.png`). Results carry only a monogram (SA vs SR), no project name.
- Current: The user cannot tell why a row matched or which project it belongs to.
- Proposed: Wrap the title in `HighlightedSearchText` using `findSearchTokenRanges(thread.title, query)`; when the first range starts past 28 characters render a second line with `ThreadSearchMatchExcerpt`-style "Title: ...<match>..."; add the project name `text-xs text-secondary-label` after the monogram when more than one project exists.
- DNA: DNA-P3, DNA-T9
- Effort: S
- Risk: `HighlightedSearchText` is file-local; export it. `Sidebar.logic.test.ts` search tests unaffected.
- Upstream-eligible: no until #24865 merges (`SidebarThreadRow.tsx`).
- #24865: not addressed.

### F-02-21 Thread action failure toasts use "Failed to ..." and "An error occurred."

- Severity: P3
- Surface: all
- Evidence: 25 "Failed to ..." strings in `Sidebar.tsx` (15 `title:` props at `:1363,:1435,:1472,:1487,:1659,:1674,:2037,:2190,:2219,:2283,:2501,:2525,:2576,:2603` and 10 passed to the drag `run(...)` helper at `:1938-1988`) against one "Could not create thread" (`:2468`); each falls back to "An error occurred.". The archive page adds more (`ArchivedThreadsPanel.tsx`).
- Current: Contradicts the product's own error voice.
- Proposed: One helper `reportThreadActionFailure("settle", result)` producing `Could not settle thread` with description = real message or omitted (never the stock string); rename all sites.
- DNA: DNA-V3, DNA-V4, DRIFT-12
- Effort: S
- Risk: Toast titles are asserted in a few tests; grep before changing.
- Upstream-eligible: no until #24865 merges (`Sidebar.tsx`); `ArchivedThreadsPanel.tsx` and `showThreadUndoNotice.ts` call sites yes.
- #24865: not addressed.

### F-02-22 Bound shortcuts are not shown on the actions that have them

- Severity: P2
- Surface: web, desktop
- Evidence: `thread.settle` (`mod+shift+s`), `thread.pin` (`mod+shift+p`), `thread.undo` (`mod+z`), `thread.copyReference` exist
  (`packages/shared/src/keybindings.ts:213-216`); Settle tooltip reads only "Settle thread" beside the visible word "Settle"
  (`02-thread-list-settle-tooltip-dark-1440x900.png`); the context menu rows carry no shortcut (`ContextMenuItem` has no shortcut field).
- Current: Keyboard shortcuts for the most common thread actions are undiscoverable from the places the actions live.
- Proposed: Tooltip `Settle thread` -> `Settle thread <Kbd>⇧⌘S</Kbd>` using `shortcutLabelForCommand(keybindings, "thread.settle")`; same for Pin/Unpin. Menu part gated on a contract change: add optional `shortcut?: string` to `ContextMenuItem` (packages/contracts), render right-aligned `text-xs text-muted-foreground` in `contextMenuFallback.ts` and as `accelerator` in the Electron menu.
- DNA: DNA-L8, DNA-I4
- Effort: S (tooltips), M (menu, with contract and desktop)
- Risk: The contract addition is additive; desktop handler needs a mapping (apps/desktop is outside this area, so gate it).
- Upstream-eligible: no until #24865 merges (row file); contract part separate.
- #24865: not addressed.

### F-02-23 The pin glyph is a 12px target at 2.5:1

- Severity: P2
- Surface: all
- Evidence: `SidebarThreadRow.tsx:1058,1077` (`text-muted-foreground/65`); measured 12x12 button box and 2.50:1 light, 3.66:1 dark; focus ring
  consumes the glyph (`02-thread-list-keyboard-focus-light-1440x900.png`).
- Current: Pinned state is carried by a tiny low-contrast icon whose unpin click target is smaller than a checkbox.
- Proposed: `text-muted-foreground` (4.71:1) and widen the target without moving the glyph: `-m-1.5 p-1.5 rounded-sm` (24x24).
- DNA: DNA-C5, DNA-D4
- Effort: XS
- Risk: Neighbouring project monogram hit area overlaps by 2px; verify at 208px sidebar.
- Upstream-eligible: no until #24865 merges.
- #24865: not addressed.

### F-02-24 Hover actions are 20px tall (Snooze 24x20, Settle 63x20)

- Severity: P3
- Surface: web, desktop
- Evidence: measured `Snooze thread` 24x20, `Settle thread` 63x20, `Un-settle thread` 26x24, `Wake thread now` 24x24 (`SidebarThreadRow.tsx:1188-1223,:1378-1430`); the status slot is `h-5`.
- Current: Below the 24px minimum target; pointer misses near row edges.
- Proposed: Actions `-my-0.5 h-6` (24px) inside the 20px slot, no layout change.
- DNA: DNA-D2, DNA-D4
- Effort: XS
- Risk: None (slot is `items-stretch`).
- Upstream-eligible: no until #24865 merges.
- #24865: not addressed.

### F-02-25 Forced-colors mode: the open row and selected rows are indistinguishable

- Severity: P2
- Surface: all
- Evidence: Playwright `forcedColors: "active"`: active row has `background-color` kept but no outline/border (`outline: none, border 0`);
  screenshot `02-thread-list-forced-colors-1440x900.png` shows the open thread looks like its neighbours (only `aria-current` marks it).
- Current: Windows High Contrast users cannot see which thread is open or selected.
- Proposed: Add to `rowSurfaceClassName`: `forced-colors:border forced-colors:border-transparent`, active `forced-colors:border-[Highlight]`, selected `forced-colors:border-dashed forced-colors:border-[Highlight]`.
- DNA: non-negotiable 6
- Effort: XS
- Risk: Box-shadow rings (#24865's light ring) are dropped in forced colours, so the border is required.
- Upstream-eligible: no until #24865 merges.
- #24865: not addressed (its `light:ring` is a box-shadow and disappears in forced colours).

### F-02-26 Custom snooze time is 24-hour while the presets are 12-hour

- Severity: P2
- Surface: web, desktop
- Evidence: live: preset menu "In 1 hour 2:18 PM", Custom dialog Time field "14:35" (`CustomSnoozeDialog.tsx:156` time input `type="time"` with the string value from `localSnoozeTime`).
  Prior art: #19930 "Custom snooze time picker ignores the Time format setting" (open). Screenshot `02-thread-list-custom-snooze-dialog-dark-1440x900.png`.
- Current: One flow shows two clock formats.
- Proposed: Render the Time field through `resolveHour12(timestampFormat)`: use the shared time input in 12h mode with AM/PM, or format the displayed value with `formatShortTimestamp`; keep the stored value `HH:mm`.
- DNA: DNA-V10, DNA-P3
- Effort: S
- Risk: Native `type="time"` follows OS locale; verify it does not double-convert.
- Upstream-eligible: yes (file untouched by #24865; matches an open issue).
- #24865: not addressed.

### F-02-27 Archive page is a bare list: no open, search, count, bulk, and Delete only via right-click

- Severity: P2
- Surface: web, desktop
- Evidence: `ArchivedThreadsPanel.tsx:125-141` (context menu: Unarchive, Delete), `:211-285` (row = title + "Archived 1d ago · Created 1d ago" + one button).
  Live: 15 rows, no section counts, no search, rows not openable, Delete reachable only by `contextmenu` (F-02-05 makes it keyboard-unreachable). The page header reads "Applying settings for All projects across All environments", which describes a settings scope, not a data filter.
- Current: Restoring one thread among hundreds means scanning; destructive action is hidden.
- Proposed: Add `Delete` as an icon button (`Button variant="ghost" size="icon-xs"`, `TrashIcon`, destructive on hover) next to Unarchive; section titles get counts ("sample-app (14)"); a search field above the first section filtering by title; row title opens a read-only view (`/ :environmentId/:threadId`) when supported; drop the duplicate "Created" clause when equal to "Archived".
- DNA: DNA-P7, DNA-D1, DNA-V7
- Effort: M
- Risk: Opening an archived thread depends on server support; gate that part.
- Upstream-eligible: yes for Delete button and counts (file untouched by #24865).
- #24865: not addressed (`SettingsScopeSentence` is only restyled, `text-sm` and outline picker buttons, and still reads "Applying settings for"; `ArchivedThreadsPanel.tsx` untouched).

### F-02-28 Empty states: 60%-opacity text and no way forward in an empty project

- Severity: P3
- Surface: all (code-read; cannot be produced on this host)
- Evidence: `Sidebar.tsx:3244-3262` (`text-xs text-muted-foreground/60`, 2.27:1 light-equivalent); "No threads in X yet" / "No threads yet" have no action while "No projects yet" has "Add project".
- Current: A new project's list is a faint sentence.
- Proposed: `text-muted-foreground`, and add a `Button size="xs" variant="outline"` "New thread" (calls `handleNewThreadClick`) under both thread-empty variants.
- DNA: DNA-C4, DNA-V2
- Effort: XS
- Risk: None.
- Upstream-eligible: no until #24865 merges (`Sidebar.tsx`).
- #24865: not addressed.

### F-02-29 Working shelf (Beta): a working thread is hidden in a collapsed section at the bottom

- Severity: P2
- Surface: web, desktop (beta)
- Evidence: enabled via Settings -> Beta; with one running probe thread the sidebar shows "Working (1)" in grey below ~110 active rows, collapsed by default
  (`WORKING_SHELF_EXPANDED_KEY`, `Sidebar.tsx:290`; `02-thread-list-working-shelf-collapsed-light-1440x900.png`). The header has no activity cue.
- Current: The thread the user most wants to watch has the least visible spot in the list.
- Proposed: While collapsed and `workingThreads.length > 0`, give the header a duty-cycled dot (`size-1.5 rounded-full bg-info motion-safe:animate-status-pulse`, the existing stepped keyframe) as `accessory`; pair with F-02-10 sticky headers so it is on screen.
- DNA: DNA-M2, DNA-P3, DNA-K5
- Effort: XS
- Risk: Uses the existing `status-pulse` (stepped), so no new continuous repaint.
- Upstream-eligible: no until #24865 merges.
- #24865: partial (count now trails the collapsed label; no activity cue).

### F-02-30 The active list is not windowed: 30 DOM nodes per row, unbounded

- Severity: P2
- Surface: all
- Evidence: measured 3,484 to 3,796 nodes inside `[data-app-sidebar]` for 117 to 127 rows (about 30 per row); `content-visibility:auto` with
  `contain-intrinsic-size:auto_78px` (`SidebarThreadRow.tsx:1245`) saves paint, not DOM. Scrolling 10,614px in headless Chromium (software raster, so only indicative): p50 16.6ms, p95 52ms, max 111ms, two long tasks (100 and 52ms).
  Only the Settled shelf paginates (10 then 25). Every row mounts `useSidebarRowSubscriptionLease`, terminal and PR hooks (`SidebarThreadRow.tsx:571-600`).
- Current: 10,000 threads would be about 300k nodes; a power user with 500 active threads is about 15k nodes.
- Proposed: Window the card/slim rows (only rows within one viewport of the scroll port mount; the dragged and route row always mount); `@legendapp/list` is already a dependency (timeline). Interim (XS): cap the initial active render at 200 rows with the same "Show 25 more" row used for Settled.
- DNA: DNA-P1 (lists being hard to render are named regressions)
- Effort: L (windowing, dnd-kit `SortableContext` needs all ids but only mounted nodes), XS (cap)
- Risk: dnd-kit measures droppables by mount; list motion (`Sidebar.motion.ts`) assumes siblings exist; large risk, needs a spike.
- Upstream-eligible: no until #24865 merges.
- #24865: not addressed (adds a per-branch-row `ResizeObserver` in `MiddleTruncate`, see Needs deeper look).

### F-02-31 dnd-kit announcements leak raw ids

- Severity: P3
- Surface: web, desktop
- Evidence: `Sidebar.tsx:2943` `<DndContext>` has no `accessibility` prop; during a drag a `role="status"` node read
  "Draggable item d8e8988c-...:mcp:b7b7a3e7-... was moved over droppable area sidebar-marker-settled-header."
- Current: A screen-reader user dragging with a pointer hears environment and thread UUIDs.
- Proposed: `accessibility={{ announcements: { onDragStart/Over/End/Cancel using title and "Pinned"/"Active"/"Settled" } }}` with a title lookup from `threadByKey`.
- DNA: DNA-V1, DNA-P3
- Effort: S
- Risk: None.
- Upstream-eligible: no until #24865 merges.
- #24865: not addressed.

### F-02-32 During a drag the dashed drop-hint label collides with the dragged row

- Severity: P3
- Surface: web, desktop
- Evidence: `SidebarListMarkers.tsx:36-52` hint `h-9` with centred label; `02-thread-list-drag-settle-badge-dark-1440x900.png` shows "Settled" overprinting the dragged title "Add snooze presets".
- Current: Overlapping text at the moment the user needs to read the target.
- Proposed: Right-align the hint label (`justify-end pr-3`) and add `z-30` to the dragged `li` (currently `z-20`), so the row paints over the label.
- DNA: DNA-S1
- Effort: XS
- Risk: Verify against the drag badge ("Settle") position.
- Upstream-eligible: no until #24865 merges.
- #24865: not addressed.

### F-02-33 Context menu drift: "Delete" vs "Delete thread", Archive disabled without a reason, hand-built DOM

- Severity: P3
- Surface: web
- Evidence: `threadActionMenu.logic.ts:165,217,224` ("Mark unread", "Archive thread", "Delete" next to "Rename thread", "Pin thread"); Archive is `disabled: state.isRunning` with no explanation;
  `contextMenuFallback.ts:289-296` hard-codes `z-[10000]` plus a duplicate inline `style.cssText` for every class (and copied Lucide paths `:5-146`).
- Current: Inconsistent verb objects; a disabled item gives no reason; the popup bypasses the documented layer scale (popup 130).
- Proposed: Labels "Delete thread" and "Mark thread unread" (sentence case, DNA-V2); disabled Archive gets `label: "Archive thread (stop the run first)"`; use `z-130` token class and remove the inline duplicates.
- DNA: DNA-V2, DNA-L7, DRIFT-24
- Effort: S
- Risk: Strings appear in tests (`threadActionMenu.logic.test.ts`); native Electron menu reuses labels.
- Upstream-eligible: yes (files untouched by #24865).
- #24865: not addressed.

### F-02-34 Dead code: `latestRunDiff` always returns null

- Severity: P3
- Surface: all
- Evidence: `SidebarThreadRow.tsx:1240,1502-1507` (`void thread; return null`) and the `+x −y` block `:1464` never render.
- Current: A disabled feature kept as live markup.
- Proposed: Delete the function and block, or restore real diff stats from the shell if the server projects them.
- DNA: DNA-P2
- Effort: XS
- Risk: None.
- Upstream-eligible: no until #24865 merges.
- #24865: not addressed.

### F-02-35 Terse status words: "Input", "Request", "Approval"

- Severity: P3
- Surface: all
- Evidence: `SidebarThreadRow.tsx:667-695`; the row `aria-label` becomes "..., Input, sample-app". The legacy pills use Title Case ("Awaiting Input", "Guest Request", `Sidebar.logic.ts:1076-1119`).
- Current: Two vocabularies, one of them cryptic.
- Proposed: "Needs input", "Guest request", "Approval needed" in sentence case, one source `resolveThreadStatusLabel`.
- DNA: DNA-V1, DRIFT-11
- Effort: XS
- Risk: Width in the status slot (at most 14 chars).
- Upstream-eligible: no until #24865 merges.
- #24865: not addressed.

### F-02-36 The project name repeats on every row in a single-project list

- Severity: P3
- Surface: all
- Evidence: 114 of 117 rows read "sample-app" on line 1 (`02-thread-list-top-dark-1440x900.png`).
- Current: The line carries no information in the common one-project case; #24865 greys the monogram but keeps the name.
- Proposed: When `projectGroups.length === 1` or a project filter is active, replace the name with the provider model label (`modelLabel`, already computed) in the same `text-xs text-secondary-label` slot; three-line row structure and heights unchanged.
- DNA: DNA-ID1, DNA-D1
- Effort: S
- Risk: Needs a product call (owner direction on row content); flagged for spec section 15 if rejected.
- Upstream-eligible: no.
- #24865: partial (monogram quiets, name stays).

### F-02-37 Relative time has no unit above days

- Severity: P3
- Surface: all
- Evidence: `timestampFormat.ts:231-240` returns `${days}d` without bound ("82d" on pins, "412d" for old threads).
- Current: Four-character labels and no sense of scale beyond three months.
- Proposed: `>= 30d` -> "Nmo", `>= 365d` -> "Ny" (ceil nothing, floor). Keep "now/m/h/d".
- DNA: DNA-V10
- Effort: XS
- Risk: `timestampFormat.test.ts` expectations.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-02-38 Multi-select gives no on-screen count or exit cue

- Severity: P3
- Surface: web, desktop
- Evidence: after Cmd-click on two rows the only change is the row fill (`02-thread-list-multiselect-dark-1440x900.png`); the count appears only inside the context menu; Escape clears (second Escape, first closes the menu), which is undocumented in the UI.
- Current: A hidden mode with no indicator.
- Proposed: While `selectedThreadKeys.size > 0`, show the existing `Alert variant="sidebar"` slot with "2 selected, Esc to clear" and a "Clear" ghost button.
- DNA: DNA-P7, DNA-V10
- Effort: XS
- Risk: Shares the slot with the undo notice; undo wins.
- Upstream-eligible: no until #24865 merges.
- #24865: not addressed.

### F-02-39 Shelf chevron direction

- Severity: P3
- Surface: all
- Evidence: baseline `collapsible-section-header.tsx` rotates `ChevronDownIcon` 180deg when collapsed ("^" collapsed, "v" expanded; screenshots `02-thread-list-bottom-shelves-*`).
- Current: Collapsed shows an up arrow.
- Proposed: none beyond #24865.
- DNA: DNA-I3
- Effort: XS
- Risk: None.
- Upstream-eligible: no (superseded).
- #24865: addressed (`-rotate-90` when collapsed, right-pointing).

## Edge-case results (matrix)

Data

- Empty: NOT TESTED live (cannot empty a shared project); code-read `Sidebar.tsx:3244-3262`, FAIL (F-02-28).
- One item: NOT TESTED; code-read: `mt-auto` shelves collapse to one row and the draft divider, no defect found.
- 100+ items: PASS functionally (117 to 127 rows), FAIL for DOM weight (F-02-30).
- 10,000+ items: NOT TESTED (cannot seed on the shared server); code-read FAIL, active list unwindowed (F-02-30).
- Very long names: 500-char sidebar PASS (single-line truncate at the title span, `sw` 3,186 vs 219); hover card FAIL (F-02-15); archive 200-char word FAIL (F-02-08); 227-char path titles PASS.
- Unicode and emoji: PASS (CJK + rocket, ZWJ family emoji, Hangul, no clipped glyphs at 14px).
- RTL: PASS with note: Arabic/Hebrew titles are right-aligned with a leading ellipsis (`dir=rtl`, `textDirection`); mixed-bidi English-first title keeps LTR. Acceptable, listed in "Already good".
- Leading/trailing whitespace: PASS (collapsed by HTML whitespace rules).
- Whitespace-only/invisible: FAIL (F-02-19).

Content: N/A for the list (diff/tool-output rows belong to areas 03 and 05). Very long single-line strings: sidebar PASS, archive FAIL (F-02-08).

Network and agents

- Provider not installed / logged out / auth expired / stream stalls / cancelled mid-token: N/A for the list, status words come from `resolveSidebarThreadStatus`; "Failed" and "Limited" rendered correctly in another agent's row (`02-thread-list-open-dark-390x844.png`).
- Permission prompt mid-stream: PASS observed ("Approval" pill visible on another agent's thread); not captured clearly.
- Two or six threads streaming at once: NOT TESTED (turn budget); code-read: `WorkingDurationLabel` self-ticks via a shared `useNowSecond`, rows stay memoised.
- Relay disconnect, reconnect after sleep, server restart, version mismatch: NOT TESTED (shared server). Prior art #24530 (offline machine's cached threads shown with stale settle/snooze).

Git

- Branch line PASS (`main`, F-02-02 contrast); worktree/PR/terminal indicators NOT TESTED (no fixture thread has a worktree or PR); code-read `ThreadStatusIndicators.tsx:245-324,:776-807`. Detached HEAD, worktree failure, push rejected, merge conflict, branch collision: N/A to the list.

Viewport

- 1440x900 PASS. 800x600 PASS (sidebar 208px, titles truncate, footer overlaps last row). 390x844 PASS as sheet (311px, DRIFT-2 colour already known). 1280x720, 1024x640, ultrawide: NOT TESTED (baseline shots exist in `screens/baseline/`; sidebar width is fixed so no new behaviour expected). Mobile keyboard open: NOT TESTED.
- OS zoom / browser zoom: NOT TESTED; proxy: root font 20px PASS (row grows 78 to 97.5px, text truncates, no overlap, `02-thread-list-font-20px-dark-1440x900.png`).

Preferences

- Light and dark: PASS (all screenshots in both). System switching live: NOT TESTED. Named themes: spot-checked T3 Chat and Ember dark (branch 2.10 and 1.67:1; receded title 5.49 and 4.25:1); others NOT TESTED.
- Reduced motion: NOT TESTED live; code-read `Sidebar.motion.ts` honours it. High contrast: FAIL (F-02-25). Keyboard only: FAIL (F-02-05, F-02-06). Screen reader: NOT TESTED (none on host); #13959.
- Font size overrides: PASS (above).

Lifecycle: first launch, update, corrupted settings, server already running: N/A to the list. Backgrounded/OS sleep/minimised during stream: NOT TESTED (host).

## Already good (do not touch)

- Three-line row anatomy and density (DNA-K1); the Settle/Un-settle and Snooze/Wake pairs (DNA-K2); the project monogram (DNA-K3).
- Escape cancels a drag and a settle sweep; the drag badges (Pin, Unpin, Settle, Un-settle, Wake) and the blue "Pinned"/"Active" boundary labels read clearly (`02-thread-list-drag-pin-badge-dark-1440x900.png`).
- Settle-and-advance navigation, Undo for settle, snooze, unpin, archive and draft discard, with a live-region announcement and `mod+z` ownership.
- Rows ordered and re-ordered with 150ms list motion that respects reduced motion; no continuous animations in rows (measured 0 running animations; status counters tick in isolated spans).
- Search: arrow navigation, `aria-activedescendant`, Escape clears, message and Arabic matches found, clean "No threads found".
- The project filter swaps its icon for the project's monogram; draft rows with the amber pen and hairline separator; the route row stays visible when a shelf is collapsed.
- Touch scroll is not hijacked by the drag sensor (CDP swipe scrolled 366px, no drag badge).
- Per-device shelf expand state; Settled shelf paginates (10 then 25).
- Right-click menu clamps to the viewport and restores focus on close.

## Incomplete

- No fixture has a PR, worktree, or running terminal: PR badge, stack badge, worktree glyph, terminal pulse, the branch-mismatch warning are code-read only.
- 10,000-row behaviour, iOS Safari long-press, screen readers, relay disconnect and restart scenarios, system theme switching, and the native desktop menu are not covered (host limits, shared server, area 14).
- Double-clicking a non-active row did not enter rename in my runs (it did on the active row and through the menu); I could not tell test artefact from defect, see below.
- `Sidebar.drag.ts`, `Sidebar.motion.ts`, `sidebarProjectGrouping.ts`, `sidebarPendingFileDropStore.ts` were read for structure, not exercised end to end (file drop onto a row not tested; the drag-over state is only a `ring-1 ring-primary/70`).
- `closedViewStore.ts` is the panel-tab/browser reopen store, not thread list; out of scope. `LegacySidebar.tsx` was not audited beyond citing its bulk archive (DRIFT-20).
- Thread jump hints (`mod` held) did not appear under a synthetic Meta key; not verified.

## Needs deeper look

- F-02-18: how long a read, finished thread keeps showing "Waiting N" while the provider session idles (observed ~90s only).
- #24865 `MiddleTruncate` now adds a `useLayoutEffect` + `observeResize` + `Range.getBoundingClientRect()` per branch row; on 100+ rows with window resize that is 100+ observers and layout reads. Needs a profile, relevant to F-02-30.
- Double-click rename on non-active rows (navigation re-render between the two clicks?).
- Whether a windowed list can keep dnd-kit collision and `Sidebar.motion.ts` correct (spike before F-02-30).
- Row time uses `latestUserMessageAt ?? updatedAt` (`SidebarThreadRow.tsx:127-130`), not last agent activity; ordering by `unsettledAt`/`createdAt` anchors produced two time-order inversions in the active list. Intentional per docs, but the label can disagree with position.
- Notification toasts use the full 500-char title as description (`ThreadNotificationCoordinator.tsx:176`); belongs to area 12.
- Mobile web at 390px: the sheet's colour (`#111`) differs from the desktop sidebar scope (DRIFT-2); owned by area 01.
