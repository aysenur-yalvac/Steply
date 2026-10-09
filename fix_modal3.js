const fs = require('fs');
const path = require('path');
const file = path.resolve('src/components/assignments/CreateAssignmentModal.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/const \[classId, setClassId\] = useState\(""\);\r?\n\s*const \[grade, setGrade\] = useState\("Tumu"\);\r?\n\s*const \[classId, setClassId\] = useState\(""\);/g, 'const [grade, setGrade] = useState("Tumu");\n  const [classId, setClassId] = useState("");');

fs.writeFileSync(file, content, 'utf8');
