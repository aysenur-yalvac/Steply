const fs = require("fs");
let sidebar = fs.readFileSync("src/components/dashboard/DashboardSidebar.tsx", "utf8");

sidebar = sidebar.replace(
  '{ label: "Silinen Dosyalar", href: "/dashboard/trash/files" }',
  '{ label: "Silinen Dosyalar", href: "/dashboard/trash/files" },\n      { label: "Silinen Odevler", href: "/dashboard/trash/assignments" }'
);

fs.writeFileSync("src/components/dashboard/DashboardSidebar.tsx", sidebar, "utf8");
console.log("Updated DashboardSidebar.tsx");
