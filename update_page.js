const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

const regex = /milestonesContent=\{\s*isTeamMember \? \([\s\S]*?\) : \([\s\S]*?\)\s*\}/;

const newContent = `milestonesContent={
                isTeamMember ? (
                  <ProjectTaskList
                    projectId={project.id}
                    initialTasks={projectTasks}
                    canEdit={isTeamMember}
                    isCollaborator={isCollaborator}
                  />
                ) : null
              }`;

content = content.replace(regex, newContent);
fs.writeFileSync('src/app/dashboard/projects/[id]/page.tsx', content, 'utf8');

console.log("Updated milestonesContent in page.tsx");
