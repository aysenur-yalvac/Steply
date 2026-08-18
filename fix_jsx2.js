const fs = require('fs');

function fixMultipleClassName(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    content = content.replace(/className="([^"]+)"\s*\n*\s*className="([^"]+)"/g, 'className="$1 $2"');
    content = content.replace(/className="([^"]+)"\s*\n*\s*className=\{([^}]+)\}/g, 'className={`$1 ${$2}`}');
    content = content.replace(/className=\{([^}]+)\}\s*\n*\s*className="([^"]+)"/g, 'className={`$2 ${$1}`}');
    content = content.replace(/className=\{([^}]+)\}\s*\n*\s*className=\{([^}]+)\}/g, 'className={`$1 ${$2}`}');

    if (original !== content) {
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
