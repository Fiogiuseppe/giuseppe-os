# Phase 4 — Knowledge Layer Implementation Report

**Date:** 2026-07-06  
**Status:** Complete  
**Branch:** `main`  
**Report author:** Cursor agent session

---

## Summary

Phase 4 introduces the **Knowledge Layer** — deterministic, rule-based extraction that converts synchronized evidence into structured knowledge objects with evidence backlinks. After a successful `website` sync, knowledge items such as **Visceral Poems** and **UREES** are created or updated automatically. No LLM, no new connectors, no OAuth.

---

## Objectives

| # | Objective | Met? |
|---|-----------|------|
| 1 | Generic knowledge model | Yes |
| 2 | Persistent knowledge store | Yes |
| 3 | Website knowledge extractor | Yes |
| 4 | Post-sync knowledge extraction | Yes |
| 5 | Evidence backlinks (IDs + URLs) | Yes |
| 6 | Dedup by owner + type + label | Yes |
| 7 | `GET /api/knowledge` safe API | Yes |
| 8 | `/knowledge` debug page | Yes |
| 9 | No AI/LLM calls | Yes |
| 10 | No new connectors / OAuth | Yes |

---

## Files Created

| Path | Purpose |
|------|---------|
| `src/modules/knowledge/models/knowledge.types.ts` | Knowledge + safe DTO types |
| `src/modules/knowledge/extractors/website-knowledge.extractor.ts` | Rule-based website extraction |
| `src/modules/knowledge/extractors/registry.server.ts` | Extractor registry |
| `src/modules/knowledge/services/knowledge.server.ts` | Extraction orchestration + safe list |
| `src/modules/knowledge/services/knowledge-persistence.server.ts` | Upsert with dedup |
| `src/modules/knowledge/store/*` | memory / file / supabase stores |
| `app/api/knowledge/route.ts` | Safe read API |
| `app/knowledge/page.tsx` | Debug UI |
| `app/api/test/reset-stores/route.ts` | E2E store reset (test only) |
| `e2e/knowledge.spec.ts` | Knowledge layer tests |
| `supabase/migrations/20260706_knowledge_items.sql` | Supabase schema |
| `docs/architecture/knowledge.md` | Architecture doc |
| `docs/decisions/ADR-004-knowledge-layer.md` | ADR |

---

## Files Modified

| Path | Change |
|------|--------|
| `src/modules/sources/platform/engine/source-evidence-persistence.server.ts` | Returns `evidenceItems[]` |
| `src/modules/sources/platform/sync/sync-engine.server.ts` | Runs knowledge extraction after sync |
| `src/modules/sources/connectors/fetch/fiogiuseppe-website.fetch.server.ts` | Mock fixtures include Visceral Poems + UREES |
| `playwright.config.ts` | `KNOWLEDGE_STORE=memory`, serial workers |
| `app/globals.css` | Knowledge route layout |
| `docs/roadmap/master-roadmap.md` | Phase 4 complete |
| `docs/roadmap/next-phase.md` | Phase 5 next |

---

## Folder Structure

```
src/modules/knowledge/
├── models/knowledge.types.ts
├── extractors/
│   ├── knowledge-extractor.types.ts
│   ├── website-knowledge.extractor.ts
│   └── registry.server.ts
├── services/
│   ├── knowledge.server.ts
│   └── knowledge-persistence.server.ts
├── store/
│   ├── memoryStore.server.ts
│   ├── fileStore.server.ts
│   ├── supabaseStore.server.ts
│   └── index.ts
└── components/KnowledgeDebugPage.tsx
```

---

## Database Changes

Migration `20260706_knowledge_items.sql`:

| Column | Type |
|--------|------|
| `id` | text PK |
| `owner` | text |
| `source_id` | text |
| `source_type` | text |
| `knowledge_type` | text |
| `label` | text |
| `summary` | text |
| `confidence` | double precision |
| `evidence_ids` | jsonb |
| `evidence_urls` | jsonb |
| `metadata` | jsonb |
| `status` | text |
| `dedup_key` | text unique |
| `created_at` / `updated_at` | timestamptz |

---

## API Routes

| Method | Route | Behavior |
|--------|-------|----------|
| `GET` | `/api/knowledge` | Safe knowledge metadata list |
| `POST` | `/api/test/reset-stores` | Reset test stores (`ALLOW_TEST_ROUTES=1` only) |

---

## Components

| Component | Purpose |
|-----------|---------|
| `KnowledgeDebugPage` | Debug list of knowledge items at `/knowledge` |

---

## Services

| Service | Role |
|---------|------|
| `extractKnowledgeFromEvidence` | Runs registry extractors, upserts knowledge |
| `upsertKnowledgeCandidate` | Dedup merge + evidence append |
| `websiteKnowledgeExtractor` | Rule patterns for fiogiuseppe.com evidence |
| `getKnowledgeStore` | Pluggable persistence backend |

---

## Security Decisions

1. **Safe API only** — `SafeKnowledgeItem` excludes raw JSON and internal metadata from API
2. **No LLM** — no external inference APIs; no hallucinated knowledge
3. **Evidence gate** — empty evidence array → zero knowledge created
4. **Test reset gated** — `/api/test/reset-stores` requires `ALLOW_TEST_ROUTES=1`
5. **No tokens** — knowledge layer does not handle credentials

---

## Performance Notes

- Extraction runs inline after sync (small rule set, low overhead)
- Dedup lookup per candidate via `dedup_key` index
- File store at `.data/knowledge/state.json` for local dev

---

## Tests Executed

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | **Pass** |
| `npm run build` | **Pass** |
| `npx playwright test e2e/sources.spec.ts` | **5/5 pass** |
| `npx playwright test e2e/knowledge.spec.ts` | **4/4 pass** |

### Coverage summary

- Visceral Poems + UREES knowledge created after website sync
- Duplicate sync does not duplicate knowledge
- API returns no secrets/raw payloads
- Debug page loads

---

## Build Result

```
npm run build — SUCCESS
/knowledge — static
/api/knowledge — dynamic
```

---

## TypeScript Result

```
npx tsc --noEmit — Pass
```

---

## Known Limitations

1. **Rule-based only** — cannot infer knowledge not matching defined patterns
2. **Website extractor only** — Medium, UREES, social sources not wired yet
3. **Single owner** — `giuseppe` hardcoded for Phase 4
4. **Metadata hidden from API** — internal extractor metadata not exposed (by design)
5. **Inline extraction** — large evidence batches may need async jobs later

---

## Future Improvements

- Extractor registry entries for Medium, UREES, social (when connectors ship)
- `needs_review` workflow for low-confidence merges
- Knowledge counts on sync run records
- Brain read API querying knowledge by type/source

---

## Next Recommended Phase

**Phase 5 — UREES Website Connector** (Sources track) or **Intelligence Read Layer** depending on roadmap priority. Do not combine connector expansion with Brain responses in one phase.

---

## Related documentation

- ADR: [`../decisions/ADR-004-knowledge-layer.md`](../decisions/ADR-004-knowledge-layer.md)
- Architecture: [`../architecture/knowledge.md`](../architecture/knowledge.md)
- Roadmap: [`../roadmap/master-roadmap.md`](../roadmap/master-roadmap.md)

---

*Phase 4 complete. Giuseppe OS now reasons from structured knowledge — not raw provider data.*
