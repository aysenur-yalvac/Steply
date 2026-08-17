const fs = require('fs');

const pageContent = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');
const tabsIdx = pageContent.indexOf('<ProjectTabsWrapper');
console.log(pageContent.substring(tabsIdx, tabsIdx + 1500));

