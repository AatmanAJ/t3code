# T3 Code open-issue sweep for UI/UX audit (prior art)

Snapshot: 2026-10-25. Repo: `pingdotgg/t3code`. Open issues only (PRs excluded; GraphQL `issues(states:OPEN).totalCount` = 1068).

## Summary

- Total open issues: **1068**
- UI-relevant (title keyword list or UI-shaped label): **408** (38%)
- UI-relevant issues by area (count): 01 app-shell 7, 03 thread-view 23, 04 composer 29, 05 diff-and-review 24, 06 terminal-and-panels 29, 07 settings-appearance 2, 08 settings-project-and-keybindings 6, 09 providers-and-auth 19, 10 first-run-and-empty-states 8, 11 remote-access-and-pairing 2, 12 notifications-errors-toasts 13, 13 loading-and-skeletons 3, 14 desktop-specific 98, 15 mobile 105, 16 accessibility 8, 18 shape-spacing-elevation 2, 19 motion 1, 20 copy-and-voice 2, 21 keyboard-shortcuts-ux 8, 22 performance-feel 15, 23 customisation-gap 1, 24 onboarding-gap 3
- Method: `gh issue list` caps at 1000 per call, so the list was fetched in two created-date windows (`created:>=2026-08-24`: 998; `created:<2026-08-24`: 70) and merged by number to 1068. Reactions = sum of `reactionGroups[].users.totalCount`. Comments = length of `comments`. Age = days since `createdAt` to 2026-10-25.
- UI-shaped labels used: `performance`, `📱 Native Change`, `🚀 Mobile Continuous Deployment`, `preview:web`, `preview:mac`. `bug` and `enhancement` are generic, so they do not make an issue UI-relevant on their own; title keywords decide.
- Keyword matching is broad by design (it includes `render`, `slow`, `desktop`, `mobile`, `panel`, `discover`, and `lag`). Many flagged items are functional bugs, especially areas 14 and 15. Read each one before treating it as UX evidence.

### Label table (labels on open issues)

| label              | open issues | UI-shaped?                          |
| ------------------ | ----------: | ----------------------------------- |
| `bug`              |         453 | No (generic; title keyword decides) |
| `via-triage`       |         387 | No                                  |
| `accepted`         |         128 | No                                  |
| `needs-triage`     |         114 | No                                  |
| `needs more info`  |          37 | No                                  |
| `enhancement`      |          11 | No (generic; title keyword decides) |
| `needs-julius`     |          11 | No                                  |
| `upstream`         |           4 | No                                  |
| `codex`            |           2 | No                                  |
| `documentation`    |           2 | No                                  |
| `security`         |           2 | No                                  |
| `good first issue` |           1 | No                                  |
| `triage:keep-open` |           1 | No                                  |

51 of the 64 repo labels have no open issues and are omitted.

## Table A: top 50 open issues by total reactions (any topic)

| #      | title                                                                                                                                                       | reactions | comments | labels                          | UI-relevant? | area                                |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ------------------------------- | ------------ | ----------------------------------- |
| #15644 | Manage Cursor, Codex, and Claude cloud sessions from inside T3                                                                                              |        29 |        8 | -                               | No           | -                                   |
| #4123  | Why promise no opt-out telemetry while telemetry has been on the whole time? Without even a button to turn it off.                                          |        20 |        7 | -                               | No           | -                                   |
| #11458 | [Bug]: OpenCode Auto mode ignores user opencode permission patterns and asks for every bash, MCP, and webfetch call                                         |        12 |       12 | -                               | No           | -                                   |
| #10161 | Windows desktop app abruptly quits on closing last tab with Ctrl+W; align behavior with macOS via System Tray                                               |         8 |        4 | -                               | Yes          | 14 desktop-specific                 |
| #5943  | [Bug]: "turn/setPermissionMode failed" masks provider CLI startup death — macOS TCC EPERM kills both Claude and Codex when project is in a protected folder |         8 |        4 | -                               | No           | -                                   |
| #8388  | [Bug]: OpenCode threads via OpenRouter never show context-window usage in the composer                                                                      |         7 |        4 | -                               | Yes          | 04 composer                         |
| #16901 | [Bug]: Agent and browser panel show two different browser pages for the same browser tab                                                                    |         6 |       25 | bug, needs-julius, via-triage   | Yes          | 06 terminal-and-panels              |
| #23433 | [Bug]: linux-arm64 CLI from nightly 20261022.3512 cannot exec on 16 KiB-page kernels (Raspberry Pi 5)                                                       |         6 |       10 | -                               | No           | -                                   |
| #20366 | [Bug]: Chat snaps back to the bottom while a turn is running when scrolled up (regression of #4668 in 0.1.0)                                                |         6 |        9 | via-triage                      | Yes          | 03 thread-view                      |
| #6508  | [Bug]: New threads in the same project do not preserve the last-used model and working-mode settings                                                        |         6 |        8 | -                               | Yes          | 08 settings-project-and-keybindings |
| #16502 | [Bug]: Codex sub-agents keep failing after the shared App Server is killed by SIGKILL                                                                       |         5 |       10 | bug, via-triage                 | No           | -                                   |
| #5817  | [Bug]: New Codex runtime entries can disable existing shadow-home providers                                                                                 |         5 |       10 | -                               | No           | -                                   |
| #15099 | [Bug]: A Claude thread waiting on a background command sends a false "Thread completed" alert                                                               |         5 |        5 | bug, via-triage                 | No           | -                                   |
| #13987 | [Bug]: Codex turns reset sandbox network access to false in Auto and Auto-accept-edits modes                                                                |         5 |        5 | bug, via-triage                 | No           | -                                   |
| #4103  | [Bug]: No environment is available.                                                                                                                         |         5 |        3 | bug, needs-julius, needs-triage | No           | -                                   |
| #19823 | [Feature]: Make stale Claude resume-compaction token threshold configurable                                                                                 |         5 |        2 | enhancement                     | No           | -                                   |
| #15788 | [Bug]: Cursor 1M and 500K context tiers are ignored or rejected because the SDK request never sets Max Mode                                                 |         4 |       16 | -                               | No           | -                                   |
| #15001 | [Bug]: V2 desktop seeds t3code-v2 Local State from a stale "T3 Code (Alpha)" profile, making connection-catalog.json undecryptable                          |         4 |       13 | bug, via-triage                 | Yes          | 14 desktop-specific                 |
| #19780 | [Bug]: Intermediate turn-item snapshots remain outside event compaction (78.5 MB on one install)                                                            |         4 |        7 | -                               | No           | -                                   |
| #17805 | [Bug]: remotes using an SSH host alias get no forge (no PR sync, no clone)                                                                                  |         4 |        7 | bug, needs-triage               | No           | -                                   |
| #16183 | [Bug]: Scheduled tasks that launch a fresh thread always branch from `main` and fail every run in repos without it                                          |         4 |        7 | -                               | No           | -                                   |
| #11873 | [Bug]: Usage Limits shows Codex -32600 warnings for custom proxy providers without OpenAI auth                                                              |         4 |        7 | -                               | No           | -                                   |
| #16815 | [Bug]: Usage-limited Claude thread is never armed for auto-resume when background-task wake runs finish as `completed` right after the limit stop           |         4 |        6 | bug, via-triage                 | No           | -                                   |
| #15992 | [Bug] Delegated agents can use models hidden in Provider settings                                                                                           |         4 |        4 | -                               | Yes          | 09 providers-and-auth               |
| #15353 | [Bug]: Claude Auto mode on orchestrator v2 runs ask-rule commands without prompting                                                                         |         4 |        4 | bug, via-triage                 | No           | -                                   |
| #15606 | [Bug]: Cursor provider: `/skill` and `$skill` can't invoke skills with `disable-model-invocation: true` (agent SDK)                                         |         4 |        3 | bug, via-triage                 | No           | -                                   |
| #17216 | [Bug]: T3 Connect public MCP URL is not discoverable in a single-machine setup                                                                              |         4 |        2 | -                               | Yes          | 24 onboarding-gap                   |
| #14398 | In-app browser: passkeys stored on a phone (cross-device / QR) never prompt                                                                                 |         4 |        2 | -                               | No           | -                                   |
| #7090  | [Bug]: Usage page never scans Codex archived_sessions/, so archived sessions' usage silently disappears                                                     |         4 |        2 | -                               | No           | -                                   |
| #17363 | [Bug]: Async pi-subagents runs never show in the subagent UI on Pi threads                                                                                  |         4 |        1 | -                               | Yes          | 03 thread-view                      |
| #16921 | [Bug]: Windows snapshot/evaluate timeouts evict the shared server-browser host and abort another open                                                       |         3 |       11 | bug, via-triage                 | No           | -                                   |
| #16745 | [Bug]: html_render pages never show for OpenCode 2 threads because Code Mode wraps the call in `execute`                                                    |         3 |       11 | bug, via-triage                 | Yes          | 09 providers-and-auth               |
| #7766  | [Bug]: Flickering sidebar makes it unusable                                                                                                                 |         3 |        8 | bug, needs-julius, needs-triage | Yes          | 01 app-shell                        |
| #10961 | [Bug]: Session import is unreachable after onboarding, so externally started sessions can never be imported                                                 |         3 |        6 | -                               | Yes          | 24 onboarding-gap                   |
| #15429 | [Bug]: Orchestrator V2 shows no token usage for subagents                                                                                                   |         3 |        4 | bug, via-triage                 | No           | -                                   |
| #16672 | [Bug]: Custom Claude model effort and Thinking selections are saved but dropped at runtime                                                                  |         3 |        3 | bug, needs-triage               | No           | -                                   |
| #8361  | [Bug]: Copying from the terminal never works — clipboard always keeps its old content (Windows desktop, remote environment)                                 |         3 |        3 | needs-julius                    | Yes          | 14 desktop-specific                 |
| #4028  | [Bug]: Tailscale HTTPS cannot be enabled when using the WSL-only backend                                                                                    |         3 |        3 | bug, needs-triage               | No           | -                                   |
| #22403 | [Bug]: T3 Code is not opening                                                                                                                               |         3 |        2 | bug, needs-triage               | No           | -                                   |
| #17225 | macOS service updates require new privacy approvals for each versioned t3 executable                                                                        |         3 |        2 | -                               | No           | -                                   |
| #16435 | [Bug]: Cursor provider fails behind a TLS-inspecting proxy because the SDK always uses HTTP/2                                                               |         3 |        2 | bug, via-triage                 | No           | -                                   |
| #7390  | [Bug]: iOS composer wedges — send stays disabled and the draft carries into other threads                                                                   |         3 |        1 | -                               | Yes          | 15 mobile                           |
| #5401  | [Bug]: OpenCode turn fails with “Endpoint is unavailable” in T3 Code while identical CLI run completes                                                      |         3 |        1 | bug, needs-julius, needs-triage | No           | -                                   |
| #24223 | [Bug]: Mermaid diagrams don't render in the mobile app                                                                                                      |         3 |        0 | bug, needs-triage               | Yes          | 15 mobile                           |
| #13110 | [Bug]: Pooled Limits average accounts evenly, ignoring plan size (Pro 20x counts the same as Plus)                                                          |         3 |        0 | -                               | No           | -                                   |
| #15994 | [Bug]: OpenCode model missing at startup, shows Unavailable until manual provider refresh                                                                   |         2 |       10 | bug, via-triage                 | No           | -                                   |
| #14169 | [Bug]: Orchestrator V2 Usage Reset Tracker Broken                                                                                                           |         2 |       10 | bug, via-triage                 | No           | -                                   |
| #19657 | [Bug]: Hidden subagent child threads are auto-settle candidates, so the sweep evaluates and polls threads the user cannot see or settle                     |         2 |        9 | bug, accepted, via-triage       | No           | -                                   |
| #23936 | [Bug]: preview_snapshot always times out for tabs in delegated child threads and for open:false tabs (macOS 0.1.1)                                          |         2 |        7 | -                               | Yes          | 14 desktop-specific                 |
| #18165 | [Bug]: Windows: resident server-browser host's chrome-headless-shell GPU process (SwiftShader) busy-spins ~5 cores for hours while idle                     |         2 |        7 | bug, needs-julius, via-triage   | Yes          | 22 performance-feel                 |

