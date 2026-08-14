const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// Find the start of NAV_ITEMS
const start = content.indexOf('const NAV_ITEMS = [');
// Find the end of NAV_ITEMS
const end = content.indexOf('];', start) + 2;

const newNavItems = `const NAV_ITEMS = [
  { label: "My Projects", href: "/dashboard",            icon: LayoutDashboard },
  { label: "Analytics",   href: "/dashboard/analytics",  icon: BarChart2 },
  { label: "Watchlist",   href: "#watchlist",            icon: Bookmark,  isWatchlist: true },
  { label: "Calendar",    href: "/dashboard/agenda",     icon: Calendar },
  { label: "Okulum",      href: "/dashboard/school",     icon: School },
  { label: "Messages",    href: "/dashboard/messages",   icon: MessageSquare },
  { label: "Settings",    href: "/dashboard/settings",   icon: Settings },
  { 
    label: "Çöp Kutusu", 
    href: "/dashboard/trash",
    icon: Trash2,
    subItems: [
      { label: "Silinen Projeler", href: "/dashboard/trash/projects" },
      { label: "Silinen Dosyalar", href: "/dashboard/trash/files" }
    ]
  },
];`;

content = content.substring(0, start) + newNavItems + content.substring(end);
fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Fixed NAV_ITEMS');
