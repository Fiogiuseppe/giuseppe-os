# Giuseppe OS — Master Roadmap

Long-term project planning. This document tracks **completed work**, the **current phase**, **upcoming phases**, **backlog**, and **future ideas**.

For the immediate next task, see [`next-phase.md`](next-phase.md).

---

## How to read this roadmap

| Section | Meaning |
|---------|---------|
| **Completed** | Shipped, documented, tests passing |
| **Current** | Active development — one phase at a time |
| **Next** | Queued after current phase |
| **Backlog** | Agreed but not scheduled |
| **Future ideas** | Exploratory — not committed |

Phase discipline: **do not jump ahead**. Each phase ends with a report in [`docs/reports/`](../reports/).

---

## Product milestones (high level)

| Version | Theme | Status |
|---------|-------|--------|
| v0.1 | Foundation — constitution, decision engine, UI | ✅ Complete |
| v1.0 | Intelligence foundation — Executive Brain, memory, learning | ✅ Complete |
| v1.x | Personal Decision Intelligence — evidence, sources, knowledge | 🔄 In progress |
| v2.0 | Full evidence loop — cited AI, scheduled sync | Planned |

---

## Sources platform phases

Full spec: [`docs/SOURCES_ROADMAP.md`](../SOURCES_ROADMAP.md).

| Phase | Title | Status |
|-------|-------|--------|
| 1 | Sources Dashboard | ✅ Complete |
| 2 | Sources Engine | ✅ Complete |
| 3 | Website Connector — fiogiuseppe.com | ✅ Complete |
| 4 | UREES Website Connector | ✅ Complete |
| 5 | Medium Connector (RSS) | ✅ Complete |
| 6–13 | Normalization, read layer, AI, OAuth, social, sync | Planned |

---

## Knowledge & intelligence phases

| Phase | Title | Status |
|-------|-------|--------|
| 4 | **Knowledge Layer** | ✅ Complete |
| 5 | **Intelligence Read Layer** | ✅ Complete |
| 6 | **Brain Evidence Answer Layer** | ✅ Complete |
| 7 | **UREES Website Connector** | ✅ Complete |
| 8 | **Source Configuration Cleanup** | ✅ Complete |
| 9 | **Medium Connector (public RSS)** | ✅ Complete |

Reports: [`phase-02-report.md`](../reports/phase-02-report.md) · [`phase-03-report.md`](../reports/phase-03-report.md) · [`phase-04-report.md`](../reports/phase-04-report.md) · [`phase-05-report.md`](../reports/phase-05-report.md) · [`phase-06-report.md`](../reports/phase-06-report.md) · [`phase-07-report.md`](../reports/phase-07-report.md) · [`phase-08-report.md`](../reports/phase-08-report.md) · [`phase-09-report.md`](../reports/phase-09-report.md)

ADR: [`ADR-004-knowledge-layer.md`](../decisions/ADR-004-knowledge-layer.md) · [`ADR-005-intelligence-read-layer.md`](../decisions/ADR-005-intelligence-read-layer.md) · [`ADR-006-brain-evidence-answer-layer.md`](../decisions/ADR-006-brain-evidence-answer-layer.md) · [`ADR-007-configurable-website-connectors.md`](../decisions/ADR-007-configurable-website-connectors.md) · [`ADR-008-official-source-configuration.md`](../decisions/ADR-008-official-source-configuration.md) · [`ADR-009-medium-public-feed-connector.md`](../decisions/ADR-009-medium-public-feed-connector.md)

---

## Backlog

- [ ] Backfill Phase 1 implementation report
- [ ] ADR for Sources Engine store backend selection
- [ ] Guardian scan after major Sources/Knowledge changes

---

## Future ideas

*Not committed.*

- Knowledge graph visualization
- Cross-source concept merging
- Trajectory scoring from knowledge + decisions

---

## Update protocol

When a phase completes: report → roadmap → next-phase → changelog (if milestone) → ADR (if architectural).

---

*Last updated: 2026-07-06*
