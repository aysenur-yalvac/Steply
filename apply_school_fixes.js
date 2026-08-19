const fs = require('fs');

function replaceFileContent(filePath, replacer) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        let newContent = replacer(content);
        if (content !== newContent) {
            fs.writeFileSync(filePath, newContent, 'utf8');
            console.log("Updated: " + filePath);
        }
    }
}

// 1. SchoolStudentPanel.tsx
replaceFileContent('src/components/school/SchoolStudentPanel.tsx', content => {
    // Remove the s.grade span
    content = content.replace(/\{s\.role !== 'teacher' && s\.grade && \(\s*<span className="inline-block mt-1 text-xs font-semibold px-2 py-0\.5 rounded-full bg-violet-50 text-violet-600 border border-violet-100">\s*\{s\.grade\}\s*<\/span>\s*\)\}/, '');
    
    // Update the counter bubble
    content = content.replace(
        /<span\s*className="text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center"\s*style=\{\{ background: '#EDE9FE', color: '#7C3AED' \}\}\s*>/g,
        '<span className="text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center bg-[#EDE9FE] text-[#7C3AED] dark:!bg-slate-800 dark:!text-slate-100 dark:!border dark:!border-slate-700/80">'
    );
    
    return content;
});

// 2. TeacherGrid.tsx
// wait, TeacherGrid doesn't have a grade badge or a counter. The counters are only in SchoolStudentPanel and page.tsx

// 3. page.tsx
replaceFileContent('src/app/dashboard/school/page.tsx', content => {
    // Update SectionHeader
    content = content.replace(
        /<span\s*className="text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center"\s*style=\{\{ background: countBg, color: countColor \}\}\s*>/g,
        '<span className="text-xs font-extrabold w-6 h-6 rounded-full flex items-center justify-center dark:!bg-slate-800 dark:!text-slate-100 dark:!border dark:!border-slate-700/80" style={{ background: countBg, color: countColor }}>'
    );
    return content;
});

console.log("School fixes applied");
