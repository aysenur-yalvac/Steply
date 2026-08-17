const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/projects/[id]/page.tsx', 'utf8');

const regex = /const \{ data\: project \} = await supabase[\s\S]*?single\(\);/;

const match = content.match(regex);
if (match) {
    console.log(match[0]);
} else {
    console.log("Could not find the supabase query");
    // Print lines around `from('projects')`
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i++) {
        if (lines[i].includes("from('projects'") || lines[i].includes('from("projects"')) {
            console.log(lines.slice(i-2, i+15).join('\n'));
            break;
        }
    }
}
