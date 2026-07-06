--------------------------------------------------

Guardian Report

Overall Health

73 / 100

Trust

37

Product Simplicity

100

Code Quality

93

Performance

100

AI Quality

37

Technical Debt

8 issues

Highest Priority

Hash-derived brand momentum percentages

Brands surfaces display these as percentages — invented momentum is the same trust failure as PROJECT_PROGRESS.

Replace with real signals from presence/data-sources, or show qualitative signals without numeric percentages.

Future Recommendation

Strengthen evidence panels and silence paths before expanding recommendation surfaces.

Final Question

Will this make Giuseppe OS a more trustworthy decision partner?

not yet

Findings

- [HIGH] Hash-derived brand momentum percentages
  Why: Brands surfaces display these as percentages — invented momentum is the same trust failure as PROJECT_PROGRESS.
  Action: Replace with real signals from presence/data-sources, or show qualitative signals without numeric percentages. (lib/brands/momentum.ts)

- [MEDIUM] Brands UI renders hash momentum as a percentage
  Why: Numeric percentages imply measurement. Hash placeholders read as real performance.
  Action: Show honest unknowns, qualitative momentum copy, or wire real evidence-backed scores. (app/components/BrandsStage.tsx)

- [INFO] Legacy AI provider exports remain in lib/brain/providers/
  Why: Stale provider files can mislead contributors into wiring the wrong AI path.
  Action: Remove deprecated providers after confirming zero imports, or relocate stubs under lib/ai/providers only. (lib/brain/providers/index.ts)

- [MEDIUM] Insights silently fall back to mock online signals
  Why: Mock signals can enter prompts without explicit uncertainty if the catch swallows upstream errors.
  Action: Label mock fallback in every locale, surface source:mock in UI, or prefer silence when presence is unavailable. (lib/ai/insight-engine.ts)

- [MEDIUM] Italian mock online signals are not labeled as mock
  Why: Insights may treat placeholder web signals as real activity in Italian UI.
  Action: Prefix Italian fallback signals with explicit mock/simulated wording. (lib/ai/insight-engine.ts)

- [MEDIUM] Decision AI silently falls back when JSON chain fails
  Why: Silent fallback can hide provider outages and look like measured AI analysis.
  Action: Log the failure, lower confidence, or return explicit uncertainty to the client. (lib/ai/decision-ai.ts)

- [LOW] Fixed mock confidence in decision AI
  Why: Even mock mode should model evidence gating, not a static mid-score.
  Action: Derive mock confidence from assessEvidence like the rule-based provider. (lib/ai/decision-ai.ts)

- [LOW] Large global stylesheet
  Why: Monolithic CSS makes consistency harder and raises regression risk.
  Action: Split by surface when the next design pass lands; until then, avoid new global rules. (app/globals.css)

--------------------------------------------------