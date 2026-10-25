# Area 13: loading and skeletons

Method. Own Playwright contexts only. CDP `Network.emulateNetworkConditions` + `setCacheDisabled(true)` per context. Presets (bytes/s): Slow 4G = 150 ms RTT, 200 kB/s down, 93.75 kB/s up; Fast 3G = 562.5 ms RTT, same bandwidth. WebSocket frames are NOT shaped by CDP; where a WS delay is quoted it was added with `page.routeWebSocket` (one-way ms = RTT/2).
Build under test: the production build in `apps/web/dist` (built from this checkout, 12:38), served by a throwaway static+proxy script in `/tmp/t3code-pw/a13-prodproxy.mjs` on :5799 (gzip level 6, same cache headers as `apps/server/src/http.ts:641-657`, proxies `/api /ws /oauth /.well-known` to the running backend). The dist had a baked desktop URL (`127.0.0.1:13774`) that the proxy rewrites in memory. The live :5733 dev server is unbundled (1,733 requests on cold load) so it is reported separately and is not representative of users. Brotli was not used (server middleware unverified), so absolute byte-bound times are an upper bound.
Page: `/<env>/<seed thread>` (Codex seed thread), 1440x900 light unless noted, 3 runs, medians. "Shell" = `[data-slot=sidebar]`; "content" = first timeline row + composer editor; TTI* = end of last >50 ms long task before the first 2 s quiet window after the editor exists.

## Cold-load timings (ms, median of 3, cache disabled)

| Condition                             |        first paint (splash) |                                                        shell | content + editor |                TTI* | reqs / gz KB (JS KB)     |
| ------------------------------------- | --------------------------: | -----------------------------------------------------------: | ---------------: | ------------------: | ------------------------ |
| Normal                                |                          16 |                                                          251 |              569 |                 569 | 228 / 2,686 (2,474)      |
| Slow 4G                               | 392 (logo pixels at ~1,420) |                                                       15,510 |           18,268 |              18,268 | 230 / 2,686              |
| Fast 3G                               |                       1,220 |                                                       26,424 |           30,858 |              30,858 | 230 / 2,686              |
| 390x844 normal                        |                           8 |                                                 none (sheet) |              372 |                 372 | 228                      |
| 390x844 Slow 4G                       |                         392 |                                            blank from 15,485 |           18,107 |              18,107 | 230                      |
| 390x844 Fast 3G                       |                       1,220 |                                            blank from 26,395 |           31,049 |              31,049 | 230                      |
| Warm cache, normal                    |                          24 |                                                          110 |              223 |                 347 | 228 / 27                 |
| Warm cache, Slow 4G                   |                         184 |                                                          415 |              700 | 2,967 (2 of 3 runs) | 226 / 6                  |
| Warm cache, Fast 3G (n=1)             |                         608 |                                                        1,256 |            1,950 |               1,950 | 225 / 5                  |
| First visit (no localStorage), normal |                          16 |                                                          475 |              584 |                 475 | 228                      |
| First visit, Slow 4G                  |                         392 |                               18,494 (splash gone at 15,466) |           18,770 |              18,494 | 228                      |
| First visit, Fast 3G                  |                       1,220 | 31,120 (splash gone at 26,382; "Still connecting" at 30,381) |           31,794 |              31,144 | 227                      |
| `/` (home redirect), normal           |                          16 |                                                          211 |              564 |                 476 | 237                      |
| Dev server :5733, normal              |                          28 |                                                          923 |            1,634 |               1,634 | 1,733 (Playwright count) |
| Dev server, 390x844                   |                          28 |                                                         none |            1,138 |               1,138 |                          |

CLS (layout-shift observer): cold 0.0001; 0.004 per jump when the sync banner appears or clears (0.0089 total on warm Slow 4G, 0.0146 on 390 Fast 3G). New elements arriving in empty space do not count as CLS, so the visible jumps below are measured by bounding boxes instead.
Frame sequences (100 ms for 3 s, light and dark, 1440 and 390; 500-1000 ms long sequences for Slow 4G and Fast 3G): `ui-overhaul/screens/13-loading-and-skeletons/13-coldload-sheet-*.png`; single frames `13-coldload-slow4g-light-1440x900-t15000..t18000.png`.

## Findings

### F-13-01 Returning users see "No projects yet / Add project" until the shell snapshot arrives

