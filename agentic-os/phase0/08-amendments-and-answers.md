# Phase 0 — Amendments, Answers, and Sign-Off Record

**Phase 0 accepted as delivered. Phase 1 approved subject to four conditions.**
**Date of decision:** 2026-09-17

This file is the authoritative record of what changed after Phase 0 was written. Where it conflicts with `00`–`07`, **this file wins**. The originals are kept unedited as the record of what was recommended and why, except where a stale value would actively mislead (rollout order), which has been corrected in place with a pointer here.

---

## Findings — all six accepted

| # | Finding | Disposition |
|---|---|---|
| 1 | Model spend is not the cost problem | **Accepted, amended** — see below |
| 2 | Drop DeepSeek | **Accepted.** Haiku covers Class A. |
| 3 | Fable 5.1 cannot be the Class C strategic tier | **Accepted.** Opus 5, first-party API, under BAA. |
| 4 | No GPU purchase for Class C | **Accepted.** |
| 5 | Engineer Class C out rather than build a Class C pipeline | **Accepted, hardened** — scrub is now a hard requirement |
| 6 | Adopt Paperclip, control plane only | **Accepted, conditional** — adversarial test before any production traffic |

### Amendment to finding 1 — deterministic-first becomes a standing build rule

Keep token accounting, caching, and spend caps as audit evidence. Drop the dynamic router.

**New standing rule:** *deterministic-first.* The 32% no-model figure is a **floor, not a ceiling**. Every phase ends with a pass over its own workflows asking what else stops calling a model. The result is recorded in that phase's sign-off package.

### Amendment to finding 3 — retention posture stated explicitly

Do not request ZDR for covered models. Document the 30-day retention window as accepted residual risk. **Posture: BAA-covered with documented retention, never ZDR-aspirational.** Recorded as R-001.

### Amendment to finding 5 — scrub is a hard requirement

PHI scrub at intake is no longer a design preference. Memory stores de-identified facts and pointers to systems of record, never payloads. Bi-temporal invalidation accepted as the purge mechanism. Recorded as R-002.

### Condition on finding 6

Complete the adversarial test before **any** production agent routes through Paperclip. Report actual results, not README claims. Telemetry stays disabled, verified by egress capture, and **re-verified after every version upgrade**. Protocol: `../phase1/01-paperclip-adversarial-test.md`.

---

## Flagged problems — both adopted

**Tier map is provisional everywhere it appears.** Eval evidence lands with the Phase 4 golden dataset. Price-informed judgments stay labeled as such. No assignment claims evidence it does not have.

**"Standard resident communications" struck from standing approval entirely.** All resident-facing communication is Tier 2 with full approval. No templates, no exceptions, and no future exceptions without written COO directive. This supersedes the original build directive's approval-efficiency provision and is stricter than it.

---

## Structural fixes — three adopted, one added

1. **Charters co-signed** by the owning director before any agent goes live in that department. No co-signature, no go-live.
2. **Scorecards route director-first, COO second.** In that order.
3. **Finance is Raquel's project with COO sponsorship**, not the reverse.
4. **Added by COO:** before each department enters Phase 5, the COO holds a **1:1 with the owning director, conducted personally, before the system touches their data.**

---

## Rollout order — changed by COO

