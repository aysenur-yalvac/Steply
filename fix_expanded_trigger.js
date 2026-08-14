const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// Fix the expanded trigger button (ChevronsUpDown) to capture rect
content = content.replace(
  `<button
                type="button"
                onClick={() => setIsAccountMenuOpen(o => !o)}
                className="shrink-0 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                title="Hesap değiştir"
              >
                <ChevronsUpDown className="w-4 h-4" />
              </button>`,
  `<button
                ref={triggerRef}
                type="button"
                onClick={() => {
                  const rect = triggerRef.current?.getBoundingClientRect();
                  setPopoverAnchor(rect ?? null);
                  setIsAccountMenuOpen(o => !o);
                }}
                className="shrink-0 p-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                title="Hesap değiştir"
              >
                <ChevronsUpDown className="w-4 h-4" />
              </button>`
);

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Fixed expanded trigger to capture rect');
