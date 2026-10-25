# Area 22: performance-feel

Scope: perceived responsiveness AFTER load. Cold load is area 13 (F-13-02, F-13-04, F-13-09 not redone). Script: `ui-overhaul/screens/22/measure.mjs` (+ `profile.mjs` CPU attribution, `detached.mjs` retained-DOM census). Raw medians: `screens/22/results-{dev-1x,prod-1x,prod-4x,send,profile-dev}.json`. No screenshots saved (numbers only; nothing withheld).

## Method and caveats

- Host: Apple M5 Max, headless Chromium (Playwright), 1440x900, DPR 1, dark. Headless frames run on a virtual 60 Hz clock, so every "key to paint" has a ~16.7 ms floor and a 120 Hz display would read lower. Shared machine (WindowServer 33 %, other apps; load average about 3.5), so absolute values carry maybe +/-15 %.
- Two builds: **dev** = live Vite server :5733 (unbundled, React dev, `jsxDEV`: use for relative attribution only); **prod** = `apps/web/dist` (built 14:02) behind a throwaway static+proxy script on :5822 (gzip, immutable assets; stopped by its captured PID). Prod is the number to quote. Prod 4x = prod with CDP `Emulation.setCPUThrottlingRate(4)` (stand-in for a mid-range laptop, not a real device).
- Medians of 3 runs, each run a fresh browser context and page load (send: n=1, see below). Method per metric: key-to-paint = `keydown.timeStamp` to the first MessageChannel task after rAF (plus Event Timing and CDP `Performance.getMetrics` TaskDuration net of idle); switch/open = input event timeStamp to a DOM milestone seen by MutationObserver + rAF (about 1 frame resolution); long tasks = `longtask` observer (>50 ms); scroll = rAF gaps over wheel input (`mouse.wheel` every 12 ms); memory = two forced GCs then CDP metrics; style/layout = CDP counters.
- Fixture limits: 142 threads (124 active rows mounted), not 200+; I did not add threads to shared state. 10,000 threads not tested. Visiting threads advanced their `lastVisitedAt` (read state), which cannot be undone.
- Live agent turns: 2 (Claude Haiku 5.5, tiny prompt) in one probe thread created from a draft; the thread was archived afterwards (CLI has no delete; it stays in Archived as "Reply to A22 Perf Probe ..."). No message was sent into seed or stress threads. Drafts typed in seed/stress composers were never sent and live only in throw-away browser contexts.

## Results (medians of 3; ms unless noted)

### Composer typing (key to paint, 40 keys at 70 ms spacing; 100 keys at 33 ms = held key)

| Case                                  | prod 1x p50 / p95 / max | main-thread ms per key (script) | prod 4x p50 / p95 | held key p50 / p95 (1x) | dev p50 / p95 |
| ------------------------------------- | ----------------------- | ------------------------------- | ----------------- | ----------------------- | ------------- |
| empty draft                           | 16.0 / 22.0 / 36        | 7.9 (5.2)                       | 18.9 / 25.5       | 9.6 / 17.6              | 17.9 / 22.4   |
| 200 chars                             | 15.8 / 22.7 / 24        | 7.6 (5.4)                       | n/m               | 9.5 / 17.4              | 18.7 / 24.4   |
| 2,000 chars                           | 15.7 / 22.0 / 23        | 6.6 (4.5)                       | 18.9 / 22.5       | 9.8 / 17.1              | 18.6 / 24.5   |
| 2,000 chars pasted multi-line         | 16.9 / 23.5 / 25        | 7.9 (5.5)                       | n/m               | 9.3 / 17.1              | 17.3 / 24.4   |
| 10,000 chars                          | 15.1 / 21.7 / 24        | 6.9 (4.4)                       | n/m               | 9.2 / 17.0              | 19.6 / 25.2   |
| 10,000 pasted multi-line              | 18.0 / 23.6 / 25        | 9.2 (6.3)                       | 23.9 / 31.9       | 9.3 / 16.7              | 17.9 / 26.0   |
| 50,000 pasted multi-line              | 16.4 / 22.2 / 27        | 8.1 (5.7)                       | n/m               | 9.2 / 17.2              | 17.6 / 24.4   |
| 2,000 in the 60-run thread            | 17.5 / 22.5 / 25        | 7.9 (5.2)                       | 19.5 / 22.2       | 9.5 / 17.3              | 18.1 / 24.5   |
| 2,000 in the 1 MB thread (not loaded) | 16.7 / 22.7 / 23        | 8.4 (5.5)                       | 19.3 / 22.7       | 9.6 / 16.9              | 18.4 / 25.0   |

