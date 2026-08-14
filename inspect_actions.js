const fs = require('fs');
let content = fs.readFileSync('src/lib/actions.ts', 'utf8');

const functionsToInspect = ['getProjects', 'getProject', 'deleteProjectTask', 'deleteFileAction', 'getAllProjectsAction'];
for (const fn of functionsToInspect) {
  let idx = content.indexOf(`function ${fn}`);
  if (idx === -1) idx = content.indexOf(`function ${fn}Action`);
  if (idx !== -1) {
    console.log(`--- ${fn} ---`);
    console.log(content.substring(idx, idx + 400));
  }
}
