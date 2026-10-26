const { chromium } = require('playwright');
const path = 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';

(async () => {
  const browser = await chromium.launch({ executablePath: path, headless: true });
  const page = await browser.newPage();
  await page.setViewportSize({ width: 1440, height: 900 });

  await page.goto('http://localhost:3000/home/index', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1000);

  // Extract all links on the dashboard
  const links = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('a[href]')).map(a => ({
      href: a.getAttribute('href'),
      text: a.innerText.trim().replace(/\s+/g, ' '),
      selector: a.id ? '#' + a.id : (a.className ? '.' + a.className.split(' ').join('.') : null)
    }));
  });

  console.log(`Found ${links.length} total links on /home/index`);

  // Test clicking each link that is internal
  for (const l of links) {
    if (!l.href || l.href.startsWith('#') || l.href.startsWith('javascript:') || l.href.startsWith('http')) {
      continue;
    }
    const testPage = await browser.newPage();
    try {
      const targetUrl = new URL(l.href, 'http://localhost:3000/home/index').toString();
      const res = await testPage.goto(targetUrl, { timeout: 5000, waitUntil: 'domcontentloaded' });
      const status = res ? res.status() : 'none';
      if (status !== 200) {
        console.log(`[BROKEN LINK] [${l.text}] href="${l.href}" resolved to "${targetUrl}" -> Status: ${status}`);
      } else {
        console.log(`[OK LINK] [${l.text || '(icon)'}] href="${l.href}" -> 200`);
      }
    } catch (e) {
      console.log(`[FAILED LINK] [${l.text}] href="${l.href}" -> ${e.message}`);
    } finally {
      await testPage.close();
    }
  }

  await browser.close();
})().catch(err => {
  console.error(err);
  process.exit(1);
});
