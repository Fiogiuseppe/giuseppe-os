# Giuseppe OS v1.0

A Personal Intelligence Operating System — not a chatbot — for building a life aligned with purpose, freedom, reputation, creativity, and financial independence.

## Core idea

A thinking system that remembers who Giuseppe chose to become and helps him decide, act, review, and learn in alignment with that choice.

**North Star:** PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA.

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

## Working with Cursor

Future Cursor sessions should **begin by reading the project memory docs** — the repository is the source of truth, not conversation history:

1. [`docs/00_PROJECT_STATE.md`](docs/00_PROJECT_STATE.md) — vision, architecture, design direction
2. [`docs/01_CURRENT_STATUS.md`](docs/01_CURRENT_STATUS.md) — what exists right now
3. [`docs/02_NEXT_STEPS.md`](docs/02_NEXT_STEPS.md) — implementation priorities
4. [`docs/04_CURSOR_WORKFLOW.md`](docs/04_CURSOR_WORKFLOW.md) — how to work on this repo

Also see [`docs/03_DECISIONS_LOG.md`](docs/03_DECISIONS_LOG.md) for architecture decisions and [`docs/INTELLIGENCE_FOUNDATION.md`](docs/INTELLIGENCE_FOUNDATION.md) for the v1.0 pipeline spec.

## Production

https://giuseppe-os.vercel.app
