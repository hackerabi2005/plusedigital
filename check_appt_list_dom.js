const fs = require('fs');
const content = fs.readFileSync('cleaned-pages/appointment_list.html', 'utf8');

const tables = content.match(/<table[^>]*>[\s\S]*?<\/table>/gi);
console.log('Tables in appointment_list.html:', tables ? tables.length : 0);

// Find main content inside .content-wrapper
const wrapper = content.match(/<div class="content-wrapper[^"]*">([\s\S]*?)<\/div>\s*<\/body>/i);
console.log('Wrapper content length:', wrapper ? wrapper[1].length : 'none');
if (wrapper) {
  console.log('Wrapper preview:', wrapper[1].slice(0, 500).replace(/\s+/g, ' '));
}
