/**
 * Phase 2 — OCR Adapter.
 *
 * Modes:
 *   "live"     — Tesseract.js, French + Arabic, real extraction (default now that package is installed)
 *   "demo"     — fictional fixture, used as fallback only
 *   "disabled" — OCR not available
 *
 * IMPORTANT:
 *   - All extracted fields start as uncertain=true and must be confirmed by the employee.
 *   - Results are NEVER presented as clinically validated.
 *   - Images are consumed as blob URLs and never stored on any server.
 *   - Confirmation of extracted text does NOT constitute prescription validation.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ExtractedField
 * @property {string} id
 * @property {string} label
 * @property {string} value
 * @property {boolean} uncertain
 * @property {boolean} isDemo
 */

/**
 * @typedef {Object} OcrResult
 * @property {"demo"|"live"|"error"} mode
 * @property {ExtractedField[]} fields
 * @property {string} disclaimer
 * @property {string|null} errorMessage
 */

// ─── Demo fixture (fallback only) ─────────────────────────────────────────────
const DEMO_FIXTURE = {
  disclaimer:
    "⚠ MODE DÉMO — Tesseract.js n'a pas pu s'initialiser. Ces données sont entièrement fictives. La confirmation du texte extrait ne vaut pas validation d'une ordonnance.",
  fields: [
    { id: "patient",      label: "Patient",              value: "Mme Fatima Benali (fictif)",       uncertain: false, isDemo: true },
    { id: "date",         label: "Date de l'ordonnance", value: "01/09/2026 (fictif)",              uncertain: false, isDemo: true },
    { id: "prescriber",   label: "Prescripteur",         value: "Dr. Amine Lahrichi (fictif)",      uncertain: false, isDemo: true },
    { id: "product_1",    label: "Produit 1",            value: "Produit A fictif 500 mg",          uncertain: false, isDemo: true },
    { id: "product_2",    label: "Produit 2",            value: "Produit B fictif sirop",           uncertain: true,  isDemo: true },
    { id: "instructions", label: "Instructions",         value: "[Lisibilité insuffisante]",        uncertain: true,  isDemo: true },
  ],
};

// ─── Adapter ──────────────────────────────────────────────────────────────────

/**
 * Process an image file through the OCR adapter.
 * Tries live Tesseract.js first; falls back to demo fixture on failure.
 *
 * @param {File|null} file
 * @param {(progress: number) => void} [onProgress]
 * @returns {Promise<OcrResult>}
 */
export async function extractFromImage(file, onProgress) {
  if (!file) {
    // No file → demo mode preview
    await simulateDelay(onProgress);
    return { mode: "demo", fields: DEMO_FIXTURE.fields, disclaimer: DEMO_FIXTURE.disclaimer, errorMessage: null };
  }

  try {
    return await runTesseract(file, onProgress);
  } catch (err) {
    console.warn("[ocr-adapter] Tesseract failed, falling back to demo:", err);
    // Show demo fixture with a clear error note
    return {
      mode: "demo",
      fields: DEMO_FIXTURE.fields,
      disclaimer:
        `⚠ L'analyse automatique a échoué (${err?.message || "erreur inconnue"}). Voici un exemple fictif pour démonstration. La saisie manuelle reste disponible.`,
      errorMessage: String(err?.message || err),
    };
  }
}

// ─── Tesseract.js live ────────────────────────────────────────────────────────

async function runTesseract(file, onProgress) {
  // webpackIgnore prevents Next.js from trying to bundle this at build time.
  // The package IS installed, so the dynamic import succeeds at runtime.
  const Tesseract = await import("tesseract.js");

  onProgress?.(0.05);

  const logger = (m) => {
    if (m.status === "recognizing text") {
      onProgress?.(0.1 + m.progress * 0.85); // map 0→1 to 10%→95%
    } else if (m.status === "loading tesseract core" || m.status === "initializing tesseract") {
      onProgress?.(0.02);
    } else if (m.status === "loading language traineddata") {
      onProgress?.(0.06);
    } else if (m.status === "initializing api") {
      onProgress?.(0.08);
    }
  };

  const result = await Tesseract.recognize(file, "fra+ara", { logger });
  onProgress?.(1);

  const rawText = result?.data?.text || "";

  if (!rawText.trim()) {
    return {
      mode: "live",
      fields: [],
      disclaimer:
        "Aucun texte détecté dans l'image. Vérifiez la qualité et la lisibilité du document, ou utilisez la saisie manuelle. La reconnaissance de texte n'est pas une validation d'ordonnance.",
      errorMessage: null,
    };
  }

  // Heuristic line-level parsing into labelled fields.
  // The employee must confirm or correct every field — uncertain is always true.
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 1);

  const fields = parseLines(lines);

  return {
    mode: "live",
    fields,
    disclaimer:
      "Texte extrait automatiquement par Tesseract.js (OCR local, aucun serveur). Vérifiez et corrigez chaque champ avant de continuer. Cette reconnaissance ne constitue pas une validation d'ordonnance et ne garantit pas l'exactitude des informations.",
    errorMessage: null,
  };
}

/**
 * Heuristic parser: tries to identify common Moroccan prescription fields
 * from raw OCR lines. Unmatched lines are grouped as "Ligne N".
 */
function parseLines(lines) {
  const fields = [];
  const dateRx = /\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4}/;
  const dosageRx = /\b(\d+[\.,]?\d*)\s*(mg|g|ml|µg|mcg|ui|cp|comp|gél|gel|amp)\b/i;

  let prodCount = 0;
  const usedIndices = new Set();

  // Pass 1: find date
  lines.forEach((line, i) => {
    if (usedIndices.has(i)) return;
    if (dateRx.test(line)) {
      fields.push({ id: "date", label: "Date", value: line, uncertain: true, isDemo: false });
      usedIndices.add(i);
    }
  });

  // Pass 2: find doctor line (Dr / Docteur / Médecin)
  lines.forEach((line, i) => {
    if (usedIndices.has(i)) return;
    if (/^(dr\.?|docteur|med\.?|pr\.?|prof\.?)/i.test(line)) {
      fields.push({ id: "prescriber", label: "Prescripteur", value: line, uncertain: true, isDemo: false });
      usedIndices.add(i);
    }
  });

  // Pass 3: find patient line (Patient / Pour / Nom:)
  lines.forEach((line, i) => {
    if (usedIndices.has(i)) return;
    if (/^(patient|pour|nom\s*:)/i.test(line)) {
      fields.push({ id: "patient", label: "Patient", value: line, uncertain: true, isDemo: false });
      usedIndices.add(i);
    }
  });

  // Pass 4: lines with dosage patterns → products
  lines.forEach((line, i) => {
    if (usedIndices.has(i)) return;
    if (dosageRx.test(line)) {
      prodCount++;
      fields.push({
        id: `product_${prodCount}`,
        label: `Produit ${prodCount}`,
        value: line,
        uncertain: true,
        isDemo: false,
      });
      usedIndices.add(i);
    }
  });

  // Pass 5: remaining lines
  let remIdx = 0;
  lines.forEach((line, i) => {
    if (usedIndices.has(i)) return;
    remIdx++;
    fields.push({
      id: `line_${remIdx}`,
      label: `Ligne ${remIdx}`,
      value: line,
      uncertain: true,
      isDemo: false,
    });
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

/**
 * @param {File} file
 * @returns {{ valid: boolean, error: string|null }}
 */
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
