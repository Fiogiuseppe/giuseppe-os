# Giuseppe OS — Cursor Startup

**Status:** Mandatory for every new Cursor session.  
**Principle:** The repository is the source of truth. The conversation is temporary.

If anything in the current conversation contradicts the Constitution documents, **stop and ask Giuseppe for confirmation** before violating it.

---

## Session Start (Required — Before Any Implementation)

Before writing, editing, or running implementation code, read these documents **in order**:

| # | Document | Purpose |
|---|----------|---------|
| 1 | [`docs/PRODUCT_CONSTITUTION.md`](PRODUCT_CONSTITUTION.md) | What Giuseppe OS is and how product decisions are judged |
| 2 | [`docs/ENGINEERING_CONSTITUTION.md`](ENGINEERING_CONSTITUTION.md) | How code is written, tested, and committed |
| 3 | [`docs/DESIGN_DNA.md`](DESIGN_DNA.md) | Permanent design language and interaction rules |
| 4 | [`docs/00_PROJECT_STATE.md`](00_PROJECT_STATE.md) | Vision, architecture, North Star |
| 5 | [`docs/01_CURRENT_STATUS.md`](01_CURRENT_STATUS.md) | What exists right now — live UI, engines, tests |
| 6 | [`docs/02_NEXT_STEPS.md`](02_NEXT_STEPS.md) | Current roadmap and priorities |

### Then understand

- **Architecture** — Executive Brain spine, engines, memory, API (`docs/GIUSEPPE_OS_ARCHITECTURE.md` if needed)
- **Design philosophy** — companion not dashboard, progressive disclosure, one question per screen
- **Current roadmap** — what is done, what is next, what must not regress

**Only after reading these documents should implementation begin.**

### Additional reading (when relevant)

| Task touches… | Also read |
|---------------|-----------|
| Architecture decisions | [`docs/03_DECISIONS_LOG.md`](03_DECISIONS_LOG.md) |
| Brain pipeline details | [`docs/INTELLIGENCE_FOUNDATION.md`](INTELLIGENCE_FOUNDATION.md) |
| Release or deploy | [`docs/RELEASE_CHECKLIST.md`](RELEASE_CHECKLIST.md) |
| Detailed workflow | [`docs/04_CURSOR_WORKFLOW.md`](04_CURSOR_WORKFLOW.md) |

---

## Mandatory Quality Loop

Every implementation follows this sequence. **No shortcuts.**

```
Read Constitution
        ↓
Understand Current State
        ↓
Implement
        ↓
Run Tests
        ↓
Fix
        ↓
Generate Design Review PDF  (major UI releases)
        ↓
Commit
        ↓
Push                      (when requested)
```

### Commands

```bash
# Full quality gate — required before every commit
npm run quality:check

# Design review PDF — required for major UI releases
npm run design:review
```

### Fix before commit

If typecheck, Playwright, or build fails — fix it. Do not commit broken code. Do not skip hooks.

---

## Implementation Guardrails

### Do

- Read the repo before guessing
- Minimize diff scope
- Match existing conventions
- Update docs when architecture or status changes
- Ask Giuseppe if a request contradicts the Constitution

### Do not

- Rely on conversation memory instead of repository files
- Call AI providers directly from UI
- Expose secrets or sensitive personal data
- Turn Giuseppe OS into a generic chatbot or data dashboard
- Change the application when the task is documentation-only
- Bundle unrelated changes in one commit

---

## Final Rule — Mission Gate for Every Task

Before implementing any feature, change, or refactor, internally ask:

> **Does this implementation help Giuseppe become the person he chose to become?**

If the answer is **no**, rethink the implementation.

If the answer is unclear, read the Constitution again — then ask Giuseppe.

---

## Priority Order

When documents conflict, resolve in this order:

1. **Constitution documents** (this file, Product, Engineering, Design DNA)
2. **Current status and next steps** (`01_CURRENT_STATUS.md`, `02_NEXT_STEPS.md`)
3. **Architecture docs** (`GIUSEPPE_OS_ARCHITECTURE.md`, `INTELLIGENCE_FOUNDATION.md`)
4. **Conversation context** (lowest priority — temporary)

---

## Quick Reference

| Question | Where to look |
|----------|---------------|
| What is Giuseppe OS? | `PRODUCT_CONSTITUTION.md` |
| What must pass before commit? | `ENGINEERING_CONSTITUTION.md` |
| How should it look and feel? | `DESIGN_DNA.md` |
| What is live today? | `01_CURRENT_STATUS.md` |
| What should we build next? | `02_NEXT_STEPS.md` |
| How does the brain work? | `INTELLIGENCE_FOUNDATION.md` |
| What did we decide before? | `03_DECISIONS_LOG.md` |
