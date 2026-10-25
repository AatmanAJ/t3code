# Area 11: remote-access-and-pairing

Audit of the pairing landing, the connection surfaces in Settings, the guest page, the connection banners and the version-skew flow, on the running dev app (`http://localhost:5733`, Chromium 1.64 via Playwright, macOS), light and dark, 1440x900 and 390x844. Findings use the id prefix `F-11-`. Screenshots live in `ui-overhaul/screens/11-remote-access-and-pairing/` (about 110 files, named `11-<state>-<theme>-<WxH>.png`; every capture was checked for tokens, QR payloads and personal data, see "Incomplete" for what was masked).

**Code read:** `routes/{pair,connect,connect-agent,guest}.tsx`, `components/auth/*`, `components/clerk/*`, `components/cloud/*`, `components/guest/GuestPage.tsx` and `components/chat/GuestShareControls.tsx`, `components/settings/{ConnectionsSettings,AuthorizedClientsSettings,SavedEnvironmentRows,AddEnvironmentDialog,ConnectionDiagnosisDetails,FoldedSettingsSection,EnvironmentRow,EnvironmentRoutesList,SessionPermissions,LocalEnvironmentSetting}.tsx`, `components/{ConnectionStatusDot,ServerUpdateAction,EnvironmentMachineIcon,ProjectEnvironmentBadge,PermissionUpdateNotice,BranchToolbarEnvironmentSelector}.tsx`, `components/chat/{useSystemComposerBanners,ComposerPrimaryActions}.tsx`, `components/ui/{qr-code,standalone-page}.tsx`, `environments/primary/auth.ts`, `hostedPairing.ts`, `pairingUrl.ts`, `versionSkew.ts`, `packages/client-runtime/src/connection/{supervisor,diagnosis,presentation,wakeups}.ts`, `packages/contracts/src/auth.ts`, `docs/internals/{connection-runtime,environment-auth,remote,t3-connect}.md`.

**What was exercised live:** bare origin with no cookie; first pairing; consumed, expired, mistyped, lower-case and whitespace-padded tokens; network failure during pairing; a link opened in an already-paired browser; a read-only (`orchestration:read` + `relay:read`) session; Settings -> Connections with probe sessions, links, Create link, Share/QR, reveal dialog (clipboard API removed), revoke; `/connect-agent` with a real stateless client registration (not approved); `/guest` with invalid, share-only and fake-invite entries (redeem fails, nothing created); hard WebSocket close and silent stall via `page.routeWebSocket`; revoke of a live session from a second browser; version skew by rewriting `serverVersion` and capabilities in the server-config frames; two unreachable saved environments injected into a context-only IndexedDB catalog; Add environment dialog; settings search; fold header at 390/430/480/520/600/768/800/1024; contrast of small text and dots by canvas sampling; QR decode with `jsQR` (outside the repo). Probe sessions and links were revoked from Settings -> Connections at the end (the revoke itself is finding F-11-13).

**Code-read only (not reachable on this host):** hosted pairing (`/pair?host=...`, needs the hosted origin), `/connect` (needs the hosted origin plus Clerk config), every signed-in or signed-out T3 Connect state, relay status, the hold-webhooks row, guest-link creation and the owner-side guest UI (needs T3 Connect plus Beta flag), the guest thread view, "Still connecting" at boot (see F-10-01/F-14-03), updating a server (never clicked).

## Summary

