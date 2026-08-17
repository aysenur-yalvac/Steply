const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');

content = content.replace(
  /export default function DashboardViewSwitcher\(\{[\s\S]*?currentUserId,\n\}\: Props\)/,
  `export default function DashboardViewSwitcher({
  projects,
  isTeacher,
  isStudent,
  watchedIds,
  projectNotes,
  currentUserId,
  collaboratorProjects = [],
}: Props)`
);

fs.writeFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', content, 'utf8');
console.log("Updated destructuring to include collaboratorProjects");
