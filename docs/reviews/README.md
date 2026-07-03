# Design Reviews

Visual design review packages for Giuseppe OS major releases.

## Latest

| Version | File | Date |
|---------|------|------|
| 1.5.1 | [`DESIGN_REVIEW_1.5.1.pdf`](DESIGN_REVIEW_1.5.1.pdf) | July 2026 — Today's Letter via Anthropic with daily cache |
| 1.5.0 | [`DESIGN_REVIEW_1.5.0.pdf`](DESIGN_REVIEW_1.5.0.pdf) | July 2026 — Today's Letter intelligence on Today home |
| 1.4.0 | [`DESIGN_REVIEW_1.4.0.pdf`](DESIGN_REVIEW_1.4.0.pdf) | July 2026 — AI v0.1 for Decisions via Executive Brain |
| 1.3.2 | [`DESIGN_REVIEW_1.3.2.pdf`](DESIGN_REVIEW_1.3.2.pdf) | July 2026 — Editorial Today layout & time-aware portrait |
| 1.3.1 | [`DESIGN_REVIEW_1.3.1.pdf`](DESIGN_REVIEW_1.3.1.pdf) | July 2026 — Layout clipping fixes |
| 1.3.0 | [`DESIGN_REVIEW_1.3.0.pdf`](DESIGN_REVIEW_1.3.0.pdf) | July 2026 — Top navigation & daily companion IA |
| 1.2.0 | [`DESIGN_REVIEW_1.2.0.pdf`](DESIGN_REVIEW_1.2.0.pdf) | July 2026 — Distinct Mental Spaces |
| 1.1.0 | [`DESIGN_REVIEW_1.1.0.pdf`](DESIGN_REVIEW_1.1.0.pdf) | July 2026 — Progressive Disclosure redesign |
| 1.0.0 | [`DESIGN_REVIEW_1.0.0.pdf`](DESIGN_REVIEW_1.0.0.pdf) | July 2026 |

## Generate a new review

After every major release, run:

```bash
npm run design:review
```

This will:

1. Run typecheck, Playwright tests, and production build
2. Start the production server and capture full-page screenshots
3. Generate `docs/reviews/DESIGN_REVIEW_<version>.pdf`
4. Include cover page, all main screens, and a summary page

Then commit and push the PDF:

```bash
git add docs/reviews/DESIGN_REVIEW_<version>.pdf docs/reviews/README.md
git commit -m "Add design review package for v<version>."
git push origin main
```

## PDF contents

**Cover page**
- Giuseppe OS, version, date, commit hash, branch

**Screenshot pages** (one per screen)
- Home, Today, Board, Awareness, Projects, Finance, Brain
- Mobile Home, Mobile Today
- Viewport size, build status, test status under each screenshot

**Summary page**
- Playwright results, build status, known issues, future improvements, deployment URL

## When to generate

- After every major version release (v1.0, v1.1, v2.0, etc.)
- After significant UI redesigns
- Before sharing design with collaborators

See [`docs/04_CURSOR_WORKFLOW.md`](../04_CURSOR_WORKFLOW.md) for the full release workflow.
