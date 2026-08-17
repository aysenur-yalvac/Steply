const fs = require('fs');
let content = fs.readFileSync('src/components/social/ChatWindow.tsx', 'utf8');

// Container
content = content.replace(
  'className="flex flex-col h-full w-full !bg-white backdrop-blur-2xl rounded-r-3xl overflow-hidden relative border-l border-slate-200 !text-slate-900"',
  'className="flex flex-col h-full w-full bg-white dark:bg-zinc-900 overflow-hidden relative border-l border-slate-200 dark:border-zinc-800"'
);

// Header
content = content.replace(
  'className="p-5 border-b border-slate-100 !bg-white shrink-0 z-10 shadow-sm"',
  'className="p-5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 z-10"'
);
content = content.replace(
  'className="text-xl font-bold tracking-tight !text-slate-900"',
  'className="text-xl font-bold tracking-tight text-slate-900 dark:text-white"'
);

// Messages Area
content = content.replace(
  'className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative z-0 !bg-[#f8fafc]"',
  'className="flex-1 overflow-y-auto p-4 space-y-3 relative z-0 bg-slate-50/60 dark:bg-zinc-950/40"'
);

// Bubbles
const oldBubbleClasses = `className={\`max-w-[75%] md:max-w-[70%] px-5 py-3 shadow-sm \${
                    isMine 
                      ? 'bg-gradient-to-br from-soft-lavender to-violet-400 text-white rounded-2xl rounded-tr-md shadow-[0_4px_10px_-2px_rgba(167,139,250,0.3)] border border-violet-200/50' 
                      : 'bg-white text-slate-700 rounded-2xl rounded-tl-md border border-slate-200 shadow-sm'
                  }\`}`;
const newBubbleClasses = `className={\`max-w-[75%] md:max-w-[70%] px-4 py-2.5 text-sm shadow-xs \${
                    isMine 
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-xs' 
                      : 'bg-slate-200/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-2xl rounded-tl-xs'
                  }\`}`;
content = content.replace(oldBubbleClasses, newBubbleClasses);

// Input Area Container
content = content.replace(
  'className="p-4 sm:p-5 border-t border-slate-100 bg-white/80 backdrop-blur-xl relative z-20 shrink-0"',
  'className="p-4 sm:p-5 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 relative z-20 shrink-0"'
);

// Input 
const oldInput = `className="flex-1 bg-slate-50/50 focus:bg-white border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-700 focus:outline-none focus:border-dusty-rose/40 focus:ring-4 focus:ring-dusty-rose/5 transition-all placeholder:text-slate-400 shadow-inner"`;
const newInput = `className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-3.5 text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"`;
content = content.replace(oldInput, newInput);

fs.writeFileSync('src/components/social/ChatWindow.tsx', content, 'utf8');
console.log("Updated ChatWindow.tsx");
