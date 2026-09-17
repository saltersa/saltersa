# Data Classification Map

**Phase 0 deliverable.** Every system of record and every workflow, classified before any agent, memory, or model touches it. A workflow's model tier is determined **first by data class, then by cost**.

**Review status:** DRAFT — not yet reviewed by Compliance. Alla Aslanyan (VP Compliance, Quality & Special Projects) should be a named reviewer before Phase 1 ships, and Joan Garcia (CHRO) on every row touching personnel records. Both are peer functions; this is a request for review, not a direction to approve.

---

## Classes

| Class | Definition | Permitted models | Storage rules |
|---|---|---|---|
| **A** | Public / low sensitivity | Any tier | No restriction |
| **B** | Internal / operational | US/EU-hosted or self-hosted | Standard encryption |
| **C** | Protected — resident, personnel, financial detail, credentials, grant-confidential | Self-hosted, or US-hosted under BAA with no-training terms | Encrypted at rest, access-logged, **never in non-compliant memory**, never in offshore API memory |

Per finding 2 in the executive summary, the offshore bulk tier is recommended out of the architecture entirely. The A/B/C distinction still governs everything else — memory placement, storage, logging, and retention — and remains load-bearing even with a single provider.

---

## Systems of record

Every department maps to exactly one authoritative system. Agents read and write **only** through these. Data appearing in two places is a defect to report, not a workaround to build around.

| Domain | System of record | Class | Status |
|---|---|---|---|
| Documents / SOPs / policies | **UNRESOLVED — Google Workspace or Microsoft 365** | B (C for some contracts) | **Blocking Q1** |
| Email — internal | Outlook / Microsoft 365 | B–C | Confirmed reachable |
| Email — external | Outlook / Microsoft 365 | B–C | Confirmed reachable |
| Calendar | **UNRESOLVED — follows Q1** | B | Blocking Q1 |
| Work orders / facilities | To be inventoried | B | **Unknown — see gap list** |
| Fleet records | To be inventoried | B | **Unknown** |
| IT tickets / assets | To be inventoried | B | **Unknown** |
| Accounting / GL | To be inventoried | C | **Unknown** |
| Billing / claims | To be inventoried | **C — out of agent scope** | Maria Contreras, Director of Billing |
| HRIS / personnel | To be inventoried | **C — peer function (Joan Garcia)** | Not a COO domain |
| Grants pipeline | To be inventoried | A (research) / C (drafts w/ financials) | **Unknown** |
| EHR / clinical | Not in scope | **C — peer function (Susan Mancuso)** | Excluded by design |
| Messaging | WhatsApp | B–C | Integration exists; see risk note |

**The inventory gap is the single largest unknown in Phase 0.** I can classify what a system holds, but I cannot name the products you run for work orders, fleet, IT ticketing, accounting, or grants without access. Those rows are filled in at the top of Phase 1 and the model tier map is provisional until they are. This is an access problem, not an analysis problem — see `07-access-and-questions.md`.

---

## Workflow classification

Class is assigned by the **most sensitive field the workflow can touch**, not the typical case. The "after scrub" column is the design target from executive summary finding 5.

### Property and facilities

| Workflow | Raw class | After scrub | Notes |
|---|---|---|---|
| Work order intake | **C** | **B** | Free text at residential sites will name residents. Scrub at capture is the control that makes this whole agent Class B. |
| Work order triage / routing | B | B | Site, asset, category, severity only |
| PM scheduling & compliance | B | B | Asset-level, no individuals |
| Vendor authorization drafts | B | B | Tier 2 — approval required |
| Turnover coordination | **C** | **B** | Unit turnover correlates to a specific resident leaving. De-identify to unit ID. |
| Capital project rollups | B | B | |

### Fleet

| Workflow | Raw class | After scrub | Notes |
|---|---|---|---|
| Lifecycle / TCO analysis | B | B | Cleanest dataset in the portfolio |
| Maintenance scheduling | B | B | |
| Replacement recommendations | B | B | |
| Transport logs | **C** | **B** | Trip records tied to individuals are PHI. Aggregate to route/vehicle. |

### IT

| Workflow | Raw class | After scrub | Notes |
|---|---|---|---|
| Ticket intake / triage | B | B | Ticket text may contain credentials — scrub |
| Asset inventory | B | B | |
| Uptime monitoring | B | B | |
| Access request processing | **C** | **C** | Personnel identity. Tier 1 write at most; no autonomous provisioning. |

### Grants

| Workflow | Raw class | After scrub | Notes |
|---|---|---|---|
| Opportunity research | **A** | A | The genuine Class A volume in the portfolio |
| Deadline calendar | B | B | |
| Application drafting | **C** | **C** | Org financials, sometimes census and outcome data |
| Compliance checklist | B | B | |
| Reporting calendar / drafts | **C** | **C** | |
| **Submission** | — | — | **Never. Tier 3, human only.** |

### Finance

| Workflow | Raw class | After scrub | Notes |
|---|---|---|---|
| Budget variance analysis | **C** | **B** | At GL/aggregate level this is Class B. Keep it there. |
| Expense categorization | **C** | **B** | Vendor + GL code, not claims |
| Invoice / receipt processing | **C** | **B** | Scrub any resident-identifying line items |
| Forecast drafts | **C** | **C** | Ties to census and rate detail |
| **Payment execution** | — | — | **Never. No agent holds payment credentials.** |

### Procedures librarian

| Workflow | Raw class | After scrub | Notes |
|---|---|---|---|
| SOP versioning / drafting | B | B | Published SOPs are Class A |
| Owner & review-date tracking | B | B | |
| Change routing | B | B | Tier 2 to COO approval |

### Executive layer

| Workflow | Raw class | After scrub | Notes |
|---|---|---|---|
| Chief-of-staff routing | B | B | Sees request metadata; never executes Tier 2+ |
| Weekly scorecard | **C** | **B** | KPI aggregates are Class B. Keep individual-level detail out. |
| Monthly board packet | **C** | **C** | Financial detail, strategic content |
| Communications drafting | B–C | B–C | Tier 2 only, always |

---

## Memory placement rules

Binding on every agent, and the rule that makes Phase 3's purge policy achievable:

1. **Class C payloads never enter the memory graph.** Not scrubbed-and-hoped. Never.
2. Memory stores **de-identified durable facts** (vendor terms, building quirks, funder preferences, recurring failure modes) and **pointers into the systems of record**.
3. Purge = purge in the system of record + tombstone the pointer. This is why the bi-temporal invalidate-don't-delete behavior of the memory engine is acceptable — nothing protected is in it to delete.
4. Memory banks are scoped per-agent, per-department, org-wide. Write scope enforced at the agent, read scope at retrieval.
5. Any proposed memory write that fails classification is rejected and logged as a signal, not silently dropped.

---

## Two risks worth naming now

**WhatsApp.** It is listed as an existing integration. Staff will use it to send whatever is in front of them, including resident information, regardless of policy. Any WhatsApp intake path must be treated as a **Class C ingress by default** with scrubbing before anything reaches an agent or a memory bank. Do not classify it by intended use.

**The scrubber is now a compliance control.** Finding 5 makes PHI scrubbing at intake the mechanism that keeps most of the portfolio at Class B. That means the scrubber is not a convenience — it is the control that the classification depends on. It needs its own accuracy measurement, its own failure alerting, and a fail-closed default: if scrubbing cannot be confirmed, the item routes to the Class C path rather than proceeding. This belongs in the Phase 4 golden dataset as its own test set, and it is the first thing a compliance reviewer will ask to see evidence for.
