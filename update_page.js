const fs = require('fs');
let path = 'src/app/dashboard/projects/[id]/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace import
content = content.replace(
  /import ProjectTabsWrapper from '@\/components\/projects\/ProjectTabsWrapper';/,
  `import ProjectTabsWrapper from '@/components/projects/ProjectTabsWrapper';\nimport ProjectAnalyticsView from '@/components/projects/ProjectAnalyticsView';`
);

// Add analyticsContent prop
content = content.replace(
  /overviewContent=\{/,
  `analyticsContent={<ProjectAnalyticsView tasks={projectTasks} members={teamMembers} />}\n                overviewContent={`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated page.tsx');
