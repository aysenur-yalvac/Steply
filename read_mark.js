const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

const markStart = content.indexOf('export async function markMessagesAsReadAction');
if (markStart !== -1) {
    console.log(content.substring(markStart, markStart + 600));
}
