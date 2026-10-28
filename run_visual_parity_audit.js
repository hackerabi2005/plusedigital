const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const chromePath = 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';

const routes = [
  { name: 'Login', path: '/account/login' },
  { name: 'Dashboard', path: '/home/index' },
  { name: 'Calendar', path: '/calendar/index' },
  { name: 'Appointment_List', path: '/home/appointmentlist' },
  { name: 'Videos', path: '/home/videos' },
  { name: 'Laboratory', path: '/lab/laboratory' },
  { name: 'Patient_Connect', path: '/patientconnect/index' },
  { name: 'Reports', path: '/report/reports' },
  { name: 'Social', path: '/social/index' },
  { name: 'Settings', path: '/home/settings' },
  { name: 'Search', path: '/home/search' },
  { name: 'Profile_View', path: '/home/profileview' },
  { name: 'Support', path: '/home/support' },
  { name: 'FAQ', path: '/home/faq' },
  { name: 'Patient_Detail', path: '/patient/detail?patientid=2223997' },
  { name: 'Dental_Consultation', path: '/dental/consultation?patientid=2223997' }
];

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 }
];

// Ensure screenshot directories exist
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
for (const vp of viewports) {
  const dir = path.join(SCREENSHOTS_DIR, vp.name);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}
const toggleDir = path.join(SCREENSHOTS_DIR, 'toggles');
if (!fs.existsSync(toggleDir)) {
  fs.mkdirSync(toggleDir, { recursive: true });
}