## Table B: all UI-relevant issues by area (sorted by reactions, then comments)

### 01 app-shell (7)

| #      | title                                                                                                                                                                 | reactions | comments | age (days) | labels                          |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | ------------------------------- |
| #7766  | [Bug]: Flickering sidebar makes it unusable                                                                                                                           |         3 |        8 |         65 | bug, needs-julius, needs-triage |
| #5369  | [Bug]: Windows UI shifts vertically while app is unfocused                                                                                                            |         0 |        4 |         82 | -                               |
| #15572 | [Bug]: Live sidebar updates move row action targets under the pointer                                                                                                 |         0 |        2 |         21 | bug, via-triage                 |
| #11476 | [Bug]: Add-project folder picker serves a stale directory listing, folders created outside the app never appear                                                       |         0 |        2 |         43 | -                               |
| #22586 | [Bug]: Windows, large repo: run finalization forces a full fff rescan every turn, blocking the backend event loop 15-52 s on the picker lock                          |         0 |        1 |          4 | bug, accepted, via-triage       |
| #16445 | [Bug]: Per-project grouping rule can't be set from the new sidebar                                                                                                    |         0 |        1 |         19 | -                               |
| #15238 | [Bug]: The sidebar doesn't show a thread's running dev servers: the per-thread indicator exists only in the legacy sidebar and never counts servers the agent started |         0 |        1 |         22 | bug, via-triage                 |

### 02 thread-list (0)

_None flagged by the title keyword list. See Incomplete for candidates._

### 03 thread-view (23)

| #      | title                                                                                                                            | reactions | comments | age (days) | labels                             |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | ---------------------------------- |
| #20366 | [Bug]: Chat snaps back to the bottom while a turn is running when scrolled up (regression of #4668 in 0.1.0)                     |         6 |        9 |          9 | via-triage                         |
| #17363 | [Bug]: Async pi-subagents runs never show in the subagent UI on Pi threads                                                       |         4 |        1 |         17 | -                                  |
| #17564 | [Bug]: Async pi-subagents workflow, chain and parallel runs never appear in the subagent UI                                      |         2 |        5 |         16 | -                                  |
| #12372 | [Bug]: Scroll-to-end pill stays hidden after thread switch strands viewport above the end                                        |         1 |        7 |         37 | bug, accepted, via-triage          |
| #20427 | Scrolling to the top of a synthetic 13,000-item thread takes ~2.4 s of server time: every history page re-reads the whole thread |         0 |        7 |          8 | via-triage                         |
| #15461 | [Bug]: Conversation "Message Bars" Vertical UI Overfil                                                                           |         0 |        5 |         21 | bug, via-triage                    |
| #8701  | [Bug]: Ghostty scrollback is configured as bytes despite being named as rows                                                     |         0 |        4 |         56 | -                                  |
| #20246 | [Bug]: Claude usage undercounts subagent output because dedupe keeps the first partial copy of each message                      |         0 |        3 |          9 | bug, via-triage                    |
| #11985 | Chat header toolbar controls show no hover tooltips                                                                              |         0 |        3 |         40 | bug, accepted, via-triage          |
| #23930 | Copying a command from an assistant code block includes Markdown fences                                                          |         0 |        2 |          2 | -                                  |
| #10156 | [Bug]: CarPlay Dashboard widget content is rendered twice / overlapping                                                          |         0 |        2 |         50 | bug, accepted, via-triage          |
| #6065  | [Bug]: Plugin installation confirmation card does not render                                                                     |         0 |        2 |         76 | -                                  |
| #24120 | [Bug]: Streaming thinking and plan text rebuilds the whole chat timeline on every update (~20 times a second)                    |         0 |        1 |          2 | -                                  |
| #22181 | [Bug]: Inline code like `I/W217:220` renders as a file chip because a `:line` suffix skips the extension check                   |         0 |        1 |          5 | -                                  |
| #17895 | Pi extension select dialogs show the title twice and lose line breaks                                                            |         0 |        1 |         15 | needs more info                    |
| #16195 | [Bug]: Text rendering is broken in the thread                                                                                    |         0 |        1 |         20 | bug, needs-triage, needs more info |
| #24279 | [Bug]: /usage-limits result renders behind the Tasks row instead of showing above it first                                       |         0 |        0 |          2 | bug, needs-triage                  |
| #24191 | [Bug]: Sidebar collapsed state is saved but never restored on launch                                                             |         0 |        0 |          2 | bug, needs-triage                  |
| #24183 | [Bug]: Markdown table cells are clamped to one line with an ellipsis, hiding most of the text                                    |         0 |        0 |          2 | -                                  |
| #24166 | [Bug]: Inline code in Markdown tables is as large as the table text around it                                                    |         0 |        0 |          2 | -                                  |
| #23730 | [Bug]: Antigravity background-task <SYSTEM_MESSAGE> notice is rendered inside the assistant message                              |         0 |        0 |          3 | -                                  |
| #23714 | html_render pages never show for Grok threads because the result arrives in output.OkayOutput                                    |         0 |        0 |          3 | -                                  |
| #23507 | [Bug]: Claude skills-directory plugin skills are missing from the `$` picker and mid-message skill rows                          |         0 |        0 |          3 | -                                  |

### 04 composer (29)

| #      | title                                                                                                                                     | reactions | comments | age (days) | labels                    |
| ------ | ----------------------------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | ------------------------- |
| #8388  | [Bug]: OpenCode threads via OpenRouter never show context-window usage in the composer                                                    |         7 |        4 |         59 | -                         |
| #13978 | [Bug]: Claude Code's artifact live-updates watcher is listed in the Agents panel as a working agent with a model and effort               |         1 |        2 |         28 | bug, via-triage           |
| #16408 | [Bug]: Cursor plugin skills are missing from the composer and from the agent catalog                                                      |         1 |        1 |         19 | bug, via-triage           |
| #22820 | Home-ownership dialog gives the same advice for an old and a current background service, and never mentions turning off Local environment |         0 |        7 |          4 | -                         |
| #22076 | Collapsed (resting) composer shows assistant quotes as raw t3-citation links instead of chips                                             |         0 |        4 |          5 | bug, accepted, via-triage |
| #17651 | [Bug]: Claude composer shows Fast while requests are served at standard speed, with no notice                                             |         0 |        3 |         16 | -                         |
| #16444 | Changing the default model's effort in Settings can replace the saved model                                                               |         0 |        3 |         19 | bug, via-triage           |
| #16105 | [Bug]: Sent prompts strike through text between two single tildes that the rich composer showed literally                                 |         0 |        3 |         20 | -                         |
| #24115 | [Bug]: After a Claude safeguard fallback, the thread keeps the original model, so the composer is wrong and resumes switch back           |         0 |        2 |          2 | -                         |
| #22989 | [Bug]: Composer leaves a line as plain text when a dash is added in front of it later                                                     |         0 |        2 |          4 | -                         |
| #22537 | [Bug]: T3's model picker does not show available models for ClinePass accounts                                                            |         0 |        2 |          5 | bug, needs-triage         |
| #21967 | [Bug]: Expanding a tool call or thinking row near the composer leaves its content hidden behind the composer                              |         0 |        2 |          6 | bug, accepted, via-triage |
| #17110 | [Bug]: Composer shows Max effort while Claude Code caps it to xhigh via maxEffortLevel                                                    |         0 |        2 |         17 | -                         |
| #15531 | Chat: middle-click drag should pan the timeline instead of pasting into the composer                                                      |         0 |        2 |         21 | bug, via-triage           |
| #14231 | [Bug]: Collapsing the question card still leaves the composer at full height, and scrolling never rests it                                |         0 |        2 |         26 | bug, via-triage           |
| #7557  | [Bug]: @ file/folder picker shows no matching files or folders even with an open project                                                  |         0 |        2 |         67 | bug, needs-triage         |
| #4253  | [Bug]: Preserve native spellcheck behavior in the composer                                                                                |         0 |        2 |         95 | needs more info           |
| #24459 | [Bug]: OpenCode providers defined in a project's opencode.jsonc never appear in the model picker for that project                         |         0 |        1 |          1 | bug, needs-triage         |
| #23221 | [Bug]: Cursor skill discovery still drops all skills when non-node_modules files exhaust the shared scan budget                           |         0 |        1 |          3 | -                         |
| #17124 | [Bug]: Tab in a composer numbered list keeps the number and does not nest the item in the sent Markdown                                   |         0 |        1 |         17 | bug, via-triage           |
| #16526 | Composer shows Cursor 'Auto' for a thread whose stored model it can't resolve; sending would switch the model                             |         0 |        1 |         19 | bug, via-triage           |
| #13628 | [Bug]: New-thread breadcrumb reaches draft URL but keeps rendering previous chat                                                          |         0 |        1 |         30 | bug, via-triage           |
| #8963  | [Bug]: Typed composer text is lost when clicking Stop during a pending approval prompt                                                    |         0 |        1 |         55 | -                         |
| #24371 | [Bug]: Cursor via ACP Registry can't pick reasoning effort (no Opus 5.5 xhigh) since T3 stopped sending parameterizedModelPicker          |         0 |        0 |          1 | -                         |
| #24203 | [Bug]: Sidebar logo link is announced as "Go to threads" but opens a new draft                                                            |         0 |        0 |          2 | bug, needs-triage         |
| #24018 | [Bug]: Scrolling a markdown table horizontally makes the prompt input toggle between compact and expanded mode                            |         0 |        0 |          2 | -                         |
| #23497 | [Bug]: Composer applies the settings default's options to a thread saved without options                                                  |         0 |        0 |          3 | -                         |
| #22429 | [Bug]: Project skills drop out of the $ picker for seconds after 16 other folders were scanned                                            |         0 |        0 |          5 | -                         |
| #16985 | Composer drops pasted text when an image paste follows within ~300 ms                                                                     |         0 |        0 |         18 | -                         |

### 05 diff-and-review (24)

