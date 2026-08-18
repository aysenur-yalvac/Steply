const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

const regex = /const isOpen = openMenus\[label\];/;
const replacement = `const isOpen = openMenus[label];
const hasBadge = label === "Messages" && (localUnreadCount || unreadCount) > 0;
const badgeCount = label === "Messages" ? ((localUnreadCount || unreadCount) > 9 ? "9+" : (localUnreadCount || unreadCount)) : null;`;
content = content.replace(regex, replacement);

const iconRegexCollapsed = /<Icon className="w-5 h-5 shrink-0" strokeWidth=\{1\.5\} \/>\s*<\/Link>/;
const iconReplacementCollapsed = `<div className="relative">
  <Icon className="w-5 h-5 shrink-0" strokeWidth={1.5} />
  {hasBadge && (
    <span className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full px-1 shadow-sm border border-white">
      {badgeCount}
    </span>
  )}
</div>
</Link>`;
content = content.replace(iconRegexCollapsed, iconReplacementCollapsed);

const iconRegexExpanded = /<span>\{label\}<\/span>\s*<\/div>\s*<\/Link>/;
const iconReplacementExpanded = `<span>{label}</span>
</div>
{hasBadge && (
  <div className="flex items-center justify-center bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full min-w-[20px] shadow-sm">
    {badgeCount}
  </div>
)}
</Link>`;
content = content.replace(iconRegexExpanded, iconReplacementExpanded);

fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log("Updated DashboardSidebar.tsx");
