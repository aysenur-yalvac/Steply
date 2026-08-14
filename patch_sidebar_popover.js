const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// 1. Add useEffect to close popover when collapsed changes
const closedEffect = `
  // Close account menu when sidebar collapses/expands
  useEffect(() => {
    setIsAccountMenuOpen(false);
  }, [collapsed]);
`;

content = content.replace(
  '// Re-fetch every time the user opens the dropdown.\n  useEffect(() => { if (isAccountMenuOpen) refreshAccounts(); }, [isAccountMenuOpen]);',
  '// Re-fetch every time the user opens the dropdown.\n  useEffect(() => { if (isAccountMenuOpen) refreshAccounts(); }, [isAccountMenuOpen]);\n' + closedEffect
);

// 2. Fix the collapsed popover panel: ensure it uses fixed positioning in collapsed mode 
// so it never gets clipped inside the narrow sidebar
content = content.replace(
  `<div className={\`absolute z-[100] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden w-64 \${
              collapsed
                ? 'bottom-0 left-[calc(100%+8px)]'   // collapsed: opens to the right
                : 'bottom-[calc(100%+8px)] left-0 right-0 w-auto' // expanded: opens above
            }\`}>`,
  `<div className={\`z-[100] bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden w-64 \${
              collapsed
                ? 'fixed bottom-6 left-[72px]'   // collapsed: fixed to escape sidebar clip
                : 'absolute bottom-[calc(100%+8px)] left-0 right-0 w-auto' // expanded: opens above
            }\`}>`
);

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Fixed popover positioning and collapse close effect');
