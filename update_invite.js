const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// Update the inviteUrl variable
content = content.replace(
  /const inviteUrl = `\$\{typeof window !== "undefined" \? window\.location\.origin : ""\}\/dashboard\/projects\?join=\$\{\(project as any\)\.invite_token\}`;/g,
  `const inviteUrl = \`\${typeof window !== "undefined" ? window.location.origin : ""}/join/\${(project as any).invite_token}\`;`
);

// Update the styling of the invite code box
content = content.replace(
  /<div className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-\[0\.2em\] bg-white dark:bg-slate-900 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700">/g,
  `<div className="font-mono font-bold text-xl tracking-wider dark:text-slate-100 text-slate-800 bg-slate-100 dark:bg-slate-800/50 p-3 px-6 rounded-lg border border-slate-200 dark:border-slate-700">`
);

// Update fallback text if invite_code is missing
content = content.replace(
  /\{\(project as any\)\.invite_code \|\| '------'\}/g,
  `{(project as any).invite_code || 'TÜRETİLİYOR...'}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated ProjectEditableContent.tsx');
