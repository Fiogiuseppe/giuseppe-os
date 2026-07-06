# Next Phase

**Always points to the immediate next development task.**

---

## Current status

| Field | Value |
|-------|-------|
| **Last completed** | Phase 13 — Token Vault |
| **Up next** | Phase 14 — TBD (requires Giuseppe approval) |
| **Blocked by** | Nothing for token vault work |

---

## Phase 14 — Not yet scoped

Phase 13 delivered encrypted server-side token storage with memory/file/Supabase backends. **No provider is registered and OAuth callback is not wired to persist tokens yet.**

Likely candidates (require Giuseppe approval):

- **Instagram Personal OAuth** — first real provider registration + callback wiring
- **LinkedIn Personal OAuth** — after Instagram or in parallel
- **Sources UI** — redirect OAuth-capable Connect to `/api/sources/{id}/oauth/connect`
- **Token refresh worker** — background refresh before expiry

### Do not start without approval

- Real provider API calls without Giuseppe sign-off
- Storing or returning tokens in browser or public API responses

### Reference

- [`docs/reports/phase-13-report.md`](../reports/phase-13-report.md)
- [`docs/architecture/oauth.md`](../architecture/oauth.md)
- [`docs/decisions/ADR-013-token-vault.md`](../decisions/ADR-013-token-vault.md)

---

*Last updated: 2026-07-06*
