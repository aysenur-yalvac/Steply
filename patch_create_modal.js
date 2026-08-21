const fs = require("fs");
let modal = fs.readFileSync("src/components/assignments/CreateAssignmentModal.tsx", "utf8");

modal = modal.replace(
  'className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"',
  'className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3 text-sm scheme-light dark:scheme-dark focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"'
);

// Apply it to all inputs and textareas
modal = modal.replace(
  /className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200/g,
  'className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-slate-900 dark:text-slate-200 rounded-xl px-4 py-3 text-sm scheme-light dark:scheme-dark'
);

// Fix headers and bg
modal = modal.replace(/bg-slate-900/g, 'bg-white dark:bg-slate-900');
modal = modal.replace(/text-white/g, 'text-slate-900 dark:text-white');
modal = modal.replace(/border-slate-700/g, 'border-slate-200 dark:border-slate-700');
modal = modal.replace(/border-slate-800/g, 'border-slate-200 dark:border-slate-800');
modal = modal.replace(/text-slate-300/g, 'text-slate-700 dark:text-slate-300');
modal = modal.replace(/text-slate-400/g, 'text-slate-500 dark:text-slate-400');
modal = modal.replace(/text-indigo-400/g, 'text-indigo-500 dark:text-indigo-400');

fs.writeFileSync("src/components/assignments/CreateAssignmentModal.tsx", modal, "utf8");
console.log("Updated CreateAssignmentModal.tsx for light mode");
