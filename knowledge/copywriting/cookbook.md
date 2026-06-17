# 📖 Cookbook — Recettes étape par étape

> **LA fiche méthodologique du bot.** Quand Louis demande une production (hooks, brief, créa, script, etc.), tu DOIS suivre la recette correspondante étape par étape. Pas d'improvisation. Pas de "moyen". Tu appliques la recette → tu sors un produit fini banger.

---

## ⚠️ Règle d'or universelle

> **Préfère TOUJOURS un mot/citation du persona à un mot inventé.**
> Si tu veux écrire "tête rouge" → STOP. C'est pas dans le persona. Cherche dans `voix-client.md` ce qu'ils disent vraiment.

---

# 🍳 Recette N°1 — Écrire des HOOKS / TITRES

## Input attendu
- Combien de hooks (3, 5, 10) ?
- Pour quel awareness level ?
- Pour quel sous-persona (Julien terrain / Urbain stressé / Dating-conscient) ?
- Pour quel format (statique, native, VSL) ?
- Pour quel trigger (si précisé) ?

Si l'un de ces inputs n'est pas précisé → **demande UNE clarification courte**. OU produis une variation par défaut en l'expliquant.

## Workflow (8 étapes)

### Étape 1 — Lire les fiches obligatoires
- `business/persona.md` (douleurs, désirs, triggers, vocabulaire)
- `business/voix-client.md` (golden nuggets bruts)
- `business/positionnement.md` (mots autorisés/bannis)
- `business/produit.md` (mécanisme à dramatiser)
- `business/swipe-file-titres.md` (templates pré-rédigés)

### Étape 2 — Mapper le persona × awareness
Pour le sous-persona et awareness ciblé, identifier :
- Quelles **douleurs principales** activer ?
- Quels **triggers concrets** sont pertinents ?
- Quels **golden nuggets bruts** s'appliquent ?

### Étape 3 — Choisir N techniques DIFFÉRENTES
Si tu produis X hooks, applique X techniques DIFFÉRENTES (pas 5 fois la même formule).

**Techniques natives** (cf `meta-ads/native-ads.md`) :
1. **Vrai coupable** (*"Ce n'est pas X, c'est Y"*)
2. **Open loop** (*"Even my husband couldn't believe..."*)
3. **Call-out** (*"Read this if you..."*)
4. **Autorité qui alerte** (*"Top dermatologist warns..."*)
5. **Transformation émotionnelle** (*"Finally wearing X again"*)
6. **Confidence** (*"We need to talk about..."*)
7. **Product / Bénéfice** (rare, surutilisé)

**Techniques classiques** (cf `meta-ads/structure-ad-copy.md`) :
8. **Promesse de résultat direct**
9. **Offre chiffrée**
10. **Bénéfice fonctionnel simple**
11. **Urgence / Événement**
12. **Preuve sociale**
13. **Question intrigante**

**Techniques des livres** :
14. **How to + bénéfice** (Caples / Ogilvy)
15. **Promise + Intrigue + Mécanisme + Émotion** (Schwartz 4-en-1)
16. **Specificité chiffrée** (Hopkins : "47% / 30 jours / 1018 expériences")
17. **Story appeal** (Ogilvy : photo qui pose une question)
18. **Pattern interrupt** (Schwartz : mot inattendu — "sneaky")

### Étape 4 — Pour chaque hook, piocher 1 CITATION BRUTE du persona
Ouvre `voix-client.md`. Identifie la phrase qui **colle au trigger choisi**. Reprends-la **mot pour mot** ou avec une **micro-adaptation** (10% max).

### Étape 5 — Construire selon la technique
Applique la technique CHOISIE à la citation. Ne fais PAS du tout générique.

**Exemple correct** :
- Citation V22 : *"Je m'inquiète que mes grosses joues roses soient un gros frein pour les femmes."*
- Technique : **Confidence** (= une copine raconte son secret)
- Hook produit : *"On peut parler 2 minutes ? Mes joues rouges m'ont coûté 3 dates ce mois-ci."*

### Étape 6 — Test du LVL 3 (golden-nuggets.md)
Pour chaque hook, demande-toi :
- LVL 1 (gentil) : *"Je suis fatigué de rougir."* → MOLLE
- LVL 2 (mieux) : *"Mes joues rouges me gênent en sortie."* → OK
- LVL 3 (banger) : *"Mes joues rouges m'ont coûté 3 dates ce mois-ci."* → 🔥

