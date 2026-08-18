const fs = require('fs');

// 1. Rewrite the globals.css
let cssContent = fs.readFileSync('src/app/globals.css', 'utf8');

// Find the start of the dark body rule
const searchString = '/* Tüm Sayfa Wrapper ve Layout Gradient\'lerini Ez */';
const startIndex = cssContent.indexOf(searchString);

if (startIndex !== -1) {
    cssContent = cssContent.slice(0, startIndex);
}

const newCss = `
/* 1. En Alt Sayfa Zemi */
.dark body,
.dark .dashboard-container {
  background-color: #0b0f17 !important;
  color: #f8fafc;
}

/* 2. Sol Sidebar ve Üst Header */
.dark aside,
.dark header {
  background-color: #0f172a !important;
  border-color: #1e293b !important;
}

/* 3. Yükseltilmiş Kart Yüzeyleri (Açıkça Görünür Olmalı) */
.dark .card,
.dark [class*="bg-white"],
.dark [class*="bg-slate-50"],
.dark [class*="bg-gray-50"],
.dark [class*="bg-gray-100"] {
  background-color: #161e2e !important;
  border: 1px solid #273549 !important;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3) !important;
}

/* 4. Kart İçi Metinler */
.dark .card p, .dark .card span, .dark .card label {
  color: #cbd5e1 !important;
}
.dark .card h1, .dark .card h2, .dark .card h3, .dark .card h4 {
  color: #ffffff !important;
}

/* 5. Input ve Form Alanları */
.dark input, .dark textarea, .dark select {
  background-color: #1e293b !important;
  color: #ffffff !important;
  border-color: #334155 !important;
}
.dark input::placeholder, .dark textarea::placeholder {
  color: #94a3b8 !important;
}

/* 6. Primary / Mor Butonların Karanlık Modda Parlaması */
.dark button[class*="bg-purple"],
.dark button[class*="bg-violet"],
.dark .bg-purple-600,
.dark .bg-primary {
  background-color: #8b5cf6 !important;
  color: #ffffff !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.3) !important;
}

.dark button[class*="bg-purple"]:hover {
  background-color: #7c3aed !important;
}

/* 7. Animasyonlu Canvas / SVG Maske Parlamalarını Koyu Moda Çek */
.dark canvas,
.dark [class*="animate-bg"],
.dark [class*="mesh-gradient"] {
  opacity: 0.25 !important;
  filter: brightness(0.2) contrast(1.2) !important;
}
`;

fs.writeFileSync('src/app/globals.css', cssContent + newCss, 'utf8');
console.log("Updated globals.css with cleaned up card hierarchy");

// 2. Update layout.tsx
let layoutContent = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');
// Find the animated background wrapper
layoutContent = layoutContent.replace(
    /className="([^"]*?)absolute inset-0([^"]*)"/g,
    (match, p1, p2) => {
        // Change absolute to fixed
        let newClasses = `${p1}fixed inset-0${p2}`;
        if (!newClasses.includes('-z-10')) newClasses += ' -z-10';
        if (!newClasses.includes('pointer-events-none')) newClasses += ' pointer-events-none';
        return `className="${newClasses}"`;
    }
);

// If the animated background is not using absolute inset-0:
layoutContent = layoutContent.replace(
    /className="([^"]*?)pointer-events-none inset-0([^"]*)"/g,
    (match, p1, p2) => {
        let newClasses = `${p1}fixed inset-0 -z-10 pointer-events-none${p2}`;
        return `className="${newClasses.replace('pointer-events-none inset-0', '')}"`;
    }
);

// Ensure wrapper has relative z-10
// <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
layoutContent = layoutContent.replace(
    /<div className="min-h-screen/g,
    '<div className="relative z-10 min-h-screen'
);

fs.writeFileSync('src/app/dashboard/layout.tsx', layoutContent, 'utf8');
console.log("Updated layout.tsx z-index controls");