| #      | title                                                                                                                  | reactions | comments | age (days) | labels                    |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | ------------------------- |
| #8234  | [Bug]: Not following symlinks to iCloud~Drive, can't read files/see diffs                                              |         2 |        3 |         61 | bug, needs-triage         |
| #11078 | [Bug]: Sidebar thread label keeps the branch stamped at thread creation after the session switches worktree and branch |         1 |        5 |         45 | bug, accepted, via-triage |
| #12943 | Chat text selection clears and reappears on different messages while manually scrolling                                |         1 |        3 |         34 | bug, via-triage           |
| #13279 | [Bug]: Viewed PR file diffs expand after reopening the Code tab                                                        |         0 |        6 |         32 | via-triage                |
| #7076  | Overlapping VCS status refreshes multiply Git and network work                                                         |         0 |        4 |         71 | -                         |
| #18618 | PR discovery rebuilds thread shells and counts unused history                                                          |         0 |        3 |         13 | enhancement, via-triage   |
| #18300 | [Bug]: J/K do not step the review guide in the chat pull request sidebar                                               |         0 |        3 |         14 | bug, accepted, via-triage |
| #12902 | [Bug]: Diff view drops intermediate directories for a nested git repo under a non-git project root                     |         0 |        3 |         34 | bug, via-triage           |
| #24017 | [Bug]: Diff Files panel cuts off every file name and can't be resized                                                  |         0 |        2 |          2 | bug, needs-triage         |
| #22806 | Copilot reports T3 pull request tools missing and only uses the terminal fallback after a follow-up                    |         0 |        2 |          4 | -                         |
| #15843 | [Bug]: Timeline Open diff shows the wrong turn for edits from running, failed, or forked turns                         |         0 |        2 |         20 | bug, via-triage           |
| #11835 | Grouped project icon differs between settings and sidebar                                                              |         0 |        2 |         40 | bug, accepted, via-triage |
| #22319 | [Bug]: Diff selection always resets to Changes after navigating away                                                   |         0 |        1 |          5 | -                         |
| #22315 | [Bug]: Diff counters and artifacts collide across chats working on the same repository                                 |         0 |        1 |          5 | -                         |
| #20207 | [Bug]: Can't copy code from the PR Code tab diff                                                                       |         0 |        1 |          9 | via-triage                |
| #19828 | Private Bitbucket images in PR descriptions show "Image unavailable" in the PR panel                                   |         0 |        1 |         10 | -                         |
| #19787 | Right-side diff intermittently throws VirtualizedFileDiff trailing context mismatch on 0.0.45                          |         0 |        1 |         10 | via-triage                |
| #19781 | [Bug]: Known GitHub quota pauses repeatedly log full warning stacks in thread PR discovery and settlement              |         0 |        1 |         10 | bug, accepted, via-triage |
| #17674 | [Bug]: Collapse all does not stay applied to unloaded files in large diffs                                             |         0 |        1 |         15 | -                         |
| #11571 | [Bug]: Diff tab loses scroll position when switching threads                                                           |         0 |        1 |         42 | -                         |
| #8640  | [Bug]: Pull request detail panel stays stale after automatic refresh                                                   |         0 |        1 |         57 | -                         |
| #8204  | [Bug]: Diff shows prior branch's changes as deletions after switching checked-out branch mid-thread                    |         0 |        1 |         61 | -                         |
| #24146 | [Bug]: PR link chips in an expanded Markdown table break mid-number (#36 / 3)                                          |         0 |        0 |          2 | -                         |
| #23575 | Forgejo and Gitea reviewer picker repeats the same assignees over and over                                             |         0 |        0 |          3 | -                         |

### 06 terminal-and-panels (29)

| #      | title                                                                                                                | reactions | comments | age (days) | labels                           |
| ------ | -------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | -------------------------------- |
| #16901 | [Bug]: Agent and browser panel show two different browser pages for the same browser tab                             |         6 |       25 |         18 | bug, needs-julius, via-triage    |
| #8450  | [Bug]: Integrated terminal does not set TERM_PROGRAM, breaking shell prompt and terminal detection                   |         2 |        2 |         59 | bug, needs-triage                |
| #16030 | [Bug]: Browser annotations sit behind native modal dialogs                                                           |         1 |        3 |         20 | bug, needs more info, via-triage |
| #20364 | [Bug]: Keys typed in the preview comment box trigger the page's own keyboard shortcuts                               |         1 |        1 |          9 | bug, via-triage                  |
| #15927 | [Bug]: Copying text from the Files panel returns only part of the file                                               |         0 |        5 |         20 | bug, via-triage                  |
| #15579 | [Bug]: Preview tabs from other threads stay alive as hidden, unthrottled webviews until restart (13 tabs, ~2.7 GB)   |         0 |        4 |         21 | bug, via-triage                  |
| #21022 | [Bug]: Server browser tab silently closes when a site's service worker calls navigator.setAppBadge                   |         0 |        3 |          8 | bug, accepted, via-triage        |
| #19536 | [Bug]: Terminal pane's floating action toolbar covers the terminal's first line                                      |         0 |        3 |         11 | bug, accepted, via-triage        |
| #11402 | [Bug]: Terminal cursor leaves top and bottom edges visible during blink off phase                                    |         0 |        3 |         43 | bug, via-triage                  |
| #22300 | Markdown preview loses scroll position after switching tabs                                                          |         0 |        2 |          5 | -                                |
| #22095 | [Bug]: Typing after clicking a field inside a cross-origin iframe in the preview goes to the chat composer           |         0 |        2 |          5 | bug, accepted, via-triage        |
| #20899 | [Bug]: preview_snapshot renders backdrop-filter as mirrored tiles at viewports wider than 640px                      |         0 |        2 |          8 | bug, accepted, via-triage        |
| #19530 | [Bug]: Thread details Changes row ignores the base ref and whitespace setting chosen in the Changes panel            |         0 |        2 |         11 | bug, accepted, via-triage        |
| #17483 | [Bug]: Agent browser stalls / drops connection on Windows when its panel is off-screen (switching threads)           |         0 |        2 |         16 | -                                |
| #24154 | [Bug]: Terminal shows "cwd does not exist" after storage cleanup removes a thread's worktree                         |         0 |        1 |          2 | -                                |
| #23514 | [Bug]: preview_recording_start on a tab that draws no frames never returns and blocks every later action on that tab |         0 |        1 |          3 | -                                |
| #20535 | A flooding terminal at its 8 MB history cap rewrites the whole history file about 4 times a second                   |         0 |        1 |          8 | via-triage                       |
| #16923 | [Bug]: Terminal fails with "Terminal cwd does not exist" after the project directory is renamed mid-thread           |         0 |        1 |         18 | -                                |
| #10494 | [Bug]: Resizing a Preview viewport during recording corrupts the exported MP4                                        |         0 |        1 |         48 | -                                |
| #6337  | [Bug]: Project action command gets stuck when the terminal has not been opened                                       |         0 |        1 |         74 | -                                |
| #5540  | [Bug]: Embedded browser tabs are not restored after quitting or crashing the app                                     |         0 |        1 |         80 | -                                |
| #24745 | [Bug]: Terminal "Add to chat" inserts into a hidden message draft while answering a question                         |         0 |        0 |          0 | -                                |
| #24175 | Terminal output window serializes every chunk twice — once only to measure it                                        |         0 |        0 |          2 | via-triage                       |
| #23704 | [Bug]: Markdown file preview renders YAML frontmatter as a setext heading                                            |         0 |        0 |          3 | -                                |
| #23513 | [Bug]: Closing a server preview tab never fires beforeunload or pagehide                                             |         0 |        0 |          3 | -                                |
| #23021 | [Bug]: Resumed Bob thread cannot navigate or close its own preview tab after the 30-minute idle stop                 |         0 |        0 |          4 | -                                |
| #22988 | [Bug]: Floating preview grows by itself and stays stuck mid-window after grabbing its corner to resize               |         0 |        0 |          4 | -                                |
| #22468 | [Bug]: Thread Details Panel is missing Tooltip + Keyboard Shortcut                                                   |         0 |        0 |          5 | bug, needs-triage                |
| #19492 | [Bug]: terminal selection drag scrolls one row at a time past the edge                                               |         0 |        0 |         11 | -                                |

### 07 settings-appearance (2)

| #      | title                                                                     | reactions | comments | age (days) | labels                    |
| ------ | ------------------------------------------------------------------------- | --------: | -------: | ---------: | ------------------------- |
| #17233 | [Bug]: Advanced background activity changes fail with "Setting not saved" |         0 |        7 |         17 | bug, via-triage           |
| #21008 | [Bug]: Wide interface fonts clip single-digit numbered list markers       |         0 |        3 |          8 | bug, accepted, via-triage |

### 08 settings-project-and-keybindings (6)

| #      | title                                                                                                           | reactions | comments | age (days) | labels          |
| ------ | --------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | --------------- |
| #6508  | [Bug]: New threads in the same project do not preserve the last-used model and working-mode settings            |         6 |        8 |         73 | -               |
| #14991 | [Bug]: `t3_project_update` saves scripts and project defaults that are ignored once project settings are folded |         1 |        8 |         22 | bug, via-triage |
| #22793 | [Bug]: Monogram picker allows more than two characters, then save fails with a generic error                    |         0 |        2 |          4 | -               |
| #19930 | [Bug]: Custom snooze time picker ignores the Time format setting                                                |         0 |        2 |         10 | -               |
| #16542 | [Bug]: Cmd+[ / Cmd+] back/forward stops on the Settings page instead of skipping to threads                     |         0 |        2 |         19 | -               |
| #15073 | [Bug]: Claude launch args --settings is silently replaced by T3's own SDK settings                              |         0 |        2 |         22 | -               |

### 09 providers-and-auth (19)

| #      | title                                                                                                                            | reactions | comments | age (days) | labels                    |
| ------ | -------------------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | ------------------------- |
| #15992 | [Bug] Delegated agents can use models hidden in Provider settings                                                                |         4 |        4 |         20 | -                         |
| #16745 | [Bug]: html_render pages never show for OpenCode 2 threads because Code Mode wraps the call in `execute`                         |         3 |       11 |         18 | bug, via-triage           |
| #11871 | [Bug]: OpenCode project-local agents are missing from the agent picker                                                           |         2 |        4 |         40 | bug, via-triage           |
| #17471 | [Bug]: The composer refuses files that Claude Code and Codex accept by path                                                      |         2 |        1 |         16 | -                         |
| #16636 | [Bug]: One unresponsive provider holds all four effect workers and stalls every thread                                           |         1 |        5 |         18 | bug, via-triage           |
| #11739 | Python docstring bodies highlight as code in the diff panel because partial patches are tokenized without grammar context        |         1 |        5 |         41 | bug, accepted, via-triage |
| #19155 | [Bug]: Muse provider doesn't surface Personal/Project skills in composer skill picker                                            |         1 |        3 |         12 | -                         |
| #21061 | [Bug]: Astra messages fail in T3 Code but the same prompt/model works in terminal Codex                                          |         1 |        1 |          7 | -                         |
| #16846 | A turn with no path to a terminal event: Pi's settle probe never re-arms, OpenCode drops unresolvable child asks                 |         0 |        5 |         18 | bug, via-triage           |
| #15725 | [Bug]: Account controls and T3 Connect stay unavailable after Clerk UI load failure until Reload                                 |         0 |        5 |         21 | bug, via-triage           |
| #19025 | Changing a provider instance's settings doesn't reach its live sessions                                                          |         0 |        3 |         12 | bug, accepted, via-triage |
| #3142  | [Bug]: Inline code typed on dead-key keyboard layouts renders literally (non-ASCII grave instead of U+0060)                      |         0 |        2 |        129 | needs more info           |
| #24131 | [Bug]: Artifact comment auto-replies never arm in Claude threads: every composer message reaches Claude Code as turnOrigin "sdk" |         0 |        1 |          2 | -                         |
| #22405 | Pi run fails with "Provider turn failed." when a question's "Type something" option opens a follow-up input dialog               |         0 |        1 |          5 | -                         |
| #16067 | [Bug]: Codex 0.160 agents get no T3 Code MCP tools: /mcp answers server/discover with HTTP 400                                   |         0 |        1 |         20 | -                         |
| #24322 | [Bug]: Terminal "timed out negotiating with the code-mode host" on every call while the VM's Codex app-server is backlogged      |         0 |        0 |          1 | -                         |
| #24214 | [Bug]: Claude picker ignores availableModels and ANTHROPIC_DEFAULT_*_MODEL; picking Haiku on Bedrock silently runs Opus          |         0 |        0 |          2 | -                         |
| #23365 | [Bug]: Paragraph streaming stores every full reasoning snapshot as a permanent event (OpenCode: 93k rows, 2.2 GB in one day)     |         0 |        0 |          3 | -                         |
| #23104 | [Bug]: Usage counts OpenCode session replays from forks/continuations once per copy (2.45x token, 2.61x cost inflation)          |         0 |        0 |          4 | -                         |

