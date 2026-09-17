# System Ownership and Continuity Plan
## COO Agentic Operating System — Spectrum for Living Development, Inc.

| | |
|---|---|
| **Organization** | Spectrum for Living Development, Inc., River Vale, New Jersey |
| **System** | COO Agentic Operating System |
| **Document owner** | Antonio Salters, Chief Operating Officer |
| **Version** | 1.0 |
| **Effective** | _______________ |
| **Next review** | Six months from effective date, or on any change to Section 1 |

**Purpose.** This document names who runs the system, what they do, and what happens when they are unavailable. It exists so the system does not depend on any one person — including the COO.

> **HOW TO SWAP THE OWNER.** Everything in this document refers to **the System Owner**. To move ownership from the Director of IT to Aspen Technology, **edit Section 1 only.** No other section changes.

---

## Section 1 — Who owns this system

**THIS IS THE ONLY SECTION THAT CHANGES WHEN OWNERSHIP MOVES.**

### 1.1 System Owner — CURRENT

| Field | Value |
|---|---|
| **Role** | **Director of Information Technology** |
| **Name** | _______________ |
| **Type** | Internal employee |
| **Reports to** | Antonio Salters, COO |
| **Email** | _______________ |
| **Phone** | _______________ |
| **Committed hours** | **8–10 hours per month** |
| **Cost basis** | Within existing salary |
| **Contract / SLA** | N/A — employee |
| **Response commitment** | Same business day for Priority 1 (Section 5) |

### 1.2 System Owner — ALTERNATE (managed service provider)

**To activate: delete Section 1.1 above, renumber this to 1.1, and complete the blanks.**

| Field | Value |
|---|---|
| **Role** | **Managed Service Provider** |
| **Organization** | **Aspen Technology** |
| **Primary contact** | _______________ |
| **Escalation contact** | _______________ |
| **Support line** | _______________ |
| **Email / ticket portal** | _______________ |
| **Committed hours** | **8–10 hours per month** |
| **Cost basis** | $_______ per month — see note below |
| **Contract / SLA reference** | _______________ |
| **Response commitment** | Per SLA. Must meet or exceed Section 5. |
| **Contract renewal date** | _______________ |

**Cost note, for the record.** An external System Owner for this platform is estimated at **$1,000–2,500 per month** as a standalone retainer. If Aspen Technology also holds the organization-wide IT contract, this platform should be scoped as a **line item on that agreement**, not a separate retainer — the difference is most of that figure. Do not sign a standalone platform retainer before the organization-wide IT coverage decision is made.

### 1.3 Backup Owner — continuity only

| Field | Value |
|---|---|
| **Name** | **Antonio Salters** |
| **Role** | Chief Operating Officer |
| **Email** | asalters@spectrumforliving.org |
| **Scope** | **Continuity only.** Keep the system safe and stopped. Not a technical substitute — see Section 4. |

### 1.4 Executive sponsor

| Field | Value |
|---|---|
| **Name** | Antonio Salters, COO |
| **Authority** | Approves all Tier 2 and Tier 3 actions. Approves spend above cap. Sole authority to change data classification. |

### 1.5 Standing reviewers — peer functions

These are requests for review, not lines of authority. Neither reports to the COO.

| Function | Name | Reviews |
|---|---|---|
| Compliance, Quality & Special Projects | Alla Aslanyan, VP | Data classification map; HIPAA posture; any change to Class C handling |
| Human Resources | Joan Garcia, CHRO | Anything touching personnel records; offboarding and access review |

---

## Section 2 — What the system is

A set of software agents that support the COO's operating departments: **property and facilities, fleet, IT, grants, finance support, operating procedures, and systems.**

**Organization context.** ~688 employees. Up to 1,000 individuals served. ~$48M annual revenue, approximately 96% Medicaid fee-for-service. Fourteen group homes, five supervised apartments, five adult day programs, and an ICF in Closter. Service area: Bergen, Passaic, and Middlesex counties.

