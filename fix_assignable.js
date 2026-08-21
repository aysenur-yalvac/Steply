const fs = require("fs");
let content = fs.readFileSync("src/components/projects/TaskDetailModal.tsx", "utf8");

// Add assignableMembers filter after "const completedCount" line
content = content.replace(
  'const completedCount = subtasks.filter(s => s.is_completed).length;',
  `const completedCount = subtasks.filter(s => s.is_completed).length;

  // Exclude teachers from assignable list — only students and project owner can be assigned
  const assignableMembers = teamMembers.filter(
    (m) => m.role !== "teacher" && m.role !== "ogretmen"
  );`
);

// Replace teamMembers.map with assignableMembers.map in the select
content = content.replace(
  '{teamMembers.map(member => (\n                  <option key={member.id} value={member.id}>{member.full_name}</option>\n                ))}',
  `{assignableMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.full_name}{member.id === projectOwnerId ? " \u{1F451} (Proje Sahibi)" : ""}
                  </option>
                ))}`
);

fs.writeFileSync("src/components/projects/TaskDetailModal.tsx", content, "utf8");
console.log("Done: teachers excluded from assignment list");
