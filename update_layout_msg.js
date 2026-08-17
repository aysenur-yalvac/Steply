const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/layout.tsx', 'utf8');

const oldMsgCount = `    supabase
      .from('messages')
      .select('id', { count: 'exact', head: true })
      .eq('receiver_id', user.id)
      .eq('is_read', false),`;

const newMsgCount = `    supabase
      .from('messages')
      .select('sender_id')
      .eq('receiver_id', user.id)
      .eq('is_read', false),`;

content = content.replace(oldMsgCount, newMsgCount);

const oldCountCount = `const unreadCount = unreadResult.status === 'fulfilled' ? (unreadResult.value.count ?? 0) : 0;`;
const newCountCount = `const unreadCount = unreadResult.status === 'fulfilled' && unreadResult.value.data ? new Set(unreadResult.value.data.map(m => m.sender_id)).size : 0;`;

content = content.replace(oldCountCount, newCountCount);

fs.writeFileSync('src/app/dashboard/layout.tsx', content, 'utf8');
console.log("Updated layout.tsx for distinct unread messages count");
