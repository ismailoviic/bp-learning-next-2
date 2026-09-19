# BP Learning — Phase 1 / Eagle Day

French learner experience for Moroccan pharmacy employees, rebuilt in Next.js. Fictional communication training only; no medication advice, OCR, AI, authentication or backend.

## Start the source project

Requires Node.js 20.9+ and npm (Node 22 LTS recommended).

```sh
npm ci
npm run dev
```

Open http://localhost:3000. No environment variables or API keys required.

## Production / fastest demo

The `out/` folder is an included production static export. To preview without installing Node dependencies:

```sh
python3 -m http.server 8089 --directory out
```

Open http://localhost:8089. Do not open index.html as a file URL.

To rebuild the export:

```sh
npm run build
npm test
```

Host the contents of `out/` at the root of any static website, or import the source into Vercel using Next.js defaults. No live deployment is included.

## Architecture

- `app/`: Next.js App Router entry, document metadata and responsive design tokens/styles.
- `components/LearningApp.jsx`: client-side app shell, learning views, reusable motion controls and interaction state.
- `components/Orb.jsx`: lazy-loaded React Three Fiber scene, pointer-responsive geometry, shader background, non-WebGL fallback. Disabled on small screens and reduced-motion preferences.
- `lib/content.mjs`: authored, deterministic French content and answer-specific explanations. Stable IDs, not answer positions, determine correctness.
- `lib/progress.mjs`: pure state transitions, validation, completion and first-attempt scoring.
- `tests/`: meaningful state-integrity tests using Node's built-in runner.
- `baseline/`: untouched supplied implementation for comparison.
- `evidence/`: rendered captures and QA notes where available.

One Next.js page contains hash-addressable learner views (`#accueil`, `#preparation`, `#simulation`, `#verification`, `#bilan`). Browser Back works. This deliberately avoids server/data complexity for a nine-activity local learning exercise.

## Learning model

Preparation is recommended, not a compulsory checkbox gate. Each simulation/check answer gives persistent, specific feedback. A learner can retry or acknowledge feedback and move on. First attempts remain in the final review even after retries. Completion counts acknowledged activities; it is not a mastery score. Results label unanswered activities and distinguish corrected practice from first-attempt success.

Saved state uses `bp-learning-eagle-v2` in localStorage. It does not migrate the old starter's differently structured progress. Storage errors show a retryable warning while in-memory interaction continues. No cross-device synchronization or multi-user identity. Refresh cannot preserve unsaved data if browser storage fails. Do not use real patient data.

## Visual choices

Plum, lilac, white and small green/amber learning accents. A pointer-responsive abstract 3D sculpture and fluid shader are limited to the overview. Framer Motion handles spring controls, section reveals and route transitions. Glass treatment is confined to navigation and overlays for readable content. No scroll hijacking or long cinematic sequences during exercises. Mobile uses bottom navigation and no WebGL. Motion respects operating-system reduced-motion preferences. Fonts use Google Fonts with system fallbacks if unavailable.

## Product references

1. Duolingo Roleplay: https://blog.duolingo.com/duolingo-max/ — contextual conversation practice followed by feedback. Adapted as deterministic, reviewable explanations; no claim of an AI conversation.
2. Moodle quiz settings: https://docs.moodle.org/502/en/Quiz_settings — answer-specific feedback, interactive multiple tries, first-attempt grading and review. Adapted as retry without losing the first attempt, separated from activity completion.

These are product-pattern references inspected through official documentation, not evidence of user testing or efficacy.

## Human test still required

Ask a participant to make an unsuitable choice, explain why it was unsuitable, retry, refresh and locate the original attempt in the review. Observe without coaching. Record actual difficulties, changes and time; do not claim a human test happened until it has.

## Provenance

Based on the supplied BP Learning Moroccan frontend candidate ZIP. Original files are preserved in `baseline/`. Added explanations and French wording are authored practice material, not professional clinical content. The learner and customer are fictitious. The original 15-minute duration remains explicitly indicative and has not been measured.
