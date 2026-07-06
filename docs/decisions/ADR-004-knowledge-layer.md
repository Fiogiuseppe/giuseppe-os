# ADR-004: Giuseppe OS reasons from source-backed knowledge items

**Status:** Accepted  
**Date:** 2026-07-06  
**Deciders:** Giuseppe, engineering agent  
**Supersedes:** —  
**Superseded by:** —

---

## Decision

Giuseppe OS will **not reason directly from raw provider data** (HTML, RSS JSON, arbitrary sync payloads). All future intelligence layers must consume **structured, source-backed knowledge items** that trace to evidence IDs and evidence URLs.

Knowledge is created only when evidence exists. No evidence → no knowledge.

Phase 4 implements **deterministic, rule-based extraction** (no LLM). AI-assisted inference is deferred to later phases.

---

## Context

Phase 3 delivers synchronized evidence from fiogiuseppe.com. Evidence alone is still too close to provider format for long-term decision intelligence. Giuseppe OS needs an auditable layer between evidence and the future Brain.

Product constitution requires: no invented insights, silence over weak advice, progressive disclosure.

---

## Alternatives Considered

### Option A — Reason directly from normalized items

**Pros:** Fewer layers, faster to ship.  
**Cons:** Couples Brain to provider schemas; hard to merge Medium, Instagram, LinkedIn later.

### Option B — Reason directly from evidence summaries

**Pros:** One less store.  
**Cons:** Evidence summaries are ingestion artifacts, not stable knowledge concepts; dedup and lifecycle unclear.

### Option C — Knowledge layer with evidence backlinks (chosen)

**Pros:** Stable concepts (projects, brands, topics); dedup by type + label; extensible extractors per source; audit trail.  
**Cons:** Additional persistence and extraction pipeline.

---

## Why This Was Chosen

Option C matches the pipeline vision:

`Source → Raw → Normalized → Evidence → Knowledge → Brain`

It enforces the core principle: **knowledge without evidence is invalid**. It prepares for multi-source fusion without rewriting the Brain contract each time a connector ships.

---

## Consequences

### Positive

- Brain can query stable `KnowledgeItem` records
- Duplicate concepts merge instead of fragmenting
- Safe API surface (`SafeKnowledgeItem`) without raw payloads

### Negative / trade-offs

- Rule-based extraction is limited until AI-assisted phases
- Another store to maintain (memory / file / supabase)

### Neutral

- Extractors are pluggable per `sourceId`
- Phase 4 scope is website only; other sources unchanged

---

## Future Considerations

- Phase 6+ may unify evidence schema further
- AI extraction must still produce evidence-linked knowledge or `needs_review` status
- Multi-owner support when Giuseppe OS scales beyond single user

---

## References

- [`docs/reports/phase-04-report.md`](../reports/phase-04-report.md)
- [`docs/architecture/knowledge.md`](../architecture/knowledge.md)
- [`docs/PRODUCT_CONSTITUTION.md`](../PRODUCT_CONSTITUTION.md)
