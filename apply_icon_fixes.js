const fs = require('fs');

// 1. Update SectionHeader in page.tsx
let pagePath = 'src/app/dashboard/school/page.tsx';
if (fs.existsSync(pagePath)) {
    let content = fs.readFileSync(pagePath, 'utf8');
    
    // Rewrite SectionHeader to use the requested classes for the icon container
    content = content.replace(
        /<div className=\{`p-1\.5 rounded-lg border \$\{iconBg\} \$\{iconBorder\}`\}>\s*<span className=\{iconColor\}>\{icon\}<\/span>\s*<\/div>/g,
        `<div className={\`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center dark:bg-slate-800 dark:border dark:border-slate-700/80 shrink-0 \${iconBg} \${iconBorder}\`}>\n        <span className={iconColor}>{icon}</span>\n      </div>`
    );
    
    // Fix iconColor passing in page.tsx: remove the dark:bg and dark:border from iconColor because they are now on the div
    content = content.replace(
        /iconColor="text-blue-600 dark:bg-slate-800 dark:border dark:border-slate-700\/80 dark:text-slate-200"/g,
        'iconColor="text-blue-600 dark:text-slate-200"'
    );
    // Let's also ensure the icon itself is exactly what they want: "İçindeki Lucide ikonunun boyutunu w-4 h-4 veya w-5 h-5 olarak sabitle"
    content = content.replace(/<UserCheck className="w-6 h-6 text-slate-300" \/>/g, '<UserCheck className="w-5 h-5 text-slate-300" />');
    
    fs.writeFileSync(pagePath, content, 'utf8');
}

// 2. Update SchoolStudentPanel.tsx icon container
let panelPath = 'src/components/school/SchoolStudentPanel.tsx';
if (fs.existsSync(panelPath)) {
    let content = fs.readFileSync(panelPath, 'utf8');
    
    content = content.replace(
        /<div className="p-1\.5 rounded-lg border bg-violet-50 border-violet-200">\s*<GraduationCap className="w-4 h-4 text-violet-600" \/>\s*<\/div>/g,
        `<div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center bg-violet-50 border-violet-200 dark:bg-slate-800 dark:border dark:border-slate-700/80 shrink-0">\n            <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5 text-violet-600 dark:text-slate-200" />\n          </div>`
    );
    
    fs.writeFileSync(panelPath, content, 'utf8');
}

console.log("Updated header icons");
