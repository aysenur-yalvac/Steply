const fs = require('fs');
const path = require('path');
const file = path.resolve('src/utils/supabase/middleware.ts');
let content = fs.readFileSync(file, 'utf8');

const regexToReplace = /\/\/ 2\. E-posta dogrulanmis ancak Ogretmen \(pending\) kontrolu[\s\S]*?(?=\s*\}\s*\n\s*\/\/ Auth sayfasinda)/;

const newContent = `// 2. Rol bazli panel erisim kontrolu
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .maybeSingle();

      const dbRole = profile?.role || "student";

      if (dbRole === "student" && (pathname.startsWith("/dashboard/teacher") || pathname.startsWith("/dashboard/admin"))) {
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard/student";
        return NextResponse.redirect(url);
      }`;

content = content.replace(regexToReplace, newContent);
fs.writeFileSync(file, content, 'utf8');
console.log("Middleware fixed.");
