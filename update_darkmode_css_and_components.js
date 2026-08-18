const fs = require('fs');

// Update globals.css
let cssContent = fs.readFileSync('src/app/globals.css', 'utf8');

const variantString = `@custom-variant dark (&:is(.dark *));\n`;
if (!cssContent.includes('@custom-variant dark')) {
    cssContent = cssContent.replace('@import "tailwindcss";', '@import "tailwindcss";\n' + variantString);
}

if (!cssContent.includes('--card-foreground')) {
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
  background-color: hsl(var(--background));
  color: hsl(var(--foreground));
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 300ms;
}
`;
    cssContent = cssContent + '\n' + cssToAdd;
}

fs.writeFileSync('src/app/globals.css', cssContent, 'utf8');
console.log("Updated globals.css");

// 3. Update main components (DashboardSidebar.tsx, layout.tsx)
const files = [
    'src/components/dashboard/DashboardSidebar.tsx',
    'src/app/dashboard/layout.tsx'
];

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = content.replace(/bg-white([^A-Za-z0-9_-])/g, 'bg-white dark:bg-slate-900$1');
        content = content.replace(/bg-slate-50([^A-Za-z0-9_-])/g, 'bg-slate-50 dark:bg-slate-950$1');
        content = content.replace(/bg-gray-100([^A-Za-z0-9_-])/g, 'bg-gray-100 dark:bg-slate-950$1');
        content = content.replace(/text-slate-900([^A-Za-z0-9_-])/g, 'text-slate-900 dark:text-slate-100$1');
        content = content.replace(/border-gray-200([^A-Za-z0-9_-])/g, 'border-gray-200 dark:border-slate-800$1');
        fs.writeFileSync(file, content, 'utf8');
        console.log("Updated", file);
    }
}
