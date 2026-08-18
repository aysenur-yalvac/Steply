const fs = require('fs');

// 1. Update layout.tsx
let layoutContent = fs.readFileSync('src/app/layout.tsx', 'utf8');

if (!layoutContent.includes('ThemeProvider')) {
    const importStr = `import { ThemeProvider } from "@/components/theme-provider";\n`;
    const lastImportIndex = layoutContent.lastIndexOf('import');
    const importInsertIndex = layoutContent.indexOf('\n', lastImportIndex) + 1;
    layoutContent = layoutContent.slice(0, importInsertIndex) + importStr + layoutContent.slice(importInsertIndex);

    layoutContent = layoutContent.replace(/<html lang="en">/, '<html lang="en" suppressHydrationWarning>');
    
    // Wrap children with ThemeProvider inside body
    const bodyStart = layoutContent.indexOf('<body');
    const bodyEnd = layoutContent.indexOf('>', bodyStart) + 1;
    const bodyEndTag = layoutContent.lastIndexOf('</body>');
    
    const beforeBody = layoutContent.slice(0, bodyEnd);
    const bodyContent = layoutContent.slice(bodyEnd, bodyEndTag);
    const afterBody = layoutContent.slice(bodyEndTag);
    
    layoutContent = beforeBody + '\n        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>\n' + bodyContent + '\n        </ThemeProvider>\n      ' + afterBody;
    
    fs.writeFileSync('src/app/layout.tsx', layoutContent, 'utf8');
    console.log("Updated layout.tsx");
} else {
    console.log("layout.tsx already has ThemeProvider");
}

// 2. Update DashboardHeader.tsx
let headerContent = fs.readFileSync('src/components/dashboard/DashboardHeader.tsx', 'utf8');

if (!headerContent.includes('<ThemeToggle />')) {
    const importStr = `import { ThemeToggle } from "@/components/ThemeToggle";\n`;
    const lastImportIndex = headerContent.lastIndexOf('import');
    const importInsertIndex = headerContent.indexOf('\n', lastImportIndex) + 1;
    headerContent = headerContent.slice(0, importInsertIndex) + importStr + headerContent.slice(importInsertIndex);

    // Insert next to NotificationBell
    const bellIndex = headerContent.indexOf('<NotificationBell');
    if (bellIndex !== -1) {
        headerContent = headerContent.slice(0, bellIndex) + '<ThemeToggle />\n          ' + headerContent.slice(bellIndex);
        fs.writeFileSync('src/components/dashboard/DashboardHeader.tsx', headerContent, 'utf8');
        console.log("Updated DashboardHeader.tsx");
    } else {
        console.log("Could not find NotificationBell in DashboardHeader");
    }
} else {
    console.log("DashboardHeader.tsx already has ThemeToggle");
}

// 3. Update tailwind.config.ts to ensure darkMode: ["class"]
let twContent = fs.readFileSync('tailwind.config.ts', 'utf8');
if (!twContent.includes('darkMode: ["class"]')) {
    if (twContent.includes('darkMode: "class"')) {
        twContent = twContent.replace('darkMode: "class"', 'darkMode: ["class"]');
    } else if (twContent.includes("darkMode: 'class'")) {
        twContent = twContent.replace("darkMode: 'class'", 'darkMode: ["class"]');
    } else {
        twContent = twContent.replace('const config: Config = {', 'const config: Config = {\n  darkMode: ["class"],');
    }
    fs.writeFileSync('tailwind.config.ts', twContent, 'utf8');
    console.log("Updated tailwind.config.ts");
}
