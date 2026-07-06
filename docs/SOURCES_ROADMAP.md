# Giuseppe OS — Sources Roadmap

Work one phase at a time. Do not jump ahead.

At the end of every phase, stop and report: what changed, files created/modified, what is real vs mock, tests passed, security risks, next recommended phase.

---

## PHASE 1 — Sources Dashboard ✅ (current)

Goal: Dashboard + provider registry. **6 sources only.** Personal + UREES. Mock status. No OAuth, API, or tokens.

## PHASE 2 — Sources Engine

Persistent connection state, sync logs, lastSyncAt, permissions, dataCollected, safe metadata API. No external APIs.

## PHASE 3 — Website Connector: fiogiuseppe.com

First real connector. Raw + normalized items. Public content only.

## PHASE 4 — Website Connector: UREES Website

Reusable generic website connector architecture.

## PHASE 5 — Medium Connector

RSS/feed-based. Public articles only.

## PHASE 6 — Normalization Layer

Unified evidence model. Raw retained for audit.

## PHASE 7 — Intelligence Read Layer

Query normalized evidence. Read-only. No AI conclusions.

## PHASE 8 — First AI Evidence Use

Answers cite evidence only. Silence when missing.

## PHASE 9 — OAuth Engine

Generic OAuth. No frontend tokens.

## PHASE 10 — Token Vault

Encrypted token storage server-side.

## PHASE 11 — Instagram Connectors

instagram_personal, instagram_urees via official APIs.

## PHASE 12 — LinkedIn Connector

Official API only. Honest permission gaps.

## PHASE 13 — Scheduled Sync

Cron, incremental sync, rate limits, retry.

---

**Principle:** Giuseppe OS learns only from real synchronized evidence. No fake data. No invented insights. One phase. One test. One stable release at a time.
