const fs = require('fs');
let path = 'src/app/dashboard/layout.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('RealtimeNotifications')) {
    content = content.replace(
      /import \{ ThemeToggle \} from "@\/components\/ThemeToggle";/,
      `import { ThemeToggle } from "@/components/ThemeToggle";\nimport RealtimeNotifications from '@/components/dashboard/RealtimeNotifications';`
    );

    // Insert just before </main>
    content = content.replace(
      /<\/main>/,
      `  <RealtimeNotifications userId={user.id} />\n      </main>`
    );
    
    fs.writeFileSync(path, content, 'utf8');
    console.log('Added RealtimeNotifications to dashboard layout');
}
