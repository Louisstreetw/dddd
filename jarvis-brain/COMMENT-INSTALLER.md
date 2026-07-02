# 🚀 Comment installer le cerveau sur ton PC (guide débutant)

Salut Louis. Ce dossier `jarvis-brain/` c'est le **second cerveau** de ton Jarvis.
Voici comment le récupérer sur ton PC et le brancher. Étape par étape, tranquille.

---

## PARTIE 1 — Récupérer le dossier sur ton PC

Le cerveau a été construit dans le cloud et poussé sur ton GitHub. Deux façons de le récupérer :

### Méthode A — Télécharger le ZIP (la plus simple)
1. Va sur ton dépôt GitHub `louisstreetw/dddd`.
2. En haut, change de branche : choisis **`claude/geopolitical-risk-monitoring-pz70qw`**.
3. Bouton vert **`Code`** → **`Download ZIP`**.
4. Décompresse le ZIP. Récupère le dossier **`jarvis-brain/`** dedans.
5. Copie-colle `jarvis-brain/` où tu veux sur ton PC (ex : à côté de ton Jarvis).

### Méthode B — Avec git (si tu connais un peu)
```bash
git clone https://github.com/louisstreetw/dddd.git
cd dddd
git checkout claude/geopolitical-risk-monitoring-pz70qw
# le dossier jarvis-brain/ est dedans
```

---

## PARTIE 2 — L'utiliser avec Claude Code

1. Ouvre le dossier **`jarvis-brain/`** dans VS Code.
2. Lance **Claude Code** dedans (comme dans les vidéos).
3. Claude lit automatiquement le `CLAUDE.md` → il connaît les règles.
4. Teste :
   - Mets un PDF ou un article dans le dossier `raw/`.
   - Tape `/ingest` → Claude range et relie tout dans `wiki/`.
   - Tape `/query "ta question"` → il répond depuis le cerveau.
   - `/lint` → check-up santé. `/save` → sauvegarder une réponse.
5. (Option) Installe **Obsidian**, ouvre le dossier `jarvis-brain/` comme "coffre" → tu vois le graphe joli.

👉 À ce stade, ton **cerveau fonctionne** et grossit à chaque `/ingest`.

---

## PARTIE 3 — Le brancher à ton JARVIS VOCAL (l'étape clé)

⚠️ Important : les commandes `/ingest` etc. marchent dans **Claude Code**.
Ton **Jarvis vocal** est un programme séparé. Pour qu'il utilise le cerveau quand
tu lui parles, il faut que le code de Jarvis **lise les fichiers du wiki**.

Selon comment ton Jarvis est fait, l'idée générale est :

- **Si Jarvis = serveur Python + API Claude** (le plus courant) :
  Dans le code du serveur, avant d'envoyer ta question à Claude, on charge le contenu
  du dossier `wiki/` et on l'ajoute au *system prompt* (ou on donne à Jarvis un accès
  fichier au dossier). Comme ça il "voit" ton cerveau à chaque réponse.

- **Si Jarvis lance Claude Code** :
  Alors c'est déjà bon — il suffit de le pointer vers le dossier `jarvis-brain/` et
  les commandes marchent direct.

### Ce que tu fais maintenant
Tu ne sais pas encore comment ton Jarvis est codé — c'est normal. La prochaine étape :
**montre-moi le code de ton Jarvis** (le dossier / les fichiers principaux) et je te
dis exactement quelle ligne ajouter pour brancher le cerveau. On le fera ensemble.

---

## Récap ultra simple

| Étape | Quoi | État |
|-------|------|------|
| 1 | Récupérer `jarvis-brain/` sur ton PC | à faire |
| 2 | L'utiliser avec Claude Code (`/ingest`, `/query`) | prêt |
| 3 | Brancher au Jarvis vocal (lire le wiki) | on le fera ensemble |
