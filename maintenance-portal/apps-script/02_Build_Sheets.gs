/**
 * 02_Build_Sheets.gs — the operating table.
 *
 * Structure:
 *   Form Responses (do not edit)  raw intake, append-only, never touched
 *   WO Log                        the working table. Checkboxes live here.
 *   Close-Out Responses           raw tech updates, append-only
 *   Asset Registry                built from work order history
 *   Dashboard                     the weekly management view
 *   Config                        site list, prefill links, dropdown sources
 *   Audit Trail                   who changed what, when
 *
 * The raw response sheets are never edited by a human. Everything operational
 * happens in WO Log. That separation is what lets the form be rebuilt, the log
 * be re-sorted, and the history stay intact — one source of truth per domain.
 */

// ---------------------------------------------------------------------------
// Column helpers
// ---------------------------------------------------------------------------

function colIndex_(name) {
  const i = LOG_COLUMNS.indexOf(name);
  if (i < 0) throw new Error('Unknown WO Log column: ' + name);
  return i + 1; // 1-based
}

function colLetter_(name) {
  let n = colIndex_(name);
  let s = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    s = String.fromCharCode(65 + rem) + s;
    n = Math.floor((n - 1) / 26);
  }
  return s;
}

// ---------------------------------------------------------------------------
// Build
// ---------------------------------------------------------------------------

function buildSheets() {
  const ss = getSpreadsheet_();
  buildWoLog_(ss);
  buildAssetRegistry_(ss);
  buildAuditTrail_(ss);
  buildConfigSheet_(ss);
  buildDashboard_(ss);
  return 'Sheets built.';
}

