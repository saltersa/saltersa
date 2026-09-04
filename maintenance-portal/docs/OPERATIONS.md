# Operations Runbook

Owner: Director of Facilities & Fleet Management. Backup: Director of IT.

---

## DAILY

**7:00am — digest lands** in each queue mailbox. One email per queue: past due,
emergencies, due today, and any privacy flags. If the digest does not arrive, the hourly
trigger has failed — check Apps Script → Executions.

**The dispatcher's job is the top three sections only.** Past due, emergencies, due today.
Everything else is inside its window and does not need a decision this morning.

**Privacy flags are worked first.** A row flagged `REVIEW` may contain resident
information. Redact the free-text fields in the WO Log before that row is seen by a vendor,
a contractor, or anyone outside the team. Then clear the flag.

---

## WHEN A TECHNICIAN WORKS A JOB

Two ways in, same result:

**In the sheet** — tick the checkboxes as work progresses:

| Checkbox | What it means | What happens automatically |
|---|---|---|
| Acknowledged | Someone has it | Timestamp; requester emailed; response clock stops |
| Parts Ordered | Waiting on a part | Status → Awaiting Parts; row turns blue |
| Vendor Called | Vendor dispatched | Status → Vendor Dispatched |
| On Site | Technician is there | Status → In Progress |
| Work Complete | Repair done | SLA measured MET or MISSED; requester emailed |
| Site Verified | Site confirms it is fixed | Status → Verified |
| Closed | Administratively closed | Timestamp; requester emailed; row greys out |

**On a phone** — the close-out form. WO number, labour hours, parts cost, vendor,
resolution code. This is the path that makes cost measurable, and it should be the default
for anyone not sitting at a desk.

Costs accumulate across visits. A second trip adds to the first rather than overwriting it.

---

## READING THE COLOURS

| Colour | Meaning | Action |
|---|---|---|
| **Purple, bold** | Possible resident information | Redact now, before anything else |
| **Red, white text** | SLA breached, still open | Work today or document why not |
| **Light red** | P1 emergency, open | Should already be moving |
| **Amber** | Past 75% of its window | Fix today so it is not red tomorrow |
| **Blue** | Awaiting parts or vendor | Parked, not forgotten — check the ETA |
| **Orange, italic** | Possible duplicate | Confirm before dispatching a second truck |
| **Indigo, italic** | Landlord's obligation | Do not spend Spectrum labour without checking the lease |
| **Grey, struck through** | Closed or cancelled | Nothing |

A purple **site name** means a licensed site. Document the repair — it is survey-visible.

---

## ESCALATION

| Trigger | Goes to |
|---|---|
| P1 created | Queue + on-call. Compliance copied if the site is licensed. |
| SLA breached | Director. VP Ops added if any breach is a P1. |
| P1 unacknowledged past its response window | Director + VP Ops + COO |
| Technician marks "cannot complete" | Queue director, with the technician's note |
| Intake or close-out processing fails | On-call, flagged ACTION REQUIRED |

Each breach escalates **once**. A daily-repeating alert is ignored within a week.

---

## MONTHLY AND ANNUAL

**Monthly** — open the Dashboard. Two questions: is the backlog growing, and is one site
consistently at the top of the open list? A site that is always top is usually a building
problem, not a reporting problem, and belongs in a capital conversation rather than a
performance one.

**Quarterly** — review `00_Config.gs`. Sites, SLA targets, routing addresses. A site added
to the organisation and not to the config is a work order that silently goes nowhere.

**Annually, at budget** — the Asset Registry. Anything with three or more repairs is
highlighted. That list, with lifetime repair cost against replacement cost, is the
replace-versus-repair argument, and it is the input to the capital plan.

---

## OPEN DECISIONS

These are the questions I could not answer from what I have. Every one has a working
default already implemented, so nothing is blocked — but each default is a guess, and four
of them are load-bearing.

### 1. Do all 688 staff have Google Workspace accounts? — LOAD-BEARING

Currently set to `REQUIRE_LOGIN: true`, which assumes yes.

If DSPs do not have organisational email — common in this sector, where direct support
staff are often paid hourly and never issued an account — then:

- **Photo upload stops working.** Google requires sign-in for file upload, with no
  exception. This is the single most valuable efficiency feature in the form and it is the
  first casualty.
- The form must be open-link, and the requester types their own name and email.
- Status notifications only reach people who typed an address correctly.
- Anyone with the link can submit, including from outside the organisation.

Set `REQUIRE_LOGIN: false` and the code handles all of it — but understand you are trading
away photos and identity. If a meaningful share of front-line staff lack accounts, the
better answer is probably a shared per-site account rather than abandoning sign-in, and
that is an IT decision for Sean with a cost attached.

