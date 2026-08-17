const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

content = content.replace('canEdit={isTeamMember}\r\n                    isCollaborator={isCollaborator}', 'canEdit={isTeamMember}');
content = content.replace('canEdit={isTeamMember}\n                    isCollaborator={isCollaborator}', 'canEdit={isTeamMember}');

fs.writeFileSync('src/app/dashboard/projects/[id]/page.tsx', content, 'utf8');
