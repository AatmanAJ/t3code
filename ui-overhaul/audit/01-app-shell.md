# Audit 01: app shell

Scope: window chrome and titlebar (web renderer side), sidebar frame (header, search row, footer, collapse, resize, persistence, project filter), chat breadcrumb header, right panel frame (tabs, sheet, resize, per-thread persistence), the floating Thread details card, command palette shell, Settings and Usage route modal, back/forward, behaviour at 800x600, 1024x640, 1152x720, 960x600, 720x450, 3440x1440, 2880x1800 and 390x844.

Method: drove the running dev app (`http://localhost:5733`) with Playwright mouse and keyboard in throwaway contexts (storage state never written back), measured with `getBoundingClientRect` and `getComputedStyle`, read the code for every claim. Desktop (Electron) was not run; desktop findings are marked "code-read". Screenshots: `ui-overhaul/screens/01-app-shell/` (names `01-app-shell-<state>-<theme>-<WxH>.png`).

Baseline used for the `#24865` tags: `ui-overhaul/prior-art/pr-24865.diff`. #24865 does not touch any of `AppSidebarLayout.tsx`, `ui/sidebar.tsx`, `sidebar/SidebarChrome.tsx`, `RightPanelTabs.tsx`, `RightPanelSheet.tsx`, `rightPanelStore.ts`, `CommandPalette*`, `AppRouteModal.tsx`, `WorkspaceBreadcrumb.tsx`, `chat/ChatHeader.tsx`, `chat/PanelLayoutControls.tsx`, `sidebar/mainAppLocation.ts`, `hooks/usePreviewPanelInlineSize.ts`, `ProjectMonogram.tsx`, `projectIconColors.ts`. It does touch `Sidebar.tsx` (shelf header labels only), `index.css` (radius 0.5rem, `--sidebar-icon-color` 60% to 85%, dark `--border` 8% and `--input` 11%, root dark `--muted-foreground` neutral-400, icon stroke 1.75), `ThreadDetailsCard.tsx` (`rounded-3xl` to `rounded-2xl`), `threadDetailsPanelStyles.ts`, `ui/middle-truncate.tsx`, `SidebarThreadRow.tsx` (grayscale project icon at rest), `SettingsSidebarNav.tsx`. None of my proposals touch the four owner calls (blue switch accent, composer model brand colour, three-line sidebar rows, #0a0a0a canvas).

Corrections to DNA.md found while auditing (code wins): the `sidebar_state` cookie is written but never read, so collapsed state is not remembered (DNA 10.1 says it is remembered for 7 days); the phone-width sidebar sheet measures 100vw (390), not `100vw - 12px` (DNA 10.1).

## Findings

### F-01-01 Collapsed sidebar is saved but never restored

