const fs = require("fs");
let taskModal = fs.readFileSync("src/components/projects/TaskDetailModal.tsx", "utf8");

// Remove crown and project owner text
taskModal = taskModal.replace(
  '{member.full_name}{member.id === projectOwnerId ? " 👑 (Proje Sahibi)" : ""}',
  '{member.full_name || (member as any).email}'
);

fs.writeFileSync("src/components/projects/TaskDetailModal.tsx", taskModal, "utf8");
console.log("Removed crown icon");
