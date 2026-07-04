# Giuseppe OS — Architecture v2 (Decision Intelligence)

**Status:** Target state — implementation is incremental  
**Authority:** Complements [`GIUSEPPE_OS_ARCHITECTURE.md`](GIUSEPPE_OS_ARCHITECTURE.md) (v1 detail)  
**Pivot narrative:** [`DECISION_INTELLIGENCE_PIVOT.md`](DECISION_INTELLIGENCE_PIVOT.md)

---

## System Identity

**Giuseppe OS** = Personal Decision Intelligence System — **the decision partner Giuseppe trusts the most**

**Ultimate purpose:** Not the smartest AI — the most trusted decision partner. Every engine must improve decision quality.

**Success metric:** Whether Giuseppe consistently makes better life decisions over time — not usage.

**Horizon:** Decades — not today.

---

## The Three Selves

Every important decision passes through:

| Self | Evaluates |
|------|-----------|
| **Past Giuseppe** | Experience, repeating patterns, mistakes to avoid, successes to compound |
| **Present Giuseppe** | Today's energy, projects, finances, relationships, responsibilities, opportunities, risks |
| **Future Giuseppe** | Creative Director, builder, writer, financially free, healthy, present father, great friend |

**Rule:** Maximize alignment between Present and Future while respecting Past.

---

## The Golden Rule

> *If Giuseppe follows this advice, will Future Giuseppe most likely thank Present Giuseppe ten years from now?*

**If yes — show it. If not — keep silent.**

---

## Layer Model

```
┌─────────────────────────────────────────────────────────────┐
│  TODAY — Conversation (judgement, not information)          │
│  "If the wisest Giuseppe had five minutes — what would       │
│   he say to Present Giuseppe?"                              │
└─────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────┐
│  DELIVERY: Quality Engine → Daily Brief Generator           │
│  Golden Rule gate before publish                            │
└─────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────┐
│  DECIDE: Goal Validation → Trajectory → Simulator →       │
│          Prediction (Three Selves evaluation)             │
└─────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────┐
│  MODEL: Identity → Digital Twin → Pattern Engine → Voice DNA│
└─────────────────────────────────────────────────────────────┘
                              ▲
┌─────────────────────────────────────────────────────────────┐
│  OBSERVE: Living Timeline → Reality → Personal Relevance  │
└─────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │  Learning Engine  │──► Twin, Identity, Patterns
                    └───────────────────┘
```

---

## Engine Registry

| Engine | Package | Status |
|--------|---------|--------|
| Living Timeline | `lib/timeline/` | Types only |
| Reality Engine | `lib/reality/` | Partial |
| Personal Relevance Engine | `lib/relevance/` | Shipped |
| Identity Layer | `lib/identity/` | Types only |
| Digital Twin | `lib/digital-twin/` | Types only |
| Pattern Engine | `lib/pattern/` | Types only |
| Voice DNA | `lib/voice-dna/` | Types only |
| Goal Validation Engine | `lib/goal-validation/` | Types only |
| Trajectory Engine | `lib/trajectory/` | Shipped |
| Decision Simulator | `lib/decision-simulator/` | Types only |
| Prediction Engine | `lib/prediction/` | Types only |
| Quality Engine | `lib/briefing/quality.ts` | Shipped |
| Daily Brief Generator | `lib/todays-letter/` | Shipped |
| Learning Engine | `lib/learning/`, `lib/brain/engines/` | Partial |

Canonical order: `lib/architecture/pipeline.ts`

---

## Daily Brief Contract

**Nature:** Judgement — not information.

**Question:** *If the wisest version of Giuseppe had five minutes with Present Giuseppe this morning — what would he say?*

| Section | Role |
|---------|------|
| One Big Move | The wisest judgement for today — hero element |
| Reality | One filtered world signal that changes probabilities |
| Opportunity | One concrete opportunity worth exploring |
| Ignore | One thing to intentionally ignore |
| Nourish | One growth input |
| Reflection | One transformational question |

**Quality gate:** relevance, novelty, trajectory impact, evidence, confidence, personalization.

**Golden Rule:** Future Giuseppe thanking Present Giuseppe in ten years — or silence.

---

## Primary Questions (Code)

From `lib/architecture/pipeline.ts`:

- **Ultimate purpose:** Decision partner Giuseppe trusts most — not smartest AI
- **Product:** *Knowing everything Giuseppe has lived, everything happening in the world, and everything he wants to become — what decision has the highest probability of improving his future?*
- **Daily Brief:** *If the wisest version of Giuseppe had five minutes with Present Giuseppe this morning — what would he say?*
- **Golden Rule:** *If Giuseppe follows this advice, will Future Giuseppe most likely thank Present Giuseppe ten years from now?*
- **Patterns:** Discover what Giuseppe cannot easily see — patterns are more valuable than memories

---

## Related Documents

- [`DECISION_INTELLIGENCE_PIVOT.md`](DECISION_INTELLIGENCE_PIVOT.md)
- [`PRODUCT_CONSTITUTION.md`](PRODUCT_CONSTITUTION.md)
- [`ENGINEERING_CONSTITUTION.md`](ENGINEERING_CONSTITUTION.md)
