# 02 Wizard: Computers step (conditional), web and desktop; 1280 and 390

The existing step 1 ("Connect your computers", `ConnectionStep`, `WelcomeWizard.tsx:293-460`) is kept as is for people who have more than one computer. It is no longer the mandatory first screen for a person with one local computer: that person starts on 03 (Agents) with a 2-chip stepper and reaches this step through "Add another computer". Audit: F-24-06, F-10-16 (copy-only interim), F-10-28 (names), F-10-10 (focus).

## When this step is in the flow

- Shown first when any of: more than one saved or discovered computer, `!localAvailable` (hosted or remote-only desktop), `/welcome#agents:` is absent and the user came from "Add another computer".
- Not shown first when exactly one direct computer is connected and `localAvailable`. The stepper then reads `1 Agents  2 Projects`; choosing "Add another computer" on 03 sets `step = "connection"` and the stepper becomes `1 Computers  2 Agents  3 Projects` with Computers current.
- No new state outside `WelcomeWizard`; `resolveOnboardingSetup` is unchanged.

## A. Desktop/web 1280x720 (dialog 768 px = `WizardPopup size="wide"`, `dialog-glass`, radius 18)

```
 +------------------------------------------------------------+
 | T3 Code                                                [x] |  <- T3Wordmark + "Code"  [EXISTS]
 | +--------------------------------------------------------+ |
 | | (1) Computers        ( 2 ) Agents        ( 3 ) Projects| |  <- WizardSteps, 3 chips [CHANGE: names]
 | +--------------------------------------------------------+ |
 |------------------------------------------------------------|
 | Connect your computers                                     |  <- h1 24/600 [EXISTS]
 | Choose the computers to set up. Agents and projects are    |  <- 14 muted; "we" allowed (DNA-V6)
 | set up on each.                                            |
 |                                                            |
 | +--------------------------------------------------------+ |
 | | [x] [monitor] MacBook Pro                    Connected | |  <- label+Checkbox row [EXISTS]
 | |               http://localhost:5733/                   | |
 | +--------------------------------------------------------+ |
 | | [x] [monitor] studio-mini                    Connected | |
 | |               https://100.64.0.12:5230/                | |
 | +--------------------------------------------------------+ |
 |                                                            |
 | +--------------------------------------------------------+ |
 | | [cloud] Sign in to T3 Connect                        > | |  <- ConnectAccountOption [EXISTS]
 | +--------------------------------------------------------+ |
 | | [link] Add a computer                                v | |  <- Collapsible trigger [EXISTS]
 | |  Pairing link                                          | |
 | |  [ https://your-server:5230/pair#token=…       ] [Pair]| |  <- PairingForm [EXISTS]
 | |  > Need a pairing link?                                | |
 | |    Run this on the computer with your code.            | |
 | |    [ npx t3 pair                                  copy]| |  <- CommandBlock [EXISTS]
 | +--------------------------------------------------------+ |
 |                                                            |
 | T3 Code collects anonymous usage data. Turn it off with    |  <- [CHANGE] copy, F-24-11
 | T3CODE_TELEMETRY_ENABLED=false. Details in the docs.       |
 |------------------------------------------------------------|  <- footer slot: border-t, bg-muted/72
 |                            [ Skip setup ]  [ Continue  -> ] |
 +------------------------------------------------------------+
```

- Footer, all steps: `[ Skip setup ]` is `Button variant="ghost-muted"` (verb, DNA-V2), always left of the primary, same position on every step; `[ Continue ]` carries `autoFocus` and `id="onboarding-continue"` (fixes F-10-10); Enter continues; Escape = Skip when no import is running (F-10-11). Footer is the existing `WizardFooter` slot moved out of the scroll area so it stays visible at 800x600 and 200% zoom (F-10-12).
- Chip names: "Computers / Agents / Projects" (F-10-28); the heading "Connect your computers" stays (it is a real multi-computer action).
- Disabled `Continue` while a selected computer is `connecting`; helper line unchanged ("Not connected, so setup skips {names}. You can set them up later from Settings.").
- "Client not supported" rows keep their existing `connection.error` line.

Reuses: `WizardPopup`, `WizardHeader`, `WizardSteps`, `WizardPanel`, `WizardFooter` (components/ui/wizard.tsx); `Checkbox`, `Collapsible*`, `Button`, `Input`, `Alert`, `CommandBlock`, lucide `MonitorIcon`, `LinkIcon`, `CloudIcon`, `ChevronRightIcon`, `ArrowRightIcon`.
DNA: P2 (no step for the common case), P8/P9 (remote stays reachable), SP2, S1, V1, V2, V6, K10, K14.

## B. Phone-width web 390x844 (dialog fills, `bottomStickOnMobile={false}` as today)

```
+------------------------------------+
| T3 Code                        [x] |
| (1) Computers  ( 2 )  ( 3 )        |  <- current label only below 640 px [CHANGE: wizard.tsx:119]
|------------------------------------|
| Connect your computers             |
| Choose the computers to set up.    |
|                                    |
| [x] [monitor] MacBook Pro          |
|     Connected                      |
|     http://localhost:5733/         |
|                                    |
| [cloud] Sign in to T3 Connect    > |
| [link]  Add a computer           v |
|                                    |
| T3 Code collects anonymous usage   |
| data. Turn it off with an          |
| environment variable (docs).       |
|                                    |
|------------------------------------|  <- sticky footer, border-t, bg-muted/72
| [ Skip setup ]      [ Continue -> ]|  <- 36 px buttons, DNA-D2 touch
+------------------------------------+
```

- Touch: rows `min-h-11` already via label padding; chips keep `after` 44 px target (DNA-D4).
- No hover-only affordance (DNA-X4).

## Rule check

Exists: every row and control. Additive: conditional entry, footer slot, chip label on narrow widths. Changes to `ui/wizard.tsx` are optional props (`footer`) and one class condition; the Add-provider wizard that shares `WizardPopup` keeps working (F-10-12 risk note).
