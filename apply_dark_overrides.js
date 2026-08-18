const fs = require('fs');

// 1. Update globals.css
let cssContent = fs.readFileSync('src/app/globals.css', 'utf8');

const overrides = `
.dark body,
.dark main,
.dark #__next {
  background-color: #020617 !important; /* Slate 950 */
  color: #f8fafc !important;
}

/* Sert kodlanmış bg-white sınıflarını dark modda otomatik koyulaştır */
.dark .bg-white {
  background-color: #0f172a !important; /* Slate 900 */
  border-color: #1e293b !important; /* Slate 800 */
  color: #f8fafc !important;
}

.dark .bg-slate-50,
.dark .bg-gray-50,
.dark .bg-purple-50,
.dark .bg-purple-50\\/50 {
  background-color: #020617 !important; /* Slate 950 */
}
`;

if (!cssContent.includes('.dark .bg-white')) {
    cssContent = cssContent + '\n' + overrides;
    fs.writeFileSync('src/app/globals.css', cssContent, 'utf8');
    console.log("Updated globals.css");
}

// 2. Update dashboard/layout.tsx
let layoutContent = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
// Update main container
layoutContent = layoutContent.replace(/className="min-h-screen bg-slate-50/g, 'className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300');
layoutContent = layoutContent.replace(/<main className="flex-1 overflow-y-auto">/g, '<main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950">');
layoutContent = layoutContent.replace(/<main className="flex-1">/g, '<main className="flex-1 bg-slate-50 dark:bg-slate-950">');
fs.writeFileSync('src/app/dashboard/layout.tsx', layoutContent, 'utf8');
console.log("Updated layout.tsx");

// 3. Helper function for global string replacements in specific files
function applyDarkClasses(filePath) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let oldContent = content;
        
        // General background / borders
        content = content.replace(/bg-white([^A-Za-z0-9_-])/g, 'bg-white dark:bg-slate-900$1');
        content = content.replace(/bg-slate-50([^A-Za-z0-9_-])/g, 'bg-slate-50 dark:bg-slate-950$1');
        content = content.replace(/bg-gray-50([^A-Za-z0-9_-])/g, 'bg-gray-50 dark:bg-slate-950$1');
        content = content.replace(/bg-purple-50([^A-Za-z0-9_-])/g, 'bg-purple-50 dark:bg-slate-950$1');
        content = content.replace(/text-slate-900([^A-Za-z0-9_-])/g, 'text-slate-900 dark:text-slate-100$1');
        content = content.replace(/text-slate-800([^A-Za-z0-9_-])/g, 'text-slate-800 dark:text-slate-100$1');
        content = content.replace(/border-slate-200([^A-Za-z0-9_-])/g, 'border-slate-200 dark:border-slate-800$1');
        content = content.replace(/border-gray-200([^A-Za-z0-9_-])/g, 'border-gray-200 dark:border-slate-800$1');
        
        // Input fields
        content = content.replace(/<input\s+className="([^"]+)"/g, (match, classes) => {
            if (!classes.includes('dark:bg-slate-800')) {
                return `<input className="${classes} dark:bg-slate-800 dark:text-white dark:border-slate-700"`;
            }
            return match;
        });
        content = content.replace(/<select\s+className="([^"]+)"/g, (match, classes) => {
            if (!classes.includes('dark:bg-slate-800')) {
                return `<select className="${classes} dark:bg-slate-800 dark:text-white dark:border-slate-700"`;
            }
            return match;
        });
        content = content.replace(/<textarea\s+className="([^"]+)"/g, (match, classes) => {
            if (!classes.includes('dark:bg-slate-800')) {
                return `<textarea className="${classes} dark:bg-slate-800 dark:text-white dark:border-slate-700"`;
            }
            return match;
        });

        if (content !== oldContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            console.log("Updated", filePath);
        }
    }
}

const targetFiles = [
    'src/app/dashboard/settings/page.tsx',
    'src/app/dashboard/agenda/page.tsx',  // calendar
    'src/app/dashboard/messages/page.tsx',
    'src/app/dashboard/messages/MessagesClient.tsx',
    'src/app/dashboard/school/page.tsx',
    'src/app/dashboard/trash/page.tsx'
];

for (const file of targetFiles) {
    applyDarkClasses(file);
}

