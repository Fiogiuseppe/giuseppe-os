# Identity Graph

**Version:** 0.1.0 (foundation)  
**Status:** Architecture only — not populated, not wired into UI  
**Location:** `lib/identity/`

---

## Why it exists

Giuseppe OS has been growing **parallel interpretations** of Giuseppe:

- Constitution JSON (`giuseppe_brain.json`) for identity and projects
- Long-term memory for decisions and lessons
- Awareness and potential engines with their own candidate logic
- Today's Letter with trajectory and relevance pipelines
- Memory Palace cards assembled for display

Each module answers a different question with a different slice of data. Over time that produces **drift**: the same project can mean one thing in Create, another in Insights, and another in Memory.

The **Identity Graph** is the next source of truth. It models Giuseppe as a **living system** — not a folder of notes, not a chat transcript, not a single JSON file.

> Memory stores what happened. The graph stores **what it means** and **how it connects**.

---

## What it is

A **directed, typed multigraph**:

- **Nodes** — thirteen kinds: values, principles, long-term goals, projects, habits, relationships, decisions, lessons, skills, interests, life events, patterns, ambitions
- **Edges** — semantic relationships: supports, leads_to, contradicts, part_of, and others
- **No category silos** — any node may connect to any other node

Example trajectory (reference only, not auto-loaded):

```
Writing → Visceral Poems → LinkedIn → Personal Brand → LEGO → Career
```

---

## How it differs from memory

| Dimension | Memory | Identity Graph |
|-----------|--------|----------------|
| Unit | Records, sessions, facts | Nodes and relationships |
| Question | What was observed? | What does it mean and what does it connect to? |
| Structure | Lists and tables | Graph — paths, neighbors, clusters |
| Mutation | Append on interaction | Curated graph updates with provenance |
| Consumption | Engines read slices | All engines query one graph |
| Time | Event timestamps | Nodes + life events + evolving edges |

Memory remains important as **evidence** (`IdentitySourceRef` on nodes). The graph does not replace persistence — it **interprets** it.

---

## Module layout

```
lib/identity/
  types.ts           Core node, edge, graph, query types
  schema.ts          Kind registries and validators
  graph.ts           Graph CRUD and validation
  query.ts           Traversal, search, path, neighbor queries
  store.ts           Persistence interface (in-memory empty default)
  provider.ts        Consumer-facing provider API
  brainContext.ts    Format query results for Executive Brain prompts
  executiveBrain.ts  Topic-aware context resolver for the brain
  fixtures.ts        Example chain (manual / test use only)
  index.ts             Public exports
```

### Public interfaces

- **`IdentityGraphStore`** — `load`, `save`, `reset` (default: empty graph)
- **`IdentityGraphProvider`** — `getGraph`, `query`, `formatForBrain`
- **`queryIdentityGraph(graph, query)`** — pure query engine
- **`resolveIdentityContextForBrain(topics)`** — brain integration entry point

---

## Query model

The Executive Brain (and future engines) query the graph — they do not own separate world models.

Supported query types:

| Query | Purpose |
|-------|---------|
| `node` | Fetch one node by id |
| `kind` | All nodes of a type (e.g. all active projects) |
| `neighbors` | N-hop neighborhood around a node |
| `path` | Paths between two nodes (e.g. Writing → Career) |
| `traverse` | Directed walk following edge kinds |
| `search` | Label/description text search |
| `related` | Related nodes filtered by kind |

Results include nodes, edges, and optional paths — formatted for prompts via `formatIdentityGraphForBrain`.

---

## How it will evolve

### Phase 0 — Foundation (this sprint)

- Types, graph operations, query engine, store interface
- Empty default store — **no automatic population**
- Documentation and brain context formatter
- Example fixture chain for tests and docs only

### Phase 1 — Seeding

- One-time import from constitution JSON, memory, and decisions
- Human-reviewed node creation — no silent inference writes
- Provenance on every node (`sourceRefs`)

### Phase 2 — Engine migration

- Today: briefing relevance reads graph paths, not ad-hoc project lists
- Decisions: options scored against connected values and goals
- Insights: patterns are graph clusters, not isolated strings
- Create: opportunities ranked by graph centrality and ambition links
- Memory: palace cards become **views** over graph subgraphs

### Phase 3 — Living graph

- Timeline and life events append nodes
- Contradiction detection (`contradicts` edges)
- Confidence decay on stale relationships
- Optional Digital Twin projection derived from graph topology

---

## How future engines will use it

```
User action / page load
        ↓
Executive Brain (or section engine)
        ↓
resolveIdentityContextForBrain(topics)
        ↓
IdentityGraphProvider.query(...)
        ↓
formatIdentityGraphForBrain(result)
        ↓
Context Builder + Mission Gate + AI Provider
```

**Today** will ask: *What node has the highest leverage path to active ambitions?*  
**Decisions** will ask: *Which values and goals does this option touch or violate?*  
**Insights** will ask: *What patterns form dense clusters I am not seeing?*  
**Create** will ask: *Which projects are upstream of long-term goals but underfed?*  
**Memory** will ask: *Who am I in the graph — not in a static list?*

---

## Principles

1. **One graph, many views** — UI sections are lenses, not separate databases
2. **Relationships are first-class** — a project without edges is incomplete
3. **No fake population** — an empty graph is honest; inference comes later with review
4. **Queryable, not magical** — every engine access goes through typed queries
5. **Evidence-linked** — nodes cite memory and external sources where possible

---

## Guardian alignment

- Architecture first — modules swappable, no UI churn in this sprint
- Truth over comfort — empty graph until curated seeding
- Identity before goals — values and principles are node kinds, not footnotes
- Never fake data — `resolveIdentityContextForBrain` reports empty state honestly

See also: [`INTELLIGENCE_FOUNDATION.md`](../INTELLIGENCE_FOUNDATION.md), [`ENGINEERING_CONSTITUTION.md`](../ENGINEERING_CONSTITUTION.md).
