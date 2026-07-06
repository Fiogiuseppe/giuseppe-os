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
| v1.x | Personal Decision Intelligence — evidence, sources, trajectory | 🔄 In progress |
| v2.0 | Full evidence loop — real sources, cited AI, scheduled sync | Planned |

Detail: [`docs/ROADMAP.md`](../ROADMAP.md) (legacy product roadmap).

---

## Sources platform phases

Dedicated track for synchronized personal evidence. Full spec: [`docs/SOURCES_ROADMAP.md`](../SOURCES_ROADMAP.md).

| Phase | Title | Status |
|-------|-------|--------|
| 1 | Sources Dashboard | ✅ Complete |
| 2 | Sources Engine | ✅ Complete |
| 3 | Website Connector — fiogiuseppe.com | **Current** |
| 4 | Website Connector — UREES | Next |
| 5 | Medium Connector (RSS) | Planned |
| 6 | Normalization Layer | Planned |
| 7 | Intelligence Read Layer | Planned |
| 8 | First AI Evidence Use | Planned |
| 9 | OAuth Engine | Planned |
| 10 | Token Vault | Planned |
| 11 | Instagram Connectors | Planned |
| 12 | LinkedIn Connector | Planned |
| 13 | Scheduled Sync | Planned |

Reports: [`phase-02-report.md`](../reports/phase-02-report.md) *(Phase 1 report to be backfilled if needed)*.

---

## Backlog

Items agreed but not assigned to the current phase:

- [ ] Backfill Phase 1 implementation report
- [ ] Migrate `GIUSEPPE_OS_ARCHITECTURE.md` sections into `docs/architecture/`
- [ ] ADR for Sources Engine store backend selection (memory / file / supabase)
- [ ] Guardian scan after Sources Phase 3+

---

## Future ideas

*Not committed. Require constitution check before promotion to backlog.*

- Cross-source evidence graph visualization
- Decision replay from historical evidence
- Trajectory scoring from synchronized life outputs
- Multi-device sync for connection state

---

## Update protocol

When a phase completes:

1. Mark phase ✅ in this file
2. Update **Current** and **Next** rows
3. Refresh [`next-phase.md`](next-phase.md)
4. Add changelog entry for major milestones
5. Link the new report from the phase table

---

*Last updated: 2026-07-06*
