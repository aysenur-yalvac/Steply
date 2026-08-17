const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

const lines = content.split('\n');
const funcIndex = lines.findIndex(l => l.includes('export async function getMessagesAction'));
if (funcIndex !== -1) {
    for (let i = funcIndex; i < Math.min(funcIndex + 25, lines.length); i++) {
        console.log(lines[i]);
    }
}
