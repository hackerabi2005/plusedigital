const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const parsedBase = new URL(BASE_URL);

console.log('=====================================================');
console.log(' PULSE DIGITAL CLINIC (MYDIGITALCLINIC.NET) VERIFIER ');
console.log(' Target:', BASE_URL);
console.log('=====================================================\n');

function fetchUrl(pathname, method = 'GET', body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const opts = {
      hostname: parsedBase.hostname,
      port: parsedBase.port || (parsedBase.protocol === 'https:' ? 443 : 80),
      path: pathname,
      method: method,
      headers: {
        'User-Agent': 'PulseClinic-Parity-Verifier/1.0',
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

    const client = parsedBase.protocol === 'https:' ? https : http;
    const req = client.request(opts, (res) => {
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: buffer.toString('utf8'),
          buffer: buffer
        });
      });
    });

    req.on('error', (err) => reject(err));
    if (body) req.write(body);
    req.end();
  });
}

async function runVerification() {
  const results = {
    total: 0,
    passed: 0,
    failed: 0,
    suites: []
  };

  function record(suiteName, testName, pass, message = '') {
    results.total++;
    let s = results.suites.find(x => x.name === suiteName);
    if (!s) {
      s = { name: suiteName, tests: [] };
      results.suites.push(s);
    }
    s.tests.push({ name: testName, pass, message });
    if (pass) {
      results.passed++;
      console.log(`  [PASS] ${testName}`);
    } else {
      results.failed++;
      console.error(`  [FAIL] ${testName} - ${message}`);
    }
  }

  // 1. Primary Page Routes
  console.log('Suite 1: Primary Page Routes Parity');
  const mainRoutes = [
    '/account/login',
    '/home/index',
    '/calendar/index',
    '/home/videos',
    '/lab/laboratory',
    '/patientconnect/index',
    '/report/reports',
    '/social/index',
    '/home/settings',
    '/home/search',
    '/home/profileview',
    '/home/support',
    '/home/faq',
    '/patient/detail?patientid=2223997',
    '/dental/consultation?patientid=2223997',
    '/home/appointmentlist'
  ];

  for (const r of mainRoutes) {
    try {
      const res = await fetchUrl(r);
      const is200 = res.statusCode === 200;
      const hasContent = res.body && res.body.length > 500;
      record('Primary Routes', `Route ${r} (200 OK + Payload)`, is200 && hasContent, `Status: ${res.statusCode}, Length: ${res.body.length}`);
    } catch (e) {
      record('Primary Routes', `Route ${r}`, false, e.message);
    }
  }

  // 2. Dashboard & Navigation AJAX APIs
  console.log('\nSuite 2: Backend REST & Partial Template APIs');
  const apis = [
    { url: '/report/homeweekly2', check: (b) => b.includes('graphset') || b.includes('series') || b.includes('chart') },
    { url: '/home/getappointmentdays?start=0', check: (b) => b.includes('DayScrollItem') && b.includes('data-appointmentdate') },
    { url: '/home/getappointmenttimings?date=24/10/2026', check: (b) => b.includes('AppointmentTime') },
    { url: '/home/getappointmentdetailspopover?date=24/10/2026&time=10:30%20AM', check: (b) => b.includes('Dr. Naveena Ramnath') },
    { url: '/home/todayappointments', check: (b) => b.includes('AppointmentListTable') || b.includes('AppointmentListContainer') },
    { url: '/home/todaycheckins', check: (b) => b.length > 100 },
    { url: '/home/getdoctor', check: (b) => b.length > 10 },
    { url: '/home/getpatientqueue', check: (b) => b.length > 10 },
    { url: '/home/getalertdetails', check: (b) => b.includes('Alert') || b.length > 500 },
    { url: '/home/getnotificationcount', check: (b) => !isNaN(parseInt(b, 10)) },
    { url: '/home/getpatientcheckincount', check: (b) => !isNaN(parseInt(b, 10)) },
    { url: '/home/getrecentactivity', check: (b) => b.length > 100 },
    { url: '/calendar/procedureautocomplete', check: (b) => b.includes('RCT') || b.length > 10 },
    { url: '/calendar/getdiaryevents', check: (b) => b.startsWith('[') },
    { url: '/dental/getteethimage?teethNumber=16', check: (b) => b.includes('<img') && b.includes('16.svg') },
    { url: '/dental/conditions', check: (b) => b.length > 500 },
    { url: '/dental/procedures', check: (b) => b.includes('Root Canal Treatment') },
    { url: '/dental/prescriptionremedies', check: (b) => b.includes('Amoxicillin') },
    { url: '/dental/billing', check: (b) => b.includes('3500') },
    { url: '/dental/previewandprint', check: (b) => b.includes('Dr. Naveena Ramnath') }
  ];

  for (const a of apis) {
    try {
      const res = await fetchUrl(a.url);
      const ok = res.statusCode === 200 && a.check(res.body);
      record('Backend APIs', `API ${a.url}`, ok, `Status: ${res.statusCode}, Length: ${res.body.length}`);
    } catch (e) {
      record('Backend APIs', `API ${a.url}`, false, e.message);
    }
  }

  // 3. Asset Integrity & Offline Parity
  console.log('\nSuite 3: ASSETS.json Parity & Offline Storage');
  let assetsManifest = [];
  try {
    assetsManifest = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'ASSETS.json'), 'utf8'));
  } catch (e) {
    record('Asset Integrity', 'Load ASSETS.json', false, e.message);
  }

  if (assetsManifest.length > 0) {
    record('Asset Integrity', `Assets Manifest Loaded (${assetsManifest.length} items)`, true);

    // Verify sample of critical fonts, CSS, scripts and dental SVG icons
    const sampleAssets = assetsManifest.filter(a =>
      a.url.endsWith('.css') ||
      a.url.endsWith('.js') ||
      a.url.endsWith('.svg') ||
      a.url.endsWith('.ico') ||
      a.url.endsWith('.png')
    ).slice(0, 30);

    let samplePass = 0;
    for (const asset of sampleAssets) {
      try {
        const res = await fetchUrl(asset.url);
        if (res.statusCode === 200 && res.buffer.length > 0) {
          samplePass++;
        }
      } catch (err) {}
    }
    record('Asset Integrity', `Critical Assets HTTP 200 Delivery (${samplePass}/${sampleAssets.length} verified)`, samplePass === sampleAssets.length);
  }

  // 4. Interactive State Workflows & Dental Charting
  console.log('\nSuite 4: Interactive Clinical Replay Workflows');
  try {
    // Check-in workflow
    const initialCountRes = await fetchUrl('/home/getpatientcheckincount');
    const initialCount = parseInt(initialCountRes.body, 10);
    const checkinRes = await fetchUrl('/home/patientcheckin?patientID=2223851&userID=17472');
    const afterCountRes = await fetchUrl('/home/getpatientcheckincount');
    const afterCount = parseInt(afterCountRes.body, 10);
    record('Interactive Replay', 'Patient Check-in Workflow', checkinRes.statusCode === 200 && afterCount >= initialCount);

    // Patient search workflow
    const searchRes = await fetchUrl('/home/patientsearch?term=Yalini');
    const searchData = JSON.parse(searchRes.body);
    const foundPatient = Array.isArray(searchData) && searchData.some(x => x.includes('Yalini') && x.includes('7548801024'));
    record('Interactive Replay', 'Patient Search Autocompletion', foundPatient);

    // Dental Condition Save Workflow
    const saveCondRes = await fetchUrl('/dental/patientdentaldetailconditions', 'POST', {
      dentalConditionID: '1',
      teethNumbers: '16,26',
      CreateDateTime: '24/10/2026'
    });
    record('Interactive Replay', 'Dental Odontogram Condition Update', saveCondRes.statusCode === 200);

    // Day scroll date calculation
    const dayScrollRes = await fetchUrl('/home/getappointmentdays?start=7');
    record('Interactive Replay', 'Dashboard Day Scroller (+7 days navigation)', dayScrollRes.body.includes('DayScrollItem'));
  } catch (err) {
    record('Interactive Replay', 'Clinical Workflows', false, err.message);
  }

  // 5. Build HTML Verification Report
  const reportHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Pulse Digital Clinic Clone Verification Report</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; margin: 2rem; background: #f8fafc; color: #1e293b; }
    .card { background: white; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); padding: 1.5rem; margin-bottom: 1.5rem; }
    .badge { display: inline-block; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: bold; font-size: 0.85rem; }
    .badge-success { background: #dcfce7; color: #15803d; }
    .badge-danger { background: #fee2e2; color: #b91c1c; }
    table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
    th, td { text-align: left; padding: 0.75rem; border-bottom: 1px solid #e2e8f0; }
    th { background: #f1f5f9; }
    .summary { display: flex; gap: 2rem; font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Pulse Digital Clinic 1:1 Clone Verification Report</h1>
    <p>Target: <code>${BASE_URL}</code> | Tested at: ${new Date().toISOString()}</p>
    <div class="summary">
      <div>Total Tests: ${results.total}</div>
      <div style="color: #15803d;">Passed: ${results.passed}</div>
      <div style="color: #b91c1c;">Failed: ${results.failed}</div>
    </div>
    ${results.suites.map(s => `
      <h2>${s.name}</h2>
      <table>
        <thead><tr><th>Test</th><th>Result</th><th>Notes</th></tr></thead>
        <tbody>
          ${s.tests.map(t => `
            <tr>
              <td>${t.name}</td>
              <td><span class="badge ${t.pass ? 'badge-success' : 'badge-danger'}">${t.pass ? 'PASS' : 'FAIL'}</span></td>
              <td>${t.message || '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `).join('')}
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(process.cwd(), 'verify_report.html'), reportHtml);
  console.log('\nReport generated: verify_report.html');

  console.log('\n=====================================================');
  console.log(`SUMMARY: ${results.passed}/${results.total} Passed (${results.failed} Failures)`);
  console.log('=====================================================');

  if (results.failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runVerification().catch(err => {
  console.error('Fatal verifier error:', err);
  process.exit(1);
});
