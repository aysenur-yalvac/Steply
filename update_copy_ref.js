const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// Ensure HTMLInputElement is available or just use useRef
// Add the new state and function right after handleSimpleCopy
content = content.replace(
  /const handleSimpleCopy = \(e: React\.MouseEvent, text: string, isLink: boolean\) => \{[\s\S]*?^\s*\};/m,
  `$&
  
    const codeInputRef = useRef<HTMLInputElement>(null);
    const [codeCopied, setCodeCopied] = useState(false);

    const handleCopyCode = (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();

      if (codeInputRef.current) {
        codeInputRef.current.select();
        codeInputRef.current.setSelectionRange(0, 99999);

        try {
          navigator.clipboard.writeText(codeInputRef.current.value);
        } catch (err) {
          document.execCommand('copy');
        }

        setCodeCopied(true);
        setTimeout(() => setCodeCopied(false), 2000);
      }
    };`
);

// Replace the code tab UI
content = content.replace(
  /<div className="flex items-center gap-3">\s*<div className="font-mono font-bold text-xl tracking-wider text-slate-100 bg-slate-800\/80 p-3 rounded-lg border border-slate-700">\s*\{project\?\.invite_code \|\| inviteData\?\.code \|\| "STP-A2C4"\}\s*<\/div>\s*<button type="button" onClick=\{\(e\) => handleSimpleCopy\(e, project\?\.invite_code \|\| inviteData\?\.code \|\| '', false\)\}\s*className="w-12 h-12 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-colors flex items-center justify-center shrink-0 cursor-pointer">\s*\{copiedCode \? <CheckIcon className="w-5 h-5 text-green-400 pointer-events-none" \/> : <Copy className="w-5 h-5 pointer-events-none" \/>\}\s*<\/button>\s*<\/div>/,
  `<div className="flex items-center gap-2 w-full">
                        <input
                          ref={codeInputRef}
                          type="text"
                          readOnly
                          value={project?.invite_code || inviteData?.code || ''}
                          className="font-mono font-bold text-xl tracking-wider text-slate-100 bg-slate-800/80 p-3 rounded-lg border border-slate-700 w-full select-all outline-none cursor-text"
                        />
                        <button
                          type="button"
                          onClick={handleCopyCode}
                          className="w-12 h-12 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                        >
                          {codeCopied ? (
                            <CheckIcon className="w-6 h-6 text-green-400 pointer-events-none"/>
                          ) : (
                            <Copy className="w-6 h-6 pointer-events-none"/>
                          )}
                        </button>
                      </div>`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Updated code copy logic to use ref select');