Si ton hook est LVL 1 ou 2 → réécris-le pour atteindre LVL 3.

### Étape 7 — Vérifier les mots
Passe ton hook au crible :
- ❌ Mots bannis : guérir, soigner, rosacée, miracle, anti-âge, peau sensible, sublime, éclat...
- ❌ Mots inventés (pas dans `voix-client.md`) : tête rouge, peau de tomate, etc.
- ✅ Mots autorisés : rougir, contrôler, apaiser, rééquilibrer, barrière cutanée...

Si tu utilises un mot inventé → STOP, retourne dans `voix-client.md` chercher la vraie formulation.

### Étape 8 — Varier les triggers
Si tu produis 5 hooks, varie les triggers (matin / sport / chaud-froid / alcool / stress / dating). Pas 5 fois "alcool". Pas 5 fois "sport".

## ✅ Checklist de validation (à valider AVANT d'envoyer)
- [ ] J'ai utilisé X techniques DIFFÉRENTES et je les ai **NOMMÉES** à côté de chaque hook ?
- [ ] J'ai utilisé EXCLUSIVEMENT des mots du `voix-client.md` (0 mot inventé) ?
- [ ] J'ai varié les triggers (au moins 4 différents si 5+ hooks) ?
- [ ] J'ai cité ou adapté au moins 3 golden nuggets bruts ?
- [ ] J'ai respecté les mots bannis ?
- [ ] J'ai passé chaque hook au test LVL 3 ?
- [ ] J'ai indiqué le sous-persona ciblé et le niveau d'awareness ?

## Format de sortie type

```
**Hook #1** — Technique : VRAI COUPABLE | Sous-persona : Urbain stressé | Awareness : Problem
→ "Ce qui te rend rouge en bureau, c'est pas la clim. C'est ta barrière cutanée."
[Source : voix-client.md (V11), native-ads.md technique #1]

**Hook #2** — Technique : OPEN LOOP | Sous-persona : Dating-conscient | Awareness : Unaware
→ "3 dates annulées ce mois-ci. Pas à cause de mon profil."
[Source : voix-client.md (V22), native-ads.md technique #2]

(etc.)
```

---

# 🧪 Recette N°2 — Brief de TESTING

## Input attendu
- Budget journalier (50€/j, 100€/j, etc.)
- Format(s) souhaité(s) (statique only, mix vidéo/statique, native only) ?
- Période d'observation ?
- Objectif (rentabilité immédiate / scaling / exploration de nouveau marché) ?

## Workflow (12 étapes)

### Étape 1 — Calcul technique
Calculer max créas selon Andromeda : Budget / 3 = Max créas.
- 50€/j → 15-18 créas
- 100€/j → 30-35 créas
- 300€/j → 75-100 créas

### Étape 2 — Définir la balance winners / new
**Règle d'or** :
- ~40% **winners rebbostés** (concepts ayant déjà converti dans tes data)
- ~60% **nouveaux concepts** à explorer (pour casser stagnation + trouver le prochain hit)

### Étape 3 — Définir la balance awareness (POUR SCALER)
- **60-70% TOFU (Unaware/Problem Aware)** → élargir la poche d'audience (= scaler)
- **20-30% MOFU (Solution/Product Aware)** → qualifier
- **10-15% BOFU (Most Aware/Offre)** → closing + écosystème

> ⚠️ **Le rôle CRITIQUE des Unaware** : ils n'ont pas le meilleur ROAS direct, mais ils font ENTRER de nouveaux prospects dans le funnel. Sans Unaware → poche d'audience plafonne → ROAS s'effondre (cf Playbook 2 Andromeda).

### Étape 4 — Mapper sur les 3 sous-personas
Tu DOIS proposer **au minimum 1 concept par sous-persona** :
- 🌳 **Julien terrain** (actif exposé : sport, soleil, travail extérieur)
- 🏢 **Urbain stressé** (bureau, chaud-froid, vie nocturne)
- 💕 **Dating-conscient** (image sociale, photos, rencontres)

→ Si tu ne mentionnes que 1-2 sous-personas dans ton brief, tu rates de la diversité.

### Étape 5 — Choisir les triggers à activer
Sur les 8 triggers (matin, sport, chaud-froid, alcool, stress, épices, soleil, dating) → en utiliser 4-6 différents minimum.

