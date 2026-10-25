# Audit 21: keyboard-shortcuts-ux

Method: read `packages/shared/src/keybindings.ts` (82 default rules, 79 command ids, 63 after folding the jump rows; 84 static ids exist, 5 unbound by default), `apps/web/src/keybindings.ts` (matcher and
label rendering), every window `keydown` registrant (about 45 files), `apps/desktop/src/preview/Manager.ts`,
`apps/mobile` key commands. Drove web at `http://localhost:5733` with Playwright against my own probe thread
"a21 keyboard probe" (2 small haiku turns, the second sent by accident while testing the `mod-enter-multiline`
mode). Windows/Linux rendering and AltGr cases were produced by overriding `navigator.platform` and dispatching
synthetic `KeyboardEvent`s with real `code`/`key` pairs (marked "synthetic"). Desktop (Electron) was not driven:
area 14 owns it; items depending on it are "code-read".

Boundary: the Keybindings settings page (rows, recorder, conflict warning, search) is area 08: F-08-20..37 are
referenced, not repeated. Focus rings are area 16 (F-16-15, F-16-16, F-16-21 referenced).
#24865 does not touch shortcuts or hints (diff checked: Sidebar.tsx shelf labels, composer tooltips, a new
composer placeholder "Ask anything. @ files, $ skills, / commands"); every finding below is `not addressed`
unless stated.

Severity count: P0 0, P1 2, P2 11, P3 7 (20 findings).

## 1. Default keymap (from code)

`mod` = Command on macOS, Ctrl elsewhere. Mac label = what `formatShortcutLabel` prints (⌃⌥⇧⌘ order);
Win/Linux label prints `Ctrl+Alt+Shift+Key`. "Hint" = where a user can see the chord today. Rule order matters:
the last matching rule wins, and `shortcutLabelForCommand` shows the last effective rule first
(`apps/web/src/keybindings.ts:120-150,243`), which is why `chat.new` shows ⇧⌘O and not ⌘N.

| Command                                                                                                                  | Mac             | Win/Linux                  | When                                 | Hint in UI                                                    | Palette row                  |
| ------------------------------------------------------------------------------------------------------------------------ | --------------- | -------------------------- | ------------------------------------ | ------------------------------------------------------------- | ---------------------------- |
| `sidebar.toggle`                                                                                                         | ⌘B              | Ctrl+B                     | always                               | tooltip "Toggle main sidebar (⌘B)"                            | no                           |
| `navigation.back` / `.forward`                                                                                           | ⌘[ / ⌘]         | Ctrl+[ / ]                 | `!terminalFocus`                     | none                                                          | no                           |
| `terminal.toggle`                                                                                                        | ⌘J              | Ctrl+J                     | always                               | header tooltip                                                | no                           |
| `rightPanel.toggle`                                                                                                      | ⌥⌘B             | Ctrl+Alt+B                 | always                               | header tooltip                                                | no                           |
| `threadPanel.toggle`                                                                                                     | ⇧⌘B             | Ctrl+Shift+B               | `!terminalFocus`                     | tooltip only on keyboard focus (F-01-08)                      | no                           |
| `rightPanel.new`                                                                                                         | ⌘T              | Ctrl+T                     | `rightPanelOpen && !terminalFocus`   | menu shortcut                                                 | no                           |
| `terminal.split` / `.splitVertical`                                                                                      | ⌘D / ⇧⌘D        | Ctrl+D / Ctrl+Shift+D      | `terminalFocus`                      | drawer tooltips, baked into aria-label                        | no                           |
| `terminal.new`                                                                                                           | ⌘N              | Ctrl+N                     | `terminalFocus`                      | drawer tooltip "New Terminal (⌘N)"                            | no                           |
| `terminal.close`                                                                                                         | ⌘W              | Ctrl+W                     | `terminalFocus`                      | drawer tooltip "Close Terminal (⌘W)"                          | no                           |
| `rightPanel.close`                                                                                                       | ⌘W              | Ctrl+W                     | `!terminalFocus`                     | none                                                          | no                           |
| `view.reopenClosed`                                                                                                      | ⇧⌘T             | Ctrl+Shift+T               | always                               | none (not in palette or tab menus, F-06)                      | no                           |
| `diff.toggle`                                                                                                            | ⌘D              | Ctrl+D                     | `!terminalFocus`                     | none (F-16-16)                                                | no                           |
| `preview.toggle`                                                                                                         | ⇧⌘J             | Ctrl+Shift+J               | always                               | none                                                          | no                           |
| `preview.refresh`                                                                                                        | ⌘R              | Ctrl+R                     | `previewFocus`                       | none                                                          | no                           |
| `preview.focusUrl`                                                                                                       | ⌘L              | Ctrl+L                     | `previewFocus`                       | none                                                          | no                           |
| `preview.zoomIn` (two rules)                                                                                             | ⌘= and ⌘+       | Ctrl+= and Ctrl++          | `previewFocus`                       | none                                                          | no                           |
| `preview.zoomOut` / `.resetZoom`                                                                                         | ⌘- / ⌘0         | Ctrl+- / Ctrl+0            | `previewFocus`                       | none                                                          | no                           |
| `commandPalette.toggle`                                                                                                  | ⌘K              | Ctrl+K                     | `!terminalFocus`                     | none in the default sidebar (legacy only)                     | n/a                          |
| `filePicker.toggle`                                                                                                      | ⌘P              | Ctrl+P                     | `!terminalFocus`                     | palette row                                                   | "Go to file"                 |
| `projectSearch.toggle`                                                                                                   | ⇧⌘F             | Ctrl+Shift+F               | `!terminalFocus`                     | palette row                                                   | "Search project contents"    |
| `usage.open`                                                                                                             | ⌘U              | Ctrl+U                     | `!terminalFocus`                     | palette row only (F-01-15)                                    | "Open usage"                 |
| `theme.select`                                                                                                           | ⌥⌘A             | Ctrl+Alt+A                 | `!terminalFocus`                     | palette row                                                   | "Change theme"               |
| `appearance.cycle`                                                                                                       | ⌥⇧⌘A            | Ctrl+Alt+Shift+A           | `!terminalFocus`                     | palette row                                                   | "Change appearance"          |
| `themeEditor.toggle`                                                                                                     | ⌥⇧⌘T            | Ctrl+Alt+Shift+T           | always                               | palette row                                                   | "Toggle theme editor"        |
| `composer.stash`                                                                                                         | ⌘S              | Ctrl+S                     | `!terminalFocus`                     | stash menu label                                              | no                           |
| `thread.steerQueuedMessage`                                                                                              | ⇧⌘Enter         | Ctrl+Shift+Enter           | `!terminalFocus`                     | queued-row label                                              | no                           |
| `thread.editQueuedMessage`                                                                                               | ⌥Up             | Alt+Up                     | `composerFocus`                      | queued-row label                                              | no                           |
| `composer.sendAlternate`                                                                                                 | ⌘Enter          | Ctrl+Enter                 | `composerFocus && turnRunning`       | send-button label while running                               | no                           |
| `composer.sendBackground` (2 rules)                                                                                      | ⌘Enter, ⌥⌘Enter | Ctrl+Enter, Ctrl+Alt+Enter | `composerFocus && draftThreadRoute`  | none                                                          | no                           |
| `composer.sendAndNewThread`                                                                                              | ⌥⌘Enter         | Ctrl+Alt+Enter             | `composerFocus && !draftThreadRoute` | none                                                          | no                           |
| `chat.new` (2 rules)                                                                                                     | ⌘N, ⇧⌘O         | Ctrl+N, Ctrl+Shift+O       | `!terminalFocus`                     | tooltip shows ⇧⌘O                                             | no                           |
| `chat.newLocal`                                                                                                          | ⇧⌘N             | Ctrl+Shift+N               | `!terminalFocus`                     | tooltip second line, palette row                              | "New thread in <project>"    |
| `chat.newWithoutProject`                                                                                                 | ⌥⌘N             | Ctrl+Alt+N                 | `!terminalFocus`                     | palette row, draft hero                                       | yes                          |
| `chat.find`                                                                                                              | ⌘F              | Ctrl+F                     | `!terminalFocus && !previewFocus`    | palette row                                                   | "Find in current thread"     |
| `modelPicker.toggle`                                                                                                     | ⇧⌘M             | Ctrl+Shift+M               | `!terminalFocus`                     | trigger tooltip                                               | no                           |
| `composer.host` / `.effort` / `.mode`                                                                                    | ⇧⌘H / ⇧⌘E / ⇧⌘A | Ctrl+Shift+H / E / A       | `!terminalFocus`                     | host tooltip only; effort and mode tooltips omit it (F-04-28) | no                           |
| `composer.workspace` / `.branch` / `.previousWorktree`                                                                   | ⇧⌘X / ⇧⌘G / ⇧⌘L | Ctrl+Shift+X / G / L       | `!terminalFocus`                     | workspace only; branch and previous worktree none             | no                           |
| `pullRequest.copyNumber`                                                                                                 | ⇧⌘K             | Ctrl+Shift+K               | `!terminalFocus`                     | PR actions menu                                               | no                           |
| `modelPicker.previousProvider` / `.nextProvider`                                                                         | ⇧⌘Up / ⇧⌘Down   | Ctrl+Shift+Up / Down       | `modelPickerOpen`                    | none (picker shows no Kbd)                                    | no                           |
| `editor.openFavorite`                                                                                                    | ⌘O              | Ctrl+O                     | always                               | Open-in tooltip                                               | no                           |
| `thread.previous` / `.next`                                                                                              | ⇧⌘[ / ⇧⌘]       | Ctrl+Shift+[ / ]           | always                               | none                                                          | no                           |
| `thread.copyReference`                                                                                                   | ⇧⌘C             | Ctrl+Shift+C               | `!terminalFocus`                     | palette row, PR menu                                          | "Copy thread ID"             |
| `thread.settle` / `thread.pin`                                                                                           | ⇧⌘S / ⇧⌘P       | Ctrl+Shift+S / P           | `!terminalFocus`                     | none (F-02-22)                                                | no                           |
| `thread.undo`                                                                                                            | ⌘Z              | Ctrl+Z                     | `!terminalFocus && !editableFocus`   | undo notice                                                   | no                           |
| `thread.jump.1..9`                                                                                                       | ⌘1..9           | Ctrl+1..9                  | `!modelPickerOpen && isDesktop`      | hold-modifier hints on sidebar rows (desktop only)            | numbered rows (desktop only) |
| `modelPicker.jump.1..9`                                                                                                  | ⌘1..9           | Ctrl+1..9                  | `modelPickerOpen && isDesktop`       | model rows (desktop only)                                     | n/a                          |
| `usage.cost` / `.tokens` / `.limits`                                                                                     | C / T / L       | C / T / L                  | `usagePageOpen`                      | native `title` "Cost (C)"                                     | n/a                          |
| `usage.period.day/week/month/quarter`                                                                                    | ⇧⌘1 / 2 / 3 / 4 | Ctrl+Shift+1..4            | `usagePageOpen`                      | native `title`                                                | n/a                          |
| `thread.stop`, `composer.cycleHost`, `composer.increase/decreaseEffort`, `rightPanel.toggleMaximized`, `script.<id>.run` | none            | none                       | n/a                                  | Keybindings page only (no row until bound, F-08-25)           | no                           |

