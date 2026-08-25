const fs = require('fs');
const path = require('path');
const file = path.resolve('src/components/auth/OtpInput.tsx');
let content = fs.readFileSync(file, 'utf8');

// Update props
content = content.replace(/export default function OtpInput\(\{ email \}: \{ email: string \}\) \{/, `import { isTeacherEmail } from "@/lib/email-classification";

export default function OtpInput({ email, role = "student" }: { email: string; role?: string }) {`);

// Update logic
const oldLogic = `  const classification = classifyEmail(email);
  const isInstitutional = classification.role !== null;`;

const newLogic = `  const isTeacher = isTeacherEmail(email);`;

content = content.replace(oldLogic, newLogic);

// Update banner
const oldBanner = `      {isInstitutional && (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold"
          style={{
            background: classification.role === "teacher"
              ? "rgba(160,32,240,0.12)"
              : "rgba(34,197,94,0.10)",
            border: classification.role === "teacher"
              ? "1px solid rgba(160,32,240,0.3)"
              : "1px solid rgba(34,197,94,0.25)",
            color: classification.role === "teacher" ? "#C97EFF" : "#6EE7B7",
          }}>
          <Shield className="w-3 h-3" />
          {classification.role === "teacher"
            ? "Kurumsal ogretmen e-postasi - dogrulama sonrasi otomatik yetkilendirileceksiniz"
            : "Kurumsal ogrenci e-postasi"}
        </div>
      )}`;

const newBanner = `      {role === "teacher" && isTeacher && (
        <p className="text-xs text-amber-400 mb-4 text-center">
          Kurumsal öğretmen e-postası — doğrulama sonrası otomatik yetkilendirileceksiniz.
        </p>
      )}`;

content = content.replace(oldBanner, newBanner);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated OtpInput.");
