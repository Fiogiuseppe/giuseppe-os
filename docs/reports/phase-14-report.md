# Phase 14 — OAuth UI + Callback Token Persistence Report

**Date:** 2026-07-06  
**Status:** Complete  
**Branch:** `main`  
**Report author:** Cursor agent session

---

## Summary

Phase 14 wires the OAuth foundation to the Token Vault using a **fake/test OAuth provider only**. The OAuth callback persists encrypted tokens, marks sources as connected, and the Sources UI redirects OAuth-capable sources to the authorize route. No Instagram, LinkedIn, real providers, or external API calls.

---

## Test OAuth provider

`src/modules/sources/oauth/test-oauth-provider.server.ts`

| Method | Behavior |
|--------|----------|
| `buildAuthorizationUrl()` | Redirects to `/api/test/oauth/authorize` |
| `exchangeCodeForTokens()` | Returns fake tokens for `test-oauth-authorization-code` |
| `getGrantedScopes()` | Parses scope from token bundle |
| `revokeToken()` | No-op (simulated) |

Registered only when `ALLOW_TEST_ROUTES=1` or `NODE_ENV=test` via `oauth-bootstrap.server.ts`.

Serves: `instagram_personal`, `linkedin_personal`, `instagram_urees`.

---

## Callback → Vault flow

```
GET /api/sources/{sourceId}/oauth/connect
  → test authorize route
  → GET /api/sources/oauth/callback?code=...&state=...
  → exchangeCodeForTokens (fake)
  → saveTokenBundleFromOAuth (encrypted)
  → writeConnectionState (connected)
  → redirect /sources?connected={sourceId}
```

`oauth-connection.server.ts` orchestrates vault + connection persistence.

---

## Sources UI

| Source type | Connect behavior |
|-------------|------------------|
| OAuth (`authMethod: 'oauth'`) | Browser redirect to `/api/sources/{id}/oauth/connect` |
| Feed / public | `POST /api/sources` connect (unchanged) |

`SourcesDashboard` uses `startOAuthConnect()` for OAuth sources.

---

## Safe token metadata on source status

`SourceProviderStatus.oauthToken`:

| Field | Description |
|-------|-------------|
| `hasToken` | Whether a non-revoked token exists |
| `tokenExpiresAt` | ISO expiry or null |
| `scopes` | Granted scopes (safe strings only) |

Never includes `accessToken`, `refreshToken`, or `clientSecret`.

---

## Disconnect

OAuth disconnect:

1. Simulated `revokeToken()` when provider supports it
2. `deleteTokenBundle()` from vault
3. Connection state set to `disconnected` (not re-seeded as `needs_auth`)

---

## Files created / updated

| Path | Change |
|------|--------|
| `src/modules/sources/oauth/test-oauth-provider.server.ts` | **New** — fake provider adapter |
| `src/modules/sources/oauth/oauth-bootstrap.server.ts` | **New** — test provider registration |
| `src/modules/sources/oauth/oauth-connection.server.ts` | **New** — vault + connection wiring |
| `app/api/test/oauth/authorize/route.ts` | **New** — simulated consent redirect |
| `src/modules/sources/oauth/oauth-flow.server.ts` | Callback persists tokens |
| `src/modules/sources/platform/platform.server.ts` | OAuth disconnect revokes/deletes tokens |
| `src/modules/sources/platform/engine/source-engine.server.ts` | `oauthToken` metadata on status |
| `src/modules/sources/providers/source-provider.types.ts` | `oauthToken` type |
| `src/modules/sources/components/SourcesDashboard.tsx` | OAuth connect redirect |
| `src/modules/sources/services/sources.client.ts` | Fixed OAuth connect path |
| `app/api/test/reset-stores/route.ts` | Re-bootstrap test provider after reset |
| `e2e/oauth-token-persistence.spec.ts` | **New** — 5 tests |
| `e2e/sources-oauth.spec.ts` | Updated for test provider behavior |
| `docs/decisions/ADR-014-oauth-token-persistence.md` | **New** |

---

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Test OAuth provider (test routes only) | ✅ |
| 2 | Simulated authorize / exchange / scopes / revoke | ✅ |
| 3 | Callback calls `saveTokenBundleFromOAuth` | ✅ |
| 4 | Token saved encrypted; source connected; no frontend tokens | ✅ |
| 5 | OAuth UI uses `/oauth/connect`; feed sources unchanged | ✅ |
| 6 | Safe `oauthToken` metadata on source status | ✅ |
| 7 | E2E coverage (5 new + updated OAuth suite) | ✅ |
| 8 | No Instagram / LinkedIn / real providers | ✅ |
| 9 | TypeScript + build | ✅ |
| 10 | Existing e2e suites pass | ✅ (71 tests; 2 flaky with retry) |

---

## Verification

```bash
npx tsc --noEmit
npm run build
npx playwright test e2e/source-config.spec.ts e2e/urees-website.spec.ts e2e/sources.spec.ts e2e/knowledge.spec.ts e2e/intelligence.spec.ts e2e/brain-answer.spec.ts e2e/medium.spec.ts e2e/brain-summary.spec.ts e2e/sources-oauth.spec.ts e2e/token-vault.spec.ts e2e/oauth-token-persistence.spec.ts
```

| Check | Result |
|-------|--------|
| `tsc --noEmit` | Pass |
| `npm run build` | Pass |
| E2E | 71 tests — 69 passed, 2 flaky (retry pass) |

---

## What is NOT in Phase 14

- Real Instagram / LinkedIn OAuth
- External provider API calls
- Token refresh workers
- OAuth source sync connectors

---

## Related

- [`ADR-014-oauth-token-persistence.md`](../decisions/ADR-014-oauth-token-persistence.md)
- [`phase-13-report.md`](phase-13-report.md)
- [`docs/architecture/oauth.md`](../architecture/oauth.md)

---

*Phase 14 complete. Stop here — do not start real provider implementation.*
