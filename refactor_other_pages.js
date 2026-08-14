const fs = require('fs');

function refactorPage(path, loadingComponentName, loaderJsx) {
  if (!fs.existsSync(path)) return;
  let content = fs.readFileSync(path, 'utf8');
  
  const exportDefaultRegex = /export default async function (\w+)\((.*?)\)\s*\{/;
  const match = content.match(exportDefaultRegex);
  
  if (match) {
    const originalName = match[1];
    const props = match[2];
    content = content.replace(exportDefaultRegex, `async function ${originalName}Content(${props}) {`);
    
    const topImport = `import { Suspense } from 'react';\n`;
    content = topImport + content;
    
    const newDefaultExport = `
export default function ${originalName}(${props}) {
  return (
    <Suspense fallback={${loaderJsx}}>
      <${originalName}Content ${props ? '{...arguments[0]}' : ''} />
    </Suspense>
  );
}
`;
    content += newDefaultExport;
    fs.writeFileSync(path, content, 'utf8');
    console.log(`Refactored ${path}`);
  } else {
    console.log(`Could not find default export in ${path}`);
  }
}

// For Analytics
refactorPage('src/app/dashboard/analytics/page.tsx', 'AnalyticsLoading', `<div className="flex-1 p-8 flex items-center justify-center animate-pulse"><div className="w-8 h-8 rounded-full border-4 border-violet-600 border-t-transparent animate-spin"></div></div>`);

// For School
refactorPage('src/app/dashboard/school/page.tsx', 'SchoolLoading', `<div className="flex-1 p-8 flex items-center justify-center animate-pulse"><div className="w-8 h-8 rounded-full border-4 border-violet-600 border-t-transparent animate-spin"></div></div>`);

