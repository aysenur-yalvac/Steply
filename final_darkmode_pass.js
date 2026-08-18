const fs = require('fs');

// 1. Update globals.css
let cssContent = fs.readFileSync('src/app/globals.css', 'utf8');

// Find where the previous dark body starts and replace it
const searchString = '.dark body,';
const startIndex = cssContent.indexOf(searchString);
if (startIndex !== -1) {
    cssContent = cssContent.slice(0, startIndex);
}

const newCss = `
/* Tüm Sayfa Wrapper ve Layout Gradient'lerini Ez */
.dark body,
.dark main,
.dark #__next,
.dark [class*="bg-gradient"],
.dark [class*="from-purple"],
.dark [class*="via-white"] {
  background-image: none !important;
  background-color: #0b0f17 !important; /* Derin Koyu Zemin */
  color: #f8fafc !important;
}

/* Sidebar ve Header Koyu Zemin Bütünlüğü */
.dark aside,
.dark header {
  background-color: #0f172a !important;
  border-color: #1e293b !important;
}

/* Genel Metin Renk Zorlaması */
.dark p, 
.dark span, 
.dark label, 
.dark small, 
.dark time,
.dark .text-gray-500,
.dark .text-slate-500,
.dark .text-gray-600,
.dark .text-slate-600 {
  color: #cbd5e1 !important; /* Açık Gri / Görünür Metin */
}

/* Başlıklar ve Vurgulu Metinler */
.dark h1, .dark h2, .dark h3, .dark h4, .dark h5, .dark h6,
.dark th, .dark .text-gray-900, .dark .text-slate-900, .dark .text-slate-800, .dark .text-slate-700 {
  color: #ffffff !important;
}

/* Input Placeholder ve Form Metinleri */
.dark input, .dark textarea, .dark select {
  background-color: #1e293b !important;
  color: #ffffff !important;
  border-color: #334155 !important;
}
.dark input::placeholder, .dark textarea::placeholder {
  color: #94a3b8 !important;
}

/* Kartlar ve Paneller */
.dark .bg-white,
.dark [class*="bg-slate-50"],
.dark [class*="bg-gray-50"],
.dark [class*="bg-purple-50"] {
  background-color: #161e2e !important;
  border-color: #273549 !important;
}

/* Primary / Mor Butonların Karanlık Modda Parlaması */
.dark button[class*="bg-purple"],
.dark button[class*="bg-violet"],
.dark .bg-purple-600,
.dark .bg-primary {
  background-color: #8b5cf6 !important;
  color: #ffffff !important;
  box-shadow: 0 0 12px rgba(139, 92, 246, 0.3);
}

.dark button[class*="bg-purple"]:hover {
  background-color: #7c3aed !important;
}
`;
fs.writeFileSync('src/app/globals.css', cssContent + newCss, 'utf8');
console.log("Updated globals.css");

// 2. We will run a script to add dark: counterparts to components 
// just to be absolutely safe (sometimes !important in CSS overrides correctly, but Tailwind classes are safer too).
const path = require('path');
function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

function applyDarkClasses(filePath) {
    if (filePath.endsWith('.tsx') && fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let oldContent = content;
        
        // Add dark classes for texts
        content = content.replace(/text-gray-900([^A-Za-z0-9_-])/g, (match, p1) => {
            if(!match.includes('dark:')) return `text-gray-900 dark:text-slate-100${p1}`;
            return match;
        });
        content = content.replace(/text-slate-800([^A-Za-z0-9_-])/g, (match, p1) => {
            if(!match.includes('dark:')) return `text-slate-800 dark:text-slate-200${p1}`;
            return match;
        });
        content = content.replace(/text-slate-900([^A-Za-z0-9_-])/g, (match, p1) => {
            if(!match.includes('dark:')) return `text-slate-900 dark:text-slate-100${p1}`;
            return match;
        });
        content = content.replace(/text-gray-500([^A-Za-z0-9_-])/g, (match, p1) => {
            if(!match.includes('dark:')) return `text-gray-500 dark:text-slate-400${p1}`;
            return match;
        });
        content = content.replace(/text-slate-500([^A-Za-z0-9_-])/g, (match, p1) => {
            if(!match.includes('dark:')) return `text-slate-500 dark:text-slate-400${p1}`;
            return match;
        });
        content = content.replace(/text-slate-600([^A-Za-z0-9_-])/g, (match, p1) => {
            if(!match.includes('dark:')) return `text-slate-600 dark:text-slate-300${p1}`;
            return match;
        });
        
        // Add dark classes for backgrounds if they missed
        content = content.replace(/bg-purple-50([^A-Za-z0-9_-])/g, (match, p1) => {
            if(!match.includes('dark:')) return `bg-purple-50 dark:bg-slate-900${p1}`;
            return match;
        });
        
        content = content.replace(/bg-gray-50([^A-Za-z0-9_-])/g, (match, p1) => {
            if(!match.includes('dark:')) return `bg-gray-50 dark:bg-slate-900${p1}`;
            return match;
        });

        // Add dark classes for gradients just in case
        content = content.replace(/bg-gradient-to-[a-z]+([^"]+)/g, (match, p1) => {
            if(!match.includes('dark:')) return `${match} dark:bg-none`;
            return match;
        });

        if (content !== oldContent) {
            fs.writeFileSync(filePath, content, 'utf8');
        }
    }
}

const targetDirs = ['src/app/dashboard', 'src/components'];
targetDirs.forEach(dir => {
    if (fs.existsSync(dir)) walkDir(dir, applyDarkClasses);
});
console.log("Updated components for dark mode text contrast.");
