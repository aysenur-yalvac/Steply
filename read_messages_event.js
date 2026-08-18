const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/messages/MessagesClient.tsx', 'utf8');

const subset = content.split('\n').filter(line => line.includes('dispatchEvent'));
console.log(subset.join('\n'));
