# Phase 17 — Weekly Letter Implementation Report

**Date:** 2026-07-07  
**Status:** Complete  
**Branch:** `main`  
**Report author:** Cursor agent

---

## Summary

Shipped **Weekly Letter** — a Monday morning email that reads like a calm strategic note from Giuseppe's artist/career manager, not a dashboard or AI report. Generation uses real evidence from decisions, outcomes, working memory, insights, knowledge, sources, constitution, self model, and recent Guardian reports. Letters are cached once per ISO week in Supabase (`weekly_letters`) with in-memory fallback; email sends via Resend REST API, at most once per week. Vercel cron triggers the route Monday 05:00 UTC (~07:00 Copenhagen in summer).

---

## Objectives

| # | Objective | Met? |
|---|-----------|------|
| 1 | Generate Weekly Letter from real data only | Yes |
| 2 | Resend email delivery with env-based config | Yes |
| 3 | CRON_SECRET-protected API + Vercel cron | Yes |
| 4 | Supabase cache — one letter per week | Yes |
| 5 | Beautiful minimal HTML matching Giuseppe OS | Yes |
| 6 | No UI changes to Today/Decisions/etc. | Yes |

---

## Files Created

| Path | Purpose |
|------|---------|
| `lib/email/send.ts` | Resend REST email sender |
| `lib/weekly-letter/types.ts` | Letter content + evidence types |
| `lib/weekly-letter/week.ts` | ISO week key, date range helpers |
| `lib/weekly-letter/buildContext.ts` | Evidence aggregation from OS data |
| `lib/weekly-letter/prompt.ts` | Artist-manager system prompt |
| `lib/weekly-letter/parse.ts` | JSON contract parsing |
| `lib/weekly-letter/fallback.ts` | Honest fallback when evidence is thin |
| `lib/weekly-letter/generate.ts` | Generate + cache orchestration |
| `lib/weekly-letter/renderEmail.ts` | Cream/black HTML email template |
| `lib/weekly-letter/cache.ts` | In-process week cache |
| `lib/weekly-letter/supabase.ts` | Supabase persistence |
| `lib/weekly-letter/runTests.ts` | Parse + render smoke tests |
| `app/api/weekly-letter/route.ts` | Cron/manual trigger + send |
| `supabase/migrations/20260707_weekly_letters.sql` | `weekly_letters` table |
| `vercel.json` | Monday cron schedule |

---

## Files Modified

| Path | Change |
|------|--------|
| `.env.example` | Added Resend + Weekly Letter env vars |

---

## Database Changes

| Migration | Tables / columns | Notes |
|-----------|------------------|-------|
| `supabase/migrations/20260707_weekly_letters.sql` | `weekly_letters` | Pending apply on production Supabase |

---

## API Routes

| Method | Route | Behavior |
|--------|-------|----------|
| `GET` / `POST` | `/api/weekly-letter` | Auth via `CRON_SECRET` (query `secret` or `Authorization: Bearer`). Generates or loads cached letter, sends email once per week. `?force=true` regenerates and resends. |

---

## What is real vs mock

| Area | Status |
|------|--------|
| Evidence from memory/decisions/outcomes | **Real** |
| AI letter body (when `AI_MODE=live` + provider key) | **Real** |
| Fallback letter when evidence thin / no AI | **Real** (honest, non-invented) |
| Daily brief history | **Proxy** — working sessions counted; no persisted daily-brief archive yet |
| Project updates count | **Not tracked** — footer uses knowledge/decisions instead |
| Email delivery | **Real** when Resend env vars set |

---

## Manual test

```bash
# Production (after env vars set on Vercel + migration applied)
curl "https://giuseppe-os.vercel.app/api/weekly-letter?secret=YOUR_CRON_SECRET"

# Local
curl "http://localhost:3000/api/weekly-letter?secret=YOUR_CRON_SECRET"

# Force regenerate + resend
curl "https://giuseppe-os.vercel.app/api/weekly-letter?secret=YOUR_CRON_SECRET&force=true"
```

---

## Environment variables

```
RESEND_API_KEY=
WEEKLY_LETTER_TO=          # comma-separated
WEEKLY_LETTER_FROM=        # verified Resend sender
CRON_SECRET=
```

---

## Cron schedule

`vercel.json`: `0 5 * * 1` — Mondays 05:00 UTC (07:00 Copenhagen CEST / 06:00 CET).

Vercel sends `Authorization: Bearer $CRON_SECRET` when `CRON_SECRET` is set in project env.

---

## Known limitations

- Daily brief history is not persisted; working sessions proxy activity.
- Project update events are not tracked separately.
- Guardian context reads saved markdown reports only (last 14 days), not live scan.
- Without Supabase migration applied, cache is in-memory only (lost on cold start).
- Letter defaults to English for email; Italian available via locale if wired later.

---

## Quality gate

- [x] `npm run typecheck`
- [x] `npm run build`
- [x] `npx tsx lib/weekly-letter/runTests.ts`
