# Synchro Web ↔ Bot (Louis)

Ce fichier est mis à jour par le Claude Web (claude.ai/code) à chaque
échange important avec Louis. Le bot Telegram pull ce fichier avant chaque
réponse, donc il sait tout ce que le Claude Web et Louis se sont dit
récemment.

**Lis ce fichier au début de chaque message pour avoir le contexte de ce
que Louis a discuté en parallèle sur le web.**

---

## 2026-06-15 19:10 — Échange sur la mémoire et la synchro

Louis veut une expérience "fluide" entre moi (Claude Web) et toi (Bot
serveur). Concrètement : quand il me parle ici, il veut que toi (sur le
bot Telegram ou via PowerShell) tu sois au courant.

**Décision** : on synchronise via ce fichier `sync/web-chat.md`. À chaque
échange important côté web, j'append un résumé dedans. Toi tu pull le repo
avant chaque réponse et tu lis ce fichier.

**État du serveur (résumé)** :
- VPS Hetzner CX23 à Falkenstein, 6,59 €/mois — IP `167.233.100.212`
- Bot Telegram `@AssistantEcom_bot` opérationnel
- Whisper local installé pour transcrire les vocaux Telegram (modèle
  `small`, FR)
- WisprFlow installé sur le PC Windows de Louis pour dicter partout
- Bot tourne en tant qu'utilisateur `claude` (pas root) avec sudo
  passwordless
- Mémoire persistante : `CLAUDE.md`, `STATE.md`, `RULES.md`,
  `LEARNINGS.md`, journaux (recent/jours/semaines/mois) dans
  `/home/claude/`

**À faire encore** :
- [ ] Louis doit révoquer le token API Hetzner exposé dans le chat web
- [ ] Connecter Shopify (Admin API token)
- [ ] Connecter Meta Ads (Marketing API token + Ad account ID)
- [ ] Définir règles ROAS / budget max
- [ ] Récap quotidien 9h00 (timer systemd)
- [ ] TrendTrack si API publique
- [ ] Bots smart money crypto Solana (plus tard)

**Préférences de Louis** :
- Français, ton décontracté (tu, pas de jargon)
- Niveau débutant total, expliquer comme à un ado smart de 12 ans
- "Le mec le plus feignant de la terre" — fais tout par toi-même quand
  possible, ne demande à Louis QUE ce que tu ne peux pas faire seul
- Quand il y a un choix à faire, options numérotées cliquables + une
  recommandation marquée "Recommandé"
- Commandes shell : UN seul bloc copier-coller, jamais des étapes
  fragmentées
- Captures d'écran : il en envoie souvent, sers-t'en
