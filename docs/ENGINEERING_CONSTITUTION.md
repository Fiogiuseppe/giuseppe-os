# Giuseppe OS — Engineering Constitution

**Status:** Permanent. Non-negotiable for every implementation.  
**Purpose:** Define how code is written, tested, committed, and maintained in Giuseppe OS.

---

## Engineering Philosophy

Giuseppe OS is long-lived personal infrastructure. Code must be **readable, modular, testable, and honest** about what it does. Prefer clarity over cleverness. Prefer small correct changes over large speculative refactors.

The repository is the source of truth. Conversations are temporary.

---

## Mandatory Quality Gate

Every implementation must pass the full quality check **before committing**:

```bash
npm run quality:check
```

This runs, in order:

1. **TypeScript** — `npm run typecheck`
2. **Playwright** — `npm run test:e2e` (40 tests)
3. **Production build** — `npm run build`

**Never commit broken code.**  
**Never skip hooks** unless Giuseppe explicitly requests it.  
**Fix every failure** before pushing.

For UI or design changes that ship as a release, also run:

```bash
npm run design:review
```

---

## Architecture Rules

### Decision Intelligence pipeline (v2 target)

Canonical engine order lives in `lib/architecture/pipeline.ts`:

```
Reality → Personal Relevance → Identity Layer → Digital Twin →
Goal Validation → Trajectory → Decision Simulator → Prediction →
Quality → Daily Brief → Learning (feedback loop)
```

**Implemented today:** Reality, Personal Relevance, Trajectory, Quality, Daily Brief  
**Foundation only (types, no runtime yet):** Identity, Digital Twin, Goal Validation, Decision Simulator, Prediction

Do not implement engines ahead of their documented contract without a decision in [`docs/03_DECISIONS_LOG.md`](03_DECISIONS_LOG.md).

### Preserve the Executive Brain spine

- UI and engines must not call AI providers directly.
- Intelligence flows through `lib/brain/executiveBrain.ts` and `POST /api/brain`.
- Daily Brief currently uses `POST /api/todays-letter` — known debt; must converge on shared pipeline context (Identity + Twin) in v2.
- Context reaches the AI only through the Context Builder — never full memory dumps.
- The Mission Gate runs before responses are returned.

Authoritative references:

- [`docs/ARCHITECTURE_V2.md`](ARCHITECTURE_V2.md) — v2 target state
- [`docs/GIUSEPPE_OS_ARCHITECTURE.md`](GIUSEPPE_OS_ARCHITECTURE.md) — v1 detail
- [`docs/DECISION_INTELLIGENCE_PIVOT.md`](DECISION_INTELLIGENCE_PIVOT.md) — philosophy migration
- [`docs/INTELLIGENCE_FOUNDATION.md`](INTELLIGENCE_FOUNDATION.md)

### Data layer separation

| Layer | Location | Responsibility |
|-------|----------|----------------|
| Memory (facts) | `memory/` | Observed events, decisions, lessons |
| Identity (meaning) | `lib/identity/` | Reinterpretation above memory |
| Digital Twin (model) | `lib/digital-twin/` | Probabilistic evolving model |
| Constitution | `memory/giuseppe_brain.json`, `lib/philosophy/` | Fixed principles |

**Do not collapse Memory, Identity, and Digital Twin into one store.**

### Preserve modularity

| Layer | Location | Responsibility |
|-------|----------|----------------|
| UI | `app/` | Presentation, progressive disclosure, user interaction |
| API | `app/api/` | HTTP entry (brain, todays-letter) |
| Executive Brain | `lib/brain/` | Orchestration, routing, memory, providers |
| Engines | `engine/`, `lib/brain/engines/`, `lib/*/` | Domain logic |
| Architecture | `lib/architecture/` | Pipeline registry, primary questions |
| Reality | `lib/reality/` | Live connectors (partial) |
| Agents | `agents/` | Counsellor personas |

Do not collapse these boundaries without an architecture decision logged in [`docs/03_DECISIONS_LOG.md`](03_DECISIONS_LOG.md).

### Keep engines isolated

Engines produce structured outputs. They do not know about React, CSS, or API transport. The UI consumes engine results; the Executive Brain coordinates them.

### Preserve provider independence

AI providers live in `lib/brain/providers/`. Swapping Claude for another provider must not require UI changes. Never hard-code provider names or API keys in user-visible copy or client bundles.

---

## Security and Privacy Rules

### Never expose secrets

- No API keys, tokens, or credentials in code, commits, logs, or UI.
- Use environment variables (`ANTHROPIC_API_KEY`, `BRAIN_AI_PROVIDER`, etc.).
- Never commit `.env` files or credential JSON.

### Never expose sensitive personal data

- Financial numbers, account details, and private identifiers must be redacted or blurred in the UI by default.
- Demo and test modes use isolated memory paths (`working_memory.test.json`, `long_term.test.json`).
- Do not log personal data to console in production paths.

---

## Code Quality Rules

### Keep code readable

- Match existing naming, types, import style, and file layout.
- Minimize diff scope — solve the stated problem, nothing more.
- Do not add abstractions for one-time use.
- Comments explain *why*, not *what*.

### Avoid unnecessary complexity

- No premature generalization.
- No new dependencies without clear justification.
- No bundling unrelated changes in one commit.

### Update documentation when architecture changes

If you change architecture, engines, API contracts, or deployment requirements, update in the **same commit**:

- [`docs/00_PROJECT_STATE.md`](00_PROJECT_STATE.md)
- [`docs/01_CURRENT_STATUS.md`](01_CURRENT_STATUS.md)
- [`docs/03_DECISIONS_LOG.md`](03_DECISIONS_LOG.md) (for significant decisions)
- [`docs/ARCHITECTURE_V2.md`](ARCHITECTURE_V2.md) (when v2 structure changes)

Documentation-only tasks must not touch `app/page.tsx` or application code unless explicitly requested.

---

## Testing Rules

### Playwright is the contract

The e2e suite in `e2e/` defines acceptable product behavior. If tests fail, the implementation is wrong — not the tests — unless Giuseppe explicitly changes the contract.

Key non-regression areas:

- Navigation and viewport lock on desktop
- Progressive disclosure behavior
- Finance privacy blur
- North Star visibility rules
- Brain API response shape
- Footer manifesto visibility

### Test memory isolation

Playwright runs with isolated test memory. Do not point tests at production personal data.

---

## Commit and Release Rules

1. Run `npm run quality:check` — all green.
2. Update docs if state or architecture changed.
3. Write a concise commit message focused on **why**.
4. Push only when Giuseppe asks, or when the task explicitly includes push.
5. For major UI releases: generate `docs/reviews/DESIGN_REVIEW_<version>.pdf`.

See [`docs/RELEASE_CHECKLIST.md`](RELEASE_CHECKLIST.md) for release steps.

---

## Engineering Decision Test

Before merging any implementation, ask:

1. Does it pass typecheck, Playwright, and build?
2. Does it preserve Executive Brain architecture?
3. Does it respect Memory / Identity / Twin separation?
4. Does it keep engines isolated and providers swappable?
5. Does it avoid exposing secrets or sensitive data?
6. Does it update docs if the system changed?

If any answer is no, fix it before committing.

---

## Related Documents

- [`docs/CURSOR_STARTUP.md`](CURSOR_STARTUP.md) — session startup and quality loop
- [`docs/04_CURSOR_WORKFLOW.md`](04_CURSOR_WORKFLOW.md) — detailed Cursor workflow
- [`docs/QUALITY_SYSTEM.md`](QUALITY_SYSTEM.md) — quality system overview
