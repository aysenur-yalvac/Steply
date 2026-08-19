const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDir(dirPath, callback);
        } else {
            if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
                callback(dirPath);
            }
        }
    });
}

walkDir('src', filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Remove all colored dots. 
    // They usually look like: <span className="w-2 h-2 rounded-full bg-red-500"></span> or <span className={`w-1.5 h-1.5 rounded-full ${PRIORITY_CLASSES[...].dot}`} />
    // First, let's remove the dot property from PRIORITY_CLASSES
    content = content.replace(/dot:\s*"bg-[a-z]+-\d+"/g, 'dot: ""');
    
    // Actually, user wants to completely remove the DOM elements for dots.
    // Let's find spans with w-1.5 h-1.5 rounded-full or w-2 h-2 rounded-full or w-3 h-3 rounded-full that are used for dots.
    // Example: <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
    content = content.replace(/<span[^>]*w-[1-3](\.5)?\s*h-[1-3](\.5)?\s*rounded-full[^>]*><\/span>/g, '');
    content = content.replace(/<span[^>]*w-[1-3](\.5)?\s*h-[1-3](\.5)?\s*rounded-full[^>]*\/>/g, '');
    
    // Wait, in ProjectTaskList: <span className="w-2 h-2 rounded-full bg-emerald-500"></span>> (Note I fixed the extra > earlier, but let's be thorough)
    content = content.replace(/<span className="w-2 h-2 rounded-full bg-emerald-500"><\/span>/g, '');
    content = content.replace(/<span className="w-[0-9.]+ h-[0-9.]+ rounded-full bg-[a-z]+-[0-9]+"><\/span>/g, '');

    // Let's also remove `flex items-center gap-1.5` if it was added solely for the dot, but that's hard to target without breaking things. Let's just remove the span.

    // 2. Unify ALL dark mode badge text/border colors to the standard.
    // The standard is: dark:!bg-slate-800/90 (or dark:!bg-slate-800) dark:!text-slate-200 dark:!border dark:!border-slate-700/80
    // Replace all variations with exactly: dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80
    // First, let's normalize all the ones I previously injected.
    content = content.replace(/dark:!bg-slate-800\/90/g, 'dark:!bg-slate-800');
    
    // Replace any dark:!text-[a-z]+-\d+ or dark:text-[a-z]+-\d+ inside badges with dark:!text-slate-200
    // Be careful, I should only do this for badges/pills. 
    // I know the exact classes I injected:
    const regexps = [
        /dark:!text-emerald-300/g,
        /dark:!text-amber-400/g,
        /dark:!text-red-400/g,
        /dark:!text-blue-400/g,
        /dark:!text-violet-400/g,
        /dark:!text-teal-400/g,
        /dark:!text-orange-400/g,
        /dark:!border-emerald-900\/40/g,
        /dark:!border-amber-900\/40/g,
        /dark:!border-red-900\/40/g,
        /dark:!border-blue-900\/40/g,
        /dark:!border-violet-900\/40/g,
        /dark:!border-teal-900\/40/g,
        /dark:!border-orange-900\/40/g,
    ];

    regexps.forEach(r => {
        content = content.replace(r, match => {
            if (match.includes('border')) return 'dark:!border-slate-700/80';
            return 'dark:!text-slate-200';
        });
    });

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Updated: " + filePath);
    }
});
