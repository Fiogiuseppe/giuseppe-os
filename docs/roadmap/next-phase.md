# Next Phase

**Always points to the immediate next development task.**

---

## Current status

| Field | Value |
|-------|-------|
| **Last completed** | Phase 14 — OAuth UI + Callback Token Persistence |
| **Up next** | Phase 15 — TBD (requires Giuseppe approval) |
| **Blocked by** | Nothing for OAuth persistence work |

---

## Phase 15 — Not yet scoped

Phase 14 delivered end-to-end OAuth → Token Vault → connected source using a **test provider only**. Production still has no real Instagram or LinkedIn adapter.

Likely candidates (require Giuseppe approval):

- **Instagram Personal OAuth** — first real provider registration
- **LinkedIn Personal OAuth** — after Instagram or in parallel
- **OAuth source sync connector** — fetch data using `getValidTokenBundle`
- **Token refresh worker** — background refresh before expiry

### Do not start without approval

- Real provider API calls without Giuseppe sign-off
- Exposing tokens in browser or public API responses

### Reference

- [`docs/reports/phase-14-report.md`](../reports/phase-14-report.md)
- [`docs/decisions/ADR-014-oauth-token-persistence.md`](../decisions/ADR-014-oauth-token-persistence.md)
- [`docs/architecture/oauth.md`](../architecture/oauth.md)

---

*Last updated: 2026-07-06*
