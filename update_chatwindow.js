const fs = require('fs');
let content = fs.readFileSync('src/components/social/ChatWindow.tsx', 'utf8');

// 1. Add markMessagesAsReadAction to the import statement
content = content.replace(
  /getMessagesAction, sendMessageAction, getUserProjectsAction, Message/,
  'getMessagesAction, sendMessageAction, getUserProjectsAction, markMessagesAsReadAction, Message'
);

// 2. Add useRouter
if (!content.includes('import { useRouter } from')) {
  content = content.replace(
    /import \{ toast \} from 'react-hot-toast';/,
    `import { toast } from 'react-hot-toast';\nimport { useRouter } from 'next/navigation';`
  );
}

// 3. Inside ChatWindow, call markAsRead
content = content.replace(
  /const supabase = createClient\(\);/,
  `const supabase = createClient();\n  const router = useRouter();`
);

// Inside loadMessages:
content = content.replace(
  /const data = await getMessagesAction\(selectedUser\.id\);\n\s*setMessages\(data\);/,
  `const data = await getMessagesAction(selectedUser.id);
        setMessages(data);
        // Mark messages as read and refresh to update global badge
        const readResult = await markMessagesAsReadAction(selectedUser.id);
        if (readResult.success) {
          router.refresh();
        }`
);

fs.writeFileSync('src/components/social/ChatWindow.tsx', content, 'utf8');
console.log("Updated ChatWindow.tsx to call markMessagesAsReadAction");
