const fs = require('fs');

let path = 'src/app/dashboard/projects/new/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Outer Wrapper
content = content.replace(
    /<div className="min-h-screen w-full bg-\[#f8fafc\] p-6 sm:p-10 flex flex-col items-center justify-center">/,
    '<div className="min-h-screen w-full bg-[#f8fafc] dark:bg-[#0b0f17] p-6 sm:p-10 flex flex-col items-center justify-center">'
);

// Form Card
content = content.replace(
    /<div className="bg-white dark:bg-\[#0f172a\].*?relative z-10">/,
    '<div className="bg-white dark:bg-[#1a2234] dark:border dark:border-slate-800 shadow-xl text-slate-900 dark:text-slate-100 rounded-[2rem] p-8 sm:p-10 w-full relative z-10">'
);

// Info Box
content = content.replace(
    /<div className="flex items-start gap-3 px-4 py-3\.5 rounded-2xl bg-indigo-50 border border-indigo-100">/,
    '<div className="flex items-start gap-3 px-4 py-3.5 rounded-2xl bg-indigo-50 border border-indigo-100 dark:bg-slate-800/80 dark:text-slate-300 dark:border dark:border-slate-700/70">'
);
content = content.replace(
    /<p className="text-sm text-indigo-600 leading-snug">/,
    '<p className="text-sm text-indigo-600 dark:text-slate-300 leading-snug">'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated new project page");
