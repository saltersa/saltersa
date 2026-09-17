# IT Director Removal — Impact Analysis and Simplification

**Trigger:** COO direction, 2026-09-17. The Director of IT role is being eliminated.
**Status:** Architecture amendment proposed. Requires COO decision before Phase 1 starts.

---

## The headline

**Condition 4 is void.** Phase 1 was approved on four conditions, the fourth being "Sean confirmed as owner." That condition cannot be met by a role that is being eliminated.

More than that: the architecture approved in Phase 0 assumed a Director of IT existed. Nine components, seven of them self-hosted, on infrastructure someone has to patch. That was a reasonable design with a senior technical owner in the building. Without one it is a liability by your own principle — *anything that only works when I personally run it is a liability* — with "I" replaced by "a person we no longer employ."

**This is not a reason to stop. It is a reason to build something smaller.** What follows is the simplification, and the one cost it cannot remove.

---

## The contradiction worth naming first

You are eliminating your only senior technical role while standing up a self-hosted agentic platform. Those two decisions point in opposite directions, and if both proceed unchanged the platform becomes an orphan within a year — running, unpatched, until something breaks that nobody can fix.

I am not arguing against the role elimination. That is an org-design call in your domain, and if it is aimed at the 68.0% labor share it is aimed at the right target. I am saying the architecture has to change to match it, and that the change does not make the system free — it converts a salaried cost into a contracted one.

**One directive-level amendment follows from this.** The original build directive states a preference for *"self-hosted open-source where quality is comparable."* That preference was written when an IT Director existed. The premise has changed, so the preference should change with it: **managed where the quality is comparable, self-hosted only where it buys something specific.** Everything below applies that inversion.

---

## What the simplification actually is

### Component count: 9 → 5

| # | Was | Now | Why |
|---|---|---|---|
| 1 | 2 × droplets + load balancer | **Managed app platform** | Removes OS patching, security updates, LB config — the work that actually requires an IT Director, and the work that quietly lapses without one |
| 2 | DO Managed Postgres | **Keep** | Already managed. Backups, PITR, failover are someone else's job. |
| 3 | DO Spaces | **Keep** | Object storage needs no operator. |
| 4 | Graphiti + Kùzu (memory) | **Postgres + pgvector** | One database instead of a database plus a graph engine. See below — this reverses my Phase 0 call. |
| 5 | Knowledge index | **Same Postgres + pgvector** | Knowledge and memory share one store. |
| 6 | n8n self-hosted | **n8n Cloud** | ~$25–50/mo to stop running a workflow server. Its value — a non-engineer can see and edit the workflows — matters *more* without an IT Director, not less. |
| 7 | LiteLLM | **Keep**, on the managed platform | One container, low maintenance, and it is the no-lock-in guarantee. Earns its place. |
| 8 | Paperclip | **Re-opened** — see below | The adopt case weakens materially without a technical owner. |
| 9 | Custom agent processes | **Keep**, on the managed platform | Thin by design. |

### Reversing the memory decision

Phase 0 selected Graphiti self-hosted, and the reasoning was sound: Apache 2.0, multi-backend portability, and bi-temporal edges that give provenance and validity intervals — the memory layer's data model *is* the audit trail.

**That reasoning survives. The conclusion does not.** The key realisation is that bi-temporal modelling is a *schema pattern*, not a product. Valid-from / valid-to / recorded-at columns with source-episode references reproduce the audit property in Postgres. What you give up is Graphiti's automatic entity extraction and multi-hop graph traversal.

At your scale — seven agents, 25 sites, 688 employees — I judge that trade worth taking to remove an entire service. It is one less thing to run, one less thing to upgrade, one less thing to restore.

**I am flagging this as a reversal, not presenting it as the original plan.** And it stays honest: **Graphiti remains the named challenger at the Phase 3 multi-session replay benchmark.** If Postgres + pgvector cannot surface the right prior context on your reconstructed historical scenarios, Graphiti comes back and the extra service is justified by measurement rather than by architecture taste. Phase 3 still does not sign off without that benchmark.

### Re-opening Paperclip

The Phase 0 adopt case rested on a cost/benefit that assumed a maintainer: MIT license, self-hosted, version-pinned, upgrades reviewed monthly by the systems integrator. R-004 recorded abandonment risk as acceptable *because Sean could maintain it*.

Without an internal technical owner, adopting a six-month-old, pseudonymously-maintained, self-hosted Node application as the governance layer is a materially different decision.

**Recommendation: keep Paperclip in the plan, but the adversarial test is now a go/no-go on the governance approach, not just on the product.** Concretely:

- If the test passes cleanly, adopt. On a managed platform Paperclip is one more container, and the 3–4 weeks it saves matter more, not less, when there is no in-house engineer to spend those weeks.
- If the test shows any material gap, **do not build the thin custom control plane either.** Instead, shrink the governance requirement to what the rest of the stack already provides: spend caps at the provider and in the router, an approval queue in Postgres, and the audit trail in the trace store we are building regardless. That is a smaller thing to own than either Paperclip or a custom plane.

That third option did not exist in Phase 0 because the governance requirement was written assuming someone could run a governance application. It is the genuinely simple answer if the test disappoints.

---

## What simplification does not fix: the owner

This is the part that cannot be designed away, and it is the reason this document exists.

**The system needs a named technical owner. If the role is gone, that owner is external and costs money.**

