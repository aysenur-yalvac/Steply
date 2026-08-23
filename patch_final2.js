const fs = require('fs');
let content = fs.readFileSync('src/components/ui/animated-characters-login-page.tsx', 'utf8');

// Use index-based replacement to be more precise
// Insert handleOAuthLogin function after "const router  = useRouter();\r\n"
const anchor = 'const router  = useRouter();\r\n';
const insertAfter = `const router  = useRouter();\r\n\r\n  // OAuth Login Handler\r\n  const handleOAuthLogin = async (e: React.MouseEvent<HTMLButtonElement>, providerId: string) => {\r\n    e.preventDefault();\r\n    e.stopPropagation();\r\n\r\n    const provider = providerId.toLowerCase();\r\n\r\n    if (provider !== "google" && provider !== "github") {\r\n      console.warn("Gecersiz provider:", provider);\r\n      return;\r\n    }\r\n\r\n    console.log(\`[OAuth] \${provider} girisi baslatiliyor...\`);\r\n\r\n    try {\r\n      const supabase = createClient();\r\n      const { error } = await supabase.auth.signInWithOAuth({\r\n        provider: provider as "google" | "github",\r\n        options: {\r\n          redirectTo: \`\${window.location.origin}/auth/callback\`,\r\n        },\r\n      });\r\n\r\n      if (error) {\r\n        console.error(\`[OAuth Error] \${provider}:\`, error.message);\r\n        alert(\`Giris Basarisiz: \${error.message}\`);\r\n      }\r\n    } catch (err) {\r\n      const ex = err as any;\r\n      console.error("[OAuth Error]:", ex);\r\n      alert(\`Bir hata olustu: \${ex?.message || ex}\`);\r\n    }\r\n  };\r\n`;

// Only inject if not already present
if (!content.includes('handleOAuthLogin')) {
  content = content.replace(anchor, insertAfter);
  console.log("Injected handleOAuthLogin:", content.includes('handleOAuthLogin'));
} else {
  console.log("handleOAuthLogin already present");
}

// Now add onClick to the SOCIAL map button
const oldOnMouseLeave = 'onMouseLeave={() => setHovSocial(null)}\r\n                  className="flex items-center justify-center py-2.5 rounded-xl transition-all duration-200"';
const newOnMouseLeave = 'onMouseLeave={() => setHovSocial(null)}\r\n                  onClick={(e) => handleOAuthLogin(e, s.id)}\r\n                  className="flex items-center justify-center py-2.5 rounded-xl transition-all duration-200"';

if (content.includes(oldOnMouseLeave)) {
  content = content.replace(oldOnMouseLeave, newOnMouseLeave);
  console.log("onClick binding injected:", content.includes("onClick={(e) => handleOAuthLogin"));
} else {
  console.log("Could not find button to inject onClick!");
  // Show what we have around that area
  const idx = content.indexOf('onMouseLeave={() => setHovSocial');
  if (idx >= 0) {
    console.log("Found setHovSocial at index:", idx);
    console.log("Context:\n" + JSON.stringify(content.substring(idx, idx+250)));
  }
}

fs.writeFileSync('src/components/ui/animated-characters-login-page.tsx', content, 'utf8');
