# Next Phase

**Always points to the immediate next development task.**

---

## Current status

| Field | Value |
|-------|-------|
| **Last completed** | Phase 16 — Instagram Scope Strategy |
| **Up next** | Phase 17 — TBD (requires Giuseppe approval + Meta setup complete) |
| **Blocked by** | Meta App credentials, readiness checklist, Level 1 scope approval |

---

## Phase 17 — Not yet scoped

Phase 16 delivered [`docs/architecture/instagram-scope-strategy.md`](../architecture/instagram-scope-strategy.md). **Implement Level 1 only** (read-only profile + media). Do not implement DMs, publishing, or Level 2/3 until explicitly scheduled.

Likely scope (require Giuseppe approval):

- Register real Instagram OAuth provider adapter
- Level 1 connector: profile + owned media sync
- Normalized fields → evidence → knowledge extractor
- Mocked Graph API e2e — no live Meta calls in CI

### Do not start without approval

- Phase 17 until [`docs/setup/instagram.md`](../setup/instagram.md) readiness checklist is complete
- Meta API integration without Level 1 scope sign-off
- Level 2 comments, Level 3 insights, or Level 4 messaging

### Reference

- [`docs/architecture/instagram-scope-strategy.md`](../architecture/instagram-scope-strategy.md)
- [`docs/setup/instagram.md`](../setup/instagram.md)
- [`docs/reports/phase-16-report.md`](../reports/phase-16-report.md)

---

*Last updated: 2026-07-06*
