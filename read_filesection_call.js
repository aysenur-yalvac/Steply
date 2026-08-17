const fs = require('fs');
let content = fs.readFileSync('src/components/projects/FileSection.tsx', 'utf8');

const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('saveFileRecordAction'));
if (start !== -1) {
    console.log(lines.slice(Math.max(0, start - 5), start + 20).join('\n'));
}
