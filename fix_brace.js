const fs = require('fs');

let content = fs.readFileSync('src/lib/actions.ts', 'utf8');

content = content.replace('): Promise<{ success: true; file: ProjectFile } | { error: string }> {| { error: string }> {', '): Promise<{ success: true; file: ProjectFile } | { error: string }> {');

fs.writeFileSync('src/lib/actions.ts', content, 'utf8');
console.log("Fixed duplicate brace");
