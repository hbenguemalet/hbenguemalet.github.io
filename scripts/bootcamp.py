"""Avancée du bootcamp : lit la base Notion « Tâches du bootcamp » et écrit bootcamp.json.

bootcamp.json est publié avec le site (https://hbenguemalet.github.io/bootcamp.json) et lu par :
  - le portfolio (feuille de route data) ;
  - la page des alternances (compétences demandées par chaque offre vs avancée) ;
  - le dépôt candidatures (bloc « Avancée du bootcamp » de profil.md).

Variables : NOTION_TOKEN (intégration qui a accès à la base), NOTION_DB (id de la base).
Test sans Notion : BOOTCAMP_TACHES=fichier.json python3 scripts/bootcamp.py (liste de tâches déjà lues).
Confidentialité : le fichier publié ne contient que des notions (SELECT, jointures, DAX…) et des
pourcentages, jamais l'intitulé des tâches, les dates, les cours ou les ressources utilisés.
Aucune dépendance : bibliothèque standard uniquement.
"""

import json
import os
import re
import sys
import urllib.request
from datetime import date
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

# Notions publiées, par compétence : (nom affiché, motif cherché dans l'intitulé des tâches de cette compétence).
NOTIONS = {
    "SQL": [
        ("SELECT", r"select"), ("WHERE", r"where"), ("ORDER BY", r"order by"), ("LIMIT", r"limit"),
        ("GROUP BY", r"group by"), ("HAVING", r"having"), ("Agrégats", r"agr[ée]gat"), ("Jointures", r"jointure"),
        ("Sous-requêtes", r"sous-requ"), ("CTE", r"\bcte\b"), ("Fonctions fenêtres", r"fen[eê]tre|row_number|\brank\b|\blag\b"),
        ("CASE", r"\bcase\b"), ("Fonctions de dates", r"fonctions de dates"), ("CREATE TABLE · contraintes", r"create table|contrainte"),
        ("Modélisation MCD / MLD", r"mcd|mld|mod[ée]lisation"), ("Index · EXPLAIN", r"\bindex\b|explain"), ("Cohortes", r"cohorte"),
    ],
    "Python": [
        ("Bases du langage", r"variables|boucles"), ("Compréhensions · fichiers", r"compr[ée]hension"), ("pandas", r"pandas"),
        ("groupby · merge · pivot_table", r"groupby|merge|pivot"), ("Nettoyage de données", r"nettoyage|manquants|doublons"),
        ("matplotlib · seaborn", r"matplotlib|seaborn"), ("Statistiques descriptives", r"stats descriptives|outliers"),
        ("Tests statistiques", r"test t|khi"), ("Régression linéaire", r"r[ée]gression"), ("Python ↔ PostgreSQL", r"sqlalchemy"),
        ("Scripts réutilisables", r"script|refactor"),
    ],
    "Power BI": [
        ("Power Query", r"power query"), ("Modèle en étoile", r"mod[eè]le|[ée]toile"), ("DAX", r"\bdax\b|calculate|sumx"),
        ("DAX temporel", r"temporel|totalytd"), ("Visuels · segments · drill-through", r"visuels|segments|drill"),
        ("Rapports multi-pages", r"pages du rapport|dashboard"), ("RLS · optimisation", r"\brls\b|optimisation"),
    ],
    "Pipeline ETL": [
        ("ETL / ELT", r"\betl\b|\belt\b|warehouse"), ("API → base de données", r"\bapi\b"), ("Ligne de commande", r"ligne de commande"),
        ("Docker", r"docker"), ("dbt", r"\bdbt\b"), ("Exécution planifiée", r"planifi|\bcron\b"), ("BigQuery", r"bigquery"),
        ("Airflow", r"airflow"),
    ],
}


def notions(competence_: str, tache: str) -> list[str]:
    return [nom for nom, motif in NOTIONS.get(competence_, []) if re.search(motif, tache, re.I)]


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
    """Résumé publiable : notions et pourcentages seulement (voir la docstring)."""
    taches = [t for t in taches if t["tache"]]
    taches.sort(key=lambda t: (t["ordre"] is None, t["ordre"] or 0, t["prevue"] or ""))
    restantes = [t for t in taches if not t["fait"]]
    # prochaine tâche qui apprend quelque chose (les tâches de candidature ne comptent pas)
    suivante = next((t for t in restantes if notions(competence(t["tache"]) or "", t["tache"])), None)

    comps = []
    for nom in ORDRE_COMPETENCES:
        liste = [t for t in taches if competence(t["tache"]) == nom]
        acquises, toutes = set(), []
        for t in liste:
            for n in notions(nom, t["tache"]):
                if n not in toutes:
                    toutes.append(n)
                if t["fait"]:
                    acquises.add(n)
        ordre = [n for n, _ in NOTIONS[nom] if n in toutes]
        en_cours = [n for n in notions(nom, suivante["tache"]) if n not in acquises] if suivante and competence(suivante["tache"]) == nom else []
        pct = round(100 * len(acquises) / len(ordre)) if ordre else 0
        etat = "fait" if ordre and len(acquises) == len(ordre) else "en cours" if acquises or en_cours else "à venir"
        comps.append({"nom": nom, "pct": pct, "etat": etat,
                      "acquis": [n for n in ordre if n in acquises], "en_cours": en_cours,
                      "a_venir": [n for n in ordre if n not in acquises and n not in en_cours]})

    phases = []
    for nom in sorted({t["phase"] for t in taches if t["phase"]}):
        liste = [t for t in taches if t["phase"] == nom]
        f = sum(t["fait"] for t in liste)
        phases.append({"nom": re.sub(r"^\d\.\s*", "", nom), "pct": round(100 * f / len(liste)),
                       "etat": "fait" if f == len(liste) else "en cours" if f or (restantes and restantes[0] in liste) else "à venir"})
    return {
        # avancée globale = notions acquises / notions au programme (même base que les barres)
        "pct": round(100 * sum(len(c["acquis"]) for c in comps)
                     / max(1, sum(len(c["acquis"]) + len(c["en_cours"]) + len(c["a_venir"]) for c in comps))),
        "phase_actuelle": next((p["nom"] for p in phases if p["etat"] == "en cours"), phases[-1]["nom"] if phases else ""),
        "en_cours": {"competence": competence(suivante["tache"]), "notions": notions(competence(suivante["tache"]), suivante["tache"])}
        if suivante else None,
        "competences": comps,
        "phases": phases,
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
    # pas de réécriture (donc pas de commit) si rien n'a changé
    if SORTIE.exists():
        if json.loads(SORTIE.read_text("utf-8")) == nouveau:
            print("Bootcamp inchangé.")
            return 0
    SORTIE.write_text(json.dumps(nouveau, ensure_ascii=False, indent=1) + "\n", "utf-8")
    print(f"bootcamp.json : {nouveau['pct']} %, phase « {nouveau['phase_actuelle']} ».")
    return 0


if __name__ == "__main__":
    sys.exit(main())
