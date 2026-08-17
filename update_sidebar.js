const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

content = content.replace(
  /unreadCount = 0,/,
  `unreadCount = 0,`
);

content = content.replace(
  /const \[isMobileOpen, setIsMobileOpen\] = useState\(false\);/,
  `const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount);

  useEffect(() => {
    setLocalUnreadCount(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    const handler = (e: any) => {
      if (e.detail?.action === 'read_chat') {
        setLocalUnreadCount((prev) => Math.max(0, prev - 1));
      } else if (e.detail?.action === 'new_unread_chat') {
        setLocalUnreadCount((prev) => prev + 1);
      }
    };
    window.addEventListener('chat-update', handler);
    return () => window.removeEventListener('chat-update', handler);
  }, []);`
);

content = content.replace(
  /unreadCount > 0 && \(/,
  `localUnreadCount > 0 && (`
);

content = content.replace(
  /unreadCount > 9 \? "9\+" \: unreadCount/g,
  `localUnreadCount > 9 ? "9+" : localUnreadCount`
);

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log("Updated DashboardSidebar.tsx with localUnreadCount");
