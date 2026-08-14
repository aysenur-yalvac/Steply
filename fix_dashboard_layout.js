const fs = require('fs');
const path = require('path');

let fp = path.join(process.cwd(), 'src/app/dashboard/projects/[id]/page.tsx');
let content = fs.readFileSync(fp, 'utf8');

content = content.replace(
  '<div className="w-full lg:w-[350px] shrink-0">',
  '<div className="w-full lg:w-[350px] shrink-0 flex flex-col gap-6">'
);

fs.writeFileSync(fp, content, 'utf8');
console.log("Fixed dashboard layout CSS overlap");
