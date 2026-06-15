#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${BLUE}[setup-nonroot]${NC} $*"; }
ok()   { echo -e "${GREEN}[ok]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC} $*"; }

if [[ $EUID -ne 0 ]]; then
  echo "Run as root: sudo bash setup-nonroot.sh"
  exit 1
fi

CLAUDE_USER=claude
CLAUDE_HOME=/home/$CLAUDE_USER

log "Creating user '$CLAUDE_USER'"
if ! id -u $CLAUDE_USER >/dev/null 2>&1; then
  useradd -m -s /bin/bash $CLAUDE_USER
  ok "User created"
else
  ok "User already exists"
fi

log "Granting passwordless sudo"
cat > /etc/sudoers.d/$CLAUDE_USER <<EOF
$CLAUDE_USER ALL=(ALL) NOPASSWD:ALL
EOF
chmod 440 /etc/sudoers.d/$CLAUDE_USER

log "Copying Claude Code credentials from root to $CLAUDE_USER"
if [[ -d /root/.claude ]]; then
  rm -rf $CLAUDE_HOME/.claude
  cp -r /root/.claude $CLAUDE_HOME/.claude
  chown -R $CLAUDE_USER:$CLAUDE_USER $CLAUDE_HOME/.claude
  ok "Credentials copied"
else
  warn "/root/.claude not found — bot may not be authenticated"
fi

if [[ -f /root/.claude.json ]]; then
  cp /root/.claude.json $CLAUDE_HOME/.claude.json
  chown $CLAUDE_USER:$CLAUDE_USER $CLAUDE_HOME/.claude.json
fi

log "Moving memory files to $CLAUDE_HOME"
for f in CLAUDE.md STATE.md RULES.md LEARNINGS.md journal-recent.md journal-jours.md journal-semaines.md journal-mois.md .telegram-owner; do
  if [[ -f /root/$f && ! -f $CLAUDE_HOME/$f ]]; then
    cp /root/$f $CLAUDE_HOME/$f
  fi
done
chown -R $CLAUDE_USER:$CLAUDE_USER $CLAUDE_HOME

log "Granting ownership of /opt/trading to $CLAUDE_USER"
chown -R $CLAUDE_USER:$CLAUDE_USER /opt/trading

log "Updating .env MEMORY_DIR"
sed -i "s|MEMORY_DIR=.*|MEMORY_DIR=$CLAUDE_HOME|" /opt/trading/agent/.env

log "Rewriting systemd service to run as $CLAUDE_USER"
cat > /etc/systemd/system/claude-bot.service <<EOF
[Unit]
Description=Claude Telegram bot
After=network.target

[Service]
Type=simple
User=$CLAUDE_USER
Group=$CLAUDE_USER
WorkingDirectory=/opt/trading/agent
EnvironmentFile=/opt/trading/agent/.env
Environment=HOME=$CLAUDE_HOME
ExecStart=/usr/bin/node /opt/trading/agent/bot.mjs
Restart=always
RestartSec=10
StandardOutput=append:/opt/trading/logs/bot.log
StandardError=append:/opt/trading/logs/bot.log

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl restart claude-bot

sleep 3
if systemctl is-active --quiet claude-bot; then
  ok "Bot is running as $CLAUDE_USER"
else
  warn "Bot failed to start. Last logs:"
  tail -20 /opt/trading/logs/bot.log
  exit 1
fi

ok "Migration complete"
