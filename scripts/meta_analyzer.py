#!/usr/bin/env python3
"""
Bot Meta Andromeda v3 — Analyse complète avec machine à états + playbooks + alertes

Modes :
  --daily   : rapport quotidien complet (cron à 9h)
  --alert   : check rapide, ne ping que si chute brutale détectée (cron toutes les 4h)
  (par défaut --daily)
"""

import os, sys, json, requests
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

# === Config ===
load_dotenv("/opt/trading/config/meta.env")
load_dotenv("/opt/trading/agent/.env")

META_TOKEN = os.getenv("META_TOKEN")
META_AD_ACCOUNT_ID = os.getenv("META_AD_ACCOUNT_ID")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")

if not all([META_TOKEN, META_AD_ACCOUNT_ID, TELEGRAM_CHAT_ID, TELEGRAM_TOKEN]):
    print("❌ Variables manquantes"); sys.exit(1)

API = "https://graph.facebook.com/v22.0"
STATE_FILE = "/opt/trading/config/meta_state.json"
LATEST_REPORT = "/home/claude/latest-meta-report.md"

# === Seuils Louis (offre 1 stick 19,90€) ===
BREAK_EVEN_1STICK = 1.31
ROAS_CIBLE = 1.5
CPA_MAX_VIABLE = 15.23

# === Seuils alertes ===
ROAS_DROP_ALERT = 0.30      # chute > 30%
CPM_HIGH_ALERT = 50         # CPM > 50€ FR
ATC_LOW_ALERT = 0.05        # ATC < 5%
MIN_SPEND_FOR_ANALYSIS = 100  # spend min avant analyse
MIN_DAYS_FOR_ANALYSIS = 3   # jours min avant analyse


# === API Meta ===

def api_get(url, params):
    params["access_token"] = META_TOKEN
    r = requests.get(url, params=params, timeout=30)
    r.raise_for_status()
    return r.json()


def get_active_campaigns():
    data = api_get(f"{API}/{META_AD_ACCOUNT_ID}/campaigns", {
        "fields": "id,name,status,daily_budget,created_time", "limit": 100
    }).get("data", [])
    return [c for c in data if c.get("status") == "ACTIVE"]


def get_active_adsets(campaign_id):
    data = api_get(f"{API}/{campaign_id}/adsets", {
        "fields": "id,name,status,created_time", "limit": 100
    }).get("data", [])
    return [a for a in data if a.get("status") == "ACTIVE"]


def get_insights(object_id, days=3):
    since = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    until = datetime.now().strftime("%Y-%m-%d")
    params = {
        "fields": "spend,impressions,clicks,ctr,cpm,cpc,actions,purchase_roas",
        "time_range": f'{{"since":"{since}","until":"{until}"}}',
    }
    data = api_get(f"{API}/{object_id}/insights", params).get("data", [])
    return data[0] if data else None


def parse_insights(d):
    if not d:
        return None
    actions = d.get("actions", [])
    achats = next((int(a.get("value", 0)) for a in actions if a.get("action_type") == "purchase"), 0)
    atc = next((int(a.get("value", 0)) for a in actions if a.get("action_type") == "add_to_cart"), 0)
    initiated = next((int(a.get("value", 0)) for a in actions if a.get("action_type") == "initiate_checkout"), 0)
    clicks = int(d.get("clicks", 0))
    spend = float(d.get("spend", 0))
    return {
        "spend": spend,
        "cpm": float(d.get("cpm", 0)),
        "cpc": float(d.get("cpc", 0)),
        "ctr": float(d.get("ctr", 0)),
        "roas": float(d["purchase_roas"][0].get("value", 0)) if d.get("purchase_roas") else 0,
        "achats": achats,
        "cpa": spend / achats if achats > 0 else 0,
        "atc": atc,
        "atc_rate": (atc / clicks) if clicks > 0 else 0,
        "initiated_checkout": initiated,
    }


# === State management ===

def load_state():
    if not os.path.exists(STATE_FILE):
        return {"campaigns": {}}
    try:
        with open(STATE_FILE) as f:
            return json.load(f)
    except Exception:
        return {"campaigns": {}}


def save_state(state):
    try:
        with open(STATE_FILE, "w") as f:
            json.dump(state, f, indent=2, default=str)
    except Exception as e:
        print(f"⚠️ State save: {e}")


