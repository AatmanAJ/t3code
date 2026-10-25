# 17 typography-and-hierarchy

Repo: pingdotgg/t3code main @ 5f64c5eb (pre-#24865), web build at localhost:5733, Chromium on macOS (SF system font), light scheme for computed styles (type metrics are theme-independent; colours are area 16). #24865 effect read from `prior-art/pr-24865.diff`; its end state is the baseline for every "Proposed".
Method: 12 views walked with a text-node census (`getComputedStyle` on every visible text node, bucketed by size/weight/line-height/tracking/family) plus about 20 targeted probes (heading outline, links, numerals, truncation, font-size emulation, dialog and palette DOM edits); class counts by tokeniser over `apps/web/src/components` and `routes`. Scripts live in `/tmp/t3code-pw/a17-*.mjs`. Cross-references: F-03-10/17/19/21/22/25, F-04-03/21/31/32/41, F-07-09/14/37, F-01-26, DRIFT-1/4/6/7/11/22/23.

Counts: P0 0, P1 2, P2 7, P3 5 (14 findings).

## Summary

The ladder in DNA-T1 (12/14/20/24-30, 11 and 10 for dense metadata) is respected by the body of the app: of 7,759 rendered text nodes on 12 views (10,799 total minus 1,532 sr-only labels and 1,508 monogram glyphs), 95% are 12 or 14px, almost all at weight 400/500. The drift is at the edges: titles (12 treatments of "a title"), greys (11 neutral levels in 7 views), 10px content text, and px-fixed sizes (13px details card, four 11px labels) that ignore the Interface font size setting. #24865 closes the settings-section title, chat-text, description and inline-code items and leaves the rest.

## Type scale (measured, default theme, 1440x900, root 16px)

`lh` = computed line-height. "Prop." is the target after #24865 plus this audit. PR = changed by #24865.

| Role                         | Measured size/weight/lh/tracking                              | Where (file:line)                                                                                                               | DNA           | Prop.                                                            |
| ---------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------- | ---------------------------------------------------------------- |
| Display hero                 | 30/400/36/-0.75px (24 below sm)                               | `DraftHeroHeadline.tsx:347`, `DraftHeroProjectHeading.tsx:47`                                                                   | T1            | keep                                                             |
| Page title                   | 24/600/32/-0.6px (30 at sm in `standalone-page.tsx:64`)       | `WelcomeWizard.tsx:333,1404,1772`, `ConnectAgentSurface.tsx:276`                                                                | T1            | keep, make the one page-title style (F-17-01)                    |
| Page title outliers          | 18/600, 18/500, 16/500, 24/600 no tracking                    | `FirstRunGate.tsx:191`, `routes/__root.tsx:145`, `GuestPage.tsx:314`, `PreviewUnreachable.tsx:31,64`                            | T1, T5        | empty-state 20/600, form-card 16/600, page 24/600 tracking-tight |
| Dialog / sheet title         | 20/600/20 (`leading-none`)                                    | `dialog.tsx:172`, `alert-dialog.tsx:113`, `sheet.tsx:145`                                                                       | T1, T6        | 20/600/25 (F-17-08)                                              |
| Empty-state title            | 20/600 default, 17/600 compact, 24-30/600 hero                | `ui/empty.tsx:7,9,92`                                                                                                           | T1            | compact 16/600                                                   |
| Settings group title         | 14/400/20 at fg 70% (PR: 16/600 fg)                           | `settingsLayout.tsx:249` (PR); stragglers `ThemeSettings.tsx:830,835`, `FoldedSettingsSection.tsx:46`, `SettingsPanels.tsx:727` | T5            | 16/600 everywhere                                                |
| Settings scope sentence      | 16/400/24 muted (PR: 14)                                      | `SettingsScopeSentence.tsx`                                                                                                     | T2            | 14 (PR)                                                          |
| Top-bar title                | 14/500/20 (`h2` thread; `h1` Usage, PR)                       | `ChatHeader.tsx:383`, `UsagePage.tsx:363`, `PullRequestsColumn.tsx:184`                                                         | T2            | keep; saved thread and settings page names become `h1` (F-17-03) |
| Settings row title           | 14/500/20 fg                                                  | `settingsLayout.tsx:484`                                                                                                        | T2, T5        | keep                                                             |
| Settings description         | 12/400/18 muted at 80% (PR: 100%, balanced)                   | `settingsLayout.tsx:495`                                                                                                        | T2            | PR                                                               |
| Thread row title             | 14/400/20 read, 14/500/20 active or unread (PR: fg 75%, 100%) | `SidebarThreadRow.tsx:971-992`                                                                                                  | T5            | PR                                                               |
| Thread row project           | 12/500/16 muted (PR: 400)                                     | `SidebarThreadRow.tsx:1284`                                                                                                     | T5            | PR                                                               |
| Thread row time, counts      | 12/400/16 tabular                                             | `SidebarThreadRow.tsx:1307`                                                                                                     | T8            | keep                                                             |
| Chat prose                   | 14/400/22.75 (1.625) fg 80% (PR: 90%)                         | `ChatMarkdown.tsx:1593`                                                                                                         | T2, T6        | PR                                                               |
| Markdown h1-h4               | 20/18/16/14, 600, lh 1.3                                      | `index.css:1820-1852`                                                                                                           | T5            | keep                                                             |
| Inline code                  | 12/400/19.5 mono (PR: 0.85em)                                 | `index.css:2058`                                                                                                                | T7            | PR (F-03-21)                                                     |
| Code block                   | 13/400/17.9 mono                                              | `--font-size-code`                                                                                                              | T7            | keep                                                             |
| File chip                    | 12.04/500/15.05                                               | `ContextChip.tsx:9`                                                                                                             | T4            | keep                                                             |
| Turn fold ("Worked for 17s") | 14/400/22.75 muted                                            | `MessagesTimeline.logic.ts:1170` (label), `MessagesTimeline.tsx`                                                                | T2            | keep                                                             |
| Timestamps                   | 12/400/16 muted tabular                                       | timeline rows                                                                                                                   | T8            | keep                                                             |
| Composer text, placeholder   | 14/400/22.75; placeholder at 75% (PR: 100%)                   | `ComposerPromptEditorTiptap.tsx:1104,1842`                                                                                      | T2            | PR                                                               |
| Composer controls            | 14/500/20 muted                                               | `ComposerControl.tsx:18` (default), `:17` (compact, 12px at /70)                                                                | T2            | keep                                                             |
| Details-card rows            | 13/500/19.5 fg 80% (px, not rem)                              | `threadDetailsPanelStyles.ts:18,29`                                                                                             | T4, DRIFT-6   | rem (F-17-09)                                                    |
| Changed-files header         | 12/500/16                                                     | `ChangedFilesTree.tsx` summary                                                                                                  | T2            | keep                                                             |
| Changed-files rows           | dir 11/400 mono, file 12/400 mono, counts 10/400 mono         | `ChangedFilesTree.tsx:198,202,235,239`                                                                                          | T1, T7        | counts 11/500 (F-17-05)                                          |
| Diff stat (details card)     | 11/500 mono                                                   | `ThreadDetailsCard` Changes row                                                                                                 | T7            | 11/500                                                           |
| Diff stat (sidebar row)      | 12/400 mono, U+2212 minus                                     | `SidebarThreadRow.tsx:1465-1473`                                                                                                | T7            | 11/500, `DiffStatLabel`                                          |
| Menu item, palette item      | 14/400; project name inline 14/600                            | `menu.tsx:127`, palette                                                                                                         | T2            | keep                                                             |
| Menu / palette group label   | 12/500 muted                                                  | `menu.tsx:268`; palette "Actions"                                                                                               | T2            | keep                                                             |
| Shortcut label               | 12/500, tracking 1.2px                                        | `menu.tsx:292`, `command.tsx:203`                                                                                               | T10           | tracking normal off macOS (F-17-11)                              |
| Tooltip                      | 12/400 (code variant 11 mono, px)                             | `tooltip.tsx:140,145`                                                                                                           | T4            | code variant `text-2xs`                                          |
| Overlines                    | 10-12px, 400-600, tracking 0 to 0.18em (7 variants)           | see F-17-06                                                                                                                     | T10           | 11/600/0.1em                                                     |
| Badge, counter               | 10/11                                                         | 94 and 140 uses                                                                                                                 | T1            | 11 if it carries content (F-17-04)                               |
| Project monogram             | 8.25/700 mono (px)                                            | `ProjectMonogram.tsx`                                                                                                           | T4 documented | keep                                                             |
| Usage KPI                    | 30/600 sans; diagnostics KPI 24/600 mono -1.2px               | `UsagePage.tsx`, `ResourceTelemetryDiagnostics.tsx`                                                                             | T7            | keep                                                             |

Distribution (class tokens, component dirs): settings 871, chat 468, root 274, pullRequest 258, ui 204, usage 137, sidebar 78. `text-xs` 761, `text-sm` 401, `text-2xs` 140, `text-3xs` 94, `font-medium` 381, `font-semibold` 108, `font-bold` 2, `tabular-nums` 181, `font-mono` 167, `uppercase` 32, `tracking-widest` 22, `leading-relaxed` 64, `leading-none` 21. Matches DNA 3.3.

## Hierarchy notes (what a user reads first)

- Thread row: title 14 beats meta 12 by size; weight then double-encodes read state (400 read, 500 unread) with colour. On main the project name (12/500) is heavier than a read title (14/400); #24865 fixes that (project 400, titles 75%).
- Settings row: title 14/500 over description 12/400 muted over a possible third line ("Automatic", 12/400). Clear two levels. Group titles were lighter than the rows they head on main (14/400 at 70%); #24865 fixes in `settingsLayout.tsx` only (F-17-01).
- Message vs tool: answer prose 14/22.75, tool command chip 12 mono, fold row 14 muted, timestamp 12. Hierarchy is carried by colour and mono, not size. Works. The collapsed command label is sans (F-03-17).
- Header: crumb 14/500 muted then title 14/500 fg; thread title is `h2`, no `h1` anywhere in the chat shell (F-17-03).
- Code vs body: block 13 over prose 14 over inline 12. Inline code reads small next to 14px prose (F-03-21).

## Findings

### F-17-01 "A title" has twelve treatments, and four settings group titles still read lighter than the rows they head after #24865

- Severity: P1
- Surface: all
- Evidence: measured (census over 12 views) and code-read. Page-level titles: 30/400 hero `DraftHeroHeadline.tsx:347`; 24/600 tracking-tight `WelcomeWizard.tsx:333,1404,1772`, `standalone-page.tsx:64`, `ConnectAgentSurface.tsx:276`, `ConnectCliAuthSurface.tsx:28`; 24/600 without tracking `PreviewUnreachable.tsx:31,64`; 18/600 `FirstRunGate.tsx:191`; 18/500 404 `routes/__root.tsx:145`; 16/500 `GuestPage.tsx:314`; 18/600 `GuideStop.tsx:134`; 16/600 `ClerkUserProfilePage.tsx:25`. Card and section titles: dialog 20/600 (`dialog.tsx:172`), popover 14/600 (`popover.tsx:132`), Empty 20/600 default and 17/600 compact (`empty.tsx:7`), settings group 14/400 at fg 70% measured on every Settings page. After #24865 only `settingsLayout.tsx:249` becomes 16/600; four more sites keep 14/400/70%: `ThemeSettings.tsx:830,835`, `FoldedSettingsSection.tsx:46`, `SettingsPanels.tsx:727` ("Legacy features", not in the PR's hunks).
- Current: The same job (title the page, title a section) is styled twelve ways; on Settings the group title (14/400, 70%) is lighter than the row titles under it (14/500, 100%) on main, and still is at the four sites above after the PR (Appearance "Color scheme" and "Themes", General "Legacy features", any folded section).
- Proposed: adopt one ladder (display 30/400/-0.75px, page 24/600 `tracking-tight`, dialog 20/600, section 16/600, item 14/500, body 14/400) and move the outliers: `FirstRunGate.tsx:191` (18/600) and `routes/__root.tsx:145` (18/500) are empty-state titles, so match `Empty` default: `text-xl font-semibold`; `GuestPage.tsx:314` (a small form card) to `text-base font-semibold`; `PreviewUnreachable.tsx:31,64` add `tracking-tight`, drop `leading-tight`; `ThemeSettings.tsx:830,835`, `FoldedSettingsSection.tsx:46`, `SettingsPanels.tsx:727` to `text-base font-semibold text-foreground` (delete `group-hover:text-foreground` in the last); `empty.tsx:7` compact: `text-[1.0625rem]` to `text-base` (see F-17-12).
- DNA: DNA-T1, DNA-T5, DRIFT-7 (this finding is its measured form and extends F-07-14)
- Effort: S
- Risk: visual only; no test queries these classes. Gate and 404 titles grow 18 to 20px, the guest title gains weight; check the 390px width for wrapping of the gate title.
- Upstream-eligible: yes for the six non-PR files (follow-up to #24865); `settingsLayout.tsx` stays with the PR
- #24865: partial (settings sections only)

### F-17-02 Neutral text has 11 grey levels across 7 views; hierarchy leans on alpha steps instead of size and weight

- Severity: P1
- Surface: all
- Evidence: measured on thread (Claude, Codex), Settings General/Appearance/Providers, Usage, Pull requests (light): foreground at 100, 90, 85, 80, 70% and muted-foreground at 100, 90, 80, 75, 40% plus one at 64% via ancestor opacity = 11 distinct neutral text colours. Source counts (`components`, `routes`, `.ts` and `.tsx`): `text-muted-foreground` 970 plain and 173 with 14 alpha steps (`/70` 78, `/60` 26, `/80` 13, `/65` 12, `/55` 8, `/50` 7, `/40` 7); `text-foreground` 384 plain and 83 with 8 steps (`/80` 32, `/90` 17, `/85` 12, `/75` 12), plus the two contrast-slider `calc()` forms; `text-secondary-label` 52 plain and 4 at `/70`; `text-sidebar-muted-foreground` 12 plain and 12 with 5 steps. About 270 alpha-on-text sites; per directory (`.tsx`, 266): settings 75, chat 72, root 52, sidebar 21, pullRequest 21, ui 9, usage 5, other 11. Contrast consequences are filed elsewhere: F-03-25, F-04-21, F-04-31, F-04-41, F-07-37, DRIFT-1, DRIFT-4.
- Current: Four names for one grey (DRIFT-4) times fifteen alphas. The reader cannot learn "what is secondary"; two screens show the same kind of label at different greys.
- Proposed: three text tiers, nothing else: primary `text-foreground`, secondary `text-muted-foreground` (4.71:1 light, 5.08 dark; dark lifts to neutral-400 with #24865), quiet = the same secondary token at `text-2xs` (11px), never a lower alpha. Codemod on text only (not icons, borders, `bg-*`): `text-foreground/{90,92,95}` to `text-foreground`; `text-foreground/{65,70,75,80,85}` and `text-muted-foreground/{50..90}` and `text-secondary-label/70` to `text-muted-foreground`; `text-muted-foreground/{30..45}` to `text-muted-foreground` and put disabled looks on the container (`aria-disabled:opacity-64` already exists). Exempt: `ChatMarkdown.tsx:1593` (contrast-slider formula), the sidebar thread-row read title at 75% (`SidebarThreadRow.tsx:976`, owner call stays), `components/ui`. Land per directory: settings, chat, root, sidebar+pullRequest+usage, then a lint rule in `oxlint-plugin-t3code` forbidding `text-(muted-foreground|foreground|secondary-label)/\d+` outside the exemptions. Merge `--placeholder`, `--secondary-label`, `--icon-muted` aliases only if area 16 agrees (DRIFT-4).
- DNA: DNA-T5 (weight and size carry hierarchy), DNA-C4, DRIFT-1, DRIFT-4
- Effort: L (about 270 mechanical edits, split into 4 PRs of S/M)
- Risk: dense metadata gets louder (dark sidebar and diagnostics most); review each dir in both themes. No tests assert alpha classes. The sidebar thread-row title stays at 75% so the owner call holds.
- Upstream-eligible: yes, as the per-directory PRs; exclude the files #24865 touches (`SidebarThreadRow.tsx`, `ChatMarkdown.tsx`, `settingsLayout.tsx`, `ComposerPromptEditorTiptap.tsx`) until it lands
- #24865: partial (chat prose to 90%, descriptions to 100%, a few `/40` removed; adds new `/75` and `/80` steps)

### F-17-03 The chat shell has no `h1`, Settings pages have no page heading, and the thread title is an `h2`

- Severity: P2
- Surface: web, desktop
- Evidence: census heading outline. Thread views: one `h2` (title), sr-only `h3` per role ("T3 Code", "You"), no `h1`. Settings General: 0 `h1`, 9 `h2`, 41 `h3`; Keybindings: 0 `h1`, 8 `h2`, 82 `h3`; Diagnostics 14 `h2`. The page name ("General") exists only as the non-heading current crumb (`SettingsBreadcrumb.tsx`, `WorkspaceBreadcrumbItem current`). Usage and Pull requests already use `h1` (`UsagePage.tsx:363`, `PullRequestsColumn.tsx:184`), so the shell is inconsistent. Code: `ChatHeader.tsx:383` (saved thread) and `:398` (draft; the draft hero is the `h1` there).
- Current: Heading navigation in a screen reader starts at the first section of a settings page with no page title, and a thread has no top-level heading.
- Proposed: `ChatHeader.tsx:383` (saved thread, `isServerThread`) `<h2>` to `<h1>` (same classes; Tailwind preflight gives headings no size). Leave `:398` (draft) as `h2`: the draft hero (`DraftHeroHeadline.tsx:347`, `DraftHeroProjectHeading.tsx:47`) already owns the `h1`. In `SettingsBreadcrumb.tsx` wrap the current item's text in `<h1 className="min-w-0 truncate">{sectionLabel ?? "Settings"}</h1>`. Leave `SettingsRow` titles as `h3`.
- DNA: DNA-P8 (every surface), accessibility rule 6 of the protocol
- Effort: XS
- Risk: none visual; no test queries heading roles (grepped `*.test.tsx`).
- Upstream-eligible: yes
- #24865: not addressed

### F-17-04 About twenty readable text sites are 10px (`text-3xs`), below the dense-metadata role DNA gives that size

- Severity: P2
- Surface: all
- Evidence: 94 `text-3xs` uses (140 `text-2xs`). Roughly half are counters, pills and icon overlays (correct). Content-bearing sites, code-read: `UserMessageContextChips.tsx:178,210,218,244` (page URL, pasted context excerpt), `PullRequestTimelineTab.tsx:164,333,489` (review state, event details), `DiffCommentAnnotation.tsx:116` (the send hint, at /70), `TimelineV2EventRow.tsx:115,191,285` (event messages in 10px mono), `ComposerAttachmentStrip.tsx:220,228,651` (fallback labels), `AcpSessionManagementSection.tsx:396,522`, `PullRequestContextDetails.tsx:28`, `BranchPicker.tsx:299` (badge at /45), `ChangedFilesTree.tsx:202,239` (counts, see F-17-05). Measured: changed-files counts 10px at 3.56:1 (DRIFT-22). Interface font size 14 renders these at 8.75px.
- Current: 10px is used for sentences and URLs, not only for counters, and the same sites often stack `/45` to `/70` alpha (F-17-02).
- Proposed: in the listed files change `text-3xs` to `text-2xs` (11px, line-height 16). Keep `text-3xs` only for content of 1-4 characters inside a box of 20px height or less (`ThreadTerminalDrawer.tsx:1350`, `ModelListRow` tag via F-04-32, `UsageLimitsPooled.tsx:69,394,455`, `ProviderInstanceIcon.tsx:118`). Diagnostics overlines are handled in F-07-37/F-17-06.
- DNA: DNA-T1, DNA-T2, DRIFT-22
- Effort: S
- Risk: chips and strips grow 1px per line; check `ComposerAttachmentStrip` tile captions (they sit in fixed tiles) and the timeline row heights in virtualised lists (heights are measured, not fixed).
- Upstream-eligible: yes (none of these files is in #24865)
- #24865: not addressed

### F-17-05 Diff counts render at 10, 11 and 12px, weights 400 and 500, with two different minus glyphs

- Severity: P2
- Surface: all
- Evidence: measured on the Codex edits thread [shot: `screens/baseline/thread-codex-edits-default-light-1440x900.png`]: changed-files card header "+20 -0" 12px/500; its rows "+15 -0" 10px/400; details card "Changes +20 -0" 11px/500; sidebar rows (code-read, `SidebarThreadRow.tsx:1465-1473`) 12px/400 with their own markup and U+2212, while `DiffStatLabel.tsx:43,46` prints ASCII hyphen. Same tree, three sizes: directory names 11 (`ChangedFilesTree.tsx:198`), file names 12 (`:235`), counts 10 (`:202,239`).
- Current: One value type is drawn four ways; the green/red numbers are smallest (10px) exactly where contrast is lowest (3.56:1 light).
- Proposed: `DiffStatLabel.tsx` root group gets `text-2xs font-medium` as its default and prints `−` (U+2212) for deletions; `ChangedFilesTree.tsx:202,239` drop the wrapper `text-3xs`; `DiffPanel.tsx:834` drops `text-2xs` (now default); keep the summary line (`ChangedFilesTree.tsx:66`, `className="text-xs leading-4"`) at 12 because it shares a 12px label; `SidebarThreadRow.tsx:1465` wrapper `font-mono text-2xs font-medium`.
- DNA: DNA-T7, DNA-T8, DNA-T1
- Effort: XS
- Risk: counts get 10% larger in file rows; `grid-cols-[4ch_4ch]` scales with the font so alignment holds; check `DiffStatLabel` aria-label tests (labels are built separately, unaffected).
- Upstream-eligible: yes (`DiffStatLabel.tsx` and `SidebarThreadRow.tsx` are touched by #24865 for colour only; land after it)
- #24865: partial (colour tokens only)

### F-17-06 Overline labels come in seven variants (10-12px, weight 400-600, tracking 0 to 0.18em)

- Severity: P2
- Surface: all
- Evidence: DNA-T10 says `uppercase tracking-widest` at 10-11px. Measured on Diagnostics alone: 10/600/1px, 11/500/1.1px, 11/600/1.1px. Code: `standalone-page.tsx:61` 11/600 `tracking-[0.18em]` (the only arbitrary tracking in the app); `ConnectAgentSurface.tsx:275`, `ConnectCliAuthSurface.tsx:26`, `AuthSurfaceShell.tsx:27` 10/600 widest; `PreviewUnreachable.tsx:85` 12/400 `tracking-wide` at /70; `DiffPanel.tsx:761` 10/500 `tracking-wide`; `ProviderInstanceCard.tsx:930` 10/500 `tracking-wider`; `BrowserImportWizard.tsx:352,370,537` 12/500 `tracking-wide`; `ThemeColorPicker.tsx:182,208` 10/600 widest; `UsageProviderChart.tsx:511` 10 uppercase with no tracking. `index.css:2124` comment and DNA-T10 say chat table headers are uppercase; the rules at `index.css:2153-2159` only set weight 600 (comment drift).
- Current: The one allowed uppercase style has no single definition, so each author picks size, weight and tracking.
- Proposed: one string, `text-2xs font-semibold uppercase tracking-widest text-muted-foreground`, applied at the 13 sites above (keep `text-primary` on the two Connect eyebrows and `text-white/80` in `AuthSurfaceShell`); `UsageProviderChart.tsx:511` adds `tracking-widest`. If the implementer wants a single source, add `@utility text-overline { font-size: var(--text-2xs); line-height: var(--text-2xs--line-height); font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; }` next to the other `@utility` helpers (`index.css` ~L341) and use `text-overline`. Fix the `index.css:2124` comment to say "row separators only".
- DNA: DNA-T10, DNA-T1, DNA-T5
- Effort: S
- Risk: 10px overlines grow to 11px; check Diagnostics table header widths and the Connect pages at 390px.
- Upstream-eligible: yes (none of these files is in #24865)
- #24865: not addressed

### F-17-07 Title Case survives in headings, group labels, command names and status labels of a sentence-case product

- Severity: P2
- Surface: all
- Evidence: Diagnostics `DiagnosticsSettings.tsx:945,959,1007,1077,1165,1190,1220,1249,1314` ("Live Processes", "Child Processes", "Resource History", "Trace Diagnostics", "Latest Failures", "Most Common Failures", "Slowest Spans", "Span Logs", "Top Span Names"); `PullRequestsColumn.tsx:184,214` h1 and `SidebarChrome.tsx:215` "Pull Requests"; palette group "Recent Threads" (`CommandPalette.logic.ts:735`, beside the sentence-case "Actions"); every Keybindings row title ("Chat: New Without Project", "Thread: Jump: 1", 82 rows) via `KeybindingsSettings.logic.ts:361-387`, whose own special cases mix styles ("Composer: Start in Background" vs "Composer: Send and Start New Thread"); nav labels "Scheduled Tasks", "Source Control" (`settingsSearch.ts:87-88`, F-07-09); status labels "Pending Approval", "Awaiting Input", "Guest Request" (`Sidebar.logic.ts:579-581,1076-1094`, DRIFT-11); shell strings F-01-26. Measured Keybindings page: 82 `h3` row titles, all Title Case.
- Current: The body copy, buttons and settings rows are sentence case (DNA-V); these twenty-odd labels are not.
- Proposed: sentence case at the listed sites. `titleCaseCommandSegment` (`KeybindingsSettings.logic.ts:379`) becomes `sentenceCaseCommandSegment`: capitalise only the first word of the first segment and lower-case the rest of the words (`Chat: new without project`); update the hard-coded labels at `:361-368` and keep "Preview: Focus URL" with acronyms preserved ("Preview: focus URL"); `settingsSearch.ts:87-88` to "Scheduled tasks", "Source control"; status labels to "Pending approval", "Awaiting input", "Guest request"; `DiagnosticsSettings.tsx` titles and `CommandPalette.logic.ts:735` to sentence case; `SidebarChrome.tsx:215` and `PullRequestsColumn.tsx:184,214` to "Pull requests". Keep proper nouns ("Open VSX").
- DNA: DNA-T10, DNA-V rules (sentence case), DRIFT-11
- Effort: S
- Risk: settings search indexes labels (case-insensitive; verify `settingsSearch` tests); `Sidebar.logic.ts` status labels are string-literal union types, so the rename is one file (union, rank map and labels in `Sidebar.logic.ts`); no test asserts the Title Case strings (grepped).
- Upstream-eligible: yes, split in two (Diagnostics + palette + keybindings; sidebar status labels with F-07-09)
- #24865: not addressed

### F-17-08 Dialog titles use `leading-none`, so a wrapped title is set solid

- Severity: P2
- Surface: all
- Evidence: `dialog.tsx:172`, `alert-dialog.tsx:113`, `sheet.tsx:145` (`font-semibold text-xl leading-none`, `wrap-anywhere`). Measured: line-height 20px on 20px type. With a confirm title such as `Delete thread "<title>"?` (the host builds titles from user titles, DRIFT-13) three lines pitch at 20px and descenders touch the next line's ascenders [shot: `screens/17/17-dialog-title-leading-light-1440x900.png`, synthetic title, left current, right `leading-tight`].
- Current: Single-line titles are fine; multi-line titles look cramped.
- Proposed: replace `leading-none` with `leading-tight` (1.25 = 25px) at the three sites. A single-line title box grows from 20 to 25px; check the `DialogHeader` spacing after the change.
- DNA: DNA-T6 (line height comes with the size)
- Effort: XS
- Risk: 5px taller dialog headers; check `AlertDialog` fixed-height layouts and the `Sheet` header at 390px.
- Upstream-eligible: yes
- #24865: not addressed

### F-17-09 Three px-sized text sites ignore the Interface font size setting; the details card gets smaller than its neighbours at 20px

- Severity: P2
- Surface: all
- Evidence: measured by setting `html` font-size to 12, 16, 20px: details-card rows stay 13px at all three (`threadDetailsPanelStyles.ts:18,29`, `text-[13px]`) while `text-xs` sidebar labels go 9, 12, 15px (measured) and `text-sm` 10.5, 14, 17.5px (derived from 0.875rem). At 20px the card's primary labels (13) are smaller than the sidebar metadata (15). Other px sites: `text-[11px]` at `button.tsx:32`, `tooltip.tsx:145`, `alert.tsx:20`, `standalone-page.tsx:61`. #24865 adds a third `text-[13px]` (`collapsible-section-header.tsx` `row` variant). Monogram 8.25px is the documented exception.
- Current: Everything else scales with the setting (DNA-T4); the signature card and four small labels do not.
- Proposed: `text-[13px]` to `text-[0.8125rem]` at `threadDetailsPanelStyles.ts:18,29` and in the PR's `collapsible-section-header.tsx` row variant; `text-[11px]` to `text-2xs` at the four other sites (`button.tsx:32` also drops the redundant `sm:text-[11px]`).
- DNA: DNA-T4, DRIFT-6
- Effort: XS
- Risk: none at the default 16px (identical rendering); `components/ui` edits obey `shadcn/no-restyle` because they are the primitives themselves.
- Upstream-eligible: yes (the `collapsible-section-header.tsx` part only after #24865 lands)
- #24865: not addressed (adds one more px site)

### F-17-10 File names and paths are end-truncated at seven sites, hiding the part that identifies them

- Severity: P3
- Surface: all
- Evidence: code-read: `TimelineUserMessageRow.tsx:530` (attachment `file.name`), `GuestMessageAttachments.tsx:69`, `GuestPage.tsx:694`, `composerContextPresentation.tsx:282` (`comment.filePath`), `PullRequestCodeTab.tsx:1374`, `PullRequestTimelineTab.tsx:236,595`, `AddProjectToMachineDialog.tsx:425`, `CommandPaletteProjectItems.tsx:114` (F-01-14). Eighteen other files already use `MiddleTruncate` or `StartTruncatedPath`. Live check: 500-character and unbroken 200-character titles truncate cleanly with an ellipsis in the header and sidebar [shot: `screens/17/17-long-title-header-sidebar-light-1440x900.png`].
- Current: A screenshot named `Screenshot 2026-10-25 at 14.32.11.png` shows as `Screenshot 2026-10-25 at 14.3...`; paths lose the filename.
- Proposed: wrap names in `<MiddleTruncate value={...} />` (`ui/middle-truncate.tsx`; default tail keeps a final path segment up to 16 chars, so extensions survive) at the file-name sites; use `<StartTruncatedPath path={...} />` for the full-path sites (`PullRequestCodeTab.tsx:1374`, `PullRequestTimelineTab.tsx:236,595`, `composerContextPresentation.tsx:282`).
- DNA: DNA-T9
- Effort: S
- Risk: `StartTruncatedPath` uses `dir="rtl"` plus `bdi`; check punctuation at path ends. `MiddleTruncate` adds a native `title` unless `showTitle={false}`.
- Upstream-eligible: yes
- #24865: not addressed (the PR rewrites `middle-truncate.tsx`, so build on its version)

### F-17-11 Shortcut labels are letter-spaced 0.1em, so Windows and Linux strings spread out

- Severity: P3
- Surface: web, desktop (Windows, Linux)
- Evidence: `menu.tsx:292` and `command.tsx:203` use `text-xs font-medium tracking-widest`; measured palette shortcut 12/500 with 1.2px tracking. The tracking suits one-glyph macOS symbols (`⇧⌘N`); with text labels `Ctrl+Shift+N` is 87px wide against 73px without it (+19%) [shot: `screens/17/17-palette-shortcut-tracking-light-1440x900.png`, label text replaced by DOM edit to show the non-mac form]. `Kbd` (`kbd.tsx:9`) has no tracking, so the same shortcut renders two ways.
- Current: DNA-T10 reserves `tracking-widest` for overlines.
- Proposed: drop `tracking-widest` from both classes (`formatShortcutLabel`, `keybindings.ts:219-241`, returns glyph clusters on macOS and `Ctrl+Shift+N` elsewhere; glyphs carry their own side bearings).
- DNA: DNA-T10
- Effort: XS
- Risk: macOS glyph clusters tighten slightly; compare `⌥⇧⌘A` before and after.
- Upstream-eligible: yes
- #24865: not addressed

### F-17-12 The compact Empty variant uses two off-ladder sizes (17px title, 13px description)

- Severity: P3
- Surface: web, desktop
- Evidence: `ui/empty.tsx:7` (`text-[1.0625rem]` with `leading-6`, `text-[0.8125rem]` with `leading-[1.125rem]`); default size is `text-xl` and `text-sm` (`empty.tsx:92,100`). Users: `PullRequestDiffUnavailableState.tsx:30`, Clerk profile pages (`MobileClientsUserProfilePage.tsx:90`, `T3ConnectUserProfilePage.tsx:237`). DRIFT-6.
- Current: Two sizes exist for one slot, neither on the DNA ladder.
- Proposed: compact title `text-base` + `leading-6`, description `text-sm` + `leading-5`.
- DNA: DNA-T1, DRIFT-6, DRIFT-7
- Effort: XS
- Risk: compact empties get 1px smaller title and 1px larger description; visual only.
- Upstream-eligible: yes
- #24865: not addressed

### F-17-13 `text-balance` and `text-pretty` cover about a dozen elements; dialog, sheet and alert descriptions leave short orphans

- Severity: P3
- Surface: all
- Evidence: 5 `text-balance` and 7 `text-pretty` uses in 792 files; `dialog.tsx:182`, `alert-dialog.tsx:124`, `sheet.tsx:155`, `alert.tsx` description and toast descriptions (`toast.tsx:644,737`) have neither. #24865 adds `text-balance` to settings descriptions only. Code-read.
- Current: Two-line descriptions can end on a single word.
- Proposed: add `text-pretty` to `DialogDescription` (`dialog.tsx:182`), `AlertDialogDescription` (`alert-dialog.tsx:124`), `SheetDescription` (`sheet.tsx:155`) and the alert description slot; `text-pretty` is cheap (no layout cost for short text).
- DNA: DNA-T9
- Effort: XS
- Risk: negligible.
- Upstream-eligible: yes
- #24865: partial (settings descriptions only)

### F-17-14 Thread titles switch between weight 400 and 500 with read state, so the truncation point moves

- Severity: P3
- Surface: web, desktop
- Evidence: `SidebarThreadRow.tsx:971-972` (`shouldRecede ? "font-normal" : "font-medium"`), measured 14px SF: the 44-character string "Fix truncated titles in the palette and more" is 273px at 400 and 279px at 500 (+2.3%). A title at the edge of the 219px column gains or loses about one character when it is read or unread.
- Current: Read state is encoded three times: weight, colour (#24865 adds 75%) and a brighten on hover.
- Proposed: if the owner's 75% read title stays (it does), render all titles at `font-medium` and let colour alone carry read state, removing the weight flip at `:971-972` and `:1637-1638` (compact variant). If the maintainers prefer the lighter read look, leave as is; this is the cheapest of the P3s to decline.
- DNA: DNA-T5 (weight carries hierarchy), DNA-D
- Effort: XS
- Risk: read titles look heavier in the list; a visual call, and `SidebarThreadRow.tsx` is a file #24865 edits (rebase).
- Upstream-eligible: no (file in #24865; propose as a follow-up)
- #24865: not addressed (keeps weight flip)

## Edge-case results (matrix)

| Row                                                                 | Result                                                                                                                                  |
| ------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Data: empty / one / 100+ items                                      | PASS (127 sidebar rows: styles identical per role; census)                                                                              |
| Data: 10,000+ items                                                 | N/A (no type behaviour; virtualisation is area 02)                                                                                      |
| Data: very long names (200 / 500 chars)                             | PASS (single-line ellipsis in header and sidebar; F-17-10 for file names)                                                               |
| Data: unicode, emoji, CJK, RTL                                      | PASS (sidebar title line boxes stay 20px, rows stay 82px; RTL titles set `dir=rtl`)                                                     |
| Data: leading/trailing/only whitespace                              | NOT TESTED here (F-01-23 covers blank titles)                                                                                           |
| Content: tables, code, nested code, links                           | PARTIAL: code 13 / inline 12 / prose 14 measured; tables code-read (12px body, F-03-06, F-03-21); links F-03-19                         |
| Content: very long unbroken strings                                 | PASS in titles (200-char camel/snake); message body code-read (`overflow-wrap:anywhere`)                                                |
| Viewport 1440x900                                                   | PASS (all measurements)                                                                                                                 |
| Viewport 1280x720 to 800x600, 390                                   | NOT TESTED for type (layout areas 01/15); touch pattern `text-base sm:text-sm` code-read                                                |
| Zoom: OS 80/125/150, browser 50/200                                 | NOT TESTED (needs real display scaling)                                                                                                 |
| Preferences: light                                                  | PASS (all census)                                                                                                                       |
| Preferences: dark, named themes                                     | NOT TESTED for type (metrics are theme-independent; colours are area 16)                                                                |
| Preferences: font size overrides                                    | PASS for Interface size 12/16/20 emulated on `html` (F-17-09); Prompt, Code, Terminal sizes code-read only (`appearanceFonts.ts:90-95`) |
| Preferences: reduced motion, high contrast, keyboard, screen reader | N/A for type except heading outline (F-17-03)                                                                                           |
| Lifecycle / network / git rows                                      | N/A                                                                                                                                     |

## Already good (do not touch)

- Size and weight ladder: 95% of rendered text is 12 or 14px at 400/500; `font-bold` appears twice; weights 400/500/600 only in chrome.
- Top-bar titles are one style (14/500/20) across thread, Usage and Pull requests.
- Settings row: 14/500 title over 12/400 muted description; #24865 raises the description to full muted and balances wrapping.
- Numerals: `tabular-nums` is present on every live number checked (9 views: times, counts, durations, usage); the single miss is Diagnostics "0 ms" (F-07-37 file).
- Mono is used for machine values (paths, hashes, ids, counts, versions) across 167 uses; Kbd stays sans.
- Truncation: single-line ellipsis for 500-char titles; `MiddleTruncate` and `StartTruncatedPath` cover 18 component files.
- Draft hero (30/400/-0.75px) is a distinct display style and gives the first screen one clear focal point.
- Touch pattern (`text-base sm:text-sm`) keeps content size and scales controls only.
- Palette: 12/500 group labels over 14px items, inline project name at 600.

## Resolved or reduced by #24865 (no new finding)

Inter on Windows/Linux (`index.css`, `appearanceFonts.ts`, `main.tsx` import; macOS keeps SF because `-apple-system` precedes it in the stack); settings group titles 16/600 (`settingsLayout.tsx:249`); scope sentence 16 to 14 (`SettingsScopeSentence.tsx`); description colour 80% to 100%; chat prose 80% to 90%; composer placeholder `/75` removed; inline code `0.85em`; project name weight in thread rows; read titles 75%; `text-muted-foreground/40` removed from worktree and machine labels in rows; diff text tokens darker.

## Incomplete

- Windows and Linux rendering of Inter was not observed (Electron not run, macOS host). Unverified: the first paint uses the boot stylesheet font (`index.html` still lists `"Inter Variable"` before the `@font-face` CSS from `main.tsx` loads), so a Segoe UI to Inter swap and a small reflow may show on first launch; `font-display: swap` and fallback metrics (`size-adjust`) were not checked.
- Dark scheme and named themes were not census-measured; only light.
- Diff, Files and terminal panes (Pierre diff font, terminal font size) were not opened, so their type is from `index.css:1724-1738` only.
- Interface font size was emulated by setting `html` font-size inline, not through the Settings control.
- No new screenshot of Diagnostics or any process list was saved (it can show local paths); `screens/17` holds three synthetic or fixture-only captures and no sidebar capture shows account data.
- Mobile (DM Sans, `text-xs` 13px, DRIFT-23) belongs to area 15.

## Needs deeper look

- Chat measure: default lane 728px at 14px gives about 105 characters per line (measured lines up to 725px); `wide` (72rem) roughly 160. Is a `max-width: 80ch` on `.chat-markdown p, li` wanted for `wide` and `full`? Product call, conflicts risk with the chat width setting.
- Prompt font size and family (`--font-size-prompt`, `--font-composer`) apply only to the composer editor (`ComposerPromptEditorTiptap.tsx:1792`); the sent message renders at 14px sans. Intended? If not, a one-line change in `TimelineUserMessageRow`.
- Interface font size minimum of 12px leaves `text-xs` at 9px and `text-3xs` at 7.5px; raising `MIN_INTERFACE_FONT_SIZE` to 13 needs a contracts migration and interacts with F-07-13 (out-of-range saved values lock the app), so it is a dependency, not a UI fix.
- Windows and Linux first-paint font swap (see Incomplete): needs one run on those hosts, including `font-display` and `size-adjust` on the Inter `@font-face`.
