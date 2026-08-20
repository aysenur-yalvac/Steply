const fs = require('fs');
let path = 'src/components/projects/ProjectAnalyticsView.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /import \{ ProjectTask, TeamMember \} from '@\/lib\/actions';/,
  `import { ProjectTask } from '@/lib/actions';\n\nexport type TeamMember = { id: string; full_name: string; avatar_url: string | null; role?: string | null };`
);

content = content.replace(
  /member\.name/g,
  `member.full_name`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed TeamMember in ProjectAnalyticsView');
