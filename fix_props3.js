const fs = require('fs');
let path = 'src/components/projects/ProjectTaskList.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /interface Props \{\n\s*projectId: string;\n\s*initialTasks: ProjectTask\[\];\n\s*canEdit: boolean;\n\s*\}/,
  `interface Props {\n  projectId: string;\n  initialTasks: ProjectTask[];\n  canEdit: boolean;\n  teamMembers: TeamMember[];\n}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed Props in ProjectTaskList');
