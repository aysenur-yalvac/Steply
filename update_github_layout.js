const fs = require('fs');

let pageContent = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

// Remove GitHubIntegrationCard from Right Sidebar
const githubCardTag = `            <GitHubIntegrationCard projectId={projectId} repo={repo} commits={commits} isTeamMember={isTeamMember} />\n          </div>\n        </div>`;
const newLayout = `          </div>\n        </div>\n\n        <div className="w-full col-span-full">\n          <GitHubIntegrationCard projectId={projectId} repo={repo} commits={commits} isTeamMember={isTeamMember} />\n        </div>`;

pageContent = pageContent.replace(githubCardTag, newLayout);
fs.writeFileSync('src/app/dashboard/projects/[id]/page.tsx', pageContent, 'utf8');

console.log("Moved GitHubIntegrationCard outside of the right sidebar");

// Now update GitHubIntegrationCard.tsx styles
let cardContent = fs.readFileSync('src/components/projects/GitHubIntegrationCard.tsx', 'utf8');

// 1. max-h-[360px] h-[360px] flex flex-col overflow-hidden on the main container
// The main container starts with:
// <div className="rounded-3xl p-6 md:p-8 shadow-sm mb-6 relative" style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.55)' }}>
cardContent = cardContent.replace(
  `className="rounded-3xl p-6 md:p-8 shadow-sm mb-6 relative"`,
  `className="rounded-3xl p-6 md:p-8 shadow-sm mb-6 relative w-full col-span-full max-h-[360px] h-[360px] flex flex-col overflow-hidden"`
);

// 2. Header: flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800
// Old header:
// <div className="flex justify-between items-center mb-6">
cardContent = cardContent.replace(
  `className="flex justify-between items-center mb-6"`,
  `className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-zinc-800 mb-4 shrink-0"`
);

// 3. Inner container for commits: flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar
// Old inner container:
// <div className="relative border-l-2 border-indigo-100 ml-3 space-y-6">
cardContent = cardContent.replace(
  `className="relative border-l-2 border-indigo-100 ml-3 space-y-6"`,
  `className="relative border-l-2 border-indigo-100 ml-3 flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar"`
);

// 4. Commit card styles: bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50 rounded-xl p-3
// Old commit item:
// <div key={commit.id} className="relative pl-6">
cardContent = cardContent.replace(
  /<div key=\{commit\.id\} className="relative pl-6">/g,
  `<div key={commit.id} className="relative pl-6 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50 rounded-xl p-3">`
);

fs.writeFileSync('src/components/projects/GitHubIntegrationCard.tsx', cardContent, 'utf8');
console.log("Updated GitHubIntegrationCard styles");

