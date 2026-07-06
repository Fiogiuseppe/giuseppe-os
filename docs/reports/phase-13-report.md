# Phase 13 — Token Vault Implementation Report

**Date:** 2026-07-06  
**Status:** Complete  
**Branch:** `main`  
**Report author:** Cursor agent session

---

## Summary

Phase 13 delivers a **secure server-side Token Vault** for future OAuth providers. Tokens are encrypted at rest (AES-256-GCM), persisted via memory/file/Supabase backends, and never exposed to the frontend or public APIs. No Instagram, LinkedIn, real providers, or external API calls.

---

## Module

`src/modules/sources/token-vault/`

| File | Purpose |
|------|---------|
| `token-vault.types.ts` | Persisted record, safe metadata, decrypted bundle (server-only), store interface |
| `token-encryption.server.ts` | AES-256-GCM encrypt/decrypt; `SOURCES_TOKEN_ENCRYPTION_KEY` resolution |
| `token-vault-store.server.ts` | memory, file, Supabase stores; backend resolution |
| `token-vault.server.ts` | Public vault API: save, get, revoke, delete, list metadata |

---

## Token model

| Field | Notes |
|-------|-------|
| `sourceId` | Primary key — one token bundle per source |
| `provider` | Provider slug (e.g. `instagram`, `linkedin`) |
| `providerAccountId` | External account identifier |
| `encryptedAccessToken` | AES-256-GCM ciphertext — never returned in APIs |
| `encryptedRefreshToken` | Optional; encrypted |
| `tokenType` | e.g. `Bearer` |
| `scopes` | Granted OAuth scopes |
| `expiresAt` | ISO timestamp or null |
| `createdAt` / `updatedAt` | Audit timestamps |
| `revokedAt` | Set on revoke; `getValidTokenBundle` returns null |

---

## Internal API

| Function | Behavior |
|----------|----------|
| `saveTokenBundle()` | Encrypt and upsert tokens; returns `SafeTokenMetadata` |
| `saveTokenBundleFromOAuth()` | Maps `OAuthTokenBundle` → vault (callback hook; not wired yet) |
| `getValidTokenBundle()` | Server-only decrypt; null if revoked or expired |
| `markTokenRevoked()` | Sets `revokedAt`; returns safe metadata |
| `deleteTokenBundle()` | Removes record |
| `listTokenMetadata()` | All records as safe metadata |
| `assertTokenVaultReadyForProduction()` | Throws if encryption key missing in production |

---

## Encryption

| Control | Implementation |
|---------|----------------|
| Algorithm | AES-256-GCM |
| Key source | `SOURCES_TOKEN_ENCRYPTION_KEY` env var |
| Key derivation | 32-byte base64 key, or SHA-256 hash of passphrase |
| Payload format | `iv:authTag:ciphertext` (base64) |
| Production | Fails closed without key |
| Dev/test fallback | Deterministic test key when `ALLOW_TEST_ROUTES=1` or `NODE_ENV=test` |
| Logging | Tokens never logged |

---

## Persistence

| Backend | When | Location |
|---------|------|----------|
| `memory` | E2E (`SOURCES_TOKEN_VAULT_STORE=memory`) | In-process map |
| `file` | Local dev without Supabase | `.data/token-vault/state.json` |
| `supabase` | Production with credentials | `source_oauth_tokens` table |

Migration: `supabase/migrations/20260706_source_oauth_tokens.sql`

---

## Routes

| Route | Gating | Behavior |
|-------|--------|----------|
| `POST /api/test/token-vault` | `ALLOW_TEST_ROUTES=1` | Test actions: save, metadata, list, revoke, delete, verify-encryption, assert-server-decrypt |
| `GET /api/test/token-vault` | `ALLOW_TEST_ROUTES=1` | List metadata only |

**No public API returns tokens.** Test route never returns decrypted values.

`POST /api/test/reset-stores` now clears token vault store.

---

## Files created / updated

| Path | Change |
|------|--------|
| `src/modules/sources/token-vault/*.ts` | **New** — vault module (4 files) |
| `supabase/migrations/20260706_source_oauth_tokens.sql` | **New** |
| `app/api/test/token-vault/route.ts` | **New** — gated test route |
| `e2e/token-vault.spec.ts` | **New** — 8 tests |
| `app/api/test/reset-stores/route.ts` | Reset token vault |
| `playwright.config.ts` | `SOURCES_TOKEN_VAULT_STORE=memory`, encryption key for e2e |
| `src/modules/sources/oauth/oauth-flow.server.ts` | Comment: callback can call `saveTokenBundleFromOAuth` when providers ship |
| `docs/decisions/ADR-013-token-vault.md` | **New** |
| `docs/architecture/oauth.md` | Token vault integration path |
| `docs/architecture/production-persistence.md` | Token vault store row |

---

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Token vault module (4 files) | ✅ |
| 2 | Full token model with encrypted fields | ✅ |
| 3 | AES-256-GCM encryption from env key | ✅ |
| 4 | memory / file / Supabase backends | ✅ |
| 5 | Supabase migration `source_oauth_tokens` | ✅ |
| 6 | No public API returns tokens | ✅ |
| 7 | Internal save/get/revoke/delete/list functions | ✅ |
| 8 | OAuth callback integration hook (`saveTokenBundleFromOAuth`) | ✅ |
| 9 | E2E coverage (8 tests) | ✅ |
| 10 | No Instagram / LinkedIn / real providers | ✅ |
| 11 | TypeScript + build | ✅ |
| 12 | Existing e2e suites pass | ✅ (66 tests; 1 flaky with retry) |

---

## Verification

```bash
npx tsc --noEmit
npm run build
npx playwright test e2e/source-config.spec.ts e2e/urees-website.spec.ts e2e/sources.spec.ts e2e/knowledge.spec.ts e2e/intelligence.spec.ts e2e/brain-answer.spec.ts e2e/medium.spec.ts e2e/brain-summary.spec.ts e2e/sources-oauth.spec.ts e2e/token-vault.spec.ts
```

| Check | Result |
|-------|--------|
| `tsc --noEmit` | Pass |
| `npm run build` | Pass |
| E2E | 66 tests — 65 passed, 1 flaky (`sources.spec.ts` failed-sync; passed on retry) |
| Token vault e2e | 8/8 pass |

---

## What is NOT in Phase 13

- Instagram / LinkedIn OAuth provider registration
- Real provider API calls or token exchange
- Wiring OAuth callback to persist tokens (hook exists; not connected)
- Token refresh workers
- Frontend token access

---

## Next phase (not started)

Phase 14 candidates (require Giuseppe approval):

- Register first OAuth provider (Instagram Personal)
- Wire `saveTokenBundleFromOAuth` into OAuth callback flow
- Sources UI redirect for OAuth-capable Connect

---

## Related

- [`ADR-013-token-vault.md`](../decisions/ADR-013-token-vault.md)
- [`docs/architecture/oauth.md`](../architecture/oauth.md)
- [`docs/architecture/production-persistence.md`](../architecture/production-persistence.md)
- [`phase-12-report.md`](phase-12-report.md)

---

*Phase 13 complete. Stop here — do not start provider implementation.*
