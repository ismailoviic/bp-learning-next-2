/**
 * Phase 2 — OCR Adapter.
 *
 * Isolates all OCR logic behind a single interface.
 * The rest of the app only imports from this module.
 *
 * Modes:
 *   "demo"     — returns fictional prescription data after a delay (default)
 *   "live"     — delegates to Tesseract.js (requires NEXT_PUBLIC_OCR_ENABLED=true)
 *   "disabled" — OCR is not available; manual entry always remains available
 *
 * IMPORTANT:
 *   - Demo mode is clearly labelled in all returned data.
 *   - Live mode results are NEVER presented as clinically validated.
 *   - Confidence values are structural indicators only, not clinical certainty.
 *   - Handwritten prescription recognition is NOT claimed.
 *   - Extracted text confirmation is not prescription validation.
 *   - Image URLs are managed externally; this module does not store them.
 */

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * @typedef {Object} ExtractedField
 * @property {string} id
 * @property {string} label
 * @property {string} value
 * @property {boolean} uncertain       // true = field may be incomplete or misread
 * @property {boolean} isDemo         // true = fictional demo data, not real OCR
 */

/**
 * @typedef {Object} OcrResult
 * @property {"demo"|"live"|"error"} mode
 * @property {ExtractedField[]} fields
 * @property {string} disclaimer
 * @property {string|null} errorMessage
 */

// ─── Demo fixture ─────────────────────────────────────────────────────────────

/**
 * Fictional ordonnance example used in demo mode.
 * Patient name, doctor, date, and products are entirely invented.
 */
const DEMO_FIXTURE = {
  disclaimer:
    "⚠ DÉMONSTRATION — Ces données sont entièrement fictives. Elles ne correspondent à aucune ordonnance réelle. La confirmation du texte extrait ne vaut pas validation d'une ordonnance.",
  fields: [
    {
      id: "patient",
      label: "Patient",
      value: "Mme Fatima Benali (fictif)",
      uncertain: false,
      isDemo: true,
    },
    {
      id: "date",
      label: "Date de l'ordonnance",
      value: "01/09/2026 (fictif)",
      uncertain: false,
      isDemo: true,
    },
    {
      id: "prescriber",
      label: "Prescripteur",
      value: "Dr. Amine Lahrichi (fictif)",
      uncertain: false,
      isDemo: true,
    },
    {
      id: "product_1",
      label: "Produit 1",
      value: "Produit A fictif 500 mg — comprimé",
      uncertain: false,
      isDemo: true,
    },
    {
      id: "product_2",
      label: "Produit 2",
      value: "Produit B fictif sirop",
      uncertain: true, // intentionally marked uncertain to show the UI state
      isDemo: true,
    },
    {
      id: "instructions",
      label: "Instructions",
      value: "[Champ partiellement lisible — à corriger manuellement]",
      uncertain: true,
      isDemo: true,
    },
  ],
};

// ─── Adapter ──────────────────────────────────────────────────────────────────

/**
 * Detect current OCR mode based on environment variables.
 * @returns {"demo"|"live"|"disabled"}
 */
function detectMode() {
  if (typeof process !== "undefined") {
    if (process.env?.NEXT_PUBLIC_OCR_ENABLED === "true") return "live";
  }
  // In browser: check window env if exposed via Next.js public vars
  if (
    typeof window !== "undefined" &&
    window.__NEXT_DATA__?.props?.pageProps?.ocrEnabled
  ) {
    return "live";
  }
  return "demo";
}

/**
 * Process an image file through the OCR adapter.
 *
 * In demo mode: returns the fictional fixture after a simulated delay.
 * In live mode: loads Tesseract.js dynamically and processes the file.
 * In disabled mode: returns an error result immediately.
 *
 * @param {File|null} file - The image file to process, or null for demo.
 * @param {(progress: number) => void} [onProgress] - Progress callback (0–1).
 * @returns {Promise<OcrResult>}
 */
