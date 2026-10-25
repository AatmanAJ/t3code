# Audit 05: diff and review

Scope: Diff panel (`DiffPanel`, `DiffPanelShell`, `components/diffs/*`), file preview (`components/files/*`), Changes/Commit/branch rows of the details card, `GitActionsControl`, commit and PR flows, Pull Requests page (`components/pullRequest/*`), diff colour tokens, pierre theming and file icons.
Baseline: upstream `5f64c5eb` plus the owner's open PR #24865 (read `prior-art/OWNER-DIRECTION.md` and `prior-art/pr-24865.diff`; every finding carries a `#24865:` line). Screenshots: `ui-overhaul/screens/05-diff-and-review/` (names cited by their `05-diff-and-review-` suffix).

## How I used it

Live app at `localhost:5733`, Playwright (Chromium, light and dark), 1440x900, 1280x720, 1024x640, 800x600. Fixture repo `/tmp/t3code-sample-repo` had these shapes added in the working tree (all removed afterwards, repo back to branch `main`, three original commits, `docs/greet.md` and `src/lib/greet.js` byte-identical to before): a 4,999-line new file, 200 new two-line files in 10 folders, a 64x64 PNG, a 4 KB random `.bin`, a 22 KB single-line file, a whitespace-only edit to `README.md`, a multi-hunk edit of `src/index.js`, a pure rename (`date.js` to `dates.js`), a rename with edit (`Button.jsx` to `PrimaryButton.jsx`), a deleted file. Also used: tree, find (mod+f), review comment end to end (gutter button, draft, mod+Enter, composer chip), scope menu, Latest turn scope, maximize, split, blue-orange scheme, keyboard Tab sweep with focus-ring crops, file preview (markdown, tree explorer), attachment preview modal (HTML, markdown, PDF, PNG), commit dialog, Git menu, branch picker, the Pull Requests page against the real `pingdotgg/t3code` GitHub list (read only: list, Summary, Timeline, Code tabs; no tick, comment, review or merge was clicked).

Side effect, disclosed: the attachment tests uploaded four tiny synthetic files (HTML, markdown, PDF, PNG) to the dev server's attachment store; nothing was sent to an agent.

One accident, disclosed: clicking the "Commit" row in the details card committed every change with a model-generated message (`chore: add audit fixture files`, 211 files). I undid it with `git reset --mixed 40d6e41` and removed the fixture files; see F-05-06. That call was one text-generation request; no agent turn was run.

### Measurements (localhost, Chromium, 1440x900, dev build)

| What                                                                     | Result                                                    |
| ------------------------------------------------------------------------ | --------------------------------------------------------- |
| Click "Changes" to first diff header, 211-file lazy list                 | 940 ms                                                    |
| Expand a 4,999-line new file to first painted lines                      | 98 ms                                                     |
| Scroll 60 frames through that expanded file (101,808 px tall)            | 16.7 ms median, 16.7 ms p95 and max (60 fps, virtualised) |
| "Expand all files" on 211 files, then 40-frame scroll through 138,696 px | 16.7 ms median, 16.8 ms max                               |
| Pull Requests page cold load (skeleton until list)                       | 5.0 s light, 8.0 s dark                                   |
| PR Code tab, click to first diff                                         | 803 ms                                                    |
| Panel width inline default                                               | 539 px (min 360, max 560 in `DiffPanelShell.tsx:33`)      |

Performance is good. Deep perf belongs to area 22.

## Findings

Order: P1, P2, P3. IDs are stable, not ranked within a severity.

### F-05-01 Files that load after any fold action open expanded, ignoring "Collapsed by default"

- Severity: P1
- Surface: all (web and desktop share this code)
- Evidence: `05-diff-and-review-fold-default-leak-light-1440x900.png`. Repro: set nothing (Settings default is Collapsed, `settings.ts:380`), open Changes on a repo with many new files, expand one file (for example `audit05/blob.bin`), scroll down: 12 of 20 rendered headers were expanded, every new file loaded after the click. Cause: the fold key includes the file type (`lib/diffRendering.ts:207-209`, `fileKey = prev\0path\0type`); the lazy placeholder has type `change` or `rename-changed` (`useReviewFilePatches.ts:110`) and becomes `new`, `deleted` or `rename-pure` when its patch arrives, so the key changes and drops out of the stored collapsed set (`diffPanelStore.ts:145-156`, `DiffPanel.tsx:508-514`). Before the first fold action there is no stored set and `defaultCollapsedDiffFileKeys` is rebuilt from current keys each render, which hides the bug.
- Current: After one chevron click, tree reveal or Collapse all, every added, deleted or renamed file that streams in afterwards mounts open, so a 200-file review turns into hundreds of expanded bodies.
- Proposed: add `buildFileDiffFoldKey(fileDiff)` in `lib/diffRendering.ts` returning `${prevPath}\u0000${path}` (no `type`) and use it as `fileKey` in `getCachedFileEntry` (`DiffPanel.tsx:106-111`) so the Pierre item id is also stable across placeholder to loaded (today the item is re-created when the type flips). Keep `buildFileDiffIdentityKey` only where a type match is wanted. Add a case to `lib/diffRendering.test.ts`: "fold key is identical for placeholder and loaded file".
- DNA: DNA-P3 (UI reflects the real setting), DNA-D1 (a review list is an entity list; the user chose collapsed).
- Effort: S
- Risk: `useCodeViewFileReveal` and draft-comment survival (`AnnotatableCodeView.tsx` matches pending files by both paths) key off `fileKey`; `AnnotatableCodeView.browser.test.tsx` and `diffFileTree.logic.test.ts` cover parts, no test covers lazy placeholder to loaded.
- Upstream-eligible: yes (fix-shaped, one helper).
- #24865: not addressed (does not touch `DiffPanel.tsx`, `diffRendering.ts` or `diffPanelStore.ts`).

### F-05-02 Binary files show `+0 -0` and an expanded file with nothing in it

- Severity: P1
- Surface: all
- Evidence: `05-diff-and-review-shapes-changes-light-1440x900.png` (rows `blob.bin`, `logo.png` with `+0 -0`), `05-diff-and-review-binary-expanded-dark-1440x900.png`. Measured after expanding both: container height 32 px (header only), 0 `[data-line]`, chevron shows expanded. Contract has no binary flag (`packages/contracts/src/review.ts:25-27` carries `additions`, `deletions`, `previousPath` only).
- Current: A PNG or compiled artifact looks like an empty file with zero changes. No "Binary" label, no size, no way to see an image the agent produced, even though Files can render images.
- Proposed: infer binary client side when `hunks.length === 0 && additions === 0 && deletions === 0 && type !== "rename-pure"` (and a server `binary: boolean` on `ReviewDiffPreviewFile` as a gated dependency). In `renderHeaderMetadata` (`DiffPanel.tsx:1106`) render `<Badge variant="outline" size="sm">Binary</Badge>` instead of `DiffStatLabel` for those files; set `DiffFileCollapseToggle` `unavailable` (the pending-file path already disables the chevron) with tooltip "Binary file. Open it to preview."; keep the filename click (`openDiffFile`) which opens Files, where images render (`FilePreviewPanel.tsx`, `WorkspaceImagePreview`). Phase 2: inline thumbnail row (`max-h-48`, `rounded-md border border-border`) for image extensions.
- DNA: DNA-P3 (a label must reflect state), DNA-V10 (counts literal), DNA-I2.
- Effort: S (label and disabled chevron), M with thumbnail
- Risk: `Badge` is a `components/ui` primitive: use an existing variant, do not restyle. The inference misfires for an empty added file or a mode-only change; those are `new` or `mode-change` types with no stats and should say "Empty file" or "Mode changed" (add both strings). Tests: none cover header metadata.
- Upstream-eligible: yes for the badge and disabled chevron.
- #24865: not addressed.

### F-05-03 The "head to base" comparator is crushed to `m... -> upstrea...` at the default panel width

