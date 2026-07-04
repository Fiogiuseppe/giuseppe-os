# The Guardian

**The Guardian** is Giuseppe OS's permanent internal agent.

It is **not** part of the user experience. It never talks to Giuseppe. It protects the product.

## Purpose

The Guardian exists so Giuseppe OS never slowly becomes a worse product. It is the internal CTO: it protects simplicity, clarity, trust, performance, design consistency, philosophy, code quality, and long-term vision.

Canonical definition: [`agents/The_Guardian.md`](../agents/The_Guardian.md)

Implementation: [`lib/guardian/`](../lib/guardian/)

## Run a review

```bash
npm run guardian:report
```

This writes a markdown report to `docs/reviews/GUARDIAN_REPORT_<date>.md` and prints it to stdout.

The Guardian **does not modify code automatically**. It reports, explains why, and recommends action.

## What it reviews

- Architecture, performance, code quality
- UI/UX consistency, accessibility, responsive behaviour
- Typography, spacing, animations, visual hierarchy
- Dead code, unused components, duplication
- AI consistency (fake scores, fake confidence, generic advice)
- Product philosophy (one question per section, simplicity, trust)

## Constitution

Immutable principles live in `lib/guardian/constitution.ts` and mirror the agent definition.

Final gate:

> Will this make Giuseppe OS a more trustworthy decision partner?

## Relationship to other systems

| System | Role |
|--------|------|
| **Quality Engine** (`lib/briefing/quality.ts`) | Runtime gate for Daily Brief publication |
| **Mission Gate** (`lib/brain/missionGate.ts`) | Advisory alignment on Brain responses |
| **The Guardian** | Dev-time product protector; weekly-style review report |
| **`npm run quality:check`** | Engineering gate (typecheck + e2e + build) |
| **`npm run design:review`** | Visual regression PDF |

The Guardian complements — does not replace — runtime quality and engineering checks.

## Cursor workflow

After meaningful development, run `npm run guardian:report` before commit when product philosophy, UI, or AI behaviour may have shifted.

See `.cursor/rules/the-guardian.mdc`.

## Reports

Reports are stored in [`docs/reviews/`](reviews/) alongside design review PDFs.
