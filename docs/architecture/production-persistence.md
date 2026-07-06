# Production Persistence

How Giuseppe OS persists Sources, Knowledge, and Brain read layers — and how backends are selected per environment.

**Status:** Phase 11 audit (2026-07-06). No OAuth token tables yet.

---

## Architecture overview

```
Connectors (website, medium)
  → Sources Engine store     (connections, sync runs)
  → Data Sources store       (raw → normalized → evidence)
  → Knowledge store          (structured knowledge)
  → Intelligence Read        (read-only query over knowledge)
  → Brain Answer / Summary   (read-only over Intelligence Read)
```

Intelligence Read and Brain layers **never** read raw provider payloads directly.

---

## Store matrix

| Layer | Module | Tables / files | Backends | Production default |
|-------|--------|----------------|----------|-------------------|
| **Sources Engine** | `src/modules/sources/platform/store/` | `source_connections`, `source_sync_runs` | memory, file, Supabase | Supabase when configured; else file (`.data/sources-engine/`) |
| **Raw items** | `lib/data-sources/store/` | `raw_source_items` | memory, Supabase | Supabase when configured; else memory |
| **Normalized items** | `lib/data-sources/store/` | `normalized_source_items` | memory, Supabase | same |
| **Evidence** | `lib/data-sources/store/` | `evidence_items` | memory, Supabase | same |
| **Knowledge** | `src/modules/knowledge/store/` | `knowledge_items` | memory, file, Supabase | Supabase when configured; else file (`.data/knowledge/`) |
| **Intelligence Read** | `src/modules/intelligence/read/` | — (queries Knowledge store) | — | inherits Knowledge backend |
| **Brain Answer** | `src/modules/brain/answer/` | — (queries Intelligence Read) | — | no persistence |
| **Brain Summary** | `src/modules/brain/summary/` | — (queries Intelligence Read) | — | no persistence |

### Backend resolution

| Env variable | Effect |
|--------------|--------|
| `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` | Enables Supabase backends when store env vars do not force memory |
| `SOURCES_ENGINE_STORE=memory` | Forces in-memory Sources Engine (e2e) |
| `KNOWLEDGE_STORE=memory` | Forces in-memory Knowledge (e2e) |
| `DATA_SOURCES_STORE=memory` | Forces in-memory raw/normalized/evidence (e2e) |
| `NODE_ENV=test` | Sources Engine and Knowledge default to memory if Supabase not configured |

Resolver files:

- `src/modules/sources/platform/store/resolve-backend.ts`
- `src/modules/knowledge/store/resolve-backend.ts`
- `lib/data-sources/store/types.ts` → `resolveDataSourceStoreBackend()`

---

## Environment variables

### Required for Supabase production

| Variable | Purpose |
|----------|---------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-side only — never expose to browser |

### Sources & knowledge (optional overrides)

| Variable | Values | Default |
|----------|--------|---------|
| `SOURCES_ENGINE_STORE` | `memory` | Supabase → file |
| `KNOWLEDGE_STORE` | `memory` | Supabase → file |
| `DATA_SOURCES_STORE` | `memory` | Supabase → memory |

### Test / dev only

| Variable | Purpose |
|----------|---------|
| `ALLOW_TEST_ROUTES=1` | Enables `/api/test/reset-stores`, `simulateFailure` on sync |
| `SOURCES_WEBSITE_MOCK_FETCH=1` | Mock website RSS/HTML in dev |
| `SOURCES_MEDIUM_MOCK_FETCH=1` | Mock Medium RSS in dev |
| `PLAYWRIGHT_PORT` | E2E dev server port (default `3010`) |

**Never set `ALLOW_TEST_ROUTES=1` in production.**

---

## Local development

Without Supabase credentials:

- Sources Engine → file (`.data/sources-engine/state.json`)
- Knowledge → file (`.data/knowledge/state.json`)
- Raw / normalized / evidence → in-memory (lost on restart)

With Supabase credentials:

- All pipeline stores use Supabase tables from migrations.

Connectors fetch public URLs (or mocks when `ALLOW_TEST_ROUTES=1` in Playwright).

---

## Test behavior (Playwright)

`playwright.config.ts` starts the dev server with:

```
ALLOW_TEST_ROUTES=1
SOURCES_ENGINE_STORE=memory
KNOWLEDGE_STORE=memory
DATA_SOURCES_STORE=memory
workers=1
fullyParallel=false
```

Each suite calls `POST /api/test/reset-stores` to clear:

- Source engine connections and sync runs
- Raw, normalized, and evidence items
- Knowledge items
- Adapter registry singleton

This prevents cross-suite mutable state. Serial workers avoid parallel mutation of the shared in-memory stores.

### Turbopack flake mitigation (Phase 11)

`e2e/sources.spec.ts` failed-sync test previously flaked when the dev server hit intermittent Turbopack write errors under long combined runs. Mitigations:

| Mitigation | Location |
|------------|----------|
| `resetStores()` before the failed-sync test | `e2e/sources.spec.ts` |
| Failed-sync test runs **first** in `sources.spec.ts` (before heavy page/sync tests) | `e2e/sources.spec.ts` |
| `expect.poll()` on sync-runs (up to 5s) | `e2e/sources.spec.ts` |
| Playwright `workers: 1`, `fullyParallel: false` | `playwright.config.ts` |
| Local `retries: 1`, CI `retries: 2` | `playwright.config.ts` |

---

## Production Supabase behavior

When `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set and memory overrides are absent:

| Migration | Tables |
|-----------|--------|
| `20260706_sources_engine.sql` | `source_connections`, `source_sync_runs` |
| `20260706_personal_data_sources.sql` | `data_sources`, `raw_source_items`, `normalized_source_items`, `evidence_items` |
| `20260706_knowledge_items.sql` | `knowledge_items` |

All required tables for the current pipeline exist. **No token or OAuth credential tables** — intentionally deferred until OAuth phase.

Apply migrations:

```bash
supabase db push
# or run SQL files in supabase/migrations/ against your project
```

---

## Security boundaries

| Check | Status |
|-------|--------|
| OAuth tokens in API responses | None stored or returned |
| Client secrets in API responses | None |
| Service role key in client bundle | Never — server env only |
| Raw `raw_json` in public APIs | Never — Intelligence/Brain use safe knowledge metadata |
| Test routes in production | Gated by `ALLOW_TEST_ROUTES=1` or `NODE_ENV=test` (reset-stores) |

Public APIs return safe metadata only: labels, summaries, evidence URLs, sync counts, connection status.

---

## Known limitations (pre-OAuth)

1. **No credential persistence** — OAuth/token tables not created yet
2. **Instagram / LinkedIn** — stub adapters only; no real sync
3. **Data sources in-memory without Supabase** — raw/normalized/evidence lost on restart when Supabase not configured
4. **File backends** — single-node only; not suitable for multi-instance serverless without Supabase
5. **No scheduled sync worker** — manual sync only
6. **Brain layers** — deterministic templates only; no LLM summarization

---

## Related

- [`docs/decisions/ADR-011-production-persistence-readiness.md`](../decisions/ADR-011-production-persistence-readiness.md)
- [`docs/reports/phase-11-report.md`](../reports/phase-11-report.md)
- [`docs/architecture/sources.md`](sources.md)

---

*Last updated: 2026-07-06*
