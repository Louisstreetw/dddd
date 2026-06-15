#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log()  { echo -e "${BLUE}[agent]${NC} $*"; }
ok()   { echo -e "${GREEN}[ok]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC} $*"; }
die()  { echo -e "${RED}[fail]${NC} $*"; exit 1; }

if [[ $EUID -ne 0 ]]; then die "Run as root: sudo bash install.sh"; fi

REPO_DIR="$(cd "$(dirname "$0")/.." && pwd)"
AGENT_SRC="$REPO_DIR/agent"
AGENT_DST="/opt/trading/agent"
MEMORY_SRC="$REPO_DIR/memory"

log "Copying agent files to $AGENT_DST"
mkdir -p "$AGENT_DST"
cp -r "$AGENT_SRC/." "$AGENT_DST/"
chmod 750 "$AGENT_DST"

mkdir -p /opt/trading/logs

if [[ ! -f "$AGENT_DST/.env" ]]; then
  if [[ -z "${TELEGRAM_TOKEN:-}" ]]; then
    die "TELEGRAM_TOKEN env var missing. Run: TELEGRAM_TOKEN=xxx bash install.sh"
  fi
  log "Writing .env"
  cat > "$AGENT_DST/.env" <<EOF
TELEGRAM_TOKEN=$TELEGRAM_TOKEN
MEMORY_DIR=/root
EOF
  chmod 600 "$AGENT_DST/.env"
fi

log "Installing memory templates to /root"
for f in STATE.md RULES.md LEARNINGS.md journal-recent.md journal-jours.md journal-semaines.md journal-mois.md; do
  if [[ ! -f "/root/$f" && -f "$MEMORY_SRC/$f" ]]; then
    cp "$MEMORY_SRC/$f" "/root/$f"
  fi
done

log "Installing Node dependencies"
cd "$AGENT_DST"
npm install --omit=dev --silent

log "Installing systemd units"
cp "$AGENT_DST/systemd/claude-bot.service" /etc/systemd/system/
cp "$AGENT_DST/systemd/claude-memory.service" /etc/systemd/system/
cp "$AGENT_DST/systemd/claude-memory.timer" /etc/systemd/system/
systemctl daemon-reload

log "Enabling & starting services"
systemctl enable --now claude-bot.service
systemctl enable --now claude-memory.timer

sleep 2
if systemctl is-active --quiet claude-bot.service; then
  ok "claude-bot is running"
else
  warn "claude-bot failed to start. Logs:"
  journalctl -u claude-bot.service --no-pager -n 20
  exit 1
fi

ok "Agent installed"
echo
echo "Next: open Telegram, find your bot, send /start"
echo "Logs:    tail -f /opt/trading/logs/bot.log"
echo "Status:  systemctl status claude-bot"
echo "Restart: systemctl restart claude-bot"
