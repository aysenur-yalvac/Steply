const fs = require('fs');
let path = 'src/components/projects/ProjectTabsWrapper.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('ProjectAnalytics')) {
    content = content.replace(
      /import \{ Layers, Users, CheckSquare, FileText, MessageSquare \} from 'lucide-react';/,
      `import { Layers, Users, CheckSquare, FileText, MessageSquare, LineChart } from 'lucide-react';\nimport ProjectAnalytics from '@/components/projects/ProjectAnalytics';`
    );

    content = content.replace(
      /type TabType = 'overview' \| 'team' \| 'milestones' \| 'files' \| 'notes';/,
      `type TabType = 'overview' | 'team' | 'milestones' | 'files' | 'notes' | 'analytics';`
    );

    // Add Analytics tab to the navigation
    content = content.replace(
      /\{showNotesTab && \(\s*<button\s*onClick=\{.*?\}\s*className=\{.*?\}\s*>\s*<MessageSquare className=\{.*?\} \/>\n\s*Notlar & De-erlendirme\n\s*<\/button>\n\s*\)\}/,
      `{showNotesTab && (
            <button
              onClick={() => setActiveTab('notes')}
              className={\`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 \${activeTab === 'notes' ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-slate-200' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300'}\`}
            >
              <MessageSquare className={\`w-4 h-4 \${activeTab === 'notes' ? 'text-indigo-500 dark:text-indigo-400' : ''}\`} />
              Notlar & Değerlendirme
            </button>
          )}

          <button
            onClick={() => setActiveTab('analytics')}
            className={\`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 \${activeTab === 'analytics' ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-slate-200' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300'}\`}
          >
            <LineChart className={\`w-4 h-4 \${activeTab === 'analytics' ? 'text-indigo-500 dark:text-indigo-400' : ''}\`} />
            Analizler
          </button>`
    );

    // Render Analytics content
    content = content.replace(
      /\{activeTab === 'notes' && showNotesTab && \(\s*<motion.div.*?<\/motion.div>\s*\)\}/s,
      `{activeTab === 'notes' && showNotesTab && (
            <motion.div
              key="notes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {notesContent}
            </motion.div>
          )}
          
          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {projectId ? <ProjectAnalytics projectId={projectId} /> : <div className="text-slate-500">Proje bilgisi bulunamadı.</div>}
            </motion.div>
          )}`
    );
    
    fs.writeFileSync(path, content, 'utf8');
    console.log('Added Analytics tab to ProjectTabsWrapper');
}
