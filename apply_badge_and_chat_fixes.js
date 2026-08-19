const fs = require('fs');

function replaceFileContent(filePath, replacer) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = replacer(content);
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log("Updated: " + filePath);
        }
    }
}

// 1. KanbanBoard.tsx, ProjectCard.tsx, ListView.tsx -> update PRIORITY_CLASSES and tag tags
const files = [
    'src/components/dashboard/KanbanBoard.tsx',
    'src/app/dashboard/ProjectCard.tsx',
    'src/components/dashboard/ListView.tsx',
    'src/components/projects/ProjectCard.tsx'
];

files.forEach(file => {
    replaceFileContent(file, content => {
        // High
        content = content.replace(/badge: "bg-rose-50[^"]*"/g, 'badge: "bg-rose-50 text-rose-700 border-rose-200 dark:!bg-slate-800 dark:!text-red-300 dark:!border-red-900/40"');
        // Medium
        content = content.replace(/badge: "bg-amber-50[^"]*"/g, 'badge: "bg-amber-50 text-amber-700 border-amber-200 dark:!bg-slate-800 dark:!text-amber-300 dark:!border-amber-900/40"');
        // Low
        content = content.replace(/badge: "bg-teal-50[^"]*"/g, 'badge: "bg-teal-50 text-teal-700 border-teal-200 dark:!bg-slate-800 dark:!text-emerald-300 dark:!border-emerald-900/40"');
        
        // Tags
        const colors = ["violet", "sky", "emerald", "amber", "rose", "indigo", "teal", "orange", "blue"];
        colors.forEach(c => {
            content = content.replace(new RegExp(`"bg-${c}-100 text-${c}-700 border-${c}-200([^"]*)"`, 'g'), 
                `"bg-${c}-100 text-${c}-700 border-${c}-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border dark:!border-slate-700/80"`);
            content = content.replace(new RegExp(`bg-${c}-50 text-${c}-700 border-${c}-200( dark:![^"]*)?`, 'g'), 
                `bg-${c}-50 text-${c}-700 border-${c}-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border dark:!border-slate-700/80`);
        });

        // Date/General badges
        content = content.replace(/bg-slate-100 text-slate-500 border border-slate-200( dark:![^"]*)?/g, 'bg-slate-100 text-slate-500 border border-slate-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border dark:!border-slate-700/80');

        return content;
    });
});

// 2. ProjectTaskList.tsx -> Fix Milestones badge
replaceFileContent('src/components/projects/ProjectTaskList.tsx', content => {
    return content.replace(
        /className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-2\.5 py-1 rounded-full"/g,
        'className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 dark:!bg-slate-800 dark:!text-emerald-300 dark:!border-emerald-900/40 px-2.5 py-1 rounded-full flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>'
    );
});

// 3. page.tsx -> Fix DEVAM EDIYOR (In Progress) and other status badges
replaceFileContent('src/app/dashboard/projects/[id]/page.tsx', content => {
    let newContent = content;
    newContent = newContent.replace(/bg-emerald-100 text-emerald-700[^"]*border-emerald-200/g, 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:!bg-slate-800 dark:!text-emerald-300 dark:!border-emerald-900/40');
    newContent = newContent.replace(/bg-blue-100 text-blue-700[^"]*border-blue-200/g, 'bg-blue-100 text-blue-700 border-blue-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border-slate-700');
    newContent = newContent.replace(/bg-violet-100 text-violet-700[^"]*border-violet-200/g, 'bg-violet-100 text-violet-700 border-violet-200 dark:!bg-slate-800 dark:!text-amber-300 dark:!border-amber-900/40');
    newContent = newContent.replace(/bg-slate-100 text-slate-600[^"]*border-slate-200/g, 'bg-slate-100 text-slate-600 border-slate-200 dark:!bg-slate-800/90 dark:!text-slate-200 dark:!border-slate-700/80');
    return newContent;
});

// 4. ProjectNotes.tsx -> Chat fixes
replaceFileContent('src/components/projects/ProjectNotes.tsx', content => {
    let newContent = content;
    
    // Left Bubble
    newContent = newContent.replace(/bg-gray-100 border border-gray-200\/60 rounded-2xl rounded-tl-none shadow-sm/g, 'bg-gray-100 border border-gray-200/60 rounded-2xl rounded-tl-none shadow-sm dark:bg-slate-800 dark:text-slate-100 dark:border dark:border-slate-700/70');
    
    // Right Bubble
    newContent = newContent.replace(/bg-violet-50 border border-violet-100 rounded-2xl rounded-tr-none shadow-sm/g, 'bg-violet-50 border border-violet-100 rounded-2xl rounded-tr-none shadow-sm dark:bg-purple-600/90 dark:text-white dark:border-purple-500/50');
    
    // Text inside bubble
    newContent = newContent.replace(/text-sm text-gray-800/g, 'text-sm text-gray-800 dark:text-inherit');
    
    // Toggle color (Devamini oku)
    newContent = newContent.replace(/text-gray-600 dark:bg-slate-800 dark:border dark:border-slate-700\/80 dark:text-slate-200 hover:text-gray-800/g, 'text-gray-600 dark:text-slate-300 hover:text-gray-800');
    
    // Timestamp
    newContent = newContent.replace(/text-\[11px\] text-gray-400 mt-2 text-right block select-none/g, 'text-[11px] text-gray-400 dark:text-slate-400 mt-2 text-right block select-none');

    // Container Card
    newContent = newContent.replace(/className="flex flex-col h-\[500px\] bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm"/g, 'className="flex flex-col h-[500px] bg-white dark:bg-[#1a2234] dark:border dark:border-slate-700/60 border border-slate-200 rounded-3xl overflow-hidden shadow-sm"');
    
    // Input Bar container
    newContent = newContent.replace(/bg-white\/90 backdrop-blur-sm border-t border-gray-100/g, 'bg-white/90 dark:bg-[#1a2234] backdrop-blur-sm border-t border-gray-100 dark:border-slate-700/60');
    
    // Textarea
    newContent = newContent.replace(/bg-gray-50 border border-gray-200(\s+)text-sm text-gray-800 dark:[^"]* placeholder-gray-400/g, 'bg-gray-50 border border-gray-200 text-sm text-gray-800 dark:bg-slate-900 dark:text-slate-100 dark:border-slate-700 focus:dark:border-purple-500 placeholder-gray-400 dark:placeholder-slate-500');

    return newContent;
});

console.log("All styles updated.");
