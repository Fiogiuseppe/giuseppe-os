# Personal Data Sources

**Status:** Foundation (types, pipeline, store, connector stubs). No live OAuth yet.  
**Location:** `lib/data-sources/`  
**Pipeline:** `Source → Normalize → Analyze → Evidence → Self Model`

---

## Why this exists

Giuseppe OS must learn from **Giuseppe's real life outputs** over time — not from invented context or generic web search.

Personal channels (Instagram, LinkedIn, Calendar, Gmail, GitHub, Health, Books, Spotify, Figma) produce signals about:

- what Giuseppe is actually doing
- what he publishes and ships
- how his energy, focus, and reputation move in the world

The Public Presence engine (`lib/presence/`) covers **canonical public URLs** without OAuth.  
Personal Data Sources cover **authenticated, read-only ingestion** into durable evidence that feeds the **Self Model**.

Every insight that uses this data must remain **traceable to evidence** with explicit source attribution.

---

## Architecture

```
┌─────────────┐    ┌────────────┐    ┌─────────┐    ┌──────────────┐    ┌────────────┐
│   Source    │ →  │ Normalize  │ →  │ Analyze │ →  │  Evidence    │ →  │ Self Model │
│ (connector) │    │ (schema)   │    │ (rules) │    │ (attributed) │    │ (dimensions)│
└─────────────┘    └────────────┘    └─────────┘    └──────────────┘    └────────────┘
```

### Core types (`lib/data-sources/types.ts`)

| Type | Role |
|------|------|
| `DataSource` | Registered account connection (source + account + auth status) |
| `RawSourceItem` | Immutable upstream payload (`raw_json`) |
| `NormalizedSourceItem` | Canonical shape: content, caption, media, permalink, metrics |
| `EvidenceItem` | Attributed summary + dimension hints + `traceId` |
| `SourceConnector` | Read-only fetch contract per source |
| `SourceIngestionResult` | Counts + graceful errors per sync run |

### Entry point

```typescript
import { ingestFromSource } from '@/lib/data-sources';

const result = await ingestFromSource('manual_import', 'giuseppe', {
  manualPayload: [{
    externalId: 'note-1',
    rawJson: {
      content: 'Shipped UREES product photos',
      published_at: new Date().toISOString(),
      permalink: 'https://urees.shop/products/example'
    }
  }]
});
```

`ingestFromSource` never posts, never mutates upstream systems. Read-only only.

---

## How it feeds the Self Model

1. **Normalize** — upstream JSON becomes a stable `NormalizedSourceItem`
2. **Analyze** — rule-based keyword + source mapping → `dimensionHints`
3. **Evidence** — `EvidenceItem` stores `attribution` (e.g. `instagram:@fiogiuseppe/abc123`) and `traceId`
4. **Self Model bridge** — `applyEvidenceToSelfModel()` appends attributed notes to dimension `evidence_sources`

Self Model dimensions keep `evidence_sources` like `evidence:instagram:@fiogiuseppe/post_1`.  
Insights and briefings must cite this chain — never treat imported text as constitutional truth.

**Separation preserved:**

| Layer | Responsibility |
|-------|----------------|
| Memory / Constitution | Fixed principles, curated brain |
| Personal Data Sources | Observed external outputs |
| Self Model | Probabilistic estimates backed by evidence count |

---

## Supported sources (foundation)

| Source | Env vars (names only) | Status |
|--------|----------------------|--------|
| `instagram` | `META_APP_ID`, `META_APP_SECRET` | Stub — OAuth later |
| `linkedin` | `LINKEDIN_CLIENT_ID`, `LINKEDIN_CLIENT_SECRET` | Stub — Community Management API review |
| `calendar` | `GOOGLE_CALENDAR_CLIENT_ID`, `GOOGLE_CALENDAR_CLIENT_SECRET` | Stub |
| `gmail` | `GMAIL_CLIENT_ID`, `GMAIL_CLIENT_SECRET` | Stub |
| `github` | `GITHUB_TOKEN` | Stub |
| `health` | `HEALTH_CONNECTOR_ENABLED` | Stub |
| `books` | `BOOKS_CONNECTOR_ENABLED` | Stub |
| `spotify` | `SPOTIFY_CLIENT_ID`, `SPOTIFY_CLIENT_SECRET` | Stub |
| `figma` | `FIGMA_ACCESS_TOKEN` | Stub |
| `manual_import` | — | **Active** for approved imports |

