const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

content = content.replace('className="flex-1 p-6 lg:p-8 flex flex-col gap-8"', 'className="flex-1 p-6 lg:p-8 flex flex-col gap-6"');

// Collaborative Projects section divider has `mb-6`. If `isTeacher` and `projects.length === 0`, 
// the DashboardViewSwitcher is rendered. If we also want to remove the section divider to save vertical space:
content = content.replace(/\{collaboratorProjects.length > 0 && \([\s\S]*?<div className="h-px w-full bg-slate-100 mb-6" \/>/, `{collaboratorProjects.length > 0 && (
          <div>
            {!isTeacher && <div className="h-px w-full bg-slate-100 mb-6" />}`);

fs.writeFileSync('src/app/dashboard/page.tsx', content, 'utf8');
console.log("Updated gap and padding.");
