const fs = require('fs');

let path = 'src/app/dashboard/analytics/LeaderboardClient.tsx';
if (fs.existsSync(path)) {
    let content = fs.readFileSync(path, 'utf8');

    // 1. Update RANK_STYLE
    content = content.replace(
        /const RANK_STYLE.*?};\n/s,
        `const RANK_STYLE: Record<number, { bg: string; text: string; ring: string; icon: string }> = {
  1: { bg: "bg-amber-50 dark:!bg-[#1a2234] dark:border dark:border-amber-500/40",   text: "text-amber-700 dark:!text-amber-400",   ring: "ring-amber-400",   icon: "🥇" },
  2: { bg: "bg-slate-100 dark:!bg-[#1a2234] dark:border dark:border-slate-400/40",  text: "text-slate-600 dark:!text-slate-300",   ring: "ring-slate-400",   icon: "🥈" },
  3: { bg: "bg-orange-50 dark:!bg-[#1a2234] dark:border dark:border-amber-700/40",  text: "text-orange-700 dark:!text-orange-400",  ring: "ring-orange-400",  icon: "🥉" },
};
`
    );

    // 2. Update LeaderboardTable row className
    content = content.replace(
        /className=\{`flex items-center gap-4 px-5 py-3\.5 transition-colors \$\{\s*isMe\s*\?\s*"bg-violet-50 border-l-2 border-violet-500"\s*:\s*rowStyle\s*\?\s*`\$\{rowStyle\.bg\} hover:opacity-90`\s*:\s*"hover:bg-slate-50\/70"\s*\}`\}/,
        'className={`flex items-center gap-4 px-5 py-3.5 transition-colors ${isMe ? "bg-violet-50 border-l-2 border-violet-500 dark:!bg-[#1a2234] dark:border-l-2 dark:border-violet-500" : rowStyle ? `${rowStyle.bg} hover:opacity-90` : "hover:bg-slate-50/70 dark:!bg-[#1a2234] dark:border dark:border-slate-800"}`}'
    );

    // 3. Update name text
    content = content.replace(
        /<p className=\{`text-sm font-bold truncate \$\{\s*isMe \? "text-violet-700" : "text-slate-800 dark:text-slate-200"\s*\}`\}>/g,
        '<p className={`text-sm truncate ${isMe ? "font-bold text-violet-700 dark:text-violet-400" : "text-slate-800 dark:!text-slate-100 font-semibold"}`}>'
    );
    
    // 4. Update university text
    content = content.replace(
        /<p className="text-\[11px\] text-slate-400 truncate">\{entry\.university\}<\/p>/g,
        '<p className="text-[11px] text-slate-400 dark:text-slate-400 truncate">{entry.university}</p>'
    );

    // 5. Update score text
    content = content.replace(
        /<p className=\{`text-sm font-extrabold tabular-nums \$\{\s*isMe\s*\?\s*"text-violet-600"\s*:\s*entry\.rank <= 3\s*\?\s*"text-amber-600"\s*:\s*"text-slate-700"\s*\}`\}>/g,
        '<p className={`text-sm tabular-nums ${isMe ? "font-extrabold text-violet-600 dark:text-violet-400" : entry.rank <= 3 ? "font-extrabold text-amber-600 dark:text-amber-500" : "text-slate-700 dark:!text-slate-100 font-semibold"}`}>'
    );

    fs.writeFileSync(path, content, 'utf8');
}

console.log("Updated LeaderboardClient");
