const fs = require('fs');
let path = 'src/components/projects/ProjectTaskList.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/Project Milestones/g, 'Proje Görevleri');
content = content.replace(/No milestones yet\./g, 'Henüz görev yok.');
content = content.replace(/Add a new milestone\.\.\./g, 'Yeni görev ekle...');

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed ProjectTaskList texts');
