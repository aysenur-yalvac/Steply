const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

walkDir('src', (filePath) => {
    if (filePath.endsWith('.tsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('border-slate-200') || content.includes('border-b') || content.includes('DashboardViewSwitcher')) {
            // we will need to modify these
        }
    }
});
console.log("Searching done, I'll use a more targeted script");
