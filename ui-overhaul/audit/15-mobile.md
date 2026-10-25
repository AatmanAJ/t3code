# Area 15: mobile (apps/mobile) audit

Scope: native iOS dev client "T3 Code Dev" on iPhone 17 (iOS 27.0, 402x874 pt) driven live; iPad Pro 13-inch (M5) booted briefly for split view; Android is code-read only (no SDK on host). PR #24865 touches one mobile file only (`SettingsThreadsRouteScreen.tsx`, two label renames: "Resume after usage limits", "Snooze until limits reset"), so every other finding is `#24865: not addressed`.

Method notes. The T3 device tools were off ("Agent device access is turned off"), macOS Accessibility/Automation was blocked (`AXIsProcessTrusted` false, AppleScript timed out), and `brew install idb-companion` was refused by Homebrew's tap-trust gate (I did not trust the tap; the `facebook/fb` tap I added was removed again). Interaction therefore used a throwaway XCUITest harness in `/tmp/uitap` (outside the repo, built with Xcode only, no downloads) that taps by coordinate and dumps the accessibility tree; `simctl openurl` was used for deep links. Screenshots: `ui-overhaul/screens/15-mobile/`. Withheld: any capture showing the terminal prompt (local username) and the slash/skill menu (personal skills list); both were deleted.

## Findings

### F-15-01 Native crash "[RNScreens] Stack should never be empty after updates"

- Severity: P1 (observed once, not reproduced; assertion is a dev-build `RCTAssert`)
- Surface: mobile (iOS)
- Evidence: simulator log 14:33:59: `Terminating app due to uncaught exception 'NSInternalInconsistencyException', reason: '[RNScreens] Stack should never be empty after updates'` from `-[RNSStackNavigationController performContainerUpdateIfNeeded]` (react-native-screens `ios/helpers/stack/RNSStackNavigationController.mm:339`). Preceded by: thread A opened, deep link `threads/<env>/<B>` while a keyboard/sheet was up, model sheet open and cancelled, tap on the `+20 -0` diff chip, appearance switch, Back tap 4 s earlier. Three repeat attempts of subsets (push then immediate Back, deep link then Back) did not crash. Every navigation also logs "Unbalanced calls to begin/end appearance transitions".
- Current: a React commit arrives while a native stack pop/push is in flight and the stack ends empty; in dev it aborts the app, in release `RCTAssert` is compiled out so the likely outcome is a blank stack.
- Proposed: in `patches/react-native-screens@*.patch` replace the `RCTAssert` at `performContainerUpdateIfNeeded` with a guard that re-pushes the root screen (or skips the pop) and logs; in `Stack.tsx` keep `selectWorkspaceDetail` from issuing a pop while `navigation.isTransitioning`. Capture the JS action log before changing anything.
- DNA: DNA-X3 (native navigation must be sturdy), AGENTS.md "performance without compromise".
- Effort: S (patch guard) to M (root cause).
- Risk: touches the shared native stack patch; needs a native rebuild and a `vp i` re-sync (`docs/internals/mobile-development.md`); no automated coverage.
- Upstream-eligible: no (no deterministic repro).
- #24865: not addressed

### F-15-02 Closing search with X leaves the query silently filtering the thread list

- Severity: P1
- Surface: mobile (iOS)
- Evidence: `15-mobile-home-search-closed-query-persists-light-iphone17.png`. Steps: Home, Search, type `stress`, tap the round X (a11y label `close`). The search field collapses to the magnifier, the list shows only the two "stress" threads, no chip or banner says it is filtered; reopening shows `stress` still in the field. Code: `WorkspaceToolbar.ios.tsx:173` (`onBlur` dispatches `expand`, query kept) vs `:181` (`onCancelButtonPress` -> `cancel`, clears the query) in `workspace-tabs-state.ts:94-101`; the iOS 26 integrated "close" button fires blur, not cancel. Related #23013.
- Current: threads appear to vanish; user must know to reopen search and clear it.
- Proposed: in `WorkspaceToolbar.ios.tsx` treat the integrated close button as cancel: on `onBlur` when `nativeEvent` text is empty or the close glyph was pressed, dispatch `cancel`; or if keeping the query, show a persistent "Filtered: stress" chip (`bg-subtle`, `text-xs`, with a clear-X, 44 pt hit area) above the list while `tab.searchMode === "expanded" && tab.query !== ""`.
- DNA: DNA-X3, DNA-P3 (state must be visible).
- Effort: S
- Risk: `workspace-tabs-state.test.ts` covers the reducer; the native search events are untested; Android uses `ThreadListToolbar.tsx:53` (`closeSearch` clears), so keep parity.
- Upstream-eligible: yes
- #24865: not addressed

