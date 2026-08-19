const fs = require('fs');
let path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('setInviteTab')) {
    content = content.replace(
      /const \[isLeaving,\s*setIsLeaving\]\s*=\s*useState\(false\);/,
      `const [isLeaving, setIsLeaving] = useState(false);
    const [inviteTab, setInviteTab] = useState<'search' | 'link' | 'code'>('search');
    const [copied, setCopied] = useState(false);
    
    const handleCopy = (text: string) => {
      navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Kopyalandı!");
      setTimeout(() => setCopied(false), 2000);
    };
  `
    );

    content = content.replace(
      /import \{([^}]+)\} from "lucide-react";/,
      `import {$1, Link as LinkIcon, Key, Copy, Check as CheckIcon } from "lucide-react";`
    );

    let parts = content.split('{/* Step 1');
    let part0 = parts[0];
    let part1 = '{/* Step 1' + parts.slice(1).join('{/* Step 1');

    part0 = part0.replace(
      /\{showMemberPanel && isOwner && \(\s*<div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3">/,
      `{showMemberPanel && isOwner && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-[#1a2234] rounded-2xl border border-slate-200 dark:border-slate-700/60 flex flex-col gap-3 shadow-[0_12px_30px_rgba(0,0,0,0.7)]">
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900/50 rounded-xl">
                <button type="button" onClick={() => setInviteTab('search')} className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all \${inviteTab === 'search' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}\`}>Arama</button>
                <button type="button" onClick={() => setInviteTab('link')} className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all \${inviteTab === 'link' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}\`}>Bağlantı</button>
                <button type="button" onClick={() => setInviteTab('code')} className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all \${inviteTab === 'code' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}\`}>Kod</button>
              </div>

              {inviteTab === 'search' && (
                <>`
    );

    let endSearch = part1.indexOf('</div>\n          )}');
    let inviteUrl = '`${typeof window !== "undefined" ? window.location.origin : ""}/dashboard/projects?join=${project.invite_token}`';
    
    let tabContents = `
                </>
              )}

              {inviteTab === 'link' && (
                <div className="flex flex-col items-center justify-center p-4 py-6 text-center gap-3">
                  <div className="w-12 h-12 bg-indigo-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-indigo-500 dark:text-slate-200 border border-indigo-100 dark:border-slate-700/80">
                    <LinkIcon className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Davet Bağlantısı</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Bu bağlantıyı paylaşarak ekibinizin projeye tek tıkla katılmasını sağlayabilirsiniz.</p>
                  
                  <div className="flex items-center w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
                    <input type="text" readOnly value={${inviteUrl}} className="flex-1 bg-transparent px-3 py-2 text-xs text-slate-600 dark:text-slate-300 outline-none truncate" />
                    <button type="button" onClick={() => handleCopy(${inviteUrl})} className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 transition-colors flex items-center justify-center shrink-0">
                      {copied ? <CheckIcon className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {inviteTab === 'code' && (
                <div className="flex flex-col items-center justify-center p-4 py-6 text-center gap-3">
                  <div className="w-12 h-12 bg-amber-50 dark:bg-slate-800 rounded-full flex items-center justify-center text-amber-500 dark:text-slate-200 border border-amber-100 dark:border-slate-700/80">
                    <Key className="w-6 h-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-100">Katılım Kodu</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">Ekip üyeleri Dashboard üzerinden bu 6 haneli kodu girerek projeye katılabilir.</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="text-3xl font-black text-slate-800 dark:text-slate-100 tracking-[0.2em] bg-white dark:bg-slate-900 px-6 py-3 rounded-xl border border-slate-200 dark:border-slate-700">
                      {project.invite_code || '------'}
                    </div>
                    <button type="button" onClick={() => handleCopy(project.invite_code || '')} className="w-12 h-12 rounded-xl bg-indigo-500 hover:bg-indigo-600 text-white transition-colors flex items-center justify-center shrink-0">
                      {copied ? <CheckIcon className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              )}
`;
    
    part1 = part1.substring(0, endSearch) + tabContents + part1.substring(endSearch);

    fs.writeFileSync(path, part0 + part1, 'utf8');
    console.log('Modified ProjectEditableContent.tsx');
}
