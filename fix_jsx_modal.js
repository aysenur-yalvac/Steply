const fs = require('fs');
let path = 'src/components/dashboard/DashboardViewSwitcher.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /return \(\s*<>\s*\{\/\* "\?"\? Controls row/,
  `return (
    <>
      {isJoinModalOpen && <JoinProjectModal onClose={() => setIsJoinModalOpen(false)} />}
      {/*  Controls row`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Added JoinProjectModal to JSX');
