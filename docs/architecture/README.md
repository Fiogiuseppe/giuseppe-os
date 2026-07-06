# Architecture

Technical documentation for Giuseppe OS.

This folder explains **how the system works** — components, data flows, contracts, storage, and integration boundaries. It is written for engineers, operators, and AI agents implementing features.

---

## Purpose

| Goal | How this folder helps |
|------|------------------------|
| Onboard quickly | Read system docs before touching code |
| Avoid regressions | Know engine contracts and forbidden paths |
| Scale safely | See where persistence, auth, and AI boundaries live |
| Ship in phases | Each subsystem gets a dedicated doc when it becomes real |

Architecture docs describe **current truth**. If code and docs diverge, fix the code or update the doc in the same change.

---

## Planned documents

| Document | Scope | Status |
|----------|-------|--------|
| [`knowledge.md`](knowledge.md) | Knowledge layer — evidence → structured knowledge | **Phase 4** |
| [`oauth.md`](oauth.md) | Generic OAuth engine, callback flow, token handling | Planned |
| [`sync-engine.md`](sync-engine.md) | Sync orchestration, logs, retries, rate limits | Planned |
| [`intelligence.md`](intelligence.md) | Evidence read layer, query interface, AI boundaries | Planned |
| [`memory.md`](memory.md) | Memory vs identity vs digital twin | Planned |
| [`database.md`](database.md) | Supabase schema, migrations, store backends | Planned |
| [`ai-brain.md`](ai-brain.md) | Executive Brain orchestration, provider abstraction | Planned |

Create each document when its subsystem ships or changes materially.

---

## Existing architecture material

These live at the repo root or in this folder and remain authoritative until migrated:

| Document | Topic |
|----------|-------|
| [`GIUSEPPE_OS_ARCHITECTURE.md`](../GIUSEPPE_OS_ARCHITECTURE.md) | Executive Brain spine, engine overview |
| [`ARCHITECTURE_V2.md`](../ARCHITECTURE_V2.md) | Architecture evolution notes |
| [`PERSONAL_DATA_SOURCES.md`](PERSONAL_DATA_SOURCES.md) | Personal data sources foundation |
| [`SELF_MODEL.md`](SELF_MODEL.md) | Self model |
| [`IDENTITY_GRAPH.md`](IDENTITY_GRAPH.md) | Identity graph |
| [`DECISION_LEARNING_LOOP.md`](DECISION_LEARNING_LOOP.md) | Decision learning loop |
| [`SOURCES_PLATFORM.md`](../SOURCES_PLATFORM.md) | Sources platform design |

---

## Conventions

- **Diagrams welcome** — mermaid or ascii for flows
- **Name real paths** — `src/`, `app/api/`, `lib/`
- **State what's mock** — distinguish scaffold from production behavior
- **Link ADRs** — when a doc reflects a decision, link `../decisions/ADR-XXX.md`
- **No secrets** — never document tokens, keys, or PII examples

---

*Index last updated: 2026-07-06*
