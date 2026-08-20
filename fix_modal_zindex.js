const fs = require('fs');
let path = 'src/components/projects/TaskDetailModal.tsx';
let content = fs.readFileSync(path, 'utf8');

// The wrapper currently is:
/*
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
*/

content = content.replace(
  /if \(\!isOpen\) return null;/,
  `if (!isOpen || !task) return null;`
);

content = content.replace(
  /<div className="fixed inset-0 z-50 flex items-center justify-center bg-black\/50 backdrop-blur-sm p-4">/,
  `<div \n      className="fixed inset-0 z-[999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 overflow-y-auto"\n      onClick={onClose}\n    >`
);

content = content.replace(
  /<div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-\[90vh\]">/,
  `<div \n        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative z-10 my-auto flex flex-col max-h-[90vh] overflow-hidden"\n        onClick={(e) => e.stopPropagation()}\n      >`
);

// We need to keep the content inside the inner div but let's adjust inner padding since we added p-6.
// Actually, `p-6 overflow-hidden` + inner `p-5 overflow-y-auto`. Let's just remove the inner `p-5 overflow-y-auto` from the inner children if necessary, or just keep it. It's fine.

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed TaskDetailModal.tsx');
