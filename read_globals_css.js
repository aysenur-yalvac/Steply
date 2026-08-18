const fs = require('fs');
let cssContent = fs.readFileSync('src/app/globals.css', 'utf8');
console.log(cssContent.slice(Math.max(0, cssContent.length - 1500)));
