const fs = require("fs");
let content = fs.readFileSync("src/app/dashboard/trash/page.tsx", "utf8");

// Fix all catch(e) -> catch(e: any) blocks
content = content.replace(/} catch \(e\) \{/g, '} catch (e: any) {');

fs.writeFileSync("src/app/dashboard/trash/page.tsx", content, "utf8");
console.log("Fixed catch types");
