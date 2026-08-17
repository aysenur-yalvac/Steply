const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

if (!content.includes('Lock,')) {
    content = content.replace(/import \{([^}]+)\} from "lucide-react";/, (match, p1) => {
        return `import {${p1}, Lock} from "lucide-react";`;
    });
    fs.writeFileSync('src/app/dashboard/projects/[id]/page.tsx', content, 'utf8');
}

