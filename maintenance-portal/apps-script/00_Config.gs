/**
 * Spectrum for Living — Work Order Portal
 * 00_Config.gs — the single tuning surface.
 *
 * Every value an operator needs to change lives in this file. Logic files never
 * hardcode a site, an address, an SLA, or a routing rule. If you find yourself
 * editing another file to change an operational decision, that is a defect —
 * lift the value into here instead.
 *
 * OWNER: Director of Facilities & Fleet Management
 * BACKUP: Director of IT
 */

// ===========================================================================
// 1. IDENTITY AND ACCESS
// ===========================================================================

const CFG = {
  ORG_NAME: 'Spectrum for Living',
  TIMEZONE: 'America/New_York',

  // Set false only if front-line staff do NOT all have Workspace accounts.
  // TRUE  → form auto-captures submitter identity, photo upload is available,
  //         and the form is restricted to the domain.
  // FALSE → form is public-link, submitter types their own name/email, and
  //         PHOTO UPLOAD IS DISABLED (Google requires sign-in for file upload).
  // See docs/OPERATIONS.md "Open decision 1" before changing this.
  REQUIRE_LOGIN: true,

  // Drive folder that receives submitted photos. Leave blank to auto-create.
  PHOTO_FOLDER_ID: '',

  // Master spreadsheet. Leave blank on first run; buildAll() fills it in.
  SPREADSHEET_ID: '',

  // Set true to route every outbound notification to DEBUG_RECIPIENT instead
  // of real staff. Use during the pilot. Flip to false at go-live.
  DEBUG_MODE: true,
  DEBUG_RECIPIENT: 'facilities@spectrumforliving.org',
};

// ===========================================================================
// 2. QUEUES AND ROUTING
// ===========================================================================
//
// One intake door, three queues. Staff never have to know who to call — this
// is the single largest time saving in the system. Replace the addresses with
// real distribution lists, not individuals: a personal address is a single
// point of failure and breaks the moment someone takes vacation.

const QUEUES = {
  FACILITIES: {
    label: 'Facilities',
    email: 'facilities@spectrumforliving.org',
    manager: 'Director of Facilities & Fleet Management',
  },
  FLEET: {
    label: 'Fleet',
    email: 'fleet@spectrumforliving.org',
    manager: 'Director of Facilities & Fleet Management',
  },
  IT: {
    label: 'IT',
    email: 'helpdesk@spectrumforliving.org',
    manager: 'Director of IT',
  },
  LANDLORD: {
    label: 'Landlord / Association',
    email: 'facilities@spectrumforliving.org',
    manager: 'Director of Facilities & Fleet Management',
  },
};

// Escalation ladder for P1 and for breached SLAs.
const ESCALATION = {
  TIER_1: 'facilities@spectrumforliving.org',     // on-call / duty phone
  TIER_2: 'vp-operations@spectrumforliving.org',  // VP of Operations
  TIER_3: 'coo@spectrumforliving.org',            // COO
  // Survey-sensitive sites copy Compliance on P1. This is a PEER function —
  // notification only, not task assignment. See docs/OPERATIONS.md.
  COMPLIANCE_CC: 'compliance@spectrumforliving.org',
};

// Weekly scorecard recipients.
const REPORT_RECIPIENTS = [
  'coo@spectrumforliving.org',
  'vp-operations@spectrumforliving.org',
  'facilities@spectrumforliving.org',
];

// ===========================================================================
// 3. SITES
// ===========================================================================
//
// Derived from 2026_Facility_List.xlsx (27 facilities, 18 municipalities,
// 3 counties). This array is the ONE source of truth for location. The form
// dropdown, the routing rules, the dashboard breakdown and the QR prefill
// links are all generated from it. Never type a site name anywhere else.
//
// type:      GH = group home, APT = supervised apartments, ATC = adult day
//            program, ICF = intermediate care facility, ADMIN = office
// landlord:  '' if Spectrum-owned. If populated, structural/exterior/HVAC
//            work orders route to the LANDLORD queue instead of Facilities.
// surveySensitive: true = CMS/DOH or DDD licensing exposure on physical
//            plant. Raises the priority floor. The ICF is surveyed by NJ DOH
//            under 42 CFR 483; community residences under N.J.A.C. 10:44A.

