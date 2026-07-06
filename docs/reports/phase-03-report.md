# Phase 3 — Website Connector (fiogiuseppe.com) Implementation Report

**Date:** 2026-07-06  
**Status:** Complete  
**Branch:** `main`  
**Report author:** Cursor agent session

---

## Summary

Phase 3 replaces the stub adapter for `website` with a **real public connector** for fiogiuseppe.com. Sync Now fetches profile metadata, posts RSS, and comments RSS; persists raw items, normalized items, and evidence; deduplicates by URL + content hash. Counts are greater than zero when public pages are found (mock fixtures in test mode).

No OAuth, Instagram, LinkedIn, or Medium connectors were implemented.

---

## Objectives

| # | Objective | Met? |
|---|-----------|------|
| 1 | Real connector for `website` / website_personal | Yes |
| 2 | Fetch public fiogiuseppe.com content | Yes |
| 3 | Extract URL, title, description, content, metadata, collectedAt | Yes |
| 4 | Store raw + normalized items | Yes |
| 5 | Deduplicate by URL + content hash | Yes |
| 6 | Sync counts > 0 when pages found | Yes |
| 7 | Update lastSyncAt / lastSuccessfulSyncAt / health | Yes |
| 8 | No OAuth / Instagram / LinkedIn / Medium | Yes |

---

## Files Created

| Path | Purpose |
|------|---------|
| `src/modules/sources/connectors/types.ts` | Connector interface |
| `src/modules/sources/connectors/registry.server.ts` | Website connector registration |
| `src/modules/sources/connectors/fiogiuseppe-website.connector.server.ts` | Phase 3 website connector |
| `src/modules/sources/connectors/fetch/fiogiuseppe-website.fetch.server.ts` | Public RSS + profile fetch |
| `src/modules/sources/platform/adapters/connector.adapter.server.ts` | Connector → adapter bridge |
| `src/modules/sources/platform/engine/source-evidence-persistence.server.ts` | Raw + normalized + evidence with dedup |
| `docs/architecture/sources.md` | Sources architecture doc |

---

## Files Modified

| Path | Change |
|------|--------|
| `src/modules/sources/platform/adapter-registry.server.ts` | Register website connector adapter |
| `src/modules/sources/platform/sync/sync-engine.server.ts` | Evidence persistence + failed health handling |
| `src/modules/sources/platform/engine/source-engine.server.ts` | Sync run summary includes normalized/evidence |
| `src/modules/sources/providers/source-provider.types.ts` | `SourceSyncRunSummary` + normalized/evidence |
| `lib/data-sources/store/types.ts` | Added `findRawItem` |
| `lib/data-sources/store/inMemoryStore.ts` | Implemented `findRawItem` |
| `lib/data-sources/store/supabase.ts` | Implemented `findRawItem` |
| `e2e/sources.spec.ts` | Phase 3 website + dedup tests |
| `docs/SOURCES_ROADMAP.md` | Phase 3 marked complete |

---

## Folder Structure

```
src/modules/sources/
├── connectors/                          # Phase 3 — active
│   ├── types.ts
│   ├── registry.server.ts
│   ├── fiogiuseppe-website.connector.server.ts
│   └── fetch/
│       └── fiogiuseppe-website.fetch.server.ts
├── platform/
│   ├── adapters/
│   │   ├── connector.adapter.server.ts  # New
│   │   └── stub.adapter.server.ts
│   └── engine/
│       └── source-evidence-persistence.server.ts
└── _phase2/                             # Archived — not compiled
```

---

## Database Changes

No new migrations. Phase 3 uses existing:

- `source_connections` / `source_sync_runs` (Sources engine)
- `raw_source_items` / `normalized_source_items` / `evidence_items` (data-sources store, when Supabase configured)

In test/dev, in-memory stores are used.

---

## API Routes

| Method | Route | Phase 3 behavior |
|--------|-------|------------------|
| `GET` | `/api/sources` | Website shows real sync metadata after sync |
| `POST` | `/api/sources` | `website` + `sync` fetches real public data |
| `GET` | `/api/sources/website/sync-runs` | Logs include fetched/normalized/evidence counts |

