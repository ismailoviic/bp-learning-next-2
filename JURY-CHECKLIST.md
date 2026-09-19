# BP Learning — Phase 1 handoff checklist

## Built
- [x] Rebuilt the supplied frontend in Next.js / React with a static production export.
- [x] Separated course content, pure progress/scoring logic, UI and optional 3D scene.
- [x] Preserved the original starter in `baseline/` for an honest comparison.
- [x] French interface with consistent “vous” wording and short action labels.
- [x] Clear overview → essentials → simulation → checks → review journey.
- [x] Resume CTA selects the next unfinished stage; each exercise restores its pending step and feedback.
- [x] Answer-specific explanations replace the original misleading universal toast.
- [x] Feedback remains visible until the learner retries or continues.
- [x] Wrong answers can be retried without resetting the course.
- [x] First-attempt results remain visible after correction; activity completion is separate from accuracy.
- [x] Full decision review includes original choice, explanation, recommended response and practice action.
- [x] Correct options no longer always appear first.
- [x] Preparation consistently presented as recommended rather than a bypassable gate.
- [x] Storage failures show a retryable message while the activity continues in memory.
- [x] Malformed saved data is handled; destructive reset requires confirmation.
- [x] Keyboard focus moves to feedback; reset dialog supports Escape and traps Tab.
- [x] Responsive layout, mobile bottom navigation and shorter mobile scenario framing.
- [x] Original plum/lilac visual direction, glass navigation and restrained Framer Motion transitions.
- [x] Pointer-responsive React Three Fiber sculpture and fluid shader on desktop overview.
- [x] WebGL disabled on mobile/reduced motion; non-WebGL fallback available.
- [x] Production build, lockfile, setup instructions and a prebuilt runnable demo included.

## Present to the jury
- [ ] Show the original: select “Tout est déjà écrit…” and point out the unrelated positive explanation.
- [ ] Show the rebuild: select the same answer, read the specific explanation and retry.
- [ ] Refresh during feedback: demonstrate recovery without losing the pending answer.
- [ ] Finish and show that a correction does not erase the first attempt.
- [ ] Explain why one explicit Continue action is better than automatic advancement during teaching feedback.
- [ ] Show mobile and keyboard interaction, not only the overview animation.
- [ ] Show two references: Duolingo contextual roleplay/review and Moodle answer feedback/multiple tries (links in README).
- [ ] Show `evidence/` before/after captures and automated results.

## Actual iteration / corrections
- [x] Dependency setup first failed because React's floating version exceeded the 3D library peer range. Pinned compatible React/Next/Fiber versions and rebuilt successfully.
- [x] Initial review navigation could reopen an earlier unfinished question rather than the chosen review item. Added an explicit practice target.
- [x] Browser QA exposed a skip-link/hash-navigation conflict. The skip action now moves focus directly to main without changing the learner route.
- [x] Mobile visual inspection showed too much scenario framing before the question. Reduced framing and title density to bring the activity higher on screen.

## Be honest about limitations
- [ ] Ask another participant to test the path and record what changed afterward. Automated checks are not a substitute for this required human test.
- [ ] This is communication practice with fictional people/content, not a clinical tool.
- [ ] No Phase 2 checker, prescription scanning, medication recommendations or integrations included.
- [ ] One sample course; no real accounts, backend, certificates or cross-device synchronization.
- [ ] Original starter progress is not migrated to the new schema.
- [ ] A browser storage failure means unsaved in-memory progress can be lost on refresh.
- [ ] Google Fonts needs connectivity; system fonts are used if unavailable.
- [ ] The 15-minute duration is inherited and labelled indicative; no completion-time improvement is claimed.
- [ ] No real learner conversion, satisfaction, revenue or mastery gains have been measured.
- [ ] The 3D hero is decorative, lazy-loaded and excluded from the exercise screens.
- [ ] No public deployment was performed; use the included local demo or deploy the source/static export.

## Five-minute human test
- [ ] Ask: “Choose a response, recover from a mistake, finish the exercise and find your original answer.”
- [ ] Watch silently; note hesitation and misunderstood wording.
- [ ] Check the same task on a phone.
- [ ] Record the observed issue, the change you made and whether a second attempt improved.

## Suggested fireside sequence (6 minutes + questions)
- [ ] 0:00–0:45: pharmacy employee, communication task, baseline failure.
- [ ] 0:45–3:00: demonstrate wrong answer, explanation, retry, resume and review.
- [ ] 3:00–4:00: mobile/keyboard and storage-error evidence.
- [ ] 4:00–5:00: research pattern and genuine failed attempt/correction.
- [ ] 5:00–6:00: architecture, human-test findings and remaining gaps.
