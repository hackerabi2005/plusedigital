const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe', headless: true });
  const page = await browser.newPage();
  page.on('console', msg => console.log('CONSOLE:', msg.type(), msg.text()));
  page.on('requestfailed', req => console.log('FAILED REQ:', req.url(), req.failure()?.errorText));
  page.on('response', res => {
    if (res.status() === 404) console.log('404:', res.url());
  });
  await page.goto('http://localhost:3000/home/videos', { waitUntil: 'load', timeout: 10000 });
  await page.waitForTimeout(2000);
  await browser.close();
})();
