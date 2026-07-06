# Phase 2 — Sources Engine Implementation Report

**Date:** 2026-07-06  
**Status:** Complete  
**Branch:** `main`

---

## Summary

Phase 2 activates the **Sources Engine** — a server-side platform that persists connection state, sync run logs, permissions, and data-collection metadata for all six sources. Connect, disconnect, and Sync Now are wired end-to-end through a safe metadata API. The UI updates from backend state.

No external APIs, OAuth flows, or tokens are used. All six sources run through **stub adapters** that simulate connection and sync internally. Real connectors, feed fetching, and OAuth remain in later phases (`_phase2/` archive and beyond).

---

## Files created

| Path | Purpose |
|------|---------|
| `src/modules/sources/platform/**` | Active Sources Engine (moved from `_phase2/platform`, trimmed for Phase 2) |
| `src/modules/sources/platform/adapter-registry.server.ts` | Phase 2 registry — stub adapters only |
| `src/modules/sources/platform/adapters/stub.adapter.server.ts` | Internal connect/sync without external calls |
| `src/modules/sources/platform/engine/source-engine.server.ts` | Safe metadata builder for API/UI |
| `src/modules/sources/platform/engine/connection-persistence.server.ts` | Connection state read/write |
| `src/modules/sources/platform/engine/sync-run-persistence.server.ts` | Sync log persistence |
| `src/modules/sources/platform/store/memoryStore.server.ts` | In-memory store (tests/dev) |
| `src/modules/sources/platform/store/fileStore.server.ts` | File-backed store (`.data/sources-engine/`) |
| `src/modules/sources/platform/store/supabaseStore.server.ts` | Supabase store (production) |
| `docs/reports/phase-02-report.md` | This report |

---

## Files modified

| Path | Change |
|------|--------|
| `app/api/sources/route.ts` | GET uses engine; POST handles connect/disconnect/sync |
| `app/api/sources/[provider]/sync-runs/route.ts` | Returns safe sync run metadata |
| `src/modules/sources/providers/source-provider.types.ts` | Added `authMethod`, `lastSuccessfulSyncAt`, `SourceAuthMethod` |
| `src/modules/sources/providers/source-registry.ts` | Added `authMethod` per provider; `isSourceActive`, `getSourceAvailability` |
| `src/modules/sources/components/SourcesDashboard.tsx` | Connect wired to engine actions |
| `src/modules/sources/index.ts` | Exports platform engine surface |
| `e2e/sources.spec.ts` | Phase 2 tests (connect, sync, disconnect, failed sync) |
| `supabase/migrations/20260706_sources_engine.sql` | Added `last_successful_sync_at` column |
| `docs/SOURCES_ROADMAP.md` | Phase 2 marked complete |

---

## Folder structure

```
src/modules/sources/
├── components/
│   ├── SourceCard.tsx
│   ├── SourceCard.module.css
│   ├── SourcesDashboard.tsx
│   └── SourcesDashboard.module.css
├── platform/                          # Phase 2 — active engine
│   ├── adapter-registry.server.ts
│   ├── adapter.types.ts
│   ├── adapters/
│   │   └── stub.adapter.server.ts       # Only adapter in Phase 2
│   ├── auth/types.ts
│   ├── connection-state.server.ts
│   ├── credentials-vault.server.ts      # In-memory only; no tokens stored
│   ├── engine/
│   │   ├── connection-persistence.server.ts
│   │   ├── raw-data-persistence.server.ts
│   │   ├── source-engine.server.ts
│   │   └── sync-run-persistence.server.ts
│   ├── models/
│   │   ├── data-collected.ts
│   │   └── permissions.ts
│   ├── platform.server.ts               # Public engine API
│   ├── pipeline-bridge.server.ts
│   ├── store/
│   │   ├── memoryStore.server.ts
│   │   ├── fileStore.server.ts
│   │   ├── supabaseStore.server.ts
│   │   ├── resolve-backend.ts
│   │   └── types.ts
│   └── sync/
│       ├── sync-engine.server.ts
│       ├── sync-log.server.ts
│       └── rate-limiter.server.ts
├── providers/
│   ├── source-provider.types.ts
│   ├── source-registry.ts
│   └── source-groups.ts
├── services/
│   ├── sources.client.ts
│   ├── sources.server.ts
│   └── phase1-mock-status.server.ts     # Unused; retained for reference
└── _phase2/                             # Excluded from build — Phases 3–12
    ├── connectors/
    ├── oauth/
    └── adapters/

app/
├── api/sources/
│   ├── route.ts                         # GET list, POST actions
│   ├── [provider]/
│   │   ├── connect/route.ts             # 404 — OAuth Phase 9
│   │   └── sync-runs/route.ts           # GET sync logs
│   └── oauth/callback/route.ts          # 404 — OAuth Phase 9
└── sources/
    └── page.tsx

e2e/
└── sources.spec.ts

supabase/migrations/
└── 20260706_sources_engine.sql
```

