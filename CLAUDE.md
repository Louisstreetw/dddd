# Contexte — Louis (kdbiker92@gmail.com)

Tu reprends une conversation déjà bien avancée. Lis ce fichier avant de
répondre. Ne re-pose pas les questions déjà tranchées ici.

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
- **Ne pose JAMAIS de questions ouvertes** — utilise `AskUserQuestion` avec
  des options cliquables, recommande la meilleure option (label avec
  "Recommandé")
- **Fais tout par toi-même** dès que possible. Ne demande à Louis QUE ce
  que tu ne peux strictement pas faire seul (créer un compte avec sa carte
  bancaire, valider un email, etc.)
- Quand tu donnes une commande PowerShell ou shell, donne UN seul bloc
  copier-coller, jamais des étapes manuelles fragmentées
- Captures d'écran : il en envoie souvent, sers-t'en

## Projet — automatisation e-commerce + trading crypto

Objectif global : Claude qui tourne 24/7 sur un VPS pour automatiser
Shopify, suivre la "smart money" crypto sur Twitter, et travailler pendant
que son PC est éteint.

Outils à connecter dans l'ordre de priorité :

1. **Shopify** (admin token à générer)
2. **Bots smart money** crypto (trackers wallets, Cielo / Photon /
   Nansen-like)
3. **TrendTrack** (API à investiguer)
4. **Telegram** (pour me parler depuis son téléphone)

## Infra déjà en place (15 juin 2026)

- **VPS Hetzner Cloud** : serveur `claude-trading-01`
  - Type : **cx23** (2 vCPU, 4 Go RAM, 40 Go SSD)
  - Location : **Falkenstein (fsn1), Allemagne**
  - Prix : **6,59 €/mois** TTC (plafonné, facturé à l'heure ~0,009 €/h)
  - IP : `167.233.100.212` (à vérifier — peut changer si recréation)
- **OS** : Ubuntu 24.04 LTS
- **Auth** : clé SSH Ed25519 sur le PC Windows à
  `C:\Users\kdbik\.ssh\hetzner` (publique uploadée sur Hetzner sous le nom
  `claude-key`). Pas de password root SSH — uniquement clé.
- **Installé via** `setup.sh` du repo `louisstreetw/dddd` (branche
  `claude/charming-rubin-f81h5m`) :
  - Node.js 22 LTS
  - Docker + Compose
  - Claude Code CLI (`claude`)
  - UFW firewall (SSH only)
  - fail2ban
- **Workspace** : `/opt/trading/{bots,configs,logs}`

## Raccourci Windows

Louis a un raccourci sur son bureau qui lance directement Claude Code sur
le serveur :

    powershell.exe -NoExit -Command "ssh -i $env:USERPROFILE\.ssh\hetzner root@167.233.100.212 -t claude"

## Sécurité — à rappeler si pas encore fait

Le token API Hetzner (`claude-setup`) a été exposé dans le chat web pendant
le setup. Louis doit le révoquer (console Hetzner → Security → API Tokens
→ corbeille). Pour automatiser depuis Claude plus tard, il en regénèrera
un nouveau et te le filera *via une variable d'env* sur le serveur, pas
collé en clair dans la conversation.

## Ce qui reste à faire

- [ ] Révoquer l'ancien token Hetzner exposé
- [ ] Configurer Shopify (générer Admin API token côté admin Shopify)
- [ ] Choisir & configurer un bot smart money crypto (Solana en priorité)
- [ ] Investiguer si TrendTrack a une API publique
- [ ] Connecter Telegram (bot perso pour ping Louis depuis son téléphone)

## Quand Louis te parle

Première interaction sur ce serveur : accueille-le en disant que tu
connais le contexte, propose la prochaine étape (révoquer le token, puis
Shopify), et utilise `AskUserQuestion` avec des options cliquables.
