const { chromium } = require('playwright');
const path = 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: path, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  console.log('Capturing Settings Users subpage...');
  await page.goto('http://localhost:3000/home/users', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshot_settings_users.png', fullPage: true });

  console.log('Capturing Settings Procedure subpage...');
  await page.goto('http://localhost:3000/home/procedure', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshot_settings_procedure.png', fullPage: true });

  console.log('Capturing Patient Communication...');
  await page.goto('http://localhost:3000/patient/patientcommunication?PatientID=2223997&Bill=0', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshot_patient_communication.png', fullPage: true });

  console.log('Capturing Reports with populated DataTables...');
  await page.goto('http://localhost:3000/report/reports', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);
  await page.locator('#GenerateReport').click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: 'screenshot_reports_datatables.png', fullPage: true });

  console.log('Capturing Patient Connect Desktop view...');
  await page.goto('http://localhost:3000/patientconnect/index', { waitUntil: 'networkidle' });
  await page.screenshot({ path: 'screenshot_patientconnect_active.png', fullPage: true });

  await browser.close();
  console.log('All fix evidence screenshots captured successfully.');
})();
