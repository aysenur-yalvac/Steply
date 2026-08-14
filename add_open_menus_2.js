const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// Insert useState import if missing
if (!content.includes('useState')) {
  content = content.replace('import React, {', 'import React, { useState,');
  if (!content.includes('useState')) { // if React wasn't there
    content = "import { useState } from 'react';\n" + content;
  }
}

// Find function NavContent
content = content.replace(/function NavContent\(\{/g, "function NavContent({\n  onClose,\n  onOpenWatchlist,\n  collapsed,\n  onToggleExpand,\n  ...props\n}: any) {\n  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});\n  const toggleMenu = (label: string) => setOpenMenus(p => ({...p, [label]: !p[label]}));\n  const { userName, userEmail, role, unreadCount, isTeacher, avatarUrl, linkedAccounts = [], userId } = props;\n");

// We need to be careful with the original signature!
// Original: function NavContent({ userName, userEmail, role, unreadCount, isTeacher, avatarUrl, linkedAccounts = [], userId, onClose, onOpenWatchlist, collapsed, onToggleExpand }: { ... }) {
// Since I can't write a regex that matches the whole signature easily, I'll just use string replacement.