Paste time (insert to second rAF): 56-75 ms for 200 to 50,000 chars (prod 1x), 96-129 ms at 4x. 1 layout per key, 0.3 ms. Zero long tasks except one 4x outlier. Typing is one frame regardless of draft length or thread weight.

### Thread switch (sidebar click; Codex seed, 60-run, 1 MB threads)

| Transition                                     | prod 1x: click to header / first rows | long tasks (max) | click event duration | prod 4x: header / rows | 4x long task (max) | 4x click event | dev 1x header / long task |
| ---------------------------------------------- | ------------------------------------- | ---------------- | -------------------- | ---------------------- | ------------------ | -------------- | ------------------------- |
| seed to 60-run (first visit)                   | 32 / 84                               | 0                | 56                   | 150 / 346              | 151                | 200            | 86 / 85                   |
| 60-run to 1 MB (first visit; 0 rows, F-03-03)  | 27 / n/a                              | 0                | 40                   | 108 / n/a              | 109                | 128            | 92 / 90                   |
| 1 MB to seed (revisit)                         | 44 / 44                               | 0                | 64                   | 125 / 125              | 134                | 160            | 101 / 105                 |
| seed to 60-run (revisit)                       | 47 / 47                               | 0 (1 run: 53)    | 64                   | **237 / 237**          | **248**            | **280**        | 138 / 146                 |
| 60-run to 1 MB (revisit)                       | 21 / n/a                              | 0                | 40                   | 93 / n/a               | 105                | 120            | 80 / 87                   |
| 1 MB to "Explain the repository" (first visit) | 27 / 63                               | 0                | 40                   | 106 / 272              | 112                | 128            | 76 / 76                   |

Loading marker (`[data-timeline-loading]`) seen on every first visit (28-84 ms at 1x; see F-13-08), never on revisits.

### Opening panels

| Action                                                   | prod 1x | prod 4x   | dev 1x    |
| -------------------------------------------------------- | ------- | --------- | --------- |
| Settings, first open (gear click to dialog with content) | 73      | 297       | 340       |
| Settings, reopen                                         | 61      | 194       | 209       |
| Settings nav to Appearance / Providers (chunk first use) | 89 / 82 | 336 / 298 | 186 / 164 |
| Settings close (Escape to gone)                          | 189     | 231       | 200       |
| Command palette, first / second open (Cmd+K to rows)     | 54 / 41 | 214 / 165 | 110 / 152 |
| Project filter popover                                   | 32      | 85        | 67        |
| Diff panel shell (Changes click, 2-file diff)            | 15      | 52        | 40        |
| Diff panel, file headers listed                          | 454     | 496       | 446       |
| Diff, "Expand all" to diff body                          | 12      | 49        | 35        |
| Diff panel reopen to body                                | 17      | 78        | 64        |

In every Settings/palette row the dialog and its content appear in the same frame (`visible` = `filled`): no shell, no skeleton, no pressed state while it mounts.

### Command palette typing (142 threads + message search; "long conv" / "capitalize")

|                                       | prod 1x             | prod 4x               | dev 1x                |
| ------------------------------------- | ------------------- | --------------------- | --------------------- |
| key to first list change p50          | 20 / 23             | 47 / 50               | 42 / 57               |
| key to paint p50 / max                | 20 / 58 and 23 / 71 | 43 / 239 and 43 / 236 | 37 / 154 and 51 / 153 |
| main-thread ms per key                | 16.8 / 19.5         | 69 / 74               | 68 / 85               |
| message search settles after last key | 153                 | 187                   | 290                   |
| long tasks (max)                      | 0                   | 0                     | 71-75                 |

### Scroll, 60-run thread fully loaded (scrollHeight 18,783 px, 19 rows mounted, 4,926 DOM nodes) and sidebar list (124 rows, 10,365 px, 3,634 nodes)

