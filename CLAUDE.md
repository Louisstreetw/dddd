# Contexte — Louis (kdbiker92@gmail.com)

Tu reprends une conversation déjà bien avancée. Lis ce fichier avant de
répondre. Lis aussi les fichiers de mémoire listés plus bas. Ne re-pose
pas les questions déjà tranchées ici.

## Profil de l'utilisateur

- **Prénom** : Louis
- **Email** : kdbiker92@gmail.com
- **Niveau technique** : débutant total — n'a jamais utilisé PowerShell,
  SSH, ou un VPS avant aujourd'hui (15 juin 2026)
- **Style** : impatient, "le mec le plus feignant de la terre" (ses mots) —
  veut qu'on fasse tout à sa place
- **Langue** : français
- **OS perso** : Windows

## Règles de communication

- **Parle français**, ton décontracté (tu, pas de jargon)
- **Explique comme à un ado smart de 12 ans** — analogies concrètes, pas de
  technicismes inutiles
- **Ne pose JAMAIS de questions ouvertes** — utilise `AskUserQuestion`
  (mode interactif) ou propose des choix numérotés cliquables avec une
  recommandation ("Recommandé")
- **Fais tout par toi-même** dès que possible. Ne demande à Louis QUE ce
  que tu ne peux strictement pas faire seul (créer un compte avec sa carte
  bancaire, valider un email, OAuth, etc.)
- Quand tu donnes une commande shell, donne UN seul bloc copier-coller
- Captures d'écran : il en envoie souvent, sers-t'en

## Objectif global

Optimiser son e-commerce et automatiser ses décisions Meta Ads / Shopify
via Claude qui tourne 24/7 sur ce serveur. Louis veut piloter depuis
Telegram (depuis son tel, PC éteint).

Use cases concrets demandés par Louis :
- Suivre ROAS des campagnes Meta Ads CBO
- Augmenter / baisser le budget automatiquement selon le ROAS
- Alertes Telegram quand le ROAS chute
- Recap quotidien à 9h00 sur Telegram

Outils à connecter dans l'ordre de priorité :
1. **Telegram** (bot pour parler depuis le tel) ← en cours
2. **Meta Ads** (auto-pilotage des campagnes)
3. **Shopify** (monitoring ventes + stocks)
4. **TrendTrack** (à investiguer, peut-être pas d'API publique)
5. **Bots smart money crypto** (plus tard)

## Infra en place (15 juin 2026)

- **VPS Hetzner Cloud** : `claude-trading-01`
  - Type **cx23** (2 vCPU, 4 Go RAM, 40 Go SSD)
  - Location **Falkenstein (fsn1)**, Ubuntu 24.04 LTS
  - IP `167.233.100.212`
  - Prix **6,59 €/mois** TTC (plafonné, facturé à l'heure)
- **Auth** : clé SSH Ed25519 sur le PC Windows de Louis
  (`C:\Users\kdbik\.ssh\hetzner`), publique uploadée sur Hetzner sous
  `claude-key`. Pas de password root SSH.
- **Installé via** `setup.sh` du repo `louisstreetw/dddd` :
  Node.js 22 LTS, Docker + Compose, Claude Code CLI, UFW (SSH only),
  fail2ban
- **Workspace** : `/opt/trading/{bots,configs,logs,agent}`

## Mémoire persistante (architecture)

Lis ces fichiers au démarrage. Mets-les à jour quand tu apprends quelque
chose ou prends une décision.

| Fichier | Contenu | Quand le mettre à jour |
|---|---|---|
| `/root/STATE.md` | État actuel (comptes connectés, bots actifs, configs) | Quand une config change |
| `/root/RULES.md` | Règles métier de Louis (seuils ROAS, budgets max) | Quand Louis change une règle |
| `/root/LEARNINGS.md` | Leçons apprises (ce qui marche, ce qui marche pas) | Quand tu observes un pattern |
| `/root/journal-recent.md` | Conversations détaillées des 7 derniers jours | Auto (bot Telegram + actions) |
| `/root/journal-jours.md` | Résumés quotidiens (J-7 à J-30) | Auto (compaction nocturne 03:30) |
| `/root/journal-semaines.md` | Résumés hebdo (J-30 à 1 an) | Auto |
| `/root/journal-mois.md` | Résumés mensuels (+1 an) | Auto |

**Important** : à chaque interaction importante (décision, action,
nouvelle info), append dans `/root/journal-recent.md` avec un timestamp
et le contenu pertinent. La compaction nocturne s'occupe du reste.

Quand Louis te dit "tu te souviens de X il y a 3 mois ?", relis
`journal-jours.md` puis `journal-semaines.md` pour retrouver l'info.

## Bot Telegram + notifications

- Service systemd : `claude-bot` (logs : `/opt/trading/logs/bot.log`)
- Code : `/opt/trading/agent/bot.mjs`
- Token dans `/opt/trading/agent/.env` (chmod 600)
- Owner chat ID enregistré dans `/root/.telegram-owner` au premier
  `/start`
- Pour envoyer un message proactif à Louis :
  `node /opt/trading/agent/notify.mjs "Texte du ping"`
  (utilise la même `.env` pour le token)

## Raccourci Windows

Louis a un raccourci bureau qui lance directement Claude Code sur le
serveur via SSH :
`powershell.exe -NoExit -Command "ssh -i $env:USERPROFILE\.ssh\hetzner root@167.233.100.212 -t claude"`

## Sécurité — à rappeler si pas encore fait

Le token API Hetzner (`claude-setup`) a été exposé dans le chat web
pendant le setup. Louis doit le révoquer (console Hetzner → Security →
API Tokens). Pour automatiser depuis Claude plus tard, il en
regénérera un nouveau et le mettra en variable d'env, pas en clair.

## Ce qui reste à faire

- [ ] Révoquer l'ancien token Hetzner exposé
- [ ] Connecter Meta Ads (Marketing API token + ID du compte)
- [ ] Définir avec Louis les règles ROAS / budgets max
- [ ] Configurer le récap quotidien 9h00 (timer systemd)
- [ ] Connecter Shopify (Admin API token)
- [ ] Connecter TrendTrack si API dispo
- [ ] Plus tard : bots smart money crypto Solana
