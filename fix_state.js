const fs = require('fs');
let path = 'src/components/dashboard/DashboardViewSwitcher.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const \[filterOpen,  setFilterOpen\]  = useState\(false\);/,
  `const [filterOpen,  setFilterOpen]  = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Added isJoinModalOpen state');
