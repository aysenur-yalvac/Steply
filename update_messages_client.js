const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/messages/MessagesClient.tsx', 'utf8');

const oldContainer = `      <div className="flex-1 flex flex-col md:flex-row h-[80vh] min-h-[700px] w-[95vw] md:max-w-6xl mx-auto border border-slate-200/80 rounded-3xl overflow-hidden bg-white shadow-xl text-slate-900">`;
const newContainer = `      <div className="h-[calc(100vh-120px)] w-full max-w-7xl mx-auto flex flex-col md:flex-row rounded-2xl border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden text-slate-900 dark:text-zinc-100">`;

content = content.replace(oldContainer, newContainer);
fs.writeFileSync('src/app/dashboard/messages/MessagesClient.tsx', content, 'utf8');
console.log("Updated MessagesClient container");
