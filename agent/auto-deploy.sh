#!/usr/bin/env bash
set -euo pipefail

REPO_DIR=/opt/trading/repo
AGENT_DST=/opt/trading/agent
HOME_CLAUDE=/home/claude
NOTIFY="$AGENT_DST/notify.mjs"
BRANCH=claude/charming-rubin-f81h5m
LOG=/opt/trading/logs/auto-deploy.log

mkdir -p "$(dirname "$LOG")"

ts() { date '+%Y-%m-%d %H:%M:%S'; }
log() { echo "[$(ts)] $*" >> "$LOG"; }

# Make sure git trusts this dir even if owned by 'claude'
git config --global --add safe.directory "$REPO_DIR" 2>/dev/null || true

cd "$REPO_DIR"

# Fetch latest without merging
git fetch --quiet origin "$BRANCH" 2>/dev/null || {
  log "fetch failed"
  exit 0
}

LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse "origin/$BRANCH")

if [[ "$LOCAL" == "$REMOTE" ]]; then
  exit 0
fi

# Capture commit messages for notification (max 8)
MSGS=$(git log --pretty=format:"• %s" "$LOCAL..$REMOTE" | head -8)

log "update detected, deploying: $LOCAL -> $REMOTE"

# Pull the new code
git pull --quiet --rebase=false

# Copy updated agent files (only those that exist in the repo)
for f in bot.mjs transcribe.py notify.mjs memory.mjs; do
  if [[ -f "agent/$f" ]]; then
    cp -f "agent/$f" "$AGENT_DST/$f"
  fi
done

# Copy memory templates (CLAUDE.md only — leave business state untouched)
if [[ -f CLAUDE.md ]]; then
  cp -f CLAUDE.md "$HOME_CLAUDE/CLAUDE.md"
fi

# Refresh systemd unit files if changed
for unit in claude-bot.service claude-memory.service claude-memory.timer claude-deploy.service claude-deploy.timer; do
  if [[ -f "agent/systemd/$unit" ]] && ! cmp -s "agent/systemd/$unit" "/etc/systemd/system/$unit" 2>/dev/null; then
    cp -f "agent/systemd/$unit" "/etc/systemd/system/$unit"
    systemctl daemon-reload
    log "systemd unit updated: $unit"
  fi
done

# Run npm install if package.json changed
if [[ -f agent/package.json ]]; then
  if ! cmp -s "agent/package.json" "$AGENT_DST/package.json" 2>/dev/null; then
    cp -f "agent/package.json" "$AGENT_DST/package.json"
    (cd "$AGENT_DST" && npm install --omit=dev --silent) || log "npm install failed"
  fi
fi

# Fix ownership for claude user
if id -u claude >/dev/null 2>&1; then
  chown -R claude:claude "$AGENT_DST" "$HOME_CLAUDE/CLAUDE.md" 2>/dev/null || true
fi

# Restart the bot in the background so notification still goes out
(sleep 1 && systemctl restart claude-bot) &

# Send Telegram notification (best effort)
if [[ -f "$NOTIFY" ]]; then
  MSG="🚀 Mise à jour déployée sur le serveur

$MSGS"
  /usr/bin/node "$NOTIFY" "$MSG" 2>>"$LOG" || true
fi

log "deploy ok ($REMOTE)"
