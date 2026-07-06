# Knowledge Layer

Structured knowledge derived from synchronized evidence.

**Status:** Phase 4 — website extractor active; deterministic rules only (no LLM).

---

## Pipeline position

```
Source → Raw → Normalized → Evidence → Knowledge → Brain (future)
```

**Rule:** No evidence → no knowledge. No invented facts.

---

## Module layout

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
├── store/                    # memory | file | supabase
└── components/KnowledgeDebugPage.tsx
```

---

## Knowledge item model

| Field | Purpose |
|-------|---------|
| `id` | Stable ID from dedup key |
| `owner` | `giuseppe` (Phase 4) |
| `sourceId` | Sources catalog ID |
| `sourceType` | `website`, `feed`, `social`, … |
| `knowledgeType` | `project`, `brand`, `topic`, `service`, … |
| `label` | Human concept name |
| `summary` | Short evidence-backed description |
| `confidence` | 0–1 |
| `evidenceIds` | Backlinks to evidence rows |
| `evidenceUrls` | Public permalinks |
| `status` | `active`, `inferred`, `archived`, `needs_review` |

**Dedup key:** `owner + knowledgeType + normalizedLabel`

---

## Website extractor (Phase 4)

Rule-based patterns on evidence text (summary + permalink):

| Pattern | Type | Label | Confidence |
|---------|------|-------|------------|
| Visceral Poems | project | Visceral Poems | 0.95 |
| UREES | brand | UREES | 0.95 |
| brand identity | topic | Brand Identity | 0.85 |
| creative direction | service | Creative Direction | 0.85 |
| branding | service | Branding | 0.85 |
| painting / poems / art | topic | … | 0.75–0.8 |

No OpenAI, Groq, or other LLM calls.

---

## Integration

After successful website sync (`persistSourceEvidenceItems`), `extractKnowledgeFromEvidence` runs automatically in `sync-engine.server.ts`.

---

## API & debug UI

| Route | Purpose |
|-------|---------|
| `GET /api/knowledge` | Safe knowledge list |
| `/knowledge` | Debug page (not product UI) |

---

## Related

- ADR: [`../decisions/ADR-004-knowledge-layer.md`](../decisions/ADR-004-knowledge-layer.md)
- Sources: [`sources.md`](sources.md)
- Report: [`../reports/phase-04-report.md`](../reports/phase-04-report.md)

*Last updated: 2026-07-06*