|                                | prod 1x p50 / p95 / frames >34 ms | prod 4x p50 / p95 / p99 / frames >34 (of about 400) / >50 | long tasks | CLS   |
| ------------------------------ | --------------------------------- | --------------------------------------------------------- | ---------- | ----- |
| timeline up 110 px / 12 ms     | 16.7 / 16.8 / 0                   | 16.7 / 33.4 / 50 / 6-8 / 1-2                              | 0          | 0.069 |
| timeline down                  | 16.7 / 16.7 / 0                   | 16.7 / 33.4 / 50 / 3-7 / 0-2                              | 0          | 0.069 |
| timeline fast up 220 px / 8 ms | 16.7 / 16.7 / 0                   | 16.7 / 33.4 / 50 / 5-9 / 1-2                              | 0          | 0.069 |
| sidebar 100 px / 12 ms         | 16.7 / 16.7 / 0                   | 16.7 / 16.7 / 33 / 0                                      | 0          | 0.008 |

"Load earlier turns" x5 for the 60-run thread: 86-116 ms each (dev). Scroll-direction reversals (>2 px): 2 per upward run, 0 otherwise. The whole CLS is one source: the composer overlay moving 62 px when it collapses or expands (`ChatView.tsx:3452`, F-04-38).

### Theme switch (OS scheme flip, `system` theme; dark to light and back)

|                        | class flip | paint   | long task | style recalc ms (count) |
| ---------------------- | ---------- | ------- | --------- | ----------------------- |
| prod 1x, 60-run thread | 66-68      | 91-93   | 79-87     | 71-81 (5-6)             |
| prod 1x, seed thread   | 56-65      | 76-86   | 71-73     | 66 (5)                  |
| prod 4x                | n/m        | 254-282 | 242-271   | 219-242 (5-6)           |
| dev 1x                 | 62-73      | 94-110  | 85-105    | 63-83 (5-6)             |

No CSS animation or transition runs after the flip (`getAnimations()` = 0 at 40 ms): DNA-M8 holds.

### Memory over distinct thread switches (prod; start thread is the Codex seed)

| Checkpoint                                       | JS heap MB | CDP nodes (incl. detached) | attached nodes | JS listeners |
| ------------------------------------------------ | ---------- | -------------------------- | -------------- | ------------ |
| start                                            | 64         | 5,619                      | 4,430          | 2,438        |
| after 10 distinct threads                        | 73         | 8,556                      | 4,823          | 2,891        |
| after 20                                         | 75         | 11,516                     | 4,489          | 2,957        |
| after 30                                         | 77         | 13,650                     | 4,520          | 3,116        |
| back on start thread                             | 76         | 13,548                     | 4,489          | 3,090        |
| +10 switches between two already visited threads | 78         | 13,712                     | 4,489          | 3,102        |

