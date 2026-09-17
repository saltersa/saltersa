# Department Readiness Matrix

**Phase 0 deliverable (b).** Value, data quality, and risk scoring that determines rollout order. Per operating rule 9: lowest-risk, highest-value first; finance and external communications last.

> **SUPERSEDED IN PART.** The COO changed the rollout order on 2026-09-17 to **Facilities → Fleet → Procedures → IT → Grants → Finance (Raquel's lead) → Communications**, on organizational grounds. The scoring, reasoning, and per-department analysis below remain current and are the basis for the risk consequences that change carries — see [`08-amendments-and-answers.md`](08-amendments-and-answers.md) and risks R-008 / R-009. The `Order` column reflects the Phase 0 *recommendation*, not the approved sequence.

---

## Scoring

Each dimension scored 1–5. **Value** = operating impact if the agent works. **Data quality** = how ready the underlying system of record is today. **Risk** = data class exposure + organizational sensitivity + reversibility of error. Risk is inverted in the readiness score because low risk is good.

**Readiness = Value + Data Quality + (6 − Risk)**

| Department | Value | Data quality | Risk | Readiness | Order (recommended) |
|---|---|---|---|---|---|
| **IT** | 4 | 4 | 2 | **12** | 1 |
| **Fleet** | 3 | 4 | 1 | **11** | 2 |
| **Procedures librarian** | 3 | 3 | 1 | **11** | 3 |
| **Property & facilities** | 5 | 2 | 4 | **9** | 4 |
| **Grants** | 4 | 2 | 3 | **9** | 5 |
| **Finance** | 5 | 3 | 5 | **9** | 6 |
| **Communications** | 2 | 3 | 5 | **6** | 7 |

Ties broken by dependency: an agent that other agents depend on ships earlier.

---

## Rollout order and why

### 1. IT — Sean Fallon

**Value 4 / Quality 4 / Risk 2.**

Goes first for a reason that is not about IT. The IT agent's asset inventory and uptime monitoring are the same instrumentation the whole system needs to satisfy its own resilience and observability requirements. Building it as department one means the substrate exists before anything depends on it; building it later means building it twice.

Beyond that: Sean reports to you, IT is the most AI-literate department in the building, ticket data is structured, and a triage error is cheap and instantly visible. The one Class C workflow — access request processing — is carved out to Tier 1 at most, with no autonomous provisioning.

**KPIs:** resolution time, uptime, open ticket aging.

### 2. Fleet — Jude Catral

**Value 3 / Quality 4 / Risk 1.**

The lowest-risk department in the portfolio and the cleanest dataset. Vehicles do not have privacy rights. This is where the full pattern — charter, tier permissions, system-of-record connection, context budget, data-class limits, eval evidence, benchmark tasks — gets proven end to end at genuinely low stakes. If the pattern is wrong, we find out on a maintenance schedule, not on a work order at a group home.

Value is real but bounded: cost per mile and TCO analysis on a fleet this size is a meaningful number, not a transformational one. That is the right profile for agent two.

**Carve-out:** transport logs tied to individuals are Class C. Aggregate to route and vehicle.

**KPIs:** cost per mile, downtime, fleet age profile.

### 3. Procedures librarian

**Value 3 / Quality 3 / Risk 1.**

Third because it is a force multiplier. Every other agent is required to cite its source, and a significant share of those citations are SOPs. A librarian that maintains versioned SOPs with a named owner and a review date on each one raises the citation quality of every agent that ships after it.

It is also the cheapest possible demonstration of the compounding principle: one agent improving the substrate that six others read from.

**KPIs:** coverage, review currency, change cycle time.

### 4. Property and facilities — Jude Catral

**Value 5 / Quality 2 / Risk 4.**

The highest value in the portfolio and the reason the project is worth doing. Fourteen group homes, five supervised apartments, five adult day programs, and the ICF in Closter generate the work order volume where cycle time, PM compliance, and turnover days actually move.

It is fourth, not first, for two reasons. Data quality is likely the worst in the portfolio — work order intake at 25 sites is where free text goes to die. And the risk is real: the free-text field will contain resident information, which is why the PHI scrubber has to exist and be measured **before** this agent ships, not alongside it.

**Dependency:** the scrubber, with its own accuracy measurement and fail-closed default, is a prerequisite. This is the gating item for the department with the most value in it, which is the honest reason Phase 4's golden dataset matters.

**KPIs:** work order cycle time, PM compliance, turnover days.

### 5. Grants — Elizabeth Boyajian (Development), business development line

**Value 4 / Quality 2 / Risk 3.**

Contributions run near $1.7M and government grants are under 5% of a $48M revenue base that is ~96% Medicaid FFS. That is the upside case: this is a rate-and-utilization business, and grants are one of the few genuinely additive revenue lines available without a rate change.

The research half is the cleanest Class A work in the whole portfolio — public opportunity data, cited, no protected content. The drafting half is Class C because it carries org financials and sometimes census and outcome data.

**Hard boundary:** the grants agent never submits and never controls funds. Submission is Tier 3, human only. Segregation of duties is structural here, not a setting.

**KPIs:** pipeline value, deadline adherence, submission quality.

### 6. Finance — Raquel Martinez

**Value 5 / Quality 3 / Risk 5.**

Highest risk score in the matrix, on both dimensions that make up risk.

Technically: read access to accounting, no payment authority, no agent ever holding payment credentials. Budget variance and expense categorization can be held at Class B if scoped to GL and aggregate level, which is the design. Forecast drafts cannot — they tie to census and rate detail.

Organizationally: Raquel holds the top finance role in the organization and reports to you in a role that did not exist until recently. A finance agent built by the COO, instrumenting the close cycle and variance timeliness, is the most sensitive single item in the roster. **Recommendation restated from the executive summary: this should be Raquel's project with your sponsorship, not yours with her cooperation.** The directive already sequences finance late for risk reasons. The organizational reason points the same direction.

This is also where the inherited baseline bites. Labor at 68.0% of total expenses in FY2023 — highest among NJ IDD peers and rising, against Eden Autism 66.7%, Arc of Essex 63.9%, Community Options 63.8%, OTC Burlington 55.7% — with negative margins in FY2022 and FY2023 while every peer stayed positive, and wages plus payroll taxes up 22% over two years against 2% revenue growth. The four levers are overtime and agency spend, census and utilization, rate and acuity capture, and span of control. **None of those four live in the finance agent.** Overtime and agency spend is scheduling. Census and utilization is program operations. Rate and acuity capture is clinical documentation. Span of control is org design.

That is worth saying plainly: the finance agent reports the number. It does not move it. Three of the four levers sit in peer functions — Nursing, Clinical, QA, and HR — where you have influence and not authority. An agentic system that instruments labor share without a corresponding agreement with Joan Garcia, Susan Mancuso, Donna Dolphin, and Brian Weiner produces a very well-evidenced report about a problem you cannot unilaterally fix. Build the instrumentation anyway; it is the precondition for the conversation. Just do not mistake it for the intervention.

**KPIs:** close cycle time, variance timeliness, error rate.

### 7. Communications

**Value 2 / Quality 3 / Risk 5.**

Last, per operating rule 9, and correctly so. Every output is Tier 2 by definition. Brand, public image, community outreach, and donor engagement carry reputational risk that is not reversible by rollback.

**Standing constraint:** the directive's "approval efficiency" section contemplates pre-approved templates carrying standing approval, including "standard resident communications." **Resident communications are not a COO function.** They belong to Clinical (Susan Mancuso), Nursing (Donna Dolphin), and Community Residential Services (Brian Weiner) — all peer functions. An agent under your authority sending resident communications on standing approval crosses an authority boundary and a compliance one simultaneously. Recommend striking resident communications from the pre-approved template category entirely, and limiting standing approval to routine vendor and internal operational correspondence, with the 10% sampling audit the directive specifies.

**KPIs:** deferred to Phase 5 charter.

---

## What this order optimizes for

The sequence front-loads the two departments where a mistake is cheap and instantly visible (IT, Fleet), then builds the shared substrate (Procedures), then takes on the highest-value and highest-volume department once its prerequisite control exists (Property), then revenue (Grants), then the two where error is expensive and organizational sensitivity is highest (Finance, Communications).

It also front-loads the departments whose directors are most likely to say yes. That is not a cynical point — per the executive summary, each charter is co-signed by the director who owns the department, and a rollout that begins with the two most winnable conversations builds the evidence that makes the harder ones easier. Jude has two departments in the top four; Sean has the first. By the time the Finance conversation happens, there should be three or four months of shipped, co-signed, director-first scorecards behind it.
