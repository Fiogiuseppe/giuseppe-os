# Next Phase

**Always points to the immediate next development task.**

---

## Current status

| Field | Value |
|-------|-------|
| **Last completed** | Phase 11 — Stability & Production Persistence Audit |
| **Up next** | Phase 12 — TBD (requires Giuseppe approval) |
| **Blocked by** | Nothing for stability work |

---

## Phase 12 — Not yet scoped

Phase 11 confirmed persistence readiness and test stability. Giuseppe OS is stabilized for production Supabase deploy and future OAuth work.

Likely candidates (require Giuseppe approval):

- **OAuth infrastructure** — authorize routes, token vault, migrations (no Instagram/LinkedIn until scoped)
- **Scheduled sync** — cron/worker for connected sources
- **Instagram Personal** — public profile first slice
- **Brain Summary UI** — debug page integration

### Do not start without approval

- Token storage tables without ADR
- Instagram / LinkedIn OAuth
- LLM-based extraction or summaries

### Reference

- [`docs/reports/phase-11-report.md`](../reports/phase-11-report.md)
- [`docs/architecture/production-persistence.md`](../architecture/production-persistence.md)
- [`docs/decisions/ADR-011-production-persistence-readiness.md`](../decisions/ADR-011-production-persistence-readiness.md)

---

*Last updated: 2026-07-06*
