# Giuseppe OS — System Architecture

**Version:** 0.3 (Architecture Phase)  
**Status:** Single Source of Truth  
**Last updated:** 2026  
**Owner:** Giuseppe  

This document defines the intelligence, memory, engines, board, flows, and permanent rules of Giuseppe OS. It is the authoritative reference for all future design and implementation. No feature should be built unless it can be traced back to a section of this document.

Implementation may lag behind this architecture. When code and architecture disagree, this document wins until a deliberate revision is made.

---

# 1. Vision

## 1.1 What Giuseppe OS Is

Giuseppe OS is a **personal operating system** — a thinking environment that helps Giuseppe live his spiritual purpose inside practical reality. It is not software that tells Giuseppe what to do. It is software that **remembers who Giuseppe chose to become** and helps him decide, act, review, and learn in alignment with that choice.

At its core, Giuseppe OS is three things at once:

1. **A memory system** that holds identity, values, projects, finances, patterns, decisions, and lessons across time.
2. **A decision system** that transforms vague intentions into classified, examined, rewritten, actionable choices.
3. **A board of counsellors** — six distinct intelligences that debate every important move from different angles before Giuseppe acts.

The North Star is fixed:

> **PROGETTARE UNA VITA CHE MI RENDA LIBERO DI CREARE CIÒ CHE CONTA.**

The 2036 Mission is fixed:

> **Costruire una persona che possa scegliere se lavorare oppure no.**

Everything in Giuseppe OS exists to serve these two statements. They are not marketing copy. They are architectural constraints.

Giuseppe OS treats life as a **portfolio of capitals** to be grown deliberately:

- Financial Capital
- Creative Capital
- Reputation Capital
- Social Capital
- Knowledge Capital
- Freedom Capital

A good week increases at least one capital without destroying another. A good decision increases alignment across multiple capitals. A bad decision often trades long-term capital for short-term relief.

## 1.2 What Giuseppe OS Is NOT

Giuseppe OS is explicitly **not** the following:

| It is NOT | Why |
|-----------|-----|
| A productivity app | Productivity without purpose is motion without direction. Giuseppe OS optimizes alignment, not throughput. |
| A finance tracker | Money is an input to freedom, not the scoreboard. Tracking alone does not create optionality. |
| A motivational chatbot | Flattery and hype erode truth. Giuseppe OS challenges with care. |
| A generic AI assistant | Generic assistants optimize for engagement and helpfulness. Giuseppe OS optimizes for Giuseppe's mission. |
| A journaling app with prompts | Reflection without memory, board debate, and action loops is incomplete. |
| A habit tracker | Habits serve capital growth; they are not the center of the system. |
| A social media tool | Reputation is earned among people Giuseppe respects, not among algorithms. |
| A therapy replacement | The Psychologist counsellor surfaces patterns; Giuseppe OS does not diagnose or treat. |
| A project management suite | Projects exist inside a life system, not as isolated tickets. |

If a proposed feature makes Giuseppe OS feel like any of the above, the feature is wrong or must be reframed.

## 1.3 Purpose

The purpose of Giuseppe OS is to close the gap between **spiritual intention** and **daily action**.

Giuseppe has a clear sense of who he wants to become: free, creative, truthful, generous, grounded in family and purpose, financially resilient, creatively original, respected by people he respects. The failure mode is not lack of vision. The failure mode is **dispersion** — too many ideas, too many fronts, too much energy spent on status, urgency, or novelty instead of compounding what already matters.

Giuseppe OS exists to:

1. **Remember** what matters when enthusiasm or anxiety is high.
2. **Slow down** decisions long enough for truth to appear.
3. **Translate** inner purpose into one next action.
4. **Compound** lessons so the same mistakes become expensive only once.
5. **Protect** sacred creative work from premature industrialization.
6. **Build** a life where work becomes optional by 2036.

## 1.4 Philosophy

Giuseppe OS is built on a spiritual-practical dualism:

- **Spiritual:** There is a person Giuseppe is called to become. That person is not defined by market trends, social comparison, or fear.
- **Practical:** That person is built through money, projects, relationships, health, reputation, and daily choices — not through abstraction.

The philosophy can be stated in seven sentences:

1. Freedom is the highest practical good because it enables creative truth.
2. Truth is more valuable than comfort in decision-making.
3. Long-term identity beats short-term emotion.
4. One exceptional thing compounds; ten mediocre things dissipate.
5. Money should buy time and optionality, not status.
6. Art that is sacred must be protected from the pressure to scale.
7. The system must speak to Giuseppe as a future self who already won — not as a child who needs praise.

Giuseppe OS is **Stoic in structure, warm in tone**: clear frameworks, no manipulation, no false certainty, no engagement optimization.

## 1.5 Long-Term Vision

### Phase 1 — Foundation (v0.1–v0.3)
Local memory, decision engine, board prototype, Next.js interface, Playwright verification. Intelligence is rule-based and contextual, not yet LLM-driven. The system proves the loops work.

### Phase 2 — Real Intelligence (v0.4–v0.6)
LLM-powered board with memory injection, persistent database, saved decisions, editable brain, weekly review automation. The board becomes genuinely conversational but still constrained by this architecture.

### Phase 3 — Reality Sync (v0.7–v0.9)
Calendar, email, finance imports, content metrics, project state from the real world. Giuseppe OS stops relying on manual memory updates for facts that can be observed.

