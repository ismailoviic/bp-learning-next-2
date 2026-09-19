import test from "node:test";
import assert from "node:assert/strict";
import {
  fresh,
  answer,
  complete,
  percent,
  nextStep,
  sanitize,
  firstScore,
} from "../lib/progress.mjs";
import { dialogue, checks } from "../lib/content.mjs";
test("retry preserves first attempt, resume advances only after acknowledgement", () => {
  let s = fresh();
  s.prep = ["langue", "expliquer", "comprendre"];
  s = answer(s, "simulation", "preference", "a");
  s = answer(s, "simulation", "preference", "b");
  assert.equal(firstScore(s, "simulation", dialogue), 0);
  assert.equal(s.simulation.preference.attempts.length, 2);
  assert.equal(nextStep(s), "simulation");
  s = complete(s, "simulation", "preference");
  assert.equal(percent(s), 44);
  assert.deepEqual(sanitize(s), s);
});
test("full completion is distinct from accuracy", () => {
  let s = fresh();
  s.prep = ["langue", "expliquer", "comprendre"];
  for (const [kind, list] of [
    ["simulation", dialogue],
    ["checks", checks],
  ])
    for (const q of list) {
      s = answer(s, kind, q.id, q.answers.find((a) => a.id !== q.correct).id);
      s = complete(s, kind, q.id);
    }
  assert.equal(percent(s), 100);
  assert.equal(firstScore(s, "simulation", dialogue), 0);
  assert.equal(nextStep(s), "bilan");
});
test("storage sanitizer rejects schema and removes invalid records", () => {
  assert.throws(() => sanitize({ version: 1 }));
  const s = sanitize({
    version: 2,
    prep: ["langue", "langue", "bad"],
    simulation: { preference: { attempts: ["bogus"], done: true } },
  });
  assert.deepEqual(s.prep, ["langue"]);
  assert.deepEqual(s.simulation, {});
});
