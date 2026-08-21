const fs = require("fs");
let actions = fs.readFileSync("src/lib/actions.ts", "utf8");

// Update interface
actions = actions.replace(
  'teacher_id: string;',
  'teacher_id: string;\n  course_name: string;'
);

// Update createAssignmentAction signature
actions = actions.replace(
  'export async function createAssignmentAction(\n  title: string,\n  description: string,\n  due_date: string\n)',
  'export async function createAssignmentAction(\n  title: string,\n  description: string,\n  due_date: string,\n  course_name: string\n)'
);

// Update create insert payload
actions = actions.replace(
  'due_date,\n      teacher_id: user.id',
  'due_date,\n      course_name,\n      teacher_id: user.id'
);

// Update updateAssignmentAction signature
actions = actions.replace(
  'export async function updateAssignmentAction(\n  id: string,\n  title: string,\n  description: string,\n  due_date: string\n)',
  'export async function updateAssignmentAction(\n  id: string,\n  title: string,\n  description: string,\n  due_date: string,\n  course_name: string\n)'
);

// Update update payload
actions = actions.replace(
  '.update({ title, description, due_date })',
  '.update({ title, description, due_date, course_name })'
);

fs.writeFileSync("src/lib/actions.ts", actions, "utf8");
console.log("Updated actions.ts for course_name");