- Severity: P1
- Surface: all (web and desktop sidebar; mobile web shows a blank pane instead)
- Evidence: `components/Sidebar.tsx:3236-3262` renders the empty block whenever the lists are empty, with no `bootstrapped` check. `routes/_chat.index.tsx:83-84` already says "A pending environment cannot prove the workspace is empty". Frames: `13-coldload-slow4g-light-1440x900-t16000.png` (sidebar says "No projects yet" 15.5 to 18.3 s on Slow 4G), `13-prs-fast3g-light-1440x900-s1.png` (PR skeleton next to "No projects yet"). Duration of the lie, empty sidebar to first row: warm normal 103 ms (flashes on every reload), cold normal 290-340 ms, cold Slow 4G 2.76 s, cold Fast 3G 4.4 s.
- Current: the shell mounts with an empty store and the sidebar tells a user with 142 threads they have no projects, with a CTA.
- Proposed: in `Sidebar.tsx` read `useAllEnvironmentShellsBootstrapped()` (`state/entities.ts`). While false and there are no rows, render `SidebarListSkeleton`: 6 rows at the real row pitch (83 px measured), each = `Skeleton shape="block" className="size-[18px]"` (monogram tile) + `Skeleton shape="pill" className="h-3 w-24"` (project line) + `Skeleton shape="pill" className="h-3.5 w-3/4"` (title), wrapped in one `role="status" aria-label="Loading threads"` container; show the empty block only when bootstrapped.
- DNA: DNA-P3, DNA-M9 (UI truthful); DRIFT-12 spirit
- Effort: S
- Risk: `Sidebar` browser tests that assert the empty state need `bootstrapped` set; no test covers the pre-bootstrap frame.
- Upstream-eligible: yes (fix-shaped). Rebase onto #24865 hunks in `Sidebar.tsx:3136-3174` (shelf headers) is trivial.
- #24865: not addressed

### F-13-02 React mount removes the splash before there is anything to show; the page goes blank

