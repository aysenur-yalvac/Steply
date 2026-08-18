const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// Replace props definition
content = content.replace(/unreadCount\?: number;/, `unreadChatCount?: number;`);
content = content.replace(/unreadCount,/g, `unreadChatCount,`);

// Replace state
const stateRegex = /const \[localUnreadCount, setLocalUnreadCount\] = useState\(unreadCount \|\| 0\);\s*useEffect\(\(\) => \{\s*setLocalUnreadCount\(unreadCount \|\| 0\);\s*\}, \[unreadCount\]\);\s*useEffect\(\(\) => \{\s*const handler = \(e: any\) => \{\s*if \(e\.detail\?\.action === 'read_chat'\) \{\s*setLocalUnreadCount\(\(prev\) => Math\.max\(0, prev - 1\)\);\s*\} else if \(e\.detail\?\.action === 'new_unread_chat'\) \{\s*setLocalUnreadCount\(\(prev\) => prev \+ 1\);\s*\}\s*\};\s*window\.addEventListener\('chat-update', handler\);\s*return \(\) => window\.removeEventListener\('chat-update', handler\);\s*\}, \[\]\);/;
const stateReplacement = `const [localUnreadChatCount, setLocalUnreadChatCount] = useState(unreadChatCount || 0);

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
content = content.replace(stateRegex, stateReplacement);

// Replace badge rendering (Collapsed)
const badgeRegexCollapsed = /\{hasBadge && \(\s*<span className="absolute -top-1\.5 -right-1\.5 flex items-center justify-center min-w-\[16px\] h-4 bg-rose-500 text-white text-\[9px\] font-bold rounded-full px-1 shadow-sm border border-white">\s*\{badgeCount\}\s*<\/span>\s*\)\}/g;
const badgeReplacementCollapsed = `{label === "Messages" && localUnreadChatCount > 0 && (
    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full px-1 shadow-sm border border-white">
      {localUnreadChatCount > 9 ? '9+' : localUnreadChatCount}
    </span>
  )}`;
content = content.replace(badgeRegexCollapsed, badgeReplacementCollapsed);

// Replace badge rendering (Expanded)
const badgeRegexExpanded = /\{hasBadge && \(\s*<div className="flex items-center justify-center bg-rose-500 text-white text-\[10px\] font-bold px-2 py-0\.5 rounded-full min-w-\[20px\] shadow-sm">\s*\{badgeCount\}\s*<\/div>\s*\)\}/g;
const badgeReplacementExpanded = `{label === "Messages" && localUnreadChatCount > 0 && (
  <span className="flex items-center justify-center min-w-[18px] h-[18px] bg-rose-500 text-white text-[10px] font-bold rounded-full px-1 shadow-sm">
    {localUnreadChatCount > 9 ? '9+' : localUnreadChatCount}
  </span>
)}`;
content = content.replace(badgeRegexExpanded, badgeReplacementExpanded);

// Remove the old hasBadge definitions
content = content.replace(/const hasBadge = label === "Messages" && \(localUnreadCount \?\? unreadCount \?\? 0\) > 0;\n/g, "");
content = content.replace(/const badgeCount = label === "Messages" \? \(\(localUnreadCount \?\? unreadCount \?\? 0\) > 9 \? "9\+" : \(localUnreadCount \?\? unreadCount \?\? 0\)\) : null;\n/g, "");

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log("Updated DashboardSidebar.tsx with unreadChatCount");
