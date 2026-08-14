const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/trash/layout.tsx', 'utf8');

content = content.replace(
  '            <p className="text-sm text-slate-500 mt-1">\n              SilinmiY projeleriniz ve dosyalarnz burada yer alr.\n            </p>\n          </div>',
  '            <p className="text-sm text-slate-500 mt-1">\n              Silinmiş projeleriniz ve dosyalarınız burada yer alır.\n            </p>\n            </div>\n          </div>'
);

content = content.replace('p Kutusu', 'Çöp Kutusu');
content = content.replace('p Kutusu', 'Çöp Kutusu');

fs.writeFileSync('src/app/dashboard/trash/layout.tsx', content, 'utf8');
console.log('Fixed syntax and encoding');
