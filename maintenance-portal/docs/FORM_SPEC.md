# Form Specification

**Generated from `apps-script/00_Config.gs` by `docs/generate_spec.js`.**
Do not edit by hand — regenerate it when the config changes, so the spec can never
drift from what the form actually does.

Review this before deploying. Every question, every branch, every escalation trigger.

---

## FORM 1 — Work Order Request

Audience: all staff. This is the link that gets shared and QR-coded.

### Section 1 — Who and where (always shown)

| Question | Type | Required |
|---|---|---|
| Your name | Short text | Only if sign-in is off |
| Your email | Short text, email-validated | Only if sign-in is off |
| Best phone number to reach you | Short text | Yes |
| Site | Dropdown, 27 options | Yes |
| Area, room or location within the site | Short text | Yes |
| **What kind of problem is it?** | Dropdown, 14 options | Yes — **branch point** |

### Sections 2–15 — one per category (conditional)

Answering the category question jumps to exactly one of these sections. Each then falls
through to Details, so a respondent only ever sees the questions for their own problem.

#### 2. Heating, Cooling, Ventilation  ·  `HVAC`

Queue: **Facilities** · Base priority: **P3** · **Survey floor applies** (P2 minimum at licensed sites)

| Question | Type | Req | Answers that raise priority |
|---|---|---|---|
| What is happening? | Dropdown | Yes | `No heat`, `No cooling` |
| Current indoor temperature (approximate, °F) | Short text | No | — |
| How much of the building is affected? | Dropdown | Yes | `Whole building` |

#### 3. Plumbing and Water  ·  `Plumbing`

Queue: **Facilities** · Base priority: **P3** · **Survey floor applies** (P2 minimum at licensed sites)

| Question | Type | Req | Answers that raise priority |
|---|---|---|---|
| What is happening? | Dropdown | Yes | `No water at all`, `Active leak / flooding`, `Sewage backup` |
| Is water actively running or flooding right now? | Dropdown | Yes | `Yes` |
| Have you shut off the water to the fixture? | Dropdown | No | — |
| How many bathrooms are still usable at this site? | Dropdown | Yes | `None` |

#### 4. Electrical and Power  ·  `Electrical`

Queue: **Facilities** · Base priority: **P2** · **Survey floor applies** (P2 minimum at licensed sites)

| Question | Type | Req | Answers that raise priority |
|---|---|---|---|
| What is happening? | Dropdown | Yes | `Total power outage`, `Burning smell or sparking`, `Generator problem`, `Emergency lighting / exit sign out` |
| Is any medical or life-support equipment affected? | Dropdown | Yes | `Yes` |
| If a breaker tripped, does it hold when reset? | Dropdown | No | `Trips again immediately` |

#### 5. Fire and Life Safety  ·  `Fire/Life Safety`

Queue: **Facilities** · Base priority: **P1** · **Survey floor applies** (P2 minimum at licensed sites)

| Question | Type | Req | Answers that raise priority |
|---|---|---|---|
| What is happening? | Dropdown | Yes | — |
| Has the fire department or alarm company already been called? | Dropdown | Yes | — |

#### 6. Doors, Locks, Windows and Security  ·  `Doors/Locks/Security`

Queue: **Facilities** · Base priority: **P3**

| Question | Type | Req | Answers that raise priority |
|---|---|---|---|
| What is happening? | Dropdown | Yes | `Exterior door will not lock`, `Exterior door will not open`, `Window broken or will not close` |
| Can the building be secured tonight? | Dropdown | Yes | `No` |

#### 7. Accessibility and Adaptive Equipment  ·  `Accessibility`

Queue: **Facilities** · Base priority: **P2** · **Survey floor applies** (P2 minimum at licensed sites)

| Question | Type | Req | Answers that raise priority |
|---|---|---|---|
| What equipment? | Dropdown | Yes | `Ramp`, `Ceiling lift / track`, `Grab bar or handrail` |
| Is a workaround available while this is repaired? | Dropdown | Yes | `No` |

#### 8. Appliances  ·  `Appliance`

Queue: **Facilities** · Base priority: **P3**

| Question | Type | Req | Answers that raise priority |
|---|---|---|---|
| Which appliance? | Dropdown | Yes | `Refrigerator`, `Freezer`, `Water heater` |
| Asset tag or serial number (if visible) | Short text | No | — |
| Is food storage or meal service affected right now? | Dropdown | Yes | `Yes` |

#### 9. Structural, Walls, Floors, Ceilings, Roof  ·  `Structural`

Queue: **Facilities** · Base priority: **P3** · **Survey floor applies** (P2 minimum at licensed sites)

