const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace handleCopy
content = content.replace(
  /const handleCopy = \(text: string\) => \{[\s\S]*?setTimeout\(\(\) => setCopied\(false\), 2000\);\s*\};/m,
  `const handleCopy = async (textToCopy: string, type: 'code' | 'link') => {
    if (!textToCopy) {
      toast.error("Kopyalanacak veri bulunamadı.", { style: { background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155' } });
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(textToCopy);
      } else {
        // Fallback for insecure environments
        const textArea = document.createElement("textarea");
        textArea.value = textToCopy;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      if (type === 'code') {
        toast.success("✅ Davet kodu panoya kopyalandı!", { style: { background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155' } });
      } else {
        toast.success("✅ Bağlantı panoya kopyalandı!", { style: { background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155' } });
      }
    } catch (err) {
      console.error("Kopyalama hatası:", err);
      toast.error("Kopyalama başarısız oldu, lütfen manuel seçip kopyalayın.", { style: { background: '#0f172a', color: '#f1f5f9', border: '1px solid #334155' } });
    }
  };`
);

// Replace handleCopy calls in buttons
content = content.replace(
  /onClick=\{\(\) => \{\s*if \(!inviteData\.token\) return;\s*handleCopy\(`\$\{typeof window !== "undefined" \? window\.location\.origin : ""\}\/join\/\$\{inviteData\.token\}`\);\s*\}\}/g,
  `onClick={() => {
                          if (!inviteData.token) return;
                          handleCopy(\`\${typeof window !== "undefined" ? window.location.origin : ""}/join/\${inviteData.token}\`, 'link');
                        }}`
);

content = content.replace(
  /onClick=\{\(\) => \{\s*if \(!inviteData\.code\) return;\s*handleCopy\(inviteData\.code\);\s*\}\}/g,
  `onClick={() => {
                          if (!inviteData.code) return;
                          handleCopy(inviteData.code, 'code');
                        }}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated handleCopy and buttons');
