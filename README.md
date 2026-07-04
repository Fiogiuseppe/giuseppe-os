# Giuseppe OS v2.0

A Personal Decision Intelligence System — Giuseppe's trusted decision partner for improving the quality of life decisions over decades.

## Core idea

Not the smartest AI — the decision partner Giuseppe trusts the most. Success is measured by better life decisions over time, not usage.

**North Star:** PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA.

**Primary question:** Knowing everything Giuseppe has lived, everything happening in the world, and everything he wants to become — what decision has the highest probability of improving his future?

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Quality check

```bash
npm run quality:check
```

Runs typecheck, Playwright e2e tests (40), and production build.

## Structure

- `/app` — Next.js frontend and `/api/brain` endpoint
- `/engine` — decision, awareness, potential engines
- `/lib/brain` — Executive Brain, context builder, AI providers, memory
- `/lib/architecture` — v2 pipeline registry and primary questions
- `/lib/identity` — Identity Layer types (meaning above memory)
- `/lib/digital-twin` — Digital Twin types (probabilistic model)
- `/lib/goal-validation` — Goal Validation types
- `/lib/decision-simulator` — Decision Simulator types
- `/lib/pattern` — Pattern Engine types (latent pattern discovery)
- `/lib/voice-dna` — Voice DNA types (Giuseppe's writing/speaking voice)
- `/lib/timeline` — Living Timeline types (life event observation)
- `/lib/reality` — Reality layer stubs (future live connectors)
- `/memory` — Giuseppe Brain, working memory, long-term memory
- `/agents` — six counsellor personas
- `/docs` — architecture, constitution, project memory
- `/e2e` — Playwright tests

## Brain API

```bash
curl -X POST http://localhost:3000/api/brain \
  -H "Content-Type: application/json" \
  -d '{"intent":"query","message":"What is my North Star?"}'
```

Intents: `auto`, `query`, `decide`, `reflect`, `awareness`, `potential`, `learn`

## Working on Giuseppe OS

Every new development session begins by reading the **constitution documents** — not conversation history. The repository is the source of truth; the conversation is temporary.

**Start here:** [`docs/CURSOR_STARTUP.md`](docs/CURSOR_STARTUP.md)

Read these before touching code:

1. [`docs/PRODUCT_CONSTITUTION.md`](docs/PRODUCT_CONSTITUTION.md) — product philosophy
2. [`docs/ENGINEERING_CONSTITUTION.md`](docs/ENGINEERING_CONSTITUTION.md) — engineering rules
3. [`docs/DESIGN_DNA.md`](docs/DESIGN_DNA.md) — permanent design language
4. [`docs/00_PROJECT_STATE.md`](docs/00_PROJECT_STATE.md) — vision and architecture
5. [`docs/01_CURRENT_STATUS.md`](docs/01_CURRENT_STATUS.md) — what exists right now
6. [`docs/02_NEXT_STEPS.md`](docs/02_NEXT_STEPS.md) — current priorities

**Quality loop (no shortcuts):** Read Constitution → Understand Current State → Implement → Run Tests → Fix → Design Review PDF (if UI release) → Commit → Push.

**Mission gate:** Before any implementation, ask: *Does this improve the quality of Giuseppe's decisions or his long-term trajectory?* If no, rethink.

**Pivot docs:** [`docs/DECISION_INTELLIGENCE_PIVOT.md`](docs/DECISION_INTELLIGENCE_PIVOT.md) · [`docs/ARCHITECTURE_V2.md`](docs/ARCHITECTURE_V2.md)

Also see [`docs/04_CURSOR_WORKFLOW.md`](docs/04_CURSOR_WORKFLOW.md) for detailed workflow and [`docs/03_DECISIONS_LOG.md`](docs/03_DECISIONS_LOG.md) for architecture decisions.

## Design reviews

After major releases, generate a visual review PDF:

```bash
npm run design:review
```

Output: `docs/reviews/DESIGN_REVIEW_<version>.pdf`

## Production

https://giuseppe-os.vercel.app
