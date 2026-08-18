const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const regex = /const \[openMenus, setOpenMenus\] = useState<Record<string, boolean>>\(\{\}\);/;
const replacement = `const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({});
  const [localUnreadCount, setLocalUnreadCount] = useState(unreadCount || 0);

  useEffect(() => {
    setLocalUnreadCount(unreadCount || 0);
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
  }, []);`;
content = content.replace(regex, replacement);

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log("Injected localUnreadCount into NavContent");
