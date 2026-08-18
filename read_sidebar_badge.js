const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const subset = content.split('\n').filter(line => line.includes('unreadCount') || line.includes('unreadChatCount') || line.includes('hasBadge'));
console.log(subset.join('\n'));
