# Memory Graph Engine — Contract

**Status:** Foundation only (types + doc). No runtime.  
**Pipeline id:** `memory-graph` (foundation — not yet in `IMPLEMENTED_PIPELINE_ENGINES`)  
**Mission gate:** Does this help Giuseppe make better decisions over decades?

---

## Purpose

Giuseppe OS must not treat memory as a flat list of notes.

Every meaningful interaction produces **structured extractions** that are stored as nodes and edges in a **Knowledge Memory Graph** — a living map of what Giuseppe cares about, decides, repeats, learns, and is trying to become.

The Memory Graph is **operational memory**: facts, preferences, events, and entities extracted from conversations and system events.

It is **not** the Identity Graph (`lib/identity/types.ts`), which stores **meaning** (values, reinterpretations, long-term identity). The Memory Graph feeds the Identity Layer; it does not replace it.

---

## Core principle

> Memory is a graph that evolves continuously — not a log file.

Each extracted element must carry:

- **importance** — how much this should influence future recommendations
- **category** — what kind of thing it is
- **observedAt** — when Giuseppe OS learned it
- **confidence** — how sure we are (never fake certainty)
- **links** — relationships to other nodes (supports, contradicts, repeats, enables, etc.)

---

## What gets extracted

After every analyzable interaction (Brain call, decision intake, review submission, content generation with personal topic, etc.), the **Memory Extractor** may propose extractions:

| Category | Examples |
|----------|----------|
| `interest` | New topic Giuseppe keeps returning to |
| `preference` | How he likes to work, communicate, decide |
| `decision` | Important choice with context |
| `recurring_mistake` | Same bias + negative outcome ≥2 times |
| `lesson` | Confirmed takeaway from outcome review |
| `person` | Someone who matters for trajectory |
| `relationship` | Dynamic worth tracking (mentor, collaborator, tension) |
| `value` | Stated or inferred value shift |
| `belief` | Conviction that shapes behaviour |
| `goal` | Stated or inferred objective |
| `idea` | Hypothesis not yet a project |
| `project` | Active or abandoned endeavour |
| `skill_gap` | Area where knowledge is thin |
| `pattern` | Trigger → outcome recurrence |

**Rule:** Extraction is **selective**. Not every chat turn becomes a node. Low-signal filler is discarded.

---

## Graph model

### Nodes (`MemoryGraphNode`)

- Unique `id`
- `kind` — category from table above
- `label` — human-readable summary (short)
- `content` — optional fuller text
- `importance` — `0..1` (feeds ranking, not displayed as score in UI)
- `confidence` — `0..1`
- `status` — `active` | `dormant` | `archived` | `disputed`
- `sourceRefs` — links to session, decision id, brain intent, file path
- `observedAt`, `updatedAt`

### Edges (`MemoryGraphEdge`)

- `from`, `to` — node ids
- `kind` — e.g. `supports`, `contradicts`, `repeats`, `enables`, `blocks`, `part_of`, `relates_to`, `learned_from`, `same_pattern_as`
- `strength` — optional `0..1`
- `note` — why this link exists

### Graph container (`MemoryGraph`)

- Version string for migrations
- `nodes[]`, `edges[]`
- `updatedAt`

Storage target (future): `memory/knowledge_graph.json` locally; Supabase later. **Not implemented in foundation phase.**

---

## Memory Extractor — contract

**Input:** `MemoryExtractionInput`

- Interaction source (`brain`, `decision_review`, `decision_intake`, `content`, `manual`)
- Raw text (user message, assistant response, or structured decision fields)
- Existing graph snapshot (for dedup and linking)
- Brain context slices (identity, projects — read-only)
- Locale

**Output:** `MemoryExtractionResult`

- `proposedNodes[]` — new or updated nodes
- `proposedEdges[]` — links between new and existing nodes
- `rejected[]` — extractions considered but dropped (with reason, for audit)
- `confidenceNote` — honest uncertainty when context was thin
- `shouldPersist` — false when quality gate fails

**Quality gate (non-negotiable):**

- No extraction without identifiable evidence in the input text
- No duplicate nodes for the same fact (merge or strengthen edge instead)
- No PII expansion beyond what Giuseppe already stated
- `confidence < 0.4` → do not persist unless user confirms later (future)

**Orchestration:** Memory Extractor runs **server-side only**, after Executive Brain or decision APIs. Never from UI directly. AI via orchestrator (`lib/ai/orchestrator.ts`), JSON contract + repair retry.

---

## Relationship to existing stores

| Store | Role |
|-------|------|
| `memory/giuseppe_brain.json` | Static constitution — North Star, values, projects (seed, not auto-mutated) |
| `memory/working_memory.json` | Recent sessions + lightweight `MemoryRecord` |
| `memory/long_term.json` | Decisions, lessons, `patterns_detected` |
| **Memory Graph** (future) | Rich extractions + links — source of truth for gap detection |
| Identity Graph | Meaning layer built from facts + reinterpretation |

Migration path: Decision Learning loop already writes lessons and patterns to long-term memory. Memory Extractor will **also** write graph nodes and link to `decision:{id}`.

---

## Learning Loop hook

When a decision review completes (`lib/decision-learning/learning.ts`), the system must ask:

> *"Cosa posso imparare da questo?"*

That triggers:

1. Lesson node (or strengthen existing mistake/pattern node)
2. Edge to related project, goal, or value
3. Update to behavioural pattern hypothesis
4. Signal to Gap Detector (did this reveal a knowledge hole?)
5. Future: Digital Twin dimension update

This hook is **documented here**; wiring is a later phase.

---

## Silence rules

- No graph bloat — max extractions per interaction capped (see types)
- No generic motivational entities ("growth mindset", "productivity")
- No inferred facts about third parties beyond what Giuseppe stated
- When unsure → lower confidence or skip

---

## Implementation phases (not in scope now)

1. Types + validation helpers
2. Extractor with JSON contract + mock/fixture tests
3. File-backed graph store + merge logic
4. Hook on `/api/brain` and decision review submit
5. Gap Detector reads graph
6. UI in Memory / Insights (progressive disclosure)

---

## References

- Types: `lib/learning/types.ts`
- Identity Graph: `lib/identity/types.ts`
- Decision Learning: `docs/architecture/DECISION_LEARNING_LOOP.md`
- Pipeline registry: `lib/architecture/pipeline.ts`
- Continuous Learning: `docs/engines/CONTINUOUS_LEARNING_ENGINE.md`
