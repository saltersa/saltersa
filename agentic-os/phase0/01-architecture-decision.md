# Architecture Decision Record — COO Agentic Operating System

**Phase 0 deliverable (a).** One decision per layer with short rationale. Alternatives are listed only where the decision is expensive or irreversible, one line each, per operating rule 1.

Evaluation criteria applied in this order, per the directive: **control and reliability → cost efficiency → security → speed of new automation.** Platform decisions are additionally scored on integration surface, total cost of ownership, exit cost, and data portability before features.

---

## ADR-01 — Management plane: adopt Paperclip, scoped to control plane

**Decision:** Adopt [Paperclip](https://github.com/paperclipai/paperclip) (MIT, Node.js + React, self-hosted Postgres) as the management plane. Scope it to governance, budget enforcement, org chart, approval routing, and work/cost tracking. It is **not** the system of record for agent outputs, knowledge, or memory.

**Rationale:** Budget enforcement is atomic at task checkout with automatic pause and queue cancellation on overspend; approval gates are enforced at execution time with revisioned config and rollback. That is the governance the directive requires, and building it custom is 3–4 weeks. Bring-your-own-agent by heartbeat means no framework lock-in.

**Constraints applied:** Telemetry is on by default — disable with `PAPERCLIP_TELEMETRY_DISABLED=1` **and** `DO_NOT_TRACK=1` at install, verified by egress capture, per operating rule 5. Memory and knowledge features are roadmap-only and are not depended on.

**Exit cost:** Low by construction. Because agent outputs land in the systems of record and traces land in our own store, removing Paperclip costs the governance layer and nothing else. Re-implementing that layer custom is the 3–4 weeks we are deferring, not losing.

**Alternative rejected:** Thin custom control plane — correct only if the adversarial enforcement test in Phase 1 fails.

**Verification before Phase 1 sign-off:** Attempt to exceed a budget cap and attempt to execute past an approval gate. Report actual behavior, not README claims.

---

## ADR-02 — Router and harness: keep LiteLLM

**Decision:** Keep LiteLLM as the routing layer. All calls go through it. OpenRouter is retained as a configured fallback path only, not the primary.

**Rationale:** LiteLLM already implements both halves of the directive's caching mandate natively. It injects `cache_control` checkpoints via `cache_control_injection_points` without application code changes, **and it stands down when the request already carries its own checkpoints** — the client's breakpoints win ([LiteLLM prompt caching](https://docs.litellm.ai/docs/tutorials/prompt_caching)). For providers exposing the Anthropic Messages API natively, a deployment can be opted into untranslated passthrough by adding `/v1/messages` to `model_info.supported_endpoints` ([native passthrough](https://docs.litellm.ai/docs/anthropic_unified/native_passthrough)).

That matters because the naive path silently degrades: by default every `cache_control` in a forwarded body is reduced to `{"type": "ephemeral"}`. Routing Anthropic traffic through a translating gateway without the passthrough configured is the single most likely way to lose caching without any error being raised.

**Named fallbacks per tier** are defined in `06-model-tier-map.md`. Model swap is a config change verified against the regression dataset, never a prompt rewrite.

**Instrumentation requirement:** `usage.cache_read_input_tokens` is logged on every call. If it is zero across repeated requests, a silent invalidator is at work and the weekly cache report must flag it.

---

## ADR-03 — Agent framework: thin custom agents over the Anthropic SDK

**Decision:** Department agents are thin processes built on the official Anthropic SDK, registered to Paperclip by heartbeat. No heavyweight agent framework.

**Rationale:** Control and reliability rank first. The agent loop here is genuinely simple — recall, retrieve, reason, propose, gate, log. A framework adds a dependency, an upgrade treadmill, and an abstraction between us and the token accounting the directive requires per run. Tool calls go through MCP servers (ADR-07), which is where the reusable surface actually lives.

**Cache-aware prompt structure**, mandatory in every charter: stable prefix (role charter → tool definitions → SOP excerpts) then `cache_control` breakpoint, then variable suffix (the task). Render order is `tools` → `system` → `messages`; any byte change in the prefix invalidates everything after it, so no timestamps, no unsorted JSON, no varying tool sets in the prefix.

---

## ADR-04 — Knowledge layer (Layer 1): hybrid index over the authoritative store

**Decision:** Hybrid keyword + semantic index over SOPs, policies, contracts, grant files, property records, fleet history, budgets, and IT documentation. Permissions mirror the source system; citation is enforced on every factual claim; an agent that cannot cite says so rather than guessing.

**BLOCKED on Q1.** You run both Google Workspace and Microsoft 365. Until one is named authoritative for documents, ingestion, permissioning, and the index are undesignable. Building against both is exactly the parallel-source-of-truth defect the directive forbids.

**Design constraint regardless of answer:** the index stores embeddings and pointers. Documents stay in the source system. This keeps permissioning honest (we re-check at read time against the source) and keeps the purge story simple.

---

## ADR-05 — Memory layer (Layer 2): Graphiti, self-hosted, Kùzu backend

**Decision:** [Graphiti](https://github.com/getzep/graphiti) self-hosted, Apache 2.0, on the embedded Kùzu backend to start.

**Rationale, in the directive's own platform terms:**

- **Exit cost / portability:** Apache 2.0 with multi-backend support (Neo4j, FalkorDB, Kùzu, Neptune). Lowest lock-in of the candidates.
- **Compliance fit:** Bi-temporal edges track two timelines per fact — valid time and ingestion/provenance time — with explicit validity intervals, and every fact traces to the source episode that produced it. For an organization whose agents must cite sources and defend an audit trail, the memory layer's native data model *is* the audit trail. Nothing else in the candidate set has this.
- **Cost:** Kùzu is embedded — no graph server, no additional infrastructure line. Move to FalkorDB or Neo4j only if scale demands it, which is precisely the portability we selected for.

**Explicitly not selected on benchmarks.** The directive is right to distrust them and the audit evidence is worse than it suggests: an independent audit found the LoCoMo LLM judge **over-accepting 62.8% of deliberately wrong answers**, 99 score-corrupting errors in 1,540 questions, and 446 questions whose correct answer is a refusal that the standard harness drops while instructing the model never to abstain ([audit](https://dev.to/gde03/the-ai-memory-benchmark-everyone-quotes-forbids-saying-i-dont-know-o1n), [Zep's re-run of Mem0's claim](https://blog.getzep.com/lies-damn-lies-statistics-is-mem0-really-sota-in-agent-memory/)). Published LongMemEval and BEAM figures for these products are not comparable across vendors either — different models, harnesses, and token budgets. **Selection here is on license, architecture, exit cost, and compliance fit. Recall quality is decided in Phase 3 by multi-session replay against 20+ reconstructed historical scenarios per department, and Phase 3 does not sign off without it.**

**Rejected, with reasons:**
- **Zep Cloud** — SOC 2 + HIPAA + BAA available, but the self-hostable Community Edition is **deprecated**, making this a cloud-only vendor dependency with credit-based pricing for what the directive defines as a 5–10 year commitment. Fails the exit-cost test.
- **Mem0** — Apache 2.0 core and self-hostable, largest community, but personalization-first design with no native temporal/provenance model.
- **Letta** — Apache 2.0, but it is a full agent runtime, not a memory layer; adopting it would override ADR-03.
- **Hindsight** — MIT, single container, no external DB, four parallel retrieval strategies. Genuinely attractive operationally and the closest runner-up. Rejected only on maturity and the absence of third-party audit; **re-evaluate at the Phase 3 replay benchmark as the named challenger.**

**Known hole, to be closed in Phase 3:** bi-temporal graphs invalidate superseded facts rather than deleting them. That collides directly with a Class C retention and purge policy. The resolution is architectural, not a Graphiti setting — **the memory layer stores de-identified durable facts and pointers into the systems of record, never Class C payloads.** Purge then means purge in the system of record and tombstone the pointer. Any design that puts Class C text into the graph fails the purge requirement and must be rejected at review.

**Scoped banks:** per-agent, per-department, org-wide. Write scope is enforced at the agent, read scope at retrieval.

---

## ADR-06 — Deterministic workflows: keep n8n, narrowed

**Decision:** Keep n8n. Restrict it to deterministic work: scheduled triggers, webhook intake, system-to-system sync, notification fan-out, the batched approval digest delivery.

**Rationale:** Directive rule — any decision expressible as a branch, lookup, or template is a defect when implemented as an LLM call. n8n is where those live. The audit-for-this runs every phase, not once.

---

## ADR-07 — Integrations: MCP-native

**Decision:** Every integration is wrapped as an MCP server — Gmail, Drive, Calendar, Outlook, SharePoint, WhatsApp, and each department system. A2A for agent-to-agent, `AGENTS.md` for instructions.

**Rationale:** Directive preference, and it is the correct one: it makes the tool surface reusable across agents and swappable under the agents. Live connection test before each Phase 7 sign-off.

**Note:** Microsoft 365 and Claude Docs MCP surfaces are already reachable from this session, which shortens Phase 7 for whichever stack Q1 names as authoritative.

---

## ADR-08 — Observability and token accounting

**Decision:** Structured trace per run, written to our own Postgres, never only to a vendor. Every run logs trigger, inputs, model, input/output/cached/total tokens, cost, tools called, actions taken, tier, data class, and approval status.

**Rationale:** This is the audit defense and the directive treats it as a hard requirement. It is also the substrate the Phase 8 signal store reads — building it twice would be the defect the directive warns about. Budgets and alerts per agent, per workflow, per month. Monthly cost-by-tier report generated, not assembled.

**Fail-safe:** two consecutive failures halts the workflow and notifies. No silent retries.

---

## ADR-09 — Resilience: two nodes, managed Postgres, tested restore

**Decision:** Replace the single DigitalOcean VM with the cheapest architecture that survives its loss.

| Component | Purpose | Est. monthly |
|---|---|---|
| 2 × droplet (4GB) | App tier, separate regions | $48 |
| Managed Postgres | Paperclip + traces + memory; automated backup and PITR | $60–120 |
| Spaces | Knowledge index snapshots, trace export, backup target | $5 |
| Load balancer | Failover | $12 |
| **Total** | | **$125–185** |

**Rationale:** A single VM is a single point of failure and the directive says so. Managed Postgres is the decision that matters — it moves backup, point-in-time recovery, and failover off our plate for roughly $60/month, which is cheaper than the hours of getting it right ourselves and far cheaper than getting it wrong.

**Sign-off gate:** backups of memory banks, knowledge indices, configs, and traces are **restored in a live test** before Phase 1 is signed off. Not verified by the existence of a backup file. Restored.

---

## Layer summary

| Layer | Decision | License / model | Exit cost |
|---|---|---|---|
| Management plane | Paperclip, control plane only | MIT, self-hosted | Low |
| Router | LiteLLM | Open source, self-hosted | Low |
| Agent framework | Thin custom on Anthropic SDK | — | Low |
| Knowledge | Hybrid index, pointers only | **Blocked on Q1** | Low |
| Memory | Graphiti + Kùzu | Apache 2.0, self-hosted | Low |
| Workflows | n8n, deterministic only | Retained | Low |
| Integrations | MCP servers | Protocol-native | Low |
| Observability | Own Postgres | — | None |
| Resilience | 2 droplets + managed PG + Spaces | DigitalOcean | Low |
| Models | Anthropic, one contract, BAA | Commercial API | One-line config |
