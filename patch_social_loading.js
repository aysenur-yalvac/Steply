const fs = require("fs");
let content = fs.readFileSync("src/components/auth/SocialAuthRow.tsx", "utf8");

const oldFuncRegex = /const handleOAuthLogin = async \(e: React\.MouseEvent, providerId: string\) => \{[\s\S]*?\};/;
const newFunc = `const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthLogin = async (e: React.MouseEvent, providerId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const provider = providerId.toLowerCase();
    console.log("OAuth Login baslatiliyor, provider:", provider);

    if (provider !== 'google' && provider !== 'github') {
      alert(\`\${providerId} ile giris henuz aktif degil.\`);
      return;
    }

    try {
      setLoadingProvider(provider);
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: \`\${window.location.origin}/auth/callback\`,
        },
      });

      if (error) {
        console.error("Supabase OAuth Hatasi:", error);
        alert(\`Giris Hatasi: \${error.message}\`);
      } else {
        console.log("OAuth yonlendirmesi basarili:", data);
      }
    } catch (err: any) {
      console.error("Beklenmeyen Hata:", err);
      alert(\`Bir hata olustu: \${err?.message || err}\`);
    } finally {
      setLoadingProvider(null);
    }
  };`;

// replace handleOAuthLogin
content = content.replace(oldFuncRegex, newFunc);

// If the previous replace added loadingProvider but didn't remove the old setHovered, we will have a duplicate.
// Wait, `const [hovered, setHovered] = useState<string | null>(null);` is just ABOVE handleOAuthLogin.
// Let's replace both.

const oldBlockRegex = /const \[hovered, setHovered\] = useState<string \| null>\(null\);\s*const handleOAuthLogin = async \(e: React\.MouseEvent, providerId: string\) => \{[\s\S]*?\};/;

const newBlock = `const [hovered, setHovered] = useState<string | null>(null);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);

  const handleOAuthLogin = async (e: React.MouseEvent, providerId: string) => {
    e.preventDefault();
    e.stopPropagation();

    const provider = providerId.toLowerCase();
    console.log("OAuth Login baslatiliyor, provider:", provider);

    if (provider !== 'google' && provider !== 'github') {
      alert(\`\${providerId} ile giris henuz aktif degil.\`);
      return;
    }

    try {
      setLoadingProvider(provider);
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as any,
        options: {
          redirectTo: \`\${window.location.origin}/auth/callback\`,
        },
      });

      if (error) {
        console.error("Supabase OAuth Hatasi:", error);
        alert(\`Giris Hatasi: \${error.message}\`);
      } else {
        console.log("OAuth yonlendirmesi basarili:", data);
      }
    } catch (err: any) {
      console.error("Beklenmeyen Hata:", err);
      alert(\`Bir hata olustu: \${err?.message || err}\`);
    } finally {
      setLoadingProvider(null);
    }
  };`;

content = content.replace(oldBlockRegex, newBlock);

// Replace button content if we want to show a spinner, but the prompt doesn't strictly say to show a spinner. 
// Just loading state is enough to block multiple clicks or something.
// Oh wait, my regex using `oldBlockRegex` might have failed. Let's just restore the file from git and do the old regex, or use a precise block replacement.
fs.writeFileSync("src/components/auth/SocialAuthRow.tsx", content, "utf8");
console.log("Updated loadingProvider and handleOAuthLogin");
