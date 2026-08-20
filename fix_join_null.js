const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
  /<div className="flex items-center w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">[\s\S]*?<\/button>\s*<\/div>/,
  `{(() => {
                        const rawToken = project?.invite_token || inviteData?.token || '';
                        const isValidToken = rawToken && rawToken !== "null" && rawToken !== "undefined";
                        const shareUrl = isValidToken 
                          ? \`\${typeof window !== "undefined" ? window.location.origin : ""}/join/\${rawToken}\`
                          : "";

                        return (
                          <div className="flex items-center w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                            <input 
                              type="text" 
                              readOnly 
                              value={shareUrl} 
                              placeholder="https://steply-app.vercel.app/join/..." 
                              className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-600 dark:text-slate-300 outline-none truncate cursor-text" 
                            />
                            <button 
                              type="button" 
                              onClick={(e) => handleSimpleCopy(e, shareUrl, true)}
                              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 transition-colors flex items-center justify-center shrink-0 cursor-pointer"
                            >
                              {copiedLink ? <CheckIcon className="w-4 h-4 text-green-400 pointer-events-none" /> : <Copy className="w-4 h-4 pointer-events-none" />}
                            </button>
                          </div>
                        );
                      })()}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Fixed /join/null URL generation in link section');
