# Giuseppe OS — Design DNA

**Status:** Permanent design language. Higher priority than temporary UI experiments.  
**Purpose:** Define how Giuseppe OS looks, feels, and behaves — independent of any single release.

---

## Visual Philosophy

Giuseppe OS is inspired by **[fiogiuseppe.com](https://fiogiuseppe.com)**.

The aesthetic is:

- **Calm** — no visual noise, no urgency theater
- **Editorial** — typography and hierarchy lead; decoration follows
- **Timeless** — avoid trends that will date the interface
- **Elegant** — restraint over ornament
- **Minimal** — every element must earn its place

### Color and type

| Token | Value | Role |
|-------|-------|------|
| Cream background | `#f7f5e8` | Primary surface |
| Black | `#000000` | Text, structure |
| Blue accent | `#001fff` | Focus, action, glow |
| Typeface | Helvetica / system sans | Editorial clarity |

### Cards and hierarchy

- **Kickers** (small caps labels) precede headlines — never the reverse.
- **One hero element** per screen — the answer to the primary question.
- **Glow** (`card-glow`) is reserved for the most important element on a screen.
- Sensitive numbers use `privacy-blur` or explicit redaction.

---

## Interaction Philosophy

### Progressive disclosure

The system always knows more than it shows. Default views are sparse. Depth is revealed only when the user requests it.

Rules:

- Show the answer to the primary question first.
- Hide secondary intelligence behind disclosure triggers.
- Never dump counsellor voices, memory, finance detail, or evidence on arrival.
- Accordions and panels render content **only when open**.

### One primary action per screen

Each screen offers one clear next step — not a menu of equal-weight options competing for attention.

### One primary question per screen

If you cannot state the screen's question in one sentence, the screen is doing too much.

### Reduce visible information by default

Giuseppe OS is a companion, not a dashboard. The user should feel oriented in seconds, not buried in data.

---

## Layout

### Desktop first

Design for the primary desktop experience. Mobile must remain usable, but desktop is the reference viewport.

### No full-page scrolling

On desktop main sections, the page body does not scroll. Content fits the viewport or scrolls **internally** within a bounded region.

### CSS Grid where appropriate

Use grid for structured layouts (board cards, project ecosystem, memory palace). Avoid layout hacks that fight the viewport lock.

### Internal scrolling only when necessary

If content exceeds the viewport, contain overflow inside `.view-body` or equivalent — never break the calm frame with page-level scroll.

---

## Motion

Motion in Giuseppe OS is:

- **Smooth** — eased transitions, no jarring jumps
- **Quiet** — motion supports comprehension, not spectacle
- **Purposeful** — every animation has a reason (open panel, focus shift, state change)
- **Never flashy** — no bounce, no parallax, no celebration confetti

---

## Navigation

Navigation represents **Giuseppe's daily journey** — not software modules.

### Primary journey

| Nav | Role | Primary question |
|-----|------|------------------|
| **TODAY** | Landing page — daily companion | What is the best thing I can do today to become who I chose to become? |
| **PROJECTS** | Creative energy allocation | Where should my creative energy go right now? |
| **FINANCE** | Freedom cockpit | Am I building freedom or buying status? |
| **AWARENESS** | Quiet discovery | What pattern am I missing? |
| **BECOMING** | Identity and memory | Who am I choosing to become? |

**Today is the landing page.** The user opens Giuseppe OS and immediately sees the best step for today — not a grid of widgets.

The top navigation must feel similar to Apple's desktop apps: **minimal, calm, elegant, always visible**. Giuseppe brand mark on the left. No sidebar.

### Repository truth

Navigation labels and section grouping in the live app may evolve between releases. For the **current** UI implementation, always read [`docs/01_CURRENT_STATUS.md`](01_CURRENT_STATUS.md). This document defines the **design intent**; current status defines **what is shipped**.

---

## Mental Spaces

Each navigation area has a distinct mental role and layout rhythm (v1.2+). Do not flatten all sections into the same card grid. Preserve the feeling that the user is entering a different room.

| Space | Feeling |
|-------|---------|
| Today | Warm companion — focus, clarity, one step |
| Projects | Creative workshop — energy and ecosystem |
| Finance | Cockpit — freedom metrics, privacy by default |
| Awareness | Quiet discovery — insight without alarm |
| Becoming | Memory palace — identity, patterns, north star |

---

## Non-Regression Design Rules

These are tested and must not break without explicit intent:

- Footer manifesto remains visible across navigation
- Finance sensitive values blurred or hidden in demo
- North Star appears only in its designated context (see current status for view rules)
- Portfolio visual identity: cream / black / blue / Helvetica
- Progressive disclosure: collapsed panels do not leak content to the DOM

---

## Design Decision Test

Before any UI change, ask:

1. Does this reduce cognitive load by default?
2. Does this answer one primary question?
3. Does this reveal depth only when requested?
4. Does this feel calm, editorial, and timeless?
5. Does this help Giuseppe become who he chose to become?

If any answer is no, rethink the design.

---

## Related Documents

- [`docs/PRODUCT_CONSTITUTION.md`](PRODUCT_CONSTITUTION.md) — product philosophy
- [`docs/01_CURRENT_STATUS.md`](01_CURRENT_STATUS.md) — current UI state
- [`docs/reviews/README.md`](reviews/README.md) — design review PDFs per release