Fixed (not in the keymap, not rebindable, absent from the Keybindings page): right-panel launcher letters
B T F D P L M (`RightPanelTabs.tsx:243-256`), Escape and Tab behaviours, `mod+f` inside a diff (documented),
Electron menu accelerators `Cmd/Ctrl+,`, `Cmd/Ctrl+R`, `Shift+Cmd/Ctrl+R`, `Cmd/Ctrl+0/=/-`, `Cmd/Ctrl+Shift+V`,
`Alt+Cmd+I` (`DesktopApplicationMenu.ts:174-284`), and the quit hold (`Cmd/Ctrl+Q`).
Internal scope conflicts: none unresolved. Same-chord pairs are separated by `when`
(`mod+d`, `mod+n`, `mod+w`, `mod+enter`, `mod+alt+enter`, `mod+1..9`). One runtime remap collides:
in send mode `mod-enter` the matcher moves `composer.sendAlternate` to `⇧⌘Enter`
(`apps/web/src/keybindings.ts:108-125`), the same chord as `thread.steerQueuedMessage`; the global handler runs
first and falls through when no queued message exists (`ChatView.tsx:2720`), so it works but is undocumented.

## 2. Conflict register (default chord against browser, Electron, OS)

| Chord (command)                                                                             | Collides with                                                                               | Where                            | Result                                                               | Evidence                                      |
| ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------- | -------------------------------------------------------------------- | --------------------------------------------- |
| ⌘N / Ctrl+N (`terminal.new`, `chat.new` alt)                                                | new browser window                                                                          | web                              | page never receives it                                               | code-read, browser reserved list              |
| ⇧⌘N (`chat.newLocal`)                                                                       | private/incognito window                                                                    | web                              | unreachable; tooltip still prints it                                 | live tooltip, F-21-05                         |
| ⌘T (`rightPanel.new`), ⌘W (`terminal.close`, `rightPanel.close`), ⇧⌘T (`view.reopenClosed`) | new tab, close tab, reopen tab                                                              | web                              | unreachable; docs admit ⌘W and ⇧⌘T                                   | docs/user/keybindings.md "Reserved shortcuts" |
| ⇧⌘3 / ⇧⌘4 (`usage.period.month/quarter`)                                                    | macOS screenshot hotkeys                                                                    | OS (macOS, web and desktop)      | the app never sees them                                              | code-read, F-21-12                            |
| Ctrl+W / D / N / B in terminal                                                              | readline delete-word, EOF, history-next; tmux prefix and back-char                          | desktop and web on Windows/Linux | shell chord replaced by app action                                   | live (Win32 override), F-21-08                |
| Ctrl/⌘ + `+` on DE/Nordic layouts (`navigation.forward` via physical `]`)                   | browser zoom in                                                                             | web, any OS                      | zoom blocked, history goes forward                                   | live synthetic, F-21-10                       |
| ⌘R, ⌘0, ⌘=, ⌘- (`preview.*`, `previewFocus`)                                                | Electron View menu Reload and zoom                                                          | desktop                          | precedence untested (area 14 lead 2)                                 | code-read                                     |
| ⌘, (Settings), ⌘Q, ⌘W while a browser tab holds focus                                       | menu accelerators ignored in guests                                                         | desktop                          | nothing happens (area 14 lead 1)                                     | code-read `Manager.ts:1462-1467`              |
| ⌃⌥ + letter on AltGr layouts (`theme.select`, `chat.newWithoutProject`, `appearance.cycle`) | AltGr typing (Polish ą, ń)                                                                  | Windows                          | skipped by design                                                    | live synthetic, F-21-11                       |
| ⌘D, ⌘P, ⌘S, ⌘U, ⌘O, ⌘F, ⌘J, ⇧⌘J, ⇧⌘B, ⇧⌘C                                                   | bookmark, print, save, view-source, open, find, downloads, devtools, bookmarks bar, inspect | web                              | page may `preventDefault`, so they work; the browser feature is lost | code-read                                     |

## 3. Send-key rule (Enter versus Cmd+Enter), from `composer-logic.ts:59-95`

