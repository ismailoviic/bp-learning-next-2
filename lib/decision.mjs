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

import { matchCatalogue, matchUpsellsForEntries } from "./catalogue.mjs";
import questionsRaw from "./clarification-questions.json";

export const counterQuestions = questionsRaw.map(q => ({
  ...q,
  showWhen: (answers) => {
    if (q.showWhen === "always") return true;
    if (q.showWhen.startsWith("has_answered:")) {
      const depId = q.showWhen.split(":")[1];
      return !!answers.find(a => a.questionId === depId);
    }
    return true;
  }
}));

export function nextQuestion(answers) {
  return (
    counterQuestions.find(
      (q) =>
        q.showWhen(answers) && !answers.some((a) => a.questionId === q.id),
    ) || null
  );
}

const MEDICATION_SIGNALS = [
  "ordonnance", "prescrit", "traitement", "médicament", "antibiotique",
  "comprimé", "gélule", "posologie", "effet secondaire", "interaction",
  "contre-indication", "allergie médicament", "tension", "diabète",
  "tension artérielle", "insuffisance", "douleur chronique", "douleur intense",
];

function hasMedicationSignal(text) {
  if (!text) return false;
  const lower = text.toLowerCase();
  return MEDICATION_SIGNALS.some((t) => lower.includes(t));
}

export function decide(input) {
  const { expressedNeed = "", entries = [], answers = [] } = input;

  const unknowns = entries
    .filter((e) => e.unknown)
    .map((e) => e.name || "Produit inconnu");

  const needHasMed = hasMedicationSignal(expressedNeed);
  const entriesHaveMed = entries.some((e) => e.isMedication);
  const otherProductsAnswer = answers.find((a) => a.questionId === "q_other_products");
  const customerHasOtherMeds =
    otherProductsAnswer?.value &&
    otherProductsAnswer.value.toLowerCase() !== "non" &&
    otherProductsAnswer.value !== null;

  const isPharmacistRequired = needHasMed || entriesHaveMed || customerHasOtherMeds;

  // 1. Evaluate unanswered questions
  const unanswered = nextQuestion(answers);

  // 2. Gather all candidates
  const matches = matchCatalogue(expressedNeed);
  const triggeredRules = matchUpsellsForEntries(entries, expressedNeed, answers);
  
  // Create a debug trace of triggered rules
  const ruleTrace = triggeredRules.map(r => ({ ruleId: r.ruleId, outcome: r.outcome }));

  // Combine items, remove duplicates
  let catalogueItems = [...matches, ...triggeredRules.flatMap(r => r.items)];
  catalogueItems = Array.from(new Map(catalogueItems.map(item => [item.id, item])).values());

  const hasPharmacistRule = triggeredRules.some(r => r.outcome === "pharmacist_review");

  // Determine final action
  let action;
  let reason;
  let suggestedWording;

  if (isPharmacistRequired || hasPharmacistRule) {
    action = "pharmacist_review";
    if (hasPharmacistRule) {
      const pRule = triggeredRules.find(r => r.outcome === "pharmacist_review");
      reason = "Le traitement implique des produits nécessitant l'avis du pharmacien.";
      suggestedWording = pRule.suggestedWording;
    } else {
      reason = "La demande ou les informations saisies impliquent un médicament ou un traitement en cours. Ce type de question doit être transmis au pharmacien.";
      suggestedWording = "Je vais vous orienter vers notre pharmacien, qui pourra vous répondre avec précision sur cette question.";
    }
  } else if (unanswered) {
    action = "more_info";
    reason = unanswered.whyUseful;
    suggestedWording = unanswered.text;
  } else if (catalogueItems.length > 0) {
    action = "option";
    reason = `Le besoin exprimé correspond à des options dans notre catalogue.`;
    suggestedWording = catalogueItems[0].suggestedWording;
  } else {
    action = "no_action";
    reason = "D'après les informations disponibles, aucun produit complémentaire de notre catalogue ne correspond clairement au besoin exprimé.";
    suggestedWording = "Je n'ai pas de produit complémentaire à vous proposer pour le moment. N'hésitez pas à revenir si vous avez d'autres questions.";
  }

  // Slice to max 3 candidates per requirement
  catalogueItems = catalogueItems.slice(0, 3);

  if (process.env.NODE_ENV !== "production") {
    console.log("[Rule Trace]", { isPharmacistRequired, hasPharmacistRule, ruleTrace, catalogueItems: catalogueItems.map(i => i.id) });
  }

  return {
    action,
    reason,
    suggestedWording,
    catalogueItems,
    unknowns,
    ruleTrace,
    stale: false,
  };
}

export function markStale(result) {
  return { ...result, stale: true };
}
