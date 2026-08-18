const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // 1. Divider line
    content = content.replace(/border-slate-200/g, 'border-slate-200 dark:border-slate-800/50');
    content = content.replace(/bg-slate-100/g, 'bg-slate-100 dark:bg-slate-800/50');
    content = content.replace(/border-slate-100/g, 'border-slate-100 dark:border-slate-800/50');

    // 2. DashboardViewSwitcher - Toggle Pill
    if (filePath.includes('DashboardViewSwitcher.tsx')) {
        // Toggle pill container (has bg-slate-50 or bg-white and flex rounded-full)
        content = content.replace(/className="flex items-center p-1 bg-white([^"]*)"/g, 'className="flex items-center p-1 bg-white $1 dark:bg-slate-900/90 dark:border dark:border-slate-800"');
        content = content.replace(/className="flex items-center p-1 bg-slate-50([^"]*)"/g, 'className="flex items-center p-1 bg-slate-50 $1 dark:bg-slate-900/90 dark:border dark:border-slate-800"');
        
        // Active button
        content = content.replace(/bg-violet-600 text-white shadow-sm/g, 'bg-violet-600 text-white shadow-sm dark:bg-purple-600 dark:text-white');
        
        // Passive button
        content = content.replace(/text-slate-500 hover:text-slate-700 hover:bg-slate-100/g, 'text-slate-500 hover:text-slate-700 hover:bg-slate-100 dark:bg-transparent dark:text-slate-400 hover:dark:text-slate-200 hover:dark:bg-slate-800/50');
    }

    // 3. ProjectCard - Tags and Badges
    if (filePath.includes('ProjectCard.tsx') || filePath.includes('ListView.tsx') || filePath.includes('DashboardViewSwitcher.tsx')) {
        // Tags
        content = content.replace(/bg-slate-50 text-slate-600/g, 'bg-slate-50 text-slate-600 dark:bg-slate-800/80 dark:text-slate-300 dark:border dark:border-slate-700/50');
        content = content.replace(/bg-gray-50 text-gray-600/g, 'bg-gray-50 text-gray-600 dark:bg-slate-800/80 dark:text-slate-300 dark:border dark:border-slate-700/50');
        
        // High
        content = content.replace(/bg-red-50 text-red-600/g, 'bg-red-50 text-red-600 dark:bg-red-500/15 dark:text-red-400 dark:border dark:border-red-500/30');
        content = content.replace(/bg-red-100 text-red-700/g, 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400 dark:border dark:border-red-500/30');
        
        // Medium
        content = content.replace(/bg-amber-50 text-amber-600/g, 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400 dark:border dark:border-amber-500/30');
        content = content.replace(/bg-amber-100 text-amber-700/g, 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400 dark:border dark:border-amber-500/30');
        content = content.replace(/bg-orange-50 text-orange-600/g, 'bg-orange-50 text-orange-600 dark:bg-amber-500/15 dark:text-amber-400 dark:border dark:border-amber-500/30');
        
        // Low
        content = content.replace(/bg-emerald-50 text-emerald-600/g, 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border dark:border-emerald-500/30');
        content = content.replace(/bg-emerald-100 text-emerald-700/g, 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400 dark:border dark:border-emerald-500/30');
    }

    // 4. Modals and Drawers (+ New)
    if (filePath.includes('NewProjectModal.tsx') || filePath.includes('Create') || filePath.includes('page.tsx') || filePath.includes('Modal') || filePath.includes('Drawer')) {
        // Modal container (bg-white or bg-slate-50 inside fixed/absolute or dialog)
        content = content.replace(/bg-white([^A-Za-z0-9_-])/g, (match, p1) => {
            if (!match.includes('dark:bg-')) return `bg-white dark:bg-[#0f172a] dark:text-slate-100 dark:border dark:border-slate-800${p1}`;
            return match;
        });
        
        // Inputs
        content = content.replace(/<input/g, '<input className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500"');
        content = content.replace(/<textarea/g, '<textarea className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500"');
        content = content.replace(/<select/g, '<select className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500"');
    }

    // 5. Global Card Harmonies
    // Apply card styling for analytics, messages, settings, dashboard
    if (content.includes('className=')) {
        // Any div with bg-white rounded-xl/2xl/3xl shadow 
        content = content.replace(/bg-white([^"]*?shadow[^"]*)/g, (match, p1) => {
            if (!match.includes('dark:bg-')) return `bg-white dark:bg-slate-900/60 dark:backdrop-blur-md dark:border dark:border-slate-800/80${p1}`;
            return match;
        });
    }

    // Fix multiple dark:bg classes that might have been stacked
    content = content.replace(/dark:bg-[#0f172a] dark:bg-slate-900\/60/g, 'dark:bg-[#0f172a]');
    content = content.replace(/dark:bg-slate-900\/60 dark:bg-[#0f172a]/g, 'dark:bg-slate-900/60');
    
    // De-duplicate dark classes just in case
    content = content.replace(/dark:text-slate-100 dark:text-slate-100/g, 'dark:text-slate-100');
    content = content.replace(/dark:border-slate-800\/50 dark:border-slate-800\/50/g, 'dark:border-slate-800/50');
    
    // Clean multiple className props on inputs created by the naive replace
    content = content.replace(/className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500"\s+className="/g, 'className="dark:bg-slate-900 dark:border-slate-800 dark:text-slate-200 focus:dark:border-purple-500 ');

    if (original !== content) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log("Updated", filePath);
    }
}

function walkDirAndProcess(dir) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        if (isDirectory) {
            walkDirAndProcess(dirPath);
        } else if (dirPath.endsWith('.tsx')) {
            processFile(dirPath);
        }
    });
}

walkDirAndProcess('src');
console.log("Completed UI dark mode replacements");
