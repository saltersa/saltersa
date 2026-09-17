# Initial Model Tier Map

**Phase 0 deliverable (e).** Every workflow assigned to a tier, **constrained by data class first, then cost**.

---

## A sequencing contradiction in the directive, and how I am resolving it

The directive asks Phase 0 for "the initial model tier map — every workflow assigned to a tier **with eval evidence**." But the golden dataset that produces eval evidence is Phase 4, and operating rule 3 requires right-sizing empirically against a regression dataset that does not exist yet. Phase 0 cannot deliver eval-evidenced assignments without inverting the phase order.

**Resolution:** this map is **provisional**, assigned on data class (which is hard evidence, available now) and on documented model capability and price (also available now). Every assignment carries a stated basis. Phase 4 re-validates the whole map against the golden dataset, and operating rule 3's target — the lowest-cost permissible tier handling 60–70% of calls — is measured there, not asserted here.

I am flagging this rather than presenting price-based guesses as eval evidence. A tier map that claims evidence it does not have is worse than a provisional one that says so.

---

## The tiers

Revised from the directive per executive summary findings 2, 3, and 4.

| Tier | Model | Price (in/out per MTok) | Data classes | Basis for change |
|---|---|---|---|---|
| **Bulk** | Claude Haiku 4.5 | $1.00 / $5.00 | A, B, C* | Replaces DeepSeek V4.1-Flash — finding 2 |
| **Mid** | Claude Sonnet 5 | $2.00 / $10.00 | A, B, C* | Best value between the extremes |
| **Strategic** | Claude Opus 5 | $5.00 / $25.00 | A, B, C* | Replaces Fable 5.1 / GPT-6 Astra — finding 3 |

\* Class C permitted **only** under signed BAA + HIPAA-ready configuration. Until that contract is in place, Class C workflows do not run. See finding 4 and blocking question 2.