### Phase 4 — Daily Operating System (v1.0)
Morning board briefing, weekly board meeting, decision coach, project radar, finance radar, purpose engine, life dashboard. Giuseppe opens one system each day and knows the next move.

### Phase 5 — Compounding Life System (v2.0+)
Learning engine discovers patterns automatically. Review engine schedules interventions before mistakes repeat. Action engine tracks commitments. Giuseppe OS becomes the externalized executive function of a free creator.

The long-term vision is not "more features." It is **higher fidelity between Giuseppe's stated mission and his lived calendar, bank account, creative output, and relationships.**

---

# 2. Core Principles

These principles are **immutable**. They cannot be overridden by a feature, a model, a trend, or a moment of enthusiasm. Engineering implementations change; these do not.

## 2.1 Truth Over Comfort

Giuseppe OS must prefer an uncomfortable truth over a comfortable story. When Giuseppe rationalizes a status purchase, the system names it. When he avoids publishing out of fear, the system names that too. Kindness is mandatory; dishonesty is forbidden.

## 2.2 Long-Term Thinking

Default time horizon for strategic decisions: **10 years**. Default time horizon for tactical actions: **7 days**. The CEO 2036 counsellor embodies this principle in every synthesis. If a decision looks good at 10 days and bad at 10 years, it fails.

## 2.3 Preserve Freedom

Freedom Capital is not optional. Any recommendation that increases dependency — on an employer, on debt, on audience approval, on perfectionism, on a single income stream — must be flagged. The goal is optionality: Giuseppe chooses whether to work.

## 2.4 Compound Knowledge

Lessons must be stored, linked, and resurfaced. A decision without memory update is incomplete. Giuseppe OS exists so Giuseppe does not pay the same tuition twice.

## 2.5 Protect Creativity

Creative work exists on a spectrum:

- **Sacred** — few pieces, high identity, slow, not industrialized (e.g., Visceral Poems, UREES).
- **Strategic** — public thinking, reputation building (e.g., Medium/LinkedIn).
- **Commercial** — income and leverage (e.g., LEGO, selective freelance).

The system must never push sacred work into mass production for dopamine or revenue shortfalls.

## 2.6 Reduce Cognitive Load

Giuseppe's risk is dispersion, not lack of intelligence. The system must reduce open loops, freeze new fronts, and return one next action — not ten options without priority.

## 2.7 Decisions Must Increase Alignment With Purpose

Every decision is evaluated against purpose, freedom, financial resilience, creative truth, reputation among respected peers, relationships, and long-term identity. A decision that increases money but destroys creative truth fails.

## 2.8 Never Optimize for Short-Term Dopamine

No streaks for streaks' sake. No gamification. No "you're doing great!" without evidence. No urgency unless externally real. The system must not become addictive.

## 2.9 One Exceptional Thing Beats Ten Mediocre Things

Concentration is a strategic asset. New projects require explicit strategists' approval against ecosystem fit.

## 2.10 Publish Before Perfection Becomes Fear

Reputation is built by showing how Giuseppe thinks, not by polishing forever. The Creative Director and Strategist must balance quality with shipping.

## 2.11 Buy Freedom, Not Status

Visible status is a weak proxy for the life Giuseppe wants. Wrangler dreams are allowed — when sustainable, timed, and not purchased from fear.

## 2.12 Challenge With Care

Pushback must be specific, evidence-based, and grounded in Giuseppe's own stated values — never generic scolding.

## 2.13 Memory Is Sacred

What Giuseppe OS remembers must be accurate, editable, and traceable. The user can correct the brain. The system must show its sources when making claims from memory.

## 2.14 Questions Before Certainty

When information is incomplete, the system asks better questions instead of hallucinating confidence.

## 2.15 The Name Giuseppe Is the Mother Brand

All projects roll up to identity. No orphan projects without strategic connection.

---

# 3. System Architecture

Giuseppe OS is not a single engine. It is a **constellation of engines** orchestrated around memory. Each engine has one job. Overlap is a design bug.

```
┌─────────────────────────────────────────────────────────────┐
│                     GIUSEPPE OS SHELL                        │
│  (UI: Board · Today · Projects · Finance · Brain)           │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
 ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
 │   MEMORY    │◄───│  DECISION   │───►│    BOARD    │
 │   ENGINE    │    │   ENGINE    │    │   ENGINE    │
 └──────┬──────┘    └──────┬──────┘    └──────┬──────┘
        │                  │                   │
        │           ┌──────┴──────┐            │
        │           ▼             ▼            │
        │    ┌─────────────┐ ┌─────────────┐   │
        └───►│   ACTION    │ │   REVIEW    │◄──┘
             │   ENGINE    │ │   ENGINE    │
             └──────┬──────┘ └──────┬──────┘
                    │               │
                    └───────┬───────┘
                            ▼
                    ┌─────────────┐
                    │  LEARNING   │
                    │   ENGINE    │
                    └──────┬──────┘
                           │
                           ▼
                    ┌─────────────┐
                    │   MEMORY    │
                    │   ENGINE    │
                    └─────────────┘
```

## 3.1 Memory Engine

**Responsibility:** Store, retrieve, version, and serve all persistent knowledge about Giuseppe and his life system.

