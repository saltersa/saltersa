# Spectrum for Living — Work Order Portal

A Google Forms front end, a Google Sheets operating table, and an Apps Script layer that
does the triage. Built 2026-09-04.

Replaces phone calls, texts, and "tell Jude when you see him" with one intake door for
facilities, fleet, and IT across all 27 sites.

---

## THE CORRECTION YOU NEED FIRST

**A Google Form cannot hold staff completion checkboxes.** A Form is submit-and-gone —
there is no surface for a technician to reopen a submission and tick boxes. Any vendor or
consultant who tells you otherwise is describing a different product.

The request splits into two mechanisms that people often merge:

| What you asked for | Where it actually lives |
|---|---|
| Conditional logic — different questions per problem type | **The Form.** Section branching, 14 categories. |
| Checkboxes for maintenance staff to complete | **The Sheet.** 7 checkboxes per work order. |
| Conditional formatting | **The Sheet.** 9 colour rules driven by SLA state and priority. |

Both are built. There is also a third piece the Arc Morris form almost certainly did not
have, and it is the one that makes cost measurable: a **second form** that technicians use
on a phone in the field to close work orders out with labour hours, parts cost, and vendor.

Without that second form you get a to-do list. With it you get an asset register, a
cost-per-site history, and vendor performance data — from work the team was doing anyway.

---

## WHAT DECISION THIS ENABLES

Per your standing rule that a platform question resolves to an operating outcome first:

| Decision | Cadence | Who |
|---|---|---|
| Which work orders need someone today | Daily, 7am digest | Facilities / Fleet / IT directors |
| Whether an emergency was answered inside its window | Hourly, automatic escalation | Directors, then VP Ops, then you |
| Whether the backlog is growing or shrinking | Weekly scorecard | You |
| Which sites consume disproportionate maintenance labour | Monthly, from the log | You and Raquel |
| Which assets to replace rather than repair again | Annually, at budget | You, Jude, Raquel |
| Whether a leased site's landlord is meeting their obligation | Annually, at renewal | You |

The last three are the reason to build this rather than buy a ticketing tool. They are
capital and contract decisions, and they currently have no evidence base.

---

## WHAT IT DOES THAT A PLAIN FORM DOES NOT

**1. Priority is derived, never self-declared.**
Nobody picks "urgent." Staff answer factual questions — *is water running right now, how
many bathrooms still work, is the vehicle safe to drive* — and the system sets P1 to P4.
Self-declared urgency is the single most common failure in maintenance intake: within a
month everything is urgent and the queue carries no signal.

**2. One intake door, three queues.**
Facilities, Fleet, and IT are one form. A DSP at Edison 300 never has to know that a
broken door is Jude and a broken laptop is Sean. Auto-routed on submit.

**3. Leased sites route to the landlord.**
Teaneck ATC, N. Haledon ATC, and Edison Condos have landlords. Roof, envelope, structure,
and grounds work at those sites is flagged as the landlord's obligation before Spectrum
spends labour on it. Three sites, every year, indefinitely.

**4. Licensed sites carry a priority floor.**
The Closter ICF is surveyed by NJ DOH under 42 CFR 483; community residences carry
equivalent physical-plant exposure under N.J.A.C. 10:44A. Plumbing, electrical, HVAC,
structural, accessibility, and life-safety work at a licensed site cannot sit below P2.
Scoped deliberately — a broken desk chair is not a survey finding.

**5. Duplicate detection.**
Three shifts report the same broken dryer. A new request at the same site and category
inside 14 days, while an earlier one is open, is flagged for the dispatcher rather than
silently becoming a second work order and a second truck roll.

**6. The SLA clock runs whether or not anyone opens the sheet.**
An hourly sweep re-evaluates every open work order. Breaches escalate once — to the
director, then VP Ops, then you. P1s nobody acknowledged inside the window escalate to all
three. Escalating once matters: an alert that repeats hourly is ignored within a day.

**7. Wall clock for emergencies, business clock for routine.**
Group homes do not close. A P1 at 2am Saturday is measured in elapsed hours. A routine
request submitted Friday at 3pm is not "late" on Monday morning.

**8. The requester is told what happened, automatically.**
Acknowledged, complete, closed. "Did anyone see my request?" calls are a standing tax on
the Facilities Director's day and are caused entirely by the requester having no
visibility. This closes the loop without adding a task to anyone.

**9. Per-site QR codes.**
One prefilled link per site, generated into the Config tab. Print, post in each staff
office, and the location field is already correct — removing the most common data error in
the system.

**10. Photos at intake.**
A photo routinely saves a diagnostic trip. The technician arrives with the right part.

---

## THE COMPOUNDING PIECE

