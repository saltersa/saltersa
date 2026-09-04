/**
 * 04_Tracker.gs — the checkbox engine.
 *
 * A technician ticks a box. Everything else follows: the timestamp, the status,
 * the SLA measurement, the audit entry, and the note to the person who reported
 * it. Nobody types a status, nobody maintains a date column, and nobody has to
 * remember to tell the requester anything.
 *
 * That last part matters more than it looks. "Did anyone see my request?" phone
 * calls are a standing tax on the Facilities Director's day, and they are
 * entirely caused by the requester having no visibility. Closing that loop
 * automatically removes the calls without adding a task to anyone.
 *
 * Must be an INSTALLABLE trigger, not a simple onEdit — simple triggers cannot
 * send mail.
 */

function onLogEdit(e) {
  if (!e || !e.range) return;
  const sh = e.range.getSheet();
  if (sh.getName() !== SHEETS.LOG) return;
  if (e.range.getRow() < 2) return;

  try {
    const editedCols = [];
    for (let c = e.range.getColumn(); c < e.range.getColumn() + e.range.getNumColumns(); c++) {
      editedCols.push(c);
    }
    for (let r = e.range.getRow(); r < e.range.getRow() + e.range.getNumRows(); r++) {
      editedCols.forEach(function (c) { handleCellEdit_(sh, r, c); });
    }
  } catch (err) {
    Logger.log('onLogEdit failed: ' + err + '\n' + (err.stack || ''));
  }
}

function handleCellEdit_(sh, row, col) {
  const header = LOG_COLUMNS[col - 1];
  if (!header) return;

  const step = CHECKBOX_STEPS.filter(function (s) { return s.col === header; })[0];
  if (!step) return; // not a checkbox column — nothing to do

  const woNumber = sh.getRange(row, colIndex_('WO #')).getValue();
  if (!woNumber) return; // empty row

  const checked = sh.getRange(row, col).getValue() === true;
  const actor = actorEmail_();

  // Stamp the specific milestones that later reporting depends on.
  if (header === 'Acknowledged') {
    sh.getRange(row, colIndex_('Ack At')).setValue(checked ? new Date() : '');
  }
  if (header === 'Closed') {
    sh.getRange(row, colIndex_('Closed At')).setValue(checked ? new Date() : '');
  }

  // Resolution is measured when work is actually complete, not when the ticket
  // is administratively closed. Closing a ticket three days after the repair
  // should not count as a three-day repair.
  if (header === 'Work Complete') {
    if (checked) {
      const resolveBy = sh.getRange(row, colIndex_('SLA Resolve By')).getValue();
      const met = resolveBy instanceof Date ? (new Date() <= resolveBy) : true;
      sh.getRange(row, colIndex_('SLA State')).setValue(met ? 'MET' : 'MISSED');
    } else {
      sh.getRange(row, colIndex_('SLA State')).setValue('ON TRACK');
    }
  }

  const newStatus = deriveStatus_(sh, row);
  const oldStatus = sh.getRange(row, colIndex_('Status')).getValue();
  if (newStatus !== oldStatus) {
    sh.getRange(row, colIndex_('Status')).setValue(newStatus);
  }
  sh.getRange(row, colIndex_('Last Updated')).setValue(new Date());

  audit_(woNumber, actor, header, checked ? 'unchecked' : 'checked',
         checked ? 'checked' : 'unchecked', 'WO Log');

  if (checked && step.notifyRequester) {
    notifyStatusChange_(sh, row, step.status);
  }
  if (!checked) {
    // Recompute the live clock — un-ticking a box puts the work order back
    // into the queue and the SLA state must reflect that immediately.
    recomputeSlaForRow_(sh, row);
  }
}

/**
 * Status is the furthest checkbox ticked. Deriving it rather than storing it
 * means the two can never disagree, which is the usual failure mode of a
 * hand-maintained status column.
 */