async function runAudit() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const auditResults = [];

  console.log(`=== STARTING RESPONSIVE VISUAL PARITY AUDIT ===`);
  console.log(`Routes: ${routes.length} | Viewports: ${viewports.length} | Total Combinations: ${routes.length * viewports.length}\n`);

  for (const vp of viewports) {
    console.log(`\n======================================================`);
    console.log(`TESTING VIEWPORT: ${vp.name.toUpperCase()} (${vp.width}x${vp.height})`);
    console.log(`======================================================`);

    for (const route of routes) {
      const page = await browser.newPage();
      await page.setViewportSize({ width: vp.width, height: vp.height });

      const consoleErrors = [];
      const pageErrors = [];
      const networkErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      page.on('pageerror', err => {
        pageErrors.push(err.message);
      });
      page.on('requestfailed', req => {
        if (req.url().includes('localhost') || req.url().includes('127.0.0.1')) {
          networkErrors.push({ url: req.url(), error: req.failure()?.errorText });
        }
      });

      let httpStatus = 0;
      let navError = null;

      try {
        const res = await page.goto(`http://localhost:3000${route.path}`, {
          waitUntil: 'networkidle',
          timeout: 25000
        }).catch(async () => {
          return await page.goto(`http://localhost:3000${route.path}`, {
            waitUntil: 'domcontentloaded',
            timeout: 25000
          });
        });

        httpStatus = res ? res.status() : 0;
        await page.waitForTimeout(1000); // Allow DOM layouts to settle

        // Deep DOM analysis
        const domAnalysis = await page.evaluate((vpWidth) => {
          const innerW = window.innerWidth;
          const docScrollW = document.documentElement.scrollWidth;
          const bodyScrollW = document.body.scrollWidth;
          
          // Subpixel tolerance 1px
          const hasHorizontalOverflow = docScrollW > innerW + 1 || bodyScrollW > innerW + 1;

          const overflowingElements = [];
          if (hasHorizontalOverflow) {
            const all = document.querySelectorAll('*');
            for (const el of all) {
              if (el.tagName === 'HTML' || el.tagName === 'BODY' || el.tagName === 'SCRIPT' || el.tagName === 'STYLE') continue;
              const r = el.getBoundingClientRect();
              if (r.right > innerW + 2) {
                overflowingElements.push({
                  tagName: el.tagName,
                  id: el.id || null,
                  className: el.className ? String(el.className).substring(0, 100) : null,
                  right: Math.round(r.right),
                  width: Math.round(r.width)
                });
                if (overflowingElements.length >= 8) break;
              }
            }
          }

          // Broken images check
          const allImages = Array.from(document.querySelectorAll('img'));
          const brokenImages = allImages.filter(img => {
            const src = img.getAttribute('src');
            if (!src || src.trim() === '') return true;
            if (img.complete && (img.naturalWidth === 0 || img.naturalHeight === 0)) return true;
            return false;
          }).map(img => ({
            src: img.getAttribute('src'),
            id: img.id,
            className: img.className,
            naturalWidth: img.naturalWidth,
            naturalHeight: img.naturalHeight
          }));

          // Font rendering checks
          const fontStatus = document.fonts ? document.fonts.status : 'unknown';
          const hasMaterialIcons = !!document.querySelector('.material-icons');
          const hasFontAwesome = !!document.querySelector('.fa, .fas, .far, .fab');

          // Header & Navigation states
          const desktopMenuIcon = document.querySelector('#dekstopMenuIcon');
          const mobileLogo = document.querySelector('#mobileLogo');
          const desktopLogo = document.querySelector('#desktopLogo');
          const mainSidebar = document.querySelector('.main-sidebar');
          const mobileNavCol = document.querySelector('#MobileNavbarMenuSearchCol');
          const desktopNavCol = document.querySelector('#DesktopNavbarMenuSerachCol');
          const mobSearch = document.querySelector('#mobSearch');
          const ipadSearch = document.querySelector('#ipadSearch');

          const getDisplay = (el) => {
            if (!el) return 'not_found';
            return window.getComputedStyle(el).display;
          };

          const isVisible = (el) => {
            if (!el) return false;
            const style = window.getComputedStyle(el);
            return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
          };

          return {
            innerW,
            docScrollW,
            bodyScrollW,
            hasHorizontalOverflow,
            overflowingElements,
            totalImages: allImages.length,
            brokenImages,
            fontStatus,
            hasMaterialIcons,
            hasFontAwesome,
            headerState: {
              desktopMenuIconDisplay: getDisplay(desktopMenuIcon),
              desktopMenuIconVisible: isVisible(desktopMenuIcon),
              mobileLogoDisplay: getDisplay(mobileLogo),
              desktopLogoDisplay: getDisplay(desktopLogo),
              mobileNavColDisplay: getDisplay(mobileNavCol),
              desktopNavColDisplay: getDisplay(desktopNavCol),
              mobSearchDisplay: getDisplay(mobSearch),
              ipadSearchDisplay: getDisplay(ipadSearch),
              sidebarClass: mainSidebar ? mainSidebar.className : null
            }
          };
        }, vp.width);

        // Save Full-Page Screenshot
        const screenshotFileName = `${vp.name}_${route.name}.png`;
        const screenshotPath = path.join(SCREENSHOTS_DIR, vp.name, screenshotFileName);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        // Sidebar & Mobile Menu interactions
        let toggleTestResult = null;
        let mobileMenuTestResult = null;

        if (vp.name === 'mobile' || vp.name === 'tablet') {
          // 1. Sidebar toggle test
          const toggleSelector = '#dekstopMenuIcon, [data-toggle="offcanvas"]';
          const toggleLoc = page.locator(toggleSelector).first();
          if (await toggleLoc.count() > 0 && await toggleLoc.isVisible()) {
            try {
              const bodyClassBefore = await page.evaluate(() => document.body.className);
              await toggleLoc.click();
              await page.waitForTimeout(350);
              const bodyClassAfter = await page.evaluate(() => document.body.className);

              const toggleScreenshotName = `${vp.name}_toggle_${route.name}.png`;
              const toggleScreenshotPath = path.join(toggleDir, toggleScreenshotName);
              await page.screenshot({ path: toggleScreenshotPath, fullPage: false });

              const toggled = bodyClassBefore !== bodyClassAfter;
              toggleTestResult = {
                tested: true,
                buttonFound: true,
                buttonVisible: true,
                bodyClassBefore,
                bodyClassAfter,
                toggled,
                screenshot: `screenshots/toggles/${toggleScreenshotName}`
              };

              // Restore back to original state
              if (toggled) {
                await toggleLoc.click();
                await page.waitForTimeout(200);
              }
            } catch (toggleErr) {
              toggleTestResult = {
                tested: true,
                buttonFound: true,
                buttonVisible: true,
                error: toggleErr.message
              };
            }
          } else {
            toggleTestResult = {
              tested: true,
              buttonFound: await toggleLoc.count() > 0,
              buttonVisible: false
            };
          }

          // 2. Mobile User Dropdown test
          const userDropdownLoc = page.locator('#UserdropdownMenuButtonMobile, #UserdropdownMenuButton').first();
          if (await userDropdownLoc.count() > 0 && await userDropdownLoc.isVisible()) {
            try {
              const cardBefore = await page.evaluate(() => {
                const card = document.querySelector('.accountSettingMenuCardMobile, .accountSettingMenuCard');
                return card ? window.getComputedStyle(card).display : 'none';
              });
              await userDropdownLoc.click();
              await page.waitForTimeout(200);
              const cardAfter = await page.evaluate(() => {
                const card = document.querySelector('.accountSettingMenuCardMobile, .accountSettingMenuCard');
                return card ? window.getComputedStyle(card).display : 'none';
              });
              mobileMenuTestResult = {
                tested: true,
                dropdownToggled: cardBefore !== cardAfter,
                cardBefore,
                cardAfter
              };
              // Close dropdown
              await userDropdownLoc.click();
            } catch (menuErr) {
              mobileMenuTestResult = { tested: true, error: menuErr.message };
            }
          }
        }

        const passed = (
          httpStatus === 200 &&
          !domAnalysis.hasHorizontalOverflow &&
          domAnalysis.brokenImages.length === 0 &&
          pageErrors.length === 0 &&
          networkErrors.length === 0 &&
          (toggleTestResult === null || toggleTestResult.toggled !== false || route.name === 'Login')
        );

        const resultRecord = {
          route: route.path,
          name: route.name,
          viewport: vp.name,
          width: vp.width,
          height: vp.height,
          status: httpStatus,
          passed,
          hasHorizontalOverflow: domAnalysis.hasHorizontalOverflow,
          docScrollW: domAnalysis.docScrollW,
          bodyScrollW: domAnalysis.bodyScrollW,
          overflowingElements: domAnalysis.overflowingElements,
          totalImages: domAnalysis.totalImages,
          brokenImagesCount: domAnalysis.brokenImages.length,
          brokenImages: domAnalysis.brokenImages,
          fontStatus: domAnalysis.fontStatus,
          headerState: domAnalysis.headerState,
          toggleTest: toggleTestResult,
          mobileMenuTest: mobileMenuTestResult,
          consoleErrors,
          pageErrors,
          networkErrors,
          screenshot: `screenshots/${vp.name}/${screenshotFileName}`
        };

        auditResults.push(resultRecord);

        const statusIcon = passed ? '✅ PASS' : '❌ FAIL';
        const toggleInfo = toggleTestResult?.toggled ? ' | Toggle: OK' : (toggleTestResult ? ' | Toggle: N/A' : '');
        console.log(`[${vp.name.toUpperCase().padEnd(7)}] ${route.name.padEnd(20)} | ${statusIcon} | HTTP: ${httpStatus} | Overflow: ${domAnalysis.hasHorizontalOverflow ? `YES (${domAnalysis.docScrollW}px)` : 'NO'} | BrokenImgs: ${domAnalysis.brokenImages.length}${toggleInfo}`);
      } catch (err) {
        navError = err.message;
        console.error(`[${vp.name.toUpperCase().padEnd(7)}] ${route.name.padEnd(20)} | ❌ ERROR: ${err.message}`);
        auditResults.push({
          route: route.path,
          name: route.name,
          viewport: vp.name,
          width: vp.width,
          height: vp.height,
          status: httpStatus,
          passed: false,
          error: navError
        });
      } finally {
        await page.close();
      }
    }
  }

  await browser.close();

  // Summary statistics
  const total = auditResults.length;
  const passedCount = auditResults.filter(r => r.passed).length;
  const failedCount = total - passedCount;
  const passRate = ((passedCount / total) * 100).toFixed(1);

  console.log(`\n======================================================`);
  console.log(`AUDIT COMPLETED`);
  console.log(`Total checks: ${total}`);
  console.log(`Passed: ${passedCount}`);
  console.log(`Failed: ${failedCount}`);
  console.log(`Pass Rate: ${passRate}%`);
  console.log(`======================================================\n`);

  fs.writeFileSync(path.join(__dirname, 'screenshots', 'audit_detailed_results.json'), JSON.stringify(auditResults, null, 2));

  // Build Responsive Gallery Comparison HTML Report
  generateHtmlReport(auditResults, passRate, passedCount, total);

  return auditResults;
}

