"use client";
import { useState, useRef, useEffect, useReducer } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight, ArrowLeft, AlertCircle, AlertTriangle,
  Check, CheckCircle2, ChevronDown, ChevronRight,
  ClipboardList, Edit3, FileText, HelpCircle, ImageIcon,
  Info, Loader2, Package, Phone, Plus, RotateCcw,
  ShieldCheck, ShieldAlert, Trash2, Upload, X, Zap,
  Search, Sparkles, TrendingUp,
} from "lucide-react";
import { decide, counterQuestions, nextQuestion } from "../lib/decision.mjs";
import {
  extractFromImage, validateImageFile,
  ACCEPTED_FORMATS, MAX_SIZE_LABEL,
} from "../lib/ocr-adapter.mjs";
import medicaments from "../lib/medicaments.json";

// ─── Constants ─────────────────────────────────────────────────────────────────
const STEPS = ["entry", "questions", "result", "summary"];
const STEP_LABELS = { entry: "Saisir", questions: "Questions", result: "Prochaine action", summary: "Récapitulatif" };
const COMMON_FORMS = ["Comprimé", "Gélule", "Sirop", "Suspension", "Pommade", "Crème", "Gel", "Suppositoire", "Spray", "Gouttes", "Ampoule", "Solution", "Poudre", "Patch", "Collyre"];

