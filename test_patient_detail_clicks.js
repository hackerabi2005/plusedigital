const { chromium } = require('playwright');
const path = 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: path, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('pageerror', err => errors.push(err.message));

  await page.goto('http://localhost:3000/patient/detail?patientid=2223997', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  console.log('Testing direct clicks on Patient Detail elements:');

  // Test 1: Click "Clinical Examination"
  console.log('1. Clicking Clinical Examination...');
  await page.click('a[onclick*="GetClinicalExamination"]');
  await page.waitForTimeout(400);
  let formText = await page.evaluate(() => document.querySelector('#LoadForms')?.innerText || '');
  console.log('LoadForms contains Clinical Examination:', formText.includes('Clinical Examination'));

  // Test 2: Click "Procedures"
  console.log('2. Clicking Procedures...');
  await page.click('a[onclick*="GetAddProcedure"]');
  await page.waitForTimeout(400);
  formText = await page.evaluate(() => document.querySelector('#LoadForms')?.innerText || '');
  console.log('LoadForms contains Record Clinical Procedure:', formText.includes('Record Clinical Procedure'));

  // Test 3: Click "Schedule Appointment"
  console.log('3. Clicking Schedule Appointment...');
  await page.click('a[onclick*="showUrlInDialog1"]');
  await page.waitForTimeout(600);
  const modalVisible = await page.evaluate(() => {
    const m = document.querySelector('#dialogAppointment');
    return m && (m.classList.contains('show') || window.getComputedStyle(m).display !== 'none');
  });
  console.log('Schedule Appointment Modal (#dialogAppointment) visible:', modalVisible);
  const modalContent = await page.evaluate(() => document.querySelector('#patientAppointment')?.innerText || '');
  console.log('Appointment form loaded in modal:', modalContent.includes('Patient') || modalContent.includes('Doctor'));

  // Close the appointment modal
  await page.click('#dialogAppointment button[data-dismiss="modal"]');
  await page.waitForTimeout(600);

  // Test 4: Click "Check Ins"
  console.log('4. Clicking Check Ins...');
  await page.click('#checkins');
  await page.waitForTimeout(600);
  const checkinModal = await page.evaluate(() => {
    const m = document.querySelector('#dialogDoctor');
    return m && (m.classList.contains('show') || window.getComputedStyle(m).display !== 'none');
  });
  console.log('Doctor Check In Modal visible:', checkinModal);
  const docName = await page.evaluate(() => document.querySelector('#doctorName')?.innerText || '');
  console.log('Doctor name loaded in checkin modal:', docName.includes('Dr. Naveena Ramnath'));

  // Close the doctor modal
  await page.click('#dialogDoctor button[data-dismiss="modal"]');
  await page.waitForTimeout(600);

  // Test 5: Click "Add Lab Order"
  console.log('5. Clicking Add Lab Order...');
  await page.click('#detailAddLabOrder');
  await page.waitForTimeout(600);
  const labModal = await page.evaluate(() => {
    const m = document.querySelector('#popupOrderadd');
    return m && (m.classList.contains('show') || window.getComputedStyle(m).display !== 'none');
  });
  console.log('Add Lab Order modal visible:', labModal);

  console.log('Errors caught:', errors);
  await browser.close();
  console.log('All Patient Detail interactive elements test completed successfully!');
})();
