const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Kanban / List Badges and Tags
    // Priority badges usually have text like bg-red-50 text-red-700
    const priorities = ['red', 'amber', 'emerald', 'blue', 'green', 'yellow', 'purple', 'slate', 'gray'];
    
    priorities.forEach(color => {
        const regexes = [
            new RegExp(`bg-${color}-50([^>]*?)text-${color}-[678]00`, 'g'),
            new RegExp(`bg-${color}-100([^>]*?)text-${color}-[678]00`, 'g')
        ];
        
        regexes.forEach(regex => {
            content = content.replace(regex, (match, g1) => {
                // If it already has the exact string, skip
                if (match.includes('dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200')) {
                    return match;
                }
                // Strip old dark mode classes from this segment
                let stripped = match.replace(/dark:[a-z0-9/\[\]#-]+\s?/g, '');
                return `${stripped.trim()} dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200`;
            });
        });
    });

    // Regular tags (bg-white or bg-slate-50 or bg-gray-50)
    const tagRegexes = [
        /bg-white([^>]*?)text-slate-[56]00/g,
        /bg-slate-50([^>]*?)text-slate-[56]00/g,
        /bg-gray-50([^>]*?)text-gray-[56]00/g,
        /bg-white([^>]*?)text-gray-[56]00/g
    ];

    tagRegexes.forEach(regex => {
        content = content.replace(regex, (match, g1) => {
            if (match.includes('dark:bg-slate-800')) {
                // If it has our dark classes, ensure they are the right ones
                // Let's strip and re-add for consistency
            }
            let stripped = match.replace(/dark:[a-z0-9/\[\]#-]+\s?/g, '');
            return `${stripped.trim()} dark:bg-slate-800 dark:border dark:border-slate-700/80 dark:text-slate-200`;
        });
    });

    if (filePath.endsWith('KanbanBoard.tsx')) {
        // Kolon Sayı Baloncukları: To Do 1, In Review 1...
        // They typically have `bg-white text-slate-500` or something similar next to the header
        // Since we did the general replacement above, they will get `dark:bg-slate-800 dark:text-slate-200`. 
        // The user specifically requested: `dark:bg-slate-800 dark:border dark:border-slate-700` and `dark:text-slate-100 font-bold`.
        // Let's find spans with numbers.
        content = content.replace(/className="ml-2 px-2 py-0\.5 text-xs font-medium bg-white([^"]*)"/g, 
            'className="ml-2 px-2 py-0.5 text-xs font-bold bg-white text-slate-500 dark:bg-slate-800 dark:border dark:border-slate-700 dark:text-slate-100"'
        );
        content = content.replace(/className="w-5 h-5 flex items-center justify-center bg-white([^"]*)"/g, 
            'className="w-5 h-5 flex items-center justify-center bg-white text-slate-500 dark:bg-slate-800 dark:border dark:border-slate-700 dark:text-slate-100 font-bold rounded-full text-xs"'
        );
    }

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Updated tags in: " + filePath);
    }
}

function walkDir(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        if (fs.statSync(dirPath).isDirectory()) {
            walkDir(dirPath);
        } else if (dirPath.endsWith('.tsx') || dirPath.endsWith('.jsx')) {
            processFile(dirPath);
        }
    });
}

walkDir('src');

// + New page specific background fix
let newPagePath = 'src/app/dashboard/projects/new/page.tsx';
if (fs.existsSync(newPagePath)) {
    let content = fs.readFileSync(newPagePath, 'utf8');
    
    // Sayfanın en dışındaki div, main veya form kapsayıcılarının tamamında bulunan bg-white, bg-slate-50 gibi sınıfların yanına karanlık zemin ekle
    content = content.replace(/className="([^"]*)bg-slate-50([^"]*)"/g, 'className="$1bg-slate-50 dark:bg-[#0f172a]$2"');
    content = content.replace(/className="([^"]*)bg-white([^"]*)"/g, 'className="$1bg-white dark:bg-[#0f172a]$2"');
    
    // In case it had dark:bg-[#131927] from before, fix it
    content = content.replace(/dark:bg-\[#131927\]/g, 'dark:bg-[#0f172a]');
    
    // Progress is calculated automatically... kutusu
    content = content.replace(/bg-blue-50([^"]*)/g, 'bg-blue-50 dark:bg-slate-900/80 dark:border dark:border-slate-700 text-slate-500 dark:text-slate-200');
    
    // Remove duplicate dark classes
    content = content.replace(/dark:text-slate-300 dark:text-slate-200/g, 'dark:text-slate-200');
    content = content.replace(/dark:bg-slate-900\/60 dark:bg-slate-900\/80/g, 'dark:bg-slate-900/80');

    fs.writeFileSync(newPagePath, content, 'utf8');
    console.log("Updated new project page");
}

console.log("All fixes applied");
