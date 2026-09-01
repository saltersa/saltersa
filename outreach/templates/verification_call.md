# Verification Call Script

**The first action of the campaign.** Seventeen calls, one morning, and 51 rows of
`TO VERIFY` start becoming real people.

> **DO NOT USE THIS UNTIL ANTONIO APPROVES THE RULE AMENDMENT.** Campaign rule 1 currently
> requires that contacts come from an official government website. This script gets them by
> phone instead. The proposed amendment is in `operating_plan.md`. Until it is approved, this
> file is a plan, not a permission.

---

## WHY THE PHONE IS A GOOD SOURCE, NOT A SHORTCUT

A website tells you who held the job when the page was last edited. A person in the building
tells you who holds it today. Officials change between elections and resignations and the
site is usually the last thing updated.

The number is also self verifying. Dial the town's main line, and if the borough answers as
the borough, you have confirmed you reached that government. You cannot get that from an
inbox.

What makes it rigorous is the log. An unlogged call is a rumour.

---

## THE CALL

> Good morning. I am calling from Spectrum for Living. We run a group home in [TOWN].
>
> I need to send a public records request. Could you tell me who the municipal clerk is, and
> the best email address for them?

Then, every time:

> Could you spell the last name for me?
>
> And is that the address the clerk prefers for records requests, or is there a general
> records inbox?

Close:

> That is all I needed. Thank you very much.

Under a minute. You are not pitching. Do not pitch.

---

## IF THEY ASK WHY

> We are a nonprofit that has run housing for people with disabilities here since [YEAR]. I
> am requesting the housing element and the list of town owned property. Routine records
> request.

True, complete, and boring, which is what you want.

---

## IF THEY OFFER MORE

Some will volunteer the administrator or the mayor's assistant. **Take everything offered.**
Log each one separately. A name handed over by someone inside the building is worth more than
anything on a website.

Then ask the question that pays for the whole call:

> While I have you, who handles municipally owned property for the town?

---

## LOG EVERY CALL, THE SAME DAY

Nothing counts until it is written down. Append to `sources.md` under a new heading,
**Level A2, verified by phone**:

```
Level A2. Bergenfield, verified by phone.
  Called: 2026-09-__ at __:__
  Number dialled: [the number, and where it came from]
  Answered by: [role, e.g. "main switchboard"]
  Obtained: [Name], Municipal Clerk, [email]
  Spelling confirmed: yes
  Also offered: [any extra name and role]
  Caller: Elizabeth Boyajian
```

Then update `targets.csv`: replace `TO VERIFY` in `contact_name` and `email`, and replace
`BLOCKED see sources.md` in `source_url` with `phone verified 2026-09-__, see sources.md`.

---

## WHAT COUNTS AND WHAT DOES NOT

| Situation | Verified? |
|---|---|
| A person states the name and email, spelling confirmed | Yes. Log and use. |
| They direct you to a general records inbox with no name | Yes for the inbox. Address it to "Municipal Clerk", never to a guessed name. |
| Voicemail only, no human | No. Try twice more, then log as unreachable. |
| They say "just use the website" and you cannot reach it | No. Log the attempt and move on. |
| You infer an address from a colleague's pattern | **Never.** This is exactly the fabrication rule 1 exists to prevent. |

---

## THE ORDER

Work down `targets.csv`. It is already sorted by send order.

Edison, Closter, Bergenfield, River Vale, Glen Rock, Paramus, Northvale, North Haledon,
Norwood, Ringwood, Hillsdale, Wayne, Haworth, Maywood, Elmwood Park, Rockleigh, Teaneck.

**Westwood is frozen.** Do not call it until Antonio rules on the lease conflict.

Then Thursday, the three county community development offices. On those calls, get the
director's name and email **and ask this**, which matters more than the name:

> When does your next CDBG and HOME application cycle open and close?

---

Sources checked:

- `targets.csv` in this folder for the call order and the 17 unfrozen towns.
- `2026_Facility_List.xlsx` 2026-08-31 for the per town operating year used in the script.
- No phone number is listed in this file. Numbers come from `sources.md`, where the two
  captured so far are recorded at Level B and must be confirmed on connection.
