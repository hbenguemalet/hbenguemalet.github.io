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
  // Fiches constructeur / puissances recommandées par NVIDIA
  gpu: {
    "GTX 1070": { w: 150, vram: 8, psuReco: 500 },
    "RTX 5070 Ti": { w: 300, vram: 16, psuReco: 750 },
    "RTX 5080": { w: 360, vram: 16, psuReco: 850 },
    "RTX 5090": { w: 575, vram: 32, psuReco: 1000 }
  },
  cpuW: 181, autresW: 75,
  // Performance relative (RTX 5070 Ti = 100). Sources et date indiquées ; fiabilité variable.
  perf: [
    { nom: "RTX 5090", v: 166, src: "Notebookcheck (agrégat, 5070 Ti à 66 % derrière)", fiab: "moyenne" },
    { nom: "RTX 5080", v: 114, src: "GamersNexus (5080 devant de 12 à 16 % en 4K)", fiab: "bonne" },
    { nom: "RTX 5070 Ti", v: 100, src: "Référence", fiab: "bonne" },
    { nom: "GTX 1070", v: 20, src: "HowManyFPS (5070 Ti 392 % plus rapide, moyenne de 100+ jeux)", fiab: "faible : sources divergentes" }
  ],
  sources: [
    ["GamersNexus · test RTX 5070 Ti", "https://gamersnexus.net/gpus/do-not-buy-nvidia-rtx-5070-ti-gpu-absurdity-benchmarks-review"],
    ["KitGuru · MSI RTX 5070 Ti VENTUS 3X OC", "https://www.kitguru.net/components/graphic-cards/dominic-moass/msi-rtx-5070-ti-ventus-3x-oc-review/all/1"],
    ["Notebookcheck · 5070 Ti vs 5090", "https://www.notebookcheck.net/GeForce-RTX-5090-vs-GeForce-RTX-5070-Ti_12931_12932.247598.0.html"],
    ["HowManyFPS · GTX 1070 vs RTX 5070 Ti", "https://howmanyfps.com/graphics-cards/comparisons/geforce-gtx-1070-vs-geforce-rtx-5070-ti"]
  ],
  bench_date: "27/11/2026"
};
