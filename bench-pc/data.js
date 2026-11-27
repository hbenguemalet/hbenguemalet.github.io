// Données du plan d'achat — relevé du 27/11/2026. Les prix changent vite : vérifier avant commande.
window.BENCH = {
  releve: "27/11/2026",
  actuel: { cpu: "Intel Core i5-14600KF", gpu: "GTX 1070 (8 Go)", psu: "Corsair 650 W", ram: "32 Go DDR5", carte: "Carte mère B760" },
  gardes: [
    ["Processeur", "i5-14600KF", "Suffisant pour le 4K : le GPU est le facteur limitant."],
    ["Carte mère", "B760", "Mettre le BIOS à jour pour la stabilité des 13e et 14e générations."],
    ["Mémoire", "32 Go DDR5", "Suffisant."],
    ["Stockage", "Inchangé", "Pas de changement prévu."]
  ],
  // Fiches constructeur (généralités), pas des mesures.
  gpus: [
    { nom: "GTX 1070", vram: 8, type: "GDDR5", bus: 256, w: 150, actuel: true },
    { nom: "RTX 5070 Ti", vram: 16, type: "GDDR7", bus: 256, w: 300 },
    { nom: "RTX 5080", vram: 16, type: "GDDR7", bus: 256, w: 360 },
    { nom: "RTX 5090", vram: 32, type: "GDDR7", bus: 512, w: 575 }
  ],
  paliers: [
    { id: 1, nom: "RTX 5070 Ti", sous: "16 Go · le bon rapport", cible: "~1 860 à 1 950 €", accent: "#8fd3ff",
      items: [
        { id: "p1-gpu", k: "Carte graphique", n: "MSI RTX 5070 Ti VENTUS 3X OC (16 Go)", lo: 1553, hi: 1553, s: "en stock, Alternate", u: "https://www.alternate.fr/MSI/GeForce-RTX-5070-Ti-16G-VENTUS-3X-OC-Carte-graphique/html/product/100111973" },
        { id: "p1-psu", k: "Alimentation", n: "be quiet! Pure Power 12 750 W, 80+ Gold", lo: 109.95, hi: 109.95, s: "en stock, LDLC", u: "https://www.ldlc.com/fiche/PB00652458.html", w: "Lien commun aux trois puissances : vérifier la variante." },
        { id: "p1-case", k: "Boîtier", n: "Fractal Design Meshify 2 Compact", lo: 110, hi: 180, s: "plus de 10 en stock, Galaxus", u: "https://www.galaxus.fr/fr/s1/product/fractal-meshify-2-compact-atx-matx-mini-itx-boitier-pc-14654476" },
        { id: "p1-cooler", k: "Refroidissement CPU", n: "Thermalright Peerless Assassin 120 SE ARGB Blanc", lo: 49.99, hi: 49.99, s: "en stock, Topachat", u: "https://www.topachat.com/pages/detail2_cat_est_micro_puis_rubrique_est_w_ven_puis_ref_est_in20020816.html" },
        { id: "p1-fans", k: "Ventilateurs", n: "Arctic P12, pack de 5", lo: 24.95, hi: 24.95, s: "en stock, LDLC", u: "https://www.ldlc.com/fiche/PB00658862.html" },
        { id: "p1-paste", k: "Pâte thermique", n: "À choisir", lo: 10, hi: 10, s: "non vérifié", u: null }
      ],
      alt: { id: "p1-alt", n: "Zotac RTX 5070 Ti SOLID OC SFF", p: 1385, s: "en stock, Alternate", u: "https://www.alternate.fr/ZOTAC/GeForce-RTX-5070-Ti-SOLID-OC-SFF-Carte-graphique/html/product/100123137", note: "Format compact : vérifier la place dans le boîtier." } },
    { id: 2, nom: "RTX 5080", sous: "16 Go · la puissance", cible: "~2 250 à 2 350 €", accent: "#b9a6ff",
      items: [
        { id: "p2-gpu", k: "Carte graphique", n: "Zotac RTX 5080 SOLID CORE OC (16 Go)", lo: 1939, hi: 1939, s: "en stock, Alternate", u: "https://www.alternate.fr/ZOTAC/GeForce-RTX-5080-SOLID-CORE-OC-Carte-graphique/html/product/100119363" },
        { id: "p2-psu", k: "Alimentation", n: "be quiet! Pure Power 12 850 W, 80+ Gold", lo: 119.95, hi: 119.95, s: "en stock, LDLC", u: "https://www.ldlc.com/fiche/PB00652458.html", w: "Lien commun aux trois puissances : vérifier la variante." },
        { id: "p2-case", k: "Boîtier", n: "Fractal Design Meshify 2 Compact", lo: 110, hi: 180, s: "stock Galaxus", u: "https://www.galaxus.fr/fr/s1/product/fractal-meshify-2-compact-atx-matx-mini-itx-boitier-pc-14654476" },
        { id: "p2-cooler", k: "Refroidissement CPU", n: "Thermalright Peerless Assassin 120 SE ARGB Blanc", lo: 49.99, hi: 49.99, s: "en stock, Topachat", u: "https://www.topachat.com/pages/detail2_cat_est_micro_puis_rubrique_est_w_ven_puis_ref_est_in20020816.html" },
        { id: "p2-fans", k: "Ventilateurs", n: "Arctic P12, pack de 5", lo: 24.95, hi: 24.95, s: "en stock, LDLC", u: "https://www.ldlc.com/fiche/PB00658862.html" },
        { id: "p2-paste", k: "Pâte thermique", n: "À choisir", lo: 10, hi: 10, s: "non vérifié", u: null }
      ],
      alt: { id: "p2-alt", n: "ASUS PRIME RTX 5080 OC", p: 2205, s: "en stock, Alternate", u: "https://www.alternate.fr/ASUS/PRIME-GeForce-RTX-5080-OC-Carte-graphique/html/product/100108203", note: "Autre option pour le même budget." } },
    { id: 3, nom: "RTX 5090", sous: "32 Go · sans limite", cible: "~9 600 €", accent: "#ffb877",
      items: [
        { id: "p3-gpu", k: "Carte graphique", n: "MSI RTX 5090 VENTUS 3X OC (32 Go)", lo: 9199.99, hi: 9199.99, s: "en stock, Topachat", u: "https://www.topachat.com/pages/detail2_cat_est_micro_puis_rubrique_est_wgfx_pcie_puis_ref_est_in20026881.html" },
        { id: "p3-psu", k: "Alimentation", n: "be quiet! Pure Power 12 1000 W, 80+ Gold", lo: 149.95, hi: 149.95, s: "en stock, LDLC", u: "https://www.ldlc.com/fiche/PB00652458.html", w: "Lien commun aux trois puissances : vérifier la variante." },
        { id: "p3-case", k: "Boîtier", n: "Fractal Design Meshify 2 Compact (ou plus grand, à chercher)", lo: 110, hi: 180, s: "stock Galaxus", u: "https://www.galaxus.fr/fr/s1/product/fractal-meshify-2-compact-atx-matx-mini-itx-boitier-pc-14654476" },
        { id: "p3-cooler", k: "Refroidissement CPU", n: "Thermalright Peerless Assassin 120 SE ARGB Blanc (AIO 360 mm à chercher)", lo: 49.99, hi: 49.99, s: "en stock, Topachat", u: "https://www.topachat.com/pages/detail2_cat_est_micro_puis_rubrique_est_w_ven_puis_ref_est_in20020816.html" },
        { id: "p3-fans", k: "Ventilateurs", n: "Arctic P12, pack de 5", lo: 24.95, hi: 24.95, s: "en stock, LDLC", u: "https://www.ldlc.com/fiche/PB00658862.html" },
        { id: "p3-paste", k: "Pâte thermique", n: "À choisir", lo: 10, hi: 10, s: "non vérifié", u: null }
      ],
      alt: null, msrp: 2099 }
  ],
  bonsPlans: [
    { t: "Le moins cher : Zotac RTX 5070 Ti SOLID OC SFF", p: "1 385 €", d: "En stock chez Alternate. Soit 168 € de moins que la MSI du palier 1.", u: "https://www.alternate.fr/ZOTAC/GeForce-RTX-5070-Ti-SOLID-OC-SFF-Carte-graphique/html/product/100123137", tag: "Bon plan" },
    { t: "Alternative 5080 : ASUS PRIME RTX 5080 OC", p: "2 205 €", d: "En stock chez Alternate, pour comparer avec la Zotac à 1 939 €.", u: "https://www.alternate.fr/ASUS/PRIME-GeForce-RTX-5080-OC-Carte-graphique/html/product/100108203", tag: "Option" },
    { t: "RTX 5090 : à ne pas acheter à ce prix", p: "9 199,99 €", d: "Prix conseillé : 2 099 €. Il est raisonnable d'attendre une baisse.", u: null, tag: "Attendre", warn: true }
  ],
  verifs: [
    "Le stock et les prix peuvent changer entre le relevé et la commande.",
    "Vérifier la longueur de la carte graphique et de l'alimentation par rapport au boîtier.",
    "Le Peerless Assassin mesure 155 mm de haut : vérifier la hauteur maximale admise par le boîtier.",
    "Le Meshify 2 Compact n'est plus vendu chez LDLC, mais il est en stock chez Galaxus.",
    "Dépoussiérer filtres et ventilateurs, et contrôler les températures avec HWiNFO avant et après.",
    "Mettre à jour le BIOS de la B760 avant d'installer la nouvelle carte."
  ]
};
