/**
 * 08_Menu.gs — installation, triggers, and the operator menu.
 *
 * buildAll() is the one function to run on a clean spreadsheet. Everything
 * after that is idempotent: re-running installTriggers() will not create a
 * second copy of a trigger, and rebuilding the sheets will not destroy data.
 */

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('⚙ Work Orders')
    .addItem('Refresh dashboard', 'refreshDashboard')
    .addItem('Recompute SLA states', 'recomputeSlaStates')
    .addSeparator()
    .addItem('Send daily digest now', 'dailyDigest')
    .addItem('Send weekly scorecard now', 'weeklyScorecard')
    .addSeparator()
    .addItem('Generate site QR links', 'generateSitePrefillLinks')
    .addItem('Show form links', 'showFormLinks')
    .addSeparator()
    .addSubMenu(SpreadsheetApp.getUi().createMenu('Setup (one time)')
      .addItem('1. Build everything', 'buildAll')
      .addItem('2. Rebuild forms only', 'rebuildForms')
      .addItem('3. Rebuild sheets only', 'buildSheets')
      .addItem('4. Reinstall triggers', 'installTriggers')
      .addSeparator()
      .addItem('Run self-test', 'selfTest'))
    .addToUi();
}

// ---------------------------------------------------------------------------
// Installation
// ---------------------------------------------------------------------------

/** Run this once on a new spreadsheet. */
function buildAll() {
  buildSheets();
  const info = rebuildForms();
  generateSitePrefillLinks();
  installTriggers();
  refreshDashboard();

  const msg = 'Setup complete.\n\n' + info + '\n\n' +
    'NEXT STEPS\n' +
    '1. Open 00_Config.gs and replace every @spectrumforliving.org address with a real\n' +
    '   distribution list. Personal addresses break when someone takes vacation.\n' +
    '2. Leave CFG.DEBUG_MODE = true and run a pilot at two or three sites.\n' +
    '3. Print the QR links from the Config tab and post them at each site.\n' +
    '4. Confirm with IT that the Google Workspace BAA covers Forms, Sheets and Drive\n' +
    '   before this touches a licensed site.\n' +
    '5. Flip CFG.DEBUG_MODE = false at go-live.';
  Logger.log(msg);
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) { /* not run from the UI */ }
  return msg;
}

/**
 * Installs every trigger the system needs, removing any duplicates first.
 * Apps Script will happily create ten copies of the same trigger, which is how
 * people end up with ten copies of every email.
 */
function installTriggers() {
  const wanted = ['onLogEdit', 'hourlySlaSweep', 'dailyDigest', 'weeklyScorecard',
                  'onIntakeSubmit', 'onCloseOutSubmit'];
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (wanted.indexOf(t.getHandlerFunction()) >= 0) ScriptApp.deleteTrigger(t);
  });

  const ss = getSpreadsheet_();

  ScriptApp.newTrigger('onLogEdit').forSpreadsheet(ss).onEdit().create();
  ScriptApp.newTrigger('hourlySlaSweep').timeBased().everyHours(1).create();
  ScriptApp.newTrigger('dailyDigest').timeBased().atHour(7).everyDays(1)
    .inTimezone(CFG.TIMEZONE).create();
  ScriptApp.newTrigger('weeklyScorecard').timeBased().onWeekDay(ScriptApp.WeekDay.MONDAY)
    .atHour(7).inTimezone(CFG.TIMEZONE).create();

  installFormTriggers_();
  return 'Triggers installed.';
}

function installFormTriggers_() {
  const props = PropertiesService.getScriptProperties();
  const intakeId = props.getProperty('INTAKE_FORM_ID');
  const closeoutId = props.getProperty('CLOSEOUT_FORM_ID');

  ScriptApp.getProjectTriggers().forEach(function (t) {
    const h = t.getHandlerFunction();
    if (h === 'onIntakeSubmit' || h === 'onCloseOutSubmit') ScriptApp.deleteTrigger(t);
  });

  if (intakeId) {
    ScriptApp.newTrigger('onIntakeSubmit')
      .forForm(FormApp.openById(intakeId)).onFormSubmit().create();
  }
  if (closeoutId) {
    ScriptApp.newTrigger('onCloseOutSubmit')
      .forForm(FormApp.openById(closeoutId)).onFormSubmit().create();
  }
}

// ---------------------------------------------------------------------------
// Operator utilities
// ---------------------------------------------------------------------------

function refreshDashboard() {
  buildDashboard_(getSpreadsheet_());
  SpreadsheetApp.flush();
  return 'Dashboard refreshed.';
}

function showFormLinks() {
  const props = PropertiesService.getScriptProperties();
  const intakeId = props.getProperty('INTAKE_FORM_ID');
  const closeoutId = props.getProperty('CLOSEOUT_FORM_ID');
  if (!intakeId) {
    const m = 'No forms yet. Run Setup → Build everything.';
    try { SpreadsheetApp.getUi().alert(m); } catch (e) {}
    return m;
  }
  const msg =
    'STAFF REQUEST FORM — share this one widely:\n' +
    FormApp.openById(intakeId).getPublishedUrl() + '\n\n' +
    'TECH CLOSE-OUT FORM — maintenance staff only:\n' +
    (closeoutId ? FormApp.openById(closeoutId).getPublishedUrl() : 'not built');
  try { SpreadsheetApp.getUi().alert(msg); } catch (e) {}
  Logger.log(msg);
  return msg;
}

