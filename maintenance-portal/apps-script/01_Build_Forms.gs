/**
 * 01_Build_Forms.gs — programmatic construction of both forms.
 *
 * The forms are BUILT BY CODE, not by hand in the Forms UI. That is deliberate:
 * a hand-built form cannot be version-controlled, cannot be rebuilt after
 * someone deletes a question, and cannot be reviewed. Run rebuildForms() and
 * you get an identical form every time.
 *
 * Apps Script constraint worth knowing: conditional navigation only works from
 * MULTIPLE CHOICE and LIST items, and only jumps to PAGE BREAKS. Checkbox
 * items cannot branch. That is why category is a single-select list and why
 * every category owns its own section.
 */

// ---------------------------------------------------------------------------
// Entry point
// ---------------------------------------------------------------------------

/**
 * Builds both forms from scratch and links them to the spreadsheet.
 * Safe to re-run: it creates NEW forms and re-points the properties. The old
 * forms are left in Drive untouched so live links keep working until you
 * deliberately retire them.
 */
function rebuildForms() {
  const ss = getSpreadsheet_();
  const props = PropertiesService.getScriptProperties();

  const intake = buildIntakeForm_(ss);
  const closeout = buildCloseOutForm_(ss);

  props.setProperty('INTAKE_FORM_ID', intake.getId());
  props.setProperty('CLOSEOUT_FORM_ID', closeout.getId());

  installFormTriggers_();

  const msg =
    'Forms rebuilt.\n\n' +
    'STAFF REQUEST FORM (share this one):\n' + intake.getPublishedUrl() + '\n\n' +
    'TECH CLOSE-OUT FORM (maintenance staff only):\n' + closeout.getPublishedUrl() + '\n\n' +
    'Edit intake: ' + intake.getEditUrl() + '\n' +
    'Edit close-out: ' + closeout.getEditUrl();
  Logger.log(msg);
  return msg;
}

// ---------------------------------------------------------------------------
// Form 1 — Staff work order request
// ---------------------------------------------------------------------------

