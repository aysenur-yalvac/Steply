const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

const start = content.indexOf('export async function markMessagesAsReadAction');
if (start !== -1) {
    console.log(content.substring(start, start + 1000));
}
