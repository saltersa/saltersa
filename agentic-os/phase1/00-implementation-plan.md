# Phase 1 — Foundation: Implementation Plan

**Objective.** Stand up the foundation layer — infrastructure, routing, caching, token accounting, credential vault, logging, alerting, backups, and the governed control plane — such that one task runs end to end with its routing decision, cache behavior, and cost visible, and the system survives the loss of any single node.

> **AMENDED 2026-09-17 — the Director of IT role is being eliminated.** Condition 4 is void, the architecture simplifies from nine components to five, and a technical owner must be named before Phase 1 starts. Read [`04-it-director-removal-impact.md`](04-it-director-removal-impact.md) alongside this plan; where they conflict, that document wins. Milestones below are unchanged in shape but several owners are unassigned pending R-010.

**Constraint, per COO approval:** nothing in Phase 1 touches a department system of record. All connections built in this phase are to infrastructure we own.

**Dates are expressed as T+n business days from access grant.** Access has not been granted, so calendar dates would be fiction. T is the day the Tier 1 access in `../phase0/07-access-and-questions.md` lands.

---

## Access gate — T+0

Phase 1 cannot start without these. Every milestone below depends on them.

| Item | Purpose | Status |
|---|---|---|
| DigitalOcean API token | Provision infrastructure; audit existing VM | **Not received** |
| LiteLLM config (current) | Verify `/v1/messages` passthrough; audit fallbacks | **Not received** |
| Anthropic API key, org-scoped | Router config, smoke test | **Not received** |
| n8n instance access | Audit for the LLM-call-should-be-a-branch defect | **Not received** |
| Hermes agent source | Confirm or reverse the Reset recommendation | **Not received** |
| BAA status | Class C path gating | **Not confirmed** |
| **Technical owner named** | **Condition 4 — VOID as answered; see R-010** | **BLOCKING** |

**Delivery:** through whatever secret-sharing mechanism IT already uses. Not through this channel. No plain-text credentials anywhere, per operating rule 5.

---

## Milestones

| # | Milestone | Owner | Due | Measurable outcome |
|---|---|---|---|---|
| **M0** | **Departing-admin access review** | **COO / HR / IT** | **Immediate — before departure date** | **R-011.** Every admin credential enumerated and transitioned. Not on T+n: the window closes on a date we do not control. |
| **M10** | M365 connector scope reduction | Reassign (R-011) | **Immediate** | **R-006.** Write and send scopes removed. Read-only set confirmed by `get_granted_scopes`. Now critical path. |
| **M1** | Existing stack audit complete | Build | T+3 | Written findings on LiteLLM passthrough config, n8n workflow defect count, Hermes keep/reset confirmation. System-of-record product names captured for ≥3 of 5 unknown domains. |
| **M2** | Infrastructure provisioned (**5-component managed stack**) | Build + tech owner | T+7 | Managed app platform, managed Postgres (pgvector), Spaces live. Monthly cost within $140–225. Loss of any single instance verified non-fatal by test. |
| **M3** | Credential vault live | Build + tech owner | T+9 | **Condition 2.** All keys in vault. Zero plain-text credentials, verified by repo and filesystem scan. Vault restore tested. |
| **M4** | Router configured, both cache paths | Build | T+12 | Named fallbacks per tier **and per data class**. Class C fails closed, verified by test. `cache_read_input_tokens` non-zero on repeat requests — the measured proof caching works. |
| **M5** | Token accounting + spend caps | Build | T+14 | Every run logs input/output/cached/total tokens, model, cost, tier, data class. Per-agent and per-month caps enforced. Cost-by-tier query returns. |
| **M6** | Trace store + observability substrate | Build | T+17 | Structured trace per run in our Postgres. Self-monitoring instrumentation live (see R-009 — no longer inherited from the IT agent). Two-consecutive-failures halt verified by induced failure. |
| **M7** | Backup + live restore test | Build + tech owner | T+19 | **Condition 3.** Backup of config, trace store, and memory state **restored into a clean environment and verified functional**. Not "backup exists" — restored. |
| **M8** | Paperclip deployed, telemetry off | Build | T+21 | Deployed, version pinned. Telemetry zero outbound, verified by egress capture (T8). |
| **M9** | Paperclip adversarial test | Build | T+24 | **Condition 1.** All 8 cases executed, results written to `01a-paperclip-test-results.md`. T4/T5 failure inverts the adopt decision. |
| **M11** | Smoke test | Build | T+26 | One task end to end. Routing decision, cache hit, and cost visible in the trace. Runs under a budget cap and an approval gate. |
| **M12** | Phase 1 sign-off package | Build | T+28 | All four conditions documented as met. Rollback procedure written and tested. |

**Critical path:** M2 → M3 → M4 → M6 → M7 → M8 → M9 → M11. **Estimated duration: 28 business days (~6 weeks) from access grant.**

**M0 and M10 do not wait for access, for sign-off, or for anything else in this plan.** They are time-boxed to a departure date outside our control, and they are the only items here with a deadline nobody at Spectrum sets.

---

## Deliverables

1. Five-component managed stack (app platform, Postgres+pgvector, Spaces, n8n Cloud, router), surviving single-instance loss
2. LiteLLM routing with per-tier and per-data-class fallbacks, Class C failing closed
3. Cache-aware prompt structure, both automatic and explicit `cache_control` paths, verified
4. Token accounting with per-agent, per-workflow, per-month budgets and alerts
5. Credential vault, zero plain-text keys
6. Trace store in our own Postgres — the substrate Phase 8's signal store reads
7. Self-monitoring instrumentation (R-009)
8. Failure alerting with two-consecutive-failures halt
9. Tested backup and restore
10. Paperclip control plane, telemetry off, adversarially tested
11. Smoke test evidence
12. Rollback procedure

