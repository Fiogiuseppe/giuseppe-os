# Changelog Entry Template

Copy this block into `CHANGELOG.md` (create when first major release is tagged) or into a dated milestone file.

---

## [Version] — YYYY-MM-DD

### Added

- …

### Changed

- …

### Fixed

- …

### Security

- …

### Notes

- …
- Phase report: [`docs/reports/phase-XX-report.md`](../reports/phase-XX-report.md)
- ADRs: [`docs/decisions/`](../decisions/)

---

## Example

## [0.2.0-sources-engine] — 2026-07-06

### Added

- Sources Engine with persistent connection state and sync run logs
- `GET/POST /api/sources` safe metadata API
- `GET /api/sources/[provider]/sync-runs`

### Changed

- Sources dashboard Connect / Disconnect / Sync Now wired to backend

### Fixed

- *(none)*

### Security

- No tokens or secrets exposed in API responses; OAuth routes remain disabled

### Notes

- Stub adapters only — no external API calls until Phase 3
- Report: [`phase-02-report.md`](../reports/phase-02-report.md)

---

## Conventions

| Field | Use when |
|-------|----------|
| **Added** | New features, routes, components, tables |
| **Changed** | Behavior changes, refactors with user impact |
| **Fixed** | Bug fixes |
| **Security** | Auth, encryption, exposure, dependency CVEs |
| **Notes** | Links to reports, ADRs, migration steps |

Semantic versioning aligns with product milestones in [`roadmap/master-roadmap.md`](../roadmap/master-roadmap.md).

*Template version: 1.0 — 2026-07-06*
