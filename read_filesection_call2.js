const fs = require('fs');
let content = fs.readFileSync('src/components/projects/FileSection.tsx', 'utf8');

const lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('saveFileRecordAction') && !lines[i].includes('import')) {
        console.log(lines.slice(Math.max(0, i - 10), i + 10).join('\n'));
    }
}
