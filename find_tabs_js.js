const fs = require('fs');
const content = fs.readFileSync('cleaned-pages/dental_consultation.html', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('#tab') || l.includes('tab2') || l.includes('tab3') || l.includes('Procedures') || l.includes('Prescription') || l.includes('Billing')) {
    if (l.includes('<script') || l.includes('click') || l.includes('ajax') || l.includes('function') || l.includes('load')) {
      console.log((idx + 1) + ': ' + l.trim());
    }
  }
});
