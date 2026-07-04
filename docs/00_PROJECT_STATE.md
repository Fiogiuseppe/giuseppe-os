# Giuseppe OS — Project State

**Version:** 2.0 (Personal Decision Intelligence System — foundations)  
**Last updated:** July 2026  
**Repository:** Private — source of truth for all project knowledge  

---

## What Giuseppe OS Is

Giuseppe OS is a **Personal Decision Intelligence System** — the **decision partner Giuseppe trusts the most**.

Its purpose: **continuously improve the quality of Giuseppe's decisions** and increase the probability he builds the life he truly wants — over **decades**, not today.

Success is measured by **better life decisions over time** — not usage.

### Golden Rule

> *If Giuseppe follows this advice, will Future Giuseppe most likely thank Present Giuseppe ten years from now?*

If not — silence.

### Daily Brief (judgement, not information)

> *If the wisest version of Giuseppe had five minutes with Present Giuseppe this morning — what would he say?*

---

## Vision

Close the gap between **who Giuseppe chose to become** and **the decisions he makes each day**.

Giuseppe OS exists to:

1. **Filter reality** — not summarize the news; answer why it matters for Giuseppe.
2. **Build a Digital Twin** — probabilistic model that evolves (foundations only today).
3. **Interpret through Identity** — meaning above facts (foundations only today).
4. **Challenge wrong goals** — truth over blind optimization (philosophy encoded; engine stubbed).
5. **Protect trajectory** — ten-year filter on every recommendation.
6. **Compound learning** — every interaction improves the model over time.
7. **Build freedom by 2036** — money is fuel, not the destination.

---

## North Star

> **PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA.**

## 2036 Mission

> **Costruire una persona che possa scegliere se lavorare oppure no.**

---

## Architecture (v2 foundations)

```
Today (Conversation)
     ↓
Quality Engine                           ← lib/briefing/quality.ts
     ↓
Daily Brief Generator                    ← lib/todays-letter/
     ↓
Trajectory Engine                        ← lib/trajectory/
     ↓
Goal Validation Engine (stub)              ← lib/goal-validation/
     ↓
Digital Twin (stub)                      ← lib/digital-twin/
     ↓
Identity Layer (stub)                    ← lib/identity/
     ↓
Personal Relevance Engine (max 3)        ← lib/relevance/
     ↓
Reality Engine                           ← lib/reality/
     ↓
Memory (facts) + Constitution            ← memory/
     ↑
Learning Engine (feedback loop)          ← lib/learning/
```

**Pipeline registry:** `lib/architecture/pipeline.ts`  
**Today API:** `POST /api/todays-letter`  
**Brain API:** `POST /api/brain` (Decisions, Awareness, Potential, Learning)

Philosophy and capitals: `lib/philosophy/core.ts`  
Full pivot narrative: [`docs/DECISION_INTELLIGENCE_PIVOT.md`](DECISION_INTELLIGENCE_PIVOT.md)  
Target architecture: [`docs/ARCHITECTURE_V2.md`](ARCHITECTURE_V2.md)

---

## Main Engines

| Engine | Location | Status |
|--------|----------|--------|
| **Reality Engine** | `lib/reality/engine.ts` | Partial |
| **Personal Relevance Engine** | `lib/relevance/engine.ts` | Shipped |
| **Identity Layer** | `lib/identity/` | Types only |
| **Digital Twin** | `lib/digital-twin/` | Types only |
| **Goal Validation Engine** | `lib/goal-validation/` | Types only |
| **Trajectory Engine** | `lib/trajectory/engine.ts` | Shipped |
| **Decision Simulator** | `lib/decision-simulator/` | Types only |
| **Pattern Engine** | `lib/pattern/` | Types only |
| **Voice DNA** | `lib/voice-dna/` | Types only |
| **Living Timeline** | `lib/timeline/` | Types only |
| **Quality Engine** | `lib/briefing/quality.ts` | Shipped |
| **Daily Brief Generator** | `lib/todays-letter/generate.ts` | Shipped |
| **Executive Brain** | `lib/brain/executiveBrain.ts` | Shipped |
| **Learning Engine** | `lib/learning/`, `lib/brain/engines/` | Partial |

---

## Eight Capitals

Every recommendation must improve at least one:

- Wealth Capital
- Knowledge Capital
- Creative Capital
- Relationship Capital
- Health Capital
- Freedom Capital
- Time Capital
- Reputation Capital

---

## Implementation Roadmap

| Phase | Status |
|-------|--------|
| 1 — Decision Intelligence foundations (docs + types) | **Shipped** |
| 2 — Identity Layer + Digital Twin runtime | Planned |
| 3 — Goal Validation in pipeline | Planned |
| 4 — Decision Simulator (important decisions) | Planned |
| 5 — Prediction + calibration | Planned |
| 6 — Learning loop → Twin update | Scaffolded |
| 7 — Supabase persistence | Planned |
| 8 — Notification Engine | **Deferred** |

---

## Core Documents

| Document | Purpose |
|----------|---------|
| [`DECISION_INTELLIGENCE_PIVOT.md`](DECISION_INTELLIGENCE_PIVOT.md) | Philosophy migration — how every section changes |
| [`ARCHITECTURE_V2.md`](ARCHITECTURE_V2.md) | Target architecture |
| [`PRODUCT_CONSTITUTION.md`](PRODUCT_CONSTITUTION.md) | Non-negotiable product principles |
| [`03_DECISIONS_LOG.md`](03_DECISIONS_LOG.md) | Running architecture decisions |
| [`DESIGN_DNA.md`](DESIGN_DNA.md) | Visual and UX principles |
| [`01_CURRENT_STATUS.md`](01_CURRENT_STATUS.md) | What exists right now |
| [`02_NEXT_STEPS.md`](02_NEXT_STEPS.md) | Implementation priorities |
