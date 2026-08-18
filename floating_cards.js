const fs = require('fs');

// 1. Modify globals.css
let globalsCss = fs.readFileSync('src/app/globals.css', 'utf8');

// Replace the previous card styling
globalsCss = globalsCss.replace(
    /background-color: rgba\(15, 23, 42, 0\.6\) !important; \/\* slate-900\/60 \*\//g,
    'background-color: rgba(15, 23, 42, 0.4) !important; /* slate-900/40 */'
);

// Add the shadow and transition if not already there
if (!globalsCss.includes('box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;')) {
    globalsCss = globalsCss.replace(
        /border-color: rgba\(30, 41, 59, 0\.8\) !important; \/\* slate-800\/80 \*\//g,
        'border-color: rgba(30, 41, 59, 0.8) !important; /* slate-800/80 */\n  box-shadow: 0 10px 30px rgba(0,0,0,0.5) !important;\n  transition: all 0.3s ease !important;'
    );
}

// Hover effect for border
const hoverRule = `
.dark [class*="bg-white"]:hover,
.dark .card:hover {
  border-color: rgba(168, 85, 247, 0.3) !important; /* purple-500/30 */
}
`;
if (!globalsCss.includes('.dark [class*="bg-white"]:hover')) {
    globalsCss = globalsCss + hoverRule;
}

fs.writeFileSync('src/app/globals.css', globalsCss, 'utf8');

// 2. Modify src/app/dashboard/projects/new/page.tsx
let newProjPath = 'src/app/dashboard/projects/new/page.tsx';
if (fs.existsSync(newProjPath)) {
    let content = fs.readFileSync(newProjPath, 'utf8');
    
    // Replace the root wrapper background colors with bg-transparent
    content = content.replace(/className="min-h-screen([^"]*bg-slate-50[^"]*)"/g, 'className="min-h-screen bg-transparent dark:bg-transparent"');
    content = content.replace(/className="([^"]*)bg-slate-50([^"]*)"/g, 'className="$1bg-transparent dark:bg-transparent$2"');
    
    // Update the form card container
    // We already added dark:bg-[#0f172a] in a previous step, so we'll search and replace that or just add the new floating card classes
    content = content.replace(/dark:bg-\[#0f172a\]/g, 'dark:bg-slate-900/70 dark:backdrop-blur-lg dark:border dark:border-slate-800 dark:shadow-2xl');
    content = content.replace(/bg-white rounded-3xl shadow-sm border border-slate-200/g, 'bg-white rounded-3xl shadow-sm border border-slate-200 dark:bg-slate-900/70 dark:backdrop-blur-lg dark:border-slate-800 dark:shadow-2xl');
    
    fs.writeFileSync(newProjPath, content, 'utf8');
}

// 3. ProjectCard.tsx tags
let cardPath = 'src/components/projects/ProjectCard.tsx';
if (fs.existsSync(cardPath)) {
    let content = fs.readFileSync(cardPath, 'utf8');
    
    // Update general tags to 60% opacity instead of 80% if there is any text change
    content = content.replace(/dark:bg-slate-800\/80 dark:text-slate-300 dark:border dark:border-slate-700\/50/g, 'dark:bg-slate-800/60 dark:text-slate-300 dark:border dark:border-slate-700/50');
    
    fs.writeFileSync(cardPath, content, 'utf8');
}

console.log("Floating cards and +New route styles updated.");
