# Giuseppe OS — Decisions Log

**Purpose:** Running record of important product and architecture decisions.  
**Rule:** When a decision changes how Giuseppe OS works, add an entry here — not only in conversation.

---

## How to Use

Each entry includes:

- **Date** — when decided
- **Decision** — what was chosen
- **Rationale** — why
- **Implications** — what this constrains or enables

---

## Entries

### 2026-07 — Giuseppe OS is not a generic chatbot

**Decision:** Giuseppe OS is a Personal Intelligence Operating System. The AI is one component, not the product.

**Rationale:** Generic assistants optimize for engagement. Giuseppe OS optimizes for Giuseppe's mission, memory, and long-term identity.

**Implications:** No chat UI as primary interface. Every feature must trace to mission alignment. Executive Brain orchestrates all AI calls.

---

### 2026-07 — Repository is private

**Decision:** `giuseppe-os` GitHub repository remains private.

**Rationale:** Contains personal brain data, financial context, life patterns, and private architecture.

**Implications:** No public forks or open-source release without explicit decision. Deployment uses private Vercel project.

---

### 2026-07 — Demo mode hides/blurs financial data

**Decision:** Finance view shows liquidity tier and goals; sensitive personal numbers are blurred/redacted.

**Rationale:** Allows demos, screenshots, and shared screens without exposing exact balances.

**Implications:** `lib/publicFinance.ts` controls what is public. Tests verify blur behavior in `e2e/quality.spec.ts`.

---

### 2026-07 — No page scroll on desktop

**Decision:** Main dashboard sections fit within one desktop viewport — no body scroll.

**Rationale:** Editorial, focused experience. Each section is a complete view, not a scrolling feed.

**Implications:** Layout must constrain content height. Tested in `e2e/navigation.spec.ts` and `e2e/quality.spec.ts`.

---

### 2026-07 — Design should feel like fiogiuseppe.com

**Decision:** Visual identity uses cream `#f7f5e8`, black, electric blue `#001fff`, Helvetica + Libre Baskerville.

**Rationale:** Giuseppe OS is part of Giuseppe's personal brand ecosystem, not a generic SaaS product.

**Implications:** New UI must match palette and typography. Tested in `e2e/quality.spec.ts` (portfolio-aligned visual identity).

---

### 2026-07 — AI must be provider-independent

**Decision:** All AI calls go through `lib/brain/providers/`. No direct Anthropic/OpenAI/Gemini imports outside provider layer.

**Rationale:** Provider APIs change. Giuseppe OS must survive model and vendor shifts for 10+ years.

**Implications:** Environment variables only for keys. Provider/model names never exposed in API responses. Claude Sonnet is first default; rule-based for tests.

---

### 2026-07 — Executive Brain is the orchestrator

**Decision:** Nothing talks directly to the AI. All requests flow through `lib/brain/executiveBrain.ts` via `/api/brain`.

**Rationale:** Without a single orchestrator, engines produce conflicting outputs and the system cannot learn across time.

**Implications:** UI migration to Brain API is Priority 1. New engines register through engine pipeline, not direct UI calls.

---

### 2026-07 — Context Builder uses relevance slices, not full memory

**Decision:** Never send entire `giuseppe_brain.json` to the AI. Retrieve topic-specific slices only.

**Rationale:** Token efficiency and relevance. A Wrangler decision needs finance + freedom, not LEGO campaign details.

**Implications:** New memory domains need slice definitions in `lib/brain/context/slices.ts`.

---

### 2026-07 — Quality over quantity in memory

**Decision:** `shouldRemember()` filters interactions. Low-value exchanges are session-logged but not stored as durable records.

**Rationale:** Storing everything degrades signal. Memory must compound lessons, not accumulate noise.

**Implications:** Memory types are explicit (identity, goals, lesson, decision, pattern, etc.). Not every API call creates a long-term record.

---

### 2026-07 — Mission gate before every response

**Decision:** System asks: *"Will this response help Giuseppe become the person he chose to become?"*

**Rationale:** Final design principle. Prevents generic or misaligned output.

**Implications:** `lib/brain/missionGate.ts` evaluates alignment. Future: gate could block or rewrite low-alignment responses.

---

### 2026-07 — Repo docs are the long-term memory

**Decision:** This repository's documentation (`docs/00_*` through `docs/04_*`) is the authoritative project memory — not Cursor conversation history.

