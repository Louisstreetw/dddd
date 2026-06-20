#!/usr/bin/env python3
"""Bot Meta Andromeda v2 — Analyse globale + par créa"""

import os, sys, requests
from datetime import datetime, timedelta
from dotenv import load_dotenv

load_dotenv("/opt/trading/config/meta.env")
load_dotenv("/opt/trading/agent/.env")

META_TOKEN = os.getenv("META_TOKEN")
META_AD_ACCOUNT_ID = os.getenv("META_AD_ACCOUNT_ID")
TELEGRAM_CHAT_ID = os.getenv("TELEGRAM_CHAT_ID")
TELEGRAM_TOKEN = os.getenv("TELEGRAM_TOKEN")

if not all([META_TOKEN, META_AD_ACCOUNT_ID, TELEGRAM_CHAT_ID, TELEGRAM_TOKEN]):
    print("❌ Variables manquantes"); sys.exit(1)

API = "https://graph.facebook.com/v22.0"
BREAK_EVEN_1STICK = 1.35
DAYS = 3

def api_get(url, params):
    params["access_token"] = META_TOKEN
    r = requests.get(url, params=params, timeout=30)
    r.raise_for_status()
    return r.json()

def get_active_campaigns():
    data = api_get(f"{API}/{META_AD_ACCOUNT_ID}/campaigns", {"fields": "id,name,status,daily_budget", "limit": 100}).get("data", [])
    return [c for c in data if c.get("status") == "ACTIVE"]

def get_active_adsets(campaign_id):
    data = api_get(f"{API}/{campaign_id}/adsets", {"fields": "id,name,status", "limit": 100}).get("data", [])
    return [a for a in data if a.get("status") == "ACTIVE"]

def get_insights(object_id, days=DAYS):
    since = (datetime.now() - timedelta(days=days)).strftime("%Y-%m-%d")
    until = datetime.now().strftime("%Y-%m-%d")
    params = {"fields": "spend,impressions,clicks,ctr,cpm,cpc,actions,purchase_roas", "time_range": f'{{"since":"{since}","until":"{until}"}}'}
    data = api_get(f"{API}/{object_id}/insights", params).get("data", [])
    return data[0] if data else None

def parse_insights(d):
    if not d:
        return None
    return {
        "spend": float(d.get("spend", 0)),
        "cpm": float(d.get("cpm", 0)),
        "cpc": float(d.get("cpc", 0)),
        "ctr": float(d.get("ctr", 0)),
        "roas": float(d["purchase_roas"][0].get("value", 0)) if d.get("purchase_roas") else 0,
        "achats": next((int(a.get("value", 0)) for a in d.get("actions", []) if a.get("action_type") == "purchase"), 0),
    }

def save_latest_report(text):
    ts = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    try:
        with open("/home/claude/latest-meta-report.md", "w") as f:
            f.write(f"# Dernier Rapport Meta — {ts}\n\n{text}\n")
    except Exception as e:
        print(f"⚠️ Latest report: {e}")

def send_telegram(text):
    r = requests.post(f"https://api.telegram.org/bot{TELEGRAM_TOKEN}/sendMessage", json={"chat_id": TELEGRAM_CHAT_ID, "text": text, "parse_mode": "Markdown"}, timeout=30)
    r.raise_for_status()
    return r.json()

def format_global(campaign, k):
    name = campaign["name"]
    budget = int(campaign.get("daily_budget", 0)) / 100
    if not k:
        return f"📊 *{name}*\nBudget: {budget}€/j\n⏳ Aucune donnée {DAYS} derniers jours"
    verdict = "✅ Rentable" if k["roas"] >= BREAK_EVEN_1STICK else "❌ Sous break-even (1,35)"
    return (
        f"📊 *{name}* — Budget: {budget}€/j\n"
        f"Spend {DAYS}j: {k['spend']:.2f}€ | Achats: {k['achats']}\n"
        f"ROAS: {k['roas']:.2f} {verdict}\n"
        f"CPM: {k['cpm']:.2f}€ | CPC: {k['cpc']:.2f}€ | CTR: {k['ctr']:.2f}%"
    )

def format_by_adset(adsets_data):
    if not adsets_data:
        return "Aucune créa active à analyser."
    lines = ["\n🔍 *Analyse par créa* (campagne sous break-even) :"]
    adsets_data.sort(key=lambda x: x[1]["spend"] if x[1] else 0, reverse=True)
    total_spend = sum((k["spend"] for _, k in adsets_data if k), 0)
    for i, (adset, k) in enumerate(adsets_data):
        if not k:
            lines.append(f"\n_{adset['name']}_ — Aucune donnée")
            continue
        share = (k["spend"] / total_spend * 100) if total_spend > 0 else 0
        tag = " ← *créa principale*" if i == 0 else ""
        rentable = "✅" if k["roas"] >= BREAK_EVEN_1STICK else "❌"
        lines.append(f"\n_{adset['name']}_{tag}\nSpend: {k['spend']:.2f}€ ({share:.0f}%) | ROAS: {k['roas']:.2f} {rentable} | Achats: {k['achats']}")
    return "\n".join(lines)

def main():
    print(f"🚀 Analyse Meta — {datetime.now().strftime('%H:%M')}")
    campaigns = get_active_campaigns()
    print(f"✓ {len(campaigns)} campagne(s) active(s)")
    if not campaigns:
        msg = "📊 *Meta Andromeda*\n\nAucune campagne active."
        save_latest_report(msg); send_telegram(msg); return

    sections = []
    for campaign in campaigns:
        global_k = parse_insights(get_insights(campaign["id"]))
        section = format_global(campaign, global_k)
        # Si pas rentable ET assez de spend → descendre par adset (logique Andromeda)
        if global_k and global_k["roas"] < BREAK_EVEN_1STICK and global_k["spend"] >= 100:
            adsets = get_active_adsets(campaign["id"])
            adsets_data = [(a, parse_insights(get_insights(a["id"]))) for a in adsets]
            section += "\n" + format_by_adset(adsets_data)
        sections.append(section)

    msg = f"📊 *Rapport Meta Andromeda — {datetime.now().strftime('%d/%m/%Y %Hh%M')}*\n\n" + "\n\n---\n\n".join(sections)
    save_latest_report(msg)
    result = send_telegram(msg)
    print(f"✓ Telegram: {result.get('ok')}")
    print("✅ Terminé")

if __name__ == "__main__":
    main()
