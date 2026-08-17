const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', 'utf8');

const regex = /interface Props \{[\s\S]*?currentUserId\?: string;\s*\}/;
const replacement = `interface Props {
  projects: Project[];
  isTeacher: boolean;
  isStudent: boolean;
  watchedIds: Set<string>;
  projectNotes: Record<string, { content: string; teacherName?: string }>;
  currentUserId?: string;
  collaboratorProjects?: any[];
}`;

// There's a duplicate `}>; currentUserId?: string; }` at line 413 based on error
content = content.replace(/collaboratorProjects\?: any\[\];\n\}\>;\n  currentUserId\?: string;\n\}/g, '');

fs.writeFileSync('src/components/dashboard/DashboardViewSwitcher.tsx', content, 'utf8');
console.log("Fixed interface Props");
