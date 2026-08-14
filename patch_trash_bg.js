const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/trash/layout.tsx', 'utf8');

// Replace bg-slate-50 with bg-transparent
content = content.replace('bg-slate-50', 'bg-transparent');

fs.writeFileSync('src/app/dashboard/trash/layout.tsx', content, 'utf8');
console.log('Fixed trash layout background');
