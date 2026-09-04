/**
 * 03_Intake.gs — what happens the moment a request is submitted.
 *
 * Sequence: parse → derive priority → apply floors → compute SLA → detect
 * duplicates → scan for PHI → write the log row → notify.
 *
 * The whole point of this file is that NO HUMAN TRIAGES. A request submitted at
 * 2am by a DSP is priced, routed, clocked and escalated before anyone reads it.
 * Triage-by-human is the step that fails at 2am, on holidays, and whenever the
 * person who knows the rules is on vacation.
 */

function onIntakeSubmit(e) {
  const lock = LockService.getScriptLock();
  try {
    // Serialise: two submissions landing together must not draw the same WO
    // number or miss each other in duplicate detection.
    lock.waitLock(30000);
  } catch (err) {
    Logger.log('Could not acquire lock: ' + err);
    // Proceed anyway — losing the work order is worse than a numbering collision.
  }

  try {
    const answers = readResponses_(e);
    const wo = buildWorkOrder_(answers);
    writeLogRow_(wo);
    notifyNewWorkOrder_(wo);
    audit_(wo.woNumber, 'system', 'Created', '', wo.priority + ' / ' + wo.queueLabel, 'Intake form');
  } catch (err) {
    Logger.log('onIntakeSubmit FAILED: ' + err + '\n' + (err.stack || ''));
    // A failure here must be loud. A silently dropped work order at a group
    // home is a safety problem, not an IT problem.
    safeEmail_(ESCALATION.TIER_1,
      '[ACTION REQUIRED] Work order intake failed',
      'A work order was submitted but could not be processed automatically.\n\n' +
      'Error: ' + err + '\n\n' +
      'The raw response is in the "' + SHEETS.RAW + '" tab and must be entered ' +
      'manually into the WO Log. Notify IT.\n\n' + (err.stack || ''));
  } finally {
    try { lock.releaseLock(); } catch (ignore) {}
  }
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

/** Flattens a form submit event into { questionTitle: answer }. */
function readResponses_(e) {
  const out = {};
  if (!e || !e.response) throw new Error('No form response on the event object.');
  const items = e.response.getItemResponses();
  for (let i = 0; i < items.length; i++) {
    const title = items[i].getItem().getTitle();
    let val = items[i].getResponse();
    if (Array.isArray(val)) val = val.join(', ');
    out[title] = val;
  }
  out.__email = e.response.getRespondentEmail() || '';
  out.__timestamp = e.response.getTimestamp() || new Date();
  return out;
}

/** Reads a category-tagged follow-up answer, e.g. "[HVAC] What is happening?". */
function ans_(answers, catKey, question) {
  return answers[tagged_(catKey, question)] || '';
}

// ---------------------------------------------------------------------------
// Work order construction
// ---------------------------------------------------------------------------

function buildWorkOrder_(answers) {
  const siteName = answers['Site'] || '';
  const site = SITES.filter(function (s) { return s.name === siteName; })[0] ||
               { name: siteName, town: '', county: '', type: '', landlord: '', surveySensitive: false };

  const categoryLabel = answers['What kind of problem is it?'] || '';
  const cat = CATEGORIES.filter(function (c) { return c.label === categoryLabel; })[0] ||
              CATEGORIES[CATEGORIES.length - 1];

  const priorityResult = derivePriority_(cat, answers, site);
  const submitted = answers.__timestamp;
  const pri = PRIORITIES[priorityResult.priority];

  const queueKey = resolveQueue_(cat, site, answers);
  const description = answers['Describe the problem'] || '';
  const symptom = summariseSymptom_(cat, answers);

  const requesterEmail = CFG.REQUIRE_LOGIN
    ? answers.__email
    : (answers['Your email'] || answers.__email || '');
  const requesterName = CFG.REQUIRE_LOGIN
    ? (answers.__email || '').split('@')[0].replace(/[._]/g, ' ')
    : (answers['Your name'] || '');

  const phiHit = PHI_GUARD.ENABLED &&
    scanForPhi_([description, answers['Area, room or location within the site'] || '',
                 symptom].join(' '));

  const dup = findOpenDuplicate_(site.name, cat.key);

  return {
    woNumber: nextWoNumber_(),
    status: 'New',
    priority: priorityResult.priority,
    priorityReasons: priorityResult.reasons,
    queueKey: queueKey,
    queueLabel: QUEUES[queueKey].label,
    submitted: submitted,
    respondBy: addHours_(submitted, pri.respondHrs, pri.clock),
    resolveBy: addHours_(submitted, pri.resolveHrs, pri.clock),
    slaState: 'ON TRACK',
    site: site.name,
    town: site.town,
    county: site.county,
    siteType: site.type,
    area: answers['Area, room or location within the site'] || '',
    category: cat.key,
    symptom: symptom,
    description: description,
    photo: answers['Photo (strongly recommended)'] || '',
    requester: requesterName,
    requesterEmail: requesterEmail,
    requesterPhone: answers['Best phone number to reach you'] || '',
    assetTag: answers['Asset tag or serial number (if there is one on the equipment)'] ||
              ans_(answers, 'Appliance', 'Asset tag or serial number (if visible)') || '',
    duplicateOf: dup ? dup : '',
    surveySensitive: !!site.surveySensitive,
    landlord: site.landlord || '',
    phiReview: phiHit ? 'REVIEW' : '',
    repeatFlag: answers['Has this same problem been reported before at this site?'] || '',
  };
}

/**
 * Priority is derived from factual answers, never self-declared.
 *
 * Model: start at the category's base, then bump one level for each
 * `escalateOn` answer the requester actually gave. One hit means urgent, two
 * means emergency. A survey-sensitive site raises the floor, but only for the
 * categories that genuinely carry licensing exposure.
 */
function derivePriority_(cat, answers, site) {
  let idx = PRIORITY_ORDER.indexOf(cat.basePriority);
  if (idx < 0) idx = PRIORITY_ORDER.indexOf('P3');
  const reasons = [];

  cat.followUps.forEach(function (fu) {
    if (!fu.escalateOn || !fu.escalateOn.length) return;
    const given = ans_(answers, cat.key, fu.q);
    if (given && fu.escalateOn.indexOf(given) >= 0) {
      if (idx > 0) idx -= 1;
      reasons.push(fu.q + ' → "' + given + '"');
    }
  });

  // Survey-sensitive floor, scoped to categories with real exposure.
  if (site.surveySensitive && SURVEY_SENSITIVE_CATEGORIES.indexOf(cat.key) >= 0) {
    const floorIdx = PRIORITY_ORDER.indexOf(SURVEY_SENSITIVE_FLOOR);
    if (idx > floorIdx) {
      idx = floorIdx;
      reasons.push('Licensed site — ' + cat.key + ' held at ' + SURVEY_SENSITIVE_FLOOR + ' floor');
    }
  }

  return { priority: PRIORITY_ORDER[idx], reasons: reasons };
}

/**
 * Routing. A leased site does not get Spectrum labour spent on the landlord's
 * building envelope — that is money the organisation is not obliged to spend
 * and, at three leased sites, it adds up.
 */
function resolveQueue_(cat, site, answers) {
  if (site.landlord && LANDLORD_CATEGORIES.indexOf(cat.key) >= 0) return 'LANDLORD';

  // "Other" lets the requester nominate a team.
  if (cat.key === 'Other') {
    const pick = ans_(answers, 'Other', 'Which team should see this?');
    if (pick === 'Fleet') return 'FLEET';
    if (pick === 'IT') return 'IT';
    return 'FACILITIES';
  }
  return cat.queue;
}

/** One-line symptom for the log, drawn from the category's first list answer. */
function summariseSymptom_(cat, answers) {
  for (let i = 0; i < cat.followUps.length; i++) {
    const fu = cat.followUps[i];
    if (fu.type !== 'LIST') continue;
    const v = ans_(answers, cat.key, fu.q);
    if (v) return v;
  }
  return '';
}

// ---------------------------------------------------------------------------
// SLA clock
// ---------------------------------------------------------------------------

/**
 * WALL adds elapsed hours — group homes do not close, and a P1 at 2am on
 * Saturday is a P1. BIZ walks forward through the business calendar so a
 * routine request submitted Friday afternoon is not "late" on Monday morning.
 */
function addHours_(start, hours, clock) {
  const d = new Date(start.getTime());
  if (clock === 'WALL') {
    d.setTime(d.getTime() + hours * 3600 * 1000);
    return d;
  }

  let remaining = hours;
  let guard = 0;
  while (remaining > 0) {
    if (guard++ > 10000) break; // never spin forever on a bad calendar
    if (BUSINESS_HOURS.workDays.indexOf(d.getDay()) < 0) {
      d.setDate(d.getDate() + 1);
      d.setHours(BUSINESS_HOURS.startHour, 0, 0, 0);
      continue;
    }
    const hr = d.getHours() + d.getMinutes() / 60;
    if (hr < BUSINESS_HOURS.startHour) {
      d.setHours(BUSINESS_HOURS.startHour, 0, 0, 0);
      continue;
    }
    if (hr >= BUSINESS_HOURS.endHour) {
      d.setDate(d.getDate() + 1);
      d.setHours(BUSINESS_HOURS.startHour, 0, 0, 0);
      continue;
    }
    const leftToday = BUSINESS_HOURS.endHour - hr;
    if (remaining <= leftToday) {
      d.setTime(d.getTime() + remaining * 3600 * 1000);
      remaining = 0;
    } else {
      remaining -= leftToday;
      d.setDate(d.getDate() + 1);
      d.setHours(BUSINESS_HOURS.startHour, 0, 0, 0);
    }
  }
  return d;
}

// ---------------------------------------------------------------------------
// Duplicate detection
// ---------------------------------------------------------------------------

/**
 * Three staff on three shifts report the same broken dryer. Without this the
 * queue inflates, the same tech is dispatched twice, and the site concludes
 * the system does not work. Flags rather than blocks — a person decides.
 */
function findOpenDuplicate_(siteName, categoryKey) {
  const sh = getSpreadsheet_().getSheetByName(SHEETS.LOG);
  if (!sh) return '';
  const last = sh.getLastRow();
  if (last < 2) return '';

  const cutoff = new Date(Date.now() - DUPLICATE_WINDOW_DAYS * 86400 * 1000);
  const vals = sh.getRange(2, 1, last - 1, LOG_COLUMNS.length).getValues();
  const iWo = colIndex_('WO #') - 1;
  const iStatus = colIndex_('Status') - 1;
  const iSite = colIndex_('Site') - 1;
  const iCat = colIndex_('Category') - 1;
  const iSub = colIndex_('Submitted') - 1;

  for (let r = vals.length - 1; r >= 0; r--) {
    const row = vals[r];
    if (!row[iWo]) continue;
    if (TERMINAL_STATUSES.indexOf(row[iStatus]) >= 0) continue;
    if (row[iSite] !== siteName || row[iCat] !== categoryKey) continue;
    const sub = row[iSub] instanceof Date ? row[iSub] : new Date(row[iSub]);
    if (isNaN(sub.getTime()) || sub < cutoff) continue;
    return row[iWo];
  }
  return '';
}

// ---------------------------------------------------------------------------
// Privacy guard
// ---------------------------------------------------------------------------

/**
 * Returns true if free text looks like it may contain protected health
 * information. Deliberately conservative — a false positive costs one person
 * thirty seconds; a false negative puts PHI in a spreadsheet shared with
 * vendors. Not a substitute for the form's instruction or for a signed BAA.
 */
function scanForPhi_(text) {
  if (!text) return false;
  const lower = String(text).toLowerCase();
  for (let i = 0; i < PHI_GUARD.TERMS.length; i++) {
    if (lower.indexOf(PHI_GUARD.TERMS[i]) >= 0) return true;
  }
  for (let j = 0; j < PHI_GUARD.PATTERNS.length; j++) {
    if (PHI_GUARD.PATTERNS[j].test(text)) return true;
  }
  return false;
}

// ---------------------------------------------------------------------------
// Numbering and writing
// ---------------------------------------------------------------------------

function nextWoNumber_() {
  const props = PropertiesService.getScriptProperties();
  const year = new Date().getFullYear();
  const key = 'WO_SEQ_' + year;
  const n = parseInt(props.getProperty(key) || '0', 10) + 1;
  props.setProperty(key, String(n));
  return 'WO-' + year + '-' + ('0000' + n).slice(-4);
}

function writeLogRow_(wo) {
  const sh = getSpreadsheet_().getSheetByName(SHEETS.LOG);
  if (!sh) throw new Error('WO Log sheet is missing. Run buildSheets().');

  const map = {
    'WO #': wo.woNumber, 'Status': wo.status, 'Priority': wo.priority, 'Queue': wo.queueLabel,
    'Submitted': wo.submitted, 'SLA Respond By': wo.respondBy, 'SLA Resolve By': wo.resolveBy,
    'SLA State': wo.slaState, 'Site': wo.site, 'Town': wo.town, 'County': wo.county,
    'Site Type': wo.siteType, 'Area / Room': wo.area, 'Category': wo.category,
    'Symptom': wo.symptom, 'Description': wo.description, 'Photo': wo.photo,
    'Requester': wo.requester, 'Requester Email': wo.requesterEmail,
    'Requester Phone': wo.requesterPhone, 'Asset Tag': wo.assetTag,
    'Duplicate Of': wo.duplicateOf, 'Survey Sensitive': wo.surveySensitive,
    'Landlord': wo.landlord, 'PHI Review': wo.phiReview, 'Last Updated': new Date(),
  };

  const row = LOG_COLUMNS.map(function (c) {
    if (Object.prototype.hasOwnProperty.call(map, c)) return map[c];
    // Checkbox columns must be written as booleans or the checkbox renders blank.
    return isCheckboxColumn_(c) ? false : '';
  });

  const target = sh.getLastRow() + 1;
  sh.getRange(target, 1, 1, LOG_COLUMNS.length).setValues([row]);

  // Total Cost is an ARRAYFORMULA anchored at row 2; clear any literal so it
  // does not shadow the formula.
  sh.getRange(target, colIndex_('Total Cost')).clearContent();
}

function isCheckboxColumn_(name) {
  return CHECKBOX_STEPS.some(function (s) { return s.col === name; });
}

function audit_(woNumber, actor, field, oldVal, newVal, source) {
  try {
    const sh = getSpreadsheet_().getSheetByName(SHEETS.AUDIT);
    if (!sh) return;
    sh.appendRow([new Date(), woNumber, actor, field, oldVal, newVal, source]);
  } catch (err) {
    Logger.log('audit_ failed (non-fatal): ' + err);
  }
}
