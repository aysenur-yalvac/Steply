const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/settings/page.tsx', 'utf8');
console.log("Includes bg-white:", content.includes('bg-white'));
console.log("Includes dark:bg-slate-900:", content.includes('dark:bg-slate-900'));