### 10 first-run-and-empty-states (8)

| #      | title                                                                                                                                               | reactions | comments | age (days) | labels                    |
| ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | ------------------------- |
| #19520 | Usage view: empty/duplicate native Codex rows when agents use a shared CLIProxyAPI gateway                                                          |         1 |        1 |         11 | enhancement               |
| #21746 | [Bug]: OpenCode V2 image-generation results are reduced to empty text and not displayed                                                             |         0 |        3 |          6 | bug, accepted, via-triage |
| #20436 | [Bug]: Pull Requests list is empty on GitHub Enterprise Server (GHES) because GraphQL documents include github.com-only `stack`/`stackEntry` fields |         0 |        2 |          8 | bug, via-triage           |
| #20232 | Codex goal resume fails with EmptyInput while native work continues                                                                                 |         0 |        2 |          9 | bug, via-triage           |
| #7212  | [Bug]: Failed browser preview remains as a blank floating panel                                                                                     |         0 |        1 |         70 | -                         |
| #24323 | [Bug]: Dev seed snapshot has a migration history behind main, so `vp run dev` rejects it and reproductions start from empty state                   |         0 |        0 |          1 | -                         |
| #23916 | Usage › Limits: accounts with no limits in common leave every row half empty                                                                        |         0 |        0 |          2 | -                         |
| #22865 | [Bug]: Grok unpolled early completion publishes an empty continuation instead of the final answer                                                   |         0 |        0 |          4 | -                         |

### 11 remote-access-and-pairing (2)

| #      | title                                                                                                             | reactions | comments | age (days) | labels          |
| ------ | ----------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | --------------- |
| #21107 | [Bug]: SnapShot modifier-pair shortcut label "Shift + Shift" reads as a double tap; it means hold both Shift keys |         0 |        2 |          7 | -               |
| #14746 | Tailscale HTTPS shows off and cannot be disabled in Settings when local DNS fails                                 |         0 |        2 |         23 | bug, via-triage |

### 12 notifications-errors-toasts (13)

| #      | title                                                                                                                                                   | reactions | comments | age (days) | labels          |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | --------------- |
| #15993 | [Bug]: Stale "Waiting on background task T3 Worktree Handoff" banner persists after a Claude worktree handoff                                           |         1 |        9 |         20 | bug, via-triage |
| #23006 | MCP orchestration tools fail with `parent_not_active` after a provider handoff, a notification turn, or a question; a restart mid-turn kills the thread |         1 |        2 |          4 | needs more info |
| #22819 | Goal and Tasks banners cast an excessive shadow above the composer                                                                                      |         0 |        2 |          4 | -               |
| #18799 | Unread raw ACP notifications pin up to 32 payloads per connection (256 MiB for 8 MiB notifications, synthetic)                                          |         0 |        2 |         13 | via-triage      |
| #17808 | [Bug]: "Resume at reset" never fires: banner shows "Cancel auto-resume" but the thread is not resumed after the usage limit resets                      |         0 |        2 |         15 | -               |
| #15702 | [Bug]: Sidebar and composer PR badges show total linked count with open status for mixed states                                                         |         0 |        2 |         21 | bug, via-triage |
| #24477 | [Bug]: Thread briefly shows completed (and sends a "Thread completed" notification) between orchestrator runs                                           |         0 |        1 |          1 | -               |
| #20883 | Thread done toast stays open after opening that thread without the toast button                                                                         |         0 |        1 |          8 | -               |
| #12979 | [Bug]: Antigravity adapter "This question is no longer pending" error is not recognized as stale, causing permanent UI deadlock                         |         0 |        1 |         33 | bug, via-triage |
| #24831 | [Bug]: Lineage panel hides which account a subagent runs on (no account badge)                                                                          |         0 |        0 |          0 | -               |
| #24253 | [Bug]: Usage limit toast shows the question icon instead of the Limited icon                                                                            |         0 |        0 |          2 | -               |
| #23734 | [Bug]: Spurious "Keybindings updated" toasts on Windows when keybindings.json is only read (last-access time change)                                    |         0 |        0 |          3 | -               |
| #9886  | Cloud link hardcodes notificationsEnabled: true, contradicting the privacy policy's "if you enable notifications"                                       |         0 |        0 |         50 | -               |

### 13 loading-and-skeletons (3)

| #      | title                                                                                                                  | reactions | comments | age (days) | labels          |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | --------------- |
| #16692 | [Bug]: New sidebar silently stuck on a remote 'No project' scope, so all projects and Working threads appear missing   |         0 |        3 |         18 | bug, via-triage |
| #23661 | [Bug]: a stalled command pipeline gives an endless spinner, and the message typed while it stalls is dropped           |         0 |        0 |          3 | -               |
| #23494 | [Bug]: Pi extension input dialogs render as a single "Submit empty value" option, with the placeholder as the question |         0 |        0 |          3 | -               |

### 14 desktop-specific (98)