def update_campaign_state(state, campaign_id, k):
    today = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    if campaign_id not in state["campaigns"]:
        state["campaigns"][campaign_id] = {
            "first_seen": today,
            "snapshots": [],
        }
    state["campaigns"][campaign_id]["snapshots"].append({
        "ts": today,
        "spend": k["spend"] if k else 0,
        "roas": k["roas"] if k else 0,
        "cpm": k["cpm"] if k else 0,
        "cpc": k["cpc"] if k else 0,
        "atc_rate": k["atc_rate"] if k else 0,
        "achats": k["achats"] if k else 0,
    })
    # Garder uniquement les 30 derniers snapshots
    state["campaigns"][campaign_id]["snapshots"] = state["campaigns"][campaign_id]["snapshots"][-30:]


def get_previous_snapshot(state, campaign_id, hours_ago=48):
    """Récupère le snapshot le plus récent à au moins X heures."""
    snaps = state["campaigns"].get(campaign_id, {}).get("snapshots", [])
    if len(snaps) < 2:
        return None
    threshold = datetime.now() - timedelta(hours=hours_ago)
    for snap in reversed(snaps[:-1]):  # ignore le dernier
        ts = datetime.strptime(snap["ts"], "%Y-%m-%d %H:%M:%S")
        if ts <= threshold:
            return snap
    return snaps[0] if snaps else None


# === Détection Playbooks ===

def detect_playbook_1(k):
    """ATC faible (< 5%) → Playbook 1 : problème côté SITE."""
    if not k or k["spend"] < MIN_SPEND_FOR_ANALYSIS:
        return None
    if k["atc_rate"] < ATC_LOW_ALERT:
        return {
            "n": 1,
            "title": "CPA élevé / ATC faible",
            "intro": "ATC très faible (<5%) = **rarement un problème d'ads, souvent côté SITE**.",
            "causes": [
                "Incohérence créas / page produit (couleurs, prix, promesse)",
                "Offre pas assez intéressante (prix élevé, pas de promo/bundle, shipping caché)",
                "Marketing pas assez bon (copy faible, pas de bénéfices clairs)",
                "Manque de trust (pas d'avis, site cheap)",
                "Page produit pas convaincante (description courte, pas de démo, layout confus)",
            ],
            "solutions": [
                "Améliorer cohérence créas/page produit",
                "Rendre l'offre + attractive (+ urgence si possible)",
                "Optimiser copy/marketing de la page",
                "Ajouter avis + trust badges",
                "Simplifier le parcours d'achat",
            ],
        }
    return None


def detect_playbook_2(k, previous):
    """ROAS s'effondre brutalement (chute > 30%) → Playbook 2."""
    if not k or not previous or previous.get("roas", 0) == 0:
        return None
    drop = (previous["roas"] - k["roas"]) / previous["roas"]
    if drop > ROAS_DROP_ALERT and k["spend"] >= MIN_SPEND_FOR_ANALYSIS:
        return {
            "n": 2,
            "title": "ROAS s'effondre",
            "intro": f"ROAS chute de {drop*100:.0f}% ({previous['roas']:.2f} → {k['roas']:.2f}).",
            "causes": [
                "Creative fatigue (mêmes créas plusieurs semaines, frequency monte, audience saturée)",
                "Poche d'audience saturée (gens chauds épuisés, on touche des gens froids)",
                "Mauvaise période (post-Q4, hors saison)",
                "Concurrence augmente (promos agressives, marché saturé)",
            ],
            "solutions": [
                "Creative fatigue → ajouter **5-10 nouvelles créas** (nouveaux angles)",
                "Poche limitée → améliorer site/marketing OU **offre plus attractive ou moins chère** (le + impactant)",
                "Mauvaise période → baisser budget, patienter 2-3 mois",
                "Concurrence → baisser budget, maintenir présence",
            ],
        }
    return None


def detect_playbook_3(k):
    """CPM > 50€ FR → Playbook 3."""
    if not k or k["spend"] < MIN_SPEND_FOR_ANALYSIS:
        return None
    if k["cpm"] > CPM_HIGH_ALERT:
        return {
            "n": 3,
            "title": "CPM extrêmement cher (>50€ FR)",
            "intro": "⚠️ Si panier > 100€, CPM élevé = normal.\n💡 **CPM élevé n'est PAS problématique si ROAS bon.**",
            "causes": [
                "Incohérence créa/persona/produit (Meta galère à trouver les bonnes personnes)",
                "Mauvais offre/marketing (Meta ne trouve pas l'audience qualifiée)",
                "Produit cher (panier > 100€) → CPM élevé normal",
                "Période saturée (Q4, soldes)",
            ],
            "solutions": [
                "Revoir cohérence créa ↔ page produit ↔ persona",
                "Améliorer site et offre",
                "Si période saturée : baisser budget ou accepter",
            ],
        }
    return None


