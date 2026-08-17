const fs = require('fs');
let content = fs.readFileSync('src/components/projects/FileSection.tsx', 'utf8');

const regex = /<input[\s\S]*?type="file"[\s\S]*?onChange=\{handleFileChange\}[\s\S]*?\/>/;
const match = content.match(regex);
if (match) {
    console.log("File input found.");
}

const lines = content.split('\n');
const start = lines.findIndex(l => l.includes('onChange={handleFileChange}'));
if (start !== -1) {
    console.log(lines.slice(Math.max(0, start - 15), start + 30).join('\n'));
}

