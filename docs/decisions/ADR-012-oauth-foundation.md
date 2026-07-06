# ADR-012: OAuth foundation without provider implementation

**Status:** Accepted  
**Date:** 2026-07-06  
**Deciders:** Giuseppe, engineering agent  
**Supersedes:** —  
**Superseded by:** —

---

## Decision

Build a **generic OAuth foundation** for Giuseppe OS Sources:

1. Module at `src/modules/sources/oauth/` with state security, provider registry, and error taxonomy
2. Routes `GET /api/sources/[sourceId]/oauth/connect` and `GET /api/sources/oauth/callback`
3. `OAuthProviderAdapter` interface for future Instagram/LinkedIn implementations
4. **No real providers registered** in Phase 12
5. **No token tables** and **no token persistence** in Phase 12
6. OAuth-capable sources reject `POST /api/sources` connect; feed sources reject OAuth connect route

---

## Context

Phases 3–11 shipped feed connectors and Brain layers. Instagram and LinkedIn are configured as `authMethod: 'oauth'` but had stub connect behavior. Before implementing real social OAuth, the platform needs secure state handling, callback validation, and a provider plug-in contract.

---

## Alternatives considered

### Option A — Implement Instagram OAuth immediately

**Pros:** Faster time to data.  
**Cons:** Violates phased scope; requires token storage and external API calls prematurely.

### Option B — Generic foundation only (chosen)

**Pros:** Security architecture first; clear extension point; no secrets or tokens in flight.  
**Cons:** OAuth sources still cannot sync until a later phase registers providers.

### Option C — Defer all OAuth routes

**Pros:** Minimal code.  
**Cons:** UI and platform remain ambiguous; harder to test state security in isolation.

---

## Security choices

- CSRF state in HttpOnly cookie + query param double-submit
- State bound to `sourceId` and `redirectUri`
- 10-minute TTL with explicit expiry and reuse errors
- Callback redirects sanitize `oauth_error` query values
- Token bundle type exists server-side only — never serialized to API responses

Token persistence deferred to a future ADR with Supabase migrations.

---

## Consequences

### Positive

- Clear path to register `instagram` / `linkedin` adapters
- E2E coverage for connect/callback failure modes
- Feed connectors and Brain layers unchanged

### Negative

- OAuth sources still show `needs_auth` without a working connect redirect
- In-memory state store is not multi-instance safe (documented; upgrade later)

---

## References

- [`docs/architecture/oauth.md`](../architecture/oauth.md)
- [`docs/reports/phase-12-report.md`](../reports/phase-12-report.md)
- [`ADR-011-production-persistence-readiness.md`](ADR-011-production-persistence-readiness.md)
