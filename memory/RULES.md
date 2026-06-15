# Règles métier de Louis

Source de vérité pour les notifications et décisions automatiques.
Quand Louis te dit "change la règle X", tu mets à jour ce fichier
puis tu confirmes.

## Notifications temps réel (event-driven)

| Type | Condition | Message à envoyer |
|---|---|---|
| 📦 Stock bas | Produit Shopify avec stock < 10 unités | `📦 Stock bas : [nom_produit] = X unités` |
| ⚠️ ROAS faible | Campagne Meta avec ROAS < 2 | `⚠️ ROAS faible : [nom_campagne] = X ROAS` |
| 🏆 Créa gagnante | Adset Meta avec ROAS ≥ 4 | `🏆 Créa gagnante : [nom_adset] = X ROAS` |

## Notifications programmées (timer-based, heure de Paris)

| Quand | Type | Contenu |
|---|---|---|
| Chaque jour 09:00 | Bilan veille | Revenue, spend, ROAS, commandes, AOV, top/sous-perf campagnes |
| Chaque jour 12:00 | Mid-day check | Revenue du matin, spend du matin, ROAS du matin |
| Chaque jour 20:00 | Récap journée | Revenue, spend, ROAS, commandes du jour |
| Dimanche 20:00 | Bilan hebdo | Totaux semaine + comparaison vs semaine précédente |
| 1er du mois 09:00 | Récap mois | Totaux mois précédent + comparaison vs M-1 |

## Bot de notifications

- Notifications envoyées via un **bot Telegram dédié** (séparé d'@AssistantEcom_bot)
- Bot dédié = pas de discussion possible, juste réception
- Token stocké dans `/opt/trading/agent/.env` sous `NOTIFY_TOKEN=`

## Comptes à connecter (pour activer les notifs)

- [ ] Shopify Admin API (pour stock + revenue + commandes)
- [ ] Meta Marketing API (pour ROAS + spend + créatives)

Tant que ces 2 comptes ne sont pas connectés, les notifs ne peuvent
pas se déclencher.
