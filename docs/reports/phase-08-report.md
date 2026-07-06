# Phase 8 — Source Configuration Cleanup Implementation Report

**Date:** 2026-07-06  
**Status:** Complete  
**Branch:** `main`  
**Report author:** Cursor agent session

---

## Summary

Phase 8 centralizes all six official source definitions in **`src/modules/sources/config/source-config.ts`**, standardizes canonical source IDs, fixes the LinkedIn URL, and removes hardcoded URLs from connectors and registry. Legacy aliases (`website`, `urees-website`, etc.) normalize at API boundaries.

---

## Canonical source IDs

| ID | Official URL |
|----|--------------|
| `website_personal` | https://fiogiuseppe.com/ |
| `instagram_personal` | https://instagram.com/fiogiuseppe |
| `linkedin_personal` | https://linkedin.com/in/fiogiuseppe/?skipRedirect=true |
| `medium_personal` | https://medium.com/@fiogiuseppe |
| `website_urees` | https://urees.shop/ |
| `instagram_urees` | https://www.instagram.com/urees__/ |

---

## Legacy alias mapping

| Legacy | Canonical |
|--------|-----------|
| `website` | `website_personal` |
| `instagram` | `instagram_personal` |
| `linkedin` | `linkedin_personal` |
| `medium` | `medium_personal` |
| `urees-website` | `website_urees` |
| `urees-instagram` | `instagram_urees` |

---

## Helper functions

| Function | Purpose |
|----------|---------|
| `getSourceConfig(sourceId)` | Lookup config (accepts legacy ID) |
| `requireSourceConfig(sourceId)` | Lookup or throw |
| `listSourceConfigs()` | All six configs |
| `getOfficialSourceUrl(sourceId)` | Official URL only |
| `normalizeSourceId(value)` | Legacy → canonical |

---

## Files Created

| Path | Purpose |
|------|---------|
| `src/modules/sources/config/source-config.ts` | Central source registry |
| `e2e/source-config.spec.ts` | Config acceptance tests |
| `docs/decisions/ADR-008-official-source-configuration.md` | ADR |

---

## Files Modified (high level)

- `source-provider.types.ts`, `source-registry.ts`, `source-groups.ts` — canonical IDs
- Website connector configs — read from `source-config`
- Adapter/connector registries — `website_personal`, `website_urees`
- Knowledge extractors, pipeline maps, e2e suites — canonical IDs
- `lib/presence/official-source-urls.ts` — re-exports from source-config

---

## Tests

| Suite | Tests | Status |
|-------|-------|--------|
| `e2e/source-config.spec.ts` | 6 | Pass |
| `e2e/sources.spec.ts` | 5 | Pass |
| `e2e/urees-website.spec.ts` | 5 | Pass |
| `e2e/knowledge.spec.ts` | 4 | Pass |
| `e2e/intelligence.spec.ts` | 7 | Pass |
| `e2e/brain-answer.spec.ts` | 9 | Pass |

---

## Verification

```bash
npx tsc --noEmit
npm run build
npx playwright test e2e/source-config.spec.ts e2e/urees-website.spec.ts e2e/sources.spec.ts e2e/knowledge.spec.ts e2e/intelligence.spec.ts e2e/brain-answer.spec.ts
```

---

## Out of scope

- New connectors, Medium, Instagram, LinkedIn, OAuth, tokens, LLM

---

*End of Phase 8 report.*