| Setting               | Enter                                                                     | ⇧Enter  | ⌘/Ctrl+Enter                                                                                                    | Notes                                                                                     |
| --------------------- | ------------------------------------------------------------------------- | ------- | --------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| `enter` (default)     | send; while running = Queue or Steer per Follow-up behavior               | newline | idle: send; running: the opposite follow-up action; new-thread draft: send in background and open a fresh draft | touch keyboards: Enter is a newline                                                       |
| `mod-enter-multiline` | send if the prompt has no newline, else newline                           | newline | send                                                                                                            | single-line prompts send on Enter (it sent my probe line immediately)                     |
| `mod-enter`           | always newline                                                            | newline | send; running: alternate action moves to ⇧⌘Enter                                                                | no on-screen hint that Enter inserts a newline                                            |
| any                   | menu open: Enter picks the item; IME composing and key repeat are ignored |         |                                                                                                                 | `⌥⌘Enter`: new-thread draft = background send, existing thread = send and open new thread |

Live: in all three modes the send button's tooltip is "Submit message", `aria-keyshortcuts` is null, and nothing
in the composer names the active rule.

## 4. Findings

### F-21-01 There is no way inside the app to learn the keymap, and `?` types into the composer

- Severity: P1
- Surface: web | desktop
- Evidence: live (`a21-p15`): with nothing focused, `Shift+/` puts "?" into the composer (type-to-focus, `useChatShortcuts.ts:60-70`). Palette (`a21-p3`): `>shortcut`, `>keyboard`, `>sidebar`, `>terminal` return no rows; `>keybind` finds "Open settings" only through a hidden search term (`CommandPalette.tsx:1596`). No cheat-sheet component exists: the only "keyboard shortcuts" strings in `apps/web/src` are search terms (`settingsSearch.ts:639,786`) and a permission error (`projectScriptEditor.tsx:338`). The Keybindings page is a 82-row, 6,709 px list (F-08-32); `docs/user/keybindings.md` names about two dozen chords (F-08-37 counts 51 command ids undocumented). iPad gets a system Command-hold sheet because every `UIKeyCommand` sets `discoverabilityTitle` (`T3KeyboardCommandsModule.swift:30-70`); web and desktop get nothing.
- Current: a keyboard-first product (DNA-L8) teaches chords only through scattered tooltips and the few palette rows that carry one.
- Proposed: (1) palette action "Keyboard shortcuts" (`action:keyboard-shortcuts`, Lucide `KeyboardIcon`, `searchTerms: ["shortcuts","hotkeys","keys","cheat sheet","keybindings"]`) that navigates to `/settings/keybindings`. (2) New command `shortcuts.help`, default `{ "key": "shift+/", "command": "shortcuts.help", "when": "!editableFocus && !terminalFocus" }`, opening a read-only `Dialog` (z-dialog 50, Esc closes, hidden below 640 px) with about 24 rows in five groups (Navigate, Threads, Composer, Panels, Terminal) built from a const `SHORTCUT_SHEET_COMMANDS` through `shortcutLabelForCommand`, so user rebinds show; each chord in `Kbd`; footer link "All shortcuts" to Settings. The sheet must resolve before type-to-focus in `useChatShortcuts` (move the `shouldTypeToFocusComposer` branch after command resolution for this command only).
- DNA: DNA-L8, DNA-K14, DNA-P8
- Effort: M
- Risk: new id goes into `STATIC_KEYBINDING_COMMANDS` (contracts) and `DEFAULT_KEYBINDINGS` (shared); the server adds new defaults on startup without an apps/server edit. `?` no longer seeds a message from the body (type-to-focus test in `composerFocusRedirect.test.ts`). German layouts print `?` on another key; `shift+/` then does not match and the palette action is the fallback.
- Upstream-eligible: no (new command, needs maintainer approval). Part (1) alone: yes.
- #24865: not addressed (its new placeholder teaches `@ $ /` only)

### F-21-02 The default sidebar dropped the Command Palette hint; no visible control opens it

- Severity: P2
- Surface: web | desktop
- Evidence: `LegacySidebar.tsx:3535-3538` computes `commandPaletteShortcutLabel`; `Sidebar.tsx` never references `commandPalette.toggle`. `SidebarThreadHeader.tsx:75-76` is a thread filter (`placeholder="Search"`, `aria-label="Search threads"`) with no chord. `openCommandPalette()` is called only from add-project and new-thread-in flows (`Sidebar.tsx:939,2703`). Screenshot: `screens/21-keyboard-shortcuts-ux/21-new-thread-tooltip-web-dark-1440x900.png` (sidebar "Search" row has no hint).
- Current: ⌘K, the most powerful entry point (threads, projects, actions), is advertised nowhere in the shell users get by default.
- Proposed: in `SidebarThreadHeader` add a trailing control inside the search field: `<button type="button" aria-label="Open command palette" aria-keyshortcuts="Meta+K" onClick={() => openCommandPalette()}><Kbd>{label}</Kbd></button>`, with `label = shortcutLabelForCommand(keybindings, "commandPalette.toggle")`, shown while the filter is empty, hidden when unbound and under `pointer-coarse`. Kbd is `pointer-events-none`, so the button owns the click.
- DNA: DNA-L8, DNA-L2 (palette is a primary utility), DNA-P8 (entry points)
- Effort: XS
- Risk: field width at the 22rem sidebar minimum; a chip inside a filter input can read as "this field is the palette" (the aria-label disambiguates). No test covers `SidebarThreadHeader`.
- Upstream-eligible: yes (regression against the legacy sidebar)
- #24865: not addressed (its Sidebar.tsx hunks change shelf labels only)

### F-21-03 The palette lists 10 of the 63 bound commands; "sidebar", "terminal", "diff", "settle", "model" find nothing

- Severity: P2
- Surface: web | desktop
- Evidence: live (`a21-p3`): `>sidebar`, `>terminal`, `>diff`, `>settle`, `>pin`, `>model`, `>back`, `>browser` return 0 rows; the empty palette lists New thread (3 forms), Find, Copy thread ID, Link PR, Restart agent, Go to file, Search contents, New/Add project, Change theme/appearance, Toggle theme editor, Open PRs, Open usage, Open settings, Project settings (screenshot `21-palette-empty-query-dark-1440x900.png`). `CommandPalette.logic.ts:177,340` already carries `shortcutCommand` per row, so the chord column exists.
- Current: users cannot find an action by name, and every action they do find teaches its chord, so the other 53 chords stay unlearned.
- Proposed: add rows in `CommandPalette.tsx` (group "View" and "Thread"), each with `shortcutCommand`: Toggle sidebar, Toggle terminal, Toggle right panel, Toggle thread details, Open diff, Toggle browser (desktop only), Reopen closed tab (hidden when `useClosedViewStore` is empty), Settle thread, Pin thread (thread routes only), Change model, Go back, Go forward, Open in editor. Each closes the palette and dispatches the same handler the chord runs (`ChatShortcutCommands`, `useRightPanelActions`), as `dispatchPreviewAction` already does for preview.
- DNA: DNA-L8, DNA-K14, DNA-P8
- Effort: M
- Risk: handlers live in mounted ChatView hooks; rows must be absent off thread routes. `CommandPalette*.test.tsx` count rows.
- Upstream-eligible: no (new palette surface)
- #24865: not addressed

### F-21-04 Shortcut hints render four different ways; tooltips and aria-labels bake the chord into text

