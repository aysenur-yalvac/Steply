const fs = require('fs');

function fixMultipleClassName(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    // Find multiple className attributes on the same tag.
    // e.g. className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500"
    //             className="w-full pl-10 pr-10 py-3 text-sm text-slate-300 placeholder:text-slate-600 rounded-xl outline-none transition-all"
    
    // We just remove the second className=" and merge it to the first.
    let changed = false;
    content = content.replace(/className="([^"]+)"\s+className="([^"]+)"/g, (match, p1, p2) => {
        changed = true;
        return `className="${p1} ${p2}"`;
    });
    
    // Sometimes it spans newlines
    content = content.replace(/className="([^"]+)"\s*\n\s*className="([^"]+)"/g, (match, p1, p2) => {
        changed = true;
        return `className="${p1} ${p2}"`;
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Fixed multiple classNames in", filePath);
    }
}

const path = require('path');
function walkDirAndProcess(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDirAndProcess(dirPath);
        } else if (dirPath.endsWith('.tsx')) {
            fixMultipleClassName(dirPath);
        }
    });
}

walkDirAndProcess('src');
