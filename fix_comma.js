const fs = require("fs");
let content = fs.readFileSync("src/components/dashboard/DashboardSidebar.tsx", "utf8");

// Fix the broken import - remove the stray comma after Heart
content = content.replace(
  '  Heart,\n,\n  Trash2,\n} from "lucide-react";',
  '  Heart,\n  Trash2,\n} from "lucide-react";'
);

// Also handle CRLF version
content = content.replace(
  '  Heart,\r\n,\r\n  Trash2,\r\n} from "lucide-react";',
  '  Heart,\r\n  Trash2,\r\n} from "lucide-react";'
);

fs.writeFileSync("src/components/dashboard/DashboardSidebar.tsx", content, "utf8");
console.log("Fixed stray comma in import");
