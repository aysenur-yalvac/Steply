const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/messages/MessagesClient.tsx', 'utf8');

const lines = content.split('\n');
const readIndex = lines.findIndex(l => l.includes('markMessagesAsRead'));
if (readIndex !== -1) {
    for (let i = Math.max(0, readIndex - 5); i < Math.min(readIndex + 20, lines.length); i++) {
        console.log(lines[i]);
    }
} else {
    console.log("Could not find markMessagesAsRead. Searching for 'read'");
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].toLowerCase().includes('read')) {
            console.log(`Line ${i}: ${lines[i]}`);
        }
    }
}