- Severity: P1
- Surface: all
- Evidence: `05-diff-and-review-empty-changes-light-1440x900.png` (server project thread, Changes scope: header reads `Changes  m...  ->  upstrea... v  +16k -0` then nine icon buttons). Code: comparator lives in the same flex row as scope, stat and nine controls (`DiffPanel.tsx:712-838`, `min-w-[min(3rem,calc(100%-2.75rem))]`, `max-w-48`).
- Current: On a branch with a real base, the one piece of information that defines the "Changes" scope is truncated to two letters; the tooltip is the only way to read it.
- Proposed: move the comparator out of `headerRow` into a second row owned by `DiffPanelShell` (new optional `subheader` prop): `<div className="flex h-7 shrink-0 items-center gap-1.5 border-b border-border/60 px-4 text-xs text-muted-foreground">` with the head ref (`truncate`, `max-w-[45%]`), `ArrowRightIcon size-3.5`, then the existing base `ComboboxTrigger` (`Button variant="ghost-muted" size="xs"`, `truncate`). 28 px matches the inline-preview subheader (DNA-D3).
- DNA: DNA-D6 (degrade, do not clip), DNA-D3, DNA-T9 (truncate in rows, but never the only identifier).
- Effort: S
- Risk: `DiffPanelShell` is also used `embedded`/`sheet`; verify the three `DiffPanelMode`s. No tests cover the header.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-05-04 Split layout is offered at widths where each column is about 160 px

- Severity: P1
- Surface: all
- Evidence: `05-diff-and-review-split-default-width-light-1440x900.png` (every token wraps: `import {` / `greet } from` / `"./lib/greet.` / `js";`), versus `05-diff-and-review-split-maximized-light-1440x900.png` (works well when maximized). Toggle at `DiffPanel.tsx:885-905`; inline panel is 539 px (`DiffPanelShell.tsx:33`), and with the tree open the code pane is 323 px.
- Current: The Split toggle always works, writes the global `diffLayout` setting, and then produces an unreadable view in the default panel. The setting persists, so the next thread opens split too.
- Proposed: observe the code pane width with `lib/observeResize.ts` (lint forbids raw ResizeObserver). When width < 720 px (2 x 360 px columns) render `diffStyle: "unified"` and mark the Split toggle `aria-disabled` with tooltip "Side by side needs a wider panel. Maximize to use it." Do not rewrite the stored setting. When the panel is maximized or wide, split applies as chosen.
- DNA: DNA-D6, DNA-L5 (panels degrade), DNA-P3.
- Effort: S
- Risk: `ToggleGroup` value must stay `split` while the render is unified, so the toggle looks selected but disabled: show the unified icon as the visible state via `aria-pressed` on the effective layout. No tests.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-05-05 Review comments cannot be started from the keyboard

