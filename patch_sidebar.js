const fs = require("fs");
let sidebar = fs.readFileSync("src/components/dashboard/DashboardSidebar.tsx", "utf8");

if (!sidebar.includes("FileText")) {
  sidebar = sidebar.replace("LayoutDashboard,", "LayoutDashboard, FileText,");
}

sidebar = sidebar.replace(
  '{ label: "Calendar",    href: "/dashboard/agenda",     icon: Calendar },',
  '{ label: "Calendar",    href: "/dashboard/agenda",     icon: Calendar },\n  { label: "Odevler",     href: "/dashboard/assignments",icon: FileText },'
);

fs.writeFileSync("src/components/dashboard/DashboardSidebar.tsx", sidebar, "utf8");
console.log("Patched DashboardSidebar.tsx");
