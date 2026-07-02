# 🧠 Second Cerveau de Jarvis — Schéma & Règles

> Ce fichier est le **contrat** entre toi (Claude Code) et le cerveau.
> Tu le lis au début de CHAQUE session. Il définit comment ranger, écrire et relier la connaissance.
> Inspiré de l'approche "LLM-compiled wiki" d'Andrej Karpathy.

---

## 🎯 C'EST QUOI CE DOSSIER

C'est un **second cerveau persistant** en fichiers Markdown. Le but : accumuler la
connaissance de Louis (sa veille, ses projets, ses idées, son identité) une bonne
fois pour toutes, au lieu de tout réexpliquer à chaque session.

**Principe** : ta connaissance devient du code. Obsidian = l'éditeur, toi = le
programmeur, le `wiki/` = la codebase.

---

## 🏛️ ARCHITECTURE EN 3 COUCHES

### 1. `raw/` — les sources brutes (ENTRÉE)
- On y dépose tout en vrac : PDF, articles, transcriptions, notes, captures web.
- **Tu LIS ces fichiers, mais tu n'y TOUCHES JAMAIS.** C'est la source de vérité brute.

### 2. `wiki/` — la connaissance propre (SORTIE)
- Des fichiers `.md` que **tu écris et maintiens**.
- Une page par concept / entité / projet / source.
- Toutes les pages sont **reliées entre elles** avec des liens `[[Nom de la page]]` (comme Wikipédia).

### 3. `CLAUDE.md` — le schéma (CE FICHIER)
- Les règles et conventions. Ton mode d'emploi.

Dossier annexe : `assets/` = images, logos, PDF de référence (fichiers non-texte).

---

## 📁 STRUCTURE DU WIKI

Range les pages du `wiki/` dans ces sous-dossiers :

- `wiki/concepts/` — idées, notions, méthodes (ex : "RAG", "CBO Meta Ads")
- `wiki/entities/` — personnes, entreprises, outils, modèles (ex : "Anthropic", "Louis")
- `wiki/projects/` — projets en cours
- `wiki/sources/` — résumé d'une source précise (1 fichier de `raw/` = 1 page source)
- `wiki/synthesis/` — synthèses générées suite à des questions (`/query` → `/save`)

Crée le sous-dossier s'il n'existe pas encore.

---

## ✍️ CONVENTIONS D'ÉCRITURE D'UNE PAGE WIKI

Chaque page `.md` commence par un **front matter** (métadonnées entre `---`) :

```markdown
---
type: concept        # concept | entity | project | source | synthesis
title: Nom clair
tags: [ia, veille]
created: 2026-07-02
sources: [raw/article-1.md]
---

# Nom clair

Résumé en 1-2 phrases de ce que c'est.

## Détails
Le contenu structuré...

## Liens
- Relié à [[Autre page]]
- Voir aussi [[Encore une page]]
```

### Règles d'écriture
1. **Toujours relier** : chaque page doit pointer vers au moins 1 autre page via `[[...]]`.
2. **Avant de créer une page, vérifie si elle existe déjà.** Si oui → tu ENRICHIS l'existante, tu ne crées pas de doublon.
3. **Noms de fichiers** : minuscules, tirets, pas d'accents ni d'espaces ni de caractères spéciaux. Ex : `rag-vs-wiki.md`, pas `RAG vs Wiki (2).md`.
4. **Concis et factuel.** Pas de blabla. Si une info vient d'une source, cite-la.
5. **Français** pour le contenu (Louis est français). Les noms de fichiers restent simples.

---

## 🔄 RÈGLE D'OR : LE CERVEAU S'AUTO-ENTRETIENT

À chaque ajout de connaissance :
1. Cherche si le sujet existe déjà dans `wiki/`.
2. S'il existe → mets à jour et enrichis, puis relie au reste.
3. S'il est nouveau → crée la page, PUIS relie-la aux pages existantes pertinentes.
4. Note l'action dans `log.md` (date + ce qui a été fait).
5. Mets à jour `index.md` si une nouvelle grande zone de connaissance apparaît.

---

## 🛠️ COMMANDES DISPONIBLES

Les slash commands sont dans `.claude/commands/` :

- `/ingest` — traite le contenu brut de `raw/` et crée/enrichit les pages wiki
- `/query` — interroge le cerveau (répond à partir du wiki)
- `/save` — range une réponse importante comme synthèse dans le wiki
- `/lint` — check-up santé : cherche contradictions, doublons, liens cassés

---

## 📌 IDENTITÉ DE LOUIS (à connaître)

- Prénom : **Louis** — tutoiement, ton décontracté, français, débutant technique.
- Ne jamais inventer un contexte que Louis n'a pas donné.
- Ce cerveau est générique : on y met TOUT ce que Louis veut mémoriser.
