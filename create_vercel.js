const fs = require('fs');
fs.writeFileSync('vercel.json', '{\n  "regions": ["fra1"]\n}\n', 'utf8');
