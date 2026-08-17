const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

const lines = content.split('\n');
const typeStart = lines.findIndex(l => l.includes('export type Conversation'));
if (typeStart !== -1) {
    const typeEnd = lines.findIndex((l, i) => i > typeStart && l.trim() === '};');
    
    // Replace the block
    lines.splice(typeStart, typeEnd - typeStart + 1, 
      'export type Conversation = {',
      '  other_user: {',
      '    id: string;',
      '    full_name: string;',
      '    email: string;',
      '  };',
      '  last_message: Message;',
      '  unread_count: number;',
      '};'
    );
    
    fs.writeFileSync('src/lib/social-actions.ts', lines.join('\n'), 'utf8');
    console.log("Updated Conversation type with splice!");
} else {
    console.log("Could not find typeStart");
}
