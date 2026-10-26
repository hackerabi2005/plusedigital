const { chromium } = require('playwright');
const path = 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: path, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/dental/consultation?patientid=2223997', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  const tabs = [
    { id: '#tab1', section: '#section1', expected: '18.svg' },
    { id: '#tab2', section: '#section2', expected: 'Treatment Plan & Procedures' },
    { id: '#tab3', section: '#section3', expected: 'Prescription' },
    { id: '#tab4', section: '#section4', expected: 'Consultation Invoice & Billing' },
    { id: '#tab5', section: '#section5', expected: 'Pulse Digital Dental Clinic' },
    { id: '#tab6', section: '#section6', expected: 'Previous Consultation' }
  ];

  console.log('Testing 6 Dental Consultation Tabs:');
  for (const t of tabs) {
    await page.click(t.id);
    await page.waitForTimeout(500);

    const isVisible = await page.evaluate((secId) => {
      const el = document.querySelector(secId);
      if (!el) return false;
      const style = window.getComputedStyle(el);
      return style.display !== 'none' && el.offsetHeight > 0;
    }, t.section);

    const textContent = await page.evaluate((secId) => {
      const el = document.querySelector(secId);
      return el ? el.innerHTML : '';
    }, t.section);

    const hasExpected = textContent.includes(t.expected);
    console.log(`Tab ${t.id} -> ${t.section}: isVisible = ${isVisible}, hasExpectedText = ${hasExpected}`);
    await page.screenshot({ path: `tab_${t.id.replace('#', '')}.png` });
  }

  await browser.close();
  console.log('Dental tabs test finished.');
})().catch(err => {
  console.error(err);
  process.exit(1);
});