- Severity: P2
- Surface: all
- Evidence: (a) parenthesised text in tooltips at 17 sites (`ThreadTerminalDrawer.tsx` 5, `PanelLayoutControls.tsx` 3, `SidebarThreadHeader.tsx` 2, `AppSidebarLayout.tsx:201`); live: "New thread (⇧⌘O)" with "New thread in current project: Shift+click (⇧⌘N)" (`21-new-thread-tooltip-web-dark-1440x900.png`). (b) `CommandShortcut`/`MenuShortcut` plain `tracking-widest` text (`ui/command.tsx:199`, `ui/menu.tsx:288`). (c) `Kbd` chips only in the palette footer, Keybindings page, right-panel launcher (`CommandPaletteContent.tsx:59-83`). (d) native `title="30 days (⇧⌘3)"` on Usage toggles (`UsagePage.tsx:15-22,404-455`). (e) chord inside `aria-label`: "Close Terminal (⌘W)", "New Terminal (⌘N)" (live). DNA-L8 says "shown with Kbd in tooltips and menus".
- Current: the same fact looks different per surface; native `title` needs a ~1 s hover and is unreachable by keyboard; screen readers hear glyphs inside names (F-16-15, F-16-18).
- Proposed: add an optional `shortcut?: string | null` prop to `TooltipPopup` (`ui/tooltip.tsx:119`) that renders `<span>{children}</span><Kbd className="ms-2">{shortcut}</Kbd>`; migrate the 17 sites and the Usage `title`s to `Tooltip`; move chords out of `aria-label` into `aria-keyshortcuts` through one `ariaKeyShortcuts(shortcut)` helper (`⇧⌘N` to `Meta+Shift+N`); make `CommandShortcut`/`MenuShortcut` render `Kbd`-height text (20 px row, same font-sans/xs). Existing strings keep working for callers that do not pass the prop.
- DNA: DNA-L8, DNA-K14, DNA-I4, DNA-P4 (primitive owns its look)
- Effort: M
- Risk: tests that query tooltip text containing "(⌘J)" (`ChatView.browser.test.tsx`, palette tests); `Kbd` is `select-none` and `pointer-events-none`, fine in tooltips.
- Upstream-eligible: yes (mechanical, behind one primitive prop)
- #24865: not addressed

### F-21-05 Web shows and binds chords that browsers swallow (⌘N, ⌘W, ⌘T, ⇧⌘T, ⇧⌘N)

- Severity: P2
- Surface: web
- Evidence: live tooltips on web: "New Terminal (⌘N)", "Close Terminal (⌘W)" (drawer), sidebar "New thread in current project … (⇧⌘N)", palette row "New thread in sample-app ⇧⌘N" (`21-palette-empty-query-dark-1440x900.png`). Defaults: `packages/shared/src/keybindings.ts:154,157-160,197`. Chrome, Edge, Firefox and Safari reserve ⌘N, ⇧⌘N, ⌘T, ⇧⌘T, ⌘W for the window, so the page never gets them (cannot be reproduced in Playwright, which injects through CDP; reserved-key behaviour is code-read plus vendor documentation). The only warning is a 14 px triangle with a tooltip in the Keybindings header: "The browser may claim some shortcuts first" (`KeybindingsSettings.tsx:1249-1264`, F-08-29), naming none. Docs admit only ⌘W and ⇧⌘T (`docs/user/keybindings.md` "Reserved shortcuts").
- Current: five advertised chords silently do nothing in a browser tab (and `Ctrl+W` closes the T3 browser tab instead of a panel tab or terminal); desktop is unaffected.
- Proposed: (1) `BROWSER_RESERVED_CHORDS = ["mod+n","mod+shift+n","mod+t","mod+shift+t","mod+w","mod+shift+w"]` in `apps/web/src/keybindings.ts`; in `shortcutLabelForCommand` when `isWeb`, skip a reserved chord if another effective chord exists, otherwise return null so no hint lies. (2) Additive web-only defaults (distinct from every existing rule): `terminal.new` `mod+alt+n` when `terminalFocus && isWeb`; `terminal.close` and `rightPanel.close` `mod+alt+w` with `terminalFocus && isWeb` and `!terminalFocus && isWeb`; `chat.newLocal` `mod+alt+o`; `view.reopenClosed` `mod+alt+z`. They sort last, so web labels show them; desktop and existing rules are untouched. (3) In the Keybindings rows (area 08) tag reserved chords "Browser may intercept" using the same constant.
- DNA: DNA-P3 (labels must reflect real state), DNA-L8, DNA-P9
- Effort: M
- Risk: `packages/shared/src/keybindings.test.ts` enumerates defaults; the Windows `Ctrl+Alt` family is AltGr on some layouts (F-21-11); `mod+alt+w` on macOS Chrome is unbound but unverified here.
- Upstream-eligible: no (new defaults)
- #24865: not addressed

### F-21-06 Web has no thread jumps or hold-modifier hints, and the docs describe them in an unscoped "iPad" section