const SITES = [
  // --- Bergen County ---
  { name: 'Closter ICF',          town: 'Closter',       county: 'Bergen',    type: 'ICF',   address: '50 Blanch Ave',        landlord: '', surveySensitive: true  },
  { name: 'Closter Apts.',        town: 'Closter',       county: 'Bergen',    type: 'APT',   address: '19 Van Sciver St',     landlord: '', surveySensitive: true  },
  { name: 'Bergenfield Respite',  town: 'Bergenfield',   county: 'Bergen',    type: 'GH',    address: '',                     landlord: '', surveySensitive: true  },
  { name: 'Guttenberg',           town: 'Bergenfield',   county: 'Bergen',    type: 'GH',    address: '143 Mackay Dr',        landlord: '', surveySensitive: true  },
  { name: 'Northvale',            town: 'Northvale',     county: 'Bergen',    type: 'GH',    address: '',                     landlord: '', surveySensitive: true  },
  { name: 'Paramus',              town: 'Paramus',       county: 'Bergen',    type: 'GH',    address: '',                     landlord: '', surveySensitive: true  },
  { name: 'Norwood',              town: 'Norwood',       county: 'Bergen',    type: 'GH',    address: '',                     landlord: '', surveySensitive: true  },
  { name: 'River Vale Apts.',     town: 'River Vale',    county: 'Bergen',    type: 'APT',   address: '81 Rivervale Rd',      landlord: '', surveySensitive: true  },
  { name: 'RVCO (Main Office)',   town: 'River Vale',    county: 'Bergen',    type: 'ADMIN', address: '210 Rivervale Rd',     landlord: '', surveySensitive: false },
  { name: 'Glen Rock',            town: 'Glen Rock',     county: 'Bergen',    type: 'GH',    address: '',                     landlord: '', surveySensitive: true  },
  { name: 'Highwood',             town: 'Glen Rock',     county: 'Bergen',    type: 'GH',    address: '',                     landlord: '', surveySensitive: true  },
  { name: 'Hillsdale',            town: 'Hillsdale',     county: 'Bergen',    type: 'GH',    address: '',                     landlord: '', surveySensitive: true  },
  { name: 'Haworth',              town: 'Haworth',       county: 'Bergen',    type: 'GH',    address: '',                     landlord: '', surveySensitive: true  },
  { name: 'Maywood',              town: 'Maywood',       county: 'Bergen',    type: 'GH',    address: '',                     landlord: '', surveySensitive: true  },
  { name: 'Elmwood Park',         town: 'Elmwood Park',  county: 'Bergen',    type: 'GH',    address: '',                     landlord: '', surveySensitive: true  },
  { name: 'Rockleigh Apts.',      town: 'Rockleigh',     county: 'Bergen',    type: 'APT',   address: '',                     landlord: '', surveySensitive: true  },
  { name: 'Carver ATC',           town: 'Westwood',      county: 'Bergen',    type: 'ATC',   address: '91 Carver Ave',        landlord: '', surveySensitive: false },
  { name: 'Westwood GH',          town: 'Westwood',      county: 'Bergen',    type: 'GH',    address: '14 Lester Ave',        landlord: '', surveySensitive: true  },
  { name: 'Teaneck ATC',          town: 'Teaneck',       county: 'Bergen',    type: 'ATC',   address: '',                     landlord: 'Grace Lutheran Church', surveySensitive: false },

  // --- Passaic County ---
  { name: 'N. Haledon ATC',       town: 'North Haledon', county: 'Passaic',   type: 'ATC',   address: '',                     landlord: 'High Mountain Church',  surveySensitive: false },
  { name: 'Wayne',                town: 'Wayne',         county: 'Passaic',   type: 'GH',    address: '',                     landlord: '', surveySensitive: true  },
  { name: 'Ringwood ATC',         town: 'Ringwood',      county: 'Passaic',   type: 'ATC',   address: '30 Morris Rd',         landlord: '', surveySensitive: false },
  { name: 'Ringwood Apts.',       town: 'Ringwood',      county: 'Passaic',   type: 'APT',   address: '20 Morris Rd',         landlord: '', surveySensitive: true  },

  // --- Middlesex County ---
  { name: 'Edison 100',           town: 'Edison',        county: 'Middlesex', type: 'GH',    address: '100 Spectrum Dr',      landlord: '', surveySensitive: true  },
  { name: 'Edison ATC',           town: 'Edison',        county: 'Middlesex', type: 'ATC',   address: '200 Spectrum Dr',      landlord: '', surveySensitive: false },
  { name: 'Edison 300',           town: 'Edison',        county: 'Middlesex', type: 'GH',    address: '300 Spectrum Dr',      landlord: '', surveySensitive: true  },
  { name: 'Edison Condos',        town: 'Edison',        county: 'Middlesex', type: 'APT',   address: '',                     landlord: 'Waterford Condo Association', surveySensitive: true },
];

