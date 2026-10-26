const fs = require('fs');
const content = fs.readFileSync('cleaned-pages/calendar.html', 'utf8');

const m = content.match(/<ul class="sidebar-menu">([\s\S]*?)<\/ul>/);
console.log('Sidebar menu in calendar.html:');
console.log(m ? m[1] : 'not found');
