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
    const deadClicks = [];
    const brokenNavs = [];

    try {
      await page.goto(`http://localhost:3000${p.url}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(500);

      // Check all nav/sidebar links
      const navLinks = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.sidebar-menu a, .header a, .main-header a, nav a')).map(a => ({
          text: a.innerText.trim().replace(/\s+/g, ' '),
          href: a.getAttribute('href'),
          id: a.id,
          cls: a.className
        }));
      });

      // Check primary action buttons
      const actionButtons = await page.evaluate(() => {
        return Array.from(document.querySelectorAll('.btn, button, .list-group-item, .nav-tabs a, .nav-pills a')).map(b => {
          const rect = b.getBoundingClientRect();
          return {
            text: (b.innerText || b.value || b.getAttribute('title') || '').trim().replace(/\s+/g, ' '),
            id: b.id,
            cls: b.className,
            tag: b.tagName,
            href: b.getAttribute('href'),
            onclick: b.getAttribute('onclick'),
            visible: rect.width > 0 && rect.height > 0
          };
        });
      });

      // Check for broken links (e.g. href="#" or empty or relative paths going nowhere)
      for (const nl of navLinks) {
        if (!nl.href || nl.href === '#' || nl.href.startsWith('javascript:')) {
          if (!nl.cls.includes('dropdown') && !nl.cls.includes('sidebar-toggle')) {
            brokenNavs.push({ text: nl.text, href: nl.href, id: nl.id, cls: nl.cls });
          }
        }
      }

      // Check if tabs have target panes
      const tabIssues = await page.evaluate(() => {
        const issues = [];
        const tabs = Array.from(document.querySelectorAll('[data-toggle="tab"], [data-toggle="pill"], .nav-tabs a, .nav-pills a'));
        for (const t of tabs) {
          const target = t.getAttribute('href') || t.getAttribute('data-target');
          if (target && target.startsWith('#')) {
            const pane = document.querySelector(target);
            if (!pane) {
              issues.push({ tab: t.innerText.trim(), target, issue: 'Target pane does not exist in DOM' });
            } else if (!pane.innerHTML.trim()) {
              issues.push({ tab: t.innerText.trim(), target, issue: 'Target pane is empty' });
            }
          }
        }
        return issues;
      });

      results[p.name] = {
        totalNavLinks: navLinks.length,
        brokenNavsCount: brokenNavs.length,
        brokenNavsSample: brokenNavs.slice(0, 5),
        totalActionButtons: actionButtons.length,
        tabIssues
      };

    } catch (err) {
      results[p.name] = { error: err.message };
    } finally {
      await page.close();
    }
  }

  await browser.close();
  console.log(JSON.stringify(results, null, 2));
})();
