const fs = require("fs");
let content = fs.readFileSync("src/components/dashboard/DashboardSidebar.tsx", "utf8");

// Trash2 was incorrectly added to the react import - remove it from there
content = content.replace(
  'import { Trash2, useState, useRef, useEffect } from "react";',
  'import { useState, useRef, useEffect } from "react";'
);

// Add Trash2 to the lucide-react import instead
content = content.replace(
  /import \{([^}]+)\} from "lucide-react";/,
  (match, icons) => {
    if (!icons.includes('Trash2')) {
      return `import {${icons}, Trash2 } from "lucide-react";`;
    }
    return match;
  }
);

fs.writeFileSync("src/components/dashboard/DashboardSidebar.tsx", content, "utf8");
console.log("Fixed Trash2 import");
