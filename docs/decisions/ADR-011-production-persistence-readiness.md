# ADR-011: Production persistence readiness

**Status:** Accepted  
**Date:** 2026-07-06  
**Deciders:** Giuseppe, engineering agent  
**Supersedes:** —  
**Superseded by:** —

---

## Decision

Before OAuth or social connectors, Giuseppe OS adopts a **documented, audited persistence strategy**:

1. **Supabase is the production target** when `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are set
2. **File fallbacks** for Sources Engine and Knowledge in local dev without Supabase
3. **Explicit memory overrides** (`SOURCES_ENGINE_STORE`, `KNOWLEDGE_STORE`, `DATA_SOURCES_STORE`) for e2e isolation
4. **All current pipeline migrations exist** — no new tables until OAuth phase
5. **Test isolation hardened** — reset stores, serial workers, poll for async sync-run persistence

No token tables. No OAuth implementation in this phase.

---

## Context

Phases 3–10 added real connectors and Brain layers atop in-memory and file backends. Combined e2e runs exposed intermittent Turbopack dev-server flakes and unclear backend selection. Production deploy requires confidence that Supabase schemas match the pipeline and that secrets never leak.

---

## Store backend rules (chosen)

| Store | Production | Local (no Supabase) | E2E |
|-------|------------|---------------------|-----|
| Sources Engine | Supabase | file | memory |
| Data sources (raw/normalized/evidence) | Supabase | memory | memory |
| Knowledge | Supabase | file | memory |
| Intelligence / Brain | none (read layer) | none | none |

`DATA_SOURCES_STORE=memory` now honors `SOURCES_ENGINE_STORE=memory` for consistent e2e overrides.

---

## Alternatives considered

### Option A — Supabase-only, remove file/memory backends

**Pros:** Single code path.  
**Cons:** Blocks local dev without cloud credentials; slower iteration.

### Option B — File-only production

**Pros:** No cloud dependency.  
**Cons:** Not viable for serverless/multi-instance deploy.

### Option C — Tiered backends with Supabase production target (chosen)

**Pros:** Local dev works offline; production uses Postgres; tests stay isolated.  
**Cons:** Three backends to maintain per store.

---

## Test flake mitigation

- Reset stores before destructive `sources.spec.ts` failed-sync test
- `expect.poll()` on sync-run API (5s timeout)
- Playwright: `workers: 1`, `fullyParallel: false`, `DATA_SOURCES_STORE=memory`
- CI retries remain at 2

Root cause: intermittent Turbopack dev-server write failures under long combined runs — not application logic errors.

---

## Consequences

### Positive

- `docs/architecture/production-persistence.md` is the operator reference
- Migration readiness confirmed for all six pipeline table groups
- E2E suite more reliable before OAuth work

### Negative

- Raw/normalized/evidence still in-memory without Supabase locally (data lost on restart)
- OAuth phase must add new migrations and credential vault tables separately

---

## References

- [`docs/reports/phase-11-report.md`](../reports/phase-11-report.md)
- [`docs/architecture/production-persistence.md`](../architecture/production-persistence.md)
- [`supabase/migrations/20260706_sources_engine.sql`](../../supabase/migrations/20260706_sources_engine.sql)
- [`supabase/migrations/20260706_personal_data_sources.sql`](../../supabase/migrations/20260706_personal_data_sources.sql)
- [`supabase/migrations/20260706_knowledge_items.sql`](../../supabase/migrations/20260706_knowledge_items.sql)
