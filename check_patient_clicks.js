const fs = require('fs');
const content = fs.readFileSync('cleaned-pages/patient_detail.html', 'utf8');

const matches = content.matchAll(/onclick=["']([^"']*(?:GetAdd|Add|Consultation|Examination|Prescription)[^"']*)["']/gi);
for (const m of matches) {
  console.log(m[1]);
}
