const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, 'cleaned-pages', 'home_index.html'), 'utf8');

const anchorMatches = content.matchAll(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gis);
const navigationLinks = [];

for (const m of anchorMatches) {
  const href = m[1];
  const text = m[2].replace(/<[^>]+>/g, '').trim();
  if (!href.endsWith('.css') && !href.endsWith('.ico') && !href.endsWith('.png') && !href.endsWith('.json') && !href.startsWith('javascript:')) {
    navigationLinks.push({ href, text });
  }
}

console.log('Total navigation <a> links on home_index.html:', navigationLinks.length);
console.log('Sample navigation links:');
navigationLinks.slice(0, 30).forEach(l => console.log(`  [${l.text || 'no-text'}] -> ${l.href}`));
