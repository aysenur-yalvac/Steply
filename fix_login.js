const fs = require('fs');
const path = require('path');
const file = path.resolve('src/app/api/auth/login/route.ts');
let content = fs.readFileSync(file, 'utf8');

const regex = /if \(error\.message\.includes\('Email not confirmed'\)\) \{\s*message = 'Please verify your email address\. Check your inbox \(and spam folder\)\.'\s*\}/;

const newLogic = `if (error.message.includes('Email not confirmed')) {
      // Send OTP and redirect to verify-email
      try {
        await fetch(\`\${requestUrl.origin}/api/auth/send-otp-8\`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
      } catch (err) {
        console.error("Ilk OTP gonderimi basarisiz:", err);
      }
      return NextResponse.redirect(
        \`\${requestUrl.origin}/auth/verify-email?email=\${encodeURIComponent(email)}\`,
        { status: 303 }
      );
    }`;

content = content.replace(regex, newLogic);
fs.writeFileSync(file, content, 'utf8');
console.log("Updated login API to redirect to verify-email on unconfirmed email.");
