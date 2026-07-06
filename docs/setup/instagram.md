# Instagram Setup Guide — Giuseppe OS

**Status:** Preparation only (Phase 15). **No Instagram OAuth is implemented yet.**  
**Purpose:** Prepare Meta/Instagram credentials and account requirements safely before Phase 16 implementation.

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

Both are configured in `src/modules/sources/config/source-config.ts` with `authMethod: 'oauth'`. Implementation is **not** live until Phase 16+.

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
| Personal brand | @fiogiuseppe | Confirm account type is Business or Creator |
| UREES brand | @urees__ | Confirm account type is Business or Creator |

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

**Verify before implementation.** Meta changes product names, permissions, and review requirements. The list below is a **preparation checklist**, not a guarantee of access.

### Likely permissions to review (to verify before implementation)

| Permission / scope (name may vary) | Intended use | Status |
|-----------------------------------|--------------|--------|
| `instagram_basic` / business profile read | Profile and media metadata | **To verify** |
| `instagram_content_publish` | — | **Do not request** (publish out of scope) |
| `pages_show_list` | Discover linked Facebook Pages | **To verify** |
| `pages_read_engagement` | Page-linked IG engagement | **To verify** |
| `instagram_manage_insights` / insights scopes | Reach, impressions | **To verify** — only if Meta grants and product needs it |
| `instagram_manage_comments` / comment read | Comments on owned media | **To verify** — do not assume availability |

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

Copy and fill before requesting Phase 16:

```
Instagram preparation — Giuseppe OS
Date: ___________

[ ] Meta Developer account created and verified
[ ] Meta App created (name: ________________ )
[ ] Instagram product added to Meta App
[ ] instagram_personal — account type confirmed (Business/Creator): _______
[ ] instagram_urees — account type confirmed (Business/Creator): _______
[ ] Facebook Page linked to @fiogiuseppe (if required): _______
[ ] Facebook Page linked to @urees__ (if required): _______
[ ] Local redirect URI added in Meta dashboard
[ ] Production redirect URI added (when domain known): _______
[ ] META_APP_ID copied to .env.local (not committed)
[ ] META_APP_SECRET copied to .env.local (not committed)
[ ] META_CLIENT_ID / META_CLIENT_SECRET aligned with dashboard
[ ] META_REDIRECT_URI set to match callback route
[ ] SOURCES_TOKEN_ENCRYPTION_KEY set for target environment
[ ] Scopes list verified against current Meta docs
[ ] App Review status noted (if needed): _______
[ ] Local OAuth callback tested with test provider (Phase 14 e2e baseline)
```

---

## 8. Do not proceed until

**Do not implement Phase 16 (real Instagram OAuth provider) until:**

1. All required Meta values are available locally in `.env.local` (or production secrets manager)
2. Both Instagram accounts (`@fiogiuseppe`, `@urees__`) meet Meta’s account-type requirements
3. Facebook Page linkage is confirmed **if** Meta’s current flow requires it
4. Redirect URIs are registered and match `META_REDIRECT_URI` / `NEXT_PUBLIC_APP_URL`
5. Intended scopes are verified against **current** Meta documentation and App Review status
6. Giuseppe has explicitly approved moving from preparation to implementation

Until then, Giuseppe OS continues to use the **test OAuth provider** only when `ALLOW_TEST_ROUTES=1`.

---

## Related documentation

- OAuth architecture: [`docs/architecture/oauth.md`](../architecture/oauth.md)
- Token Vault: [`docs/decisions/ADR-013-token-vault.md`](../decisions/ADR-013-token-vault.md)
- OAuth persistence: [`docs/decisions/ADR-014-oauth-token-persistence.md`](../decisions/ADR-014-oauth-token-persistence.md)
- Instagram preparation ADR: [`docs/decisions/ADR-015-instagram-preparation.md`](../decisions/ADR-015-instagram-preparation.md)
- Production env vars: [`docs/architecture/production-persistence.md`](../architecture/production-persistence.md)

---

*Last updated: 2026-07-06 — Phase 15 preparation guide only; no provider code.*
