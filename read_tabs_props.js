const fs = require('fs');
try {
    let content = fs.readFileSync('src/components/projects/ProjectTabsWrapper.tsx', 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < 30; i++) {
        console.log(i + ": " + lines[i]);
    }
} catch(e) {}
