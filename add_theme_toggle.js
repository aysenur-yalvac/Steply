const fs = require('fs');

let layoutContent = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

if (!layoutContent.includes('<ThemeToggle />')) {
    const importStr = `import { ThemeToggle } from "@/components/ThemeToggle";\n`;
    const lastImportIndex = layoutContent.lastIndexOf('import ');
    const importInsertIndex = layoutContent.indexOf('\n', lastImportIndex) + 1;
    layoutContent = layoutContent.slice(0, importInsertIndex) + importStr + layoutContent.slice(importInsertIndex);

    const bellIndex = layoutContent.indexOf('<NotificationBell');
    if (bellIndex !== -1) {
        layoutContent = layoutContent.slice(0, bellIndex) + '<ThemeToggle />\n          ' + layoutContent.slice(bellIndex);
        fs.writeFileSync('src/app/dashboard/layout.tsx', layoutContent, 'utf8');
        console.log("Updated layout.tsx to add ThemeToggle");
    } else {
        console.log("Could not find NotificationBell in layout.tsx");
    }
} else {
    console.log("layout.tsx already has ThemeToggle");
}
