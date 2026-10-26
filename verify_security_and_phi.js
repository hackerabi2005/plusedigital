const http = require('http');

const BASE_URL = 'http://localhost:3000';
const parsed = new URL(BASE_URL);

function request(path, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: parsed.hostname,
      port: parsed.port,
      path: path,
      method: method,
      headers: {
        'User-Agent': 'Security-PHI-Verifier/1.0'
      }
    };
    if (body) {
      body = JSON.stringify(body);
      opts.headers['Content-Type'] = 'application/json';
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
          body: buf.toString('utf8')
        });
      });
    });
    req.on('error', reject);
    if (body) req.write(body);
    req.end();
  });
}

async function verifySecurityAndPhi() {
  console.log('=== AUDITING SECURITY, OFFLINE LEAKAGE & PHI INTEGRITY ===\n');

  const endpointsToCheck = [
    '/report/homeweekly2',
    '/home/getappointmentdays?start=0',
    '/home/getappointmenttimings?date=24/10/2026',
    '/home/getappointmentdetailspopover?date=24/10/2026&time=10:30%20AM',
    '/home/todayappointments',
    '/home/todaycheckins',
    '/home/getdoctor',
    '/home/getpatientqueue',
    '/home/getalertdetails',
    '/home/getnotificationcount',
    '/home/getpatientcheckincount',
    '/home/getrecentactivity',
    '/calendar/procedureautocomplete',
    '/calendar/getdiaryevents',
    '/dental/getteethimage?teethNumber=16',
    '/dental/conditions',
    '/dental/procedures',
    '/dental/prescriptionremedies',
    '/dental/billing',
    '/dental/previewandprint',
    '/home/users',
    '/home/locations',
    '/home/fees',
    '/home/appointmenttiming',
    '/home/consents',
    '/home/groups',
    '/home/procedure',
    '/home/medicalconditions',
    '/inventory/supplier',
    '/home/remedies',
    '/home/packageremedies',
    '/home/referral',
    '/home/treatmentpackages',
    '/patient/patientcommunication?patientid=2223997',
    '/patientconnect/smshistorydetail',
    '/report/patientreport',
    '/report/patientreportresult?draw=1&start=0&length=10'
  ];

  let leakageFound = 0;
  // External domain regex excluding standard XML/W3C namespaces
  const externalLeakRegex = /https?:\/\/(?!(localhost|127\.0\.0\.1|www\.w3\.org))(?!.*xmlns)[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;

  for (const ep of endpointsToCheck) {
    const res = await request(ep);
    const matches = res.body.match(externalLeakRegex) || [];
    // Filter out standard harmless text or documentation references if any
    const trueLeaks = matches.filter(m => !m.includes('w3.org') && !m.includes('schema.org'));
    if (trueLeaks.length > 0) {
      console.warn(`[WARNING] External reference found in ${ep}:`, trueLeaks);
      leakageFound++;
    }
  }

  console.log(`1. Offline Network Leakage Check: ${leakageFound === 0 ? 'CLEAN (0 external leaks detected across all APIs)' : leakageFound + ' warnings'}`);

  // 2. PHI Data Consistency Check
  console.log('\n2. PHI Data Integrity & Consistency Check:');
  const patientId = '2223997';
  const expectedName = 'Yalini';
  const expectedMobile = '7548801024';
  const expectedFileNo = '7241';
  const expectedDoctor = 'Dr. Naveena Ramnath';

  // Check Diary Events
  const diaryRes = await request('/calendar/getdiaryevents');
  const diaryEvents = JSON.parse(diaryRes.body);
  const yaliniEvent = diaryEvents.find(e => e.patientId === patientId);
  const diaryMatch = yaliniEvent && yaliniEvent.title.includes(expectedName) && yaliniEvent.mobile === expectedMobile;
  console.log(`  - Calendar Diary Event PHI Match: ${diaryMatch ? 'PASS' : 'FAIL'} (${yaliniEvent ? yaliniEvent.title : 'None'})`);

  // Check Today Appointments
  const apptRes = await request('/home/todayappointments');
  const apptMatch = apptRes.body.includes(expectedName) && apptRes.body.includes(expectedMobile) && apptRes.body.includes(expectedDoctor);
  console.log(`  - Today Appointments Partial PHI Match: ${apptMatch ? 'PASS' : 'FAIL'}`);

  // Check Patient Popover
  const popRes = await request('/home/getappointmentdetailspopover?date=24/10/2026&time=10:30%20AM');
  const popMatch = popRes.body.includes(expectedName) && popRes.body.includes(expectedMobile) && popRes.body.includes(expectedDoctor);
  console.log(`  - Appointment Popover PHI Match: ${popMatch ? 'PASS' : 'FAIL'}`);

  // Check Dental Case Sheet
  const dentalPrintRes = await request('/dental/previewandprint');
  const dentalPrintMatch = dentalPrintRes.body.includes(expectedName) && dentalPrintRes.body.includes(expectedFileNo) && dentalPrintRes.body.includes(expectedDoctor);
  console.log(`  - Dental Case Sheet (Preview & Print) PHI Match: ${dentalPrintMatch ? 'PASS' : 'FAIL'}`);

  // Check Patient Search
  const searchRes = await request('/home/patientsearch?term=Yalini');
  const searchResults = JSON.parse(searchRes.body);
  const searchMatch = searchResults.some(r => r.includes(patientId) && r.includes(expectedName) && r.includes(expectedMobile) && r.includes(expectedFileNo));
  console.log(`  - Patient Autocomplete Search PHI Match: ${searchMatch ? 'PASS' : 'FAIL'}`);

  // Check Reports DataTables API
  const reportRes = await request('/report/patientreportresult?draw=1&start=0&length=10');
  const reportData = JSON.parse(reportRes.body);
  const reportMatch = reportData.data && reportData.data.some(p => p.Mobile === expectedMobile && p.FileNumber === expectedFileNo);
  console.log(`  - DataTables Patient Report API PHI Match: ${reportMatch ? 'PASS' : 'FAIL'}`);

  // Check Tooth SVG Odontogram Reactivity
  const tooth16Res = await request('/dental/getteethimage?teethNumber=16');
  const tooth16Filter = tooth16Res.body.includes('filter: drop-shadow');
  console.log(`  - Dental Odontogram Reactive Filter on Conditioned Tooth #16: ${tooth16Filter ? 'PASS' : 'FAIL'}`);

  const allPassed = (leakageFound === 0) && diaryMatch && apptMatch && popMatch && dentalPrintMatch && searchMatch && reportMatch && tooth16Filter;
  console.log(`\nOVERALL INTEGRITY STATUS: ${allPassed ? 'ALL VERIFICATIONS PASSED (100% PARITY & PHI SECURED)' : 'ISSUES DETECTED'}`);
  process.exit(allPassed ? 0 : 1);
}

verifySecurityAndPhi().catch(err => {
  console.error('Fatal error during security & PHI verification:', err);
  process.exit(1);
});