| #      | title                                                                                                                                                                     | reactions | comments | age (days) | labels                           |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | -------------------------------- |
| #10161 | Windows desktop app abruptly quits on closing last tab with Ctrl+W; align behavior with macOS via System Tray                                                             |         8 |        4 |         50 | -                                |
| #15001 | [Bug]: V2 desktop seeds t3code-v2 Local State from a stale "T3 Code (Alpha)" profile, making connection-catalog.json undecryptable                                        |         4 |       13 |         22 | bug, via-triage                  |
| #8361  | [Bug]: Copying from the terminal never works — clipboard always keeps its old content (Windows desktop, remote environment)                                               |         3 |        3 |         59 | needs-julius                     |
| #23936 | [Bug]: preview_snapshot always times out for tabs in delegated child threads and for open:false tabs (macOS 0.1.1)                                                        |         2 |        7 |          2 | -                                |
| #22461 | [Bug]: Mac desktop to Windows remote browser stays on Connecting indefinitely                                                                                             |         1 |        5 |          5 | -                                |
| #12689 | [Bug]: Windows desktop typing lags even in empty chats; browser interface is smooth                                                                                       |         1 |        5 |         35 | bug, accepted, via-triage        |
| #861   | Desktop app appears too small on high-DPI displays on Windows/Linux                                                                                                       |         1 |        3 |        229 | -                                |
| #23109 | [Bug]: desktop clients older than #23037 can't connect to newer servers (compactIdleThreads changed from boolean to string)                                               |         1 |        2 |          4 | -                                |
| #22942 | [Bug]: preview_resize returns inconsistent viewport state for desktop tabs                                                                                                |         1 |        0 |          4 | bug, needs-triage                |
| #17965 | [Bug]: Desktop browser cannot approve local HTTPS certificates                                                                                                            |         1 |        0 |         14 | -                                |
| #17009 | Built-in browser does not render or navigate on v0.0.46 nightlies; desktop browser tools report "No desktop browser is connected to this session"                         |         0 |        9 |         17 | bug, via-triage                  |
| #13046 | [Bug]: Cannot type @ char in Terminal on MacOS with German Keyboard Layout                                                                                                |         0 |        8 |         33 | bug, accepted, via-triage        |
| #19079 | [Bug]: Right-sidebar tab X needs repeated clicks in macOS native fullscreen                                                                                               |         0 |        5 |         12 | via-triage                       |
| #16114 | [Bug]: Selecting text in terminal with LMB should not spawn any menus                                                                                                     |         0 |        5 |         20 | bug, via-triage                  |
| #15954 | [Bug]: Change appearance shortcut fails on macOS AZERTY (Option+Shift+Cmd+A)                                                                                              |         0 |        5 |         20 | bug, via-triage                  |
| #17737 | [Bug]: Each second-instance launch on Linux leaves a copy of the app icon in /tmp                                                                                         |         0 |        4 |         15 | -                                |
| #17367 | First launch after a desktop update can start the backend in web mode without the bootstrap secret, so the desktop's own login is rejected (invalid_credential)           |         0 |        4 |         17 | bug, via-triage                  |
| #11872 | [Bug]: Desktop SSH remote's managed server inherits a per-session forwarded SSH_AUTH_SOCK that dies with the launching session                                            |         0 |        4 |         40 | bug, accepted, via-triage        |
| #10193 | Desktop nightly 20260905.1284 closes its own local WebSocket ~100 ms after connect and retries every 16 s forever ("MacBook Pro (2) is reconnecting")                     |         0 |        4 |         50 | bug, needs-julius, via-triage    |
| #22024 | [Bug]: Web and desktop offer no retry while an environment is reconnecting, and the wait grows to five minutes                                                            |         0 |        3 |          6 | bug, accepted, via-triage        |
| #21954 | [Bug]: preview_click steals focus from the desktop composer                                                                                                               |         0 |        3 |          6 | bug, accepted, via-triage        |
| #20345 | Windows in-app update silently fails when the installer signature check exceeds electron-updater's 20s PowerShell timeout                                                 |         0 |        3 |          9 | bug, via-triage                  |
| #19696 | [Bug]: OpenCode subagents missing from desktop agent UI with Muse Spark 1.3                                                                                               |         0 |        3 |         10 | via-triage                       |
| #15143 | [Bug]: Desktop writes clerk-tokens.json without restrictive file mode (and allows unencrypted fallback)                                                                   |         0 |        3 |         22 | bug, via-triage, security        |
| #14730 | [Bug]: Inactive macOS previews still render with panel closed: 228% GPU/guest CPU and ~10 GB graphics footprint                                                           |         0 |        3 |         23 | bug, via-triage                  |
| #14259 | [Bug]: Linux AppImage: desktop main process exits silently (no quit lifecycle, no core), AppImage mount disappears and all children die with SIGBUS                       |         0 |        3 |         26 | bug, via-triage                  |
| #12103 | SnapShot shortcut cannot capture Xcode Device Hub on macOS 27                                                                                                             |         0 |        3 |         39 | bug, accepted, via-triage        |
| #10997 | [Bug]: Desktop context menus do not inherit imported VS Code themes                                                                                                       |         0 |        3 |         46 | bug, needs-julius, via-triage    |
| #10499 | [Bug]: SwiftUI client (TestFlight, macOS) — TimelineView/Canvas render loop saturates WindowServer and freezes the entire session                                         |         0 |        3 |         48 | bug, via-triage                  |
| #5236  | [Bug]: Desktop app crashes on launch on Windows (Chromium sandbox failure, exit 0x80000003)                                                                               |         0 |        3 |         84 | -                                |
| #23788 | [Bug]: Scrolling lists in dialogs flickers on macOS, but never while screen recording                                                                                     |         0 |        2 |          3 | -                                |
| #23041 | [Bug]: Windows desktop conversation pane stays blank until switching threads away and back                                                                                |         0 |        2 |          4 | -                                |
| #22990 | [Bug]: Desktop update can't relaunch when an SSH client starts a server during the restart                                                                                |         0 |        2 |          4 | bug, needs-triage                |
| #22983 | [Bug]: Quitting the desktop app leaves its server running, so the next launch cannot start one                                                                            |         0 |        2 |          4 | -                                |
| #21235 | [Bug]: Hidden desktop window drops and reconnects every environment on a one-minute grid (15 s ping timeout vs background throttling)                                     |         0 |        2 |          7 | bug, accepted, via-triage        |
| #20897 | [Bug]: Windows desktop shows nothing for host-path Markdown images (drive-letter paths)                                                                                   |         0 |        2 |          8 | via-triage                       |
| #18729 | [Bug]: Clicking off browser menu does interact properly (nightly)                                                                                                         |         0 |        2 |         13 | bug, via-triage                  |
| #17476 | [Bug]: macOS main-process crash in accessibility line-range handling (SIGTRAP)                                                                                            |         0 |        2 |         16 | -                                |
| #16826 | Desktop on Windows sends its bootstrap token to a WSL background service on the same port (invalid_credential on first launch)                                            |         0 |        2 |         18 | bug, via-triage                  |
| #16387 | [Bug]: Sidebar background renders as grainy gray artifact with GPU compositing on Linux/Wayland (AMD/Mesa)                                                                |         0 |        2 |         19 | bug, needs more info, via-triage |
| #15426 | [Bug]: Dev desktops in every worktree share one Chromium profile                                                                                                          |         0 |        2 |         21 | bug, via-triage                  |
| #10517 | [Bug]: Backend startup crashes leave desktop blank with no visible error                                                                                                  |         0 |        2 |         48 | bug, accepted, via-triage        |
| #10390 | Message link context menus do not receive focus with screen readers on Windows                                                                                            |         0 |        2 |         49 | bug, via-triage                  |
| #24094 | [Bug]: Desktop app can still crash when a preview tab's renderer dies mid-screenshot, until Electron ships Chromium 157                                                   |         0 |        1 |          2 | bug, needs-triage                |
| #24028 | In-app thread notifications blur the composer during macOS dictation                                                                                                      |         0 |        1 |          2 | -                                |
| #23470 | [Bug]: Desktop overwrites an undecryptable connection-catalog.json with an empty catalog, permanently deleting saved environments                                         |         0 |        1 |          3 | -                                |
| #23372 | Desktop stays windowless for 8+ minutes after an update while startup recovery holds a write transaction open                                                             |         0 |        1 |          3 | -                                |
| #22816 | Desktop (macOS) reports Claude "Not authenticated" when auth comes from CLAUDE_CODE_OAUTH_TOKEN in the shell profile                                                      |         0 |        1 |          4 | -                                |
| #22626 | Linux desktop onboarding doesn't mention the AppArmor browser setup step until browser tools fail                                                                         |         0 |        1 |          4 | bug, accepted, via-triage        |
| #22250 | [Bug]: macOS integrated Bash terminal skips .bash_profile because it starts without login mode                                                                            |         0 |        1 |          5 | -                                |
| #21889 | Windows desktop suggests an unreachable Windows Tailscale address for a WSL backend                                                                                       |         0 |        1 |          6 | bug, accepted, via-triage        |
| #21189 | [Bug]: Linux/Wayland desktop main process aborts with V8 heap OOM (SIGTRAP), no preview/CDP activity                                                                      |         0 |        1 |          7 | via-triage                       |
| #21006 | [Bug]: ⇧⌘V (Paste as Text) pastes nothing in the composer on macOS                                                                                                        |         0 |        1 |          8 | -                                |
| #19119 | [Bug]: "System" appearance stays light on KDE Plasma Wayland (Electron mis-resolves the color scheme)                                                                     |         0 |        1 |         12 | -                                |
| #19109 | [Bug]: dev-electron supervisor survives its parent and keeps restarting Electron                                                                                          |         0 |        1 |         12 | bug, accepted, via-triage        |
| #17870 | macOS desktop: preview screencast leaves "Capturing" wake lock held, Mac never idle-sleeps                                                                                |         0 |        1 |         15 | -                                |
| #17418 | [Bug]: Commands that Claude Code mods register never appear in the / menu                                                                                                 |         0 |        1 |         16 | -                                |
| #17362 | [Bug]: Desktop does not recover network access when Tailscale connects after launch                                                                                       |         0 |        1 |         17 | bug, via-triage                  |
| #16331 | [Bug]: Desktop-hosted T3 Connect keeps no record of the managed cloudflared's output                                                                                      |         0 |        1 |         19 | bug, via-triage                  |
| #15591 | [Bug]: Linux arm64 AppImage crashes on launch: GPU process launch failed (error_code=1002), FATAL GPU process isn't usable                                                |         0 |        1 |         21 | bug, via-triage                  |
| #15343 | [Bug]: Desktop app held a Chromium "Video Wake Lock" for 14 hours, so the Mac never turned off its display or locked                                                      |         0 |        1 |         22 | bug, via-triage                  |
| #14268 | SSH local forward survives desktop update and relaunch                                                                                                                    |         0 |        1 |         26 | bug, via-triage                  |
| #10719 | [Bug]: T3 Code 0.0.40 desktop UI: "T3 Code could not load"                                                                                                                |         0 |        1 |         47 | bug, accepted, via-triage        |
| #9429  | [Bug]: macOS desktop never refreshes the login-shell environment after launch — tools installed later (Homebrew, gh, opencode, nvm node) stay invisible to agents and VCS |         0 |        1 |         52 | -                                |
| #8944  | Versioned AppImage filename breaks desktop entries and symlinks on every update                                                                                           |         0 |        1 |         55 | -                                |
| #6096  | [Bug]: Desktop terminal (Cmd+J) forces viewport to bottom — cannot scroll scrollback without jump                                                                         |         0 |        1 |         75 | -                                |
| #5869  | [Bug]: Could not prepare the SSH environment: Error invoking remote method 'desktop:ensure-ssh-environment': SshCommandError: Host key verification failed.               |         0 |        1 |         77 | bug, needs-triage                |
| #4841  | [Bug]: Desktop window always reopens on the primary monitor, forgetting the display it was last used on                                                                   |         0 |        1 |         88 | -                                |
| #4812  | [Bug]: Nightly auto-update on macOS stalls at "Downloading (0%)" behind a TLS-inspecting proxy (Netskope)                                                                 |         0 |        1 |         88 | -                                |
| #2709  | Provider maintenance subprocesses don't inherit macOS system proxy settings                                                                                               |         0 |        1 |        163 | -                                |
| #24812 | Desktop preview snapshots time out after CDP relay reconnects                                                                                                             |         0 |        0 |          0 | -                                |
| #24527 | [Bug]: Desktop startup briefly warns about Codex provider status before its initial check completes                                                                       |         0 |        0 |          1 | -                                |
| #24514 | [Bug]: off-window Electron preview guests stall snapshots and block later captures                                                                                        |         0 |        0 |          1 | -                                |
| #24318 | [Bug]: t3 doctor --fix cannot get its exclusive lock when a desktop app on another machine relaunches the stopped server over SSH                                         |         0 |        0 |          1 | -                                |
| #24159 | [Bug]: Desktop app: server browser tabs never drain, so preview_open fails in every thread at 32                                                                          |         0 |        0 |          2 | -                                |
| #24101 | [Bug]: On macOS, a server restart reopens a closed window and steals focus                                                                                                |         0 |        0 |          2 | -                                |
| #24095 | Renaming an SSH connection leaves its remote server unmanaged, so desktop updates never replace it                                                                        |         0 |        0 |          2 | -                                |
| #24048 | macOS desktop main process hangs under swap pressure from uncapped agent children on a 16 GB Mac (0.1.0)                                                                  |         0 |        0 |          2 | -                                |
| #23864 | [Bug]: Trackpad swipes over inline HTML renders are dropped after a direction change (macOS desktop)                                                                      |         0 |        0 |          3 | -                                |
| #23843 | Desktop app stays running windowless after the "T3 home is unavailable" dialog and ignores Quit and SIGTERM                                                               |         0 |        0 |          3 | -                                |
| #23815 | [Bug]: Desktop app's `t3` on Windows still has no terminal for prompts: the #20162 stdin check never fires                                                                |         0 |        0 |          3 | -                                |
| #23619 | [Bug]: Copy image fails for data URL images in the desktop app                                                                                                            |         0 |        0 |          3 | -                                |
| #23604 | [Bug]: File links in remote threads open on the server, even when the file is on the desktop's machine                                                                    |         0 |        0 |          3 | bug, needs-triage                |
| #23378 | Desktop shows a fatal "HTTP 500" screen when the backend is busy for more than about 10 s after startup, because the bearer bootstrap budget allows only one attempt      |         0 |        0 |          3 | -                                |
| #23349 | Cursor SDK stall AbortError crashes the desktop backend                                                                                                                   |         0 |        0 |          3 | -                                |
| #22985 | Opening a thread with large reasoning blocks freezes the desktop window                                                                                                   |         0 |        0 |          4 | via-triage                       |
| #22951 | [Bug]: WSL backend goes offline after restart: duplicate desktop-bootstrap exchange revokes the cached session                                                            |         0 |        0 |          4 | -                                |
| #22882 | [Bug]: Desktop webview that attaches after the 10-second wait leaves the agent on the headless page with no signal                                                        |         0 |        0 |          4 | -                                |
| #22449 | [Bug]: macOS desktop holds Secure Event Input with no password field focused, breaking global hotkeys                                                                     |         0 |        0 |          5 | -                                |
| #17392 | [Bug]: Relative Markdown image in a remote thread shows the desktop's local file when the remote file is missing                                                          |         0 |        0 |         16 | -                                |
| #17155 | [Bug]: Desktop 0.0.45 thread.settle reports missing thread after successful relay thread load                                                                             |         0 |        0 |         17 | -                                |
| #17106 | [Bug]: Desktop: relay environment discovery never runs/retries when the app starts without network, remote T3 Connect environment stays "offline" until the next restart  |         0 |        0 |         17 | bug, needs-triage                |
| #16997 | Desktop nightly uses ~467 MB RAM across Electron processes                                                                                                                |         0 |        0 |         18 | -                                |
| #16589 | [Bug]: Desktop browser reports geolocation as granted but location requests time out on macOS                                                                             |         0 |        0 |         19 | -                                |
| #16405 | [Bug]: On battery with macOS Low Power Mode, a timed-out Codex status probe is never re-checked even with a focused client (balanced profile pauses provider refresh)     |         0 |        0 |         19 | -                                |
| #11494 | [Bug]: SnapShot shortcut stops working after the desktop portal restarts                                                                                                  |         0 |        0 |         42 | -                                |
| #11287 | [Bug]: Desktop SSH remote reconnect loop opens many short sessions and trips host UFW LIMIT (locks out other SSH)                                                         |         0 |        0 |         44 | -                                |
| #8671  | Linux AppImage renders embedded bitmap fonts as outlines instead of using native strikes                                                                                  |         0 |        0 |         57 | -                                |

