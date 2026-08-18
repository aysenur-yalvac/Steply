const fs = require('fs');

let dashboardBg = fs.readFileSync('src/components/dashboard/DashboardBackground.tsx', 'utf8');

// The dark blobs currently use opacity-40 mix-blend-screen. Let's make them vibrant again!
// And use exactly the requested colors
dashboardBg = dashboardBg.replace(
    /className="absolute inset-0 hidden dark:block opacity-40 mix-blend-screen pointer-events-none"/,
    'className="absolute inset-0 hidden dark:block opacity-100 pointer-events-none"'
);

// We'll also ensure the radial gradients match the rich indigo palette perfectly
dashboardBg = dashboardBg.replace(
    /style=\{\{ background: 'radial-gradient\(circle at 40% 40%, #1e1b4b 0%, #2e1065 45%, transparent 70%\)' \}\}/,
    "style={{ background: 'radial-gradient(circle at 40% 40%, #1e1b4b 0%, #0f172a 45%, transparent 70%)' }}"
);
dashboardBg = dashboardBg.replace(
    /style=\{\{ background: 'radial-gradient\(circle at 60% 60%, #0f172a 0%, #0b0f17 50%, transparent 70%\)' \}\}/,
    "style={{ background: 'radial-gradient(circle at 60% 60%, #0f172a 0%, #0b0f17 50%, transparent 70%)' }}"
);

fs.writeFileSync('src/components/dashboard/DashboardBackground.tsx', dashboardBg, 'utf8');

// Ensure globals.css has the exact deep navy base
let globalsCss = fs.readFileSync('src/app/globals.css', 'utf8');
if (!globalsCss.includes('background-color: #0b0f17 !important;')) {
    globalsCss = globalsCss.replace(/background-color: #[a-f0-9]+ !important;/g, 'background-color: #0b0f17 !important;');
    fs.writeFileSync('src/app/globals.css', globalsCss, 'utf8');
}

console.log("Restored vibrant indigo background");
