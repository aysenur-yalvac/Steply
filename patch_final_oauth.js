const fs = require('fs');
let content = fs.readFileSync('src/components/ui/animated-characters-login-page.tsx', 'utf8');

// 1. Find where loadingProvider state is defined to inject handleOAuthLogin near it
// Look for "const router = useRouter();"
const anchorStr = 'const isLogin = mode === "login";\n  const router  = useRouter();';

const newFunctions = `const isLogin = mode === "login";
  const router  = useRouter();

  // OAuth Login Handler
  const handleOAuthLogin = async (e: React.MouseEvent, providerId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const provider = providerId.toLowerCase();

    if (provider !== "google" && provider !== "github") {
      console.warn("Gecersiz veya desteklenmeyen provider:", provider);
      return;
    }

    console.log(\`[OAuth] \${provider} girisi baslatiliyor...\`);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider as "google" | "github",
        options: {
          redirectTo: \`\${window.location.origin}/auth/callback\`,
        },
      });

      if (error) {
        console.error(\`[OAuth Error] \${provider}:\`, error.message);
        alert(\`Giris Basarisiz: \${error.message}\`);
      }
    } catch (err) {
      const e2 = err as any;
      console.error("[OAuth Unexpected Error]:", e2);
      alert(\`Bir hata olustu: \${e2?.message || e2}\`);
    }
  };`;

content = content.replace(anchorStr, newFunctions);

// 2. Inject onClick into the SOCIAL map button (after onMouseLeave)
const oldButtonLine = `onMouseLeave={() => setHovSocial(null)}
                  className="flex items-center justify-center py-2.5 rounded-xl transition-all duration-200"`;

const newButtonLine = `onMouseLeave={() => setHovSocial(null)}
                  onClick={(e) => handleOAuthLogin(e, s.id)}
                  className="flex items-center justify-center py-2.5 rounded-xl transition-all duration-200"`;

content = content.replace(oldButtonLine, newButtonLine);

fs.writeFileSync('src/components/ui/animated-characters-login-page.tsx', content, 'utf8');
console.log("handleOAuthLogin injected:", content.includes('handleOAuthLogin'));
console.log("onClick binding injected:", content.includes('onClick={(e) => handleOAuthLogin(e, s.id)'));
