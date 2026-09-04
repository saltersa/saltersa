/**
 * 05_CloseOut.gs — technician field updates.
 *
 * This is the half of the system that makes cost measurable. Without it the log
 * records that something was fixed but never what it cost, which means no
 * cost-per-work-order, no cost-by-site, no vendor performance, and no evidence
 * base for replace-versus-repair. A maintenance system that cannot answer
 * "what did this building cost us last year" is a to-do list, not an asset.
 */

function onCloseOutSubmit(e) {
  const lock = LockService.getScriptLock();
  try { lock.waitLock(30000); } catch (err) { Logger.log('CloseOut lock: ' + err); }

  try {
    const a = readResponses_(e);
    const woNumber = String(a['WO number'] || '').trim().toUpperCase();
    const row = findRowByWo_(woNumber);

    if (!row) {
      safeEmail_(a.__email || QUEUES.FACILITIES.email,
        'Work order not found: ' + woNumber,
        'The close-out you submitted references ' + woNumber + ', which is not in the ' +
        'WO Log.\n\nCheck the number on your dispatch email and submit again. ' +
        'Nothing has been recorded.');
      return;
    }

    const sh = getSpreadsheet_().getSheetByName(SHEETS.LOG);
    const updateType = a['Update type'] || '';
    const actor = a.__email || actorEmail_();

    // --- Costs accumulate across visits; a second trip adds to the first ----
    addNumeric_(sh, row, 'Labor Hours', a['Labor hours on this visit']);
    addNumeric_(sh, row, 'Parts Cost', a['Parts cost ($)']);
    addNumeric_(sh, row, 'Vendor Cost', a['Vendor invoice amount ($)']);

    setIfPresent_(sh, row, 'Vendor', a['Vendor used (leave blank if in house)']);
    setIfPresent_(sh, row, 'Resolution Code', a['Resolution code']);
    setIfPresent_(sh, row, 'Asset Tag',
      a['Asset tag or serial number of the equipment worked on']);
    appendNote_(sh, row, a['What was done'], actor);

    // --- Disposition -------------------------------------------------------
    if (updateType === 'Work complete — closing it out') {
      // Ticking the boxes drives everything else through the same path a
      // manual tick would take — one code path, no divergence.
      setCheckbox_(sh, row, 'Acknowledged', true);
      setCheckbox_(sh, row, 'On Site', true);
      setCheckbox_(sh, row, 'Work Complete', true);

      const resolveBy = sh.getRange(row, colIndex_('SLA Resolve By')).getValue();
      const met = resolveBy instanceof Date ? (new Date() <= resolveBy) : true;
      sh.getRange(row, colIndex_('SLA State')).setValue(met ? 'MET' : 'MISSED');
      sh.getRange(row, colIndex_('Status')).setValue('Work Complete');
      notifyStatusChange_(sh, row, 'Work Complete');

    } else if (updateType === 'Duplicate of another WO') {
      sh.getRange(row, colIndex_('Status')).setValue('Duplicate');
      sh.getRange(row, colIndex_('Resolution Code')).setValue('Duplicate');

    } else if (updateType === 'Cannot complete — need a decision') {
      sh.getRange(row, colIndex_('Status')).setValue('Blocked — Decision Needed');
      escalateBlocked_(sh, row, a['What was done'], actor);

    } else {
      setCheckbox_(sh, row, 'Acknowledged', true);
      sh.getRange(row, colIndex_('Status')).setValue(deriveStatus_(sh, row));
    }

    sh.getRange(row, colIndex_('Last Updated')).setValue(new Date());
    audit_(woNumber, actor, 'Close-out', '', updateType, 'Close-out form');
    upsertAsset_(sh, row, a['Does this asset need to be flagged for capital replacement?']);

  } catch (err) {
    Logger.log('onCloseOutSubmit FAILED: ' + err + '\n' + (err.stack || ''));
    safeEmail_(ESCALATION.TIER_1, '[ACTION REQUIRED] Work order close-out failed',
      'A technician close-out could not be processed.\n\nError: ' + err +
      '\n\nThe raw response is in "' + SHEETS.CLOSEOUT + '" and must be applied by hand.');
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

// ---------------------------------------------------------------------------
// Field helpers
// ---------------------------------------------------------------------------

function addNumeric_(sh, row, colName, raw) {
  const add = parseFloat(String(raw === undefined || raw === null ? '' : raw)
    .replace(/[$,\s]/g, ''));
  if (isNaN(add) || add === 0) return;
  const cell = sh.getRange(row, colIndex_(colName));
  const current = parseFloat(cell.getValue());
  cell.setValue((isNaN(current) ? 0 : current) + add);
}

function setIfPresent_(sh, row, colName, val) {
  if (val === undefined || val === null || String(val).trim() === '') return;
  sh.getRange(row, colIndex_(colName)).setValue(val);
}

function setCheckbox_(sh, row, colName, value) {
  sh.getRange(row, colIndex_(colName)).setValue(!!value);
}

/**
 * Notes append rather than overwrite. Two technicians on two visits both have
 * something worth keeping, and the second should never erase the first.
 */
function appendNote_(sh, row, note, actor) {
  if (!note || !String(note).trim()) return;
  const cell = sh.getRange(row, colIndex_('Resolution Notes'));
  const existing = String(cell.getValue() || '');
  const stamp = Utilities.formatDate(new Date(), CFG.TIMEZONE, 'yyyy-MM-dd HH:mm');
  const entry = '[' + stamp + ' · ' + actor + '] ' + String(note).trim();
  cell.setValue(existing ? existing + '\n' + entry : entry);

  if (PHI_GUARD.ENABLED && scanForPhi_(note)) {
    sh.getRange(row, colIndex_('PHI Review')).setValue('REVIEW');
  }
}

function escalateBlocked_(sh, row, note, actor) {
  const wo = sh.getRange(row, colIndex_('WO #')).getValue();
  const site = sh.getRange(row, colIndex_('Site')).getValue();
  const pri = sh.getRange(row, colIndex_('Priority')).getValue();
  const queueLabel = sh.getRange(row, colIndex_('Queue')).getValue();

  safeEmail_(queueEmailFor_(queueLabel),
    '[DECISION NEEDED] ' + wo + ' — ' + site,
    wo + ' is blocked and needs a decision.\n\n' +
    'Site: ' + site + '\nPriority: ' + pri + '\nTechnician: ' + actor + '\n\n' +
    'What the technician reported:\n' + (note || '(no detail given)') + '\n\n' +
    'The SLA clock is still running on this work order.');
}

// ---------------------------------------------------------------------------
// Asset registry
// ---------------------------------------------------------------------------

/**
 * Every close-out carrying an asset tag adds a repair event. Nobody maintains
 * this register by hand — it accrues from work the team was doing anyway, and
 * after roughly a year it is the evidence base for the capital plan.
 *
 * This is the compounding piece: the same intake stream that dispatches a
 * technician today is, at no extra cost, building asset lifecycle data,
 * cost-by-site history, and vendor performance for next year's budget.
 */
function upsertAsset_(sh, row, replacementFlag) {
  const tag = String(sh.getRange(row, colIndex_('Asset Tag')).getValue() || '').trim();
  if (!tag) return;

  const ss = getSpreadsheet_();
  const asr = ss.getSheetByName(SHEETS.ASSETS);
  if (!asr) return;

  const site = sh.getRange(row, colIndex_('Site')).getValue();
  const category = sh.getRange(row, colIndex_('Category')).getValue();
  const symptom = sh.getRange(row, colIndex_('Symptom')).getValue();
  const cost = parseFloat(sh.getRange(row, colIndex_('Total Cost')).getValue()) || 0;
  const flagged = replacementFlag && replacementFlag !== 'No';

  const last = asr.getLastRow();
  let found = 0;
  if (last >= 2) {
    const tags = asr.getRange(2, 1, last - 1, 1).getValues();
    for (let i = 0; i < tags.length; i++) {
      if (String(tags[i][0]).trim().toUpperCase() === tag.toUpperCase()) { found = i + 2; break; }
    }
  }

  if (found) {
    const count = (parseFloat(asr.getRange(found, 7).getValue()) || 0) + 1;
    const lifetime = (parseFloat(asr.getRange(found, 8).getValue()) || 0) + cost;
    asr.getRange(found, 6).setValue(new Date());
    asr.getRange(found, 7).setValue(count);
    asr.getRange(found, 8).setValue(lifetime);
    if (flagged) {
      asr.getRange(found, 9).setValue(true);
      asr.getRange(found, 10).setValue(replacementFlag);
    }
  } else {
    asr.appendRow([tag, site, category, symptom, new Date(), new Date(), 1, cost,
                   !!flagged, flagged ? replacementFlag : '']);
  }
}

function queueEmailFor_(queueLabel) {
  const keys = Object.keys(QUEUES);
  for (let i = 0; i < keys.length; i++) {
    if (QUEUES[keys[i]].label === queueLabel) return QUEUES[keys[i]].email;
  }
  return QUEUES.FACILITIES.email;
}