function buildWoLog_(ss) {
  let sh = ss.getSheetByName(SHEETS.LOG);
  if (!sh) sh = ss.insertSheet(SHEETS.LOG);

  // --- Header -------------------------------------------------------------
  sh.getRange(1, 1, 1, LOG_COLUMNS.length)
    .setValues([LOG_COLUMNS])
    .setFontWeight('bold')
    .setFontColor('#FFFFFF')
    .setBackground('#0B5394')
    .setVerticalAlignment('middle')
    .setWrap(true);
  sh.setFrozenRows(1);
  sh.setFrozenColumns(2);
  sh.setRowHeight(1, 44);

  const maxRows = Math.max(sh.getMaxRows(), 2000);
  if (sh.getMaxRows() < maxRows) sh.insertRowsAfter(sh.getMaxRows(), maxRows - sh.getMaxRows());
  const lastCol = LOG_COLUMNS.length;
  if (sh.getMaxColumns() > lastCol) {
    sh.deleteColumns(lastCol + 1, sh.getMaxColumns() - lastCol);
  }
  const body = sh.getRange(2, 1, maxRows - 1, lastCol);

  // --- Checkboxes ---------------------------------------------------------
  // This is the maintenance-staff completion surface. A tech ticks a box; the
  // status column, the timestamp, the SLA clock and the requester notification
  // all follow from it (see 04_Tracker.gs). Nobody types a status by hand.
  CHECKBOX_STEPS.forEach(function (step) {
    sh.getRange(2, colIndex_(step.col), maxRows - 1, 1)
      .insertCheckboxes()
      .setHorizontalAlignment('center');
  });

  // --- Dropdown validation ------------------------------------------------
  applyValidation_(sh, 'Priority', PRIORITY_ORDER, maxRows);
  applyValidation_(sh, 'Queue', Object.keys(QUEUES).map(function (k) { return QUEUES[k].label; }), maxRows);
  applyValidation_(sh, 'Resolution Code', RESOLUTION_CODES, maxRows);
  applyValidation_(sh, 'Site', SITES.map(function (s) { return s.name; }), maxRows);

  // --- Number and date formats -------------------------------------------
  ['Submitted', 'SLA Respond By', 'SLA Resolve By', 'Ack At', 'Closed At', 'Last Updated']
    .forEach(function (c) {
      sh.getRange(2, colIndex_(c), maxRows - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm');
    });
  ['Parts Cost', 'Vendor Cost', 'Total Cost'].forEach(function (c) {
    sh.getRange(2, colIndex_(c), maxRows - 1, 1).setNumberFormat('$#,##0.00');
  });
  sh.getRange(2, colIndex_('Labor Hours'), maxRows - 1, 1).setNumberFormat('0.00');

  // --- Column widths ------------------------------------------------------
  const widths = {
    'WO #': 120, 'Status': 130, 'Priority': 90, 'Queue': 100, 'Submitted': 130,
    'SLA Respond By': 130, 'SLA Resolve By': 130, 'SLA State': 110, 'Site': 150,
    'Area / Room': 170, 'Category': 140, 'Symptom': 200, 'Description': 320,
    'Photo': 90, 'Requester': 150, 'Requester Email': 200, 'Resolution Notes': 300,
  };
  Object.keys(widths).forEach(function (c) { sh.setColumnWidth(colIndex_(c), widths[c]); });
  CHECKBOX_STEPS.forEach(function (s) { sh.setColumnWidth(colIndex_(s.col), 46); });

  body.setVerticalAlignment('top');
  sh.getRange(2, colIndex_('Description'), maxRows - 1, 1).setWrap(true);
  sh.getRange(2, colIndex_('Resolution Notes'), maxRows - 1, 1).setWrap(true);

  applyConditionalFormatting_(sh, maxRows);

  // --- Total Cost formula -------------------------------------------------
  // Written once as an array over the body so techs never maintain it.
  const partsL = colLetter_('Parts Cost');
  const vendorL = colLetter_('Vendor Cost');
  sh.getRange(2, colIndex_('Total Cost'))
    .setFormula('=ARRAYFORMULA(IF(ROW(' + partsL + '2:' + partsL + ')-1>COUNTA($A$2:$A),"",' +
                'IF(N(' + partsL + '2:' + partsL + ')+N(' + vendorL + '2:' + vendorL + ')=0,"",' +
                'N(' + partsL + '2:' + partsL + ')+N(' + vendorL + '2:' + vendorL + '))))');

  sh.setTabColor('#0B5394');
  return sh;
}

function applyValidation_(sh, colName, values, maxRows) {
  const rule = SpreadsheetApp.newDataValidation()
    .requireValueInList(values, true)
    .setAllowInvalid(false)
    .setHelpText('Choose from the list.')
    .build();
  sh.getRange(2, colIndex_(colName), maxRows - 1, 1).setDataValidation(rule);
}

// ---------------------------------------------------------------------------
// Conditional formatting
// ---------------------------------------------------------------------------

/**
 * Eight rules, applied in priority order — Sheets evaluates top to bottom and
 * the first match on a cell wins, so the terminal states are listed before the
 * live ones. The point is that a dispatcher opening this sheet at 7am sees the
 * three rows that need them without reading a single word.
 */
function applyConditionalFormatting_(sh, maxRows) {
  const lastCol = LOG_COLUMNS.length;
  const range = sh.getRange(2, 1, maxRows - 1, lastCol);
  const S = colLetter_('Status');
  const SLA = colLetter_('SLA State');
  const P = colLetter_('Priority');
  const DUP = colLetter_('Duplicate Of');
  const PHI = colLetter_('PHI Review');
  const SURV = colLetter_('Survey Sensitive');
  const LL = colLetter_('Landlord');

  const rules = [];
  const add = function (formula, fmt) {
    let b = SpreadsheetApp.newConditionalFormatRule()
      .whenFormulaSatisfied(formula)
      .setRanges([range]);
    if (fmt.bg) b = b.setBackground(fmt.bg);
    if (fmt.fg) b = b.setFontColor(fmt.fg);
    if (fmt.bold) b = b.setBold(true);
    if (fmt.italic) b = b.setItalic(true);
    if (fmt.strike) b = b.setStrikethrough(true);
    rules.push(b.build());
  };

  // 1. Closed / cancelled — recede. Grey and struck through so the eye skips them.
  add('=OR($' + S + '2="Closed",$' + S + '2="Cancelled")',
      { bg: '#F1F3F4', fg: '#80868B', strike: true });

  // 2. Duplicate — collapsed into another WO, keep visible but muted.
  add('=AND($' + DUP + '2<>"",$' + S + '2<>"Closed")',
      { bg: '#FFF3E0', fg: '#8D6E00', italic: true });

  // 3. Referred to the landlord — not Spectrum's spend. Distinct colour so it
  //    never gets counted in internal cost or internal SLA by eye.
  add('=AND($' + LL + '2<>"",$' + S + '2="Landlord Referred")',
      { bg: '#E8EAF6', fg: '#3F51B5', italic: true });

  // 4. PHI flagged — must be reviewed and redacted before anything else.
  //    Deliberately the loudest rule in the sheet.
  add('=$' + PHI + '2="REVIEW"',
      { bg: '#7B1FA2', fg: '#FFFFFF', bold: true });

  // 5. SLA breached and still open — the escalation list.
  add('=AND($' + SLA + '2="BREACHED",$' + S + '2<>"Closed")',
      { bg: '#C5221F', fg: '#FFFFFF', bold: true });

  // 6. P1 open — emergency, regardless of clock.
  add('=AND($' + P + '2="P1",$' + S + '2<>"Closed",$' + S + '2<>"Cancelled")',
      { bg: '#FCE8E6', fg: '#A50E0E', bold: true });

  // 7. SLA at risk — past 75% of the window. The row you fix today so it is
  //    never on rule 5 tomorrow.
  add('=$' + SLA + '2="AT RISK"', { bg: '#FEF7E0', fg: '#B06000' });

  // 8. Waiting on someone else — blue reads as "parked, not forgotten".
  add('=OR($' + S + '2="Awaiting Parts",$' + S + '2="Vendor Dispatched")',
      { bg: '#E8F0FE', fg: '#174EA6' });

  sh.setConditionalFormatRules(rules);

  // Survey-sensitive is a property of the SITE, not the ticket, so it gets a
  // single-column rule rather than a whole-row one — it should inform, not
  // colour over the ticket's own state.
  const siteRange = sh.getRange(2, colIndex_('Site'), maxRows - 1, 1);
  const existing = sh.getConditionalFormatRules();
  existing.push(SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$' + SURV + '2=TRUE')
    .setRanges([siteRange])
    .setFontColor('#7B1FA2')
    .setBold(true)
    .build());
  sh.setConditionalFormatRules(existing);
}

// ---------------------------------------------------------------------------
// Supporting sheets
// ---------------------------------------------------------------------------

/**
 * The asset registry is not maintained by hand. It accumulates from work order
 * history: every time a tech records an asset tag, that asset gains a repair
 * event. After roughly twelve months this is the evidence base for
 * replace-versus-repair, and it feeds the capital plan directly.
 */
function buildAssetRegistry_(ss) {
  let sh = ss.getSheetByName(SHEETS.ASSETS);
  if (!sh) sh = ss.insertSheet(SHEETS.ASSETS);
  const headers = ['Asset Tag', 'Site', 'Category', 'Description', 'First Seen', 'Last Repair',
                   'Repair Count', 'Lifetime Repair Cost', 'Flagged for Replacement',
                   'Replacement Note'];
  sh.getRange(1, 1, 1, headers.length)
    .setValues([headers]).setFontWeight('bold')
    .setBackground('#0B5394').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  sh.getRange(2, 8, sh.getMaxRows() - 1, 1).setNumberFormat('$#,##0.00');
  sh.getRange(2, 9, sh.getMaxRows() - 1, 1).insertCheckboxes();

  // Three or more repairs on one asset is the conventional trigger to look at
  // replacement. Highlight rather than decide — the judgement stays with a person.
  const rule = SpreadsheetApp.newConditionalFormatRule()
    .whenFormulaSatisfied('=$G2>=3')
    .setRanges([sh.getRange(2, 1, sh.getMaxRows() - 1, headers.length)])
    .setBackground('#FEF7E0').setFontColor('#B06000')
    .build();
  sh.setConditionalFormatRules([rule]);
  sh.setTabColor('#188038');
  return sh;
}

function buildAuditTrail_(ss) {
  let sh = ss.getSheetByName(SHEETS.AUDIT);
  if (!sh) sh = ss.insertSheet(SHEETS.AUDIT);
  const headers = ['Timestamp', 'WO #', 'Actor', 'Field', 'Old Value', 'New Value', 'Source'];
  sh.getRange(1, 1, 1, headers.length)
    .setValues([headers]).setFontWeight('bold')
    .setBackground('#5F6368').setFontColor('#FFFFFF');
  sh.setFrozenRows(1);
  sh.getRange(2, 1, sh.getMaxRows() - 1, 1).setNumberFormat('yyyy-mm-dd hh:mm:ss');
  sh.setTabColor('#5F6368');
  sh.hideSheet();
  return sh;
}

function buildConfigSheet_(ss) {
  let sh = ss.getSheetByName(SHEETS.CONFIG);
  if (!sh) sh = ss.insertSheet(SHEETS.CONFIG);
  sh.setTabColor('#F29900');
  return sh;
}

/**
 * Dashboard is formula-driven, not script-driven, so it is live the moment a
 * checkbox is ticked and it keeps working if every trigger in this project is
 * disabled. That is deliberate: the reporting layer should not depend on the
 * automation layer being healthy.
 */
function buildDashboard_(ss) {
  let sh = ss.getSheetByName(SHEETS.DASH);
  if (!sh) sh = ss.insertSheet(SHEETS.DASH);
  sh.clear();

  const L = "'" + SHEETS.LOG + "'!";
  const S = L + '$' + colLetter_('Status') + '$2:$' + colLetter_('Status');
  const P = L + '$' + colLetter_('Priority') + '$2:$' + colLetter_('Priority');
  const Q = L + '$' + colLetter_('Queue') + '$2:$' + colLetter_('Queue');
  const SL = L + '$' + colLetter_('SLA State') + '$2:$' + colLetter_('SLA State');
  const SI = L + '$' + colLetter_('Site') + '$2:$' + colLetter_('Site');
  const C = L + '$' + colLetter_('Total Cost') + '$2:$' + colLetter_('Total Cost');
  const openTest = '"<>Closed",' + S + ',"<>Cancelled",' + S + ',"<>Duplicate"';

  sh.getRange('A1').setValue(CFG.ORG_NAME + ' — Work Order Dashboard')
    .setFontSize(16).setFontWeight('bold').setFontColor('#0B5394');
  sh.getRange('A2').setFormula('="Live as of "&TEXT(NOW(),"yyyy-mm-dd hh:mm")')
    .setFontColor('#5F6368');

  const tiles = [
    ['Open work orders', '=COUNTIFS(' + S + ',' + openTest + ')'],
    ['Open P1',          '=COUNTIFS(' + P + ',"P1",' + S + ',' + openTest + ')'],
    ['Open P2',          '=COUNTIFS(' + P + ',"P2",' + S + ',' + openTest + ')'],
    ['SLA breached',     '=COUNTIFS(' + SL + ',"BREACHED",' + S + ',' + openTest + ')'],
    ['At risk today',    '=COUNTIFS(' + SL + ',"AT RISK",' + S + ',' + openTest + ')'],
    ['Closed this month','=COUNTIFS(' + S + ',"Closed",' + L + '$' + colLetter_('Closed At') +
                          '$2:$' + colLetter_('Closed At') + ',">="&EOMONTH(TODAY(),-1)+1)'],
  ];
  sh.getRange(4, 1, 1, 2).setValues([['Measure', 'Value']])
    .setFontWeight('bold').setBackground('#E8EAED');
  tiles.forEach(function (t, i) {
    sh.getRange(5 + i, 1).setValue(t[0]);
    sh.getRange(5 + i, 2).setFormula(t[1]).setFontWeight('bold').setFontSize(12);
  });

  // SLA compliance — the one number the COO should be asked about monthly.
  sh.getRange(12, 1).setValue('SLA compliance (closed, this month)').setFontWeight('bold');
  sh.getRange(12, 2).setFormula(
    '=IFERROR(TEXT(COUNTIFS(' + S + ',"Closed",' + SL + ',"MET",' + L + '$' +
    colLetter_('Closed At') + '$2:$' + colLetter_('Closed At') + ',">="&EOMONTH(TODAY(),-1)+1)/' +
    'COUNTIFS(' + S + ',"Closed",' + L + '$' + colLetter_('Closed At') + '$2:$' +
    colLetter_('Closed At') + ',">="&EOMONTH(TODAY(),-1)+1),"0%"),"n/a")')
    .setFontWeight('bold').setFontSize(12);

  sh.getRange(14, 1).setValue('Open by queue').setFontWeight('bold').setBackground('#E8EAED');
  sh.getRange(15, 1).setFormula(
    '=IFERROR(QUERY({' + Q + ',' + S + '},"select Col1, count(Col1) where Col1 is not null ' +
    'and Col2 <> \'Closed\' and Col2 <> \'Cancelled\' group by Col1 label count(Col1) \'Open\'",0),"none")');

  sh.getRange(14, 4).setValue('Open by site (top 10)').setFontWeight('bold').setBackground('#E8EAED');
  sh.getRange(15, 4).setFormula(
    '=IFERROR(QUERY({' + SI + ',' + S + '},"select Col1, count(Col1) where Col1 is not null ' +
    'and Col2 <> \'Closed\' and Col2 <> \'Cancelled\' group by Col1 order by count(Col1) desc ' +
    'limit 10 label count(Col1) \'Open\'",0),"none")');

  sh.getRange(14, 7).setValue('Spend by site, this year').setFontWeight('bold').setBackground('#E8EAED');
  sh.getRange(15, 7).setFormula(
    '=IFERROR(QUERY({' + SI + ',' + C + '},"select Col1, sum(Col2) where Col1 is not null ' +
    'group by Col1 order by sum(Col2) desc limit 15 label sum(Col2) \'Spend\'",0),"none")');

  sh.setColumnWidth(1, 240);
  sh.setColumnWidth(2, 100);
  sh.setColumnWidth(4, 200);
  sh.setColumnWidth(7, 200);
  sh.setTabColor('#E8710A');
  return sh;
}
