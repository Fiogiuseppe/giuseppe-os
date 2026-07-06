# Phase 16 — Instagram Scope Strategy Report

**Date:** 2026-07-06  
**Status:** Complete  
**Branch:** `main`  
**Report author:** Cursor agent session

---

## Summary

Phase 16 defines the **Instagram data scope strategy** in four levels before any OAuth or Meta API implementation. **Level 1 (profile + media) is the implementation target for Phase 17+.** Levels 2–3 are documented and deferred; Level 4 (messaging) is excluded. Documentation only — no code, tokens, or API calls.

---

## Deliverable

[`docs/architecture/instagram-scope-strategy.md`](../architecture/instagram-scope-strategy.md)

| Section | Content |
|---------|---------|
| Four levels | Profile/media, engagement, insights, messaging |
| Level 1 plan | Exact fields to sync first |
| Deferred levels | What, why, fallback behavior |
| Scopes | Permissions to verify — not assumed |
| Risks | Privacy and App Review |
| Normalization | `InstagramProfileNormalized`, `InstagramMediaNormalized` |
| Evidence → Knowledge | Pipeline alignment with existing sources |
| Dual sources | `instagram_personal` + `instagram_urees` |

---

## Recommendation (locked for Phase 17+)

1. **Implement Level 1 first** — read-only profile and owned media
2. **Do not implement DMs** (Level 4)
3. **Do not request publishing permissions**
4. **Request minimum read scopes** for Level 1 only

---

## Files created / updated

| Path | Change |
|------|--------|
| `docs/architecture/instagram-scope-strategy.md` | **New** |
| `docs/reports/phase-16-report.md` | **New** |
| `docs/setup/instagram.md` | Link to scope strategy; Phase 17 gate for OAuth |
| `docs/roadmap/master-roadmap.md` | Phase 16 complete |
| `docs/roadmap/next-phase.md` | Phase 17 pointer |
| `docs/changelog/CHANGELOG.md` | 0.16.0 entry |

---

## Acceptance criteria

| # | Criterion | Status |
|---|-----------|--------|
| 1 | Clear Level 1 implementation plan | ✅ |
| 2 | Advanced features documented but deferred | ✅ |
| 3 | No real OAuth code | ✅ |
| 4 | No Meta API calls | ✅ |
| 5 | No secrets added | ✅ |
| 6 | `tsc` + `build` pass | ✅ |

---

## Verification

```bash
npx tsc --noEmit
npm run build
```

Documentation-only phase — no new e2e tests.

---

## What is NOT in Phase 16

- Instagram OAuth provider adapter
- Meta Graph API client
- Connector or sync code
- Knowledge extractor implementation

---

## Next phase (not started)

**Phase 17** — Instagram OAuth provider + Level 1 connector (requires setup checklist + Giuseppe approval).

---

## Related

- [`instagram-scope-strategy.md`](../architecture/instagram-scope-strategy.md)
- [`docs/setup/instagram.md`](../setup/instagram.md)
- [`ADR-015-instagram-preparation.md`](../decisions/ADR-015-instagram-preparation.md)

---

*Phase 16 complete. Stop here — do not start Instagram OAuth implementation.*
