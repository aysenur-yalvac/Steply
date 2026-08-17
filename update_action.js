const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/actions.ts', 'utf8');

const oldCheck = `if (project.student_id !== user.id) return { error: "Only the project owner can remove members." };`;

const newCheck = `const isOwner = project.student_id === user.id;
  const isSelfLeaving = userId === user.id;

  if (!isOwner && !isSelfLeaving) {
    return { error: "Only the project owner can remove members." };
  }`;

content = content.replace(oldCheck, newCheck);
fs.writeFileSync('src/app/dashboard/actions.ts', content, 'utf8');

console.log("Updated removeProjectMemberAction in actions.ts");
