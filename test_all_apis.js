const http = require('http');

const BASE_URL = 'http://localhost:3000';
const parsed = new URL(BASE_URL);

function request(path, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: path,
      method: method,
      headers: {
        'User-Agent': 'API-Auditor/1.0',
        ...headers
      }
    };
    if (body) {
      if (typeof body === 'object') {
        body = JSON.stringify(body);
        opts.headers['Content-Type'] = 'application/json';
      }
      opts.headers['Content-Length'] = Buffer.byteLength(body);
    }
    const req = http.request(opts, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(data);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: buf.toString('utf8'),
          buffer: buf
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

const apisToAudit = [
  // 1. Core 20 Specified Endpoints
  { name: 'Weekly Production & Visits', path: '/report/homeweekly2', method: 'GET', expectedType: 'json', validate: (res) => {
    const json = JSON.parse(res.body);
    return json && (json.series || json.graphset) && (Array.isArray(json.series) || Array.isArray(json.graphset));
  }},
  { name: 'Appointment Days Scroller', path: '/home/getappointmentdays?start=0', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('DayScrollItem') && res.body.includes('data-appointmentdate') && res.body.includes('dateSpan');
  }},
  { name: 'Appointment Timings Slots', path: '/home/getappointmenttimings?date=24/10/2026', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('AppointmentTime') && res.body.includes('AppointmentDot');
  }},
  { name: 'Appointment Details Popover', path: '/home/getappointmentdetailspopover?date=24/10/2026&time=10:30%20AM', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Dr. Naveena Ramnath') && res.body.includes('7548801024') && res.body.includes('Start Consultation');
  }},
  { name: 'Today Scheduled Appointments', path: '/home/todayappointments', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('AppointmentListTable') || res.body.includes('AppointmentListContainer');
  }},
  { name: 'Today Checked-in Patients', path: '/home/todaycheckins', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.length > 50;
  }},
  { name: 'Doctor Profile Partial', path: '/home/getdoctor', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.length > 20;
  }},
  { name: 'Patient Queue Partial', path: '/home/getpatientqueue', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.length > 20;
  }},
  { name: 'Alert Details Notification Partial', path: '/home/getalertdetails', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.length > 20;
  }},
  { name: 'Notification Count', path: '/home/getnotificationcount', method: 'GET', expectedType: 'json', validate: (res) => {
    const num = JSON.parse(res.body);
    return typeof num === 'number' && !isNaN(num);
  }},
  { name: 'Patient Check-in Count', path: '/home/getpatientcheckincount', method: 'GET', expectedType: 'json', validate: (res) => {
    const num = JSON.parse(res.body);
    return typeof num === 'number' && !isNaN(num);
  }},
  { name: 'Recent Activity Feed', path: '/home/getrecentactivity', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.length > 50;
  }},
  { name: 'Calendar Procedure Autocomplete', path: '/calendar/procedureautocomplete', method: 'GET', expectedType: 'json', validate: (res) => {
    const json = JSON.parse(res.body);
    return json && Array.isArray(json.data) && json.data.length > 0 && json.data.includes('Root Canal Treatment (RCT)');
  }},
  { name: 'Calendar Diary Events', path: '/calendar/getdiaryevents', method: 'GET', expectedType: 'json', validate: (res) => {
    const events = JSON.parse(res.body);
    return Array.isArray(events) && events.every(e => e.id && e.title && e.start);
  }},
  { name: 'Dental Odontogram Tooth Image (Tooth 16)', path: '/dental/getteethimage?teethNumber=16', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('<img') && res.body.includes('16.svg') && res.body.includes('upper');
  }},
  { name: 'Dental Conditions Tab', path: '/dental/conditions', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('dentalCondition') || res.body.length > 100;
  }},
  { name: 'Dental Treatment Procedures Tab', path: '/dental/procedures', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Root Canal Treatment') && res.body.includes('Tooth #16');
  }},
  { name: 'Dental Prescription Remedies Tab', path: '/dental/prescriptionremedies', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Amoxicillin') && res.body.includes('Zerodol-SP');
  }},
  { name: 'Dental Consultation Billing Tab', path: '/dental/billing', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Invoice') && res.body.includes('3500');
  }},
  { name: 'Dental Preview & Print Case Sheet', path: '/dental/previewandprint', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Pulse Digital Dental Clinic') && res.body.includes('Dr. Naveena Ramnath') && res.body.includes('Yalini');
  }},

  // 2. Settings APIs
  { name: 'Settings: Clinic Users & Roles', path: '/home/users', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Dr. Naveena Ramnath') && res.body.includes('Clinic Users & Roles');
  }},
  { name: 'Settings: Practice Locations', path: '/home/locations', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Kurumbpalayam') && res.body.includes('Ooty');
  }},
  { name: 'Settings: Fees Schedule', path: '/home/fees', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Consultation Fees Schedule') && res.body.includes('₹500');
  }},
  { name: 'Settings: Appointment Timings', path: '/home/appointmenttiming', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Doctor Timings & Schedule') && res.body.includes('Monday to Saturday');
  }},
  { name: 'Settings: Consent Templates', path: '/home/consents', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Clinical Consent Templates') && res.body.includes('CONS-RCT');
  }},
  { name: 'Settings: Patient Groups', path: '/home/groups', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Patient Groups & Categories') && res.body.includes('Regular Patients');
  }},
  { name: 'Settings: Procedures Master Catalog', path: '/home/procedure', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Procedures & Pricing Catalog') && res.body.includes('RCT-01');
  }},
  { name: 'Settings: Medical Conditions Master', path: '/home/medicalconditions', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Medical Conditions Master') && res.body.includes('Diabetes Mellitus');
  }},
  { name: 'Settings: Suppliers & Dental Labs', path: '/inventory/supplier', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Suppliers & Dental Labs') && res.body.includes('Apex Dental Craft Lab');
  }},
  { name: 'Settings: Remedies Formulary Master', path: '/home/remedies', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Prescription Remedies Formulary') && res.body.includes('Amoxicillin Trihydrate');
  }},
  { name: 'Settings: Package Remedies & Kits', path: '/home/packageremedies', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Package Remedies & Kits') && res.body.includes('Post-RCT Care Kit');
  }},
  { name: 'Settings: Specialist Referral Directory', path: '/home/referral', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Specialist Referral Directory') && res.body.includes('Dr. Senthil Kumar');
  }},
  { name: 'Settings: Treatment Packages', path: '/home/treatmentpackages', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Treatment Packages') && res.body.includes('RCT-01');
  }},

  // 3. Patient Communication APIs
  { name: 'Patient Communication Sub-page', path: '/patient/patientcommunication?patientid=2223997', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Patient Communication - Ms.  Yalini') && res.body.includes('Send Direct SMS');
  }},
  { name: 'Direct SMS Send API', path: '/patient/sendcommunication', method: 'POST', body: { name: 'Ms. Yalini', mobile: '7548801024', message: 'Follow-up appointment on Monday.' }, expectedType: 'json', validate: (res) => {
    const json = JSON.parse(res.body);
    return json.success === true;
  }},
  { name: 'Patient Connect Bulk Count API', path: '/patientconnect/getbulkpatientcount', method: 'POST', body: {}, expectedType: 'json', validate: (res) => {
    const num = JSON.parse(res.body);
    return typeof num === 'number' && num > 0;
  }},
  { name: 'Patient Connect Send Bulk Message API', path: '/patientconnect/sendbulkpatientmessage', method: 'POST', body: { Type: 'SMS', Message: 'Dental health week special checkup.' }, expectedType: 'json', validate: (res) => {
    const ok = JSON.parse(res.body);
    return ok === true;
  }},
  { name: 'Patient Connect SMS History Detail', path: '/patientconnect/smshistorydetail', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Delivered') && res.body.includes('7548801024');
  }},

  // 4. Clinical Odontogram & Patient Charting APIs
  { name: 'Dental Condition Update (Odontogram POST)', path: '/dental/patientdentaldetailconditions', method: 'POST', body: { dentalConditionID: '1', teethNumbers: '16,26', CreateDateTime: '24/10/2026' }, expectedType: 'json', validate: (res) => {
    const ok = JSON.parse(res.body);
    return ok === true;
  }},
  { name: 'Dental Get Conditions Table', path: '/dental/getdentalconditions', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Tooth #') && res.body.includes('Caries');
  }},
  { name: 'Dental Consultation History Tab', path: '/dental/consultationhistory?patientid=2223997', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.length > 50;
  }},
  { name: 'Dental Complete Consultation API', path: '/dental/completeconsultation', method: 'POST', body: {}, expectedType: 'json', validate: (res) => {
    const ok = JSON.parse(res.body);
    return ok === true;
  }},

  // 5. Patient Detail Sub-Forms & Timeline APIs
  { name: 'Patient Clinical Examination Sub-form', path: '/patient/getclinicalexamination', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Clinical Examination Record') && res.body.includes('Irreversible Pulpitis');
  }},
  { name: 'Patient Add Procedure Sub-form', path: '/patient/getaddprocedure', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Record Clinical Procedure') && res.body.includes('Root Canal Treatment');
  }},
  { name: 'Patient Add Prescription Sub-form', path: '/patient/getaddprescription', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Write Prescription') && res.body.includes('Amoxicillin');
  }},
  { name: 'Patient Add Bill Sub-form', path: '/patient/getaddbill', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Generate Patient Invoice') && res.body.includes('4500.00');
  }},
  { name: 'Patient Notes Sub-form', path: '/patient/getpatientnotes', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Clinical Patient Notes') && res.body.includes('tenderness');
  }},
  { name: 'Patient Timeline View', path: '/patient/gettimelineview', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.length > 50;
  }},
  { name: 'Patient Information Accordions', path: '/patient/getpatientinformation?patientid=2223997', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Ms.  Yalini') || res.body.includes('7548801024');
  }},
  { name: 'Patient Billing Details Partial', path: '/patient/getbillinginformation', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.length > 50;
  }},
  { name: 'Patient Personal Details Partial', path: '/patient/getpersonalinformation', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.length > 50;
  }},
  { name: 'Patient Contact Details Partial', path: '/patient/getcontactdetail', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.length > 50;
  }},
  { name: 'Patient Location Select API', path: '/patient/locationget', method: 'GET', expectedType: 'json', validate: (res) => {
    const list = JSON.parse(res.body);
    return Array.isArray(list) && list.some(l => l.text.includes('Kurumbpalayam'));
  }},
  { name: 'Patient Group Select API', path: '/patient/groupget', method: 'GET', expectedType: 'json', validate: (res) => {
    const list = JSON.parse(res.body);
    return Array.isArray(list) && list.some(g => g.text === 'General');
  }},
  { name: 'Patient Conditions Select API', path: '/patient/conditionsget', method: 'GET', expectedType: 'json', validate: (res) => {
    const list = JSON.parse(res.body);
    return Array.isArray(list) && list.some(c => c.text === 'Diabetes');
  }},

  // 6. Search, Check-in & Patient Management APIs
  { name: 'Patient Search Term API', path: '/home/patientsearch?term=Yalini', method: 'GET', expectedType: 'json', validate: (res) => {
    const list = JSON.parse(res.body);
    return Array.isArray(list) && list.some(p => p.includes('Yalini') && p.includes('7548801024'));
  }},
  { name: 'Patient Check-in Action API', path: '/home/patientcheckin?patientID=2223851&userID=17472', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body === 'True' || res.body === 'False';
  }},
  { name: 'Quick Add Patient API', path: '/home/quickaddpatient', method: 'POST', body: { FirstName: 'Test', LastName: 'AuditPatient', CellPhone: '9988776655', Title: 'Mr.', Gender: '1' }, expectedType: 'json', validate: (res) => {
    const id = JSON.parse(res.body);
    return (typeof id === 'string' || typeof id === 'number') && String(id).length > 0;
  }},

  // 7. Reports APIs
  { name: 'Patient Report Partial View', path: '/report/patientreport', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Patient') || res.body.length > 50;
  }},
  { name: 'Patient Report DataTables Result API', path: '/report/patientreportresult?draw=1&start=0&length=10', method: 'GET', expectedType: 'json', validate: (res) => {
    const dt = JSON.parse(res.body);
    return dt.draw === 1 && typeof dt.recordsTotal === 'number' && Array.isArray(dt.data) && dt.data.length > 0;
  }},
  { name: 'Consultation Report Result API', path: '/report/consultationreportresult?draw=1&start=0&length=10', method: 'GET', expectedType: 'json', validate: (res) => {
    const dt = JSON.parse(res.body);
    return dt.draw === 1 && typeof dt.recordsTotal === 'number' && Array.isArray(dt.data);
  }},
  { name: 'Billing Report Result API', path: '/report/billingreportresult?draw=1&start=0&length=10', method: 'GET', expectedType: 'json', validate: (res) => {
    const dt = JSON.parse(res.body);
    return dt.draw === 1 && typeof dt.recordsTotal === 'number' && Array.isArray(dt.data);
  }},
  { name: 'Show Patient Clinical Notes Partial', path: '/report/showpatientnotes?FirstName=Yalini&LastName=&filenumber=7241&Mobile=7548801024&Email=yalini@patient.com', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Clinical Notes for Yalini') && res.body.includes('7241');
  }},

  // 8. Core Frontend Integration & Action APIs
  { name: 'Appointment List View (lowercase)', path: '/home/appointmentlist', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Appointment') && (res.body.includes('AppointmentListTable') || res.body.includes('appointment_list') || res.body.includes('Appointment List'));
  }},
  { name: 'Appointment List View (PascalCase)', path: '/home/AppointmentList', method: 'GET', expectedType: 'html', validate: (res) => {
    return res.body.includes('Appointment') && (res.body.includes('AppointmentListTable') || res.body.includes('appointment_list') || res.body.includes('Appointment List'));
  }},
  { name: 'Delete Calendar Event API', path: '/Calendar/DeleteEvent', method: 'POST', body: { EventID: 'test_event_delete' }, expectedType: 'html', validate: (res) => {
    return res.body === 'True';
  }},
  { name: 'Patient Pending Bill API', path: '/Home/GetPatientPendingBill?name=Yalini', method: 'POST', body: JSON.stringify('Yalini'), expectedType: 'json', validate: (res) => {
    const str = JSON.parse(res.body);
    return typeof str === 'string' && str.includes('-');
  }},
  { name: 'Enable Payment Status API', path: '/Home/EnablePayment', method: 'POST', body: {}, expectedType: 'json', validate: (res) => {
    const val = JSON.parse(res.body);
    return val === 'true' || val === true;
  }},
  { name: 'Instant Fees API', path: '/Home/GetInstaFees', method: 'POST', body: {}, expectedType: 'json', validate: (res) => {
    const str = JSON.parse(res.body);
    return typeof str === 'string' && str.includes('-');
  }}
];

