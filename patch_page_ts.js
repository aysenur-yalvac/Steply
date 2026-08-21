const fs = require("fs");
let page = fs.readFileSync("src/app/dashboard/assignments/page.tsx", "utf8");

page = page.replace(
  'let assignments = [];',
  'let assignments: any[] = [];'
);

fs.writeFileSync("src/app/dashboard/assignments/page.tsx", page, "utf8");
console.log("Fixed TS error in page.tsx");
