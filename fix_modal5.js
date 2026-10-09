const fs = require('fs');
const path = require('path');
const file = path.resolve('src/components/assignments/CreateAssignmentModal.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(`course_name: courseName,\n      class_id: classId || null,\n      due_date: isoDate,\n      grade: grade,\n      class_id: classId || null,`, `course_name: courseName,\n      due_date: isoDate,\n      grade: grade,\n      class_id: classId || null,`);

fs.writeFileSync(file, content, 'utf8');
