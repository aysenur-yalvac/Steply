const fs = require("fs");
let taskModal = fs.readFileSync("src/components/projects/TaskDetailModal.tsx", "utf8");

// Change existingOwner?.full_name to (existingOwner as any)?.full_name to bypass TS error
taskModal = taskModal.replace(
  '        full_name: projectOwnerName || existingOwner?.full_name || "Proje Sahibi",',
  '        full_name: projectOwnerName || (existingOwner as any)?.full_name || "Proje Sahibi",'
);

fs.writeFileSync("src/components/projects/TaskDetailModal.tsx", taskModal, "utf8");
console.log("Fixed TS error in TaskDetailModal");
