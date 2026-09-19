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
  {
    id: "probiotiques_flore",
    name: "Probiotiques Flore Intestinale",
    category: "Compléments alimentaires",
    indicatedFor: ["antibiotique", "amoxicilline", "augmentin", "azithromycine", "clamoxyl", "orelox", "zithromax", "flore intestinale", "diarrhée"],
    notFor: ["immunodépression sévère"],
    suggestedWording: "Le traitement antibiotique prescrit peut déséquilibrer votre flore intestinale et causer des inconforts. Je vous conseille de l'associer à ces probiotiques pour la protéger.",
    reviewStatus: "DÉMO — Contenu fictif",
    source: "Catalogue de démonstration BP Learning Phase 2",
  },
  {
    id: "pansement_gastrique",
    name: "Pansement gastrique (Alginate/Antacide)",
    category: "Gastro-entérologie",
    indicatedFor: ["ibuprofène", "anti-inflammatoire", "aspirine", "diclofénac", "naproxène", "profénid", "voltarene", "aINS", "brûlure d'estomac"],
    notFor: ["insuffisance rénale sévère", "prise avec d'autres médicaments sans espacement de 2h"],
    suggestedWording: "Cet anti-inflammatoire peut parfois irriter l'estomac. Si vous êtes sensible, je peux vous proposer un pansement gastrique pour protéger votre estomac pendant le traitement.",
    reviewStatus: "DÉMO — Contenu fictif",
    source: "Catalogue de démonstration BP Learning Phase 2",
  },
  {
    id: "coenzyme_q10",
    name: "Coenzyme Q10 100mg",
    category: "Compléments alimentaires",
    indicatedFor: ["statine", "atorvastatine", "rosuvastatine", "simvastatine", "tahor", "crestor", "zocor", "douleurs musculaires"],
    notFor: ["traitement anticoagulant (interaction possible) sans avis médical"],
    suggestedWording: "Ce traitement pour le cholestérol peut parfois diminuer votre taux de Coenzyme Q10, ce qui cause des sensibilités musculaires. Une supplémentation peut vous aider à maintenir un bon confort musculaire.",
    reviewStatus: "DÉMO — Contenu fictif",
    source: "Catalogue de démonstration BP Learning Phase 2",
  },
];

/**
 * Match catalogue items to an expressed need string.
 * @param {string} expressedNeed
 * @returns {CatalogueItem[]}
 */
export function matchCatalogue(expressedNeed) {
  if (!expressedNeed || expressedNeed.trim().length < 3) return [];
  const lower = expressedNeed.toLowerCase();
  
  // Normal expressed need matching
  const matches = catalogue.filter((item) =>
    item.indicatedFor.some((kw) => lower.includes(kw.toLowerCase())),
  );
  return matches.slice(0, 2);
}

/**
 * Match complementary products based on confirmed entries (medications).
 * @param {import('./decision.mjs').ProductEntry[]} entries
 * @returns {CatalogueItem[]}
 */
export function matchUpsellsForEntries(entries) {
  if (!entries || entries.length === 0) return [];
  const matches = [];
  
  for (const entry of entries) {
    if (!entry.name) continue;
    const lowerName = entry.name.toLowerCase();
    
    // Find all catalogue items where indicatedFor contains a keyword matching the entry name
    const matchingItems = catalogue.filter(item => 
      item.indicatedFor.some(kw => lowerName.includes(kw.toLowerCase()))
    );
    
    for (const item of matchingItems) {
      if (!matches.some(m => m.id === item.id)) {
        matches.push(item);
      }
    }
  }
  
  return matches.slice(0, 2);
}

