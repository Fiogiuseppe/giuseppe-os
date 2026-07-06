# ADR-006: Brain answers from synchronized knowledge only

**Status:** Accepted  
**Date:** 2026-07-06  
**Deciders:** Giuseppe, engineering agent  
**Supersedes:** —  
**Superseded by:** —

---

## Decision

Giuseppe OS introduces a **Brain Evidence Answer Layer** (`POST /api/brain/answer`) that answers questions **only** from `SafeKnowledgeItem` records retrieved via the Intelligence Read Layer.

Phase 6 uses **deterministic answer generation** — no external LLM APIs, no decision-making, no invented facts.

When no matching synchronized knowledge exists, the Brain responds:

> I don't know based on the synchronized evidence

---

## Context

Phases 4–5 established knowledge extraction and read queries. The Brain must not skip these layers and reason from raw provider data or identity/memory alone for source-backed factual questions.

Product constitution: silence over weak advice, no invented insights, progressive disclosure.

The existing Executive Brain (`lib/brain/executiveBrain.ts`, `POST /api/brain`) remains separate — it handles intents, decisions, and AI-assisted flows. Phase 6 adds a narrow, evidence-only answer path.

---

## Alternatives Considered

### Option A — Route all questions through Executive Brain with RAG

**Pros:** Single entry point.  
**Cons:** Couples evidence answers to LLM provider; harder to test deterministically; violates Phase 6 constraint of no external AI.

### Option B — Template answers directly in API route

**Pros:** Minimal code.  
**Cons:** No reusable module; Brain logic scattered; hard to extend.

### Option C — Dedicated `src/modules/brain/answer/` over Intelligence Read (chosen)

**Pros:** Clear pipeline boundary; deterministic and testable; evidence URLs always attached; Executive Brain untouched.  
**Cons:** Two Brain surfaces until unified orchestration later.

---

## Why This Was Chosen

Option C completes the evidence pipeline before cited AI:

`Source → Evidence → Knowledge → Intelligence Read → **Brain Evidence Answer**`

It enforces ADR-004 and ADR-005. Answers cite synchronized knowledge with evidence URLs. Unknown questions fail honestly.

---

## Consequences

### Positive

- First Brain capability grounded in synchronized sources
- Fully testable without mocking LLMs
- Safe DTOs only in responses
- Query derivation from natural language is explicit and replaceable

### Negative

- Question parsing is keyword-based (limited NLU)
- Executive Brain and Evidence Answer remain separate endpoints
- No decision recommendations in this phase

### Follow-up

- Executive Brain orchestration may delegate factual queries to evidence answer
- Cited LLM layer when product approves external AI for evidence synthesis
- Richer query planning without inventing facts

---

## References

- [`ADR-004-knowledge-layer.md`](ADR-004-knowledge-layer.md)
- [`ADR-005-intelligence-read-layer.md`](ADR-005-intelligence-read-layer.md)
- [`docs/reports/phase-06-report.md`](../reports/phase-06-report.md)
