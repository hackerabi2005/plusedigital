const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe', headless: true });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
  page.on('requestfailed', req => console.log('FAILED REQ:', req.url(), req.failure()?.errorText));

  console.log('Navigating to /social/index...');
  const t0 = Date.now();
  await page.goto('http://localhost:3000/social/index', { waitUntil: 'load', timeout: 10000 });
  console.log(`Loaded /social/index in ${Date.now() - t0}ms`);

  const posterCount = await page.evaluate(() => document.querySelectorAll('img.img-responsive').length);
  console.log(`Rendered posters count: ${posterCount}`);
  console.log(`Errors caught: ${errors.length}`, errors);

  await browser.close();
})();
