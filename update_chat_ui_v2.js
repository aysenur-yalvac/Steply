const fs = require('fs');

// 1. Update MessagesClient.tsx container
let clientContent = fs.readFileSync('src/app/dashboard/messages/MessagesClient.tsx', 'utf8');

clientContent = clientContent.replace(
  'h-[calc(100vh-100px)] w-full max-w-7xl mx-auto flex flex-col md:flex-row rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden text-slate-900 dark:text-zinc-100',
  'h-[calc(100vh-145px)] w-full max-w-7xl mx-auto flex flex-col md:flex-row rounded-2xl border border-slate-200/80 bg-white shadow-lg overflow-hidden text-slate-900'
);

clientContent = clientContent.replace(
  '<PageWrapper className="overflow-hidden">',
  '<PageWrapper className="overflow-hidden pb-0 mb-0">'
);
fs.writeFileSync('src/app/dashboard/messages/MessagesClient.tsx', clientContent, 'utf8');
console.log("Updated MessagesClient.tsx");

// 2. Update ChatWindow.tsx
let chatContent = fs.readFileSync('src/components/social/ChatWindow.tsx', 'utf8');

// Container
chatContent = chatContent.replace(
  'className="flex flex-col h-full w-full bg-white dark:bg-slate-900 overflow-hidden relative border-l border-slate-200 dark:border-zinc-800"',
  'className="flex flex-col h-full w-full bg-slate-50/70 overflow-hidden relative border-l border-slate-200/80"'
);

// Header
chatContent = chatContent.replace(
  'className="p-5 border-b border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0 z-10"',
  'className="p-5 border-b border-slate-200/80 bg-white shrink-0 z-10 shadow-sm"'
);

// Messages Area
chatContent = chatContent.replace(
  'className="flex-1 overflow-y-auto p-4 space-y-3 relative z-0 bg-slate-50/60 dark:bg-slate-900/90"',
  'className="flex-1 overflow-y-auto p-4 space-y-3 relative z-0 bg-transparent"'
);

// Bubble color
const oldBubbleClasses = `className={\`max-w-[75%] md:max-w-[70%] px-4 py-2.5 text-sm font-medium shadow-xs \${
                    isMine 
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-xs' 
                      : 'bg-slate-200/80 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-2xl rounded-tl-none'
                  }\`}`;
const newBubbleClasses = `className={\`max-w-[75%] md:max-w-[70%] px-4 py-2.5 text-sm font-medium shadow-xs \${
                    isMine 
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-none' 
                      : 'bg-white border border-slate-200/80 text-slate-800 rounded-2xl rounded-tl-none'
                  }\`}`;
chatContent = chatContent.replace(oldBubbleClasses, newBubbleClasses);

// Input Area Container
chatContent = chatContent.replace(
  'className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 relative z-20 shrink-0"',
  'className="p-3 border-t border-slate-200/80 bg-white relative z-20 shrink-0"'
);

// Input
chatContent = chatContent.replace(
  'className="flex-1 bg-slate-50 dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded-2xl px-5 py-3.5 text-sm text-slate-700 dark:text-zinc-200 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-500"',
  'className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-5 py-3.5 text-sm text-slate-800 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 transition-all placeholder:text-slate-400"'
);

fs.writeFileSync('src/components/social/ChatWindow.tsx', chatContent, 'utf8');
console.log("Updated ChatWindow.tsx");
