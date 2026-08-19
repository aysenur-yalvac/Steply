const fs = require('fs');

// 1. Project Status Card in page.tsx
let pagePath = 'src/app/dashboard/projects/[id]/page.tsx';
if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    content = content.replace(/className="rounded-3xl p-6 md:p-8 shadow-sm" style=\{\{ background: 'rgba\(255,255,255,0\.40\)', backdropFilter: 'blur\(12px\)', WebkitBackdropFilter: 'blur\(12px\)', border: '1px solid rgba\(255,255,255,0\.55\)' \}\}/g, 'className="bg-white dark:bg-[#1a2234] dark:border dark:border-slate-700/60 dark:shadow-[0_12px_30px_rgba(0,0,0,0.7)] border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm"');
    
    // Check if project-detail-view exists
    if (!content.includes('project-detail-view')) {
        content = content.replace(/className="w-full max-w-6xl mx-auto"/, 'className="w-full max-w-6xl mx-auto project-detail-view"');
    }
    fs.writeFileSync(pagePath, content, 'utf8');
}

// 2. About Project Card in ProjectEditableContent.tsx (fix the typo and ensure it's exact)
let aboutPath = 'src/components/projects/ProjectEditableContent.tsx';
if (fs.existsSync(aboutPath)) {
    let content = fs.readFileSync(aboutPath, 'utf8');
    content = content.replace(/className="bg-white dark:bg-\[#1a2234\] dark:border dark:border-slate-700\/60 dark:shadow-\[0_12px_30px_rgba\(0,0,0,0\.7\)\][^"]*"/, 'className="bg-white dark:bg-[#1a2234] dark:border dark:border-slate-700/60 dark:shadow-[0_12px_30px_rgba(0,0,0,0.7)] border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm"');
    fs.writeFileSync(aboutPath, content, 'utf8');
}

// 3. GitHubIntegrationCard.tsx
let githubPath = 'src/components/projects/GitHubIntegrationCard.tsx';
if (fs.existsSync(githubPath)) {
    let content = fs.readFileSync(githubPath, 'utf8');
    // For GitHubIntegrationCard, we need to replace the container
    content = content.replace(/className="([^"]*)bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800([^"]*)"/g, (match, g1, g2) => {
        return `className="${g1}bg-white dark:bg-[#1a2234] dark:border dark:border-slate-700/60 dark:shadow-[0_12px_30px_rgba(0,0,0,0.7)] border border-slate-200${g2}"`;
    });
    fs.writeFileSync(githubPath, content, 'utf8');
}

// 4. Universal badges via globals.css
let cssPath = 'src/app/globals.css';
let cssContent = fs.readFileSync(cssPath, 'utf8');
const cssRule = `
/* Universal Project Detail Badges */
.dark .project-detail-view [class*="bg-violet-50"],
.dark .project-detail-view [class*="bg-blue-50"],
.dark .project-detail-view [class*="bg-amber-50"],
.dark .project-detail-view [class*="bg-emerald-50"],
.dark .project-detail-view [class*="bg-slate-100"],
.dark .project-detail-view [class*="bg-orange-50"],
.dark .project-detail-view [class*="bg-red-50"],
.dark .project-detail-view [class*="bg-rose-50"],
.dark .project-detail-view [class*="bg-teal-50"],
.dark .project-detail-view [class*="bg-sky-50"],
.dark .project-detail-view [class*="bg-indigo-50"],
.dark .project-detail-view [class*="bg-violet-100"],
.dark .project-detail-view [class*="bg-blue-100"],
.dark .project-detail-view [class*="bg-emerald-100"],
.dark .project-detail-view [class*="bg-[#7C3AFF]/10"] {
    background-color: #1e293b !important;
    color: #e2e8f0 !important;
    border: 1px solid rgba(51, 65, 85, 0.8) !important;
}
`;
if (!cssContent.includes('Universal Project Detail Badges')) {
    cssContent += '\n' + cssRule;
    fs.writeFileSync(cssPath, cssContent, 'utf8');
}

console.log("Successfully fixed layouts.");
