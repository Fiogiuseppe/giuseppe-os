# ADR-014: OAuth callback token persistence with test provider

**Status:** Accepted  
**Date:** 2026-07-06  
**Deciders:** Giuseppe, engineering agent  
**Supersedes:** —  
**Superseded by:** —

---

## Decision

Wire OAuth callback to Token Vault and Sources connection state:

1. **Test OAuth provider** (`test_oauth`) registered only when `ALLOW_TEST_ROUTES=1` or `NODE_ENV=test`
2. Simulated authorize route at `/api/test/oauth/authorize` — no external HTTP
3. OAuth callback calls `saveTokenBundleFromOAuth()` then marks source `connected`
4. Sources UI redirects OAuth-capable connect to `/api/sources/{sourceId}/oauth/connect`
5. Safe `oauthToken` metadata (`hasToken`, `tokenExpiresAt`, `scopes`) on `SourceProviderStatus`
6. OAuth disconnect revokes (simulated), deletes vault entry, sets `disconnected`
7. **No real Instagram, LinkedIn, or external provider APIs**

---

## Context

Phase 12 delivered OAuth routes and state security. Phase 13 delivered encrypted token storage. Before implementing real social providers, the platform needs an end-to-end path that proves callback → vault → connection state → UI without exposing tokens.

---

## Alternatives considered

### Option A — Wire callback directly without test provider

**Pros:** Less test code.  
**Cons:** Cannot exercise full flow in e2e without real OAuth or mocking at route level only.

### Option B — Test provider + simulated authorize (chosen)

**Pros:** Full connect/callback/vault/UI loop testable; production remains without provider until Phase 15+.  
**Cons:** Test-only code paths must stay gated.

### Option C — Implement Instagram OAuth immediately

**Pros:** Real data sooner.  
**Cons:** Violates phased scope; requires external API calls and client secrets.

---

## Security choices

| Control | Implementation |
|---------|----------------|
| Test provider | Gated by `ALLOW_TEST_ROUTES` / `NODE_ENV=test` |
| Tokens | Encrypted via Token Vault (ADR-013) |
| API responses | `oauthToken` metadata only — no token values |
| UI connect | Browser redirect — tokens never in JSON responses |
| Disconnect | Vault entry deleted; connection explicitly `disconnected` |
| Production | No test provider registered — OAuth sources return 501 until real adapter ships |

---

## Consequences

### Positive

- Proven end-to-end OAuth → vault → connected source flow
- UI correctly separates OAuth redirect from feed POST connect
- Clear extension point: replace test provider with Instagram/LinkedIn adapters

### Negative

- Production OAuth sources still cannot connect (no real provider)
- Test provider must not leak into production bootstrap

---

## References

- [`ADR-012-oauth-foundation.md`](ADR-012-oauth-foundation.md)
- [`ADR-013-token-vault.md`](ADR-013-token-vault.md)
- [`docs/reports/phase-14-report.md`](../reports/phase-14-report.md)
- [`docs/architecture/oauth.md`](../architecture/oauth.md)
