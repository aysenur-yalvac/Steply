const fs = require('fs');
let path = 'src/components/dashboard/DashboardViewSwitcher.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Remove JoinProjectModal import and usage
content = content.replace(/import JoinProjectModal from '\.\/JoinProjectModal';\n/, '');
content = content.replace(/\{isJoinModalOpen && <JoinProjectModal isOpen=\{isJoinModalOpen\} onClose=\{\(\) => setIsJoinModalOpen\(false\)\} \/>\}/g, '');

// 2. Add joinCodeInput state and handleJoinProjectSubmit to DashboardViewSwitcher
content = content.replace(
  /const \[isJoinModalOpen, setIsJoinModalOpen\] = useState\(false\);/,
  `const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  const handleJoinProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    setIsJoining(true);
    try {
      const { joinProjectWithCodeAction } = await import('@/app/dashboard/actions');
      const { toast } = await import('react-hot-toast');
      const result = await joinProjectWithCodeAction(joinCodeInput.trim().toUpperCase());
      if (!result.success) {
        toast.error(result.error || 'Katılım başarısız oldu.');
      } else {
        toast.success('Projeye başarıyla katıldınız!');
        setIsJoinModalOpen(false);
        if (result.projectId) {
          window.location.href = \`/dashboard/projects/\${result.projectId}\`;
        }
      }
    } catch (err: any) {
      console.error(err);
      alert('Katılım başarısız oldu.');
    } finally {
      setIsJoining(false);
    }
  };`
);

// 3. Inject the inline modal at the very end of the main return
const inlineModal = `
      {isJoinModalOpen && (
        <div 
          className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4"
          style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 999999 }}
        >
          <div className="bg-slate-900 border border-slate-700 p-6 rounded-2xl w-full max-w-md relative shadow-2xl">
            <button 
              type="button" 
              onClick={() => setIsJoinModalOpen(false)}
              className="absolute top-4 right-4 text-white text-xl font-bold p-2 hover:text-slate-300"
            >
              ✕
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Projeye Katıl</h3>
            <p className="text-sm text-slate-400 mb-4">6 haneli katılım kodunu giriniz.</p>
            
            <form onSubmit={handleJoinProjectSubmit} className="space-y-4">
              <input 
                type="text" 
                placeholder="STP-A2C4" 
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-full bg-slate-800 border border-slate-600 rounded-xl p-3 text-white text-center font-mono text-lg focus:outline-none focus:border-indigo-500"
                autoFocus
              />
              <button 
                type="submit"
                disabled={isJoining}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-xl"
              >
                {isJoining ? 'Katılınıyor...' : 'Katıl'}
              </button>
            </form>
          </div>
        </div>
      )}
`;

content = content.replace(
  /<\/AnimatePresence>\n\s*<\/div>\n\s*<\/div>\n\s*<\/>\n\s*\);\n\}/,
  `</AnimatePresence>\n      </div>\n    </div>\n${inlineModal}\n    </>\n  );\n}`
);

fs.writeFileSync(path, content, 'utf8');
console.log('Inlined modal and states');
