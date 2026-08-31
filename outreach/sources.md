# Outreach Campaign: Research Sources

Campaign: Spectrum for Living, township and county outreach, Bergen / Passaic / Middlesex counties.
Log opened: 2026-08-31.

All research sources are recorded here with URL, date accessed, and what the source
verified. Every factual claim used in any campaign file or email must trace to a line
in this log.

---

## VERIFICATION LEVELS USED IN THIS LOG

Each entry carries one of three levels. Only Level A may be used in outreach material.

- **Level A, VERIFIED DIRECT.** I opened the official page myself and read the fact on it.
- **Level B, SEARCH SNIPPET ONLY.** A search engine returned this fact and attributed it
  to the listed URL. I could not open the page to confirm it. Not usable in outreach
  under the campaign anti-hallucination rules.
- **Level C, UNVERIFIED LEAD.** A name, number, or address that surfaced in search but
  that I could not attribute to a specific official page. Quarantined. Never to be used.

A fourth level covers material Antonio supplies directly.

- **Level D, INTERNAL VERIFIED.** A file supplied by Antonio. Authoritative for facts about
  Spectrum itself. Not a substitute for Level A on anything about a government body.

**As of 2026-08-31 there are zero Level A entries**, because no external site is reachable.
There are two Level D sources, recorded in the next section. Every Spectrum fact used in the
campaign now traces to one of them.

---

## BLOCKER: OUTBOUND WEB ACCESS IS DISABLED IN THIS ENVIRONMENT

Date encountered: 2026-08-31.

This session runs in a sandbox whose network egress policy blocks outbound HTTPS to
effectively all public websites. Every attempt to open an official government page was
refused by the egress proxy before the request reached the site.

Domains attempted and refused, all returning `EGRESS_BLOCKED`:

| Domain attempted | Purpose | Result |
|---|---|---|
| bergenfieldnj.gov | Bergenfield mayor, council, borough clerk | Blocked by egress proxy |
| www.nj.gov | NJ DCA housing programs and Fourth Round rules | Blocked by egress proxy |
| www.co.bergen.nj.us | Bergen County executive and departments | Blocked by egress proxy |
| www.edisonnj.org | Edison mayor and administrator | Blocked by egress proxy |
| en.wikipedia.org | Background cross check | Blocked by egress proxy |

Proxy diagnosis run on 2026-08-31: `curl -sS "$HTTPS_PROXY/__agentproxy/status"` reports
the proxy enabled and healthy, with a `noProxy` allowlist limited to the Anthropic API and
software package registries. The environment README states that a refusal of this class
means "the destination host is not allowed by your organization's egress policy for this
session," and instructs that it must be reported rather than retried or worked around.
It has not been retried or worked around.

**Consequence for the campaign.** Campaign anti-hallucination rule 1 requires that every
contact come from an official government website ending in .gov or from a county or
municipal official page. That requirement cannot be met from inside this environment.
No official's name, title, email, or phone number has been entered into any campaign
file, and none will be until direct access is restored or the contacts are supplied.

**What still works.** The search tool returns result titles, URLs, and engine-written
summaries. That is enough to identify which offices exist and to capture policy context,
but it is not enough to satisfy rule 1, because the underlying page cannot be read. Search
was also intermittently unavailable during this session, returning "Web search error:
unavailable" on at least one query.

---

## LEVEL D: INTERNAL SOURCES SUPPLIED BY ANTONIO

### D1. `2026_Facility_List.xlsx`

- Received 2026-08-31 from Antonio.
- What it verified: 27 facilities across 18 municipalities in Bergen, Passaic, and Middlesex
  counties. 179,933 square feet. Spectrum owns 23 of the 27. Year opened, square footage,
  bedroom count, owner, lease term, lease expiration, and monthly lease payment per site.
  Oldest site Closter ICF, 1983. Three of the five Adult Training Centers are owned by
  someone other than Spectrum. Rent figures are internal only and appear in no template,
  per Antonio's ruling of 2026-08-31.
- Superseded: the campaign brief listed five confirmed towns. The real number is 18. Bergen
  14 towns and 19 facilities, Passaic 3 and 4, Middlesex 1 and 4.
- Analysis written to `/outreach/facilities.md`, computed from the file rather than typed.
- ATC confirmed by Antonio 2026-08-31 as Adult Training Center.
- **Unresolved conflict.** Antonio said on 2026-08-31 that no lease is listed in the facility
  document. Cells G4, H4, and I4 of the `Facilities` sheet do list one for Carver ATC: term
  `5 Years`, expiration `2023-12-31`, monthly `13309`. N. Haledon and Teaneck carry the same
  three fields with 2030 expirations. There are no hidden rows, hidden columns, or cell
  comments in the sheet. Per campaign rule 6 this is not resolved by me. Westwood outreach is
  frozen until Antonio rules. Detail in `/outreach/facilities.md`.
