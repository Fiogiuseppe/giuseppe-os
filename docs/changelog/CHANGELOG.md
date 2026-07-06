# Giuseppe OS Changelog

Significant milestones only. Use [`CHANGELOG_TEMPLATE.md`](CHANGELOG_TEMPLATE.md) for new entries.

---

---

## [0.13.0-token-vault] — 2026-07-06

### Added

- Token Vault module (`src/modules/sources/token-vault/`)
- AES-256-GCM encryption for OAuth tokens at rest (`SOURCES_TOKEN_ENCRYPTION_KEY`)
- memory / file / Supabase store backends for token persistence
- Supabase migration `source_oauth_tokens`
- Internal API: `saveTokenBundle`, `getValidTokenBundle`, `markTokenRevoked`, `deleteTokenBundle`, `listTokenMetadata`
- OAuth hook `saveTokenBundleFromOAuth` (not wired to callback yet)
- `POST/GET /api/test/token-vault` — gated test route (metadata only)
- `e2e/token-vault.spec.ts` — 8 encryption and safety tests
- ADR-013 and Phase 13 report

### Changed

- `reset-stores` clears token vault
- `playwright.config.ts` — `SOURCES_TOKEN_VAULT_STORE=memory`, test encryption key
- `docs/architecture/oauth.md` — token vault integration path
- `docs/architecture/production-persistence.md` — token vault store row

### Security

- Tokens encrypted before persistence; decrypt server-side only
- Production fails closed without `SOURCES_TOKEN_ENCRYPTION_KEY`
- No public API returns `accessToken`, `refreshToken`, or `clientSecret`
- Fake test tokens only in e2e — no real credentials stored

### Notes

- Report: [`reports/phase-13-report.md`](reports/phase-13-report.md)
- ADR: [`decisions/ADR-013-token-vault.md`](decisions/ADR-013-token-vault.md)
- No Instagram, LinkedIn, or real provider OAuth

---

## [0.12.0-oauth-foundation] — 2026-07-06

### Added

- Generic OAuth module (`src/modules/sources/oauth/`)
- `GET /api/sources/[sourceId]/oauth/connect` — begin OAuth with CSRF state cookie
- `GET /api/sources/oauth/callback` — validate state; safe redirect to `/sources`
- `OAuthProviderAdapter` interface for future Instagram/LinkedIn providers
- `e2e/sources-oauth.spec.ts` — connect/callback security tests
- `docs/architecture/oauth.md` and ADR-012

### Changed

- OAuth-capable sources reject `POST /api/sources` connect (direct to authorize route)
- `reset-stores` clears OAuth state and provider registry
- OAuth source health notes updated to “foundation ready”

### Security

- Cryptographic CSRF state, 10-minute TTL, HttpOnly cookie, reuse protection
- No token tables, no real tokens, no client secrets in API responses
- No external provider API calls

### Notes

- Report: [`reports/phase-12-report.md`](reports/phase-12-report.md)
- ADR: [`decisions/ADR-012-oauth-foundation.md`](decisions/ADR-012-oauth-foundation.md)

---

## [0.11.0-stability-persistence] — 2026-07-06

### Added

- Production persistence guide (`docs/architecture/production-persistence.md`)
- ADR-011: production persistence readiness
- Phase 11 audit report and updated reports index (Phases 1–11)

### Changed

- `e2e/sources.spec.ts` — reset, poll, failed-sync test runs first (Turbopack flake mitigation)
- `playwright.config.ts` — `DATA_SOURCES_STORE=memory`, local `retries: 1`
- `reset-stores` API returns manifest of cleared stores

### Security

- Confirmed no tokens, secrets, or raw private data in public APIs
- Test routes remain gated by `ALLOW_TEST_ROUTES=1`
- Supabase migrations confirmed for all pipeline tables (no token tables yet)

### Notes

- Report: [`reports/phase-11-report.md`](reports/phase-11-report.md)
- ADR: [`decisions/ADR-011-production-persistence-readiness.md`](decisions/ADR-011-production-persistence-readiness.md)

---

## [0.10.0-brain-summary] — 2026-07-06

### Added

- Brain Summary Layer (`src/modules/brain/summary/`)
- `POST /api/brain/summary` — deterministic cross-source evidence summaries
- Owner, source, topic, and knowledge-type summary modes with grouped evidence
- `e2e/brain-summary.spec.ts` — summary, grouping, unknown, and security tests
- ADR-010: Brain Summary Layer

### Security

- Intelligence Read Layer only — no raw provider data
- No LLM or external API calls
- Unknown topics return honest evidence-only message
- API responses remain secret-free

### Notes

- Report: [`reports/phase-10-report.md`](reports/phase-10-report.md)
- ADR: [`decisions/ADR-010-brain-summary-layer.md`](decisions/ADR-010-brain-summary-layer.md)
- `/api/brain/answer` unchanged

---

## [0.9.0-medium-connector] — 2026-07-06

### Added

- Real public RSS connector for `medium_personal` (`src/modules/sources/connectors/medium/`)
- Medium knowledge extractor — deterministic topics/projects from article evidence
- `e2e/medium.spec.ts` — sync, dedup, intelligence, brain, and security tests
- ADR-009: Medium public feed connector

### Changed

- Platform connect/sync responses now propagate connector messages (e.g. drafts-unsupported note)
- Brain Answer routes Medium-related questions to `medium_personal` knowledge

### Security

- Public RSS only — no OAuth, tokens, or private Medium data
- Drafts explicitly unsupported in connect, sync, and health messages
- API responses remain secret-free

### Notes

- Report: [`reports/phase-09-report.md`](reports/phase-09-report.md)
- ADR: [`decisions/ADR-009-medium-public-feed-connector.md`](decisions/ADR-009-medium-public-feed-connector.md)

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

## [0.7.0-urees-website] — 2026-07-06

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

## [0.6.0-brain-evidence-answer] — 2026-07-06

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

## [0.5.0-intelligence-read] — 2026-07-06

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

## [0.4.0-knowledge-layer] — 2026-07-06

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
