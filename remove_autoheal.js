const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// Remove useEffect import
content = content.replace(/, useEffect \} from "react";/, `} from "react";`);

// Remove generateProjectInviteAction import
content = content.replace(/, generateProjectInviteAction \} from "@\/app\/dashboard\/actions";/, ` } from "@/app/dashboard/actions";`);

// Remove inviteData state and useEffect
content = content.replace(
  /const \[inviteData, setInviteData\].*?\}, \[isOwner, project\.id, inviteData\.code, inviteData\.token\]\);/s,
  ``
);

// Replace inviteData.token with project.invite_token
content = content.replace(/inviteData\.token/g, `project.invite_token`);
// Replace inviteData.code with project.invite_code
content = content.replace(/inviteData\.code/g, `project.invite_code`);

// Fix the styling of the code box
content = content.replace(
  /<div className="font-mono font-bold text-xl tracking-wider dark:text-slate-100 text-slate-800 bg-slate-100 dark:bg-slate-800\/50 p-3 px-6 rounded-lg border border-slate-200 dark:border-slate-700">\s*\{\(project as any\)\.invite_code \|\| 'TÜRETİLİYOR\.\.\.'\}\s*<\/div>/g,
  `<div className="font-mono font-bold text-xl tracking-wider text-slate-100 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                        {project.invite_code || "KOD BULUNAMADI"}
                      </div>`
);
content = content.replace(
  /<div className="font-mono font-bold text-xl tracking-wider dark:text-slate-100 text-slate-800 bg-slate-100 dark:bg-slate-800\/50 p-3 px-6 rounded-lg border border-slate-200 dark:border-slate-700">\s*\{project\.invite_code \|\| 'TÜRETİLİYOR\.\.\.'\}\s*<\/div>/g,
  `<div className="font-mono font-bold text-xl tracking-wider text-slate-100 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                        {project.invite_code || "KOD BULUNAMADI"}
                      </div>`
);

// Fix input field value
content = content.replace(
  /value=\{project\.invite_token \? `\$\{typeof window !== "undefined" \? window\.location\.origin : ""\}\/join\/\$\{project\.invite_token\}` : "TÜRETİLİYOR\.\.\."\}/g,
  `value={\`\${typeof window !== "undefined" ? window.location.origin : ""}/join/\${project.invite_token}\`}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Removed auto-healing fallback mechanism');
