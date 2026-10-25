# Area 03: thread view (message column, timeline, markdown, tool calls, approvals)

Audit of `ChatView` and everything inside the message column at pingdotgg/t3code main @ 5f64c5eb, running web build at `http://localhost:5733`, Chromium (Playwright), macOS. Findings only, no source edits. Screenshots: `ui-overhaul/screens/03-thread-view/` (77 files; naming `03-<state>-<theme>-<WxH>.png`). Finding prefix `F-03-`.

Counts: 41 findings. P0: 0, P1: 6, P2: 18, P3: 17. No P0 was found; the worst defects degrade reading and trust without blocking work.

## How this was audited

- Read DNA.md, MAP.md, DOCS-DIGEST.md (composer.md, activity-log.md, html-renders.md, permission-modes.md, question-attachments.md), issues.md, discussions.md, fixtures.md, and the code in `components/chat/*` (MessagesTimeline, TimelineUserMessageRow, TimelineAssistantRows, TimelineWorkGroupRows, TimelineWorkEntryRow, WorkLog, MarkdownCodeBlock, MarkdownTable, ChangedFilesTree, ProposedPlanCard, ComposerPendingApprovalPanel/Actions, ComposerPendingUserInputPanel, TimelineMinimap, ThreadFindBar, V2LifecycleRow, TimelineSystemDivider), `ChatMarkdown.tsx`, `ThreadRouteView.tsx`, `RenderErrorBoundary.tsx`, `index.css` (chat markdown block L1795-2230), `hooks/useCopyToClipboard.ts`.
- Used the app as a user: the three seed threads, "Huge output stress test", "Long conversation stress test", plus the four agent turns allowed for this area (all in `sample-app`):
  1. Claude Haiku 5.5, Medium, Full access: a pasted markdown torture document (headings, alerts, table, nested lists, tasks, ts/bash/mermaid blocks, math, details, missing image, 200-char unbroken string, RTL/CJK/emoji, footnote). Thread "Render Markdown Formatting Elements".
  2. Claude Haiku 5.5, Low: 12-section cheat sheet to observe streaming. Result: answer arrived in one chunk (F-03-15).
  3. Codex gpt-5.6-terra, Low, Full access: two shell calls then an 8-section answer with table and python block. Streamed incrementally (frames sampled every 120 ms).
  4. Codex gpt-5.6-terra, Low, Supervised: `curl -sI https://example.com` (approval prompt) then a 20-section answer; scrolled up mid-stream.
- Measured with Playwright: `scrollTop/scrollHeight`, DOM node counts, `longtask` entries, rAF frame deltas, contrast ratios from computed colors composited over the real canvas (canvas `#fcfcfc` light, `#0a0a0a` dark), clipboard contents, `ariaSnapshot`.
- Viewports 1440x900 light and dark for every state; 800x600, 390x844 (touch, 2x), 1280x720, 1024x640, 720x450 (200% zoom), 2880x1800 (50% zoom), 3440x1440; interface font 12 and 20 px; `forcedColors: active`; wide chat width.

## Baseline note: PR #24865 (owner overhaul)

Every finding carries a `#24865` line checked against `ui-overhaul/prior-art/pr-24865.diff`. Relevant facts from the diff: chat prose opacity 80% to 90% (`ChatMarkdown.tsx`, `MarkdownDetails.tsx`); `--radius` 0.625rem to 0.5rem so `rounded-lg` is 8px, `-xl` 12, `-2xl` 16, `-3xl` 20; light `--foreground` zinc-800 to zinc-900; darker light `--message-surface`; `--diff-*-foreground` light emerald-700 and red-700 with `DiffStatLabel` switched to the `-foreground` tokens; inline code lost its border, radius 4px, `font-size: 0.85em`; `pre` radius 12px to 8px; empty-thread placeholder `/30` removed; `ProposedPlanCard` `rounded-3xl` to `rounded-2xl`; minimap strips quieter; dark `--muted-foreground` to neutral-400; `lucide` stroke 1.75. Files in my area touched by the PR: `ChatMarkdown.tsx`, `MessagesTimeline.tsx`, `MarkdownDetails.tsx`, `ProposedPlanCard.tsx`, `DiffStatLabel.tsx`, `TimelineMinimap.tsx`, `index.css`. "Upstream-eligible" below is "yes" only for a fix that does not edit those files, or says "after #24865 merges".

---

## Findings

### F-03-01 Opening a long thread stops 156 px above the end, the last answer hides under the composer, and "Scroll to end" is absent

