# Owner direction: PR #24865 (moving baseline)

`t3dotgg` opened https://github.com/pingdotgg/t3code/pull/24865 "feat(web): UI design overhaul, rated above
Claude Code and Codex" on 2026-10-25 12:12Z (+502/-272, 55 files, size:XL, vouch:trusted, all 15 checks green,
CodeRabbit and Macroscope pass). It supersedes #24776, #24837 and #24810 (all closed unmerged). Full body:
`pr-24865-body.md`; full diff: `pr-24865.diff`.

## What it changes (from the PR body)

- Type, radius, icons: Inter bundled for Windows/Linux (macOS keeps SF Pro); a 4/6/8/12/16 px radius scale;
  1.75 icon strokes.
- Sidebar rows: title leads the row; read titles at 75% opacity and brighten on hover; open/unread titles full
  white; metadata one step below; agent logos and inactive project icons grey until hover with a new
  Settings → Appearance → "Colored project icons" switch; neutral PR numbers; whole-letter branch truncation with
  flush "…"; shelf headers "Snoozed 1 ›"; instant hover-action swap; readable worktree glyph.
- Composer: rests two lines tall; one neutral control style without divider lines; "Compact next"/"Keep full"
  armed state; gauge icon for effort; ONE placeholder everywhere; checkout strip matches the composer.
- Details panel: one leading icon per row; muted editor icon at rest; dividers on hover only; PR titles wrap to
  two lines with "33/34 checks" beneath; "Previous agents" on the icon column; empty drafts hide Push and zero
  Changes.
- Settings: 16 px semibold section titles; boxed scope pickers; matching chevrons; balanced description
  wrapping; inheritance marker only when something overrides; clearer labels ("Resume after usage limits",
  "Snooze until limits reset", also on mobile, settings search and docs).
- New thread: project name loses the dotted underline, underlines on hover.
- Colour: chat text at 90%; light mode uses darker status and diff tokens (emerald-700 / red-700), a darker user
  bubble; quieter timeline minimap.

## Owner calls that STAY (explicit in the PR body; treat as DNA do-not-touch)

- the blue switch accent
- the model logo's brand colour in the composer
- three-line sidebar rows
- the #0a0a0a canvas

## What this means for the audit and the spec

1. Every finding in areas 01, 02, 04, 05 (details card), 07, 17, 18, 20 (labels) carries a tag:
   `#24865: addressed | partial | not addressed | conflicts`. Check `pr-24865.diff` before writing "Proposed".
2. The token proposal (spec §3) is a delta over #24865's end state: 4/6/8/12/16 radii, 1.75 strokes, 90% chat
   text, Inter on Win/Linux are givens, not proposals.
3. Do not propose: a different canvas than #0a0a0a, a non-blue switch accent, two-line sidebar rows, or removing
   the model brand colour in the composer. Proposals that touch those are "conflicts" and go to spec §15 only.
4. Upstream-eligible chunks exclude files #24865 touches unless the chunk is a follow-up fix to #24865 itself.
5. Phase 2 integration branch is cut after #24865 merges (D-006 in RUNLOG.md).
