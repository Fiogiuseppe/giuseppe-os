# Next Phase

**Always points to the immediate next development task.** Update this file when a phase completes.

---

## Current status

| Field | Value |
|-------|-------|
| **Last completed** | Phase 2 — Sources Engine |
| **Up next** | Phase 3 — Website Connector: fiogiuseppe.com |
| **Blocked by** | Nothing |

---

## Phase 3 — Website Connector: fiogiuseppe.com

### Goal

Create the first **real** connector using a source we control.

### Implement

- [ ] `website_personal` connector (source ID: `website`)
- [ ] Fetch public pages from fiogiuseppe.com
- [ ] Extract page title, description, content, URL, metadata
- [ ] Store raw items
- [ ] Store normalized items
- [ ] Support Sync Now
- [ ] Update `lastSyncAt`, `lastSuccessfulSyncAt`, and health status

### Constraints

- No scraping private data
- Public website content only
- Respect robots.txt and reasonable request limits
- Deduplicate by URL/hash

### Tests required

- [ ] Sync Now fetches real public pages
- [ ] Raw items saved
- [ ] Normalized items saved
- [ ] Duplicate sync does not duplicate data
- [ ] Source health becomes healthy
- [ ] `npx tsc --noEmit` passes
- [ ] `npm run build` passes

### Documentation required on completion

- [ ] `docs/reports/phase-03-report.md`
- [ ] `docs/architecture/sources.md` (initial version)
- [ ] Update [`master-roadmap.md`](master-roadmap.md)
- [ ] ADR if connector architecture decision is made

### Reference

- Phase spec: [`docs/SOURCES_ROADMAP.md`](../SOURCES_ROADMAP.md)
- Prior report: [`docs/reports/phase-02-report.md`](../reports/phase-02-report.md)
- Archived connector code: `src/modules/sources/_phase2/connectors/`

---

*Last updated: 2026-07-06*
