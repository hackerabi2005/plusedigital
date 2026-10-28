const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');
const querystring = require('querystring');

const PORT = process.env.PORT || 3000;
function findDir(dirName) {
  const candidates = [
    path.join(__dirname, dirName),
    path.join(__dirname, '..', dirName),
    path.join(process.cwd(), dirName),
    path.join(process.cwd(), 'api', dirName)
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return path.join(__dirname, dirName);
}

const ASSETS_DIR = findDir('captured-public-assets');
const PAGES_DIR = findDir('cleaned-pages');
const PARTIALS_DIR = findDir('cleaned-partials');
const CAPTURED_PAGES_DIR = findDir('captured-pages');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.otf': 'font/otf'
};

// In-memory clinic state initialized with real captured clinic data from mydigitalclinic.net
const state = {
  doctor: {
    userId: '17472',
    name: 'Dr. Naveena Ramnath',
    email: 'drnaveenaramnath@gmail.com',
    locations: [
      { id: '1396', name: 'Band lane, ooty' },
      { id: '1395', name: ' Vaiyapuri Nagar,Kurumbpalayam' }
    ]
  },
  patients: [
    { id: '2223997', title: 'Ms.', firstName: 'Yalini', lastName: '', fullName: 'Ms.  Yalini', gender: '2', mobile: '7548801024', email: 'yalini@patient.com', fileNumber: '7241', locationId: '1395', locationName: ' Vaiyapuri Nagar,Kurumbpalayam', addedDate: '24/10/2026', avatar: 'Y', color: 'rgb(203, 127, 217)' },
    { id: '2223851', title: 'Mr.', firstName: 'Abrahamthomas', lastName: '', fullName: 'Mr. Abrahamthomas', gender: '1', mobile: '9842210451', email: 'abraham@patient.com', fileNumber: '7240', locationId: '1395', locationName: ' Vaiyapuri Nagar,Kurumbpalayam', addedDate: '23/10/2026', avatar: 'A', color: 'rgb(165, 118, 224)' },
    { id: '2223790', title: 'Mr.', firstName: 'Ramkumar', lastName: '', fullName: 'Mr. Ramkumar', gender: '1', mobile: '9843055120', email: '', fileNumber: '7239', locationId: '1395', locationName: ' Vaiyapuri Nagar,Kurumbpalayam', addedDate: '22/10/2026', avatar: 'R', color: 'rgb(245, 96, 145)' },
    { id: '2223712', title: 'Mr.', firstName: 'Rithikyogesh', lastName: '', fullName: 'Mr. Rithikyogesh', gender: '1', mobile: '9789412365', email: '', fileNumber: '7238', locationId: '1395', locationName: ' Vaiyapuri Nagar,Kurumbpalayam', addedDate: '21/10/2026', avatar: 'R', color: 'rgb(245, 96, 145)' },
    { id: '2223645', title: 'Mr.', firstName: 'Sudhakar', lastName: '', fullName: 'Mr. Sudhakar', gender: '1', mobile: '9443211890', email: '', fileNumber: '7237', locationId: '1395', locationName: ' Vaiyapuri Nagar,Kurumbpalayam', addedDate: '20/10/2026', avatar: 'S', color: 'rgb(96, 182, 245)' },
    { id: '2223598', title: 'Mr.', firstName: 'Yadvik', lastName: '', fullName: 'Mr. Yadvik', gender: '1', mobile: '9944123098', email: '', fileNumber: '7236', locationId: '1395', locationName: ' Vaiyapuri Nagar,Kurumbpalayam', addedDate: '19/10/2026', avatar: 'Y', color: 'rgb(203, 127, 217)' },
    { id: '2223510', title: 'Mr.', firstName: 'Revathi', lastName: '', fullName: 'Mr. Revathi', gender: '2', mobile: '9629811450', email: '', fileNumber: '7235', locationId: '1395', locationName: ' Vaiyapuri Nagar,Kurumbpalayam', addedDate: '18/10/2026', avatar: 'R', color: 'rgb(245, 96, 145)' },
    { id: '2223442', title: 'Mrs.', firstName: 'Susheela', lastName: '', fullName: 'Mrs. Susheela', gender: '2', mobile: '9486122340', email: '', fileNumber: '7234', locationId: '1395', locationName: ' Vaiyapuri Nagar,Kurumbpalayam', addedDate: '17/10/2026', avatar: 'S', color: 'rgb(96, 182, 245)' },
    { id: '2223389', title: 'Mr.', firstName: 'Ramesh', lastName: '', fullName: 'Mr. Ramesh', gender: '1', mobile: '9894011223', email: '', fileNumber: '7233', locationId: '1395', locationName: ' Vaiyapuri Nagar,Kurumbpalayam', addedDate: '16/10/2026', avatar: 'R', color: 'rgb(245, 96, 145)' },
    { id: '2223310', title: 'Mr.', firstName: 'Ramadas. K', lastName: '', fullName: 'Mr. Ramadas. K', gender: '1', mobile: '9442155678', email: '', fileNumber: '7232', locationId: '1395', locationName: ' Vaiyapuri Nagar,Kurumbpalayam', addedDate: '15/10/2026', avatar: 'R', color: 'rgb(245, 96, 145)' }
  ],
  checkins: [
    {
      checkInId: '1281426',
      patientId: '2223997',
      patientName: 'Ms.  Yalini',
      mobile: '7548801024',
      doctorId: '17472',
      doctorName: 'Dr. Naveena Ramnath',
      time: '11:33 PM',
      consultationCode: 'dental'
    }
  ],
  appointments: [
    {
      id: '900101',
      patientId: '2223997',
      title: 'Ms.  Yalini',
      mobile: '7548801024',
      doctorId: '17472',
      doctorName: 'Dr. Naveena Ramnath',
      locationId: '1395',
      locationName: ' Vaiyapuri Nagar,Kurumbpalayam',
      date: '24/10/2026',
      time: '11:30 AM',
      duration: 30,
      treatment: 'Root Canal Treatment (RCT), Scaling',
      consultationCode: 'dental'
    },
    {
      id: '900102',
      patientId: '2223851',
      title: 'Mr.  Abrahamthomas',
      mobile: '9840123456',
      doctorId: '17472',
      doctorName: 'Dr. Naveena Ramnath',
      locationId: '1395',
      locationName: ' Band lane, ooty',
      date: '24/10/2026',
      time: '02:15 PM',
      duration: 15,
      treatment: 'Consultation',
      consultationCode: 'dental'
    },
    {
      id: '900103',
      patientId: '2223790',
      title: 'Mr.  Ramkumar S',
      mobile: '9443217890',
      doctorId: '17472',
      doctorName: 'Dr. Naveena Ramnath',
      locationId: '1395',
      locationName: ' Band lane, ooty',
      date: '24/10/2026',
      time: '04:00 PM',
      duration: 15,
      treatment: 'Consultation',
      consultationCode: 'dental'
    }
  ],
  dentalConditions: [
    { id: 1, teeth: '16, 26', conditionId: '1', conditionName: 'Caries', date: '24/10/2026' }
  ],
  dentalProcedures: [
    { id: 1, teeth: '16', name: 'Root Canal Treatment (RCT)', cost: 3500, discount: 0, total: 3500, notes: 'Single sitting RCT' },
    { id: 2, teeth: 'All', name: 'Full Mouth Ultrasonic Scaling', cost: 1200, discount: 200, total: 1000, notes: 'Prophylaxis completed' }
  ],
  prescriptions: [
    { id: 1, medicine: 'Tab. Amoxicillin 500mg', dosage: '1-0-1', duration: '5 Days', instruction: 'After Food' },
    { id: 2, medicine: 'Tab. Zerodol-SP', dosage: '1-0-1', duration: '3 Days', instruction: 'After Food' },
    { id: 3, medicine: 'Hexidine Mouthwash (0.2%)', dosage: '10ml rinse', duration: '7 Days', instruction: 'Twice daily after brushing' }
  ],
  notes: [
    { id: 1, date: '24/10/2026', note: 'Patient reported tenderness on tooth 16 during mastication. Cold test positive. Indicated single-sitting RCT.' }
  ],
  users: [
    { id: '17472', name: 'Dr. Naveena Ramnath', role: 'Doctor / Clinic Admin', email: 'drnaveenaramnath@gmail.com', mobile: '9842210451', status: 'Active' },
    { id: '17473', name: 'Dr. K. Ramadas (Consultant)', role: 'Endodontist', email: 'ramadas@mydigitalclinic.net', mobile: '9442155678', status: 'Active' },
    { id: '17474', name: 'Mrs. Priya S.', role: 'Dental Assistant / Receptionist', email: 'priya@mydigitalclinic.net', mobile: '9789412365', status: 'Active' }
  ],
  locationsList: [
    { id: '1395', code: 'LOC-01', name: 'Vaiyapuri Nagar, Kurumbpalayam', city: 'Coimbatore', phone: '+91 98422 10451', status: 'Primary Active' },
    { id: '1396', code: 'LOC-02', name: 'Band lane, ooty', city: 'Ooty', phone: '+91 98430 55120', status: 'Active Branch' }
  ],
  feesList: [
    { id: 1, name: 'General Dental Consultation', code: 'CON-01', amount: '₹500', tax: '0%', status: 'Active' },
    { id: 2, name: 'Specialist Consultation (Endo/Ortho)', code: 'CON-02', amount: '₹800', tax: '0%', status: 'Active' },
    { id: 3, name: 'Follow-up / Review Visit', code: 'CON-03', amount: '₹300', tax: '0%', status: 'Active' },
    { id: 4, name: 'Emergency Tooth Relief Visit', code: 'CON-04', amount: '₹1,000', tax: '0%', status: 'Active' }
  ],
  appointmentTimingsList: [
    { day: 'Monday to Saturday', slot1: '09:00 AM - 01:00 PM', slot2: '04:00 PM - 08:30 PM', slotDuration: '15 Mins', status: 'Open' },
    { day: 'Sunday', slot1: '10:00 AM - 01:00 PM (Prior Appointment Only)', slot2: 'Closed', slotDuration: '30 Mins', status: 'Half Day' }
  ],
  consentsList: [
    { id: 1, title: 'General Dental Treatment Informed Consent', code: 'CONS-GEN', languages: 'English, Tamil', version: 'v2.1', status: 'Active' },
    { id: 2, title: 'Root Canal Treatment (RCT) Agreement', code: 'CONS-RCT', languages: 'English, Tamil', version: 'v1.4', status: 'Active' },
    { id: 3, title: 'Orthodontic / Clear Aligner Consent Form', code: 'CONS-ORTHO', languages: 'English', version: 'v2.0', status: 'Active' },
    { id: 4, title: 'Surgical Extraction & Minor Oral Surgery Consent', code: 'CONS-SURG', languages: 'English, Tamil', version: 'v1.8', status: 'Active' }
  ],
  groupsList: [
    { id: 1, name: 'Regular Patients', count: 48, discount: '0%', status: 'Active' },
    { id: 2, name: 'Orthodontic / Braces Patients', count: 14, discount: '5%', status: 'Active' },
    { id: 3, name: 'Implant Care Club', count: 9, discount: '10%', status: 'Active' },
    { id: 4, name: 'Pediatric Dental Care', count: 22, discount: '0%', status: 'Active' }
  ],
  proceduresMasterList: [
    { id: 1, code: 'RCT-01', name: 'Root Canal Treatment (Single Sitting)', category: 'Endodontics', cost: '₹3,500', status: 'Active' },
    { id: 2, code: 'SCL-01', name: 'Full Mouth Ultrasonic Scaling & Polishing', category: 'Periodontics', cost: '₹1,200', status: 'Active' },
    { id: 3, code: 'CRN-01', name: 'Zirconia / Ceramic Dental Crown', category: 'Prosthodontics', cost: '₹6,000', status: 'Active' },
    { id: 4, code: 'FIL-01', name: 'Light-Cure Composite Tooth Filling', category: 'Restorative', cost: '₹1,000', status: 'Active' },
    { id: 5, code: 'EXT-01', name: 'Simple Tooth Extraction', category: 'Oral Surgery', cost: '₹800', status: 'Active' },
    { id: 6, code: 'IMP-01', name: 'Titanium Dental Implant (Osseointegrated)', category: 'Implantology', cost: '₹28,000', status: 'Active' }
  ],
  medicalConditionsMaster: [
    { id: 1, name: 'Diabetes Mellitus (Type 2)', alertLevel: 'High', flag: 'Monitor Blood Glucose before surgery', status: 'Active' },
    { id: 2, name: 'Hypertension', alertLevel: 'High', flag: 'Avoid Epinephrine retraction cords if BP > 160/100', status: 'Active' },
    { id: 3, name: 'Penicillin Allergy', alertLevel: 'Critical', flag: 'Do NOT prescribe Amoxicillin / Augmentin', status: 'Active' },
    { id: 4, name: 'Bleeding Disorders / Anticoagulant Therapy', alertLevel: 'Critical', flag: 'Check INR before surgical extraction', status: 'Active' },
    { id: 5, name: 'Asthma', alertLevel: 'Medium', flag: 'Patient must carry inhaler to every visit', status: 'Active' }
  ],
  remediesMasterList: [
    { id: 1, name: 'Tab. Amoxicillin 500mg', generic: 'Amoxicillin Trihydrate', defaultDosage: '1-0-1 for 5 days after food', category: 'Antibiotic' },
    { id: 2, name: 'Tab. Zerodol-SP', generic: 'Aceclofenac + Paracetamol + Serratiopeptidase', defaultDosage: '1-0-1 for 3 days after food', category: 'Analgesic / Anti-inflammatory' },
    { id: 3, name: 'Hexidine Mouthwash (0.2%)', generic: 'Chlorhexidine Gluconate', defaultDosage: '10ml rinse twice daily for 7 days', category: 'Antiseptic Mouthwash' },
    { id: 4, name: 'Tab. Pantocid 40mg', generic: 'Pantoprazole', defaultDosage: '1-0-0 empty stomach for 5 days', category: 'Antacid / PPI' }
  ],
  suppliersList: [
    { id: 1, name: 'Apex Dental Craft Lab', contactPerson: 'Mr. Saravanan', phone: '+91 94433 88120', city: 'Coimbatore', category: 'Ceramic & Zirconia Lab' },
    { id: 2, name: 'Prime Ortho Dental Depot', contactPerson: 'Ms. Meenakshi', phone: '+91 98410 44210', city: 'Chennai', category: 'Dental Materials & Consumables' },
    { id: 3, name: 'Kavitha Surgical Instruments', contactPerson: 'Mr. R. Mani', phone: '+91 98944 12390', city: 'Coimbatore', category: 'Surgical Autoclave & Handpieces' }
  ],
  referralsList: [
    { id: 1, name: 'Dr. Senthil Kumar (MDS)', specialty: 'Oral & Maxillofacial Surgeon', hospital: 'Coimbatore Smile Centre', phone: '+91 98422 77110' },
    { id: 2, name: 'Dr. Ananya Natarajan (MDS)', specialty: 'Orthodontist & Dentofacial Orthopedics', hospital: 'Nilgiris Dental Care', phone: '+91 98940 55230' }
  ],
  packageRemediesList: [
    { id: 1, name: 'Post-RCT Care Kit', items: 'Tab. Zerodol-SP, Tab. Amoxicillin 500mg, Hexidine Mouthwash', indications: 'Post root canal obturation pain and infection control' },
    { id: 2, name: 'Post-Extraction Healing Bundle', items: 'Tab. Paracetamol 650mg, Hexidine 0.2% Rinse, Sterile Gauze', indications: 'Post surgical extraction' }
  ],
  communicationsList: [
    { id: 1, date: '24/10/2026 10:35 AM', type: 'SMS', recipient: 'Ms. Yalini (7548801024)', message: 'Dear Yalini, your appointment with Dr. Naveena Ramnath is confirmed for 24/10/2026 at 10:30 AM.', status: 'Delivered' },
    { id: 2, date: '24/10/2026 11:45 AM', type: 'SMS', recipient: 'Ms. Yalini (7548801024)', message: 'Dear Yalini, bill #INV-7241 for ₹4,500 has been generated. Thank you for visiting Dr. Naveena Ramnath Clinic.', status: 'Delivered' },
    { id: 3, date: '23/10/2026 04:32 PM', type: 'SMS', recipient: 'Mr. Abrahamthomas (9842210451)', message: 'Dear Abrahamthomas, your appointment reminder for 24/10/2026 at 04:30 PM.', status: 'Delivered' }
  ]
};