| Model | Scope | Est. monthly |
|---|---|---|
| MSP retainer, platform only | Patching, monitoring, incident response, upgrades for this system | **$1,000–2,500** |
| Fractional CTO / DevOps contractor | ~10–15 hrs/mo | **$1,500–3,000** |
| Implementation partner on retainer | Build then maintain | Varies |
| Fold into an existing org-wide MSP | Marginal add to an existing contract | **Lowest — see below** |

### Revised run rate

| Line | Phase 0 plan | Simplified |
|---|---|---|
| Infrastructure | $125–185 | **$140–225** |
| Model spend | $50–250 | $50–250 |
| Technical owner | *Absorbed in Sean's salary* | **$1,000–2,500** |
| **Total** | **$175–435** + hidden hours | **$1,190–2,975** |

Two things to read off that table.

**First: the simplification is free in infrastructure terms.** Managed compute costs about what two droplets and a load balancer cost. It does not save money; it saves the thing that needs a person. That is the correct trade to make and it should not be sold as a cost reduction.

**Second, and this is the one to take to the CEO:** the 9–11 hours per month did not appear when the role was eliminated. It was always there, hidden inside a salary line. Removing the role converts it from salary to invoice, makes it visible, and — per hour — probably makes it more expensive. If the role elimination is aimed at the labor-share problem, this system's share of the offset is roughly **$12,000–30,000 annually** that moves from payroll to contract services. It still comes out of labor share as the 990 reports it, which is real, but it is not a saving and should not be presented as one.

### The leverage point, and it is a big one

**Who is doing IT for 688 employees across 25 sites after this role is eliminated?**

That question is much larger than this project, and this project should not answer it alone. But if the answer is an MSP — which it usually is at this size — then **this platform rides on that same contract as a marginal add rather than a standalone retainer.** The difference between a dedicated platform retainer and a line item on an existing MSP agreement is most of the $1,000–2,500.

This is the compounding effect worth pressing on. You are about to negotiate or expand an IT services contract anyway. Specifying this platform's requirements *during* that negotiation costs nearly nothing; bolting a separate retainer on afterwards costs the full amount. **Recommendation: do not sign a platform retainer until the org-wide IT coverage decision is made.** Sequence matters more than the number here.

---

## Urgent, time-boxed: departing-admin access review

**This is the most time-sensitive item in the document and it is independent of every architecture decision above.**

An IT Director departure with outstanding administrative access is a standard access-review trigger, and the window closes on their last day. Enumerate and transition, before departure:

| System | What to check |
|---|---|
| Microsoft 365 / Entra | Global Admin and all admin role assignments; **includes R-006's connector scopes** |
| Google Workspace | Super Admin assignments — now the authoritative document platform |
| DigitalOcean | Account ownership, API tokens, SSH keys on the existing VM |
| LiteLLM / n8n / existing VM | Root and application credentials |
| Any MSP or vendor portals | Named contacts and admin seats |
| Provider API keys | Anthropic, OpenRouter — rotate on departure |
| Network, telephony, door access, building systems | Whatever IT holds that is not obvious from a software inventory |

Two notes on ownership. First, **this reaches into HR process** — offboarding is Joan Garcia's function, and access review is a joint IT/HR/Compliance exercise. Influence, not authority. Second, **R-006 becomes more urgent, not less.** `Mail.Send` and write scopes on your mailbox held by a connector, during a period when admin access is changing hands, is exactly the combination an auditor asks about. It was off the critical path as a hygiene item. It is now on it.

**This should start this week, regardless of what you decide about the architecture below.**

---

## What breaks in the approved plan

| Item | Status | Resolution |
|---|---|---|
| **Condition 4** — Sean confirmed as owner | **VOID** | New owner required before Phase 1 starts |
| **Q3** — operational owner and backup | **REOPENED** | Was the weakest of the three answers; now unanswered |
| **R-006** owner (Sean) | Reassign | Part of the access review above |
| **R-007** investigation (legacy tenant) owner | Reassign | Ask before departure — this knowledge leaves with the person |
| **M10** in the Phase 1 plan | Reassign | Same |
| Monthly maintenance model | Rewritten | External owner, contracted hours, named in the runbook |
| Paperclip upgrade review | Rewritten | Was "systems integrator monthly"; needs a contracted owner |

### The IT agent now has no co-signer

A structural consequence that is easy to miss. Your binding department gate requires each agent's charter to be **co-signed by the owning director**. IT is fourth in the rollout order and, after this change, has no director.

You would be co-signing with yourself, which defeats the purpose of the gate — the gate exists so that instrumentation is co-owned rather than imposed.

**Recommendation:** when IT's turn comes, the co-signer is whoever holds operational accountability for IT by then — the MSP relationship owner, or the person the function folds under. If the honest answer is "nobody but the COO," then the IT agent should be deferred rather than shipped without a co-signer. A gate you waive once is not a gate.

---

## Recommendation

1. **Start the access review this week.** Independent of everything else, and the window closes on a date you do not control.
2. **Do not start Phase 1 until a technical owner is named** — internal, contracted, or MSP. Condition 4 stands as a condition; only its answer changed.
3. **Make the org-wide IT coverage decision first**, then attach this platform to it. Do not sign a standalone platform retainer before that conversation.
4. **Adopt the five-component simplified architecture.** Same infrastructure cost, materially less to operate.
5. **Reverse the memory decision** to Postgres + pgvector with a bi-temporal schema, Graphiti as the named challenger at the Phase 3 replay benchmark.
6. **Treat the Paperclip adversarial test as a go/no-go on the governance approach**, with the shrink-the-requirement option as the fallback rather than a custom build.
7. **Take the $12–30k annual number to the CEO** as part of the role-elimination case, before someone else finds it.