- Severity: P1
- Surface: all (worst on mobile web and first visit on any device)
- Evidence: `components/onboarding/FirstRunGate.tsx:174-175` returns `null` while `decision !== "app"`; `ThreadRouteView.tsx:170` leaves `view = null` until the shell lists the thread. `#boot-shell` (`index.html:469`) lives inside `#root`, so `createRoot().render` replaces it. State log (`splash>blank>shell`): first visit normal 202 to 475 ms, Slow 4G 15,466 to 18,494 ms (3.0 s of white), Fast 3G 26,382 to 31,120 ms. 390x844 returning user: blank from 15,485 to 18,107 ms (Slow 4G), no sidebar to hide it (`13-coldload-sheet-prod-slow4g-light-390x844-long.png`, frames 16-18 s).
- Current: logo, then nothing, then app.
- Proposed: keep the boot shell on screen until the first real paint: render the same markup as a `BootShell` component (extract from `index.html`) in the FirstRunGate pending branch and in `ThreadRouteView` while `renderState === "loading"` (and `ChatIndexRouteView` pending branch, `_chat.index.tsx:84`), using `var(--boot-background)`/`--boot-foreground` already set by the boot script. Do not add motion.
- DNA: DNA-P3, DNA-ID3
- Effort: S
- Risk: `FirstRunGate` has no component test for the pending frame; `themeBoot.test.ts` only covers the script.
- Upstream-eligible: yes (BORROW idea of #23392 "starting splash instead of nothing", web side)
- #24865: not addressed (touches `index.html` font stack only)

### F-13-03 "Still connecting / Reload" fires on a fixed 4 s timer and is wrong on slow links

- Severity: P1
- Surface: all
- Evidence: `FirstRunGate.tsx:31` `FIRST_RUN_DECISION_TIMEOUT_MS = 4_000`, effect at `:150-155`; screen at `:200-230`. First visit on Fast 3G: blank at 26,382 ms, "Still connecting" at 30,381 ms, shell at 31,120 ms (3 of 3 runs). `13-stillconnecting-fast3g-light-1440x900.png`. The screen clears itself when the shell arrives, so the message was false; its only button reloads the page and restarts a 2.7 MB download. No spinner, no connection phase.
- Current: any connect slower than 4 s after settings hydrate reads as a failure.
- Proposed: derive the stall from the environment connection phase (`environmentCatalog.stateAtom`, phases `connecting|reconnecting|error`), not a timer. While `connecting`: boot shell + `Spinner size="sm" tone="muted"` and "Connecting…" (U+2026). Only phase `error`/`offline` shows "Could not connect" with `Button` "Try again" calling `retryEnvironment` (same call as `useSystemComposerBanners.tsx:107`) rather than `window.location.reload()`. If a timer is kept, 20 s and only as a hint line under the spinner.
- DNA: DNA-P3, DNA-M9, DNA-V3
- Effort: M
- Risk: `firstRun.logic` tests cover the `timeout` transition; update them.
- Upstream-eligible: yes
- #24865: not addressed

### F-13-04 Splash: 114 kB PNG logo, white for 1.4 s on Slow 4G, then a static logo for 13+ s with no status

- Severity: P1 (Slow 4G and worse), P3 at normal speed
- Surface: all
- Evidence: `index.html:469-471` loads `/apple-touch-icon.png` (180x180, 16-bit RGBA, 113,787 B) shown at 64x64. It competes with JS for the same 200 kB/s: first logo pixels at ~1,420 ms and full at ~1,950 ms (`13-coldload-sheet-prod-slow4g-light-1440x900.png`), then the same frame until 15.5 s. A 128 px resize is 26 kB, 64 px is 8.7 kB (sips). Shell paint is bandwidth-bound (see F-13-09).
- Current: no indication that anything is happening, no hint it is a slow connection.
- Proposed: (1) replace the `<img>` with inline SVG of the T3 mark (about 1-2 kB, `fill: var(--boot-foreground)`-aware or the existing blue tile), keep the PNG only for `apple-touch-icon`. (2) Add `<p id="boot-shell-status" hidden>` under the logo; the boot script reveals it at 4 s with static text "Still loading. Slow connection?" (no animation, 12 px, `color: inherit; opacity: .6`), and removes it on mount. (3) Optional M: paint a static HTML skeleton of the shell frame (256 px sidebar column, 52 px header, 736 px composer slab; theme colours from the boot palette) instead of the centred logo, so the layout is visible at HTML arrival (about 0.2 s vs 15.5 s).
- DNA: DNA-ID3 (obvious, plain-spoken), DNA-M2 (no loops), DNA-P3
- Effort: S for (1)+(2); M for (3)
- Risk: `themeBoot.test.ts` asserts splash palette parity; the skeleton must use the same variables.
- Upstream-eligible: yes for (1)+(2); (3) as a follow-up
- #24865: not addressed (adds "Inter Variable" to the boot `font-family` only)

### F-13-05 Usage page states three different false things while loading

- Severity: P1
- Surface: all
- Evidence: cold `/usage`: 266 ms "Connect an environment to see limits." (`UsagePage.tsx:511-517`, `environments.length === 0` before the catalog is ready), then "No provider on the selected environments reports subscription limits." (`UsageLimitsPooled.tsx:618-622`), then the real limits at 543 ms (normal) and 964 ms (WS +281 ms). `13-usage-open-fast3g-light-1440x900-s0.png`. The Cost/Tokens tabs have a good skeleton (`UsagePage.tsx:1488`); Limits has none.
- Proposed: gate the first message on `useEnvironments().isReady`; in `UsageLimitsSection` show a limits skeleton (one `Skeleton className="h-24"` card per provider row, inside one status container) until the first provider status push; only then allow the "No provider..." sentence.
- DNA: DNA-P3, DNA-M9
- Effort: S
- Risk: no test covers the pre-ready frames of `UsagePage`.
- Upstream-eligible: yes
- #24865: not addressed

### F-13-06 Diff panel shows plain "Loading code..." (no skeleton, no headers) while the highlight workers boot: 10.4 s on Slow 4G

- Severity: P1
- Surface: all (web and desktop)
- Evidence: `DiffWorkerPoolProvider.tsx:96-126` (`DiffWorkerReady`) hides all children until `workerPool.initialize()` resolves. The worker is 10.5 MB raw / 1.89 MB gz (`dist/assets/worker-*.js`). 220-file diff (own probe repo): normal 414 to 616 ms; Slow 4G skeleton 709 ms, then 12 px centered text from 2,523 to 12,881 ms, then headers. `13-diff220-slow4g-light-1440x900-s1.png`. Stats (+5.5k) and file list are already known from the preview while the text is shown. The skeleton disappears and is replaced by smaller text.
- Proposed: (1) minimal: render `DiffPanelLoadingState label="Loading syntax highlighter…"` (skeleton, `DiffPanelShell.tsx:92`) in place of the text so the layout does not collapse. (2) preferred: render collapsed file headers and stats before the pool is ready and attach highlighting when it is (needs a check that `@pierre/diffs` accepts `workerPool={undefined}` without the blank-first-render retry the comment describes). (3) `modulepreload`/prefetch the worker when the thread has changes or on hover of the diff toggle.
- DNA: DNA-P3, DNA-M1 (no layout collapse)
- Effort: S for (1); M for (2)
- Risk: `DiffWorkerPoolProvider` and diff browser tests; (2) needs a spike.
- Upstream-eligible: yes for (1)
- #24865: not addressed

### F-13-07 "Load earlier turns" failure prints the raw transport error with the request URL and cursor

- Severity: P1
- Surface: all
- Evidence: `packages/client-runtime/src/state/threads.ts:70-75` `formatHistoryError` returns `error.message`; `MessagesTimeline.tsx:1195-1199` prints it in a 12 px line. Aborting `/history` gives "Failed to fetch remote environment endpoint http://localhost:5799/api/orchestration/threads/mcp%3A…/history?cursor=eyJ2Ijox… (HttpClientError: Transport error (GET …))", clipped under the details card. `13-history-error-light-1440x900.png`. The button stays labelled "Load earlier turns" (no explicit retry).
- Proposed: `formatHistoryError` returns "Could not load earlier turns. Check your connection and try again." (log the real error with `console.warn`); in `TimelineHistoryControl` render the error as `text-destructive`, `break-words`, and relabel the button "Try again" while `error !== null`. Add `Spinner size="xs"` before "Loading earlier turns…" while loading (DNA-M6; the label swap happens at 42 ms, then 671 ms later on Fast 3G the list grows with scroll position kept: that part is good). Lead: area 03 proposes a scroll sentinel; keep the button for keyboard.
- DNA: DNA-V3, DNA-M6
- Effort: XS
- Risk: any test matching the raw message; none found.
- Upstream-eligible: yes
- #24865: not addressed

### F-13-08 Thread timeline has no loading state: a blank div, and the only cue is a small banner after 400 ms

- Severity: P1 (remote and slow links), P2 locally (switch to an unvisited thread: 148 ms local, 341 ms Slow 4G, 736 ms Fast 3G)
- Surface: all
- Evidence: `MessagesTimeline.tsx:1070-1076` renders `<div data-timeline-loading="true" className="h-full min-h-0 bg-background"/>`; `ChatComposer.tsx:666` `useDelayedStatus` shows "Loading messages..." (`threadSync.ts:26`) only after 400 ms (`delayedStatus.ts:3-4`); send is disabled with reason "Messages loading" (`ChatView.tsx:~3570`). Fast 3G switch: blank 88 to 736 ms; banner at 460 ms; "Syncing" until 1,902 ms (`13-threadswitch-fast3g-loading-light-1440x900.png`). Leads: F-03-03 (opens blank under "Load earlier turns") and F-03-04 (2.4 s block), issue #24192 (mobile 5 s blank).
- Proposed: in that branch render `ThreadTimelineSkeleton` after the same 400 ms delay (reuse `useDelayedStatus`): lane `chat-content-lane`, a right-aligned user bubble `Skeleton className="h-9 w-2/5 ml-auto"`, then two assistant blocks of three `Skeleton shape="pill" className="h-3.5"` lines (100/92/60%), all in one container. Keep the banner text but make it visible only for `syncing`, not `loading`. Pairs with F-13-11.
- DNA: DNA-P3, DNA-ID3
- Effort: S
- Risk: `MessagesTimeline.browser.test.tsx` asserts the placeholder; add a case.
- Upstream-eligible: yes
- #24865: not addressed (its `MessagesTimeline.tsx:1085` hunk is the empty-state copy only)

### F-13-09 Startup is bandwidth-bound by 2.47 MB gz JS (217 requests); preloading makes it worse

- Severity: P2
- Surface: all
- Evidence: shell at 15.5 s on Slow 4G equals 2.47 MB / 200 kB/s = 12.4 s plus serial hops (HTML, `index`, `main`+`utils` 717 kB, session fetch, `_chat` wave of 80 chunks / 1,139 kB, shell+snapshot fetch). Experiment: injecting `<link rel="modulepreload">` for `main`, `_chat`, `ChatMarkdown`, `composerPlaceholder`, `useTimelineFollow`, `PanelLayoutControls` gave shell 16,129 ms (vs 15,510) and FCP 4,468 ms (vs 392): negative result, do not do it. Startup chunks that the first paint does not need: `getDiffFileInput`/`FileDiff`/`renderFileChildren`/`DiffCommentAnnotation`/`DiffWorkerPoolProvider` (~93 kB gz), `ThreadTerminalDrawer` 32 kB, `ScheduledTasksSettings`+`settingsLayout`+`settingsSearch`+`UsageLimits` (~52 kB), PR modules (~25 kB), `AttachmentImage` 47 kB.
- Proposed: make those lazy where they are statically imported by the `_chat` chain (`UserMessageContextChips.tsx:9` and `StyledDiffCodeView.tsx:13` import `DiffWorkerPoolProvider` statically); confirm with `.vite/manifest.json` `imports` of `_chat`. Target: startup <= 2.2 MB gz, shell <= 13.5 s on Slow 4G. Pair with F-13-04(3) so the shell is visible regardless.
- DNA: DNA-P1 (performance)
- Effort: L (analysis M, edits S each)
- Risk: React Compiler coverage test, route-level lazy loading creating new waterfalls; measure with the matrix scripts in `/tmp/t3code-pw/a13-*.mjs` (not committed).
- Upstream-eligible: yes, as separate small PRs per chunk
- #24865: not addressed (adds an Inter font import, see Needs deeper look)

### F-13-10 The "Loading/Syncing messages" banner moves the whole composer 32 px, twice

- Severity: P2
- Surface: all
- Evidence: composer shell 144 px tall without the banner, 176 px with it; top 736 to 704 when it appears (400 ms after switch) and back 704 to 736 when it clears (1.9 s on Fast 3G). Layout-shift entries 0.0044 each (`ChatComposer.tsx:2598-2600, 3488-3494`; `ComposerBanner.Attachment` is inside the bottom-anchored shell). Same 34 px jump for the "is reconnecting" banner (top 736 to 702, `useSystemComposerBanners.tsx:208`).
- Proposed: mount transient status rows as an absolutely positioned strip above the composer (`absolute bottom-full inset-x-0`, inside `ComposerBanner.Attachment`) that does not contribute to shell height, or reserve the 32 px slot while `threadSyncPhase !== null` is possible. Keep warning/error banners in flow (they are actionable).
- DNA: DNA-M3 (nothing that reflows), DNA-K6 (composer surface intact)
- Effort: S
- Risk: `ComposerBannerStack` tests and the composer-seam CSS (`--spacing-composer-seam`); timeline bottom inset uses the shell height.
- Upstream-eligible: yes
- #24865: not addressed (it edits composer controls, not the banner stack)

### F-13-11 `Skeleton` animates every bar (28 CSS animations on one settings page), against its own design comment

- Severity: P2
- Surface: all
- Evidence: `ui/skeleton.tsx:5` puts `motion-safe:animate-skeleton` on every `Skeleton`; `index.css:290-296` says "one opacity pulse per container". `document.getAnimations()`: Source Control skeleton 28 + 1 spin, diff panel 22, `DiffFileLoadingBoundary` 20 (stays mounted while scrolling 220 files), reduced motion 0. The PR ghosts (`PullRequestGhosts.tsx:57,135,379,396,422`) animate the container once (1 animation) and are the model.
- Proposed: remove the animation class from `skeletonVariants`; add `SkeletonGroup` (`div`, `role="status"`, `motion-safe:animate-skeleton`) in `ui/skeleton.tsx` and wrap the six importers (`DiffPanelShell.tsx:92`, `DiffFileLoadingBoundary.tsx:19`, `SourceControlSettings.tsx:429`, `UsagePage.tsx:1488`, `CloudEnvironmentConnectList.tsx:57`, `MobileClientsUserProfilePage.tsx:66`). Fold `PullRequestGhosts.GhostBar` into `Skeleton`.
- DNA: DNA-M2, DNA-P1, DNA-K5 (keeps the keyframe)
- Effort: S
- Risk: visual parity (a container pulse also dims non-skeleton children: keep labels like "Totals" outside the group); no tests.
- Upstream-eligible: yes
- #24865: not addressed

### F-13-12 Spinners and skeletons appear and vanish instantly everywhere except thread sync

- Severity: P2
- Surface: all
- Evidence: `delayedStatus.ts` (400 ms show, 400 ms minimum) has one consumer (`useDelayedStatus`, `ChatComposer.tsx:666`). Diff skeleton at normal speed is on screen for 152 ms (122 to 274 ms), the usage and file-preview spinners are immediate (`fileSurfaceChrome.tsx:126`, `FilePreviewPanel.tsx:209,246,1386`). 49 `<Spinner>` sites, 8 `Skeleton` users, no delay anywhere else.
- Proposed: add `useDelayedFlag(pending, { showAfterMs: 150, minVisibleMs: 300 })` in `hooks/` (generalise `createDelayedStatus` with those parameters) and use it in `DiffPanelLoadingState` callers, `FileSurfaceLoading`, `SourceControlSettings`, `UsageSkeleton`. Keep inline button spinners immediate (they confirm a click).
- DNA: DNA-M4 (duration ladder), DNA-P3
- Effort: S
- Risk: tests that wait for the skeleton; use `vi.waitFor`.
- Upstream-eligible: yes
- #24865: not addressed

### F-13-13 Route transitions give no pending feedback while a chunk loads (up to 1.9 s on Fast 3G)

- Severity: P2
- Surface: web, desktop
- Evidence: `router.ts` sets only `defaultPreload: "intent"`; the only `pendingComponent` is `routes/pair.tsx:30`. Click Settings (cold chunk): modal at 682-703 ms on Slow 4G, 1,894 ms on Fast 3G; Settings > Providers 1,101 ms, Appearance 1,189 ms, Usage 1,110 ms (Fast 3G); the old page just stays. Pull Requests is fine (ghost at 417/819 ms).
- Proposed: `createRouter({ defaultPendingMs: 200, defaultPendingMinMs: 300 })` plus a `useNavigationPending(to)` hook (`useRouterState`) that swaps the footer gear/usage/PR icon in `SidebarChromeFooter` for `Spinner size="sm"` and sets `aria-busy`. No full-page pending component.
- DNA: DNA-P3, DNA-M6
- Effort: S
- Risk: icon swap flicker on warm chunks; the 200 ms floor avoids it.
- Upstream-eligible: yes
- #24865: not addressed

### F-13-14 Highlighted code blocks render as empty boxes until Shiki loads

- Severity: P2
- Surface: all
- Evidence: `ChatMarkdown.tsx:1506-1512` Suspense fallback is `<pre className="invisible" aria-hidden>`. Measured placeholder to coloured text: 240 ms normal, 1,243 ms Slow 4G (placeholder 18,260, ready 19,503). `13-threadswitch-fast3g-loading-light-1440x900.png` shows the empty 160 px box.
- Proposed: fallback `<pre {...props}>{children}</pre>` visible (same text, so no height change); the highlight upgrade only recolours. If the flash of unhighlighted colour is the concern, use `text-muted-foreground` on the fallback.
- DNA: DNA-P3, DNA-K12
- Effort: XS
- Risk: `ChatMarkdown.browser.test.tsx` expectations on the placeholder.
- Upstream-eligible: yes
- #24865: not addressed (its `ChatMarkdown.tsx:1590` hunk is text opacity)

### F-13-15 Reconnect banner is a static Wi-Fi-off icon with no activity cue or countdown

- Severity: P2
- Surface: all
- Evidence: forced WS outage (own context): banner "MacBook Pro is reconnecting" appears 3,056 ms after the drop (2 s grace, `ChatView.logic.ts:114`), `spin: 0`, no attempt or retry text, then clears at 13,355 ms (outage ended 8,000 ms; backoff added 5 s). `ConnectionDiagnosisDetails.tsx:66-75` already has `RetryCountdown` and supervisor state has `retryAt`/`attempt` (`connection/model.ts:176-179`), used only in Settings. `13-stalled-load-both-light-1440x900.png`.
- Proposed: in `useSystemComposerBanners.tsx:213-217`, when `environmentReconnecting` use `<Spinner size="xs"/>` as the icon and set description to `<RetryCountdown retryAt/>` ("retrying in 12s", plus "attempt 3" when >1); keep `WifiOffIcon` only for phase `offline`/`error`.
- DNA: DNA-M9, DNA-P3
- Effort: S
- Risk: banner tests; countdown ticks 1 Hz only while mounted.
- Upstream-eligible: yes
- #24865: not addressed

### F-13-16 Hand-rolled `animate-spin` / `animate-pulse` bypass the shared Spinner

- Severity: P2
- Surface: all
- Evidence: `ThreadRelationshipsControl.tsx:633,672`, `ThreadLineageWorkflowRow.tsx:161` (raw `animate-spin` on `LoaderCircleIcon`: spins under reduced motion, no off-screen pause); `TimelineAssistantRows.tsx:118` `animate-pulse` (unstepped infinite loop, DNA-M2). Known as DRIFT-8; PR #22100 (+6/-5, ADOPT) fixes the three spinners.
- Proposed: adopt #22100 (swap to `<Spinner size="xs">`); replace the fork icon pulse with the shared `animate-status-pulse` (stepped) or a `Spinner`.
- DNA: DNA-M5, DNA-M6, DNA-M2
- Effort: XS
- Risk: none known; visual only.
- Upstream-eligible: yes (credit `saphid`)
- #24865: not addressed (touches `ThreadRelationshipsControl.tsx` for other reasons; rebase)

### F-13-17 220-file diff: no total or progress, the list grows ~224 px per scroll

- Severity: P2
- Surface: all
- Evidence: own 220-file repo, Uncommitted scope: 20 skeleton elements sit at the list end (`DiffFileLoadingBoundary.tsx:18-24`, max 4 headers, label "Loading diff…"); 12 wheel events of 6,000 px grew `scrollHeight` 1,156 to 3,844 (about 224 px each), so reaching file 220 needs ~25 wheel events; End/scrollbar drag cannot jump. Normal speed throughout, so this is not a network effect.
- Proposed: label the sentinel with the real remainder ("Loading 188 more files…", count already in `count` prop) in `text-xs text-muted-foreground`, and raise the batch (`loadNextFiles`) to fill `rootMargin` of 2 viewport heights. Optional: render all collapsed headers from `lazySource.files` at once (headers need no patch).
- DNA: DNA-P3
- Effort: S (label), M (headers)
- Risk: `useReviewFilePatches` request volume; area 05 owns diff behaviour.
- Upstream-eligible: yes (label)
- #24865: not addressed

### F-13-18 Command palette results re-sort twice after message search returns

- Severity: P2
- Surface: web, desktop
- Evidence: typing "capitalize": at 352 ms the title match is row 0 with "Searching messages…" (footer, no spinner, `CommandPalette.tsx:2695`); at 473 ms message hits arrive and the same item drops to row 4 (highlight index 0 to 4, "Long conversation stress test" on top); at 978 ms the list re-ranks back (index 0). Fast 3G WS: 1,058 and 1,561 ms.
- Proposed: hold the previous ranking until the message phase settles, then re-rank once: merge `deferredQuery` phases in `CommandPalette.logic.ts` so message hits append below title matches (stable order), as the footer already implies; add `Spinner size="xs"` next to "Searching messages…".
- DNA: DNA-K14 (keep keyboard-first), DNA-P3
- Effort: M
- Risk: `CommandPalette.logic.test.ts` ordering tests; needs a code trace of which stage reorders (not done).
- Upstream-eligible: yes
- #24865: not addressed

### F-13-19 Provider "Checked N ago" control: staleness hidden on phone widths, header resizes on refresh

- Severity: P2
- Surface: web (390 px), desktop narrow panes
- Evidence: `ProviderSettingsPanel.tsx:1010-1026`: the label is `hidden sm:inline`, so at 390 px only a 28 px icon shows (`13-provider-checked-light-390x844.png`); the label swaps "Checked just now" (132 px) for "Refreshing providers" (150 px) so neighbours ("Update all") shift 18 px. Refresh takes 1.3 s local, 4.5 s Fast 3G; `aria-busy` and spinner are correct.
- Proposed: always render the label (`text-2xs`) in a second line or tooltip + `aria-label="Refresh provider status, checked 3 minutes ago"` on mobile; give the button `min-w-[9.5rem]`-equivalent token via a fixed `w-36` wrapper so the swap does not resize.
- DNA: DNA-X4, DNA-M3
- Effort: XS
- Risk: none; visual.
- Upstream-eligible: yes
- #24865: not addressed

### F-13-20 Attachment upload progress is a 10 px percentage with no bar

- Severity: P3
- Surface: all
- Evidence: `ComposerAttachmentStrip.tsx:259-264`: `text-3xs` label on `bg-background/85` strip, 5 % steps (`attachmentUploadQueue.ts:288-300`); a 1.4 MB image on Slow 4G went 0 % to 100 % over 15.8 s with 22 updates (`13-upload-progress-slow4g-light-1440x900-s1.png`). "0 %" also shows before the job starts (`ready ? ... : supportsAttachmentUploads`). Send is correctly blocked ("Attachment still uploading").
- Proposed: add a 2 px determinate bar at the thumbnail bottom (`bg-primary`, `origin-left`, `transform: scaleX(progress)`, no layout), keep the percentage as `sr-only` live text; show no number until the first progress event.
- DNA: DNA-M3, DNA-P3
- Effort: S
- Risk: `ComposerAttachmentStrip` visual tests none.
- Upstream-eligible: yes
- #24865: not addressed

## Edge-case results (matrix)

Data: empty list (fresh first run) code-read, F-13-01 applies; one item N/A; 100+ items: PASS (142 threads, shell snapshot 21 kB gz, `olderSettled` cut at 25); 10,000+ items NOT TESTED (no fixture; `LegendList` code-read); long/unicode/RTL titles N/A (area 02).
Content: 200-file diff FAIL (F-13-06, F-13-17); 5k-line diff NOT TESTED (area 05); 1 MB tool output see leads F-03-03/F-03-04 (confirmed blank then 2.4 s block via "Load earlier turns"); images in messages code-read only: `ChatMarkdownMedia.tsx:142` reserves a 16:9 slot that is not the image ratio (possible shift, not measured).
Network/agents: relay disconnected / server restarted under client: WS closed by the proxy, banner at 3.1 s, recovery 5 s after the outage ended, FAIL (F-13-15); stream stalls: black-holed WS plus aborted HTTP kept "Loading messages…" for 19.3 s then "is reconnecting" (PASS, honest); stall on boot FAIL (F-13-03); version mismatch NOT TESTED; reconnect after sleep NOT TESTED (no sleep on host).
Viewport: 1440x900 and 390x844 measured; 1280x720, 1024x640, 800x600, 3440x1440 NOT TESTED (loading frames are layout-independent apart from F-13-02 mobile); mobile keyboard NOT TESTED; zoom NOT TESTED.
Preferences: light and dark frames PASS (no wrong-theme frame, boot script, confirms wave 1 F-07); reduced motion PASS for `Skeleton` and `Spinner` (0 animations), FAIL for F-13-16; system switching, themes, high contrast N/A.
Lifecycle: first ever launch FAIL (F-13-02, F-13-03); corrupted settings: "Could not read settings" unrecoverable, see F-07-13 (not re-reported); launch after update (chunk 404): one reload by `chunkReloadGuard`, then "Something went wrong. Failed to fetch dynamically imported module: <url>" (raw text, area 12); server already running PASS.

## Already good (do not touch)

- Warm-cache boot: shell 110 ms, content 223 ms at normal; 700 ms on Slow 4G (HTML revalidation only, `apps/server/src/http.ts:641-657` immutable assets).
- Theme boot script: no wrong-theme or wrong-appearance frame in 8 light/dark sequences; background paints from the first frame.
- `PullRequestGhosts` list and detail skeletons (one container animation, real row geometry); `UsageSkeleton` Cost/Tokens (real labels, same sections); `SourceControlSectionSkeleton` (2 rows vs 2-4 final).
- `createDelayedStatus` 400/400 ms and the held remembered timeline (`peekRememberedThreadTimeline`) on revisit; "Syncing" is honest (ends when sync ends).
- Thread switch to an unvisited thread: 148 ms local, header and breadcrumb correct immediately, no stale content from the previous thread.
- "Load earlier turns": label flips at 42 ms, scroll position kept (`maintainVisibleContentPosition`), 671 ms on Fast 3G.
- Provider refresh: `aria-busy`, disabled while running, spinner via `RefreshIcon` (visibility-aware).
- Stalled thread load is not an endless spinner: becomes the reconnecting banner at 19 s.
- `useDelayedStatus`, `Spinner` visibility gating, `motion-safe:` on skeleton and spinner (0 animations under reduced motion).
- Debug path: `showBootError` ("T3 Code could not load.", Reload) when the entry chunk fails.

## Incomplete

- No real Electron or device run (area 14 and 15 own those); #23392 (desktop starting splash, BORROW) not exercised.
- Production numbers use a local proxy over the repo's `dist`, gzip only; real server compression (brotli?) unverified; WS not bandwidth-shaped.
- 2 of ~9 throttled or blocked first-visit runs ended on "Pair with this environment" instead of the app (cause not isolated; possibly the dev session cookie under concurrent agents); not counted as a finding.
- Mobile image-in-message and `ChatMarkdownImage` shift not measured; PR page content-arrival re-sort (first row #20990 to #22906 between 5.1 and 6.9 s) not investigated.
- File preview, image preview and Settings > Connections loaders were read, not frame-captured. Warm Fast 3G n=1.
- Probe leftovers: project `a13-diffrepo` (with its thread, one Haiku turn used) removed with `project remove --force`; `/tmp/t3code-a13-diffrepo` deleted; the :5799 proxy stopped by its captured PID.

## Needs deeper look

1. #24865 adds `@fontsource-variable/inter` (`main.tsx`) and "Inter Variable" in the boot `font-family`: on Windows/Linux the first paint uses the fallback face and swaps when the woff2 arrives (new CLS and a text reflow on cold loads). Verify after merge; consider `font-display: optional` or a metric-adjusted fallback `@font-face` plus preload.
2. `vite/warmBundledDev.ts` `STARTUP_LAZY_ENTRIES` omits `src/routes/_chat.draft.$draftId.tsx`, the usual landing after `/` (`_chat.index.tsx` calls `handleNewThread`); bundled dev will compile it on first request. Code-read only (no bundled dev run).
3. Bad thread link (`/<env>/mcp:<unknown>`): blank pane 300 ms, silent redirect to `/` then to a new draft, no "not found" message (area 10).
4. Aborted `_chat` chunk: "Something went wrong. Failed to fetch dynamically imported module: <url>" prints the asset URL (area 12).
5. Loading copy still uses ASCII `...` in 56 strings versus 71 with U+2026 (`threadSync.ts:26`, `DiffWorkerPoolProvider.tsx:123`, `DiffPanel.tsx:985-1013`, ...); DRIFT-14, worth a lint rule.
6. Confirm F-13-18 cause (which phase reorders) and F-13-06(2) feasibility with the `@pierre/diffs` authors/source.
