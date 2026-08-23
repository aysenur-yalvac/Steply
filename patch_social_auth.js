const fs = require("fs");
let content = fs.readFileSync("src/components/auth/SocialAuthRow.tsx", "utf8");

// Add import
content = content.replace('import { useState } from "react";', 'import { useState } from "react";\nimport { createClient } from "@/utils/supabase/client";');

// Insert handleOAuthLogin inside the component
const oldComponentStart = `export default function SocialAuthRow() {
  const [hovered, setHovered] = useState<string | null>(null);`;

const newComponentStart = `export default function SocialAuthRow() {
  const [hovered, setHovered] = useState<string | null>(null);

  const handleOAuthLogin = async (providerId: string) => {
    // LinkedIn doesn't map directly in supabase without proper setup, but we'll pass providerId
    // as it is. Supabase accepts "google", "github", etc.
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: providerId as any,
      options: {
        redirectTo: \`\${window.location.origin}/auth/callback\`,
      },
    });

    if (error) {
      alert(\`\${providerId} giris hatasi: \${error.message}\`);
    }
  };`;

content = content.replace(oldComponentStart, newComponentStart);

// Attach to onClick
const oldButton = `onMouseLeave={() => setHovered(null)}
              className="flex items-center justify-center py-3 rounded-xl transition-all duration-200"`;

const newButton = `onMouseLeave={() => setHovered(null)}
              onClick={() => handleOAuthLogin(s.id)}
              className="flex items-center justify-center py-3 rounded-xl transition-all duration-200"`;

content = content.replace(oldButton, newButton);

fs.writeFileSync("src/components/auth/SocialAuthRow.tsx", content, "utf8");
console.log("Updated SocialAuthRow.tsx");
