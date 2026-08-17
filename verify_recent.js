const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

const funcIndex = content.indexOf('export async function getRecentConversationsAction');
if (funcIndex !== -1) {
    console.log(content.substring(funcIndex, funcIndex + 1500));
}
