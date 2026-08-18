const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// Update global.css first
let cssContent = fs.readFileSync('src/app/globals.css', 'utf8');
const searchString = '.dark body,';
const startIndex = cssContent.indexOf(searchString);
if (startIndex !== -1) {
    cssContent = cssContent.slice(0, startIndex);
}

const newCss = `
/* Karanlık Modda Sayfa ve Metin Kontrast Garantisi */
.dark body,
.dark main,
.dark #__next,
.dark .dashboard-container {
  background-color: #0b0f17 !important; /* Derin Gece Mavis/Siyah Arka Plan */
  color: #f8fafc !important; /* Parlak Beyaz Ana Metin */
}

/* Sidebar ve Header Arka Plan Bütünlüğü */
.dark aside,
.dark header,
.dark .sidebar-bg {
  background-color: #0f172a !important; /* Slate 900 */
  border-color: #1e293b !important;
}

/* Kartlar ve Paneller */
.dark .bg-white,
.dark [class*="bg-slate-50"],
.dark [class*="bg-gray-50"],
.dark [class*="bg-purple-50"] {
  background-color: #161e2e !important; /* Yükseltilmiş Koyu Kart Yüzeyi */
  border-color: #273549 !important;
}

/* OKUNABİLİRLİK: Tüm Metin Renklerini Aç */
.dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6,
.dark p, .dark span, .dark label, .dark td, .dark th, .dark div {
  color: #f1f5f9; /* Metinleri görünür açık gri/beyaz yap */
}

/* İkincil / Muted Metinler */
.dark .text-slate-500,
.dark .text-gray-500,
.dark .text-muted-foreground {
  color: #94a3b8 !important; /* Yumuşak Açık Gri */
}

/* INPUT VE FORM ALANLARI */
.dark input,
.dark select,
.dark textarea {
  background-color: #1e293b !important;
  color: #ffffff !important;
  border-color: #334155 !important;
}
.dark input::placeholder,
.dark textarea::placeholder {
  color: #64748b !important;
}

/* Primary / Mor Butonların Karanlık Modda Parlaması */
.dark button[class*="bg-purple"],
.dark button[class*="bg-violet"],
.dark .bg-purple-600,
.dark .bg-primary {
  background-color: #8b5cf6 !important; /* Canlı Mor */
  color: #ffffff !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.3); /* Şık Mor Işıma */
}

.dark button[class*="bg-purple"]:hover {
  background-color: #7c3aed !important;
}
`;
fs.writeFileSync('src/app/globals.css', cssContent + newCss, 'utf8');
console.log("Updated globals.css");

// Update DashboardSidebar.tsx
let sidebarContent = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// 1. Sidebar background: Add dark:bg-[#0f172a] to the outer container.
// The outer aside might be: <aside className="... bg-white dark:bg-slate-900"
sidebarContent = sidebarContent.replace(
    /<aside([^>]*)className="([^"]+)"/g, 
    (match, p1, classes) => {
        if (!classes.includes('dark:bg-[#0f172a]')) {
            // Replace existing dark background classes or just append
            let newClasses = classes.replace(/dark:bg-[a-zA-Z0-9_-]+/g, '');
            return `<aside${p1}className="${newClasses} dark:bg-[#0f172a]"`;
        }
        return match;
    }
);
sidebarContent = sidebarContent.replace(
    /<div([^>]*)className="([^"]*)fixed inset-y-0 left-0 z-40([^"]*)"/g,
    (match, p1, p2, p3) => {
        let classes = `${p2}fixed inset-y-0 left-0 z-40${p3}`;
        if (!classes.includes('dark:bg-[#0f172a]')) {
            let newClasses = classes.replace(/dark:bg-[a-zA-Z0-9_-]+/g, '');
            return `<div${p1}className="${newClasses} dark:bg-[#0f172a]"`;
        }
        return match;
    }
);

// 2. NavItem texts
// Find the dynamic class for text color in map or links
// Active: text-purple-600 or similar
// Passive: text-slate-500 or similar
sidebarContent = sidebarContent.replace(/text-slate-600 dark:text-slate-100/g, 'text-slate-600 dark:text-slate-300');
sidebarContent = sidebarContent.replace(/text-slate-500 dark:text-slate-100/g, 'text-slate-500 dark:text-slate-300');
sidebarContent = sidebarContent.replace(/text-purple-600 dark:text-slate-100/g, 'text-purple-600 dark:text-purple-400 font-bold');
sidebarContent = sidebarContent.replace(/text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100/g, 'text-slate-400 dark:text-slate-300 hover:text-slate-900 dark:text-slate-100');
sidebarContent = sidebarContent.replace(/isActive\s*\?\s*"text-purple-600/g, 'isActive ? "text-purple-600 dark:text-purple-400 font-bold');
sidebarContent = sidebarContent.replace(/"text-slate-500 hover:text-slate-900 hover:bg-slate-50"/g, '"text-slate-500 dark:text-slate-400 hover:text-slate-900 hover:bg-slate-50"');

// If there are any custom ternary conditions for classes like:
// const activeClass = isActive ? "..." : "...";
sidebarContent = sidebarContent.replace(
    /className=\{\`\s*\$\{([^}]+)\}\s*(.*?)\s*\`\}/g,
    (match, cond, rest) => {
        // Just brute force replacing text colors in the file is safer
        return match;
    }
);

// Let's do string replacement for the isActive class logic
sidebarContent = sidebarContent.replace(
    /isActive\s*\?\s*"bg-purple-50 text-purple-600 dark:bg-slate-950 dark:text-slate-100"\s*:\s*"text-slate-600 dark:text-slate-100/g,
    'isActive ? "bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 font-bold" : "text-slate-600 dark:text-slate-400'
);

sidebarContent = sidebarContent.replace(
    /isActive\s*\n\s*\?\s*"bg-purple-50 text-purple-600"\s*\n\s*:\s*"text-slate-600/g,
    'isActive ? "bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 font-bold" : "text-slate-600 dark:text-slate-400'
);

sidebarContent = sidebarContent.replace(
    /isActive\s*\?\s*`bg-purple-50 text-purple-600([^`]*)`\s*:\s*`text-slate-600([^`]*)`/g,
    'isActive ? `bg-purple-50 text-purple-600 dark:bg-purple-900/40 dark:text-purple-400 font-bold$1` : `text-slate-600 dark:text-slate-400$2`'
);


fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', sidebarContent, 'utf8');
console.log("Updated DashboardSidebar.tsx");

