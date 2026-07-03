# Giuseppe OS — Release Checklist

Complete this checklist before every deployment. All items must be **yes** unless explicitly deferred and documented.

---

## Wisdom & Scope

- [ ] **Does this make Giuseppe OS wiser or only bigger?**  
  The change should improve judgment, memory, or alignment — not add surface area.

- [ ] **Does it stay personalized to Giuseppe?**  
  Copy, recommendations, and memory references must not read like a generic app.

- [ ] **Does it reduce cognitive load?**  
  Giuseppe should need fewer decisions, not more UI to understand.

## Identity & Quality

- [ ] **Does it preserve the visual identity?**  
  Warm paper background, bold borders, minimal layout, quiet footer — no dashboard drift.

- [ ] **Does it pass all tests?**  
  `npm run quality:check` exits green (TypeScript + Playwright).

## Documentation

- [ ] **Does it update documentation if architecture changes?**  
  Revise `docs/GIUSEPPE_OS_ARCHITECTURE.md` and related docs when structure or principles shift.

---

## Pre-Deploy Command

```bash
npm run quality:check
```

**Deploy only when green and all boxes above are checked.**
