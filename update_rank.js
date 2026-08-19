const fs = require('fs');

let path = 'src/app/dashboard/analytics/LeaderboardClient.tsx';
let content = fs.readFileSync(path, 'utf8');

content = content.replace(
    /1: \{ bg: "bg-amber-50".*?\},/,
    '1: { bg: "bg-amber-50 dark:!bg-[#1a2234] dark:border dark:border-amber-500/40",   text: "text-amber-700 dark:!text-amber-400",   ring: "ring-amber-400",   icon: "🥇" },'
);
content = content.replace(
    /2: \{ bg: "bg-slate-100".*?\},/,
    '2: { bg: "bg-slate-100 dark:!bg-[#1a2234] dark:border dark:border-slate-400/40",  text: "text-slate-600 dark:!text-slate-300",   ring: "ring-slate-400",   icon: "🥈" },'
);
content = content.replace(
    /3: \{ bg: "bg-orange-50".*?\},/,
    '3: { bg: "bg-orange-50 dark:!bg-[#1a2234] dark:border dark:border-amber-700/40",  text: "text-orange-700 dark:!text-orange-400",  ring: "ring-orange-400",  icon: "🥉" },'
);

fs.writeFileSync(path, content, 'utf8');
console.log("Updated RANK_STYLE");
