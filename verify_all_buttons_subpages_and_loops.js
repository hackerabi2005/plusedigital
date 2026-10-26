const { chromium } = require('playwright');
const path = 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: path, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const errors = [];
  page.on('pageerror', err => {
    errors.push(`[PAGE ERROR] ${err.message}`);
    console.error(`[PAGE ERROR] ${err.message}`);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[CONSOLE ERROR] ${msg.text()}`);
      console.error(`[CONSOLE ERROR] ${msg.text()}`);
    }
  });

  let passed = 0;
  let failed = 0;

  function assert(condition, testName) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passed++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      failed++;
    }
  }

  console.log('=================================================================');
  console.log('1. TESTING SETTINGS SUB-PAGES & LOOP ELIMINATION');
  console.log('=================================================================');

  const settingsSubPages = [
    { id: 'users', expectedTitle: 'Clinic Users & Roles', url: '/home/users' },
    { id: 'locations', expectedTitle: 'Clinic Practice Locations', url: '/home/locations' },
    { id: 'fees', expectedTitle: 'Consultation Fees Schedule', url: '/home/fees' },
    { id: 'appointmenttimings', expectedTitle: 'Doctor Timings & Schedule', url: '/home/appointmenttiming' },
    { id: 'consents', expectedTitle: 'Clinical Consent Templates', url: '/home/consents' },
    { id: 'groups', expectedTitle: 'Patient Groups & Categories', url: '/home/groups' },
    { id: 'procedures', expectedTitle: 'Procedures & Pricing Catalog', url: '/home/procedure' },
    { id: 'medicalconditions', expectedTitle: 'Medical Conditions Master', url: '/home/medicalconditions' },
    { id: 'supplier', expectedTitle: 'Suppliers & Dental Labs', url: '/inventory/supplier' },
    { id: 'remedies', expectedTitle: 'Prescription Remedies Formulary', url: '/home/remedies' },
    { id: 'packageremedies', expectedTitle: 'Package Remedies & Kits', url: '/home/packageremedies' },
    { id: 'referral', expectedTitle: 'Specialist Referral Directory', url: '/home/referral' }
  ];

  for (const item of settingsSubPages) {
    // Start at Settings page
    await page.goto('http://localhost:3000/home/settings', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(300);

    // Click the card
    const card = page.locator(`#${item.id}`);
    assert(await card.isVisible(), `Settings card #${item.id} is visible`);
    await card.click();
    await page.waitForTimeout(500);

    // Verify it navigated to the subpage and did NOT loop back to the icons
    const currentUrl = page.url();
    assert(currentUrl.toLowerCase().includes(item.url.toLowerCase()), `Navigated to ${item.url} (got ${currentUrl})`);
    
    // Verify subpage title and back button
    const heading = await page.locator('h4').innerText().catch(() => '');
    assert(heading.includes(item.expectedTitle), `Sub-page title contains "${item.expectedTitle}"`);

    const backBtn = page.locator('a:has-text("Back to Settings")');
    assert(await backBtn.isVisible(), `Back to Settings button is visible on ${item.url}`);

    // Click back to settings and verify we return cleanly to settings
    await backBtn.click();
    await page.waitForTimeout(400);
    assert(page.url().includes('/home/settings'), `Returned cleanly to /home/settings from ${item.id}`);
  }

  console.log('\n=================================================================');
  console.log('2. TESTING PATIENT DETAIL BUTTONS & DROPDOWNS (ZERO RELOADS)');
  console.log('=================================================================');
  await page.goto('http://localhost:3000/patient/detail?patientid=2223997', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  // Test Desktop Tab Buttons
  const initialUrl = page.url();
  const consultBtn = page.locator('button#TabBtnConsultation');
  assert(await consultBtn.isVisible(), 'Desktop Consultation History button visible');
  await consultBtn.click();
  await page.waitForTimeout(300);
  assert(page.url() === initialUrl, 'Consultation History button click did not reload page');

  // Test Billing split button
  const billingBtn = page.locator('button#TabBtnBilling');
  assert(await billingBtn.isVisible(), 'Desktop Billing button visible');
  await billingBtn.click();
  await page.waitForTimeout(300);
  assert(page.url() === initialUrl, 'Billing button click did not reload page');

  // Test Clinical Examination action in sidebar
  const clinExamLink = page.locator('a:has-text("Clinical Examination")').first();
  assert(await clinExamLink.isVisible(), 'Clinical Examination sidebar link is visible');
  await clinExamLink.click();
  await page.waitForTimeout(400);
  assert(page.url().split('#')[0] === initialUrl.split('#')[0], 'Clinical Examination action did not reload page');

  // Test Patient Communication navigation
  const patientCommLink = page.locator('a:has-text("Patient Communication")').first();
  assert(await patientCommLink.isVisible(), 'Patient Communication link is visible');
  await patientCommLink.click();
  await page.waitForTimeout(600);
  assert(page.url().includes('/patient/patientcommunication'), 'Patient Communication button navigated correctly');
  const commTitle = await page.locator('h4').first().innerText().catch(() => '');
  assert(commTitle.includes('Patient Communication'), 'Patient Communication page loaded with header');
  const commRows = await page.locator('#commLogsTable tr').count();
  assert(commRows > 0, `Patient Communication table has logs (${commRows} rows)`);

  // Return to Patient Detail
  await page.locator('a:has-text("Back to Patient Record")').click();
  await page.waitForTimeout(500);
  assert(page.url().includes('/patient/detail'), 'Returned cleanly to Patient Record');

  console.log('\n=================================================================');
  console.log('3. TESTING PATIENT CONNECT SMS BUTTON & CREDITS');
  console.log('=================================================================');
  await page.goto('http://localhost:3000/patientconnect/index', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  await page.locator('#EnglishMessage').fill('Hello test message from verification suite');
  const pcUrl = page.url();
  await page.locator('#sendMessage').click();
  await page.waitForTimeout(500);
  assert(page.url() === pcUrl, 'Send Now button in Patient Connect did not trigger full-page href="" reload');
  const toastVisible = (await page.locator('.ns-box').count()) > 0;
  assert(toastVisible, 'Patient Connect message queued feedback presented');

  console.log('\n=================================================================');
  console.log('4. TESTING CALENDAR MODALS (data-toggle="modal")');
  console.log('=================================================================');
  await page.goto('http://localhost:3000/calendar/index', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(600);

  // Block Appointment
  await page.locator('#btnBlockApp').click();
  await page.waitForTimeout(400);
  const blockModal = page.locator('#appointmentblock');
  assert(await blockModal.isVisible(), 'Block Appointment modal opened on button click');
  await page.locator('#appointmentblock button[data-dismiss="modal"]').first().click().catch(() => {});
  await page.waitForTimeout(300);

  // Go to Date
  await page.locator('#btnGotoDate').click();
  await page.waitForTimeout(400);
  const gotoModal = page.locator('#modalGotodate');
  assert(await gotoModal.isVisible(), 'Go to Date modal opened on button click');
  await page.locator('#modalGotodate button[data-dismiss="modal"]').first().click().catch(() => {});
  await page.waitForTimeout(300);

  console.log('\n=================================================================');
  console.log('5. TESTING REPORTS AJAX & DATATABLES JSON');
  console.log('=================================================================');
  await page.goto('http://localhost:3000/report/reports', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(500);

  await page.locator('#GenerateReport').click();
  await page.waitForTimeout(800);
  const reportRows = await page.locator('#example tbody tr').count();
  assert(reportRows > 0, `Reports DataTables loaded successfully (${reportRows} rows rendered)`);
  const firstPatientName = await page.locator('#example tbody tr:first-child td:nth-child(2)').innerText().catch(() => '');
  assert(firstPatientName.length > 0, `Reports table first row contains patient: "${firstPatientName}"`);

  console.log('\n=================================================================');
  console.log(`TOTAL PASSED: ${passed}`);
  console.log(`TOTAL FAILED: ${failed}`);
  console.log(`TOTAL ERRORS: ${errors.length}`);
  console.log('=================================================================');

  await browser.close();
  process.exit(failed > 0 || errors.length > 0 ? 1 : 0);
})();
