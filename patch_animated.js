const fs = require("fs");
let content = fs.readFileSync("src/components/ui/animated-characters-login-page.tsx", "utf8");

const oldComponentStart = `export default function AnimatedCharactersLoginPage({
  mode,
  message,
  linkAccount,
  ownerId,
}: {
  mode: Mode;
  message?: string;
  linkAccount?: boolean;
  ownerId?: string;
}) {
  const isLogin = mode === "login";
  const router  = useRouter();`;

const newComponentStart = `export default function AnimatedCharactersLoginPage({
  mode,
  message,
  linkAccount,
  ownerId,
}: {
  mode: Mode;
  message?: string;
  linkAccount?: boolean;
  ownerId?: string;
}) {
  const isLogin = mode === "login";
  const router  = useRouter();
  
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

content = content.replace(oldComponentStart, newComponentStart);

const oldButton = `onMouseLeave={() => setHovSocial(null)}
                  className="flex items-center justify-center py-2.5 rounded-xl transition-all duration-200"`;

const newButton = `onMouseLeave={() => setHovSocial(null)}
                  onClick={(e) => handleOAuthLogin(e, s.id)}
                  className="flex items-center justify-center py-2.5 rounded-xl transition-all duration-200"`;

content = content.replace(oldButton, newButton);

fs.writeFileSync("src/components/ui/animated-characters-login-page.tsx", content, "utf8");
console.log("Updated animated login page");
