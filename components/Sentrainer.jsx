"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  Flag,
  MessagesSquare,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { dialogue, checks } from "../lib/content.mjs";
import { scenarios } from "../lib/scenarios.mjs";
import {
  answer as p1answer,
  complete as p1complete,
  firstScore as p1firstScore,
} from "../lib/progress.mjs";
import {
  p2answer,
  p2complete,
  scenarioProgress,
  scenarioFirstScore,
} from "../lib/p2-progress.mjs";

// ─── Shared button ────────────────────────────────────────────────────────────
function Button({ children, secondary = false, className = "", ...props }) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      whileHover={reduce ? {} : { y: -2 }}
      whileTap={reduce ? {} : { scale: 0.97 }}
      transition={{ type: "spring", stiffness: 420, damping: 25 }}
      className={`button ${secondary ? "secondary" : "primary"} ${className}`}
      {...props}
    >
      {children}
    </motion.button>
  );
}

// ─── Badge tones ──────────────────────────────────────────────────────────────
const BADGE_CLASSES = {
  green: "scenario-badge--green",
  amber: "scenario-badge--amber",
  purple: "scenario-badge--purple",
};

// ─── Scenario step exercise ───────────────────────────────────────────────────
function ScenarioExercise({
  scenario,
  p2State,
  p2Update,
  onGoLesson,
  onDone,
}) {
  // Find first incomplete step
  const stepIndex = scenario.steps.findIndex(
    (s) => !p2State.scenarioSteps[s.id]?.done,
  );
  const step = scenario.steps[stepIndex] ?? null;
  const allDone = stepIndex < 0;

  const entry = step ? p2State.scenarioSteps[step.id] : null;
  const last = entry?.attempts?.at(-1);
  const feedback = !!last && !entry?.ack;
  const selected = step?.answers.find((a) => a.id === last);
  const correct = last === step?.correct;

  const feedbackRef = useRef();
  const questionRef = useRef();

  useEffect(() => {
    if (feedback) feedbackRef.current?.focus();
    else questionRef.current?.focus();
  }, [step?.id, feedback]);

  if (allDone) {
    const score = scenarioFirstScore(p2State, scenario.id);
    const total = scenario.steps.length;
    return (
      <div className="finish-card">
        <span className="finish-icon">
          <CheckCircle2 size={42} />
        </span>
        <p className="eyebrow">SCÉNARIO TERMINÉ</p>
        <h2 ref={questionRef} tabIndex={-1}>
          Vous avez parcouru ce scénario.
        </h2>
        <p>
          {score} réponse(s) recommandée(s) au premier essai sur {total}.
          <br />
          Les corrections font partie de l'apprentissage.
        </p>
        <button
          className="lesson-sim-link"
          style={{ display: "inline-flex", margin: "24px auto 0" }}
          onClick={() => onGoLesson(scenario.relatedLesson)}
        >
          <BookOpen size={15} />
          Voir la leçon liée à ce scénario
          <ArrowRight size={15} />
        </button>
        {onDone && (
          <button
            className="text-button"
            style={{ margin: "12px auto 0", display: "block" }}
            onClick={onDone}
          >
            Retour aux scénarios
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="exercise-layout">
      {/* Context aside */}
      <aside className="context-card">
        <div className={`scenario-badge ${BADGE_CLASSES[scenario.badgeTone] || ""}`}>
          {scenario.badge}
        </div>
        <div className="customer-avatar">CF</div>
        <h2>Situation au comptoir</h2>
        <p>{scenario.context}</p>
        <div className="context-goal">
          <Flag size={18} />
          <div>
            <strong>Votre objectif</strong>
            <p>
              Choisir la réponse qui correspond le mieux à un échange respectueux
              et professionnel.
            </p>
          </div>
        </div>
        <div className="steps-mini">
          {scenario.steps.map((s, i) => (
            <div key={s.id} className={i === stepIndex ? "current" : ""}>
              <span>
                {p2State.scenarioSteps[s.id]?.done ? <Check size={12} /> : i + 1}
              </span>
              {s.title}
            </div>
          ))}
        </div>
        <span className="small">Aucun conseil clinique dans ce scénario.</span>
      </aside>

      {/* Question card */}
      <section className="question-card">
        <div className="question-top">
          <span>SCÉNARIO AU COMPTOIR</span>
          <span>
            Étape {stepIndex + 1} / {scenario.steps.length}
          </span>
        </div>
        <div className="segmented" aria-label={`Étape ${stepIndex + 1} sur ${scenario.steps.length}`}>
          {scenario.steps.map((_, i) => (
            <span key={i} className={i <= stepIndex ? "filled" : ""} />
          ))}
        </div>
        <div className="question-content">
          <span className="small muted">La situation</span>
          <h2 ref={questionRef} tabIndex={-1}>
            {step.situation}
          </h2>
          <p className="answer-label">
            {feedback ? "Votre réponse" : "Quelle réponse choisissez-vous ?"}
          </p>
          <div className="answers">
            {step.answers
              .filter((a) => !feedback || a.id === last)
              .map((a) => (
                <motion.button
                  key={a.id}
                  whileHover={{ x: feedback ? 0 : 3 }}
                  whileTap={{ scale: 0.99 }}
                  className={`answer ${
                    feedback
                      ? correct
                        ? "selected-correct"
                        : "selected-wrong"
                      : ""
                  }`}
                  disabled={feedback}
                  onClick={() => p2Update(p2answer(p2State, step.id, a.id))}
                >
                  <span className="answer-letter">
                    {String.fromCharCode(65 + step.answers.indexOf(a))}
                  </span>
                  <span>{a.text}</span>
                  {feedback && correct ? (
                    <Check size={19} />
                  ) : !feedback ? (
                    <ChevronRight size={17} />
                  ) : null}
                </motion.button>
              ))}
          </div>

          {feedback && (
            <div
              className={`feedback ${correct ? "positive" : "constructive"}`}
              ref={feedbackRef}
              tabIndex={-1}
              role="region"
              aria-label="Retour sur votre réponse"
            >
              <div className="feedback-title">
                {correct ? <CheckCircle2 size={21} /> : <Sparkles size={21} />}
                <h3>
                  {correct
                    ? "Une réponse qui accompagne."
                    : "Essayons une autre approche."}
                </h3>
              </div>
              <p>{selected?.why}</p>
              {!correct && (
                <p className="feedback-tip">
                  Vous pouvez essayer une autre réponse. Votre premier essai
                  reste dans le bilan.
                </p>
              )}
              <div className="button-row">
                {!correct && (
                  <Button
                    onClick={() =>
                      p2Update({
                        ...p2State,
                        scenarioSteps: {
                          ...p2State.scenarioSteps,
                          [step.id]: { ...entry, ack: true },
                        },
                      })
                    }
                  >
                    <RotateCcw size={16} /> Réessayer
                  </Button>
                )}
                <Button
                  secondary={!correct}
                  onClick={() => p2Update(p2complete(p2State, step.id))}
                >
                  {correct ? "Continuer" : "Continuer et revoir plus tard"}
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>
          )}
          {!feedback && (
            <p className="question-hint">
              <ShieldCheck size={15} /> Vous avez le droit d'essayer. Chaque
              réponse est expliquée.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

// ─── Scenario overview card ───────────────────────────────────────────────────
function ScenarioOverviewCard({ scenario, p2State, onStart }) {
  const { done, total } = scenarioProgress(p2State, scenario.id);
  const score = scenarioFirstScore(p2State, scenario.id);
  const isComplete = done === total;

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ type: "spring", stiffness: 240, damping: 22 }}
      className="scenario-card"
    >
      <div className="scenario-card-header">
        <div className={`scenario-badge ${BADGE_CLASSES[scenario.badgeTone] || ""}`}>
          {scenario.badge}
        </div>
        {isComplete && (
          <span className="status good">
            <Check size={11} /> Terminé
          </span>
        )}
      </div>
      <h3>{scenario.title}</h3>
      <p>{scenario.context}</p>
      <div className="scenario-card-foot">
        <div className="scenario-steps-dots">
          {scenario.steps.map((s, i) => (
            <span
              key={s.id}
              className={`scenario-dot ${p2State.scenarioSteps[s.id]?.done ? "done" : ""}`}
            />
          ))}
        </div>
        <span className="small">
          {done}/{total} étapes
          {isComplete && ` · ${score}/${total} au 1er essai`}
        </span>
      </div>
      <Button onClick={() => onStart(scenario.id)} className="scenario-card-btn">
        {done === 0 ? "Commencer" : isComplete ? "Revoir" : "Continuer"}
        <ArrowRight size={15} />
      </Button>
    </motion.div>
  );
}

// ─── Phase 1 section (dialogue/checks integration) ────────────────────────────
function Phase1Section({ heading, s, update, go, preferredTarget }) {
  return (
    <div>
      <div className="section-title">
        <h2>Dialogue — Phase 1</h2>
        <span>Communication en officine · 3 situations</span>
      </div>
      {/* Reuse the existing Exercise component from LearningApp via props / link */}
      <div className="sentrainer-p1-link">
        <ShieldCheck size={17} />
        <div>
          <strong>Le parcours de communication est dans Phase 1.</strong>
          <p>
            Ces trois situations sont accessibles depuis « Apprendre »
            (onglet Communication) et la navigation principale Phase 1.
          </p>
        </div>
        <button className="button secondary" onClick={() => go("simulation")}>
          Ouvrir le dialogue Phase 1 <ArrowRight size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Main Sentrainer component ────────────────────────────────────────────────
export default function Sentrainer({
  heading,
  s,
  update,
  p2State,
  p2Update,
  go,
  preferredScenario,
  onGoLesson,
}) {
  const [activeScenario, setActiveScenario] = useState(
    preferredScenario || null,
  );

  const scenario = scenarios.find((sc) => sc.id === activeScenario);

  // If a preferred scenario is passed, jump directly into it
  useEffect(() => {
    if (preferredScenario) setActiveScenario(preferredScenario);
  }, [preferredScenario]);

  if (scenario && activeScenario) {
    return (
      <div>
        <div className="page-heading compact">
          <div>
            <p className="eyebrow">02 / S'ENTRAÎNER</p>
            <h1 ref={heading} tabIndex={-1}>
              {scenario.title}
            </h1>
            <p className="intro">{scenario.context}</p>
          </div>
        </div>
        <button
          className="text-button"
          style={{ marginBottom: 20 }}
          onClick={() => setActiveScenario(null)}
        >
          ← Retour aux scénarios
        </button>
        <ScenarioExercise
          scenario={scenario}
          p2State={p2State}
          p2Update={p2Update}
          onGoLesson={onGoLesson}
          onDone={() => setActiveScenario(null)}
        />
      </div>
    );
  }

  return (
    <div>
      <div className="page-heading compact">
        <div>
          <p className="eyebrow">02 / S'ENTRAÎNER</p>
          <h1 ref={heading} tabIndex={-1}>
            À vous de mener l'échange.
          </h1>
          <p className="intro">
            Quatre situations au comptoir. Choisissez votre réponse et comprenez
            le retour. Votre premier essai est toujours conservé.
          </p>
        </div>
      </div>

      {/* Phase 2 scenarios */}
      <div className="section-title">
        <h2>Scénarios au comptoir</h2>
        <span>Phase 2 · {scenarios.length} scénarios</span>
      </div>
      <div className="scenario-grid">
        {scenarios.map((sc) => (
          <ScenarioOverviewCard
            key={sc.id}
            scenario={sc}
            p2State={p2State}
            onStart={(id) => setActiveScenario(id)}
          />
        ))}
      </div>

      {/* Phase 1 link */}
      <Phase1Section s={s} update={update} go={go} />
    </div>
  );
}
