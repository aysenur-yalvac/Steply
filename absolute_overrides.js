const fs = require('fs');

function applyDarkClasses(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Replace PRIORITY_CLASSES in KanbanBoard and anywhere else
    content = content.replace(/badge: "bg-teal-50 text-teal-700 border-teal-200"/g, 'badge: "bg-teal-50 text-teal-700 border-teal-200 dark:!bg-slate-800 dark:!border-slate-700/80 dark:!text-slate-100 font-medium"');
    content = content.replace(/badge: "bg-amber-50 text-amber-700[^"]*"/g, 'badge: "bg-amber-50 text-amber-700 border-amber-200 dark:!bg-slate-800 dark:!border-slate-700/80 dark:!text-slate-100 font-medium"');
    content = content.replace(/badge: "bg-rose-50\s+text-rose-700\s+border-rose-200"/g, 'badge: "bg-rose-50 text-rose-700 border-rose-200 dark:!bg-slate-800 dark:!border-slate-700/80 dark:!text-slate-100 font-medium"');
    
    // Tag colors array
    const colors = [
        "violet", "sky", "emerald", "amber", "rose", "indigo", "teal", "orange", "blue"
    ];
    
    colors.forEach(c => {
        content = content.replace(new RegExp(`"bg-${c}-100 text-${c}-700 border-${c}-200"`, 'g'), 
            `"bg-${c}-100 text-${c}-700 border-${c}-200 dark:!bg-slate-800 dark:!border-slate-700/80 dark:!text-slate-200"`);
        // Just in case it's -50 instead of -100
        content = content.replace(new RegExp(`bg-${c}-50 text-${c}-700 border-${c}-200([^"]*)`, 'g'), 
            `bg-${c}-50 text-${c}-700 border-${c}-200 dark:!bg-slate-800 dark:!border-slate-700/80 dark:!text-slate-200`);
    });
    
    // The +N tags in ProjectCard
    content = content.replace(/bg-slate-100 text-slate-500([^"]*)border border-slate-200/g, 'bg-slate-100 text-slate-500 border border-slate-200 dark:!bg-slate-800 dark:!border-slate-700/80 dark:!text-slate-200');

    // Number Bubbles in KanbanBoard
    // <span className="text-xs font-extrabold w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-0.5" style={{ background: cfg.countBg, color: cfg.countColor }}>
    if (filePath.includes('KanbanBoard.tsx')) {
        content = content.replace(
            /className="text-xs font-extrabold w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-0\.5"/g,
            'className="text-xs font-bold w-7 h-7 rounded-full flex items-center justify-center shrink-0 ml-0.5 dark:!bg-slate-800 dark:!border dark:!border-slate-700 dark:!text-slate-100"'
        );
    }
    
    fs.writeFileSync(filePath, content, 'utf8');
}

applyDarkClasses('src/components/dashboard/KanbanBoard.tsx');
applyDarkClasses('src/app/dashboard/ProjectCard.tsx');
applyDarkClasses('src/components/dashboard/ListView.tsx');
applyDarkClasses('src/components/projects/ProjectCard.tsx');

// Handle + New Route background
let newPagePath = 'src/app/dashboard/projects/new/page.tsx';
if (fs.existsSync(newPagePath)) {
    let content = fs.readFileSync(newPagePath, 'utf8');
    content = content.replace(/className="([^"]*)bg-white([^"]*)"/g, 'className="$1bg-white dark:bg-[#0f172a]$2"');
    content = content.replace(/className="([^"]*)bg-slate-50([^"]*)"/g, 'className="$1bg-slate-50 dark:bg-[#0f172a]$2"');
    // Ensure "Progress is calculated automatically..." box is correct
    content = content.replace(/bg-blue-50/g, 'bg-blue-50 dark:bg-slate-900/80 dark:border dark:border-slate-700');
    content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-200');
    fs.writeFileSync(newPagePath, content, 'utf8');
}

console.log("Applied absolute overrides");
