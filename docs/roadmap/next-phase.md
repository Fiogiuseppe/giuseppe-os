# Next Phase

**Always points to the immediate next development task.**

---

## Current status

| Field | Value |
|-------|-------|
| **Last completed** | Phase 15 — Instagram Preparation Guide |
| **Up next** | Phase 16 — TBD (requires Giuseppe approval + Meta setup complete) |
| **Blocked by** | Meta App credentials, account types, redirect URIs, scope verification |

---

## Phase 16 — Not yet scoped

Phase 15 delivered [`docs/setup/instagram.md`](../setup/instagram.md). **Do not implement real Instagram OAuth until the readiness checklist in that guide is complete.**

Likely scope (require Giuseppe approval):

- Register real Instagram OAuth provider adapter
- Wire Meta env vars (`META_APP_ID`, `META_APP_SECRET`, etc.)
- Replace test provider for `instagram_personal` and `instagram_urees` in production
- App Review coordination if advanced scopes are needed

### Do not start without approval

- Phase 16 until Meta values are in `.env.local` / production secrets
- Meta API calls without completed setup guide checklist
- Storing or returning tokens outside Token Vault

### Reference

- [`docs/setup/instagram.md`](../setup/instagram.md)
- [`docs/reports/phase-15-report.md`](../reports/phase-15-report.md)
- [`docs/decisions/ADR-015-instagram-preparation.md`](../decisions/ADR-015-instagram-preparation.md)

---

*Last updated: 2026-07-06*
