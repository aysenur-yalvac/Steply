const fs = require('fs');

// 2. Update ChatWindow.tsx
let chatContent = fs.readFileSync('src/components/social/ChatWindow.tsx', 'utf8');

// Messages Area (Chat Container Background)
chatContent = chatContent.replace(
  'className="flex-1 overflow-y-auto p-4 space-y-3 relative z-0 bg-[#f8f9fe] dark:bg-zinc-950/60"',
  'className="flex-1 overflow-y-auto p-4 space-y-3 relative z-0 bg-slate-50 dark:bg-zinc-950"'
);

// Bubble colors
const oldBubbleClasses = `className={\`max-w-[75%] md:max-w-[70%] \${
                    isMine 
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 text-sm shadow-xs font-medium' 
                      : 'bg-violet-100/60 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-violet-200/40 dark:border-zinc-700/50 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                  }\`}`;
const newBubbleClasses = `className={\`max-w-[75%] md:max-w-[70%] \${
                    isMine 
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 text-sm shadow-xs font-medium' 
                      : 'bg-white dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-slate-200/80 dark:border-zinc-700/60 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm shadow-2xs'
                  }\`}`;
chatContent = chatContent.replace(oldBubbleClasses, newBubbleClasses);

// Header
chatContent = chatContent.replace(
  'className="p-5 border-b border-violet-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shrink-0 z-10 shadow-sm"',
  'className="p-5 border-b border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 z-10 shadow-sm"'
);

// Input Area Container
chatContent = chatContent.replace(
  'className="p-3 border-t border-violet-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 relative z-20 shrink-0"',
  'className="p-3 border-t border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 relative z-20 shrink-0"'
);

fs.writeFileSync('src/components/social/ChatWindow.tsx', chatContent, 'utf8');
console.log("Updated ChatWindow.tsx");
