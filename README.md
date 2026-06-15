# dddd — trading workstation

One-shot setup for a fresh Ubuntu VPS (tested on Hetzner Cloud, Ubuntu 22.04 / 24.04).

Installs:
- Node.js 22 LTS
- Docker + Compose
- Claude Code CLI
- UFW firewall + fail2ban (SSH hardening)
- A `/opt/trading` workspace for bots, configs, and logs

## Run

On the VPS as root:

```bash
curl -sSL https://raw.githubusercontent.com/louisstreetw/dddd/main/setup.sh | sudo bash
```

Then:

```bash
claude
```
