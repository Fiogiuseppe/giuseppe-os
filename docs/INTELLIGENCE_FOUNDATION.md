# Giuseppe OS v1.0 — Intelligence Foundation

**Version:** 1.0  
**Status:** Foundation release  
**Last updated:** July 2026  

Giuseppe OS is **not a chatbot**. It is a **Personal Intelligence Operating System**. The AI is one component. The **Executive Brain** is the real system.

Before any response is generated, the system asks:

> *Will this response help Giuseppe become the person he chose to become?*

If the answer is no, the response is reconsidered.

---

## Design principles

| Principle | Meaning |
|-----------|---------|
| Architecture first | Modules are designed for replacement, not convenience |
| Modular | Every engine, provider, and connector is swappable |
| AI-provider independent | No application code depends on Claude, OpenAI, or Gemini directly |
| Memory-driven | Identity, goals, and lessons shape every response |
| Future-proof | Built to evolve for 10+ years |
| Quality over quantity | Memory updates are filtered — not everything is stored |

---

## Pipeline overview

```
User Request
     ↓
Executive Brain (orchestrator)
     ↓
Intent Detection + Engine Routing
     ↓
Engines (decision, awareness, potential, learning)
     ↓
Reality Layer (stubs — future live connectors)
     ↓
Context Builder (relevance slices only)
     ↓
Mission Gate
     ↓
AI Provider (Claude Sonnet default; rule-based for tests)
     ↓
Memory Update (quality filter)
     ↓
BrainResponse
```

**Nothing talks directly to the AI.** Everything goes through the Executive Brain.

---

## Phase 1 — Executive Brain

**Location:** `lib/brain/executiveBrain.ts`  
**API:** `POST /api/brain`

Responsibilities:

1. Validate and normalize the request
2. Detect intent (`auto` resolves to query/decide/reflect/awareness/potential/learn)
3. Route to required engines
4. Fetch reality context (when connectors exist)
5. Build minimal relevant context
6. Call the AI provider abstraction
7. Evaluate mission alignment
8. Apply memory update (remember or discard)
9. Return structured `BrainResponse`

---

## Phase 2 — Context Builder

**Locations:** `lib/brain/context/buildContext.ts`, `lib/brain/context/slices.ts`

Never sends the entire memory to the AI. Retrieves **slices** by topic:

- `identity` — North Star, mission, values, rules
- `finance` — goals and tier (balances redacted)
- `freedom` — 2036 mission, priorities, patterns
- `projects` — filtered by creative/reputation relevance
- `creative`, `travel`, `reputation`, `patterns`, `sessions`

Example: *"Should I buy a Wrangler?"* loads identity, finance, freedom, travel — **not** unrelated LEGO campaign details.

---

## Phase 3 — AI Provider Layer

**Location:** `lib/brain/providers/`

| Provider | Env | Purpose |
|----------|-----|---------|
| `claude` | `ANTHROPIC_API_KEY`, `BRAIN_AI_MODEL` | Default production |
| `openai` | `OPENAI_API_KEY` | Future |
| `gemini` | `GOOGLE_API_KEY` | Future |
| `local` | `BRAIN_LOCAL_URL` | Future local LLMs |
| `rule-based` | `BRAIN_AI_PROVIDER=rule-based` | Tests / offline |

Provider and model names are **never** exposed in API responses.

---

## Phase 4 — Memory Update

**Location:** `lib/brain/memory/update.ts`

After every interaction:

1. `shouldRemember()` evaluates quality
2. **YES** → durable record + session (types: identity, goals, project, lesson, decision, pattern, relationship, finance, preference, timeline)
3. **NO** → session log only (`memoryDiscarded: true`)

Stores:

- `memory/giuseppe_brain.json` — identity brain (read)
- `memory/working_memory.json` — sessions, notes, records
- `memory/long_term.json` — decisions, lessons, patterns detected

---

## Phase 5 — Learning Engine

**Location:** `lib/brain/engines/learningEngine.ts`

Periodically (or on `learn` intent) analyzes memory for:

- Recurring patterns
- Repeated mistakes
- Changing priorities
- Personal evolution
- Inconsistencies
- Abandoned projects

Outputs: lessons, insights, growth opportunities.

---

## Phase 6 — Reality Layer (architecture only)

**Location:** `lib/reality/`

Distinguishes:

| Category | Description |
|----------|-------------|
| Personal Memory | Giuseppe brain + working/long-term memory |
| Live Reality | Calendar, Gmail, news, weather (planned) |
| Unknown Information | Gaps explicitly marked |
| Assumptions | Inferred, low reliability |
| Reliable Sources | High-reliability facts with timestamps |

Future connectors: News, Web Search, Calendar, Gmail, Finance, Weather, Projects, Notes.

---

## Phase 7 — Awareness Engine

**Location:** `engine/awarenessEngine.ts`  
**Integration:** `lib/brain/engines/pipeline.ts`

Proactive — does not wait for user questions.

Detects: patterns, contradictions, opportunities, risks.

Output headline: **"I noticed something."**

Signal types: `pattern` | `contradiction` | `opportunity` | `risk`

---

## Phase 8 — Potential Engine

**Location:** `engine/potentialEngine.ts`

Generates opportunities aligned with mission, North Star, values, projects, skills, priorities.

Each opportunity includes:

- Title
- Reason
- First Action
- Impact
- Mission Alignment
- Confidence Score

---

## API reference

### `GET /api/brain`

Returns service metadata, supported intents, architecture modules.

### `POST /api/brain`

```json
{
  "intent": "auto | query | decide | reflect | awareness | potential | learn",
  "message": "string",
  "decision": "optional for decide",
  "reason": "optional for decide"
}
```

Response fields include: `answer`, `headline`, `nextAction`, `confidence`, `sources`, `slicesUsed`, `engines`, `memoryUpdated`, `memoryDiscarded`, `missionAligned`, `awareness`, `opportunity`, `learning`.

---

## Environment variables

```bash
BRAIN_AI_PROVIDER=claude          # claude | openai | gemini | local | rule-based
BRAIN_AI_MODEL=claude-sonnet-4-6    # provider-specific model
ANTHROPIC_API_KEY=...               # never commit
OPENAI_API_KEY=...
GOOGLE_API_KEY=...
BRAIN_LOCAL_URL=http://localhost:11434
```

---

## What comes next

- Wire dashboard UI through `/api/brain` (today engines still run client-side for display)
- Activate Reality Layer connectors one by one
- Scheduled Learning Engine runs (cron / background job)
- Supabase for durable cloud memory (v0.3 roadmap)

---

## Module map

```
lib/brain/
  executiveBrain.ts      # Central orchestrator
  missionGate.ts         # Mission alignment check
  types.ts               # Shared types
  intent/
    detectIntent.ts      # Auto intent + topic detection
    routeEngines.ts      # Engine routing plan
  context/
    buildContext.ts      # Prompt assembly
    slices.ts            # Relevance-based memory slices
  engines/
    pipeline.ts          # Run engines, format context
    learningEngine.ts    # Pattern/lesson analysis
  memory/
    store.ts             # Load/save brain + memory
    update.ts            # Quality-filtered updates
  providers/             # AI abstraction

lib/reality/
  layer.ts               # Reality stubs + types
  index.ts               # fetchRealityContext

engine/
  decisionEngine.ts      # Six capitals + board
  awarenessEngine.ts     # Proactive insights
  potentialEngine.ts     # Opportunity generation
```
