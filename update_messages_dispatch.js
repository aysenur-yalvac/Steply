const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/messages/MessagesClient.tsx', 'utf8');

// Replace all old dispatch event names just in case
content = content.replace(/unread_count_updated/g, 'unread_chat_count_changed');
content = content.replace(/unread-chats-updated/g, 'unread_chat_count_changed');

// Add dispatch after markMessagesAsReadAction(selectedUser.id)
const searchStr1 = `      markMessagesAsReadAction(selectedUser.id).then((res) => {
        if (res.success) {
           router.refresh();
        }
      });`;
const replaceStr1 = `      markMessagesAsReadAction(selectedUser.id).then((res) => {
        if (res.success) {
           router.refresh();
           if (typeof window !== "undefined") {
             window.dispatchEvent(new Event("unread_chat_count_changed"));
           }
        }
      });`;
content = content.replace(searchStr1, replaceStr1);

// Add dispatch after markMessagesAsReadAction(senderId)
const searchStr2 = `              } else {
                 markMessagesAsReadAction(senderId);
              }`;
const replaceStr2 = `              } else {
                 markMessagesAsReadAction(senderId).then(() => {
                   if (typeof window !== "undefined") {
                     window.dispatchEvent(new Event("unread_chat_count_changed"));
                   }
                 });
              }`;
content = content.replace(searchStr2, replaceStr2);

fs.writeFileSync('src/app/dashboard/messages/MessagesClient.tsx', content, 'utf8');
console.log("Updated MessagesClient.tsx dispatch events");
