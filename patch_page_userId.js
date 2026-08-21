const fs = require("fs");
let content = fs.readFileSync("src/app/dashboard/projects/[id]/page.tsx", "utf8");

// Add currentUserId prop to ProjectTaskList
content = content.replace(
  /<ProjectTaskList\s+projectId=\{project\.id\}\s+initialTasks=\{projectTasks\}\s+canEdit=\{isTeamMember\}\s+teamMembers=\{teamMembers\}\s+\/>/,
  `<ProjectTaskList\n                        projectId={project.id}\n                        initialTasks={projectTasks}\n                        canEdit={isTeamMember}\n                        teamMembers={teamMembers}\n                        currentUserId={user.id}\n                      />`
);

fs.writeFileSync("src/app/dashboard/projects/[id]/page.tsx", content, "utf8");
console.log("Added currentUserId to ProjectTaskList in page.tsx");