**This is the first thing to confirm. It changes what the system can do.**

### 2. What already exists? — LOAD-BEARING

I have not asked, and in a $48M organisation the answer is usually that something exists
and is unused, badly configured, or bypassed. Before deploying this, confirm:

- Is there a facilities ticketing system already licensed — a CMMS, a module inside the EHR
  or finance platform, a ServiceNow instance IT uses?
- Does Sean already run an IT helpdesk? If so this should **feed** it, not compete with it.
  Two helpdesks is worse than one bad helpdesk.
- Is there a fleet maintenance system, or a spreadsheet Jude already keeps?

If a real CMMS is already paid for, the right move is to fix its configuration rather than
build alongside it, and you should kill this. Building a second system on top of an unused
first one is the waste your own operating principles are written to prevent.

### 3. Is the Google Workspace BAA executed and does it cover Forms, Sheets and Drive? — LOAD-BEARING

You hold HIPAA responsibility. Google offers a BAA covering Workspace core services, but it
must be **executed** and the services must be configured within scope. A maintenance form
used by 688 people will collect protected health information in free-text fields no matter
how the instructions are worded — someone will type a name.

The design mitigates this three ways: the form instructs staff to describe the room and the
equipment rather than the person; a heuristic scans free text and flags likely PHI for
redaction; and the daily digest surfaces flagged rows. **None of that is a substitute for
the BAA.** Confirm with Sean before this touches a licensed site.

### 4. Is there an after-hours on-call rotation? — LOAD-BEARING

The P1 design assumes someone receives a 2am email and acts on it. If there is no on-call
rotation, P1 is decorative and the escalation ladder terminates in an empty inbox. Email is
also a poor emergency channel — if there is a duty phone, the P1 path should send SMS,
which Apps Script can do through a carrier gateway or Twilio. Worth doing properly.

### 5. "Site Verified" reaches into a peer function — influence, not authority

The Site Verified checkbox asks a home manager to confirm a repair is actually complete.
Residential operations report to Brian Weiner, not to you. **You cannot assign this.**

It is a good control — it catches repairs marked done that did not hold — but it has to be
agreed rather than instructed, and it will not happen because a checkbox exists. Two
options: agree it with Brian as a joint quality measure, or drop the checkbox and accept
that "Work Complete" is the technician's word. Do not leave it in place unagreed; an
unused checkbox teaches people the whole sheet is optional.

### 6. Are patient lifts and adaptive equipment facilities or clinical?

Ceiling track lifts, adjustable beds, and personal DME are currently routed to Facilities.
At many providers this equipment is clinically owned, vendor-serviced under a separate
contract, and touching it in-house creates liability. Confirm with Susan Mancuso, then move
the Accessibility category to the right queue.

### 7. Who actually dispatches?

The system assumes someone reads the 7am digest and assigns work. If Jude *is* the
facilities department rather than running one, the digest is a to-do list rather than a
dispatch tool, and the realistic throughput ceiling is much lower than the SLA targets
imply. Worth knowing before you commit to P1 = 4 hours in writing, because a published SLA
you miss is worse than no published SLA.

---

## ONE THING TO CONSIDER ABOUT HOW THIS LANDS

You asked to be told when a plan has a hole, including about internal perception.

This system instruments Jude's function, publishes his performance weekly to you, and asks
for cooperation from Steve's and Brian's people. It is modelled on a form from Arc Morris —
the organisation you and Salvador came from. Five leaders lost their direct line to the CEO
when your role was created.

An accountability system arriving from the new COO, based on the previous employer's
template, in the first months, can read as *the new leadership is importing their old shop
and measuring us with it* — regardless of intent, and regardless of how good the design is.

Three cheap mitigations, none of which weaken the system:

1. **Let Jude own the rollout and present it**, including to the ELT. It is his function
   being instrumented. Your name on it makes it surveillance; his name on it makes it his
   tool. This costs you nothing and is the highest-value change on this page.
2. **Publish the SLA targets as a draft Jude sets**, not as targets you hand down. He knows
   what his crew can actually hit. A target he sets and misses is a management conversation;
   a target you set and he misses is a grievance.
3. **Do not call it the Arc Morris form.** It is not one — the branching, the derived
   priority, the landlord routing, the survey floor, and the asset register are all built
   around Spectrum's 27 sites and its licensing exposure. Describe it as what it is.

The first weekly scorecard will also make the backlog visible for the first time, and it
will almost certainly look bad. That is the instrument working, not the team failing. Say
so out loud, in advance, before the first number reaches the CEO — otherwise the number
arrives as an indictment of Jude in week seven of his new boss's tenure.
