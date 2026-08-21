const fs = require("fs");

// 1. TaskDetailModal.tsx
let taskModal = fs.readFileSync("src/components/projects/TaskDetailModal.tsx", "utf8");

// Add projectOwnerName to Props interface
taskModal = taskModal.replace(
  "  currentUserId?: string;\n  projectOwnerId?: string;\n}",
  "  currentUserId?: string;\n  projectOwnerId?: string;\n  projectOwnerName?: string | null;\n}"
);

// Add projectOwnerName to function params
taskModal = taskModal.replace(
  "  currentUserId,\n  projectOwnerId,\n}: TaskDetailModalProps) {",
  "  currentUserId,\n  projectOwnerId,\n  projectOwnerName,\n}: TaskDetailModalProps) {"
);

// Update owner creation fallback
taskModal = taskModal.replace(
  '        full_name: "Proje Sahibi",',
  '        full_name: projectOwnerName || existingOwner?.full_name || "Proje Sahibi",'
);

fs.writeFileSync("src/components/projects/TaskDetailModal.tsx", taskModal, "utf8");
console.log("Updated TaskDetailModal.tsx");

// 2. ProjectTaskList.tsx
let taskList = fs.readFileSync("src/components/projects/ProjectTaskList.tsx", "utf8");

// Add projectOwnerName to Props interface
taskList = taskList.replace(
  "  currentUserId?: string;\n  projectOwnerId?: string;\n}",
  "  currentUserId?: string;\n  projectOwnerId?: string;\n  projectOwnerName?: string | null;\n}"
);

// Add projectOwnerName to function params
taskList = taskList.replace(
  "export default function ProjectTaskList({ projectId, initialTasks, canEdit, teamMembers, currentUserId, projectOwnerId }: Props) {",
  "export default function ProjectTaskList({ projectId, initialTasks, canEdit, teamMembers, currentUserId, projectOwnerId, projectOwnerName }: Props) {"
);

// Pass projectOwnerName to TaskDetailModal
taskList = taskList.replace(
  "          currentUserId={currentUserId}\n          projectOwnerId={projectOwnerId}",
  "          currentUserId={currentUserId}\n          projectOwnerId={projectOwnerId}\n          projectOwnerName={projectOwnerName}"
);

fs.writeFileSync("src/components/projects/ProjectTaskList.tsx", taskList, "utf8");
console.log("Updated ProjectTaskList.tsx");

// 3. page.tsx
let page = fs.readFileSync("src/app/dashboard/projects/[id]/page.tsx", "utf8");

// Pass ownerName to ProjectTaskList
page = page.replace(
  "                        currentUserId={user.id}\n                        projectOwnerId={ownerUserId}\n                      />",
  "                        currentUserId={user.id}\n                        projectOwnerId={ownerUserId}\n                        projectOwnerName={ownerName}\n                      />"
);

fs.writeFileSync("src/app/dashboard/projects/[id]/page.tsx", page, "utf8");
console.log("Updated page.tsx");
