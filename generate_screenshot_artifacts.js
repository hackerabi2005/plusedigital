const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';

const pages = [
  { name: 'Login', route: '/account/login', file: 'account_login.html' },
  { name: 'Dashboard', route: '/home/index', file: 'home_index.html' },
  { name: 'Calendar', route: '/calendar/index', file: 'calendar.html' },
  { name: 'Appointment_List', route: '/home/appointmentlist', file: 'appointment_list.html' },
  { name: 'Dental_Consultation', route: '/dental/consultation?patientid=2223997', file: 'dental_consultation.html' },
  { name: 'Patient_Detail', route: '/patient/detail?patientid=2223997', file: 'patient_detail.html' },
  { name: 'Laboratory', route: '/lab/laboratory', file: 'lab.html' },
  { name: 'Patient_Connect', route: '/patientconnect/index', file: 'patientconnect.html' },
  { name: 'Reports', route: '/report/reports', file: 'reports.html' },
  { name: 'Social', route: '/social/index', file: 'social.html' },
  { name: 'Settings', route: '/home/settings', file: 'settings.html' },
  { name: 'Search', route: '/home/search', file: 'search.html' },
  { name: 'Profile_View', route: '/home/profileview', file: 'profileview.html' },
  { name: 'Support', route: '/home/support', file: 'support.html' },
  { name: 'FAQ', route: '/home/faq', file: 'faq.html' },
  { name: 'Videos', route: '/home/videos', file: 'videos.html' }
];

(async () => {
  const origDir = path.join(__dirname, 'screenshots', 'original');
  const cloneDir = path.join(__dirname, 'screenshots', 'clone');
  fs.mkdirSync(origDir, { recursive: true });
  fs.mkdirSync(cloneDir, { recursive: true });

  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const manifest = [];

  console.log('Generating Original vs Clone Screenshot Artifacts (16 Views)...');

  for (const p of pages) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    // Mock external third-party calls so rendering captured pages doesn't hang
    await page.route('**', (route) => {
      const url = route.request().url();
      if (url.includes('google') || url.includes('zingchart') || url.includes('youtube') || url.includes('admin.mydigitalclinic.net')) {
        return route.fulfill({ status: 200, contentType: 'application/javascript', body: '' });
      }
      return route.continue();
    });

    const origPath = path.join(origDir, `original_${p.name}.png`);
    const clonePath = path.join(cloneDir, `clone_${p.name}.png`);

    // 1. Capture Original Page
    try {
      await page.goto(`http://localhost:3000${p.route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      const rawHtmlPath = path.join(__dirname, 'captured-pages', p.file);
      if (fs.existsSync(rawHtmlPath)) {
        const rawHtml = fs.readFileSync(rawHtmlPath, 'utf8');
        await page.setContent(rawHtml, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(600);
        await page.screenshot({ path: origPath, fullPage: true });
      }
    } catch (e) {
      console.error(`Error capturing original ${p.name}:`, e.message);
    }

    // 2. Capture Clone Page
    try {
      await page.goto(`http://localhost:3000${p.route}`, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(600);
      await page.screenshot({ path: clonePath, fullPage: true });
    } catch (e) {
      console.error(`Error capturing clone ${p.name}:`, e.message);
    }

    await page.close();

    const origStat = fs.existsSync(origPath) ? fs.statSync(origPath) : null;
    const cloneStat = fs.existsSync(clonePath) ? fs.statSync(clonePath) : null;

    console.log(`[OK] ${p.name}: Original (${origStat ? origStat.size + ' B' : 'MISSING'}) | Clone (${cloneStat ? cloneStat.size + ' B' : 'MISSING'})`);

    manifest.push({
      name: p.name,
      route: p.route,
      capturedHtml: p.file,
      originalScreenshot: `screenshots/original/original_${p.name}.png`,
      originalSize: origStat ? origStat.size : 0,
      cloneScreenshot: `screenshots/clone/clone_${p.name}.png`,
      cloneSize: cloneStat ? cloneStat.size : 0
    });
  }

  await browser.close();

  // Write comparison manifest
  fs.writeFileSync(path.join(__dirname, 'screenshots', 'manifest.json'), JSON.stringify(manifest, null, 2));

  // Build comparison HTML
  const compHtml = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Pulse PMS: Original vs Clone Screenshot Visual Parity</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: #0f172a; color: #f8fafc; margin: 0; padding: 2rem; }
    h1 { margin-bottom: 0.5rem; }
    p.sub { color: #94a3b8; margin-bottom: 2rem; }
    .page-card { background: #1e293b; border-radius: 8px; padding: 1.5rem; margin-bottom: 2rem; border: 1px solid #334155; }
    .page-title { font-size: 1.25rem; font-weight: bold; margin-bottom: 1rem; color: #38bdf8; display: flex; justify-content: space-between; }
    .side-by-side { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; }
    .pane { background: #0b1120; border-radius: 6px; padding: 1rem; border: 1px solid #1e293b; }
    .pane h4 { margin-top: 0; color: #cbd5e1; display: flex; justify-content: space-between; }
    .pane img { width: 100%; border-radius: 4px; border: 1px solid #334155; }
    .meta { font-size: 0.85rem; color: #64748b; font-weight: normal; }
  </style>
</head>
<body>
  <h1>Pulse PMS Visual Parity: Original Captured vs 1:1 Cleaned Clone</h1>
  <p class="sub">Auditing 16 Core Application Interfaces (1440x900 Full-Page High Fidelity)</p>
  ${manifest.map(m => `
    <div class="page-card">
      <div class="page-title">
        <span>${m.name.replace(/_/g, ' ')}</span>
        <span style="font-family: monospace; font-size: 0.9rem; color: #a5b4fc;">${m.route}</span>
      </div>
      <div class="side-by-side">
        <div class="pane">
          <h4>Original Captured (Production) <span class="meta">${(m.originalSize / 1024).toFixed(1)} KB</span></h4>
          <img src="original/original_${m.name}.png" alt="Original ${m.name}" loading="lazy" />
        </div>
        <div class="pane">
          <h4>Cloned & Repaired (Localhost) <span class="meta">${(m.cloneSize / 1024).toFixed(1)} KB</span></h4>
          <img src="clone/clone_${m.name}.png" alt="Clone ${m.name}" loading="lazy" />
        </div>
      </div>
    </div>
  `).join('')}
</body>
</html>`;
  fs.writeFileSync(path.join(__dirname, 'screenshots', 'comparison.html'), compHtml);
  console.log('\nScreenshot artifacts generated and comparison manifest created at screenshots/manifest.json');
})();
