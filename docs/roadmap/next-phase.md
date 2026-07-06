# Next Phase

**Always points to the immediate next development task.**

---

## Current status

| Field | Value |
|-------|-------|
| **Last completed** | Phase 5 — Intelligence Read Layer |
| **Up next** | Sources Phase 4 — UREES Website Connector |
| **Blocked by** | Nothing |

---

## Sources Phase 4 — UREES Website Connector

### Goal

Reuse the Phase 3 website connector architecture for `urees-website` at urees.shop.

### Implement

- [ ] Generic configurable website connector (URL + source ID)
- [ ] Register `urees-website` connector
- [ ] Fetch public products/collections/storytelling
- [ ] Raw + normalized + evidence persistence with dedup
- [ ] Knowledge extractor hook for UREES (extend registry)

### Constraints

- Reuse Phase 3 patterns — no duplicated fetch logic
- Public content only
- No OAuth, Medium, Instagram, LinkedIn

### Tests required

- [ ] UREES sync works end-to-end
- [ ] `npx tsc --noEmit` and `npm run build` pass
- [ ] Existing `e2e/sources.spec.ts`, `e2e/knowledge.spec.ts`, and `e2e/intelligence.spec.ts` pass

### Documentation required

- [ ] Phase report (per SOURCES_ROADMAP numbering)
- [ ] Update `docs/architecture/sources.md`
- [ ] ADR if generic website connector config is decided

### Reference

- [`docs/SOURCES_ROADMAP.md`](../SOURCES_ROADMAP.md)
- [`docs/reports/phase-05-report.md`](../reports/phase-05-report.md)
- [`docs/architecture/knowledge.md`](../architecture/knowledge.md)
- [`docs/decisions/ADR-005-intelligence-read-layer.md`](../decisions/ADR-005-intelligence-read-layer.md)

---

*Last updated: 2026-07-06*
