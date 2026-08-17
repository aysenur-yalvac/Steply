const fs = require('fs');
let content = fs.readFileSync('src/lib/actions.ts', 'utf8');

// The file might be read with utf8 but it was corrupted during write. Let's fix the common corrupted Turkish chars:
content = content.replace(/yǬklendi/g, 'yüklendi');
content = content.replace(/y\xef\xbf\xbdklendi/g, 'yüklendi');
content = content.replace(/grev/g, 'görev');
content = content.replace(/Grev/g, 'Görev');
content = content.replace(/deYerlendirme/g, 'değerlendirme');
content = content.replace(/deY/g, 'değ');
content = content.replace(/Oturum bulunamad/g, 'Oturum bulunamadı');
content = content.replace(/giriY yapn/g, 'giriş yapın');
content = content.replace(/bulunamad/g, 'bulunamadı');
content = content.replace(/Hatas/g, 'Hatası');
content = content.replace(/G\xef\xbf\xbdrev/g, 'Görev');
content = content.replace(/g\xef\xbf\xbdrev/g, 'görev');
content = content.replace(/Oturum bulunamad\xef\xbf\xbd/g, 'Oturum bulunamadı');
content = content.replace(/bulunamad\xef\xbf\xbd/g, 'bulunamadı');

// I will just use a regex for the exact texts in actions.ts to be safe:
content = content.replace(/yeni bir dosya y[^\s]+klendi/g, 'yeni bir dosya yüklendi');
content = content.replace(/Yeni g[^\s]+rev eklendi/g, 'Yeni görev eklendi');
content = content.replace(/G[^\s]+rev silindi/g, 'Görev silindi');
content = content.replace(/G[^\s]+rev /g, 'Görev ');
content = content.replace(/g[^\s]+rev/g, 'görev');

fs.writeFileSync('src/lib/actions.ts', content, 'utf8');
console.log("Fixed corrupted text in actions.ts");
