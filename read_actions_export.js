const fs = require('fs');
let content = fs.readFileSync('src/lib/actions.ts', 'utf8');

const regex = /export type FileVisibility = 'PUBLIC' \| 'MEMBERS_ONLY' \| 'ONLY_ME';/;
const match = content.match(regex);
if (!match) {
    console.log("Could not find FileVisibility export.");
} else {
    console.log("Found FileVisibility export.");
}

const lines = content.split('\n');
const idx = lines.findIndex(l => l.includes('FileVisibility'));
if (idx !== -1) {
    console.log(lines.slice(Math.max(0, idx - 2), idx + 10).join('\n'));
}
