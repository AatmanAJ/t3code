# Audit 06: terminal and panels

Scope: terminal drawer and right-panel terminal, right-panel tab strip, Browser, Device (setup only), Files chrome. Probe thread `mcp:42b06108-42e3-4c0a-88a3-9f36026d53e0` (1 agent turn, now archived). Web at `localhost:5733`, Playwright Chromium on macOS, light and dark, 1440x900, 1024x640, 800x600, 390x844, 720x450@2x, 3440x1440. Screens: `ui-overhaul/screens/06-terminal-and-panels/` (prefix `06-terminal-and-panels-`, omitted below). Terminal prompts were masked with `PROMPT='$ '` before every capture; one set of 6 captures that listed `ls -la` (local username) was deleted and retaken with `ls`. Desktop not run (area 14). No "Agents" right-panel surface exists: subagent rows live in the Thread details card (`chat/ThreadRelationshipsControl.tsx`, section "Lineage"), owned by 05; code-read only. #24865 touches none of the terminal, tab-strip, preview or files chrome files (it changes `--radius` 10 to 8 px, icon stroke, `button.tsx`, `menu.tsx`); every finding is "not addressed" unless stated. Paths below are under `apps/web/src/` unless absolute.

## Findings

### F-06-01 Floating terminal toolbar covers output and is 21 px, icon-only

