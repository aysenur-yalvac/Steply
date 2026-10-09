const fs = require('fs');
const path = require('path');
const file = path.resolve('src/lib/actions.ts');
let content = fs.readFileSync(file, 'utf8');

// Add class_id to type definition if it exists, or just to createAssignmentAction payload
content = content.replace(
  `export async function createAssignmentAction(formData: {
  title: string;
  description?: string;
  course_name?: string;
  grade?: string;
  due_date: string;
}) {`,
  `export async function createAssignmentAction(formData: {
  title: string;
  description?: string;
  course_name?: string;
  grade?: string;
  due_date: string;
  class_id?: string | null;
}) {`
);

content = content.replace(
  `          {
          title: formData.title,
          description: formData.description,
          course_name: formData.course_name || 'Genel',
          grade: formData.grade || 'Tumu',
          due_date: formData.due_date,
          teacher_id: user.id
        }`,
  `          {
          title: formData.title,
          description: formData.description,
          course_name: formData.course_name || 'Genel',
          grade: formData.grade || 'Tumu',
          due_date: formData.due_date,
          teacher_id: user.id,
          class_id: formData.class_id || null
        }`
);

fs.writeFileSync(file, content, 'utf8');
