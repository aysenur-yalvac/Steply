const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// Import UnreadMessagesBadge
const importRegex = /import WatchlistDrawer from "@\/components\/dashboard\/WatchlistDrawer";/;
content = content.replace(importRegex, 'import WatchlistDrawer from "@/components/dashboard/WatchlistDrawer";\nimport UnreadMessagesBadge from "@/components/dashboard/UnreadMessagesBadge";');

// Remove unreadCount from SidebarProps
content = content.replace(/unreadChatCount\?: number;\n/g, "");

// Remove unreadCount from DashboardSidebar arguments and NavContent arguments
content = content.replace(/unreadChatCount,\n/g, "");

// Remove state and event listener logic in NavContent
const stateRegex = /const \[unreadCount, setUnreadCount\] = useState\(unreadChatCount \|\| 0\);\s*useEffect\(\(\) => \{\s*setUnreadCount\(unreadChatCount \|\| 0\);\s*\}, \[unreadChatCount\]\);\s*useEffect\(\(\) => \{\s*const handleUpdate = \(\) => \{\s*setUnreadCount\(\(prev\) => Math\.max\(0, prev - 1\)\);\s*\};\s*window\.addEventListener\('unread-chats-updated', handleUpdate\);\s*return \(\) => window\.removeEventListener\('unread-chats-updated', handleUpdate\);\s*\}, \[\]\);/g;
content = content.replace(stateRegex, "");

// Replace the return block in NAV_ITEMS.map
const returnBlockRegex = /const isMessages = href === '\/dashboard\/messages' \|\| label\.toLowerCase\(\)\.includes\('message'\);\s*return collapsed \? \([\s\S]*?\) : \([\s\S]*?\);/g;
const newReturnBlock = `const isMessages = href === '/dashboard/messages' || label.toLowerCase().includes('message');
              
              return collapsed ? (
                <Link key={label} href={href} onClick={onClose} title={label} className={\`w-full flex items-center justify-center py-2.5 rounded-xl transition-all duration-150 \${isActive ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}\`}>
                  <div className="relative flex items-center justify-center">
                    <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                    {isMessages && <UnreadMessagesBadge collapsed={true} />}
                  </div>
                </Link>
              ) : (
                <Link key={label} href={href} onClick={onClose} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group \${isActive ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}\`}>
                  <Icon className={\`w-5 h-5 shrink-0 \${isActive ? "text-white" : "group-hover:scale-110 transition-transform"}\`} strokeWidth={isActive ? 2 : 1.5} />
                  <span>{label}</span>
                  {isMessages && <UnreadMessagesBadge collapsed={false} />}
                </Link>
              );`;
content = content.replace(returnBlockRegex, newReturnBlock);

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log("Updated DashboardSidebar.tsx");
