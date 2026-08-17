const fs = require('fs');
let content = fs.readFileSync('src/components/projects/ProjectEditableContent.tsx', 'utf8');

content = content.replace(', LogOut, AlertTriangle} from "lucide-react";', '} from "lucide-react";\nimport { LogOut, AlertTriangle } from "lucide-react";');

fs.writeFileSync('src/components/projects/ProjectEditableContent.tsx', content, 'utf8');
