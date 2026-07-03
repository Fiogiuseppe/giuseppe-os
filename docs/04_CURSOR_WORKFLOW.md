# Giuseppe OS — Cursor Workflow

**Purpose:** How Cursor (and any AI coding agent) should work on Giuseppe OS from now on.  
**Principle:** The repository is the source of truth — not conversation memory.

---

## Session Start (Required)

**Primary guide:** [`docs/CURSOR_STARTUP.md`](CURSOR_STARTUP.md)

Before implementing anything, read these files in order:

1. [`docs/PRODUCT_CONSTITUTION.md`](PRODUCT_CONSTITUTION.md) — product philosophy
2. [`docs/ENGINEERING_CONSTITUTION.md`](ENGINEERING_CONSTITUTION.md) — engineering rules
3. [`docs/DESIGN_DNA.md`](DESIGN_DNA.md) — permanent design language
4. [`docs/00_PROJECT_STATE.md`](00_PROJECT_STATE.md) — vision, architecture, design direction
5. [`docs/01_CURRENT_STATUS.md`](01_CURRENT_STATUS.md) — what exists, what is broken, what is missing
6. [`docs/02_NEXT_STEPS.md`](02_NEXT_STEPS.md) — current implementation priorities
7. [`docs/04_CURSOR_WORKFLOW.md`](04_CURSOR_WORKFLOW.md) — this file

If the task touches architecture or product direction, also read:

- [`docs/03_DECISIONS_LOG.md`](03_DECISIONS_LOG.md)
- [`docs/GIUSEPPE_OS_ARCHITECTURE.md`](GIUSEPPE_OS_ARCHITECTURE.md)
- [`docs/INTELLIGENCE_FOUNDATION.md`](INTELLIGENCE_FOUNDATION.md)

---

## Implementation Rules

### 1. One focused change at a time

- Do not bundle unrelated features in one commit.
- Minimize diff scope — solve the stated problem, nothing more.
- Match existing code conventions (naming, types, import style).

### 2. Inspect the repo before guessing

- If context is unclear, read files — do not rely on conversation history.
- Search the codebase for existing patterns before creating new abstractions.
- Check `docs/01_CURRENT_STATUS.md` for known limitations before proposing solutions.

### 3. Respect architecture boundaries

- **Never** call AI providers directly from UI or engines — go through Executive Brain.
- **Never** expose API keys or provider names in responses.
- **Never** send full memory dumps to AI — use Context Builder slices.
- **Never** build a generic chatbot interface.

### 4. Preserve non-negotiables

These are tested and must not regress:

- Desktop viewport lock (no page scroll)
- Finance blur/redaction in demo mode
- fiogiuseppe.com visual identity (cream/black/blue)
- North Star only on Board view
- Provider-independent AI layer

### 5. Do not change UI unless asked

- Documentation-only tasks should not touch `app/page.tsx` or styles.
- UI changes require explicit user request and Playwright verification.

---

## Quality Gate (Before Every Commit)

Run the full check:

```bash
npm run quality:check
```

This runs: typecheck → Playwright (40 tests) → production build.

Fix every failure before committing. Do not skip hooks.

---

## Documentation Updates

Update docs in the **same commit** as code changes when:

| Change type | Update |
|-------------|--------|
| New module or engine | `01_CURRENT_STATUS.md`, `INTELLIGENCE_FOUNDATION.md` |
| Architecture decision | `03_DECISIONS_LOG.md` |
| Completed priority | `02_NEXT_STEPS.md` (check off item) |
| Version milestone | `00_PROJECT_STATE.md`, `ROADMAP.md` |
| Any status change | `01_CURRENT_STATUS.md` |

---

## Commit and Push

- Commit only when the user asks, or when the task explicitly includes commit/push.
- Write concise commit messages focused on **why**, not just what.
- Push to `main` after commit (Vercel auto-deploys).
- Never force-push to `main`.
- Never commit secrets (`.env`, API keys).

---

## What Cursor Should NOT Do

- Rely only on conversation memory — always read repo docs first
- Add features not in `02_NEXT_STEPS.md` without user approval
- Create empty commits or over-engineer abstractions
- Add tests that trivially assert the obvious
- Update README/docs the user did not ask for (unless architecture changed)
- Deploy without user request

---

## After Every Major Release

Generate a design review PDF:

```bash
npm run design:review
```

Commit the output to `docs/reviews/DESIGN_REVIEW_<version>.pdf` and update `docs/reviews/README.md`.

---

## Task Completion Checklist

- [ ] Read project memory docs at session start
- [ ] Implemented one focused change
- [ ] `npm run quality:check` passes
- [ ] Updated relevant docs (`01`, `02`, or `03` as needed)
- [ ] Committed with clear message (if requested)
- [ ] Pushed to `main` (if requested)

---

## Key File Map

```
app/page.tsx              → Dashboard UI (client-side engines today)
app/api/brain/route.ts    → Brain API entry point
lib/brain/                → Executive Brain, context, providers, memory
lib/reality/              → Reality layer stubs
engine/                   → Decision, awareness, potential engines
memory/                   → giuseppe_brain.json, working/long-term memory
e2e/                      → Playwright tests (40 tests)
docs/00_* – 04_*          → Project memory (start here)
docs/INTELLIGENCE_FOUNDATION.md → v1.0 pipeline spec
```
