const fs = require('fs');
let content = fs.readFileSync('src/lib/database.types.ts', 'utf8');
content = content.replace(/deleted_at\?: string \| null\s*deleted_at\?: string \| null/g, 'deleted_at?: string | null');
fs.writeFileSync('src/lib/database.types.ts', content, 'utf8');
console.log('Fixed DB types duplicate');
