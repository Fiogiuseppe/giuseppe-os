# Giuseppe OS Changelog

Significant milestones only. Use [`CHANGELOG_TEMPLATE.md`](CHANGELOG_TEMPLATE.md) for new entries.

---

---

## [0.8.0-source-configuration] — 2026-07-06

### Added

- Central source registry (`src/modules/sources/config/source-config.ts`)
- Canonical source IDs: `website_personal`, `instagram_personal`, `linkedin_personal`, `medium_personal`, `website_urees`, `instagram_urees`
- Helper functions: `getSourceConfig`, `requireSourceConfig`, `listSourceConfigs`, `getOfficialSourceUrl`, `normalizeSourceId`
- ADR-008: official source configuration

### Changed

- LinkedIn official URL corrected to `https://linkedin.com/in/fiogiuseppe/?skipRedirect=true`
- Provider registry, connectors, and e2e tests migrated to canonical IDs
- Legacy aliases (`website`, `urees-website`, etc.) normalize at API boundaries

### Notes

- Report: [`reports/phase-08-report.md`](reports/phase-08-report.md)
- ADR: [`decisions/ADR-008-official-source-configuration.md`](decisions/ADR-008-official-source-configuration.md)

---

### Added

- Configurable website connector architecture (`src/modules/sources/connectors/website/`)
- UREES website connector (`urees-website`, `website_urees`)
- Official UREES URL `https://urees.shop/` via `lib/presence/official-source-urls.ts`
- Optional `UREES_WEBSITE_URL` environment override
- ADR-007: configurable website connectors

### Changed

- fiogiuseppe.com connector refactored to shared website architecture (no duplicated fetch logic)
- Knowledge extractor now includes `urees-website` source

### Security

- No invented URLs; central official source URL registry added
- API responses remain secret-free

### Notes

- Report: [`reports/phase-07-report.md`](reports/phase-07-report.md)
- ADR: [`decisions/ADR-007-configurable-website-connectors.md`](decisions/ADR-007-configurable-website-connectors.md)

---

### Added

- Brain Evidence Answer Layer (`src/modules/brain/answer/`)
- `POST /api/brain/answer` — deterministic answers from synchronized knowledge
- `/brain` debug page
- ADR-006: Brain answers from knowledge via Intelligence Read only

### Security

- No external LLM calls; no raw provider data, tokens, or secrets in responses
- Unknown answers when no synchronized evidence exists

### Notes

- Report: [`reports/phase-06-report.md`](reports/phase-06-report.md)
- ADR: [`decisions/ADR-006-brain-evidence-answer-layer.md`](decisions/ADR-006-brain-evidence-answer-layer.md)

---

### Added

- Intelligence Read Layer (`src/modules/intelligence/read/`)
- `GET /api/intelligence/knowledge` with owner, sourceId, knowledgeType, status, and `q` filters
- `/intelligence` debug page
- ADR-005: intelligence queries knowledge, not raw sources

### Security

- Intelligence API returns `SafeKnowledgeItem` only; no tokens, secrets, or raw metadata

### Notes

- Report: [`reports/phase-05-report.md`](reports/phase-05-report.md)
- ADR: [`decisions/ADR-005-intelligence-read-layer.md`](decisions/ADR-005-intelligence-read-layer.md)

---

### Added

- Knowledge Layer module (`src/modules/knowledge/`)
- Rule-based website knowledge extractor (Visceral Poems, UREES, branding topics)
- `GET /api/knowledge` and `/knowledge` debug page
- ADR-004: reason from knowledge items, not raw provider data

### Changed

- Website sync now runs knowledge extraction after evidence persistence

### Security

- Knowledge API exposes safe metadata only; no raw payloads

### Notes

- Report: [`reports/phase-04-report.md`](reports/phase-04-report.md)
- ADR: [`decisions/ADR-004-knowledge-layer.md`](decisions/ADR-004-knowledge-layer.md)

---

## [0.3.0-sources-website] — 2026-07-06

### Added

- Real fiogiuseppe.com website connector (`website_personal`)
- Raw → normalized → evidence persistence with URL + content-hash dedup
- `docs/architecture/sources.md`

### Changed

- `website` source uses connector adapter instead of stub
- Sync run summaries include `normalized` and `evidence` counts

### Security

- Public RSS/HTML only; mock fetch gated on `ALLOW_TEST_ROUTES`

### Notes

- Report: [`reports/phase-03-report.md`](reports/phase-03-report.md)

---

## [0.2.0-sources-engine] — 2026-07-06

### Added

- Sources Engine with persistent connection state and sync run logs
- `GET/POST /api/sources` and sync-runs API

### Changed

- Sources dashboard Connect / Disconnect / Sync Now wired to backend

### Notes

- Report: [`reports/phase-02-report.md`](reports/phase-02-report.md)

---

## [0.1.0-sources-dashboard] — 2026-07-06

### Added

- Sources dashboard with six providers (Personal + UREES)
- Provider registry and mock metadata API

### Notes

- Phase 1 — dashboard only; engine shipped in 0.2.0
