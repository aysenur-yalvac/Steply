const fs = require('fs');

let content = fs.readFileSync('src/components/projects/FileSection.tsx', 'utf8');

const regex = /const result = await saveFileRecordAction\([\s\S]*?makePrivate,\s*\);/;

const newCall = `const result = await saveFileRecordAction(
        projectId,
        file.name,
        filePath,
        file.size,
        file.type,
        fileVisibility,
      );`;

content = content.replace(regex, newCall);

fs.writeFileSync('src/components/projects/FileSection.tsx', content, 'utf8');
console.log("Fixed saveFileRecordAction call");
