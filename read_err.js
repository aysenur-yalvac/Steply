const fs = require('fs');
let content = fs.readFileSync('src/app/all-projects/page.tsx', 'utf8');
const lines = content.split('\n');
for (let i = 115; i <= 125; i++) {
    console.log(i + ": " + lines[i-1]);
}
