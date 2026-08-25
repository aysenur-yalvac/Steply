const fs = require('fs');
const path = require('path');
const file = path.resolve('src/app/api/auth/register/route.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /return NextResponse\.redirect\(\n\s*`\$\{requestUrl\.origin\}\/auth\/verify-email\?email=\$\{encodeURIComponent\(email\)\}`,\n\s*\{\s*status:\s*303\s*\}\n\s*\);/,
  `return NextResponse.redirect(
    \`\${requestUrl.origin}/auth/verify-email?email=\${encodeURIComponent(email)}&role=\${finalRole}\`,
    { status: 303 }
  );`
);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated register API redirect.");
