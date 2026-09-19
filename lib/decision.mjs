/**
 * Phase 2 — Deterministic decision engine.
 *
 * All logic is encoded as inspectable rule objects.
 * No LLM, no probabilistic reasoning, no clinical guidance.
 *
 * Rules are evaluated in priority order:
 *   1. medication / clinical → pharmacist
 *   2. no expressed need → ask question
 *   3. critical unknowns in entries → ask question
 *   4. catalogue match → explain option
 *   5. no match → no additional product
 */

import { matchCatalogue } from "./catalogue.mjs";

// ─── Types (JSDoc) ────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ProductEntry
 * @property {string} id
 * @property {string} name
 * @property {string} [strength]
 * @property {string} [form]
 * @property {boolean} isMedication  // true = entered as a medication
 * @property {boolean} unknown       // true = employee marked it as unclear
 */

/**
 * @typedef {Object} QuestionAnswer
 * @property {string} questionId
 * @property {string|null} value   // null = "Je ne sais pas" / "Préfère ne pas répondre"
 */

/**
 * @typedef {Object} SessionInput
 * @property {string} expressedNeed        // free text from "Décrire le besoin"
 * @property {ProductEntry[]} entries      // confirmed product list
 * @property {QuestionAnswer[]} answers    // customer question answers
 */

/**
 * @typedef {Object} DecisionResult
 * @property {"question"|"option"|"pharmacist"|"no_action"} action
 * @property {string} reason
 * @property {string} suggestedWording
 * @property {import('./catalogue.mjs').CatalogueItem[]} catalogueItems
 * @property {string[]} unknowns           // list of unclear fields
 * @property {boolean} stale              // true if recalculation is needed
 */

// ─── Medication keyword rules ─────────────────────────────────────────────────

const MEDICATION_SIGNALS = [
  "ordonnance",
  "prescrit",
  "traitement",
  "médicament",
  "antibiotique",
  "comprimé",
  "gélule",
  "posologie",
  "effet secondaire",
  "interaction",
  "contre-indication",
  "allergie médicament",
  "tension",
  "diabète",
  "tension artérielle",
  "insuffisance",
  "douleur chronique",
  "douleur intense",
];

function hasMedicationSignal(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return MEDICATION_SIGNALS.some((t) => lower.includes(t));
}

// ─── Customer question rules ──────────────────────────────────────────────────

/**
 * Ordered list of questions presented during counter assistance.
 * Each question is only shown when its `showWhen` predicate passes.
 * `whyUseful` is shown inline to the employee.
 */
export const counterQuestions = [
  {
    id: "q_who",
    text: "C'est pour vous ou pour quelqu'un d'autre ?",
    whyUseful:
      "Connaître la personne concernée aide à adapter la conversation et à repérer si des informations supplémentaires sont nécessaires (ex. : enfant, personne âgée).",
    allowUnknown: true,
    showWhen: () => true, // always first
  },
  {
    id: "q_duration",
    text: "Depuis combien de temps vous ressentez ça ?",
    whyUseful:
      "Une gêne récente et une gêne chronique n'appellent pas la même réponse. Cette information aide à choisir entre une option simple et une orientation vers le pharmacien.",
    allowUnknown: true,
    showWhen: (answers) => {
      // show if we have an expressed need but not already a pharmacist flag
      return true;
    },
  },
  {
    id: "q_tried",
    text: "Avez-vous déjà essayé quelque chose pour ça ?",
    whyUseful:
      "Savoir ce qui a déjà été essayé évite de proposer la même chose et peut indiquer si la situation est plus persistante.",
    allowUnknown: true,
    showWhen: (answers) => {
      const who = answers.find((a) => a.questionId === "q_who");
      return !!who; // only after q_who answered
    },
  },
  {
    id: "q_other_products",
    text: "Prenez-vous d'autres produits ou médicaments en ce moment ?",
    whyUseful:
      "Cette information est indispensable si vous envisagez de suggérer un complément alimentaire ou un produit OTC. Si oui, le pharmacien doit être impliqué.",
    allowUnknown: true,
    showWhen: (answers) => {
      const tried = answers.find((a) => a.questionId === "q_tried");
      return !!tried;
    },
  },
];

