# 05 First draft landing (after setup), web and desktop; 1280 and 390

Where the wizard ends (`routes/welcome.tsx` `onDone`): a draft in the landing project, or `NoProjectsHero` with zero projects. Both surfaces exist and are good (area 10 "Already good"); this file adds one quiet line and one optional element and does not restyle anything. Audit: F-24-14 (keyboard orientation), F-24-15 (starter prompts), F-10-02 (import entry on the hero), F-10-03 (what `/` opens). Reference captures: `[W]draft-empty-project-nongit-light-1440x900.png` (draft), `[W]no-projects-hero-light-1440x900.png` (hero).

## A. Draft with a project, 1280x720

```
 +-----------------+---------------------------------------------------------+---------------+
 | sidebar 280 px  | breadcrumb: [AS] acme-service / New thread        [ ][ ][ ] | details card |
 | (unchanged)     |                                                         | 280 px, 22 px |
 |                 |                                                         | (unchanged)   |
 |                 |           What should we build in acme-service?         |               |
 |                 |                 or start without a project              |               |
 |                 |   +-------------------------------------------------+   |               |
 |                 |   | Ask anything. @ files, $ skills, / commands     |   |  <- placeholder, one string
 |                 |   |                                                 |   |     everywhere (#24865)
 |                 |   | (codex) GPT-5.6-Terra v | Medium v | (unlock) Full access v |  (send) |
 |                 |   +-------------------------------------------------+   |               |
 |                 |   [Cmd K] Commands   [Cmd D] Review changes   [Cmd N] New thread        |  <- NEW: DraftKeyHints
 |                 |                                                         |               |
 +-----------------+---------------------------------------------------------+---------------+
```

- `DraftKeyHints` [NEW COMPOSITION, one small component]: a `flex flex-wrap justify-center gap-x-4 gap-y-1` row of `KbdGroup`/`Kbd` + `text-xs text-muted-foreground` label (`ui/kbd.tsx`). Keys are `shortcutLabelForCommand(keybindings, command)` (`keybindings.ts:243`, already used by `DraftHeroHeadline.tsx:315`) for `commandPalette.toggle`, `diff.toggle`, `chat.new`; an item whose command the user has unbound is omitted (DNA-P3: never show a key that does nothing). Glyphs follow the platform (`mod` is Cmd on macOS, Ctrl elsewhere).
- Visibility rule, no new state: render only while the draft has no user content and `Date.now() - onboardingCompletedAt < 24 h` (the existing client setting set by `completeOnboarding`). The row expires by itself; existing users and anyone who finished setup earlier never see it. Reduced motion: it appears with the page, no animation (DNA-M1).
- Not a tour: no overlay, no coach mark, no step counter, no dismiss button, nothing blocks the composer (DNA-P2, DNA-ID3). Full list stays where it is: Settings, Keybindings (palette "Open settings" matches "keybindings", `CommandPalette.tsx:1596`).
- Composer, chips, details card, hero heading: untouched (DNA-K6, DNA-K7).
- At 1024: the details card hides below the lane minimum (existing DNA-L5); hints stay centred under the composer (lane 736 px, DNA-SP5).

## B. Zero projects, 1280x720 (`NoProjectsHero`, `Empty size="hero"`)

```
 +--------------------------------------------------------------------------------------------+
 | [drag strip, Electron only]                                                                |
 |                                                                                            |
 |                                What should we work on?                                     |
 |                          Add a project, or start without one.                              |
 |            [ + Add project ]  [ Start without a project ]  [ Import from Claude Code or Codex ]
 |                                                                                            |
 +--------------------------------------------------------------------------------------------+
```

- Third control: `Button size="sm" variant="ghost-muted"` "Import from Claude Code or Codex" -> `/welcome#import:<primaryEnvironmentId>` (F-10-02 step 4). Hidden when `!localAvailable`. The first two are unchanged. A person who skipped import keeps a way back (DNA-P7).
- "Start without a project" is the sample project (see audit gap table): a scratch thread, zero setup, no files written into the user's folders.

## C. Optional: starter prompts (needs maintainer sign-off, audit F-24-15)

```
 |                   +-------------------------------------------------+                      |
 |                   | Ask anything. @ files, $ skills, / commands     |                      |
 |                   +-------------------------------------------------+                      |
 |                     Explain this repository     Summarize recent commits     List the TODOs |  <- InlineButton tone="muted"
 |                   [Cmd K] Commands   [Cmd D] Review changes   [Cmd N] New thread            |
```

- Each is `InlineButton tone="muted"` (`ui/button.tsx`, same as "or start without a project"). Click puts the sentence in the composer and focuses it; it never sends (the user stays in control, DNA-P2). Read-only phrasing only, because the default permission mode is Full access (F-24-04).
- Same 24 h and empty-draft visibility rule. If maintainers say no, drop this block; A and B stand alone.

## D. 390x844 (web at phone width, docked pill composer)

```
+------------------------------------+
| [=]  acme-service / New thread     |
|                                    |
|    What should we build in         |
|    acme-service?                   |
|    or start without a project     |
|                                    |
|                                    |
|  +------------------------------+  |
|  | Ask anything. @ files, $     |  |
|  | skills, / commands           |  |
|  | (codex) v   Medium v   (send)|  |
|  +------------------------------+  |
+------------------------------------+
```

- Keyboard hints are hidden below 640 px and on `pointer: coarse` (there is no hardware keyboard to teach; DNA-X4). Nothing else changes.
- Hero: `Button` row wraps to two lines at 390 (`flex-wrap`), each 36 px.

## Rule check

- Exists: hero, composer, details card, `shortcutLabelForCommand`, `Kbd`, `InlineButton`, `NoProjectsHero`, `/welcome#` hash handling (extended with `import:`).
- Additive: one component, one button, one hash. Touches `DraftHeroHeadline`'s parent layout only to append a sibling; no change to #24865's composer hunks (`ChatComposer.tsx`, `ComposerControlsBar.tsx`, `composerPlaceholder.ts`).
- DNA: P2, P3, P7, K6, K7, K14, L8, ID3, SP5, X4, V5.
