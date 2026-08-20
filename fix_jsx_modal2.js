const fs = require('fs');
let path = 'src/components/dashboard/DashboardViewSwitcher.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /const filteredProjects = applyFilters\(projects, filters\);\n  const allTags = \[\.\.\.new Set\(projects\.flatMap\(p => p\.tags \?\? \[\]\)\)\]\.sort\(\);\n\n  return \(\n    <>\n/,
  `const filteredProjects = applyFilters(projects, filters);
  const allTags = [...new Set(projects.flatMap(p => p.tags ?? []))].sort();

  return (
    <>
      {isJoinModalOpen && <JoinProjectModal onClose={() => setIsJoinModalOpen(false)} />}\n`
);

// Add the console log and stopPropagation to the "Katıl" button as requested
content = content.replace(
  /onClick=\{\(\) => setIsJoinModalOpen\(true\)\}/,
  `onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("👉 Katıl butonuna tıklandı!");
                  setIsJoinModalOpen(true);
                }}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed JSX modal rendering and onClick');
