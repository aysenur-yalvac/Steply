const fs = require("fs");
let page = fs.readFileSync("src/app/dashboard/assignments/page.tsx", "utf8");

page = page.replace(
  'const assignments = await getAssignmentsAction();',
  `let assignments = [];
  try {
    assignments = await getAssignmentsAction();
  } catch (error) {
    console.error("Page level error fetching assignments:", error);
  }`
);

fs.writeFileSync("src/app/dashboard/assignments/page.tsx", page, "utf8");
console.log("Updated page.tsx");
