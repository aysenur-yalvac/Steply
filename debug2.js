const fs = require("fs");
let content = fs.readFileSync("src/lib/database.types.ts", "utf8");

// Find profiles section index
const idx = content.indexOf("profiles:");
console.log("profiles index:", idx);
if (idx >= 0) {
  console.log("Profiles section:", JSON.stringify(content.slice(idx, idx + 300)));
}
