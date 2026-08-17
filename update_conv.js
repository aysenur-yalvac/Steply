const fs = require('fs');
let content = fs.readFileSync('src/lib/social-actions.ts', 'utf8');

// We need to add unread_count to the Conversation interface first.
// Is Conversation interface defined here?
// Let's check where it's defined.
