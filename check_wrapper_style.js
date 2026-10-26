const fs = require('fs');
const content = fs.readFileSync('cleaned-pages/home_index.html', 'utf8');

const matches = content.match(/\.(wrapper|content-wrapper|right-side|main-content)[^{]*\{[^}]+\}/g);
console.log('Matches for content wrapper styles:', matches ? matches.slice(0, 10) : 'none');
