# Area briefs (boundaries for the 24 audit agents)

Output file for area NN is `ui-overhaul/audit/NN-<slug>.md`; screenshots in `ui-overhaul/screens/NN-<slug>/`.
"Not yours" lists the neighbours so two agents do not report the same defect. If you see a defect outside
your boundary, add ONE line under "## Needs deeper look" naming the area, and move on.

## 01 app-shell

In: window chrome and titlebar (web and desktop renderer side), the main sidebar frame (header art, search row,
footer icons, collapse/expand, resize handle and min/max widths, persistence of width and collapsed state), top
breadcrumb header (WorkspaceBreadcrumb, WorkspacePageHeader), right panel frame (RightPanelTabs, RightPanelSheet,
rightPanelLayout.ts, rightPanelStore.ts), panel open/close persistence per thread, the floating right-panel card on
new-thread, project switcher / project grouping in the sidebar (sidebarProjectGrouping.ts), command palette shell
(CommandPalette*.tsx: layout, focus, result rows), AppSidebarLayout.tsx, AppRouteModal.tsx (Settings opens as a modal
over chat: judge that pattern), navigation back/forward, route transitions.
Not yours: thread rows and sections (02), thread content (03), composer (04), diff panel content (05), terminal
drawer content (06), settings page content (07/08), toasts (12), Electron-native menus/tray (14), mobile (15).
Code: apps/web/src/components/{AppSidebarLayout,Sidebar,SidebarStageBackdrop,LegacySidebar,RightPanelTabs,
RightPanelSheet,WorkspaceBreadcrumb,WorkspacePageHeader,WorkspacePageContainer,AppRouteModal,CommandPalette*,
T3Wordmark,ProjectMonogram,ProjectFavicon}.tsx, components/sidebar/*, components/ui/sidebar.tsx, sidebarState.ts,
rightPanelLayout.ts, rightPanelStore.ts, uiStateStore.ts, routes/_chat.tsx, routes/__root.tsx.

## 02 thread-list

In: thread rows (title, project label, status/time, hover actions, selection), sections (Pinned, active, Working
beta, Snoozed shelf, Settled shelf), grouping and ordering, search/filter row behaviour (Search, filter icon,
folder icon, new-thread icon), multi-select, drag and drop between sections, undo notice at the bottom, archive
view (settings/archived route), thread hover card, status indicators (ThreadStatusIndicators), relative time,
badges for PR/branch/worktree, unread/notification dots, long-title truncation, 100+/1000+ rows virtualisation.
Not yours: sidebar frame/header/footer (01), command palette (01), thread content (03), toasts (12).
Code: components/sidebar/*, components/{ThreadHoverCard,ThreadStatusIndicators,ThreadCommandSubtitle,
RelativeTime,ThreadSearchMatch,ThreadNotificationCoordinator,BackgroundThreadAnnouncer}.tsx,
threadSelectionStore.ts, sidebarPendingFileDropStore.ts, routes/_chat.settings.archived.tsx, closedViewStore.ts.
Live: the fixture expansion gives 100+ threads with long/unicode/RTL/whitespace titles and archived/settled/
pinned/snoozed states; exercise pin, settle, snooze, archive, undo, drag, multi-select, search.

## 03 thread-view

In: ChatView and everything inside the message column: user and assistant message rendering, ChatMarkdown (code
blocks, tables, links, images, math, GitHub alerts, nested lists, incremental markdown while streaming),
tool-call rendering and grouping ("Worked for 17s" collapsed groups, CommandBlock, file edit cards, diff
summaries with "Open diff"), permission/approval prompts inline, questions, plans (proposedPlan), citations,
streaming cursor/indicator, long outputs and truncation, collapse/expand, scroll behaviour and "jump to latest"
(auto-pin fights; see issues #20366 cluster), message actions (copy, cite, edit from here), thread header pill
("Agent … ▾"), empty thread state in an existing thread, find in thread, context handoff/compaction notices,
virtualisation of long transcripts.
Not yours: composer (04), diff panel (05), sidebar (01/02), toasts (12), skeletons on load (13).
Code: components/{ChatView,ChatMarkdown,CommandBlock,ThreadRouteView,RenderErrorBoundary}.tsx, components/chat/*
(292 files: message, tool, turn, plan, approval, citation components), markdown-_.ts, proposedPlan.ts,
pendingUserInput.ts, threadSync.ts, packages/client-runtime/src/state/threadHistory_.ts.
Live: use the three seed threads, "Huge output stress test" (1 MB message, 5,000-line code block, unterminated
fence) and "Long conversation stress test"; send at most 3 tiny turns to observe streaming and a tool call.

## 04 composer

In: ChatComposer and ComposerPromptEditor (Tiptap): input, placeholder, multiline, send/interrupt/queue/steer
button states, attachments shelf and chips, paste of images/files/large text, slash commands, `$` skills, `@`
mentions (files, folders, threads), `#` PR picker, model/provider picker (incl. provider list, shift-click multi-
model), effort picker, permission mode switch, host/workspace/branch toolbar controls below the composer
(BranchToolbar*), composer banners (ComposerBanner, ComposerBannerStack, ComposerActivityStatus), queued message
rows, prompt stash, drafts persistence, context meter, goal row, keyboard behaviour inside the editor.
Not yours: keybinding settings page (08), model catalog correctness (09), toasts (12), thread content (03).
Code: components/chat/ChatComposer*.tsx, ComposerPromptEditor*.tsx, components/chat/Composer*.tsx,
components/chat/ModelPicker*.tsx (or wherever the picker lives), BranchToolbar*.tsx, ContextChip.tsx,
composer-*.ts, composerDraftStore.ts, composerPlaceholder.ts, promptStashStore.ts, modelSelection.ts,
modelPickerVisibility.ts, docs/internals/composer-editors.md, docs/internals/composer-context-references.md.

## 05 diff-and-review

In: Diff panel (DiffPanel, DiffPanelShell, components/diffs/_), file tree, inline vs side-by-side (does it
exist?), word wrap, whitespace, large diffs (5k lines, 200 files), binary and renamed files, find in diff,
viewed-file state, review comments → composer, file preview (components/files/_), the Changes/Commit/branch
rows in the right-panel card, GitActionsControl, commit flow, PR creation flow (title/body/draft/stacked/amend
if present), pullRequest/* (100 files: PR page, PR list route, review guide, checks), source-control
presentation (sourceControlPresentation.tsx), pierre diff theming (pierre-tree-theme.ts, pierre-icons.ts).
Not yours: right panel frame/tabs (01), toasts (12), terminal (06).
Code: components/{DiffPanel,DiffPanelShell,DiffFilePathCopyButton,GitActionsControl,BranchPicker,
WorktreeBaseBranchPicker,PullRequestThreadDialog,PullRequestContextDetails}.tsx, components/diffs/_,
components/files/_, components/pullRequest/*, diffPanelStore.ts, diffFileActions.ts, reviewCommentContext.ts,
routes/_chat.pull-requests.tsx, docs/user/source-control.md, docs/internals/pull-request-file-revisions.md.
Live: the Codex seed thread has +20/-0 uncommitted changes; create a larger diff by running one agent turn in
sample-app that touches many files ("create 30 small files under fixtures/") or by shell edits in
/tmp/t3code-sample-repo (allowed: it is the fixture repo). There is no GitHub remote: capture the no-remote PR
state honestly.

## 06 terminal-and-panels

In: embedded terminal (ThreadTerminalDrawer, PersistentThreadTerminals, components/terminal/_, apps/web/src/
terminal/_), terminal tabs, split, focus handling and the keyboard-focus rules in docs/user/keyboard-focus.md,
drawer resize and persistence (terminalUiStateStore), terminal links, right-panel tab system as a tab strip
(panel-tab-close-button), Browser/preview panel (components/preview/_, previewStateStore, mini player), Device
panel (components/device/_) at the UI level, Agents panel, Files panel chrome. Judge consistency among all
panel tabs (header rows, close buttons, empty states, resize).
Not yours: panel frame layout math (01), diff content (05), toasts (12).
Code: as listed plus rightPanelStore.ts (read only for tab model), docs/user/terminal.md, docs/internals/
terminal-runtime.md.

## 07 settings-appearance

In: everything in docs/user/appearance.md and the Settings shell itself: Settings modal frame, left nav, search
row, "Applying settings for … on …" crumb, Appearance page (theme grid/previews, light/dark/system, per-half
theme selection, Create theme editor and its color picker, import VS Code/T3 theme, export, OpenVSX theme
search (ThemeSearchSection), environment themes, Composer context toggle, Render math, Panel animations slider,
fonts/contrast settings if present (appearanceFonts.ts, appearanceContrast.ts)), Beta page, Diagnostics page,
Open-source licenses page, the theme items in the command palette, live system theme switching.
Not yours: General/Projects/Keybindings/Source Control/Storage/Scheduled tasks pages (08), Providers (09),
Connections (11), Archive (02).
Code: components/settings/* (appearance, theme editor, settings shell, search), routes/_chat.settings*.tsx,
themePalette.ts, themeBoot*, vscodeThemeImport.ts, openVsxThemes.ts, appearanceFonts.ts, appearanceContrast.ts,
CommandPaletteThemeItems.tsx.

## 08 settings-project-and-keybindings

In: Settings → General (new-thread defaults, permissions default, send shortcut, follow-up behaviour,
confirmations, text generation, submodules, skills in slash menu, auto-settle rules, diagnostics export),
Projects page and the Project category (name, icon picker incl. monogram/emoji/image, actions/scripts editor
projectScriptEditor.tsx, checkouts, removal), Source Control page, Storage page, Scheduled tasks page, Snap-shot
page, Integrations page, environment/project targeting UX ("Mixed", layers icon, override chain, Reset),
Keybindings page (list, search, edit/record a shortcut, conflict detection, platform modifier display,
KeybindingsConfigWarning), the keybinding command-ID list vs docs.
Not yours: Appearance/Beta/Diagnostics/Licences (07), Providers (09), Connections (11), shortcut
discoverability outside Settings (21).
Code: components/settings/* (general, projects, keybindings, source control, storage, scheduled tasks,
integrations, snap-shot), projectScriptEditor.tsx, projectIconOptions.ts, projectIconColors.ts, keybindings.ts,
packages/contracts/src/settings.ts, docs/user/project-settings.md, keybindings.md.

## 09 providers-and-auth

In: Settings → Providers for every provider the UI knows (Codex, Claude, Cursor, Grok, OpenCode, Antigravity,
ACP registry agents, Muse, Pi, custom instances): installed/not installed/logged out/authenticated/update
available states, Install/Login/Update actions and the setup terminal, multi-account (shadow home), custom
models editor, provider enable switch and per-project switch, "Checked 12m ago"/Update all header, provider
icons, model picker states when a provider is missing (coordinate: picker UI itself is 04; you own the provider-
state content shown there), the misleading `Provider instance "x" is disabled for project` error, "nothing
installed" state, auth expiry mid-session (code-read), usage page (routes/_chat.usage.tsx, components/usage/*)
and provider usage limits (providerUsageLimits.ts), "Limited" thread state copy.
Not yours: T3 Connect sign-in and pairing (11), composer picker layout (04), toasts (12).
Code: components/settings/Provider*.tsx, providerInstances.ts, providerModels.ts, providerAuthDelivery.ts,
providerSkillSearch.ts, ProviderUpdatesAction.tsx, components/usage/*, packages/contracts/src/provider*.ts,
docs/user/providers-*.md, docs/user/usage.md, docs/internals/providers.md.
Live: cursor-agent/opencode/grok/antigravity/pi/muse are NOT installed on this host: capture those real states.

## 10 first-run-and-empty-states

In: FirstRunGate and WelcomeWizard (web/desktop) as implemented today (/welcome), every empty state: zero
projects (NoProjectsHero), zero threads (NoActiveThreadState), new thread empty message column ("Send a message
to start the conversation."), empty diff/changes, empty terminal, empty PR list, empty usage, empty archive,
empty search results, empty command palette results, HostedEmptyState (app.t3.codes with no computer), zero
providers, zero git (thread without project, non-git folder), first PR, first remote pairing landing, the
components/ui/empty.tsx primitive and whether empty states use it consistently.
Not yours: the onboarding _gap_ and redesign (24: you document what exists and how it feels; 24 designs what is
missing), pairing UX internals (11), skeleton/loading states (13).
Code: components/onboarding/_, onboarding/_, components/{NoProjectsHero,NoActiveThreadState,HostedEmptyState,
AddProjectToMachineDialog,CommandPaletteAddProject}.tsx, components/ui/empty.tsx, routes/welcome.tsx,
docs/user/welcome-wizard.md.
Live: /welcome re-runs setup. Zero-project and zero-thread states: do NOT remove projects or threads (other
agents share this server); read FirstRunGate/NoProjectsHero/NoActiveThreadState code, screenshot /welcome, and
use the sidebar filter/search with a nonsense query for empty-result states. You may add a throwaway empty
project at /tmp/t3code-empty-project (mkdir, no git) via `project add` to see the zero-thread and no-git states.

## 11 remote-access-and-pairing

In: /pair, /connect, /connect-agent, /guest routes, pairing landing and error states (consumed token, expired,
wrong origin), Settings → Connections (connected clients list, T3 Connect sign-in state, relay status, guest
links, hold webhooks), ConnectionStatusDot and connection banners, relay disconnected/reconnecting/reconnected
UX, server restarted under the client (you MAY NOT restart the server; code-read + issue reports), version
mismatch banner (versionSkew.ts, ServerUpdateAction), multi-environment switching (environments/_), hosted
pairing (hostedPairing.ts), cloud/_ and clerk/* UI, guestPage.ts, QR code component.
Not yours: provider auth (09), toasts framework (12), desktop updater (14).
Code: routes/{pair,connect,connect-agent,guest}.tsx, components/{auth,clerk,cloud,guest}/_, connection/_,
environments/_, components/ConnectionStatusDot.tsx, hostedPairing.ts, pairingUrl.ts, versionSkew.ts,
ServerUpdateAction.tsx, components/settings/Connections_.tsx, docs/user/remote-access.md, guest-links.md,
t3-connect-troubleshooting.md, updating.md, docs/internals/connection-runtime.md, environment-auth.md.
Live: you may mint pairing tokens with `node apps/server/src/bin.ts pair --base-dir /tmp/t3code-overhaul` and
open them in a FRESH Playwright context (no storageState) to see the pairing flow, consumed-token and expired
states (use --ttl 1m and wait). Never print tokens into your output file.

## 12 notifications-errors-toasts

In: the toast system (components/ui/toast.tsx, toast.logic.ts, toastHelpers.ts, anchoredCopyToast.ts), every
toast coordinator (SlowRpcRequestToastCoordinator, HostFreezeToastCoordinator, ProjectCloneToastCoordinator,
LegacyThreadMigrationToast, desktopUpdate.toast.tsx, ThreadNotificationCoordinator), banners and notices
(PermissionUpdateNotice, KeybindingsConfigWarning, composer banners as a notice system), dialogs (dialog.tsx,
alert-dialog.tsx, confirmDialog.ts, ConfirmDialogHost), error strings and RenderErrorBoundary, stacking, timing,
dismissal, undo toasts, the thread notification sounds/badges (threadNotifications.ts), in-app notification
preferences on web/desktop (undocumented per DOCS-DIGEST), OS notifications from web/desktop.
Not yours: copy tone in general (20: you own the error/toast strings specifically; 20 owns the rest), mobile
notifications (15).
Code: as listed, plus grep for `toast(`, `toastManager`, `showToast` across apps/web/src to inventory every call
site with its message and duration. Produce the full inventory table.

## 13 loading-and-skeletons

In: every async boundary and what it shows while waiting: app boot (bootstrap.ts, themeBoot flash), route
transitions and lazy chunks, thread list load, thread history paging (scroll-up load), diff loading (worker
pool), file preview load, PR page load, settings pages load, provider check ("Checked 12m ago"), usage page,
command palette search latency, skeleton.tsx and spinner.tsx usage, "Still connecting", reconnect spinners,
image attachment upload progress, lying spinners (AGENTS.md: "a lying spinner"), layout shift when content
arrives, time-to-first-paint of the shell. Measure with Playwright (performance.now marks, screenshots at 100 ms
intervals during a cold load with cache disabled).
Not yours: steady-state performance/jank (22), empty states after load (10).
Code: components/ui/{skeleton,spinner}.tsx and all importers, bootstrap.ts, routes/__root.tsx, routes/_chat.tsx,
RenderErrorBoundary.tsx, connection/*, packages/client-runtime/src/state/*.

## 14 desktop-specific

In: Electron shell as the user sees it: window frame, traffic lights/titlebar inset, DesktopApplicationMenu
(every menu item vs web command palette), tray (if any), updater banner/toast and release notes UI
(desktopUpdate.toast.tsx, updates/_), QuitHoldOverlay, native dialogs (file pickers, confirmations), deep links
and protocol handler UX, multi-window, window state persistence, mac/win/linux differences (code-read for win/
linux: DesktopLinuxUrlHandler, WSL paths, Windows foreground), desktop-only settings, keyboard shortcuts
reserved by desktop (mod+w), snapshots feature chrome (snapShot/_), permissions prompts on macOS
(mac-permission-preload), the renderer's isDesktop branches in apps/web.
Not yours: generic web UI (others), server updater internals.
Code: apps/desktop/src/{window,app,updates,shell,settings,preview,snapShot,permissions}, apps/web/src/
components/desktop/*, desktopAppActivation.ts, components/QuitHoldOverlay.tsx, docs/user/updating.md,
install.md, snap-shot.md, default-browser.md.
Live: an Electron dev instance is running (home /tmp/t3code-overhaul-desktop, backend 127.0.0.1:13774). It has
no fixture data; add the sample project with `node apps/server/src/bin.ts project add /tmp/t3code-sample-repo
--base-dir /tmp/t3code-overhaul-desktop --port 13774` if the CLI can reach it, else use the UI. Capture the
window with macOS `screencapture` (find the window id with a small Swift/JXA CGWindowList query, or capture the
full screen and crop). If you must relaunch, do it with `vp run dev:desktop --home-dir
/tmp/t3code-overhaul-desktop --no-seed` and track the PID; kill only PIDs you captured. The production
"T3 Code (Nightly).app" on this Mac is the developer's live instance: never touch it.

## 15 mobile

In: apps/mobile end to end: navigation (Stack.tsx, features/_), thread list/home, thread view, composer and
keyboard handling, attachments, settings screens, appearance/themes (uniwind, Material You), connection and
pairing screens, notifications settings, offline queueing, resume after background, iPad keyboard shortcuts,
accessibility (VoiceOver labels, Dynamic Type), Android-specific code paths (code-read only: no Android tooling).
Not yours: web/desktop.
Live: an iOS dev client build was started on this host (`node scripts/mobile-native-client.ts ensure ios
2E08CEC5-A3DE-4AF0-8996-6F35B90539C7`, log /tmp/t3code-mobile-build.log, simulator "iPhone 17" booted). If it
finished: start Metro with `vp run dev:client` from apps/mobile (track PID), open the dev client, pair to the
running backend http://127.0.0.1:13773 using `.agents/skills/test-t3-mobile/scripts/pair-client.sh` or a token
from `node apps/server/src/bin.ts pair --base-dir /tmp/t3code-overhaul`, and capture with `xcrun simctl io
<udid> screenshot <png>`. If the build did not finish, say so under Incomplete and audit by code with the
screenshot tooling in scripts/mobile-showcase.ts and docs/operations/mobile-app-store-screenshots.md as hints.
Code: apps/mobile/src/\*\*, docs/internals/mobile-navigation.md, mobile-development.md, docs/user/
mobile-notifications.md, apps/mobile/generated-uniwind-_.json, global.css.

## 16 accessibility

In: focus order and visible focus rings on every interactive control (buttons, menu items, thread rows, tabs,
resize handles, chips), contrast (compute WCAG ratios for text, muted text, placeholders, status colours, diff
colours, selection, in default light and dark and at least two other themes), labels and roles (aria-label on
icon buttons, roles on custom listboxes/menus/tabs, live regions for streaming and toasts), reduced motion,
keyboard-only completion of the top 10 tasks (new thread, send, switch thread, open settings, change theme,
open diff, approve a permission, open command palette and run a command, pin/settle a thread, open terminal),
screen-reader sanity via the accessibility tree (Playwright `page.accessibility.snapshot()` or
`locator.ariaSnapshot()`), skip links, heading structure, zoom 200% reflow, high contrast (forced-colors) and
the appearanceContrast.ts setting if it exists.
Not yours: typography scale (17), motion design (19), copy wording (20).
Tools: run axe-core via Playwright (install `@axe-core/playwright` into /tmp/t3code-pw only, never in the repo)
on /, a thread, /settings/appearance, /settings/keybindings, the command palette open, the diff panel open.
Report violations by rule with element counts.

## 17 typography-and-hierarchy

In: every text style in use vs the DNA scale: sizes, weights, line-heights, letter-spacing, heading levels per
view (h1/h2/h3 actual elements), label casing (sentence vs title), truncation strategies (middle-truncate,
StartTruncatedPath, line clamps), numerals (tabular-nums for times/counts), mono usage (paths, branches,
shortcuts, counts), link styling, muted/secondary text levels (how many greys), breadcrumb and header hierarchy,
settings row title/description hierarchy, thread row hierarchy, message body vs tool-call text sizes, code
block font size vs body.
Not yours: spacing/shape (18), contrast ratios (16: cite theirs), copy wording (20).
Method: grep counts of text-_/font-_/leading-_/tracking-_ per component dir; measure computed styles with
Playwright `getComputedStyle` on 30 representative elements and tabulate font-size/weight/line-height/family.

## 18 shape-spacing-elevation

In: radius values per component vs DNA, border weights and colours, shadows/elevation (which surfaces float and
how), dividers, spacing deviations from the de facto scale (gap/padding per row type), alignment and optical
corrections (icon-to-text alignment, baseline alignment of mixed sizes, pixel-snapping of 1px borders at
non-integer DPR), button/input heights per size variant (measure), hit targets < 24 px, the right-panel card
geometry, popover/menu/dialog geometry, sidebar row geometry, composer geometry, consistency across
components/ui variants.
Not yours: type (17), colour (16/07), motion (19).
Method: measure boundingBox and computed radius/padding/border on 40 representative elements with Playwright;
produce a table (component | measured | DNA value | delta).

## 19 motion

In: every transition today (panel open/close with the Panel animations slider at 0 and at 200 ms, sidebar
collapse, route change, toast enter/exit, dialog/popover/menu enter/exit, thread row reorder/section change,
streaming indicator, spinner, hover/active state transitions, MorphIcon, AnimatedHeight/AnimatedWidth,
accordion/collapsible), what is missing, what is over-animated or continuously repainting (AGENTS.md ban), GPU
cost (Playwright tracing or `chrome://tracing`-style measurement of paint counts while idle in a thread), and
prefers-reduced-motion coverage. Record a short Playwright video of panel open/close at 0 and 200 ms.
Not yours: skeleton/loading (13), performance beyond paint cost of animations (22).
Code: panelAnimations.ts, AnimatedHeight.tsx, AnimatedWidth.tsx, MorphIcon.tsx, index.css @keyframes and
transition rules, components/ui/{dialog,popover,menu,sheet,collapsible,toast}.tsx, sidebar drag code.

## 20 copy-and-voice

In: every user-facing string vs DNA voice: buttons, menu items, placeholders, empty states, settings titles and
descriptions, dialogs, tooltips, status labels, time formats, pluralisation, capitalisation consistency, jargon
without explanation, errors that blame the user, inconsistent verbs for the same action across surfaces
(Settle/Un-settle/Wake/Archive/Snooze naming is documented product vocabulary: do not rename those), placeholder
text ("Ask anything, @tag files/folders, $use skills, or / for commands" vs "Ask for changes, send follow-ups,
or attach images"), sentence vs title case per component type, product vocabulary consistency with
DOCS-DIGEST "Product vocabulary".
Not yours: error/toast inventory mechanics (12: coordinate by citing F-12 ids for the same strings; you judge
wording, 12 judges behaviour), mobile strings (15), docs text.
Method: grep JSX string literals and `title=`/`aria-label=`/`placeholder=`/`description=` props across apps/web/
src/components (exclude tests), sample at least 300 strings, classify, and produce the before/after table of
every string you would change (this feeds spec section 10 directly).

## 21 keyboard-shortcuts-ux

In: discoverability of shortcuts (tooltips with kbd hints, menu items with shortcuts, the kbd.tsx component
usage, command palette hints), a cheat sheet (does one exist? `?` key?), conflicts between defaults, platform
modifier rendering (⌘ vs Ctrl, Option vs Alt), browser-reserved shortcuts handling (mod+w, mod+1..9 isDesktop
condition), terminal focus exceptions, the shortcutModifierState hover behaviour, shortcuts that silently fail
in some views (issues cluster), chat.find, navigation back/forward, Escape behaviour consistency (what closes
what), Tab order around the composer, the model picker keyboard navigation rules from keybindings.md.
Not yours: the Keybindings settings page UI (08), focus rings (16).
Code: keybindings.ts, components/ui/kbd.tsx and importers, shortcutModifierState.ts, commandPaletteBus.ts,
hooks/useKeybinding* (grep), ReopenClosedViewShortcut.tsx, UsageToggleShortcut, docs/user/keybindings.md.

## 22 performance-feel

In: measure, do not guess: input latency in the composer (type 200 chars, measure keypress→paint with
Playwright CDP tracing or `performance.measure` around input events), thread list scroll FPS with 100+ threads,
thread view with the 1 MB message and the 60-pair conversation (scroll jank, time to render), diff view with a
large diff, re-render storms (React profiler via `window.__REACT_DEVTOOLS_GLOBAL_HOOK__` is unavailable; use
CDP Performance.getMetrics and tracing to count style recalcs/layouts/paints during streaming), layout shift
(CLS via PerformanceObserver on load and on message arrival), memory growth after switching 30 threads, idle
CPU/paint when a thread is open (continuously repainting animations), bundle/chunk load sizes on first route,
virtualisation gaps (does the thread list/message list virtualise?), docs/internals/performance-regressions.md.
Not yours: loading UI (13), motion design (19).
Output: numbers in tables with the method for each; findings only where numbers show a problem.

## 23 customisation-gap

In: what users can change today (from DOCS-DIGEST "Customisation that already exists" PLUS the settings code:
packages/contracts/src/settings.ts client and server schemas, uiStateStore, editorPreferences, every persisted
key MAP.md lists) vs what a premium tool offers; produce the gap list with "exists already" explicitly marked and
evaluate each candidate against DNA: accent colour, UI font + code font + sizes, density (compact/comfortable),
sidebar and panel width persistence, diff defaults (inline/side-by-side, word wrap, whitespace), composer send
key (exists), notification preferences (web/desktop), per-project colour tag, theme import/export (exists),
keybinding editor (exists), reduced-motion override, terminal font/size, timestamp format, start-up view,
confirm-before-settle, sidebar density, show/hide sections. For each candidate: exists? / fits DNA? / proposed
setting name, type, default, Settings page and row position, persistence key (client or server), components that
read it, mobile behaviour, effort. Reject what does not fit DNA and say why. This feeds spec section 7 directly.
Not yours: implementing any of it; appearance page UI defects (07).

## 24 onboarding-gap

In: what a first-run flow would need to teach, in what order, given how the app actually works (read 10's
output file if it exists by the time you finish; otherwise audit WelcomeWizard yourself): provider detection
with LIVE auth status (what the wizard checks today vs what the Providers page knows), project folder pick and
import, permission modes explained in plain words, optional remote pairing, a 30-second keyboard tour, skip-
everything path, re-entry from Settings, empty-state coaching after the wizard (first thread, first diff, first
PR), what changes for returning users after an update (release notes, new-feature callouts), mobile variant
(first launch on mobile: connect to a computer), zero-friction for power users. Deliver screen-by-screen ASCII
wireframes into ui-overhaul/spec/onboarding/ (one file per screen, named 01-…md) in addition to your audit file;
this is the ONE area allowed a second output location.
Not yours: documenting current empty states (10), pairing internals (11).
Code: components/onboarding/_, onboarding/_, routes/welcome.tsx, apps/mobile/src/features/connection,
docs/user/welcome-wizard.md, install.md, remote-access.md.
