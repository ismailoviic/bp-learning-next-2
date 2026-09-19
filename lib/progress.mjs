import { dialogue, checks, principles } from "./content.mjs";
export const KEY = "bp-learning-eagle-v2";
export const fresh = () => ({
  version: 2,
  prep: [],
  simulation: {},
  checks: {},
});
export function sanitize(raw) {
  if (!raw || raw.version !== 2) throw new Error("Invalid saved format");
  const state = fresh();
  state.prep = [
    ...new Set(
      (Array.isArray(raw.prep) ? raw.prep : []).filter((id) =>
        principles.some((p) => p.id === id),
      ),
    ),
  ];
  for (const [name, list] of [
    ["simulation", dialogue],
    ["checks", checks],
  ])
    for (const q of list) {
      const entry = raw[name]?.[q.id];
      if (!entry) continue;
      const valid = (id) => q.answers.some((a) => a.id === id);
      if (
        !Array.isArray(entry.attempts) ||
        !entry.attempts.length ||
        !entry.attempts.every(valid)
      )
        continue;
      state[name][q.id] = {
        attempts: entry.attempts.slice(0, 50),
        done: entry.done === true,
        ack: entry.ack === true,
      };
    }
  return state;
}
export function answer(state, kind, id, value) {
  const old = state[kind][id];
  return {
    ...state,
    [kind]: {
      ...state[kind],
      [id]: {
        attempts: [...(old?.attempts || []), value],
        done: false,
        ack: false,
      },
    },
  };
}
export function complete(state, kind, id) {
  return {
    ...state,
    [kind]: {
      ...state[kind],
      [id]: { ...state[kind][id], done: true, ack: true },
    },
  };
}
export function percent(s) {
  return Math.round(
    ((s.prep.length +
      Object.values(s.simulation).filter((x) => x.done).length +
      Object.values(s.checks).filter((x) => x.done).length) /
      9) *
      100,
  );
}
export function nextStep(s) {
  if (s.prep.length < 3) return "preparation";
  if (dialogue.some((q) => !s.simulation[q.id]?.done)) return "simulation";
  if (checks.some((q) => !s.checks[q.id]?.done)) return "verification";
  return "bilan";
}
export function firstScore(s, kind, list) {
  return list.filter((q) => s[kind][q.id]?.attempts[0] === q.correct).length;
}
