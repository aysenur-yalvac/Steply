const fs = require("fs");

// 1. ProjectTaskList.tsx — add projectOwnerId prop and pass to TaskDetailModal
let tasklist = fs.readFileSync("src/components/projects/ProjectTaskList.tsx", "utf8");

// Add projectOwnerId to Props interface
tasklist = tasklist.replace(
  "  currentUserId?: string;\n}",
  "  currentUserId?: string;\n  projectOwnerId?: string;\n}"
);

// Add projectOwnerId to function params
tasklist = tasklist.replace(
  "export default function ProjectTaskList({ projectId, initialTasks, canEdit, teamMembers, currentUserId }: Props)",
  "export default function ProjectTaskList({ projectId, initialTasks, canEdit, teamMembers, currentUserId, projectOwnerId }: Props)"
);

// Add projectOwnerId + currentUserId to TaskDetailModal usage
tasklist = tasklist.replace(
  "          onUpdate={(updatedTask) => {\n            handleUpdateTask(updatedTask);\n            setSelectedTask(null);\n          }}",
  "          currentUserId={currentUserId}\n          projectOwnerId={projectOwnerId}\n          onUpdate={(updatedTask) => {\n            handleUpdateTask(updatedTask);\n            setSelectedTask(null);\n          }}"
);

fs.writeFileSync("src/components/projects/ProjectTaskList.tsx", tasklist, "utf8");
console.log("Updated ProjectTaskList.tsx with projectOwnerId prop");

// 2. page.tsx — add projectOwnerId to ProjectTaskList
let page = fs.readFileSync("src/app/dashboard/projects/[id]/page.tsx", "utf8");

page = page.replace(
  "                        currentUserId={user.id}\n                      />",
  "                        currentUserId={user.id}\n                        projectOwnerId={ownerUserId}\n                      />"
);

fs.writeFileSync("src/app/dashboard/projects/[id]/page.tsx", page, "utf8");
console.log("Updated page.tsx with projectOwnerId");
