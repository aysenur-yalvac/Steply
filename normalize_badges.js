const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath, callback);
        } else {
            if (dirPath.endsWith('.tsx') || dirPath.endsWith('.ts')) {
                callback(dirPath);
            }
        }
    });
}

const colors = ['red', 'orange', 'amber', 'yellow', 'lime', 'green', 'emerald', 'teal', 'cyan', 'sky', 'blue', 'indigo', 'violet', 'purple', 'fuchsia', 'pink', 'rose'];

walkDir('src', filePath => {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Remove any dots left (just to be safe)
    content = content.replace(/<span[^>]*w-[1-3](\.5)?\s*h-[1-3](\.5)?\s*rounded-full[^>]*bg-[a-z]+-\d+[^>]*><\/span>/g, '');
    content = content.replace(/<span[^>]*w-[1-3](\.5)?\s*h-[1-3](\.5)?\s*rounded-full[^>]*bg-[a-z]+-\d+[^>]*\/>/g, '');
    content = content.replace(/<span[^>]*w-[1-3](\.5)?\s*h-[1-3](\.5)?\s*rounded-full[^>]*bg-[#A-Fa-f0-9]+[^>]*><\/span>/g, '');
    content = content.replace(/<span[^>]*w-[1-3](\.5)?\s*h-[1-3](\.5)?\s*rounded-full[^>]*bg-[#A-Fa-f0-9]+[^>]*\/>/g, '');

    // For each color, find badge class patterns and enforce the dark mode style
    colors.forEach(color => {
        // Pattern: bg-color-50 (or 100), maybe border, text-color-700 (or 600)
        // We will match a className string that contains bg-{color}-50 or 100, and text-{color}-...
        
        let regex = new RegExp(`"(.*?bg-${color}-(?:50|100).*?text-${color}-(?:600|700).*?)"`, 'g');
        content = content.replace(regex, (match, inner) => {
            // Strip out all dark: classes
            let clean = inner.replace(/dark:(!?)[\w-./]+/g, '').replace(/\s+/g, ' ').trim();
            // Ensure no duplicate borders
            if (!clean.includes('border ') && !clean.includes(`border-${color}`)) {
                // If it doesn't have border, maybe we just leave it.
            }
            return `"${clean} dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80"`;
        });

        // Also match backtick strings
        let regex2 = new RegExp(`\`(.*?bg-${color}-(?:50|100).*?text-${color}-(?:600|700).*?)\``, 'g');
        content = content.replace(regex2, (match, inner) => {
            let clean = inner.replace(/dark:(!?)[\w-./]+/g, '').replace(/\s+/g, ' ').trim();
            return `\`${clean} dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80\``;
        });
    });

    // Handle Teacher Badge: bg-[#7C3AFF]/10 text-[#7C3AFF] border border-[#7C3AFF]/20
    content = content.replace(/bg-\[#7C3AFF\]\/10 text-\[#7C3AFF\] border border-\[#7C3AFF\]\/20/g, 
        'bg-[#7C3AFF]/10 text-[#7C3AFF] border border-[#7C3AFF]/20 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80');

    // Handle user/custom tags with bg-slate-100 text-slate-500
    let regex3 = new RegExp(`"(.*?bg-slate-100.*?text-slate-[56]00.*?)"`, 'g');
    content = content.replace(regex3, (match, inner) => {
        let clean = inner.replace(/dark:(!?)[\w-./]+/g, '').replace(/\s+/g, ' ').trim();
        return `"${clean} dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80"`;
    });
    
    let regex4 = new RegExp(`\`(.*?bg-slate-100.*?text-slate-[56]00.*?)\``, 'g');
    content = content.replace(regex4, (match, inner) => {
        let clean = inner.replace(/dark:(!?)[\w-./]+/g, '').replace(/\s+/g, ' ').trim();
        return `\`${clean} dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80\``;
    });


    // Make sure we didn't duplicate dark classes
    content = content.replace(/(dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700\/80 )+/g, 'dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80 ');
    content = content.replace(/dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700\/80 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700\/80/g, 'dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80');


    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Updated: " + filePath);
    }
});