/**
 * Compute the next unanswered question given the current answer set.
 * @param {QuestionAnswer[]} answers
 * @returns {typeof counterQuestions[0]|null}
 */
export function nextQuestion(answers) {
  return (
    counterQuestions.find(
      (q) =>
        q.showWhen(answers) && !answers.some((a) => a.questionId === q.id),
    ) || null
  );
}

// ─── Decision logic ───────────────────────────────────────────────────────────

/**
 * Compute the next action from the current session state.
 * Pure function — no side effects.
 *
 * @param {SessionInput} input
 * @returns {DecisionResult}
 */
export function decide(input) {
  const { expressedNeed = "", entries = [], answers = [] } = input;

  const unknowns = entries
    .filter((e) => e.unknown)
    .map((e) => e.name || "Produit inconnu");

  // Rule 1: Any medication signal → pharmacist
  const needHasMed = hasMedicationSignal(expressedNeed);
  const entriesHaveMed = entries.some((e) => e.isMedication);
  const otherProductsAnswer = answers.find(
    (a) => a.questionId === "q_other_products",
  );
  const customerHasOtherMeds =
    otherProductsAnswer?.value &&
    otherProductsAnswer.value.toLowerCase() !== "non" &&
    otherProductsAnswer.value !== null;

  if (needHasMed || entriesHaveMed || customerHasOtherMeds) {
    return {
      action: "pharmacist",
      reason:
        "La demande ou les informations saisies impliquent un médicament ou un traitement en cours. Ce type de question doit être transmis au pharmacien.",
      suggestedWording:
        "Je vais vous orienter vers notre pharmacien, qui pourra vous répondre avec précision sur cette question.",
      catalogueItems: [],
      unknowns,
      stale: false,
    };
  }

  // Rule 2: No expressed need → ask first question
  if (!expressedNeed || expressedNeed.trim().length < 5) {
    return {
      action: "question",
      reason: "Le besoin de la personne n'a pas encore été exprimé.",
      suggestedWording: "Qu'est-ce qui vous amène aujourd'hui ?",
      catalogueItems: [],
      unknowns,
      stale: false,
    };
  }

  // Rule 3: More questions available → ask next
  const unanswered = nextQuestion(answers);
  if (unanswered) {
    return {
      action: "question",
      reason: unanswered.whyUseful,
      suggestedWording: unanswered.text,
      catalogueItems: [],
      unknowns,
      stale: false,
    };
  }

  // Rule 4: Try catalogue match
  const matches = matchCatalogue(expressedNeed);
  if (matches.length > 0) {
    return {
      action: "option",
      reason: `Le besoin exprimé — « ${expressedNeed} » — correspond à ${matches.length > 1 ? "des options" : "une option"} disponible(s) dans notre catalogue de démonstration.`,
      suggestedWording: matches[0].suggestedWording,
      catalogueItems: matches,
      unknowns,
      stale: false,
    };
  }

  // Rule 5: No match → no additional product
  return {
    action: "no_action",
    reason:
      "D'après les informations disponibles, aucun produit complémentaire de notre catalogue ne correspond clairement au besoin exprimé.",
    suggestedWording:
      "Je n'ai pas de produit complémentaire à vous proposer pour le moment. N'hésitez pas à revenir si vous avez d'autres questions.",
    catalogueItems: [],
    unknowns,
    stale: false,
  };
}

/**
 * Mark a result as stale (input has changed since last calculation).
 * @param {DecisionResult} result
 * @returns {DecisionResult}
 */
export function markStale(result) {
  return { ...result, stale: true };
}
