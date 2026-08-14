const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

content = content.replace('const isTeacherOnly = item.teacherOnly;', 'const isTeacherOnly = (item as any).teacherOnly;');
content = content.replace('const isStudentOnly = item.studentOnly;', 'const isStudentOnly = (item as any).studentOnly;');
content = content.replace('const isWatchlist = item.isWatchlist;', 'const isWatchlist = (item as any).isWatchlist;');

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Fixed TypeScript errors');
