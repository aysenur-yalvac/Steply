const fs = require("fs");
let content = fs.readFileSync("src/app/dashboard/trash/page.tsx", "utf8");

// Fix the type issues by casting the state setters
content = content.replace(
  'const [deletedProjects, setDeletedProjects] = useState([]);',
  'const [deletedProjects, setDeletedProjects] = useState<any[]>([]);'
);
content = content.replace(
  'const [deletedFiles, setDeletedFiles] = useState([]);',
  'const [deletedFiles, setDeletedFiles] = useState<any[]>([]);'
);
content = content.replace(
  'const [confirmTarget, setConfirmTarget] = useState(null);',
  'const [confirmTarget, setConfirmTarget] = useState<{type: string; id: string; name: string} | null>(null);'
);

fs.writeFileSync("src/app/dashboard/trash/page.tsx", content, "utf8");
console.log("Fixed type annotations");
