const { chromium } = require('playwright');
const path = 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';

const pagesToTest = [
  { name: 'Dashboard', url: '/home/index' },
  { name: 'Calendar', url: '/calendar/index' },
  { name: 'Appointment List', url: '/home/appointmentlist' },
  { name: 'Dental Consultation', url: '/dental/consultation?patientid=2223997' },
  { name: 'Patient Detail', url: '/patient/detail?patientid=2223997' },
  { name: 'Laboratory', url: '/lab/laboratory' },
  { name: 'Patient Connect', url: '/patientconnect/index' },
  { name: 'Reports', url: '/report/reports' },
  { name: 'Social', url: '/social/index' },
  { name: 'Settings', url: '/home/settings' },
  { name: 'Search', url: '/home/search' },
  { name: 'Profile View', url: '/home/profileview' },
  { name: 'Support', url: '/home/support' },
  { name: 'FAQ', url: '/home/faq' },
  { name: 'Videos', url: '/home/videos' },
  { name: 'Login', url: '/account/login' }
];

(async () => {
  const browser = await chromium.launch({ executablePath: path, headless: true });
  const report = [];

  for (const p of pagesToTest) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    const pageErrors = [];
    const consoleErrors = [];
    const failedRequests = [];

    page.on('pageerror', err => pageErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });
    page.on('requestfailed', req => failedRequests.push({ url: req.url(), error: req.failure().errorText }));

    try {
      const response = await page.goto(`http://localhost:3000${p.url}`, { waitUntil: 'load', timeout: 15000 });
      await page.waitForTimeout(1000);

      // 1. Check all links on this page
      const links = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('a')).map(a => {
          const rect = a.getBoundingClientRect();
          return {
            href: a.getAttribute('href'),
            text: (a.innerText || a.getAttribute('title') || '').trim().replace(/\s+/g, ' '),
            id: a.id,
            className: a.className,
            visible: rect.width > 0 && rect.height > 0,
            hasOnClick: !!a.getAttribute('onclick')
          };
        });
      });

      // 2. Check all buttons on this page
      const buttons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"], .btn')).map(b => {
          const rect = b.getBoundingClientRect();
          return {
            tag: b.tagName,
            text: (b.innerText || b.value || b.getAttribute('title') || '').trim().replace(/\s+/g, ' '),
            id: b.id,
            className: b.className,
            visible: rect.width > 0 && rect.height > 0,
            hasOnClick: !!b.getAttribute('onclick')
          };
        });
      });

      // 3. Check for empty primary containers or missing data
      const domDetails = await page.evaluate(() => {
        const bodyText = document.body.innerText.trim();
        const tables = Array.from(document.querySelectorAll('table')).map(t => ({
          id: t.id,
          rows: t.rows.length
        }));
        const forms = Array.from(document.querySelectorAll('form')).map(f => ({
          id: f.id,
          action: f.action
        }));
        return {
          bodyLength: bodyText.length,
          tables,
          forms
        };
      });

      // 4. Test clicking links that might be broken
      const brokenLinks = [];
      for (const l of links) {
        if (!l.href) continue;
        if (l.href === '#' || l.href.startsWith('javascript:')) {
          if (!l.hasOnClick && !l.id && !l.className.includes('dropdown') && !l.className.includes('toggle')) {
            brokenLinks.push({ link: l, issue: 'Dead anchor with href="#" and no onclick handler' });
          }
        } else if (!l.href.startsWith('http')) {
          // relative link
          const resolved = new URL(l.href, `http://localhost:3000${p.url}`).pathname;
          // check if resolved route is known
        }
      }

      report.push({
        page: p.name,
        url: p.url,
        status: response ? response.status() : 'error',
        bodyLength: domDetails.bodyLength,
        tablesCount: domDetails.tables.length,
        linksCount: links.length,
        buttonsCount: buttons.length,
        pageErrors,
        consoleErrors,
        failedRequestsCount: failedRequests.length,
        failedRequestsSample: failedRequests.slice(0, 5),
        deadLinksCount: brokenLinks.length,
        deadLinksSample: brokenLinks.slice(0, 5)
      });

    } catch (err) {
      report.push({ page: p.name, url: p.url, error: err.message });
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log(JSON.stringify(report, null, 2));
})().catch(err => {
  console.error(err);
  process.exit(1);
});
