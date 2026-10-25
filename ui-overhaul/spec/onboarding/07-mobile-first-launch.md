# 07 Mobile first launch (native iOS and Android, 390 wide)

The phone never runs a wizard: it is a remote for a computer that already runs T3 Code (`AGENTS.md`: mobile "allows for connecting to any T3 Code server"). A first launch is therefore: install, learn what to do on the computer, connect, see projects, send. Today the first screen is a title and one button; the T3 Connect sheet says "No additional linked cloud environments." Audit: F-24-01, F-24-02, F-24-12; area 15 (F-15-06 error text under the keyboard, F-15-12) and area 11 own the pairing mechanics.
Existing captures: `[M]home-no-environments-light-iphone17.png`, `[M]connections-new-light-iphone17.png`, `[M]add-env-address-focused-light-iphone17.png`, `[M]add-env-bad-code-submitted-light-iphone17.png`. (`[M]connect-onboarding-light-iphone17.png` shows the thread list, not the sheet: the capture missed it; the sheet is read from `ConnectOnboardingRouteScreen.tsx`.)
Scale: 390 pt wide, drawn at 40 columns. Components named are `apps/mobile/src/components/ui/*`.

## A. Home, no computer connected (first launch)

```
+--------------------------------------+
| 14:11                       wifi  bat |
| T3 Code  DEV                    (Q)   |
|--------------------------------------|
|                                      |
|                                      |
|        No computer connected         |  <- EmptyState variant="plain" title (was
|                                      |     "No environments connected")
|   Your agents run on a computer.     |  <- detail, text-foreground-muted
|   Connect this phone to T3 Code      |
|   running there.                     |
|                                      |
|     [ + Connect a computer ]         |  <- FloatingActionButton extended, tone=primary
|                                      |     (EXISTS, label changes)
|  1  Open T3 Code on your computer,   |  <- ListSection + 3 ListRowLayout (not pressable)
|     or run npx t3 there.             |
|  2  Create a pairing link in         |
|     Settings, Connections, or run    |
|     npx t3 pair.                     |
|  3  Scan its code here.              |
|                                      |
| ( chat )( PR )( usage )( gear ) ( + )|  <- existing nav pill and compose button
+--------------------------------------+
```

- Same three steps and same verbs as `HostedEmptyState` (web) and the wizard's "Need a pairing link?" block, so one idea has one voice (F-24-12). Onboarding vocabulary is "computer" (DNA-V7); Settings keeps "environment" (the docs path is "Settings, Environments").
- Numbered rows: the number is the row's leading `Text` (`font-t3-bold`, `text-foreground-muted`); no new icon set. `npx t3` and `npx t3 pair` are inline mono (`font-mono`, `global.css` maps it to the platform monospace, DNA-T7).
- Android: same layout; `FloatingActionButton.android.tsx`, `ListSection` are the platform variants already in use. Dynamic type: rows wrap (no truncation); `[M]home-dyntype-ax5-light-iphone17.png` is the stress reference.
- No loading flash: `deriveEmptyState` already returns the "Loading environments" state first (`HomeScreen.tsx:146-156`).

## B. "Add environment" sheet (formSheet, existing)

```
+--------------------------------------+
|             --- grabber ---          |
|  Add environment                 (v) |  <- SettingsScreen formSheet, check action
|                                      |
|  +--------------------------------+  |
|  |        +----------+            |  |
|  |        | [qr]     |            |  |  <- PairingScanCard [EXISTS]
|  |        | Tap to   |            |  |
|  |        | scan     |            |  |
|  |        +----------+            |  |
|  |  On your computer: Settings,   |  |  <- caption [CHANGE] (was: "Scan the code from
|  |  Connections, or npx t3 pair   |  |     t3 pair or desktop Connections settings")
|  +--------------------------------+  |
|  Or enter it                         |
|  +--------------------------------+  |
|  | Address   192.168.1.100:3773   |  |  <- PairingInputRow [EXISTS]
|  |--------------------------------|  |
|  | Code      Pairing code         |  |
|  +--------------------------------+  |
|  For computers on your local         |  <- helper [CHANGE] reads: "Both devices must be
|  network or tailnet. The computer    |     on the same network or tailnet. The computer
|  keeps its own provider sign-ins."   |     keeps its own agent sign-ins."
|                                      |
|  Or use the managed relay            |
|  +--------------------------------+  |
|  | Sign in to T3 Connect        > |  |  <- ListRow [EXISTS]
|  | Reach your computers from      |  |
|  | anywhere, no network setup.    |  |
|  +--------------------------------+  |
+--------------------------------------+
```

