# Portfolio data — Hugo Benguemalet

Site : https://hbenguemalet.github.io/

## Ce qui se met à jour tout seul
- **Collection d'albums** : lue en direct dans les CSV du dépôt `Excel_Melorata` (dossier `powerbi/`).
- **Bootcamp** : `bootcamp.json`, réécrit toutes les 3 h par `.github/workflows/bootcamp.yml` à partir de la base
  Notion « Tâches du bootcamp » (`scripts/bootcamp.py`). Cocher une tâche dans Notion suffit.
  Ce fichier est aussi lu par la page des alternances et par le dépôt `candidatures`.

## Réglage (une fois)
Settings → Secrets and variables → Actions → **New repository secret** : `NOTION_TOKEN` (le même jeton
d'intégration Notion que dans le dépôt `candidatures`). Puis onglet Actions → « Synchro bootcamp (Notion) » →
**Run workflow** pour tester.

## Liens
`#id-du-projet` ouvre directement la fiche d'un projet (ex. `#disco`, `#live`, `#suivi`, `#arta`).
