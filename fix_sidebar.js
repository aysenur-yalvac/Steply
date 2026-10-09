const fs = require('fs');
const path = require('path');
const file = path.resolve('src/components/dashboard/DashboardSidebar.tsx');

let content = fs.readFileSync(file, 'utf8');

// Add Users icon to lucide-react import
content = content.replace(/Heart,/g, 'Heart,\n  Users,');

// Add classes to NAV_ITEMS
content = content.replace(
  /\{\s*label:\s*"Okulum",\s*href:\s*"\/dashboard\/school",\s*icon:\s*School\s*\},\r?\n/g,
  '{ label: "Okulum",      href: "/dashboard/school",     icon: School },\n  { label: "Sınıflarım",   href: "/dashboard/classes",    icon: Users },\n'
);

fs.writeFileSync(file, content, 'utf8');
console.log("Updated DashboardSidebar.tsx with Sınıflarım link.");
