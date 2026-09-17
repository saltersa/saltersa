# COO Agentic Operating System

Operating infrastructure for the COO's seven accountability domains: property and facilities, fleet, IT, grants, finance support, operating procedures, and systems.

**Current phase:** Phase 1 — approved 2026-09-17, **blocked on access and on naming a technical owner (R-010)**.

> ⚠️ **The Director of IT role is being eliminated.** Condition 4 is void, the architecture simplifies from nine components to five, and a **departing-admin access review (R-011) starts this week** independent of everything else. Read [`phase1/04-it-director-removal-impact.md`](phase1/04-it-director-removal-impact.md).
**Nothing has been installed, configured, or connected.**

> **Read [`phase0/08-amendments-and-answers.md`](phase0/08-amendments-and-answers.md) first.** It records the sign-off decision, all amendments, and the answers to the three blocking questions. Where it conflicts with the original Phase 0 documents, it wins.

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

## Phase 1 artifacts

| File | Contents |
|---|---|
| [`00-implementation-plan.md`](phase1/00-implementation-plan.md) | Milestones, owners, dates (T+n from access), measurable outcomes |
| [`01-paperclip-adversarial-test.md`](phase1/01-paperclip-adversarial-test.md) | 8-case enforcement test protocol — start condition 1 |
| [`02-risk-analysis.md`](phase1/02-risk-analysis.md) | Risk register R-001 … R-009, accepted residual risk |
| [`03-systems-of-record-audit.md`](phase1/03-systems-of-record-audit.md) | Live M365 audit — resolves Q1, surfaces R-005/R-006/R-007 |
| [`04-it-director-removal-impact.md`](phase1/04-it-director-removal-impact.md) | **Role elimination: simplification, cost, access review (R-010/011/012)** |
| [`05-system-ownership-and-continuity.md`](phase1/05-system-ownership-and-continuity.md) | **Signable ownership + continuity plan. Swap owner by editing Section 1 only.** |

---

## Headline decisions

| Layer | Decision |
|---|---|
| Management plane | Paperclip (MIT) **re-opened** — adversarial test is now go/no-go on the governance approach |
| Router | Keep LiteLLM; OpenRouter demoted to fallback |
| Agents | Thin custom on the Anthropic SDK, MCP tools, heartbeat to Paperclip |
| Knowledge | Hybrid index — **Google Workspace** for documents, M365 for mail/calendar |
| Memory | **Postgres + pgvector, bi-temporal schema** (Graphiti = Phase 3 challenger) |
| Workflows | **n8n Cloud**, deterministic only — 32% of workflows should not call a model |
| Models | Haiku 4.5 / Sonnet 5 / Opus 5 — one provider, one egress path, one audit story |
| Resilience | **Managed app platform** + managed Postgres + Spaces; live restore test gates sign-off |

**Changed from the directive:** DeepSeek dropped (offshore audit surface not repaid by ~$8–15/mo saving). Fable 5.1 replaced by Opus 5 as strategic tier (half the price; Fable 5.1 cannot run under the required retention posture). No local GPU for Class C (BAA + HIPAA-ready configuration instead; $15–30k capex avoided).

**Estimated run rate:** $140–225/mo infrastructure, $50–250/mo models, **$1,000–2,500/mo external technical owner** (R-010). Total $1,190–2,975/mo.

The owner line is not new cost — it was inside a salary. Removing the role converts it from payroll to invoice and makes it visible. **$12–30k annually**, and it should not be presented to the CEO as a saving.

---

## Rollout order

**Facilities → Fleet → Procedures → IT → Grants → Finance (Raquel's lead) → Communications**

Changed by COO direction on 2026-09-17; the order reflects the politics. Jude Catral owns the first two departments, so they are one director, one 1:1, one co-signature conversation. Finance last under Raquel's lead.

Consequences recorded as R-008 (the PHI scrubber moves to a Phase 4 deliverable with its own eval set, and gates facilities go-live) and R-009 (observability substrate built directly in Phase 1 rather than inherited from the IT agent). The Phase 0 recommendation was IT → Fleet → Procedures → Property → Grants → Finance → Comms.

**Department gates, binding:** COO 1:1 with the owning director, then charter co-signed by that director, then scorecard routing confirmed director-first. No co-signature, no go-live.

---

## Standing constraints

- **Data class first, then cost.** Tenant privacy is not a cost line item.
- **Class C payloads never enter the memory graph.** Memory holds de-identified durable facts and pointers into systems of record.
- **Class C fails closed.** No compliant model available means halt and notify, never degrade to a non-compliant path.
- **No agent holds payment credentials.** Ever.
- **The grants agent never submits.** The finance agent never executes payments.
- **Cite or flag.** An agent that cannot cite a source says so rather than guessing.
- **Two consecutive failures halts the workflow and notifies.** No silent retries.
- **All resident-facing communication is Tier 2 with full approval.** No pre-approved templates, no standing approval, no exceptions without written COO directive.
- **Deterministic-first.** The 32% no-model figure is a floor, not a ceiling. Every phase ends with a pass asking what else stops calling a model.
- **This design channel never accepts resident or consumer information.** The system handles Class C under a BAA; this conversation does not.

---

## Phase sequence

| Phase | Contents | Status |
|---|---|---|
| 0 | Audit, architecture, sequencing, classification | **Accepted 2026-09-17** |
| 1 | Foundation: harness, routing, caching, accounting, vault, logging, backups | **Approved — blocked on access** |
| 2 | Knowledge core | **Target confirmed** — Google Workspace; split-tenant permission model open (R-005) |
| 3 | Memory layer + multi-session replay benchmark | — |
| 4 | Golden dataset, judge validated to 0.85+ agreement | — |
| 5 | Department agents, in rollout order | — |
| 6 | Executive services | — |
| 7 | MCP integrations | — |
| 8 | Self-improvement loop | — |
| 9 | Runbook and handoff | — |

Each phase ends with a working artifact, a test proving it works, and a rollback procedure. No phase advances without sign-off.
