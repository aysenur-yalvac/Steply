const fs = require('fs');
console.log("=== dashboard/page.tsx ===");
console.log(fs.readFileSync('src/app/dashboard/page.tsx', 'utf8').substring(0, 500));
console.log("\n=== analytics/page.tsx ===");
console.log(fs.readFileSync('src/app/dashboard/analytics/page.tsx', 'utf8').substring(0, 500));
console.log("\n=== school/page.tsx ===");
try { console.log(fs.readFileSync('src/app/dashboard/school/page.tsx', 'utf8').substring(0, 500)); } catch(e) { console.log("No school page"); }
