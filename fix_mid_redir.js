const fs = require('fs');
const path = require('path');
const file = path.resolve('src/utils/supabase/middleware.ts');
let content = fs.readFileSync(file, 'utf8');

const regex = /if \(user\?\.email\) url\.searchParams\.set\("email", user\.email\);\n\s*return NextResponse\.redirect\(url\);/;
const replacement = `if (user?.email) url.searchParams.set("email", user.email);
        const userRole = user?.user_metadata?.role || user?.app_metadata?.role;
        if (userRole) url.searchParams.set("role", userRole);
        return NextResponse.redirect(url);`;

content = content.replace(regex, replacement);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated middleware redirect.");
