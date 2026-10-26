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

const viewports = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'mobile', width: 390, height: 844 }
];

(async () => {
  const browser = await chromium.launch({ executablePath: path, headless: true });
  const findings = [];

  for (const r of routes) {
    for (const vp of viewports) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: vp.width, height: vp.height });

      const consoleErrors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });

      try {
        await page.goto(`http://localhost:3000${r}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
        await page.waitForTimeout(600);

        // Check horizontal overflow
        const overflow = await page.evaluate(() => {
          return {
            scrollWidth: document.documentElement.scrollWidth,
            clientWidth: document.documentElement.clientWidth,
            bodyScrollWidth: document.body.scrollWidth,
            bodyClientWidth: document.body.clientWidth
          };
        });

        const hasOverflow = overflow.scrollWidth > overflow.clientWidth + 5;

        // Check if main content is hidden or overlapped by fixed headers
        const layoutIssues = await page.evaluate(() => {
          const issues = [];
          const header = document.querySelector('.header, .navbar, .navbar-fixed-top');
          const headerBottom = header ? header.getBoundingClientRect().bottom : 0;

          // Check if first card or main title is tucked under header
          const mainContent = document.querySelector('.content-wrapper, .wrapper, .main-content, .container, .container-fluid');
          if (mainContent && headerBottom > 50) {
            const contentTop = mainContent.getBoundingClientRect().top;
            if (contentTop < headerBottom - 30) {
              issues.push({ type: 'header_overlap', headerBottom, contentTop });
            }
          }

          // Check for empty tab panes
          const emptyPanes = [];
          document.querySelectorAll('.tab-pane').forEach(p => {
            if (p.innerHTML.trim().length === 0) {
              emptyPanes.push(p.id);
            }
          });
          if (emptyPanes.length > 0) {
            issues.push({ type: 'empty_tab_panes', panes: emptyPanes });
          }

          // Check for broken external images
          const brokenImgs = [];
          document.querySelectorAll('img').forEach(img => {
            if (img.src && (img.src.includes('admin.mydigitalclinic.net') || img.naturalWidth === 0)) {
              brokenImgs.push(img.src);
            }
          });
          if (brokenImgs.length > 0) {
            issues.push({ type: 'broken_images', count: brokenImgs.length, sample: brokenImgs.slice(0, 3) });
          }

          return issues;
        });

        if (hasOverflow || layoutIssues.length > 0 || consoleErrors.length > 0) {
          findings.push({
            route: r,
            viewport: vp.name,
            hasOverflow,
            scrollWidth: overflow.scrollWidth,
            clientWidth: overflow.clientWidth,
            layoutIssues,
            consoleErrors
          });
        }

      } catch (err) {
        findings.push({ route: r, viewport: vp.name, error: err.message });
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();
  console.log(JSON.stringify(findings, null, 2));
})().catch(err => {
  console.error(err);
  process.exit(1);
});
