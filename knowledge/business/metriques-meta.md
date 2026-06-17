# Métriques Meta — Bot Andromeda

> **LA fiche chiffres** pour le bot Meta Andromeda. À lire pour TOUTE question stratégique impliquant des chiffres (rentabilité, CPA cible, ROAS cible, scaling, troubleshooting).
> **NE PAS confondre avec une fiche persona ou produit copy** — ici, uniquement les chiffres business pour la stratégie Meta.

---

## 🎯 OBJECTIF COURT TERME

> **ÊTRE RENTABLE.** Point. Pas optimiser l'AOV, pas chercher la croissance massive. Juste passer au-dessus du break-even.

→ **ROAS cible : 1,5 minimum**

Une fois rentable et stable → on adaptera le bot pour pousser la croissance.

---

## 💰 OFFRE DE RÉFÉRENCE pour les calculs

> **Tous les calculs ROAS / CPA / break-even se font sur l'offre "1 stick à 17,90€"** — c'est l'offre principale.

### COGS détaillé (1 stick à 17,90€)

| Poste | Coût |
|-------|------|
| Coût produit | 2,07€ |
| Shipping | 1,72€ |
| Frais Shopify (~2,9% + 0,30€) | 0,82€ |
| **TOTAL COGS** | **4,61€** |

### Marges

| Métrique | Valeur |
|----------|--------|
| Prix de vente | 17,90€ |
| Marge brute | **13,29€** |
| Marge brute % | **74,2%** |

### ROAS de référence

| Niveau | ROAS | CPA max | Profit net / vente |
|--------|------|---------|---------------------|
| **Break-even** | **1,35** | 13,29€ | 0€ |
| **Rentabilité minimum (cible)** | **1,5** | ~11€ | ~2,67€ |
| **Rentabilité solide** | 2,0 | ~9€ | ~4,64€ |
| **Très rentable** | 2,5 | ~7€ | ~5,87€ |

---

## 💰 OFFRE BONUS : 2 sticks à 29,90€

(Pour info — pas le focus des calculs principaux, mais utile si Louis demande)

### COGS détaillé

| Poste | Coût |
|-------|------|
| Coût produit (2 sticks) | 4,14€ |
| Shipping (×2) | 3,44€ |
| Frais Shopify | 1,17€ |
| **TOTAL COGS** | **8,75€** |

### Marges

| Métrique | Valeur |
|----------|--------|
| Prix de vente | 29,90€ |
| Marge brute | **21,15€** |
| Marge brute % | **70,7%** |

### ROAS de référence

| Niveau | ROAS | CPA max |
|--------|------|---------|
| **Break-even** | **1,41** | 21,15€ |
| **Rentabilité minimum** | 1,5 | ~20€ |
| **Rentabilité solide** | 2,0 | ~15€ |

→ **L'offre 2 sticks dégage plus de marge en absolu**, donc plus de marge de manœuvre pour scaler **si elle convertit**.

---

## 📊 BENCHMARKS DE TES TESTS PASSÉS

> À utiliser comme référence pour évaluer si un nouveau test est mieux/pire que les précédents.

### Test 2 — 16,90€ (Février 2026)

| Métrique | Valeur | Verdict |
|----------|--------|---------|
| Durée | 7 jours | ✅ Suffisant pour conclure |
| Spend total | 335€ | ✅ |
| Achats | 13 | ✅ |
| CPA | 25,84€ | ❌ Au-dessus du CPA max viable (~11€) |
| CPM | 15,68€ | ✅ Normal pour FR |
| CTR | 1,93% | ⚠️ Légèrement sous 2% |
| CPC | 0,81€ | ⚠️ Haut de fourchette |
| ROAS | 0,78 | ❌ PAS RENTABLE (sous break-even 1,35) |
| Taux conv Shopify | 3% | ✅ Excellent |
| Taux ATC | 10% | ✅ Excellent |
| Taux paiement initié | 10% | ✅ Excellent |

**Insight clé** : la page produit convertit (3% conv), c'est l'acquisition qui coûte trop cher. **Problème : CPA trop élevé vs marge** (à 16,90€ marge ~13€, CPA 25€ = perte 12€/vente).

### Test 3 — 29,90€ (Février 2026)

| Métrique | Valeur | Verdict |
|----------|--------|---------|
| Durée | 3 jours | ⚠️ Insuffisant pour conclure |
| Spend total | ~147€ | ⚠️ Insuffisant (besoin 100-150€ minimum par adset) |
| Achats | 1 | ⚠️ Stat pas valable |
| CPA | 116€ | ❌ Hors-norme (peu de données) |
| ROAS sur 1 ad qui a converti | 1,22 | ⚠️ Sous break-even 1,41 mais 1 vente seulement |

**Insight clé** : test inconclusif (durée + spend insuffisants). À refaire proprement.

---

## 🎯 RÈGLES STRATÉGIQUES POUR LE BOT

### Quand DIAGNOSTIQUER une campagne

1. **Vérifier la durée** : minimum **3-5 jours** ET minimum **100-150€ de spend** avant tout jugement
2. **Comparer le ROAS au break-even** (1,35 sur 17,90€ / 1,41 sur 29,90€) :
   - ROAS < break-even → couper ou itérer
   - ROAS entre break-even et 1,5 → marginal, laisser tourner sous surveillance
   - ROAS > 1,5 → rentable, peut être scalé prudemment
   - ROAS > 2 → bien rentable, scaler agressivement
3. **Comparer le CPA au CPA max** :
   - Sur 17,90€ : CPA > 13€ → problème
   - Sur 29,90€ : CPA > 21€ → problème
4. **Toujours vérifier les KPIs intermédiaires** :
   - CPM normal FR : 7-20€
   - CTR normal : ~2%
   - Taux conv Shopify : Louis a 3% (excellent, à reproduire)
   - Taux ATC : Louis a 10% (excellent)

### Quand SCALER une campagne

- ROAS > 1,5 pendant **48h minimum** → augmenter budget de 20%
- ROAS > 2 → augmenter budget de 30-50%
- Toujours à minuit (pas en milieu de journée)
- Suivre la matrice de décision Andromeda

### Quand COUPER une créa

- Créa principale (= prend tout le spend) ROAS < 1 sur 3-5j → couper
- Créa secondaire à ROAS bas mais d'autres rentables → garder (effet écosystème)
- Exception : créa à ROAS < 1 pendant 7-14j → couper même si secondaire

---

## 📋 Pour le bot — utilisation

**Quand consulter cette fiche ?**
- Toute question sur la rentabilité, le ROAS, le CPA, le scaling
- Toute question impliquant des chiffres ou des décisions stratégiques
- Comparaison avec les tests passés (Test 2 / Test 3)
- Diagnostic d'une campagne en cours

**Croiser avec** :
- `meta-ads/meta-ads-andromeda-2026.md` (LE document central — playbooks, matrice)
- `copywriting/funnel-et-niveau-de-conscience.md` (si la question touche aussi à l'awareness/funnel)

**Ne PAS lire pour les questions copy/persona/marque** — c'est hors zone du bot Meta Andromeda.
