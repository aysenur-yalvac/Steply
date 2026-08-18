const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/messages/MessagesClient.tsx', 'utf8');

content = content.replace(/window\.dispatchEvent\(new CustomEvent\('chat-update'/g, `window.dispatchEvent(new CustomEvent('unread-chats-updated'`);

fs.writeFileSync('src/app/dashboard/messages/MessagesClient.tsx', content, 'utf8');
console.log("Updated MessagesClient.tsx event dispatch");
