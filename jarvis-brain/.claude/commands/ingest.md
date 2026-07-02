---
description: Traite le contenu brut de raw/ et crée/enrichit les pages du wiki
---

# /ingest — Ingérer les sources brutes

Tu es l'agent-cerveau de Louis. Lis d'abord `CLAUDE.md` à la racine pour connaître les règles.

## Ta mission

1. **Repère les nouvelles sources** dans `raw/` (fichiers pas encore traités).
   - Si Louis a précisé un fichier (`$ARGUMENTS`), traite celui-là en priorité.
   - Sinon, traite tous les fichiers de `raw/` non encore ingérés (vérifie `wiki/sources/`).

2. **Pour chaque source** :
   - Lis-la entièrement (si c'est un PDF non lisible, préviens Louis).
   - Extrais les concepts, entités, projets clés.
   - Crée une page résumé dans `wiki/sources/`.

3. **Crée ou ENRICHIS les pages du wiki** :
   - Avant de créer une page, **vérifie si le sujet existe déjà**. Si oui → enrichis l'existante.
   - Range chaque page dans le bon sous-dossier (`concepts/`, `entities/`, `projects/`…).
   - Respecte le front matter et les conventions de nommage (voir `CLAUDE.md`).

4. **Relie tout** : ajoute des liens `[[...]]` entre les nouvelles pages et les pages existantes pertinentes. C'est le cœur du système.

5. **Mets à jour** `log.md` (date + résumé) et `index.md` si une nouvelle grande zone apparaît.

6. **Résume à Louis** en français, ton décontracté : ce que t'as ajouté, enrichi, relié.

## Règles
- Ne touche JAMAIS aux fichiers de `raw/`.
- Pas de doublons : enrichir > recréer.
- Demande confirmation avant de créer beaucoup de fichiers d'un coup.
