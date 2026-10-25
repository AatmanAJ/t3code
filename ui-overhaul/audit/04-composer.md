# Audit 04: composer

Area: ChatComposer, ComposerPromptEditor (Tiptap), controls, pickers, banners, queue, stash, draft persistence, branch strip.
Baseline: pingdotgg/t3code main @ 5f64c5eb, running at localhost:5733 (dev channel: artwork send button). Screenshots: `ui-overhaul/screens/04-composer/`.
All paths are relative to the repo root; component files are under `apps/web/src/components/` unless a full path is given.

## Session notes (read first)

- **#24865 tags.** After the first draft of this file the coordinator added PR #24865 (owner `t3dotgg`, "UI design overhaul"). Every finding below carries a `#24865:` line, checked against `ui-overhaul/prior-art/pr-24865.diff`. What the diff changes in this area: one `DEFAULT_COMPOSER_PLACEHOLDER` ("Ask anything. @ files, $ skills, / commands"), placeholder without `/75` opacity, editor `min-h-19.5` to `min-h-12` ("rests two lines"), composer radius `rounded-3xl` to `rounded-2xl`, shadow `--shadow-composer` to `0 1px 2px rgb(0 0 0 / 5%)`, control text `text-foreground/70` (light) and `dark:text-muted-foreground`, separators and chevron `opacity-50` removed, footer `gap-0`, gauge icon for effort, neutral "Compact next" / "Keep full" pill, disabled send `bg-foreground/12`, opaque light context strip, 1.75 icon stroke, `--radius` 0.5rem, `--foreground` zinc-900, dark `--muted-foreground` neutral-400. Owner calls kept: the model logo brand colour in the composer, the blue accent, the #0a0a0a canvas. "Upstream-eligible" below is `no` for anything that edits a file #24865 edits unless it is a follow-up to #24865 after it merges.
- **Agent turns used (cap was 4, I went one over; flagging honestly).** All with Claude Haiku 5.5 in `sample-app`: (1) "Run the bash command `sleep 50`..." in a new thread now titled "Run a Bash Sleep Command" (Claude auto-continued once when its background task finished); (2) and (3) "queued message A" and "queued message B", which ran as real turns because the first turn had ended before I pressed Mod+Enter; (4) an **accidental** send of "short prompt" into the seed thread "Explain the repository" (`mcp:de3a2ccc-...`): my script typed `\n` in a 390px touch-emulated viewport and Enter sent the message. That seed thread now has one extra user message and a short Haiku reply. Other agents should not rely on its transcript being unchanged.
- **Settings.** I changed no server or Settings values. Client settings (`contextWindowMeterEnabled`, follow-up behaviour left at default `steer`, send shortcut left at `enter`) were only touched inside my own Playwright context copy of `/tmp/t3code-pw/state.json`; nothing was written back.
- **Screenshots withheld.** The `/` and `$` menus list the developer's personal Claude/Codex skills and plugin names, and the project chooser lists a local home path, so those screenshots were deleted. The menus were observed live (numbers quoted below).
- **Not reproduced live:** pending-approval panel (Claude did not ask for `sleep` in Supervised), goal banner, compact-before-send pill, update-required models, provider-unavailable chip, system banners. These are marked "code-read only".

## Findings

### F-04-01 The two placeholders are assigned backwards: a new thread shows the "follow-ups" string, an existing thread shows the discovery hint

