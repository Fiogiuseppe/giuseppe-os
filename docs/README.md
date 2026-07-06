# Giuseppe OS — Documentation

Giuseppe OS is developed like a real software company. **This documentation is the single source of truth** for how the product works, why decisions were made, what shipped, and where we go next.

The conversation is temporary. The repository persists.

---

## How to use this documentation

| If you need to… | Start here |
|-----------------|------------|
| Understand how a system works | [`architecture/`](architecture/) |
| Know why we chose an approach | [`decisions/`](decisions/) |
| Review what shipped in a phase | [`reports/`](reports/) |
| See current and future work | [`roadmap/`](roadmap/) |
| Track releases and milestones | [`changelog/`](changelog/) |
| Protect product vision and values | [`philosophy/`](philosophy/) |

### Session startup (developers & AI)

Before implementation, also read the constitution stack at the repo root:

1. [`CURSOR_STARTUP.md`](CURSOR_STARTUP.md)
2. [`PRODUCT_CONSTITUTION.md`](PRODUCT_CONSTITUTION.md)
3. [`ENGINEERING_CONSTITUTION.md`](ENGINEERING_CONSTITUTION.md)
4. [`DESIGN_DNA.md`](DESIGN_DNA.md)
5. [`01_CURRENT_STATUS.md`](01_CURRENT_STATUS.md)
6. [`02_NEXT_STEPS.md`](02_NEXT_STEPS.md)

---

## Folder guide

### [`architecture/`](architecture/)

**Technical documentation — HOW Giuseppe OS works.**

System design, data flows, engine contracts, database schemas, and integration boundaries. When code ships, architecture docs explain the moving parts.

### [`decisions/`](decisions/)

**Architecture Decision Records (ADRs) — WHY we chose a path.**

Every significant technical choice gets a durable record: context, alternatives, consequences. Prevents re-litigating settled decisions.

### [`reports/`](reports/)

**Implementation reports — WHAT shipped in each phase.**

Every development phase produces a report from [`REPORT_TEMPLATE.md`](reports/REPORT_TEMPLATE.md). Reports are the audit trail of working code.

### [`roadmap/`](roadmap/)

**Planning — WHERE we are going.**

[`master-roadmap.md`](roadmap/master-roadmap.md) tracks completed phases, current phase, backlog, and future ideas. [`next-phase.md`](roadmap/next-phase.md) always holds the immediate next task.

### [`changelog/`](changelog/)

**Release history — WHAT changed for users and operators.**

Major milestones, security fixes, and breaking changes. Use [`CHANGELOG_TEMPLATE.md`](changelog/CHANGELOG_TEMPLATE.md).

### [`philosophy/`](philosophy/)

**Vision guardrails — WHO Giuseppe OS is for and WHAT it must never become.**

Long-term principles that outlive any sprint. Placeholders today; living documents as the product matures.

---

## Development rule

**A phase is NOT complete until all required documentation is generated. Never wait to be asked.**

At the end of every completed phase, automatically:

| # | Action | Path |
|---|--------|------|
| 1 | Phase report (from template) | `docs/reports/phase-XX-report.md` ← [`REPORT_TEMPLATE.md`](reports/REPORT_TEMPLATE.md) |
| 2 | Update master roadmap | [`roadmap/master-roadmap.md`](roadmap/master-roadmap.md) |
| 3 | Update next task | [`roadmap/next-phase.md`](roadmap/next-phase.md) |
| 4 | ADR *(only if architectural decision)* | `docs/decisions/ADR-NNN-*.md` |
| 5 | Changelog *(only if significant milestone)* | [`changelog/`](changelog/) |

Plus: working code, typecheck pass, build pass, phase tests pass.

Enforced in `.cursor/rules/phase-completion.mdc` and `giuseppe-os-constitution.mdc`.

---

## Legacy documents

Older root-level docs remain valid and are gradually absorbed into this structure:

| Document | Role |
|----------|------|
| `PRODUCT_CONSTITUTION.md` | Product law (supersedes ad-hoc product choices) |
| `ENGINEERING_CONSTITUTION.md` | Engineering law |
| `DESIGN_DNA.md` | UI/UX law |
| `SOURCES_ROADMAP.md` | Sources platform phase detail (see also `roadmap/`) |
| `GIUSEPPE_OS_ARCHITECTURE.md` | High-level architecture (see also `architecture/`) |

When legacy and structured docs conflict, **update the structured doc and note the migration** — do not leave two truths.

---

*Last updated: 2026-07-06*
