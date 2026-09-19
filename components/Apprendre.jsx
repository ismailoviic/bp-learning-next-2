"use client";
import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronRight,
  MessagesSquare,
  RotateCcw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { principles } from "../lib/content.mjs";
import { lessons } from "../lib/lessons.mjs";
import { p2markRead } from "../lib/p2-progress.mjs";

// ─── Shared small components ──────────────────────────────────────────────────
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

function Reveal({ children, className = "" }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ type: "spring", stiffness: 110, damping: 20 }}
    >
      {children}
    </motion.div>
  );
}

// ─── Lesson card with embedded check ─────────────────────────────────────────
function LessonCard({ lesson, p2State, p2Update, onGoScenario }) {
  const [expanded, setExpanded] = useState(false);
  const [checkAnswer, setCheckAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const isRead = p2State.lessonsRead.includes(lesson.id);
  const correct = checkAnswer === lesson.check.correct;

  function markRead() {
    p2Update(p2markRead(p2State, lesson.id));
    setExpanded(true);
  }

  function handleAnswer(id) {
    if (showFeedback) return;
    setCheckAnswer(id);
    setShowFeedback(true);
  }

  const selectedAnswer = lesson.check.answers.find((a) => a.id === checkAnswer);

  return (
    <Reveal>
      <div className={`lesson-card ${isRead ? "is-read" : ""} ${expanded ? "is-expanded" : ""}`}>
        {/* Header */}
        <button
          className="lesson-header"
          onClick={() => {
            if (!isRead) markRead();
            else setExpanded((v) => !v);
          }}
          aria-expanded={expanded}
        >
          <span className={`lesson-read-dot ${isRead ? "done" : ""}`}>
            {isRead ? <Check size={13} /> : null}
          </span>
          <div className="lesson-header-text">
            <span className="lesson-demo-badge">{lesson.reviewStatus}</span>
            <h3>{lesson.title}</h3>
            <p className="lesson-objective">{lesson.objective}</p>
          </div>
          <ChevronRight
            size={17}
            style={{
              transform: expanded ? "rotate(90deg)" : "rotate(0deg)",
              transition: "transform 0.2s",
              flexShrink: 0,
            }}
          />
        </button>

        {/* Body */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              className="lesson-body"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
            >
              <div className="lesson-body-inner">
                {/* Explanation */}
                <p className="lesson-explanation">{lesson.explanation}</p>

                {/* Example exchange */}
                <div className="lesson-exchange">
                  <p className="lesson-exchange-label">Exemple de formulation</p>
                  <div className="lesson-bubble lesson-bubble--customer">
                    <span className="lesson-bubble-role">Client·e</span>
                    <p>« {lesson.example.customer} »</p>
                  </div>
                  <div className="lesson-bubble lesson-bubble--employee">
                    <span className="lesson-bubble-role">Vous</span>
                    <p>« {lesson.example.employee} »</p>
                  </div>
                </div>

                {/* Learning check */}
                <div className="lesson-check">
                  <p className="lesson-check-label">Vérification</p>
                  <h4>{lesson.check.question}</h4>
                  <div className="lesson-check-answers">
                    {lesson.check.answers.map((a) => {
                      let state = "";
                      if (showFeedback && a.id === checkAnswer) {
                        state = correct ? "correct" : "wrong";
                      }
                      if (showFeedback && a.id === lesson.check.correct) {
                        state = "correct";
                      }
                      return (
                        <button
                          key={a.id}
                          className={`lesson-check-option ${state}`}
                          disabled={showFeedback}
                          onClick={() => handleAnswer(a.id)}
                        >
                          <span className="answer-letter">
                            {String.fromCharCode(
                              65 + lesson.check.answers.indexOf(a),
                            )}
                          </span>
                          <span>{a.text}</span>
                          {showFeedback && a.id === lesson.check.correct && (
                            <Check size={15} />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {showFeedback && selectedAnswer && (
                    <div
                      className={`lesson-check-feedback ${correct ? "positive" : "constructive"}`}
                    >
                      {correct ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <Sparkles size={16} />
                      )}
                      <p>{selectedAnswer.why}</p>
                      {!correct && (
                        <button
                          className="text-button"
                          onClick={() => {
                            setCheckAnswer(null);
                            setShowFeedback(false);
                          }}
                        >
                          <RotateCcw size={13} /> Réessayer
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Link to simulation */}
                <button
                  className="lesson-sim-link"
                  onClick={() => onGoScenario(lesson.relatedScenario)}
                >
                  <MessagesSquare size={15} />
                  S'entraîner sur la situation liée
                  <ArrowRight size={15} />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </Reveal>
  );
}

// ─── Principle card (Phase 1 — unchanged content, new layout) ─────────────────
function PrincipleCard({ principle, index, isRead, onToggle }) {
  return (
    <Reveal>
      <label className={`principle ${isRead ? "is-read" : ""}`}>
        <div className="principle-head">
          <span className="principle-num">0{index + 1}</span>
          <input
            type="checkbox"
            checked={isRead}
            onChange={onToggle}
            aria-label={`Marquer "${principle.title}" comme lu`}
          />
        </div>
        <span className="eyebrow">{principle.label}</span>
        <h2>{principle.title}</h2>
        <p>{principle.text}</p>
        <blockquote>{principle.example}</blockquote>
        <span className="read-label">
          {isRead ? "✓ Principe parcouru" : "Marquer comme lu"}
        </span>
      </label>
    </Reveal>
  );
}

// ─── Main Apprendre component ─────────────────────────────────────────────────
export default function Apprendre({
  heading,
  s,          // Phase 1 state
  update,     // Phase 1 updater
  p2State,    // Phase 2 state
  p2Update,   // Phase 2 updater
  onGoSimulation,   // go to simulation with scenario ID
  onGoSentrainer,   // go to S'entraîner area
}) {
  const [tab, setTab] = useState("communication");

  return (
    <div>
      <div className="page-heading compact">
        <div>
          <p className="eyebrow">01 / APPRENDRE</p>
          <h1 ref={heading} tabIndex={-1}>
            La bibliothèque de l'échange.
          </h1>
          <p className="intro">
            Des concepts courts, des exemples concrets, une vérification rapide.
            Ouvrez une leçon pour la parcourir à votre rythme.
          </p>
        </div>
      </div>

      {/* Tab nav */}
      <div className="learn-tabs" role="tablist" aria-label="Sections d'apprentissage">
        {[
          ["communication", BookOpen, "Communication"],
          ["comptoir", ShieldCheck, "Au comptoir"],
        ].map(([id, Icon, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            className={`learn-tab ${tab === id ? "active" : ""}`}
            onClick={() => setTab(id)}
          >
            <Icon size={16} />
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.14 }}
        >
          {tab === "communication" && (
            <>
              <div className="section-title">
                <h2>Principes de communication</h2>
                <span>Phase 1 · Contenu de formation existant</span>
              </div>
              <div className="prep-grid">
                {principles.map((p, i) => (
                  <PrincipleCard
                    key={p.id}
                    principle={p}
                    index={i}
                    isRead={s.prep.includes(p.id)}
                    onToggle={(e) =>
                      update({
                        ...s,
                        prep: e.target.checked
                          ? [...s.prep, p.id]
                          : s.prep.filter((x) => x !== p.id),
                      })
                    }
                  />
                ))}
              </div>
              <div className="action-bar">
                <span>{s.prep.length}/3 principes parcourus</span>
                <button
                  className="button primary"
                  onClick={() => onGoSentrainer()}
                >
                  Passer à la simulation
                  <ArrowRight size={18} />
                </button>
              </div>
            </>
          )}

          {tab === "comptoir" && (
            <>
              <div className="section-title">
                <h2>Accompagner au comptoir</h2>
                <span>Phase 2 · {lessons.length} leçons</span>
              </div>
              <div className="lessons-list">
                {lessons.map((lesson) => (
                  <LessonCard
                    key={lesson.id}
                    lesson={lesson}
                    p2State={p2State}
                    p2Update={p2Update}
                    onGoScenario={onGoSimulation}
                  />
                ))}
              </div>
              <Reveal className="quiet-note" style={{ marginTop: 24 }}>
                <ShieldCheck size={23} />
                <div>
                  <strong>Contenu de démonstration</strong>
                  <p>
                    Ces leçons sont des illustrations pédagogiques. Elles ne
                    constituent pas un avis clinique, pharmaceutique ou médical.
                    Toute question de santé précise doit être adressée à un
                    pharmacien.
                  </p>
                </div>
              </Reveal>
            </>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
