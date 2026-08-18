const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/messages/MessagesClient.tsx', 'utf8');

content = content.replace(/window\.dispatchEvent\(new CustomEvent\('unread-chats-updated'[\s\S]*?\)\);/g, `window.dispatchEvent(new CustomEvent('unread_chat_count_changed'));`);

fs.writeFileSync('src/app/dashboard/messages/MessagesClient.tsx', content, 'utf8');
console.log("Updated MessagesClient.tsx dispatch event");
