const fs = require('fs');
let content = fs.readFileSync('src/app/dashboard/analytics/LeaderboardClient.tsx', 'utf8');

// Replace wrapper bg
content = content.replace(
  'className="flex flex-col min-h-full bg-[#f8fafc]"',
  'className="flex flex-col min-h-screen bg-transparent"'
);

// Replace header bg
content = content.replace(
  'className="bg-white border-b border-slate-100 px-6 lg:px-8 py-5 lg:pt-8 pb-0"',
  'className="bg-transparent border-b border-white/10 px-6 lg:px-8 py-5 lg:pt-8 pb-0"'
);

// We need to check if there are other outer wrappers
fs.writeFileSync('src/app/dashboard/analytics/LeaderboardClient.tsx', content, 'utf8');
console.log('Fixed Leaderboard bg');
