const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  WidthType, AlignmentType, HeadingLevel, BorderStyle, ShadingType,
  PageOrientation, Header, Footer, PageNumber, LevelFormat, convertInchesToTwip
} = require('docx');

const W = 9360;            // 6.5in content width in DXA
const FONT = 'Calibri';

// ---------- helpers ----------
const B = { style: BorderStyle.SINGLE, size: 4, color: '000000' };
const CELL_BORDERS = { top: B, bottom: B, left: B, right: B };

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align,
    spacing: { before: opts.before ?? 0, after: opts.after ?? 120 },
    indent: opts.indent,
    children: [new TextRun({
      text, bold: opts.bold, italics: opts.italics,
      size: opts.size ?? 22, font: FONT, color: opts.color, allCaps: opts.caps
    })]
  });
}

function runs(parts, opts = {}) {
  return new Paragraph({
    spacing: { before: opts.before ?? 0, after: opts.after ?? 120 },
    indent: opts.indent,
    children: parts.map(x => new TextRun({
      text: x.t, bold: x.b, italics: x.i, size: opts.size ?? 22, font: FONT
    }))
  });
}

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 360, after: 160 },
    children: [new TextRun({ text, bold: true, size: 26, font: FONT, color: '000000' })]
  });
}

function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 240, after: 120 },
    children: [new TextRun({ text, bold: true, size: 23, font: FONT, color: '000000' })]
  });
}

function bullet(text, level = 0) {
  return new Paragraph({
    numbering: { reference: 'bullets', level },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22, font: FONT })]
  });
}

function numItem(text) {
  return new Paragraph({
    numbering: { reference: 'numbers', level: 0 },
    spacing: { after: 80 },
    children: [new TextRun({ text, size: 22, font: FONT })]
  });
}

function cell(text, { bold = false, shade = null, width, align } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    borders: CELL_BORDERS,
    shading: shade ? { type: ShadingType.CLEAR, fill: shade, color: 'auto' } : undefined,
    margins: { top: 60, bottom: 60, left: 90, right: 90 },
    children: [new Paragraph({
      alignment: align,
      spacing: { before: 20, after: 20 },
      children: [new TextRun({ text, bold, size: 21, font: FONT })]
    })]
  });
}

// rows: array of arrays of strings; widths: array summing to W
function table(widths, rows, { header = true } = {}) {
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: widths,
    rows: rows.map((r, i) => new TableRow({
      tableHeader: header && i === 0,
      children: r.map((c, j) => cell(c, {
        bold: header && i === 0,
        shade: header && i === 0 ? 'D9D9D9' : null,
        width: widths[j]
      }))
    }))
  });
}

// two-column label/value block (Document Control style)
function kvTable(rows, w1 = 2600) {
  return table([w1, W - w1], rows, { header: false });
}

