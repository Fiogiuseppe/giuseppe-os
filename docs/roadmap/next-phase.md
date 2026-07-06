# Next Phase

**Always points to the immediate next development task.**

---

## Current status

| Field | Value |
|-------|-------|
| **Last completed** | Phase 8 — Source Configuration Cleanup |
| **Up next** | Sources Phase 5 — Medium Connector (RSS) |
| **Blocked by** | Nothing |

---

## Sources Phase 5 — Medium Connector (RSS)

### Goal

Add a real public RSS connector for `medium_personal` using the official URL from `source-config.ts`.

### Implement

- [ ] Register Medium connector (replace stub) for `medium_personal`
- [ ] Fetch public articles via RSS (`https://medium.com/feed/@fiogiuseppe`)
- [ ] Raw + normalized + evidence persistence with dedup
- [ ] Knowledge extractor hook for Medium

### Constraints

- Read URLs from `src/modules/sources/config/source-config.ts` only
- Public RSS only — no OAuth, Instagram, LinkedIn
- No LLM

### Tests required

- [ ] Medium sync works end-to-end
- [ ] `npx tsc --noEmit` and `npm run build` pass
- [ ] All existing e2e suites pass

### Reference

- [`src/modules/sources/config/source-config.ts`](../src/modules/sources/config/source-config.ts)
- [`docs/reports/phase-08-report.md`](../reports/phase-08-report.md)
- [`docs/decisions/ADR-008-official-source-configuration.md`](../decisions/ADR-008-official-source-configuration.md)

---

*Last updated: 2026-07-06*