You own facilities, fleet, IT, procurement, and finance. That means one data model can
serve four purposes at once, and this one does:

```
                    ┌──────────────────────┐
                    │   One work order     │
                    │      stream          │
                    └──────────┬───────────┘
                               │
        ┌──────────────┬───────┴───────┬──────────────────┐
        ▼              ▼               ▼                  ▼
   Dispatch today   Asset history   Cost by site     Vendor performance
   (Facilities)     (Capital plan)  (Finance)        (Procurement)
```

Every close-out carrying an asset tag adds a repair event to the asset register. Nobody
maintains that register by hand. After roughly twelve months you can answer, with evidence:

- Which equipment has failed three or more times and should be replaced, not repaired.
- What each building actually costs to maintain per square foot.
- Which vendors are cheap per invoice and expensive per outcome.
- Whether a leased site's landlord is meeting their obligation before you renew.

None of those questions has an evidence base today. All four are budget decisions you will
be asked about, and the data accrues at zero marginal effort.

---

## STEADY-STATE COST AND OWNERSHIP

Per your rule that a design is not finished until this is answerable:

| | |
|---|---|
| **Owner** | Director of Facilities & Fleet Management |
| **Backup** | Director of IT |
| **Escalation if both unavailable** | VP of Operations. The system keeps running untouched — it degrades to a form writing to a sheet, which is still better than phone calls. |
| **Recurring effort** | ~15 min/week: clear the digest, review PHI flags, sanity-check the scorecard. |
| **Quarterly** | ~1 hour: review the site list, SLA targets, and routing addresses against reality. |
| **Annual** | ~half a day: reconcile the asset register into the capital plan. |
| **Licence cost** | $0. Runs inside Google Workspace you already pay for. |
| **Lock-in** | Low. Data is a Google Sheet — exportable to CSV any time. Logic is 9 text files in this repo. |
| **If Claude, or I, disappear** | Everything is version-controlled here and commented for a non-author. `selfTest()` verifies the logic. |

**What breaks it:** nothing here requires you personally. The one genuine dependency is
that the notification addresses in `00_Config.gs` are distribution lists, not individuals.
Personal addresses fail the first time someone takes vacation.

---

## SETUP

1. Create a new Google Sheet in a **shared drive** owned by the organisation, not a
   personal My Drive. A system on someone's personal Drive dies when they leave.
2. Extensions → Apps Script.
3. Create one file per `.gs` in `apps-script/` and paste the contents. Set the manifest
   from `appsscript.json` (Project Settings → show `appsscript.json`).
4. Edit `00_Config.gs`: replace every `@spectrumforliving.org` address with a real
   distribution list. Confirm the site list.
5. Run `buildAll()`. Authorise when prompted.
6. Run `selfTest()`. All checks must pass before you go further.
7. Leave `CFG.DEBUG_MODE = true`. Pilot at 2–3 sites for two weeks.
8. Flip `DEBUG_MODE = false` at go-live.

---

## PILOT PLAN

Objective, milestone, owner, date, measurable outcome — a plan without a number is a wish.

| Milestone | Owner | Date | Measurable outcome |
|---|---|---|---|
| Config reviewed, addresses replaced | Jude | Week 1 | `selfTest()` passes; 27 sites confirmed |
| Workspace BAA confirmed for Forms/Sheets/Drive | Sean | Week 1 | Written confirmation, before any licensed site |
| Pilot at RVCO + 2 group homes | Jude | Weeks 2–3 | ≥20 work orders through the system |
| Priority model tuned against pilot | Jude + you | Week 4 | <10% of work orders manually re-prioritised |
| QR codes posted at all 27 sites | Jude | Week 5 | 27 posted, confirmed by photo |
| Full rollout, DEBUG off | Jude | Week 6 | ≥80% of requests arriving via form, not phone |
| First weekly scorecard to CEO | You | Week 7 | Baseline: open count, SLA %, spend |
| Baseline review | You + Jude + Raquel | Week 12 | SLA compliance ≥85%; backlog flat or falling |

**The number that matters at week 12** is the share of maintenance requests arriving
through the form rather than by phone or text. Below about 70%, the log is not a record of
what happened and none of the downstream analysis is trustworthy. That single figure
determines whether this is an asset or a second parallel system — which by your own rule
is a defect.

---

## READ NEXT

| File | What it is |
|---|---|
| `docs/OPERATIONS.md` | Runbook, ownership, escalation, and the seven open decisions. |
| `docs/FORM_SPEC.md` | Every question, every branch, every escalation trigger. Review without deploying. |
| `apps-script/00_Config.gs` | The only file you need to edit to change how the system behaves. |