**The system is five components.** It was deliberately simplified from nine so that one person at 8–10 hours per month can run it.

| # | Component | What it does | Managed by |
|---|---|---|---|
| 1 | Managed application platform | Runs the agents and the router | Vendor (no servers to patch) |
| 2 | Managed PostgreSQL + pgvector | Knowledge, memory, audit trail, approvals | Vendor (backups and failover automatic) |
| 3 | Object storage | Backups and index snapshots | Vendor |
| 4 | n8n Cloud | Scheduled and rule-based workflows | Vendor |
| 5 | Model router (LiteLLM) | Sends each request to the right AI model | System Owner |

**Connected systems of record.**

| Domain | Authoritative system |
|---|---|
| Documents, SOPs, policies, contracts, finance, HR | **Google Workspace** |
| Email, calendar, Teams chat | **Microsoft 365** — tenant `spectrumforliving.org` |
| Work orders, fleet, IT tickets, accounting, grants | To be inventoried |

**Data rules that must never be relaxed without written COO direction.**

1. **Class C data** — resident information, personnel records, financial detail, credentials — goes only to AI models covered by our signed Business Associate Agreement. If no covered model is available, the system **stops and notifies**. It never falls back to an uncovered one.
2. **No agent holds payment credentials.** Ever.
3. **The grants agent never submits.** The finance agent never executes payments.
4. **All resident-facing communication requires COO approval.** No templates, no standing approval.
5. **Personal health information is removed at intake.** If removal cannot be confirmed, the item is treated as Class C.

---

## Section 3 — What the System Owner does

**Total: 8–10 hours per month.** Plus 2–4 hours per month of COO approval time, tracked separately.

### Weekly — about 30 minutes

| Task | What "good" looks like |
|---|---|
| Review the health dashboard | No halted workflows; no failed backups |
| Check the error queue | Any workflow halted by two consecutive failures is investigated, not just restarted |
| Confirm spend is within cap | Month-to-date under budget; no single agent running hot |

### Monthly — about 4 hours

| Task | What "good" looks like |
|---|---|
| Review the cost report | Spend by tier matches expectation; explain any variance over 25% |
| Review the improvement backlog | Proposed changes reviewed; nothing ships without passing its test gate |
| Check for vendor changes | Model deprecations, price changes, security advisories |
| Apply pending updates | Version-pinned; applied deliberately, never automatically |
| Confirm telemetry is still off | Re-verified after every version update — a vendor default can silently return |

### Quarterly — about 3 hours

| Task | What "good" looks like |
|---|---|
| **Restore test** | A backup is restored into a clean environment and confirmed working. **Not "a backup exists." Restored.** |
| Access review | Everyone with administrative access still needs it |
| Model tier review | Each workflow still on the cheapest model that meets its quality bar |

### As needed

| Task | Trigger |
|---|---|
| Incident response | Section 5 |
| Onboarding a new agent | COO request, after the department charter is co-signed |
| Access changes | Any staff departure or role change with system access |

---

## Section 4 — Contingency: when the System Owner is unavailable

**The principle, stated plainly.** Antonio Salters is the Backup Owner. He is the Chief Operating Officer, not an engineer. His job in a contingency is to **keep the system safe and stopped** — not to keep it running.

This is a deliberate design choice. A non-technical backup who tries to keep a system running will make it worse. A non-technical backup who can stop it cleanly, protect the data, and get the right help has done the whole job. **Everything below is built around that.**

### 4.1 What the Backup Owner can and cannot do

| Can do | Cannot do |
|---|---|
| Execute the emergency halt (4.3) | Debug an error |
| Authorize emergency spend | Patch or update software |
| Engage the emergency vendor (4.4) | Restore a database |
| Notify staff and leadership | Change system configuration |
| Approve or reject pending Tier 2/3 items | Write or modify agent instructions |
| Decide the system stays down | Bring the system back up |

**Restarting the system after an emergency halt requires the System Owner or the emergency vendor. This is intentional.**

