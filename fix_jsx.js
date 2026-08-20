const fs = require('fs');
let path = 'src/components/dashboard/DashboardViewSwitcher.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /\{isStudent && \(\s*<button/,
  `{isStudent && (
            <>
              <button`
);

content = content.replace(
  /<\/Link>\s*\)\}/,
  `</Link>
            </>
          )}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed JSX syntax error');
