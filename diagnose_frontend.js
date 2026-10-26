const { chromium } = require('playwright');
const path = 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';

const routes = [
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

(async () => {
  const browser = await chromium.launch({ executablePath: path, headless: true });
  const results = [];

  for (const r of routes) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    const errors = [];
    const consoleLogs = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') consoleLogs.push(msg.text());
    });

    try {
      const response = await page.goto(`http://localhost:3000${r}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(1000);

      // Check for broken images
      const brokenImages = await page.evaluate(() => {
        const imgs = Array.from(document.querySelectorAll('img'));
        return imgs.filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src);
      });

      // Check all buttons
      const buttonsInfo = await page.evaluate(() => {
        const btns = Array.from(document.querySelectorAll('button, .btn, a.btn, input[type="button"], input[type="submit"]'));
        return btns.map(b => ({
          tag: b.tagName,
          text: (b.innerText || b.value || '').trim().slice(0, 30),
          id: b.id,
          classes: b.className,
          hasOnclick: !!b.getAttribute('onclick'),
          hasHref: !!b.getAttribute('href')
        }));
      });

      // Check all navigation links
      const linksInfo = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('a[href]'));
        return links.map(a => ({
          href: a.getAttribute('href'),
          text: a.innerText.trim().slice(0, 30)
        })).filter(l => !l.href.startsWith('#') && !l.href.startsWith('javascript:'));
      });

      // Check for horizontal overflow (UI break)
      const overflow = await page.evaluate(() => {
        return {
          scrollWidth: document.documentElement.scrollWidth,
          clientWidth: document.documentElement.clientWidth,
          hasHScroll: document.documentElement.scrollWidth > document.documentElement.clientWidth
        };
      });

      results.push({
        route: r,
        status: response ? response.status() : 'no-response',
        pageErrors: errors,
        consoleErrors: consoleLogs,
        brokenImagesCount: brokenImages.length,
        brokenImagesSample: brokenImages.slice(0, 5),
        buttonCount: buttonsInfo.length,
        linkCount: linksInfo.length,
        overflow
      });

    } catch (e) {
      results.push({ route: r, error: e.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})().catch(err => {
  console.error('Diagnostic error:', err);
  process.exit(1);
});
