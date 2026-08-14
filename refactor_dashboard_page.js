const fs = require('fs');

const path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

// The file currently exports default async function DashboardPage(props: { searchParams?: Promise<{ q?: string }> })
// We will rename DashboardPage to DashboardContent, and create a new default export DashboardPage that wraps DashboardContent in Suspense.

// Find where the default export is
const exportDefaultRegex = /export default async function DashboardPage\((.*?)\)\s*\{/;
const match = content.match(exportDefaultRegex);

if (match) {
  // Rename the async function
  content = content.replace(exportDefaultRegex, 'async function DashboardContent($1) {');

  // We need to import Suspense and DashboardLoading (which is in loading.tsx). But loading.tsx is default export.
  // Actually, let's just import Suspense and use a basic skeleton or the loading component.
  
  const topImport = `import { Suspense } from 'react';\nimport DashboardLoading from './loading';\n`;
  content = topImport + content;

  // Add the new default export at the end of the file
  const newDefaultExport = `
export default function DashboardPage(props: { searchParams?: Promise<{ q?: string }> }) {
  return (
    <Suspense fallback={<DashboardLoading />}>
      <DashboardContent {...props} />
    </Suspense>
  );
}
`;
  content += newDefaultExport;
  fs.writeFileSync(path, content, 'utf8');
  console.log("Refactored src/app/dashboard/page.tsx");
} else {
  console.log("Could not find default export in page.tsx");
}
