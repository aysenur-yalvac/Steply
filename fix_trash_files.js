const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/trash/files/TrashFilesClient.tsx', 'utf8');

content = content.replace(
  'const [files, setFiles] = useState(files);',
  'const [files, setFiles] = useState(initialFiles);'
);

fs.writeFileSync('src/app/dashboard/trash/files/TrashFilesClient.tsx', content, 'utf8');
console.log('Fixed useState in files client');