function buildIntakeForm_(ss) {
  const form = FormApp.create(CFG.ORG_NAME + ' — Work Order Request');

  form
    .setDescription(
      'Use this form for anything broken, unsafe, or needing repair at any Spectrum ' +
      'site — building, vehicle, or technology. One form for all three.\n\n' +
      'You do not need to decide how urgent it is. Answer the questions and the ' +
      'system sets the priority and notifies the right team automatically.\n\n' +
      '⚠️ PRIVACY — REQUIRED\n' +
      'Describe the ROOM and the EQUIPMENT, never a person. Do not enter anyone\'s ' +
      'name, initials, room-as-identity, diagnosis, medication, behavior, or any ' +
      'incident detail. Write "downstairs bathroom sink" — not a person\'s name.\n\n' +
      'EMERGENCY: If there is fire, flooding, a gas odor, or anyone is in danger, ' +
      'CALL 911 AND THE ON-CALL LINE FIRST. Submit this form afterward.')
    .setProgressBar(true)
    .setAllowResponseEdits(false)
    .setLimitOneResponsePerUser(false)
    .setShowLinkToRespondAgain(true)
    .setConfirmationMessage(
      'Request received. You will get an email with your work order number and the ' +
      'target response time within a few minutes.\n\n' +
      'If this is an emergency and nobody has contacted you within one hour, call the ' +
      'on-call line directly.');

  if (CFG.REQUIRE_LOGIN) {
    form.setRequireLogin(true).setCollectEmail(true);
  } else {
    form.setRequireLogin(false).setCollectEmail(false);
  }

  // --- Section 0: who and where ------------------------------------------
  if (!CFG.REQUIRE_LOGIN) {
    form.addTextItem().setTitle('Your name').setRequired(true);
    form.addTextItem()
      .setTitle('Your email')
      .setHelpText('We send your work order number and status updates here.')
      .setRequired(true)
      .setValidation(FormApp.createTextValidation()
        .requireTextIsEmail()
        .setHelpText('Enter a valid email address.')
        .build());
  }

  form.addTextItem()
    .setTitle('Best phone number to reach you')
    .setHelpText('For emergencies the technician calls before travelling.')
    .setRequired(true);

  form.addListItem()
    .setTitle('Site')
    .setHelpText('If you scanned the QR code posted at your site, this is already filled in.')
    .setChoiceValues(SITES.map(function (s) { return s.name; }))
    .setRequired(true);

  form.addTextItem()
    .setTitle('Area, room or location within the site')
    .setHelpText('Example: "downstairs bathroom", "kitchen", "van #12", "back stairwell". ' +
                 'Describe the place, not the person who uses it.')
    .setRequired(true);

  // --- Category selector (branch point) -----------------------------------
  const categoryItem = form.addListItem()
    .setTitle('What kind of problem is it?')
    .setHelpText('Pick the closest match. The next page asks only the questions that apply.')
    .setRequired(true);

  // --- One section per category -------------------------------------------
  // Pages must exist before navigation can point at them, so build every page
  // first and hold the references, then wire navigation at the end.
  const categoryPages = {};

  CATEGORIES.forEach(function (cat) {
    const page = form.addPageBreakItem()
      .setTitle(cat.label)
      .setHelpText('A few quick questions so the right person is sent with the right parts.');
    categoryPages[cat.key] = page;

    cat.followUps.forEach(function (fu) {
      if (fu.type === 'LIST') {
        form.addListItem()
          .setTitle(tagged_(cat.key, fu.q))
          .setChoiceValues(fu.choices)
          .setRequired(!!fu.required);
      } else {
        form.addTextItem()
          .setTitle(tagged_(cat.key, fu.q))
          .setRequired(!!fu.required);
      }
    });
  });

  // --- Common closing section ---------------------------------------------
  const detailsPage = form.addPageBreakItem()
    .setTitle('Details')
    .setHelpText('Last step.');

  form.addParagraphTextItem()
    .setTitle('Describe the problem')
    .setHelpText('What is wrong, when it started, and anything already tried. ' +
                 'Describe equipment and rooms only — no names, no health information, ' +
                 'no incident details.')
    .setRequired(true);

  if (CFG.REQUIRE_LOGIN) {
    // File upload requires respondent sign-in. Photos cut a huge share of
    // "go look at it first" trips — the tech arrives with the right part.
    const folder = getOrCreatePhotoFolder_();
    form.addFileUploadItem()
      .setTitle('Photo (strongly recommended)')
      .setHelpText('A photo usually saves a trip. Do not photograph people, ' +
                   'documents, medication, or anything with a name on it.')
      .setDestinationFolder(folder)
      .setAllowedFileTypes([FormApp.FileType.IMAGE])
      .setMaxFileSize(10)
      .setMaxFiles(3)
      .setRequired(false);
  }

  form.addListItem()
    .setTitle('Has this same problem been reported before at this site?')
    .setChoiceValues(['No', 'Yes — it was fixed and came back', 'Yes — still waiting on the first request',
                      'Not sure'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('Asset tag or serial number (if there is one on the equipment)')
    .setHelpText('Optional, but it is how we learn which equipment keeps failing and ' +
                 'when to replace it instead of repairing it again.')
    .setRequired(false);

  // --- Wire the conditional navigation ------------------------------------
  // Each category choice jumps to its own section; each section then falls
  // through to Details. Without the second half, a respondent would walk
  // through all thirteen category sections in order.
  categoryItem.setChoices(CATEGORIES.map(function (cat) {
    return categoryItem.createChoice(cat.label, categoryPages[cat.key]);
  }));

  CATEGORIES.forEach(function (cat) {
    categoryPages[cat.key].setGoToPage(detailsPage);
  });

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  renameLinkedSheet_(ss, SHEETS.RAW);
  return form;
}

// ---------------------------------------------------------------------------
// Form 2 — Technician close-out
// ---------------------------------------------------------------------------

/**
 * Field techs close work orders from a phone. This is what makes cost-per-work-
 * order and vendor performance measurable — without it, the log records that
 * something was fixed but never what it cost.
 */
function buildCloseOutForm_(ss) {
  const form = FormApp.create(CFG.ORG_NAME + ' — Work Order Close-Out');

  form
    .setDescription(
      'Maintenance staff only. Use this to update or close a work order from the field.\n\n' +
      'You need the WO number from the dispatch email (example: WO-2026-0417).')
    .setProgressBar(false)
    .setAllowResponseEdits(false)
    .setShowLinkToRespondAgain(true)
    .setConfirmationMessage('Update recorded. The log and the requester have been updated.');

  if (CFG.REQUIRE_LOGIN) {
    form.setRequireLogin(true).setCollectEmail(true);
  }

  form.addTextItem()
    .setTitle('WO number')
    .setHelpText('From the dispatch email, e.g. WO-2026-0417')
    .setRequired(true)
    .setValidation(FormApp.createTextValidation()
      .requireTextMatchesPattern('(?i)\\s*WO-\\d{4}-\\d{3,6}\\s*')
      .setHelpText('Format is WO-YYYY-NNNN, for example WO-2026-0417.')
      .build());

  form.addListItem()
    .setTitle('Update type')
    .setChoiceValues(['Work complete — closing it out', 'Progress update — still open',
                      'Cannot complete — need a decision', 'Duplicate of another WO'])
    .setRequired(true);

  form.addTextItem()
    .setTitle('Labor hours on this visit')
    .setHelpText('Decimal hours, e.g. 1.5')
    .setRequired(false)
    .setValidation(FormApp.createTextValidation()
      .requireNumber()
      .setHelpText('Enter a number, e.g. 1.5')
      .build());

  form.addTextItem()
    .setTitle('Parts cost ($)')
    .setRequired(false)
    .setValidation(FormApp.createTextValidation()
      .requireNumber()
      .setHelpText('Enter a number with no dollar sign, e.g. 84.20')
      .build());

  form.addTextItem()
    .setTitle('Vendor used (leave blank if in house)')
    .setRequired(false);

  form.addTextItem()
    .setTitle('Vendor invoice amount ($)')
    .setRequired(false)
    .setValidation(FormApp.createTextValidation()
      .requireNumber()
      .setHelpText('Enter a number with no dollar sign.')
      .build());

  form.addListItem()
    .setTitle('Resolution code')
    .setChoiceValues(RESOLUTION_CODES)
    .setRequired(false);

  form.addParagraphTextItem()
    .setTitle('What was done')
    .setHelpText('Enough that the next technician can pick it up. Equipment only — no names, ' +
                 'no health information.')
    .setRequired(false);

  form.addTextItem()
    .setTitle('Asset tag or serial number of the equipment worked on')
    .setHelpText('This builds the asset history. It is how replace-versus-repair gets decided ' +
                 'with data instead of opinion.')
    .setRequired(false);

  form.addListItem()
    .setTitle('Does this asset need to be flagged for capital replacement?')
    .setChoiceValues(['No', 'Yes — repeated failures', 'Yes — beyond economical repair'])
    .setRequired(false);

  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());
  renameLinkedSheet_(ss, SHEETS.CLOSEOUT);
  return form;
}

// ---------------------------------------------------------------------------
// Prefilled per-site links (QR codes)
// ---------------------------------------------------------------------------

/**
 * Generates one prefilled URL per site and writes them to the Config tab.
 * Print each as a QR code and post it in that site's staff office. The
 * respondent's site is then already selected, which removes the single most
 * common data error in the whole system — wrong or misspelled location.
 */
function generateSitePrefillLinks() {
  const props = PropertiesService.getScriptProperties();
  const formId = props.getProperty('INTAKE_FORM_ID');
  if (!formId) throw new Error('Run rebuildForms() first.');

  const form = FormApp.openById(formId);
  const siteItem = form.getItems(FormApp.ItemType.LIST)
    .map(function (i) { return i.asListItem(); })
    .filter(function (i) { return i.getTitle() === 'Site'; })[0];
  if (!siteItem) throw new Error('Site question not found on the intake form.');

  const rows = SITES.map(function (s) {
    const resp = form.createResponse();
    resp.withItemResponse(siteItem.createResponse(s.name));
    return [s.name, s.town, s.county, s.type, resp.toPrefilledUrl()];
  });

  const ss = getSpreadsheet_();
  let sh = ss.getSheetByName(SHEETS.CONFIG);
  if (!sh) sh = ss.insertSheet(SHEETS.CONFIG);

  const startRow = 2;
  sh.getRange(1, 1, 1, 5)
    .setValues([['Site', 'Town', 'County', 'Type', 'Prefilled QR link']])
    .setFontWeight('bold')
    .setBackground('#0B5394')
    .setFontColor('#FFFFFF');
  sh.getRange(startRow, 1, rows.length, 5).setValues(rows);
  sh.setColumnWidth(5, 520);
  sh.setFrozenRows(1);

  return rows.length + ' prefilled site links written to the ' + SHEETS.CONFIG + ' tab.';
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Follow-up questions from different categories can share wording ("What is
 * happening?"). Google keys response columns by question title, so identical
 * titles would collide into one column. Prefixing with the category key keeps
 * every column distinct and self-describing in the raw sheet.
 */
function tagged_(catKey, question) {
  return '[' + catKey + '] ' + question;
}

function getOrCreatePhotoFolder_() {
  if (CFG.PHOTO_FOLDER_ID) {
    try {
      return DriveApp.getFolderById(CFG.PHOTO_FOLDER_ID);
    } catch (e) {
      Logger.log('PHOTO_FOLDER_ID is set but unreadable; creating a new folder. ' + e);
    }
  }
  const name = CFG.ORG_NAME + ' — Work Order Photos';
  const existing = DriveApp.getFoldersByName(name);
  if (existing.hasNext()) return existing.next();
  return DriveApp.createFolder(name);
}

/**
 * A newly linked form creates a sheet called "Form Responses 1". Rename it to
 * the configured name so the rest of the code can find it by a stable name.
 */
function renameLinkedSheet_(ss, targetName) {
  SpreadsheetApp.flush();
  const sheets = ss.getSheets();
  for (let i = 0; i < sheets.length; i++) {
    const name = sheets[i].getName();
    if (/^Form Responses \d+$/.test(name)) {
      if (ss.getSheetByName(targetName)) {
        // A sheet by that name already exists; leave the new one alone and
        // let the operator reconcile rather than silently destroying data.
        Logger.log('Sheet "' + targetName + '" already exists. New response sheet left as "' +
                   name + '" for manual reconciliation.');
        return;
      }
      sheets[i].setName(targetName);
      return;
    }
  }
}

function getSpreadsheet_() {
  if (CFG.SPREADSHEET_ID) return SpreadsheetApp.openById(CFG.SPREADSHEET_ID);
  const active = SpreadsheetApp.getActiveSpreadsheet();
  if (active) return active;
  throw new Error('No spreadsheet. Set CFG.SPREADSHEET_ID or run from a bound script.');
}
