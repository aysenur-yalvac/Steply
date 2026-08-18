const fs = require('fs');
let globalsCss = fs.readFileSync('src/app/globals.css', 'utf8');

// Replace everything related to previous dark mode base/card colors
globalsCss = globalsCss.replace(/\/\* 1\. En Alt Sayfa[\s\S]*?(?=\n\n|\n$)/g, '');
globalsCss = globalsCss.replace(/\/\* 2\. Kartlar & Paneller[\s\S]*?(?=\n\n|\n$)/g, '');
globalsCss = globalsCss.replace(/\/\* UNIFIED DARK MODE[\s\S]*?(?=\n\n|\n$)/g, '');

const unifiedCss = `
/* UNIFIED DARK MODE */
.dark body,
.dark main,
.dark #__next,
.dark .dashboard-container,
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
  background-color: #131927 !important;
  background-image: none !important;
  backdrop-filter: none !important;
}

/* Silik, yumuşak karanlık sınırlar */
.dark [class*="bg-white"],
.dark [class*="bg-slate-50"],
.dark .card,
.dark aside,
.dark [role="dialog"],
.dark [class*="bg-slate-900"],
.dark [class*="bg-[#0f172a]"] {
  border: 1px solid rgba(30, 41, 59, 0.6) !important; /* border-slate-800/60 */
}

/* inputs / textareas */
.dark input,
.dark textarea,
.dark select {
  background-color: #0f172a !important; /* Slightly darker input fields inside the unified #131927 background */
  border: 1px solid rgba(30, 41, 59, 0.6) !important;
  color: #f1f5f9 !important;
}

.dark input:focus,
.dark textarea:focus,
.dark select:focus {
  border-color: rgba(168, 85, 247, 0.8) !important; /* focus:border-purple-500 */
}
`;

fs.writeFileSync('src/app/globals.css', globalsCss + '\n' + unifiedCss, 'utf8');

// Update DashboardBackground.tsx
let dashboardBg = fs.readFileSync('src/components/dashboard/DashboardBackground.tsx', 'utf8');
dashboardBg = dashboardBg.replace(/dark:bg-\[#0f172a\]/g, 'dark:bg-[#131927]');
dashboardBg = dashboardBg.replace(/dark:bg-\[#0d111a\]/g, 'dark:bg-[#131927]');
fs.writeFileSync('src/components/dashboard/DashboardBackground.tsx', dashboardBg, 'utf8');

console.log("Unified dark mode applied with #131927");
