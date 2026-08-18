const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// Replace the return block in NAV_ITEMS.map
const oldReturnBlock = `              return collapsed ? (
                <Link key={label} href={href} onClick={onClose} title={label} className={\`w-full flex items-center justify-center py-2.5 rounded-xl transition-all duration-150 \${isActive ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}\`}>
                  <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                </Link>
              ) : (
                <Link key={label} href={href} onClick={onClose} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group \${isActive ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}\`}>
                  <Icon className={\`w-5 h-5 shrink-0 \${isActive ? "text-white" : "group-hover:scale-110 transition-transform"}\`} strokeWidth={isActive ? 2 : 1.5} />
                  {label}
                </Link>
              );`;

const newReturnBlock = `              const isMessages = href === '/dashboard/messages' || label.toLowerCase().includes('message');
              
              return collapsed ? (
                <Link key={label} href={href} onClick={onClose} title={label} className={\`w-full flex items-center justify-center py-2.5 rounded-xl transition-all duration-150 \${isActive ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}\`}>
                  <div className="relative flex items-center justify-center">
                    <Icon className="w-5 h-5 shrink-0" strokeWidth={isActive ? 2 : 1.5} />
                    {isMessages && localUnreadChatCount > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full px-1 shadow-sm border border-white">
                        {localUnreadChatCount > 9 ? '9+' : localUnreadChatCount}
                      </span>
                    )}
                  </div>
                </Link>
              ) : (
                <Link key={label} href={href} onClick={onClose} className={\`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150 group \${isActive ? "bg-violet-600 text-white shadow-md shadow-violet-200" : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"}\`}>
                  <Icon className={\`w-5 h-5 shrink-0 \${isActive ? "text-white" : "group-hover:scale-110 transition-transform"}\`} strokeWidth={isActive ? 2 : 1.5} />
                  <span>{label}</span>
                  {isMessages && localUnreadChatCount > 0 && (
                    <span className="ml-auto bg-rose-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                      {localUnreadChatCount > 9 ? '9+' : localUnreadChatCount}
                    </span>
                  )}
                </Link>
              );`;

content = content.replace(oldReturnBlock, newReturnBlock);

// Replace state logic perfectly
const oldStateBlock = `  const [localUnreadChatCount, setLocalUnreadChatCount] = useState(unreadChatCount || 0);

  useEffect(() => {
    setLocalUnreadChatCount(unreadChatCount || 0);
  }, [unreadChatCount]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.action === 'read_chat') {
        setLocalUnreadChatCount((prev) => Math.max(0, prev - 1));
      } else if (e.detail?.action === 'new_unread_chat') {
        setLocalUnreadChatCount((prev) => prev + 1);
      }
    };
    window.addEventListener('unread-chats-updated', handler);
    return () => window.removeEventListener('unread-chats-updated', handler);
  }, []);`;

const newStateBlock = `  const [localUnreadChatCount, setLocalUnreadChatCount] = useState(unreadChatCount || 0);

  useEffect(() => {
    setLocalUnreadChatCount(unreadChatCount || 0);
  }, [unreadChatCount]);

  useEffect(() => {
    const handleUpdate = () => {
      setLocalUnreadChatCount((prev) => Math.max(0, prev - 1));
    };
    window.addEventListener('unread-chats-updated', handleUpdate);
    return () => window.removeEventListener('unread-chats-updated', handleUpdate);
  }, []);`;

content = content.replace(oldStateBlock, newStateBlock);

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log("Replaced NAV_ITEMS.map logic and State logic.");
