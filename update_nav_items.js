const fs = require('fs');
let content = fs.readFileSync('src/components/dashboard/DashboardSidebar.tsx', 'utf8');

// We will add subItems support to the loop.
// Instead of rewriting the whole loop blindly, let's just insert a special case for Trash if it's easier, or modify NAV_ITEMS.
// Let's add subItems to NAV_ITEMS:
const newNavItems = `
  { label: "Settings",    href: "/dashboard/settings",    icon: Settings },
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
content = content.replace(/\{\s*label:\s*"Cop Kutusu"[^\}]+\},?\s*\];/, newNavItems.trim());
fs.writeFileSync('src/components/dashboard/DashboardSidebar.tsx', content, 'utf8');
console.log('Updated NAV_ITEMS');
