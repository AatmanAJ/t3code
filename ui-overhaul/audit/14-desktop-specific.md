# Audit 14: desktop-specific (Electron shell)

Repo `pingdotgg/t3code` main @ 5f64c5eb, Electron 44.9.3 dev build ("T3 Code (Dev)") on macOS. Paths are repo-relative. Screenshots are in `ui-overhaul/screens/14-desktop-specific/` (cited as `[shot: name]`, file names are `14-desktop-specific-<name>.png`). Windows and Linux rows are code-read only on this host and say so.

## 0. Scope, method, what I actually used

**Live (real app):** I relaunched the dev desktop app with `T3CODE_DESKTOP_REMOTE_DEBUGGING_PORT=9222` (the env var is read by `apps/desktop/scripts/dev-electron.mjs:52,112-114`, no flag needed), stopped the previous instance by PID (dev-runner `vp run` parent, then the `dev-electron` supervisor, then its orphaned Vite web server and pack watcher, each verified by cwd inside this checkout), and drove the renderer through Playwright `connectOverCDP`. For the main process I sent `SIGUSR1` to my own Electron PID to open the Node inspector on 127.0.0.1:9229 and used it to (a) dump the real native application menu, (b) read and set window bounds and zoom, (c) push `desktop:update-state` and `desktop:quit-shortcut` IPC events into the renderer so updater states and the quit overlay render for real, (d) close the main window and emulate `open-url` / `activate`, and (e) read `nativeTheme` and the window background colour. Fixture data: project `sample-app` (CLI `project add`) and one `claude-haiku-5-5` turn ("Desktop probe").

**What did not work:** OS-level capture. `screencapture -l/-R` returns "could not create image" and `CGWindowListCreateImage` is obsolete on this macOS, so the native frame (traffic lights), the menu bar, native dialogs, Dock badge and OS notifications cannot be captured. Every screenshot is the renderer only. Traffic lights in the "annotated" captures are a **synthetic overlay** (three 14 px circles at the position `DesktopWindow.ts:232-237` sets: x 16, y 19, 20 px pitch); they show geometry, not pixels from the OS.

**Capture caveat:** Playwright applies `prefers-color-scheme: light` emulation to attached pages, while this Mac is in Dark mode (`nativeTheme.shouldUseDarkColors` true, window background `#0A0A0A`). "Light" captures are therefore forced light; dark captures were made through the app's own appearance cycle. Not a product defect.

**Code read:** `apps/desktop/src/{window,app,updates,electron,ipc,permissions,settings}`, `preload.ts`, `mac-permission-preload.ts`, `apps/web/src/components/{QuitHoldOverlay,desktopUpdate.toast,AppRouteModal,AppSidebarLayout}.tsx`, `components/sidebar/{SidebarUpdatePill,SidebarUpdateReleaseNotes,DesktopUpdateStatusIcon,SidebarChrome}.tsx`, `components/desktop/*`, `components/settings/{SettingsPanels,CliCommandSettingsRow,LocalEnvironmentSetting,SnapShotSettings,SnapShotSetupDialog}.tsx`, `components/chat/OpenInPicker.tsx`, `editorLabels.ts`, `contextMenuFallback.ts`, `lib/windowControlsOverlay.ts`, `index.css` titlebar variables, `docs/user/{install,updating,snap-shot,default-browser,keybindings,background-service}.md`, `docs/internals/overview.md`.

**Baseline:** `ui-overhaul/prior-art/OWNER-DIRECTION.md` and `pr-24865.diff` were read. #24865 touches `OpenInPicker.tsx` (panel icon grayscale only), `SettingsPanels.tsx` (three label renames, one new switch), `SettingsSidebarNav.tsx` (icon size), `index.css` (radius, strokes, colours) and `main.tsx` (Inter import). It does not touch any file named in a finding below except where a finding says otherwise. No finding proposes changing the four owner calls that stay.

## 1. Findings summary

