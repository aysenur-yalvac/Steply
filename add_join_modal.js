const fs = require('fs');
let path = 'src/components/dashboard/DashboardViewSwitcher.tsx';
let content = fs.readFileSync(path, 'utf8');

if (!content.includes('JoinProjectModal')) {
  content = content.replace(
    /import \{ Plus, Layout, AlignLeft, BarChart3, Loader2, Flag, Monitor, Tag, Search, Filter, X \} from 'lucide-react';/,
    `import { Plus, Layout, AlignLeft, BarChart3, Loader2, Flag, Monitor, Tag, Search, Filter, X, UserPlus } from 'lucide-react';
import JoinProjectModal from './JoinProjectModal';`
  );

  content = content.replace(
    /const \[activeTab, setActiveTab\] = useState<'my' \| 'collab' \| 'watched'>\('my'\);/,
    `const [activeTab, setActiveTab] = useState<'my' | 'collab' | 'watched'>('my');
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);`
  );

  content = content.replace(
    /<Link\s*href="\/dashboard\/projects\/new"\s*className="btn-aura flex items-center gap-2 text-sm font-bold text-white px-5 py-2\.5 rounded-xl shrink-0 active:scale-95 overflow-hidden"\s*>\s*<Plus className="w-4 h-4" strokeWidth=\{2\.5\} \/>\s*New\s*<\/Link>/,
    `<button
                onClick={() => setIsJoinModalOpen(true)}
                className="flex items-center gap-2 text-sm font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 px-5 py-2.5 rounded-xl shrink-0 active:scale-95 transition-colors"
              >
                <UserPlus className="w-4 h-4" />
                Katıl
              </button>
              <Link
                href="/dashboard/projects/new"
                className="btn-aura flex items-center gap-2 text-sm font-bold text-white px-5 py-2.5 rounded-xl shrink-0 active:scale-95 overflow-hidden"
              >
                <Plus className="w-4 h-4" strokeWidth={2.5} />
                New
              </Link>`
  );

  content = content.replace(
    /return \(\s*<div className="flex flex-col gap-6 w-full max-w-full">/,
    `return (
      <div className="flex flex-col gap-6 w-full max-w-full">
        {isJoinModalOpen && <JoinProjectModal onClose={() => setIsJoinModalOpen(false)} />}`
  );

  fs.writeFileSync(path, content, 'utf8');
  console.log('Added JoinProjectModal to DashboardViewSwitcher');
}