### 15 mobile (105)

| #      | title                                                                                                                                                                     | reactions | comments | age (days) | labels                                     |
| ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | ------------------------------------------ |
| #7390  | [Bug]: iOS composer wedges — send stays disabled and the draft carries into other threads                                                                                 |         3 |        1 |         68 | -                                          |
| #24223 | [Bug]: Mermaid diagrams don't render in the mobile app                                                                                                                    |         3 |        0 |          2 | bug, needs-triage                          |
| #8035  | [Bug]: T3 Connect environment never appears in mobile app despite provisioned link and registered relay tunnel (Linux aarch64)                                            |         1 |        7 |         63 | -                                          |
| #17422 | [Bug]: Mobile composer stops saving typed text, so the send button stays disabled until the app restarts                                                                  |         1 |        4 |         16 | bug, via-triage                            |
| #24344 | [Bug]: Mobile 2.1.0 newly created threads become unavailable until app restart                                                                                            |         1 |        3 |          1 | -                                          |
| #17700 | [Bug]: Mobile composer says "cannot control this task" after one failed session refresh                                                                                   |         1 |        3 |         15 | -                                          |
| #22350 | [Bug]: Scrolling up a long thread on iPhone jerks backwards: LegendList's scrollBy corrections are overwritten during a drag and applied twice during momentum            |         1 |        2 |          5 | -                                          |
| #20428 | [Bug]: iOS thread Pin action targets a different thread and appears to lose sync                                                                                          |         1 |        2 |          8 | via-triage                                 |
| #16016 | Mobile new-thread transition briefly shows the old model after Send                                                                                                       |         1 |        2 |         20 | bug, needs more info, via-triage           |
| #8844  | [Bug]: T3 Connect fails to open environment: endpoint_request_failed on Windows → iOS                                                                                     |         1 |        2 |         55 | bug, needs-triage                          |
| #5639  | [Bug]: Android app does not trust user-installed CA certificates                                                                                                          |         1 |        2 |         79 | bug, needs-triage                          |
| #24332 | Opening an Android emulator on Windows also opens a foreground console                                                                                                    |         1 |        1 |          1 | -                                          |
| #16418 | [Bug]: iOS relay resume repeatedly waits on reconnection; Paseo comparison and recovery references                                                                        |         1 |        1 |         19 | -                                          |
| #17719 | [Bug]: iPad composer does not accept a screenshot dragged into it                                                                                                         |         1 |        0 |         15 | -                                          |
| #11617 | [Bug]: iOS app freezes on connecting to a terminal                                                                                                                        |         1 |        0 |         42 | bug, needs-triage                          |
| #19420 | [Bug]: iOS remote preview — "You have control" but taps never reach the tab; streams stuck on "Connecting to browser…" after refresh / for other tabs                     |         0 |        7 |         11 | via-triage                                 |
| #14869 | [Bug]: Shift+Enter does not insert a newline in iPad Safari web composer with Magic Keyboard                                                                              |         0 |        5 |         23 | -                                          |
| #12012 | [Bug]: iOS trash button does not remove a persisted environment                                                                                                           |         0 |        5 |         39 | bug, accepted, needs more info, via-triage |
| #13995 | [Bug]: iOS messages queued as "Sends on reconnect" are not sent while the target environment shows Connected                                                              |         0 |        4 |         28 | bug, via-triage                            |
| #10840 | Mobile: combine scroll-to-bottom button with working timer                                                                                                                |         0 |        4 |         47 | enhancement, accepted, via-triage          |
| #4889  | [Bug]: Android manual pairing rejects formatted codes and can report a false timeout                                                                                      |         0 |        4 |         87 | -                                          |
| #20982 | [Bug]: iPhone composer keeps the prompt text after it's sent                                                                                                              |         0 |        3 |          8 | via-triage                                 |
| #20087 | [Bug]: Repeated iPhone and Apple Watch notifications until pending input is addressed                                                                                     |         0 |        3 |          9 | via-triage                                 |
| #19059 | [Bug]: Codex image generation returned through functions.exec is invisible on Windows desktop and Android                                                                 |         0 |        3 |         12 | -                                          |
| #18732 | [Bug]: Android composer cursor moves to a different position after scrolling a long prompt                                                                                |         0 |        3 |         13 | via-triage                                 |
| #16905 | [Bug]: Android 1.4.0 environment stays disconnected with old server version until Remove and re-enable                                                                    |         0 |        3 |         18 | -                                          |
| #16614 | [Bug]: Expo Device Hub retains simulator capture sessions without clients and uses ~200% CPU                                                                              |         0 |        3 |         19 | bug, via-triage                            |
| #16507 | [Bug]: Swift iOS app ignores "Add project starts in" and always browses from ~/                                                                                           |         0 |        3 |         19 | bug, via-triage                            |
| #24192 | [Bug]: Mobile: opening a thread shows a blank view for 5+ s ("Loading messages..." then "Syncing messages...") even on fast Wi-Fi                                         |         0 |        2 |          2 | -                                          |
| #23367 | [Bug]: iOS Nightly LAN entry does not return after T3 Connect off/on/off cycle                                                                                            |         0 |        2 |          3 | -                                          |
| #22737 | Android NewTaskDraft initially reserves space for a native header it hides after mount                                                                                    |         0 |        2 |          4 | -                                          |
| #21962 | [Bug]: Android menus stay at their old position when the hinge moves the split while they're open                                                                         |         0 |        2 |          6 | bug, accepted, via-triage                  |
| #21183 | iOS app's WebSocket never negotiates permessage-deflate, so it downloads about 4× more than Android or desktop                                                            |         0 |        2 |          7 | -                                          |
| #21126 | [Bug]: iOS long-prompt editing is cramped and keyboard repeatedly dismisses and reopens                                                                                   |         0 |        2 |          7 | via-triage                                 |
| #20252 | [Bug]: iPad terminal output attachment sheet clips long output and hides the attach button                                                                                |         0 |        2 |          9 | bug, via-triage                            |
| #17716 | [Bug]: Mobile has no way to open a thread's linked PR from the header menu or Git menu                                                                                    |         0 |        2 |         15 | -                                          |
| #17297 | [Bug]: iOS TestFlight build 58 crashes with SIGSEGV in a stack guard region                                                                                               |         0 |        2 |         17 | -                                          |
| #16736 | [Bug]: Swift iOS: going back from a thread with the keyboard open leaves a blank keyboard-height area in the home thread list                                             |         0 |        2 |         18 | bug, via-triage                            |
| #16083 | Device setup hides iOS simulators that were never booted, and says no simulator is installed                                                                              |         0 |        2 |         20 | bug, needs more info, via-triage           |
| #15811 | [Bug]: Mobile usage chart bars are rounded at the bottom instead of the top (Android)                                                                                     |         0 |        2 |         20 | bug, via-triage                            |
| #15641 | [Bug]: iOS app stops responding during long turns: Reanimated commits starve React commits                                                                                |         0 |        2 |         21 | bug, needs more info, via-triage           |
| #15227 | [Bug]: Android Subscription usage widget lost the scrolling full list from #13474                                                                                         |         0 |        2 |         22 | bug, via-triage                            |
| #14463 | [Bug]: Shared terminal is clipped when desktop and native Android use different sizes                                                                                     |         0 |        2 |         25 | bug, via-triage                            |
| #13996 | [Bug]: SwiftUI app stops showing the running turn after a checkpoint-capture error; iOS app keeps updating                                                                |         0 |        2 |         28 | bug, via-triage                            |
| #12823 | [Bug]: Adaptive SVG project icon does not switch to white in iPhone dark mode                                                                                             |         0 |        2 |         34 | bug, accepted, needs more info, via-triage |
| #12756 | [Bug]: Android: terminal typing echo is abnormally slow (per-keystroke delay)                                                                                             |         0 |        2 |         35 | bug, accepted, via-triage                  |
| #12133 | [Bug]: iOS: Opening Thread while in Compaction                                                                                                                            |         0 |        2 |         39 | bug, via-triage                            |
| #5061  | [Bug]: iOS Local Network permission sheet leaves pairing stuck until force-quit                                                                                           |         0 |        2 |         86 | needs more info                            |
| #24530 | [Bug]: Mobile shows an offline machine's cached threads as current, with stale settle/snooze state                                                                        |         0 |        1 |          1 | -                                          |
| #24509 | [Bug]: iOS app crashes constantly and the composer renders broken since ~Oct 17                                                                                           |         0 |        1 |          1 | -                                          |
| #24213 | [Bug]: iPhone New thread composer truncates the selected model name to "G...”                                                                                             |         0 |        1 |          2 | bug, needs-triage                          |
| #23722 | [Bug]: Windows image paths fail on mobile after Markdown renderer replacement                                                                                             |         0 |        1 |          3 | -                                          |
| #23237 | [Bug]: Mobile Add Project fails when the destination is already a project                                                                                                 |         0 |        1 |          3 | -                                          |
| #23015 | [Bug]: Preview tabs can't be seen from mobile and all automation times out (Windows desktop unattended)                                                                   |         0 |        1 |          4 | -                                          |
| #22751 | [Bug]: Android composer hidden after dragging T3 from taskbar beside Chrome                                                                                               |         0 |        1 |          4 | -                                          |
| #22543 | [Bug]: iPad sidebar hides the newest thread under the header on iPadOS 18                                                                                                 |         0 |        1 |          5 | bug, accepted, via-triage                  |
| #22484 | [Bug]: Android keyboard state remains hidden after nonanimated IME recovery                                                                                               |         0 |        1 |          5 | -                                          |
| #21685 | [Feature]: Android: send message with a hardware keyboard (Enter or Ctrl+Enter)                                                                                           |         0 |        1 |          6 | -                                          |
| #19398 | Paired clients memorize host:port endpoints and never refresh them: a backend port change permanently breaks remote devices (mobile 10 s timeout) until manual re-pairing |         0 |        1 |         11 | needs more info                            |
| #17888 | [Bug]: iOS voice input drops opening words when speaking immediately after tapping the microphone                                                                         |         0 |        1 |         15 | needs more info                            |
| #17213 | [Bug]: iOS new thread defaults to a disconnected environment when a project exists on multiple machines                                                                   |         0 |        1 |         17 | bug, via-triage                            |
| #15659 | [Bug]: Mobile: @ picker lists threads under a "Files" heading, mixed in with files                                                                                        |         0 |        1 |         21 | bug, via-triage                            |
| #15453 | [Bug]: iOS terminal output cannot be selected or copied, blocking login flows                                                                                             |         0 |        1 |         21 | bug, via-triage                            |
| #15225 | [Bug]: Android Subscription usage widget can no longer be resized smaller than 4×3                                                                                        |         0 |        1 |         22 | bug, via-triage                            |
| #15158 | [Bug]: Android widget picker shows the app icon instead of a preview for Subscription usage                                                                               |         0 |        1 |         22 | bug, via-triage                            |
| #14464 | [Bug]: Native Android terminal jumps upward when the keyboard opens                                                                                                       |         0 |        1 |         25 | bug, via-triage                            |
| #13925 | [Bug][Mobile] Android: scrolling a long, settled thread is janky                                                                                                          |         0 |        1 |         28 | bug, accepted, via-triage                  |
| #12754 | [Bug]: Android: scroll-to-bottom arrow is shown even when already scrolled to the very bottom                                                                             |         0 |        1 |         35 | bug, accepted, via-triage                  |
| #10956 | [Bug]: Mobile composer loses focus after selecting skill via $ / / — requires re-tapping textbox                                                                          |         0 |        1 |         46 | bug, accepted, via-triage                  |
| #10864 | Define shared iOS and Android activity expiry policy                                                                                                                      |         0 |        1 |         47 | enhancement, accepted, via-triage          |
| #10781 | Codex plan badge stays stale after downgrade, and mobile hides the model-access error                                                                                     |         0 |        1 |         47 | bug, via-triage                            |
| #8140  | [Bug]: Android: Pressing enter in terminal with physical keyboard selects entire terminal                                                                                 |         0 |        1 |         62 | bug, needs-triage                          |
| #7170  | [Bug]: iOS 1.0.3 cannot exchange relay DPoP access token (invalid_dpop) — T3 Connect, notifications, and Live Activities all fail                                         |         0 |        1 |         70 | -                                          |
| #24796 | [Bug]: High reported Android battery consumption during send-and-leave usage                                                                                              |         0 |        0 |          0 | -                                          |
| #24753 | [Bug]: Android: Back from a pull request opened in a thread lands on the PR list instead of the thread                                                                    |         0 |        0 |          0 | -                                          |
| #24694 | [Bug]: Mobile terminal paste button is hidden off-screen in the scrolling toolbar                                                                                         |         0 |        0 |          0 | -                                          |
| #24677 | [Bug]: Mobile wakeup health probe drops live sessions on high-RTT routes (Tailscale DERP, VPN, public)                                                                    |         0 |        0 |          0 | -                                          |
| #24564 | [Bug]: Mobile: a model pick that was already delivered moves the thread back on a later message                                                                           |         0 |        0 |          1 | bug, needs-triage                          |
| #24448 | [Bug]: Android tablet launches in portrait letterbox while in landscape mode                                                                                              |         0 |        0 |          1 | bug, needs-triage                          |
| #24374 | [Bug]: Mobile: Stop in the background-work capsule sits between two navigation taps and stops all subagents without confirmation                                          |         0 |        0 |          1 | -                                          |
| #24306 | [Bug]: Android T3 Account stays Checking and all T3 Connect environments fail until app relaunch                                                                          |         0 |        0 |          1 | -                                          |
| #24305 | [Bug]: Android thread stays blank after Claude-to-Codex switch while server-side turns complete                                                                           |         0 |        0 |          1 | -                                          |
| #24303 | [Bug]: iOS composer taps meant for text input open the model selector                                                                                                     |         0 |        0 |          1 | -                                          |
| #24242 | [Bug]: Oversized "Settled thread" notification covers the thread list on iPhone                                                                                           |         0 |        0 |          2 | -                                          |
| #24228 | [Bug]: macOS host + Android: preview doesn't stream to Android until opened on desktop, then isn't interactive from Android                                               |         0 |        0 |          2 | -                                          |
| #24220 | [Bug]: iOS Device panel repeatedly reconnects when the selected video decoder cannot keep up                                                                              |         0 |        0 |          2 | -                                          |
| #23875 | [Bug]: Android app OpenCode models not showing                                                                                                                            |         0 |        0 |          3 | bug, needs-triage                          |
| #23731 | [Bug]: Android drops a direct environment with "stopped responding" when the server config snapshot is large (~1 MB+)                                                     |         0 |        0 |          3 | -                                          |
| #23693 | [Bug]: macOS 0.1.1 desktop times out opening its own local WebSocket; host appears Offline while phone connects                                                           |         0 |        0 |          3 | -                                          |
| #23013 | [Bug]: iOS thread search bar disappears after opening a thread and going back                                                                                             |         0 |        0 |          4 | -                                          |
| #22973 | [Bug]: iOS Subscription usage widget stays empty after opening the app, while Usage → Limits shows quotas                                                                 |         0 |        0 |          4 | -                                          |
| #20800 | [Bug]: iOS thread long-press menu opens without haptic feedback                                                                                                           |         0 |        0 |          8 | -                                          |
| #19512 | [Bug]: iOS Safari keyboard hides the web composer and scrolls the header off-screen                                                                                       |         0 |        0 |         11 | -                                          |
| #17940 | [Bug]: Mobile: a sent message stays pinned at the bottom of a thread when its echo is outside the loaded history window                                                   |         0 |        0 |         15 | -                                          |
| #17856 | [Bug]: Desktop and mobile Limits omit managed ChatGPT accounts without surfacing unsupported state                                                                        |         0 |        0 |         15 | -                                          |
| #17668 | [Bug]: iPhone chat shows "Image unavailable" for host-path Markdown images outside the project                                                                            |         0 |        0 |         15 | -                                          |
| #17643 | [Bug]: Swift iOS: tapping a delegated task in the Agents sheet fails with thread_not_found                                                                                |         0 |        0 |         16 | -                                          |
| #16549 | [Bug]: iPad (iOS app and Safari/Chrome web) reconnect-loops on a remote environment although the server sends the first config snapshot in ~250 ms                        |         0 |        0 |         19 | -                                          |
| #16462 | [Bug]: iPhone dictation into the collapsed composer clips a multi-line transcript to one line                                                                             |         0 |        0 |         19 | -                                          |
| #15974 | [Bug]: Mobile new-task draft is saved under Unsent but not resumed when navigating away                                                                                   |         0 |        0 |         20 | -                                          |
| #11713 | [Bug]: Device setup says no iOS Simulator is installed when xcode-select points at Command Line Tools                                                                     |         0 |        0 |         41 | -                                          |
| #10863 | Unify mobile notification delivery diagnostics across APNs and FCM                                                                                                        |         0 |        0 |         47 | -                                          |
| #8253  | Android terminal requires repeated Backspace presses with FUTO Keyboard                                                                                                   |         0 |        0 |         60 | -                                          |
| #8049  | [Bug]: T3 Code on iPad: project added on a T3 Connect environment does not show in New Task → Choose project                                                              |         0 |        0 |         62 | -                                          |
| #7981  | [Bug]: Android project filter omits recognized project favicons                                                                                                           |         0 |        0 |         63 | -                                          |