- Severity: P2
- Surface: web
- Evidence: live (`a21-p4`): `Meta+2` and `Ctrl+2` change nothing; holding Meta shows 0 `kbd` hints in the sidebar. Cause: all 18 jump rules carry `isDesktop` (`packages/shared/src/keybindings.ts:217-226`) so browser tab switching stays free, and `shouldShowThreadJumpHintsForModifiers` finds no effective chord (`apps/web/src/keybindings.ts:275-292`). `thread.previous/next` work (`Meta+Shift+]` navigated) but have no hint anywhere. `docs/user/keybindings.md` "## iPad" says ⌘1..9 and ⌘K work with no platform scope, between web sections; they are native `UIKeyCommand`s (`T3KeyboardCommandsModule.swift:60-70`), not iPad Safari.
- Current: the fastest navigation in the app is desktop-only, undiscoverable on web, and the docs imply otherwise.
- Proposed: additive web defaults `thread.jump.N` = `mod+alt+N` (N 1-9) with `when: "!modelPickerOpen && isWeb"`, and `modelPicker.jump.N` likewise with `modelPickerOpen && isWeb`. `Alt+digit` is claimed by Linux Chrome/Firefox tab switching, so this uses Ctrl/Cmd+Alt, which Chrome, Edge and Firefox do not bind (Safari's sidebar chords on Cmd+Option+digit are page-overridable; verify). Hold-hints and palette numbers then work with no further code. Retitle the docs section "iPad app (hardware keyboard)".
- DNA: DNA-L8, DNA-P8, DNA-X2 (same token, same meaning, across surfaces)
- Effort: S
- Risk: Windows `Ctrl+Alt+7/8/9` is AltGr+7/8/9 on German layouts and is skipped (typing wins); `defaults` test enumerates jump rules.
- Upstream-eligible: no (new defaults)
- #24865: not addressed

### F-21-07 Thread previous/next and jumps do nothing below 768 px (sidebar sheet closed)

- Severity: P2
- Surface: web (narrow windows, tablets)
- Evidence: live (`a21-p25`): `Meta+Shift+]` navigates at 1440x900 and does nothing at 700x800 and 390x844. The handler is a `useEffect` inside `Sidebar` (`Sidebar.tsx:2624-2662`), which is unmounted when the mobile sheet is closed. Same family as #21789 (⌘1..9 dead in narrow windows) and F-01-29.
- Current: a chord that works at one window width silently dies at another, with no error.
- Proposed: move the `thread.previous/next/jump` branch into `ChatRouteGlobalShortcuts` (`routes/_chat.tsx:37`), which is always mounted, fed by the same `orderedThreadKeys` selector exported from the sidebar list module (pure function, no DOM); keep `event.defaultPrevented`, `isCommandPaletteOpen` and `isModelPickerOpen` guards.
- DNA: DNA-P8, DNA-P3
- Effort: S
- Risk: `orderedThreadKeys` is built inside `Sidebar` today (filters, shelves, collapsed groups); extract it first or the order will differ. Browser tests: `Sidebar.browser.test.tsx` jump cases.
- Upstream-eligible: yes (#21789 is a filed bug)
- #24865: not addressed

### F-21-08 On Windows and Linux the terminal loses Ctrl+W, Ctrl+D, Ctrl+N and Ctrl+B

- Severity: P1
- Surface: desktop | web (Windows, Linux)
- Evidence: live with `navigator.platform` forced to `Win32` (`a21-p6`, `a21-p27`), focus in "Terminal input": `Ctrl+W` opens "Close terminal "Terminal 1"? This stops the running process and clears its history."; `Ctrl+D` splits (1 pane to 2); `Ctrl+N` opens a new terminal; `Ctrl+B` toggles the sidebar and never reaches the shell. Code: `terminal.close/split/new` are `mod+w/d/n` with `when: terminalFocus` (`packages/shared/src/keybindings.ts:155-158`), `handleBeforeKey` returns false for them so Ghostty never encodes the key (`ThreadTerminalDrawer.tsx:884-899`), and `sidebar.toggle` (`mod+b`) has no `!terminalFocus` and runs in a window capture listener (`AppSidebarLayout.tsx:169`), ahead of the terminal. Mac is unaffected (mod = Cmd). The shell chords replaced are readline delete-word, EOF (exits Python/Node REPLs), history-next, back-char, and the tmux prefix. Docs say "Many defaults include `!terminalFocus` so they do not intercept terminal input" (keybindings.md) but these four are the exceptions.
- Current: a Linux or Windows user presses Ctrl+W to delete a word and gets a destructive confirm; Ctrl+D to leave a REPL and gets a new pane.
- Proposed: keep every rule as is (additive only). (1) Add client setting `terminalShellChords` ("Send Ctrl+W, D, N and B to the shell", default off so nothing changes for anyone today, shown only on Windows/Linux, Settings > Terminal): when on, `handleBeforeKey` returns true for those chords and the window handlers skip them while `terminalFocus`. (2) Additive alternates that never collide with the shell: `terminal.split` `ctrl+alt+d` and `terminal.new` `ctrl+alt+n` and `terminal.close` `ctrl+alt+w`, all `when: terminalFocus && !isMac` (new context key `isMac`, set in `resolveContext` (`apps/web/src/keybindings.ts:56`)). (3) With the setting on, the capture handlers for `sidebar.toggle` and `editor.openFavorite` return early while `terminalFocus`; no default rule changes. First-run default for Windows/Linux installs is an owner decision, so the setting ships off.
- DNA: DNA-P3, DNA-P8, DNA-L8
- Effort: M
- Risk: `isMac` and the setting are new contract fields; the Mac path must stay byte-identical (`keybindings.test.ts`, `ThreadTerminalDrawer` tests); AltGr on Windows treats `Ctrl+Alt` as AltGr (F-21-11), so verify the alternates on a German layout.
- Upstream-eligible: no (changes terminal defaults; maintainer call)
- #24865: not addressed

### F-21-09 There is no "focus terminal" or "focus composer" command, and the terminal traps Esc and Shift+Tab

- Severity: P3
- Surface: web | desktop
- Evidence: live (`a21-p6`, `a21-p24`): inside the terminal `Escape` and `Shift+Tab` leave focus in "Terminal input" (both go to the shell); with the drawer open and focus in the composer, `Meta+J` closes the drawer instead of focusing it. The only keyboard exit is toggling the drawer shut. `STATIC_KEYBINDING_COMMANDS` has no `*.focus` command (`packages/contracts/src/keybindings.ts:59-117`). Tab order from the composer is Model, Effort, Runtime mode, Attach, then the header (live, `a21-p14`); Shift+Tab goes to the last timeline control.
- Current: keyboard-only users cannot move focus between composer, timeline and terminal without hiding or mouse.
- Proposed: add two commands to `STATIC_KEYBINDING_COMMANDS`: `composer.focus` (default `mod+alt+i`, `when: "!composerFocus"`) and `terminal.focus` (default `mod+alt+j`, `when: "terminalOpen && !terminalFocus"`), implemented with `getTerminalFocusOwner` and the composer handle ref. `mod+j` stays a pure toggle; both new rows appear in Keybindings and the shortcut sheet (F-21-01). In the terminal, document that `mod+alt+i` is the way out; do not steal Esc or Shift+Tab from the shell.
- DNA: DNA-L8, DNA-P7
- Effort: S
- Risk: `Ctrl+Alt` AltGr rule on Windows (skipped on AltGr layouts); new ids in contracts.
- Upstream-eligible: no
- #24865: not addressed

### F-21-10 On German and Nordic layouts Ctrl/Cmd + "+" is hijacked as "forward", blocking browser zoom; labels show US key positions

- Severity: P2
- Surface: web | desktop (any OS)
- Evidence: live synthetic (`a21-p13`, key `+`, code `BracketRight`, Meta on MacIntel and Ctrl on Win32): `defaultPrevented = true` and the URL went forward. `resolveEventKeys` accepts both the layout key and the physical key (`shared/keybindings.ts:97-106`), and `EVENT_CODE_SHORTCUT_KEYS` maps `BracketRight` to `]` (`:30-52`), so a `+` typed on the physical `]` key also matches `mod+]` (`navigation.forward`). `Ctrl+-` (code `Slash`) was not hijacked (`defaultPrevented = false`). Positive result: German `Cmd+ü` (code `BracketLeft`) correctly goes back. Labels are US-positional: "⌘[" is printed while a German keycap reads "ü" (`formatShortcutKeyLabel`, `apps/web/src/keybindings.ts:208-217`).
- Current: German, Swedish, Danish and similar users cannot zoom the web app with the standard chord, and the hint for back/forward names a key that does not exist on their keyboard.
- Proposed: in `resolveEventKeys`, when the layout key is one of `+ = - _ 0` return only the layout key (zoom chords stay layout-literal, physical fallback stays for brackets and other punctuation). For labels, use `navigator.keyboard?.getLayoutMap()` (Chromium) in `formatShortcutKeyLabel` to print the character the user's key actually carries for `EVENT_CODE_SHORTCUT_KEYS` entries, falling back to the US glyph.
- DNA: DNA-P3, DNA-L8, DNA-X2
- Effort: S
- Risk: `keybindings.test.ts` physical-fallback cases; an existing user rule on `mod+]` stops matching "+" (intended). `getLayoutMap` is async and absent in Firefox/Safari: fall back silently.
- Upstream-eligible: yes (#15954 is the same family)
- #24865: not addressed

### F-21-11 Right-panel launcher letters ignore non-Latin layouts; three Ctrl+Alt defaults are dead on AltGr layouts

- Severity: P3
- Surface: web | desktop
- Evidence: live synthetic. (a) Launcher open (`Meta+Alt+B`), focus on body: Latin `d` (code `KeyD`) opens Diff; Cyrillic `в` (code `KeyD`) does not and the character lands in the composer (`a21-p18`, `a21-p19`). `surfaceShortcutActionForKey` compares `event.key` only (`RightPanelTabs.tsx:243-256`); open PR #21508 is the same fix. (b) Windows, `Ctrl+Alt+A` with `modifierAltGraph` and key `ą` (Polish): `defaultPrevented = false`, no palette; key `a` opens the theme picker (`a21-p13`); the guard is `matchesKeybindingShortcut` (`shared/keybindings.ts:124-134`) and is correct for typing, but `theme.select` (`mod+alt+a`), `chat.newWithoutProject` (`mod+alt+n`) and `appearance.cycle` (`mod+alt+shift+a`) then have no chord for Polish, Czech or Hungarian users, and nothing says so (see #15954 on AZERTY). Positive: the main keymap is layout-robust: Cyrillic `Cmd+Shift+М` opens the model picker and `Cmd+Л` the palette (`a21-p20`).
- Current: single-letter hints (B T F D P L M) are printed for keys the user may not have; three chords silently vanish on a keyboard family.
- Proposed: launcher: also accept `event.code === "Key" + shortcut` when `event.key` is not ASCII, keeping the printed hint. AltGr: all three have palette rows already ("Change theme", "Change appearance", "New thread without a project"); add a muted second line to their Keybindings rows (area 08) on Windows: "Ctrl+Alt+letter is AltGr on some layouts; rebind or use the palette", driven by the same `isMac`/platform check as F-21-08.
- DNA: DNA-L8, DNA-X2
- Effort: XS (launcher), XS (note)
- Risk: `RightPanelTabs.test.tsx` covers `surfaceShortcutActionForKey`.
- Upstream-eligible: yes (launcher part, #21508)
- #24865: not addressed

### F-21-12 Usage period chords ⇧⌘3 and ⇧⌘4 are macOS screenshot hotkeys, shown only as slow native titles

- Severity: P2
- Surface: web | desktop (macOS)
- Evidence: defaults `usage.period.month` = `mod+shift+3`, `.quarter` = `mod+shift+4` (`shared/keybindings.ts:232-233`). macOS binds ⇧⌘3 (capture screen) and ⇧⌘4 (capture selection) at system level, so the app never sees them (OS-level; not reproducible in Playwright, code-read plus Apple documentation). Hints are native `title` attributes (live, `a21-p23`): "Past 24h (⇧⌘1)", "7 days (⇧⌘2)", "30 days (⇧⌘3)", "90 days (⇧⌘4)"; `UsagePage.tsx:15-22,404-455`. The page already uses bare `c`, `t`, `l` for the metric and guards typing targets (`usageShortcuts.ts:20-37`).
- Current: two of four period chords cannot work on macOS and the page advertises them anyway.
- Proposed: additive bare-key defaults in the same style as `c/t/l`: `{ "key": "1", "command": "usage.period.day", "when": "usagePageOpen" }` and `2`, `3`, `4` for week, month, quarter; they sort last so the hint shows `1..4`; the existing ⇧⌘ rules keep working. Replace the `title` hints with `Tooltip` plus `Kbd` (F-21-04).
- DNA: DNA-L8, DNA-P3
- Effort: XS
- Risk: `usageShortcuts` already skips inputs and popups; add a test that `3` does not fire from the price dialog.
- Upstream-eligible: yes
- #24865: not addressed

### F-21-13 While a desktop browser tab has focus, only four app chords work

- Severity: P2 (potentially P1; needs the desktop run in area 14 lead 1)
- Surface: desktop
- Evidence: code-read. Browser tabs are Electron `<webview>` guests (`HostedBrowserWebview.tsx:319`); a guest's keydown never reaches the host window. `beforeInput` forwards only `forwardedShortcuts` (`preview/Manager.ts:1476-1507`), and the host sets that list to `view.reopenClosed` plus `sidebar.toggle`, `rightPanel.toggle`, `rightPanel.toggleMaximized` (`ReopenClosedViewShortcut.tsx:46-50,197-199`). `syncMenuShortcuts` ignores every menu accelerator in a focused guest except copy, paste, cut, select-all, undo (`Manager.ts:1462-1467`, `isPreviewEditingShortcut` `:466-488`). Result while a page has focus: `mod+k`, `mod+j`, `mod+p`, `mod+shift+f`, `mod+shift+m`, `mod+shift+[ ]`, `mod+l` (`preview.focusUrl`, `previewFocus`), `mod+=/-/0` (`preview.zoom*`), `thread.*` and `mod+n` do nothing. `mod+r` is hard-coded to reload (`isPreviewRefreshShortcut`, `:459-464`) and is not the rebindable `preview.refresh`. By contrast the HTML-render iframe forwards 20 commands including the palette and terminal toggle (`BrowserDocumentFrame.tsx:42-62`), so `mod+k` works inside an HTML render but not inside a browser tab. Open PR #22328 forwards `preview.focusUrl` only. PDF `<embed>` swallows every key with no forwarding (code-read).
- Current: the in-app browser, the surface that most needs ⌘L and ⌘K, is the one place they fail; three embedded surfaces use three different forwarding rules.
- Proposed: one const `EMBEDDED_SURFACE_FORWARDED_COMMANDS` (new `apps/web/src/lib/embeddedShortcutCommands.ts`) shared by `BrowserDocumentFrame` and `ReopenClosedViewShortcut`: the existing 20 plus `preview.focusUrl`, `preview.toggle`, `preview.zoomIn/zoomOut/resetZoom` (browser tabs only), still excluding anything that mutates a thread (the stated rule at `BrowserDocumentFrame.tsx:36-41`); exclude `navigation.back/forward` for guests so page history keeps `mod+[`. Keep `isPreviewRefreshShortcut` but also forward the bound `preview.refresh` chord.
- DNA: DNA-P8, DNA-L8, DNA-P9
- Effort: S
- Risk: forwarded chords are replayed as menu actions (`MENU_ACTION_CHANNEL`), so each command needs a `onMenuAction` case (`ChatView.tsx:2741` today handles two). Desktop only; web is unaffected.
- Upstream-eligible: partly (the `focusUrl` part is #22328)
- #24865: not addressed

### F-21-14 Escape has no single rule: modals drop focus on the body, one page navigates, the right panel ignores it

- Severity: P2
- Surface: all
- Evidence: live (`a21-p3`, `a21-p5`, `a21-p17`). Esc closes the palette, model picker and thread find and returns focus to the composer. Esc closes the Usage modal and focus lands on `body` (`AppRouteModal.tsx:51` `finalFocus={false}`). Esc on `/settings/keybindings` opened by URL closes to a draft route. Esc on `/pull-requests` navigates away: only that page uses `useEscapeToGoBack` (`PullRequestsPage.tsx:141`, `hooks/useNavigateBack.ts:17-38`, it blurs first). Esc clears a multi-thread selection before anything else (`routes/_chat.tsx:87`). Esc does nothing in the right panel (F-16-16), nothing on a running turn (F-04-16), and goes to the shell in the terminal (correct). Enter in the terminal-close confirm cancels because initial focus is Cancel (live, `a21-clean-term`; #18167 reports the same for other confirms), so Enter and Esc agree there.
- Current: the same key means close, back, clear, blur or nothing depending on the surface, and after a modal the next Tab starts from the top of the document.
- Proposed: (1) `AppRouteModal`: `finalFocus` returns focus to the composer when the modal was opened by keyboard from a thread (`composerHandleContext`), else to the opener; (2) Esc inside the right panel with no popup open and no editable target moves focus to the composer without closing the panel; (3) write one "Escape" paragraph in `docs/user/keybindings.md` listing the order: popup, palette/picker/find, selection, modal, page.
- DNA: DNA-P7 (every way in has a way out), DNA-L4, DNA-L8
- Effort: S
- Risk: `finalFocus` was disabled on purpose to avoid a focus ring on the opener (comment at `AppRouteModal.tsx:20-22`); returning to the composer textbox paints no ring on the opener. Browser tests for `AppRouteModal`.
- Upstream-eligible: no (focus behaviour change)
- #24865: not addressed

### F-21-15 Nothing tells the user which key sends, and the Send setting labels are ambiguous

- Severity: P2
- Surface: web | desktop
- Evidence: `SettingsPanels.tsx:782-786`: "Enter", "⌘ + Enter for multiline prompts", "⌘ + Enter always"; the row description reads "Choose when Enter sends a prompt or inserts a new line" (`:1435`). Live (`a21-p11`): the send button's tooltip is "Submit message" in every mode, `aria-keyshortcuts` is null; in `mod-enter` nothing indicates Enter inserts a newline. In `mod-enter-multiline` Enter sends a one-line prompt at once (my probe line was sent that way), which "for multiline prompts" does not convey. Shift+Enter is never mentioned in the setting; docs call the options "mod+Enter" and "Settings → Keyboard" (iPad). Rule table in section 3.
- Current: first-time users learn Enter/Shift+Enter by trial; changing the setting offers no preview.
- Proposed: relabel (sentence case, DNA-V1): "Enter sends, Shift+Enter adds a line" / "Enter sends one-line prompts, ⌘+Enter sends longer ones" / "⌘+Enter sends, Enter adds a line" (platform modifier from `isMacPlatform`). Add `sendKeyLabel(sendShortcut, prompt, platform)` beside `composerRequiresModifier` (`composer-logic.ts:50-58`) and render the send button tooltip as "Send" plus `Kbd` of that label (also `aria-keyshortcuts`). Hidden on touch. No new placeholder text (owner's placeholder stays).
- DNA: DNA-L8, DNA-V2, DNA-V1, DNA-I4
- Effort: S
- Risk: send-button tooltip tests; relabelled options change a persisted-setting display only, not the stored values (`enter`, `mod-enter-multiline`, `mod-enter`).
- Upstream-eligible: yes
- #24865: partial (new placeholder "Ask anything. @ files, $ skills, / commands" teaches triggers, not the send key)

### F-21-16 Chord labels mix glyphs and words and say "Meta" on Windows and Linux

- Severity: P3
- Surface: all
- Evidence: `formatShortcutLabel` (`apps/web/src/keybindings.ts:219-241`) and `formatShortcutKeyLabel` (`:208-217`): macOS prints "⇧⌘Up", "⌘Enter", "⌥Up"; Windows/Linux prints "Meta+K" for a `meta` rule (the key is Win or Super). Palette chords render as unstyled text (`CommandShortcut`), footer keys as chips. F-08-27 covers the separate `KeybindingPill` copy.
- Current: ⌘ glyphs next to the word "Enter" look unfinished.
- Proposed: on macOS print arrows as ↑ ↓ ← →, Enter as ↩, Backspace as ⌫, Tab as ⇥; on Windows print `meta` as "Win", on Linux "Super" (navigator.platform check already in the function). One function, one test table.
- DNA: DNA-L8, DNA-X2
- Effort: XS
- Risk: tests asserting "⇧⌘Up" strings (`keybindings.test.ts`); palette `aria-label` text (F-16-15).
- Upstream-eligible: yes
- #24865: not addressed

### F-21-17 The native keymaps differ from web, are fixed, and are described only in a misplaced docs section

- Severity: P3
- Surface: mobile
- Evidence: iOS `T3KeyboardCommandsModule.swift:30-70` registers ⌘N new task, ⌘F find (focus search), ⌘K palette (iPad) or focus search (iPhone), ⌘[ back (no forward), ⇧⌘F files, ⇧⌘T terminal, ⇧⌘R review, ⇧⌘C copy reference, ⌘\ toggle sidebar, ⇧⌘H cycle host, ⌘1..9 jump (iPad only). Web differs: ⌘B sidebar, ⇧⌘F project search, ⇧⌘T reopen closed tab, ⇧⌘H opens the host picker, ⌘F finds in the thread. Android `T3KeyboardCommandsModule.kt:38-44` handles only Ctrl+Shift+C and Ctrl+Shift+H although the JS provider already handles `newTask`, `commandPalette` and jumps (`HardwareKeyboardCommandProvider.tsx`). These keys are not in the server keybindings, so the Keybindings page cannot show or change them. iPad discoverability is good (Command-hold HUD). Web at phone width needs no chords. Open: #21685 (Android hardware-keyboard send), #14869 (Shift+Enter on iPad Safari). Not tested live: no hardware keyboard on the host (F-15 matrix).
- Current: muscle memory does not transfer between web and iPad; Android keyboard users get two chords.
- Proposed: (1) Android parity: add Ctrl+N, Ctrl+K, Ctrl+1..9, Ctrl+[ to the Kotlin module, emitting the existing event names (JS needs no change). (2) Retitle the docs "iPad" section "Mobile app (hardware keyboard)" and give it a 13-row table (chord, action, iPad, iPhone, Android). (3) Do not rename native chords; list the divergences in the table.
- DNA: DNA-X1, DNA-X2, DNA-P8
- Effort: S
- Risk: Android key capture and TalkBack; `T3KeyboardCommandsModule.kt` has no test.
- Upstream-eligible: yes (#21685 family)
- #24865: not addressed (touches `SettingsThreadsRouteScreen.tsx` only)

### F-21-18 Common thread actions cannot be bound: snooze, archive, rename, approve; stop has no default

- Severity: P3
- Surface: web | desktop
- Evidence: `THREAD_KEYBINDING_COMMANDS` in contracts (`packages/contracts/src/keybindings.ts:37-47`) has stop, steer, edit-queued, previous, next, copy reference, settle, pin, undo, jump. Missing: snooze (discussion #16079, 6 up), archive, rename, approve/decline (F-16-21), and `thread.stop` has no default (F-04-16). The sidebar offers Snooze, Settle, Pin, Archive as peers, but only Settle and Pin have chords (F-02-22).
- Current: the thread lifecycle is half keyboard, half pointer.
- Proposed: add `thread.snooze` (opens the existing snooze picker for the active thread), `thread.archive` (undo already exists through the notice) and `thread.rename` (focuses the title input, `ChatHeader.tsx:263`), all unbound by default so no existing behaviour changes; each gets a palette row (F-21-03) and appears under Keybindings through F-08-25's "bindable without default" rows.
- DNA: DNA-L8, DNA-P7, DNA-P8
- Effort: M
- Risk: contract enum change; server default sync is unaffected.
- Upstream-eligible: no (new commands)
- #24865: not addressed

### F-21-19 Shortcut chords and keyboard footers render on phone-width touch screens

- Severity: P3
- Surface: web at phone width
- Evidence: live (`a21-p26`, `screens/21-keyboard-shortcuts-ux/21-palette-phone-shortcut-hints-dark-390x844.png`): at 390x844 with touch, the palette shows "⇧⌘N", "⌥⌘N", "⌘F", "⇧⌘C" on every row and the footer "Enter Select, Esc Close". Same family as F-01-32 (launcher letters) and F-02-14 (undo notice). The repo's pattern is `pointer-coarse:` plus `[@media(hover:none)]:` (`ThreadRelationshipsControl.tsx:486`).
- Current: hints for a keyboard the device may not have, in a surface that is already cramped (placeholder clipped to "…and thread:").
- Proposed: add `pointer-coarse:hidden [@media(hover:none)]:hidden` to `CommandShortcut`, `MenuShortcut` and `CommandFooter` (primitives, DNA-P4), and have the `TooltipPopup shortcut` prop of F-21-04 render nothing under the same media queries.
- DNA: DNA-X4, DNA-D2, DNA-P4
- Effort: XS
- Risk: iPad Safari with a hardware keyboard also matches `pointer-coarse`; use `(hover: none) and (pointer: coarse)` only, so iPad with a trackpad or keyboard keeps hints.
- Upstream-eligible: yes
- #24865: not addressed

### F-21-20 The model picker's keyboard rules are invisible

- Severity: P3
- Surface: web | desktop
- Evidence: live (`a21-p17`): the picker contains 0 `kbd` elements; ArrowLeft in the empty search moves focus to the provider "Claude", ArrowDown to "Favorites", ArrowRight back to search, Shift+Tab to the provider list, Esc closes and returns focus to the composer. On web `Meta+2` in the picker does nothing (`modelPicker.jump.N` needs `isDesktop`). All of it is documented only in `docs/user/keybindings.md` "model picker". The palette footer already shows the pattern (`CommandPaletteContent.tsx:57-83`).
- Current: the fastest way to change model is a hidden grammar.
- Proposed: add a one-line footer to `ModelPickerContent` using `CommandFooter` and `KbdGroup`: "← Providers", "↑↓ Navigate", "Enter Select", plus the bound provider-switch chord from `shortcutLabelForCommand(keybindings, "modelPicker.nextProvider")`; hidden under `pointer-coarse`. F-04's shift-click row shares the same footer.
- DNA: DNA-L8, DNA-K14, DNA-D6
- Effort: S
- Risk: picker height at 800x600; `ModelPickerContent` tests count children.
- Upstream-eligible: yes
- #24865: not addressed

## 5. Cross-references (already filed elsewhere; not repeated)

| Topic                                                                                                          | Where                                                                      |
| -------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Usage and Settings footer icons carry no chord; no `settings.open` command                                     | F-01-15, F-07-10                                                           |
| Thread details toggle has no pointer tooltip                                                                   | F-01-08 (#11985)                                                           |
| ⌘B is also composer bold, decided by a hard-coded check                                                        | F-01-19 (#17021)                                                           |
| New-thread chords inert while Usage or Settings is open                                                        | F-01-29 (#23425)                                                           |
| Settle and Pin chords not shown on the actions                                                                 | F-02-22                                                                    |
| `thread.stop` has no default; effort and permission tooltips omit chords                                       | F-04-16, F-04-28                                                           |
| Native menu has no thread or panel commands                                                                    | F-14-16; area 14 leads 1 and 2 (menu accelerators versus user keybindings) |
| Keybindings page: raw tokens, no conflict resolution, notice icon, 82 rows, docs coverage                      | F-08-20, -23, -25, -27, -29, -31, -32, -37                                 |
| Diff open by chord leaves focus in the composer; palette combobox lacks `aria-expanded`; approval has no chord | F-16-15, F-16-16, F-16-21                                                  |

## 6. Edge-case results (matrix)

| Row                                                                     | Result                                                                                                                                                      |
| ----------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data: empty, 1, 100+, 10k items; long, unicode, RTL, whitespace names   | N/A for the keymap; the palette lists threads with 100+ fixture threads present (PASS, `a21-p3`; no search timing taken). 10k items NOT TESTED (no fixture) |
| Content: diff, tool output, markdown, tables                            | N/A, except `mod+f` in a diff (documented as non-configurable) NOT TESTED                                                                                   |
| Network/agents: stall, cancel, permission prompt, two threads streaming | NOT TESTED (no running turn driven for chords); `thread.stop`, steer and alternate send were code-read (`ChatView.tsx:2720-2728`)                           |
| Git rows                                                                | N/A                                                                                                                                                         |
| Viewport 1440x900                                                       | PASS for thread.next, find, palette; FAIL F-21-07 below 768                                                                                                 |
| Viewport 1280x720, 1024x640                                             | NOT TESTED (chord logic is width-independent above 768 per code)                                                                                            |
| Viewport 800x600                                                        | NOT TESTED separately (above 768 the sidebar stays mounted, as at 1440); 700x800 FAIL F-21-07                                                               |
| Viewport 3440x1440                                                      | N/A                                                                                                                                                         |
| Mobile 390x844                                                          | FAIL F-21-19 (hints on touch), F-21-07; software keyboard not available in Playwright (NOT TESTED)                                                          |
| OS zoom 80/125/150                                                      | NOT TESTED; browser zoom chord FAIL on DE layouts F-21-10 (synthetic)                                                                                       |
| Browser zoom 50/200                                                     | #5079 (`ctrl+plus/minus` breaks file picker) not reproduced (NOT TESTED)                                                                                    |
| Light, dark, system, themes                                             | PASS: hint contrast not in scope (area 16); screenshots dark only                                                                                           |
| Reduced motion, high contrast                                           | N/A for chords                                                                                                                                              |
| Keyboard only                                                           | FAIL F-21-09 (terminal exit), F-21-14 (focus on body after modal); Tab order from composer recorded (`a21-p14`)                                             |
| Screen reader                                                           | NOT TESTED (no SR on host); #23653 (no announcement on thread switch by chord) not reproduced; F-16-15 covers hint glyphs in names                          |
| Layouts: US, DE, AZERTY, Cyrillic, Polish AltGr                         | PASS main keymap (Cyrillic, DE `ü`); FAIL F-21-10, F-21-11 (all synthetic events)                                                                           |
| Platform labels: macOS, Windows, Linux                                  | PASS rendering (`navigator.platform` override, `a21-p2`); F-21-16 polish                                                                                    |
| Lifecycle: first launch                                                 | FAIL F-21-01, F-21-02 (no onboarding of chords); launch after update, corrupted settings file: NOT TESTED (`keybindings.json` handling is area 08, F-08-34) |
| Desktop (Electron) rows                                                 | NOT TESTED here (area 14 owns the app); F-21-13 is code-read only                                                                                           |

## 7. Already good (do not touch)

- Physical-key fallback in `resolveEventKeys` makes the main keymap layout-robust: Cyrillic `⇧⌘М` and `⌘Л`, German `⌘ü` all resolve (`a21-p12`, `a21-p20`).
- The AltGr guard (`shared/keybindings.ts:124-134`) protects typing: Polish `ą` with `Ctrl+Alt+A` is never swallowed.
- Last-rule-wins plus `effectiveShortcutsForCommand` makes labels follow user rebinds and context (the tooltip shows ⇧⌘O for `chat.new`, not the browser-reserved ⌘N).
- Palette, model picker and thread find all return focus to the composer on Esc; the palette keeps focus while open and has a Kbd footer.
- Type-to-focus sends a first printable key to the composer from the body (`useChatShortcuts.ts:60-70`).
- `shortcutModifierState.ts` resets on blur, paste and dictation, so hold-modifier hints never stick.
- Context teaching exists in two places that should be copied: the undo notice (`thread.undo` chord shown at the moment of use) and the iPad Command-hold sheet.
- The HTML-render forwarding whitelist never includes a command that changes a thread (`BrowserDocumentFrame.tsx:36-41`); keep that rule.
- Terminal-close guarding: repeats are rejected, a confirm names the terminal and what it loses.

## 8. Incomplete

- Electron: not driven (area 14). Not verified: Cmd+Q, Cmd+, and Cmd+W with a browser tab focused; Menu Reload accelerator against `preview.refresh`; the quit hold. F-21-13 and the conflict register rows for Electron are code-read.
- Browser-reserved keys (⌘N, ⌘T, ⌘W, ⇧⌘N, ⇧⌘T) cannot be demonstrated through CDP key injection; the claim rests on the browser vendors' reserved-shortcut behaviour and the repo's own docs.
- OS-level hotkeys (macOS ⇧⌘3/⇧⌘4, GNOME `Ctrl+Alt` combinations) cannot be injected; code-read.
- AltGr, German and Cyrillic results use synthetic `KeyboardEvent`s with real `code` values, not an OS layout.
- No real hardware keyboard on iOS or Android; the native key commands were code-read.
- Screen-reader announcement of chord-driven thread switches (#23653) not tested.
- 10,000-thread palette and 5k-line diff find were not exercised.

## 9. Needs deeper look

1. Desktop, browser tab focused: press Cmd+Q, Cmd+,, Cmd+W, Cmd+K, Cmd+L (physical keyboard) and record which reach the app (F-21-13, area 14 lead 1).
2. Electron menu accelerators against user bindings: bind `mod+r`, `mod+,` or `mod+shift+v` and check precedence on macOS and Windows (area 14 lead 2).
3. Web in Chrome, Firefox and Safari: which of ⇧⌘B, ⇧⌘J, ⇧⌘C, ⇧⌘K, ⇧⌘P, ⌘D, ⌘O, ⌘U are claimed before the page on each (F-21-05 reserved list is conservative).
4. Windows with a real German or Polish layout: confirm F-21-10 zoom hijack and F-21-11 AltGr behaviour, and that `Ctrl+Alt+D/N/W` alternates (F-21-08) are free.
5. First-run default for `terminalShellChords` on Windows and Linux (F-21-08): an owner decision; a short telemetry-free survey of Windows/Linux terminal users would settle it.
6. `mod-enter` send mode while a turn is running: the alternate send moves to ⇧⌘Enter and `thread.steerQueuedMessage` shares it; verify the fall-through with a real queued message (code-read only).
7. PDF preview `<embed>`: confirm it traps all app chords (Chromium PDF viewer is out-of-process); needs a project with a PDF.

## 10. Captures

Saved to `ui-overhaul/screens/21-keyboard-shortcuts-ux/`: `21-palette-empty-query-dark-1440x900.png`, `21-new-thread-tooltip-web-dark-1440x900.png`, `21-palette-phone-shortcut-hints-dark-390x844.png`. Checked for the developer's username, home path, email and account names: none present (palette shows a synthetic fixture path under `/Users/example/`). Withheld: all terminal captures (the shell prompt can show the host username); none were saved.
State restored: probe thread "a21 keyboard probe" (2 haiku turns); terminals opened during tests were closed through Close Terminal and Confirm; no settings, pins, snoozes or keybindings were changed (client settings were set only in throwaway Playwright contexts).
