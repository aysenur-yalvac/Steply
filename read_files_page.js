const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

const regex = /<FileSection[\s\S]*?\/>/;
const match = content.match(regex);
if (match) {
    console.log(match[0]);
}

const projFilesRegex = /project\.files/;
const idx = content.search(projFilesRegex);
console.log(content.substring(Math.max(0, idx - 100), idx + 200));