// Categories that become the landlord's problem at a leased site. Interior
// fixtures and appliances usually stay Spectrum's; building envelope, roof,
// structure, and base-building HVAC usually do not. Confirm against each
// lease before go-live — this list is the starting assumption, not the lease.
const LANDLORD_CATEGORIES = ['HVAC', 'Structural', 'Grounds', 'Fire/Life Safety'];

// ===========================================================================
// 4. CATEGORIES AND CONDITIONAL BRANCHING
// ===========================================================================
//
// Each category becomes its own form section. `followUps` are the questions
// that appear ONLY when that category is chosen — this is the conditional
// logic. Keep follow-ups to the few answers that change the dispatch decision:
// every extra question costs completion rate at 3am in a group home.
//
// key:       stable identifier, written to the sheet. Never rename after
//            go-live; the dashboard history keys off it.
// queue:     which team owns it.
// basePriority: the floor before symptom escalation is applied.
// followUps: [{ q, type, choices, required, escalateOn }]
//            escalateOn: answers that force P1. This is where a request
//            becomes an emergency without anyone having to self-declare it.

const CATEGORIES = [
  {
    key: 'HVAC',
    label: 'Heating, Cooling, Ventilation',
    queue: 'FACILITIES',
    basePriority: 'P3',
    followUps: [
      { q: 'What is happening?', type: 'LIST', required: true,
        choices: ['No heat', 'No cooling', 'Too hot / too cold', 'Thermostat not working',
                  'Unit making noise', 'Water leaking from unit', 'Poor airflow', 'Other'],
        escalateOn: ['No heat', 'No cooling'] },
      { q: 'Current indoor temperature (approximate, °F)', type: 'TEXT', required: false },
      { q: 'How much of the building is affected?', type: 'LIST', required: true,
        choices: ['One room', 'One floor / zone', 'Whole building'],
        escalateOn: ['Whole building'] },
    ],
  },
  {
    key: 'Plumbing',
    label: 'Plumbing and Water',
    queue: 'FACILITIES',
    basePriority: 'P3',
    followUps: [
      { q: 'What is happening?', type: 'LIST', required: true,
        choices: ['No water at all', 'No hot water', 'Active leak / flooding', 'Sewage backup',
                  'Toilet clogged or running', 'Drain slow or clogged', 'Fixture broken',
                  'Sump pump', 'Other'],
        escalateOn: ['No water at all', 'Active leak / flooding', 'Sewage backup'] },
      { q: 'Is water actively running or flooding right now?', type: 'LIST', required: true,
        choices: ['Yes', 'No'], escalateOn: ['Yes'] },
      { q: 'Have you shut off the water to the fixture?', type: 'LIST', required: false,
        choices: ['Yes', 'No', 'Could not locate the shutoff'] },
      { q: 'How many bathrooms are still usable at this site?', type: 'LIST', required: true,
        choices: ['All of them', 'Some — enough for now', 'None'],
        escalateOn: ['None'] },
    ],
  },
  {
    key: 'Electrical',
    label: 'Electrical and Power',
    queue: 'FACILITIES',
    basePriority: 'P2',
    followUps: [
      { q: 'What is happening?', type: 'LIST', required: true,
        choices: ['Total power outage', 'Partial outage / breaker tripping', 'Outlet or switch not working',
                  'Lighting out', 'Burning smell or sparking', 'Generator problem',
                  'Emergency lighting / exit sign out', 'Other'],
        escalateOn: ['Total power outage', 'Burning smell or sparking', 'Generator problem',
                     'Emergency lighting / exit sign out'] },
      { q: 'Is any medical or life-support equipment affected?', type: 'LIST', required: true,
        choices: ['Yes', 'No'], escalateOn: ['Yes'] },
      { q: 'If a breaker tripped, does it hold when reset?', type: 'LIST', required: false,
        choices: ['Holds', 'Trips again immediately', 'Did not attempt'],
        escalateOn: ['Trips again immediately'] },
    ],
  },
  {
    key: 'Fire/Life Safety',
    label: 'Fire and Life Safety',
    queue: 'FACILITIES',
    basePriority: 'P1',
    followUps: [
      { q: 'What is happening?', type: 'LIST', required: true,
        choices: ['Fire alarm sounding or in trouble', 'Smoke or CO detector fault',
                  'Sprinkler leak or damage', 'Extinguisher missing, discharged or expired',
                  'Exit door blocked or will not open', 'Emergency lighting out', 'Other'] },
      { q: 'Has the fire department or alarm company already been called?', type: 'LIST',
        required: true, choices: ['Yes', 'No'] },
    ],
  },
  {
    key: 'Doors/Locks/Security',
    label: 'Doors, Locks, Windows and Security',
    queue: 'FACILITIES',
    basePriority: 'P3',
    followUps: [
      { q: 'What is happening?', type: 'LIST', required: true,
        choices: ['Exterior door will not lock', 'Exterior door will not open', 'Interior door',
                  'Window broken or will not close', 'Lock or key problem', 'Keypad / fob reader',
                  'Camera or alarm system', 'Other'],
        escalateOn: ['Exterior door will not lock', 'Exterior door will not open',
                     'Window broken or will not close'] },
      { q: 'Can the building be secured tonight?', type: 'LIST', required: true,
        choices: ['Yes', 'No'], escalateOn: ['No'] },
    ],
  },
  {
    key: 'Accessibility',
    label: 'Accessibility and Adaptive Equipment',
    queue: 'FACILITIES',
    basePriority: 'P2',
    followUps: [
      { q: 'What equipment?', type: 'LIST', required: true,
        choices: ['Ramp', 'Grab bar or handrail', 'Ceiling lift / track', 'Accessible shower or tub',
                  'Automatic door opener', 'Adjustable bed frame', 'Wheelchair-accessible fixture',
                  'Other'],
        escalateOn: ['Ramp', 'Ceiling lift / track', 'Grab bar or handrail'] },
      { q: 'Is a workaround available while this is repaired?', type: 'LIST', required: true,
        choices: ['Yes', 'No'], escalateOn: ['No'] },
      // NOTE: patient lifts and personal DME may be clinical property, not
      // facilities. Routing question flagged in docs/OPERATIONS.md.
    ],
  },
  {
    key: 'Appliance',
    label: 'Appliances',
    queue: 'FACILITIES',
    basePriority: 'P3',
    followUps: [
      { q: 'Which appliance?', type: 'LIST', required: true,
        choices: ['Refrigerator', 'Freezer', 'Stove / oven', 'Microwave', 'Dishwasher',
                  'Washer', 'Dryer', 'Water heater', 'Other'],
        escalateOn: ['Refrigerator', 'Freezer', 'Water heater'] },
      { q: 'Asset tag or serial number (if visible)', type: 'TEXT', required: false },
      { q: 'Is food storage or meal service affected right now?', type: 'LIST', required: true,
        choices: ['Yes', 'No'], escalateOn: ['Yes'] },
    ],
  },
  {
    key: 'Structural',
    label: 'Structural, Walls, Floors, Ceilings, Roof',
    queue: 'FACILITIES',
    basePriority: 'P3',
    followUps: [
      { q: 'What is affected?', type: 'LIST', required: true,
        choices: ['Roof leak', 'Ceiling damage or sagging', 'Wall damage', 'Floor damage or trip hazard',
                  'Stairs or railing', 'Cabinet or countertop', 'Other'],
        escalateOn: ['Roof leak', 'Ceiling damage or sagging', 'Stairs or railing'] },
      { q: 'Is the area a trip, fall or collapse hazard right now?', type: 'LIST', required: true,
        choices: ['Yes', 'No'], escalateOn: ['Yes'] },
    ],
  },
  {
    key: 'Pest',
    label: 'Pest Control',
    queue: 'FACILITIES',
    basePriority: 'P3',
    followUps: [
      { q: 'What was seen?', type: 'LIST', required: true,
        choices: ['Rodent', 'Roach', 'Ant', 'Bed bug', 'Wasp / bee nest', 'Other'],
        escalateOn: ['Bed bug', 'Rodent'] },
      { q: 'Where?', type: 'LIST', required: true,
        choices: ['Kitchen or food area', 'Bedroom', 'Bathroom', 'Common area', 'Exterior', 'Other'],
        escalateOn: ['Kitchen or food area', 'Bedroom'] },
      { q: 'How often is it being seen?', type: 'LIST', required: false,
        choices: ['First sighting', 'Several times this week', 'Ongoing for weeks'] },
    ],
  },
  {
    key: 'Grounds',
    label: 'Grounds, Exterior, Snow and Ice',
    queue: 'FACILITIES',
    basePriority: 'P3',
    followUps: [
      { q: 'What is needed?', type: 'LIST', required: true,
        choices: ['Snow or ice removal', 'Walkway or parking hazard', 'Landscaping / overgrowth',
                  'Fence or gate', 'Exterior lighting', 'Drainage or standing water', 'Other'],
        escalateOn: ['Snow or ice removal', 'Walkway or parking hazard'] },
      { q: 'Does this block an accessible entrance or exit route?', type: 'LIST', required: true,
        choices: ['Yes', 'No'], escalateOn: ['Yes'] },
    ],
  },
  {
    key: 'Fleet',
    label: 'Vehicle and Fleet',
    queue: 'FLEET',
    basePriority: 'P3',
    followUps: [
      { q: 'Vehicle number or license plate', type: 'TEXT', required: true },
      { q: 'Current odometer reading', type: 'TEXT', required: false },
      { q: 'What is happening?', type: 'LIST', required: true,
        choices: ['Will not start', 'Warning light on', 'Brakes', 'Tires', 'Wheelchair lift or ramp',
                  'Body damage', 'Heating or AC', 'Scheduled service due', 'Other'],
        escalateOn: ['Will not start', 'Brakes', 'Wheelchair lift or ramp'] },
      { q: 'Is the vehicle safe to drive?', type: 'LIST', required: true,
        choices: ['Yes', 'No', 'Not sure'], escalateOn: ['No', 'Not sure'] },
      { q: 'Does this affect scheduled program transportation today?', type: 'LIST', required: true,
        choices: ['Yes', 'No'], escalateOn: ['Yes'] },
    ],
  },
  {
    key: 'IT',
    label: 'Technology, Phones and Network',
    queue: 'IT',
    basePriority: 'P3',
    followUps: [
      { q: 'What is affected?', type: 'LIST', required: true,
        choices: ['Internet or Wi-Fi down', 'Phone system', 'Computer or laptop', 'Printer',
                  'Software or account access', 'Email', 'Tablet / mobile device',
                  'Door access or camera system', 'Other'],
        escalateOn: ['Internet or Wi-Fi down', 'Phone system'] },
      { q: 'How many people are affected?', type: 'LIST', required: true,
        choices: ['Just me', 'A few people', 'Everyone at this site'],
        escalateOn: ['Everyone at this site'] },
      { q: 'Does this stop documentation, billing or medication records?', type: 'LIST',
        required: true, choices: ['Yes', 'No'], escalateOn: ['Yes'] },
    ],
  },
  {
    key: 'Furniture',
    label: 'Furniture and Fixtures',
    queue: 'FACILITIES',
    basePriority: 'P4',
    followUps: [
      { q: 'What item?', type: 'TEXT', required: true },
      { q: 'Is this a repair or a replacement request?', type: 'LIST', required: true,
        choices: ['Repair', 'Replacement', 'New purchase request'] },
      // Without this, a collapsing chair or a broken bed rail would sit in the
      // P4 queue for thirty days.
      { q: 'Is the item a safety hazard right now — broken, sharp or unstable?',
        type: 'LIST', required: true, choices: ['Yes', 'No'], escalateOn: ['Yes'] },
    ],
  },
  {
    key: 'Other',
    label: 'Something else',
    queue: 'FACILITIES',
    basePriority: 'P3',
    followUps: [
      { q: 'Which team should see this?', type: 'LIST', required: true,
        choices: ['Facilities', 'Fleet', 'IT', 'Not sure'] },
      // "Other" is the catch-all, which makes it the most likely place for a
      // real emergency to be misfiled. Without these two questions an urgent
      // problem reported here would sit at P3 for five business days.
      { q: 'Is anyone unsafe or at risk of injury right now?', type: 'LIST',
        required: true, choices: ['Yes', 'No'], escalateOn: ['Yes'] },
      { q: 'Can the site keep operating normally until this is fixed?', type: 'LIST',
        required: true, choices: ['Yes', 'No'], escalateOn: ['No'] },
    ],
  },
];

