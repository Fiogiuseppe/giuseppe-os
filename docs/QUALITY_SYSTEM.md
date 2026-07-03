# Giuseppe OS — Quality System

**Version:** 0.4.1 (Quality Loop)  
**Status:** Required gate before every deployment  
**Owner:** Giuseppe  

Giuseppe OS improves by becoming wiser, not bigger. This document defines how quality is measured, enforced, and preserved as the system evolves.

Every future feature must pass the quality loop (`npm run quality:check`) before deployment.

---

## 1. Purpose

The Quality System exists to protect three things:

1. **Clarity** — Giuseppe can read, navigate, and act without friction.
2. **Identity** — The product feels like Giuseppe OS, not a generic productivity app.
3. **Integrity** — Implementation stays aligned with architecture, constitution, and memory.

Quality is not polish for its own sake. It is the discipline that keeps the system trustworthy.

---

## 2. Quality Dimensions

### 2.1 Readability

- Copy must be direct, personal, and specific to Giuseppe.
- Sentences should be scannable. No dense blocks without hierarchy.
- Italian and English may coexist where intentional; mixed language must not confuse.
- Avoid corporate tone, motivational clichés, and empty affirmations.

**Fail examples:** "Welcome to your dashboard", "Maximize your potential", "Click here to get started".

### 2.2 Visual Hierarchy

- Every main view must have a clear primary heading (`.h1` or `.potential-h1`).
- Kickers (`.kicker`) label context before headlines.
- Cards (`.card`, `.potential-card`) group related content — not isolated fragments.
- The logo and navigation remain the top anchor on every view.

### 2.3 Navigation

- All primary sections must be reachable from the top nav without reload.
- Exactly one nav item is active per view.
- Navigation order reflects mental model: orientation → awareness → action → intelligence → systems → memory.

Current sections: Board, Awareness, Today, Potential, Projects, Finance, Brain.

### 2.4 Accessibility

- Landmarks: `header`, `nav`, `main`, `footer`.
- Interactive controls are real `button` elements with visible labels.
- Form inputs have associated labels or placeholders that describe intent.
- Focusable elements remain usable without mouse-only interactions.

### 2.5 Responsiveness

- Layout must not break at mobile widths (≤ 900px).
- Navigation remains reachable and readable on small screens.
- Primary headings remain visible without horizontal scroll.
- Grids collapse to single column without overlapping content.

### 2.6 Broken UI States

- No view may render an empty `main` after navigation.
- No duplicate active navigation states.
- Decision board must produce output when submitted — never a silent failure.
- Engines must always return complete structured output (insight, action, confidence).

### 2.7 Duplicated Content

- North Star appears as the Board hero — not repeated across every view.
- Footer manifesto is global and consistent — not re-stated in body copy.
- Engine output must not repeat the same sentence in multiple fields without purpose.

### 2.8 Copy Quality (Anti-Generic)

- Copy must reference Giuseppe's mission, projects, patterns, or values — not abstract "users".
- Recommendations must be actionable in one sitting (minutes to hours, not vague "consider").
- If text could belong to any productivity app, it fails quality review.

### 2.9 Visual Identity Consistency

Giuseppe OS visual identity is fixed unless deliberately revised:

| Element | Rule |
|---------|------|
| Background | `#f5f1e8` (warm paper) |
| Text | `#111` (near-black) |
| Accent surface | `#e6ded0` (card background) |
| Borders | `1.5px solid #111` |
| Typography | Arial/Helvetica, heavy weight for headlines |
| Footer | Centered manifesto at ~65% opacity, quiet tone |

No gradients, no glassmorphism, no dashboard chrome, no third-party design system look.

### 2.10 Architecture Consistency

Implementation must align with:

- `docs/GIUSEPPE_OS_ARCHITECTURE.md` — system structure and engines
- `docs/CONSTITUTION.md` — non-negotiable principles
- `memory/giuseppe_brain.json` — live identity and memory

**Architectural checks:**

- North Star and Mission 2036 in UI match memory and constitution.
- Engines are rule-based and memory-grounded until AI integration is deliberate.
- New features trace to an architecture section — not orphan UI.
- Footer manifesto matches architecture philosophy: *remembers who you chose to become*.

---

## 3. Automated Quality Gate

Run before every commit that touches product code:

```bash
npm run quality:check
```

This executes:

1. **TypeScript** (`tsc --noEmit`) — type safety across app and engines
2. **Playwright e2e** — navigation, UX, engines, and quality-specific checks

### Quality Test Suite (`e2e/quality.spec.ts`)

Automated UX verification covers:

- All main sections reachable
- Primary headings present on every view
- Footer manifesto visible across navigation
- Decision form submission works
- Awareness section works when present
- No page crashes during full navigation cycle
- Accessibility landmarks present
- Mobile viewport usability
- Visual identity tokens preserved
- Architecture-aligned North Star on Board
- No generic placeholder copy
- Single active navigation state

---

## 4. Human Review (Release Checklist)

Automation catches regressions. Human review catches wisdom.

Before deployment, complete `docs/RELEASE_CHECKLIST.md`.

---

## 5. Quality Over Features

When a feature fails quality review:

1. Do not deploy.
2. Fix or simplify until green.
3. Update docs if architecture changed.
4. Re-run `npm run quality:check`.

Giuseppe OS v0.4.1 establishes this loop. Every version after must inherit it.

---

## 6. Version History

| Version | Change |
|---------|--------|
| 0.4.1 | Quality System, `quality:check` script, Playwright quality suite, Release Checklist |
