const fs = require('fs');
let path = 'src/components/projects/ProjectTabsWrapper.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('id: \'analytics\'')) {
    content = content.replace(
      /if \(showNotesTab\) \{\s*tabs\.push\(\{ id: 'notes', label: '.*?De.erlendirme', icon: MessageSquare \}\);\s*\}/,
      `if (showNotesTab) {
      tabs.push({ id: 'notes', label: 'Notlar & Değerlendirme', icon: MessageSquare });
    }
    tabs.push({ id: 'analytics', label: 'Analizler', icon: LineChart });`
    );

    content = content.replace(
      /\{activeTab === 'notes' && showNotesTab && \(\s*<motion\.div key="notes".*?<\/motion\.div>\s*\)\}/s,
      `{activeTab === 'notes' && showNotesTab && (
              <motion.div key="notes" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {notesContent}
              </motion.div>
            )}
            {activeTab === 'analytics' && (
              <motion.div key="analytics" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }}>
                {projectId ? <ProjectAnalytics projectId={projectId} /> : <div className="text-slate-500">Proje bilgisi bulunamadı.</div>}
              </motion.div>
            )}`
    );
    
    fs.writeFileSync(path, content, 'utf8');
    console.log('Added Analytics tab to tabs array');
}
