# 01 Gate and recovery (web, desktop; 1280 and 390)

Proposed flow, in order: 01 gate -> 02 computers (conditional) -> 03 agents -> 04 projects -> 05 first draft; 06 re-entry; 07 mobile first launch; 08 settings entries.
Rules for the whole set: additive only (no existing step, setting, keybinding removed), no new UI library or icon set (Lucide, `components/ui/*`), every surface below already exists unless tagged [NEW COMPOSITION] (a new arrangement of existing primitives) or [CHANGE] (an edit to an existing component). Legend: `[EXISTS]` shipped as drawn.
ASCII scale for every file in this folder: a desktop or web frame is at most 98 columns wide (about 13 px per column, so at most 1280 px); a mobile frame is 40 columns (about 9.75 pt per column, 390 pt). Text to the right of `<-` is annotation, not part of the frame. Tags: `[EXISTS]`, `[CHANGE]`, `[NEW COMPOSITION]`, `[R]` is a refresh icon button, `(o)` a spinner, `(v)` a completed step check, `(!)` an alert icon.
Source of truth for logic: `onboarding/firstRun.logic.ts` (unchanged). Audit refs: F-10-05, F-10-06, F-10-09 (area 10) are fixed here, not restated.

## A. Pending (first 4 s), 1280x720, light or dark

```
+--------------------------------------------------------------------------------------------+
| [drag strip 52 px: WorkspacePageHeader electron]  (Electron only; DNA-D3, DNA-P9)          |
|                                                                                            |
|                                                                                            |
|                                                                                            |
|                                       T3 Code                      <- T3Wordmark [EXISTS]  |
|                                                                                            |
|                                    (o) Connecting…                 <- Spinner size=md      |
|                                                                       tone=muted, shown    |
|                                                                       only after 1 s       |
|                                                                                            |
+--------------------------------------------------------------------------------------------+
```

- Before 1 s: the same shell with nothing in the centre (no flash for fast connects).
- Layout: `main flex h-dvh flex-col bg-background`; centre `flex flex-1 items-center justify-center`. One shared `FirstRunShell` for A and B. [CHANGE: FirstRunGate.tsx]
- Reuses: `T3Wordmark`, `Spinner` (visibility-aware, DNA-M6, DNA-I7), `WorkspacePageHeader`. Text is `text-sm text-muted-foreground` (DNA-C4, DNA-T2). "Connecting…" uses U+2026 (DNA-V9).
- Motion: none beyond the Spinner; the appearance after 1 s is an opacity step of 150 ms ease-out, none under reduced motion (DNA-M4, DNA-M5).
- Fixes F-10-09 (blank page up to 4 s), F-10-05 (no drag region).

## B. "Still connecting" recovery (after 4 s), 1280x720

```
+--------------------------------------------------------------------------------------------+
| [drag strip 52 px, Electron only]                                                          |
|                                                                                            |
|                                                                                            |
|                          +--------------------------------------+                          |
|                          |            Still connecting          |   <- EmptyTitle          |
|                          |  T3 Code has not heard from this     |   <- EmptyDescription    |
|                          |  workspace yet. Check that the       |                          |
|                          |  server is running, or open          |                          |
|                          |  Connections.                        |                          |
|                          |                                      |                          |
|                          |      [ Reload ]  [ Open Connections ]|   <- Button default,     |
|                          +--------------------------------------+      Button outline sm   |
|                                                                                            |
+--------------------------------------------------------------------------------------------+
```

- `Empty size="compact"` + `EmptyHeader`, `EmptyTitle`, `EmptyDescription`, `EmptyContent` ([EXISTS], `ui/empty.tsx`). No bordered card of its own: `Empty` already centres; do not restyle with className (DNA-P4).
- "Open Connections" is `Button variant="outline" size="sm" render={<Link to="/settings/connections" />}`. When stalled and the path is not `/`, the gate renders children instead (F-10-06 part 2), so Settings is reachable.
- "Could not read settings" keeps its card with `Reload` replaced by `Retry` and the F-07-13 reset action; same shell.
- Title and description are DNA-V3 (say what failed, then how to proceed), sentence case (DNA-V1).

## C. 390x844 (web at phone width)

```
+------------------------------------+
| [status bar / safe area]           |
|                                    |
|                                    |
|            T3 Code                 |
|        (o) Connecting…             |
|                                    |
|                                    |
+------------------------------------+
```

Recovery card at 390: same `Empty size="compact"`, buttons stack (`flex-col`), each `size="default"` (36 px, DNA-D2); no horizontal padding change (`p-6`).

## Rule check

- Exists already: gate logic, copy of both titles, `Empty`, `Spinner`, `T3Wordmark`.
- Additive: one shared shell, one delayed spinner, one extra button.
- DNA: P3, P7, P9, D3, M4-M6, V1, V3, V9, X4.