| Question | Type | Req | Answers that raise priority |
|---|---|---|---|
| What is affected? | Dropdown | Yes | `Roof leak`, `Ceiling damage or sagging`, `Stairs or railing` |
| Is the area a trip, fall or collapse hazard right now? | Dropdown | Yes | `Yes` |

#### 10. Pest Control  ·  `Pest`

Queue: **Facilities** · Base priority: **P3**

| Question | Type | Req | Answers that raise priority |
|---|---|---|---|
| What was seen? | Dropdown | Yes | `Bed bug`, `Rodent` |
| Where? | Dropdown | Yes | `Kitchen or food area`, `Bedroom` |
| How often is it being seen? | Dropdown | No | — |

#### 11. Grounds, Exterior, Snow and Ice  ·  `Grounds`

Queue: **Facilities** · Base priority: **P3**

| Question | Type | Req | Answers that raise priority |
|---|---|---|---|
| What is needed? | Dropdown | Yes | `Snow or ice removal`, `Walkway or parking hazard` |
| Does this block an accessible entrance or exit route? | Dropdown | Yes | `Yes` |

#### 12. Vehicle and Fleet  ·  `Fleet`

Queue: **Fleet** · Base priority: **P3**

| Question | Type | Req | Answers that raise priority |
|---|---|---|---|
| Vehicle number or license plate | Short text | Yes | — |
| Current odometer reading | Short text | No | — |
| What is happening? | Dropdown | Yes | `Will not start`, `Brakes`, `Wheelchair lift or ramp` |
| Is the vehicle safe to drive? | Dropdown | Yes | `No`, `Not sure` |
| Does this affect scheduled program transportation today? | Dropdown | Yes | `Yes` |

#### 13. Technology, Phones and Network  ·  `IT`

Queue: **IT** · Base priority: **P3**

| Question | Type | Req | Answers that raise priority |
|---|---|---|---|
| What is affected? | Dropdown | Yes | `Internet or Wi-Fi down`, `Phone system` |
| How many people are affected? | Dropdown | Yes | `Everyone at this site` |
| Does this stop documentation, billing or medication records? | Dropdown | Yes | `Yes` |

#### 14. Furniture and Fixtures  ·  `Furniture`

Queue: **Facilities** · Base priority: **P4**

| Question | Type | Req | Answers that raise priority |
|---|---|---|---|
| What item? | Short text | Yes | — |
| Is this a repair or a replacement request? | Dropdown | Yes | — |
| Is the item a safety hazard right now — broken, sharp or unstable? | Dropdown | Yes | `Yes` |

#### 15. Something else  ·  `Other`

Queue: **Facilities** · Base priority: **P3**

| Question | Type | Req | Answers that raise priority |
|---|---|---|---|
| Which team should see this? | Dropdown | Yes | — |
| Is anyone unsafe or at risk of injury right now? | Dropdown | Yes | `Yes` |
| Can the site keep operating normally until this is fixed? | Dropdown | Yes | `No` |

### Final section — Details (always shown)

| Question | Type | Required |
|---|---|---|
| Describe the problem | Paragraph | Yes |
| Photo | File upload, images, max 3 × 10MB | No — **requires sign-in** |
| Has this been reported before at this site? | Dropdown | Yes |
| Asset tag or serial number | Short text | No |

---

## FORM 2 — Work Order Close-Out

Audience: maintenance staff only, designed for a phone. Not shared widely.

| Question | Type | Notes |
|---|---|---|
| WO number | Short text | Pattern-validated `WO-YYYY-NNNN` |
| Update type | Dropdown | Drives the disposition |
| Labour hours this visit | Number | Accumulates across visits |
| Parts cost | Number | Accumulates |
| Vendor used | Short text | Blank means in house |
| Vendor invoice amount | Number | Accumulates |
| Resolution code | Dropdown, 11 options | |
| What was done | Paragraph | Appends, never overwrites |
| Asset tag | Short text | Feeds the asset register |
| Flag for capital replacement? | Dropdown | Feeds the capital plan |

---

## HOW PRIORITY IS DERIVED

Priority is never self-selected. Start at the category base, then raise one level for
each escalation answer the requester actually gave. One hit means urgent, two means
emergency. Licensed sites floor the listed categories at P2.

| Priority | Respond within | Resolve within | Clock |
|---|---|---|---|
| P1 — Emergency | 1h | 4h | Elapsed, 24/7 |
| P2 — Urgent | 4h | 24h | Elapsed, 24/7 |
| P3 — Routine | 24h | 120h | Business hours |
| P4 — Scheduled | 72h | 480h | Business hours |

Business hours: 8:00–16:00, Monday to Friday. Group homes do not close, so emergencies use elapsed time.

### Resulting range per category

Verified by running the actual derivation logic, not written by hand.

