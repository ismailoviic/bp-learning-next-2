/**
 * Phase 2 — OCR Adapter.
 *
 * Modes:
 *   "live"     — Tesseract.js, French + Arabic, real extraction
 *   "demo"     — fictional fixture, used as fallback only
 *   "disabled" — OCR not available
 *
 * IMPORTANT:
 *   - All extracted fields start as uncertain=true and must be confirmed by the employee.
 *   - Results are NEVER presented as clinically validated.
 *   - Images are consumed as blob URLs and never stored on any server.
 *   - Confirmation of extracted text does NOT constitute prescription validation.
 */

import scenarios from "./demo-scenarios.json";

// ─── Demo fixture (fallback only) ─────────────────────────────────────────────
const DEMO_FIXTURE = scenarios.fixtures.find(f => f.id === "scenario_1") || { fields: [] };

// ─── Adapter ──────────────────────────────────────────────────────────────────

export async function extractFromImage(file, onProgress, abortSignal) {
  if (!file) {
    await simulateDelay(onProgress);
    return { mode: "demo", fields: DEMO_FIXTURE.fields, disclaimer: DEMO_FIXTURE.disclaimer, errorMessage: null };
  }

  try {
    return await runTesseract(file, onProgress, abortSignal);
  } catch (err) {
    if (err.name === 'AbortError' || err.message === 'Canceled') {
      throw err; // bubble up cancellation
    }
    console.warn("[ocr-adapter] Tesseract failed, falling back to demo:", err);
    return {
      mode: "demo",
      fields: DEMO_FIXTURE.fields,
      disclaimer: `⚠ L'analyse automatique a échoué (${err?.message || "erreur inconnue"}). Voici un exemple fictif pour démonstration. La saisie manuelle reste disponible.`,
      errorMessage: String(err?.message || err),
    };
  }
}

// ─── Tesseract.js live ────────────────────────────────────────────────────────

async function runTesseract(file, onProgress, abortSignal) {
  const Tesseract = await import("tesseract.js");

  onProgress?.(0.05);

  const logger = (m) => {
    if (abortSignal?.aborted) throw new Error("Canceled");
    if (m.status === "recognizing text") {
      onProgress?.(0.1 + m.progress * 0.85);
    } else if (m.status === "loading tesseract core" || m.status === "initializing tesseract") {
      onProgress?.(0.02);
    } else if (m.status === "loading language traineddata") {
      onProgress?.(0.06);
    } else if (m.status === "initializing api") {
      onProgress?.(0.08);
    }
  };

  if (abortSignal?.aborted) throw new Error("Canceled");

  // Implement a 30s timeout on extraction
  const timeoutPromise = new Promise((_, reject) =>
    setTimeout(() => reject(new Error("Timeout d'analyse OCR dépassé (30s).")), 30000)
  );
  
  const recognizePromise = Tesseract.recognize(file, "fra+ara", { logger });

  // Race between timeout, abort, and actual completion
  let result;
  if (abortSignal) {
    const abortPromise = new Promise((_, reject) => {
      abortSignal.addEventListener('abort', () => reject(new Error("Canceled")));
    });
    result = await Promise.race([recognizePromise, timeoutPromise, abortPromise]);
  } else {
    result = await Promise.race([recognizePromise, timeoutPromise]);
  }
  
  onProgress?.(1);

  const rawText = result?.data?.text || "";

  if (!rawText.trim()) {
    return {
      mode: "live",
      fields: [],
      disclaimer: "Aucun texte détecté dans l'image. Vérifiez la qualité et la lisibilité du document, ou utilisez la saisie manuelle. La reconnaissance de texte n'est pas une validation d'ordonnance.",
      errorMessage: null,
    };
  }

  const lines = rawText.split("\n").map((l) => l.trim()).filter((l) => l.length > 1);
  const fields = parseLines(lines);

  return {
    mode: "live",
    fields,
    disclaimer: "Texte extrait automatiquement par Tesseract.js (OCR local, aucun serveur). Vérifiez et corrigez chaque champ avant de continuer. Cette reconnaissance ne constitue pas une validation d'ordonnance et ne garantit pas l'exactitude des informations.",
    errorMessage: null,
  };
}

/**
 * Heuristic parser: strictly extracts medication entries.
 * Discards Date, Doctor, Patient, address info.
 */
function parseLines(lines) {
  const fields = [];
  const dateRx = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/;
  const dosageRx = /\b(\d+[\.,]?\d*)\s*(mg|g|ml|µg|mcg|ui|cp|comp|gél|gel|amp)\b/i;
  
  // Exclude lines that look like headers/footers
  const excludeRx = /^(dr\.?|docteur|med\.?|pr\.?|prof\.?|patient|pour|nom\s*:|adresse|tél|tel|signature)/i;

  let prodCount = 0;

  lines.forEach((line) => {
    // Drop the line entirely if it matches exclude patterns or dates
    if (excludeRx.test(line) || dateRx.test(line)) return;

    // Strict inclusion: only if it contains a dosage pattern or something that really looks like a drug form
    if (dosageRx.test(line) || /\b(comprimé|gélule|sirop|suppositoire|pommade|crème)\b/i.test(line)) {
      prodCount++;
      fields.push({
        id: `product_${prodCount}`,
        label: `Produit ${prodCount}`,
        value: line,
        uncertain: true,
        isDemo: false,
      });
    }
  });

  return fields;
}

// ─── Demo fallback delay ──────────────────────────────────────────────────────

async function simulateDelay(onProgress) {
  const steps = 6;
  for (let i = 1; i <= steps; i++) {
    await new Promise((r) => setTimeout(r, 150));
    onProgress?.(i / steps);
  }
}

// ─── File validation ──────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

export function validateImageFile(file) {
  if (!file) return { valid: false, error: "Aucun fichier sélectionné." };
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Format non supporté : ${file.type || "inconnu"}. Formats acceptés : JPEG, PNG, WebP, HEIC.`,
    };
  }
  if (file.size > MAX_SIZE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return { valid: false, error: `Fichier trop volumineux (${mb} Mo). Taille maximale : 8 Mo.` };
  }
  return { valid: true, error: null };
}

export const ACCEPTED_FORMATS = "image/jpeg, image/png, image/webp, image/heic";
export const MAX_SIZE_LABEL = "8 Mo maximum";