No new routes added.

---

## Components

No UI component changes. Existing Connect / Sync Now on `SourceCard` drives the real connector for `website`.

---

## Services

| Service | Role |
|---------|------|
| `fiogiuseppeWebsiteConnector` | Fetches public RSS + profile |
| `fetchFiogiuseppeWebsite` | HTTP fetch, field extraction, mock mode |
| `createConnectorAdapter` | Wires connector into platform adapter |
| `persistSourceEvidenceItems` | Raw → normalized → evidence with dedup |
| `runSyncWithEngine` | Orchestrates sync + persistence + logging |

---

## Security Decisions

1. **Public data only** — RSS and HTML meta; no authentication, no private endpoints.
2. **Rate limits** — sync-engine rate limiter + max 12 posts / 10 comments per sync.
3. **User-Agent** — `GiuseppeOS-PresenceBot/1.0` on outbound requests.
4. **Test fixtures** — mock fetch only when `ALLOW_TEST_ROUTES=1` or `SOURCES_WEBSITE_MOCK_FETCH=1`.
5. **No secrets in API** — unchanged safe metadata contract.
6. **Timeout** — 15s per HTTP request.

| Risk | Level | Mitigation |
|------|-------|------------|
| SSRF via connector | Low | URLs hardcoded to fiogiuseppe.com feeds |
| Data store growth | Low | Dedup on URL + hash |
| Test mock mistaken for prod | Low | Env-gated mock fetch |

---

## Performance Notes

- Three parallel HTTP requests per sync (home, posts feed, comments feed).
- RSS parsing in-process; no full HTML crawl.
- In-memory dedup check per item via `findRawItem`.
- Next.js `fetch` cache revalidate 3600s on presence HTTP helper.

---

## Tests Executed

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | **Pass** |
| `npm run build` | **Pass** |
| `npx playwright test e2e/sources.spec.ts` | **5/5 pass** |

### Coverage summary

- Six sources API safety (no secrets)
- Dashboard renders Personal + UREES
- Website connect → sync → normalized/evidence > 0 → healthy
- Second website sync → normalized = 0 (dedup)
- Medium stub connect/sync/disconnect still works
- Simulated failed sync → unavailable + failed log

---

## Build Result

```
npm run build — SUCCESS
/sources — static
/api/sources — dynamic
```

---

## TypeScript Result

```
npx tsc --noEmit — Pass (exit 0)
```

---

## Known Limitations

1. **RSS-only** — does not crawl arbitrary site pages; full HTML page extraction is future work.
2. **Comments feed optional** — failure is non-fatal (empty catch).
3. **Evidence model** — uses existing `lib/data-sources` analyze/evidence; unified evidence schema is Phase 6.
4. **UREES website** — still stub; Phase 4.
5. **In-memory store** — dedup resets on process restart in dev/test.
6. **Connector adapter writes connection state** — sync-engine also writes; last writer wins (consistent today).

---

## Future Improvements

- Robots.txt explicit check before fetch
- Incremental sync respects `syncCursor` more strictly across item types
- Expose normalized count on `SourceProviderStatus` top-level (not only `lastSyncRun`)
- Reset data-sources store hook for isolated parallel e2e

---

## Next Recommended Phase

**Phase 4 — Website Connector: UREES Website**

1. Generic configurable website connector (URL + source ID).
2. Register `urees-website` with `urees.shop` public JSON/RSS.
3. Reuse fetch + persistence patterns from Phase 3 — no duplicated logic.
4. ADR: generic website connector configuration shape.

---

## Related documentation

- Architecture: [`../architecture/sources.md`](../architecture/sources.md)
- Roadmap: [`../roadmap/master-roadmap.md`](../roadmap/master-roadmap.md)
- Template: [`REPORT_TEMPLATE.md`](REPORT_TEMPLATE.md)

---

*Phase 3 complete. Giuseppe OS now learns from real synchronized website evidence for fiogiuseppe.com.*
