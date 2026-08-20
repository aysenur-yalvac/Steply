const fs = require('fs');
let path = 'src/lib/actions.ts';
let content = fs.readFileSync(path, 'utf8');

const regex1 = /export type ProjectTask = \{\r\n\s*id: string;\r\n\s*project_id: string;\r\n\s*title: string;\r\n\s*is_completed: boolean;\r\n\s*created_at: string;\r\n\s*\};/;
const regex2 = /export type ProjectTask = \{\n\s*id: string;\n\s*project_id: string;\n\s*title: string;\n\s*is_completed: boolean;\n\s*created_at: string;\n\s*\};/;

const replaceWith = `export interface SubTask {\n  id: string;\n  title: string;\n  is_completed: boolean;\n}\n\nexport type ProjectTask = {\n  id: string;\n  project_id: string;\n  title: string;\n  description?: string;\n  is_completed: boolean;\n  due_date?: string | null;\n  assigned_to?: string | null;\n  subtasks?: SubTask[];\n  created_at: string;\n};`;

content = content.replace(regex1, replaceWith).replace(regex2, replaceWith);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed ProjectTask in actions.ts');
