const fs = require('fs');
let content = fs.readFileSync('src/lib/actions.ts', 'utf8');

const regex = /export interface ProjectFile[\s\S]*?\n\}/;
const match = content.match(regex);
if (match) {
    console.log(match[0]);
} else {
    console.log("Could not find ProjectFile interface.");
}