### Étape 6 — Définir les concepts (4-7 max)
Chaque concept = 1 angle + 1 awareness + 1 sous-persona dominant + 1 trigger.

Diversifier les formats :
- Statique liste avec checkmarks
- Statique offre
- Statique comparaison (us vs them)
- Statique avant/après
- Native ad UGC face caméra
- Native ad storytelling fondateur

### Étape 7 — Pour CHAQUE concept, appliquer la Recette N°1 (hooks)
Tu produis 2-3 titres par concept en respectant les 8 étapes hook.

### Étape 8 — Définir la durée d'analyse minimum
- 3-5 jours minimum avant analyse
- 100-150€ de spend minimum avant de conclure
- Analyser sur tranches de 3-7 jours, pas en jour-par-jour

### Étape 9 — Définir les KPIs cibles
Citer les marges réelles depuis `business/offre.md` :
- À 29,90€ : marge 26€ → CPA max 18€ pour ROAS 1,5
- À 17,90€ : marge 14€ → CPA max 9€ pour ROAS 1,8

### Étape 10 — Anticiper les playbooks
Préciser ce qu'on fait si :
- ROAS < 1 → Playbook 2 (créative fatigue ou poche d'audience)
- CPA OK mais ATC < 5% → Playbook 1 (site / offre / trust)
- CPM > 50€ → Playbook 3 (cohérence créa/persona)

### Étape 11 — Prioriser la production
Donner un ordre :
1. **D'abord** les concepts à fort potentiel (basés sur data Meta + native ads winners)
2. **Puis** les concepts d'exploration
3. **En dernier** les concepts BOFU/offre

### Étape 12 — Récap actionable
1 phrase qui résume : *"X concepts × Y créas dans 1 CBO broad, prioriser concepts A et B, attendre 100-150€ de spend avant d'analyser, objectif ROAS Z."*

## ✅ Checklist de validation
- [ ] J'ai calculé le max créas selon le budget ?
- [ ] J'ai respecté la balance winners/new (~40/60) ?
- [ ] J'ai majoritairement des TOFU pour scaler ?
- [ ] J'ai au minimum 1 concept par sous-persona ?
- [ ] J'ai varié 4-6 triggers minimum ?
- [ ] J'ai diversifié les formats (statique/native/UGC) ?
- [ ] Pour chaque concept, j'ai 2-3 titres bangers (Recette N°1) ?
- [ ] J'ai cité les marges réelles dans les CPA cibles ?
- [ ] J'ai anticipé les playbooks de troubleshooting ?

---

# 🎬 Recette N°3 — Native ad complète

## Workflow (15 étapes)

### Étape 1-3 — Choisir
- Concept visuel (parmi 5 de `native-ads.md` : pain point / product / avatar / context / before-after)
- Type de titre (parmi 7 : vrai coupable / open loop / etc.)
- Structure copy (parmi 4 : faux coupable / histoire / preuve+offre / fondateur)

### Étape 4 — Choisir un sous-persona dominant
Et un trigger principal.

### Étape 5 — Hook (1ère ligne)
Style oral, 1ère personne :
- *"Alors voilà..."*
- *"Bro, je vais être franc..."*
- *"On peut parler 2 minutes ?"*

Doit contenir une **scène viscérale** ou un **chiffre spécifique** :
- ❌ *"Je rougissais souvent."*
- ✅ *"3 dates annulées ce mois-ci à cause de mes joues rouges."*

### Étape 6 — Squelette structure 1 ("Faux coupable / Mécanisme")
9 blocs (cf `meta-ads/native-ads.md`) :
1. Hook en "je"
2. Agiter le problème (quotidien hyper concret)
3. La fausse piste (tout ce que t'as essayé)
4. Le vrai coupable + mécanisme
5. Pourquoi le reste échoue
6. La découverte
7. Le produit = conclusion logique
8. Timeline de preuve + l'entourage qui voit
9. Close soft + garantie + lien

### Étape 7 — Désarmer le scepticisme AVANT qu'il vienne
Sème dans le texte : *"J'étais sceptique aussi"*, *"J'ai essayé tellement de crèmes que..."*

### Étape 8 — Proxy validation
Ajoute une mention de l'entourage qui remarque sans qu'on dise rien :
- *"Au boulot, on m'a demandé si j'étais en vacances."*
- *"Ma meuf m'a demandé si j'avais arrêté de boire."*

### Étape 9 — Spécificité chiffrée (Hopkins)
- *"Au bout de 17 jours..."*
- *"3 fois moins de bouffées."*
- *"-50% de rougeurs en 30 jours"*

### Étape 10 — Bouche à oreille
- *"J'en ai parlé à mon coloc."*
- *"Mon pote m'a demandé ce que j'utilisais."*

### Étape 11 — Anti-pubicitaire
Pas de "ACHÈTE VITE -50%". Closing soft : *"Si tu te reconnais, le lien est dans le profil."*

### Étape 12 — Une seule grande idée
NE PAS mélanger plusieurs angles. Une native = un mécanisme + un reframe.

### Étape 13 — Test LVL 3 sur le hook
Cf Recette N°1 Étape 6.

### Étape 14 — Vocabulaire scan
Cf Recette N°1 Étape 7.

### Étape 15 — Émotion d'abord, logique ensuite
Le hook = émotion. Le mécanisme = logique. Jamais l'inverse.

## ✅ Checklist de validation
- [ ] Concept visuel + type de titre + structure copy choisis et nommés ?
- [ ] Sous-persona + trigger dominants identifiés ?
- [ ] Hook viscéral / chiffré au LVL 3 ?
- [ ] Scepticisme désarmé en amont ?
- [ ] Proxy validation incluse ?
- [ ] Spécificité chiffrée (Hopkins) ?
- [ ] 1 seule grande idée ?
- [ ] Émotion → logique (pas l'inverse) ?
- [ ] Closing soft ?
- [ ] Marque qui apparaît seulement à la fin ?

---

# 🎨 Recette N°4 — Statique avec ad copy

## Workflow (rapide)

### Étape 1 — Choisir 1 format parmi 4
- **Comparaison** (avant/après, us vs them)
- **Headline + Callouts** (titre fort + 3-5 value props)
- **Offer based** (prix barré, garantie, produit visible)
- **UGC + avis** (témoignage authentique surligné)

### Étape 2 — Choisir 1 angle dominant (1 seul !)
Promesse OU offre OU émotion OU curiosité OU preuve sociale OU urgence.

### Étape 3 — Headline ultra-court (<7 mots)
Doit passer le **test des 500 millisecondes** :
- Q1 : *"Qu'est-ce que c'est ?"*
- Q2 : *"En quoi ça m'aide ?"*

### Étape 4 — Wording = voix client
Banni les phrases marketing molles ("Je me sens revivre"). Utilise les golden nuggets bruts.

### Étape 5 — Vérifier la congruence
Le titre et l'image racontent **la même histoire**. Si la créa est chargée → titre simple. Si la créa est minimale → titre explicatif/USP forte.

### Étape 6 — Ad copy (Hook → Bénéfices → Preuves → Offre → CTA)
- Hook : 1 des 8 types (`structure-ad-copy.md`)
- Bénéfices : checkmarks ✅ (80% des winners en utilisent)
- Preuves : témoignage / chiffres / garantie
- Offre : à la FIN, après avoir construit la valeur
- CTA : soft

## ✅ Checklist
- [ ] Format choisi parmi 4 ?
- [ ] 1 SEUL angle dominant ?
- [ ] Headline < 7 mots ?
- [ ] Wording vient du voix-client.md ?
- [ ] Congruence titre × image ?
- [ ] Ad copy suit Hook → Bénéfices → Preuves → Offre → CTA ?
- [ ] Offre EN FIN, pas au début ?

---

# 🛡 RÈGLES TRANSVERSALES — Toujours

Quel que soit ce que tu produis :

## ❌ JAMAIS
- Inventer un mot/expression hors du `voix-client.md` (ex : "tête rouge")
- Promettre guérison, "soigner", "anti-rosacée"
- Promettre résultat < 30 jours
- Utiliser "miracle", "révolutionnaire", "magique"
- Surcharger d'angles ("Une seule grande idée par ad")
- Donner une réponse business sans avoir lu les 5 fiches business

## ✅ TOUJOURS
- Citer la TECHNIQUE utilisée à côté de chaque production
- Citer la SOURCE (quelle fiche, quel verbatim)
- Varier les triggers et sous-personas
- Tester chaque titre contre le LVL 3
- Désarmer scepticisme + proxy validation + spécificité chiffrée
- Émotion d'abord, logique ensuite
- Préciser le sous-persona et l'awareness ciblé
