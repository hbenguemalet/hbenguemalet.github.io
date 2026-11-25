"""Avancée du bootcamp : lit la base Notion « Tâches du bootcamp » et écrit bootcamp.json.

bootcamp.json est publié avec le site (https://hbenguemalet.github.io/bootcamp.json) et lu par :
  - le portfolio (feuille de route data) ;
  - la page des alternances (compétences demandées par chaque offre vs avancée) ;
  - le dépôt candidatures (bloc « Avancée du bootcamp » de profil.md).

Variables : NOTION_TOKEN (intégration qui a accès à la base), NOTION_DB (id de la base).
Test sans Notion : BOOTCAMP_TACHES=fichier.json python3 scripts/bootcamp.py (liste de tâches déjà lues).
Aucune dépendance : bibliothèque standard uniquement.
"""

import json
import os
import re
import sys
import urllib.request
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

SORTIE = Path(__file__).resolve().parent.parent / "bootcamp.json"

# Chaque tâche est rattachée à la première compétence dont le motif correspond à son intitulé.
# None = tâche comptée dans l'avancée globale, mais rattachée à aucune compétence (setup, candidatures…).
COMPETENCES = [
    (None, r"^setup|^git ?:|test d.admission"),
    ("Pipeline ETL", r"\betl\b|docker|\bdbt\b|airflow|bigquery|ligne de commande|projet 4|data engineering|\bcron\b"),
    ("Power BI", r"power bi|\bdax\b|power query|mod[eè]le de donn[ée]es|visuels|superstore|projet 3"),
    ("Python", r"python|pandas|matplotlib|seaborn|kaggle|\bstats?\b|scipy|corr[ée]lation|r[ée]gression|projet 2|notebook|script|nettoyage|sqlalchemy|bilan phase 2"),
    ("SQL", r"sql|requ[eê]te|jointure|\bcte\b|fen[eê]tre|\bbdd|sgbd|olist|create table|\bcase\b|explain|\btdm?\d|projet 1|bilan phase 1"),
]
ORDRE_COMPETENCES = ["SQL", "Python", "Power BI", "Pipeline ETL"]


def http(url: str, corps: bytes | None, entetes: dict) -> dict:
    req = urllib.request.Request(url, data=corps, headers=entetes, method="POST" if corps else "GET")
    with urllib.request.urlopen(req, timeout=30) as r:
        return json.loads(r.read())


def lire_notion(jeton: str, base: str) -> list[dict]:
    """Toutes les tâches de la base, sous une forme simple."""
    h = {"Authorization": "Bearer " + jeton, "Notion-Version": "2022-06-28", "Content-Type": "application/json"}
    taches, curseur = [], None
    while True:
        corps = {"page_size": 100, **({"start_cursor": curseur} if curseur else {})}
        r = http(f"https://api.notion.com/v1/databases/{base}/query", json.dumps(corps).encode(), h)
        for pg in r["results"]:
            p = pg["properties"]
            date_de = lambda nom: ((p.get(nom) or {}).get("date") or {}).get("start")
            taches.append({
                "tache": "".join(x["plain_text"] for x in p["Tâche"]["title"]).strip(),
                "phase": ((p.get("Phase") or {}).get("select") or {}).get("name") or "",
                "ordre": (p.get("Ordre") or {}).get("number"),
                "fait": bool((p.get("Fait") or {}).get("checkbox")),
                "fait_le": date_de("Fait le"),
                "prevue": date_de("Date prévue"),
                "lien": (p.get("Lien livrable") or {}).get("url"),
            })
        curseur = r.get("next_cursor")
        if not r.get("has_more"):
            return taches


def competence(tache: str) -> str | None:
    for nom, motif in COMPETENCES:
        if re.search(motif, tache, re.I):
            return nom
    return None


