const fs = require("fs");
let content = fs.readFileSync("src/lib/database.types.ts", "utf8");

// Find the profiles Row block
const rowStart = content.indexOf("profiles: {");
const rowBlockStart = content.indexOf("Row: {", rowStart);
const rowBlockEnd = content.indexOf("}\n        Insert:", rowBlockStart) + 1;

const oldRow = content.slice(rowBlockStart, rowBlockEnd);
console.log("Found row block chars:", oldRow.length);
console.log("First 200 chars:", oldRow.slice(0, 200));
