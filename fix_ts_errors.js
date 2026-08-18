const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const regex1 = /const hasBadge = label === "Messages" && \(localUnreadCount \|\| unreadCount\) > 0;/g;
const replacement1 = 'const hasBadge = label === "Messages" && (localUnreadCount ?? unreadCount ?? 0) > 0;';
content = content.replace(regex1, replacement1);

const regex2 = /const badgeCount = label === "Messages" \? \(\(localUnreadCount \|\| unreadCount\) > 9 \? "9\+" : \(localUnreadCount \|\| unreadCount\)\) : null;/g;
const replacement2 = 'const badgeCount = label === "Messages" ? ((localUnreadCount ?? unreadCount ?? 0) > 9 ? "9+" : (localUnreadCount ?? unreadCount ?? 0)) : null;';
content = content.replace(regex2, replacement2);

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log("Fixed undefined errors in DashboardSidebar");