// ===========================================================================
// 5. PRIORITY AND SLA
// ===========================================================================
//
// Priority is DERIVED, never self-selected. Self-declared urgency is the
// single most common failure in maintenance intake: everything becomes
// urgent, and the queue loses all signal. Staff answer factual questions;
// the system decides severity.
//
// respondHrs:  acknowledge and communicate an ETA
// resolveHrs:  work complete
// clock:       WALL = 24/7 elapsed time (group homes do not close)
//              BIZ  = business hours only

const PRIORITIES = {
  P1: { label: 'P1 — Emergency',  respondHrs: 1,  resolveHrs: 4,   clock: 'WALL', color: '#C5221F' },
  P2: { label: 'P2 — Urgent',     respondHrs: 4,  resolveHrs: 24,  clock: 'WALL', color: '#E8710A' },
  P3: { label: 'P3 — Routine',    respondHrs: 24, resolveHrs: 120, clock: 'BIZ',  color: '#188038' },
  P4: { label: 'P4 — Scheduled',  respondHrs: 72, resolveHrs: 480, clock: 'BIZ',  color: '#1A73E8' },
};

const PRIORITY_ORDER = ['P1', 'P2', 'P3', 'P4'];

// Business day definition for BIZ-clock SLAs.
const BUSINESS_HOURS = { startHour: 8, endHour: 16, workDays: [1, 2, 3, 4, 5] };

