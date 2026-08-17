const fs = require('fs');
let content = fs.readFileSync('src/components/projects/GitHubIntegrationCard.tsx', 'utf8');

// Replace the modal overlay and container
content = content.replace(
  '<div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">',
  '<div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-full max-w-4xl max-h-[85vh] overflow-y-auto flex flex-col">'
);

// Replace the right column styles
content = content.replace(
  '<div className="bg-slate-50 dark:bg-zinc-800/50 p-6 rounded-2xl border border-slate-100 h-full flex flex-col">',
  '<div className="bg-slate-100/80 dark:bg-zinc-800/60 border border-slate-200/60 p-5 rounded-xl h-full flex flex-col">'
);

// Right column texts
content = content.replace(
  '<h5 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">',
  '<h5 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">'
);
content = content.replace(
  '<ol className="list-decimal list-inside text-sm text-slate-600 space-y-3 mb-6 flex-1">',
  '<ol className="list-decimal list-inside text-sm text-slate-700 dark:text-zinc-300 space-y-3 mb-6 flex-1">'
);

// Yellow alert box
content = content.replace(
  '<div className="mt-auto bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-xl">',
  '<div className="mt-auto bg-amber-50 border border-amber-200 p-3 rounded-lg">'
);
content = content.replace(
  '<p className="text-sm text-amber-800 font-medium flex gap-2">',
  '<p className="text-sm text-amber-900 font-medium flex gap-2">'
);

fs.writeFileSync('src/components/projects/GitHubIntegrationCard.tsx', content, 'utf8');
console.log("Updated modal UI styling");
