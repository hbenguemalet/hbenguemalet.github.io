// Ma config, objectifs, écarts de performance sourcés. Rien ici n'est une mesure maison.
window.BENCH2 = {
  ma: [
    { id: "cpu", nom: "Processeur", val: "Intel Core i5-14600KF", detail: "14 cœurs (6 P + 8 E), puissance max 181 W", statut: "garde", note: "Suffisant pour le 4K : le GPU est le facteur limitant." },
    { id: "gpu", nom: "Carte graphique", val: "GTX 1070 · 8 Go GDDR5", detail: "150 W, architecture Pascal (2016), sans DLSS ni ray tracing matériel", statut: "change", note: "Le maillon faible pour le 4K." },
    { id: "psu", nom: "Alimentation", val: "Corsair 650 W", detail: "Marge trop juste avec une RTX 5070 Ti ou plus", statut: "change", note: "À remplacer en même temps que la carte." },
    { id: "ram", nom: "Mémoire", val: "32 Go DDR5", detail: "Largement suffisant pour le jeu", statut: "garde", note: "Pas de changement." },
    { id: "mb", nom: "Carte mère", val: "Chipset B760", detail: "Prévoir une mise à jour du BIOS (stabilité 13e/14e génération)", statut: "garde", note: "Mettre le BIOS à jour avant tout." },
    { id: "case", nom: "Boîtier", val: "Actuel", detail: "Dimensions à mesurer : longueur de carte, hauteur de ventirad", statut: "change", note: "Remplacé dans le plan." },
    { id: "cool", nom: "Refroidissement CPU", val: "Actuel", detail: "Le 14600KF chauffe : un bon ventirad compte", statut: "change", note: "Remplacé dans le plan." },
    { id: "ssd", nom: "Stockage", val: "Inchangé", detail: "Non concerné ici", statut: "garde", note: "Pas de changement prévu." }
  ],
  cpuW: 181, autresW: 75,
  // Catalogue de cartes. perf = performance relative en jeu 4K (RTX 5070 Ti = 100), null si aucun écart sourcé.
  // Fiches constructeur (mémoire, bus, puissance, alim conseillée). Aucun prix inventé : à relever.
  cartes: [
    { n: "GTX 1070", m: "NVIDIA", vram: 8, type: "GDDR5", bus: 256, w: 150, psu: 500, perf: 20, src: "HowManyFPS (5070 Ti 392 % plus rapide, moyenne de 100+ jeux)", fiab: "faible", actuel: true },
    { n: "RTX 5060 Ti 16 Go", m: "NVIDIA", vram: 16, type: "GDDR7", bus: 128, w: 180, psu: 600, perf: null, src: "Écart 4K non sourcé", fiab: "-" },
    { n: "RTX 5070", m: "NVIDIA", vram: 12, type: "GDDR7", bus: 192, w: 250, psu: 650, perf: null, src: "Écart 4K non sourcé", fiab: "-" },
    { n: "RTX 4070 Super", m: "NVIDIA", vram: 12, type: "GDDR6X", bus: 192, w: 220, psu: 650, perf: null, src: "Génération précédente : écart 4K non sourcé", fiab: "-" },
    { n: "RTX 4070 Ti Super", m: "NVIDIA", vram: 16, type: "GDDR6X", bus: 256, w: 285, psu: 700, perf: null, src: "Génération précédente : écart 4K non sourcé", fiab: "-" },
    { n: "RTX 4080 Super", m: "NVIDIA", vram: 16, type: "GDDR6X", bus: 256, w: 320, psu: 750, perf: null, src: "Génération précédente : écart 4K non sourcé", fiab: "-" },
    { n: "RTX 3090 (occasion)", m: "NVIDIA", vram: 24, type: "GDDR6X", bus: 384, w: 350, psu: 750, perf: null, src: "Occasion, ancienne génération : écart 4K non sourcé", fiab: "-" },
    { n: "RTX 5070 Ti", m: "NVIDIA", vram: 16, type: "GDDR7", bus: 256, w: 300, psu: 750, perf: 100, src: "Référence", fiab: "bonne" },
    { n: "RTX 5080", m: "NVIDIA", vram: 16, type: "GDDR7", bus: 256, w: 360, psu: 850, perf: 114, src: "GamersNexus (5080 devant de 12 à 16 % en 4K)", fiab: "bonne" },
    { n: "RTX 5090", m: "NVIDIA", vram: 32, type: "GDDR7", bus: 512, w: 575, psu: 1000, perf: 166, src: "Notebookcheck (agrégat, 5070 Ti à 66 % derrière)", fiab: "moyenne" }
  ],
  // Pièces gardées : pistes d'amélioration. Nombres de cœurs/fréquences = fiches Intel ; écarts jeu = tests cités.
  gardes: [
    { id: "cpu", nom: "Processeur", actuel: "Core i5-14600KF", prio: 4, gain: "Très faible en 4K", sock: "LGA1700 : compatible B760 (BIOS à jour)",
      note: "En 4K le GPU limite : changer de processeur ne donne presque rien. À faire en dernier, ou si tu passes en 1080p/1440p compétitif.",
      opts: [
        { n: "i5-14600KF (actuel)", c: "14 (6P+8E)", f: "5,3 GHz", w: 181, actuel: true },
        { n: "i7-13700K", c: "16 (8P+8E)", f: "5,4 GHz", w: 253 },
        { n: "i7-14700K", c: "20 (8P+12E)", f: "5,6 GHz", w: 253 },
        { n: "i9-14900K", c: "24 (8P+16E)", f: "6,0 GHz", w: 253 }
      ],
      verdict: "Les tests (Anandtech, Tom's Hardware, Notebookcheck) montrent un 14700K proche du 14900K, et un 14600K un peu en dessous en jeu à 1080p. En 4K les trois sont limités par la carte graphique.",
      src: [["Anandtech · Raptor Lake Refresh", "https://www.anandtech.com/show/21084/intel-core-i9-14900k-core-i7-14700k-and-core-i5-14600k-review-raptor-lake-refreshed/12"], ["Tom's Hardware · 14900K/14700K/14600K", "https://www.tomshardware.com/news/intel-core-i9-14900k-cpu-review"]] },
    { id: "ram", nom: "Mémoire", actuel: "32 Go DDR5", prio: 2, gain: "Faible, gratuit à vérifier", sock: "DDR5 : compatible",
      note: "Vérifie d'abord dans le BIOS que XMP/EXPO est activé : c'est gratuit. 6000 CL30 est le meilleur rapport selon TechSpot et TechPowerUp.",
      opts: [
        { n: "DDR5-5600", c: "32 Go", f: "écart : référence", w: 0 },
        { n: "DDR5-6000 CL30", c: "32 Go", f: "environ +3 % vs 5600 (TechSpot, un jeu)", w: 0 },
        { n: "DDR5-7200", c: "32 Go", f: "jusqu'à +4 % moy. vs 6000 selon le jeu (PC Gamer)", w: 0 },
        { n: "64 Go", c: "64 Go", f: "aucun test de jeu trouvé", w: 0 }
      ],
      verdict: "Au-delà de 6000, les gains sont faibles (rendements décroissants selon TechPowerUp). 32 Go suffit pour le jeu. Le seul vrai gain : s'assurer que le profil XMP/EXPO est actif.",
      src: [["TechSpot · DDR5 stock vs XMP/EXPO", "https://www.techspot.com/review/2866-ddr5-ram-stock-vs-xmp-expo/"], ["TechPowerUp · scaling mémoire DDR5", "https://techpowerup.com/review/ddr5-memory-performance-scaling-with-amd-zen-5/22.html"]] },
    { id: "mb", nom: "Carte mère", actuel: "B760", prio: 5, gain: "Aucun en performance", sock: "LGA1700",
      note: "Une Z790 n'ajoute pas de FPS. Elle permet surtout de pousser le multiplicateur d'un processeur K et offre plus de ports. À changer seulement si tu veux overclocker.",
      opts: [
        { n: "B760 (actuel)", c: "mémoire OC oui, CPU OC non", f: "PCIe 4.0 / 5.0 selon carte", w: 0, actuel: true },
        { n: "Z790", c: "CPU + mémoire OC", f: "plus de voies PCIe et USB", w: 0 }
      ],
      verdict: "Pas un goulot pour le jeu. Priorité : mettre le BIOS à jour pour la stabilité des 13e/14e générations.",
      src: [] },
    { id: "ssd", nom: "Stockage", actuel: "Non précisé", prio: 6, gain: "Temps de chargement seulement", sock: "M.2 / SATA",
      note: "Dis-moi le modèle de ton SSD pour que je le compare. Un SSD plus rapide change surtout les temps de chargement, pas les FPS.",
      opts: [], verdict: "Je n'ai pas le modèle de ton SSD : je ne peux rien benchmarker honnêtement pour l'instant.", src: [] }
  ],
  sources: [
    ["GamersNexus · test RTX 5070 Ti", "https://gamersnexus.net/gpus/do-not-buy-nvidia-rtx-5070-ti-gpu-absurdity-benchmarks-review"],
    ["KitGuru · MSI RTX 5070 Ti VENTUS 3X OC", "https://www.kitguru.net/components/graphic-cards/dominic-moass/msi-rtx-5070-ti-ventus-3x-oc-review/all/1"],
    ["Notebookcheck · 5070 Ti vs 5090", "https://www.notebookcheck.net/GeForce-RTX-5090-vs-GeForce-RTX-5070-Ti_12931_12932.247598.0.html"],
    ["HowManyFPS · GTX 1070 vs RTX 5070 Ti", "https://howmanyfps.com/graphics-cards/comparisons/geforce-gtx-1070-vs-geforce-rtx-5070-ti"]
  ],
  bench_date: "27/11/2026"
};
