const fs = require("fs");
let content = fs.readFileSync("src/components/auth/SocialAuthRow.tsx", "utf8");

const oldLinkedinAppleRegex = /,\s*\{\s*id:\s*"linkedin"[\s\S]*?id:\s*"apple"[\s\S]*?\},?\s*\];/;
content = content.replace(oldLinkedinAppleRegex, "\n];");

content = content.replace(/className="grid grid-cols-4 gap-2\.5"/g, 'className="grid grid-cols-2 gap-2.5"');

fs.writeFileSync("src/components/auth/SocialAuthRow.tsx", content, "utf8");
console.log("Updated SocialAuthRow.tsx");
