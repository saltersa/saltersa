# Risk Analysis — Accepted Residual Risk

**Phase 1 deliverable.** Records risks accepted by COO decision, with the reasoning and the compensating controls. This is the document a compliance reviewer, an auditor, or a successor COO reads to understand why the system is built the way it is.

**Review status:** Requires review by Alla Aslanyan (VP Compliance, Quality & Special Projects) before Phase 2. Peer function — request, not direction. Joan Garcia (CHRO) on R-002 and R-006.

---

## R-001 — 30-day data retention on BAA-covered models

**Accepted by COO, Phase 1 approval.**

**Risk.** Class C content sent to Anthropic under the BAA is retained for 30 days. Zero data retention is not available for Covered Models and must not be requested — requesting it would disqualify the models the system depends on.

**Why accepted.** HIPAA-ready and ZDR are alternative postures, not a ladder. The BAA plus HIPAA-ready configuration is the compliant path; ZDR is the non-compliant one for this use case. The residual exposure is a 30-day window under contractual no-training terms with a signed business associate agreement — which is the standard posture for covered entities using commercial AI APIs, not an exception carved for us.

**Stated posture:** BAA-covered with documented retention. Never ZDR-aspirational.

**Compensating controls.** PHI scrubbing at intake (R-002) means the overwhelming majority of traffic carries no PHI into the window at all. Class C workflows are five out of thirty-seven. Access logging on all Class C calls. Fail-closed routing — no compliant model available means halt, never fall back.

**Residual.** Accepted. Re-evaluate if Anthropic's retention terms change or if a ZDR-eligible covered model becomes available.

---

## R-002 — Free-text fields will contain PHI despite scrubbing

**Accepted by COO, Phase 1 approval. This is the most important risk in the document.**

**Risk.** The architecture holds most of the portfolio at Class B by scrubbing PHI at intake. That control will not be perfect. Work order text from 25 residential sites, WhatsApp messages from staff, and IT ticket bodies will contain resident-identifying information that the scrubber misses.

**Explicit statement, per COO direction:** *Free-text fields will contain PHI despite scrubbing. The BAA is the backstop, not the plan.*

This distinction is load-bearing and belongs in any compliance conversation about this system. The plan is that PHI does not reach the model. The backstop is that when the plan fails — and it will fail at some rate — the receiving party is a contracted business associate under a signed BAA with no-training terms rather than an uncontracted third party. Without the BAA, each scrubber miss is a reportable breach. With it, each miss is a handled disclosure to a business associate.

**This is why the BAA is signed even though PHI is nominally out of scope.** Hard-scoping to Class B is the design; the BAA is what makes the design's failure mode survivable.

**Compensating controls.**

| Control | Requirement |
|---|---|
| Scrubber accuracy | Measured, not assumed. Own eval set in Phase 4. |
| Fail-closed default | Unconfirmed scrubbing routes to the Class C path, never proceeds as Class B. |
| WhatsApp | Class C ingress by default regardless of intended use. |
| Memory | De-identified facts and pointers only. A scrubber miss never becomes a persistent memory record. |
| Alerting | Scrubber failure raises an alert; two consecutive failures halt the workflow. |
| Sampling audit | Human review of a sample of scrubbed items, rate set in Phase 4. |

**The scrubber is now a compliance control, not a convenience.** It needs an owner, a measured accuracy figure, failure alerting, and a documented false-negative rate. A compliance reviewer will ask for evidence of all four.

**Residual.** Accepted with the controls above. The residual is a non-zero PHI disclosure rate to a contracted business associate. That rate must be *measured and reported*, not assumed to be zero.

---

## R-003 — Paperclip enforcement claims unverified at time of adoption

**Open. Closes when the adversarial test passes.**

**Risk.** The control plane was selected on the strength of vendor self-description. If budget enforcement is post-hoc or approval gates are UI-only, the governance model is decorative.

**Control.** `01-paperclip-adversarial-test.md`. Eight cases attacking the enforcement boundary. T4 or T5 failure inverts the adopt decision immediately. No production agent routes through Paperclip until every case passes and results are documented.

**Secondary control.** Provider-side spend cap on the API key, independent of Paperclip. If Paperclip's enforcement fails completely, the provider cap bounds the loss.

**Residual.** Cannot be assessed until the test runs.

---

## R-004 — Paperclip project maturity and single pseudonymous maintainer

**Accepted, with controls.**

**Risk.** Launched March 2026, approximately six months old, very steep adoption curve, maintained under a pseudonym by Paperclip Labs, Inc. Abandonment or breaking changes are plausible.

**Why accepted.** MIT license, self-hosted, our Postgres, our data, our agents. Exposure is abandonment risk rather than access risk. Exit cost is the 3–4 weeks of building the thin custom control plane that adoption defers — a cost we would have paid anyway, not a new one.

**Controls.** Version pinned; no auto-update. Upgrades pass the Phase 8 evaluation gate and canary. Telemetry re-verified by egress capture after every upgrade, per COO condition. Scope boundaries enforced: Paperclip is not the system of record for agent outputs, not the trace store, not the memory or knowledge layer. Those boundaries are what keep the exit cost low; violating any converts a reversible adoption into a dependency.

---

## R-005 — Two collaboration tenants, split authoritative store

**Open. New finding, 2026-09-17. See `03-systems-of-record-audit.md`.**

**Risk.** Email and calendar are authoritative in Microsoft 365, verified directly. SharePoint is a dormant shell — three sites, main site untouched since November 2021, zero policy or budget documents — so documents are authoritative in Google Workspace by elimination. The Phase 2 permission model must reconcile Google Drive ACLs and Entra identities to one principal.