def construire(taches: list[dict], aujourdhui: date) -> dict:
    taches = [t for t in taches if t["tache"]]
    taches.sort(key=lambda t: (t["ordre"] is None, t["ordre"] or 0, t["prevue"] or ""))
    faites = [t for t in taches if t["fait"]]
    restantes = [t for t in taches if not t["fait"]]
    prochaine = restantes[0] if restantes else None

    def etat(liste: list[dict]) -> tuple[int, int, str]:
        n, f = len(liste), sum(t["fait"] for t in liste)
        if n and f == n:
            return n, f, "fait"
        if f or (prochaine and prochaine in liste):
            return n, f, "en cours"
        return n, f, "à venir"

    comps = []
    for nom in ORDRE_COMPETENCES:
        liste = [t for t in taches if competence(t["tache"]) == nom]
        n, f, e = etat(liste)
        comps.append({"nom": nom, "faites": f, "total": n, "pct": round(100 * f / n) if n else 0, "etat": e})

    phases = []
    for nom in sorted({t["phase"] for t in taches if t["phase"]}):
        liste = [t for t in taches if t["phase"] == nom]
        n, f, e = etat(liste)
        phases.append({"nom": nom, "faites": f, "total": n, "pct": round(100 * f / n) if n else 0, "etat": e})
    phase_actuelle = next((p["nom"] for p in phases if p["etat"] == "en cours"), phases[-1]["nom"] if phases else "")

    il_y_a_7j = (aujourdhui - timedelta(days=7)).isoformat()
    recentes = sorted(faites, key=lambda t: t["fait_le"] or "", reverse=True)
    court = lambda t: {"tache": t["tache"], "date": t["fait_le"] or t["prevue"], "lien": t["lien"],
                       "competence": competence(t["tache"])}
    return {
        "maj": datetime.now(timezone.utc).isoformat(timespec="seconds"),
        "debut": min((t["prevue"] or t["fait_le"] or "9999") for t in taches) if taches else None,
        "fin_prevue": max((t["prevue"] or "") for t in taches) if taches else None,
        "total": len(taches),
        "faites": len(faites),
        "pct": round(100 * len(faites) / len(taches)) if taches else 0,
        "cette_semaine": sum(1 for t in faites if (t["fait_le"] or "") > il_y_a_7j),
        "en_retard": sum(1 for t in restantes if t["prevue"] and t["prevue"] < aujourdhui.isoformat()),
        "phase_actuelle": phase_actuelle,
        "prochaine": {"tache": prochaine["tache"], "date": prochaine["prevue"],
                      "competence": competence(prochaine["tache"])} if prochaine else None,
        "competences": comps,
        "phases": phases,
        "recentes": [court(t) for t in recentes[:6]],
        "livrables": [court(t) for t in recentes if t["lien"]][:10],
        "acquis": [t["tache"] for t in faites],
    }


def main() -> int:
    if os.environ.get("BOOTCAMP_TACHES"):
        taches = json.loads(Path(os.environ["BOOTCAMP_TACHES"]).read_text("utf-8"))
    else:
        jeton, base = os.environ.get("NOTION_TOKEN"), os.environ.get("NOTION_DB")
        if not (jeton and base):
            # avertissement visible dans l'onglet Actions, sans échec (pas d'e-mail toutes les 3 h)
            print("::warning::Secret NOTION_TOKEN absent : bootcamp.json n'est pas mis à jour (voir README).")
            return 0
        taches = lire_notion(jeton, base)
    nouveau = construire(taches, date.today())
    # pas de réécriture (donc pas de commit) si seule l'heure de mise à jour change
    if SORTIE.exists():
        ancien = json.loads(SORTIE.read_text("utf-8"))
        if {**ancien, "maj": None} == {**nouveau, "maj": None}:
            print("Bootcamp inchangé.")
            return 0
    SORTIE.write_text(json.dumps(nouveau, ensure_ascii=False, indent=1) + "\n", "utf-8")
    print(f"bootcamp.json : {nouveau['faites']}/{nouveau['total']} tâches, phase « {nouveau['phase_actuelle']} ».")
    return 0


if __name__ == "__main__":
    sys.exit(main())
