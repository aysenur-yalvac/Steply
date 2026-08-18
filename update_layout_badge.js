const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

const regex1 = /const unreadCount = unreadResult\.status === 'fulfilled' && unreadResult\.value\.data \? new Set\(unreadResult\.value\.data\.map\(m => m\.sender_id\)\)\.size : 0;/;
const replacement1 = `const unreadChatCount = unreadResult.status === 'fulfilled' && unreadResult.value.data ? new Set(unreadResult.value.data.map(m => m.sender_id)).size : 0;`;
content = content.replace(regex1, replacement1);

const regex2 = /unreadCount=\{unreadCount \|\| 0\}/;
const replacement2 = `unreadChatCount={unreadChatCount || 0}`;
content = content.replace(regex2, replacement2);

fs.writeFileSync('src/app/dashboard/layout.tsx', content, 'utf8');
console.log("Updated layout.tsx");