| Category | Base | No escalations | All escalations | Minimum at a licensed site |
|---|---|---|---|---|
| Heating, Cooling, Ventilation | P3 | P3 | P1 | P2 |
| Plumbing and Water | P3 | P3 | P1 | P2 |
| Electrical and Power | P2 | P2 | P1 | P2 |
| Fire and Life Safety | P1 | P1 | P1 | P1 |
| Doors, Locks, Windows and Security | P3 | P3 | P1 | P3 |
| Accessibility and Adaptive Equipment | P2 | P2 | P1 | P2 |
| Appliances | P3 | P3 | P1 | P3 |
| Structural, Walls, Floors, Ceilings, Roof | P3 | P3 | P1 | P2 |
| Pest Control | P3 | P3 | P1 | P3 |
| Grounds, Exterior, Snow and Ice | P3 | P3 | P1 | P3 |
| Vehicle and Fleet | P3 | P3 | P1 | P3 |
| Technology, Phones and Network | P3 | P3 | P1 | P3 |
| Furniture and Fixtures | P4 | P4 | P3 | P4 |
| Something else | P3 | P3 | P1 | P3 |

---

## ROUTING

| Queue | Receives |
|---|---|
| **Facilities** | Heating, Cooling, Ventilation, Plumbing and Water, Electrical and Power, Fire and Life Safety, Doors, Locks, Windows and Security, Accessibility and Adaptive Equipment, Appliances, Structural, Walls, Floors, Ceilings, Roof, Pest Control, Grounds, Exterior, Snow and Ice, Furniture and Fixtures, Something else |
| **Fleet** | Vehicle and Fleet |
| **IT** | Technology, Phones and Network |
| **Landlord / Association** | Any of `HVAC`, `Structural`, `Grounds`, `Fire/Life Safety` raised at a leased site |

Leased sites (3): Teaneck ATC — Grace Lutheran Church; N. Haledon ATC — High Mountain Church; Edison Condos — Waterford Condo Association.

---

## STAFF COMPLETION CHECKBOXES (in the Sheet)

| Checkbox | Sets status to | Emails the requester |
|---|---|---|
| Acknowledged | Acknowledged | Yes |
| Parts Ordered | Awaiting Parts | No |
| Vendor Called | Vendor Dispatched | No |
| On Site | In Progress | No |
| Work Complete | Work Complete | Yes |
| Site Verified | Verified | No |
| Closed | Closed | Yes |

---

## SITES (27)

| Site | Town | County | Type | Licensed | Landlord |
|---|---|---|---|---|---|
| Closter ICF | Closter | Bergen | ICF | Yes | — |
| Closter Apts. | Closter | Bergen | APT | Yes | — |
| Bergenfield Respite | Bergenfield | Bergen | GH | Yes | — |
| Guttenberg | Bergenfield | Bergen | GH | Yes | — |
| Northvale | Northvale | Bergen | GH | Yes | — |
| Paramus | Paramus | Bergen | GH | Yes | — |
| Norwood | Norwood | Bergen | GH | Yes | — |
| River Vale Apts. | River Vale | Bergen | APT | Yes | — |
| RVCO (Main Office) | River Vale | Bergen | ADMIN | — | — |
| Glen Rock | Glen Rock | Bergen | GH | Yes | — |
| Highwood | Glen Rock | Bergen | GH | Yes | — |
| Hillsdale | Hillsdale | Bergen | GH | Yes | — |
| Haworth | Haworth | Bergen | GH | Yes | — |
| Maywood | Maywood | Bergen | GH | Yes | — |
| Elmwood Park | Elmwood Park | Bergen | GH | Yes | — |
| Rockleigh Apts. | Rockleigh | Bergen | APT | Yes | — |
| Carver ATC | Westwood | Bergen | ATC | — | — |
| Westwood GH | Westwood | Bergen | GH | Yes | — |
| Teaneck ATC | Teaneck | Bergen | ATC | — | Grace Lutheran Church |
| N. Haledon ATC | North Haledon | Passaic | ATC | — | High Mountain Church |
| Wayne | Wayne | Passaic | GH | Yes | — |
| Ringwood ATC | Ringwood | Passaic | ATC | — | — |
| Ringwood Apts. | Ringwood | Passaic | APT | Yes | — |
| Edison 100 | Edison | Middlesex | GH | Yes | — |
| Edison ATC | Edison | Middlesex | ATC | — | — |
| Edison 300 | Edison | Middlesex | GH | Yes | — |
| Edison Condos | Edison | Middlesex | APT | Yes | Waterford Condo Association |

Types: GH group home · APT supervised apartments · ATC adult day program ·
ICF intermediate care facility · ADMIN office.

Derived from `2026_Facility_List.xlsx` via `outreach/facilities.md`.