def detect_playbooks(k, previous):
    """Retourne la liste des playbooks applicables."""
    playbooks = []
    for fn in (detect_playbook_1, lambda k: detect_playbook_2(k, previous), detect_playbook_3):
        try:
            pb = fn(k)
            if pb:
                playbooks.append(pb)
        except Exception:
            pass
    return playbooks


# === Machine à états ===

def get_campaign_state(campaign_id, state, k, first_seen_str):
    """Détermine l'état actuel de la campagne."""
    try:
        first_seen = datetime.strptime(first_seen_str, "%Y-%m-%d %H:%M:%S")
    except Exception:
        first_seen = datetime.now()
    days_since = (datetime.now() - first_seen).days
    spend = k["spend"] if k else 0
    if days_since < MIN_DAYS_FOR_ANALYSIS or spend < MIN_SPEND_FOR_ANALYSIS:
        return "INCUBATION", days_since
    snaps = state["campaigns"].get(campaign_id, {}).get("snapshots", [])
    if len(snaps) <= 1:
        return "FIRST_ANALYSIS", days_since
    return "MONITORING", days_since


# === Formatage rapport ===

def fmt_kpis(k):
    if not k:
        return "Aucune donnée"
    verdict = "✅ Rentable" if k["roas"] >= BREAK_EVEN_1STICK else "❌ Sous break-even (1,31)"
    return (
        f"Spend 3j: {k['spend']:.2f}€ | Achats: {k['achats']}\n"
        f"ROAS: {k['roas']:.2f} {verdict} | CPA: {k['cpa']:.2f}€ (max {CPA_MAX_VIABLE}€)\n"
        f"CPM: {k['cpm']:.2f}€ | CPC: {k['cpc']:.2f}€ | CTR: {k['ctr']:.2f}%"
    )


def fmt_playbook(pb):
    out = [f"\n📘 *PLAYBOOK {pb['n']} — {pb['title']}*"]
    if pb.get("intro"):
        out.append(pb["intro"])
    out.append("\n*Causes possibles :*")
    for i, c in enumerate(pb["causes"], 1):
        out.append(f"{i}. {c}")
    if pb.get("solutions"):
        out.append("\n*Solutions :*")
        for i, s in enumerate(pb["solutions"], 1):
            out.append(f"{i}. {s}")
    return "\n".join(out)


def fmt_adsets(adsets_data):
    if not adsets_data:
        return "Aucune créa active."
    out = ["\n🔍 *Analyse par créa* (campagne sous break-even) :"]
    adsets_data.sort(key=lambda x: x[1]["spend"] if x[1] else 0, reverse=True)
    total = sum((k["spend"] for _, k in adsets_data if k), 0)
    for i, (adset, k) in enumerate(adsets_data):
        if not k:
            out.append(f"\n_{adset['name']}_ — Aucune donnée")
            continue
        share = (k["spend"] / total * 100) if total > 0 else 0
        tag = " ← *créa principale*" if i == 0 else ""
        rent = "✅" if k["roas"] >= BREAK_EVEN_1STICK else "❌"
        out.append(f"\n_{adset['name']}_{tag}\nSpend: {k['spend']:.2f}€ ({share:.0f}%) | ROAS: {k['roas']:.2f} {rent} | Achats: {k['achats']}")
    # Logique d'écosystème Andromeda
    out.append("\n📋 *Logique Andromeda*")
    if adsets_data and adsets_data[0][1]:
        main = adsets_data[0][1]
        if main["roas"] < BREAK_EVEN_1STICK:
            out.append("→ *Cas 1* : créa principale sous break-even → **couper ou itérer**. Les autres seront pires.")
        else:
            out.append("→ *Cas 2* : créa principale rentable, garde les secondaires (effet écosystème).")
    out.append("→ Ajouter **5-10 nouvelles créas** (nouveaux angles, pas juste hooks)")
    return "\n".join(out)


