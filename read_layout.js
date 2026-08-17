const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

const countStart = content.indexOf('getUnreadChatCountAction');
if (countStart !== -1) {
    console.log("getUnreadChatCountAction found in layout:\n", content.substring(Math.max(0, countStart - 200), countStart + 400));
}

const actionPath = 'src/lib/social-actions.ts';
let actionContent = fs.readFileSync(actionPath, 'utf8');
const actionStart = actionContent.indexOf('export async function getUnreadChatCountAction');
if (actionStart !== -1) {
    console.log("getUnreadChatCountAction logic:\n", actionContent.substring(actionStart, actionStart + 600));
}
