# Design Reviews

Visual design review packages for Giuseppe OS major releases.

## Latest

| Version | File | Date |
|---------|------|------|
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
