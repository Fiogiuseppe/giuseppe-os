# Giuseppe OS — Next Steps

**Last updated:** July 2026  
**Ordered by priority.** Complete each before expanding scope.

> **v2 direction:** Personal Decision Intelligence System. Foundations shipped July 2026. See [`DECISION_INTELLIGENCE_PIVOT.md`](DECISION_INTELLIGENCE_PIVOT.md).

---

## Foundation (v2.0 Decision Intelligence) — Done

- [x] **Philosophy rewrite** — `lib/philosophy/core.ts` (decision quality, trajectory, pattern principle)
- [x] **Pipeline registry** — `lib/architecture/pipeline.ts`
- [x] **Engine type contracts** — Identity, Digital Twin, Goal Validation, Decision Simulator, Prediction
- [x] **Quality Engine** — personalization criterion in `lib/briefing/quality.ts`
- [x] **Daily Brief prompt** — decision-first framing in `lib/todays-letter/prompt.ts`
- [x] **Documentation** — pivot doc, ARCHITECTURE_V2, constitutions, roadmap

---

## Priority 1 — Identity Layer Runtime

**Why:** Memory stores facts; Identity stores meaning. Without reinterpretation, the Digital Twin has no input.

**Tasks:**

1. Read memory facts (decisions, projects, writing events) into `IdentityLayerReport`
2. LLM-assisted meaning extraction with confidence scores
3. Feed interpretations into Daily Brief context (not full dump)
4. Log architecture decision when format stabilizes

**Done when:** Daily Brief context includes at least one identity interpretation with evidence.

---

## Priority 2 — Pattern Engine + Living Timeline

**Why:** Patterns are more valuable than memories. Life events refine the Twin weekly.

**Tasks:**

1. Ingest timeline events from memory, writing, projects (local first)
2. Detect recurring trigger → outcome patterns
3. Surface one pattern per week in Awareness or Daily Brief when confidence is high

**Done when:** A discovered pattern appears in briefing context with evidence.

---

## Priority 3 — Digital Twin v1

**Why:** Personal Relevance must think like Giuseppe, not like a generic assistant.

**Tasks:**

1. Define twin update rules from identity + learning feedback
2. Store twin snapshot (local JSON first; Supabase later)
3. Pass twin dimensions to Personal Relevance Engine
4. Surface latent patterns in Awareness (one at a time)

**Done when:** Relevance items reference twin dimensions; Awareness can cite a latent pattern.

---

## Priority 3 — Goal Validation in Pipeline

**Why:** Truth is more important than optimization. Stated goals can be wrong.

**Tasks:**

1. Implement `evaluateStatedGoal()` stub → engine
2. Wire into Daily Brief before Trajectory filter for One Big Move
3. Wire into Decisions view via Brain API
4. Respectful challenge copy in prompts — never preachy

**Done when:** Briefing can say "you may be optimizing the wrong goal" with evidence.

---

## Priority 4 — Wire UI Through Executive Brain

**Why:** The spine exists but the dashboard still bypasses it. v2 pipeline must eventually unify.

**Tasks:**

1. Route Today decision flow through shared context builder (Identity + Twin when ready)
2. Route Awareness and Potential panels through Brain API
3. Remove direct client-side engine imports from `app/page.tsx` where possible
4. Preserve existing UI behavior and test coverage

**Done when:** Intelligence flows share context; Playwright tests still pass.

---

## Priority 5 — Decision Simulator (Important Decisions Only)

**Why:** Before major moves, compare futures — never pretend certainty.

**Tasks:**

1. Multi-scenario generation for Decisions view
2. Trade-off and assumption disclosure in UI
3. Trajectory filter on each scenario

**Done when:** House / job / relocation decisions show 2–3 scenarios with confidence labels.

---

## Priority 6 — Memory Persistence (Supabase)

**Why:** Twin and identity need durable, versioned storage.

**Tasks:**

1. Design schema: facts, interpretations, twin snapshots with provenance
2. Migrate `giuseppe_brain.json` reads to Memory Engine slice API
3. Keep local JSON as fallback/dev mode

**Done when:** Twin survives across deployments.

---

## Priority 7 — Learning Loop → Twin Update

**Why:** Every interaction should improve the Digital Twin.

**Tasks:**

1. Wire briefing feedback (`lib/learning/briefingFeedback.ts`)
2. Feed decisions, writing, projects into learning analysis
3. Update twin confidence from calibration

