# Instagram Scope Strategy

**Status:** Phase 16 strategy + Meta setup findings (2026-07-06). **Business asset verification in progress** — no provider code.  
**Purpose:** Define exactly what Giuseppe OS will sync from Instagram before OAuth implementation.

**Sources covered:** `instagram_personal` (@fiogiuseppe, **Creator**), `instagram_urees` (@urees__, **Business**)

---

## Current Meta Setup Status — 2026-07-06

Documentation of Giuseppe’s live Meta configuration. **No App ID, App Secret, or tokens in this file.**

| Item | Value |
|------|-------|
| Meta App | **GIUSEPPE OS** / **GIUSEPPE OS Sources** |
| App ID | Stored locally in `.env.local` — not in git or docs |
| App Secret | Stored locally in `.env.local` — never in docs |
| `instagram_personal` | @fiogiuseppe — **Creator** |
| `instagram_urees` | @urees__ — **Business** |
| Use case selected in Meta | *Administrar mensajes y contenido en Instagram* |

### Permissions visible in Meta (2026-07-06)

| Permission | Giuseppe OS plan |
|------------|------------------|
| `instagram_business_basic` | **Level 1** — profile + owned media |
| `instagram_business_manage_comments` | **Defer (Level 2)** — visible but not implemented |
| `instagram_business_manage_messages` | **Do not implement (Level 4)** — no DM sync |

**Implementation target remains Level 1 read-only:** profile, media, captions, timestamps, permalinks, media type.

**Hard rules (unchanged):**

- No DM sync
- No publishing
- No Graph API Explorer tokens
- OAuth only through Giuseppe OS → Token Vault (ADR-013, ADR-014)

Setup details and manual checklist: [`docs/setup/instagram.md`](../setup/instagram.md).

---

## Current blocker

Meta returned **“Rol de desarrollador insuficiente”** during Instagram account authorization.

**Interpretation:** The Instagram business asset is likely not assigned to the Meta App / Business Portfolio yet — not a code defect (no OAuth provider exists).

**Required before Phase 17:** In Meta Business Settings → **Accounts** → **Instagram accounts**, confirm @fiogiuseppe and @urees__ are linked to the business assets used by **GIUSEPPE OS Sources**. See setup guide § Current blocker.

---

## Principles

| Principle | Rule |
|-----------|------|
| Read-only | Ingest owned media and metadata — never publish |
| Level 1 first | Ship profile + media before engagement or insights |
| Minimum scopes | Request only what Level 1 needs at first implementation |
| Progressive disclosure | System may know more than it shows; APIs return safe metadata |
| Silence over weak data | If a permission is denied, sync succeeds with fewer fields — no fabrication |
| No DMs | Level 4 is out of scope indefinitely unless product constitution changes |
| Constitution | Better decisions over decades — not maximum data extraction |

---

## Four implementation levels

```
Level 1 — Profile + Media     ← IMPLEMENT FIRST (Phase 17+)
Level 2 — Engagement          ← DEFER
Level 3 — Insights            ← DEFER
Level 4 — Messaging           ← DO NOT IMPLEMENT
```

---

## Level 1 — Read-only profile + media (implement first)

### What we sync

| Domain | Fields | Notes |
|--------|--------|-------|
| **Profile** | `id`, `username`, `name` (if API provides) | Stable account identity |
| **Profile** | `biography` | If officially available on connected account |
| **Profile** | `profile_picture_url` | Store URL reference only — not binary download in v1 unless required |
| **Profile** | `followers_count`, `follows_count`, `media_count` | Basic counts **if** returned without extra insights scopes |
| **Media list** | Paginated owned media IDs | Cursor-based incremental sync |
| **Media item** | `id`, `media_type` | `IMAGE`, `VIDEO`, `CAROUSEL_ALBUM`, etc. |
| **Media item** | `caption` | Full text for knowledge extraction |
| **Media item** | `hashtags` | Parsed from caption + API fields if separate |
| **Media item** | `timestamp` | ISO publish time |
| **Media item** | `permalink` | Public URL — required for evidence |
| **Media item** | `like_count`, `comments_count` | **Only if** included in standard media node without Level 2/3 scopes |

