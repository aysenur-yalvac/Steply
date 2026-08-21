const fs = require("fs");
let page = fs.readFileSync("src/app/dashboard/assignments/page.tsx", "utf8");

page = page.replace(
  'export const metadata = {',
  'export const dynamic = "force-dynamic";\nexport const revalidate = 0;\n\nexport const metadata = {'
);

fs.writeFileSync("src/app/dashboard/assignments/page.tsx", page, "utf8");
console.log("Updated page.tsx for force-dynamic");
