const fs = require("fs");

function addTab(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  const linkToAdd = `\n        <a href="/dashboard/trash/assignments" className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Odevler</a>`;
  
  if (!content.includes("/dashboard/trash/assignments")) {
    content = content.replace(
      'href="/dashboard/trash/files" className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Dosyalar</a>',
      'href="/dashboard/trash/files" className="px-4 py-2 border-b-2 border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">Dosyalar</a>' + linkToAdd
    );
    // For files page it's active
    content = content.replace(
      'href="/dashboard/trash/files" className="px-4 py-2 border-b-2 border-violet-600 text-violet-600 font-medium">Dosyalar</a>',
      'href="/dashboard/trash/files" className="px-4 py-2 border-b-2 border-violet-600 text-violet-600 font-medium">Dosyalar</a>' + linkToAdd
    );
    fs.writeFileSync(filePath, content, "utf8");
  }
}

addTab("src/app/dashboard/trash/projects/page.tsx");
addTab("src/app/dashboard/trash/files/page.tsx");
console.log("Updated tabs in projects and files pages");
