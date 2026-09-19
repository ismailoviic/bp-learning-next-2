/**
 * Phase 2 — Learning progress tracker for new lessons and scenarios.
 *
 * Separate from Phase 1 progress (KEY = "bp-learning-eagle-v2").
 * Key: "bp-learning-p2-v1"
 *
 * Pattern mirrors progress.mjs exactly for consistency.
 */

import { lessons } from "./lessons.mjs";
import { scenarios } from "./scenarios.mjs";

export const P2_KEY = "bp-learning-p2-v1";

export const p2fresh = () => ({
  version: 1,
  lessonsRead: [],     // lesson ids marked as read
  scenarioSteps: {},   // { [stepId]: { attempts: string[], done: bool, ack: bool } }
});

export function p2sanitize(raw) {
  if (!raw || raw.version !== 1) throw new Error("Invalid p2 saved format");
  const state = p2fresh();

  const validLessonIds = lessons.map((l) => l.id);
  state.lessonsRead = [
    ...new Set(
      (Array.isArray(raw.lessonsRead) ? raw.lessonsRead : []).filter((id) =>
        validLessonIds.includes(id),
      ),
    ),
  ];

  // Collect all valid step IDs
  const allSteps = scenarios.flatMap((s) => s.steps);
  for (const step of allSteps) {
    const entry = raw.scenarioSteps?.[step.id];
    if (!entry) continue;
    const validAnswerIds = step.answers.map((a) => a.id);
    const validAttempt = (id) => validAnswerIds.includes(id);
    if (
      !Array.isArray(entry.attempts) ||
      !entry.attempts.length ||
      !entry.attempts.every(validAttempt)
    )
      continue;
    state.scenarioSteps[step.id] = {
      attempts: entry.attempts.slice(0, 50),
      done: entry.done === true,
      ack: entry.ack === true,
    };
  }
  return state;
}

export function p2answer(state, stepId, value) {
  const old = state.scenarioSteps[stepId];
  return {
    ...state,
    scenarioSteps: {
      ...state.scenarioSteps,
      [stepId]: {
        attempts: [...(old?.attempts || []), value],
        done: false,
        ack: false,
      },
    },
  };
}

export function p2complete(state, stepId) {
  return {
    ...state,
    scenarioSteps: {
      ...state.scenarioSteps,
      [stepId]: { ...state.scenarioSteps[stepId], done: true, ack: true },
    },
  };
}

export function p2markRead(state, lessonId) {
  if (state.lessonsRead.includes(lessonId)) return state;
  return { ...state, lessonsRead: [...state.lessonsRead, lessonId] };
}

/** Count completed steps for a scenario. */
export function scenarioProgress(state, scenarioId) {
  const scenario = scenarios.find((s) => s.id === scenarioId);
  if (!scenario) return { done: 0, total: 0 };
  const done = scenario.steps.filter(
    (step) => state.scenarioSteps[step.id]?.done,
  ).length;
  return { done, total: scenario.steps.length };
}

/** First-attempt score across all steps of a scenario. */
export function scenarioFirstScore(state, scenarioId) {
  const scenario = scenarios.find((s) => s.id === scenarioId);
  if (!scenario) return 0;
  return scenario.steps.filter((step) => {
    const entry = state.scenarioSteps[step.id];
    return entry?.attempts[0] === step.correct;
  }).length;
}

/** Overall Phase 2 completion percentage (0–100). */
export function p2percent(state) {
  const totalLessons = lessons.length;
  const totalSteps = scenarios.reduce((n, s) => n + s.steps.length, 0);
  const doneLessons = state.lessonsRead.length;
  const doneSteps = Object.values(state.scenarioSteps).filter(
    (e) => e.done,
  ).length;
  const total = totalLessons + totalSteps;
  if (total === 0) return 0;
  return Math.round(((doneLessons + doneSteps) / total) * 100);
}
