#!/usr/bin/env bash
#
# Orbit deploy / update script.
#
# Pulls the latest code, installs deps, builds, seeds curated content on first
# run (without ever clobbering live Studio edits), and restarts the web service.
#
# Idempotent: safe to run repeatedly. Run it as the `orbit` user:
#   cd /opt/orbit/website && ./deploy/update.sh
#
# (chmod +x deploy/update.sh once after cloning, since the file came from a
#  Windows checkout that may not preserve the executable bit:
#   chmod +x deploy/update.sh )

set -euo pipefail

# Resolve the repo root from this script's location so it works from anywhere.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
DATA_DIR="${APP_DIR}/data"
SERVICE="${ORBIT_SERVICE:-orbit-web}"

cd "${APP_DIR}"

echo "==> Orbit update starting in ${APP_DIR}"

# 1) Pull latest code (fast-forward only; abort on divergence).
if [ -d .git ]; then
  echo "==> git pull --ff-only"
  git pull --ff-only
else
  echo "!! ${APP_DIR} is not a git checkout; skipping git pull"
fi

# 2) Install production dependencies (reproducible, no dev deps like tsx).
echo "==> npm ci --omit=dev"
npm ci --omit=dev

# 3) Build the production bundle.
echo "==> npm run build"
npm run build

# 4) Seed curated content on first run ONLY.
#    Copy each *.seed.json -> its live *.json if (and only if) the live file
#    does not already exist. This bootstraps a fresh server while NEVER
#    overwriting edits made later through the Studio on the VM.
echo "==> Seeding data/ (only files that don't exist yet)"
mkdir -p "${DATA_DIR}"
seed_if_missing() {
  local seed="$1"
  local live="$2"
  if [ -f "${DATA_DIR}/${seed}" ] && [ ! -f "${DATA_DIR}/${live}" ]; then
    cp "${DATA_DIR}/${seed}" "${DATA_DIR}/${live}"
    echo "   seeded ${live} from ${seed}"
  else
    echo "   skip ${live} (already present or no seed)"
  fi
}
seed_if_missing "profile.seed.json" "profile.json"
seed_if_missing "published-projects.seed.json" "published-projects.json"

# 5) Restart the web service to pick up the new build.
echo "==> sudo systemctl restart ${SERVICE}"
sudo systemctl restart "${SERVICE}"

echo "==> Done. Tail logs with:  journalctl -u ${SERVICE} -f"
