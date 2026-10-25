A designer's feedback on the app was blunt: "the fonts, the border radius, the icons, the font hierarchy." A design council of four models agreed. Against the Claude Code and Codex desktop apps, they scored main at about 7/10: noisy sidebar, mismatched composer controls, an uneven details panel, and faint or ambiguous settings.

This PR replaces the earlier design PRs with one change set. Each change came out of council review on fresh screenshots of real data. Every round was scored against Claude Code and Codex, until the reviewers had T3 at 9.5+ and ahead of both apps.

Supersedes:

- [#24776](https://github.com/pingdotgg/t3code/pull/24776) (fonts, radii, icon stroke, settings hierarchy)
- [#24837](https://github.com/pingdotgg/t3code/pull/24837) (first council follow-up)
- [#24810](https://github.com/pingdotgg/t3code/pull/24810) (blue accent pass). Its blue "you are here" tint and blue composer focus ring are **not** carried over. The council pushed toward neutral rows and controls.

## What changed

- **Type, radius, icons:**
  - Inter on Windows and Linux, so medium and semibold weights render. macOS keeps SF Pro.
  - A 4/6/8/12/16 radius scale.
  - 1.75 icon strokes.
- **Sidebar:**
  - The title leads each row. Read titles are at 75% and brighten on hover. Open and unread titles are full white.
  - Metadata sits one step below the title.
  - Agent logos and inactive project icons are gray until hover. **Settings → Appearance → Colored project icons** keeps project icons in color.
  - PR numbers are neutral. Only the state icon keeps its color.
  - Branch names cut at a whole letter, with a flush "…".
  - Shelf headers read "Snoozed 1 ›".
  - Hover actions swap instantly.
  - The worktree glyph before a branch is readable, not faded.
- **Composer:**
  - Rests two lines tall.
  - One neutral control style, with no divider lines.
  - "Compact next" / "Keep full" shows its armed state.
  - A gauge icon for effort.
  - One placeholder everywhere.
  - The checkout strip matches the composer in both themes.
- **Details panel:**
  - Each row has one leading icon, and the machine glyph is legible.
  - The editor app icon is muted at rest.
  - Divider lines show on hover only.
  - PR titles wrap to two lines, with "33/34 checks" below.
  - "Previous agents" sits on the icon column with a trailing count.
  - Empty drafts hide Push and zero Changes.
- **Settings:**
  - 16px semibold section titles.
  - Boxed scope pickers.
  - Matching chevrons.
  - Balanced description wrapping.
  - The inheritance marker shows only when something overrides the value.
  - Clearer labels:
    - "Resume after usage limits" and "Snooze until limits reset". These also changed on mobile, in settings search, and in the user docs.
    - The automatic model state is part of the Model description.
- **New thread:** the project name drops the dotted underline and underlines on hover.
- **Color:**
  - Chat text is at 90%.
  - Light mode uses darker status and diff tokens, a balanced emerald-700 / red-700 pair, and a darker user bubble.
  - The timeline minimap is quieter.

## Before / after

Main vs this PR. macOS, 1280×832, seeded dev data with the dev sidebar artwork turned off. Numbered arrows match the legends.

![Annotated main vs this PR](https://files.tslop.org/2026/10/ui-95-annotated-main-vs-pr-s11-a5faf45d.png)

<details>
<summary>Full screenshots</summary>

| main                                                                                       | this PR                                                                                    |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ |
| ![main thread dark](https://files.tslop.org/2026/10/ui-95-main-thread-dark-4c233702.png)   | ![after thread dark](https://files.tslop.org/2026/10/ui-95-s10-thread-dark-46f8dba3.png)   |
| ![main thread light](https://files.tslop.org/2026/10/ui-95-main-thread-light-a2972846.png) | ![after thread light](https://files.tslop.org/2026/10/ui-95-s10-thread-light-b3dcff64.png) |
| ![main new thread](https://files.tslop.org/2026/10/ui-95-main-new-light-8f285a82.png)      | ![after new thread](https://files.tslop.org/2026/10/ui-95-s11-new-light-5532be52.png)      |
| ![main settings](https://files.tslop.org/2026/10/ui-95-main-settings-dark-1458314d.png)    | ![after settings](https://files.tslop.org/2026/10/ui-95-s10-settings-dark-210517f3.png)    |

</details>

## Council review

Rounds: 15 (5 to reach 9.0, then 10 to push past 9.5)

First pass, overall scores. Rounds 2 and 3 were Sol only.

| Delegate          | Round 1 (#24776) | Round 4 | Round 5 |
| ----------------- | ---------------- | ------- | ------- |
| Claude Opus 5.5   | 7.1/10           | 8.7/10  | 9.0/10  |
| Muse Wonder Full  | 6.9/10           | not run | 7.9/10  |
| Codex GPT-6.1 Sol | 7.4/10           | 9.0/10  | 9.0/10  |

9.5 pass, overall scores by build. s10 is this PR's head.

| Delegate          | s1      | s2      | s3      | s4      | s5      | s6      | s7     | s8      | s9      | s10    |
| ----------------- | ------- | ------- | ------- | ------- | ------- | ------- | ------ | ------- | ------- | ------ |
| Claude Opus 5.5   | not run | not run | not run | 9.3/10  | 9.5/10  | not run | 9.6/10 | not run | not run | 9.6/10 |
| Muse Wonder Full  | not run | not run | not run | not run | not run | 9.3/10  | 9.4/10 | 9.4/10  | 9.5/10  | 9.5/10 |
| Codex GPT-6.1 Sol | 9.3/10  | 9.4/10  | 9.5/10  | 9.5/10  | 9.5/10  | 9.5/10  | 9.5/10 | 9.5/10  | 9.4/10  | 9.5/10 |
| Gemini 4 Argon    | 9.2/10  | not run | not run | 9.6/10  | not run | 9.6/10  | 9.6/10 | not run | not run | 9.7/10 |

On s10, every delegate rates every category at 9.5 or higher. Lowest category per delegate:

| Delegate          | Lowest category on s10 | T3 overall | Claude Code | Codex |
| ----------------- | ---------------------- | ---------- | ----------- | ----- |
| Claude Opus 5.5   | 9.5                    | 9.6        | 8.8         | 9.0   |
| Muse Wonder Full  | 9.5                    | 9.5        | 9.0         | 8.9   |
| Codex GPT-6.1 Sol | 9.5                    | 9.5        | 9.2         | 9.2   |
| Gemini 4 Argon    | 9.6                    | 9.7        | 9.5         | 9.6   |

Opus, Muse and Sol put T3 ahead of both apps in every category. Gemini's own table has two exceptions: Codex is above T3 on spacing (9.7 vs 9.6) and ties it on consistency (9.7). Its text still says T3 outscores both. Its reference scores also moved from about 8.5 to about 9.6 between rounds on the same reference images, so treat them as noisy.

Owner calls that stay as they are:

- the blue switch accent
- the model logo's brand color in the composer
- three-line sidebar rows
- the #0a0a0a canvas
- 75% read titles

Made with Claude Opus 5.5 in Claude Code, running in T3 Code.

🤖 Generated with [Claude Code](https://claude.com/claude-code)
