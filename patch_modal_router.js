const fs = require("fs");
let modal = fs.readFileSync("src/components/assignments/CreateAssignmentModal.tsx", "utf8");

modal = modal.replace(
  'import { X, Calendar, Type, AlignLeft, BookOpen } from "lucide-react";',
  'import { X, Calendar, Type, AlignLeft, BookOpen } from "lucide-react";\nimport { useRouter } from "next/navigation";'
);

modal = modal.replace(
  'const [error, setError] = useState<string | null>(null);',
  'const [error, setError] = useState<string | null>(null);\n  const router = useRouter();'
);

modal = modal.replace(
  '    if ("error" in res) {\n      setError(res.error);\n    } else {\n      onClose();\n    }',
  '    if ("error" in res) {\n      setError(res.error);\n    } else {\n      onClose();\n      router.refresh();\n    }'
);

fs.writeFileSync("src/components/assignments/CreateAssignmentModal.tsx", modal, "utf8");
console.log("Updated CreateAssignmentModal.tsx");
