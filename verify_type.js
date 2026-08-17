const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

const typeIndex = content.indexOf('Conversation');
if (typeIndex !== -1) {
    console.log(content.substring(Math.max(0, typeIndex - 50), typeIndex + 300));
}
