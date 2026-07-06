# ADR-008: Official source configuration with canonical IDs

**Status:** Accepted  
**Date:** 2026-07-06  
**Deciders:** Giuseppe, engineering agent  
**Supersedes:** ADR-007 partial URL registry (`lib/presence/official-source-urls.ts` as primary)  
**Superseded by:** —

---

## Decision

All six Giuseppe OS sources are defined in **`src/modules/sources/config/source-config.ts`** with:

- Canonical IDs: `website_personal`, `instagram_personal`, `linkedin_personal`, `medium_personal`, `website_urees`, `instagram_urees`
- Official public URLs (operator-confirmed, not guessed)
- Provider metadata (label, permissions, auth method, seeded health notes)

Legacy aliases (`website`, `urees-website`, etc.) are accepted at API boundaries via `normalizeSourceId()` and mapped to canonical IDs.

LinkedIn official URL is **`https://linkedin.com/in/fiogiuseppe/?skipRedirect=true`**.

---

## Context

Phase 7 introduced UREES website sync with URLs split across `lib/presence/official-source-urls.ts`, provider registry, and connector configs. Source IDs were inconsistent (`website` vs `website_personal`, `urees-website` vs `website_urees`). LinkedIn URL was incorrect (`/in/fiuseppe/`).

---

## Alternatives Considered

### Option A — Keep legacy IDs, document mapping only

**Pros:** No migration.  
**Cons:** Continued ambiguity; tests and knowledge records use mixed IDs.

### Option B — Canonical IDs + central config + legacy normalization (chosen)

**Pros:** Single source of truth; safe API migration; connectors read config only.  
**Cons:** One-time rename across modules and tests.

---

## Consequences

### Positive

- `getSourceConfig`, `requireSourceConfig`, `listSourceConfigs`, `getOfficialSourceUrl` helpers
- No hardcoded URLs in connectors or registry
- Legacy API clients still work via normalization

### Negative

- Stored connection/sync data from old IDs may need re-seed in dev (test reset handles e2e)
- `lib/presence/official-source-urls.ts` is now a thin re-export (deprecated path)

---

## References

- [`docs/reports/phase-08-report.md`](../reports/phase-08-report.md)
- [`ADR-007-configurable-website-connectors.md`](ADR-007-configurable-website-connectors.md)