**Why it matters beyond the extra work.** This is a pre-existing instance of the parallel-source-of-truth defect the COO's own operating principles name as a defect to be designed out. It predates this project and this project does not fix it — but every agent that cites a document and every permission check inherits the ambiguity.

**Controls.** Phase 2 designates one authoritative store per data domain explicitly, in writing, and agents cite only from it. The non-authoritative platform is indexed read-only for search and is never cited as a system of record.

**Outstanding.** One confirmation from the COO that Google Workspace holds finance, HR, and controlled documents. The elimination inference is strong but negative — SharePoint is verified empty; Google Drive is not verified full.

---

## R-006 — M365 connector holds write and send scopes

**Open. New finding, 2026-09-17. Phase 1 remediation item.**

**Risk.** The connector currently holds `Files.ReadWrite.All`, `Mail.ReadWrite`, `Mail.Send`, `Calendars.ReadWrite`, and `MailboxSettings.ReadWrite` on the COO's account. `Mail.Send` is a Tier 2 capability with no approval gate in front of it, predating the governance model. Anything authenticating through this connector can send mail as the COO today.

**Control.** Reduce to read-only until the approval gate exists in Paperclip and has passed T4 and T5. Restore write scopes per-capability, gated, in Phase 6. Owner: Sean. Entra admin change.

**Residual after remediation.** Read-only access to the COO's mail, calendar, files, and sites by the connector. Acceptable for Phases 1–5; re-assessed at Phase 6 when the communications assistant needs send capability behind a gate.

---

## R-007 — Possible legacy Microsoft tenant

**Open. Investigation item, not blocking.**

**Risk.** The SharePoint host is `spectrumforliving2.sharepoint.com`. The `2` suffix commonly indicates the preferred name was already taken, most often by an earlier tenant of the same organization. If a legacy tenant exists and holds data, it is an un-inventoried system of record that may contain controlled documents.

**Control.** Sean to confirm existence and disposition. If it exists and holds data, it enters the classification map before Phase 2.

---

## R-008 — Facilities-first rollout precedes proven scrubber

**Open. Consequence of the COO's rollout resequencing. See `00-implementation-plan.md`.**

**Risk.** Phase 0 sequenced Property and Facilities fourth specifically because it is the highest PHI-leakage surface in the portfolio and the scrubber is its prerequisite. The approved order puts it first. The department with the worst data quality (2/5) and highest data risk (4/5) now ships before the control it depends on has operating history.

**Why the resequencing is nonetheless right.** The COO's reasoning is organizational and it is sound: Jude owns both facilities and fleet, so the first two departments are one director, one 1:1, one co-signature conversation. Starting with the highest-value department also means the system proves its worth where it matters rather than where it is easiest. This is a deliberate trade, reaffirmed, and it is the COO's call.

**Controls, which the resequencing makes mandatory rather than optional.**

1. The PHI scrubber moves from a Phase 5 prerequisite to a **Phase 4 deliverable with its own eval set** — built and measured before the first department agent ships, not alongside it.
2. Facilities does not go live on scrubber accuracy alone. It goes live on **measured accuracy plus a defined false-negative rate plus the sampling audit running**.
3. Work order intake is restructured to *structured fields first* (site, asset, category, severity), with free text as a constrained secondary field rather than the primary channel. Reducing what free text has to carry is a better control than scrubbing more aggressively.
4. Charter co-signature by Jude, and the COO 1:1, both precede go-live.

**Residual.** Accepted, given controls 1–4 are gates and not intentions. If the scrubber cannot reach a defensible accuracy figure by the end of Phase 4, facilities does not ship first — fleet does, and facilities waits. That fallback is stated now so it is not a negotiation later.

---

## R-009 — Observability substrate no longer arrives free with the IT agent

**Open. Consequence of the rollout resequencing.**

**Risk.** Phase 0 sequenced IT first partly for a technical reason: the IT agent's asset inventory and uptime monitoring are the same instrumentation the system needs for its own resilience and observability requirements. With IT moved later, that substrate must be built in Phase 1 directly rather than obtained as a by-product.

**Impact.** Additional Phase 1 scope. Not large — the trace store and health monitoring were already Phase 1 items — but the system now monitors itself with purpose-built instrumentation rather than inheriting the department agent's. Estimated: 2–3 additional build days.

**Control.** Explicitly scoped into the Phase 1 plan rather than discovered during Phase 5. When IT does enter Phase 5, its agent reads the existing instrumentation rather than duplicating it — one source of truth per data domain, preserved.

---

## Risk register summary

| ID | Risk | Status | Owner |
|---|---|---|---|
| R-001 | 30-day retention on covered models | **Accepted** | COO |
| R-002 | PHI in free text despite scrubbing | **Accepted, controls mandatory** | COO / Scrubber owner |
| R-003 | Paperclip enforcement unverified | Open — closes on test | Build |
| R-004 | Paperclip maturity, pseudonymous maintainer | Accepted, controlled | Sean |
| R-005 | Two tenants, split authoritative store | Open — needs confirmation | COO |
| R-006 | M365 connector write and send scopes | Open — Phase 1 remediation | Sean |
| R-007 | Possible legacy M365 tenant | Open — investigation | Sean |
| R-008 | Facilities-first precedes proven scrubber | Open — controls are gates | COO / Build |
| R-009 | Observability substrate moved into Phase 1 | Open — scoped | Build |
