const fs = require('fs');
try {
    let content = fs.readFileSync('src/components/projects/ProjectTabsWrapper.tsx', 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes('bg-red-500 animate-pulse')) {
            for (let j = Math.max(0, i - 20); j <= Math.min(lines.length - 1, i + 20); j++) {
                console.log(j + ": " + lines[j]);
            }
            console.log("---");
        }
    }
} catch(e) {}