// ---------------------------------------------------------------------------
// Self-test
// ---------------------------------------------------------------------------

/**
 * Verifies the logic that is easiest to get wrong and hardest to notice: the
 * priority derivation and the SLA clock. Run it after any change to CATEGORIES
 * or PRIORITIES. It writes nothing and sends nothing.
 */
function selfTest() {
  const results = [];
  const check = function (name, actual, expected) {
    const ok = String(actual) === String(expected);
    results.push((ok ? 'PASS  ' : 'FAIL  ') + name +
                 (ok ? '' : '  (got ' + actual + ', expected ' + expected + ')'));
    return ok;
  };

  const cat = function (key) {
    return CATEGORIES.filter(function (c) { return c.key === key; })[0];
  };
  const plainSite = { name: 'RVCO (Main Office)', surveySensitive: false, landlord: '' };
  const licensedSite = { name: 'Closter ICF', surveySensitive: true, landlord: '' };

  // --- Priority derivation ------------------------------------------------
  let a = {};
  a[tagged_('HVAC', 'What is happening?')] = 'No heat';
  a[tagged_('HVAC', 'How much of the building is affected?')] = 'One room';
  check('HVAC no heat, one room → P2', derivePriority_(cat('HVAC'), a, plainSite).priority, 'P2');

  a[tagged_('HVAC', 'How much of the building is affected?')] = 'Whole building';
  check('HVAC no heat, whole building → P1',
        derivePriority_(cat('HVAC'), a, plainSite).priority, 'P1');

  let b = {};
  b[tagged_('Pest', 'What was seen?')] = 'Rodent';
  b[tagged_('Pest', 'Where?')] = 'Exterior';
  check('Single rodent sighting outside → P2, not an emergency',
        derivePriority_(cat('Pest'), b, plainSite).priority, 'P2');

  let c = {};
  c[tagged_('Furniture', 'Is this a repair or a replacement request?')] = 'Repair';
  check('Broken furniture at a licensed site stays P4 (not survey-scoped)',
        derivePriority_(cat('Furniture'), c, licensedSite).priority, 'P4');

  let d = {};
  d[tagged_('Structural', 'What is affected?')] = 'Wall damage';
  d[tagged_('Structural', 'Is the area a trip, fall or collapse hazard right now?')] = 'No';
  check('Wall damage at a licensed site floors to P2',
        derivePriority_(cat('Structural'), d, licensedSite).priority, 'P2');
  check('Same wall damage at the office stays P3',
        derivePriority_(cat('Structural'), d, plainSite).priority, 'P3');

  check('Fire/Life Safety is always P1',
        derivePriority_(cat('Fire/Life Safety'), {}, plainSite).priority, 'P1');

  // --- SLA clock ----------------------------------------------------------
  // Saturday 02:00. A P1 wall clock must not wait for Monday.
  const sat2am = new Date(2026, 8, 5, 2, 0, 0);
  check('P1 wall clock adds 4 elapsed hours on a Saturday',
        addHours_(sat2am, 4, 'WALL').getHours(), 6);

  // Friday 15:00 + 5 business hours (8h day, 08:00–16:00) → Monday 12:00.
  const fri3pm = new Date(2026, 8, 4, 15, 0, 0);
  const biz = addHours_(fri3pm, 5, 'BIZ');
  check('P3 business clock skips the weekend (day)', biz.getDay(), 1);
  check('P3 business clock skips the weekend (hour)', biz.getHours(), 12);

  // --- Routing ------------------------------------------------------------
  const leased = { name: 'Teaneck ATC', surveySensitive: false, landlord: 'Grace Lutheran Church' };
  check('Roof work at a leased site routes to the landlord',
        resolveQueue_(cat('Structural'), leased, {}), 'LANDLORD');
  check('A broken appliance at a leased site stays with Facilities',
        resolveQueue_(cat('Appliance'), leased, {}), 'FACILITIES');
  check('Vehicle requests route to Fleet',
        resolveQueue_(cat('Fleet'), plainSite, {}), 'FLEET');

  // --- Privacy guard ------------------------------------------------------
  check('PHI guard catches a resident reference',
        scanForPhi_('The resident in room 3 broke the sink'), true);
  check('PHI guard catches a date of birth', scanForPhi_('DOB 03/14/1982'), true);
  check('PHI guard passes a clean description',
        scanForPhi_('Downstairs bathroom sink is leaking at the trap'), false);

  // --- Config integrity ---------------------------------------------------
  check('Every category has a valid queue',
        CATEGORIES.every(function (x) { return !!QUEUES[x.queue]; }), true);
  check('Every category has a valid base priority',
        CATEGORIES.every(function (x) { return PRIORITY_ORDER.indexOf(x.basePriority) >= 0; }), true);
  check('Every checkbox step has a log column',
        CHECKBOX_STEPS.every(function (s) { return LOG_COLUMNS.indexOf(s.col) >= 0; }), true);
  check('Site names are unique',
        new Set(SITES.map(function (s) { return s.name; })).size, SITES.length);

  const failed = results.filter(function (r) { return r.indexOf('FAIL') === 0; }).length;
  const out = results.join('\n') + '\n\n' +
    (failed ? failed + ' FAILED of ' + results.length : 'All ' + results.length + ' checks passed');
  Logger.log(out);
  try { SpreadsheetApp.getUi().alert(out); } catch (e) {}
  return out;
}