---

## Database changes

Migration `20260706_sources_engine.sql` defines:

### `source_connections`

| Column | Type | Notes |
|--------|------|-------|
| `source_id` | `text` PK | One of six provider IDs |
| `connection_status` | `text` | `connected`, `disconnected`, `needs_auth`, `error` |
| `health_status` | `text` | `healthy`, `degraded`, `unavailable`, `unknown` |
| `last_sync_at` | `timestamptz` | Last sync attempt |
| `last_successful_sync_at` | `timestamptz` | Last successful sync (Phase 2) |
| `permissions_granted` | `jsonb` | Granted permission labels |
| `data_collection_enabled` | `jsonb` | Enabled data types |
| `health_note` | `text` | Human-readable health context |
| `sync_cursor` | `text` | Incremental sync cursor (future) |
| `connected_at` | `timestamptz` | When connection was established |
| `updated_at` | `timestamptz` | Last state update |

### `source_sync_runs`

| Column | Type | Notes |
|--------|------|-------|
| `id` | `text` PK | Sync run ID |
| `source_id` | `text` FK | References `source_connections` |
| `mode` | `text` | `manual`, `scheduled`, `incremental` |
| `status` | `text` | `success`, `partial`, `failed`, `skipped` |
| `started_at` / `finished_at` | `timestamptz` | Run window |
| `fetched` / `normalized` / `evidence` | `integer` | Counts (0 in Phase 2 stub) |
| `error_message` | `text` | Safe error summary |

**Store backend resolution:** `SOURCES_ENGINE_STORE` env (`memory` | `file` | `supabase`). Playwright uses `memory`; local dev defaults to `file` when unset.

---

## API routes added

| Method | Route | Phase 2 behavior |
|--------|-------|------------------|
| `GET` | `/api/sources` | Returns six sources with safe persisted metadata |
| `POST` | `/api/sources` | `{ sourceId, action: connect\|disconnect\|sync }` — updates state |
| `GET` | `/api/sources/[provider]/sync-runs` | Returns safe sync run list for provider |
| `GET` | `/api/sources/[provider]/connect` | **404** — OAuth ships Phase 9 |
| `GET` | `/api/sources/oauth/callback` | **404** — OAuth ships Phase 9 |

**Safe metadata guarantee:** Responses never include `accessToken`, `refreshToken`, `clientSecret`, or raw sync payloads.

**Test-only:** `simulateFailure: true` on sync POST when `ALLOW_TEST_ROUTES=1` forces a failed sync for e2e validation.

---

## Components added

No new components. Existing components updated:

| Component | Change |
|-----------|--------|
| `SourcesDashboard` | Connect button calls engine; disconnect/sync refresh card state |
| `SourceCard` | Displays connection status, health, last sync, permissions, data collected |

---

## Services added

| Service | Role |
|---------|------|
| `platform.server.ts` | `listProviderStatuses`, `connectSource`, `disconnectSource`, `syncSource`, `applyPlatformAction`, `listSourceSyncRuns` |
| `source-engine.server.ts` | Builds `SourceProviderStatus` from persistence + adapter health |
| `connection-persistence.server.ts` | CRUD for `source_connections` |
| `sync-run-persistence.server.ts` | Append/list sync runs |
| `sync-engine.server.ts` | Orchestrates sync with retry, rate limit, logging |
| `stub.adapter.server.ts` | Phase 2 adapter — internal connect/sync only |
| `permissions.ts` / `data-collected.ts` | Permission and data-collection models |
| `memoryStore` / `fileStore` / `supabaseStore` | Pluggable persistence backends |

---

## Security decisions

