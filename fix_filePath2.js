const fs = require('fs');
let content = fs.readFileSync('src/lib/actions.ts', 'utf8');

content = content.replace('getPublicUrl(filePath)', 'getPublicUrl(fileUrl)');

fs.writeFileSync('src/lib/actions.ts', content, 'utf8');
console.log("Fixed getPublicUrl(fileUrl) in actions.ts");
