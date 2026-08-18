const fs = require('fs');
const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
console.log(pkg.dependencies.tailwindcss || pkg.devDependencies.tailwindcss);
