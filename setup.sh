#!/usr/bin/env bash
set -euo pipefail

GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log()  { echo -e "${BLUE}[setup]${NC} $*"; }
ok()   { echo -e "${GREEN}[ok]${NC} $*"; }
warn() { echo -e "${YELLOW}[warn]${NC} $*"; }

if [[ $EUID -ne 0 ]]; then
  warn "Run this script as root (use: sudo bash setup.sh)"
  exit 1
fi

log "Updating system packages"
apt-get update -y
apt-get upgrade -y

log "Installing base packages"
apt-get install -y \
  curl \
  git \
  wget \
  unzip \
  build-essential \
  ca-certificates \
  gnupg \
  lsb-release \
  ufw \
  fail2ban \
  htop \
  tmux \
  jq \
  python3 \
  python3-pip \
  python3-venv

log "Installing Node.js 22 (LTS)"
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt-get install -y nodejs

log "Installing Docker"
install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" \
  > /etc/apt/sources.list.d/docker.list
apt-get update -y
apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
systemctl enable --now docker

log "Installing Claude Code CLI"
npm install -g @anthropic-ai/claude-code

log "Configuring firewall (UFW)"
ufw --force reset
ufw default deny incoming
ufw default allow outgoing
ufw allow OpenSSH
ufw --force enable

log "Configuring fail2ban (anti brute-force SSH)"
systemctl enable --now fail2ban

log "Creating workspace"
mkdir -p /opt/trading
mkdir -p /opt/trading/bots
mkdir -p /opt/trading/configs
mkdir -p /opt/trading/logs
chmod 750 /opt/trading

cat > /opt/trading/README.md <<'EOF'
# Trading workspace

- `bots/`     — bot source code & docker-compose stacks
- `configs/`  — API keys, .env files (chmod 600)
- `logs/`     — runtime logs

Start Claude Code:
    claude

Re-run setup:
    curl -sSL https://raw.githubusercontent.com/louisstreetw/dddd/main/setup.sh | sudo bash
EOF

ok "Setup complete"
echo
echo "Next steps:"
echo "  1. Run: claude"
echo "  2. Log in with your Anthropic account"
echo "  3. cd /opt/trading and start building"
