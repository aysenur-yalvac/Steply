const fs = require('fs');

let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

const regex = /export type Conversation = \{[\s\S]*?last_message: Message;\n\};/;
const replacement = `export type Conversation = {
  other_user: {
    id: string;
    full_name: string;
    email: string;
  };
  last_message: Message;
  unread_count: number;
};`;

content = content.replace(regex, replacement);

fs.writeFileSync('src/lib/social-actions.ts', content, 'utf8');
console.log("Updated Conversation type");
