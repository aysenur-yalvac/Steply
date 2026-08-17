const fs = require('fs');
let content = fs.readFileSync('src/lib/actions.ts', 'utf8');

content = content.replace('!filePath', '!fileUrl');
content = content.replace('filePath eksik', 'fileUrl eksik');

fs.writeFileSync('src/lib/actions.ts', content, 'utf8');
console.log("Fixed filePath to fileUrl in actions.ts");
