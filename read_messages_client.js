const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/messages/MessagesClient.tsx', 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('markMessagesAsReadAction') || lines[i].includes('unread_chat_count_changed')) {
        for (let j = Math.max(0, i - 10); j <= Math.min(lines.length - 1, i + 10); j++) {
            console.log(j + ": " + lines[j]);
        }
        console.log("---");
    }
}
