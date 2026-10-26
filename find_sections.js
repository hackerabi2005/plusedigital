const fs = require('fs');
const content = fs.readFileSync('cleaned-pages/dental_consultation.html', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('tab-pane') || l.includes('section')) {
    if (l.includes('id=') || l.includes('class=')) {
      console.log((idx + 1) + ': ' + l.trim());
    }
  }
});
