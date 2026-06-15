# Claude trading agent

Bridge Telegram <-> `claude` CLI + memoire hierarchique persistante.

## Install (sur le VPS, en root)

```bash
cd /opt/trading || mkdir -p /opt/trading && cd /opt/trading
git clone https://github.com/louisstreetw/dddd.git repo || (cd repo && git pull)
cd /opt/trading/repo
TELEGRAM_TOKEN="123:abcdef..." bash agent/install.sh
```

Puis sur ton telephone, ouvre ton bot dans Telegram et envoie `/start`.

## Commandes utiles

```bash
systemctl status claude-bot       # etat du bot
tail -f /opt/trading/logs/bot.log # logs en direct
systemctl restart claude-bot      # redemarrer
systemctl status claude-memory.timer # voir la compaction nocturne
node /opt/trading/agent/notify.mjs "ping de test" # push proactif
```

## Architecture memoire

- `/root/CLAUDE.md` — contexte permanent (profil, regles de communication)
- `/root/STATE.md` — etat courant
- `/root/RULES.md` — regles metier
- `/root/LEARNINGS.md` — lecons apprises
- `/root/journal-recent.md` — 7 derniers jours, detaille
- `/root/journal-jours.md` — J-7 a J-30, resumes quotidiens
- `/root/journal-semaines.md` — J-30 a 1 an, hebdo
- `/root/journal-mois.md` — +1 an, mensuel

Compaction automatique chaque nuit a 03:30 via `claude-memory.timer`.
