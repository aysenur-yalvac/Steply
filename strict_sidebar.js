const fs = require('fs');

// 1. DashboardBackground.tsx
let dashboardBg = fs.readFileSync('src/components/dashboard/DashboardBackground.tsx', 'utf8');

// Change base color
dashboardBg = dashboardBg.replace(/dark:bg-\[#0d111a\]/g, 'dark:bg-[#0f172a]');
dashboardBg = dashboardBg.replace(/dark:bg-\[#0b0f17\]/g, 'dark:bg-[#0f172a]');

// Remove all dark mode blobs to prevent any grey wash/opacity issues
dashboardBg = dashboardBg.replace(
    /\{\/\* DARK MODE BLOBS \*\/\}[\s\S]*?<\/div>/,
    '{/* DARK MODE BLOBS (REMOVED to ensure exact solid #0f172a match with sidebar) */}'
);

fs.writeFileSync('src/components/dashboard/DashboardBackground.tsx', dashboardBg, 'utf8');

// 2. globals.css
let globalsCss = fs.readFileSync('src/app/globals.css', 'utf8');

// Update base backgrounds
globalsCss = globalsCss.replace(/background-color: #0b0f17 !important;/g, 'background-color: #0f172a !important;');
globalsCss = globalsCss.replace(/background-color: #0d111a !important;/g, 'background-color: #0f172a !important;');

fs.writeFileSync('src/app/globals.css', globalsCss, 'utf8');

// 3. Let's make sure no dashboard wrapper adds a wash
let layoutContent = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
// Some layouts might have dark:bg-slate-950 or something
layoutContent = layoutContent.replace(/dark:bg-slate-950/g, 'dark:bg-transparent');
layoutContent = layoutContent.replace(/dark:bg-\[#[a-zA-Z0-9]+\]/g, 'dark:bg-transparent');
fs.writeFileSync('src/app/dashboard/layout.tsx', layoutContent, 'utf8');

console.log("Strict matching to #0f172a applied");
