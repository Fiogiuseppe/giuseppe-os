# Phase [NN] — [Phase Title] Implementation Report

**Date:** YYYY-MM-DD  
**Status:** Complete | In Progress | Blocked  
**Branch:** `branch-name`  
**Report author:** [Name or agent session]

---

## Summary

[2–4 sentences: what shipped, why it matters, what is still mock vs real.]

---

## Objectives

| # | Objective | Met? |
|---|-----------|------|
| 1 | [Objective from phase spec] | Yes / No / Partial |
| 2 | … | … |

---

## Files Created

| Path | Purpose |
|------|---------|
| `path/to/file` | … |

---

## Files Modified

| Path | Change |
|------|--------|
| `path/to/file` | … |

---

## Folder Structure

```
[Relevant tree — new or changed areas only]
```

---

## Database Changes

| Migration | Tables / columns | Notes |
|-----------|------------------|-------|
| `supabase/migrations/…` | … | Applied / pending |

*If none: "No database changes in this phase."*

---

## API Routes

| Method | Route | Behavior |
|--------|-------|----------|
| `GET` | `/api/…` | … |

*If none: "No new API routes."*

---

## Components

| Component | Change |
|-----------|--------|
| `ComponentName` | Created / Updated — … |

*If none: "No UI components changed."*

---

## Services

| Service / module | Role |
|------------------|------|
| `module/name` | … |

---

## Security Decisions

1. …
2. …

| Risk | Level | Mitigation |
|------|-------|------------|
| … | Low / Medium / High | … |

---

## Performance Notes

[Latency, caching, rate limits, bundle impact — or "Not applicable for this phase."]

---

## Tests Executed

| Command | Result |
|---------|--------|
| `npx tsc --noEmit` | Pass / Fail |
| `npm run build` | Pass / Fail |
| `npx playwright test …` | X/Y passed |

### Coverage summary

- [What behaviors were validated]

---

## Build Result

```
[Paste relevant build output or summary]
```

---

## TypeScript Result

```
npx tsc --noEmit — Pass / Fail
```

[Notes on any exclusions or deferred type fixes]

---

## Known Limitations

1. …
2. …

---

## Future Improvements

[Non-blocking improvements discovered during implementation]

---

## Next Recommended Phase

**Phase [NN+1] — [Title]**

1. …
2. …
3. …

---

## Related documentation

- ADR: [`../decisions/ADR-XXX.md`](../decisions/ADR-XXX.md) *(if any)*
- Roadmap: [`../roadmap/master-roadmap.md`](../roadmap/master-roadmap.md)
- Architecture: [`../architecture/…`](../architecture/)

---

*Report generated per [`REPORT_TEMPLATE.md`](REPORT_TEMPLATE.md). No phase is complete without a report.*