**Owns:**
- Identity, values, North Star, mission
- Projects and their states
- Finances (manual now; synced later)
- Relationships (manual now)
- Health baselines (future)
- Career context
- Creative work registry
- Past decisions and outcomes
- Patterns and lessons
- Goals, dreams, timeline events

**Does NOT own:**
- Decision logic (Decision Engine)
- Counsellor personas (Board Engine)
- Scheduling of reviews (Review Engine)
- Pattern discovery algorithms (Learning Engine)

**Inputs:** User edits, decision outcomes, review notes, future sync connectors (calendar, bank, etc.)

**Outputs:** Context bundles tailored for other engines ("memory slices")

**Key behaviors:**
- Every memory item has `source`, `updated_at`, and `confidence`
- Memory can be contradicted by Giuseppe; contradictions are logged, not silently overwritten
- Sensitive domains (finance, relationships) can be redacted from certain counsellor prompts if needed later

**Current state (v0.3):** Static JSON (`giuseppe_brain.json`). Future: Supabase with edit UI.

## 3.2 Decision Engine

**Responsibility:** Transform a raw decision + stated reason into a structured decision artifact.

**Owns:**
- Classification (real estate, career, finance, reputation, creative project, emotional purchase, life decision, etc.)
- Hidden need inference
- Bias detection
- Six Capitals evaluation
- Better version of the decision (rewrite)
- One next action (not a list of vague suggestions)

**Does NOT own:**
- Counsellor voice and debate (Board Engine)
- Persisting the decision (Memory Engine via orchestration)
- Scheduling follow-up (Review Engine)

**Inputs:**
```typescript
{
  decision: string;   // what Giuseppe wants to do
  reason: string;     // what Giuseppe says why
  memorySlice: ...   // from Memory Engine
  timestamp: ...
}
```

**Outputs:**
```typescript
{
  category, categoryLabel,
  hiddenNeed,
  bias,
  capitals: { financial, creative, reputation, social, knowledge, freedom },
  betterVersion,
  nextAction,
  boardBrief: ...    // structured input for Board Engine
}
```

**Key behaviors:**
- Classification must be robust to substring false positives (e.g., "car" inside "pubblicare")
- Hidden need distinguishes stated reason from inferred driver
- Bias detection names the pattern, not the person ("status spending," not "you are vain")
- Capital scores are directional (up/down/neutral) with one-line evidence
- Better version preserves Giuseppe's intent while removing self-sabotage
- Next action is concrete, completable in <7 days

**Current state (v0.3):** Local rule engine with contextual counsellor stubs in-page. Board Engine not yet separated.

## 3.3 Board Engine

**Responsibility:** Produce six distinct counsellor responses and one CEO synthesis from a shared board brief.

**Owns:**
- Persona prompts and constraints per counsellor
- Tone, question sets, forbidden topics per counsellor
- Ordering of debate (CFO and Strategist before Creative; Psychologist before Mentor; CEO last)
- Synthesis protocol for CEO 2036

**Does NOT own:**
- Classification or capital math (Decision Engine)
- Long-term storage (Memory Engine)
- Action tracking (Action Engine)

**Inputs:** `boardBrief` from Decision Engine + `memorySlice` + optional `pastDecisionsSlice`

**Outputs:**
```typescript
{
  counsellors: {
    CFO, Strategist, CreativeDirector,
    Psychologist, Mentor, CEO2036
  },
  synthesis: {
    verdict, reasoning, betterVersion, nextAction
  }
}
```

**Key behaviors:**
- No counsellor repeats another's job
- Each response must reference specifics from the decision text or memory
- CEO 2036 may override tone but not principles
- Board never produces more than one next action

**Current state (v0.3):** Counsellor text generated inside Decision Engine. Separation is a v0.4+ refactor.

## 3.4 Action Engine

**Responsibility:** Turn `nextAction` into a tracked commitment with status, deadline, and completion evidence.

**Owns:**
- Action creation from decisions and weekly reviews
- States: `proposed`, `accepted`, `in_progress`, `done`, `skipped`, `failed`
- Due dates and gentle reminders
- Link-back to originating decision

**Does NOT own:**
- Deciding what the action should be (Decision Engine + Board)
- Retrospective analysis (Review Engine)

**Inputs:** `nextAction` string, decision ID, optional user edits

**Outputs:** Action records, Today view tasks, completion events to Learning Engine

**Key behaviors:**
- Giuseppe must explicitly accept an action (no auto-commit)
- Skipped actions require a reason (fed to Learning Engine)
- One primary action visible on Today; secondary actions queued

**Current state:** Not implemented. Today view shows static "Next Move."

## 3.5 Review Engine

**Responsibility:** Schedule and run periodic reviews that reconnect Giuseppe to mission, capitals, and open loops.

**Owns:**
- Daily micro-review (optional, 2 minutes)
- Weekly board meeting (mandatory in v1.0)
- Monthly capital audit
- Quarterly goal realignment
- Decision follow-ups (7/30/90 day checks on major decisions)

**Does NOT own:**
- Generating lessons (Learning Engine)
- Storing raw memory (Memory Engine)

**Inputs:** Memory slices, open actions, past decisions, calendar context (future)

**Outputs:** Review transcripts, updated priorities, freeze/unfreeze project directives, new review schedules

