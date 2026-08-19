const fs = require('fs');

let path1 = 'src/components/dashboard/NotificationBell.tsx';
let content1 = fs.readFileSync(path1, 'utf8');
content1 = content1.replace(/\{!n\.is_read && \(\s*\)\}/g, '');
fs.writeFileSync(path1, content1, 'utf8');

let path2 = 'src/components/projects/ProjectTabsWrapper.tsx';
let content2 = fs.readFileSync(path2, 'utf8');
content2 = content2.replace(/\{tab\.id === 'notes' && hasUnreadNotes && activeTab !== 'notes' && \(\s*\)\}/g, '');
fs.writeFileSync(path2, content2, 'utf8');

// There might be another one in KanbanBoard or ProjectTaskList
let path3 = 'src/components/dashboard/KanbanBoard.tsx';
let content3 = fs.readFileSync(path3, 'utf8');
content3 = content3.replace(/<span className=\{`flex items-center gap-1\.5 text-xs font-bold px-3 py-1 rounded-full border \$\{priorityClasses\.badge\}`\}>\s*\{priorityLabel\}\s*<\/span>/g, '<span className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1 rounded-full border ${priorityClasses.badge}`}>{priorityLabel}</span>');
fs.writeFileSync(path3, content3, 'utf8');

let path4 = 'src/components/projects/ProjectTaskList.tsx';
let content4 = fs.readFileSync(path4, 'utf8');
content4 = content4.replace(/<span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border-slate-700\/80 px-2\.5 py-1 rounded-full flex items-center gap-1\.5">\s*\{completed\}\/\{total\} done · \{progress\}%\s*<\/span>/g, '<span className="text-xs font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 dark:!bg-slate-800 dark:!text-slate-200 dark:!border dark:!border-slate-700/80 px-2.5 py-1 rounded-full flex items-center gap-1.5">{completed}/{total} done · {progress}%</span>');
fs.writeFileSync(path4, content4, 'utf8');

console.log("Fixed JSX syntax errors");
