const fs = require("fs");

function removeTabs(filePath) {
  let content = fs.readFileSync(filePath, "utf8");
  
  // They usually have <div className="flex border-b border-slate-200 dark:border-slate-800">
  // We can just use a regex to strip out that entire div and its links.
  // Or since we just want to remove the wrapper <div className="space-y-6"> and the tabs div
  
  // For assignments page:
  content = content.replace(
    /<div className="flex border-b border-slate-200 dark:border-slate-800">[\s\S]*?<\/div>\s*<TrashAssignmentListClient/g,
    '<TrashAssignmentListClient'
  );
  content = content.replace(
    /<div className="flex border-b border-slate-200 dark:border-slate-800">[\s\S]*?<\/div>\s*<TrashProjectsClient/g,
    '<TrashProjectsClient'
  );
  content = content.replace(
    /<div className="flex border-b border-slate-200 dark:border-slate-800">[\s\S]*?<\/div>\s*<TrashFilesClient/g,
    '<TrashFilesClient'
  );
  
  // Some might not have space-y-6 now since they just return the client.
  // We can leave space-y-6 wrapper if it's there.
  
  fs.writeFileSync(filePath, content, "utf8");
}

removeTabs("src/app/dashboard/trash/projects/page.tsx");
removeTabs("src/app/dashboard/trash/files/page.tsx");
removeTabs("src/app/dashboard/trash/assignments/page.tsx");
console.log("Removed hardcoded tabs from pages");
