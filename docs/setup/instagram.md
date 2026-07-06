# Instagram Setup Guide — Giuseppe OS

**Status:** Meta App created (2026-07-06). **Business asset verification in progress.** No Instagram OAuth provider code yet.  
**Purpose:** Prepare Meta/Instagram credentials and account requirements safely before Phase 17 OAuth implementation.

---

## Current Meta Setup Status — 2026-07-06

Findings from Giuseppe’s manual Meta Developer setup session. **No secrets in this document.**

| Item | Status |
|------|--------|
| **Meta App exists** | Yes — **GIUSEPPE OS** / **GIUSEPPE OS Sources** |
| **App ID** | Known; stored locally in `.env.local` as `META_APP_ID` (and aligned OAuth client id vars) — **never commit or paste into docs/chat** |
| **App Secret** | Stored locally in `.env.local` as `META_APP_SECRET` / `META_CLIENT_SECRET` — **server-side only; never in docs** |
| **`instagram_personal`** | @fiogiuseppe — account type **Creator** |
| **`instagram_urees`** | @urees__ — account type **Business** |
| **Instagram use case selected** | *Administrar mensajes y contenido en Instagram* (Manage messages and content on Instagram) |

### Permissions visible in Meta dashboard (as of 2026-07-06)

| Permission | Visible in app | Giuseppe OS intent |
|------------|----------------|-------------------|
| `instagram_business_basic` | Yes | **Level 1** — profile + owned media read |
| `instagram_business_manage_comments` | Yes | **Level 2 — defer**; do not implement comment sync yet |
| `instagram_business_manage_messages` | Yes | **Level 4 — do not implement**; no DM sync |

### Level 1 implementation target (unchanged)

When OAuth is implemented, Giuseppe OS still ships **read-only Level 1 only**:

- Profile metadata
- Owned media list
- Captions
- Timestamps
- Permalinks
- Media type

**Explicitly not in scope for next implementation:**

- DM sync (`instagram_business_manage_messages`)
- Publishing
- Comment ingestion (Level 2)
- Graph API Explorer tokens — **forbidden**; OAuth must flow through Giuseppe OS → `/api/sources/oauth/callback` → **Token Vault** only

See [`docs/architecture/instagram-scope-strategy.md`](../architecture/instagram-scope-strategy.md) for the full four-level plan.

---

## Current blocker

During Instagram account authorization in Meta, the flow returned:

> **Rol de desarrollador insuficiente**  
> (Insufficient developer role)

**Likely cause:** The Instagram account / business asset is not yet correctly authorized for the Meta App — not a missing secret in Giuseppe OS code (no provider code exists yet).

**Next manual step (Giuseppe — Meta Business Settings):**

