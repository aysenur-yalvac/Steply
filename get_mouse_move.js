const fs = require('fs');
const path = require('path');

let codeViewerPath = path.join(process.cwd(), 'src/components/projects/viewer/CodeViewer.tsx');
let content = fs.readFileSync(codeViewerPath, 'utf8');

const regex = /const handleMouseMove = \(e: any\) => \{([\s\S]*?)\n  \};/m;
const match = content.match(regex);
if (match) {
  console.log(match[0]);
} else {
  console.log("Not found");
}
