# Next Phase

**Always points to the immediate next development task.**

---

## Current status

| Field | Value |
|-------|-------|
| **Last completed** | Phase 9 — Medium Connector (public RSS) |
| **Up next** | Phase 10 — TBD (Instagram / LinkedIn / OAuth not started) |
| **Blocked by** | Nothing for documentation; social connectors require explicit scope |

---

## Phase 10 — Not yet scoped

Phase 9 completed the Medium public RSS connector. The next sources phase has **not** been started.

Likely candidates (require Giuseppe approval before implementation):

- **Instagram Personal** — public profile only, no OAuth in first slice
- **LinkedIn Personal** — public profile only
- **OAuth infrastructure** — for private API access later
- **Scheduled sync** — cron/worker hook for connected sources

### Do not start without approval

- Instagram OAuth
- LinkedIn OAuth
- Token storage
- LLM-based knowledge extraction

### Reference

- [`docs/reports/phase-09-report.md`](../reports/phase-09-report.md)
- [`docs/decisions/ADR-009-medium-public-feed-connector.md`](../decisions/ADR-009-medium-public-feed-connector.md)
- [`src/modules/sources/config/source-config.ts`](../src/modules/sources/config/source-config.ts)

---

*Last updated: 2026-07-06*
