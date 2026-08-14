const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// I will insert it right before `return (` in NavContent, or at the start of NavContent.
// The signature of NavContent might be:
// export function NavContent({ onClose, onOpenWatchlist, collapsed, onToggleExpand }: { onClose: () => void; onOpenWatchlist: () => void; collapsed?: boolean; onToggleExpand?: () => void; }) {
content = content.replace(/export function NavContent[^{]+\{/, 
  "export function NavContent({ onClose, onOpenWatchlist, collapsed, onToggleExpand }: { onClose: () => void; onOpenWatchlist: () => void; collapsed?: boolean; onToggleExpand?: () => void; }) {\n  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});\n  const toggleMenu = (label: string) => setOpenMenus(p => ({...p, [label]: !p[label]}));\n");

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Added openMenus state');
