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
  const results = {};

  for (const p of pagesToTest) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    console.log(`\n=======================================================`);
    console.log(`TESTING BUTTON CLICKS ON: ${p.name}`);
    console.log(`=======================================================`);

    await page.goto(`http://localhost:3000${p.url}`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    // Get all buttons and action links
    const buttons = await page.evaluate(() => {
      const list = [];
      const els = document.querySelectorAll('button, .btn, .nav-link, .nav-tabs a, .list-group-item');
      els.forEach((b, idx) => {
        const rect = b.getBoundingClientRect();
        const style = window.getComputedStyle(b);
        if (rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden') {
          list.push({
            idx,
            text: (b.innerText || b.value || b.getAttribute('title') || '').trim().replace(/\s+/g, ' '),
            id: b.id,
            className: b.className,
            tag: b.tagName.toLowerCase(),
            href: b.getAttribute('href') || ''
          });
        }
      });
      return list;
    });

    console.log(`Found ${buttons.length} visible buttons/actions on ${p.name}`);

    const clicked = [];
    // Click each button (up to 15 key buttons per page)
    for (let i = 0; i < Math.min(buttons.length, 15); i++) {
      const btnInfo = buttons[i];
      let selector = '';
      if (btnInfo.id) {
        selector = `#${btnInfo.id}`;
      } else if (btnInfo.className) {
        const firstCls = btnInfo.className.trim().split(/\s+/)[0];
        selector = `${btnInfo.tag}.${firstCls}`;
      } else {
        selector = `${btnInfo.tag}`;
      }

      const initialUrl = page.url();
      let clickResult = 'ok';

      try {
        const locator = page.locator(selector).nth(0);
        if (await locator.isVisible()) {
          await locator.click({ timeout: 1000 }).catch(e => { clickResult = `click failed: ${e.message.split('\n')[0]}`; });
          await page.waitForTimeout(200);

          // If navigated away, go back
          if (page.url() !== initialUrl && !page.url().includes(p.url)) {
            clickResult = `navigated to ${page.url()}`;
            await page.goto(`http://localhost:3000${p.url}`, { waitUntil: 'domcontentloaded' });
            await page.waitForTimeout(400);
          }
        } else {
          clickResult = 'not visible';
        }
      } catch (err) {
        clickResult = `error: ${err.message.split('\n')[0]}`;
      }

      clicked.push({ text: btnInfo.text, id: btnInfo.id, result: clickResult });
    }

    results[p.name] = {
      totalButtons: buttons.length,
      errorsOnPage: errors,
      clicked
    };

    await page.close();
  }

  await browser.close();
  console.log('\n=======================================================');
  console.log('RESULTS:');
  console.log('=======================================================');
  console.log(JSON.stringify(results, null, 2));
})();
