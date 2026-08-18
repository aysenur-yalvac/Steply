const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

const targetDirs = [
    'src/app/dashboard/settings',
    'src/app/dashboard/agenda',
    'src/app/dashboard/messages',
    'src/app/dashboard/school',
    'src/app/dashboard/trash'
];

function applyDarkClasses(filePath) {
    if (filePath.endsWith('.tsx') && fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let oldContent = content;
        
        // General background / borders
        content = content.replace(/bg-white([^A-Za-z0-9_-])/g, 'bg-white dark:bg-slate-900$1');
        content = content.replace(/bg-slate-50([^A-Za-z0-9_-])/g, 'bg-slate-50 dark:bg-slate-950$1');
        content = content.replace(/bg-gray-50([^A-Za-z0-9_-])/g, 'bg-gray-50 dark:bg-slate-950$1');
        content = content.replace(/bg-purple-50([^A-Za-z0-9_-])/g, 'bg-purple-50 dark:bg-slate-950$1');
        content = content.replace(/text-slate-900([^A-Za-z0-9_-])/g, 'text-slate-900 dark:text-slate-100$1');
        content = content.replace(/text-slate-800([^A-Za-z0-9_-])/g, 'text-slate-800 dark:text-slate-100$1');
        content = content.replace(/border-slate-200([^A-Za-z0-9_-])/g, 'border-slate-200 dark:border-slate-800$1');
        content = content.replace(/border-gray-200([^A-Za-z0-9_-])/g, 'border-gray-200 dark:border-slate-800$1');
        
        // Input fields
        content = content.replace(/<input\s+([^>]*)className="([^"]+)"/g, (match, before, classes) => {
            if (!classes.includes('dark:bg-slate-800')) {
                return `<input ${before}className="${classes} dark:bg-slate-800 dark:text-white dark:border-slate-700"`;
            }
            return match;
        });
        content = content.replace(/<select\s+([^>]*)className="([^"]+)"/g, (match, before, classes) => {
            if (!classes.includes('dark:bg-slate-800')) {
                return `<select ${before}className="${classes} dark:bg-slate-800 dark:text-white dark:border-slate-700"`;
            }
            return match;
        });
        content = content.replace(/<textarea\s+([^>]*)className="([^"]+)"/g, (match, before, classes) => {
            if (!classes.includes('dark:bg-slate-800')) {
                return `<textarea ${before}className="${classes} dark:bg-slate-800 dark:text-white dark:border-slate-700"`;
            }
            return match;
        });

        if (content !== oldContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log("Updated", filePath);
        }
    }
}

targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) {
        walkDir(dir, applyDarkClasses);
    }
});
