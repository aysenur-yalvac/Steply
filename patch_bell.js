const fs = require("fs");
let bell = fs.readFileSync("src/components/dashboard/NotificationBell.tsx", "utf8");

// Handle 'task' type icon and routing
bell = bell.replace(
  'if (n.related_id && (n.type === "message" || n.type === "project")) {',
  'if (n.related_id && (n.type === "message" || n.type === "project" || n.type === "task")) {'
);

bell = bell.replace(
  'if (type === "project") return <FolderOpen className="w-4 h-4 text-indigo-500" />;',
  'if (type === "project") return <FolderOpen className="w-4 h-4 text-indigo-500" />;\n  if (type === "task") return <CheckCheck className="w-4 h-4 text-emerald-500" />;'
);

fs.writeFileSync("src/components/dashboard/NotificationBell.tsx", bell, "utf8");
console.log("Patched NotificationBell.tsx for 'task' type");