function readPartial(name) {
  const p = path.join(PARTIALS_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function readPage(name) {
  const p = path.join(PAGES_DIR, name);
  return fs.existsSync(p) ? fs.readFileSync(p, 'utf8') : '';
}

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const ct = (req.headers['content-type'] || '').toLowerCase();
      if (ct.includes('application/json')) {
        try { resolve(JSON.parse(body || '{}')); } catch { resolve({}); }
      } else {
        resolve(querystring.parse(body));
      }
    });
  });
}

const GLOBAL_LAYOUT_FIX = `
<style id="layout-fix">
  /* Universal Header & Content Spacing Fix: eliminates overlapping and hidden top toolbars */
  .content-wrapper, .right-side, .mainContentRow, .main-content-area {
    padding-top: 75px !important;
  }
  .header, .navbar-fixed-top, .navbar-static-top {
    z-index: 1040 !important;
  }
  body {
    overflow-x: hidden !important;
  }
  /* Ensure sidebar icons are visible and interactive */
  #menuAppointmentList, #menuSearch, #bulkMessage {
    display: list-item !important;
  }
  .sidebar-menu li a {
    cursor: pointer !important;
  }
</style>
`;

function sendHtml(res, html, statusCode = 200) {
  // Inject global layout fix if not already present
  let output = html;
  if (!output.includes('id="layout-fix"') && output.includes('</head>')) {
    output = output.replace('</head>', `${GLOBAL_LAYOUT_FIX}</head>`);
  }
  res.writeHead(statusCode, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
  res.end(output);
}

function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-cache' });
  if (typeof data === 'string') {
    const trimmed = data.trim();
    if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
      res.end(trimmed);
      return;
    }
    res.end(JSON.stringify(data));
    return;
  }
  res.end(JSON.stringify(data));
}

function formatDDMMYYYY(d) {
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

function parseDDMMYYYY(str) {
  if (!str) return new Date(2026, 9, 24);
  const parts = str.split('/');
  if (parts.length === 3) {
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  }
  return new Date(2026, 9, 24);
}

function buildDayScrollHtml(startOffset = 0) {
  const baseDate = new Date(2026, 9, 24); // Oct 24, 2026 matching captured DOM
  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  let itemsHtml = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() + startOffset + i);
    const dateStr = formatDDMMYYYY(d);
    const dayName = dayNames[d.getDay()];
    const dayNum = String(d.getDate()).padStart(2, '0');
    const isToday = (startOffset + i === 0);
    const selectedClass = (i === 0) ? ' selectedDayScrollItem' : '';
    const borderStyle = (i === 0) ? ' style="border-bottom: 2px solid rgb(29, 127, 255);"' : '';
    const badgeClass = isToday ? ' badge badge-pill badge-danger BaToday' : '';
    itemsHtml += `    <div class="col-2 DayScrollItem${selectedClass}" data-appointmentdate="${dateStr}" onclick="GetAppointmentTimings(('${dateStr}'),this)"${borderStyle}><span class="daySpan">${dayName}</span> <span class="dateSpan${badgeClass}">${dayNum}</span></div>\n`;
  }
  return itemsHtml;
}

function buildAppointmentTimingsHtml(dateStr) {
  let baseHtml = readPartial('appointment_timings.html');
  const targetDate = dateStr || '24/10/2026';
  const bookedTimes = new Set(
    state.appointments
      .filter(a => a.date === targetDate || (!dateStr && a.date === '24/10/2026'))
      .map(a => a.time.replace(/^0/, '').trim())
  );

  baseHtml = baseHtml.replace(
    /<a class="AppointmentTime bookedAppointment d-flex"><span class="AppointmentDot BookedAppointmentTransparent">•<\/span>\s*([0-9]{2}:[0-9]{2}\s*[AP]M)<\/a>/g,
    (full, timeRaw) => {
      const normalized = timeRaw.replace(/^0/, '').trim();
      if (bookedTimes.has(normalized) || bookedTimes.has(timeRaw.trim())) {
        return `<a tabindex="0" class="AppointmentTime bookedAppointment d-flex" data-toggle="popover" style="cursor:pointer;"><span class="AppointmentDot BookedAppointmentColor1">•</span>  ${timeRaw}</a>`;
      }
      if (timeRaw === '09:00 AM' || timeRaw === '09:15 AM') {
        return full;
      }
      return `<a class="AppointmentTime NoAppointment d-flex" style="cursor:pointer;"><span class="AppointmentDot BookedAppointmentTransparent">•</span>  ${timeRaw}</a>`;
    }
  );
  return baseHtml;
}

function buildPopoverHtml(dateStr, timeStr) {
  const normTime = (timeStr || '').replace(/^0/, '').trim();
  const appt = state.appointments.find(a => a.time.replace(/^0/, '').trim() === normTime) || (normTime.includes('10:30') ? {
    id: '900101',
    patientId: '2223997',
    title: 'Ms.  Yalini',
    mobile: '7548801024',
    doctorName: 'Dr. Naveena Ramnath',
    locationName: ' Vaiyapuri Nagar,Kurumbpalayam',
    date: dateStr || '24/10/2026',
    time: '10:30 AM',
    treatment: 'Root Canal Treatment (RCT), Scaling'
  } : state.appointments[0]) || {
    id: '900101',
    patientId: '2223997',
    title: 'Ms.  Yalini',
    mobile: '7548801024',
    doctorName: 'Dr. Naveena Ramnath',
    locationName: ' Vaiyapuri Nagar,Kurumbpalayam',
    date: dateStr || '24/10/2026',
    time: timeStr || '10:30 AM',
    treatment: 'Root Canal Treatment (RCT)'
  };
  return `<div style="padding:10px;width:280px;font-family:Roboto,sans-serif;">
    <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #eee;padding-bottom:6px;margin-bottom:8px;">
      <a href="/patient/detail?patientid=${appt.patientId}" style="font-weight:500;color:#1d7fff;font-size:15px;">${appt.title}</a>
      <span style="font-size:12px;color:#666;"><i class="far fa-clock"></i> ${appt.time}</span>
    </div>
    <div style="font-size:13px;color:#555;margin-bottom:4px;"><i class="fas fa-mobile-alt" style="width:18px;"></i> ${appt.mobile}</div>
    <div style="font-size:13px;color:#555;margin-bottom:4px;"><img src="/Content/images/svg/doctor.svg" style="width:15px;height:15px;margin-right:3px;"> ${appt.doctorName}</div>
    <div style="font-size:13px;color:#555;margin-bottom:8px;"><i class="fas fa-stethoscope" style="width:18px;"></i> ${appt.treatment || 'Consultation'}</div>
    <div style="display:flex;gap:8px;padding-top:6px;border-top:1px solid #eee;">
      <a href="/dental/consultation?patientid=${appt.patientId}" class="btn btn-sm btn-primary CustomButton" style="font-size:11px;padding:4px 8px;">Start Consultation</a>
      <a href="/patient/detail?patientid=${appt.patientId}" class="btn btn-sm CustomButton" style="font-size:11px;padding:4px 8px;">View Profile</a>
    </div>
  </div>`;
}

function buildTodayAppointmentsHtml() {
  let html = readPartial('todayappointments.html');
  if (state.appointments.length === 0) return html;
  const rows = state.appointments.map((a) => `
    <tr>
      <td class="btnAppointment" style="width:4%; background-color:#ffffff !important;border-top:none!important;" align="center" valign="middle">
        <button type="button" class="btn define_btn define-Appointment-circle today_color color1" style="background:#9b6ce8;"></button>
      </td>
      <td class="list-group-heading AppointmentListContainer" valign="middle" style="border-top:none!important;">
        <div class="row ml-3 pb-2 pt-2" style="border-bottom:1px solid #ececec;">
          <div class="w-85" style="padding-right:10px;">
            <div style="display:flex;" class="atDetails">
              <a href="/patient/detail?patientid=${a.patientId}" style="padding-left:3px !important" class="heading_today AlPatientName w-75">${a.title}</a>
              <div class="AlTime d-flex w-25"><i class="far fa-clock AlIcons"></i> <span class="pl-2">${a.time}</span></div>
            </div>
            <div class="collapse" id="appt_${a.id}" style="padding-top:5px;">
              <div class="subheading_today desktopMobileLink AlPatientMobile" style="padding-bottom:5px;"><i class="fas fa-mobile-alt AlIcons" style="padding-left:3px;padding-right:3px;"></i> <span class="pl-2">${a.mobile}</span></div>
              <div class="subheading_today desktopMobileLink AlPatientMobile" style="padding-bottom:5px;">
                <img src="/Content/images/svg/doctor.svg" style="width:18px;height:18px;">
                <span class="pl-2">${a.doctorName}</span>
              </div>
              <div class="pull-left mt-2">
                <div class="btn-group m-0" role="group">
                  <a class="btncheckin" data-patientID="${a.patientId}" data-userID="${a.doctorId}" title="Patient Check In" style="cursor:pointer;">
                    <img class="IconButtons" src="../../Content/images/svg/CheckIn.svg" title="Check In">
                  </a>
                  <a class="btnConsultation" href="/dental/consultation?patientid=${a.patientId}" title="Start Consultation" style="cursor:pointer;">
                    <img class="IconButtons" src="../../Content/images/svg/consultation.svg" title="Consultation">
                  </a>
                </div>
              </div>
            </div>
          </div>
          <div class="w-15" style="padding-right:16px;">
            <img src="../../Content/images/svg/Plus.svg" class="CollapseIcon" data-appointmentid="appt_${a.id}" onclick="$('#appt_${a.id}').collapse('toggle');" title="collapse Details" style="cursor:pointer;">
          </div>
        </div>
      </td>
    </tr>
  `).join('\n');

  const tableHtml = `<div class="card-header pt-2 pb-2 pr-3 pl-3"><div class="cardHeadingText">Scheduled Appointments (${state.appointments.length})</div></div><table class="table AppointmentListTable" id="AppointmentListTable" style="table-layout: fixed;"><tbody>${rows}</tbody></table>`;
  html = html.replace('<div class="">\n\n</div>', tableHtml).replace('<div class="">\r\n\r\n</div>', tableHtml);
  html = html.replace('$(".todaysSchedule").html(\'0\');', `$(".todaysSchedule").html('${state.appointments.length}');`);
  return html;
}

