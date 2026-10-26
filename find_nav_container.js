const fs = require('fs');
const content = fs.readFileSync('cleaned-pages/home_index.html', 'utf8');
const lines = content.split('\n');

lines.forEach((l, idx) => {
  if (l.includes('appointmentList') || l.includes('settings') || l.includes('videos') || l.includes('social/index')) {
    console.log(`${idx + 1}: ${l.trim()}`);
  }
});