// A survey-sensitive site cannot sit below this priority — but ONLY for the
// categories that actually carry survey exposure. Physical-plant findings at
// the ICF are citable under 42 CFR 483; community residences carry equivalent
// exposure under N.J.A.C. 10:44A. A broken desk chair is not a survey finding,
// and flooring every request at a licensed site to P2 would put ~90% of the
// queue in one bucket and destroy the signal the priority model exists to give.
const SURVEY_SENSITIVE_FLOOR = 'P2';
// Scoped tightly on purpose. Pest, Appliance, Doors and Grounds are deliberately
// NOT here: their escalateOn answers already catch the survey-relevant cases
// precisely (bed bugs in a bedroom, a failed refrigerator, an exterior door that
// will not lock, ice across an accessible exit). Adding the category floor on top
// would blunt that — it would make a few ants outside a building, or a broken
// microwave, into 24-hour urgent work and bury the cases that matter.
const SURVEY_SENSITIVE_CATEGORIES = [
  'Fire/Life Safety', 'Plumbing', 'Electrical', 'HVAC',
  'Structural', 'Accessibility',
];

// ===========================================================================
// 6. STATUS MODEL
// ===========================================================================
//
// Status is driven by the checkboxes, not typed. A tech ticking a box is the
// only thing that moves a work order. Nobody maintains a status column by
// hand — that is what makes this survive contact with a busy week.

