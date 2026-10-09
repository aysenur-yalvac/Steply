const fs = require('fs');
const path = require('path');
const file = path.resolve('src/lib/actions.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `  teacher?: { full_name: string | null };
}`,
  `  teacher?: { full_name: string | null };
  class_id?: string;
  class?: { name: string };
}`
);

fs.writeFileSync(file, content, 'utf8');
