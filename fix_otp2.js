const fs = require('fs');
const path = require('path');
const file = path.resolve('src/components/auth/OtpInput.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ classifyEmail \} from "@\/lib\/email-classification";\n/, "");

fs.writeFileSync(file, content, 'utf8');
