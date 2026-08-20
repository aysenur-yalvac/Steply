const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /value=\{`\$\{typeof window !== "undefined" \? window\.location\.origin : ""\}\/join\/\$\{inviteData\.token\}`\}/g,
  `value={inviteData.token ? \`\${typeof window !== "undefined" ? window.location.origin : ""}/join/\${inviteData.token}\` : "TÜRETİLİYOR..."}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed input field value for token');
