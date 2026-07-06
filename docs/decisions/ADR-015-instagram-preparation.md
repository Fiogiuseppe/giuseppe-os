# ADR-015: Instagram preparation guide before provider implementation

**Status:** Accepted  
**Date:** 2026-07-06  
**Deciders:** Giuseppe, engineering agent  
**Supersedes:** —  
**Superseded by:** —

---

## Decision

1. Add **`docs/setup/instagram.md`** as the canonical Meta/Instagram preparation guide for Giuseppe OS.
2. **Defer Phase 16** (real Instagram OAuth provider code) until Giuseppe completes the implementation readiness checklist in that guide.
3. Document env placeholders (`META_CLIENT_ID`, `META_CLIENT_SECRET`, `META_REDIRECT_URI`, `META_APP_ID`, `META_APP_SECRET`) without adding them to application code in Phase 15.
4. **No Meta API calls**, **no provider adapter**, and **no real tokens** in Phase 15.

---

## Context

Phases 12–14 delivered OAuth routes, Token Vault encryption, callback persistence, and a test-only provider. Instagram sources (`instagram_personal`, `instagram_urees`) are configured but not connectable with real credentials. Meta setup is non-trivial (developer app, account types, Page linkage, redirect URIs, scope review). A written guide reduces security mistakes and prevents premature implementation.

---

## Alternatives considered

### Option A — Implement Instagram OAuth immediately

**Pros:** Faster path to data.  
**Cons:** High risk without confirmed Meta app, scopes, and account types; violates phased discipline.

### Option B — Preparation guide only (chosen)

**Pros:** Clear gate for Phase 16; documents security rules; no code churn.  
**Cons:** Instagram sources remain non-functional with real accounts until next phase.

### Option C — Embed setup steps only in phase report

**Pros:** Less file surface.  
**Cons:** Harder to find during setup; reports are historical, setup docs should be living.

---

## Consequences

### Positive

- Single source of truth for Meta preparation
- Explicit “do not proceed until” gate for Phase 16
- Aligns with constitution: secrets never in chat/git/frontend

### Negative

- Giuseppe must complete manual Meta dashboard work before engineering continues
- Scope names may need updates when Meta changes APIs

---

## References

- [`docs/setup/instagram.md`](../setup/instagram.md)
- [`docs/reports/phase-15-report.md`](../reports/phase-15-report.md)
- [`ADR-014-oauth-token-persistence.md`](ADR-014-oauth-token-persistence.md)
