const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure imports
if (!content.includes('useEffect')) {
  content = content.replace(/import \{ useState, useTransition, useRef \} from "react";/, `import { useState, useTransition, useRef, useEffect } from "react";`);
}
if (!content.includes('generateProjectInviteAction')) {
  content = content.replace(/} from "@\/app\/dashboard\/actions";/, `, generateProjectInviteAction } from "@/app/dashboard/actions";`);
}

// Add state and effect
content = content.replace(
  /const \[copied, setCopied\] = useState\(false\);/,
  `const [copied, setCopied] = useState(false);
  const [inviteData, setInviteData] = useState({ code: project.invite_code || null, token: project.invite_token || null });
  const [isLoadingInvite, setIsLoadingInvite] = useState(false);

  useEffect(() => {
    let mounted = true;
    if (isOwner && !project.invite_code && !inviteData.code && !isLoadingInvite) {
      setIsLoadingInvite(true);
      generateProjectInviteAction(project.id).then((res) => {
        if (!mounted) return;
        if ('success' in res && res.success) {
          setInviteData({ code: res.invite_code, token: res.invite_token });
        }
        setIsLoadingInvite(false);
      });
    }
    return () => { mounted = false; };
  }, [isOwner, project.id, project.invite_code, inviteData.code, isLoadingInvite]);`
);

// Update copy function styling
content = content.replace(
  /toast\.success\("Kopyalandı!"\);/,
  `toast.success(text.includes('join') ? "✅ Bağlantı Kopyalandı!" : "✅ Davet Kodu Kopyalandı!", {
          style: {
            background: '#0f172a',
            color: '#f1f5f9',
            border: '1px solid #334155',
          },
        });`
);

// Fix link tab UI
content = content.replace(
  /<input type="text" readOnly value=\{\`\$\{typeof window !== "undefined" \? window\.location\.origin : ""\}\/join\/\$\{project\.invite_token\}\`\} className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-600 dark:text-slate-300 outline-none truncate" \/>/g,
  `<input type="text" readOnly value={inviteData.token ? \`\${typeof window !== "undefined" ? window.location.origin : ""}/join/\${inviteData.token}\` : ""} placeholder="https://steply-app.vercel.app/join/..." className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-600 dark:text-slate-300 outline-none truncate" />`
);
content = content.replace(
  /onClick=\{\(\) => \{\s*if \(!project\.invite_token\) \{\s*toast\.error\("Davet bağlantısı hazırlanıyor, lütfen tekrar deneyin\."\);\s*return;\s*\}\s*handleCopy\(\`\$\{typeof window !== "undefined" \? window\.location\.origin : ""\}\/join\/\$\{project\.invite_token\}\`\);\s*\}\}/g,
  `onClick={() => {
                        if (!inviteData.token) return;
                        handleCopy(\`\${typeof window !== "undefined" ? window.location.origin : ""}/join/\${inviteData.token}\`);
                      }}`
);
content = content.replace(
  /onClick=\{\(\) => handleCopy\(`\$\{typeof window !== "undefined" \? window\.location\.origin : ""\}\/join\/\$\{project\.invite_token\}`\)\}/g,
  `onClick={() => {
                        if (!inviteData.token) return;
                        handleCopy(\`\${typeof window !== "undefined" ? window.location.origin : ""}/join/\${inviteData.token}\`);
                      }}`
);

// Fix code tab UI
content = content.replace(
  /<div className="font-mono font-bold text-xl tracking-wider text-slate-100 bg-slate-800\/80 p-3 rounded-lg border border-slate-700">\s*\{project\.invite_code \|\| "KOD BULUNAMADI"\}\s*<\/div>/g,
  `<div className="font-mono font-bold text-xl tracking-wider text-slate-100 bg-slate-800/80 p-3 rounded-lg border border-slate-700">
                        {inviteData.code || "STP-A2C4"}
                      </div>`
);
content = content.replace(
  /onClick=\{\(\) => \{\s*if \(!project\.invite_code\) \{\s*toast\.error\("Davet kodu hazırlanıyor, lütfen tekrar deneyin\."\);\s*return;\s*\}\s*handleCopy\(project\.invite_code\);\s*\}\}/g,
  `onClick={() => {
                        if (!inviteData.code) return;
                        handleCopy(inviteData.code);
                      }}`
);
content = content.replace(
  /onClick=\{\(\) => handleCopy\(project\.invite_code \|\| ''\)\}/g,
  `onClick={() => {
                        if (!inviteData.code) return;
                        handleCopy(inviteData.code);
                      }}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Applied self-healing logic and polished UI');