---

## Standing build rule — deterministic-first

**Adopted per COO amendment 1.** The 32% no-model figure from the Phase 0 tier map is a **floor, not a ceiling**.

Every phase ends with a pass over its own workflows asking: *what else stops calling a model?* The finding is recorded with the phase's sign-off package, and any workflow converted from an LLM call to a deterministic branch is logged as a defect corrected, per operating rule 5.

Phase 1's own pass covers the n8n audit in M1 — existing workflows are examined for the inverse defect, LLM calls doing work a branch should do.

---

## Rollout order — revised per COO direction

**Approved order:** Facilities → Fleet → Procedures → IT → Grants → **Finance (last, under Raquel's lead)** → Communications.

This differs from the Phase 0 recommendation (IT → Fleet → Procedures → Property → Grants → Finance → Comms). The change is deliberate, reaffirmed, and the COO's call. Two consequences are recorded rather than re-argued:

- **R-008** — facilities now ships before the PHI scrubber has operating history. The scrubber moves to a Phase 4 deliverable with its own eval set, and facilities go-live gates on measured accuracy plus a defined false-negative rate plus the sampling audit running. Stated fallback: if the scrubber cannot reach a defensible accuracy figure by end of Phase 4, fleet ships first and facilities waits.
- **R-009** — the observability substrate no longer arrives as a by-product of the IT agent. Built directly in Phase 1, M6. Roughly 2–3 additional build days, already in the plan above.

**What the change gets right:** Jude Catral owns both facilities and fleet, so the first two departments are one director, one 1:1, one co-signature conversation. Starting where the value is largest rather than where the build is easiest is the correct instinct for a system that has to earn its place.

---

## Department gates — adopted, binding

No department enters Phase 5 without all three, in order:

1. **COO 1:1 with the owning director**, conducted personally, before the system touches their data.
2. **Charter co-signed** by the owning director. No co-signature, no go-live.
3. **Scorecard routing confirmed director-first, COO second.**

| Department | Director | 1:1 | Charter co-signed |
|---|---|---|---|
| Facilities | Jude Catral | Pending | Pending |
| Fleet | Jude Catral | Pending | Pending |
| Procedures | TBD | Pending | Pending |
| IT | Sean Fallon | Pending | Pending |
| Grants | Elizabeth Boyajian | Pending | Pending |
| Finance | **Raquel Martinez (lead)** | Pending | Pending |
| Communications | TBD | Pending | Pending |

---

## Reporting agent — four levers as descriptive baselines

**Adopted per COO amendment.** The weekly scorecard carries, clearly labeled as operational metrics and explicitly **not** as recommendations:

| Lever | Metric | Source |
|---|---|---|
| Overtime and agency spend | $ and % of labor, by period | Payroll — peer function (HR) |
| Census and utilization | Billed units vs capacity | Program operations — peer function |
| Rate and acuity capture | Realized rate vs acuity mix | Clinical documentation — peer function |
| Span of control | Reports per supervisor | Org structure — peer function |

**Every one of the four sources is a peer function.** None of these metrics can be produced from systems the COO controls, which means each requires a data-sharing agreement with the function that owns it — Joan Garcia, Susan Mancuso, Donna Dolphin, Brian Weiner. That is influence, not authority, and the agreements are a prerequisite to the metric appearing on the scorecard at all.

Recorded as a Phase 6 dependency, surfaced now because the conversations take longer than the build. The instrumentation is the evidence base; the intervention conversation happens in a room with people in it.

**Baseline for comparison** (FY2023 Form 990, inherited condition): labor 68.0% of total expenses, against Eden Autism 66.7%, Arc of Essex 63.9%, Community Options 63.8%, OTC Burlington 55.7%. Negative margins FY2022 and FY2023 while every peer stayed positive. Wages and payroll taxes +22% over two years against 2% revenue growth.

---

## Resident communications — struck

**Per COO directive, recorded as binding.** All resident-facing communication is Tier 2 with full approval. No pre-approved templates. No standing approval. No exceptions, and no future exceptions without written COO directive.

This is stricter than the original build directive's "approval efficiency" provision and supersedes it.

---

## Rollback

Phase 1 is reversible at every milestone.

| Milestone | Rollback |
|---|---|
| M2 | Existing VM stays running and untouched until M7 passes. Rollback is a DNS change. |
| M3–M6 | New infrastructure only; nothing depends on it yet. Tear down. |
| M8–M9 | Paperclip is isolated and has no production traffic. Remove. |
| Whole phase | Existing VM is decommissioned **only after** M11 passes. Until then, rollback is complete and costs one DNS change. |

---

## Definition of done

All four COO conditions met and documented:

1. ☐ Paperclip adversarial test passed and documented — M9 (now a go/no-go on the governance approach, not just the product)
2. ☐ Credential vault live, no plain-text keys, verified — M3
3. ☐ Backup and restore test passed against actual memory and config state — M7
4. ☐ **Technical owner named** — **VOID as previously answered.** The condition stands; its answer does not. See R-010.

Plus, and ahead of all four: ☐ **M0 departing-admin access review complete** (R-011).

Plus: smoke test passed (M11), rollback procedure written and tested (M12), no department system of record touched.
