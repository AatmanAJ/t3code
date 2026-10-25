# 08 Settings entries: setup re-entry and release notes, web and desktop; 1280 and 390

Two quiet rows in Settings, General, About. No modal, no badge, no "what's new" screen: the owner's own direction is "software that feels obvious" and every way in needs a way out (DNA-P2, DNA-P7). Audit: F-24-16 (updates), F-10-02 and F-10-37 (entry points, release notes), F-24-10 (skip leaves a trail), F-24-11 (telemetry copy).
Placement: `GeneralSettingsPanel`, `SettingsSection id="about"` (`SettingsPanels.tsx:1884`), after "Version" / "Mobile app" and before "View policy". The rows copy the pattern of the existing "View policy" and "View diagnostics" rows (`SettingsRow` + `Button size="sm" variant="outline"`). #24865 edits `SettingsPanels.tsx` at lines ~409-585 and ~949-969 only; the About block is untouched, so no hunk collision.

## A. General, About section, 1280x720 (right pane 896 px, `SettingsPageContainer max-w-4xl`)

```
 | About                                                                                 |
 | +-----------------------------------------------------------------------------------+ |
 | | Version  0.164.0                                          [ Check for updates ]   | |  <- EXISTS
 | |   Update track                                            ( Latest v )            | |  <- EXISTS (desktop)
 | |---------------------------------------------------------------------------------- | |
 | | Mobile app                                  [ App Store ] [ Google Play ] | |  <- EXISTS (popover QR)
 | |---------------------------------------------------------------------------------- | |
 | | Release notes                                                                     | |  <- NEW row
 | | What changed in 0.164.0.                                  [ Read release notes ]  | |     (F-10-37, F-24-16)
 | |---------------------------------------------------------------------------------- | |
 | | Setup                                                                             | |  <- NEW row (F-10-02)
 | | Check your agents and import projects again.              [ Open setup ]          | |
 | |---------------------------------------------------------------------------------- | |
 | | How we handle your data, including the anonymous usage    [ View policy ]        | |  <- EXISTS
 | | data T3 Code collects.                                                            | |
 | +-----------------------------------------------------------------------------------+ |
```

- `Read release notes`: desktop calls `openDesktopUpdateReleaseNotes(window.desktopBridge, getDesktopUpdateReleaseUrl(APP_VERSION))` (`desktopUpdate.toast.tsx:12`, `desktopUpdate.logic`), which already shows "Unable to open release notes" on failure; browser builds render the same row as `Button render={<a href={releaseUrl} target="_blank" rel="noreferrer noopener" />}` exactly like "View policy". When the version is unknown (`APP_VERSION === "0.0.0"` in dev builds) the row links to `getDesktopUpdateReleaseHistoryUrl()` and reads "All releases" instead of "What changed in {version}."; it is never disabled without an explanation (DNA-P2).
- `Open setup`: `Button render={<Link to="/welcome" />} size="sm" variant="outline"`. The palette entry "Open setup" (06 C) and the hero button (05 B) go to the same place. Hidden on the hosted app, which does not run setup (`docs/user/welcome-wizard.md`).
- Settings search (`settingsSearch.ts`): add `searchableSetting("setup")` and `("release-notes")` with keywords "welcome", "onboarding", "import", "agents", "changelog", "what's new" so Settings search finds them.
- No new persisted state. A "last seen version" is not stored: nothing here needs it, and a one-time post-update surface is rejected (see audit F-24-16).

## B. 390x844 (web at phone width, settings route modal full screen)

```
+------------------------------------+
| Settings / General             [x] |
|------------------------------------|
| About                              |
| +--------------------------------+ |
| | Version  0.164.0               | |
| | [ Check for updates ]          | |
| |--------------------------------| |
| | Release notes                  | |
| | What changed in 0.164.0.       | |
| | [ Read release notes ]         | |  <- control wraps under the text, 36 px
| |--------------------------------| |
| | Setup                          | |
| | Check your agents and import   | |
| | projects again.                | |
| | [ Open setup ]                 | |
| +--------------------------------+ |
+------------------------------------+
```

- `SettingsRow` already stacks the control below the description under 32 rem (DNA-L6). The wizard opened from here is the 390 layout of 02-04.

## C. Mobile app (native)

- Settings, About on mobile already shows the version (`[M]settings-about-light-iphone17.png`). Add one `ListRow` "Release notes" that opens the GitHub release for the installed version in the system browser (`Linking.openURL`). No setup row: the phone runs no wizard; its "setup" is 07.

## Rule check

- Exists: `SettingsSection`, `SettingsRow`, `Button` outline sm, `Link`, `openDesktopUpdateReleaseNotes`, `getDesktopUpdateReleaseUrl`, `searchableSetting`, mobile `ListRow`.
- Additive: two rows. Reverse path: both are plain navigations; closing returns to the previous location.
- DNA: P2, P7, P8, L4, L6, K16, V5.
