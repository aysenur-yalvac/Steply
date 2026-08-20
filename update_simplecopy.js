const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// Replace state
content = content.replace(
  /const \[copied, setCopied\] = useState\(false\);/,
  `const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);`
);

// Replace handleCopy
content = content.replace(
  /const handleCopy = async \(textToCopy: string, type: 'code' \| 'link'\) => \{[\s\S]*?\};/m,
  `const handleSimpleCopy = (e: React.MouseEvent, text: string, isLink: boolean) => {
    e.preventDefault();
    e.stopPropagation();

    if (!text || text === "KOD BULUNAMADI" || text.includes("undefined")) return;

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text);
    } else {
      const textArea = document.createElement("textarea");
      textArea.value = text;
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

// Replace link button
content = content.replace(
  /onClick=\{\(\) => \{\s*if \(!inviteData\.token\) return;\s*handleCopy\(`\$\{typeof window !== "undefined" \? window\.location\.origin : ""\}\/join\/\$\{inviteData\.token\}`,\s*'link'\);\s*\}\}\s*className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 transition-colors flex items-center justify-center shrink-0">\s*\{copied \? <CheckIcon className="w-4 h-4" \/> : <Copy className="w-4 h-4" \/>\}/m,
  `onClick={(e) => handleSimpleCopy(e, \`\${typeof window !== "undefined" ? window.location.origin : ""}/join/\${inviteData.token}\`, true)}
                        className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 transition-colors flex items-center justify-center shrink-0 cursor-pointer">
                        {copiedLink ? <CheckIcon className="w-4 h-4 text-green-400 pointer-events-none" /> : <Copy className="w-4 h-4 pointer-events-none" />}`
);

// Replace code button
content = content.replace(
  /onClick=\{\(\) => \{\s*if \(!inviteData\.code\) return;\s*handleCopy\(inviteData\.code,\s*'code'\);\s*\}\}\s*className="w-12 h-12 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-colors flex items-center justify-center shrink-0">\s*\{copied \? <CheckIcon className="w-5 h-5" \/> : <Copy className="w-5 h-5" \/>\}/m,
  `onClick={(e) => handleSimpleCopy(e, inviteData.code || '', false)}
                        className="w-12 h-12 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer">
                        {copiedCode ? <CheckIcon className="w-5 h-5 text-green-400 pointer-events-none" /> : <Copy className="w-5 h-5 pointer-events-none" />}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated with handleSimpleCopy');