function deriveStatus_(sh, row) {
  let status = 'New';
  for (let i = 0; i < CHECKBOX_STEPS.length; i++) {
    const step = CHECKBOX_STEPS[i];
    if (sh.getRange(row, colIndex_(step.col)).getValue() === true) {
      status = step.status;
    }
  }
  // A duplicate or landlord referral overrides the checkbox-derived status —
  // those are dispositions, not progress.
  const dup = sh.getRange(row, colIndex_('Duplicate Of')).getValue();
  const closed = sh.getRange(row, colIndex_('Closed')).getValue() === true;
  if (dup && !closed) return 'Duplicate';
  return status;
}

function actorEmail_() {
  try {
    return Session.getActiveUser().getEmail() || 'unknown';
  } catch (err) {
    return 'unknown';
  }
}

// ---------------------------------------------------------------------------
// SLA recomputation
// ---------------------------------------------------------------------------

/**
 * Sweeps every open work order and refreshes its SLA state. Runs on a schedule
 * (see 06_Digest.gs) because an SLA can breach while nobody touches the sheet —
 * time passing is itself an event, and a system that only updates when someone
 * clicks is blind to exactly the work orders that are going wrong.
 */
function recomputeSlaStates() {
  const sh = getSpreadsheet_().getSheetByName(SHEETS.LOG);
  if (!sh) return 0;
  const last = sh.getLastRow();
  if (last < 2) return 0;

  const n = last - 1;
  const statuses = sh.getRange(2, colIndex_('Status'), n, 1).getValues();
  const resolveBys = sh.getRange(2, colIndex_('SLA Resolve By'), n, 1).getValues();
  const states = sh.getRange(2, colIndex_('SLA State'), n, 1).getValues();
  const submits = sh.getRange(2, colIndex_('Submitted'), n, 1).getValues();

  const now = new Date();
  let changed = 0;

  for (let i = 0; i < n; i++) {
    const status = statuses[i][0];
    const current = states[i][0];
    // MET and MISSED are frozen measurements — never recompute a finished one.
    if (current === 'MET' || current === 'MISSED') continue;
    if (TERMINAL_STATUSES.indexOf(status) >= 0) continue;

    const resolveBy = resolveBys[i][0];
    const submitted = submits[i][0];
    if (!(resolveBy instanceof Date) || !(submitted instanceof Date)) continue;

    let next;
    if (now > resolveBy) {
      next = 'BREACHED';
    } else {
      const total = resolveBy.getTime() - submitted.getTime();
      const spent = now.getTime() - submitted.getTime();
      next = (total > 0 && spent / total >= 0.75) ? 'AT RISK' : 'ON TRACK';
    }
    if (next !== current) {
      states[i][0] = next;
      changed++;
    }
  }

  if (changed) sh.getRange(2, colIndex_('SLA State'), n, 1).setValues(states);
  return changed;
}

function recomputeSlaForRow_(sh, row) {
  const status = sh.getRange(row, colIndex_('Status')).getValue();
  if (TERMINAL_STATUSES.indexOf(status) >= 0) return;
  const resolveBy = sh.getRange(row, colIndex_('SLA Resolve By')).getValue();
  const submitted = sh.getRange(row, colIndex_('Submitted')).getValue();
  if (!(resolveBy instanceof Date) || !(submitted instanceof Date)) return;

  const now = new Date();
  let next;
  if (now > resolveBy) {
    next = 'BREACHED';
  } else {
    const total = resolveBy.getTime() - submitted.getTime();
    const spent = now.getTime() - submitted.getTime();
    next = (total > 0 && spent / total >= 0.75) ? 'AT RISK' : 'ON TRACK';
  }
  sh.getRange(row, colIndex_('SLA State')).setValue(next);
}

// ---------------------------------------------------------------------------
// Row lookup
// ---------------------------------------------------------------------------

function findRowByWo_(woNumber) {
  const sh = getSpreadsheet_().getSheetByName(SHEETS.LOG);
  if (!sh) return null;
  const last = sh.getLastRow();
  if (last < 2) return null;
  const vals = sh.getRange(2, colIndex_('WO #'), last - 1, 1).getValues();
  const target = String(woNumber).trim().toUpperCase();
  for (let i = 0; i < vals.length; i++) {
    if (String(vals[i][0]).trim().toUpperCase() === target) return i + 2;
  }
  return null;
}