function renderAppointmentListRows() {
  if (!state.appointments || state.appointments.length === 0) {
    return '<tr><td colspan="2" class="text-center p-4 text-muted">No appointments found.</td></tr>';
  }
  const colorMap = ['#9b6ce8', '#00bcd4', '#4caf50', '#ff9800', '#e91e63'];
  const colorClasses = ['color1', 'color2', 'color3', 'color4', 'color5'];

  return state.appointments.map((a, index) => {
    const isLast = (index === state.appointments.length - 1);
    const colorHex = colorMap[index % colorMap.length];
    const colorClass = colorClasses[index % colorClasses.length];
    const lastClass = isLast ? ' lastopendiv' : '';
    const pid = a.patientId || '2223997';
    const ccode = a.consultationCode || 'dental';
    const docName = a.doctorName || 'Dr. Naveena Ramnath';
    const docId = a.doctorId || '17472';
    const locName = a.locationName || 'Vaiyapuri Nagar,Kurumbpalayam';
    const evDate = a.date || '24/10/2026';
    const evTime = a.time || '11:00 AM';
    const mobile = a.mobile || '';
    const title = a.title || 'Patient';

    return `
      <tr id="tr_appt_${a.id}">
        <td class="btnAppointment" style="width:4%; background-color:#ffffff !important;border-top:none!important;" align="center" valign="middle">
          <button type="button" class="btn define_btn define-Appointment-circle today_color ${colorClass}" style="background:${colorHex};"></button>
        </td>
        <td class="list-group-heading AppointmentListContainer${lastClass}" valign="middle" style="border-top:none!important;">
          <div class="row ml-3 pb-2 pt-2" style="border-bottom:1px solid #ececec;">
            <div class="w-85" style="padding-right:10px;">
              <div style="display:flex;" class="atDetails">
                <a href="/patient/detail?patientid=${pid}" style="padding-left:3px !important" class="heading_today AlPatientName w-75">${title}</a>
                <div class="AlTime d-flex w-25"><i class="far fa-clock AlIcons"></i> <span class="pl-2">${evTime}</span></div>
              </div>
              <div class="collapse show" id="appt_${a.id}" style="padding-top:5px;">
                <div class="subheading_today desktopMobileLink AlPatientMobile" style="padding-bottom:5px;"><i class="fas fa-mobile-alt AlIcons" style="padding-left:3px;padding-right:3px;"></i> <span class="pl-2">${mobile}</span></div>
                <div class="subheading_today desktopMobileLink AlPatientMobile" style="padding-bottom:5px;">
                  <img src="/Content/images/svg/doctor.svg" style="width:18px;height:18px;">
                  <span class="pl-2">${docName}</span>
                </div>
                <div class="pull-left mt-2">
                  <div class="btn-group m-0" role="group">
                    <a class="btncheckin" data-patientid="${pid}" data-userid="${docId}" title="Patient Check In" style="cursor:pointer; margin-right:8px;">
                      <img class="IconButtons" src="../../Content/images/svg/CheckIn.svg" title="Check In">
                    </a>
                    <a class="btnConsultation" href="/${ccode}/consultation?patientid=${pid}" title="Start Consultation" style="cursor:pointer; margin-right:8px;">
                      <img class="IconButtons" src="../../Content/images/svg/consultation.svg" title="Consultation">
                    </a>
                    <a class="apptPay" title="Collect Payment" style="cursor:pointer; margin-right:8px;">
                      <img class="IconButtons" src="../../Content/images/svg/PaymentRequest.svg" title="Payment">
                    </a>
                    <a class="btnAppointment" data-toggle="modal" data-target=".bs-example-modal-sm" title="Cancel Appointment" style="cursor:pointer;">
                      <img class="IconButtons" src="../../Content/images/svg/closeDark.svg" title="Cancel">
                    </a>
                    <input type="hidden" class="todayApptPatientID" value="${pid}">
                    <input type="hidden" class="todayApptConsultationCode" value="${ccode}">
                    <input type="hidden" class="todayApptID" value="${a.id}">
                    <input type="hidden" class="todayApptTitle" value="${title}">
                    <input type="hidden" class="todayApptUserID" value="${docId}">
                    <input type="hidden" class="todayApptMobile" value="${mobile}">
                    <input type="hidden" class="todayApptEventDate" value="${evDate}">
                    <input type="hidden" class="todayApptEventTime" value="${evTime}">
                    <input type="hidden" class="todayApptLocation" value="${locName}">
                  </div>
                </div>
              </div>
            </div>
            <div class="w-15" style="padding-right:16px;">
              <img src="../../Content/images/svg/minus.svg" class="CollapseIcon" data-toggle="collapse" href="#appt_${a.id}" data-target="#appt_${a.id}" title="collapse Details" style="cursor:pointer;">
            </div>
          </div>
        </td>
      </tr>
    `;
  }).join('\n');
}

function buildAppointmentListPage(isPartial = false) {
  const rows = renderAppointmentListRows();
  if (isPartial) {
    return `
    <div class="container-fluid">
        <div class="row pt-2">
            <div class="col-md-12 col-sm-12 col-xs-12 p-0">
                <div class="card">
                    <div class="card-header pt-2 pb-2 pr-3 pl-3">
                        <div class="cardHeadingText">Appointment List</div>
                    </div>
                    <div class="p-0">
                        <table class="table AppointmentListTable" id="AppointmentListTable" style="table-layout: fixed; margin-bottom: 0;">
                            <tbody>
                                ${rows}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>`;
  }

  let html = readPage('appointment_list.html');
  const tbodyRegex = /(<table[^>]*id="AppointmentListTable"[^>]*>[\s\S]*?<tbody>)[\s\S]*?(<\/tbody>[\s\S]*?<\/table>)/i;
  if (tbodyRegex.test(html)) {
    html = html.replace(tbodyRegex, `$1${rows}$2`);
  }
  return html;
}

function resolveStaticFile(pathname) {
  const cleanRel = decodeURIComponent(pathname).replace(/^(\.\.\/)+/, '').replace(/^\/+/, '');
  const exactPath = path.join(ASSETS_DIR, cleanRel);
  if (fs.existsSync(exactPath) && fs.statSync(exactPath).isFile()) {
    return exactPath;
  }
  const segments = cleanRel.split(/[\\/]+/).filter(Boolean);
  let curr = ASSETS_DIR;
  for (const seg of segments) {
    if (!fs.existsSync(curr) || !fs.statSync(curr).isDirectory()) return null;
    const entries = fs.readdirSync(curr);
    const match = entries.find(e => e.toLowerCase() === seg.toLowerCase());
    if (!match) return null;
    curr = path.join(curr, match);
  }
  if (fs.existsSync(curr) && fs.statSync(curr).isFile()) return curr;
  return null;
}

function customizePatientPage(html, patientId) {
  if (!patientId || patientId === '2223997') return html;
  const p = state.patients.find(x => x.id === String(patientId));
  if (!p) return html;
  return html
    .replace(/2223997/g, p.id)
    .replace(/Ms\.\s+Yalini/g, p.fullName)
    .replace(/Yalini/g, p.firstName)
    .replace(/7548801024/g, p.mobile)
    .replace(/7241/g, p.fileNumber);
}

// Dental Consultation Tab Builders
function buildProceduresHtml() {
  const rows = state.dentalProcedures.map(p => `
    <tr>
      <td><strong>Tooth #${p.teeth}</strong></td>
      <td>${p.name}</td>
      <td>₹${p.cost}</td>
      <td>₹${p.discount}</td>
      <td><strong>₹${p.total}</strong></td>
      <td><span class="badge badge-success">Completed</span> ${p.notes}</td>
    </tr>
  `).join('');

  return `<div class="card p-3">
    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
      <h5 class="m-0" style="color:#3f51b5;"><i class="fas fa-stethoscope mr-2"></i>Treatment Plan & Procedures</h5>
      <button class="btn btn-sm btn-primary CustomButton" onclick="$('#addProcForm').slideToggle();"><i class="fas fa-plus mr-1"></i> Add Procedure</button>
    </div>
    <div id="addProcForm" style="display:none;background:#f8f9fa;padding:15px;border-radius:6px;margin-bottom:15px;border:1px solid #e2e8f0;">
      <h6>New Procedure Entry</h6>
      <div class="row">
        <div class="col-md-3"><div class="form-group"><label>Tooth #</label><input type="text" id="newProcTooth" class="form-control" value="16"></div></div>
        <div class="col-md-5"><div class="form-group"><label>Procedure</label>
          <select id="newProcName" class="form-control">
            <option>Root Canal Treatment (RCT)</option>
            <option>Tooth Extraction (Simple)</option>
            <option>Composite Light-Cure Restoration</option>
            <option>Ultrasonic Scaling & Polishing</option>
            <option>Zirconia Crown Placement</option>
            <option>Dental Implant Stage-1</option>
          </select>
        </div></div>
        <div class="col-md-2"><div class="form-group"><label>Fee (₹)</label><input type="number" id="newProcFee" class="form-control" value="3500"></div></div>
        <div class="col-md-2"><div class="form-group"><label>&nbsp;</label><button class="btn btn-sm btn-success btn-block" onclick="saveNewProcedure()">Save</button></div></div>
      </div>
    </div>
    <table class="table table-bordered table-hover">
      <thead class="thead-light"><tr><th>Tooth</th><th>Procedure</th><th>Cost</th><th>Discount</th><th>Total</th><th>Status & Notes</th></tr></thead>
      <tbody id="procTableBody">${rows}</tbody>
    </table>
  </div>
  <script>
    function saveNewProcedure() {
      const tooth = $('#newProcTooth').val() || 'General';
      const name = $('#newProcName').val();
      const fee = $('#newProcFee').val() || '1000';
      $.post('/dental/patientdentaldetailconditions', { dentalConditionID: '1', teethNumbers: tooth, CreateDateTime: '24/10/2026' }, function() {
        $('#procTableBody').append('<tr><td><strong>Tooth #' + tooth + '</strong></td><td>' + name + '</td><td>₹' + fee + '</td><td>₹0</td><td><strong>₹' + fee + '</strong></td><td><span class=\"badge badge-info\">In-Progress</span> Added today</td></tr>');
        $('#addProcForm').slideUp();
        if (typeof DisplayMessage === 'function') DisplayMessage(SuccessCheck + SpanStart + "Procedure added to treatment plan." + SpanEnd);
      });
    }
  </script>`;
}

