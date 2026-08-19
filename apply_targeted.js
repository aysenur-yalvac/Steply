const fs = require('fs');

// 1. GitHub Card
let ghPath = 'src/components/projects/GitHubIntegrationCard.tsx';
if (fs.existsSync(ghPath)) {
    let content = fs.readFileSync(ghPath, 'utf8');
    // Replace: bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800
    content = content.replace(/bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/g, 'bg-white dark:bg-[#1a2234] dark:border dark:border-slate-700/60 dark:shadow-[0_12px_30px_rgba(0,0,0,0.7)]');
    fs.writeFileSync(ghPath, content, 'utf8');
}

// 2. Project Status / Milestones (ProjectEditableContent)
let contentPath = 'src/components/projects/ProjectEditableContent.tsx';
if (fs.existsSync(contentPath)) {
    let content = fs.readFileSync(contentPath, 'utf8');
    // Find the main card container: className="rounded-3xl p-6 shadow-sm lg:col-span-2 bg-white ... "
    content = content.replace(/className="([^"]*)bg-white([^"]*)"/g, (match, g1, g2) => {
        // Look for typical card containers like rounded-3xl p-6 shadow-sm
        if (g1.includes('rounded-3xl') || g2.includes('rounded-3xl')) {
            let s = match.replace(/dark:[a-z0-9/\[\]#-]+\s?/g, '');
            return s.replace('bg-white', 'bg-white dark:bg-[#1a2234] dark:border dark:border-slate-700/60 dark:shadow-[0_12px_30px_rgba(0,0,0,0.7)]');
        }
        return match;
    });
    fs.writeFileSync(contentPath, content, 'utf8');
}

// 3. Universal Badges strictly via CSS in Project Details View
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

// Inject .project-detail-view class to the project detail page wrapper
let layoutPath = 'src/app/dashboard/projects/[id]/page.tsx';
if (fs.existsSync(layoutPath)) {
    let layoutContent = fs.readFileSync(layoutPath, 'utf8');
    if (!layoutContent.includes('project-detail-view')) {
        layoutContent = layoutContent.replace(/className="w-full max-w-6xl mx-auto"/, 'className="w-full max-w-6xl mx-auto project-detail-view"');
        fs.writeFileSync(layoutPath, layoutContent, 'utf8');
    }
}
console.log("Done applying targeted fixes.");