- Severity: P1
- Surface: all (web verified)
- Evidence: open "Long conversation stress test" (`mcp:101012d3-8fff-4b2e-8a8f-7d31d6aec256`) and wait 9 s: scroller `scrollHeight 3533, scrollTop 2529, clientHeight 848`, DOM gap 156 px, no `button[aria-label="Scroll to end"]`. Screenshot `ui-overhaul/screens/03-thread-view/03-long-opened-end-light-1440x900.png` (last two bullets and the closing sentence of answer #60 are under the composer) vs `03-long-scrolled-bottom-light-1440x900.png`. Then wheel up 300 and wheel down 300 back to the same offset (gap 156): the pill is now visible. Same offset, opposite state. Code: `MessagesTimeline.logic.ts:325-337` (`resolveTimelineIsAtEnd` comment says LegendList double-subtracts the composer inset and uses a 40 px threshold), `MessagesTimeline.tsx:1117-1140` (`initialScrollAtEnd`, `maintainScrollAtEndThreshold={1}`), `useTimelineFollow.ts:96-98, 569-632` (pill debounce), `ChatView.tsx:3434-3439`. Prior art: #12372 (pill hidden after switch strands viewport above the end), cluster #20366.
- Current: Two different definitions of "at end" (LegendList content math vs DOM) disagree by exactly the composer inset, so a thread opens short of the end and the pill logic flips with the path taken to reach the same scroll offset.
- Proposed: One predicate for both initial positioning and the pill: `domGap = node.scrollHeight - node.scrollTop - node.clientHeight` read from `listRef.current.getScrollableNode()`; at end means `domGap <= 8`. (a) After `onLoad` plus two frames, if `initialScrollAtEnd` applies and `domGap > 8`, set `node.scrollTop = node.scrollHeight` (the same pin `pinDisclosureToEnd` already does at `MessagesTimeline.tsx:~455`). (b) Feed `onIsAtEndChange` from `domGap` and delete the `contentLength - scroll - scrollLength <= 40` branch in `resolveTimelineIsAtEnd` or add `contentInsetEndAdjustment` to `contentLength`. Acceptance: opening the 60-turn fixture yields `domGap <= 8` and no pill; scrolling away 300 px and back to the same `scrollTop` yields the same pill state as before leaving.
- DNA: DNA-P3 (a stale/lying control), DNA-L3 (reading lane must be reachable), DNA-ID3 (obvious).
- Effort: S
- Risk: LegendList anchoring and position restore; covered by `MessagesTimeline.logic.test.ts`, `timelineScrollAnchoring.test.tsx`, `useTimelinePositionRestore.test.ts`, `MessagesTimeline.browser.test.tsx`; no test asserts the DOM gap after open. Re-verify on a live (non-cloned) long thread; this repro is on a cloned fixture.
- Upstream-eligible: yes (bug fix in `useTimelineFollow.ts` and `MessagesTimeline.logic.ts`, neither touched by #24865).
- #24865: not addressed

### F-03-02 A user scroll-up during a running turn is reverted, then following is disabled

- Severity: P1
- Surface: web (desktop/mobile share the list)
- Evidence: live Codex turn (thread `a9761336-b63f-49ee-a18b-9380510905ef`, log `t=11888 ms`): before the wheel `scrollTop 257, gap 4`; `mouse.wheel(0, -350)`; 480 ms later `scrollTop 261, gap 0` (the screenshot taken 200 ms after the wheel, `03-stream-scrolled-up-light-1440x900.png`, already shows the end of the stream). On the next content growth the gap grows 99, 198, 298 ... with `scrollTop` frozen at 261 and the pill visible: following was switched off after the revert, so the user is neither anchored where they scrolled nor following. Later wheel-down 200 and 4000 worked and re-armed following at the end. n=1 repro. Prior art: #20366 (snap back while a turn runs), #13706, #17940, #12372, #12754.
- Current: The first scroll-up while `isWorking` is swallowed (LegendList `maintainScrollAtEnd` re-pins on its next layout pass) before the follow mode flips.
- Proposed: Release following synchronously on user intent: in `useTimelineFollow.ts` the `wheel`/`touchmove`/`keydown(PageUp|ArrowUp|Home)` handlers set `timelineScrollModeRef = "away-from-end"` and call `setTimelineLiveFollowEnabled(false)` in the same event (flush with `flushSync` or pass `maintainScrollAtEnd={false}` via a ref read by the list), before the next layout pass; re-arm only when `domGap <= 8` (see F-03-01). Add a browser test that streams rows, dispatches a wheel `-350`, and asserts `scrollTop` is unchanged after 500 ms. Confirm with 16 ms sampling before coding (this audit's sampler was 120-150 ms).
- DNA: DNA-P3, DNA-ID3.
- Effort: M
- Risk: anchoring of the just-sent turn (`anchoredEndSpace`), disclosure pinning (`suspendEndScrollMaintenanceForDisclosure`), find and citation positioning. Tests: `timelineScrollAnchoring.test.tsx`, `timelineScrollTarget.test.ts`; none simulate a user wheel mid-stream.
- Upstream-eligible: yes (the headline open bug; focused).
- #24865: not addressed

### F-03-03 A thread whose only turn exceeds the bounded window opens blank, with a divider that says "Load earlier turns"

- Severity: P1
- Surface: all
- Evidence: open "Huge output stress test" (`mcp:56cf13f9-6c6a-412e-bf5c-8d6320267980`): after 12 s `[data-timeline-row-kind]` count is 0 and the column shows only the hairline divider "Load earlier turns" (`03-huge-initial-light-1440x900.png`). Clicking it surfaces the user prompt and the answer. Code: `MessagesTimeline.tsx:1180-1205` (`TimelineHistoryControl`), `MessagesTimeline.tsx:1085` empty-state branch is skipped because `historyControls !== undefined`; window rule in `docs/internals/performance-regressions.md:15-17` (about 1 MiB of rows).
- Current: The newest and only turn is windowed out, so the user sees an empty thread and a muted 12px divider that names the wrong thing ("earlier" turns; the missing turn is the latest).
- Proposed: In `MessagesTimeline.tsx`, when `rows.length === 0 && historyControls?.hasMoreHistory`, render a real empty state with the `Empty` primitive (`ui/empty.tsx`, `size="compact"`): title "Latest turn not loaded", description "This turn is large, so it was not loaded automatically.", primary `Button size="sm"` "Load turn" (shows `Spinner` while `loading`, error text from `historyControls.error` below in `text-destructive`). Keep the divider only when rows exist. No server change.
- DNA: DNA-P3 (truthful labels), DNA-V3, DNA-ID3 ("the empty thread says one line").
- Effort: S
- Risk: `MessagesTimeline.browser.test.tsx` covers the divider; add a case for zero rows plus `hasMoreHistory`.
- Upstream-eligible: after #24865 merges (same function as its one-line empty-state edit at `MessagesTimeline.tsx:1085`).
- #24865: not addressed

### F-03-04 Loading a 1 MB message blocks the main thread for 2.4 s and mounts 103,074 DOM nodes

- Severity: P1
- Surface: all (web measured)
- Evidence: after "Load earlier turns" on the huge thread: `rows appeared 2413-2557 ms`, one long task of 2,254-2,430 ms, a second of 342-719 ms, DOM nodes 3,843 to 103,074, `usedJSHeapSize` 254 to 435 MB, the single assistant message has 1,521 top-level blocks, `scrollHeight 263,941`. Scrolling afterwards is fine (p95 18 ms, one 344 ms frame), so the cost is the single synchronous render. Experiment: adding `content-visibility: auto; contain-intrinsic-size: auto 80px` to blocks did not change the 2.4 s render (it only helps paint), so CSS alone is not the fix. Screenshot `03-huge-loaded-light-1440x900.png`. Code: `AssistantTimelineRow` (`TimelineAssistantRows.tsx:27-60`) renders the whole `ChatMarkdown`; LegendList virtualises rows, not blocks (`MessagesTimeline.tsx:1117`). User messages already fold (`CollapsibleUserMessageBody`, `TimelineUserMessageRow.tsx:728`).
- Current: One row is one unvirtualised React tree, so one pathological message freezes the window for seconds.
- Proposed: Progressive disclosure for oversize assistant messages, reusing the user-message pattern. In `AssistantTimelineRow`, when `message.text.length > 150_000` (about 150 KB) and the message is not streaming, render only the first 60 top-level blocks (split on the remark AST in `ChatMarkdown` via a `maxBlocks` prop) followed by `Button size="xs" variant="ghost-muted"` "Show remaining 1,461 blocks" (count is real), `data-scroll-anchor-ignore`. Expanding mounts the rest in slices of 150 blocks per animation frame under `startTransition` so the thread stays interactive. `findRevealRef` (already used by the user fold and plan card) expands it when thread find needs the hidden text; `AssistantCitationSource` must treat hidden blocks as unavailable.
- DNA: DNA-P1 (lists hard to render are named regressions), DNA-P3.
- Effort: M
- Risk: find-in-thread counts, selection/citation across the boundary, copy message (must still copy the full text; `resolveAssistantMessageCopyState` uses `message.text`). Tests: `ChatMarkdown.browser.test.tsx`, `threadFindHighlights.browser.test.tsx`; add a 1 MB fixture test.
- Upstream-eligible: no (new behaviour in `ChatMarkdown.tsx`, a #24865 file; also needs maintainer agreement, DNA-P2).
- #24865: not addressed

### F-03-05 A 5,000-line code block is one 89,433 px element with 5,001 line nodes and no collapse

- Severity: P2
- Surface: all
- Evidence: huge thread: `.chat-markdown-codeblock` height 89,433 px, `.line` count 5,001; it dominates the 263,941 px scroll height and scrolling a 4,000-px region of page happens with no landmark. Code: `MarkdownCodeBlock.tsx:60-96` (`MarkdownCodeBlockFrame` has `overflow-hidden` but no max height), `index.css:2071-2078` (`.chat-markdown pre`), `HighlightedCodeLines`. Tool output already caps at `max-h-80` (`V2ItemInspector.tsx` `ToolOutput`) and user messages at `max-h-44`.
- Current: Long code blocks never collapse, so one agent dump pushes the rest of the answer out of reach.
- Proposed: In `MarkdownCodeBlockFrame` collapse blocks over 60 lines to `max-height: 28rem` with the existing `scrollbar-width: thin` and a bottom fade (same gradient recipe as `CollapsibleUserMessageBody`: `mask-image: linear-gradient(to bottom, black calc(100% - 1.75rem), transparent)`), plus a footer `Button size="xs" variant="ghost-muted"` "Show all 5,001 lines" / "Show less". Copy and Run still use the full `code`. Collapsed blocks are `overflow-y: hidden` (no nested scroller, so no scroll trap); expanded is natural height. `data-scroll-anchor-ignore` on the toggle.
- DNA: DNA-D6 (degrade, do not clip silently), DNA-P1, DNA-K12 (keep 13px code, header, copy).
- Effort: M
- Risk: find in thread inside collapsed code (use `findRevealRef`), streaming blocks (never collapse while `isStreaming`), `ChatMarkdown.browser.test.tsx`.
- Upstream-eligible: no (touches `MarkdownCodeBlock.tsx` plus `index.css`; feature-shaped, needs approval).
- #24865: not addressed (PR changes only `pre` radius 12px to 8px)

### F-03-06 A 201-row table renders 7,646 px tall with no cap or sticky header

- Severity: P3
- Surface: all
- Evidence: huge thread `.chat-markdown-table-container` height 7,646 px, 201 rows. Code: `MarkdownTable.tsx:97-110` (`ScrollArea ... scrollFade`, horizontal only); `index.css:2127-2200` table rules.
- Current: Only horizontal overflow is handled; vertical length is unbounded and headers scroll away.
- Proposed: for tables with more than 40 body rows add `max-h-[28rem]` on the `ScrollArea` viewport (vertical chain left on: `chainVerticalScroll` is already set) and `thead th { position: sticky; top: 0; background: var(--background); }`.
- DNA: DNA-K12 (row separators only, keep), DNA-D6.
- Effort: S
- Risk: copy-as-markdown/CSV reads the DOM table (unchanged); `ChatMarkdown.browser.test.tsx`.
- Upstream-eligible: no (`index.css` and `ChatMarkdown` family, feature-shaped).
- #24865: not addressed

### F-03-07 Reaching the start of a 60-turn thread takes about 19 clicks on "Load earlier turns"

- Severity: P2
- Surface: web, desktop
- Evidence: long thread opens with 13 rows (about 4 turns); `scrollHeight` after each click: 3,533 then 7,044, 10,196, 13,424, 16,734, 18,783 (about 3,000 px, 3 turns, per click, 1.6-1.7 s each); 60 turns is about 19 clicks. MAP.md 3.3: "Nothing auto-loads on scroll: paging is an explicit control." Prior art: #20427 (each history page re-reads the whole thread server-side, so auto-paging has a server cost), #23081 (earlier history "disappears" after compaction), #23760.
- Current: Scrolling to the top stops at a small hairline button; the user must find it and click repeatedly.
- Proposed: Keep the button (keyboard and test path) and add a sentinel: an `IntersectionObserver` (via `lib/observeResize.ts` neighbour helper, rootMargin `600px 0px 0px 0px`) on `TimelineHistoryControl` that calls `onLoadEarlier()` when the sentinel enters the margin, `!loading`, `hasMoreHistory`, and the user has scrolled up at least once (never on first paint). Debounce 400 ms. Gate behind the server-cost caveat in #20427: ship only after the page endpoint is incremental, or cap auto-paging to 3 pages then fall back to the button.
- DNA: DNA-ID3 (obvious), DNA-P1.
- Effort: S
- Risk: `maintainVisibleContentPosition` jumps, citation `throughEntryId` loads, server load.
- Upstream-eligible: no (behaviour change in `MessagesTimeline.tsx`, needs discussion first).
- #24865: not addressed

### F-03-08 "Working for 27s" keeps ticking and shimmering while the thread is waiting for the user's approval

- Severity: P1
- Surface: all
- Evidence: Codex Supervised thread with a pending `curl` approval: `Working for 27s` then `Working for 33s` six seconds later, `document.getAnimations()` shows `live-tool-shine` the whole time; sidebar row says "Approval". Screenshot `03-approval-pending-dark-1440x900.png`. Code: `awaitingUser` is already in `TimelineRowActivityCtx` (`timelineRowContext.ts:98`, set at `MessagesTimeline.tsx:~966`) and used only by the announcer and MCP app frame; `WorkingTimelineRow` (`TimelineWorkGroupRows.tsx:286-310`) ignores it.
- Current: The timeline claims the agent is working when it is blocked on the human; the timer keeps counting the human's thinking time.
- Proposed: in `WorkingTimelineRow` read `awaitingUser`; when true render a static label (no `WorkingTimer`, no `ActivityShimmerOverlay`, no `observeVisibleAnimation`) "Waiting for approval" (approval) or "Waiting for your answer" (input), text `text-muted-foreground`; also skip the `live-tool-shine` class in the pending command row (see F-03-09). `WorkingTimelineRow` needs the kind: extend `awaitingUser` in `TimelineRowActivityState` from `boolean` to `"approval" | "input" | null` (`MessagesTimeline.tsx` already has that value at the prop).
- DNA: DNA-P3, DNA-M9 (status must not lie), DNA-K5.
- Effort: S
- Risk: `MessagesTimeline.active-tools.test.ts`, `MessagesTimeline.browser.test.tsx`; announcer unchanged.
- Upstream-eligible: yes if the label edit stays in `TimelineWorkGroupRows.tsx`/`timelineRowContext.ts`; the `awaitingUser` value is read in `MessagesTimeline.tsx` (a #24865 file, trivial rebase).
- #24865: not addressed

### F-03-09 The pending command row shows the shell wrapper and a generic bubble icon, not the command or the waiting state

- Severity: P2
- Surface: all
- Evidence: screenshots `03-approval-pending-light-1440x900.png` / `-dark-`: the row reads `/bin/zsh -lc 'curl -sI https://example.com'` with a speech-bubble glyph, in the timeline, while the real approval lives in the composer banner. Compare the finished command rows (`>_ npm test ...`, terminal glyph). Code: `TimelineWorkEntryRow.tsx` `workToneIcon`, `workEntryDisplayLabel` (`MessagesTimeline.logic.ts`).
- Current: The timeline row for the exact thing awaiting approval looks like chatter, and does not say it is waiting.
- Proposed: for an item whose request is pending approval, use the terminal glyph, strip a leading `/bin/zsh -lc '...'` (or `bash -lc`) wrapper for the label (the same `commandHighlightLanguage`/label helpers already live in `client-runtime/work-log/command-label`), and add a trailing `text-xs text-warning-foreground` "Waiting for approval" (`TimelineWorkEntryRow.tsx` trailing slot, before the chevron). Row stays non-interactive until resolved.
- DNA: DNA-P3, DNA-C6 (warning text uses `*-foreground`), DNA-T7.
- Effort: S
- Risk: label helpers have tests in client-runtime; add a case for the wrapper.
- Upstream-eligible: yes (focused, files untouched by #24865).
- #24865: not addressed

### F-03-10 "Command approval" label is 11px amber at 2.08:1 in light mode

- Severity: P2
- Surface: all
- Evidence: `ComposerPendingApprovalPanel.tsx:52` `shrink-0 font-medium text-warning` inside a `text-2xs` (11px) row. Measured `text-warning` against the light canvas: 2.08:1 (dark 9.27:1); `text-warning-foreground` is 4.90:1 light, 11.49:1 dark. The label sits on the warning tint, which is lower again. Screenshot `03-approval-pending-light-1440x900.png`. Boundary: the banner stack is area 04; the approval prompt is in this brief, so it is recorded here and cross-referenced.
- Current: The only text naming what is being asked (command, file read, file change, app access) is the lowest-contrast text in the banner.
- Proposed: `text-warning` to `text-warning-foreground` at `ComposerPendingApprovalPanel.tsx:52` and raise `text-2xs` to `text-xs` on that label row (the `appName`, `1/N` counter stay `text-2xs text-muted-foreground`).
- DNA: DNA-C5, DNA-C6.
- Effort: XS
- Risk: none functional; visual only.
- Upstream-eligible: yes.
- #24865: not addressed (PR changes `--diff-*-foreground` only; `--warning` is unchanged)

### F-03-11 "Copy code" and "Copy table" silently do nothing without the Clipboard API (HTTP on a LAN or Tailscale address)

- Severity: P1
- Surface: web (remote-ready surface), desktop unaffected
- Evidence: emulating a non-secure context (`navigator.clipboard === undefined`): clicking "Copy code" leaves `aria-label="Copy code"`, no toast, nothing copied; the message-level copy in the same page works and shows "Copied!" (it goes through `writeTextToClipboard`, which falls back to `execCommand`, `hooks/useCopyToClipboard.ts:55-95, 98-135`). Code: `MarkdownCodeBlock.tsx:171-175` and `MarkdownTable.tsx:72-80` return early on `navigator.clipboard == null` with no feedback. Screenshot `03-copy-no-clipboard-api-light-1440x900.png`. Prior-art cluster: copy and paste fail (#8361, #23930, #20207, #15927, #23619, #21006).
- Current: The documented remote path (`npx t3` over LAN, AGENTS.md "Remote ready") breaks code and table copy with no error.
- Proposed: replace both handlers with `writeTextToClipboard(code, "code block")` / `writeTextToClipboard(markdownOrCsv, "table")` from `hooks/useCopyToClipboard.ts` (already hardened), keep the 1,200 ms `copied` morph, and on rejection call `reportMarkdownActionFailure` plus `showAnchoredCopyErrorToast(ref, error)` (as `MessageCopyButton` does). Also covers the `copy-table` menu items.
- DNA: DNA-P9 (nothing may assume a secure context), DNA-V3.
- Effort: S
- Risk: `ChatMarkdown.browser.test.tsx`; add a test that stubs `navigator.clipboard` undefined and asserts `execCommand` copy.
- Upstream-eligible: yes (small, fix-shaped; `MarkdownCodeBlock.tsx` and `MarkdownTable.tsx` are untouched by #24865).
- #24865: not addressed

### F-03-12 The message copy button disables itself after a click, dropping keyboard focus to the page

- Severity: P2
- Surface: all
- Evidence: click or Enter on "Copy message" then `document.activeElement` is `BODY` (measured). Code: `MessageCopyButton.tsx:45` `disabled={isCopied}` for `ANCHORED_COPY_TOAST_TIMEOUT_MS`. Same component backs user, assistant and prompt-link copies.
- Current: A keyboard or switch user who copies a message loses their place and must Tab from the top of the document.
- Proposed: remove `disabled={isCopied}`; guard with `onClick={() => { if (!isCopied) copyToClipboard(text); }}`; keep the icon morph and the anchored toast.
- DNA: DNA-I4, non-negotiable 6 (focus rings and keyboard paths).
- Effort: XS
- Risk: none; `MessageCopyButton` has no test.
- Upstream-eligible: yes.
- #24865: not addressed

### F-03-13 Copy success is announced by toast for messages but only by an icon morph for code blocks and tables

- Severity: P3
- Surface: all
- Evidence: message copy shows the anchored "Copied!" toast (`MessageCopyButton.tsx:21-26`); code block copy flips `aria-label` to "Copied" and the icon to a check (`MarkdownCodeBlock.tsx:122-126, 188-197`); table copy likewise (`MarkdownTable.tsx:46-47`); tool output and commands have no copy at all (F-03-16). Label changes are not announced by screen readers.
- Current: Three copy affordances, three feedback behaviours; assistive tech hears nothing for two of them.
- Proposed: keep the morph; add one visually hidden live region next to each icon button: `<span role="status" className="sr-only">{copied ? "Copied" : ""}</span>` in `MarkdownCodeBlock` and `MarkdownTable`. No new toast.
- DNA: DNA-V5 (consistent), DNA-I4.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes.
- #24865: not addressed

### F-03-14 A "Thinking" row stays under text that is already streaming

- Severity: P2
- Surface: all (Codex observed)
- Evidence: Codex turns 3 and 4: row order while the answer streams is `message, working, message, work-toggle, message(streaming), thinking`; screenshot `03-stream-text-with-thinking-row-light-1440x900.png` shows sections 1-3 and a table already on screen with `Thinking` below them and `Working for 12s` above. Code: thinking row built in `MessagesTimeline.logic.ts` near the `assistantCopyStreaming` branch (`:2009`), rendered by `ThinkingTimelineRow` (`TimelineWorkGroupRows.tsx`).
- Current: The label describes the reasoning phase that ended; the agent is writing.
- Proposed: do not emit the `thinking` row while the last timeline row is an assistant message with `message.streaming === true`; if reasoning resumes later the row reappears. No new copy needed.
- DNA: DNA-P3, DNA-M9.
- Effort: S
- Risk: `MessagesTimeline.logic.test.ts` and `MessagesTimeline.active-tools.test.ts` expectations on row order.
- Upstream-eligible: yes.
- #24865: not addressed

### F-03-15 Claude answers appear in one chunk after 8 s of "Thinking"; no incremental text

- Severity: P2
- Surface: all (provider-dependent; server or adapter dependency)
- Evidence: Claude Haiku 5.5, Low effort, 3 KB answer: 66 samples at 120 ms showed `Working for ...`/`Thinking` and zero `.chat-markdown[data-streaming]` nodes; `scrollHeight` jumped 848 to 2,959 inside one sample at t=8,193 ms; the finished screenshot `03-claude-answer-done-light-1440x900.png`. The same UI streamed Codex text incrementally (2 to 38 blocks over 7 s). `ClaudeAdapterV2.ts:1395` sets `includePartialMessages: true`, so the gap is in projection or delivery, not the option. The earlier markdown turn showed the same silence for 31 s of sampling.
- Current: For Claude the user sees a spinner and gets the entire answer at once, so the stream-fade, incremental code blocks and "Stop early" decisions never happen.
- Proposed: dependency (not UI): trace why `stream_event` text deltas do not reach `assistant_message` partials for Claude in orchestration v2 (`ClaudeAdapterV2.ts:~7650`). UI part is gated and needs no change; do not add a client-side typewriter.
- DNA: DNA-P3 (status must reflect real state), DNA-M7.
- Effort: M (server)
- Risk: apps/server is out of scope for UI work (non-negotiable 4).
- Upstream-eligible: no (server).
- #24865: not addressed

### F-03-16 Collapsed tool rows cannot be selected and commands and outputs have no copy button

- Severity: P2
- Surface: web, desktop
- Evidence: `WorkLog.tsx:57` `select-none [&_*]:select-none` on every row; the label is `user-select: none` (measured). Expanded panels have `select-text` (`V2ItemInspector.tsx` `monoClassName`) but no button. `CommandBlock.tsx` (44 lines, with a copy button) exists and is used only by onboarding and browser surfaces. Prior art: #8057 ("clicking a command only expands the command text"), copy cluster #8361/#23930, discussion #21675.
- Current: To reuse a command the agent ran you must expand the row, then drag-select mono text inside a scrolling panel.
- Proposed: in the expanded `ShellCommandBlock` wrapper (`V2ItemInspector.tsx`) and `CommandOutputPanel`/`ToolOutput`, add a top-right `Button size="icon-xs" variant="ghost-muted" aria-label="Copy command"` / `"Copy output"` using `useCopyToClipboard({ target: "command" })` (the `CommandBlock` pattern); leave the collapsed row `select-none` because the row itself toggles on click.
- DNA: DNA-I4, DNA-ID3, DNA-L8.
- Effort: S
- Risk: output panel has `max-h-80` scroller; copy must take `data.output.text` not the truncated tail ("Earlier output not shown"). Name that in the tooltip when truncated.
- Upstream-eligible: yes (fix-shaped, files untouched by #24865).
- #24865: not addressed

### F-03-17 The expanded command row repeats the command, and the collapsed label is sans

- Severity: P3
- Surface: all
- Evidence: `03-tests-tool-expanded-light-1440x900.png`: the row label `npm test 2>&1; echo "-----"; git log --oneline` (14px system font, `text-secondary-label`) is immediately followed by the same command in the highlighted mono block. Measured label `font-family: -apple-system...` at 14px.
- Current: Duplicated line, and the one literal command is set in the UI font (DNA-T7: mono is for commands).
- Proposed: when a command row is expanded switch the label to "Ran command" (`text-muted-foreground`), and render the collapsed command label in `font-mono text-xs` (`headingClass` branch for `workLogEntryIsToolLike` command rows, `TimelineWorkEntryRow.tsx:~315`).
- DNA: DNA-T7, DNA-P2.
- Effort: S
- Risk: `WorkLog` truncation and accessible names (`aria-label` stays the command).
- Upstream-eligible: yes.
- #24865: not addressed

### F-03-18 The running-command label says "Running git", not which command

- Severity: P3
- Surface: all
- Evidence: `_t3-s3` capture (Codex turn 3): `>_ Running git` while `git status --short` runs; the earlier `seq 1 400` was invisible at that moment. Prior art: discussion #21675 (show underlying command for wrappers), #8057.
- Current: The live label carries the tool family only; you must expand to learn the command.
- Proposed: `liveWorkEntryLabel` (`MessagesTimeline.logic.ts`) appends the first 60 characters of the command in `font-mono`: `Running git status --short`. Truncate with the existing `truncate` on the label span.
- DNA: DNA-P3, DNA-T7.
- Effort: XS
- Risk: tests asserting "Running git".
- Upstream-eligible: yes.
- #24865: not addressed

### F-03-19 In-prose links have no resting underline and are 1.15:1 (light) / 1.55:1 (dark) against body text

- Severity: P2
- Surface: all
- Evidence: measured link `--info-foreground` against the surrounding paragraph text: light 1.15:1, dark 1.55:1; `text-decoration: none` at rest (`index.css:1964`), dotted underline only on hover/focus via `radial-gradient` (`index.css:1968-1990`). External links get a globe favicon cue, relative/same-document links do not. Screenshot `03-md-torture-0-light-1440x900.png`.
- Current: Distinguishing links from text relies on hue alone at rest, below the 3:1 non-text threshold (DNA-C5 spirit).
- Proposed: replace the rest state with `text-decoration-line: underline; text-decoration-style: dotted; text-decoration-thickness: 1px; text-underline-offset: 0.2em; text-decoration-color: color-mix(in srgb, currentcolor 50%, transparent)` and on hover/focus-visible `text-decoration-style: solid; text-decoration-color: currentcolor`; delete the `background-image: radial-gradient(...)` hack. Scope stays `.chat-markdown a:not(.chat-markdown-file-link, :has([data-slot="context-chip-label"]), [data-markdown-image-link])`.
- DNA: DNA-C5, DNA-P2.
- Effort: XS
- Risk: link-heavy answers get busier; `ChatMarkdown.browser.test.tsx` link tests unaffected.
- Upstream-eligible: after #24865 merges (`index.css`).
- #24865: not addressed (90% body text lowers the text/link gap further)

### F-03-20 Inline code like `I/W217:220` becomes a file chip

- Severity: P2
- Surface: all
- Evidence: reproduced in the markdown thread: the log tag renders as the pill "W217 . L220" with a generic file icon (`03-md-torture-0-light-1440x900.png`, `03-md-light-390x844.png`). Code: `inlineCodeFilePathCandidate` (`packages/shared/src/markdownLinks.ts`, imported at `ChatMarkdown.tsx:7`). Prior art: #22181 (the `:line` suffix skips the extension check), discussion #21220 (asks to disable file pills).
- Current: Any `word/word123:123` token is treated as a path with a line.
- Proposed: apply the same known-extension (or workspace-resolved) check with and without a `:line` suffix; tokens with no dot-extension and no resolved file stay plain `code`.
- DNA: DNA-P3.
- Effort: S
- Risk: `markdownLinks` unit tests; extensionless files such as `Makefile:12` (keep an allow-list or the resolved-entry cache).
- Upstream-eligible: yes (#22181, tiny, in `packages/shared`).
- #24865: not addressed

### F-03-21 Inline code inside headings and tables is a fixed 12px

- Severity: P3
- Surface: all
- Evidence: measured code `12px` inside an `18px` h2 (`03-md-torture-0-light-1440x900.png`) and inside 12px table cells (#24166). Code: `index.css:2058` `.chat-markdown :not(pre) > code { font-size: 0.75rem }`.
- Current: A fixed rem size ignores the surrounding type.
- Proposed: `font-size: 0.85em` (what #24865 ships); add the table follow-up `.chat-markdown table :not(pre) > code { font-size: 1em }` so code in a 12px cell is not 10.2px (below the DNA 11px floor).
- DNA: DNA-T4, DNA-T1.
- Effort: XS
- Risk: low.
- Upstream-eligible: no, #24865 covers the heading case; only the table follow-up is new.
- #24865: addressed (headings); table follow-up not addressed

### F-03-22 Zero diff counts are coloured like real changes ("+20 -0" with a red 0)

- Severity: P3
- Surface: all
- Evidence: `03-cap-light-1440x900.png` and `03-cap-light-390x844.png`: "+15 -0", "+5 -0", header "+20 -0", all with a red `-0`. Code: `DiffStatLabel.tsx:43-46` colours both sides unconditionally. Measured light contrast of `text-diff-addition` 2.41:1, `text-diff-deletion` 3.71:1 (11-12px mono).
- Current: A red number says "something was deleted".
- Proposed: `additions > 0 ? "text-diff-addition-foreground" : "text-muted-foreground"` and the same for deletions (DNA-C7 keeps green/red for real changes). `DiffStatLabel` is shared with the sidebar and diff panel, so the change lands everywhere at once.
- DNA: DNA-C7, DNA-P3.
- Effort: XS
- Risk: none functional; shared with area 05.
- Upstream-eligible: after #24865 merges (it edits the same two spans).
- #24865: partial (switches to the darker `-foreground` tokens, 3.56:1 to about 5.5:1 in light; zero counts still red)

### F-03-23 "Open diff" is icon-only on phone widths

- Severity: P2
- Surface: web (phone width), mobile web
- Evidence: `ChangedFilesTree.tsx:114` `<span className="hidden @[24rem]/changed-files:inline">Open diff</span>`; the card is about 21rem wide at 390px, so only a "file plus-minus" glyph shows (`03-cap-light-390x844.png`). The tooltip "Open the full diff" never appears on touch. The docs list **Open diff** as a primary action (activity-log.md).
- Current: The main action of the changed-files card is an unlabeled icon exactly where hover tooltips do not exist.
- Proposed: container threshold from `@[24rem]` to `@[18rem]` (288px). At the 342px card width the header holds "2 changed files +20 -0" (about 175px), the 24px chevrons button and an 80px "Open diff" button.
- DNA: DNA-I4, DNA-X4.
- Effort: XS
- Risk: very narrow lanes under 18rem still show the icon.
- Upstream-eligible: yes (one class).
- #24865: not addressed

### F-03-24 Timestamps on turn folds and tool rows exist only on hover

- Severity: P2
- Surface: mobile web, touch
- Evidence: `TimelineRowParts.tsx:30` uses `opacity-0 ... group-hover/timeline-row:opacity-100` with no `pointer-coarse:` branch (the user and assistant action rows do have one). At 390px the "Worked for 37s >" row shows no time (`03-md-light-390x844.png`); the only timestamps visible are on user messages.
- Current: On touch there is no way to read when a turn happened except by opening it.
- Proposed: add `pointer-coarse:pointer-events-auto pointer-coarse:static pointer-coarse:opacity-100` to the base class string in `TimelineRowTimestamp`; tool rows opt out with `className="pointer-coarse:hidden"` (24px rows have no room), the turn-fold row (`ms-auto`) keeps it.
- DNA: DNA-X4.
- Effort: XS
- Risk: row height on coarse pointers (the fold row has `pb-2` slack).
- Upstream-eligible: yes.
- #24865: not addressed

### F-03-25 Timeline chrome text and icons under contrast floors

- Severity: P2
- Surface: all
- Evidence: measured: `text-2xs text-muted-foreground/70` 2.73:1 light, 3.05:1 dark; `opacity-70` on a muted 12px chevron is the same ratio. Instances: `TimelineUserMessageRow.tsx:427` "Sent by T3 Code"; `TimelineSystemDivider.tsx:24` detail text (compaction summary, interrupt message, "Subagent of" parent title); `TimelineWorkEntryRow.tsx:494` chevron `text-icon-muted opacity-70`. DRIFT-1.
- Current: Small text and the only expand affordance on every tool row sit under 3:1.
- Proposed: remove the `/70` and `opacity-70` modifiers at those three sites (the muted token alone is 4.71:1 light, 5.08:1 dark); keep size.
- DNA: DNA-C4, DNA-C5, DRIFT-1.
- Effort: XS
- Risk: slightly louder quiet text; visual only.
- Upstream-eligible: yes.
- #24865: partial (dark `--muted-foreground` to neutral-400 lifts the dark case to about 4.3:1; light unchanged)

### F-03-26 "Edit from here" uses an undo arrow

- Severity: P3
- Surface: web, desktop
- Evidence: `TimelineUserMessageRow.tsx:695` `<Undo2Icon className="size-3" />` inside a `size="xs"` ghost button (24x24) labelled "Edit from here" (`03-user-message-hover-dark-1440x900.png`). Same row has a copy icon and a link icon; the glyph reads as "undo". The dialog it opens is titled "Edit from here?" (`03-edit-from-here-dialog-light-1440x900.png`) with buttons "Revert files too" / "Revert and keep changes".
- Current: The icon promises a reversible undo; the action rewinds history and returns the prompt to the composer.
- Proposed: `Undo2Icon` to `PencilIcon` (Lucide, `size-3`); tooltip and dialog copy unchanged. `Undo2Icon` stays available for the queue or interrupt contexts.
- DNA: DNA-I1, DNA-I4, DNA-V2.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes.
- #24865: not addressed

### F-03-27 The dark user bubble is 1.07:1 against the canvas

- Severity: P3
- Surface: all
- Evidence: measured `bubbleVsCanvas` 1.07 in both themes (dark bubble is `--message-surface: var(--accent)` = white 4% over `#0a0a0a`). Screenshots `03-explain-dark-1440x900.png`, `03-user-message-rest-dark-1440x900.png`. In a long thread the bubble is the landmark for finding your own prompts.
- Current: Dark bubbles are only distinguishable by text position.
- Proposed: dark `--message-surface` to `--alpha(var(--color-white) / 7%)` (one step above `--accent` 4%, below hover accent), giving about 1.12:1. Canvas stays `#0a0a0a` (owner call).
- DNA: DNA-C3 (surfaces step by lightness).
- Effort: XS
- Risk: user bubble stands next to `bg-input/32` code blocks; check no collision.
- Upstream-eligible: after #24865 merges (`index.css` dark block).
- #24865: partial (darkens light `--message-surface`; dark re-pinned to `--accent` explicitly)

### F-03-28 In forced-colors mode the user bubble and changed-files card lose their shape

- Severity: P3
- Surface: all (high contrast)
- Evidence: `03-cap-forced-colors-1440x900.png` (`forcedColors: active`, `prefers-reduced-motion: reduce`): the "Agent ..." pill has no visible boundary; the "2 changed files" card is borderless. Code: `bg-message` bubbles use background only (`TimelineUserMessageRow.tsx:~457-460`, `FoldedMessageHeader`), `ChangedFilesCard` (`ChangedFilesTree.tsx:~78`) is `bg-secondary`.
- Current: Background fills are removed in forced colors, leaving unbounded text.
- Proposed: add `border border-transparent` (forced colors repaints it as `CanvasText`) to the user bubble and changed-files card; compensate padding with `p-[calc(--spacing(3)-1px)]` per DNA-SP3 so layout is unchanged.
- DNA: DNA-SP3, non-negotiable 6 (high contrast).
- Effort: S
- Risk: pixel shifts if padding is not compensated.
- Upstream-eligible: yes.
- #24865: not addressed

### F-03-29 Question option buttons have a near-invisible focus ring

- Severity: P2
- Surface: all (code-read)
- Evidence: `ComposerPendingUserInputPanel.tsx:255` `focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-primary/25`: a 1px ring at 25% of primary, below 3:1 on any surface (DRIFT-17). Option buttons are also the only way to answer with the keyboard besides the 1-9 document listener. Not exercised live (no question turn was run; budget used on streaming and approval).
- Current: The focused option is not visible.
- Proposed: `focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring` (the `button.tsx:9` treatment).
- DNA: DNA-S3, non-negotiable 6, DRIFT-17.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes.
- #24865: not addressed

### F-03-30 One throwing row blanks the whole app

- Severity: P2
- Surface: all (code-read)
- Evidence: `RenderErrorBoundary` wraps only leaf renderers (`ChatMarkdown.tsx`, `MarkdownMath.tsx`, `MarkdownMermaidCodeBlock.tsx`, `V2ItemInspector.tsx`, `ShellCommandBlock.tsx`, `SnapShotAttachmentDetails.tsx`); `TimelineRowContent` (`MessagesTimeline.tsx:1222`) and `renderItem` (`:1045`) have none, so a render exception in any row rises to `RootRouteErrorView` (`routes/__root.tsx:414-447`), which replaces sidebar, thread and panels with "Something went wrong." Issue #16195 ("Text rendering is broken in the thread", needs more info) is the likely field symptom. Trigger not reproduced.
- Current: Blast radius of a bad row is the entire window.
- Proposed: wrap `<TimelineRowContent row={item} />` in `RenderErrorBoundary` with `resetKeys={[item.id, item.kind === "message" ? item.message.updatedAt : item.id]}` and a fallback `TimelineSystemDivider tone="danger" label="This message could not be displayed"` (message rows add an `actionLabel="Copy raw text"` copying `message.text`). Use the existing component; no new library.
- DNA: DNA-P3, DNA-K10.
- Effort: S
- Risk: LegendList recycles containers; resetKeys must change when a recycled container receives a new row. No test covers row failure.
- Upstream-eligible: no (`MessagesTimeline.tsx`, a #24865 file); small enough to ship right after.
- #24865: not addressed

### F-03-31 A link to a deleted or unknown thread silently lands on a new draft

- Severity: P2
- Surface: all
- Evidence: opening `/<env>/mcp%3A00000000-0000-4000-8000-000000000000` redirects to `/draft/<id>` showing "What should we build in sample-app?" with no message (`03-thread-missing-light-1440x900.png`). Code: `ThreadRouteView.tsx:147-158` (`renderState === "missing"` then `navigate({ to: "/", replace: true })`).
- Current: Stale bookmarks, notification clicks and shared links look like a working empty app.
- Proposed: when `renderState === "missing" && !background && environmentHasAnyThreads`, call `toastManager.add({ type: "warning", title: "Thread not found", description: "It may have been deleted or belongs to another environment." })` once before navigating. Copy follows DNA-V3.
- DNA: DNA-P3, DNA-V3.
- Effort: XS
- Risk: duplicate toasts on re-render (guard with a ref keyed by thread key).
- Upstream-eligible: yes (area 12 owns toast style; this is the call site).
- #24865: not addressed

### F-03-32 Message content shows through the 20 px strip below the composer

- Severity: P2
- Surface: all
- Evidence: measured at 1440x900 and 1024x640: composer surface bottom is 20 px above the viewport bottom (16 px at 390px) while `.messages-timeline-scroll` extends to the viewport edge (`scrollBottom 900`), so rows paint in that strip. See `03-md-math-light-1440x900.png` (footnote text at y=893), `03-md-dark-1024x640.png` (task checkbox under the composer at y=634), `03-md-font20-light-1440x900.png`. Code: composer overlay `data-chat-composer-overlay` (`ChatView.tsx:~3448`).
- Current: Half-cropped text and controls are visible under a floating composer; it looks unfinished.
- Proposed: add `<div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-5 bg-background sm:h-5 max-sm:h-4" />` inside the chat canvas (heights 20px desktop, 16px at `<sm`) below the composer overlay, or clip the scroller with `clip-path: inset(0 0 var(--composer-bottom-gap) 0)`. DNA-C12: grain stays on chrome, so the strip uses the canvas colour.
- DNA: DNA-C11 (only the composer floats; the rest is flat), DNA-S4.
- Effort: XS
- Risk: must not cover the "Scroll to end" pill (it sits above the composer); mobile composer docking transition (`index.css:17-76`).
- Upstream-eligible: yes (one element in `ChatView.tsx`).
- #24865: not addressed

### F-03-33 The in-flow plan card uses a floating-object radius

- Severity: P3
- Surface: all
- Evidence: `ProposedPlanCard.tsx:161` `rounded-3xl` (22px today) on a card that sits in flow; DNA-S1 reserves 22 for the composer and details card. Also `Expand plan` / `Collapse plan` (`:228`) is a centered outline `sm` button, unlike `Show full message` (F-03-34). Not rendered live (no plan turn); code-read.
- Current: A flow card as round as the composer.
- Proposed: `rounded-xl` (12px after #24865; the in-flow card rung used by settings groups).
- DNA: DNA-S1, DNA-S4.
- Effort: XS
- Risk: none.
- Upstream-eligible: after #24865 merges (same line).
- #24865: partial (`rounded-3xl` to `rounded-2xl`, i.e. 22px to 16px; still a dialog-rung radius)

### F-03-34 Five different disclosure patterns with three vocabularies

- Severity: P3
- Surface: all
- Evidence: user message: `Button size="xs" variant="ghost-muted"` "Show full message" / "Show less", bottom-start (`TimelineUserMessageRow.tsx:~760`); plan: `Button size="sm" variant="outline"` centered "Expand plan" / "Collapse plan" (`ProposedPlanCard.tsx:228`); markdown `<details>`: "Click to expand" chevron row; turn and tool groups: chevron rows ("Worked for 17s >"); tables: icon-only. Screenshots `03-md-torture-2-light-1440x900.png`, `03-tests-pill-expanded-light-1440x900.png`.
- Current: Same job, different widgets and verbs; DNA-V7 says do not coin synonyms.
- Proposed: one rule: text truncation uses `Button size="xs" variant="ghost-muted"` "Show more" / "Show less" at the bottom-start with the existing fade mask; chevron rows are for structural groups only. Apply to the user fold ("Show full message" to "Show more"), plan ("Expand plan" to "Show more"), and large code blocks (F-03-05).
- DNA: DNA-V7, DNA-V2, DNA-P2.
- Effort: S
- Risk: copy-matching tests (`Show full message`), docs mentions.
- Upstream-eligible: no (touches `ProposedPlanCard.tsx`).
- #24865: not addressed

### F-03-35 Context compaction renders in two different components

- Severity: P3
- Surface: all
- Evidence: `ContextCompactionTimelineRow` (`MessagesTimeline.tsx:1327`: `text-xs`, `Minimize2Icon`, `role="separator"`, `bg-border/70` rules, shimmer when active) versus the `compaction` item in `V2LifecycleRow.tsx:115-130` (`TimelineSystemDivider`: `text-2xs`, `MinusIcon`, detail at `opacity-70`). Which shows depends on the data source.
- Current: The same notice has two sizes, two icons and two contrasts.
- Proposed: render the row through `TimelineSystemDivider` with a new optional `active?: boolean` that applies `ActivityShimmerOverlay`, icon `Minimize2Icon`, size `text-xs`; delete the bespoke markup.
- DNA: DNA-P6 (compose slots), DNA-T1.
- Effort: S
- Risk: `role="separator"` and `aria-label` must be kept; `MessagesTimeline.logic.test.ts` row kinds.
- Upstream-eligible: no (`MessagesTimeline.tsx`).
- #24865: not addressed

### F-03-36 The fork button pulses with an unstepped animation

- Severity: P3
- Surface: all
- Evidence: `TimelineAssistantRows.tsx:118` `busy && "animate-pulse"` on `GitForkIcon` (Tailwind `animate-pulse`, continuous, not stepped, no `motion-safe:`). DRIFT-8.
- Current: Breaks DNA-M2 for the length of a fork request.
- Proposed: swap the icon for `<Spinner className="size-3" />` while `busy` (`ui/spinner.tsx`, visibility-aware).
- DNA: DNA-M2, DNA-M6, DRIFT-8.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes.
- #24865: not addressed

### F-03-37 Voice drift in thread-view strings

- Severity: P3
- Surface: all
- Evidence: ASCII ellipses `Working...` (`TimelineWorkGroupRows.tsx:300`) and `Saving...` (`ProposedPlanCard.tsx:303`); contraction `Couldn't load output` (`CommandOutputPanel.tsx:49`, `V2ItemInspector.tsx:179`); `Unable to open file` / `Unable to open file in browser` (`MarkdownFileLink.tsx` toasts) and `Unable to link pull request` (`ChatMarkdown.tsx`). DRIFT-12, DRIFT-14.
- Current: Three error prefixes and two ellipsis styles inside one screen.
- Proposed: `Working…`, `Saving…`, `Could not load output: ...`, `Could not open file`, `Could not open file in browser`, `Could not link pull request`.
- DNA: DNA-V4, DNA-V9.
- Effort: XS
- Risk: string-matching tests.
- Upstream-eligible: yes for files untouched by #24865; `ChatMarkdown.tsx`/`ProposedPlanCard.tsx` strings after merge.
- #24865: not addressed

### F-03-38 A failed image renders a 480x270 placeholder

- Severity: P3
- Surface: all
- Evidence: markdown thread: `![alt](docs/missing.png)` renders a 16:9 `bg-muted/60` frame (480x270) with a centered "Image unavailable · alt text for missing image" (`03-md-torture-3-light-1440x900.png`). Code: `ChatMarkdownMedia.tsx:142` `aspect-video w-full overflow-hidden bg-muted/60`. A compact failure fallback already exists (`ChatMarkdownImageFallback`, `ChatMarkdownMedia.tsx:~118-135`, a 24px chip).
- Current: A missing image costs 270 px of the column.
- Proposed: keep the 16:9 skeleton only while loading; on error switch to `ChatMarkdownImageFallback`.
- DNA: DNA-D6, DNA-P2.
- Effort: S
- Risk: layout shift on error; `ChatMarkdown.browser.test.tsx` image tests.
- Upstream-eligible: yes.
- #24865: not addressed

### F-03-39 Code blocks show an icon, not the language, for known languages

- Severity: P3
- Surface: all
- Evidence: `MarkdownCodeBlock.tsx:103-125`: when a Pierre icon exists the header is the icon with `aria-label="Language: ts"` and a tooltip; text only for icon-less languages (`:113-115`). Screenshot `03-md-torture-1-light-1440x900.png`: a tiny "TS" badge, a "$" glyph for bash, `{}` for json.
- Current: The language label is a hover-only tooltip.
- Proposed: always render `<span className="truncate">{language}</span>` after the icon (`font-mono text-2xs`, the slot already used for icon-less languages); the icon becomes decorative (`aria-hidden`).
- DNA: DNA-I4, DNA-T7.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes.
- #24865: not addressed

### F-03-40 The turn minimap is undocumented and invisible at rest on narrower windows

- Severity: P3
- Surface: web, desktop (fine pointer only)
- Evidence: `grep minimap docs/user/*.md` returns nothing. `TimelineMinimap.tsx:122-126`: the rail is `opacity-0` unless the side gutter is at least `TIMELINE_MINIMAP_PERSISTENT_GUTTER` (`MessagesTimeline.logic.ts:435-442`); at 800x600 and with the right panel open it only appears on hover of an 18px-wide invisible zone. It supports Arrow/Home/End/Enter and "Previous turn / Next turn" buttons.
- Current: A useful long-thread navigator no one is told about.
- Proposed: one docs sentence in `docs/user` (thread view / keyboard-focus.md): "In long threads a strip of ticks at the left edge jumps between your messages; hover it or Tab to it, then use the arrow keys." Do not change opacity.
- DNA: DNA-V5, DNA-L8.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes (docs only).
- #24865: not addressed (the PR makes the strips quieter, which widens the gap)

### F-03-41 Empty-thread placeholder is 1.47:1

- Severity: P2
- Surface: all
- Evidence: `MessagesTimeline.tsx:1085` `text-sm text-muted-foreground/30`; measured 1.47:1 light, 1.46:1 dark. Not reachable live in this build (a thread that exists always has a message), so measured through a probe element with the same classes. DNA-ID3 calls this line the product's empty state.
- Current: The one line of copy is almost invisible.
- Proposed: `text-muted-foreground` (4.71:1 / 5.08:1); add a regression test asserting no `/30` modifier.
- DNA: DNA-C4, DNA-C5.
- Effort: XS
- Risk: none.
- Upstream-eligible: no, #24865 ships this exact change.
- #24865: addressed

---

## Edge-case results (matrix)

Data

- Empty: code-read only (`MessagesTimeline.tsx:1085`; F-03-41). Not reachable live.
- One item: PASS (seed threads).
- 100+ items: PASS with caveat. 60 turn pairs: DOM stays about 4.5k nodes (virtualised); paging is manual (F-03-07).
- 10,000+ items: NOT TESTED (no fixture; server cost is #20427; list is LegendList).
- Very long names (200/500 char titles): NOT TESTED in this area (header breadcrumb is area 01; fixture threads not opened).
- Unicode and emoji in names: N/A (titles belong to 01/02). Emoji and CJK in message text: PASS.
- RTL: PASS (`markdownTextDirection.ts` picks direction by word majority; verified on the Arabic line).
- Leading/trailing whitespace, whitespace-only names: N/A.

Content

- 5k line diff, 200 file diff, binary, renamed: N/A (area 05); changed-files card with renames not shown.
- Huge single tool output (1 MB): NOT TESTED (no fixture; code-read `CommandOutputPanel.tsx`: `max-h-80` plus "Earlier output not shown").
- Huge single assistant message (1 MB): FAIL (F-03-03, F-03-04).
- 5,000-line code block: FAIL (F-03-05). 201-row table: FAIL (F-03-06).
- Nested code blocks (a fence inside a fence): NOT TESTED live; nested lists 5 deep PASS.
- Unterminated fence: PASS in final state (huge thread renders the last block closed with a TS label); mid-stream NOT TESTED (no frame caught; code path `ChatMarkdown.tsx:1528` `isClosedCodeFence`).
- Tables: PASS with defaults (`wordWrap` true so cells wrap; clamp #24183 appears only when wrap is off, not tested); copy FAIL in non-secure context (F-03-11).
- Images in messages: FAIL (F-03-38) for failure; user attachments NOT TESTED.
- Links: FAIL (F-03-19), chip misfire F-03-20.
- Very long single-line strings: PASS (200-char token wraps).
- Math: PASS when "Render math" is on (`03-md-math-light-1440x900.png`); off by default shows TeX source by design.
- GitHub alerts, details, footnotes, mermaid, task lists: PASS.

Network and agents

- Provider not installed or logged out: N/A here (composer, area 04/09).
- Auth expired mid-session: NOT TESTED.
- Stream stalls: NOT TESTED.
- Stream cancelled mid-token: NOT TESTED (turn budget).
- Permission prompt mid-stream: FAIL (F-03-08, F-03-09, F-03-10).
- Two threads streaming at once: PASS (incidental: other audit threads were Working during my turns; no cross-thread leakage observed).
- Six threads at once: NOT TESTED.
- Relay disconnected, reconnect after sleep, server restart, version mismatch: NOT TESTED (shared server).
- Claude non-streaming text: FAIL (F-03-15).

Git: N/A (area 05).

Viewport

- 1440x900, 1280x720: PASS. 1024x640: PASS with F-03-32. 800x600: holds; the composer takes 24% of the height, message area is about 400px.
- 3440x1440: PASS (736px lane centred, details card top-right; `chatWidth: wide` available; `03-md-wide-chat-light-1440x900.png`).
- 390x844 touch without keyboard: FAIL (F-03-23, F-03-24); with keyboard open: NOT TESTED.
- Browser zoom 200% (720x450 viewport) and 50% (2880x1800): PASS (composer takes 35% of the 200% viewport; area 04).
- OS zoom 80/125/150: NOT TESTED (approximated by the two zoom viewports).

Preferences

- Light and dark: PASS for every state. System switching live: PASS (`emulateMedia` switch re-themed the open thread).
- Every named theme: NOT TESTED (DNA covers five built-ins on one thread).
- Reduced motion: PASS by code-read (`index.css:2107-2122` streaming fade is gated; `live-tool-shine` is gated, DNA-K5). Streaming fade not observed under reduce.
- High contrast: FAIL (F-03-28).
- Keyboard only: partial. Tool rows are `role="button"` with `tabIndex 0` and Enter/Space (PASS); copy focus drop FAIL (F-03-12); approval path NOT TESTED (see Needs deeper look).
- Screen reader: partial PASS by `ariaSnapshot` and code-read (sr-only `h3` "You"/"T3 Code", `aria-expanded` on folds, `ThreadActivityAnnouncer`); copy success not announced (F-03-13).
- Font size overrides: PASS at 12px and 20px interface and 10/18px code (`03-md-font12-light-1440x900.png`, `03-md-font20-light-1440x900.png`); the lane and table scale, composer overlap grows.

Lifecycle: first launch, update, corrupted settings, backgrounded for an hour, window minimised during stream, OS sleep during stream: NOT TESTED (not producible on this host or out of area).

## Already good (do not touch)

- Find in thread (`mod+f`, `chat.find`): bar replaces the top of the details card, live count "3/8", yellow and orange CSS highlights, "0/0" in destructive colour, Escape closes and returns focus to the composer, expands folded runs and the "Agent" pill to reveal hits (`03-find-greet-next-light-1440x900.png`).
- Virtualisation of normal threads: 60 turn pairs keep about 4.5k DOM nodes and 16.7 ms p50 frames.
- Streaming markdown: Codex streams 2 to 38 blocks over 7 s with the opacity-only block fade, no layout thrash; frame p95 17.6 ms, 0 over 100 ms; only duty-cycled animations running (`live-activity-focus`, `live-tool-shine`).
- Follow behaviour while streaming when the user does not scroll: stays pinned; re-arms when the user scrolls back to the end (`WHEEL DOWN 4000` cleared the pill).
- Edit from here dialog: clear title and body, "Revert and keep changes" is the primary and the destructive "Revert files too" is an outline (DNA-V2).
- Code blocks: header actions (wrap, Run in terminal on shell blocks, copy) always visible, 13px mono, soft wrap on by default, unterminated final fence closes cleanly.
- File chips: language badge, 12.04px/500, open the file panel on click with the tree (`03-file-chip-click-light-1440x900.png`) (DNA-K12).
- Markdown set: GitHub alerts, details, footnotes with backref, mermaid with source toggle, task lists, nested lists (disc, circle, square), tables with Markdown/CSV copy menu, RTL direction by word majority.
- User message fold: 11rem clamp with mask fade, "Show full message", actions on hover and always on touch; "Agent" fold for messages from other agents.
- Timeline row semantics: `data-timeline-row-kind`, sr-only `h3` per message, `role="button"` rows with `aria-expanded`, `role="separator"` for dividers.
- Message-level copy: works without the Clipboard API (execCommand fallback) and produces the full markdown source.
- Approval banner handles long commands (`max-h-40` scroll, wrap anywhere) and has a "More approval options" menu for session-wide approval.

## Incomplete (what I did not cover and why)

- Questions (pending user input), proposed plans, context handoff and compaction notices, subagent rows, worktree setup card, usage-limit rows, MCP apps and HTML renders were not exercised live. Only four agent turns were allowed and two were spent before I learned that Claude does not stream in this build. These are code-read only (F-03-29, F-03-33, F-03-35).
- Stream cancel mid-token, interrupt, steer, queue rows (queue is area 04), stalls and reconnects.
- The scroll-up revert (F-03-02) is n=1 with a 120-150 ms sampler; the exact reverting call was not isolated. No second stream turn was available.
- User attachments (images, files, videos) in the bubble and the snap-shot frame; images in tool output.
- Unterminated fences caught mid-stream.
- The `404` console error seen when opening the huge thread (single `Failed to load resource` line; likely the bounded-snapshot fallback) was not traced.
- Browsers other than Chromium; Windows and Linux fonts (Inter ships in #24865); desktop and mobile apps (web only; 390px is emulated web).
- Fixture clones have no event history, so Edit from here on seed threads was exercised only on my own live threads. Other audit agents were sending turns to the same seed project during my run (a seed thread gained a second turn, the sample repo diff grew to +5,430), so a few counts differ from `fixtures.md`.

## Needs deeper look

- Area 09 / server: Claude text deltas not reaching the UI (F-03-15). Check `ClaudeAdapterV2.ts:~7650` `stream_event` handling and projection batching.
- Area 04: at 390px the composer controls strip is translucent and table text shows through it (`03-md-light-390x844.png`); the composer is 144px (24%) of an 800x600 window; the composer collapses to a one-line resting form while a turn streams (`03-stream-scrolled-up-light-1440x900.png`).
- Approval keyboard path: Tab from the composer reaches model, effort, runtime mode, attach, stop, then the details card but never Approve/Decline within eight stops; `Shift+Tab` and initial focus were not tested because the approval had been answered. Typing a reply declines a Claude approval (permission-modes.md); there is no approve shortcut. Needs a live check and a decision on a keybinding (area 21).
- Area 01: opening a file chip in the right panel left the thread off the end with the "Scroll to end" pill showing (once, on "Explain the repository"); likely the width change re-measuring. Check panel resize versus follow state.
- Area 12: `ChatHeader.tsx` toasts "Failed to rename thread" and "Thread title cannot be empty" (DNA-V3/V4), and `ThreadErrorBanner` "You've reached ..." contraction.
- Area 13: the 5 s blank for a huge thread (F-03-03) is a loading-state problem as well; no skeleton or "loading latest turn" indicator while the bounded snapshot resolves.
- Area 22: the 2.4 s long task and 103k nodes (F-03-04) need a perf budget test (`performance.bench.ts`); a 10,000-row thread was not measured.