- Severity: P1
- Surface: web (desktop inherits)
- Evidence: `apps/web/src/composerPlaceholder.ts:1-2` (constant named `DISCONNECTED_COMPOSER_PLACEHOLDER`); `components/chat/ChatComposer.tsx:3796-3798` (`phase === "disconnected"` picks it). A fresh draft has no session, so its phase is "disconnected". Screenshots: `04-draft-hero-empty-light-1440x900.png` ("Ask for changes, send follow-ups, or attach images" on the empty hero), `04-existing-thread-rest-light-1440x900.png` ("Ask anything, @tag files/folders, $use skills, or / for commands"), `04-draft-no-project-light-1440x900.png` (same follow-ups string).
- Current: The string written for a lost connection is what every new user sees on the new-thread hero, and it talks about "follow-ups" before any thread exists. The only hint that teaches `@`, `$` and `/` appears after the first send.
- Proposed: One constant for every non-special state. #24865 sets `DEFAULT_COMPOSER_PLACEHOLDER = "Ask anything. @ files, $ skills, / commands"` and deletes the `phase === "disconnected"` branch; keep the special strings at `ChatComposer.tsx:3782-3795` (approval, pending question, plan refine, project required, provider unavailable). No further change needed after merge.
- DNA: DNA-V5 (explain in place), DNA-P3 (a label must reflect real state)
- Effort: XS
- Risk: The constant is imported only by `ChatComposer.tsx`; no test asserts the text.
- Upstream-eligible: no (covered by #24865)
- #24865: addressed

### F-04-02 Leftover copy on the mobile collapsed row and in loading strings (ASCII dots, a third placeholder)

- Severity: P3
- Surface: web (phone width; native mobile app untested)
- Evidence: `ChatComposer.tsx:3619-3620` ("Ask anything..." on the collapsed pill, `04-thread-composer-light-390x844.png`); `components/chat/ComposerCommandMenu.tsx:144-147` and `ChatComposer.tsx:3688-3689` ("Searching workspace files...", "Searching workspace skills...", "Finding pull request..."); `components/chat/ModelPickerContent.tsx:879` ("Search models..."); `components/BranchPicker.tsx:174` ("Search refs...").
- Current: After #24865 there is still a third placeholder string, and five ASCII `...` ellipses remain next to the U+2026 convention (DNA-V9: 153 U+2026 vs 110 ASCII in the app).
- Proposed: Use `DEFAULT_COMPOSER_PLACEHOLDER` for the collapsed row's empty text (it already has `truncate`), and replace the five `...` with the single character `…`.
- DNA: DNA-V9, DNA-V5
- Effort: XS
- Risk: `ComposerCommandMenu.test.tsx` and `ModelPickerContent` browser tests may match the old strings.
- Upstream-eligible: no (edits ChatComposer.tsx); ship as a follow-up after #24865 merges
- #24865: partial (one constant for the main editor; line 3620 and the ellipses untouched)

### F-04-03 Placeholder text is 2.94:1 (light) and 3.35:1 (dark)

- Severity: P2
- Surface: web
- Evidence: `components/ComposerPromptEditorTiptap.tsx:1842` (`text-placeholder/75`). Measured on the composer surface: light `rgb(113 113 123 / 0.75)` over `#fcfcfc` = 2.94:1, dark `rgb(130 130 130 / 0.75)` over `#0a0a0a` = 3.35:1 (script `contrast.mjs`, output in this session). 14px text, floor is 4.5:1.
- Current: The hint is 14px text at three-quarter strength of the muted grey, below the contrast floor in both themes.
- Proposed: `text-placeholder` with no opacity modifier (4.71:1 light, 5.08:1 dark with the default tokens). The placeholder `div` also duplicates `aria-placeholder`; add `aria-hidden="true"` to the visible `div` (line 1839-1847) so screen readers read it once.
- DNA: DNA-C4, DNA-C5
- Effort: XS
- Risk: `ComposerPromptEditorTiptap.input.browser.test.tsx` does not assert colour.
- Upstream-eligible: no (covered by #24865 for the colour; the `aria-hidden` is a one-line follow-up)
- #24865: addressed (drops `/75`; dark `--muted-foreground` moves to neutral-400). `aria-hidden` not addressed.

### F-04-04 The editor stops growing at 208px and clips hard, so a 40-line prompt shows 9 lines

- Severity: P3
- Surface: web
- Evidence: `ComposerPromptEditorTiptap.tsx:1104` (`max-h-52` = 208px). Measured: 5 lines 122px, 8 lines 190px, 12 lines and 40 lines both 208px with `scrollHeight` 918 (`04-composer-12-lines-light-1440x900.png`, `04-composer-40-lines-light-1440x900.png`). First visible line is cut mid-glyph at the top edge, no fade.
- Current: At 1440x900 the editor is 23% of the viewport tall at most, independent of window height, and the clipped top line gives no sign that more text is above.
- Proposed: Define `--composer-editor-max-height: clamp(13rem, 38dvh, 24rem)` in `index.css` and use `max-h-(--composer-editor-max-height)` (900px viewport: 342px; 600px: 228px; keyboard-open phone: floor 208px). Add a 12px top and bottom mask fade while `scrollHeight > clientHeight`, reusing the `scrollFade` mask recipe from `ui/scroll-area.tsx`.
- DNA: DNA-D6 (density follows available height)
- Effort: S
- Risk: `composerFooterLayout.ts` timeline inset math uses the measured overlay height, so test the overlay inset when the editor grows; `ComposerPromptEditorTiptap.input.browser.test.tsx`.
- Upstream-eligible: no (same className line #24865 edits)
- #24865: not addressed (it edits `min-h` on the same line, not `max-h`)

### F-04-05 File chips have no visible remove control and are 17px tall

- Severity: P2
- Surface: web
- Evidence: Measured chips `109x17`, `111x17` (`04-attach-chips-zoom-light-1440x900@2x.png`, `04-attach-chip-hover-light-1440x900@2x.png`). Image thumbnails have a 24px X, file chips have none. Removal paths: Backspace twice (tested), or click the chip, open the preview dialog, press the trash icon (`04-attach-file-chip-click-dialog-light-1440x900.png`). `components/contextChipParts.tsx:278` (FileChip), `components/ContextChip.tsx` (`h-[1.41em]`, `text-[0.86em]`).
- Current: To drop an attached file you must know the keyboard trick or open a dialog; the target is 17px.
- Proposed: In `FileChip` (composer variant only) add a trailing `XIcon size-3` that appears on hover and on `focus-within`, inside a 24px hit area (`after:absolute after:-inset-1`), `aria-label="Remove <name>"`, wired to the same `removeComposerFileFromDraft` the preview dialog uses. Raise the chip to `h-6` (24px) with `text-xs` when `pointer: coarse`.
- DNA: DNA-P7 (every way in has a way out), DNA-D4
- Effort: S
- Risk: Chip is also used in message history (`UserMessageContextChips.tsx`); gate on a `removable` prop. Tests: `composerAttachmentFiles.test.ts` does not cover chips.
- Upstream-eligible: yes (small, fix-shaped) provided it does not touch a file #24865 edits (`contextChipParts.tsx` is not in the diff)
- #24865: not addressed

### F-04-06 The placeholder disappears as soon as one chip is present

- Severity: P3
- Surface: web
- Evidence: `ComposerPromptEditorTiptap.tsx:1839` renders the placeholder only when `contextRecords.size === 0`. With one attached file the editor line is blank (`04-attach-images-and-files-light-1440x900.png`; DOM probe found no placeholder element).
- Current: After attaching a file the composer shows chips and an empty, unlabelled line.
- Proposed: When the editor is empty and only chip records exist, show a short contextual hint ("Add a message about this file", "Add a message about these files") using the same placeholder slot and class.
- DNA: DNA-V5
- Effort: XS
- Risk: Placeholder text feeds `aria-placeholder`; check the pending-approval case where chips and custom answers coexist.
- Upstream-eligible: no (edits `ComposerPromptEditorTiptap.tsx`, which #24865 edits)
- #24865: not addressed

### F-04-07 The image remove button covers about a third of the thumbnail all the time

- Severity: P3
- Surface: web
- Evidence: `components/chat/ComposerAttachmentStrip.tsx:292-302` (always-visible remove). Thumbnail 62px, button 24px at top 4px right 4px (`04-attach-chip-hover-light-1440x900@2x.png`).
- Current: The X hides part of every pasted screenshot, which is what users check before sending.
- Proposed: On `pointer: fine`, show the X on `group-hover` and `focus-within` only, offset to `-top-1.5 -right-1.5` (half outside the thumb) with a 1px `ring-background`; keep always-visible on `pointer: coarse`.
- DNA: DNA-X4 (hover reveal needs a touch fallback)
- Effort: XS
- Risk: Touch fallback must stay; `ComposerAttachmentStrip` has no tests.
- Upstream-eligible: yes
- #24865: not addressed

### F-04-08 Tab in a numbered list nests the item but keeps its number (reproduces #17124)

- Severity: P2
- Surface: web
- Evidence: Typed `1. first`, Shift+Enter, `second`, Tab: DOM is `<ol><li marker="1."><p>first</p><ol start="2"><li marker="2.">second nested</li></ol></li></ol>`; the nested item renders "2." with a blank gap above it (`04-edit-numbered-list-tab-light-1440x900.png`). `composer-list-continuation.ts` `listIndentForTab`.
- Current: The nested list starts at 2, and the agent receives a differently indented list than the editor shows (issue #17124).
- Proposed: In `listIndentForTab`, when an ordered item is nested under a parent, restart at 1 (`start="1"`, `marker="1."`) and serialise the nested marker with the new indent; on Shift+Tab renumber to continue the parent list. Add a case to `composer-list-continuation.test.ts`.
- DNA: DNA-P3 (the editor must show what is sent)
- Effort: S
- Risk: `composer-list-continuation.test.ts`, `composer-list-split.browser.test.ts`, `composer-rich-text.test.ts`; round trip of markdown serialisation.
- Upstream-eligible: yes (bug fix with a failing test first)
- #24865: not addressed

### F-04-09 A dash typed in front of an existing line does not become a bullet (reproduces #22989)

- Severity: P3
- Surface: web
- Evidence: Typed `later item`, Home, `- `: DOM stays `<p>- later item</p>` (probe in this session). The input rule only fires on an empty line.
- Current: Markdown shortcut works only when typed first, so the visible text and the structure diverge.
- Proposed: Extend the list input rule to fire when the cursor is at the start of a non-empty paragraph and the preceding characters are `- `, `* `, `1. ` or `[ ] `, converting the whole paragraph. Cover with a test next to the existing list rules.
- DNA: DNA-P3
- Effort: S
- Risk: Undo grouping (`composer-undo-grouping.ts`) and pasted text that starts with `- ` must not convert.
- Upstream-eligible: yes
- #24865: not addressed

### F-04-10 The 120,000-character limit is only reported after a failed send

- Severity: P3
- Surface: web
- Evidence: Inserted 125,000 characters: send button stays enabled, no message (`04-prompt-too-long-light-1440x900.png`); pressing Enter then shows "Prompt is 4,999 characters over the 120,000-character limit. Shorten or split it before sending." (`04-prompt-too-long-after-enter-light-1440x900.png`). `components/chat/ComposerPromptLengthValidation.tsx`, `ChatComposer.tsx:1453-1457`.
- Current: Large pastes are folded into attachments at 32 KiB, but typing or editing past the limit gives no live signal.
- Proposed: From 90% of `PROVIDER_SEND_TURN_MAX_INPUT_CHARS` show the same `ComposerPromptLengthValidation` line live with a count ("108,400 / 120,000"), switch it to the error treatment above 100%, and disable send above 100%.
- DNA: DNA-P3
- Effort: S
- Risk: `getComposerPromptLengthValidationMessage` is also used on submit; keep one source of truth.
- Upstream-eligible: no (ChatComposer.tsx)
- #24865: not addressed

### F-04-11 A bare `@` says "No matching files or folders." before anything was searched

- Severity: P2
- Surface: web
- Evidence: Live region and visible text for `@` alone (`04-menu-mention-bare-codex-light-1440x900.png`, `04-menu-mention-bare-explicit-light-1440x900.png`); `components/chat/useComposerMenuItems.ts:326-346`, `components/chat/ComposerCommandMenu.tsx:148-153`. With an empty query the path search returns nothing, so the empty state fires.
- Current: The first thing a user sees after typing `@` is a "no results" box (about 50px tall, 12px muted text) instead of help.
- Proposed: For `composerTrigger.kind === "path"` with an empty query, return recent items: up to 5 most recent threads from `matchComposerThreadItems(query: "")` plus the project root's top-level entries; if there are none, show "Type to search files, folders and threads." Reserve "No matching files or folders." for non-empty queries.
- DNA: DNA-P3, DNA-V5
- Effort: S
- Risk: `useComposerMenuItems` tests; do not trigger a workspace-wide listing on every `@` (cap at 8 root entries).
- Upstream-eligible: yes (small, fix-shaped; `useComposerMenuItems.ts` is not in the #24865 diff)
- #24865: not addressed

### F-04-12 `@` ranking puts threads above exact folder matches and returns unrelated files

- Severity: P2
- Surface: web
- Evidence: `useComposerMenuItems.ts:163-182` always concatenates thread matches before workspace entries. `@src` in a Codex thread: first row is a thread titled "Investigate /Users/example/projects/acme-monorepo/packages/f..." (Thread badge), the folder `src` is second (`04-menu-mention-src-codex-light-1440x900.png`). `@gre` lists `greet.js`, `greet.md`, then `README.md`, `.gitignore`, `package.json`, `huge.js`, `file173.js`... 80 rows (`04-menu-mention-gre-codex-light-1440x900.png`). Related #7557 (picker shows nothing in some projects).
- Current: Typing a filename prefix still shows a thread first and 70+ non-matching rows; the first Enter inserts a thread chip instead of the file the user typed.
- Proposed: Merge both sources and sort by one score: exact basename match, then prefix, then subsequence; cap threads at 3 and place them after any exact or prefix file or folder match; drop workspace entries below a minimum score (server dependency: the workspace search currently returns a default page; until the server filters, filter client-side in `workspaceEntries.entries.map`). Keep the "Thread" badge.
- DNA: DNA-P2 (obvious, minimal), DNA-P3
- Effort: M
- Risk: Server search contract is outside this audit; `composerMenuHighlight.test.ts`, `ComposerCommandMenu.test.tsx`.
- Upstream-eligible: yes for the client-side ordering; the filtering needs a server change (dependency)
- #24865: not addressed

### F-04-13 A shell variable such as `$HOME` opens the skills popup

- Severity: P3
- Surface: web
- Evidence: Typed `100% of $HOME/x` in a Codex thread: popup text "No skills found. Try / to browse provider commands." (probe in this session; `a $` opens "Skills:16"). `useComposerMenuItems.ts:326-328`.
- Current: Anyone pasting or typing shell snippets gets a popup that follows them; with a matching skill name the Enter key would select it.
- Proposed: Show the `$` empty-state text only while the query is empty; once a non-empty query has zero matches, render no popover (keep the screen-reader status line) so `$HOME`, `$PATH` and `$1` do not leave a box on screen.
- DNA: DNA-P2
- Effort: XS
- Risk: `composer-logic.test.ts` trigger detection.
- Upstream-eligible: yes
- #24865: not addressed

### F-04-14 Composer menu rows disagree with each other and with the menu row standard

- Severity: P3
- Surface: web
- Evidence: Measured: slash rows 28px, mention rows 28px, skill rows 30px (the source badge makes them taller), model rows 45px, standard menu item 28px at 14px. Slash, mention and skill names and descriptions are `text-xs` (`ComposerCommandMenu.tsx:213,223`); model names `text-xs` (`ModelListRow.tsx:64`). Menu standard: `min-h-7`, 14px (`ui/menu.tsx:172`).
- Current: Three composer popups use 12px two-column rows, one is 30px, while every other menu is 14px/28px.
- Proposed: Keep the 12px two-column density (it is deliberate for name plus description) but fix the heights: `h-7` (28px) on `CommandItem` in `ComposerCommandMenu` and move `SkillSourceBadge` to `h-4` so skill rows stay 28px; document the exception in `docs/internals/web-ui.md`.
- DNA: DNA-D5, DNA-D2
- Effort: XS
- Risk: Visual only.
- Upstream-eligible: yes
- #24865: not addressed

### F-04-15 The Stop button is named "Stop generation" but its tooltip and the docs say "Interrupt"

- Severity: P2
- Surface: web
- Evidence: `components/chat/ComposerPrimaryActions.tsx:146` (`aria-label="Stop generation"`) vs `:154` (`<TooltipPopup>Interrupt</TooltipPopup>`); `docs/user/composer.md` calls it **Interrupt**; DOM probe during a running turn read "Stop generation" (`04-stop-button-zoom-light-1440x900@2x.png`).
- Current: A screen reader announces one word, the tooltip shows another, and the keybinding command is `thread.stop`: three names for one action.
- Proposed: `aria-label="Interrupt"` and tooltip "Interrupt" plus the bound shortcut `Kbd` (see F-04-16); keep "stop" only in the command name.
- DNA: DNA-V7, DNA-I4
- Effort: XS
- Risk: Browser tests that query `getByLabel("Stop generation")` (grep before changing).
- Upstream-eligible: no (ComposerPrimaryActions.tsx is in #24865); follow-up
- #24865: not addressed

### F-04-16 Interrupt has no default shortcut, so the primary action of a running turn has no key hint

- Severity: P2
- Surface: web
- Evidence: `packages/shared/src/keybindings.ts:147-234` has no default for `thread.stop` (docs: "no default"). `ComposerPrimaryActions.tsx:131-156` tooltip has no `Kbd`. With no default binding, Stop is mouse-only unless the user binds `thread.stop` themselves.
- Current: Users driving agents all day have to reach for the red button; the tooltip cannot teach a shortcut that does not exist.
- Proposed: Add an additive default `{ key: "escape", command: "thread.stop", when: "composerFocus && turnRunning && !modelPickerOpen" }` in `DEFAULT_KEYBINDINGS`, and have `useComposerCommandKey` act on it only when `event.defaultPrevented` is false (menus, citation edit and queued-message edit already consume Escape first) and the draft is empty (there is no `composerEmpty` context key today; check it in the handler). Show the shortcut in the tooltip via `shortcutLabelForCommand(keybindings, "thread.stop")`. If Escape is judged too risky, bind `mod+.` instead.
- DNA: DNA-L8 (every primary action has a shortcut)
- Effort: S
- Risk: Escape also closes menus, dismisses citation edits and exits queued-message edit; test those paths. Keybinding settings conflict warning (area 08). The server skips a default whose key the user already bound.
- Upstream-eligible: yes as a separate small PR (`keybindings.ts` default plus tooltip), after #24865
- #24865: not addressed

### F-04-17 While a turn runs, the armed follow-up action is an icon, and the default (steer) interrupts the run

- Severity: P2
- Surface: web
- Evidence: Default `followUpBehavior` is `steer` (`packages/contracts/src/settings.ts:433-435`). Observed states: typed text while running shows a corner-arrow glyph (aria "Steer message"), holding Meta shows a list-plus glyph (aria "Queue message") (`04-running-typed-steer-light-1440x900.png`, `04-running-typed-meta-held-light-1440x900.png`). Tooltip text is static: "Click to steer, Ctrl/⌘-click or ⌘Enter to queue" (`ComposerPrimaryActions.tsx:306`, prints both Ctrl and ⌘ on every platform). The 32px circle keeps one colour in both states.
- Current: Pressing Enter in a running thread interrupts the agent's tool call, and nothing on screen says so until a tooltip is hovered.
- Proposed: While `isRunning && hasSendableContent`, render a 28px text pill beside the circle with the armed action ("Steer" or "Queue"), using the same neutral control style #24865 gives "Compact next" (`h-7 rounded-(--control-radius) px-2 text-sm text-foreground/80`); show the alternate with `Kbd` from `alternateShortcutLabel` only, not the hard-coded "Ctrl/⌘".
- DNA: DNA-P3 (a label must reflect real state), DNA-L8
- Effort: S
- Risk: Footer width budget (`shouldUseCompactComposerPrimaryActions`, 780px), `composerFooterLayout.test.ts`.
- Upstream-eligible: no (ComposerPrimaryActions.tsx is in #24865); follow-up
- #24865: not addressed

### F-04-18 Send and Stop are 32 to 36px with no 44px touch target

- Severity: P2
- Surface: web (phone width)
- Evidence: Hit-test probe at 390px with `pointer: coarse`: Submit measured 36x36 and hit area 36x36; Attach 32x32 hits 43x43 (`hit.mjs`). `ComposerPrimaryActions.tsx:313` (`h-9 w-9 sm:h-8 sm:w-8`) and `:138` (stop `size-8`) have no `pointer-coarse:after:min-h-11 min-w-11` that `ComposerControl` (`ComposerControl.tsx:14`) and `Button` carry.
- Current: The most important touch target in the app is smaller than the 28px chips next to it once their pseudo-element hit areas are counted.
- Proposed: Add `pointer-coarse:after:absolute pointer-coarse:after:size-full pointer-coarse:after:min-h-11 pointer-coarse:after:min-w-11` to the send, stop, resume and Previous/Submit pills, and keep the visual size.
- DNA: DNA-D4, DNA-K10
- Effort: XS
- Risk: Overlap with the attach button's hit area (probe after change).
- Upstream-eligible: no (ComposerPrimaryActions.tsx is in #24865); follow-up
- #24865: not addressed

### F-04-19 The send button scales on hover with no reduced-motion branch and uses `transition-all`

- Severity: P2
- Surface: web
- Evidence: `ComposerPrimaryActions.tsx:313` (`transition-all duration-150 hover:scale-105`), `ComposerControl.tsx:14` (`[&:active:not([aria-haspopup])]:scale-[0.97]`). With `prefers-reduced-motion: reduce` emulated, the computed `scale` of the hovered send button is `1.05` and `transition-duration` is `0.15s` (`rm1.mjs`). Attachment appearance uses `duration-300 ease-drawer` (`ComposerAttachmentStrip.tsx:101`), outside the 100-220ms ladder. Related DRIFT-8.
- Current: Reduced-motion users still get scale animations on the two most-used composer controls.
- Proposed: `motion-safe:hover:scale-105 motion-safe:active:scale-[0.97]` and `transition-[background-color,box-shadow,scale]` on the send button; same `motion-safe:` prefix on the ComposerControl press scale; attachment appear to `duration-200`.
- DNA: DNA-M5, DNA-M3, DNA-M4, DRIFT-8
- Effort: XS
- Risk: Visual only; no tests.
- Upstream-eligible: no (both files are in #24865); follow-up
- #24865: not addressed (the diff keeps `transition-all hover:scale-105`)

### F-04-20 "Compact" pill used warning-coloured 12px text (2.13:1) and hid the permission label

- Severity: P2
- Surface: web
- Evidence: Main: `ComposerPrimaryActions.tsx:372-376` (`border-warning/40 text-warning hover:bg-warning/8`, `text-xs`); measured `text-warning` on the composer surface 2.13:1 light, `text-warning-foreground` 5.03:1. Code-read only (needs a stale 100k-token Claude thread). Relates to Ideas #17170 (compact-before-send has no persistent off switch; "Keep full" applies to one send).
- Current: The state is warning amber at 12px and shows the token count inline, which pushes the permission label into icon-only mode.
- Proposed: Adopt #24865's neutral pill ("Compact next" / "Keep full", `aria-pressed`, token count in the tooltip). Follow-up for #17170: a Settings row "Compact before send on stale threads: Ask / Never" belongs to the settings areas; the composer side needs only a third pill state "Never" with the tooltip text "Set in Settings".
- DNA: DNA-C5, DNA-C6
- Effort: XS (already in the PR)
- Risk: Browser tests asserting "Full" / "Compact" text.
- Upstream-eligible: no (covered by #24865)
- #24865: addressed

### F-04-21 Footer and strip control text is `text-muted-foreground/70`: 2.73:1 light, 3.05:1 dark

- Severity: P1
- Surface: web
- Evidence: Measured 12px text: branch strip `Current checkout` and `main` 2.73:1 light, 3.05:1 dark; resting controls the same (`04-composer-resting-zoom-light-1440x900@2x.png`, `-dark-`). `components/chat/ComposerControl.tsx:17` (xs size), `components/BranchToolbar.tsx:751`, `components/chat/ChatComposer.tsx:3471,3959` (wrapper), `components/BranchToolbarEnvModeSelector.tsx:76` and `BranchToolbarEnvironmentSelector.tsx:71` (locked rows). Floor for text under 14px is 4.5:1 (DNA-C5); `/70` is explicitly called out in DRIFT-1.
- Current: The model, effort and permission chips and the checkout strip that tell you where your work will run are the faintest text on the screen.
- Proposed: #24865's values: xs controls `text-foreground/70 dark:text-muted-foreground`, strip the same, chevrons without `opacity-50`. Remaining follow-up: apply the same two classes to the two locked-row spans (`BranchToolbarEnvModeSelector.tsx:76`, `BranchToolbarEnvironmentSelector.tsx:71`) and drop the redundant `text-muted-foreground/70` wrappers at `ChatComposer.tsx:3471,3959`.
- DNA: DNA-C4, DNA-C5, DRIFT-1
- Effort: XS
- Risk: None functional.
- Upstream-eligible: no (follow-up to #24865 after merge)
- #24865: partial (controls and the strip fixed; locked rows and wrapper classes untouched)

### F-04-22 Permission mode loses its label first, and at phone width it is not visible at all

- Severity: P1
- Surface: web (phone and narrow widths; native mobile app untested)
- Evidence: At 800x600 the composer is 496px wide, "Runtime mode" shrinks to 54px (icon only) while "Medium" keeps its label (`04-thread-composer-light-800x600.png`). At 390px the expanded composer shows model, an effort icon and "…" only; "Full access" is not on screen (`04-mobile-draft-hero-light-390x844.png`, `04-thread-composer-expanded-light-390x844.png`). The collapsed 390px pill shows "Medium" and "Full access" below it (`04-thread-composer-light-390x844.png`), so the expanded state hides what the collapsed state shows. `components/chat/ComposerControlsBar.tsx:164-193` orders blocks traits, mode; hidden and icon-only counts are taken from the end, so mode collapses first.
- Current: The default is Full access (no approval prompts). The one control that says what the agent may do without asking is the first to lose its words.
- Proposed: Reorder `restingBlockDefs` to `[mode, traits]` so effort collapses and hides first; at composer width under 420px keep the permission icon chip (lock, lock-open, pen, sparkles) outside the "…" menu with `aria-label="Permissions: Full access"` and move effort into the menu. On every width add the current mode name to the icon-only tooltip.
- DNA: DNA-P3, DNA-X3 (mobile keeps the web hierarchy)
- Effort: M
- Risk: `restingComposerControlsMeasurement.ts` and `useRestingComposerControlsLayout.ts` take block order from `restingBlockDefs`; `composerFooterLayout.test.ts`.
- Upstream-eligible: no (ComposerControlsBar.tsx is in #24865); follow-up
- #24865: not addressed (it removes separators and moves the compact token count into a tooltip "so the permission label keeps its room", but the collapse order is unchanged)

### F-04-23 The collapsed phone strip shows the model as an icon with no name

- Severity: P2
- Surface: web (phone width)
- Evidence: `04-thread-composer-light-390x844.png`: strip reads sparkle icon, "Medium", "Full access". `ComposerControlsBar.tsx:225-231` (`@max-[640px]/composer-surface:[&_[data-chat-provider-model-picker-label]]:w-0`). Matches the cluster "model shown does not match what runs" (#16016, #24213 "truncates the selected model name"): when the label is removed, nothing confirms which model will answer.
- Current: Two Claude models look identical in the strip.
- Proposed: Never zero the model label below 640px; truncate it with `max-w-24` and `truncate` (the trigger already has `truncate` on the label span) so at least "Claude H..." remains, and keep the full name in the aria-label (already set from `allModelNames`).
- DNA: DNA-P3
- Effort: XS
- Risk: Resting strip width budget (`useRestingComposerControlsLayout`).
- Upstream-eligible: no (ComposerControlsBar.tsx is in #24865); follow-up
- #24865: not addressed

### F-04-24 The phone "…" menu drops the descriptions and icons the permission select shows

- Severity: P2
- Surface: web (phone width)
- Evidence: Desktop select rows have icon, label and a description ("Allow commands and edits without prompts.") (`04-runtime-mode-select-light-1440x900.png`); the "…" menu lists the same four names with no icon or description (`04-mobile-overflow-menu-light-390x460.png`, `components/chat/CompactComposerControlsMenu.tsx:74-87`). "Auto" and "Full access" are indistinguishable by name alone.
- Current: On a phone you choose the safety level from four bare words.
- Proposed: Render `option.icon` and `option.description` in `CompactComposerControlsMenu` (reuse `runtimeModeConfig`), description `text-xs text-muted-foreground`, and pass the full `RuntimeModeOption` instead of `{ mode, label }`.
- DNA: DNA-V5 (explain in place), DNA-X3
- Effort: S
- Risk: Menu height at 460px viewport; `ScrollArea` already clips.
- Upstream-eligible: yes (`CompactComposerControlsMenu.tsx` and `ComposerControlsBar.tsx` prop type; ComposerControlsBar is in #24865, so land after it)
- #24865: not addressed

### F-04-25 The selected option in the effort, access and mode menus is shown only by an 8% fill

- Severity: P2
- Surface: web
- Evidence: `components/ui/menu.tsx:219-243`: `MenuRadioItem` ignores `hideIndicator` (`_hideIndicator`) and styles `data-checked:bg-foreground/[0.08]`; `MenuRadioItemIndicator` exists (`:245`) but is not rendered. Callers pass `hideIndicator` anyway: `components/chat/TraitsPicker.tsx:456-466`, `CompactComposerControlsMenu.tsx:68-86`; `SelectItem` in `ComposerFooterControls.tsx:120-125` also passes `hideIndicator`. Screens: `04-effort-menu-light-1440x900.png`, `04-mobile-overflow-menu-light-390x460.png` (selected row indistinguishable from a hover). 8% foreground on white is about 1.1:1.
- Current: The only cue for the current option is a fill that fails non-text contrast; the trigger shows the value, but the menu does not.
- Proposed: In the composer menus render `<MenuRadioItemIndicator />` (a 14px `CheckIcon` at the row's end, `text-foreground`) next to the label; do not change the shared primitive. For `SelectItem` rows in the permission select add the same trailing check via the existing indicator slot.
- DNA: DNA-C5 (meaning cannot rest on a hairline-contrast cue), DNA-P4
- Effort: S
- Risk: Menu min widths (`min-w-64` on the permission items).
- Upstream-eligible: yes for TraitsPicker and CompactComposerControlsMenu if landed after #24865 (TraitsPicker is in the diff for the icon swap)
- #24865: not addressed (touches `menu.tsx` only for stroke width)

### F-04-26 One setting, four names: "Reasoning", "effort", "Runtime mode", "Access", "Permissions", and Build / Chat / Default for the mode toggle

- Severity: P3
- Surface: web
- Evidence: Effort menu header "Reasoning" (`TraitsPicker.tsx:67-68` label map), docs and keybinding `composer.effort` say effort; permission select aria-label "Runtime mode" (`ComposerFooterControls.tsx:109`), overflow menu heading "Access" (`CompactComposerControlsMenu.tsx:74`), Settings and docs say "Permissions" and `mod+shift+a` is "access mode"; the interaction toggle reads "Build" / "Plan" in the toolbar (`ComposerFooterControls.tsx:84-86`), "Chat" / "Plan" in the overflow menu (`CompactComposerControlsMenu.tsx:68`) and "Default mode" in its tooltip (`:53`).
- Current: Searching docs, settings and the UI for the same control uses different words.
- Proposed: Standardise on "Effort" (menu header and aria-label), "Permissions" (aria-label of the select and overflow heading), and "Build" / "Plan" everywhere (tooltip: "Build mode. Click to switch to plan mode").
- DNA: DNA-V7 (use the product vocabulary)
- Effort: XS
- Risk: Browser tests that query by aria-label "Runtime mode".
- Upstream-eligible: no (ComposerFooterControls.tsx and TraitsPicker.tsx are in #24865); follow-up
- #24865: not addressed

### F-04-27 The new effort gauge icon duplicates the usage-limits banner icon (new with #24865)

- Severity: P3
- Surface: web
- Evidence: #24865 swaps `BrainIcon` for `GaugeIcon` in `TraitsPicker.tsx:603,611`; `components/chat/ComposerUsageLimits.tsx:2,62` already uses `GaugeIcon` for the "Usage limits" banner that sits directly above the composer. The context-window ring (`ContextWindowMeter.tsx`) is a third dial-like glyph in the same footer.
- Current: Two different meanings (reasoning effort, quota) share one glyph in the same 80px of screen.
- Proposed: Keep the gauge on the effort chip (owner call) and change the usage banner to `ChartNoAxesColumnIcon`, matching the sidebar's Usage footer icon (bar chart).
- DNA: DNA-I1 (one meaning per icon)
- Effort: XS
- Risk: None; check mobile if it imports the banner icon (it does not).
- Upstream-eligible: yes, as a follow-up commit on the #24865 branch or immediately after
- #24865: not addressed (introduced by it)

### F-04-28 Effort and permission tooltips repeat the label and omit the shortcut

- Severity: P3
- Surface: web
- Evidence: Effort trigger tooltip is `{triggerLabel}`, the same text as the button (`TraitsPicker.tsx:617`); permission tooltip is the option description with no shortcut (`ComposerFooterControls.tsx:142`); the model trigger tooltip shows "name · shortcut" (`ProviderModelPicker.tsx:179-181`). Bound: `mod+shift+e`, `mod+shift+a` (`packages/shared/src/keybindings.ts:202-203`).
- Current: Three adjacent chips teach shortcuts differently; two teach nothing.
- Proposed: Effort tooltip "Effort: Medium" plus `Kbd` from `shortcutLabelForCommand(keybindings, "composer.effort")`; permission tooltip "<description>" plus `Kbd` for `composer.mode`; workspace and branch chips the same (`composer.workspace`, `composer.branch`).
- DNA: DNA-L8, DNA-I4
- Effort: S
- Risk: Needs `keybindings` threaded into `TraitsPicker` (already available in `ComposerControlsBar`).
- Upstream-eligible: no (files in #24865); follow-up
- #24865: not addressed

### F-04-29 Effort changes silently when the model changes

- Severity: P3
- Surface: web
- Evidence: Draft on Claude Haiku 5.5 showed "Medium"; selecting Claude Sonnet 5.5 via the picker left the chip at "High" with no notice (`04-model-trigger-after-select-light-1440x900@2x.png`). Cluster "model or effort shown does not match": #6508, #16444, #16526, #17110, #24115, #16016, #24564, #23497, #24214.
- Current: Correct per-model defaults, but the user never sees the change they did not make.
- Proposed: On a model change that alters the effort label, add a 150ms opacity cross-fade on the chip and an `announce("Effort set to High")` (the `announce` helper is already imported in `ModelPickerContent.tsx:55`); no toast.
- DNA: DNA-P3, DNA-M4
- Effort: S
- Risk: Do not announce on initial mount or thread switch.
- Upstream-eligible: no (TraitsPicker/ChatComposer are in #24865)
- #24865: not addressed

### F-04-30 The provider rail in the model picker clips its last providers with no scroll cue

- Severity: P2
- Surface: web
- Evidence: Rail is 9 buttons (Favorites plus 8 providers) at 36px with `gap-1`, inside `max-h-86.5` (346px) (`components/chat/ModelPickerContent.tsx:807`); the scrollbar is hidden (`ModelPickerSidebar.tsx:90`, `[scrollbar-width:none]`). Measured bottoms: last button at y=837-873 in a popup ending at 855; the Pi icon is cut in half (`04-model-picker-open-light-1440x900.png`). Six of the eight providers are dimmed "not installed" on this host, so the rail is mostly empty slots.
- Current: A provider that is installed late in the list can be unreachable by sight; only arrow keys or scrolling reveal it.
- Proposed: Raise the container to `max-h-100` (400px, fits 9 rows plus padding) and add a 24px bottom mask fade on the rail while `scrollHeight > clientHeight` (same recipe as `getVirtualizedScrollFadeClassName`). Optionally collapse "not installed" providers into one trailing "Set up providers" button that opens Settings → Providers (dependency on area 09 copy).
- DNA: DNA-D6 (degrade, do not clip silently)
- Effort: S
- Risk: Popup height at 600px viewports (the popup flips when it does not fit); `ModelPickerSidebar` has no tests.
- Upstream-eligible: yes (neither file is in the #24865 diff)
- #24865: not addressed

### F-04-31 Faded greys survive in the model picker, effort menu and banners: `/70` (2.72:1), `/80` (3.25:1), `/60` and `/40`

- Severity: P2
- Surface: web
- Evidence: Measured 12px provider sub-label in every model row: 2.72:1 light, 3.00:1 dark (`components/chat/ModelListRow.tsx:96`); "Legacy models, 9 models" count `ModelPickerContent.tsx:953`; effort descriptions and group labels `text-muted-foreground/80` (`TraitsPicker.tsx:415,440,463`); banner separator `text-muted-foreground/40` (`ComposerBanner.tsx:248`); queued pending clock `text-muted-foreground/60` (`QueuedRunsControl.tsx:365`); queued text `text-foreground/80` (`:360`). DRIFT-1 lists the pattern.
- Current: The small print in the places where you choose things is the hardest to read.
- Proposed: Replace each with the plain token (`text-muted-foreground` for secondary, `text-foreground` for queued text; the separator and clock with `text-muted-foreground` at `size-3`). No new opacity steps.
- DNA: DNA-C4, DNA-C5, DRIFT-1
- Effort: XS
- Risk: None functional.
- Upstream-eligible: yes for `ModelListRow.tsx`, `ModelPickerContent.tsx`, `ComposerBanner.tsx`, `QueuedRunsControl.tsx` (not in the #24865 diff); `TraitsPicker.tsx` after #24865
- #24865: not addressed

### F-04-32 Every model row repeats the provider, which makes the list 45px per row; the NEW tag is bold uppercase

- Severity: P3
- Surface: web
- Evidence: `ModelPickerContent.tsx:993` passes `showProvider` unconditionally; with the Claude tab selected all rows read "Claude Opus 5.5 / Claude" (`04-model-picker-open-light-1440x900.png`), 6 rows fit in 346px. `ModelListRow.tsx:74` (`text-3xs font-bold uppercase tracking-wide`) breaks "no font-bold in chrome" and "overline labels are the only uppercase". The favourite star is `fill-current text-warning` (`:128`), i.e. status amber for a non-status meaning.
- Current: The selected rail tab already names the provider; the sub-line is noise and costs 13px per row.
- Proposed: `showProvider={selectedInstanceId === "favorites" || isSearching}`; rows drop to about 32px so 9 fit. NEW badge: `font-medium text-2xs normal-case`, text "New". Favourite star: `fill-current text-foreground` when set (neutral), keep the tooltip text.
- DNA: DNA-D5, DNA-T5, DNA-T10, DNA-C6
- Effort: XS
- Risk: `modelPickerSearch` ranks by provider name; search results still show it.
- Upstream-eligible: yes
- #24865: not addressed

### F-04-33 Shift-click multi-model selection is not discoverable anywhere in the UI

- Severity: P2
- Surface: web
- Evidence: Docs only (`docs/user/thread-sidebar.md`, "Shift-click models in a new thread's model picker"). In the picker there is no hint, no footer, no checkmark column until the first Shift-click (`ModelListRow.tsx:104-106` renders the check only when `showSelection`). After selecting two, the popup gives no summary (`04-model-picker-after-shiftclick-light-1440x900.png`).
- Current: A feature that starts one thread per model is invisible unless you read the docs.
- Proposed: When `onToggleModel` is passed (draft in a Git project), add a 28px footer row to `ModelPickerContent`: "Shift-click to run several models" with a platform `Kbd` ("⇧ click"); once two or more are selected the row reads "2 models selected. Each starts its own thread." Hide the row while searching.
- DNA: DNA-V5, DNA-P8
- Effort: S
- Risk: Popup height budget (346px); `ModelPickerContent` browser tests.
- Upstream-eligible: yes
- #24865: not addressed

### F-04-34 Choosing two models silently locks the workspace to "New worktree / From main" and shows two identical logos

- Severity: P2
- Surface: web
- Evidence: Before: strip "Current checkout" and "main". After a Shift-click: "New worktree" and "From main" (locked row, tooltip only: `components/BranchToolbarEnvModeSelector.tsx:73-100`, "Each model starts in its own worktree."), the details card also changed "main" to "From main"; the trigger reads "Claude Haiku 5.5, Claude Opus 5.5" with two identical overlapping Claude marks (`ProviderModelPicker.tsx:214-235`) (`04-model-multi-trigger-light-1440x900.png`). The effort chip still shows one value for two models.
- Current: The workspace choice you made earlier is overridden without a word, and the trigger does not say how many threads will start.
- Proposed: In multi mode set the locked strip label to "2 threads, one worktree each" (`ComposerContextLabel`), dedupe the logos by driver and append a `×2` count (`text-2xs tabular-nums`) instead of repeating the glyph, and label the effort chip "Effort (per model default)" in its tooltip. Brand colour of the logos stays (owner call).
- DNA: DNA-P3, DNA-P7
- Effort: S
- Risk: Strip width budget (`useLabelsOverflow`), `modelPickerVisibility` tests, `useMultipleModelSend`.
- Upstream-eligible: no (BranchToolbar* are touched by #24865); follow-up
- #24865: not addressed

### F-04-35 The Workspace and Branch pickers on the new-thread strip open upward over the composer

- Severity: P3
- Surface: web
- Evidence: Hero at 1440x900: strip at y=526, popup placed at y=428-522, covering the model, effort, permission chips and the send button (`04-env-mode-menu-light-1440x900@2x.png`, `04-branch-picker-light-1440x900@2x.png`); 350px of free space below. Default `side="bottom"` (`ui/select.tsx:101`). Suspected cause (not confirmed): `ContextStrip` has `overflow-x-clip` (`ComposerSurface.tsx:86`), which floating-ui treats as a clipping ancestor, so the strip's own 32px box is the collision boundary.
- Current: Choosing where the work runs hides the thing you are about to press.
- Proposed: Pass `collisionBoundary` for these popups to the chat canvas element (the same node `ComposerCommandMenuLayer` measures) so the strip is not the boundary; keep flipping up when the strip sits at the bottom of a docked thread.
- DNA: DNA-D6
- Effort: S
- Risk: Docked case must still flip; manual check at 800x600.
- Upstream-eligible: no (BranchToolbar* touched by #24865); follow-up
- #24865: not addressed

### F-04-36 Strip chips: icon and label are 2px apart, padding is off the 4px scale, locked rows lag the new colour

- Severity: P3
- Surface: web
- Evidence: Measured in "Current checkout": svg right edge x=428, label left x=430 (gap 2px, twelve-pixel icon). `components/chat/ComposerControl.tsx:14` applies `[&_svg]:-mx-0.5` to every svg unless it carries `data-composer-control-icon`; `BranchToolbarEnvModeSelector.tsx:84,137,162` use bare `<FolderIcon className="size-3" />`. Padding `px-1.75` (7px) at `ComposerControl.tsx:17` and `BranchToolbarEnvModeSelector.tsx:76`, `BranchToolbarEnvironmentSelector.tsx:71` (DNA-SP1 forbids `*-1.75`). The footer chips beside it use a 6px gap.
- Current: The strip reads as crammed next to the composer controls.
- Proposed: Render strip icons with `ComposerControlIcon size="xs"` (adds the attribute, so `mx-0`), set `gap-1.5`, and use `px-2` on the chip and the locked-row spans.
- DNA: DNA-SP1, DNA-SP2, DRIFT-16
- Effort: XS
- Risk: Strip width on 1024px (`@3xl/composer-surface` breakpoint).
- Upstream-eligible: no (BranchToolbar* and ComposerControl are in #24865); follow-up
- #24865: partial (adds `mx-0!` to the `RunContextSelector` icons and the checkout strip colour; chip padding and the EnvMode icons unchanged)

### F-04-37 The resting controls strip is see-through: timeline text runs behind the model, effort and permission chips

- Severity: P2
- Surface: web
- Evidence: After a 40px upward wheel on the long thread the composer rests at 50px and the strip shows the model, effort and permission chips over live timeline text ("Short answer for #58 ... any files") in both themes (`04-composer-resting-zoom-light-1440x900@2x.png`, `04-composer-resting-zoom-dark-1440x900@2x.png`; the strip is the composer's `ContextStrip`, `ComposerSurface.tsx:86-90`). Light has no fill; dark only a 1% white gradient (`index.css:203-210`, `--background-image-composer-seam-below`). No backdrop blur on the strip.
- Current: Reading the permission mode through body text.
- Proposed: #24865 gives light an opaque `before:bg-(--chat-composer-glass-surface)`. Follow-up for dark: remove its `dark:before:bg-transparent` so the `--surface-raised` colour sits under the seam gradient (the gradient is a `background-image`, the colour a separate property), and add `before:backdrop-blur-(--glass-blur)` to both themes only where the strip is the resting host (`data-model-only-strip`).
- DNA: DNA-C3, DNA-C11
- Effort: XS
- Risk: Glass recipe consistency with attached banners (`ComposerBanner.tsx:58`); no tests.
- Upstream-eligible: no (ComposerSurface.tsx is in #24865); follow-up
- #24865: partial (light fixed, dark unchanged)

### F-04-38 One wheel notch collapses the composer to a 50px row and the height snaps back at the end

- Severity: P3
- Surface: web
- Evidence: `COMPOSER_SCROLL_COLLAPSE_THRESHOLD_PX = 24` (`ChatComposer.tsx:246`). On the long thread a single `wheel(-40)` changed the composer from 144px to 50px at t=320ms (one frame, panel animations default 0); scrolling back to the end snapped 50px to 144px 73ms after the wheel (`rest3.mjs`). The "Scroll to end" pill and sticky message pill then sit on the 50px row (`04-longthread-composer-resting-after-scrollup-light-1440x900.png`). The setting to turn it off exists (Settings → General, `composerCollapseOnScroll`, default on).
- Current: Instant by design (DNA-M1), but a casual 24px nudge triggers a 94px layout change.
- Proposed: Raise the threshold to 120px of accumulated upward delta (about one expanded footer) and keep the end-of-timeline expand as is. With panel animations above 0 the existing WAAPI path already animates.
- DNA: DNA-M1, DNA-D6
- Effort: XS
- Risk: `composerScrollGesture.ts` tests; trackpad inertia.
- Upstream-eligible: no (ChatComposer.tsx); follow-up
- #24865: not addressed (it changes the editor `min-h`, not the resting trigger)

### F-04-39 Banners have no shared height budget, so approval plus queue plus composer can fill a 600px window (code-read only)

- Severity: P2
- Surface: web
- Evidence: Each banner caps itself: queue list `max-h-32` plus 24px header (`QueuedRunsControl.tsx:264`), generic scroll `max-h-[min(24rem,40dvh)]` (`ComposerBanner.tsx:286`), approval command `max-h-40` plus label and buttons (`ComposerPendingApprovalPanel.tsx:80`, spacious density 12px padding: `ChatComposer.tsx:3500`). At 800x600 with 548px under the header: composer 144 + approval about 230 + queue about 152 = 526px, leaving about 22px of timeline. Related: #21967 (expanded rows hidden behind the composer), #14231 (collapsed question card still leaves full height).
- Current: The sum of caps is never checked against the viewport.
- Proposed: Give `ComposerBanner.Dock` a budget `max-h-(--composer-banner-budget)` with `--composer-banner-budget: min(45dvh, 26rem)` defined in `index.css`, `overflow-y-auto` and the urgent item pinned first; collapse `QueuedRunsControl` by default (`useState(false)`) while `hasBlockingComposerTopDrawer` is true; cap the approval detail with `--composer-detail-max-height: min(10rem, 20dvh)`.
- DNA: DNA-D6, DNA-P6 (one slot system)
- Effort: M
- Risk: `ComposerBannerStack` measures its own height for the peek; test with approval + queue + goal at 800x600.
- Upstream-eligible: no (ChatComposer.tsx); follow-up
- #24865: not addressed

### F-04-40 The context meter and the compact entry are off by default, filed under "Legacy features", and warn only above 90%

- Severity: P2
- Surface: web
- Evidence: `packages/contracts/src/settings.ts:427` (`contextWindowMeterEnabled` default false); Settings → General → "Legacy features" row "Context window indicator (legacy)" (`components/settings/SettingsPanels.tsx:748-757`). With it on: 28px ring, arc `muted-foreground 72%` on a `/24` track, red only above 90% (`ContextWindowMeter.tsx:36-39`); title "Context Window" (`:100`); popover opens on hover, "Compact context" button inside (`04-context-meter-hover-light-1440x900@2x.png`); at 6.1% the arc is nearly invisible. Compaction is otherwise reachable only through `/compact`. Ideas #14404 (always-visible usage, 49 up), Issue #8388 (OpenCode never reports usage).
- Current: Most users never see context pressure until the provider compacts or fails.
- Proposed: Show the meter automatically once `usedPercentage >= 70` regardless of the legacy switch (`ChatComposer.tsx:3887` condition `settings.contextWindowMeterEnabled || (activeContextWindow?.usedPercentage ?? 0) >= 70`); arc colours: neutral below 75, `--warning` 75 to 90, `--error` above 90, with `text-warning-foreground` in the popover; sentence case "Context window"; keep the hover popover but also open on click (it already does) and show "Compact context" as the popover's only action. Move the switch out of "Legacy features" as "Context meter: Auto, Always, Never" (settings areas own it).
- DNA: DNA-P3, DNA-C6, DNA-V1
- Effort: S
- Risk: `ContextWindowMeter.logic.test.ts`; the placeholder width reservation (`reserveContextWindowMeter`) must apply when auto-shown to avoid footer jitter.
- Upstream-eligible: no (ChatComposer.tsx); follow-up
- #24865: not addressed

### F-04-41 Small status text uses the base status colour: approval label 2.13:1, prompt-length error 3.81:1

- Severity: P2
- Surface: web
- Evidence: Measured on the composer surface (light): `text-warning` 2.13:1, `text-destructive` 3.81:1, `text-warning-foreground` 5.03:1, `text-destructive-foreground` 6.42:1. Sites: `components/chat/ComposerPendingApprovalPanel.tsx:52` ("Command approval", 11px, `text-warning`; code-read only), `components/chat/ComposerPromptLengthValidation.tsx:7` (12px, `text-destructive`; `04-prompt-too-long-after-enter-light-1440x900.png`). DNA-C6: text uses `*-foreground`, icons and fills use the base.
- Current: The two most consequential composer messages (approve a command, prompt rejected) are the lowest contrast.
- Proposed: `text-warning-foreground` and `text-destructive-foreground` at those two sites; keep the warning icon (`ComposerBanner.Icon` already `text-warning`) as the base colour.
- DNA: DNA-C6, DNA-C5
- Effort: XS
- Risk: None functional.
- Upstream-eligible: yes (neither file is in the #24865 diff)
- #24865: not addressed

### F-04-42 Composer-originated messages mix "Could not", "Unable to", "Couldn't" and "Failed to"

- Severity: P3
- Surface: web
- Evidence: `ChatComposer.tsx:2769` ("Couldn't get the path of ..."), `:2780` "Unable to add folder", `:2853` "Unable to add to chat", `:2901` "Unable to read the dropped thread", `:2949` "Unable to add thread"; `components/chat/useComposerContextImport.ts:145` ("Couldn't bring ..."); `components/BranchToolbar.tsx:143` "Failed to copy path"; `BranchToolbarBranchSelector.tsx:337,433,470`; `components/chat/ThreadActivityBanners.tsx:77,85` ("Failed to resume goal.", "Failed to clear goal."); versus `useComposerSend.ts:1302` and `useComposerStash.ts:570` ("Could not ..."). `docs/user` and DRIFT-12.
- Current: Nine composer strings break DNA-V4 (one prefix, no contractions).
- Proposed: "Could not <verb> <object>" for all; descriptions keep the real cause. Toasts themselves belong to area 12; this is the list of composer call sites.
- DNA: DNA-V4, DRIFT-12
- Effort: XS
- Risk: Tests that match toast titles (grep `Unable to add`).
- Upstream-eligible: no (ChatComposer.tsx and BranchToolbar.tsx are in #24865); follow-up
- #24865: not addressed

## Edge-case results (matrix)

Legend: PASS / FAIL (finding) / N/A (why) / NOT TESTED (why). "Code-read" means the state was not produced live.

**Data**

- Empty: PASS (empty editor, empty menus; but bare `@` FAIL F-04-11).
- One item: PASS (one queued row `1 queued message`, one stash entry, one attachment).
- 100+ items: PASS (slash menu 111 rows scrolls inside `max-h-72`; `@` results 80 rows; model list is virtualised with LegendList).
- 10,000+ items: NOT TESTED (no composer list reaches it; path results are capped at 80; queue and stash lists are not virtualised, code-read: acceptable at their sizes).
- Very long names: PASS (400-char attachment name truncated mid-string in the chip; long queued text truncated with a tooltip; 500-char thread titles truncate in `@` rows). Long thread title in the aria-label "Message <title>" is unbounded (cosmetic).
- Unicode and emoji: PASS (emoji and mixed Hebrew/Latin text render; `04-edit-rtl-emoji-light-1440x900@2x.png`).
- RTL: PASS (per-block direction from `composer-text-direction.ts`; a pure Arabic paragraph flips to `rtl`, a mostly-Latin mixed paragraph stays `ltr`).
- Leading/trailing whitespace, whitespace-only: PASS (send stays disabled for spaces and blank lines).

**Content**

- Very long single-line string without spaces: PASS (400 `A` characters wrap; `scrollWidth` equals `clientWidth`).
- Unterminated code fence: PASS (a ` ```js ` block stays open, Enter keeps indentation, language chip shown).
- Nested lists: FAIL F-04-08, F-04-09.
- Images in composer: PASS (pasted image attaches, remove X present; F-04-07 cosmetic).
- Binary file: PASS (`data.bin` attaches as a file chip; F-04-05 for removal).
- Large paste (51,891 chars): PASS (folds to `pasted-text.txt`, toast "Large paste attached... Use ⌘⇧V to keep a large paste inline").
- Over-limit prompt (125,000 chars): FAIL F-04-10 (message only after a send attempt).
- 5k-line diff, 200-file diff, tool output 1 MB, tables, links in messages: N/A (thread content, areas 03 and 05).

**Network and agents**

- Provider not installed: PASS (six providers dimmed with reasons in the rail; F-04-30 for clipping); composer "Open provider settings" chip code-read only.
- Provider installed but logged out: NOT TESTED (both installed providers are signed in); code-read in `describeUnavailableInstance`.
- Auth expired mid-session, stream stalls, relay disconnected, reconnect after sleep, server restarted, version mismatch: NOT TESTED (cannot be produced on this host without breaking the shared server); banners code-read in `useSystemComposerBanners.tsx:195-290`.
- Stream cancelled mid-token: NOT TESTED (I observed the Stop control but did not press it, to avoid held-queue side effects and extra turns).
- Permission prompt mid-stream: NOT TESTED live (Claude did not request approval); panel code-read, F-04-41.
- Two or six threads streaming at once: NOT TESTED (turn budget). The composer state is per thread (drafts are keyed by target; see Lifecycle, draft persistence PASS).
- Queue and steer states: PASS (running empty = red Stop; typed = steer glyph; Meta held = queue glyph; Mod+Enter queued; two queued rows; edit shows a check button and row "Cancel"; reorder by keyboard ArrowUp; remove). One timing note: a queue attempt made just after the turn ended became a normal send (expected).

**Git**

- No repo / "No project": PASS (strip and diff controls absent, `04-draft-no-project-light-1440x900.png`; placeholder is still the old "follow-ups" string, F-04-01).
- Uncommitted changes, detached HEAD, worktree creation failure, no GitHub auth, push rejected, merge conflict, branch collision: N/A (area 05). The `#` PR picker in a project without a GitHub remote shows "Pull requests are not available for this project." (PASS; visible only as a faint 12px line).

**Viewport**

- 1440x900: PASS. 1280x720: PASS. 1024x640: PASS (footer not compact).
- 800x600: FAIL F-04-22 (permission label collapses to icon first).
- 3440x1440: PASS (composer stays the 736px lane, centred at x=1480).
- 720x450 (equivalent to 200% browser zoom): PASS (composer 144px of 450, all controls present).
- 390x844: FAIL F-04-22, F-04-23, F-04-24, F-04-18; collapsed pill and expanded states shown.
- 390 with keyboard open: NOT TESTED (no software keyboard in Playwright); a 390x460 viewport was used as a stand-in (`04-mobile-kbd-sim-multiline-light-390x460.png`); see Needs deeper look.
- OS zoom 80/125/150 and browser zoom 50%: NOT TESTED (no OS-level scaling control in the harness).

**Preferences**

- Light: PASS. Dark: PASS (`04-draft-hero-empty-dark-1440x900.png`, `04-model-picker-open-dark-1440x900.png`, resting strip F-04-37).
- System switching live, every named theme: NOT TESTED; theme overrides for the composer are code-read in `ComposerSurface.tsx:15-20` (`--app-theme-surface-raised`, `--app-theme-toolbar-border`).
- Reduced motion: FAIL F-04-19 (send button still scales 1.05 over 150ms); the hero and resting transitions are instant by default (DNA-M1) and WAAPI-gated otherwise.
- High contrast / forced colours: NOT TESTED.
- Keyboard only: PASS with notes (Tab order: model, effort, permission, attach, strip chips, details card; focus ring is the 2px `ring-ring` with 1px offset on every chip, `04-focus-tab-1-light@2x.png`; `mod+shift+m` opens the picker with focus in search, Left reaches the rail, Right returns, Enter selects, focus returns to the editor, F-04-16 for stop).
- Screen reader: NOT TESTED (code-read: editor `role=textbox`, `aria-multiline`, `aria-label "Message <thread title>"`, `aria-autocomplete=list`, menus expose `aria-activedescendant`, empty states in a `role=status` region; F-04-03 for the duplicated placeholder).
- Font size overrides: code-read only (`--font-size-prompt`; touch widths force 16px, measured in DNA).

**Lifecycle**

- First launch, launch after update, corrupted settings: N/A or NOT TESTED (no first-run state available).
- App backgrounded for an hour, minimised during stream, OS sleep during stream: NOT TESTED (not producible).
- Draft persistence: PASS (typed text survives a full reload and a thread switch and back; stash entries persist in `t3code:prompt-stash:v2`). The "composer text lost" cluster (#7390, #17422, #20982, #15974, #8963, #16985) did not reproduce on web; see Needs deeper look.

## Already good (do not touch)

- **Large paste folding and its toast** (51 KB paste becomes `pasted-text.txt` with the escape hatch named in the toast). Evidence `04-paste-large-text-light-1440x900.png`.
- **Queue rows and stash menu** share the `ComposerBanner` slot system: grip with arrow-key reorder, pencil edit with visible "Cancel" and a check send button, remove, steer. `04-queue-two-rows-light-1440x900.png`, `04-queue-editing-light-1440x900.png`, `04-stash-menu-light-1440x900@2x.png`.
- **Draft persistence** across reload and thread switch, and the stash badge ("Stash 1") with Cmd+S.
- **ArrowUp / ArrowDown prompt recall** (`04-recall-arrowup-light-1440x900@2x.png`): restores the last two prompts in order, ArrowDown walks back to empty.
- **Code block editing** with language chip, indentation and fence handling (`04-edit-code-block-light.png`).
- **Model picker keyboard model**: `mod+shift+m`, search first, Left to rail, Right back, Enter selects and refocuses the editor, no-results state "No models found" (`04-model-picker-noresults-light-1440x900.png`).
- **Focus rings** on composer chips are consistent: 2px ring with 1px offset, never clipped (`04-focus-tab-*-light@2x.png`). Keep the existing ring when changing control colours.
- **Mention and slash menus a11y**: `listbox` with `aria-label`, `aria-activedescendant`, a `role=status` live region for empty and loading states.
- **Send state labels**: aria-label changes with state (Submit, Steer, Queue, Update queued message, Resume, Preparing worktree, Environment disconnected) and tooltips explain disabled reasons.
- **Hero to docked and resting transitions** respect the panel-animation gate (default 0) and `prefers-reduced-motion` (`draftHeroTransition.ts`, `useComposerRestingTransition.ts`); keep it that way.
- **Whitespace-only and over-limit sends are blocked** (validation text is clear; only its timing is a finding).
- **Brand colour on the model logo** in the footer stays (owner call in #24865).

## Incomplete (what I did not cover and why)

- Pending-approval panel, pending user-input panel, plan follow-up ("Refine" / "Implement"), goal banner, background-work banner interactions beyond one screenshot, tasks drawer, usage-limit banner, update-required model notice, provider-unavailable chip, system banners (offline, version mismatch): not reproducible with four small turns and a healthy server; code-read only (F-04-39, F-04-41).
- Interrupt click, held queue ("Resume"), steering a queued row: not exercised, to stay within the turn budget.
- Host/environment selector and `mod+shift+h`: only one environment exists, so the selector never renders (`showEnvironmentPicker` false).
- Native mobile app composer (`apps/mobile`): not audited; all phone findings are web at 390px.
- Slash and `$` menus: observed live (111 Claude commands and skills, 21 Codex commands, 16 skills) but not screenshotted because they list the developer's personal skills (see Session notes).
- Named themes, forced colours, screen-reader pass, OS zoom: see matrix.
- Everything is measured on `main`; #24865 is not merged on this host, so all after-states are read from its diff, not seen.

## Needs deeper look

- **Area 15 (mobile) and a real device:** a 390px touch-emulated viewport sent a message when Enter was pressed (an Enter key event, not a software-keyboard return). Confirm that the software keyboard Return inserts a newline on iOS and Android web and only a hardware Enter sends (`isSoftwareKeyboardOpen` in `useComposerCommandKey.ts`); related #14869 (Shift+Enter on iPad Magic Keyboard), #20982, #7390.
- **Area 03:** the "Scroll to end" pill collides with the sticky user-message pill just above the resting composer (`04-longthread-composer-resting-after-scrollup-light-1440x900.png`).
- **Area 12:** the large-paste toast lands on the thread details card at the top right; it covers "Open in VS Code" while it is visible.
- **Area 09:** a two-letter "CL" badge appears on the Claude logo in the picker trigger once a second Claude instance exists (`04-model-trigger-after-select-light-1440x900@2x.png`); the unavailable providers occupy the rail at half opacity.
- **Area 05 and the server:** `@` workspace search returns unrelated files for short queries (F-04-12); the filtering likely belongs in the search handler.
- **Ideas #18028 (side chat):** the composer has no secondary send target; any design needs a second submit affordance next to the steer/queue state of F-04-17. Not proposed here (new feature).
- **Ideas #17170 (compact-before-send off switch):** the neutral pill of #24865 improves the armed state, but "never" needs a settings row (F-04-20).
- **#8963 (Stop during a pending approval loses typed text) and #16985 (text paste then image within 300 ms drops text):** need a live approval and a timed paste; not reproduced.
- **Area 01/10:** `/new` renders "Could not open the link / This link has no prompt." as a full page (prompt-link route) when opened without a prompt.
