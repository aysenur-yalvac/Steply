const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /onClick=\{\(\) => handleCopy\(inviteData\.code \|\| ''\)\}/g,
  `onClick={() => {
                        if (!inviteData.code) {
                          toast.error("Davet kodu hazırlanıyor, lütfen tekrar deneyin.");
                          return;
                        }
                        handleCopy(inviteData.code);
                      }}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed copy code button');
