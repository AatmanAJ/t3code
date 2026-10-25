#!/bin/sh
# Assemble the final spec from parts. Run from ui-overhaul/.
set -e
cd "$(dirname "$0")/../.."
OUT=spec/T3-CODE-UI-UX-SPEC.md
{
  cat spec/parts/00-header.md
  echo; echo "## Contents"; echo
  grep -h "^## [0-9]*\. " spec/parts/A-sections-01-06.md spec/parts/B-sections-07-12.md spec/parts/C-sections-13-16.md | sed 's/^## /- /'
  echo "- Reconciliation notes"; echo "- Self-check"; echo
  cat spec/parts/A-sections-01-06.md; echo
  cat spec/parts/B-sections-07-12.md; echo
  cat spec/parts/C-sections-13-16.md; echo
  cat spec/parts/98-reconciliation.md; echo
  cat spec/parts/99-selfcheck.md
} > "$OUT"
# scrub local absolute paths from every text file in ui-overhaul
grep -rl --include='*.md' --include='*.json' --include='*.mjs' --include='*.sh' --include='*.txt' '<home>' . | while read -r f; do
  sed -i '' -e 's#<home>/\.t3/scratch/2026-10-25-t3-code-ui-ux-overhaul-d1d61898/t3code#<repo>#g' -e 's#<home>#<home>#g' "$f"
done
echo "spec lines: $(wc -l < "$OUT")"; echo "pending markers: $(grep -c 'PENDING' "$OUT" || true)"; echo "sections: $(grep -c '^## [0-9]*\. ' "$OUT")"
