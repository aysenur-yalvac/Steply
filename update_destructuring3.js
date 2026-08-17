const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');

const regex = /export default function DashboardViewSwitcher\(\{\s*projects,\s*isTeacher,\s*isStudent,\s*watchedIds,\s*projectNotes,\s*currentUserId,\s*\}\:\s*Props\)\s*\{/;
const replacement = `export default function DashboardViewSwitcher({
  projects,
  isTeacher,
  isStudent,
  watchedIds,
  projectNotes,
  currentUserId,
  collaboratorProjects = [],
}: Props) {`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', content, 'utf8');
console.log("Updated destructuring manually");
