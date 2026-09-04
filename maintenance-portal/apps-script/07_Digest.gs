/**
 * 07_Digest.gs — scheduled sweeps.
 *
 * Three cadences, three audiences:
 *   Hourly  — SLA sweep and breach escalation. Machine-facing.
 *   Daily   — dispatcher's open-queue digest. Supervisor-facing.
 *   Weekly  — management scorecard. COO-facing.
 *
 * The hourly sweep exists because time passing is itself an event. A system
 * that only updates when someone opens the sheet is blind to precisely the
 * work orders that are going wrong.
 */

// ---------------------------------------------------------------------------
// Hourly — SLA sweep and escalation
// ---------------------------------------------------------------------------

function hourlySlaSweep() {
  recomputeSlaStates();

  const sh = getSpreadsheet_().getSheetByName(SHEETS.LOG);
  if (!sh || sh.getLastRow() < 2) return;

  const rows = readOpenRows_(sh);
  const props = PropertiesService.getScriptProperties();

  // Escalate each breach ONCE. An escalation that repeats every hour is
  // ignored within a day, which is worse than not sending it at all.
  const alreadySent = JSON.parse(props.getProperty('ESCALATED') || '{}');
  const fresh = [];

  rows.forEach(function (r) {
    if (r.slaState !== 'BREACHED') return;
    if (alreadySent[r.wo]) return;
    fresh.push(r);
    alreadySent[r.wo] = new Date().toISOString();
  });

  // Also chase P1s that nobody has acknowledged inside the response window.
  const unacked = rows.filter(function (r) {
    return r.priority === 'P1' && !r.acknowledged && r.respondBy && new Date() > r.respondBy &&
           !alreadySent['ACK_' + r.wo];
  });
  unacked.forEach(function (r) { alreadySent['ACK_' + r.wo] = new Date().toISOString(); });

  if (fresh.length) {
    const tier = fresh.some(function (r) { return r.priority === 'P1'; })
      ? [ESCALATION.TIER_1, ESCALATION.TIER_2].join(',')
      : ESCALATION.TIER_1;
    safeEmail_(tier,
      '[SLA BREACH] ' + fresh.length + ' work order' + (fresh.length === 1 ? '' : 's') +
        ' past target',
      'These work orders are past their resolve-by target and still open:\n\n' +
      fresh.map(formatRowLine_).join('\n') +
      '\n\nEach needs either work today or a documented reason it is deferred.');
  }

  if (unacked.length) {
    safeEmail_([ESCALATION.TIER_1, ESCALATION.TIER_2, ESCALATION.TIER_3].join(','),
      '[P1 UNACKNOWLEDGED] ' + unacked.length + ' emergency work order' +
        (unacked.length === 1 ? '' : 's'),
      'No one has acknowledged these emergency work orders within the response window:\n\n' +
      unacked.map(formatRowLine_).join('\n') +
      '\n\nThis is the escalation of last resort. Confirm someone is on the way.');
  }

  props.setProperty('ESCALATED', JSON.stringify(pruneEscalations_(alreadySent)));
}

/** Keeps the escalation memo from growing without limit. */
function pruneEscalations_(map) {
  const cutoff = Date.now() - 30 * 86400 * 1000;
  const out = {};
  Object.keys(map).forEach(function (k) {
    const t = Date.parse(map[k]);
    if (!isNaN(t) && t > cutoff) out[k] = map[k];
  });
  return out;
}

// ---------------------------------------------------------------------------
// Daily — dispatcher digest
// ---------------------------------------------------------------------------

function dailyDigest() {
  const sh = getSpreadsheet_().getSheetByName(SHEETS.LOG);
  if (!sh) return;
  const rows = readOpenRows_(sh);

  const byQueue = {};
  rows.forEach(function (r) {
    if (!byQueue[r.queue]) byQueue[r.queue] = [];
    byQueue[r.queue].push(r);
  });

  Object.keys(byQueue).forEach(function (queueLabel) {
    const list = byQueue[queueLabel];
    const breached = list.filter(function (r) { return r.slaState === 'BREACHED'; });
    const atRisk = list.filter(function (r) { return r.slaState === 'AT RISK'; });
    const p1 = list.filter(function (r) { return r.priority === 'P1'; });
    const unacked = list.filter(function (r) { return !r.acknowledged; });

    const body = [
      queueLabel + ' — open work orders: ' + list.length,
      '',
      'Past due:        ' + breached.length,
      'Due today:       ' + atRisk.length,
      'Emergencies:     ' + p1.length,
      'Not yet picked up: ' + unacked.length,
      '',
    ];

    if (breached.length) {
      body.push('PAST DUE', '─────────', breached.map(formatRowLine_).join('\n'), '');
    }
    if (p1.length) {
      body.push('EMERGENCIES', '─────────', p1.map(formatRowLine_).join('\n'), '');
    }
    if (atRisk.length) {
      body.push('DUE TODAY', '─────────', atRisk.map(formatRowLine_).join('\n'), '');
    }
    if (!breached.length && !p1.length && !atRisk.length) {
      body.push('Nothing overdue or at risk. ' + list.length + ' open in normal window.');
    }

    const phi = list.filter(function (r) { return r.phi === 'REVIEW'; });
    if (phi.length) {
      body.push('', 'PRIVACY REVIEW NEEDED', '─────────',
        phi.length + ' open work order' + (phi.length === 1 ? '' : 's') +
        ' may contain resident information and should be redacted:',
        phi.map(function (r) { return '  ' + r.wo + ' — ' + r.site; }).join('\n'));
    }

    safeEmail_(queueEmailFor_(queueLabel),
      queueLabel + ' — ' + list.length + ' open, ' + breached.length + ' past due',
      body.join('\n'));
  });
}

