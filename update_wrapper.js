const fs = require('fs');
let path = 'src/components/projects/ProjectTabsWrapper.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(/import ProjectAnalytics from '@\/components\/projects\/ProjectAnalytics';\n/, '');

content = content.replace(/notesContent\?: ReactNode;\n/, `notesContent?: ReactNode;\n  analyticsContent?: ReactNode;\n`);

content = content.replace(/notesContent,\n/, `notesContent,\n  analyticsContent,\n`);

content = content.replace(
  /\{projectId \? <ProjectAnalytics projectId=\{projectId\} \/> : <div className="text-slate-500">Proje bilgisi bulunamad\.<\/div>\}/,
  `{analyticsContent || <div className="text-slate-500">Analiz verisi bulunamadı.</div>}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated ProjectTabsWrapper');
