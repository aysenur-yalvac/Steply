const fs = require('fs');
let content = fs.readFileSync('src/components/projects/ProjectTabsWrapper.tsx', 'utf8');

const oldTabs = `  const tabs = [
    { id: 'overview', label: 'Genel BakY & Takm', icon: Layers },
    { id: 'milestones', label: 'Grevler', icon: CheckSquare },
    { id: 'files', label: 'Dosyalar', icon: FileText },
  ];`;

// using regex to avoid exact character issues
const regex = /const tabs = \[\s*\{\s*id: 'overview'[^\]]*\];/;

const newTabs = `  const tabs = [
    { id: 'overview', label: 'Genel Bakış & Takım', icon: Layers },
  ];
  if (milestonesContent) {
    tabs.push({ id: 'milestones', label: 'Görevler', icon: CheckSquare });
  }
  tabs.push({ id: 'files', label: 'Dosyalar', icon: FileText });`;

content = content.replace(regex, newTabs);
fs.writeFileSync('src/components/projects/ProjectTabsWrapper.tsx', content, 'utf8');

console.log("Updated ProjectTabsWrapper.tsx");