const CHECKBOX_STEPS = [
  { col: 'Acknowledged',   status: 'Acknowledged',    stopsResponseClock: true,  notifyRequester: true  },
  { col: 'Parts Ordered',  status: 'Awaiting Parts',  stopsResponseClock: false, notifyRequester: false },
  { col: 'Vendor Called',  status: 'Vendor Dispatched', stopsResponseClock: false, notifyRequester: false },
  { col: 'On Site',        status: 'In Progress',     stopsResponseClock: false, notifyRequester: false },
  { col: 'Work Complete',  status: 'Work Complete',   stopsResponseClock: false, notifyRequester: true  },
  { col: 'Site Verified',  status: 'Verified',        stopsResponseClock: false, notifyRequester: false },
  { col: 'Closed',         status: 'Closed',          stopsResponseClock: false, notifyRequester: true  },
];

const TERMINAL_STATUSES = ['Closed', 'Cancelled', 'Duplicate', 'Landlord Referred'];

// ===========================================================================
// 7. DUPLICATE DETECTION
// ===========================================================================
// Group homes routinely report the same broken dryer three times in a week.
// A new request at the same site, same category, inside this window, while an
// earlier one is still open, gets flagged for the dispatcher rather than
// silently creating a second work order.

const DUPLICATE_WINDOW_DAYS = 14;

