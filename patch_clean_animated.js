const fs = require("fs");
let content = fs.readFileSync("src/components/ui/animated-characters-login-page.tsx", "utf8");

// Remove LinkedIn and Apple from SOCIAL array
const oldLinkedinAppleRegex = /,\s*\{\s*id:\s*"linkedin"[\s\S]*?id:\s*"apple"[\s\S]*?\},?\s*\] as const;/;
content = content.replace(oldLinkedinAppleRegex, "\n  ] as const;");

// Update grid-cols-4 to grid-cols-2
content = content.replace(/className="grid grid-cols-4 gap-2\.5"/g, 'className="grid grid-cols-2 gap-2.5"');

// Update handleOAuthLogin to use precise casting and logs
const oldHandleOAuthLoginRegex = /const handleOAuthLogin = async \(e: React\.MouseEvent, providerId: string\) => \{[\s\S]*?\};/;
const newHandleOAuthLogin = `const handleOAuthLogin = async (e: React.MouseEvent, providerId: string) => {
    e.preventDefault();
    e.stopPropagation();

    console.log(\`OAuth Girisi Tetiklendi -> Provider: \${providerId}\`);

    try {
      setLoadingProvider(providerId);
      const supabase = createClient();
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: providerId as 'google' | 'github',
        options: {
          redirectTo: \`\${window.location.origin}/auth/callback\`,
        },
      });

      if (error) {
        console.error("Supabase OAuth Hatasi:", error.message);
        alert(\`Giris Hatasi: \${error.message}\`);
      }
    } catch (err: any) {
      console.error("Beklenmeyen Hata:", err);
      alert(\`Bir hata olustu: \${err?.message || err}\`);
    } finally {
      setLoadingProvider(null);
    }
  };`;

content = content.replace(oldHandleOAuthLoginRegex, newHandleOAuthLogin);
fs.writeFileSync("src/components/ui/animated-characters-login-page.tsx", content, "utf8");
console.log("Updated animated login page successfully.");
