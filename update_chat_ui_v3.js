const fs = require('fs');

// 1. Update MessagesClient.tsx container
let clientContent = fs.readFileSync('src/app/dashboard/messages/MessagesClient.tsx', 'utf8');

// The active/unactive item classes
const oldSelected = `\${selectedUser?.id === conv.other_user.id ? 'bg-dusty-rose/10 border border-dusty-rose/20 shadow-sm' : 'hover:bg-slate-100/50 border border-transparent'}`;
const newSelected = `\${selectedUser?.id === conv.other_user.id ? 'bg-violet-50 dark:bg-zinc-800/80 border-l-4 border-l-indigo-600 text-indigo-950 dark:text-white font-medium shadow-sm' : 'hover:bg-slate-50 dark:hover:bg-zinc-900/50 border-l-4 border-transparent transition-colors'}`;
clientContent = clientContent.replace(oldSelected, newSelected);

fs.writeFileSync('src/app/dashboard/messages/MessagesClient.tsx', clientContent, 'utf8');
console.log("Updated MessagesClient.tsx");

// 2. Update ChatWindow.tsx
let chatContent = fs.readFileSync('src/components/social/ChatWindow.tsx', 'utf8');

// Messages Area (Chat Container Background)
chatContent = chatContent.replace(
  'className="flex-1 overflow-y-auto p-4 space-y-3 relative z-0 bg-transparent"',
  'className="flex-1 overflow-y-auto p-4 space-y-3 relative z-0 bg-[#f8f9fe] dark:bg-zinc-950/60"'
);

// Bubble colors
const oldBubbleClasses = `className={\`max-w-[75%] md:max-w-[70%] px-4 py-2.5 text-sm font-medium shadow-xs \${
                    isMine 
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' 
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-2xl rounded-tl-none'
                  }\`}`;
const newBubbleClasses = `className={\`max-w-[75%] md:max-w-[70%] \${
                    isMine 
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-2.5 text-sm shadow-xs font-medium' 
                      : 'bg-violet-100/60 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 border border-violet-200/40 dark:border-zinc-700/50 rounded-2xl rounded-tl-none px-4 py-2.5 text-sm shadow-[0_1px_2px_rgba(0,0,0,0.04)]'
                  }\`}`;
chatContent = chatContent.replace(oldBubbleClasses, newBubbleClasses);

// Header
chatContent = chatContent.replace(
  'className="p-5 border-b border-slate-200/80 bg-white shrink-0 z-10 shadow-sm"',
  'className="p-5 border-b border-violet-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 shrink-0 z-10 shadow-sm"'
);

// Input Area Container
chatContent = chatContent.replace(
  'className="p-3 border-t border-slate-200/80 bg-white relative z-20 shrink-0"',
  'className="p-3 border-t border-violet-100 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 relative z-20 shrink-0"'
);

// Input Area
chatContent = chatContent.replace(
  'className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"',
  'className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-3.5 text-sm text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"'
);

fs.writeFileSync('src/components/social/ChatWindow.tsx', chatContent, 'utf8');
console.log("Updated ChatWindow.tsx");