### 4.2 Three scenarios

| Scenario | Definition | Action |
|---|---|---|
| **A — Short absence** | Owner out under 5 business days, reachable for emergencies | System continues. Weekly checks skipped. COO monitors for halts. No action unless Priority 1. |
| **B — Extended absence** | Owner out over 5 business days, or unreachable | COO engages the emergency vendor (4.4) for weekly checks only. No updates, no changes, no new agents. System runs in maintenance mode. |
| **C — Owner departed** | Role vacant, contract ended, or relationship terminated | **Emergency halt (4.3) within 24 hours unless a replacement owner is already in place.** Access review (Section 6) completed before any restart. |

**Scenario C is not pessimism.** A system with no owner and live credentials into Google Workspace and Microsoft 365 is a standing risk. Stopping it costs a few days of convenience. Leaving it running unattended costs whatever the worst case turns out to be.

### 4.3 Emergency halt — "break glass"

**Anyone reading this can do this. No technical skill required. Under five minutes.**

This stops all AI activity immediately. **No data is lost.** Nothing is deleted. The system simply stops acting.

| Step | Action | Where | Effect |
|---|---|---|---|
| 1 | Set the AI provider spend limit to **$0** | Anthropic Console → Billing → Limits<br>URL: _______________ | Every agent stops making AI calls immediately |
| 2 | Pause all workflows | n8n Cloud → Workflows → Deactivate all<br>URL: _______________ | No new work is triggered |
| 3 | Revoke the API key | Anthropic Console → API Keys → Revoke<br>Key name: _______________ | Belt and braces — nothing can call out |
| 4 | Notify | Email the System Owner, the emergency vendor, and Salvador Moran | People know before they notice |
| 5 | Record it | Note the date, time, who halted it, and why | Required for the audit trail |

**What keeps working after a halt:** email, calendar, Google Workspace, and every department system. **The halt stops the agents, not the organization.** Staff will not notice unless they were waiting on an agent-produced report.

**To restart:** System Owner or emergency vendor only. Never the Backup Owner alone.

### 4.4 Emergency vendor — arranged in advance

**This must be set up before it is needed. A procurement cycle during an incident is a failed contingency.**

| Field | Value |
|---|---|
| **Organization** | **Aspen Technology** (or alternate: _______________) |
| **Contact** | _______________ |
| **Emergency phone** | _______________ |
| **Engagement letter on file?** | ☐ Yes ☐ No — **required before Phase 1 sign-off** |
| **Pre-authorized spend without further approval** | **$_______ ** (recommend $5,000) |
| **Scope** | Emergency restart, incident response, temporary weekly checks under Scenario B |

**Why the pre-authorization matters.** In Scenario C the COO may need help within 24 hours. A standing engagement letter with a pre-approved dollar figure turns that into a phone call instead of a purchase-order cycle. **This is the single highest-value item in this section and it costs almost nothing to set up.**

### 4.5 Backup Owner's own contingency

If Antonio Salters is also unavailable, authority passes to **Salvador Moran, President & CEO**, who holds the same halt authority under Section 4.3.

**The halt procedure is written so that someone who has never seen this system can execute it.** That is the test it has to pass.

---

## Section 5 — Incident response

| Priority | Definition | Response | Who |
|---|---|---|---|
| **P1 — Critical** | Suspected data exposure; Class C data sent to an uncovered model; agent took an unapproved Tier 2/3 action; credentials compromised | **Halt immediately (4.3), then investigate.** Halt first. Diagnose second. | Backup Owner may halt. System Owner + COO investigate. Alla Aslanyan notified same day if data is involved. |
| **P2 — High** | System down; backups failing; spend cap exceeded | Same business day | System Owner |
| **P3 — Normal** | A workflow halted; an agent producing poor output | Two business days | System Owner |
| **P4 — Low** | Enhancement request; question | Next monthly review | System Owner |

