"use client";
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  BookOpen,
  MessagesSquare,
  ChartNoAxesCombined,
  RotateCcw,
  ChevronRight,
  ShieldCheck,
  Clock3,
  Sparkles,
  AlertCircle,
  X,
  Home,
  Flag,
  Stethoscope,
  ShoppingBag,
} from "lucide-react";

// Phase 1 imports
import { principles, dialogue, checks } from "../lib/content.mjs";
import {
  KEY,
  fresh,
  sanitize,
  answer,
  complete,
  percent,
  nextStep,
  firstScore,
} from "../lib/progress.mjs";

// Phase 2 imports
import {
  P2_KEY,
  p2fresh,
  p2sanitize,
  p2percent,
} from "../lib/p2-progress.mjs";

// Phase 2 components
import Apprendre from "./Apprendre.jsx";
import Sentrainer from "./Sentrainer.jsx";
const AuComptoir = dynamic(() => import("./AuComptoir.jsx"), { ssr: false });

// Phase 1 Orb
const Orb = dynamic(() => import("./Orb"), {
  ssr: false,
  loading: () => <div className="orb orb-fallback">✦</div>,
});

// ─── Route config ─────────────────────────────────────────────────────────────
const ROUTES = {
  accueil: "Mon espace",
  apprendre: "Apprendre",
  sentrainer: "S'entraîner",
  aucomptoir: "Au Comptoir",
  simulation: "Simulation Phase 1",
  verification: "Vérifications",
  bilan: "Mon bilan",
};

// ─── Shared components ────────────────────────────────────────────────────────
function Button({ children, secondary = false, className = "", ...props }) {
  return (
    <motion.button
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.97 }}
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

function PageTitle({ heading, step, title, subtitle }) {
  return (
    <div className="page-heading compact">
      <div>
        <p className="eyebrow">{step}</p>
        <h1 ref={heading} tabIndex={-1}>
          {title}
        </h1>
        <p className="intro">{subtitle}</p>
      </div>
    </div>
  );
}