### 16 accessibility (8)

| #      | title                                                                                                                  | reactions | comments | age (days) | labels                          |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | ------------------------------- |
| #7907  | [Bug]: Files surface jumps scroll focus and throws "Line doesn't exist" with word wrapping activated                   |         0 |        3 |         64 | bug, needs-triage               |
| #23236 | Model picker opens empty Favorites after disabling a provider and leaves its favorites inaccessible                    |         0 |        2 |          3 | -                               |
| #13959 | Sidebar thread row actions are unreachable with screen readers                                                         |         0 |        2 |         28 | bug, via-triage                 |
| #23081 | [Bug]: Earlier chat history disappears from UI after context compaction, but remains accessible through t3_thread_read |         0 |        1 |          4 | bug, needs-julius, needs-triage |
| #19220 | [Bug]: snapshot accessibility decodes PNGs again just to read their dimensions                                         |         0 |        1 |         11 | -                               |
| #23760 | [Bug]: Screen reader heading wrap in a long thread lands mid-conversation instead of the first or last turn            |         0 |        0 |          3 | bug, needs-triage               |
| #23656 | [Bug]: Screen readers get no announcements while an agent works in a thread                                            |         0 |        0 |          3 | bug, needs-triage               |
| #23653 | [Bug]: Keyboard shortcuts that switch or change threads give no screen reader feedback (NVDA)                          |         0 |        0 |          3 | bug, needs-triage               |

### 17 typography-and-hierarchy (0)

_None flagged by the title keyword list. See Incomplete for candidates._

### 18 shape-spacing-elevation (2)

| #      | title                                                                                                                          | reactions | comments | age (days) | labels            |
| ------ | ------------------------------------------------------------------------------------------------------------------------------ | --------: | -------: | ---------: | ----------------- |
| #16091 | [Bug]: Wide table looks complete when the overflow edge lands on a column boundary                                             |         0 |        2 |         20 | bug, via-triage   |
| #8164  | [Bug]: Bare-root worktree layouts are silently accepted as a normal repo, making the project root the parent of every worktree |         0 |        2 |         61 | bug, needs-triage |

### 19 motion (1)

| #      | title                                | reactions | comments | age (days) | labels                            |
| ------ | ------------------------------------ | --------: | -------: | ---------: | --------------------------------- |
| #10250 | Assess discrete task progress motion |         0 |        4 |         49 | enhancement, accepted, via-triage |

### 20 copy-and-voice (2)

| #      | title                                                                                                                  | reactions | comments | age (days) | labels |
| ------ | ---------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | ------ |
| #9056  | [Bug]: WSL backend binds 0.0.0.0 while "Network access" is off and the UI says "Limited to this machine"               |         0 |        2 |         54 | -      |
| #24342 | [Bug]: Orchestrator MCP can't reorder threads, though the UI and server support it (thread.active.reorder not exposed) |         0 |        0 |          1 | -      |

### 21 keyboard-shortcuts-ux (8)

| #      | title                                                                                           | reactions | comments | age (days) | labels                    |
| ------ | ----------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | ------------------------- |
| #12589 | [Bug]: SnapShots can't be set up on GNOME 45–47: no GlobalShortcuts portal                      |         1 |        2 |         36 | bug, accepted, via-triage |
| #18167 | [Bug]: Pressing Enter in a confirmation dialog cancels instead of confirming                    |         0 |        3 |         14 | bug, via-triage           |
| #17021 | [Bug]: Main Sidebar toggle via cmd+B works intermittently                                       |         0 |        2 |         17 | bug, needs-triage         |
| #21789 | [Bug]: Cmd+1 to Cmd+9 thread shortcuts do nothing in narrow windows while the sidebar is closed |         0 |        1 |          6 | -                         |
| #7700  | [Bug]: The browser's select tool keyboard shortcuts are unreliable                              |         0 |        1 |         66 | bug, needs-triage         |
| #5079  | [Bug]: browser zoom (ctrl+plus/minus) breaks file picker                                        |         0 |        1 |         86 | bug, needs-triage         |
| #23425 | New-thread keyboard shortcuts do nothing on the Usage page even though the sidebar shows them   |         0 |        0 |          3 | -                         |
| #22379 | [Bug]: open project shortcut                                                                    |         0 |        0 |          5 | bug, needs-triage         |

### 22 performance-feel (15)