**P1 standing rule: halt first.** The cost of an unnecessary halt is a day of inconvenience. The cost of a P1 left running while someone investigates is a reportable breach. **Nobody is ever criticized for halting the system.** Put that in writing and mean it.

---

## Section 6 — Access register

**Every person with administrative access to any system this platform touches.** Reviewed quarterly and **on every departure**.

| System | Access level | Held by | Reviewed |
|---|---|---|---|
| Google Workspace — Super Admin | Full | _______________ | ____ |
| Microsoft 365 / Entra — Global Admin | Full | _______________ | ____ |
| Cloud hosting account | Owner | _______________ | ____ |
| Managed database | Admin | _______________ | ____ |
| n8n Cloud | Admin | _______________ | ____ |
| AI provider console | Admin / billing | _______________ | ____ |
| Credential vault | Admin | _______________ | ____ |
| Legacy systems / existing VM | Root, SSH keys | _______________ | ____ |

### 6.1 Departure checklist — complete BEFORE the last day

**Any departure of a person with system access, and especially the System Owner.**

- ☐ Every row in the access register above reviewed and reassigned
- ☐ All AI provider API keys rotated
- ☐ SSH keys removed from all servers
- ☐ Credential vault access transferred, then revoked
- ☐ Google Workspace and Microsoft 365 admin roles reassigned
- ☐ Vendor portal contacts updated (hosting, n8n, AI provider, Aspen Technology)
- ☐ **Undocumented knowledge captured** — ask directly: *what do you know about our systems that is written down nowhere?*
- ☐ Microsoft 365 connector reduced to read-only scopes (removes `Mail.Send`, `Files.ReadWrite.All`, `Mail.ReadWrite`, `Calendars.ReadWrite`, `MailboxSettings.ReadWrite`)
- ☐ Confirm whether a legacy Microsoft tenant exists — our SharePoint host is `spectrumforliving2.sharepoint.com`, and the `2` suggests an earlier tenant that may still hold documents
- ☐ Checklist countersigned by COO and CHRO

**The last two items are easy to miss and expensive to recover.** Both are knowledge that walks out the door.

---

## Section 7 — Where everything lives

| What | Where |
|---|---|
| This document | _______________ |
| Architecture and decisions | `agentic-os/` repository, `phase0/` |
| Risk register | `agentic-os/phase1/02-risk-analysis.md` |
| Runbook (procedures) | Delivered at Phase 9 |
| Credentials | Credential vault — never in email, chat, or documents |
| Audit trail | Managed PostgreSQL, exportable |
| Backups | Object storage, restore-tested quarterly |

---

## Section 8 — Sign-off

This plan is in effect when signed. The system does not start Phase 1 until Section 1 is complete and Section 4.4 has an engagement letter on file.

| Role | Name | Signature | Date |
|---|---|---|---|
| **System Owner** | _______________ | _______________ | ____ |
| **Backup Owner** | Antonio Salters | _______________ | ____ |
| **Executive Sponsor** | Antonio Salters, COO | _______________ | ____ |
| **Acknowledged — CEO** | Salvador Moran | _______________ | ____ |

**Review triggers.** Any change to Section 1. Any departure of a person named in Section 6. Any P1 incident. Otherwise every six months.

---

### Open items before this plan can be signed

| # | Item | Owner | Status |
|---|---|---|---|
| 1 | Name the System Owner — internal or Aspen Technology | COO | ☐ |
| 2 | Engagement letter with emergency vendor, with pre-authorized spend | COO | ☐ |
| 3 | Complete the access register (Section 6) | COO / IT / HR | ☐ |
| 4 | Fill in console URLs and key names in the halt procedure (4.3) | System Owner | ☐ |
| 5 | Signed Business Associate Agreement with the AI provider | COO | ☐ |
| 6 | Review by Alla Aslanyan (Compliance) and Joan Garcia (HR) | COO to request | ☐ |

**Item 2 is the one to do first.** It is a single letter, it costs almost nothing, and without it the entire contingency in Section 4 depends on making a cold call during an emergency.
