# Meta Ads Andromeda 2026 — KPIs, Setup CBO, Scaling & Playbooks

> Guide opérationnel Meta Ads post-Andromeda (l'algo 2026). **CBO > ABO**. Inclut KPIs benchmarks FR, méthode de testing, scaling vertical et **3 playbooks de troubleshooting** pour quand ça merde.

---

## 🎯 ABO vs CBO — depuis Andromeda

### ABO (Adset Budget Optimization)
Budget **fixe au niveau des adsets**. Le montant dépensé sera toujours le même sur chaque adset.
> ❌ **Plus recommandé depuis Andromeda.**

### CBO (Campaign Budget Optimization)
Budget au niveau **de la campagne**, réparti automatiquement entre les adsets selon les performances.
> ✅ **LA méthode recommandée en 2026.** Plus efficace, automatisée, scalable.

---

## 📊 KPIs de base pour le marché Français

| KPI | Définition | Benchmark |
|-----|------------|-----------|
| **CPA** (Coût Par Achat) | Coût pour déclencher 1 achat sur ta boutique | 10-15 € pour un panier moyen de 40 € |
| **CPM** (Coût Par Mille) | Coût pour 1000 impressions | 7-20 € selon les niches |
| **CPC** (Coût Par Clic) | Coût pour chaque clic sur l'annonce | 0,20-0,80 € selon les niches |
| **ROAS** | Revenus / Coût pub (ratio) | Doit toujours être > ton ROAS minimum |
| **CTR** (Taux de Clic) | % de clics sur impressions | ~2% |

### 🔥 LA métrique N°1 = la rentabilité
> Si tu n'es pas rentable → analyse les autres KPIs un par un pour voir ce qui cloche et itérer.

### Hiérarchie 2026
- **ROAS = priorité absolue**
- CPM/CPC/CTR = **secondaires**, utilisés pour le **diagnostic**

**Exemples** :
- CPM 150€, ROAS 3,5 = **rentable** → CPM élevé OK ✅
- CPM 15€, ROAS 0,8 = **pas rentable** → CPM bon mais ROAS mauvais ❌

### Quand regarder CPM/CPC/CTR ?
- Si ça ne fonctionne pas du tout → check ces métriques
- **CPM très élevé** = souvent problème **alignement** site/produit/offre/ads (Meta a du mal à trouver tes clients)
- Si ROAS bon → CPM élevé = pas grave

---

## 🚫 Les 3 erreurs fréquentes qui font qu'on ne chiffre pas

### 1. Le choix du produit
❌ Partir sur fashion / gadget / design = trop dépendant du goût client.
✅ Partir sur un produit **problème-solution** : si quelqu'un a ce problème, il achètera **sans se poser de question**. Plus le problème gâche la vie, plus c'est facile de chiffrer.

### 2. Le marketing
❌ Mettre en avant les **caractéristiques** du produit.
✅ Mettre en avant les **bénéfices**.
- Commence ta description par une **promesse** ("Une peau lisse en 30 jours seulement")
- Tous les **titres** doivent communiquer un bénéfice
- En lisant **uniquement les titres et les mots en gras**, on doit comprendre ce que fait ton produit et pourquoi l'acheter

### 3. Pas de patience / mentalité court terme
- L'e-com c'est un **vrai business**, pas un quick-flip
- **Teste sur plusieurs jours**, jamais couper au bout d'1 journée
- Pense long-terme : faire une boutique qui dure, pas chiffrer 1 mois et recommencer

---

## 🎨 Concevoir des créas performantes

### Formats de créas image (liste non exhaustive)
Focus produit • Memes • Avant/après • Post-it • Paint • Note iPhone • Comparaison (us vs them) • Problème/solution • Bullet points • Review • Story Insta réponse aux questions • Media press (inventer des noms de magazine).

> 🔥 **TOUT EST POSSIBLE** — il y en a des millions.

> ✅ **Les créas image SIMPLES fonctionnent le mieux.**

### Formats techniques
- **Feed** : 4:5 (1080 × 1350 px)
- **Story** : 9:16 (1920 × 1080 px) avec **250 px de zone safe** en haut et en bas

### L'ad copy
- Privilégier **long** (mais tester aussi court)
- Un bon adcopy permet à Meta de **mieux cibler** ensuite
- Essayer de se rapprocher de la **structure AIDA**
- ⚠️ **Pas trop agressif** sur promesses et bénéfices

---

## 🧪 Méthode de testing CBO

### Setup campagne CBO France : 50-100 €/jour
**Règle d'or : 1 adset par créa/concept/angle.**

```
Campagne CBO (budget global)
├── Adset broad #1 → 1 créa/concept (+ ses variations)
├── Adset broad #2 → 1 créa/concept (+ ses variations)
├── Adset broad #3 → 1 créa/concept (+ ses variations)
├── Adset broad #4 → 1 créa/concept (+ ses variations)
└── Adset broad #5 → 1 créa/concept (+ ses variations)
```

### Pourquoi la CBO ?
- Algo Andromeda très puissant
- Plus stable long-terme
- Moins de travail manuel
- Meta optimise automatiquement
- Si une créa est bonne → elle va prendre le spend
- Tout au même endroit = écosystème grâce aux points de touche

### Règles à respecter
- 1 **campagne** par produit / collection / event
- 1 **adset** par créa / concept / angle
- Toutes les **variations** d'un concept dans le MÊME adset
- ❌ **Jamais 2× la même créa** dans une campagne

### Nombre de créas recommandé
**Formule** : Budget journalier ÷ 3 = nombre max de créas

| Budget/jour | Max créas |
|-------------|-----------|
| 50 €/j | 15-20 créas max |
| 100 €/j | 30-35 créas max |
| 300 €/j | 75-100 créas max |

**Pourquoi ?** 1 créa a besoin d'environ **3€ minimum pour être testée**. Trop de créas = dilution du budget.

### Composition idéale
- **Mix images et vidéos**
- Commencer avec des concepts **basés sur les concurrents qui chiffrent**
- **Diversité** : différents angles, différents types (UGC, natif, focus produit...)
- ❌ Pas **20 UGC même angle** avec juste des hooks différents
- ⚠️ **Score de similarité** : créas trop similaires = Meta les ignore
- Quand tu itères, change **50%+** de la créa (pas juste le hook)
- **Angles différents**, pas itérations légères

---

## 📈 Lire et interpréter ses résultats

### Règles d'analyse
- La **rentabilité est toujours** la métrique la plus importante
- Toujours analyser quand il y a eu **assez de dépense** (100-150€ minimum sur tout le testing)
- Toujours analyser après **2-3 jours**
- Toujours prendre des décisions sur des tranches de **3-7 jours minimum**

### Quoi regarder selon le problème
| Symptôme | Métriques à analyser |
|----------|----------------------|
| Pas rentable | Coût par ATC + coût par paiement initié |
| Pas rentable | CPC + CPM (qu'est-ce qui cloche en amont ?) |
| CTR élevé mais pas rentable | Le CTR seul veut tout et rien dire — croiser avec CPM |

---

## 🔍 Les créas avec ROAS bas (nuances importantes)

### Cas 1 : Créa principale (celle qui prend tout le spend)
Si la créa qui prend le plus de budget n'est pas rentable, **ce sera pire avec les autres**. → Coupe ou itère.

### Cas 2 : Créa secondaire (ROAS bas mais d'autres rentables)
- Créa ROAS 1,5 pendant que d'autres à 2,5+
- → **GARDER** : elle fait le travail awareness
- Elle finit la vente des autres créas (effet écosystème)
- Meta gère la distribution au plus optimal

### EXCEPTION (très rare) : couper même une créa secondaire
- ROAS < 1 après **7-14j+**
- Impacte toute la CBO et plombe le ROAS global
- Couper malgré l'awareness apportée (le but reste la rentabilité)

### Règles globales
- **Si campagne CBO globalement rentable** → garde toutes les créas, même celles à ROAS 1,5 (elles ont un rôle écosystème)
- **Si une NOUVELLE créa prend tout le spend dès le début et ROAS mauvais** → laisser tourner 3-5j (si Meta spend dessus, c'est qu'il a détecté une opportunité que tu ne vois pas)

---

## 🚀 SCALING VERTICAL CBO — Augmenter le budget

> **Principe** : plus ton ROAS / profit est élevé, plus tu peux scaler agressivement.

### Comment ?
- Augmenter **directement le budget sur la campagne** (pas adset par adset)

### Quand ?
- **À minuit pour le lendemain**
- Pas en milieu d'une bonne journée

### Fréquence
- **Tous les jours** si tu veux scaler rapidement
- **Tous les 2-3 jours** pour être safe

### Si le ROAS baisse après scaling ?

| Situation | Action |
|-----------|--------|
| ROAS baisse mais TOUJOURS rentable | Normal (variance) → **continuer**, observer 48h |
| ROAS baisse, rentable mais proche du break-even | ⚠️ Attention → **ne rien faire 2-3j** + ajouter 5-10 créas |
| ROAS baisse, PAS rentable | 🚨 → **arrêter de scaler 2-3j** (+ baisser le budget si trop grosse baisse) + ajouter 5-10 créas |

---

## 🗺 Matrice de prise de décision (après lancement CBO)

```
Lancement CBO
  ↓
Laisser tourner 2-3 jours
  ↓
ROAS global > ROAS break-even ?
```

### Si campagne LÉGÈREMENT rentable
→ Laisser tourner sans scaler (ou très légèrement)
→ Vérifier le **trust marketing**
→ Tester des **offres plus intéressantes**

### Si BIEN rentable
→ Scaler directement le **budget de la CBO**
→ Ajouter **nouvelles créas**
→ Réduire le budget si les stats baissent

### Si PAS rentable
→ Analyser les stats :
- **Stats pub trop chères ?** → laisser tourner low budget. Si pas d'amélioration → revoir les pubs + ajouter de nouvelles créas
- **AOV trop bas ?** → améliorer l'offre de base. Augmenter la valeur perçue → augmenter les prix
- **Taux conv / ATC trop bas ?** → simplifier la page produit, vérifier le marketing, vérifier les fautes. Tester une offre **drastiquement** différente (Buy 1 Get 1, etc.). Éviter les offres trop complexes (1/2/3 produits) en testing.

---

## 📚 PLAYBOOKS (très important)

### 🛒 Playbook N°1 : CPA élevé / Taux d'ajout au panier faible

**Problème** : CPA trop élevé vs marges, ATC < 5%. Le trafic arrive mais ne convertit pas.

**Diagnostic** : Quand l'ATC est très faible, c'est rarement un problème d'ads. **C'est souvent côté SITE.**

#### Causes possibles
1. **Incohérence créas + page produit**
   - Créa montre produit bleu → page produit rouge
   - Créa promet -50% → page = prix plein
   - Créa vend bénéfice X → page ne le mentionne pas
   - → Les gens arrivent, sont déçus, partent
2. **Offre pas assez intéressante**
   - Prix trop élevé vs attentes
   - Pas de promo / bundle attractif
   - Frais de shipping trop chers ou cachés
3. **Marketing pas assez bon**
   - Copy faible (pas de bénéfices clairs)
   - Marges trop basses
   - Marketing trop complexe, ne va pas à l'essentiel
4. **Manque de trust**
   - Pas d'avis clients
   - Site fait cheap
5. **Page produit pas convaincante**
   - Description trop courte / générique
   - Pas de démo produit
   - Layout confus

#### Solutions
- Améliorer la **cohérence créas / page produit**
- Rendre l'offre plus attractive (+ urgence si possible)
- Optimiser le copy/marketing de la page
- Ajouter avis et trust badges
- Simplifier le parcours d'achat

---

### 📉 Playbook N°2 : CPA explose / ROAS s'effondre

**Problème** : CPA augmente progressivement (20 → 30€), ROAS s'effondre (3 → 1,8), dépenses montent, conversions baissent, sensation de perdre le contrôle.

#### Causes
1. **Créative fatigue**
   - Mêmes créas depuis plusieurs semaines
   - Audience saturée (a déjà vu 5-10× les mêmes pubs)
   - Frequency monte → performance baisse naturellement
2. **Poche d'audience pas assez grande**
   - Ton audience qualifiée a une **taille limitée**
   - Au début → tu touches les gens "chauds" (faciles)
   - En scalant → tu touches des gens "froids" (durs à convertir)
   - Plus on scale, plus les gens sont froids → plus il faut un BON site / marketing / offre / trust
3. **Mauvaise période**
   - Post-Q4, hors saison, certaines périodes naturellement plus dures
   - Il y a des marques qui pètent 2-3 mois puis reprennent
4. **Concurrence augmente**
   - Concurrent lance promos agressives
   - Marché saturé
   - Ton offre devient moins compétitive

#### Solutions par cause
| Cause | Solution |
|-------|----------|
| Creative fatigue | **Ajouter de nouvelles créas** (nouveaux angles) |
| Poche d'audience limitée | Améliorer site/marketing OU **offre plus attractive ou moins chère** (la plus impactante : baisser le prix élargit massivement la poche) |
| Mauvaise période | Baisser budget, **patienter 2-3 mois** |
| Concurrence | Baisser budget, **maintenir la présence**, attendre |

**Règle de focus** : se concentrer sur ce qui **élargit la poche d'audience** :
- Plus de créas (nouveaux angles)
- Site / marketing meilleur (convertit les "froids")
- Offre plus attractive ou moins chère (le plus impactant)

---

### 💸 Playbook N°3 : CPM extrêmement cher

**Problème** : CPM anormalement élevé (France : > 50€).

⚠️ Exception : si ton produit est cher (panier > 100€), CPM élevé = normal. Ce playbook concerne les cas où CPM est cher **sans raison évidente**.

#### Causes
1. **Incohérence créa / persona / produit**
   - Créas ne résonnent pas avec l'audience
   - Meta galère à trouver les bonnes personnes
   - Enchères élevées car mauvaise performance
2. **Mauvaise offre / mauvais marketing**
   - Meta ne trouve pas l'audience qualifiée
   - Lien avec Playbook 1 : site/offre faible → conv faible + CPM élevé
3. **Produit très cher** (panier > 100€)
   - CPM élevé = **normal**, pas un problème
4. **Période saturée**
   - Tout le monde achète des ads
   - Accepter ou baisser le budget

> 💡 **Un CPM élevé n'est PAS problématique si le ROAS est bon.** Un bon CPM peut signifier qu'on cible une audience très précise → taux de conversion plus élevé en parallèle.

---

## ✅ Checklist Meta Ads 2026

### Avant de lancer
- [ ] Produit problème-solution (pas gadget) ?
- [ ] Marketing focus bénéfices, pas caractéristiques ?
- [ ] Tu as au moins 5 angles créatifs différents ?
- [ ] Au moins 1 créa par niveau de conscience visé ?
- [ ] Page produit cohérente avec les créas ?

### Setup
- [ ] CBO (pas ABO) ?
- [ ] 1 adset par créa/concept ?
- [ ] Budget/3 = nb créas max respecté ?
- [ ] Format 4:5 pour le feed, 9:16 pour story ?

### Pendant le testing
- [ ] Tu attends 100-150€ de spend AVANT d'analyser ?
- [ ] Tu analyses sur des tranches de 3-7 jours min ?
- [ ] ROAS = ton métric N°1 ?

### Quand ça merde
- [ ] Tu as identifié le bon playbook (CPA / ROAS / CPM) ?
- [ ] T'as bien diagnostiqué site vs ads ?