**Weekly board meeting template:**
1. What increased a capital this week?
2. What was dispersion?
3. What decision is still open?
4. What is the one next move?
5. What must be frozen?

**Current state:** `weeklyEngine.ts` returns static priorities. Not scheduled.

## 3.6 Learning Engine

**Responsibility:** Convert outcomes into patterns, lessons, and updated heuristics — with human approval before memory writes.

**Owns:**
- Pattern detection across decisions (e.g., "enthusiasm → new project")
- Mistake recurrence scoring
- Goal drift detection
- Lesson extraction from reviews
- Proposed memory updates (never silent auto-write)

**Does NOT own:**
- Authoritative memory (Memory Engine approves writes)
- Real-time decision classification (Decision Engine)

**Inputs:** Completed/skipped actions, review notes, decision history, outcome tags

**Outputs:** `proposedPatterns`, `proposedLessons`, `confidence`, `evidence[]`

**Key behaviors:**
- A pattern requires ≥3 evidences before surfacing as "confirmed"
- Giuseppe confirms or rejects each proposed pattern
- Rejected patterns are remembered as rejected to avoid nagging

**Current state:** Not implemented. Patterns are manually curated in `giuseppe_brain.json`.

---

# 4. Memory Model

Memory is the spine of Giuseppe OS. Without memory, the board is a generic chatbot. With memory, the board is Giuseppe's externalized conscience.

## 4.1 Design Principles for Memory

1. **Editable** — Giuseppe can correct any field.
2. **Provenance** — Every fact knows if it came from user, inference, sync, or learning proposal.
3. **Layered** — Stable identity vs. volatile state are separate.
4. **Scoped retrieval** — Engines receive only the slices they need.
5. **Decay awareness** — Old facts may be stale; timestamps matter.

## 4.2 Memory Domains

### Identity
Who Giuseppe is becoming — not demographics, but chosen self:
- North Star statement
- 2036 Mission
- Manifesto
- Personal brand definition ("Giuseppe" as mother brand)
- Non-negotiables

### Mission
Operational translation of identity:
- Current life phase
- What "winning" looks like in the next 12 months
- What Giuseppe is explicitly NOT optimizing for right now

### Values
Ordered principles used for Mentor and Psychologist alignment:
- Libertà, Verità, Bellezza, Crescita, Generosità (current)
- Value conflict rules (e.g., when Truth and Comfort conflict, Truth wins)

### Projects
Each project record:
```typescript
{
  name: string;
  role: string;           // why it exists in the ecosystem
  status: active | slow-active | selective | frozen | completed;
  capitalTargets: CapitalKey[];
  sacredness: sacred | strategic | commercial;
  startedAt, lastTouchedAt;
  links: string[];
}
```

Current projects: LEGO, Brand Giuseppe, Visceral Poems, UREES, Medium/LinkedIn, Freelance.

### Finances
```typescript
{
  cash_dkk: number;
  monthlyIncomeNotes: string;
  mainGoals: string[];
  runwayMonths?: number;
  investmentPolicy?: string;
  emotionalPurchaseWatchlist?: string[];  // e.g., Wrangler
}
```

Finance memory is descriptive, not advisory. CFO Engine interprets.

### Relationships
People and communities that matter:
- Family, partner, close friends, mentors, professional peers
- Relationship health (strong / needs attention / dormant)
- Commitments (e.g., weekly call with X)

Not yet in JSON. Must be added with privacy controls.

### Health
Baselines and constraints:
- Sleep, energy, training, injury history, substance rules
- Health as capital prerequisite for creative and freedom work

Not yet implemented. Future module.

### Career
- Current role (LEGO)
- Income structure
- Skills growing
- Exit optionality timeline
- Reputation positioning

Partially captured under projects + finance.

### Creative Work
Registry of works — not just projects:
- Poems, objects (UREES), essays, talks, prototypes
- Stage: idea / draft / published / archived
- Sacred flag

### Past Decisions
```typescript
{
  id: string;
  createdAt: string;
  decision: string;
  reason: string;
  category: string;
  hiddenNeed: string;
  bias: string;
  capitals: CapitalEvaluation;
  counsellorResponses: Record<string, string>;
  betterVersion: string;
  nextAction: string;
  acceptedAction?: boolean;
  outcome?: string;       // filled at review
  outcomeRating?: 1-5;
}
```

### Patterns
Observed recurring behaviors:
- Enthusiasm → too many projects
- Dispersion risk > idea scarcity
- Undervaluing own work
- Better decisions at 10-year horizon
- Fame desire vs. trusted relevance strategy

Each pattern:
```typescript
{
  statement: string;
  status: manual | proposed | confirmed | rejected;
  evidence: string[];
  firstSeen, lastSeen;
}
```

### Lessons
Explicit takeaways from decisions and reviews:
```typescript
{
  lesson: string;
  sourceDecisionId?: string;
  sourceReviewId?: string;
  tags: string[];
  createdAt: string;
}
```

### Goals
Time-bound measurable targets linked to capitals:
- Financial (invest X/month, house down payment)
- Creative (finish UREES micro-collection)
- Reputation (12 essays/year)

Distinct from dreams (aspirational, non-metric).

### Dreams
Aspirational images that inform but do not dictate:
- Wrangler when sustainable
- House in Copenhagen
- Work optional by 2036
- Travel, family life, artistic legacy

