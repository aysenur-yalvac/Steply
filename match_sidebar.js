const fs = require('fs');

// 1. Update globals.css
let globalsCss = fs.readFileSync('src/app/globals.css', 'utf8');

// Update base background
globalsCss = globalsCss.replace(/background-color: #0b0f17 !important;/g, 'background-color: #0d111a !important;');

// Update card background
globalsCss = globalsCss.replace(
    /background-color: rgba\(15, 23, 42, 0\.4\) !important; \/\* slate-900\/40 \*\//g,
    'background-color: rgba(19, 25, 39, 0.6) !important; /* #131927/60 */'
);
// In case the old 0.6 rule was still there somehow
globalsCss = globalsCss.replace(
    /background-color: rgba\(15, 23, 42, 0\.6\) !important; \/\* slate-900\/60 \*\//g,
    'background-color: rgba(19, 25, 39, 0.6) !important; /* #131927/60 */'
);

// Update shadow and transition
globalsCss = globalsCss.replace(
    /box-shadow: 0 10px 30px rgba\(0,0,0,0\.5\) !important;/g,
    'box-shadow: 0 12px 32px rgba(0,0,0,0.6) !important;'
);

// Update hover border color
globalsCss = globalsCss.replace(
    /border-color: rgba\(168, 85, 247, 0\.3\) !important; \/\* purple-500\/30 \*\//g,
    'border-color: rgba(168, 85, 247, 0.4) !important; /* purple-500/40 */'
);

fs.writeFileSync('src/app/globals.css', globalsCss, 'utf8');

// 2. Update DashboardBackground.tsx
let dashboardBg = fs.readFileSync('src/components/dashboard/DashboardBackground.tsx', 'utf8');

// Update container base color
dashboardBg = dashboardBg.replace(/dark:bg-\[#0b0f17\]/g, 'dark:bg-[#0d111a]');

// Restore the opacity and mix blend if user wanted it to be "yumuşak" (soft), but user also said "animasyon katmanında (hidden dark:block) ... yumuşak koyu indigo sarmalları (#1e1b4b/40) akmasını sağla"
// Let's use opacity-60 and mix-blend-screen with those exact colors
dashboardBg = dashboardBg.replace(
    /className="absolute inset-0 hidden dark:block opacity-100 pointer-events-none"/,
    'className="absolute inset-0 hidden dark:block opacity-60 mix-blend-screen pointer-events-none"'
);

// Gradient 1
dashboardBg = dashboardBg.replace(
    /style=\{\{ background: 'radial-gradient\(circle at 40% 40%, #1e1b4b 0%, #0f172a 45%, transparent 70%\)' \}\}/,
    "style={{ background: 'radial-gradient(circle at 40% 40%, rgba(30,27,75,0.4) 0%, #0f172a 45%, transparent 70%)' }}"
);
// Gradient 2
dashboardBg = dashboardBg.replace(
    /style=\{\{ background: 'radial-gradient\(circle at 60% 60%, #0f172a 0%, #0b0f17 50%, transparent 70%\)' \}\}/,
    "style={{ background: 'radial-gradient(circle at 60% 60%, #0f172a 0%, #0d111a 50%, transparent 70%)' }}"
);

fs.writeFileSync('src/components/dashboard/DashboardBackground.tsx', dashboardBg, 'utf8');

console.log("Updated styles to match sidebar #0d111a");
