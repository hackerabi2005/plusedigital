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
  const allFindings = {};

  for (const p of pagesToTest) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    const pageErrors = [];
    const consoleErrors = [];
    page.on('pageerror', err => pageErrors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    console.log(`\n==================================================`);
    console.log(`ANALYZING PAGE: ${p.name} (${p.url})`);
    console.log(`==================================================`);

    await page.goto(`http://localhost:3000${p.url}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    // Collect all clickables on this page
    const elements = await page.evaluate(() => {
      const items = [];
      const nodes = document.querySelectorAll('a, button, input[type="button"], input[type="submit"], [role="button"], .btn');
      
      nodes.forEach((el, index) => {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const isVisible = rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden';
        
        items.push({
          index,
          tag: el.tagName.toLowerCase(),
          id: el.id || '',
          className: el.className || '',
          href: el.getAttribute('href') || '',
          onclick: el.getAttribute('onclick') || '',
          text: (el.innerText || el.value || el.getAttribute('title') || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' '),
          dataToggle: el.getAttribute('data-toggle') || '',
          dataTarget: el.getAttribute('data-target') || '',
          isVisible
        });
      });
      return items;
    });

    console.log(`Total clickable elements found: ${elements.length} (${elements.filter(e => e.isVisible).length} visible)`);

    const deadButtons = [];
    const brokenLinks = [];
    const jsErrorsOnPage = [];

    // Filter to visible elements
    const visibleElements = elements.filter(e => e.isVisible);

    // Let's inspect the visible elements for obvious broken patterns
    for (const el of visibleElements) {
      // 1. Check anchor with href="#" and no onclick or data-toggle
      if (el.tag === 'a') {
        if (!el.href || el.href === '#' || el.href === 'javascript:void(0)' || el.href === 'javascript:;') {
          if (!el.onclick && !el.dataToggle && !el.id && !el.className.includes('toggle') && !el.className.includes('dropdown')) {
            brokenLinks.push({
              text: el.text,
              id: el.id,
              className: el.className,
              href: el.href,
              reason: 'Anchor with no destination href, no onclick handler, and no data-toggle'
            });
          }
        }
      }
      
      // 2. Check buttons with no type, no onclick, no form, no data-toggle
      if (el.tag === 'button') {
        if (!el.onclick && !el.dataToggle && !el.id) {
          deadButtons.push({
            text: el.text,
            id: el.id,
            className: el.className,
            reason: 'Button with no id, no onclick, no data-toggle'
          });
        }
      }
    }

    allFindings[p.name] = {
      url: p.url,
      totalElements: elements.length,
      visibleElements: visibleElements.length,
      pageErrors,
      consoleErrors,
      deadButtons,
      brokenLinks,
      sampleClickables: visibleElements.slice(0, 15).map(e => ({ text: e.text, tag: e.tag, href: e.href, onclick: e.onclick, dataToggle: e.dataToggle, id: e.id }))
    };

    await page.close();
  }

  await browser.close();
  console.log('\n==================================================');
  console.log('SUMMARY OF ALL PAGES:');
  console.log('==================================================');
  console.log(JSON.stringify(allFindings, null, 2));
})();
