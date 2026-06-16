#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'
log() { echo -e "${BLUE}[skool]${NC} $*"; }
ok()  { echo -e "${GREEN}[ok]${NC} $*"; }

AGENT_DIR=/opt/trading/agent
OUT_DIR=/home/claude/skool

log "Installing Playwright system deps (Chromium libs)"
apt-get update -qq
apt-get install -y -qq \
  libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libxkbcommon0 \
  libxcomposite1 libxdamage1 libxfixes3 libxrandr2 libgbm1 libpango-1.0-0 \
  libcairo2 libasound2t64 libxshmfence1 \
  fonts-liberation libnspr4 xdg-utils

log "Installing Playwright npm package"
cd "$AGENT_DIR"
npm install playwright --silent

log "Downloading Chromium browser (~150MB, 1-3 min)"
"$AGENT_DIR/node_modules/.bin/playwright" install chromium

log "Preparing output dir"
mkdir -p "$OUT_DIR"
if id -u claude >/dev/null 2>&1; then
  chown -R claude:claude "$OUT_DIR" "$AGENT_DIR/node_modules"
fi

ok "Playwright ready"
echo
echo "Test login with:"
echo "  sudo -u claude bash -c 'cd $AGENT_DIR && node skool/login.mjs'"