// ─── Phase 1 Exercise (re-exported here to keep it available) ─────────────────
function Exercise({ kind, list, state, update, go, preferred }) {
  const target = list.findIndex(
    (q) => q.id === preferred && !state[kind][q.id]?.done,
  );
  const index =
    target >= 0 ? target : list.findIndex((q) => !state[kind][q.id]?.done);
  const q = list[index];
  const entry = q ? state[kind][q.id] : null;
  const last = entry?.attempts.at(-1);
  const feedback = !!last && !entry?.ack;
  const selected = q?.answers.find((a) => a.id === last);
  const correct = last === q?.correct;
  const feedbackRef = useRef();
  const questionRef = useRef();
  const previous = useRef(null);

  useEffect(() => {
    if (feedback) feedbackRef.current?.focus();
    else if (previous.current !== null) questionRef.current?.focus();
    previous.current = q?.id;
  }, [q?.id, feedback]);

  if (index < 0)
    return (
      <div className="finish-card">
        <span className="finish-icon">
          <CheckCircle2 size={42} />
        </span>
        <p className="eyebrow">ÉTAPE TERMINÉE</p>
        <h2 ref={questionRef} tabIndex={-1}>
          {kind === "simulation"
            ? "Vous avez mené l'échange."
            : "Vos vérifications sont terminées."}
        </h2>
        <p>
          {firstScore(state, kind, list)} réponse(s) recommandée(s) au premier
          essai sur 3.
          <br />
          Les corrections font partie de l'apprentissage.
        </p>
        <Button
          onClick={() =>
            go(kind === "simulation" ? "verification" : "bilan")
          }
        >
          {kind === "simulation"
            ? "Consolider mes acquis"
            : "Découvrir mon bilan"}
          <ArrowRight size={18} />
        </Button>
        <button className="text-button" onClick={() => go("bilan")}>
          Consulter mes réponses
        </button>
      </div>
    );

  return (
    <div className="exercise-layout">
      <aside className="context-card">
        <span className="tag">
          {kind === "simulation" ? "SITUATION FICTIVE" : "VÉRIFICATION"}
        </span>
        <div className="customer-avatar">
          {kind === "simulation" ? "CF" : <BookOpen size={26} />}
        </div>
        <h2>
          {kind === "simulation"
            ? "Une cliente à Casablanca"
            : "Un principe à la fois"}
        </h2>
        <p>
          {kind === "simulation"
            ? "Elle lit le français et préfère parfois une explication orale en darija. Elle souhaite comprendre des consignes générales."
            : "Choisissez la réponse qui facilite un échange clair et respectueux."}
        </p>
        <div className="context-goal">
          <Flag size={18} />
          <div>
            <strong>Votre objectif</strong>
            <p>
              Écouter sa préférence, expliquer simplement et vérifier la
              compréhension.
            </p>
          </div>
        </div>
        <div className="steps-mini">
          {list.map((item, i) => (
            <div key={item.id} className={i === index ? "current" : ""}>
              <span>
                {state[kind][item.id]?.done ? <Check size={12} /> : i + 1}
              </span>
              {item.title}
            </div>
          ))}
        </div>
        <span className="small">Aucun conseil clinique dans cet exercice.</span>
      </aside>
      <section className="question-card">
        <div className="question-top">
          <span>{kind === "simulation" ? "LE DIALOGUE" : "VOS ACQUIS"}</span>
          <span>
            Étape {index + 1} / {list.length}
          </span>
        </div>
        <div className="segmented" aria-label={`Étape ${index + 1} sur 3`}>
          {list.map((_, i) => (
            <span key={i} className={i <= index ? "filled" : ""} />
          ))}
        </div>
        <div className="question-content">
          <span className="small muted">
            {kind === "simulation" ? "La cliente vous dit" : "À vous de choisir"}
          </span>
          <h2 tabIndex={-1} ref={questionRef}>
            {q.customer}
          </h2>
          <p className="answer-label">
            {feedback ? "Votre réponse" : "Quelle réponse choisissez-vous ?"}
          </p>
          <div className="answers">
            {q.answers
              .filter((a) => !feedback || a.id === last)
              .map((a) => (
                <motion.button
                  whileHover={{ x: feedback ? 0 : 3 }}
                  whileTap={{ scale: 0.99 }}
                  key={a.id}
                  className={`answer ${feedback ? (correct ? "selected-correct" : "selected-wrong") : ""}`}
                  disabled={feedback}
                  onClick={() => update(answer(state, kind, q.id, a.id))}
                >
                  <span className="answer-letter">
                    {String.fromCharCode(65 + q.answers.indexOf(a))}
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
              <p>{selected.why}</p>
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
                      update({
                        ...state,
                        [kind]: {
                          ...state[kind],
                          [q.id]: { ...entry, ack: true },
                        },
                      })
                    }
                  >
                    <RotateCcw size={16} />
                    Réessayer
                  </Button>
                )}
                <Button
                  secondary={!correct}
                  onClick={() => update(complete(state, kind, q.id))}
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

// ─── Main App Shell ───────────────────────────────────────────────────────────
export default function AppShell() {
  // Phase 1 state
  const [s, setS] = useState(fresh);
  const [ready, setReady] = useState(false);
  const [route, setRoute] = useState("accueil");
  const [warning, setWarning] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [reset, setReset] = useState(false);
  const [notice, setNotice] = useState("");

  // Phase 2 state
  const [p2State, setP2State] = useState(p2fresh);
  const [preferredScenario, setPreferredScenario] = useState(null);

  const heading = useRef();
  const resetTrigger = useRef();
  const cancel = useRef();
  const reduce = useReducedMotion();
  const [practiceTarget, setPracticeTarget] = useState(null);

  // ── Boot: load Phase 1 + Phase 2 progress ──
  useEffect(() => {
    // Phase 1
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setS(sanitize(JSON.parse(raw)));
    } catch {
      setWarning(
        "La progression enregistrée est illisible ou inaccessible. Vous pouvez continuer cette session.",
      );
    }
    // Phase 2
    try {
      const raw2 = localStorage.getItem(P2_KEY);
      if (raw2) setP2State(p2sanitize(JSON.parse(raw2)));
    } catch {
      // non-fatal, start fresh
    }
    setReady(true);

    const sync = () => {
      const name = location.hash.slice(1);
      setRoute(ROUTES[name] ? name : "accueil");
    };
    sync();
    addEventListener("hashchange", sync);
    return () => removeEventListener("hashchange", sync);
  }, []);

  // Focus heading on route change
  useEffect(() => {
    if (!ready) return;
    const timer = setTimeout(
      () => heading.current?.focus({ preventScroll: true }),
      250,
    );
    return () => clearTimeout(timer);
  }, [route, ready]);

  useEffect(() => {
    if (reset) cancel.current?.focus();
  }, [reset]);

  // ── Phase 1 updater ──
  function update(next) {
    setS(next);
    try {
      localStorage.setItem(KEY, JSON.stringify(next));
      setWarning("");
      setSaveStatus("Progression enregistrée sur cet appareil");
    } catch {
      setWarning(
        "Enregistrement impossible. Votre progression reste disponible pendant cette session. Réessayez avant de quitter.",
      );
      setSaveStatus("Non enregistré");
    }
  }

  // ── Phase 2 updater ──
  function p2Update(next) {
    setP2State(next);
    try {
      localStorage.setItem(P2_KEY, JSON.stringify(next));
    } catch {
      // non-fatal
    }
  }

  function go(next, target = null) {
    setPracticeTarget(target);
    setPreferredScenario(null);
    setNotice("");
    location.hash = next;
    setRoute(next);
    window.scrollTo({ top: 0, behavior: "instant" });
  }

  function goScenario(scenarioId) {
    setPreferredScenario(scenarioId);
    go("sentrainer");
  }

  function goLesson(lessonId) {
    // Navigate to Apprendre comptoir tab
    // The Apprendre component will expand based on tab state
    go("apprendre");
  }

  function closeReset() {
    setReset(false);
    requestAnimationFrame(() => resetTrigger.current?.focus());
  }

  const progress = percent(s);
  const p2prog = p2percent(p2State);
  const next = nextStep(s);
  const allDone = progress === 100;

  if (!ready)
    return (
      <div className="boot" role="status">
        <span className="brand-icon">
          bp<span>✦</span>
        </span>
        <p>Ouverture de votre espace…</p>
      </div>
    );

  // ── Navigation config ──
  const nav = [
    ["accueil", Home, "Mon espace"],
    ["apprendre", BookOpen, "Apprendre"],
    ["sentrainer", MessagesSquare, "S'entraîner"],
    ["aucomptoir", ShoppingBag, "Au Comptoir"],
    ["bilan", ChartNoAxesCombined, "Mon bilan"],
  ];

  return (
    <MotionConfig reducedMotion="user">
      <div className="app">
        <a
          className="skip"
          href="#content"
          onClick={(e) => {
            e.preventDefault();
            document.getElementById("content")?.focus();
          }}
        >
          Aller au contenu
        </a>

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <a href="#accueil" className="brand" onClick={() => go("accueil")}>
            <span className="brand-icon">
              bp<span>✦</span>
            </span>
            <span>
              Learning<small>LE SENS DE L'ÉCHANGE</small>
            </span>
          </a>
          <div className="nav-label">VOTRE ESPACE</div>
          <nav aria-label="Navigation principale">
            {nav.map(([id, Icon, label]) => (
              <a
                key={id}
                href={`#${id}`}
                aria-current={
                  route === id ||
                  (id === "sentrainer" &&
                    (route === "simulation" || route === "verification"))
                    ? "page"
                    : undefined
                }
                onClick={() => go(id)}
              >
                <Icon size={19} />
                <span>{label}</span>
                {id === "sentrainer" && (
                  <span className="nav-pill">04</span>
                )}
                {id === "aucomptoir" && (
                  <span className="nav-pill nav-pill--new">NEW</span>
                )}
              </a>
            ))}
          </nav>
          <div className="side-course">
            <span className="tiny">VOTRE FORMATION</span>
            <p>
              Un meilleur échange,
              <br /> un meilleur accueil.
            </p>
            <div className="track">
              <span style={{ width: `${progress}%` }} />
            </div>
            <span className="small">{progress}% Phase 1 réalisée</span>
            {p2prog > 0 && (
              <>
                <div className="track" style={{ marginTop: 8 }}>
                  <span
                    style={{
                      width: `${p2prog}%`,
                      background: "var(--amber)",
                    }}
                  />
                </div>
                <span className="small">{p2prog}% Phase 2 réalisée</span>
              </>
            )}
          </div>
          <div className="side-bottom">
            <ShieldCheck size={18} />
            <span>
              Un espace pour apprendre
              <br />à votre rythme.
            </span>
          </div>
        </aside>

        {/* ── Main workspace ── */}
        <div className="workspace">
          <header className="topbar">
            <div className="breadcrumb">
              Mon apprentissage <ChevronRight size={14} />
              <span>{ROUTES[route] || route}</span>
            </div>
            <div className="profile">
              <span className="avatar">NA</span>
              <div>
                Nadia A.<small>Profil fictif · Casablanca</small>
              </div>
            </div>
          </header>

          <main id="content" tabIndex={-1}>
            {warning && (
              <div role="alert" className="save-warning">
                <AlertCircle size={20} />
                <span>{warning}</span>
                <button onClick={() => update(s)}>
                  Réessayer l'enregistrement
                </button>
              </div>
            )}

            <AnimatePresence mode="wait">
              <motion.div
                key={route}
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.18 }}
              >
                {/* ── Accueil ── */}
                {route === "accueil" && (
                  <Accueil
                    heading={heading}
                    s={s}
                    p2State={p2State}
                    progress={progress}
                    p2prog={p2prog}
                    next={next}
                    allDone={allDone}
                    go={go}
                  />
                )}

                {/* ── Apprendre ── */}
                {route === "apprendre" && (
                  <Apprendre
                    heading={heading}
                    s={s}
                    update={update}
                    p2State={p2State}
                    p2Update={p2Update}
                    onGoSimulation={goScenario}
                    onGoSentrainer={() => go("sentrainer")}
                  />
                )}

                {/* ── S'entraîner ── */}
                {route === "sentrainer" && (
                  <Sentrainer
                    heading={heading}
                    s={s}
                    update={update}
                    p2State={p2State}
                    p2Update={p2Update}
                    go={go}
                    preferredScenario={preferredScenario}
                    onGoLesson={goLesson}
                  />
                )}

                {/* ── Au Comptoir ── */}
                {route === "aucomptoir" && (
                  <AuComptoirWrapper heading={heading} onGoLesson={goLesson} />
                )}

                {/* ── Phase 1: Simulation ── */}
                {(route === "simulation" ||
                  route === "verification") && (
                  <>
                    <PageTitle
                      heading={heading}
                      step={
                        route === "simulation"
                          ? "02 / PRATIQUER"
                          : "03 / ANCRER"
                      }
                      title={
                        route === "simulation"
                          ? "À vous de mener l'échange."
                          : "Faites le point sur vos acquis."
                      }
                      subtitle={
                        route === "simulation"
                          ? "Choisissez votre réponse. Prenez le temps de comprendre le retour avant de continuer."
                          : "Trois questions courtes. Vous pouvez réessayer sans perdre votre progression."
                      }
                    />
                    <Exercise
                      preferred={practiceTarget}
                      kind={route === "simulation" ? "simulation" : "checks"}
                      list={route === "simulation" ? dialogue : checks}
                      state={s}
                      update={update}
                      go={go}
                    />
                  </>
                )}

                {/* ── Bilan ── */}
                {route === "bilan" && (
                  <Bilan
                    heading={heading}
                    s={s}
                    update={update}
                    p2State={p2State}
                    progress={progress}
                    p2prog={p2prog}
                    allDone={allDone}
                    next={next}
                    go={go}
                    setReset={setReset}
                    resetTrigger={resetTrigger}
                    fresh={fresh}
                    p2fresh={p2fresh}
                    p2Update={p2Update}
                  />
                )}
              </motion.div>
            </AnimatePresence>

            <footer>
              <span>
                BP Learning <span className="footer-dot">·</span> Phase 2 ·
                Entraînement à la communication
              </span>
              <span role="status" aria-live="polite">
                {saveStatus || "Progression locale · profil fictif"}
              </span>
            </footer>
          </main>
        </div>

        {/* ── Reset modal ── */}
        {reset && (
          <div
            className="modal-backdrop"
            onKeyDown={(e) => {
              if (e.key === "Escape") closeReset();
              if (e.key === "Tab") {
                const nodes = [
                  ...e.currentTarget.querySelectorAll("button"),
                ];
                if (e.shiftKey && document.activeElement === nodes[0]) {
                  e.preventDefault();
                  nodes.at(-1).focus();
                } else if (
                  !e.shiftKey &&
                  document.activeElement === nodes.at(-1)
                ) {
                  e.preventDefault();
                  nodes[0].focus();
                }
              }
            }}
          >
            <section
              className="modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="reset-title"
            >
              <span className="icon-tile">
                <RotateCcw />
              </span>
              <h2 id="reset-title">Recommencer de zéro ?</h2>
              <p>
                Vos réponses et votre progression sur cet appareil seront
                effacées. Cette action est irréversible.
              </p>
              <div className="button-row">
                <button
                  className="button secondary"
                  ref={cancel}
                  onClick={closeReset}
                >
                  Garder ma progression
                </button>
                <Button
                  onClick={() => {
                    const freshState = fresh();
                    update(freshState);
                    const freshP2 = p2fresh();
                    p2Update(freshP2);
                    try {
                      localStorage.removeItem(P2_KEY);
                    } catch {}
                    setReset(false);
                    go("accueil");
                  }}
                >
                  Tout réinitialiser
                </Button>
              </div>
            </section>
          </div>
        )}
      </div>
    </MotionConfig>
  );
}

