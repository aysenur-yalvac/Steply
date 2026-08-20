const fs = require('fs');
let path = 'src/components/projects/ProjectTaskList.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  "interface Props {\r\n  projectId: string;\r\n  initialTasks: ProjectTask[];\r\n  canEdit: boolean;\r\n}",
  "interface Props {\n  projectId: string;\n  initialTasks: ProjectTask[];\n  canEdit: boolean;\n  teamMembers: TeamMember[];\n}"
);

// also fallback with \n instead of \r\n
content = content.replace(
  "interface Props {\n  projectId: string;\n  initialTasks: ProjectTask[];\n  canEdit: boolean;\n}",
  "interface Props {\n  projectId: string;\n  initialTasks: ProjectTask[];\n  canEdit: boolean;\n  teamMembers: TeamMember[];\n}"
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed Props in ProjectTaskList 4');
