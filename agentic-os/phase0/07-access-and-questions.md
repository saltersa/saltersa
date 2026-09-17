# Access Request and Blocking Questions

**Phase 0 deliverable.** What I need to begin Phase 1, and the three questions whose answers change irreversible decisions.

---

## The three blocking questions

Per operating rule 8, these are the only questions asked, and each one changes a decision that is expensive or impossible to reverse later.

### Q1 — Google Workspace or Microsoft 365: which is authoritative for documents?

You run both. Outlook and SharePoint are reachable from this session; Google Workspace is listed as an existing asset.

**Why it blocks:** Phase 2 builds the knowledge layer — ingestion, hybrid index, and a permission model that mirrors the source system. Every agent answers from that layer and cites it. Building the index and the permission model against the wrong platform means rebuilding both, and by then the department agents will have been citing against it.

**Why I am not deciding this myself:** the decision depends on facts I do not have — where your SOPs, contracts, grant files, and property records actually live today, and which platform your staff actually use. Either answer produces a workable architecture; guessing produces a rebuild.

**What I need:** name one as authoritative for documents. If the honest answer is "both, and it is a mess," say that — the answer is then to pick one as the target state and scope Phase 2 to it, treating the other as a migration source rather than a second index.

### Q2 — Is PHI in scope for the agent surface?

Two viable postures, and they diverge on contract, cost, and design.

**(a) Sign the BAA and run a Class C path.** Anthropic signs a HIPAA BAA for the first-party API; enabling it requires your Primary Owner to sign and then arrange HIPAA-ready configuration through Anthropic. Note the counterintuitive part established in finding 3: HIPAA-ready requires **30-day retention, not zero data retention** — requesting ZDR would disqualify the models. Unlocks the Class C workflows: grant application drafting, forecast drafts, the board packet, access request processing.

**(b) Hard-scope every agent to Class B and below.** No BAA, no Class C path. Those four workflows come out of scope, and the PHI scrubber becomes a hard boundary rather than a classification control.

**My recommendation: (a), and sign the BAA regardless of which you choose.** It costs nothing, and free-text fields will contain PHI whatever the design says. Without it, one leaked work order line is a reportable breach rather than a handled one. Posture (b) with a BAA in place is a defensible belt-and-braces position; posture (b) without one is a bet that the scrubber never misses.

**Why it blocks:** it determines whether the contract path opens now (a multi-week legal cycle that should start immediately if the answer is yes) and whether four workflows enter the Phase 5 build at all.

### Q3 — Who owns this system operationally when you are unavailable?

Your own principle: *anything that only works when I personally run it is a liability, not an asset. Nothing I build should require me.* The directive also requires, for anything built, its steady-state maintenance cost and its owner.

Sean Fallon is the obvious answer — Director of IT, reports to you, and the system runs on infrastructure he would otherwise own. But that is a real addition to his load, and naming him without budgeting for it is how this becomes a system that quietly requires you after all.

**Estimated steady-state maintenance, once Phase 9 is complete:**

| Activity | Cadence | Est. hours/month |
|---|---|---|
| Weekly operating checklist | Weekly | 2 |
| Approval digest handling | Daily, batched | **Yours — 2–4** |
| Monthly improvement cycle review | Monthly | 3 |
| Integration health / deprecation watch | Monthly | 2 |
| Backup restore verification | Quarterly | 1 |
| Incident response | As needed | 1–3 |
| **Total (operational owner)** | | **~9–11** |

Roughly a quarter to a third of a day per week, ongoing, plus your own 2–4 hours on approvals. That is the honest number and it does not go to zero after handoff.

**What I need:** a named operational owner, and confirmation that the hours above are budgeted rather than absorbed. If the answer is Sean, the follow-on question is what comes off his plate — which is your call, not mine.

---

## Access needed for Phase 1

Nothing below is needed to *decide* anything in Phase 0 — the deliverables are complete without it. It is needed to *verify* the assumptions in the audit and to build.

### Tier 1 — Blocks Phase 1 entirely

| Item | Purpose |
|---|---|
| DigitalOcean account / API token | Provision the resilient architecture; audit the existing VM |
| LiteLLM config (current) | Verify `/v1/messages` passthrough; audit fallback chains |
| Anthropic API key (org-scoped) | Router configuration, smoke test |
| n8n instance access | Audit existing workflows for the LLM-call-should-be-a-branch defect |
| Hermes agent source | Confirm or reverse the Reset recommendation in `04` |

### Tier 2 — Blocks the Phase 1 system-of-record inventory

The largest gap in Phase 0 is that I cannot name the products you run for the domains below. Those rows in the classification map are `Unknown`, and the tier map is provisional until they are filled.

| Domain | What I need |
|---|---|
| Work orders / facilities | Product name, read access, export sample |
| Fleet | Product name, read access |
| IT ticketing / assets | Product name, read access |
| Accounting / GL | Product name, **read-only** access — no write, ever |
| Grants pipeline | Product name, or confirmation it is spreadsheets today |

**Read-only throughout Phase 1.** No agent gets write access to any system of record until its charter, tier permissions, and eval evidence exist in Phase 5.

### Tier 3 — Needed by Phase 2/3, not now

- Google Workspace and/or Microsoft 365 admin consent for document ingestion (**scoped by Q1**)
- Historical data for the Phase 3 multi-session replay: 20+ real scenarios per department, de-identified
- Your labeled examples for judge validation (Phase 4, target 0.85+ agreement)

### Credentials handling

No plain-text credentials anywhere, per operating rule 5. Everything lands in the credential vault built in Phase 1. Until that vault exists and passes its restore test, provide nothing beyond Tier 1, and provide those through whatever secret-sharing mechanism IT already uses rather than through this channel.

**Note on this channel specifically:** per your standing constraint, this project never accepts resident or consumer information — no names, incident details, clinical notes, or identifiable billing records. Aggregate and de-identified figures only. The system being designed here handles Class C data under a BAA; this design conversation does not, and that distinction holds for every phase. When Phase 3 needs historical scenarios for the replay benchmark, they arrive de-identified or they do not arrive.

---

## What happens on sign-off

Phase 1 delivers, in order:

1. Resilient infrastructure — two nodes, managed Postgres, Spaces, load balancer
2. Router with named fallbacks per tier **and per data class**, Class C failing closed
3. Cache-aware prompt structure, both automatic and explicit `cache_control` paths, verified by `cache_read_input_tokens`
4. Token accounting, spend caps, budget alerts
5. Credential vault
6. Structured logging to our own Postgres — the trace store that Phase 8's signal store reads
7. Failure alerting with two-consecutive-failures halt
8. Backups, and a **live restore test** — restored, not merely present
9. Paperclip deployed, telemetry off and verified by egress capture, **adversarial enforcement test run and reported**

**Smoke test for sign-off:** one task end to end with the routing decision, cache behavior, and cost visible.

**Rollback:** the existing VM stays running and untouched until the restore test passes on the new infrastructure. Rollback is a DNS change.
