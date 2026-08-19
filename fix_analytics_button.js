const fs = require('fs');
let path = 'src/components/projects/ProjectTabsWrapper.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('>Analizler<')) {
    let parts = content.split('          {showNotesTab && (');
    if (parts.length > 1) {
        let insert = `
          <button
            onClick={() => setActiveTab('analytics')}
            className={\`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-all duration-300 \${activeTab === 'analytics' ? 'bg-indigo-50 dark:bg-slate-800 text-indigo-700 dark:text-slate-200' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-300'}\`}
          >
            <LineChart className={\`w-4 h-4 \${activeTab === 'analytics' ? 'text-indigo-500 dark:text-indigo-400' : ''}\`} />
            Analizler
          </button>
          
          {showNotesTab && (`;
        content = parts[0] + insert + parts.slice(1).join('          {showNotesTab && (');
        fs.writeFileSync(path, content, 'utf8');
        console.log('Added Analizler button');
    }
}
