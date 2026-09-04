/**
 * generate_spec.js — regenerates docs/FORM_SPEC.md from apps-script/00_Config.gs.
 *
 * The spec is generated, never hand-written, so it cannot drift from what the
 * form actually does. Run it after any change to the config:
 *
 *   node docs/generate_spec.js
 *
 * Requires only Node. The Google services are stubbed because this file only
 * needs the pure configuration and the priority-derivation logic.
 */

const fs = require('fs');
const path = require('path');

// --- Stubs so the .gs sources evaluate outside Apps Script -----------------
const Logger = { log: () => {} };
const Utilities = { formatDate: (d) => d.toISOString() };
const SpreadsheetApp = { getUi: () => { throw new Error('no ui'); }, getActiveSpreadsheet: () => null };
const FormApp = { ItemType: {}, DestinationType: {}, FileType: {} };
const PropertiesService = { getScriptProperties: () => ({ getProperty: () => null, setProperty: () => {} }) };
const DriveApp = {};
const MailApp = { sendEmail: () => {} };
const Session = { getActiveUser: () => ({ getEmail: () => '' }) };
const ScriptApp = { getProjectTriggers: () => [] };
const LockService = { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) };

const SCRIPT_DIR = path.join(__dirname, '..', 'apps-script');
let src = '';
fs.readdirSync(SCRIPT_DIR)
  .filter((f) => f.endsWith('.gs'))
  .sort()
  .forEach((f) => { src += fs.readFileSync(path.join(SCRIPT_DIR, f), 'utf8') + '\n'; });

// `const` inside eval does not leak, so hand the bindings back explicitly.
const C = eval(src + `;({
  SITES, CATEGORIES, QUEUES, PRIORITIES, PRIORITY_ORDER, BUSINESS_HOURS,
  SURVEY_SENSITIVE_CATEGORIES, SURVEY_SENSITIVE_FLOOR, LANDLORD_CATEGORIES,
  RESOLUTION_CODES, CHECKBOX_STEPS, derivePriority_, tagged_
})`);

const out = [];
const P = (s) => out.push(s === undefined ? '' : s);
const code = (s) => '`' + s + '`';

// --- Header ----------------------------------------------------------------
P('# Form Specification');
P();
P('**Generated from ' + code('apps-script/00_Config.gs') + ' by ' + code('docs/generate_spec.js') + '.**');
P('Do not edit by hand — regenerate it when the config changes, so the spec can never');
P('drift from what the form actually does.');
P();
P('Review this before deploying. Every question, every branch, every escalation trigger.');
P();
P('---');
P();

// --- Form 1 ----------------------------------------------------------------
P('## FORM 1 — Work Order Request');
P();
P('Audience: all staff. This is the link that gets shared and QR-coded.');
P();
P('### Section 1 — Who and where (always shown)');
P();
P('| Question | Type | Required |');
P('|---|---|---|');
P('| Your name | Short text | Only if sign-in is off |');
P('| Your email | Short text, email-validated | Only if sign-in is off |');
P('| Best phone number to reach you | Short text | Yes |');
P('| Site | Dropdown, ' + C.SITES.length + ' options | Yes |');
P('| Area, room or location within the site | Short text | Yes |');
P('| **What kind of problem is it?** | Dropdown, ' + C.CATEGORIES.length +
  ' options | Yes — **branch point** |');
P();
P('### Sections 2–' + (C.CATEGORIES.length + 1) + ' — one per category (conditional)');
P();
P('Answering the category question jumps to exactly one of these sections. Each then falls');
P('through to Details, so a respondent only ever sees the questions for their own problem.');
P();

C.CATEGORIES.forEach((c, i) => {
  const floored = C.SURVEY_SENSITIVE_CATEGORIES.indexOf(c.key) >= 0;
  P('#### ' + (i + 2) + '. ' + c.label + '  ·  ' + code(c.key));
  P();
  P('Queue: **' + C.QUEUES[c.queue].label + '** · Base priority: **' + c.basePriority + '**' +
    (floored ? ' · **Survey floor applies** (' + C.SURVEY_SENSITIVE_FLOOR +
               ' minimum at licensed sites)' : ''));
  P();
  P('| Question | Type | Req | Answers that raise priority |');
  P('|---|---|---|---|');
  c.followUps.forEach((f) => {
    P('| ' + f.q + ' | ' + (f.type === 'LIST' ? 'Dropdown' : 'Short text') + ' | ' +
      (f.required ? 'Yes' : 'No') + ' | ' +
      (f.escalateOn && f.escalateOn.length
        ? f.escalateOn.map(code).join(', ')
        : '—') + ' |');
  });
  P();
});

P('### Final section — Details (always shown)');
P();
P('| Question | Type | Required |');
P('|---|---|---|');
P('| Describe the problem | Paragraph | Yes |');
P('| Photo | File upload, images, max 3 × 10MB | No — **requires sign-in** |');
P('| Has this been reported before at this site? | Dropdown | Yes |');
P('| Asset tag or serial number | Short text | No |');
P();
P('---');
P();

