const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// The loop starts at `{NAV_ITEMS.map((item) => {` and ends before `</nav>`
// We need to inject state for open submenus.
// Add state to NavContent component:
content = content.replace('export function NavContent({', 'export function NavContent({\n  onClose,\n  onOpenWatchlist,\n  collapsed,\n  onToggleExpand,\n}: {\n  onClose: () => void;\n  onOpenWatchlist: () => void;\n  collapsed?: boolean;\n  onToggleExpand?: () => void;\n}) {\n  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});\n  const toggleMenu = (label: string) => setOpenMenus(p => ({...p, [label]: !p[label]}));');

// Remove old props definition:
content = content.replace(/export function NavContent\(\{[^\}]+\}\s*:\s*\{[^\}]+\}\)\s*\{/g, 'export function NavContent({ onClose, onOpenWatchlist, collapsed, onToggleExpand }: { onClose: () => void; onOpenWatchlist: () => void; collapsed?: boolean; onToggleExpand?: () => void; }) {');
// I need to be careful with the replacement. Let me do it safer.