// ─── Shared UI atoms ────────────────────────────────────────────────────────────
function Btn({ children, secondary, danger, className = "", ...props }) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      whileHover={reduce ? {} : { y: -2 }}
      whileTap={reduce ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 25 }}
      className={`button ${danger ? "danger-btn" : secondary ? "secondary" : "primary"} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

function SectionLabel({ children }) {
  return <p className="cp-section-label">{children}</p>;
}

function InfoNote({ icon: Icon = Info, children, tone = "default" }) {
  return (
    <div className={`cp-info-note cp-info-note--${tone}`}>
      <Icon size={16} />
      <span>{children}</span>
    </div>
  );
}

function StaleBar({ onRecalc }) {
  return (
    <motion.div className="cp-stale-bar" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <AlertTriangle size={15} />
      <span>Les informations ont changé. Le résultat précédent n'est plus à jour.</span>
      <button className="cp-stale-recalc" onClick={onRecalc}>Recalculer</button>
    </motion.div>
  );
}

// ─── Feature 2: Product Autocomplete ──────────────────────────────────────────

function searchMedicaments(query) {
  if (!query || query.length < 2) return [];
  const q = query.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  return medicaments
    .filter(m => {
      const name = m.name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      const inn  = (m.inn || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return name.includes(q) || inn.includes(q);
    })
    .slice(0, 7);
}

function ProductRow({ entry, index, dispatch }) {
  const [query, setQuery] = useState(entry.name || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);
  const inputRef = useRef();
  const listRef = useRef();

  function update(field, value) {
    dispatch({ type: "UPDATE_ENTRY", id: entry.id, field, value });
  }

  function handleNameChange(val) {
    setQuery(val);
    update("name", val);
    const found = searchMedicaments(val);
    setSuggestions(found);
    setOpen(found.length > 0);
    if (val === "") setSelectedMed(null);
  }

  function selectMed(med) {
    setQuery(med.name);
    setSelectedMed(med);
    setOpen(false);
    update("name", med.name);
    // Auto-fill isMedication
    update("isMedication", med.isMedication);
    // Auto-fill first strength if only one option
    if (med.strengths?.length === 1) update("strength", med.strengths[0]);
    else update("strength", "");
    // Auto-fill first form if only one option
    if (med.forms?.length === 1) update("form", med.forms[0]);
    else update("form", "");
    // Focus strength field next
    setTimeout(() => inputRef.current?.nextElementSibling?.querySelector("select,input")?.focus(), 50);
  }

  // Close on outside click
  useEffect(() => {
    function handleClick(e) {
      if (!listRef.current?.contains(e.target) && e.target !== inputRef.current) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const strengths = selectedMed?.strengths || [];
  const forms = selectedMed?.forms || COMMON_FORMS;

  return (
    <div className={`cp-product-row ${entry.unknown ? "is-unknown" : ""}`}>
      <span className="cp-row-index">P{index + 1}</span>
      <div className="cp-row-fields">
        {/* Name with autocomplete */}
        <div className="cp-autocomplete-wrap" ref={listRef}>
          <div className="cp-autocomplete-input-row">
            <Search size={14} className="cp-search-icon" />
            <input
              ref={inputRef}
              className="cp-input cp-input--ac"
              placeholder="Nom du produit ou DCI…"
              value={query}
              onChange={e => handleNameChange(e.target.value)}
              onFocus={() => { if (suggestions.length > 0) setOpen(true); }}
              aria-label={`Produit ${index + 1} — nom`}
              aria-autocomplete="list"
              aria-expanded={open}
              disabled={entry.unknown}
              autoComplete="off"
            />
            {query && !entry.unknown && (
              <button className="cp-ac-clear" onClick={() => handleNameChange("")} aria-label="Effacer">
                <X size={13} />
              </button>
            )}
          </div>
          <AnimatePresence>
            {open && suggestions.length > 0 && (
              <motion.ul
                className="cp-ac-list"
                role="listbox"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.12 }}
              >
                {suggestions.map(med => (
                  <li
                    key={med.id}
                    role="option"
                    className="cp-ac-item"
                    onMouseDown={() => selectMed(med)}
                  >
                    <div className="cp-ac-name">{med.name}</div>
                    <div className="cp-ac-meta">
                      {med.inn !== "—" && <span className="cp-ac-inn">{med.inn}</span>}
                      <span className={`cp-ac-cat ${med.isMedication ? "is-rx" : "is-otc"}`}>
                        {med.isMedication ? "Médicament" : "Parapharmacie"} · {med.category}
                      </span>
                    </div>
                  </li>
                ))}
                <li className="cp-ac-hint">
                  <Info size={11} /> Non trouvé ? Saisissez librement et marquez « Inconnu ».
                </li>
              </motion.ul>
            )}
          </AnimatePresence>
        </div>

        {/* Strength — dropdown if known, free text if not */}
        {strengths.length > 1 ? (
          <select
            className="cp-input cp-input--small cp-select"
            value={entry.strength}
            onChange={e => update("strength", e.target.value)}
            aria-label={`Produit ${index + 1} — dosage`}
            disabled={entry.unknown}
          >
            <option value="">Dosage…</option>
            {strengths.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        ) : (
          <input
            className="cp-input cp-input--small"
            placeholder="Dosage (ex. 500 mg)"
            value={entry.strength}
            onChange={e => update("strength", e.target.value)}
            aria-label={`Produit ${index + 1} — dosage`}
            disabled={entry.unknown}
            list={`strengths-${entry.id}`}
          />
        )}

        {/* Form — always a dropdown from known list or COMMON_FORMS */}
        <select
          className="cp-input cp-input--small cp-select"
          value={entry.form}
          onChange={e => update("form", e.target.value)}
          aria-label={`Produit ${index + 1} — forme`}
          disabled={entry.unknown}
        >
          <option value="">Forme…</option>
          {forms.map(f => <option key={f} value={f}>{f}</option>)}
        </select>

        <div className="cp-row-flags">
          <label className="cp-flag-label">
            <input
              type="checkbox"
              checked={entry.isMedication}
              onChange={e => update("isMedication", e.target.checked)}
              aria-label="Médicament"
            />
            Médicament
          </label>
          <label className="cp-flag-label">
            <input
              type="checkbox"
              checked={entry.unknown}
              onChange={e => update("unknown", e.target.checked)}
              aria-label="Inconnu"
            />
            Inconnu
          </label>
        </div>
      </div>
      <button
        className="cp-remove-btn"
        onClick={() => dispatch({ type: "REMOVE_ENTRY", id: entry.id })}
        aria-label={`Supprimer produit ${index + 1}`}
      >
        <Trash2 size={15} />
      </button>
    </div>
  );
}

// ─── Products form ─────────────────────────────────────────────────────────────
function ProductsForm({ session, dispatch }) {
  const entries = session.entries || [];

  function addRow() {
    dispatch({
      type: "ADD_ENTRY",
      entry: { id: crypto.randomUUID(), name: "", strength: "", form: "", isMedication: false, unknown: false },
    });
  }

  return (
    <div className="cp-panel">
      <SectionLabel>Produits mentionnés</SectionLabel>
      {entries.length === 0 && (
        <p className="cp-empty-entries">Aucun produit saisi. Utilisez « Ajouter » pour commencer.</p>
      )}
      {entries.map((entry, i) => (
        <ProductRow key={entry.id} entry={entry} index={i} dispatch={dispatch} />
      ))}
      <button className="cp-add-row" onClick={addRow}>
        <Plus size={15} /> Ajouter un produit
      </button>
      <InfoNote icon={AlertCircle} tone="caution">
        Ne devinez pas le nom d'un produit inconnu. Marquez-le comme « inconnu » plutôt que d'inventer un nom similaire.
      </InfoNote>
    </div>
  );
}

// ─── Need form ─────────────────────────────────────────────────────────────────
function NeedForm({ session, dispatch }) {
  const [text, setText] = useState(session.expressedNeed || "");
  return (
    <div className="cp-panel">
      <SectionLabel>Besoin exprimé par la personne</SectionLabel>
      <textarea
        className="cp-textarea"
        rows={4}
        placeholder="Ex. : « J'ai les lèvres très sèches à cause du froid. »"
        value={text}
        maxLength={500}
        onChange={e => { setText(e.target.value); dispatch({ type: "SET_NEED", value: e.target.value }); }}
        aria-label="Besoin exprimé par la personne"
      />
      <p className="cp-char-count">{text.length}/500</p>
      <InfoNote icon={ShieldCheck}>
        Ne notez pas d'information médicale sensible ici. En cas de question sur un traitement, orientez directement vers le pharmacien.
      </InfoNote>
    </div>
  );
}

// ─── Image import + OCR ────────────────────────────────────────────────────────
function ImageImport({ session, dispatch }) {
  const [dragging, setDragging] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMsg, setStatusMsg] = useState("");
  const [error, setError] = useState(null);
  const fileRef = useRef();
  const previewUrl = session.imagePreviewUrl;

  function handleFile(file) {
    if (!file) return;
    const check = validateImageFile(file);
    if (!check.valid) { setError(check.error); return; }
    setError(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(file);
    dispatch({ type: "SET_IMAGE", file, url });
    runOcr(file);
  }

  async function runOcr(file) {
    setProcessing(true);
    setProgress(0);
    setStatusMsg("Chargement de Tesseract.js…");
    try {
      const result = await extractFromImage(file, p => {
        setProgress(p);
        if (p < 0.08) setStatusMsg("Chargement du moteur OCR…");
        else if (p < 0.12) setStatusMsg("Chargement des langues (français + arabe)…");
        else setStatusMsg(`Analyse en cours… ${Math.round(p * 100)}%`);
      });
      dispatch({ type: "SET_OCR_RESULT", result });
    } catch {
      setError("Une erreur inattendue s'est produite. Utilisez la saisie manuelle.");
    } finally {
      setProcessing(false);
      setStatusMsg("");
    }
  }

  function removeImage() {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    dispatch({ type: "CLEAR_IMAGE" });
    setError(null); setProcessing(false); setProgress(0); setStatusMsg("");
  }

  return (
    <div className="cp-panel">
      <SectionLabel>Scanner une ordonnance</SectionLabel>
      <InfoNote icon={ShieldCheck}>
        L'analyse se fait entièrement sur votre appareil (Tesseract.js). Aucune image n'est envoyée à un serveur. Vérifiez et corrigez chaque champ extrait avant de continuer.
      </InfoNote>

      {!previewUrl ? (
        <div
          className={`cp-drop-zone ${dragging ? "is-dragging" : ""}`}
          onDragOver={e => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]); }}
          onClick={() => fileRef.current?.click()}
          role="button" tabIndex={0} aria-label="Zone de dépôt d'image"
          onKeyDown={e => { if (e.key === "Enter" || e.key === " ") fileRef.current?.click(); }}
        >
          <Upload size={28} />
          <p>Glissez une image ici ou <strong>sélectionnez un fichier</strong></p>
          <span className="cp-drop-formats">JPEG · PNG · WebP · HEIC — {MAX_SIZE_LABEL}</span>
          <input ref={fileRef} type="file" accept={ACCEPTED_FORMATS} capture="environment"
            className="sr-only" onChange={e => handleFile(e.target.files[0])} aria-label="Choisir un fichier image" />
        </div>
      ) : (
        <div className="cp-image-preview">
          <img src={previewUrl} alt="Aperçu de l'ordonnance importée" />
          <div className="cp-image-actions">
            <button className="button secondary" onClick={() => fileRef.current?.click()}>
              <Edit3 size={14} /> Remplacer
            </button>
            <button className="button danger-btn" onClick={removeImage}>
              <Trash2 size={14} /> Supprimer
            </button>
            <input ref={fileRef} type="file" accept={ACCEPTED_FORMATS} capture="environment"
              className="sr-only" onChange={e => handleFile(e.target.files[0])} />
          </div>
        </div>
      )}

      {processing && (
        <div className="cp-ocr-progress" role="status" aria-live="polite">
          <Loader2 size={16} className="spin" />
          <span>{statusMsg}</span>
          <div className="cp-progress-bar">
            <div className="cp-progress-fill" style={{ width: `${progress * 100}%` }} />
          </div>
        </div>
      )}

      {error && (
        <div className="cp-ocr-error" role="alert">
          <AlertCircle size={15} /><span>{error}</span>
        </div>
      )}

      {session.ocrResult && !processing && (
        <OcrConfirm result={session.ocrResult} dispatch={dispatch} />
      )}

      <div className="cp-ocr-fallback-note">
        <Info size={13} />
        La saisie manuelle reste disponible à tout moment via l'onglet « Saisir les produits ».
      </div>
    </div>
  );
}

function OcrConfirm({ result, dispatch }) {
  const [fields, setFields] = useState(result.fields.map(f => ({ ...f })));
  const [confirmed, setConfirmed] = useState(false);

  function updateField(id, value) {
    setFields(prev => prev.map(f => f.id === id ? { ...f, value, uncertain: false } : f));
    setConfirmed(false);
  }

  function confirm() {
    dispatch({ type: "CONFIRM_OCR_FIELDS", fields });
    setConfirmed(true);
  }

  return (
    <div className="cp-ocr-confirm">
      <div className={`cp-ocr-disclaimer ${result.mode === "demo" ? "is-demo" : ""}`} role="alert">
        <ShieldAlert size={15} />
        <span>{result.disclaimer}</span>
      </div>
      {result.mode === "demo" && (
        <div className="cp-demo-badge">MODE DÉMO — données entièrement fictives</div>
      )}
      {result.mode === "live" && (
        <div className="cp-live-badge">
          <Check size={12} /> OCR actif — analyse réelle (Tesseract.js, local)
        </div>
      )}

      {fields.length === 0 ? (
        <InfoNote icon={AlertCircle} tone="caution">
          Aucun texte exploitable détecté. Vérifiez la qualité et la lisibilité du document, ou utilisez la saisie manuelle.
        </InfoNote>
      ) : (
        <>
          <SectionLabel>Vérifier et corriger les champs extraits</SectionLabel>
          {fields.map(field => (
            <div key={field.id} className={`cp-ocr-field ${field.uncertain ? "is-uncertain" : ""}`}>
              <label className="cp-ocr-label">
                {field.label}
                {field.uncertain && <span className="cp-uncertain-badge">À vérifier</span>}
                {field.isDemo && <span className="cp-demo-field-badge">FICTIF</span>}
              </label>
              <input
                className="cp-input"
                value={field.value}
                onChange={e => updateField(field.id, e.target.value)}
                aria-label={`${field.label} — à corriger si nécessaire`}
              />
            </div>
          ))}
          {confirmed ? (
            <div className="cp-ocr-confirmed">
              <Check size={15} /> Champs confirmés. Poursuivez avec les questions.
            </div>
          ) : (
            <Btn onClick={confirm}><Check size={16} /> Confirmer les informations</Btn>
          )}
        </>
      )}
    </div>
  );
}

// ─── Entry step ─────────────────────────────────────────────────────────────────
function EntryStep({ session, dispatch }) {
  const [mode, setMode] = useState(session.entryMode || "need");

  function selectMode(m) {
    setMode(m);
    dispatch({ type: "SET_ENTRY_MODE", mode: m });
  }

  return (
    <div className="cp-entry">
      <div className="cp-entry-tabs" role="tablist" aria-label="Mode de saisie">
        {[
          ["need",     ClipboardList, "Décrire le besoin"],
          ["products", Package,       "Saisir les produits"],
          ["image",    ImageIcon,     "Scanner une ordonnance"],
        ].map(([id, Icon, label]) => (
          <button key={id} role="tab" aria-selected={mode === id}
            className={`cp-tab ${mode === id ? "active" : ""}`} onClick={() => selectMode(id)}>
            <Icon size={17} />{label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div key={mode} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.14 }}>
          {mode === "need"     && <NeedForm     session={session} dispatch={dispatch} />}
          {mode === "products" && <ProductsForm session={session} dispatch={dispatch} />}
          {mode === "image"    && <ImageImport  session={session} dispatch={dispatch} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Feature 3: Questions with chips ──────────────────────────────────────────

function QuestionChips({ question, onSubmit }) {
  const [custom, setCustom] = useState("");
  const [showCustom, setShowCustom] = useState(false);

  return (
    <div className="cp-chips-wrap">
      <p className="cp-chips-label">Choisissez une réponse rapide :</p>
      <div className="cp-chips">
        {question.quickAnswers.map(ans => (
          <motion.button
            key={ans}
            className="cp-chip"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSubmit(ans)}
          >
            {ans}
          </motion.button>
        ))}
        {question.allowUnknown && (
          <motion.button
            className="cp-chip cp-chip--unknown"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => onSubmit(null)}
          >
            Je ne sais pas
          </motion.button>
        )}
      </div>

      {/* Optional free-text for custom answer */}
      <button className="cp-chips-custom-toggle" onClick={() => setShowCustom(v => !v)}>
        <Edit3 size={13} /> Autre réponse…
        <ChevronDown size={13} style={{ transform: showCustom ? "rotate(180deg)" : "none", transition: "transform .2s" }} />
      </button>
      <AnimatePresence>
        {showCustom && (
          <motion.div className="cp-chips-custom-body"
            initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}>
            <textarea
              className="cp-textarea cp-textarea--sm"
              rows={2}
              placeholder="Réponse personnalisée…"
              value={custom}
              maxLength={300}
              onChange={e => setCustom(e.target.value)}
              aria-label={`Réponse personnalisée à : ${question.text}`}
            />
            <Btn
              onClick={() => { if (custom.trim()) { onSubmit(custom.trim()); setCustom(""); setShowCustom(false); } }}
              disabled={!custom.trim()}
            >
              Enregistrer cette réponse
            </Btn>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuestionsStep({ session, dispatch }) {
  const answers = session.answers || [];
  const [expandedWhy, setExpandedWhy] = useState(null);
  const currentQ = nextQuestion(answers);
  const allAnswered = counterQuestions.every(q => answers.some(a => a.questionId === q.id)) || !currentQ;

  function submitAnswer(qId, value) {
    dispatch({ type: "ANSWER_QUESTION", questionId: qId, value });
  }

  function editAnswer(qId) {
    dispatch({ type: "REMOVE_ANSWER", questionId: qId });
  }

  return (
    <div className="cp-questions">
      <div className="cp-questions-progress">
        {counterQuestions.map((q, i) => {
          const ans = answers.find(a => a.questionId === q.id);
          const isCurrent = currentQ?.id === q.id;
          return (
            <div key={q.id} className={`cp-q-dot ${ans ? "done" : ""} ${isCurrent ? "current" : ""}`} title={q.text}>
              <span>{ans ? <Check size={10} /> : i + 1}</span>
            </div>
          );
        })}
      </div>

      {/* Answered questions */}
      {answers.map(ans => {
        const q = counterQuestions.find(q => q.id === ans.questionId);
        if (!q) return null;
        return (
          <div key={ans.questionId} className="cp-answered-q">
            <div className="cp-answered-header">
              <CheckCircle2 size={15} />
              <span className="cp-answered-q-text">{q.text}</span>
              <button className="cp-edit-answer" onClick={() => editAnswer(ans.questionId)}
                aria-label={`Modifier la réponse à : ${q.text}`}>
                <Edit3 size={13} /> Modifier
              </button>
            </div>
            <p className="cp-answered-value">
              {ans.value ?? "Je ne sais pas / Préfère ne pas répondre"}
            </p>
          </div>
        );
      })}

      {/* Current question */}
      {currentQ && (
        <div className="cp-current-q">
          <p className="cp-current-q-label">Question suivante</p>
          <h3 className="cp-current-q-text">{currentQ.text}</h3>

          <button className="cp-why-toggle"
            onClick={() => setExpandedWhy(prev => prev === currentQ.id ? null : currentQ.id)}
            aria-expanded={expandedWhy === currentQ.id}>
            <HelpCircle size={14} />
            Pourquoi cette question ?
            <ChevronDown size={14} style={{ transform: expandedWhy === currentQ.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }} />
          </button>
          <AnimatePresence>
            {expandedWhy === currentQ.id && (
              <motion.div className="cp-why-body"
                initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.18 }}>
                {currentQ.whyUseful}
              </motion.div>
            )}
          </AnimatePresence>

          <QuestionChips
            question={currentQ}
            onSubmit={value => submitAnswer(currentQ.id, value)}
          />
        </div>
      )}

      {allAnswered && (
        <InfoNote icon={CheckCircle2} tone="success">
          Toutes les questions ont été posées. Vous pouvez maintenant calculer la prochaine action.
        </InfoNote>
      )}
    </div>
  );
}

// ─── Result step ───────────────────────────────────────────────────────────────
function ActionIcon({ action }) {
  const icons = {
    question: <HelpCircle size={22} />,
    option: <Package size={22} />,
    pharmacist: <ShieldAlert size={22} />,
    no_action: <CheckCircle2 size={22} />,
  };
  return <span className={`cp-action-icon cp-action-icon--${action}`}>{icons[action]}</span>;
}

function actionLabel(action) {
  return {
    question: "Poser une question supplémentaire",
    option: "Expliquer une option complémentaire",
    pharmacist: "Orienter vers le pharmacien",
    no_action: "Aucun produit complémentaire indiqué",
  }[action] || "Action inconnue";
}

function ResultStep({ session, dispatch, onGoLesson }) {
  const result = session.result;

  if (!result || result.stale) {
    return (
      <div className="cp-result-empty">
        <Zap size={32} />
        <h3>Calculer la prochaine action</h3>
        <p>{result?.stale
          ? "Des informations ont changé. Recalculez pour obtenir un résultat à jour."
          : "Renseignez le besoin et répondez aux questions, puis cliquez ici."}</p>
        <Btn onClick={() => dispatch({ type: "CALCULATE", session })}>
          Calculer la prochaine action <ArrowRight size={16} />
        </Btn>
      </div>
    );
  }

  const { action, reason, suggestedWording, catalogueItems, unknowns } = result;

  return (
    <div className="cp-result">
      <AnimatePresence>
        {result.stale && <StaleBar onRecalc={() => dispatch({ type: "CALCULATE", session })} />}
      </AnimatePresence>

      {/* Summary of what was entered */}
      <div className="cp-result-section">
        <SectionLabel>Ce qui a été renseigné</SectionLabel>
        {session.expressedNeed && (
          <div className="cp-result-item">
            <span className="cp-result-key">Besoin</span>
            <span className="cp-result-value">« {session.expressedNeed} »</span>
          </div>
        )}
        {session.entries?.length > 0 && (
          <div className="cp-result-item">
            <span className="cp-result-key">Produits</span>
            <ul className="cp-result-list">
              {session.entries.map(e => (
                <li key={e.id}>
                  {e.unknown ? <span className="cp-unknown-tag">Inconnu</span> : (
                    <>{e.name}{e.strength && ` ${e.strength}`}{e.form && ` · ${e.form}`}
                      {e.isMedication && <span className="cp-med-tag"> · médicament</span>}</>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}
        {session.answers?.length > 0 && (
          <div className="cp-result-item">
            <span className="cp-result-key">Réponses</span>
            <ul className="cp-result-list">
              {session.answers.map(a => {
                const q = counterQuestions.find(q => q.id === a.questionId);
                return <li key={a.questionId}><em>{q?.text}</em> : {a.value ?? "Non communiqué"}</li>;
              })}
            </ul>
          </div>
        )}
      </div>

      {unknowns.length > 0 && (
        <div className="cp-result-section cp-result-section--warning">
          <SectionLabel>Informations incomplètes</SectionLabel>
          <ul className="cp-result-list">
            {unknowns.map((u, i) => <li key={i}><AlertTriangle size={13} /> {u}</li>)}
          </ul>
        </div>
      )}

      {/* Action card */}
      <div className={`cp-action-card cp-action--${action}`}>
        <div className="cp-action-header">
          <ActionIcon action={action} />
          <div>
            <p className="cp-action-label">{actionLabel(action)}</p>
            <p className="cp-action-reason">{reason}</p>
          </div>
        </div>

        <div className="cp-wording">
          <p className="cp-wording-label">Formulation suggérée</p>
          <blockquote className="cp-wording-text">« {suggestedWording} »</blockquote>
        </div>

        {catalogueItems?.length > 0 && (
          <div className="cp-catalogue-items">
            {catalogueItems.map(item => (
              <div key={item.id} className="cp-catalogue-card">
                <div className="cp-catalogue-header">
                  <strong>{item.name}</strong>
                  <span className="cp-catalogue-category">{item.category}</span>
                </div>
                <p className="cp-catalogue-source"><ShieldCheck size={12} /> {item.reviewStatus}</p>
                {item.notFor?.length > 0 && (
                  <p className="cp-catalogue-not"><AlertCircle size={12} /> Non indiqué si : {item.notFor.join(", ")}</p>
                )}
              </div>
            ))}
          </div>
        )}

        {action === "pharmacist" && (
          <div className="cp-pharmacist-note">
            <Phone size={15} />
            <span>Résumez brièvement la situation au pharmacien pour faciliter la transmission.</span>
          </div>
        )}
      </div>

      {action !== "no_action" && (
        <button className="cp-learn-link" onClick={onGoLesson} aria-label="Ouvrir la leçon liée">
          <FileText size={14} /> Voir la leçon liée à cette situation
        </button>
      )}
    </div>
  );
}

// ─── Feature 4: Upsell in Summary ─────────────────────────────────────────────
function UpsellCard({ item }) {
  return (
    <motion.div
      className="cp-upsell-card"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 180, damping: 20 }}
    >
      <div className="cp-upsell-header">
        <TrendingUp size={16} />
        <strong>{item.name}</strong>
        <span className="cp-catalogue-category">{item.category}</span>
      </div>
      <blockquote className="cp-upsell-wording">« {item.suggestedWording} »</blockquote>
      {item.notFor?.length > 0 && (
        <p className="cp-upsell-not">
          <AlertCircle size={12} /> Non indiqué si : {item.notFor.join(", ")}
        </p>
      )}
      <p className="cp-upsell-source"><ShieldCheck size={11} /> {item.reviewStatus}</p>
    </motion.div>
  );
}

function SummaryStep({ session, dispatch }) {
  const result = session.result;
  const hasUpsell = result && !result.stale && result.catalogueItems?.length > 0;
  const isPharmacist = result?.action === "pharmacist";

  return (
    <div className="cp-summary">
      <div className="cp-summary-header">
        <CheckCircle2 size={36} />
        <h3>Récapitulatif de l'échange</h3>
      </div>

      <div className="cp-summary-block">
        <SectionLabel>Besoin traité</SectionLabel>
        <p>{session.expressedNeed || "Non renseigné"}</p>
      </div>

      {session.entries?.length > 0 && (
        <div className="cp-summary-block">
          <SectionLabel>Produits mentionnés</SectionLabel>
          <ul className="cp-summary-products">
            {session.entries.map(e => (
              <li key={e.id} className={e.isMedication ? "is-rx" : ""}>
                {e.unknown ? "Inconnu" : `${e.name}${e.strength ? ` ${e.strength}` : ""}${e.form ? ` · ${e.form}` : ""}`}
                {e.isMedication && <span className="cp-med-tag"> · médicament</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {session.answers?.length > 0 && (
        <div className="cp-summary-block">
          <SectionLabel>Informations collectées</SectionLabel>
          <ul className="cp-summary-answers">
            {session.answers.map(a => {
              const q = counterQuestions.find(q => q.id === a.questionId);
              return (
                <li key={a.questionId}>
                  <span className="cp-summary-q">{q?.text}</span>
                  <span className="cp-summary-a">{a.value ?? "Non communiqué"}</span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {result && !result.stale && (
        <div className="cp-summary-block">
          <SectionLabel>Action recommandée</SectionLabel>
          <p><strong>{actionLabel(result.action)}</strong></p>
          <p className="cp-summary-wording">« {result.suggestedWording} »</p>
        </div>
      )}

      {/* ── Feature 4: Upsell propositions ── */}
      {hasUpsell && (
        <div className="cp-upsell-section">
          <div className="cp-upsell-title">
            <TrendingUp size={18} />
            <div>
              <h4>Produits à proposer</h4>
              <p>Ces produits correspondent au besoin exprimé et peuvent être présentés au client.</p>
            </div>
          </div>
          {result.catalogueItems.map(item => <UpsellCard key={item.id} item={item} />)}
        </div>
      )}

      {isPharmacist && (
        <div className="cp-summary-block">
          <InfoNote icon={ShieldAlert} tone="caution">
            Ce dossier doit être transmis au pharmacien. Résumez brièvement la situation avant de le passer.
          </InfoNote>
        </div>
      )}

      {!hasUpsell && !isPharmacist && result && result.action === "no_action" && (
        <div className="cp-summary-block">
          <InfoNote icon={CheckCircle2} tone="success">
            Aucun produit complémentaire indiqué dans cette situation. L'échange est complet.
          </InfoNote>
        </div>
      )}

      <InfoNote icon={ShieldCheck}>
        Cet échange est conservé uniquement en mémoire pendant votre session.
        Il sera effacé dès que vous cliquerez sur « Nouvel échange » ou rechargez la page.
      </InfoNote>

      <div className="cp-summary-actions">
        <Btn onClick={() => dispatch({ type: "RESET_SESSION" })} className="cp-new-exchange">
          <RotateCcw size={16} /> Nouvel échange
        </Btn>
        <p className="cp-reload-note">Un rechargement de page effacera également le brouillon en cours.</p>
      </div>
    </div>
  );
}

// ─── Session reducer ────────────────────────────────────────────────────────────
function sessionReducer(state, action) {
  switch (action.type) {
    case "SET_ENTRY_MODE": return { ...state, entryMode: action.mode };
    case "SET_NEED": {
      const next = { ...state, expressedNeed: action.value };
      if (state.result) next.result = { ...state.result, stale: true };
      return next;
    }
    case "ADD_ENTRY": return { ...state, entries: [...(state.entries || []), action.entry] };
    case "REMOVE_ENTRY": {
      const next = { ...state, entries: (state.entries || []).filter(e => e.id !== action.id) };
      if (state.result) next.result = { ...state.result, stale: true };
      return next;
    }
    case "UPDATE_ENTRY": {
      const next = {
        ...state,
        entries: (state.entries || []).map(e => e.id === action.id ? { ...e, [action.field]: action.value } : e),
      };
      if (state.result) next.result = { ...state.result, stale: true };
      return next;
    }
    case "SET_IMAGE":
      return { ...state, imageFile: action.file, imagePreviewUrl: action.url, ocrResult: null, ocrConfirmed: false };
    case "CLEAR_IMAGE":
      return { ...state, imageFile: null, imagePreviewUrl: null, ocrResult: null, ocrConfirmed: false };
    case "SET_OCR_RESULT": return { ...state, ocrResult: action.result };
    case "CONFIRM_OCR_FIELDS": {
      const newEntries = action.fields
        .filter(f => f.id.startsWith("product") || f.id.startsWith("line"))
        .map(f => ({ id: crypto.randomUUID(), name: f.value, strength: "", form: "", isMedication: false, unknown: f.uncertain }));
      return { ...state, entries: [...(state.entries || []), ...newEntries], ocrConfirmed: true };
    }
    case "ANSWER_QUESTION": {
      const filtered = (state.answers || []).filter(a => a.questionId !== action.questionId);
      const next = { ...state, answers: [...filtered, { questionId: action.questionId, value: action.value }] };
      if (state.result) next.result = { ...state.result, stale: true };
      return next;
    }
    case "REMOVE_ANSWER": {
      const next = { ...state, answers: (state.answers || []).filter(a => a.questionId !== action.questionId) };
      if (state.result) next.result = { ...state.result, stale: true };
      return next;
    }
    case "CALCULATE": {
      const result = decide({
        expressedNeed: state.expressedNeed || "",
        entries: state.entries || [],
        answers: state.answers || [],
      });
      return { ...state, result };
    }
    case "RESET_SESSION": return initialSession();
    default: return state;
  }
}

function initialSession() {
  return { entryMode: "need", expressedNeed: "", entries: [], answers: [],
    imageFile: null, imagePreviewUrl: null, ocrResult: null, ocrConfirmed: false, result: null };
}

// ─── Main AuComptoir ────────────────────────────────────────────────────────────
export default function AuComptoir({ onGoLesson }) {
  const [session, dispatch] = useReducer(sessionReducer, null, initialSession);
  const [step, setStep] = useState("entry");
  const reduce = useReducedMotion();

  useEffect(() => {
    function beforeUnload(e) {
      const hasData = session.expressedNeed || session.entries?.length || session.answers?.length;
      if (hasData) { e.preventDefault(); e.returnValue = ""; }
    }
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [session]);

  const stepIndex = STEPS.indexOf(step);

  function goStep(target) {
    setStep(target);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function wrappedDispatch(action) {
    if (action.type === "RESET_SESSION") { dispatch(action); goStep("entry"); }
    else dispatch(action);
  }

  const hasNeed = !!(session.expressedNeed?.trim() || session.entries?.length || session.ocrConfirmed);

  return (
    <div className="cp-shell">
      {/* Stepper */}
      <div className="cp-stepper" role="list" aria-label="Étapes de l'échange">
        {STEPS.map((s, i) => (
          <div key={s} role="listitem" className={`cp-step ${i < stepIndex ? "done" : ""} ${i === stepIndex ? "current" : ""}`}>
            <span className="cp-step-num">{i < stepIndex ? <Check size={13} /> : i + 1}</span>
            <span className="cp-step-label">{STEP_LABELS[s]}</span>
            {i < STEPS.length - 1 && <span className="cp-step-line" />}
          </div>
        ))}
      </div>

      {(session.expressedNeed || session.entries?.length > 0) && (
        <div className="cp-draft-notice">
          <AlertCircle size={13} />
          Brouillon en mémoire — non enregistré. Un rechargement effacera cet échange.
        </div>
      )}

      <AnimatePresence mode="wait">
        <motion.div key={step} initial={reduce ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}
          transition={{ duration: 0.15 }} className="cp-step-content">
          {step === "entry"     && <EntryStep     session={session} dispatch={wrappedDispatch} />}
          {step === "questions" && <QuestionsStep session={session} dispatch={wrappedDispatch} />}
          {step === "result"    && <ResultStep    session={session} dispatch={wrappedDispatch} onGoLesson={onGoLesson} />}
          {step === "summary"   && <SummaryStep   session={session} dispatch={wrappedDispatch} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation bar */}
      <div className="cp-nav-bar">
        {stepIndex > 0 && (
          <button className="button secondary" onClick={() => goStep(STEPS[stepIndex - 1])}>
            <ArrowLeft size={15} /> Retour
          </button>
        )}
        <div style={{ flex: 1 }} />
        {step === "entry" && hasNeed && (
          <Btn onClick={() => goStep("questions")}>Questions <ArrowRight size={15} /></Btn>
        )}
        {step === "questions" && (
          <Btn onClick={() => { dispatch({ type: "CALCULATE", session }); goStep("result"); }}>
            Calculer la prochaine action <ArrowRight size={15} />
          </Btn>
        )}
        {step === "result" && session.result && !session.result.stale && (
          <Btn onClick={() => goStep("summary")}>Récapitulatif <ArrowRight size={15} /></Btn>
        )}
        {step === "result" && session.result?.stale && (
          <Btn onClick={() => dispatch({ type: "CALCULATE", session })}>Recalculer <ArrowRight size={15} /></Btn>
        )}
      </div>
    </div>
  );
}
