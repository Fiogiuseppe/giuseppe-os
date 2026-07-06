# OAuth Foundation

Generic OAuth architecture for Giuseppe OS social connectors. **No real provider is connected in Phase 12.**

---

## Overview

```
Browser → GET /api/sources/{sourceId}/oauth/connect
       → state cookie (HttpOnly) + redirect to provider (when implemented)
       → GET /api/sources/oauth/callback
       → validate state → exchange code (server-only, future)
       → redirect to /sources?connected={sourceId}
```

Tokens never reach the browser. Client secrets stay in server environment variables only.

---

## Module layout

| File | Purpose |
|------|---------|
| `oauth.types.ts` | Shared types, token bundle (server-only) |
| `oauth-provider.types.ts` | `OAuthProviderAdapter` interface |
| `oauth-registry.server.ts` | Register/lookup provider adapters |
| `oauth-state.server.ts` | CSRF state generation, validation, TTL |
| `oauth-security.server.ts` | HttpOnly cookie helpers |
| `oauth-errors.ts` | Error codes and `OAuthError` |
| `oauth-flow.server.ts` | Connect + callback orchestration |

---

## Routes

| Method | Path | Behavior |
|--------|------|----------|
| `GET` | `/api/sources/[sourceId]/oauth/connect` | Begin OAuth; reject non-OAuth sources; 501 if provider not registered |
| `GET` | `/api/sources/oauth/callback` | Validate state; redirect to `/sources` with safe query params |

Legacy `POST /api/sources` connect on OAuth sources returns **400** with message to use the authorize route.

---

## OAuth-capable sources

From `source-config.ts` (`authMethod: 'oauth'`):

| Source | Provider status |
|--------|-----------------|
| `instagram_personal` | Not implemented |
| `linkedin_personal` | Not implemented |
| `instagram_urees` | Not implemented |

Feed sources (`website_personal`, `medium_personal`, `website_urees`) reject OAuth connect with **400**.

---

## State security

| Control | Implementation |
|---------|----------------|
| Random state | `crypto.randomBytes(32)` hex |
| Source binding | `sourceId` stored with pending state |
| Redirect binding | `redirectUri` must match callback URI |
| TTL | 10 minutes (`OAUTH_STATE_TTL_MS`) |
| Cookie | `giuseppe_sources_oauth_state`, HttpOnly, SameSite=Lax, Secure in production |
| Reuse protection | State consumed on callback; second use → `state_reused` |
| Expiry | Explicit `state_expired` before purge |

State lives in a **server-side in-memory store** (production should move to Redis/Supabase in a future phase with token tables).

---

## Provider adapter interface

Future Instagram/LinkedIn adapters implement `OAuthProviderAdapter`:

```typescript
buildAuthorizationUrl(input)
exchangeCodeForTokens(input)   // server-side HTTP only
refreshAccessToken?(input)
revokeToken?(input)
getGrantedScopes(tokenBundle)
```

Register via `registerOAuthProvider(adapter)` at server bootstrap when a provider ships.

**Phase 12:** registry is empty — connect returns `501 OAuth provider not implemented`.

---

## Error codes

| Code | Meaning |
|------|---------|
| `unsupported_source` | Feed source or unknown ID |
| `provider_not_implemented` | OAuth source without registered adapter |
| `missing_state` | Callback missing state cookie/query |
| `state_mismatch` | Cookie vs query or redirect URI mismatch |
| `state_expired` | TTL exceeded |
| `state_reused` | State already consumed or unknown |
| `missing_code` | Callback without authorization code |
| `provider_denied` | Provider returned `error` param |
| `token_exchange_failed` | Exchange failed (future) |

Errors redirect to `/sources?oauth_error={code}` — never include tokens.

---

## What is NOT in Phase 12

- Token database tables
- Real Instagram / LinkedIn OAuth
- External provider API calls
- Token storage or refresh workers
- localStorage / frontend token access

---

## Testing

`e2e/sources-oauth.spec.ts` covers connect rejection, callback state validation, and absence of token fields.

Test helper (gated by `ALLOW_TEST_ROUTES=1`):

- `POST /api/test/seed-oauth-state` — seed valid/expired state for callback tests

---

## Related

- [`ADR-012-oauth-foundation.md`](../decisions/ADR-012-oauth-foundation.md)
- [`production-persistence.md`](production-persistence.md)
- [`docs/reports/phase-12-report.md`](../reports/phase-12-report.md)

---

*Last updated: 2026-07-06*