- Open items: a program named Guttenberg carrying a Bergenfield address, and empty Fire
  Suppression and Generator columns on every row.

### D2. `Grant_Updates.xlsx`

- Received 2026-08-31 from Antonio. Covers 2022 through 2027.
- What it verified: funding by year, funder, program focus, amount spent, and balance.
  Totals reconcile exactly for 2022, 2023, 2025, and 2026. The 2024 sheet states $517,493.00
  against funder rows summing to $519,993.00, a $2,500.00 gap equal to one row the file
  itself flags as uncertain.
- Key finding: **no CDBG, HOME, NJHMFA, DCA, county community development, or municipal
  affordable housing trust fund award appears anywhere in the file.** This was established by
  searching every funder name and program note across all six sheets, not by assumption.
- Key finding: Spectrum already administers public money. NJ Department of Labor $187,475.
  Inclusive Healthy Communities $248,660, for work placing clients on Bergen County advisory
  boards. Office of Faith Based Initiatives $10,000. Arts Institute of Middlesex County
  $30,775.32.
- Correction to the campaign brief: the brief refers to "The Arc of New Jersey contacts
  already in the grant file." **The Arc of New Jersey does not appear in the grant file.** It
  appears in the verified facts list only as the source of the Voices Award. Columbia Bank is
  in the file, at $70,000 across 2022 to 2025.
- Analysis written to `/outreach/grant_history.md`.

---

## LEVEL B: SEARCH SNIPPET ONLY, NOT USABLE IN OUTREACH

These are recorded so the work is not lost. Each must be re-checked at Level A before use.

### B1. NJ Fourth Round affordable housing obligation, timing and scale

- Accessed: 2026-08-31, via search, page not openable.
- Attributed URLs:
  - https://www.nj.gov/dca/news/news/2025/20251126.shtml
  - https://www.glenridgenj.org/wp-content/uploads/2026/03/68-26-AFFORDABLE-HOUSING-TRUST-FUND-SPENDING-PLAN.pdf
- What the search summary asserted:
  - The Fourth Round obligation period runs 1 July 2025 through 30 June 2035, under
    amendments to the NJ Fair Housing Act, N.J.S.A. 52:27D-301 et seq.
  - DCA released obligation calculations in October 2024 covering the state's 564
    municipalities, described as calling for 150,000 units of present and future need.
  - DCA announced more than $35 million in state Affordable Housing Trust Fund awards in
    fiscal 2026 across 23 projects, described as favoring rental and homeownership
    projects of 25 units or fewer.
  - Municipalities are adopting Fourth Round trust fund spending plans, Glen Ridge cited
    as one example.
- Status: **Level B.** This is the backbone of the campaign timing angle. It must be
  confirmed against the DCA site and against each specific town's own adopted plan before
  it is asserted to any official. Per the campaign brief, the obligation and trust fund
  status of each individual town must be verified for that town before the angle is used
  with it. No town-specific obligation figure or trust fund balance has been obtained.

### B2. Bergen County Division of Community Development

- Accessed: 2026-08-31, via search, page not openable.
- Attributed URLs:
  - https://bergencountynj.gov/bergen-county-department-of-administration-finance/about-community-development/community-development-block-grant-cdbg/
  - https://www.co.bergen.nj.us/community-development-residents/cdbg
- What the search summary asserted: the office administers CDBG; address given as One
  Bergen County Plaza, 5th Floor, Hackensack, NJ 07601-7076; phone 201-336-7335;
  fax 201-336-7304; a general county executive phone of 201-336-7300.
- Status: **Level B.** Office exists and is the right target. No named staff contact and
  no email obtained. Address and phone unconfirmed.

### B3. Middlesex County Division of Housing, Community Development and Social Services

- Accessed: 2026-08-31, via search, page not openable.
- Attributed URL:
  - https://www.middlesexcountynj.gov/government/departments/department-of-community-services/office-of-human-services/division-of-housing-community-development-and-social-services
- What the search summary asserted: the division administers three HUD funded programs,
  Section 8 rental assistance, CDBG, and HOME; address 75 Bayard Street, New Brunswick,
  NJ 08901; phone 732-745-3025; a departmental email address was also returned.
- Status: **Level B.** This is a strong structural match for the campaign's funding ask,
  since CDBG and HOME are both named campaign targets. The departmental email is held in
  the quarantine section below rather than in targets.csv, because it has not been read
  on the official page.

