const fs = require('fs');

// 1. Add to globals.css
let cssContent = fs.readFileSync('src/app/globals.css', 'utf8');

const newOverrides = `
/* Dış Animasyonlu Arka Plan Kapsayıcı Sıfırlaması */
.dark body > div,
.dark #__next > div,
.dark [class*="min-h-screen"] {
  background-color: #0b0f17 !important;
}

/* Animasyonlu Canvas / SVG Maske Parlamalarını Koyu Moda Çek */
.dark canvas,
.dark [class*="animate-bg"],
.dark [class*="mesh-gradient"] {
  opacity: 0.25 !important;
  filter: brightness(0.2) contrast(1.2) !important;
}
`;

if (!cssContent.includes('/* Dış Animasyonlu Arka Plan Kapsayıcı Sıfırlaması */')) {
    fs.writeFileSync('src/app/globals.css', cssContent + '\n' + newOverrides, 'utf8');
    console.log("Updated globals.css with canvas overrides.");
}

// 2. Search for AnimatedBackground or Canvas in layout or ui folders
function findAndFixBackground() {
    let layoutContent = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
    // If it has bg-gradient...
    layoutContent = layoutContent.replace(/bg-gradient-to-[a-z]+([^"]+)/g, (match, p1) => {
        if(!match.includes('dark:from-')) {
            return `${match} dark:from-[#0b0f17] dark:via-[#0f172a] dark:to-[#020617]`;
        }
        return match;
    });
    fs.writeFileSync('src/app/dashboard/layout.tsx', layoutContent, 'utf8');
    console.log("Updated layout.tsx gradient classes (if any).");
}

findAndFixBackground();
