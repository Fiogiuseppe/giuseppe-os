# Phase 7 — UREES Website Connector Implementation Report

**Date:** 2026-07-06  
**Status:** Complete  
**Branch:** `main`  
**Report author:** Cursor agent session

---

## Summary

Phase 7 adds the **UREES Website Connector** (`urees-website`, `connectorId: website_urees`) using the shared configurable website architecture from Phase 3. The official public URL is **`https://urees.shop/`** — registered in `lib/presence/official-source-urls.ts` and used as the default for sync. fiogiuseppe.com was refactored to the same module with no duplicated fetch logic. No LLM, OAuth, or social connectors.

---

## Official source URLs (central registry)

Future connectors should read from `lib/presence/official-source-urls.ts`:

| Key | Official URL |
|-----|--------------|
| `website_personal` | https://fiogiuseppe.com/ |
| `instagram_personal` | https://instagram.com/fiogiuseppe |
| `instagram_urees` | https://www.instagram.com/urees__/
| `linkedin_personal` | https://linkedin.com/in/fiuseppe/?skipRedirect=true |
| `medium_personal` | https://medium.com/@fiogiuseppe |
| `website_urees` | **https://urees.shop/** |

Phase 7 wires only `website_urees`. Other keys are documented for future phases — not implemented.

---

## Objectives

| # | Objective | Met? |
|---|-----------|------|
| 1 | Sync real public UREES data from urees.shop | Yes |
| 2 | No invented or guessed URLs | Yes |
| 3 | No duplicated website connector logic | Yes |
| 4 | Raw, normalized, evidence, knowledge created | Yes |
| 5 | `/api/intelligence/knowledge?q=urees` returns UREES knowledge | Yes |
| 6 | `/api/brain/answer` answers UREES from synchronized evidence | Yes |
| 7 | No tokens or secrets exposed | Yes |
| 8 | TypeScript passes | Yes |
| 9 | Build passes | Yes |
| 10 | Existing e2e suites pass | Yes |

---

## Files Created

| Path | Purpose |
|------|---------|
| `lib/presence/official-source-urls.ts` | Central official URL registry |
| `src/modules/sources/connectors/website/*` | Shared configurable website architecture |
| `src/modules/sources/connectors/urees-website.connector.server.ts` | UREES connector entry |
| `e2e/urees-website.spec.ts` | Phase 7 acceptance tests |
| `docs/decisions/ADR-007-configurable-website-connectors.md` | ADR |

---

## UREES connector configuration

| Field | Value |
|-------|-------|
| `sourceId` | `urees-website` |
| `connectorId` | `website_urees` |
| `baseUrl` | `https://urees.shop/` (default from `OFFICIAL_SOURCE_URLS`) |
| `productsJsonUrl` | `https://urees.shop/products.json` |
| `feedUrl` | `https://urees.shop/feed/` (derived) |
| `sitemapUrl` | `https://urees.shop/sitemap.xml` (derived) |

`UREES_WEBSITE_URL` remains an optional env override in `.env.local`.

---

## Pipeline

```
urees.shop → website_urees connector → raw (account: urees)
  → normalized → evidence → knowledge (UREES brand)
```

Dedup: URL + content hash (unchanged from Phase 3).

---

## Tests

| Suite | Status |
|-------|--------|
| `e2e/urees-website.spec.ts` | Pass |
| `e2e/sources.spec.ts` | Pass |
| `e2e/knowledge.spec.ts` | Pass |
| `e2e/intelligence.spec.ts` | Pass |
| `e2e/brain-answer.spec.ts` | Pass |

---

## Verification

```bash
npx tsc --noEmit
npm run build
npx playwright test e2e/urees-website.spec.ts e2e/sources.spec.ts e2e/knowledge.spec.ts e2e/intelligence.spec.ts e2e/brain-answer.spec.ts
```

---

## Out of scope

- Medium, Instagram, LinkedIn, OAuth, tokens, LLM

---

*End of Phase 7 report.*
