# ADR-005: Intelligence read layer queries knowledge, not raw sources

**Status:** Accepted  
**Date:** 2026-07-06  
**Deciders:** Giuseppe, engineering agent  
**Supersedes:** —  
**Superseded by:** —

---

## Decision

Giuseppe OS exposes a **read-only Intelligence Read Layer** that queries **structured knowledge items** produced by Phase 4. Consumers (API, debug UI, future Brain) must not read raw evidence or provider payloads through this layer.

Phase 5 implements **deterministic in-memory filtering** over safe knowledge DTOs. No LLM, no new connectors, no OAuth.

API: `GET /api/intelligence/knowledge` with query params `owner`, `sourceId`, `knowledgeType`, `status`, `q`.

---

## Context

Phase 4 stores knowledge with evidence backlinks. Before any AI or Brain integration, Giuseppe OS needs a stable query surface for structured knowledge — by owner, source, type, status, and search term — without leaking secrets or raw ingestion artifacts.

Product constitution: progressive disclosure, silence over weak advice, no invented insights.

---

## Alternatives Considered

### Option A — Extend `GET /api/knowledge` with filters only

**Pros:** One endpoint, less code.  
**Cons:** Mixes persistence listing with intelligence queries; future Brain may need different response contracts and audit semantics.

### Option B — Query evidence/normalized stores directly

**Pros:** Fewer hops.  
**Cons:** Violates ADR-004; exposes provider-shaped data; harder to enforce safe metadata.

### Option C — Dedicated intelligence read module over knowledge (chosen)

**Pros:** Clear boundary (`Knowledge` writes, `Intelligence` reads); filter/search logic isolated; safe DTOs only; ready for Brain without coupling to store internals.  
**Cons:** Thin layer today; may duplicate list-then-filter until store-level indexes are needed.

---

## Why This Was Chosen

Option C preserves the pipeline:

`Source → Raw → Normalized → Evidence → Knowledge → **Intelligence Read** → Brain`

It enforces ADR-004: intelligence consumes knowledge, not raw provider data. Phase 5 stays read-only and deterministic — appropriate before cited AI.

---

## Consequences

### Positive

- Stable query API for Giuseppe's structured knowledge
- Every result includes `evidenceUrls` and `evidenceIds`
- Invalid query params return 400 — no silent coercion
- Brain can depend on `intelligence-read.server.ts` without touching knowledge persistence

### Negative

- Large knowledge sets load fully before filter (acceptable for personal scale in Phase 5)
- Search is simple substring match on label/summary (no ranking, no fuzzy match)

### Follow-up

- Store-level filtered queries if volume grows
- Brain orchestration reads through this layer
- Optional response shaping (facets, pagination) in later phases

---

## References

- [`ADR-004-knowledge-layer.md`](ADR-004-knowledge-layer.md)
- [`docs/architecture/knowledge.md`](../architecture/knowledge.md)
- [`docs/reports/phase-05-report.md`](../reports/phase-05-report.md)
