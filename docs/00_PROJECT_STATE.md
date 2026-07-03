# Giuseppe OS — Project State

**Version:** 1.0 (Intelligence Foundation)  
**Last updated:** July 2026  
**Repository:** Private — source of truth for all project knowledge  

---

## What Giuseppe OS Is

Giuseppe OS is a **Personal Intelligence Operating System** — not a chatbot, not a productivity app, not a finance tracker.

It is a thinking environment that helps Giuseppe live his spiritual purpose inside practical reality. It remembers who Giuseppe chose to become and helps him decide, act, review, and learn in alignment with that choice.

The AI is one component. The **Executive Brain** is the real system.

Before any response is generated, the system asks:

> *Will this response help Giuseppe become the person he chose to become?*

---

## Vision

Close the gap between **spiritual intention** and **daily action**.

Giuseppe OS exists to:

1. **Remember** what matters when enthusiasm or anxiety is high.
2. **Slow down** decisions long enough for truth to appear.
3. **Translate** inner purpose into one next action.
4. **Compound** lessons so the same mistakes become expensive only once.
5. **Protect** sacred creative work from premature industrialization.
6. **Build** a life where work becomes optional by 2036.

---

## North Star

> **PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA.**

## 2036 Mission

> **Costruire una persona che possa scegliere se lavorare oppure no.**

---

## Architecture (v1.0)

```
User Request
     ↓
Executive Brain (orchestrator)          ← lib/brain/executiveBrain.ts
     ↓
Intent Detection + Engine Routing       ← lib/brain/intent/
     ↓
Engines (decision, awareness, potential, learning)
     ↓
Reality Layer (stubs)                   ← lib/reality/
     ↓
Context Builder (relevance slices)      ← lib/brain/context/
     ↓
Mission Gate                            ← lib/brain/missionGate.ts
     ↓
AI Provider (swappable)                 ← lib/brain/providers/
     ↓
Memory Update (quality filter)          ← lib/brain/memory/
     ↓
BrainResponse
```

**API entry point:** `POST /api/brain`  
**Nothing talks directly to the AI.** Everything goes through the Executive Brain.

Full technical spec: [`docs/INTELLIGENCE_FOUNDATION.md`](INTELLIGENCE_FOUNDATION.md)  
Authoritative architecture: [`docs/GIUSEPPE_OS_ARCHITECTURE.md`](GIUSEPPE_OS_ARCHITECTURE.md)

---

## Main Engines

| Engine | Location | Role |
|--------|----------|------|
| **Executive Brain** | `lib/brain/executiveBrain.ts` | Central orchestrator |
| **Decision Engine** | `engine/decisionEngine.ts` | Classify decisions, six capitals, board debate, next action |
| **Awareness Engine** | `engine/awarenessEngine.ts` | Proactive insights — patterns, contradictions, risks |
| **Potential Engine** | `engine/potentialEngine.ts` | Mission-aligned opportunities |
| **Learning Engine** | `lib/brain/engines/learningEngine.ts` | Pattern analysis, lessons, growth opportunities |
| **Context Builder** | `lib/brain/context/` | Relevance-based memory slices (not full dumps) |
| **AI Provider Layer** | `lib/brain/providers/` | Claude default; OpenAI/Gemini/local/rule-based |
| **Reality Layer** | `lib/reality/` | Architecture stubs for future live connectors |

Legacy stubs (not yet wired to Executive Brain): `purposeEngine.ts`, `weeklyEngine.ts`

---

## Design Direction

Visual identity aligned with [fiogiuseppe.com](https://fiogiuseppe.com):

- **Cream background:** `#f7f5e8`
- **Black text and structure**
- **Electric blue accent:** `#001fff`
- **Typography:** Helvetica (UI) + Libre Baskerville (editorial headlines)

UX principles:

- Editorial, calm, mission-first — not a SaaS dashboard
- Desktop viewport locked — no page scroll on main sections
- Finance view blurs/hides sensitive personal numbers in demo mode
- North Star appears only on Board view
- One active navigation item at a time

---

## Six Capitals

Every decision is evaluated against:

- Financial Capital
- Creative Capital
- Reputation Capital
- Social Capital
- Knowledge Capital
- Freedom Capital

---

## Core Documents

| Document | Purpose |
|----------|---------|
| [`CONSTITUTION.md`](CONSTITUTION.md) | Non-negotiable principles |
| [`GIUSEPPE_OS_ARCHITECTURE.md`](GIUSEPPE_OS_ARCHITECTURE.md) | Authoritative system design |
| [`INTELLIGENCE_FOUNDATION.md`](INTELLIGENCE_FOUNDATION.md) | v1.0 pipeline specification |
| [`ROADMAP.md`](ROADMAP.md) | Version milestones |
| [`03_DECISIONS_LOG.md`](03_DECISIONS_LOG.md) | Running architecture decisions |
| [`01_CURRENT_STATUS.md`](01_CURRENT_STATUS.md) | What exists right now |
| [`02_NEXT_STEPS.md`](02_NEXT_STEPS.md) | Implementation priorities |