- Severity: P1
- Surface: all
- Evidence: Tab sweep (16 stops) goes header chevron, copy path, next header chevron, copy path, and never enters code rows; in an expanded file `[data-line]` has 0 focusable descendants (script `misc1`, 2 lines, 0 focusable). Code: only `enableGutterUtility`, `enableLineSelection`, `onGutterUtilityClick` (`AnnotatableCodeView.tsx:268-272`), all pointer driven. Toolbar and header controls have good 2 px focus rings (`05-diff-and-review-focus-*@2x.png`).
- Current: The headline review feature (comment on a line, which becomes a composer chip) is mouse only. Find (mod+f) is keyboard friendly, selecting a line is not.
- Proposed: in `AnnotatableCodeView`, make the `.diff-render-surface` (`tabIndex={0}`, it already has `outline-none`; add `focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring`) own a key handler: ArrowDown or `j` and ArrowUp or `k` move `selectedLines` one visible line (derive line order from the active item's `fileDiff.hunks`); Shift+Arrow extends the range; `c` or Enter calls the existing `beginComment(selectedLines, { item })`; Escape clears. Show the shortcut once in the empty selection hint: reuse the `Kbd` primitive in the comment footer (see F-05-20).
- DNA: DNA-L8 (keyboard first), accessibility rule 6 (inaccessible is P1).
- Effort: M
- Risk: depends on Pierre emitting selection changes for programmatic `selectedLines` (the prop is already controlled). Covered partly by `AnnotatableCodeView.browser.test.tsx`; add keyboard cases.
- Upstream-eligible: yes (accessibility fix).
- #24865: not addressed.

### F-05-06 One click on the "Commit" row commits every change, with a generated message, with no preview

- Severity: P1
- Surface: all
- Evidence: reproduced by accident: on `main` with 211 changed files (5,430 added lines, 200 untracked files) one click on the details card "Commit" row created commit `9fd8108 chore: add audit fixture files`. Code: the row is the quick action; `runQuickAction` (`GitActionsControl.tsx:1393-1458`) calls `runGitActionWithToast({ action: quickAction.action })`; the dialog is only reachable through the chevron menu (`openDialogForMenuItem`, `:1460`). Default branch confirmation covers push and PR only (`requiresDefaultBranchConfirmation`), not a plain commit, and it keys on `isDefaultRef`, which was already true here (the dialog shows "Default branch") but did not block.
- Current: A 5k-line, 200-new-file change is committed without showing the file list, the totals, or the message, and nothing offers to undo it. DNA-P7 says every door has a way out.
- Proposed: (1) the row label states scale: `Commit 211 files` (use `gitStatusForActions.workingTree.files.length`; `text-xs text-muted-foreground tabular-nums` suffix). (2) When files > 25, or changed lines > 1,000, or any untracked directory is included, the primary action opens the existing commit dialog instead of running. (3) After any commit toast add an "Undo" action that soft resets (`git reset --soft HEAD~1`); this needs a server method, so write it as a dependency and ship (1) and (2) first.
- DNA: DNA-P7, DNA-P3, DNA-V2 (a confirm names its action).
- Effort: S for (1) and (2); M with undo
- Risk: heavy users like the one-click flow; thresholds keep it for ordinary commits. Tests: `GitActionsControl.browser.test.tsx`, `GitActionsControl.logic.test.ts` (add threshold cases to `resolveQuickAction`).
- Upstream-eligible: no for now (`GitActionsControl.tsx` is in #24865's file set; re-evaluate after it merges).
- #24865: not addressed (it only adds `quietEmptyDraft` for empty drafts; the Commit row of a non-empty thread behaves as before).

### F-05-07 A file with only whitespace changes disappears from the list, silently

- Severity: P2
- Surface: all
- Evidence: file tree count `Files 210` with the default, `Files 211` after toggling whitespace (`05-diff-and-review-whitespace-shown-light-1440x900.png`); the edited `README.md` was the missing file. Default comes from `diffIgnoreWhitespace: true` (`settings.ts:381`, `DiffPanel.tsx:209`). The empty-selection copy is "No net changes in this selection." (`DiffPanel.tsx:1020`), which is untrue when a file was only whitespace-edited.
- Current: Nothing says a file was hidden. A user who reformatted a file sees a missing file, or "No net changes".
- Proposed: add a one-line band under the toolbar when whitespace is hidden and at least one file is hidden: `<p className="shrink-0 border-b border-border/70 bg-muted/40 px-3 py-1.5 text-2xs text-muted-foreground">1 file hidden because only whitespace changed. <button className="underline">Show</button></p>` (same pattern as the truncated-preview band at `DiffPanel.tsx:995`). Count client-side for the Uncommitted scope by comparing `gitStatusQuery.data.workingTree.files` with the diff file list; for Changes add `hiddenFileCount` to `ReviewDiffPreviewSource` as a server dependency. Change the empty copy to "No changes to show. Whitespace-only edits are hidden." when the toggle is on.
- DNA: DNA-P3, DNA-V3.
- Effort: S (UI) plus server dependency
- Risk: none functional; strings only. No tests.
- Upstream-eligible: yes for the UI half.
- #24865: not addressed.

### F-05-08 The same "Changes" total is shown three ways and disagrees between the card and the panel

- Severity: P2
- Surface: all
- Evidence: details card `+5,430 -10` (`GitActionsControl.tsx:1836-1841`, `formatDiffCount`), panel header `+5.4k -8` (`DiffStatLabel`, `formatCompactDiffCount`), per-file `+5k` for a file with 4,999 added lines (`k < 10` branch rounds up: `DiffStatLabel.tsx:6-12`). Commit dialog adds a fourth: `+12/-19` (see F-05-23). Deletions differ (10 vs 8) because the panel ignores whitespace by default and the card does not. Screenshots: `shapes-changes-light` header, `05-diff-and-review-details-card-light-1440x900.png`.
- Current: Clicking "Changes +5,430 -10" opens a panel that says "+5.4k -8" with 210 files; both are "truthful" and neither says why they differ.
- Proposed: one formatter for chips (compact, floor not round: 4,999 renders `4.9k`) and exact numbers with `Intl.NumberFormat` in the tooltip and `aria-label`; add the basis to both tooltips: "Includes whitespace-only edits" on the card and "Excludes whitespace-only edits" on the panel when the toggle is on. Prefer sending the same `ignoreWhitespace` flag to the status totals (server dependency) so the numbers agree.
- DNA: DNA-P3, DNA-V10 (counts literal), DNA-T7.
- Effort: S
- Risk: `DiffStatLabel` is a K12 do-not-touch component for its look; this changes only its number format. Tests: `DiffStatLabel` has none; add a `formatCompactDiffCount` table test.
- Upstream-eligible: no (`DiffStatLabel.tsx` and `GitActionsControl.tsx` are in #24865's file set).
- #24865: not addressed (it changes classes and size of the card row, not the numbers or formatters).

### F-05-09 Jumping to a file in a lazy diff builds a non-contiguous list; skipped files pop in above what you are reading

- Severity: P2
- Surface: all
- Evidence: `05-diff-and-review-reveal-index-light-1440x900.png`: list goes `file28.js` directly to `src/index.js` (about 170 files between them are not rendered) and the skeleton footer sits below `index.js`. `05-diff-and-review-file-deleted-dark-1440x900.png`: `docs/guide.md`, then `PrimaryButton.jsx`, then `src/index.js`. Code: only ready files become code view items (`DiffPanel.tsx:531-536`, `readyFilePaths`), `requestFile(index)` fetches the single target (`useReviewFilePatches.ts`), and the loading boundary asks for the next four files from the first pending index, which are then inserted above the file in view. Separate observation: after clicking the renamed `dates.js` (`R`) in the tree the diff did not scroll (`05-diff-and-review-file-rename-pure-dark-1440x900.png`); see Needs deeper look.
- Current: The list is not a stable sequence while you read; content shifts and the footer skeleton lies about where content will arrive (DNA-P3, "lying spinner").
- Proposed: render a collapsed 32 px placeholder header for every file in sorted order (they already exist as `pendingFiles` with `:pending` cache keys and `unavailable` chevrons; 211 x 32 px = 6.7 kpx is cheap in the virtualizer), and load patches for the placeholders nearest the viewport plus the revealed target. Drop the `readyFilePaths` filter at `DiffPanel.tsx:531`. Keep `DiffFileLoadingBoundary` only for the tail.
- DNA: DNA-P3, DNA-M9, DNA-P1 (cheap rows, not heavy ones).
- Effort: M
- Risk: scroll anchoring in Pierre when placeholders upgrade to full items (measure `itemMetrics.diffHeaderHeight`); `fileEditorVirtualization.test.ts` is for files, not diffs; no coverage.
- Upstream-eligible: yes after F-05-01 (same key logic).
- #24865: not addressed.

### F-05-10 Renamed-file header truncates away the part that changed

- Severity: P2
- Surface: all
- Evidence: `05-diff-and-review-file-deleted-dark-1440x900.png`: `Button.jsx -> PrimaryButton.jsx` renders as `...ton.jsx -> ...utton.jsx` (tree open, pane 323 px). Both names start-truncate (`[data-title]`, `[data-prev-name]`, `StyledDiffCodeView.tsx` header CSS), so what survives is the common suffix.
- Current: You cannot tell what a rename did without the tooltip, which does not exist on the header.
- Proposed: in `DIFF_VIEW_UNSAFE_CSS` hide `[data-diffs-header] [data-prev-name], [data-diffs-header] [data-rename-icon]`, let `[data-title]` show the new path, and render the origin in `renderHeaderFilenameSuffix` (`DiffPanel.tsx:1089`) as `<span className="min-w-0 max-w-[40%] truncate text-2xs text-muted-foreground" title={prevPath}>from {basename(prevPath)}</span>` when `fileDiff.prevName` is set and differs. Same for `rename-pure`.
- DNA: DNA-T9 (path truncation components exist for a reason), DNA-P3.
- Effort: S
- Risk: depends on Pierre's header DOM staying as `[data-prev-name]`; pinned to `@pierre/diffs@1.6.1` (patched). No tests.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-05-11 The diff file tree is fixed at 16 rem / 40% and squeezes the diff to about 320 px

- Severity: P2
- Surface: all
- Evidence: `05-diff-and-review-tree-open-light-1440x900.png` (tree 216 px, headers become `...dit05/many/dir0/file10.js`). Code: `DiffPanel.tsx:1143-1146` `w-[min(16rem,40%)] min-w-40`. Prior art: issue #24017 ("Diff Files panel cuts off every file name and can't be resized").
- Current: No resize handle; the tree and the diff both lose.
- Proposed: add a drag handle on the aside's left edge (reuse the pattern behind `t3code:preview-panel-width`, `usePreviewPanelInlineSize.ts`) persisted as `t3code.diffFileTreeWidth`, min 160 px, max 50% of the panel; when the panel is under 640 px open the tree as an overlay `Popover`/sheet over the diff instead of a column.
- DNA: DNA-L5, DNA-K13 (persisted widths), DNA-D6.
- Effort: M
- Risk: Pierre tree has its own scroller; keep the `aside` `min-w-0`. No tests.
- Upstream-eligible: yes (closes #24017).
- #24865: not addressed.

### F-05-12 The toolbar cannot adapt: at 335 px the scope menu collapses to a bare chevron

- Severity: P2
- Surface: all
- Evidence: `05-diff-and-review-panel-dark-800x600.png` (panel 335 px: scope trigger shows only `v`), `05-diff-and-review-panel-light-1024x640.png` (407 px: fits). One flex row with eight `shrink-0` controls (`DiffPanel.tsx:830-960`). The PR Code tab already solves this: `Diff options` overflow menu behind `@lg:hidden` (`PullRequestCodeTab.tsx:1112-1135`).
- Current: At narrow widths the user cannot see which scope they are in; nothing wraps or overflows into a menu.
- Proposed: give `DiffPanelShell`'s root `@container/diff-panel`; below `@md` (28 rem, 448 px) hide whitespace, wrap, tree and expand-all toggles and show a `Settings2Icon` `Diff options` dropdown with the same four items as `DropdownMenuCheckboxItem`s, copying the strings and structure at `PullRequestCodeTab.tsx:1112-1160`. Keep scope, stat and refresh visible.
- DNA: DNA-D6, DNA-L5, DNA-I4.
- Effort: M
- Risk: duplicates control state; extract a `DiffToolbarControls` shared with F-05-13. No tests.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-05-13 Thread Diff and PR Code toolbars hold the same controls in a different order and size

- Severity: P2
- Surface: all
- Evidence: Diff panel: `[Changes v] +20 -0 [refresh] [expand all] [stacked|split] [wrap] [whitespace] [tree]` (`05-diff-and-review-seed-default-light-1440x900.png`). PR Code: `[All commits v] 2 files . 0/2 viewed ... [whitespace] [stacked|split] [wrap] [expand all] [tree]` (`05-diff-and-review-pr-code-tab-light-1440x900.png`). Heights: scope trigger and segmented control are 24 px, icon toggles 28 px (measured via `boundingBox`).
- Current: Muscle memory does not transfer between two screens that do the same job; one row mixes 24 and 28 px controls (DRIFT-10).
- Proposed: extract one `DiffToolbarControls` used by `DiffPanel.tsx` and `PullRequestCodeTab.tsx` with a fixed order `[layout][wrap][whitespace][expand all][tree]`, all `size="icon-sm"` (28 px) including the layout `ToggleGroup`, and `refresh` placed before them in the Diff panel only.
- DNA: DNA-D2, DNA-P2, DRIFT-10.
- Effort: M
- Risk: PR Code toolbar has `Viewed` count wiring; `PullRequestCodeTab.browser.test.tsx` and `PullRequestSummaryTab.browser.test.tsx` exist.
- Upstream-eligible: no (touches two large components; propose as a follow-up chunk).
- #24865: not addressed.

### F-05-14 Layout toggles have no tooltip, and "pressed" is nearly invisible

- Severity: P2
- Surface: all
- Evidence: hover test: `Stacked diff view` and `Split diff view` show no tooltip (every other toolbar button does; `Diff scope` trigger also has none). Pressed wrap and whitespace buttons differ from unpressed by `bg-accent` (`#f4f4f5` on `#fcfcfc`, about 1.1:1) with an identical icon colour (`05-diff-and-review-toolbar-light-1440x900@2x.png`). Aria label and tooltip disagree: `Disable diff line wrapping` vs tooltip `Disable line wrapping` (`DiffPanel.tsx:907` vs `:920`).
- Current: Two controls are icon-only with no name on hover (DNA-I4), and state is carried by a 1.1:1 fill.
- Proposed: wrap both layout `Toggle`s in `Tooltip` ("Stacked view", "Split view"); add to the generic `ghost` Toggle variant in `ui/toggle.tsx` an icon colour step (`text-muted-foreground data-pressed:text-foreground`) so pressed is 14.5:1 vs 4.7:1 on canvas, plus keep the fill; use one string for aria-label and tooltip.
- DNA: DNA-I4, DNA-C5, DNA-I3 (muted until active), DNA-K10 (variant, not className).
- Effort: S
- Risk: `toggle.tsx` is shared (K10): QA every `Toggle variant="ghost"` (FileSurfaceAction, PR toolbar, composer). Lint `shadcn/no-restyle` forces the change into the variant.
- Upstream-eligible: yes (pressed state) once split from the tooltip change.
- #24865: not addressed (its stroke rule `:where(svg.lucide[stroke-width="2"])` thins these icons to 1.75 but does not change the pressed treatment).

### F-05-15 Word wrap persists as a global setting in Files but is per-mount in the Diff panel

- Severity: P2
- Surface: all
- Evidence: `DiffPanel.tsx:208-209` (`useState(settings.wordWrap)`, `setWordWrap` never writes back) vs `FilePreviewPanel.tsx:1260-1263` and `AttachmentFilePreview.tsx:286-290` (`updateClientSettings({ wordWrap })`). Diff layout writes through (`DiffPanel.tsx:891`). Whitespace is a documented per-session override of a stored default (Settings text: "ignores whitespace-only edits by default").
- Current: Turning wrap off in a diff is forgotten when the panel unmounts, while turning it off in a file sticks for everything, including the next diff.
- Proposed: wrap in the Diff panel writes `updateClientSettings({ wordWrap })` like the file previews (one global "Word wrap"); whitespace stays local, but when it differs from the stored default show a dot on the toggle (`size-1.5 rounded-full bg-primary` at top-right) and tooltip "Differs from your default".
- DNA: DNA-P3, DNA-P7.
- Effort: XS
- Risk: users who wanted per-surface wrap lose it; the Settings row only describes whitespace, so nothing documented changes.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-05-16 Diff counts use three greens and, in four places, a 2.5:1 base token as text

- Severity: P2
- Surface: all
- Evidence: measured computed colours on the live app (light): card row and panel total `oklch(0.696 0.17 162.48)` = `--diff-addition` (`--success` base) at 2.47:1 on `#fcfcfc`; Pierre native count in Turn scope `rgb(24,164,108)`; token `--diff-addition-foreground` emerald-600 at 3.56:1. Deletions: base `#fb2c36` 3.81:1 vs pierre `rgb(213,44,54)`. Sites still on base tokens: `GitActionsControl.tsx:1950, 1954, 1968, 1972` (commit dialog), `chat/V2ItemInspector.tsx:304-305`, `pullRequestPresentation.tsx:470` and `PullRequestChangeBreakdownStat.tsx:134` (deletions). Text is 11 px (`text-2xs`/`font-mono`). Existing lead: DRIFT-22.
- Current: The same "+20" is three different greens depending on the surface and fails DNA-C5 on at least four.
- Proposed: (1) keep #24865's `--diff-addition-foreground: light-dark(emerald-700, emerald-400)` and `--diff-deletion-foreground: light-dark(red-700, red-400)` (emerald-700 = `#007a55`, 5.23:1). (2) Switch the four remaining sites to `text-diff-addition-foreground` / `text-diff-deletion-foreground`. (3) In `DIFF_VIEW_UNSAFE_CSS` add `[data-diffs-header] [data-additions-count] { color: var(--diff-addition-foreground) !important } [data-diffs-header] [data-deletions-count] { color: var(--diff-deletion-foreground) !important }` so Pierre's native counts (Turn scope, PR Code) match.
- DNA: DNA-C5, DNA-C6, DNA-C7, DRIFT-22.
- Effort: S
- Risk: blue-orange scheme sets foreground = base (`index.css` `:root[data-diff-color-scheme]`), unchanged. No tests (visual).
- Upstream-eligible: yes as a follow-up to #24865 (it fixes the same defect in two of six sites).
- #24865: partial (addressed in `DiffStatLabel.tsx`, the card Changes row and the light tokens; not addressed in the commit dialog, `V2ItemInspector`, PR presentation, or Pierre's native counts).

### F-05-17 Zero counts are painted red and green

- Severity: P2
- Surface: all
- Evidence: `-0` in red on all 200 rows in `05-diff-and-review-shapes-changes-light-1440x900.png`; Turn scope hides the zero side (`05-diff-and-review-latest-turn-dark-1440x900.png`: `+15` and `+5` only), so one file reads `+15` in one scope and `+15 -0` in another (`DiffPanel.tsx:1098-1110` lazy mode `renderHeaderMetadata` hides Pierre's counts and draws `DiffStatLabel`). Binary rows show `+0 -0` (F-05-02).
- Current: Red means "removed"; nothing was removed. The column becomes a stripe of red in big diffs.
- Proposed: in `DiffStatLabel`, a zero side takes `text-muted-foreground` (keep the `4ch` columns so alignment holds); in `aligned` layout optionally render nothing for zero but keep the grid cell.
- DNA: DNA-C6, DNA-C7, DNA-P3.
- Effort: XS
- Risk: K12 do-not-touch: the label's mono look and `+N -N` format stay; only the colour of zero changes.
- Upstream-eligible: no (`DiffStatLabel.tsx` in #24865's set).
- #24865: partial (the card Changes row mutes zero counts; `DiffStatLabel` and the commit dialog still colour them).

### F-05-18 Light-mode syntax colours on diff rows fall under 4.5:1

- Severity: P2
- Surface: all
- Evidence: pixel samples from `05-diff-and-review-reveal-index-light-1440x900.png`: string literal `rgb(25,159,67)` on a deletion row `rgb(254,240,240)` is 3.11:1 (3.37:1 on canvas); keyword `rgb(211,42,97)` is 4.43:1 on the deletion row and 4.51:1 on an added row. Dark is fine (string `rgb(94,204,113)` on `rgb(28,16,15)` 9.16:1). Theme is Pierre's `pierre-light` (`resolveDiffThemeName`).
- Current: Code text, the main content of the screen, is below the DNA-C5 floor in light mode. Keyword red on a green added row also reads as "deleted" for a glance.
- Proposed: register a derived light theme `t3-pierre-light` (same as `pierre-light` with string `#137a35` 4.9:1 and keyword `#c0194f` 5.4:1 on the deletion tint) through Pierre's custom theme API and return it from `resolveDiffThemeName`. If the library cannot register themes in the worker, override the two token colours in `DIFF_SURFACE_THEME_UNSAFE_CSS` using `[data-line] span` selectors scoped by the token class.
- DNA: DNA-C5, DNA-T2.
- Effort: M
- Risk: worker pool theme names are a `Schema.Literals(["pierre-light","pierre-dark"])` in `DiffWorkerPoolProvider.tsx:14-15`; widen it. File previews use the same themes.
- Upstream-eligible: yes if the library allows it; otherwise needs deeper look.
- #24865: not addressed.

### F-05-19 Empty and error states in the Diff panel use 2.7:1 text and misleading copy

- Severity: P2
- Surface: all
- Evidence: `text-xs text-muted-foreground/70` at `DiffPanel.tsx:972, 976, 980, 987, 1017` (2.73:1 light, DNA section 2.7), notices at `:1158` (`/75`) and `:1163` (`/90`), error `text-2xs text-error/80` at `:1002`. Strings: "Turn diffs are unavailable because this project is not a git repository." (shown for every scope, not just turns), "Select a thread to inspect turn diffs.", "Checking file access...", "Loading checkpoint diff...".
- Current: The only explanation on the screen is the dimmest text on it; in a non-Git project the user is not offered Initialize Git, which the details card has.
- Proposed: `text-muted-foreground` (4.71:1) and `text-xs`; copy: "Diffs need a Git repository. Initialize Git from the Git menu." with a `Button size="xs" variant="outline"` "Initialize Git" wired to the same action as `GitActionsControl`'s `initializeGit`; errors use `text-destructive-foreground`. Use the `Empty` primitive (`ui/empty.tsx`, size compact) for the three centred states.
- DNA: DNA-C4, DNA-C5, DNA-V3, DNA-V7, DRIFT-1.
- Effort: S
- Risk: none; strings only plus one button. Not testable live here (the fixture is a Git repo): code-read.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-05-20 The comment box hint is 10 px at 2.7:1 and hard-codes mod glyphs

- Severity: P2
- Surface: all
- Evidence: `DiffCommentAnnotation.tsx:116` `text-3xs text-muted-foreground/70` with the literal `⌘/Ctrl Enter to send` (`05-diff-and-review-comment-typed-light-1440x900.png`). Other shortcuts use `Kbd` (`ui/kbd.tsx`).
- Current: Smallest text on the screen carries the only keyboard hint, at the lowest contrast, and shows both platforms' modifiers.
- Proposed: `<span className="mr-auto flex items-center gap-1 text-2xs text-muted-foreground"><Kbd>{isMac ? "Cmd" : "Ctrl"}</Kbd><Kbd>Enter</Kbd> to send</span>` using the platform helper the keybinding labels use (`formatShortcutLabel`).
- DNA: DNA-L8, DNA-C4, DNA-C5, DNA-T2.
- Effort: XS
- Risk: none; no tests on the footer.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-05-21 The file explorer opens by default and halves the file preview at 540 px

- Severity: P2
- Surface: all
- Evidence: `05-diff-and-review-file-greetmd-rendered-light-1440x900.png`: `greet.md` code column about 283 px, so table rows wrap; explorer `w-[min(22rem,46%)] min-w-64` (`FilePreviewPanel.tsx:1415-1425`), default `?? true` (`:965`).
- Current: Opening a file from a chat chip gives the explorer 256 px and the file 283 px.
- Proposed: default closed when the panel inline size < 720 px (same container measure as F-05-12); keep the stored user choice as an override (`t3code.fileExplorerOpen` unset means "auto").
- DNA: DNA-D6, DNA-L5.
- Effort: S
- Risk: users with the key unset see the change once; docs do not describe the default.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-05-22 Git warnings and the "Default branch" flag are 2:1 amber text

- Severity: P2
- Surface: all
- Evidence: `GitActionsControl.tsx:1607` (Detached HEAD notice), `:1617` ("Behind upstream. Pull/rebase first."), `:1656` (quick-action disabled reason), `:1870` ("Default branch" in the commit dialog; visible in `05-diff-and-review-commit-dialog-light-1440x900.png`), all `text-warning` (base `#fe9a00`, 2.08:1 light, DNA section 2.7).
- Current: These notices are the only explanation of why push and PR are unavailable and they are barely legible in light mode.
- Proposed: `text-warning-foreground` (`#bb4d00`, 4.90:1 light; `#ffb900` dark) on all four.
- DNA: DNA-C5, DNA-C6.
- Effort: XS
- Risk: none.
- Upstream-eligible: no (`GitActionsControl.tsx` in #24865's set; fold into a follow-up after merge).
- #24865: not addressed.

### F-05-23 The commit dialog lists untracked work as `+0 / -0` and a folder as one row; its totals match nothing else

- Severity: P2
- Surface: all
- Evidence: `05-diff-and-review-commit-dialog-light-1440x900.png`: `audit05/` (200 files) is one row `+0 / -0`; `docs/greet.md` (15 lines) shows `+0 / -0`; footer total `+12/-19` while the card says `+5,430 -10` and the panel `+5.4k -8`. Code `GitActionsControl.tsx:1912-1976`; separators differ (`" / "` per row, `/` in the total).
- Current: The review step before an irreversible-ish action shows numbers that are wrong for new files, and hides what a folder contains.
- Proposed: have the list use the same per-file numstat source as the Diff panel (untracked files counted as added lines); expand untracked directories to files (virtualised list, the dialog already has `h-44` scroll) or show `audit05/ (200 files)`; one format `+12 -19` (no slash) for rows and total.
- DNA: DNA-P3, DNA-V10.
- Effort: S for the folder label and format; server dependency for untracked line counts
- Risk: depends on the status payload; `GitActionsControl.browser.test.tsx` covers the dialog.
- Upstream-eligible: no (file in #24865's set).
- #24865: not addressed.

### F-05-24 With no remote, the Git menu offers only Commit and "Publish repository..." and never says why Push and PR are gone

- Severity: P2
- Surface: all
- Evidence: `05-diff-and-review-git-menu-light-1440x900.png` (fixture repo has no remote). Items come from `buildMenuItems` in `GitActionsControl.logic.ts`; the explanatory `<p>` rows exist for Detached HEAD and Behind upstream (`GitActionsControl.tsx:1606-1620`) but not for no upstream or no remote. Quick action for this state is `Publish repository` (`GitActionsControl.logic.ts:232`).
- Current: A user looking for "Push" or "Create PR" sees a shorter menu and no hint; "Publish repository..." is the answer but is phrased as a different task.
- Proposed: add the muted row `<p className="px-2 py-1.5 text-xs text-muted-foreground">No remote yet. Publish the repository to push and open pull requests.</p>` below the items when the repo has no remote; rename the item to "Publish repository…" (see F-05-35).
- DNA: DNA-V5 (explain in place), DNA-P3.
- Effort: XS
- Risk: needs `gitStatusForActions` to expose `hasRemote`; if absent, derive from existing `hasUpstream`/ref data (code-read; no GitHub remote on the fixture, so the PR half is code-read).
- Upstream-eligible: no (file in #24865's set).
- #24865: not addressed (it hides Push for empty drafts, a different state).

### F-05-25 Pull request creation is one click with a generated title and body: no preview, edit or draft choice

- Severity: P2
- Surface: all
- Evidence: code-read (fixture has no GitHub remote): `openDialogForMenuItem` runs `runGitActionWithToast({ action: "create_pr" })` directly (`GitActionsControl.tsx:1466-1468`); the action input carries only `commitMessage` and `filePaths`; `isDraft` exists only on the PR read model (`packages/contracts/src/git.ts:212`). Docs: "T3 Code generates ... review titles and descriptions from your changes". No amend flow exists (no `amend` string in the component).
- Current: Quick action "Push & create PR" publishes an AI-written title and body to GitHub before the user can read them.
- Proposed: before creating, open a `Dialog` ("Create pull request") with `Input` Title, `Textarea size="sm"` Description (both prefilled from generation), a `Switch` "Create as draft", the base branch `BranchPicker`, and footer `Cancel` / `Create pull request` (or `Create draft`). Same dialog pattern and tokens as the commit dialog.
- DNA: DNA-P7, DNA-V2.
- Effort: L; depends on a server call to generate title and body without creating (gate the UI part on it)
- Risk: changes a core flow; keep a setting-free path: the dialog opens only for the explicit "Create PR" item, the compound quick action keeps today's behaviour. Tests: `GitActionsControl.logic.test.ts`.
- Upstream-eligible: no (feature, needs a design discussion first).
- #24865: not addressed.

### F-05-26 Pull request status colours bypass the status tokens, and "closed" has two colours

- Severity: P2
- Surface: all
- Evidence: `pullRequest/pullRequestPresentation.tsx:76` (`text-amber-600/90 dark:text-amber-400/80`), `:193-202` (`text-amber-500`, `text-emerald-600 dark:text-emerald-300/90`), `:253`, `:278`; `pullRequestIcons.tsx:36, 46, 51` (emerald, red, violet); `PullRequestThreadDialog.tsx:50-58` colours closed `text-zinc-500` while `pullRequestIcons.tsx:46` (`PULL_REQUEST_STATE_PRESENTATION`) uses `text-red-600`. Existing lead: DRIFT-9. In the live PR header the "Open" label renders `text-emerald-600` (3.65:1 on white).
- Current: Review and check states cannot follow themes or the contrast slider, and the same PR state is red in the list and grey in the "checkout as thread" dialog.
- Proposed: checks and review states use `text-success-foreground`, `text-warning-foreground`, `text-destructive-foreground` (and `animate` via `Spinner` for running); keep Open/Closed/Merged glyph hues as identity (DNA-C14) but define them once in `PULL_REQUEST_STATE_PRESENTATION` and import that into `PullRequestThreadDialog` (delete `pullRequestStatusTone`).
- DNA: DNA-C1, DNA-C6, DNA-C14, DRIFT-9.
- Effort: S
- Risk: PR list snapshot tests: `pullRequestList.logic.test.ts` does not assert classes; visual QA in both themes.
- Upstream-eligible: yes.
- #24865: not addressed (its light-mode status change is `--diff-*-foreground` only; these are raw palette classes).

### F-05-27 The whitespace toggle reads as a double negative

- Severity: P3
- Surface: all
- Evidence: label `Show whitespace changes` with `aria-pressed="true"` and a pilcrow icon (`DiffPanel.tsx:925-945`; measured `aria-pressed: true`). A screen reader announces "Show whitespace changes, pressed" while whitespace is hidden. Settings calls the same thing "Hide whitespace changes" (`SettingsPanels.tsx:1243`).
- Current: Label, state and icon each say something different.
- Proposed: fixed accessible name "Hide whitespace changes" for both states with `aria-pressed` carrying the state; tooltip "Hiding whitespace changes. Click to show." / "Showing whitespace changes. Click to hide."; PR Code tab already uses a checkbox item named "Hide whitespace changes" (`PullRequestCodeTab.tsx:1131`).
- DNA: DNA-V2, DNA-I4.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-05-28 No "viewed" state in the thread Diff panel

- Severity: P3
- Surface: web, desktop
- Evidence: PR Code rows have a `Viewed` checkbox and `0 / 2 viewed` (`05-diff-and-review-pr-code-tab-light-1440x900.png`, `usePullRequestFilesViewed.ts`); the thread panel has none (brief asked for this state).
- Current: Reviewing a 200-file agent change has no progress memory beyond fold state, which F-05-01 shows is unreliable.
- Proposed: add a local-only viewed set per `collapseScopeKey` in `useDiffPanelSessionStore`, a 14 px `Checkbox` at the header's right (same position as PR Code) that collapses the file, and `N / M viewed` next to the stat. Reuse `toggleFileDiffFoldForViewed` (`PullRequestCodeTab.tsx:108`).
- DNA: DNA-P2 (smallest model: local only, session only), DNA-P7.
- Effort: M
- Risk: scope creep; do after F-05-01.
- Upstream-eligible: no (feature; Ideas discussion first).
- #24865: not addressed.

### F-05-29 Clicking a file name in the diff opens a Files tab, with no hint

- Severity: P3
- Surface: all
- Evidence: my own mis-click on a header opened `file3.js` in a new Files tab and made it the active tab (observed during the find test; that capture was overwritten by the rerun, reproduce by clicking any file name). Code: `DiffPanel.tsx:1029-1056` `onClickCapture` routes the `[data-title]` click to `openDiffFile`, the rest of the header toggles fold; hover only changes colour (`[data-title]:hover` in `StyledDiffCodeView.tsx`).
- Current: Same row, two different click results, and the one that moves you away is the filename.
- Proposed: add a `Tooltip` "Open file" on the title (delay 600 ms) and keep `Cmd/Ctrl+click` semantic documented in it; no behaviour change.
- DNA: DNA-I4, DNA-V5.
- Effort: XS
- Risk: tooltips inside Pierre's shadow DOM: render through the existing `renderHeaderFilenameSuffix` wrapper or CSS `title`. No tests.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-05-30 A 22 KB single line wraps into hundreds of rows

- Severity: P3
- Surface: all
- Evidence: `05-diff-and-review-file-longline-dark-1440x900.png` (one source line fills the viewport; wrap is the default `settings.ts:474`). `tokenizeMaxLineLength: 1_000` (`DiffWorkerPoolProvider.tsx:52`) skips colouring but still renders every character.
- Current: Minified bundles or lockfile lines make the diff unscrollable until you turn wrap off.
- Proposed: clamp rendered text of any line over 2,000 characters to 2,000 with an inline `Show 20,000 more characters` button (`Button variant="inline" size="xs"`); needs a Pierre hook (see Needs deeper look). Fallback: when a file has a line over 5,000 characters, show a header notice offering "Turn off wrapping for this file".
- DNA: DNA-P1, DNA-D6.
- Effort: M
- Risk: library capability unknown.
- Upstream-eligible: no until the hook exists.
- #24865: not addressed.

### F-05-31 First file render logs a worker error for the other theme

- Severity: P3
- Surface: all
- Evidence: expanding the first file logs `Worker error: Error: Theme "pierre-dark" has not been resolved` in light and `Theme "pierre-light"` in dark (script `err1`; stack `getHighlighterThemeStyles` in `@pierre/diffs` worker). Highlighting rendered correctly in both schemes. Pool is created with one theme (`DiffWorkerPoolProvider.tsx:46-57`).
- Current: Console noise on every first render per theme; the worker is asked for the other theme's styles before `setRenderOptions` loads it.
- Proposed: initialise the pool with `theme: { light: "pierre-light", dark: "pierre-dark" }` (library supports dual themes through `themeType`) so both are resolved up front, and drop the per-theme `DiffWorkerThemeSync` round trip.
- DNA: DNA-P1.
- Effort: S
- Risk: could change first-paint timing; verify theme switching live (not completed here, see Incomplete).
- Upstream-eligible: yes.
- #24865: not addressed.

### F-05-32 The tree loading icon spins forever on an unstepped loop

- Severity: P3
- Surface: all
- Evidence: `pierre-tree-theme.ts:17-19` `animation: t3-tree-spin 1s linear infinite` (only gated by `prefers-reduced-motion: no-preference`; not paused off screen). DNA-M2/M6: unstepped infinite loop, hand-rolled spinner.
- Current: Used by Pierre tree directory loading in the Files browser.
- Proposed: replace with `steps(12)` and 1.2 s (same duty-cycled idea as `status-pulse`), or swap the symbol for the shared `Spinner` through the icon override; add `animation-play-state: var(--visible-animation-state)` is not available in shadow CSS, so use the stepped loop.
- DNA: DNA-M2, DNA-M6, DNA-P1.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-05-33 Attachment sizes round up: 92 bytes reads "1 KB"

- Severity: P3
- Surface: all (shared with mobile)
- Evidence: `packages/client-runtime/src/state/attachments.ts:196-200` (`Math.max(1, Math.ceil(bytes / 1024))`); chips `notes.md 1 KB` for a 92-byte file and `doc.pdf 1 KB` for 387 bytes (`05-diff-and-review-attach-chips-light-1440x900.png`).
- Current: Every tiny file claims 1 KB; also 1,100 bytes reads "2 KB".
- Proposed: `< 1024` returns `${n} B`; `< 10 KB` one decimal (`1.1 KB`), else rounded.
- DNA: DNA-V10, DNA-P3.
- Effort: XS
- Risk: add a unit test in `attachments.test.ts`; mobile uses the same helper.
- Upstream-eligible: yes.
- #24865: not addressed (file not touched).

### F-05-34 Error copy in the file and commit surfaces breaks the voice rules

- Severity: P3
- Surface: all
- Evidence: `AttachmentFilePreview.tsx:193` fallback "Please try again."; "Unable to load audio/video/image." (`AttachmentFilePreview.tsx:229, 238, 248`, `FilePreviewPanel.tsx:189, 239, 354`); "Unable to open file" (`GitActionsControl.tsx:1508`), "Unable to open file in browser" (`FilePreviewPanel.tsx:1178`); fallback "An error occurred." (`GitActionsControl.tsx:1279, 1412, 1509, 1530`, `FilePreviewPanel.tsx:~1180`). Lead: DRIFT-12.
- Current: Three prefixes ("Could not", "Unable to", "Failed"), a "Please", and stock fallbacks that hide the cause.
- Proposed: "Could not load audio.", "Could not open file.", "Could not open file in browser."; drop "Please try again." and use "Try again." only on a retry button; fallback description = the thrown message, else the action name plus the HTTP status. "Action failed" at `:1278` becomes "Could not run Git action".
- DNA: DNA-V3, DNA-V4, DNA-V6, DRIFT-12.
- Effort: XS
- Risk: tests asserting strings: grep before changing (`GitActionsControl.browser.test.tsx`).
- Upstream-eligible: yes (split from GitActionsControl lines).
- #24865: not addressed.

### F-05-35 "ref" jargon and ASCII ellipses in the branch and Git pickers

- Severity: P3
- Surface: all
- Evidence: "Create new ref "x"" (`BranchToolbarBranchSelector.tsx:609`; seen in `05-diff-and-review-branch-picker-nomatch-light-1440x900.png` right under a row labelled with a branch icon), "Search refs..." (`BranchPicker.tsx:174`, `DiffPanel.tsx:757`), "No matching refs." (`DiffPanel.tsx:768`), "Loading refs..." (`BranchToolbarBranchSelector.tsx:316`, `WorktreeBaseBranchPicker.tsx:65`), "Publish repository..." (`GitActionsControl.tsx:1603`), "Initializing..." (`:1637, :1684`), "Preparing local..." / "Preparing worktree..." (`PullRequestThreadDialog.tsx:296, 311`). DRIFT-14.
- Current: The product says branch everywhere else; three dots instead of the ellipsis character.
- Proposed: "Create branch "x"", "Search branches…", "No matching branches.", "Loading branches…", "Publish repository…" (menu items that open a dialog end in the ellipsis character), "Initializing…", "Preparing local…". Where refs can be tags, use "Search branches and tags…".
- DNA: DNA-V7, DNA-V9, DRIFT-14.
- Effort: XS
- Risk: string assertions in `BranchToolbar*.browser.test.tsx`.
- Upstream-eligible: yes for files not in #24865's set (`BranchPicker`, `DiffPanel`, `PullRequestThreadDialog`); `BranchToolbarBranchSelector.tsx` and `GitActionsControl.tsx` wait.
- #24865: not addressed.

### F-05-36 Commit dialog uses raw palette and ring classes, and its message box cannot submit from the keyboard

- Severity: P3
- Surface: all
- Evidence: `GitActionsControl.tsx:1863` `rounded-xl bg-zinc-25 ... ring-1 ring-black/5 dark:bg-white/[0.035] dark:ring-white/5` and `:1913` `dark:bg-white/[0.025]` (DNA-C1 literals, DNA-S3 ring instead of hairline); the message `Textarea` (`:1983-1988`) has no `onKeyDown`, while the review comment box submits on mod+Enter (`DiffCommentAnnotation.tsx:84-92`). The label says "Commit message (optional)" and the placeholder "Leave empty to auto-generate" (generation calls the model).
- Current: Looks different from every other card (settings groups are `border border-border/60 bg-card/40`) and needs the mouse to confirm.
- Proposed: container `rounded-lg border border-border/60 bg-card/40 p-3`, inner list `rounded-md border border-border/50 bg-card`; add `onKeyDown` mod+Enter to `runDialogAction` (same `isCommentSubmitShortcut` helper) and show the hint as in F-05-20; helper text "Leave empty to generate a message with your selected writer model." (name the cost).
- DNA: DNA-C1, DNA-S3, DNA-L8, DNA-V5.
- Effort: S
- Risk: after #24865 `--radius` is 0.5rem so `rounded-lg` is 8 px; use tokens, not px. `GitActionsControl.browser.test.tsx`.
- Upstream-eligible: no (file in #24865's set).
- #24865: not addressed.

### F-05-37 Workspace file previews have no Copy contents or Save, only attachments do

- Severity: P3
- Surface: web, desktop
- Evidence: workspace header actions are Open in editor, rendered toggle, word wrap, open in preview browser, explorer (`FilePreviewPanel.tsx:1240-1281`); `Copy contents` and `Save file` exist only in `AttachmentFilePreview.tsx:293-309`. Docs promise them for attached files only, so this is additive.
- Current: To copy a source file you select all in a virtualised editor.
- Proposed: add `FileSurfaceAction label="Copy contents"` (MorphIcon Copy/Check, same hook `useCopyToClipboard`) for text files in `FilePreviewPanel`, disabled while truncated ("Copy preview" as attachments do).
- DNA: DNA-L8, DNA-P7.
- Effort: XS
- Risk: none.
- Upstream-eligible: yes.
- #24865: not addressed.

### F-05-38 Pull Requests page: Title Case header and a list column that truncates every title to about 28 characters

- Severity: P3
- Surface: web, desktop
- Evidence: header and sidebar label "Pull Requests" (`sidebar/SidebarChrome.tsx:215`; docs and the rest of the UI use sentence case, DNA-V1). With a PR selected the list column is about 420 px and rows read `fix(desktop): browser snapshots ...`, `UtkarshUserna... pingdotgg/t3co... vouch:trust... +1` (three truncations in one meta line; `05-diff-and-review-pr-detail-summary-light-1440x900.png`). The page itself works: list, Summary, Timeline, Code, filters, search, sort.
- Current: Conventional-commit titles lose their scope; the repo name repeats on every row of a single-repo list.
- Proposed: "Pull requests"; hide the repository segment when all rows share one repository (show it only in group headers or when 2+ repos are present); allow two-line titles in the list the way #24865 does for the thread-card PR row (`line-clamp-2`, `leading-4.5`).
- DNA: DNA-V1, DNA-T9, DNA-D1.
- Effort: S
- Risk: row height changes affect list virtualisation measurements; `pullRequestList.logic.test.ts` unaffected.
- Upstream-eligible: yes for the casing; the row change is a design call.
- #24865: not addressed (it wraps titles in `ThreadDetailsPrRow` only, not in `PullRequestListRow`).

## Edge-case results (matrix)

Data

- Empty (no diff): code-read only. Strings at `DiffPanel.tsx:1017-1020`; hidden-file and Initialize Git gaps in F-05-07 and F-05-19. Latest turn scope on a clean thread not produced.
- One item: PASS (the seed thread, 2 files, Latest turn and Uncommitted).
- 100+ items: PASS with defects (211 files: F-05-01, F-05-09, F-05-11).
- 10,000+ items: NOT TESTED (host cannot create that many files cheaply). Code-read: lists are loaded four files at a time and the tree gets all paths; `sortedReviewFiles` runs three times per render (`useReviewFilePatches.ts`), O(n log n) each, worth a look at 10k (area 22).
- Very long names (200-char paths): NOT TESTED live; paths use start truncation (rename case fails: F-05-10).
- Unicode, emoji, RTL, whitespace names: NOT TESTED (no such filenames created).

Content

- 5k line diff: PASS (98 ms to first lines, 60 fps scroll, measurements above).
- 200 file diff: PASS with defects (940 ms to first header; F-05-01, F-05-09, F-05-11, F-05-17).
- Binary files: FAIL (F-05-02).
- Renamed files: FAIL (F-05-10; pure-rename reveal in Needs deeper look).
- Deleted files: PASS (red header icon, all-red body).
- Images in diffs: FAIL (F-05-02, no thumbnail).
- Whitespace-only change: FAIL (F-05-07).
- Very long single line: FAIL, minor (F-05-30).
- Tables, code blocks, links, huge tool output: N/A (area 03); markdown attachment table and code have Copy table / Copy code actions in the preview modal: PASS.

Network and agents

- Provider not installed, logged out, stream cases, permission prompt, six threads streaming: N/A (not this area).
- Read access denied: code-read (`DiffPanel.tsx:979-988` shows `fileAccess.error` or "This connection cannot read local diffs.").
- Relay disconnected, reconnect after sleep, server restart, version mismatch: NOT TESTED.

Git

- No repo: code-read only (F-05-19).
- Repo with uncommitted changes: PASS (seed and fixtures).
- Detached HEAD: code-read (F-05-22).
- No remote: observed (F-05-24); PR creation code-read (F-05-25).
- No GitHub auth when creating PR: NOT TESTED (no remote). The Pull Requests page used the host's own auth and loaded 99 real PRs.
- Push rejected, merge conflict in worktree, branch name collision, worktree creation failure: NOT TESTED (needs a remote or is area 04). Branch picker "Create new ref" path observed (F-05-35).
- Commit with 211 files: observed (F-05-06).

Viewport

- 1440x900: PASS with findings.
- 1280x720: PASS (panel 539 px, no differences from 1440).
- 1024x640: PASS (panel 407 px, toolbar fits; chat column narrows).
- 800x600: FAIL (F-05-12).
- 3440x1440: NOT TESTED (panel stays max 560 px by `DiffPanelShell.tsx:33`; maximize covers wide use).
- Mobile 390x844, OS zoom, browser zoom: NOT TESTED (mobile is a native app; zoom not run).

Preferences

- Light and dark: PASS (all key states in both).
- System switching live: NOT COMPLETED (script aborted; see Incomplete).
- Named themes: NOT TESTED; code-read: diff surface derives from `--code-background` and `--diff-*` which themes do not recolour (`DIFF_SURFACE_THEME_UNSAFE_CSS`).
- Diff colours (blue-orange): PASS (`05-diff-and-review-blue-orange-*`), counts follow the scheme.
- Reduced motion: code-read PASS (`StyledDiffCodeView.tsx` disables the 200 ms opacity transition; F-05-32 is the exception).
- High contrast: NOT TESTED.
- Keyboard only: FAIL (F-05-05); toolbar and header controls PASS with visible 2 px rings.
- Screen reader: partial, code-read: `DiffStatLabel` is a `role="group"` with an aria-label, chevrons carry `aria-expanded` and file names; F-05-27 flags the whitespace toggle.
- Font size overrides: NOT TESTED.

Lifecycle: first launch, update, corrupted settings, sleep: N/A or NOT TESTED (not this area).

## Already good (do not touch)

- Lazy, virtualised rendering: 98 ms to expand a 5,000-line file, 60 fps scroll through 100,000+ px, 940 ms to a first header over 211 files (`StyledDiffCodeView` item metrics, `DiffWorkerPoolProvider`).
- Find in diff (mod+f): works on collapsed and lazy files, match counter ("1 of 5"), case, word, regex toggles, Enter and arrows (`05-diff-and-review-find-typed-light-1440x900.png`). Only note: the panel overlays sticky headers and stat columns (cosmetic).
- Review comment flow end to end: gutter button, draft textarea with blue focus border, mod+Enter submit, annotation, composer chip `index.js L6` (`...comment-saved-light...`).
- Maximize panel plus split: side by side is excellent when wide (`...split-maximized-light...`).
- Toolbar and header focus rings (2 px blue, `...focus-*@2x`), tab order, copy-path anchored toast, `MorphIcon` swaps.
- File tree: icons by type, git status letters (A, M, D, R), folder dots, flattened empty directories, collapse all, selected-row ring.
- Diff colour scheme setting (red-green and blue-orange) and the `--diff-*` token plumbing; pierre surface theming from `--code-background`.
- Attachment preview modal: breadcrumb "Draft > page.html 1 KB", rendered HTML, source toggle, Save file, Remove from draft, Close, Copy table and Copy code in markdown.
- Commit dialog structure: branch, file list with Edit checkboxes, message, "Commit on new branch", clear Default branch flag.
- Pull Requests page: list groups, search, sort, filters, state glyphs, label chips, two-pane detail with Summary / Timeline / Code, "gh pr checkout" line, Viewed checkboxes, `Diff options` overflow at narrow widths in the PR Code tab (the pattern F-05-12 should copy).
- The existing Settings rows for hide whitespace, default file state and diff layout.

## Incomplete

- PR checks popover: the "23 of 31 passing" control is not a button in the DOM I probed; not opened. `PullRequestChecksPopover.tsx` read only. Not exercised: merge, review submit, comment, Viewed tick, stack menus, linked-PR rows (they write to real GitHub).
- Review Guide tab: Review guides are off on this server (no Guide tab); code not walked.
- PDF preview: headless Chromium has no PDF plugin ("Couldn't load plugin."), so PDF rendering is NOT TESTED (and my hand-made PDF may be malformed); HTML, markdown and PNG are covered.
- Live theme switching with an open diff: the script aborted on a hidden virtualised row before the media-query flip; not repeated.
- Named themes, high contrast, 3440 wide, browser zoom, mobile web at 390, desktop (Electron): not run.
- Real PR creation, push rejection, merge conflicts, branch collision: the fixture repo has no remote.
- `FileBrowserPanel`, `ProjectFilePicker` (mod+P), `FileBreadcrumbs` menus, `ThreadPullRequestsPanel`, `PullRequestStackMenu`, `LinkPullRequestDialog`, `PullRequestReviewForm`: read at the surface level or not at all.
- Diff selection reset when navigating away (issue #22319) and scroll loss on thread switch (#11571) were not reproduced.

## Needs deeper look

- Pure-rename reveal: clicking `src/lib/dates.js` (`R`) in the tree did not scroll the diff within 2.2 s (`...file-rename-pure-dark...`), while other reveals worked. The placeholder (`rename-changed`) and loaded (`rename-pure`) fold keys differ, the same root cause as F-05-01; `useCodeViewFileReveal` may never match. Confirm after the F-05-01 fix.
- Pierre header API: no title slot, only prefix, metadata and filename-suffix renderers; F-05-10 and F-05-02 lean on `unsafeCSS`. Check whether the pnpm patch on `@pierre/diffs@1.6.1` is the right place for a rename-aware header.
- Custom Shiki theme registration in the worker (F-05-18) and a line-clamp hook (F-05-30).
- Pierre `selectedLines` as a keyboard model (F-05-05): does it accept programmatic ranges across annotation rows?
- The "Worker error: Theme ... has not been resolved" cause (F-05-31): confirm that no first-paint flash occurs on slow machines.
- `sortedReviewFiles(source)` is recomputed three times per render for large sources (`useReviewFilePatches.ts`); worth profiling at 10k files (area 22).
- Pull Requests cold load of 5 to 8 s with a skeleton and no text: check whether the cached list (docs: "Cached lists ... stay readable offline") is used on first paint in a normal profile; my fresh Playwright context had no cache.
- The server needs: a `binary` flag on review files (F-05-02), `hiddenFileCount` for ignored whitespace (F-05-07), status totals that honour `ignoreWhitespace` (F-05-08), untracked line counts (F-05-23), generate-without-create for PR title and body (F-05-25), and an undo-commit method (F-05-06). Each is a dependency; UI parts above are written to ship first.
