# Next Phase

**Always points to the immediate next development task.**

---

## Current status

| Field | Value |
|-------|-------|
| **Last completed** | Phase 12 — OAuth Foundation |
| **Up next** | Phase 13 — TBD (requires Giuseppe approval) |
| **Blocked by** | Nothing for OAuth foundation work |

---

## Phase 13 — Not yet scoped

Phase 12 delivered generic OAuth routes, state security, and the provider adapter interface. **No provider is registered yet.**

Likely candidates (require Giuseppe approval):

- **Token persistence** — Supabase migration + server-side vault (ADR required)
- **Instagram Personal OAuth** — first real provider registration
- **LinkedIn Personal OAuth** — after Instagram or in parallel
- **Sources UI** — redirect OAuth-capable Connect to `/api/sources/{id}/oauth/connect`

### Do not start without approval

- Real provider API calls without token storage ADR
- Storing tokens in browser or API responses

### Reference

- [`docs/reports/phase-12-report.md`](../reports/phase-12-report.md)
- [`docs/architecture/oauth.md`](../architecture/oauth.md)
- [`docs/decisions/ADR-012-oauth-foundation.md`](../decisions/ADR-012-oauth-foundation.md)

---

*Last updated: 2026-07-06*