function rule() {
  return new Paragraph({
    spacing: { before: 120, after: 120 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' } },
    children: [new TextRun({ text: '', size: 2, font: FONT })]
  });
}

const spacer = (n = 120) => new Paragraph({ spacing: { after: n }, children: [new TextRun({ text: '', font: FONT, size: 22 })] });

// ---------- content ----------
const children = [];

// Title block
children.push(p('SPECTRUM FOR LIVING DEVELOPMENT, INC.', { bold: true, size: 24, align: AlignmentType.CENTER, after: 40 }));
children.push(p('Executive Policy and Procedure Manual', { size: 22, align: AlignmentType.CENTER, after: 240 }));
children.push(p('AGENTIC SYSTEM OWNERSHIP AND CONTINUITY', { bold: true, size: 32, align: AlignmentType.CENTER, after: 60 }));
children.push(p('Standard Operating Procedure SOP-26', { size: 24, align: AlignmentType.CENTER, after: 240 }));
children.push(p('Document ITG-SOP-26   |   Version 1.0', { size: 22, align: AlignmentType.CENTER, after: 40 }));
children.push(p('A component of ITG-MAN-001, Information Technology, Communications, Cybersecurity, and Artificial Intelligence Governance', { size: 20, italics: true, align: AlignmentType.CENTER, after: 240 }));
children.push(p('Draft for Executive, Legal, HR, Compliance, and Managed Service Provider Review', { size: 21, align: AlignmentType.CENTER, after: 200 }));
children.push(p('INTERNAL — CONFIDENTIAL', { bold: true, size: 21, align: AlignmentType.CENTER, after: 60 }));
children.push(p('Not in force until the Adoption Checklist in Section 10 is complete.', { size: 21, align: AlignmentType.CENTER, after: 300 }));

// Document control
children.push(h1('DOCUMENT CONTROL'));
children.push(kvTable([
  ['Field', 'Entry'],
  ['Document Title', 'Agentic System Ownership and Continuity'],
  ['Document Number', 'ITG-SOP-26'],
  ['Version', '1.0'],
  ['Parent Manual', 'ITG-MAN-001'],
  ['Document Owner', '[Chief Operating Officer], accountable executive owner'],
  ['Document Custodian', '[Director of Information Technology], maintains content, version control, and distribution'],
  ['Effective Date', '[INSERT]'],
  ['Supersedes', 'None. First issue.'],
  ['Review Cycle', 'Every six months by the Chief Operating Officer, and on any change to Section 3, any departure of a person named in Section 8, or any Priority 1 incident.'],
  ['Applies To', 'All employees, contracted staff, and vendors who operate, support, or approve work produced by the COO Agentic Operating System.'],
  ['Distribution', 'One electronic copy in the controlled policy library. One copy provided to the Managed Service Provider on engagement.'],
]));
children.push(spacer(160));
children.push(p('This document is a controlled record. Handwritten changes are not permitted. Requests for revision go to the Chief Operating Officer.', { italics: true, size: 21 }));

// Related documents
children.push(h1('RELATED DOCUMENTS'));
children.push(p('This procedure does not repeat what is already written elsewhere. It relies on the following.'));
children.push(table([2000, W - 2000], [
  ['Document', 'What it governs that this procedure depends on'],
  ['SOP-09', 'User creation, access changes, and user removal. Governs the departure process referenced in Section 8.'],
  ['SOP-10', 'Artificial Intelligence Usage Standard and Governance. Governs approved AI use across the organization. This procedure covers the operation of one system built under it.'],
  ['SOP-14', 'Data Classification, Privacy, and Secure File Sharing. Defines the data classes referenced in Section 4.'],
  ['SOP-15', 'Backup, Disaster Recovery, and Business Continuity Coordination. Governs the restore testing in Section 5.'],
  ['SOP-16', 'Vendor and Managed Service Provider Management. Governs the engagement described in Sections 3.2 and 6.4.'],
  ['SOP-17', 'Incident Management and Major-Incident Communications. Section 7 applies its priority scheme to this system.'],
  ['SOP-21', 'Records Retention and Legal Hold. Governs retention of the audit trail in Section 4.'],
  ['SOP-25', 'Business Continuity for Loss of Power, Phone, Internet, Cloud, or Vendor Systems.'],
]));

// READ THIS FIRST
children.push(h1('READ THIS FIRST'));
children.push(p('Three rules never change.', { bold: true }));
children.push(numItem('Stopping the system is always allowed. Nobody is disciplined for stopping it. Section 6.3 tells you how, and it takes under five minutes.'));
children.push(numItem('No agent sends money, submits a grant, or contacts a family member without a person approving it first. This is a design rule, not a preference.'));
children.push(numItem('If protected information may have reached an AI system that is not covered by our agreement, stop the system first and investigate second.'));
children.push(spacer(80));
children.push(p('If you are unsure whether something is serious enough to stop the system, stop it. An unnecessary stop costs a day of convenience. A problem left running costs more.', { italics: true }));

// 1. PURPOSE
children.push(h1('1. PURPOSE'));
children.push(p('This procedure names who runs the COO Agentic Operating System, what they do, and what happens when they are not available.'));
children.push(p('It exists so that the system does not depend on any one person, including the Chief Operating Officer. A system that only works when one person is present is a liability, not an asset.'));

// 2. SCOPE
children.push(h1('2. SCOPE'));
children.push(p('This procedure applies to the COO Agentic Operating System and to every person who operates it, supports it, or approves work it produces.'));
children.push(p('It does not govern general artificial intelligence use at Spectrum for Living. That is SOP-10. It does not govern the Managed Service Provider relationship generally. That is SOP-16.'));

// 3. SYSTEM OWNERSHIP
children.push(h1('3. SYSTEM OWNERSHIP'));
children.push(runs([
  { t: 'Section 3 is the only section that changes when ownership moves.', b: true },
  { t: ' Every other section refers to "the System Owner" and needs no edit. To transfer ownership to the Managed Service Provider, strike Section 3.1 and complete Section 3.2.' }
]));

children.push(h2('3.1 System Owner, current'));
children.push(kvTable([
  ['Role', '[Director of Information Technology]'],
  ['Name', '[INSERT]'],
  ['Type', 'Internal employee'],
  ['Reports to', 'Chief Operating Officer'],
  ['Email', '[INSERT]'],
  ['Telephone', '[INSERT]'],
  ['Committed time', '8 to 10 hours per month'],
  ['Cost basis', 'Within existing salary'],
  ['Response commitment', 'Same business day for Priority 1, per Section 7'],
], 2600));

children.push(h2('3.2 System Owner, alternate'));
children.push(p('To activate, strike Section 3.1, renumber this section as 3.1, and complete the entries below.', { italics: true }));
children.push(kvTable([
  ['Role', '[IT Provider Name], Managed Service Provider'],
  ['Organization', 'Aspen Technology'],
  ['Primary contact', '[INSERT]'],
  ['Escalation contact', '[INSERT]'],
  ['Support line', '[INSERT]'],
  ['Ticket portal or email', '[INSERT]'],
  ['Committed time', '8 to 10 hours per month'],
  ['Cost basis', '[INSERT] per month. See note below.'],
  ['Agreement reference', '[INSERT contract or statement of work number]'],
  ['Response commitment', 'Per the service level agreement, which must meet or exceed Section 7.'],
  ['Renewal date', '[INSERT]'],
], 2600));
children.push(spacer(100));
children.push(runs([
  { t: 'Cost note. ', b: true },
  { t: 'An external System Owner for this system alone is estimated at $1,000 to $2,500 per month. If Aspen Technology also holds the organization-wide technology contract, this system should be scoped as a line item on that agreement rather than a separate retainer. The difference is most of that figure. A standalone retainer should not be signed before the organization-wide technology coverage decision is made.' }
]));

children.push(h2('3.3 Backup Owner'));
children.push(kvTable([
  ['Name', 'Antonio Salters'],
  ['Role', 'Chief Operating Officer'],
  ['Email', 'asalters@spectrumforliving.org'],
  ['Telephone', '201-846-8664'],
  ['Scope', 'Continuity only. The Backup Owner keeps the system safe and stopped. The Backup Owner is not a technical substitute. See Section 6.1.'],
], 2600));

children.push(h2('3.4 Executive sponsor'));
children.push(p('The Chief Operating Officer approves all external communications and all financial, legal, or irreversible actions proposed by the system. The Chief Operating Officer is the sole authority for changing the data classification of any workflow.'));

children.push(h2('3.5 Standing reviewers'));
children.push(p('These are requests for review. Neither function reports to the Chief Operating Officer.'));
children.push(table([3000, W - 3000], [
  ['Function', 'Reviews'],
  ['Chief Human Resources Officer', 'Any workflow touching personnel records. The departure process in Section 8.'],
  ['Vice President, Compliance, Quality and Special Projects', 'Data classification. Privacy posture. Any change to how protected information is handled.'],
  ['Chief Clinical Officer', 'Any proposal that would place clinical or resident-facing content within the system.'],
]));

// 4. WHAT THE SYSTEM IS
children.push(h1('4. WHAT THE SYSTEM IS'));
children.push(p('A set of software agents that support the Chief Operating Officer’s operating departments: property and facilities, fleet, information technology, grants, finance support, operating procedures, and systems.'));
children.push(p('The system is five components. It was deliberately reduced from nine so that one person at 8 to 10 hours per month can run it.'));
children.push(table([600, 2600, W - 600 - 2600 - 2100, 2100], [
  ['No.', 'Component', 'Function', 'Maintained by'],
  ['1', 'Managed application platform', 'Runs the agents and the model router', 'Vendor'],
  ['2', 'Managed database', 'Knowledge, memory, audit trail, approvals', 'Vendor'],
  ['3', 'Object storage', 'Backups and index snapshots', 'Vendor'],
  ['4', 'Workflow service', 'Scheduled and rule-based tasks', 'Vendor'],
  ['5', 'Model router', 'Directs each request to the correct AI model', 'System Owner'],
]));
children.push(spacer(160));
children.push(p('Connected systems of record', { bold: true }));
children.push(table([3400, W - 3400], [
  ['Information', 'Authoritative system'],
  ['Documents, policies, contracts, finance, human resources', 'Google Workspace'],
  ['Email, calendar, Teams messages', 'Microsoft 365'],
  ['Work orders, fleet, technology tickets, accounting, grants', 'To be inventoried. See Section 10.'],
]));
children.push(spacer(160));
children.push(p('Rules that must not be relaxed without written direction from the Chief Operating Officer', { bold: true }));
children.push(numItem('Protected information goes only to AI providers covered by our signed Business Associate Agreement. If no covered provider is available, the system stops and notifies. It never falls back to an uncovered provider.'));
children.push(numItem('No agent holds payment credentials.'));
children.push(numItem('No agent submits a grant application. No agent executes a payment.'));
children.push(numItem('All communication directed to an individual we support, or to their family or guardian, requires approval from the Chief Operating Officer. There are no pre-approved templates and no standing approvals.'));
children.push(numItem('Protected information is removed from free text at the point of intake. If removal cannot be confirmed, the item is handled as protected information.'));
children.push(spacer(80));
children.push(p('Data classes are defined in SOP-14. Retention of the audit trail follows SOP-21.', { italics: true, size: 21 }));

// 5. DUTIES
children.push(h1('5. DUTIES OF THE SYSTEM OWNER'));
children.push(p('Total commitment is 8 to 10 hours per month. The Chief Operating Officer separately spends 2 to 4 hours per month on approvals. Both figures are reported in the monthly operations report as a cost of the system.'));

children.push(h2('5.1 Weekly, about 30 minutes'));
children.push(table([3600, W - 3600], [
  ['Task', 'Standard'],
  ['Review the health dashboard', 'No stopped workflows. No failed backups.'],
  ['Review the error queue', 'Any workflow stopped by two consecutive failures is investigated, not simply restarted.'],
  ['Confirm spending', 'Month to date within budget. No single agent consuming an unexpected share.'],
]));

children.push(h2('5.2 Monthly, about 4 hours'));
children.push(table([3600, W - 3600], [
  ['Task', 'Standard'],
  ['Review the cost report', 'Spending matches expectation. Any variance above 25 percent is explained in writing.'],
  ['Review the improvement backlog', 'No change is applied until it has passed its test.'],
  ['Check for vendor changes', 'Model retirements, price changes, and security advisories reviewed.'],
  ['Apply pending updates', 'Versions are fixed and updated deliberately. Automatic updating is not permitted.'],
  ['Confirm vendor telemetry remains disabled', 'Verified after every version update. A vendor default can return without notice.'],
]));

children.push(h2('5.3 Quarterly, about 3 hours'));
children.push(table([3600, W - 3600], [
  ['Task', 'Standard'],
  ['Restore test', 'A backup is restored into a clean environment and confirmed working. Confirming that a backup exists is not a restore test. Coordinated under SOP-15.'],
  ['Access review', 'Every person listed in Section 8 still requires the access they hold.'],
  ['Model review', 'Each workflow runs on the lowest-cost model that meets its quality standard.'],
]));

children.push(h2('5.4 As required'));
children.push(table([3600, W - 3600], [
  ['Task', 'Trigger'],
  ['Incident response', 'Section 7'],
  ['Adding a new agent', 'Written request from the Chief Operating Officer, after the department charter is countersigned by the responsible director'],
  ['Access changes', 'Any staff departure or role change, per SOP-09'],
]));

// 6. CONTINUITY
children.push(h1('6. CONTINUITY AND ABSENCE'));
children.push(p('The Backup Owner is the Chief Operating Officer, who is not a technical practitioner. The role in a contingency is to keep the system safe and stopped, not to keep it running.'));
children.push(p('This is deliberate. A person without technical training who attempts to keep a system running will usually make the situation worse. A person who can stop it cleanly, protect the records, and summon the right help has done everything that is needed.'));

children.push(h2('6.1 What the Backup Owner may and may not do'));
children.push(table([Math.floor(W / 2), W - Math.floor(W / 2)], [
  ['May do', 'May not do'],
  ['Execute the emergency stop in Section 6.3', 'Diagnose a technical fault'],
  ['Authorize emergency expenditure', 'Apply software updates or patches'],
  ['Engage the emergency vendor under Section 6.4', 'Restore a database'],
  ['Notify staff and leadership', 'Change system configuration'],
  ['Approve or reject pending approvals', 'Write or change agent instructions'],
  ['Decide that the system remains stopped', 'Restart the system'],
]));
children.push(spacer(100));
children.push(p('Restarting the system after an emergency stop requires the System Owner or the emergency vendor. This restriction is intentional.', { bold: true }));

children.push(h2('6.2 Absence scenarios'));
children.push(table([1800, 3200, W - 1800 - 3200], [
  ['Scenario', 'Definition', 'Action'],
  ['A. Short absence', 'System Owner unavailable for fewer than five business days and reachable for emergencies', 'The system continues. Weekly checks are deferred. The Chief Operating Officer watches for stopped workflows. No further action unless a Priority 1 arises.'],
  ['B. Extended absence', 'System Owner unavailable for more than five business days, or unreachable', 'The Chief Operating Officer engages the emergency vendor for weekly checks only. No updates, no configuration changes, and no new agents. The system runs in maintenance mode.'],
  ['C. Owner departed', 'Position vacant, agreement ended, or relationship terminated', 'Emergency stop within 24 hours unless a replacement System Owner is already in place. The access review in Section 8 is completed before any restart.'],
]));
children.push(spacer(100));
children.push(p('Scenario C is not excessive caution. A system with no owner that holds active credentials to Google Workspace and Microsoft 365 is a standing risk. Stopping it costs a few days of convenience.'));

children.push(h2('6.3 Emergency stop'));
children.push(p('Any person reading this procedure can perform these steps. No technical training is required. The steps take under five minutes.', { bold: true }));
children.push(p('This stops all AI activity immediately. No records are lost. Nothing is deleted. The system simply stops acting.'));
children.push(table([500, 2500, 2900, W - 500 - 2500 - 2900], [
  ['Step', 'Action', 'Location', 'Effect'],
  ['1', 'Set the AI provider spending limit to zero', '[INSERT console address]', 'Every agent stops making AI requests immediately'],
  ['2', 'Deactivate all workflows', '[INSERT console address]', 'No new work is started'],
  ['3', 'Revoke the AI provider key', '[INSERT console address and key name]', 'Nothing can make an outbound request'],
  ['4', 'Notify', 'System Owner, emergency vendor, and President and Chief Executive Officer', 'Leadership is informed before anyone notices'],
  ['5', 'Record', 'Date, time, person who stopped the system, and reason', 'Required for the audit record'],
]));
children.push(spacer(100));
children.push(runs([
  { t: 'What continues to work. ', b: true },
  { t: 'Email, telephones, calendars, Google Workspace, and every department system continue to operate normally. The emergency stop halts the agents, not the organization. Staff will not notice unless they were waiting on a report the system produces.' }
]));

children.push(h2('6.4 Emergency vendor'));
children.push(p('This engagement must be arranged before it is needed. A procurement process during an incident is a failed contingency.', { bold: true }));
children.push(kvTable([
  ['Organization', 'Aspen Technology, or alternate [INSERT]'],
  ['Contact', '[INSERT]'],
  ['Emergency telephone', '[INSERT]'],
  ['Engagement letter on file', 'Yes / No. Required before this procedure takes effect.'],
  ['Pre-authorized expenditure', '[INSERT]. A figure of $5,000 is recommended.'],
  ['Scope', 'Emergency restart, incident response, and temporary weekly checks under Scenario B.'],
], 2900));
children.push(spacer(100));
children.push(p('Under Scenario C the Chief Operating Officer may need assistance within 24 hours. A standing engagement letter with a pre-approved figure turns that into a telephone call rather than a purchase order. Engagement follows SOP-16.'));

children.push(h2('6.5 If the Backup Owner is also unavailable'));
children.push(p('Authority passes to the President and Chief Executive Officer, who holds the same authority to stop the system under Section 6.3.'));
children.push(p('The emergency stop is written so that a person who has never seen this system can perform it. That is the standard it must meet.'));

// 7. INCIDENT
children.push(h1('7. INCIDENT RESPONSE'));
children.push(p('Priorities follow SOP-17. The table below states how they apply to this system.'));
children.push(table([1500, 3100, 1700, W - 1500 - 3100 - 1700], [
  ['Priority', 'Definition', 'Response time', 'Responsible'],
  ['Priority 1', 'Suspected exposure of protected information. Protected information sent to an uncovered AI provider. An agent took an external, financial, or irreversible action without approval. Credentials compromised.', 'Stop the system immediately, then investigate', 'Backup Owner may stop. System Owner and Chief Operating Officer investigate. Vice President, Compliance notified the same day if information is involved.'],
  ['Priority 2', 'System unavailable. Backups failing. Spending limit exceeded.', 'Same business day', 'System Owner'],
  ['Priority 3', 'A workflow has stopped. An agent is producing poor quality output.', 'Two business days', 'System Owner'],
  ['Priority 4', 'Improvement request or question', 'Next monthly review', 'System Owner'],
]));
children.push(spacer(100));
children.push(runs([
  { t: 'Standing rule for Priority 1. ', b: true },
  { t: 'Stop the system first. Investigate second. The cost of an unnecessary stop is a day of inconvenience. The cost of leaving a Priority 1 running while it is investigated is a reportable breach. No person is criticized for stopping the system.' }
]));

// 8. ACCESS
children.push(h1('8. ACCESS REGISTER AND DEPARTURE'));
children.push(p('Every person holding administrative access to any system this platform connects to is listed below. The register is reviewed quarterly and on every departure, under SOP-09.'));
children.push(table([3400, 1500, 2700, W - 3400 - 1500 - 2700], [
  ['System', 'Access level', 'Held by', 'Reviewed'],
  ['Google Workspace', 'Super administrator', '[INSERT]', '[INSERT]'],
  ['Microsoft 365 and Entra', 'Global administrator', '[INSERT]', '[INSERT]'],
  ['Cloud hosting account', 'Account owner', '[INSERT]', '[INSERT]'],
  ['Managed database', 'Administrator', '[INSERT]', '[INSERT]'],
  ['Workflow service', 'Administrator', '[INSERT]', '[INSERT]'],
  ['AI provider console', 'Administrator and billing', '[INSERT]', '[INSERT]'],
  ['Credential vault', 'Administrator', '[INSERT]', '[INSERT]'],
  ['Legacy servers and remote access keys', 'Root access', '[INSERT]', '[INSERT]'],
]));

children.push(h2('8.1 Departure checklist'));
children.push(p('Completed before the last working day of any person with system access, and in every case for a departing System Owner. Countersigned by the Chief Operating Officer and the Chief Human Resources Officer.', { bold: true }));
children.push(bullet('Every entry in the access register above reviewed and reassigned'));
children.push(bullet('All AI provider keys reissued'));
children.push(bullet('Remote access keys removed from all servers'));
children.push(bullet('Credential vault access transferred, then withdrawn'));
children.push(bullet('Google Workspace and Microsoft 365 administrator roles reassigned'));
children.push(bullet('Vendor portal contacts updated, including hosting, workflow service, AI provider, and Aspen Technology'));
children.push(bullet('Microsoft 365 connector reduced to read-only permissions, removing the ability to send mail and to write files, calendar entries, and mailbox settings'));
children.push(bullet('Confirmation of whether a former Microsoft tenant exists. The current SharePoint address carries a numeral suffix, which commonly indicates an earlier tenant that may still hold documents'));
children.push(bullet('Undocumented knowledge captured. Ask directly: what do you know about our systems that is written down nowhere?'));
children.push(spacer(100));
children.push(p('The last two items are easily overlooked and expensive to recover. Both are knowledge that leaves with the person.', { italics: true }));

// 9. REVIEW
children.push(h1('9. REVIEW AND REVISION'));
children.push(table([4200, W - 4200], [
  ['Trigger', 'Action'],
  ['Any change to Section 3', 'Reissue with a new version number'],
  ['Departure of any person named in Section 8', 'Complete Section 8.1, then review'],
  ['Any Priority 1 incident', 'Review within five business days'],
  ['Routine', 'Every six months by the Chief Operating Officer'],
]));
children.push(spacer(120));
children.push(p('A review that identifies a change is not complete until the change is assigned to a named person with a date.'));

// 10. ADOPTION CHECKLIST
children.push(h1('10. ADOPTION CHECKLIST'));
children.push(p('This procedure is not in force until every item below is complete.', { bold: true }));
children.push(table([500, 4600, 2200, W - 500 - 4600 - 2200], [
  ['No.', 'Item', 'Responsible', 'Complete'],
  ['1', 'Name the System Owner, internal or Aspen Technology, and complete Section 3', 'Chief Operating Officer', ''],
  ['2', 'Engagement letter with the emergency vendor, including pre-authorized expenditure', 'Chief Operating Officer', ''],
  ['3', 'Complete the access register in Section 8', 'Chief Operating Officer with Human Resources', ''],
  ['4', 'Enter console addresses and key names in Section 6.3', 'System Owner', ''],
  ['5', 'Signed Business Associate Agreement with the AI provider', 'Chief Operating Officer', ''],
  ['6', 'Inventory the remaining systems of record listed in Section 4', 'System Owner', ''],
  ['7', 'Review by the Chief Human Resources Officer and the Vice President, Compliance', 'Chief Operating Officer to request', ''],
]));
children.push(spacer(140));
children.push(runs([
  { t: 'Note. ', b: true },
  { t: 'Item 2 should be completed first. It is a single letter and costs almost nothing. Without it, the whole of Section 6 depends on placing an unplanned telephone call during an incident.' }
]));

// APPROVAL
children.push(h1('APPROVAL'));
children.push(table([4200, 2000, 1800, W - 4200 - 2000 - 1800], [
  ['Role', 'Name', 'Signature', 'Date'],
  ['Prepared by, Chief Operating Officer', 'Antonio Salters', '', ''],
  ['System Owner', '', '', ''],
  ['Reviewed by, Chief Human Resources Officer', '', '', ''],
  ['Reviewed by, Vice President, Compliance, Quality and Special Projects', '', '', ''],
  ['Reviewed by, Chief Clinical Officer', '', '', ''],
  ['Approved by, President and Chief Executive Officer', '', '', ''],
]));

// ---------- document ----------
const doc = new Document({
  creator: 'Spectrum for Living Development, Inc.',
  title: 'Agentic System Ownership and Continuity (ITG-SOP-26)',
  description: 'Standard Operating Procedure SOP-26',
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 460, hanging: 260 } } }
        }]
      },
      {
        reference: 'numbers',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 460, hanging: 260 } } }
        }]
      }
    ]
  },
  styles: {
    default: {
      document: { run: { font: FONT, size: 22, color: '000000' } }
    }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1080, right: 1440, bottom: 1080, left: 1440, header: 600, footer: 600 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 },
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: '000000' } },
          children: [new TextRun({
            text: 'Spectrum for Living Development, Inc.   |   ITG-SOP-26 Agentic System Ownership and Continuity   |   Version 1.0',
            size: 17, font: FONT
          })]
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [
            new TextRun({ text: 'INTERNAL — CONFIDENTIAL          Page ', size: 17, font: FONT }),
            new TextRun({ children: [PageNumber.CURRENT], size: 17, font: FONT }),
            new TextRun({ text: ' of ', size: 17, font: FONT }),
            new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 17, font: FONT })
          ]
        })]
      })
    },
    children
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(process.argv[2] || 'SFL_ITG-SOP-26_Agentic_System_Ownership_and_Continuity.docx', buf);
  console.log('written');
});