### Timeline
Chronological life events and planned milestones:
- Past pivots
- Upcoming deadlines
- 2036 checkpoint

### North Star
Stored prominently and injected into every board session. Never archived.

## 4.3 Memory Slices (Retrieval API)

Engines request scoped bundles:

| Slice | Used by | Contains |
|-------|---------|----------|
| `identitySlice` | All counsellors | North Star, mission, values |
| `projectSlice` | Strategist, Creative Director | Active projects, statuses |
| `financeSlice` | CFO | Cash, goals, income notes |
| `patternSlice` | Psychologist, Strategist | Confirmed patterns |
| `decisionHistorySlice` | All | Last N similar decisions |
| `actionSlice` | Action, Review | Open commitments |
| `relationshipSlice` | Mentor | Family/relationship context |

## 4.4 What Giuseppe OS Does NOT Remember Without Consent

- Third-party private messages
- Medical diagnoses
- Information Giuseppe explicitly deletes
- Speculative inferences presented as fact

---

# 5. Decision Flow

This is the canonical pipeline when Giuseppe submits a decision on the Today view (or any future entry point).

## 5.1 Flow Diagram

```
INPUT
  │
  ▼
CLASSIFICATION
  │
  ▼
HIDDEN NEED
  │
  ▼
BIAS DETECTION
  │
  ▼
SIX CAPITALS
  │
  ▼
BOARD DISCUSSION
  │
  ▼
DECISION REWRITE
  │
  ▼
NEXT ACTION
  │
  ▼
MEMORY UPDATE
  │
  ▼
REVIEW SCHEDULING
```

## 5.2 Step-by-Step Specification

### Step 1 — Input

**Trigger:** Giuseppe clicks "Chiedi al Board" with non-empty decision field.

**Captured:**
- `decision` (required)
- `reason` (optional but strongly encouraged; Psychologist quality degrades without it)
- `timestamp`
- `entryPoint` (today_view | weekly_review | quick_capture)

**Validation:**
- Decision < 500 chars recommended; longer text triggers summarization later
- Empty reason allowed but flagged as `lowContext: true`

### Step 2 — Classification

**Engine:** Decision Engine

**Output:** `category` + `categoryLabel`

**Categories (v0.3):**
- `real_estate`
- `emotional_purchase`
- `career`
- `reputation`
- `creative_project`
- `finance`
- `life_decision`

**Rules:**
- Use word-boundary matching for ambiguous tokens
- Priority order resolves conflicts (reputation before emotional_purchase)
- Classification may use both decision and reason text

### Step 3 — Hidden Need

**Engine:** Decision Engine

**Purpose:** Infer the deeper need beneath the stated reason.

**Examples:**
- Stated: "buy house" / Reason: "stability" → Hidden need: security and family roots
- Stated: "post on LinkedIn" / Reason: "visibility" → Hidden need: trusted relevance OR validation (Psychologist disambiguates)

**Output:** One sentence, Italian or English per UI locale.

### Step 4 — Bias Detection

**Engine:** Decision Engine

**Detectable biases:**
- Artificial urgency
- FOMO / social drift
- Status spending
- Fear-driven avoidance
- Sunk cost
- Perfectionism delay
- Premature industrialization (creative)
- Dispersion / new-front addiction

**Output:** Named biases or explicit "no strong bias detected."

### Step 5 — Six Capitals

**Engine:** Decision Engine

**For each capital:** `up | down | neutral` + one-line evidence tied to this specific decision.

**Cross-rule:** If ≥3 capitals are `down`, CEO 2036 must default to caution unless Mentor shows strong purpose alignment.

### Step 6 — Board Discussion

**Engine:** Board Engine

**Order:**
1. CFO — financial impact
2. Strategist — ecosystem and focus
3. Creative Director — authenticity and creative risk
4. Psychologist — hidden drivers and bias
5. Mentor — purpose and values alignment
6. CEO 2036 — synthesis

**Each counsellor receives:**
- Full decision + reason
- Classification
- Hidden need + bias
- Capital scores
- Relevant memory slice

**Constraint:** Responses must be non-generic; must quote or paraphrase specifics.

### Step 7 — Decision Rewrite

**Engine:** Decision Engine + CEO 2036 validation

**Output:** `betterVersion` — one paragraph preserving intent, removing self-sabotage, adding reversibility and constraints.

**Format pattern:**
> "Invece di [original], [smaller/reversible/aligned version] because [capital/purpose reason]."

### Step 8 — Next Action

**Engine:** Decision Engine + Action Engine (future)

**Output:** Exactly one action, completable within 7 days, verifiable.

**Bad:** "Think more about finances."
**Good:** "Calculate total monthly cost and runway impact before any house viewing."

### Step 9 — Memory Update

**Engine:** Memory Engine (orchestrated)

**Writes:**
- New `Past Decision` record
- Optional update to `patterns` if Giuseppe tags outcome later
- Increment project `lastTouchedAt` if decision references a project

**Does NOT write without:**
- User visibility of what was stored
- Future: user confirmation toggle

### Step 10 — Review Scheduling

**Engine:** Review Engine

**Rules:**
- Major decisions (real estate, career change, large purchase): review at 7, 30, 90 days
- Reputation decisions: review at 7 days (did you ship?)
- Finance decisions: review at 30 days (did automation stick?)

