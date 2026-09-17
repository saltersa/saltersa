# Phase 0 — Executive Summary

**Status:** Deliverables complete. Awaiting sign-off and three blocking answers before Phase 1.
**Date:** 2026-09-17
**Scope:** Audit, architecture, sequencing, classification. Nothing has been installed, configured, or connected.

---

## Six findings that change the directive

These surfaced during the audit and each one alters something the Master Build Directive specified. They are listed first because four of them change cost, one changes the compliance posture, and one changes what gets built at all.

### 1. Model spend is not your cost problem. Engineering time is.

The directive makes token economics a first-class discipline. That discipline is correct as engineering practice and I am keeping all of it. But the arithmetic at your volume does not support the emphasis.

| Workload | Volume estimate | Model | Cost/run | Monthly |
|---|---|---|---|---|
| Work order triage | 400/mo across 25 sites | Haiku 4.5 (2k in / 300 out) | $0.0035 | **$1.40** |
| IT ticket triage | 300/mo | Haiku 4.5 | $0.0035 | **$1.05** |
| Invoice/receipt extraction | 800/mo | Haiku 4.5 | $0.0025 | **$2.00** |
| Weekly dept scorecard | 4/mo × 7 depts | Sonnet 5 (40k in / 4k out) | $0.12 | **$3.36** |
| Monthly board packet | 1/mo | Opus 5 xhigh (100k in / 15k out) | $0.88 | **$0.88** |
| Grant opportunity research | 40/mo | Sonnet 5 + web search | ~$0.15 | **$6.00** |

Order of magnitude for the whole department agent roster at steady state: **$50–250/month**, and that is before prompt caching, which the directive correctly mandates and which removes most of the input cost on repeated charter prefixes.

Sources: [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing) (Haiku 4.5 $1/$5, Sonnet 5 $2/$10, Opus 5 $5/$25 per MTok).

**Interpretation:** A 688-employee, ~25-site, $48M organization does not generate frontier-model-scale token volume from operational work. The levers that matter here are the ones that reduce *engineering and maintenance* hours, not the ones that shave cents off a $150 bill. I am keeping token accounting, spend caps, and the cache-first structure — they cost nothing to build correctly at the start and they are your audit evidence. I am **not** going to spend build time on a dynamic complexity router, and I am recommending against the offshore bulk tier entirely. See finding 2.

### 2. Recommend dropping DeepSeek from the architecture.

