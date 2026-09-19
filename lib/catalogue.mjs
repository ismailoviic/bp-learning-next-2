/**
 * Phase 2 — Curated complementary product catalogue.
 *
 * ALL ENTRIES ARE FICTIONAL AND FOR DEMONSTRATION PURPOSES ONLY.
 * This catalogue does not constitute clinical, pharmacological or
 * medical advice. Products and brand names are invented.
 *
 * Matching is done by expressed need keywords, not by medical diagnosis.
 * A medication name or potential side effect must NEVER automatically
 * trigger a suggestion from this catalogue.
 */

/** @type {CatalogueItem[]} */
export const catalogue = [
  {
    id: "baume_levres_froid",
    name: "Baume lèvres protecteur froid",
    category: "Soin du visage",
    indicatedFor: ["lèvres sèches", "froid", "dessèchement"],
    notFor: ["plaie ouverte", "infection"],
    suggestedWording:
      "On a un baume lèvres sans parfum, adapté au froid — simple et pratique.",
    reviewStatus:
      "DÉMO — Contenu fictif non revu par un professionnel de santé",
    source: "Catalogue de démonstration BP Learning Phase 2",
  },
  {
    id: "creme_mains_hiver",
    name: "Crème mains hiver nourrissante",
    category: "Soin du corps",
    indicatedFor: ["mains sèches", "froid", "dessèchement", "peau tiraillée"],
    notFor: ["plaie ouverte", "eczéma suintant"],
    suggestedWording:
      "Pour les mains sèches par le froid, on a une crème mains nourrissante — elle s'absorbe vite.",
    reviewStatus:
      "DÉMO — Contenu fictif non revu par un professionnel de santé",
    source: "Catalogue de démonstration BP Learning Phase 2",
  },
  {
    id: "spray_eau_mer",
    name: "Spray nasal eau de mer isotonique",
    category: "ORL — Nez",
    indicatedFor: [
      "nez bouché",
      "nez sec",
      "congestion légère",
      "rhinite légère",
    ],
    notFor: ["prescription médicale requise", "polypes nasaux connus"],
    suggestedWording:
      "Pour un nez bouché léger, on a un spray eau de mer — sans médicament, doux pour un usage quotidien.",
    reviewStatus:
      "DÉMO — Contenu fictif non revu par un professionnel de santé",
    source: "Catalogue de démonstration BP Learning Phase 2",
  },
  {
    id: "pastilles_gorge_menthol",
    name: "Pastilles gorge menthol apaisantes",
    category: "ORL — Gorge",
    indicatedFor: [
      "irritation de gorge légère",
      "gorge sèche",
      "voix enrouée légère",
    ],
    notFor: ["enfants de moins de 6 ans", "angine bactérienne diagnostiquée"],
    suggestedWording:
      "Pour une irritation légère, des pastilles gorge au menthol peuvent aider à apaiser.",
    reviewStatus:
      "DÉMO — Contenu fictif non revu par un professionnel de santé",
    source: "Catalogue de démonstration BP Learning Phase 2",
  },
  {
    id: "magnesium_complement",
    name: "Complément magnésium marin",
    category: "Compléments alimentaires",
    indicatedFor: [
      "fatigue passagère",
      "manque d'énergie",
      "coup de mou",
      "stress léger",
    ],
    notFor: [
      "maladie chronique non diagnostiquée",
      "traitement en cours sans avis pharmacien",
    ],
    suggestedWording:
      "Un complément en magnésium peut correspondre à ce que vous décrivez — la durée recommandée est d'un mois.",
    reviewStatus:
      "DÉMO — Contenu fictif non revu par un professionnel de santé",
    source: "Catalogue de démonstration BP Learning Phase 2",
  },
  {
    id: "gel_hydro_mains",
    name: "Gel hydroalcoolique mains 500 ml",
    category: "Hygiène",
    indicatedFor: ["hygiène des mains", "déplacement", "usage professionnel"],
    notFor: ["peau lésée"],
    suggestedWording:
      "Pour l'hygiène en déplacement, on a un gel mains de 500 ml rechargeable.",
    reviewStatus:
      "DÉMO — Contenu fictif non revu par un professionnel de santé",
    source: "Catalogue de démonstration BP Learning Phase 2",
  },
  {
    id: "creme_solaire_50",
    name: "Crème solaire SPF 50+ visage",
    category: "Soin du visage",
    indicatedFor: [
      "protection solaire",
      "exposition soleil",
      "peau sensible",
      "teint à protéger",
    ],
    notFor: ["allergie connue aux filtres solaires"],
    suggestedWording:
      "Pour une protection solaire quotidienne, on a une crème SPF 50+ légère, adaptée au visage.",
    reviewStatus:
      "DÉMO — Contenu fictif non revu par un professionnel de santé",
    source: "Catalogue de démonstration BP Learning Phase 2",
  },
  {
    id: "collyre_hydratant",
    name: "Collyre hydratant sans conservateur",
    category: "Soins oculaires",
    indicatedFor: [
      "yeux secs",
      "irritation légère des yeux",
      "écrans prolongés",
      "air climatisé",
    ],
    notFor: [
      "infection oculaire",
      "traumatisme oculaire",
      "rougeur persistante",
    ],
    suggestedWording:
      "Pour des yeux secs ou fatigués par les écrans, on a des gouttes hydratantes sans conservateur.",
    reviewStatus:
      "DÉMO — Contenu fictif non revu par un professionnel de santé",
    source: "Catalogue de démonstration BP Learning Phase 2",
  },
];

/**
 * Match catalogue items to an expressed need string.
 * Returns at most 2 items that share at least 1 keyword.
 * Medication names or clinical terms intentionally return no results.
 *
 * @param {string} expressedNeed
 * @returns {CatalogueItem[]}
 */
export function matchCatalogue(expressedNeed) {
  if (!expressedNeed || expressedNeed.trim().length < 3) return [];
  const lower = expressedNeed.toLowerCase();
  // Block if the need contains medication-related terms
  const medicationTerms = [
    "médicament",
    "ordonnance",
    "prescrit",
    "traitement",
    "antibiotique",
    "anti-",
    "comprimé",
    "gélule",
    "posologie",
    "effet secondaire",
    "interaction",
    "contre-indication",
    "allergie médicament",
  ];
  if (medicationTerms.some((t) => lower.includes(t))) return [];

  const matches = catalogue.filter((item) =>
    item.indicatedFor.some((kw) => lower.includes(kw.toLowerCase())),
  );
  return matches.slice(0, 2);
}
