/**
 * 06_Notify.gs — outbound communication.
 *
 * Two audiences with different needs:
 *   The QUEUE needs enough to dispatch without opening the sheet.
 *   The REQUESTER needs to know they were heard and when to expect someone.
 *
 * Everything routes through safeEmail_(), which honours DEBUG_MODE. Leave
 * DEBUG_MODE on during the pilot so a misconfigured address cannot send 200
 * emails to the wrong distribution list on day one.
 */

function safeEmail_(to, subject, body, htmlBody) {
  if (!to) return;
  const recipient = CFG.DEBUG_MODE ? CFG.DEBUG_RECIPIENT : to;
  const finalSubject = CFG.DEBUG_MODE ? '[TEST → ' + to + '] ' + subject : subject;
  try {
    const opts = { name: CFG.ORG_NAME + ' Work Orders' };
    if (htmlBody) opts.htmlBody = htmlBody;
    MailApp.sendEmail(recipient, finalSubject, body, opts);
  } catch (err) {
    Logger.log('Email failed to ' + recipient + ': ' + err);
  }
}

// ---------------------------------------------------------------------------
// New work order
// ---------------------------------------------------------------------------

function notifyNewWorkOrder_(wo) {
  const pri = PRIORITIES[wo.priority];
  const fmt = function (d) { return Utilities.formatDate(d, CFG.TIMEZONE, 'EEE d MMM, h:mm a'); };

  // --- To the queue -------------------------------------------------------
  const lines = [
    wo.woNumber + '  ·  ' + pri.label,
    '',
    'Site:        ' + wo.site + (wo.town ? ' (' + wo.town + ')' : ''),
    'Location:    ' + wo.area,
    'Category:    ' + wo.category + (wo.symptom ? ' — ' + wo.symptom : ''),
    'Reported by: ' + (wo.requester || wo.requesterEmail) + '  ·  ' + wo.requesterPhone,
    '',
    'Respond by:  ' + fmt(wo.respondBy),
    'Resolve by:  ' + fmt(wo.resolveBy),
    '',
    'What was reported:',
    wo.description,
  ];

  if (wo.priorityReasons.length) {
    lines.push('', 'Why this priority:');
    wo.priorityReasons.forEach(function (r) { lines.push('  · ' + r); });
  }
  if (wo.duplicateOf) {
    lines.push('', '⚠ POSSIBLE DUPLICATE of ' + wo.duplicateOf +
                   ' — same site and category, still open. Check before dispatching.');
  }
  if (wo.surveySensitive) {
    lines.push('', '⚠ Licensed site. Physical-plant conditions here are survey-visible. ' +
                   'Document the repair.');
  }
  if (wo.landlord) {
    lines.push('', '⚠ LEASED SITE — landlord is ' + wo.landlord + '. Confirm whether this is ' +
                   'the landlord\'s obligation before spending Spectrum labour on it.');
  }
  if (wo.phiReview === 'REVIEW') {
    lines.push('', '⚠ PRIVACY REVIEW — this submission may contain resident information. ' +
                   'Redact the WO Log row before sharing it with anyone outside the team, ' +
                   'including vendors.');
  }
  if (wo.photo) lines.push('', 'Photo: ' + wo.photo);

  const to = QUEUES[wo.queueKey].email;
  const cc = [];
  if (wo.priority === 'P1') cc.push(ESCALATION.TIER_1);
  if (wo.priority === 'P1' && wo.surveySensitive) cc.push(ESCALATION.COMPLIANCE_CC);

  const subject = (wo.priority === 'P1' ? '[P1 EMERGENCY] ' : '[' + wo.priority + '] ') +
                  wo.site + ' — ' + wo.category + ' — ' + wo.woNumber;

  safeEmail_(to.concat(cc.length ? ',' + cc.join(',') : ''), subject, lines.join('\n'));

  // --- To the requester ---------------------------------------------------
  if (wo.requesterEmail) {
    safeEmail_(wo.requesterEmail,
      'Received: ' + wo.woNumber + ' — ' + wo.site,
      'Thank you — your request has been logged and sent to the ' + wo.queueLabel + ' team.\n\n' +
      'Work order:  ' + wo.woNumber + '\n' +
      'Priority:    ' + pri.label + '\n' +
      'Site:        ' + wo.site + '\n' +
      'Location:    ' + wo.area + '\n\n' +
      'Someone will acknowledge this by ' + fmt(wo.respondBy) + '.\n' +
      'Target completion is ' + fmt(wo.resolveBy) + '.\n\n' +
      'You will get another email when the work is done. You do not need to call ' +
      'or resubmit.\n\n' +
      (wo.priority === 'P1'
        ? 'This was logged as an EMERGENCY. If nobody has contacted you within the hour, ' +
          'call the on-call line directly.\n\n'
        : '') +
      'Quote ' + wo.woNumber + ' in any follow-up.');
  }
}

// ---------------------------------------------------------------------------
// Status change
// ---------------------------------------------------------------------------

function notifyStatusChange_(sh, row, status) {
  const email = sh.getRange(row, colIndex_('Requester Email')).getValue();
  if (!email) return;

  const wo = sh.getRange(row, colIndex_('WO #')).getValue();
  const site = sh.getRange(row, colIndex_('Site')).getValue();
  const area = sh.getRange(row, colIndex_('Area / Room')).getValue();
  const notes = String(sh.getRange(row, colIndex_('Resolution Notes')).getValue() || '');

  let subject, body;
  if (status === 'Acknowledged') {
    subject = 'Acknowledged: ' + wo + ' — ' + site;
    body = 'Your work order ' + wo + ' (' + site + ', ' + area + ') has been picked up by ' +
           'the maintenance team.\n\nYou will hear again when the work is complete.';
  } else if (status === 'Work Complete') {
    subject = 'Completed: ' + wo + ' — ' + site;
    body = 'The work on ' + wo + ' (' + site + ', ' + area + ') is complete.\n\n' +
           (notes ? 'What was done:\n' + notes + '\n\n' : '') +
           'If the problem is not actually resolved, reply to this email within 7 days and ' +
           'it will be reopened rather than logged as a new request. That keeps the repair ' +
           'history for this equipment in one place.';
  } else if (status === 'Closed') {
    subject = 'Closed: ' + wo + ' — ' + site;
    body = 'Work order ' + wo + ' (' + site + ') is now closed.\n\n' +
           'Thank you for reporting it. If anything is still wrong, submit a new request ' +
           'and reference ' + wo + '.';
  } else {
    return;
  }
  safeEmail_(email, subject, body);
}
