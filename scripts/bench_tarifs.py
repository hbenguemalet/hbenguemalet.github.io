#!/usr/bin/env python3
"""Bench tarifaire : relève, pour chaque carte graphique, le meilleur prix chez Alternate, LDLC,
Materiel.net et Grosbill, en lisant leurs pages de recherche. Sans IA, sans coût de jetons.
Aucune valeur n'est inventée : un revendeur illisible est simplement absent du résultat."""
import html, json, re, sys, time, datetime, urllib.parse, urllib.request
from pathlib import Path

OUT = Path(__file__).resolve().parent.parent / "bench-pc" / "tarifs.json"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"
BAD = re.compile(r"waterblock|water block|watercool|support|backplate|câble|cable|adaptateur|portable|laptop|pc gamer|ordinateur|bundle|tour |refroidisseur", re.I)

# nom du site -> (requête, test sur le nom normalisé)
CARTES = {
    "RTX 5060 Ti 16 Go": ("rtx 5060 ti", lambda n: "5060 ti" in n and re.search(r"16 ?(g|go)\b", n)),
    "RTX 5070": ("rtx 5070", lambda n: re.search(r"rtx 5070(?! ti)", n)),
    "RTX 4070 Super": ("rtx 4070 super", lambda n: "4070 super" in n and "ti super" not in n),
    "RTX 4070 Ti Super": ("rtx 4070 ti super", lambda n: "4070 ti super" in n),
    "RTX 4080 Super": ("rtx 4080 super", lambda n: "4080 super" in n),
    "RTX 3090 (occasion)": ("rtx 3090", lambda n: "3090" in n),
    "RTX 5070 Ti": ("rtx 5070 ti", lambda n: "5070 ti" in n),
    "RTX 5080": ("rtx 5080", lambda n: re.search(r"rtx 5080", n)),
    "RTX 5090": ("rtx 5090", lambda n: re.search(r"rtx 5090", n)),
}

def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode("utf-8", "replace")

def txt(x):
    return re.sub(r"\s+", " ", html.unescape(re.sub(r"<[^>]+>", " ", x))).strip()

def blocks(page, start_re, size=6000):
    idx = [m.start() for m in re.finditer(start_re, page)]
    for k, i in enumerate(idx):
        yield page[i:min(idx[k + 1] if k + 1 < len(idx) else i + size, i + size)]

def eur_fr(a, b=None):
    return float(a.replace(" ", "").replace(" ", "").replace("\xa0", "")) + (int(b) / 100 if b else 0)

# --- parseurs : renvoient (nom, prix, en_stock, url) -------------------------------------------
def alternate(q, page=1):
    u = "https://www.alternate.fr/listing.xhtml?q=" + urllib.parse.quote_plus(q) + (f"&page={page}" if page > 1 else "")
    p = get(u)
    for b in blocks(p, r'<a href="[^"]*/html/product/\d+"[^>]*productBox'):
        h = re.search(r'href="([^"]+)"', b)
        n = re.search(r'class="product-name[^"]*"[^>]*>(.*?)</div>', b, re.S)
        m = re.search(r"€\s*([\d.]+),(\d\d)", txt(b))
        if not (h and n and m):
            continue
        t = txt(b).lower()
        stock = "en stock" in t and not re.search(r"pas en stock|indisponible|temporairement|à partir du", t)
        yield txt(n.group(1)), eur_fr(m.group(1).replace(".", ""), m.group(2)), stock, urllib.parse.urljoin("https://www.alternate.fr/", h.group(1))

def ldlc_like(base, q, page=1):
    u = f"{base}/recherche/{urllib.parse.quote(q)}/" + (f"page{page}/" if page > 1 else "")
    p = get(u)
    for b in blocks(p, r'<li[^>]*class="[^"]*(?:pdt-item|c-products-list__item)'):
        h = re.search(r'href="((?:https://www\.(?:ldlc|materiel)\.(?:com|net))?/(?:fiche|produit)/[^"#]+)"', b)
        n = re.search(r'<h[23][^>]*>(.*?)</h[23]>', b, re.S)
        d = re.search(r'<p class="desc">(.*?)</p>', b, re.S)
        t = txt(b)
        m = re.search(r"(\d[\d ]*)€\s*(\d\d)\b", t)
        if not (h and n and m):
            continue
        name = txt(n.group(1)) + ((" - " + txt(d.group(1))[:50]) if d else "")
        w = re.search(r"web\s*:.{0,40}?(en stock|rupture)", t, re.I)
        stock = bool(w and w.group(1).lower() == "en stock")
        yield name, eur_fr(m.group(1), m.group(2)), stock, urllib.parse.urljoin(base, h.group(1))