// ─── Au Comptoir wrapper (handles heading focus) ──────────────────────────────
function AuComptoirWrapper({ heading, onGoLesson }) {
  return (
    <div>
      <div className="page-heading compact">
        <div>
          <p className="eyebrow">AU COMPTOIR</p>
          <h1 ref={heading} tabIndex={-1}>
            Préparer l'échange.
          </h1>
          <p className="intro">
            Saisissez le besoin ou les produits, posez les questions utiles et
            identifiez la prochaine action. Session en mémoire uniquement.
          </p>
        </div>
      </div>
      <AuComptoir onGoLesson={onGoLesson} />
    </div>
  );
}

// ─── Accueil view ─────────────────────────────────────────────────────────────
const primaryLabels = {
  preparation: "Préparer mon échange",
  simulation: "Reprendre la simulation",
  verification: "Vérifier mes acquis",
  bilan: "Voir mon bilan",
};

function Accueil({ heading, s, p2State, progress, p2prog, next, allDone, go }) {
  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">APPRENDRE POUR MIEUX ACCOMPAGNER</p>
          <h1 tabIndex={-1} ref={heading}>
            Un bon échange
            <br />
            commence par <em>l'écoute.</em>
          </h1>
          <p className="intro">
            Quelques minutes pour accueillir avec confiance,
            <br className="desktop" /> expliquer simplement et vérifier la
            compréhension.
          </p>
        </div>
        <span className="badge">
          <span className="dot" /> Communication en officine
        </span>
      </div>

      <Reveal className="hero-card">
        <div className="hero-copy">
          <div className="hero-meta">
            <span>VOTRE PARCOURS</span>
            <span>
              <Clock3 size={14} /> 15 min · indicatif
            </span>
          </div>
          <h2>
            Mieux accueillir.
            <br />
            Mieux se comprendre.
          </h2>
          <p>
            Communication, scénarios au comptoir, assistance guidée.
            <br />
            Entraînez-vous dans un contexte marocain.
          </p>
          <Button onClick={() => go(next === "preparation" ? "apprendre" : next)}>
            {progress === 0 ? "Commencer ma formation" : primaryLabels[next] || "Continuer"}
            <ArrowRight size={18} />
          </Button>
          <div className="hero-foot">
            <span className="mini-avatars">
              <i>N</i>
              <i>✦</i>
            </span>
            <span>À votre rythme. Votre progression est conservée ici.</span>
          </div>
        </div>
        <Orb />
      </Reveal>

      <div className="section-title">
        <h2>Votre parcours, en quatre temps</h2>
        <span>Un objectif : un échange plus clair.</span>
      </div>

      <div className="stage-grid stage-grid--4">
        {[
          [
            "01",
            "Apprendre",
            "Principes de communication et leçons au comptoir.",
            BookOpen,
            "apprendre",
            s.prep.length + p2State.lessonsRead.length,
            7,
          ],
          [
            "02",
            "S'entraîner",
            "Quatre scénarios au comptoir, en plus du dialogue Phase 1.",
            MessagesSquare,
            "sentrainer",
            Object.values(p2State.scenarioSteps || {}).filter((x) => x.done).length,
            12,
          ],
          [
            "03",
            "Au Comptoir",
            "Assistance guidée : besoin, questions, prochaine action.",
            ShoppingBag,
            "aucomptoir",
            null,
            null,
          ],
          [
            "04",
            "Mon Bilan",
            "Résultats, décisions expliquées et réinitialisation.",
            ChartNoAxesCombined,
            "bilan",
            null,
            null,
          ],
        ].map(([n, title, desc, Icon, id, count, total]) => (
          <Reveal key={id}>
            <motion.a
              whileHover={{ y: -5 }}
              transition={{ type: "spring", stiffness: 240, damping: 23 }}
              href={`#${id}`}
              className="stage-card"
              onClick={() => go(id)}
            >
              <div className="stage-top">
                <span className={`icon-tile tone-${n}`}>
                  <Icon size={23} />
                </span>
                <span className="stage-number">{n}</span>
              </div>
              <h3>{title}</h3>
              <p>{desc}</p>
              <div className="stage-bottom">
                <span>
                  {count === null ? (
                    <><Sparkles size={12} /> Nouveau</>
                  ) : count === total ? (
                    <><Check size={14} /> Terminé</>
                  ) : count ? (
                    `${count}/${total} réalisés`
                  ) : (
                    "À découvrir"
                  )}
                </span>
                <ArrowRight size={19} />
              </div>
            </motion.a>
          </Reveal>
        ))}
      </div>

      <Reveal className="quiet-note">
        <ShieldCheck size={23} />
        <div>
          <strong>Ici, on apprend à communiquer.</strong>
          <p>
            Les situations sont fictives. Toute question de santé précise doit
            être adressée à un pharmacien.
          </p>
        </div>
      </Reveal>
    </>
  );
}

