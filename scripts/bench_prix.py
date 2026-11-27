#!/usr/bin/env python3
"""Relève les prix de bench-pc/prices.json en lisant les fiches produit (JSON-LD / meta).
Aucune IA, aucun coût de jetons. Si une page est illisible, la dernière valeur connue est conservée
et le statut passe à « non confirmé » : on n'invente jamais un prix."""
import json, re, sys, time, urllib.request, datetime, html
from pathlib import Path

F = Path(__file__).resolve().parent.parent / "bench-pc" / "prices.json"
UA = "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36"

def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept-Language": "fr-FR,fr;q=0.9"})
    with urllib.request.urlopen(req, timeout=25) as r:
        return r.read().decode("utf-8", "replace")

def num(v):
    try:
        t = re.sub(r"[\s\u202f\xa0]", "", str(v))
        if "," in t:
            t = t.replace(".", "").replace(",", ".")
        return float(t)
    except ValueError:
        return None

def walk(o):
    if isinstance(o, dict):
        yield o
        for v in o.values():
            yield from walk(v)
    elif isinstance(o, list):
        for v in o:
            yield from walk(v)

def parse(page):
    """-> (prix, en_stock) ou None."""
    for m in re.finditer(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', page, re.S | re.I):
        try:
            data = json.loads(html.unescape(m.group(1)))
        except ValueError:
            continue
        for node in walk(data):
            offers = node.get("offers")
            if not offers:
                continue
            for off in (offers if isinstance(offers, list) else [offers]):
                if not isinstance(off, dict):
                    continue
                price = num(off.get("price") or off.get("lowPrice"))
                if price:
                    avail = str(off.get("availability", ""))
                    return price, avail.endswith("InStock") or avail.endswith("LimitedAvailability")
    m = re.search(r'(?:product:price:amount|og:price:amount)["\']\s+content=["\']([\d.,]+)', page)
    if m and num(m.group(1)):
        return num(m.group(1)), None
    return None

def main():
    d = json.loads(F.read_text())
    now = datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    ok = 0
    for key, it in d["items"].items():
        if not it.get("url"):
            continue
        try:
            res = parse(fetch(it["url"]))
        except Exception as e:  # réseau, blocage anti-bot…
            res = None
            it["erreur"] = type(e).__name__
        if res:
            it["price"], stock = res[0], res[1]
            if stock is not None:
                it["stock"] = stock
            it["checked"], it["status"], it["source"] = now, "live", "site"
            it.pop("erreur", None)
            ok += 1
            hist = it.setdefault("hist", [])
            if not hist or hist[-1][1] != it["price"]:
                hist.append([now, it["price"]])
                del hist[:-60]
        elif it.get("source") == "site":
            it["status"] = "stale"
        time.sleep(2)
    d["updated"] = now
    F.write_text(json.dumps(d, ensure_ascii=False, indent=1) + "\n")
    print(f"{ok} prix lus sur {sum(1 for i in d['items'].values() if i.get('url'))}")

if __name__ == "__main__":
    sys.exit(main())
