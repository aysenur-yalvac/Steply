const fs = require('fs');
const path = require('path');
const file = path.resolve('src/app/api/auth/register/route.ts');
let content = fs.readFileSync(file, 'utf8');

// replace classifyEmail with validateRoleAndEmail
content = content.replace(
  /const classification = classifyEmail\(email\);[\s\S]*?\/\/ 3\. Rol Atamasi/m,
  `const validation = require("@/lib/email-classification").validateRoleAndEmail(email, requestedRole);

  // 2. SERT DOMAIN VE ROL DOGRULAMASI (Guvenlik Kilidi)
  if (!validation.valid) {
    return NextResponse.redirect(
      \`\${requestUrl.origin}/auth/register?error=\${encodeURIComponent(validation.error)}\`,
      { status: 303 }
    );
  }

  // 3. Rol Atamasi`
);

// We need to also replace the `finalRole` assignment correctly
content = content.replace(
  /const finalRole = classification\.role \?\? requestedRole \?\? "student";\s*const teacherStatus =[\s\S]*?: null;/m,
  `const finalRole = requestedRole === "teacher" ? "teacher" : "student";
  const teacherStatus = finalRole === "teacher" ? "verified" : null;`
);

fs.writeFileSync(file, content, 'utf8');
console.log("register route updated.");
