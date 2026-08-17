const fs = require('fs');
let content = fs.readFileSync('C:/Users/aysen/.gemini/antigravity/brain/cd5d55db-a56d-4e96-8cca-1163c4fe2d64/task.md', 'utf8');

content = content.replace(/\[ \]/g, '[x]').replace(/\[\/\]/g, '[x]');
fs.writeFileSync('C:/Users/aysen/.gemini/antigravity/brain/cd5d55db-a56d-4e96-8cca-1163c4fe2d64/task.md', content, 'utf8');
console.log("Updated task.md");