**Done when:** Feedback changes next-day briefing personalization score.

---

## What NOT to Build Yet

- Full Prediction Engine runtime
- Notifications channel
- Generic chatbot interface
- Mobile app
- Auto-write identity interpretations without confidence gate
- Implementing all engines at once — one layer at a time

---

## Foundation (v1.0) — Done (historical)

These shipped in the Intelligence Foundation release:

- [x] **Executive Brain** — orchestrator at `lib/brain/executiveBrain.ts`, exposed via `/api/brain`
- [x] **Context Builder** — relevance slices in `lib/brain/context/`
- [x] **AI Provider Layer** — swappable providers in `lib/brain/providers/`
- [x] **Memory update** — quality-filtered records in `lib/brain/memory/update.ts`
- [x] **Learning Engine** — on-demand analysis in `lib/brain/engines/learningEngine.ts`
- [x] **Reality Layer architecture** — stubs in `lib/reality/`
- [x] **Mission gate** — alignment check before response
- [x] **Documentation** — `INTELLIGENCE_FOUNDATION.md`, architecture updates
- [x] **Tests** — 40 Playwright tests, typecheck, build

---

## Priority 1 — Wire UI Through Executive Brain

**Why:** The spine exists but the dashboard still bypasses it. Until the UI calls `/api/brain`, Giuseppe OS is two systems.

**Tasks:**

1. Route Today decision flow through `POST /api/brain` with `intent: decide`
2. Route Awareness and Potential panels through Brain API
3. Remove direct client-side engine imports from `app/page.tsx` where possible
4. Preserve existing UI behavior and test coverage

**Done when:** All intelligence flows go through Executive Brain; Playwright tests still pass.

---

## Priority 2 — Memory Persistence (Supabase)

**Why:** Local JSON files do not scale, cannot sync across devices, and have no provenance.

**Tasks:**

1. Design memory schema with `source`, `updated_at`, `confidence` fields
2. Migrate `giuseppe_brain.json` reads to Memory Engine slice API
3. Persist decisions and lessons to cloud store
4. Keep local JSON as fallback/dev mode

**Done when:** Decisions survive across deployments; brain is editable without code changes.

---

## Priority 3 — Learning Loop (Scheduled)

**Why:** Learning Engine exists but only runs on `learn` intent. Patterns should surface proactively.

**Tasks:**

1. Schedule periodic learning analysis (cron or background job)
2. Write detected patterns to long-term memory
3. Feed learning output into Awareness Engine
4. Surface one insight per day through Attention policy

**Done when:** Giuseppe OS notices patterns without being asked.

---

## Priority 4 — Reality Layer Connectors

**Why:** Architecture stubs exist; live context is the next intelligence multiplier.

**Order of connectors:**

1. Calendar (time awareness)
2. Finance manual/import (cash position truth)
3. Notes/projects sync
4. Gmail (communication context)
5. Web/news search
6. Weather (low priority)

**Done when:** Context Builder can distinguish Personal Memory vs Live Reality vs Unknown.

---

## Priority 5 — Daily Use Features (v1.1)

**Why:** Intelligence foundation enables daily rituals.

**Tasks:**

1. Morning board briefing
2. Weekly board meeting / review scheduler
3. Decision coach (persistent decision history)
4. Project radar (abandoned project detection)
5. Finance radar (liquidity alerts)
6. Purpose engine integration or removal

**Done when:** Giuseppe uses Giuseppe OS every morning without friction.

---

## Priority 6 — Auth and Private Mode

**Why:** Repository is private; production deployment needs access control before sensitive data sync.

**Tasks:**

1. Authentication (single-user initially)
2. Private mode toggle
3. Stricter finance redaction policies per environment
4. API key management via Vercel env only

**Done when:** Only Giuseppe can access production brain and memory.

---

## What NOT to Build Yet (v1 legacy — superseded by v2 list above)

- More navigation views or intelligence panels
- Direct LLM calls from UI components
- Life Dashboard, habits, health modules
- Mobile app
- Generic chatbot interface
- Auto-write patterns to memory without Learning Engine review

---

## After Every Implementation

1. Update `docs/01_CURRENT_STATUS.md`
2. Log decisions in `docs/03_DECISIONS_LOG.md`
3. Run `npm run quality:check`
4. Commit and push to `main`