def ldlc(q, page=1):
    return ldlc_like("https://www.ldlc.com", q, page)

def materiel(q, page=1):
    return ldlc_like("https://www.materiel.net", q, page)

def grosbill(q, page=1):
    u = "https://www.grosbill.com/recherche?q=" + urllib.parse.quote(q) + (f"&page={page}" if page > 1 else "")
    p = get(u)
    for b in blocks(p, r'<article class="product-row'):
        h = re.search(r'href="(https://www\.grosbill\.com/[a-z0-9-]+-\d{5,}|/[a-z0-9-]+-\d{5,})"', b)
        t = txt(b)
        head = t.split(" Web ")[0]
        name = re.sub(r"^(Promo|Nouveau|Top des ventes)\s+", "", head)
        brand = re.search(r"\b(Asus|MSI|Gigabyte|Zotac|PNY|Palit|Gainward|INNO3D|Inno3D|KFA2|Nvidia|ASRock|Sapphire|PowerColor)\b", name)
        if brand:
            name = name[brand.start():]
        prices = re.findall(r"(\d[\d ]*)\s?[,.]\s?(\d\d) €", t.split("Ou 4")[0])
        if not (h and prices):
            continue
        a, c = prices[-1]
        stock = bool(re.search(r"Web En stock", t))
        yield name, eur_fr(a, c), stock, urllib.parse.urljoin("https://www.grosbill.com/", h.group(1))

SITES = {"Alternate": alternate, "LDLC": ldlc, "Materiel.net": materiel, "Grosbill": grosbill}

def main():
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    try:
        old = json.loads(OUT.read_text())
    except Exception:
        old = {"cartes": {}}
    res = {"updated": now, "cartes": {}}
    for carte, (q, ok) in CARTES.items():
        offers = []
        for site, fn in SITES.items():
            rows, err = [], None
            for page in (1, 2):
                try:
                    got = list(fn(q, page))
                except Exception as e:  # blocage, page changée…
                    err = type(e).__name__
                    break
                if not got:
                    break
                rows += got
                time.sleep(1.5)
            sel = [r for r in rows if "geforce" in r[0].lower() and not BAD.search(r[0]) and r[1] >= 250 and ok(re.sub(r"\s+", " ", r[0].lower()))]
            dedup = {r[3]: r for r in sel}.values()
            stock = sorted((r for r in dedup if r[2]), key=lambda r: r[1])
            allp = sorted(dedup, key=lambda r: r[1])
            best = stock[0] if stock else None
            if err:
                prev = next((o for o in old.get("cartes", {}).get(carte, {}).get("offres", []) if o["site"] == site and o.get("lu")), None)
                if prev:
                    prev["ancien"] = True
                    offers.append(prev)
                    continue
            offers.append({"site": site, "lu": err is None, "erreur": err, "nb": len(allp), "nb_stock": len(stock),
                           "meilleur": {"nom": best[0], "prix": best[1], "url": best[3]} if best else None,
                           "moins_cher_hors_stock": {"nom": allp[0][0], "prix": allp[0][1], "url": allp[0][3]} if allp and not best else None})
        res["cartes"][carte] = {"offres": offers}
    OUT.write_text(json.dumps(res, ensure_ascii=False, indent=1) + "\n")
    for c, v in res["cartes"].items():
        print(c, "|", " ; ".join(f"{o['site']}: " + (f"{o['meilleur']['prix']:.2f}" if o['meilleur'] else ("rupture" if o['lu'] and o['nb'] else ("aucun" if o['lu'] else "illisible"))) for o in v["offres"]))

if __name__ == "__main__":
    sys.exit(main())
