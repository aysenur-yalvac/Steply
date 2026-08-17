const fs = require('fs');

let content = fs.readFileSync('src/app/dashboard/messages/MessagesClient.tsx', 'utf8');

// Add formatUnreadBadge
const formatUnreadBadgeStr = `\n  const formatUnreadBadge = (count: number) => {
    if (count > 10) return '+10';
    return count.toString();
  };\n`;

content = content.replace(
  /export default function MessagesClient[\s\S]*?const router = useRouter\(\);/,
  `export default function MessagesClient({ currentUser, selectedUser, recentConversations }: MessagesClientProps) {
  const router = useRouter();${formatUnreadBadgeStr}`
);

// Add the badge rendering logic
const oldLine = `<div className="w-12 h-12 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 shadow-sm">`;

const replaceRegex = /<div className="flex flex-col overflow-hidden w-full">[\s\S]*?<\/button>/g;

content = content.replace(replaceRegex, (match) => {
    // we want to append the badge after the main text div inside the button.
    // Actually let's use a simpler string replace.
    return match.replace(
        /<\/p>\n\s*<\/div>/,
        `</p>
                    </div>
                    {/* Unread Badge */}
                    {selectedUser?.id !== conv.other_user.id && conv.unread_count > 0 && (
                      <div className="ml-auto shrink-0 self-center bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] text-center shadow-sm">
                        {formatUnreadBadge(conv.unread_count)}
                      </div>
                    )}`
    );
});

fs.writeFileSync('src/app/dashboard/messages/MessagesClient.tsx', content, 'utf8');
console.log("Updated MessagesClient.tsx for whatsapp unread badge");
