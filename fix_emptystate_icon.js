const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/messages/MessagesClient.tsx', 'utf8');

content = content.replace(
  /icon=\{<MessageSquare className="w-12 h-12 text-slate-300" \/>\}/,
  `icon={MessageSquare}`
);

fs.writeFileSync('src/app/dashboard/messages/MessagesClient.tsx', content, 'utf8');
console.log("Fixed EmptyState icon");
