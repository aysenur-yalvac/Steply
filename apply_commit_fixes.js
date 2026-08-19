const fs = require('fs');

let ghPath = 'src/components/projects/GitHubIntegrationCard.tsx';
if (fs.existsSync(ghPath)) {
    let content = fs.readFileSync(ghPath, 'utf8');
    
    // 1. Commit item box
    content = content.replace(/className="([^"]*)bg-slate-50 dark:bg-zinc-800\/50 border border-slate-200\/60 dark:border-zinc-700\/50([^"]*)"/g, (match, g1, g2) => {
        return `className="${g1}bg-slate-50 border border-slate-200/60 dark:bg-[#0f172a] dark:border dark:border-slate-700/80 dark:shadow-sm hover:dark:border-slate-500/80 transition-colors${g2}"`;
    });
    
    // 2. Commit message text
    content = content.replace(/className="text-sm text-slate-700 font-medium mt-1 break-words"/g, 'className="text-sm text-slate-700 dark:text-slate-100 font-medium mt-1 break-words"');
    
    // Make sure the main card wrapper is still fully dark floating card (I did this before but just to be 100% sure the user's first instruction is met too)
    content = content.replace(/bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/g, 'bg-white dark:bg-[#1a2234] dark:border dark:border-slate-700/60 dark:shadow-[0_12px_30px_rgba(0,0,0,0.7)]');

    fs.writeFileSync(ghPath, content, 'utf8');
}

// Project Status main card just in case
let contentPath = 'src/components/projects/ProjectEditableContent.tsx';
if (fs.existsSync(contentPath)) {
    let content = fs.readFileSync(contentPath, 'utf8');
    content = content.replace(/className="([^"]*)bg-white([^"]*)"/g, (match, g1, g2) => {
        if (g1.includes('rounded-3xl') || g2.includes('rounded-3xl')) {
            let s = match.replace(/dark:[a-z0-9/\[\]#-]+\s?/g, '');
            return s.replace('bg-white', 'bg-white dark:bg-[#1a2234] dark:border dark:border-slate-700/60 dark:shadow-[0_12px_30px_rgba(0,0,0,0.7)]');
        }
        return match;
    });
    fs.writeFileSync(contentPath, content, 'utf8');
}

console.log("Done");