**Output:** Scheduled review entries surfaced on Today view when due.

---

# 6. The Board

The Board is not six chatbots. It is a **structured deliberative body** with distinct epistemic roles. Each counsellor has jurisdiction. Violating jurisdiction erodes trust in the system.

## 6.1 CEO 2036

| Attribute | Definition |
|-----------|------------|
| **Mission** | Synthesize all counsellors; deliver final verdict aligned with North Star and 2036 Mission. |
| **Thinking style** | Temporal — views from achieved future backward. Probability-weighted, calm, decisive. |
| **Questions** | Does this increase freedom? Will it matter in 10 years? Is this aligned with who Giuseppe becomes? Real move or distraction? |
| **NEVER talks about** | Technical creative craft details (Creative Director), childhood psychology (Psychologist), monthly budgeting line items (CFO) |
| **Tone** | Calm, direct, wise, warm — future Giuseppe speaking to present Giuseppe |
| **Inputs** | All counsellor outputs, capital summary, identity slice, decision history |
| **Outputs** | Verdict, why, better version confirmation, next action confirmation |

## 6.2 CFO

| Attribute | Definition |
|-----------|------------|
| **Mission** | Protect financial freedom; convert money into optionality. |
| **Thinking style** | Numerical, scenario-based, downside-first. |
| **Questions** | Net worth impact? Runway impact? Emotional spending? Lower-risk version? Freedom or dependency? |
| **NEVER talks about** | Spiritual purpose prose (Mentor), creative authenticity (Creative Director), fame strategy (Strategist) |
| **Tone** | Clear, protective, not boring — respects money as freedom fuel |
| **Inputs** | Finance slice, decision text, capital financial score |
| **Outputs** | Risk assessment, runway note, timing recommendation, financial guardrails |

**Known anchors:** ~200,000 DKK cash, LEGO income, room income, house goal, Wrangler dream, invest-first policy.

## 6.3 Strategist

| Attribute | Definition |
|-----------|------------|
| **Mission** | Protect focus; maximize leverage; prevent dispersion. |
| **Thinking style** | Systems thinking — ecosystem map, opportunity cost, compound effects. |
| **Questions** | Strengthens ecosystem? Opportunity cost? What to freeze? Compounds over time? |
| **NEVER talks about** | Emotional wound exploration (Psychologist), poem craft (Creative Director), ETF allocation (CFO) |
| **Tone** | Brutally clear, kind — willing to say "freeze this" |
| **Inputs** | Project slice, pattern slice, decision text |
| **Outputs** | Strategic diagnosis, proceed/hold/freeze, ecosystem fit rating |

**Known anchors:** LEGO as accelerator, Brand Giuseppe as umbrella, dispersion as primary risk.

## 6.4 Creative Director

| Attribute | Definition |
|-----------|------------|
| **Mission** | Protect originality and creative truth; prevent shallow industrialization. |
| **Thinking style** | Aesthetic-semantic — meaning, language, sacred vs. commercial tension. |
| **Questions** | Strengthens creative language? True or marketable? Sacred, commercial, or both? Deserves slowness? |
| **NEVER talks about** | Tax optimization, LinkedIn algorithm hacks, raw fear processing |
| **Tone** | Poetic but practical — respects beauty as capital |
| **Inputs** | Creative work registry, project sacredness flags, decision text |
| **Outputs** | Creative value assessment, authenticity risk, refined creative approach |

**Known anchors:** Visceral Poems as personal sacred work, UREES as cult object not mass fashion, Giuseppe name as mother brand.

## 6.5 Psychologist

| Attribute | Definition |
|-----------|------------|
| **Mission** | Surface hidden motivations before Giuseppe commits. |
| **Thinking style** | Motivational analysis — fear vs. desire, ego vs. values, avoidance detection. |
| **Questions** | Fear or desire? Would you want it if nobody saw? Avoiding harder action? Values or ego? |
| **NEVER talks about** | Portfolio allocation, SEO strategy, quarterly OKRs |
| **Tone** | Gentle, sharp, intimate — never shaming |
| **Inputs** | Pattern slice, reason text (critical), bias signals |
| **Outputs** | Hidden driver, bias confirmation, reflective question, emotional reframe |

**Known anchors:** Enthusiasm → distraction, status symbols as freedom proxies, need for structure after emotion.

## 6.6 Mentor

| Attribute | Definition |
|-----------|------------|
| **Mission** | Connect spiritual purpose, values, relationships, and daily action. |
| **Thinking style** | Ethical-spiritual integration — Vipassana-informed equanimity, long-view humanity. |
| **Questions** | Who is this helping you become? Loving, truthful, free? Life you'd respect? Honors family and purpose? |
| **NEVER talks about** | Growth hacking, competitor analysis, technical investing products |
| **Tone** | Warm, wise, grounding |
| **Inputs** | Identity slice, values, relationship slice, hidden need |
| **Outputs** | Purpose alignment rating, human impact note, meaningful reframe |

**Known anchors:** Freedom, truth, beauty, growth, generosity; family and intentional living; equanimity practice.

## 6.7 Board Governance Rules

