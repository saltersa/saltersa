# Paperclip — Build vs Adopt Recommendation

**Phase 0 deliverable (d).** The directive asked for a skeptical test: *if it is only a dashboard over logs rather than genuine governance and budget control, say so and build the thin custom version instead.*

**Recommendation: ADOPT, scoped to the control plane, with an adversarial verification gate before Phase 1 sign-off.**

---

## What it is

[Paperclip](https://github.com/paperclipai/paperclip) — Node.js 24.11+ server with a React UI that orchestrates agents into an organization: org charts, budgets, goals, governance, accountability, and work/cost tracking in one dashboard. MIT licensed, © 2026 Paperclip Labs, Inc. Local development runs an embedded PostgreSQL with no setup; production points at your own Postgres and deploys however you like.

Launched 4 March 2026 by a pseudonymous developer (@dotta); crossed 30,000 GitHub stars within three weeks.

---

## The skeptical test

The directive's test is the right one, and it has a specific failure mode in mind: a tool that *reports* on spend and approvals after the fact, while the agents themselves are unconstrained. That is a dashboard over logs, and it provides zero actual control. Here is Paperclip against that test on each of the four things that would have to be real.

### Test 1 — Is budget enforcement a hard cap, or reporting?

**Passes.** The mechanism is the thing that matters: **task checkout and budget enforcement are atomic**. "When they hit the limit, they stop. No runaway costs." Overspend pauses agents and cancels queued work automatically.

Atomic checkout is the correct design and it is not what a reporting layer does. A dashboard reads spend after a run completes; atomic checkout means the budget is decremented as part of the same transaction that hands the agent its work, so there is no window in which an agent holds work it cannot pay for. Automatic pause plus queue cancellation on overspend is enforcement with a consequence, not an alert.

### Test 2 — Are approval gates enforced at execution, or advisory?

**Passes.** "Approval gates are enforced, config changes are revisioned, and bad changes can be rolled back safely," with board approval workflows and execution policies carrying review/approval stages.

Execution policies with approval stages is the shape the directive's Tier 2/3 model needs. Revisioned config with rollback matters independently: it means a change to an agent's permissions is itself an auditable, reversible event, which is a requirement the directive states for the self-improvement loop ("no change to permissions, tiers, or data classification without my approval") and which most orchestration tools do not provide at all.

### Test 3 — Does it force a framework, or take our agents?

**Passes, and this is the strongest single reason to adopt.** "If it can receive a heartbeat, it's hired." Supports Claude Code, Codex, CLI agents, and HTTP/webhook bots.

Bring-your-own-agent by heartbeat means adopting Paperclip does not constrain ADR-03. Our agents stay thin processes on the Anthropic SDK; Paperclip governs them without owning them. That keeps the exit cost low, because the agents survive the removal of the management plane.

Agents also carry persistent state and resume the same task context across heartbeats rather than restarting from scratch — which matters for long-running department work and is not trivial to build.

### Test 4 — Does it provide the memory and knowledge layers?

**Fails, and it is fine.** Memory and knowledge are marked **planned, not shipped** on the roadmap.

This is the one place the directive's framing could mislead: it describes "a plugin system including persistent-memory plugins." The plugin system is real and substantial — instance-wide, with out-of-process workers, capability-gated host services, job scheduling, tool exposure, and UI contributions. Persistent memory as a shipped plugin is not there.

That is not a reason to reject it. It is a reason to scope it: **Paperclip is the control plane, not the memory or knowledge layer.** Those are ADR-04 and ADR-05, built independently, and they would have been built independently anyway — the directive's Layer 1/Layer 2 requirements (bi-temporal provenance, multi-session replay validation, data-class-aware banks) are far beyond what a management-plane plugin would deliver.

---

## Verdict

Three of four tests pass on the things the directive actually cares about — enforcement, not reporting. The fourth failure is out of scope by design.

**Build-vs-adopt arithmetic:**

| | Adopt Paperclip | Build thin custom |
|---|---|---|
| Time to working control plane | ~3–5 days (deploy, configure, verify) | 3–4 weeks |
| Budget enforcement | Atomic checkout, shipped | Build it |
| Approval gates + revisioned config + rollback | Shipped | Build it |
| Org chart, goals, work/cost tracking | Shipped | Build it |
| Multi-org isolation | Shipped (relevant: affiliated entities file separately) | Build it |
| Maintenance | Track an external project | Own every line |
| Exit cost | Low — agents and data survive removal | N/A |
| License | MIT | — |

The multi-organization line is worth noting specifically: a single deployment runs unlimited companies with complete data isolation. Spectrum for Living Corporation, Spectrum River Vale Apartments, and the Endowment file separately. That maps onto a capability that already exists rather than one we would have to design for later.

---

## Conditions on adoption

These are not optional and each one is a Phase 1 checklist item.

### 1. Adversarial verification before sign-off

**Everything in the skeptical test above comes from the project's own README.** I am recommending adoption on the strength of vendor self-description, which is exactly the epistemic position the directive warns about with memory benchmarks. The same discipline applies here.

Before Phase 1 is signed off, run against a test instance:

- Set a $5 budget. Drive an agent past it. **Confirm it actually stops**, that queued work is actually cancelled, and that there is no window where a checked-out task continues spending.
- Configure a Tier 2 approval gate. Attempt to execute past it — directly against the API, not through the UI. **Confirm it blocks.**
- Change an agent's permissions. **Confirm the change is revisioned and that rollback restores prior state.**
- Kill a worker mid-task. Confirm state resumes rather than double-executing or losing the task.

Report actual behavior. If budget enforcement turns out to be post-hoc, this recommendation inverts and we build the thin custom version — which is why the adversarial test happens **before** anything depends on it.

### 2. Telemetry off at install

Telemetry is **enabled by default**. Disable via `PAPERCLIP_TELEMETRY_DISABLED=1` and `DO_NOT_TRACK=1` and the config file, then **verify by egress capture** rather than by trusting the setting.

The project states no personal information, issue content, prompts, file paths, or secrets are collected. That claim is probably true and is also not the standard. Operating rule 5 says flag any component that phones home; this one does by default, and for a HIPAA-exposed organization the correct posture is off and verified, not off and assumed.

### 3. Scope boundaries, enforced

- Paperclip is **not** the system of record for agent outputs. Those land in the department systems of record.
- Paperclip is **not** the trace store. Traces land in our own Postgres (ADR-08) because they are the audit defense and must survive the removal of any vendor.
- Paperclip is **not** the memory or knowledge layer.

These three boundaries are what keep the exit cost low. Violating any of them converts a reversible adoption into a dependency.

### 4. Version pinning and a maturity posture

Launched March 2026, roughly six months old at time of writing, with a very steep star curve. Thirty thousand stars in three weeks measures attention, not maturity, and a project on that trajectory ships breaking changes.

Pin the version. Do not auto-update. Treat upgrades as changes that pass the Phase 8 evaluation gate and canary like any other. Review the release notes as part of the systems integrator's monthly cycle, which already owns watching for deprecations.

### 5. Pseudonymous maintainer — named, not disqualifying

The project is maintained under a pseudonym by an entity (Paperclip Labs, Inc.) rather than a known vendor. Under MIT with self-hosted Postgres and our own data, the practical exposure is abandonment risk rather than access risk — we hold the code and the database. Mitigation is the pinned version plus the low exit cost, both of which are already conditions. Worth recording as a known risk rather than treating as a blocker.

---

## What this decision does not commit you to

Adoption here is reversible on a timescale of weeks, by design. The agents are ours, the data is ours, the traces are ours, the memory and knowledge layers are separate. If Paperclip is abandoned, breaks, or fails the adversarial test six months from now, the cost is the 3–4 weeks of building the thin custom control plane that we are deferring today — not a migration.

That asymmetry is the whole case. Deferring four weeks of work at the cost of a reversible dependency, on an MIT-licensed self-hosted component, is the right trade when the alternative is building governance infrastructure before building a single agent.
