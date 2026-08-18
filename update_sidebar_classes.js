const fs = require('fs');
let sidebarContent = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// Replace active/passive logic
const activeStr = '"bg-violet-600 text-white shadow-md shadow-violet-200 dark:bg-transparent dark:text-purple-400 dark:font-bold dark:shadow-none"';
const passiveStr = '"text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-300 dark:hover:bg-slate-800"';

sidebarContent = sidebarContent.replace(
    /isActive \? "[^"]+" : "[^"]+"/g,
    `isActive ? ${activeStr} : ${passiveStr}`
);

// Sidebar outer background
// The sidebar has <aside className="fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800
sidebarContent = sidebarContent.replace(
    /bg-white dark:bg-slate-900/g,
    'bg-white dark:bg-[#0f172a]'
);
sidebarContent = sidebarContent.replace(
    /bg-white dark:bg-slate-950/g,
    'bg-white dark:bg-[#0f172a]'
);

// Replace any remaining text-slate-500 with text-slate-500 dark:text-slate-300
sidebarContent = sidebarContent.replace(/text-slate-500([^A-Za-z0-9_-])/g, (match, p1) => {
    if (!p1.includes('dark:text-slate-300')) {
        return `text-slate-500 dark:text-slate-300${p1}`;
    }
    return match;
});

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', sidebarContent, 'utf8');
console.log("Updated DashboardSidebar.tsx again");

