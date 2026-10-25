# Screenshot capture (baseline and after images)

Everything lives OUTSIDE the repo in `/tmp/t3code-pw` (Playwright + Chromium installed there with
`npm i playwright && npx playwright install chromium`; never added to repo deps).

## One-time setup

1. Start the dev app: `vp run dev --home-dir /tmp/t3code-overhaul --no-seed` from the repo root. Read the
   `pairingUrl:` line.
2. Pair a headless browser once and persist its cookies/localStorage:
   `node /tmp/t3code-pw/pair.mjs "<pairingUrl>" /tmp/t3code-pw/state.json`
   (consumes the one-time token; a new token comes from `node apps/server/src/bin.ts pair --base-dir /tmp/t3code-overhaul`).
3. Fixture data: see `fixtures.md` (synthetic sample repo + cloned threads). The baseline requires the same
   thread IDs as `states.json`; if the state dir is rebuilt, update the thread URLs in `states.json`.

## Scripts

- `/tmp/t3code-pw/shot.mjs` — one screenshot: `--url --out [--width --height --scheme light|dark --wait --full --click --eval --reduced --dpr]`.
- `/tmp/t3code-pw/capture.mjs` — the full matrix. Deterministic names `<label>-<theme>-<scheme>-<WxH>.png`.
  `node /tmp/t3code-pw/capture.mjs --out <dir> [--viewports 1440x900,1280x720,1024x640,800x600,3440x1440,390x844] [--schemes light,dark] [--themes default,<theme-id>,...] [--only <label>] [--dpr 1] [--states /tmp/t3code-pw/states.json]`
  Theme selection writes `t3code:theme` (id) and `t3code:theme-appearance-mode` (scheme) and clears `t3code:theme-halves:v1` (see `apps/web/src/themePalette.ts`)
  into localStorage before load; `default` keeps the paired browser's choice.
- `/tmp/t3code-pw/states.json` — the list of states: label, url, optional `actions` (`click`/`press`/`type`/`eval`/`hover`),
  optional `viewports` filter, optional `wait`, optional `full`. Add states here; never rename existing labels (the
  names are the join key between before and after images).

## Baseline run (Phase 1)

```
node /tmp/t3code-pw/capture.mjs --out <repo>/ui-overhaul/screens/baseline \
  --viewports 1440x900,1280x720,1024x640,800x600,3440x1440,390x844 --schemes light,dark --themes default
node /tmp/t3code-pw/capture.mjs --out <repo>/ui-overhaul/screens/baseline --viewports 1440x900 --schemes light,dark \
  --themes t3-chat,grove,ocean,ember,iris   # named themes at one viewport (ids from packages/shared/src/themePalettes.ts)
```

The built-in themes visible in Settings → Appearance are: T3 Code (default), T3 Chat, Grove, Ocean, Ember, Iris.
Their IDs are confirmed in `baseline/capture-log.txt` / DNA.md (theme IDs derive from names via `themeIdFromName`).

## After images (Phase 2)

Run the same command with `--out ui-overhaul/screens/<chunk-id>` and `--only <label>` for the states the chunk
changes. Pair with the baseline file of the same name in the PR body. Push screenshot folders to the fork branch
`ui-overhaul/assets`, never into a code branch.

## Known limits

- Relative times ("2m", "14m") drift between runs; compare layout, not timestamps.
- `animations: "disabled"` and `caret: "hide"` are set for determinism.
- Desktop (Electron) and iOS simulator captures use `screencapture`/`xcrun simctl io … screenshot` and live under
  `screens/14-desktop-specific/` and `screens/15-mobile/` with the same naming rule.