1. Open [Meta Business Settings](https://business.facebook.com/settings) → **Business Portfolio** (or the portfolio that owns the app).
2. Go to **Accounts** → **Instagram accounts**.
3. Confirm **@fiogiuseppe** and **@urees__** appear and are assigned to the business assets used by **GIUSEPPE OS Sources**.
4. In the Meta App dashboard, confirm Giuseppe’s Facebook user has **Admin** or **Developer** on the app **and** access to the linked Instagram assets.
5. Retry Instagram account connection only after assets are assigned — still **no Graph Explorer tokens**; when OAuth code ships, use Giuseppe OS `/sources` connect flow only.

**Do not start Phase 17 OAuth provider code until this blocker is cleared** and the readiness checklist below reflects verified asset linkage.

---

## 1. Overview

### What this setup is for

This guide helps Giuseppe prepare **Meta Developer** access so Giuseppe OS can later connect Instagram sources through the existing OAuth foundation and Token Vault (Phases 12–14).

Giuseppe OS will use **server-side OAuth only**:

- Browser redirects to Meta for consent
- Callback at `/api/sources/oauth/callback`
- Tokens encrypted and stored in the Token Vault
- **No tokens in the browser, API responses, or chat tools**

### Sources this will support (later)

| Source ID | Account | Official profile |
|-----------|---------|------------------|
| `instagram_personal` | @fiogiuseppe | https://instagram.com/fiogiuseppe |
| `instagram_urees` | @urees__ | https://www.instagram.com/urees__/ |

Both are configured in `src/modules/sources/config/source-config.ts` with `authMethod: 'oauth'`. Implementation is **not** live until Phase 17+.

**Data scope:** See [`docs/architecture/instagram-scope-strategy.md`](../architecture/instagram-scope-strategy.md) — Level 1 (profile + media) ships first; engagement, insights, and DMs are deferred.

### What Giuseppe OS will access (intent — verify at implementation)

When a real Instagram provider is implemented, Giuseppe OS aims to ingest **read-only** data for decision intelligence:

- Public/professional profile metadata (when API permits)
- Media the account owns (posts, captions, publish dates)
- Engagement signals **only if** officially granted by Meta at implementation time

Giuseppe OS is a **personal decision companion**, not a publishing or ad tool.

### What Giuseppe OS will not access

| Excluded | Reason |
|----------|--------|
| Publishing posts, stories, or ads | Out of product scope |
| DMs and private messages | Not required; high privacy risk |
| Followers’ private data | Not Giuseppe’s data |
| Manual tokens from Graph API Explorer | Violates security model |
| Credentials in git, chat, or frontend | Server-side vault only |
| Data beyond granted OAuth scopes | Progressive disclosure; silence over overreach |

---

## 2. Requirements

### Meta Developer account

1. Sign in at [developers.facebook.com](https://developers.facebook.com/) with a Facebook account Giuseppe controls.
2. Complete developer registration and accept Meta Platform Terms.
3. Enable two-factor authentication on the Facebook account (recommended).

### Meta App

1. Create a **Business** app (or appropriate app type Meta offers for Instagram API access at setup time).
2. Add the **Instagram** product to the app when available in the dashboard.
3. Note the **App ID** and **App Secret** from **App settings → Basic** — these map to env placeholders below.
4. Add Giuseppe as an **Admin** or **Developer** on the app.

### Instagram account requirements

Instagram Graph API access typically requires **Professional** accounts (Business or Creator), not personal-only accounts.

| Account | Handle | Notes |
|---------|--------|-------|
| Personal brand | @fiogiuseppe | **Creator** (confirmed 2026-07-06) |
| UREES brand | @urees__ | **Business** (confirmed 2026-07-06) |

**To verify:** Instagram app → Settings → Account type / Professional dashboard.

If an account is still a personal account, convert to Professional before expecting API access. Meta’s rules change — confirm current docs at implementation time.

### Facebook Page connection (if required)

Many Instagram API flows require the Instagram Professional account to be **linked to a Facebook Page**.

| Source | Likely Page | Action |
|--------|-------------|--------|
| `instagram_personal` | Page Giuseppe administers for personal brand | Link IG account to that Page in Meta Business settings |
| `instagram_urees` | UREES Facebook Page (if exists) | Link @urees__ to the UREES Page |

**To verify:** Meta Business Suite → Settings → Linked accounts → Instagram.

If Meta’s dashboard shows the Instagram account as “not connected” to a Page, resolve that before Phase 16.

### Local development URL

Giuseppe OS dev server (default):

```
http://localhost:3000
```

Set in `.env.local` when testing OAuth locally:

```
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Playwright e2e uses port `3010` — OAuth redirect URI for manual Meta testing should still use the port you actually run (`3000` unless configured otherwise).

### Production callback URL (placeholder)

Replace `YOUR_DOMAIN.com` with the real production host (e.g. Vercel deployment):

```
https://YOUR_DOMAIN.com
```

---

## 3. Required environment variables

Add these to **`.env.local`** (local) or **Vercel / Supabase secrets** (production).  
Use **placeholders only** in documentation — never real values in git.

```bash
# Meta / Instagram OAuth (placeholders — fill with values from Meta Developer dashboard)
META_CLIENT_ID=
META_CLIENT_SECRET=
META_REDIRECT_URI=
META_APP_ID=
META_APP_SECRET=
```

### What each variable is for

| Variable | Typical source | Notes |
|----------|----------------|-------|
| `META_APP_ID` | Meta App Dashboard → Settings → Basic → App ID | Often same numeric ID as client ID |
| `META_APP_SECRET` | Meta App Dashboard → Settings → Basic → App Secret | **Server-side only** |
| `META_CLIENT_ID` | OAuth client identifier for authorize URL | May match `META_APP_ID` depending on product |
| `META_CLIENT_SECRET` | OAuth client secret for token exchange | May match `META_APP_SECRET`; server-only |
| `META_REDIRECT_URI` | Must match Meta “Valid OAuth Redirect URIs” exactly | See section 4 |

Also required for Token Vault (already in production persistence docs):

```bash
SOURCES_TOKEN_ENCRYPTION_KEY=
```

### Secret handling rules

| Rule | Why |
|------|-----|
| **Never paste secrets into ChatGPT, Cursor chat, or screenshots** | Chats are not secret stores |
| **Never commit secrets to git** | `.env.local` is gitignored; use platform secret managers in prod |
| **Store only in `.env.local` or Vercel/Supabase secrets** | Server env at runtime only |
| **Never expose in `NEXT_PUBLIC_*` variables** | Browser bundle is public |
| **Rotate if leaked** | Regenerate App Secret in Meta dashboard immediately |

---

## 4. Redirect URI

Giuseppe OS uses a **single OAuth callback** for all sources (Instagram, LinkedIn later):

### Local development

```
http://localhost:3000/api/sources/oauth/callback
```

Add this exact URI in Meta App → **Facebook Login** (or Instagram) → **Settings** → **Valid OAuth Redirect URIs**.

### Production (placeholder)

```
https://YOUR_DOMAIN.com/api/sources/oauth/callback
```

### `META_REDIRECT_URI` value

Set `META_REDIRECT_URI` to the environment-specific callback above. It must match:

1. The URI registered in Meta’s dashboard
2. The redirect used by `GET /api/sources/{sourceId}/oauth/connect` (derived from `NEXT_PUBLIC_APP_URL`)

Mismatch causes `redirect_uri_mismatch` errors during OAuth.

---

## 5. Permissions / scopes

**Authoritative scope strategy:** [`docs/architecture/instagram-scope-strategy.md`](../architecture/instagram-scope-strategy.md)

Phase 16 locked the implementation order:

| Level | Scope | Phase |
|-------|-------|-------|
| 1 | Profile + owned media (read-only) | **Implement first (Phase 17+)** |
| 2 | Comments on owned media | Defer |
| 3 | Insights (reach, impressions, saves) | Defer |
| 4 | DMs and private messaging | **Do not implement** |

### Level 1 permissions to verify (before implementation)

**Visible in Meta app today (2026-07-06):** `instagram_business_basic`, `instagram_business_manage_comments`, `instagram_business_manage_messages`. Giuseppe OS will **request/use only what Level 1 needs** at implementation time — do not wire comment or message APIs until explicitly scheduled.

| Permission / scope (name may vary) | Intended use | Status |
|-----------------------------------|--------------|--------|
| `instagram_business_basic` | Profile + owned media read | **Level 1 — visible in Meta; verify at OAuth** |
| `instagram_basic` / legacy names | Same intent as above | **Verify against current Meta docs** |
| `pages_show_list` | Discover linked Facebook Pages | **Level 1 — verify** |
| `pages_read_engagement` | Media counts if required by API | **Level 1 — verify only if mandatory** |
| `instagram_business_manage_comments` | Comments on owned media | **Visible — Level 2 defer; do not implement** |
| `instagram_manage_insights` / insights scopes | Reach, impressions, saves | **Level 3 — defer** |
| `instagram_content_publish` | Publishing | **Do not request / do not implement** |
| `instagram_business_manage_messages` | DMs | **Visible — Level 4; do not implement** |

### Principles

- Request the **minimum** scopes needed for read-only ingestion.
- Do **not** assume comments, insights, or private metrics are available without App Review approval.
- If a scope is denied, Giuseppe OS should **degrade gracefully** (fewer fields, not fake data).
- Re-check [Meta Instagram API documentation](https://developers.facebook.com/docs/instagram-api/) before Phase 16.

---

## 6. Safety checklist

Before connecting real Instagram accounts in Giuseppe OS:

- [ ] **Client secret is server-side only** — never in frontend, logs, or API JSON
- [ ] **Access tokens saved in Token Vault** — encrypted with `SOURCES_TOKEN_ENCRYPTION_KEY`
- [ ] **No Graph API Explorer tokens** — OAuth flow only; no manual long-lived token paste
- [ ] **No manual token copy** into `.env`, chat, or browser localStorage
- [ ] **Disconnect revokes/deletes token** — Giuseppe OS `disconnectSource` deletes vault entry (Phase 14)
- [ ] **Frontend never receives tokens** — only safe metadata (`hasToken`, `tokenExpiresAt`, `scopes`)
- [ ] **`ALLOW_TEST_ROUTES=1` never in production** — test OAuth provider is dev/test only
- [ ] **App Review plan documented** if advanced scopes are needed

---

## 7. Implementation readiness checklist

Copy and fill before requesting Phase 17:

```
Instagram preparation — Giuseppe OS
Date: 2026-07-06

[x] Meta Developer account created and verified
[x] Meta App created (name: GIUSEPPE OS / GIUSEPPE OS Sources)
[x] Instagram product added to Meta App
[x] instagram_personal — account type confirmed: Creator (@fiogiuseppe)
[x] instagram_urees — account type confirmed: Business (@urees__)
[ ] Facebook Page linked to @fiogiuseppe (if required): verify in Business Settings
[ ] Facebook Page linked to @urees__ (if required): verify in Business Settings
[ ] Instagram accounts assigned to app / business portfolio (blocker: developer role error)
[ ] Local redirect URI added in Meta dashboard
[ ] Production redirect URI added (when domain known): _______
[x] META_APP_ID copied to .env.local (not committed)
[x] META_APP_SECRET copied to .env.local (not committed)
[ ] META_CLIENT_ID / META_CLIENT_SECRET aligned with dashboard
[ ] META_REDIRECT_URI set to match callback route
[ ] SOURCES_TOKEN_ENCRYPTION_KEY set for target environment
[x] Scopes visible in Meta noted (basic, manage_comments, manage_messages — Level 1 only at impl)
[ ] App Review status noted (if needed): _______
[x] Local OAuth callback tested with test provider (Phase 14 e2e baseline)
```

---

## 8. Do not proceed until

**Do not implement Phase 17 (real Instagram OAuth + Level 1 sync) until:**

1. **Current blocker cleared** — “Rol de desarrollador insuficiente” resolved; @fiogiuseppe and @urees__ assigned in Business Portfolio → Instagram accounts
2. All required Meta values are available locally in `.env.local` (or production secrets manager) — App ID/Secret done; redirect URI alignment pending
3. Both Instagram accounts meet Meta’s account-type requirements — **done** (Creator + Business)
4. Facebook Page linkage is confirmed **if** Meta’s current flow requires it
5. Redirect URIs are registered and match `META_REDIRECT_URI` / `NEXT_PUBLIC_APP_URL`
6. Intended scopes are verified against **current** Meta documentation and App Review status — request **Level 1 minimum** even if broader permissions are visible
7. [`instagram-scope-strategy.md`](../architecture/instagram-scope-strategy.md) Level 1 plan is understood and approved
8. Giuseppe has explicitly approved moving from **Business Asset Verification** to implementation

Until then, Giuseppe OS continues to use the **test OAuth provider** only when `ALLOW_TEST_ROUTES=1`.

---

## Related documentation

- Scope strategy: [`docs/architecture/instagram-scope-strategy.md`](../architecture/instagram-scope-strategy.md)
- OAuth architecture: [`docs/architecture/oauth.md`](../architecture/oauth.md)
- Token Vault: [`docs/decisions/ADR-013-token-vault.md`](../decisions/ADR-013-token-vault.md)
- OAuth persistence: [`docs/decisions/ADR-014-oauth-token-persistence.md`](../decisions/ADR-014-oauth-token-persistence.md)
- Instagram preparation ADR: [`docs/decisions/ADR-015-instagram-preparation.md`](../decisions/ADR-015-instagram-preparation.md)
- Production env vars: [`docs/architecture/production-persistence.md`](../architecture/production-persistence.md)

---

*Last updated: 2026-07-06 — Meta App created; business asset verification blocker documented; no provider code.*