Connectors live in `lib/data-sources/connectors/`.  
Each returns `needs_auth` or `not_configured` gracefully — no thrown crashes, no silent success.

---

## Instagram & LinkedIn (later)

### Instagram

- **Portal:** [developers.facebook.com](https://developers.facebook.com/)
- **API:** Instagram Graph API with Business Login
- **Accounts:** `@fiogiuseppe`, `@urees__` (Professional accounts)
- **Permissions (read):** `instagram_business_basic`, `instagram_business_manage_comments`, `instagram_business_manage_insights`
- **Giuseppe OS path:** `SourceConnector` implementation replaces stub in `connectors/registry.ts`; OAuth tokens stored server-side (not in `.env`); refresh via secure store

### LinkedIn

- **Portal:** [developer.linkedin.com](https://developer.linkedin.com/)
- **API:** Community Management API (approval required)
- **Profile:** `/in/fiogiuseppe`
- **Permissions:** `r_member_social_feed`, comment read scopes after review
- **Giuseppe OS path:** separate app, OAuth 3-legged flow, read posts/comments only

Neither connector will auto-publish. Publishing remains a deliberate Giuseppe action outside ingestion.

---

## Permission limitations

- **Instagram:** Personal accounts cannot use Graph API. Business/Creator required.
- **LinkedIn:** Member analytics and comments are gated behind manual API product approval.
- **Gmail:** Metadata-first design — no full mailbox dumps in v1.
- **Health:** Aggregated metrics only; no raw medical record storage without explicit scope.
- **Missing permissions:** Connector returns `{ ok: false, code: 'missing_permissions' | 'needs_auth' }`; ingestion records zero items, updates `auth_status`, does not fabricate data.

---

## Privacy principles

1. **Read-only ingestion** — fetch and store; never post on Giuseppe's behalf
2. **No hardcoded tokens** — env var *names* in code; values only in deployment secrets
3. **Source attribution required** — every `EvidenceItem` has `attribution` + `permalink`
4. **Not constitutional truth** — imported outputs inform Self Model estimates; they do not override `memory/giuseppe_brain.json`
5. **Progressive disclosure** — store more than we show; surface only mission-relevant signals
6. **Fail gracefully** — missing OAuth ≠ crash; explicit `SourceIngestionResult.errors`
7. **Traceability** — `traceId` links evidence → normalized → raw for audit

---

## Supabase tables

Migration: `supabase/migrations/20260706_personal_data_sources.sql`

| Table | Purpose |
|-------|---------|
| `data_sources` | Registered connections per source + account |
| `raw_source_items` | Immutable `raw_json` payloads |
| `normalized_source_items` | Canonical content fields |
| `evidence_items` | Attributed summaries for Self Model + insights |

Store resolves automatically: Supabase when configured, in-memory for local/tests (`lib/data-sources/store/`).

---

## Future connector roadmap

| Phase | Work |
|-------|------|
| **Now** | Types, pipeline, store, stubs, manual import, Self Model bridge |
| **Next** | Instagram OAuth + Graph read connector (`@fiogiuseppe`, `@urees__`) |
| **Then** | LinkedIn Community Management read connector |
| **Later** | Calendar (time signals), GitHub (shipping), Spotify/Figma (creative rhythm) |
| **Future** | Memory Graph nodes linking evidence → decisions; Today one-liner from latest evidence |

---

## Related systems

- `lib/presence/` — public canonical channels (RSS, Shopify) without OAuth
- `lib/self-model/` — evidence-backed dimension estimates
- `lib/reality/` — live reality signals (partial, separate concern)
- `docs/03_DECISIONS_LOG.md` — architecture decisions

---

## Non-goals (this foundation)

- No UI changes
- No OAuth routes yet
- No automatic posting
- No generic Google/social scraping
- No collapsing Memory, Identity, and imported evidence into one store