The directive specifies DeepSeek V4.1-Flash as the bulk tier for Class A work, with a residency constraint confining it to public/low-sensitivity data. DeepSeek V4.1-Flash is genuinely cheap — $0.15/$0.60 per MTok off-peak, $0.30/$1.20 peak, with cached input at $0.003/MTok, 1M context ([DeepSeek pricing](https://benchlm.ai/deepseek/api-pricing), [OpenRouter](https://openrouter.ai/deepseek/deepseek-v4.1-flash)).

The problem is what Class A actually contains once you map your real workflows. Work order text, ticket text, facility data, fleet records, invoices, budget detail, personnel records — all Class B or C. What remains genuinely Class A is grant opportunity research, public vendor catalogs, and published SOP drafting. That is a thin slice, and the table above prices that entire slice in single-digit dollars per month on Haiku.

Against that saving you are adding: a second provider contract, a second egress path for a HIPAA-exposed organization to audit, a residency boundary that must be enforced correctly on every single call forever, and a control that a compliance reviewer will ask you to evidence. The directive's own rule — "a capability that cannot survive a compliance review is not a capability" — argues against it, and its own instruction to flag optimization of things that should be eliminated applies directly.

**Recommendation:** Bulk tier is **Haiku 4.5**, US-hosted, same contract and same egress path as every other tier. Saving forgone: roughly **$8–15/month**. Audit surface removed: one entire offshore data path. If Class A volume ever reaches a point where that trade reverses, the router makes it a one-line config change — which is exactly what the no-lock-in rule is for.

### 3. Claude Fable 5.1 cannot be your Class C strategic tier.

The directive names Fable 5.1 and GPT-6 Astra as the strategic tier. Fable 5.1 requires 30-day data retention and is **not available under zero data retention** unless expressly authorized by Anthropic; requests from an org whose retention configuration does not meet the requirement return `400 invalid_request_error`.

Separately, and more usefully: under Anthropic's BAA, **Covered Models require 30-day retention and are not available with ZDR enabled** ([Covered Models under a BAA](https://support.claude.com/en/articles/15455031-covered-models-under-a-business-associate-agreement-baa)). HIPAA-ready and ZDR are two different postures, not a ladder. For PHI you want BAA + HIPAA-ready configuration, *not* ZDR — asking for ZDR would disqualify the models you need.

**Recommendation:** Strategic tier is **Claude Opus 5** ($5/$25), not Fable 5.1 ($10/$50). Identical price to GPT-6 Astra's $10/$50 ([OpenAI](https://openai.com/index/gpt-6-astra/)), so Opus 5 is **half the cost of either named option on both legs**, supports effort control from `low` to `max`, and clears the quality bar for board memos and grant drafting at `xhigh`. Reserve Fable 5.1 for a named, evidence-backed exception if Phase 4 evals show Opus 5 missing on a specific workflow — and never for Class C.

### 4. You do not need to buy GPU hardware for Class C.

The directive allows "self-hosted or explicitly contracted US-hosted models with no-training-on-input terms" for Class C, and floats a quantized local model on your own hardware. Anthropic signs a HIPAA BAA for the first-party API ([BAA for commercial customers](https://privacy.claude.com/en/articles/8114513-business-associate-agreements-baa-for-commercial-customers)). OpenAI signs one for API users on Enterprise with ZDR configured ([OpenAI BAA](https://www.protecto.ai/blog/openai-hipaa-baa-what-it-actually-covers-and-what-leaves-phi-exposed/)).

**Recommendation:** Class C runs on the **Anthropic API under BAA + HIPAA-ready configuration**. Capital avoided: a GPU server at roughly **$15–30k capex**, or $1–2k/month for cloud GPU, in exchange for materially worse model quality and a new class of hardware you would own the uptime for. There is no operating case for local inference at your volume.

### 5. The cheapest way to handle Class C is to have less of it.

Design move, applied across every charter: **engineer Class C out of the COO agent surface rather than build a Class C pipeline.**

- **Work orders** — structured intake (site, asset, issue category, severity) with the free-text field PHI-scrubbed at the point of capture. The property agent then runs entirely Class B.
- **Finance** — the agent operates at GL and aggregate-variance level. Claims-level and encounter-level detail stays in Billing's hands and out of the agent surface entirely.
- **Memory** — the memory layer stores de-identified durable facts and *pointers into the systems of record*, never Class C payloads. This collapses the retention/purge problem: purging means purging in the system of record and tombstoning the pointer.

Sign the BAA anyway. Free-text fields will contain PHI regardless of what the design says, and without the BAA a single leaked work order line is a reportable breach. The BAA is the safety net; the scrubbing is the control.

### 6. Adopt Paperclip, scoped to the control plane only.

Full reasoning in `05-paperclip-decision.md`. Short version: it passes the skeptical test on the two things that matter — budget enforcement is atomic at task checkout with automatic pause on overspend, and approval gates are enforced with revisioned, rollback-able config. That is genuine governance, not a dashboard over logs. It fails on memory and knowledge, which are marked as planned-not-shipped on its roadmap, so those get built separately. MIT licensed, self-hosted Postgres, bring-your-own-agent by heartbeat. Telemetry is **on by default** and gets disabled on install.

Caveat stated plainly: those enforcement claims come from the project's own README. Before Phase 1 sign-off I will try to overspend a budget and bypass an approval gate adversarially, and report what actually happens.

---

## What I am recommending you build

| Layer | Decision | Why |
|---|---|---|
| Management plane | **Adopt Paperclip**, control plane only, telemetry off | Real enforcement, MIT, self-hosted; 3–4 weeks saved vs custom |
| Router / harness | **Keep LiteLLM**, keep OpenRouter as fallback path only | Already handles `cache_control` injection *and* stands down when the client sets its own — the dual-path requirement is native |
| Knowledge (Layer 1) | Hybrid search index over the authoritative doc store | **Blocked on Q1** — you run both Google Workspace and Microsoft 365 |
| Memory (Layer 2) | **Graphiti self-hosted**, Kùzu embedded backend | Apache 2.0, multi-backend (lowest exit cost), bi-temporal edges *are* the audit trail |
| Workflows | **Keep n8n**, deterministic branches only | Directive rule: any decision expressible as a branch is a defect as an LLM call |
| Models | Haiku 4.5 / Sonnet 5 / Opus 5, all Anthropic, all under BAA | One contract, one egress path, one audit story |
| Resilience | 2 droplets + managed Postgres + Spaces | ~$125–185/mo, survives loss of any one VM |
| Custom Hermes agent | **Reset** — absorb into the roster | See `04-keep-reset-replace.md` |

Estimated infrastructure run rate: **$125–185/month**. Estimated model run rate at steady state: **$50–250/month**. Combined, under **$450/month** at the top of the range, which I am proposing as the initial hard cap.

---

## The thing I would push back on hardest

This is the item the directive asked me to raise early and briefly, and it is not technical.

You are building an autonomous system that measures work order cycle time, PM compliance, ticket aging, close cycle time, and cost per mile, and reports them weekly — for five direct reports, four of whom (Vahalla, Fallon, Catral, Martinez) were here before your role existed, in an organization where five leaders lost their direct line to the CEO when you were hired. Steve Vahalla was senior here before you arrived. Raquel Martinez holds the top finance role in the organization.

From inside your chair this is instrumentation. From theirs, an AI that scores their department weekly and reports to the new COO who arrived with the CEO is a monitoring system. Same data, entirely different meaning.

The fix is cheap and structural, and it costs you nothing you actually want:

1. **Each department agent's charter and KPI set is co-signed by the director who owns that department.** Not consulted — co-signed. If Jude will not sign the fleet KPI set, the fleet agent is not ready, and that is real information about the KPI set.
2. **The weekly scorecard routes to the director first, you second.** A director who sees their own numbers before you do is being given a management tool. A director whose numbers reach you first is being monitored. Identical data, opposite politics.
3. **Finance goes last, and it is Raquel's project with your sponsorship** — not yours with her cooperation. The directive already sequences finance last for risk reasons; do it for this reason too.

Two governance items that reach into peer functions, where you have influence and not authority:

- **Alla Aslanyan (VP Compliance, Quality & Special Projects)** should be a named reviewer on the data classification map before Phase 1 ships. You hold HIPAA responsibility, but a HIPAA-bearing system that never passed through Compliance is built *around* governance, which your own operating principles forbid. Ask her to review; do not direct her to approve.
- **Joan Garcia (CHRO)** on anything touching personnel records, which the Class C definition explicitly includes.

Neither is a veto point you control. Both are cheaper to secure now than to retrofit after an agent has been writing to a system of record for six months.

---

## Blocking questions

Three, per the directive's limit. Details and why each one is irreversible are in `07-access-and-questions.md`.

1. **Google Workspace or Microsoft 365 — which is the authoritative document system of record?** You are running both. This determines the entire Phase 2 ingestion and permissioning model and is expensive to reverse.
2. **Is PHI in scope for the agent surface, or do we hard-scope every agent to Class B and below?** This determines whether we open the BAA/HIPAA-ready contract path now or design it out.
3. **Who owns this system operationally when you are unavailable?** Your own principle: anything that only works when you run it is a liability. Sean Fallon is the obvious answer and it is a real addition to his load, which needs to be named and budgeted, not assumed.

---

## Deliverables in this phase

| File | Contents |
|---|---|
| `01-architecture-decision.md` | Architecture decision record across all nine layers |
| `02-data-classification-map.md` | Every system of record and workflow, classified |
| `03-department-readiness-matrix.md` | Value / data quality / risk scoring, and rollout order |
| `04-keep-reset-replace.md` | Existing stack audit with written justification per item |
| `05-paperclip-decision.md` | Build-vs-adopt, with the skeptical test applied |
| `06-model-tier-map.md` | Every workflow assigned to a tier, constrained by data class |
| `07-access-and-questions.md` | Credentials and access needed; the three blocking questions |

**Nothing advances to Phase 1 without your sign-off.**
