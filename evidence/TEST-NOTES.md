# Verification notes

## Executed
- Production `npm run build`: passed (Next.js 15.5.25 static export).
- `npm test`: 3 passing state-integrity tests.
- Headless Chromium browser flow: 12 checks passed; no application page errors.
- Desktop captures at 1440px; mobile captures at 390px.
- Visually inspected overview, recovery and mobile exercise captures.
- Desktop WebGL sculpture rendered successfully in the captured overview.

## Browser checks
1. Complete preparation, three simulation turns and three checks.
2. An unsuitable answer receives its specific explanation.
3. Feedback receives keyboard focus.
4. Refresh restores pending feedback.
5. Retry keeps the first attempt; final simulation score remains 2/3 after correction.
6. Completion reaches 100% independently of accuracy.
7. Reset can be cancelled with Escape and returns focus to its trigger.
8. Mobile overview and exercise have no horizontal overflow at 390px.
9. Simulated localStorage write failure warns the learner while feedback still works.
10. Corrupt localStorage triggers a recoverable warning.
11. Reduced-motion preference removes the WebGL canvas.
12. Keyboard skip link moves focus directly to main.

`automated-results.json` records the final browser run. The optional browser harness needs Playwright and a Chromium binary; those large testing dependencies are not included in the application dependency tree. Environment-specific module paths can be supplied using the variables documented in the harness. Ordinary setup, build and unit tests do not require them.

## Failures and corrections
- Floating React selected 19.3, outside Fiber's supported range. Pinned React 19.2.8, React DOM 19.2.8, Fiber 9.7.0 and Next 15.5.25.
- Skip-link originally changed the app hash and was interpreted as a learner route. Changed to direct focus transfer; verified with keyboard activation.
- Review practice initially lacked an explicit target. Added a preferred-question target to the exercise renderer.
- Initial mobile framing used too much vertical space. Reduced title density and condensed repeated context above the question.
- Test selector `role=alert` initially matched both the app warning and Next's route announcer. Narrowed the test to the visible app warning; this was a harness issue, not a product defect.

## Not executed / not claimed
- No test with another person yet. This remains a hackathon submission requirement.
- No real-device Safari/iOS testing, full screen-reader audit, formal WCAG certification, clinical review or learning efficacy study.
- No timed before/after study, revenue claim or completion-rate claim.
- Storage unavailable after refresh cannot preserve in-memory work; warning states this.
- Mobile and reduced-motion deliberately suppress the decorative 3D renderer.

## Capture guide
- `before-overview.png` / `after-overview.png`: overall experience.
- `before-wrong-feedback.png` / `after-recovery.png`: core learning defect and repair.
- `after-review.png`: completion separate from first-attempt performance.
- `after-mobile.png` / `after-mobile-exercise.png`: responsive layout.
- `after-storage-error.png`: recoverable persistence failure.

Full-page captures include fixed mobile bottom navigation at the viewport position; content below it is reachable by scrolling.
