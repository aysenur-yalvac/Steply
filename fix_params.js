const fs = require("fs");
let content = fs.readFileSync("src/app/dashboard/trash/page.tsx", "utf8");

// Add string type annotations to all function parameters
content = content
  .replace('function handleRestoreProject(id) {', 'function handleRestoreProject(id: string) {')
  .replace('function handleRestoreFile(id) {', 'function handleRestoreFile(id: string) {')
  .replace('function handlePermanentDelete() {', 'function handlePermanentDelete() {');

fs.writeFileSync("src/app/dashboard/trash/page.tsx", content, "utf8");
console.log("Fixed param types");