export async function extractFromImage(file, onProgress) {
  const mode = detectMode();

  if (mode === "disabled") {
    return {
      mode: "error",
      fields: [],
      disclaimer:
        "La reconnaissance de texte n'est pas disponible dans cette configuration. Utilisez la saisie manuelle.",
      errorMessage:
        "OCR désactivé. La saisie manuelle reste disponible en permanence.",
    };
  }

  if (mode === "demo" || !file) {
    // Simulate processing delay
    await simulateDelay(onProgress);
    return {
      mode: "demo",
      fields: DEMO_FIXTURE.fields,
      disclaimer: DEMO_FIXTURE.disclaimer,
      errorMessage: null,
    };
  }

  // Live mode — Tesseract.js
  try {
    return await runTesseract(file, onProgress);
  } catch (err) {
    return {
      mode: "error",
      fields: [],
      disclaimer:
        "La reconnaissance automatique a échoué. Vérifiez le format ou la qualité de l'image, et utilisez la saisie manuelle.",
      errorMessage: String(err?.message || err),
    };
  }
}

// ─── Demo helpers ─────────────────────────────────────────────────────────────

async function simulateDelay(onProgress) {
  const steps = 8;
  for (let i = 1; i <= steps; i++) {
    await new Promise((r) => setTimeout(r, 180));
    onProgress?.(i / steps);
  }
}

// ─── Tesseract.js (live) ──────────────────────────────────────────────────────

async function runTesseract(file, onProgress) {
  // Dynamic import behind a string variable so the static bundler
  // (webpack/turbopack) cannot trace the specifier and will not try to
  // bundle or resolve tesseract.js at build time.
  const moduleName = "tesseract.js";
  let Tesseract;
  try {
    Tesseract = await import(/* webpackIgnore: true */ moduleName);
  } catch {
    return {
      mode: "error",
      fields: [],
      disclaimer:
        "Tesseract.js n'est pas disponible dans cet environnement. Utilisez la saisie manuelle.",
      errorMessage:
        "tesseract.js not installed. Set NEXT_PUBLIC_OCR_ENABLED=false or install the package.",
    };
  }

  const logger = (m) => {
    if (m.status === "recognizing text") {
      onProgress?.(m.progress);
    }
  };

  const result = await Tesseract.recognize(file, "fra+ara", { logger });
  const rawText = result?.data?.text || "";

  if (!rawText.trim()) {
    return {
      mode: "live",
      fields: [],
      disclaimer:
        "Aucun texte détecté dans l'image. Vérifiez la qualité et la lisibilité, ou utilisez la saisie manuelle. La reconnaissance de texte n'est pas une validation d'ordonnance.",
      errorMessage: null,
    };
  }

  // Parse raw text into rough field guesses — intentionally simple.
  // The employee must confirm or correct every field before proceeding.
  const lines = rawText
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  const fields = lines.slice(0, 8).map((line, i) => ({
    id: `line_${i}`,
    label: `Ligne ${i + 1}`,
    value: line,
    uncertain: true, // All live-extracted fields start as uncertain
    isDemo: false,
  }));

  return {
    mode: "live",
    fields,
    disclaimer:
      "Texte extrait automatiquement. Vérifiez et corrigez chaque champ avant de continuer. La reconnaissance de texte n'est pas une validation d'ordonnance et ne garantit pas l'exactitude des informations.",
    errorMessage: null,
  };
}

// ─── File validation ──────────────────────────────────────────────────────────

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/heic"];
const MAX_SIZE_BYTES = 8 * 1024 * 1024; // 8 MB

/**
 * Validate an image file before processing.
 * @param {File} file
 * @returns {{ valid: boolean, error: string|null }}
 */
export function validateImageFile(file) {
  if (!file)
    return { valid: false, error: "Aucun fichier sélectionné." };
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Format non supporté : ${file.type || "inconnu"}. Formats acceptés : JPEG, PNG, WebP, HEIC.`,
    };
  }
  if (file.size > MAX_SIZE_BYTES) {
    const mb = (file.size / 1024 / 1024).toFixed(1);
    return {
      valid: false,
      error: `Fichier trop volumineux (${mb} Mo). Taille maximale : 8 Mo.`,
    };
  }
  return { valid: true, error: null };
}

export const ACCEPTED_FORMATS = "image/jpeg, image/png, image/webp, image/heic";
export const MAX_SIZE_LABEL = "8 Mo maximum";
