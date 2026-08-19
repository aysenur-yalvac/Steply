const fs = require('fs');
let file = 'src/components/projects/ProjectTaskList.tsx';
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/><span className="w-2 h-2 rounded-full bg-emerald-500"><\/span>>/g, '><span className="w-2 h-2 rounded-full bg-emerald-500"></span>');
fs.writeFileSync(file, content, 'utf8');
console.log("Fixed syntax error");
