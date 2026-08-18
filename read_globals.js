const fs = require('fs');
let content = fs.readFileSync('src/app/globals.css', 'utf8');
console.log(content.slice(0, 500));
