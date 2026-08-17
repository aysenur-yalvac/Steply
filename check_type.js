const fs = require('fs');
let content = fs.readFileSync('src/components/projects/ProjectEditableContent.tsx', 'utf8');

// I replaced oldMemberRow with newMemberRow. Let me check if newMemberRow is in the file.
console.log(content.includes('onLeave?: () => void;'));
