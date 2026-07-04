# AI Usage Audit — Giuseppe OS

**Date:** 2026-07-04  
**Scope:** All Anthropic / live provider calls, caching, and cost-control rules.

---

## Executive summary

Giuseppe OS had **three automatic live-AI risk paths** before this audit:

1. **Today** — briefing regenerated on every dev server session (dev cache bypass).
2. **Insights** — `/api/brain` awareness call on every app load.
3. **Create** — `/api/brain` potential call on every app load.

All three are now gated. **Default server state is `AI_MODE=mock` → zero Anthropic calls.** Live AI runs only when the server is explicitly configured with `AI_MODE=live` + `ANTHROPIC_API_KEY`.

---

## Live AI call map (after audit)

| Page | API route | When | Trigger | Cached | Refresh behaviour | Live AI allowed |
|------|-----------|------|---------|--------|-------------------|-----------------|
| **Today** | `POST /api/todays-letter` | Page load | Automatic | Yes — daily (`dateKey` + locale) | Reuses same brief until next day | Only if `AI_MODE=live` |
| **Today** | `POST /api/todays-letter` `{ regenerate: true }` | User clicks Regenerate (dev + live only) | Explicit | Clears daily cache | New live brief once | Only if `AI_MODE=live` |
| **Decisions** | `POST /api/brain` `intent: decide` | User submits decision flow | Explicit | No (persists to memory) | New call per submission | Only if `AI_MODE=live`; else rule-based mock |
| **Insights** | `POST /api/insights` | User opens Insights view | View navigation | Yes — monthly (`YYYY-MM` + locale) | Reuses same insight until next month | Local engine by default |
| **Insights** | `POST /api/insights` `{ regenerate: true }` | Manual regenerate (live only) | Explicit | Clears monthly cache | One live call per month max | Only if `AI_MODE=live` |
| **Create** | `POST /api/create/brief` | User clicks “Explore opportunities” | Explicit | No (local engine is cheap) | Local recompute on each open | Local only by default |
| **Create** | `POST /api/create/brief` `{ analyze: true }` | Explicit analysis request | Explicit | No | Per request | Only if `AI_MODE=live` |
| **Memory** | — | — | — | — | — | **Never** |

### Routes that never call Anthropic directly

- `GET /api/ai-status` — reports `mode: mock | live`
- `POST /api/decisions/intake` — rule-based intake only
- `GET /api/brain`, `GET /api/todays-letter`, `GET /api/insights` — metadata only

### Provider layer

| File | Role |
|------|------|
| `lib/brain/providers/claude.ts` | **Only** Anthropic HTTP client |
| `lib/brain/providers/index.ts` | Resolves mock vs live from `AI_MODE` |
| `lib/ai/loggedProvider.ts` | Logs every live provider completion |
| `lib/todays-letter/generate.ts` | Direct Claude call for daily brief (live only) |

---

## Caching rules (implemented)

### Today — once per day

- Cache key: `dateKey:locale` (Europe/Copenhagen)
- Layers: in-memory (`lib/todays-letter/cache.ts`) + Next.js `unstable_cache` in production
- **Removed** dev-only bypass that skipped platform cache
- `regenerate: true` requires `AI_MODE=live`; otherwise returns existing cache (403 from API)

### Insights — once per month

- Cache key: `YYYY-MM:locale`
- Default path: `runAwarenessEngine()` — **no Anthropic**
- Live regenerate: `runExecutiveBrain({ intent: 'awareness' })` — monthly max, live only

### Create — on demand only

- No page-load fetch
- Local `runPotentialEngine()` when user opens opportunities
- Live analysis opt-in via `analyze: true` + `AI_MODE=live`

### Decisions — per submission

- Unchanged: AI only after user completes intake
- Mock/rule-based when `AI_MODE=mock`

---

## Logging (live calls only)

Every live provider completion logs JSON to stdout:

```json
{
  "route": "todays-letter | brain",
  "page": "today | decisions | insights | create | brain",
  "reason": "daily-brief | regenerate | user-submit | monthly-regenerate | explicit-analysis | …",
  "provider": "claude",
  "model": "claude-sonnet-4-6",
  "estimatedInputTokens": 0,
  "estimatedOutputTokens": 0,
  "timestamp": "ISO-8601"
}
```

**Never logs API keys.**

---

## Default AI state

| Setting | Value | Effect |
|---------|-------|--------|
| `AI_MODE` | `mock` (default) | All `resolveAIProvider()` → mock/rule-based |
| Footer indicator | Red, read-only | Informational only |
| Playwright / CI | `AI_MODE=mock` | Tests never hit Anthropic |
| Production | `AI_MODE=mock` unless owner sets `live` | Shared deploy safe |

---

## Remaining risks

| Risk | Severity | Mitigation |
|------|----------|------------|
| Owner sets `AI_MODE=live` on public deploy | Medium | All visitors share one daily/monthly cache; no per-user live toggle |
| Decision submissions with live on | Low | Expected product behaviour; one call per decision |
| `analyze: true` on Create without UI yet | Low | API exists; no automatic client trigger |
| In-memory cache lost on server restart | Low | Re-generates once (local/mock); production uses `unstable_cache` for Today |
| Brain `query` / `reflect` / `learn` intents via direct API | Low | Not exposed in UI; still mock unless `AI_MODE=live` |

---

## Estimated token-saving impact

| Area | Before | After | Savings |
|------|--------|-------|---------|
| App load (Insights + Create) | 2 brain calls / load | 0 live calls on load | **~100%** of load-time tokens |
| Today refresh (dev) | New generation possible each cold start | Cached per day | **~1 call/day** max |
| Today refresh (prod) | Already cached | Unchanged + regenerate gated | Regenerate abuse blocked |
| Insights | Every navigation | 1 local compute / month | **~30×** fewer insight paths |
| Create | Every app load | 0 until user opens opportunities | **~100%** until explicit action |
| Shared deploy | Visitor could enable live (old toggle) | Server-only control | **Eliminated** |

**Rough order-of-magnitude:** a typical browsing session went from **3+ provider calls** (letter + awareness + potential) to **0 live calls** with default settings, and **1 local call** when opening Insights.

---

## Test coverage

- `e2e/ai-mode.spec.ts` — mock mode, read-only footer
- `e2e/todays-letter-api.spec.ts` — daily cache + regenerate gate
- `e2e/insights-api.spec.ts` — monthly cache
- `e2e/brain-api.spec.ts` — brain intents in mock mode
- `playwright.config.ts` — `AI_MODE=mock` enforced

---

## Enabling live AI (owner only)

```bash
# .env.local or deployment secrets
AI_MODE=live
ANTHROPIC_API_KEY=sk-ant-...
```

No client toggle. Footer stays red/OFF as a product indicator.
