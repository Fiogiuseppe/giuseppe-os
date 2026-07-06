# Giuseppe OS — Sources Platform

**Status:** Phase 3 — fiogiuseppe.com real connector (raw ingest)  
**Roadmap:** [`SOURCES_ROADMAP.md`](./SOURCES_ROADMAP.md)

Giuseppe OS learns from **trusted external sources** with traceable evidence. The Sources module is the central hub for every external data connection.

---

## Architecture

```
UI (SourcesDashboard)
        ↓ safe metadata only
API routes (/api/sources/*)
        ↓
Sources Platform (platform.server.ts)
        ↓
Adapter Registry → SourceAdapter (per provider)
        ↓
Auth Strategy (oauth2 | api_key | feed | file_import | webhook | custom)
        ↓
Sync Engine (manual | scheduled | incremental)
        ↓
Pipeline Bridge → lib/data-sources
        ↓
Evidence → Memory Candidates → Intelligence
```

The UI **never** knows how Instagram, LinkedIn, or any provider works. It calls generic platform operations only.

---

## Universal Provider Contract

Every provider implements the same `SourceAdapter` interface:

| Method | Purpose |
|--------|---------|
| `connect()` | Establish connection (OAuth redirect, feed enable, API key, etc.) |
| `disconnect()` | Revoke connection and clear server credentials |
| `sync()` | Pull or accept data incrementally |
| `refresh()` | Renew tokens or metadata |
| `health()` | Connection + health status for UI |
| `permissions()` | Declared vs granted permissions (safe metadata) |

Register adapters in `platform/adapter-registry.server.ts`. Provider-specific code lives only in **adapter + strategy** files.

---

## Authentication Strategies

| Strategy | Use case | Secrets |
|----------|----------|---------|
| `oauth2` | Instagram, LinkedIn, GitHub, Gmail… | Server vault only |
| `api_key` | Readwise, Notion, custom APIs | Server vault only |
| `feed` | Medium RSS, fiogiuseppe.com, urees.shop | None (public feeds) |
| `file_import` | Manual exports, Obsidian dumps | Uploaded server-side |
| `webhook` | Push-based providers | Signing secret server-side |
| `custom` | Bespoke connectors | Per adapter |

OAuth flow:

1. User clicks **Connect**
2. Redirect to provider login
3. Provider redirects to `/api/sources/oauth/callback`
4. Server exchanges code, stores credentials
5. UI shows connected — **no tokens in browser**

---

## Token & Credential Storage

`platform/credentials-vault.server.ts` stores:

- OAuth access + refresh tokens
- API keys
- Webhook signing secrets

**Never exposed to the frontend.** UI receives only `SourceProviderStatus` (connection state, health, last sync, permissions granted).

Future: encrypted Supabase persistence + rotation audit log.

---

## Sync Engine

`platform/sync/sync-engine.server.ts` provides:

- **Manual sync** — user or API triggers `sync()`
- **Scheduled sync** — `runScheduledSync()` hook for future cron/worker
- **Incremental sync** — `since` cursor on connection state
- **Retry** — automatic retry with backoff
- **Rate limiting** — per-source window (`sync/rate-limiter.server.ts`)
- **Sync logs** — in-memory audit trail (`sync/sync-log.server.ts`)

---

## Data Pipeline

```
Provider → Raw Data → Normalization → Evidence Storage → Memory Candidates → Giuseppe OS Intelligence
```

`platform/pipeline-bridge.server.ts` forwards raw sync items into `lib/data-sources/ingest.ts` when a pipeline mapping exists. Every AI decision must reference **real synchronized evidence** — no hallucinated provider data.

---

## Provider Catalog vs Adapters

| Layer | Location | Role |
|-------|----------|------|
| **Catalog** | `providers/source-registry.ts` | UI metadata, groups, permissions labels |
| **Groups** | `providers/source-groups.ts` | Personal identity, UREES, Work, Knowledge, Life… |
| **Adapters** | `platform/adapters/*` | Runtime connect/sync behavior |
| **Strategies** | `adapters/*-oauth2.strategy.server.ts` | Auth implementation per provider |

Adding a new provider:

1. Add catalog entry in `source-registry.ts`
2. Add to group in `source-groups.ts`
3. Implement strategy (if needed) + register adapter
4. **No changes to UI or API routes**

---

## Security

- No `localStorage` tokens
- No frontend secrets
- OAuth state verified (cookie + query param, TTL, single use)
- HttpOnly cookies for OAuth state
- Refresh tokens renewed via adapter `refresh()` when strategy supports it

---

## Phase 2 Deliverables (this document)

- [x] Universal `SourceAdapter` contract
- [x] Auth strategy types (oauth2, api_key, feed, file_import, webhook, custom)
- [x] Credentials vault (server-only)
- [x] **Persisted connection state** (`source_connections` / file / memory)
- [x] **Persisted sync run logs** (`source_sync_runs`)
- [x] Permissions + dataCollected models
- [x] Sync engine with retry, rate limit, logs
- [x] Pipeline bridge to `lib/data-sources`
- [x] Platform orchestrator (`platform.server.ts`)
- [x] **fiogiuseppe.com connector scaffold** (`connectors/fiogiuseppe-website.connector.server.ts`) — no external HTTP yet
- [x] Generic feed + stub adapters
- [x] Reference OAuth2 strategy (GitHub) — registered, not hardcoded in routes

## Next (Phase 3+)

- Encrypted token persistence (Supabase)
- Provider adapters: Instagram, LinkedIn, Medium (feed wiring to presence)
- Scheduled sync worker
- File import upload API
- Webhook ingress routes

---

## Key Paths

```
src/modules/sources/
  platform/           # Engine
  adapters/           # Provider strategies (reference: github-oauth2)
  providers/          # Catalog + groups
  components/         # UI (generic)
  oauth/              # OAuth state + callback (uses platform)
app/api/sources/      # HTTP surface
lib/data-sources/     # Ingestion pipeline
```
