const fs = require('fs');
let layoutContent = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
console.log(layoutContent.slice(0, 2000));