### B4. Bergenfield borough government

- Accessed: 2026-08-31, via search, pages not openable.
- Attributed URLs:
  - https://bergenfieldnj.gov/mayor-and-council/
  - https://bergenfieldnj.gov/departments/borough-clerk/
  - https://bergenfieldnj.gov/
- What the search summary asserted: borough hall at 198 N. Washington Ave., Bergenfield,
  NJ 07621, phone 201-387-4055, and a named sitting mayor.
- Status: **Level B.** The mayor's name is held in quarantine below. Council member names,
  the borough administrator, the clerk, and all email addresses were not obtained.

### B5. Passaic County community development

- Accessed: 2026-08-31.
- Result: the search query returned "Web search error: unavailable." No sources obtained.
- Status: **No data.** Passaic County research has not started.

---

## LEVEL C: QUARANTINED UNVERIFIED LEADS, DO NOT USE IN ANY DRAFT

These are written down only so the lead is not lost when access is restored. They must not
appear in any letter, email, agenda, or contact file. They are not confirmed against any
official page and officials change between elections and appointments.

- A search summary attributed the name **Arvin Matorio** to the office of Mayor of
  Bergenfield, sourced to bergenfieldnj.gov. Unconfirmed. Do not address any
  correspondence to this name until the borough's own page is read.
- A search summary returned **housing@co.middlesex.nj.us** as a departmental email for the
  Middlesex County housing division. Unconfirmed, and note that it uses a different domain
  than the county site the summary cited. Do not send to this address until confirmed.

---

## RESEARCH NOT YET STARTED

Blocked on the same access problem, listed so nothing is silently dropped:

- Westwood, Elmwood Park, Paramus, and Edison municipal officials.
- Bergen, Passaic, and Middlesex county executives and administrators.
- County human services offices, housing authorities, planning departments, land banks.
- Town by town affordable housing obligation figures and trust fund balances.
- Surplus and municipally owned property records for any town.
- Tier 3 town selection, which depends entirely on the obligation and surplus land data.

---

## OPEN QUESTIONS FOR ANTONIO

Answered on 2026-08-31: the complete property list and the grant file, both supplied. See
Level D above.

Still open, in priority order:

1. **Westwood lease.** Carver ATC shows a lease expiring 2023-12-31 on a list dated 2026.
   Holdover, renewed, or stale data? This decides whether Westwood is the most urgent target
   in the campaign. Nothing goes to Westwood until this is answered.
2. **Antonio's job title**, his phone, and the phone and email for Salvador Moran. Resolved
   2026-08-31 from the connected Outlook account: Antonio Salters,
   asalters@spectrumforliving.org. The Microsoft 365 profile returns no job title. Salvador
   Moran's address has not been guessed and will not be. Proposed signing split awaiting
   confirmation: Salvador Moran signs elected officials, Antonio signs staff.
4. **The Arc of New Jersey.** Not in the grant file. Is there a separate contact record, or
   does the Phase 4 letter request go to Columbia Bank only?
5. **ATC.** Confirm it means Adult Training Center and that these are the day program sites.
6. **Amboy 2024 row.** Should the $2,500.00 count toward the 2024 total?
7. **Guttenberg program** carries a Bergenfield address. Legacy name or file error?
8. **Fire suppression and generators.** Both columns are empty for all 27 rows. Unrecorded or
   absent? It matters for a 24 hour nursing facility.
9. **Network access.** Still blocked. No official contact can be verified from this session.

---

Sources checked:
- https://bergenfieldnj.gov/mayor-and-council/ (blocked, not readable)
- https://bergenfieldnj.gov/departments/borough-clerk/ (blocked, not readable)
- https://www.nj.gov/dca/ (blocked, not readable)
- https://www.co.bergen.nj.us/ (blocked, not readable)
- https://www.edisonnj.org/ (blocked, not readable)
- https://bergencountynj.gov/bergen-county-department-of-administration-finance/about-community-development/community-development-block-grant-cdbg/ (search attribution only)
- https://www.middlesexcountynj.gov/government/departments/department-of-community-services/office-of-human-services/division-of-housing-community-development-and-social-services (search attribution only)
- https://www.nj.gov/dca/news/news/2025/20251126.shtml (search attribution only)
- https://www.glenridgenj.org/wp-content/uploads/2026/03/68-26-AFFORDABLE-HOUSING-TRUST-FUND-SPENDING-PLAN.pdf (search attribution only)

No claim in this log is presented as verified. Every factual line above is marked Level B
or Level C and is unusable in outreach until confirmed at Level A.
