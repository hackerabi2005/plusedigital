const fs = require('fs');
const content = fs.readFileSync('cleaned-pages/patient_detail.html', 'utf8');
const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('LoadForms') || l.includes('tab-pane') || l.includes('PatientDetailsAccordions') || l.includes('divid') || l.includes('billingDetail')) {
    console.log((idx + 1) + ': ' + l.trim());
  }
});
