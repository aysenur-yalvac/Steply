const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

const typeIndex = content.indexOf('export type Conversation');
if (typeIndex !== -1) {
    console.log(content.substring(typeIndex, typeIndex + 300));
}
