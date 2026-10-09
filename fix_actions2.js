const fs = require('fs');
const path = require('path');
const file = path.resolve('src/lib/actions.ts');
let content = fs.readFileSync(file, 'utf8');

// Use regex that ignores whitespace differences
content = content.replace(
  /export async function createAssignmentAction\(formData: \{\s*title: string;\s*description\?: string;\s*course_name\?: string;\s*grade\?: string;\s*due_date: string;\s*\}\)/,
  `export async function createAssignmentAction(formData: {
  title: string;
  description?: string;
  course_name?: string;
  grade?: string;
  due_date: string;
  class_id?: string | null;
})`
);

content = content.replace(
  /teacher_id: user\.id\s*\}/,
  `teacher_id: user.id,
          class_id: formData.class_id || null
        }`
);

fs.writeFileSync(file, content, 'utf8');