function buildPrescriptionsHtml() {
  const rows = state.prescriptions.map(p => `
    <tr>
      <td><strong>${p.medicine}</strong></td>
      <td><span class="badge badge-primary">${p.dosage}</span></td>
      <td>${p.duration}</td>
      <td><span class="badge badge-secondary">${p.instruction}</span></td>
    </tr>
  `).join('');

  return `<div class="card p-3">
    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
      <h5 class="m-0" style="color:#3f51b5;"><i class="fas fa-pills mr-2"></i>Prescription (Rx)</h5>
      <button class="btn btn-sm btn-primary CustomButton" onclick="$('#addRxForm').slideToggle();"><i class="fas fa-plus mr-1"></i> Add Medicine</button>
    </div>
    <div id="addRxForm" style="display:none;background:#f8f9fa;padding:15px;border-radius:6px;margin-bottom:15px;border:1px solid #e2e8f0;">
      <h6>Prescribe Medication</h6>
      <div class="row">
        <div class="col-md-4"><div class="form-group"><label>Medicine</label>
          <select id="newRxMed" class="form-control">
            <option>Tab. Amoxicillin 500mg</option>
            <option>Tab. Zerodol-SP</option>
            <option>Tab. Augmentin 625mg</option>
            <option>Tab. Metrogyl 400mg</option>
            <option>Tab. Pantocid 40mg</option>
            <option>Hexidine Mouthwash (0.2%)</option>
          </select>
        </div></div>
        <div class="col-md-3"><div class="form-group"><label>Dosage</label><input type="text" id="newRxDosage" class="form-control" value="1-0-1"></div></div>
        <div class="col-md-2"><div class="form-group"><label>Duration</label><input type="text" id="newRxDuration" class="form-control" value="5 Days"></div></div>
        <div class="col-md-3"><div class="form-group"><label>&nbsp;</label><button class="btn btn-sm btn-success btn-block" onclick="saveNewRx()">Add to Rx</button></div></div>
      </div>
    </div>
    <table class="table table-bordered table-hover">
      <thead class="thead-light"><tr><th>Medicine</th><th>Dosage</th><th>Duration</th><th>Instruction</th></tr></thead>
      <tbody id="rxTableBody">${rows}</tbody>
    </table>
  </div>
  <script>
    function saveNewRx() {
      const med = $('#newRxMed').val();
      const dose = $('#newRxDosage').val() || '1-0-1';
      const dur = $('#newRxDuration').val() || '5 Days';
      $('#rxTableBody').append('<tr><td><strong>' + med + '</strong></td><td><span class=\"badge badge-primary\">' + dose + '</span></td><td>' + dur + '</td><td><span class=\"badge badge-secondary\">After Food</span></td></tr>');
      $('#addRxForm').slideUp();
      if (typeof DisplayMessage === 'function') DisplayMessage(SuccessCheck + SpanStart + "Medication added to prescription." + SpanEnd);
    }
  </script>`;
}