### F-15-03 Workspace tab bar and compose button float over the thread composer when a thread is opened from another tab

- Severity: P1
- Surface: mobile (iOS)
- Evidence: `15-mobile-offline-thread-view-light-iphone17.png`: after a `threads/...` deep link while on the Settings tab, the Chats/PRs/Usage/Settings pill and the compose circle cover the composer text field and `+` button; the same thread opened from the Home list has no tab bar (`...probe-thread-open...`). Same family as PR #24666 ("iOS workspace tabs persist inside a thread", BORROW-cand). Archived Threads rows did not open (no repro via UI).
- Current: composer partially unreachable; Send still visible at the right.
- Proposed: hide the native tab bar whenever the top route is `Thread` regardless of entry (`useSystemWorkspaceTabBar.ts`: derive `hidesBottomBarWhenPushed` from route name, not from the originating tab), applying #24666's idea; add `safeAreaInset` so the composer never sits under the bar.
- DNA: DNA-X3 (composer-bottom).
- Effort: S
- Risk: iPad sidebar tabs (`WorkspaceSidebarTabs.ios.tsx`) must keep their bar; verify split view.
- Upstream-eligible: yes (follow #24666 owner)
- #24865: not addressed

### F-15-04 Native diff view exposes nothing to VoiceOver or TalkBack

- Severity: P1 (accessibility)
- Surface: mobile (iOS, Android)
- Evidence: `modules/t3-review-diff/ios/T3ReviewDiffView.swift:2009` draws everything in `ReviewDiffContentView.draw(_:)`; `grep -i accessib` over `t3-review-diff/ios` and `android` returns nothing. XCUI tree of the Review screen contains only "Select diff", "Git controls" and scrollbars; file headers, collapse chevrons, the "viewed" checkboxes and every diff line are invisible to assistive tech. `15-mobile-review-diff-capitalize-light-iphone17.png`.
- Current: a screen-reader user can open Review but cannot read, collapse or mark any file.
- Proposed: set `accessibilityElements` on `T3ReviewDiffView` with one `UIAccessibilityElement` per file header (label "docs/greet.md, added, 15 additions, expanded", traits `.button`, activate = toggle collapse) and one per visible hunk row (label "line 7, added, <text>"); mirror with `AccessibilityDelegate`/virtual nodes in `T3ReviewDiffView.kt`. Pattern exists in `T3ComposerEditorView.swift:538-551`.
- DNA: DNA-I4 / non-negotiable 6 (inaccessible = P1).
- Effort: M
- Risk: large virtualised lists: expose only rows in the visible window; no native tests today.
- Upstream-eligible: yes
- #24865: not addressed

### F-15-05 Thread rows announce only the title

- Severity: P1 (accessibility)
- Surface: mobile
- Evidence: `thread-list-v2-items.tsx:1262` `accessibilityLabel={hasQueuedMessages ? `${title}, messages queued to send` : title}`; no `accessibilityValue`. XCUI list: label equals title only. Project, status (working, needs input, settled, snoozed), age, pin, branch and provider are all visual only. #23653 cluster.
- Current: VoiceOver reads "Migrate tests to vitest browser mode, button" for a pinned, running, 82-day-old thread.
- Proposed: build the label as `${title}`, and `accessibilityValue={{ text: [status, project, relativeTime, pinned ? "pinned" : null, branch].filter(Boolean).join(", ") }}` from the same view model that draws the row (`threadListV2.ts` status), so ordering matches the DNA status vocabulary.
- DNA: DNA-X3 (mobile keeps web's status vocabulary), DNA-K2.
- Effort: S
- Risk: `threadListV2.test.ts` unaffected; add one label test.
- Upstream-eligible: yes
- #24865: not addressed

### F-15-06 Add environment: error text is hidden behind the keyboard and says nothing actionable

- Severity: P1
- Surface: mobile
- Evidence: `15-mobile-add-env-bad-code-submitted-light-iphone17.png`: with the keyboard up, the red "The environment credential is invalid" line is clipped at the keyboard edge (y 870 of 874); only the red field outline is visible. Copy source `packages/client-runtime/src/connection/errors.ts:194`.
- Current: pairing failure looks like nothing happened; copy does not say the code is wrong or expired.
- Proposed: scroll the sheet's content to the error (`scrollToEnd` on error with `KeyboardAwareScrollView`) or dismiss the keyboard on submit failure; change detail to "That pairing code is invalid or has expired. Create a new one with `t3 pair` or in desktop Settings → Connections." (sentence case, no period drift); add `accessibilityLiveRegion="polite"`.
- DNA: DNA-V (voice: plain, actionable), DNA-P3.
- Effort: S
- Risk: error string may be asserted in `client-runtime` tests.
- Upstream-eligible: yes
- #24865: not addressed

### F-15-07 Chat does not dismiss the keyboard on drag

- Severity: P2
- Surface: mobile
- Evidence: `ThreadFeed.tsx:3184-3185` `keyboardShouldPersistTaps="always"` + `keyboardDismissMode="none"`. Live: 350 pt drag down in the long stress thread left the keyboard up (`15-mobile-long-thread-after-drag-down-light-iphone17.png`). PR #24484 (BORROW).
- Current: only tapping a control dismisses the keyboard; iOS Messages-style interactive dismissal missing.
- Proposed: `keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}`; keep `keyboardLiftBehavior="whenAtEnd"`; test with `maintainScrollAtEnd`.
- DNA: DNA-X3.
- Effort: XS
- Risk: LegendList scroll anchoring while the keyboard animates (#22350 family); Macroscope flags it as a default change.
- Upstream-eligible: yes
- #24865: not addressed

### F-15-08 Disabled Send button is nearly invisible

- Severity: P2
- Surface: mobile
- Evidence: sampled pixels in `15-mobile-thread-capitalize-end-light-iphone17.png`: arrow #ffffff on #d9e0f4 = 1.32:1. Same root as PR #23155 (Material You dark). Component `components/ComposerToolbar.tsx` / `features/threads/ThreadComposer.tsx` (shared `ComposerActionButton`).
- Current: empty-looking pale circle; users cannot tell Send from a decoration.
- Proposed: disabled state = background `bg-secondary-border` (#e4e4e7 light / #191919 dark) with glyph `text-foreground-muted` (#6f6f79 / #838383, 3.4:1 or better) instead of primary at 20% alpha; keep the 44 pt hit area.
- DNA: DNA-C (tokens), DNA-X1.
- Effort: XS
- Risk: shared by every theme and platform; check Material You.
- Upstream-eligible: yes
- #24865: not addressed

### F-15-09 Tap targets under 44 pt

- Severity: P2 (accessibility)
- Surface: mobile (iOS measured)
- Evidence (XCUI frames, pt): fork-from-response 28x28 with no `hitSlop` (`ThreadFeed.tsx:485` `h-7 w-7`; its neighbour Copy has `hitSlop={8}`), thread header Terminal 44.7x36, Files 44x36, Git 38.7x36, sheet Cancel/Done 36x36, favourite stars 38x38, Add-environment `+` 34.6, Search 36x36, Files-browser rows 42 high, terminal accessory keys 44x38.7, iPad header buttons 36 high.
- Current: below HIG 44 pt, tightly packed in the header capsule.
- Proposed: add `hitSlop={{top:4,bottom:4,left:4,right:4}}` to `AssistantForkButton` and header capsule buttons, raise `WORKSPACE_TOOLBAR.height`-based glass buttons to 44, and set terminal accessory key `minHeight: 44` (`ThreadTerminalRouteScreen.tsx`).
- DNA: DNA-K10 (44 px coarse-pointer hit area), DNA-X4.
- Effort: S
- Risk: capsule width at 390 pt already truncates the title (see F-15-11).
- Upstream-eligible: yes
- #24865: not addressed

### F-15-10 No Dynamic Type ceiling: theme names and settings rows break at accessibility sizes

- Severity: P2
- Surface: mobile
- Evidence: no `maxFontSizeMultiplier` anywhere in `apps/mobile/src` (grep). At `accessibility-extra-extra-extra-large` the Appearance theme cards read "T3…", "T3…", "Gro…", "Oc…", "Em…" so T3 Code and T3 Chat are indistinguishable (`15-mobile-appearance-dyntype-ax5-themes-light-iphone17.png`); Settings rows break mid-word "Environme/nts", "Appearan/ce" while row icons stay 15 px (`15-mobile-settings-root-dyntype-ax5-light-iphone17.png`). `ListRowLayout.tsx:26` stacks detail only at `fontScale >= 1.5`.
- Current: usable at default and large, degraded from AX3 up.
- Proposed: add `maxFontSizeMultiplier={1.6}` to `AppText` for row titles and card labels; in `AppearanceThemeCard` allow two lines (`numberOfLines={2}`, `adjustsFontSizeToFit`), and scale `SymbolView` size by `Math.min(fontScale, 1.5)`.
- DNA: DNA-X2 (type roles), non-negotiable 6.
- Effort: S
- Risk: layout shifts in tight headers; visual diff by Dynamic Type snapshot.
- Upstream-eligible: yes
- #24865: not addressed

### F-15-11 Collapsed composer hides the model and truncates its placeholder

- Severity: P2
- Surface: mobile (iPhone 390 pt class)
- Evidence: empty composer shows provider glyph + chevron only and `Ask the repo agent, or run a c…` (`ThreadDetailScreen.tsx:1769`, `NewTaskDraftScreen.tsx:1128`); the model name appears only once text exists (`15-mobile-composer-two-lines-keyboard-light-iphone17.png`). Issue #24213 (model name truncated to "G…"). a11y label is correct ("Model and reasoning settings, Claude Haiku 5.5, Medium").
- Current: a user cannot see which model a one-line message will use; placeholder wastes its only line.
- Proposed: placeholder "Message the agent" (<= 20 chars at `text-base`), and show the short model name (`ComposerModelControl.tsx`, `text-xs`, `numberOfLines={1}`, max 96 pt) in the collapsed row when width >= 360 pt, dropping the placeholder width first.
- DNA: DNA-X3 (composer-bottom, one placeholder), DNA-V.
- Effort: S
- Risk: `composerSendPresentation.test.ts` unaffected; layout in `ComposerToolbar.tsx` animations.
- Upstream-eligible: yes
- #24865: not addressed (web-only placeholder change)

### F-15-12 Disabled environment is reported as "offline" and the CTA adds a new one

- Severity: P2
- Surface: mobile
- Evidence: `15-mobile-home-offline-env-disabled-light-iphone17.png`; `HomeScreen.tsx:176-182`. After switching the only environment off in Settings → Environments, Home says "Environment unavailable. The saved environment is offline. Check the URL or start the environment, then retry." with a single "Add environment" button.
- Current: wrong cause, wrong action; cached threads hidden (#24530 is the inverse bug).
- Proposed: when every saved environment has `enabled === false` show "All environments are off" / "Turn one on to see your threads." with a primary "Open Environments" button (`settings/environments`).
- DNA: DNA-V, DNA-P3.
- Effort: S
- Risk: copy tests in `workspace-connection-status.test.ts`.
- Upstream-eligible: yes
- #24865: not addressed

### F-15-13 Archived threads search field sits under the floating tab bar

- Severity: P2
- Surface: mobile (iOS)
- Evidence: `15-mobile-settings-archive-light-iphone17.png`: the bottom `Search archived…` glass field is covered by the tab pill except its right end ("est").
- Current: the field is nearly unreachable; the tab bar shows on a drill-in page.
- Proposed: hide the tab bar on `SettingsArchive` (same fix family as F-15-03) or move the search to the nav bar `headerSearchBarOptions` as on Home.
- DNA: DNA-X3.
- Effort: XS
- Risk: low.
- Upstream-eligible: yes
- #24865: not addressed

### F-15-14 Terminal: paste key scrolls off-screen and "Attach visible output" sits under the keyboard

- Severity: P2
- Surface: mobile (iOS; Android noted in #24694)
- Evidence: XCUI frames on the Terminal screen: accessory keys `paste` x 481-547 and `clear` 555-627 on a 402 pt screen (reachable only by scrolling the strip); `Attach visible output` at y 841.7, h 32 inside the keyboard region (hidden with the keyboard up; blurred text visible through the keyboard). Code `ThreadTerminalRouteScreen.tsx:574` (key list), `:1288` (attach). #24694, #22418, #20252, #15453.
- Current: paste is hidden in a long strip; attach is unreachable while typing.
- Proposed: order the strip `esc tab ctrl paste ↑ ↓ ← →` (paste in the first 360 pt) and render Attach as a 44 pt chip above the keyboard (`KeyboardStickyView` offset = accessory height).
- DNA: DNA-X3.
- Effort: S
- Risk: terminal key order is muscle memory; keep arrows grouped.
- Upstream-eligible: yes
- #24865: not addressed

### F-15-15 Busy rows fade the whole row to 55% opacity

- Severity: P2
- Surface: mobile
- Evidence: `thread-row-emphasis.ts:3-8` (`working` or `waiting` and not selected) -> `thread-list-v2-items.tsx:1248` `opacity: 0.55`. Computed: title 3.5:1, project/age/branch (`#6f6f79` at 0.55) 2.15:1 light, 2.34:1 dark.
- Current: running threads, the ones users watch, read as disabled; metadata fails 4.5:1.
- Proposed: drop the wrapper opacity; de-emphasise with `text-foreground-muted` for title only (4.84:1) and keep metadata at `text-foreground-tertiary` (4.71:1, the DNA-K9 target).
- DNA: DNA-C5, DRIFT-1.
- Effort: XS
- Risk: row hierarchy tests in `thread-list-v2-row-appearance*.ts`.
- Upstream-eligible: yes
- #24865: not addressed

### F-15-16 Android "Remove animations" can leave composer and sheet rows invisible

- Severity: P2 (NOT TESTED, code-read)
- Surface: mobile (Android)
- Evidence: entering animations without a reduce-motion fallback: `ComposerToolbar.tsx:25` (`FadeIn.duration(160)`), `ThreadSettingsSheet.tsx:116-121`, `ThreadComposer.tsx:318`, `thread-work-log.tsx:114-116`; no `ReducedMotionConfig` anywhere. PRs #21757 and #23888 (BORROW) report opacity-0 rows on device; issue family #19239.
- Current: with Android Settings → Remove animations, entering views can stay at opacity 0.
- Proposed: one helper `enteringIfMotion(anim)` returning `undefined` when `useReducedMotion()` (or `AccessibilityInfo.isReduceMotionEnabled`) and use it at those four sites; do not rely on Reanimated's `ReduceMotion.System` default.
- DNA: DNA-M5.
- Effort: S
- Risk: needs a real Android device or emulator; none on this host.
- Upstream-eligible: yes
- #24865: not addressed

### F-15-17 Provider accounts lists only Cursor and Antigravity and gives no install state

- Severity: P2
- Surface: mobile
- Evidence: `15-mobile-settings-provider-accounts-light-iphone17.png`: two cards, each "Connect this provider." with a greyed "Sign in"; Codex and Claude (installed and signed in on the host) are absent. `SettingsProviderAccountsRouteScreen.tsx:66-78` filters to sign-in-capable drivers, `:340` disables Sign in when `!provider.installed` with no explanation. Area 09 parity lead.
- Current: a not-installed provider looks like a broken button; no way to see Codex/Claude auth state.
- Proposed: list every provider of the environment with state text from the same `ProviderStatus` copy as web ("Signed in", "Not installed", "Sign in required"), and when disabled say "Install <name> on MacBook Pro first".
- DNA: DNA-X3 (same vocabulary), DNA-V.
- Effort: M
- Risk: shares copy with web `components/settings/Provider*.tsx` (area 09 proposals).
- Upstream-eligible: no (feature-sized)
- #24865: not addressed

### F-15-18 Copy and truncation polish on settings

- Severity: P3
- Surface: mobile
- Evidence: root row "Archived Threads" vs page title "Archived threads" vs "Thread behavior" (`15-mobile-settings-root-light`, `settings-archive-light`); "Plan Mode" legacy toggle in sentence-case screen; Maintenance value `Server an…r updates` (middle-truncated; `SettingsServerControlsRouteScreen.tsx:451` value "Server and provider updates"); "Manage MacBook Pro" appears as two adjacent buttons (row and chevron) in the Environments a11y tree. Usage-limit labels are renamed by #24865.
- Current: inconsistent casing, a truncated value, duplicate accessible names.
- Proposed: "Archived threads", "Plan mode"; in that row put the value on a second line (`ListRowLayout` stack at `fontScale >= 1`) or shorten to "Updates"; mark the chevron button `accessible={false}`.
- DNA: DNA-V casing rule, DRIFT casing items.
- Effort: XS
- Risk: settings search keys (`settings-search`) may reference the strings.
- Upstream-eligible: yes
- #24865: partial (renames the two usage-limit labels only)

### F-15-19 Diff stat order differs between chip, header and file row

- Severity: P3
- Surface: mobile
- Evidence: thread chip `+20 -0` (green then red), review header `+20 · -0`, file row `-0 +15` (red then green): `15-mobile-review-diff-capitalize-light-iphone17.png`, `15-mobile-thread-capitalize-end-light-iphone17.png`.
- Current: the same stat reads in two orders.
- Proposed: use additions then deletions everywhere (`DiffStatLabel` convention, DNA-K12) in `T3ReviewDiffView.swift` file header and Android twin.
- DNA: DNA-K12.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes
- #24865: not addressed

## Edge-case results (matrix)

- Empty: PASS (first-launch "No environments connected / Add environment", `15-mobile-home-no-environments-light-iphone17.png`); one item, 100+ items: PASS (list virtualised, 100+ fixture threads, scroll smooth in sim); 10,000+: NOT TESTED.
- Long/unicode/RTL titles: PASS visually in the tree dump (rows for `修复登录页面… 🚀` and RTL title exist, single-line truncated); whitespace-only titles: NOT TESTED.
- Code blocks, tables, links, file chips, tool log: PASS in seed threads; Mermaid #24223 NOT TESTED; 1 MB output stress thread: NOT TESTED (not opened).
- Provider not installed: FAIL (F-15-17). Auth expired, stream stalls, six threads streaming: NOT TESTED. Relay disconnected: PARTIAL (environment switched off: F-15-12; composer shows "MacBook Pro is not connected" pill and a queue glyph on Send).
- Offline queueing send/reconnect flush: NOT TESTED live (deep links replace the thread; no way to disable the environment while a thread is on top); code-read only.
- Server restart, version mismatch: NOT TESTED.
- Viewport: iPhone 17 portrait PASS; iPad portrait and landscape split view PASS (Settings and thread); landscape iPhone, Duo, Android tablet: NOT TESTED.
- Keyboard open: PASS for thread composer (F-15-07 aside), FAIL for Add environment error (F-15-06) and terminal Attach (F-15-14). Return key lead: software keyboard Return inserts a newline in the composer (`hello` / `world` in one message, `15-mobile-composer-two-lines-keyboard-light-iphone17.png`); Settings → Keyboard documents Return-sends only for a connected hardware keyboard; hardware Return NOT TESTED (no hardware keyboard on host). #20982, #7390 (draft not clearing / carrying over): not tested (no message was sent from the phone to save probe turns); the draft persisted across navigation within a thread.
- Light/dark/system: PASS (home, thread, sheet, diff in dark); named themes: listed (T3 Code, T3 Chat, Grove, Ocean, Ember, Iris) but not each walked; Material You: NOT TESTED (Android).
- Reduced motion: iOS PASS by code (Reanimated default system mode, 23 files use `ReduceMotion.System`); Android FAIL risk F-15-16 (NOT TESTED). High contrast: NOT TESTED. Dynamic Type: F-15-10.
- VoiceOver: labels on icon buttons PASS (Back, Copy message, Fork, Send, Add attachment, Terminal/Files/Git, "Review 2 files changed, 20 additions, 0 deletions", model control); gaps F-15-04, F-15-05; composer text view has no accessibility label (placeholder only).
- Lifecycle: background 6 s then resume PASS (screen and state kept); one-hour background, OS sleep: NOT TESTED. First launch: PASS (empty state, Add environment sheet, QR + manual entry).

## Already good (do not touch)

- Software keyboard handling in the thread composer: pill rides above the keyboard, expands with text, shows model + effort once multi-line; draft persists across navigation (`ThreadComposer.tsx`).
- Accessibility naming of thread-screen controls (Back, Copy message, Send state, Add attachment, "Review N files changed" summary), tab bar identifiers, Settings switches ("Enable MacBook Pro").
- Muted-text tokens meet target: `foreground-muted` #6f6f79 4.84:1, `foreground-tertiary` #71717b 4.71:1 on #fcfcfc; dark #838383 5.22:1 on #0a0a0a (DNA-K9 holds on mobile).
- Settings pages share one anatomy (grouped cards, 16 px body, helper text) and iPad split settings swap content in place (`docs/internals/mobile-navigation.md`).
- Swipe-to-settle with Undo toast and `ReduceMotion.System` timing (`thread-swipe-actions.tsx`); long-press menu offers Settle/Snooze/Pin/Archive/Delete with a destructive red Delete.
- Search with live message matches, filter chips, pairing via deep link, Environments toggle with clear "Connected"/"Off".

## Incomplete

- No Android emulator: all Android items code-read (F-15-16; Material You Layout, `.android.tsx` files not exercised).
- Hardware keyboard Return, iPad `Cmd+1..9`/`Cmd+K` (`features/keyboard`): code exists, not tested (no hardware keyboard on the simulator host).
- Offline send/queue/resume, push notifications and Live Activities (dev build has no T3 Connect: Notifications page shows "Notifications require T3 Connect in this app build."), voice input (iOS 26+ mic), share extension, Subscription widget, Mermaid, device preview, browser preview, PR detail/review screens, scheduled tasks, Arrange threads sheet, 10,000-thread list.
- The 82 screens were sampled (about 30 captured), not all walked; 4 of the 6 themes not switched.
- One tiny Claude Haiku turn used (thread `A15 mobile probe`, created via CLI); no turns were sent from the phone.

## Needs deeper look

- Area 09: mobile "Provider accounts" vs web Providers page (F-15-17) once area 09 copy settles.
- Area 03/06: "3 tabs open" chip overlaps the first user-message chip when the keyboard is up (`15-mobile-thread-capitalize-dark-iphone17.png`, left); expanded Agent chip repeats the prompt text twice.
- Area 12: Usage tab bars show a literal "1" inside the Codex bar and legend (`15-mobile-tab-usage-light-iphone17.png`).
- Docs: `docs/user` states "Enter sends on all clients"; on iPhone's software keyboard Return inserts a newline by design (Settings → Keyboard caption is correct). Reword the composer doc.
- Dev-client-only noise: "Unbalanced calls to begin/end appearance transitions" on every push (react-native-screens patch); worth a release-build check.

## Cleanup state

- Metro: started from `apps/mobile` with `vp run dev:client` (PID 73959, own session via `setsid`); stopped with `kill -TERM -73959`; `http://localhost:8081/status` no longer answers. Log left at `/tmp/t3code-metro.log`.
- Host test harness (outside the repo, `/tmp/uitap`, `/tmp/uitap-ipad`): wrapper PIDs 9479 (iPhone) and 17370 (iPad) and their `xcodebuild` children terminated; runner app `local.uitap.UITapUITests.xctrunner` uninstalled from both simulators; derived data deleted.
- Simulators: iPhone 17 (2E08CEC5…) left Booted (as found), app terminated, appearance light, content size large; iPad Pro 13-inch M5 (40E5FA1F…) returned to Shutdown and the dev client removed from it.
- Backend: untouched and still up (web 5733 -> 200, server 13773 -> 302). Sessions labelled `mobile-probe` and `mobile-probe-ipad` revoked with `t3 auth session revoke` (zero remain). Probe thread `A15 mobile probe` archived. The phone's "Enable MacBook Pro" switch was toggled off and back on (final: on). One-turn budget: 1 Haiku turn.
- Host: `brew tap facebook/fb` added then removed (not trusted, nothing installed); `/tmp/idb-venv` removed. Nothing written under `~/.t3/userdata`.
- Screenshots: `ui-overhaul/screens/15-mobile/` (iPhone 17 light/dark, iPad Pro 13 portrait/landscape).
