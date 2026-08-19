const fs = require('fs');
const path = 'src/components/projects/ProjectEditableContent.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add new state for the active tab inside the component
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

// 2. Add icon imports
content = content.replace(
  /import \{([^}]+)\} from "lucide-react";/,
  `import {$1, Link as LinkIcon, Key, Copy, Check as CheckIcon } from "lucide-react";`
);

// 3. Replace the showMemberPanel rendering to include Tabs and the new UI.
const panelStartRegex = /\{showMemberPanel && isOwner && \(\s*<div className="mt-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col gap-3">/;

const newPanelContent = `{showMemberPanel && isOwner && (
            <div className="mt-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-3">
              <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl">
                <button type="button" onClick={() => setInviteTab('search')} className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all \${inviteTab === 'search' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}\`}>Arama</button>
                <button type="button" onClick={() => setInviteTab('link')} className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all \${inviteTab === 'link' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}\`}>Bağlantı</button>
                <button type="button" onClick={() => setInviteTab('code')} className={\`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all \${inviteTab === 'code' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-100' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}\`}>Kod</button>
              </div>

              {inviteTab === 'search' && (
                <>
`;

content = content.replace(panelStartRegex, newPanelContent);

// 4. Find the end of the search panel and close the search tab, then render the link and code tabs.
// The search panel ends before `</div>` that closes `showMemberPanel`.
// The end is near `{/* End Search panel */}` or just before the `</div>` closing `showMemberPanel`.
// I will just use regex to insert before `</div>\n          )}`

const panelEndRegex = /\s*<\/div>\n\s*\)}/g;

// Since there could be multiple such ends, we'll replace the last match of it inside the Team Members card.
// Let's replace the EXACT block instead.
// I'll extract everything between `<div className="mt-4 p-4...` and `)}` and replace it properly.
