const fs = require('fs');

// 1. Update MessagesClient.tsx container
let clientContent = fs.readFileSync('src/app/dashboard/messages/MessagesClient.tsx', 'utf8');
clientContent = clientContent.replace(
  'h-[calc(100vh-120px)] w-full max-w-7xl mx-auto flex flex-col md:flex-row rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden text-slate-900 dark:text-zinc-100',
  'h-[calc(100vh-100px)] w-full max-w-7xl mx-auto flex flex-col md:flex-row rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-lg overflow-hidden text-slate-900 dark:text-zinc-100'
);
// Make sure the main page wrapper doesn't have internal scrolling or issues
clientContent = clientContent.replace('<PageWrapper>', '<PageWrapper className="overflow-hidden">');
fs.writeFileSync('src/app/dashboard/messages/MessagesClient.tsx', clientContent, 'utf8');
console.log("Updated MessagesClient");

// 2. Update ChatWindow.tsx
let chatContent = fs.readFileSync('src/components/social/ChatWindow.tsx', 'utf8');

// Replace scrollIntoView with scrollTop
const scrollFunc = `  const scrollToBottom = () => {
    if (messagesEndRef.current && messagesEndRef.current.parentElement) {
      const container = messagesEndRef.current.parentElement;
      container.scrollTop = container.scrollHeight;
    }
  };`;
chatContent = chatContent.replace(/  const scrollToBottom = \(\) => \{\s*messagesEndRef\.current\?\.scrollIntoView\(\{ behavior: "smooth" \}\);\s*\};/, scrollFunc);

// Soften backgrounds
chatContent = chatContent.replace(
  'className="flex flex-col h-full w-full bg-white dark:bg-zinc-900 overflow-hidden relative border-l border-slate-200 dark:border-zinc-800"',
  'className="flex flex-col h-full w-full bg-white dark:bg-slate-900 overflow-hidden relative border-l border-slate-200 dark:border-zinc-800"'
);
chatContent = chatContent.replace(
  'className="flex-1 overflow-y-auto p-4 space-y-3 relative z-0 bg-slate-50/60 dark:bg-zinc-950/40"',
  'className="flex-1 overflow-y-auto p-4 space-y-3 relative z-0 bg-slate-50/60 dark:bg-slate-900/90"'
);

// Bubble color
const oldBubbleClasses = `className={\`max-w-[75%] md:max-w-[70%] px-4 py-2.5 text-sm shadow-xs \${
                    isMine 
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-xs' 
                      : 'bg-slate-200/70 dark:bg-zinc-800 text-slate-800 dark:text-zinc-100 rounded-2xl rounded-tl-xs'
                  }\`}`;
const newBubbleClasses = `className={\`max-w-[75%] md:max-w-[70%] px-4 py-2.5 text-sm font-medium shadow-xs \${
                    isMine 
                      ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-xs' 
                      : 'bg-slate-200/80 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 rounded-2xl rounded-tl-none'
                  }\`}`;
chatContent = chatContent.replace(oldBubbleClasses, newBubbleClasses);

// Input Area Container
chatContent = chatContent.replace(
  'className="p-4 sm:p-5 border-t border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 relative z-20 shrink-0"',
  'className="p-3 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 relative z-20 shrink-0"'
);

fs.writeFileSync('src/components/social/ChatWindow.tsx', chatContent, 'utf8');
console.log("Updated ChatWindow");