Dev: 154 to 173 MB, same node counts. Census after 15 switches (`detached.mjs`, GC'd): 1,915 detached elements in 26 roots, 15 of them `div.relative.h-full.min-h-0[data-assistant-citation-viewport]` (1,892 nodes), one per visited thread.

### Idle (thread open, 10 s, devtools.timeline trace)

prod: 2.3 / 3.0 / 2.3 % CPU (seed / 60-run / draft), 1.9-2.5 ms script per second, **0 paints, 0 layouts, 0 recalcs, 0 running animations** in 9 of 9 runs (dev: 2 paints in 1 of 9). Control: `about:blank` 0.01 %.

### 1 MB assistant message ("Load earlier turns" on the Huge thread)

|         | click to rows | long tasks                        | DOM nodes        | JS heap    | typing after (p50 / ms per key) | scroll after                  |
| ------- | ------------- | --------------------------------- | ---------------- | ---------- | ------------------------------- | ----------------------------- |
| prod 1x | 851 (849-900) | 3, total 1,650-1,740, max 858-915 | 4,136 to 103,370 | 146 MB     | 20 / 13-15                      | p95 16.7, one 283-320 ms task |
| dev 1x  | 1,995-2,322   | 3, max 1,939-2,314                | 4,060 to 103,291 | 268-375 MB | 20 / 15.6                       | p95 16.7, one 300-309 ms task |

### Send to first feedback (live Claude Haiku 5.5, prod 1x, n=1 per row, 2 turns total)

|                             | click to composer cleared / user bubble / working row | to route leaves /draft/ | first assistant text                                   | WS frame to paint | long task at click | CLS              |
| --------------------------- | ----------------------------------------------------- | ----------------------- | ------------------------------------------------------ | ----------------- | ------------------ | ---------------- |
| first send from a new draft | 52 / 53 / 53                                          | 154                     | 4,256 (provider)                                       | 6.8               | 1 x 53 ms          | 0.035 (3 shifts) |
| follow-up in the thread     | 18 / 18 / 18                                          | n/a                     | not separated (my predicate matched the earlier reply) | n/m               | 0                  | 0.005            |

Turn wall time 4.3 s (first) and 1.6 s (follow-up); 28 and 18 WS frames, 435 KB and 49 KB; during the first turn 316 style recalcs, 42 layouts, 0 frames over 34 ms. Feedback is optimistic (bubble, cleared composer and Working row in the same frame as the click); everything after that is provider latency. Not measured: send under added latency (`--wsdelay` is implemented in `measure.mjs`, not run), pin/settle/rename optimism, two or six threads streaming at once.

## Findings

### F-22-01 The 1 MB assistant message freezes the page for 0.85 s (prod) and keeps 103k nodes mounted

- Severity: P1
- Surface: all
- Evidence: table "1 MB assistant message": prod click to rows 851 ms with 3 long tasks totalling 1.65-1.74 s (max 858-915 ms), nodes 4,136 to 103,370, then one 283-320 ms long task on the first scroll and 13-15 ms per key (about double) while typing. Dev is 2.0-2.3 s (matches F-03-04's 2.4 s). `measure.mjs --only huge`.
- Current: one assistant row is one unvirtualised React tree; the thread opens blank (F-03-03) and loading the turn blocks input.
- Proposed: implement F-03-04 (first 60 top-level blocks plus "Show remaining N blocks", expand in 150-block slices under `startTransition`) and gate it with a budget: after clicking "Load earlier turns" on the 1 MB fixture, no single long task over 200 ms at prod 1x, over 600 ms at 4x, and nodes under 15,000 until expanded. Add `performance.bench.ts` coverage next to `docs/internals/performance-regressions.md`. Until then, show the existing `Spinner size="sm"` and disable the divider button while loading so a second click does not queue more work.
- DNA: DNA-P1, DNA-P3
- Effort: M (owned by F-03-04)
- Risk: find-in-thread, citations, copy (see F-03-04).
- Upstream-eligible: no (ChatMarkdown, #24865 file)
- #24865: not addressed

### F-22-02 Thread switch runs inside the click task: 160-280 ms to the next paint at 4x CPU

- Severity: P2
- Surface: all (felt on mid-range laptops and remote desktops)
- Evidence: prod 4x, revisit seed to 60-run: click event duration 280 ms, long task 248 ms, header at 237 ms; first visits 128-200 ms with 109-151 ms tasks. Prod 1x is fine (21-47 ms, 0 long tasks), dev 1x shows 76-146 ms tasks. `Sidebar.tsx:1046,1259` call `router.navigate` directly; `startTransition` and `useDeferredValue` appear in only 4 files, none in the chat route or `ChatView.tsx`.
- Current: the sidebar selection highlight and the new timeline commit in one render; mounting 19 markdown rows delays the highlight.
- Proposed: in `ChatView.tsx` read the route thread through `useDeferredValue` for the timeline subtree (`MessagesTimeline` props), or wrap the `router.navigate` calls at `Sidebar.tsx:1046/1259` in `startTransition`, so the row highlight, header title and composer (urgent) paint first and the timeline follows. Keep the existing 400 ms `useDelayedStatus` banner. Acceptance: at prod 4x, click event duration <= 100 ms and header update <= 120 ms for every transition above; prod 1x unchanged.
- DNA: DNA-P1, DNA-P3 (state shown must be real: keep the previous timeline dimmed or the skeleton from F-13-08 until the new one commits)
- Effort: S
- Risk: stale-timeline flash between highlight and commit (pair with F-13-08 skeleton); `MessagesTimeline.browser.test.tsx` and thread-restoration tests.
- Upstream-eligible: yes
- #24865: not addressed (its `MessagesTimeline.tsx` hunk is the empty-state copy)

### F-22-03 Every distinct thread visited leaves a detached timeline in memory (+14 MB, +660 listeners per 30 threads)

- Severity: P2
- Surface: all (long-running sessions; desktop stays open for days)
- Evidence: prod: heap 64 to 77 MB (+20 %), CDP nodes 5,619 to 13,650 while attached nodes stay near 4,500, listeners 2,438 to 3,116 after 30 distinct threads, 2 forced GCs, identical in 3 runs. Revisiting already visited threads adds 64 nodes. Census: 15 detached roots `div.relative.h-full.min-h-0[data-assistant-citation-viewport]` (1,892 nodes) after 15 switches. That element is `TooltipScrollDismissArea` with `ref={setTimelineViewportElement}` at `MessagesTimeline.tsx:1099-1101`, stored in React state and handed to the citation and find hooks (`:650,:1019,:1034`); the retainer itself was not isolated.
- Current: about 270 nodes, 22 listeners and 0.45 MB are retained per thread viewed; 300 threads in a week would be about 80k nodes.
- Proposed: find the retainer with a heap snapshot filtered to "Detached" (candidate holders: a module-level map or store that keeps the viewport element, `observeResize` callbacks not disposed at `MessagesTimeline.tsx:897`, the `LegendList` ref in `setTimelineList`). Fix by clearing the element reference on unmount (`ref` callback receiving `null` already resets state; check the stores fed from it) and disposing observers. Acceptance with `detached.mjs --switches 30`: at most 2 detached `data-assistant-citation-viewport` roots, heap growth <= 4 MB, listeners growth <= 100.
- DNA: DNA-P1
- Effort: S once the retainer is found (S to locate)
- Risk: any "remember scroll position" feature that relies on the retained element; `MessagesTimeline.browser.test.tsx` covers mount only. Add a browser test that mounts and unmounts the timeline 5 times and asserts a `WeakRef` to the viewport is collected.
- Upstream-eligible: yes
- #24865: not addressed (touches the same file, other hunks)

### F-22-04 Theme switch is one 70-90 ms main-thread stall (250-270 ms at 4x) caused by forced style flushes

- Severity: P2
- Surface: all
- Evidence: prod 1x: class flip 56-68 ms, paint 76-93 ms, long task 71-87 ms, style recalc 66-81 ms in 5-6 recalcs; 4x: paint 254-282 ms, long task 242-271 ms. Profile (4 switches, dev): `syncBrowserChromeTheme` `hooks/useTheme.ts:278` self time 108 ms, 27 ms per switch, from `getComputedStyle` reads of three elements right after the class toggle (`:285-290`); `applyTheme` then forces layout with `void document.documentElement.offsetHeight` (`:342`) and removes `.no-transitions` in a later rAF (`:344`), which restyles the whole tree again (selector `.no-transitions *`, `index.css:1086-1088`).
- Current: three whole-document restyles per switch, the first forced mid-function; the UI freezes for a quarter second on slow machines and the system-theme flip (sunset) happens while the user types.
- Proposed: in `syncBrowserChromeTheme` take the colour from the palette that `applyThemePalette` just wrote (known value) instead of calling `getComputedStyle` on `main[data-slot='sidebar-inset']`/body after the toggle; delete the `void ...offsetHeight` read; remove `no-transitions` in the same rAF that sees the first painted frame instead of a second invalidation. Acceptance: 2 or fewer style recalcs per switch, long task <= 40 ms at prod 1x and <= 120 ms at 4x, `getAnimations()` still 0 (DNA-M8).
- DNA: DNA-M8, DNA-P1
- Effort: S
- Risk: browser chrome colour (`meta theme-color`) must still match the surface; `themeBoot.test.ts` covers the boot script only, `useTheme` has no test for the colour sync.
- Upstream-eligible: yes
- #24865: not addressed

### F-22-05 Command palette typing costs 17-20 ms of main thread per key (70-75 ms at 4x) and re-renders the whole row set

- Severity: P2
- Surface: web, desktop
- Evidence: prod 1x 16.8 / 19.5 ms per key (2.5x the composer), key to paint p50 20-23 ms; prod 4x 69-74 ms per key, key to paint p50 43 ms, max 236-239 ms; dev has 71-75 ms long tasks. Dev profile over 10 keys: `jsxDEV` 322 ms of 1,040 ms active (element creation for the palette rows), code-read: nested/thread items are rebuilt for every deferred query (`CommandPalette.tsx:1689-1695`); `useDeferredValue` is already used (`:492`) and results are virtualised (`CommandPaletteResults.tsx:114`), so the cost is the per-key item construction and row render, not DOM size.
- Current: each keystroke rebuilds items for 142 threads, projects and actions, and message-search results land 150-190 ms after the last key.
- Proposed: memoise item building per `(deferredQuery, source list identity)` and render rows through a `React.memo`ed `CommandPaletteRow` keyed by item id plus highlighted flag in `CommandPaletteResults.tsx`; build thread items only for the first 50 matches. Acceptance: <= 8 ms main thread per key at prod 1x and <= 35 ms at 4x with the 142-thread fixture; key to paint p95 <= 50 ms at 4x. Pairs with F-13-18 (ordering).
- DNA: DNA-P1, DNA-K14 (keyboard-first palette must stay instant)
- Effort: M
- Risk: `CommandPalette.logic.test.ts` ordering tests; highlighted-row index logic.
- Upstream-eligible: yes
- #24865: not addressed

### F-22-06 Settings and palette mount monolithically: 200-340 ms with no pressed or pending state at 4x

- Severity: P3
- Surface: web, desktop
- Evidence: prod 4x: Settings first open 297 ms, reopen 194 ms, Appearance/Providers 336/298 ms, palette 214/165 ms; in every run the dialog frame and its content appear in the same frame. Prod 1x is 41-89 ms (fine). Click event durations are not shown to the user: the gear button has no busy state (F-13-13 covers chunk-load pending).
- Current: on slower hardware a click on Settings does nothing visible for about a quarter second, then a fully populated 1,280 px modal appears.
- Proposed: render the `AppRouteModal` frame and `SettingsSidebarNav` first and mount the active panel inside `startTransition`/`Suspense` with the existing `Skeleton` rows (DNA-P3; F-13-11 `SkeletonGroup`); mark the footer gear `aria-busy` while the route is pending. Acceptance: dialog frame <= 100 ms at prod 4x, panel content <= 250 ms.
- DNA: DNA-P3, DNA-M4
- Effort: S
- Risk: focus management on open (F-01-06), tests that wait for panel content.
- Upstream-eligible: yes
- #24865: not addressed (`SettingsSidebarNav.tsx` is touched for labels only)

### F-22-07 Scrolling away from the end shifts the composer 62 px: CLS 0.069 per crossing

- Severity: P3
- Surface: web
- Evidence: every scroll run records one layout-shift source, the composer overlay (`ChatView.tsx:3452`), 728 to 790 px on leaving the end and back on return; CLS 0.069 each way (0.138 for a round trip, above the 0.1 "good" bound) while the timeline itself does not jump (reversals 2 per upward run, 0 after). Same cause as F-04-38.
- Current: a 24 px wheel nudge collapses the composer instantly; content under the overlay re-flows with it.
- Proposed: apply F-04-38 (threshold 120 px of accumulated upward delta) and add hysteresis on the way back (expand only when within 40 px of the end). Acceptance: no layout-shift entry from the overlay during a 220 px/event scroll through the 60-run thread; CLS <= 0.01.
- DNA: DNA-M1, DNA-M3
- Effort: XS (with F-04-38)
- Risk: `composerScrollGesture.ts` tests; trackpad inertia.
- Upstream-eligible: no (`ChatComposer.tsx` is a #24865 file); follow-up
- #24865: not addressed

### F-22-08 First send from a draft: a 53 ms task and three layout shifts as the hero layout turns into the thread layout

- Severity: P3 (n=1)
- Surface: all
- Evidence: prod 1x, new draft in sample-app: click to optimistic bubble 53 ms (good), but one 53 ms long task at the click, 154 ms until the route leaves `/draft/`, and layout shifts 0.0027 + 0.0152 + 0.0168 (composer 246 to 274 to 166 to 282 px) while `DraftHeroHeadline`/`draftHeroTransitionGroupRef` hand over (`ChatView.tsx:3456-3475`). Follow-up sends: 18 ms, no long task, CLS 0.005.
- Current: the first message of every new thread visibly jumps the composer before settling.
- Proposed: dock the hero composer to its final thread position in the same commit that adds the optimistic row (one `flushSync` already exists in `useComposerSend.ts`), and pre-reserve the thread timeline column height so the 246-274-166-282 sequence collapses to one move. Acceptance: total CLS <= 0.01 and no long task over 50 ms on first send at prod 1x; repeat the measurement with 3 draft sends before accepting (only 1 measured here).
- DNA: DNA-M3, DNA-P3
- Effort: M
- Risk: mobile draft-hero view transition (`MOBILE_DRAFT_HEADLINE_VIEW_TRANSITION_NAME`), `ChatComposer` tests.
- Upstream-eligible: no (composer files in #24865)
- #24865: not addressed

## Edge-case results (matrix, only rows this area can touch)

Data: empty (draft thread typing PASS); 100+ items: sidebar 124 rows PASS (scroll p95 16.7 ms, 0 long tasks, F-02-30 not a speed problem at this size); 10,000+ items NOT TESTED (no fixture; extrapolated 30 nodes per row would be 300k nodes, see F-02-30); long titles/unicode/RTL N/A (area 02).
Content: huge single tool/message output 1 MB FAIL (F-22-01); 60-pair conversation PASS (scroll, switch); 5k-line and 200-file diff NOT TESTED (areas 05/13); nested code blocks, tables, images N/A.
Network/agents: two or six threads streaming NOT TESTED (needs more live turns than the budget); stream stall/relay disconnect N/A here (area 13); added WS latency NOT TESTED (`--wsdelay` implemented, not run).
Viewport: 1440x900 only; other sizes NOT TESTED. CPU 4x PASS/FAIL per finding above.
Preferences: dark measured everywhere; light/dark switching measured (F-22-04); reduced motion NOT TESTED (no animations found at idle: 0).
Lifecycle: long session memory FAIL (F-22-03); OS sleep NOT TESTED.

## Already good (do not touch)

- Composer typing: one frame (p50 15-19 ms headless 60 Hz) from empty to a 50,000-char paste and inside the 60-run and 1 MB threads; 4x CPU p95 22-32 ms; held key p95 17 ms; paste of 50,000 chars 72 ms.
- Send feedback: composer cleared, user bubble and Working row in one frame (18 ms follow-up, 53 ms from a draft); WS frame to paint 6.8 ms.
- Thread switch at prod 1x: header in 21-47 ms, no long task, revisits never show the loading marker.
- Timeline and sidebar scroll at prod 1x: p95 16.7 ms, 0 frames over 34 ms, 0 long tasks; at 4x only 1-2 % of frames over 34 ms; LegendList keeps 19 rows mounted for a 60-run thread; sidebar `content-visibility:auto` keeps 124 rows smooth.
- Idle: 0 paints, 0 layouts, 0 animations on an open thread (matches AGENTS.md "no continuously repainting animations").
- Theme switch: no transition or animation after the flip (DNA-M8).
- Diff panel reopen: 17 ms (prod), expand-all 12 ms once the worker is up.

## Incomplete

- Not measured: send under added WS latency and optimism of pin/settle/rename/archive (the harness supports `--wsdelay`; the click-to-feedback test on a probe thread was dropped for time), first-token time of the follow-up send (predicate bug, see table), n=1 for sends (2 live turns instead of 6), two and six concurrent streams, a 5k-line or 200-file diff, 10,000 threads, other viewports, reduced-motion timings, a real 120 Hz display, Electron.
- Dev server 4x was not run; dev numbers are 1x only. CPU throttle is a CDP multiplier, not a device.
- Prod build is `dist` from 14:02 via a custom proxy (no brotli). Visiting threads bumps their `lastVisitedAt` on the server (cannot be undone).
- Idle cost (2.3-3.0 % CPU with 0 paints, control 0.01 %) could not be attributed from a 15 s sampling profile (`Sidebar.tsx:3553` anonymous function, `SchemaAST` decode and `fetch` appear, each under 5 ms): left as a lead.

## Needs deeper look

1. Idle 2.3-3.0 % CPU on an open thread with nothing visible changing (see Incomplete): list active timers (`useNowMinute`, `useLiveRefresh`, sidebar leases, relative-time ticks) and WS keepalive decoding.
2. Diff panel file headers appear 454 ms after the shell for a 2-file diff (area 13 saw a skeleton from 122 ms and content at 274 ms): check what is on screen in between and whether the 450 ms is the server diff or the worker pool.
3. F-22-03 retainer path: needs a heap-snapshot retainers view to name the exact holder of `data-assistant-citation-viewport`.
4. PR #23942 "reduce work while scrolling large threads" (open, `MessagesTimeline.tsx`) may overlap F-22-02/F-22-03; read before writing code.
5. Settings close at 189-231 ms is the exit animation (DRIFT-18, area 19), not work; confirm it is gated by Panel animations.
