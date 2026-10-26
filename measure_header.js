const { chromium } = require('playwright');
const path = 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: path, headless: true });

  for (const r of ['/dental/consultation?patientid=2223997', '/patient/detail?patientid=2223997', '/calendar/index']) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    await page.goto(`http://localhost:3000${r}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const metrics = await page.evaluate(() => {
      const header = document.querySelector('.header') || document.querySelector('.main-header');
      const headerRect = header ? header.getBoundingClientRect() : null;

      const firstVisible = Array.from(document.querySelectorAll('.card, .nav-tabs, .borderCard, .content-wrapper, .box'))
        .filter(el => {
          const r = el.getBoundingClientRect();
          return r.width > 50 && r.height > 50;
        })
        .map(el => ({
          tag: el.tagName,
          class: el.className,
          top: el.getBoundingClientRect().top,
          height: el.getBoundingClientRect().height
        }));

      return { headerRect, firstVisible: firstVisible.slice(0, 4) };
    });

    console.log(`Metrics on ${r}:`);
    console.log(JSON.stringify(metrics, null, 2));
    await page.close();
  }

  await browser.close();
})();