// ===========================================================================
// 8. PRIVACY GUARD
// ===========================================================================
//
// HIPAA: a maintenance form open to 688 staff WILL collect protected health
// information in free-text fields unless it is designed against. The form
// instructs staff to describe the room and the equipment, never the person.
// This heuristic flags likely PHI for review. It is a safety net with real
// limits — it will miss things and it will produce false positives. It does
// not replace the instruction, and it does not replace a signed BAA.

const PHI_GUARD = {
  ENABLED: true,
  // Terms that suggest a person is being described rather than a place.
  TERMS: ['resident', 'consumer', 'client', 'individual served', 'patient',
          'diagnosis', 'medication', 'behavior plan', 'seizure', 'incident report',
          'medicaid', 'dob', 'date of birth'],
  // Structural patterns: dates of birth, long ID numbers, SSN shapes.
  PATTERNS: [
    /\b\d{2}\/\d{2}\/\d{4}\b/,
    /\b\d{3}-\d{2}-\d{4}\b/,
    /\b\d{9,}\b/,
  ],
};

// ===========================================================================
// 9. SHEET NAMES
// ===========================================================================

const SHEETS = {
  RAW: 'Form Responses (do not edit)',
  LOG: 'WO Log',
  CLOSEOUT: 'Close-Out Responses (do not edit)',
  CONFIG: 'Config',
  ASSETS: 'Asset Registry',
  DASH: 'Dashboard',
  AUDIT: 'Audit Trail',
};

// Column order for the WO Log. Index positions are resolved by name at
// runtime, so inserting a column here does not break the code — but do not
// rename an existing header without updating any saved views or filters.
const LOG_COLUMNS = [
  'WO #', 'Status', 'Priority', 'Queue', 'Submitted', 'SLA Respond By', 'SLA Resolve By',
  'SLA State', 'Site', 'Town', 'County', 'Site Type', 'Area / Room', 'Category',
  'Symptom', 'Description', 'Photo', 'Requester', 'Requester Email', 'Requester Phone',
  'Assigned To', 'Acknowledged', 'Ack At', 'Parts Ordered', 'Vendor Called', 'On Site',
  'Work Complete', 'Site Verified', 'Closed', 'Closed At', 'Labor Hours', 'Parts Cost',
  'Vendor', 'Vendor Cost', 'Total Cost', 'Resolution Code', 'Resolution Notes',
  'Asset Tag', 'Duplicate Of', 'Survey Sensitive', 'Landlord', 'PHI Review', 'Last Updated',
];

const RESOLUTION_CODES = [
  'Repaired in house', 'Repaired by vendor', 'Part replaced', 'Unit replaced',
  'Adjusted / reset', 'No fault found', 'User error / training given',
  'Referred to landlord', 'Deferred to capital project', 'Duplicate', 'Cancelled by requester',
];
