const fs = require('fs');
let path = 'src/components/projects/ProjectTabsWrapper.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /notesContent\?: ReactNode;/g,
  `notesContent?: ReactNode;\n  analyticsContent?: ReactNode;`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed props in ProjectTabsWrapper exactly');
