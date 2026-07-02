---
description: Interroge le second cerveau et répond à partir du wiki
---

# /query — Interroger le cerveau

Lis `CLAUDE.md` à la racine pour les règles.

## Ta mission

1. Prends la question de Louis : `$ARGUMENTS`
2. **Cherche la réponse dans `wiki/`** (et si besoin `raw/`). Navigue par les liens `[[...]]`.
3. Réponds de façon **claire, en français, ton décontracté**, en citant les pages du wiki utilisées.
4. Si l'info n'existe pas dans le cerveau → dis-le franchement, ne l'invente pas. Propose d'ajouter une source dans `raw/`.
5. Si ta réponse a produit une **synthèse utile** (croisement de plusieurs pages), propose à Louis :
   *"Tu veux que je sauvegarde cette réponse comme synthèse dans le wiki ? (`/save`)"*

## Règle
- Réponds UNIQUEMENT à partir du contenu du cerveau. Pas d'invention.
