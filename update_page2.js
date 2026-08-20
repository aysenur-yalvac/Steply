const fs = require('fs');
let path = 'src/app/dashboard/projects/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<ProjectTaskList\s+projectId=\{project\.id\}\s+initialTasks=\{projectTasks\}\s+canEdit=\{isTeamMember\}\s+\/>/,
  `<ProjectTaskList\n                      projectId={project.id}\n                      initialTasks={projectTasks}\n                      canEdit={isTeamMember}\n                      teamMembers={teamMembers}\n                    />`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated page.tsx to pass teamMembers');
