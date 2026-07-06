# ADR-010: Brain Summary Layer (deterministic, evidence-based)

**Status:** Accepted  
**Date:** 2026-07-06  
**Deciders:** Giuseppe, engineering agent  
**Supersedes:** —  
**Superseded by:** —

---

## Decision

Add a **Brain Summary Layer** at `src/modules/brain/summary/` that:

1. Exposes `POST /api/brain/summary` for deterministic, evidence-based summaries
2. Reads **only** from the Intelligence Read Layer (`readKnowledge`) — never raw provider stores
3. Groups knowledge by `sourceId` across real connectors: `website_personal`, `website_urees`, `medium_personal`
4. Supports owner, source, topic, and knowledge-type summary modes
5. Returns flat `evidenceUrls` plus per-group items with evidence links
6. Returns `"I don't know based on the synchronized evidence."` when no knowledge matches

No LLM calls. No external APIs. No tokens or secrets in responses.

`/api/brain/answer` remains unchanged.

---

## Context

Phase 6 introduced single-question evidence answers. As three real sources now sync knowledge, Giuseppe needs cross-source overviews — owner summaries, topic rollups, and per-source digests — without inventing facts or bypassing the intelligence read boundary.

---

## Alternatives Considered

### Option A — Extend `/api/brain/answer` with summary mode

**Pros:** Single endpoint.  
**Cons:** Mixes Q&A and aggregation semantics; harder to evolve response shape.

### Option B — Dedicated summary module + endpoint (chosen)

**Pros:** Clear API contract (`summary`, `groups`, `evidenceUrls`); parallel to answer layer; easy to test.  
**Cons:** One more route to maintain.

### Option C — LLM-generated summaries

**Pros:** More natural prose.  
**Cons:** Violates phase constraints; risks hallucination; breaks evidence-only guarantee.

---

## API contract

**Request** (at least one filter required):

```json
{ "topic": "UREES" }
{ "owner": "giuseppe" }
{ "sourceId": "medium_personal" }
{ "knowledgeType": "project" }
```

**Response:**

```json
{
  "summary": "...",
  "groups": [{ "sourceId": "medium_personal", "items": [...] }],
  "evidenceUrls": [...],
  "confidence": 0.85,
  "mode": "deterministic_evidence_summary",
  "query": { ... }
}
```

---

## Consequences

### Positive

- Cross-source visibility for decision intelligence without new connectors
- Grouped evidence supports progressive disclosure in UI later
- Same safety model as Intelligence Read and Brain Answer

### Negative

- Summary prose is template-based (not conversational)
- Large knowledge sets produce long summary strings

---

## References

- [`docs/reports/phase-10-report.md`](../reports/phase-10-report.md)
- [`ADR-006-brain-evidence-answer-layer.md`](ADR-006-brain-evidence-answer-layer.md)
- [`ADR-005-intelligence-read-layer.md`](ADR-005-intelligence-read-layer.md)