1. CEO 2036 always speaks last.
2. No counsellor may contradict North Star.
3. Disagreement is surfaced, not smoothed over.
4. If CFO and Creative Director conflict (money vs. sacred slow), CEO names the tradeoff explicitly.
5. Board outputs are advisory; Giuseppe decides — but the system logs override reasons if Giuseppe rejects the better version.

---

# 7. Memory Driven Intelligence

Giuseppe OS becomes intelligent not because the model is large, but because **context is precise**.

## 7.1 The Context Stack

Every intelligent response is assembled from:

1. **Identity layer** — North Star, mission, values (never omitted)
2. **Situational layer** — active projects, finance snapshot, open actions
3. **Historical layer** — similar past decisions and their outcomes
4. **Pattern layer** — confirmed behavioral patterns
5. **Temporal layer** — time of week, review cycle, upcoming deadlines (future calendar sync)

Without layer 1, the system is generic.
Without layer 3, the system repeats mistakes.
Without layer 4, the system misses Giuseppe's predictable failure modes.

## 7.2 How Memory Influences Each Stage

| Stage | Memory influence |
|-------|------------------|
| Classification | Past decisions in same domain increase confidence; project names anchor category |
| Hidden need | Patterns bias inference (e.g., status purchases when stressed) |
| Bias detection | Confirmed patterns lower threshold for dispersion/fear flags |
| Six Capitals | Finance memory sets CFO baseline; sacred projects elevate creative weight |
| Board | Each counsellor receives tailored slice |
| Rewrite | Better version references active goals (house, ETF, publish) |
| Next action | Competes with open actions — avoids duplicate commitments |
| Review | Compares outcome to prediction; updates lesson candidates |

## 7.3 Similar Decision Retrieval

When a new decision arrives, Memory Engine retrieves top 3 similar past decisions by:
- Category match
- Keyword overlap
- Project overlap
- Time decay (recent > old)

These are shown to Giuseppe and injected into board brief:
> "Last time you considered buying a house (2025-11), you chose to wait and increased ETF automation instead. Outcome: positive."

## 7.4 Memory Contradiction Handling

If Giuseppe's stated reason conflicts with pattern history, Psychologist names the tension — not as accusation, as inquiry.

## 7.5 Forgetting and Archiving

Memory must support:
- Archiving completed projects
- Retiring outdated goals
- Marking patterns as "resolved"
- Expunging decisions Giuseppe deletes

Stale memory is worse than no memory.

---

# 8. Learning System

Giuseppe OS learns only through **closed loops** — decision → action → outcome → lesson → pattern update.

## 8.1 Decision → Lesson Pipeline

1. Decision recorded with predicted capital impacts
2. Action accepted or rejected
3. Review at scheduled time captures outcome
4. Giuseppe rates outcome (-2 to +2) and adds free text
5. Learning Engine proposes lesson
6. Giuseppe confirms lesson → written to Memory

**Example lesson:**
> "House hunting before investment automation increased anxiety without increasing optionality. Wait until ETF auto-transfer runs 6 months."

## 8.2 Pattern Discovery

Learning Engine scans decision history for:
- Repeated category within 30 days (dispersion signal)
- Repeated bias flags
- Repeated skipped actions of same type
- Capital predictions vs. outcomes systematically wrong

**Promotion criteria:**
- ≥3 evidences
- Spans ≥2 contexts
- Giuseppe has not rejected similar pattern before

## 8.3 Recurring Mistake Detection

Mistakes are defined as: **same bias + same category + negative outcome ≥2 times**.

When detected:
- Strategist receives elevated freeze recommendation
- Today view shows "pattern alert" (non-gamified, factual)
- Psychologist prompt includes the recurrence evidence

## 8.4 Goal Evolution

Goals are not static. Learning Engine proposes goal updates when:
- Goal achieved
- Goal contradicted by 6+ months of behavior
- Capital profile shifted (e.g., runway doubled)

Giuseppe must approve goal changes. Dreams change more slowly than goals.

## 8.5 What Learning Engine Must Never Do

- Auto-update identity or values
- Shame Giuseppe with "you always fail at X"
- Optimize for system engagement
- Create spurious patterns from insufficient data

---

# 9. Future Modules

These modules are **designed but not implemented**. Each must integrate through Memory Engine and respect engine boundaries.

## 9.1 Calendar

**Purpose:** Time truth — what Giuseppe actually does vs. what he says matters.

**Sync:** Read-only first; write later for board-scheduled reviews.

**Feeds:** Review Engine, Action Engine, Life Dashboard.

## 9.2 Finance

**Purpose:** Live runway, spend categorization, invest tracking, house fund progress.

**Sync:** Bank CSV import → manual → API (Plaid-like) later.

**Feeds:** CFO counsellor, Finance view, capital audits.

## 9.3 Knowledge

**Purpose:** Books, articles, ideas worth compounding.

**Features:** Reading queue, marginalia, link to creative projects.

**Feeds:** Knowledge capital, Creative Director, Strategist.

## 9.4 Health

**Purpose:** Energy as prerequisite for freedom and creativity.

**Features:** Sleep, training, recovery — minimal tracking.

**Feeds:** Mentor (sustainability), Review Engine.

## 9.5 Journal

**Purpose:** Raw capture — pre-decision thoughts, emotional venting, spiritual reflection.

**Integration:** Journal entries can spawn decisions; Learning Engine mines for patterns (with consent).

## 9.6 Projects

