# Next Phase

**Always points to the immediate next development task.**

---

## Current status

| Field | Value |
|-------|-------|
| **Last completed** | Phase 7 — UREES Website Connector |
| **Up next** | Sources Phase 5 — Medium Connector (RSS) |
| **Blocked by** | Nothing |

---

## Sources Phase 5 — Medium Connector (RSS)

### Goal

Add a real public RSS connector for Giuseppe's Medium feed at `@fiogiuseppe`.

### Implement

- [ ] Reuse configurable feed patterns where applicable
- [ ] Register Medium connector (replace stub)
- [ ] Fetch public articles via RSS
- [ ] Raw + normalized + evidence persistence with dedup
- [ ] Knowledge extractor hook for Medium

### Constraints

- Public RSS only
- No OAuth, Instagram, LinkedIn
- No LLM

### Tests required

- [ ] Medium sync works end-to-end
- [ ] `npx tsc --noEmit` and `npm run build` pass
- [ ] Existing e2e suites pass (sources, knowledge, intelligence, brain, urees-website)

### Documentation required

- [ ] Phase report
- [ ] Update `docs/architecture/sources.md`
- [ ] ADR if architectural decisions emerge

### Reference

- [`docs/SOURCES_ROADMAP.md`](../SOURCES_ROADMAP.md)
- [`docs/reports/phase-07-report.md`](../reports/phase-07-report.md)
- [`docs/decisions/ADR-007-configurable-website-connectors.md`](../decisions/ADR-007-configurable-website-connectors.md)

---

*Last updated: 2026-07-06*
