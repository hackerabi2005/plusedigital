const fs = require('fs');
const content = fs.readFileSync('cleaned-pages/home_index.html', 'utf8');

// Find all navbar / header links
const matches = content.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis);
const links = [];
for (const m of matches) {
  const href = m[1];
  const inner = m[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
  links.push({ href, text: inner });
}

console.log('All links on home_index.html:');
links.forEach((l, idx) => {
  console.log(`${idx + 1}. [${l.text || '(no text)'}] -> ${l.href}`);
});
