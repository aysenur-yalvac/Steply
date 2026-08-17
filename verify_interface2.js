const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');
const interfaceIndex = content.indexOf('interface Conversation');
if (interfaceIndex !== -1) {
    console.log(content.substring(interfaceIndex, interfaceIndex + 200));
}
