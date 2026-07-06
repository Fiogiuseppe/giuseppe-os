# ADR-007: Configurable website connectors for multi-site public sync

**Status:** Accepted  
**Date:** 2026-07-06  
**Deciders:** Giuseppe, engineering agent  
**Supersedes:** —  
**Superseded by:** —

---

## Decision

Giuseppe OS website connectors share one **configurable architecture** under `src/modules/sources/connectors/website/`. Each connector is defined by configuration:

- `sourceId`, `owner`, `baseUrl`
- Optional `feedUrl`, `sitemapUrl`, `productsJsonUrl`
- `maxPages`

Phase 7 adds `urees-website` (`connectorId: website_urees`) using the official URL **`https://urees.shop/`** from `lib/presence/official-source-urls.ts`. Optional `UREES_WEBSITE_URL` env override. fiogiuseppe.com is refactored to the same fetch and connector factory — no duplicated logic.

fiogiuseppe.com (`website`) is refactored to use the same fetch and connector factory — no duplicated logic.

---

## Context

Phase 3 implemented a fiogiuseppe-specific fetch module. Sources roadmap requires UREES shop sync with the same raw → normalized → evidence → knowledge pipeline. Duplicating fetch, dedup, and connector wiring would diverge over time.

UREES may expose Shopify `products.json` rather than WordPress RSS. The shared fetch layer must support multiple public endpoint types.

---

## Alternatives Considered

### Option A — Copy fiogiuseppe connector for UREES

**Pros:** Fast, isolated.  
**Cons:** Duplicated fetch, hash, RSS parsing, connector lifecycle.

### Option B — Single generic connector with runtime config only (chosen)

**Pros:** One fetch implementation; per-source configs; env-driven UREES URL; test mocks per config.  
**Cons:** Config object grows; sitemap/products parsing stays in one module until split is warranted.

### Option C — Separate data pipeline source ID for UREES

**Pros:** Cleaner store separation.  
**Cons:** Requires new `DataSourceId` and migrations. Deferred — UREES uses `website` pipeline with `account: urees`.

---

## Why This Was Chosen

Option B satisfies Phase 7 constraints: reuse architecture, no fake URLs, safe failure when unconfigured, evidence + knowledge after sync.

Account-scoped raw items (`fiogiuseppe` vs `urees`) keep dedup correct within the existing `website` data source.

---

## Consequences

### Positive

- fiogiuseppe and UREES share `fetchConfigurableWebsite` and `createWebsiteConnector`
- Official UREES URL `https://urees.shop/` in central registry; no invented URLs
- `UREES_WEBSITE_URL` optional env override
- Shopify products JSON and RSS feeds supported from one module
- Knowledge extractor extended to `urees-website` without new LLM logic

### Negative

- Real UREES fetch depends on public site shape (Shopify JSON, feeds)
- Sitemap page fetch is best-effort and may be slow on large sites

### Follow-up

- Medium RSS connector using same pattern where applicable
- Optional dedicated `DataSourceId` if store volume requires it
- Scheduled sync and richer UREES product normalization

---

## References

- [`docs/reports/phase-07-report.md`](../reports/phase-07-report.md)
- [`docs/architecture/sources.md`](../architecture/sources.md)
- [`ADR-004-knowledge-layer.md`](ADR-004-knowledge-layer.md)