| #      | title                                                                                                                                                                            | reactions | comments | age (days) | labels                        |
| ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------: | -------: | ---------: | ----------------------------- |
| #18165 | [Bug]: Windows: resident server-browser host's chrome-headless-shell GPU process (SwiftShader) busy-spins ~5 cores for hours while idle                                          |         2 |        7 |         14 | bug, needs-julius, via-triage |
| #20931 | [Bug]: ManagedOOMPreference=avoid in t3code.service puts systemd --user into a 100% CPU loop with uresourced (Fedora/GNOME)                                                      |         1 |        1 |          8 | bug, accepted, via-triage     |
| #17531 | Claude provider hangs on Bash calls when a UI-dependent Claude Code mod (e.g. blast-radius) is installed                                                                         |         0 |        4 |         16 | -                             |
| #14699 | [Bug]: SwiftUI: an unresponsive passive environment delays cold start of the active one                                                                                          |         0 |        3 |         23 | bug, via-triage               |
| #7231  | [Bug]: One slow foreground health probe tears down a live session and disables the composer                                                                                      |         0 |        3 |         70 | -                             |
| #23962 | [Bug]: A two-minute stall of the shared OpenCode server under tool CPU load fails every OpenCode thread, though the server recovers                                              |         0 |        2 |          2 | -                             |
| #10728 | [Bug]: installed hosting CLI reported as missing when the PATH entry is slower than the 5s discovery probe                                                                       |         0 |        2 |         47 | -                             |
| #19442 | [Bug]: Agent preview recordings ignore the "Browser recording frame rate" setting and are capped at 30 fps                                                                       |         0 |        1 |         11 | bug, accepted, via-triage     |
| #17538 | [Bug]: Streamed browser hover and clicks lag behind stale queued pointer events                                                                                                  |         0 |        1 |         16 | -                             |
| #14691 | [Bug]: SwiftUI: one slow passive environment delays home updates from every other environment                                                                                    |         0 |        1 |         23 | bug, via-triage               |
| #5605  | Chat backend (SDK createQuery) never surfaces tools from slow-connecting plugin MCP servers, despite /mcp reporting them connected                                               |         0 |        1 |         79 | -                             |
| #24660 | [Bug]: All read-only queries share one SQLite reader with one permit, so one slow read blocks every other read; ensureTranscript also re-queries native V2 threads on every call |         0 |        0 |          0 | -                             |
| #24165 | Muse provider always Unavailable on Windows: Muse starts ~4s slower inside a job object and the version probe allows 4s                                                          |         0 |        0 |          2 | -                             |
| #24083 | [Bug]: Checkpoint refs are never pruned and make git fetch slow enough to break Claude thread starts                                                                             |         0 |        0 |          2 | -                             |
| #23937 | [Bug]: Standalone Codex update succeeds but stays outdated when native latest lags npm                                                                                           |         0 |        0 |          2 | -                             |

### 23 customisation-gap (1)

| #      | title                                                              | reactions | comments | age (days) | labels |
| ------ | ------------------------------------------------------------------ | --------: | -------: | ---------: | ------ |
| #23757 | [Bug]: No project entry ignores custom name and icon in some views |         0 |        0 |          3 | -      |

### 24 onboarding-gap (3)

| #      | title                                                                                                        | reactions | comments | age (days) | labels                    |
| ------ | ------------------------------------------------------------------------------------------------------------ | --------: | -------: | ---------: | ------------------------- |
| #17216 | [Bug]: T3 Connect public MCP URL is not discoverable in a single-machine setup                               |         4 |        2 |         17 | -                         |
| #10961 | [Bug]: Session import is unreachable after onboarding, so externally started sessions can never be imported  |         3 |        6 |         46 | -                         |
| #21755 | Session import ignores compressed Codex rollouts (`.jsonl.zst`), so their conversations are never discovered |         0 |        2 |          6 | bug, accepted, via-triage |

## Hot clusters

Ten most-repeated complaints. A trailing * marks a member the keyword list did not flag; it is included because it is the same complaint. Clusters were formed from titles only (bodies and cross-links not read), so treat membership as likely, not confirmed. Cluster size is the count of open issues sharing the problem.

1. **Model or effort shown in the composer or picker does not match what runs or persists** (area 04 composer; 10 issues): #6508, #16444, #16526, #17110, #24115, #16016, #24564, #23497, #17556*, #24214
2. **In-app browser preview: automation and snapshots stall, disconnect, or report the wrong tab** (area 06 terminal-and-panels; 8 issues): #16901, #23936, #24812, #24514, #24159, #19912*, #23514, #23015
3. **Keyboard shortcuts silently do nothing or fail in some views and window sizes** (area 21 keyboard-shortcuts-ux; 7 issues): #21789, #17021, #23425, #16542, #15954, #7700, #10161
4. **New sidebar regressions: flicker, unreachable scope, grouping, collapse state, layout** (area 01 app-shell; 7 issues): #7766, #15572, #16692, #16445, #24191, #22543, #16387
5. **Copy and paste fail or copy the wrong text (terminal, code blocks, diffs, files, images)** (area 03 thread-view; 7 issues): #8361, #23930, #20207, #15927, #23619, #21006, #24694
6. **Composer text is lost, carried over, or dropped after send, thread switch, or paste** (area 04 composer; 6 issues): #7390, #17422, #20982, #15974, #8963, #16985
7. **Mobile keyboard covers, dismisses, or cramps the composer and terminal** (area 15 mobile; 6 issues): #19512, #21126, #14464, #22484, #14869, #22751
8. **Toast and notification noise: repeated, oversized, stuck, or spurious alerts** (area 12 notifications-errors-toasts; 6 issues): #24242, #20087, #23734, #20883, #24028, #24477
9. **Screen reader gaps: no announcements, unreachable row actions, wrong focus targets** (area 16 accessibility; 6 issues): #23653, #23656, #23760, #13959, #24203, #10390
10. **Auto-pin and scroll-to-bottom control fight the user while a turn streams** (area 03 thread-view; 5 issues): #20366, #13706*, #17940, #12372, #12754

## Already reported index

One line per audit area: UI-relevant open issues, most-reacted first. Cite these numbers in audit findings.

- 01 app-shell (7): #7766, #5369, #15572, #11476, #22586, #16445, #15238
- 02 thread-list (0): none
- 03 thread-view (23): #20366, #17363, #17564, #12372, #20427, #15461, #8701, #20246, #11985, #23930, #10156, #6065, #24120, #22181, #17895, #16195, #24279, #24191, #24183, #24166, #23730, #23714, #23507
- 04 composer (29): #8388, #13978, #16408, #22820, #22076, #17651, #16444, #16105, #24115, #22989, #22537, #21967, #17110, #15531, #14231, #7557, #4253, #24459, #23221, #17124, #16526, #13628, #8963, #24371, #24203, #24018, #23497, #22429, #16985
- 05 diff-and-review (24): #8234, #11078, #12943, #13279, #7076, #18618, #18300, #12902, #24017, #22806, #15843, #11835, #22319, #22315, #20207, #19828, #19787, #19781, #17674, #11571, #8640, #8204, #24146, #23575
- 06 terminal-and-panels (29): #16901, #8450, #16030, #20364, #15927, #15579, #21022, #19536, #11402, #22300, #22095, #20899, #19530, #17483, #24154, #23514, #20535, #16923, #10494, #6337, #5540, #24745, #24175, #23704, #23513, #23021, #22988, #22468, #19492
- 07 settings-appearance (2): #17233, #21008
- 08 settings-project-and-keybindings (6): #6508, #14991, #22793, #19930, #16542, #15073
- 09 providers-and-auth (19): #15992, #16745, #11871, #17471, #16636, #11739, #19155, #21061, #16846, #15725, #19025, #3142, #24131, #22405, #16067, #24322, #24214, #23365, #23104
- 10 first-run-and-empty-states (8): #19520, #21746, #20436, #20232, #7212, #24323, #23916, #22865
- 11 remote-access-and-pairing (2): #21107, #14746
- 12 notifications-errors-toasts (13): #15993, #23006, #22819, #18799, #17808, #15702, #24477, #20883, #12979, #24831, #24253, #23734, #9886
- 13 loading-and-skeletons (3): #16692, #23661, #23494
- 14 desktop-specific (98): #10161, #15001, #8361, #23936, #22461, #12689, #861, #23109, #22942, #17965, #17009, #13046, #19079, #16114, #15954, #17737, #17367, #11872, #10193, #22024, #21954, #20345, #19696, #15143, #14730, #14259, #12103, #10997, #10499, #5236, #23788, #23041, #22990, #22983, #21235, #20897, #18729, #17476, #16826, #16387, #15426, #10517, #10390, #24094, #24028, #23470, #23372, #22816, #22626, #22250, #21889, #21189, #21006, #19119, #19109, #17870, #17418, #17362, #16331, #15591, #15343, #14268, #10719, #9429, #8944, #6096, #5869, #4841, #4812, #2709, #24812, #24527, #24514, #24318, #24159, #24101, #24095, #24048, #23864, #23843, #23815, #23619, #23604, #23378, #23349, #22985, #22951, #22882, #22449, #17392, #17155, #17106, #16997, #16589, #16405, #11494, #11287, #8671
- 15 mobile (105): #7390, #24223, #8035, #17422, #24344, #17700, #22350, #20428, #16016, #8844, #5639, #24332, #16418, #17719, #11617, #19420, #14869, #12012, #13995, #10840, #4889, #20982, #20087, #19059, #18732, #16905, #16614, #16507, #24192, #23367, #22737, #21962, #21183, #21126, #20252, #17716, #17297, #16736, #16083, #15811, #15641, #15227, #14463, #13996, #12823, #12756, #12133, #5061, #24530, #24509, #24213, #23722, #23237, #23015, #22751, #22543, #22484, #21685, #19398, #17888, #17213, #15659, #15453, #15225, #15158, #14464, #13925, #12754, #10956, #10864, #10781, #8140, #7170, #24796, #24753, #24694, #24677, #24564, #24448, #24374, #24306, #24305, #24303, #24242, #24228, #24220, #23875, #23731, #23693, #23013, #22973, #20800, #19512, #17940, #17856, #17668, #17643, #16549, #16462, #15974, #11713, #10863, #8253, #8049, #7981
- 16 accessibility (8): #7907, #23236, #13959, #23081, #19220, #23760, #23656, #23653
- 17 typography-and-hierarchy (0): none
- 18 shape-spacing-elevation (2): #16091, #8164
- 19 motion (1): #10250
- 20 copy-and-voice (2): #9056, #24342
- 21 keyboard-shortcuts-ux (8): #12589, #18167, #17021, #21789, #7700, #5079, #23425, #22379
- 22 performance-feel (15): #18165, #20931, #17531, #14699, #7231, #23962, #10728, #19442, #17538, #14691, #5605, #24660, #24165, #24083, #23937
- 23 customisation-gap (1): #23757
- 24 onboarding-gap (3): #17216, #10961, #21755

## Incomplete

- Area 02 thread-list and area 17 typography have no keyword-flagged issues. The keyword list has no thread-list terms, so 02 is empty by construction. Non-flagged candidates (titles that mention threads plus a list-type word; not reviewed; not counted in the totals): #17845 (1 reaction), #24563 (0 reactions), #24519 (0 reactions), #24136 (0 reactions), #23726 (0 reactions), #23600 (0 reactions), #22372 (0 reactions), #22304 (0 reactions).
- Area 17 typography is empty because font-related titles were mapped to 07 settings-appearance, which comes earlier in the rule order.
- Area mapping is first-match keyword rules plus 13 manual overrides (11 for titles that matched no rule or matched a poor rule, 2 more for clear misfiles). Mapping was checked against titles only, not bodies, so expect some misfiles (for example, 22 and 09 contain backend bugs that matched performance or provider words).
- Areas 14 and 15 contain about half of the UI-relevant set. Most are platform bug reports (Electron, iOS, Android), not UX findings. They are kept because the keyword rules flag them.
- Reaction counts come from the `reactionGroups` fields returned by `gh`. Comment counts are the lengths of the `comments` arrays. These were not cross-checked against GraphQL totals per issue.
- Hot-cluster membership is judged from titles only. Bodies, linked PRs, and duplicate-of links were not read, so a cluster may include a near-duplicate that is not the same root cause.
- Closed issues are excluded by design. Issues with no reactions are included with 0 reactions.
- No screenshots, repro steps, or maintainer labels were checked beyond the listed labels.
