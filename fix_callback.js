const fs = require('fs');
const path = require('path');
const file = path.resolve('src/app/auth/callback/route.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  `const classification = classifyEmail(data.user.email);
      if (classification.role !== null) {
        const updates: Record<string, string> = { role: classification.role };`,
  `// Mevcut profili cek, ogretmense ezme
      const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single();
      const currentRole = profile?.role;
      
      const classification = classifyEmail(data.user.email);
      
      let newRole = classification.role;
      // Eger kullanici zaten ogretmense, onu student/null yapma
      if (currentRole === "teacher") {
        newRole = "teacher";
      }

      if (newRole !== null) {
        const updates: Record<string, string> = { role: newRole };`
);

fs.writeFileSync(file, content, 'utf8');
