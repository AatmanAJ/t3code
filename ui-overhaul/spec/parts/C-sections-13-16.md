## 13. PR plan

Plan for Phase 2: **240 chunks in 11 tracks** covering every one of the 118 P1 and 318 P2 findings exactly once (severities after the follow-up sweep, see 13.1; area 22 included) plus 40 P3 findings that ride along; 164 P3 are deferred (13.15). Each chunk is one branch and one PR-sized change on the fork; "upstream" says whether it can also go to `pingdotgg/t3code` under CONTRIBUTING.md. Nothing here is posted or opened in Phase 1.

### 13.1 How to read a card

| Field    | Meaning                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Id       | `T#` Tokens, `H#` Hierarchy, `P-<area>-<n>` Polish-by-area (area = audit number), `S-<n>` States, `E-<n>` Edge cases, `C-<n>` Customisation, `O-<n>` Onboarding, `M-<n>` Mobile, `A-<n>` A11y, `MO-<n>` Motion, `CP-<n>` Copy                                                                                                                                                                                                                                                                                                                                                                        |
| Findings | Ids covered. `(P1)` marks a P1, `(P3)` a P3 riding along; unmarked = P2. The audit file's **Proposed** text is normative; Accept is a one-line summary of it                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| Lines    | Estimate: per finding XS 15, S 55, M 160, L 420 (tests and docs included), summed and rounded to 5; adjusted by hand where the audit effort clearly misjudges the work (codemods, new tests, new components) (22 chunks, marked "adjusted" on the card). Hard cap 800: the largest chunks are about 420 (P-05-5, P-13-1, E-4, A-15, CP-8) lines. Upstream candidates should stay under 300                                                                                                                                                                                                           |
| Wave     | 0 = independent of #24865 and of other chunks, can start on current main. 1 = touches #24865 files or needs it first. 2 = needs a wave-1 chunk. 3 = needs a wave-2 chunk                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Files    | From the finding's Evidence and Proposed text (first three cited files per finding when Proposed names none). Paths are relative to `apps/web/src/` unless prefixed `mobile:` (`apps/mobile/`), `desktop:`, `server:` (`apps/server/src/`), `pkg:` (`packages/`). Treat as a starting point: confirm with `git grep` before editing                                                                                                                                                                                                                                                                  |
| Before   | Baseline files in `ui-overhaul/screens/baseline/` named `<label>-<theme>-<scheme>-<WxH>.png` (`{dark,light}` expands to both; see `MANIFEST.md`), plus images the finding cites in `ui-overhaul/screens/<area>/`. Code-read findings have none: add a `states.json` label first                                                                                                                                                                                                                                                                                                                      |
| After    | Standard set, then extras named on the card. **Standard set:** (1) re-run `/tmp/t3code-pw/capture.mjs --out ui-overhaul/screens/<chunk-id> --only <label>` with identical label, viewport, scheme and theme (`screens/capture.md`); (2) light and dark; (3) re-measure each number the finding cites with the method it used (axe, `getComputedStyle`, CDP tree); (4) one named-theme spot check (Ember or Grove, 1440x900) for colour and token chunks; (5) pair before/after by file name in the PR body, upload to GitHub, push to the fork branch `ui-overhaul/assets`, never into a code branch |
| Tests    | `vp test run <files>` = existing tests found beside the cited files; `vp lint <files>` = the Files listed (first four shown, full paths); typecheck by package filter. "new:" = the failing-first test AGENTS.md asks for on logic, data and state bugs. Visual-only fixes ship captures and no test. Run `vp run check:changed` before pushing; never repo-wide checks                                                                                                                                                                                                                              |
| Model    | Opus low up to 150 estimated lines; Opus medium above that or where the card says so (server, cross-package, subtle behaviour); Haiku only for pure mechanical rewrites (codemods, string renames). Never Opus high, never Fable                                                                                                                                                                                                                                                                                                                                                                     |
| Upstream | yes (one problem, fix-shaped, no #24865 conflict) / yes after #24865 merges / no (reason) / bundle (fork PR, the stated number of carve-out PRs can go upstream one problem each). `fix(...)` titles only; features and defaults wait for an Ideas post (section 14)                                                                                                                                                                                                                                                                                                                                 |
| #24865   | independent / rebase after merge (names the overlapping files from `pr-24865.diff`, 55 files) / partial / conflicts. File overlap is a prompt to re-check, not proof of a conflicting hunk                                                                                                                                                                                                                                                                                                                                                                                                           |

**Severity changes applied from `_FOLLOWUPS.md` Summary:** F-03-15 P2 to P1 (S-15; server-only cause); F-02-18 P2 to P3 (P-02-1; label rewritten around `backgroundWorkHoldsCompletion`); F-23-04 merged into F-01-01 (P-01-1 closes both and F-01-07); F-21-13 stays P2 in P-21-8 and becomes P1 if the Cmd+Q probe reproduces. Net: P1 118, P2 318, P3 204 (the index lists 116 / 316 / 200 for 632 findings; area 22 adds 1 / 4 / 3, total 640).

### 13.2 Ordering waves

| Wave | Rule                                                               | Chunks |
| ---- | ------------------------------------------------------------------ | -----: |
| 0    | independent of #24865 and of other chunks: start on current `main` |     94 |
| 1    | needs #24865 merged (touches its files or tokens)                  |    110 |
| 2    | needs a wave-1 chunk first                                         |     28 |
| 3    | needs a wave-2 chunk first                                         |      8 |

Wave 2 chunks: T5, T7, T8, H3, H4, P-05-5, P-11-3, P-22-1, S-2, S-23, S-24, C-7, C-8, C-11, O-10, O-11, O-16, O-17, M-7, A-2, A-6, A-7, MO-3, MO-6, MO-8, CP-3, CP-8, CP-10.
Wave 3 chunks: T9, S-16, S-17, S-18, S-19, S-20, S-21, MO-9.
Decision-gated: CP-1 (D1; O-16 and O-17 reuse its word), CP-4 (D3), CP-6 (D2), MO-1 and MO-5 liveness wording (D-M1), A-22 (owner calls). See section 15.

### 13.3 Provisional ids from part B, replaced

Part B section 12 labelled chunks with `A##` (audit area) and `§N` (section). Replacement rule: `A##` becomes the chunks below; the per-PR table gives the exact chunk for every ADOPT and BORROW row (SKIP rows have no chunk). Part B text itself is unchanged and needs the rename pass.

| Part B label                                                  | Chunks holding that area's findings                                                                                       |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------- |
| A01 Shell                                                     | P-01-1, P-01-2, P-01-3, P-01-4, P-01-5, P-01-6, P-01-7, P-21-2, E-1, E-2, C-1, C-2, A-5, A-17, MO-1                       |
| A02 Thread list                                               | T0, T8, H7, P-02-1, P-02-2, P-02-3, P-02-4, P-21-4, S-3, E-3, E-4, M-1, A-2, A-10, A-11                                   |
| A03 Thread view                                               | T0, T7, T10, H4, H8, P-03-1, P-03-2, P-03-3, P-03-4, S-4, S-5, S-6, S-13, S-14, S-15, E-5, E-6, E-7, M-2, A-3, MO-5       |
| A04 Composer                                                  | T0, T7, T10, P-04-1, P-04-2, P-04-3, P-04-4, P-04-5, P-04-6, P-04-7, E-2, C-5, M-4, M-7, MO-4                             |
| A05 Diff                                                      | T10, H3, H4, P-05-1, P-05-2, P-05-3, P-05-4, P-05-5, S-16, S-21, S-23, E-8, E-9, E-10, E-11, A-18, MO-5                   |
| A06 Terminal                                                  | P-06-1, P-06-2, P-06-3, P-06-4, P-06-5, P-06-6, P-21-5, S-20, E-11, M-6, A-12, A-14, A-17                                 |
| A09 Providers                                                 | T6, T10, P-08-1, P-09-1, P-09-2, P-09-3, P-09-4, P-09-5, S-9, S-10, S-17, S-24, E-14, O-4, O-5, M-2, M-3, A-3, A-19, M-17 |
| A11 Remote                                                    | P-11-1, P-11-2, P-11-3, P-11-4, P-11-5, S-19, S-31, S-32, S-33, M-2, CP-1                                                 |
| A13 Loading                                                   | P-09-2, P-13-1, P-13-2, S-24, S-25, S-26, S-27, S-28, S-29, S-30, S-31, MO-5, MO-6                                        |
| A14 Desktop                                                   | P-14-1, P-14-2, P-14-3, P-14-4, P-14-5, P-14-6, P-14-7, P-14-8, P-14-9                                                    |
| A15 Mobile                                                    | M-9, M-10, M-11, M-12, M-13, M-14, M-15, M-16, A-21, MO-7                                                                 |
| A17 Type                                                      | T9, H1, H2, H3, H4, H5, H6, CP-6                                                                                          |
| A18 Shape                                                     | T1, T2, T3, T5, M-8                                                                                                       |
| Settings §7 (appearance and project fixes, not customisation) | P-07-1..5, P-08-1..9 (exact id per PR in the next table)                                                                  |
| Onboarding §8                                                 | O-1..O-17                                                                                                                 |
| Motion §9                                                     | MO-1..MO-9, S-26, S-29 (loading motion)                                                                                   |
| Toasts §10                                                    | S-1, S-3, S-4, S-8, S-9, S-12, CP-9, CP-10                                                                                |
| Copy §10                                                      | CP-1..CP-10, plus the copy rows inside S-* and P-*                                                                        |
| A11y §11                                                      | A-1..A-22                                                                                                                 |

Per-PR mapping (credit sentences are pasted from the `PRS.md` ledger; 69 ADOPT and BORROW rows, 16 SKIP rows omitted):

| PR     | Grade  | Part B label (provisional) | Real chunk |
| ------ | ------ | -------------------------- | ---------- |
| #22605 | ADOPT  | P-01-5                     | P-01-5     |
| #24438 | ADOPT  | H7                         | H7         |
| #23573 | ADOPT  | H8                         | H8         |
| #22436 | ADOPT  | P-21-10                    | P-21-10    |
| #22771 | ADOPT  | E-15                       | E-15       |
| #23166 | ADOPT  | P-04-4                     | P-04-4     |
| #24312 | ADOPT  | P-04-5                     | P-04-5     |
| #23893 | ADOPT  | P-05-3                     | P-05-3     |
| #24042 | ADOPT  | P-06-4                     | P-06-4     |
| #22348 | ADOPT  | P-07-4                     | P-07-4     |
| #22795 | ADOPT  | P-07-5                     | P-07-5     |
| #23136 | ADOPT  | P-07-4                     | P-07-4     |
| #23640 | ADOPT  | P-08-8                     | P-08-8     |
| #23348 | ADOPT  | MO-7                       | MO-7       |
| #23740 | ADOPT  | A-21                       | A-21       |
| #22100 | ADOPT  | MO-5                       | MO-5       |
| #23666 | BORROW | A-10                       | A-10       |
| #23956 | BORROW | P-14-5                     | P-14-5     |
| #21878 | BORROW | H8                         | H8         |
| #22367 | BORROW | H8                         | H8         |
| #22385 | BORROW | P-03-4                     | P-03-4     |
| #23590 | BORROW | S-5                        | S-5        |
| #24084 | BORROW | H8                         | H8         |
| #22236 | BORROW | S-7                        | S-7        |
| #22843 | BORROW | M-13                       | M-13       |
| #22974 | BORROW | S-7                        | S-7        |
| #23280 | BORROW | P-04-5                     | P-04-5     |
| #24283 | BORROW | P-09-5                     | P-09-5     |
| #24331 | BORROW | A-9                        | A-9        |
| #24684 | BORROW | S-7                        | S-7        |
| #24773 | BORROW | S-7                        | S-7        |
| #22778 | BORROW | T10                        | T10        |
| #24189 | BORROW | E-11                       | E-11       |
| #20003 | BORROW | P-08-1                     | P-08-1     |
| #24381 | BORROW | O-7                        | O-7        |
| #24719 | BORROW | O-6                        | O-6        |
| #23194 | BORROW | S-31                       | S-31       |
| #23679 | BORROW | S-4                        | S-4        |
| #23753 | BORROW | S-8                        | S-8        |
| #24260 | BORROW | S-8                        | S-8        |
| #24313 | BORROW | S-8                        | S-8        |
| #23392 | BORROW | P-14-2                     | P-14-2     |
| #23141 | BORROW | P-14-9                     | P-14-9     |
| #24581 | BORROW | P-14-4                     | P-14-4     |
| #20144 | BORROW | M-9                        | M-9        |
| #21383 | BORROW | M-14                       | M-14       |
| #21548 | BORROW | M-11                       | M-11       |
| #21691 | BORROW | M-13                       | M-13       |
| #21757 | BORROW | MO-7                       | MO-7       |
| #22417 | BORROW | M-11                       | M-11       |
| #22418 | BORROW | M-11                       | M-11       |
| #22420 | BORROW | M-11                       | M-11       |
| #22550 | BORROW | M-11                       | M-11       |
| #22568 | BORROW | M-14                       | M-14       |
| #22742 | BORROW | M-9                        | M-9        |
| #23155 | BORROW | M-13                       | M-13       |
| #23401 | BORROW | M-14                       | M-14       |
| #23688 | BORROW | M-14                       | M-14       |
| #23797 | BORROW | M-11                       | M-11       |
| #23888 | BORROW | MO-7                       | MO-7       |
| #24385 | BORROW | S-19                       | S-19       |
| #24484 | BORROW | M-13                       | M-13       |
| #24541 | BORROW | M-9                        | M-9        |
| #24209 | BORROW | A-5                        | A-5        |
| #24567 | BORROW | H8                         | H8         |
| #22287 | BORROW | T2                         | T2         |
| #22906 | BORROW | T2                         | T2         |
| #24147 | BORROW | S-9                        | S-9        |
| #24148 | BORROW | CP-6                       | CP-6       |

### 13.4 Tokens (13 chunks)

Global token, utility and lint-rule work that other chunks consume. Additive only: no new library, no gradient, glow or bounce, no change to the canvas, switch accent, three-line rows or composer model colour.

##### T0 Verify what #24865 already fixes (no code)

- Findings: F-02-02 (P1), F-02-03 (P1), F-03-41, F-04-01 (P1), F-04-03, F-04-20, F-10-08 (P1) · ~0 lines (no code) · wave 1 · depends on: #24865
- Files: none (no code)
- Before: `home-default-{dark,light}-1440x900.png`, `new-thread-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `02-thread-list-top-light-1440x900.png`, `02-thread-list-bottom-shelves-light-1440x900.png` (+4) · After: `screens/T0/` same names
- Accept: On the merged build each finding passes its audited measure (>=4.5:1 where a ratio is cited; one composer placeholder per state); anything still failing is re-filed under its own id.
- Tests: none (no code)
- Model: Opus low · risk: low - None functional · upstream: no: verification only, no diff · #24865: addressed by #24865: capture-and-compare only
- Note: Also: link the "Compact next" pill tooltip to Settings > General > Compact idle threads (the #17170 off switch already exists).

##### T1 `hit-area` utility and 24 px fine-pointer floor

- Findings: F-18-01 (P1), F-18-04, F-16-14 · ~180 lines (adjusted from 85) · wave 1 · depends on: #24865
- Files: `components/ui/button.tsx`, `components/chat/ChangedFilesTree.tsx`, `components/chat/ChatComposer.tsx`, `components/chat/ChatHeader.tsx`, `components/chat/MessagesTimeline.tsx`, `components/settings/SettingsScopeSentence.tsx` (+3)
- Before: `settings-appearance-default-{dark,light}-{1440x900,390x844}.png`, `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/T1/` same names
- Accept: `@utility hit-area` exists beside `surface-glass`; Switch, crumbs, fold toggle, scope triggers and `micro` buttons measure >=24x24 (fine) and >=44x44 (coarse) with unchanged visual size.
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts` · `vp lint apps/web/src/components/ui/button.tsx apps/web/src/components/chat/ChangedFilesTree.tsx apps/web/src/components/chat/ChatComposer.tsx apps/web/src/components/chat/ChatHeader.tsx ...` · `vp run --filter @t3tools/web typecheck` · new: browser test: Switch hit area >= 44 px under `pointer: coarse`
- Model: Opus medium · risk: med - `::after` captures taps over adjacent controls in dense rows (crumb next to toggle) · upstream: yes, after #24865 merges · #24865: rebase after merge: button.tsx, ChatComposer.tsx, MessagesTimeline.tsx

##### T2 Derive `--control-radius` from the radius ladder; sidebar family on one rung

- Findings: F-18-03, F-18-06 (P3) · ~30 lines · wave 1 · depends on: #24865
- Files: `index.css`, `components/Sidebar.tsx`, `components/guest/GuestPage.tsx`, `components/settings/SettingsSidebarNav.tsx`, `components/sidebar/SidebarDraftBlock.tsx`, `components/sidebar/SidebarThreadHeader.tsx` (+2)
- Before: `home-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/T2/` same names
- Accept: `--control-radius` is `var(--radius-lg)`; sidebar rows, search, settings nav and drafts share one radius; no `rounded-3xl` remains (GuestPage).
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts apps/web/src/components/guest/GuestPage.browser.test.tsx` · `vp lint apps/web/src/index.css apps/web/src/components/Sidebar.tsx apps/web/src/components/guest/GuestPage.tsx apps/web/src/components/settings/SettingsSidebarNav.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - row hover corner against the 2 px list gutter · upstream: yes, after #24865 merges · #24865: rebase after merge: index.css, Sidebar.tsx, SettingsSidebarNav.tsx

##### T3 Three-level shadow ladder (`--shadow-lift/popup/dialog`)

- Findings: F-18-02, F-12-25 (P3) · ~200 lines (adjusted from 70) · wave 1 · depends on: none
- Files: `components/ui/menu.tsx`, `components/ui/popover.tsx`, `components/ui/toast.tsx`, `components/AppRouteModal.tsx`, `components/chat/ExpandedImageDialog.tsx`, `components/chat/HtmlRenderDialog.tsx` (+9)
- Before: `command-palette-default-{dark,light}-1440x900.png`, `home-default-{dark,light}-1440x900.png`, `settings-appearance-default-{dark,light}-1440x900.png`; cited `18-toast-shadow-light-420x220@2x.png`, `18-menu-shadow-light-420x240@2x.png` (+1) · After: `screens/T3/` same names
- Accept: Menu, popover, combobox, dialog, route modal, toast and tooltip draw from three tokens in light and dark; 45 shadow strings become 3 plus the composer token.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/menu.tsx apps/web/src/components/ui/popover.tsx apps/web/src/components/ui/toast.tsx apps/web/src/components/AppRouteModal.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - toast and minimap lose their halo (check on light canvas) · upstream: yes, after #24865 merges · #24865: rebase after merge: menu.tsx, TimelineMinimap.tsx, select.tsx

##### T4 `--destructive-solid` fill for destructive buttons

- Findings: F-12-04 (P1) · ~60 lines (adjusted from 15) · wave 1 · depends on: #24865
- Files: `components/ui/button.tsx`, `index.css`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/T4/` same names
- Accept: White on destructive fill measures >=4.5:1 in light and dark; icons and borders keep `--destructive`.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/button.tsx apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - every destructive Button changes shade slightly (visible in snapshots · upstream: yes, after #24865 merges · #24865: rebase after merge: button.tsx, index.css

##### T5 Border alpha: four roles, codemod `/70`->`/60`, `/45 /40`->`/50`

- Findings: F-18-07 (P3) · ~120 lines (adjusted from 55) · wave 2 · depends on: #24865, T3
- Files: all `border-border/(70|45|40)` matches under `components/**` (103 sites), `index.css`
- Before: `home-default-{dark,light}-1440x900.png`, `settings-general-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/T5/` same names
- Accept: Only bare, `/80`, `/60`, `/50` border alphas remain; pixel diff of sampled screens shows no visible shift beyond 1 level.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/ComposerAttachmentStrip.tsx apps/web/src/components/chat/ExpandedImageDialog.tsx apps/web/src/components/chat/TimelineUserMessageRow.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: low · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)
- Note: Mechanical codemod over about 103 sites.

##### T6 Muted-alpha lint rule (warn) and codemod: settings directory

- Findings: F-16-06 (P1), F-16-09, F-09-11, F-09-23, F-08-30 · ~220 lines · wave 1 · depends on: #24865
- Files: `oxlint-plugin-t3code` (new rule), every `text-muted-foreground/NN` under `components/settings/`
- Before: `settings-general-default-{dark,light}-1440x900.png`, `settings-providers-default-{dark,light}-1440x900.png`, `settings-appearance-default-{dark,light}-1440x900.png`, `settings-keybindings-default-{dark,light}-1440x900.png`; cited `09-providers-instance-disabled-light-1440x900.png` · After: `screens/T6/` same names
- Accept: `t3code/no-text-opacity-on-muted` ships at warn; zero `text-muted-foreground/NN` in `components/settings/`; measured settings labels >=4.5:1.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/components/settings/ProviderInstanceCard.test.ts` · `vp lint apps/web/src/components/settings/KeybindingsSettings.tsx apps/web/src/components/settings/ProviderInstanceCard.tsx apps/web/src/components/settings/ProviderModelsSection.tsx apps/web/src/components/ui/sidebar.tsx` · `vp run --filter @t3tools/web typecheck` · new: oxlint rule unit test (fail case, pass case, `components/ui` exempt)
- Model: Opus medium · risk: med - UI gets slightly louder · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### T7 Muted-alpha codemod: chat directory

- Findings: F-04-21 (P1), F-03-25, F-04-31 · ~130 lines (adjusted from 45) · wave 2 · depends on: T6, #24865
- Files: every `text-muted-foreground/NN` and `text-foreground/NN` under `components/chat/`
- Before: `new-thread-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`, `thread-claude-markdown-default-{dark,light}-1440x900.png`; cited `04-composer-resting-zoom-light-1440x900@2x.png` · After: `screens/T7/` same names
- Accept: Composer footer, strip, model picker, effort menu, banners and timeline chrome use bare tier tokens; composer footer text measures >=4.5:1 light and dark.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/BranchToolbarEnvModeSelector.tsx apps/web/src/components/BranchToolbarEnvironmentSelector.tsx apps/web/src/components/chat/ChatComposer.tsx apps/web/src/components/chat/ModelListRow.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - None functional · upstream: yes, after #24865 merges · #24865: rebase after merge: ChatComposer.tsx, TraitsPicker.tsx

##### T8 Muted-alpha codemod: sidebar, pull requests, usage

- Findings: F-02-01 (P1) · ~90 lines (adjusted from 15) · wave 2 · depends on: T6, #24865
- Files: matches under `components/sidebar/`, `components/pullRequest/`, `components/usage/`, `Sidebar.tsx`
- Before: `home-default-{dark,light}-1440x900.png`, `pull-requests-default-{dark,light}-1440x900.png`, `usage-default-{dark,light}-1440x900.png`; cited `02-thread-list-shelves-expanded-light-1440x900.png`, `02-thread-list-settled-expanded-dark-1440x900.png` · After: `screens/T8/` same names
- Accept: Settled and Snoozed rows use the bare secondary token (>=4.5:1); favicon dim uses opacity-60 grayscale; no `/NN` text alpha left in the three directories.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/sidebar/SidebarThreadRow.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Parked rows look less receded · upstream: yes, after #24865 merges · #24865: rebase after merge: SidebarThreadRow.tsx

##### T9 Muted-alpha codemod: root components, lint to error, 3-tier grey ladder

- Findings: F-17-02 (P1) · ~150 lines (adjusted from 420) · wave 3 · depends on: T6, T7, T8
- Files: remaining matches under `components/*.tsx` and `routes/`; `oxlint-plugin-t3code` severity to error; DNA-C4 text
- Before: `home-default-{dark,light}-1440x900.png`, `settings-general-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`, `usage-default-{dark,light}-1440x900.png` · After: `screens/T9/` same names
- Accept: Neutral text uses three tiers only (primary, secondary, quiet = secondary at 11 px); lint rule is `error`; DNA-C4 text amended.
- Tests: `vp test run apps/web/src/components/ChatMarkdown.browser.test.tsx` · `vp lint apps/web/src/components/ChatMarkdown.tsx apps/web/src/components/sidebar/SidebarThreadRow.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: low - dense metadata gets louder (dark sidebar and diagnostics most) · upstream: yes, after #24865 merges · #24865: rebase after merge: ChatMarkdown.tsx, SidebarThreadRow.tsx

##### T10 Status colours as text: use `*-foreground`, not the base token

- Findings: F-03-10, F-04-41, F-05-22, F-05-26, F-08-05, F-09-28 · ~170 lines · wave 1 · depends on: #24865
- Files: `components/chat/ComposerPendingApprovalPanel.tsx`, `components/GitActionsControl.tsx`, `components/PullRequestThreadDialog.tsx`, `components/chat/ComposerPromptLengthValidation.tsx`, `components/pullRequest/pullRequestIcons.tsx`, `components/pullRequest/pullRequestPresentation.tsx` (+2)
- Before: `thread-claude-tools-default-{dark,light}-1440x900.png`, `settings-providers-default-{dark,light}-1440x900.png`, `pull-requests-default-{dark,light}-1440x900.png`; cited `03-approval-pending-light-1440x900.png`, `04-prompt-too-long-after-enter-light-1440x900.png` (+2) · After: `screens/T10/` same names
- Accept: Approval label, prompt-length error, git warnings, PR status, amber icons and provider form errors measure >=4.5:1 light and dark; "closed" has one colour.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts apps/web/src/components/PullRequestThreadDialog.test.ts apps/web/src/components/settings/ProviderInstanceCard.test.ts` · `vp lint apps/web/src/components/chat/ComposerPendingApprovalPanel.tsx apps/web/src/components/GitActionsControl.tsx apps/web/src/components/PullRequestThreadDialog.tsx apps/web/src/components/chat/ComposerPromptLengthValidation.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - none functional · upstream: yes, after #24865 merges · #24865: rebase after merge: GitActionsControl.tsx, settingsLayout.tsx

##### T11 Switch off-state and control borders reach 3:1

- Findings: F-16-10 · ~15 lines · wave 1 · depends on: #24865
- Files: `components/ui/switch.tsx`
- Before: `settings-appearance-default-{dark,light}-1440x900.png`, `settings-general-default-{dark,light}-1440x900.png` · After: `screens/T11/` same names
- Accept: Unchecked Switch track measures >=3:1 against the canvas in light; dark thumb carries the state; blue checked accent unchanged.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/switch.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - blue switch accent untouched (owner call) · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### T12 Focus rings at full `ring-ring` (17 reduced-alpha sites)

- Findings: F-16-08 · ~15 lines · wave 1 · depends on: none
- Files: `components/chat/TimelineMinimap.tsx`, `components/chat/V2LifecycleRow.tsx`, `components/ui/collapsible-section-header.tsx`
- Before: `settings-general-default-{dark,light}-1440x900.png`, `home-default-{dark,light}-1440x900.png` · After: `screens/T12/` same names
- Accept: No `ring-ring/NN` or `ring-primary/25` focus ring remains; keyboard ring measures >=3:1 in dark.
- Tests: `vp test run apps/web/src/components/chat/V2LifecycleRow.logic.test.ts` · `vp lint apps/web/src/components/chat/TimelineMinimap.tsx apps/web/src/components/chat/V2LifecycleRow.tsx apps/web/src/components/ui/collapsible-section-header.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low · upstream: yes, after #24865 merges · #24865: rebase after merge: TimelineMinimap.tsx, collapsible-section-header.tsx

### 13.5 Hierarchy (8 chunks)

Type ladder, headings, grey ladder, list structure and message hierarchy (section 4 rules).

##### H1 One title ladder: settings stragglers and the six non-PR title outliers

- Findings: F-17-01 (P1), F-07-14 · ~120 lines (adjusted from 70) · wave 1 · depends on: #24865
- Files: `components/guest/GuestPage.tsx`, `components/onboarding/FirstRunGate.tsx`, `components/preview/PreviewUnreachable.tsx`, `components/settings/AppearanceSettingsPanel.tsx`, `components/settings/FoldedSettingsSection.tsx`, `components/settings/SettingsPanels.tsx` (+4)
- Before: `settings-appearance-default-{dark,light}-1440x900.png`, `settings-general-default-{dark,light}-1440x900.png`, `welcome-default-{dark,light}-1440x900.png` · After: `screens/H1/` same names
- Accept: Section 16/600, page 24/600 tracking-tight, dialog and empty state 20/600; no group title lighter than its rows; Appearance has one heading style.
- Tests: `vp test run apps/web/src/components/guest/GuestPage.browser.test.tsx apps/web/src/components/settings/SettingsPanels.logic.test.ts` · `vp lint apps/web/src/components/guest/GuestPage.tsx apps/web/src/components/onboarding/FirstRunGate.tsx apps/web/src/components/preview/PreviewUnreachable.tsx apps/web/src/components/settings/AppearanceSettingsPanel.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - visual only · upstream: yes, after #24865 merges · #24865: rebase after merge: AppearanceSettingsPanel.tsx, SettingsPanels.tsx, settingsLayout.tsx

##### H2 Real headings and a document title per view

- Findings: F-17-03, F-16-17 · ~70 lines · wave 0 · depends on: none
- Files: `components/chat/ChatHeader.tsx`, `components/chat/DraftHeroHeadline.tsx`, `components/chat/DraftHeroProjectHeading.tsx`, `components/guest/GuestPage.tsx`, `components/settings/SettingsBreadcrumb.tsx`, `routes/__root.tsx`
- Before: `home-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`, `settings-general-default-{dark,light}-1440x900.png` · After: `screens/H2/` same names
- Accept: Saved thread title and Settings crumb are `h1`; `document.title` names the thread, Settings page or Usage; axe `page-has-heading-one` passes on 12 surfaces.
- Tests: `vp test run apps/web/src/components/guest/GuestPage.browser.test.tsx` · `vp lint apps/web/src/components/chat/ChatHeader.tsx apps/web/src/components/chat/DraftHeroHeadline.tsx apps/web/src/components/chat/DraftHeroProjectHeading.tsx apps/web/src/components/guest/GuestPage.tsx ...` · `vp run --filter @t3tools/web typecheck` · new: browser test: document.title for thread, settings, usage
- Model: Opus low · risk: low - none visual · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### H3 Content text at 10 px moves to 11 px (`text-2xs`)

- Findings: F-17-04, F-07-37 (P1), F-05-20 · ~125 lines · wave 2 · depends on: T6
- Files: `components/ThreadTerminalDrawer.tsx`, `components/chat/ProviderInstanceIcon.tsx`, `components/diffs/DiffCommentAnnotation.tsx`, `components/settings/ResourceTelemetryDiagnostics.tsx`, `components/ui/kbd.tsx`, `components/usage/UsageLimitsPooled.tsx`
- Before: `settings-diagnostics-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `05-diff-and-review-comment-typed-light-1440x900.png` · After: `screens/H3/` same names
- Accept: No content-bearing 10 px text outside 1-4 character counters; Diagnostics and comment hint measure >=4.5:1; platform glyphs follow `isMacPlatform`.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/components/chat/ProviderInstanceIcon.test.ts apps/web/src/components/settings/ResourceTelemetryDiagnostics.logic.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/components/chat/ProviderInstanceIcon.tsx apps/web/src/components/diffs/DiffCommentAnnotation.tsx apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Visual only · upstream: yes: none of these files is in #24865 · #24865: independent

##### H4 Diff counts: one style, U+2212 minus, no coloured zeros

- Findings: F-17-05, F-05-16, F-05-17, F-03-22 (P3) · ~100 lines · wave 2 · depends on: #24865, T10
- Files: `components/DiffPanel.tsx`, `components/chat/DiffStatLabel.tsx`, `components/GitActionsControl.tsx`, `components/chat/ChangedFilesTree.tsx`, `components/chat/V2ItemInspector.tsx`, `components/pullRequest/pullRequestPresentation.tsx` (+1)
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `thread-codex-edits-default-light-1440x900.png`, `05-diff-and-review-shapes-changes-light-1440x900.png` (+3) · After: `screens/H4/` same names
- Accept: `DiffStatLabel` renders 11/500 mono everywhere; zero counts are neutral; one green and one red; "+20 -0" shows a muted zero.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts` · `vp lint apps/web/src/components/DiffPanel.tsx apps/web/src/components/chat/DiffStatLabel.tsx apps/web/src/components/GitActionsControl.tsx apps/web/src/components/chat/ChangedFilesTree.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - counts get 10% larger in file rows · upstream: yes, after #24865 merges · #24865: rebase after merge: DiffStatLabel.tsx, GitActionsControl.tsx, SidebarThreadRow.tsx

##### H5 One overline style (`text-overline`)

- Findings: F-17-06 · ~55 lines · wave 1 · depends on: none
- Files: `components/usage/UsageProviderChart.tsx`, `index.css`
- Before: `settings-general-default-{dark,light}-1440x900.png`, `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/H5/` same names
- Accept: Seven overline variants collapse to 11/600/0.1em uppercase muted; 13 sites updated.
- Tests: `vp test run apps/web/src/components/usage/UsageProviderChart.test.ts` · `vp lint apps/web/src/components/usage/UsageProviderChart.tsx apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - 10px overlines grow to 11px · upstream: yes, after #24865 merges · #24865: rebase after merge: index.css

##### H6 Dialog title line-height and px-sized text honour Interface font size

- Findings: F-17-08, F-17-09 · ~30 lines · wave 1 · depends on: none
- Files: `components/chat/threadDetailsPanelStyles.ts`, `components/ui/alert-dialog.tsx`, `components/ui/button.tsx`, `components/ui/collapsible-section-header.tsx`, `components/ui/dialog.tsx`, `components/ui/sheet.tsx`
- Before: `command-palette-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `17-dialog-title-leading-light-1440x900.png` · After: `screens/H6/` same names
- Accept: Wrapped dialog and sheet titles use `leading-tight`; details-card rows and four 11 px sites scale with Interface font size.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/threadDetailsPanelStyles.ts apps/web/src/components/ui/alert-dialog.tsx apps/web/src/components/ui/button.tsx apps/web/src/components/ui/collapsible-section-header.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - 5px taller dialog headers · upstream: yes, after #24865 merges · #24865: rebase after merge: threadDetailsPanelStyles.ts, button.tsx, collapsible-section-header.tsx

##### H7 Thread list structure: pinned header, shelf placement, Working shelf

- Findings: F-02-09, F-02-10, F-02-29, F-02-39 (P3), F-02-11 (P3) · ~115 lines · wave 1 · depends on: #24865
- Files: `components/Sidebar.tsx`, `components/sidebar/SidebarDraftBlock.tsx`, `components/ui/collapsible-section-header.tsx`
- Before: `home-default-{dark,light}-1440x900.png`; cited `02-thread-list-top-dark-1440x900.png`, `02-thread-list-working-shelf-collapsed-light-1440x900.png` · After: `screens/H7/` same names
- Accept: Pinned threads carry a header at rest; shelves sit within the first screen or are sticky; a working thread is not hidden in a collapsed shelf; chevrons agree (ADOPT #24438).
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts apps/web/src/components/Sidebar.drag.test.ts` · `vp lint apps/web/src/components/Sidebar.tsx apps/web/src/components/sidebar/SidebarDraftBlock.tsx apps/web/src/components/ui/collapsible-section-header.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `Sidebar.drag.test.ts` untouched (markers keep ids) · upstream: yes, after #24865 merges · #24865: rebase after merge: Sidebar.tsx, collapsible-section-header.tsx
- Note: Includes ADOPT #24438 (chevron direction).

##### H8 Message hierarchy: resting link underline, tables, lists, separators

- Findings: F-03-19, F-03-21 (P3), F-03-26 (P3) · ~110 lines (adjusted from 45) · wave 1 · depends on: #24865
- Files: `index.css`, `components/chat/TimelineUserMessageRow.tsx`
- Before: `thread-claude-markdown-default-{dark,light}-1440x900.png`, `thread-claude-tools-default-{dark,light}-1440x900.png`; cited `03-md-torture-0-light-1440x900.png`, `03-user-message-hover-dark-1440x900.png` (+1) · After: `screens/H8/` same names
- Accept: In-prose links show a dotted underline at rest (>=3:1 vs prose); inline code in headings and tables scales; ordered-list gutter does not clip (ADOPT #23573); markdown rules visible in dark T3 Chat.
- Tests: no existing test beside these files · `vp lint apps/web/src/index.css apps/web/src/components/chat/TimelineUserMessageRow.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - link-heavy answers get busier · upstream: yes, after #24865 merges · #24865: rebase after merge: index.css
- Note: Absorbs ADOPT #23573 and BORROW #24567, #24084, #22367 (same CSS cluster).

### 13.6 Polish-by-area (85 chunks)

Area-specific visual and behavioural fixes that do not belong to a cross-cutting track. One area per prefix (`P-<area>-<n>`); area 22 (performance feel) is `P-22-1` to `P-22-5`.

##### P-01-1 Collapsed sidebar stays collapsed after reload

- Findings: F-01-01 (P1), F-23-04, F-01-07 · ~45 lines · wave 0 · depends on: none
- Files: `components/AppSidebarLayout.tsx`, `components/ui/sidebar.tsx`, `components/ui/sidebarState.ts`
- Before: `home-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `01-app-shell-sidebar-collapsed-light-1440x900.png` · After: `screens/P-01-1/` same names
- Accept: Collapse, reload: `data-sidebar-state="collapsed"`; no `cookieStore` call remains; first-run default stays expanded.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/AppSidebarLayout.tsx apps/web/src/components/ui/sidebar.tsx apps/web/src/components/ui/sidebarState.ts` · `vp run --filter @t3tools/web typecheck` · new: browser test: collapse, rerender, expect collapsed
- Model: Opus low · risk: low - first-run default stays expanded · upstream: yes: triaged-shaped bug fix, one problem; #24191 · #24865: independent

##### P-01-2 Phone-width sidebar sheet: header buttons, colour, width

- Findings: F-01-02 (P1), F-01-16, F-01-21 (P3) · ~45 lines · wave 1 · depends on: none
- Files: `components/AppSidebarLayout.tsx`, `components/ui/sidebar.tsx`, `index.css`
- Before: `home-default-{dark,light}-390x844.png`, `new-thread-default-{dark,light}-390x844.png`; cited `01-app-shell-sidebar-sheet-dark-390x844.png`, `01-app-shell-sidebar-sheet-then-panel-toggle-light-390x844.png` · After: `screens/P-01-2/` same names
- Accept: At 390x844 header panel buttons are hidden while the sheet is open; sheet paints the sidebar colour; sheet width is `100vw - 12px`.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/AppSidebarLayout.tsx apps/web/src/components/ui/sidebar.tsx apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - desktop `wco` titlebar overlay layout is unaffected (rule applies only when `isMobile`) · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: index.css

##### P-01-3 Project filter survives reload for repositories with a remote

- Findings: F-01-04 (P1) · ~55 lines · wave 1 · depends on: none
- Files: `sidebarProjectGrouping.ts`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/P-01-3/` same names
- Accept: Filter stays selected after reload; the saved value is no longer overwritten with null before repository identity resolves.
- Tests: no existing test beside these files · `vp lint apps/web/src/sidebarProjectGrouping.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: readiness gate waits for repository identity
- Model: Opus low · risk: low - wrongly keeping a stale key would show an empty sidebar · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### P-01-4 Closing Settings or Usage returns to the previous view and restores focus

- Findings: F-01-05, F-01-06 · ~70 lines · wave 0 · depends on: none
- Files: `components/AppRouteModal.tsx`, `components/sidebar/mainAppLocation.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/P-01-4/` same names
- Accept: Close and Back pop history; focus returns to the opener; no duplicate history entries.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/AppRouteModal.tsx apps/web/src/components/sidebar/mainAppLocation.ts` · `vp run --filter @t3tools/web typecheck` · new: browser test: close restores focus and history length
- Model: Opus low · risk: low - history.back() while the modal is animating out (AppRouteModal calls close from onOpenChangeComplete, A · upstream: yes: #16542 · #24865: independent

##### P-01-5 Thread details toggle shows its tooltip (ADOPT #22605)

- Findings: F-01-08 · ~15 lines · wave 0 · depends on: none
- Files: `components/chat/PanelLayoutControls.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `01-app-shell-thread-details-popover-light-1024x640.png` · After: `screens/P-01-5/` same names
- Accept: Hover shows the shortcut tooltip on the Thread details toggle.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/PanelLayoutControls.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - popover anchoring uses `threadPanelPopoverAnchorRef` on the header, not the trigger, so anchoring is... · upstream: yes: #11985 is accepted · #24865: independent
- Note: Code from #22605 by `otavio`.

##### P-01-6 Command palette first screen: project rows and default ordering

- Findings: F-01-13, F-01-14 · ~30 lines · wave 1 · depends on: none
- Files: `components/CommandPalette.tsx`, `components/StartTruncatedPath.tsx`, `components/ui/middle-truncate.tsx`
- Before: `command-palette-default-{dark,light}-1440x900.png`; cited `01-app-shell-palette-default-light-1440x900.png`, `01-app-shell-palette-project-rows-light-1440x900.png` · After: `screens/P-01-6/` same names
- Accept: Project rows show the machine label unclipped and truncate paths at the start; threads are visible on the first screen at 1440x900.
- Tests: `vp test run apps/web/src/components/CommandPalette.logic.test.ts` · `vp lint apps/web/src/components/CommandPalette.tsx apps/web/src/components/StartTruncatedPath.tsx apps/web/src/components/ui/middle-truncate.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `CommandPalette.logic.test.ts` asserts group order (`["Actions","Threads"]`) · upstream: no: F-01-13 changes a product default (needs discussion); F-01-14 alone is a clean fix · #24865: rebase after merge: middle-truncate.tsx

##### P-01-7 Project monogram glyphs reach 4.5:1 in light mode

- Findings: F-01-17 · ~55 lines · wave 1 · depends on: #24865
- Files: `components/ProjectMonogram.tsx`, `components/sidebar/SidebarThreadRow.tsx`, `projectIconColors.ts`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/P-01-7/` same names
- Accept: 15 of 18 monogram hues measure >=4.5:1 on their tile in light; dark unchanged.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ProjectMonogram.tsx apps/web/src/components/sidebar/SidebarThreadRow.tsx apps/web/src/projectIconColors.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - #24865 renders sidebar-row icons grayscale at `opacity-60` at rest (`SidebarThreadRow.tsx`), which... · upstream: no: identity change, DNA-K3 territory · #24865: rebase after merge: SidebarThreadRow.tsx

##### P-02-1 Thread row time and status labels keep the age

- Findings: F-02-16, F-02-17, F-02-18 (P3) · ~165 lines · wave 1 · depends on: #24865
- Files: `components/sidebar/SidebarThreadRow.tsx`, `components/Sidebar.logic.ts`, `timestampFormat.ts`
- Before: `home-default-{dark,light}-1440x900.png`; cited `02-thread-list-after-pin-undo-notice-dark-1440x900.png`, `02-thread-list-open-dark-390x844.png` (+2) · After: `screens/P-02-1/` same names
- Accept: Done, Failed, Limited and Woke keep a relative time; snoozed rows state wake direction and absolute time on the hover card; "Waiting N" states its cause and does not tick for plain idle.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/sidebar/SidebarThreadRow.tsx apps/web/src/components/Sidebar.logic.ts apps/web/src/timestampFormat.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Status slot `min-w-8` grows by ~28px · upstream: yes, after #24865 merges · #24865: rebase after merge: SidebarThreadRow.tsx
- Note: F-02-18 downgraded to P3 by the follow-up sweep; fold stays.

##### P-02-2 Thread row polish: bulk menu parity, search highlight, pin glyph, fills

- Findings: F-02-13, F-02-20, F-02-23, F-02-12 · ~140 lines · wave 1 · depends on: #24865
- Files: `components/sidebar/SidebarThreadRow.tsx`, `components/LegacySidebar.tsx`, `components/Sidebar.logic.ts`, `components/Sidebar.tsx`, `components/ThreadSearchMatch.tsx`
- Before: `home-default-{dark,light}-1440x900.png`; cited `02-thread-list-search-results-dark-1440x900.png`, `02-thread-list-keyboard-focus-light-1440x900.png` (+2) · After: `screens/P-02-2/` same names
- Accept: Bulk menu offers Pin, Archive, Un-settle, Wake; search results highlight the match and show the project; pin glyph is a 24 px target at >=4.5:1; selected, active and hover fills are distinct.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/sidebar/SidebarThreadRow.tsx apps/web/src/components/LegacySidebar.tsx apps/web/src/components/Sidebar.logic.ts apps/web/src/components/Sidebar.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `Sidebar.logic.test.ts` covers builders · upstream: yes, after #24865 merges · #24865: rebase after merge: SidebarThreadRow.tsx, Sidebar.tsx

##### P-02-3 Custom snooze uses the same clock format as the presets

- Findings: F-02-26, F-02-37 (P3) · ~70 lines · wave 0 · depends on: none
- Files: `components/CustomSnoozeDialog.tsx`, `timestampFormat.ts`
- Before: `home-default-{dark,light}-1440x900.png`; cited `02-thread-list-custom-snooze-dialog-dark-1440x900.png` · After: `screens/P-02-3/` same names
- Accept: Custom snooze time field follows the 12/24 h preference used by the presets; relative time gains a unit above days.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/CustomSnoozeDialog.tsx apps/web/src/timestampFormat.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Native `type="time"` follows OS locale · upstream: yes: file untouched by #24865; matches an open issue · #24865: independent

##### P-02-4 Archive page: open, search, count, bulk, Delete without a context menu

- Findings: F-02-27 · ~160 lines · wave 0 · depends on: none
- Files: `components/settings/ArchivedThreadsPanel.tsx`
- Before: `settings-archived-default-{dark,light}-1440x900.png` · After: `screens/P-02-4/` same names
- Accept: Archive rows open, a search field and count exist, Delete is reachable by button and keyboard.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/ArchivedThreadsPanel.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Opening an archived thread depends on server support · upstream: yes: file untouched by #24865 · #24865: independent

##### P-03-1 Opening a long thread lands at the end

- Findings: F-03-01 (P1) · ~55 lines · wave 1 · depends on: none
- Files: `components/chat/MessagesTimeline.tsx`
- Before: `thread-long-conversation-default-{dark,light}-1440x900.png`; cited `03-long-opened-end-light-1440x900.png`, `03-long-scrolled-bottom-light-1440x900.png` · After: `screens/P-03-1/` same names
- Accept: On open the last answer is fully above the composer (dom gap <= 8 px); "Scroll to end" uses the same predicate.
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts apps/web/src/components/chat/timelineScrollAnchoring.test.tsx apps/web/src/components/chat/useTimelinePositionRestore.test.ts` · `vp lint apps/web/src/components/chat/MessagesTimeline.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: single domGap predicate
- Model: Opus low · risk: low - LegendList anchoring and position restore · upstream: yes, after #24865 merges · #24865: rebase after merge: MessagesTimeline.tsx

##### P-03-2 A user scroll-up during a running turn is not reverted

- Findings: F-03-02 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `components/chat/useTimelineFollow.ts`
- Before: `thread-long-conversation-default-{dark,light}-1440x900.png`; cited `03-stream-scrolled-up-light-1440x900.png` · After: `screens/P-03-2/` same names + short .webm of the timing
- Accept: With a streaming turn, wheel-up releases live-follow in the same frame and stays released (16 ms wheel sampler shows no snap-back).
- Tests: `vp test run apps/web/src/components/chat/timelineScrollAnchoring.test.tsx apps/web/src/components/chat/timelineScrollTarget.test.ts` · `vp lint apps/web/src/components/chat/useTimelineFollow.ts` · `vp run --filter @t3tools/web typecheck` · new: browser test: wheel releases follow synchronously
- Model: Opus medium · risk: high - anchoring of the just-sent turn (anchoredEndSpace), disclosure pinning... · upstream: yes: the headline open bug; focused · #24865: independent
- Note: Follow-up sweep: handlers already cancel follow; fix = `flushSync` plus cancelling the in-flight smooth scroll.

##### P-03-3 Pending and collapsed command rows show the command; tool rows are selectable and copyable

- Findings: F-03-09, F-03-16 · ~110 lines · wave 1 · depends on: #24865
- Files: `components/chat/TimelineWorkEntryRow.tsx`, `components/chat/V2ItemInspector.tsx`
- Before: `thread-claude-tools-default-{dark,light}-1440x900.png`; cited `03-approval-pending-light-1440x900.png` · After: `screens/P-03-3/` same names
- Accept: Pending command row shows the command, not the shell wrapper; collapsed tool rows are selectable and expose Copy.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/TimelineWorkEntryRow.tsx apps/web/src/components/chat/V2ItemInspector.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - label helpers have tests in client-runtime · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge (see audit: same files or its tokens)

##### P-03-4 Timeline bits: inline code chip, copy-button focus, timestamps, strip

- Findings: F-03-20, F-03-12, F-03-24, F-03-32 · ~100 lines · wave 1 · depends on: #24865
- Files: `components/ChatMarkdown.tsx`, `components/ChatView.tsx`, `components/chat/MessageCopyButton.tsx`, `components/chat/TimelineRowParts.tsx`, `index.css`, `pkg:shared/src/markdownLinks.ts`
- Before: `thread-claude-markdown-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `03-md-torture-0-light-1440x900.png`, `03-md-light-390x844.png` (+3) · After: `screens/P-03-4/` same names
- Accept: Inline code like `I/W217:220` stays code; message copy keeps focus; turn-fold and tool-row timestamps are reachable without hover; no content shows through the 20 px strip.
- Tests: `vp test run apps/web/src/components/ChatMarkdown.browser.test.tsx apps/web/src/components/ChatView.logic.test.ts packages/shared/src/markdownLinks.test.ts` · `vp lint apps/web/src/components/ChatMarkdown.tsx apps/web/src/components/ChatView.tsx apps/web/src/components/chat/MessageCopyButton.tsx apps/web/src/components/chat/TimelineRowParts.tsx ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/shared typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `markdownLinks` unit tests · upstream: yes, after #24865 merges; bundle: 4 carve-out PRs possible · #24865: rebase after merge: ChatMarkdown.tsx, index.css

##### P-04-1 File chips: visible remove control and 24 px target

- Findings: F-04-05 · ~55 lines · wave 0 · depends on: none
- Files: `components/ContextChip.tsx`, `components/chat/UserMessageContextChips.tsx`, `components/contextChipParts.tsx`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `04-attach-chips-zoom-light-1440x900@2x.png`, `04-attach-chip-hover-light-1440x900@2x.png` (+1) · After: `screens/P-04-1/` same names
- Accept: Attached chips show a remove control at rest and meet the 24 px fine-pointer floor.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ContextChip.tsx apps/web/src/components/chat/UserMessageContextChips.tsx apps/web/src/components/contextChipParts.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Chip is also used in message history (`UserMessageContextChips.tsx`) · upstream: yes: small, fix-shaped; `contextChipParts.tsx` is not in the #24865 diff · #24865: independent

##### P-04-2 Tab in a numbered list renumbers the nested item

- Findings: F-04-08, F-04-09 (P3) · ~110 lines · wave 1 · depends on: #24865
- Files: `composer-list-continuation.ts`, `composer-undo-grouping.ts`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `04-edit-numbered-list-tab-light-1440x900.png` · After: `screens/P-04-2/` same names
- Accept: Tab nests and restarts numbering (#17124); a typed dash before a line becomes a bullet (#22989).
- Tests: `vp test run apps/web/src/composer-list-continuation.test.ts apps/web/src/composer-undo-grouping.test.ts apps/web/src/composer-list-split.browser.test.ts apps/web/src/composer-rich-text.test.ts` · `vp lint apps/web/src/composer-list-continuation.ts apps/web/src/composer-undo-grouping.ts` · `vp run --filter @t3tools/web typecheck` · new: editor test: tab in ordered list
- Model: Opus low · risk: low - `composer-list-continuation.test.ts`, `composer-list-split.browser.test.ts`, `composer-rich-text.test.ts` · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### P-04-3 `@` popup: no false "No matching files" and exact folder matches rank first

- Findings: F-04-11, F-04-12 · ~215 lines · wave 1 · depends on: none
- Files: `components/chat/useComposerMenuItems.ts`, `apps/web/package.json`, `components/chat/ComposerCommandMenu.tsx`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `04-menu-mention-bare-codex-light-1440x900.png`, `04-menu-mention-bare-explicit-light-1440x900.png` (+2) · After: `screens/P-04-3/` same names
- Accept: A bare `@` shows a prompt state, not "No matching"; exact folder name ranks above threads and unrelated files.
- Tests: `vp test run apps/web/src/components/chat/ComposerCommandMenu.test.tsx apps/web/src/components/chat/composerMenuHighlight.test.ts` · `vp lint apps/web/src/components/chat/useComposerMenuItems.ts apps/web/src/components/chat/ComposerCommandMenu.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: mention ranking
- Model: Opus medium · risk: med - `useComposerMenuItems` tests · upstream: yes, after #24865 merges · #24865: rebase after merge: package.json

##### P-04-4 Running-turn controls: Stop and Interrupt agree, follow-up mode legible, Send matches Enter

- Findings: F-04-15, F-04-16, F-04-17 · ~125 lines · wave 1 · depends on: #24865
- Files: `components/chat/ComposerPrimaryActions.tsx`, `pkg:contracts/src/settings.ts`, `pkg:shared/src/keybindings.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `04-stop-button-zoom-light-1440x900@2x.png`, `04-running-typed-steer-light-1440x900.png` (+1) · After: `screens/P-04-4/` same names
- Accept: Stop tooltip, name and docs say one word and show a shortcut; armed follow-up action has a text label; Send enables for thread-context-only drafts (ADOPT #23166).
- Tests: `vp test run packages/contracts/src/settings.test.ts` · `vp lint apps/web/src/components/chat/ComposerPrimaryActions.tsx packages/contracts/src/settings.ts packages/shared/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/contracts typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Browser tests that query `getByLabel("Stop generation")` (grep before changing) · upstream: yes, after #24865 merges · #24865: rebase after merge: ComposerPrimaryActions.tsx, settings.ts
- Note: Absorbs ADOPT #23166 and #22436 (platform modifier in tooltip).

##### P-04-5 Composer menus: selected option marked, provider rail scroll cue, combobox input width

- Findings: F-04-25, F-04-30 · ~110 lines · wave 1 · depends on: #24865
- Files: `components/chat/CompactComposerControlsMenu.tsx`, `components/chat/ModelPickerContent.tsx`, `components/chat/ModelPickerSidebar.tsx`, `components/chat/TraitsPicker.tsx`, `components/ui/menu.tsx`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `04-effort-menu-light-1440x900.png`, `04-mobile-overflow-menu-light-390x460.png` (+1) · After: `screens/P-04-5/` same names
- Accept: Effort, access and mode menus mark the selected option with an indicator (ADOPT-pattern #23893); provider rail shows a scroll cue; search input fills its popup (ADOPT #24312).
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/CompactComposerControlsMenu.tsx apps/web/src/components/chat/ModelPickerContent.tsx apps/web/src/components/chat/ModelPickerSidebar.tsx apps/web/src/components/chat/TraitsPicker.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Menu min widths (`min-w-64` on the permission items) · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: TraitsPicker.tsx, menu.tsx
- Note: Absorbs BORROW #23280 (empty Favorites tab).

##### P-04-6 Multi-model selection is discoverable and explains the worktree lock

- Findings: F-04-33, F-04-34 · ~110 lines · wave 1 · depends on: #24865
- Files: `components/BranchToolbarEnvModeSelector.tsx`, `components/chat/ModelListRow.tsx`, `components/chat/ProviderModelPicker.tsx`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `04-model-picker-after-shiftclick-light-1440x900.png`, `04-model-multi-trigger-light-1440x900.png` · After: `screens/P-04-6/` same names
- Accept: Model picker states shift-click multi-select; choosing two models says why the workspace becomes "New worktree".
- Tests: no existing test beside these files · `vp lint apps/web/src/components/BranchToolbarEnvModeSelector.tsx apps/web/src/components/chat/ModelListRow.tsx apps/web/src/components/chat/ProviderModelPicker.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Popup height budget (346px) · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### P-04-7 Resting controls strip is opaque over the timeline

- Findings: F-04-37 · ~15 lines · wave 1 · depends on: #24865
- Files: `components/chat/ComposerBanner.tsx`, `components/chat/ComposerSurface.tsx`, `index.css`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `04-composer-resting-zoom-light-1440x900@2x.png`, `04-composer-resting-zoom-dark-1440x900@2x.png` · After: `screens/P-04-7/` same names
- Accept: Timeline text no longer shows through the resting strip at 1440x900 and 800x600.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/ComposerBanner.tsx apps/web/src/components/chat/ComposerSurface.tsx apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Glass recipe consistency with attached banners (`ComposerBanner.tsx:58`) · upstream: yes, after #24865 merges · #24865: rebase after merge: ComposerSurface.tsx, index.css

##### P-05-1 Diff: files loaded late honour the fold default; jumping stays contiguous

- Findings: F-05-01 (P1), F-05-09 · ~215 lines · wave 0 · depends on: none
- Files: `components/DiffPanel.tsx`, `lib/diffRendering.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `05-diff-and-review-fold-default-leak-light-1440x900.png`, `05-diff-and-review-reveal-index-light-1440x900.png` (+2) · After: `screens/P-05-1/` same names
- Accept: With "Collapsed by default", late-loading files open collapsed; jump-to-file keeps the list order with no pop-in above.
- Tests: `vp test run apps/web/src/lib/diffRendering.test.ts` · `vp lint apps/web/src/components/DiffPanel.tsx apps/web/src/lib/diffRendering.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: fold key for late files
- Model: Opus medium · risk: med - `useCodeViewFileReveal` and draft-comment survival (`AnnotatableCodeView.tsx` matches pending files by... · upstream: yes: fix-shaped, one helper · #24865: independent

##### P-05-2 Diff totals agree; commit dialog counts untracked work

- Findings: F-05-08, F-05-23 · ~110 lines · wave 1 · depends on: none
- Files: `components/GitActionsControl.tsx`, `components/chat/DiffStatLabel.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `05-diff-and-review-details-card-light-1440x900.png`, `05-diff-and-review-commit-dialog-light-1440x900.png` · After: `screens/P-05-2/` same names
- Accept: The "Changes" total reads the same in card, panel and dialog; untracked files show a real count, folders expand.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts` · `vp lint apps/web/src/components/GitActionsControl.tsx apps/web/src/components/chat/DiffStatLabel.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `DiffStatLabel` is a K12 do-not-touch component for its look · upstream: yes, after #24865 merges · #24865: rebase after merge: GitActionsControl.tsx, DiffStatLabel.tsx

##### P-05-3 Diff toolbar toggles: tooltip, pressed state, scope menu indicator, word wrap

- Findings: F-05-14, F-05-15 · ~70 lines · wave 0 · depends on: none
- Files: `components/DiffPanel.tsx`, `components/files/AttachmentFilePreview.tsx`, `components/files/FilePreviewPanel.tsx`, `components/ui/toggle.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `05-diff-and-review-toolbar-light-1440x900@2x.png` · After: `screens/P-05-3/` same names
- Accept: Layout toggles have tooltips and a visible pressed state; scope menu marks the active choice (ADOPT #23893); word wrap persistence is consistent.
- Tests: `vp test run apps/web/src/components/files/FilePreviewPanel.test.ts` · `vp lint apps/web/src/components/DiffPanel.tsx apps/web/src/components/files/AttachmentFilePreview.tsx apps/web/src/components/files/FilePreviewPanel.tsx apps/web/src/components/ui/toggle.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `toggle.tsx` is shared (K10): QA every `Toggle variant="ghost"` (FileSurfaceAction, PR toolbar, composer) · upstream: yes: pressed state; bundle: 2 carve-out PRs possible · #24865: independent

##### P-05-4 Light-mode diff syntax colours reach 4.5:1

- Findings: F-05-18 · ~160 lines · wave 0 · depends on: none
- Files: `components/DiffWorkerPoolProvider.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `05-diff-and-review-reveal-index-light-1440x900.png` · After: `screens/P-05-4/` same names
- Accept: Added/removed rows with syntax colours measure >=4.5:1 in light via `registerCustomTheme`.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/DiffWorkerPoolProvider.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - worker pool theme names are a Schema.Literals(["pierre-light","pierre-dark"]) in... · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### P-05-5 Pull request creation shows an editable preview

- Findings: F-05-25 · ~420 lines · wave 2 · depends on: T10
- Files: `components/GitActionsControl.tsx`, `pkg:contracts/src/git.ts`
- Before: `pull-requests-default-{dark,light}-1440x900.png` · After: `screens/P-05-5/` same names
- Accept: Creating a PR opens a preview with title, body and draft toggle; one click no longer publishes a generated PR.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts packages/contracts/src/git.test.ts` · `vp lint apps/web/src/components/GitActionsControl.tsx packages/contracts/src/git.ts` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/contracts typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - changes a core flow · upstream: no: feature, needs a design discussion first · #24865: rebase after merge: GitActionsControl.tsx
- Note: Feature-shaped: needs maintainer approval before any upstream PR.

##### P-06-1 Terminal chrome: toolbar no longer covers output; scrollbar visible and themed

- Findings: F-06-01 (P1), F-06-16 · ~215 lines · wave 1 · depends on: none
- Files: `components/ThreadTerminalDrawer.tsx`, `index.css`, `terminal/ghostty/surface.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-06-1/` same names
- Accept: Toolbar sits outside the output area at >=24 px with labels on hover; scrollbar is visible and "latest output" cue exists (#19536).
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/terminal/ghostty/surface.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/index.css apps/web/src/terminal/ghostty/surface.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - PTY rows shrink by 28 px (resize path covered by `surface.test.ts`) · upstream: yes, after #24865 merges · #24865: rebase after merge: index.css

##### P-06-2 Terminal list: compact rows, all terminals visible

- Findings: F-06-02 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `components/ThreadTerminalDrawer.tsx`, `terminalUiStateStore.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-06-2/` same names
- Accept: The terminal list becomes horizontal tabs in the header (scroll chevrons, active tab scrolled into view); a group chip shows only for groups with more than one pane.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/terminalUiStateStore.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/terminalUiStateStore.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - persisted group model unchanged (`terminalUiStateStore.ts`) · upstream: no: layout change; needs maintainer buy-in · #24865: independent

##### P-06-3 Selection popover dismisses on Esc and Cmd+C

- Findings: F-06-03 (P1) · ~55 lines · wave 0 · depends on: none
- Files: `contextMenuFallback.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-06-3/` same names + short .webm of the timing
- Accept: Drag-select shows the popover; Esc and Cmd+C dismiss it.
- Tests: `vp test run apps/web/src/contextMenuFallback.test.ts` · `vp lint apps/web/src/contextMenuFallback.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - shared fallback menu used by thread and tab menus (area 12/16) · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### P-06-4 ANSI palette follows the theme and passes contrast

- Findings: F-06-04 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `components/ThreadTerminalDrawer.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-06-4/` same names
- Accept: All 16 ANSI colours measure >=4.5:1 on the terminal background in default and the five named themes (ADOPT #24042 for PASS/FAIL badge text).
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - users who tuned programs to the VS Code palette see shifts · upstream: yes: palette values only · #24865: independent
- Note: Code from #24042 by `WesleySmits`.

##### P-06-5 Browser panel: reopen closed tab, refresh label, invalid address, action labels

- Findings: F-06-14, F-06-17, F-06-18, F-06-21 · ~100 lines · wave 0 · depends on: none
- Files: `components/preview/PreviewView.tsx`, `components/ReopenClosedViewShortcut.tsx`, `components/ThreadTerminalDrawer.tsx`, `components/chat/useChatTerminalActions.ts`, `components/preview/PreviewChromeRow.tsx`, `components/settings/KeybindingsSettings.logic.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-06-5/` same names
- Accept: Closed-tab reopen is visible; the loading button says "Stop" only when it stops; invalid input shows an error; terminal action labels are sentence case.
- Tests: `vp test run apps/web/src/components/preview/PreviewView.browser.test.tsx apps/web/src/components/ReopenClosedViewShortcut.browser.test.tsx apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/components/settings/KeybindingsSettings.logic.test.ts` · `vp lint apps/web/src/components/preview/PreviewView.tsx apps/web/src/components/ReopenClosedViewShortcut.tsx apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/components/chat/useChatTerminalActions.ts ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - closed-view history is per device · upstream: yes: fix-shaped, no #24865 overlap; bundle: 4 carve-out PRs possible · #24865: independent

##### P-06-6 Floating preview controls and cross-client sessions

- Findings: F-06-19, F-06-20 · ~110 lines · wave 0 · depends on: none
- Files: `components/preview/ThreadPreviewMiniPlayer.tsx`, `previewMiniPlayerStore.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-06-6/` same names
- Accept: Preview controls are reachable without a 12 px dot; sessions started elsewhere show a cue on reconnect.
- Tests: `vp test run apps/web/src/previewMiniPlayerStore.test.ts apps/web/src/components/preview/previewMiniPlayerLayout.test.ts` · `vp lint apps/web/src/components/preview/ThreadPreviewMiniPlayer.tsx apps/web/src/previewMiniPlayerStore.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `previewMiniPlayerLayout.test.ts` encodes frame geometry · upstream: no: new persistent-preview behaviour and a cross-client cue; maintainer direction first · #24865: independent

##### P-07-1 Esc closes the theme editor or inspector, not Settings

- Findings: F-07-01 (P1), F-07-02 · ~30 lines · wave 0 · depends on: none
- Files: `components/settings/ThemeEditorPanel.tsx`, `components/settings/TypographySettings.tsx`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/P-07-1/` same names
- Accept: Esc during Inspect cancels the inspector only; Esc inside the editor closes the editor; second Esc closes Settings.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/ThemeEditorPanel.tsx apps/web/src/components/settings/TypographySettings.tsx` · `vp run --filter @t3tools/web typecheck` · new: browser test: Esc stack in Settings
- Model: Opus low · risk: low - No test covers `ThemeEditorPanel` · upstream: yes: ThemeEditorPanel.tsx is not touched by #24865 · #24865: independent

##### P-07-2 Theme import: JSONC parses and errors name the field

- Findings: F-07-30 (P1), F-12-21, F-07-34 (P3), F-07-35 (P3) · ~180 lines · wave 0 · depends on: none
- Files: `components/settings/ThemeImportDialog.tsx`, `components/settings/ThemeEditorPanel.tsx`, `components/settings/ThemeSearchSection.tsx`, `vscodeThemeImport.ts`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/P-07-2/` same names
- Accept: Ordinary VS Code theme files (comments, trailing commas) import; failures read "what failed then why" below the field.
- Tests: `vp test run apps/web/src/vscodeThemeImport.test.ts apps/web/src/openVsxThemes.test.ts` · `vp lint apps/web/src/components/settings/ThemeImportDialog.tsx apps/web/src/components/settings/ThemeEditorPanel.tsx apps/web/src/components/settings/ThemeSearchSection.tsx apps/web/src/vscodeThemeImport.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: JSONC theme import
- Model: Opus medium · risk: med - `vscodeThemeImport.test.ts` and `openVsxThemes.test.ts` exist · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### P-07-3 Theme grid: sections, readable names, no single-column collapse

- Findings: F-07-15, F-07-19, F-07-20 · ~230 lines · wave 1 · depends on: #24865
- Files: `components/settings/ThemeSettings.tsx`, `components/settings/ThemePreviewCircles.tsx`
- Before: `settings-appearance-default-{dark,light}-{1440x900,800x600}.png` · After: `screens/P-07-3/` same names
- Accept: Built-in, published and custom themes sit in labelled sections; names truncate in the middle with a tooltip; 800x600 shows two columns.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/ThemeSettings.tsx apps/web/src/components/settings/ThemePreviewCircles.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Custom-theme cards with 4 action buttons are the tightest case (F-07-20) · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### P-07-4 Theme editor flows: popover glass, alpha kept, inspect from Settings, Open VSX preview

- Findings: F-07-32, F-07-33 · ~110 lines · wave 1 · depends on: #24865
- Files: `components/settings/themeEditorStore.ts`, `components/sidebar/mainAppLocation.ts`, `index.css`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/P-07-4/` same names
- Accept: Colour popover keeps glass (ADOPT #22348); typed hex keeps alpha (ADOPT #23136); Inspect works from Settings; Open VSX rows show a palette and select after install.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/themeEditorStore.ts apps/web/src/components/sidebar/mainAppLocation.ts apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Closing Settings clears the Settings scroll/search state · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: index.css
- Note: Absorbs ADOPT #22348, #23136.

##### P-07-5 Appearance small fixes: default card accent, font not found, Diagnostics sampling text

- Findings: F-07-18, F-07-28, F-07-38 · ~125 lines · wave 1 · depends on: #24865
- Files: `components/settings/ResourceTelemetryDiagnostics.tsx`, `components/settings/ThemeEditorPanel.tsx`, `components/settings/TypographySettings.tsx`, `pkg:shared/src/themePreview.ts`
- Before: `settings-appearance-default-{dark,light}-1440x900.png`, `settings-diagnostics-default-{dark,light}-1440x900.png` · After: `screens/P-07-5/` same names
- Accept: T3 Code default card uses the app accent; an unknown font family is reported, not discarded; Diagnostics never says "Sampling every 0 ms" beside a green dot.
- Tests: `vp test run apps/web/src/components/settings/ResourceTelemetryDiagnostics.logic.test.ts` · `vp lint apps/web/src/components/settings/ResourceTelemetryDiagnostics.tsx apps/web/src/components/settings/ThemeEditorPanel.tsx apps/web/src/components/settings/TypographySettings.tsx packages/shared/src/themePreview.ts` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/shared typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `themeBoot.test.ts` asserts splash vs palettes · upstream: yes, after #24865 merges; bundle: 3 carve-out PRs possible · #24865: rebase after merge (see audit: same files or its tokens)
- Note: Absorbs ADOPT #22795 (font picker scroll).

##### P-08-1 Scope sentence tells the truth on every settings page

- Findings: F-07-08, F-09-17 (P1), F-08-02, F-08-03, F-08-04 · ~235 lines · wave 1 · depends on: #24865
- Files: `components/settings/settingsLayout.tsx`, `components/chat/runtimeModeConfig.ts`, `components/settings/BranchNamingSettings.tsx`, `components/settings/ProviderInstanceCard.tsx`, `components/settings/SettingsPanels.tsx`, `components/settings/SettingsScopeSentence.tsx` (+2)
- Before: `settings-general-default-{dark,light}-1440x900.png`, `settings-providers-default-{dark,light}-1440x900.png`, `settings-projects-default-{dark,light}-1440x900.png`; cited `09-project-claude-off-dark-1440x900.png` · After: `screens/P-08-1/` same names
- Accept: Pages that ignore scope drop the sentence; project scope shows which rows apply; read-only rows state why; device-only rows carry a marker; layers popover uses labels, not enum values.
- Tests: `vp test run apps/web/src/components/settings/ProviderInstanceCard.test.ts apps/web/src/components/settings/SettingsPanels.logic.test.ts apps/web/src/components/settings/SettingInheritance.test.ts` · `vp lint apps/web/src/components/settings/settingsLayout.tsx apps/web/src/components/chat/runtimeModeConfig.ts apps/web/src/components/settings/BranchNamingSettings.tsx apps/web/src/components/settings/ProviderInstanceCard.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - none functionally · upstream: yes, after #24865 merges · #24865: rebase after merge: settingsLayout.tsx, SettingsPanels.tsx, SettingsScopeSentence.tsx
- Note: Absorbs BORROW #20003 (sticky scope pickers).

##### P-08-2 Keybinding pills render like the rest of the app

- Findings: F-08-23, F-08-26, F-08-27 · ~85 lines · wave 0 · depends on: none
- Files: `components/settings/KeybindingsSettings.tsx`, `keybindings.ts`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/P-08-2/` same names
- Accept: Tab moves focus instead of recording; "Preview: Zoom In" shows the plus key; pills reuse `formatShortcutLabel`.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/keybindings.test.ts` · `vp lint apps/web/src/components/settings/KeybindingsSettings.tsx apps/web/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Users who want a bare Tab binding lose it (it is a poor default) · upstream: yes: fix-shaped, no #24865 overlap; bundle: 3 carve-out PRs possible · #24865: independent

##### P-08-3 Keybinding recorder shows readable keys and discards dirty rows

- Findings: F-08-28 · ~160 lines · wave 1 · depends on: none
- Files: `components/settings/SettingsScopeSentence.tsx`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/P-08-3/` same names
- Accept: Recording shows glyphs, not tokens; a dirty row can be discarded; command select shows labels, not ids.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts` · `vp lint apps/web/src/components/settings/SettingsScopeSentence.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `useKeybindingRowEditor` state is per row · upstream: yes, after #24865 merges · #24865: rebase after merge: SettingsScopeSentence.tsx

##### P-08-4 Keybinding conflicts are visible and resolvable

- Findings: F-08-29 · ~160 lines · wave 0 · depends on: none
- Files: `components/settings/KeybindingsSettings.logic.ts`, `components/settings/KeybindingsSettings.tsx`, `keybindings.ts`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/P-08-4/` same names
- Accept: A conflicting row shows an inline notice naming the other command with an action; not tooltip-only.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/keybindings.test.ts` · `vp lint apps/web/src/components/settings/KeybindingsSettings.logic.ts apps/web/src/components/settings/KeybindingsSettings.tsx apps/web/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - The warning appears on every row of a conflicting pair · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### P-08-5 Keybindings list: search matches shown text, bindable commands, groups, density

- Findings: F-08-24, F-08-25, F-08-31, F-08-32, F-08-33 · ~380 lines · wave 0 · depends on: none
- Files: `components/settings/KeybindingsSettings.logic.ts`, `pkg:shared/src/keybindings.ts`, `pkg:contracts/src/keybindings.ts`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/P-08-5/` same names
- Accept: Search matches what the row shows; commands without a default have a row (unbind via `when: "false"`); groups fit; rows are denser; when-vocabulary matches docs.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts packages/contracts/src/keybindings.test.ts` · `vp lint apps/web/src/components/settings/KeybindingsSettings.logic.ts packages/shared/src/keybindings.ts packages/contracts/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/shared typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - `KeybindingsSettings.logic.test.ts` has filter tests · upstream: yes: fix-shaped, no #24865 overlap (split first: over 300 lines); bundle: 4 carve-out PRs possible · #24865: independent

##### P-08-6 Keybindings save to one environment by default

- Findings: F-08-07 · ~160 lines · wave 1 · depends on: none
- Files: `components/settings/KeybindingsSettings.tsx`, `components/settings/SettingsScopeSentence.tsx`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/P-08-6/` same names
- Accept: Project picker is removed or scoped; saves go to the selected environment only.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts` · `vp lint apps/web/src/components/settings/KeybindingsSettings.tsx apps/web/src/components/settings/SettingsScopeSentence.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Multi-environment users lose the implicit "set everywhere" behaviour · upstream: yes, after #24865 merges · #24865: rebase after merge: SettingsScopeSentence.tsx

##### P-08-7 Project page: location, scratch entry, monogram validation

- Findings: F-08-13, F-08-14, F-08-15 · ~165 lines · wave 0 · depends on: none
- Files: `components/ProjectMonogram.tsx`, `components/settings/KeybindingsSettings.tsx`, `sidebarProjectGrouping.ts`
- Before: `settings-projects-default-{dark,light}-1440x900.png` · After: `screens/P-08-7/` same names
- Accept: Project page shows its path; the "No project" entry has no Remove; a 3-letter monogram is rejected inline, not by a failed mutation.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/projectIconOptions.test.ts` · `vp lint apps/web/src/components/ProjectMonogram.tsx apps/web/src/components/settings/KeybindingsSettings.tsx apps/web/src/sidebarProjectGrouping.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Remote environments cannot open local editors · upstream: yes: fix-shaped, no #24865 overlap; bundle: 3 carve-out PRs possible · #24865: independent

##### P-08-8 Project actions: visible edit, import menu width, shortcut field, invalid t3.json

- Findings: F-08-18, F-08-19, F-08-20, F-08-21 · ~220 lines · wave 0 · depends on: none
- Files: `components/projectScriptEditor.tsx`, `components/settings/KeybindingsSettings.logic.ts`, `components/settings/ProjectActionsSettings.tsx`, `components/settings/ProjectSettingsPanel.tsx`, `components/ui/alert.tsx`, `keybindings.ts`
- Before: `settings-projects-default-{dark,light}-1440x900.png` · After: `screens/P-08-8/` same names
- Accept: Action rows show edit at rest and on touch (ADOPT #23640); import menu is capped with Import all; shortcut field shows glyphs and warns on conflict; invalid t3.json shows an error row.
- Tests: `vp test run apps/web/src/components/projectScriptEditor.browser.test.tsx apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/components/settings/ProjectSettingsPanel.browser.test.tsx apps/web/src/components/settings/ProjectSettingsPanel.logic.test.ts` · `vp lint apps/web/src/components/projectScriptEditor.tsx apps/web/src/components/settings/KeybindingsSettings.logic.ts apps/web/src/components/settings/ProjectActionsSettings.tsx apps/web/src/components/settings/ProjectSettingsPanel.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Row click must not fire when the user selects text in the command · upstream: yes: fix-shaped, no #24865 overlap; bundle: 4 carve-out PRs possible · #24865: independent
- Note: Absorbs ADOPT #23640.

##### P-08-9 Scheduled tasks list: project, workspace, readable status, weekday contrast

- Findings: F-08-43, F-08-44 · ~110 lines · wave 0 · depends on: none
- Files: `components/settings/ScheduledTasksSettings.tsx`, `components/ui/toggle-group.tsx`
- Before: `settings-scheduled-tasks-default-{dark,light}-1440x900.png` · After: `screens/P-08-9/` same names
- Accept: Task rows show project and workspace and a human run status; selected weekdays differ from unselected by >=3:1.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/ScheduledTasksSettings.tsx apps/web/src/components/ui/toggle-group.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Long project names · upstream: yes: fix-shaped, no #24865 overlap; bundle: 2 carve-out PRs possible · #24865: independent

##### P-09-1 Re-auth command signs in the right account for a custom config directory

- Findings: F-09-09 (P1) · ~55 lines · wave 0 · depends on: none
- Files: (audit names no file; locate from the finding Evidence)
- Before: `settings-providers-default-{dark,light}-1440x900.png`; cited `09-providers-second-claude-added-light-1440x900.png`, `09-thread-claude-logged-out-light-1440x900.png` · After: `screens/P-09-1/` same names
- Accept: With `CLAUDE_CONFIG_DIR` set, the shown command includes it; the status sentence matches.
- Tests: no existing test beside these files · new: logic test: command includes CLAUDE_CONFIG_DIR
- Model: Opus low · risk: low - shell quoting for paths with spaces · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### P-09-2 Provider rows: status sentence, checking state, Update available, Update all, Checked ago

- Findings: F-09-10, F-09-12, F-09-13, F-09-14, F-13-19 · ~155 lines · wave 0 · depends on: none
- Files: `components/settings/ProviderInstanceCard.tsx`, `components/settings/ProviderSettingsPanel.tsx`
- Before: `settings-providers-default-{dark,light}-1440x900.png`; cited `09-providers-antigravity-detail-light-1440x900.png`, `09-providers-muse-code-detail-light-1440x900.png` (+2) · After: `screens/P-09-2/` same names
- Accept: Status sentence sits under the name, not in the Display name row; "checking" is neutral; Update available is a labelled control; Update all is labelled with its scope; "Checked N ago" survives phone widths.
- Tests: `vp test run apps/web/src/components/settings/ProviderInstanceCard.test.ts apps/web/src/components/settings/ProviderSettingsPanel.logic.test.ts apps/web/src/components/settings/ProviderSettingsPanel.environment.browser.test.tsx apps/web/src/components/settings/providerStatus.test.ts` · `vp lint apps/web/src/components/settings/ProviderInstanceCard.tsx apps/web/src/components/settings/ProviderSettingsPanel.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `ProviderSettingsPanel.environment.browser.test.tsx` may assert the old text location · upstream: yes: fix-shaped, no #24865 overlap; bundle: 5 carve-out PRs possible · #24865: independent

##### P-09-3 Model picker for unavailable providers: Disable all, update link, pane heading

- Findings: F-09-24, F-09-26, F-09-27 · ~190 lines · wave 0 · depends on: none
- Files: `components/chat/ModelPickerContent.tsx`, `components/chat/ModelPickerSidebar.tsx`, `components/settings/ProviderModelsSection.tsx`, `routes/_chat.settings.providers.tsx`, `pkg:client-runtime/src/providerUpdateRequiredModels.ts`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `09-model-picker-cursor-unavailable-dark-1440x900.png` · After: `screens/P-09-3/` same names
- Accept: "Disable all" says it hides models; the update link selects the provider; an unavailable provider pane has a heading and focusable rail.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/ModelPickerContent.tsx apps/web/src/components/chat/ModelPickerSidebar.tsx apps/web/src/components/settings/ProviderModelsSection.tsx apps/web/src/routes/_chat.settings.providers.tsx ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/client-runtime typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - copy only · upstream: yes: fix-shaped, no #24865 overlap; bundle: 2 carve-out PRs possible · #24865: independent
- Note: Follow-up sweep F-09-24: hidden-model gating is also enforced server-side; UI wording only here.

##### P-09-4 Two accounts of one driver are distinguishable

- Findings: F-09-29 · ~160 lines · wave 0 · depends on: none
- Files: `components/usage/UsageLimitsPooled.tsx`
- Before: `settings-providers-default-{dark,light}-1440x900.png`; cited `09-model-picker-two-claude-light-1440x900.png`, `09-thread-claude-logged-out-light-1440x900.png` · After: `screens/P-09-4/` same names
- Accept: Account label is visible at body size on list rows and in the picker.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/usage/UsageLimitsPooled.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - touches `providerInstances.ts` badge logic · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### P-09-5 Limited banner and recovery: readable time, button labels, setting names

- Findings: F-09-38, F-09-39 · ~110 lines · wave 1 · depends on: #24865
- Files: `mobile:src/features/settings/SettingsThreadsRouteScreen.tsx`, `components/settings/SettingsPanels.tsx`, `components/settings/settingsSearch.ts`
- Before: `usage-default-{dark,light}-1440x900.png` · After: `screens/P-09-5/` same names
- Accept: Banner shows a local short time; buttons say "Resume after usage limits"; a scheduled resume shows its time.
- Tests: `vp test run apps/web/src/components/settings/SettingsPanels.logic.test.ts apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/mobile/src/features/settings/SettingsThreadsRouteScreen.tsx apps/web/src/components/settings/SettingsPanels.tsx apps/web/src/components/settings/settingsSearch.ts` · `vp run --filter @t3tools/mobile typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - the banner has no test · upstream: yes, after #24865 merges · #24865: rebase after merge: SettingsThreadsRouteScreen.tsx, SettingsPanels.tsx, settingsSearch.ts

##### P-11-1 Pairing form: distinct token errors, auto-capitalise, focus, no echoed token

- Findings: F-11-02 (P1), F-11-04, F-11-03 (P1), F-11-05, F-11-06 · ~195 lines · wave 0 · depends on: none
- Files: `components/auth/PairingRouteSurface.tsx`, `server:auth/PairingGrantStore.ts`, `components/auth/ConnectAgentSurface.tsx`, `components/cloud/ConnectCliAuthSurface.tsx`, `components/settings/AddEnvironmentDialog.tsx`, `components/ui/standalone-page.tsx` (+1)
- Before: `settings-connections-default-{dark,light}-1440x900.png`; cited `11-pair-invalid-token-light-1440x900.png`, `11-pair-consumed-token-light-1440x900.png` (+4) · After: `screens/P-11-1/` same names
- Accept: Mistyped, consumed and expired tokens each say so; the code field capitalises; focus returns to the field on failure; link tokens are not echoed.
- Tests: `vp test run apps/server/src/auth/PairingGrantStore.test.ts` · `vp lint apps/web/src/components/auth/PairingRouteSurface.tsx apps/server/src/auth/PairingGrantStore.ts apps/web/src/components/auth/ConnectAgentSurface.tsx apps/web/src/components/cloud/ConnectCliAuthSurface.tsx ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter t3 typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - any test asserting the old string (grep `Invalid pairing token`: none found outside `auth.ts`) · upstream: yes: fix-shaped, no #24865 overlap; bundle: 5 carve-out PRs possible · #24865: independent

##### P-11-2 /pair, hosted pairing and guest pages: brand, guidance, one error voice

- Findings: F-11-01, F-11-09, F-11-10 · ~125 lines · wave 0 · depends on: none
- Files: `components/T3Wordmark.tsx`, `components/auth/PairingRouteSurface.tsx`, `components/guest/GuestPage.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `11-bare-origin-light-1440x900.png`, `11-guest-none-light-1440x900.png` (+3) · After: `screens/P-11-2/` same names
- Accept: /pair says how to get a token; hosted page drops "Backend" and CORS jargon; guest pages carry brand and sharer.
- Tests: `vp test run apps/web/src/components/guest/GuestPage.browser.test.tsx` · `vp lint apps/web/src/components/T3Wordmark.tsx apps/web/src/components/auth/PairingRouteSurface.tsx apps/web/src/components/guest/GuestPage.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - string-only plus one import · upstream: yes: copy fix, one component; bundle: 3 carve-out PRs possible · #24865: independent

##### P-11-3 Auth and guest pages join the design system

- Findings: F-11-08, F-11-11 · ~215 lines · wave 2 · depends on: T3, T2
- Files: `components/chat/ComposerSurface.tsx`, `components/ui/menu.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `11-bare-origin-light-1440x900.png`, `11-connect-agent-bare-light-1440x900.png` · After: `screens/P-11-3/` same names
- Accept: No gradients, literal hex or `shadow-2xl` on auth pages; guest composer reuses the 22 px composer recipe.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/ComposerSurface.tsx apps/web/src/components/ui/menu.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `StandalonePage` also renders `RootRouteErrorView` and the not-found view (visual change there) · upstream: no: visual restyle; propose in Ideas first · #24865: rebase after merge: ComposerSurface.tsx, menu.tsx

##### P-11-4 Opening a pairing link in a paired browser asks before revoking

- Findings: F-11-07 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `environments/primary/auth.ts`, `routes/__root.tsx`, `routes/pair.tsx`
- Before: `settings-connections-default-{dark,light}-1440x900.png` · After: `screens/P-11-4/` same names
- Accept: A paired browser shows a confirm step naming the session that will be replaced; no silent revoke.
- Tests: `vp test run apps/web/src/environments/primary/httpLayer.test.ts` · `vp lint apps/web/src/environments/primary/auth.ts apps/web/src/routes/__root.tsx apps/web/src/routes/pair.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: redeem guard on paired session
- Model: Opus medium · risk: med - `authGateState` is read by `__root.tsx` and `routes/pair.tsx` · upstream: yes: focused, fix-shaped; touches auth.ts glue only, no server change · #24865: independent

##### P-11-5 Owner guest dialog and MCP URL discoverability

- Findings: F-11-12, F-11-15 · ~110 lines · wave 1 · depends on: none
- Files: `components/chat/GuestShareControls.tsx`, `components/settings/ConnectionsSettings.tsx`, `components/settings/SavedEnvironmentRows.tsx`, `components/settings/settingsSearch.ts`
- Before: `settings-connections-default-{dark,light}-1440x900.png`; cited `11-primary-env-menu-light-1440x900.png` · After: `screens/P-11-5/` same names
- Accept: Guest dialog keeps the link and expiry visible; "Stop sharing" state is accurate; the MCP URL is discoverable on a single machine (#17216).
- Tests: `vp test run apps/web/src/components/settings/ConnectionsSettings.logic.test.ts apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/web/src/components/chat/GuestShareControls.tsx apps/web/src/components/settings/ConnectionsSettings.tsx apps/web/src/components/settings/SavedEnvironmentRows.tsx apps/web/src/components/settings/settingsSearch.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - no tests cover the dialog (needs the T3 Connect fixture) · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: settingsSearch.ts

##### P-12-1 MCP app approval dialog shows arguments in monospace with indentation

- Findings: F-12-06 (P1) · ~55 lines · wave 0 · depends on: none
- Files: `pkg:contracts/src/ipc.ts`
- Before: `thread-claude-tools-default-{dark,light}-1440x900.png` · After: `screens/P-12-1/` same names
- Accept: Tool arguments render in the mono font with preserved indentation and wrap.
- Tests: no existing test beside these files · `vp lint packages/contracts/src/ipc.ts` · `vp run --filter @t3tools/contracts typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `confirmDialog.test.ts` and `localApi.test.ts` cover the host state machine · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### P-12-2 Slow-request toast and notification settings

- Findings: F-12-20, F-12-22 · ~110 lines · wave 1 · depends on: none
- Files: `components/ThreadNotificationCoordinator.tsx`, `components/settings/NotificationSettings.tsx`, `rpc/requestLatencyState.ts`, `pkg:contracts/src/settings.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/P-12-2/` same names
- Accept: Slow-request toast names the action and offers a next step; sound can be tested; mode names are unambiguous.
- Tests: `vp test run apps/web/src/components/ThreadNotificationCoordinator.logic.test.ts packages/contracts/src/settings.test.ts` · `vp lint apps/web/src/components/ThreadNotificationCoordinator.tsx apps/web/src/components/settings/NotificationSettings.tsx apps/web/src/rpc/requestLatencyState.ts packages/contracts/src/settings.ts` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/contracts typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - no test for the coordinator · upstream: no: the in-app row lives in `SettingsPanels.tsx`; `NotificationSettings.tsx` alone is eligible · #24865: rebase after merge: settings.ts

##### P-13-1 Startup payload: split the 2.47 MB gz entry

- Findings: F-13-09 · ~420 lines · wave 0 · depends on: none
- Files: `components/chat/UserMessageContextChips.tsx`, `components/diffs/StyledDiffCodeView.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png` · After: `screens/P-13-1/` same names
- Accept: Cold-load transferred JS drops materially with no preload regression (measure on a production build, Fast 3G).
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/UserMessageContextChips.tsx apps/web/src/components/diffs/StyledDiffCodeView.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - React Compiler coverage test, route-level lazy loading creating new waterfalls · upstream: yes: fix-shaped, no #24865 overlap (split first: over 300 lines) · #24865: independent
- Note: Perf change: needs a before/after trace, not only screenshots.

##### P-13-2 Command palette results do not re-sort after message search returns

- Findings: F-13-18 · ~160 lines · wave 0 · depends on: none
- Files: `components/CommandPalette.logic.ts`
- Before: `command-palette-default-{dark,light}-1440x900.png` · After: `screens/P-13-2/` same names
- Accept: Result order is stable once shown; message hits append under their own heading.
- Tests: `vp test run apps/web/src/components/CommandPalette.logic.test.ts` · `vp lint apps/web/src/components/CommandPalette.logic.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `CommandPalette.logic.test.ts` ordering tests · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: Follow-up sweep: the premise (two re-sorts) needs a live trace before any code.

##### P-14-1 A closed window stays closed after a backend restart; links reopen it

- Findings: F-14-02 (P1), F-14-04 · ~70 lines · wave 0 · depends on: none
- Files: `desktop:src/app/DesktopClerk.ts`, `desktop:src/app/DesktopWebLinks.ts`, `desktop:src/window/DesktopWindow.ts`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-1/` same names + Electron capture via CDP (:9222)
- Accept: After a backend restart no window is re-created or focused; a link handed to a closed-window app opens the window (#24101).
- Tests: `vp test run apps/desktop/src/app/DesktopClerk.test.ts apps/desktop/src/app/DesktopWebLinks.test.ts apps/desktop/src/window/DesktopWindow.test.ts` · `vp lint apps/desktop/src/app/DesktopClerk.ts apps/desktop/src/app/DesktopWebLinks.ts apps/desktop/src/window/DesktopWindow.ts` · `vp run --filter @t3tools/desktop typecheck` · new: logic test: restart does not create a window
- Model: Opus low · risk: low - `DesktopWindow.test.ts` (1084 lines) has window-creation and backend-ready cases to extend · upstream: yes: focused bug fix for an open issue · #24865: independent

##### P-14-2 Desktop startup shows a window or a clear error

- Findings: F-14-03 (P1), F-14-20 · ~110 lines · wave 0 · depends on: none
- Files: `desktop:src/app/DesktopApp.ts`, `desktop:src/backend/DesktopBackendPool.ts`, `desktop:src/window/DesktopWindow.ts`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-2/` same names + short .webm of the timing, Electron capture via CDP (:9222)
- Accept: A splash shows within 1 s; fatal startup errors read as one short sentence plus a "Show details" disclosure.
- Tests: `vp test run apps/desktop/src/backend/DesktopBackendPool.test.ts apps/desktop/src/window/DesktopWindow.test.ts apps/desktop/src/window/DesktopApplicationMenu.test.ts` · `vp lint apps/desktop/src/app/DesktopApp.ts apps/desktop/src/backend/DesktopBackendPool.ts apps/desktop/src/window/DesktopWindow.ts` · `vp run --filter @t3tools/desktop typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `DesktopWindow.test.ts` mocks the splash · upstream: yes: reliability fix, small; bundle: 2 carve-out PRs possible · #24865: independent

##### P-14-3 Closing the last window on Windows and Linux asks before quitting the backend

- Findings: F-14-01 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `desktop:src/ipc/channels.ts`, `desktop:src/window/DesktopWindow.ts`, `AppRoot.tsx`, `state/threads.ts`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-3/` same names + Electron capture via CDP (:9222)
- Accept: Close shows a confirm naming running threads; macOS behaviour unchanged (#10161).
- Tests: `vp test run apps/desktop/src/window/DesktopWindow.test.ts apps/web/src/state/threads.test.ts` · `vp lint apps/desktop/src/ipc/channels.ts apps/desktop/src/window/DesktopWindow.ts apps/web/src/AppRoot.tsx apps/web/src/state/threads.ts` · `vp run --filter @t3tools/desktop typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - New IPC channel plus contract surface in `packages/contracts/src/ipc.ts` · upstream: no: behaviour change tied to the open #10161 product discussion, needs maintainer approval of direction · #24865: independent
- Note: Product call: needs maintainer decision.

##### P-14-4 Settings modal clears traffic lights and caption buttons; HTML preview clears native controls

- Findings: F-14-05, F-14-06 · ~30 lines · wave 1 · depends on: none
- Files: `components/AppRouteModal.tsx`, `index.css`, `lib/windowControlsOverlay.ts`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-4/` same names + Electron capture via CDP (:9222)
- Accept: Modal header offsets by `--native-titlebar-height` at 840-1023 px and large zoom (BORROW #24581).
- Tests: no existing test beside these files · `vp lint apps/web/src/components/AppRouteModal.tsx apps/web/src/index.css apps/web/src/lib/windowControlsOverlay.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Other users of `AppRouteModal` (Usage) change identically · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: index.css

##### P-14-5 Update flow: errors visible, downgrade stated, labelled affordance, notes on stable

- Findings: F-12-19, F-14-07, F-14-08, F-14-09, F-14-10 · ~275 lines · wave 1 · depends on: none
- Files: `components/desktopUpdate.logic.ts`, `components/sidebar/SidebarUpdatePill.tsx`, `desktop:src/updates/releaseNotes.ts`, `components/desktopUpdate.toast.tsx`, `components/settings/SnapShotSettings.tsx`, `components/settings/settingsLayout.tsx` (+2)
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-5/` same names + Electron capture via CDP (:9222)
- Accept: About shows update errors; switching track states a downgrade; sidebar update control is labelled in the update colour; downloaded toast has an action (BORROW #23956 stray dot).
- Tests: `vp test run apps/web/src/components/desktopUpdate.logic.test.ts apps/desktop/src/updates/releaseNotes.test.ts apps/web/src/components/settings/SnapShotSettings.logic.test.ts apps/web/src/components/sidebar/SidebarProviderUpdatePill.browser.test.tsx` · `vp lint apps/web/src/components/desktopUpdate.logic.ts apps/web/src/components/sidebar/SidebarUpdatePill.tsx apps/desktop/src/updates/releaseNotes.ts apps/web/src/components/desktopUpdate.toast.tsx ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/desktop typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `desktopUpdate.logic` tests · upstream: no: `SidebarUpdatePill.tsx` is shared with area 14; coordinate, the toast file alone is eligible · #24865: rebase after merge: settingsLayout.tsx, index.css

##### P-14-6 Hold-to-quit overlay shows progress and is announced

- Findings: F-14-12, F-14-13 · ~70 lines · wave 1 · depends on: none
- Files: `desktop:src/window/QuitHold.ts`, `components/QuitHoldOverlay.tsx`, `components/chat/OpenInPicker.tsx`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-6/` same names + short .webm of the timing, Electron capture via CDP (:9222)
- Accept: The overlay shows a 1.2 s progress cue and `role="status"` text.
- Tests: `vp test run apps/desktop/src/window/QuitHold.test.ts apps/web/src/components/chat/OpenInPicker.browser.test.tsx` · `vp lint apps/desktop/src/window/QuitHold.ts apps/web/src/components/QuitHoldOverlay.tsx apps/web/src/components/chat/OpenInPicker.tsx` · `vp run --filter @t3tools/desktop typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `QuitHold.test.ts` (163 lines) covers the state machine, none of the overlay · upstream: no: new feedback behaviour; the hold overlay shipped recently and is an owner design · #24865: rebase after merge: OpenInPicker.tsx

##### P-14-7 Native menu: thread, project, panel and navigation commands; Help menu

- Findings: F-14-16, F-14-17 · ~215 lines · wave 0 · depends on: none
- Files: `desktop:src/window/DesktopApplicationMenu.ts`, `components/desktopUpdate.logic.ts`, `routes/_chat.tsx`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-7/` same names + Electron capture via CDP (:9222)
- Accept: Menu exposes the top 10 commands with accelerators; Help has docs, release notes and shortcuts.
- Tests: `vp test run apps/desktop/src/window/DesktopApplicationMenu.test.ts apps/web/src/components/desktopUpdate.logic.test.ts` · `vp lint apps/desktop/src/window/DesktopApplicationMenu.ts apps/web/src/components/desktopUpdate.logic.ts apps/web/src/routes/_chat.tsx` · `vp run --filter @t3tools/desktop typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Duplicate firing if an accelerator is both registered natively and handled by the renderer: the reason... · upstream: no: new feature surface, needs maintainer approval · #24865: independent

##### P-14-8 Windows and Linux menu bar: visible commands in the palette

- Findings: F-14-18 · ~160 lines · wave 1 · depends on: none
- Files: `desktop:src/window/DesktopWindow.ts`, `components/CommandPalette.logic.ts`, `components/settings/settingsSearch.ts`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-8/` same names + Electron capture via CDP (:9222)
- Accept: Auto-hidden menu bar users reach the same actions from the palette.
- Tests: `vp test run apps/desktop/src/window/DesktopWindow.test.ts apps/web/src/components/CommandPalette.logic.test.ts apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/desktop/src/window/DesktopWindow.ts apps/web/src/components/CommandPalette.logic.ts apps/web/src/components/settings/settingsSearch.ts` · `vp run --filter @t3tools/desktop typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - New bridge method (contract change in `packages/contracts/src/ipc.ts`) · upstream: no: changes menu-bar visibility on Windows and Linux; maintainer call · #24865: rebase after merge: settingsSearch.ts

##### P-14-9 Desktop small fixes: SnapShot GNOME text, Open-in default editor

- Findings: F-14-23, F-14-26 · ~70 lines · wave 1 · depends on: none
- Files: `components/settings/SnapShotSettings.tsx`, `components/settings/SnapShotSetupDialog.tsx`, `components/ui/menu.tsx`, `editorLabels.ts`, `pkg:contracts/src/keybindings.ts`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/P-14-9/` same names + Electron capture via CDP (:9222)
- Accept: GNOME instruction names a real action; Open-in menu marks the default editor.
- Tests: `vp test run apps/web/src/components/settings/SnapShotSettings.logic.test.ts apps/web/src/components/settings/SnapShotSetupDialog.logic.test.ts packages/contracts/src/keybindings.test.ts` · `vp lint apps/web/src/components/settings/SnapShotSettings.tsx apps/web/src/components/settings/SnapShotSetupDialog.tsx apps/web/src/components/ui/menu.tsx apps/web/src/editorLabels.ts ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/contracts typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Linux GNOME only · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: menu.tsx
- Note: Absorbs BORROW #23141 (in-app browser closes host menus).

##### P-21-1 Keyboard shortcuts palette action and `?` help

- Findings: F-21-01 (P1) · ~160 lines · wave 1 · depends on: none
- Files: `components/CommandPalette.tsx`, `components/chat/useChatShortcuts.ts`, `components/settings/settingsSearch.ts`
- Before: `command-palette-default-{dark,light}-1440x900.png` · After: `screens/P-21-1/` same names
- Accept: "Keyboard shortcuts" opens the keybindings page from the palette; `?` with nothing focused no longer types into the composer.
- Tests: `vp test run apps/web/src/components/CommandPalette.logic.test.ts apps/web/src/components/chat/useChatShortcuts.browser.test.tsx apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/web/src/components/CommandPalette.tsx apps/web/src/components/chat/useChatShortcuts.ts apps/web/src/components/settings/settingsSearch.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - new id goes into `STATIC_KEYBINDING_COMMANDS` (contracts) and `DEFAULT_KEYBINDINGS` (shared) · upstream: no: the `?` command needs maintainer approval; part (1), the palette action alone, is yes · #24865: rebase after merge: settingsSearch.ts
- Note: Part (1) palette action alone is upstream-eligible.

##### P-21-2 Visible palette entry and shortcut tooltips on the sidebar footer

- Findings: F-21-02, F-01-15 · ~30 lines · wave 1 · depends on: none
- Files: `desktop:src/window/DesktopApplicationMenu.ts`, `components/LegacySidebar.tsx`, `components/Sidebar.tsx`, `components/sidebar/SidebarChrome.tsx`, `components/sidebar/SidebarThreadHeader.tsx`, `pkg:shared/src/keybindings.ts`
- Before: `home-default-{dark,light}-1440x900.png`; cited `21-new-thread-tooltip-web-dark-1440x900.png` · After: `screens/P-21-2/` same names
- Accept: Sidebar offers a visible palette control; footer tooltips show bound chords including Settings on web.
- Tests: `vp test run apps/desktop/src/window/DesktopApplicationMenu.test.ts apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/desktop/src/window/DesktopApplicationMenu.ts apps/web/src/components/LegacySidebar.tsx apps/web/src/components/Sidebar.tsx apps/web/src/components/sidebar/SidebarChrome.tsx ...` · `vp run --filter @t3tools/desktop typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - field width at the 22rem sidebar minimum · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: Sidebar.tsx

##### P-21-3 Palette lists searchable commands for bound chords

- Findings: F-21-03 · ~160 lines · wave 0 · depends on: none
- Files: `components/CommandPalette.tsx`
- Before: `command-palette-default-{dark,light}-1440x900.png`; cited `21-palette-empty-query-dark-1440x900.png` · After: `screens/P-21-3/` same names
- Accept: ">sidebar", ">terminal", ">diff", ">settle", ">model" return rows.
- Tests: `vp test run apps/web/src/components/CommandPalette.logic.test.ts` · `vp lint apps/web/src/components/CommandPalette.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - handlers live in mounted ChatView hooks · upstream: no: new palette surface · #24865: independent

##### P-21-4 One shortcut hint renderer; context menu shows its shortcuts

- Findings: F-21-04, F-02-22 · ~215 lines · wave 1 · depends on: #24865
- Files: `components/ui/tooltip.tsx`, `contextMenuFallback.ts`
- Before: `home-default-{dark,light}-1440x900.png`, `command-palette-default-{dark,light}-1440x900.png`; cited `21-new-thread-tooltip-web-dark-1440x900.png`, `02-thread-list-settle-tooltip-dark-1440x900.png` · After: `screens/P-21-4/` same names
- Accept: Tooltips, menus, palette and aria-labels share one renderer; `ContextMenuItem` gains `shortcut`; chords are not baked into aria-labels.
- Tests: `vp test run apps/web/src/contextMenuFallback.test.ts` · `vp lint apps/web/src/components/ui/tooltip.tsx apps/web/src/contextMenuFallback.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - tests that query tooltip text containing "(⌘J)" (`ChatView.browser.test.tsx`, palette tests) · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### P-21-5 Web stops advertising browser-reserved chords

- Findings: F-21-05, F-06-05 (P1) · ~215 lines · wave 0 · depends on: none
- Files: `components/ThreadTerminalDrawer.tsx`, `components/settings/KeybindingsSettings.tsx`, `keybindings.ts`, `pkg:shared/src/keybindings.ts`
- Before: `home-default-{dark,light}-1440x900.png`; cited `21-palette-empty-query-dark-1440x900.png` · After: `screens/P-21-5/` same names
- Accept: Web hints and bindings omit Cmd+N, W, T, Shift+T on browsers that swallow them; desktop unchanged.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/keybindings.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/components/settings/KeybindingsSettings.tsx apps/web/src/keybindings.ts packages/shared/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/shared typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `keybindings.json` migration for "late defaults" (`apps/server/src/keybindings.ts` is server · upstream: no: new defaults · #24865: independent

##### P-21-6 Thread previous/next and jumps work below 768 px; web jump docs

- Findings: F-21-07, F-21-06 · ~110 lines · wave 0 · depends on: none
- Files: `keybindings.ts`, `routes/_chat.tsx`, `pkg:shared/src/keybindings.ts`
- Before: `home-default-{dark,light}-390x844.png` · After: `screens/P-21-6/` same names
- Accept: At 390x844 thread prev/next works with the sheet closed; docs scope the iPad-only section.
- Tests: `vp test run apps/web/src/keybindings.test.ts` · `vp lint apps/web/src/keybindings.ts apps/web/src/routes/_chat.tsx packages/shared/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/shared typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `orderedThreadKeys` is built inside `Sidebar` today (filters, shelves, collapsed groups) · upstream: no: new defaults · #24865: independent

##### P-21-7 Windows and Linux terminal keeps Ctrl+W, D, N, B

- Findings: F-21-08 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `keybindings.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-21-7/` same names
- Accept: Terminal receives Ctrl+W/D/N/B; app chords use alternates there.
- Tests: `vp test run apps/web/src/keybindings.test.ts` · `vp lint apps/web/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - `isMac` and the setting are new contract fields · upstream: no: changes terminal defaults; maintainer call · #24865: independent
- Note: Keymap change: needs maintainer approval.

##### P-21-8 OS and layout chord hijacks: German "+", usage chords, desktop browser tab chords

- Findings: F-21-10, F-21-12, F-21-13 · ~125 lines · wave 0 · depends on: none
- Files: `keybindings.ts`, `components/files/BrowserDocumentFrame.tsx`, `components/usage/UsagePage.tsx`, `components/usage/usageShortcuts.ts`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/P-21-8/` same names + Electron capture via CDP (:9222)
- Accept: Ctrl/Cmd + "+" zooms on German layouts; usage period chords avoid OS screenshot hotkeys; browser tab forwards the four plus documented chords. F-21-13 is P1 if the Cmd+Q probe reproduces.
- Tests: `vp test run apps/web/src/keybindings.test.ts` · `vp lint apps/web/src/keybindings.ts apps/web/src/components/files/BrowserDocumentFrame.tsx apps/web/src/components/usage/UsagePage.tsx apps/web/src/components/usage/usageShortcuts.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `keybindings.test.ts` physical-fallback cases · upstream: yes: #15954 is the same family; bundle: 3 carve-out PRs possible · #24865: independent
- Note: F-21-13 severity P2 -> P1 pending the live probe.

##### P-21-9 Escape follows one rule

- Findings: F-21-14 · ~55 lines · wave 0 · depends on: none
- Files: (audit names no file; locate from the finding Evidence)
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/P-21-9/` same names
- Accept: Modals return focus to the opener; right panel Esc closes the panel; documented in the keybindings docs.
- Tests: no existing test beside these files · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `finalFocus` was disabled on purpose to avoid a focus ring on the opener (comment at... · upstream: no: focus behaviour change · #24865: independent

##### P-21-10 Send key is stated and labelled (ADOPT #22436)

- Findings: F-21-15 · ~55 lines · wave 1 · depends on: #24865
- Files: `composer-logic.ts`
- Before: `new-thread-default-{dark,light}-1440x900.png` · After: `screens/P-21-10/` same names
- Accept: Composer states which key sends; Send setting labels are unambiguous; tooltip shows the platform modifier.
- Tests: `vp test run apps/web/src/composer-logic.test.ts` · `vp lint apps/web/src/composer-logic.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - send-button tooltip tests · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)
- Note: Code from #22436 by `UtkarshUsername`.

##### P-22-1 Perf budget for the 1 MB message: bench and long-task gate

- Findings: F-22-01 (P1) · ~90 lines (adjusted from 160) · wave 2 · depends on: E-6
- Files: `performance.bench.ts`
- Before: `thread-huge-output-default-{dark,light}-1440x900.png` · After: `screens/P-22-1/` same names
- Accept: After E-6, "Load earlier turns" on the 1 MB fixture shows no single long task over 200 ms at prod 1x (600 ms at 4x) and under 15,000 nodes until expanded, enforced by `performance.bench.ts`; until E-6, the divider button is disabled and shows `Spinner size="sm"` while loading.
- Tests: no existing test beside these files · `vp lint apps/web/src/performance.bench.ts` · `vp run --filter @t3tools/web typecheck` · new: bench: long-task and node budgets on the 1 MB fixture
- Model: Opus low · risk: low - find-in-thread, citations, copy (see F-03-04) · upstream: no: `ChatMarkdown.tsx` is a #24865 file (audit); the bench file alone is eligible after E-6 · #24865: independent
- Note: Same fix as F-03-04 (carried by E-6); this chunk is the budget and the bench. Measured prod 1x: 851 ms to rows, 3 long tasks totalling 1.65-1.74 s, nodes 4,136 to 103,370.

##### P-22-2 Thread switch paints header and composer before the timeline

- Findings: F-22-02 · ~55 lines · wave 1 · depends on: none
- Files: `components/ChatView.tsx`, `components/Sidebar.tsx`
- Before: `home-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-22-2/` same names
- Accept: At prod 4x CPU, click event duration <= 100 ms and header update <= 120 ms for every thread switch (prod 1x unchanged); the previous timeline stays dimmed or the F-13-08 skeleton shows until the new one commits; the 400 ms `useDelayedStatus` banner stays.
- Tests: `vp test run apps/web/src/components/ChatView.logic.test.ts apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/ChatView.tsx apps/web/src/components/Sidebar.tsx` · `vp run --filter @t3tools/web typecheck` · new: browser test: header and composer paint before the timeline commits
- Model: Opus low · risk: low - stale-timeline flash between highlight and commit (pair with F-13-08 skeleton) · upstream: yes, after #24865 merges · #24865: rebase after merge: Sidebar.tsx
- Note: Measured prod 4x: click event 280 ms, long task 248 ms, header at 237 ms. Pairs with S-29 (timeline skeleton).

##### P-22-3 Visited threads no longer leave a detached timeline in memory

- Findings: F-22-03 · ~55 lines · wave 1 · depends on: none
- Files: `components/chat/MessagesTimeline.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/P-22-3/` same names
- Accept: After 30 distinct threads (`detached.mjs --switches 30`): at most 2 detached `data-assistant-citation-viewport` roots, heap growth <= 4 MB, listener growth <= 100.
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts` · `vp lint apps/web/src/components/chat/MessagesTimeline.tsx` · `vp run --filter @t3tools/web typecheck` · new: browser test: mount and unmount the timeline 5 times, a WeakRef to the viewport is collected
- Model: Opus low · risk: low - any "remember scroll position" feature that relies on the retained element · upstream: yes, after #24865 merges · #24865: rebase after merge: MessagesTimeline.tsx
- Note: Locate the retainer first with a heap snapshot filtered to Detached. Measured: heap 64 to 77 MB, listeners 2,438 to 3,116 after 30 threads.

##### P-22-4 Theme switch without forced style flushes

- Findings: F-22-04 · ~55 lines · wave 1 · depends on: none
- Files: `hooks/useTheme.ts`, `index.css`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/P-22-4/` same names
- Accept: At most 2 style recalcs per switch, long task <= 40 ms at prod 1x and <= 120 ms at 4x, `getAnimations()` still 0 (DNA-M8), `meta theme-color` still matches the surface.
- Tests: `vp test run apps/web/src/themeBoot.test.ts` · `vp lint apps/web/src/hooks/useTheme.ts apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · new: logic test: browser chrome colour taken from the palette just applied
- Model: Opus low · risk: low - browser chrome colour (`meta theme-color`) must still match the surface · upstream: yes, after #24865 merges · #24865: rebase after merge: index.css
- Note: Measured prod 1x: long task 71-87 ms in 5-6 style recalcs; `syncBrowserChromeTheme` reads `getComputedStyle` right after the class toggle.

##### P-22-5 Command palette typing: memoised rows, thread items capped at 50

- Findings: F-22-05 · ~160 lines · wave 0 · depends on: none
- Files: `components/CommandPaletteResults.tsx`
- Before: `command-palette-default-{dark,light}-1440x900.png` · After: `screens/P-22-5/` same names
- Accept: <= 8 ms main thread per key at prod 1x and <= 35 ms at 4x with the 142-thread fixture; key-to-paint p95 <= 50 ms at 4x; ordering unchanged.
- Tests: `vp test run apps/web/src/components/CommandPalette.logic.test.ts` · `vp lint apps/web/src/components/CommandPaletteResults.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: item building memoised per (deferred query, source identity)
- Model: Opus medium · risk: med - `CommandPalette.logic.test.ts` ordering tests · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: Measured prod 1x: 16.8-19.5 ms per key; 4x: 69-74 ms. Pairs with P-13-2 (ordering).

### 13.7 States (33 chunks)

Loading, empty, error, confirm, offline and "lying UI" states (truthful state, reversible actions).

##### S-1 Toast stack: errors never collapse; 5 s default replaced by a policy

- Findings: F-12-01 (P1), F-12-02 (P1) · ~110 lines · wave 0 · depends on: none
- Files: `components/ui/toast.tsx`, `components/ui/toast.logic.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`, `settings-general-default-{dark,light}-1440x900.png` · After: `screens/S-1/` same names + short .webm of the timing
- Accept: Error, warning and actionable toasts never collapse behind the stack; one pure `applyToastDefaults` policy sets timeouts by tone and message length; timers pause on hover, focus and blur.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/toast.tsx apps/web/src/components/ui/toast.logic.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: toast.logic stack and timer policy
- Model: Opus low · risk: low - there is no unit test for `ui/toast.logic.ts` today · upstream: yes: fix-shaped, files untouched by #24865 · #24865: independent

##### S-2 Confirm dialog contract: named verb, consequence-matched variant, no "?" title split

- Findings: F-12-08, F-12-09, F-12-10 · ~230 lines · wave 2 · depends on: T4
- Files: `components/Sidebar.tsx`, `components/chat/useTimelineRewind.ts`, `components/settings/ScheduledTasksSettings.tsx`, `components/ui/alert-dialog.tsx`, `hooks/useThreadActionMenu.ts`, `hooks/useThreadActions.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/S-2/` same names
- Accept: "Confirm" is gone from the 36 call sites by contract (a `confirmLabel` is required); destructive variant follows consequence; one-line messages do not become 20 px titles.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts apps/web/src/hooks/useThreadActionMenu.test.ts apps/web/src/hooks/useThreadActions.test.ts apps/web/src/components/ServerUpdateAction.browser.test.tsx` · `vp lint apps/web/src/components/Sidebar.tsx apps/web/src/components/chat/useTimelineRewind.ts apps/web/src/components/settings/ScheduledTasksSettings.tsx apps/web/src/components/ui/alert-dialog.tsx ...` · `vp run --filter @t3tools/web typecheck` · new: type-level: confirmLabel required; unit test for title split
- Model: Opus medium · risk: med - `confirmDialog.test.ts`, `localApi.test.ts`, `ServerUpdateAction.browser.test.tsx` and thread action... · upstream: yes, after #24865 merges · #24865: rebase after merge: Sidebar.tsx
- Note: Follow-up sweep F-12-10: flipping two `?? true` defaults carries the variant change.

##### S-3 Undo notice: hover/focus pause, names the thread, 44 px target, 12 px text

- Findings: F-12-05 (P1), F-02-14 · ~110 lines · wave 1 · depends on: S-1, #24865
- Files: `components/sidebar/SidebarThreadUndoNotice.tsx`, `components/ui/alert.tsx`, `components/ui/kbd.tsx`, `components/ui/toast.tsx`, `hooks/showThreadUndoNotice.ts`
- Before: `home-default-{dark,light}-1440x900.png`; cited `02-thread-list-undo-notice-dark-1440x900.png` · After: `screens/S-3/` same names + short .webm of the timing
- Accept: Undo notice names the thread, pauses on hover and focus, is >= 24 px tall (44 on touch) and uses the 12 px label size.
- Tests: `vp test run apps/web/src/components/sidebar/SidebarThreadUndoNotice.browser.test.tsx apps/web/src/hooks/showThreadUndoNotice.test.ts apps/web/src/hooks/useThreadActions.undo.test.ts` · `vp lint apps/web/src/components/sidebar/SidebarThreadUndoNotice.tsx apps/web/src/components/ui/alert.tsx apps/web/src/components/ui/kbd.tsx apps/web/src/components/ui/toast.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - hooks/showThreadUndoNotice.test.ts, hooks/useThreadActions.undo.test.ts, sidebar/SidebarThreadUndoNotice · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### S-4 Clipboard failures are visible (Copy code and table over HTTP)

- Findings: F-03-11 (P1), F-12-24 · ~70 lines · wave 0 · depends on: none
- Files: `components/ui/toast.tsx`, `hooks/useCopyToClipboard.ts`
- Before: `thread-claude-markdown-default-{dark,light}-1440x900.png`; cited `03-copy-no-clipboard-api-light-1440x900.png` · After: `screens/S-4/` same names
- Accept: Copy code and Copy table work or fail loudly with an error toast without `navigator.clipboard` (HTTP over LAN); anchored failure toast uses error tone (BORROW #23679).
- Tests: `vp test run apps/web/src/hooks/useCopyToClipboard.test.ts` · `vp lint apps/web/src/components/ui/toast.tsx apps/web/src/hooks/useCopyToClipboard.ts` · `vp run --filter @t3tools/web typecheck` · new: browser test: copy without Clipboard API
- Model: Opus low · risk: low - `ChatMarkdown.browser.test.tsx` · upstream: yes: small, fix-shaped; `MarkdownCodeBlock.tsx` and `MarkdownTable.tsx` are untouched by #24865 · #24865: independent

##### S-5 Working state is truthful: no ticking timer while waiting for approval

- Findings: F-03-08 (P1) · ~100 lines (adjusted from 55) · wave 1 · depends on: none
- Files: `components/chat/MessagesTimeline.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `03-approval-pending-dark-1440x900.png` · After: `screens/S-5/` same names + short .webm of the timing
- Accept: While approval or input is pending the row reads "Waiting for approval" with no timer or shimmer; state during session start is shown (BORROW #23590).
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts apps/web/src/components/chat/MessagesTimeline.active-tools.test.ts` · `vp lint apps/web/src/components/chat/MessagesTimeline.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: work-log label for waiting states
- Model: Opus low · risk: low - `MessagesTimeline.active-tools.test.ts`, `MessagesTimeline.browser.test.tsx` · upstream: yes, after #24865 merges · #24865: rebase after merge: MessagesTimeline.tsx

##### S-6 Error boundaries: per-row and per-outlet

- Findings: F-12-07 (P1), F-03-30, F-12-27 (P3) · ~230 lines · wave 1 · depends on: none
- Files: `components/ChatMarkdown.tsx`, `components/chat/MarkdownMath.tsx`, `components/chat/MarkdownMermaidCodeBlock.tsx`, `routes/__root.tsx`, `routes/_chat.$environmentId.$threadId.tsx`, `routes/_chat.pull-requests.tsx` (+1)
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/S-6/` same names
- Accept: A throwing timeline row shows an inline error; a render error keeps the shell and navigation; the error is logged.
- Tests: `vp test run apps/web/src/components/ChatMarkdown.browser.test.tsx` · `vp lint apps/web/src/components/ChatMarkdown.tsx apps/web/src/components/chat/MarkdownMath.tsx apps/web/src/components/chat/MarkdownMermaidCodeBlock.tsx apps/web/src/routes/__root.tsx ...` · `vp run --filter @t3tools/web typecheck` · new: browser test: throwing row does not blank the app
- Model: Opus medium · risk: high - TanStack Router error boundaries reset on navigation by default · upstream: yes, after #24865 merges · #24865: rebase after merge: ChatMarkdown.tsx

##### S-7 Composer issues render as a banner above the composer

- Findings: F-12-03 (P1) · ~160 lines · wave 1 · depends on: #24865
- Files: `components/chat/useComposerAttachmentIntake.ts`
- Before: `new-thread-default-{dark,light}-1440x900.png` · After: `screens/S-7/` same names
- Accept: Attachment and send failures list all issues in a `ComposerBanner` attached to the composer (DNA-P6); the thread-level banner stays for thread errors.
- Tests: `vp test run apps/web/src/components/chat/ThreadErrorBanner.test.tsx` · `vp lint apps/web/src/components/chat/useComposerAttachmentIntake.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `chat/ThreadErrorBanner.test.tsx` and composer send tests assume attachment errors land in `threadError` · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)
- Note: Absorbs BORROW #22236, #22974, #24684, #24773.

##### S-8 Toast coverage and currency: dismissed on open, limited icon, merge-back errors

- Findings: F-12-14, F-12-15 · ~110 lines · wave 1 · depends on: S-1
- Files: `components/Sidebar.logic.ts`, `components/ThreadNotificationCoordinator.tsx`, `components/ui/toast.logic.ts`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/S-8/` same names
- Accept: Opening a thread dismisses its toasts (#20883); usage-limit toast shows the Limited icon (#24253); merge-back and disconnect failures toast.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts apps/web/src/components/ThreadNotificationCoordinator.logic.test.ts apps/web/src/components/ThreadNotificationCoordinator.badge.browser.test.tsx` · `vp lint apps/web/src/components/Sidebar.logic.ts apps/web/src/components/ThreadNotificationCoordinator.tsx apps/web/src/components/ui/toast.logic.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `ThreadNotificationCoordinator.logic.test.ts` covers the gate only · upstream: yes, after #24865 merges · #24865: independent
- Note: BORROW #24313, #24260, #23753.

##### S-9 Provider-unavailable errors name the provider and the cause

- Findings: F-09-19 (P1), F-09-21 (P1), F-20-01 (P1) · ~125 lines · wave 1 · depends on: none
- Files: `server:orchestration-v2/ThreadManagementService.ts`, `server:ws.ts`, `pkg:contracts/src/settings.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `09-thread-grok-not-installed-light-1440x900.png` · After: `screens/S-9/` same names
- Accept: No project UUID or session id in the message; error says which provider and why (not installed, signed out, disabled for project); BORROW #24147 wording.
- Tests: `vp test run apps/server/src/orchestration-v2/ThreadManagementService.test.ts apps/server/src/ws.test.ts packages/contracts/src/settings.test.ts apps/server/src/orchestration-v2/ThreadLaunchService.test.ts` · `vp lint apps/server/src/orchestration-v2/ThreadManagementService.ts apps/server/src/ws.ts packages/contracts/src/settings.ts` · `vp run --filter t3 typecheck` ; `vp run --filter @t3tools/contracts typecheck` · new: logic test: error mapping for missing instance
- Model: Opus low · risk: low - `ThreadLaunchService.test.ts:1419,2233` and `ProviderContinuationService.test.ts` assert the existing tag · upstream: yes, after #24865 merges · #24865: rebase after merge: settings.ts

##### S-10 Provider status banner: specific title, no overlap, an action

- Findings: F-09-22, F-12-35 (P3) · ~215 lines · wave 0 · depends on: none
- Files: `components/settings/ExpandableText.tsx`, `lib/observeResize.ts`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `09-thread-grok-not-installed-light-1440x900.png`, `09-thread-claude-logged-out-light-1440x900.png` · After: `screens/S-10/` same names
- Accept: Banner title names the provider and state; it never overlaps the first timeline row; every provider gets a next action.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/ExpandableText.tsx apps/web/src/lib/observeResize.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - banner lane layout is shared with `ThreadErrorBanner` · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-11 Bad saved client setting recovers instead of locking the app

- Findings: F-07-13 (P1) · ~160 lines · wave 1 · depends on: none
- Files: `desktop:src/settings/DesktopClientSettings.ts`, `components/onboarding/FirstRunGate.tsx`, `pkg:contracts/src/settings.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/S-11/` same names
- Accept: One out-of-range value drops that key to default with a notice and a "Reset settings" action; the app loads.
- Tests: `vp test run apps/desktop/src/settings/DesktopClientSettings.test.ts packages/contracts/src/settings.test.ts` · `vp lint apps/desktop/src/settings/DesktopClientSettings.ts apps/web/src/components/onboarding/FirstRunGate.tsx packages/contracts/src/settings.ts` · `vp run --filter @t3tools/desktop typecheck` ; `vp run --filter @t3tools/web typecheck` · new: logic test: schema decode per key with fallback
- Model: Opus medium · risk: high - Never reset silently · upstream: yes, after #24865 merges · #24865: rebase after merge: settings.ts

##### S-12 Keybinding config errors: short message, no repeated success toast

- Findings: F-08-34, F-12-18 · ~110 lines · wave 0 · depends on: none
- Files: `components/KeybindingsUpdateToast.logic.ts`, `routes/__root.tsx`, `server:keybindings.ts`, `components/KeybindingsConfigWarning.tsx`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/S-12/` same names
- Accept: A bad entry names the key and line; no 1,900-character dump; "Keybindings updated" fires only on external reloads.
- Tests: `vp test run apps/server/src/keybindings.test.ts` · `vp lint apps/web/src/components/KeybindingsUpdateToast.logic.ts apps/web/src/routes/__root.tsx apps/server/src/keybindings.ts apps/web/src/components/KeybindingsConfigWarning.tsx` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter t3 typecheck` · new: logic test: keybinding parse error message
- Model: Opus low · risk: low - `KeybindingsUpdateToast.logic.test.ts` asserts the message passthrough · upstream: yes: UI part · #24865: independent
- Note: Follow-up sweep: F-12-18 also needs the server to skip unchanged content on reload (server dependency).

##### S-13 Link to a deleted or unknown thread says so

- Findings: F-03-31, F-10-17 · ~30 lines · wave 0 · depends on: none
- Files: `components/ThreadRouteView.tsx`
- Before: `home-default-{dark,light}-1440x900.png`; cited `03-thread-missing-light-1440x900.png`, `10-first-run-and-empty-states-thread-not-found-light-1440x900.png` (+1) · After: `screens/S-13/` same names
- Accept: The route shows "Thread not found" with a way back; no silent draft in an unrelated project.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ThreadRouteView.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: unknown thread route
- Model: Opus low · risk: low - duplicate toasts on re-render (guard with a ref keyed by thread key) · upstream: yes: area 12 owns toast style; this is the call site · #24865: independent

##### S-14 Thinking row clears when text starts streaming

- Findings: F-03-14 · ~55 lines · wave 0 · depends on: none
- Files: `components/chat/MessagesTimeline.logic.ts`, `components/chat/TimelineWorkGroupRows.tsx`
- Before: `thread-claude-markdown-default-{dark,light}-1440x900.png`; cited `03-stream-text-with-thinking-row-light-1440x900.png` · After: `screens/S-14/` same names
- Accept: The Thinking row disappears once assistant text streams.
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.logic.test.ts apps/web/src/components/chat/MessagesTimeline.active-tools.test.ts` · `vp lint apps/web/src/components/chat/MessagesTimeline.logic.ts apps/web/src/components/chat/TimelineWorkGroupRows.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `MessagesTimeline.logic.test.ts` and `MessagesTimeline.active-tools.test.ts` expectations on row order · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-15 Claude assistant text streams: issue draft only (server)

- Findings: F-03-15 (P1) · ~0 lines (no code) · wave 0 · depends on: none
- Files: none (no code)
- Before: `thread-claude-markdown-default-{dark,light}-1440x900.png`; cited `03-claude-answer-done-light-1440x900.png` · After: `screens/S-15/` same names
- Accept: A triaged upstream issue exists (draft in 14.6); the UI needs no change and no client-side typewriter is added.
- Tests: none (no code)
- Model: Opus low · risk: low - apps/server is out of scope for UI work (non-negotiable 4) · upstream: no: apps/server change; issue draft only, no Phase 2 code · #24865: independent
- Note: Severity P2 -> P1 per the follow-up sweep; cause is `ClaudeAdapterV2.ts` (no `text_delta` case, `streaming: false` hard-coded). The UI is correct.

##### S-16 Commit row previews before it commits

- Findings: F-05-06 (P1) · ~110 lines (adjusted from 55) · wave 3 · depends on: S-2
- Files: `components/GitActionsControl.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/S-16/` same names
- Accept: The Commit row shows file count and message and asks first above 25 files; an undo path exists.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts` · `vp lint apps/web/src/components/GitActionsControl.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: commit row gate
- Model: Opus low · risk: low - heavy users like the one-click flow · upstream: yes, after #24865 merges · #24865: rebase after merge: GitActionsControl.tsx

##### S-17 Irreversible settings actions confirm: worktree cleanup, reset actions, task delete/run, delete instance

- Findings: F-08-40 (P1), F-08-17, F-08-42, F-09-15 (P1) · ~325 lines · wave 3 · depends on: S-2
- Files: `components/projectScriptEditor.tsx`, `components/settings/ProjectActionsSettings.tsx`, `components/settings/ScheduledTasksSettings.tsx`, `components/settings/StorageSettings.tsx`, `components/usage/UsageLimits.tsx`
- Before: `settings-projects-default-{dark,light}-1440x900.png`, `settings-scheduled-tasks-default-{dark,light}-1440x900.png`, `settings-providers-default-{dark,light}-1440x900.png` · After: `screens/S-17/` same names
- Accept: Each action asks with a named verb and a count; "Delete now" previews the worktrees affected.
- Tests: `vp test run apps/web/src/components/projectScriptEditor.browser.test.tsx apps/web/src/components/settings/StorageSettings.browser.test.tsx apps/web/src/components/settings/useProjectScriptSettings.browser.test.tsx` · `vp lint apps/web/src/components/projectScriptEditor.tsx apps/web/src/components/settings/ProjectActionsSettings.tsx apps/web/src/components/settings/ScheduledTasksSettings.tsx apps/web/src/components/settings/StorageSettings.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - `StorageSettings.browser.test.tsx` exists · upstream: yes: fix-shaped, no #24865 overlap (split first: over 300 lines); bundle: 3 carve-out PRs possible · #24865: independent

##### S-18 Restore device defaults touches client keys only

- Findings: F-08-01 (P1) · ~160 lines · wave 3 · depends on: S-2, #24865
- Files: `components/settings/scopedSettings.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/S-18/` same names
- Accept: Restore resets device keys; environment settings on other environments are untouched; button lists what changes.
- Tests: `vp test run apps/web/src/components/settings/scopedSettings.test.ts apps/web/src/components/settings/SettingsPanels.logic.test.ts` · `vp lint apps/web/src/components/settings/scopedSettings.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: restore scope
- Model: Opus medium · risk: med - `useSettingsRestore` is shared with the Appearance page · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### S-19 Revoke, Revoke others and server Update confirm with counts

- Findings: F-11-13 (P1), F-11-19 (P1) · ~215 lines · wave 3 · depends on: S-2
- Files: `components/settings/ConnectionsSettings.tsx`, `components/ServerUpdateAction.tsx`, `components/chat/useSystemComposerBanners.tsx`, `components/settings/AuthorizedClientsSettings.tsx`
- Before: `settings-connections-default-{dark,light}-1440x900.png`; cited `11-revoke-immediate-light-1440x1000.png`, `11-version-skew-settings-boot-service-light-1440x900.png` · After: `screens/S-19/` same names
- Accept: Revoke names the client; "Revoke others" shows the count; server Update shows running threads and "Update and restart"; mobile capsule Stop confirms (BORROW #24385).
- Tests: `vp test run apps/web/src/components/settings/ConnectionsSettings.logic.test.ts apps/web/src/components/ServerUpdateAction.browser.test.tsx` · `vp lint apps/web/src/components/settings/ConnectionsSettings.tsx apps/web/src/components/ServerUpdateAction.tsx apps/web/src/components/chat/useSystemComposerBanners.tsx apps/web/src/components/settings/AuthorizedClientsSettings.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `ConnectionsSettings` browser tests that click Revoke · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-20 Terminal lifecycle: exit status, starting, init failure, close confirm

- Findings: F-06-10, F-06-12, F-06-11 · ~270 lines · wave 3 · depends on: S-2
- Files: `components/ThreadTerminalDrawer.tsx`, `lib/terminalCloseConfirm.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/S-20/` same names
- Accept: A shell exit shows its status with Restart; "Starting" has a skeleton; init failure shows styled text with Retry; close asks only if a process runs.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/lib/terminalCloseConfirm.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/lib/terminalCloseConfirm.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - session lifecycle in `useThreadTerminalActions` · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-21 Diff panel empty and error states use `Empty` with plain copy

- Findings: F-05-19, F-10-19 · ~110 lines · wave 3 · depends on: S-23
- Files: `components/DiffPanel.tsx`, `components/RightPanelTabs.tsx`, `components/ui/empty.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `10-first-run-and-empty-states-diff-empty-light-1440x900.png`, `10-first-run-and-empty-states-diff-empty-dark-1440x900.png` · After: `screens/S-21/` same names
- Accept: No-thread, no-repo and error states use `Empty`, >=4.5:1, with "Initialize Git" and a retry.
- Tests: `vp test run apps/web/src/components/RightPanelTabs.test.tsx` · `vp lint apps/web/src/components/DiffPanel.tsx apps/web/src/components/RightPanelTabs.tsx apps/web/src/components/ui/empty.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: Copy per section 10 row 57.

##### S-22 `Empty` primitive: inline size and migration of 26 hand-rolled empty states

- Findings: F-10-25 · ~260 lines (adjusted from 160) · wave 1 · depends on: none
- Files: `components/CommandPaletteResults.tsx`, `components/DiffPanel.tsx`, `components/ThreadTerminalDrawer.tsx`, `components/chat/MessagesTimeline.tsx`, `components/pullRequest/ThreadPullRequestsPanel.tsx`, `components/ui/empty.tsx`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/S-22/` same names
- Accept: `Empty size="inline"` exists; the 26 sites migrate with no layout shift at 1440 and 390.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts` · `vp lint apps/web/src/components/CommandPaletteResults.tsx apps/web/src/components/DiffPanel.tsx apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/components/chat/MessagesTimeline.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `shadcn/no-restyle` lint enforces variant use · upstream: yes, after #24865 merges · #24865: rebase after merge: MessagesTimeline.tsx

##### S-23 Empty and no-repo states: sidebar zero states, scratch thread, Initialize Git, PR page, Git menu

- Findings: F-10-18, F-10-20, F-10-21, F-10-22, F-05-24 · ~155 lines · wave 2 · depends on: S-22
- Files: `components/GitActionsControl.tsx`, `components/ChatView.tsx`, `components/GitActionsControl.logic.ts`, `components/Sidebar.tsx`, `components/chat/ThreadDetailsPanel.tsx`, `components/pullRequest/PullRequestListEmptyState.tsx` (+2)
- Before: `home-default-{dark,light}-1440x900.png`, `pull-requests-default-{dark,light}-1440x900.png`; cited `10-first-run-and-empty-states-sidebar-zero-threads-scoped-light-1440x900.png`, `10-first-run-and-empty-states-draft-no-project-light-1440x900.png` (+6) · After: `screens/S-23/` same names
- Accept: Zero states offer an action and pass 4.5:1; scratch threads hide project-only rows; no-remote pages say so instead of blaming filters.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts apps/web/src/components/ChatView.logic.test.ts apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/GitActionsControl.tsx apps/web/src/components/ChatView.tsx apps/web/src/components/GitActionsControl.logic.ts apps/web/src/components/Sidebar.tsx ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/contracts typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Collides with #24865's `Sidebar.tsx` shelf hunks only nearby · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: GitActionsControl.tsx, Sidebar.tsx

##### S-24 Usage page states: honest loading, empty states with an action

- Findings: F-13-05 (P1), F-09-34, F-10-23 · ~165 lines · wave 2 · depends on: S-22
- Files: `components/usage/UsageLimitsPooled.tsx`, `components/usage/UsagePage.tsx`
- Before: `usage-default-{dark,light}-1440x900.png`; cited `13-usage-open-fast3g-light-1440x900-s0.png`, `09-usage-limits-empty-light-1440x900.png` (+1) · After: `screens/S-24/` same names
- Accept: Loading shows a skeleton, not "$0.00" or "No usage"; empty states have an action.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/usage/UsageLimitsPooled.tsx apps/web/src/components/usage/UsagePage.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - no test covers the pre-ready frames of `UsagePage` · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-25 Sidebar skeleton at row pitch until the snapshot arrives

- Findings: F-13-01 (P1) · ~55 lines · wave 1 · depends on: none
- Files: `components/Sidebar.tsx`, `state/entities.ts`
- Before: `home-default-{dark,light}-1440x900.png`; cited `13-coldload-slow4g-light-1440x900-t16000.png`, `13-prs-fast3g-light-1440x900-s1.png` · After: `screens/S-25/` same names
- Accept: Returning users never see "No projects yet" before the shell snapshot; skeleton rows match real row pitch.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/Sidebar.tsx apps/web/src/state/entities.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: empty state gated on snapshot
- Model: Opus low · risk: low - `Sidebar` browser tests that assert the empty state need `bootstrapped` set · upstream: yes, after #24865 merges · #24865: rebase after merge: Sidebar.tsx

##### S-26 Boot splash stays until first paint and ships a lighter logo

- Findings: F-13-02 (P1), F-13-04 (P1) · ~110 lines · wave 1 · depends on: #24865
- Files: `apps/web/index.html`, `routes/_chat.index.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `13-coldload-sheet-prod-slow4g-light-390x844-long.png`, `13-coldload-sheet-prod-slow4g-light-1440x900.png` · After: `screens/S-26/` same names + short .webm of the timing
- Accept: No blank frame between splash and app; the 114 kB PNG logo becomes an inline SVG; a static "Still loading" line appears at 4 s.
- Tests: no existing test beside these files · `vp lint apps/web/src/routes/_chat.index.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `FirstRunGate` has no component test for the pending frame · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: index.html

##### S-27 "Connecting" derives from environment phase, not a 4 s timer

- Findings: F-13-03 (P1) · ~160 lines · wave 1 · depends on: O-1
- Files: `components/chat/useSystemComposerBanners.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `13-stillconnecting-fast3g-light-1440x900.png` · After: `screens/S-27/` same names + short .webm of the timing
- Accept: Still-connecting appears only after a failed phase; slow links never show a false failure.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/useSystemComposerBanners.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: phase to status mapping
- Model: Opus medium · risk: med - `firstRun.logic` tests cover the `timeout` transition · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-28 Diff loading: skeleton, highlight placeholders, file progress

- Findings: F-13-06 (P1), F-13-14, F-13-17 · ~125 lines · wave 1 · depends on: none
- Files: `components/ChatMarkdown.tsx`, `components/DiffPanelShell.tsx`, `components/diffs/DiffFileLoadingBoundary.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `13-diff220-slow4g-light-1440x900-s1.png`, `13-threadswitch-fast3g-loading-light-1440x900.png` · After: `screens/S-28/` same names
- Accept: Diff panel shows file headers and a skeleton while highlight workers load; code blocks keep their size until Shiki loads; the sentinel names the remainder ("Loading 188 more files...").
- Tests: `vp test run apps/web/src/components/ChatMarkdown.browser.test.tsx` · `vp lint apps/web/src/components/ChatMarkdown.tsx apps/web/src/components/DiffPanelShell.tsx apps/web/src/components/diffs/DiffFileLoadingBoundary.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `DiffWorkerPoolProvider` and diff browser tests · upstream: yes, after #24865 merges; bundle: 3 carve-out PRs possible · #24865: rebase after merge: ChatMarkdown.tsx

##### S-29 Thread loading: timeline state, banner without composer shift, friendly paging error

- Findings: F-13-08 (P1), F-13-10, F-13-07 (P1) · ~125 lines · wave 1 · depends on: none
- Files: `components/chat/ChatComposer.tsx`, `components/chat/MessagesTimeline.tsx`, `components/chat/useSystemComposerBanners.tsx`, `threadSync.ts`, `pkg:client-runtime/src/state/threads.ts`
- Before: `thread-long-conversation-default-{dark,light}-1440x900.png`; cited `13-threadswitch-fast3g-loading-light-1440x900.png`, `13-history-error-light-1440x900.png` · After: `screens/S-29/` same names + short .webm of the timing
- Accept: Opening a thread shows a timeline skeleton; the sync banner does not move the composer; paging errors drop the URL and cursor.
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts` · `vp lint apps/web/src/components/chat/ChatComposer.tsx apps/web/src/components/chat/MessagesTimeline.tsx apps/web/src/components/chat/useSystemComposerBanners.tsx apps/web/src/threadSync.ts ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/client-runtime typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `MessagesTimeline.browser.test.tsx` asserts the placeholder · upstream: yes, after #24865 merges; bundle: 3 carve-out PRs possible · #24865: rebase after merge: ChatComposer.tsx, MessagesTimeline.tsx

##### S-30 Route pending feedback while a chunk loads

- Findings: F-13-13 · ~55 lines · wave 0 · depends on: none
- Files: `router.ts`, `routes/pair.tsx`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/S-30/` same names + short .webm of the timing
- Accept: Navigation to a lazy route shows a pending cue (`defaultPendingMs: 200`): the footer icon becomes a `Spinner` with `aria-busy`.
- Tests: no existing test beside these files · `vp lint apps/web/src/router.ts apps/web/src/routes/pair.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - icon swap flicker on warm chunks · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-31 Reconnect banner: Retry now, countdown, activity

- Findings: F-11-17 (P1), F-13-15 · ~110 lines · wave 0 · depends on: none
- Files: `components/chat/useSystemComposerBanners.tsx`, `components/settings/ConnectionDiagnosisDetails.tsx`
- Before: `home-default-{dark,light}-1440x900.png`; cited `11-multi-env-details-panel-light-1440x1000.png`, `13-stalled-load-both-light-1440x900.png` · After: `screens/S-31/` same names + short .webm of the timing
- Accept: Banner shows a countdown and "Retry now" (BORROW #23194); recovery no longer lags up to 5 minutes (#22024).
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/useSystemComposerBanners.tsx apps/web/src/components/settings/ConnectionDiagnosisDetails.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `useSystemComposerBanners` has browser tests for the Reconnect button (update the offline case, add... · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-32 Revoked session routes to /pair

- Findings: F-11-18 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `pkg:client-runtime/src/rpc/session.ts`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `11-session-revoked-midsession-final-light-1440x900.png`, `11-session-revoked-after-reload-light-1440x900.png` · After: `screens/S-32/` same names
- Accept: A revoked session shows "Signed out" and routes to /pair.
- Tests: `vp test run packages/client-runtime/src/rpc/session.test.ts` · `vp lint packages/client-runtime/src/rpc/session.ts` · `vp run --filter @t3tools/client-runtime typecheck` · new: logic test: revoked session handling
- Model: Opus medium · risk: med - client-runtime tests (`session.test.ts`, `supervisor.test.ts`) · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### S-33 App-level connection indicator

- Findings: F-11-16 (P1) · ~160 lines · wave 1 · depends on: none
- Files: `components/Sidebar.tsx`, `components/chat/useSystemComposerBanners.tsx`
- Before: `home-default-{dark,light}-1440x900.png`; cited `11-disconnect-close-t30s-light-1440x900.png`, `11-disconnect-settings-connections-light-1440x900.png` · After: `screens/S-33/` same names
- Accept: A connection dot with state text in the sidebar footer; machine section stops saying "Up to date" while offline.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/Sidebar.tsx apps/web/src/components/chat/useSystemComposerBanners.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - sidebar footer is area 01's surface (F-01-15, F-01-24 touch the same row) · upstream: no: new element, propose as an Ideas post first · #24865: rebase after merge: Sidebar.tsx

### 13.8 Edge cases (15 chunks)

Layout floors and content extremes: narrow panels, short windows, huge or blank content, long names, non-Latin text.

##### E-1 Chat column floor with an inline right panel

- Findings: F-01-03 (P1), F-01-11 · ~70 lines · wave 0 · depends on: none
- Files: `components/RightPanelSheet.tsx`, `components/ui/sheet.tsx`, `rightPanelLayout.ts`
- Before: `home-default-{dark,light}-1440x900.png`, `thread-codex-edits-default-{dark,light}-{1440x900,1024x640,800x600}.png`; cited `01-app-shell-sidebar-max-panel-open-light-1440x900.png`, `01-app-shell-rightpanel-open-light-800x600.png` · After: `screens/E-1/` same names
- Accept: Chat >= 360 px with an inline panel; below 720 px layout width the panel becomes a sheet and honours the saved width.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/RightPanelSheet.tsx apps/web/src/components/ui/sheet.tsx apps/web/src/rightPanelLayout.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: shouldAcceptWidth subtracts the panel
- Model: Opus low · risk: low - sidebar drag is `useResizeDrag` in `ui/sidebar.tsx:398-471` · upstream: yes: F-01-03 alone is a clean fix; F-01-11 (sheet cap) is a sizing choice and stays in the fork if the maintainer objects · #24865: independent

##### E-2 Short windows: terminal drawer and banners keep a usable chat

- Findings: F-01-12, F-04-39 · ~215 lines · wave 1 · depends on: none
- Files: `components/ThreadTerminalDrawer.tsx`, `index.css`, `terminalUiStateStore.ts`
- Before: `thread-codex-edits-default-{dark,light}-{800x600,1024x640}.png`; cited `01-app-shell-terminal-open-chat-area-light-800x600.png` · After: `screens/E-2/` same names
- Accept: Initial drawer height is `clamp(180, 0.4 * innerHeight, 280)` and persists only after a drag; approval, queue and composer banners share one height budget at 600 px tall.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/terminalUiStateStore.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/index.css apps/web/src/terminalUiStateStore.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `terminalUiStateStore.ts` writes the default into persisted state on open (`terminalHeight: 280` appears... · upstream: no: ChatComposer.tsx is a #24865 file and the drawer height is a product default; follow up after the merge · #24865: rebase after merge: index.css

##### E-3 Very long and blank titles

- Findings: F-02-08 (P1), F-02-19, F-02-15 · ~125 lines · wave 1 · depends on: none
- Files: `components/Sidebar.logic.ts`, `components/ThreadHoverCard.tsx`, `components/settings/ArchivedThreadsPanel.tsx`, `components/sidebar/SidebarThreadRow.tsx`
- Before: `settings-archived-default-{dark,light}-1440x900.png`; cited `02-thread-list-archived-long-word-dark-1440x900.png`, `02-thread-list-titles-rtl-blank-dark-1440x900.png` (+1) · After: `screens/E-3/` same names
- Accept: A 200-character single-word title wraps inside the Archive row; blank titles render a placeholder; hover card shows the full title and absolute time.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/Sidebar.logic.ts apps/web/src/components/ThreadHoverCard.tsx apps/web/src/components/settings/ArchivedThreadsPanel.tsx apps/web/src/components/sidebar/SidebarThreadRow.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `SettingsRow` is shared by every settings page · upstream: yes, after #24865 merges · #24865: rebase after merge: SidebarThreadRow.tsx

##### E-4 Window the active sidebar list

- Findings: F-02-30 · ~420 lines · wave 1 · depends on: none
- Files: `components/Sidebar.motion.ts`, `components/sidebar/SidebarThreadRow.tsx`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/E-4/` same names
- Accept: Interim: the initial active render is capped at 200 rows with "Show 25 more"; then only rows within one viewport of the scroll port mount (the dragged and route rows always mount).
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/Sidebar.motion.ts apps/web/src/components/sidebar/SidebarThreadRow.tsx` · `vp run --filter @t3tools/web typecheck` · new: browser test: row count capped
- Model: Opus medium · risk: high - dnd-kit measures droppables by mount · upstream: yes, after #24865 merges (split first: over 300 lines) · #24865: rebase after merge: SidebarThreadRow.tsx
- Note: Interim cap first, per follow-up sweep.

##### E-5 Oversize first turn shows an `Empty` state with "Load turn"

- Findings: F-03-03 (P1) · ~55 lines · wave 1 · depends on: none
- Files: `components/chat/MessagesTimeline.tsx`, `components/ui/empty.tsx`
- Before: `thread-huge-output-default-{dark,light}-1440x900.png`; cited `03-huge-initial-light-1440x900.png` · After: `screens/E-5/` same names
- Accept: Opening a thread whose only turn exceeds the bounded window shows "Load turn", not a blank list.
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts` · `vp lint apps/web/src/components/chat/MessagesTimeline.tsx apps/web/src/components/ui/empty.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `MessagesTimeline.browser.test.tsx` covers the divider · upstream: yes, after #24865 merges · #24865: rebase after merge: MessagesTimeline.tsx

##### E-6 Huge messages and code blocks are capped

- Findings: F-03-04 (P1), F-03-05 · ~320 lines · wave 1 · depends on: none
- Files: `components/chat/MarkdownCodeBlock.tsx`, `components/chat/MessagesTimeline.tsx`, `components/chat/TimelineAssistantRows.tsx`, `components/chat/TimelineUserMessageRow.tsx`, `components/chat/V2ItemInspector.tsx`, `index.css`
- Before: `thread-huge-output-default-{dark,light}-1440x900.png`; cited `03-huge-loaded-light-1440x900.png` · After: `screens/E-6/` same names
- Accept: A 1 MB message mounts <= 60 blocks plus "Show remaining"; a 5,000-line code block collapses; no 2.4 s long task.
- Tests: `vp test run apps/web/src/components/chat/MessagesTimeline.browser.test.tsx apps/web/src/components/chat/MessagesTimeline.logic.test.ts apps/web/src/components/chat/threadFindHighlights.browser.test.tsx` · `vp lint apps/web/src/components/chat/MarkdownCodeBlock.tsx apps/web/src/components/chat/MessagesTimeline.tsx apps/web/src/components/chat/TimelineAssistantRows.tsx apps/web/src/components/chat/TimelineUserMessageRow.tsx ...` · `vp run --filter @t3tools/web typecheck` · new: browser test: node count for 1 MB message
- Model: Opus medium · risk: high - find-in-thread counts, selection/citation across the boundary, copy message (must still copy the full... · upstream: no: new behaviour in `ChatMarkdown.tsx`, a #24865 file; also needs maintainer agreement, DNA-P2 · #24865: rebase after merge: MessagesTimeline.tsx, index.css

##### E-7 Reaching the start of a long thread takes one action

- Findings: F-03-07 · ~55 lines · wave 0 · depends on: none
- Files: `lib/observeResize.ts`
- Before: `thread-long-conversation-default-{dark,light}-1440x900.png` · After: `screens/E-7/` same names
- Accept: Scrolling toward the top auto-loads earlier turns (sentinel with 600 px margin, debounced, only after a user scroll-up); the button stays for keyboard users.
- Tests: no existing test beside these files · `vp lint apps/web/src/lib/observeResize.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `maintainVisibleContentPosition` jumps, citation `throughEntryId` loads, server load · upstream: no: behaviour change in `MessagesTimeline.tsx`, needs discussion first · #24865: independent

##### E-8 Diff file list edge cases: binary, whitespace-only, renamed

- Findings: F-05-02 (P1), F-05-07, F-05-10 · ~165 lines · wave 0 · depends on: none
- Files: `components/DiffPanel.tsx`, `components/files/FilePreviewPanel.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `05-diff-and-review-shapes-changes-light-1440x900.png`, `05-diff-and-review-binary-expanded-dark-1440x900.png` (+2) · After: `screens/E-8/` same names
- Accept: Binary files show size/type, not +0 -0; whitespace-only files stay listed with a note; renamed headers keep the changed part.
- Tests: `vp test run apps/web/src/components/files/FilePreviewPanel.test.ts` · `vp lint apps/web/src/components/DiffPanel.tsx apps/web/src/components/files/FilePreviewPanel.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `Badge` is a `components/ui` primitive: use an existing variant, do not restyle · upstream: yes: fix-shaped, no #24865 overlap; bundle: 3 carve-out PRs possible · #24865: independent

##### E-9 Diff comparator and toolbar adapt to narrow panels

- Findings: F-05-03 (P1), F-05-12 · ~215 lines · wave 0 · depends on: none
- Files: `components/DiffPanel.tsx`, `components/pullRequest/PullRequestCodeTab.tsx`
- Before: `thread-codex-edits-default-{dark,light}-{1440x900,800x600}.png`; cited `05-diff-and-review-empty-changes-light-1440x900.png`, `05-diff-and-review-panel-dark-800x600.png` (+1) · After: `screens/E-9/` same names
- Accept: Comparator moves to its own row; the toolbar stays labelled and usable at 335 px.
- Tests: `vp test run apps/web/src/components/pullRequest/PullRequestCodeTab.browser.test.tsx` · `vp lint apps/web/src/components/DiffPanel.tsx apps/web/src/components/pullRequest/PullRequestCodeTab.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `DiffPanelShell` is also used `embedded`/`sheet` · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### E-10 Diff and PR Code toolbars share one order and size

- Findings: F-05-13 · ~160 lines · wave 1 · depends on: E-9
- Files: `components/DiffPanel.tsx`, `components/pullRequest/PullRequestCodeTab.tsx`
- Before: `pull-requests-default-{dark,light}-1440x900.png`; cited `05-diff-and-review-seed-default-light-1440x900.png`, `05-diff-and-review-pr-code-tab-light-1440x900.png` · After: `screens/E-10/` same names
- Accept: Both toolbars hold the same controls in the same order and size.
- Tests: `vp test run apps/web/src/components/pullRequest/PullRequestCodeTab.browser.test.tsx apps/web/src/components/pullRequest/PullRequestSummaryTab.browser.test.tsx` · `vp lint apps/web/src/components/DiffPanel.tsx apps/web/src/components/pullRequest/PullRequestCodeTab.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - PR Code toolbar has `Viewed` count wiring · upstream: no: touches two large components; propose as a follow-up chunk · #24865: independent

##### E-11 Diff split, tree and explorer defaults at narrow widths

- Findings: F-05-04 (P1), F-05-11, F-05-21, F-06-09 (P1) · ~325 lines · wave 0 · depends on: none
- Files: `components/files/FilePreviewPanel.tsx`, `hooks/usePreviewPanelInlineSize.ts`, `lib/observeResize.ts`
- Before: `thread-codex-edits-default-{dark,light}-{1440x900,800x600}.png`; cited `05-diff-and-review-split-default-width-light-1440x900.png`, `05-diff-and-review-split-maximized-light-1440x900.png` (+2) · After: `screens/E-11/` same names
- Accept: Split falls back to unified under 720 px; the diff tree no longer takes a fixed 16 rem / 40%; the file explorer starts closed under 720 px.
- Tests: `vp test run apps/web/src/components/files/FilePreviewPanel.test.ts` · `vp lint apps/web/src/components/files/FilePreviewPanel.tsx apps/web/src/hooks/usePreviewPanelInlineSize.ts apps/web/src/lib/observeResize.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - `ToggleGroup` value must stay `split` while the render is unified, so the toggle looks selected but... · upstream: yes: fix-shaped, no #24865 overlap (split first: over 300 lines); bundle: 3 carve-out PRs possible · #24865: independent
- Note: Absorbs BORROW #24189 (long guide Next button).

##### E-12 Typed text survives Esc in commit-on-blur fields

- Findings: F-08-08 (P1) · ~55 lines · wave 0 · depends on: none
- Files: `hooks/useCommitOnBlur.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/E-12/` same names
- Accept: Esc or close flushes the field commit before Settings unmounts.
- Tests: no existing test beside these files · `vp lint apps/web/src/hooks/useCommitOnBlur.ts` · `vp run --filter @t3tools/web typecheck` · new: browser test: Esc commits pending field
- Model: Opus low · risk: low - Flush-on-close can commit half-typed values (an invalid worktree path) · upstream: yes: small, fix-shaped; `AppRouteModal.tsx` is not in #24865 · #24865: independent

##### E-13 Interface font size moves the layout breakpoints

- Findings: F-07-12 · ~160 lines · wave 1 · depends on: none
- Files: `components/AppRouteModal.tsx`, `components/settings/settingsLayout.tsx`
- Before: `settings-appearance-default-{dark,light}-800x600.png` · After: `screens/E-13/` same names
- Accept: At 20 px Interface font size Settings does not overflow at 800x600.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/AppRouteModal.tsx apps/web/src/components/settings/settingsLayout.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `@container` on the modal popup changes containing-block behaviour for `position: fixed` descendants... · upstream: yes, after #24865 merges · #24865: rebase after merge: settingsLayout.tsx

##### E-14 A provider turned off for a project does not silently switch the draft

- Findings: F-09-18 · ~160 lines · wave 0 · depends on: none
- Files: `components/chat/ModelPickerSidebar.tsx`, `providerInstances.ts`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `09-draft-project-claude-off-light-1440x900.png`, `09-draft-project-claude-off-picker-light-1440x900.png` · After: `screens/E-14/` same names
- Accept: The picker keeps the provider visible and disabled with a reason; the draft does not change model.
- Tests: `vp test run apps/web/src/providerInstances.test.ts` · `vp lint apps/web/src/components/chat/ModelPickerSidebar.tsx apps/web/src/providerInstances.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: draft model with disabled provider
- Model: Opus medium · risk: med - touches applyProviderInstanceSettings (providerInstances.ts:121) and isProviderInstancePickerVisible (: · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### E-15 Non-Latin text: theme ids and composer underscores

- Findings: F-07-31 · ~55 lines · wave 0 · depends on: none
- Files: `components/settings/ThemeSettings.tsx`, `themePalette.ts`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/E-15/` same names
- Accept: A second theme without Latin letters gets a unique id; composer drafts keep underscores in non-Latin names (ADOPT #22771).
- Tests: `vp test run apps/web/src/themePalette.test.ts` · `vp lint apps/web/src/components/settings/ThemeSettings.tsx apps/web/src/themePalette.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Ids are used as `data-theme-id` and CSS-variable-free storage keys only (checked `themePalette.ts`), but... · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: Code from #22771 by `yzn-h`.

### 13.9 Customisation (11 chunks)

Section 7: remembered defaults, discoverability and placement of settings that exist, and the few new settings that fit the DNA (all approval-gated).

##### C-1 Thread details visible on new threads (N1)

- Findings: F-23-02, F-01-30 (P3) · ~110 lines · wave 1 · depends on: #24865
- Files: `components/ChatView.tsx`, `components/settings/AppearanceSettingsPanel.tsx`, `pkg:contracts/src/settings.ts`, `components/settings/settingsSearch.ts`, `components/settings/SettingsPanels.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/C-1/` same names
- Accept: A device setting "Thread details on new threads" (default off, as today) opens the card on new threads; added to search and Restore labels.
- Tests: `vp test run apps/web/src/components/ChatView.logic.test.ts packages/contracts/src/settings.test.ts apps/web/src/components/settings/settingsSearch.test.ts apps/web/src/components/settings/SettingsPanels.logic.test.ts` · `vp lint apps/web/src/components/ChatView.tsx apps/web/src/components/settings/AppearanceSettingsPanel.tsx packages/contracts/src/settings.ts apps/web/src/components/settings/settingsSearch.ts ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/contracts typecheck` · new: logic test: setting reaches new thread state
- Model: Opus low · risk: low - Because the map stores only non-default entries, flipping the setting flips every thread without an entry · upstream: no: new setting, needs Ideas approval (#15119) · #24865: rebase after merge: settings.ts, AppearanceSettingsPanel.tsx are in #24865

##### C-2 Right-panel width and terminal height defaults for new threads (N2)

- Findings: F-23-03, F-01-10 · ~190 lines (adjusted from 110) · wave 0 · depends on: none
- Files: `components/ChatView.tsx`, `components/ui/sidebar.tsx`, `hooks/usePreviewPanelInlineSize.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/C-2/` same names
- Accept: New threads inherit the last width/height; double-click resets; rail titles state the reset gesture. No new setting.
- Tests: `vp test run apps/web/src/components/ChatView.logic.test.ts` · `vp lint apps/web/src/components/ChatView.tsx apps/web/src/components/ui/sidebar.tsx apps/web/src/hooks/usePreviewPanelInlineSize.ts` · `vp run --filter @t3tools/web typecheck` · new: logic test: last-used width inheritance
- Model: Opus medium · risk: med - `useResizableWidth.browser.test.tsx` (if present) and `usePreviewPanelInlineSize` tests · upstream: no: behaviour change needs prior approval; #22256 and #12395 are open. Credit the ideas · #24865: independent

##### C-3 Restore device defaults lists and resets fonts

- Findings: F-23-07 · ~60 lines (adjusted from 15) · wave 1 · depends on: #24865
- Files: `components/settings/SettingsPanels.tsx`, `routes/_chat.settings.tsx`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/C-3/` same names
- Accept: Fonts count as changed; the button enables for a font-only change; fontSmoothing resets.
- Tests: `vp test run apps/web/src/components/settings/SettingsPanels.logic.test.ts` · `vp lint apps/web/src/components/settings/SettingsPanels.tsx apps/web/src/routes/_chat.settings.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: changedSettingLabels includes fonts
- Model: Opus low · risk: low - `SettingsPanels.logic.test.ts` covers label helpers only · upstream: yes, after #24865 merges · #24865: rebase after merge: SettingsPanels.tsx

##### C-4 User docs match the shipped controls

- Findings: F-23-01 · ~90 lines (adjusted from 15) · wave 1 · depends on: #24865
- Files: `docs/user/thread-sidebar.md`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/C-4/` same names
- Accept: docs/user lists the ten undocumented Appearance controls, resizing sentence, 17 General rows.
- Tests: no existing test beside these files · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: low · upstream: yes, after #24865 merges · #24865: rebase after merge: thread-sidebar.md
- Note: Docs only; rebase after #24865 relabels.

##### C-5 Context meter: Auto, Always, Never

- Findings: F-04-40 · ~150 lines (adjusted from 55) · wave 1 · depends on: #24865
- Files: `components/chat/ChatComposer.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `04-context-meter-hover-light-1440x900@2x.png` · After: `screens/C-5/` same names
- Accept: The meter shows automatically from 70% used; the legacy switch becomes an Auto/Always/Never select (#14404).
- Tests: `vp test run apps/web/src/components/chat/ContextWindowMeter.logic.test.ts` · `vp lint apps/web/src/components/chat/ChatComposer.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: auto threshold
- Model: Opus low · risk: low - `ContextWindowMeter.logic.test.ts` · upstream: no: changes a default, needs approval · #24865: rebase after merge: ChatComposer.tsx

##### C-6 Contrast slider: floor and border lift

- Findings: F-07-26, F-16-11 · ~175 lines · wave 1 · depends on: #24865
- Files: `appearanceContrast.ts`, `components/settings/settingsLayout.tsx`, `index.css`, `components/settings/AppearanceSettingsPanel.tsx`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/C-6/` same names
- Accept: UI minimum 75 with a status line; borders reach 3:1 at 200; contract minimum stays 50.
- Tests: no existing test beside these files · `vp lint apps/web/src/appearanceContrast.ts apps/web/src/components/settings/settingsLayout.tsx apps/web/src/index.css apps/web/src/components/settings/AppearanceSettingsPanel.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Users who saved 50-70 keep it (decoded as is) until they touch the slider · upstream: no: changes an existing control range; discuss first · #24865: rebase after merge: settingsLayout.tsx, index.css, AppearanceSettingsPanel.tsx

##### C-7 Motion setting tells the truth; in-app reduce-motion override (N4)

- Findings: F-07-27, F-23-05 (P3) · ~175 lines · wave 2 · depends on: MO-1
- Files: `panelAnimations.ts`, `components/RightPanelTabs.tsx`, `components/Sidebar.motion.ts`, `components/settings/AppearanceSettingsPanel.tsx`, `index.css`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/C-7/` same names + short .webm of the timing
- Accept: Panel animations shows 0 ms and a status line when the OS flag forces it; `html[data-reduce-motion]` mirrors the media rule.
- Tests: `vp test run apps/web/src/components/RightPanelTabs.test.tsx apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/panelAnimations.ts apps/web/src/components/RightPanelTabs.tsx apps/web/src/components/Sidebar.motion.ts apps/web/src/components/settings/AppearanceSettingsPanel.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med · upstream: no: N4 is a new setting; F-07-27 alone is eligible · #24865: rebase after merge: AppearanceSettingsPanel.tsx, index.css

##### C-8 General page: regroup 16-row Behavior; device-only rows move with Diff colors

- Findings: F-08-09, F-23-09 (P3), F-23-10 (P3) · ~270 lines · wave 2 · depends on: #24865, H1
- Files: `components/settings/settingsSearch.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png`, `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/C-8/` same names
- Accept: No General section has more than 8 rows; Appearance splits into Colors, Layout, Text, Motion; search ids unchanged.
- Tests: `vp test run apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/web/src/components/settings/settingsSearch.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Anchors `#organization`, `#behavior` change · upstream: no: restructures settings pages; maintainer call · #24865: rebase after merge: settingsSearch.ts

##### C-9 Project order: Manual is arrangeable in the default sidebar

- Findings: F-08-10 · ~150 lines (adjusted from 55) · wave 1 · depends on: #24865
- Files: `components/Sidebar.tsx`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/C-9/` same names
- Accept: Choosing Manual enables drag handles in the default sidebar.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/Sidebar.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Users who already have Manual keep it · upstream: no: new interaction; needs approval · #24865: rebase after merge: Sidebar.tsx

##### C-10 Settings search finds the existing theme, motion, blur and text-size controls

- Findings: F-23-08 (P3), F-07-11 (P3), F-23-11 (P3) · ~45 lines · wave 1 · depends on: #24865
- Files: `components/settings/settingsSearch.ts`, `components/CommandPalette.tsx`, `components/LegacySidebar.tsx`, `components/Sidebar.tsx`, `components/settings/ThemeEditorPanel.tsx`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/C-10/` same names
- Accept: Searching "accent", "density", "zoom", "blur", "motion" finds the right row; legacy sort/preview settings stop leaking.
- Tests: `vp test run apps/web/src/components/settings/settingsSearch.test.ts apps/web/src/components/CommandPalette.logic.test.ts apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/settings/settingsSearch.ts apps/web/src/components/CommandPalette.tsx apps/web/src/components/LegacySidebar.tsx apps/web/src/components/Sidebar.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: low · upstream: yes, after #24865 merges · #24865: rebase after merge: settingsSearch.ts, Sidebar.tsx
- Note: Search terms only (section 7.5).

##### C-11 Message text size (N5)

- Findings: F-23-06 (P3) · ~160 lines · wave 2 · depends on: C-3, #24865
- Files: `appearanceFonts.ts`, `index.css`
- Before: `thread-claude-markdown-default-{dark,light}-1440x900.png` · After: `screens/C-11/` same names
- Accept: A chat-only size ratio scales prose, not chrome (#24461).
- Tests: no existing test beside these files · `vp lint apps/web/src/appearanceFonts.ts apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med · upstream: no: conditional on maintainer approval (Ideas #10769) · #24865: rebase after merge: appearanceFonts.ts, index.css

### 13.10 Onboarding (17 chunks)

Section 8: first-run gate, wizard, re-entry and mobile first launch. Wireframes in `ui-overhaul/spec/onboarding/01..08-*.md`.

##### O-1 First-run gate and recovery: shell with drag region, working actions, no blank frame

- Findings: F-10-05 (P1), F-10-06 (P1), F-10-09 · ~125 lines · wave 0 · depends on: none
- Files: `components/onboarding/FirstRunGate.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `10-first-run-and-empty-states-first-run-could-not-read-settings-light-1440x900.png`, `10-first-run-and-empty-states-first-run-still-connecting-light-1440x900.png` (+1) · After: `screens/O-1/` same names + short .webm of the timing
- Accept: The pending and recovery cards share `FirstRunShell` with a drag region; recovery offers "Open Connections"; spinner after 1 s.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/onboarding/FirstRunGate.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: low - No test covers the recovery cards · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### O-2 Wizard shows on first web launch; `/` opens a draft (UI half; server field is an issue)

- Findings: F-10-01 (P1), F-10-03 (P1) · ~30 lines · wave 0 · depends on: none
- Files: `server:serverRuntimeStartup.ts`, `routes/__root.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png` · After: `screens/O-2/` same names
- Accept: `__root.tsx` navigates to the bootstrap thread only when `bootstrapThreadCreated === true`; once the server sends the field (issue in 14.6) the wizard shows on a first `npx t3` launch.
- Tests: `vp test run apps/server/src/serverRuntimeStartup.test.ts` · `vp lint apps/server/src/serverRuntimeStartup.ts apps/web/src/routes/__root.tsx` · `vp run --filter t3 typecheck` ; `vp run --filter @t3tools/web typecheck` · new: browser test: `/` with and without `bootstrapThreadCreated`
- Model: Opus low · risk: low - Web-mode first-time users will start seeing the wizard, and its "Check your agents" and import steps run... · upstream: no: gated on a server change (apps/server); file the issue first, then this one-condition client change · #24865: independent
- Note: apps/server is outside UI scope; the UI half is gated, never faked.

##### O-3 `/new` without a prompt redirects to `/`

- Findings: F-10-04 (P1) · ~15 lines · wave 0 · depends on: none
- Files: `components/promptLinks/NewThreadLinkView.tsx`, `routes/_chat.new.tsx`
- Before: `home-default-{dark,light}-1440x900.png`; cited `10-first-run-and-empty-states-new-no-prompt-light-1440x900.png`, `10-first-run-and-empty-states-new-no-prompt-dark-1440x900.png` (+1) · After: `screens/O-3/` same names
- Accept: `/new` renders no error page; it redirects with chrome intact.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/promptLinks/NewThreadLinkView.tsx apps/web/src/routes/_chat.new.tsx` · `vp run --filter @t3tools/web typecheck` · new: logic test: /new redirect
- Model: Opus low · risk: low - `promptLinks` tests cover `parseNewThreadLink` · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### O-4 Not-installed providers offer an install row with a copyable command

- Findings: F-09-07 (P1), F-09-08 · ~215 lines · wave 0 · depends on: none
- Files: `components/chat/ModelPickerContent.tsx`, `components/chat/ModelPickerSidebar.tsx`, `components/settings/ProviderInstanceCard.tsx`
- Before: `settings-providers-default-{dark,light}-1440x900.png`; cited `09-providers-opencode-detail-light-1440x900.png`, `09-providers-pi-detail-dark-1440x900.png` (+5) · After: `screens/O-4/` same names
- Accept: Each missing provider shows an install command with Copy and Check again; backticks are not shown raw.
- Tests: `vp test run apps/web/src/components/settings/ProviderInstanceCard.test.ts apps/web/src/components/settings/providerStatus.test.ts` · `vp lint apps/web/src/components/chat/ModelPickerContent.tsx apps/web/src/components/chat/ModelPickerSidebar.tsx apps/web/src/components/settings/ProviderInstanceCard.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - server field is a contract change (`packages/contracts/src/server.ts`) · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### O-5 Setup route from the composer chip, banner and palette when no provider is usable

- Findings: F-09-20 (P1), F-10-24, F-24-05 (P1) · ~270 lines · wave 1 · depends on: #24865
- Files: `components/chat/ChatComposer.tsx`, `components/chat/ComposerControlsBar.tsx`, `components/settings/ProviderSettingsPanel.tsx`, `components/chat/ComposerPrimaryActions.tsx`
- Before: `new-thread-default-{dark,light}-1440x900.png`; cited `09-thread-grok-instance-removed-send-ignored-light-1440x900.png` · After: `screens/O-5/` same names
- Accept: Chip reads "Set up an agent" and opens `/welcome#agents:<id>` or Providers; palette has "Set up agents"; Providers empty state offers "Add provider".
- Tests: `vp test run apps/web/src/components/settings/ProviderSettingsPanel.logic.test.ts` · `vp lint apps/web/src/components/chat/ChatComposer.tsx apps/web/src/components/chat/ComposerControlsBar.tsx apps/web/src/components/settings/ProviderSettingsPanel.tsx apps/web/src/components/chat/ComposerPrimaryActions.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `ComposerPrimaryActions` tests · upstream: no: composer chip and banner sit in #24865 files; palette rows are eligible now · #24865: rebase after merge: ChatComposer.tsx, ComposerControlsBar.tsx, ComposerPrimaryActions.tsx

##### O-6 Wizard: Skip setup, Escape, initial focus on Continue

- Findings: F-10-10, F-10-11, F-24-10 · ~190 lines · wave 0 · depends on: none
- Files: `components/onboarding/WelcomeWizard.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `10-first-run-and-empty-states-welcome-1-connect-light-1440x900.png` · After: `screens/O-6/` same names
- Accept: Escape and "Skip setup" finish without importing; Continue has initial focus; X no longer completes silently.
- Tests: `vp test run apps/web/src/components/onboarding/WelcomeWizard.import.browser.test.tsx` · `vp lint apps/web/src/components/onboarding/WelcomeWizard.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `WelcomeWizard.import.browser.test.tsx` renders the wizard · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: Absorbs BORROW #24719 (keep selection on Back).

##### O-7 Wizard footer is sticky at 800x600 and 200% zoom

- Findings: F-10-12 · ~160 lines · wave 1 · depends on: O-6
- Files: `components/ui/dialog.tsx`
- Before: `welcome-default-{dark,light}-800x600.png`; cited `10-first-run-and-empty-states-welcome-3-import-masked-light-800x600.png` · After: `screens/O-7/` same names
- Accept: Continue and Import stay visible at 800x600 and 200% zoom.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/dialog.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Other wizards using `WizardPopup` gain an optional prop only · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: BORROW #24381 for the Add-provider wizard.

##### O-8 Computers step appears only when needed

- Findings: F-24-06, F-10-16 · ~175 lines · wave 1 · depends on: O-6
- Files: `components/onboarding/WelcomeWizard.tsx`, `components/ui/wizard.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `10-first-run-and-empty-states-welcome-1-connect-light-1440x900.png` · After: `screens/O-8/` same names
- Accept: One local computer: flow is Agents then Projects with a two-chip stepper.
- Tests: `vp test run apps/web/src/components/onboarding/WelcomeWizard.import.browser.test.tsx` · `vp lint apps/web/src/components/onboarding/WelcomeWizard.tsx apps/web/src/components/ui/wizard.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - stepper chip count changes when the user opts into the Computers step · upstream: no: flow change needs maintainer decision · #24865: independent

##### O-9 Agents step: Check again and zero-ready state

- Findings: F-24-07, F-10-15 · ~70 lines · wave 1 · depends on: none
- Files: `components/onboarding/WelcomeWizard.tsx`, `components/chat/ChatComposer.tsx`, `components/settings/ProviderSettingsPanel.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png` · After: `screens/O-9/` same names
- Accept: "Checked just now" + refresh; one refresh on window focus; Continue is outline with a note when no agent is ready.
- Tests: `vp test run apps/web/src/components/settings/ProviderSettingsPanel.logic.test.ts` · `vp lint apps/web/src/components/onboarding/WelcomeWizard.tsx apps/web/src/components/chat/ChatComposer.tsx apps/web/src/components/settings/ProviderSettingsPanel.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Extracting `ProviderLastChecked` touches the Providers panel file · upstream: yes, after #24865 merges · #24865: rebase after merge: ChatComposer.tsx

##### O-10 Agents step lists other agents

- Findings: F-24-03 (P1) · ~55 lines · wave 2 · depends on: O-9
- Files: `components/settings/CodexSetupSection.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `settings-providers-default-light-1440x900.png` · After: `screens/O-10/` same names
- Accept: "Other agents" row links to Providers and returns to `/welcome#agents:<id>`.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/CodexSetupSection.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `WelcomeWizard.import.browser.test.tsx` renders the wizard · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### O-11 Agents step states the default permission mode

- Findings: F-24-04 (P1) · ~55 lines · wave 2 · depends on: O-9
- Files: `components/onboarding/WelcomeWizard.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png`; cited `settings-general-default-light-1440x900.png` · After: `screens/O-11/` same names
- Accept: A collapsed disclosure shows "Full access" with a Change control over `runtimeModeConfig`; default unchanged.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/onboarding/WelcomeWizard.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `defaultRuntimeMode` is a project-scoped server setting (`settings.ts:958`) · upstream: yes: touches wizard files that #24865 does not · #24865: independent

##### O-12 Projects step with nothing to import

- Findings: F-10-07 (P1), F-24-08 · ~70 lines · wave 1 · depends on: O-6
- Files: `components/onboarding/WelcomeWizard.tsx`, `components/NoProjectsHero.tsx`, `onboarding/projectImport.logic.ts`
- Before: `welcome-default-{dark,light}-1440x900.png` · After: `screens/O-12/` same names
- Accept: Zero candidates: Continue is enabled, "Add a project..." opens the add-project palette, exit reads "Skip import".
- Tests: `vp test run apps/web/src/onboarding/projectImport.logic.test.ts apps/web/src/components/onboarding/WelcomeWizard.import.browser.test.tsx` · `vp lint apps/web/src/components/onboarding/WelcomeWizard.tsx apps/web/src/components/NoProjectsHero.tsx apps/web/src/onboarding/projectImport.logic.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `WelcomeWizard.import.browser.test.tsx` covers import states · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### O-13 Import progress and readable import rows

- Findings: F-24-09, F-10-13, F-10-14 · ~45 lines · wave 0 · depends on: none
- Files: `components/onboarding/WelcomeWizard.tsx`
- Before: `welcome-default-{dark,light}-{1440x900,390x844}.png`; cited `10-first-run-and-empty-states-welcome-3-import-masked-light-1440x900.png`, `10-first-run-and-empty-states-welcome-3-import-masked-dark-390x844.png` · After: `screens/O-13/` same names
- Accept: Import shows "Importing N of M..." (`role="status"`); rows carry labels and do not truncate to six characters at 390 px.
- Tests: `vp test run apps/web/src/components/onboarding/WelcomeWizard.import.browser.test.tsx` · `vp lint apps/web/src/components/onboarding/WelcomeWizard.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `WelcomeWizard.import.browser.test.tsx` covers import · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### O-14 Way back to setup and release notes

- Findings: F-10-02 (P1), F-24-16 (P3) · ~70 lines · wave 1 · depends on: none
- Files: `branding.ts`, `components/CommandPalette.tsx`, `components/NoProjectsHero.tsx`, `components/desktopUpdate.toast.tsx`, `components/settings/SettingsPanels.tsx`, `components/settings/settingsSearch.ts` (+1)
- Before: `settings-general-default-{dark,light}-1440x900.png`; cited `10-first-run-and-empty-states-no-projects-hero-light-1440x900.png` · After: `screens/O-14/` same names
- Accept: Settings > General > About has "Setup" and "Release notes"; palette has "Open setup".
- Tests: `vp test run apps/web/src/components/CommandPalette.logic.test.ts apps/web/src/components/desktopUpdate.logic.test.ts apps/web/src/components/settings/SettingsPanels.logic.test.ts apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/web/src/branding.ts apps/web/src/components/CommandPalette.tsx apps/web/src/components/NoProjectsHero.tsx apps/web/src/components/desktopUpdate.toast.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - The wizard remounts with `onDone` · upstream: yes, after #24865 merges · #24865: rebase after merge: SettingsPanels.tsx, settingsSearch.ts

##### O-15 Telemetry notice names the real opt-out

- Findings: F-24-11 · ~15 lines · wave 1 · depends on: none
- Files: `components/onboarding/WelcomeWizard.tsx`, `components/settings/SettingsPanels.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png` · After: `screens/O-15/` same names
- Accept: The first-screen sentence names `T3CODE_TELEMETRY_ENABLED=false` in mono and links the docs; no toggle implied.
- Tests: `vp test run apps/web/src/components/settings/SettingsPanels.logic.test.ts` · `vp lint apps/web/src/components/onboarding/WelcomeWizard.tsx apps/web/src/components/settings/SettingsPanels.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Copy only · upstream: no: policy copy, maintainer wording · #24865: rebase after merge: SettingsPanels.tsx

##### O-16 One pairing explainer in three surfaces

- Findings: F-24-12 · ~110 lines (adjusted from 55) · wave 2 · depends on: CP-1
- Files: `mobile:src/features/connection/ConnectionsNewRouteScreen.tsx`, `components/HostedEmptyState.tsx`, `components/onboarding/WelcomeWizard.tsx`
- Before: `welcome-default-{dark,light}-1440x900.png` · After: `screens/O-16/` same names
- Accept: Wizard, hosted page and mobile use the same three-step list and the word "computer".
- Tests: no existing test beside these files · `vp lint apps/mobile/src/features/connection/ConnectionsNewRouteScreen.tsx apps/web/src/components/HostedEmptyState.tsx apps/web/src/components/onboarding/WelcomeWizard.tsx` · `vp run --filter @t3tools/mobile typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Overlaps `extoci`'s copy PRs (#24147 to #24150) and the hosted page tests · upstream: yes: after aligning with #24150 · #24865: independent

##### O-17 Mobile first launch names the computer; no dead end on "No projects"

- Findings: F-24-01 (P1), F-24-02 (P1) · ~70 lines · wave 2 · depends on: CP-1
- Files: `mobile:src/features/home/HomeScreen.tsx`
- Before: `home-default-{dark,light}-390x844.png` · After: `screens/O-17/` same names
- Accept: Mobile Home reads "No computer connected" with three steps and FAB "Connect a computer"; "No projects yet" has "Add project".
- Tests: no existing test beside these files · `vp lint apps/mobile/src/features/home/HomeScreen.tsx` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Strings are not asserted in mobile tests (searched) · upstream: yes: copy plus one list · #24865: independent
- Note: Align with #24150.

### 13.11 Mobile (17 chunks)

Phone-width web, touch targets and the native app (iOS verified on simulator; Android code-read only).

##### M-1 Thread row actions reachable on touch-only web

- Findings: F-02-04 (P1) · ~160 lines · wave 1 · depends on: #24865
- Files: `components/Sidebar.tsx`, `components/sidebar/SidebarThreadRow.tsx`, `index.css`
- Before: `home-default-{dark,light}-390x844.png`; cited `02-thread-list-touch-no-actions-dark-390x844.png` · After: `screens/M-1/` same names
- Accept: Under `any-hover: none` each row has a "Thread actions" button; Settle, Snooze, Wake and Un-settle are reachable.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts apps/web/src/components/Sidebar.pointer.browser.test.tsx` · `vp lint apps/web/src/components/Sidebar.tsx apps/web/src/components/sidebar/SidebarThreadRow.tsx apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Status slot width on 390px sheet (project name truncates sooner) · upstream: yes, after #24865 merges · #24865: rebase after merge: Sidebar.tsx, SidebarThreadRow.tsx, index.css

##### M-2 Phone-width headers: Authorized clients, Usage, Open diff

- Findings: F-11-14 (P1), F-09-33, F-03-23 · ~85 lines · wave 0 · depends on: none
- Files: `components/chat/ChangedFilesTree.tsx`, `components/settings/FoldedSettingsSection.tsx`, `components/usage/UsagePage.tsx`
- Before: `home-default-{dark,light}-390x844.png`, `settings-general-default-{dark,light}-390x844.png`; cited `11-connections-authorized-open-light-390x844.png`, `11-multi-env-offline-dark-390x844.png` (+3) · After: `screens/M-2/` same names
- Accept: At 390x844 headers do not overlap their titles; Usage header reads a title and period; Open diff has a text label.
- Tests: `vp test run apps/web/src/components/usage/usagePagePreferences.test.ts` · `vp lint apps/web/src/components/chat/ChangedFilesTree.tsx apps/web/src/components/settings/FoldedSettingsSection.tsx apps/web/src/components/usage/UsagePage.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `FoldedSettingsSection` is also used by Load balancing · upstream: yes: fix-shaped, no #24865 overlap; bundle: 3 carve-out PRs possible · #24865: independent

##### M-3 Provider settings at phone and tablet width: selection and list titles

- Findings: F-09-01 (P1), F-09-04 (P1) · ~110 lines · wave 0 · depends on: none
- Files: `components/settings/ProviderSettingsPanel.tsx`, `components/settings/ProviderInstanceCard.tsx`
- Before: `settings-providers-default-{dark,light}-1440x900.png`; cited `09-providers-narrow-after-select-light-1024x640.png`, `09-providers-narrow-detail-light-1024x640.png` (+4) · After: `screens/M-3/` same names
- Accept: Selecting a provider shows its editor below 1100 px; list titles do not truncate to "Cl...".
- Tests: `vp test run apps/web/src/components/settings/ProviderSettingsPanel.logic.test.ts apps/web/src/components/settings/ProviderInstanceCard.test.ts apps/web/src/components/settings/ProviderSettingsPanel.environment.browser.test.tsx` · `vp lint apps/web/src/components/settings/ProviderSettingsPanel.tsx apps/web/src/components/settings/ProviderInstanceCard.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `ProviderSettingsPanel.environment.browser.test.tsx` renders the panel · upstream: yes: small, fix-shaped · #24865: independent

##### M-4 Phone composer strip keeps the permission chip and model name

- Findings: F-04-22 (P1), F-04-23, F-04-24 · ~230 lines · wave 1 · depends on: #24865
- Files: `components/chat/ComposerControlsBar.tsx`, `components/chat/CompactComposerControlsMenu.tsx`, `components/chat/restingComposerControlsMeasurement.ts`, `components/chat/useRestingComposerControlsLayout.ts`
- Before: `new-thread-default-{dark,light}-{390x844,800x600}.png`; cited `04-thread-composer-light-800x600.png`, `04-mobile-draft-hero-light-390x844.png` (+4) · After: `screens/M-4/` same names
- Accept: Permission chip stays at 390 px (effort collapses first); model shows its name; the overflow menu keeps descriptions and icons.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/ComposerControlsBar.tsx apps/web/src/components/chat/CompactComposerControlsMenu.tsx apps/web/src/components/chat/restingComposerControlsMeasurement.ts apps/web/src/components/chat/useRestingComposerControlsLayout.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - restingComposerControlsMeasurement.ts and useRestingComposerControlsLayout.ts take block order from resti · upstream: yes, after #24865 merges · #24865: rebase after merge: ComposerControlsBar.tsx

##### M-5 Settings nav below 768 px is labelled and reachable

- Findings: F-07-06 (P1) · ~55 lines · wave 1 · depends on: #24865
- Files: `components/settings/SettingsSidebarNav.tsx`, `components/ui/sidebar.tsx`
- Before: `settings-general-default-{dark,light}-390x844.png` · After: `screens/M-5/` same names
- Accept: The icon rail has labels or tooltips, >= 44 px targets and >= 4.5:1 icons.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/SettingsSidebarNav.tsx apps/web/src/components/ui/sidebar.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Tooltips are hover-only · upstream: yes, after #24865 merges · #24865: rebase after merge: SettingsSidebarNav.tsx

##### M-6 Touch: tapping a tab icon no longer closes the tab

- Findings: F-06-08 (P1) · ~55 lines · wave 1 · depends on: none
- Files: `components/ui/button.tsx`
- Before: `thread-codex-edits-default-{dark,light}-390x844.png` · After: `screens/M-6/` same names
- Accept: On touch the X is visible; tapping the icon activates the tab.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/button.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - chip width +20 px on touch · upstream: yes, after #24865 merges · #24865: rebase after merge: button.tsx

##### M-7 Touch targets for Send, Stop, Resume and the toast dismiss orb

- Findings: F-04-18, F-12-23 · ~30 lines · wave 2 · depends on: T1, #24865
- Files: `components/chat/ComposerControl.tsx`, `components/chat/ComposerPrimaryActions.tsx`, `components/ui/toast.tsx`
- Before: `new-thread-default-{dark,light}-390x844.png` · After: `screens/M-7/` same names
- Accept: Send, Stop, Resume and toast controls are >= 44 px on coarse pointers with unchanged visuals.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/ComposerControl.tsx apps/web/src/components/chat/ComposerPrimaryActions.tsx apps/web/src/components/ui/toast.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Overlap with the attach button's hit area (probe after change) · upstream: yes, after #24865 merges · #24865: rebase after merge: ComposerControl.tsx, ComposerPrimaryActions.tsx

##### M-8 Mobile radius ladder

- Findings: F-18-05 · ~300 lines (adjusted from 160) · wave 0 · depends on: none
- Files: `mobile:global.css`, `mobile:src/features/threads/git/GitBranchesSheet.tsx`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/M-8/` same names + simulator capture (`xcrun simctl io`)
- Accept: `@theme` defines sheet 28, card 24, card-sm 20, control 14; 106 arbitrary radii migrate.
- Tests: no existing test beside these files · `vp lint apps/mobile/global.css apps/mobile/src/features/threads/git/GitBranchesSheet.tsx` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - no test covers native radii · upstream: yes: mobile-only · #24865: independent
- Note: Native app: iOS captures from the simulator.

##### M-9 Native navigation stack crash and iPad/Android chrome

- Findings: F-15-01 (P1) · ~55 lines · wave 0 · depends on: none
- Files: `mobile:src/Stack.tsx`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/M-9/` same names + simulator capture (`xcrun simctl io`)
- Accept: No RNScreens "Stack should never be empty" crash in the repro; iPad sidebar tabs stay on the tapped tab (BORROW #20144).
- Tests: no existing test beside these files · `vp lint apps/mobile/src/Stack.tsx` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - touches the shared native stack patch · upstream: no: crash needs a reproduction on a device build first · #24865: independent
- Note: BORROW #20144, #24541, #22742.

##### M-10 Native search: closing clears the query

- Findings: F-15-02 (P1), F-15-13 · ~70 lines · wave 0 · depends on: none
- Files: `mobile:src/features/workspace/WorkspaceToolbar.ios.tsx`
- Before: cited `15-mobile-home-search-closed-query-persists-light-iphone17.png`, `15-mobile-settings-archive-light-iphone17.png` · After: `screens/M-10/` same names + simulator capture (`xcrun simctl io`)
- Accept: Closing search clears the filter; the archived search field clears the tab bar.
- Tests: `vp test run apps/mobile/src/features/workspace/workspace-tabs-state.test.ts` · `vp lint apps/mobile/src/features/workspace/WorkspaceToolbar.ios.tsx` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `workspace-tabs-state.test.ts` covers the reducer · upstream: yes: fix-shaped, no #24865 overlap; bundle: 2 carve-out PRs possible · #24865: independent

##### M-11 Native tab bar and compose button clear the composer

- Findings: F-15-03 (P1) · ~55 lines · wave 0 · depends on: none
- Files: `mobile:src/features/workspace/useSystemWorkspaceTabBar.ts`
- Before: cited `15-mobile-offline-thread-view-light-iphone17.png` · After: `screens/M-11/` same names + simulator capture (`xcrun simctl io`)
- Accept: Opening a thread from the workspace tab hides the floating tab bar; iOS header insets hold (BORROW #21548, #23797, #22550, #22420, #22417, #22418).
- Tests: no existing test beside these files · `vp lint apps/mobile/src/features/workspace/useSystemWorkspaceTabBar.ts` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - iPad sidebar tabs (`WorkspaceSidebarTabs.ios.tsx`) must keep their bar · upstream: yes: follow #24666 owner · #24865: independent

##### M-12 Add environment: error visible above the keyboard; disabled environment copy

- Findings: F-15-06 (P1), F-15-12 · ~110 lines · wave 0 · depends on: none
- Files: `mobile:src/features/home/HomeScreen.tsx`, `pkg:client-runtime/src/connection/errors.ts`
- Before: cited `15-mobile-add-env-bad-code-submitted-light-iphone17.png`, `15-mobile-home-offline-env-disabled-light-iphone17.png` · After: `screens/M-12/` same names + simulator capture (`xcrun simctl io`)
- Accept: The error shows above the keyboard and says what to do; a disabled environment reads "Disabled", with an enable CTA.
- Tests: `vp test run packages/client-runtime/src/connection/errors.test.ts apps/mobile/src/features/home/workspace-connection-status.test.ts` · `vp lint apps/mobile/src/features/home/HomeScreen.tsx packages/client-runtime/src/connection/errors.ts` · `vp run --filter @t3tools/mobile typecheck` ; `vp run --filter @t3tools/client-runtime typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - error string may be asserted in `client-runtime` tests · upstream: yes: fix-shaped, no #24865 overlap; bundle: 2 carve-out PRs possible · #24865: independent

##### M-13 Native composer: keyboard dismiss, readable disabled Send, model visible

- Findings: F-15-07, F-15-08, F-15-11 · ~85 lines · wave 0 · depends on: none
- Files: `mobile:src/components/ComposerModelControl.tsx`, `mobile:src/components/ComposerToolbar.tsx`, `mobile:src/features/threads/ThreadComposer.tsx`, `mobile:src/features/threads/ThreadFeed.tsx`
- Before: cited `15-mobile-long-thread-after-drag-down-light-iphone17.png`, `15-mobile-thread-capitalize-end-light-iphone17.png` (+1) · After: `screens/M-13/` same names + simulator capture (`xcrun simctl io`)
- Accept: Dragging the chat dismisses the keyboard (BORROW #24484); disabled Send is >= 3:1 (BORROW #23155); collapsed composer shows the model.
- Tests: `vp test run apps/mobile/src/features/threads/composerSendPresentation.test.ts` · `vp lint apps/mobile/src/components/ComposerModelControl.tsx apps/mobile/src/components/ComposerToolbar.tsx apps/mobile/src/features/threads/ThreadComposer.tsx apps/mobile/src/features/threads/ThreadFeed.tsx` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - LegendList scroll anchoring while the keyboard animates (#22350 family) · upstream: yes: fix-shaped, no #24865 overlap; bundle: 3 carve-out PRs possible · #24865: independent
- Note: Absorbs BORROW #22843, #21691.

##### M-14 Native sizes: 44 pt targets, Dynamic Type ceiling, busy rows

- Findings: F-15-09, F-15-10, F-15-15 · ~125 lines · wave 0 · depends on: none
- Files: `mobile:src/components/ui/ListRowLayout.tsx`, `mobile:src/features/terminal/ThreadTerminalRouteScreen.tsx`, `mobile:src/features/threads/thread-list-v2-items.tsx`, `mobile:src/features/threads/thread-row-emphasis.ts`
- Before: cited `15-mobile-appearance-dyntype-ax5-themes-light-iphone17.png`, `15-mobile-settings-root-dyntype-ax5-light-iphone17.png` · After: `screens/M-14/` same names + simulator capture (`xcrun simctl io`)
- Accept: Targets >= 44 pt; settings rows and theme names survive Dynamic Type AX5; busy rows no longer fade to 55%.
- Tests: no existing test beside these files · `vp lint apps/mobile/src/components/ui/ListRowLayout.tsx apps/mobile/src/features/terminal/ThreadTerminalRouteScreen.tsx apps/mobile/src/features/threads/thread-list-v2-items.tsx apps/mobile/src/features/threads/thread-row-emphasis.ts` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - capsule width at 390 pt already truncates the title (see F-15-11) · upstream: yes: fix-shaped, no #24865 overlap; bundle: 3 carve-out PRs possible · #24865: independent
- Note: Absorbs BORROW #21383, #22568, #23401, #23688.

##### M-15 Native terminal: paste visible, Attach visible output above the keyboard

- Findings: F-15-14 · ~55 lines · wave 0 · depends on: none
- Files: `mobile:src/features/terminal/ThreadTerminalRouteScreen.tsx`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/M-15/` same names + simulator capture (`xcrun simctl io`)
- Accept: Paste key and Attach visible output stay on screen with the keyboard open.
- Tests: no existing test beside these files · `vp lint apps/mobile/src/features/terminal/ThreadTerminalRouteScreen.tsx` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - terminal key order is muscle memory · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### M-16 Provider accounts list all drivers with install state

- Findings: F-15-17 · ~160 lines · wave 0 · depends on: none
- Files: `mobile:src/features/settings/SettingsProviderAccountsRouteScreen.tsx`
- Before: cited `15-mobile-settings-provider-accounts-light-iphone17.png` · After: `screens/M-16/` same names + simulator capture (`xcrun simctl io`)
- Accept: Provider accounts lists every driver and shows install state.
- Tests: no existing test beside these files · `vp lint apps/mobile/src/features/settings/SettingsProviderAccountsRouteScreen.tsx` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - shares copy with web `components/settings/Provider*.tsx` (area 09 proposals) · upstream: no: broadens a screen; needs approval · #24865: independent

##### M-17 Provider model rows and touch targets at phone width

- Findings: F-09-02 (P1), F-09-03 (P1) · ~215 lines · wave 1 · depends on: M-3
- Files: `components/ui/menu.tsx`, `components/ui/switch.tsx`
- Before: `settings-providers-default-{dark,light}-1440x900.png`; cited `09-providers-claude-models-touch-light-390x844.png` · After: `screens/M-17/` same names + simulator capture (`xcrun simctl io`)
- Accept: Model rows are two-line with a menu for reorder instead of "Claud..."; list and model-row targets are >= 44 px and do not overlap.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/menu.tsx apps/web/src/components/ui/switch.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - existing handlers (`onToggleFavorite`, `onMove`, `onSetHidden`) are reused · upstream: yes, after #24865 merges · #24865: rebase after merge: menu.tsx

### 13.12 A11y (22 chunks)

Section 11: focus visibility, forced colours, semantics, keyboard operability and assistive-tech names.

##### A-1 Forced-colors: focus outline and Switch

- Findings: F-16-02 (P1), F-07-16 (P1) · ~30 lines · wave 1 · depends on: none
- Files: `components/ui/switch.tsx`, `index.css`
- Before: `settings-general-default-{dark,light}-1440x900.png`; cited `16-accessibility-forced-colors-focus-nofix-dark-300x120.png` · After: `screens/A-1/` same names + forced-colors emulation capture
- Accept: In `forced-colors: active` every `:focus-visible` shows a 2 px Highlight outline and the Switch shows track and thumb.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/switch.tsx apps/web/src/index.css` · `vp run --filter @t3tools/web typecheck` · new: manual forced-colors capture (Chromium emulation)
- Model: Opus low · risk: low - only inside the media query · upstream: yes, after #24865 merges · #24865: rebase after merge: index.css

##### A-2 Forced-colors: selected tiles, theme orbs, open and selected rows

- Findings: F-07-17 (P1), F-02-25 · ~70 lines · wave 2 · depends on: A-1
- Files: `components/settings/ThemePreviewCircles.tsx`, `components/settings/ThemeSettings.tsx`, `components/settings/ThemeWireframe.tsx`
- Before: `settings-appearance-default-{dark,light}-1440x900.png`, `home-default-{dark,light}-1440x900.png`; cited `02-thread-list-forced-colors-1440x900.png` · After: `screens/A-2/` same names + forced-colors emulation capture
- Accept: Color scheme tiles, theme orbs and wireframes show borders and a distinct selected state; open and selected rows differ.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/settings/ThemePreviewCircles.tsx apps/web/src/components/settings/ThemeSettings.tsx apps/web/src/components/settings/ThemeWireframe.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `ThemeSettings.tsx` cards carry the selected state through inline `style` · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)

##### A-3 Missing focus rings: sidebar search, Add provider, question options

- Findings: F-16-03 (P1), F-09-05 (P1), F-03-29 · ~45 lines · wave 1 · depends on: none
- Files: `components/settings/ProviderInstanceCard.tsx`, `components/settings/ProviderSettingsPanel.tsx`, `components/sidebar/SidebarThreadHeader.tsx`, `components/ui/button.tsx`
- Before: `home-default-{dark,light}-1440x900.png`, `settings-providers-default-{dark,light}-1440x900.png` · After: `screens/A-3/` same names
- Accept: Each shows a 2 px inset `ring-ring` on `:focus-visible`.
- Tests: `vp test run apps/web/src/components/settings/ProviderInstanceCard.test.ts apps/web/src/components/settings/ProviderSettingsPanel.logic.test.ts` · `vp lint apps/web/src/components/settings/ProviderInstanceCard.tsx apps/web/src/components/settings/ProviderSettingsPanel.tsx apps/web/src/components/sidebar/SidebarThreadHeader.tsx apps/web/src/components/ui/button.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low · upstream: yes, after #24865 merges · #24865: rebase after merge: button.tsx

##### A-4 Branch picker has an accessible name

- Findings: F-16-04 (P1) · ~15 lines · wave 1 · depends on: none
- Files: `components/BranchToolbarBranchSelector.tsx`, `components/WorktreeBaseBranchPicker.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/A-4/` same names
- Accept: axe `button-name` passes; name reads "Branch, <name>".
- Tests: no existing test beside these files · `vp lint apps/web/src/components/BranchToolbarBranchSelector.tsx apps/web/src/components/WorktreeBaseBranchPicker.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - tests querying by role name "main" · upstream: yes, after #24865 merges · #24865: rebase after merge: BranchToolbarBranchSelector.tsx

##### A-5 Label-in-name and brand link name

- Findings: F-16-18, F-01-18 · ~70 lines · wave 0 · depends on: none
- Files: `components/sidebar/SidebarChrome.tsx`, `components/LegacySidebar.tsx`, `components/Sidebar.logic.ts`, `routes/_chat.index.tsx`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/A-5/` same names
- Accept: axe `label-content-name-mismatch` is 0 on a thread; the brand link name matches what the click does (BORROW #24209).
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/sidebar/SidebarChrome.tsx apps/web/src/components/LegacySidebar.tsx apps/web/src/components/Sidebar.logic.ts apps/web/src/routes/_chat.index.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `Sidebar.logic.test.ts` asserts label strings · upstream: yes: logo alone matches #24209; bundle: 2 carve-out PRs possible · #24865: independent

##### A-6 Keyboard highlight is visible in every popup list

- Findings: F-16-01 (P1) · ~55 lines · wave 2 · depends on: T12
- Files: `index.css`, `main.tsx`
- Before: `command-palette-default-{dark,light}-1440x900.png` · After: `screens/A-6/` same names
- Accept: `html[data-input="keyboard"]` plus a 2 px inset ring on highlighted items; highlight >= 3:1.
- Tests: no existing test beside these files · `vp lint apps/web/src/index.css apps/web/src/main.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - item radius `rounded-sm` (6px) vs inset ring · upstream: yes, after #24865 merges · #24865: rebase after merge: index.css, main.tsx

##### A-7 `prefers-contrast` and a forced-colors theme

- Findings: F-16-12 · ~55 lines · wave 2 · depends on: A-1
- Files: `hooks/useTheme.ts`
- Before: `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/A-7/` same names + forced-colors emulation capture
- Accept: prefers-contrast: more raises borders and text; forced-colors uses system colours.
- Tests: no existing test beside these files · `vp lint apps/web/src/hooks/useTheme.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - boot script parity (`themeBoot.test.ts`) only covers theme keys, not contrast · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### A-8 Palette and model picker semantics

- Findings: F-16-15 · ~55 lines · wave 0 · depends on: none
- Files: `components/ui/command.tsx`
- Before: `command-palette-default-{dark,light}-1440x900.png`, `new-thread-default-{dark,light}-1440x900.png` · After: `screens/A-8/` same names
- Accept: Listbox/dialog names, combobox `aria-expanded`, selected state exposed (axe clean).
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/command.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `CommandPalette*.test.tsx` query options by name incl · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### A-9 Approval and question: shortcut, focus move, tab order, announced answers

- Findings: F-16-21 · ~55 lines · wave 0 · depends on: none
- Files: `components/chat/ComposerPendingApprovalActions.tsx`, `components/chat/ComposerPendingApprovalPanel.tsx`, `components/chat/threadActivityAnnouncement.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png`; cited `03-approval-pending-dark-1440x900.png` · After: `screens/A-9/` same names
- Accept: Approval banner takes focus on appear; Tab order starts at the banner; typed answer moved aside is announced (BORROW #24331).
- Tests: `vp test run apps/web/src/components/chat/threadActivityAnnouncement.test.ts` · `vp lint apps/web/src/components/chat/ComposerPendingApprovalActions.tsx apps/web/src/components/chat/ComposerPendingApprovalPanel.tsx apps/web/src/components/chat/threadActivityAnnouncement.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - focus theft while typing (guard on empty composer) · upstream: no: touches the approval flow; needs maintainer view · #24865: independent

##### A-10 Thread list context menu has menu semantics

- Findings: F-02-05 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `contextMenuFallback.ts`
- Before: `home-default-{dark,light}-1440x900.png`; cited `02-thread-list-context-menu-dark-1440x900.png` · After: `screens/A-10/` same names
- Accept: `role=menu`, arrow keys, focus, Esc return; submenu near the right edge flips (BORROW #23666).
- Tests: `vp test run apps/web/src/contextMenuFallback.test.ts` · `vp lint apps/web/src/contextMenuFallback.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - `contextMenuFallback.test.ts` exists · upstream: yes: file untouched by #24865; single concern · #24865: independent

##### A-11 Thread rows: one tab stop, roving focus, state in the name

- Findings: F-02-06 (P1), F-02-07 (P1) · ~215 lines · wave 1 · depends on: A-10, #24865
- Files: `components/sidebar/SidebarThreadRow.tsx`, `components/Sidebar.logic.ts`, `components/Sidebar.tsx`, `keybindings.ts`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/A-11/` same names
- Accept: One tab stop per list; Up/Down move rows; accessible name carries pinned, section, branch, time and state.
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts apps/web/src/keybindings.test.ts apps/web/src/components/Sidebar.pointer.browser.test.tsx` · `vp lint apps/web/src/components/sidebar/SidebarThreadRow.tsx apps/web/src/components/Sidebar.logic.ts apps/web/src/components/Sidebar.tsx apps/web/src/keybindings.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Interacts with dnd-kit sensor and `useSidebarRowSubscriptionLease` · upstream: yes, after #24865 merges · #24865: rebase after merge: SidebarThreadRow.tsx, Sidebar.tsx

##### A-12 Right-panel tabs are tabs; hit area and focus on the tab

- Findings: F-06-07 (P1), F-06-13 · ~215 lines · wave 0 · depends on: none
- Files: `components/RightPanelTabs.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/A-12/` same names
- Accept: `role=tablist/tab/tabpanel`, arrow keys, 24 px hit area, focus survives close.
- Tests: `vp test run apps/web/src/components/RightPanelTabs.test.tsx` · `vp lint apps/web/src/components/RightPanelTabs.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - dnd-kit listeners on the chip · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### A-13 Opening the diff by shortcut moves focus into the panel

- Findings: F-16-16 · ~160 lines · wave 1 · depends on: A-12
- Files: `components/RightPanelTabs.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/A-13/` same names
- Accept: After the shortcut, focus lands in the panel; Esc returns to the composer.
- Tests: `vp test run apps/web/src/components/RightPanelTabs.test.tsx` · `vp lint apps/web/src/components/RightPanelTabs.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - dnd-kit sortable listeners on the same node · upstream: no: focus-moving behaviour change · #24865: independent

##### A-14 Terminal and drawer expose labels and roles

- Findings: F-06-06 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `components/ThreadTerminalDrawer.tsx`, `terminal/ghostty/surface.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/A-14/` same names
- Accept: Terminal drawer has region, labelled actions; screen-reader tree lists tabs.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/terminal/ghostty/surface.test.ts` · `vp lint apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/terminal/ghostty/surface.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - new keybinding command touches `packages/contracts/src/keybindings.ts` · upstream: no: new command and region · #24865: independent

##### A-15 Terminal output mirror for assistive tech

- Findings: F-16-05 (P1) · ~420 lines · wave 1 · depends on: A-14
- Files: `terminal/ghostty/surface.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/A-15/` same names
- Accept: A visually hidden live text mirror of recent output; throttled; off by default for performance.
- Tests: `vp test run apps/web/src/terminal/ghostty/surface.test.ts` · `vp lint apps/web/src/terminal/ghostty/surface.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - perf (DNA-P1): build the mirror lazily on first focus of the log, not per frame · upstream: no: needs approval and the ghostty text API · #24865: independent

##### A-16 Settings nav and content are keyboard-operable

- Findings: F-07-03, F-07-04, F-07-05, F-07-07, F-07-21 · ~300 lines · wave 1 · depends on: none
- Files: `components/settings/SettingsSidebarNav.tsx`, `components/settings/SettingsPanels.tsx`, `components/settings/ThemePreviewCircles.tsx`, `components/settings/ThemeSettings.tsx`, `components/settings/settingsLayout.tsx`, `components/settings/settingsSearch.ts` (+1)
- Before: `settings-general-default-{dark,light}-1440x900.png`, `settings-appearance-default-{dark,light}-1440x900.png` · After: `screens/A-16/` same names
- Accept: Arrow keys in the nav; `aria-current`; Diagnostics highlights; content scrolls by keyboard on open; theme cards are a radio group.
- Tests: `vp test run apps/web/src/components/settings/SettingsPanels.logic.test.ts apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/web/src/components/settings/SettingsSidebarNav.tsx apps/web/src/components/settings/SettingsPanels.tsx apps/web/src/components/settings/ThemePreviewCircles.tsx apps/web/src/components/settings/ThemeSettings.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - Search-result mode (`:308-339`) already uses `aria-activedescendant` · upstream: yes, after #24865 merges · #24865: rebase after merge: SettingsSidebarNav.tsx, SettingsPanels.tsx, settingsLayout.tsx

##### A-17 Resize handles: hover, focus, keyboard, reset

- Findings: F-01-09, F-06-15 · ~215 lines (adjusted from 110) · wave 0 · depends on: none
- Files: `components/AppSidebarLayout.tsx`, `components/ThreadTerminalDrawer.tsx`, `components/preview/RightPanelResizeHandle.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/A-17/` same names
- Accept: Both handles take focus and Left/Right resize; double-click resets; titles say so.
- Tests: `vp test run apps/web/src/components/ThreadTerminalDrawer.test.ts` · `vp lint apps/web/src/components/AppSidebarLayout.tsx apps/web/src/components/ThreadTerminalDrawer.tsx apps/web/src/components/preview/RightPanelResizeHandle.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - the rail doubles as the collapse toggle when closed (`ui/sidebar.tsx:486-490`) · upstream: no: new interaction; needs maintainer approval · #24865: independent

##### A-18 Review comments can be started from the keyboard

- Findings: F-05-05 (P1) · ~160 lines · wave 0 · depends on: none
- Files: `components/diffs/AnnotatableCodeView.tsx`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/A-18/` same names
- Accept: A shortcut on a focused diff line opens the comment box; Esc closes.
- Tests: `vp test run apps/web/src/components/diffs/AnnotatableCodeView.browser.test.tsx` · `vp lint apps/web/src/components/diffs/AnnotatableCodeView.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - depends on Pierre emitting selection changes for programmatic `selectedLines` (the prop is already... · upstream: yes: accessibility fix · #24865: independent

##### A-19 Provider list is arrow-key navigable

- Findings: F-09-06 · ~55 lines · wave 0 · depends on: none
- Files: `components/settings/ProviderInstanceCard.tsx`
- Before: `settings-providers-default-{dark,light}-1440x900.png` · After: `screens/A-19/` same names
- Accept: Up/Down moves the list; the editor is one Tab away.
- Tests: `vp test run apps/web/src/components/settings/ProviderInstanceCard.test.ts` · `vp lint apps/web/src/components/settings/ProviderInstanceCard.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - handler must ignore events from the switch and advisory buttons... · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### A-20 Errors announce assertively

- Findings: F-12-17 · ~55 lines · wave 1 · depends on: S-1
- Files: (audit names no file; locate from the finding Evidence)
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/A-20/` same names
- Accept: Error toasts use `priority: "high"` and are announced; F6 focus path documented.
- Tests: no existing test beside these files · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - assertive announcements for many errors could be noisy · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### A-21 Native diff and thread rows for VoiceOver and TalkBack

- Findings: F-15-04 (P1), F-15-05 (P1) · ~215 lines · wave 0 · depends on: none
- Files: `mobile:modules/t3-review-diff/android/src/main/java/expo/modules/t3reviewdiff/T3ReviewDiffView.kt`, `mobile:src/features/threads/threadListV2.ts`
- Before: cited `15-mobile-review-diff-capitalize-light-iphone17.png` · After: `screens/A-21/` same names + simulator capture
- Accept: Diff view exposes files and hunks; thread rows announce state, project and time; iOS env buttons named (ADOPT #23740).
- Tests: `vp test run apps/mobile/src/features/threads/threadListV2.test.ts` · `vp lint apps/mobile/src/features/threads/threadListV2.ts` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - large virtualised lists: expose only rows in the visible window · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: Code from #23740 by `only21mil`.

##### A-22 Held: owner calls on focus ring and bubble label

- Findings: F-16-07, F-16-20 · ~0 lines (no code) · wave 1 · depends on: #24865
- Files: none (no code)
- Before: `new-thread-default-{dark,light}-1440x900.png` · After: `screens/A-22/` same names
- Accept: No code until the owner decides (section 15): composer focus ring and user-bubble label contrast.
- Tests: none (no code)
- Model: Opus low · risk: low - touches the owner's "neutral controls" call · upstream: no: conflicts with the PR; decision first · #24865: conflicts with #24865

### 13.13 Motion (9 chunks)

Section 9: reduced motion, durations and easing, hand-rolled loops, mobile motion tokens.

##### MO-1 Global reduced-motion rule (and in-app mirror hook)

- Findings: F-19-02, F-16-13, F-12-16, F-01-31 (P3) · ~60 lines · wave 1 · depends on: none
- Files: `index.css`, `components/AppRouteModal.tsx`, `components/ui/dialog-styles.ts`, `components/ui/sheet.tsx`, `components/ui/toast.tsx`, `panelAnimations.ts`
- Before: `command-palette-default-{dark,light}-1440x900.png` · After: `screens/MO-1/` same names + short .webm of the timing
- Accept: Under `prefers-reduced-motion: reduce` the palette, popover, tooltip, switch, toast and backdrop report zero non-zero transition durations; idle `getAnimations()` stays 0.
- Tests: no existing test beside these files · `vp lint apps/web/src/index.css apps/web/src/components/AppRouteModal.tsx apps/web/src/components/ui/dialog-styles.ts apps/web/src/components/ui/sheet.tsx ...` · `vp run --filter @t3tools/web typecheck` · new: browser census under reducedMotion: reduce
- Model: Opus low · risk: low - Base UI close waits for transitions · upstream: yes, after #24865 merges and Ideas draft 3 is acknowledged (global behaviour change) · #24865: rebase after merge: index.css

##### MO-2 Settings and Usage modal enter animation

- Findings: F-19-01 · ~15 lines · wave 0 · depends on: none
- Files: `components/AppRouteModal.tsx`, `components/chat/ComposerStashBadge.tsx`, `components/ui/dialog-styles.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/MO-2/` same names + short .webm of the timing
- Accept: Route modal fades/scales in over 200 ms; none under reduced motion.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/AppRouteModal.tsx apps/web/src/components/chat/ComposerStashBadge.tsx apps/web/src/components/ui/dialog-styles.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `settingsLayout.tsx:130-140` waits on `data-starting-style` for scroll targeting · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### MO-3 Toast timings: 200 ms transform, 150 ms opacity

- Findings: F-19-03 · ~15 lines · wave 2 · depends on: MO-1
- Files: `components/ui/toast.tsx`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/MO-3/` same names + short .webm of the timing
- Accept: Stack moves for 200 ms, exits 150 ms ease-in.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/toast.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - swipe-to-dismiss uses `--toast-swipe-movement-*` through the same transform · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### MO-4 Send button hover scale gets `transition-[...]` and a reduced-motion branch

- Findings: F-04-19 · ~15 lines · wave 1 · depends on: #24865
- Files: `components/chat/ComposerAttachmentStrip.tsx`, `components/chat/ComposerControl.tsx`, `components/chat/ComposerPrimaryActions.tsx`
- Before: `new-thread-default-{dark,light}-1440x900.png` · After: `screens/MO-4/` same names + short .webm of the timing
- Accept: Send scales only under `motion-safe` and no longer uses `transition-all`.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/chat/ComposerAttachmentStrip.tsx apps/web/src/components/chat/ComposerControl.tsx apps/web/src/components/chat/ComposerPrimaryActions.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Visual only · upstream: yes, after #24865 merges · #24865: rebase after merge: ComposerControl.tsx, ComposerPrimaryActions.tsx

##### MO-5 Shared Spinner replaces hand-rolled loops (ADOPT #22100)

- Findings: F-19-06, F-13-16, F-03-36 (P3), F-05-32 (P3) · ~60 lines · wave 1 · depends on: none
- Files: `components/ui/spinner.tsx`, `components/chat/ThreadLineageWorkflowRow.tsx`, `components/chat/ThreadRelationshipsControl.tsx`, `components/chat/TimelineAssistantRows.tsx`, `pierre-tree-theme.ts`
- Before: `thread-codex-edits-default-{dark,light}-1440x900.png` · After: `screens/MO-5/` same names + short .webm of the timing
- Accept: No `animate-spin` or `animate-pulse` in the four files; loops stop under reduced motion.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/ui/spinner.tsx apps/web/src/components/chat/ThreadLineageWorkflowRow.tsx apps/web/src/components/chat/ThreadRelationshipsControl.tsx apps/web/src/components/chat/TimelineAssistantRows.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - Spinner adds `role="status"` · upstream: yes, after #24865 merges · #24865: rebase after merge: ThreadRelationshipsControl.tsx
- Note: Code from #22100 by `saphid`.

##### MO-6 Skeleton bars animate once; spinners fade in

- Findings: F-13-11, F-13-12 · ~110 lines · wave 2 · depends on: MO-1
- Files: `components/DiffPanelShell.tsx`, `components/chat/ChatComposer.tsx`, `components/clerk/MobileClientsUserProfilePage.tsx`, `components/cloud/CloudEnvironmentConnectList.tsx`, `components/diffs/DiffFileLoadingBoundary.tsx`, `components/files/fileSurfaceChrome.tsx` (+4)
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/MO-6/` same names + short .webm of the timing
- Accept: One shimmer per skeleton group, 0 CSS animations on a settings page at idle; spinners appear after 150 ms.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/DiffPanelShell.tsx apps/web/src/components/chat/ChatComposer.tsx apps/web/src/components/clerk/MobileClientsUserProfilePage.tsx apps/web/src/components/cloud/CloudEnvironmentConnectList.tsx ...` · `vp run --filter @t3tools/web typecheck` ; `vp run --filter @t3tools/client-runtime typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - visual parity (a container pulse also dims non-skeleton children: keep labels like "Totals" outside the... · upstream: yes, after #24865 merges · #24865: rebase after merge: ChatComposer.tsx

##### MO-7 Mobile: Android Remove animations leaves nothing invisible; MOBILE_MOTION tokens

- Findings: F-15-16, F-19-13 (P3) · ~110 lines · wave 0 · depends on: none
- Files: `mobile:src/components/ComposerToolbar.tsx`, `mobile:src/features/layout/workspace-pane-animation.ts`, `mobile:src/features/threads/ThreadComposer.tsx`, `mobile:src/features/threads/ThreadSettingsSheet.tsx`, `mobile:src/features/voice-input/ComposerDictationControl.tsx`, `mobile:src/features/voice-input/GlobalVoiceInputControl.tsx`
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/MO-7/` same names + short .webm of the timing, simulator capture
- Accept: Composer buttons, sheet rows and the model picker are visible with animations removed; five animations use `MOBILE_MOTION` (ADOPT #23348, BORROW #21757, #23888).
- Tests: no existing test beside these files · `vp lint apps/mobile/src/components/ComposerToolbar.tsx apps/mobile/src/features/layout/workspace-pane-animation.ts apps/mobile/src/features/threads/ThreadComposer.tsx apps/mobile/src/features/threads/ThreadSettingsSheet.tsx ...` · `vp run --filter @t3tools/mobile typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - needs a real Android device or emulator · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent
- Note: Code from #23348 by `unmanbearpig`.

##### MO-8 Menu/select enter, MorphIcon spring, four durations over 220 ms, inert class

- Findings: F-19-05 (P3), F-19-07 (P3), F-19-09 (P3), F-19-12 (P3) · ~60 lines · wave 2 · depends on: MO-1
- Files: `components/ConnectionStatusDot.tsx`, `components/MorphIcon.tsx`, `components/chat/ComposerAttachmentStrip.tsx`, `components/chat/ContextWindowMeter.tsx`, `components/cloud/CloudEnvironmentConnectList.tsx`, `components/settings/AuthorizedClientsSettings.tsx` (+2)
- Before: `command-palette-default-{dark,light}-1440x900.png` · After: `screens/MO-8/` same names + short .webm of the timing
- Accept: Menus scale-98 enter in 120 ms; MorphIcon settles <= 180 ms; no duration > 220 ms.
- Tests: `vp test run apps/web/src/components/chat/ContextWindowMeter.logic.test.ts` · `vp lint apps/web/src/components/ConnectionStatusDot.tsx apps/web/src/components/MorphIcon.tsx apps/web/src/components/chat/ComposerAttachmentStrip.tsx apps/web/src/components/chat/ContextWindowMeter.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low · upstream: yes, after #24865 merges · #24865: rebase after merge: menu.tsx

##### MO-9 Easing, panel exit and layout transitions inside the gate; highlight ring

- Findings: F-19-04 (P3), F-19-08 (P3), F-19-10 (P3), F-19-11 (P3) · ~220 lines · wave 3 · depends on: MO-8
- Files: `index.css`, `components/AppRouteModal.tsx`, `components/preview/PreviewPanelShell.tsx`, `components/settings/settingsLayout.tsx`, `components/ui/autocomplete.tsx`, `components/ui/combobox.tsx` (+6)
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/MO-9/` same names + short .webm of the timing
- Accept: Default ease-out, ease-in exits; panel gate covers small layout transitions; search highlight animates opacity once.
- Tests: no existing test beside these files · `vp lint apps/web/src/index.css apps/web/src/components/AppRouteModal.tsx apps/web/src/components/preview/PreviewPanelShell.tsx apps/web/src/components/settings/settingsLayout.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med · upstream: no: F-19-04 is a global feel change; open an issue first · #24865: rebase after merge: index.css, settingsLayout.tsx

### 13.14 Copy (10 chunks)

Section 10: terminology, casing, error voice and the guard test. Blocked chunks name the decision (D1, D2, D3) that unblocks them.

##### CP-1 One word for the machine behind a server

- Findings: F-20-04, F-11-20 · ~190 lines (adjusted from 110) · wave 1 · depends on: D1
- Files: `components/BranchToolbarEnvironmentSelector.tsx`, `components/chat/composerSend.logic.ts`, `components/chat/useComposerSend.ts`, `components/settings/SavedEnvironmentRows.tsx`
- Before: `settings-connections-default-{dark,light}-1440x900.png`, `welcome-default-{dark,light}-1440x900.png` · After: `screens/CP-1/` same names
- Accept: All user-facing strings use the chosen word (decision D1); machine/backend/host retired outside code.
- Tests: `vp test run apps/web/src/components/chat/composerSend.logic.test.ts` · `vp lint apps/web/src/components/BranchToolbarEnvironmentSelector.tsx apps/web/src/components/chat/composerSend.logic.ts apps/web/src/components/chat/useComposerSend.ts apps/web/src/components/settings/SavedEnvironmentRows.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: med - browser tests match several of these strings · upstream: yes, after #24865 merges · #24865: rebase after merge (see audit: same files or its tokens)
- Note: Blocked on decision D1 (section 15).

##### CP-2 Thread, not chat/conversation/task; branch, not ref

- Findings: F-20-05, F-20-07 · ~70 lines · wave 0 · depends on: none
- Files: `components/BranchPicker.tsx`, `components/BranchToolbar.logic.ts`, `components/DiffPanel.tsx`, `components/ThreadTerminalDrawer.tsx`, `components/chat/V2LifecycleRow.tsx`, `components/files/FileBrowserPanel.tsx`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/CP-2/` same names
- Accept: Strings use "thread" and "branch"; mobile "task" renamed.
- Tests: `vp test run apps/web/src/components/BranchToolbar.logic.test.ts apps/web/src/components/ThreadTerminalDrawer.test.ts apps/web/src/components/chat/V2LifecycleRow.logic.test.ts apps/web/src/components/GitActionsControl.logic.test.ts` · `vp lint apps/web/src/components/BranchPicker.tsx apps/web/src/components/BranchToolbar.logic.ts apps/web/src/components/DiffPanel.tsx apps/web/src/components/ThreadTerminalDrawer.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: low - mobile tests and any Maestro/E2E flows keyed on "New task" · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### CP-3 Credential vocabulary: token, link, code, client

- Findings: F-20-09 · ~55 lines · wave 2 · depends on: CP-1
- Files: `components/clerk/RemoveT3ConnectEnvironmentDialog.tsx`
- Before: `settings-connections-default-{dark,light}-1440x900.png` · After: `screens/CP-3/` same names
- Accept: One name per credential, one verb per undo.
- Tests: no existing test beside these files · `vp lint apps/web/src/components/clerk/RemoveT3ConnectEnvironmentDialog.tsx` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: low - area 11 owns the pairing flows · upstream: yes: fix-shaped, no #24865 overlap · #24865: independent

##### CP-4 Keybinding labels read as sentences

- Findings: F-20-02 · ~55 lines · wave 1 · depends on: D3
- Files: `components/settings/KeybindingsSettings.logic.ts`, `components/settings/KeybindingsSettings.tsx`, `components/settings/settingsSearch.ts`
- Before: `settings-keybindings-default-{dark,light}-1440x900.png` · After: `screens/CP-4/` same names
- Accept: Generated labels read "Thread: New without project"; docs updated in the same PR.
- Tests: `vp test run apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/components/settings/settingsSearch.test.ts` · `vp lint apps/web/src/components/settings/KeybindingsSettings.logic.ts apps/web/src/components/settings/KeybindingsSettings.tsx apps/web/src/components/settings/settingsSearch.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: low - `KeybindingsSettings.logic.test.ts:56` asserts conflict name "Terminal: Toggle" (unchanged) · upstream: yes, after #24865 merges · #24865: rebase after merge: settingsSearch.ts
- Note: Blocked on decision D3.

##### CP-5 One thread-state label set

- Findings: F-20-03 · ~55 lines · wave 1 · depends on: none
- Files: `components/Sidebar.logic.ts`
- Before: `home-default-{dark,light}-1440x900.png` · After: `screens/CP-5/` same names
- Accept: Sidebar, hover card and aria use one label set; "Done" no longer collides with "settle".
- Tests: `vp test run apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/Sidebar.logic.ts` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus low · risk: low - `Sidebar.logic.test.ts` and thread-row browser tests assert labels · upstream: yes, after #24865 merges · #24865: independent

##### CP-6 Sentence case in headings, nav and settings descriptions

- Findings: F-20-06, F-17-07, F-08-38 · ~165 lines · wave 1 · depends on: D2
- Files: `components/settings/DiagnosticsSettings.tsx`, `components/settings/settingsSearch.ts`, `components/CommandPalette.logic.ts`, `components/pullRequest/PullRequestsColumn.tsx`, `components/settings/KeybindingsSettings.logic.ts`, `components/settings/ProjectDefaultsSettings.tsx` (+4)
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/CP-6/` same names
- Accept: No Title Case outside status pills and proper names; Source Control casing follows decision D2; plain-language descriptions (BORROW #24148).
- Tests: `vp test run apps/web/src/components/settings/settingsSearch.test.ts apps/web/src/components/CommandPalette.logic.test.ts apps/web/src/components/settings/KeybindingsSettings.logic.test.ts apps/web/src/components/settings/SourceControlWritingSettings.browser.test.tsx` · `vp lint apps/web/src/components/settings/DiagnosticsSettings.tsx apps/web/src/components/settings/settingsSearch.ts apps/web/src/components/CommandPalette.logic.ts apps/web/src/components/pullRequest/PullRequestsColumn.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: med - settings-search ranking tests · upstream: yes, after #24865 merges; bundle: 2 carve-out PRs possible · #24865: rebase after merge: settingsSearch.ts, ProjectDefaultsSettings.tsx

##### CP-7 Placeholders: compact, mobile and search match the main composer

- Findings: F-20-08 · ~15 lines · wave 1 · depends on: #24865
- Files: `mobile:src/features/threads/ThreadDetailScreen.tsx`, `components/chat/ChatComposer.tsx`, `composerPlaceholder.ts`
- Before: `new-thread-default-{dark,light}-1440x900.png` · After: `screens/CP-7/` same names
- Accept: Compact, mobile and search placeholders follow the one-placeholder rule.
- Tests: no existing test beside these files · `vp lint apps/mobile/src/features/threads/ThreadDetailScreen.tsx apps/web/src/components/chat/ChatComposer.tsx apps/web/src/composerPlaceholder.ts` · `vp run --filter @t3tools/mobile typecheck` ; `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Haiku (mechanical) · risk: low - composer browser tests that query placeholder text · upstream: yes, after #24865 merges · #24865: rebase after merge: ChatComposer.tsx, composerPlaceholder.ts

##### CP-8 Replace 94 stock "An error occurred." descriptions

- Findings: F-12-11 · ~420 lines · wave 2 · depends on: S-6
- Files: `components/CommandPalette.tsx`, `components/GitActionsControl.tsx`, `components/Sidebar.tsx`, `components/chat/MarkdownFileLink.tsx`, `components/preview/PreviewView.tsx`, `components/settings/ArchivedThreadsPanel.tsx` (+1)
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/CP-8/` same names
- Accept: No stock description remains; each names what failed and why (DNA-V3).
- Tests: `vp test run apps/web/src/components/CommandPalette.logic.test.ts apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts apps/web/src/components/Sidebar.logic.test.ts` · `vp lint apps/web/src/components/CommandPalette.tsx apps/web/src/components/GitActionsControl.tsx apps/web/src/components/Sidebar.tsx apps/web/src/components/chat/MarkdownFileLink.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: high - many `*.browser.test.tsx` assert exact strings ("An error occurred.") · upstream: yes, after #24865 merges (split first: over 300 lines) · #24865: rebase after merge: GitActionsControl.tsx, Sidebar.tsx, SettingsPanels.tsx

##### CP-9 Toast titles: one prefix, noun-last; no jargon in toasts

- Findings: F-12-12, F-12-13 · ~215 lines · wave 1 · depends on: S-1
- Files: `components/BranchToolbarBranchSelector.tsx`, `components/CommandPaletteThemeItems.tsx`, `components/GitActionsControl.tsx`, `components/LegacySidebar.tsx`, `components/chat/ChatComposer.tsx`, `components/chat/useComposerContextImport.ts`
- Before: `settings-general-default-{dark,light}-1440x900.png` · After: `screens/CP-9/` same names
- Accept: No "Failed to"/"Unable to"/contractions in titles; "ref" and "Clipboard API unavailable" replaced.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts` · `vp lint apps/web/src/components/BranchToolbarBranchSelector.tsx apps/web/src/components/CommandPaletteThemeItems.tsx apps/web/src/components/GitActionsControl.tsx apps/web/src/components/LegacySidebar.tsx ...` · `vp run --filter @t3tools/web typecheck` · visual only: captures are the proof, no new test
- Model: Opus medium · risk: med - string assertions in ~25 browser tests · upstream: yes, after #24865 merges · #24865: rebase after merge: BranchToolbarBranchSelector.tsx, GitActionsControl.tsx, ChatComposer.tsx

##### CP-10 Guard test for toast and attribute copy

- Findings: F-12-30 (P3), F-20-17 (P3), F-12-31 (P3) · ~125 lines · wave 2 · depends on: CP-9
- Files: `components/GitActionsControl.tsx`, `components/BranchToolbarBranchSelector.tsx`, `components/ChatView.tsx`, `components/CommandPalette.tsx`, `components/desktopUpdate.logic.ts`, `components/files/AttachmentFilePreview.tsx` (+2)
- Before: none captured (code-read); add a `states.json` label in Phase 2 · After: `screens/CP-10/` same names
- Accept: `toast.logic.test.ts` fails on trailing periods, `...`, `!`, "Failed to", contractions in `toastManager.add`, `placeholder=`, `title=`, `aria-label=`.
- Tests: `vp test run apps/web/src/components/GitActionsControl.browser.test.tsx apps/web/src/components/GitActionsControl.logic.test.ts apps/web/src/components/ChatView.logic.test.ts apps/web/src/components/CommandPalette.logic.test.ts` · `vp lint apps/web/src/components/GitActionsControl.tsx apps/web/src/components/BranchToolbarBranchSelector.tsx apps/web/src/components/ChatView.tsx apps/web/src/components/CommandPalette.tsx ...` · `vp run --filter @t3tools/web typecheck` · new: the guard test itself
- Model: Opus low · risk: low · upstream: yes, after #24865 merges · #24865: rebase after merge: GitActionsControl.tsx, BranchToolbarBranchSelector.tsx

### 13.15 Deferred P3 findings

164 P3 findings are not in any chunk. They are polish that rides along when an area chunk is open, or waits for a later pass; none blocks a P1 or P2. Included P3s (40) are marked "(P3)" on their cards.

| Area | Deferred P3 ids                                                                                                                                |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 01   | F-01-19, F-01-20, F-01-22, F-01-23, F-01-24, F-01-25, F-01-26, F-01-27, F-01-28, F-01-29, F-01-32, F-01-33                                     |
| 02   | F-02-21, F-02-24, F-02-28, F-02-31, F-02-32, F-02-33, F-02-34, F-02-35, F-02-36, F-02-38                                                       |
| 03   | F-03-06, F-03-13, F-03-17, F-03-18, F-03-27, F-03-28, F-03-33, F-03-34, F-03-35, F-03-37, F-03-38, F-03-39, F-03-40                            |
| 04   | F-04-02, F-04-04, F-04-06, F-04-07, F-04-10, F-04-13, F-04-14, F-04-26, F-04-27, F-04-28, F-04-29, F-04-32, F-04-35, F-04-36, F-04-38, F-04-42 |
| 05   | F-05-27, F-05-28, F-05-29, F-05-30, F-05-31, F-05-33, F-05-34, F-05-35, F-05-36, F-05-37, F-05-38                                              |
| 06   | F-06-22                                                                                                                                        |
| 07   | F-07-09, F-07-10, F-07-22, F-07-23, F-07-24, F-07-25, F-07-29, F-07-36, F-07-39                                                                |
| 08   | F-08-06, F-08-11, F-08-12, F-08-16, F-08-22, F-08-35, F-08-36, F-08-37, F-08-39, F-08-41, F-08-45, F-08-46, F-08-47                            |
| 09   | F-09-16, F-09-25, F-09-30, F-09-31, F-09-32, F-09-35, F-09-36, F-09-37                                                                         |
| 10   | F-10-26, F-10-27, F-10-28, F-10-29, F-10-30, F-10-31, F-10-32, F-10-33, F-10-34, F-10-35, F-10-36, F-10-37                                     |
| 12   | F-12-26, F-12-28, F-12-29, F-12-32, F-12-33, F-12-34, F-12-36, F-12-37, F-12-38, F-12-39, F-12-40                                              |
| 13   | F-13-20                                                                                                                                        |
| 14   | F-14-11, F-14-14, F-14-15, F-14-19, F-14-21, F-14-22, F-14-24, F-14-25, F-14-27, F-14-28, F-14-29, F-14-30, F-14-31, F-14-32, F-14-33          |
| 15   | F-15-18, F-15-19                                                                                                                               |
| 16   | F-16-19                                                                                                                                        |
| 17   | F-17-10, F-17-11, F-17-12, F-17-13, F-17-14                                                                                                    |
| 18   | F-18-08, F-18-09                                                                                                                               |
| 20   | F-20-10, F-20-11, F-20-12, F-20-13, F-20-14, F-20-15, F-20-16, F-20-18, F-20-19                                                                |
| 21   | F-21-09, F-21-11, F-21-16, F-21-17, F-21-18, F-21-19, F-21-20                                                                                  |
| 22   | F-22-06, F-22-07, F-22-08                                                                                                                      |
| 24   | F-24-13, F-24-14, F-24-15                                                                                                                      |

### 13.16 Totals

| Track          |  Chunks |      P1 |      P2 | P3 included | Est. lines | Upstream: yes, no #24865 wait | Upstream: yes after #24865 | Fork only or held | Candidates <=300 lines |
| -------------- | ------: | ------: | ------: | ----------: | ---------: | ----------------------------: | -------------------------: | ----------------: | ---------------------: |
| Tokens         |      13 |      10 |      21 |           3 |       1380 |                             0 |                         12 |                 1 |                     12 |
| Hierarchy      |       8 |       2 |      15 |           5 |        725 |                             2 |                          6 |                 0 |                      8 |
| Polish-by-area |      85 |      25 |     141 |           6 |      11220 |                            35 |                         31 |                19 |                     64 |
| States         |      33 |      29 |      34 |           2 |       4645 |                            15 |                         16 |                 2 |                     30 |
| Edge cases     |      15 |       9 |      17 |           0 |       2555 |                             7 |                          4 |                 4 |                      9 |
| Customisation  |      11 |       0 |      11 |           8 |       1575 |                             0 |                          3 |                 8 |                      3 |
| Onboarding     |      17 |      14 |      17 |           1 |       1740 |                            11 |                          2 |                 4 |                     13 |
| Mobile         |      17 |      13 |      17 |           0 |       1955 |                             9 |                          6 |                 2 |                     15 |
| A11y           |      22 |      16 |      20 |           0 |       2780 |                             9 |                          7 |                 6 |                     16 |
| Motion         |       9 |       0 |      11 |          12 |        665 |                             3 |                          5 |                 1 |                      8 |
| Copy           |      10 |       0 |      14 |           3 |       1365 |                             2 |                          8 |                 0 |                      9 |
| **Total**      | **240** | **118** | **318** |      **40** |  **30605** |                        **93** |                    **100** |            **47** |                **187** |

Reading the table: **193 of 240 chunks are upstream candidates** (93 with no #24865 wait, 100 after it merges); 47 stay in the fork or are held. 55 chunks are fork bundles of independent small fixes; together they offer about 101 one-problem carve-out PRs on top. 6 candidates exceed 300 lines (P-08-5, S-17, E-11 are bundles that go upstream by carve-out; P-13-1, E-4, CP-8 are single L-sized findings that must be split first). Estimated size is 30605 lines across all chunks (formula estimates, not spiked). Findings covered: P1 118 of 118, P2 318 of 318, P3 40 of 204.

## 14. Upstream strategy

DRAFTS saved to disk only. Nothing in this section has been posted, opened or sent; `AGENTS.md` forbids opening a PR unless the developer asks, and Phase 1 ends at spec approval.

### 14.1 Rules we hold ourselves to

| Rule                                                                                                                                                                                                                                                              | Why (source)                                         |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| Assume unvouched: the fork owner is in neither `.github/VOUCHED.td` nor `TRIAGE_EXEMPTIONS.td`, so every PR, drafts included, goes through contribution triage                                                                                                    | CONTRIBUTING "Triage and deeper review"              |
| Unvouched UI PRs merge 37% overall: 69% at XS, 42% at M, 16% at L, 4% at XXL. Unvouched `fix(...)` merges 50%, `feat(...)` 10%. Maintainers cite a 500-line review limit. So: `fix(...)` titles, one problem each, under 150 lines where possible, never over 300 | `rejection-patterns.md` summary                      |
| Only 55% of merged UI PRs carried images, so images are necessary, not sufficient: each PR needs the problem, reproduction, what was checked and what was not                                                                                                     | CONTRIBUTING "Provide evidence"                      |
| Features, new defaults, new settings and flow changes need explicit maintainer approval linked in the PR; only a very small focused fix of an obvious bug, or a focused option for an established capability, is exempt                                           | CONTRIBUTING "Establish the problem and scope first" |
| UI PRs carry before/after screenshots; motion or timing carries a short recording; upload to GitHub, never commit PR-only assets                                                                                                                                  | CONTRIBUTING, AGENTS.md "Pull requests"              |
| ADOPT lines read `Code from #N by <login> (title)`, BORROW lines `Idea from #N by <login> (title)`, pasted from `PRS.md` "Credit ledger"; cherry-pick so authorship survives                                                                                      | `PRS.md`, part B 12.3                                |
| Model line names Claude Opus; no Gemini or Muse Wonder code anywhere                                                                                                                                                                                              | CONTRIBUTING "Models we do not accept"               |
| At most 3 upstream PRs open at once; send the next batch after one of the current batch is merged or reviewed. Check for a maintainer `takeover` before each; if the same fix lands, drop ours and keep the credit                                                | our policy (recommendation, section 15)              |
| Re-dry-run the five ADOPT diffs that touch #24865 files (#22436, #22100, #23573, #23166, #24438) after it merges                                                                                                                                                  | part B 12.1                                          |

### 14.2 Order of submission

| Batch                                            | Chunks                                                                                                                                                              | Gate                                                                                          | Notes                                                                                                                                 |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| U1: first PRs (XS/S, P1 or ADOPT, independent)   | P-01-5, O-3, P-07-1, P-01-1, P-09-1, S-4                                                                                                                            | none beyond the small-fix explanation (P-01-1 also closes issue #24191)                       | P-01-5 is ADOPT #22605; PRS.md lists a competing fix #24864, check merge state first. S-4 ships F-03-11 only; F-12-24 goes separately |
| U2: remaining independent P1 `fix` chunks        | E-12, M-11, P-06-3, P-12-1, E-1, P-14-1, M-3, S-1, S-31, O-1, A-10, A-18, P-03-2, P-06-4, P-11-4, S-32, P-07-2, A-12, A-21, E-9, O-4, P-05-1                        | after U1 reviews; one problem each                                                            | server-gated items are in 14.6                                                                                                        |
| U3: independent P2 `fix` chunks                  | MO-2, S-13, O-13, A-19, A-8, M-15, P-04-1, S-14, S-30, CP-2, H2, P-01-4, P-02-3, S-12, E-14, P-02-4, P-05-4, P-08-4, P-09-4, P-13-2, P-22-5, O-6, S-10, M-8, P-13-1 | after U2                                                                                      | P-13-1 (about 420 lines) must be split before it goes anywhere                                                                        |
| U3b: fork bundles, carved out one problem per PR | E-15, A-5, M-10, P-05-3, M-13, M-2, P-08-2, P-06-5, M-12, MO-7, P-08-9, P-14-2, M-14, P-11-2, P-21-8, P-09-2, E-8, P-08-7, P-09-3, P-11-1, P-08-8, E-11, P-08-5     | per carve-out, same gate as U3                                                                | each card says how many carve-outs; the fork keeps the whole bundle                                                                   |
| U3c: independent but waiting on another chunk    | MO-3, A-20, A-7, CP-3, O-10, O-11, O-12, O-17, O-16, S-21, H3, O-7, S-27, S-24, S-19, S-20, S-17                                                                    | after their parent chunk lands (S-2, MO-1, O-9, T-chunks)                                     |                                                                                                                                       |
| U4: after #24865 merges                          | the 100 chunks marked "yes, after #24865 merges"                                                                                                                    | rebase onto merged main; tokens first (T1, T4, T10 to T12), then the chunks that consume them | do not start before the merge (D-006)                                                                                                 |
| U5: gated                                        | the "no" chunks in 14.3                                                                                                                                             | Ideas post, triaged issue or owner decision first                                             |                                                                                                                                       |

### 14.3 Fork only, and why

| Reason                                                                 | Chunks                                                                                                                                                |
| ---------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| New setting, default or flow: needs an approved Ideas post first       | C-1, C-2, C-5, C-6, C-7, C-8, C-9, C-11, O-8, P-01-6, P-14-3, P-21-1 (part 2), P-21-3, P-21-5, P-21-6, P-21-7, P-21-9                                 |
| New surface or interaction: maintainer buy-in                          | P-05-5, P-06-2, P-06-6, P-14-7, P-14-8, A-13, A-14, A-17, M-16, S-33, E-7                                                                             |
| Owner design territory (visual identity, tokens, copy policy)          | P-01-7, P-11-3, P-14-6, O-15, A-9, E-10, MO-9                                                                                                         |
| Server change or crash needing a reproduction: file an issue, not a PR | S-15, O-2, M-9, A-15                                                                                                                                  |
| Shared files or #24865 files: coordinate or wait                       | E-2, E-6, O-5 (palette rows alone are eligible now), P-14-5 (the toast file alone is eligible), P-12-2 (`NotificationSettings.tsx` alone is eligible) |
| Held or no code                                                        | A-22 (owner calls), T0 (verification)                                                                                                                 |

Everything else (193 chunks) is an upstream candidate: 93 now and 100 after #24865 merges.

### 14.4 Draft PR bodies

Bodies (indented two spaces inside the fences so they cannot be read as section headings; strip the indent when posting) follow `.github/pull_request_template.md` (Problem, Change, Scope and approval, Verification, model line). Screenshot and result slots are placeholders to fill from the Phase 2 run; every "before" fact below is from the Phase 1 audit at upstream `5f64c5eb`.

**Draft 1: P-01-1**

```md
Title: fix(web): collapsed sidebar stays collapsed after reload

## Problem

Collapsing the sidebar writes a `sidebar_state` cookie that nothing reads (`ui/sidebar.tsx:25-26,117,127-133`; `AppSidebarLayout.tsx:390` hard-codes `defaultOpen`), so the choice is lost on every reload and relaunch (#24191). Where `cookieStore` does not exist (Firefox, plain-HTTP origins) the toggle also throws an unhandled error.

## Change

`SidebarProvider` initialises `_open` from `t3code:sidebar-open:v1` with a synchronous lazy `useState` (same pattern as `readInitialThreadSidebarWidth`, `AppSidebarLayout.tsx:115-125`) and writes the key in `setOpen`. The `SIDEBAR_COOKIE_*` constants and the `cookieStore.set` call are removed. The mobile sheet state (`openMobile`) stays unpersisted; first-run default stays expanded.

## Scope and approval

Very small, focused fix of an obvious bug: the code advertises persistence it does not do, and it is reported as #24191. One problem; no new setting, no change to defaults. `ui/sidebar.tsx` and `AppSidebarLayout.tsx` are not in #24865.

## Verification

- Before (upstream main `5f64c5eb`, Chromium, 1440x900): collapse via "Toggle main sidebar", `document.cookie` shows `sidebar_state=false`, reload: `data-sidebar-state="expanded"`.
- New browser test: collapse, rerender, expect `data-sidebar-state="collapsed"`. `vp test run apps/web/src/components/ui/sidebar...` : [result].
- Not checked: Electron relaunch; browsers with storage disabled (the lazy initialiser must fall back to `defaultOpen`).
- Before: ![before](UPLOAD: 01-app-shell-sidebar-collapsed-light-1440x900.png) After: ![after](UPLOAD: P-01-1/01-app-shell-sidebar-collapsed-light-1440x900.png)

Made with Claude Opus in Claude Code, running in T3 Code.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Draft 2: A-4**

```md
Title: fix(web): name the branch picker for screen readers

## Problem

The branch picker trigger has no accessible name. A screen reader announces "combobox, main" with no purpose; axe reports `button-name` (critical) on `/`, on a thread and with the terminal open, one node each. `BranchToolbarBranchSelector.tsx:705` renders `<ComboboxTrigger render={<ThreadDetailsControl .../>}>` with no `aria-label`.

## Change

`aria-label={`Branch, ${triggerLabel}`}` on both triggers (panel and composer modes). No visual change.

## Scope and approval

Very small, focused accessibility fix of an obvious defect; one line per trigger. A scan of every icon-size `Button` found no other unnamed control. The file is also edited by #24865 for style only, so this PR is opened after it merges or rebased onto it.

## Verification

- axe on `/`, a thread and terminal-open: [0 nodes after; 1 node each before].
- CDP accessibility tree: [`combobox "Branch, main"` after; `combobox: main` before].
- Searched the test suite for role-name queries on "main": none. `vp test run apps/web/src/components/BranchToolbar...` : [result].
- No screenshot: nothing changes visually, so the evidence is the axe output and the tree dump: [attach both].
- Not checked: real VoiceOver or NVDA announcement (accessibility tree only).

Made with Claude Opus in Claude Code, running in T3 Code.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Draft 3: S-4 (F-03-11 only)**

```md
Title: fix(web): Copy code and Copy table work over plain HTTP

## Problem

Over `npx t3` on a LAN or Tailscale address (a non-secure context) `navigator.clipboard` is undefined. "Copy code" and "Copy table" return early with no feedback: no toast, nothing copied, aria-label unchanged. The message-level copy on the same page works because it goes through `writeTextToClipboard`, which falls back to `execCommand` (`hooks/useCopyToClipboard.ts:55-135`). Reports: #8361, #23930, #20207, #15927, #23619, #21006.

## Change

`MarkdownCodeBlock.tsx:171-175` and `MarkdownTable.tsx:72-80` call `writeTextToClipboard(code, "code block")` and `writeTextToClipboard(markdownOrCsv, "table")`, keep the 1,200 ms copied morph, and on rejection call `reportMarkdownActionFailure` plus `showAnchoredCopyErrorToast(ref, error)`, as `MessageCopyButton` does. The table menu items go through the same path.

## Scope and approval

Small, fix-shaped, one problem, remote-ready path from AGENTS.md. Neither file is in #24865. The unrelated "bare 'Failed to copy' toast has no tone" polish (F-12-24) is a separate PR.

## Verification

- Before (Chromium, `navigator.clipboard` stubbed undefined): click Copy code: aria-label stays "Copy code", no toast, clipboard empty; message copy shows "Copied!".
- New browser test in `ChatMarkdown.browser.test.tsx`: stub `navigator.clipboard` undefined, click Copy code, assert the `execCommand` copy and the morph; second case asserts the failure toast. `vp test run apps/web/src/components/ChatMarkdown.browser.test.tsx` : [result].
- Before: ![before](UPLOAD: 03-copy-no-clipboard-api-light-1440x900.png) After: ![after](UPLOAD: S-4/03-copy-no-clipboard-api-light-1440x900.png)
- Not checked: Safari, iOS web over HTTP.

Made with Claude Opus in Claude Code, running in T3 Code.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Draft 4: P-09-1**

```md
Title: fix(web): the sign-in command for a custom Claude config directory sets CLAUDE_CONFIG_DIR

## Problem

A second Claude instance with `CLAUDE_CONFIG_DIR=<dir>` shows "Claude Code is not authenticated. Run `claude auth login` and try again." in the provider card, the in-thread banner and the picker tooltip. That command signs in the default config directory, not the instance the user is looking at. The thread error row already gives the correct command; `docs/user/providers-claude.md` requires the variable.

## Change

For Claude and Codex instances that are unauthenticated and have a `homePath` (`CLAUDE_CONFIG_DIR`; `CODEX_HOME` for the Codex shadow home), render a copyable command under the status in the editor and in `ProviderStatusBanner`: `CLAUDE_CONFIG_DIR="<path>" claude auth login` (POSIX) or the `set` / `$env:` form chosen from `environment.platform.os`. The server message stays as the fallback. A pure formatter holds the quoting.

## Scope and approval

Small, fix-shaped: three surfaces disagree with the fourth about the same command. No new setting, no server change (the long-term fix in the server message builder is out of scope here).

## Verification

- Before (Claude 2nd instance, light, 1440x900): ![before](UPLOAD: 09-providers-second-claude-added-light-1440x900.png)
- Unit tests for the formatter, POSIX and Windows, including a path with spaces. `vp test run apps/web/src/components/settings/...` : [result].
- After: ![after](UPLOAD: P-09-1/09-providers-second-claude-added-light-1440x900.png)
- Not checked: running the Windows forms on a Windows host; the Codex shadow-home variant against a real login.

Made with Claude Opus in Claude Code, running in T3 Code.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

**Draft 5: O-3**

```md
Title: fix(web): /new without a prompt opens a new thread instead of an error page

## Problem

`t3code://new` maps to `/new` with an empty query. `parseNewThreadLink` returns "This link has no prompt." whenever `prompt` and `pr` are absent, and `routes/_chat.new.tsx:11-22` renders "Could not open the link" in a `SidebarInset` with no header, no drag strip on desktop and no button back.

## Change

In `NewThreadLinkRoute`: a bare `/new` (no recognised params) renders `<Navigate to="/" replace />`, so it behaves like "new thread". A genuinely malformed link renders the existing `LinkPage` (exported from `NewThreadLinkView.tsx`) with the header and a "New thread" button; the description reads `${error} Start a new thread instead.`

## Scope and approval

Small, focused fix: an error state with no way out for a URL typed correctly. One problem; no new route or setting. The hosted prompt-link landing is a separate path and unchanged.

## Verification

- Before: ![light](UPLOAD: 10-first-run-and-empty-states-new-no-prompt-light-1440x900.png) ![dark](UPLOAD: ...-dark-1440x900.png) ![390](UPLOAD: ...-light-390x844.png)
- New route test for bare `/new` (redirects) and a malformed link (header + action). `vp test run packages/shared/src/promptLinks...` and the route test : [result].
- After: same three names under O-3/.
- Not checked: the Electron `t3code://new` deep link on a signed build.

Made with Claude Opus in Claude Code, running in T3 Code.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
```

### 14.5 Draft Ideas posts (direction approval)

CONTRIBUTING sends proposals to Ideas discussions and requires explicit maintainer approval of direction and scope, linked in the PR. Each draft asks one question and names the PRs it would unlock. Not posted.

**Idea 1: tokens and the elevation ladder**

```md
Category: Ideas
Title: Design tokens: one elevation ladder, three text tiers, one hit-area utility

#24865 settles the radius scale, icon stroke, fonts and chat text opacity. This asks about the layer underneath it, as additive tokens on top of that PR (we will not start before it merges).

What the audit measured at 5f64c5eb:

- Shadows: 45 distinct strings across 225 uses, 12 recipes for floating things (menu, dialog, route modal, toast, glass tooltip, tooltip, autocomplete, sheet, hover card, image dialogs, standalone page, mini player).
- Text: 14 alpha steps on `text-muted-foreground`, 175 sites, 1.47 to 3.88:1 in light; 11 neutral levels across 7 views.
- Hit areas: Switch is 38x22 on touch, several raw buttons are under 24 px for a mouse.

Proposal (no new library, no gradient, glow or bounce):

- Three shadow tokens, flat in-flow surfaces unchanged, composer keeps its own token.
  - `--shadow-lift` (glass tooltip, toast, minimap, hover card): light `0 12px 28px -18px rgb(0 0 0 / 40%)`, dark `0 14px 32px -18px rgb(0 0 0 / 75%)`.
  - `--shadow-popup` (menu, select, popover, combobox, autocomplete, sheet): light `0 16px 40px -18px rgb(0 0 0 / 55%)`, dark `0 18px 44px -18px rgb(0 0 0 / 80%)`.
  - `--shadow-dialog` (dialog, palette, Settings and Usage, image dialogs): light `0 24px 64px -24px rgb(0 0 0 / 65%)`, dark `inset 0 1px rgb(255 255 255 / 4%), 0 24px 72px -20px rgb(0 0 0 / 90%)`.
- Three text tiers (primary, secondary, quiet = secondary at 11 px). An oxlint rule `no-text-opacity-on-muted` at warn, then a codemod landed one directory per PR (settings, chat, sidebar and pull requests, root), then the rule at error.
- `@utility hit-area`: 24 px floor for fine pointers, 44 px for coarse, visual size unchanged.
- `--destructive-solid` so white on a destructive button reaches 4.5:1 (3.81 and 3.53 today).

Untouched: the #0a0a0a canvas, the blue switch accent, three-line sidebar rows, the composer model colour, 75% read titles.

Evidence: [annotated before/after captures: menu, toast, dialog in light and dark].

Ask: is this direction acceptable? If yes, first PRs are `hit-area` (about 180 lines) and `--destructive-solid` (about 60), each under 300 lines; the shadow ladder and the codemod stay in the fork until you say go.

Made with Claude Opus in Claude Code, running in T3 Code.
```

**Idea 2: onboarding wiring**

```md
Category: Ideas
Title: Onboarding: skip, check again, and a way back to setup (no new tour, no new step)

The welcome wizard exists and is good for the happy path. The audit found the gaps are wiring, not design. Principle: three presses to a first message for a ready user, nothing a power user cannot skip with Escape, every exit has a way back.

Proposed (all reuse existing components; wireframes in the audit repo):

1. One local computer: skip the Computers step (stepper shows Agents, Projects). This is the only flow change; it is the part that needs your approval.
2. Skip setup button and Escape finish without importing; initial focus on Continue; X no longer completes silently.
3. Agents step: "Checked just now" with one refresh on window focus (no polling); "Other agents" row linking to Providers; the default permission mode shown on one line ("Full access"), default unchanged.
4. Projects step: "Add a project..." using the existing palette folder browser; "Importing N of M..."; enabled Continue when there is nothing to import.
5. Re-entry: Settings > General > About "Setup" and "Release notes"; palette "Open setup" and "Set up agents"; composer chip "Set up an agent" when no provider is usable.
6. Mobile Home: "No computer connected" with three steps and a "Connect a computer" action; "No projects yet" with "Add project".
7. Telemetry notice names `T3CODE_TELEMETRY_ENABLED=false` instead of pointing at a policy.

Not proposed: tour, sample project, coach marks, release-notes modal, account creation, any new setting, keybinding or permission mode.

Server dependencies we will file as issues rather than PRs: web mode never receives `bootstrapProjectCreated` so the wizard is skipped, and `/` opens an arbitrary existing thread instead of a draft.

Ask: approval of (1), and confirmation that (2) to (7) can go as small `fix(...)` PRs. Related: #10961, #22411, #23122, #24150.

Made with Claude Opus in Claude Code, running in T3 Code.
```

**Idea 3: reduced motion**

```md
Category: Ideas
Title: Reduced motion: one global rule, and what shows "working"

Measured on main: there is no global `prefers-reduced-motion` rule. Under `reduce` the command palette still runs 3 transitions, toasts still move for 500 ms, and press feedback scales. Durations in use span 100 to 650 ms. An idle thread has 0 running animations either way, and keyframes are already gated, so the gap is transitions.

Proposal, XS (about 45 lines), next to `.no-transitions` in `index.css`:

      @media (prefers-reduced-motion: reduce) {
        *, *::before, *::after {
          transition-duration: 0.01ms !important;
          transition-delay: 0s !important;
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          scroll-behavior: auto !important;
        }
      }

0.01 ms, not 0: Base UI waits on `getAnimations()`. A Playwright census with `reducedMotion: "reduce"` (palette, popover, tooltip, switch, toast) asserts no non-zero transition. Panels stay instant by default; the Panel animations slider is unchanged. It closes F-12-16 (toasts), F-01-31 (route modals), F-16-13 and the reduced half of F-04-19.

Open question: under reduce the Spinner and "Working" dots become static glyphs. Status must not lie, so what carries "still working"? Our default: static glyph plus the ticking text ("Working 9s"). Alternative: an opacity-only stepped pulse with no movement.

Not proposed: an in-app override (a separate Idea if wanted), changes to durations, bounce or springs.

Ask: approve the global rule and pick the liveness cue.

Made with Claude Opus in Claude Code, running in T3 Code.
```

### 14.6 Draft issues (server-gated; issue drafts only, no Phase 2 code)

Two findings have a server cause that a UI contribution should not change unasked (`apps/server` is outside the UI scope). They go upstream as issues with the audit evidence. Not filed.

**Issue A: S-15 (F-03-15)**

```md
Title: Claude threads show the whole answer at once: text deltas are never projected

## Problem

Claude answers appear in one chunk after about 8 s of "Thinking". Claude Haiku 5.5, Low effort, 3 KB answer: 66 samples at 120 ms show "Working for ..." / "Thinking" and no streaming markdown node; `scrollHeight` jumps 848 to 2,959 inside one sample. The same UI streams Codex text incrementally (2 to 38 blocks over 7 s).

## Evidence

- `ClaudeAdapterV2.ts:1395` sets `includePartialMessages: true`, so the SDK emits partials.
- The `stream_event` branch (`:7650-7705`) handles `message_start`, `message_delta` (usage) and thinking blocks, then returns. There is no `text_delta` case; `grep text_delta apps/server/src` finds nothing.
- Assistant text is emitted only from the completed `assistant` message through `emitAssistantTextArtifacts` (`:6970-7009`) with `streaming: false` hard-coded (`:3343,3365`).
- Codex streams through `makeProviderTextDeltaCoalescer` at 50 ms with `streaming: !completed` (`CodexAdapterV2.ts:206,3244,3266,3362`).

## Impact

For one of the two primary providers the stream-fade, incremental code blocks and the "Stop early" decision never happen. The web UI is correct; we are not proposing a client-side typewriter.

## Ask

Please triage as an adapter bug. We can send the change if you confirm the direction.

Made with Claude Opus in Claude Code, running in T3 Code.
```

**Issue B: O-2 (F-10-01, F-10-03)**

```md
Title: First launch over `npx t3` skips the welcome wizard, and `/` opens an arbitrary thread

## Problem

In web mode the lifecycle `welcome` payload carries `bootstrapProjectId` and `bootstrapThreadId` but nothing sends `bootstrapProjectCreated` or `bootstrapThreadCreated` (contract: `packages/contracts/src/server.ts:785-786`). `serverRuntimeStartup.ts:274-330` calls `projects.bootstrap(...)`, which returns `{ project, created }`, and discards `created`. `isFreshFirstRunWorkspace` (`onboarding/firstRun.logic.ts:73-107`) is therefore false and `resolveFirstRunDecision` returns `app` with `persistCompletion: true`: the user is marked onboarded without setup being shown. `docs/user/welcome-wizard.md:3-4` promises setup on web, and `firstRun.logic.test.ts:164-222` passes only because its fixtures set the flags by hand.

Separately, `/` is replaced with `payload.bootstrapThreadId` (`routes/__root.tsx:535-577`): six of six fresh browser contexts ended on an old pinned thread of the cwd project, not a draft, so `IndexDraftLanding` never runs.

## Proposed

Server: `resolveAutoBootstrapWelcomeTargets` returns `bootstrapProjectCreated: created` and `bootstrapThreadCreated: launched !== undefined` (the spread into `welcome.publish` at `:645-658` already carries them). Client, after that: navigate to the bootstrap thread only when `bootstrapThreadCreated === true` (`__root.tsx:558`).

## Caveats

The wizard skip was derived from the live payload keys plus the code path, not reproduced end to end (the test server had several projects). `t3 ./my-project` for a project that already has threads would stop opening its first thread; if you want "resume where I was", the target is the last-viewed thread.

Made with Claude Opus in Claude Code, running in T3 Code.
```

## 15. Decisions

Every line carries a recommendation. "Owner" = `t3dotgg` (design and product calls in #24865's PR body); "maintainer" = triage and approval (juliusmarminge and the other logins in `TRIAGE_EXEMPTIONS.td`); "us" = this fork's operator. Where a decision is pending, the spec already uses the stated default.

1. **#24865 rebase timing.** Recommend: cut the Phase 2 integration branch from upstream `main` after #24865 merges; token chunks (T1 to T12) land as a delta on its end state; wave-0 chunks may start now on current `main` because they do not touch its files. Decides: us (branch), owner (merge time). Opens D-006.
2. **If #24865 is still open when Phase 2 is approved.** Recommend: run wave 0 only, and cut a fork-only branch from its head `t3/ui-polish-95` for wave-1 work that is never sent upstream; re-dry-run the five overlapping ADOPT diffs when it merges. Decides: us.
3. **"computer" vs "environment" (D1).** Recommend A: "environment" everywhere except onboarding, hosted pages and mobile first-run, where "computer" stays (matches the AGENTS.md glossary, 117 existing uses vs 11, and Settings page names); retire "machine", "backend", "host" in user strings. Blocks CP-1, CP-3, O-16, O-17. Decides: owner.
4. **"Source Control" vs "Source control" (D2).** Recommend A: "Source control" everywhere (DNA-V1 sentence case; the page rows and mobile already say it) plus a one-word docs edit. Blocks CP-6. Decides: maintainer.
5. **Capital after the colon in generated keybinding labels (D3).** Recommend A: capital ("Thread: New without project"), matching the docs and the explicit label map; update `docs/user/keybindings.md` in the same PR. Blocks CP-4. Decides: maintainer, minor; we default to A if silent.
6. **Reduced-motion liveness cue (D-M1).** Recommend: static glyph for Spinner and Working dots plus the ticking text ("Working 9s"), no pulse; revisit the stepped opacity pulse only if the text cue tests poorly. Pairs with F-03-08, which removes the ticking timer while waiting on approval. Blocks the wording of MO-1 and MO-5. Decides: owner, via Ideas draft 3.
7. **Compact-before-send off switch (#17170).** Recommend: no new setting. The follow-up sweep found it already exists (Settings, General, "Compact idle threads" with Never, plus a per-provider override); link the "Compact next" pill tooltip to it (note on T0) and answer the Ideas thread. Decides: us (tooltip), maintainer (thread reply).
8. **Adopt the 4/6/8/12/16 radius ladder verbatim.** Recommend: yes, verbatim, no extra rung; T2 only derives `--control-radius` from the ladder and puts the sidebar family on one rung. Treat the optional `--radius-xs` for swatches of 8 px or less as deferred, leaving the four 2 px sites as a declared exception. Mobile gets its own four-value ladder (M-8). Decides: owner.
9. **Composer shadow in light.** Recommend: keep #24865's `0 1px 2px / 5%` for the composer, do not fold the composer into L1 (T3 leaves its token alone), and record the exception in DNA-S5. Decides: owner.
10. **F-16-07 composer focus indicator (conflicts with neutral controls).** Recommend: a neutral border-colour change using `--contrast-muted-foreground` (4.71 / 5.08:1), no blue ring; it keeps the quiet look and passes WCAG. Held in A-22. Decides: owner.
11. **F-16-20 user-bubble label (4.05:1 light, bubble 1.16:1 against canvas).** Recommend: label to `text-muted-foreground`, no bubble border. Held in A-22. Decides: owner.
12. **F-18-09 ring and shadow on the active sidebar row.** Recommend: no code change; amend DNA-S4 with one sanctioned in-flow exception. Decides: owner.
13. **Fork-only vs upstream, Tokens.** Recommend: fork first; upstream T1, T4, T10 to T12 as small follow-ups after the merge; T3 (shadows), T5 and T6 to T9 (codemod and lint) only after Ideas draft 1 is acknowledged. Decides: us, then maintainer.
14. **Hierarchy.** Recommend: fork all; upstream H2, H3, H6 as `fix(...)` slices after the merge; H1, H5 as follow-ups to #24865's settings titles. Decides: us.
15. **Polish-by-area.** Recommend: upstream every `yes` chunk in the order of 14.2; keep the 19 "no" chunks in the fork until an Ideas post or issue is triaged. Decides: us, then maintainer.
16. **States.** Recommend: upstream most (S-1, S-4, S-12, S-13, S-14, S-25 first); S-2 (confirm contract across 36 call sites) lands in the fork first and goes upstream one surface at a time; S-15 and S-33 stay out until an issue or Ideas post exists. Decides: us, then maintainer.
17. **Edge cases.** Recommend: upstream E-1, E-8, E-9, E-11, E-12, E-14 (bug-shaped); the rest stay in the fork. Decides: us.
18. **Customisation.** Recommend: fork-only until an Ideas post is approved (8 of 11 chunks add or change a setting or default); C-3, C-4, C-10 follow #24865. Decides: maintainer.
19. **Onboarding.** Recommend: upstream the wiring chunks as `fix(...)` (O-3, O-6, O-7, O-9 to O-14, O-16, O-17); file O-2 as a server issue; hold O-5 (chip and banner), O-8 (flow) and O-15 (policy copy) for Ideas draft 2. Decides: maintainer.
20. **Mobile.** Recommend: upstream the native chunks that borrow open PRs only after checking those PRs did not land (about 20 graded mobile PRs overlap); M-9 needs a device reproduction; M-16 waits for approval. Android stays code-read until a device exists. Decides: us.
21. **A11y.** Recommend: upstream all `yes` chunks (small, fix-shaped); hold A-9, A-13, A-14, A-15, A-17 (new behaviour or an unreleased text API) and A-22. Decides: us, then maintainer.
22. **Motion.** Recommend: MO-1 via Ideas draft 3, then MO-2 to MO-8 as small `fix(...)` PRs; MO-9 (global easing) needs an issue first. Decides: owner for MO-1, us otherwise.
23. **Copy.** Recommend: nothing upstream until D1 to D3 are answered; CP-10 (guard test) follows CP-9 because it must pass on day one. `extoci` owns copy PRs #24147, #24148, #24150, so coordinate wording before CP-6 and S-9. Decides: maintainer.
24. **Server-gated items** (F-10-01, F-10-03, F-03-15, F-09-30, in-app telemetry toggle). Recommend: file the two issue drafts in 14.6 (and a third for F-09-30 and the telemetry toggle when needed) with the audit evidence; ship only the gated UI half; never fake the server behaviour in the client. Decides: maintainer.
25. **Pace of upstream PRs.** Recommend: at most 3 open at once, U1 first, one problem each, under 150 lines where possible. Decides: us.
26. **Area 22 (performance feel).** Recommend: chunks P-22-1 to P-22-5 are in 13.6; F-22-01 (P1) is the budget and bench on top of the E-6 fix; the three P3 stay deferred. Re-measure each on a production build (the audit quotes prod numbers, one host, medians of 3, headless 60 Hz clock) and do not claim a win from dev-server numbers. Decides: us.
27. **RUNLOG D-001 (fork name `AatmanAJ/t3code`).** Recommend: keep; the old name redirects. Open until the user confirms. Decides: us.
28. **RUNLOG D-002 (public fork, synthetic fixtures only).** Recommend: keep `--home-dir /tmp/t3code-overhaul --no-seed` and never read `~/.t3/userdata`; add a masking pass over every new capture. Decides: us.
29. **RUNLOG D-004 (browser verification vs AGENTS.md).** Recommend: ask for explicit consent again at the start of Phase 2, since AGENTS.md requires it for browsers and computer use; the kickoff covered Phase 1. Decides: us (ask the user).
30. **RUNLOG D-006 (moving baseline).** Same as 1 and 2; remains open until the user approves the spec. Decides: owner for the merge, us for the branch.
31. **RUNLOG D-003, D-005, D-007, D-008.** Closed in the run (provider list wider than six, existing welcome wizard audited, wave 2 started early, Sonnet writers); no action, noted so the log is complete.

## 16. Run log summary and hard stops

### 16.1 Condensed timeline (from `RUNLOG.md`, times as logged)

| Time           | Event                                                                                                                                                                                                                                                                  |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 12:27          | Run start. Fork `AatmanAJ/t3code` cloned, `upstream` added, checkout at upstream `5f64c5eb`; `vp i` done in about 1 minute. Rule files read                                                                                                                            |
| 12:33 to 12:40 | Playwright installed outside the repo (`/tmp/t3code-pw`), headless Chromium paired, web boot verified; seven first agents spawned (4 prior-art sweeps, MAP, DOCS-DIGEST, DNA); Electron dev app boots; synthetic fixture project added                                 |
| 12:50 to 13:20 | Claude provider id corrected to `claudeAgent`; host check (Xcode, iOS simulator, no Android tooling); CocoaPods installed with Homebrew; iOS dev client built and installed on "iPhone 17"                                                                             |
| 13:25 to 13:45 | MAP.md (552 lines), fixtures expanded to 142 threads, baseline capture started, DNA.md (110 DNA rules, 26 drift leads)                                                                                                                                                 |
| 13:50 to 14:05 | rejection-patterns.md (10,092 closed PRs), open-prs.md (2,220 open), baseline done: 252 PNGs, 59 MB, 0 failures                                                                                                                                                        |
| 14:15          | **Key finding:** owner PR #24865 "UI design overhaul" (+502/-272, 55 files). D-006: treat it as a moving baseline. PRS.md done: 85 diffs read, 16 ADOPT / 53 BORROW / 16 SKIP                                                                                          |
| 14:20          | OWNER-DIRECTION.md written; wave-1 agents told to tag every finding against #24865                                                                                                                                                                                     |
| 14:35 to 15:30 | Wave 1 (areas 01 to 05, 07, 09, 12) reports in; wave 2 launched early at 15:08 (D-007)                                                                                                                                                                                 |
| 15:15          | Checkpoint commit `d711b4a3` on branch `ui-overhaul/audit` (993 files, 229 MB), not pushed                                                                                                                                                                             |
| 15:45 to 15:58 | Areas 14 and 10 done; shared Playwright session verified                                                                                                                                                                                                               |
| about 16:xx    | **HS-001:** six wave-2 agents hit HTTP 429 (Sonnet session limit, resets 17:10 Europe/London)                                                                                                                                                                          |
| 17:39 to 17:50 | Same agents resumed via SendMessage; wave 2 complete (areas 06, 08, 11, 13, 15, 16)                                                                                                                                                                                    |
| 17:41 to 18:12 | Wave 3 (17, 18, 19, 20, 21, 23, 24) with lean briefs                                                                                                                                                                                                                   |
| 18:13          | Area 22 started alone; follow-up sweep started; findings index generated: 632 findings (P1 116 / P2 316 / P3 200). D-008: the user asked for a cheaper run, so spec parts A (1 to 6), B (7 to 12) and C (13 to 16) go to Sonnet writers and Fable reviews and stitches |
| 18:30          | Part C drafting started                                                                                                                                                                                                                                                |
| 19:23          | Area 22 asked to wrap up with the measurements it has; it finished with 8 findings (F-22-01 P1, F-22-02 to 05 P2, F-22-06 to 08 P3), measured on a production build at 1x and 4x CPU throttle plus the dev server. Chunked as P-22-1 to P-22-5 (13.6)                  |
| 18:45          | Follow-up sweep done: 326 items, 150 resolved from code, 88 live probes for Phase 2, 88 duplicates; severity changes recorded (13.1)                                                                                                                                   |

Yield: 24 areas, all with findings (640: P1 117 / P2 320 / P3 203 as indexed), 8 onboarding wireframes, 1,305 UI-relevant open PRs graded down to 85 diffs read. Area 22 (performance feel) was the last to finish: 8 findings (P1 1 / P2 4 / P3 3).

### 16.2 Hard stops

| Id           | When               | What happened                                                                                                                      | Default taken                                                                                              | State                                                                                                                                             |
| ------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| HS-001       | about 16:xx London | Six wave-2 agents (06, 08, 11, 13, 15, 16) terminated by HTTP 429 "session limit, resets 17:10 Europe/London" on claude-sonnet-5-5 | Wait for the reset, resume the same agents at 17:39 (their context was saved), leave areas 10 and 14 alone | Closed. Budget note: from then on agents reuse baseline captures, cap about 20 findings, return 150 words, and spec drafting is delegated (D-008) |
| Phase 1 stop | at spec approval   | The run ends here by design: no PR, no post, no push of code, nothing sent to upstream                                             | n/a                                                                                                        | Open until the user approves the spec                                                                                                             |

### 16.3 Environment facts to reproduce

| Item                  | Fact                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Host                  | macOS (Darwin 27.0.0), Node 24.22.1 on PATH; `vp` v1.0.0 (vite-plus 1.4.0) provides Node 26.12.1; pnpm 12.14.0 via `vp`; `claude` and `codex` CLIs installed, other providers not installed (gives real "not installed" states)                                                                                                                                                                                                                                                                          |
| Web dev server        | `vp run dev --home-dir /tmp/t3code-overhaul --no-seed`; read ports from the `[dev-runner]` line (server 13773, web 5733 in this run). The developer's `~/.t3/userdata` is never read or written (D-002). Stop only by a PID captured at spawn (no `pkill -f`); the dev-runner ignored SIGTERM, so server and Vite children were ended by verified PID                                                                                                                                                    |
| Desktop dev app       | `vp run dev:desktop --home-dir /tmp/t3code-overhaul-desktop --no-seed` (server 13774, web 5734); `T3CODE_DESKTOP_REMOTE_DEBUGGING_PORT=9222`, driven with Playwright `connectOverCDP` because OS screencapture is blocked on this host. The developer's installed "T3 Code (Nightly).app" is never touched                                                                                                                                                                                               |
| Fixtures              | Synthetic only: repo `/tmp/t3code-sample-repo` (3 commits), projects `sample-app` and `server`, three real agent seed threads, then `/tmp/t3code-fixtures/expand.mjs` (run against `/tmp/t3code-overhaul`, stopped server) for 142 threads (15 archived, 10 settled, 5 pinned, 3 snoozed, long, RTL, CJK and blank-title variants, a 1,003,399-byte message, a 60-run conversation). See `screens/fixtures.md`. Drift: seed thread "Explain the repository" gained one extra exchange after the baseline |
| Playwright            | `/tmp/t3code-pw` (outside the repo, never a dependency): `pair.mjs`, `shot.mjs`, `capture.mjs`, `states.json`, `state.json` (paired session labelled `shared-playwright-do-not-revoke`; never revoke it, area 11 once did). Names are the join key between before and after: never rename a label. Area 22 uses `ui-overhaul/screens/22/measure.mjs` and `profile.mjs`                                                                                                                                   |
| Baseline              | `ui-overhaul/screens/baseline/`: 252 PNGs (`MANIFEST.md`), 26 states at 1440x900 light+dark, 10 at five other viewports, 10 in five named themes, a 2x-DPR set in `dpr2/`                                                                                                                                                                                                                                                                                                                                |
| Mobile                | CocoaPods via Homebrew; iOS dev client built on simulator "iPhone 17" (`node scripts/mobile-native-client.ts ensure ios <udid>`); Metro with `vp run dev:client` from `apps/mobile`; XCUITest harness in `/tmp` (not in the repo)                                                                                                                                                                                                                                                                        |
| Repo state            | Branch `ui-overhaul/audit` at `d711b4a3` (local, unpushed); `ui-overhaul/` holds all Phase 1 output; fork `main` was about 3,002 commits behind upstream at checkout and will be fast-forwarded on push; screenshots go to the fork branch `ui-overhaul/assets`                                                                                                                                                                                                                                          |
| Verification commands | `vp test run <files>`, `vp lint <files>`, `vp run --filter <package> typecheck`, `vp run check:changed` before a push; browser tests are `*.browser.test.tsx` rendered with `await using screen = await render(...)`; no repo-wide runs                                                                                                                                                                                                                                                                  |

### 16.4 What was not tested

| Area                        | Not tested                                                                                                                                                                                                                                                                                                                                                                         | Consequence                                                                  |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Android                     | No Android SDK, adb or emulator on the host. Every Android row is code-read (F-15-16, #21757, #23888, Material You)                                                                                                                                                                                                                                                                | Android chunks need a device before any claim of "fixed"                     |
| Windows and Linux rendering | No Windows or Linux host: caption buttons and traffic-light collisions (F-14-05), Windows High Contrast and forced colours (emulated only), AltGr layouts (F-21-08, F-21-11), Inter's first-paint swap, Segoe metrics, 125% and 150% scaling, `set`/`$env:` command forms                                                                                                          | A-1, A-2, A-7, P-21-7, P-14-* need a Windows pass                            |
| Real screen readers         | No VoiceOver, NVDA, JAWS or TalkBack session on web or native; only the accessibility tree, axe and iOS tree via XCUITest                                                                                                                                                                                                                                                          | Announcement wording is unproven                                             |
| Real first launch           | The shared dev server cannot produce one; onboarding times are keystroke-level estimates; the mobile `ConnectOnboarding` sheet was never captured; `npx t3` first launch (F-10-01) is code-read                                                                                                                                                                                    | Onboarding acceptance needs a clean `--home-dir` run                         |
| Others                      | Performance beyond one host (area 22 measured a production build at 1x and 4x CPU throttle on an Apple M5 Max with a headless 60 Hz clock, 142 threads, n=3 and n=1 for first send), real low-end hardware, hardware-GPU traces, 10,000-thread lists, OS sleep and resume, signed desktop builds and updates, Safari and Firefox, system theme switching on desktop, an RTL locale | Listed as live probes in `_FOLLOWUPS.md` (88 b rows; top ten in its Summary) |

### 16.5 Phase 2 preconditions

1. The user approves this spec explicitly; nothing starts on an implied yes.
2. Decisions 3 to 6 in section 15 are answered, or their stated defaults accepted in writing.
3. #24865 has merged (cut from `main`), or the user picks the head-branch option (decision 2).
4. Explicit consent to run browsers and computer use again (AGENTS.md; D-004); the dev server is started by us, with the commands in 16.3, never against `~/.t3/userdata`.
5. Fixtures rebuilt from `fixtures.md` in a fresh `--home-dir`, thread ids in `states.json` updated, and a masking pass agreed for new captures (the fork is public).
6. `ui-overhaul/audit` pushed to the fork, fork `main` fast-forwarded, the `ui-overhaul/assets` branch created for images.
7. Area 22's chunks (P-22-1 to P-22-5, 13.6) are accepted or revised, then the top ten live probes from `_FOLLOWUPS.md` run, starting with the browser-tab chord matrix (F-21-13) and the 16 ms wheel sampler (F-03-02).
8. Models fixed by the brief: Opus low or medium per card, Haiku for mechanical renames, never Opus high, never Fable; subagents do not launch their own dev servers (AGENTS.md); one primary agent integrates and does the single real-client pass.
9. The three Ideas drafts in 14.5 are posted only on the user's say-so, and only the PRs in batch U1 are opened until a maintainer responds.
10. Part B's provisional chunk labels are replaced using 13.3, and `_FINDINGS-INDEX.md` is regenerated after the severity changes in 13.1.

### Gaps in part C

- **Area 22 (performance feel) is chunked as P-22-1 to P-22-5.** F-22-01 (P1) is carried by P-22-1, the budget and bench that sit on top of the E-6 fix for F-03-04 (the audit says it is the same fix). F-22-06 to F-22-08 (P3) are deferred (13.15). The audit measured one host: medians of 3 (first send n=1), a headless 60 Hz clock, 142 threads, production build at 1x and 4x CPU throttle; its seven `Incomplete` and `Needs deeper look` items remain Phase 2 probes. `_FINDINGS-INDEX.md` was generated before area 22 finished and has 632 rows; the audits now hold 640 (P1 118, P2 318, P3 204 after the sweep), so the index and the counts in sections 1 and 5 of parts A and B need a regeneration.
- **`_FOLLOWUPS.md` Summary is present and folded in** (nothing left to wait for). Severity changes are applied in 13.1. Its new candidate findings have no ids, are not in the 640, and have no chunk yet: P1 desktop connection catalog that decrypts but fails to decode is replaced by an empty one with no quarantine (F-14-34), and a focusable 12 px `ConnectionStatusDot` with no visible focus; P2 sidebar rename lost on double-click of a non-active row, ChatGPT-sharing modal stacking over the wizard, `/pull-requests` skeleton forever without server config, PR list re-ranking as stats arrive, unavailable-reason tooltip only, undecryptable catalog shows nothing (F-14-35), iPhone landscape declared twice (F-15-20), diff scroll anchor not persisted, theme Inspector mislabels roles, pairing dialog density, zero-thread environment blank pane. Suggested homes once ids exist: P-14-*, A-3, S-22/S-23, E-3. Two conditional items (#16985 paste then image drops text, P1; #8963 Stop during approval loses typed text, P2) only count if the Phase 2 probe reproduces them.
- **Part B labels are replaced here but not edited there.** 13.3 gives the mapping; the lead must apply the rename pass in `B-sections-07-12.md` section 12. Part B's owner decisions D1, D2, D3, D-M1 are carried to section 15 with recommendations; the Part B default for each is what the cards assume.
- **Index quality.** `_FINDINGS-INDEX.md` has 23 rows (areas 12 and 21) whose title column holds DNA ids because the effort or title cell shifted; chunk titles and ids here come from the audit headings, and all 632 indexed ids and severities match the audit files (area 22's 8 are not in the index). Regenerate the index after the severity changes in 13.1.
- **Files are a starting point.** They come from the finding's Evidence and Proposed text; 19 findings name no resolvable file, and for findings whose Proposed text names none the first three Evidence files are used, so a card can list a read-only call site or miss an edited one. T5 to T9 are codemods whose real file set is a pattern, not a list. #24865 overlap is by file name against its 55-file diff, so it over-reports (a shared file is not a conflicting hunk) and the head of #24865 may still move.
- **Estimates are not spiked.** Lines follow the effort letter (XS 15, S 55, M 160, L 420) except 22 adjusted chunks; none was prototyped. Model effort (Opus low or medium) follows size and subtlety, not a trial run.
- **Before images.** 433 of 640 findings cite no screenshot (code-read, or an image outside the screens folder); those cards use baseline labels or say "none captured". The baseline matrix has six viewports for ten labels only; other labels exist at 1440x900. There is no Windows, Linux or Android baseline. After-image paths `ui-overhaul/screens/<chunk-id>/` follow `screens/capture.md`; the `ui-overhaul/assets` branch is not yet created.
- **Tests.** "Existing tests" are found by file-name convention beside the cited files; other tests may cover the same code. Test names in cards are not run; none of this plan was executed.
- **Upstream flags** are the audit's per-finding "Upstream-eligible" lines aggregated per chunk (any "no" makes the chunk "no" unless the reason is only a #24865 overlap), plus the file-overlap check above. A merged `takeover` PR or a maintainer fix can remove a chunk at any time; the 37 open `takeover` PRs are in `PRS.md`.
- **Draft PR bodies** carry real Phase 1 evidence but empty verification results; every `[result]` and `UPLOAD:` slot is for the Phase 2 run. Draft 2 needs #24865 merged first because `BranchToolbarBranchSelector.tsx` is in its diff.
- **Totals differ from part A section 1** on purpose: part A counts per-finding flags (441 yes), this part counts per chunk after merging findings that share a fix (F-01-01 with F-23-04, F-12-05 with F-02-14, F-09-19 with F-20-01, F-05-19 with F-10-19, F-03-31 with F-10-17, F-16-04 stays alone).
- **Recorded but not decided here:** whether the two chunks that need a server change (O-2, S-15) are opened as issues by us or left to maintainers; who posts the Ideas drafts (nothing is posted in Phase 1).