- Severity: P1
- Surface: all
- Evidence: `components/ThreadTerminalDrawer.tsx:1815-1858` (`absolute right-2 top-2 z-20`, `p-1`, `size-3.25`). Measured 21x21 buttons. `drawer-ansi-light-1440x900.png`, `drawer-unicode-wrap-light-1440x900.png` (first line runs under it). Issue #19536 (accepted).
- Current: four buttons float over the canvas and hide or intercept clicks on the first row at the right edge. A second, different toolbar (22 px, bordered) replaces it once there are 2+ terminals.
- Proposed: one 28 px drawer header row (`flex h-7 items-center border-b border-border/60 px-2`, same recipe as panel sub-headers) holding the terminal list on the left and `Button size="icon-xs" variant="ghost"` (24 px) actions on the right; delete the overlay and the sidebar header. Icons `size-3.5` (`Columns2`, `Rows2`, `Plus`, `X`). Same header in panel mode.
- DNA: DNA-I2, DNA-SP1 (`size-3.25`), DNA-D2, DNA-P4, DNA-S6
- Effort: M
- Risk: PTY rows shrink by 28 px (resize path covered by `surface.test.ts`); `TerminalSplitPanes` layout; no test for the toolbar.
- Upstream-eligible: yes (fix for #19536)
- #24865: not addressed

### F-06-02 Terminal list is a 144 px sidebar with double-height rows; the 6th terminal is below the fold

- Severity: P1
- Surface: all
- Evidence: `ThreadTerminalDrawer.tsx:1893` (`w-36 min-w-36`), `:1341-1350` (group header `h-[22px] text-2xs`, count `text-3xs text-muted-foreground/70`). Measured: 2nd terminal shrinks the canvas 1184 to 1034 px (PTY reflows); each terminal costs 48 px (header "Single 1" plus row); 6 terminals at 280 px: list scrollH 296 vs 255, active "Terminal 6" not visible, no scroll cue. `drawer-six-terminals-light-1440x900.png`, `-800x600.png` (canvas 442 px).
- Current: "Single 1" repeats per terminal; the active terminal is not scrolled into view; width is stolen from the terminal.
- Proposed: replace the sidebar with horizontal tabs in the F-06-01 header using `RightPanelTab` styling (`h-6 rounded-md text-xs`, scroll chevrons). Show a group chip ("Side by side 4") only when a group has more than 1 pane. `scrollIntoView({inline:"nearest"})` on the active tab.
- DNA: DNA-D1, DNA-D6, DNA-T2, DNA-C4, DRIFT-1
- Effort: M
- Risk: persisted group model unchanged (`terminalUiStateStore.ts`); `terminalUiStateStore.test.ts` covers state, not layout.
- Upstream-eligible: no (layout change; needs maintainer buy-in)
- #24865: not addressed

### F-06-03 Drag-selecting text pops "Add to chat / Copy"; Esc and Cmd+C do not dismiss it

- Severity: P1
- Surface: web (desktop uses the native menu)
- Evidence: `ThreadTerminalDrawer.tsx:997` (`observeSelectionActions`), `contextMenuFallback.ts:252,482,291`. Live: menu persisted after Escape and after Cmd+C (Esc is forwarded to the shell; the `document` keydown listener never fires). Items are plain `<button>`s (no `role=menu/menuitem`), `z-[10000]`. `drawer-scrolled-selection-menu-light-1440x900.png`. Issue #16114.
- Current: every selection opens a menu that only a pointer click dismisses; keyboard users cannot reach or close it.
- Proposed: (1) do not auto-open; show it on right-click only (the context menu already has the same items), or after 400 ms idle as a non-modal chip. (2) In `contextMenuFallback.ts` listen for `keydown` in the capture phase and close on any key that is not Tab; give the container `role="menu"`, items `role="menuitem"`, arrow-key roving focus, `aria-disabled` instead of `disabled`. (3) Use layer `--z-popup` 130 (DNA-L7).
- DNA: DNA-L8, DNA-L7, DRIFT-24, non-negotiable 6
- Effort: S
- Risk: shared fallback menu used by thread and tab menus (area 12/16); no tests for the fallback.
- Upstream-eligible: yes
- #24865: not addressed

### F-06-04 ANSI palette is hard-coded and fails contrast; ignores named themes

- Severity: P1
- Surface: all
- Evidence: `ThreadTerminalDrawer.tsx:195-230`; no minimum-contrast logic in `terminal/ghostty/*`. Computed on terminal bg (`#fcfcfc` / `#0a0a0a`): light bright green 2.07, bright yellow 2.05, bright white 2.40, yellow 3.03, cyan 3.29; dark black 1.06 (invisible), bright black 3.45, red 3.85, blue 4.07, magenta 4.31. `drawer-ansi-light-1440x900.png`, `drawer-ansi-dark-1440x900.png`; same palette in Grove (`drawer-ansi-grove-light-1440x900.png`).
- Current: git, test runners and `ls` colours are unreadable in places; themes recolour only bg, fg, cursor, selection.
- Proposed: add `minimumContrast: 4.5` to the renderer (lighten or darken the foreground toward fg until 4.5:1 against the cell background, skipping truecolor and reverse video), and change light palette `#14ce14` to `#0b7a0b`, `#b5ba00` to `#7a7d00`, `#a5a5a5` to `#6e6e6e`; dark `#000000` to `#3a3a3a`. Route through `--terminal-ansi-N` roles later (DNA-C13).
- DNA: DNA-C5, DNA-C1, DRIFT-22
- Effort: M
- Risk: users who tuned programs to the VS Code palette see shifts; `core.test.ts`/`surface.test.ts` do not cover colour.
- Upstream-eligible: yes (palette values only), minimum-contrast needs approval
- #24865: not addressed

### F-06-05 Web advertises browser-reserved chords (Cmd+W, Cmd+N, Cmd+T, Cmd+Shift+T)

- Severity: P1
- Surface: web
- Evidence: `packages/shared/src/keybindings.ts:154,157-160`; tooltips "Close Terminal (⌘W)", "New Terminal (⌘N)" on web (`ThreadTerminalDrawer.tsx:1596-1610`, aria-labels measured); only warning is a Settings icon (`components/settings/KeybindingsSettings.tsx:1249`). Docs say Cmd+W closes the browser tab.
- Current: following the hint closes the whole T3 tab (live terminals, composer drafts) or does nothing.
- Proposed: on `!isElectron` omit reserved-chord hints from tooltips, menus and the launcher, and add additive web defaults `alt+w` (`terminal.close` / `rightPanel.close`), `alt+shift+t` (`view.reopenClosed`), `alt+n` (`terminal.new`). Existing chords keep working on desktop.
- DNA: DNA-P8, DNA-L8, DNA-P3
- Effort: S
- Risk: `keybindings.json` migration for "late defaults" (`apps/server/src/keybindings.ts` is server; UI-only part: hide hints); conflicts with `alt+n`.
- Upstream-eligible: yes (hint suppression); defaults need maintainer approval
- #24865: not addressed

### F-06-06 Terminal and drawer expose almost nothing to assistive tech

- Severity: P1
- Surface: all
- Evidence: `terminal/ghostty/surface.ts:642` (`canvas aria-hidden`, no live region); `<aside data-thread-terminal-drawer>` has no label or landmark name (`ThreadTerminalDrawer.tsx:1799`); toolbar is a bare `div` with 4 buttons; list rows are loose buttons; toolbar labels appear in a `Popover` with `role=dialog` on hover only (`:1179`, measured), none on keyboard focus. Tab and Shift+Tab are sent to the shell; the only exit is Cmd+J (not documented in `docs/user/keyboard-focus.md`).
- Current: a screen reader hears "Terminal input" and nothing else; keyboard users get no label or shortcut hint on focus.
- Proposed: `aria-label="Terminal drawer"` on the aside; `role="toolbar" aria-label="Terminal actions"` on the action group; `role="tablist"` + `role="tab"` on the list (F-06-02); replace the hover Popover with `Tooltip` plus `Kbd` (shows on focus); add a visually hidden `role="log" aria-live="off"` mirror of the last 200 lines exposed via "Read terminal output" in the context menu; add `terminal.blur` bound to `shift+escape` when `terminalFocus` (the Browser page already uses Shift+Escape) and document it.
- DNA: DNA-I4, DNA-L8, non-negotiable 6
- Effort: M
- Risk: new keybinding command touches `packages/contracts/src/keybindings.ts`; live-region cost on flooding output (gate to on-demand).
- Upstream-eligible: no (new command and region)
- #24865: not addressed

### F-06-07 Right-panel tabs are not tabs to assistive tech or the keyboard

- Severity: P1
- Surface: all
- Evidence: `components/RightPanelTabs.tsx:923-935` (chip `div`, `data-active-tab`), `:833-848`, `:758` (PointerSensor only). `ariaSnapshot` of the bar: `button "Close Files"`, `button "Files"`, no tablist, no selected state. Two tab stops per tab, close button first in DOM. No arrow-key navigation, no keyboard reorder.
- Current: active tab is only visible; screen readers cannot tell which surface is selected.
- Proposed: `role="tablist" aria-orientation="horizontal"` on the scroller; chip `role="tab" aria-selected aria-controls`; one tab stop with roving tabindex (Left/Right/Home/End), `Delete` closes, `Alt+Left/Right` reorders (add `KeyboardSensor`); close button `tabIndex={-1}`; content wrapper `role="tabpanel"`.
- DNA: DNA-L8, DNA-I4, non-negotiable 6
- Effort: M
- Risk: dnd-kit listeners on the chip; no tests for the strip beyond `surfaceShortcutActionForKey`.
- Upstream-eligible: yes
- #24865: not addressed

### F-06-08 On touch, tapping a tab's icon closes it instantly; the X is never shown

- Severity: P1
- Surface: web at phone/tablet width
- Evidence: `components/ui/panel-tab-close-button.tsx:21-28` (X shown only on `group-hover/tab` or `group-focus-visible/close`; button `size-4` = 16 px). Playwright touch tap at the Files tab icon (390x844, `hasTouch`): tab closed, no confirm, X computed `display:none`. `rightpanel-sheet-tabs-light-390x844.png`. Reopen is keyboard-only (F-06-14).
- Current: the 16 px leading icon is a hidden destructive button.
- Proposed: under `pointer-coarse` / `[@media(hover:none)]` keep the surface icon inert and render the X at the end of the chip (`size-6` visual 16 px with `after:min-h-11 after:min-w-11` hit area, as `button.tsx:9`); desktop keeps the swap.
- DNA: DNA-X4, DNA-D4, DNA-P7
- Effort: S
- Risk: chip width +20 px on touch; tab strip overflow logic unchanged.
- Upstream-eligible: yes
- #24865: not addressed

### F-06-09 A file tab with the explorer open leaves the editor 80-284 px wide

- Severity: P1
- Surface: all
- Evidence: `components/files/FilePreviewPanel.tsx:1439` (`w-[min(22rem,46%)] min-w-64`). Measured: panel 540 -> editor ~284 px (code wraps mid-token); 407 px (1024x640) -> 152 px; 335 px sheet (800x600) -> 80 px, text wraps one character per line. `panel-file-open-light-800x600.png`, `-1024x640.png`, `-dark-1440x900.png`.
- Current: the explorer pane always claims 256-352 px; the persisted toggle (`t3code.fileExplorerOpen`, default true) is the only escape.
- Proposed: use a container query on the panel: when `@container` width < 720 px default the explorer closed (keep the "Show file explorer" action); change aside to `w-[min(22rem,40%)] min-w-48`; never let the editor fall under 320 px.
- DNA: DNA-D6, DNA-L5
- Effort: S
- Risk: persisted preference semantics (treat as "user override" only when set); `FilePreviewPanel.test.ts` is logic-only.
- Upstream-eligible: yes
- #24865: not addressed

### F-06-10 When a shell exits, the terminal vanishes without status

- Severity: P2
- Surface: all
- Evidence: `ThreadTerminalDrawer.tsx:564,1283` (writes "[terminal] Process exited", then closes on `setTimeout 0`). Live: `exit` in Terminal 2 removed it within 250 ms; `exit` in the last terminal removed the drawer (state entry deleted). Server snapshot carries `exitCode`.
- Current: crashes and non-zero exits leave no trace, exit code, or restart.
- Proposed: keep the pane after non-zero exit with a muted footer row "Process exited with code N" + `Restart` / `Close` (`Button size="xs"`); auto-close only on code 0 after 600 ms. Restart reuses `terminalEnvironment.open`.
- DNA: DNA-P3, DNA-P7, DNA-V3
- Effort: M
- Risk: session lifecycle in `useThreadTerminalActions`; `shouldHandleTerminalExit` has tests to extend.
- Upstream-eligible: yes
- #24865: not addressed

### F-06-11 Closing a terminal always asks "Confirm", claims a process is running, and costs one dialog per terminal

- Severity: P2
- Surface: all
- Evidence: `lib/terminalCloseConfirm.ts:12-34`; alertdialog text "This stops the running process and clears its history." with Cancel/Confirm for an idle prompt. Closing 11 terminals needed 11 dialogs; no "close others/all" in the drawer (tab strip has them). `confirmTerminalClose` already supports many labels but is only called with one.
- Current: false claim when idle; default focus Cancel so Enter does nothing (correct) but Cmd+W twice cannot close.
- Proposed: skip the dialog when the server summary has `hasRunningSubprocess === false`; otherwise title `Close "Terminal 2"?`, body `It is running "sleep". Closing stops it and clears its history.`, button `Close terminal` (overlaps F-12 `confirmLabel`). Add "Close others / Close all" to the terminal row context menu using the multi-label path.
- DNA: DNA-P3, DNA-V2, DRIFT-13
- Effort: S
- Risk: depends on live subprocess flag (not observed updating, see Needs deeper look).
- Upstream-eligible: yes
- #24865: not addressed

### F-06-12 "Starting" is a blank box; init failure is raw unstyled text with no retry

- Severity: P2
- Surface: all
- Evidence: with `ghostty-vt.wasm` delayed 5 s the drawer shows an empty 280 px pane (plus a blue `outline` on the focused mount div) for the whole wait; with the request aborted: `Failed to fetch. Close and reopen the terminal to retry.` at 0 padding in body font (`ThreadTerminalDrawer.tsx:1055`, `mount.textContent`). `drawer-...` frames were temp only; code is the proof.
- Current: lying silence, then a dead end ("close" deletes the session).
- Proposed: after 400 ms render `<p class="text-xs text-muted-foreground">Starting terminal…</p>` centred (no spinner; DNA-M2); on failure render an `Empty` (compact) with title "Could not start the terminal", the real message, and `Button size="xs"` "Try again" that remounts `TerminalViewport` without closing the session; add `outline-none` to the mount.
- DNA: DNA-P3, DNA-V3, DNA-V9, DNA-D6
- Effort: S
- Risk: remount path in `TerminalSessionViewport` effect cleanup.
- Upstream-eligible: yes
- #24865: not addressed

### F-06-13 Tab hit area and focus ring live on a 16 px inner button; focus is lost after closing

- Severity: P2
- Surface: all
- Evidence: `RightPanelTabs.tsx:880-900,932`. Measured chip 24 px high; label button 16 px high; clicks on the chip's 4 px top/bottom or 8 px right padding do nothing despite `cursor-pointer`. Focus ring is the global 1 px 50% outline around the text only (`tabstrip-focus-1/2-light-1440x900.png`, dark variants). After Enter on "Close Files" `document.activeElement` is `BODY`.
- Current: small targets, inconsistent ring (Button uses 2 px ring), keyboard focus dropped.
- Proposed: make the label button `absolute inset-0` (or `after:absolute after:inset-0`) so the whole chip activates; chip `focus-within:` draws `ring-2 ring-inset ring-ring`; after close move focus to the next tab, else previous, else "Add panel surface".
- DNA: DNA-S3, DNA-D4, DRIFT-17, non-negotiable 6
- Effort: S
- Risk: dnd-kit pointer listeners and double-click rename on device tabs.
- Upstream-eligible: yes
- #24865: not addressed

### F-06-14 No visible way to reopen a closed tab

- Severity: P2
- Surface: all
- Evidence: `view.reopenClosed` is a shortcut and a palette command only (`components/ReopenClosedViewShortcut.tsx:198`, `KeybindingsSettings.logic.ts:370` label "Reopen Closed Tab" is also Title Case). The "+" menu and tab context menu (Close, Close others, Close to the right, Close all) have no entry. Verified: middle-click close then Cmd+Shift+T restores position and activation.
- Current: close without a visible way back (AGENTS.md reverse-state rule); on web the chord is browser-reserved (F-06-05).
- Proposed: add a last item to the "+" menu and the tab context menu: "Reopen closed tab" with `MenuShortcut` (disabled when `useClosedViewStore` is empty); sentence-case the command label.
- DNA: DNA-P7, DNA-V1, DNA-V8
- Effort: XS
- Risk: closed-view history is per device; menu state subscribes to `closedViewStore`.
- Upstream-eligible: yes
- #24865: not addressed

### F-06-15 Drawer resize handle has no hover, focus, keyboard or reset

- Severity: P2
- Surface: all
- Evidence: `ThreadTerminalDrawer.tsx:1769,1805` (`h-1.5 cursor-row-resize`, no background classes, no role/tabIndex). Measured 6 px strip; double-click leaves height unchanged; the panel handle has `group-hover:bg-border group-active:bg-primary/60` (`preview/RightPanelResizeHandle.tsx:17`). Range 180-675 verified; PTY rows follow (15 to 24 rows, `stty size`); height persists per thread. F-01-09 covers the other two handles.
- Proposed: reuse the panel handle recipe (hover `bg-border`, active `bg-primary/60`), `role="separator" aria-orientation="horizontal" tabIndex={0} aria-valuenow/min/max`, Up/Down 16 px (Shift 64), Home/End, double-click resets to 280.
- DNA: DNA-L8, DNA-K13 (limits unchanged), DNA-S3
- Effort: S
- Risk: handle sits over the first terminal row (z-20); no handle tests.
- Upstream-eligible: no
- #24865: not addressed

### F-06-16 Terminal scrollbar is nearly invisible, ignores its theme roles, and there is no "latest output" cue

- Severity: P2
- Surface: all
- Evidence: `surface.ts:653-665` uses `--app-scrollbar-thumb` (`index.css:95,145`): 4x18 px thumb, 1.38:1 light, 1.16:1 dark. `--app-theme-terminal-scrollbar(-hover)` are written (`themePalette.ts:1428-1429`) but nothing reads them (answers MAP "unverified"). With 2,000 lines scrolled up, nothing signals unseen output; "Jump to latest" is context-menu only. `drawer-scrolled-selection-menu-light-1440x900.png`.
- Proposed: map `--terminal-scrollbar: var(--app-theme-terminal-scrollbar, var(--app-scrollbar-thumb))` in `index.css` and use it in `surface.ts`; thumb min 28 px; when scrolled up and new output arrives show a 24 px pill "Jump to latest" bottom-right (`Button size="xs" variant="outline"`, 150 ms fade, none under reduced motion).
- DNA: DNA-C5, DNA-C1, DNA-M1, DNA-M5
- Effort: S
- Risk: `index.css` mapping parity; surface tests assert scroll maths, not colours.
- Upstream-eligible: yes
- #24865: not addressed

### F-06-17 Browser refresh button is labelled "Stop" while loading but reloads

- Severity: P2
- Surface: all
- Evidence: `preview/PreviewChromeRow.tsx:148` (`aria-label={loading ? "Stop" : "Refresh"}`, tooltip "Loading…"), `PreviewView.tsx:305-308` (`handleRefresh` only reloads).
- Current: a lying label; there is no stop.
- Proposed: either implement stop (`serverSurfaceRef.stop()` / `previewBridge.stop`, swap icon to `X`) or keep "Refresh" and show the spinner with tooltip "Refreshing…".
- DNA: DNA-P3, DNA-M9
- Effort: S
- Risk: server/desktop bridge may lack stop; then ship the second option.
- Upstream-eligible: yes
- #24865: not addressed

### F-06-18 Address bar swallows invalid input silently

- Severity: P2
- Surface: all
- Evidence: `PreviewView.tsx:290,302` (`catch {}`). Live: `about:blank` after a failed load left the old URL and showed nothing; no toast, no field state.
- Proposed: on rejection keep the draft, set `aria-invalid` and show a 12 px `text-destructive-foreground` line under the toolbar "Could not open about:blank" (DNA-V3); clear on next edit.
- DNA: DNA-V3, DNA-V4, DNA-P3
- Effort: XS
- Risk: error text from `resolveAddressBarInput`; `PreviewView.browser.test.tsx` covers navigation.
- Upstream-eligible: yes
- #24865: not addressed

### F-06-19 Floating preview hides all controls behind a 12 px dot

- Severity: P2
- Surface: all
- Evidence: `preview/ThreadPreviewMiniPlayer.tsx:487-498` (handle `size-3`, actions `opacity-0` until hover/focus-within; layers `z-[47]`/`z-[49]`). Controls measured 24 px: "Open preview in right panel", "Pop preview into separate window", "Close floating preview" (aria-label differs from tooltip text "Open in right panel"). Not persisted across reload (`previewMiniPlayerStore.ts` has no `persist`; tab returns to the panel). `browser-mini-player-light-1440x900.png`.
- Proposed: always show a 24 px title strip (host or page title + the three actions) above the frame; align aria-labels with tooltips; tokenise z-index.
- DNA: DNA-X4, DNA-L7, DNA-I4, DRIFT-24
- Effort: S
- Risk: `previewMiniPlayerLayout.test.ts` encodes frame geometry.
- Upstream-eligible: no
- #24865: not addressed

### F-06-20 Sessions started elsewhere reappear in a fresh client with no cue

- Severity: P2
- Surface: all
- Evidence: Wave-1 lead (a) confirmed. Fresh context: Meta+J on the probe thread attached to `term-1` with full scrollback and the shell's changed prompt; a panel-tab terminal from another context re-homed into the drawer as "Terminal 7"; server browser tabs reappear as panel tabs (3 stray "Browser" tabs on a seed thread). The closed drawer shows no count or dot (`ChatHeader` toggle), and a browser tab floated in one client vanishes from the panel in the next until reload.
- Proposed: badge the drawer toggle with the live session count (`text-2xs tabular-nums`, hidden at 0), and show a one-line note "Attached to a running session" for the first 3 s after attach (muted, `role=status`). Docs: add a line to `docs/user/terminal.md`.
- DNA: DNA-P3, DNA-P9, DNA-ID3
- Effort: S
- Risk: session list comes from `useKnownTerminalSessions`; panel-tab ownership rules in `PersistentThreadTerminals.tsx:112-118`.
- Upstream-eligible: no
- #24865: not addressed

### F-06-21 Terminal action labels are Title Case, inconsistent with the list, and use a Popover as tooltip

- Severity: P2
- Surface: all
- Evidence: `ThreadTerminalDrawer.tsx:1596-1610` ("Split Terminal Horizontally", "Split Terminal Vertically", "New Terminal", "Close Terminal"), list labels "Side by side" / "Stacked" / "Single" (`:1329`); `Trash2` icon for close; split buttons at the 4-pane limit are dimmed with `aria-disabled=false` (measured).
- Proposed: "Split right", "Split down", "New terminal", "Close terminal"; icon `X`; set `disabled` (not just opacity) at the limit with tooltip "Up to 4 panes"; use `Tooltip` with `Kbd` (see F-06-06). Shared strings in `ThreadTerminalDrawer.tsx` and `chat/useChatTerminalActions.ts`.
- DNA: DNA-V1, DNA-V7, DNA-I1, DRIFT-11
- Effort: XS
- Risk: string assertions in `ThreadTerminalDrawer` browser tests if any (none found).
- Upstream-eligible: yes
- #24865: not addressed

### F-06-22 Panel sub-header recipe is copied five times with different heights

- Severity: P3
- Surface: all
- Evidence: `files/fileSurfaceChrome.tsx:9` (28 px + `mb-3`), `files/FileBrowserPanel.tsx:497` (36 px + `mb-1`), `preview/PreviewChromeRow.tsx:104`, `DiffPanelShell.tsx:40`, `diffs/DiffFileTree.tsx:184`; `.surface-subheader` (`index.css:921`) is unused. Measured: Files tree 36, Diff 28, Browser 28.
- Proposed: one `PanelSubheader` component (or use `.surface-subheader`) with the 28 px + 12 px inline rule; Files tree adopts 28.
- DNA: DNA-P6, DNA-D3, DRIFT-16
- Effort: S
- Risk: pure refactor; visual diffs only.
- Upstream-eligible: no
- #24865: not addressed

## Edge-case results (matrix)

- Wave-1 lead (a): CONFIRMED (F-06-20). Lead (b): REFUTED as a defect. "Close Terminal 2" opens an alertdialog (`Close terminal "Terminal 2"?`, Cancel/Confirm); clicking Confirm removes it, state persists (fresh context shows one terminal). Wave-1 likely never confirmed; the confirm itself is F-06-11. Lead (c): REFUTED as a panel bug. With the Claude seed thread at the end (gap 0), opening the empty panel, Files tab, a file chip, or the terminal drawer kept gap 0; the earlier jump was Playwright scrolling an old chip into view. The 156 px short initial position is area 03's.
- Data: empty PASS (launcher, empty Browser, no-session drawer by code); one item PASS; 100+ items: 11 terminals FAIL F-06-02; 10,000+: Files tree on project `server` PASS (14 DOM nodes, virtualised, expand-all 150 ms); long names PASS by code (`truncate`, tooltip); unicode, emoji, CJK, box drawing PASS (`drawer-unicode-wrap-light-1440x900.png`); RTL Arabic renders shaped, not reordered (terminal norm); whitespace-only N/A.
- Content: 2,000-line `seq` PASS; 260-char single line wraps PASS; ANSI 16/256/truecolor FAIL F-06-04; links hover underline PASS; unterminated escape sequences NOT TESTED.
- Network: provider/auth N/A; relay disconnect, server restart, sleep NOT TESTED (cannot restart the shared dev server).
- Git: N/A.
- Viewport: 1440x900 PASS; 1024x640 and 800x600 drawer keeps 96-136 px of chat (F-01-12) and file tab FAIL F-06-09; 3440x1440 PASS (`drawer-and-panel-light-3440x1440.png`); 390x844 sheet strip crowded (3 layout toggles + 2 chevrons leave ~150 px; "+" clipped, `rightpanel-sheet-tabs-light-390x844.png`); 200% zoom (720x450@2x): drawer 226 px, chat 0 px; OS zoom 80/125/150 NOT TESTED.
- Preferences: light and dark PASS; named themes Grove, Iris checked (palette unchanged, F-06-04); reduced motion: cursor blink honours it (`surface.ts:120-126`), panels instant by default PASS; keyboard only FAIL F-06-03, -06, -07; screen reader NOT TESTED (ARIA tree inspected only).
- Lifecycle: first launch, update, corrupted settings N/A; first-keystroke loss seen twice was my own Esc/Tab sent to zsh (8 plus 6 clean trials), not a defect.

## Already good (do not touch)

- Launcher "Open a surface" with single-letter hints, arrow keys, disabled reasons; add menu; panel instant open/close (DNA-K4).
- Terminal: PTY resize follows drawer (15 to 24 rows), per-thread persisted height, 180-675 clamp, session persistence, hollow cursor in unfocused panes, link hover underline, box drawing and emoji, `keyboard-focus.md` composer-keeps-focus rule (verified with 3.5 s delayed WASM).
- Tab strip: drag reorder, middle-click close, Cmd+Shift+T restore at original index, Cmd+W close, scroll chevrons and fade, device rename.
- Device setup dialog: 3-step wizard, Esc returns focus to "Add panel surface".

## Incomplete

- Desktop (Electron webview, pick element, annotations, recording, audio mute) not run; web server-browser lacks annotate/screenshot (`PreviewView.tsx:917,927` gates on `previewBridge`), undisclosed.
- Device panel beyond setup not exercised: enabling the hub installs host tooling. Agents surface: none exists (see header).
- #16901 (two browser pages), automation stalls (#23936, #24812, #24514), #21525 (Option key on macOS layouts), #8361 clipboard on Windows need agent turns or real hardware.
- Bell: no BEL handling in `terminal/ghostty/*` (code-read, `printf '\a'` not visibly tested).
- Screens reuse: coordinator asked to avoid new captures; baseline set not re-mined.

## Needs deeper look

- Terminal process indicator: `sleep 40/45` in the drawer showed no teal sidebar dot (`ThreadStatusIndicators.tsx:704-716`) and the row label stayed "Terminal 1" although `Manager.ts:342` should label by child command; check `hasRunningSubprocess` delivery to the web client.
- Closed browser tabs on a seed thread reappeared once after a close-all (3 closed, 2 back in the next fresh context); not reproduced with 3 fresh tabs on the probe thread.
- Mini-player not restored after reload; `Meta+Alt+B` first-open focus races with composer autofocus (letters typed into the composer when the launcher is not focused).
- Unterminated drawer at 200% zoom leaves 0 px chat; overlaps F-01-12.
