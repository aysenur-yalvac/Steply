const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

const markStart = content.indexOf('export async function markMessagesAsReadAction');
if (markStart !== -1) {
    console.log("markMessagesAsReadAction found:\n", content.substring(markStart, markStart + 600));
}

const getRecentStart = content.indexOf('export async function getRecentConversationsAction');
if (getRecentStart !== -1) {
    console.log("getRecentConversationsAction found:\n", content.substring(getRecentStart, getRecentStart + 1000));
}
