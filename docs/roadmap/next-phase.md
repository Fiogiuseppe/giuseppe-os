# Next Phase

**Always points to the immediate next development task.**

---

## Current status

| Field | Value |
|-------|-------|
| **Last completed** | Phase 17 — Weekly Letter |
| **Up next** | Phase 16.5 — Instagram Business Asset Verification (manual Meta steps) |
| **Blocked by** | Meta “Rol de desarrollador insuficiente” during IG authorization |

---

## Immediate ops for Weekly Letter

1. Apply `supabase/migrations/20260707_weekly_letters.sql` on production Supabase.
2. Set Vercel env: `RESEND_API_KEY`, `WEEKLY_LETTER_TO`, `WEEKLY_LETTER_FROM`, `CRON_SECRET`.
3. Verify Resend sender domain.
4. Manual test: `curl "https://giuseppe-os.vercel.app/api/weekly-letter?secret=YOUR_SECRET"`

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

---

*Last updated: 2026-07-07*