| | Order |
|---|---|
| Phase 0 recommendation | IT → Fleet → Procedures → Property → Grants → Finance → Comms |
| **Approved** | **Facilities → Fleet → Procedures → IT → Grants → Finance (Raquel's lead) → Comms** |

**Stated rationale:** the order reflects the politics. Facilities and fleet first; finance last under Raquel's lead.

**Two consequences, recorded rather than re-argued:**

- **R-008** — Facilities was sequenced fourth in Phase 0 specifically because it is the highest PHI-leakage surface and the scrubber is its prerequisite. The scrubber therefore moves from a Phase 5 prerequisite to a **Phase 4 deliverable with its own eval set**. Facilities go-live gates on measured accuracy + a defined false-negative rate + the sampling audit running. **Stated fallback:** if the scrubber cannot reach a defensible accuracy figure by end of Phase 4, fleet ships first and facilities waits.
- **R-009** — the observability substrate no longer arrives free with the IT agent. Built directly in Phase 1 (M6), ~2–3 additional build days.

**What the change gets right:** Jude Catral owns both facilities and fleet — the first two departments are one director, one 1:1, one co-signature conversation. And starting where the value is largest rather than where the build is easiest is the correct instinct for a system that has to earn its place.

---

## Labor share — agreed, with addition

Instrumentation only. The four levers stay out of agent scope. The intervention conversation happens in a room with people in it.

**Addition:** the reporting agent's scorecard carries the four levers as **descriptive baselines, clearly labeled operational metrics, not recommendations** — overtime/agency spend, census/utilization, rate/acuity capture, span of control.

**Standing note:** all four data sources are peer functions (HR, Clinical, Nursing, QA/Residential). Each requires a data-sharing agreement with the function that owns it before the metric can appear at all. Influence, not authority. Recorded as a Phase 6 dependency and surfaced now because the conversations take longer than the build.

---

## Blocking questions — answers and status

### Q1 — Authoritative document platform

**Answer given:** *"[Microsoft 365 / Google Workspace — pick the one hosting finance, HR, and controlled documents] is authoritative for Phase 2. The other platform is read-only reference, indexed for search but never cited as a system of record. Permission model inherits the authoritative tenant."*

**Status: RESOLVED 2026-09-17.** The answer as first given was a decision rule, not a decision. I executed the rule against the live Microsoft 365 tenant rather than returning the question. Full findings: `../phase1/03-systems-of-record-audit.md`.

| Domain | Authoritative | Basis |
|---|---|---|
| Email, calendar, Teams chat | **Microsoft 365** | Verified directly |
| Documents, SOPs, finance, HR, controlled | **Google Workspace** | **Confirmed by COO 2026-09-17** |

SharePoint is a dormant shell: three sites, main site's General folder untouched since November 2021, zero documents matching "policy" or "budget" tenant-wide. A $48M organization's controlled documents are not there.

**Two things your instruction did not anticipate:**

1. **The answer is split by domain.** Email is M365; documents are Google. There is no single winner.
2. **"Permission model inherits the authoritative tenant" cannot hold as written** — there are two tenants and the authoritative one differs by domain. Phase 2 must reconcile Google Drive ACLs and Entra identities to one principal. More work, unavoidable, recorded as R-005.

**Confirmed 2026-09-17:** *"Google Workspace is the platform that we will use."* Phase 2 targets Google Workspace for documents, Microsoft 365 for email and calendar.

**What that confirmation did not settle:** the permission model. Two tenants remain, authoritative by domain, and Phase 2 must reconcile Drive ACLs and Entra identities to one principal. R-005 stays open as design work rather than as a question.

### Q2 — PHI scope

**Answer:** hard-scope everything to Class B with scrub at intake. Sign the BAA regardless. Risk analysis must state that free-text fields will contain PHI despite scrubbing and the BAA is the backstop, not the plan.

**Status: RESOLVED.** Recorded as R-002, with that statement quoted verbatim as the governing language.

### Q3 — Operational owner

**Answer:** Sean, effective Phase 1, budgeted at 9–11 hours monthly plus training time, named in the runbook with a designated backup. His hours and the COO's 2–4 approval hours appear in the monthly ops report as a tracked cost of the system.

**Status: REOPENED 2026-09-17 — the Director of IT role is being eliminated.** Condition 4 is void as answered; the condition itself stands. See R-010 and [`../phase1/04-it-director-removal-impact.md`](../phase1/04-it-director-removal-impact.md).

Of the three blocking questions, this was the weakest answer at the time — a single named owner with no designated backup. It is now unanswered, and the answer costs money: an external technical owner at an estimated $1,000–2,500/month. The work did not change; its visibility and unit cost did.

**Original answer, for the record:** **Outstanding:** the designated backup is not yet named — required before Phase 9 handoff, and worth naming earlier, since a single named owner with no backup is the same single-point-of-failure problem the architecture just spent $100/month eliminating at the infrastructure layer.

---

## Phase 1 start conditions

| # | Condition | Status |
|---|---|---|
| 1 | Paperclip adversarial test passed and documented | Protocol written; **blocked on access** |
| 2 | Credential vault live; no plain-text keys, verified | Planned M3; **blocked on access** |
| 3 | Backup and restore test passed against actual memory and config state | Planned M7; **blocked on access** |
| 4 | Sean confirmed as owner | **MET** |

**Blocker:** none of the Tier 1 access requested in `07-access-and-questions.md` has been received. Conditions 1–3 are execution conditions and cannot be met without infrastructure access. The plan, protocol, and risk analysis are written and ready; the clock starts at T+0 when access lands.

---

## New findings since Phase 0

Both surfaced during the live Microsoft 365 audit on 2026-09-17.

| ID | Finding | Severity |
|---|---|---|
| **R-006** | M365 connector holds `Files.ReadWrite.All`, `Mail.ReadWrite`, `Mail.Send`, `Calendars.ReadWrite`, `MailboxSettings.ReadWrite` on the COO's account. `Mail.Send` is a Tier 2 capability with no approval gate in front of it. | **Act now** — off critical path, Entra admin change, owner Sean, M10 |
| **R-007** | SharePoint host is `spectrumforliving2.sharepoint.com`. The `2` suffix suggests a prior tenant. If one exists and holds data, it is an un-inventoried system of record. | Investigate — not blocking |
