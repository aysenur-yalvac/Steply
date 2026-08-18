const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

content = content.replace(/localUnreadChatCount/g, "unreadCount");
content = content.replace(/setLocalUnreadChatCount/g, "setUnreadCount");

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log("Renamed localUnreadChatCount to unreadCount");
