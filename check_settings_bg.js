const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/settings/page.tsx', 'utf8');
const bgMatches = content.match(/bg-[a-zA-Z0-9-/]+/g) || [];
console.log(Array.from(new Set(bgMatches)));
