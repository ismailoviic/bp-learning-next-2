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

import products from "./products.json";
import rules from "./complementary-rules.json";

export const catalogue = products.filter(p => p.fictional && p.category !== "Test");
export const allProducts = products;

/**
 * Match catalogue items to an expressed need string.
 * @param {string} expressedNeed
 * @returns {Array}
 */
export function matchCatalogue(expressedNeed) {
  if (!expressedNeed || expressedNeed.trim().length < 3) return [];
  const lower = expressedNeed.toLowerCase();
  
  // Normal expressed need matching
  const matches = catalogue.filter((item) =>
    item.needTags.some((kw) => lower.includes(kw.toLowerCase())),
  );
  return matches.slice(0, 2).map(item => ({
    ...item,
    why: "Correspond au besoin que vous avez exprimé.",
    toVerify: item.notFor && item.notFor.length > 0 ? "Absence de : " + item.notFor.join(", ") : null,
    ruleOutcome: "option"
  }));
}

/**
 * Match complementary products based on confirmed entries (medications).
 * Uses the deterministic rule engine (complementary-rules.json).
 * @param {Array} entries
 * @param {string} [expressedNeed]
 * @returns {Array} List of triggered rules containing { outcome, suggestedWording, items }
 */
export function matchUpsellsForEntries(entries, expressedNeed = "", answers = []) {
  if (!entries || entries.length === 0) return [];
  
  const triggeredRules = [];
  
  // Create a combined text of everything known about the patient's state
  const patientStateText = (
    expressedNeed + " " + 
    entries.filter(e => e.name).map(e => e.name).join(" ") + " " +
    answers.map(a => typeof a.value === 'string' ? a.value : "").join(" ")
  ).toLowerCase();
  
  for (const rule of rules) {
    // Check if rule is triggered
    const isTriggered = rule.triggers.some(t => patientStateText.includes(t.toLowerCase()));
    if (!isTriggered) continue;
    
    // Check blocking conditions
    const isBlocked = rule.blockingConditions.some(b => patientStateText.includes(b.toLowerCase()));
    if (isBlocked) continue;
    
    // Resolve suggested products
    const suggestedItems = rule.suggestedProducts
      .map(id => {
        const p = catalogue.find(p => p.id === id);
        if (!p) return null;
        return {
          ...p,
          why: rule.explanationTemplate,
          toVerify: rule.blockingConditions && rule.blockingConditions.length > 0 
            ? "Absence de : " + rule.blockingConditions.join(", ") 
            : null,
          ruleOutcome: rule.outcome
        };
      })
      .filter(Boolean);
      
    triggeredRules.push({
      ruleId: rule.id,
      outcome: rule.outcome,
      suggestedWording: rule.explanationTemplate,
      items: suggestedItems
    });
  }
  
  return triggeredRules;
}
