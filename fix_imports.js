const fs = require('fs');
let path = 'src/components/dashboard/DashboardViewSwitcher.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /import \{ Plus, SlidersHorizontal, CheckCircle, Clock, Minus, ExternalLink, X \} from "lucide-react";/,
  `import { Plus, SlidersHorizontal, CheckCircle, Clock, Minus, ExternalLink, X, UserPlus } from "lucide-react";\nimport JoinProjectModal from './JoinProjectModal';`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed imports');