Source: [Anthropic pricing](https://platform.claude.com/docs/en/about-claude/pricing).

### Why three tiers of one provider rather than three providers

One contract, one egress path, one audit story, one cache namespace. The directive's no-lock-in rule is satisfied structurally rather than by diversification: all calls go through LiteLLM with named fallbacks, and a model swap is a config change verified against the regression dataset. Diversifying providers to avoid lock-in would add data paths to audit without reducing switching cost, because the switching cost was already low.

Note also that **caches are model-scoped**. A cascade across providers forfeits cache reuse entirely, which at this organization's volume would cost more than the tier arbitrage saves.

---

## Fallback chains — per tier AND per data class

A fallback that violates the data class is a breach, not a degradation.

| Tier | Class A/B primary | Class A/B fallback | Class C primary | Class C fallback |
|---|---|---|---|---|
| Bulk | Haiku 4.5 | Sonnet 5 | Haiku 4.5 (BAA) | Sonnet 5 (BAA) |
| Mid | Sonnet 5 | Opus 5 | Sonnet 5 (BAA) | Opus 5 (BAA) |
| Strategic | Opus 5 | Sonnet 5 | Opus 5 (BAA) | **fail closed** |

**Class C fails closed.** If no compliant model is available, the workflow halts and notifies. It does not degrade to a non-BAA path. This is enforced in the router config, not left to the agent.

Fallbacks escalate rather than degrade for Class A/B, because at this volume the cost difference between Haiku and Sonnet on a fallback path is measured in cents, and a failed operational run costs more than that.

---

## Workflow assignments

`Basis` column: **DC** = determined by data class, **P** = price/capability judgment pending Phase 4 validation.

### Property and facilities

| Workflow | Class | Tier | Basis | Note |
|---|---|---|---|---|
| PHI scrub at intake | C→B | Bulk | DC | Runs under BAA. Fail-closed. Own eval set in Phase 4. |
| Work order triage / routing | B | Bulk | P | High volume, structured output, low judgment |
| PM scheduling & compliance | B | **n8n — no LLM** | — | Deterministic: schedule + rule. Rule 5. |
| Vendor authorization drafts | B | Mid | P | Tier 2, drafting quality matters |
| Turnover coordination | B | Bulk | P | |
| Capital project rollups | B | Mid | P | Aggregation + narrative |

### Fleet

| Workflow | Class | Tier | Basis | Note |
|---|---|---|---|---|
| Maintenance scheduling | B | **n8n — no LLM** | — | Mileage/date thresholds. Rule 5. |
| Lifecycle / TCO analysis | B | Mid | P | Real analysis, monthly cadence |
| Replacement recommendations | B | Mid | P | Feeds capital planning |
| Cost-per-mile rollup | B | **n8n — no LLM** | — | Arithmetic over a table. Rule 5. |

### IT

| Workflow | Class | Tier | Basis | Note |
|---|---|---|---|---|
| Ticket intake / triage | B | Bulk | P | Highest-volume LLM workflow in the portfolio |
| Asset inventory reconciliation | B | **n8n — no LLM** | — | Two-list diff. Rule 5. |
| Uptime monitoring | B | **n8n — no LLM** | — | Threshold + alert. Rule 5. |
| Open ticket aging report | B | **n8n — no LLM** | — | Query + template. Rule 5. |
| Access request processing | C | Mid | DC | BAA required. Tier 1 max, no autonomous provisioning. |

### Grants

| Workflow | Class | Tier | Basis | Note |
|---|---|---|---|---|
| Opportunity research | A | Mid | P | Needs web search + citation discipline; Bulk likely insufficient |
| Deadline calendar | B | **n8n — no LLM** | — | Date extraction + calendar write. Rule 5. |
| Application drafting | C | **Strategic** | DC+P | BAA required. High-stakes, cited, funder-facing. |
| Compliance checklist | B | Bulk | P | Checklist matching |
| Reporting drafts | C | Mid | DC | BAA required |
| **Submission** | — | **NONE** | — | **Tier 3, human only. Never automated.** |

### Finance

| Workflow | Class | Tier | Basis | Note |
|---|---|---|---|---|
| Invoice / receipt extraction | B | Bulk | P | Structured extraction, high volume |
| Expense categorization | B | Bulk | P | GL code assignment |
| Budget variance analysis | B | Mid | P | Held at GL/aggregate to stay Class B |
| Forecast drafts | C | **Strategic** | DC+P | BAA required. Ties to census and rate detail. |
| **Payment execution** | — | **NONE** | — | **Tier 3. No agent holds payment credentials.** |

### Procedures librarian

| Workflow | Class | Tier | Basis | Note |
|---|---|---|---|---|
| SOP drafting / updates | B | Mid | P | Output is read by every other agent |
| Version / owner / review-date tracking | B | **n8n — no LLM** | — | Metadata table. Rule 5. |
| Change routing | B | **n8n — no LLM** | — | Routing rule. Rule 5. |

### Executive layer

| Workflow | Class | Tier | Basis | Note |
|---|---|---|---|---|
| Chief-of-staff routing | B | Bulk | P | Classification task. Never executes Tier 2+. |
| Weekly department scorecard | B | Mid | P | Aggregates only; individual detail excluded |
| Monthly board packet | C | **Strategic** | DC+P | BAA required. Opus 5 at `xhigh`. |
| Cost-by-tier report | B | **n8n — no LLM** | — | Query over the trace store. Rule 5. |
| Communications drafting | B–C | Mid | P | Tier 2 always |
| Batched approval digest | B | **n8n — no LLM** | — | Assembly + delivery. Rule 5. |
| Improvement agent (monthly) | B | **Strategic** | P | Reasoning over a month of signals; runs 12×/year |

---

## Tier distribution

| Tier | Workflows | Share |
|---|---|---|
| **No LLM (n8n)** | 12 | **32%** |
| Bulk (Haiku 4.5) | 9 | 24% |
| Mid (Sonnet 5) | 11 | 30% |
| Strategic (Opus 5) | 5 | 14% |
| Never automated | 2 | — |

**On operating rule 3's 60–70% target:** measured by *workflow count*, bulk-or-below covers 56% and misses. Measured by *call volume*, it clears comfortably — the twelve n8n workflows plus ticket and work order triage and invoice extraction are where the volume actually is, while the five Strategic workflows run monthly or weekly. Phase 4 measures calls, not workflows, and that is the correct denominator.

**The more important number is 32%.** Nearly a third of the specified workflows should not call a model at all. Rule 5 says any decision expressible as a deterministic branch, lookup, or template is a *defect* when implemented as an LLM call — and applying it at design time, before anything is built, is where it is cheapest. This is the single largest cost and reliability lever in the map, and it has nothing to do with model choice: an n8n branch is free, instant, deterministic, and cannot hallucinate an uptime figure.

---

## Caching structure — mandatory in every charter

Largest single cost reduction for agentic workloads, per the directive, and the structure is the same for every agent:

```
[ STABLE PREFIX — cached ]
  role charter
  tool definitions (deterministic order)
  SOP excerpts / policy context
  ← cache_control breakpoint here
[ VARIABLE SUFFIX — not cached ]
  the task
  retrieved context for this run
```

Render order is `tools` → `system` → `messages`. Any byte change in the prefix invalidates everything after it.

**Silent invalidators to keep out of the prefix:** timestamps, per-request IDs, unsorted JSON keys, varying tool sets, anything derived from `now()`.

**Both implementation paths, per the directive.** Through LiteLLM, automatic injection via `cache_control_injection_points` handles the general case, and explicit client-set `cache_control` breakpoints take precedence when an agent sets its own. Anthropic-bound deployments need `/v1/messages` in `model_info.supported_endpoints` or every `cache_control` in the forwarded body is reduced to `{"type": "ephemeral"}` — silent degradation, no error raised. This is a Phase 1 verification item.

**Measurement:** `usage.cache_read_input_tokens` logged on every call. Zero across repeated requests means a silent invalidator is live. Weekly cache-hit-rate report, per the directive.

---

## Effort settings

Opus 5 and Sonnet 5 support `output_config.effort` from `low` to `max`. Effort is the first quality-trading lever after caching, and it is tuned per route, not globally.

| Workflow type | Effort | Rationale |
|---|---|---|
| Classification, triage, extraction | `low` | High volume, latency-sensitive, bounded judgment |
| Analysis, drafting, scorecards | `high` | Default; the quality/cost sweet spot |
| Board packet, grant drafting, forecast | `xhigh` | Correctness matters more than cost; runs monthly |
| Improvement agent monthly cycle | `xhigh` | Reasoning over a month of signals, 12×/year |

**Do not disable thinking on Opus 5.** With `thinking: {type: "disabled"}` the model occasionally writes a tool call into visible text instead of a `tool_use` block — the turn succeeds, the call never runs, no error is raised, and in an agentic loop that text pollutes later turns. It can also leak `<thinking>` tags into output. Lowering effort achieves the cost saving without either failure mode.

---

## Re-evaluation

- **Phase 4:** full re-validation against the golden dataset. Every `P` basis above becomes evidence-backed or changes. Call-volume distribution measured against the 60–70% target.
- **Quarterly thereafter:** per operating rule 4. Owned by the systems integrator, who also watches for deprecations and price changes.
- **On any price or model change:** re-run the regression dataset before changing the config, not after.
