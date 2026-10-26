const fs = require('fs');
const path = require('path');

const PAGES_DIR = path.join(__dirname, 'cleaned-pages');
const pages = fs.readdirSync(PAGES_DIR).filter(f => f.endsWith('.html'));

console.log(`Found ${pages.length} pages in ${PAGES_DIR}`);

for (const p of pages) {
  const filePath = path.join(PAGES_DIR, p);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // 1. Fix Advanced Search links
  if (content.includes('class="btn btn-link pull-right btnAdvace-search"')) {
    content = content.replace(/<a href="#" class="btn btn-link pull-right btnAdvace-search"/g, '<a href="/home/search" class="btn btn-link pull-right btnAdvace-search"');
    modified = true;
  }
  if (content.includes('class="btn btn-link pull-right btnAdvace-search  ipadAdvaceSearch"')) {
    content = content.replace(/<a href="#" class="btn btn-link pull-right btnAdvace-search  ipadAdvaceSearch"/g, '<a href="/home/search" class="btn btn-link pull-right btnAdvace-search  ipadAdvaceSearch"');
    modified = true;
  }

  // 2. Fix Book Appointment calendar icon in header
  if (content.includes('<a id="dekstopappointmentimg">')) {
    content = content.replace(/<a id="dekstopappointmentimg">/g, '<a id="dekstopappointmentimg" href="/calendar/index">');
    modified = true;
  }

  // 3. Fix user dropdown menu inline !important style so toggle works
  if (content.includes('style="display:none !important;"')) {
    content = content.replace(/style="display:none !important;"/g, 'style="display:none;"');
    modified = true;
  }

  // 4. Fix relative sidebar links to absolute clean routes
  content = content.replace(/href="\.\.\/\.\.\/home\/index"/g, 'href="/home/index"');
  content = content.replace(/href="\.\.\/\.\.\/home\/appointmentList"/gi, 'href="/home/appointmentlist"');
  content = content.replace(/href="\.\.\/\.\.\/home\/search"/g, 'href="/home/search"');
  content = content.replace(/href="\.\.\/\.\.\/calendar\/index"/g, 'href="/calendar/index"');
  content = content.replace(/href="\.\.\/\.\.\/home\/videos"/g, 'href="/home/videos"');
  content = content.replace(/href="\.\.\/\.\.\/lab\/laboratory"/g, 'href="/lab/laboratory"');
  content = content.replace(/href="\.\.\/\.\.\/patientconnect\/index"/g, 'href="/patientconnect/index"');
  content = content.replace(/href="\.\.\/\.\.\/report\/reports"/g, 'href="/report/reports"');
  content = content.replace(/href="\.\.\/\.\.\/social\/index"/g, 'href="/social/index"');
  content = content.replace(/href="\.\.\/\.\.\/home\/settings"/g, 'href="/home/settings"');

  // Fix 1-level relative links as well
  content = content.replace(/href="\.\.\/home\/index"/g, 'href="/home/index"');
  content = content.replace(/href="\.\.\/home\/appointmentList"/gi, 'href="/home/appointmentlist"');
  content = content.replace(/href="\.\.\/home\/search"/g, 'href="/home/search"');
  content = content.replace(/href="\.\.\/calendar\/index"/g, 'href="/calendar/index"');
  content = content.replace(/href="\.\.\/home\/videos"/g, 'href="/home/videos"');
  content = content.replace(/href="\.\.\/lab\/laboratory"/g, 'href="/lab/laboratory"');
  content = content.replace(/href="\.\.\/patientconnect\/index"/g, 'href="/patientconnect/index"');
  content = content.replace(/href="\.\.\/report\/reports"/g, 'href="/report/reports"');
  content = content.replace(/href="\.\.\/social\/index"/g, 'href="/social/index"');
  content = content.replace(/href="\.\.\/home\/settings"/g, 'href="/home/settings"');

  // Fix patient detail links to absolute
  content = content.replace(/href="\.\.\/patient\/detail\?patientid=/g, 'href="/patient/detail?patientid=');
  content = content.replace(/href="\.\.\/\.\.\/patient\/detail\?patientid=/g, 'href="/patient/detail?patientid=');

  // 5. In social.html, replace external admin.mydigitalclinic.net uploads with local /uploads/
  if (p === 'social.html') {
    content = content.replace(/https:\/\/admin\.mydigitalclinic\.net\/\/uploads\//g, '/uploads/');
    content = content.replace(/https:\/\/admin\.mydigitalclinic\.net\/uploads\//g, '/uploads/');
    modified = true;
  }

  // 6. In videos.html, replace external YouTube thumbnail URLs with local thumbnail route
  if (p === 'videos.html') {
    content = content.replace(/https:\/\/img\.youtube\.com\/vi\/([^\/]+)\/[^\.]+\.jpg/g, '/Content/images/video_thumb.svg');
    content = content.replace(/https:\/\/img\.youtube\.com\/vi\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+\.jpg/g, '/Content/images/video_thumb.svg');
    modified = true;
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${p}`);
}

console.log('All pages processed successfully.');
