const fs = require('fs');
let path = 'src/app/dashboard/page.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('JoinByCodeInput')) {
    content = content.replace(
      /import \{ BackButton \} from '@\/components\/ui\/back-button';/,
      `import { BackButton } from '@/components/ui/back-button';\nimport JoinByCodeInput from '@/components/dashboard/JoinByCodeInput';`
    );

    // If BackButton wasn't found, insert at the top
    if (!content.includes('import JoinByCodeInput')) {
      content = content.replace(
        /import Link from 'next\/link';/,
        `import Link from 'next/link';\nimport JoinByCodeInput from '@/components/dashboard/JoinByCodeInput';`
      );
    }

    // Now insert just after SocialWidget or the pb-5 div
    content = content.replace(
      /<SocialWidget followers=\{followers\} following=\{following\} \/>\n          <\/div>\n        <\/div>/,
      `<SocialWidget followers={followers} following={following} />\n          </div>\n        </div>\n\n        <div className="px-6 lg:px-8 mt-6">\n          <JoinByCodeInput />\n        </div>`
    );
    
    fs.writeFileSync(path, content, 'utf8');
    console.log('Added JoinByCodeInput to Dashboard');
}
