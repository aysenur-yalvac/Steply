const fs = require('fs');
let path = 'src/app/dashboard/actions.ts';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /description: augmentedDesc,\n\s*progress_percentage,\n\s*\}\);/g,
  `description: augmentedDesc,
          progress_percentage,
          invite_code,
          invite_token,
        });`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed fallback insert');
