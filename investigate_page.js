const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');
console.log("Includes Collaborative Projects in page.tsx:", content.includes('Collaborative Projects'));
