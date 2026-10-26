const fs = require('fs');
const path = require('path');

const pagesDir = path.join(__dirname, 'cleaned-pages');
const files = fs.readdirSync(pagesDir).filter(f => f.endsWith('.html'));

for (const f of files) {
  const content = fs.readFileSync(path.join(pagesDir, f), 'utf8');
  // Find sidebar items: <li><a href="...">...</a></li>
  const sidebarMatches = content.matchAll(/<li[^>]*>\s*<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>\s*<\/li>/gis);
  const items = [];
  for (const m of sidebarMatches) {
    const href = m[1];
    const text = m[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    if (text || href.includes('index') || href.includes('calendar') || href.includes('lab') || href.includes('patient')) {
      items.push({ text, href });
    }
  }
  console.log(`\nPage: ${f} (Found ${items.length} sidebar items):`);
  items.slice(0, 10).forEach(i => console.log(`   [${i.text || 'icon'}] -> ${i.href}`));
}
