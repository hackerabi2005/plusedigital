const fs = require('fs');
const content = fs.readFileSync('cleaned-pages/calendar.html', 'utf8');

const lines = content.split('\n');
lines.forEach((l, idx) => {
  if (l.includes('modal') || l.includes('Modal') || l.includes('SaveEvent') || l.includes('bookAppointment') || l.includes('bookappointment')) {
    console.log(`${idx + 1}: ${l.trim()}`);
  }
});