// --- Form 2 ----------------------------------------------------------------
P('## FORM 2 — Work Order Close-Out');
P();
P('Audience: maintenance staff only, designed for a phone. Not shared widely.');
P();
P('| Question | Type | Notes |');
P('|---|---|---|');
P('| WO number | Short text | Pattern-validated ' + code('WO-YYYY-NNNN') + ' |');
P('| Update type | Dropdown | Drives the disposition |');
P('| Labour hours this visit | Number | Accumulates across visits |');
P('| Parts cost | Number | Accumulates |');
P('| Vendor used | Short text | Blank means in house |');
P('| Vendor invoice amount | Number | Accumulates |');
P('| Resolution code | Dropdown, ' + C.RESOLUTION_CODES.length + ' options | |');
P('| What was done | Paragraph | Appends, never overwrites |');
P('| Asset tag | Short text | Feeds the asset register |');
P('| Flag for capital replacement? | Dropdown | Feeds the capital plan |');
P();
P('---');
P();

// --- Priority model --------------------------------------------------------
P('## HOW PRIORITY IS DERIVED');
P();
P('Priority is never self-selected. Start at the category base, then raise one level for');
P('each escalation answer the requester actually gave. One hit means urgent, two means');
P('emergency. Licensed sites floor the listed categories at ' + C.SURVEY_SENSITIVE_FLOOR + '.');
P();
P('| Priority | Respond within | Resolve within | Clock |');
P('|---|---|---|---|');
C.PRIORITY_ORDER.forEach((p) => {
  const x = C.PRIORITIES[p];
  P('| ' + x.label + ' | ' + x.respondHrs + 'h | ' + x.resolveHrs + 'h | ' +
    (x.clock === 'WALL' ? 'Elapsed, 24/7' : 'Business hours') + ' |');
});
P();
P('Business hours: ' + C.BUSINESS_HOURS.startHour + ':00–' + C.BUSINESS_HOURS.endHour +
  ':00, Monday to Friday. Group homes do not close, so emergencies use elapsed time.');
P();
P('### Resulting range per category');
P();
P('Verified by running the actual derivation logic, not written by hand.');
P();
P('| Category | Base | No escalations | All escalations | Minimum at a licensed site |');
P('|---|---|---|---|---|');

const plain = { surveySensitive: false, landlord: '' };
const lic = { surveySensitive: true, landlord: '' };

C.CATEGORIES.forEach((c) => {
  const none = {};
  const all = {};
  c.followUps.forEach((f) => {
    if (f.escalateOn && f.escalateOn.length) all[C.tagged_(c.key, f.q)] = f.escalateOn[0];
    if (f.type === 'LIST' && f.choices) {
      const safe = f.choices.find((ch) => !f.escalateOn || f.escalateOn.indexOf(ch) < 0);
      if (safe) none[C.tagged_(c.key, f.q)] = safe;
    }
  });
  P('| ' + c.label + ' | ' + c.basePriority + ' | ' +
    C.derivePriority_(c, none, plain).priority + ' | ' +
    C.derivePriority_(c, all, plain).priority + ' | ' +
    C.derivePriority_(c, none, lic).priority + ' |');
});
P();
P('---');
P();

// --- Routing ---------------------------------------------------------------
P('## ROUTING');
P();
P('| Queue | Receives |');
P('|---|---|');
Object.keys(C.QUEUES).forEach((k) => {
  const cats = C.CATEGORIES.filter((c) => c.queue === k).map((c) => c.label);
  P('| **' + C.QUEUES[k].label + '** | ' +
    (k === 'LANDLORD'
      ? 'Any of ' + C.LANDLORD_CATEGORIES.map(code).join(', ') + ' raised at a leased site'
      : (cats.length ? cats.join(', ') : 'Only via the "Something else" routing question')) +
    ' |');
});
P();
const leased = C.SITES.filter((s) => s.landlord);
P('Leased sites (' + leased.length + '): ' +
  leased.map((s) => s.name + ' — ' + s.landlord).join('; ') + '.');
P();
P('---');
P();

// --- Checkboxes ------------------------------------------------------------
P('## STAFF COMPLETION CHECKBOXES (in the Sheet)');
P();
P('| Checkbox | Sets status to | Emails the requester |');
P('|---|---|---|');
C.CHECKBOX_STEPS.forEach((s) => {
  P('| ' + s.col + ' | ' + s.status + ' | ' + (s.notifyRequester ? 'Yes' : 'No') + ' |');
});
P();
P('---');
P();

// --- Sites -----------------------------------------------------------------
P('## SITES (' + C.SITES.length + ')');
P();
P('| Site | Town | County | Type | Licensed | Landlord |');
P('|---|---|---|---|---|---|');
C.SITES.forEach((s) => {
  P('| ' + s.name + ' | ' + s.town + ' | ' + s.county + ' | ' + s.type + ' | ' +
    (s.surveySensitive ? 'Yes' : '—') + ' | ' + (s.landlord || '—') + ' |');
});
P();
P('Types: GH group home · APT supervised apartments · ATC adult day program ·');
P('ICF intermediate care facility · ADMIN office.');
P();
P('Derived from ' + code('2026_Facility_List.xlsx') + ' via ' + code('outreach/facilities.md') + '.');

const target = path.join(__dirname, 'FORM_SPEC.md');
fs.writeFileSync(target, out.join('\n') + '\n');
console.log('Wrote ' + target + ' (' + out.length + ' lines)');
