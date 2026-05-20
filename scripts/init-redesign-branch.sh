#!/usr/bin/env bash
# One-shot init: from a freshly cloned ipc24 repo (main checked out), create the
# redesign/phase-1 branch with the Astro skeleton bundled into this tarball
# without touching files on `main`. Run from inside the cloned repo root.
#
# Usage:
#   ./init-redesign-branch.sh /path/to/skeleton-bundle
#
# Requires: git, tar, gh (optional, for PR creation), GH_TOKEN or PAT in env.

set -euo pipefail

BUNDLE_DIR="${1:?usage: init-redesign-branch.sh <skeleton-dir>}"
BRANCH="redesign/phase-1"

if [[ ! -d "$BUNDLE_DIR" ]]; then
  echo "Bundle dir not found: $BUNDLE_DIR" >&2
  exit 1
fi

if [[ -z "$(git status --porcelain)" ]]; then :; else
  echo "Working tree not clean — refusing to overwrite." >&2
  exit 1
fi

git fetch origin
git checkout -B "$BRANCH" origin/main

# Remove legacy Lovable/Vite files from the redesign branch (kept on main).
git rm -rf --ignore-unmatch \
  components.json \
  eslint.config.js \
  index.html \
  package-lock.json \
  package.json \
  bun.lockb \
  postcss.config.js \
  tailwind.config.ts \
  tsconfig.app.json \
  tsconfig.json \
  tsconfig.node.json \
  vite.config.ts \
  src public

# Drop in the Astro skeleton.
rsync -a --exclude='.git' "$BUNDLE_DIR"/ ./

git add -A
git -c user.name="IPC24 CTO Agent" -c user.email="cto@ipc24.de" commit -m "$(cat <<'EOF'
chore(redesign): bootstrap Astro 4.x + Tailwind + Convex skeleton on redesign/phase-1

- Astro 4.x with @astrojs/mdx, @astrojs/sitemap, @astrojs/tailwind
- Tailwind 3.x configured with IPC brand tokens
- Netlify deploy config (netlify.toml) + Resend/Convex contact function
- Convex schema: blogPosts, contactSubmissions
- CI gates: Biome + astro check + build, pa11y-ci + Lighthouse CI
- README documents stack decision, deploy flow, and Phase-5 cutover

Co-Authored-By: Paperclip <noreply@paperclip.ing>
EOF
)"

git push -u origin "$BRANCH"

cat <<MSG
Done.
  Branch:        $BRANCH (pushed)
  Next:          configure Netlify branch deploy for "$BRANCH"
  Preview URL:   redesign-phase-1--ipc24ek.netlify.app (once Netlify builds)
MSG
