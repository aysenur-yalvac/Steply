const fs = require('fs');
const path = require('path');
const file = path.resolve('src/components/assignments/CreateAssignmentModal.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/class_id: classId \|\| null,\r?\n\s*class_id: classId \|\| null,/g, 'class_id: classId || null,');

fs.writeFileSync(file, content, 'utf8');
