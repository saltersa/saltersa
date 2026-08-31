# Records Request

**Band 1. The highest reply rate email in the campaign, and the first one sent.**

This is not a pitch. There is no proposal to evaluate, so there is nothing to refuse. It asks
a clerk to do something a clerk does every week.

It also does the campaign's real work: it replaces the `[VERIFY FOR THIS TOWN]` bracket in
cold email Variant A with an actual document, and it sorts the 18 towns into responsive and
unresponsive before Spectrum spends a mayor level ask on any of them.

**Signed by Antonio Salters.** Staff to staff. Do not send this one over the CEO's name; a
CEO signature on a routine records request looks strange and slows it down.

---

## THE EMAIL

**Subject:** Records request, [TOWN] housing element and municipal property list

Dear [TITLE] [LAST NAME],

I am writing to request copies of three public records.

1. The current housing element and fair share plan.
2. The adopted affordable housing trust fund spending plan.
3. The list of real property owned by [TOWN].

Electronic copies are fine. If any of these is already posted online, a link works just as
well and saves you the trouble.

For context, Spectrum for Living has operated in [TOWN] since [YEAR]. We are a nonprofit that
has provided housing and care for people with developmental and physical disabilities in New
Jersey since 1986. We are looking at where we might expand, and these documents help us
understand what [TOWN] is planning.

If the borough requires a specific request form, please let me know and I will complete it.

Thank you for your help.

Antonio Salters
[ANTONIO: TITLE]
Spectrum for Living
asalters@spectrumforliving.org | [PHONE]

---

## WHY IT IS WRITTEN THIS WAY

**Three items, numbered.** A clerk can tick them off. A paragraph of prose asking for
"information about housing" cannot be actioned and gets set aside.

**"A link works just as well."** Lowers the cost of replying to almost nothing. Many towns
already have these posted, and the clerk gets to close the request in one line.

**The context paragraph is three sentences and contains no ask.** It exists so the request
does not read as anonymous or adversarial. It plants "we have been here since [YEAR]" without
requesting anything, which makes the later property email a second contact rather than a
first.

**"If the borough requires a specific request form."** Some New Jersey municipalities route
records requests through their own form. Asking up front avoids a two week round trip.
Replace "borough" with "township" for Edison, or "the town" if you are unsure of the form of
government.

**No deadline is cited.** New Jersey's public records law appears to set a response deadline,
but no legal source was reachable from this environment, so nothing is asserted.
[VERIFY: whether a statutory deadline applies and how many days it is. If it is confirmed,
consider whether to cite it. My recommendation is not to on the first request. Citing a
statute to a clerk reads as adversarial and this campaign wants these people as allies. Hold
it in reserve for a town that ignores you.]

---

## WHAT TO DO WITH WHAT COMES BACK

| What arrives | What it means | Next move |
|---|---|---|
| All three documents | Responsive town, and you now have real facts | Variant A to the administrator, bracket filled with their own numbers |
| Property list only | Land conversation is open, housing plan may not exist yet | Variant A, lead with a specific parcel |
| Housing plan only, no property list | They plan but hold little land | Lower priority for a site, still good for a partnership or trust fund ask |
| A request form to complete | Normal, not a brush off | Complete it same day |
| Nothing after two weeks | Unresponsive, or it went to the wrong person | One phone call using `phone_script.md`, then deprioritise |

Log every outcome in `tracker.csv` the day it happens.

---

## FILL BEFORE SENDING

- `[TITLE] [LAST NAME]` from a verified source only. Still `TO VERIFY` for all 18 towns.
- `[TOWN]` and `[YEAR]` from `/outreach/facilities.md`.
- `[ANTONIO: TITLE]` and `[PHONE]`.
- Westwood is frozen. See the lease conflict in `/outreach/facilities.md`.

---

Sources checked:

- `2026_Facility_List.xlsx`, supplied by Antonio 2026-08-31, for the per town operating year
  used in the context paragraph. See `/outreach/facilities.md`.
- Verified organization facts list supplied by Antonio: founding 1986, and the description of
  who Spectrum serves.
- Antonio Salters and asalters@spectrumforliving.org confirmed 2026-08-31 from the connected
  Outlook account.
- New Jersey public records statute and response deadline: **not verified, not cited.**
