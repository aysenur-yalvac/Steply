const fs = require('fs');
let content = fs.readFileSync('src/components/projects/FileSection.tsx', 'utf8');

const lines = content.split('\n');
for (let i = 0; i < Math.min(60, lines.length); i++) {
    console.log(lines[i]);
}
