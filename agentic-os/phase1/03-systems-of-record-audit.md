# Systems of Record — Live Audit Findings

**Date:** 2026-09-17
**Method:** Read-only Microsoft 365 connector, structural inspection only. Identity, granted scopes, SharePoint folder structure, and document search by administrative term. **No document contents were opened.** No resident-identifying material was encountered; had any appeared, the audit would have stopped per the standing constraint.

---

## Why this audit happened

Your answer to Q1 was a decision rule, not a decision: *"[Microsoft 365 / Google Workspace — pick the one hosting finance, HR, and controlled documents] is authoritative for Phase 2."*

That rule cannot be executed from the chair. Rather than return the question to you, I resolved what I could directly — the Microsoft 365 side is reachable from this session read-only.

---

## Finding 1 — Microsoft 365 is authoritative for email and calendar. Verified.

| Item | Value |
|---|---|
| Tenant | `spectrumforliving.org` |
| Tenant ID | `d08f21d6-4f06-4efd-a97d-58d3c5c6bde2` |
| SharePoint host | `spectrumforliving2.sharepoint.com` |
| Account audited | Antonio Salters, `asalters@spectrumforliving.org` |

Mail, calendar, and Teams chat scopes are granted and live. Email and calendar are unambiguously Microsoft 365.

## Finding 2 — SharePoint is NOT the document system of record. Verified.

This is the decisive finding and it was not the expected answer.

| Probe | Result |
|---|---|
| Folder search: `Finance` | **No results** |
| Folder search: `Policy` | **No results** |
| Document search: `policy` | **No results** |
| Document search: `budget` | **No results** |
| Folder search: `Shared` | 4 results, total across tenant |

The entire SharePoint estate visible to your account is three sites:

| Site | Notable folder | Last modified |
|---|---|---|
| `/sites/SpectrumforLiving` | `Shared Documents/General` | **2021-11-03** |
| `/sites/CentralRecreation-Residential` | `Attachments`, `Email attachments` | 2023-09-09 |
| `/sites/allcompany` | `Apps/Viva Engage` (auto-created) | 2026-07-20 |

The main organizational site's General folder has not been touched since **November 2021**. There are no finance, HR, or policy folders. There are zero documents matching "policy" or "budget" anywhere in the tenant.

**Interpretation:** SharePoint at Spectrum is a dormant shell, not a document store. A $48M organization with 688 employees has policies, budgets, and personnel files. They are not here.

## Finding 3 — Q1 resolves to a split answer, which your instruction did not anticipate

By your own decision rule — *the one hosting finance, HR, and controlled documents* — SharePoint is eliminated on direct evidence. Google Workspace is the answer **by elimination**.

I want to be precise about the strength of that claim. My evidence is **negative, not positive**: I have verified SharePoint is empty. I have not verified Google Drive is full, because there is no Google connector in this session. The inference is strong but it is an inference.

**Resulting architecture, which differs from the single-tenant model your instruction assumed:**

| Domain | Authoritative | Basis |
|---|---|---|
| Email | **Microsoft 365** | Verified directly |
| Calendar | **Microsoft 365** | Verified directly |
| Teams chat | **Microsoft 365** | Verified directly |
| Documents / SOPs / policies / contracts | **Google Workspace** | By elimination — needs one confirmation |
| Finance, HR, controlled documents | **Google Workspace** | By elimination — needs one confirmation |

**Consequence for your instruction "permission model inherits the authoritative tenant":** it cannot, as written. There are two tenants and the authoritative one differs by domain. The Phase 2 permission model must therefore resolve identity across both — a Google Drive ACL and an Entra identity for the same person, reconciled to one principal.

That is more work than a single-tenant model, and it is unavoidable rather than optional. It is also, precisely, the parallel-source-of-truth defect your operating principles name: this organization runs two collaboration platforms and the boundary between them is undocumented. Phase 2 does not fix that. It does have to survive it.

**What I need from you:** one line confirming Google Workspace holds finance, HR, and controlled documents. If it does not — if those live in a file server, a finance system, or somewhere else entirely — say where, because the elimination inference then fails and Phase 2 has no target.

## Finding 4 — The M365 connector is over-permissioned. Security finding, Phase 1 item.

Currently granted to this connector on your account:

```
Files.ReadWrite.All      Mail.ReadWrite      Mail.Send
Calendars.ReadWrite      MailboxSettings.ReadWrite
```

Phase 1 and Phase 2 require read only. `Mail.Send` is a **Tier 2 capability sitting available with no approval gate in front of it** — the governance model says external communication requires your approval with a full draft shown first, and this scope predates that model.

This is not a hypothetical. Any agent or process authenticating through this connector can send mail as you today.

**Recommendation:** reduce to the read-only set below until the approval gate exists in Paperclip and has passed the adversarial test. Restore write scopes per-capability, gated, in Phase 6.

```
Files.Read.All    Mail.Read    Calendars.Read
Sites.Read.All    User.Read    User.ReadBasic.All
```

Owner: Sean. This is an Entra admin change, not a code change.

## Finding 5 — The `spectrumforliving2` hostname suggests a prior tenant

The SharePoint host is `spectrumforliving2.sharepoint.com`, not `spectrumforliving`. The `2` suffix typically indicates the original name was taken — most often by an earlier tenant belonging to the same organization.

**Question for Sean, not blocking:** is there a legacy Microsoft tenant? If one exists and still holds data, it is an un-inventoried system of record containing potentially controlled documents, and it belongs in the classification map.

---

## Classification map updates

| Domain | Was | Now |
|---|---|---|
| Documents / SOPs / policies | UNRESOLVED | **Google Workspace** — pending one confirmation |
| Email internal + external | Outlook / M365 | **Confirmed M365** |
| Calendar | UNRESOLVED | **Confirmed M365** |
| Teams chat | Not listed | **M365** — added, Class B–C |
| Legacy M365 tenant | Not listed | **Unknown — added to gap list** |

Still unknown, and gathered by conversation with the owning directors rather than by access: work orders, fleet, IT ticketing, accounting/GL, grants pipeline. These are the Phase 1 inventory conversations, and they pair naturally with the 1:1s you are holding before each department enters Phase 5.