1. **No tokens in API responses** — `SourceProviderStatus` is a safe DTO; credentials vault is server-only and unused in Phase 2.
2. **OAuth routes disabled** — connect/callback return 404 until Phase 9.
3. **Stub-only adapters** — no outbound HTTP to Instagram, LinkedIn, Medium, or websites.
4. **Server-side state only** — connection and sync data never written to `localStorage`.
5. **Test failure simulation gated** — `simulateFailure` only honored when `ALLOW_TEST_ROUTES=1`.
6. **Rate limiter** — per-source sync rate limiting in engine (prevents abuse in later phases).
7. **Supabase migration** — schema ready for production persistence; tokens table deferred to Phase 10.

---

## What is still mocked

| Area | Status |
|------|--------|
| External API calls | None — stub adapter fetches zero items |
| OAuth (Instagram, LinkedIn, UREES Instagram) | `needs_auth` seed state; Connect uses stub (no real OAuth) |
| Feed connectors (Medium, websites) | Stub sync only — no RSS/HTTP |
| Raw / normalized evidence | `fetched: 0`, `normalized: 0`, `evidence: 0` on every sync |
| Token vault | In-memory scaffold only; no encrypted storage |
| Scheduled sync | Hook exists (`runScheduledSync`); no cron |
| Instagram / LinkedIn insights | Not available |

---

## What is real

| Area | Status |
|------|--------|
| Connection persistence | Real — memory/file/supabase backends |
| Connect / disconnect | Real state transitions |
| Sync run logs | Real — appended on every sync |
| `lastSyncAt` | Real — updated on sync |
| `lastSuccessfulSyncAt` | Real — updated on successful sync |
| Health status | Real — `healthy`, `degraded`, `unavailable`, `error` |
| Permissions model | Real — declared vs granted |
| Data collected model | Real — catalog vs enabled |
| Safe metadata API | Real — GET/POST `/api/sources` |
| Sync runs API | Real — GET `/api/sources/[provider]/sync-runs` |
| UI state refresh | Real — cards update after actions |

---

## Tests executed

| Command | Result |
|---------|--------|
| `npx playwright test e2e/sources.spec.ts` | **4/4 passed** |
| `npx tsc --noEmit` | **Passed** |
| `npm run build` | **Passed** |

### E2E coverage

1. GET `/api/sources` — six sources, no secrets
2. `/sources` page — Personal + UREES groups render
3. Connect → sync → disconnect — state updates, sync log created
4. Failed sync (`simulateFailure`) — `healthStatus: unavailable`, failed sync log

---

## Build result

```
npm run build — SUCCESS
Route /sources — static
Route /api/sources — dynamic
Route /api/sources/[provider]/sync-runs — dynamic
```

---

## TypeScript result

```
npx tsc --noEmit — SUCCESS (exit 0)
```

Phase 2-specific type errors resolved by:
- Stub-only adapter registry (removed connector/feed/oauth2 adapter imports)
- Trimmed `pipeline-bridge` map to six source IDs
- Added `lastSuccessfulSyncAt` to store types

---

## Known limitations

1. **Stub sync fetches no data** — counts are always zero until Phase 3+ connectors.
2. **OAuth sources show `needs_auth` initially** but Connect uses stub (not real OAuth) — intentional for Phase 2 internal testing.
3. **Migration may not be applied** to remote Supabase until manually run; file/memory stores work without it.
4. **`phase1-mock-status.server.ts`** retained but unused.
5. **`_phase2/` code** has broken relative imports if moved back without path fixes — reactivation requires careful merge per phase.
6. **Connect/disconnect tests share memory store** — parallel e2e may need isolation if expanded.

---

## Next recommended phase

**Phase 3 — Website Connector: fiogiuseppe.com**

1. Activate `website` connector from `_phase2/connectors/` (or reimplement cleanly).
2. Replace stub adapter for `website` with `createConnectorAdapter` in registry.
3. Fetch public pages from fiogiuseppe.com (RSS/HTML).
4. Store raw items + normalized items with URL/hash deduplication.
5. Sync Now returns real `fetched > 0`; health becomes `healthy` on success.
6. Still no OAuth, no tokens.

---

*Giuseppe OS learns only from real synchronized evidence. Phase 2 built the engine; Phase 3 brings the first real data.*