// ─── Bilan view ───────────────────────────────────────────────────────────────
import { scenarios } from "../lib/scenarios.mjs";
import {
  scenarioFirstScore,
  scenarioProgress,
} from "../lib/p2-progress.mjs";

function Bilan({
  heading,
  s,
  update,
  p2State,
  progress,
  p2prog,
  allDone,
  next,
  go,
  setReset,
  resetTrigger,
  fresh,
  p2fresh,
  p2Update,
}) {
  return (
    <>
      <PageTitle
        heading={heading}
        step="VOTRE PROGRESSION"
        title={allDone ? "Un échange plus clair. Un pas de plus." : "Chaque étape compte."}
        subtitle={
          allDone
            ? "Votre parcours Phase 1 est terminé. Retrouvez ce qui est acquis et ce qui mérite une nouvelle pratique."
            : "Reprenez là où vous en étiez, ou consultez vos décisions."
        }
      />

      <div className="summary-grid">
        <div className="summary-main">
          <span className="eyebrow">PHASE 1 — ACTIVITÉS RÉALISÉES</span>
          <strong className="big-number">
            {progress}
            <small>%</small>
          </strong>
          <div className="track">
            <span style={{ width: `${progress}%` }} />
          </div>
          <p>La complétion mesure les activités réalisées, pas la maîtrise.</p>
          {!allDone && (
            <Button onClick={() => go(next)}>
              {primaryLabels[next]}
              <ArrowRight size={17} />
            </Button>
          )}
        </div>
        <div className="summary-stat">
          <MessagesSquare />
          <strong>
            {firstScore(s, "simulation", dialogue)}
            <small> / 3</small>
          </strong>
          <span>
            Réponses recommandées
            <br />
            au premier essai · simulation
          </span>
        </div>
        <div className="summary-stat">
          <CheckCircle2 />
          <strong>
            {firstScore(s, "checks", checks)}
            <small> / 3</small>
          </strong>
          <span>
            Réponses correctes
            <br />
            au premier essai · vérifications
          </span>
        </div>
      </div>

      {/* Phase 2 stats */}
      {p2prog > 0 && (
        <div className="section-title" style={{ marginTop: 32 }}>
          <h2>Phase 2 — Progression au comptoir</h2>
          <span>{p2prog}% réalisé</span>
        </div>
      )}
      {p2prog > 0 && (
        <div className="summary-grid" style={{ marginBottom: 32 }}>
          {scenarios.map((sc) => {
            const { done, total } = scenarioProgress(p2State, sc.id);
            const score = scenarioFirstScore(p2State, sc.id);
            return (
              <div key={sc.id} className="summary-stat">
                <MessagesSquare />
                <strong>
                  {score}
                  <small> / {total}</small>
                </strong>
                <span>
                  {sc.title}
                  <br />
                  au 1er essai · {done}/{total} étapes
                </span>
              </div>
            );
          })}
        </div>
      )}

      <div className="section-title">
        <h2>Vos décisions, expliquées</h2>
        <span>Les premiers essais restent visibles après une correction.</span>
      </div>

      {[
        [dialogue, "simulation", "Simulation Phase 1"],
        [checks, "checks", "Vérifications Phase 1"],
      ].map(([list, kind, label]) => (
        <div key={kind} className="review-section">
          <h3>{label}</h3>
          {list.map((q, i) => {
            const e = s[kind][q.id];
            const first = q.answers.find((a) => a.id === e?.attempts[0]);
            const last = e?.attempts.at(-1);
            return (
              <details className="review-item" key={q.id}>
                <summary>
                  <span className="review-index">0{i + 1}</span>
                  <span>{q.title}</span>
                  <span
                    className={`status ${!e ? "neutral" : first?.id === q.correct ? "good" : "retry"}`}
                  >
                    {!e
                      ? "À découvrir"
                      : first?.id === q.correct
                        ? "Réussi au 1er essai"
                        : last === q.correct
                          ? "Corrigé après pratique"
                          : e.done
                            ? "À revoir"
                            : "En cours"}
                  </span>
                  <ChevronRight size={17} />
                </summary>
                <div className="review-body">
                  {first ? (
                    <>
                      <p>
                        <strong>Votre premier choix</strong>
                        <br />
                        {first.text}
                      </p>
                      <p>{first.why}</p>
                      <p className="recommended">
                        <strong>Réponse recommandée</strong>
                        <br />
                        {q.answers.find((a) => a.id === q.correct).text}
                      </p>
                      <span className="small">
                        {e.attempts.length} essai(s) ·{" "}
                        {e.done ? "activité terminée" : "activité en cours"}
                      </span>
                    </>
                  ) : (
                    <p>Cette activité n'a pas encore été commencée.</p>
                  )}
                  <Button
                    secondary
                    onClick={() => {
                      if (e) {
                        update({
                          ...s,
                          [kind]: {
                            ...s[kind],
                            [q.id]: { ...e, done: false, ack: true },
                          },
                        });
                      }
                      go(kind === "simulation" ? "simulation" : "verification", q.id);
                    }}
                  >
                    Pratiquer cette étape
                    <ArrowRight size={16} />
                  </Button>
                </div>
              </details>
            );
          })}
        </div>
      ))}

      <div className="reset-row">
        <p>
          Enregistrement local à cet appareil. Aucun compte ni synchronisation.
        </p>
        <button
          className="text-button danger"
          ref={resetTrigger}
          onClick={() => setReset(true)}
        >
          <RotateCcw size={15} /> Réinitialiser le parcours
        </button>
      </div>
    </>
  );
}
