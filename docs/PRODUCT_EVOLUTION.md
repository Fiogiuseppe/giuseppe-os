# Giuseppe OS — Product Evolution

**Version:** 2.1 (Five Questions Architecture)  
**Date:** July 2026  
**Status:** Canonical product structure — implementation is incremental

---

## Why This Exists

Giuseppe OS is no longer a collection of features. It is a **personal operating system for growth and decision making**.

Every section answers **one important life question**. Nothing more.

Related: [`DECISION_INTELLIGENCE_PIVOT.md`](DECISION_INTELLIGENCE_PIVOT.md) · [`ARCHITECTURE_V2.md`](ARCHITECTURE_V2.md) · [`PRODUCT_CONSTITUTION.md`](PRODUCT_CONSTITUTION.md)

---

## Product Mission

> Increase the probability that Giuseppe builds the life he truly wants — not by replacing his judgement, but by improving it.

Giuseppe OS becomes **the decision partner Giuseppe trusts the most**.

Success is measured by **better life decisions over time** — not usage.

---

## Global Principles

- Less information. More clarity.
- Less notifications. More meaning.
- Less productivity. More trajectory.
- Less quantity. More leverage.
- Protect Giuseppe's attention.
- Respect uncertainty. Never pretend certainty.
- Always explain reasoning.
- Every recommendation improves at least one capital: Wealth, Knowledge, Creativity, Relationships, Health, Freedom, Time, Reputation.

---

## The Five Sections

Registry: `lib/architecture/sections.ts`

| Section | Purpose | Question |
|---------|---------|----------|
| **Today** | Guide every morning | What is the highest leverage thing I can do today? |
| **Decisions** | Better decisions | What is the best decision I can make? |
| **Insights** | Observe over time | What am I not seeing? |
| **Create** | Build meaningful things | What deserves my energy? |
| **Memory** | Remind who he is | Who do I want to continue being? |

---

## 1. Today

### Why it exists

Morning guidance — judgement in under 20 seconds. Not a dashboard.

### Question

**What is the highest leverage thing I can do today?**

### What the user sees

Daily Brief only:

1. Good morning Giuseppe  
2. One Big Move  
3. Reality  
4. Opportunity  
5. Ignore  
6. Nourish  
7. Reflection  

Progressive disclosure expands: **Why · Evidence · Trajectory Impact · Confidence · Possible actions**

### Data it needs

| Source | Today |
|--------|-------|
| Digital Twin | Planned |
| Active projects | Yes (`giuseppe_brain.json`) |
| Priorities | Yes |
| Calendar | Future |
| Recent behaviour | Partial (memory) |
| World events | Partial (`lib/reality/`) |
| Pipeline meta | Yes (`/api/todays-letter`) |

### Engines

Reality → Personal Relevance → Trajectory → Quality → Daily Brief Generator

### Future improvements

- Twin-informed personalization  
- Calendar-aware One Big Move  
- Explicit confidence/evidence from Quality Engine in UI  
- Regenerate on low quality  

---

## 2. Decisions

### Why it exists

Interactive decision partner — Giuseppe brings the decision.

### Question

**What is the best decision I can make?**

### What the user sees

- Decision form (decision + true reason)  
- System simulates before answering (future: multi-scenario)  
- Reasoned recommendation — not an order  
- Progressive disclosure: why, board, capitals, better version  

### Data it needs

| Source | Today |
|--------|-------|
| User decision + reason | Yes (form) |
| Memory constitution | Yes |
| Patterns | Yes |
| Goal validation context | Philosophy only |

### Engines

Executive Brain (`/api/brain`, `decide` intent) · Trajectory (future) · Decision Simulator (types only)

### Future improvements

- Never answer immediately — simulate scenarios first  
- Per scenario: upside, downside, trade-offs, opportunity cost, confidence, time horizon, Future Giuseppe alignment  
- Goal Validation challenges wrong objectives  

---

## 3. Insights

### Why it exists

Built over time — surfaces patterns Giuseppe cannot easily see.

### Question

**What am I not seeing?**

### What the user sees

- Primary insight (Awareness Engine)  
- Patterns and blind spots (progressive disclosure)  
- Evidence, reflection, suggested action  
- **Not** updated daily — compounds over weeks  

### Data it needs

| Source | Today |
|--------|-------|
| Awareness Engine | Yes |
| Brain patterns | Yes |
| Living Timeline | Types only |
| Pattern Engine | Types only |
| Writing, LinkedIn, creative work | Future |

### Engines

Awareness Engine (shipped) · Pattern Engine (planned) · Learning Engine (partial)

### Future improvements

- Pattern Engine discoveries with evidence  
- Blind spot evolution tracking  
- Remove finance cockpit from Insights (finance lives in Memory/Decisions context)  

---

## 4. Create

### Why it exists

Rebalance creative energy across projects.

### Question

**What deserves my energy?**

### What the user sees

- Today's recommended project focus  
- Open projects (disclosure)  
- Opportunities panel (disclosure)  
- Future: importance, momentum, risk, suggested pause  

### Data it needs

| Source | Today |
|--------|-------|
| Project roster | Yes |
| Potential Engine | Yes |
| Trajectory impact per project | Future |

### Engines

Potential Engine · Trajectory Engine (future per-project scoring)

### Future improvements

- Importance Score, Momentum, Risk per project  
- Suggested focus, next step, collaboration, experiment, pause  

---

## 5. Memory

### Why it exists

**Giuseppe's Constitution** — not a database, not a timeline.

### Question

**Who do I want to continue being?**

### What the user sees

Identity cards: Mission, North Star, Values, Principles, Projects, Patterns, Learning, Priorities — and future: Creative DNA, Writing DNA, Lessons, Blind Spots, Beliefs, Future Self, Things I Never Want to Forget.

### Data it needs

| Source | Today |
|--------|-------|
| `giuseppe_brain.json` | Yes |
| Identity Layer interpretations | Future |
| User-approved updates only | Future |

### Engines

Memory store · Identity Layer (planned)

### Future improvements

- AI suggests updates; only Giuseppe accepts  
- Every engine consults Memory before recommending  

---

## Cross-Cutting Systems

| System | Role |
|--------|------|
| **Digital Twin** | Probabilistic model — evolves weekly |
| **Trajectory Engine** | Ten-year filter on every recommendation |
| **Goal Validation** | Challenge wrong goals — truth over optimization |
| **Quality Engine** | Relevance, novelty, evidence, confidence, trajectory, personalization |
| **Golden Rule** | Future Giuseppe thanks Present Giuseppe in ten years — or silence |

---

## Navigation Map (v2.1)

```
Today → Decisions → Insights → Create → Memory
```

Previous name **Discover** is now **Insights**.

---

## What Was Not Implemented

- Full Decision Simulator runtime  
- Pattern Engine runtime  
- Living Timeline ingestion  
- Per-project scoring on Create  
- Calendar integration on Today  
- Memory edit flow with user approval  

Foundations first. Architecture and navigation aligned to five questions.

---

## Related Documents

- [`DESIGN_DNA.md`](DESIGN_DNA.md) — calm UI, progressive disclosure  
- [`01_CURRENT_STATUS.md`](01_CURRENT_STATUS.md) — shipped state  
- [`02_NEXT_STEPS.md`](02_NEXT_STEPS.md) — implementation priorities  