def fmt_campaign_section(campaign, k, adsets_data, playbooks, state_name, days_since):
    name = campaign["name"]
    budget = int(campaign.get("daily_budget", 0)) / 100
    state_emoji = {"INCUBATION": "🌱", "FIRST_ANALYSIS": "🎯", "MONITORING": "📊"}.get(state_name, "📊")
    header = f"{state_emoji} *{name}* — Budget: {budget}€/j — État: {state_name} (J{days_since+1})"
    if state_name == "INCUBATION":
        return f"{header}\n{fmt_kpis(k)}\n⏳ Trop tôt pour conclure (min {MIN_DAYS_FOR_ANALYSIS}j + {MIN_SPEND_FOR_ANALYSIS}€ spend)."
    out = [header, fmt_kpis(k)]
    if adsets_data:
        out.append(fmt_adsets(adsets_data))
    for pb in playbooks:
        out.append(fmt_playbook(pb))
    return "\n".join(out)


# === I/O ===

def save_latest_report(text):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        with open(LATEST_REPORT, "w") as f:
            f.write(f"# Dernier Rapport Meta — {ts}\n\n{text}\n")
    except Exception as e:
        print(f"⚠️ Save: {e}")


def send_telegram(text):
    # Découpe si message trop long (4000 char limit Telegram)
    chunks = [text[i:i+3800] for i in range(0, len(text), 3800)] if len(text) > 3800 else [text]
    for chunk in chunks:
        r = requests.post(
            f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage",
            json={"chat_id": TELEGRAM_CHAT_ID, "text": chunk, "parse_mode": "Markdown"},
            timeout=30,
        )
        if not r.ok:
            print(f"⚠️ Telegram error: {r.text[:200]}")


# === Main ===

def main(mode="daily"):
    print(f"🚀 Analyse Meta ({mode}) — {datetime.now().strftime('%H:%M')}")
    state = load_state()
    campaigns = get_active_campaigns()
    print(f"✓ {len(campaigns)} campagne(s) active(s)")

    if not campaigns:
        if mode == "daily":
            msg = "📊 *Meta Andromeda*\n\nAucune campagne active."
            save_latest_report(msg); send_telegram(msg)
        return

    sections = []
    triggered_alerts = []

    for campaign in campaigns:
        cid = campaign["id"]
        first_seen_str = state["campaigns"].get(cid, {}).get("first_seen") or datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        global_k = parse_insights(get_insights(cid))
        previous = get_previous_snapshot(state, cid, hours_ago=24)
        state_name, days_since = get_campaign_state(cid, state, global_k, first_seen_str)

        # Détection playbooks
        playbooks = detect_playbooks(global_k, previous) if state_name != "INCUBATION" else []

        # Analyse par créa si pas rentable
        adsets_data = []
        if state_name != "INCUBATION" and global_k and global_k["roas"] < BREAK_EVEN_1STICK:
            adsets = get_active_adsets(cid)
            adsets_data = [(a, parse_insights(get_insights(a["id"]))) for a in adsets]

        # Détection alerte (chute brutale)
        if previous and global_k and previous.get("roas", 0) > 0:
            drop = (previous["roas"] - global_k["roas"]) / previous["roas"]
            if drop > ROAS_DROP_ALERT and global_k["spend"] >= MIN_SPEND_FOR_ANALYSIS:
                triggered_alerts.append(f"🚨 *{campaign['name']}* : ROAS chute {drop*100:.0f}% ({previous['roas']:.2f} → {global_k['roas']:.2f})")

        # Mise à jour de l'état
        update_campaign_state(state, cid, global_k)

        # Section du rapport
        sections.append(fmt_campaign_section(campaign, global_k, adsets_data, playbooks, state_name, days_since))

    save_state(state)

    # === MODE ALERT : ne ping que si chute détectée ===
    if mode == "alert":
        if triggered_alerts:
            msg = "🚨 *ALERTE Meta Andromeda*\n\n" + "\n".join(triggered_alerts) + "\n\n_Check ton rapport quotidien pour les playbooks complets._"
            send_telegram(msg)
            print(f"✓ {len(triggered_alerts)} alerte(s) envoyée(s)")
        else:
            print("✓ Aucune alerte")
        return

    # === MODE DAILY : rapport complet ===
    header = f"📊 *Rapport Meta Andromeda — {datetime.now().strftime('%d/%m/%Y %Hh%M')}*"
    if triggered_alerts:
        header += "\n\n" + "\n".join(triggered_alerts)
    msg = header + "\n\n" + "\n\n---\n\n".join(sections)
    save_latest_report(msg)
    send_telegram(msg)
    print("✅ Terminé")


if __name__ == "__main__":
    mode = "daily"
    if len(sys.argv) > 1 and sys.argv[1] in ("--daily", "--alert"):
        mode = sys.argv[1].lstrip("-")
    main(mode)
