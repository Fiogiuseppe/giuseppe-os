# Decision Learning Loop

Giuseppe OS now closes the loop between recommendations and measured outcomes.

## Lifecycle

1. **Decision created** — intake completes on the Decisions view.
2. **Recommendation generated** — Brain returns board output.
3. **Decision taken** — recommendation is persisted with `status: awaiting_review`.
4. **Waiting period** — `review_after` is scheduled by category (7 / 30 / 90 / 365 days).
5. **Outcome review** — Today surfaces due reviews before the daily briefing.
6. **Lesson learned** — review writes `lesson`, `outcome`, `outcome_rating`.
7. **Pattern updated** — weak or repeated outcomes can append `patterns_detected`.
8. **Trajectory updated** — `trajectory_effect` and `confidence_after` are stored.

## Modules

| Module | Path |
|--------|------|
| Follow-up Engine | `lib/decision-learning/followUp.ts` |
| Review schedule | `lib/decision-learning/schedule.ts` |
| Learning apply | `lib/decision-learning/learning.ts` |
| Today gate UI | `app/components/DecisionReviewGate.tsx` |
| Due reviews API | `app/api/decisions/reviews/due` |
| Submit review API | `app/api/decisions/reviews/submit` |

## Oracle rule

Only decisions with `reviewCompletedAt` (or `status: reviewed`) become Oracle outcome memories. Unreviewed assumptions are excluded from Future Giuseppe evidence.

## Insights weighting

`buildEvidenceSnapshot()` now counts `reviewedOutcomeCount`. Reviewed outcomes score 4× in evidence assessment — higher weight than unreviewed decisions.

## Guardian

`scanDecisionLearning()` verifies review timestamps and Oracle reviewed-only filtering.

## Already working before this sprint

- Decision intake + recommendation (`/api/brain`, `/api/decisions/intake`)
- Minimal decision persistence
- Oracle evidence gathering (read path)
- Monthly Insights engine
- Trajectory filter on Today briefing

## Future modules that benefit automatically

- **Daily Brief / Oracle** — richer reviewed outcome evidence in prompts
- **Insights** — higher-confidence patterns from real outcomes
- **Learning Engine** — lesson source `decision:{id}` is ready for aggregation
- **Identity Graph** — decision outcomes can seed graph nodes later
- **Create / project tracking** — same review pattern can extend to project streaks
