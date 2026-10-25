# 04 Wizard: Projects step, web and desktop; 1280 and 390

Existing step 3 ("Import your projects", `ImportStep`, `WelcomeWizard.tsx:1173-1523`). It imports from Claude Code and Codex history only. Audit: F-24-08 (no folder pick), F-24-09 (import wait), F-24-10 (skip), F-10-07 (zero candidates), F-10-12 (footer), F-10-13/14 (row labels and phone width), F-10-26 (loading heading, refusal wording). Re-entry from Settings and the palette is F-10-02; this file only draws where `#import:<environmentId>` lands.
Masked data below (`acme/service-N`, `~/code/project-N`) matches the existing captures; see `[W]welcome-3-import-masked-light-1440x900.png`.

## A. Candidates found, 1280x720 (dialog 768 px)

```
 +------------------------------------------------------------+
 | T3 Code                                                [x] |
 | +--------------------------------------------------------+ |
 | | (v) Agents                           (2) Projects       | |
 | +--------------------------------------------------------+ |
 |------------------------------------------------------------|
 | Import your projects                                       |  <- StepShell [EXISTS]
 | Import projects and conversations from Claude Code and     |
 | Codex on MacBook Pro.                                      |  <- machine label when 1 computer
 |                                                            |
 | 2 of 19 selected                    Select all  Select none|  <- role="status" [EXISTS]
 |                              Conversations  Last active    |  <- column header, sm: only [CHANGE F-10-13]
 | [x] acme/service-1  ~/code/project-2   (c)(x)    14    1m  |  <- ImportCandidateRow [EXISTS]
 | [x] acme/service-3  ~/code/project-4   (c)        3    1d  |
 | [ ] acme/service-5  ~/code/project-6   (c)        1    1d  |
 | [ ] acme/service-7  ~/code/project-8   (c)        1    5d  |
 | [ ] > Other folders                            12 folders  |
 |                                                            |
 |------------------------------------------------------------|  <- footer slot (sticky)
 | [ Add a project… ]      [ Skip import ]  [ Import 2 projects ]|
 +------------------------------------------------------------+
```

- `Add a project…` is `Button variant="ghost-muted"`; it finishes setup (`finish()`), then calls `openCommandPalette({ open: "add-project" })`, the same call `NoProjectsHero` makes (`NoProjectsHero.tsx:32`). It never imports anything. A trailing "…" because it opens a further choice (DNA-V9).
- `Skip import` replaces "Do not import projects" in the loading, loaded and empty states (DNA-V2; F-10-26). `Import N projects` keeps `autoFocus`.
- Column header (`text-2xs text-muted-foreground`, `sm:` and up only); each count and age gets an `aria-label` ("14 conversations", "Last active 1 minute ago").
- The inner `max-h-80` scroll area is removed; the dialog body is the only scroll region and the footer slot does not scroll (F-10-12).
- Landing after import: unchanged (`resolveOnboardingLandingProject`: the project with imported history, else the first imported project).

## B. Importing

```
 | Import your projects                                       |
 | ...list stays visible, checkboxes disabled (fieldset)...   |
 |                                                            |
 | (o) Importing 2 of 7…                                      |  <- role="status", tabular-nums, DNA-T8
 |------------------------------------------------------------|
 |                          [ Skip import ] [ (o) Importing…  ]|  <- both disabled, as today
 +------------------------------------------------------------+
```

- `Importing N of M…` is the loop index the component already has (`for (const candidate of selection)`, `WelcomeWizard.tsx:1299`); one `useState` for `{done, total}`. `Spinner size="md"` (shared, DNA-M6). The close X, Escape and Skip stay disabled while importing (existing rule, `docs/user/welcome-wizard.md`): the progress line is what makes that wait legible.
- On partial failure the existing toast text is unchanged ("Some history was not imported").

## C. Nothing to import (F-10-07)

```
 | Import your projects                                       |
 |                                                            |
 |                       No projects found                    |  <- Empty size="inline" (F-10-25)
 |   Claude Code and Codex have not used any folders on       |     EmptyTitle text-sm/500,
 |   MacBook Pro. Add a project to start your first thread.   |     EmptyDescription text-xs muted
 |                                                            |
 |------------------------------------------------------------|
 |               [ Add a project… ]  [ Continue  -> ]          |  <- Continue = default, autoFocus
 +------------------------------------------------------------+
```

- Zero candidates: the disabled "Import 0 projects" is replaced by an enabled `Continue` (DNA-P2: no control that cannot act). `Continue` lands on the zero-project hero (`NoProjectsHero`, 05B) or, if a project already exists, on a new draft.
- Scan error state keeps its `role="alert"` row with `Retry`.

## D. 390x844

```
+------------------------------------+
| T3 Code                        [x] |
| (v) Agents  (2) Projects           |
|------------------------------------|
| Import your projects               |
| Import from Claude Code and Codex  |
| on MacBook Pro.                    |
| 2 of 19 selected  Select all  none |
|                                    |
| [x] acme/service-1                 |  <- name gets the full line [CHANGE F-10-14]
|     ~/code/project-2               |  <- path under it, text-2xs
|     (c)(x)  14 conversations  1m   |
| [x] acme/service-3                 |
|     ~/code/project-4               |
|     (c)  3 conversations  1d       |
| [ ] > Other folders      12 folders|
|------------------------------------|
| [ Add a project… ]                 |
| [ Skip import ]  [ Import 2 ... ]  |
+------------------------------------+
```

- Footer wraps to two rows below 480 px (`flex-wrap`, as the current actions row already does); each button 36 px, 44 px target with padding (DNA-D2, DNA-D4).

## Rule check

- Exists: `ImportStep` logic, `ImportCandidateList`, `Checkbox`, `Collapsible`, `Spinner`, `Empty`, `Button`, `openCommandPalette`.
- Additive: one footer button, one progress state, one empty composition. `Empty size="inline"` is the F-10-25 variant (new size on an existing primitive, not a new component).
- DNA: P2, P3, P7, V2, V5, V9, T8, X4, D4.
