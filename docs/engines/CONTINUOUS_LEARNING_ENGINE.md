# Continuous Learning Engine — Contract

**Status:** Foundation only (types + doc). No runtime.  
**Pipeline id:** `learning-engine` (in `FOUNDATION_PIPELINE_ENGINES`)  
**Mission gate:** Does this help Giuseppe become a smarter adviser over time — not a noisier feed?

---

## Purpose

Giuseppe OS must not limit itself to answering questions or suggesting today's move.

It must **continuously observe**:

- Giuseppe's stated and inferred **goals**
- **Active projects** and creative frontiers
- **Recent decisions** and their outcomes
- **Recurring mistakes** and behavioural patterns
- **Knowledge gaps** — areas where missing understanding blocks trajectory

When a gap is identified with sufficient evidence, the engine proposes **high-value learning resources** — never generic bestsellers, never motivational filler.

---

## Golden rule for recommendations

> **Silence > generic suggestion.**

Before publishing any resource recommendation:

1. Can we cite **specific evidence** from memory, graph, decisions, or projects?
2. Does it address a **named gap** relevant to Giuseppe's trajectory **right now**?
3. Would Future Giuseppe thank Present Giuseppe for spending time on this?

If any answer is no → **do not recommend**.

---

## What the engine observes (inputs)

| Signal source | What it contributes |
|---------------|---------------------|
| Memory Graph | Interests, gaps, lessons, people, beliefs |
| `giuseppe_brain.json` | North Star, mission 2036, values, active projects |
| Long-term memory | Decisions, lessons, patterns_detected |
| Decision Learning | Reviewed outcomes, trajectory effects |
| Pattern Engine (future) | Latent behaviours Giuseppe cannot see |
| Identity Graph (future) | Meaningful goals and contradictions |
| Digital Twin (future) | Probabilistic priorities and blind spots |

**Not in v1 scope:** live web search for trending books. Recommendations must be **reasoned**, not scraped from popularity lists.

---

## Knowledge gap detection

The **Gap Detector** (sub-component) produces `KnowledgeGap` records:

- **What** Giuseppe seems to lack (skill, framework, domain knowledge, relationship, tool literacy)
- **Why now** — triggered by project, decision, pattern, or repeated failure
- **Evidence[]** — quotes or refs from graph/memory (required)
- **blockingGoal** — which objective is slowed
- **confidence** — `0..1`
- **urgency** — derived from trajectory impact, not calendar hype

Gap detection runs:

- After decision review submission
- On scheduled batch (e.g. weekly) — not every page load
- When Pattern Engine promotes a new hypothesis (future)

**Max active gaps surfaced to UI:** 3 (future UI). Rest stay in graph for internal ranking.

---

## Resource recommendations

### Allowed resource kinds

`book` · `podcast` · `article` · `paper` · `video` · `course` · `person` · `company` · `tool` · `mental_model`

### Required fields (every recommendation)

| Field | Meaning |
|-------|---------|
| `title` | Specific resource or person — not "read more about leadership" |
| `kind` | From enum above |
| `whyNow` | Why **this week/month** — tied to evidence |
| `howItHelps` | Concrete mechanism: decision, project, pattern addressed |
| `timeRequired` | Honest estimate ("45 min", "6 weeks", "ongoing follow") |
| `priority` | `high` \| `medium` \| `low` |
| `expectedImpact` | Which capital / goal / project moves if Giuseppe acts |
| `evidence` | Non-empty array — memory ids, decision ids, pattern refs |
| `gapAddressed` | Link to `KnowledgeGap.id` |
| `confidence` | Engine certainty |
| `personalizationNote` | One line: why this is Giuseppe-specific |

### Forbidden

- Bestseller lists without personal link
- "Everyone should read X"
- Generic productivity / motivation content
- Resources that contradict stated values without explicit tension callout
- More than **3 recommendations per weekly cycle** (anti-feed)

---

## Engine outputs

### `ContinuousLearningReport`

- `generatedAt`
- `gaps[]` — ranked knowledge gaps
- `recommendations[]` — ranked resources (may be empty)
- `silenceReason` — when empty, explain honestly ("insufficient evidence", "no new gaps", "quality gate failed")
- `sourcesUsed[]` — audit trail (graph node ids, decision ids)

### Quality gate

Recommendations publish only when:

- `evidence.length >= 1`
- `confidence >= 0.55`
- `gapAddressed` is set
- Trajectory Engine would not filter as harmful (future integration)
- Golden Rule check passes (prompt-level today; programmatic later)

---

## API shape (future — not implemented)

```
GET /api/learning/recommendations?locale=it
POST /api/learning/recommendations/regenerate  (dev / live only)
```

Response: `ContinuousLearningReport` JSON.  
All AI via orchestrator. No keys in frontend.

---

## UI placement (future — not in foundation phase)

- **Not** a dashboard or infinite feed
- Progressive disclosure: Insights or Memory section, max 1–3 cards when confidence is high
- Each card expands: why now, time, impact, evidence
- Dismiss / "not relevant" feeds Learning Engine feedback (like `briefingFeedback.ts`)

---

## Learning loop (closed)

```
Interaction → Memory Extractor → Memory Graph
                    ↓
Decision taken → Review → Lesson + pattern update
                    ↓
Gap Detector → Continuous Learning Engine → Recommendations (or silence)
                    ↓
User action / dismiss → Twin + pattern calibration (future)
```

Every decision review must ask internally: *"Cosa posso imparare da questo?"* — implemented in Decision Learning today for lessons; graph + gap wiring is next phase.

---

## Relationship to existing Learning Engine

`lib/brain/engines/learningEngine.ts` today is **rule-based stub** used by Brain `learn` intent. It will be **replaced** by this contract — not duplicated.

`lib/learning/briefingFeedback.ts` remains the feedback ingestion point for Daily Brief; Continuous Learning Engine consumes similar signals for resource ranking.

---

## Orchestration rules

- Single entry: `runContinuousLearningEngine(input)` (future module)
- Reads graph + memory; never mutates brain JSON constitution directly
- Writes recommendations to cache (weekly TTL) — same pattern as Insights monthly cache
- Logs via `runWithAICallMeta` when AI reasoning step is used
- Mock mode: deterministic fixtures from brain patterns for tests

---

## Success criteria (when implemented)

- At least one recommendation cites a real decision or graph node in evidence
- Zero recommendations when evidence is thin (test asserts silence)
- User can trace "why this book now" to a project or mistake in Memory
- No recommendation published without `gapAddressed`

---

## References

- Types: `lib/learning/types.ts`
- Memory Graph: `docs/engines/MEMORY_GRAPH.md`
- Decision Learning: `docs/architecture/DECISION_LEARNING_LOOP.md`
- Pipeline: `lib/architecture/pipeline.ts`
- Product constitution: Golden Rule, silence over weak advice
