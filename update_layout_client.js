const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

// Remove the parallel fetch of messages
const promiseAllRegex = /const \[unreadResult, linkedAccountsResult\] = await Promise\.allSettled\(\[[\s\S]*?\]\);/g;
content = content.replace(promiseAllRegex, "const linkedAccountsResult = await getLinkedAccountsAction();");

// Remove unreadCount parsing
content = content.replace(/const unreadChatCount = unreadResult\.status === 'fulfilled' && unreadResult\.value\.data \? new Set\(unreadResult\.value\.data\.map\(m => m\.sender_id\)\)\.size : 0;\n/g, "");

// Fix linkedAccounts parse since it is no longer Promise.allSettled
content = content.replace(/const linkedAccounts: LinkedAccount\[\] = linkedAccountsResult\.status === 'fulfilled' \? \(linkedAccountsResult\.value as LinkedAccount\[\]\) : \[\];/g, "const linkedAccounts: LinkedAccount[] = linkedAccountsResult || [];");

// Remove unreadChatCount prop from DashboardSidebar
content = content.replace(/unreadChatCount=\{unreadChatCount \|\| 0\}\n/g, "");

fs.writeFileSync('src/app/dashboard/layout.tsx', content, 'utf8');
console.log("Updated layout.tsx");