**Rationale:** Conversations are ephemeral. Architecture, status, decisions, and next steps must persist in git.

**Implications:** Every Cursor session starts by reading project memory docs. Updates happen in the same PR/commit as code changes.

---

### 2026-07 — Playwright uses rule-based AI provider

**Decision:** E2E tests run with `BRAIN_AI_PROVIDER=rule-based` and isolated test memory files.

**Rationale:** Tests must pass offline without API keys and without polluting production memory.

**Implications:** `playwright.config.ts` sets env vars. Test memory paths gitignored.

---

### 2026-07 — North Star appears only on Board view

**Decision:** North Star headline is exclusive to the Board section, not repeated on every page.

**Rationale:** Prevents visual noise; Board is the orientation anchor.

**Implications:** Tested in `e2e/quality.spec.ts`.

---

### 2026-07 — Today becomes the Daily Briefing (Personal Intelligence OS v1.7)

**Decision:** Giuseppe OS is a Personal Intelligence Operating System. Today is no longer a dashboard — it is Giuseppe's daily briefing. The intelligence pipeline is: Reality Engine → Personal Relevance Engine → Daily Briefing Generator → Today UI.

**Rationale:** The product optimizes Giuseppe's long-term trajectory and life outcome — not productivity, time, or generic AI assistance. The briefing delivers max 3 high-leverage recommendations across 6 sections: One Big Move, Reality, Opportunity, Ignore, Nourish, Reflection. Recommendations must improve at least one of eight capitals (Wealth, Knowledge, Creative, Relationship, Health, Freedom, Time, Reputation).

**Implications:** `lib/briefing/` is the canonical module for briefing types and thinking chain. `lib/todays-letter/` remains as the generator implementation layer (API route unchanged for now). `lib/philosophy/core.ts` holds capitals and trajectory rules. Future engines must contribute to trajectory optimization. `/api/briefing` may be added later; `/api/todays-letter` returns `briefing` + legacy `letter` field.

---

### 2026-07 — Trajectory Engine as highest-level decision filter

**Decision:** Add `lib/trajectory/` as the highest-level filter in the intelligence pipeline. Every recommendation must pass the trajectory question and ten-year test before appearing in the Daily Briefing. Pipeline order: Reality Engine → Personal Relevance Engine → Trajectory Engine → Daily Briefing Generator.

**Rationale:** Giuseppe OS optimizes long-term trajectory, not daily activity. Recommendations that weaken the 10-year vision are filtered out; unclear ones get low confidence. The engine evaluates against mission, North Star, constitution, goals, projects, risks, past decisions, and observed behaviour.

**Implications:** `lib/trajectory/engine.ts` filters relevance items and post-processes briefing sections (`oneBigMove`, `opportunity`, `nourish`). `lib/philosophy/core.ts` exports trajectory questions and preferences. API pipeline metadata includes `trajectoryApproved`, `trajectoryFiltered`, and `trajectoryNote`. All future engines must support trajectory evaluation. Cache schema bumped to `daily-briefing-v2`.

---

### 2026-07 — Product vision encoded + Quality Engine

**Decision:** Giuseppe OS is explicitly a Personal Intelligence Operating System — not productivity, dashboard, or assistant. Today IS Home. The full product mission, daily question chain, eight capitals, silence principle, and deferred notifications policy are encoded in `lib/philosophy/core.ts`. A Quality Engine (`lib/briefing/quality.ts`) gates every Daily Brief before publication.

**Rationale:** Intelligence must be measured by outcomes, not engagement. Weak advice is worse than silence. The briefing must never auto-publish without evaluating relevance, novelty, trajectory impact, evidence, and confidence. If quality is low, the system says: *"I don't think I have anything valuable enough to interrupt your attention today."*

**Implications:** Pipeline order: Reality → Relevance → Trajectory → Briefing Generator → **Quality Engine**. `lib/learning/briefingFeedback.ts` scaffolds Helpful/Neutral/Not Helpful ratings for Phase 6. Notifications remain deferred until briefing quality is consistently high. `docs/00_PROJECT_STATE.md` updated to v1.7. Cache schema `daily-briefing-v3`.

---

## Template for New Entries

```markdown
### YYYY-MM — [Short title]

**Decision:** [What was chosen]

**Rationale:** [Why]

**Implications:** [What this constrains or enables]
```