// ---------------------------------------------------------------------------
// Weekly — management scorecard
// ---------------------------------------------------------------------------

/**
 * The COO-facing number set. Deliberately short: five measures a leader can act
 * on, not forty a leader will skim. Anything longer gets filed unread, and an
 * unread report is a maintenance cost with no return.
 */
function weeklyScorecard() {
  const sh = getSpreadsheet_().getSheetByName(SHEETS.LOG);
  if (!sh || sh.getLastRow() < 2) return;

  const n = sh.getLastRow() - 1;
  const vals = sh.getRange(2, 1, n, LOG_COLUMNS.length).getValues();
  const idx = function (c) { return colIndex_(c) - 1; };
  const weekAgo = new Date(Date.now() - 7 * 86400 * 1000);

  let opened = 0, closed = 0, met = 0, measured = 0, cost = 0, openNow = 0, breachedNow = 0;
  const bySite = {};

  vals.forEach(function (r) {
    if (!r[idx('WO #')]) return;
    const sub = r[idx('Submitted')];
    const cls = r[idx('Closed At')];
    const status = r[idx('Status')];
    const site = r[idx('Site')];

    if (sub instanceof Date && sub >= weekAgo) opened++;
    if (cls instanceof Date && cls >= weekAgo) {
      closed++;
      const s = r[idx('SLA State')];
      if (s === 'MET' || s === 'MISSED') { measured++; if (s === 'MET') met++; }
      cost += parseFloat(r[idx('Total Cost')]) || 0;
    }
    if (TERMINAL_STATUSES.indexOf(status) < 0) {
      openNow++;
      if (r[idx('SLA State')] === 'BREACHED') breachedNow++;
      bySite[site] = (bySite[site] || 0) + 1;
    }
  });

  const topSites = Object.keys(bySite)
    .sort(function (a, b) { return bySite[b] - bySite[a]; })
    .slice(0, 5)
    .map(function (s) { return '  ' + s + ': ' + bySite[s]; });

  const compliance = measured ? Math.round((met / measured) * 100) + '%' : 'n/a';
  const net = opened - closed;

  safeEmail_(REPORT_RECIPIENTS.join(','),
    'Work orders — week ending ' + Utilities.formatDate(new Date(), CFG.TIMEZONE, 'd MMM yyyy'),
    [
      'WORK ORDER SCORECARD',
      'Week ending ' + Utilities.formatDate(new Date(), CFG.TIMEZONE, 'd MMMM yyyy'),
      '',
      'Opened this week:      ' + opened,
      'Closed this week:      ' + closed,
      'Net change in backlog: ' + (net > 0 ? '+' + net : net),
      'Open now:              ' + openNow,
      'Past due now:          ' + breachedNow,
      'SLA compliance:        ' + compliance + ' (of ' + measured + ' measured)',
      'Spend on closed work:  $' + cost.toFixed(2),
      '',
      'Most open work orders by site:',
      topSites.length ? topSites.join('\n') : '  none',
      '',
      '─────────',
      'A rising backlog with flat closures means capacity, not effort.',
      'A site consistently at the top of that list is usually a building problem,',
      'not a reporting problem — worth a capital look rather than more work orders.',
    ].join('\n'));
}

// ---------------------------------------------------------------------------
// Shared readers
// ---------------------------------------------------------------------------

function readOpenRows_(sh) {
  const last = sh.getLastRow();
  if (last < 2) return [];
  const vals = sh.getRange(2, 1, last - 1, LOG_COLUMNS.length).getValues();
  const idx = function (c) { return colIndex_(c) - 1; };

  return vals
    .filter(function (r) {
      return r[idx('WO #')] && TERMINAL_STATUSES.indexOf(r[idx('Status')]) < 0;
    })
    .map(function (r) {
      return {
        wo: r[idx('WO #')],
        status: r[idx('Status')],
        priority: r[idx('Priority')],
        queue: r[idx('Queue')],
        site: r[idx('Site')],
        area: r[idx('Area / Room')],
        category: r[idx('Category')],
        symptom: r[idx('Symptom')],
        slaState: r[idx('SLA State')],
        respondBy: r[idx('SLA Respond By')] instanceof Date ? r[idx('SLA Respond By')] : null,
        resolveBy: r[idx('SLA Resolve By')] instanceof Date ? r[idx('SLA Resolve By')] : null,
        acknowledged: r[idx('Acknowledged')] === true,
        phi: r[idx('PHI Review')],
      };
    });
}

function formatRowLine_(r) {
  const due = r.resolveBy
    ? Utilities.formatDate(r.resolveBy, CFG.TIMEZONE, 'd MMM h:mm a')
    : '—';
  return '  ' + r.wo + '  ' + r.priority + '  ' + r.site + ' / ' + r.area +
         '  —  ' + r.category + (r.symptom ? ' (' + r.symptom + ')' : '') +
         '  —  due ' + due;
}
