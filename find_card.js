const fs = require('fs');
const path = require('path');

function findProjectCard(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let stat = fs.statSync(dirPath);
        if (stat.isDirectory()) {
            findProjectCard(dirPath);
        } else if (f === 'ProjectCard.tsx' || f === 'ProjectCard.js') {
            console.log("Found:", dirPath);
            let content = fs.readFileSync(dirPath, 'utf8');
            let m = content.match(/dark:bg-\[[#a-zA-Z0-9]+\]/g);
            console.log(m);
        }
    });
}
findProjectCard('src');
