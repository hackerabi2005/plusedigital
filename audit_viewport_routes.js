const { chromium } = require('playwright');
const fs = require('fs');
const chromePath = 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';

const routes = [
  { name: 'Login', path: '/account/login' },
  { name: 'Dashboard', path: '/home/index' },
  { name: 'Calendar', path: '/calendar/index' },
  { name: 'Videos', path: '/home/videos' },
  { name: 'Laboratory', path: '/lab/laboratory' },
  { name: 'Patient Connect', path: '/patientconnect/index' },
  { name: 'Reports', path: '/report/reports' },
  { name: 'Social', path: '/social/index' },
  { name: 'Settings', path: '/home/settings' },
  { name: 'Search', path: '/home/search' },
  { name: 'Profile View', path: '/home/profileview' },
  { name: 'Support', path: '/home/support' },
  { name: 'FAQ', path: '/home/faq' },
  { name: 'Patient Detail', path: '/patient/detail?patientid=2223997' },
  { name: 'Dental Consultation', path: '/dental/consultation?patientid=2223997' },
  { name: 'Appointment List', path: '/home/appointmentlist' }
];

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];

(async () => {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const results = [];

  console.log('=== STARTING 16-ROUTE x 3-VIEWPORT VERIFICATION AUDIT ===\n');

  for (const vp of viewports) {
    console.log(`--- Testing Viewport: ${vp.name.toUpperCase()} (${vp.width}x${vp.height}) ---`);

    for (const r of routes) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: vp.width, height: vp.height });

      const consoleErrors = [];
      const pageErrors = [];
      const failedRequests = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', err => {
        pageErrors.push(err.message);
      });
      page.on('requestfailed', req => {
        // Track local failed requests (ignore external 3rd-party network timeouts)
        if (req.url().includes('localhost')) {
          failedRequests.push({ url: req.url(), failure: req.failure()?.errorText });
        }
      });

      let status = 0;
      let error = null;

      try {
        const response = await page.goto(`http://localhost:3000${r.path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 25000
        });
        status = response ? response.status() : 0;
        await page.waitForTimeout(1000);

        // Evaluation in DOM
        const auditData = await page.evaluate((vpWidth) => {
          // 1. Broken images (filter out SVG sprite symbols or data URIs)
          const imgs = Array.from(document.querySelectorAll('img'));
          const brokenImgs = imgs.filter(img => {
            if (!img.src || img.getAttribute('src') === '') return true;
            return img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0);
          }).map(img => ({
            src: img.src,
            alt: img.alt || '',
            className: img.className || ''
          }));

          // 2. Horizontal overflow check
          const docScrollWidth = document.documentElement.scrollWidth;
          const bodyScrollWidth = document.body.scrollWidth;
          const innerW = window.innerWidth;
          // Subpixel tolerance 1px
          const hasHorizontalOverflow = docScrollWidth > innerW + 1 || bodyScrollWidth > innerW + 1;

          // Find offending overflowing elements if any
          const overflowingElements = [];
          if (hasHorizontalOverflow) {
            const allElements = Array.from(document.querySelectorAll('*'));
            for (const el of allElements) {
              const rect = el.getBoundingClientRect();
              if (rect.right > innerW + 2 && el.tagName !== 'HTML' && el.tagName !== 'BODY') {
                overflowingElements.push({
                  tag: el.tagName,
                  id: el.id,
                  className: el.className,
                  right: Math.round(rect.right),
                  width: Math.round(rect.width)
                });
                if (overflowingElements.length >= 5) break;
              }
            }
          }

          // 3. Structure check
          const hasHeader = !!document.querySelector('header, .header, .top-header, #header, nav, .navbar, .top-nav, .main-header');
          const bodyText = document.body.innerText.trim();
          const hasContent = bodyText.length > 20;
          const totalElements = document.querySelectorAll('*').length;

          // 4. Scroll motion readiness
          const docH = document.documentElement.scrollHeight;
          const bodyH = document.body.scrollHeight;
          const scrollHeight = Math.max(docH, bodyH);
          const clientHeight = document.documentElement.clientHeight;
          const isScrollable = scrollHeight > clientHeight + 10;

          return {
            totalImages: imgs.length,
            brokenImgs,
            docScrollWidth,
            bodyScrollWidth,
            innerW,
            hasHorizontalOverflow,
            overflowingElements,
            hasHeader,
            hasContent,
            bodyTextLength: bodyText.length,
            totalElements,
            scrollHeight,
            clientHeight,
            isScrollable
          };
        }, vp.width);

        // Test vertical scrolling motion
        let scrollMotionWorks = true;
        if (auditData.isScrollable) {
          await page.evaluate(() => {
            window.scrollTo(0, 150);
            if (document.body.scrollTop === 0 && document.documentElement.scrollTop === 0) {
              document.body.scrollTop = 150;
            }
          });
          await page.waitForTimeout(100);
          const scrolledY = await page.evaluate(() => {
            return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop;
          });
          scrollMotionWorks = scrolledY > 0;
          await page.evaluate(() => {
            window.scrollTo(0, 0);
            document.body.scrollTop = 0;
            document.documentElement.scrollTop = 0;
          });
        }

        const passed = status === 200 &&
                       consoleErrors.length === 0 &&
                       pageErrors.length === 0 &&
                       failedRequests.length === 0 &&
                       auditData.brokenImgs.length === 0 &&
                       !auditData.hasHorizontalOverflow &&
                       scrollMotionWorks;

        const resultItem = {
          route: r.path,
          name: r.name,
          viewport: vp.name,
          width: vp.width,
          height: vp.height,
          status,
          consoleErrors,
          pageErrors,
          failedRequests,
          brokenImagesCount: auditData.brokenImgs.length,
          brokenImages: auditData.brokenImgs,
          hasHorizontalOverflow: auditData.hasHorizontalOverflow,
          docScrollWidth: auditData.docScrollWidth,
          overflowingElements: auditData.overflowingElements,
          hasHeader: auditData.hasHeader,
          hasContent: auditData.hasContent,
          bodyTextLength: auditData.bodyTextLength,
          totalElements: auditData.totalElements,
          isScrollable: auditData.isScrollable,
          scrollMotionWorks,
          passed
        };

        results.push(resultItem);

        console.log(`[${vp.name.toUpperCase().padEnd(7)}] ${r.name.padEnd(20)} | Status: ${status} | Err: ${consoleErrors.length + pageErrors.length} | BrokenImg: ${auditData.brokenImgs.length} | HorizOverflow: ${auditData.hasHorizontalOverflow ? 'YES (' + auditData.docScrollWidth + 'px)' : 'NO'} | Scroll: ${scrollMotionWorks ? 'OK' : 'FAIL'} | Pass: ${passed ? 'PASS' : 'WARN/FAIL'}`);

      } catch (e) {
        error = e.message;
        console.error(`[${vp.name.toUpperCase()}] ${r.name} ERROR: ${e.message}`);
        results.push({
          route: r.path,
          name: r.name,
          viewport: vp.name,
          width: vp.width,
          height: vp.height,
          status,
          error,
          passed: false
        });
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();

  fs.writeFileSync('viewport_audit_report.json', JSON.stringify(results, null, 2));

  // Generate an attractive HTML report
  const htmlRows = results.map(r => `
    <tr class="${r.passed ? 'table-success' : 'table-danger'}">
      <td><strong>${r.name}</strong><br><small class="text-muted">${r.route}</small></td>
      <td><span class="badge ${r.viewport === 'mobile' ? 'badge-primary' : r.viewport === 'tablet' ? 'badge-info' : 'badge-dark'}">${r.viewport.toUpperCase()} (${r.width}px)</span></td>
      <td><span class="badge ${r.status === 200 ? 'badge-success' : 'badge-danger'}">${r.status}</span></td>
      <td>${(r.consoleErrors?.length || 0) + (r.pageErrors?.length || 0)}</td>
      <td>${r.brokenImagesCount ?? 0}</td>
      <td>${r.hasHorizontalOverflow ? '<span class="text-danger font-weight-bold">YES (' + r.docScrollWidth + 'px)</span>' : '<span class="text-success">NO</span>'}</td>
      <td>${r.scrollMotionWorks ? '<span class="text-success">OK</span>' : '<span class="text-danger">FAIL</span>'}</td>
      <td><span class="badge ${r.passed ? 'badge-success' : 'badge-danger'}">${r.passed ? 'PASSED' : 'FAILED'}</span></td>
    </tr>
  `).join('');

  const htmlReport = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Frontend Route & Viewport Audit Report - Pulse PMS</title>
  <link rel="stylesheet" href="http://localhost:3000/Content/bootstrap/css/bootstrap.min.css">
  <style>
    body { padding: 30px; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .card { box-shadow: 0 4px 12px rgba(0,0,0,0.08); border-radius: 8px; margin-bottom: 25px; }
    .badge { font-size: 85%; padding: 5px 8px; }
    .table td, .table th { vertical-align: middle; }
  </style>
</head>
<body>
  <div class="container-fluid">
    <div class="card p-4">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
          <h2 class="mb-1 text-primary">Frontend Route & Viewport Audit Report</h2>
          <p class="text-muted mb-0">16 Page Routes &times; 3 Responsive Viewports (390px, 768px, 1440px) | 1:1 Pulse PMS Clone</p>
        </div>
        <div class="text-right">
          <h3 class="mb-0 ${results.every(r => r.passed) ? 'text-success' : 'text-danger'}">${results.filter(r => r.passed).length} / ${results.length} PASSED</h3>
          <small class="text-muted">Generated ${new Date().toLocaleString()}</small>
        </div>
      </div>
      <table class="table table-bordered table-hover">
        <thead class="thead-dark">
          <tr>
            <th>Route Name & URL</th>
            <th>Viewport</th>
            <th>HTTP Status</th>
            <th>Console Errors</th>
            <th>Broken Images</th>
            <th>Horizontal Overflow</th>
            <th>Scroll Motion</th>
            <th>Result</th>
          </tr>
        </thead>
        <tbody>
          ${htmlRows}
        </tbody>
      </table>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('viewport_audit_report.html', htmlReport);
  console.log('\nAudit complete! Saved detailed results to viewport_audit_report.json and viewport_audit_report.html');

  const totalTests = results.length;
  const passedTests = results.filter(r => r.passed).length;
  console.log(`\n========================================`);
  console.log(`FINAL RESULT: ${passedTests} / ${totalTests} TESTS PASSED (100% target)`);
  console.log(`========================================\n`);
})().catch(err => {
  console.error('Fatal audit error:', err);
  process.exit(1);
});
