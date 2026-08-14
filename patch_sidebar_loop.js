const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

if (!content.includes('const [openMenus')) {
  content = content.replace('export function NavContent(props: NavContentProps) {', 
    'export function NavContent(props: NavContentProps) {\n  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});\n  const toggleMenu = (label: string) => setOpenMenus(p => ({...p, [label]: !p[label]}));');
}

// Find the map loop and replace it.
const searchBlock = `
              if (isWatchlist) {
                return collapsed ? (
`;

// It's much easier to just rewrite the whole NavContent component or the loop.
// Since the file is tricky, let's just create a new component file for the Sidebar if needed, or safely patch.
// Let's use string splitting.
let start = content.indexOf('{NAV_ITEMS.map((item) => {');
let end = content.indexOf('</nav>');

let oldLoop = content.substring(start, end);

let newLoop = `{NAV_ITEMS.map((item) => {
              const { label, href, icon: Icon, subItems } = item as any;
              const isWatchlist = item.isWatchlist;
              const isTeacherOnly = item.teacherOnly;
              const isStudentOnly = item.studentOnly;
              if (isTeacherOnly && !isTeacher) return null;
              if (isStudentOnly && isTeacher) return null;
              
              const isActive = !isWatchlist && (href === "/dashboard" ? pathname === "/dashboard" : pathname.startsWith(href));
              const isOpen = openMenus[label];

              if (isWatchlist) {
                return collapsed ? (
                  <button key={label} onClick={() => { onOpenWatchlist(); onClose(); }} title={label} className="w-full flex items-center justify-center py-2.5 rounded-xl text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-all duration-150">
                    <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                  </button>
                ) : (
                  <button key={label} onClick={() => { onOpenWatchlist(); onClose(); }} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-all duration-150 group">
                    <Icon className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" strokeWidth={1.5} />
                    {label}
                  </button>
                );
              }

              if (subItems) {
                return (
                  <div key={label} className="flex flex-col gap-0.5">
                    {collapsed ? (
                      <button onClick={() => toggleMenu(label)} title={label} className={\`w-full flex items-center justify-center py-2.5 rounded-xl transition-all duration-150 \${isActive || isOpen ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}\`}>
                        <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
                      </button>
                    ) : (
                      <button onClick={() => toggleMenu(label)} className={\`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 \${isActive || isOpen ? "bg-violet-50 text-violet-700" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}\`}>
                        <div className="flex items-center gap-3">
                          <Icon className={\`w-5 h-5 shrink-0 \${isActive || isOpen ? "text-violet-600" : "text-slate-400"}\`} strokeWidth={1.5} />
                          <span>{label}</span>
                        </div>
                        <ChevronRight className={\`w-4 h-4 transition-transform \${isOpen ? "rotate-90" : ""}\`} />
                      </button>
                    )}
                    {isOpen && !collapsed && (
                      <div className="flex flex-col gap-0.5 pl-9 pr-2 py-1">
                        {subItems.map((sub: any) => (
                          <Link key={sub.href} href={sub.href} onClick={onClose} className={\`block px-3 py-2 rounded-lg text-xs font-medium transition-colors \${pathname === sub.href ? "bg-violet-100 text-violet-800" : "text-slate-500 hover:text-violet-700 hover:bg-violet-50"}\`}>
                            {sub.label}
                          </Link>
                        ))}
                      </div>
                    )}
                    {isOpen && collapsed && (
                      <div className="flex flex-col gap-1 items-center py-1">
                        {subItems.map((sub: any) => (
                          <Link key={sub.href} href={sub.href} onClick={onClose} title={sub.label} className={\`w-2 h-2 rounded-full transition-colors \${pathname === sub.href ? "bg-violet-600" : "bg-slate-300 hover:bg-violet-400"}\`} />
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              return collapsed ? (
                <Link key={label} href={href} onClick={onClose} title={label} className={\`w-full flex items-center justify-center py-2.5 rounded-xl transition-all duration-150 \${isActive ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}\`}>
                  <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                </Link>
              ) : (
                <Link key={label} href={href} onClick={onClose} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group \${isActive ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}\`}>
                  <Icon className={\`w-5 h-5 shrink-0 \${isActive ? "text-white" : "group-hover:scale-110 transition-transform"}\`} strokeWidth={isActive ? 2 : 1.5} />
                  {label}
                </Link>
              );
            })}
          `;

content = content.replace(oldLoop, newLoop);
fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Sidebar loop updated successfully');