### What we defer from Level 1

| Deferred | Why |
|----------|-----|
| Comment bodies | Level 2 — separate scope and App Review |
| Insights metrics | Level 3 — insights permissions |
| Story ephemeral content | Often separate API surface; defer until Level 1 stable |
| Tagged media not owned | Not Giuseppe/UREES content |
| User-generated content on others’ posts | Privacy boundary |

### Level 1 OAuth scopes to verify (names may change)

**Meta dashboard today (2026-07-06)** shows `instagram_business_basic` plus higher-risk permissions (`instagram_business_manage_comments`, `instagram_business_manage_messages`). **Giuseppe OS must not implement comment or message APIs** because they appear in the dashboard — Level 1 only.

Verify against [Meta Instagram API docs](https://developers.facebook.com/docs/instagram-api/) before implementation:

| Scope / permission (verify) | Level 1 need |
|----------------------------|--------------|
| `instagram_business_basic` | Profile + media read — **visible in Meta** |
| `instagram_basic` or successor | Same intent — verify canonical name at OAuth |
| `pages_show_list` | Discover linked Facebook Page |
| `pages_read_engagement` | **Verify** — may be required for media counts; request only if mandatory |

**Visible in Meta but deferred / excluded:**

| Scope | Plan |
|-------|------|
| `instagram_business_manage_comments` | Level 2 — defer |
| `instagram_business_manage_messages` | Level 4 — do not implement |

**Do not request at Level 1:**

- `instagram_content_publish` — publishing out of scope
- `instagram_manage_insights` — Level 3
- Any ads or marketing API permissions

---

## Level 2 — Engagement (deferred)

### What we would sync (later)

| Field | Notes |
|-------|-------|
| Comments on **owned** media | Text, author username (if API exposes), timestamp |
| `comments_count` | If not already in Level 1 |
| Replies / threaded comments | **Only if** officially available in API response |
| Comment like counts | If available without extra review |

### Why defer

- Requires additional permissions (e.g. comment read/manage scopes — **verify names**)
- Higher App Review scrutiny
- Moderation and PII surface area (commenter identities)
- Level 1 already supports Brain answers from captions and permalinks

### Fallback if denied

- `connectionStatus` remains `connected`
- `healthNote` explains: “Comments not authorized — posts and captions still sync”
- Knowledge extractor skips comment-derived facts; no errors thrown to UI

---

## Level 3 — Insights (deferred)

### What we would sync (later)

| Metric | Use |
|--------|-----|
| Reach | Content performance trends |
| Impressions | Distribution |
| Saves | Content resonance |
| Engagement rate aggregates | Decision intelligence on what works |
| Profile insights | Follower growth, demographics **if** API grants and Giuseppe approves |

### Why defer

- Insights permissions often require App Review and Business verification
- Metrics change API shape frequently
- Not required for evidence-backed answers about *what* was posted
- Risk of over-collecting analytics Giuseppe does not need for decisions

### Fallback if denied

- Sync Level 1 (and Level 2 if granted) without metrics fields
- Store `insightsAvailable: false` in internal normalized record — **not** exposed raw to frontend
- Brain Summary may note “engagement metrics unavailable for this source”

---

## Level 4 — Messaging (do not implement)

### Includes (all excluded)

- Direct messages (DMs)
- Story replies as private messages
- Private conversations
- Inbox APIs

### Why excluded

| Risk | Detail |
|------|--------|
| Privacy | Highest-sensitivity personal data |
| Product fit | Giuseppe OS is decision intelligence, not a messaging client |
| Compliance | Retention, consent, and deletion obligations increase sharply |
| Security | Broader attack surface; tokens with message read are high value |
| Constitution | “Silence over weak advice” — DMs rarely improve *decision quality* vs. cost |

**No Phase plans Level 4 unless Giuseppe explicitly revises product constitution.**

---

## Privacy risks

| Risk | Mitigation |
|------|------------|
| Storing commenter PII (Level 2) | Defer; minimize fields; no public API exposure |
| Leaking tokens | Token Vault only (ADR-013); never frontend |
| Over-scoping OAuth | Level 1 minimum scopes; document in setup guide |
| Syncing non-owned media | Filter to `instagram_user_id` matching connected account |
| Raw API payloads in UI | Pipeline stores raw server-side; Intelligence/Brain use safe knowledge metadata |
| DM access (Level 4) | Not implemented |

---

## App Review risks

| Level | Review likelihood | Notes |
|-------|-------------------|-------|
| Level 1 | Lower — standard business use | Still requires Professional account + valid Meta App |
| Level 2 | Medium | Comment read often needs justification and screencast |
| Level 3 | Higher | Insights frequently gated |
| Level 4 | Highest | Messaging permissions — avoid |

**Strategy:** Ship Level 1 with the narrowest working scope set. Submit App Review for Level 2/3 only after Giuseppe approves and product need is documented.

---

## Fallback behavior (permission denied)

| Scenario | System behavior |
|----------|-----------------|
| Media read granted, insights denied | Sync posts; omit metrics columns |
| Comments denied | Sync captions/hashtags; `dataCollectionEnabled` reflects actual grants |
| Token expired | `getValidTokenBundle` returns null; sync skipped; health `needs_auth` |
| Partial media page failure | Sync run `partial`; log error code server-side; no token in logs |
| Account not Professional | Connect fails with clear `healthNote`; link to setup guide |
| App Review pending | Source stays `connected` but sync returns `skipped` with honest note |

Never invent counts, comments, or insights when API did not return them.

---

## Normalized fields (Giuseppe OS internal)

Level 1 normalized item shape (conceptual — implementation in Phase 17+):

### `InstagramProfileNormalized`

| Field | Type | Level |
|-------|------|-------|
| `sourceId` | `instagram_personal` \| `instagram_urees` | 1 |
| `owner` | `giuseppe` \| `urees` | 1 |
| `instagramUserId` | string | 1 |
| `username` | string | 1 |
| `displayName` | string \| null | 1 |
| `biography` | string \| null | 1 |
| `profilePictureUrl` | string \| null | 1 |
| `followersCount` | number \| null | 1 |
| `followsCount` | number \| null | 1 |
| `mediaCount` | number \| null | 1 |
| `fetchedAt` | ISO string | 1 |

### `InstagramMediaNormalized`

| Field | Type | Level |
|-------|------|-------|
| `sourceId` | string | 1 |
| `owner` | string | 1 |
| `mediaId` | string | 1 |
| `mediaType` | enum | 1 |
| `caption` | string \| null | 1 |
| `hashtags` | string[] | 1 |
| `publishedAt` | ISO string | 1 |
| `permalink` | string | 1 |
| `likeCount` | number \| null | 1 |
| `commentsCount` | number \| null | 1 |
| `thumbnailUrl` | string \| null | 1 |
| `syncCursor` | string \| null | 1 |

### Level 2 additions (deferred)

`InstagramCommentNormalized`: `commentId`, `mediaId`, `text`, `username`, `publishedAt`, `parentCommentId?`

### Level 3 additions (deferred)

`InstagramMediaInsightsNormalized`: `mediaId`, `reach`, `impressions`, `saves`, `engagement`, `period`

---

## Evidence layer

Each `InstagramMediaNormalized` row produces one **evidence item**:

| Evidence field | Source |
|----------------|--------|
| `sourceId` | `instagram_personal` or `instagram_urees` |
| `sourceType` | `social` |
| `url` | `permalink` |
| `title` | First line of caption or `{mediaType} post` |
| `summary` | Caption (trimmed) + hashtags |
| `publishedAt` | `publishedAt` |
| `attribution` | `instagram:@{username}/{mediaId}` |
| `contentHash` | Hash of `mediaId` + `caption` + `publishedAt` |

Deduplication: same `mediaId` + unchanged `contentHash` → skip re-write (same pattern as website/medium connectors).

---

## Knowledge extraction

Rule-based extractor (no LLM) — aligned with existing `website-knowledge.extractor.ts` pattern:

| Input signal | `knowledgeType` | Example label |
|--------------|-----------------|---------------|
| Caption mentions UREES | `brand` | UREES |
| Hashtag `#urees` | `brand` | UREES |
| Project/collection names in caption | `project` | From caption keywords |
| Personal creative themes | `topic` | Art, poetry, branding |
| `@fiogiuseppe` personal posts | `topic` / `project` | Context-dependent rules |

| Knowledge field | Value |
|-----------------|-------|
| `owner` | `giuseppe` for `instagram_personal`; `urees` for `instagram_urees` |
| `sourceId` | Matching source |
| `sourceType` | `social` |
| `evidenceUrls` | Post permalinks |
| `confidence` | 0.7–0.95 based on match strength |
| `status` | `active` when evidence-backed |

**Rule:** No evidence → no knowledge. Hashtags and captions are evidence text — not invented summaries.

Brain Answer and Brain Summary read via Intelligence Read — same as website and Medium.

---

## Dual-source support

| Source ID | Owner | Group | Account | Level 1 scope |
|-----------|-------|-------|---------|---------------|
| `instagram_personal` | `giuseppe` | personal | @fiogiuseppe | Same adapter, different `sourceId` + token |
| `instagram_urees` | `urees` | urees | @urees__ | Same adapter, different `sourceId` + token |

**One Instagram OAuth provider adapter** registers both source IDs (like test provider today). Each source has:

- Separate Token Vault entry (keyed by `sourceId`)
- Separate connection state and sync cursor
- Separate knowledge `owner` namespace
- Shared normalization and extraction code

UREES Instagram knowledge must not merge into `giuseppe` owner queries unless Brain explicitly aggregates by topic.

---

## Level 1 implementation plan (Phase 17+)

**Prerequisite (Phase 16.5):** Clear Meta business asset blocker — see **Current blocker** above and [`docs/setup/instagram.md`](../setup/instagram.md).

Documentation only here — execution is **not** Phase 16 or 16.5.

1. Complete business asset verification + remaining items in setup readiness checklist
2. Register `instagram` OAuth provider adapter (replace test provider in production)
3. Implement connector: Graph API fetch profile + media pages
4. Normalize to `InstagramProfileNormalized` + `InstagramMediaNormalized`
5. Persist raw → normalized → evidence (existing data-sources pipeline)
6. Add `instagram-knowledge.extractor.ts` (rule-based)
7. Wire `extractKnowledgeFromEvidence` after sync
8. E2e with mocked Graph responses — **no live Meta calls in CI**
9. Update `source-config` `dataCollected` to reflect Level 1 only until Level 2 ships

---

## What we sync now vs defer (summary)

| Level | Status | Sync |
|-------|--------|------|
| **1** Profile + media | **Plan to implement first** | Username, bio, media, captions, hashtags, timestamps, permalinks, basic counts |
| **2** Engagement | Defer | Comments, replies |
| **3** Insights | Defer | Reach, impressions, saves, profile insights |
| **4** Messaging | **Do not implement** | DMs, story replies, private chats |

---

## Related

- Setup: [`docs/setup/instagram.md`](../setup/instagram.md)
- OAuth: [`oauth.md`](oauth.md)
- Knowledge: [`knowledge.md`](knowledge.md)
- ADR-015: [`../decisions/ADR-015-instagram-preparation.md`](../decisions/ADR-015-instagram-preparation.md)
- Report: [`../reports/phase-16-report.md`](../reports/phase-16-report.md)
- Meta status: [`../reports/phase-16-5-instagram-meta-status-report.md`](../reports/phase-16-5-instagram-meta-status-report.md)

---

*Last updated: 2026-07-06 — Meta App created; business asset verification blocker; no OAuth or Meta API code.*
