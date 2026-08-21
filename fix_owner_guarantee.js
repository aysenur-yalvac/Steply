const fs = require("fs");
let content = fs.readFileSync("src/components/projects/TaskDetailModal.tsx", "utf8");

// Replace the simple filter with the guaranteed-owner logic
content = content.replace(
  `  // Exclude teachers from assignable list — only students and project owner can be assigned
  const assignableMembers = teamMembers.filter(
    (m) => m.role !== "teacher" && m.role !== "ogretmen"
  );`,
  `  // Exclude teachers from assignable list — only students and project owner can be assigned
  let assignableMembers = teamMembers.filter(
    (m) => m.role !== "teacher" && m.role !== "ogretmen"
  );

  // Guarantee the project owner is always in the list even if not in teamMembers
  if (projectOwnerId) {
    const isOwnerInList = assignableMembers.some((m) => m.id === projectOwnerId);
    if (!isOwnerInList) {
      const existingOwner = teamMembers.find((m) => m.id === projectOwnerId);
      const ownerMember: TeamMember = existingOwner ?? {
        id: projectOwnerId,
        full_name: "Proje Sahibi",
        avatar_url: null,
        role: "owner",
      };
      assignableMembers = [ownerMember, ...assignableMembers];
    }
  }`
);

fs.writeFileSync("src/components/projects/TaskDetailModal.tsx", content, "utf8");
console.log("Fixed: project owner always present in assignable members list");
