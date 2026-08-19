const fs = require('fs');

// 1. Kanban and List cards, and column headers
let kanbanBoardPath = 'src/components/dashboard/KanbanBoard.tsx';
if (fs.existsSync(kanbanBoardPath)) {
    let kanban = fs.readFileSync(kanbanBoardPath, 'utf8');
    
    // Column Headers: text-slate-700 -> dark:text-slate-100
    kanban = kanban.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-100');
    // Badges/Numbers next to headers: bg-white text-slate-500 -> dark:bg-slate-800 dark:text-slate-300
    kanban = kanban.replace(/bg-white text-slate-500/g, 'bg-white text-slate-500 dark:bg-slate-800 dark:text-slate-300 dark:border-none');
    
    fs.writeFileSync(kanbanBoardPath, kanban, 'utf8');
}

// Global Cards CSS in globals.css
let globalsCss = fs.readFileSync('src/app/globals.css', 'utf8');

// The card background was set to #131927. Let's update it to #1a2234.
// Let's rewrite the UNIFIED DARK MODE block for cards to ensure it is correctly elevated
globalsCss = globalsCss.replace(
    /\.dark \[class\*="bg-white"\],\n\.dark \[class\*="bg-slate-50"\],\n\.dark \.card,\n\.dark aside,\n\.dark header,\n\.dark dialog,\n\.dark \[role="dialog"\],\n\.dark \[data-state="open"\],\n\.dark \[class\*="bg-slate-900"\],\n\.dark \[class\*="bg-\[#0f172a\]"\],\n\.dark \[class\*="bg-\[#0b0f17\]"\],\n\.dark \[class\*="bg-\[#0d111a\]"\] \{\n  background-color: #131927 !important;\n  background-image: none !important;\n  backdrop-filter: none !important;\n\}/,
    `.dark body,
.dark main,
.dark #__next,
.dark .dashboard-container {
  background-color: #131927 !important;
  background-image: none !important;
  backdrop-filter: none !important;
}

.dark [class*="bg-white"],
.dark [class*="bg-slate-50"],
.dark .card,
.dark aside,
.dark header,
.dark dialog,
.dark [role="dialog"],
.dark [data-state="open"],
.dark [class*="bg-slate-900"],
.dark [class*="bg-[#0f172a]"],
.dark [class*="bg-[#0b0f17]"],
.dark [class*="bg-[#0d111a]"] {
  background-color: #1a2234 !important;
  background-image: none !important;
  backdrop-filter: none !important;
  box-shadow: 0 12px 30px rgba(0,0,0,0.7) !important;
  transition: all 0.2s ease !important;
}`
);

// Add hover lift to cards (any clickable card or .card class)
const hoverLift = `
.dark .card:hover,
.dark [class*="hover:-translate-y"]:hover,
.dark [class*="bg-white"]:hover {
  transform: translateY(-4px) !important;
  border-color: rgba(168, 85, 247, 0.4) !important;
}
`;
if (!globalsCss.includes('transform: translateY')) {
    globalsCss += hoverLift;
}

// Update the border for cards
globalsCss = globalsCss.replace(
    /border: 1px solid rgba\(30, 41, 59, 0\.6\) !important; \/\* border-slate-800\/60 \*\//g,
    'border: 1px solid rgba(51, 65, 85, 0.6) !important; /* border-slate-700/60 */'
);

fs.writeFileSync('src/app/globals.css', globalsCss, 'utf8');

// 2. ProjectCard.tsx and ListView.tsx Tags/Badges
function desaturateTags(filePath) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Instead of parsing old replacements, let's just use a clean regex for all tags
    // They are currently bg-something-50 text-something-600 dark:bg-something...
    // We will just replace the whole dark: class string with the new monochrome one
    content = content.replace(/dark:bg-[a-z0-9/-]+ dark:text-[a-z0-9/-]+ dark:border dark:border-[a-z0-9/-]+/g, 'dark:bg-slate-800 dark:text-slate-200 dark:border dark:border-slate-700');
    content = content.replace(/dark:bg-[a-z0-9/-]+ dark:text-[a-z0-9/-]+/g, 'dark:bg-slate-800 dark:text-slate-200');

    fs.writeFileSync(filePath, content, 'utf8');
}
desaturateTags('src/components/projects/ProjectCard.tsx');
desaturateTags('src/app/dashboard/ProjectCard.tsx'); // Try alternate location
desaturateTags('src/components/dashboard/ListView.tsx');

// 3. + New Route page.tsx background
let newRoutePath = 'src/app/dashboard/projects/new/page.tsx';
if (fs.existsSync(newRoutePath)) {
    let content = fs.readFileSync(newRoutePath, 'utf8');
    
    // Fix the background
    content = content.replace(/className="([^"]*)bg-white([^"]*)"/g, 'className="$1bg-white dark:bg-[#131927]$2"');
    content = content.replace(/className="([^"]*)bg-slate-50([^"]*)"/g, 'className="$1bg-slate-50 dark:bg-[#131927]$2"');
    content = content.replace(/className="([^"]*)bg-transparent dark:bg-transparent([^"]*)"/g, 'className="$1bg-transparent dark:bg-[#131927]$2"'); // from previous attempt
    
    // Fix the info box "Progress is calculated automatically..."
    // It usually has bg-blue-50 or bg-slate-50 text-slate-500
    content = content.replace(/bg-blue-50/g, 'bg-blue-50 dark:bg-slate-900/60 dark:border dark:border-slate-800');
    content = content.replace(/text-slate-500/g, 'text-slate-500 dark:text-slate-300');
    content = content.replace(/text-slate-600/g, 'text-slate-600 dark:text-slate-300');
    content = content.replace(/text-slate-700/g, 'text-slate-700 dark:text-slate-300');
    
    fs.writeFileSync(newRoutePath, content, 'utf8');
}

console.log("Fixes applied");
