const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');

const regex = /interface Props \{[\s\S]*?\}/;
const replacement = `interface Props {
  projects: Project[];
  isTeacher: boolean;
  isStudent: boolean;
  watchedIds: Set<string>;
  projectNotes: Record<string, { content: string; teacherName?: string }>;
  currentUserId?: string;
  collaboratorProjects?: any[];
}`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', content, 'utf8');
console.log("Re-updated interface Props");
