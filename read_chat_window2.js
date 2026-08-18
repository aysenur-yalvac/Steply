const fs = require('fs');
try {
    let content = fs.readFileSync('src/components/social/ChatWindow.tsx', 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('markMessagesAsReadAction')) {
            for (let j = Math.max(0, i - 15); j <= Math.min(lines.length - 1, i + 15); j++) {
                console.log(j + ": " + lines[j]);
            }
            console.log("---");
        }
    }
} catch(e) {}
