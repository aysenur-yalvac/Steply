const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/page.tsx', 'utf8');

const bannerRegex = /<div className="relative bg-zinc-950 dark:bg-black rounded-3xl overflow-hidden[\s\S]*?<\/div>\s*<\/div>/;
const match = content.match(bannerRegex);
if (match) {
    console.log("Found banner.");
    const idx = content.indexOf(match[0]);
    console.log(content.substring(Math.max(0, idx - 100), idx + 200));
} else {
    console.log("Could not find the banner by regex. Let's find it by 'The Empty State Canvas'");
    const idx = content.indexOf('The Empty State Canvas');
    if (idx !== -1) {
        console.log(content.substring(Math.max(0, idx - 200), idx + 200));
    } else {
        console.log("Not found.");
    }
}

const isTeacherRegex = /isTeacher/;
if (content.match(isTeacherRegex)) {
    console.log("isTeacher is available in the file.");
} else {
    console.log("isTeacher is NOT available in the file. We need to check role.");
}