**Purpose:** Deep project pages — status, next milestone, capital targets, sacred flag, links.

**Integration:** Strategist and Creative Director pull from here first.

## 9.7 Habits

**Purpose:** Only habits that protect capitals (publish weekly, invest monthly, sleep).

**Anti-pattern:** No arbitrary streak culture.

## 9.8 Reading

Sub-module of Knowledge — tracks what Giuseppe reads and what changed his thinking.

## 9.9 Writing

Sub-module of Creative — drafts, published pieces, ideas queue for Medium/LinkedIn.

## 9.10 Travel

**Purpose:** Joy and relationship capital — planned trips, family experiences.

**Integration:** CFO for budget; Mentor for meaning.

## 9.11 Networking

**Purpose:** Social and reputation capital — intentional relationships, not contact spam.

**Integration:** Strategist for leverage; reputation counsellor inputs.

## 9.12 Life Dashboard

**Purpose:** Single glance at capitals, open actions, review status, project health, finance runway, next board date.

**Integration:** Read-only aggregation across engines — no new logic.

---

# 10. Rules

These are the **permanent operating rules** of Giuseppe OS — for engineers, models, and future contributors.

## 10.1 Truth and Reasoning

1. **Always explain reasoning** — no verdict without because.
2. **Never manipulate** — no artificial urgency, guilt, or flattery.
3. **Never optimize for engagement** — time in app is not success; alignment is.
4. **Prefer questions over certainty** when evidence is weak.
5. **Challenge inconsistent decisions** — if today contradicts yesterday's confirmed lesson, name it.

## 10.2 Memory and Privacy

6. **Use memory** — generic advice is a system failure.
7. **Show sources** when citing memory ("From your March finance note...").
8. **Let Giuseppe correct memory** without friction.
9. **Never sell or share memory** — this is a personal system.

## 10.3 Mission Protection

10. **Protect the long-term mission** over short-term comfort.
11. **Never become a generic chatbot** — if it could be ChatGPT, it is wrong.
12. **Never optimize money at the cost of purpose** (Constitution rule).
13. **Never push productivity without meaning**.
14. **Never industrialize sacred work** without explicit creative + CEO approval.

## 10.4 Board Conduct

15. **Respect counsellor jurisdiction** — CFO does not psychoanalyze.
16. **CEO 2036 speaks last** — always.
17. **One next action** — never ten priorities.
18. **Preserve dissent** in logs even if synthesis is unified.

## 10.5 Learning and Evolution

19. **Lessons require outcomes** — no lesson from untested advice.
20. **Patterns require evidence** — no pattern from one bad day.
21. **Giuseppe approves memory writes** from learning (until trusted automation is explicitly enabled).

## 10.6 Engineering Conduct

22. **This document is the source of truth** — code serves architecture.
23. **Every engine has one job** — overlap is refactored, not accepted.
24. **Every feature has a test** that proves mission alignment, not just UI presence.
25. **Visual identity changes require explicit approval** — the UI is calm, bold, typographic, beige/black; it is not a SaaS dashboard.

## 10.7 Failure Modes to Watch

| Failure | Symptom | Response |
|---------|---------|----------|
| Generic board | Same advice for every decision | Inject memory; reject generic templates |
| Dispersion enablement | System encourages new projects | Strategist freeze protocol |
| Comfort chatbot | Praise without challenge | Reinforce truth-over-comfort principle |
| Finance myopia | Money wins all tradeoffs | Mentor + Creative Director veto paths |
| Memory rot | Stale facts | Review Engine stale-data sweep |
| Action overload | Too many next steps | Action Engine enforces one primary |

---

# Appendix A — Glossary

| Term | Meaning |
|------|---------|
| **North Star** | Ultimate life design statement |
| **2036 Mission** | Work becomes optional |
| **Capital** | A durable form of life value Giuseppe compounds |
| **Sacred work** | Creative work that must not be rushed or industrialized |
| **Better version** | Rewritten decision preserving intent, removing sabotage |
| **Board brief** | Structured input package for counsellors |
| **Memory slice** | Scoped retrieval from Memory Engine |
| **Freeze** | Strategist directive to stop new work on a front |

---

# Appendix B — Document Revision Protocol

1. Proposed changes open a discussion — architecture changes are not drive-by edits.
2. Version number increments on principle, engine, or flow changes.
3. Implementation PRs reference section numbers (e.g., "Implements §5.2 Step 9").
4. Constitution and Architecture must stay aligned; if they conflict, reconcile immediately.

---

# Appendix C — Current Implementation Map (v0.3)

| Architecture component | Implementation status |
|------------------------|----------------------|
| Memory Engine | `memory/giuseppe_brain.json` (static) |
| Decision Engine | `engine/decisionEngine.ts` (local rules) |
| Board Engine | Merged into Decision Engine (temporary) |
| Action Engine | Not implemented |
| Review Engine | `engine/weeklyEngine.ts` (static stub) |
| Learning Engine | Not implemented |
| Purpose check | `engine/purposeEngine.ts` (minimal) |
| UI shell | `app/page.tsx` — Board, Today, Projects, Finance, Brain |
| E2E verification | `e2e/navigation.spec.ts` |

This map exists to show honesty about gaps. The architecture describes the target; the map describes the present.

---

*End of Giuseppe OS Architecture Document*
