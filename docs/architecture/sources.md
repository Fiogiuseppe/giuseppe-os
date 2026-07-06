# Sources Platform

Technical overview of the Giuseppe OS Sources system.

**Status:** Phase 7 — `website` and `urees-website` connectors are real; other sources use stubs.

---

## Architecture

```
UI (/sources)
  → GET/POST /api/sources
  → platform.server.ts
  → adapter-registry
      ├── connector.adapter (website, urees-website — real)
      └── stub.adapter (all other sources)
  → sync-engine
  → source-evidence-persistence
  → lib/data-sources store (raw → normalized → evidence)
```

---

## Provider registry

Six sources in two groups (`personal`, `urees`). Static metadata in `src/modules/sources/providers/source-registry.ts`.

| ID | Label | Auth method | Connector |
|----|-------|-------------|-----------|
| `website` | fiogiuseppe.com | feed | **Real** (Phase 3) |
| `medium` | Medium | feed | Stub |
| `instagram` | Instagram | oauth | Stub |
| `linkedin` | LinkedIn | oauth | Stub |
| `urees-instagram` | UREES Instagram | oauth | Stub |
| `urees-website` | UREES Website | feed | **Real** (Phase 7) |

---

## Website connectors (Phase 3 + 7)

Shared architecture: `src/modules/sources/connectors/website/`

| Source | Connector ID | Config |
|--------|--------------|--------|
| `website` | `website_personal` | `GIUSEPPE_PRESENCE` canonical URLs |
| `urees-website` | `website_urees` | `UREES_WEBSITE_URL` (+ optional feed/sitemap/products overrides) |

### fiogiuseppe.com (`website`)

**Path:** `src/modules/sources/connectors/fiogiuseppe-website.connector.server.ts`

### Public endpoints

- Profile: `https://fiogiuseppe.com/`
- Posts RSS: `https://fiogiuseppe.com/feed/`
- Comments RSS: `https://fiogiuseppe.com/comments/feed/`

### Extracted fields (per item)

| Field | Source |
|-------|--------|
| `url` | RSS link or profile URL |
| `title` | RSS title / og:title |
| `description` | Meta description / RSS summary (trimmed) |
| `content` | Stripped HTML text |
| `metadata` | Categories, author, feed type, handles |
| `collectedAt` | Server ISO timestamp at fetch |
| `contentHash` | SHA-256 of `url + content` |

### Deduplication

Before save: `findRawItem` + compare `url` and `contentHash`. Duplicate sync skips normalized/evidence writes.

### Test mode

When `ALLOW_TEST_ROUTES=1` or `SOURCES_WEBSITE_MOCK_FETCH=1`, fetch returns fixtures (no outbound HTTP).

### UREES website (`urees-website`)

**Path:** `src/modules/sources/connectors/urees-website.connector.server.ts`

**Environment:**

```bash
UREES_WEBSITE_URL=          # required for real sync
# UREES_WEBSITE_FEED_URL=   # optional
# UREES_WEBSITE_SITEMAP_URL=
# UREES_WEBSITE_PRODUCTS_URL=
# UREES_WEBSITE_MAX_PAGES=12
```

When `UREES_WEBSITE_URL` is unset, health is `unavailable` with a configuration note. No hardcoded URL in code.

Public fetch supports profile HTML, RSS (`feed/`), Shopify `products.json`, and optional sitemap pages. Raw items use `account: urees`.

---

## Persistence

| Layer | Store | Path |
|-------|-------|------|
| Connection state + sync logs | Sources engine store | `src/modules/sources/platform/store/` |
| Raw / normalized / evidence | Data sources store | `lib/data-sources/store/` |

---

## Safe metadata API

Responses never include tokens, secrets, or full raw payloads. Sync run summaries expose counts only (`fetched`, `normalized`, `evidence`).

---

## Related

- [`../../SOURCES_ROADMAP.md`](../../SOURCES_ROADMAP.md)
- [`../../reports/phase-03-report.md`](../../reports/phase-03-report.md)
- [`../../SOURCES_PLATFORM.md`](../../SOURCES_PLATFORM.md)

*Last updated: 2026-07-06 — Phase 3*
