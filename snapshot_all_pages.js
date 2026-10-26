const { chromium } = require('playwright');
const path = 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';

const pagesToTest = [
  { name: 'Dashboard', url: '/home/index' },
  { name: 'Calendar', url: '/calendar/index' },
  { name: 'Appointment_List', url: '/home/appointmentlist' },
  { name: 'Dental_Consultation', url: '/dental/consultation?patientid=2223997' },
  { name: 'Patient_Detail', url: '/patient/detail?patientid=2223997' },
  { name: 'Laboratory', url: '/lab/laboratory' },
  { name: 'Patient_Connect', url: '/patientconnect/index' },
  { name: 'Reports', url: '/report/reports' },
  { name: 'Social', url: '/social/index' },
  { name: 'Settings', url: '/home/settings' },
  { name: 'Search', url: '/home/search' },
  { name: 'Profile_View', url: '/home/profileview' },
  { name: 'Support', url: '/home/support' },
  { name: 'FAQ', url: '/home/faq' },
  { name: 'Videos', url: '/home/videos' },
  { name: 'Login', url: '/account/login' }
];

(async () => {
  const browser = await chromium.launch({ executablePath: path, headless: true });

  for (const p of pagesToTest) {
    const page = await browser.newPage();
    await page.setViewportSize({ width: 1440, height: 900 });

    try {
      await page.goto(`http://localhost:3000${p.url}`, { waitUntil: 'domcontentloaded', timeout: 10000 });
      await page.waitForTimeout(1000);
      const filename = `page_${p.name}.png`;
      await page.screenshot({ path: filename, fullPage: true });

      const heading = await page.evaluate(() => {
        const h1 = document.querySelector('h1, h2, h3, h4, h5, .cardHeadingText, .title, .content-header');
        return h1 ? h1.innerText.trim() : 'no-heading';
      });

      console.log(`Saved screenshot ${filename} - Main Heading: ${heading}`);
    } catch (e) {
      console.log(`Failed on ${p.name}: ${e.message}`);
    } finally {
      await page.close();
    }
  }

  await browser.close();
})();
