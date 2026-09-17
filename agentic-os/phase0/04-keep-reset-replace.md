# Keep / Reset / Replace — Existing Stack Audit

**Phase 0 deliverable (c).** Per the directive: nothing is sacred, but nothing is discarded without a written cost/benefit justification.

**Audit limitation, stated up front.** I have not been given access to the DigitalOcean VM, the LiteLLM config, the n8n instance, or the Hermes agent source. Every row below is a recommendation based on the architecture, not on inspection of what is actually deployed. Rows marked **VERIFY** change if inspection contradicts the assumption. Access request is in `07-access-and-questions.md`.

---

## Summary

| Asset | Decision | Justification |
|---|---|---|
| DigitalOcean Ubuntu VM | **Replace** | Single point of failure; directive requires surviving its loss |
| LiteLLM | **Keep** | Natively implements the dual-path caching mandate |
| OpenRouter | **Demote** | Fallback path only, not primary |
| n8n | **Keep, narrowed** | Deterministic workflows only |
| Custom Hermes agent | **Reset** | See below — this is the only contested call |
| Google Workspace | **Blocked on Q1** | Cannot decide until authoritative doc store is named |
| Outlook / Microsoft 365 | **Keep** | Confirmed reachable; email system of record |
| WhatsApp integration | **Keep, reclassified** | Class C ingress by default |

---

## Replace: single DigitalOcean VM

**Cost of keeping:** ~$24–48/month and one outage away from losing the management plane, the router, the memory graph, and the trace store simultaneously. The directive names this explicitly: "A single VM is a single point of failure; propose the cheapest architecture that survives its loss."

**Cost of replacing:** $125–185/month (ADR-09) — two droplets in separate regions, managed Postgres with automated backup and point-in-time recovery, Spaces as backup target, load balancer. Net increase roughly **$100–140/month**.

**Justification:** The delta buys backup, PITR, and failover as a managed service. Doing that correctly ourselves on a single VM is several engineering days plus ongoing attention, and doing it incorrectly is the failure mode where you discover the backup was never restorable. For an organization whose agents will hold operational and financial data under a BAA, $100/month is not a real decision.

**Migration is not a rebuild.** The existing VM's workloads (LiteLLM, n8n) move as containers. Keep the VM running until the restore test passes on the new infrastructure, then decommission.

---

## Keep: LiteLLM

**Justification:** Already documented in ADR-02. It implements both halves of the caching mandate — `cache_control_injection_points` for automatic checkpoint injection, and it stands down when the client sets its own breakpoints, so Anthropic's explicit path and the automatic path coexist without application changes. Native `/v1/messages` passthrough is available per-deployment.

Replacing it would mean rebuilding routing, fallback chains, per-model cost tracking, and cache handling to arrive at the same place. There is no case for it.

**VERIFY on access:** whether Anthropic-bound deployments have `/v1/messages` in `model_info.supported_endpoints`. Without it, every `cache_control` in a forwarded body is reduced to `{"type": "ephemeral"}` — caching silently degrades with no error raised. If the current config is missing this, that is likely the highest-value single fix in the existing stack and it is a config line.

---

## Demote: OpenRouter

**Decision:** Retained as a configured fallback path. Not the primary route.

**Justification:** OpenRouter is an aggregator, which means a third party sits between you and the model on every call. For Class B and C traffic under a BAA that is an additional party in the data path and an additional contract to reason about in a compliance review. For a single-provider architecture (finding 2), the aggregation benefit largely disappears — you are not shopping across providers per call.

**Why keep it at all:** it is genuinely useful as a fallback when the primary provider is degraded, and as the evaluation path when Phase 4 or the quarterly tier re-evaluation wants to test a non-Anthropic model against the regression dataset without signing a new contract. Keeping it configured costs nothing; routing production Class C traffic through it costs a compliance conversation.

**Constraint:** fallback routes must respect the data-class rules. A Class C fallback to a non-BAA provider is a breach, not a degradation. Fallback chains are defined per tier **and per data class** in `06-model-tier-map.md`, and a Class C workflow with no compliant fallback available **fails closed** — it halts and notifies rather than falling back.

---

## Keep, narrowed: n8n

**Decision:** Retain for deterministic work only — scheduled triggers, webhook intake, system-to-system sync, notification fan-out, batched approval digest delivery.

**Justification:** Directive rule 5: any decision expressible as a deterministic branch, lookup, or template is a defect when implemented as an LLM call. n8n is the correct home for exactly that, and it already exists with workflows built.

**VERIFY on access:** audit the existing workflows for the inverse defect — LLM calls doing work a branch should do. That audit repeats every phase, not once.

---

## Reset: custom Hermes agent

This is the only genuinely contested call in the audit, and the directive requires a written justification, so here it is in full.

**What resetting costs you:** whatever institutional knowledge is encoded in Hermes's prompts and tool integrations, plus whatever it currently does in production. That is a real loss and I am recommending it without having seen the code, which is a weak position to recommend from.

**Why reset anyway:**

1. **It cannot satisfy the governance model.** Every agent action in the target architecture is classified Tier 0–3 before execution, logged with trigger/inputs/model/tokens/cost/tools/actions/approval status, and gated through Paperclip's approval enforcement. A custom agent predating that model will not have tier classification, per-run token accounting, or data-class enforcement built in. Retrofitting those into an existing agent is not cheaper than building a thin agent on the established pattern — it is usually more expensive, because the retrofit has to work around decisions the original made.

2. **It is a single-instance exception to the roster pattern.** The directive requires every department agent to ship with a charter, tier permissions, system-of-record connections, context budget, data-class limits, model tier assignment with eval evidence, and benchmark tasks. One agent that works differently is one agent nobody else can maintain, which fails the design-for-handoff principle.

3. **The functionality is not lost, it is relocated.** Whatever Hermes does maps onto the roster — chief-of-staff orchestration, a department agent, or an n8n workflow if it is deterministic.

**What "reset" means precisely:** extract the prompts, tool integrations, and any encoded institutional knowledge as inputs to the new charters and the Phase 4 golden dataset. Hermes's accumulated behavior is genuinely valuable as *evaluation material* — it represents real tasks that were worth automating. Then decommission the agent itself.

**Decision gate:** if inspection shows Hermes already carries per-run cost accounting, tier classification, and data-class enforcement, this recommendation is wrong and it becomes a Keep. I will say so after access.

---

## Keep, reclassified: WhatsApp

**Decision:** Retain the integration. Reclassify it as **Class C ingress by default**.

**Justification:** Staff send what is in front of them. In a residential services organization, what is in front of them frequently includes resident information. Classifying the WhatsApp path by its intended use rather than its actual content is the kind of assumption that produces a breach report.

Everything arriving via WhatsApp passes the scrubber before reaching an agent or a memory bank, and the scrubber fails closed — unconfirmed scrubbing routes to the Class C path rather than proceeding.

---

## Blocked: Google Workspace vs Microsoft 365

Cannot be resolved in Phase 0. You run both. Q1 in `07-access-and-questions.md`.

The directive's own rule applies and is worth quoting against your own stack: "Any data in two places is a defect to report, not a workaround to build." Running two document platforms is a pre-existing instance of exactly that defect, and it predates this project. This project does not have to solve it — but it does have to pick one authoritative side, and picking is cheaper now than after Phase 2 has built an index and a permission model against the wrong one.
