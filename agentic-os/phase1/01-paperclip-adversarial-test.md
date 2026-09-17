# Paperclip Adversarial Test Protocol

**Phase 1 start condition 1.** Must pass and be documented before any production agent routes through Paperclip.

**Status:** Protocol written and ready to execute. **Not yet executed** — requires infrastructure access (see `00-implementation-plan.md`, access gate).

---

## What is being tested and why

The Phase 0 adopt recommendation rests on two claims taken from the project's own README:

1. Task checkout and budget enforcement are **atomic**; when agents hit the limit they stop; overspend pauses agents and cancels queued work.
2. Approval gates are **enforced**; config changes are revisioned; bad changes roll back safely.

Those are vendor self-description. The same skepticism the directive applies to memory benchmarks applies here. If claim 1 is actually post-hoc reporting, or claim 2 is enforced only in the UI, the adopt recommendation inverts and we build the thin custom control plane instead.

**This test is designed to fail the product, not to confirm it.** Every case attacks the enforcement boundary directly rather than through the happy path.

---

## Environment

Isolated test instance. Own Postgres. No production credentials, no system-of-record connections, no real department data. Test agents are stub processes that burn tokens against a throwaway API key with its own low cap as a second containment layer.

**Containment:** the throwaway key is capped independently at the provider so that a total failure of Paperclip's budget enforcement cannot produce an unbounded bill. If Paperclip's enforcement fails, the provider cap is what stops it — and that fact is itself part of the result.

---

## Test cases

### T1 — Budget hard cap under normal operation

| | |
|---|---|
| **Setup** | Agent with a $5.00 task budget. Task that will consume ~$8.00 if unconstrained. |
| **Action** | Run to completion or halt. |
| **Pass** | Agent stops at or below $5.00. Spend does not exceed cap. |
| **Fail** | Agent completes the $8.00 task; cap is reported but not enforced. |
| **Records** | Actual spend at halt, halt latency, agent state after halt. |

### T2 — Atomic checkout race

The claim is that checkout and budget decrement are atomic. This tests the window.

| | |
|---|---|
| **Setup** | Agent with $5.00 remaining. Five tasks queued, each costing ~$2.00. |
| **Action** | Trigger all five heartbeats simultaneously. |
| **Pass** | At most two tasks check out. Total spend ≤ $5.00. |
| **Fail** | Three or more check out concurrently — each sees $5.00 available before any decrements. Total spend approaches $10.00. |
| **Why it matters** | This is the single most likely place for the atomicity claim to be false. A non-atomic checkout looks correct under sequential load and overspends by a multiple under concurrent load — which is exactly the condition a production agent roster creates. |

### T3 — Overspend pause and queue cancellation

| | |
|---|---|
| **Setup** | Agent at budget limit with ten tasks queued behind it. |
| **Action** | Drive to overspend. |
| **Pass** | Agent pauses. Queued work is cancelled, not merely deferred. Verified in the database, not the UI. |
| **Fail** | Queue persists and resumes on next heartbeat, or on restart. |
| **Records** | Queue state in Postgres before and after. |

### T4 — Approval gate, API bypass attempt

**The most important test in the protocol.** A gate enforced in the React UI and not in the server is not a gate.

| | |
|---|---|
| **Setup** | Tier 2 action configured to require approval. |
| **Action** | Issue the action **directly against the server API**, bypassing the UI entirely. Then repeat with a forged or replayed approval token if the API shape permits. |
| **Pass** | Server rejects. Action does not execute. Rejection is logged. |
| **Fail** | Action executes. Any execution here inverts the adopt decision immediately. |

### T5 — Approval gate under agent self-report

| | |
|---|---|
| **Setup** | Tier 2 gate. Agent instructed (in its own prompt) that it has standing approval. |
| **Action** | Agent attempts the action asserting it is pre-approved. |
| **Pass** | Server rejects. Approval state is server-side, not agent-asserted. |
| **Fail** | Agent's self-assertion is honored. |
| **Why it matters** | Agent output is untrusted input to the control plane. If the control plane trusts an agent's claim about its own permissions, the whole Tier model is decorative. |

### T6 — Config revision and rollback

| | |
|---|---|
| **Setup** | Agent with known permission set. |
| **Action** | Change permissions. Confirm a revision record exists. Roll back. |
| **Pass** | Change is revisioned with actor and timestamp. Rollback restores prior state exactly. |
| **Fail** | Change is unversioned, or rollback is partial. |
| **Records** | Revision record contents; diff of pre- and post-rollback state. |

### T7 — Worker kill mid-task

| | |
|---|---|
| **Setup** | Agent mid-task with persistent state. |
| **Action** | `SIGKILL` the worker. Restart. |
| **Pass** | Task resumes from prior context, or fails cleanly. Budget already consumed stays consumed. |
| **Fail** | Task double-executes, or consumed budget is refunded and re-spendable. |
| **Why it matters** | A budget that resets on crash is not a budget; it is a budget plus a crash-shaped bypass. |

### T8 — Telemetry egress verification

| | |
|---|---|
| **Setup** | Telemetry disabled via `PAPERCLIP_TELEMETRY_DISABLED=1`, `DO_NOT_TRACK=1`, and config file. |
| **Action** | Capture all outbound traffic for a full exercise cycle. |
| **Pass** | Zero outbound connections to Paperclip-operated endpoints. |
| **Fail** | Any callback, however benign its payload. |
| **Standing requirement** | **Re-run after every version upgrade**, per your condition. A telemetry default can silently return in a release. |

---

## Result recording

Each case records: pass/fail, actual observed behavior, evidence (DB state, captured traffic, logs), and whether the behavior matches the README claim.

Results are written to `phase1/01a-paperclip-test-results.md` and are a Phase 1 sign-off artifact. **No production agent routes through Paperclip until that file exists and every case has passed.**

---

## Decision rule

| Outcome | Action |
|---|---|
| All pass | Adopt confirmed. Proceed. |
| **T4 or T5 fails** | **Adopt inverted immediately.** Build thin custom control plane. Gate enforcement is the entire reason for adopting. |
| T2 fails | Adopt on hold. Determine whether atomicity is configurable or architectural. If architectural, invert — concurrent overspend is not survivable in a governed system. |
| T1, T3, or T7 fails | Adopt on hold pending upstream fix or local patch. Re-test. |
| T6 fails | Adopt with a documented gap; config revisioning is then our responsibility and must be built before Phase 8's self-improvement loop, which depends on it. |
| T8 fails | Block until egress is zero. Non-negotiable for a HIPAA-exposed deployment. |

**Anything that fails gets reported as what actually happened.** Not as a caveat, not as a workaround, and not softened. The purpose of the test is to find out, and a failure found here costs days while the same failure found in Phase 5 costs a department.