| ID      | Sev | Title                                                                                                           |
| ------- | --- | --------------------------------------------------------------------------------------------------------------- |
| F-11-01 | P2  | `/pair` is a dead end: it never says how to get a token and carries no brand mark                               |
| F-11-02 | P1  | A mistyped, consumed and expired token all say "Check the token and try again"                                  |
| F-11-03 | P1  | The pairing code is case-sensitive but the field turns auto-capitalisation off                                  |
| F-11-04 | P2  | Auth failures show internals: operation ids, HTTP 500, CORS, "unknown app"                                      |
| F-11-05 | P2  | The pair form loses focus on failure, has no `aria-invalid`, no landmark, and "Reload app" drops the token      |
| F-11-06 | P2  | A link token is echoed in a visible text field and stays there after failure                                    |
| F-11-07 | P1  | Opening a pairing link in an already-paired browser redeems it and revokes that browser's session               |
| F-11-08 | P2  | Auth pages are a separate visual dialect: gradients, blur, `shadow-2xl`, literal hex, two eyebrows              |
| F-11-09 | P2  | Hosted pairing page: "Backend" wording, a retry that contradicts its own advice, CORS jargon (code-read)        |
| F-11-10 | P2  | Guest landing pages carry no brand, no sharer and two error voices                                              |
| F-11-11 | P2  | Guest composer is hand-rolled: 32 px send, `rounded-3xl`, off the 22 px composer (code-read)                    |
| F-11-12 | P2  | Owner guest dialog shows the link once, drops the expiry line, and "Stop sharing" outlives the link (code-read) |
| F-11-13 | P1  | Revoke and "Revoke others" are immediate with no confirm, and unlabeled clients look identical                  |
| F-11-14 | P1  | The "Authorized clients" header overlaps its own title below about 520 px                                       |
| F-11-15 | P2  | The MCP URL is still undiscoverable on a single machine (#17216)                                                |
| F-11-16 | P1  | There is no app-level connection indicator, and the machine section keeps saying "Up to date" during an outage  |
| F-11-17 | P1  | The "reconnecting" banner has no retry, no countdown, and recovery lags up to 5 minutes (#22024)                |
| F-11-18 | P1  | A revoked session shows "reconnecting / did not answer" forever and never routes to `/pair`                     |
| F-11-19 | P1  | The per-server "Update" button restarts a server with no confirmation and no running-thread count               |
| F-11-20 | P2  | One machine has six names and one secret has five                                                               |

Counts: P0 0, P1 9, P2 11, P3 0 (20 findings). Observations that were measured but not promoted (to stay terse) are one-liners under "Needs deeper look".

## Measured timelines

**Primary connection lost mid-session** (thread view of a seed thread, `page.routeWebSocket` on `/ws`; "hard close" = the socket is closed with 1006 and every new socket is closed at once; "stall" = frames are dropped in both directions and new sockets never open; the dev server is untouched). Screenshots: `11-disconnect-close-*`, `11-disconnect-stall-*`, `11-disconnect-banner-*`.

| Event                                                                             | Hard close     | Silent stall                             |
| --------------------------------------------------------------------------------- | -------------- | ---------------------------------------- |
| t+0                                                                               | sockets closed | frames dropped                           |
| Send button `aria-label` flips to "Environment disconnected"                      | t+1.04 s       | t+16.9 s (15 s ping timeout + about 2 s) |
| Banner "MacBook Pro is reconnecting" with "T3 Code on MacBook Pro did not answer" | t+3.27 s       | t+18.97 s                                |
| Further change in the next 60 s (countdown, attempt count, retry button)          | none           | none                                     |
| Connection restored at t+61 s: banner gone                                        | +52.1 s        | +25.7 s                                  |
| "Reconnected" toast or any confirmation                                           | none           | none                                     |

`supervisor.ts:127-130` makes the n-th retry wait `ceiling/2 .. ceiling` with `ceiling = min(300 s, 1 s * 2^(n+1))`: 1-2, 2-4, 4-8, 8-16, 16-32, 32-64, 64-128, 128-256, then 150-300 s. A user who sees the banner at 60 s waits up to 64 s for the next attempt, at 4 minutes up to 5 minutes. The grace before the banner is `ENVIRONMENT_RECONNECT_WARNING_GRACE_MS = 2_000` (`ChatView.logic.ts:114`). The only control whose state changed during the outage was the Send button (about 455 controls compared before and during); Settle, Snooze, Commit, Open diff, fork, terminal and the model picker stay enabled.

**Where the banner shows** (8 s into a hard close): thread route yes; the draft route yes; `/pull-requests` no (skeleton list, see "Needs deeper look"); `/usage` no; `/settings/general` no; `/settings/connections` no.

**Revoked session** (a second browser revoked the first one from Settings -> Connections): banner at t+3.6 s, "T3 Code on MacBook Pro did not answer" at t+4.4 s, unchanged for 100 s while the client called `/api/auth/session` 10 times and got 200 (`authenticated:false`); a manual reload goes to `/pair`.

**First pairing:** token submit to landed app about 750 ms (`POST /api/auth/browser-session` 200, `history.replace('/')`, `window.location.reload()`); the app opens an existing thread, not a draft (F-10-03).

## Findings

### Pairing landing (`/pair`, bare origin)

### F-11-01 `/pair` is a dead end: it never says how to get a token and carries no brand mark

- Severity: P2
- Surface: web
- Evidence: `components/auth/PairingRouteSurface.tsx:134-136, 279-291`; `components/ui/standalone-page.tsx:61`; `ui-overhaul/screens/11-remote-access-and-pairing/11-bare-origin-light-1440x900.png`, `-dark-1440x900.png`, `-light-390x844.png`. A browser with no cookie that opens `http://localhost:5733/` is sent to `/pair` and sees "Pair with this environment", one field, "Continue", "Reload app" and a grey box: "This environment accepts one-time pairing tokens. Pairing links can open this page directly, or you can paste the token here."
- Current: the box restates what the form already says and never tells the person where a token comes from. Someone who typed the host into a phone has no next step in the product (the commands are `t3 pair` and Settings -> Connections -> Create link, both in `docs/user/remote-access.md`). The only identity on the card is the 11 px eyebrow "T3 CODE (DEV)".
- Proposed: in `describeSupportedMethods` return, for the `one-time-token` case, "Create one on the machine running T3 Code: Settings -> Connections -> Create link, or run `t3 pair`." with the command in `<code className="font-mono text-foreground">` (DNA-T7), same container classes (`rounded-lg border border-border/70 bg-background/55 px-3 py-3 text-xs`). Put `T3Wordmark` (`components/T3Wordmark.tsx`, `h-5`) above the eyebrow so the card is recognisable as T3 Code before any text is read. Keep the `desktop-bootstrap` branches as they are. Use "pairing token" consistently (see F-11-20).
- DNA: DNA-V5 (explain in place, once, briefly), DNA-V3, DNA-ID1 (recognisable product).
- Effort: XS
- Risk: string-only plus one import; `PairingRouteSurface` has no string assertions (`bootstrap.test.ts` covers `environments/primary` only).
- Upstream-eligible: yes (copy fix, one component).
- #24865: not addressed

### F-11-02 A mistyped, consumed and expired token all say "Check the token and try again"

- Severity: P1
- Surface: web
- Evidence: `environments/primary/auth.ts:75-80`; screenshots `11-pair-invalid-token-light-1440x900.png`, `11-pair-consumed-token-light-1440x900.png`, `-dark-1440x900.png`, `-dark-390x844.png`, `11-pair-expired-token-light-1440x900.png`. Reproduce: mint a link (`t3 pair --ttl 1m`), open it once, open it again, or wait out the TTL. `curl -X POST /api/auth/browser-session` returns the identical `{"_tag":"EnvironmentAuthInvalidError","reason":"invalid_credential"}` for an unknown, consumed or expired credential, so the client cannot tell them apart (by design).
- Current: after a link is used or expires (the default TTL is 5 minutes) the page says "Invalid pairing token. Check the token and try again." while the input still holds the spent token. Retrying cannot work; the person needs a new link.
- Proposed: change `PrimaryEnvironmentPairingCredentialRejectedError.message` to "Pairing token not accepted. It may be mistyped, expired or already used. Create a new one in Settings -> Connections, or run `t3 pair`." (title-then-reason, no "Invalid", DNA-V3; no server change). In `PairingRouteSurface.submitCredential`, when the rejected error comes from an auto-submitted URL token (`autoPairToken !== null`), call `setCredential("")` and focus the input, because that token is spent either way. Keep the typed value for hand-typed attempts so a typo can be fixed.
- DNA: DNA-V3 (say what failed, then why), DNA-V5.
- Effort: XS
- Risk: any test asserting the old string (grep `Invalid pairing token`: none found outside `auth.ts`); a server that later returns distinct reasons would let this split.
- Upstream-eligible: yes.
- #24865: not addressed

### F-11-03 The pairing code is case-sensitive but the field turns auto-capitalisation off

- Severity: P1
- Surface: web (mobile browsers; apps/mobile likely shares it, see area 15 and #4889)
- Evidence: `PairingRouteSurface.tsx:99-110` (`autoCapitalize="none"`); `apps/server/src/auth/PairingGrantStore.ts:252` (`PAIRING_TOKEN_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"`, 12 characters, no ambiguous glyphs); measured on a fresh 12-character code: exact upper case accepted, `"  CODE  "` accepted (trimmed), the same code in lower case rejected with the F-11-02 message (`a11-s7` run). The same field pattern exists in `AddEnvironmentDialog.tsx:392-401` and `ConnectAgentSurface.tsx:223-234` (`autoCapitalize="none"` on the latter).
- Current: the code is shown and copied in capitals (CLI "Token:", "Copy code"), a phone keyboard with auto-capitalisation off produces lower case, and the server rejects it with a message that blames the user for a typo that is not visible.
- Proposed: on the three inputs set `autoCapitalize="characters"`, add `className="font-mono uppercase tracking-wider"` so lower-case typing displays as the code (DNA-T7: machine-typed values are mono), and normalise in `submitServerAuthCredential` (`auth.ts:333-342`): `const compact = trimmed.replace(/[\s-]+/g, ""); const code = /^[2-9a-hj-np-z]{12}$/i.test(compact) ? compact.toUpperCase() : trimmed;` so the regex gate leaves bootstrap credentials and dev tokens untouched. No server change.
- DNA: DNA-V3, DNA-T7, DNA-X4 (phone-width web must work).
- Effort: S
- Risk: `bootstrap.test.ts` (add a normaliser case); credentials that happen to match 12 characters of that alphabet are still valid uppercase.
- Upstream-eligible: yes.
- #24865: not addressed

### F-11-04 Auth failures show internals: operation ids, HTTP 500, CORS, "unknown app"

- Severity: P2
- Surface: web
- Evidence: `auth.ts:65` renders "Primary environment request failed during exchange-bootstrap-credential (HTTP 500)." when the exchange cannot reach the server (screenshot `11-pair-network-failure-light-1440x900.png`); `auth.ts:91` "Timed out waiting for authenticated session after bootstrap."; `PairingRouteSurface.tsx:232-236` "Verify the backend is reachable from this browser, supports CORS for hosted clients, and is served over HTTPS..."; `ConnectAgentSurface.tsx:48, 154` and `11-connect-agent-bare-light-1440x900.png` ("This sign-in link names an unknown app."); `ConnectCliAuthSurface.tsx:38` renders literal backticks around `t3 connect` inside a plain-text string.
- Current: five different failures are described in the product's internal vocabulary. The status code 500 is also wrong for a connection that never completed (`readHttpApiStatus(...) ?? 500`).
- Proposed: map in `auth.ts`: `PrimaryEnvironmentRequestError` with no HTTP response -> "Could not reach T3 Code on this machine. Check that it is running, then try again."; timeout -> "Pairing worked but the session did not start. Reload and try again."; hosted alert -> "Check that the host is online, reachable from this browser and served over HTTPS."; `/connect-agent` -> "This sign-in link is not valid. Start the sign-in again from your agent."; render the `t3 connect` command in `<code>` instead of backticks. Keep the operation id in `console.error` only.
- DNA: DNA-V3, DNA-V6 (no theatre), DNA-T7.
- Effort: S
- Risk: strings are asserted nowhere that was found; keep the old text in the logged cause for support.
- Upstream-eligible: yes.
- #24865: not addressed

### F-11-05 The pair form loses focus on failure, has no `aria-invalid`, no landmark, and "Reload app" drops the token

- Severity: P2
- Surface: web
- Evidence: `PairingRouteSurface.tsx:46-65, 86-131`; `standalone-page.tsx:38-40`; measured after a failed submit: `document.activeElement` is `BODY` (the input is `disabled` while submitting, so focus is lost and never restored); the Alert has `role="alert"` but the input has no `aria-invalid` or `aria-describedby`; there is no `<main>` (the card is an unnamed `<section>`); `document.title` is "T3 Code (Dev)" in every state; after a network failure the token is still in the field but `stripPairingTokenFromUrl()` already removed it from the URL, so "Reload app" (`window.location.reload()`, L125) empties the form.
- Current: a keyboard user has to Tab back to the field after every failure and a "Reload app" click destroys the only copy of an unspent token.
- Proposed: keep a ref on the `Input` and call `inputRef.current?.focus()` when `setIsSubmitting(false)` follows an error; give the Alert `id="pairing-token-error"` and the input `aria-invalid={errorMessage !== ""}` plus `aria-describedby`; change the card `<section>` in `StandalonePage` to `<main>`; set the title with the existing document-title hook to "Pair - T3 Code (Dev)"; show "Reload app" only when no credential is typed, or rename it "Reload" and keep the token in `sessionStorage` across it. Disable-while-submitting stays but use `aria-disabled` plus `readOnly` so focus is kept.
- DNA: DNA-P8 (keyboard first), DNA-L8; protocol non-negotiable 6 (accessibility).
- Effort: S
- Risk: `StandalonePage` is shared with the error route (`RootRouteErrorView`); changing the element is safe, nothing queries `section`.
- Upstream-eligible: yes.
- #24865: not addressed

### F-11-06 A link token is echoed in a visible text field and stays there after failure

- Severity: P2
- Surface: web
- Evidence: `PairingRouteSurface.tsx:40-41` (`useState(autoPairToken ?? "")`), `:99-110`; the submitting state (`11-pair-submitting-light-1440x900.png`, masked for the audit) and every failure state show the one-time token in a plain `type="text"` input, with `autoComplete="off"`.
- Current: arriving by link puts a live credential in a readable, selectable field for the whole attempt, and on a network failure it stays on screen (screen share, shoulder surfing, a screenshot sent to support).
- Proposed: when the credential came from the URL, do not put it in React state; render the field empty and `disabled` with the placeholder "Using the token from your link" while submitting, and on failure show the empty field with the F-11-02 message. For hand-typed codes keep `type="text"` (people must see what they type).
- DNA: DNA-P3 (UI is truthful and minimal), protocol non-negotiable on privacy.
- Effort: XS
- Risk: the retry-after-network-failure path (`Continue` with an unspent token) needs the token kept in a ref instead of state; covered by no test today.
- Upstream-eligible: yes.
- #24865: not addressed

### F-11-07 Opening a pairing link in an already-paired browser redeems it and revokes that browser's session

- Severity: P1
- Surface: web (desktop browser too)
- Evidence: `environments/primary/auth.ts:301-322` (`bootstrapServerAuth`: `if (currentSession.authenticated && !urlCredential) return authenticated`, so a URL credential is exchanged even when a session exists); `routes/pair.tsx:18-24` redirects authenticated users only after that exchange. Reproduced: a context holding the shared admin cookie (`administrative-bootstrap`, all scopes) opened a fresh link; the new session row `probe-paired-open` was issued at `2026-10-25T14:25:06.648Z` and the old row's `revoked_at` is the same millisecond (read-only query of the synthetic dev database `auth_sessions`). The browser landed in the app with no message. This is how the shared Playwright session was lost during this audit (see "Incomplete").
- Current: pasting a link you just created (for your phone) into the browser you created it in consumes the link, replaces your session with the link's scopes (a read-only link demotes an admin browser) and tells you nothing. The phone then gets "Invalid pairing token".
- Proposed: in `bootstrapServerAuth`, when `currentSession.authenticated && urlCredential !== null`, do not exchange; return `{ status: "authenticated", pendingPairingToken: urlCredential }` and let `__root` show a confirm dialog through `requestConfirmDialog`: title "Replace this browser's session?", body "This browser is already paired with {label}. Opening this link signs it in again with the link's permissions, and the link can only be used once.", buttons "Keep current session" (default, strips the token from the URL) and "Replace session" (`variant="destructive"`). UI-only; the server keeps its replace semantics.
- DNA: DNA-P7 (every way in has a way out; a destructive door needs a guard), DNA-V2 (buttons name the action), AGENTS.md "Hit every surface" (connection modes).
- Effort: M
- Risk: `authGateState` is read by `__root.tsx` and `routes/pair.tsx`; add a case to `bootstrap.test.ts` and `httpLayer.test.ts` neighbours; the desktop bootstrap path (`getDesktopBootstrapCredential`) must stay unprompted.
- Upstream-eligible: yes (focused, fix-shaped; touches auth.ts glue only, no server change).
- #24865: not addressed

### F-11-08 Auth pages are a separate visual dialect: gradients, blur, `shadow-2xl`, literal hex, two eyebrows

- Severity: P2
- Surface: web, desktop
- Evidence: `components/ui/standalone-page.tsx:3-10, 24-36, 40` (three radial gradients in emerald, red, blue and sky plus a 145 degree linear ramp; card `rounded-2xl ... shadow-2xl shadow-black/20 backdrop-blur-md bg-card/90`); `components/auth/AuthSurfaceShell.tsx:14-25` (hex `#1e61de`, `#17348e`, `#2468df`, `#172f82`, `rgba(136,204,255,0.5)` masthead, painted for stable builds too); eyebrow `standalone-page.tsx:61` is 11 px / 0.18em muted while `ConnectAgentSurface.tsx:275` and `ConnectCliAuthSurface.tsx:26` are `text-3xs tracking-widest text-primary`. Measured: the light page background runs from `#e7e7e7` (top left) to `#fcfcfc` (canvas), a visible ramp; the card is 576 x 374 with an 18 px radius; dark is flat. `/pair` and `/connect-agent` are siblings but one has a masthead and the other none (`11-bare-origin-light-1440x900.png` vs `11-connect-agent-bare-light-1440x900.png`).
- Current: the first screen a remote user sees is the only place in the product with gradients, a green tinted glow ("pairing" tone) and a backdrop blur over a flat background (GPU cost, nothing to blur).
- Proposed: `StandalonePage`: delete `backdropClassNames` and the three gradient layers; page `bg-background`; card `rounded-2xl border border-border bg-card` with the popup shadow recipe `shadow-[0_16px_40px_-18px_rgb(0_0_0/55%)] dark:shadow-[0_18px_44px_-18px_rgb(0_0_0/80%)]` (the one `menu.tsx` uses) and no `backdrop-blur-md`; keep `tone` only to choose the error accent. One shared header: use `StandalonePageHeader` everywhere with eyebrow `text-2xs font-semibold tracking-widest text-muted-foreground uppercase` (DNA-T10), and give every auth surface the same masthead rule: Dev and Nightly keep `StageBackdropArt`, stable gets no masthead (DNA-K15), so the hex gradient in `AuthSurfaceShell` goes.
- DNA: DNA-ID2 (quiet flat canvas), DNA-ID3 (no gradients), DNA-C1 (tokens not literals), DNA-C2 (grey plus one blue), DNA-S4, DNA-P1, DRIFT-5/DRIFT-7.
- Effort: M
- Risk: `StandalonePage` also renders `RootRouteErrorView` and the not-found view (visual change there); no tests assert classes.
- Upstream-eligible: no (visual restyle; propose in Ideas first).
- #24865: partial (the radius scale moves `rounded-2xl` from 18 to 16 px; gradients, blur, shadow and hex are untouched)

### F-11-09 Hosted pairing page: "Backend" wording, a retry that contradicts its own advice, CORS jargon

- Severity: P2
- Surface: web (app.t3.codes), code-read only
- Evidence: `PairingRouteSurface.tsx:141-257`. Titles "Pairing backend", "Backend paired", "Pairing failed"; success body `"{label || "The environment"} is saved in this browser."`; error body `"{reason} If the backend accepted this one-time token, request a new pairing link before retrying."` beside a "Try again" button (L244-248) that resubmits the same token; static alert "supports CORS for hosted clients" (L232-236); "Open app" is `variant="outline"` and does `window.location.href = "/"` (full reload) with no automatic redirect; a link with no host or token ends with only the text "This pairing link is missing its backend host or token." and no action.
- Current: the page names the machine "backend" (the app says "environment", the onboarding says "computer"), offers an action its own copy warns against, and leaves the successful path one outline button away.
- Proposed: titles "Pairing environment", "Environment paired", "Pairing failed"; body on failure "{reason} The link may already have been used; if so, create a new one." and show "Try again" only for network-class errors (`canRetry` already distinguishes them); success: primary `Button` "Open app" (`variant="default"`) that uses router navigation, and auto-redirect after 1.5 s unless reduced-motion is off (a redirect is not motion; keep 1.5 s); replace the CORS sentence with F-11-04's wording; missing-link state gets "Open app" too.
- DNA: DNA-V7 (one vocabulary), DNA-V2, DNA-V3, DRIFT-19.
- Effort: S
- Risk: `HostedPairingRouteSurface` has `tokenSubmittedRef` guard logic; do not change it.
- Upstream-eligible: yes.
- #24865: not addressed

### Guest links

### F-11-10 Guest landing pages carry no brand, no sharer and two error voices

- Severity: P2
- Surface: web (phones in practice)
- Evidence: `components/guest/GuestPage.tsx:206-228, 283-290, 312-338`; screenshots `11-guest-none-light-1440x900.png`, `11-guest-none-dark-390x844.png`, `11-guest-fake-invite-light-1440x900.png`, `11-guest-redeem-error-light-1440x900.png`. A guest who follows a link sees a bare page: "Join a shared thread" at 16 px / 500, one field, "Join"; invalid or ended links show a 14 px sentence in the middle of an empty screen. The same failure reads "This link has ended or is not valid" (client) and "This guest link is not valid." (server body, shown after Join); "Connecting..." uses three ASCII dots, no `Spinner` (DNA-V9, DNA-M6); `document.title` is the static HTML title ("T3 Code (Beta)") until a thread loads.
- Current: the people most likely to be suspicious (strangers following a link) get the least orientation: no product name, no "who shared this", no icon.
- Proposed: put `T3Wordmark` (`h-5`) above every guest state (`Notice`, `NameForm`, the thread header); in `NameForm` add the sharer line when the server can supply it (otherwise "Someone shared a T3 Code thread with you."); unify the failure sentence to "This link has ended or is not valid." with the detail "Ask the owner for a new link. Each link works in one browser." and use the same text for the redeem failure; `Notice title="Connecting…"` gets `<Spinner size="sm" tone="muted" />`; set `document.title` to "Shared thread - T3 Code".
- DNA: DNA-ID1, DNA-V1/V9, DNA-M6, DNA-X3.
- Effort: S
- Risk: `GuestPage.browser.test.tsx` asserts some strings ("This link has ended"); update them with the change; the page deliberately mounts no providers, so keep imports to pure SVG and `Spinner`.
- Upstream-eligible: yes.
- #24865: not addressed

### F-11-11 Guest composer is hand-rolled: 32 px send, `rounded-3xl`, off the 22 px composer

- Severity: P2
- Surface: web (phones), code-read only (a live guest session needs T3 Connect)
- Evidence: `GuestPage.tsx:664-666` (`rounded-3xl border border-border bg-card px-4 pt-3 pb-2.5 shadow-composer dark:shadow-composer-dark`), `:752-759` (a raw `<button>` `size-8` with `focus-visible:outline-2`), `:739` (`ComposerControl` attach). The owner composer is the glass `ComposerSurface` at 22 px (DNA-K6); `Button` provides the 44 px coarse-pointer hit area (`button.tsx:9`), the raw button does not.
- Current: on a phone the Send button is a 32 px target with a different focus treatment (DRIFT-17) and the container is a third composer shape.
- Proposed: swap the raw `<button>` for `Button size="icon"` (`rounded-full`, `bg-message-action` via the existing variant used by `ComposerPrimaryActions`) so the coarse-pointer expansion and focus ring come for free; change the form radius to the composer's 22 px token (`rounded-[22px]`, as `ComposerSurface.tsx:21` does) and keep `shadow-composer`.
- DNA: DNA-S1, DNA-D4, DNA-K6, DRIFT-17.
- Effort: S
- Risk: `GuestPage.browser.test.tsx` queries `getByRole("button", { name: "Send" })`, which survives.
- Upstream-eligible: yes.
- #24865: not addressed (it restyles `ComposerSurface`, not this form)

### F-11-12 Owner guest dialog shows the link once, drops the expiry line, and "Stop sharing" outlives the link

- Severity: P2
- Surface: web, desktop, code-read only
- Evidence: `components/chat/GuestShareControls.tsx:120-139` (after "Create link" the line "The link works once and expires in 24 hours." is replaced by the link input), `:147-151` (footer is only "Done"), `:166` ("Creating..."), `:176-214` (`GuestShareIndicator`: "Guest link expired" beside a "Stop sharing" button that is still the action). `docs/user/guest-links.md` and the dialog's own text agree that "A new link ends the current one", and the server stores only an HMAC, so a link cannot be shown again.
- Current: closing the dialog without pressing Copy loses the only copy of the link and forces a new one (which ends the first); the 24-hour and one-browser constraints are visible only before the link exists; after expiry the header offers to "Stop" something already over.
- Proposed: on `created`, copy to the clipboard automatically (`copyToClipboard(state.url)`, the hook already falls back to `execCommand`) and keep a persistent line under the input: "Works in one browser and expires in 24 hours. It cannot be shown again."; turn "Done" into "Close" and, if `isCopied` is false, change its label to "Close without copying". In `GuestShareStatus` expired state render the button label "Clear" (same command) and drop the `UserIcon` colour to muted; use the single-character ellipsis in "Creating…".
- DNA: DNA-P7 (a one-way door gets a visible way back), DNA-P3, DNA-V8, DNA-V9.
- Effort: S
- Risk: no tests cover the dialog (needs the T3 Connect fixture); keep the `canCreate` permission gating.
- Upstream-eligible: yes.
- #24865: not addressed

### Settings -> Connections

### F-11-13 Revoke and "Revoke others" are immediate with no confirm, and unlabeled clients look identical

- Severity: P1
- Surface: web, desktop
- Evidence: `components/settings/AuthorizedClientsSettings.tsx:395-402` (link Revoke), `:564-573` (client Revoke), `:645-652` ("Revoke others"); `ConnectionsSettings.tsx:265-294` (success toast only after the fact); label fallback `AuthorizedClientsSettings.tsx:531-535` = `OS · Browser`. Measured: click to row removed 286 ms, no dialog, no toast, no undo (`11-revoke-immediate-light-1440x1000.png`); two browsers paired without a label are both "macOS · Chrome" and the last-seen time exists only in the 12 px dot's tooltip (`:516-522`). A shared admin session was lost during this audit (F-11-07 plus an unlabeled twin row).
- Current: one click ends a device's access, or every other device's, and the rows that make the choice are indistinguishable.
- Proposed: `requestConfirmDialog` (`variant: "destructive"`) before "Revoke others": "Revoke {n} other clients?" / "They will need a new pairing link." / button "Revoke {n} clients"; before single Revoke when `isLive`: "Revoke {label}? It is connected now." / "Revoke access". Add visible `Last seen {formatElapsedDurationLabel}` after the device bits (`text-xs text-muted-foreground`), and append the IP when `label` is null.
- DNA: DNA-P7, DNA-V2 (confirm names its action), DRIFT-13.
- Effort: S
- Risk: `ConnectionsSettings` browser tests that click Revoke; the 1 Hz row tick (`useRelativeTimeTick(1_000)`, L155/513) can drive the new text.
- Upstream-eligible: yes.
- #24865: not addressed

### F-11-14 The "Authorized clients" header overlaps its own title below about 520 px

- Severity: P1
- Surface: web at phone width, desktop narrow windows
- Evidence: `components/settings/FoldedSettingsSection.tsx:66-84` (`CollapsibleTrigger flex-1` plus a `shrink-0` control). Measured: trigger width 23.5 px at 390 (113 at 480, 153 at 520), title 119 px wide starts at x=119 while the actions start at x=134; summary text width 0 until 520. `11-connections-authorized-open-light-390x844.png`, `11-multi-env-offline-dark-390x844.png` (title reads "Au" under "Revoke others"). Also the collapse target is 23 px.
- Current: the section name is unreadable on phones and the toggle is a sliver.
- Proposed: header `flex flex-wrap items-center gap-x-4 gap-y-1`; trigger `min-w-0 basis-full sm:basis-0 sm:flex-1`; control wrapper `w-full justify-end sm:w-auto` so the buttons wrap below the title under `sm`.
- DNA: DNA-X4, DNA-D2, DNA-L5.
- Effort: XS
- Risk: `FoldedSettingsSection` is also used by Load balancing; verify its header at 390.
- Upstream-eligible: yes.
- #24865: not addressed (cf. F-07-06 for the unlabeled nav rail at this width)

### F-11-15 The MCP URL is still undiscoverable on a single machine (#17216)

- Severity: P2
- Surface: web, desktop
- Evidence: `ConnectionsSettings.tsx:1047-1070` (the machine section's "..." menu holds only `EnvironmentIconMenu`; measured items `["Icon"]`, `11-primary-env-menu-light-1440x900.png`); "Copy MCP URL" exists only in `SavedEnvironmentRows.tsx:421-423` for saved environments; `settingsSearch.ts:1003-1015` has no `mcp`/`agent` terms and a search for "mcp" returns nothing (measured); `docs/user/outside-agents.md:9-12` tells the user to open "a saved environment's menu".
- Current: with one machine there is no saved environment, so the documented path does not exist.
- Proposed: add a `MenuItem` "Copy MCP URL" to the machine section's menu, using `environmentMcpUrl` with `relayDiscovery.environments.get(primaryEnvironmentId)?.environment.endpoint.httpBaseUrl` (the same data `SavedBackendListRow` reads) and falling back to `${primaryEnvironment.displayUrl}/mcp`; when no URL is known render it `disabled` with the reason "Turn on T3 Connect or network access to get a URL other devices can reach." Add `"mcp url outside agents chatgpt claude connector"` to the `connections-environment` and `remote-environments` `searchTerms`. UI only.
- DNA: DNA-V5, DNA-P8 (entry points), AGENTS.md "Agents".
- Effort: S
- Risk: `settingsSearch` tests assert entry counts; none for terms.
- Upstream-eligible: yes (fixes #17216).
- #24865: not addressed

### Connection state

### F-11-16 There is no app-level connection indicator, and the machine section keeps saying "Up to date" during an outage

- Severity: P1
- Surface: all
- Evidence: the banner is built only in `components/chat/useSystemComposerBanners.tsx:152-186` from the active thread's environment; measured 8 s into a hard close: banner on a thread and the draft route, none on `/pull-requests`, `/usage`, `/settings/*`; `Sidebar.tsx` and `components/sidebar/*` never read `connection.phase` (grep), so thread rows keep ticking ("Working 1m") on stale data (`11-disconnect-close-t30s-light-1440x900.png`); in Settings the machine section still shows "Up to date", an enabled Network access switch, "Revoke others" and "Create link" (`11-disconnect-settings-connections-light-1440x900.png`); only Send changes state.
- Current: DNA-P3's "lying spinner" in its plainest form: the product's persistent surfaces say everything is live while nothing is.
- Proposed: reuse `ConnectionStatusDot` (`connectionPhaseDotClassName`, `ping` while connecting) in the sidebar footer, worst phase across enabled environments, tooltip "{label} is reconnecting · retrying in 12s" (reuse `RetryCountdown`), click opens Settings -> Connections; in the machine section header add the same dot plus `connectionStatusText`, and set `aria-disabled` on Create link, Revoke others and the Network switch when `primaryEnvironment.connection.phase !== "connected"`.
- DNA: DNA-P3, DNA-M9, DNA-L2.
- Effort: M
- Risk: sidebar footer is area 01's surface (F-01-15, F-01-24 touch the same row); keep the dot at `size-3` inside the existing 32 px icon button.
- Upstream-eligible: no (new element; propose in Ideas first).
- #24865: not addressed

### F-11-17 The "reconnecting" banner has no retry, no countdown, and recovery lags up to 5 minutes (#22024)

- Severity: P1
- Surface: all
- Evidence: `useSystemComposerBanners.tsx:169-181` (`Reconnect` renders only when `!environmentReconnecting`, so never during the long state); measured timeline above: banner at t+3.3 s (hard close) or t+19.0 s (stall), unchanged for 60 s, then 52 s (or 26 s) after the server was back; `supervisor.ts:41-42,127-130` (cap 300 s); the working "Retry now" and "retrying in Ns" live behind Details in Settings (`ConnectionDiagnosisDetails.tsx:66-75,189`, `11-multi-env-details-panel-light-1440x1000.png`). Upstream #22024 (accepted).
- Current: the person watching a banner that says "reconnecting" has nothing to press and no sign when the next attempt is.
- Proposed: always render the action, label "Retry now", calling `environmentCatalog.retryNow` (already wired as `handleReconnectActiveEnvironment`), and append `<RetryCountdown>` text to the description ("retrying in 12s · attempt 4"); export `RetryCountdown` from `ConnectionDiagnosisDetails.tsx`. Keep "Disconnect server" after the 20 s delay.
- DNA: DNA-P3, DNA-M9, DNA-V2.
- Effort: S
- Risk: `useSystemComposerBanners` has browser tests for the Reconnect button (update the offline case, add reconnecting); `retryNow` while in-flight must be a no-op (supervisor already ignores).
- Upstream-eligible: yes.
- #24865: not addressed

### F-11-18 A revoked session shows "reconnecting / did not answer" forever and never routes to `/pair`

- Severity: P1
- Surface: all
- Evidence: measured (a second browser revoked the first from Settings): banner at +3.6 s, text "T3 Code on MacBook Pro did not answer" at +4.4 s, unchanged for 100 s while the client polled `/api/auth/session` 10 times and received 200 with `authenticated:false`; reload -> `/pair` (`11-session-revoked-midsession-final-light-1440x900.png`, `11-session-revoked-after-reload-light-1440x900.png`). `diagnosis.ts:133-135` already has the right sentence ("did not accept this device") but the failed upgrade is classified as transport.
- Current: the host is blamed, the device is not told it was signed out, and backoff grows toward 5 minutes with a dead cookie.
- Proposed: when the primary environment's socket fails and `/api/auth/session` answers `authenticated:false`, treat it as `authentication`: stop retrying, `router.navigate({ to: "/pair", replace: true })` with the banner text "This browser was signed out. Pair again." (action "Pair again"). The classification lives in shared client-runtime (`rpc/session.ts` / supervisor), not the server; gate the UI part on it.
- DNA: DNA-P3, DNA-P7, DNA-V3.
- Effort: M
- Risk: client-runtime tests (`session.test.ts`, `supervisor.test.ts`); relay and bearer routes must keep their own auth-failure path.
- Upstream-eligible: yes.
- #24865: not addressed

### Version skew

### F-11-19 The per-server "Update" button restarts a server with no confirmation and no running-thread count

- Severity: P1
- Surface: all, code-read only (never clicked: it would restart the dev server)
- Evidence: `components/ServerUpdateAction.tsx:246-272` confirms only for `desktop-managed`; the banner (`useSystemComposerBanners.tsx:236-250`), the Settings Version row (`ConnectionsSettings.tsx:1089-1112`, rendered as "Update to 0.1.2" in `11-version-skew-settings-boot-service-light-1440x900.png`) and the row icon (`SavedEnvironmentRows.tsx:369-381`) all call it. The sidebar "Update everything" dialog does count: `components/sidebar/UpdateEverythingDialog.tsx:98-101` ("{n} will be interrupted and can resume after the restart.").
- Current: the same destructive action is guarded in one place and one-click in three others, beside a dismiss "X" on a 24 px strip.
- Proposed: in `ServerUpdateAction.handleUpdate`, for every capability call `requestConfirmDialog` with "Update {serverLabel} to {targetVersion}?" and the running count from the shell snapshot (reuse the helper behind `UpdateEverythingDialog`); confirm button "Update and restart".
- DNA: DNA-P7, DNA-V2, DNA-P3.
- Effort: M
- Risk: `ServerUpdateAction.browser.test.tsx` clicks Update directly; add the confirm to those cases.
- Upstream-eligible: yes.
- #24865: not addressed

### Cross-cutting

### F-11-20 One machine has six names and one secret has five

- Severity: P2
- Surface: all
- Evidence: the machine is "backend" (`AuthorizedClientsSettings.tsx:677` "pair with this backend", `AddEnvironmentDialog.tsx:206-256, 629` "Backend added", "Could not add backend", `ConnectionsSettings.tsx:304-328` "Could not switch backend on", "Could not remove backend", `PairingRouteSurface.tsx:216-219`), "machine" (`AuthorizedClientsSettings.tsx:417`, `ConnectionsSettings.tsx:1056`, `BranchToolbarEnvironmentSelector.tsx:63`), "server" (`T3ConnectUserProfilePage.tsx:78` "Deregister server", `useSystemComposerBanners.tsx:149` "Disconnect server"), "host" (`AddEnvironmentDialog.tsx:383`), "Primary environment" (`ConnectionsSettings.tsx:1034`), "This device" (`BranchToolbar.logic.ts:49-51`). The secret is "token" (`PairingRouteSurface.tsx:97` label), "code" (`AddEnvironmentDialog.tsx:393`, `ConnectAgentSurface.tsx:221`, toast "Pairing code copied"), "link", "URL" ("Pairing URL copied", "Could not create pairing URL") and "secret" (`PairingRouteSurface.tsx:107` placeholder). Cross-ref F-10-35, DRIFT-19.
- Current: a person who reads the docs, the CLI ("Token:") and three pages meets eleven words for two things.
- Proposed: "environment" for the thing everywhere in connection UI (keep "This machine" only as the fallback title); "pairing link" for the URL and "pairing code" for the 12-character secret, and rename `PairingRouteSurface` label/placeholder, the toasts "Pairing URL copied" -> "Pairing link copied", "Could not create pairing URL" -> "Could not create pairing link", "Backend added" -> "Environment added", "Could not remove backend" -> "Could not remove environment". Banner action "Disconnect server" -> "Switch off" (the Settings switch is "Switch off/Switch on", `SavedEnvironmentRows.tsx:389-395`).
- DNA: DNA-V7, DNA-V8, DRIFT-19.
- Effort: S
- Risk: string assertions in `settings/*.browser.test.tsx` and `ChatView` tests; `docs/user/remote-access.md` already uses "pairing link"/"Add environment".
- Upstream-eligible: yes.
- #24865: not addressed

## Edge-case results (matrix)

| Row                                                           | Result                                                                                                                                                                                 |
| ------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Data: empty                                                   | PASS: "No pairing links or client sessions." and "No saved remote environments" (both fine)                                                                                            |
| Data: one item / many                                         | PASS one; 100+ rows NOT TESTED (list is unvirtualised, each row runs a 1 s timer, `AuthorizedClientsSettings.tsx:155,513`); 10,000+ N/A                                                |
| Data: 200 char names, emoji, CJK                              | PASS: environment label of 170 chars + CJK + emoji truncates in the row, wraps in the red headline (`11-multi-env-offline-light-1440x900.png`); RTL, whitespace-only labels NOT TESTED |
| Network: relay disconnected                                   | code-read only (`diagnosis.ts`: good hop list, retry countdown, troubleshooting link)                                                                                                  |
| Network: reconnect after sleep, backgrounded 1 h, OS sleep    | NOT TESTED (no sleep on this host; `wakeups.ts` reset-backoff paths read only)                                                                                                         |
| Network: server restarted under the client                    | simulated by hard close: FAIL F-11-16, F-11-17                                                                                                                                         |
| Network: stream stalls                                        | FAIL F-11-17 (19 s of silent staleness)                                                                                                                                                |
| Auth expired mid-session                                      | FAIL F-11-18                                                                                                                                                                           |
| Version mismatch                                              | rendered by stub: FAIL F-11-19; copy notes under "Needs deeper look"                                                                                                                   |
| Viewport 1440x900 / 1024x640 / 800x600 / 720x450 (=200% zoom) | PASS (pair card scrolls at 720x450; Connections holds, no overlap above 520 px)                                                                                                        |
| Viewport 390x844                                              | FAIL F-11-14, banner overlap (see below); keyboard-open NOT TESTED (no OS keyboard)                                                                                                    |
| Viewport 3440x1440                                            | PASS (`/pair` centred)                                                                                                                                                                 |
| Light, dark                                                   | both captured for every state; PASS except noted                                                                                                                                       |
| Named themes, system switching, high contrast                 | NOT TESTED (default theme only)                                                                                                                                                        |
| Reduced motion                                                | PASS by code (`motion-safe:animate-status-ping`); not measured                                                                                                                         |
| Keyboard only                                                 | FAIL F-11-05, Add environment Enter (below)                                                                                                                                            |
| Screen reader                                                 | NOT TESTED; aria-labels read from DOM                                                                                                                                                  |
| Lifecycle: first launch / pairing                             | PASS flow; F-11-07                                                                                                                                                                     |
| Lifecycle: corrupted settings                                 | NOT TESTED                                                                                                                                                                             |

## Already good (do not touch)

- `stripPairingTokenFromUrl` removes the token from the address bar and history after use; hosted links carry it in the fragment (`docs/internals/remote.md`).
- `diagnosis.ts` and `ConnectionDiagnosisPanel`: ordered hops, "What to try", facts, Copy diagnostics, troubleshooting link, retry countdown. Reuse it, do not redesign.
- `EnvironmentRoutesList`: drag and keyboard reorder, "In use" badge, learned routes marked, confirm before remove.
- Share panel: QR plus URL plus "Copy code only", with "Reach this machine via" radios when several endpoints exist.
- `ConnectAgentSurface`: names the agent and the redirect host, one-click or pairing code, explicit access ladder, "Only approve a sign-in you just started".
- Disabled Send keeps its reason in tooltip and `aria-label`; the draft survives and a send attempt toasts "Not connected: message not sent".
- `RemoveT3ConnectEnvironmentDialog` and the inline deregister confirm in the account page.
- Version-mismatch dismissal keys per (environment, client, server) so a new version re-raises the notice.
- Guest invite travels in the hash and is removed with `replaceState`; one session per share.

## Incomplete

- **Shared fixture incident (mine).** At `2026-10-25T14:25:06.648Z` my test of F-11-07 (a valid pairing link opened in a context holding the shared `/tmp/t3code-pw/state.json` session) redeemed the link and revoked that session. Other agents using `state.json` were unauthenticated from then until about 14:27:32Z, when I minted a replacement (label `shared-playwright-do-not-revoke`), merged its cookie into `state.json` (old file kept as `/tmp/t3code-pw/a11-tok/state.json.revoked-copy`) and verified it. Anyone who loaded the old cookie into a long-lived context must reload `state.json`. Do not revoke that label.
- Cleanup: every `probe-*` session and link was revoked from Settings -> Connections (final DB read: 0 live probe sessions, 0 open probe links); sessions labelled `mobile-probe*` and `t3 thread cli` belong to other agents and were left. Token files, QR crops and states under `/tmp/t3code-pw/a11-tok` and `/tmp/a11-qr` are outside the repo.
- Privacy: no pairing URL or token is in this file. In screenshots the token inputs are masked (`color: transparent`), QR codes and link text are blurred, and captures of the reveal dialog were blurred before saving. The unmasked QR crops used for the `jsQR` decode (decoded in light and dark at 132 px, so the 2-module quiet zone works for a software reader) stayed in `/tmp` and are deleted.
- Not reachable: hosted pairing, `/connect`, T3 Connect signed in or out, relay status, hold-webhooks, guest creation and the guest thread, a real second environment (offline rows were simulated with two unreachable catalog entries in a context-only IndexedDB), approval of an MCP client (only rendered).
- Mobile pairing screens are area 15; desktop updater is area 14.

## Needs deeper look

Measured or read, not promoted to findings (terse):

- Area 13/05: `/pull-requests` shows a skeleton list forever once the primary connection drops, no message (`11-disconnect-pull-requests-light-1440x900.png`).
- Area 04: at 390 px the pill composer covers the lower 17 px of both the reconnecting and the version banners and hides the description behind an "i" (`11-disconnect-banner-light-390x844.png`, `11-version-skew-banner-boot-service-light-390x844.png`); cf. F-04-39.
- Not tested: what happens to a message sent during the first 17 s of a stalled socket (optimistic row, then lost or replayed).
- Settings -> Connections, loopback web server (`npx t3`): "Create link" yields only a 12-character code, a hint "pair from another client using this backend's reachable host" with no host, a disabled Network access switch with no command and no T3 Connect row (`11-link-created-row-light-1440x1100.png`, `SavedEnvironmentRows.tsx:598-635`); the commands (`t3 serve --host`, `t3 connect`) should appear in place.
- Client rows: idle status dot 1.47:1, live dot 2.44:1 light, 12 px button with no focus ring (`ConnectionStatusDot.tsx:57-65`, measured), "This device" badge 10 px at 3.23:1 light, Network access description 3.28:1 (the latter fixed by #24865).
- Create pairing link dialog: all 16 permissions ticked by default, "Read only"/"Standard" 24 px buttons with no selected state, 868-1068 px tall; no toast and no auto-opened Share panel after creation, and the new row sits inside a 22.5 rem nested scroll area (`ConnectionsSettings.tsx:1180-1185`).
- QR: three call sites use quiet zones of 2, 1 and 1 modules and three wrappers (`AuthorizedClientsSettings.tsx:371-381, 474-483`, `MobileAppSettingsRow.tsx:39-47`); `QRCodeSvg` defaults `marginSize=0` and hard-codes `#000/#fff`.
- Saved environment row at 390 px: the address/status text collapses to zero width while "Routes" and "Permissions" survive (`SavedEnvironmentRows.tsx:245-307`, `11-multi-env-offline-dark-390x844.png`).
- Add environment dialog: Enter in Host/Pairing code does nothing (no `<form>`), a one-option "Remote link" selector on web, title "Add Environment", primary button `variant="outline"`, the raw `HttpClientError` shown inline and again as a toast (`AddEnvironmentDialog.tsx:337-409, 461-469, 614-615`).
- Banner naming: "Disconnect server" hides the environment (`title` attribute only), the send toast says "Reconnecting" when the phase is offline (`useComposerSend.ts:454-466`), and the `WifiOffIcon` shows for every non-connected phase.
- "Run on" menu has no connection state and falls back to the environment UUID as label (`BranchToolbar.logic.ts:17-23, 39-58`).
- Read-only session: the composer looks usable, the Send reason is hover-only, Authorized clients vanishes silently (`11-readonly-session-chat-light-1440x900.png`); and a brand-new `orchestration:read` + `relay:read` pairing (the example in the docs) raises "Permissions have changed for MacBook Pro" because `sessionHasLegacyPermissions` is true (`PermissionUpdateNotice.tsx:24-65`, cf. F-12-33).
- Version skew copy: versions appear only in a tooltip on a `cursor-help` title; "Update the desktop app" does not say which machine; "Client not supported" (`presentation.ts:81`) does not say which side must update; `UPDATE_STAGE_LABELS` shows "installing" as "Downloading..." beside a static dot (`ServerUpdateAction.tsx:34-38`).
- Copy confirmations: five patterns in this area (toast with description, inline label flip in the guest dialog, title-only "Diagnostics copied", value-echo "Trace ID copied", silent bare `navigator.clipboard.writeText` at `CloudEnvironmentConnectList.tsx:180` and `T3ConnectUserProfilePage.tsx:176`); mechanics are F-12-28.
- T3 Connect surfaces: disabled outline `Button` used as a status label (`CloudEnvironmentConnectList.tsx:479-481`), "Mesh your devices together" (`ConnectOnboardingDialog.tsx:194-197`) and "relay client" jargon (`RelayClientInstallDialog.tsx:67-74`).
- Opening a pairing link in a paired browser shows no message at all (see F-11-07); success of a fresh pairing is silent too and lands on an arbitrary thread (F-10-03).
