const fs = require('fs');
let content = fs.readFileSync('src/components/projects/GitHubIntegrationCard.tsx', 'utf8');

content = content.replace(
  'className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"',
  'className="w-full px-4 py-2.5 rounded-xl border text-slate-900 placeholder:text-slate-400 bg-white border-slate-300 dark:text-slate-100 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"'
);

fs.writeFileSync('src/components/projects/GitHubIntegrationCard.tsx', content, 'utf8');
console.log("Replaced class in GitHubIntegrationCard.tsx");
