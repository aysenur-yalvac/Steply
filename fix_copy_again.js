const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace handleSimpleCopy
content = content.replace(
  /const handleSimpleCopy = \(e: React\.MouseEvent, text: string, isLink: boolean\) => \{[\s\S]*?^\s*\};/m,
  `const handleSimpleCopy = (e: React.MouseEvent, text: string, isLink: boolean) => {
      e.preventDefault();
      e.stopPropagation();
  
      const cleanText = text?.trim();
      if (!cleanText || cleanText === "KOD BULUNAMADI" || cleanText.includes("undefined")) {
        console.warn("Kopyalanacak geçerli kod bulunamadı:", text);
        return;
      }
  
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(cleanText);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = cleanText;
        textArea.style.position = "fixed";
        textArea.style.left = "-9999px";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
  
      if (isLink) {
        setCopiedLink(true);
        setTimeout(() => setCopiedLink(false), 2000);
      } else {
        setCopiedCode(true);
        setTimeout(() => setCopiedCode(false), 2000);
      }
    };`
);

// Update code tab code display
content = content.replace(
  /\{inviteData\.code \|\| "STP-A2C4"\}/g,
  `{project?.invite_code || inviteData?.code || "STP-A2C4"}`
);

// Update code button onClick
content = content.replace(
  /onClick=\{\(e\) => handleSimpleCopy\(e, inviteData\.code \|\| '', false\)\}/g,
  `onClick={(e) => handleSimpleCopy(e, project?.invite_code || inviteData?.code || '', false)}`
);

// Update link button onClick
content = content.replace(
  /onClick=\{\(e\) => handleSimpleCopy\(e, `\$\{typeof window !== "undefined" \? window\.location\.origin : ""\}\/join\/\$\{inviteData\.token\}`,\s*true\)\}/g,
  `onClick={(e) => handleSimpleCopy(e, \`\${typeof window !== "undefined" ? window.location.origin : ""}/join/\${project?.invite_token || inviteData?.token}\`, true)}`
);

// Update link tab input
content = content.replace(
  /value=\{inviteData\.token \? /g,
  `value={(project?.invite_token || inviteData?.token) ? `
);
content = content.replace(
  /\/join\/\$\{inviteData\.token\}` : ""\}/g,
  `/join/\${project?.invite_token || inviteData?.token}\` : ""}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed simple copy logic and fallback values');
