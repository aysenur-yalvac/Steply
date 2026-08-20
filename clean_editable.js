const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove Kod tab button
content = content.replace(
  /<button type="button" onClick=\{\(\) => setInviteTab\('code'\)\} className=\{`flex-1 py-1\.5 text-xs font-bold rounded-lg transition-all \$\{inviteTab === 'code' \? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'\}`\}>Kod<\/button>/,
  ''
);

// Remove Kod tab content
content = content.replace(
  /\{inviteTab === 'code' && \([\s\S]*?<\/div>\s*\)\}/,
  ''
);

fs.writeFileSync(path, content, 'utf8');
console.log('Cleaned ProjectEditableContent');
