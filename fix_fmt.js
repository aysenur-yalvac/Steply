const fs = require("fs");
let content = fs.readFileSync("src/app/dashboard/trash/page.tsx", "utf8");
content = content.replace(
  'const fmt = (d) =>',
  'const fmt = (d: string) =>'
);
fs.writeFileSync("src/app/dashboard/trash/page.tsx", content, "utf8");
console.log("Fixed fmt param");