function generateHtmlReport(results, passRate, passedCount, total) {
  const routesGrouped = {};
  for (const r of routes) {
    routesGrouped[r.name] = {
      name: r.name,
      path: r.path,
      mobile: results.find(x => x.name === r.name && x.viewport === 'mobile'),
      tablet: results.find(x => x.name === r.name && x.viewport === 'tablet'),
      desktop: results.find(x => x.name === r.name && x.viewport === 'desktop')
    };
  }

  const galleryRows = Object.values(routesGrouped).map(group => {
    return `
      <div class="card mb-4 shadow-sm">
        <div class="card-header bg-dark text-white d-flex justify-content-between align-items-center">
          <h5 class="mb-0"><strong>${group.name}</strong> <span class="badge badge-secondary">${group.path}</span></h5>
          <div>
            <span class="badge ${group.mobile?.passed ? 'badge-success' : 'badge-danger'}">Mobile: ${group.mobile?.passed ? 'PASS' : 'FAIL'}</span>
            <span class="badge ${group.tablet?.passed ? 'badge-success' : 'badge-danger'}">Tablet: ${group.tablet?.passed ? 'PASS' : 'FAIL'}</span>
            <span class="badge ${group.desktop?.passed ? 'badge-success' : 'badge-danger'}">Desktop: ${group.desktop?.passed ? 'PASS' : 'FAIL'}</span>
          </div>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-3 text-center">
              <h6>Mobile (390 x 844)</h6>
              <div class="preview-box">
                <a href="${group.mobile?.screenshot}" target="_blank">
                  <img src="${group.mobile?.screenshot}" class="img-fluid border rounded" alt="Mobile ${group.name}">
                </a>
              </div>
              <small class="text-muted d-block mt-1">ScrollW: ${group.mobile?.docScrollW}px | BrokenImg: ${group.mobile?.brokenImagesCount}</small>
            </div>
            <div class="col-md-4 text-center">
              <h6>Tablet (768 x 1024)</h6>
              <div class="preview-box">
                <a href="${group.tablet?.screenshot}" target="_blank">
                  <img src="${group.tablet?.screenshot}" class="img-fluid border rounded" alt="Tablet ${group.name}">
                </a>
              </div>
              <small class="text-muted d-block mt-1">ScrollW: ${group.tablet?.docScrollW}px | BrokenImg: ${group.tablet?.brokenImagesCount}</small>
            </div>
            <div class="col-md-5 text-center">
              <h6>Desktop (1440 x 900)</h6>
              <div class="preview-box">
                <a href="${group.desktop?.screenshot}" target="_blank">
                  <img src="${group.desktop?.screenshot}" class="img-fluid border rounded" alt="Desktop ${group.name}">
                </a>
              </div>
              <small class="text-muted d-block mt-1">ScrollW: ${group.desktop?.docScrollW}px | BrokenImg: ${group.desktop?.brokenImagesCount}</small>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Pulse PMS - Responsive Visual Parity Gallery</title>
  <link rel="stylesheet" href="http://localhost:3000/Content/bootstrap/css/bootstrap.min.css">
  <style>
    body { padding: 30px; background-color: #f4f6f9; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
    .preview-box { height: 320px; overflow-y: auto; background: #eee; border: 1px solid #ddd; }
    .badge { font-size: 85%; padding: 5px 8px; }
  </style>
</head>
<body>
  <div class="container-fluid">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <div>
        <h2 class="font-weight-bold">Responsive Visual Parity Audit Gallery</h2>
        <p class="text-muted mb-0">16 Routes Verified Across Mobile (390px), Tablet (768px), and Desktop (1440px)</p>
      </div>
      <div>
        <span class="badge badge-success p-2 font-size-lg" style="font-size: 1.25rem;">Pass Rate: ${passRate}% (${passedCount}/${total})</span>
      </div>
    </div>
    ${galleryRows}
  </div>
</body>
</html>`;

  fs.writeFileSync(path.join(SCREENSHOTS_DIR, 'responsive_parity_gallery.html'), fullHtml, 'utf8');
  console.log(`Generated HTML Gallery: screenshots/responsive_parity_gallery.html`);
}

runAudit().catch(err => {
  console.error("Audit runner failed:", err);
  process.exit(1);
});
