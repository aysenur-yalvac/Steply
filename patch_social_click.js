const fs = require("fs");
let content = fs.readFileSync("src/components/auth/SocialAuthRow.tsx", "utf8");

const oldFuncRegex = /const handleOAuthLogin = async \(providerId: string\) => \{[\s\S]*?\};/;
const newFunc = `const handleOAuthLogin = async (e: React.MouseEvent, providerId: string) => {
    e.preventDefault();

    const provider = providerId.toLowerCase();
    if (provider !== 'google' && provider !== 'github') {
      alert(\`\${providerId} ile giris henuz aktif degil.\`);
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: \`\${window.location.origin}/auth/callback\`,
      },
    });

    if (error) {
      alert(\`Giris hatasi: \${error.message}\`);
    }
  };`;

content = content.replace(oldFuncRegex, newFunc);
content = content.replace(/onClick=\{\(\) => handleOAuthLogin\(s\.id\)\}/g, "onClick={(e) => handleOAuthLogin(e, s.id)}");

fs.writeFileSync("src/components/auth/SocialAuthRow.tsx", content, "utf8");
console.log("Updated handleOAuthLogin");
