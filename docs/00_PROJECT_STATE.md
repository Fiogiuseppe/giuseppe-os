# Giuseppe OS — Project State

**Version:** 1.7 (Personal Intelligence OS — Daily Brief)  
**Last updated:** July 2026  
**Repository:** Private — source of truth for all project knowledge  

---

## What Giuseppe OS Is

Giuseppe OS is a **Personal Intelligence Operating System** — not a productivity app, not a dashboard, not an AI assistant.

Its purpose is simple: **increase the probability that Giuseppe lives an extraordinary life.**

It protects Giuseppe's **trajectory** — not his inbox, calendar, tasks, or productivity. The AI is one component. The intelligence pipeline is the product.

Before anything is shown, the system asks:

> *Will Giuseppe thank himself in ten years for following this recommendation?*

If not, silence is better than noise.

---

## Vision

Close the gap between **who Giuseppe chose to become** and **what he does each day**.

Giuseppe OS exists to:

1. **Filter reality** — not summarize the news; answer why it matters for Giuseppe.
2. **Reduce noise** — max three recommendations per Daily Brief.
3. **Protect attention** — ignore is as valuable as opportunity.
4. **Optimize trajectory** — freedom, compounding, ownership, deep work, meaning.
5. **Compound learning** — understand Giuseppe better every week.
6. **Build freedom by 2036** — money is fuel, not the destination.

---

## North Star

> **PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA.**

## 2036 Mission

> **Costruire una persona che possa scegliere se lavorare oppure no.**

---

## Architecture (v1.7)

```
Today (Home)
     ↓
Daily Brief Generator                    ← lib/todays-letter/
     ↓
Quality Engine                           ← lib/briefing/quality.ts
     ↓
Trajectory Engine                        ← lib/trajectory/
     ↓
Personal Relevance Engine (max 3)        ← lib/relevance/
     ↓
Reality Engine                           ← lib/reality/
     ↓
Giuseppe Brain + Constitution            ← memory/giuseppe_brain.json
```

**Today API:** `POST /api/todays-letter`  
**Brain API:** `POST /api/brain` (Decisions, Awareness, Potential, Learning)

Philosophy and capitals: `lib/philosophy/core.ts`  
Full product constitution: [`docs/PRODUCT_CONSTITUTION.md`](PRODUCT_CONSTITUTION.md)

---

## Main Engines

| Engine | Location | Role |
|--------|----------|------|
| **Reality Engine** | `lib/reality/engine.ts` | Collect and filter world signals |
| **Personal Relevance Engine** | `lib/relevance/engine.ts` | Filter to Giuseppe-specific, max 3 signals |
| **Trajectory Engine** | `lib/trajectory/engine.ts` | Ten-year decision filter |
| **Quality Engine** | `lib/briefing/quality.ts` | Gate Daily Brief before publish |
| **Daily Brief Generator** | `lib/todays-letter/generate.ts` | Today page intelligence |
| **Executive Brain** | `lib/brain/executiveBrain.ts` | Orchestrator for `/api/brain` |
| **Learning Engine** | `lib/brain/engines/learningEngine.ts` | Pattern analysis (briefing feedback planned) |

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
| 1 — Supabase Persistence | Planned |
| 2 — Trajectory Engine | **Shipped** |
| 3 — Reality Engine | Partial (1 active connector) |
| 4 — Personal Relevance Engine | **Shipped** |
| 5 — Daily Brief | **Shipped** |
| 6 — Learning Engine (briefing feedback) | Scaffolded |
| 7 — Notification Engine | **Deferred** |

---

## Core Documents

| Document | Purpose |
|----------|---------|
| [`PRODUCT_CONSTITUTION.md`](PRODUCT_CONSTITUTION.md) | Non-negotiable product principles |
| [`03_DECISIONS_LOG.md`](03_DECISIONS_LOG.md) | Running architecture decisions |
| [`DESIGN_DNA.md`](DESIGN_DNA.md) | Visual and UX principles |
| [`01_CURRENT_STATUS.md`](01_CURRENT_STATUS.md) | What exists right now |
| [`02_NEXT_STEPS.md`](02_NEXT_STEPS.md) | Implementation priorities |
