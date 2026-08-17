const fs = require('fs');

let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

// Update Conversation type
content = content.replace(
  /export type Conversation = \{[\s\S]*?last_message: Message;\n\};/,
  `export type Conversation = {
  other_user: {
    id: string;
    full_name: string;
    email: string;
  };
  last_message: Message;
  unread_count: number;
};`
);

// Update getRecentConversationsAction
content = content.replace(
  /const convMap = new Map<string, Conversation>\(\);[\s\S]*?return Array\.from\(convMap\.values\(\)\);/g,
  `const convMap = new Map<string, Conversation>();

  for (const msg of (messages as any[])) {
    const isSender = msg.sender_id === user.id;
    const otherUser = isSender ? msg.receiver : msg.sender;
    const otherId = otherUser.id;

    if (!convMap.has(otherId)) {
      convMap.set(otherId, {
        other_user: otherUser,
        last_message: msg as Message,
        unread_count: 0,
      });
    }

    // If it's a received message and not read, increment count
    if (!isSender && !msg.is_read) {
      const conv = convMap.get(otherId)!;
      conv.unread_count += 1;
    }
  }

  return Array.from(convMap.values());`
);

fs.writeFileSync('src/lib/social-actions.ts', content, 'utf8');
console.log("Updated social-actions.ts to calculate unread_count");
