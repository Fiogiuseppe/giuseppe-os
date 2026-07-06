# ADR-013: Server-side Token Vault for OAuth credentials

**Status:** Accepted  
**Date:** 2026-07-06  
**Deciders:** Giuseppe, engineering agent  
**Supersedes:** —  
**Superseded by:** —

---

## Decision

Implement a **server-side Token Vault** at `src/modules/sources/token-vault/`:

1. Encrypt access and refresh tokens with **AES-256-GCM** before persistence
2. Encryption key from `SOURCES_TOKEN_ENCRYPTION_KEY` — required in production
3. Support **memory**, **file**, and **Supabase** store backends (same pattern as Sources Engine / Knowledge)
4. Supabase table `source_oauth_tokens` via migration `20260706_source_oauth_tokens.sql`
5. Expose **safe metadata only** to APIs — never decrypted tokens
6. Internal functions: `saveTokenBundle`, `getValidTokenBundle`, `markTokenRevoked`, `deleteTokenBundle`, `listTokenMetadata`
7. OAuth integration hook `saveTokenBundleFromOAuth` — not wired to callback until a provider ships
8. **No real providers**, **no external API calls**, **no real tokens** outside tests

---

## Context

Phase 12 delivered generic OAuth routes, CSRF state, and a provider adapter interface without token persistence. Before registering Instagram or LinkedIn, the platform needs encrypted credential storage that never leaks to the browser or public APIs.

ADR-012 explicitly deferred token tables to a future ADR.

---

## Alternatives considered

### Option A — Store tokens in Supabase without application-layer encryption

**Pros:** Simpler code; relies on database access controls.  
**Cons:** Service-role compromise exposes plaintext tokens; violates defense-in-depth for high-value credentials.

### Option B — Application-layer encryption + Supabase (chosen)

**Pros:** Tokens encrypted at rest even with DB access; consistent with server-only decrypt pattern.  
**Cons:** Key management responsibility; rotation requires re-encryption strategy (future).

### Option C — External secrets manager (Vault, AWS Secrets Manager)

**Pros:** Enterprise-grade key rotation.  
**Cons:** Over-engineering for current single-user scope; adds infra dependency.

---

## Security choices

| Control | Implementation |
|---------|----------------|
| Encryption | AES-256-GCM with random 12-byte IV per token |
| Key | `SOURCES_TOKEN_ENCRYPTION_KEY` — 32-byte base64 or passphrase (SHA-256 derived) |
| Production | `productionRequiresEncryptionKey()` — fail closed without key |
| API surface | `SafeTokenMetadata` — no token fields |
| Test route | `ALLOW_TEST_ROUTES=1` only; metadata and boolean flags, never decrypted values |
| Logging | Tokens never logged |
| Revocation | `revokedAt` timestamp; `getValidTokenBundle` returns null |
| Expiry | `expiresAt` checked server-side |

---

## Store backend resolution

| Env | Backend |
|-----|---------|
| `SOURCES_TOKEN_VAULT_STORE=memory` | In-memory (e2e) |
| Supabase configured, no memory override | Supabase |
| Otherwise | File (`.data/token-vault/`) |

---

## Consequences

### Positive

- OAuth callback can persist tokens via `saveTokenBundleFromOAuth` when providers register
- Connectors can call `getValidTokenBundle` server-side for sync
- Clear separation: encrypted persistence vs safe metadata
- E2E proves encryption and API safety with fake tokens only

### Negative

- Encryption key rotation not automated (manual re-encrypt future work)
- File backend is single-node only
- OAuth callback not yet wired — tokens cannot be saved from real OAuth flow until Phase 14+

---

## References

- [`docs/architecture/oauth.md`](../architecture/oauth.md)
- [`docs/architecture/production-persistence.md`](../architecture/production-persistence.md)
- [`docs/reports/phase-13-report.md`](../reports/phase-13-report.md)
- [`ADR-012-oauth-foundation.md`](ADR-012-oauth-foundation.md)
