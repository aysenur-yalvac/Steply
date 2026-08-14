const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/trash/layout.tsx', 'utf8');

// Insert import
content = content.replace(
  'import { Metadata } from "next";',
  'import { Metadata } from "next";\nimport { BackButton } from "@/components/ui/back-button";'
);

// Insert the BackButton in the UI
content = content.replace(
  '<div>\n            <h1 className="text-2xl font-bold text-slate-800">',
  '<div className="flex items-center gap-4">\n            <BackButton href="/dashboard" variant="light" />\n            <div>\n              <h1 className="text-2xl font-bold text-slate-800">'
);
content = content.replace(
  'SilinmiY projeleriniz ve dosyalarnz burada yer alr.\n            </p>\n          </div>',
  'SilinmiY projeleriniz ve dosyalarnz burada yer alr.\n              </p>\n            </div>\n          </div>'
);

fs.writeFileSync('src/app/dashboard/trash/layout.tsx', content, 'utf8');
console.log('Patched layout');
