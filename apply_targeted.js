const fs = require('fs');

// 1. DashboardViewSwitcher: Divider and Pills
let switcherPath = 'src/components/dashboard/DashboardViewSwitcher.tsx';
if (fs.existsSync(switcherPath)) {
    let content = fs.readFileSync(switcherPath, 'utf8');
    
    // Toggle Container: bg-white p-1 rounded-xl shadow-sm border border-slate-200
    // We add: dark:bg-slate-900/90 dark:border dark:border-slate-800
    content = content.replace(/className="flex items-center p-1 bg-white([^"]*)"/g, 'className="flex items-center p-1 bg-white $1 dark:bg-slate-900/90 dark:border dark:border-slate-800"');
    content = content.replace(/className="flex items-center p-1 bg-slate-50([^"]*)"/g, 'className="flex items-center p-1 bg-slate-50 $1 dark:bg-slate-900/90 dark:border dark:border-slate-800"');

    // Active button
    content = content.replace(/bg-violet-600 text-white shadow-sm/g, 'bg-violet-600 text-white shadow-sm dark:bg-purple-600 dark:text-white');
    
    // Passive button
    content = content.replace(/text-slate-500 hover:text-slate-700 hover:bg-slate-100/g, 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:bg-transparent dark:text-slate-400 hover:dark:text-slate-200');

    // Divider line
    content = content.replace(/bg-slate-100/g, 'bg-slate-100 dark:bg-slate-800/50');

    fs.writeFileSync(switcherPath, content, 'utf8');
}

// 2. ProjectCard: Priority and Tags
let cardPath = 'src/components/projects/ProjectCard.tsx';
if (fs.existsSync(cardPath)) {
    let content = fs.readFileSync(cardPath, 'utf8');
    
    // Tags
    content = content.replace(/bg-slate-50 text-slate-600/g, 'bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:border dark:border-slate-700/50');
    content = content.replace(/bg-gray-50 text-gray-600/g, 'bg-gray-50 text-gray-600 dark:bg-slate-800/80 dark:text-slate-300 dark:border dark:border-slate-700/50');

    // High
    content = content.replace(/bg-red-50 text-red-600/g, 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400 dark:border dark:border-red-500/30');
    // Medium
    content = content.replace(/bg-amber-50 text-amber-600/g, 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 dark:border dark:border-amber-500/30');
    content = content.replace(/bg-orange-50 text-orange-600/g, 'bg-orange-50 text-orange-600 dark:bg-amber-500/15 dark:text-amber-400 dark:border dark:border-amber-500/30');
    // Low
    content = content.replace(/bg-emerald-50 text-emerald-600/g, 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border dark:border-emerald-500/30');

    fs.writeFileSync(cardPath, content, 'utf8');
}

// 3. ListView: Priority and Tags
let listPath = 'src/components/dashboard/ListView.tsx';
if (fs.existsSync(listPath)) {
    let content = fs.readFileSync(listPath, 'utf8');
    
    content = content.replace(/bg-slate-50 text-slate-600/g, 'bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:border dark:border-slate-700/50');
    content = content.replace(/bg-gray-50 text-gray-600/g, 'bg-gray-50 text-gray-600 dark:bg-slate-800/80 dark:text-slate-300 dark:border dark:border-slate-700/50');
    content = content.replace(/bg-red-50 text-red-600/g, 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400 dark:border dark:border-red-500/30');
    content = content.replace(/bg-amber-50 text-amber-600/g, 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 dark:border dark:border-amber-500/30');
    content = content.replace(/bg-emerald-50 text-emerald-600/g, 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border dark:border-emerald-500/30');

    // And divider if any
    content = content.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-800/50');

    fs.writeFileSync(listPath, content, 'utf8');
}

// 4. New Project Page (+ New Modal)
let newProjPath = 'src/app/dashboard/projects/new/page.tsx';
if (fs.existsSync(newProjPath)) {
    let content = fs.readFileSync(newProjPath, 'utf8');
    
    // modal container
    content = content.replace(/bg-white/g, 'bg-white dark:bg-[#0f172a] dark:text-slate-100 dark:border-slate-800');
    
    // inputs
    content = content.replace(/className="w-full([^"]*)"/g, 'className="w-full $1 dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500"');
    
    fs.writeFileSync(newProjPath, content, 'utf8');
}

// 5. App Global Cards via globals.css
let globalsCss = fs.readFileSync('src/app/globals.css', 'utf8');
let overrides = `
/* 1. En Alt Sayfa Zemin Doygunlugu */
.dark body, .dark main, .dark .dashboard-container {
  background-color: #0b0f17 !important;
}

/* 2. Kartlar & Paneller (Tüm Alt Sayfalar) */
.dark [class*="bg-white"],
.dark [class*="bg-slate-50"],
.dark .card {
  background-color: rgba(15, 23, 42, 0.6) !important; /* slate-900/60 */
  backdrop-filter: blur(12px) !important;
  border-color: rgba(30, 41, 59, 0.8) !important; /* slate-800/80 */
}

/* 3. Metin İkincil */
.dark .text-slate-500,
.dark .text-slate-600,
.dark p, .dark span {
  color: #cbd5e1 !important; /* slate-300 */
}
`;
if (!globalsCss.includes('En Alt Sayfa Zemin Doygunlugu')) {
    fs.writeFileSync('src/app/globals.css', globalsCss + '\n' + overrides, 'utf8');
}

console.log("Applied targeted fixes");
