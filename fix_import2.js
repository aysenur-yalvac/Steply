const fs = require("fs");
let content = fs.readFileSync("src/components/dashboard/DashboardSidebar.tsx", "utf8");

// Fix the malformed lucide import - find the broken pattern and fix it
content = content.replace(
  ', Trash2 } from "lucide-react";',
  ',\n  Trash2,\n} from "lucide-react";'
);

fs.writeFileSync("src/components/dashboard/DashboardSidebar.tsx", content, "utf8");
console.log("Fixed lucide import syntax");
