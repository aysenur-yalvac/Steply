const fs = require('fs');
try {
    let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('projectNotes =')) {
            for (let j = Math.max(0, i - 10); j <= Math.min(lines.length - 1, i + 10); j++) {
                console.log(j + ": " + lines[j]);
            }
            console.log("---");
        }
    }
} catch(e) {}
