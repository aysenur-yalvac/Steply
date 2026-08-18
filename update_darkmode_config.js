const fs = require('fs');

// 1. Check and fix tailwind.config.ts
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

// 2. Update globals.css
let cssContent = fs.readFileSync('src/app/globals.css', 'utf8');
if (!cssContent.includes('--background:')) {
    const cssToAdd = `
@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --border: 214.3 31.8% 91.4%;
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 8%;
    --card-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
  }
}

body {
  @apply bg-background text-foreground transition-colors duration-300;
}
`;
    // We add this right after the tailwind directives
    const insertPos = cssContent.lastIndexOf('@tailwind utilities;') + '@tailwind utilities;'.length;
    if (insertPos !== -1 + '@tailwind utilities;'.length) {
        cssContent = cssContent.slice(0, insertPos) + '\n' + cssToAdd + cssContent.slice(insertPos);
    } else {
        cssContent = cssToAdd + cssContent;
    }
    fs.writeFileSync('src/app/globals.css', cssContent, 'utf8');
    console.log("Updated globals.css");
}
