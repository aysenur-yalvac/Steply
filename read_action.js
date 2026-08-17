const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/actions.ts', 'utf8');

const regex = /export async function removeProjectMemberAction[\s\S]*?\n\}/;
const match = content.match(regex);
if (match) {
    console.log(match[0]);
} else {
    console.log("Not found with simple regex, trying index");
    const idx = content.indexOf('export async function removeProjectMemberAction');
    console.log(content.substring(idx, idx + 800));
}