- Only the two captions change; every control, the camera permission dialog and the error behaviour are untouched. Error text placement under the keyboard is F-15-06.
- The sheet title stays "Add environment" (the technical term used in Settings and docs); first-run entry says "Connect a computer". Both open the same route.

## C. T3 Connect sheet after sign-in, no computer linked yet

```
+--------------------------------------+
|             --- grabber ---          |
|  Set up T3 Connect               (x) |  <- SheetHeader [EXISTS]
|                                      |
|  +--------------------------------+  |
|  |  (o) Waiting for your          |  |  <- AppActivityIndicator row, only while
|  |      computer…                 |  |     relayDiscovery.isRefreshing (real state, DNA-P3)
|  +--------------------------------+  |
|  1  On your computer run             |  <- same 3-row ListSection as A, step 1 differs:
|     npx t3 connect                   |
|  2  Keep T3 Code running there.      |
|  3  It appears here. Tap to connect. |
|                                      |
|        [ Don't show this again ]     |  <- text Button [EXISTS]
+--------------------------------------+
```

- Replaces `No additional linked cloud environments.` (`CloudEnvironmentRows.tsx:143-149`, an empty state with no instruction). The web counterpart (`HostedEmptyState.tsx:75-122`) already has steps and "Waiting for your computer…"; the phone gets the same. "Don't show this again" uses a straight apostrophe in code today; keep as is (DNA-V4 forbids contractions in titles, not buttons; copy pass is area 20's).
- Pull to refresh (iOS `RefreshControl`) and the Android refresh `IconButton` stay.

## D. Connected, no projects (F-24-02)

```
+--------------------------------------+
| T3 Code  DEV                    (Q)   |
|--------------------------------------|
|                                      |
|          No projects yet             |  <- EmptyState plain (was "No projects found")
|                                      |
|   MacBook Pro has no projects.       |  <- detail names the computer (DNA-P3 true state)
|   Add one to start a thread.         |
|                                      |
|        [ + Add project ]             |  <- Button tone=primary -> AddProject route
|                                      |     (Stack.tsx:762 "new/add-project", EXISTS)
| ( chat )( PR )( usage )( gear ) ( + )|
+--------------------------------------+
```

- Today the action renders only when `!catalogState.hasReadyEnvironment` (`HomeScreen.tsx:701-702`), so a connected computer with zero projects shows text and no way forward.
- Connected with projects but no threads keeps "No threads yet" and the existing compose FAB; add `actionLabel="New task"` bound to `onStartNewTask` (the prop already exists, `HomeScreen.tsx:111`).

## E. First message

- New task (`NewTaskRouteScreen`) is unchanged: project, model chip, composer, 16 px text. A missing agent on the host surfaces as a thread banner with the copy from 06 section F (no terminal on the phone: "Sign in on that computer, then try again.").
- Notifications permission and microphone prompts stay at their moment of use; nothing is requested at first launch.

## Rule check

- Exists: `EmptyState`, `FloatingActionButton`, `ListSection`, `ListRowLayout`, `ListRow`, `SettingsScreen`, `SheetHeader`, `AppActivityIndicator`, `Button`, the `AddProject` route, the pairing and T3 Connect flows.
- Additive: copy, one list per empty state, one action. No server, auth, pairing or relay change (non-negotiable 4).
- DNA: P3, P7, P8, P9, T3, T7, V3, V5, V6, V7, X2, X3, D4. Web is not affected (non-negotiable 8).
