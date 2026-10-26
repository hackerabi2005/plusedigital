const { chromium } = require('playwright');
const path = 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: path, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/patient/detail?patientid=2223997', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  console.log('Testing Patient Detail Action Buttons:');

  // 1. Test GetAddProcedure
  await page.evaluate(() => { if (typeof GetAddProcedure === 'function') GetAddProcedure(); });
  await page.waitForTimeout(600);
  let formHtml = await page.evaluate(() => document.querySelector('#LoadForms').innerHTML);
  console.log('GetAddProcedure loaded form:', formHtml.includes('Record Clinical Procedure'));

  // 2. Test GetAddPrescription
  await page.evaluate(() => { if (typeof GetAddPrescription === 'function') GetAddPrescription(); });
  await page.waitForTimeout(600);
  formHtml = await page.evaluate(() => document.querySelector('#LoadForms').innerHTML);
  console.log('GetAddPrescription loaded form:', formHtml.includes('Write Prescription'));

  // 3. Test GetAddBill
  await page.evaluate(() => { if (typeof GetAddBill === 'function') GetAddBill(); });
  await page.waitForTimeout(600);
  formHtml = await page.evaluate(() => document.querySelector('#LoadForms').innerHTML);
  console.log('GetAddBill loaded form:', formHtml.includes('Generate Patient Invoice'));

  // 4. Test GetClinicalExamination
  await page.evaluate(() => { if (typeof GetClinicalExamination === 'function') GetClinicalExamination(); });
  await page.waitForTimeout(600);
  formHtml = await page.evaluate(() => document.querySelector('#LoadForms').innerHTML);
  console.log('GetClinicalExamination loaded form:', formHtml.includes('Clinical Examination Record'));

  // 5. Test GetPatientNotes
  await page.evaluate(() => { if (typeof GetPatientNotes === 'function') GetPatientNotes(1); });
  await page.waitForTimeout(600);
  formHtml = await page.evaluate(() => document.querySelector('#LoadForms').innerHTML);
  console.log('GetPatientNotes loaded form:', formHtml.includes('Clinical Patient Notes'));

  await browser.close();
  console.log('Patient action buttons test finished.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
