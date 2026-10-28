const { chromium } = require('playwright');
const chromePath = 'C:\\Users\\Abish\\AppData\\Local\\ms-playwright\\chromium-1228\\chrome-win64\\chrome.exe';

const routes = [
  '/account/login',
  '/home/index',
  '/calendar/index',
  '/home/appointmentlist',
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
  '/dental/consultation?patientid=2223997'
];

(async () => {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  
  for (const w of [390, 768, 1440]) {
    console.log(`\n=================== CHECKING VIEWPORT WIDTH: ${w}px ===================`);
    const page = await browser.newPage({ viewport: { width: w, height: 900 } });

    for (const u of routes) {
      await page.goto('http://localhost:3000' + u, { waitUntil: 'networkidle' });
      await page.waitForTimeout(300);

      const res = await page.evaluate(() => {
        // Function to get visible clipped rect by checking all overflow ancestors
        function getVisibleRect(el) {
          let rect = el.getBoundingClientRect();
          if (rect.width === 0 || rect.height === 0) return null;

          let p = el.parentElement;
          while (p && p !== document.body && p !== document.documentElement) {
            const s = window.getComputedStyle(p);
            if (s.overflowY === 'hidden' || s.overflowY === 'auto' || s.overflowY === 'scroll' ||
                s.overflowX === 'hidden' || s.overflowX === 'auto' || s.overflowX === 'scroll') {
              const pRect = p.getBoundingClientRect();
              const left = Math.max(rect.left, pRect.left);
              const right = Math.min(rect.right, pRect.right);
              const top = Math.max(rect.top, pRect.top);
              const bottom = Math.min(rect.bottom, pRect.bottom);
              if (right <= left || bottom <= top) return null; // Fully clipped out of view
              rect = { left, right, top, bottom, width: right - left, height: bottom - top };
            }
            p = p.parentElement;
          }
          return rect;
        }

        const textElements = [];
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        let node;
        while (node = walker.nextNode()) {
          const str = node.textContent.trim();
          if (str.length > 2 && node.parentElement) {
            const parent = node.parentElement;
            const style = window.getComputedStyle(parent);
            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
              const visRect = getVisibleRect(parent);
              if (visRect && visRect.width > 5 && visRect.height > 5) {
                textElements.push({
                  tag: parent.tagName,
                  text: str.substring(0, 30),
                  rect: visRect,
                  parent: parent
                });
              }
            }
          }
        }

        // Also include input and textarea placeholder text
        const inputs = Array.from(document.querySelectorAll('input[placeholder], textarea[placeholder]'));
        for (const inp of inputs) {
          const ph = inp.getAttribute('placeholder');
          if (ph && ph.trim().length > 2) {
            const style = window.getComputedStyle(inp);
            if (style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0') {
              const r = getVisibleRect(inp);
              if (r && r.width > 10 && r.height > 10) {
                const pl = parseFloat(style.paddingLeft) || 0;
                const pr = parseFloat(style.paddingRight) || 0;
                // Text rendering area inside input
                const textRect = {
                  left: r.left + pl,
                  right: r.right - pr,
                  top: r.top,
                  bottom: r.bottom,
                  width: Math.max(0, r.width - pl - pr),
                  height: r.height
                };
                textElements.push({
                  tag: 'INPUT:PH',
                  text: `Placeholder("${ph.trim().substring(0, 25)}")`,
                  rect: textRect,
                  parent: inp
                });
              }
            }
          }
        }

        const overlappingPairs = [];
        for (let i = 0; i < textElements.length; i++) {
          for (let j = i + 1; j < textElements.length; j++) {
            const a = textElements[i];
            const b = textElements[j];
            if (a.parent.contains(b.parent) || b.parent.contains(a.parent)) continue;

            const xOverlap = Math.max(0, Math.min(a.rect.right, b.rect.right) - Math.max(a.rect.left, b.rect.left));
            const yOverlap = Math.max(0, Math.min(a.rect.bottom, b.rect.bottom) - Math.max(a.rect.top, b.rect.top));
            
            if (xOverlap > 15 && yOverlap > 15) {
              overlappingPairs.push({
                textA: a.text,
                textB: b.text,
                overlap: { w: Math.round(xOverlap), h: Math.round(yOverlap) }
              });
            }
          }
        }
        return overlappingPairs;
      });

      if (res.length > 0) {
        console.log(`[${w}px] ❌ ${u} has ${res.length} VISIBLE text overlaps:`);
        res.slice(0, 4).forEach(o => console.log(`   * "${o.textA}" OVERLAPS WITH "${o.textB}" (${o.overlap.w}x${o.overlap.h}px)`));
      } else {
        console.log(`[${w}px] ✅ ${u} CLEAN`);
      }
    }
    await page.close();
  }
  await browser.close();
})();