async function runAudit() {
  console.log(`Starting comprehensive audit of ${apisToAudit.length} backend APIs against ${BASE_URL}...\n`);
  let passCount = 0;
  let failCount = 0;
  const auditResults = [];

  for (const api of apisToAudit) {
    const result = {
      name: api.name,
      path: api.path,
      method: api.method,
      expectedType: api.expectedType,
      statusCode: null,
      contentType: null,
      pass: false,
      payloadParity: false,
      notes: ''
    };

    try {
      const res = await request(api.path, api.method, api.body);
      result.statusCode = res.statusCode;
      result.contentType = res.headers['content-type'] || '';
      
      const statusOk = res.statusCode === 200;
      let ctOk = false;
      if (api.expectedType === 'json') {
        ctOk = result.contentType.includes('application/json');
      } else if (api.expectedType === 'html') {
        ctOk = result.contentType.includes('text/html');
      }

      let payloadOk = false;
      try {
        payloadOk = api.validate(res);
      } catch (err) {
        result.notes = `Validation exception: ${err.message}`;
      }
      result.payloadParity = payloadOk;

      if (statusOk && ctOk && payloadOk) {
        result.pass = true;
        passCount++;
        console.log(`✓ [PASS] [HTTP ${res.statusCode}] [${result.contentType.split(';')[0]}] ${api.method} ${api.path} - ${api.name}`);
      } else {
        failCount++;
        result.notes = `Failed: status=${statusOk}(${res.statusCode}), contentType=${ctOk}(${result.contentType}), payloadParity=${payloadOk}. ${result.notes}`;
        console.error(`✗ [FAIL] ${api.method} ${api.path} - ${result.notes}`);
      }
    } catch (err) {
      failCount++;
      result.notes = `Network/Request Error: ${err.message}`;
      console.error(`✗ [FAIL] ${api.method} ${api.path} - ${err.message}`);
    }

    auditResults.push(result);
  }

  console.log(`\n======================================================`);
  console.log(`AUDIT RESULTS SUMMARY: ${passCount}/${apisToAudit.length} PASSED (${failCount} FAILED)`);
  console.log(`======================================================\n`);

  return { passCount, failCount, total: apisToAudit.length, results: auditResults };
}

runAudit().then(summary => {
  if (summary.failCount > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}).catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});
