# Self Model v1

## What it is

The Self Model is Giuseppe OS’s **evidence-backed model of Giuseppe over time**. It tracks fifteen core dimensions — creative energy, focus, freedom, financial security, health, relationships, courage, consistency, curiosity, reputation, learning, emotional clarity, execution, risk tolerance, and alignment with future self.

Each dimension stores:

- `current_estimate` — a qualitative label derived only from recorded evidence, or `"unknown"`
- `confidence` — `low`, `medium`, or `high`, based on evidence volume
- `evidence_count` — how many distinct evidence events touched this dimension
- `last_updated` — ISO timestamp of the latest evidence
- `evidence_sources` — provenance keys such as `decision:decision_123` or `briefing:brief_feedback_1`
- `notes` — factual notes copied from real events (outcomes, lessons, feedback, project activity)

The model lives in `lib/self-model/` and persists to Supabase table `memory_self_model` when configured, with an in-memory fallback for dev and tests.

## How it differs from Memory

| | Memory (constitution) | Self Model |
|---|---|---|
| **Nature** | Curated identity — WHY, HOW, values, north star | Probabilistic, evolving estimate from lived evidence |
| **Source** | Giuseppe-authored brain JSON + constitution | Decisions, brief feedback, project activity only |
| **Changes** | Intentional editorial updates | Automatic after measured events |
| **Uncertainty** | Declarative truths Giuseppe chose | Explicit unknowns until evidence accumulates |
| **UI** | Memory page manifesto | No UI in v1 — internal context for engines |

Memory answers *who Giuseppe says he is*. The Self Model answers *what the system has actually observed*.

## How it improves each surface

### Today (Daily Brief)

`buildDailyBriefingContext()` loads `getSelfModelSummary()` and injects it into the briefing prompt. The brief can reference observed patterns **only when evidence is sufficient**. Dimensions still marked `unknown` are never surfaced as facts.

### Decisions

After every outcome review, `applyDecisionReview()` calls `updateSelfModelFromDecision()`. Reviewed outcomes, execution signals (`didIt`), and lessons become evidence on mapped dimensions. Derived patterns (e.g. “intent without execution”) are stored when the review data supports them.

### Insights

`generateLocalMonthlyInsight()` passes `getStrongestPatterns()` into `runAwarenessEngine()`. Candidates that align with evidence-backed self-model patterns receive a weight boost — insights prefer signals the model has actually seen.

### Create

`generateLocalCreateBrief()` passes `getSelfModelSummary()` to `runPotentialEngine()` as read-only context. Create may influence `riskToAvoid` when the summary contains evidence-backed friction signals. **No dimension scores are invented** for opportunities.

## Why uncertainty is required

Giuseppe OS must not pretend to know Giuseppe better than Giuseppe does. A single LinkedIn decision does not justify a reputation score. A helpful brief rating does not prove emotional clarity.

Until `evidence_count >= 3` (see `SUFFICIENT_EVIDENCE_COUNT`):

- `current_estimate` stays `"unknown"`
- `confidence` stays `"low"`
- `getSelfModelSummary()` omits the dimension from prompt output

This is a Guardian rule: **never show Self Model estimates as truth unless evidence is sufficient.**

## How confidence grows

Evidence accumulates from real events:

1. **Decision reviews** — category maps to dimensions; execution answers touch `execution` and `consistency`
2. **Daily brief feedback** — section ratings add evidence to related dimensions
3. **Project activity** — factual project status notes from real activity records

As `evidence_count` rises:

| Count | Confidence | Estimate |
|-------|------------|----------|
| 0–2 | low | `unknown` |
| 3–5 | medium | derived qualitative label from note signals |
| 6+ | high | same derivation, higher trust |

Estimates are qualitative (`strengthening trend from recorded evidence`, `needs attention based on recorded evidence`, etc.) — never numeric personality scores.

## API surface

```typescript
import {
  loadSelfModel,
  updateSelfModelFromDecision,
  updateSelfModelFromDailyBriefFeedback,
  updateSelfModelFromProjectActivity,
  getSelfModelSummary,
  getLowConfidenceAreas,
  getStrongestPatterns
} from '../self-model';
```

## Persistence

- **Production:** `memory_self_model` in Supabase (single row `giuseppe_v1`)
- **Dev / tests:** in-memory store via `lib/self-model/inMemoryStore.ts`
- **Never:** local JSON files for self-model state in production paths

## Future

- Wire `updateSelfModelFromProjectActivity()` to weekly board refresh or explicit project check-ins
- Expose low-confidence areas to Giuseppe in a review surface (not v1)
- Cross-link with Digital Twin types when that layer matures — Self Model is the measured substrate; Digital Twin is the narrative synthesis layer