function buildBillingHtml() {
  const total = state.dentalProcedures.reduce((sum, p) => sum + (p.total || 0), 0) || 4500;
  return `<div class="card p-3">
    <div class="d-flex justify-content-between align-items-center mb-3 border-bottom pb-2">
      <h5 class="m-0" style="color:#3f51b5;"><i class="fas fa-file-invoice-dollar mr-2"></i>Consultation Invoice & Billing</h5>
      <button class="btn btn-sm btn-primary CustomButton" onclick="window.print()"><i class="fas fa-print mr-1"></i> Print Invoice</button>
    </div>
    <table class="table table-bordered mb-3">
      <thead class="thead-light"><tr><th>Item Description</th><th>Rate (₹)</th><th>Qty</th><th>Discount</th><th>Net Total (₹)</th></tr></thead>
      <tbody>
        ${state.dentalProcedures.map(p => `<tr><td>${p.name} (Tooth #${p.teeth})</td><td>₹${p.cost}</td><td>1</td><td>₹${p.discount}</td><td>₹${p.total}</td></tr>`).join('')}
        <tr style="background:#f8f9fa;font-weight:bold;">
          <td colspan="4" class="text-right">Grand Total:</td>
          <td>₹${total}.00</td>
        </tr>
        <tr style="color:green;font-weight:bold;">
          <td colspan="4" class="text-right">Amount Paid:</td>
          <td>₹${total}.00</td>
        </tr>
        <tr style="font-weight:bold;">
          <td colspan="4" class="text-right">Balance Due:</td>
          <td>₹0.00</td>
        </tr>
      </tbody>
    </table>
    <div class="alert alert-success d-flex align-items-center"><i class="fas fa-check-circle mr-2 fa-lg"></i> Invoice Settled in Full via UPI Payment.</div>
  </div>`;
}

function buildPreviewAndPrintHtml() {
  return `<div class="card p-4" id="printableCaseSummary">
    <div class="d-flex justify-content-between align-items-center border-bottom pb-3 mb-3">
      <div>
        <h3 class="m-0" style="color:#1d7fff;font-weight:bold;">Pulse Digital Dental Clinic</h3>
        <p class="mb-0 text-muted"><strong>Dr. Naveena Ramnath</strong>, B.D.S • Dental Surgeon<br>Vaiyapuri Nagar, Kurumbpalayam • Ph: 9842210451</p>
      </div>
      <button class="btn btn-primary CustomButton no-print" onclick="window.print()"><i class="fas fa-print mr-1"></i> Print Case Sheet</button>
    </div>
    <div class="row mb-3 p-2" style="background:#f1f5f9;border-radius:6px;">
      <div class="col-md-6"><strong>Patient Name:</strong> Ms. Yalini (Age: 28 / Female)</div>
      <div class="col-md-3"><strong>File No:</strong> 7241</div>
      <div class="col-md-3"><strong>Date:</strong> 24/10/2026</div>
    </div>
    <h5 style="color:#3f51b5;border-bottom:1px solid #ddd;padding-bottom:4px;">1. Odontogram & Clinical Examination</h5>
    <p>${state.dentalConditions.map(c => `Tooth #${c.teeth}: <strong>${c.conditionName}</strong> (${c.date})`).join('; ') || 'Normal dentition without active decay.'}</p>
    <h5 style="color:#3f51b5;border-bottom:1px solid #ddd;padding-bottom:4px;margin-top:20px;">2. Procedures & Treatment Performed</h5>
    <ul>
      ${state.dentalProcedures.map(p => `<li><strong>${p.name}</strong> (Tooth #${p.teeth}) — ₹${p.total}</li>`).join('')}
    </ul>
    <h5 style="color:#3f51b5;border-bottom:1px solid #ddd;padding-bottom:4px;margin-top:20px;">3. Rx Medication Prescriptions</h5>
    <ul>
      ${state.prescriptions.map(p => `<li><strong>${p.medicine}</strong>: ${p.dosage} for ${p.duration} (${p.instruction})</li>`).join('')}
    </ul>
    <div class="mt-4 pt-4 border-top d-flex justify-content-between">
      <span class="text-muted" style="font-size:12px;">Computer-generated case record • Verified by Pulse PMS</span>
      <span style="font-weight:bold;text-align:right;">Dr. Naveena Ramnath<br><small class="text-muted">Authorized Signature</small></span>
    </div>
  </div>`;
}

// Generate an SVG placeholder banner for social/index so zero external images break
function generateSocialImageSvg(title) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="200" viewBox="0 0 300 200">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#3f51b5;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1d7fff;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="300" height="200" rx="8" fill="url(#grad)" />
    <circle cx="150" cy="80" r="40" fill="rgba(255,255,255,0.2)" />
    <text x="150" y="88" font-family="Arial, sans-serif" font-size="28" fill="#ffffff" text-anchor="middle">🦷</text>
    <text x="150" y="150" font-family="Arial, sans-serif" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">${title || 'Pulse Clinic'}</text>
  </svg>`;
}

function renderSettingsSubPage(title, icon, contentHtml) {
  let html = readPage('settings.html');
  const subPageWrapper = `
    <!--new design start-->
    <div class="container-fluid pt-3 pb-5">
      <div class="card p-4 shadow-sm" style="background:#ffffff; border-radius:6px; min-height:650px;">
        <div class="d-flex align-items-center justify-content-between mb-3 border-bottom pb-3">
          <div>
            <a href="/home/settings" class="btn btn-sm btn-outline-primary mr-3" style="text-decoration:none;"><i class="fas fa-arrow-left mr-1"></i> Back to Settings</a>
            <h4 class="d-inline-block font-weight-bold text-dark m-0 align-middle"><i class="${icon} text-primary mr-2"></i>${title}</h4>
          </div>
          <div>
            <span class="badge badge-pill badge-primary p-2" style="font-size:13px;"><i class="fas fa-clinic-medical mr-1"></i> Dr. Naveena Ramnath Clinic</span>
          </div>
        </div>
        ${contentHtml}
      </div>
    </div>
    <!--new Design End-->
  `;
  const regex = /<!--new design start-->[\s\S]*?<!--new Design End-->/;
  if (regex.test(html)) {
    html = html.replace(regex, subPageWrapper);
  }
  return html;
}

function buildUsersHtml() {
  const rows = state.users.map(u => `
    <tr>
      <td><strong>${u.name}</strong></td>
      <td><span class="badge badge-info">${u.role}</span></td>
      <td>${u.email}</td>
      <td>${u.mobile}</td>
      <td><span class="badge badge-success">${u.status}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="alert('User settings: ${u.name}')"><i class="fas fa-edit"></i> Edit</button>
      </td>
    </tr>
  `).join('');
  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted m-0">Authorized doctors, clinical assistants, and clinic staff for Dr. Naveena Ramnath Clinic.</p>
      <button class="btn btn-sm btn-primary CustomButton" onclick="$('#addUserModal').modal('show');"><i class="fas fa-user-plus mr-1"></i> Add User</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="thead-light"><tr><th>Name</th><th>Role</th><th>Email</th><th>Mobile</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="modal fade" id="addUserModal" tabindex="-1">
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header"><h5 class="modal-title">Add Clinic User</h5><button type="button" class="close" data-dismiss="modal">&times;</button></div>
          <div class="modal-body">
            <div class="form-group"><label>Full Name</label><input type="text" class="form-control" id="newUserName" placeholder="Dr. / Staff Name"></div>
            <div class="form-group"><label>Role</label><select class="form-control" id="newUserRole"><option>Consultant Doctor</option><option>Dental Hygienist</option><option>Dental Assistant</option><option>Front Desk</option></select></div>
            <div class="form-group"><label>Email</label><input type="email" class="form-control" id="newUserEmail" placeholder="user@mydigitalclinic.net"></div>
            <div class="form-group"><label>Mobile</label><input type="text" class="form-control" id="newUserMobile" placeholder="10-digit number"></div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-dismiss="modal">Cancel</button>
            <button type="button" class="btn btn-primary" onclick="alert('User created successfully'); $('#addUserModal').modal('hide');">Save User</button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildLocationsHtml() {
  const rows = state.locationsList.map(l => `
    <tr>
      <td><strong>${l.code}</strong></td>
      <td><strong>${l.name}</strong></td>
      <td>${l.city}</td>
      <td>${l.phone}</td>
      <td><span class="badge badge-success">${l.status}</span></td>
      <td><button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="alert('Editing location ${l.name}')"><i class="fas fa-edit"></i> Edit</button></td>
    </tr>
  `).join('');
  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted m-0">Practice locations, consulting rooms, and clinic contact numbers.</p>
      <button class="btn btn-sm btn-primary CustomButton" onclick="alert('Add location dialog');"><i class="fas fa-plus mr-1"></i> Add Location</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="thead-light"><tr><th>Code</th><th>Location Name</th><th>City</th><th>Phone</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildFeesHtml() {
  const rows = state.feesList.map(f => `
    <tr>
      <td><strong>${f.code}</strong></td>
      <td>${f.name}</td>
      <td><span class="font-weight-bold text-success">${f.amount}</span></td>
      <td>${f.tax}</td>
      <td><span class="badge badge-success">${f.status}</span></td>
      <td><button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="alert('Edit fee ${f.name}')"><i class="fas fa-edit"></i> Edit</button></td>
    </tr>
  `).join('');
  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted m-0">Standard consultation fees schedule and tax settings.</p>
      <button class="btn btn-sm btn-primary CustomButton" onclick="alert('Add fee category');"><i class="fas fa-plus mr-1"></i> Add Fee</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="thead-light"><tr><th>Code</th><th>Consultation Category</th><th>Amount</th><th>Tax</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildAppointmentTimingsHtmlView() {
  const rows = state.appointmentTimingsList.map(t => `
    <tr>
      <td><strong>${t.day}</strong></td>
      <td><span class="badge badge-primary">${t.slot1}</span></td>
      <td><span class="badge badge-info">${t.slot2}</span></td>
      <td>${t.slotDuration}</td>
      <td><span class="badge badge-success">${t.status}</span></td>
      <td><button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="alert('Editing timings for ${t.day}')"><i class="fas fa-edit"></i> Edit</button></td>
    </tr>
  `).join('');
  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted m-0">Doctor practice timings and consultation session slots.</p>
      <button class="btn btn-sm btn-primary CustomButton" onclick="alert('Schedule timings updated');"><i class="fas fa-clock mr-1"></i> Update Schedule</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="thead-light"><tr><th>Day</th><th>Morning Session</th><th>Evening Session</th><th>Slot Duration</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildConsentsHtml() {
  const rows = state.consentsList.map(c => `
    <tr>
      <td><strong>${c.code}</strong></td>
      <td><strong>${c.title}</strong></td>
      <td>${c.languages}</td>
      <td><span class="badge badge-secondary">${c.version}</span></td>
      <td><span class="badge badge-success">${c.status}</span></td>
      <td>
        <button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="alert('Previewing consent: ${c.title}')"><i class="fas fa-eye"></i> View</button>
      </td>
    </tr>
  `).join('');
  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted m-0">Patient clinical informed consent forms and multilingual agreements.</p>
      <button class="btn btn-sm btn-primary CustomButton" onclick="alert('Create new consent template');"><i class="fas fa-file-contract mr-1"></i> New Consent</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="thead-light"><tr><th>Code</th><th>Template Title</th><th>Languages</th><th>Version</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildProceduresCatalogHtml() {
  const rows = state.proceduresMasterList.map(p => `
    <tr>
      <td><strong>${p.code}</strong></td>
      <td><strong>${p.name}</strong></td>
      <td><span class="badge badge-info">${p.category}</span></td>
      <td><span class="font-weight-bold text-success">${p.cost}</span></td>
      <td><span class="badge badge-success">${p.status}</span></td>
      <td><button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="alert('Editing procedure ${p.name}')"><i class="fas fa-edit"></i> Edit</button></td>
    </tr>
  `).join('');
  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted m-0">Standard dental procedure catalogue, ADA-aligned codes, and standard clinic tariffs.</p>
      <button class="btn btn-sm btn-primary CustomButton" onclick="alert('Add procedure catalogue entry');"><i class="fas fa-plus mr-1"></i> Add Procedure</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="thead-light"><tr><th>Code</th><th>Procedure Name</th><th>Category</th><th>Standard Cost</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildMedicalConditionsHtml() {
  const rows = state.medicalConditionsMaster.map(m => `
    <tr>
      <td><strong>${m.name}</strong></td>
      <td><span class="badge ${m.alertLevel === 'Critical' ? 'badge-danger' : m.alertLevel === 'High' ? 'badge-warning' : 'badge-info'}">${m.alertLevel}</span></td>
      <td>${m.flag}</td>
      <td><span class="badge badge-success">${m.status}</span></td>
      <td><button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="alert('Edit condition ${m.name}')"><i class="fas fa-edit"></i> Edit</button></td>
    </tr>
  `).join('');
  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted m-0">Patient health alert categories, medical flags, and clinical warnings.</p>
      <button class="btn btn-sm btn-primary CustomButton" onclick="alert('Add medical condition');"><i class="fas fa-heartbeat mr-1"></i> Add Condition</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="thead-light"><tr><th>Condition Name</th><th>Alert Level</th><th>Clinical Flag & Guidelines</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildSuppliersHtml() {
  const rows = state.suppliersList.map(s => `
    <tr>
      <td><strong>${s.name}</strong></td>
      <td>${s.contactPerson}</td>
      <td>${s.phone}</td>
      <td>${s.city}</td>
      <td><span class="badge badge-info">${s.category}</span></td>
      <td><button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="alert('Edit supplier ${s.name}')"><i class="fas fa-edit"></i> Edit</button></td>
    </tr>
  `).join('');
  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted m-0">Dental labs, material vendors, equipment maintenance suppliers.</p>
      <button class="btn btn-sm btn-primary CustomButton" onclick="alert('Add supplier');"><i class="fas fa-truck mr-1"></i> Add Supplier</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="thead-light"><tr><th>Supplier Name</th><th>Contact Person</th><th>Phone</th><th>City</th><th>Category</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildGroupsHtml() {
  const rows = state.groupsList.map(g => `
    <tr>
      <td><strong>${g.name}</strong></td>
      <td><span class="badge badge-primary">${g.count} Patients</span></td>
      <td>${g.discount}</td>
      <td><span class="badge badge-success">${g.status}</span></td>
      <td><button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="alert('Edit group ${g.name}')"><i class="fas fa-edit"></i> Edit</button></td>
    </tr>
  `).join('');
  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted m-0">Patient categorization groups and special package discounts.</p>
      <button class="btn btn-sm btn-primary CustomButton" onclick="alert('Add group');"><i class="fas fa-users mr-1"></i> Add Group</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="thead-light"><tr><th>Group Name</th><th>Active Members</th><th>Group Discount</th><th>Status</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildRemediesHtml() {
  const rows = state.remediesMasterList.map(r => `
    <tr>
      <td><strong>${r.name}</strong></td>
      <td>${r.generic}</td>
      <td><span class="badge badge-info">${r.defaultDosage}</span></td>
      <td><span class="badge badge-secondary">${r.category}</span></td>
      <td><button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="alert('Edit remedy ${r.name}')"><i class="fas fa-edit"></i> Edit</button></td>
    </tr>
  `).join('');
  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted m-0">Prescription formulary and standard clinical dosages.</p>
      <button class="btn btn-sm btn-primary CustomButton" onclick="alert('Add medicine');"><i class="fas fa-pills mr-1"></i> Add Medicine</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="thead-light"><tr><th>Medicine / Brand</th><th>Generic Formula</th><th>Standard Dosage</th><th>Category</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildPackageRemediesHtml() {
  const rows = state.packageRemediesList.map(p => `
    <tr>
      <td><strong>${p.name}</strong></td>
      <td>${p.items}</td>
      <td>${p.indications}</td>
      <td><button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="alert('Edit package ${p.name}')"><i class="fas fa-edit"></i> Edit</button></td>
    </tr>
  `).join('');
  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted m-0">Standard pre-defined medication packs for post-operative recovery.</p>
      <button class="btn btn-sm btn-primary CustomButton" onclick="alert('Create package kit');"><i class="fas fa-box-open mr-1"></i> New Package</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="thead-light"><tr><th>Package Name</th><th>Included Medications</th><th>Clinical Indications</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildReferralHtml() {
  const rows = state.referralsList.map(r => `
    <tr>
      <td><strong>${r.name}</strong></td>
      <td><span class="badge badge-info">${r.specialty}</span></td>
      <td>${r.hospital}</td>
      <td>${r.phone}</td>
      <td><button class="btn btn-sm btn-outline-primary py-0 px-2" onclick="alert('Edit referral doctor ${r.name}')"><i class="fas fa-edit"></i> Edit</button></td>
    </tr>
  `).join('');
  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <p class="text-muted m-0">External dental and medical specialist referral directory.</p>
      <button class="btn btn-sm btn-primary CustomButton" onclick="alert('Add referral doctor');"><i class="fas fa-user-md mr-1"></i> Add Doctor</button>
    </div>
    <div class="table-responsive">
      <table class="table table-hover table-bordered">
        <thead class="thead-light"><tr><th>Doctor Name</th><th>Specialty</th><th>Hospital / Practice</th><th>Phone</th><th>Action</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

function buildPatientCommunicationHtml(patientId) {
  const patient = state.patients.find(p => p.id === String(patientId)) || state.patients[0];
  const rows = state.communicationsList.map(c => `
    <tr>
      <td>${c.date}</td>
      <td><span class="badge badge-info">${c.type}</span></td>
      <td>${c.recipient}</td>
      <td>${c.message}</td>
      <td><span class="badge badge-success">${c.status}</span></td>
    </tr>
  `).join('');
  return `
    <div class="d-flex justify-content-between align-items-center mb-3">
      <div>
        <a href="/patient/detail?patientid=${patient.id}" class="btn btn-sm btn-outline-primary mr-3"><i class="fas fa-arrow-left mr-1"></i> Back to Patient Record</a>
        <h4 class="d-inline-block font-weight-bold text-dark m-0 align-middle"><i class="fas fa-comments text-primary mr-2"></i>Patient Communication - ${patient.fullName}</h4>
      </div>
      <div>
        <span class="badge badge-pill badge-primary p-2">File #${patient.fileNumber} | ${patient.mobile}</span>
      </div>
    </div>
    <div class="row">
      <div class="col-md-4 mb-3">
        <div class="card p-3 border shadow-sm">
          <h6 class="font-weight-bold text-primary mb-3"><i class="fas fa-paper-plane mr-1"></i> Send Direct SMS</h6>
          <div class="form-group">
            <label class="small text-muted">Recipient Mobile</label>
            <input type="text" class="form-control form-control-sm" value="${patient.mobile}" readonly>
          </div>
          <div class="form-group">
            <label class="small text-muted">Message Template</label>
            <select class="form-control form-control-sm" onchange="$('#commMsg').val(this.value)">
              <option value="">-- Select Template --</option>
              <option value="Dear ${patient.fullName}, reminder for your follow-up dental appointment at Dr. Naveena Ramnath Clinic.">Appointment Reminder</option>
              <option value="Dear ${patient.fullName}, please take medications as prescribed and rinse with warm saline solution.">Post-Op Care Instructions</option>
              <option value="Dear ${patient.fullName}, your dental crown has arrived from the lab. Please visit for fitment.">Lab Work Ready</option>
            </select>
          </div>
          <div class="form-group">
            <label class="small text-muted">Message Content</label>
            <textarea class="form-control form-control-sm" id="commMsg" rows="4" placeholder="Type SMS message..."></textarea>
          </div>
          <button class="btn btn-sm btn-primary CustomButton btn-block" onclick="sendDirectCommunication('${patient.fullName}', '${patient.mobile}')"><i class="fas fa-paper-plane mr-1"></i> Send SMS</button>
        </div>
      </div>
      <div class="col-md-8">
        <div class="card p-3 border shadow-sm">
          <h6 class="font-weight-bold text-primary mb-3"><i class="fas fa-history mr-1"></i> Communication Logs & Delivery Reports</h6>
          <div class="table-responsive">
            <table class="table table-hover table-bordered small">
              <thead class="thead-light"><tr><th>Date & Time</th><th>Type</th><th>Recipient</th><th>Message</th><th>Status</th></tr></thead>
              <tbody id="commLogsTable">${rows}</tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
    <script>
      function sendDirectCommunication(name, mobile) {
        var msg = $('#commMsg').val().trim();
        if (!msg) { alert('Please enter a message to send.'); return; }
        $.ajax({
          url: '/patient/sendcommunication',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ name: name, mobile: mobile, message: msg }),
          success: function(res) {
            alert('SMS queued and delivered to ' + mobile);
            location.reload();
          }
        });
      }
    </script>
  `;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const rawPathname = parsedUrl.pathname || '/';
  
  // Normalize double slashes and leading relative jumps
  let pathname = rawPathname.replace(/\/+/g, '/').toLowerCase();
  pathname = pathname.replace(/^(\.\.\/)+/, '/');
  // Strip repeated directory prefixes e.g. /home/home/ -> /home/
  pathname = pathname.replace(/^\/home\/home\//, '/home/').replace(/^\/patient\/patient\//, '/patient/');

  const query = parsedUrl.query || {};

  // 1. Social uploads fallback so all posters load without 404
  if (pathname.includes('/uploads/imagecategories/') || pathname.includes('/uploads/')) {
    const filename = path.basename(pathname);
    const title = decodeURIComponent(filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control': 'public, max-age=86400' });
    res.end(generateSocialImageSvg(title));
    return;
  }

  // 2. Static asset check (Content/*, Scripts/*, favicon.ico, manifest.json, serviceWorker.js, images, fonts)
  if (
    pathname.startsWith('/content/') ||
    pathname.startsWith('/scripts/') ||
    pathname === '/favicon.ico' ||
    pathname === '/manifest.json' ||
    pathname === '/serviceworker.js' ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.gif') ||
    pathname.endsWith('.woff') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.ttf') ||
    pathname.endsWith('.eot')
  ) {
    const filePath = resolveStaticFile(rawPathname);
    if (filePath) {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': 'public, max-age=3600'
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
    // Fallback 1x1 transparent PNG or empty response
    if (pathname.endsWith('.png') || pathname.endsWith('.ico')) {
      res.writeHead(200, { 'Content-Type': 'image/png' });
      res.end(Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=', 'base64'));
      return;
    }
    if (pathname.endsWith('.svg')) {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
      res.end('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#1d7fff"/></svg>');
      return;
    }
    if (pathname.endsWith('.js')) {
      res.writeHead(200, { 'Content-Type': 'application/javascript' });
      res.end('/* empty static js */');
      return;
    }
    if (pathname.endsWith('.css')) {
      res.writeHead(200, { 'Content-Type': 'text/css' });
      res.end('/* empty static css */');
      return;
    }
  }

  // 3. Main Page Routes (16 Real Captured Views)
  if (pathname === '/account/login') {
    if (req.method === 'POST') {
      await parseBody(req);
      res.writeHead(302, {
        'Location': '/home/index',
        'Set-Cookie': 'PulseAuth=drnaveenaramnath; Path=/; HttpOnly'
      });
      res.end();
      return;
    }
    return sendHtml(res, readPage('account_login.html'));
  }

  if (pathname === '/account/logoff') {
    res.writeHead(302, { 'Location': '/account/login' });
    res.end();
    return;
  }

  if (pathname === '/' || pathname === '/home/index' || pathname === '/home') {
    return sendHtml(res, readPage('home_index.html'));
  }

  if (pathname === '/calendar/index' || pathname === '/calendar') {
    return sendHtml(res, readPage('calendar.html'));
  }

  if (pathname === '/home/videos' || pathname === '/videos') {
    return sendHtml(res, readPage('videos.html'));
  }

  if (pathname === '/lab/laboratory' || pathname === '/lab') {
    let html = readPage('lab.html');
    const divlab = readPartial('lab_divlab.html');
    html = html.replace('<div id="divlab" style=""></div>', `<div id="divlab" style="">${divlab}</div>`);
    return sendHtml(res, html);
  }

  if (pathname === '/patientconnect/index' || pathname === '/patientconnect') {
    return sendHtml(res, readPage('patientconnect.html'));
  }

  if (pathname === '/report/reports' || pathname === '/reports') {
    return sendHtml(res, readPage('reports.html'));
  }

  if (pathname === '/social/index' || pathname === '/social') {
    return sendHtml(res, readPage('social.html'));
  }

  if (pathname === '/home/settings' || pathname === '/settings') {
    return sendHtml(res, readPage('settings.html'));
  }

  // Settings Sub-Pages (Eliminating Loops and covering all sub-modules)
  if (pathname === '/home/users' || pathname === '/users') {
    return sendHtml(res, renderSettingsSubPage('Clinic Users & Roles', 'fas fa-users-cog', buildUsersHtml()));
  }

  if (pathname === '/home/locations' || pathname === '/locations') {
    return sendHtml(res, renderSettingsSubPage('Clinic Practice Locations', 'fas fa-map-marker-alt', buildLocationsHtml()));
  }

  if (pathname === '/home/fees' || pathname === '/fees') {
    return sendHtml(res, renderSettingsSubPage('Consultation Fees Schedule', 'fas fa-money-bill-wave', buildFeesHtml()));
  }

  if (pathname === '/home/appointmenttiming' || pathname === '/home/appointmenttimings') {
    return sendHtml(res, renderSettingsSubPage('Doctor Timings & Schedule', 'fas fa-calendar-alt', buildAppointmentTimingsHtmlView()));
  }

  if (pathname === '/home/consents' || pathname === '/consents') {
    return sendHtml(res, renderSettingsSubPage('Clinical Consent Templates', 'fas fa-file-signature', buildConsentsHtml()));
  }

  if (pathname === '/home/groups' || pathname === '/groups') {
    return sendHtml(res, renderSettingsSubPage('Patient Groups & Categories', 'fas fa-layer-group', buildGroupsHtml()));
  }

  if (pathname === '/home/procedure' || pathname === '/home/procedures' || pathname === '/procedure') {
    return sendHtml(res, renderSettingsSubPage('Procedures & Pricing Catalog', 'fas fa-tooth', buildProceduresCatalogHtml()));
  }

  if (pathname === '/home/medicalconditions' || pathname === '/medicalconditions') {
    return sendHtml(res, renderSettingsSubPage('Medical Conditions Master', 'fas fa-notes-medical', buildMedicalConditionsHtml()));
  }

  if (pathname === '/inventory/supplier' || pathname === '/home/supplier' || pathname === '/supplier') {
    return sendHtml(res, renderSettingsSubPage('Suppliers & Dental Labs', 'fas fa-truck-loading', buildSuppliersHtml()));
  }

  if (pathname === '/home/remedies' || pathname === '/remedies') {
    return sendHtml(res, renderSettingsSubPage('Prescription Remedies Formulary', 'fas fa-prescription-bottle-alt', buildRemediesHtml()));
  }

  if (pathname === '/home/packageremedies' || pathname === '/packageremedies') {
    return sendHtml(res, renderSettingsSubPage('Package Remedies & Kits', 'fas fa-boxes', buildPackageRemediesHtml()));
  }

  if (pathname === '/home/referral' || pathname === '/referral') {
    return sendHtml(res, renderSettingsSubPage('Specialist Referral Directory', 'fas fa-user-md', buildReferralHtml()));
  }

  if (pathname === '/home/treatmentpackages' || pathname === '/treatmentpackages') {
    return sendHtml(res, renderSettingsSubPage('Treatment Packages', 'fas fa-medkit', buildProceduresCatalogHtml()));
  }

  if (pathname === '/home/grades' || pathname === '/home/vitalcategories' || pathname === '/home/vitals' || pathname === '/home/shortcuts') {
    return sendHtml(res, renderSettingsSubPage('Clinic Configuration Settings', 'fas fa-cogs', buildFeesHtml()));
  }

  if (pathname === '/patient/patientcommunication') {
    const pid = query.patientid || query.PatientID || '2223997';
    return sendHtml(res, renderSettingsSubPage('Patient Communication', 'fas fa-comments', buildPatientCommunicationHtml(pid)));
  }

  if (pathname === '/patient/sendcommunication') {
    const body = await parseBody(req);
    state.communicationsList.unshift({
      id: state.communicationsList.length + 1,
      date: new Date().toLocaleString(),
      type: 'SMS',
      recipient: `${body.name || 'Patient'} (${body.mobile || '7548801024'})`,
      message: body.message || 'Clinic reminder',
      status: 'Delivered'
    });
    return sendJson(res, { success: true });
  }

  if (pathname === '/home/search' || pathname === '/search') {
    return sendHtml(res, readPage('search.html'));
  }

  if (pathname === '/home/profileview' || pathname === '/profileview') {
    return sendHtml(res, readPage('profileview.html'));
  }

  if (pathname === '/home/support' || pathname === '/support') {
    return sendHtml(res, readPage('support.html'));
  }

  if (pathname === '/home/faq' || pathname === '/faq') {
    return sendHtml(res, readPage('faq.html'));
  }

  if (pathname === '/patient/detail') {
    const pid = query.patientid || query.PatientID || '2223997';
    let html = readPage('patient_detail.html');
    const accordions = readPartial('pd_PatientDetailsAccordions.html');
    const divid = readPartial('pd_divid.html');
    const billing = readPartial('pd_billingDetail.html');
    html = html.replace('<div id="divid" style="margin-top:15px;"></div>', `<div id="divid" style="margin-top:15px;">${divid}</div>`);
    html = html.replace('<div id="billingDetail"></div>', `<div id="billingDetail">${billing}</div>`);
    html = html.replace('<div id="PatientDetailsAccordions"></div>', `<div id="PatientDetailsAccordions">${accordions}</div>`);
    return sendHtml(res, customizePatientPage(html, pid));
  }

  if (pathname === '/dental/consultation') {
    const pid = query.patientid || query.PatientID || '2223997';
    let html = readPage('dental_consultation.html');
    const sec1 = readPartial('dc_section1.html');
    const sec2 = buildProceduresHtml();
    const sec3 = buildPrescriptionsHtml();
    const sec4 = buildBillingHtml();
    const sec5 = buildPreviewAndPrintHtml();
    const sec6 = readPartial('dc_section6.html');

    html = html.replace('<div id="section1" class="tab-pane active " style="padding: 10px !important;"></div>', `<div id="section1" class="tab-pane active" style="padding: 10px !important;">${sec1}</div>`);
    html = html.replace('<div id="section2" class="tab-pane" style="padding: 10px !important;">\n                        </div>', `<div id="section2" class="tab-pane" style="padding: 10px !important;">${sec2}</div>`);
    html = html.replace('<div id="section3" class="tab-pane" style="padding: 10px !important;">\n                        </div>', `<div id="section3" class="tab-pane" style="padding: 10px !important;">${sec3}</div>`);
    html = html.replace('<div id="section4" class="tab-pane " style="padding: 10px !important;">\n                        </div>', `<div id="section4" class="tab-pane" style="padding: 10px !important;">${sec4}</div>`);
    html = html.replace('<div id="section5" class="tab-pane fade " style="margin-left: 5px; padding: 10px !important;">\n                        </div>', `<div id="section5" class="tab-pane" style="margin-left: 5px; padding: 10px !important;">${sec5}</div>`);
    html = html.replace('<div id="section6" class="tab-pane fade " style="padding: 10px !important;"></div>', `<div id="section6" class="tab-pane" style="padding: 10px !important;">${sec6}</div>`);

    // Tab Switching Fix Script
    const tabSwitchScript = `
    <script>
      $(document).ready(function() {
        $('#tab1, #tab2, #tab3, #tab4, #tab5, #tab6').click(function(e) {
          e.preventDefault();
          var target = $(this).attr('href');
          $('.tsTabs').removeClass('active');
          $(this).addClass('active');
          $('.tab-pane').removeClass('active show').hide();
          $(target).addClass('active show').show();
        });
      });
    </script>
    `;
    html = html.replace('</body>', `${tabSwitchScript}</body>`);
    return sendHtml(res, customizePatientPage(html, pid));
  }

  if (pathname === '/home/appointmentlist' || pathname === '/appointmentlist') {
    const isAjax = req.headers['x-requested-with'] === 'XMLHttpRequest' || query.partial === 'true';
    return sendHtml(res, buildAppointmentListPage(isAjax));
  }

  // 4. Dashboard & Global Layout Backend APIs
  if (pathname === '/report/homeweekly2') {
    const rawJson = fs.readFileSync(path.join(CAPTURED_PAGES_DIR, 'homeweekly2.html'), 'utf8').replace(/<\/?(html|head|body)>/g, '');
    return sendJson(res, rawJson);
  }

  if (pathname === '/home/getappointmentdays') {
    const start = parseInt(query.start || '0', 10);
    return sendHtml(res, buildDayScrollHtml(isNaN(start) ? 0 : start));
  }

  if (pathname === '/home/getappointmenttimings') {
    return sendHtml(res, buildAppointmentTimingsHtml(query.date));
  }

  if (pathname === '/home/getappointmentdetailspopover') {
    return sendHtml(res, buildPopoverHtml(query.date, query.time));
  }

  if (pathname === '/home/todayappointments') {
    return sendHtml(res, buildTodayAppointmentsHtml());
  }

  if (pathname === '/home/todaycheckins') {
    return sendHtml(res, readPartial('todaycheckins.html'));
  }

  if (pathname === '/home/getdoctor') {
    return sendHtml(res, readPartial('getdoctor.html'));
  }

  if (pathname === '/home/getpatientqueue') {
    return sendHtml(res, readPartial('patientqueue.html'));
  }

  if (pathname === '/home/deletepatientqueue') {
    return sendJson(res, true);
  }

  if (pathname === '/home/getalertdetails') {
    return sendHtml(res, readPartial('alertdetails.html'));
  }

  if (pathname === '/home/getnotificationcount' || pathname === '/home/getappointmentnotification') {
    return sendJson(res, 5);
  }

  if (pathname === '/home/enablepayment') {
    return sendJson(res, "true");
  }

  if (pathname === '/home/getinstafees') {
    return sendJson(res, "500-18");
  }

  if (pathname === '/home/getusernameandpassword') {
    return sendJson(res, "drnaveena@pulseclinic.com-Pulse@123");
  }

  if (pathname === '/home/getpatientcheckincount') {
    return sendJson(res, state.checkins.length);
  }

  if (pathname === '/home/patientcheckin') {
    const pid = query.patientID || query.patientid || '2223997';
    const existing = state.checkins.find(c => c.patientId === String(pid));
    if (existing) {
      return sendHtml(res, 'False');
    }
    const p = state.patients.find(x => x.id === String(pid)) || state.patients[0];
    state.checkins.push({
      checkInId: String(Date.now()),
      patientId: p.id,
      patientName: p.fullName,
      mobile: p.mobile,
      doctorId: '17472',
      doctorName: 'Dr. Naveena Ramnath',
      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
      consultationCode: 'dental'
    });
    return sendHtml(res, 'True');
  }

  if (pathname === '/home/patientcheckout' || pathname === '/home/patientremovecheckin') {
    const cid = query.patientCheckInID;
    if (cid && state.checkins.length > 1) {
      state.checkins = state.checkins.filter(c => c.checkInId !== String(cid));
    }
    return sendHtml(res, 'True');
  }

  if (pathname === '/home/getrecentactivity') {
    return sendHtml(res, readPartial('home_recentactivity.html'));
  }

  if (pathname === '/home/quickaddpatient') {
    const body = await parseBody(req);
    const fn = body.FirstName || query.FirstName || 'New';
    const ln = body.LastName || query.LastName || 'Patient';
    const title = body.Title || 'Mr.';
    const mobile = body.CellPhone || '9876543210';
    const fileNo = body.FileNumber || String(7242 + state.patients.length);
    const newId = String(2224000 + state.patients.length);
    state.patients.unshift({
      id: newId,
      title,
      firstName: fn,
      lastName: ln,
      fullName: `${title} ${fn} ${ln}`.trim(),
      gender: body.Gender || '1',
      mobile,
      email: body.Email || '',
      fileNumber: fileNo,
      locationId: body.LocationID || '1395',
      locationName: ' Vaiyapuri Nagar,Kurumbpalayam',
      addedDate: '24/10/2026',
      avatar: fn.charAt(0).toUpperCase(),
      color: 'rgb(165, 118, 224)'
    });
    return sendJson(res, newId);
  }

  if (pathname === '/home/checkduplicatepatient' || pathname === '/home/checkduplicatefilenumber') {
    return sendJson(res, '');
  }

  if (pathname === '/home/getpatientpendingbill') {
    const body = await parseBody(req);
    const rawName = query.name || (typeof body === 'string' ? body : (body && (body.name || body.userName))) || '';
    const name = String(rawName).toLowerCase().trim();
    const p = state.patients.find(x => name && (x.fullName.toLowerCase().includes(name) || x.id === name || x.firstName.toLowerCase().includes(name))) || state.patients[0];
    return sendJson(res, `${p.id}-${p.mobile}-${p.email || 'patient@pulseclinic.com'}-0.00`);
  }

  if (pathname === '/home/patientsearch' || pathname === '/calendar/patientnameautocomplete') {
    const term = (query.term || '').toLowerCase().trim();
    const matches = state.patients.filter(p =>
      !term ||
      p.fullName.toLowerCase().includes(term) ||
      p.mobile.includes(term) ||
      p.fileNumber.includes(term)
    );
    const formatted = matches.map(p => `${p.id} - ${p.fullName} - ${p.mobile} - ${p.fileNumber}`);
    return sendJson(res, formatted);
  }

  // 5. Calendar Endpoints
  if (pathname === '/calendar/procedureautocomplete') {
    const list = [
      'Root Canal Treatment (RCT)',
      'Single Sitting RCT',
      'Full Mouth Ultrasonic Scaling',
      'Composite Light-Cure Restoration',
      'Tooth Extraction (Simple)',
      'Surgical Impaction Removal',
      'Zirconia Crown Placement',
      'Titanium Dental Implant',
      'Orthodontic Consultation',
      'Teeth Whitening & Bleaching',
      'Pediatric Pulpectomy'
    ];
    return sendJson(res, { data: list });
  }

  if (pathname === '/calendar/getmobilenumber') {
    const id = String(query.name || '').trim();
    const p = state.patients.find(x => x.id === id) || state.patients[0];
    return sendJson(res, p.mobile);
  }

  if (pathname === '/calendar/getlocation') {
    const id = String(query.name || '').trim();
    const p = state.patients.find(x => x.id === id) || state.patients[0];
    return sendJson(res, p.locationId || '1395');
  }

  if (pathname === '/calendar/saveevent') {
    const body = await parseBody(req);
    const rawTitle = body.Title || body.FirstName || 'Ms.  Yalini';
    const p = state.patients.find(x => rawTitle.includes(x.firstName)) || state.patients[0];
    const newAppt = {
      id: String(900100 + state.appointments.length + 1),
      patientId: p.id,
      title: p.fullName,
      mobile: body.Mobile || p.mobile,
      doctorId: body.UserID || '17472',
      doctorName: 'Dr. Naveena Ramnath',
      locationId: body.Location || '1395',
      locationName: ' Vaiyapuri Nagar,Kurumbpalayam',
      date: body.NewEventDate || '24/10/2026',
      time: body.NewEventTime || '11:00 AM',
      duration: parseInt(body.NewEventDuration || '15', 10),
      treatment: body.Treatment || 'Consultation'
    };
    state.appointments.push(newAppt);
    return sendHtml(res, 'True');
  }

  if (pathname === '/calendar/deleteevent') {
    const body = await parseBody(req);
    const eventId = body.EventID || query.EventID || body.eventID || query.eventID || body.eventId || query.eventId || body.id || query.id;
    if (eventId) {
      state.appointments = state.appointments.filter(a => a.id !== String(eventId));
    }
    return sendHtml(res, 'True');
  }

  if (pathname === '/calendar/blockevent') {
    return sendHtml(res, 'True');
  }

  if (pathname === '/calendar/getdiaryevents' || pathname === '/calendar/getdiarysummary') {
    const events = state.appointments.map(a => {
      const d = parseDDMMYYYY(a.date);
      const timeParts = (a.time || '10:30 AM').match(/(\d+):(\d+)\s*(AM|PM)/i);
      let hours = 10, mins = 30;
      if (timeParts) {
        hours = parseInt(timeParts[1], 10);
        mins = parseInt(timeParts[2], 10);
        if (timeParts[3].toUpperCase() === 'PM' && hours < 12) hours += 12;
        if (timeParts[3].toUpperCase() === 'AM' && hours === 12) hours = 0;
      }
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), hours, mins);
      const end = new Date(start.getTime() + (a.duration || 15) * 60000);
      return {
        id: a.id,
        title: `${a.title} (${a.treatment || 'Consultation'})`,
        start: start.toISOString(),
        end: end.toISOString(),
        allDay: false,
        color: '#9b6ce8',
        patientId: a.patientId,
        mobile: a.mobile
      };
    });
    return sendJson(res, events);
  }

  if (pathname === '/calendar/getappointmenttimingscalendar') {
    const slots = ['09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM', '12:00 PM', '04:30 PM', '05:00 PM', '05:30 PM', '06:00 PM'];
    const html = `<div class="d-flex flex-wrap p-2" style="gap:8px;">` +
      slots.map(s => `<a class="AppointmentTime NoAppointment badge timeSlotBadge p-2" style="cursor:pointer;border:1px solid #1d7fff;color:#1d7fff;" onclick="$('#eventTime,#eventTime1').val('${s}');">${s}</a>`).join('') +
      `</div>`;
    return sendHtml(res, html);
  }

  if (pathname === '/calendar/bookpatientappointment' || pathname === '/calendar/bookappointment') {
    const pid = query.patientid || query.patientID || '2223997';
    const p = state.patients.find(x => x.id === String(pid)) || state.patients[0];
    return sendHtml(res, `<div class="p-3">
      <div class="row">
        <div class="col-md-6"><div class="form-group"><label class="control-label">Patient</label><input class="form-control" type="text" id="eventTitle" value="${p.fullName}" readonly></div></div>
        <div class="col-md-6"><div class="form-group"><label class="control-label">Mobile</label><input class="form-control" type="text" id="mobile" value="${p.mobile}" readonly></div></div>
      </div>
      <div class="row mt-2">
        <div class="col-md-4"><div class="form-group"><label class="control-label">Date</label><input class="form-control" type="text" id="eventDate" value="24/10/2026"></div></div>
        <div class="col-md-4"><div class="form-group"><label class="control-label">Time</label><input class="form-control" type="text" id="eventTime" value="11:00 AM"></div></div>
        <div class="col-md-4"><div class="form-group"><label class="control-label">Duration (Min)</label><input class="form-control" type="text" id="eventDuration" value="15"></div></div>
      </div>
      <div class="row mt-2">
        <div class="col-md-12"><div class="form-group"><label class="control-label">Treatment</label><input class="form-control" type="text" id="treatment" value="Consultation"></div></div>
      </div>
    </div>`);
  }

  // 6. Interactive Patient Detail Sub-Forms (Add Procedure, Add Rx, Add Bill, Clinical Examination)
  if (pathname === '/patient/getclinicalexamination') {
    return sendHtml(res, `<div class="card p-3 shadow-sm mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
        <h5 class="m-0 text-primary"><i class="fas fa-stethoscope mr-2"></i>Clinical Examination Record</h5>
        <button class="btn btn-sm btn-secondary" onclick="$('#LoadForms').html('');$('#AccordianContainer').addClass('fixedColumnSize-24');">Close</button>
      </div>
      <p class="text-muted">Direct charting findings for patient examination:</p>
      <div class="row">
        <div class="col-md-4"><label>Chief Complaint</label><input class="form-control" value="Tooth ache during chewing"></div>
        <div class="col-md-4"><label>Tooth Affected</label><input class="form-control" value="16"></div>
        <div class="col-md-4"><label>Clinical Diagnosis</label><input class="form-control" value="Irreversible Pulpitis"></div>
      </div>
      <div class="mt-3">
        <a href="/dental/consultation?patientid=2223997" class="btn btn-sm btn-primary CustomButton"><i class="fas fa-external-link-alt mr-1"></i> Open Full Odontogram Workspace</a>
      </div>
    </div>`);
  }

  if (pathname === '/patient/getaddprocedure') {
    return sendHtml(res, `<div class="card p-3 shadow-sm mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
        <h5 class="m-0 text-primary"><i class="fas fa-tooth mr-2"></i>Record Clinical Procedure</h5>
        <button class="btn btn-sm btn-secondary" onclick="$('#LoadForms').html('');$('#AccordianContainer').addClass('fixedColumnSize-24');">Close</button>
      </div>
      <div class="row">
        <div class="col-md-3"><div class="form-group"><label>Tooth Number</label><input type="text" id="inpProcTooth" class="form-control" value="16"></div></div>
        <div class="col-md-5"><div class="form-group"><label>Procedure</label>
          <select id="inpProcName" class="form-control">
            <option>Root Canal Treatment (RCT)</option>
            <option>Composite Filling</option>
            <option>Ultrasonic Scaling</option>
            <option>Crown Placement (Zirconia)</option>
          </select>
        </div></div>
        <div class="col-md-2"><div class="form-group"><label>Cost (₹)</label><input type="number" id="inpProcCost" class="form-control" value="3500"></div></div>
        <div class="col-md-2"><div class="form-group"><label>&nbsp;</label><button class="btn btn-sm btn-success btn-block" onclick="saveDirectProcedure()">Save</button></div></div>
      </div>
    </div>
    <script>
      function saveDirectProcedure() {
        const tooth = $('#inpProcTooth').val();
        const proc = $('#inpProcName').val();
        const cost = $('#inpProcCost').val();
        $.post('/dental/patientdentaldetailconditions', { dentalConditionID: '1', teethNumbers: tooth, CreateDateTime: '24/10/2026' }, function() {
          alert('Procedure saved: ' + proc + ' for Tooth #' + tooth);
          $('#LoadForms').html('');
          $('#AccordianContainer').addClass('fixedColumnSize-24');
        });
      }
    </script>`);
  }

  if (pathname === '/patient/getaddprescription') {
    return sendHtml(res, `<div class="card p-3 shadow-sm mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
        <h5 class="m-0 text-primary"><i class="fas fa-pills mr-2"></i>Write Prescription</h5>
        <button class="btn btn-sm btn-secondary" onclick="$('#LoadForms').html('');$('#AccordianContainer').addClass('fixedColumnSize-24');">Close</button>
      </div>
      <div class="row">
        <div class="col-md-4"><div class="form-group"><label>Medicine</label>
          <select id="inpMedName" class="form-control">
            <option>Tab. Amoxicillin 500mg</option>
            <option>Tab. Zerodol-SP</option>
            <option>Tab. Augmentin 625mg</option>
            <option>Hexidine Mouthwash (0.2%)</option>
          </select>
        </div></div>
        <div class="col-md-3"><div class="form-group"><label>Dosage</label><input type="text" id="inpMedDose" class="form-control" value="1-0-1"></div></div>
        <div class="col-md-3"><div class="form-group"><label>Duration</label><input type="text" id="inpMedDur" class="form-control" value="5 Days"></div></div>
        <div class="col-md-2"><div class="form-group"><label>&nbsp;</label><button class="btn btn-sm btn-success btn-block" onclick="saveDirectRx()">Save Rx</button></div></div>
      </div>
    </div>
    <script>
      function saveDirectRx() {
        alert('Prescription saved: ' + $('#inpMedName').val());
        $('#LoadForms').html('');
        $('#AccordianContainer').addClass('fixedColumnSize-24');
      }
    </script>`);
  }

  if (pathname === '/patient/getaddbill' || pathname === '/patient/getaddindoorbill') {
    return sendHtml(res, `<div class="card p-3 shadow-sm mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
        <h5 class="m-0 text-primary"><i class="fas fa-file-invoice-dollar mr-2"></i>Generate Patient Invoice</h5>
        <button class="btn btn-sm btn-secondary" onclick="$('#LoadForms').html('');$('#AccordianContainer').addClass('fixedColumnSize-24');">Close</button>
      </div>
      <div class="row">
        <div class="col-md-6"><div class="form-group"><label>Treatment</label><input type="text" class="form-control" value="Root Canal Treatment (RCT) + Scaling" readonly></div></div>
        <div class="col-md-3"><div class="form-group"><label>Amount (₹)</label><input type="text" class="form-control" value="4500.00" readonly></div></div>
        <div class="col-md-3"><div class="form-group"><label>Payment Mode</label>
          <select class="form-control"><option>UPI / GPay</option><option>Cash</option><option>Credit Card</option></select>
        </div></div>
      </div>
      <div class="mt-2 text-right">
        <button class="btn btn-sm btn-primary CustomButton" onclick="alert('Invoice generated and paid in full!');$('#LoadForms').html('');$('#AccordianContainer').addClass('fixedColumnSize-24');">Save & Settle Invoice</button>
      </div>
    </div>`);
  }

  if (pathname === '/patient/getpatientnotes') {
    return sendHtml(res, `<div class="card p-3 shadow-sm mb-3">
      <div class="d-flex justify-content-between align-items-center mb-2 border-bottom pb-2">
        <h5 class="m-0 text-primary"><i class="fas fa-sticky-note mr-2"></i>Clinical Patient Notes</h5>
        <button class="btn btn-sm btn-secondary" onclick="$('#LoadForms').html('');$('#AccordianContainer').addClass('fixedColumnSize-24');">Close</button>
      </div>
      <div class="form-group">
        <label>Observations & Clinical Instructions:</label>
        <textarea class="form-control" rows="3" id="patientNoteText">${state.notes[0] ? state.notes[0].note : 'Patient doing well.'}</textarea>
      </div>
      <button class="btn btn-sm btn-success" onclick="alert('Note updated successfully');$('#LoadForms').html('');$('#AccordianContainer').addClass('fixedColumnSize-24');">Save Note</button>
    </div>`);
  }

  // 7. Patient Timeline Endpoints
  if (pathname === '/patient/gettimelineview' || pathname === '/patient/gettimelinesmsview' || pathname === '/patient/gettableview') {
    return sendHtml(res, readPartial('pd_divid.html'));
  }

  if (pathname === '/patient/getpatientinformation') {
    const pid = query.patientID || query.patientid || '2223997';
    return sendHtml(res, customizePatientPage(readPartial('pd_PatientDetailsAccordions.html'), pid));
  }

  if (pathname === '/patient/getbillinginformation') {
    return sendHtml(res, readPartial('pd_billingDetail.html'));
  }

  if (pathname === '/patient/getindoorbillinginformation') {
    return sendHtml(res, '');
  }

  if (pathname === '/patient/getpersonalinformation') {
    return sendHtml(res, readPartial('pd_personalDetail.html'));
  }

  if (pathname === '/patient/getcontactdetail') {
    return sendHtml(res, readPartial('pd_contactDetail.html'));
  }

  if (pathname === '/patient/getotherinformation') {
    return sendHtml(res, readPartial('pd_otherInfo.html'));
  }

  if (pathname === '/patient/getconsentlist') {
    return sendHtml(res, readPartial('pd_consent.html'));
  }

  if (pathname === '/patient/getmedicalconditionlist') {
    return sendHtml(res, readPartial('pd_MedicalCondition.html'));
  }

  if (
    pathname === '/patient/editpersonalinformationpk' ||
    pathname === '/patient/editotherinformationpk' ||
    pathname === '/patient/editcontactdetailpk' ||
    pathname === '/patient/addpatientmedicalconditionspk'
  ) {
    await parseBody(req);
    return sendJson(res, true);
  }

  if (pathname === '/patient/locationget') {
    return sendJson(res, [
      { value: 1396, text: 'Band lane, ooty' },
      { value: 1395, text: 'Vaiyapuri Nagar,Kurumbpalayam' }
    ]);
  }

  if (pathname === '/patient/groupget') {
    return sendJson(res, [
      { value: 1, text: 'General' },
      { value: 2, text: 'Orthodontics' },
      { value: 3, text: 'Implantology' }
    ]);
  }

  if (pathname === '/patient/referredbyget') {
    return sendJson(res, [
      { value: 1, text: 'Dr. Naveena Ramnath' },
      { value: 2, text: 'Walk-In' }
    ]);
  }

  if (pathname === '/patient/conditionsget') {
    return sendJson(res, [
      { value: 1, text: 'Diabetes' },
      { value: 2, text: 'Hypertension' },
      { value: 3, text: 'No Known Allergies' }
    ]);
  }

  if (pathname === '/home/countrycitystate') {
    return sendJson(res, [{ value: 'India', text: 'India' }]);
  }

  if (pathname === '/patient/getcountryid') {
    return sendJson(res, 1);
  }

  if (pathname === '/home/getstates') {
    return sendJson(res, [{ value: 'Tamil Nadu', text: 'Tamil Nadu' }]);
  }

  if (pathname === '/home/getcities') {
    return sendJson(res, [{ value: 'Coimbatore', text: 'Coimbatore' }, { value: 'Ooty', text: 'Ooty' }]);
  }

  if (pathname === '/patient/getpendingamount') {
    return sendJson(res, 0);
  }

  if (pathname === '/patient/payment' || pathname === '/patient/saveestimate') {
    return sendJson(res, true);
  }

  // 8. Dental Consultation Endpoints
  if (pathname === '/dental/conditions') {
    if (req.method === 'POST') {
      await parseBody(req);
      return sendJson(res, true);
    }
    return sendHtml(res, readPartial('dc_section1.html'));
  }

  if (pathname === '/dental/getdentalconditions') {
    if (state.dentalConditions.length === 0) {
      return sendHtml(res, '');
    }
    const rows = state.dentalConditions.map(c => `
      <tr>
        <td>Tooth #${c.teeth}</td>
        <td><span class="badge badge-info">${c.conditionName}</span></td>
        <td>${c.date}</td>
      </tr>
    `).join('');
    return sendHtml(res, `<table class="table table-sm table-bordered mt-2"><thead><tr><th>Tooth Number</th><th>Dental Condition</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table>`);
  }

  if (pathname === '/dental/patientdentaldetailconditions') {
    const body = await parseBody(req);
    const condMap = {
      '1': 'Caries',
      '2': 'Fracture',
      '3': 'Mobility',
      '4': 'Root Stump',
      '5': 'Missing Tooth',
      '6': 'Abrasion',
      '7': 'Attrition',
      '8': 'Impacted',
      '9': 'Supra Erupted',
      '10': 'Periapical Abscess'
    };
    const cid = String(body.dentalConditionID || '1');
    const teeth = String(body.teethNumbers || '').replace(/,+$/, '');
    if (cid === '0') {
      state.dentalConditions = [];
    } else if (teeth) {
      state.dentalConditions.push({
        id: state.dentalConditions.length + 1,
        teeth,
        conditionId: cid,
        conditionName: condMap[cid] || 'Caries',
        date: body.CreateDateTime || '24/10/2026'
      });
    }
    return sendJson(res, true);
  }

  if (pathname === '/dental/getteethimage') {
    const t = String(query.teethNumber || '18').trim();
    const firstDigit = t.charAt(0);
    const posClass = (firstDigit === '1' || firstDigit === '2' || firstDigit === '5' || firstDigit === '6') ? 'upper' : 'lower';
    const hasCond = state.dentalConditions.some(c => c.teeth.split(',').map(x => x.trim()).includes(t));
    const filterStyle = hasCond ? ' style="filter: drop-shadow(0 0 4px #fe3c60) sepia(1) hue-rotate(-50deg) saturate(3);"' : '';
    return sendHtml(res, `<img src="/Content/images/dental/normal/${t}.svg" class="${posClass}"${filterStyle}>`);
  }

  if (pathname === '/dental/consultationhistory') {
    return sendHtml(res, readPartial('dc_section6.html'));
  }

  if (pathname === '/dental/procedures') {
    return sendHtml(res, buildProceduresHtml());
  }

  if (pathname === '/dental/prescriptionremedies') {
    return sendHtml(res, buildPrescriptionsHtml());
  }

  if (pathname === '/dental/billing') {
    return sendHtml(res, buildBillingHtml());
  }

  if (pathname === '/dental/previewandprint') {
    return sendHtml(res, buildPreviewAndPrintHtml());
  }

  if (pathname === '/dental/completeconsultation') {
    return sendJson(res, true);
  }

  // 9. Lab Endpoints
  if (pathname === '/lab/labs') {
    return sendHtml(res, readPartial('lab_menulab.html'));
  }

  if (pathname === '/lab/laborders') {
    return sendHtml(res, readPartial('lab_divlaborder.html'));
  }

  if (pathname === '/lab/getlabs') {
    return sendHtml(res, readPartial('lab_divlab.html'));
  }

  if (pathname === '/lab/labnameautocomplete') {
    return sendJson(res, ['3422-Dentcare-8965231245']);
  }

  if (pathname === '/lab/checkduplicatelab') {
    return sendJson(res, '');
  }

  if (pathname === '/lab/addlab' || pathname === '/lab/addlaborder') {
    await parseBody(req);
    return sendHtml(res, '<div class="alert alert-success">Lab order saved successfully</div>');
  }

  // 10. Patient Connect Endpoints
  if (pathname === '/patientconnect/getbulkpatientcount') {
    await parseBody(req);
    return sendJson(res, state.patients.length);
  }

  if (pathname === '/patientconnect/sendbulkpatientmessage') {
    await parseBody(req);
    return sendJson(res, true);
  }

  if (pathname === '/patientconnect/smshistorydetail') {
    return sendHtml(res, `<table class="table table-bordered"><thead><tr><th>Patient Name</th><th>Mobile</th><th>Status</th><th>Date</th></tr></thead><tbody><tr><td>Ms. Yalini</td><td>7548801024</td><td><span class="badge badge-success">Delivered</span></td><td>24/10/2026</td></tr></tbody></table>`);
  }

  // 11. Reports & Videos Endpoints
  if (pathname.startsWith('/report/')) {
    if (pathname.includes('result')) {
      return sendJson(res, {
        draw: parseInt(query.draw || 1, 10),
        recordsTotal: state.patients.length,
        recordsFiltered: state.patients.length,
        data: state.patients.map(p => ({
          FileNumber: p.fileNumber,
          FirstName: p.fullName.split(' ')[0] || "Patient",
          LastName: p.fullName.split(' ').slice(1).join(' ') || "",
          Gender: p.gender === '1' ? 'Male' : 'Female',
          DOB: "12/05/1995",
          FileLocation: p.locationName,
          Mobile: p.mobile,
          Email: (p.fullName.replace(/[^a-zA-Z]/g, '').toLowerCase() || "patient") + "@patient.com",
          CreatedDate: p.addedDate || "15/01/2024",
          Active: true
        }))
      });
    }
    if (pathname === '/report/showpatientnotes') {
      const fn = query.FirstName || 'Yalini';
      const ln = query.LastName || '';
      const fno = query.filenumber || '7241';
      const mob = query.Mobile || '7548801024';
      const em = query.Email || 'yalini@patient.com';
      return sendHtml(res, `
        <div class="card p-3">
          <h5><i class="fas fa-file-medical text-primary mr-2"></i> Clinical Notes for ${fn} ${ln} (#${fno})</h5>
          <p class="text-muted"><i class="fas fa-phone mr-1"></i> ${mob} | <i class="fas fa-envelope mr-1"></i> ${em}</p>
          <div class="alert alert-info mt-2">
            <strong>Oct 24, 2026:</strong> Patient presented with sensitivity on upper right quadrant. Pulp vitality testing confirmed symptomatic irreversible pulpitis in tooth 16. Root canal therapy initiated under local anesthesia. Working length determined (MB: 20mm, DB: 19.5mm, P: 21mm). Master cone trial scheduled for next appointment.
          </div>
        </div>
      `);
    }
    if (pathname.endsWith('report') || pathname.includes('report')) {
      return sendHtml(res, readPartial('report_patient.html'));
    }
    const rows = state.patients.map(p => `
      <tr>
        <td><a href="/patient/detail?patientid=${p.id}">${p.fullName}</a></td>
        <td>${p.fileNumber}</td>
        <td>${p.mobile}</td>
        <td>${p.locationName}</td>
        <td>${p.addedDate}</td>
      </tr>
    `).join('');
    return sendHtml(res, `<div class="table-responsive"><table class="table table-striped table-bordered" id="example"><thead><tr><th>Patient Name</th><th>File Number</th><th>Mobile</th><th>Location</th><th>Date</th></tr></thead><tbody>${rows}</tbody></table></div>`);
  }

  if (pathname === '/home/videonameautocomplete') {
    return sendJson(res, ['Dental Implants', 'Root Canal Procedure', 'Oral Hygiene & Brushing', 'Orthodontic Braces']);
  }

  if (pathname === '/home/getvideos') {
    return sendHtml(res, readPartial('videos_list.html'));
  }

  if (pathname === '/home/smsvideolink' || pathname === '/home/requestquery') {
    await parseBody(req);
    return sendJson(res, true);
  }

  // Default fallback for settings/inventory/expense
  if (pathname.startsWith('/home/') || pathname.startsWith('/inventory/') || pathname.startsWith('/expense/')) {
    return sendHtml(res, readPage('settings.html'));
  }

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ ok: true }));
});

process.on('uncaughtException', (err) => {
  console.error('Server Uncaught Exception:', err);
});
process.on('unhandledRejection', (reason, promise) => {
  console.error('Server Unhandled Rejection:', reason);
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Pulse Digital Clinic 1:1 Cloned Server listening on http://localhost:${PORT}`);
  });
}

module.exports = server;