| ID      | Sev | Surface                  | Title                                                                                                                | #24865        |
| ------- | --- | ------------------------ | -------------------------------------------------------------------------------------------------------------------- | ------------- |
| F-14-01 | P1  | desktop (Windows, Linux) | Closing the window quits the app and stops the backend with no confirmation (#10161)                                 | not addressed |
| F-14-02 | P1  | desktop (macOS)          | A backend restart re-opens a window the user closed and steals focus (#24101)                                        | not addressed |
| F-14-03 | P1  | desktop                  | No window, splash or error while the backend starts; crash loops are silent                                          | not addressed |
| F-14-04 | P2  | desktop (macOS)          | A link handed to the app while its window is closed does nothing until the window comes back                         | not addressed |
| F-14-05 | P2  | desktop                  | Settings and Usage modal collides with the macOS traffic lights and Windows caption buttons below 1024 px            | not addressed |
| F-14-06 | P2  | desktop (macOS)          | At large app zoom the full-bleed Settings modal puts its search button under the traffic lights                      | not addressed |
| F-14-07 | P2  | desktop                  | Settings > About hides update errors and shows stale labels for downloading, downloaded and failed states            | not addressed |
| F-14-08 | P2  | desktop                  | Switching update track can offer a downgrade without saying so                                                       | not addressed |
| F-14-09 | P2  | desktop                  | The sidebar update affordance is an unlabeled grey icon and never uses the update colour                             | not addressed |
| F-14-10 | P2  | desktop                  | Release notes exist only for the nightly track and only in a hover popover                                           | not addressed |
| F-14-11 | P3  | desktop                  | Release-notes popover title says "Update ready to download" while the button says "Update this app and 1 provider"   | not addressed |
| F-14-12 | P2  | desktop                  | The hold-to-quit overlay shows no progress for the 1.2 s hold                                                        | not addressed |
| F-14-13 | P2  | desktop                  | The hold-to-quit overlay is not announced to screen readers                                                          | not addressed |
| F-14-14 | P3  | desktop                  | The hold-to-quit overlay is off the type, shadow and surface ladders                                                 | not addressed |
| F-14-15 | P3  | desktop                  | "Quit shortcut" row does not name the key, the modes or the menu exception                                           | not addressed |
| F-14-16 | P2  | desktop                  | The native menu has no thread, project, panel or navigation commands                                                 | not addressed |
| F-14-17 | P2  | desktop                  | The Help menu is one duplicated "Check for Updates..." item                                                          | not addressed |
| F-14-18 | P2  | desktop (Windows, Linux) | Menu bar is auto-hidden and the in-app palette has no desktop actions, so update, zoom and reload are undiscoverable | not addressed |
| F-14-19 | P3  | desktop                  | Native menu and update dialog copy break the voice rules ("...", "!", "Please")                                      | not addressed |
| F-14-20 | P2  | desktop                  | Fatal startup and backend error boxes dump stages, stack traces and a 520-character paragraph                        | not addressed |
| F-14-21 | P3  | desktop                  | The native folder picker has no title, prompt or button label                                                        | not addressed |
| F-14-22 | P3  | desktop                  | "Couldn't" and "Let's" strings in desktop-only surfaces                                                              | not addressed |
| F-14-23 | P2  | desktop (Linux)          | SnapShot setup tells GNOME users to run "Take snapshot" from a command palette that has no such command              | not addressed |
| F-14-24 | P3  | desktop                  | SnapShots page repeats "SnapShots" three times and mixes status punctuation                                          | not addressed |
| F-14-25 | P3  | web                      | A desktop-only SnapShots nav item is shown on the web                                                                | not addressed |
| F-14-26 | P2  | desktop                  | Open-in menu never shows which editor is the default and the same click means two things                             | not addressed |
| F-14-27 | P3  | desktop                  | Native context menus carry one icon and no "Open link"; the web fallback carries icons on all                        | not addressed |
| F-14-28 | P3  | desktop (Windows, Linux) | Top bar is 40 px on Windows and Linux against the 52 px DNA-D3 rule                                                  | not addressed |
| F-14-29 | P3  | desktop                  | Native window background and caption symbols ignore named themes                                                     | not addressed |
| F-14-30 | P3  | desktop                  | The native window title is pinned to the app name                                                                    | not addressed |
| F-14-31 | P3  | desktop                  | Confirmed: no tray, Dock menu or jump list                                                                           | not addressed |
| F-14-32 | P3  | desktop                  | A corrupt `desktop-settings.json` silently resets update track, WSL and window state                                 | not addressed |
| F-14-33 | P3  | desktop                  | CLI row shows literal backticks                                                                                      | not addressed |

Counts: P0 0, P1 3, P2 15, P3 15 (33 findings).

## 2. Findings

### F-14-01 Closing the window quits the app and stops the backend with no confirmation (#10161)

- Severity: P1
- Surface: desktop (Windows, Linux; code-read only on this host, macOS behaves differently)
- Evidence: `apps/desktop/src/app/DesktopLifecycle.ts:285-295` (`window-all-closed` calls `app.quit` whenever `platform !== "darwin"`); `apps/desktop/src/window/DesktopWindow.ts:671-673` (the window `close` handler only flushes bounds, it never cancels); the hold-to-quit guard is attached only to the `Q` chord (`DesktopWindow.ts:623-653`, `QuitHold.ts:91-195`). `docs/user/keybindings.md` (digest) says `mod+w` "closes the focused terminal or active right-panel tab, then the window", so the last Ctrl+W, the caption X and Alt+F4 all end in a full quit. `app.quit` runs `handleBeforeQuit` which stops the backend (`DesktopLifecycle.ts:135-182`), so running agent turns and terminals die. Live contrast on macOS: closing the window leaves the app and backend running and `activate` brings the window back. Prior art: issue #10161 (8 reactions, asks for a tray), #22983, #23843.
- Current: On Windows and Linux the Settings > General > Confirmations > Quit shortcut protection covers one key chord. Every other way of closing the last window skips it and stops running work silently.
- Proposed: In `createWindow` (`DesktopWindow.ts:671`) change the handler to `window.on("close", (event) => ...)`: when `environment.platform !== "darwin"`, the app is not already quitting and no confirmation was granted, call `event.preventDefault()` and `webContents.send(CLOSE_REQUESTED_CHANNEL)` (new constant next to `QUIT_SHORTCUT_CHANNEL` in `ipc/channels.ts`). Add `DesktopCloseRequestCoordinator` in `apps/web/src/components/desktop/` (mounted beside `QuitHoldOverlay` at `AppRoot.tsx:31`). It reads the running-thread count from the existing keep-alive state (`state/threads.ts:136`), and when the count is 0 or `confirmQuit === "direct"` it calls a new `desktopBridge.confirmClose()` that does `window.destroy()`; otherwise it opens `requestConfirmDialog` with title "Quit T3 Code?", description "2 threads are still running. They stop when you quit.", destructive button "Quit", cancel "Keep open". If the renderer does not answer within 1500 ms (`Effect.sleep` in the close handler) close anyway. The tray alternative requested in #10161 is larger and needs maintainer approval; this keeps the app a single-window app.
- DNA: DNA-P3 (a confirm that covers one key but not the window lies about its protection), DNA-P7 (every way in has a way out), DNA-P8 (every entry point: key, caption button, menu).
- Effort: M
- Risk: New IPC channel plus contract surface in `packages/contracts/src/ipc.ts`; the update installer and `relaunch` must bypass the prompt (`quit.phase === "allowed"`, `state.quitting`). Covered by `DesktopWindow.test.ts` and `DesktopLifecycle` tests only for window creation and quit phases, not for this path; add a case per platform. Not testable on this host.
- Upstream-eligible: no (behaviour change tied to the open #10161 product discussion, needs maintainer approval of direction)
- #24865: not addressed

### F-14-02 A backend restart re-opens a window the user closed and steals focus (#24101)

- Severity: P1
- Surface: desktop (macOS verified live in the dev app; the same code path runs on every platform)
- Evidence: Reproduced live: I closed the only window through the inspector (`BrowserWindow.close()`, 0 windows left, the app and backend kept running), then sent `SIGTERM` to the backend child of my own Electron process. The backend manager restarted it about 1.1 s later and the log shows `backend exited unexpectedly; restart scheduled` at 14:18:35.635 followed by `backend ready` and `main window created` at 14:18:36.780: a visible window (id 3) appeared on its own. Code: `DesktopWindow.ts:979-983` (`handleBackendReady` calls `createMainIfBackendReady`) and `:866-872` (creates a window whenever none exists), then `bindFirstRevealTrigger` (`:803-815`) reveals it through `ElectronWindow.reveal`, which on macOS calls `Electron.app.focus({ steal: true })` (`apps/desktop/src/electron/ElectronWindow.ts:291`). Prior art: issue #24101 (a server restart reopens a closed window and steals focus).
- Current: A deliberately closed window comes back, in front of whatever app the user is working in, every time the server restarts (crash recovery, "Update server", desktop update, network-access toggle). On macOS that is the normal state (app running, window closed).
- Proposed: In `DesktopWindow.ts` keep a `userClosedMain` flag: set it in the `closed` handler (`:822`) when `desktopState.quitting` is false and `platform === "darwin"`; clear it in `activate` and `revealOrCreateMain`. `handleBackendReady` creates a window only when `!userClosedMain` (first launch and restarts with a window open are unchanged). Separately give `ElectronWindow.reveal` an options argument `{ steal: boolean }` and pass `steal: false` from the backend-ready and web-link paths; keep `steal: true` for explicit user actions (menu, Dock activate, notification click, SnapShot capture).
- DNA: DNA-P3 (UI reflects what the user did), DNA-P7 (closing is a way out; it must stay out).
- Effort: S
- Risk: `DesktopWindow.test.ts` (1084 lines) has window-creation and backend-ready cases to extend; a regression would be "first launch shows no window", so the flag must default to false and only the `closed` handler may set it. Focus-steal itself is not observable on this host.
- Upstream-eligible: yes (focused bug fix for an open issue)
- #24865: not addressed

### F-14-03 No window, splash or error while the backend starts; crash loops are silent

- Severity: P1
- Surface: desktop (macOS, Linux, Windows without WSL-only)
- Evidence: `apps/desktop/src/app/DesktopApp.ts:242-244` shows the connecting splash only when `wslOnly && wslBackendEnabled`; every other launch creates the main window only after `backend ready` (`DesktopWindow.ts:866-872`, `:979-983`). While the backend is starting `activate` (Dock click) is a no-op: `activate` finds no window, `backendReady` is false, no splash, then `createMainIfBackendReady` returns because `waitingForBackend` is true (`DesktopWindow.ts:861-864, 960-976`). Dev timing on an empty database: `bootstrap backend start requested` 14:02:12.350, `backend ready` 14:02:12.992 (0.64 s); the first launch of this session took 37 s from `vp run` to `main window created`. Real databases are slower: #23372 (windowless for 8+ minutes during startup recovery), #23378 (fatal "HTTP 500" after about 10 s), #10517 (backend crash leaves the app blank with no error), #23843 (stays running windowless after the home-unavailable dialog). The only startup dialogs are `showErrorBox` for preflight failures and a held state dir (`DesktopBackendPool.ts:122-175`); a backend that crashes and restarts forever shows nothing.
- Current: After launch the user sees only a bouncing Dock icon. Clicking the icon again does nothing. If startup stalls there is no way to tell "starting" from "dead".
- Proposed: Generalise the splash. In `DesktopApp.bootstrap` (`:241-246`) replace the WSL-only condition with a delayed splash: fork `Effect.sleep(400 millis)` then `desktopWindow.showConnectingSplash` unless a main window exists; the existing `dismissConnectingSplash` already closes it on first reveal (`DesktopWindow.ts:814`). Give `buildConnectingSplashDataUrl` (`:176-183`) a `label` parameter: "Starting T3 Code…" (single U+2026) for the default and the current "Connecting to WSL…" for WSL. After 15 s append a second line "Still starting. Logs are in the T3 home logs folder." and a "Show logs" button wired to `shell.showItemInFolder(environment.logDir)` via the splash's own preload. In `activate`, when the splash exists, `reveal` it (already done at `:969-973`). Also add `prefers-reduced-motion` to the splash CSS (`.spinner{animation:spin .8s linear infinite}` runs forever with no reduced-motion branch, DNA-M5).
- DNA: DNA-P3 (a blank Dock bounce is a lying status), DNA-M5, DNA-P9 (desktop must not assume the server is instant).
- Effort: S for the splash; M with the log button and tests
- Risk: `DesktopWindow.test.ts` mocks the splash; the new timer must be cancelled when the window appears or the user quits (`desktopState.quitting`). The splash is `frame:false`, `-webkit-app-region: drag` and has no close button, so it must never outlive a failed start: keep `handleFatalStartupError` closing it. Not covered by tests for the delayed path.
- Upstream-eligible: yes (reliability fix, small)
- #24865: not addressed

### F-14-04 A link handed to the app while its window is closed does nothing until the window comes back

- Severity: P2
- Surface: desktop (macOS; `open-url` and `open-file` paths)
- Evidence: `apps/desktop/src/app/DesktopClerk.ts:203-221` routes http(s) links and HTML files to `DesktopWebLinks.receive`; `app/DesktopWebLinks.ts:70-77, 31-43` pushes the URL to `pending` and `flush` returns immediately when no renderer is listening, and nothing creates or reveals a window (only the `second-instance` path reveals, `DesktopClerk.ts:222-236`). Reproduced in process: with the window closed I emitted `app.emit("open-url", ..., "https://example.com/t3-probe")` through the inspector; five seconds later `BrowserWindow.getAllWindows()` was still empty. After `app.emit("activate")` the window returned and the queued link opened, maximised, in a browser tab [shot: queued-link-opened-after-reactivate-light-1100x780]. Caveat: I could not drive real Launch Services, which may also send a reopen event; this was verified at the Electron event level only.
- Current: With T3 Code set as the default browser (`docs/user/default-browser.md`) a click in another app can appear to do nothing when T3 Code is running with its window closed, which is the usual macOS state.
- Proposed: In `DesktopWebLinks.receive` (`:70-77`) after queuing, call `DesktopWindow.revealOrCreateMain` (inject `DesktopWindow` into `DesktopWebLinks.make`, or have `DesktopClerk.openWebLink` do it) with `steal: true` since the user just clicked a link elsewhere. Keep the queue so the link opens once the renderer is ready.
- DNA: DNA-P3, DNA-P8 (an entry point must work in every window state).
- Effort: XS
- Risk: A layer cycle between `DesktopWebLinks` and `DesktopWindow` (WebLinks currently depends only on `ElectronWindow`); use `ElectronWindow.reveal` plus `DesktopWindow` lazily. `DesktopWebLinkCoordinator.browser.test.tsx` covers the renderer; the main-process path has no test.
- Upstream-eligible: yes
- #24865: not addressed

### F-14-05 Settings and Usage modal collides with the macOS traffic lights and Windows caption buttons below 1024 px

- Severity: P2
- Surface: desktop (macOS measured; Windows code-read)
- Evidence: `apps/web/src/components/AppRouteModal.tsx:39` pads the viewport `sm:p-6 lg:p-10` (24 px from 640 to 1023 px, 40 px from 1024). Measured in the desktop app at its 840x620 minimum: modal at x 24, y 24 (`getBoundingClientRect`), while the traffic lights occupy x 16-70, y 19-33 (`DesktopWindow.ts:232-237`, `MACOS_WINDOW_BUTTON_RADIUS = 7`). The lights straddle the modal's top edge: a 46x9 px overlap of the first rows of the rounded corner [shot: settings-modal-trafficlights-annotated-light-840x620]. At the default 1100x780 the modal sits at 40,40 and clears them [shot: shell-expanded-trafficlights-annotated-light-1100x780]. Windows/Linux (code-read): `titleBarOverlay.height = 40` (`DesktopWindow.ts:39,244`) puts 138 px of caption buttons over y 0-40 at the right edge; the top 16 px of the modal (y 24 to 40) under the right-hand 138 px, including the first few pixels of its close button (`AppRouteModalClose`, `AppRouteModal.tsx:65-80`, roughly y 35 to 63 by the measured 48 px header), sit under the overlay.
- Current: Any desktop window narrower than 1024 CSS px (the minimum is 840, half-screen tiling is common) draws native window controls on top of the Settings and Usage modal.
- Proposed: Add `@custom-variant electron (&:is(.electron, .electron *));` beside `wco` at `index.css:6` (the `electron` class is already set on `<html>`, `lib/windowControlsOverlay.ts:90-96`). On the viewport at `AppRouteModal.tsx:39` add `electron:sm:pt-(--workspace-topbar-height)`: modal top becomes 52 px on macOS and 40 px on Windows/Linux, clearing both native control sets, using the named inset (DNA-SP4) instead of a new number. At 840x620 the modal loses 28 px of height (572 to 544).
- DNA: DNA-D3 (one top bar height; native controls live in the top strip), DNA-SP4 (use the named insets), DNA-L4.
- Effort: XS
- Risk: Other users of `AppRouteModal` (Usage) change identically. No test renders this under the `electron` class; add a browser test that sets `html.electron` and asserts the popup top is at least `--workspace-topbar-height`.
- Upstream-eligible: yes
- #24865: not addressed (does not touch `AppRouteModal.tsx`)

### F-14-06 At large app zoom the full-bleed Settings modal puts its search button under the traffic lights

- Severity: P2
- Surface: desktop (macOS)
- Evidence: Below 640 CSS px the modal is full-bleed with no padding and `max-sm:pt-safe` (`AppRouteModal.tsx:39,55`; `env(safe-area-inset-top)` is 0 on desktop). I set app zoom to +2 (factor 1.44, what View > Zoom In reaches in four steps) at the 840x620 minimum: viewport 583x430 CSS px, modal `x 0, y 0`, the 56 px nav rail starts at the very top. The native lights are re-positioned by `syncMacosWindowButtons` to x 16 pt, y 30 pt (`DesktopWindow.ts:44-53`, verified `y = round(52*1.44/2 - 7) = 30`) and sit directly on the rail's search button, whose circle shows between the red and yellow dots [shot: settings-fullbleed-zoom144-trafficlights-annotated-light-840x620]. Native buttons swallow the click. The main shell handles the same zoom correctly: `--desktop-window-controls-inset` was 62.5 px (`90 / 1.44`) and the sidebar sheet lays out around the lights [shot: sidebar-sheet-zoom144-trafficlights-annotated-light-840x620].
- Current: Zoom is the desktop app's accessibility knob for larger UI. At 1.44 on the smallest window it hides the Settings search entry point behind native chrome.
- Proposed: In `AppRouteModal.tsx:55` replace `max-sm:pt-safe` with `max-sm:pt-safe electron:max-sm:pt-(--workspace-topbar-height)` (variant from F-14-05). The dimmed top strip stays draggable because the chat header underneath keeps its `drag-region`.
- DNA: DNA-D3, DNA-T4 (the chrome must survive the zoom and font settings), DNA-SP4.
- Effort: XS (same change as F-14-05)
- Risk: Same as F-14-05; the sheet at `max-sm` loses 52 px of height at 430 px tall windows (12 percent). Keyboard `/` still focuses the search.
- Upstream-eligible: yes
- #24865: not addressed

### F-14-07 Settings > About hides update errors and shows stale labels

- Severity: P2
- Surface: desktop
- Evidence: `apps/web/src/components/settings/SettingsPanels.tsx:275-286`. I injected each updater state through `desktop:update-state` and read the About row [shot: settings-about-error-download-row-light-1100x780, settings-about-downloading-row-light-1100x780]: `available` shows "Update available." and "Download" with no version; `downloading (45%)` still says "Current version of the application." with a "Downloading…" button and no percent; `downloaded` says "Update available." with "Install"; `error` with `errorContext: "check"` says "Current version of the application." and "Check for Updates"; `error` with `errorContext: "download"` or `"install"` says "Update available." and "Download"/"Install". The failure text ("Download failed: HTTP 404") appears only in the button's hover tooltip (`getDesktopUpdateButtonTooltip`, `desktopUpdate.logic.ts:108-119`). The same row uses Title Case ("Up to Date", "Check for Updates", `:279,282`) in a sentence-case product. The app-menu "Check for Updates..." raises a modal OS alert for both outcomes (`DesktopApplicationMenu.ts:73-88`), the sidebar says nothing, this row only flips a label: three different feedback paths for one action.
- Current: A failed download looks like a fresh "Update available" and the user cannot see why a retry fails. A running download reads as "Current version".
- Proposed: Derive the row text from state in one function in `desktopUpdate.logic.ts` (`getDesktopUpdateAboutStatus(state)`) and render the error through `SettingsRow`'s existing `status` prop (used by `SnapShotSettings.tsx:393,431,453`; declared at `settingsLayout.tsx:314-327`). Strings: available "Version 0.1.3 is available."; downloading "Downloading 0.1.3, 45%."; downloaded "0.1.3 is ready. Restart to install."; error "Could not download 0.1.3: HTTP 404." (state.message appended, one sentence); idle "Up to date as of 14:30." (`checkedAt`). Button labels sentence case: "Check for updates", "Download", "Install", "Retry download", "Retry install", "Up to date".
- DNA: DNA-P3 (a stale label is named as the failure mode), DNA-V1, DNA-V3 (say what failed, then why), DNA-V5.
- Effort: S
- Risk: `desktopUpdate.logic.test.ts` covers the tooltip and action resolution; add table tests for the new function. The sidebar pill reuses `getDesktopUpdateButtonTooltip`, keep that unchanged.
- Upstream-eligible: yes
- #24865: not addressed (About rows are not in its `SettingsPanels.tsx` hunks)

### F-14-08 Switching update track can offer a downgrade without saying so

- Severity: P2
- Surface: desktop
- Evidence: `apps/desktop/src/updates/DesktopUpdates.ts:1128-1132`: `setChannel` runs `setAllowDowngrade(true)` and `checkForUpdates("channel-change")` immediately, so moving Nightly to Stable (or back) can surface an older build as an update. `applyAutoUpdaterChannel` also allows downgrade permanently on the nightly track (`:459`). The UI side is a bare Select that applies on change with no confirmation (`SettingsPanels.tsx:156-181, 311-345`), described as "Use stable releases or nightly builds. Switch back anytime." and the result shows only "Update available." (F-14-07), then the install confirm says "Install update 0.1.1 and restart T3 Code?" (`desktopUpdate.logic.ts:123-128`) with no mention that 0.1.1 is older than 0.1.2.
- Current: A user flips the track to try Nightly, flips back, and is invited to "update" to an older release without any signal that it is a downgrade.
- Proposed: Compare `availableVersion` with `currentVersion` (semver, nightly suffix aware, helper already implied by `isNightlyDesktopVersion`) in `desktopUpdate.logic.ts`; add `isDowngrade`. Use "Downgrade to 0.1.1" as the button label in About and the pill tooltip, and make `getDesktopUpdateInstallConfirmationMessage` say "Downgrade to 0.1.1 and restart T3 Code? This version is older than the one you are running." with the destructive variant. Add a one-line status under the Update track select while a check runs ("Checking the Stable track…").
- DNA: DNA-P3, DNA-P7 (the way out of Nightly must say what it costs), DNA-V3.
- Effort: S
- Risk: Version comparison must handle `0.1.2-nightly.20261025.101` vs `0.1.2`; covered only by the logic tests you add. Server-side channel semantics are untouched.
- Upstream-eligible: yes
- #24865: not addressed

### F-14-09 The sidebar update affordance is an unlabeled grey icon and never uses the update colour

- Severity: P2
- Surface: desktop
- Evidence: `SidebarUpdatePill.tsx:446-471`: a 32 px circle (`size-8 rounded-full`) whose "update" state is `bg-sidebar-control-surface text-sidebar-foreground`, idle is `text-(--sidebar-icon-color)`. Live with provider updates present it is a grey circled arrow in the far corner of the footer, the only text is the tooltip "Update this app and 1 provider" [shot: update-pill-tooltip-light-1100x780]. `DesktopUpdateStatusIcon.tsx:43-53` marks "available" with a 6 px `bg-current` dot. The tokens `--update`, `--update-foreground`, `--update-surface` are defined (`index.css:232-234, 1147-1149, 1197-1198, 1308-1310`) and are used only for the model-picker "NEW" badge and Clerk (`ModelListRow.tsx:74`, `clerkAppearance.ts:6`), never by the pill or capsule. DNA-C6: update = primary.
- Current: The most consequential desktop prompt (a restart that interrupts running work, or a provider update) is the quietest control in the footer.
- Proposed: In the `showUpdateIconState` branch replace `bg-sidebar-control-surface text-sidebar-foreground` with `bg-update-surface text-update-foreground` (blue 12 percent tint in light, 18 percent in dark, per `index.css:1149,1198`); hover `hover:bg-update/20`. For `available` and `downloaded` render a text capsule instead of a bare circle when the sidebar is at least 208 px: `h-8 gap-1.5 rounded-full px-2.5 text-xs font-medium` with the icon and "Update" or "Restart", the same footprint family as `SidebarUpdateCapsule` (which already exists for a run in progress). Keep the 32 px circle for idle/checking.
- DNA: DNA-C6 (update = primary), DNA-C2 (one chromatic voice: the one blue), DNA-I4 (never icon-only without a name for the primary call to action), DNA-S1.
- Effort: S
- Risk: `--update` falls back to the theme's `update` role (`index.css:1308`), so themes recolour it; verify contrast of `update-foreground` on `update-surface` in the five built-ins (DNA-C5: 4.5:1). Not conflicting with the owner's blue accent call. Tests: `SidebarProviderUpdatePill.browser.test.tsx` covers the provider pill only.
- Upstream-eligible: yes
- #24865: not addressed

### F-14-10 Release notes exist only for the nightly track and only in a hover popover

- Severity: P2
- Surface: desktop
- Evidence: `SidebarUpdatePill.tsx:52-57` shows the notes popover only when `state.channel === "nightly" && releaseNotes.length > 0`; `SidebarUpdateReleaseNotes.tsx:55` returns the plain tooltip otherwise. `handleSidebarUpdateReleaseNotesPopoverOpenChange` cancels `trigger-press` (`:59-64`), so a click cannot pin it open (a click opens the confirm dialog instead) and it closes 150 ms after the pointer leaves (`closeDelay={150}`, `:512`). Main-side notes are computed per channel (`updates/releaseNotes.ts:129-137`) but the renderer discards them on Stable. The stable path is a 5 s toast "Update downloaded" with a "Read more" link (`desktopUpdate.toast.tsx:47-62`, F-12-19) and nothing in Settings > About. Rendered with synthetic notes the popover itself is clean [shot: update-pill-nightly-notes-popover-light-1100x780].
- Current: Most users (Stable) get no in-app "what changed" before restarting into a new version. Nightly users get it only while hovering a 32 px button.
- Proposed: (1) Drop the nightly condition: `shouldUseSidebarUpdateReleaseNotesPopover` returns `showUpdateDetails && state.releaseNotes.length > 0`. (2) Add a "Release notes" text button (`variant="ghost" size="xs"`) to the About Version row that calls `openDesktopUpdateReleaseNotes(bridge, getDesktopUpdateReleaseUrl(currentVersion))`, so the current version's notes are reachable without an update pending. (3) Put the same link in the `UpdateEverythingDialog` body for the app line.
- DNA: DNA-P8 (every entry point), DNA-L8 (keyboard first: a hover-only popover has a Tab-open hack but no click path).
- Effort: S
- Risk: Stable `releaseNotes` may be empty or a single entry; the component already handles `omittedReleaseCount`. Test through the injected-state path used here.
- Upstream-eligible: yes
- #24865: not addressed

### F-14-11 Release-notes popover title contradicts the pill label

- Severity: P3
- Surface: desktop
- Evidence: Live with `runsEverything` true (one provider outdated) the pill's aria-label and tooltip are "Update this app and 1 provider" (`SidebarUpdatePill.tsx:242-250, 447`) while the popover heading is "Update ready to download" (`SidebarUpdateReleaseNotes.tsx:63-70`, keyed on `state.status === "available"`), and clicking opens "Update this app and 1 provider?" [shot: update-pill-nightly-notes-popover-light-1100x780, update-everything-dialog-light-1100x780].
- Current: Three labels for one control; the popover ignores the provider half.
- Proposed: Pass the resolved `tooltip` string as the heading always, and show the status sentence ("Update ready to download") only as the second line when `!runsEverything`.
- DNA: DNA-P3.
- Effort: XS
- Risk: None beyond a snapshot of copy; no test asserts the heading.
- Upstream-eligible: yes
- #24865: not addressed

### F-14-12 The hold-to-quit overlay shows no progress for the 1.2 s hold

- Severity: P2
- Surface: desktop
- Evidence: `QuitHoldOverlay.tsx:5-48` renders a static pill "Hold ⌘Q or press twice to quit" on `down`, keeps it 1200 ms after `up` (`HOLD_HINT_LINGER_MS`, `:5,26`), and has no indication of elapsed time, although the main process knows the hold is armed and times it (`QuitHold.ts:5,134-141,184-188`). Live: sent `desktop:quit-shortcut {state:"down", mode:"hold"}`; the pill (400x64 px) is identical at 0 ms and at 1100 ms [shot: quit-hold-overlay-light-1100x780, quit-hold-overlay-dark-1100x780]. The `double-click` mode shows "Press ⌘Q again to quit" with no 500 ms cue either [shot: quit-double-press-overlay-light-1100x780]. Release early and the pill lingers 1.2 s as if something were pending.
- Current: The user holds a key for an unknown duration, releases a hair early and sees no difference between "almost" and "not even close".
- Proposed: Inside the pill add a 2 px track at the bottom edge (`absolute inset-x-6 bottom-2 h-0.5 rounded-full bg-background/25`) with a child that animates `transform: scaleX(0 to 1)` over 1200 ms linear, `origin-left`, started when `hint.state === "down" && mode === "hold"` and reset on `up` (key the element on a counter incremented per `down`). One-shot, transform-only, runs only while the key is down. `motion-reduce:` variant shows the track full and static. Hide the linger when the hold ended before arming: send `up` with a `completed` flag from `QuitHold.ts` or hide immediately when no repeat was seen.
- DNA: DNA-M3 (opacity and transform only), DNA-M9 (status must not lie), DNA-M4, DNA-M5.
- Effort: S
- Risk: `QuitHold.test.ts` (163 lines) covers the state machine, none of the overlay. A 1.2 s linear transform is longer than the 700 ms one-shot allowance in DNA-M2 but only while a key is physically held; flag this as an explicit exception in review.
- Upstream-eligible: no (new feedback behaviour; the hold overlay shipped recently and is an owner design)
- #24865: not addressed

### F-14-13 The hold-to-quit overlay is not announced to screen readers

- Severity: P2
- Surface: desktop
- Evidence: `QuitHoldOverlay.tsx:34-48` returns `null` until a hint arrives and then mounts `<div role="status">` already containing its text. Live regions inserted with content are usually not announced; the app has a working helper (`~/lib/announce`, used by `OpenInPicker.tsx:299`). The DOM shows four `[role=status]` nodes after the overlay appears, none present before.
- Current: A VoiceOver or NVDA user holding Cmd+Q hears nothing, then the app disappears (the window is also set to opacity 0 at arming, `DesktopWindow.ts:212-224`).
- Proposed: In the effect that handles `hint` call `announce("Hold Command Q for a second or press it twice to quit")` (platform string from the existing `shortcut` variable, spelled "Control Q" on Windows/Linux), and keep the visual pill `aria-hidden`.
- DNA: protocol rule 6 (inaccessible is P1; here a non-blocking announcement gap, P2), DNA-I4.
- Effort: XS
- Risk: Double announcement if the pill also keeps `role="status"`; remove the role. No test.
- Upstream-eligible: yes
- #24865: not addressed

### F-14-14 The hold-to-quit overlay is off the type, shadow and surface ladders

- Severity: P3
- Surface: desktop
- Evidence: `QuitHoldOverlay.tsx:41-46`: `top-[22%]` (arbitrary value), `z-100` (toast layer, below popups at 130), `rounded-full bg-foreground/95 px-8 py-4 text-2xl font-bold text-background shadow-xl`. Measured: 400x64 px, 24 px / 700, `bg-foreground/95` (inverts in dark to a near-white pill), centred on the window (x 350-750) rather than the chat lane (lane centre is about 678 px in the 1100 px window), nearly touching the draft hero heading below it [shot: quit-hold-overlay-light-1100x780]. DNA-T1 ladder is 12/14/20 with 600 for headings; 700 and 24 px appear nowhere in transient feedback; DNA-S4/S8 give floating surfaces `surface-glass` or `dialog-glass`.
- Current: The loudest element in the app is a transient hint for an optional safety feature.
- Proposed: Replace the classes with `surface-glass rounded-lg border border-border px-4 py-2 text-sm font-medium text-foreground shadow-lg` (toast sibling), render `⌘Q` with `ui/kbd.tsx`, position `fixed inset-x-0 top-1/4`, and centre in the lane by reading `--sidebar-width` is unnecessary: keep window-centred. Keep `pointer-events-none`.
- DNA: DNA-T1, DNA-T5, DNA-S4, DNA-S8, DNA-C11, DNA-L7.
- Effort: XS
- Risk: Visual only; the pill's current weight is possibly deliberate (it must be seen while the user's hands are on the keyboard). Verify at 1.44 zoom.
- Upstream-eligible: no (taste change)
- #24865: not addressed

### F-14-15 "Quit shortcut" row does not name the key, the modes or the menu exception

- Severity: P3
- Surface: desktop
- Evidence: `SettingsPanels.tsx:1735-1775`, `settingsSearch.ts:547`: title "Quit shortcut", description "Hold mode also quits on two quick presses.", select values Direct / Hold / Double press (`:131-135`). It does not say the key (Cmd+Q on macOS, Ctrl+Q elsewhere), what "Direct" and "Double press" do, that "Hold" needs 1.2 s, or that the macOS app menu item "Quit T3 Code" (shown with `⌘Q` in the live menu dump) always quits at once, which `docs/user/keybindings.md` states and the UI does not. The internal id is `double-click` while the label is "Double press".
- Current: A user who sees "Hold" cannot tell from the page what the other two modes do.
- Proposed: Title "Quit confirmation". Description (two sentences, DNA-V5): "Choose how ⌘Q quits: hold it for 1.2 s, press it twice, or press once. The Quit menu item always quits at once." with the key from `isMacPlatform` ("Ctrl+Q" elsewhere). Keep the option labels; add `SelectItem` secondary text "Hold or press twice", "Press twice", "Press once".
- DNA: DNA-V5, DNA-K16 (settings copy voice), DNA-V7.
- Effort: XS
- Risk: `settingsSearch.ts` keywords stay; the search index title changes, so keep "Quit shortcut" in `searchTerms`.
- Upstream-eligible: yes
- #24865: not addressed

### F-14-16 The native menu has no thread, project, panel or navigation commands

- Severity: P2
- Surface: desktop
- Evidence: Real menu dumped from the running app (inspector, `Menu.getApplicationMenu()`): app menu (About, Check for Updates..., Settings... `CmdOrCtrl+,`, Services, Hide, Hide Others, Show All, Quit), **File: Close Window only**, Edit (standard plus Paste as Text `CmdOrCtrl+Shift+V`, Speech), View (Reload, Force Reload, Toggle Developer Tools, Actual Size, Zoom In/Out, Toggle Full Screen), Window (standard), Help (Check for Updates...). Source: `DesktopApplicationMenu.ts:160-302`. The renderer already accepts forwarded commands on the same channel (`AppSidebarLayout.tsx:170-172` handles `sidebar.toggle`, `ChatView.tsx:2741` handles `rightPanel.toggle`, `ReopenClosedViewShortcut.tsx:172` handles `view.reopenClosed`), but the menu dispatches only `open-settings` and `paste-as-text` (`:142-153`). Missing against the defaults in `packages/shared/src/keybindings.ts:147-234`: New thread (`mod+n`), New thread without project (`mod+alt+n`), Add project, Command palette (`mod+k`), Toggle sidebar (`mod+b`), Toggle terminal (`mod+j`), Toggle right panel (`mod+alt+b`), Back/Forward (`mod+[`, `mod+]`), Previous/Next thread, Reopen closed tab (`mod+shift+t`).
- Current: macOS users who look in the menu bar for "New Thread" or "Toggle Sidebar" (the standard place, and the only place with a visible shortcut list) find nothing, so the app's shortcuts are discoverable only through tooltips and Settings > Keybindings.
- Proposed: In `DesktopApplicationMenu.ts` add, **without `accelerator`** (so key handling stays in the renderer keybinding system and user rebinds keep working): File: "New Thread", "New Thread Without Project", "Add Project…", "Reopen Closed Tab" (all dispatch the command id through `dispatchMenuAction`); View: "Command Palette", "Toggle Sidebar", "Toggle Terminal", "Toggle Right Panel" above Reload; a new "Go" menu (macOS and Windows/Linux alike): "Back", "Forward", "Previous Thread", "Next Thread". In the renderer add one listener beside `ChatRouteGlobalShortcuts` (`routes/_chat.tsx:37`) that maps `onMenuAction(commandId)` to the existing `runCommand` path. Phase 2: send the resolved shortcuts to main (`desktop:menu-shortcuts` IPC after `primaryServerKeybindingsAtom` loads) and set each item's `accelerator` with `registerAccelerator: false` where Electron supports it so the menu shows the user's real chords.
- DNA: DNA-L8 (keyboard first: every primary action has a shortcut shown), DNA-K14 (palette and shortcut hints), DNA-P8 (entry points).
- Effort: M
- Risk: Duplicate firing if an accelerator is both registered natively and handled by the renderer: the reason for omitting `accelerator` in phase 1. `DesktopApplicationMenu.test.ts` (225 lines) asserts the template; extend it. Platform labels follow macOS HIG ("New Thread", Title Case) while the web uses sentence case; menus are the one place Title Case is correct.
- Upstream-eligible: no (new feature surface, needs maintainer approval)
- #24865: not addressed

### F-14-17 The Help menu is one duplicated "Check for Updates..." item

- Severity: P2
- Surface: desktop
- Evidence: Live menu dump: Help has the single item "Check for Updates..." which also sits in the app menu on macOS (`DesktopApplicationMenu.ts:167-170, 293-301`). On Windows and Linux it is the only place. There is no link to documentation, release notes, the issue tracker, the logs folder or Keyboard Shortcuts, all of which the product already has (`docs/user/*`, `getDesktopUpdateReleaseHistoryUrl`, Settings > Keybindings, `environment.logDir`, Settings > Diagnostics).
- Current: Help is empty for users who need it most (an update loop, a startup failure, a keybinding question).
- Proposed: macOS: remove the duplicate from Help. All platforms: "T3 Code Documentation" (opens the docs URL via `ElectronShell.openExternal`), "Release Notes" (`getDesktopUpdateReleaseHistoryUrl()` equivalent in main), "Keyboard Shortcuts" (dispatch `navigate:/settings/keybindings`), "Show Logs in Finder/Explorer" (`shell.showItemInFolder(environment.logDir)`), "Report an Issue…" (GitHub new-issue URL). Windows/Linux: keep "Check for Updates…" here and add "About T3 Code" (role `about`).
- DNA: DNA-P8, DNA-V7.
- Effort: S
- Risk: URL constants must come from one module shared with `desktopUpdate.logic.ts` (`DEFAULT_DESKTOP_RELEASE_REPOSITORY`); fork builds may point elsewhere (`T3CODE_DESKTOP_UPDATE_REPOSITORY`).
- Upstream-eligible: no (new menu entries)
- #24865: not addressed

### F-14-18 Menu bar is auto-hidden and the in-app palette has no desktop actions (Windows, Linux)

- Severity: P2
- Surface: desktop (Windows, Linux; code-read, not verifiable here)
- Evidence: `DesktopWindow.ts:379` sets `autoHideMenuBar: true` and `:241-247` sets `titleBarStyle: "hidden"` with a 40 px overlay on non-macOS. Update checks, zoom (`CmdOrCtrl+0/=/-`), Reload and Developer Tools exist only as menu items (`DesktopApplicationMenu.ts:234-291, 293-301`), and `apps/web/src/components/CommandPalette.tsx` has no entry for any of them (grep for update, zoom and reload finds one unrelated `searchTerms` hit on an agent-session action, `:1388`). Settings is reachable (palette, `Ctrl+,` through the menu accelerator). Electron's behaviour for a hidden title bar plus auto-hidden menu is platform-dependent; I could not confirm on Windows or Linux whether the menu bar is reachable with Alt, which is why this is a code-read finding with a fix that does not depend on the answer.
- Current: A Windows or Linux user cannot discover "Check for updates", zoom or reload from the UI; the sidebar pill shows an update only when one is found.
- Proposed: Add a "Desktop" action group to the palette (`CommandPalette.logic.ts`, `isElectron` only): "Check for updates", "Zoom in", "Zoom out", "Reset zoom", "Reload window", each calling a new `desktopBridge.runMenuCommand(id)` that reuses `zoomMain` / `runMainContentsCommand` (`DesktopWindow.ts:1003-1020`). Add the same rows' search terms to `settingsSearch.ts` under General > About.
- DNA: DNA-K14 (palette parity), DNA-P8, DNA-L8.
- Effort: M
- Risk: New bridge method (contract change in `packages/contracts/src/ipc.ts`); needs a Windows pass to confirm menu visibility before sizing. Web builds must not show the group (`desktopOnly` flag pattern at `settingsSearch.ts:1182`).
- Upstream-eligible: no
- #24865: not addressed

### F-14-19 Native menu and update dialog copy break the voice rules

- Severity: P3
- Surface: desktop
- Evidence: `DesktopApplicationMenu.ts:76` "You're up to date!" (exclamation mark, DNA-V6), `:85` "An unknown error occurred. Please try again later." ("Please", stock fallback, DNA-V3/V6, DRIFT-12), `:168,173,197,297` labels end in three ASCII dots ("Check for Updates...", "Settings...") against U+2026 in the rest of the app and the macOS menu convention (DNA-V9, DRIFT-14). The dialogs are ownerless: `showMessageBox(...)` is called without the `owner` argument that `ElectronDialog.ts:98` documents as keeping the box from falling behind the window (`DesktopApplicationMenu.ts:74,81,99`). The fallback tooltip text "Update 0.1.3 did not apply. Click to retry." is fine.
- Current: The only native alerts the app raises speak differently from every other surface.
- Proposed: "T3 Code is up to date" with detail "You have 0.1.2, the newest version on the Stable track." (track name from state); error: title "Could not check for updates", detail `state.message` or "The update server did not respond." (no "Please"); replace `...` with `…` in all four labels; pass `owner: yield* desktopWindow.currentMain` so the alert attaches as a macOS sheet.
- DNA: DNA-V3, DNA-V4, DNA-V6, DNA-V9.
- Effort: XS
- Risk: `DesktopApplicationMenu.test.ts` asserts labels; update the fixtures. Menu alerts cannot be captured here (native), so I did not run them.
- Upstream-eligible: yes
- #24865: not addressed

### F-14-20 Fatal startup and backend error boxes dump stages, stack traces and a 520-character paragraph

- Severity: P2
- Surface: desktop
- Evidence: `DesktopApp.ts:138-141`: `showErrorBox("T3 Code failed to start", "Stage: bootstrap\n<message>\n<stack>")` (the stack is appended whenever one exists). `DesktopBackendPool.ts:171-175`: title "This T3 home is unavailable", body is one 519-character paragraph with three shell commands in literal backticks (native boxes do not render markdown), ending "You can also set a separate T3CODE_HOME and pair with the running server."; `:122-135` "WSL backend couldn't start" and "WSL backend is still unavailable" with a raw `reason` string. `showErrorBox` has no buttons: no "Copy details", "Show logs" or "Open docs". #23843 shows the app can remain running windowless after this dialog.
- Current: The user sees a stack trace or a wall of text in an OS box they can only dismiss, and for the held-state-dir case must copy commands out of prose.
- Proposed: Replace `showErrorBox` with `ElectronDialog.showMessageBox({ type: "error", message, detail, buttons, defaultId: 0, cancelId })`: (1) startup: message "T3 Code could not start", detail "Something went wrong while starting the app." buttons ["Quit", "Copy details", "Show logs"]; the stage, message and stack go to the log and to the clipboard on "Copy details". (2) home unavailable: message "Another T3 Code server is using this data folder", detail "Stop it, or use a different folder, then reopen T3 Code." buttons ["Quit", "Open instructions"] linking to the background-service doc. (3) WSL: message "The WSL backend could not start", detail `${reason}. T3 Code will use the Windows backend for this launch.`
- DNA: DNA-V3, DNA-V5 (one short explanation, two sentences at most), DNA-V6.
- Effort: S
- Risk: `ElectronDialog.showMessageBox` is already mocked in `DesktopApplicationMenu.test.ts`/pool tests; `showErrorBox` is used before `app.whenReady` in one path (`handleFatalStartupError` can run during startup), where `showMessageBox` is not available: keep `showErrorBox` for pre-ready failures and add the buttoned box for post-ready ones.
- Upstream-eligible: yes
- #24865: not addressed

### F-14-21 The native folder picker has no title, prompt or button label

- Severity: P3
- Surface: desktop
- Evidence: `apps/desktop/src/electron/ElectronDialog.ts:109-123` builds `showOpenDialog` with only `properties: ["openDirectory","createDirectory"]` and an optional `defaultPath`; no `title`, `message` (macOS prompt line) or `buttonLabel`. `pickFiles` (`:143-168`, favicon picker, theme import) likewise sets only filters. Callers: `CommandPalette.tsx:2552` (Add project), `window.ts` pickers.
- Current: Add project opens an anonymous macOS "Open" sheet or a Windows "Select Folder" dialog; the button says "Open" even though the action is "Add project".
- Proposed: Extend `PickFolderOptionsSchema` (`packages/contracts/src/ipc.ts`) with optional `title`, `message`, `buttonLabel`; pass `title: "Add project"`, `message: "Choose the folder this project works in"`, `buttonLabel: "Add project"` from the palette call, and "Choose icon" / "Import theme" for the file pickers; `ElectronDialog.pickFolder/pickFiles` forward them.
- DNA: DNA-V2 (buttons are verbs), DNA-V7.
- Effort: XS
- Risk: Contract change is additive (optional fields), older clients unaffected. No native-dialog test.
- Upstream-eligible: yes
- #24865: not addressed

### F-14-22 "Couldn't" and "Let's" strings in desktop-only surfaces

- Severity: P3
- Surface: desktop
- Evidence: `LocalEnvironmentSetting.tsx:34` "Couldn't change this setting."; `SnapShotSettings.tsx:138,162,163,225,235,351,373` seven titles starting "Couldn't"; `SnapShotSetupDialog.tsx:60,148,342` "Couldn't set up the extension", "Couldn't check snapshots. Try again to continue.", "Couldn't finish this step. Try again or check Advanced for help."; `:147,165` titles "Let's try that again" and "Let's fix capture access"; `ConnectionsSettings.tsx:679` "Failed to update WSL backend."; `localApi.ts:25,38,45` "Unable to open link." / "Unable to open System Settings." DNA-V4 asks for "Could not <verb> <object>"; DNA-V6 bans theatre.
- Current: A third of the desktop-only strings use the wrong prefix or a chatty voice.
- Proposed: "Could not change this setting." etc. (mechanical); "Let's try that again" becomes "Capture setup did not finish"; "Let's fix capture access" becomes "Capture access needs attention"; "Unable to open link." becomes "Could not open the link."
- DNA: DNA-V4, DNA-V6 (DRIFT-12).
- Effort: XS
- Risk: Tests that match strings: grep before changing (`SnapShotSetupDialog` tests, `ConnectionsSettings` tests).
- Upstream-eligible: yes
- #24865: not addressed

### F-14-23 SnapShot setup tells GNOME users to run "Take snapshot" from a command palette that has no such command

- Severity: P2
- Surface: desktop (Linux, GNOME; code-read)
- Evidence: `SnapShotSetupDialog.tsx:55-58`: for extension status `unsupported`, title "Automatic capture isn't available", description "Use Take snapshot from the command palette to choose a window." Searching the whole web source finds that string only in this file; `CommandPalette*.ts(x)` and `packages/contracts/src/keybindings.ts` have no snapshot command (grep for `snapshot|snap-shot|take`: only project-snapshot helpers). `docs/user/snap-shot.md` describes "Manual capture only" as a mode where "you'll choose a window each time" without naming a trigger either.
- Current: A dead instruction at the one point where the user is told how to get a capture without the shortcut.
- Proposed: Either add the command ("Take snapshot", `desktopOnly`, calls the same bridge path the shortcut uses) to the palette's desktop group (see F-14-18) and keep the sentence, or rewrite the sentence to the real trigger ("Press your shortcut to choose a window each time."). The second is a one-line change.
- DNA: DNA-P3 (stale label), DNA-V7.
- Effort: XS (copy) or S (command)
- Risk: Linux GNOME only; cannot be tested on macOS. `SnapShotCoordinator.browser.test.ts` covers the coordinator.
- Upstream-eligible: yes (copy fix)
- #24865: not addressed

### F-14-24 SnapShots page repeats "SnapShots" three times and mixes status punctuation

- Severity: P3
- Surface: desktop
- Evidence: `/settings/snap-shot` renders breadcrumb "Settings / SnapShots", section title "SnapShots" (`SnapShotSettings.tsx:388`), row title "SnapShots" (`searchableSetting("snap-shot-enabled")`) and the nav item, then "Turn this on to set up snapshots." [shot: settings-snapshots-off-light-1100x780]. Status strings in `SnapShotSettings.logic.ts:10-41` mix endings: "Manual capture only. You'll choose a window each time" (no period), "Ready to capture" (none), "Shortcut saved." (period), "Approve the shortcut permission prompt to continue." (period). The sound label is "Whoosh (Default)" in Title Case with an id of `soft-pop` (`SnapShotSettings.tsx:126,521,539`). The aria-label reads "Snapshot sound" while the product term is "SnapShot".
- Current: The page spends its first screen restating its name.
- Proposed: Drop the `title="SnapShots"` on the section (the group has one row) or rename the row "Capture windows"; add the default shortcut to the row status when off ("Capture a window with both Shift keys"); end every status with a period or none consistently (statuses are short labels: no period); "Whoosh (default)".
- DNA: DNA-V1, DNA-V5, DNA-D1.
- Effort: XS
- Risk: `settingsSearch.ts` entries reference `snap-shot-enabled`; keep ids.
- Upstream-eligible: yes
- #24865: not addressed

### F-14-25 A desktop-only SnapShots nav item is shown on the web

- Severity: P3
- Surface: web
- Evidence: On `http://localhost:5733/settings/snap-shot` (web) the nav lists SnapShots and the page shows "Only available in the desktop app." (`SnapShotSettings.logic.ts:112-113`). Settings search already hides desktop-only rows on web (`settingsSearch.ts:1182`, `desktopOnly: true` on `quit-confirmation`; the web General page has no Quit shortcut row) but the nav item is not filtered.
- Current: Web users get a nav entry to a dead page; inconsistent with how the Quit shortcut row is hidden.
- Proposed: Filter `/settings/snap-shot` out of `SettingsSidebarNav` when `!isElectron` (same predicate), keep the route for deep links. Alternatively keep it as an explanatory entry but then show the same treatment for every other desktop-only setting; hiding is the smaller change.
- DNA: DNA-P9 (surface parity: nothing assumes the other surface), DNA-L2.
- Effort: XS
- Risk: `routes/_chat.settings.snap-shot.tsx` must still render for the desktop; the hosted app (app.t3.codes) must not link to it either.
- Upstream-eligible: yes
- #24865: not addressed (`SettingsSidebarNav.tsx` only changes the icon class)

### F-14-26 Open-in menu never shows which editor is the default and the same click means two things

- Severity: P2
- Surface: desktop (also web and the thread details card)
- Evidence: `OpenInPicker.tsx:333-352`: `MenuItem`s with `onClick={() => presentation === "menu" ? openInEditor(value) : setPreferredEditor(value)}`. In the toolbar and details-card presentation the click only changes the default (the card's primary button then reads "Open in <editor>"); in the overflow-menu presentation the same item opens the editor. There is no check indicator or `aria-checked`; the default is marked only by the `⌘O` shortcut text on its row, and only if a binding exists (`:348-350`). Live in the details card: items "VS Code ⌘O" and "Finder" under the "Choose editor" chevron [shot: open-in-menu-light-1100x780]. The option list is a fixed 20-entry order (Cursor, Trae, Kiro, VS Code, Insiders, VSCodium, Zed, Antigravity, 12 JetBrains IDEs, then the file manager last, `:84-194`); the file manager row is labelled "Finder" (macOS) and reveals, which is the most common action. Screen reader users get no selection state.
- Current: The control is a "set default" picker that looks like an "open with" menu; a user who clicks "Finder" does not get Finder.
- Proposed: In `presentation !== "menu"` render items as `MenuRadioItem` inside `MenuRadioGroup` (primitives exist: `ui/menu.tsx`, used by `SnapShotSettings.tsx:528-560`) with `value={preferredEditor}` so the check indicator and `aria-checked` appear, and keep `MenuShortcut` on the checked row. Rename the file-manager label to "Show in Finder" / "Show in File Explorer" / "Show in Files" via `editorLabelForPlatform` (`editorLabels.ts:9-15`) and sort it first in the list. Add a one-line footer item "Sets the default for Open" (disabled `MenuItem`, `text-xs text-muted-foreground`).
- DNA: DNA-I4, DNA-L8, DNA-I6 (editor brands keep their own colour; unchanged), DNA-D5 (menu rows share one shape).
- Effort: S
- Risk: `OpenInPicker.browser.test.tsx` exists; the menu role changes from `menuitem` to `menuitemradio`, so update queries. #24865 modifies icon classes on the same primary button but not the menu items.
- Upstream-eligible: yes
- #24865: not addressed (only the panel icon is greyed; menu semantics untouched)

### F-14-27 Native context menus carry one icon and no "Open link"; the web fallback carries icons on all

- Severity: P3
- Surface: desktop
- Evidence: `apps/desktop/src/electron/ElectronMenu.ts:115-136,176-181` builds native menus from `ContextMenuItem` but reads `icon` never; only `destructive` items get a macOS "trash" named image (empty on Windows/Linux, so nothing). `contextMenuFallback.ts` draws a Lucide glyph for every item that names one (`archive`, `pin`, `pencil`, `copy`, ...). `DesktopWindow.ts:519-593`: the default editable/link context menu has Cut, Copy, Paste, Select All, spelling suggestions, "Copy Link" (only when the URL is safe) and "Copy Image", but no "Open Link", no "Paste as Text", no Look Up / Search. Theming: native menus follow the OS, not imported themes (issue #10997); that is inherent.
- Current: On macOS the thread menu shows a single trash icon on Delete and no others, so Delete's label is indented relative to its siblings; on the web the same menu has icons on every row. A link in a message offers "Copy Link" but not "Open Link".
- Proposed: Either drop the lone destructive icon (consistent iconless native menus, matching Finder and Safari) or map the contract `icon` names to SF Symbols with `nativeImage.createFromNamedImage` for all items on macOS; recommended: drop it. Add "Open Link in Browser" (`electronShell.openExternal` through `parseSafeExternalUrl`) above "Copy Link" and "Paste as Text" to editable fields.
- DNA: DNA-I3, DNA-P9, DNA-D5.
- Effort: S
- Risk: `ElectronMenu` and `DesktopWindow.test.ts` assert template items; native menus cannot be captured here (no screenshot).
- Upstream-eligible: yes (the "Open Link" row is a small obvious gap); the icon decision needs a maintainer call
- #24865: not addressed

### F-14-28 Top bar is 40 px on Windows and Linux against the 52 px DNA-D3 rule

- Severity: P3
- Surface: desktop (Windows, Linux; code-read)
- Evidence: `DesktopWindow.ts:39,244` `titleBarOverlay.height = 40`; `index.css:154-163` sets `.wco { --workspace-topbar-height: max(40px, env(titlebar-area-height, 52px)) }`, which resolves to 40. Every consumer uses the variable (sidebar header `SidebarChrome.tsx:51`, chat header, right-panel tab strip), so the whole shell is 12 px shorter than on macOS (52, verified live: header `h 52`). MAP section 13 item 9 records 40 as a coupled constant but DNA-D3 states 52 px everywhere.
- Current: One product, two shell heights; the same 28 px controls sit tighter on Windows and Linux.
- Proposed: Decide, then record: either keep 40 and add "(Windows and Linux with Window Controls Overlay: 40)" to DNA-D3, or set `TITLEBAR_HEIGHT = 52` (caption buttons become 52 px tall, unusually large for Windows 11). Recommendation: keep 40 and document, because native caption buttons are 32 to 40 px tall; do not change code.
- DNA: DNA-D3.
- Effort: XS (documentation) or S (code)
- Risk: Needs a Windows screenshot before either choice; none is possible here.
- Upstream-eligible: no
- #24865: not addressed

### F-14-29 Native window background and caption symbols ignore named themes

- Severity: P3
- Surface: desktop
- Evidence: `DesktopWindow.ts:133-135,260,381`: native window background is only `#0A0A0A` or `#FFFFFF`, and `setTitleBarOverlay` uses `#1f2937` / `#f8fafc` symbols (`:56-57`). Live: with Grove dark applied the web canvas is `oklch(0.2609 0.0215 162.75)` (about `#1b2821`) while `BrowserWindow.getBackgroundColor()` still returned `#0A0A0A`; the default light canvas is `#fcfcfc`, the native fallback `#FFFFFF`. `bridge.setTheme` carries only `"light" | "dark" | "system"` (`ipc.ts` `DesktopTheme`). The native background shows during live resize and before first paint on named themes (T3 Chat, Grove, Ocean, Ember, Iris).
- Current: A resize drag or a cold start on a named theme flashes the default grey-black or white under the themed canvas.
- Proposed: Extend `setTheme` with an optional `canvas: string` (the resolved `--background`, available in `useTheme.ts` `applyTheme`, lines 304-345) and call `window.setBackgroundColor(canvas)` in `syncWindowAppearance` (`DesktopWindow.ts:250-266`); persist it in `DesktopAppSettings` so `createWindow` uses it at launch (`:381`). Pick caption `symbolColor` by canvas luminance, not by `shouldUseDarkColors`.
- DNA: DNA-C8 (appearance resolved once, early), DNA-K8 (theme architecture), DRIFT-3.
- Effort: S
- Risk: Contract change; custom themes with halves must pass the half that is active. Visible only on resize and cold start.
- Upstream-eligible: yes
- #24865: not addressed (changes canvas tokens in `index.css` but not the native colour)

### F-14-30 The native window title is pinned to the app name

- Severity: P3
- Surface: desktop
- Evidence: `DesktopWindow.ts:663-666` cancels every `page-title-updated` and calls `window.setTitle(environment.displayName)`. Live: `BrowserWindow.getTitle()` is "T3 Code (Dev)" on every route and thread. The macOS title is hidden (`hiddenInset`), but the title feeds the Window menu, Mission Control, the Windows taskbar hover card, Alt+Tab and screen readers, and the SnapShot attachment label.
- Current: Every window-switching surface shows only "T3 Code" regardless of the thread.
- Proposed: Keep the pin for the splash but let the main window follow `document.title` set by the renderer to `"<thread title> · <project> · T3 Code"` (truncate to 80 chars, strip control characters); the renderer owns the string, main only calls `setTitle` through the existing `page-title-updated` event instead of preventing it.
- DNA: DNA-P3 (the title tells where you are), DNA-P9.
- Effort: S
- Risk: The renderer must set `document.title` per route (today it is static); privacy: thread titles then appear in OS surfaces and screen sharing task switchers, so gate behind a setting or accept explicitly.
- Upstream-eligible: no
- #24865: not addressed

### F-14-31 Confirmed: no tray, Dock menu or jump list

- Severity: P3
- Surface: desktop
- Evidence: Search over `apps/desktop/src` for `Tray`, `app.dock`, `setJumpList`, `setUserTasks`: only `app.dock?.setIcon` (`ElectronApp.ts:179`) and the application menu. The only OS presence beyond the window is the badge (`ipc/methods/notificationBadge.ts:19-40`: macOS and Linux `app.setBadgeCount`, Windows overlay icon; the count is forced to 0 whenever a window is focused, `:22`) and OS notifications from the renderer (`ThreadNotificationCoordinator.tsx:195`). Prior art: #10161 asks for a tray on Windows.
- Current: On macOS, with the window closed (F-14-02), the Dock icon is the only handle and it has no menu: no "New Thread", no running-thread list, no "Quit".
- Proposed: Out of scope for this audit as a build item; record as the direction for #10161: (1) macOS `app.dock.setMenu` with New Thread, Settings and the three most recent running threads; (2) Windows `app.setJumpList` with New Thread; (3) a tray only if the maintainers approve "keep running when closed" on Windows and Linux (it also solves F-14-01).
- DNA: DNA-L2 (thread-first), DNA-P8.
- Effort: M (Dock and jump list), L (tray)
- Risk: Tray changes the quit model; needs a product decision.
- Upstream-eligible: no
- #24865: not addressed

### F-14-32 A corrupt `desktop-settings.json` silently resets update track, WSL and window state

- Severity: P3
- Surface: desktop
- Evidence: `apps/desktop/src/settings/DesktopAppSettings.ts:384-396`: `decodeDesktopSettingsJson(raw).pipe(..., Effect.orElseSucceed(() => defaultSettings))` with no log and no signal; the next write replaces the file. The values it holds are the update channel (including a deliberate Nightly choice), `localEnvironmentEnabled`, WSL mode and distro, server exposure and Tailscale serve, window bounds. The renderer-side equivalent `client-settings.json` blocks the app behind a recovery screen (F-07-13), so the two files fail in opposite ways. Not tested live (restarting with a corrupted file in my dev home was not worth a relaunch).
- Current: After a bad write or manual edit, a user on Nightly is silently moved to Stable, network access is switched off and the window forgets its size.
- Proposed: On decode failure log a warning with the parse error, copy the bad file to `desktop-settings.json.corrupt-<timestamp>` before defaults take over, and show one toast on first render ("Desktop settings were reset because the file could not be read. A copy was saved.") via a `getDesktopSettingsRecovery` flag on the bootstrap IPC. Keep the silent default for a missing file.
- DNA: DNA-P3, DNA-P7.
- Effort: S
- Risk: New bootstrap field (additive). Test with a malformed JSON fixture in the existing settings tests.
- Upstream-eligible: yes
- #24865: not addressed

### F-14-33 CLI row shows literal backticks

- Severity: P3
- Surface: desktop
- Evidence: `CliCommandSettingsRow.tsx:50,53`: "Run T3 Code's CLI as `t3` from any terminal." and "...to run \`t3\`." are plain strings passed to `SettingsRow.description` (`settingsLayout.tsx:494-496` renders them as text), so the backticks display. The row only renders on packaged builds where `state.supported` is true (hidden in this dev build), so this is code-read.
- Current: Markdown syntax shows in a settings description.
- Proposed: Wrap the command in the same inline-code element other rows use: `<code className="rounded-sm bg-muted px-1 font-mono text-[0.86em]">t3</code>` (`text-[0.86em]` is on the arbitrary-value allow-list, MAP section 13) and pass a ReactNode description.
- DNA: DNA-T7 (mono is for machine-typed values), DNA-V7.
- Effort: XS
- Risk: None; no test.
- Upstream-eligible: yes
- #24865: not addressed

## 3. Edge-case results (matrix)

Windows and Linux rows are code-read only; macOS rows are live in the dev app unless marked. "Live" means driven through CDP and the main-process inspector described in section 0.

| Row                                                                                                      | Result                                                                                                                                                                                                                                                         |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data: empty                                                                                              | PASS (live): first launch with zero projects shows the Welcome wizard over the shell; adding a project through the CLI appears live. First-run copy and the wizard's project import are area 10's.                                                             |
| Data: one item / 100+ / 10,000+                                                                          | N/A: list scale is areas 02 and 22; the desktop shell adds no list.                                                                                                                                                                                            |
| Data: very long names, unicode, RTL, whitespace                                                          | N/A for the shell; the window title is pinned (F-14-30) so long thread titles cannot reach it. Native dialog strings take no user text.                                                                                                                        |
| Content (diff size, tool output, tables, code fences)                                                    | N/A: renderer content, other areas. Images: native "Copy Image" path read (`window/ContextMenuImage.ts`, 32 MiB cap, 10 s timeout, scheme allow-list): PASS by reading. Links: native menu offers "Copy Link" only (F-14-27).                                  |
| Network: provider not installed / logged out                                                             | N/A here (area 09). The desktop wizard step "Connect your agents" rendered Ready for both providers on this host.                                                                                                                                              |
| Network: auth expired, stream stalls, cancelled, permission prompt mid-stream, 2 and 6 threads streaming | N/A: areas 03 and 09. Streaming was not started (one 1-turn probe only).                                                                                                                                                                                       |
| Network: relay disconnected                                                                              | N/A (area 11).                                                                                                                                                                                                                                                 |
| Network: reconnect after sleep, OS sleep during stream                                                   | NOT TESTED: would sleep the developer's Mac. Code-read: `backgroundThrottling` is turned on after first reveal (`DesktopWindow.ts:809`, issue #21235).                                                                                                         |
| Network: server restarted under the client                                                               | FAIL (F-14-02): a closed window re-opens and, on macOS, steals focus. With the window open the renderer reconnected without user action.                                                                                                                       |
| Network: version mismatch app vs server                                                                  | NOT TESTED: needs a second server version. `docs/user/updating.md`: an app newer than the server is blocked with a notice; read only.                                                                                                                          |
| Git rows                                                                                                 | N/A (areas 05, 06).                                                                                                                                                                                                                                            |
| Viewport 1440x900                                                                                        | N/A for desktop: default window is 1100x780 (measured), minimum 840x620 (`DesktopWindow.ts:376-377`, `getMinimumSize` returned 840x620).                                                                                                                       |
| Viewport 1280x720                                                                                        | NOT TESTED separately: 1100x780 and 840x620 bracket it; layout is identical above 981 px.                                                                                                                                                                      |
| Viewport 1024x640                                                                                        | Boundary: the modal padding flips from 24 to 40 px at 1024; between 840 and 1023 the traffic lights collide with the modal (F-14-05).                                                                                                                          |
| Viewport 800x600                                                                                         | N/A: below the 840 minimum; reachable only with app zoom (F-14-06).                                                                                                                                                                                            |
| Viewport ultrawide 3440x1440                                                                             | NOT TESTED: no second display. Bounds persistence resets to the default size when the saved rectangle fits no display (`DesktopWindow.ts:139-174, 352-372`).                                                                                                   |
| Viewport mobile 390x844 with keyboard                                                                    | N/A for Electron.                                                                                                                                                                                                                                              |
| OS zoom 80 / 125 / 150%                                                                                  | Live (app zoom, the View menu equivalent): +2 levels (1.44) at the minimum window: shell and sidebar sheet PASS (`--desktop-window-controls-inset` 62.5 px, lights re-synced to y 30), full-bleed Settings FAIL (F-14-06). Windows display scaling NOT TESTED. |
| Browser zoom 50 / 200%                                                                                   | N/A (Electron zoom covers it).                                                                                                                                                                                                                                 |
| Preferences: light, dark                                                                                 | Live: both render; the quit overlay inverts in dark (F-14-14); shell and traffic-light inset identical.                                                                                                                                                        |
| Preferences: system switching live                                                                       | NOT TESTED at OS level (no permission to flip Dark and Light). Calling `bridge.setTheme("dark")` from outside the app's own state was overridden by the renderer's appearance state, as designed.                                                              |
| Preferences: every named theme                                                                           | Live for Grove dark: native window background stays `#0A0A0A` (F-14-29); others by reading.                                                                                                                                                                    |
| Preferences: reduced motion                                                                              | The update-check icon honours it (`SidebarUpdatePill.tsx:201-218`, code-read); the connecting splash spinner does not (F-14-03); the quit overlay has no motion.                                                                                               |
| Preferences: high contrast / forced colours                                                              | NOT TESTED (no Windows). Caption symbols use fixed `#1f2937` / `#f8fafc` (`DesktopWindow.ts:56-57`).                                                                                                                                                           |
| Preferences: keyboard only                                                                               | PASS for Settings (menu `Cmd+,`); the About row and update buttons are real buttons. FAIL for menu discoverability (F-14-16).                                                                                                                                  |
| Preferences: screen reader                                                                               | FAIL: hold-to-quit hint (F-14-13). Native menus are OS-accessible by construction; VoiceOver was not run.                                                                                                                                                      |
| Preferences: font size overrides                                                                         | N/A here (F-07-12 covers Settings).                                                                                                                                                                                                                            |
| Lifecycle: first ever launch                                                                             | Live: wizard shows and is not blocking. FAIL: no window or splash while the backend starts (F-14-03). Privacy note in section 7.                                                                                                                               |
| Lifecycle: launch after update                                                                           | NOT TESTED (needs a signed build and feed). Code-read: `DesktopUpdateLaunchNotice` shows "Update did not apply" (`updateEverythingRun.tsx:326`).                                                                                                               |
| Lifecycle: corrupted settings file                                                                       | FAIL by reading: `desktop-settings.json` silently resets (F-14-32); client settings block the app (F-07-13).                                                                                                                                                   |
| Lifecycle: launch while server already running                                                           | Code-read: `onStateDirOwned` shows a 519-character native error box and quits (F-14-20).                                                                                                                                                                       |
| Lifecycle: backgrounded for an hour / window minimised during a stream                                   | NOT TESTED (needs 5+ minutes hidden plus a stream to see issue #21235). Code-read: throttling enabled after first reveal; `RunningThreadKeepAlive` keeps thread subscriptions mounted (`state/threads.ts:136`).                                                |
| Lifecycle: OS sleep during stream                                                                        | NOT TESTED (would sleep the developer's Mac).                                                                                                                                                                                                                  |
| Platform rows (not in the standard matrix)                                                               | macOS: live. Windows (caption overlay, WSL, `WindowsForegroundFocusWorker`, installer update) and Linux (secret storage, `.desktop` URL handler, GNOME extension, Wayland portals): code-read only; F-14-01, 05, 18, 23 and 28 are written from code.          |

## 4. Already good (do not touch)

- **Hold-to-quit state machine** (`window/QuitHold.ts`, 196 lines, `QuitHold.test.ts`): handles macOS dropped keyUp, auto-repeat cadence, the double-press window and the grace period so trailing repeats cannot reach the next app. F-14-12 only adds feedback; leave the logic alone.
- **Traffic-light geometry under zoom**: `syncMacosWindowButtons` re-centres the lights on the 52 px strip at every zoom step and `--desktop-window-controls-inset` is `90 / zoomFactor` (verified live at 1.44: inset 62.5 px, lights y 30). The sidebar toggle and brand row clear the lights at every width, including the sheet. The area-01 lead about `pr-24` / `pr-28` header reserve resolves as PASS: at 1100 px the breadcrumb nav ends at x 984 and the panel controls begin at x 994; on Windows the `wco:pr-(--workspace-native-controls-inset)` reserve (150 px) plus `pr-24` (96 px) is 246 px against 243 px needed (code-read).
- **Window bounds persistence** (`DesktopWindow.ts:406-491`): 500 ms debounce, normal bounds saved while maximised, maximised state restored, and persistence stays off until the user actually moves the window.
- **Renderer crash recovery** (`:769-801`): reload after 500 ms, three attempts per 60 s, logged.
- **Local environment toggle** (`LocalEnvironmentSetting.tsx`) and the WSL mode changes in `ConnectionsSettings.tsx`: destructive switches go through a named confirm dialog that says what stops and that the app restarts [shot: settings-connections-light-1100x780].
- **Update-everything confirm** (`UpdateEverythingDialog`): one dialog names the app version, "restarts last", each machine and provider, with a blue "Update" and plain "Cancel" [shot: update-everything-dialog-light-1100x780]. The nightly release-notes popover body is well structured [shot: update-pill-nightly-notes-popover-light-1100x780].
- **macOS permission helper** (`permissions/MacPermissionHelper.ts`): a floating "Drag T3 Code into the list above" tile that follows the System Settings window, is draggable and keyboard-focusable, hides when Settings is not frontmost and closes itself when the grant lands.
- **Drag-region pattern** (`index.css:1754-1775`): children reset to `initial` so fixed controls do not add drag rectangles; the Settings popup is `no-drag` while the strip underneath stays draggable.
- **External links** are allow-listed through `ElectronShell.parseSafeExternalUrl`; `setWindowOpenHandler` denies everything else (`DesktopWindow.ts:600-620`).
- **Single-instance lock and second-instance handoff** (`DesktopClerk.ts:115-125`), and the `t3code://` / `t3code-dev://` scheme split by build (`electron-launcher.mjs:21-22`).
- **Zoom and reload target the app, not a focused browser tab** (`DesktopWindow.ts:327-338, 1003-1020`), and the Paste as Text accelerator does not double-paste (`DesktopApplicationMenu.ts:145-153`).
- **Badge and OS notification plumbing**: badge cleared on focus (`notificationBadge.ts:22`) and a Windows overlay with an accessible description; the in-app side is area 12's.

## 5. Incomplete (what I did not cover and why)

- **Native chrome could not be captured**: traffic lights, menu bar, native dialogs (update alerts, error boxes, open panels), native context menus, Dock badge and OS notifications. `screencapture` and CoreGraphics capture are blocked for this agent's host process. Where a finding depends on native pixels I used the measured geometry and said so (synthetic overlay).
- **Native menu actions** (Check for Updates..., Quit) were not clicked: the update check raises an ownerless OS alert that I cannot dismiss, and Quit would end the dev instance. The menu structure was dumped from the live process instead.
- **SnapShot enablement** (global Shift+Shift shortcut, Screen Recording and Accessibility prompts) was not toggled on: it would register a system-wide shortcut and raise macOS permission prompts on the developer's machine. The page, copy and setup dialog were read; the SnapShot coordinator and accessibility workers were not exercised.
- **Real updater feed**: update states were injected over the real IPC channel (`desktop:update-state`), so the renderer paths are real, but the electron-updater state machine, download, signature check and relaunch are not (`updateMachine.ts` read only).
- **Native fullscreen** was not entered (it would move the developer's display to a new Space); `getWindowFullscreenState` plumbing and the inset drop in `AppSidebarLayout.tsx:79-125` are code-read. Issue #19079 (right-sidebar tab X needs repeated clicks in native fullscreen) is therefore not reproduced.
- **Windows and Linux** are code-read only, including WSL, `WindowsForegroundFocusWorker`, Linux `.desktop` registration and secret storage, the GNOME extension, Wayland portal flows and the AppImage issues in prior art.
- **Production build differences**: this is the dev build ("T3 Code (Dev)" title, blueprint header art, detached DevTools window, raw updater `currentVersion` reporting the Electron version 44.9.3). The production Nightly app on this Mac was never touched.
- **`open-url` through real Launch Services** (F-14-04) was emulated at the Electron event level only.
- **Minimised-window throttling** (#21235) needs several minutes hidden plus a live stream; not run.
- Prior-art desktop issues I could not reproduce here and did not turn into findings: #19119 (System appearance stuck light on KDE Wayland), #10997 (native context menus ignore imported themes, inherent to native menus), #15954 (AZERTY appearance shortcut), #15001 and #23470 (undecryptable connection catalog; see Needs deeper look).

## 6. Needs deeper look

1. **In-app browser tab focus and menu shortcuts (potentially P1, unverified).** `preview/Manager.ts:1459-1466` calls `contents.setIgnoreMenuShortcuts(!isPreviewEditingShortcut(...) || !holdsKeyboardFocus(contents))` on every keydown in a guest. `isPreviewEditingShortcut` (`:466-488`) allows only Cmd/Ctrl+A, C, V, X, Z (and Y on Windows). By Electron's contract every other menu accelerator is ignored while a browser tab holds focus: Cmd+Q, Cmd+, (Settings), Cmd+W, Cmd+M, Cmd+H, Cmd+Alt+I. Only the layout commands in `forwardedShortcuts` reach the app. Needs a physical-keyboard test: open a browser tab, click into the page, press Cmd+Q and Cmd+, and see whether anything happens. I could not inject OS-level key events safely (the foreground app may be the developer's live instance).
2. **Menu accelerators versus user keybindings.** Menu items keep hard-coded accelerators (`CmdOrCtrl+R`, `Shift+CmdOrCtrl+R`, `CmdOrCtrl+0/=/-`, `CmdOrCtrl+Shift+V`, `CmdOrCtrl+,`, `Alt+Cmd+I`). Settings > Keybindings (`keybindingConflictLabels`) compares only app rules, so a user who binds `mod+r`, `mod+shift+v` or `mod+,` gets no warning and may be shadowed by the menu. Needs a precedence test per platform and a conflict check against a fixed list of menu chords (cf. F-07-10: no `settings.open` command exists).
3. **Connection catalog decrypt failure** (#15001, #23470, `DesktopConnectionCatalogStore.ts:483-497`): what does the user see when the OS keychain cannot decrypt `connection-catalog.json`? Saved remote environments may vanish without a message. Needs a repro with a changed `safeStorage` backend.
4. **Windows**: caption-button overlay layout at 125 and 150 percent scaling, `autoHideMenuBar` plus `titleBarStyle: "hidden"` menu visibility (F-14-18), forced colours, the WSL splash, the installer update path (#20345 PowerShell signature timeout).
5. **Linux**: GNOME extension setup copy, the `unsupported` "Take snapshot" step (F-14-23) and where manual capture is actually triggered; Wayland global-shortcut portal consent; secret-storage fallbacks.
6. **macOS releases newer than the one measured**: the traffic-light geometry is hard-coded (`MACOS_WINDOW_BUTTON_RADIUS = 7`, x 16, inset 90) with no test tying it to the system's real button frame; if a macOS release changes the button size the 52 px strip and the 90 px inset drift. A one-line runtime check that `window.getWindowButtonPosition()` matches `trafficLightPosition` after `did-finish-load` would catch it.
7. **First-run wizard on desktop (area 10)**: step 2 shows an account identifier for the signed-in provider and step 3 lists 19 projects discovered from CLI history with absolute paths under the home directory, two pre-selected. I withheld every capture of steps 2 and 3. Whether the import should pre-select and show full paths is a privacy-copy question.
8. **Native fullscreen** (#19079) and the macOS top-edge menu-bar reveal over the 52 px strip.

## 7. Process notes, side effects and withheld captures

- **Dev Electron instance left running:** Electron main PID **75491** (parent dev-runner `vp run dev:desktop` PID **75061**, recorded in `/tmp/t3code-desktop.pid`; its backend child was restarted once during the F-14-02 experiment and now has a new PID). Remote debugging port 9222 is open on 127.0.0.1 (CDP); the Node inspector on 127.0.0.1:9229 was opened with `SIGUSR1` for this audit and closed at the end. Web server for the instance: 127.0.0.1:5734; backend: 127.0.0.1:13774; state dir `/tmp/t3code-overhaul-desktop`.
- **State changed in that instance** (all under `/tmp`, none under `~/.t3/userdata`): project `sample-app` and one thread "Desktop probe" (one `claude-haiku-5-5` turn); the Welcome wizard was completed with "Do not import projects" (nothing imported); appearance cycled to dark and back to System and one named theme applied then removed; injected updater and quit-hint IPC events (updater reset to the real "disabled" state); a probe browser tab opened by the emulated link was closed; window size and zoom were changed and restored to 1100x780 at (206, 37), zoom 0; the main window was closed and re-opened twice by the F-14-02 and F-14-04 experiments.
- **Build outputs:** relaunching `vp run dev:desktop` rebuilt the gitignored `apps/web/dist` and `apps/desktop/dist-electron` bundles; no source file was edited. The only files I added to the repo are this report and the screenshots folder.
- **Never touched:** the developer's production Nightly app, `~/.t3/userdata`, the web dev server on 5733, any `VITE_*` URL.
- **Captures withheld:** Welcome wizard step 1 (machine name only, not saved), step 2 (provider account identifier) and step 3 (real project names and absolute home-directory paths). Raw working captures stayed outside the repo.
- Traffic lights in "annotated" captures are synthetic (section 0).

## 8. Screenshot index (`ui-overhaul/screens/14-desktop-specific/`, prefix `14-desktop-specific-`)

- `shell-expanded-trafficlights-annotated-light-1100x780`, `shell-expanded-trafficlights-annotated-dark-1100x780`, `shell-collapsed-trafficlights-annotated-light-1100x780`: the 52 px strip with synthetic lights, sidebar toggle at x 91, breadcrumb at x 130.
- `settings-modal-trafficlights-annotated-light-840x620` (F-14-05), `settings-fullbleed-zoom144-trafficlights-annotated-light-840x620` (F-14-06), `sidebar-sheet-zoom144-trafficlights-annotated-light-840x620` (PASS case).
- `settings-about-disabled-light-1100x780`, `settings-about-error-download-row-light-1100x780`, `settings-about-downloading-row-light-1100x780` (F-14-07).
- `update-pill-tooltip-light-1100x780`, `update-pill-nightly-notes-popover-light-1100x780`, `update-everything-dialog-light-1100x780` (F-14-09, 10, 11).
- `quit-hold-overlay-light-1100x780`, `quit-hold-overlay-dark-1100x780`, `quit-double-press-overlay-light-1100x780` (F-14-12 to 14).
- `queued-link-opened-after-reactivate-light-1100x780` (F-14-04).
- `open-in-menu-light-1100x780` (F-14-26), `settings-snapshots-off-light-1100x780` (F-14-24), `settings-connections-light-1100x780` (local environment row, PASS).
