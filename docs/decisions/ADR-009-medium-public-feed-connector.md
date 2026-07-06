# ADR-009: Medium public RSS connector

**Status:** Accepted  
**Date:** 2026-07-06  
**Deciders:** Giuseppe, engineering agent  
**Supersedes:** —  
**Superseded by:** —

---

## Decision

`medium_personal` is a **real public feed connector** that:

1. Reads profile and RSS URLs from `src/modules/sources/config/source-config.ts` only
2. Fetches public articles from `https://medium.com/feed/@fiogiuseppe`
3. Persists raw → normalized → evidence through the existing Sources pipeline
4. Runs deterministic knowledge extraction after sync (no LLM)
5. Deduplicates by URL + content hash (shared with website connectors)
6. States clearly that **drafts are unsupported** — only public RSS articles sync

No OAuth, API tokens, or private Medium data are used or stored.

---

## Context

Phase 8 centralized official source URLs and canonical IDs. `medium_personal` remained a stub adapter. Giuseppe's public Medium writing is decision-relevant evidence and should flow into Knowledge, Intelligence Read, and Brain Answer like website sources.

Medium exposes a public RSS feed for `@fiogiuseppe` without authentication.

---

## Alternatives Considered

### Option A — Medium API with OAuth

**Pros:** Access to drafts, stats, and richer metadata.  
**Cons:** Requires tokens, secrets, and OAuth infrastructure — explicitly out of scope for this phase.

### Option B — Scrape profile HTML

**Pros:** No feed dependency.  
**Cons:** Fragile, harder to parse, higher maintenance; RSS is the official public syndication format.

### Option C — Public RSS feed (chosen)

**Pros:** No auth, stable structure, aligns with `authMethod: 'feed'` in source config.  
**Cons:** Drafts and non-published content are unavailable (accepted — surfaced in connect/sync/health messages).

---

## Implementation notes

- Connector factory: `src/modules/sources/connectors/medium/create-medium-connector.server.ts`
- Entry point: `src/modules/sources/connectors/medium-personal.connector.server.ts`
- RSS fetch: `src/modules/sources/connectors/medium/medium-feed.fetch.server.ts`
- Knowledge extractor: `src/modules/knowledge/extractors/medium-knowledge.extractor.ts`
- E2E tests use mock RSS fixtures when `ALLOW_TEST_ROUTES=1` (Playwright dev server)
- Platform connect/sync responses propagate connector messages (including drafts-unsupported note)

---

## Consequences

### Positive

- Medium articles become queryable via `/api/intelligence/knowledge?sourceId=medium_personal`
- Brain Answer can cite Medium evidence URLs deterministically
- Same dedup and evidence pipeline as website connectors

### Negative

- No draft or private article sync without a future OAuth phase
- RSS may lag behind on-page publish time
- Tag extraction depends on RSS item content quality

---

## References

- [`docs/reports/phase-09-report.md`](../reports/phase-09-report.md)
- [`ADR-008-official-source-configuration.md`](ADR-008-official-source-configuration.md)
- [`src/modules/sources/config/source-config.ts`](../../src/modules/sources/config/source-config.ts)
