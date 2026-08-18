const fs = require('fs');

const files = [
    'src/components/dashboard/KanbanBoard.tsx',
    'src/components/dashboard/DashboardViewSwitcher.tsx',
    'src/components/ui/animated-project-cards.tsx',
    'src/components/project/ProjectCard.tsx',
    'src/app/dashboard/page.tsx',
    'src/app/dashboard/all-projects/page.tsx',
    'src/app/dashboard/projects/[id]/page.tsx'
];

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        let oldContent = content;
        content = content.replace(/bg-white([^A-Za-z0-9_-])/g, 'bg-white dark:bg-slate-900$1');
        content = content.replace(/bg-slate-50([^A-Za-z0-9_-])/g, 'bg-slate-50 dark:bg-slate-950$1');
        content = content.replace(/bg-gray-100([^A-Za-z0-9_-])/g, 'bg-gray-100 dark:bg-slate-950$1');
        content = content.replace(/text-slate-900([^A-Za-z0-9_-])/g, 'text-slate-900 dark:text-slate-100$1');
        content = content.replace(/border-gray-200([^A-Za-z0-9_-])/g, 'border-gray-200 dark:border-slate-800$1');
        if (content !== oldContent) {
            fs.writeFileSync(file, content, 'utf8');
            console.log("Updated", file);
        }
    }
}
