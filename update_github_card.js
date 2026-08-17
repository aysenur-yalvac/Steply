const fs = require('fs');
let cardContent = fs.readFileSync('src/components/projects/GitHubIntegrationCard.tsx', 'utf8');

// Fix commit card markup to properly separate the timeline wrapper and the card content
const oldCommit = `              <div key={commit.id} className="relative pl-6 bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50 rounded-xl p-3">
                <span className="absolute -left-[11px] top-1 w-5 h-5 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center overflow-hidden">
                  {commit.author_avatar ? (
                    <img src={commit.author_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Github className="w-3 h-3 text-indigo-400" />
                  )}
                </span>
                <div className="flex flex-col">`;
                
const newCommit = `              <div key={commit.id} className="relative pl-8">
                <span className="absolute -left-[11px] top-3 w-5 h-5 rounded-full bg-white border-2 border-indigo-200 flex items-center justify-center overflow-hidden z-10">
                  {commit.author_avatar ? (
                    <img src={commit.author_avatar} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Github className="w-3 h-3 text-indigo-400" />
                  )}
                </span>
                <div className="flex flex-col bg-slate-50 dark:bg-zinc-800/50 border border-slate-200/60 dark:border-zinc-700/50 rounded-xl p-3 shadow-sm">`;

cardContent = cardContent.replace(oldCommit, newCommit);
fs.writeFileSync('src/components/projects/GitHubIntegrationCard.tsx', cardContent, 'utf8');
