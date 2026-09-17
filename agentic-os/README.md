# COO Agentic Operating System

Operating infrastructure for the COO's seven accountability domains: property and facilities, fleet, IT, grants, finance support, operating procedures, and systems.

**Current phase:** Phase 0 — complete, awaiting sign-off.
**Nothing has been installed, configured, or connected.**

---

## Start here

**[`phase0/00-executive-summary.md`](phase0/00-executive-summary.md)** — six findings that change the directive, the recommended build, the pushback, and the three blocking questions.

## Phase 0 deliverables

| File | Directive deliverable |
|---|---|
| [`00-executive-summary.md`](phase0/00-executive-summary.md) | Findings, recommendation, blocking questions |
| [`01-architecture-decision.md`](phase0/01-architecture-decision.md) | (a) Architecture decision document |
| [`02-data-classification-map.md`](phase0/02-data-classification-map.md) | Data classification map |
| [`03-department-readiness-matrix.md`](phase0/03-department-readiness-matrix.md) | (b) Readiness matrix and rollout order |
| [`04-keep-reset-replace.md`](phase0/04-keep-reset-replace.md) | (c) Keep / reset / replace list |
| [`05-paperclip-decision.md`](phase0/05-paperclip-decision.md) | (d) Paperclip build-vs-adopt |
| [`06-model-tier-map.md`](phase0/06-model-tier-map.md) | (e) Initial model tier map |
| [`07-access-and-questions.md`](phase0/07-access-and-questions.md) | Access request, blocking questions |

---

## Headline decisions

| Layer | Decision |
|---|---|
| Management plane | Adopt Paperclip (MIT), control plane only, telemetry off, adversarial test before sign-off |
| Router | Keep LiteLLM; OpenRouter demoted to fallback |
| Agents | Thin custom on the Anthropic SDK, MCP tools, heartbeat to Paperclip |
| Knowledge | Hybrid index over the authoritative doc store — **blocked on Q1** |
| Memory | Graphiti self-hosted, Kùzu backend, Apache 2.0 |
| Workflows | Keep n8n, deterministic only — 32% of specified workflows should not call a model |
| Models | Haiku 4.5 / Sonnet 5 / Opus 5 — one provider, one egress path, one audit story |
| Resilience | 2 droplets + managed Postgres + Spaces; live restore test gates sign-off |

**Changed from the directive:** DeepSeek dropped (offshore audit surface not repaid by ~$8–15/mo saving). Fable 5.1 replaced by Opus 5 as strategic tier (half the price; Fable 5.1 cannot run under the required retention posture). No local GPU for Class C (BAA + HIPAA-ready configuration instead; $15–30k capex avoided).

**Estimated run rate:** $125–185/mo infrastructure, $50–250/mo models. Proposed initial hard cap: $450/mo.

---

## Rollout order

IT → Fleet → Procedures → Property & Facilities → Grants → Finance → Communications

Lowest-risk and highest-value first; finance and external communications last, per operating rule 9.

---

## Standing constraints

- **Data class first, then cost.** Tenant privacy is not a cost line item.
- **Class C payloads never enter the memory graph.** Memory holds de-identified durable facts and pointers into systems of record.
- **Class C fails closed.** No compliant model available means halt and notify, never degrade to a non-compliant path.
- **No agent holds payment credentials.** Ever.
- **The grants agent never submits.** The finance agent never executes payments.
- **Cite or flag.** An agent that cannot cite a source says so rather than guessing.
- **Two consecutive failures halts the workflow and notifies.** No silent retries.
- **This design channel never accepts resident or consumer information.** The system handles Class C under a BAA; this conversation does not.

---

## Phase sequence

| Phase | Contents | Status |
|---|---|---|
| 0 | Audit, architecture, sequencing, classification | **Complete — awaiting sign-off** |
| 1 | Foundation: harness, routing, caching, accounting, vault, logging, backups | Blocked on sign-off |
| 2 | Knowledge core | Blocked on Q1 |
| 3 | Memory layer + multi-session replay benchmark | — |
| 4 | Golden dataset, judge validated to 0.85+ agreement | — |
| 5 | Department agents, in rollout order | — |
| 6 | Executive services | — |
| 7 | MCP integrations | — |
| 8 | Self-improvement loop | — |
| 9 | Runbook and handoff | — |

Each phase ends with a working artifact, a test proving it works, and a rollback procedure. No phase advances without sign-off.