- Severity: P1
- Surface: all (web, desktop)
- Evidence: `apps/web/src/components/ui/sidebar.tsx:25-26,117,127-133` writes cookie `sidebar_state` in `setOpen`; nothing reads it. `apps/web/src/components/AppSidebarLayout.tsx:390` hard-codes `defaultOpen`. Steps: load a thread, click "Toggle main sidebar", `document.cookie` shows `sidebar_state=false`, reload: `data-sidebar-state="expanded"` again. Screenshot `01-app-shell-sidebar-collapsed-light-1440x900.png`. Reported as #24191.
- Current: collapsing the sidebar survives only until the next reload or launch; the cookie is dead state.
- Proposed: in `SidebarProvider` (`ui/sidebar.tsx:117`) initialise `_open` from `getLocalStorageItem("t3code:sidebar-open:v1", Schema.Boolean) ?? defaultOpen` (synchronous lazy `useState`, same pattern as `readInitialThreadSidebarWidth`, `AppSidebarLayout.tsx:115-125`), write the same key in `setOpen`, delete the `SIDEBAR_COOKIE_*` constants and the `cookieStore.set` call. Desktop keeps the user's choice per window profile. Mobile sheet state (`openMobile`) stays unpersisted.
- DNA: DNA-L5 (panels persist and degrade), DNA-P3 (UI is truthful: the code advertises persistence it does not do).
- Effort: XS
- Risk: first-run default stays expanded. No unit test covers `SidebarProvider`; add one browser test (collapse, rerender, expect `data-sidebar-state="collapsed"`). The `SidebarControl` shortcut path (`AppSidebarLayout.tsx:140-177`) is unaffected.
- Upstream-eligible: yes (triaged-shaped bug fix, one problem; #24191)
- #24865: not addressed

### F-01-02 On phone-width layouts the chat header panel buttons float above the open sidebar sheet

- Severity: P1
- Surface: web and desktop below 768px (phone web, narrow desktop window, 200% browser zoom)
- Evidence: `apps/web/src/components/chat/PanelLayoutControls.tsx:187-190` (`fixed ... z-50`) versus the sheet at `--z-sheet: 46` (`index.css:113`). `AppSidebarLayout.tsx:181-184` hides only the sidebar toggle (`isMobile && mobileSheetMounted && "hidden"`). At 390x844 with the sheet open, `elementFromPoint(361,26)` is `BUTTON[Toggle right panel]` and `(325,26)` is `Toggle terminal drawer`; clicking the right-panel button opens a second sheet while the sidebar sheet stays. Screenshots `01-app-shell-sidebar-sheet-dark-390x844.png`, `01-app-shell-sidebar-sheet-then-panel-toggle-light-390x844.png`.
- Current: three unrelated header icons render over the sidebar header art and stay clickable; stacking two sheets is possible.
- Proposed: in `WorkspaceTitlebarControls` and `ThreadPanelHeaderControl` call `useSidebar()` and add `isMobile && mobileSheetMounted && "hidden"` plus `inert`, mirroring `AppSidebarLayout.tsx:181-184`. Fallback if hiding is rejected: change `z-50` to `z-[calc(var(--z-sheet)-1)]` on both wrappers.
- DNA: DNA-L7 (layer numbers are a contract), DNA-X4 (phone-width web must work), DNA-P9.
- Effort: XS
- Risk: desktop `wco` titlebar overlay layout is unaffected (rule applies only when `isMobile`). No test covers `PanelLayoutControls` stacking; add a browser test that opens the sheet and asserts the controls are not hit-testable.
- Upstream-eligible: yes
- #24865: not addressed

### F-01-03 Sidebar width and the inline right panel together squeeze the chat column to 280px and break the composer

- Severity: P1
- Surface: all
- Evidence: `components/threadSidebarWidth.ts:4,10-15` caps the sidebar at `viewport - 640` ignoring the right panel; `hooks/usePreviewPanelInlineSize.ts:15,71-77` clamps the panel to `max(360, ...)`, so its minimum wins over the "sibling column keeps 360" guard. `AppSidebarLayout.tsx:403-405` (`shouldAcceptWidth`) only checks 640 of free width. Measured at 1440x900: drag the rail to 800 with the panel open gives chat column 280, panel 360; the composer placeholder wraps to four lines over its own controls (`01-app-shell-sidebar-max-panel-open-light-1440x900.png`). Same at any window where `sidebar + 360 + 360 > viewport`, for example viewport 1100 with a sidebar over 380. At the default 256 sidebar the chat is exactly 360 at 981px (measured) and 360 at 1024 with the panel, which is already tight.
- Current: two independent clamps compose into a layout neither of them allows alone. The composer overflows at 280px.
- Proposed: (1) `shouldAcceptWidth` also subtracts the inline panel width: `const panelW = wrapper.querySelector('[data-preview-panel-mode="inline"]:not([inert])')?.getBoundingClientRect().width ?? 0; return nextWidth <= currentWidth || wrapper.clientWidth - nextWidth - panelW >= (panelW ? 360 : THREAD_MAIN_CONTENT_MIN_WIDTH)`. (2) In `ChatView` choose `sheet` mode when `workspaceLayoutElement.clientWidth < 720` (360 chat + 360 panel) in addition to `RIGHT_PANEL_INLINE_LAYOUT_MEDIA_QUERY`, so a wide sidebar degrades the panel to the sheet instead of crushing chat. (3) Rename `RIGHT_PANEL_INLINE_LAYOUT_MEDIA_QUERY` (it is the sheet query, `rightPanelLayout.ts:1`) to `RIGHT_PANEL_SHEET_MEDIA_QUERY` in the same change.
- DNA: DNA-L5 (panels degrade), DNA-D6 (density follows available space), DNA-K13 (limits stay: 208/640/360/980 are unchanged, only their interaction is fixed).
- Effort: S
- Risk: sidebar drag is `useResizeDrag` in `ui/sidebar.tsx:398-471`; the new check runs per frame, keep it a single `getBoundingClientRect`. No unit tests cover `threadSidebarWidth.ts` or `usePreviewPanelInlineSize.ts`; add table tests for the clamp helpers.
- Upstream-eligible: yes (layout bug fix, single problem)
- #24865: not addressed

### F-01-04 Project filter is dropped on reload for repositories with a git remote, and the saved value is overwritten with null

- Severity: P1
- Surface: all
- Evidence: `apps/web/src/components/Sidebar.tsx:949-953,998-1015`: the effect calls `resolveSidebarProjectScopeKey({... canClearMissingScope: allProjectSnapshotsReady && allProjectConfigsReady})` and `setPersistedProjectScopeKey(null)` when no group matches. Repro in the fixture: scope the filter to `server` (its stored key is the remote-derived logical key, `github.com/<owner>/<repo>`), wait 1.5s, reload: label returns to "Filter threads by project" within 1s and `t3code:ui-state:v1.sidebarProjectScopeKey` becomes `null` (deterministic over three reloads). Scoping to `sample-app` (no remote, key `<env>:<path>`) survives reload. `sidebarProjectGrouping.ts:84-100` shows `resolveSidebarProjectScopeKey` only matches `projectKey` or scratch keys, with no physical-to-logical lookup for a stored key.
- Current: for most real projects (they have a remote) the sidebar scope silently resets on every launch; related reports #16692 (silently stuck scope) and #16445 (grouping rule can't be set from the new sidebar).
- Proposed: root cause suspected, not proven: the stored logical key is compared before group keys settle. Fix in `resolveSidebarProjectScopeKey` (`sidebarProjectGrouping.ts:84-100`): when `key` matches no group, try `buildPhysicalToLogicalProjectKeyMap({projects, settings, primaryEnvironmentId})` in both directions before returning null, and keep the effect from clearing until `allProjectConfigsReady` has been true for one render after `projectGroups` last changed. Add unit tests with a stored logical key against groups keyed physically.
- DNA: DNA-L5 (panels persist), DNA-P3 (truthful state), DNA-P7 (a filter with no durable way back is a one-way door).
- Effort: S
- Risk: wrongly keeping a stale key would show an empty sidebar; the unit test must cover a deleted project (key must still clear). `sidebarProjectGrouping.ts` has no test file today.
- Upstream-eligible: yes after #24865 merges (touches `Sidebar.tsx`, which #24865 edits in other hunks)
- #24865: not addressed

### F-01-05 Closing Settings or Usage, and the sidebar "Back" button, push history entries instead of going back

- Severity: P2
- Surface: all
- Evidence: `apps/web/src/components/sidebar/mainAppLocation.ts:27-36` (`useNavigateToMainApp`, `useCloseAppModal` call `navigate({ href })`). Repro: thread, click Settings (`history.length` 2 to 3), Esc (3 to 4), `Meta+[` lands on `/settings/general` with the modal reopened, a second `Meta+[` returns to the thread; `Meta+]` retraces the same. Same with Usage (`Meta+u`) and with Pull Requests then "Back" (3 to 4, then `Meta+[` returns to `/pull-requests`). Reported as #16542.
- Current: every open/close pair adds two entries, so the browser and `navigation.back` shortcut re-enter the page you just left.
- Proposed: record in `MainAppLocationTracker` whether the current modal was entered from inside the app (a module flag set when the previous in-app location is a non-modal page, cleared on hard load). In `useCloseAppModal` and `useNavigateToMainApp`: if the flag is set call `router.history.back()`; otherwise `navigate({ href, replace: true })`. Deep links to `/settings/...` keep a safe replace.
- DNA: DNA-P7 (every way in has a way out; the way out must not become a new way in), DNA-L4.
- Effort: S
- Risk: `history.back()` while the modal is animating out (`AppRouteModal` calls close from `onOpenChangeComplete`, `AppRouteModal.tsx:32-34`) must not double-fire; no test covers `mainAppLocation.ts`.
- Upstream-eligible: yes (#16542)
- #24865: not addressed

### F-01-06 Focus drops to the document body when Settings or Usage closes

- Severity: P2
- Surface: all
- Evidence: `AppRouteModal.tsx:20-22,51` (`finalFocus={false}`). Repro: focus the footer Settings button, Enter, Esc: `document.activeElement` is `BODY`; the next Tab lands on the sidebar brand link (first focusable in DOM). Palette close, by contrast, returns focus to the composer as documented.
- Current: a keyboard user loses their place every time they close Settings or Usage. The comment explains the reason: returning focus to a mouse-clicked opener paints a focus ring.
- Proposed: `finalFocus={(closeType) => closeType === "keyboard" ? openerRef.current : composerRef/primary scroll container}` or simpler: capture `document.activeElement` on open together with `matches(":focus-visible")`; on close restore it only when it was focus-visible, otherwise focus the composer like the palette does (`[data-composer-rich-text]`). No new tokens.
- DNA: DNA-L8 (keyboard first), non-negotiable 6 (accessibility).
- Effort: XS
- Risk: Base UI `finalFocus` signature differs by version; browser test needed (open via keyboard, close, assert focus). Mouse path must keep showing no ring.
- Upstream-eligible: yes
- #24865: not addressed

### F-01-07 Sidebar toggle throws an unhandled error where `cookieStore` does not exist

- Severity: P2
- Surface: web (Firefox, any non-secure origin such as `http://<lan-ip>` or Tailscale HTTP), not Electron
- Evidence: `ui/sidebar.tsx:127-133` calls `cookieStore.set(...)` unguarded. The Cookie Store API exists only in secure contexts and in some engines. Simulated with `Object.defineProperty(window, "cookieStore", {value: undefined})`: clicking the toggle collapses the sidebar but raises `pageerror: TypeError: Cannot read properties of undefined (reading 'set')` as an unhandled rejection.
- Current: state changes, then the async handler rejects on every toggle; AGENTS.md lists remote and LAN access as a core surface.
- Proposed: superseded by F-01-01 (localStorage write). If F-01-01 is deferred, guard with `if (typeof cookieStore !== "undefined")` and `.catch(() => {})`.
- DNA: DNA-P9 (remote ready, nothing may assume a secure context), DNA-X1.
- Effort: XS
- Risk: none beyond F-01-01.
- Upstream-eligible: yes
- #24865: not addressed

### F-01-08 The Thread details toggle has no tooltip on pointer hover

- Severity: P2
- Surface: all
- Evidence: `chat/PanelLayoutControls.tsx:52-74` wraps the `Toggle` itself as the `TooltipTrigger` render target (and as a `PopoverTrigger` in popover mode), unlike the two sibling buttons which wrap a `<span>` (`:90,112`). Playwright hover for 0.9, 1.6 and 2.5 seconds at 1440 and at 1024 (popover mode): `[data-slot=tooltip-popup]` never appears; keyboard focus shows "Toggle thread details (⇧⌘B)". Terminal and right-panel toggles show "(⌘J)" and "(⌥⌘B)" correctly. Reported as #11985.
- Current: the only header control without a pointer tooltip is the one whose shortcut is least guessable.
- Proposed: render `<TooltipTrigger render={<span className="flex shrink-0" />}>` around the toggle exactly as the other two do, and keep `onPressedChange`/`PopoverTrigger` on the inner toggle.
- DNA: DNA-I4 (never icon-only without a name and shortcut), DNA-L8.
- Effort: XS
- Risk: popover anchoring uses `threadPanelPopoverAnchorRef` on the header, not the trigger, so anchoring is unchanged; verify with the 1024px popover screenshot `01-app-shell-thread-details-popover-light-1024x640.png`.
- Upstream-eligible: yes (#11985 is accepted)
- #24865: not addressed (`ThreadDetailsCard.tsx` changes radius only)

### F-01-09 Both resize handles are pointer-only

- Severity: P2
- Surface: web and desktop
- Evidence: sidebar rail `ui/sidebar.tsx:517-557` is a `<button tabIndex={-1}>` labelled "Resize Sidebar" with no key handler; right panel `preview/RightPanelResizeHandle.tsx:11-24` is `role="separator"` without `tabIndex`, `aria-valuenow/min/max` or key handler. Keyboard-only users cannot change either width; screen readers announce a separator that cannot be operated.
- Current: widths are mouse-only; the 16px rail and 8px panel handle are the only controls.
- Proposed: follow the WAI-ARIA window splitter pattern on both: `tabIndex={0}`, `role="separator"`, `aria-orientation="vertical"`, `aria-valuenow/min/max` from the clamp bounds, ArrowLeft/ArrowRight step 16px (Shift step 64px), Home/End to min/max, Enter or Double-click resets (sidebar already resets on double-click, `AppSidebarLayout.tsx:416`). Focus ring uses the existing `focus-visible:ring-2 ring-inset ring-ring`. Persist through the existing `finish()` paths.
- DNA: DNA-L8, non-negotiable 6; DNA-K13 (limits unchanged).
- Effort: S
- Risk: the rail doubles as the collapse toggle when closed (`ui/sidebar.tsx:486-490`); a focusable separator must not steal Enter from that case. Tests: none exist for either handle.
- Upstream-eligible: no (new interaction; needs maintainer approval)
- #24865: not addressed

### F-01-10 Right-panel width is remembered per thread, so every thread reopens at 540px

- Severity: P2
- Surface: all
- Evidence: `components/ChatView.tsx:3881` (`widthStorageKey={t3code:preview-panel-width:${activeThreadKey}}`) and `hooks/usePreviewPanelInlineSize.ts:11,28-34`. Measured: resize the panel to 740 in thread A (`localStorage` gains `t3code:preview-panel-width:<env>:<thread>`=740); thread B opens at 540. DOCS-DIGEST confirms the docs promise no width persistence at all.
- Current: panel width is treated as thread state, though it is a workspace layout preference like the sidebar width.
- Proposed: keep the per-thread key as an override but seed the fallback from one global key: on drag end write both `t3code:preview-panel-width:<thread>` and `t3code:preview-panel-width`; in `useResizableWidth` read thread key, then the global key, then 540. No schema change. Add "Reset" via double-click (see F-01-33).
- DNA: DNA-L5 (widths persist), DNA-P2 (obvious: one preference, one place).
- Effort: S
- Risk: threads that intentionally used a narrow panel for a diff keep their override; the read order is the only behaviour change.
- Upstream-eligible: no (changes persisted-layout behaviour; discussion first)
- #24865: not addressed

### F-01-11 The right panel sheet is capped at 336px at 800px wide and ignores the saved width

- Severity: P2
- Surface: all, 768-980px viewports and phone widths
- Evidence: `components/RightPanelSheet.tsx:25` `w-[min(42vw,28rem)] min-w-80 max-w-[28rem] max-[760px]:w-[min(88vw,24rem)]`. Measured: 800x600 sheet 336px (chat 592 stays visible but is veiled and inert), 980x700 sheet 412px, 390x844 sheet 342px. The inline default is 540 and diffs, terminals and the browser are designed for it. Screenshots `01-app-shell-rightpanel-open-light-800x600.png`, `...-980x700.png`.
- Current: the surface that carries the most content gets the smallest container exactly when it already covers the screen.
- Proposed: `w-[min(70vw,40rem)] min-w-80 max-w-[40rem] max-[760px]:w-[calc(100vw-3rem)]`. At 800px this is 560px; at 390px it is 342 (unchanged).
- DNA: DNA-L5 (sheet below 980 degrades gracefully), DNA-D6.
- Effort: XS
- Risk: backdrop (`ui/sheet.tsx:22`, `bg-background/60 backdrop-blur-xs`) hides less of the chat; no test covers the sheet width.
- Upstream-eligible: no (opinionated sizing)
- #24865: not addressed

### F-01-12 With the terminal drawer open at 600-640px tall the chat gets 96-136px

- Severity: P2
- Surface: all
- Evidence: measured composer top minus header: 1024x640 gives 136px, 800x600 gives 96px with the drawer at its default 280px (`terminalUiStateStore` default `terminalHeight=280`, `ThreadTerminalDrawer.tsx:98-99`). The composer (172px) then floats mid-window above the drawer. Screenshots `01-app-shell-terminal-open-chat-area-light-800x600.png`, `...-1024x640.png` (cropped above the terminal on purpose).
- Current: the default height is a constant, not a fraction of the window; DNA-K13 keeps the 180 minimum and 75% maximum, but nothing protects the conversation.
- Proposed: initial height when no user-resized value exists: `clamp(180, round(0.4 * innerHeight), 280)` (240 at 600px, 256 at 640px); persist `terminalHeight` only after a drag so the default stays derived. Do not change min/max.
- DNA: DNA-D6 (density follows available height), DNA-L5.
- Effort: S
- Risk: `terminalUiStateStore.ts` writes the default into persisted state on open (`terminalHeight: 280` appears in storage with no drag); needs a migration note. Existing tests: `terminalUiStateStore.test.ts`.
- Upstream-eligible: no
- #24865: not addressed

### F-01-13 The command palette opens on 19 actions; threads sit below the fold

- Severity: P2
- Surface: all
- Evidence: `components/CommandPalette.logic.ts:726-742` `buildRootGroups` pushes "Actions" before "Recent Threads". Measured at 1440x900 (576x420 dialog): 27 items, the first thread row is item 20 and below the visible area (`01-app-shell-palette-default-light-1440x900.png`, dark variant too). DOCS-DIGEST: palette "searches threads across connected environments"; DNA-ID1 and DNA-L2 name the thread list as the product's primary content.
- Current: Cmd+K with an empty query is a command menu; the common job, jumping to a recent thread, needs scrolling or typing.
- Proposed: empty-query order: "Recent threads" limited to 5 rows (`RECENT_THREAD_LIMIT` stays 12 for search), then "Actions". `>` still shows actions only. Change `buildRootGroups` order and `CommandPalette.tsx:921` slice for the empty state only.
- DNA: DNA-L2, DNA-ID1, DNA-K14 (keyboard-first access stays; every action remains one `>` away).
- Effort: XS
- Risk: `CommandPalette.logic.test.ts` asserts group order (`["Actions","Threads"]`); update those assertions. Muscle memory: first item changes from "New thread in <project>" to the latest thread; `mod+shift+n` still creates a thread.
- Upstream-eligible: no (changes a product default; needs discussion)
- #24865: not addressed

### F-01-14 Palette project rows clip the machine label and truncate paths at the wrong end

- Severity: P2
- Surface: all
- Evidence: `components/CommandPaletteProjectItems.tsx:96-116` renders two sibling `truncate` spans. Measured in "New thread in...": `Local` 27px visible of 30 (renders "Lo…"), workspace path 479 of 524px truncated at the end, so the leaf folder is the part that disappears. Screenshot `01-app-shell-palette-project-rows-light-1440x900.png` (home directory name masked).
- Current: with long workspace roots the row shows machine fragments and the unique tail is lost.
- Proposed: give the machine span `shrink-0 max-w-[40%]` and render the path with the existing start-truncation helper (`StartTruncatedPath.tsx`, or `ui/middle-truncate.tsx` after #24865 lands its whole-letter version) so `…/t3code/apps/server` keeps its tail. Same helper in the "Projects" results group.
- DNA: DNA-T9 (long paths use middle/start truncation).
- Effort: XS
- Risk: `ui/middle-truncate.tsx` changes in #24865; build on its end state. Existing tests only cover logic, not the row.
- Upstream-eligible: yes after #24865 merges (follow-up on the same helper)
- #24865: not addressed (helper changes underneath)

### F-01-15 Sidebar footer tooltips omit the shortcuts that exist, and Settings has none on web

- Severity: P2
- Surface: web (desktop has the menu accelerator)
- Evidence: `sidebar/SidebarChrome.tsx:134-157,207-223`: tooltip text is the bare label. Measured: "Usage" (default binding `usage.open` = `mod+u`, `packages/shared/src/keybindings.ts:172`), "Settings" (no web binding; desktop menu has `CmdOrCtrl+,`, `DesktopApplicationMenu.ts:174`), "Pull Requests" (none). "Toggle main sidebar (⌘B)", "Toggle terminal drawer (⌘J)", "Toggle right panel (⌥⌘B)" do show theirs. The palette rows "Open settings" and "Open pull requests" also show no shortcut.
- Current: three primary destinations have icon-only buttons with no shortcut hint, and web users cannot open Settings from the keyboard except through the palette.
- Proposed: pass `shortcutLabelForCommand(keybindings, "usage.open")` into `SidebarUtilityItem` and render `Usage (⌘U)`; add default `{ key: "mod+,", command: "settings.open" }` for web and desktop (desktop already forwards `open-settings`), skipped when it conflicts, guarded by `when: "!terminalFocus"`. The second half is a new default binding: ship only the tooltip fix if the binding is not approved.
- DNA: DNA-L8 (every primary action has a shortcut shown with Kbd), DNA-I4.
- Effort: XS (tooltip), S (binding plus keybindings settings row)
- Risk: Firefox and Safari reserve `mod+,`; the existing `BrowserKeybindingNotice` pattern covers it. `packages/shared` keybinding tests enumerate defaults.
- Upstream-eligible: tooltip yes; binding no
- #24865: not addressed (only `--sidebar-icon-color` 60% to 85% improves icon legibility)

### F-01-16 The phone-width dark sidebar sheet paints #111 while the desktop sidebar is #000

- Severity: P2
- Surface: web and desktop below 768px
- Evidence: `ui/sidebar.tsx:260-290`: `data-app-sidebar` is spread onto the inner `<div>` (`...props`, line 287) while the background is painted by `SheetPopup` (`bg-sidebar`, line 263) which sits outside that scope, so it reads root `--sidebar` (`#111`). Measured: sheet `color(srgb 0.068 0.068 0.068)` vs desktop `rgb(0,0,0)`; `01-app-shell-sidebar-sheet-dark-390x844.png`. DNA DRIFT-2.
- Current: one sidebar, two blacks, and different border/muted tokens depending on width.
- Proposed: pass `data-app-sidebar=""` to the `SheetPopup` itself (move it from `...props` on the inner div into the popup props), so `[data-app-sidebar]` re-scoping (`index.css:1213-1255`) applies. After #24865 the root and scoped muted foreground (`#a3a3a3`) and border (8%) already match; this closes the remaining background and `--input` gap.
- DNA: DNA-C3, DNA-C10.
- Effort: XS
- Risk: portaled content inside the sheet (menus) is outside the scope either way. No test covers the mobile sheet.
- Upstream-eligible: yes (DRIFT-2 is a small fix-shaped change in `ui/sidebar.tsx`, which #24865 does not touch)
- #24865: partial (root dark tokens converge; background and input still differ)

### F-01-17 Project monogram glyphs fail the 4.5:1 floor in light mode for 15 of 18 hues

- Severity: P2
- Surface: all
- Evidence: `components/ProjectMonogram.tsx:28-40` draws 8.25px bold mono text in `currentColor` over a 14% tint of itself; `projectIconColors.ts` uses `text-<hue>-600`. Measured against the light sidebar (`oklch(0.985 0 0)`): yellow 2.46, lime 2.55, green 2.64, amber 2.65, orange 2.86, cyan 2.94, emerald 2.96, teal 2.98, sky 3.23, rose 3.40, pink 3.42, fuchsia 3.52, red 3.56, blue 4.11, purple 4.19; only gray 5.87, indigo 4.97, violet 4.52 pass. Dark values are 5.9 to 11.0 (pass). `sample-app` ("SA", green) is 2.64:1.
- Current: the identity glyph in the breadcrumb, palette, filter popup and settings is below the contrast floor for text under 14px; DRIFT-22.
- Proposed: separate tint from glyph: add `glyphClassName` per hue using `-800` in light (`text-green-800 dark:text-green-400`), keep `-600` for the tint via `bg-<hue>-600/14`; `ProjectMonogram` takes both classes. Hue, tile, 25% radius, 2-letter mono glyph unchanged. Estimated 6:1 or better at -800.
- DNA: DNA-C5, DNA-C14 (raw hues are for identity, still), conflicts only with the letter of DNA-K3 for the glyph shade, justified by measured 2.46-4.19 values.
- Effort: S
- Risk: #24865 renders sidebar-row icons grayscale at `opacity-60` at rest (`SidebarThreadRow.tsx`), which lowers the grey glyph's contrast further (gray-600 at 60% opacity); a follow-up must keep the glyph solid and fade only the tint. Settings project picker also uses these classes.
- Upstream-eligible: no (identity change, DNA-K3 territory)
- #24865: partial (sidebar rows go grey at rest, every other surface keeps the colour; resting opacity makes contrast worse)

### F-01-18 The brand link is announced "Go to threads" but opens or re-opens a draft, and leaves a duplicate history entry

- Severity: P2
- Surface: all
- Evidence: `sidebar/SidebarChrome.tsx:105-114` (`aria-label="Go to threads" to="/"`); `routes/_chat.index.tsx:44-56` replaces `/` with a draft in the most recently updated project. Repro: `Meta+Shift+N` (draft A), click the brand link: URL returns to draft A; `Meta+[` stays on the same URL (no visible change), a second `Meta+[` reaches the previous thread. Reported as #24203.
- Current: the label promises a list, the action creates a draft; the extra entry makes Back appear dead.
- Proposed: label `aria-label="New thread"`; when the current route is already a draft of the same project, do nothing (`preventDefault` on click, focus the composer). From other routes keep today's behaviour.
- DNA: DNA-V2 (destinations are nouns, actions are verbs; the label must name the action), DNA-P3.
- Effort: XS
- Risk: Only the new sidebar uses this link (`LegacySidebar.tsx` has no "Go to threads" label); no test asserts the label.
- Upstream-eligible: yes (#24203)
- #24865: not addressed

### F-01-19 Mod+B is both "toggle sidebar" and composer bold, decided by a hard-coded check

- Severity: P3
- Surface: web and desktop
- Evidence: `AppSidebarLayout.tsx:149-157` returns early when `isRichTextBoldShortcut` and the target is `[data-composer-rich-text]`. Measured: type "hello world" in the composer, `Meta+b` with no selection collapses the sidebar; select all, `Meta+b` bolds (`<strong>`) and the sidebar does not move; in the sidebar search box with a selection it toggles. The keybindings editor shows only `sidebar.toggle`. Reported as #17021 ("works intermittently").
- Current: the same chord has two meanings with no `when` expression to express it, so rebinding one silently affects the other.
- Proposed: expose the condition to the keybinding system as a context key `composerRichSelection` (set from `isRichTextBoldShortcut`'s selection check) and change the default to `{ key: "mod+b", command: "sidebar.toggle", when: "!composerRichSelection" }`; remove the early return from `SidebarControl`. The editor can then show and override it.
- DNA: DNA-L8, DNA-P2 (one model: keybindings own conflicts).
- Effort: S
- Risk: `when` context keys are enumerated in `ShortcutMatchContext` (`apps/web/src/keybindings.ts:27-36`) and `unknownWhenVariables`; server keybinding migrations apply "late defaults" (`apps/server/src/keybindings.ts:98`), which is a server change, so the UI part must be gated: ship the context key first, the default later.
- Upstream-eligible: no (touches defaults and server migration)
- #24865: not addressed

### F-01-20 The project crumb in the header is a hidden "New thread" action

- Severity: P3
- Surface: all
- Evidence: `chat/ChatHeader.tsx:286-305`: a button with `aria-label="New thread in sample-app"` styled like a breadcrumb link; clicking from a thread opens `/draft/<id>` (measured), the tooltip is the only hint. The sibling thread title shows a chevron on hover/focus (`:386-390`) to signal its menu.
- Current: a crumb that looks like navigation performs a create action.
- Proposed: add the same affordance the title has: `SquarePenIcon className="size-3 shrink-0 opacity-0 transition-opacity group-hover/crumb:opacity-100 group-focus-visible/crumb:opacity-100"` after the name, with `group/crumb` on the button.
- DNA: DNA-P3 (truthful controls), DNA-I3 (icons muted until active), DNA-M4 (100-150ms colour/opacity only).
- Effort: XS
- Risk: crumb width grows 12px on hover; the name already truncates at `max-w-40`.
- Upstream-eligible: no
- #24865: not addressed

### F-01-21 The phone-width sidebar sheet is full-bleed 390px, not the documented `100vw - 12px`

- Severity: P3
- Surface: web and desktop below 768px
- Evidence: `ui/sidebar.tsx:28,271-275` passes `style={{"--sidebar-width": SIDEBAR_WIDTH_MOBILE}}` to `SheetPopup`; the rendered element's `style` is only `--nested-dialogs: 0;` (the custom property never reaches the DOM; the cause is in the sheet render path around `ui/sheet.tsx:109-110`, not confirmed), so the `w-(--sidebar-width)` class resolves to nothing and the sheet is `100vw` (measured 390 at 390, 720 at 720). No sheet backdrop is rendered for it (`[data-slot=sheet-backdrop]` absent), so there is no tap-out strip; Esc and the in-sheet toggle close it. At 720px wide (200% zoom) the "phone" sidebar is a 720px list.
- Current: the intended inset and tap-out strip never existed; DNA 10.1 documents behaviour the code does not have.
- Proposed: set the width through `className` instead of `style`: `w-[calc(100vw-var(--spacing(3)))] max-w-[26rem]` on the mobile `SheetPopup` (`ui/sidebar.tsx:263`), restoring a 12px strip so a tap outside closes it, and cap at 26rem for tablets.
- DNA: DNA-X4, DNA-L5.
- Effort: XS
- Risk: safe-area padding (`pl-safe`, line 285) must still apply; verify on the 390 and 720 screenshots.
- Upstream-eligible: yes
- #24865: not addressed

### F-01-22 A maximized right panel hides every cue of which thread you are in

- Severity: P3
- Surface: all
- Evidence: `ChatView.tsx:3187-3190` collapses the chat column to `w-0` when maximized; the breadcrumb measures 0px wide, the details toggle goes with it. With the sidebar collapsed there is no thread name anywhere (`01-app-shell-rightpanel-maximized-light-1440x900.png`, sidebar open there only because the highlight row is the cue). Maximized state also persists across reload (`maximized` in `rightPanelStore`).
- Current: users returning to a maximized panel after a reload see only tabs.
- Proposed: render a muted 12px thread-title chip at the right end of the tab strip while `maximized` (`text-muted-foreground max-w-48 truncate`, tooltip with the full title), no new tokens.
- DNA: DNA-P3, DNA-L1 (no new column; reuse the tab band).
- Effort: XS
- Risk: tab strip width budget; hide the chip when `tabScrollState.hasOverflow`.
- Upstream-eligible: no
- #24865: not addressed

### F-01-23 Titles that render blank leave an empty breadcrumb with an 18px click target

- Severity: P3
- Surface: all
- Evidence: titles made of U+200B, U+2800 or U+3164 are accepted by the contract. Measured at 1440: zero-width title gives a `Thread actions for ...` button 18px wide (only the chevron), braille-blank 47px, Hangul filler 42px, with nothing visible after the "/". `chat/ChatHeader.tsx:383-385` renders the raw title; `resolveRenameCommit` (`:58-66`) only trims ordinary whitespace.
- Current: the thread looks untitled and unclickable. (Sidebar rows have the same exposure, area 02.)
- Proposed: one helper `displayThreadTitle(title)` that returns "Untitled thread" when the title has no `\p{L}\p{N}\p{P}\p{S}` after removing `\p{Z}\p{Cf}` and U+2800/U+3164; use it in the breadcrumb, aria-label and tooltip.
- DNA: DNA-P3, DNA-V3.
- Effort: XS
- Risk: titles only change in display, not in data.
- Upstream-eligible: yes
- #24865: not addressed

### F-01-24 Sidebar footer destinations show no current state while their modal is open

- Severity: P3
- Surface: all
- Evidence: `sidebar/SidebarChrome.tsx:159-229`: on `/pull-requests` the three icons are replaced by a "Back" row, but on `/settings/*` and `/usage` (modals) the icons are unchanged with no `data-active` or `aria-current`. The sidebar is only a blurred 80px strip behind the modal at 1440 wide.
- Current: two navigation idioms for sibling destinations.
- Proposed: pass `isActive={pathname.startsWith(...)}` and `aria-current="page"` into `SidebarUtilityItem` for Settings and Usage (existing `SidebarMenuButton` active styles, no new token).
- DNA: DNA-P3, DNA-L2.
- Effort: XS
- Risk: none beyond a style change; #24865 raises `--sidebar-icon-color` to an 85% mix which the active state sits on.
- Upstream-eligible: no
- #24865: not addressed (icon colour mix improved only)

### F-01-25 Per-thread layout keys are never pruned

- Severity: P3
- Surface: all
- Evidence: `rightPanelStore.ts` persists `byThreadKey` and `threadPanelVisibilityByThreadKey` (version 14) with no removal path; `ChatView.tsx:3881` writes one `t3code:preview-panel-width:<env>:<thread>` localStorage key per thread resized; `terminalUiStateStore` is per thread too. Deleted and archived threads keep their entries forever. Measured: one open and one hide created entries for each visited thread.
- Current: storage grows with every thread ever touched (a 10,000-thread user accumulates thousands of keys and a large JSON parsed on boot).
- Proposed: on shell-snapshot bootstrap, drop keys whose thread id is absent from `useThreadShells()` after the environment is bootstrapped and older than 30 days; store a `touchedAt` per entry (v15 migration).
- DNA: DNA-P1 (performance as a constraint), DNA-P2.
- Effort: M
- Risk: pruning too early loses state for threads still loading; never prune while `allEnvironmentShellsBootstrapped` is false. `rightPanelStore.test.ts` covers migrations.
- Upstream-eligible: no
- #24865: not addressed

### F-01-26 Shell strings drift from sentence case and the single ellipsis character

- Severity: P3
- Surface: all
- Evidence: `ui/sidebar.tsx:396-397` aria-label "Resize Sidebar", title "Toggle Sidebar", sr-only "Toggle Sidebar" (`:370`) next to "Toggle main sidebar" (`AppSidebarLayout.tsx:196`); `CommandPalette.logic.ts:735` group "Recent Threads"; `:764-776` placeholders "Search commands, projects, and threads..." and "Search..."; `Sidebar.tsx:2772` "Search projects..."; `ChatHeader.tsx:333` parent crumb collapses to ASCII "...". DNA-V9 DRIFT-14.
- Current: three casings and two ellipsis forms in 12 characters of chrome.
- Proposed: "Resize sidebar", "Toggle sidebar" (single phrase "Toggle main sidebar" kept for the button), "Recent threads", and U+2026 in all five strings.
- DNA: DNA-V1, DNA-V9.
- Effort: XS
- Risk: grep finds no test that queries these strings (`Toggle main sidebar` appears only in `AppSidebarLayout.tsx` and `SidebarChrome.tsx`); `CommandPalette.logic.test.ts` asserts group labels and must be updated for "Recent threads".
- Upstream-eligible: no (copy changes are maintainer calls)
- #24865: not addressed

### F-01-27 The project filter popup does not mark the selected project and cannot tell same-named projects apart

- Severity: P3
- Surface: all
- Evidence: `Sidebar.tsx:2800-2830` `ComboboxItem hideIndicator`; rows show favicon, name and an environment badge only when several environments exist. Measured with scope `sample-app`: `aria-selected="true"` and `data-highlighted` are the same item, so as soon as the pointer moves the selection is invisible (`01-app-shell-project-filter-open-light-1440x900.png`). The palette rows for the same projects show the path; this popup does not.
- Current: two folders both named `web` or `app` would be one ambiguous pair.
- Proposed: drop `hideIndicator` for the selected item (existing 14px `CheckIcon` slot, `text-foreground`), and add `title={project.memberProjects[0].workspaceRoot}` plus a 12px muted second line only when two groups share `displayName`.
- DNA: DNA-P3, DNA-T9.
- Effort: S
- Risk: item height changes only for duplicates.
- Upstream-eligible: no
- #24865: not addressed (`Sidebar.tsx` touched in unrelated hunks)

### F-01-28 Keyboard order puts the sidebar toggle last

- Severity: P3
- Surface: all
- Evidence: `AppSidebarLayout.tsx:394-423`: `SidebarControl` renders after `{children}`, so the visually first control is the last tab stop. Measured Tab order from the composer: composer controls, details card controls, "Toggle main sidebar", then wraps to the brand link. When the sidebar is collapsed the focus trap (`ui/sidebar.tsx:221-234`) can only land on that toggle.
- Current: the control that restores the primary navigation is the final stop in the document.
- Proposed: render `<SidebarControl />` before `<Sidebar>` in `AppSidebarLayout` (it is `fixed`, so layout is unchanged) and add a visually-hidden `Skip to conversation` link as the first child of the wrapper pointing at `[data-chat-column]` (`sr-only focus:not-sr-only`).
- DNA: DNA-L8, non-negotiable 6.
- Effort: XS
- Risk: tests that assume DOM order of the toggle; none found.
- Upstream-eligible: yes (small accessibility fix) - but skip link is an addition, keep it out of the upstream PR
- #24865: not addressed

### F-01-29 New-thread shortcuts shown in the sidebar do nothing while Usage or Settings is open

- Severity: P3
- Surface: all
- Evidence: measured on `/usage`: `Meta+Shift+N` leaves the URL at `/usage`, `Meta+b` still works. `AppSidebarLayout.tsx:422` unmounts `ThreadUndoShortcut` for modal pages and the modal "owns its shortcuts" (`AppRouteModal.tsx:10-14`). Reported as #23425.
- Current: the blurred sidebar still advertises `New thread (⇧⌘O)` while the chord is inert.
- Proposed: in `ChatRouteGlobalShortcuts` (`routes/_chat.tsx:37`) allow `chat.new`, `chat.newLocal`, `chat.newWithoutProject` and `navigation.*` when `isAppModalPage(pathname)`: close the modal (`useCloseAppModal`) then run the command.
- DNA: DNA-P8 (entry points), DNA-L8.
- Effort: S
- Risk: Usage binds `c`, `t`, `l`, `mod+shift+1..4` (`usagePageOpen`); only add chords that do not collide.
- Upstream-eligible: no (behaviour decision)
- #24865: not addressed

### F-01-30 The Thread details card state is per thread with no default

- Severity: P3
- Surface: web and desktop
- Evidence: `rightPanelStore.threadPanelVisibilityByThreadKey` (storage shows `{"inlineOpen":false,"popoverOpen":false}` per thread). Measured: hide the card in thread A, it stays hidden after reload; thread B and every new draft show it again. Discussion #15119 asks for default-collapsed.
- Current: users who never want the card must hide it in every thread.
- Proposed: `Settings -> Appearance -> Thread details card: Show | Hide for new threads` (client setting `threadDetailsDefault: "show" | "hide"`), used as the initial value when no per-thread entry exists. No change to the card itself (DNA-K7).
- DNA: DNA-K7 (card untouched), DNA-P2.
- Effort: S
- Risk: none; additive setting.
- Upstream-eligible: no (needs the Ideas discussion #15119 approved)
- #24865: not addressed (card radius changes only)

### F-01-31 Route-modal and sheet transitions have no reduced-motion branch

- Severity: P3
- Surface: all
- Evidence: `AppRouteModal.tsx:55` `transition-[opacity,scale] duration-150` and `ui/sheet.tsx:22,93` (backdrop `transition-all duration-200`, popup `transition-[opacity,translate] duration-200`). Measured with `reducedMotion: "reduce"`: computed `transition-duration` stays `0.15s` on `[data-app-modal]`. Panels themselves honour the setting (`panelAnimations.ts:30-38`). DRIFT-18.
- Current: users who asked for reduced motion still see a scale/opacity animation on modals and sheets.
- Proposed: append `motion-reduce:transition-none` to the two class strings (opacity and 0.985 scale are the only properties).
- DNA: DNA-M5.
- Effort: XS
- Risk: Base UI waits for transitions on close (`onOpenChangeComplete`); with `transition-none` it fires immediately, which is the intent.
- Upstream-eligible: yes
- #24865: not addressed

### F-01-32 The empty right panel shows single-key hints on touch layouts

- Severity: P3
- Surface: web at phone width
- Evidence: `RightPanelTabs.tsx:296-476` renders `<Kbd>{action.shortcut}</Kbd>` letters (B, T, F, D, P, L, M) for every row; the window-level handler (`:382-396`) only runs with a hardware keyboard. At 390x844 (`01-app-shell-rightpanel-open-light-390x844.png`) the hints are decoration; disabled rows are `opacity-50` where DNA-C4 sets disabled at `opacity-64`.
- Current: chrome that implies a keyboard that is not there.
- Proposed: hide the keycap with `pointer-coarse:hidden`, and change disabled rows to `opacity-64`.
- DNA: DNA-X4, DNA-C4.
- Effort: XS
- Risk: none.
- Upstream-eligible: no
- #24865: not addressed

### F-01-33 The right-panel handle has no tooltip or reset, unlike the sidebar rail

- Severity: P3
- Surface: web and desktop
- Evidence: sidebar rail has a tooltip "Drag to resize sidebar" and resets on double-click (`AppSidebarLayout.tsx:416`, `ui/sidebar.tsx:560`); `preview/RightPanelResizeHandle.tsx:11-24` has neither, is 8px (`w-2`) against the rail's 16px, and shows its hairline only on hover (`bg-transparent`, `group-hover:bg-border`). Measured rail 16x900 at x=247; panel handle at the panel edge.
- Current: two resize affordances in one window behave differently and the reset gesture is undiscoverable on both.
- Proposed: add `onDoubleClick` resetting to the default (or the global width from F-01-10), tooltip "Drag to resize, double-click to reset" on both, and match the hit width at `-left-2 w-4` with the 2px hover line (`after:w-[2px]`) the rail uses.
- DNA: DNA-I4, DNA-S3.
- Effort: S
- Risk: wider hit area overlaps the tab strip's first 8px; the panel header is `drag-region` on desktop (`RightPanelTabs.tsx:1242`), keep `-webkit-app-region: no-drag` on the handle.
- Upstream-eligible: no
- #24865: not addressed

## Judgement: Settings and Usage as route modals over the chat

Verdict: keep the pattern (DNA-L4 stays), fix the seams.

What it buys, measured: `ChatRouteLayout` keeps `ChatView` mounted under the modal (`[data-chat-column]` is `inert`, `aria-hidden` is not set), so scroll position, composer draft and a running turn survive opening Settings; closing returns to the exact origin via `mainAppHref`/`appModalReturnHref`. Thread-to-thread switching measured: the header changed within about 150 ms of the click and the content about 75 ms later, with no empty or mismatched frame (route transition PASS).

What it costs: at 1440x900 the modal is 1280x820 (89% of the window, `AppRouteModal.tsx:55` `max-w-[80rem] max-h-[60rem]`), so the veiled sidebar and chat behind it are an 80px strip and carry no usable context (`01-app-shell-settings-modal-light-1440x900.png`); at 800x600 it is 752x552 and at 390x844 full screen with an icon-only nav (`01-app-shell-settings-modal-light-800x600.png`, `...-390x844.png`), which is correct. Everything behind it is dead: no thread switching, new-thread shortcuts inert (F-01-29), history grows by two entries per visit (F-01-05), focus is lost on close (F-01-06), transitions ignore reduced motion (F-01-31). Live preview of appearance changes (the one case where a translucent overlay would earn its keep) is not offered: the veil is `--background` 60% plus 4px blur (`index.css:421-429`).

Recommendation for the spec: no structural change. Ship F-01-05, F-01-06, F-01-29, F-01-31. Do not shrink the modal; the 80rem width is what the settings layout (240px nav + 896px content) needs. A cost still to measure: the 4px `backdrop-filter` over a streaming chat (see Needs deeper look, area 22).

## Edge-case results (matrix)

Data

- Empty (no projects): NOT TESTED live (would need deleting fixture projects). Code-read: `SidebarThreadHeader` hides filter and Add project when `hasProjects` is false (`SidebarThreadHeader.tsx:105-112`); the empty hero is area 10.
- One item: N/A (shell chrome does not depend on count).
- 100+ items: PASS (146 threads; sidebar scroll, palette, filter all responsive; thread-row virtualisation is area 02).
- 10,000+ items: NOT TESTED (no fixture). Per-thread persisted keys grow unbounded: F-01-25.
- Very long names: PASS for 500-char thread title, 227-char path title and 200-char single word (breadcrumb truncates with ellipsis, tooltip carries all 500 chars at 320x175, `01-app-shell-breadcrumb-long500-light-1440x900.png`, `...tooltip-long500...`). FAIL for long project root paths in the palette: F-01-14. Project name crumb is capped at `max-w-40` (`ChatHeader.tsx:299`), code-read.
- Unicode and emoji: PASS (Arabic, Hebrew, mixed-bidi, Markdown/HTML-looking titles at 1440, 1024, 800; emoji/CJK title not separately measured).
- RTL: PASS (`dir` resolves to rtl on the `h2`; ellipsis lands on the left for an overlong Arabic title, tested by DOM mutation, `01-app-shell-breadcrumb-rtl-long-dom-light-800x600.png`).
- Leading/trailing whitespace: PASS (contract trims). Whitespace-only/blank-looking: FAIL F-01-23.

Content: N/A for the shell (owned by 03, 05, 06). Links in the breadcrumb: N/A.

Network/agents

- Provider not installed, logged out, auth expired, stream stalls or cancelled, permission prompt mid-stream: N/A to shell chrome (areas 09, 12).
- Two threads streaming at once: PASS incidentally (another audit turn showed "Working 56s" in the list while I used the shell; header and panels unaffected). Six at once: NOT TESTED.
- Relay disconnected, reconnect after sleep, server restarted under the client, version mismatch: NOT TESTED (not producible without touching the shared dev server).

Git: N/A (details card contents are area 05; card geometry measured).

Viewport

- 1440x900: PASS with F-01-01, 08, 13, 15, 18.
- 1280x720: PASS (tabs and overflow arrows checked at 1280x720; chat 484px with panel, composer collapses to icons).
- 1152x720 (OS 125%): PASS; panel opens inline at 536 and chat 360.
- 1024x640: FAIL F-01-03 (chat 360 with panel), F-01-12 (96-136px of chat with terminal).
- 960x600 (OS 150%), 980x700: PASS (sheet at 412px, sidebar docked); sheet width F-01-11. 981x700: inline panel 365, chat 360 (borderline).
- 800x600: FAIL F-01-11, F-01-12; sidebar pinned at the 208px minimum (`THREAD_SIDEBAR_MIN_WIDTH`), details card correctly absent (popover mode).
- 720x450 (browser zoom 200%): PASS (sidebar becomes sheet below 768, panel is sheet) with F-01-02, F-01-21.
- 3440x1440: PASS (sidebar 256, lane 736 centred, settings modal 1280x960 centred, palette 576x420); the details card sits at the window edge about 930px from the lane (DNA-K7, left alone).
- 2880x1800 (browser zoom 50%): PASS (inline panel 540, card visible).
- 390x844: FAIL F-01-02, F-01-21; palette 358x420 at y=34 fits; palette at 390x500 (keyboard open) fits (y=20, bottom 440).
- OS zoom 80/125/150 and browser zoom 50/200: covered by the CSS-pixel equivalents above.

Preferences

- Light and dark: PASS for shell, palette, modal, sheet (F-01-16 only dark sheet).
- System switching live: NOT TESTED (colour scheme was set per context).
- Every named theme: PASS (T3 Chat, Grove, Ocean, Ember, Iris, light and dark: `01-app-shell-theme-<id>-<scheme>-1440x900-crop.png`); sidebar-versus-canvas lightness differs by theme (Needs deeper look).
- Reduced motion: FAIL F-01-31 (overlay transitions); panel animations default 0 and the gate PASS.
- High contrast / forced colors: NOT TESTED.
- Keyboard only: FAIL F-01-06, F-01-09, F-01-28; Tab order and focus rings otherwise PASS (blue 2px inset ring on rail footer buttons and filter, `01-app-shell-sidebar-footer-focus-light-1440x900.png`).
- Screen reader: NOT TESTED with VoiceOver or NVDA; ARIA trees read via Playwright `ariaSnapshot`: `navigation "Threads"`, `combobox "Search threads"`, `dialog "Command palette"`, `navigation "Thread breadcrumb"` all sensible.
- Font size overrides: NOT TESTED for the shell.

Lifecycle

- First ever launch, launch after update, corrupted settings, launch while server running: NOT TESTED (shared dev server).
- Reload persistence: sidebar width PASS (`chat_thread_sidebar_width`, clamp 208..viewport-640, double-click reset), sidebar collapsed FAIL F-01-01, right panel open/closed per thread PASS, panel width per thread PASS (F-01-10 design issue), details card per thread PASS (F-01-30), terminal open per thread PASS, maximized PASS, project scope FAIL F-01-04.
- Backgrounded for an hour, window minimised during stream, OS sleep: NOT TESTED (host).

## Already good (do not touch)

- Sidebar resize mechanics: drag clamps to 208px and `viewport - 640`, persists on pointer up, restores on reload, double-click resets (DNA-K13). The 1px off-by-one on drag end (401 for a drop at 400) is sub-pixel noise.
- Breadcrumb truncation: `min-w-0` chain, `max-w-40` project crumb, full-title tooltip, `dir` per title, rename on double-click, title menu (`ChatHeader.tsx`).
- Route modal retention of `ChatView` (inert, no remount) and instant thread switching with no flash of empty or mismatched header (about 150 ms to header, 75 ms more to content).
- Right panel inline/sheet switch at 980/981 and per-thread open state; min 360 and 70% max behave on their own (only the composition is F-01-03).
- Command palette: focus lands in the input, first item highlighted, `>` actions-only mode, "No matching commands, projects, or threads." and "No matching actions." empty states, footer hints, Esc returns focus to the composer, 576x420 holds from 390 to 3440.
- Sidebar header artwork is Dev/Nightly-only static SVG (DNA-K15) and themes recolour it correctly; named themes keep the frame readable.
- Footer icon buttons are 32x32 with a focus ring and `aria-label`; header toggles carry aria labels and shortcuts (except F-01-08).
- Panel animation gate (`data-panel-animations`) and 0 ms default: nothing animates on open/close (DNA-K4).

## Incomplete

- Electron desktop (titlebar, traffic-light inset, `wco` overlay, `.drag-region`, fullscreen) was not run; area 14 owns it. All desktop statements are code-read.
- `VoiceOver`/`NVDA`, forced-colors, system theme switching, font-size overrides, 10,000-thread list, relay/reconnect/restart rows were not produced.
- Side effects left on the audit dev server (synthetic data only): while testing tab overflow I opened three server-browser preview tabs on thread `mcp:4db596b5-60b6-47e5-b43a-44ef7b5bf83f` (closed them afterwards through the tab close buttons) and two terminals on that thread (`Close Terminal 2` did not remove them; they idle in the sample repo). I cropped terminal screenshots above the prompt and deleted the originals because the prompt shows a local username; the palette project-rows screenshot has the home directory name masked in the DOM before capture.
- The `/` route landed on the pinned "Migrate tests to vitest browser mode" thread (project `server`) instead of a draft; I could not tell whether that is the draft store state of the paired browser or a real defect (see Needs deeper look).
- Why-it-happens for F-01-04 (scope key cleared) is a hypothesis from reading `Sidebar.tsx:998-1015`; the live symptom is reproduced.

## Needs deeper look

- Area 02: after `Meta+Shift+N` the new draft does not appear in the sidebar list (drafts without content are hidden by `visibleDraftSessionCount`); confirm it is intended. The aria tree shows thread rows as `button` containing nested `button`s (#13959).
- Area 03/02: the thread title menu (`01-app-shell-title-menu-light-1440x900.png`) shows no shortcut hints though `thread.pin`, `thread.settle` and `thread.copyReference` have defaults.
- Area 04/10: `/` opened an old pinned thread of project `server` instead of a draft (URL `/<env>/mcp:ef0bc57f...`); `/new` with no prompt renders "Could not open the link" with no header or chrome and is what the baseline captures as "new-thread".
- Area 06: terminals and browser tabs created from the panel are server-owned and reappear in a fresh browser context; closing a terminal from the drawer did not remove "Terminal 2" in my pass.
- Area 14: titlebar/drag-region behaviour; `ThreadPanelHeaderControl` and `WorkspaceTitlebarControls` reserve `pr-24` and `pr-28` (`ChatHeader.tsx:276`, `RightPanelTabs.tsx:1242-1244`) against 92px of controls plus 12px inset; verify on Windows with the caption-button overlay.
- Area 17/18: in Grove, Ocean, Ember and Iris dark the sidebar background is lighter than the canvas (oklch L 0.31 vs 0.26 in Grove), while default dark (#000 vs #0a0a0a) and T3 Chat dark have it darker; DNA-C3 describes the darker sidebar.
- Area 22: `dialog-backdrop` applies `backdrop-filter: blur(4px)` over the whole viewport for a modal that covers 89% of it, above a live chat; GPU cost during streaming not measured.
- Area 16: `SidebarRail` and handle roles (F-01-09), tooltip content in popovers.

## Screenshot index (`ui-overhaul/screens/01-app-shell/`)

Key files: `01-app-shell-thread-codex-light-1440x900.png`, `01-app-shell-sidebar-header-light-1440x900.png`, `-sidebar-footer-dark-1440x900.png`, `-sidebar-collapsed-light-1440x900.png`, `-sidebar-max-light-1440x900.png`, `-sidebar-max-panel-open-light-1440x900.png` (F-01-03), `-rightpanel-open-empty-light-1440x900.png`, `-rightpanel-open-light-{1024x640,800x600,390x844,980x700,981x700}.png`, `-rightpanel-tabs-light-1280x720.png`, `-rightpanel-maximized-light-1440x900.png`, `-terminal-open-chat-area-light-{1024x640,800x600}.png`, `-palette-{default,query,empty,actions}-light-1440x900.png`, `-palette-default-dark-1440x900.png`, `-palette-project-rows-light-1440x900.png`, `-settings-modal-light-{1440x900,1024x640,800x600,3440x1440,390x844}.png`, `-usage-modal-light-*.png`, `-breadcrumb-*.png`, `-sidebar-sheet-{light,dark}-390x844.png`, `-sidebar-sheet-then-panel-toggle-light-390x844.png`, `-project-filter-open-{light,dark}-1440x900.png`, `-theme-<id>-<scheme>-1440x900-crop.png`, `-draft-{light,dark}-1440x900.png`, `-zoom{50,125,150,200}-thread-light-*.png`.
