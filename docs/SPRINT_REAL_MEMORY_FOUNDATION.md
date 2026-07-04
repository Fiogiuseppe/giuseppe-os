# Sprint: Real Memory Foundation

## What was replaced

| Before | After |
|--------|-------|
| Client-side `runAwarenessEngine()` / `runPotentialEngine()` in `app/page.tsx` | Brain API via `fetchInsightsViaBrain` and `fetchCreateViaBrain` |
| Hardcoded `PROJECT_PROGRESS` percentages in Create | Honest `"Not enough data yet."` / `"Dati insufficienti."` |
| Fixed `confidenceScore: 72` in rule-based provider | Evidence-gated confidence from `lib/memory/evidence.ts` |
| Decisions with `persist: false` | Decisions persist to long-term memory by default |
| JSON-only brain memory store | Unified `lib/memory/persistentStore.ts` with Supabase option |

## What is now persistent

- **Working memory** — sessions and interaction records (`working_memory.json` or Supabase `memory_sessions` / `memory_records`)
- **Long-term memory** — decisions, lessons, patterns, insight history (`long_term.json` or Supabase tables)
- **Insight observations** — each awareness run appends to `insight_history` when `persist: true`
- **Constitution** — `giuseppe_brain.json` remains the curated identity source (not session data)

Set `MEMORY_BACKEND=supabase` with `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to use Supabase. JSON files are always written as fallback; Supabase is used when configured.

## Architectural decisions

1. **Dual-write JSON + optional Supabase** — avoids breaking local dev without credentials while enabling production persistence.
2. **Evidence levels** (`none` → `learning` → `emerging` → `established`) gate confidence scores and ranking.
3. **Observation windows** — insight headlines shift from constitution-based to session-based to week-based as evidence accumulates.
4. **Executive Brain as single path** — Insights and Create fetch through `/api/brain`; engines receive loaded memory context.
5. **Trust over completeness** — scores and percentages hidden until `hasEnoughForConfidence` / `hasEnoughForRanking` thresholds are met.

## What still requires future work

- Run `supabase/schema.sql` against a live Supabase project and set env vars in deployment.
- Project progress metrics need real tracking inputs (milestones, outputs, time logged).
- Learning engine should consume accumulated insight history for cross-pattern synthesis.
- Daily Brief pipeline should read persistent memory for trajectory notes.
- Migrate polluted `long_term.json` lessons from test runs if needed.
- Reality layer connectors remain stubbed.

## Can the system learn over time?

**Yes, at the foundation level.** Decisions, lessons, sessions, and insight snapshots now accumulate across sessions. Recurring insights gain weight via `insight_history`. Confidence and ranking unlock as evidence grows. Full adaptive learning (model fine-tuning, automatic pattern discovery) is not implemented yet — but the storage and gating layer to support it is in place.
