# Next Phase

**Always points to the immediate next development task.**

---

## Current status

| Field | Value |
|-------|-------|
| **Last completed** | Phase 16 — Instagram Scope Strategy |
| **Up next** | Phase 16.5 — Instagram Business Asset Verification |
| **Blocked by** | Meta “Rol de desarrollador insuficiente” during IG authorization; Instagram accounts not yet confirmed on app / business portfolio |

---

## Phase 16.5 — Instagram Business Asset Verification

**This is not implementation.** No OAuth provider code, no Meta API calls, no tokens in docs.

### Goal

Confirm that **@fiogiuseppe** (Creator) and **@urees__** (Business) are correctly assigned to the **GIUSEPPE OS Sources** Meta App and Business Portfolio **before** writing real OAuth provider code.

### Giuseppe manual steps (Meta Business Settings)

1. [Meta Business Settings](https://business.facebook.com/settings) → Business Portfolio that owns the app.
2. **Accounts** → **Instagram accounts** — both handles visible and assigned.
3. Meta App dashboard → confirm Giuseppe has Admin/Developer on the app **and** access to linked Instagram assets.
4. Retry Instagram account connection in Meta only to confirm the developer-role error is gone.
5. Complete remaining items in [`docs/setup/instagram.md`](../setup/instagram.md) readiness checklist (redirect URIs, `META_REDIRECT_URI`, encryption key for target env).

### Documented Meta findings (2026-07-06)

- Meta App: **GIUSEPPE OS** / **GIUSEPPE OS Sources**
- App ID and App Secret stored in `.env.local` only — never in git or docs
- Use case: *Administrar mensajes y contenido en Instagram*
- Permissions visible: `instagram_business_basic`, `instagram_business_manage_comments`, `instagram_business_manage_messages`
- **Level 1 implementation target unchanged:** read-only profile + media (no DMs, no publishing, no Graph Explorer tokens)

### Exit criteria (then Phase 17 can be scheduled)

- [ ] “Rol de desarrollador insuficiente” resolved for @fiogiuseppe authorization attempt
- [ ] @urees__ asset assignment verified
- [ ] Redirect URIs registered and env-aligned
- [ ] Giuseppe explicitly approves Phase 17 after checklist complete

### Reference

- [`docs/setup/instagram.md`](../setup/instagram.md) — § Current Meta Setup Status, § Current blocker
- [`docs/architecture/instagram-scope-strategy.md`](../architecture/instagram-scope-strategy.md)
- [`docs/reports/phase-16-5-instagram-meta-status-report.md`](../reports/phase-16-5-instagram-meta-status-report.md)

---

## Phase 17 — Not started (after 16.5)

**Implement Level 1 only** (read-only profile + media). Do not implement DMs, publishing, or Level 2/3 until explicitly scheduled.

Likely scope (require Giuseppe approval after 16.5):

- Register real Instagram OAuth provider adapter
- Level 1 connector: profile + owned media sync
- Normalized fields → evidence → knowledge extractor
- Mocked Graph API e2e — no live Meta calls in CI

### Do not start without approval

- Phase 17 until Phase 16.5 exit criteria are met
- Meta API integration without Level 1 scope sign-off
- Level 2 comments, Level 3 insights, or Level 4 messaging
- Graph API Explorer tokens — OAuth via Giuseppe OS + Token Vault only

---

*Last updated: 2026-07-06 — Phase 16.5 business asset verification is the immediate next task.*
